import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { ExecutionManifestV1B, LocalBudgetStopSignalV1C, RunResultV1, TerminalCellEvidenceV1B } from "../src/contracts/v1-types.ts";
import { buildExecutionManifestV1B, buildFullPilotExecutionManifestV1C, buildRealCanaryExecutionManifestV1C, buildStage1ExecutionManifestV1C, v1bManifestIdentity, validateExecutionManifestV1B } from "../src/experiment/v1.ts";
import { fileSha256, sha256, stableJson } from "../src/hash.ts";
import { aggregatePilotV1B, inspectV1RunCell } from "../src/inspect-v1.ts";
import { initializePilotV1B, readPilotLedgerV1B, runNextPilotCellV1B } from "../src/pilot-v1.ts";
import { createPiRunHandleV1, emptyBudgetUsageV1B } from "../src/pi/pi-run-handle-v1.ts";
import { createOneRunProviderAuthorityV1B, createPublicPiRunCompositionV1B, FixedProviderBoundaryErrorV1B, V1BPauseBoundaryError } from "../src/provider/fixed-provider-v1.ts";
import { preflightV1B, runNextV1B } from "../src/product-surface-v1.ts";
import { V1BTypedPauseError } from "../src/run-v1.ts";
import { expectedSkillIdentityV1, loadExactOneSkillV1 } from "../src/skill/runtime-v1.ts";
import { loadCandidateTaskPackV1 } from "../src/experiment/task-pack-v1.ts";
import { PROJECT_ROOT } from "./helpers.ts";

