import { appendFileSync, copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Skill } from "@earendil-works/pi-agent-core";
import type { ArtifactRefV0B, TaskSpecV0B, VerifierResultV0B } from "./contracts/v0b-types.ts";
import type {
	AttemptEvidenceV1B,
	BudgetUsageV1B,
	ExecutionCellV1B,
	ExecutionManifestV1B,
	FailureClassV1B,
	RunResultV1,
	TaskSpecV1,
	TerminalCellEvidenceV1B,
	VerifierStatusV1,
} from "./contracts/v1-types.ts";
import { writeOnceBytes, writeOnceJson } from "./evidence/artifacts.ts";
import { loadCandidateTaskPackV1 } from "./experiment/task-pack-v1.ts";
import { fileSha256, sha256, stableJson, treeDigest } from "./hash.ts";
import { createPiRunHandleV1, type FakeAttemptModeV1B, type PiAttemptSettlementV1B } from "./pi/pi-run-handle-v1.ts";
import { readProtectedBytes } from "./pi/tool-profile.ts";
import {
	createOneRunProviderAuthorityV1B,
	createPublicPiRunCompositionV1B,
	type OneRunProviderAuthorityV1B,
} from "./provider/fixed-provider-v1.ts";
import { expectedSkillIdentityV1, loadExactOneSkillV1 } from "./skill/runtime-v1.ts";
import { runExternalVerifierV0B } from "./verifier/runner.ts";
import { createTemporaryWorkspace } from "./workspace/temp-copy.ts";

export interface Stage1RealCallCountersV1B {
	credential_reads: 0;
	network_calls: 0;
	provider_calls: 0;
	model_calls: 0;
}

export const ZERO_REAL_CALL_COUNTERS_V1B: Stage1RealCallCountersV1B = Object.freeze({ credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 });

export interface ExecuteV1RunCellOptions {
	projectRoot: string;
	manifest: ExecutionManifestV1B;
	cell: ExecutionCellV1B;
	runRoot: string;
	pilotUsage: BudgetUsageV1B;
	fakeScenario?: { initial: FakeAttemptModeV1B; child: FakeAttemptModeV1B };
	realExecution?: { authority: OneRunProviderAuthorityV1B };
	deterministicInjection?: {
		kind: "infrastructure_invalid" | "evidence_invalid" | "treatment_guardrail_failure" | "global_budget_stop" | "unknown";
		cause_id: string;
	};
}

export interface ExecuteV1RunCellResult {
	run_result: RunResultV1;
	terminal: TerminalCellEvidenceV1B;
	run_root: string;
	real_call_counters: { credential_reads: number; network_calls: number; provider_calls: number; model_calls: number };
}

export class V1BTypedPauseError extends Error {
	readonly failureClass: "global_budget_stop" | "paused_unclassified";
	readonly causeId: string;
	constructor(failureClass: "global_budget_stop" | "paused_unclassified", causeId: string) {
		super("V1-B execution paused at a typed boundary"); this.name = "V1BTypedPauseError";
		this.failureClass = failureClass; this.causeId = causeId;
	}
}

function v0Task(task: TaskSpecV1): TaskSpecV0B {
	return {
		schema_version: 1, task_id: task.task_id, instruction_ref: task.instruction_ref, instruction_sha256: task.instruction_sha256,
		workspace_source_ref: task.workspace_source_ref, workspace_source_digest: task.workspace_source_digest, writable_paths: [...task.writable_paths], protected_paths: [...task.protected_paths],
		verifier_id: task.external_verifier_id, verifier_ref: task.external_verifier_ref, verifier_sha256: task.external_verifier_sha256, acceptance_visibility: "hidden_external", tool_profile_id: task.tool_profile_id,
		command_descriptors: structuredClone(task.command_descriptors), verifier_command: { executable: "current_node_executable", argv: [task.external_verifier_ref], cwd: "project", timeout_ms: 15_000, output_limit_bytes: 32_768 },
	};
}

