import assert from "node:assert/strict";
import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import test, { mock } from "node:test";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall } from "@earendil-works/pi-ai";
import type { AttemptRuntimeEvidenceV2B } from "../src/contracts/v2b-types.ts";
import { sha256 } from "../src/hash.ts";
import { createDeterministicExecutionPortV2A } from "../src/run-v2.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const CASE_ID="v37-real-recovery-promote-retain";
const ACTIONS=["run_primary","run_recovery","confirm_recovery_evidence","request_recovery_admission","produce_candidate","run_regression","run_follow_up","confirm_follow_up_evidence","request_follow_up_admission","assess_state"] as const;
const authority=()=>({schema_version:1 as const,kind:"v37_g3b_host_execution_port_bridge_authority" as const,case_id:CASE_ID as typeof CASE_ID,project_id:"v37-real-recovery-project" as const,configuration_candidate_commit:"cd380652dc332b875c41055c95d53fb687368732" as const,configuration_candidate_tree:"72318985ad0f016c5a1f227cbabc052eb0906256" as const,manifest_body_digest:"a1464d12cb1dd509b4b300282fcdb5ebdf59fdf52f55d9bcd49e49aa5bbb262d" as const,workflow_registration_digest:"1e6a74edc68954e044815322ec65c2e163e2258c00b63527d29b0ea12a6dd52a" as const,follow_up_execution_profile_digest:"e3789fe9eeedac96164836b306c239a5ac65bff618d21a631b7d391edd10cbc9" as const,registry_index_digest:"cd4da08a8d3d6daac317ac6bbe04b8a70a424fc079589a66598eced4bb51b762" as const,candidate_proposal_authority_digest:"e3945b699b9140d374514e20faf3c14b35e778c707a4f6e47ed0b657e8f61150" as const,regression_authority_digest:"3a7e7e603d6e071922b83ba1789aa2056134163a1b3edb04a8af902613bb49da" as const});

let modelFactoryCalls=0;
let scenario:"complete"|"malformed"|"invalid_schema"|"over_budget"|"unknown_usage"="complete";
const models=createModels();
const provider=fauxProvider({provider:"deepseek",models:[{id:"deepseek-v4-flash",name:"DeepSeek V4 Flash",reasoning:true,input:["text"],cost:{input:0.14,output:0.28,cacheRead:0.0028,cacheWrite:0},contextWindow:1000000,maxTokens:384000}]});
models.setProvider(provider.provider);

function proposalFromPrompt(prompt:string):string{
	if(scenario==="malformed")return "not json";
	if(scenario==="invalid_schema")return JSON.stringify({schema_version:1});
	if(scenario==="over_budget")return "x".repeat(70000);
	const input=JSON.parse(prompt.slice(prompt.indexOf("\n")+1)) as any;
	const applicability={task_kinds:[input.opportunity.task_context.task_kind],failure_families:[input.opportunity.task_context.failure_family]};
	return JSON.stringify({schema_version:1,proposal_id:`bridge-proposal-${input.opportunity.opportunity_id}`,evidence_digest:input.opportunity.evidence_identity.evidence_digest,expected_base_state_digest:input.expected_base_state_digest,diagnosis:{pattern_id:input.opportunity.trigger,statement:"The frozen Primary evidence shows a verifier failure before bounded recovery.",evidence_refs:input.opportunity.evidence_refs},lesson:{statement:"Run the task-declared check before reporting completion.",expected_outcome:"The related task is externally checked before completion.",applicability},edits:[{kind:"prompt_addendum",entry_id:"v37-verify-before-finish",content:"Before reporting completion, run the task-declared check and rely on its result rather than self-assessment.",applicability}]});
}
function messageText(message:any):string{return typeof message.content==="string"?message.content:Array.isArray(message.content)?message.content.filter((part:any)=>part?.type==="text").map((part:any)=>part.text).join(""):"";}

