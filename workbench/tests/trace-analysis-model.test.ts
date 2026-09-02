import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { createAnalysisContext } from "../src/trace-analysis/analysis.ts";
import type { AnalysisState, RunDescriptor } from "../src/trace-analysis/contracts.ts";
import { createAnalysisTools } from "../src/trace-analysis/model-tools.ts";
import { ANALYSIS_SYSTEM_PROMPT, emptyAnalysisState, freshAnalysisPrompt, resumeAnalysisPrompt } from "../src/trace-analysis/model-runner.ts";
import { loadAnalysisState } from "../src/trace-analysis/state.ts";

function temporary(label: string): string { return mkdtempSync(resolve(tmpdir(), `trace-analysis-model-${label}-`)); }
function json(path: string, value: unknown): void { mkdirSync(resolve(path, ".."), { recursive: true }); writeFileSync(path, `${JSON.stringify(value)}\n`, "utf8"); }

function fixture(label: string): RunDescriptor {
	const root = temporary(label); const runId = `run-${label}`;
	json(resolve(root, "run-manifest.json"), { schema_version:1, run_id:runId, task_id:"fixture-task", source_revision:null, existing_tree_digest:"tree", model:{provider:"faux",id:"fixture"}, pi_commit:"0".repeat(40), skill:null, execution_status:"completed", verification_status:"passed", failure_reason:null, agent_final_claim:null, started_at:"2026-01-01T00:00:00Z", finished_at:"2026-01-01T00:00:01Z", usage:{request_count:0,input_tokens:0,output_tokens:0,cost_usd:0,tool_count:1,duration_ms:1,unknown_fields:[]}, changes:{added:[],modified:["src/a.ts"],deleted:[]}, artifacts:{session:"missing.jsonl",trace:"trace.json",diff:"diff.patch",verifier_result:"verifier/result.json",report:"report.md"}, known_limitations:[] });
	json(resolve(root, "trace.json"), { events:[
		{sequence:1,type:"file_write",phase:"start",tool_call_id:"c1",tool_name:"workspace_write",path:"src/a.ts",input:{text:"synthetic change"}},
		{sequence:2,type:"tool_result",phase:"end",tool_call_id:"c1",tool_name:"workspace_write",path:"src/a.ts",output:{status:"ok"}},
	] });
	json(resolve(root, "diff.json"), { changes:{added:[],modified:["src/a.ts"],deleted:[]} });
	writeFileSync(resolve(root, "diff.patch"), "diff --git a/src/a.ts b/src/a.ts\n", "utf8");
	json(resolve(root, "verifier/result.json"), { status:"passed" });
	writeFileSync(resolve(root, "verifier/output.txt"), "passed\n", "utf8");
	writeFileSync(resolve(root, "report.md"), "# report\n", "utf8");
	return { runId, root, labels:{cohort:"development"} };
}

function setup(label: string) {
	const descriptor = fixture(label); const analysis = createAnalysisContext([descriptor]); const output = temporary(`${label}-output`); const statePath = resolve(output, "analysis-state.json"); const initialState = emptyAnalysisState(analysis.coveredRuns); const profile = createAnalysisTools({ analysis, statePath, initialState });
	return { descriptor, analysis, output, statePath, initialState, ...profile };
}

async function execute(profile: ReturnType<typeof setup>, name: string, args: Record<string, unknown>) {
	const tool = profile.tools.find((candidate) => candidate.name === name);
	if (!tool) throw new Error(`missing tool ${name}`);
	return tool.execute("test-call", args as never, undefined, undefined, profile.context);
}