function defaultScenario(cell: ExecutionCellV1B): { initial: FakeAttemptModeV1B; child: FakeAttemptModeV1B } {
	if (cell.arm === "C") {
		const mode = cell.block % 3;
		return mode === 1 ? { initial: "pass", child: "pass" } : mode === 2 ? { initial: "fail", child: "pass" } : { initial: "fail", child: "fail" };
	}
	return { initial: (cell.order_slot + cell.repetition) % 2 === 0 ? "pass" : "fail", child: "fail" };
}

function journal(runRoot: string, seq: { value: number }, type: string, data: unknown): void {
	appendFileSync(resolve(runRoot, "journal.jsonl"), `${stableJson({ schema_version: 1, seq: ++seq.value, timestamp: new Date().toISOString(), type, data })}\n`, "utf8");
}

async function verify(options: {
	projectRoot: string;
	runRoot: string;
	workspaceRoot: string;
	task: TaskSpecV1;
	attemptId: string;
	ordinal: 1 | 2;
	forcedStatus?: "invalid" | "infrastructure_error";
}): Promise<{ result: VerifierResultV0B; resultRef: ArtifactRefV0B; outputRef: ArtifactRefV0B }> {
	const prefix = `attempts/0${options.ordinal}-${options.attemptId}`;
	const verifierPath = resolve(options.runRoot, "config/verifier.mjs");
	const verifierRef = { path: "config/verifier.mjs", sha256: fileSha256(verifierPath), size_bytes: readFileSync(verifierPath).length, media_type: "text/javascript", truncated: false };
	let result = await runExternalVerifierV0B({ projectRoot: options.projectRoot, runRoot: options.runRoot, workspaceRoot: options.workspaceRoot, attemptId: options.attemptId, task: v0Task(options.task), verifierSnapshotPath: verifierPath, verifierSnapshotRef: verifierRef, outputPath: `${prefix}/verifier-output.txt`, workspaceEnvironmentKey: "V1_WORKSPACE" });
	if (options.forcedStatus) result = { ...result, status: options.forcedStatus, invalid_reason: "v1b_deterministic_typed_boundary", summary: "V1-B deterministic typed boundary injection" } as unknown as VerifierResultV0B;
	const resultRef = writeOnceJson(options.runRoot, `${prefix}/verifier-result.json`, result);
	return { result, resultRef, outputRef: result.full_output_ref };
}

function attemptEvidence(settlement: PiAttemptSettlementV1B, input: {
	ordinal: 1 | 2;
	parent: string | null;
	trigger: "initial" | "verification_recovery";
	sessionId: string;
	workspaceId: string;
	verifierStatus: VerifierStatusV1;
}): AttemptEvidenceV1B {
	return { attempt_id: settlement.attempt_id, ordinal: input.ordinal, parent_attempt_id: input.parent, trigger: input.trigger, session_id: input.sessionId, workspace_id: input.workspaceId, settled: true, provider_requests: settlement.provider_requests, tool_calls: settlement.tool_calls, tokens: settlement.tokens, cost_usd: settlement.cost_usd, active_execution_time_ms: settlement.wall_time_ms, verifier_status: input.verifierStatus };
}

function verifierDigest(manifest: ExecutionManifestV1B, taskId: string): string {
	const token = taskId.replace(/^v1-/, "");
	const id = Object.keys(manifest.bindings.verifier_digests).find((value) => value.includes(token));
	if (!id) throw new Error(`Verifier binding absent for ${taskId}`);
	return manifest.bindings.verifier_digests[id]!;
}

const FORBIDDEN_PERSISTED_EVIDENCE_V1B = /(?:"(?:authorization|proxy[_-]?authorization|reasoning(?:_content)?|thinking|thoughtsignature|signature)"\s*:|bearer\s+[A-Za-z0-9._-]+|FAKE_(?:SENSITIVE|RESOLVER|PROVIDER|FACTORY)[A-Za-z0-9_-]*)/i;

