import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { fileSha256 } from "../src/hash.ts";
import { createAnalysisContext, finalizeAnalysisHandoff } from "../src/trace-analysis/analysis.ts";
import {
	buildControlledUnblindContext,
	completeControlledUnblindState,
	controlledUnblindPrompt,
	parseControlledUnblindResult,
	validateControlledUnblindResult,
} from "../src/trace-analysis/controlled-unblind.ts";
import type { AnalysisState, ControlledUnblindResult, FindingDraft, RunDescriptor } from "../src/trace-analysis/contracts.ts";
import { createBlindSensitivePathProjection } from "../src/trace-analysis/model-tools.ts";
import { runAnalysisInvocation, type AlignmentCompletionResult } from "../src/trace-analysis/model-runner.ts";
import { loadAnalysisState, saveAnalysisState } from "../src/trace-analysis/state.ts";

function temporary(label: string): string { return mkdtempSync(resolve(tmpdir(), `trace-analysis-phase4b-${label}-`)); }
function json(path: string, value: unknown): void { mkdirSync(resolve(path, ".."), { recursive: true }); writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }

function runFixture(root: string, label: string, condition: string, skill: { path: string; sha256: string } | null): RunDescriptor {
	const runRoot = resolve(root, `run-${label}`); const runId = `run-${label}`;
	json(resolve(runRoot, "run-manifest.json"), {
		schema_version:1,run_id:runId,task_id:"task-a",source_revision:null,existing_tree_digest:"tree",model:{provider:"faux",id:"fixture"},pi_commit:"0".repeat(40),
		skill:skill ? {path:skill.path,actual_sha256:skill.sha256} : null,execution_status:"completed",verification_status:"passed",failure_reason:null,agent_final_claim:null,
		started_at:"2026-01-01T00:00:00Z",finished_at:"2026-01-01T00:00:01Z",usage:{request_count:0,input_tokens:0,output_tokens:0,cost_usd:0,tool_count:1,duration_ms:1,unknown_fields:[]},changes:{added:[],modified:[],deleted:[]},
		artifacts:{session:"missing.jsonl",trace:"trace.json",diff:"diff.patch",verifier_result:"verifier/result.json",report:"report.md"},known_limitations:[],
	});
	json(resolve(runRoot, "trace.json"), {agent:{status:"completed",end_reason:"settled"},events:[{sequence:1,type:"file_read",tool_name:"workspace_read",path:`RAW_TRACE_${label}`} ]});
	writeFileSync(resolve(runRoot, "diff.patch"), "", "utf8"); json(resolve(runRoot, "verifier/result.json"), {status:"passed",exit_code:0}); writeFileSync(resolve(runRoot, "verifier/output.txt"), "passed\n", "utf8"); writeFileSync(resolve(runRoot, "report.md"), "# report\n", "utf8");
	return {runId,root:runRoot,labels:{case_id:"case-dynamic",condition,trial:1},evaluation:{attempt:1,includedForEvaluation:true,outcome:"PASS",evaluable:true,reason:"fixture PASS"}};
}

