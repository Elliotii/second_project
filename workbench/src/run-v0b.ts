import { randomUUID } from "node:crypto";
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import {
	type ArtifactRefV0B,
	type AttemptRecordV0B,
	type BudgetSnapshotV0B,
	type EvidenceIndexItemV0B,
	type EvidenceIndexV0B,
	type OutcomeV0B,
	type RunRecordV0B,
	type SecretScanResultV0B,
	type SessionRefV0B,
	type TerminalRecordV0B,
	type WorkspaceRefV0B,
} from "./contracts/v0b-types.ts";
import { preflightV0B, type V0BPreflightPlan } from "./contracts/preflight-v0b.ts";
import { artifactRef, writeOnceBytes, writeOnceJson } from "./evidence/artifacts.ts";
import { JournalWriterV0B, readJournal, validateJournal } from "./evidence/journal.ts";
import { scanPreterminalEvidenceV0B } from "./evidence/secret-scan.ts";
import { validatePreterminalEvidenceV0B } from "./evidence/validator.ts";
import { digestObject, stableJson, treeDigest, treeInventory } from "./hash.ts";
import { buildOutcomeV0B } from "./outcome/builder.ts";
import {
	fauxSequenceHardBoundV0B,
	PiEvidenceCycleErrorV0B,
	runPiEvidenceCycleV0B,
} from "./pi/pi-adapter-v0b.ts";
import { EvidenceMirrorSessionStorageV0B } from "./session/evidence-session.ts";
import { runExternalVerifierV0B } from "./verifier/runner.ts";
import { createTemporaryWorkspace } from "./workspace/temp-copy.ts";

const CONTROL_BASELINE = "32dc7b136053e2fdc17f294322a3cf7fef79e737";
const V0A_IMPLEMENTATION_BASELINE = "1a1565fa7e6d1440c8f99e2c7e587201a14111c1";
const PI_COMMIT = "027a5847901b5dde30270abaa1041046cd2b4b55";
const WORKSPACE_DIGEST_EXCLUSIONS = new Set(["task.json"]);
const WORKBENCH_DIGEST_EXCLUSIONS = new Set(["node_modules"]);
const PROVIDER_REQUEST_LIMIT = 12;
const TOOL_CALL_LIMIT = 12;
const WALL_TIME_LIMIT_MS = 120_000;

export type V0BRunScenario =
	| "pass"
	| "agent_failure"
	| "verifier_invalid"
	| "verifier_spawn_invalid"
	| "verifier_parse_invalid"
	| "verifier_timeout_invalid"
	| "verifier_output_cap_invalid"
	| "evidence_invalid"
	| "persistence_failure"
	| "secret_scan_rejection"
	| "scan_failure";

export interface V0BRunResult {
	run_id: string;
	run_root: string;
	outcome: OutcomeV0B | null;
	external_provider_calls: 0;
	faux_provider_calls: number;
	recovery_attempts: 0;
	child_attempts: 0;
	terminal_record: TerminalRecordV0B | null;
	incomplete_reason: string | null;
}

function portable(value: string): string {
	return value.split(sep).join("/");
}

function budget(task: { verifier_command: { timeout_ms: number; output_limit_bytes: number } }): BudgetSnapshotV0B {
	return {
		provider_request_limit: PROVIDER_REQUEST_LIMIT,
		provider_request_usage: 0,
		tool_call_limit: TOOL_CALL_LIMIT,
		tool_call_usage: 0,
		wall_time_limit_ms: WALL_TIME_LIMIT_MS,
		wall_time_usage_ms: 0,
		token_limit: "not_applicable",
		token_usage: "unknown",
		cost_limit_usd: 0,
		cost_usage_usd: 0,
		verifier_timeout_ms: task.verifier_command.timeout_ms,
		verifier_output_limit_bytes: task.verifier_command.output_limit_bytes,
		external_provider_calls: 0,
	};
}

function responsibility(ref: ArtifactRefV0B, label: string): EvidenceIndexItemV0B {
	return { ...ref, responsibility: label };
}