function assertSafeEvidenceBytes(label: string, bytes: Buffer | string): void {
	if (FORBIDDEN_PERSISTED_EVIDENCE_V1B.test(typeof bytes === "string" ? bytes : bytes.toString("utf8"))) throw new Error(`secret/reasoning scan rejected ${label}`);
}

function scanSafeArtifacts(runRoot: string, paths: string[], pending: Record<string, unknown>): { passed: true; match_count: 0; reasoning_payloads: 0 } {
	for (const path of paths) assertSafeEvidenceBytes(path, readFileSync(resolve(runRoot, path)));
	for (const [label, value] of Object.entries(pending)) assertSafeEvidenceBytes(label, `${stableJson(value)}\n`);
	return { passed: true, match_count: 0, reasoning_payloads: 0 };
}

function typedOutcome(finalStatus: VerifierStatusV1, injection: ExecuteV1RunCellOptions["deterministicInjection"]): {
	failureClass: FailureClassV1B;
	disposition: "terminal" | "invalid";
	causeId: string | null;
	attribution: "none" | "treatment" | "infrastructure" | "evidence";
	excluded: boolean;
} {
	if (injection?.kind === "treatment_guardrail_failure") return { failureClass: "treatment_guardrail_failure", disposition: "invalid", causeId: injection.cause_id, attribution: "treatment", excluded: false };
	if (injection?.kind === "infrastructure_invalid") return { failureClass: "infrastructure_invalid", disposition: "invalid", causeId: injection.cause_id, attribution: "infrastructure", excluded: true };
	if (injection?.kind === "evidence_invalid") return { failureClass: "evidence_invalid", disposition: "invalid", causeId: injection.cause_id, attribution: "evidence", excluded: true };
	if (finalStatus === "passed") return { failureClass: "task_pass", disposition: "terminal", causeId: null, attribution: "none", excluded: false };
	if (finalStatus === "failed") return { failureClass: "task_fail", disposition: "terminal", causeId: null, attribution: "none", excluded: false };
	return { failureClass: "evidence_invalid", disposition: "invalid", causeId: "verifier_evidence_invalid", attribution: "evidence", excluded: true };
}

