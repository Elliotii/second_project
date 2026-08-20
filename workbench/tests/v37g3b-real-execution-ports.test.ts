import assert from "node:assert/strict";
import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import test, { mock } from "node:test";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall } from "@earendil-works/pi-ai";
import type { AttemptRuntimeEvidenceV2B } from "../src/contracts/v2b-types.ts";
import { sha256 } from "../src/hash.ts";
import { createDeterministicExecutionPortV2A } from "../src/run-v2.ts";
import { loadRegisteredCaseFromHostRegistryV37G3A } from "../src/v37/host-registry-v37g3a.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const CASE_ID="v37-real-recovery-promote-retain";
const ACTIONS=["run_primary","run_recovery","confirm_recovery_evidence","request_recovery_admission","produce_candidate","run_regression","run_follow_up","confirm_follow_up_evidence","request_follow_up_admission","assess_state"] as const;
const authority=()=>({schema_version:1 as const,kind:"v37_g3b_host_execution_port_bridge_authority" as const,case_id:CASE_ID as typeof CASE_ID,project_id:"v37-real-recovery-project" as const,configuration_candidate_commit:"57f419c35bdbd972bda890f45d874df35777dd72" as const,configuration_candidate_tree:"43dc96fa99fa31cd552863cc0b569637a682ba10" as const,manifest_body_digest:"36a4cf214c0c9e3ab05764184cb7e702304ddb80e7570fa3c5af3282de8a384f" as const,workflow_registration_digest:"05c21169123adad97723251caf0835a622a7f7de25d06ca99df6dbbb5d532b0d" as const,follow_up_execution_profile_digest:"f139a899b4304f6f403f3077ad76857a05780f824186f308489a54f15c61c8e4" as const,registry_index_digest:"0fc93a326f4275465d285dd94fad0ac686b0c86778b8865bace5ae5ba48e9d3d" as const,candidate_proposal_authority_digest:"5356ffff6acf35fa41df96addce0e987034462d848d3cc3aeee6ac652a684054" as const,regression_authority_digest:"beb420eb73b66536501f3b242f5dc04daf5ee18c5ede5c82067a2cdbb0c9db7d" as const});

let modelFactoryCalls=0;
let scenario:"complete"|"malformed"|"invalid_schema"|"over_budget"|"unknown_usage"|"primary_abort_after_evidence"="complete";
let capturedCandidateTemplates:Array<{template_id:string;content:string}>=[];
let runtimeCreateGate:Promise<void>|null=null;
let signalRuntimeCreate:(()=>void)|null=null;
const models=createModels();
const provider=fauxProvider({provider:"deepseek",models:[{id:"deepseek-v4-flash",name:"DeepSeek V4 Flash",reasoning:true,input:["text"],cost:{input:0.14,output:0.28,cacheRead:0.0028,cacheWrite:0},contextWindow:1000000,maxTokens:384000}]});
models.setProvider(provider.provider);

function proposalFromPrompt(prompt:string):string{
	if(scenario==="malformed")return "not json";
	if(scenario==="invalid_schema")return JSON.stringify({schema_version:1});
	if(scenario==="over_budget")return "x".repeat(70000);
	const templateMarker="Frozen registered prompt-addendum template:\n",inputMarker="\nFrozen producer input:\n",templateStart=prompt.indexOf(templateMarker);assert.notEqual(templateStart,-1);const inputStart=prompt.indexOf(inputMarker,templateStart);assert.notEqual(inputStart,-1);const template=JSON.parse(prompt.slice(templateStart+templateMarker.length,inputStart)) as {template_id:string;content:string};const input=JSON.parse(prompt.slice(inputStart+inputMarker.length)) as any;capturedCandidateTemplates.push(template);
	const applicability={task_kinds:[input.opportunity.task_context.task_kind],failure_families:[input.opportunity.task_context.failure_family]};
	return JSON.stringify({schema_version:1,proposal_id:`bridge-proposal-${input.opportunity.opportunity_id}`,evidence_digest:input.opportunity.evidence_identity.evidence_digest,expected_base_state_digest:input.expected_base_state_digest,diagnosis:{pattern_id:input.opportunity.trigger,statement:"The frozen Primary evidence shows a verifier failure before bounded recovery.",evidence_refs:input.opportunity.evidence_refs},lesson:{statement:"Run the task-declared check before reporting completion.",expected_outcome:"The related task is externally checked before completion.",applicability},edits:[{kind:"prompt_addendum",entry_id:template.template_id,content:template.content,applicability}]});
}
function messageText(message:any):string{return typeof message.content==="string"?message.content:Array.isArray(message.content)?message.content.filter((part:any)=>part?.type==="text").map((part:any)=>part.text).join(""):"";}