function environment(label: string) {
	const root = temporary(label); const skillRoot = resolve(root, "candidate", "skill"); const skillPath = resolve(skillRoot, "SKILL.md");
	mkdirSync(skillRoot, {recursive:true});
	writeFileSync(skillPath, "---\nname: skill\ndescription: Bounded fixture skill\ndisable-model-invocation: true\n---\n\n# Procedure\n\n1. Inspect the registry before editing.\n2. Run the registered tests.\n", "utf8");
	const sha256 = fileSha256(skillPath); const buildPath = resolve(root, "candidate", "build.json");
	json(buildPath, {schema_version:1,status:"built",skill_path:skillPath,skill_sha256:sha256});
	const descriptors = [runFixture(root,"zeta","zeta",null),runFixture(root,"alpha","alpha",{path:skillPath,sha256})];
	const batchPath = resolve(root,"formal-plan.json"); const mappingPath = resolve(root,"thin-evaluation-mapping.json");
	json(batchPath,{evaluation_id:"eval-dynamic",suite:"fixture",execution_head:"a".repeat(40),candidate_build_ref:buildPath,candidate_expected_sha256:sha256,planned_runs:[
		{plan_id:"p-zeta",case_id:"case-dynamic",condition:"zeta",trial:1,task_ref:"task-a",planned_skill:null},
		{plan_id:"p-alpha",case_id:"case-dynamic",condition:"alpha",trial:1,task_ref:"task-a",planned_skill:{build_ref:buildPath,expected_sha256:sha256}},
	]});
	json(mappingPath,{evaluation_id:"eval-dynamic",run_refs:descriptors.map((descriptor,index)=>({plan_id:index===0?"p-zeta":"p-alpha",run_id:descriptor.runId,run_root:descriptor.root,attempt:1,included_for_evaluation:true,manual_invalid_reason:null}))});
	const runIds=descriptors.map((descriptor)=>descriptor.runId);
	const finding: FindingDraft={id:"finding-1",observation:"Arm X and Arm Y differ.",interpretation:"Bounded blind contrast.",limitation:"One case only.",applicable_runs:runIds,repeated_support_run_ids:runIds,support:runIds.map((run_id)=>({artifact:"trace" as const,run_id,sequence:1})),counter:[],counter_checked:true,status:"kept",sealed:false,claim_scope:"condition_comparison",agenda_item_id:"agenda-1"};
	const blind:AnalysisState={phase:"blind_analysis",covered_runs:runIds,matrix_triage_complete:true,investigation_agenda:[{id:"agenda-1",question:"contrast?",trigger:"Matrix contrast",claim_scope:"condition_comparison",anchor_run_ids:[runIds[0]!],relevant_case_ids:[],checked_runs:runIds,settle_condition:"bounded contrast",process_investigation_required:false,process_investigation_resolution:null,status:"settled",closure_reason:"checked"}],notes:[],open_questions:[],next_action:"",loaded_evidence:finding.support.map((locator)=>({artifact:locator.artifact,locator,characterCount:10})),finding_drafts:[finding]};
	const state=finalizeAnalysisHandoff(blind,descriptors); const output=resolve(root,"analysis"); saveAnalysisState(output,state);
	return {root,output,state,descriptors,batchPath,mappingPath,skillPath,sha256,buildPath};
}

function validResult(sha256:string):ControlledUnblindResult {
	return {alignments:[{behavior_finding_id:"finding-1",content_correspondence:"DIRECT",skill_evidence_refs:[{candidate_sha256:sha256,start_line:9,end_line:9}],differentiation_status:"REPEATED",condition_contrast:"zeta differs from alpha in the sealed observation.",counter_and_claim_boundary:"Both authoritative outcomes pass; process direction alone does not prove benefit.",benefit:"UNPROVEN",causation:"UNPROVEN",max_supported_claim:"A case-bounded correspondence and condition difference is observed.",skill_recommendation:"NO_CHANGE_JUSTIFIED",evidence_disposition:"RETAIN_OBSERVATION"}],follow_up_observations:[{observation:"No additional investigation was performed."}]};
}

function completion(result:unknown):AlignmentCompletionResult {
	return {text:JSON.stringify(result),model:{provider:"faux",id:"alignment"},usage:{input_tokens:10,output_tokens:20,cost_usd:0}};
}

