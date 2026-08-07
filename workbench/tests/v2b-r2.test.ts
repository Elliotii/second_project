import assert from "node:assert/strict";
import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { ArtifactRefV0B } from "../src/contracts/v0b-types.ts";
import type { AttemptRuntimeEvidenceV2B, RunTerminalV2B } from "../src/contracts/v2b-types.ts";
import type { CandidatePathV2A, RecoverySeedV2A, RunTerminalV2A } from "../src/contracts/v2-types.ts";
import { sha256, stableJson, treeDigest } from "../src/hash.ts";
import { inspectSequenceV2B, inspectStage1RunV2B, inspectionFingerprintV2B } from "../src/inspect-v2b.ts";
import { scanEvidenceBytesV2, validateSessionToolLineageV2 } from "../src/inspect-v2.ts";
import { createRealExecutionPortV2B, createStage1ExecutionAuthorityV2B, createStage1RealShapedExecutionPortV2B } from "../src/pi/pi-run-handle-v2b.ts";
import { createOneRunProviderAuthorityV1B } from "../src/provider/fixed-provider-v1.ts";
import { buildExecutionManifestV2B, executeStage1RunV2B, preflightExecutionManifestV2B, runNextSequenceV2B, V2B_STAGE1_SCENARIOS, type ObservedStage2IdentityV2B, type SequencePortFactoryV2B } from "../src/run-v2b.ts";
import { createDeterministicExecutionPortV2A, executeRecoveryGroupFromSeedV2, executeRunV2A, prepareAndFreezeRecoverySeedV2, type ExecutionPortV2, type HarnessResultV2A } from "../src/run-v2.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const ZERO = Object.freeze({ credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 });

function rootFor(label: string): string {
	const parent = resolve(PROJECT_ROOT, ".runs/v2-b/r2-stage1/tests");
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
	return { ...ref, sha256: sha256(readFileSync(path)), size_bytes: statSync(path).size };
}

async function makeControlled(label: string, scenario: "r2_controlled_a_selected" | "r2_controlled_b_selected" | "r2_controlled_none" | "r2_controlled_a_budget_b_selected"): Promise<string> {
	const runRoot = rootFor(label);
	await executeStage1RunV2B({ projectRoot: PROJECT_ROOT, runRoot, runId: `v2b-r2-${label}-${process.pid}`, scenario: V2B_STAGE1_SCENARIOS[scenario]! });
	return runRoot;
}

function proofIdentity(manifest: ReturnType<typeof buildExecutionManifestV2B>): ObservedStage2IdentityV2B {
	return { executionBaselineCommit: manifest.execution_baseline_commit, executionBaselineTree: manifest.execution_baseline_tree, piCommit: manifest.pi_commit, trackedClean: true, stagedClean: true };
}

function zeroCallPortFactory(): SequencePortFactoryV2B {
	return {
		create: ({ runId, caseId, onAttemptEvidence, onAttemptStarted }) => createStage1RealShapedExecutionPortV2B({
			authority: createStage1ExecutionAuthorityV2B({ runId, caseId, authorized: true }), onAttemptEvidence, onAttemptStarted,
		}),
	};
}

