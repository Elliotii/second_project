import { appendFileSync, copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import {
	AgentHarness,
	JsonlSessionRepo,
	type JsonlSessionMetadata,
	type Session,
	type Skill,
} from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import {
	createModels,
	fauxAssistantMessage,
	fauxProvider,
	fauxToolCall,
	type AssistantMessage,
} from "@earendil-works/pi-ai";
import type { ArtifactRefV0B, TaskSpecV0B, VerifierResultV0B } from "./contracts/v0b-types.ts";
import type {
	BudgetCapsV2A,
	BudgetUsageV2A,
	CandidateModeV2A,
	CandidatePathV2A,
	ExecuteRunOptionsV2A,
	RecoverySeedV2A,
	RecoveryStrategyV2A,
	RunManifestV2A,
	RunTerminalV2A,
} from "./contracts/v2-types.ts";
import type { TaskSpecV1 } from "./contracts/v1-types.ts";
import { artifactRef, writeOnceBytes, writeOnceJson } from "./evidence/artifacts.ts";
import { loadCandidateTaskPackV1 } from "./experiment/task-pack-v1.ts";
import { digestObject, fileSha256, sha256, stableJson, treeDigest, treeInventory } from "./hash.ts";
import { createBoundedToolProfile, readProtectedBytes } from "./pi/tool-profile.ts";
import { SYSTEM_PROMPT } from "./prompts/base.ts";
import { selectCandidateV2A } from "./recovery/selector-v2.ts";
import { expectedSkillIdentityV1, loadExactOneSkillV1 } from "./skill/runtime-v1.ts";
import { runExternalVerifierV0B } from "./verifier/runner.ts";
import { createTemporaryWorkspace } from "./workspace/temp-copy.ts";

const PI_COMMIT = "027a5847901b5dde30270abaa1041046cd2b4b55" as const;
const WORKBENCH_REVISION = "228973b7e7b826468c54b84f28faf8d9c0c33a6d+v2a-source-delta" as const;
const FORBIDDEN_WORKSPACE_VALUE_V2A = /(?:bearer\s+[A-Za-z0-9._-]+|FAKE_(?:SENSITIVE|RESOLVER|PROVIDER|FACTORY)[A-Za-z0-9_-]*)/i;
export const V2A_ATTEMPT_CAPS: BudgetCapsV2A = Object.freeze({
	faux_provider_dispatches_max: 8,
	tool_calls_max: 16,
	verifier_runs_max: 1,
});
export const ZERO_REAL_CALL_COUNTERS_V2A = Object.freeze({
	credential_reads: 0,
	network_calls: 0,
	external_provider_calls: 0,
	real_model_calls: 0,
} as const);

interface HarnessResultV2A {
	settled: boolean;
	terminalReason: "settled" | "budget_stopped" | "runtime_invalid";
	providerDispatches: number;
	toolCalls: number;
	tokens: number;
	activeExecutionTimeMs: number;
	contextMessageCount: number;
}

class CandidateBudgetStopV2A extends Error {
	constructor() {
		super("V2-A deterministic Candidate budget stop");
		this.name = "CandidateBudgetStopV2A";
	}
}

function portable(path: string): string {
	return path.split(sep).join("/");
}

function appendJournal(runRoot: string, sequence: { value: number }, type: string, data: unknown): void {
	appendFileSync(
		resolve(runRoot, "journal.jsonl"),
		`${stableJson({ schema_version: "v2a-journal-v1", seq: ++sequence.value, timestamp: new Date().toISOString(), type, data })}\n`,
		"utf8",
	);
}

function manifestFor(runId: string, taskId: string): RunManifestV2A {
	const body = {
		schema_version: "v2a-run-manifest-v1" as const,
		run_id: runId,
		task_id: taskId,
		policy_id: "v2a_two_path_bounded_recovery" as const,
		model_id: "v2a-faux/faux-1" as const,
		tool_profile_id: "bounded_tools_v1" as const,
		skill_id: "reliability-completion-v1" as const,
		pi_commit: PI_COMMIT,
		workbench_revision: WORKBENCH_REVISION,
		real_execution_authorized: false as const,
		recovery_candidate_count_on_valid_failure: 2 as const,
		per_attempt_budget: structuredClone(V2A_ATTEMPT_CAPS),
		per_group_budget: {
			candidate_paths_exact_on_valid_failure: 2 as const,
			faux_provider_dispatches_max: 24 as const,
			tool_calls_max: 48 as const,
			verifier_runs_max: 3 as const,
			real_cost_usd: 0 as const,
		},
	};
	return { ...body, manifest_id: digestObject(body) };
}

function toVerifierTask(task: TaskSpecV1): TaskSpecV0B {
	return {
		schema_version: 1,
		task_id: task.task_id,
		instruction_ref: task.instruction_ref,
		instruction_sha256: task.instruction_sha256,
		workspace_source_ref: task.workspace_source_ref,
		workspace_source_digest: task.workspace_source_digest,
		writable_paths: [...task.writable_paths],
		protected_paths: [...task.protected_paths],
		verifier_id: task.external_verifier_id,
		verifier_ref: task.external_verifier_ref,
		verifier_sha256: task.external_verifier_sha256,
		acceptance_visibility: "hidden_external",
		tool_profile_id: task.tool_profile_id,
		command_descriptors: structuredClone(task.command_descriptors),
		verifier_command: {
			executable: "current_node_executable",
			argv: [task.external_verifier_ref],
			cwd: "project",
			timeout_ms: 15_000,
			output_limit_bytes: 32_768,
		},
	};
}

async function verifyWorkspace(options: {
	projectRoot: string;
	runRoot: string;
	workspaceRoot: string;
	task: TaskSpecV1;
	attemptId: string;
	prefix: string;
}): Promise<{ result: VerifierResultV0B; resultRef: ArtifactRefV0B }> {
	const verifierPath = resolve(options.runRoot, "config/verifier.mjs");
	const verifierSnapshotRef = artifactRef(options.runRoot, verifierPath, "text/javascript", false);
	const result = await runExternalVerifierV0B({
		projectRoot: options.projectRoot,
		runRoot: options.runRoot,
		workspaceRoot: options.workspaceRoot,
		attemptId: options.attemptId,
		task: toVerifierTask(options.task),
		verifierSnapshotPath: verifierPath,
		verifierSnapshotRef,
		outputPath: `${options.prefix}/verifier-output.txt`,
		workspaceEnvironmentKey: "V1_WORKSPACE",
	});
	return { result, resultRef: writeOnceJson(options.runRoot, `${options.prefix}/verifier-result.json`, result) };
}

function fakeResponses(mode: CandidateModeV2A | "primary_pass" | "primary_fail", attemptId: string, patch: string) {
	if (mode === "primary_fail" || mode === "fail" || mode === "invalid") {
		return [fauxAssistantMessage("The bounded attempt settled without a valid repair.")];
	}
	if (mode === "budget_stop") {
		return Array.from({ length: 9 }, (_, index) =>
			fauxAssistantMessage(
				fauxToolCall("run_command", { command_id: "public_test" }, { id: `${attemptId}-budget-${index + 1}` }),
				{ stopReason: "toolUse" },
			),
		);
	}
	return [
		fauxAssistantMessage(
			fauxToolCall("workspace_write", { path: "src/subject.ts", content: patch }, { id: `${attemptId}-write` }),
			{ stopReason: "toolUse" },
		),
		fauxAssistantMessage(
			fauxToolCall("run_command", { command_id: "public_test" }, { id: `${attemptId}-test` }),
			{ stopReason: "toolUse" },
		),
		fauxAssistantMessage("The bounded task is complete."),
	];
}

async function runHarness(options: {
	session: Session<JsonlSessionMetadata>;
	workspaceRoot: string;
	task: TaskSpecV1;
	skill: Skill;
	prompt: string;
	attemptId: string;
	mode: CandidateModeV2A | "primary_pass" | "primary_fail";
	patch: string;
}): Promise<HarnessResultV2A> {
	const models = createModels();
	const registration = fauxProvider({ provider: "v2a-faux" });
	models.setProvider(registration.provider);
	const profile = createBoundedToolProfile(options.workspaceRoot, options.task);
	let providerDispatches = 0;
	let toolCalls = 0;
	let tokens = 0;
	let settled = false;
	let budgetStopped = false;
	let contextMessageCount = -1;
	const responses = fakeResponses(options.mode, options.attemptId, options.patch);
	registration.setResponses(
		responses.map((response) => (context) => {
			if (contextMessageCount < 0) contextMessageCount = context.messages.length;
			return response;
		}),
	);
	const harness = new AgentHarness({
		models,
		session: options.session,
		model: registration.getModel(),
		resources: { skills: [options.skill] },
		tools: profile.tools,
		toolContext: profile.context,
		systemPrompt: SYSTEM_PROMPT,
		thinkingLevel: "off",
		streamOptions: { maxRetries: 0, timeoutMs: 30_000 },
	});
	const offProvider = harness.on("before_provider_request", () => {
		if (providerDispatches + 1 > V2A_ATTEMPT_CAPS.faux_provider_dispatches_max) {
			budgetStopped = true;
			throw new CandidateBudgetStopV2A();
		}
		providerDispatches++;
		return undefined;
	});
	const offTool = harness.on("tool_call", () => {
		if (toolCalls + 1 > V2A_ATTEMPT_CAPS.tool_calls_max) {
			budgetStopped = true;
			throw new CandidateBudgetStopV2A();
		}
		toolCalls++;
		return undefined;
	});
	const unsubscribe = harness.subscribe((event) => {
		if (event.type === "message_end" && event.message.role === "assistant") {
			tokens += event.message.usage.input + event.message.usage.cacheRead + event.message.usage.cacheWrite + event.message.usage.output;
		}
		if (event.type === "settled") settled = true;
	});
	const started = Date.now();
	try {
		await harness.skill(options.skill.name, options.prompt);
		await harness.waitForIdle();
		const exhaustedHostBudget =
			options.mode === "budget_stop" &&
			providerDispatches === V2A_ATTEMPT_CAPS.faux_provider_dispatches_max &&
			registration.getPendingResponseCount() > 0;
		return {
			settled: exhaustedHostBudget ? false : settled,
			terminalReason: exhaustedHostBudget ? "budget_stopped" : settled ? "settled" : "runtime_invalid",
			providerDispatches,
			toolCalls,
			tokens,
			activeExecutionTimeMs: Math.max(0, Date.now() - started),
			contextMessageCount,
		};
	} catch {
		return {
			settled: false,
			terminalReason: budgetStopped ? "budget_stopped" : "runtime_invalid",
			providerDispatches,
			toolCalls,
			tokens,
			activeExecutionTimeMs: Math.max(0, Date.now() - started),
			contextMessageCount,
		};
	} finally {
		unsubscribe();
		offProvider();
		offTool();
		await harness.abort();
	}
}

function workspaceSnapshot(runRoot: string, workspaceRoot: string, path: string, workspaceId: string): ArtifactRefV0B {
	const inventory = treeInventory(workspaceRoot);
	return writeOnceJson(runRoot, path, {
		schema_version: "v2a-workspace-snapshot-v1",
		workspace_id: workspaceId,
		root: portable(relative(runRoot, workspaceRoot)),
		digest: digestObject(inventory),
		inventory,
	});
}

function changedSemanticBytes(sourceRoot: string, finalRoot: string, writablePaths: readonly string[]): number {
	let total = 0;
	for (const path of writablePaths) {
		const source = resolve(sourceRoot, path);
		const target = resolve(finalRoot, path);
		const sourceBytes = existsSync(source) ? readFileSync(source) : Buffer.alloc(0);
		const targetBytes = existsSync(target) ? readFileSync(target) : Buffer.alloc(0);
		if (!sourceBytes.equals(targetBytes)) total += targetBytes.length;
	}
	return total;
}

function assertIndependentFiles(...roots: string[]): void {
	const identities = new Set<string>();
	for (const root of roots) {
		for (const file of treeInventory(root)) {
			const path = resolve(root, file.path);
			const stats = lstatSync(path);
			if (stats.nlink !== 1) throw new Error(`V2-A linked workspace file rejected: ${file.path}`);
			const identity = `${stats.dev}:${stats.ino}`;
			if (identities.has(identity)) throw new Error(`V2-A shared file identity rejected: ${file.path}`);
			identities.add(identity);
		}
	}
}

function cloneWorkspace(sourceRoot: string, targetRoot: string, workspaceId: string, task: TaskSpecV1): void {
	const digest = treeDigest(sourceRoot);
	mkdirSync(resolve(targetRoot, ".."), { recursive: true });
	createTemporaryWorkspace({
		projectRoot: resolve(targetRoot, "../../.."),
		sourceRoot,
		targetRoot,
		workspaceId,
		task: { ...task, workspace_source_digest: digest },
	});
}

function candidateWorkspaceGuardrails(
	seedProtectedBytes: Readonly<Record<string, string>>,
	workspaceRoot: string,
	task: TaskSpecV1,
): boolean {
	if (stableJson(readProtectedBytes(workspaceRoot, task)) !== stableJson(seedProtectedBytes)) return false;
	return treeInventory(workspaceRoot).every((file) => !FORBIDDEN_WORKSPACE_VALUE_V2A.test(readFileSync(resolve(workspaceRoot, file.path), "utf8")));
}

function sessionArtifact(runRoot: string, metadata: JsonlSessionMetadata): ArtifactRefV0B {
	return artifactRef(runRoot, metadata.path, "application/x-ndjson", false);
}

async function executeCandidate(options: {
	projectRoot: string;
	runRoot: string;
	sequence: { value: number };
	repo: JsonlSessionRepo;
	parentSessionMetadata: JsonlSessionMetadata;
	parentEntryCount: number;
	seed: RecoverySeedV2A;
	seedWorkspaceRoot: string;
	task: TaskSpecV1;
	skill: Skill;
	patch: string;
	recoveryPrompt: string;
	strategy: RecoveryStrategyV2A;
	mode: CandidateModeV2A;
}): Promise<CandidatePathV2A> {
	const suffix = options.strategy === "continue_failed_session" ? "a" : "b";
	const candidatePathId = `${options.seed.recovery_group_id}-candidate-${suffix}`;
	const attemptId = `${candidatePathId}-attempt-01`;
	const candidateRoot = resolve(options.runRoot, `candidates/${suffix}`);
	const workspaceRoot = resolve(candidateRoot, "workspace");
	cloneWorkspace(options.seedWorkspaceRoot, workspaceRoot, `${candidatePathId}-workspace`, options.task);
	const seedProtectedBytes = readProtectedBytes(options.seedWorkspaceRoot, options.task);
	const initialWorkspaceDigest = treeDigest(workspaceRoot);
	if (initialWorkspaceDigest !== options.seed.failed_workspace_snapshot_digest) throw new Error("Candidate initial Workspace digest drift");
	const session =
		options.strategy === "continue_failed_session"
			? await options.repo.fork(options.parentSessionMetadata, { cwd: workspaceRoot, id: `${candidatePathId}-session` })
			: await options.repo.create({ cwd: workspaceRoot, id: `${candidatePathId}-session`, metadata: { strategy_id: options.strategy } });
	const sessionMetadata = await session.getMetadata();
	const entriesBefore = await session.getEntries();
	if (options.strategy === "continue_failed_session" && entriesBefore.length !== options.parentEntryCount) throw new Error("derived Session lost parent history");
	if (options.strategy === "fresh_session_from_failure_seed" && entriesBefore.length !== 0) throw new Error("fresh Session unexpectedly retained parent history");
	const sessionBeforePath = `candidates/${suffix}/session-before.jsonl`;
	writeOnceBytes(options.runRoot, sessionBeforePath, readFileSync(sessionMetadata.path));
	const sessionBeforeRef = artifactRef(options.runRoot, sessionBeforePath, "application/x-ndjson", false);
	appendJournal(options.runRoot, options.sequence, "candidate_started", {
		candidate_path_id: candidatePathId,
		strategy_id: options.strategy,
		attempt_id: attemptId,
		initial_workspace_digest: initialWorkspaceDigest,
		session_digest_before_run: sessionBeforeRef.sha256,
	});
	const harness = await runHarness({
		session,
		workspaceRoot,
		task: options.task,
		skill: options.skill,
		prompt: options.recoveryPrompt,
		attemptId,
		mode: options.mode,
		patch: options.patch,
	});
	const verifier = await verifyWorkspace({
		projectRoot: options.projectRoot,
		runRoot: options.runRoot,
		workspaceRoot,
		task: options.task,
		attemptId,
		prefix: `candidates/${suffix}`,
	});
	const finalWorkspaceDigest = treeDigest(workspaceRoot);
	const workspaceRef = workspaceSnapshot(options.runRoot, workspaceRoot, `candidates/${suffix}/workspace-final.json`, `${candidatePathId}-workspace`);
	const sessionRef = sessionArtifact(options.runRoot, sessionMetadata);
	const usage: BudgetUsageV2A = {
		faux_provider_dispatches: harness.providerDispatches,
		tool_calls: harness.toolCalls,
		verifier_runs: 1,
		tokens: harness.tokens,
		active_execution_time_ms: harness.activeExecutionTimeMs,
		real_cost_usd: 0,
	};
	const budgetWithin =
		usage.faux_provider_dispatches <= V2A_ATTEMPT_CAPS.faux_provider_dispatches_max &&
		usage.tool_calls <= V2A_ATTEMPT_CAPS.tool_calls_max &&
		usage.verifier_runs <= V2A_ATTEMPT_CAPS.verifier_runs_max &&
		harness.terminalReason !== "budget_stopped";
	const evidenceValid = options.mode !== "invalid";
	const protectedSecretPathValid = candidateWorkspaceGuardrails(seedProtectedBytes, workspaceRoot, options.task);
	const commonArtifactDigest = digestObject({
		seed_workspace_digest: options.seed.failed_workspace_snapshot_digest,
		failure_packet_sha256: options.seed.failure_packet_sha256,
		prompt_sha256: sha256(options.recoveryPrompt),
		skill_sha256: options.seed.skill_digest,
		tool_profile_sha256: options.seed.tool_profile_digest,
		verifier_sha256: options.task.external_verifier_sha256,
		model_id: "v2a-faux/faux-1",
		policy_id: "v2a_two_path_bounded_recovery",
		budget: V2A_ATTEMPT_CAPS,
	});
	const expectedHistory = options.strategy === "continue_failed_session" ? options.parentEntryCount : 0;
	const hardGates = {
		identity_complete: evidenceValid,
		seed_and_isolation_valid: initialWorkspaceDigest === options.seed.failed_workspace_snapshot_digest,
		session_lineage_valid:
			entriesBefore.length === expectedHistory &&
			(options.strategy === "continue_failed_session"
				? sessionMetadata.parentSessionPath === options.parentSessionMetadata.path
				: sessionMetadata.parentSessionPath === undefined),
		unique_terminal_settled: harness.settled,
		budget_valid: budgetWithin,
		verifier_passed: verifier.result.status === "passed",
		protected_secret_path_valid: protectedSecretPathValid,
		lineage_complete: evidenceValid,
	};
	const candidate: CandidatePathV2A = {
		schema_version: "v2a-candidate-path-v1",
		candidate_path_id: candidatePathId,
		recovery_group_id: options.seed.recovery_group_id,
		recovery_seed_id: options.seed.recovery_seed_id,
		strategy_id: options.strategy,
		parent_attempt_id: options.seed.parent_attempt_id,
		session_ref: sessionRef,
		session_snapshot_before_run_ref: sessionBeforeRef,
		session_digest_before_run: sessionBeforeRef.sha256,
		parent_history_entry_count: entriesBefore.length,
		workspace_ref: workspaceRef,
		initial_workspace_digest: initialWorkspaceDigest,
		attempt_id: attemptId,
		settled: harness.settled,
		final_workspace_ref: workspaceRef,
		final_workspace_digest: finalWorkspaceDigest,
		verifier_result_ref: verifier.resultRef,
		verifier_status: verifier.result.status,
		evidence_valid: evidenceValid,
		budget_usage: usage,
		budget_caps: structuredClone(V2A_ATTEMPT_CAPS),
		budget_within_limits: budgetWithin,
		terminal_reason: harness.terminalReason,
		allowed_semantic_diff_size: changedSemanticBytes(options.seedWorkspaceRoot, workspaceRoot, options.task.writable_paths),
		immediate_recovery_prompt_sha256: sha256(options.recoveryPrompt),
		common_artifact_digest: commonArtifactDigest,
		hard_gates: hardGates,
	};
	const candidateRef = writeOnceJson(options.runRoot, `candidates/${suffix}/candidate.json`, candidate);
	appendJournal(options.runRoot, options.sequence, "candidate_terminal", {
		candidate_path_id: candidatePathId,
		terminal_reason: candidate.terminal_reason,
		verifier_status: candidate.verifier_status,
		candidate_ref: candidateRef,
	});
	return candidate;
}

export async function executeRunV2A(options: ExecuteRunOptionsV2A): Promise<RunTerminalV2A> {
	if (existsSync(options.runRoot)) throw new Error("V2-A Run root already exists");
	mkdirSync(options.runRoot, { recursive: true });
	writeOnceBytes(options.runRoot, "journal.jsonl", "");
	const sequence = { value: 0 };
	const task = loadCandidateTaskPackV1(options.projectRoot).find((candidate) => candidate.task_id === "v1-parse-duration");
	if (!task) throw new Error("V2-A frozen task is unavailable");
	const loadedSkill = await loadExactOneSkillV1({
		projectRoot: options.projectRoot,
		skillRoot: "fixtures/skills/v1",
		expected: expectedSkillIdentityV1(options.projectRoot),
	});
	const skill = loadedSkill.skill;
	const instruction = readFileSync(resolve(options.projectRoot, task.instruction_ref), "utf8");
	const patch = readFileSync(resolve(options.projectRoot, task.reference_patch_ref), "utf8");
	const manifest = manifestFor(options.runId, task.task_id);
	const manifestRef = writeOnceJson(options.runRoot, "config/manifest.json", manifest);
	const instructionPath = writeOnceBytes(options.runRoot, "config/instruction.md", instruction);
	const instructionRef = artifactRef(options.runRoot, instructionPath, "text/markdown", false);
	writeOnceBytes(options.runRoot, "config/skill.md", readFileSync(resolve(options.projectRoot, "fixtures/skills/v1/reliability-completion/SKILL.md")));
	writeOnceBytes(options.runRoot, "config/verifier.mjs", readFileSync(resolve(options.projectRoot, task.external_verifier_ref)));
	appendJournal(options.runRoot, sequence, "run_started", { run_id: options.runId, manifest_ref: manifestRef });
	const primaryWorkspaceRoot = resolve(options.runRoot, "primary/workspace");
	mkdirSync(resolve(primaryWorkspaceRoot, ".."), { recursive: true });
	createTemporaryWorkspace({
		projectRoot: options.projectRoot,
		sourceRoot: resolve(options.projectRoot, task.workspace_source_ref),
		targetRoot: primaryWorkspaceRoot,
		workspaceId: `${options.runId}-primary-workspace`,
		task,
	});
	const env = new NodeExecutionEnv({ cwd: options.runRoot, shellEnv: {} });
	const repo = new JsonlSessionRepo({ fs: env, sessionsRoot: resolve(options.runRoot, "sessions") });
	const parentSession = await repo.create({
		cwd: primaryWorkspaceRoot,
		id: `${options.runId}-parent-session`,
		metadata: { run_id: options.runId, attempt_role: "primary" },
	});
	const primaryAttemptId = `${options.runId}-primary-attempt-01`;
	appendJournal(options.runRoot, sequence, "primary_started", { attempt_id: primaryAttemptId });
	const primaryHarness = await runHarness({
		session: parentSession,
		workspaceRoot: primaryWorkspaceRoot,
		task,
		skill,
		prompt: instruction,
		attemptId: primaryAttemptId,
		mode: options.primaryMode === "pass" ? "primary_pass" : "primary_fail",
		patch,
	});
	if (!primaryHarness.settled) throw new Error("V2-A primary Attempt did not settle");
	appendJournal(options.runRoot, sequence, "primary_settled", {
		attempt_id: primaryAttemptId,
		provider_dispatches: primaryHarness.providerDispatches,
		tool_calls: primaryHarness.toolCalls,
	});
	const primaryVerifier = await verifyWorkspace({
		projectRoot: options.projectRoot,
		runRoot: options.runRoot,
		workspaceRoot: primaryWorkspaceRoot,
		task,
		attemptId: primaryAttemptId,
		prefix: "primary",
	});
	appendJournal(options.runRoot, sequence, "primary_verifier_completed", {
		attempt_id: primaryAttemptId,
		status: primaryVerifier.result.status,
		verifier_result_ref: primaryVerifier.resultRef,
	});
	if (primaryVerifier.result.status === "passed") {
		const terminal: RunTerminalV2A = {
			schema_version: "v2a-run-terminal-v1",
			manifest_id: manifest.manifest_id,
			run_id: options.runId,
			primary_attempt_id: primaryAttemptId,
			primary_verifier_status: "passed",
			outcome: "initial_pass",
			recovery_group_id: null,
			recovery_seed_ref: null,
			candidate_refs: [],
			selection_ref: null,
			selected_candidate_id: null,
			real_call_counters: structuredClone(ZERO_REAL_CALL_COUNTERS_V2A),
		};
		writeOnceJson(options.runRoot, "terminal.json", terminal);
		appendJournal(options.runRoot, sequence, "run_terminal", { outcome: terminal.outcome });
		return terminal;
	}
	if (primaryVerifier.result.status !== "failed") throw new Error("V2-A primary Verifier result is invalid");
	const recoveryGroupId = `${options.runId}-recovery-group-01`;
	const recoverySeedId = `${recoveryGroupId}-seed-01`;
	const failurePacket = {
		schema_version: "v2a-failure-packet-v1",
		recovery_group_id: recoveryGroupId,
		parent_attempt_id: primaryAttemptId,
		task_instruction: instruction,
		verifier_id: task.external_verifier_id,
		failed_checks: primaryVerifier.result.public_failed_checks ?? [],
		summary: primaryVerifier.result.summary,
		changed_files: [],
		writable_paths: task.writable_paths,
		protected_paths: task.protected_paths,
		stop_conditions: ["one Candidate Attempt", "one external Verifier", "no retry", "no fallback"],
	};
	const failurePacketRef = writeOnceJson(options.runRoot, "seed/failure-packet.json", failurePacket);
	const seedWorkspaceRoot = resolve(options.runRoot, "seed/workspace");
	cloneWorkspace(primaryWorkspaceRoot, seedWorkspaceRoot, `${recoverySeedId}-workspace`, task);
	const seedWorkspaceDigest = treeDigest(seedWorkspaceRoot);
	const seedWorkspaceRef = workspaceSnapshot(options.runRoot, seedWorkspaceRoot, "seed/workspace-snapshot.json", `${recoverySeedId}-workspace`);
	const parentSessionMetadata = await parentSession.getMetadata();
	const parentSessionRef = sessionArtifact(options.runRoot, parentSessionMetadata);
	const parentEntryCount = (await parentSession.getEntries()).length;
	const workbenchDigest = treeDigest(resolve(options.projectRoot, "workbench/src"));
	const recoveryPrompt = `${instruction.trim()}\n\nExternal verifier feedback:\n${stableJson(failurePacket)}\n`;
	const seed: RecoverySeedV2A = {
		schema_version: "v2a-recovery-seed-v1",
		recovery_seed_id: recoverySeedId,
		recovery_group_id: recoveryGroupId,
		parent_run_id: options.runId,
		parent_attempt_id: primaryAttemptId,
		task_id: task.task_id,
		task_instruction_ref: instructionRef,
		task_instruction_sha256: instructionRef.sha256,
		failure_packet_ref: failurePacketRef,
		failure_packet_sha256: failurePacketRef.sha256,
		failed_workspace_snapshot_ref: seedWorkspaceRef,
		failed_workspace_snapshot_digest: seedWorkspaceDigest,
		parent_session_ref: parentSessionRef,
		parent_session_digest: parentSessionRef.sha256,
		verifier_result_ref: primaryVerifier.resultRef,
		verifier_result_sha256: primaryVerifier.resultRef.sha256,
		tool_profile_digest: digestObject({ tool_profile_id: task.tool_profile_id, command_descriptors: task.command_descriptors }),
		prompt_digest: sha256(recoveryPrompt),
		skill_digest: loadedSkill.ref.source_sha256,
		pi_commit: PI_COMMIT,
		workbench_digest: workbenchDigest,
		created_before_candidate_attempts: true,
	};
	const seedRef = writeOnceJson(options.runRoot, "seed/recovery-seed.json", seed);
	if (fileSha256(resolve(options.runRoot, seedRef.path)) !== seedRef.sha256 || treeDigest(seedWorkspaceRoot) !== seedWorkspaceDigest) {
		throw new Error("Recovery Seed failed post-freeze integrity verification");
	}
	appendJournal(options.runRoot, sequence, "seed_frozen", {
		recovery_seed_id: recoverySeedId,
		recovery_seed_ref: seedRef,
		workspace_digest: seedWorkspaceDigest,
		parent_session_entry_count: parentEntryCount,
	});
	const modes = options.candidateModes ?? (["pass", "fail"] as const);
	const candidateA = await executeCandidate({
		projectRoot: options.projectRoot,
		runRoot: options.runRoot,
		sequence,
		repo,
		parentSessionMetadata,
		parentEntryCount,
		seed,
		seedWorkspaceRoot,
		task,
		skill,
		patch,
		recoveryPrompt,
		strategy: "continue_failed_session",
		mode: modes[0],
	});
	const candidateB = await executeCandidate({
		projectRoot: options.projectRoot,
		runRoot: options.runRoot,
		sequence,
		repo,
		parentSessionMetadata,
		parentEntryCount,
		seed,
		seedWorkspaceRoot,
		task,
		skill,
		patch,
		recoveryPrompt,
		strategy: "fresh_session_from_failure_seed",
		mode: modes[1],
	});
	assertIndependentFiles(seedWorkspaceRoot, resolve(options.runRoot, "candidates/a/workspace"), resolve(options.runRoot, "candidates/b/workspace"));
	if (candidateA.common_artifact_digest !== candidateB.common_artifact_digest) throw new Error("Candidate common Artifact fairness drift");
	if (candidateA.immediate_recovery_prompt_sha256 !== candidateB.immediate_recovery_prompt_sha256) throw new Error("Candidate recovery prompt drift");
	const groupUsage = {
		faux_provider_dispatches: primaryHarness.providerDispatches + candidateA.budget_usage.faux_provider_dispatches + candidateB.budget_usage.faux_provider_dispatches,
		tool_calls: primaryHarness.toolCalls + candidateA.budget_usage.tool_calls + candidateB.budget_usage.tool_calls,
		verifier_runs: 3,
		real_cost_usd: 0 as const,
	};
	if (
		groupUsage.faux_provider_dispatches > manifest.per_group_budget.faux_provider_dispatches_max ||
		groupUsage.tool_calls > manifest.per_group_budget.tool_calls_max ||
		groupUsage.verifier_runs > manifest.per_group_budget.verifier_runs_max
	) {
		throw new Error("V2-A Recovery Group budget exceeded");
	}
	writeOnceJson(options.runRoot, "recovery-group.json", {
		schema_version: "v2a-recovery-group-v1",
		recovery_group_id: recoveryGroupId,
		recovery_seed_id: recoverySeedId,
		candidate_path_ids: [candidateA.candidate_path_id, candidateB.candidate_path_id],
		budget_usage: groupUsage,
		budget_caps: manifest.per_group_budget,
		candidate_paths_terminal: 2,
		common_artifact_digest: candidateA.common_artifact_digest,
	});
	const selection = selectCandidateV2A(recoveryGroupId, [candidateA, candidateB]);
	const selectionRef = writeOnceJson(options.runRoot, "selection.json", selection);
	appendJournal(options.runRoot, sequence, "selection_written", {
		recovery_group_id: recoveryGroupId,
		selected_candidate_id: selection.selected_candidate_id,
		selection_ref: selectionRef,
	});
	const candidateRefs = [
		artifactRef(options.runRoot, "candidates/a/candidate.json", "application/json", false),
		artifactRef(options.runRoot, "candidates/b/candidate.json", "application/json", false),
	];
	const terminal: RunTerminalV2A = {
		schema_version: "v2a-run-terminal-v1",
		manifest_id: manifest.manifest_id,
		run_id: options.runId,
		primary_attempt_id: primaryAttemptId,
		primary_verifier_status: "failed",
		outcome: selection.selected_candidate_id ? "recovery_selected" : "recovery_none",
		recovery_group_id: recoveryGroupId,
		recovery_seed_ref: seedRef,
		candidate_refs: candidateRefs,
		selection_ref: selectionRef,
		selected_candidate_id: selection.selected_candidate_id,
		real_call_counters: structuredClone(ZERO_REAL_CALL_COUNTERS_V2A),
	};
	writeOnceJson(options.runRoot, "terminal.json", terminal);
	appendJournal(options.runRoot, sequence, "run_terminal", { outcome: terminal.outcome, selected_candidate_id: terminal.selected_candidate_id });
	return terminal;
}
