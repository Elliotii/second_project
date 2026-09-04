import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { createAnalysisContext, finalizeAnalysisHandoff, validateAnalysisWorkflow, validateSealedHandoffImmutability } from "../src/trace-analysis/analysis.ts";
import type { AnalysisState, FindingDraft, InvestigationAgendaItem, RunDescriptor } from "../src/trace-analysis/contracts.ts";
import { createAnalysisTools } from "../src/trace-analysis/model-tools.ts";
import { runAnalysisInvocation } from "../src/trace-analysis/model-runner.ts";
import { loadAnalysisState, saveAnalysisState } from "../src/trace-analysis/state.ts";

function temporary(label: string): string { return mkdtempSync(resolve(tmpdir(), `trace-analysis-phase3b-${label}-`)); }
function json(path: string, value: unknown): void { mkdirSync(resolve(path, ".."), { recursive: true }); writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }

function fixture(label: string, condition: string, trial: number): RunDescriptor {
	const root = temporary(label); const runId = `run-${label}`;
	json(resolve(root, "run-manifest.json"), {
		schema_version:1, run_id:runId, task_id:"fixture-task", source_revision:null, existing_tree_digest:"tree", model:{provider:"faux",id:"fixture"}, pi_commit:"0".repeat(40), skill:null,
		execution_status:"completed", verification_status:"passed", failure_reason:null, agent_final_claim:null, started_at:"2026-01-01T00:00:00Z", finished_at:"2026-01-01T00:00:01Z",
		usage:{request_count:0,input_tokens:0,output_tokens:0,cost_usd:0,tool_count:1,duration_ms:1,unknown_fields:[]}, changes:{added:[],modified:[],deleted:[]},
		artifacts:{session:"missing.jsonl",trace:"trace.json",diff:"diff.patch",verifier_result:"verifier/result.json",report:"report.md"}, known_limitations:[],
	});
	json(resolve(root, "trace.json"), {agent:{status:"completed",end_reason:"settled"},events:[{sequence:1,type:"file_read",phase:"start",tool_call_id:"c1",tool_name:"workspace_read",path:"src/a.ts"},{sequence:2,type:"tool_result",phase:"end",tool_call_id:"c1",tool_name:"workspace_read",status:"ok"}]});
	writeFileSync(resolve(root, "diff.patch"), "", "utf8"); json(resolve(root, "verifier/result.json"), {status:"passed",exit_code:0}); writeFileSync(resolve(root, "verifier/output.txt"), "passed\n", "utf8"); writeFileSync(resolve(root, "report.md"), "# report\n", "utf8");
	return {runId,root,labels:{case_id:"A",condition,trial},evaluation:{attempt:1,includedForEvaluation:true,outcome:"PASS",evaluable:true,reason:"fixture"}};
}

function agenda(runIds: string[], status: "open" | "settled" = "settled"): InvestigationAgendaItem {
	return {id:"i1",question:"Is the blind contrast repeated?",trigger:"blind Matrix contrast",claim_scope:"condition_comparison",anchor_run_ids:[runIds[0]!],relevant_case_ids:[],checked_runs:status === "settled" ? [...runIds] : [runIds[0]!],settle_condition:"inspect the bounded contrast",process_investigation_required:false,process_investigation_resolution:null,status,closure_reason:status === "settled" ? "bounded checks complete" : ""};
}

function finding(runIds: string[], overrides: Partial<FindingDraft> = {}): FindingDraft {
	return {id:"f1",observation:"Arm X repeatedly inspected before Arm Y.",interpretation:"A blind bounded contrast.",limitation:"Case A only.",applicable_runs:[...runIds],repeated_support_run_ids:[...runIds],support:runIds.map((run_id) => ({artifact:"trace" as const,run_id,sequence:1})),counter:[{artifact:"verifier",run_id:runIds[1]!}],counter_checked:true,status:"kept",sealed:false,claim_scope:"condition_comparison",agenda_item_id:"i1",...overrides};
}

function state(descriptors: RunDescriptor[], overrides: Partial<AnalysisState> = {}): AnalysisState {
	const runIds = descriptors.map((entry) => entry.runId); const kept = finding(runIds);
	return {phase:"blind_analysis",covered_runs:runIds,matrix_triage_complete:true,investigation_agenda:[agenda(runIds)],notes:[],open_questions:[],next_action:"",loaded_evidence:[...kept.support,...kept.counter].map((locator) => ({artifact:locator.artifact,locator,characterCount:10})),finding_drafts:[kept],...overrides};
}