test("R2-B controlled Seed uses Direct AgentHarness Tool/JSONL lifecycle, maintenance pass, target fail, and shared Controller seams", async () => {
	assert.equal(typeof prepareAndFreezeRecoverySeedV2, "function");
	assert.equal(typeof executeRecoveryGroupFromSeedV2, "function");
	const runRoot = await makeControlled("controlled-seed", "r2_controlled_a_selected");
	const before = inspectionFingerprintV2B(runRoot);
	const inspected = inspectStage1RunV2B({ projectRoot: PROJECT_ROOT, runRoot });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspectionFingerprintV2B(runRoot), before, "R2 Inspector must be read-only");
	assert.deepEqual(inspected.terminal!.real_call_counters, ZERO);
	assert.equal(inspected.attempts[0]!.agent_completion, "settled");
	assert.deepEqual(inspected.attempts[0]!.counters_after, ZERO);

	const substrateRoot = resolve(runRoot, "substrate");
	const substrate = readJson<RunTerminalV2A>(resolve(substrateRoot, "terminal.json"));
	const seed = readJson<RecoverySeedV2A>(resolve(substrateRoot, substrate.recovery_seed_ref!.path));
	const maintenance = readJson<{ status: string; exit_code: number }>(resolve(substrateRoot, substrate.primary_maintenance_check_ref!.path));
	const target = readJson<{ status: string }>(resolve(substrateRoot, substrate.primary_verifier_result_ref.path));
	assert.equal(maintenance.status, "passed");
	assert.equal(maintenance.exit_code, 0);
	assert.equal(target.status, "failed");
	assert.equal(seed.created_before_candidate_attempts, true);
	assert.equal(seed.maintenance_check_ref!.sha256, substrate.primary_maintenance_check_ref!.sha256);
	assert.equal(seed.controlled_seed_provenance_ref!.path, "config/controlled-seed-provenance.json");

	const fixture = readFileSync(resolve(PROJECT_ROOT, "fixtures/recovery/v2b-r2/partial-subject.ts"));
	assert.equal(sha256(fixture), "ac487bcab206535edf13ad2b77c5052f552ab0d27bcd8071b457d4bd187da1d9");
	assert.deepEqual(readFileSync(resolve(substrateRoot, "primary/workspace/src/subject.ts")), fixture);
	assert.deepEqual(readFileSync(resolve(substrateRoot, "seed/workspace/src/subject.ts")), fixture);
	assert.equal(treeDigest(resolve(substrateRoot, "seed/workspace")), seed.failed_workspace_snapshot_digest);

	const journal = readFileSync(resolve(substrateRoot, "journal.jsonl"), "utf8").trim().split("\n").map((line) => JSON.parse(line) as { type: string });
	const types = journal.map((entry) => entry.type);
	assert.ok(types.indexOf("primary_settled") < types.indexOf("primary_maintenance_completed"));
	assert.ok(types.indexOf("primary_maintenance_completed") < types.indexOf("primary_verifier_completed"));
	assert.ok(types.indexOf("seed_frozen") < types.indexOf("candidate_started"));

	const parentLines = readFileSync(resolve(substrateRoot, substrate.primary_session_ref.path), "utf8").trim().split("\n").map((line) => JSON.parse(line) as Record<string, unknown>);
	const toolErrors: string[] = [];
	validateSessionToolLineageV2(parentLines.slice(1), toolErrors, "controlled parent Session");
	assert.deepEqual(toolErrors, []);
	const serialized = stableJson(parentLines);
	assert.match(serialized, /workspace_write/);
	assert.match(serialized, /run_command/);
	assert.match(serialized, /toolResult/);

	const [candidateA, candidateB] = substrate.candidate_refs.map((ref) => readJson<CandidatePathV2A>(resolve(substrateRoot, ref.path)));
	assert.equal(candidateA!.initial_workspace_digest, seed.failed_workspace_snapshot_digest);
	assert.equal(candidateB!.initial_workspace_digest, seed.failed_workspace_snapshot_digest);
	assert.equal(candidateA!.common_artifact_digest, candidateB!.common_artifact_digest);
	assert.equal(candidateA!.parent_history_entry_count > 0, true);
	assert.equal(candidateB!.parent_history_entry_count, 0);
	assert.equal(candidateA!.verifier_status, "passed");
	assert.equal(candidateB!.verifier_status, "failed", "F2P/P2P failure evidence must remain visible");
});

