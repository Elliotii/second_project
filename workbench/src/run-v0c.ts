import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import type {
	ArtifactRefV0B,
	EvidenceIndexItemV0B,
	SessionRefV0B,
	VerifierResultV0B,
	WorkspaceRefV0B,
} from "./contracts/v0b-types.ts";
import {
	type AttemptBudgetV0C,
	type AttemptEvidenceValidationV0C,
	type AttemptRecordV0C,
	type CompletionDecisionV0C,
	type EvidenceIndexV0C,
	type FailurePacketV0C,
	type OutcomeV0C,
	type RunBudgetV0C,
	type RunEvidenceValidationV0C,
	type RunRecordV0C,
	type TerminalRecordV0C,
} from "./contracts/v0c-types.ts";
import {
	preflightV0C,
	type V0CPreflightPlan,
} from "./contracts/preflight-v0c.ts";
import {
	buildFailurePacketV0C,
	scanFailurePacketForChildV0C,
	validateFailurePacketV0C,
} from "./completion/failure-packet-v0c.ts";
import {
	decideCompletionV0C,
	outcomeSignalsForDecisionV0C,
} from "./completion/controller-v0c.ts";
import { artifactRef, validateArtifactRef, writeOnceBytes, writeOnceJson } from "./evidence/artifacts.ts";
import {
	JournalWriterV0C,
	readJournalV0C,
	terminalLifecycleDataV0C,
	validateJournalV0C,
} from "./evidence/journal-v0c.ts";
import { scanPreterminalEvidenceV0B } from "./evidence/secret-scan.ts";
import { validateRunEvidenceV0C } from "./evidence/run-validation-v0c.ts";
import {
	attemptDirectoryV0C,
	expectedTerminalResponsibilitiesV0C,
	terminalIndexItemV0C,
	terminalScanFileScopesV0C,
	terminalScanObjectScopesV0C,
} from "./evidence/terminal-policy-v0c.ts";
import { digestObject, stableJson, treeDigest, treeInventory } from "./hash.ts";
import { createPiRunHandleV0C, type PiRunHandleOptionsV0C } from "./pi/pi-adapter-v0c.ts";
import {
	DEEPSEEK_V4_FLASH_PROFILE_V0C,
	consumeRealExecutionAuthorityV0C,
	type ExecutionBudgetEnvelopeV0C,
	type RealExecutionDependenciesV0C,
	validateRealExecutionDependenciesV0C,
} from "./pi/real-provider-route-v0c.ts";
import { EvidenceMirrorSessionStorageV0C } from "./session/evidence-session-v0c.ts";
import { reopenAndValidateEvidenceSession } from "./session/evidence-session.ts";
import { runExternalVerifierV0B } from "./verifier/runner.ts";
import { createTemporaryWorkspace } from "./workspace/temp-copy.ts";

const CONTROL_BASELINE = "47d36f25563012e1d411576eca387a778ba6a3e7";
const V0B_IMPLEMENTATION_BASELINE = "7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180";
const PI_COMMIT = "027a5847901b5dde30270abaa1041046cd2b4b55";
const WORKBENCH_DIGEST_EXCLUSIONS = new Set(["node_modules"]);
const WORKSPACE_DIGEST_EXCLUSIONS = new Set(["task.json"]);
const STAGE1_BUDGET: ExecutionBudgetEnvelopeV0C = {
	attempt: { provider_requests: 8, tool_calls: 7, agent_wall_time_ms: 120000, token_cap: "not_applicable", cost_cap_usd: 0 },
	run: {
		provider_requests: 16,
		tool_calls: 14,
		wall_time_ms: 360000,
		finalization_reserve_ms: 60000,
		verifier_runs: 2,
		token_cap: "not_applicable",
		cost_cap_usd: 0,
	},
	child_reserve: {
		provider_requests: 8,
		tool_calls: 7,
		agent_wall_time_ms: 120000,
		verifier_runs: 1,
		verifier_wall_time_ms: 30000,
		token_cap: "not_applicable",
		cost_cap_usd: 0,
		finalization_wall_time_ms: 60000,
	},
};

export type V0CRunScenario =
	| "observe_pass"
	| "observe_fail"
	| "recovery_initial_pass"
	| "recover_once_pass"
	| "recover_once_fail"
	| "initial_verifier_invalid"
	| "initial_evidence_invalid"
	| "child_start_reserve_insufficient"
	| "child_budget_exhausted"
	| "packet_oversized"
	| "packet_digest_mismatch"
	| "packet_visibility_mismatch"
	| "packet_shared_secret"
	| "packet_scanner_error"
	| "packet_post_scan_mutation"
	| "packet_persisted_no_child";

export interface V0CRunResult {
	run_id: string;
	run_root: string;
	outcome: OutcomeV0C | null;
	terminal_record: TerminalRecordV0C | null;
	attempt_ids: string[];
	session_id: string;
	workspace_id: string;
	harness_instance_id: string;
	external_provider_calls: number;
	real_model_calls: number;
	credential_reads: number;
	network_calls: number;
	recovery_attempts: 0 | 1;
	child_attempts: 0 | 1;
	verifier_runs: number;
	incomplete_reason: string | null;
}