mock.module("../src/session/real-smoke-turn-v35.ts",{namedExports:{createPostV35DeepSeekModelFactory:()=>({create:async(_credential:string)=>{modelFactoryCalls++;signalRuntimeCreate?.();if(runtimeCreateGate)await runtimeCreateGate;provider.setResponses([
	(context)=>fauxAssistantMessage(proposalFromPrompt(messageText(context.messages.at(-1))),{timestamp:1}),
	()=>fauxAssistantMessage("Base arm inspected without edits.",{timestamp:2}),
	()=>fauxAssistantMessage(fauxToolCall("workspace_edit",{path:"subject.txt",old_text:"broken\n",new_text:"fixed\n"},{id:"regression-edit"}),{stopReason:"toolUse",timestamp:3}),
	()=>fauxAssistantMessage("Candidate arm edit complete.",{timestamp:4}),
	()=>fauxAssistantMessage(fauxToolCall("workspace_edit",{path:"src/policy.mjs",old_text:"  return value;",new_text:"  return Math.max(0, value);"},{id:"follow-edit"}),{stopReason:"toolUse",timestamp:5}),
	()=>fauxAssistantMessage("Follow-up edit complete.",{timestamp:6}),
]);return {models,model:provider.getModel(),close:async()=>undefined};}})}});

mock.module("../src/pi/pi-run-handle-v2b.ts",{namedExports:{createRealExecutionPortV2B:(options:any)=>{
	const delegate=createDeterministicExecutionPortV2A();let ordinal=0,opened=false;
	return {execute:async(input:any)=>{if(!opened){opened=true;const access=options.authority.open();await access.resolveCredential();options.realCounters.credential_reads++;}
		const role=ordinal===0?"primary":ordinal===1?"continue_failed_session":"fresh_session_from_failure_seed";ordinal++;options.onAttemptStarted?.({attemptId:input.attemptId,role});const result=await delegate.execute(input);const metadata=await input.session.getMetadata();options.realCounters.network_calls+=result.providerDispatches;options.realCounters.external_provider_calls+=result.providerDispatches;options.realCounters.real_model_calls+=result.providerDispatches;
		const usage={provider_requests:result.providerDispatches,tool_calls:result.toolCalls,input_tokens:result.tokens,output_tokens:0,cache_read_tokens:0,cache_write_tokens:0,conservative_charged_tokens:0,tokens:result.tokens,active_execution_time_ms:result.activeExecutionTimeMs,verifier_runs:1,real_cost_usd:scenario==="unknown_usage"&&ordinal===1?Number.NaN:0,conservative_charged_cost_usd:0};
		const evidence={schema_version:"v2b-attempt-runtime-evidence-v1",attempt_id:input.attemptId,role,terminal_reason:"settled",settled:true,agent_completion:"settled",quiescence:null,runtime_budget_stop_observation:null,composition:{provider:"deepseek",model_id:"deepseek-v4-flash",api:"openai-completions",endpoint:"https://api.deepseek.com/chat/completions",thinking_level:"off",retry:false,fallback:false,session_id:metadata.id,session_path:metadata.path,session_cwd:metadata.cwd,parent_session_path:metadata.parentSessionPath??null,task_id:input.task.task_id,skill_id:"v2b-bounded-reliability-skill-v1",tool_profile_id:"bounded_tools_v1",system_prompt_sha256:sha256("system"),prompt_sha256:sha256(input.prompt),provider_payload_sha256:sha256("payload"),context_message_count:1,tool_names:[],common_input_sha256:sha256("common")},usage,reservations:[],counters_before:{credential_reads:1,network_calls:0,external_provider_calls:0,real_model_calls:0},counters_after:{...options.realCounters},no_retry_fallback:true} as unknown as AttemptRuntimeEvidenceV2B;options.onAttemptEvidence(evidence);if(scenario==="primary_abort_after_evidence"&&ordinal===1)throw new Error("injected post-evidence Primary fault");return result;},close:async()=>undefined};
}}});