test("R2-B controlled A/B selection covers pass/fail, fail/pass, fail/fail and preserves common-input fairness", async () => {
	for (const [scenario, selected] of [
		["r2_controlled_a_selected", "candidate-a"],
		["r2_controlled_b_selected", "candidate-b"],
		["r2_controlled_none", null],
	] as const) {
		const root = await makeControlled(`selection-${scenario}`, scenario);
		const inspected = inspectStage1RunV2B({ projectRoot: PROJECT_ROOT, runRoot: root });
		assert.equal(inspected.integrity_valid, true, `${scenario}: ${inspected.errors.join("; ")}`);
		if (selected === null) assert.equal(inspected.terminal!.selected_candidate_id, null);
		else assert.match(inspected.terminal!.selected_candidate_id!, new RegExp(`${selected}$`));
		assert.equal(inspected.attempts[1]!.composition.common_input_sha256, inspected.attempts[2]!.composition.common_input_sha256);
		assert.deepEqual(inspected.terminal!.real_call_counters, ZERO);
	}
});

test("R2-C safe pre-dispatch budget terminal is quiescent, verified once, retained, and tamper-evident", async () => {
	const source = await makeControlled("safe-budget", "r2_controlled_a_budget_b_selected");
	const inspected = inspectStage1RunV2B({ projectRoot: PROJECT_ROOT, runRoot: source });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	const attempt = inspected.attempts[1]!;
	assert.equal(attempt.agent_completion, "pre_dispatch_budget_terminal");
	assert.equal(attempt.terminal_reason, "budget_stopped");
	assert.equal(attempt.settled, false);
	assert.deepEqual(attempt.quiescence, {
		pre_dispatch_refusal: true,
		pending_provider_responses: 0,
		pending_tool_calls: 0,
		pending_side_effects: 0,
		prior_usage_known: true,
		session_persisted: true,
		workspace_persisted: true,
		evidence_closed: true,
	});
	assert.equal(attempt.usage.verifier_runs, 1);
	assert.equal(existsSync(resolve(source, "substrate/candidates/a/verifier-result.json")), true);
	assert.match(inspected.terminal!.selected_candidate_id!, /candidate-b$/);
	const substrate = readJson<RunTerminalV2A>(resolve(source, "substrate/terminal.json"));
	const candidateA = readJson<CandidatePathV2A>(resolve(source, "substrate", substrate.candidate_refs[0]!.path));
	assert.ok(candidateA.pre_verifier_checkpoint_ref);
	const checkpoint = readJson<{ session_snapshot_ref: ArtifactRefV0B; workspace_snapshot_ref: ArtifactRefV0B }>(resolve(source, "substrate", candidateA.pre_verifier_checkpoint_ref.path));
	const journal = readFileSync(resolve(source, "substrate/journal.jsonl"), "utf8").trim().split("\n").map((line) => JSON.parse(line) as { type: string; data?: { candidate_path_id?: string } });
	const checkpointIndex = journal.findIndex((entry) => entry.type === "candidate_pre_verifier_checkpoint" && entry.data?.candidate_path_id === candidateA.candidate_path_id);
	const verifierIndex = journal.findIndex((entry) => entry.type === "candidate_verifier_completed" && entry.data?.candidate_path_id === candidateA.candidate_path_id);
	assert.ok(checkpointIndex >= 0 && verifierIndex > checkpointIndex, "raw checkpoint must be durable before Verifier");

	for (const field of ["pre_dispatch_refusal", "prior_usage_known", "session_persisted", "workspace_persisted", "evidence_closed"] as const) {
		const root = rootFor(`budget-tamper-${field}`);
		cpSync(source, root, { recursive: true });
		const terminalPath = resolve(root, "terminal.json");
		const terminal = readJson<RunTerminalV2B>(terminalPath);
		const attemptPath = resolve(root, terminal.attempt_evidence_refs[1]!.path);
		const changed = readJson<AttemptRuntimeEvidenceV2B>(attemptPath);
		changed.quiescence![field] = false;
		writeJson(attemptPath, changed);
		terminal.attempt_evidence_refs[1] = refreshedRef(terminal.attempt_evidence_refs[1]!, attemptPath);
		writeJson(terminalPath, terminal);
		const rejected = inspectStage1RunV2B({ projectRoot: PROJECT_ROOT, runRoot: root });
		assert.equal(rejected.integrity_valid, false, field);
		assert.match(rejected.errors.join("; "), /quiescence/);
	}

	for (const variant of ["session-reopen", "workspace-snapshot", "tool-result", "journal-order", "reservation-closure"] as const) {
		const root = rootFor(`raw-checkpoint-tamper-${variant}`);
		cpSync(source, root, { recursive: true });
		const localCheckpointPath = resolve(root, "substrate", candidateA.pre_verifier_checkpoint_ref!.path);
		const localCheckpoint = readJson<{ session_snapshot_ref: ArtifactRefV0B; workspace_snapshot_ref: ArtifactRefV0B }>(localCheckpointPath);
		if (variant === "session-reopen") unlinkSync(resolve(root, "substrate", localCheckpoint.session_snapshot_ref.path));
		if (variant === "workspace-snapshot") appendFileSync(resolve(root, "substrate", localCheckpoint.workspace_snapshot_ref.path), " ", "utf8");
		if (variant === "tool-result") {
			const path = resolve(root, "substrate", localCheckpoint.session_snapshot_ref.path);
			const lines = readFileSync(path, "utf8").trim().split("\n");
			const index = lines.findIndex((line) => line.includes('"role":"toolResult"'));
			assert.ok(index >= 0);
			lines.splice(index, 1);
			writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
		}
		if (variant === "journal-order") {
			const path = resolve(root, "substrate/journal.jsonl");
			const events = readFileSync(path, "utf8").trim().split("\n").map((line) => JSON.parse(line) as { seq: number; type: string; data?: { candidate_path_id?: string } });
			const before = events.findIndex((entry) => entry.type === "candidate_pre_verifier_checkpoint" && entry.data?.candidate_path_id === candidateA.candidate_path_id);
			const after = events.findIndex((entry) => entry.type === "candidate_verifier_completed" && entry.data?.candidate_path_id === candidateA.candidate_path_id);
			[events[before], events[after]] = [events[after]!, events[before]!];
			for (const [index, event] of events.entries()) event.seq = index + 1;
			writeFileSync(path, `${events.map(stableJson).join("\n")}\n`, "utf8");
		}
		if (variant === "reservation-closure") {
			const outer = readJson<RunTerminalV2B>(resolve(root, "terminal.json"));
			const attemptPath = resolve(root, outer.attempt_evidence_refs[1]!.path);
			const changed = readJson<AttemptRuntimeEvidenceV2B>(attemptPath);
			changed.reservations[0]!.phase = "reserved_before_dispatch";
			writeJson(attemptPath, changed);
			outer.attempt_evidence_refs[1] = refreshedRef(outer.attempt_evidence_refs[1]!, attemptPath);
			writeJson(resolve(root, "terminal.json"), outer);
		}
		const rejected = inspectStage1RunV2B({ projectRoot: PROJECT_ROOT, runRoot: root });
		assert.equal(rejected.integrity_valid, false, variant);
	}
});