export async function executeV1RunCell(options: ExecuteV1RunCellOptions): Promise<ExecuteV1RunCellResult> {
	const stage1 = options.manifest.execution_mode === "stage1_zero_call";
	if (stage1 === options.manifest.real_execution_authorized) throw new Error("Run execution mode/authority mismatch");
	if (!stage1 && !options.realExecution) throw new Error("real execution dependencies are unavailable");
	if (stage1 && options.realExecution) throw new Error("Stage 1 rejects real execution dependencies");
	if (options.deterministicInjection?.kind === "global_budget_stop") throw new V1BTypedPauseError("global_budget_stop", options.deterministicInjection.cause_id);
	if (options.deterministicInjection?.kind === "treatment_guardrail_failure" && options.cell.arm === "A") throw new V1BTypedPauseError("paused_unclassified", "treatment_attribution_not_proven");
	if (!options.manifest.cells.some((cell) => stableJson(cell) === stableJson(options.cell))) throw new Error("Run cell is not an exact Manifest member");
	mkdirSync(options.runRoot, { recursive: false });
	writeOnceBytes(options.runRoot, "journal.jsonl", "");
	const seq = { value: 0 };
	journal(options.runRoot, seq, "run_started", { manifest_id: options.manifest.manifest_id, cell_id: options.cell.cell_id, planned_run_id: options.cell.planned_run_id });
	const tasks = loadCandidateTaskPackV1(options.projectRoot);
	const task = tasks.find((value) => value.task_id === options.cell.task_id);
	if (!task) throw new Error(`Task absent for ${options.cell.cell_id}`);
	const loaded = await loadExactOneSkillV1({ projectRoot: options.projectRoot, skillRoot: "fixtures/skills/v1", expected: expectedSkillIdentityV1(options.projectRoot) });
	const instruction = readFileSync(resolve(options.projectRoot, task.instruction_ref), "utf8");
	const patch = readFileSync(resolve(options.projectRoot, task.reference_patch_ref), "utf8");
	writeOnceJson(options.runRoot, "config/cell.json", options.cell);
	writeOnceJson(options.runRoot, "config/manifest-ref.json", { manifest_id: options.manifest.manifest_id, workbench_source_digest: options.manifest.workbench_source_digest, pi_commit: options.manifest.pi_commit });
	writeOnceBytes(options.runRoot, "config/instruction.md", instruction);
	writeOnceBytes(options.runRoot, "config/verifier.mjs", readFileSync(resolve(options.projectRoot, task.external_verifier_ref)));
	const workspaceId = `${options.cell.planned_run_id}-workspace`;
	const workspaceRoot = resolve(options.runRoot, "workspace");
	createTemporaryWorkspace({ projectRoot: options.projectRoot, sourceRoot: resolve(options.projectRoot, task.workspace_source_ref), targetRoot: workspaceRoot, workspaceId, task });
	const protectedBefore = readProtectedBytes(workspaceRoot, task);
	journal(options.runRoot, seq, "workspace_materialized", { workspace_id: workspaceId, source_digest: task.workspace_source_digest });
	const runCaps = options.cell.arm === "C" ? options.manifest.budgets.arm_c_run : options.manifest.budgets.arm_a_or_b_run;
	const counters = { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 };
	const authority = stage1 ? createOneRunProviderAuthorityV1B({ authorized: true, resolver: { resolve: async () => { throw new Error("Stage 1 must not resolve credentials"); } } }) : options.realExecution!.authority;
	const handle = createPublicPiRunCompositionV1B({ authority, factory: { create: (access) => createPiRunHandleV1({ mode: stage1 ? "stage1_fake" : "stage2_real", workspaceRoot, task, skill: loaded.skill, access, attemptCaps: options.manifest.budgets.initial_attempt, runCaps, pilotCaps: options.manifest.budgets.pilot, pilotUsage: options.pilotUsage, realCallCounters: counters, workspaceId }) } });
	const scenario = options.fakeScenario ?? defaultScenario(options.cell);
	const initialAttemptId = `${options.cell.planned_run_id}-a1`;
	const attempts: AttemptEvidenceV1B[] = [];
	const artifactPaths = ["config/cell.json", "config/manifest-ref.json", "config/instruction.md", "config/verifier.mjs", "journal.jsonl"];
	let initial: PiAttemptSettlementV1B;
	let initialVerifier: Awaited<ReturnType<typeof verify>>;
	let finalStatus: VerifierStatusV1;
	let recoveryStarted = false;
	let childSettlement: PiAttemptSettlementV1B | null = null;
	try {
		journal(options.runRoot, seq, "attempt_started", { attempt_id: initialAttemptId, ordinal: 1, parent_attempt_id: null });
		initial = await handle.runAttempt({ attemptId: initialAttemptId, prompt: instruction, invocation: options.cell.arm === "A" ? "prompt" : "skill", ...(stage1 ? { fakeMode: scenario.initial, fakePatch: patch } : {}) });
		journal(options.runRoot, seq, "attempt_settled", { attempt_id: initialAttemptId, provider_requests: initial.provider_requests, tool_calls: initial.tool_calls });
		handle.reserveVerifier();
		const forcedStatus = options.deterministicInjection?.kind === "infrastructure_invalid" ? "infrastructure_error" : ["evidence_invalid", "treatment_guardrail_failure"].includes(options.deterministicInjection?.kind ?? "") ? "invalid" : undefined;
		initialVerifier = await verify({ projectRoot: options.projectRoot, runRoot: options.runRoot, workspaceRoot, task, attemptId: initialAttemptId, ordinal: 1, ...(forcedStatus ? { forcedStatus } : {}) });
		artifactPaths.push(initialVerifier.resultRef.path, initialVerifier.outputRef.path);
		finalStatus = initialVerifier.result.status;
		attempts.push(attemptEvidence(initial, { ordinal: 1, parent: null, trigger: "initial", sessionId: handle.sessionId, workspaceId, verifierStatus: finalStatus }));
		journal(options.runRoot, seq, "verifier_completed", { attempt_id: initialAttemptId, status: finalStatus });
		if (options.deterministicInjection?.kind === "unknown") throw new V1BTypedPauseError("paused_unclassified", options.deterministicInjection.cause_id);
		const eligible = options.cell.arm === "C" && finalStatus === "failed";
		if (eligible) {
			handle.reserveChild();
			recoveryStarted = true;
			const packet = { schema_version: 1, parent_attempt_id: initialAttemptId, verifier_id: task.external_verifier_id, status: "failed", summary: initialVerifier.result.summary, failed_checks: initialVerifier.result.public_failed_checks ?? [] };
			const packetRef = writeOnceJson(options.runRoot, "recovery/failure-packet.json", packet); artifactPaths.push(packetRef.path);
			const childAttemptId = `${options.cell.planned_run_id}-a2`;
			journal(options.runRoot, seq, "attempt_started", { attempt_id: childAttemptId, ordinal: 2, parent_attempt_id: initialAttemptId, failure_packet_ref: packetRef.path });
			const child = await handle.runAttempt({ attemptId: childAttemptId, prompt: `External verifier failed. Repair only the bounded task.\n${initialVerifier.result.summary}`, invocation: "prompt", ...(stage1 ? { fakeMode: scenario.child, fakePatch: patch } : {}) });
			childSettlement = child;
			journal(options.runRoot, seq, "attempt_settled", { attempt_id: childAttemptId, provider_requests: child.provider_requests, tool_calls: child.tool_calls });
			handle.reserveVerifier();
			const childVerifier = await verify({ projectRoot: options.projectRoot, runRoot: options.runRoot, workspaceRoot, task, attemptId: childAttemptId, ordinal: 2 });
			artifactPaths.push(childVerifier.resultRef.path, childVerifier.outputRef.path);
			finalStatus = childVerifier.result.status;
			attempts.push(attemptEvidence(child, { ordinal: 2, parent: initialAttemptId, trigger: "verification_recovery", sessionId: handle.sessionId, workspaceId, verifierStatus: finalStatus }));
			journal(options.runRoot, seq, "verifier_completed", { attempt_id: childAttemptId, status: finalStatus });
		}
		const protectedAfter = readProtectedBytes(workspaceRoot, task);
		const protectedUnchanged = task.protected_paths.every((path) => protectedAfter[path] === protectedBefore[path]);
		if (!protectedUnchanged) throw new Error("protected Task path changed");
		const usage = handle.usage().run;
		const reservations = [
			...initial.reservations,
			...(childSettlement?.reservations ?? []),
			...handle.takeReservations(),
		];
		const outcome = typedOutcome(finalStatus, options.deterministicInjection);
		const runResult: RunResultV1 = {
			run_id: options.cell.planned_run_id, task_id: options.cell.task_id, repetition: options.cell.repetition, order_slot: options.cell.order_slot, strategy_id: options.cell.strategy_id, disposition: "required_terminal", pause_reason: null,
			experiment_id: options.manifest.experiment_id, manifest_id: options.manifest.manifest_id, terminal: true, verifier_status: finalStatus, attempt_count: attempts.length as 1 | 2, child_attempt_count: (attempts.length - 1) as 0 | 1,
			evidence: { task_digest: options.manifest.bindings.task_digests[task.task_id]!, workspace_source_digest: task.workspace_source_digest, prompt_digest: options.manifest.bindings.base_prompt_digest, skill_digest: options.cell.arm === "A" ? null : options.manifest.bindings.skill_digest, strategy_digest: options.manifest.bindings.strategy_digests[options.cell.strategy_id], tool_digest: options.manifest.bindings.tool_profile_digest, verifier_digest: verifierDigest(options.manifest, task.task_id), model_profile_digest: options.manifest.bindings.model_profile_digest, workbench_digest: options.manifest.workbench_source_digest, pi_digest: options.manifest.pi_commit, initial_payload_digest: initial.initial_dispatch.payload_sha256, skill_wrapper_bytes: options.cell.arm === "A" ? 0 : loaded.ref.wrapper_size_bytes, skill_body_bytes: options.cell.arm === "A" ? 0 : loaded.ref.source_size_bytes, attempts: attempts.map((attempt) => ({ attempt_id: attempt.attempt_id, ordinal: attempt.ordinal, parent_attempt_id: attempt.parent_attempt_id })), session_id: handle.sessionId, workspace_id: workspaceId, initial_verifier_status: initialVerifier.result.status, final_verifier_status: finalStatus, recovery_eligible: eligible, recovery_budget_available: eligible, recovery_started: recoveryStarted, provider_requests: usage.provider_requests, tool_calls: usage.tool_calls, tokens: usage.tokens, wall_time_ms: usage.active_execution_time_ms, cost_usd: usage.cost_usd, invalid_attribution: outcome.attribution, exclusion_preauthorized: outcome.excluded, terminal_refs: ["terminal.json"] },
		};
		journal(options.runRoot, seq, outcome.disposition === "terminal" ? "run_terminal" : "run_invalid", { status: finalStatus, failure_class: outcome.failureClass, cause_id: outcome.causeId });
		scanSafeArtifacts(options.runRoot, artifactPaths, { "run-result.json": runResult });
		const runResultRef = writeOnceJson(options.runRoot, "run-result.json", runResult); artifactPaths.push(runResultRef.path);
		const scan = scanSafeArtifacts(options.runRoot, artifactPaths, {});
		const scanRef = writeOnceJson(options.runRoot, "secret-scan.json", scan); artifactPaths.push(scanRef.path);
		const refs = artifactPaths.map((path) => { const bytes = readFileSync(resolve(options.runRoot, path)); return { path, sha256: fileSha256(resolve(options.runRoot, path)), size_bytes: bytes.length }; });
		const terminal: TerminalCellEvidenceV1B = { schema_version: 1, manifest_id: options.manifest.manifest_id, cell: options.cell, run_id: options.cell.planned_run_id, session_id: handle.sessionId, workspace_id: workspaceId, disposition: outcome.disposition, failure_class: outcome.failureClass, cause_id: outcome.causeId, invalid_attribution: outcome.attribution, exclusion_preauthorized: outcome.excluded, initial_dispatch: initial.initial_dispatch, attempts, initial_verifier_status: initialVerifier.result.status, final_verifier_status: finalStatus, recovery_eligible: eligible, recovery_started: recoveryStarted, budget_usage: usage, reservations, protected_paths_unchanged: true, secret_scan: scan, real_call_counters: counters, artifact_refs: refs, created_at: new Date().toISOString() };
		scanSafeArtifacts(options.runRoot, artifactPaths, { "terminal-evidence.json": terminal });
		const terminalEvidenceRef = writeOnceJson(options.runRoot, "terminal-evidence.json", terminal);
		const terminalMarker = { schema_version: 1, manifest_id: options.manifest.manifest_id, cell_id: options.cell.cell_id, planned_run_id: options.cell.planned_run_id, disposition: outcome.disposition, failure_class: outcome.failureClass, cause_id: outcome.causeId, run_result_ref: runResultRef, terminal_evidence_ref: terminalEvidenceRef, final_workspace_digest: treeDigest(workspaceRoot) };
		scanSafeArtifacts(options.runRoot, artifactPaths, { "terminal-evidence.json": terminal, "terminal.json": terminalMarker });
		writeOnceJson(options.runRoot, "terminal.json", terminalMarker);
		if (stage1 && stableJson(counters) !== stableJson(ZERO_REAL_CALL_COUNTERS_V1B)) throw new Error("Stage 1 real-call counter changed");
		return { run_result: runResult, terminal, run_root: options.runRoot, real_call_counters: counters };
	} finally {
		await handle.close();
	}
}