test("alignment_ready uses one zero-tool closed-evidence completion and persists human_review_ready", async()=>{
	const env=environment("success"); const before=structuredClone(env.state.finding_drafts); let calls=0; let credentialResolved=false;
	const result=await runAnalysisInvocation({mode:"resume",descriptors:env.descriptors,outputDirectory:env.output,credentialResolver:{resolve:async()=>{credentialResolved=true;return "unused";}},evaluationAuthority:{batchPath:env.batchPath,mappingPath:env.mappingPath},alignmentCompletion:async(input)=>{
		calls++; assert.match(input.systemPrompt,/quoted intervention evidence/); assert.match(input.systemPrompt,/Mechanical origin.*does not establish why.*not Candidate-content evidence/s); assert.match(input.userPrompt,/Arm X/); assert.match(input.userPrompt,/"real_condition": "alpha"/); assert.match(input.userPrompt,/9: 1\. Inspect the registry/); assert.doesNotMatch(input.userPrompt,/RAW_TRACE_/); return completion(validResult(env.sha256));
	}});
	assert.equal(result.stage,"controlled_unblind"); assert.equal(result.model_invoked,true); assert.deepEqual(result.tool_names,[]); assert.equal(calls,1); assert.equal(credentialResolved,false);
	const saved=loadAnalysisState(resolve(env.output,"analysis-state.json")); assert.equal(saved.phase,"human_review_ready"); assert.deepEqual(saved.finding_drafts,before); assert.deepEqual(saved.controlled_unblind_result,validResult(env.sha256));
});

test("condition aliases and outcome projection are dynamically recovered from Formal artifacts",async()=>{
	const env=environment("mapping"); const context=await buildControlledUnblindContext({state:env.state,descriptors:env.descriptors,batchPath:env.batchPath,mappingPath:env.mappingPath});
	assert.deepEqual(context.condition_mapping,[{blind_alias:"Arm X",real_condition:"alpha"},{blind_alias:"Arm Y",real_condition:"zeta"}]);
	assert.deepEqual(context.finding_scoped_outcomes[0]!.runs.map((run)=>[run.run_id,run.real_condition,run.outcome]),[["run-zeta","zeta","PASS"],["run-alpha","alpha","PASS"]]);
});