async function execute(profile: ReturnType<typeof createAnalysisTools>, args: Record<string, unknown>) {
	const tool = profile.tools.find((candidate) => candidate.name === "update_state")!;
	return tool.execute("test-call", args as never, undefined, undefined, profile.context);
}

test("Global incomplete cannot seal while complete and zero-Finding states transition", () => {
	const descriptors = [fixture("x1","x",1),fixture("y1","y",1)]; const runIds = descriptors.map((entry) => entry.runId);
	const openAgenda = agenda(runIds,"open"); openAgenda.checked_runs = [...runIds];
	const incomplete = state(descriptors,{investigation_agenda:[openAgenda],next_action:"continue"});
	assert.throws(() => finalizeAnalysisHandoff(incomplete,descriptors),/before Global Completion/);
	assert.equal(incomplete.phase,"blind_analysis"); assert.equal(incomplete.finding_drafts[0]!.sealed,false);
	const complete = finalizeAnalysisHandoff(state(descriptors),descriptors);
	assert.equal(complete.phase,"alignment_ready"); assert.equal(complete.finding_drafts[0]!.status,"kept"); assert.equal(complete.finding_drafts[0]!.sealed,true);
	const empty = finalizeAnalysisHandoff(state(descriptors,{investigation_agenda:[],finding_drafts:[],loaded_evidence:[]}),descriptors);
	assert.equal(empty.phase,"alignment_ready"); assert.deepEqual(empty.finding_drafts,[]);
});

test("only kept Findings seal; repeated support is explicit, persistent, optional, and never inferred", () => {
	const descriptors = [fixture("x2","x",1),fixture("y2","y",1)]; const base = state(descriptors); const runIds = descriptors.map((entry) => entry.runId);
	const draft = finding(runIds,{id:"draft",status:"draft",repeated_support_run_ids:[]}); const dropped = finding(runIds,{id:"dropped",status:"dropped",repeated_support_run_ids:[]});
	const finalized = finalizeAnalysisHandoff({...base,finding_drafts:[base.finding_drafts[0]!,draft,dropped]},descriptors);
	assert.deepEqual(finalized.finding_drafts.map((entry) => [entry.status,entry.sealed]),[["kept",true],["draft",false],["dropped",false]]);
	assert.deepEqual(finalized.finding_drafts[0]!.repeated_support_run_ids,runIds);
	assert.deepEqual(finalized.finding_drafts[1]!.repeated_support_run_ids,[]);
	const single = finding(runIds,{id:"single",claim_scope:"run_observation",applicable_runs:[runIds[0]!],repeated_support_run_ids:[],support:[{artifact:"trace",run_id:runIds[0]!,sequence:1}]});
	const singleState = state(descriptors,{finding_drafts:[single]}); singleState.investigation_agenda[0]!.claim_scope="run_observation"; singleState.investigation_agenda[0]!.checked_runs=[runIds[0]!];
	assert.deepEqual(finalizeAnalysisHandoff(singleState,descriptors).finding_drafts[0]!.repeated_support_run_ids,[]);
});

test("seal persists the minimal handoff and blind wording without topology duplication", () => {
	const descriptors = [fixture("x3","x",1),fixture("y3","y",1)]; const finalized = finalizeAnalysisHandoff(state(descriptors),descriptors);
	const reloaded = loadAnalysisState(saveAnalysisState(temporary("persist"),finalized));
	assert.deepEqual(reloaded,finalized); assert.match(reloaded.finding_drafts[0]!.observation,/Arm X.*Arm Y/);
	assert.deepEqual(reloaded.finding_drafts[0]!.repeated_support_run_ids,descriptors.map((entry) => entry.runId));
	assert.equal("pair_ids" in reloaded.finding_drafts[0]!,false); assert.equal("condition_map" in reloaded,false);
	assert.deepEqual(finalizeAnalysisHandoff(reloaded,descriptors),reloaded);
});

