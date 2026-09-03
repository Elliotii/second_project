import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { createAnalysisContext, listRuns } from "../src/trace-analysis/analysis.ts";
import type { RunDescriptor } from "../src/trace-analysis/contracts.ts";
import {
	evaluatedRunDescriptors, findEvaluableComparisonGroups, joinEvaluation, parseBatchFreezeRecord, parseThinEvaluationMapping,
	runEvaluationAnalysis, type BatchFreezeRecord, type EvaluatedRun, type EvaluationRunRef, type PlannedRun, type ThinEvaluationMapping,
} from "../src/trace-analysis/evaluation.ts";

const SHA = "a".repeat(64);

function temporary(label: string): string { return mkdtempSync(resolve(tmpdir(), `trace-evaluation-${label}-`)); }
function json(path: string, value: unknown): void { mkdirSync(resolve(path, ".."), { recursive: true }); writeFileSync(path, `${JSON.stringify(value)}\n`, "utf8"); }

function runFixture(label: string, options: { runId?: string; taskId?: string; skill?: null | { path: string; actual_sha256: string }; execution?: string; verification?: string; failureReason?: string | null; missing?: string } = {}): { runId: string; root: string } {
	const root = temporary(label); const runId = options.runId ?? `run-${label}`; const verification = options.verification ?? "passed";
	json(resolve(root, "run-manifest.json"), {
		schema_version:1, run_id:runId, task_id:options.taskId ?? "task-a", source_revision:null, existing_tree_digest:"tree", model:{provider:"faux",id:"fixture"}, pi_commit:"0".repeat(40),
		skill:options.skill ?? null, execution_status:options.execution ?? "completed", verification_status:verification, failure_reason:options.failureReason ?? null, agent_final_claim:null,
		started_at:"2026-01-01T00:00:00Z", finished_at:"2026-01-01T00:00:01Z", usage:{request_count:0,input_tokens:0,output_tokens:0,cost_usd:0,tool_count:0,duration_ms:1,unknown_fields:[]},
		changes:{added:[],modified:[],deleted:[]}, artifacts:{session:"session/missing.jsonl",trace:"trace.json",diff:"diff.patch",verifier_result:"verifier/result.json",report:"report.md"}, known_limitations:[],
	});
	json(resolve(root, "trace.json"), { events:[] }); writeFileSync(resolve(root, "diff.patch"), "", "utf8");
	json(resolve(root, "verifier/result.json"), { status:verification }); writeFileSync(resolve(root, "verifier/output.txt"), `${verification}\n`, "utf8"); writeFileSync(resolve(root, "report.md"), "# report\n", "utf8");
	if (options.missing) rmSync(resolve(root, options.missing));
	return { runId, root };
}

function plan(id: string, condition: string, overrides: Partial<PlannedRun> = {}): PlannedRun {
	return { plan_id:id, case_id:"A", condition, trial:1, task_ref:"task-a", planned_skill:null, ...overrides };
}

function batch(plans: PlannedRun[]): BatchFreezeRecord {
	return { evaluation_id:"eval-1", suite:"candidate-pilot-v1", execution_head:"d".repeat(40), candidate_build_ref:"candidate/build.json", candidate_expected_sha256:SHA, planned_runs:plans, metadata:{cohort:"pilot", opaque:{kept:true}} };
}

function ref(planId: string, fixture: { runId: string; root: string }, overrides: Partial<EvaluationRunRef> = {}): EvaluationRunRef {
	return { plan_id:planId, run_id:fixture.runId, run_root:fixture.root, attempt:1, included_for_evaluation:true, manual_invalid_reason:null, ...overrides };
}

function mapping(refs: EvaluationRunRef[]): ThinEvaluationMapping { return { evaluation_id:"eval-1", run_refs:refs }; }

test("Batch and Mapping readers validate their minimum contracts", () => {
	assert.equal(parseBatchFreezeRecord(batch([plan("p1", "one")])).planned_runs[0]!.condition, "one");
	assert.throws(() => parseBatchFreezeRecord(batch([plan("p1", "one"), plan("p1", "two")])), /duplicate plan_id/);
	assert.throws(() => parseBatchFreezeRecord({ ...batch([plan("p1", "one")]), planned_runs:[{ ...plan("p1", "one"), trial:0 }] }), /positive safe integer/);
	assert.equal(parseThinEvaluationMapping(mapping([{ ...ref("p1", runFixture("parse")), included_for_evaluation:false }])).run_refs[0]!.included_for_evaluation, false);
});