interface EvaluatedAttempt {
	record: AttemptRecordV0C;
	verifier: VerifierResultV0B;
	verifierRef: ArtifactRefV0B;
	verifierOutputRef: ArtifactRefV0B;
	validation: AttemptEvidenceValidationV0C;
	validationRef: ArtifactRefV0B;
	workspaceSnapshotRef: ArtifactRefV0B;
	decision: CompletionDecisionV0C;
	decisionRef: ArtifactRefV0B;
	toolRefs: ArtifactRefV0B[];
}

function portable(value: string): string {
	return value.split(sep).join("/");
}

function attemptBudget(envelope: ExecutionBudgetEnvelopeV0C): AttemptBudgetV0C {
	return {
		provider_request_limit: envelope.attempt.provider_requests,
		provider_request_usage: 0,
		tool_call_limit: envelope.attempt.tool_calls,
		tool_call_usage: 0,
		wall_time_limit_ms: envelope.attempt.agent_wall_time_ms,
		wall_time_usage_ms: 0,
		agent_wall_time_limit_ms: envelope.attempt.agent_wall_time_ms,
		token_limit: envelope.attempt.token_cap,
		token_usage: envelope.attempt.token_cap === "not_applicable" ? "unknown" : 0,
		cost_limit_usd: envelope.attempt.cost_cap_usd,
		cost_usage_usd: 0,
		verifier_timeout_ms: 30000,
		verifier_output_limit_bytes: 262144,
		verifier_runs_limit: 1,
		verifier_runs_usage: 0,
		external_provider_calls: 0,
	};
}

function runBudget(envelope: ExecutionBudgetEnvelopeV0C): RunBudgetV0C {
	return {
		provider_request_limit: envelope.run.provider_requests,
		provider_request_usage: 0,
		tool_call_limit: envelope.run.tool_calls,
		tool_call_usage: 0,
		wall_time_limit_ms: envelope.run.wall_time_ms,
		wall_time_usage_ms: 0,
		finalization_wall_time_reserve_ms: envelope.run.finalization_reserve_ms,
		verifier_limit: envelope.run.verifier_runs,
		verifier_usage: 0,
		token_limit: envelope.run.token_cap,
		token_usage: envelope.run.token_cap === "not_applicable" ? "unknown" : 0,
		cost_limit_usd: envelope.run.cost_cap_usd,
		cost_usage_usd: 0,
		external_provider_calls: 0,
	};
}

function hasChildReserve(budget: RunBudgetV0C, envelope: ExecutionBudgetEnvelopeV0C): boolean {
	return (
		budget.provider_request_limit - budget.provider_request_usage >= envelope.child_reserve.provider_requests &&
		budget.tool_call_limit - budget.tool_call_usage >= envelope.child_reserve.tool_calls &&
		budget.verifier_limit - budget.verifier_usage >= envelope.child_reserve.verifier_runs &&
		budget.wall_time_limit_ms - budget.wall_time_usage_ms >=
			envelope.child_reserve.agent_wall_time_ms +
				envelope.child_reserve.verifier_wall_time_ms +
				envelope.child_reserve.finalization_wall_time_ms &&
		budget.cost_limit_usd - budget.cost_usage_usd >= envelope.child_reserve.cost_cap_usd &&
		(envelope.child_reserve.token_cap === "not_applicable" ||
			budget.token_limit === "not_applicable" ||
			budget.token_usage === "unknown" ||
			budget.token_limit - budget.token_usage >= envelope.child_reserve.token_cap)
	);
}

function sessionRefFor(
	sessionId: string,
	sessionArtifact: ArtifactRefV0B,
	metadata: unknown,
	storage: EvidenceMirrorSessionStorageV0C,
	toolProfileId: string,
	modelProfileId: "public_emitted_faux" | "deepseek_v4_flash_real",
): SessionRefV0B {
	return {
		schema_version: 1,
		session_id: sessionId,
		runtime: "pi_agent_core",
		pi_commit: PI_COMMIT,
		storage_ref: sessionArtifact,
		metadata_digest: digestObject(metadata),
		model_profile_id: modelProfileId,
		tool_profile_id: toolProfileId,
		reasoning_persistence: "metadata_only",
		resume_capability: "not_claimed",
		redaction: {
			reasoning_blocks: storage.redaction.reasoning_blocks,
			reasoning_characters: storage.redaction.reasoning_characters,
			reasoning_utf8_bytes: storage.redaction.reasoning_utf8_bytes,
			removed_signatures: storage.redaction.removed_signatures,
			content_types: Object.entries(storage.redaction.reasoning_content_types)
				.sort(([left], [right]) => left.localeCompare(right))
				.map(([content_type, value]) => ({ content_type, ...value })),
		},
		truncation: { entries: storage.redaction.truncated_entries },
	};
}

function workspaceRefFor(options: {
	projectRoot: string;
	workspaceRoot: string;
	workspaceId: string;
	sourceDigest: string;
	initialDigest: string;
	finalDigest: string;
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
		writable_paths: options.writablePaths,
		protected_paths: options.protectedPaths,
		file_count: treeInventory(options.workspaceRoot).length,
		hardlink_pairs: 0,
	};
}

