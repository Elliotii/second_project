import assert from "node:assert/strict";
import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { ExecutionManifestV1B, LedgerEntryV1B, PauseEvidenceV1B, PausePhaseV1B, RunResultV1, TerminalCellEvidenceV1B } from "../src/contracts/v1-types.ts";
import { buildExecutionManifestV1B, buildReplacementExecutionManifestV1B, buildReplacementSequenceAuthorityV1B, validateExecutionManifestV1B, validateReplacementSequenceStateV1B, v1bManifestIdentity, V1B_REPLACEMENT_PREDECESSOR_MANIFEST_ID } from "../src/experiment/v1.ts";
import { loadCandidateTaskPackV1 } from "../src/experiment/task-pack-v1.ts";
import { aggregatePilotV1B, inspectV1RunCell } from "../src/inspect-v1.ts";
import { initializePilotV1B, readPilotLedgerV1B, runNextPilotCellV1B, simulatePilotV1B, validatePilotLedgerV1B } from "../src/pilot-v1.ts";
import { FixedProviderBoundaryErrorV1B, OneRunProviderAuthorityV1B, assertKnownUsageV1B, createOneRunProviderAuthorityV1B, createPublicPiRunCompositionV1B } from "../src/provider/fixed-provider-v1.ts";
import { createReplacementSequenceCoordinatorV1B, createTrackedRealCompositionV1B, preflightV1B, runNextV1B } from "../src/product-surface-v1.ts";
import { createPiRunHandleV1, emptyBudgetUsageV1B, projectSafeEvidenceV1B } from "../src/pi/pi-run-handle-v1.ts";
import { expectedSkillIdentityV1, loadExactOneSkillV1 } from "../src/skill/runtime-v1.ts";
import { PROJECT_ROOT } from "./helpers.ts";
import { fileSha256, sha256, stableJson, treeDigest, treeInventory } from "../src/hash.ts";
import { V1BTypedPauseError, scanFinalWorkspaceTreeV1B } from "../src/run-v1.ts";