mock.module("../src/session/real-smoke-turn-v35.ts",{namedExports:{createPostV35DeepSeekModelFactory:()=>({create:async(_credential:string)=>{modelFactoryCalls++;provider.setResponses([
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
		const evidence={schema_version:"v2b-attempt-runtime-evidence-v1",attempt_id:input.attemptId,role,terminal_reason:"settled",settled:true,agent_completion:"settled",quiescence:null,runtime_budget_stop_observation:null,composition:{provider:"deepseek",model_id:"deepseek-v4-flash",api:"openai-completions",endpoint:"https://api.deepseek.com/chat/completions",thinking_level:"off",retry:false,fallback:false,session_id:metadata.id,session_path:metadata.path,session_cwd:metadata.cwd,parent_session_path:metadata.parentSessionPath??null,task_id:input.task.task_id,skill_id:"v2b-bounded-reliability-skill-v1",tool_profile_id:"bounded_tools_v1",system_prompt_sha256:sha256("system"),prompt_sha256:sha256(input.prompt),provider_payload_sha256:sha256("payload"),context_message_count:1,tool_names:[],common_input_sha256:sha256("common")},usage,reservations:[],counters_before:{credential_reads:1,network_calls:0,external_provider_calls:0,real_model_calls:0},counters_after:{...options.realCounters},no_retry_fallback:true} as unknown as AttemptRuntimeEvidenceV2B;options.onAttemptEvidence(evidence);return result;},close:async()=>undefined};
}}});

const bridgeModule=await import("../src/v37/real-execution-ports-v37g3b.ts");
const {createRealExecutionPortBridgeV37G3B}=bridgeModule;

test.beforeEach(()=>{for(const path of [".runs/v37/g3a-product",".runs/v37/g3b/state-stores",".runs/v37/g3b/host-bridge",".runs/v37/host-authority/v37-g3a-host-registry-v1"])rmSync(resolve(PROJECT_ROOT,path),{recursive:true,force:true});modelFactoryCalls=0;scenario="complete";});

test("exact bridge authority creates all four real ports lazily and closure disables new work",async()=>{
	let reads=0;const bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>{reads++;return "test-opaque";}});
	assert.deepEqual(Object.keys(bridge.caseExecutionPorts).sort(),["candidateProposal","followUpRuntime","primary","regressionValidation"]);assert.equal(bridge.realAccessAuthorization.follow_up_access_expectation.network_calls,24);assert.equal(bridge.service.listCases().find((item)=>item.case_id===CASE_ID)?.available_for_new_workflow,true);assert.equal(reads,0);assert.equal(modelFactoryCalls,0);
	await bridge.close();assert.equal(bridge.service.listCases().find((item)=>item.case_id===CASE_ID)?.available_for_new_workflow,false);await assert.rejects(bridge.service.createWorkflow(CASE_ID),/closed/);
});

test("wrong authority and missing resolver fail before artifacts, Credential or model construction",()=>{
	let reads=0;for(const key of ["configuration_candidate_commit","configuration_candidate_tree","manifest_body_digest","workflow_registration_digest","follow_up_execution_profile_digest","registry_index_digest","candidate_proposal_authority_digest","regression_authority_digest"] as const){const bad={...authority(),[key]:"0".repeat(40)};assert.throws(()=>createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,bad as any,{resolve:async()=>{reads++;return "x";}}),/authority identity/);}assert.throws(()=>createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,{} as any,{resolve:async()=>"x"}),/exact-key/);assert.throws(()=>createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),undefined as any),/resolver/);assert.equal(reads,0);assert.equal(modelFactoryCalls,0);
});

test("complete seven-unit route shares one Credential, preserves order and reconciles bounded usage",async()=>{
	let reads=0;const bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>{reads++;return "test-opaque";}});let model=await bridge.service.createWorkflow(CASE_ID);for(const action of ACTIONS)model=await bridge.service.act(model.workflow_id,action);assert.equal(model.stage,"complete");const inspection=bridge.inspect();assert.deepEqual(inspection.completed_units.map((item)=>item.unit),["primary","recovery_a","recovery_b","candidate_proposal","regression_base","regression_candidate","follow_up"]);assert.equal(reads,1);assert.equal(modelFactoryCalls,1);assert.equal(inspection.credential_resolution_count,1);assert.ok(inspection.totals.provider_requests<=105);assert.ok(inspection.totals.combined_tokens<=802816);assert.ok(inspection.totals.cost_usd<=1.4);assert.deepEqual(inspection.real_access,{credential_reads:1,network_calls:13,external_provider_calls:13,real_model_calls:13});await bridge.close();await assert.rejects(bridge.service.act(model.workflow_id,"assess_state"),/closed/);
});