const bridgeModule=await import("../src/v37/real-execution-ports-v37g3b.ts");
const {createRealExecutionPortBridgeV37G3B}=bridgeModule;

test.beforeEach(()=>{for(const path of [".runs/v37/g3a-product",".runs/v37/g3b/state-stores",".runs/v37/g3b/host-bridge",".runs/v37/host-authority/v37-g3a-host-registry-v1"])rmSync(resolve(PROJECT_ROOT,path),{recursive:true,force:true});modelFactoryCalls=0;scenario="complete";capturedCandidateTemplates=[];runtimeCreateGate=null;signalRuntimeCreate=null;});

test("exact bridge authority creates all four real ports lazily and closure disables new work",async()=>{
	let reads=0;const bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>{reads++;return "test-opaque";}});
	assert.deepEqual(Object.keys(bridge.caseExecutionPorts).sort(),["candidateProposal","followUpRuntime","primary","regressionValidation"]);assert.deepEqual(bridge.inspect().runtime_compositions,[{composition_id:"v2b_primary_recovery",owner:"public_createRealExecutionPortV2B",provider:"deepseek",model_id:"deepseek-v4-flash",lifecycle:"primary_recovery_group_scoped"},{composition_id:"post_v35_later_stages",owner:"bridge_createPostV35DeepSeekModelFactory",provider:"deepseek",model_id:"deepseek-v4-flash",lifecycle:"candidate_regression_follow_up_bridge_scoped"}]);assert.equal(bridge.inspect().in_flight,null);assert.equal(bridge.realAccessAuthorization.follow_up_access_expectation.network_calls,24);assert.equal(bridge.service.listCases().find((item)=>item.case_id===CASE_ID)?.available_for_new_workflow,true);assert.equal(reads,0);assert.equal(modelFactoryCalls,0);
	await bridge.close();assert.equal(bridge.service.listCases().find((item)=>item.case_id===CASE_ID)?.available_for_new_workflow,false);await assert.rejects(bridge.service.createWorkflow(CASE_ID),/closed/);
});

test("wrong authority and missing resolver fail before artifacts, Credential or model construction",()=>{
	let reads=0;for(const key of ["configuration_candidate_commit","configuration_candidate_tree","manifest_body_digest","workflow_registration_digest","follow_up_execution_profile_digest","registry_index_digest","candidate_proposal_authority_digest","regression_authority_digest"] as const){const bad={...authority(),[key]:"0".repeat(40)};assert.throws(()=>createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,bad as any,{resolve:async()=>{reads++;return "x";}}),/authority identity/);}assert.throws(()=>createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,{} as any,{resolve:async()=>"x"}),/exact-key/);assert.throws(()=>createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),undefined as any),/resolver/);assert.equal(reads,0);assert.equal(modelFactoryCalls,0);
});

test("complete seven-unit route shares one Credential, preserves order and reconciles bounded usage",async()=>{
	let reads=0;const bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>{reads++;return "test-opaque";}});let model=await bridge.service.createWorkflow(CASE_ID);for(const action of ACTIONS)model=await bridge.service.act(model.workflow_id,action);assert.equal(model.stage,"complete");assert.deepEqual(capturedCandidateTemplates,[{template_id:"v37-verify-before-finish",content:"Before reporting completion, run the task-declared check and rely on its result rather than self-assessment."}]);assert.equal(sha256(capturedCandidateTemplates[0]!.content),"1341b7b213c788c3d17ced324ba46da316c091af8d43182d02f589add792cc8f");const inspection=bridge.inspect();assert.deepEqual(inspection.completed_units.map((item)=>item.unit),["primary","recovery_a","recovery_b","candidate_proposal","regression_base","regression_candidate","follow_up"]);assert.equal(reads,1);assert.equal(modelFactoryCalls,1);assert.equal(inspection.credential_resolution_count,1);assert.ok(inspection.totals.provider_requests<=105);assert.ok(inspection.totals.combined_tokens<=802816);assert.ok(inspection.totals.cost_usd<=1.4);assert.deepEqual(inspection.real_access,{credential_reads:1,network_calls:13,external_provider_calls:13,real_model_calls:13});await bridge.close();await assert.rejects(bridge.service.act(model.workflow_id,"assess_state"),/closed/);
});