test("Plan/Mapping/Attempt join rejects ambiguous references and retains multiple Attempts", () => {
	const plans = [plan("p1", "one")]; const first = runFixture("attempt-1"); const second = runFixture("attempt-2");
	assert.equal(joinEvaluation({ batch:batch(plans), mapping:mapping([ref("p1", first, { included_for_evaluation:false }), ref("p1", second, { attempt:2 })]) }).length, 2);
	for (const [refs, pattern] of [
		[[ref("unknown", first)], /unknown plan_id/],
		[[ref("p1", first), ref("p1", { ...second, runId:first.runId }, { attempt:2 })], /duplicate run_id/],
		[[ref("p1", first), ref("p1", second)], /duplicate attempt/],
		[[ref("p1", first), ref("p1", second, { attempt:2 })], /multiple included_for_evaluation/],
	] as Array<[EvaluationRunRef[], RegExp]>) assert.throws(() => joinEvaluation({ batch:batch(plans), mapping:mapping(refs) }), pattern);
	assert.throws(() => joinEvaluation({ batch:batch(plans), mapping:mapping([{ ...ref("p1", first), run_root:undefined }]) }), /cannot be resolved/);
});

test("Evaluation classification follows manual, identity, infra, artifact, then Day 1 priority", () => {
	const noSkill = plan("p", "no"); const withSkill = plan("p", "with", { planned_skill:{ build_ref:"candidate/build.json", expected_sha256:SHA } });
	const cases: Array<{ label:string; planned:PlannedRun; fixture:ReturnType<typeof runFixture>; ref?:Partial<EvaluationRunRef>; outcome:string; evaluable:boolean }> = [
		{ label:"pass", planned:noSkill, fixture:runFixture("pass"), outcome:"PASS", evaluable:true },
		{ label:"pass with skill", planned:withSkill, fixture:runFixture("pass-with-skill", { skill:{ path:"C:/skill/SKILL.md", actual_sha256:SHA } }), outcome:"PASS", evaluable:true },
		{ label:"task-failure", planned:noSkill, fixture:runFixture("task-failure", { verification:"failed" }), outcome:"TASK_FAILURE", evaluable:true },
		{ label:"infra", planned:noSkill, fixture:runFixture("infra", { execution:"infrastructure_failed", verification:"not_run", failureReason:"provider" }), outcome:"INFRA_FAILURE", evaluable:false },
		{ label:"manual", planned:noSkill, fixture:{ runId:"manual", root:"Z:/does-not-exist" }, ref:{ manual_invalid_reason:"operator invalidated" }, outcome:"INVALID_TRIAL", evaluable:false },
		{ label:"task mismatch", planned:noSkill, fixture:runFixture("task-mismatch", { taskId:"other-task" }), outcome:"INVALID_TRIAL", evaluable:false },
		{ label:"unexpected skill", planned:noSkill, fixture:runFixture("unexpected-skill", { skill:{ path:"C:/skill/SKILL.md", actual_sha256:SHA } }), outcome:"INVALID_TRIAL", evaluable:false },
		{ label:"skill sha", planned:withSkill, fixture:runFixture("skill-sha", { skill:{ path:"C:/skill/SKILL.md", actual_sha256:"b".repeat(64) } }), outcome:"INVALID_TRIAL", evaluable:false },
		{ label:"missing required artifact", planned:noSkill, fixture:runFixture("missing-trace", { missing:"trace.json" }), outcome:"INVALID_TRIAL", evaluable:false },
		{ label:"missing report", planned:noSkill, fixture:runFixture("missing-report", { missing:"report.md" }), outcome:"PASS", evaluable:true },
		{ label:"missing verifier output", planned:noSkill, fixture:runFixture("missing-verifier-output", { verification:"failed", missing:"verifier/output.txt" }), outcome:"TASK_FAILURE", evaluable:true },
		{ label:"infra beats missing", planned:noSkill, fixture:runFixture("infra-missing", { execution:"infrastructure_failed", verification:"not_run", failureReason:"provider", missing:"report.md" }), outcome:"INFRA_FAILURE", evaluable:false },
	];
	for (const item of cases) {
		const evaluated = joinEvaluation({ batch:batch([item.planned]), mapping:mapping([ref(item.planned.plan_id, item.fixture, item.ref)]) })[0]!;
		assert.equal(evaluated.outcome, item.outcome, item.label); assert.equal(evaluated.evaluable, item.evaluable, item.label);
	}
});

function evaluated(label: string, overrides: Partial<EvaluatedRun> = {}): EvaluatedRun {
	const planned = plan(`p-${label}`, label);
	return { run_id:`r-${label}`, run_root:"C:/unused", plan:planned, labels:{case_id:"A",condition:label,trial:1}, attempt:1, includedForEvaluation:true, outcome:"PASS", evaluable:true, reason:"pass", ...overrides };
}