function root(label: string): string {
	const value = resolve(PROJECT_ROOT, ".runs/v1-b/stage1/tests", `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	mkdirSync(resolve(value, ".."), { recursive: true });
	return value;
}

function trackedManifest(): ExecutionManifestV1B {
	return buildExecutionManifestV1B(PROJECT_ROOT);
}

let sharedPilot: Promise<string> | undefined;
async function completePilot(): Promise<string> {
	if (!sharedPilot) sharedPilot = (async () => {
		const pilotRoot = root("complete-pilot");
		const results = await simulatePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot, manifest: trackedManifest() });
		assert.equal(results.length, 24);
		return pilotRoot;
	})();
	return await sharedPilot;
}

function writeStable(path: string, value: unknown): void { writeFileSync(path, `${stableJson(value)}\n`, "utf8"); }

function coherentRewrite(pilotRoot: string, plannedRunId: string, mutate: (value: { terminal: TerminalCellEvidenceV1B; runResult: RunResultV1; marker: Record<string, any>; runRoot: string }) => void): void {
	const runRoot = resolve(pilotRoot, "runs", plannedRunId);
	const markerPath = resolve(runRoot, "terminal.json"); const marker = JSON.parse(readFileSync(markerPath, "utf8")) as Record<string, any>;
	const terminalPath = resolve(runRoot, marker.terminal_evidence_ref.path); const runResultPath = resolve(runRoot, marker.run_result_ref.path);
	const terminal = JSON.parse(readFileSync(terminalPath, "utf8")) as TerminalCellEvidenceV1B; const runResult = JSON.parse(readFileSync(runResultPath, "utf8")) as RunResultV1;
	mutate({ terminal, runResult, marker, runRoot }); writeStable(runResultPath, runResult);
	for (const ref of terminal.artifact_refs) { const bytes = readFileSync(resolve(runRoot, ref.path)); ref.sha256 = sha256(bytes); ref.size_bytes = bytes.length; }
	writeStable(terminalPath, terminal); marker.run_result_ref.sha256 = fileSha256(runResultPath); marker.run_result_ref.size_bytes = readFileSync(runResultPath).length; marker.terminal_evidence_ref.sha256 = fileSha256(terminalPath); marker.terminal_evidence_ref.size_bytes = readFileSync(terminalPath).length; writeStable(markerPath, marker);
}

function setLastUserTextInMessages(messages: unknown[], text: string): void {
	const typedMessages = messages as Array<{ role?: string; content?: unknown }>;
	const user = typedMessages.findLast((entry) => entry.role === "user")!;
	if (typeof user.content === "string") user.content = text;
	else user.content = (user.content as Array<Record<string, unknown>>).map((part) => part.type === "text" ? { ...part, text } : part);
}

function rehashInitialDispatch(terminal: TerminalCellEvidenceV1B): void {
	const dispatch = { model: terminal.initial_dispatch.model, context: terminal.initial_dispatch.context, options: terminal.initial_dispatch.options, provider_payload: terminal.initial_dispatch.provider_payload };
	terminal.initial_dispatch.payload_sha256 = sha256(stableJson(dispatch));
}

function setLastUserText(terminal: TerminalCellEvidenceV1B, text: string): void {
	setLastUserTextInMessages(terminal.initial_dispatch.context.messages, text);
	rehashInitialDispatch(terminal);
}

function duplicateRealProviderPayload(terminal: TerminalCellEvidenceV1B): void {
	terminal.initial_dispatch.provider_payload = {
		system: terminal.initial_dispatch.context.systemPrompt,
		messages: structuredClone(terminal.initial_dispatch.context.messages),
		tools: structuredClone(terminal.initial_dispatch.context.tools),
		stream: true,
	};
	rehashInitialDispatch(terminal);
}

test("V1-B Gate A/B preflight binds corrected baseline and keeps all real-call counters zero", () => {
	const manifest = trackedManifest();
	assert.equal(manifest.control_baseline_commit, "de75ca7a4d5376713f01ca475bc5ad7637c70443");
	assert.equal(manifest.control_baseline_tree, "e930e1d0885b52bf911ed78912786723f321f06e");
	assert.doesNotThrow(() => validateExecutionManifestV1B(manifest, PROJECT_ROOT));
	const manifestPath = resolve(root("preflight-manifest"), "manifest.json"); mkdirSync(resolve(manifestPath, ".."), { recursive: true }); writeStable(manifestPath, manifest);
	const result = preflightV1B({ projectRoot: PROJECT_ROOT, manifestPath, pilotRoot: root("preflight") });
	assert.deepEqual(result.real_call_counters, { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 });
	assert.equal(result.next_cell_id, "v1b-cell-01");
});

test("V1-B Gate C consumes authority when one Run opens, permits close, and sanitizes all boundary failures", async () => {
	let factoryCalls = 0;
	const authority = createOneRunProviderAuthorityV1B({ authorized: true, resolver: { resolve: async () => "non-secret-fake" } });
	const handle = createPublicPiRunCompositionV1B({ authority, factory: { create: (access) => { factoryCalls++; return { close: async () => access.close() }; } } });
	assert.equal(factoryCalls, 1);
	assert.throws(() => createPublicPiRunCompositionV1B({ authority, factory: { create: () => ({ close: async () => undefined }) } }), FixedProviderBoundaryErrorV1B);
	await handle.close();
	const denied = createOneRunProviderAuthorityV1B({ authorized: false });
	assert.throws(() => createPublicPiRunCompositionV1B({ authority: denied, factory: { create: () => ({ close: async () => undefined }) } }), FixedProviderBoundaryErrorV1B);
	const marker = "FAKE_SENSITIVE_MARKER_V1B";
	const failing = createOneRunProviderAuthorityV1B({ authorized: true, resolver: { resolve: async () => { throw new Error(marker); } } });
	let access!: Parameters<Parameters<typeof createPublicPiRunCompositionV1B>[0]["factory"]["create"]>[0];
	createPublicPiRunCompositionV1B({ authority: failing, factory: { create: (value) => { access = value; return { close: async () => value.close() }; } } });
	await assert.rejects(() => access.resolveCredential(), (error: Error) => error instanceof FixedProviderBoundaryErrorV1B && !String(error).includes(marker));
	const factoryMarker = createOneRunProviderAuthorityV1B({ authorized: true });
	assert.throws(() => createPublicPiRunCompositionV1B({ authority: factoryMarker, factory: { create: () => { throw new Error(marker); } } }), (error: Error) => error instanceof FixedProviderBoundaryErrorV1B && !String(error).includes(marker));
});

test("V1-B Gate C concrete public DeepSeek PiRunHandle opens and closes with zero dispatch or credential read", async () => {
	const manifest = trackedManifest(); const task = loadCandidateTaskPackV1(PROJECT_ROOT)[0]!;
	const { skill } = await loadExactOneSkillV1({ projectRoot: PROJECT_ROOT, skillRoot: "fixtures/skills/v1", expected: expectedSkillIdentityV1(PROJECT_ROOT) });
	let reads = 0;
	const authority = createOneRunProviderAuthorityV1B({ authorized: true, resolver: { resolve: async () => { reads++; return "non-secret-fake"; } } });
	const counters = { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 };
	const handle = createPublicPiRunCompositionV1B({ authority, factory: { create: (access) => createPiRunHandleV1({ mode: "stage2_real", workspaceRoot: resolve(PROJECT_ROOT, task.workspace_source_ref), task, skill, access, attemptCaps: manifest.budgets.initial_attempt, runCaps: manifest.budgets.arm_c_run, pilotCaps: manifest.budgets.pilot, pilotUsage: emptyBudgetUsageV1B(), realCallCounters: counters, workspaceId: "zero-dispatch-workspace" }) } });
	assert.equal(handle.debugIdentity().harness_instance_id, null); await handle.close();
	assert.equal(reads, 0); assert.deepEqual(counters, { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 });
	assert.throws(() => createPublicPiRunCompositionV1B({ authority, factory: { create: () => ({ close: async () => undefined }) } }), FixedProviderBoundaryErrorV1B);
});

test("V1-B Gate D/G Manifest freezes the 24-cell order and rejects coherent drift", () => {
	const manifest = trackedManifest();
	assert.deepEqual(manifest, buildExecutionManifestV1B(PROJECT_ROOT));
	assert.deepEqual(manifest.cells.map((cell) => `${cell.task_id}:${cell.repetition}:${cell.arm}`).slice(0, 6), ["v1-parse-duration:1:A", "v1-parse-duration:1:B", "v1-parse-duration:1:C", "v1-bounded-index:1:A", "v1-bounded-index:1:C", "v1-bounded-index:1:B"]);
	for (const mutate of [
		(value: ExecutionManifestV1B) => value.cells.pop(),
		(value: ExecutionManifestV1B) => value.cells.reverse(),
		(value: ExecutionManifestV1B) => { value.cells[0]!.planned_run_id = "replacement"; },
		(value: ExecutionManifestV1B) => { value.bindings.skill_digest = "1".repeat(64); },
		(value: ExecutionManifestV1B) => { value.policy.retry_same_run = true as false; },
	]) {
		const drift = structuredClone(manifest); mutate(drift); drift.manifest_id = v1bManifestIdentity(drift);
		assert.throws(() => validateExecutionManifestV1B(drift, PROJECT_ROOT), /Manifest|forbidden|drift/);
	}
});

test("V1-B Gates D-H zero-call simulation terminalizes 24 cells with bounded C recovery and complete fairness", async () => {
	const pilotRoot = await completePilot();
	const aggregate = aggregatePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot });
	assert.equal(aggregate.planned_runs, 24); assert.equal(aggregate.terminal_runs, 24);
	assert.deepEqual(aggregate.fairness, { blocks_checked: 8, bc_initial_byte_equal: true, ab_only_skill_delta: true });
	assert.equal(aggregate.by_arm.A.terminal, 8); assert.equal(aggregate.by_arm.B.terminal, 8); assert.equal(aggregate.by_arm.C.terminal, 8);
	assert.ok(aggregate.recovery_eligible > 0); assert.equal(aggregate.recovery_eligible, aggregate.recovery_started); assert.ok(aggregate.recovery_succeeded > 0);
	assert.ok(aggregate.totals.provider_requests <= 256); assert.ok(aggregate.totals.tool_calls <= 384); assert.ok(aggregate.totals.cost_usd <= 2); assert.ok(aggregate.totals.active_execution_time_ms <= 7_200_000);
	const manifest = trackedManifest();
	for (const cell of manifest.cells) {
		const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot, plannedRunId: cell.planned_run_id });
		assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
		assert.equal(inspected.terminal!.session_id, inspected.terminal!.attempts[0]!.session_id);
		assert.ok(inspected.terminal!.attempts.every((attempt) => attempt.session_id === inspected.terminal!.session_id && attempt.workspace_id === inspected.terminal!.workspace_id));
		assert.equal(inspected.terminal!.secret_scan.match_count, 0);
	}
});

test("V1-B Gate E/F covers C pass/no-child, failed/child, final fail and three-level reservations", async () => {
	const pilotRoot = await completePilot(); const manifest = trackedManifest();
	const c = manifest.cells.filter((cell) => cell.arm === "C").map((cell) => inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot, plannedRunId: cell.planned_run_id }).terminal!);
	assert.ok(c.some((run) => run.initial_verifier_status === "passed" && run.attempts.length === 1 && !run.recovery_started));
	assert.ok(c.some((run) => run.initial_verifier_status === "failed" && run.attempts.length === 2 && run.final_verifier_status === "passed"));
	assert.ok(c.some((run) => run.initial_verifier_status === "failed" && run.attempts.length === 2 && run.final_verifier_status === "failed"));
	for (const run of c) for (const kind of ["provider_request", "tool_call", "verifier", "child"] as const) {
		const count = kind === "provider_request" ? run.budget_usage.provider_requests : kind === "tool_call" ? run.budget_usage.tool_calls : kind === "verifier" ? run.budget_usage.verifier_runs : run.budget_usage.child_attempts;
		for (const level of ["attempt", "run", "pilot"] as const) assert.equal(run.reservations.filter((entry) => entry.kind === kind && entry.level === level).length, count);
	}
	for (const invalid of [
		{ input_tokens: "unknown" as const, output_tokens: 0, cost_usd: 0 },
		{ input_tokens: -1, output_tokens: 0, cost_usd: 0 },
		{ input_tokens: 1.5, output_tokens: 0, cost_usd: 0 },
		{ input_tokens: 0, output_tokens: 0, cost_usd: Number.POSITIVE_INFINITY },
	]) assert.throws(() => assertKnownUsageV1B(invalid), FixedProviderBoundaryErrorV1B);
});

test("V1-B Gate G/I Inspector rejects overwrite, missing evidence, mixed revision and duplicate ledger transition", async () => {
	const source = await completePilot(); const manifest = trackedManifest(); const first = manifest.cells[0]!;
	for (const [label, mutate] of [
		["overwrite", (pilot: string) => writeFileSync(resolve(pilot, "runs", first.planned_run_id, "terminal-evidence.json"), "{}\n")],
		["mixed", (pilot: string) => { const path = resolve(pilot, "runs", first.planned_run_id, "run-result.json"); const value = JSON.parse(readFileSync(path, "utf8")); value.manifest_id = "f".repeat(64); writeFileSync(path, JSON.stringify(value)); }],
	] as const) {
		const copy = root(`inspector-${label}`); cpSync(source, copy, { recursive: true }); mutate(copy);
		const result = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: copy, plannedRunId: first.planned_run_id }); assert.equal(result.integrity_valid, false);
	}
	const duplicate = root("ledger-duplicate"); cpSync(source, duplicate, { recursive: true }); const entries = readPilotLedgerV1B(duplicate); appendFileSync(resolve(duplicate, "ledger.jsonl"), `${JSON.stringify({ ...entries.at(-1), seq: entries.length + 1 })}\n`);
	assert.throws(() => validatePilotLedgerV1B(manifest, readPilotLedgerV1B(duplicate)), /transition/);
});

test("V1-B F-001 Inspector rejects coherent semantic rehash and missing/duplicate Verifier refs", async () => {
	const source = await completePilot(); const cell = trackedManifest().cells.at(-1)!;
	for (const [label, mutate] of [
		["task", (run: RunResultV1) => { run.evidence.task_digest = "1".repeat(64); }],
		["skill", (run: RunResultV1) => { run.evidence.skill_digest = "2".repeat(64); }],
		["verifier", (run: RunResultV1) => { run.evidence.verifier_digest = "3".repeat(64); }],
		["workbench", (run: RunResultV1) => { run.evidence.workbench_digest = "4".repeat(64); }],
	] as const) {
		const copy = root(`f001-${label}`); cpSync(source, copy, { recursive: true }); coherentRewrite(copy, cell.planned_run_id, ({ runResult }) => mutate(runResult));
		const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: copy, plannedRunId: cell.planned_run_id }); assert.equal(inspected.integrity_valid, false); assert.match(inspected.errors.join("; "), /semantic binding drift/);
	}
	for (const [label, mutate] of [
		["missing", (terminal: TerminalCellEvidenceV1B) => { terminal.artifact_refs = terminal.artifact_refs.filter((ref) => !ref.path.endsWith("verifier-output.txt")); }],
		["duplicate", (terminal: TerminalCellEvidenceV1B) => { const ref = terminal.artifact_refs.find((value) => value.path.endsWith("verifier-result.json"))!; terminal.artifact_refs.push(structuredClone(ref)); }],
	] as const) {
		const copy = root(`f001-verifier-${label}`); cpSync(source, copy, { recursive: true }); coherentRewrite(copy, cell.planned_run_id, ({ terminal }) => mutate(terminal));
		const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: copy, plannedRunId: cell.planned_run_id }); assert.equal(inspected.integrity_valid, false); assert.match(inspected.errors.join("; "), /Verifier|verifier|ArtifactRef/);
	}
});

test("V1-B F-002 filters secret/reasoning fields and independently scans final persisted bytes", async () => {
	const projected = projectSafeEvidenceV1B({ Authorization: "removed", REASONING_CONTENT: "removed", nested: { Thinking: "removed", Signature: "removed", safe: "kept" } });
	assert.deepEqual(projected, { nested: { safe: "kept" } });
	for (const marker of ["Bearer FAKE_TOKEN", "FAKE_SENSITIVE_MARKER", "FAKE_RESOLVER_ERROR", "FAKE_PROVIDER_ERROR", "FAKE_FACTORY_ERROR"]) assert.throws(() => projectSafeEvidenceV1B({ safe: marker }), /rejected/);
	const source = await completePilot(); const cell = trackedManifest().cells[0]!;
	const secret = root("f002-persisted-authorization"); cpSync(source, secret, { recursive: true });
	coherentRewrite(secret, cell.planned_run_id, ({ terminal, runResult }) => { terminal.initial_dispatch.options = { Authorization: "Bearer FAKE_TOKEN" }; setLastUserText(terminal, readFileSync(resolve(PROJECT_ROOT, "fixtures/tasks/v1/parse-duration/instruction.md"), "utf8")); runResult.evidence.initial_payload_digest = terminal.initial_dispatch.payload_sha256; });
	let inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: secret, plannedRunId: cell.planned_run_id }); assert.equal(inspected.integrity_valid, false); assert.match(inspected.errors.join("; "), /secret\/reasoning/);
	const marker = root("f002-persisted-factory-marker"); cpSync(source, marker, { recursive: true });
	coherentRewrite(marker, cell.planned_run_id, ({ runRoot }) => { appendFileSync(resolve(runRoot, "journal.jsonl"), `${stableJson({ type: "error", value: "FAKE_FACTORY_ERROR" })}\n`); });
	inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: marker, plannedRunId: cell.planned_run_id }); assert.equal(inspected.integrity_valid, false); assert.match(inspected.errors.join("; "), /secret\/reasoning/);
});

test("V1-B post-audit F-001 scans final Workspace bytes and fails closed on linked paths", async () => {
	const manifest = trackedManifest();
	const producer = root("post-audit-workspace-producer"); initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: producer, manifest });
	await assert.rejects(() => runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot: producer, deterministicInjection: { kind: "workspace_forbidden_marker", cause_id: "workspace_marker_test" } }), /typed boundary/);
	assert.equal(existsSync(resolve(producer, "runs", manifest.cells[0]!.planned_run_id, "terminal.json")), false);
	assert.equal(readPilotLedgerV1B(producer).at(-1)!.state, "paused");

	const source = await completePilot(); const cell = manifest.cells[0]!;
	const coherent = root("post-audit-workspace-coherent"); cpSync(source, coherent, { recursive: true });
	coherentRewrite(coherent, cell.planned_run_id, ({ terminal, marker, runRoot }) => {
		appendFileSync(resolve(runRoot, "workspace/src/subject.ts"), "\n// Bearer FAKE_REBOUND_WORKSPACE_TOKEN\n// FAKE_SENSITIVE_REBOUND_WORKSPACE\n", "utf8");
		const inventory = treeInventory(resolve(runRoot, "workspace"));
		const ref = { path: "workspace" as const, sha256: treeDigest(resolve(runRoot, "workspace")), file_count: inventory.length, size_bytes: inventory.reduce((sum, file) => sum + file.bytes, 0), scan: { passed: true as const, match_count: 0 as const, reasoning_payloads: 0 as const } };
		terminal.workspace_tree_ref = ref; marker.final_workspace_digest = ref.sha256; marker.final_workspace_ref = ref;
	});
	const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: coherent, plannedRunId: cell.planned_run_id });
	assert.equal(inspected.integrity_valid, false); assert.match(inspected.errors.join("; "), /typed boundary|Workspace/);

	const clean = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: source, plannedRunId: cell.planned_run_id });
	assert.equal(clean.integrity_valid, true, clean.errors.join("; ")); assert.equal(clean.terminal!.workspace_tree_ref.scan.passed, true);

	const linkRoot = root("post-audit-workspace-link"); const workspace = resolve(linkRoot, "workspace"); const outside = resolve(linkRoot, "outside");
	mkdirSync(workspace, { recursive: true }); mkdirSync(outside, { recursive: true }); writeFileSync(resolve(outside, "outside.txt"), "safe\n", "utf8"); symlinkSync(outside, resolve(workspace, "escape"), "junction");
	assert.throws(() => scanFinalWorkspaceTreeV1B(workspace), /typed boundary/);
});

test("V1-B post-audit F-002 tracked product surface keeps real authority concrete, one-Run and lazy", async () => {
	let reads = 0;
	const input = { authority_id: "v1b-public-pi-one-run" as const, credential_profile_name: "DEEPSEEK_API_KEY" as const, authorized: true, resolver: { resolve: async () => { reads++; return "unused"; } } };
	const composition = createTrackedRealCompositionV1B(input); const authority = composition.createAuthority(trackedManifest().cells[0]!); authority.assertAvailable();
	const handle = createPublicPiRunCompositionV1B({ authority, factory: { create: (access) => ({ close: async () => access.close() }) } });
	assert.equal(reads, 0); await handle.close(); assert.equal(reads, 0);
	assert.throws(() => createPublicPiRunCompositionV1B({ authority, factory: { create: () => ({ close: async () => undefined }) } }), FixedProviderBoundaryErrorV1B);

	const realManifest = buildExecutionManifestV1B(PROJECT_ROOT, { executionMode: "stage2_real", executionBaselineCommit: "f".repeat(40), realExecutionAuthorized: true });
	const realPath = resolve(root("post-audit-real-manifest"), "manifest.json"); mkdirSync(resolve(realPath, ".."), { recursive: true }); writeStable(realPath, realManifest);
	for (const [label, authorityInput] of [
		["denied", { ...input, authorized: false }],
		["missing-resolver", { authority_id: input.authority_id, credential_profile_name: input.credential_profile_name, authorized: true }],
	] as const) {
		const pilotRoot = root(`post-audit-real-${label}`);
		await assert.rejects(() => runNextV1B({ projectRoot: PROJECT_ROOT, manifestPath: realPath, pilotRoot, stage2ExecutionAuthority: authorityInput }), (error: Error) => error instanceof FixedProviderBoundaryErrorV1B && !String(error).includes("dependencies are unavailable"));
		assert.equal(readPilotLedgerV1B(pilotRoot).filter((entry) => entry.state === "started").length, 0);
	}
	assert.equal(reads, 0);
});

test("V1-B F-003 proves A/B delta is exactly the frozen public Skill treatment", async () => {
	const source = await completePilot(); const manifest = trackedManifest(); const aCell = manifest.cells.find((cell) => cell.block === 1 && cell.arm === "A")!; const bCell = manifest.cells.find((cell) => cell.block === 1 && cell.arm === "B")!; const cCell = manifest.cells.find((cell) => cell.block === 1 && cell.arm === "C")!;
	const readTerminal = (run: string) => JSON.parse(readFileSync(resolve(source, "runs", run, "terminal-evidence.json"), "utf8")) as TerminalCellEvidenceV1B;
	const text = (terminal: TerminalCellEvidenceV1B) => { const user = (terminal.initial_dispatch.context.messages as Array<{ role?: string; content?: Array<{ type?: string; text?: string }> }>).findLast((entry) => entry.role === "user")!; return user.content!.filter((part) => part.type === "text").map((part) => part.text ?? "").join(""); };
	const aText = text(readTerminal(aCell.planned_run_id)); const bText = text(readTerminal(bCell.planned_run_id));
	const realShaped = root("f003-real-shaped"); cpSync(source, realShaped, { recursive: true });
	for (const cell of [aCell, bCell, cCell]) coherentRewrite(realShaped, cell.planned_run_id, ({ terminal, runResult }) => { duplicateRealProviderPayload(terminal); runResult.evidence.initial_payload_digest = terminal.initial_dispatch.payload_sha256; });
	assert.doesNotThrow(() => aggregatePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: realShaped }));
	for (const [label, mutate] of [
		["provider-only-treatment", (terminal: TerminalCellEvidenceV1B) => { const payload = terminal.initial_dispatch.provider_payload as { messages: unknown[] }; setLastUserTextInMessages(payload.messages, "arbitrary provider-only treatment"); rehashInitialDispatch(terminal); }],
		["context-only-treatment", (terminal: TerminalCellEvidenceV1B) => { setLastUserText(terminal, "arbitrary context-only treatment"); }],
		["arbitrary-duplicated-treatment", (terminal: TerminalCellEvidenceV1B) => { setLastUserTextInMessages(terminal.initial_dispatch.context.messages, "arbitrary duplicated treatment"); const payload = terminal.initial_dispatch.provider_payload as { messages: unknown[] }; setLastUserTextInMessages(payload.messages, "arbitrary duplicated treatment"); rehashInitialDispatch(terminal); }],
		["non-treatment-provider-drift", (terminal: TerminalCellEvidenceV1B) => { (terminal.initial_dispatch.provider_payload as Record<string, unknown>).stream = false; rehashInitialDispatch(terminal); }],
	] as const) {
		const copy = root(`f003-real-shaped-${label}`); cpSync(realShaped, copy, { recursive: true });
		for (const cell of [bCell, cCell]) coherentRewrite(copy, cell.planned_run_id, ({ terminal, runResult }) => { mutate(terminal); runResult.evidence.initial_payload_digest = terminal.initial_dispatch.payload_sha256; });
		assert.throws(() => aggregatePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: copy }), /Skill treatment|A\/B delta/, label);
	}
	for (const [label, replacement] of [["arbitrary", "arbitrary treatment"], ["missing-wrapper", aText], ["extra-text", `${bText}\nEXTRA`], ["wrong-body", bText.replace("Inspect the provided TypeScript task", "Ignore the frozen Skill and guess")]] as const) {
		const copy = root(`f003-${label}`); cpSync(source, copy, { recursive: true });
		for (const cell of [bCell, cCell]) coherentRewrite(copy, cell.planned_run_id, ({ terminal, runResult }) => { setLastUserText(terminal, replacement); runResult.evidence.initial_payload_digest = terminal.initial_dispatch.payload_sha256; });
		assert.throws(() => aggregatePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: copy }), /Skill treatment/);
	}
	for (const [label, mutate] of [
		["options", (terminal: TerminalCellEvidenceV1B) => { terminal.initial_dispatch.options = { timeoutMs: 1 }; }],
		["model", (terminal: TerminalCellEvidenceV1B) => { terminal.initial_dispatch.model = { id: "drift" }; }],
		["tool", (terminal: TerminalCellEvidenceV1B) => { terminal.initial_dispatch.context.tools = []; terminal.initial_dispatch.provider_payload = null; }],
	] as const) {
		const copy = root(`f003-${label}`); cpSync(source, copy, { recursive: true }); coherentRewrite(copy, bCell.planned_run_id, ({ terminal, runResult }) => { mutate(terminal); setLastUserText(terminal, bText); runResult.evidence.initial_payload_digest = terminal.initial_dispatch.payload_sha256; });
		assert.throws(() => aggregatePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: copy }), /B\/C complete initial dispatch drift|initial dispatch digest mismatch/);
	}
});

test("V1-B F-004 typed taxonomy closes invalid denominators, pause and threshold behavior", async () => {
	const manifest = trackedManifest();
	const infra = root("f004-infra-threshold"); initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: infra, manifest });
	await runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot: infra, deterministicInjection: { kind: "infrastructure_invalid", cause_id: "predeclared_os_boundary" } });
	let aggregate = aggregatePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: infra }); assert.deepEqual({ started: aggregate.started_runs, invalid: aggregate.invalid_runs, excluded: aggregate.excluded_runs, comparable: aggregate.comparable_runs }, { started: 1, invalid: 1, excluded: 1, comparable: 0 });
	await assert.rejects(() => runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot: infra }), /typed boundary/); assert.equal(readPilotLedgerV1B(infra).filter((entry) => entry.state === "started").length, 1); assert.equal(readPilotLedgerV1B(infra).at(-1)!.cause_id, "pilot_invalid_ratio_threshold");
	const evidence = root("f004-evidence"); initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: evidence, manifest }); await runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot: evidence, deterministicInjection: { kind: "evidence_invalid", cause_id: "predeclared_persistence_boundary" } }); aggregate = aggregatePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: evidence }); assert.equal(aggregate.excluded_runs, 1);
	const treatment = root("f004-treatment"); initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: treatment, manifest }); await runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot: treatment }); await runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot: treatment, deterministicInjection: { kind: "treatment_guardrail_failure", cause_id: "treatment_protected_guardrail" } }); aggregate = aggregatePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: treatment }); assert.deepEqual({ invalid: aggregate.invalid_runs, treatment: aggregate.treatment_invalid_runs, comparable: aggregate.comparable_runs, excluded: aggregate.excluded_runs }, { invalid: 1, treatment: 1, comparable: 2, excluded: 0 });
	const unknown = root("f004-unknown"); initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: unknown, manifest }); await assert.rejects(() => runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot: unknown, deterministicInjection: { kind: "unknown", cause_id: "unknown_boundary" } }), /typed boundary/); assert.deepEqual(readPilotLedgerV1B(unknown).filter((entry) => entry.state !== "planned").map((entry) => entry.state), ["started", "paused"]);
	const budget = root("f004-global-budget"); initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: budget, manifest }); await assert.rejects(() => runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot: budget, deterministicInjection: { kind: "global_budget_stop", cause_id: "pilot_reserve_unavailable" } }), /typed boundary/); assert.equal(readPilotLedgerV1B(budget).filter((entry) => entry.state === "started").length, 0);
	const repeated = root("f004-repeat"); initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: repeated, manifest }); for (let index = 0; index < 4; index++) await runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot: repeated }); await runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot: repeated, deterministicInjection: { kind: "infrastructure_invalid", cause_id: "same_infra_cause" } }); for (let index = 0; index < 4; index++) await runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot: repeated }); await runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot: repeated, deterministicInjection: { kind: "infrastructure_invalid", cause_id: "same_infra_cause" } }); await assert.rejects(() => runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot: repeated }), /typed boundary/); assert.equal(readPilotLedgerV1B(repeated).at(-1)!.cause_id, "pilot_repeated_invalid_cause");
});

test("V1-B F-005 reserve failure is atomic and Inspector rejects tampered reservation chains", async () => {
	const manifest = trackedManifest(); const task = loadCandidateTaskPackV1(PROJECT_ROOT)[0]!; const { skill } = await loadExactOneSkillV1({ projectRoot: PROJECT_ROOT, skillRoot: "fixtures/skills/v1", expected: expectedSkillIdentityV1(PROJECT_ROOT) });
	const makeHandle = (runCaps: ExecutionManifestV1B["budgets"]["arm_c_run"]) => { const authority = createOneRunProviderAuthorityV1B({ authorized: true, resolver: { resolve: async () => "unused" } }); return createPublicPiRunCompositionV1B({ authority, factory: { create: (access) => createPiRunHandleV1({ mode: "stage1_fake", workspaceRoot: resolve(PROJECT_ROOT, task.workspace_source_ref), task, skill, access, attemptCaps: manifest.budgets.initial_attempt, runCaps, pilotCaps: manifest.budgets.pilot, pilotUsage: emptyBudgetUsageV1B(), realCallCounters: { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 }, workspaceId: "atomic-budget-test" }) } }); };
	const providerDenied = makeHandle({ ...manifest.budgets.arm_c_run, provider_requests: 0 }); const beforeProvider = providerDenied.usage(); await assert.rejects(() => providerDenied.runAttempt({ attemptId: "atomic-a1", prompt: "test", invocation: "prompt", fakeMode: "fail" }), /typed sanitized boundary/); assert.deepEqual(providerDenied.usage(), beforeProvider); await providerDenied.close();
	for (const caps of [{ ...manifest.budgets.arm_c_run, wall_time_ms: manifest.budgets.initial_attempt.wall_time_ms - 1 }, { ...manifest.budgets.arm_c_run, verifier_runs: 0 }]) { const handle = makeHandle(caps); const before = handle.usage(); assert.throws(() => handle.reserveChild(), /reserve|budget|cap/); assert.deepEqual(handle.usage(), before); await handle.close(); }
	const source = await completePilot(); const cell = manifest.cells[0]!;
	for (const [label, mutate] of [
		["chain", (terminal: TerminalCellEvidenceV1B) => { const record = terminal.reservations.filter((value) => value.level === "run")[1]!; record.before.provider_requests++; record.after.provider_requests++; }],
		["over-actual", (terminal: TerminalCellEvidenceV1B) => { const record = terminal.reservations.find((value) => value.level === "run" && value.kind === "provider_request")!; record.actual.tokens = record.reserved.tokens + 1; record.after.tokens = record.before.tokens + record.actual.tokens; }],
	] as const) { const copy = root(`f005-${label}`); cpSync(source, copy, { recursive: true }); coherentRewrite(copy, cell.planned_run_id, ({ terminal }) => mutate(terminal)); const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: copy, plannedRunId: cell.planned_run_id }); assert.equal(inspected.integrity_valid, false); assert.match(inspected.errors.join("; "), /reservation|actual exceeds reserved/); }
});

test("V1-B run-next refuses a previously started nonterminal cell and never silently advances", async () => {
	const pilotRoot = root("started-stop"); const manifest = trackedManifest(); initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot, manifest });
	const entries = readPilotLedgerV1B(pilotRoot); const cell = manifest.cells[0]!;
	const started: LedgerEntryV1B = { schema_version: 1, seq: entries.length + 1, timestamp: new Date().toISOString(), manifest_id: manifest.manifest_id, cell_id: cell.cell_id, planned_run_id: cell.planned_run_id, state: "started", cause_id: null, run_result_ref: null };
	appendFileSync(resolve(pilotRoot, "ledger.jsonl"), `${JSON.stringify(started)}\n`);
	await assert.rejects(() => runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot }), /already started/);
});

test("V1-B tracked real route fails closed before started state when Stage 2 dependencies are absent", async () => {
	const pilotRoot = root("real-route-denied");
	const manifest = buildExecutionManifestV1B(PROJECT_ROOT, { executionMode: "stage2_real", executionBaselineCommit: "f".repeat(40), realExecutionAuthorized: true });
	initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot, manifest });
	await assert.rejects(() => runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot }), /real execution dependencies/);
	assert.equal(readPilotLedgerV1B(pilotRoot).filter((entry) => entry.state === "started").length, 0);
});

async function pausedPilot(phase: PausePhaseV1B, mode: "stage1_zero_call" | "stage2_real" = "stage1_zero_call", resolver: () => Promise<string> = async () => "non-secret-fake"): Promise<{ pilotRoot: string; manifest: ExecutionManifestV1B; resolverReads: () => number }> {
	const pilotRoot = root(`pause-${phase}`);
	const manifest = buildExecutionManifestV1B(PROJECT_ROOT, { executionMode: mode, executionBaselineCommit: "f".repeat(40), realExecutionAuthorized: mode === "stage2_real" });
	initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot, manifest });
	let reads = 0;
	await assert.rejects(() => runNextPilotCellV1B({
		projectRoot: PROJECT_ROOT, pilotRoot, deterministicPausePhase: phase,
		...(mode === "stage2_real" ? { realExecution: { createAuthority: () => createOneRunProviderAuthorityV1B({ authorized: true, resolver: { resolve: async () => { reads++; return await resolver(); } } }) } } : {}),
	}), /typed boundary/);
	return { pilotRoot, manifest, resolverReads: () => reads };
}

test("V1-B pause phases before and during credential resolution are typed, sanitized and reservation-free", async () => {
	const before = await pausedPilot("before_credential_resolution", "stage2_real");
	assert.equal(before.resolverReads(), 0);
	const first = before.manifest.cells[0]!;
	let inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: before.pilotRoot, plannedRunId: first.planned_run_id });
	assert.deepEqual({ valid: inspected.integrity_valid, pause: inspected.pause_integrity_valid, terminal: inspected.terminal_valid, comparable: inspected.comparable }, { valid: true, pause: true, terminal: false, comparable: false });
	assert.equal(inspected.pause_evidence!.pending_provider_reservation, null);
	assert.deepEqual(inspected.pause_evidence!.counter_snapshot, { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 });

	const marker = "FAKE_SENSITIVE_CREDENTIAL_FAILURE";
	const credential = await pausedPilot("credential_resolution_failure_before_dispatch", "stage2_real", async () => { throw new Error(marker); });
	inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: credential.pilotRoot, plannedRunId: credential.manifest.cells[0]!.planned_run_id });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspected.pause_evidence!.phase, "credential_resolution_failure_before_dispatch");
	assert.equal(inspected.pause_evidence!.pending_provider_reservation, null);
	assert.doesNotMatch(readFileSync(resolve(credential.pilotRoot, "runs", credential.manifest.cells[0]!.planned_run_id, "pause-evidence.json"), "utf8"), new RegExp(marker));

	const other = await pausedPilot("other_bounded_runtime_failure");
	inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: other.pilotRoot, plannedRunId: other.manifest.cells[0]!.planned_run_id });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspected.pause_evidence!.phase, "other_bounded_runtime_failure");
});

test("V1-B post-credential pre-reservation failure remains zero-dispatch and carries no pending charge", async () => {
	const paused = await pausedPilot("after_credential_before_provider_request_reservation", "stage2_real");
	assert.equal(paused.resolverReads(), 1);
	const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: paused.pilotRoot, plannedRunId: paused.manifest.cells[0]!.planned_run_id });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.deepEqual(inspected.pause_evidence!.counter_snapshot, { credential_reads: 1, network_calls: 0, provider_calls: 0, model_calls: 0 });
	assert.equal(inspected.pause_evidence!.pending_provider_reservation, null);
});

test("V1-B synthetic post-reservation failure writes before dispatch, charges the complete reservation and stops the Pilot", async () => {
	const paused = await pausedPilot("after_provider_request_reservation_usage_unavailable");
	const cell = paused.manifest.cells[0]!;
	const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: paused.pilotRoot, plannedRunId: cell.planned_run_id });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	const evidence = inspected.pause_evidence!;
	assert.deepEqual(evidence.counter_snapshot, { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 });
	assert.equal(evidence.pending_provider_reservation!.cost_usd, 0.10);
	assert.equal(evidence.conservative_usage_charge.cost_usd, evidence.pending_provider_reservation!.cost_usd);
	assert.equal(evidence.conservative_usage_charge.tokens, evidence.pending_provider_reservation!.tokens);
	const journal = readFileSync(resolve(paused.pilotRoot, "runs", cell.planned_run_id, "journal.jsonl"), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
	assert.deepEqual(journal.slice(-2).map((event) => event.type), ["provider_request_reserved", "attempt_paused"]);
	assert.deepEqual(readPilotLedgerV1B(paused.pilotRoot).filter((entry) => entry.state !== "planned").map((entry) => entry.state), ["started", "paused"]);
	const aggregate = aggregatePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot: paused.pilotRoot });
	assert.deepEqual({ paused: aggregate.paused_runs, terminal: aggregate.terminal_runs, comparable: aggregate.comparable_runs, cost: aggregate.totals.cost_usd }, { paused: 1, terminal: 0, comparable: 0, cost: 0.10 });
	await assert.rejects(() => runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot: paused.pilotRoot }), /paused/);
});

test("V1-B invalid or unknown Provider response usage pauses with the full conservative reservation", async () => {
	const paused = await pausedPilot("invalid_or_unknown_usage_after_provider_response");
	const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: paused.pilotRoot, plannedRunId: paused.manifest.cells[0]!.planned_run_id });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspected.pause_evidence!.phase, "invalid_or_unknown_usage_after_provider_response");
	assert.equal(inspected.pause_evidence!.budget_usage_after_conservative_charge.cost_usd, 0.10);
	assert.equal(inspected.terminal, null);
});

test("V1-B paused Inspector rejects missing, duplicate, reordered, tampered and coherently rehashed evidence", async () => {
	const source = await pausedPilot("after_provider_request_reservation_usage_unavailable");
	const cell = source.manifest.cells[0]!;
	const copies = ["missing", "duplicate", "reordered", "tampered", "coherent"].map((label) => { const copy = root(`pause-${label}`); cpSync(source.pilotRoot, copy, { recursive: true }); return [label, copy] as const; });
	for (const [label, copy] of copies) {
		const runRoot = resolve(copy, "runs", cell.planned_run_id); const pausePath = resolve(runRoot, "pause-evidence.json"); const journalPath = resolve(runRoot, "journal.jsonl"); const ledgerPath = resolve(copy, "ledger.jsonl");
		if (label === "missing") unlinkSync(pausePath);
		if (label === "duplicate") { const events = readFileSync(journalPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)); events.push({ ...events.at(-1), seq: events.length + 1 }); writeFileSync(journalPath, `${events.map(stableJson).join("\n")}\n`); const ledger = readFileSync(ledgerPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)); ledger.at(-1).journal_sha256 = fileSha256(journalPath); writeFileSync(ledgerPath, `${ledger.map(stableJson).join("\n")}\n`); }
		if (label === "reordered") { const events = readFileSync(journalPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)); [events[events.length - 2], events[events.length - 1]] = [events[events.length - 1], events[events.length - 2]]; events.forEach((event, index) => event.seq = index + 1); writeFileSync(journalPath, `${events.map(stableJson).join("\n")}\n`); const ledger = readFileSync(ledgerPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)); ledger.at(-1).journal_sha256 = fileSha256(journalPath); writeFileSync(ledgerPath, `${ledger.map(stableJson).join("\n")}\n`); }
		if (label === "tampered") { const pause = JSON.parse(readFileSync(pausePath, "utf8")); pause.counter_snapshot.network_calls = 9; writeStable(pausePath, pause); }
		if (label === "coherent") {
			const pause = JSON.parse(readFileSync(pausePath, "utf8")) as PauseEvidenceV1B; pause.phase = "before_credential_resolution"; writeStable(pausePath, pause);
			const events = readFileSync(journalPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)); events.at(-1).data.phase = pause.phase; events.at(-1).data.pause_evidence_ref = { path: "pause-evidence.json", sha256: fileSha256(pausePath), size_bytes: readFileSync(pausePath).length }; writeFileSync(journalPath, `${events.map(stableJson).join("\n")}\n`);
			const ledger = readFileSync(ledgerPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)); ledger.at(-1).cause_id = `pause_${pause.phase}`; ledger.at(-1).pause_evidence_ref = events.at(-1).data.pause_evidence_ref; ledger.at(-1).journal_sha256 = fileSha256(journalPath); writeFileSync(ledgerPath, `${ledger.map(stableJson).join("\n")}\n`);
		}
		const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: copy, plannedRunId: cell.planned_run_id }); assert.equal(inspected.integrity_valid, false, label);
	}
});

test("V1-B paused evidence rejects secret, error, payload and reasoning markers even under coherent digest repair", async () => {
	const source = await pausedPilot("before_credential_resolution", "stage2_real"); const cell = source.manifest.cells[0]!;
	const copy = root("pause-protected-marker"); cpSync(source.pilotRoot, copy, { recursive: true }); const runRoot = resolve(copy, "runs", cell.planned_run_id); const pausePath = resolve(runRoot, "pause-evidence.json"); const journalPath = resolve(runRoot, "journal.jsonl"); const ledgerPath = resolve(copy, "ledger.jsonl");
	const pause = JSON.parse(readFileSync(pausePath, "utf8")); pause.forbidden_payload = { authorization: "Bearer FAKE_SENSITIVE_PAUSE", reasoning: "blocked" }; writeStable(pausePath, pause);
	const events = readFileSync(journalPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)); events.at(-1).data.pause_evidence_ref = { path: "pause-evidence.json", sha256: fileSha256(pausePath), size_bytes: readFileSync(pausePath).length }; writeFileSync(journalPath, `${events.map(stableJson).join("\n")}\n`);
	const ledger = readFileSync(ledgerPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)); ledger.at(-1).pause_evidence_ref = events.at(-1).data.pause_evidence_ref; ledger.at(-1).journal_sha256 = fileSha256(journalPath); writeFileSync(ledgerPath, `${ledger.map(stableJson).join("\n")}\n`);
	const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: copy, plannedRunId: cell.planned_run_id }); assert.equal(inspected.integrity_valid, false); assert.match(inspected.errors.join("; "), /secret\/reasoning/);
});

test("V1-B replacement revision freezes predecessor, USD1.90, new 24-cell IDs, cross-sequence starts and eight children", () => {
	const manifest = buildReplacementExecutionManifestV1B(PROJECT_ROOT, { executionBaselineCommit: "f".repeat(40) });
	assert.doesNotThrow(() => validateExecutionManifestV1B(manifest, PROJECT_ROOT));
	assert.equal(manifest.replacement_revision!.predecessor_manifest_id, V1B_REPLACEMENT_PREDECESSOR_MANIFEST_ID);
	assert.equal(manifest.budgets.pilot.cost_usd, 1.90); assert.equal(manifest.cells.length, 24); assert.ok(manifest.cells.every((cell) => cell.planned_run_id.startsWith("v1b-replacement-run-")));
	for (const mutate of [
		(value: ExecutionManifestV1B) => { value.budgets.pilot.cost_usd = 1.91; },
		(value: ExecutionManifestV1B) => { value.replacement_revision!.predecessor_manifest_id = "f".repeat(64) as typeof V1B_REPLACEMENT_PREDECESSOR_MANIFEST_ID; },
		(value: ExecutionManifestV1B) => { value.cells[0]!.planned_run_id = "v1b-run-01-parse-duration-r1-a"; },
		(value: ExecutionManifestV1B) => { value.cells.push(structuredClone(value.cells[0]!)); },
		(value: ExecutionManifestV1B) => { value.policy.retry_same_run = true as false; },
		(value: ExecutionManifestV1B) => { value.replacement_revision!.replacement_child_attempts_max = 9 as 8; },
	]) { const drift = structuredClone(manifest); mutate(drift); drift.manifest_id = v1bManifestIdentity(drift); assert.throws(() => validateExecutionManifestV1B(drift, PROJECT_ROOT), /Manifest|replacement|forbidden|drift/); }
	const baseState = { predecessor_manifest_id: V1B_REPLACEMENT_PREDECESSOR_MANIFEST_ID, predecessor_started_run_ids: ["v1b-run-01-parse-duration-r1-a"], replacement_started_run_ids: manifest.cells.map((cell) => cell.planned_run_id), replacement_child_attempts: 8, retry_same_run: false, fallback: false, automatic_replacement: false };
	assert.doesNotThrow(() => validateReplacementSequenceStateV1B(manifest, baseState));
	assert.throws(() => validateReplacementSequenceStateV1B(manifest, { ...baseState, replacement_started_run_ids: [...baseState.replacement_started_run_ids, "v1b-replacement-run-25-extra"] }), /cap|membership/);
	assert.throws(() => validateReplacementSequenceStateV1B(manifest, { ...baseState, replacement_started_run_ids: [...baseState.replacement_started_run_ids.slice(0, -1), baseState.predecessor_started_run_ids[0]!] }), /reused/);
	assert.throws(() => validateReplacementSequenceStateV1B(manifest, { ...baseState, predecessor_manifest_id: "wrong" }), /predecessor/);
	assert.throws(() => validateReplacementSequenceStateV1B(manifest, { ...baseState, replacement_child_attempts: 9 }), /child/);
	assert.throws(() => validateReplacementSequenceStateV1B(manifest, { ...baseState, fallback: true }), /retry\/fallback/);
});

test("V1-B Inspector rejects coherently rehashed real-mode counter contradictions", async () => {
	const source = await pausedPilot("after_provider_request_reservation_usage_unavailable", "stage2_real");
	const cell = source.manifest.cells[0]!;
	const sourceInspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: source.pilotRoot, plannedRunId: cell.planned_run_id });
	assert.deepEqual({ valid: sourceInspected.integrity_valid, pause: sourceInspected.pause_integrity_valid, terminal: sourceInspected.terminal_valid, comparable: sourceInspected.comparable }, { valid: true, pause: true, terminal: false, comparable: false }, sourceInspected.errors.join("; "));
	assert.deepEqual(sourceInspected.pause_evidence!.counter_snapshot, { credential_reads: 1, network_calls: 0, provider_calls: 0, model_calls: 0 });
	assert.deepEqual({ tokens: sourceInspected.pause_evidence!.pending_provider_reservation!.tokens, cost: sourceInspected.pause_evidence!.pending_provider_reservation!.cost_usd }, { tokens: 65_536, cost: 0.10 });
	assert.deepEqual({ tokens: sourceInspected.pause_evidence!.conservative_usage_charge.tokens, cost: sourceInspected.pause_evidence!.conservative_usage_charge.cost_usd }, { tokens: 65_536, cost: 0.10 });
	const sourceJournal = readFileSync(resolve(source.pilotRoot, "runs", cell.planned_run_id, "journal.jsonl"), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
	const sourceTransition = sourceJournal.find((event) => event.type === "provider_request_reserved").data.counter_transition;
	for (const key of ["provider_requests", "network_calls", "provider_calls", "model_calls"]) assert.deepEqual(sourceTransition[key], { before: 0, after: 1 });

	const rewriteSnapshot = (label: string, snapshot: PauseEvidenceV1B["counter_snapshot"]): string => {
		const target = root(label); cpSync(source.pilotRoot, target, { recursive: true });
		const runRoot = resolve(target, "runs", cell.planned_run_id); const pausePath = resolve(runRoot, "pause-evidence.json"); const journalPath = resolve(runRoot, "journal.jsonl"); const ledgerPath = resolve(target, "ledger.jsonl");
		const pause = JSON.parse(readFileSync(pausePath, "utf8")) as PauseEvidenceV1B; pause.counter_snapshot = snapshot; writeStable(pausePath, pause);
		const events = readFileSync(journalPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)); const pauseIndex = events.findIndex((event) => event.type === "attempt_paused"); events[pauseIndex].data.pause_evidence_ref = { path: "pause-evidence.json", sha256: fileSha256(pausePath), size_bytes: readFileSync(pausePath).length }; writeFileSync(journalPath, `${events.map(stableJson).join("\n")}\n`, "utf8");
		const ledger = readFileSync(ledgerPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)); ledger.at(-1).pause_evidence_ref = events[pauseIndex].data.pause_evidence_ref; ledger.at(-1).journal_sha256 = fileSha256(journalPath); writeFileSync(ledgerPath, `${ledger.map(stableJson).join("\n")}\n`, "utf8");
		return target;
	};
	const possibleDispatch = rewriteSnapshot("pause-valid-possible-dispatch", { credential_reads: 1, network_calls: 1, provider_calls: 1, model_calls: 1 });
	const possibleInspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: possibleDispatch, plannedRunId: cell.planned_run_id }); assert.equal(possibleInspected.integrity_valid, true, possibleInspected.errors.join("; "));
	const mixed = rewriteSnapshot("pause-invalid-mixed-dispatch", { credential_reads: 1, network_calls: 1, provider_calls: 0, model_calls: 1 });
	const mixedInspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: mixed, plannedRunId: cell.planned_run_id }); assert.equal(mixedInspected.integrity_valid, false); assert.match(mixedInspected.errors.join("; "), /snapshot\/mode drift/);

	const copy = root("pause-coherent-counter-contradiction"); cpSync(source.pilotRoot, copy, { recursive: true });
	const runRoot = resolve(copy, "runs", cell.planned_run_id); const pausePath = resolve(runRoot, "pause-evidence.json"); const journalPath = resolve(runRoot, "journal.jsonl"); const ledgerPath = resolve(copy, "ledger.jsonl");
	const pause = JSON.parse(readFileSync(pausePath, "utf8")) as PauseEvidenceV1B;
	const events = readFileSync(journalPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
	const reservation = events.find((event) => event.type === "provider_request_reserved");
	for (const key of ["network_calls", "provider_calls", "model_calls"]) reservation.data.counter_transition[key].after = reservation.data.counter_transition[key].before;
	pause.counter_snapshot = { credential_reads: 1, network_calls: 1, provider_calls: 1, model_calls: 1 };
	const pauseIndex = events.findIndex((event) => event.type === "attempt_paused");
	const prefix = `${events.slice(0, pauseIndex).map(stableJson).join("\n")}\n`; pause.journal_prefix_sha256 = sha256(prefix); writeStable(pausePath, pause);
	events[pauseIndex].data.journal_prefix_sha256 = pause.journal_prefix_sha256;
	events[pauseIndex].data.pause_evidence_ref = { path: "pause-evidence.json", sha256: fileSha256(pausePath), size_bytes: readFileSync(pausePath).length };
	writeFileSync(journalPath, `${events.map(stableJson).join("\n")}\n`, "utf8");
	const ledger = readFileSync(ledgerPath, "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)); ledger.at(-1).pause_evidence_ref = events[pauseIndex].data.pause_evidence_ref; ledger.at(-1).journal_sha256 = fileSha256(journalPath); writeFileSync(ledgerPath, `${ledger.map(stableJson).join("\n")}\n`, "utf8");
	const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot: copy, plannedRunId: cell.planned_run_id });
	assert.equal(inspected.integrity_valid, false); assert.match(inspected.errors.join("; "), /transition\/mode drift/);
});

test("V1-B durable typed pause remains primary when Provider access close throws", async () => {
	const marker = "AUDIT_SYNTHETIC_CLOSE_FAILURE";
	class CloseFailAuthority extends OneRunProviderAuthorityV1B {
		override open() { const access = super.open(); return { ...access, close: () => { access.close(); throw new Error(marker); } }; }
	}
	const manifest = buildExecutionManifestV1B(PROJECT_ROOT, { executionMode: "stage2_real", executionBaselineCommit: "e".repeat(40), realExecutionAuthorized: true });
	const pilotRoot = root("typed-pause-close-failure"); initializePilotV1B({ projectRoot: PROJECT_ROOT, pilotRoot, manifest });
	await assert.rejects(() => runNextPilotCellV1B({ projectRoot: PROJECT_ROOT, pilotRoot, deterministicPausePhase: "before_credential_resolution", realExecution: { createAuthority: () => new CloseFailAuthority(true, { resolve: async () => "unused" }) } }), (error: Error) => error instanceof V1BTypedPauseError && !String(error.stack).includes(marker));
	const cell = manifest.cells[0]!; const runRoot = resolve(pilotRoot, "runs", cell.planned_run_id);
	assert.equal(existsSync(resolve(runRoot, "pause-evidence.json")), true);
	assert.deepEqual(readPilotLedgerV1B(pilotRoot).filter((entry) => entry.state !== "planned").map((entry) => entry.state), ["started", "paused"]);
	const journal = readFileSync(resolve(runRoot, "journal.jsonl"), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line)); assert.equal(journal.at(-1).type, "attempt_paused");
	const inspected = inspectV1RunCell({ projectRoot: PROJECT_ROOT, pilotRoot, plannedRunId: cell.planned_run_id }); assert.equal(inspected.pause_integrity_valid, true, inspected.errors.join("; ")); assert.equal(inspected.terminal_valid, false); assert.equal(inspected.comparable, false);
	assert.doesNotMatch([readFileSync(resolve(runRoot, "pause-evidence.json"), "utf8"), readFileSync(resolve(runRoot, "journal.jsonl"), "utf8"), readFileSync(resolve(pilotRoot, "ledger.jsonl"), "utf8")].join("\n"), new RegExp(marker));
});

test("V1-B public replacement handoff requires immutable sequence authority and rejects a second Pilot", async () => {
	const executionBaselineCommit = sha256(root("replacement-sequence-baseline")).slice(0, 40);
	const manifest = buildReplacementExecutionManifestV1B(PROJECT_ROOT, { executionBaselineCommit });
	const manifestPath = resolve(root("replacement-public-manifest"), "manifest.json"); mkdirSync(resolve(manifestPath, ".."), { recursive: true }); writeStable(manifestPath, manifest);
	const authorityPath = resolve(root("replacement-sequence-authority"), "authority.json"); mkdirSync(resolve(authorityPath, ".."), { recursive: true }); writeStable(authorityPath, buildReplacementSequenceAuthorityV1B(manifest));
	const missingPilot = root("replacement-missing-sequence"); assert.throws(() => preflightV1B({ projectRoot: PROJECT_ROOT, manifestPath, pilotRoot: missingPilot }), /sequence authority is required/); assert.equal(existsSync(missingPilot), false);
	const firstPilot = root("replacement-first-pilot"); assert.equal(preflightV1B({ projectRoot: PROJECT_ROOT, manifestPath, pilotRoot: firstPilot, replacementSequenceStatePath: authorityPath }).status, "ready");
	await assert.rejects(() => runNextV1B({ projectRoot: PROJECT_ROOT, manifestPath, pilotRoot: firstPilot, replacementSequenceStatePath: authorityPath, stage2ExecutionAuthority: { authority_id: "v1b-public-pi-one-run", credential_profile_name: "DEEPSEEK_API_KEY", authorized: true, resolver: { resolve: async () => { throw new Error("synthetic resolver boundary"); } } } }), V1BTypedPauseError);
	assert.deepEqual(readPilotLedgerV1B(firstPilot).filter((entry) => entry.state !== "planned").map((entry) => entry.state), ["started", "paused"]);
	const secondPilot = root("replacement-second-pilot"); assert.throws(() => preflightV1B({ projectRoot: PROJECT_ROOT, manifestPath, pilotRoot: secondPilot, replacementSequenceStatePath: authorityPath }), /identity\/order drift/); assert.equal(existsSync(secondPilot), false);
});

test("V1-B replacement sequence coordinator enforces child and start boundaries", () => {
	const manifest = buildReplacementExecutionManifestV1B(PROJECT_ROOT, { executionBaselineCommit: sha256(root("replacement-child-baseline")).slice(0, 40) });
	const authorityPath = resolve(root("replacement-child-authority"), "authority.json"); mkdirSync(resolve(authorityPath, ".."), { recursive: true }); writeStable(authorityPath, buildReplacementSequenceAuthorityV1B(manifest));
	const pilotRoot = root("replacement-child-pilot"); const coordinator = createReplacementSequenceCoordinatorV1B({ projectRoot: PROJECT_ROOT, pilotRoot, manifest, authorityPath, claimIfMissing: true }); coordinator.assertCurrent();
	const runId = manifest.cells[0]!.planned_run_id; coordinator.beforeInitialStart(runId);
	for (let index = 1; index <= 8; index++) coordinator.beforeChildStart(runId, `${runId}-child-${index}`);
	assert.throws(() => coordinator.beforeChildStart(runId, `${runId}-child-9`), /child cap/);
	assert.throws(() => coordinator.beforeInitialStart(runId), /reused Run ID/);
});