function outcomeFor(options: {
	runId: string;
	attempts: EvaluatedAttempt[];
	recoverySlots: 0 | 1;
	override?: { status: "invalid"; failureClass: "evidence"; terminalReason: string };
}): OutcomeV0C {
	const initial = options.attempts[0];
	const final = options.attempts.at(-1);
	if (!initial || !final) throw new Error("Outcome requires at least one evaluated Attempt");
	const signals = options.override
		? {
				status: options.override.status,
				failureClass: options.override.failureClass,
				terminalReason: options.override.terminalReason,
			}
		: outcomeSignalsForDecisionV0C(final.decision);
	return {
		schema_version: 1,
		run_id: options.runId,
		final_attempt_id: final.record.attempt_id,
		status: signals.status,
		failure_class: signals.failureClass,
		terminal_reason: signals.terminalReason,
		initial_verifier_status: initial.verifier.status,
		final_verifier_status: final.verifier.status,
		recovery_triggered: options.attempts.length === 2,
		attempt_count: options.attempts.length as 1 | 2,
		recovery_slots_consumed: options.recoverySlots,
		evidence_index_ref: "evidence-index.json",
	};
}

export function dryRunV0C(options: { projectRoot: string; taskPath?: string; strategyPath?: string }): string {
	return stableJson(preflightV0C({ ...options, dryRun: true }).plan);
}

export function preflightPlanV0C(options: {
	projectRoot: string;
	taskPath?: string;
	strategyPath?: string;
}): V0CPreflightPlan {
	return preflightV0C({ ...options, dryRun: true }).plan;
}