test("R2-MR raw gate stops before Verifier and injected legacy-shaped data cannot bypass Controller authority", async () => {
	const primary = createDeterministicExecutionPortV2A();
	const runId = `v2b-r2-raw-gate-${process.pid}`;
	const faultRoot = rootFor("runtime-raw-fault");
	const attempts: AttemptRuntimeEvidenceV2B[] = [];
	const faultPort = createStage1RealShapedExecutionPortV2B({
		authority: createStage1ExecutionAuthorityV2B({ runId, caseId: "primary_positive", authorized: true }),
		onAttemptEvidence: (evidence) => attempts.push(evidence),
		runtimeObservationFaultRole: "continue_failed_session",
	});
	await assert.rejects(() => executeRunV2A({
		projectRoot: PROJECT_ROOT, runRoot: faultRoot, runId, primaryMode: "fail", candidateModes: ["budget_stop", "pass"],
		primaryExecutionPort: primary, candidateExecutionPort: faultPort, realCallCounters: structuredClone(ZERO),
	}), /runtime-observed pre-dispatch budget stop|raw pre-Verifier quiescence checkpoint failed/);
	assert.equal(existsSync(resolve(faultRoot, "candidates/a/verifier-result.json")), false);
	assert.equal(attempts[0]!.usage.verifier_runs, 0);
	await faultPort.close?.();

	let injectedCalls = 0;
	const crafted: ExecutionPortV2 = {
		execute: async (): Promise<HarnessResultV2A> => {
			injectedCalls++;
			return {
				settled: false,
				terminalReason: "budget_stopped",
				agentCompletion: "pre_dispatch_budget_terminal",
				runtimeBudgetStopObservation: {
					pre_dispatch_refusal: true,
					pending_provider_responses: 0,
					pending_provider_reservation: false,
					pending_tool_calls: 0,
					prior_usage_known: true,
					reservations_reconciled: true,
				},
				providerDispatches: 0,
				toolCalls: 0,
				tokens: 0,
				activeExecutionTimeMs: 0,
				contextMessageCount: 0,
				legacyVerifierEligibleBudgetStop: true,
			} as HarnessResultV2A;
		},
	};
	const legacyRoot = rootFor("crafted-legacy-bypass");
	await assert.rejects(() => executeRunV2A({
		projectRoot: PROJECT_ROOT, runRoot: legacyRoot, runId: `v2b-r2-crafted-${process.pid}`, primaryMode: "fail", candidateModes: ["budget_stop", "pass"],
		primaryExecutionPort: createDeterministicExecutionPortV2A(), candidateExecutionPort: crafted, realCallCounters: structuredClone(ZERO),
	}), /raw pre-Verifier quiescence checkpoint failed/);
	assert.equal(injectedCalls, 1);
	assert.equal(existsSync(resolve(legacyRoot, "candidates/a/verifier-result.json")), false);
});