function root(label: string): string {
	const value = resolve(PROJECT_ROOT, ".runs/v1-c/stage1/tests", `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	mkdirSync(resolve(value, ".."), { recursive: true });
	return value;
}

function writeStable(path: string, value: unknown): void { writeFileSync(path, `${stableJson(value)}\n`, "utf8"); }

async function runFirstV1C() {
	const manifest = buildStage1ExecutionManifestV1C(PROJECT_ROOT, { initialProviderRequestsMax: 1 });
	const pilotRoot = root("pilot");
	initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot, manifest });
	const execution = runNextPilotCellV1B({
		projectRoot: PROJECT_ROOT,
		pilotRoot,
	});
	return { manifest, pilotRoot, result: await execution };
}

function diagnosticCopies(terminal: TerminalCellEvidenceV1B, runResult: RunResultV1): LocalBudgetStopSignalV1C[] {
	return [
		...(terminal.runtime_diagnostics ?? []),
		...terminal.attempts.flatMap((attempt) => attempt.runtime_diagnostics ?? []),
		...(runResult.evidence.runtime_diagnostics ?? []),
	];
}

function coherentDiagnosticRewrite(pilotRoot: string, manifest: ExecutionManifestV1B, mutate: (input: { terminal: TerminalCellEvidenceV1B; runResult: RunResultV1; signals: LocalBudgetStopSignalV1C[]; events: Array<{ schema_version: number; seq: number; timestamp: string; type: string; data: Record<string, unknown> }> }) => void): void {
	const cell = manifest.cells[0]!;
	const runRoot = resolve(pilotRoot, "runs", cell.planned_run_id);
	const markerPath = resolve(runRoot, "terminal.json");
	const marker = JSON.parse(readFileSync(markerPath, "utf8")) as Record<string, any>;
	const terminalPath = resolve(runRoot, marker.terminal_evidence_ref.path as string);
	const runResultPath = resolve(runRoot, marker.run_result_ref.path as string);
	const journalPath = resolve(runRoot, "journal.jsonl");
	const terminal = JSON.parse(readFileSync(terminalPath, "utf8")) as TerminalCellEvidenceV1B;
	const runResult = JSON.parse(readFileSync(runResultPath, "utf8")) as RunResultV1;
	const events = readFileSync(journalPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
	mutate({ terminal, runResult, signals: diagnosticCopies(terminal, runResult), events });
	events.forEach((event, index) => { event.seq = index + 1; });
	writeFileSync(journalPath, `${events.map(stableJson).join("\n")}\n`, "utf8");
	writeStable(runResultPath, runResult);
	for (const ref of terminal.artifact_refs) {
		const bytes = readFileSync(resolve(runRoot, ref.path));
		ref.sha256 = sha256(bytes); ref.size_bytes = bytes.length;
	}
	writeStable(terminalPath, terminal);
	marker.run_result_ref.sha256 = fileSha256(runResultPath); marker.run_result_ref.size_bytes = readFileSync(runResultPath).length;
	marker.terminal_evidence_ref.sha256 = fileSha256(terminalPath); marker.terminal_evidence_ref.size_bytes = readFileSync(terminalPath).length;
	writeStable(markerPath, marker);
}

test("V1-C Gate B tracks the legacy one-response then pre-dispatch cap misclassification", async () => {
	const manifest = buildExecutionManifestV1B(PROJECT_ROOT);
	const task = loadCandidateTaskPackV1(PROJECT_ROOT)[0]!;
	const { skill } = await loadExactOneSkillV1({ projectRoot: PROJECT_ROOT, skillRoot: "fixtures/skills/v1", expected: expectedSkillIdentityV1(PROJECT_ROOT) });
	const workspaceRoot = root("legacy-reproduction-workspace");
	cpSync(resolve(PROJECT_ROOT, task.workspace_source_ref), workspaceRoot, { recursive: true });
	const caps = { ...manifest.budgets.initial_attempt, provider_requests: 1 };
	const authority = createOneRunProviderAuthorityV1B({ authorized: true, resolver: { resolve: async () => "unused" } });
	const handle = createPublicPiRunCompositionV1B({ authority, factory: { create: (access) => createPiRunHandleV1({ mode: "stage1_fake", workspaceRoot, task, skill, access, attemptCaps: caps, runCaps: { ...manifest.budgets.arm_a_or_b_run, provider_requests: 1 }, pilotCaps: manifest.budgets.pilot, pilotUsage: emptyBudgetUsageV1B(), realCallCounters: { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 }, runId: "legacy-reproduction-run", workspaceId: "legacy-reproduction-workspace" }) } });
	await assert.rejects(() => handle.runAttempt({ attemptId: "legacy-reproduction-a1", prompt: readFileSync(resolve(PROJECT_ROOT, task.instruction_ref), "utf8"), invocation: "prompt", fakeMode: "pass", fakePatch: readFileSync(resolve(PROJECT_ROOT, task.reference_patch_ref), "utf8") }), (error: Error) => error instanceof V1BPauseBoundaryError && error.pause.phase === "invalid_or_unknown_usage_after_provider_response" && error.pause.request_ordinal === 1 && error.pause.pending_provider_reservation === null);
	const legacyUsage = handle.usage().run;
	assert.equal(legacyUsage.provider_requests, 1); assert.equal(legacyUsage.tool_calls, 1); assert.ok(legacyUsage.tokens > 0); assert.equal(legacyUsage.cost_usd, 0);
	await handle.close();
});

test("V1-C Gates C/D terminalize a typed cap stop after settled and common Verifier pass", async () => {
	const { manifest, pilotRoot, result } = await runFirstV1C();
	assert.ok(result);
	assert.equal(result.terminal.failure_class, "task_pass");
	assert.equal(result.terminal.final_verifier_status, "passed");
	assert.equal(result.terminal.budget_usage.provider_requests, 1);
	assert.equal(result.terminal.reservations.filter((record) => record.level === "run" && record.kind === "provider_request").length, 1);
	assert.deepEqual(result.real_call_counters, { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 });
	assert.equal(result.terminal.runtime_diagnostics?.length, 1);
	const signal = result.terminal.runtime_diagnostics![0]!;
	assert.deepEqual({ run: signal.run_id, ordinal: signal.request_ordinal, before: signal.reservation_transition.provider_requests_before, pending: signal.reservation_transition.pending_after }, { run: manifest.cells[0]!.planned_run_id, ordinal: 2, before: 1, pending: false });
	const events = readFileSync(resolve(pilotRoot, "runs", manifest.cells[0]!.planned_run_id, "journal.jsonl"), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
	assert.deepEqual(events.filter((event) => ["local_budget_stop_recorded", "local_budget_stop_consumed", "attempt_settled", "verifier_completed"].includes(event.type)).map((event) => event.type), ["local_budget_stop_recorded", "local_budget_stop_consumed", "attempt_settled", "verifier_completed"]);
	const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot, plannedRunId: manifest.cells[0]!.planned_run_id });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspected.terminal_valid, true); assert.equal(inspected.comparable, true);
});

test("V1-C Gate D keeps runtime diagnostic separate from a common Verifier failure Outcome", async () => {
	const manifest = buildStage1ExecutionManifestV1C(PROJECT_ROOT, { initialProviderRequestsMax: 1 });
	const pilotRoot = root("verifier-fail"); initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot, manifest });
	const result = await runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot, fakeScenario: { initial: "pass", child: "fail", initialPatch: "export function parseDuration(): number { return 0; }\n" } });
	assert.ok(result); assert.equal(result.terminal.failure_class, "task_fail"); assert.equal(result.terminal.final_verifier_status, "failed");
	assert.equal(result.terminal.runtime_diagnostics?.[0]?.reason, "provider_request_cap"); assert.equal(result.terminal.recovery_started, false);
	const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot, plannedRunId: manifest.cells[0]!.planned_run_id });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
});

test("V1-C Gate E preserves a genuine later-request pending reservation and full conservative charge", async () => {
	const manifest = buildStage1ExecutionManifestV1C(PROJECT_ROOT, { initialProviderRequestsMax: 8 });
	const pilotRoot = root("later-unknown"); initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot, manifest });
	await assert.rejects(() => runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot, deterministicPausePhase: "after_provider_request_reservation_usage_unavailable", deterministicPauseRequestOrdinal: 2 }), V1BTypedPauseError);
	const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot, plannedRunId: manifest.cells[0]!.planned_run_id });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspected.pause_integrity_valid, true); assert.equal(inspected.terminal_valid, false); assert.equal(inspected.comparable, false);
	const pause = inspected.pause_evidence!;
	assert.equal(pause.request_ordinal, 2); assert.equal(pause.accumulated_known_usage.provider_requests, 1); assert.equal(pause.pending_provider_reservation?.provider_requests, 1);
	assert.equal(pause.conservative_usage_charge.tokens, pause.pending_provider_reservation?.tokens); assert.equal(pause.conservative_usage_charge.cost_usd, pause.pending_provider_reservation?.cost_usd);
	assert.equal(pause.budget_usage_after_conservative_charge.provider_requests, 2);
	assert.deepEqual(pause.counter_snapshot, { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 });
	const events = readFileSync(resolve(pilotRoot, "runs", manifest.cells[0]!.planned_run_id, "journal.jsonl"), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
	assert.deepEqual(events.filter((event) => ["provider_request_reserved", "provider_usage_committed", "attempt_paused"].includes(event.type)).map((event) => [event.type, event.data.request_ordinal ?? null]), [["provider_request_reserved", 1], ["provider_usage_committed", 1], ["provider_request_reserved", 2], ["attempt_paused", null]]);
	assert.equal(events.some((event) => event.type === "verifier_completed"), false);
	assert.deepEqual(readPilotLedgerV1B(pilotRoot).filter((entry) => entry.state !== "planned").map((entry) => entry.state), ["started", "paused"]);
	const missingPending = root("later-unknown-missing-pending"); cpSync(pilotRoot, missingPending, { recursive: true });
	const runRoot = resolve(missingPending, "runs", manifest.cells[0]!.planned_run_id); const pausePath = resolve(runRoot, "pause-evidence.json"); const journalPath = resolve(runRoot, "journal.jsonl"); const ledgerPath = resolve(missingPending, "ledger.jsonl");
	const drift = JSON.parse(readFileSync(pausePath, "utf8")); drift.pending_provider_reservation = null; drift.conservative_usage_charge = emptyBudgetUsageV1B(); drift.budget_usage_after_conservative_charge = structuredClone(drift.accumulated_known_usage); writeStable(pausePath, drift);
	const driftEvents = readFileSync(journalPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)); driftEvents.at(-1).data.pause_evidence_ref = { path: "pause-evidence.json", sha256: fileSha256(pausePath), size_bytes: readFileSync(pausePath).length }; writeFileSync(journalPath, `${driftEvents.map(stableJson).join("\n")}\n`, "utf8");
	const driftLedger = readFileSync(ledgerPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)); driftLedger.at(-1).pause_evidence_ref = driftEvents.at(-1).data.pause_evidence_ref; driftLedger.at(-1).journal_sha256 = fileSha256(journalPath); writeFileSync(ledgerPath, `${driftLedger.map(stableJson).join("\n")}\n`, "utf8");
	const rejected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: missingPending, plannedRunId: manifest.cells[0]!.planned_run_id }); assert.equal(rejected.integrity_valid, false); assert.match(rejected.errors.join("; "), /pending|reservation|commit count/);
});

test("V1-C Gate F rejects duplicate, wrong-Run, wrong-ordinal, reordered and forged typed stops", async () => {
	const source = await runFirstV1C();
	const mutations: Array<[string, (input: { terminal: TerminalCellEvidenceV1B; runResult: RunResultV1; signals: LocalBudgetStopSignalV1C[]; events: Array<{ type: string; data: Record<string, any> }> }) => void]> = [
		["wrong-run", ({ signals, events }) => { for (const signal of signals) signal.run_id = "forged-run"; for (const event of events.filter((value) => value.type.startsWith("local_budget_stop_"))) event.data.run_id = "forged-run"; }],
		["wrong-ordinal", ({ signals, events }) => { for (const signal of signals) { signal.request_ordinal = 3; signal.reservation_transition.provider_requests_before = 2; signal.reservation_transition.provider_requests_requested_after = 3; } for (const event of events.filter((value) => value.type.startsWith("local_budget_stop_"))) { event.data.request_ordinal = 3; (event.data.reservation_transition as Record<string, unknown>).provider_requests_before = 2; (event.data.reservation_transition as Record<string, unknown>).provider_requests_requested_after = 3; } }],
		["duplicate", ({ events }) => { const consumed = events.find((event) => event.type === "local_budget_stop_consumed")!; events.splice(events.indexOf(consumed) + 1, 0, structuredClone(consumed)); }],
		["reordered", ({ events }) => { const recorded = events.findIndex((event) => event.type === "local_budget_stop_recorded"); const consumed = events.findIndex((event) => event.type === "local_budget_stop_consumed"); [events[recorded], events[consumed]] = [events[consumed]!, events[recorded]!]; }],
		["forged-phase", ({ signals, events }) => { for (const signal of signals) signal.phase = "forged" as LocalBudgetStopSignalV1C["phase"]; for (const event of events.filter((value) => value.type.startsWith("local_budget_stop_"))) event.data.phase = "forged"; }],
		["request-counter", ({ terminal, runResult }) => { terminal.budget_usage.provider_requests++; runResult.evidence.provider_requests++; }],
		["tool-counter", ({ terminal, runResult }) => { terminal.budget_usage.tool_calls++; runResult.evidence.tool_calls++; }],
		["token-counter", ({ terminal, runResult }) => { terminal.budget_usage.tokens++; runResult.evidence.tokens = Number(runResult.evidence.tokens) + 1; }],
		["cost-counter", ({ terminal, runResult }) => { terminal.budget_usage.cost_usd += 0.001; runResult.evidence.cost_usd += 0.001; }],
	];
	for (const [label, mutate] of mutations) {
		const copy = root(`tamper-${label}`); cpSync(source.pilotRoot, copy, { recursive: true }); coherentDiagnosticRewrite(copy, source.manifest, mutate);
		const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: copy, plannedRunId: source.manifest.cells[0]!.planned_run_id });
		assert.equal(inspected.integrity_valid, false, label);
	}
});

test("V1-C Gate G preserves A/B/C payload fairness, common Verifier and C-only recovery eligibility", async () => {
	const manifest = buildStage1ExecutionManifestV1C(PROJECT_ROOT, { initialProviderRequestsMax: 1 });
	const pilotRoot = root("fairness"); initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot, manifest });
	await runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot });
	await runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot });
	const c = await runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot, fakeScenario: { initial: "pass", child: "pass", initialPatch: "export function parseDuration(): number { return 0; }\n" } });
	assert.ok(c); assert.equal(c.terminal.cell.arm, "C"); assert.equal(c.terminal.initial_verifier_status, "failed"); assert.equal(c.terminal.final_verifier_status, "passed"); assert.equal(c.terminal.recovery_eligible, true); assert.equal(c.terminal.recovery_started, true); assert.equal(c.terminal.attempts.length, 2);
	const aggregate = aggregatePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot });
	assert.deepEqual(aggregate.fairness, { blocks_checked: 1, bc_initial_byte_equal: true, ab_only_skill_delta: true });
	for (const cell of manifest.cells.slice(0, 3)) {
		const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot, plannedRunId: cell.planned_run_id });
		assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
		assert.ok(inspected.terminal!.attempts.every((attempt) => attempt.verifier_status === "passed" || attempt.verifier_status === "failed"));
		assert.deepEqual(inspected.terminal!.real_call_counters, { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 });
	}
});

test("V1-C Gate F keeps the V1-B historical protocol identity and conclusion boundary separate", () => {
	const historical = buildExecutionManifestV1B(PROJECT_ROOT);
	const corrected = buildStage1ExecutionManifestV1C(PROJECT_ROOT);
	assert.doesNotThrow(() => validateExecutionManifestV1B(historical, PROJECT_ROOT));
	assert.doesNotThrow(() => validateExecutionManifestV1B(corrected, PROJECT_ROOT));
	assert.deepEqual({ schema: historical.schema_version, experiment: historical.experiment_id, protocol: historical.protocol_id, v1c: historical.v1c_revision ?? null }, { schema: "v1b-execution-manifest-v1", experiment: "v1-b-bounded-pilot", protocol: "v1_skill_runtime_comparison", v1c: null });
	assert.deepEqual({ schema: corrected.schema_version, experiment: corrected.experiment_id, protocol: corrected.protocol_id, role: corrected.identity_role, canary: corrected.v1c_revision?.canary_or_pilot_identity }, { schema: "v1c-execution-manifest-v1", experiment: "v1-c-stage1-deterministic-template", protocol: "v1c_budget_stop_correction", role: "stage1_template", canary: false });
	const mixedIdentity = structuredClone(corrected); (mixedIdentity.v1c_revision as { kind: string }).kind = "canary_plus_full_pilot"; mixedIdentity.manifest_id = sha256(stableJson({ ...mixedIdentity, manifest_id: "" }));
	assert.throws(() => validateExecutionManifestV1B(mixedIdentity, PROJECT_ROOT), /Manifest|metadata|binding drift/);
});

const TEST_EXECUTION_BASELINE_COMMIT = "1111111111111111111111111111111111111111";

test("V1-C MR-001 constructs and completely validates isolated Stage 1, real Canary and full Pilot identities", () => {
	const stage1 = buildStage1ExecutionManifestV1C(PROJECT_ROOT);
	const canary = buildRealCanaryExecutionManifestV1C(PROJECT_ROOT, { executionBaselineCommit: TEST_EXECUTION_BASELINE_COMMIT });
	const pilot = buildFullPilotExecutionManifestV1C(PROJECT_ROOT, { executionBaselineCommit: TEST_EXECUTION_BASELINE_COMMIT });
	for (const manifest of [stage1, canary, pilot]) assert.doesNotThrow(() => validateExecutionManifestV1B(manifest, PROJECT_ROOT));
	assert.deepEqual({ experiment: canary.experiment_id, role: canary.identity_role, mode: canary.execution_mode, real: canary.real_execution_authorized, cells: canary.cells.length }, { experiment: "v1-c-real-canary", role: "real_canary", mode: "stage2_real", real: true, cells: 1 });
	assert.deepEqual(canary.cells[0], { cell_id: "v1c-canary-cell-01", planned_run_id: "v1c-canary-run-01-parse-duration-r1-a", task_id: "v1-parse-duration", repetition: 1, order_slot: 1, block: 1, block_slot: 1, arm: "A", strategy_id: "baseline" });
	assert.deepEqual(canary.budgets.initial_attempt, { provider_requests: 8, tool_calls: 12, tokens: 65_536, wall_time_ms: 300_000, cost_usd: 0.10, verifier_runs: 1, child_attempts: 0 });
	assert.deepEqual(canary.budgets.pilot, canary.budgets.initial_attempt);
	assert.deepEqual({ experiment: pilot.experiment_id, role: pilot.identity_role, mode: pilot.execution_mode, real: pilot.real_execution_authorized, cells: pilot.cells.length, cost: pilot.budgets.pilot.cost_usd, children: pilot.budgets.pilot.child_attempts }, { experiment: "v1-c-bounded-pilot", role: "full_pilot", mode: "stage2_real", real: true, cells: 24, cost: 1.90, children: 8 });
	assert.ok(pilot.cells.every((cell) => cell.cell_id.startsWith("v1c-full-pilot-cell-") && cell.planned_run_id.startsWith("v1c-full-pilot-run-")));
	assert.equal(new Set([...stage1.cells, ...canary.cells, ...pilot.cells].flatMap((cell) => [cell.cell_id, cell.planned_run_id])).size, (stage1.cells.length + canary.cells.length + pilot.cells.length) * 2);
});

test("V1-C MR-001 rejects rehashed identity, membership, namespace, budget and Execution Baseline hybrids", () => {
	const stage1 = buildStage1ExecutionManifestV1C(PROJECT_ROOT);
	const canary = buildRealCanaryExecutionManifestV1C(PROJECT_ROOT, { executionBaselineCommit: TEST_EXECUTION_BASELINE_COMMIT });
	const pilot = buildFullPilotExecutionManifestV1C(PROJECT_ROOT, { executionBaselineCommit: TEST_EXECUTION_BASELINE_COMMIT });
	const mutations: Array<[string, ExecutionManifestV1B, (manifest: ExecutionManifestV1B) => void]> = [
		["stage1-real-mode", stage1, (manifest) => { manifest.execution_mode = "stage2_real"; manifest.real_execution_authorized = true; }],
		["canary-v1b-schema", canary, (manifest) => { manifest.schema_version = "v1b-execution-manifest-v1"; }],
		["canary-role-pilot", canary, (manifest) => { manifest.identity_role = "full_pilot"; }],
		["canary-real-authority", canary, (manifest) => { manifest.real_execution_authorized = false; }],
		["canary-protocol", canary, (manifest) => { manifest.protocol_id = "v1_skill_runtime_comparison"; }],
		["pilot-experiment-canary", pilot, (manifest) => { manifest.experiment_id = "v1-c-real-canary"; }],
		["canary-pilot-membership", canary, (manifest) => { manifest.cells = structuredClone(pilot.cells); }],
		["pilot-canary-membership", pilot, (manifest) => { manifest.cells = structuredClone(canary.cells); }],
		["canary-pilot-budget", canary, (manifest) => { manifest.budgets = structuredClone(pilot.budgets); }],
		["pilot-canary-budget", pilot, (manifest) => { manifest.budgets = structuredClone(canary.budgets); }],
		["canary-stage1-namespace", canary, (manifest) => { manifest.cells[0]!.cell_id = stage1.cells[0]!.cell_id; }],
		["pilot-canary-namespace", pilot, (manifest) => { manifest.cells[0]!.planned_run_id = canary.cells[0]!.planned_run_id; }],
		["pilot-source-digest", pilot, (manifest) => { manifest.workbench_source_digest = "0".repeat(64); }],
		["canary-zero-baseline", canary, (manifest) => { manifest.execution_baseline_commit = "0".repeat(40); }],
		["pilot-malformed-baseline", pilot, (manifest) => { manifest.execution_baseline_commit = "test-only"; }],
	];
	for (const [label, source, mutate] of mutations) {
		const drift = structuredClone(source); mutate(drift); drift.manifest_id = v1bManifestIdentity(drift);
		assert.throws(() => validateExecutionManifestV1B(drift, PROJECT_ROOT), /V1-C|Manifest|Baseline/, label);
	}
	assert.throws(() => buildRealCanaryExecutionManifestV1C(PROJECT_ROOT, { executionBaselineCommit: "0".repeat(40) }), /Baseline/);
	assert.throws(() => buildFullPilotExecutionManifestV1C(PROJECT_ROOT, { executionBaselineCommit: "not-a-commit" }), /Baseline/);
});

test("V1-C MR-001 public surface preflights future real identities and fails closed before side effects", async () => {
	const manifests = [
		buildRealCanaryExecutionManifestV1C(PROJECT_ROOT, { executionBaselineCommit: TEST_EXECUTION_BASELINE_COMMIT }),
		buildFullPilotExecutionManifestV1C(PROJECT_ROOT, { executionBaselineCommit: TEST_EXECUTION_BASELINE_COMMIT }),
	];
	for (const manifest of manifests) {
		const manifestPath = `${root(`mr001-${manifest.identity_role}-manifest`)}.json`;
		const pilotRoot = root(`mr001-${manifest.identity_role}-pilot`);
		writeStable(manifestPath, manifest);
		const preflight = preflightV1B({ projectRoot: PROJECT_ROOT, manifestPath, pilotRoot });
		assert.equal(preflight.manifest_id, manifest.manifest_id);
		assert.equal(preflight.next_cell_id, manifest.cells[0]!.cell_id);
		assert.deepEqual(preflight.real_call_counters, { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 });
		assert.equal(existsSync(pilotRoot), false);
		await assert.rejects(() => runNextV1B({ projectRoot: PROJECT_ROOT, manifestPath, pilotRoot }), FixedProviderBoundaryErrorV1B);
		assert.equal(existsSync(pilotRoot), false);
	}
	const stage1 = buildStage1ExecutionManifestV1C(PROJECT_ROOT);
	const stage1ManifestPath = `${root("mr001-stage1-manifest")}.json`;
	const stage1PilotRoot = root("mr001-stage1-pilot");
	writeStable(stage1ManifestPath, stage1);
	let credentialReads = 0;
	await assert.rejects(() => runNextV1B({ projectRoot: PROJECT_ROOT, manifestPath: stage1ManifestPath, pilotRoot: stage1PilotRoot, stage2ExecutionAuthority: { authority_id: "v1b-public-pi-one-run", credential_profile_name: "DEEPSEEK_API_KEY", authorized: true, resolver: { resolve: async () => { credentialReads++; return "unused"; } } } }), FixedProviderBoundaryErrorV1B);
	assert.equal(credentialReads, 0);
	assert.equal(existsSync(stage1PilotRoot), false);
});