test("malformed Candidate JSON fails closed without receipt or reproposal",async()=>{
	scenario="malformed";const bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});let model=await bridge.service.createWorkflow(CASE_ID);for(const action of ACTIONS.slice(0,4))model=await bridge.service.act(model.workflow_id,action);const receipts=model.receipt_count;await assert.rejects(bridge.service.act(model.workflow_id,"produce_candidate"),/exact JSON/);assert.equal(bridge.service.getWorkflow(model.workflow_id).receipt_count,receipts);assert.equal(bridge.inspect().state,"faulted");await assert.rejects(bridge.service.act(model.workflow_id,"produce_candidate"),/faulted/);
});

test("valid JSON with invalid Candidate schema cannot complete the unit or create a receipt",async()=>{
	scenario="invalid_schema";const bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});let model=await bridge.service.createWorkflow(CASE_ID);for(const action of ACTIONS.slice(0,4))model=await bridge.service.act(model.workflow_id,action);const receipts=model.receipt_count;await assert.rejects(bridge.service.act(model.workflow_id,"produce_candidate"),/proposal|exact-key|invalid|required/i);model=bridge.service.getWorkflow(model.workflow_id);assert.equal(model.receipt_count,receipts);assert.equal(bridge.inspect().state,"faulted");assert.deepEqual(bridge.inspect().completed_units.map((item)=>item.unit),["primary","recovery_a","recovery_b"]);assert.equal(bridge.inspect().completed_units.some((item)=>item.unit==="candidate_proposal"),false);
});

test("concurrent Primary reserves one group before Credential resolution and dispatches exactly once",async()=>{
	let reads=0,signalEntered!:()=>void,releaseCredential!:()=>void;const entered=new Promise<void>((resolveEntered)=>{signalEntered=resolveEntered;}),gate=new Promise<void>((resolveGate)=>{releaseCredential=resolveGate;});const bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>{reads++;signalEntered();await gate;return "test-opaque";}}),created=await bridge.service.createWorkflow(CASE_ID),loadedCase=loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:PROJECT_ROOT,caseId:CASE_ID}),baseRoot=resolve(PROJECT_ROOT,".runs/v37/g3b/host-bridge",bridge.inspect().bridge_id);const request={projectRoot:PROJECT_ROOT,workflowId:created.workflow_id,runId:"v37-g3b-concurrent-primary-first",runRoot:resolve(baseRoot,"primary-first"),loadedCase};const first=bridge.caseExecutionPorts.primary.execute(request);await entered;assert.deepEqual(bridge.inspect().in_flight,{unit:"primary",group:"primary_recovery"});const duplicate=bridge.caseExecutionPorts.primary.execute({...request,runId:"v37-g3b-concurrent-primary-second",runRoot:resolve(baseRoot,"primary-second")});await assert.rejects(duplicate,/already in flight/);assert.equal(reads,1);assert.equal(bridge.inspect().credential_resolution_count,0);assert.deepEqual(bridge.inspect().real_access,{credential_reads:0,network_calls:0,external_provider_calls:0,real_model_calls:0});assert.equal(bridge.service.getWorkflow(created.workflow_id).receipt_count,0);releaseCredential();await first;assert.deepEqual(bridge.inspect().completed_units.map((item)=>item.unit),["primary","recovery_a","recovery_b"]);assert.equal(bridge.inspect().credential_resolution_count,1);assert.equal(bridge.inspect().in_flight,null);assert.equal(bridge.service.getWorkflow(created.workflow_id).receipt_count,0);
});