test("Comparison groups pair only selected evaluable conditions with the same case_id and trial", () => {
	assert.equal(findEvaluableComparisonGroups([evaluated("one"), evaluated("two")]).groups.length, 1);
	assert.equal(findEvaluableComparisonGroups([evaluated("one"), evaluated("two", { plan:plan("p-two", "two", { trial:2 }) })]).groups.length, 0);
	assert.equal(findEvaluableComparisonGroups([evaluated("one"), evaluated("two", { plan:plan("p-two", "two", { case_id:"C" }) })]).groups.length, 0);
	assert.equal(findEvaluableComparisonGroups([evaluated("one"), evaluated("two", { outcome:"INFRA_FAILURE", evaluable:false })]).groups.length, 0);
	assert.equal(findEvaluableComparisonGroups([evaluated("one"), evaluated("two", { includedForEvaluation:false })]).groups.length, 0);
});

test("Evaluated descriptors feed list_runs while development descriptors retain Day 1 behavior", () => {
	const selected = runFixture("listed-selected", { missing:"report.md" }); const retained = runFixture("listed-retained", { execution:"infrastructure_failed", verification:"not_run", failureReason:"provider", missing:"verifier/output.txt" });
	const runs = joinEvaluation({ batch:batch([plan("p1", "one"), plan("p2", "two")]), mapping:mapping([ref("p1", selected), ref("p2", retained, { included_for_evaluation:false })]) });
	const listed = listRuns(createAnalysisContext(evaluatedRunDescriptors(runs)));
	assert.deepEqual(listed[0]!.labels, { cohort:"pilot", evaluation_id:"eval-1", suite:"candidate-pilot-v1", case_id:"A", condition:"one", trial:1 });
	assert.deepEqual(
		{ diff_empty:listed[0]!.diff_empty, changed_files_count:listed[0]!.changed_files_count, verifier_status:listed[0]!.verifier_status, verifier_code:listed[0]!.verifier_code },
		{ diff_empty:true, changed_files_count:0, verifier_status:"passed", verifier_code:null },
	);
	assert.equal(listed[1]!.outcome, "INFRA_FAILURE"); assert.equal(listed[1]!.includedForEvaluation, false); assert.equal(typeof listed[1]!.reason, "string");
	const developmentRun = runFixture("listed-development");
	const development: RunDescriptor = { runId:developmentRun.runId, root:developmentRun.root, labels:{cohort:"development"} };
	const developmentListed = listRuns(createAnalysisContext([development]))[0]!;
	assert.equal(developmentListed.outcome, "PASS"); assert.equal("reason" in developmentListed, false); assert.equal("includedForEvaluation" in developmentListed, false);
});

test("no complete group stops before Analysis Invocation", async () => {
	const root = temporary("gate-files"); const fixture = runFixture("gate-single");
	const batchPath = resolve(root, "batch.json"); const mappingPath = resolve(root, "mapping.json");
	json(batchPath, batch([plan("p1", "one")])); json(mappingPath, mapping([ref("p1", fixture)]));
	let invoked = false;
	await assert.rejects(runEvaluationAnalysis({ mode:"fresh", batchPath, mappingPath, outputDirectory:resolve(root, "analysis"), credentialResolver:{ resolve:async () => "unused" }, invoke:async () => { invoked = true; throw new Error("must not run"); } }), /no complete evaluable comparison group/);
	assert.equal(invoked, false);
});

test("a complete group reaches the existing Analysis Invocation seam with every visible Attempt", async () => {
	const root = temporary("invoke-files"); const one = runFixture("invoke-one"); const two = runFixture("invoke-two"); const retained = runFixture("invoke-retained", { runId:"run-invoke-retained" });
	const batchPath = resolve(root, "batch.json"); const mappingPath = resolve(root, "mapping.json");
	json(batchPath, batch([plan("p1", "one"), plan("p2", "two")]));
	json(mappingPath, mapping([ref("p1", one), ref("p2", two), ref("p1", retained, { attempt:2, included_for_evaluation:false })]));
	let descriptors: RunDescriptor[] = [];
	await runEvaluationAnalysis({ mode:"fresh", batchPath, mappingPath, outputDirectory:resolve(root, "analysis"), credentialResolver:{ resolve:async () => "unused" }, invoke:async (input) => { descriptors = input.descriptors; return {} as never; } });
	assert.equal(descriptors.length, 3); assert.equal(descriptors.filter((entry) => entry.evaluation?.includedForEvaluation).length, 2);
});