test("controlled unblind receives only finding-scoped safe projection provenance after seal",async()=>{
	const env=environment("projection-provenance");
	const projection=createBlindSensitivePathProjection(createAnalysisContext(env.descriptors));
	const alias=projection.project(env.skillPath); assert.equal(typeof alias,"string");
	const state=structuredClone(env.state); state.finding_drafts[0]!.observation=`The observed target was ${alias}.`;
	const sealedBefore=structuredClone(state.finding_drafts);
	const context=await buildControlledUnblindContext({state,descriptors:env.descriptors,batchPath:env.batchPath,mappingPath:env.mappingPath});
	assert.deepEqual(context.finding_scoped_projection_provenance,[{behavior_finding_id:"finding-1",projections:[{projected_value:alias,projection_placeholder:true,raw_literal:false,origin_category:"skill_delivery"}]}]);
	const prompt=controlledUnblindPrompt(context);
	assert.match(prompt,/"projection_placeholder": true/); assert.match(prompt,/"raw_literal": false/); assert.match(prompt,/"origin_category": "skill_delivery"/);
	assert.doesNotMatch(prompt,new RegExp(env.skillPath.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"))); assert.doesNotMatch(prompt,/RAW_TRACE_/);
	assert.deepEqual(state.finding_drafts,sealedBefore); assert.equal("finding_scoped_projection_provenance" in state,false);
	const unrelated=structuredClone(env.state); unrelated.finding_drafts[0]!.observation="No projected value appears.";
	const unrelatedContext=await buildControlledUnblindContext({state:unrelated,descriptors:env.descriptors,batchPath:env.batchPath,mappingPath:env.mappingPath});
	assert.deepEqual(unrelatedContext.finding_scoped_projection_provenance,[]);
});

test("Candidate authority mismatch fails before model completion and leaves State unchanged",async()=>{
	const env=environment("candidate-mismatch"); const batch=JSON.parse(readFileSync(env.batchPath,"utf8")) as Record<string,unknown>; batch.candidate_expected_sha256="b".repeat(64); json(env.batchPath,batch);
	const before=readFileSync(resolve(env.output,"analysis-state.json"),"utf8"); let calls=0;
	await assert.rejects(runAnalysisInvocation({mode:"resume",descriptors:env.descriptors,outputDirectory:env.output,credentialResolver:{resolve:async()=>"unused"},evaluationAuthority:{batchPath:env.batchPath,mappingPath:env.mappingPath},alignmentCompletion:async()=>{calls++;return completion(validResult(env.sha256));}}),/Candidate build SHA/);
	assert.equal(calls,0); assert.equal(readFileSync(resolve(env.output,"analysis-state.json"),"utf8"),before); assert.equal(loadAnalysisState(resolve(env.output,"analysis-state.json")).phase,"alignment_ready");
});

test("mechanical validation rejects coverage, enums, and illegal Skill refs without persisting",async()=>{
	const env=environment("validation"); const context=await buildControlledUnblindContext({state:env.state,descriptors:env.descriptors,batchPath:env.batchPath,mappingPath:env.mappingPath}); const base=validResult(env.sha256);
	for(const [label,value,pattern] of [
		["missing",{...base,alignments:[]},/exactly cover/],
		["unknown",{...base,alignments:[{...base.alignments[0]!,behavior_finding_id:"unknown"}]},/exactly cover/],
		["duplicate",{...base,alignments:[base.alignments[0]!,base.alignments[0]!]},/duplicate Finding/],
		["wrong-sha",{...base,alignments:[{...base.alignments[0]!,skill_evidence_refs:[{candidate_sha256:"c".repeat(64),start_line:9,end_line:9}]}]},/wrong Candidate SHA/],
		["range",{...base,alignments:[{...base.alignments[0]!,skill_evidence_refs:[{candidate_sha256:env.sha256,start_line:999,end_line:999}]}]},/out of range/],
	] as const){ assert.throws(()=>validateControlledUnblindResult(env.state,value as unknown as ControlledUnblindResult,context.frozen_candidate_skill),pattern,label); }
	for(const content_correspondence of ["DIRECT","PLAUSIBLE","CONTRADICTED"] as const) assert.throws(()=>validateControlledUnblindResult(env.state,{...base,alignments:[{...base.alignments[0]!,content_correspondence,skill_evidence_refs:[]}]},context.frozen_candidate_skill),/requires at least one/,content_correspondence);
	assert.throws(()=>parseControlledUnblindResult(JSON.stringify({...base,alignments:[{...base.alignments[0]!,causation:"SUPPORTED"}]})),/causation is invalid/);
	const before=readFileSync(resolve(env.output,"analysis-state.json"),"utf8");
	await assert.rejects(runAnalysisInvocation({mode:"resume",descriptors:env.descriptors,outputDirectory:env.output,credentialResolver:{resolve:async()=>"unused"},evaluationAuthority:{batchPath:env.batchPath,mappingPath:env.mappingPath},alignmentCompletion:async()=>completion({...base,alignments:[]})}),/exactly cover/);
	assert.equal(readFileSync(resolve(env.output,"analysis-state.json"),"utf8"),before);
});

test("model failure and malformed output leave the complete alignment_ready State unchanged",async()=>{
	for(const [label,complete,pattern] of [
		["model-failure",async()=>{throw new Error("bounded completion failed");},/bounded completion failed/],
		["malformed",async()=>({...completion({}),text:"not-json"}),/Unexpected token|JSON/],
	] as const){
		const env=environment(label); const before=readFileSync(resolve(env.output,"analysis-state.json"),"utf8");
		await assert.rejects(runAnalysisInvocation({mode:"resume",descriptors:env.descriptors,outputDirectory:env.output,credentialResolver:{resolve:async()=>"unused"},evaluationAuthority:{batchPath:env.batchPath,mappingPath:env.mappingPath},alignmentCompletion:complete}),pattern);
		assert.equal(readFileSync(resolve(env.output,"analysis-state.json"),"utf8"),before); assert.equal(loadAnalysisState(resolve(env.output,"analysis-state.json")).phase,"alignment_ready");
	}
});

test("zero-Finding deterministically skips Candidate, Credential, and model and persists an empty result",async()=>{
	const env=environment("zero"); const empty=finalizeAnalysisHandoff({...env.state,phase:"blind_analysis",investigation_agenda:[],finding_drafts:[],loaded_evidence:[]},env.descriptors); saveAnalysisState(env.output,empty);
	let completionCalls=0; let credentialCalls=0;
	const result=await runAnalysisInvocation({mode:"resume",descriptors:env.descriptors,outputDirectory:env.output,credentialResolver:{resolve:async()=>{credentialCalls++;return "unused";}},alignmentCompletion:async()=>{completionCalls++;return completion({});}});
	assert.equal(result.stage,"controlled_unblind"); assert.equal(result.model_invoked,false); assert.equal(completionCalls,0); assert.equal(credentialCalls,0); assert.equal(result.state.phase,"human_review_ready"); assert.deepEqual(result.state.controlled_unblind_result,{alignments:[],follow_up_observations:[]}); assert.deepEqual(result.state.finding_drafts,[]);
	await assert.rejects(runAnalysisInvocation({mode:"resume",descriptors:env.descriptors,outputDirectory:env.output,credentialResolver:{resolve:async()=>{credentialCalls++;return "unused";}},evaluationAuthority:{batchPath:env.batchPath,mappingPath:env.mappingPath}}),/cannot run Analysis again/);
	assert.equal(credentialCalls,0);
});

test("human_review_ready cannot execute A or B and compatibility State may omit B result before that phase",async()=>{
	const env=environment("terminal"); const context=await buildControlledUnblindContext({state:env.state,descriptors:env.descriptors,batchPath:env.batchPath,mappingPath:env.mappingPath}); const terminal=completeControlledUnblindState(env.state,env.descriptors,validResult(env.sha256),context.frozen_candidate_skill); saveAnalysisState(env.output,terminal);
	let credentialCalls=0; let completionCalls=0;
	await assert.rejects(runAnalysisInvocation({mode:"resume",descriptors:env.descriptors,outputDirectory:env.output,credentialResolver:{resolve:async()=>{credentialCalls++;return "unused";}},evaluationAuthority:{batchPath:env.batchPath,mappingPath:env.mappingPath},alignmentCompletion:async()=>{completionCalls++;return completion({});}}),/cannot run Analysis again/);
	assert.equal(credentialCalls,0); assert.equal(completionCalls,0);
	const compatible={...env.state}; delete compatible.controlled_unblind_result; saveAnalysisState(env.output,compatible); assert.equal(loadAnalysisState(resolve(env.output,"analysis-state.json")).phase,"alignment_ready");
	const blindCompatible:AnalysisState={...compatible,phase:"blind_analysis",finding_drafts:compatible.finding_drafts.map((finding)=>({...finding,sealed:false}))}; saveAnalysisState(env.output,blindCompatible); assert.equal(loadAnalysisState(resolve(env.output,"analysis-state.json")).phase,"blind_analysis");
});

test("persisted human_review_ready requires a mechanically valid completed B result",async()=>{
	for(const [label,result,pattern] of [
		["missing",undefined,/requires a completed controlled-unblind result/],
		["enum",{...validResult("a".repeat(64)),alignments:[{...validResult("a".repeat(64)).alignments[0]!,causation:"SUPPORTED"}]},/causation is invalid/],
		["coverage",{...validResult("a".repeat(64)),alignments:[]},/exactly cover/],
		["skill-ref",validResult("b".repeat(64)),/wrong Candidate SHA/],
	] as const){
		const env=environment(`persisted-${label}`); const context=await buildControlledUnblindContext({state:env.state,descriptors:env.descriptors,batchPath:env.batchPath,mappingPath:env.mappingPath});
		const terminal=completeControlledUnblindState(env.state,env.descriptors,validResult(env.sha256),context.frozen_candidate_skill);
		saveAnalysisState(env.output,{...terminal,controlled_unblind_result:result} as unknown as AnalysisState);
		await assert.rejects(runAnalysisInvocation({mode:"resume",descriptors:env.descriptors,outputDirectory:env.output,credentialResolver:{resolve:async()=>"unused"},evaluationAuthority:{batchPath:env.batchPath,mappingPath:env.mappingPath}}),pattern,label);
	}
});
