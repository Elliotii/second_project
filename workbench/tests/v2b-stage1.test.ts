import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import test from "node:test";
import type { ArtifactRefV0B } from "../src/contracts/v0b-types.ts";
import { V2B_ATTEMPT_CAPS, V2B_SEQUENCE_CAPS, type AttemptRuntimeEvidenceV2B, type RunTerminalV2B, type UsageV2B } from "../src/contracts/v2b-types.ts";
import { sha256, stableJson } from "../src/hash.ts";
import { inspectSequenceV2B, inspectStage1RunV2B, inspectionFingerprintV2B } from "../src/inspect-v2b.ts";
import {
	createRealExecutionPortV2B,
	createStage1ExecutionAuthorityV2B,
	createStage1RealShapedExecutionPortV2B,
	providerPayloadIdentityV2B,
	RunCredentialLeaseV2B,
	safeProviderProjectionV2B,
} from "../src/pi/pi-run-handle-v2b.ts";
import { createOneRunProviderAuthorityV1B } from "../src/provider/fixed-provider-v1.ts";
import { assertCaseActivationV2B, assertSequenceBudgetCapacityV2B, buildExecutionManifestV2B, executeStage1RunV2B, preflightExecutionManifestV2B, runNextSequenceV2B, V2B_STAGE1_SCENARIOS, type ObservedStage2IdentityV2B, type SequencePortFactoryV2B, type Stage1ScenarioV2B } from "../src/run-v2b.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const ZERO = Object.freeze({ credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 });

function usageV2B(overrides: Partial<UsageV2B> = {}): UsageV2B {
	return { provider_requests: 0, tool_calls: 0, tokens: 0, input_tokens: 0, output_tokens: 0, cache_read_tokens: 0, cache_write_tokens: 0, active_execution_time_ms: 0, verifier_runs: 0, real_cost_usd: 0, conservative_charged_tokens: 0, conservative_charged_cost_usd: 0, ...overrides };
}

