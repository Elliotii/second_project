import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import {
	createAnalysisContext,
	determineOutcome,
	listRuns,
	readEvidence,
	readRunArtifacts,
	resolveFindingLocators,
	searchTrace,
} from "../src/trace-analysis/analysis.ts";
import type { AnalysisState, EvidenceLocator, RunDescriptor } from "../src/trace-analysis/contracts.ts";
import { loadAnalysisState, renderDevelopmentFinding, saveAnalysisState } from "../src/trace-analysis/state.ts";

function temporary(label: string): string {
	return mkdtempSync(resolve(tmpdir(), `trace-analysis-${label}-`));
}

function json(path: string, value: unknown): void {
	mkdirSync(resolve(path, ".."), { recursive: true });
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function fixture(label: string, options: { runId?: string; execution?: string; verification?: string } = {}): RunDescriptor {
	const root = temporary(label);
	const runId = options.runId ?? `run-${label}`;
	const execution = options.execution ?? "completed";
	const verification = options.verification ?? "passed";
	json(resolve(root, "run-manifest.json"), {
		schema_version: 1,
		run_id: runId,
		task_id: "fixture-task",
		source_revision: null,
		existing_tree_digest: "fixture-tree",
		model: { provider: "faux", id: "fixture" },
		pi_commit: "0".repeat(40),
		skill: null,
		execution_status: execution,
		verification_status: verification,
		failure_reason: null,
		agent_final_claim: null,
		started_at: "2026-01-01T00:00:00.000Z",
		finished_at: "2026-01-01T00:00:01.000Z",
		usage: { request_count: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0, tool_count: 1, duration_ms: 1000, unknown_fields: [] },
		changes: { added: [], modified: ["src/subject.ts"], deleted: [] },
		artifacts: { session: "session/missing.jsonl", trace: "trace.json", diff: "diff.patch", verifier_result: "verifier/result.json", report: "report.md" },
		known_limitations: [],
	});
	json(resolve(root, "trace.json"), { events: [
		{ sequence: 1, type: "file_write", phase: "start", tool_call_id: "call-1", tool_name: "workspace_write", path: "src/subject.ts", input: { text: "value.trim()" } },
		{ sequence: 2, type: "tool_result", phase: "end", tool_call_id: "call-1", tool_name: "workspace_write", status: "ok" },
	] });
	json(resolve(root, "diff.json"), { changes: { added: [], modified: ["src/subject.ts"], deleted: [] } });
	writeFileSync(resolve(root, "diff.patch"), "diff --git a/src/subject.ts b/src/subject.ts\n", "utf8");
	json(resolve(root, "verifier/result.json"), { status: verification, execution: { source_snapshot_ref: { path: "verifier/source.mjs" } } });
	writeFileSync(resolve(root, "verifier/output.txt"), `[stdout] ${verification}\n`, "utf8");
	writeFileSync(resolve(root, "verifier/source.mjs"), "// whitespace contract\n", "utf8");
	writeFileSync(resolve(root, "report.md"), "# fixture report\n", "utf8");
	return { runId, root, labels: { cohort: "development" } };
}

test("determineOutcome maps PASS, TASK_FAILURE, and infrastructure states without prose", () => {
	assert.deepEqual(determineOutcome({ executionStatus: "completed", manifestVerificationStatus: "passed", verifierStatus: "passed" }), { outcome: "PASS", evaluable: true });
	assert.deepEqual(determineOutcome({ executionStatus: "completed", manifestVerificationStatus: "failed", verifierStatus: "failed" }), { outcome: "TASK_FAILURE", evaluable: true });
	assert.deepEqual(determineOutcome({ executionStatus: "timeout", manifestVerificationStatus: "not_run", verifierStatus: "not_run" }), { outcome: "INFRA_FAILURE", evaluable: false });
	assert.deepEqual(determineOutcome({ executionStatus: "completed", manifestVerificationStatus: "passed", verifierStatus: "failed" }), { outcome: "INFRA_FAILURE", evaluable: false });
});

test("one reader loads required artifacts while tolerating a missing Session JSONL", () => {
	const descriptor = fixture("reader");
	const loaded = readRunArtifacts(descriptor);
	assert.equal(loaded.manifest.run_id, descriptor.runId);
	assert.equal(loaded.diffArtifact, "diff.json");
	assert.match(loaded.reportText, /fixture report/);
	const summary = listRuns(createAnalysisContext([descriptor]))[0]!;
	assert.deepEqual(summary.labels, { cohort: "development" });
	assert.equal(summary.skill, null);
});

test("reader rejects a Descriptor and Manifest Run ID mismatch", () => {
	const descriptor = fixture("mismatch");
	assert.throws(() => readRunArtifacts({ ...descriptor, runId: "different-run" }), /does not match/);
});

test("reader reports a missing required artifact clearly", () => {
	const descriptor = fixture("missing");
	rmSync(resolve(descriptor.root, "verifier/output.txt"));
	assert.throws(() => readRunArtifacts(descriptor), /verifier output is missing/);
});

test("reader rejects an artifact path that escapes the Run root", () => {
	const descriptor = fixture("escape");
	const manifestPath = resolve(descriptor.root, "run-manifest.json");
	const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
	manifest.artifacts.trace = "../trace.json";
	writeFileSync(manifestPath, `${JSON.stringify(manifest)}\n`, "utf8");
	assert.throws(() => readRunArtifacts(descriptor), /invalid run-relative path|escapes Run root/);
});

test("searchTrace filters visible fields and enforces a bounded result count", () => {
	const descriptor = fixture("search");
	const context = createAnalysisContext([descriptor]);
	const byKeyword = searchTrace(context, descriptor.runId, { keyword: ".trim()", limit: 1 });
	assert.equal(byKeyword.length, 1);
	assert.equal(byKeyword[0]!.locator.sequence, 1);
	assert.ok(byKeyword[0]!.summary.length <= 240);
	assert.equal(searchTrace(context, descriptor.runId, { toolName: "workspace_write", limit: 1 }).length, 1);
	assert.throws(() => searchTrace(context, descriptor.runId, { limit: 101 }), /1 to 100/);
});

test("readEvidence resolves run_id plus sequence and records exact character counts", () => {
	const descriptor = fixture("locator");
	const context = createAnalysisContext([descriptor]);
	const locator = { artifact: "trace", run_id: descriptor.runId, sequence: 1 } as const;
	const evidence = readEvidence(context, locator);
	assert.equal(evidence.characterCount, evidence.content.length);
	assert.deepEqual(context.loadedEvidence[0], { artifact: "trace", locator, characterCount: evidence.content.length });
	assert.throws(() => readEvidence(context, { ...locator, sequence: 999 }), /does not exist/);
});

test("Analysis State round-trips and the renderer exposes the required development fields", () => {
	const descriptor = fixture("state");
	const context = createAnalysisContext([descriptor]);
	const trace: EvidenceLocator = { artifact: "trace", run_id: descriptor.runId, sequence: 1 };
	const verifier: EvidenceLocator = { artifact: "verifier", run_id: descriptor.runId };
	readEvidence(context, trace);
	readEvidence(context, verifier);
	const state: AnalysisState = {
		covered_runs: [descriptor.runId], notes: [], open_questions: ["bounded evidence"], next_action: "stop",
		loaded_evidence: structuredClone(context.loadedEvidence),
		finding_drafts: [{ id: "f1", observation: "observed", interpretation: "interpreted", limitation: "limited", applicable_runs: [descriptor.runId], support: [trace], counter: [verifier], counter_checked: true, status: "draft" }],
	};
	const statePath = saveAnalysisState(temporary("state-output"), state);
	const reloaded = loadAnalysisState(statePath);
	assert.deepEqual(reloaded, state);
	assert.equal(resolveFindingLocators(context, [...reloaded.finding_drafts[0]!.support, ...reloaded.finding_drafts[0]!.counter]).length, 2);
	const rendered = renderDevelopmentFinding(reloaded, "f1");
	for (const heading of ["Observation", "Applicable Runs", "Supporting Evidence", "Counter Evidence", "Interpretation", "Limitation", "Locator"]) assert.match(rendered, new RegExp(heading));
});

test("two real Smoke Runs complete the no-model vertical development chain", { skip: !process.env.TRACE_ANALYSIS_FAILURE_ROOT || !process.env.TRACE_ANALYSIS_PASS_ROOT }, () => {
	const descriptors: RunDescriptor[] = [
		{ runId: "coding-task-20260828191009817-deb0ebb2", root: process.env.TRACE_ANALYSIS_FAILURE_ROOT!, labels: { cohort: "development" } },
		{ runId: "coding-task-20260828191134643-da93fd7c", root: process.env.TRACE_ANALYSIS_PASS_ROOT!, labels: { cohort: "development" } },
	];
	const context = createAnalysisContext(descriptors);
	assert.deepEqual(listRuns(context).map((entry) => entry.outcome), ["TASK_FAILURE", "PASS"]);
	const failed = searchTrace(context, descriptors[0]!.runId, { eventType: "file_write", toolName: "workspace_write", keyword: ".trim()" });
	const passed = searchTrace(context, descriptors[1]!.runId, { eventType: "file_write", toolName: "workspace_write" });
	assert.deepEqual(failed.map((entry) => entry.locator.sequence), [9]);
	assert.deepEqual(passed.map((entry) => entry.locator.sequence), [11]);
	const support: EvidenceLocator[] = [failed[0]!.locator, { artifact: "diff", run_id: descriptors[0]!.runId }, { artifact: "verifier", run_id: descriptors[0]!.runId }];
	const counter: EvidenceLocator[] = [passed[0]!.locator, { artifact: "verifier", run_id: descriptors[1]!.runId }];
	resolveFindingLocators(context, [...support, ...counter]);
	const state: AnalysisState = {
		covered_runs: [...context.coveredRuns], notes: [], open_questions: ["no general causal claim"], next_action: "stop after Day 1-A",
		loaded_evidence: structuredClone(context.loadedEvidence),
		finding_drafts: [{ id: "f1", observation: "The write paths differ consistently with the two Verifier outcomes.", interpretation: "The failed path trims input while the passing path preserves it.", limitation: "Two Runs only.", applicable_runs: descriptors.map((entry) => entry.runId), support, counter, counter_checked: true, status: "draft" }],
	};
	const reloaded = loadAnalysisState(saveAnalysisState(temporary("real-smoke"), state));
	assert.deepEqual(reloaded, state);
	assert.equal(resolveFindingLocators(context, [...reloaded.finding_drafts[0]!.support, ...reloaded.finding_drafts[0]!.counter]).length, 5);
});