test("malformed Candidate JSON fails closed without receipt or reproposal",async()=>{
	scenario="malformed";const bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});let model=await bridge.service.createWorkflow(CASE_ID);for(const action of ACTIONS.slice(0,4))model=await bridge.service.act(model.workflow_id,action);const receipts=model.receipt_count;await assert.rejects(bridge.service.act(model.workflow_id,"produce_candidate"),/exact JSON/);assert.equal(bridge.service.getWorkflow(model.workflow_id).receipt_count,receipts);assert.equal(bridge.inspect().state,"faulted");await assert.rejects(bridge.service.act(model.workflow_id,"produce_candidate"),/faulted/);
});

test("valid JSON with invalid Candidate schema cannot complete the unit or create a receipt",async()=>{
	scenario="invalid_schema";const bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});let model=await bridge.service.createWorkflow(CASE_ID);for(const action of ACTIONS.slice(0,4))model=await bridge.service.act(model.workflow_id,action);const receipts=model.receipt_count;await assert.rejects(bridge.service.act(model.workflow_id,"produce_candidate"),/proposal|exact-key|invalid|required/i);model=bridge.service.getWorkflow(model.workflow_id);assert.equal(model.receipt_count,receipts);assert.equal(bridge.inspect().state,"faulted");assert.deepEqual(bridge.inspect().completed_units.map((item)=>item.unit),["primary","recovery_a","recovery_b"]);assert.equal(bridge.inspect().completed_units.some((item)=>item.unit==="candidate_proposal"),false);
});

test("Candidate output budget overflow and premature direct port use fail closed",async()=>{
	scenario="over_budget";let bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});await assert.rejects(bridge.caseExecutionPorts.candidateProposal!.propose({} as any),/order invalid/);assert.equal(bridge.inspect().credential_resolution_count,0);
	bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});await assert.rejects(bridge.caseExecutionPorts.followUpRuntime!.execute({} as any),/order invalid/);assert.equal(bridge.inspect().credential_resolution_count,0);
	bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});await assert.rejects(bridge.caseExecutionPorts.regressionValidation!.execute({state:{status:"staged_inactive"},workspaceRoot:"."} as any),/order invalid/);assert.equal(bridge.inspect().credential_resolution_count,0);
	bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});let model=await bridge.service.createWorkflow(CASE_ID);for(const action of ACTIONS.slice(0,4))model=await bridge.service.act(model.workflow_id,action);await assert.rejects(bridge.service.act(model.workflow_id,"produce_candidate"),/exact JSON|budget/);assert.equal(bridge.inspect().state,"faulted");
});

test("unknown Primary usage fails before receipt and prevents all later units",async()=>{
	scenario="unknown_usage";const bridge=createRealExecutionPortBridgeV37G3B(PROJECT_ROOT,authority(),{resolve:async()=>"test-opaque"});const model=await bridge.service.createWorkflow(CASE_ID);await assert.rejects(bridge.service.act(model.workflow_id,"run_primary"),/unknown|invalid usage/);assert.equal(bridge.service.getWorkflow(model.workflow_id).receipt_count,0);assert.equal(bridge.inspect().state,"faulted");assert.deepEqual(bridge.inspect().completed_units,[]);
});

test("production module pins public real APIs and exports no deterministic alternative",()=>{
	assert.deepEqual(Object.keys(bridgeModule),["createRealExecutionPortBridgeV37G3B"]);const source=readFileSync(resolve(PROJECT_ROOT,"workbench/src/v37/real-execution-ports-v37g3b.ts"),"utf8");for(const symbol of ["createRealExecutionPortV2B","createPostV35DeepSeekModelFactory","PersistentInteractiveSessionServiceV36","DockerRegisteredCommandExecutorV36"])assert.match(source,new RegExp(symbol));assert.doesNotMatch(source,/createDeterministicExecutionPort|testOnly|process\.env/);
});