test("concurrent later-stage duplicate is rejected behind one Runtime-construction barrier",async()=>{
	let reads=0;const bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>{reads++;return "test-opaque";}});let model=await bridge.service.createWorkflow(CASE_ID);for(const action of ACTIONS.slice(0,4))model=await bridge.service.act(model.workflow_id,action);const receipts=model.receipt_count;let signalEntered!:()=>void,releaseRuntime!:()=>void;const entered=new Promise<void>((resolveEntered)=>{signalEntered=resolveEntered;});runtimeCreateGate=new Promise<void>((resolveGate)=>{releaseRuntime=resolveGate;});signalRuntimeCreate=signalEntered;const first=bridge.service.act(model.workflow_id,"produce_candidate");await entered;assert.deepEqual(bridge.inspect().in_flight,{unit:"candidate_proposal",group:null});await assert.rejects(bridge.service.act(model.workflow_id,"produce_candidate"),/already in flight/);assert.equal(modelFactoryCalls,1);assert.equal(reads,1);assert.deepEqual(capturedCandidateTemplates,[]);assert.deepEqual(bridge.inspect().real_access,{credential_reads:1,network_calls:7,external_provider_calls:7,real_model_calls:7});releaseRuntime();model=await first;assert.equal(model.receipt_count,receipts+1);assert.equal(bridge.inspect().completed_units.filter((item)=>item.unit==="candidate_proposal").length,1);assert.equal(bridge.inspect().in_flight,null);assert.equal(modelFactoryCalls,1);
});

test("Candidate output budget overflow and premature direct port use fail closed",async()=>{
	scenario="over_budget";let bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});await assert.rejects(bridge.caseExecutionPorts.candidateProposal!.propose({} as any),/order invalid/);assert.equal(bridge.inspect().credential_resolution_count,0);
	bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});await assert.rejects(bridge.caseExecutionPorts.followUpRuntime!.execute({} as any),/order invalid/);assert.equal(bridge.inspect().credential_resolution_count,0);
	bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});await assert.rejects(bridge.caseExecutionPorts.regressionValidation!.execute({state:{status:"staged_inactive"},workspaceRoot:"."} as any),/order invalid|lacks matching/);assert.equal(bridge.inspect().credential_resolution_count,0);
	bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});let model=await bridge.service.createWorkflow(CASE_ID);for(const action of ACTIONS.slice(0,4))model=await bridge.service.act(model.workflow_id,action);await assert.rejects(bridge.service.act(model.workflow_id,"produce_candidate"),/exact JSON|budget/);assert.equal(bridge.inspect().state,"faulted");
});

test("unknown Primary usage fails before receipt and prevents all later units",async()=>{
	scenario="unknown_usage";const bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});const model=await bridge.service.createWorkflow(CASE_ID);await assert.rejects(bridge.service.act(model.workflow_id,"run_primary"),/unknown|invalid usage/);assert.equal(bridge.service.getWorkflow(model.workflow_id).receipt_count,0);assert.equal(bridge.inspect().state,"faulted");assert.deepEqual(bridge.inspect().completed_units,[]);
});

test("Primary fault retains attempted usage and the exact failing unit",async()=>{
	scenario="primary_abort_after_evidence";const bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});const model=await bridge.service.createWorkflow(CASE_ID);await assert.rejects(bridge.service.act(model.workflow_id,"run_primary"),/post-evidence Primary fault/);const inspection=bridge.inspect();assert.equal(inspection.state,"faulted");assert.deepEqual(inspection.completed_units.map((item)=>({unit:item.unit,status:item.status})),[{unit:"primary",status:"failed"}]);assert.ok(inspection.totals.provider_requests>0);assert.equal(inspection.totals.provider_requests,inspection.real_access.external_provider_calls);const failure=JSON.parse(readFileSync(resolve(PROJECT_ROOT,".runs/v37/g3b/host-bridge",inspection.bridge_id,"failure.json"),"utf8")) as {unit:string};assert.equal(failure.unit,"primary");
});

test("production module pins public real APIs and exports no deterministic alternative",()=>{
	assert.deepEqual(Object.keys(bridgeModule),["createRealExecutionPortBridgeV37G3B"]);const source=readFileSync(resolve(PROJECT_ROOT,"workbench/src/v37/real-execution-ports-v37g3b.ts"),"utf8");for(const symbol of ["createRealExecutionPortV2B","createPostV35DeepSeekModelFactory","PersistentInteractiveSessionServiceV36","DockerRegisteredCommandExecutorV36"])assert.match(source,new RegExp(symbol));assert.doesNotMatch(source,/createDeterministicExecutionPort|testOnly|process\.env/);
});