test("R2-C schema-aware evidence boundary allows only finite non-negative message.usage.reasoning and retains Tool linkage checks", () => {
	const errors: string[] = [];
	scanEvidenceBytesV2(Buffer.from('{"type":"message","message":{"role":"assistant","usage":{"reasoning":0}}}\n'), "session.jsonl", errors);
	assert.deepEqual(errors, []);
	for (const text of [
		'{"message":{"usage":{"reasoning":-1}}}\n',
		'{"message":{"usage":{"reasoning":"1"}}}\n',
		'{"message":{"reasoning":1}}\n',
		'{"wrapper":{"message":{"usage":{"reasoning":1}}}}\n',
		'{"message":{"reasoning_content":"private"}}\n',
		'{"message":{"thinkingSignature":"opaque"}}\n',
		'{"Authorization":"Bearer synthetic-secret"}\n',
		'{"message":{"usage":{"reasoning":',
	]) {
		const rejected: string[] = [];
		scanEvidenceBytesV2(Buffer.from(text), "session.jsonl", rejected);
		assert.ok(rejected.length > 0, text);
	}
	const validEntries = [
		{ message: { role: "assistant", content: [{ type: "toolCall", id: "call-1", name: "workspace_write" }] } },
		{ message: { role: "toolResult", toolCallId: "call-1" } },
	];
	const validToolErrors: string[] = [];
	validateSessionToolLineageV2(validEntries, validToolErrors);
	assert.deepEqual(validToolErrors, []);
	for (const invalid of [
		[validEntries[0]!],
		[{ message: { role: "toolResult", toolCallId: "foreign" } }],
		[validEntries[0]!, validEntries[0]!, validEntries[1]!],
	]) {
		const invalidErrors: string[] = [];
		validateSessionToolLineageV2(invalid, invalidErrors);
		assert.ok(invalidErrors.length > 0);
	}
});