const draft = (runId: string) => ({ id:"f1", observation:"synthetic observation", interpretation:"bounded interpretation", limitation:"one fixture", applicable_runs:[runId], support:[{artifact:"trace" as const,run_id:runId,sequence:1}], counter:[], counter_checked:false, status:"draft" as const, claim_scope:"run_observation" as const, agenda_item_id:"i1" });
const workflow = (runId: string) => ({ matrix_triage_complete:true, investigation_agenda:[{ id:"i1", question:"What happened in this Run?", trigger:"Matrix signal", claim_scope:"run_observation" as const, anchor_run_ids:[runId], relevant_case_ids:[], checked_runs:[runId], settle_condition:"inspect the anchor Run", status:"open" as const, closure_reason:"" }] });

test("Analysis model receives exactly the four frozen tools", () => {
	const profile = setup("allowlist");
	assert.deepEqual(profile.tools.map((tool) => tool.name), ["list_runs", "search_trace", "read_evidence", "update_state"]);
	assert.equal((profile.tools.find((tool) => tool.name === "read_evidence")!.parameters as { type?: string }).type, "object");
	for (const forbidden of ["bash","git","workspace_read","workspace_write","run_command","skill"] ) assert.equal(profile.tools.some((tool) => tool.name === forbidden), false);
});

test("matrix_triage_complete requires list_runs exposure in the current fresh Invocation", async () => {
	const profile = setup("triage");
	await assert.rejects(execute(profile, "update_state", { matrix_triage_complete:true, investigation_agenda:[], notes:[], open_questions:[], next_action:"", finding_drafts:[] }), /requires list_runs exposure/);
	await execute(profile, "list_runs", {});
	await execute(profile, "update_state", { matrix_triage_complete:true, investigation_agenda:[], notes:[], open_questions:[], next_action:"", finding_drafts:[] });
	assert.equal(loadAnalysisState(profile.statePath).matrix_triage_complete, true);
});

test("read_evidence records real counts in memory and only update_state persists them", async () => {
	const profile = setup("evidence");
	await assert.rejects(execute(profile, "read_evidence", { artifact:"trace", run_id:profile.descriptor.runId, sequence:1 }), /Global Matrix Triage/);
	await execute(profile, "list_runs", {});
	await execute(profile, "read_evidence", { artifact:"trace", run_id:profile.descriptor.runId, sequence:1 });
	assert.equal(existsSync(profile.statePath), false);
	const evidenceCall = profile.context.calls[1]!;
	assert.equal(evidenceCall.name, "read_evidence");
	assert.ok((evidenceCall.evidence?.characterCount ?? 0) > 0);
	await execute(profile, "update_state", { ...workflow(profile.descriptor.runId), notes:[], open_questions:[], next_action:"continue", finding_drafts:[draft(profile.descriptor.runId)], covered_runs:["forged"], loaded_evidence:[{characterCount:999}] });
	const saved = loadAnalysisState(profile.statePath);
	assert.deepEqual(saved.covered_runs, [profile.descriptor.runId]);
	assert.equal(saved.loaded_evidence.length, 1);
	assert.equal(saved.loaded_evidence[0]!.characterCount, evidenceCall.evidence!.characterCount);
});

test("update_state persists only cited search_trace exposure", async () => {
	const profile = setup("search-evidence");
	await execute(profile, "list_runs", {});
	await execute(profile, "search_trace", { run_id:profile.descriptor.runId });
	await execute(profile, "update_state", { ...workflow(profile.descriptor.runId), notes:[], open_questions:[], next_action:"continue", finding_drafts:[draft(profile.descriptor.runId)] });
	const saved = loadAnalysisState(profile.statePath);
	assert.equal(saved.loaded_evidence.length, 1);
	assert.deepEqual(saved.loaded_evidence[0]!.locator, { artifact:"trace", run_id:profile.descriptor.runId, sequence:1 });
	assert.ok(saved.loaded_evidence[0]!.characterCount > 0);
});

test("update_state rejects a resolvable Locator that was neither read nor search-exposed", async () => {
	const profile = setup("unexposed-evidence");
	await execute(profile, "list_runs", {});
	await assert.rejects(
		execute(profile, "update_state", { ...workflow(profile.descriptor.runId), notes:[], open_questions:[], next_action:"continue", finding_drafts:[draft(profile.descriptor.runId)] }),
		/not loaded or exposed by search_trace/,
	);
	assert.equal(existsSync(profile.statePath), false);
});