export async function executeV0CRun(options: {
	projectRoot: string;
	taskPath?: string;
	strategyPath?: string;
	scenario: V0CRunScenario;
	realExecution?: RealExecutionDependenciesV0C;
	lifecycleProbe?: (event: "handle_created" | "terminal_committed" | "handle_closed") => void;
	runValidationFault?: "attempt_validation_relation" | "cumulative_budget" | "dynamic_plan";
}): Promise<V0CRunResult> {
	const startedMs = Date.now();
	const preflight = preflightV0C({
		projectRoot: options.projectRoot,
		taskPath: options.taskPath,
		strategyPath: options.strategyPath,
		dryRun: false,
		realExecutionAuthorized: options.realExecution?.authority.authorized === true,
	});
	let credentialHandle: unknown = null;
	let credentialReads = 0;
	if (preflight.strategy.model_profile_id === "deepseek_v4_flash_real") {
		validateRealExecutionDependenciesV0C(options.realExecution);
		consumeRealExecutionAuthorityV0C(options.realExecution.authority);
		const resolution = await options.realExecution.resolveCredential(DEEPSEEK_V4_FLASH_PROFILE_V0C);
		if (resolution.credential_handle === null || resolution.credential_handle === undefined) {
			throw new Error("real Provider credential resolution returned no handle");
		}
		if (!Number.isInteger(resolution.real_credential_reads) || resolution.real_credential_reads < 0) {
			throw new Error("real Provider credential read count is invalid");
		}
		credentialHandle = resolution.credential_handle;
		credentialReads = resolution.real_credential_reads;
	}
	const executionBudget =
		preflight.strategy.model_profile_id === "deepseek_v4_flash_real"
			? options.realExecution!.budget
			: STAGE1_BUDGET;
	const runId = `run-${randomUUID()}`;
	const sessionId = `session-${randomUUID()}`;
	const workspaceId = `workspace-${randomUUID()}`;
	const runRoot = resolve(options.projectRoot, ".runs/v0-c/runs", runId);
	const workspaceRoot = resolve(runRoot, "workspace");
	mkdirSync(resolve(options.projectRoot, ".runs/v0-c/runs"), { recursive: true });
	mkdirSync(runRoot, { recursive: false });
	const createdAt = new Date().toISOString();
	const journal = new JournalWriterV0C(resolve(runRoot, "journal/events.jsonl"), {
		run_id: runId,
		session_id: sessionId,
		workspace_id: workspaceId,
	});
	journal.append("run_started", { scenario: options.scenario }, null);
	const taskRef = writeOnceJson(runRoot, "config/task.json", preflight.task);
	const strategyRef = writeOnceJson(runRoot, "config/strategy.json", preflight.strategy);
	const verifierPath = writeOnceBytes(runRoot, "config/verifier.mjs", readFileSync(preflight.verifierPath));
	const verifierRef = artifactRef(runRoot, verifierPath, "text/javascript; charset=utf-8", false);
	const instructionPath = writeOnceBytes(
		runRoot,
		"config/instruction.md",
		readFileSync(resolve(options.projectRoot, preflight.task.instruction_ref)),
	);
	const instructionRef = artifactRef(runRoot, instructionPath, "text/markdown; charset=utf-8", false);
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
	}, null);
	const sessionPath = resolve(runRoot, "session/evidence.jsonl");
	let storage!: EvidenceMirrorSessionStorageV0C;
	storage = await EvidenceMirrorSessionStorageV0C.create({
		evidencePath: sessionPath,
		workspaceRoot,
		metadata: {
			id: sessionId,
			createdAt,
			run_id: runId,
			workspace_id: workspaceId,
			strategy_id: preflight.strategy.strategy_id,
		},
		onPersist: (projection) => {
			const attemptId = journal.getActiveAttempt();
			if (!attemptId) throw new Error("Session persistence has no active started Attempt");
			journal.append("session_entry_persisted", {
				entry_id: projection.entry_id,
				parent_id: projection.parent_id,
				entry_type: projection.entry_type,
				tool_call_ids: projection.tool_call_ids,
				tool_result_ids: projection.tool_result_ids,
				truncated: projection.truncated,
			}, attemptId);
		},
	});
	journal.append("session_linked", {
		runtime: "pi_agent_core",
		storage_path: "session/evidence.jsonl",
		resume_capability: "not_claimed",
	}, null);
	const handleOptions: PiRunHandleOptionsV0C = {
		workspaceRoot,
		runRoot,
		task: preflight.task,
		sessionStorage: storage,
		journal,
		sessionId,
		workspaceId,
	};
	const handle =
		preflight.strategy.model_profile_id === "deepseek_v4_flash_real"
			? options.realExecution!.createHandle(handleOptions, {
					profile: DEEPSEEK_V4_FLASH_PROFILE_V0C,
					credential_handle: credentialHandle,
				})
			: createPiRunHandleV0C(handleOptions);
	options.lifecycleProbe?.("handle_created");
	const handleIdentity = handle.debugIdentity();
	const budget = runBudget(executionBudget);
	const attemptIds: string[] = [];
	const attempts: EvaluatedAttempt[] = [];
	let recoverySlots: 0 | 1 = 0;
	let failurePacket: FailurePacketV0C | null = null;
	let failurePacketRef: ArtifactRefV0B | null = null;
	let projectionRef: ArtifactRefV0B | null = null;
	let packetFailure: string | null = null;
	let packetScanRef: ArtifactRefV0B | null = null;
	let verifierRuns = 0;
	let externalProviderCalls = 0;

	const evaluate = async (input: {
		ordinal: 1 | 2;
		parentAttemptId: string | null;
		failurePacketId: string | null;
		mode: "repair" | "no_repair";
		evidenceInvalid?: boolean;
		verifierInvalid?: boolean;
		childBudgetExhausted?: boolean;
	}): Promise<EvaluatedAttempt> => {
		if (input.ordinal === 2 && attemptIds.length !== 1) throw new Error("child Attempt can only follow one started initial Attempt");
		if (input.ordinal === 2 && (!input.parentAttemptId || !input.failurePacketId)) {
			throw new Error("child Attempt requires parent and Failure Packet");
		}
		if (attemptIds.length >= 2) throw new Error("third Attempt is forbidden");
		const attemptId = `attempt-${randomUUID()}`;
		attemptIds.push(attemptId);
		journal.setActiveAttempt(attemptId);
		journal.append("attempt_started", {
			ordinal: input.ordinal,
			parent_attempt_id: input.parentAttemptId,
			trigger: input.ordinal === 1 ? "initial" : "verifier_failure",
			failure_packet_id: input.failurePacketId,
		}, attemptId);
		const allocated = attemptBudget(executionBudget);
		const attemptStarted = Date.now();
		const prompt =
			input.ordinal === 1
				? readFileSync(resolve(options.projectRoot, preflight.task.instruction_ref), "utf8")
				: readFileSync(resolve(runRoot, failurePacket!.agent_projection_ref.path), "utf8");
		const settlement = await handle.runAttempt({
			attemptId,
			prompt,
			mode: input.mode,
			budget: allocated,
		});
		externalProviderCalls += settlement.external_provider_calls;
		budget.external_provider_calls = externalProviderCalls;
		const attemptRoot = `attempts/0${input.ordinal}-${attemptId}`;
		const workspaceDigest = treeDigest(workspaceRoot, WORKSPACE_DIGEST_EXCLUSIONS);
		const workspaceSnapshotRef = writeOnceJson(runRoot, `${attemptRoot}/workspace-state.json`, {
			schema_version: 1,
			run_id: runId,
			attempt_id: attemptId,
			session_id: sessionId,
			workspace_id: workspaceId,
			digest: workspaceDigest,
		});
		journal.append("workspace_attempt_snapshot", { workspace_digest: workspaceDigest }, attemptId);
		journal.append("verifier_started", {
			verifier_id: preflight.task.verifier_id,
			verifier_sha256: preflight.task.verifier_sha256,
			settled_observed: true,
			source_snapshot_ref: { ...verifierRef },
		}, attemptId);
		verifierRuns += 1;
		const verifier = await runExternalVerifierV0B({
			projectRoot: options.projectRoot,
			runRoot,
			workspaceRoot,
			attemptId,
			task: preflight.task,
			verifierSnapshotPath: verifierPath,
			verifierSnapshotRef: verifierRef,
			outputPath: `${attemptRoot}/verifier-output.txt`,
			workspaceEnvironmentKey: "V0C_WORKSPACE",
			faultInjection: input.verifierInvalid ? "missing" : undefined,
		});
		journal.append("verifier_completed", {
			verifier_id: verifier.verifier_id,
			status: verifier.status,
			exit_code: verifier.exit_code,
			timed_out: verifier.timed_out,
			full_output_ref: { ...verifier.full_output_ref },
		}, attemptId);
		const verifierResultRef = writeOnceJson(runRoot, `${attemptRoot}/verifier-result.json`, verifier);
		const usage = attemptBudget(executionBudget);
		usage.provider_request_usage = settlement.provider_requests;
		usage.tool_call_usage = settlement.tool_calls;
		usage.wall_time_usage_ms = Date.now() - attemptStarted;
		usage.verifier_runs_usage = 1;
		usage.external_provider_calls = settlement.external_provider_calls;
		usage.token_usage = settlement.token_usage;
		usage.cost_usage_usd = settlement.cost_usage_usd;
		if (input.childBudgetExhausted) usage.wall_time_usage_ms = usage.wall_time_limit_ms + 1;
		budget.provider_request_usage += settlement.provider_requests;
		budget.tool_call_usage += settlement.tool_calls;
		budget.verifier_usage += 1;
		budget.cost_usage_usd += settlement.cost_usage_usd;
		budget.token_usage =
			budget.token_usage === "unknown" || settlement.token_usage === "unknown"
				? "unknown"
				: budget.token_usage + settlement.token_usage;
		budget.wall_time_usage_ms = Date.now() - startedMs;
		const entries = readJournalV0C(journal.path).filter((entry) => entry.attempt_id === attemptId);
		const starts = entries.filter((entry) => entry.type === "tool_call_started").map((entry) => String(entry.data.tool_call_id)).sort();
		const results = entries
			.filter((entry) => entry.type === "tool_call_completed" || entry.type === "tool_call_error" || entry.type === "tool_call_aborted")
			.map((entry) => String(entry.data.tool_call_id))
			.sort();
		const sessionCheck = await reopenAndValidateEvidenceSession({ evidencePath: sessionPath, workspaceRoot, sessionId });
		const errors: string[] = [];
		if (starts.length !== results.length || stableJson(starts) !== stableJson(results)) errors.push("Attempt Tool Call/Result pairing mismatch");
		for (const ref of [workspaceSnapshotRef, verifierResultRef, verifier.full_output_ref, ...settlement.tool_result_artifacts]) {
			errors.push(...validateArtifactRef(runRoot, ref));
		}
		errors.push(...sessionCheck.errors);
		if (input.evidenceInvalid) errors.push("fixed initial evidence invalid injection");
		const validation: AttemptEvidenceValidationV0C = {
			schema_version: 1,
			run_id: runId,
			attempt_id: attemptId,
			valid: errors.length === 0,
			errors,
			checked_artifact_count: 3 + settlement.tool_result_artifacts.length,
			tool_call_count: starts.length,
			tool_result_count: results.length,
		};
		const validationRef = writeOnceJson(runRoot, `${attemptRoot}/validation.json`, validation);
		journal.append("attempt_evidence_validated", {
			valid: validation.valid,
			error_count: validation.errors.length,
		}, attemptId);
		const record: AttemptRecordV0C = {
			schema_version: 1,
			attempt_id: attemptId,
			run_id: runId,
			ordinal: input.ordinal,
			strategy_id: preflight.strategy.strategy_id,
			parent_attempt_id: input.parentAttemptId,
			trigger: input.ordinal === 1 ? "initial" : "verifier_failure",
			session_id: sessionId,
			workspace_id: workspaceId,
			failure_packet_id: input.failurePacketId,
			started_at: new Date(attemptStarted).toISOString(),
			settled_at: new Date().toISOString(),
			terminal_reason: null,
			budget_allocation: allocated,
			budget_usage: usage,
		};
		const reserveAvailable =
			options.scenario === "child_start_reserve_insufficient" ? false : hasChildReserve(budget, executionBudget);
		const budgetExhausted =
			usage.provider_request_usage > usage.provider_request_limit ||
			usage.tool_call_usage > usage.tool_call_limit ||
			usage.wall_time_usage_ms > usage.wall_time_limit_ms;
		const costOrTokenExhausted =
			usage.cost_usage_usd > usage.cost_limit_usd ||
			(usage.token_limit !== "not_applicable" &&
				usage.token_usage !== "unknown" &&
				usage.token_usage > usage.token_limit);
		const decision = decideCompletionV0C({
			runId,
			attemptId,
			isChild: input.ordinal === 2,
			task: preflight.task,
			strategy: preflight.strategy,
			evidenceValid: validation.valid,
			verifierStatus: verifier.status,
			budgetExhausted: budgetExhausted || costOrTokenExhausted,
			childStartReserveAvailable: reserveAvailable,
			recoverySlotConsumed: recoverySlots,
			budget,
		});
		record.terminal_reason = decision.reason;
		journal.append("policy_decided", {
			decision_id: decision.decision_id,
			decision: decision.decision,
			reason: decision.reason,
			recovery_slot_before: decision.recovery_slot_before,
			recovery_slot_after: decision.recovery_slot_after,
		}, attemptId);
		const decisionRef = writeOnceJson(runRoot, `${attemptRoot}/policy-decision.json`, decision);
		return {
			record,
			verifier,
			verifierRef: verifierResultRef,
			verifierOutputRef: verifier.full_output_ref,
			validation,
			validationRef,
			workspaceSnapshotRef,
			decision,
			decisionRef,
			toolRefs: settlement.tool_result_artifacts,
		};
	};

	try {
		const initialMode =
			options.scenario === "observe_pass" || options.scenario === "recovery_initial_pass" ? "repair" : "no_repair";
		const initial = await evaluate({
			ordinal: 1,
			parentAttemptId: null,
			failurePacketId: null,
			mode: initialMode,
			evidenceInvalid: options.scenario === "initial_evidence_invalid",
			verifierInvalid: options.scenario === "initial_verifier_invalid",
		});
		attempts.push(initial);
		if (initial.decision.decision === "recover_once") {
			recoverySlots = 1;
			journal.append("recovery_slot_reserved", {
				after_attempt_id: initial.record.attempt_id,
				slot: 1,
			}, initial.record.attempt_id);
			const fault =
				options.scenario === "packet_oversized"
					? "oversized"
					: options.scenario === "packet_digest_mismatch"
						? "digest_mismatch"
						: options.scenario === "packet_visibility_mismatch"
							? "visibility_mismatch"
							: options.scenario === "packet_shared_secret"
								? "shared_secret"
							: undefined;
			try {
				const built = buildFailurePacketV0C({
					runRoot,
					runId,
					parentAttemptId: initial.record.attempt_id,
					task: preflight.task,
					verifier: initial.verifier,
					verifierResultRef: initial.verifierRef,
					workspaceDigest: treeDigest(workspaceRoot, WORKSPACE_DIGEST_EXCLUSIONS),
					budget,
					faultInjection: fault,
				});
				failurePacket = built.packet;
				projectionRef = built.packet.agent_projection_ref;
				failurePacketRef = writeOnceJson(runRoot, "recovery/failure-packet.json", failurePacket);
				validateFailurePacketV0C(
					failurePacket,
					readFileSync(resolve(runRoot, failurePacket.agent_projection_ref.path), "utf8"),
				);
				packetScanRef = scanFailurePacketForChildV0C({
					runRoot,
					packet: failurePacket,
					packetRef: failurePacketRef,
					projectionRef,
					faultInjection:
						options.scenario === "packet_scanner_error"
							? "scanner_error"
							: options.scenario === "packet_post_scan_mutation"
								? "post_scan_mutation"
								: undefined,
				});
				journal.append("failure_packet_created", {
					failure_packet_id: failurePacket.failure_packet_id,
					parent_attempt_id: failurePacket.parent_attempt_id,
					packet_ref: { ...failurePacketRef },
					agent_projection_ref: { ...projectionRef },
					scan_ref: { ...packetScanRef },
				}, initial.record.attempt_id);
			} catch (error) {
				packetFailure = error instanceof Error ? error.message : String(error);
			}
			if (packetFailure === null && options.scenario === "packet_persisted_no_child") {
				journal.setActiveAttempt(null);
				return {
					run_id: runId,
					run_root: portable(relative(options.projectRoot, runRoot)),
					outcome: null,
					terminal_record: null,
					attempt_ids: [...attemptIds],
					session_id: sessionId,
					workspace_id: workspaceId,
					harness_instance_id: handleIdentity.harness_instance_id,
					external_provider_calls: externalProviderCalls,
					real_model_calls: externalProviderCalls,
					credential_reads: credentialReads,
					network_calls: 0,
					recovery_attempts: 0,
					child_attempts: 0,
					verifier_runs: verifierRuns,
					incomplete_reason: "failure_packet_persisted_before_child_start",
				};
			}
			if (packetFailure === null && failurePacket) {
				const child = await evaluate({
					ordinal: 2,
					parentAttemptId: initial.record.attempt_id,
					failurePacketId: failurePacket.failure_packet_id,
					mode: options.scenario === "recover_once_pass" || options.scenario === "child_budget_exhausted" ? "repair" : "no_repair",
					childBudgetExhausted: options.scenario === "child_budget_exhausted",
				});
				attempts.push(child);
			}
		}
		if (packetFailure !== null) {
			journal.setActiveAttempt(null);
			return {
				run_id: runId,
				run_root: portable(relative(options.projectRoot, runRoot)),
				outcome: null,
				terminal_record: null,
				attempt_ids: [...attemptIds],
				session_id: sessionId,
				workspace_id: workspaceId,
				harness_instance_id: handleIdentity.harness_instance_id,
				external_provider_calls: externalProviderCalls,
				real_model_calls: externalProviderCalls,
				credential_reads: credentialReads,
				network_calls: 0,
				recovery_attempts: 0,
				child_attempts: 0,
				verifier_runs: verifierRuns,
				incomplete_reason: `invalid/evidence:failure_packet_prechild_rejected:${packetFailure}`,
			};
		}
	journal.setActiveAttempt(null);
	budget.wall_time_usage_ms = Date.now() - startedMs;
	const finalDigest = treeDigest(workspaceRoot, WORKSPACE_DIGEST_EXCLUSIONS);
	for (const [path, before] of Object.entries(protectedBefore)) {
		if (!readFileSync(resolve(workspaceRoot, path)).equals(before)) throw new Error(`protected Workspace file changed: ${path}`);
	}
	journal.append("workspace_finalized", { final_tree_digest: finalDigest, protected_files_unchanged: true }, null);
	const sessionCheck = await reopenAndValidateEvidenceSession({ evidencePath: sessionPath, workspaceRoot, sessionId });
	const lineageErrors: string[] = [...sessionCheck.errors];
	if (attemptIds.length !== attempts.length || attemptIds.length < 1 || attemptIds.length > 2) {
		lineageErrors.push("Run attempt_ids must contain exactly the started Attempts");
	}
	if (attempts.length === 2) {
		const [initial, child] = attempts;
		if (
			!initial ||
			!child ||
			child.record.parent_attempt_id !== initial.record.attempt_id ||
			child.record.session_id !== initial.record.session_id ||
			child.record.workspace_id !== initial.record.workspace_id ||
			!child.record.failure_packet_id
		) {
			lineageErrors.push("child Attempt lineage is invalid");
		}
	}
	const allToolRefs = attempts.flatMap((attempt) => attempt.toolRefs);
	const expected = expectedTerminalResponsibilitiesV0C({
		attempts: attempts.map((attempt) => attempt.record),
		toolRefs: allToolRefs,
		hasFailurePacket: failurePacketRef !== null && projectionRef !== null,
		hasFailurePacketScan: packetScanRef !== null,
	});
	const runValidation = validateRunEvidenceV0C({
		runId,
		sessionId,
		workspaceId,
		attempts: attempts.map((attempt) => attempt.record),
		attemptValidations: attempts.map((attempt) => attempt.validation),
		verifierAttemptIds: attempts.map((attempt) => attempt.record.attempt_id),
		runBudget: budget,
		recoverySlotsConsumed: recoverySlots,
		failurePacketId: failurePacket?.failure_packet_id ?? null,
		packetFailure,
		expectedEvidencePaths: [...expected.keys()],
		faultInjection: options.runValidationFault,
		baseErrors: lineageErrors,
	});
	journal.append("run_evidence_validation_completed", {
		valid: runValidation.valid,
		error_count: runValidation.errors.length,
		attempt_count: runValidation.attempt_count,
	}, null);
	const outcome = outcomeFor({
		runId,
		attempts,
		recoverySlots,
		override: runValidation.valid ? undefined : { status: "invalid", failureClass: "evidence", terminalReason: "run_evidence_invalid" },
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
	const sessionArtifact = artifactRef(runRoot, sessionPath, "application/x-ndjson", false);
	const sessionRef = sessionRefFor(
		sessionId,
		sessionArtifact,
		await storage.getMetadata(),
		storage,
		preflight.task.tool_profile_id,
		preflight.strategy.model_profile_id,
	);
	const run: RunRecordV0C = {
		schema_version: 1,
		run_id: runId,
		task_id: preflight.task.task_id,
		strategy_id: preflight.strategy.strategy_id,
		comparison_group_id: null,
		created_at: createdAt,
		status: "terminal",
		config_digest: preflight.plan.config_digest,
		source_identity: {
			control_baseline_commit: CONTROL_BASELINE,
			v0b_implementation_baseline: V0B_IMPLEMENTATION_BASELINE,
			pi_commit: PI_COMMIT,
			workbench_tree_digest: treeDigest(resolve(options.projectRoot, "workbench"), WORKBENCH_DIGEST_EXCLUSIONS),
			task_sha256: preflight.plan.task_sha256,
			strategy_sha256: preflight.plan.strategy_sha256,
			verifier_sha256: preflight.plan.verifier_sha256,
		},
		provider_identity: {
			kind: preflight.strategy.model_profile_id,
			external: preflight.strategy.model_profile_id === "deepseek_v4_flash_real",
			credentials_used: credentialReads > 0,
		},
		budget,
		recovery_slots: { limit: preflight.strategy.recovery_budget, consumed: recoverySlots },
		attempt_ids: [...attemptIds],
	};
	const abort = {
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
	const pendingTerminal = [
		{ type: "outcome_created", data: terminalLifecycleDataV0C(outcome) },
		{ type: "run_terminal", data: terminalLifecycleDataV0C(outcome) },
	];
	const scanFileScopes = terminalScanFileScopesV0C({
		attempts: attempts.map((attempt) => attempt.record),
		toolRefs: allToolRefs,
		hasFailurePacket: failurePacketRef !== null && projectionRef !== null,
		hasFailurePacketScan: packetScanRef !== null,
	});
	const scanObjectScopes = terminalScanObjectScopesV0C({
		run,
		attempts: attempts.map((attempt) => attempt.record),
		workspace: workspaceRef,
		session: sessionRef,
		verifiers: attempts.map((attempt) => attempt.verifier),
		decisions: attempts.map((attempt) => attempt.decision),
		runValidation,
		abort,
		outcome,
		terminalJournalProjection: pendingTerminal,
	});
	const scan = scanPreterminalEvidenceV0B({
		files: scanFileScopes.map((scope) => ({ scope_label: scope.scope_label, path: resolve(runRoot, scope.path) })),
		objects: scanObjectScopes,
	});
	const scanRef = writeOnceJson(runRoot, "evidence/secret-scan.json", scan);
	if (scan.status !== "passed" || scan.match_count !== 0) {
		return {
			run_id: runId,
			run_root: portable(relative(options.projectRoot, runRoot)),
			outcome: null,
			terminal_record: null,
			attempt_ids: [...attemptIds],
			session_id: sessionId,
			workspace_id: workspaceId,
			harness_instance_id: handleIdentity.harness_instance_id,
			external_provider_calls: externalProviderCalls,
			real_model_calls: externalProviderCalls,
			credential_reads: credentialReads,
			network_calls: 0,
			recovery_attempts: attempts.length === 2 ? 1 : 0,
			child_attempts: attempts.length === 2 ? 1 : 0,
			verifier_runs: verifierRuns,
			incomplete_reason: "preterminal_scan_rejected",
		};
	}
	if (Date.now() - startedMs > budget.wall_time_limit_ms) {
		throw new Error("Run wall time exceeded after integrated scan");
	}
	journal.append("outcome_created", terminalLifecycleDataV0C(outcome), null);
	journal.append("run_terminal", terminalLifecycleDataV0C(outcome), null);
	const runRef = writeOnceJson(runRoot, "run.json", run);
	const workspaceRefArtifact = writeOnceJson(runRoot, "evidence/workspace.json", workspaceRef);
	const sessionRefArtifact = writeOnceJson(runRoot, "evidence/session-ref.json", sessionRef);
	const runValidationRef = writeOnceJson(runRoot, "evidence/run-validation.json", runValidation);
	const abortRef = writeOnceJson(runRoot, "evidence/abort.json", abort);
	const outcomeRef = writeOnceJson(runRoot, "outcome.json", outcome);
	const journalRef = artifactRef(runRoot, journal.path, "application/x-ndjson", false);
	const attemptObjectRefs: ArtifactRefV0B[] = [];
	for (const attempt of attempts) {
		attemptObjectRefs.push(writeOnceJson(runRoot, `${attemptDirectoryV0C(attempt.record)}/attempt.json`, attempt.record));
	}
	const refs = [
		taskRef,
		strategyRef,
		verifierRef,
		instructionRef,
		runRef,
		workspaceRefArtifact,
		sessionRefArtifact,
		sessionArtifact,
		journalRef,
		...attemptObjectRefs,
		...attempts.flatMap((attempt) => [
			attempt.workspaceSnapshotRef,
			attempt.verifierRef,
			attempt.verifierOutputRef,
			attempt.validationRef,
			attempt.decisionRef,
			...attempt.toolRefs,
		]),
		...(failurePacketRef && projectionRef ? [failurePacketRef, projectionRef] : []),
		...(packetScanRef ? [packetScanRef] : []),
		runValidationRef,
		abortRef,
		scanRef,
		outcomeRef,
	];
	const index: EvidenceIndexV0C = {
		schema_version: 1,
		run_id: runId,
		items: refs.map((ref) => terminalIndexItemV0C(ref, expected)),
	};
	const indexRef = writeOnceJson(runRoot, "evidence-index.json", index);
	const journalErrors = validateJournalV0C(readJournalV0C(journal.path), {
		runId,
		sessionId,
		workspaceId,
		attemptIds,
		outcome,
	});
	if (journalErrors.length > 0) throw new Error(`final Journal validation failed: ${journalErrors.join("; ")}`);
	const terminal: TerminalRecordV0C = {
		schema_version: 1,
		run_id: runId,
		outcome_sha256: outcomeRef.sha256,
		evidence_index_sha256: indexRef.sha256,
		preterminal_scan: {
			completed: true,
			scope_labels: scan.scope_labels,
			match_count: 0,
			result_ref: scanRef,
		},
		committed_at: new Date().toISOString(),
	};
	writeOnceJson(runRoot, "terminal.json", terminal);
	options.lifecycleProbe?.("terminal_committed");
	return {
		run_id: runId,
		run_root: portable(relative(options.projectRoot, runRoot)),
		outcome,
		terminal_record: terminal,
		attempt_ids: [...attemptIds],
		session_id: sessionId,
		workspace_id: workspaceId,
		harness_instance_id: handleIdentity.harness_instance_id,
		external_provider_calls: externalProviderCalls,
		real_model_calls: externalProviderCalls,
		credential_reads: credentialReads,
		network_calls: 0,
		recovery_attempts: attempts.length === 2 ? 1 : 0,
		child_attempts: attempts.length === 2 ? 1 : 0,
		verifier_runs: verifierRuns,
		incomplete_reason: null,
	};
	} finally {
		await handle.close();
		options.lifecycleProbe?.("handle_closed");
	}
}

export function terminalIndexItemsV0C(index: EvidenceIndexV0C): EvidenceIndexItemV0B[] {
	return index.items;
}