function verifierFaultForScenario(
	scenario: V0BRunScenario,
): "missing" | "spawn" | "parse" | "timeout" | "output_cap" | undefined {
	if (scenario === "verifier_invalid") return "missing";
	if (scenario === "verifier_spawn_invalid") return "spawn";
	if (scenario === "verifier_parse_invalid") return "parse";
	if (scenario === "verifier_timeout_invalid") return "timeout";
	if (scenario === "verifier_output_cap_invalid") return "output_cap";
	return undefined;
}

function sessionRefFor(
	sessionId: string,
	sessionArtifact: ArtifactRefV0B,
	sessionMetadata: unknown,
	sessionStorage: EvidenceMirrorSessionStorageV0B,
	toolProfileId: string,
): SessionRefV0B {
	return {
		schema_version: 1,
		session_id: sessionId,
		runtime: "pi_agent_core",
		pi_commit: PI_COMMIT,
		storage_ref: sessionArtifact,
		metadata_digest: digestObject(sessionMetadata),
		model_profile_id: "public_emitted_faux",
		tool_profile_id: toolProfileId,
		reasoning_persistence: "metadata_only",
		resume_capability: "not_claimed",
		redaction: {
			reasoning_blocks: sessionStorage.redaction.reasoning_blocks,
			reasoning_characters: sessionStorage.redaction.reasoning_characters,
			reasoning_utf8_bytes: sessionStorage.redaction.reasoning_utf8_bytes,
			removed_signatures: sessionStorage.redaction.removed_signatures,
			content_types: Object.entries(sessionStorage.redaction.reasoning_content_types)
				.sort(([left], [right]) => left.localeCompare(right))
				.map(([content_type, value]) => ({ content_type, ...value })),
		},
		truncation: {
			entries: sessionStorage.redaction.truncated_entries,
		},
	};
}

function workspaceRefFor(options: {
	projectRoot: string;
	workspaceRoot: string;
	workspaceId: string;
	sourceDigest: string;
	initialDigest: string;
	finalDigest: string | null;
	writablePaths: string[];
	protectedPaths: string[];
}): WorkspaceRefV0B {
	return {
		schema_version: 1,
		workspace_id: options.workspaceId,
		provider: "temporary_copy",
		root: portable(relative(options.projectRoot, options.workspaceRoot)),
		parent_workspace_id: null,
		source_digest: options.sourceDigest,
		initial_tree_digest: options.initialDigest,
		final_tree_digest: options.finalDigest,
		writable_paths: [...options.writablePaths],
		protected_paths: [...options.protectedPaths],
		file_count: treeInventory(options.workspaceRoot).length,
		hardlink_pairs: 0,
	};
}

function writeSafeIncompleteResult(options: {
	runRoot: string;
	run: RunRecordV0B;
	attempt: AttemptRecordV0B;
	abort: Record<string, unknown>;
	reason: string;
}): void {
	writeOnceJson(options.runRoot, "run.json", { ...options.run, status: "running" });
	writeOnceJson(options.runRoot, "attempt.json", {
		...options.attempt,
		terminal_reason: options.reason,
	});
	writeOnceJson(options.runRoot, "evidence/abort.json", options.abort);
}

export function dryRunV0B(options: {
	projectRoot: string;
	taskPath?: string;
	strategyPath?: string;
}): string {
	const { plan } = preflightV0B({ ...options, dryRun: true });
	return stableJson(plan);
}

