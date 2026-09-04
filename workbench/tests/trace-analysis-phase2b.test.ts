import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { createAnalysisContext, listRuns } from "../src/trace-analysis/analysis.ts";
import type { AnalysisState, RunDescriptor } from "../src/trace-analysis/contracts.ts";
import { createAnalysisTools } from "../src/trace-analysis/model-tools.ts";
import { emptyAnalysisState, resumeAnalysisPrompt } from "../src/trace-analysis/model-runner.ts";
import { loadAnalysisState } from "../src/trace-analysis/state.ts";

const SKILL_PATH = "C:/frozen-candidate/build/skill/SKILL.md";
const SKILL_CONTENT = "SECRET_CANDIDATE_SKILL_CONTENT";

function temporary(label: string): string { return mkdtempSync(resolve(tmpdir(), `trace-analysis-phase2b-${label}-`)); }
function json(path: string, value: unknown): void { mkdirSync(resolve(path, ".."), { recursive: true }); writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }

function fixture(label: string, condition: "no_skill" | "with_skill"): RunDescriptor {
	const root = temporary(label); const runId = `run-${label}`; const withSkill = condition === "with_skill";
	json(resolve(root, "run-manifest.json"), {
		schema_version:1, run_id:runId, task_id:"fixture-task", source_revision:null, existing_tree_digest:"tree", model:{provider:"faux",id:"fixture"}, pi_commit:"0".repeat(40),
		skill:withSkill ? {path:SKILL_PATH,actual_sha256:"a".repeat(64)} : null, execution_status:"completed", verification_status:"passed", failure_reason:null, agent_final_claim:null,
		started_at:"2026-01-01T00:00:00Z", finished_at:"2026-01-01T00:00:01Z", usage:{request_count:0,input_tokens:0,output_tokens:0,cost_usd:0,tool_count:3,duration_ms:1,unknown_fields:[]},
		changes:{added:[],modified:["src/a.ts"],deleted:[]}, artifacts:{session:"missing.jsonl",trace:"trace.json",diff:"diff.patch",verifier_result:"verifier/result.json",report:"report.md"}, known_limitations:[],
	});
	json(resolve(root, "trace.json"), { messages:[{role:"user",text:withSkill ? SKILL_CONTENT : "task"}], agent:{status:"completed",end_reason:"settled"}, events:[
		{sequence:1,type:"file_read",phase:"start",tool_call_id:"c1",tool_name:"workspace_list",path:withSkill ? "C:/frozen-candidate/build/skill" : ".",input:{text:withSkill ? "C:/frozen-candidate/build/skill" : "."}},
		{sequence:2,type:withSkill ? "tool_error" : "tool_result",phase:"end",tool_call_id:"c1",tool_name:"workspace_list",status:withSkill ? "error" : "ok",output:{text:withSkill ? "unbounded C:/frozen-candidate/build/skill" : "ok"}},
		{sequence:3,type:"file_write",phase:"start",tool_call_id:"c2",tool_name:"workspace_write",path:"src/a.ts"},
		{sequence:4,type:"tool_result",phase:"end",tool_call_id:"c2",tool_name:"workspace_write",status:"ok"},
		{sequence:5,type:"test",phase:"start",tool_call_id:"c3",tool_name:"run_command",command_id:"test"},
		{sequence:6,type:"tool_result",phase:"end",tool_call_id:"c3",tool_name:"run_command",status:"ok",exit_code:1,timed_out:false},
	] });
	writeFileSync(resolve(root, "diff.patch"), "diff --git a/src/a.ts b/src/a.ts\n", "utf8");
	json(resolve(root, "verifier/result.json"), {status:"passed",exit_code:0});
	writeFileSync(resolve(root, "verifier/output.txt"), "passed\n", "utf8");
	writeFileSync(resolve(root, "report.md"), "# report\n", "utf8");
	return {runId,root,labels:{case_id:"A",condition,trial:1},evaluation:{attempt:1,includedForEvaluation:true,outcome:"PASS",evaluable:true,reason:"fixture"}};
}

function setup(label: string) {
	const descriptors = [fixture(`${label}-control`, "no_skill"), fixture(`${label}-candidate`, "with_skill")];
	const analysis = createAnalysisContext(descriptors); const output = temporary(`${label}-output`); const statePath = resolve(output, "analysis-state.json");
	const initialState = emptyAnalysisState(analysis.coveredRuns); const profile = createAnalysisTools({analysis,statePath,initialState});
	return {descriptors,analysis,output,statePath,initialState,...profile};
}

async function execute(profile: ReturnType<typeof setup> | ReturnType<typeof createAnalysisTools>, name: string, args: Record<string, unknown>) {
	const tool = profile.tools.find((candidate) => candidate.name === name);
	if (!tool) throw new Error(`missing tool ${name}`);
	return tool.execute("test-call", args as never, undefined, undefined, profile.context as never);
}

function resultText(result: Awaited<ReturnType<typeof execute>>): string {
	const content = result.content[0]!;
	if (content.type !== "text") throw new Error("expected text tool result");
	return content.text;
}