function rootFor(label: string): string {
	const parent = resolve(PROJECT_ROOT, ".runs/v2-b/stage1/tests");
	mkdirSync(parent, { recursive: true });
	return resolve(parent, `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeJson(path: string, value: unknown): void {
	writeFileSync(path, `${stableJson(value)}\n`, "utf8");
}

function refreshedRef(ref: ArtifactRefV0B, path: string): ArtifactRefV0B {
	const bytes = readFileSync(path);
	return { ...ref, sha256: sha256(bytes), size_bytes: statSync(path).size };
}

function rewriteSequenceLedger(root: string, entries: any[]): void {
	const ledgerPath = resolve(root, "ledger.jsonl");
	entries.forEach((entry, index) => { entry.seq = index + 1; });
	writeFileSync(ledgerPath, `${entries.map((entry) => stableJson(entry)).join("\n")}\n`, "utf8");
	const terminalPath = resolve(root, "terminal.json");
	const terminal = readJson<any>(terminalPath);
	terminal.ledger_ref = refreshedRef(terminal.ledger_ref, ledgerPath);
	writeJson(terminalPath, terminal);
}

async function makeRun(label: string, scenario: keyof typeof V2B_STAGE1_SCENARIOS): Promise<string> {
	const runRoot = rootFor(label);
	await executeStage1RunV2B({ projectRoot: PROJECT_ROOT, runRoot, runId: `v2b-${label}-${process.pid}`, scenario: V2B_STAGE1_SCENARIOS[scenario]! });
	return runRoot;
}

test("V2-B Gate B/G initial pass uses the real-shaped port with no branch and zero real access", async () => {
	const root = await makeRun("initial-pass", "negative_initial_pass");
	const before = inspectionFingerprintV2B(root);
	const inspected = inspectStage1RunV2B({ projectRoot: PROJECT_ROOT, runRoot: root });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspectionFingerprintV2B(root), before, "Inspector must be read-only");
	assert.equal(inspected.terminal!.outcome, "initial_pass");
	assert.equal(inspected.attempts.length, 1);
	assert.deepEqual(inspected.terminal!.real_call_counters, ZERO);
	assert.deepEqual(inspected.attempts[0]!.counters_before, ZERO);
	assert.deepEqual(inspected.attempts[0]!.counters_after, ZERO);
	for (const path of ["substrate/seed", "substrate/candidates", "substrate/selection.json"]) {
		assert.equal(readFileSync(resolve(root, "terminal.json"), "utf8").includes(path), false);
	}
});

test("V2-B Gates B-D exercise both winners, selector none, budget stop, and conservative usage failure", async () => {
	const cases = [
		["a-selected", "positive_a_selected", "candidate-a"],
		["b-selected", "positive_b_selected", "candidate-b"],
		["none", "positive_none", null],
		["budget", "positive_a_budget_b_selected", "candidate-b"],
	] as const;
	for (const [label, scenario, selectedSuffix] of cases) {
		const root = await makeRun(label, scenario);
		const inspected = inspectStage1RunV2B({ projectRoot: PROJECT_ROOT, runRoot: root });
		assert.equal(inspected.integrity_valid, true, `${label}: ${inspected.errors.join("; ")}`);
		assert.equal(inspected.attempts.length, 3);
		assert.deepEqual(inspected.terminal!.real_call_counters, ZERO);
		if (selectedSuffix === null) assert.equal(inspected.terminal!.selected_candidate_id, null);
		else assert.match(inspected.terminal!.selected_candidate_id!, new RegExp(`${selectedSuffix}$`));
		if (scenario === "positive_a_budget_b_selected") assert.equal(inspected.attempts[1]!.terminal_reason, "budget_stopped");
	}
});

test("V2-B Amendment fail-closes unknown usage, reservation overflow, and non-quiescent Tool cap before Verifier/B", async () => {
	for (const scenario of ["positive_a_usage_invalid_b_selected", "positive_a_token_overflow_b_selected", "positive_a_cost_overflow_b_selected", "positive_a_tool_cap_b_selected"] as const) {
		const runRoot = rootFor(`unsafe-${scenario}`);
		await assert.rejects(() => executeStage1RunV2B({ projectRoot: PROJECT_ROOT, runRoot, runId: `v2b-unsafe-${scenario}`, scenario: V2B_STAGE1_SCENARIOS[scenario]! }), /verifier-safe Agent terminal|runtime-observed pre-dispatch budget stop/);
		assert.equal(existsSync(resolve(runRoot, "substrate/candidates/a/verifier-result.json")), false, scenario);
		assert.equal(existsSync(resolve(runRoot, "substrate/candidates/b/candidate.json")), false, scenario);
	}
});

test("V2-B whole-sequence capacity rejects Group, Attempt, request, tool, token, time, verifier, and cost exhaustion", () => {
	const zeroUsage = (): UsageV2B => ({ provider_requests: 0, tool_calls: 0, tokens: 0, input_tokens: 0, output_tokens: 0, cache_read_tokens: 0, cache_write_tokens: 0, active_execution_time_ms: 0, verifier_runs: 0, real_cost_usd: 0, conservative_charged_tokens: 0, conservative_charged_cost_usd: 0 });
	assert.throws(() => assertSequenceBudgetCapacityV2B({ reservedUsage: zeroUsage(), startedAttempts: 0, groupAttempts: 3 }), /Attempt cap/);
	assert.throws(() => assertSequenceBudgetCapacityV2B({ reservedUsage: zeroUsage(), startedAttempts: V2B_SEQUENCE_CAPS.started_attempts, groupAttempts: 0 }), /Attempt cap/);
	for (const field of ["provider_requests", "tool_calls", "tokens", "active_execution_time_ms", "verifier_runs", "real_cost_usd"] as const) {
		const usage = zeroUsage();
		usage[field] = V2B_SEQUENCE_CAPS[field];
		assert.throws(() => assertSequenceBudgetCapacityV2B({ reservedUsage: usage, startedAttempts: 0, groupAttempts: 0 }), /budget exhausted/, field);
	}
});

test("V2-B Gate B authority and dormant real composition fail closed without credential resolution", async () => {
	let credentialResolverCalls = 0;
	const counters = structuredClone(ZERO);
	const authority = createOneRunProviderAuthorityV1B({
		authorized: true,
		resolver: { resolve: async () => { credentialResolverCalls++; return "must-not-be-read-in-stage1"; } },
	});
	const port = createRealExecutionPortV2B({ runId: "dormant", authority, realCounters: counters, onAttemptEvidence: () => undefined });
	assert.equal(credentialResolverCalls, 0);
	assert.deepEqual(counters, ZERO);
	await port.close!();
	assert.equal(credentialResolverCalls, 0);
	assert.throws(() => createRealExecutionPortV2B({ runId: "reopen", authority, realCounters: counters, onAttemptEvidence: () => undefined }));
	const unauthorized = createOneRunProviderAuthorityV1B({ authorized: false, resolver: { resolve: async () => { credentialResolverCalls++; return "unreachable"; } } });
	assert.throws(() => createRealExecutionPortV2B({ runId: "unauthorized", authority: unauthorized, realCounters: counters, onAttemptEvidence: () => undefined }));
	assert.equal(credentialResolverCalls, 0);
	assert.throws(() => createStage1RealShapedExecutionPortV2B({ authority: {} as never, onAttemptEvidence: () => undefined }));
	const stage1 = createStage1ExecutionAuthorityV2B({ runId: "bounded", caseId: "primary_positive", authorized: true });
	stage1.consume("bounded-primary-attempt-01");
	assert.throws(() => stage1.consume("bounded-primary-attempt-01"));
	assert.throws(() => createStage1ExecutionAuthorityV2B({ runId: "denied", caseId: "negative", authorized: false }).consume("denied-primary-attempt-01"));
});

test("V2-B Gate D enforces immutable contingency activation and rejects repetition", () => {
	assert.doesNotThrow(() => assertCaseActivationV2B("contingency_positive", [{ caseId: "primary_positive", outcome: "initial_pass", evidenceIdentityValid: true, providerRequests: 1 }]));
	assert.doesNotThrow(() => assertCaseActivationV2B("contingency_positive", [{ caseId: "primary_positive", outcome: "pre_dispatch_stop", evidenceIdentityValid: true, providerRequests: 0 }]));
	for (const outcome of ["recovery_selected", "recovery_none", "post_dispatch_invalid"] as const) {
		assert.throws(() => assertCaseActivationV2B("contingency_positive", [{ caseId: "primary_positive", outcome, evidenceIdentityValid: true, providerRequests: 1 }]));
	}
	assert.throws(() => assertCaseActivationV2B("contingency_positive", [{ caseId: "primary_positive", outcome: "pre_dispatch_stop", evidenceIdentityValid: false, providerRequests: 0 }]));
	assert.throws(() => assertCaseActivationV2B("negative", [{ caseId: "negative", outcome: "initial_pass", evidenceIdentityValid: true, providerRequests: 1 }]));
});

test("V2-B Gate E rejects counter, secret, missing, duplicate, cross-run, and source-drift tamper", async () => {
	const source = await makeRun("tamper-source", "positive_a_selected");
	for (const variant of ["counter", "secret", "missing", "duplicate", "cross-run", "source-drift"] as const) {
		const root = rootFor(`tamper-${variant}`);
		cpSync(source, root, { recursive: true });
		let projectRoot = PROJECT_ROOT;
		const terminalPath = resolve(root, "terminal.json");
		const terminal = readJson<RunTerminalV2B>(terminalPath);
		if (variant === "counter") {
			const attemptPath = resolve(root, terminal.attempt_evidence_refs[0]!.path);
			const attempt = readJson<AttemptRuntimeEvidenceV2B>(attemptPath);
			attempt.counters_after.network_calls = 1;
			writeJson(attemptPath, attempt);
			terminal.attempt_evidence_refs[0] = refreshedRef(terminal.attempt_evidence_refs[0]!, attemptPath);
			writeJson(terminalPath, terminal);
		} else if (variant === "secret") {
			writeFileSync(resolve(root, "forbidden-evidence.json"), '{"Authorization":"Bearer forbidden-stage1-value"}\n', "utf8");
		} else if (variant === "missing") {
			terminal.attempt_evidence_refs[0] = { ...terminal.attempt_evidence_refs[0]!, path: "attempts/missing.json" };
			writeJson(terminalPath, terminal);
		} else if (variant === "duplicate") {
			terminal.attempt_evidence_refs[1] = structuredClone(terminal.attempt_evidence_refs[0]!);
			writeJson(terminalPath, terminal);
		} else if (variant === "cross-run") {
			terminal.attempt_evidence_refs[0] = { ...terminal.attempt_evidence_refs[0]!, path: "../foreign.json" };
			writeJson(terminalPath, terminal);
		} else {
			projectRoot = resolve(root, "fake-project");
			cpSync(resolve(PROJECT_ROOT, "workbench/src"), resolve(projectRoot, "workbench/src"), { recursive: true });
			writeFileSync(resolve(projectRoot, "workbench/src/source-drift.ts"), "export const drift = true;\n", "utf8");
		}
		const rejected = inspectStage1RunV2B({ projectRoot, runRoot: root });
		assert.equal(rejected.integrity_valid, false, variant);
	}
});

test("V2-B CLI exposes bounded Stage 1 run and read-only inspect commands", () => {
	const root = rootFor("cli");
	const cli = resolve(PROJECT_ROOT, "workbench/src/cli.ts");
	const run = JSON.parse(execFileSync(process.execPath, [cli, "v2b-stage1", "run", "--run-root", root, "--run-id", "v2b-cli", "--scenario", "negative_initial_pass"], { cwd: PROJECT_ROOT, encoding: "utf8" }));
	assert.equal(run.outcome, "initial_pass");
	assert.deepEqual(run.real_call_counters, ZERO);
	const inspected = JSON.parse(execFileSync(process.execPath, [cli, "v2b-stage1", "inspect", "--run-root", root], { cwd: PROJECT_ROOT, encoding: "utf8" }));
	assert.equal(inspected.integrity_valid, true, inspected.errors?.join("; "));
});

test("V2-B CLI freezes a Stage 2 Manifest and refuses sequence mutation without explicit authority", () => {
	const root = rootFor("stage2-cli-denied");
	const cli = resolve(PROJECT_ROOT, "workbench/src/cli.ts");
	const manifest = JSON.parse(execFileSync(process.execPath, [cli, "v2b-stage2", "build-manifest", "--sequence-id", "v2b-stage2-cli", "--execution-baseline-commit", "a".repeat(40), "--execution-baseline-tree", "b".repeat(40)], { cwd: PROJECT_ROOT, encoding: "utf8" }));
	assert.equal(manifest.stage, "stage2_real");
	assert.deepEqual(manifest.planned_cases.map((entry: { case_id: string }) => entry.case_id), ["primary_positive", "contingency_positive", "negative"]);
	const manifestPath = resolve(rootFor("stage2-cli-manifest"), "manifest.json");
	mkdirSync(resolve(manifestPath, ".."), { recursive: true });
	writeJson(manifestPath, manifest);
	const result = spawnSync(process.execPath, [cli, "v2b-stage2", "run-next", "--manifest", manifestPath, "--sequence-root", root], { cwd: PROJECT_ROOT, encoding: "utf8" });
	assert.equal(result.status, 1);
	assert.match(result.stderr, /FixedProviderBoundaryErrorV1B: V1-B fixed provider boundary failed/);
	assert.equal(existsSync(root), false);
});

function proofIdentity(manifest: ReturnType<typeof buildExecutionManifestV2B>): ObservedStage2IdentityV2B {
	return { executionBaselineCommit: manifest.execution_baseline_commit, executionBaselineTree: manifest.execution_baseline_tree, piCommit: manifest.pi_commit, trackedClean: true, stagedClean: true };
}

function proofPortFactory(): SequencePortFactoryV2B {
	return {
		create: ({ runId, caseId, onAttemptEvidence, onAttemptStarted }) => createStage1RealShapedExecutionPortV2B({
			authority: createStage1ExecutionAuthorityV2B({ runId, caseId, authorized: true }), onAttemptEvidence, onAttemptStarted,
		}),
	};
}

async function finishProofSequence(label: string, scenarioForCase: (caseId: "primary_positive" | "contingency_positive" | "negative") => Stage1ScenarioV2B) {
	const sequenceRoot = rootFor(`sequence-${label}`);
	const manifest = buildExecutionManifestV2B({ projectRoot: PROJECT_ROOT, sequenceId: `v2b-sequence-${label}`, executionBaselineCommit: "a".repeat(40), executionBaselineTree: "b".repeat(40), stage: "stage2_deterministic_proof" });
	let result;
	for (let index = 0; index < 5; index++) {
		result = await runNextSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot, manifest, observedIdentity: proofIdentity(manifest), portFactory: proofPortFactory(), scenarioForCase });
		if ("status" in result) break;
	}
	assert.ok(result && "status" in result, "sequence must terminalize");
	return { sequenceRoot, manifest, terminal: result };
}

test("V2-B corrected Stage 2 Manifest/preflight is immutable, source-bound, and zero-access", () => {
	const manifest = buildExecutionManifestV2B({ projectRoot: PROJECT_ROOT, sequenceId: "v2b-preflight", executionBaselineCommit: "a".repeat(40), executionBaselineTree: "b".repeat(40), stage: "stage2_deterministic_proof" });
	const preflight = preflightExecutionManifestV2B({ projectRoot: PROJECT_ROOT, manifest, observedIdentity: proofIdentity(manifest) });
	assert.deepEqual(preflight.real_call_counters, ZERO);
	assert.equal(preflight.valid, true);
	for (const variant of ["manifest", "source", "baseline", "pi", "dirty", "staged"] as const) {
		const copy = structuredClone(manifest);
		const observed = proofIdentity(copy);
		if (variant === "manifest") copy.manifest_id = "0".repeat(64);
		if (variant === "source") copy.workbench_source_digest = "0".repeat(64);
		if (variant === "baseline") observed.executionBaselineCommit = "c".repeat(40);
		if (variant === "pi") observed.piCommit = "d".repeat(40);
		if (variant === "dirty") observed.trackedClean = false;
		if (variant === "staged") observed.stagedClean = false;
		assert.throws(() => preflightExecutionManifestV2B({ projectRoot: PROJECT_ROOT, manifest: copy, observedIdentity: observed }), /Manifest|source|Gate H/);
	}
});

test("V2-B corrected sequence predeclares all Cases, skips forbidden Contingency, and completes with bounded aggregates", async () => {
	const { sequenceRoot, terminal } = await finishProofSequence("primary-seed", (caseId) => caseId === "primary_positive"
		? V2B_STAGE1_SCENARIOS.positive_a_selected!
		: V2B_STAGE1_SCENARIOS.negative_initial_pass!);
	assert.equal(terminal.status, "completed");
	assert.deepEqual(terminal.real_call_counters, ZERO);
	const before = inspectionFingerprintV2B(sequenceRoot);
	const inspected = inspectSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspectionFingerprintV2B(sequenceRoot), before);
	assert.equal(inspected.ledger.slice(0, 3).map((entry) => entry.state).join(","), "planned,planned,planned");
	assert.ok(inspected.ledger.some((entry) => entry.case_id === "contingency_positive" && entry.state === "skipped"));
	assert.ok(terminal.started_attempts <= 7);
});

test("V2-B corrected sequence activates Contingency only after Primary pass and preserves typed positive-not-triggered Pause", async () => {
	const pass = V2B_STAGE1_SCENARIOS.negative_initial_pass!;
	const recovery = V2B_STAGE1_SCENARIOS.positive_b_selected!;
	const activated = await finishProofSequence("contingency-activated", (caseId) => caseId === "primary_positive" ? { ...pass, caseId } : caseId === "contingency_positive" ? { ...recovery, caseId } : pass);
	assert.equal(activated.terminal.status, "completed");
	assert.equal(inspectSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot: activated.sequenceRoot }).integrity_valid, true);
	const paused = await finishProofSequence("positive-not-triggered", (caseId) => ({ ...pass, caseId }));
	assert.equal(paused.terminal.status, "paused");
	assert.equal(paused.terminal.reason, "positive_not_triggered");
	assert.equal(inspectSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot: paused.sequenceRoot }).integrity_valid, true);
});

test("V2-B correction 2 preserves a Primary zero-dispatch Pause and activates only predeclared Contingency", async () => {
	const sequenceRoot = rootFor("sequence-port-construction-pause");
	const manifest = buildExecutionManifestV2B({ projectRoot: PROJECT_ROOT, sequenceId: "v2b-sequence-port-construction-pause", executionBaselineCommit: "a".repeat(40), executionBaselineTree: "b".repeat(40), stage: "stage2_deterministic_proof" });
	const factory: SequencePortFactoryV2B = { create: (options) => {
		if (options.caseId === "primary_positive") throw new Error("synthetic sanitized construction boundary");
		return proofPortFactory().create(options);
	} };
	const pause = await runNextSequenceV2B({
		projectRoot: PROJECT_ROOT,
		sequenceRoot,
		manifest,
		observedIdentity: proofIdentity(manifest),
		portFactory: factory,
	});
	assert.equal("schema_version" in pause && pause.schema_version, "v2b-case-pause-v1");
	assert.equal("contingency_eligible" in pause && pause.contingency_eligible, true);
	assert.equal("provider_requests" in pause && pause.provider_requests, 0);
	assert.deepEqual(pause.real_call_counters, ZERO);
	const intermediate = inspectSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot });
	assert.equal(intermediate.integrity_valid, true, intermediate.errors.join("; "));
	assert.equal(intermediate.terminal_valid, false);
	let terminal;
	for (let index = 0; index < 4; index++) {
		terminal = await runNextSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot, manifest, observedIdentity: proofIdentity(manifest), portFactory: factory, scenarioForCase: (caseId) => caseId === "contingency_positive" ? { ...V2B_STAGE1_SCENARIOS.positive_a_selected!, caseId } : V2B_STAGE1_SCENARIOS.negative_initial_pass! });
		if ("status" in terminal) break;
	}
	assert.equal(terminal && "status" in terminal && terminal.status, "completed");
	const inspected = inspectSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.ok(inspected.ledger.some((entry) => entry.case_id === "primary_positive" && entry.state === "paused"));
	assert.ok(inspected.ledger.some((entry) => entry.case_id === "contingency_positive" && entry.state === "terminal"));
});

test("V2-B correction 2 makes post-dispatch Primary Pause ineligible with no Contingency authority", async () => {
	const sequenceRoot = rootFor("sequence-post-dispatch-pause");
	const manifest = buildExecutionManifestV2B({ projectRoot: PROJECT_ROOT, sequenceId: "v2b-sequence-post-dispatch-pause", executionBaselineCommit: "a".repeat(40), executionBaselineTree: "b".repeat(40), stage: "stage2_deterministic_proof" });
	const terminal = await runNextSequenceV2B({
		projectRoot: PROJECT_ROOT, sequenceRoot, manifest, observedIdentity: proofIdentity(manifest),
		portFactory: { create: ({ runId, onAttemptStarted, onAttemptEvidence }) => ({ execute: async () => {
			const attemptId = `${runId}-primary-attempt-01`;
			onAttemptStarted({ attemptId, role: "primary" });
			onAttemptEvidence({ attempt_id: attemptId, role: "primary", usage: usageV2B({ provider_requests: 1 }) } as AttemptRuntimeEvidenceV2B);
			throw new Error("synthetic post-dispatch boundary");
		} }) },
		scenarioForCase: () => V2B_STAGE1_SCENARIOS.positive_a_selected!,
	});
	assert.equal("status" in terminal && terminal.status, "paused");
	assert.equal("reason" in terminal && terminal.reason, "run_invalid");
	const inspected = inspectSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspected.ledger.some((entry) => entry.case_id === "contingency_positive" && entry.state === "started"), false);
});

test("V2-B correction 2 rejects tampered zero-dispatch Pause identity, counters, and Provider-request facts", async () => {
	const sourceRoot = rootFor("sequence-zero-dispatch-pause-source");
	const manifest = buildExecutionManifestV2B({ projectRoot: PROJECT_ROOT, sequenceId: "v2b-sequence-zero-dispatch-pause-source", executionBaselineCommit: "a".repeat(40), executionBaselineTree: "b".repeat(40), stage: "stage2_deterministic_proof" });
	await runNextSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot: sourceRoot, manifest, observedIdentity: proofIdentity(manifest), portFactory: { create: () => { throw new Error("synthetic construction stop"); } } });
	for (const variant of ["identity", "counter", "provider"] as const) {
		const root = rootFor(`sequence-zero-pause-tamper-${variant}`);
		cpSync(sourceRoot, root, { recursive: true });
		const pausePath = resolve(root, "pauses/primary_positive.json");
		const pause = readJson<any>(pausePath);
		if (variant === "identity") pause.execution_baseline_commit = "c".repeat(40);
		if (variant === "counter") pause.real_call_counters.network_calls = 1;
		if (variant === "provider") pause.provider_requests = 1;
		writeJson(pausePath, pause);
		const ledgerPath = resolve(root, "ledger.jsonl");
		const entries = readFileSync(ledgerPath, "utf8").trim().split("\n").map((line) => JSON.parse(line));
		const paused = entries.find((entry) => entry.state === "paused");
		paused.case_pause_ref = refreshedRef(paused.case_pause_ref, pausePath);
		writeFileSync(ledgerPath, `${entries.map((entry) => stableJson(entry)).join("\n")}\n`, "utf8");
		const inspected = inspectSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot: root });
		assert.equal(inspected.integrity_valid, false, variant);
		if (variant === "provider") {
			const stopped = await runNextSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot: root, manifest, observedIdentity: proofIdentity(manifest), portFactory: proofPortFactory() });
			assert.equal("reason" in stopped && stopped.reason, "run_invalid");
			const after = readFileSync(ledgerPath, "utf8").trim().split("\n").map((line) => JSON.parse(line));
			assert.equal(after.some((entry) => entry.case_id === "contingency_positive" && entry.state === "started"), false);
		}
	}
});

test("V2-B corrected sequence Inspector rejects ledger, activation, budget, source, baseline, and cross-run tamper", async () => {
	const valid = await finishProofSequence("sequence-tamper-source", (caseId) => caseId === "primary_positive" ? V2B_STAGE1_SCENARIOS.positive_a_selected! : V2B_STAGE1_SCENARIOS.negative_initial_pass!);
	for (const variant of ["ledger", "activation", "budget", "source", "baseline", "cross-run"] as const) {
		const root = rootFor(`sequence-tamper-${variant}`);
		cpSync(valid.sequenceRoot, root, { recursive: true });
		if (variant === "ledger" || variant === "activation" || variant === "budget") {
			const path = resolve(root, "ledger.jsonl");
			const entries = readFileSync(path, "utf8").trim().split("\n").map((line) => JSON.parse(line));
			if (variant === "ledger") entries[3].seq = 99;
			if (variant === "activation") entries.find((entry) => entry.case_id === "contingency_positive" && entry.state === "skipped").state = "terminal";
			if (variant === "budget") entries.find((entry) => entry.attempt_id).reserved_usage.tokens += 1;
			writeFileSync(path, `${entries.map((entry) => stableJson(entry)).join("\n")}\n`, "utf8");
		} else if (variant === "source" || variant === "baseline") {
			const path = resolve(root, "manifest.json");
			const manifest = readJson<any>(path);
			if (variant === "source") manifest.workbench_source_digest = "0".repeat(64);
			else manifest.execution_baseline_commit = "c".repeat(40);
			writeJson(path, manifest);
		} else {
			const path = resolve(root, "ledger.jsonl");
			const entries = readFileSync(path, "utf8").trim().split("\n").map((line) => JSON.parse(line));
			entries.find((entry) => entry.state === "terminal").planned_run_id = "foreign-run";
			writeFileSync(path, `${entries.map((entry) => stableJson(entry)).join("\n")}\n`, "utf8");
		}
		const inspected = inspectSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot: root });
		assert.equal(inspected.integrity_valid, false, variant);
	}
});

test("V2-B correction 2 Inspector rejects missing, extra, wrong-role, transition, and Case-terminal linkage tamper", async () => {
	const valid = await finishProofSequence("sequence-linkage-tamper-source", (caseId) => caseId === "primary_positive" ? V2B_STAGE1_SCENARIOS.positive_a_selected! : V2B_STAGE1_SCENARIOS.negative_initial_pass!);
	for (const variant of ["missing-attempt", "extra-attempt", "wrong-role", "transition-order", "case-terminal-refs"] as const) {
		const root = rootFor(`sequence-linkage-tamper-${variant}`);
		cpSync(valid.sequenceRoot, root, { recursive: true });
		const ledgerPath = resolve(root, "ledger.jsonl");
		const entries = readFileSync(ledgerPath, "utf8").trim().split("\n").map((line) => JSON.parse(line));
		const firstAttemptIndex = entries.findIndex((entry) => entry.case_id === "primary_positive" && entry.attempt_id);
		const caseStartIndex = entries.findIndex((entry) => entry.case_id === "primary_positive" && entry.state === "started" && entry.attempt_id === null);
		if (variant === "missing-attempt") entries.splice(firstAttemptIndex, 1);
		if (variant === "extra-attempt") entries.splice(firstAttemptIndex + 1, 0, { ...structuredClone(entries[firstAttemptIndex]), attempt_id: "foreign-attempt" });
		if (variant === "wrong-role") entries[firstAttemptIndex].attempt_role = "fresh_session_from_failure_seed";
		if (variant === "transition-order") [entries[caseStartIndex], entries[firstAttemptIndex]] = [entries[firstAttemptIndex], entries[caseStartIndex]];
		if (variant === "case-terminal-refs") {
			const terminalPath = resolve(root, "terminal.json");
			const terminal = readJson<any>(terminalPath);
			terminal.case_terminal_refs = terminal.case_terminal_refs.slice(1);
			writeJson(terminalPath, terminal);
		} else rewriteSequenceLedger(root, entries);
		const inspected = inspectSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot: root });
		assert.equal(inspected.integrity_valid, false, variant);
		assert.match(inspected.errors.join("; "), variant === "case-terminal-refs" ? /terminal Case refs/ : variant === "transition-order" ? /transition/ : /Attempt|aggregate/);
	}
});

test("V2-B Credential lease resolves an injected no-secret value once per Run and clears on close", async () => {
	let calls = 0;
	const counters = structuredClone(ZERO);
	const access = {
		profile: { provider: "deepseek", model: "deepseek-v4-flash", endpoint: "https://api.deepseek.com/chat/completions", alternate_model: false, fallback: false, retry: false, requires_v1b_preflight_revalidation: true } as const,
		resolveCredential: async () => { calls++; return "synthetic-test-only"; }, assertOpen: () => undefined, close: () => undefined,
	};
	const lease = new RunCredentialLeaseV2B(access, counters);
	assert.equal(await lease.resolve(), "synthetic-test-only");
	assert.equal(await lease.resolve(), "synthetic-test-only");
	assert.equal(calls, 1);
	assert.equal(counters.credential_reads, 1);
	lease.clear();
});

test("V2-B safe Provider projection retains max_tokens and redacts only secret/reasoning fields", () => {
	const base = { model: "deepseek-v4-flash", max_tokens: 1024, headers: { Authorization: "Bearer synthetic", "x-safe": "ok" }, reasoning_content: "hidden", signature: "hidden" };
	const changed = { ...base, max_tokens: 2048 };
	assert.notEqual(providerPayloadIdentityV2B(base), providerPayloadIdentityV2B(changed));
	const projected = JSON.stringify(safeProviderProjectionV2B(base));
	assert.match(projected, /max_tokens/);
	assert.doesNotMatch(projected, /synthetic|reasoning|signature|Authorization/i);
});
