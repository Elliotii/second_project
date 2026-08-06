import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { JsonlSessionRepo } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import type { CandidatePathV2A } from "../src/contracts/v2-types.ts";
import { writeOnceJson } from "../src/evidence/artifacts.ts";
import { treeDigest } from "../src/hash.ts";
import { inspectRunV2A, inspectionFingerprintV2A } from "../src/inspect-v2.ts";
import { selectCandidateV2A } from "../src/recovery/selector-v2.ts";
import { executeRunV2A } from "../src/run-v2.ts";
import { PROJECT_ROOT } from "./helpers.ts";

function runRoot(label: string): string {
	const parent = resolve(PROJECT_ROOT, ".runs/v2-a/tests");
	mkdirSync(parent, { recursive: true });
	return resolve(parent, `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

test("V2-A Gate B uses public emitted JsonlSessionRepo create/open/fork on Windows", async () => {
	const root = runRoot("public-jsonl");
	mkdirSync(root, { recursive: true });
	const repo = new JsonlSessionRepo({ fs: new NodeExecutionEnv({ cwd: root, shellEnv: {} }), sessionsRoot: resolve(root, "sessions") });
	const source = await repo.create({ cwd: resolve(root, "parent-workspace"), id: "v2a-public-parent" });
	await source.appendCustomEntry("v2a-test-history", { value: 1 });
	const sourceMetadata = await source.getMetadata();
	const opened = await repo.open(sourceMetadata);
	assert.equal((await opened.getEntries()).length, 1);
	const fork = await repo.fork(sourceMetadata, { cwd: resolve(root, "candidate-a"), id: "v2a-public-derived" });
	const fresh = await repo.create({ cwd: resolve(root, "candidate-b"), id: "v2a-public-fresh" });
	assert.notEqual((await fork.getMetadata()).id, sourceMetadata.id);
	assert.equal((await fork.getMetadata()).parentSessionPath, sourceMetadata.path);
	assert.equal((await fork.getEntries()).length, 1);
	assert.equal((await fresh.getEntries()).length, 0);
	assert.equal((await fresh.getMetadata()).parentSessionPath, undefined);
});

test("V2-A initial pass creates no recovery objects or calls", async () => {
	const root = runRoot("initial-pass");
	const terminal = await executeRunV2A({ projectRoot: PROJECT_ROOT, runRoot: root, runId: "v2a-test-initial-pass", primaryMode: "pass" });
	assert.equal(terminal.outcome, "initial_pass");
	assert.equal(terminal.recovery_group_id, null);
	assert.deepEqual(terminal.candidate_refs, []);
	for (const path of ["seed", "candidates", "selection.json"]) assert.equal(existsSync(resolve(root, path)), false);
	const before = inspectionFingerprintV2A(root);
	const inspected = inspectRunV2A({ runRoot: root });
	const after = inspectionFingerprintV2A(root);
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(before, after, "Inspector must be read-only");
	assert.deepEqual(terminal.real_call_counters, { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 });
});

test("V2-A end-to-end freezes Seed, runs both isolated paths, preserves only A history, and selects A", async () => {
	const root = runRoot("a-pass-b-fail");
	const terminal = await executeRunV2A({ projectRoot: PROJECT_ROOT, runRoot: root, runId: "v2a-test-a-pass-b-fail", primaryMode: "fail", candidateModes: ["pass", "fail"] });
	assert.equal(terminal.outcome, "recovery_selected");
	const inspected = inspectRunV2A({ runRoot: root });
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	assert.equal(inspected.candidates.length, 2);
	const [a, b] = inspected.candidates;
	assert.equal(a!.verifier_status, "passed");
	assert.equal(b!.verifier_status, "failed");
	assert.equal(terminal.selected_candidate_id, a!.candidate_path_id);
	assert.ok(a!.parent_history_entry_count > 0);
	assert.equal(b!.parent_history_entry_count, 0);
	assert.equal(a!.initial_workspace_digest, inspected.recovery_seed!.failed_workspace_snapshot_digest);
	assert.equal(b!.initial_workspace_digest, inspected.recovery_seed!.failed_workspace_snapshot_digest);
	assert.equal(a!.immediate_recovery_prompt_sha256, b!.immediate_recovery_prompt_sha256);
	assert.equal(a!.common_artifact_digest, b!.common_artifact_digest);
	const journalTypes = readFileSync(resolve(root, "journal.jsonl"), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line).type as string);
	assert.ok(journalTypes.indexOf("seed_frozen") < journalTypes.indexOf("candidate_started"));
	assert.equal(journalTypes.filter((type) => type === "candidate_started").length, 2);
	assert.equal(journalTypes.filter((type) => type === "candidate_terminal").length, 2);
	assert.throws(() => writeOnceJson(root, "seed/recovery-seed.json", { forged: true }), /EEXIST/);
	const isolationCopy = runRoot("isolation-mutation");
	cpSync(root, isolationCopy, { recursive: true });
	const seedBefore = treeDigest(resolve(isolationCopy, "seed/workspace"));
	const bBefore = treeDigest(resolve(isolationCopy, "candidates/b/workspace"));
	writeFileSync(resolve(isolationCopy, "candidates/a/workspace/src/subject.ts"), "export function parseDuration(): number { return 7; }\n", "utf8");
	assert.equal(treeDigest(resolve(isolationCopy, "seed/workspace")), seedBefore);
	assert.equal(treeDigest(resolve(isolationCopy, "candidates/b/workspace")), bBefore);
});

test("V2-A Faux scenario matrix covers both winners, both pass, none, and retained budget stop", async () => {
	const scenarios = [
		{ id: "a-fail-b-pass", modes: ["fail", "pass"] as const, selected: "b" },
		{ id: "a-pass-b-pass", modes: ["pass", "pass"] as const, selected: "either" },
		{ id: "a-fail-b-fail", modes: ["fail", "fail"] as const, selected: null },
		{ id: "a-budget-b-pass", modes: ["budget_stop", "pass"] as const, selected: "b" },
	];
	const results: CandidatePathV2A[][] = [];
	for (const scenario of scenarios) {
		const root = runRoot(scenario.id);
		const terminal = await executeRunV2A({ projectRoot: PROJECT_ROOT, runRoot: root, runId: `v2a-test-${scenario.id}`, primaryMode: "fail", candidateModes: scenario.modes });
		const inspected = inspectRunV2A({ runRoot: root });
		assert.equal(inspected.integrity_valid, true, `${scenario.id}: ${inspected.errors.join("; ")}`);
		assert.equal(inspected.candidates.length, 2);
		results.push(inspected.candidates);
		if (scenario.selected === null) {
			assert.equal(terminal.selected_candidate_id, null);
			assert.equal(inspected.selection!.terminal_reason, "no_passing_candidate");
		} else if (scenario.selected === "b") {
			assert.equal(terminal.selected_candidate_id, inspected.candidates[1]!.candidate_path_id);
		} else {
			assert.ok(inspected.candidates.some((candidate) => candidate.candidate_path_id === terminal.selected_candidate_id));
		}
	}
	const budgetCandidate = results[3]![0]!;
	assert.equal(budgetCandidate.terminal_reason, "budget_stopped");
	assert.equal(budgetCandidate.hard_gates.budget_valid, false);
	assert.equal(budgetCandidate.budget_usage.faux_provider_dispatches, 8);
	const tieSource = results[1]!;
	const tied = tieSource.map((candidate) => ({
		...structuredClone(candidate),
		budget_usage: { ...candidate.budget_usage, tokens: 10, tool_calls: 2, active_execution_time_ms: 1 },
		allowed_semantic_diff_size: 10,
	})) as [CandidatePathV2A, CandidatePathV2A];
	const tieDecision = selectCandidateV2A(tied[0].recovery_group_id, tied);
	assert.equal(tieDecision.terminal_reason, "tie_resolved");
	assert.equal(tieDecision.selected_candidate_id, tied[0].candidate_path_id);
});

test("V2-A Inspector rejects Seed tamper and selector rejects mixed Recovery Group identity", async () => {
	const source = runRoot("tamper-source");
	await executeRunV2A({ projectRoot: PROJECT_ROOT, runRoot: source, runId: "v2a-test-tamper", primaryMode: "fail", candidateModes: ["pass", "fail"] });
	const copy = runRoot("tamper-copy");
	cpSync(source, copy, { recursive: true });
	writeFileSync(resolve(copy, "seed/workspace/src/subject.ts"), "export function parseDuration(): number { return 999; }\n", "utf8");
	const rejected = inspectRunV2A({ runRoot: copy });
	assert.equal(rejected.integrity_valid, false);
	assert.match(rejected.errors.join("; "), /Seed Workspace tamper|digest mismatch/i);
	const valid = inspectRunV2A({ runRoot: source });
	const mixed = structuredClone(valid.candidates);
	mixed[1]!.recovery_group_id = "foreign-recovery-group";
	assert.throws(() => selectCandidateV2A(valid.recovery_seed!.recovery_group_id, mixed), /cross-group/);
	const duplicate = runRoot("duplicate-copy");
	cpSync(source, duplicate, { recursive: true });
	const duplicateTerminal = JSON.parse(readFileSync(resolve(duplicate, "terminal.json"), "utf8"));
	duplicateTerminal.candidate_refs[1] = structuredClone(duplicateTerminal.candidate_refs[0]);
	writeFileSync(resolve(duplicate, "terminal.json"), `${JSON.stringify(duplicateTerminal)}\n`, "utf8");
	const duplicateRejected = inspectRunV2A({ runRoot: duplicate });
	assert.equal(duplicateRejected.integrity_valid, false);
	assert.match(duplicateRejected.errors.join("; "), /duplicate|strategy|membership/i);
	const missing = runRoot("missing-copy");
	cpSync(source, missing, { recursive: true });
	const missingTerminal = JSON.parse(readFileSync(resolve(missing, "terminal.json"), "utf8"));
	missingTerminal.candidate_refs[1].path = "candidates/missing.json";
	writeFileSync(resolve(missing, "terminal.json"), `${JSON.stringify(missingTerminal)}\n`, "utf8");
	const missingRejected = inspectRunV2A({ runRoot: missing });
	assert.equal(missingRejected.integrity_valid, false);
	assert.match(missingRejected.errors.join("; "), /missing|incomplete/i);
});