test("process_view is registered, fail-closed, defaults to overview, and bounds timeline without changing canonical semantics", async () => {
	const profile = setup("process-view"); const runId = profile.descriptors[1]!.runId;
	assert.deepEqual(profile.tools.map((tool) => tool.name), ["list_runs","process_view","search_trace","read_evidence","update_state"]);
	await execute(profile, "list_runs", {});
	await assert.rejects(execute(profile, "process_view", {run_id:"missing"}), /not loaded/);
	await assert.rejects(execute(profile, "process_view", {run_id:runId,detail:"full"}), /overview or timeline/);
	await assert.rejects(execute(profile, "process_view", {run_id:runId,detail:"timeline",max_events:51}), /1 to 50/);
	const overview = JSON.parse(resultText(await execute(profile, "process_view", {run_id:runId})));
	assert.ok(overview.overview); assert.equal(overview.timeline, undefined);
	assert.equal(overview.overview.operation_count_by_status.failure, 1);
	assert.equal(overview.overview.validation_attempts, 1);
	assert.equal(overview.overview.failed_tool_operations[0].locator.sequence, 2);
	assert.doesNotMatch(JSON.stringify(overview), /frozen-candidate|SKILL\.md/);
	const timeline = JSON.parse(resultText(await execute(profile, "process_view", {run_id:runId,detail:"timeline",max_events:2})));
	assert.deepEqual({total:timeline.timeline.total_operations,returned:timeline.timeline.returned_operations,truncated:timeline.timeline.truncated},{total:3,returned:2,truncated:true});
	assert.match(timeline.timeline.operations[0].target, /^\[redacted-path-\d+\]$/);
	assert.doesNotMatch(timeline.timeline.operations[0].target, /skill|candidate|condition/i);
	assert.equal(timeline.timeline.operations[0].result_locator.sequence, 2);
	assert.equal(timeline.timeline.operations[2], undefined);
	assert.equal(timeline.timeline.operations[1].validation_result, null);
});

test("Blind Tool projection hides real conditions, Skill metadata, known Skill paths, and top-level Trace messages while preserving Locators", async () => {
	const profile = setup("blind"); const candidateId = profile.descriptors[1]!.runId;
	const internal = listRuns(profile.analysis);
	assert.equal((internal[0]!.labels as Record<string, unknown>).condition, "no_skill");
	assert.equal((internal[1]!.skill as Record<string, unknown>).path, SKILL_PATH);
	const listedText = resultText(await execute(profile, "list_runs", {}));
	for (const forbidden of ["no_skill","with_skill",SKILL_PATH,"frozen-candidate","actual_sha256","SECRET_CANDIDATE"]) assert.doesNotMatch(listedText, new RegExp(forbidden));
	const listed = JSON.parse(listedText); assert.deepEqual(listed.map((run: {labels:{condition:string}}) => run.labels.condition), ["Arm X","Arm Y"]); assert.equal(listed[1].skill, undefined);
	const searchedText = resultText(await execute(profile, "search_trace", {run_id:candidateId,keyword:"frozen-candidate"}));
	assert.doesNotMatch(searchedText, /frozen-candidate|SKILL\.md|SECRET_CANDIDATE/);
	const traceText = resultText(await execute(profile, "read_evidence", {artifact:"trace",run_id:candidateId,sequence:2}));
	assert.doesNotMatch(traceText, /frozen-candidate|SKILL\.md|SECRET_CANDIDATE/);
	const traceRead = JSON.parse(traceText); assert.deepEqual(traceRead.locator,{artifact:"trace",run_id:candidateId,sequence:2});
	const manifestText = resultText(await execute(profile, "read_evidence", {artifact:"manifest",run_id:candidateId}));
	assert.doesNotMatch(manifestText, /frozen-candidate|SKILL\.md|actual_sha256|SECRET_CANDIDATE/);
	assert.equal(JSON.parse(JSON.parse(manifestText).content).skill, undefined);
});

test("neutral path aliases preserve replay-local equivalence without collapsing distinct sensitive values", async () => {
	const profile = setup("neutral-alias"); const candidateId = profile.descriptors[1]!.runId;
	await execute(profile, "list_runs", {});
	const overview = JSON.parse(resultText(await execute(profile, "process_view", {run_id:candidateId}))) as {overview:{unique_targets_by_kind:{inspection:string[]}}};
	const trace = JSON.parse(resultText(await execute(profile, "read_evidence", {artifact:"trace",run_id:candidateId,sequence:2}))) as {content:string};
	const aliases = JSON.stringify({overview,trace}).match(/\[redacted-path-\d+\]/g) ?? [];
	assert.ok(aliases.length >= 2); assert.equal(new Set(aliases).size,1);
	for (const alias of aliases) assert.doesNotMatch(alias,/skill|candidate|condition/i);
	assert.doesNotMatch(JSON.stringify({overview,trace}),/blind-skill-path/i);
	const fullPathTrace = profile.analysis.runs.get(candidateId)!.trace; (fullPathTrace.events[0] as Record<string,unknown>).path=SKILL_PATH;
	const projected = JSON.parse(resultText(await execute(profile, "process_view", {run_id:candidateId,detail:"timeline",max_events:2}))) as {timeline:{operations:Array<{target:string}>}};
	assert.notEqual(projected.timeline.operations[0]!.target, overview.overview.unique_targets_by_kind.inspection[0]);
});

test("deterministic blind aliases survive fresh State persistence and resume projection", async () => {
	const profile = setup("resume");
	const freshListed = JSON.parse(resultText(await execute(profile, "list_runs", {})));
	const aliases = freshListed.map((run: {labels:{condition:string}}) => run.labels.condition);
	await execute(profile, "update_state", {matrix_triage_complete:true,investigation_agenda:[],notes:[`Compared ${aliases.join(" and ")}`],open_questions:[],next_action:"",finding_drafts:[]});
	const saved: AnalysisState = loadAnalysisState(profile.statePath); const prompt = resumeAnalysisPrompt(saved);
	assert.match(prompt,/Arm X and Arm Y/); assert.doesNotMatch(prompt,/no_skill|with_skill|frozen-candidate/);
	const resumed = createAnalysisTools({analysis:profile.analysis,statePath:profile.statePath,initialState:saved});
	const resumedListed = JSON.parse(resultText(await execute(resumed,"list_runs",{})));
	assert.deepEqual(resumedListed.map((run: {labels:{condition:string}}) => run.labels.condition),aliases);
});