test("sealed A-owned payload rejects deletion, ID replacement, representative edits, and phase regression", () => {
	const descriptors = [fixture("x4","x",1),fixture("y4","y",1)]; const sealed = finalizeAnalysisHandoff(state(descriptors),descriptors); const original = sealed.finding_drafts[0]!;
	const reject = (finding_drafts: FindingDraft[], phase: AnalysisState["phase"] = "alignment_ready") => assert.throws(() => validateSealedHandoffImmutability(sealed,{...sealed,phase,finding_drafts}),/sealed Finding|phase cannot regress/);
	reject([]); reject([{...original,id:"replacement"}]); reject([{...original,observation:"rewritten"}]); reject([{...original,claim_scope:"run_observation"}]);
	reject([{...original,repeated_support_run_ids:[]}]); reject([{...original,support:original.support.slice(1)}]); reject([{...original,counter:[]}]); reject(sealed.finding_drafts,"blind_analysis");
});

test("model cannot promote lifecycle and alignment_ready cannot re-enter Blind update", async () => {
	const descriptors = [fixture("x5","x",1),fixture("y5","y",1)]; const analysis = createAnalysisContext(descriptors); const output = temporary("guard"); const sealed = finalizeAnalysisHandoff(state(descriptors),descriptors);
	const blindProfile = createAnalysisTools({analysis,statePath:resolve(output,"blind-analysis-state.json"),initialState:state(descriptors)});
	await assert.rejects(execute(blindProfile,{phase:"alignment_ready",matrix_triage_complete:true,investigation_agenda:[],notes:[],open_questions:[],next_action:"",finding_drafts:[]}),/phase is Harness-owned/);
	await assert.rejects(execute(blindProfile,{matrix_triage_complete:true,investigation_agenda:[],notes:[],open_questions:[],next_action:"",finding_drafts:[{...finding(descriptors.map((entry) => entry.runId)),sealed:true}]}),/seal lifecycle is Harness-owned/);
	const sealedProfile = createAnalysisTools({analysis,statePath:resolve(output,"sealed-analysis-state.json"),initialState:sealed});
	await assert.rejects(execute(sealedProfile,{matrix_triage_complete:true,investigation_agenda:[],notes:[],open_questions:[],next_action:"",finding_drafts:[]}),/cannot be modified through Blind Analysis/);
	saveAnalysisState(output,sealed); let resolved = false;
	await assert.rejects(runAnalysisInvocation({mode:"resume",descriptors,outputDirectory:output,credentialResolver:{resolve:async()=>{resolved=true;return "unused";}}}),/Controlled unblind requires Batch Freeze/);
	assert.equal(resolved,false);
});

test("legacy State stays readable but cannot enter Blind Resume, while explicit current Blind identity passes the guard", async () => {
	const descriptors = [fixture("x-legacy","x",1),fixture("y-legacy","y",1)];
	const legacyOutput = temporary("legacy-resume");
	json(resolve(legacyOutput,"analysis-state.json"),{covered_runs:descriptors.map((entry)=>entry.runId),matrix_triage_complete:false,investigation_agenda:[],notes:["historical"],open_questions:[],next_action:"continue",loaded_evidence:[],finding_drafts:[]});
	assert.equal(loadAnalysisState(resolve(legacyOutput,"analysis-state.json")).phase,"blind_analysis");
	let legacyCredentialResolved = false;
	await assert.rejects(runAnalysisInvocation({mode:"resume",descriptors,outputDirectory:legacyOutput,credentialResolver:{resolve:async()=>{legacyCredentialResolved=true;return "unused";}}}),/requires an explicit persisted phase/);
	assert.equal(legacyCredentialResolved,false);

	const currentOutput = temporary("current-blind-resume"); saveAnalysisState(currentOutput,state(descriptors,{matrix_triage_complete:false,investigation_agenda:[],finding_drafts:[],loaded_evidence:[],next_action:"continue"}));
	let currentCredentialResolved = false;
	await assert.rejects(runAnalysisInvocation({mode:"resume",descriptors,outputDirectory:currentOutput,credentialResolver:{resolve:async()=>{currentCredentialResolved=true;return "";}}}),/Credential resolution failed/);
	assert.equal(currentCredentialResolved,true);
});

test("repeated-support provenance must remain auditable when explicitly supplied", () => {
	const descriptors = [fixture("x6","x",1),fixture("y6","y",1)]; const invalid = state(descriptors); invalid.finding_drafts[0]!.support = invalid.finding_drafts[0]!.support.slice(1);
	assert.throws(() => validateAnalysisWorkflow(invalid,descriptors),/no supporting Evidence Locator/);
});