test("R2-D Negative settles, passes target Verifier, creates no recovery objects, and dormant real construction stays zero-access", async () => {
	const runRoot = rootFor("negative");
	await executeStage1RunV2B({ projectRoot: PROJECT_ROOT, runRoot, runId: `v2b-r2-negative-${process.pid}`, scenario: V2B_STAGE1_SCENARIOS.negative_initial_pass! });
	const inspected = inspectStage1RunV2B({ projectRoot: PROJECT_ROOT, runRoot });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspected.terminal!.outcome, "initial_pass");
	assert.equal(inspected.attempts.length, 1);
	for (const path of ["substrate/seed", "substrate/candidates", "substrate/selection.json"]) assert.equal(existsSync(resolve(runRoot, path)), false);

	let resolverCalls = 0;
	const counters = structuredClone(ZERO);
	const port = createRealExecutionPortV2B({
		runId: "r2-dormant",
		authority: createOneRunProviderAuthorityV1B({ authorized: true, resolver: { resolve: async () => { resolverCalls++; return "synthetic-unread"; } } }),
		realCounters: counters,
		onAttemptEvidence: () => undefined,
	});
	assert.equal(resolverCalls, 0);
	assert.deepEqual(counters, ZERO);
	await port.close!();
	assert.equal(resolverCalls, 0);
});

test("R2-D frozen no-source-edit sequence preflights, consumes the controlled Seed path, skips Contingency, and completes one Negative", async () => {
	const sequenceRoot = rootFor("frozen-sequence");
	const manifest = buildExecutionManifestV2B({
		projectRoot: PROJECT_ROOT,
		sequenceId: `v2b-r2-sequence-${process.pid}`,
		executionBaselineCommit: "a".repeat(40),
		executionBaselineTree: "b".repeat(40),
		stage: "stage2_deterministic_proof",
	});
	const identity = proofIdentity(manifest);
	assert.deepEqual(preflightExecutionManifestV2B({ projectRoot: PROJECT_ROOT, manifest, observedIdentity: identity }).real_call_counters, ZERO);
	let result;
	for (let step = 0; step < 4; step++) {
		result = await runNextSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot, manifest, observedIdentity: identity, portFactory: zeroCallPortFactory() });
		if ("status" in result) break;
	}
	assert.ok(result && "status" in result, "frozen R2 sequence must reach its typed terminal");
	assert.equal(result.status, "completed");
	assert.equal(result.reason, "sequence_completed");
	assert.deepEqual(result.real_call_counters, ZERO);
	assert.equal(result.actual_usage.real_cost_usd, 0);
	const inspected = inspectSequenceV2B({ projectRoot: PROJECT_ROOT, sequenceRoot });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspected.terminal!.status, "completed");
	assert.deepEqual(inspected.terminal!.real_call_counters, ZERO);
	assert.deepEqual(inspected.ledger.filter((entry) => entry.state === "terminal").map((entry) => entry.case_id), ["primary_positive", "negative"]);
	assert.deepEqual(inspected.ledger.filter((entry) => entry.state === "skipped").map((entry) => entry.case_id), ["contingency_positive"]);
	const positive = readJson<RunTerminalV2B>(resolve(sequenceRoot, inspected.terminal!.case_terminal_refs[0]!.path));
	const negative = readJson<RunTerminalV2B>(resolve(sequenceRoot, inspected.terminal!.case_terminal_refs[1]!.path));
	assert.equal(positive.outcome, "recovery_selected");
	assert.equal(positive.attempt_evidence_refs.length, 3);
	assert.equal(negative.outcome, "initial_pass");
	assert.equal(negative.attempt_evidence_refs.length, 1);
});