export async function executeV0BRun(options: {
	projectRoot: string;
	taskPath?: string;
	strategyPath?: string;
	scenario: V0BRunScenario;
}): Promise<V0BRunResult> {
	const started = Date.now();
	const preflight = preflightV0B({
		projectRoot: options.projectRoot,
		taskPath: options.taskPath,
		strategyPath: options.strategyPath,
		dryRun: false,
	});
	const mode = options.scenario === "agent_failure" ? "no_repair" : "repair";
	const hardBound = fauxSequenceHardBoundV0B(mode);
	if (hardBound.provider_requests > PROVIDER_REQUEST_LIMIT || hardBound.tool_calls > TOOL_CALL_LIMIT) {
		throw new Error("fixed Faux sequence exceeds the preflight budget");
	}

	const runId = `run-${randomUUID()}`;
	const attemptId = `attempt-${randomUUID()}`;
	const sessionId = `session-${randomUUID()}`;
	const workspaceId = `workspace-${randomUUID()}`;
	const runsRoot = resolve(options.projectRoot, ".runs/v0-b/runs");
	mkdirSync(runsRoot, { recursive: true });
	const runRoot = resolve(runsRoot, runId);
	mkdirSync(runRoot, { recursive: false });
	const workspaceRoot = resolve(runRoot, "workspace");
	const identity = {
		run_id: runId,
		attempt_id: attemptId,
		session_id: sessionId,
		workspace_id: workspaceId,
	};
	const journalPath = resolve(runRoot, "journal/events.jsonl");
	const journal = new JournalWriterV0B(journalPath, identity);
	const createdAt = new Date().toISOString();
	journal.append("run_started", { scenario: options.scenario });
	journal.append("attempt_started", { ordinal: 1, parent_attempt_id: null, trigger: "initial" });

	const taskSnapshotRef = writeOnceJson(runRoot, "config/task.json", preflight.task);
	const strategySnapshotRef = writeOnceJson(runRoot, "config/strategy.json", preflight.strategy);
	const verifierSnapshotPath = writeOnceBytes(runRoot, "config/verifier.mjs", readFileSync(preflight.verifierPath));
	const verifierSnapshotRef = artifactRef(runRoot, verifierSnapshotPath, "text/javascript; charset=utf-8", false);
	const instructionSnapshotPath = writeOnceBytes(
		runRoot,
		"config/instruction.md",
		readFileSync(resolve(options.projectRoot, preflight.task.instruction_ref)),
	);
	const instructionSnapshotRef = artifactRef(runRoot, instructionSnapshotPath, "text/markdown; charset=utf-8", false);

	const copied = createTemporaryWorkspace({
		projectRoot: options.projectRoot,
		sourceRoot: preflight.workspaceSourceRoot,
		targetRoot: workspaceRoot,
		workspaceId,
		task: preflight.task,
	});
	const protectedBefore = Object.fromEntries(
		preflight.task.protected_paths.map((path) => [path, readFileSync(resolve(workspaceRoot, path))]),
	);
	journal.append("workspace_materialized", {
		provider: "temporary_copy",
		initial_tree_digest: copied.ref.initial_tree_digest,
	});

	const sessionPath = resolve(runRoot, "session/evidence.jsonl");
	mkdirSync(resolve(runRoot, "session"), { recursive: true });
	const sessionStorage = await EvidenceMirrorSessionStorageV0B.create({
		evidencePath: sessionPath,
		workspaceRoot,
		metadata: {
			id: sessionId,
			createdAt,
			attempt_id: attemptId,
			workspace_id: workspaceId,
			strategy_id: preflight.strategy.strategy_id,
		},
		onPersist: (projection) => {
			journal.append("session_entry_persisted", {
				entry_id: projection.entry_id,
				parent_id: projection.parent_id,
				entry_type: projection.entry_type,
				tool_call_ids: projection.tool_call_ids,
				tool_result_ids: projection.tool_result_ids,
				truncated: projection.truncated,
			});
		},
		testFaultInjection:
			options.scenario === "persistence_failure"
				? {
						failEvidenceAppendAt: 1,
					}
				: undefined,
	});
	journal.append("session_linked", {
		runtime: "pi_agent_core",
		storage_path: portable(relative(runRoot, sessionPath)),
		resume_capability: "not_claimed",
	});

	let piResult;
	try {
		piResult = await runPiEvidenceCycleV0B({
			projectRoot: options.projectRoot,
			workspaceRoot,
			task: preflight.task,
			runRoot,
			sessionStorage,
			journal,
			sessionId,
			mode,
			budgetLimits: {
				provider_request_limit: PROVIDER_REQUEST_LIMIT,
				tool_call_limit: TOOL_CALL_LIMIT,
			},
		});
	} catch (error) {
		if (!(error instanceof PiEvidenceCycleErrorV0B)) throw error;
		const finalDigest = treeDigest(workspaceRoot, WORKSPACE_DIGEST_EXCLUSIONS);
		for (const [path, before] of Object.entries(protectedBefore)) {
			const after = readFileSync(resolve(workspaceRoot, path));
			if (!after.equals(before)) throw new Error(`protected Workspace file changed: ${path}`);
		}
		const workspaceRef = workspaceRefFor({
			projectRoot: options.projectRoot,
			workspaceRoot,
			workspaceId,
			sourceDigest: copied.ref.source_digest,
			initialDigest: copied.ref.initial_tree_digest,
			finalDigest,
			writablePaths: preflight.task.writable_paths,
			protectedPaths: preflight.task.protected_paths,
		});
		const workspaceRefArtifact = writeOnceJson(runRoot, "evidence/workspace.json", workspaceRef);
		const sessionArtifact = artifactRef(runRoot, sessionPath, "application/x-ndjson", false);
		const sessionRef = sessionRefFor(
			sessionId,
			sessionArtifact,
			await sessionStorage.getMetadata(),
			sessionStorage,
			preflight.task.tool_profile_id,
		);
		const sessionRefArtifact = writeOnceJson(runRoot, "evidence/session-ref.json", sessionRef);
		const finalBudget = budget(preflight.task);
		finalBudget.provider_request_usage = error.progress.provider_request_events;
		finalBudget.tool_call_usage = error.progress.tool_call_events;
		finalBudget.wall_time_usage_ms = Date.now() - started;
		const run: RunRecordV0B = {
			schema_version: 1,
			run_id: runId,
			task_id: preflight.task.task_id,
			strategy_id: preflight.strategy.strategy_id,
			comparison_group_id: null,
			created_at: createdAt,
			status: "running",
			config_digest: preflight.plan.config_digest,
			source_identity: {
				root_baseline_commit: CONTROL_BASELINE,
				v0a_implementation_baseline: V0A_IMPLEMENTATION_BASELINE,
				pi_commit: PI_COMMIT,
				workbench_tree_digest: treeDigest(resolve(options.projectRoot, "workbench"), WORKBENCH_DIGEST_EXCLUSIONS),
				task_sha256: preflight.plan.task_sha256,
				strategy_sha256: preflight.plan.strategy_sha256,
				verifier_sha256: preflight.plan.verifier_sha256,
			},
			provider_identity: { kind: "public_emitted_faux", external: false, credentials_used: false },
			budget: finalBudget,
			attempt_ids: [attemptId],
		};
		const attempt: AttemptRecordV0B = {
			schema_version: 1,
			attempt_id: attemptId,
			run_id: runId,
			ordinal: 1,
			strategy_id: preflight.strategy.strategy_id,
			parent_attempt_id: null,
			trigger: "initial",
			session_id: sessionId,
			workspace_id: workspaceId,
			started_at: createdAt,
			settled_at: null,
			terminal_reason: "evidence_persistence_operation_failed",
			budget_allocation: budget(preflight.task),
			budget_usage: finalBudget,
		};
		const abortEvidence = {
			schema_version: 1,
			run_id: runId,
			abort_requested: error.progress.abort_requested,
			abort_completed: error.progress.abort_completed,
			idle_completion_observed: error.progress.settled_observed,
			last_complete_seq: journal.lastSeq(),
			outstanding_tool_call_ids: [],
			final_workspace_digest: finalDigest,
			terminal_reason: "evidence_persistence_operation_failed",
			process_tree_termination_claimed: false,
		};
		writeSafeIncompleteResult({
			runRoot,
			run,
			attempt,
			abort: abortEvidence,
			reason: "evidence_persistence_operation_failed",
		});
		const failureArtifact = writeOnceJson(runRoot, "evidence/persistence-operation-failure.json", {
			schema_version: 1,
			run_id: runId,
			failure_class: "evidence",
			operation: "reasoning_safe_session_append",
			append_ordinal: 1,
			verifier_started: false,
			settled_observed: error.progress.settled_observed,
			agent_failure_attributed: false,
		});
		const journalErrors = validateJournal(readJournal(journalPath), identity, { route: "error" });
		writeOnceJson(runRoot, "evidence/incomplete-validation.json", {
			schema_version: 1,
			run_id: runId,
			route: "error",
			valid_for_terminal_task_outcome: false,
			journal_errors: journalErrors,
		});
		const scanResult = scanPreterminalEvidenceV0B({
			files: [
				{ scope_label: "session_evidence", path: sessionPath },
				{ scope_label: "journal_error_route", path: journalPath },
				{ scope_label: "persistence_failure_record", path: resolve(runRoot, failureArtifact.path) },
			],
			objects: [
				{ scope_label: "incomplete_run_object", value: run },
				{ scope_label: "incomplete_attempt_object", value: attempt },
				{ scope_label: "workspace_object", value: workspaceRef },
				{ scope_label: "session_ref_object", value: sessionRef },
				{ scope_label: "abort_object", value: abortEvidence },
			],
		});
		writeOnceJson(runRoot, "evidence/secret-scan.json", scanResult);
		return {
			run_id: runId,
			run_root: portable(relative(options.projectRoot, runRoot)),
			outcome: null,
			external_provider_calls: 0,
			faux_provider_calls: error.progress.provider_request_events,
			recovery_attempts: 0,
			child_attempts: 0,
			terminal_record: null,
			incomplete_reason: "evidence_persistence_operation_failed",
		};
	}

	const settledAt = new Date().toISOString();
	const finalDigest = treeDigest(workspaceRoot, WORKSPACE_DIGEST_EXCLUSIONS);
	for (const [path, before] of Object.entries(protectedBefore)) {
		const after = readFileSync(resolve(workspaceRoot, path));
		if (!after.equals(before)) throw new Error(`protected Workspace file changed: ${path}`);
	}
	journal.append("workspace_finalized", {
		final_tree_digest: finalDigest,
		protected_files_unchanged: true,
	});
	const workspaceRef = workspaceRefFor({
		projectRoot: options.projectRoot,
		workspaceRoot,
		workspaceId,
		sourceDigest: copied.ref.source_digest,
		initialDigest: copied.ref.initial_tree_digest,
		finalDigest,
		writablePaths: preflight.task.writable_paths,
		protectedPaths: preflight.task.protected_paths,
	});
	const workspaceRefArtifact = writeOnceJson(runRoot, "evidence/workspace.json", workspaceRef);
	const sessionArtifact = artifactRef(runRoot, sessionPath, "application/x-ndjson", false);
	const sessionRef = sessionRefFor(
		sessionId,
		sessionArtifact,
		await sessionStorage.getMetadata(),
		sessionStorage,
		preflight.task.tool_profile_id,
	);
	const sessionRefArtifact = writeOnceJson(runRoot, "evidence/session-ref.json", sessionRef);

	const verifierStartEvidence = {
		verifier_id: preflight.task.verifier_id,
		verifier_sha256: preflight.task.verifier_sha256,
		settled_observed: true,
		executable: process.execPath,
		argv: [verifierSnapshotPath],
		cwd: options.projectRoot,
		cwd_identity: "project_root",
		shell: false,
		environment_allowlist_keys: ["NO_COLOR", "V0B_WORKSPACE"],
		timeout_ms: preflight.task.verifier_command.timeout_ms,
		output_limit_bytes: preflight.task.verifier_command.output_limit_bytes,
		source_snapshot_ref: {
			path: verifierSnapshotRef.path,
			sha256: verifierSnapshotRef.sha256,
			size_bytes: verifierSnapshotRef.size_bytes,
			media_type: verifierSnapshotRef.media_type,
			truncated: verifierSnapshotRef.truncated,
		},
	};
	journal.append("verifier_started", verifierStartEvidence);
	const verifierResult = await runExternalVerifierV0B({
		projectRoot: options.projectRoot,
		runRoot,
		workspaceRoot,
		attemptId,
		task: preflight.task,
		verifierSnapshotPath,
		verifierSnapshotRef,
		faultInjection: verifierFaultForScenario(options.scenario),
	});
	journal.append("verifier_completed", {
		verifier_id: verifierResult.verifier_id,
		status: verifierResult.status,
		exit_code: verifierResult.exit_code,
		timed_out: verifierResult.timed_out,
		duration_ms: verifierResult.duration_ms,
		full_output_ref: {
			path: verifierResult.full_output_ref.path,
			sha256: verifierResult.full_output_ref.sha256,
			size_bytes: verifierResult.full_output_ref.size_bytes,
			media_type: verifierResult.full_output_ref.media_type,
			truncated: verifierResult.full_output_ref.truncated,
		},
	});
	const verifierResultArtifact = writeOnceJson(runRoot, "evidence/verifier-result.json", verifierResult);

	if (options.scenario === "evidence_invalid") {
		appendFileSync(sessionPath, `${stableJson({ type: "v0b_test_post_persistence_corruption" })}\n`, "utf8");
	}
	const preterminalRefs = [
		taskSnapshotRef,
		strategySnapshotRef,
		verifierSnapshotRef,
		instructionSnapshotRef,
		workspaceRefArtifact,
		sessionRefArtifact,
		verifierResultArtifact,
		...piResult.tool_result_artifacts,
	];
	const validation = await validatePreterminalEvidenceV0B({
		runRoot,
		workspaceRoot,
		identity,
		journalPath,
		sessionRef,
		verifierResult,
		requiredRefs: preterminalRefs,
	});
	const validationArtifact = writeOnceJson(runRoot, "evidence/validation.json", validation);
	journal.append("evidence_validation_completed", {
		valid: validation.valid,
		error_count: validation.errors.length,
		checked_artifact_count: validation.checked_artifact_count,
	});

	const finalBudget = budget(preflight.task);
	finalBudget.provider_request_usage = piResult.provider_request_events;
	finalBudget.tool_call_usage = piResult.tool_call_events;
	finalBudget.wall_time_usage_ms = Date.now() - started;
	const budgetExhausted =
		finalBudget.provider_request_usage > finalBudget.provider_request_limit ||
		finalBudget.tool_call_usage > finalBudget.tool_call_limit ||
		finalBudget.wall_time_usage_ms > finalBudget.wall_time_limit_ms;
	const outcome = buildOutcomeV0B({
		runId,
		attemptId,
		evidenceValid: validation.valid,
		verifierStatus: verifierResult.status,
		agentTerminalReason: piResult.terminal_reason,
		evidenceIndexRef: "evidence-index.json",
		budgetExhausted,
	});
	const attempt: AttemptRecordV0B = {
		schema_version: 1,
		attempt_id: attemptId,
		run_id: runId,
		ordinal: 1,
		strategy_id: preflight.strategy.strategy_id,
		parent_attempt_id: null,
		trigger: "initial",
		session_id: sessionId,
		workspace_id: workspaceId,
		started_at: createdAt,
		settled_at: settledAt,
		terminal_reason: outcome.terminal_reason,
		budget_allocation: budget(preflight.task),
		budget_usage: finalBudget,
	};
	const run: RunRecordV0B = {
		schema_version: 1,
		run_id: runId,
		task_id: preflight.task.task_id,
		strategy_id: preflight.strategy.strategy_id,
		comparison_group_id: null,
		created_at: createdAt,
		status: "terminal",
		config_digest: preflight.plan.config_digest,
		source_identity: {
			root_baseline_commit: CONTROL_BASELINE,
			v0a_implementation_baseline: V0A_IMPLEMENTATION_BASELINE,
			pi_commit: PI_COMMIT,
			workbench_tree_digest: treeDigest(resolve(options.projectRoot, "workbench"), WORKBENCH_DIGEST_EXCLUSIONS),
			task_sha256: preflight.plan.task_sha256,
			strategy_sha256: preflight.plan.strategy_sha256,
			verifier_sha256: preflight.plan.verifier_sha256,
		},
		provider_identity: {
			kind: "public_emitted_faux",
			external: false,
			credentials_used: false,
		},
		budget: finalBudget,
		attempt_ids: [attemptId],
	};
	const abortEvidence = {
		schema_version: 1,
		run_id: runId,
		abort_requested: false,
		abort_completed: false,
		idle_completion_observed: true,
		last_complete_seq: journal.lastSeq(),
		outstanding_tool_call_ids: [],
		final_workspace_digest: finalDigest,
		terminal_reason: outcome.terminal_reason,
		process_tree_termination_claimed: false,
	};

	let scanResult: SecretScanResultV0B;
	try {
		scanResult = scanPreterminalEvidenceV0B({
			files: [
				{ scope_label: "task_snapshot", path: resolve(runRoot, taskSnapshotRef.path) },
				{ scope_label: "strategy_snapshot", path: resolve(runRoot, strategySnapshotRef.path) },
				{ scope_label: "instruction_snapshot", path: resolve(runRoot, instructionSnapshotRef.path) },
				{ scope_label: "verifier_snapshot", path: resolve(runRoot, verifierSnapshotRef.path) },
				{ scope_label: "session_evidence", path: sessionPath },
				{ scope_label: "journal_preterminal", path: journalPath },
				{ scope_label: "verifier_output", path: resolve(runRoot, verifierResult.full_output_ref.path) },
				{ scope_label: "validation_artifact", path: resolve(runRoot, validationArtifact.path) },
				...piResult.tool_result_artifacts.map((ref, index) => ({
					scope_label: `tool_result_artifact_${index + 1}`,
					path: resolve(runRoot, ref.path),
				})),
			],
			objects: [
				{ scope_label: "pending_run_object", value: run },
				{ scope_label: "pending_attempt_object", value: attempt },
				{ scope_label: "workspace_object", value: workspaceRef },
				{ scope_label: "session_ref_object", value: sessionRef },
				{ scope_label: "verifier_result_object", value: verifierResult },
				{ scope_label: "abort_object", value: abortEvidence },
				{ scope_label: "pending_outcome_serialization", value: outcome },
				{
					scope_label: "pending_terminal_journal_events",
					value: [
						{
							type: "outcome_created",
							data: {
								status: outcome.status,
								failure_class: outcome.failure_class,
								terminal_reason: outcome.terminal_reason,
							},
						},
						{
							type: "run_terminal",
							data: {
								status: outcome.status,
								failure_class: outcome.failure_class,
								terminal_reason: outcome.terminal_reason,
							},
						},
					],
				},
				...(options.scenario === "secret_scan_rejection"
					? [
							{
								scope_label: "test_only_secret_rejection_probe",
								value: { authorization: "Bearer V0B_SYNTHETIC_SECRET_VALUE" },
							},
						]
					: []),
			],
			faultInjection: options.scenario === "scan_failure" ? "scanner_error" : undefined,
		});
	} catch {
		writeOnceJson(runRoot, "evidence/secret-scan-failure.json", {
			schema_version: 1,
			run_id: runId,
			scan_completed: false,
			terminal_written: false,
			safe_error: "preterminal scanner failed",
		});
		writeSafeIncompleteResult({
			runRoot,
			run,
			attempt,
			abort: abortEvidence,
			reason: "preterminal_scan_failed",
		});
		return {
			run_id: runId,
			run_root: portable(relative(options.projectRoot, runRoot)),
			outcome: null,
			external_provider_calls: 0,
			faux_provider_calls: piResult.faux_provider_calls,
			recovery_attempts: 0,
			child_attempts: 0,
			terminal_record: null,
			incomplete_reason: "preterminal_scan_failed",
		};
	}
	const scanArtifact = writeOnceJson(runRoot, "evidence/secret-scan.json", scanResult);
	if (scanResult.status !== "passed" || scanResult.match_count !== 0) {
		writeSafeIncompleteResult({
			runRoot,
			run,
			attempt,
			abort: abortEvidence,
			reason: "preterminal_scan_rejected",
		});
		return {
			run_id: runId,
			run_root: portable(relative(options.projectRoot, runRoot)),
			outcome: null,
			external_provider_calls: 0,
			faux_provider_calls: piResult.faux_provider_calls,
			recovery_attempts: 0,
			child_attempts: 0,
			terminal_record: null,
			incomplete_reason: "preterminal_scan_rejected",
		};
	}

	journal.append("outcome_created", {
		status: outcome.status,
		failure_class: outcome.failure_class,
		terminal_reason: outcome.terminal_reason,
	});
	journal.append("run_terminal", {
		status: outcome.status,
		failure_class: outcome.failure_class,
		terminal_reason: outcome.terminal_reason,
	});
	const abortArtifact = writeOnceJson(runRoot, "evidence/abort.json", abortEvidence);
	const runArtifact = writeOnceJson(runRoot, "run.json", run);
	const attemptArtifact = writeOnceJson(runRoot, "attempt.json", attempt);
	const outcomeArtifact = writeOnceJson(runRoot, "outcome.json", outcome);
	const journalArtifact = artifactRef(runRoot, journalPath, "application/x-ndjson", false);

	const index: EvidenceIndexV0B = {
		schema_version: 1,
		run_id: runId,
		items: [
			responsibility(taskSnapshotRef, "task contract snapshot"),
			responsibility(strategySnapshotRef, "strategy contract snapshot"),
			responsibility(verifierSnapshotRef, "write-once executed external verifier source"),
			responsibility(instructionSnapshotRef, "task instruction snapshot"),
			responsibility(runArtifact, "terminal Run record"),
			responsibility(attemptArtifact, "single Attempt record"),
			responsibility(workspaceRefArtifact, "Workspace identity and final digest"),
			responsibility(sessionRefArtifact, "reasoning-safe Session reference"),
			responsibility(sessionArtifact, "public-openable reasoning-safe Session JSONL"),
			responsibility(journalArtifact, "append-only lifecycle Journal"),
			responsibility(verifierResultArtifact, "external Verifier result and execution identity"),
			responsibility(verifierResult.full_output_ref, "external Verifier full output"),
			...piResult.tool_result_artifacts.map((ref) =>
				responsibility(ref, "externalized safe Tool Result projection"),
			),
			responsibility(validationArtifact, "preterminal evidence validation"),
			responsibility(abortArtifact, "bounded abort and terminal snapshot"),
			responsibility(scanArtifact, "integrated preterminal secret and reasoning scan"),
			responsibility(outcomeArtifact, "accepted-precedence terminal Outcome"),
		],
	};
	const indexArtifact = writeOnceJson(runRoot, "evidence-index.json", index);
	const terminalRecord: TerminalRecordV0B = {
		schema_version: 1,
		run_id: runId,
		outcome_sha256: outcomeArtifact.sha256,
		evidence_index_sha256: indexArtifact.sha256,
		preterminal_scan: {
			completed: true,
			scope_labels: scanResult.scope_labels,
			match_count: 0,
			result_ref: scanArtifact,
		},
		committed_at: new Date().toISOString(),
	};
	writeOnceJson(runRoot, "terminal.json", terminalRecord);
	return {
		run_id: runId,
		run_root: portable(relative(options.projectRoot, runRoot)),
		outcome,
		external_provider_calls: 0,
		faux_provider_calls: piResult.faux_provider_calls,
		recovery_attempts: 0,
		child_attempts: 0,
		terminal_record: terminalRecord,
		incomplete_reason: null,
	};
}

export function preflightPlanV0B(options: {
	projectRoot: string;
	taskPath?: string;
	strategyPath?: string;
}): V0BPreflightPlan {
	return preflightV0B({ ...options, dryRun: true }).plan;
}