test("semantic snapshots allow f1 draft to kept while rejecting duplicate IDs and invalid status", async () => {
	const profile = setup("semantic");
	await execute(profile, "list_runs", {});
	await execute(profile, "read_evidence", { artifact:"trace", run_id:profile.descriptor.runId, sequence:1 });
	await execute(profile, "update_state", { ...workflow(profile.descriptor.runId), notes:[], open_questions:[], next_action:"continue", finding_drafts:[draft(profile.descriptor.runId)] });
	const kept = { ...draft(profile.descriptor.runId), counter_checked:true, status:"kept", limitation:"checked" };
	await execute(profile, "update_state", { ...workflow(profile.descriptor.runId), notes:["continued"], open_questions:[], next_action:"stop", finding_drafts:[kept] });
	assert.equal(loadAnalysisState(profile.statePath).finding_drafts[0]!.status, "kept");
	await assert.rejects(execute(profile, "update_state", { ...workflow(profile.descriptor.runId), notes:[], open_questions:[], next_action:"", finding_drafts:[draft(profile.descriptor.runId),draft(profile.descriptor.runId)] }), /duplicate Finding ID/);
	await assert.rejects(execute(profile, "update_state", { ...workflow(profile.descriptor.runId), notes:[], open_questions:[], next_action:"", finding_drafts:[{...draft(profile.descriptor.runId),status:"scored"}] }), /status is invalid/);
	await assert.rejects(execute(profile, "update_state", { ...workflow(profile.descriptor.runId), notes:[], open_questions:[], next_action:"", finding_drafts:[{...draft(profile.descriptor.runId),id:"new-legacy",claim_scope:undefined,agenda_item_id:undefined}] }), /new Finding new-legacy requires/);
});

test("resume Prompt contains only the saved State summary, not prior chat or Evidence content", () => {
	const state: AnalysisState = { covered_runs:["r1"], matrix_triage_complete:true, investigation_agenda:[], notes:["note"], open_questions:["question"], next_action:"inspect r2 verifier", loaded_evidence:[{artifact:"trace",locator:{artifact:"trace",run_id:"r1",sequence:4},characterCount:123}], finding_drafts:[draft("r1")] };
	const prompt = resumeAnalysisPrompt(state);
	for (const expected of ["inspect r2 verifier","synthetic observation","characterCount","sequence"]) assert.match(prompt, new RegExp(expected));
	for (const forbidden of ["SECRET_EVIDENCE_CONTENT","prior assistant chat","value\\.trim\\(\\)","sequence 9","sequence 11"]) assert.doesNotMatch(prompt, new RegExp(forbidden));
	assert.doesNotMatch(freshAnalysisPrompt(), /value\.trim|sequence 9|sequence 11|coding-task-/);
});

test("System Prompt carries the claim-scoped workflow disciplines", () => {
	assert.equal(ANALYSIS_SYSTEM_PROMPT.split("\n").filter((line) => /^\d\./.test(line)).length, 7);
	for (const required of ["outcome, evaluable status, selection status, and reason","External Verifier artifact","Global Matrix Triage","Claim Scope","Required Runs","run_observation requires only its anchor Run","Local Item closure is not Global Completion","Observation","Interpretation","Limitation","narrow the final Finding claim_scope","deprioritize","Do not manufacture a Finding","State records task progress while Artifacts record facts","counter_checked remains descriptive, not completion authority","bounded differences between labeled conditions","general causality","statistical reliability","final adoption decisions","update_state"]) assert.match(ANALYSIS_SYSTEM_PROMPT, new RegExp(required));
	for (const forbidden of ["Planner","Critic","confidence","expected Finding"]) assert.doesNotMatch(ANALYSIS_SYSTEM_PROMPT, new RegExp(forbidden, "i"));
});
