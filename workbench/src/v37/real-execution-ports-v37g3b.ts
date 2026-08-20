import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { AgentHarness, InMemorySessionStorage, Session } from "@earendil-works/pi-agent-core";
import type { AssistantMessage } from "@earendil-works/pi-ai";
import { V2B_ATTEMPT_CAPS, type AttemptRuntimeEvidenceV2B, type RealCallCountersV2B } from "../contracts/v2b-types.ts";
import type { FauxExecutionEventV3, HarnessStateVersionV3 } from "../contracts/v3g2-types.ts";
import type { StagedHarnessStateV3 } from "../contracts/v3-types.ts";
import { writeOnceJson } from "../evidence/artifacts.ts";
import { DockerRegisteredCommandExecutorV36 } from "../execution/docker-v36.ts";
import { digestObject, sha256, stableJson } from "../hash.ts";
import { createRealExecutionPortV2B } from "../pi/pi-run-handle-v2b.ts";
import { createBoundedToolProfile } from "../pi/tool-profile.ts";
import { composePromptAddendaV3 } from "../prompts/adapter-v3.ts";
import { createOneRunProviderAuthorityV1B, type OpaqueCredentialResolverV1 } from "../provider/fixed-provider-v1.ts";
import type { FauxValidationPortV3 } from "../refinement/comparator-v3.ts";
import { validateProposalAndBuildCandidateV3, type BoundedProposalPortV3 } from "../refinement/producer-v3.ts";
import { executeRunV2A } from "../run-v2.ts";
import { createPostV35DeepSeekModelFactory, type PostV35RealModelRuntime } from "../session/real-smoke-turn-v35.ts";
import { PersistentInteractiveSessionServiceV36 } from "../session/persistent-session-v36.ts";
import {
	constructionAuthorityDigestsV37G3A,
	followUpAccessExpectationV37G3A,
	loadRegisteredCaseFromHostRegistryV37G3A,
	primaryExecutionDeclarationV37G3A,
} from "./host-registry-v37g3a.ts";
import {
	ProductServiceV37G3A,
	type ProductCaseExecutionPortsV37G3A,
	type ProductPrimaryExecutionPortV37G3A,
	type ProductRealAccessAuthorizationV37G3A,
} from "./product-service-v37g3a.ts";
import type { RegisteredFollowUpRuntimePortV37G3A } from "./registered-follow-up-v37g3a.ts";

const CASE_ID = "v37-real-recovery-promote-retain";
const PROJECT_ID = "v37-real-recovery-project";
const CONFIGURATION_CANDIDATE_COMMIT = "57f419c35bdbd972bda890f45d874df35777dd72";
const CONFIGURATION_CANDIDATE_TREE = "43dc96fa99fa31cd552863cc0b569637a682ba10";
const MANIFEST_DIGEST = "36a4cf214c0c9e3ab05764184cb7e702304ddb80e7570fa3c5af3282de8a384f";
const REGISTRATION_DIGEST = "05c21169123adad97723251caf0835a622a7f7de25d06ca99df6dbbb5d532b0d";
const FOLLOW_UP_PROFILE_DIGEST = "f139a899b4304f6f403f3077ad76857a05780f824186f308489a54f15c61c8e4";
const REGISTRY_DIGEST = "0fc93a326f4275465d285dd94fad0ac686b0c86778b8865bace5ae5ba48e9d3d";
const CANDIDATE_AUTHORITY_DIGEST = "5356ffff6acf35fa41df96addce0e987034462d848d3cc3aeee6ac652a684054";
const REGRESSION_AUTHORITY_DIGEST = "beb420eb73b66536501f3b242f5dc04daf5ee18c5ede5c82067a2cdbb0c9db7d";
const CANDIDATE_TEMPLATE_ID = "v37-verify-before-finish";
const CANDIDATE_TEMPLATE_CONTENT = "Before reporting completion, run the task-declared check and rely on its result rather than self-assessment.";
const CANDIDATE_TEMPLATE_CONTENT_SHA256 = "1341b7b213c788c3d17ced324ba46da316c091af8d43182d02f589add792cc8f";
const PRIMARY_MAXIMA = Object.freeze({ credential_reads: 1, network_calls: 48, external_provider_calls: 48, real_model_calls: 48 });
const FOLLOW_UP_MAXIMA = Object.freeze({ credential_reads: 1, network_calls: 24, external_provider_calls: 24, real_model_calls: 24 });
const UNIT_ORDER = ["primary", "recovery_a", "recovery_b", "candidate_proposal", "regression_base", "regression_candidate", "follow_up"] as const;
type Unit = typeof UNIT_ORDER[number];

const UNIT_CAPS: Readonly<Record<Unit, { requests:number; tokens:number; tools:number; commands:number; wallMs:number; cost:number }>> = Object.freeze({
	primary:{requests:V2B_ATTEMPT_CAPS.provider_requests,tokens:131072,tools:24,commands:1,wallMs:900000,cost:0.2},
	recovery_a:{requests:V2B_ATTEMPT_CAPS.provider_requests,tokens:131072,tools:24,commands:1,wallMs:900000,cost:0.2},
	recovery_b:{requests:V2B_ATTEMPT_CAPS.provider_requests,tokens:131072,tools:24,commands:1,wallMs:900000,cost:0.2},
	candidate_proposal:{requests:1,tokens:16384,tools:0,commands:0,wallMs:120000,cost:0.2},
	regression_base:{requests:16,tokens:131072,tools:24,commands:1,wallMs:900000,cost:0.2},
	regression_candidate:{requests:16,tokens:131072,tools:24,commands:1,wallMs:900000,cost:0.2},
	follow_up:{requests:24,tokens:131072,tools:24,commands:1,wallMs:900000,cost:0.2},
});
const GLOBAL_CAP = Object.freeze({requests:105,tokens:802816,tools:144,commands:6,wallMs:5520000,cost:1.4});
const RUNTIME_COMPOSITIONS = Object.freeze([
	Object.freeze({composition_id:"v2b_primary_recovery",owner:"public_createRealExecutionPortV2B",provider:"deepseek",model_id:"deepseek-v4-flash",lifecycle:"primary_recovery_group_scoped"}),
	Object.freeze({composition_id:"post_v35_later_stages",owner:"bridge_createPostV35DeepSeekModelFactory",provider:"deepseek",model_id:"deepseek-v4-flash",lifecycle:"candidate_regression_follow_up_bridge_scoped"}),
] as const);

export interface RealExecutionPortBridgeAuthorityV37G3B {
	schema_version: 1;
	kind: "v37_g3b_host_execution_port_bridge_authority";
	case_id: typeof CASE_ID;
	project_id: typeof PROJECT_ID;
	configuration_candidate_commit: typeof CONFIGURATION_CANDIDATE_COMMIT;
	configuration_candidate_tree: typeof CONFIGURATION_CANDIDATE_TREE;
	manifest_body_digest: typeof MANIFEST_DIGEST;
	workflow_registration_digest: typeof REGISTRATION_DIGEST;
	follow_up_execution_profile_digest: typeof FOLLOW_UP_PROFILE_DIGEST;
	registry_index_digest: typeof REGISTRY_DIGEST;
	candidate_proposal_authority_digest: typeof CANDIDATE_AUTHORITY_DIGEST;
	regression_authority_digest: typeof REGRESSION_AUTHORITY_DIGEST;
}

interface Usage { provider_requests:number; combined_tokens:number; tool_calls:number; commands:number; wall_time_ms:number; cost_usd:number; }
interface UnitInspection { unit:Unit; status:"complete"|"failed"; usage:Usage; evidence_digest:string; }
export interface RealExecutionPortBridgeInspectionV37G3B {
	bridge_id: string;
	case_id: typeof CASE_ID;
	state: "open"|"faulted"|"closed";
	completed_units: UnitInspection[];
	totals: Usage;
	real_access: RealCallCountersV2B;
	credential_resolution_count: number;
	runtime_compositions: typeof RUNTIME_COMPOSITIONS;
	in_flight: { unit:Unit; group:"primary_recovery"|"regression"|null }|null;
	inspection_digest: string;
}
export interface RealExecutionPortBridgeV37G3B {
	caseExecutionPorts: ProductCaseExecutionPortsV37G3A;
	realAccessAuthorization: ProductRealAccessAuthorizationV37G3A;
	service: ProductServiceV37G3A;
	inspect(): RealExecutionPortBridgeInspectionV37G3B;
	close(): Promise<void>;
}

const ZERO_USAGE=():Usage=>({provider_requests:0,combined_tokens:0,tool_calls:0,commands:0,wall_time_ms:0,cost_usd:0});
const ZERO_REAL=():RealCallCountersV2B=>({credential_reads:0,network_calls:0,external_provider_calls:0,real_model_calls:0});
function exact(value:unknown,keys:readonly string[],label:string):Record<string,unknown>{if(!value||typeof value!=="object"||Array.isArray(value)||stableJson(Object.keys(value as object).sort())!==stableJson([...keys].sort()))throw new Error(`${label} exact-key validation failed`);return value as Record<string,unknown>;}
function validUsage(usage:Usage):boolean{return [usage.provider_requests,usage.combined_tokens,usage.tool_calls,usage.commands,usage.wall_time_ms].every((n)=>Number.isSafeInteger(n)&&n>=0)&&Number.isFinite(usage.cost_usd)&&usage.cost_usd>=0;}
function sumUsage(values:readonly Usage[]):Usage{return values.reduce((a,v)=>({provider_requests:a.provider_requests+v.provider_requests,combined_tokens:a.combined_tokens+v.combined_tokens,tool_calls:a.tool_calls+v.tool_calls,commands:a.commands+v.commands,wall_time_ms:a.wall_time_ms+v.wall_time_ms,cost_usd:a.cost_usd+v.cost_usd}),ZERO_USAGE());}
function usageFromMessages(messages:readonly unknown[], toolCalls:number, wallMs:number):Usage {
	let requests=0,tokens=0,cost=0;
	for(const value of messages){const message=value as Partial<AssistantMessage>;if(message.role!=="assistant")continue;requests++;const u=message.usage;if(!u)throw new Error("unknown model usage");const fields=[u.input,u.output,u.cacheRead,u.cacheWrite,u.cost?.total];if(!fields.every((n)=>typeof n==="number"&&Number.isFinite(n)&&n>=0))throw new Error("unknown model usage");tokens+=u.input+u.output+u.cacheRead+u.cacheWrite;cost+=u.cost.total;}
	return {provider_requests:requests,combined_tokens:tokens,tool_calls:toolCalls,commands:0,wall_time_ms:wallMs,cost_usd:cost};
}
function commandCalls(sessionPath:string):number{const bytes=readFileSync(sessionPath,"utf8");let count=0;for(const line of bytes.split(/\r?\n/).filter(Boolean)){const entry=JSON.parse(line) as {type?:string;message?:{role?:string;content?:Array<{type?:string;name?:string}>}};if(entry.type==="message"&&entry.message?.role==="assistant")count+=(entry.message.content??[]).filter((part)=>part.type==="toolCall"&&part.name==="run_command").length;}return count;}

class SharedCredentialLease {
	private value:string|undefined; private pending:Promise<string>|null=null; private reads=0; private closed=false;
	private readonly resolver:OpaqueCredentialResolverV1;
	constructor(resolver:OpaqueCredentialResolverV1){this.resolver=resolver;}
	async resolve():Promise<string>{if(this.closed)throw new Error("bridge credential lease is closed");if(this.value!==undefined)return this.value;if(this.pending)return this.pending;const pending=Promise.resolve().then(()=>this.resolver.resolve()).then((value)=>{if(typeof value!=="string"||value.length===0)throw new Error("opaque Credential resolution failed");this.value=value;this.reads++;return value;});this.pending=pending;try{return await pending;}finally{if(this.pending===pending)this.pending=null;}}
	count():number{return this.reads;} clear():void{this.value=undefined;this.pending=null;this.closed=true;}
}

interface UnitReservation { unit:Unit; group:"primary_recovery"|"regression"|null; }

class Coordinator {
	readonly bridgeId=`v37-g3b-bridge-${randomUUID()}`;
	readonly root:string;
	readonly real=ZERO_REAL();
	private units:UnitInspection[]=[]; private state:"open"|"faulted"|"closed"="open";
	private runtime:PostV35RealModelRuntime|null=null;
	private runtimePromise:Promise<PostV35RealModelRuntime>|null=null;
	private reservation:UnitReservation|null=null;
	private readonly lease:SharedCredentialLease;
	constructor(projectRoot:string,lease:SharedCredentialLease){this.lease=lease;this.root=resolve(projectRoot,".runs/v37/g3b/host-bridge",this.bridgeId);}
	initialize(authority:RealExecutionPortBridgeAuthorityV37G3B):void{mkdirSync(this.root,{recursive:true});writeOnceJson(this.root,"construction.json",{schema_version:1,kind:"v37_g3b_bridge_construction",bridge_id:this.bridgeId,case_id:CASE_ID,authority_digest:digestObject(authority),runtime_compositions:RUNTIME_COMPOSITIONS});}
	assertOpen():void{if(this.state!=="open")throw new Error(`bridge is ${this.state}`);}
	async modelRuntime():Promise<PostV35RealModelRuntime>{this.assertOpen();if(this.runtime)return this.runtime;if(!this.runtimePromise)this.runtimePromise=this.lease.resolve().then((credential)=>createPostV35DeepSeekModelFactory().create(credential)).then((runtime)=>{this.runtime=runtime;return runtime;});return this.runtimePromise;}
	recordExternalRequests(count:number):void{if(!Number.isSafeInteger(count)||count<0)return this.fail(UNIT_ORDER[Math.min(this.units.length,UNIT_ORDER.length-1)]!,new Error("external request count invalid"));this.real.network_calls+=count;this.real.external_provider_calls+=count;this.real.real_model_calls+=count;if(this.real.network_calls>GLOBAL_CAP.requests||this.real.external_provider_calls>GLOBAL_CAP.requests||this.real.real_model_calls>GLOBAL_CAP.requests)this.fail(UNIT_ORDER[Math.min(this.units.length,UNIT_ORDER.length-1)]!,new Error("global external request cap exceeded"));}
	reserve(unit:Unit,group:"primary_recovery"|"regression"|null=null):void{this.assertOpen();if(this.reservation)throw new Error(`bridge unit already in flight: ${this.reservation.unit}`);const expected=UNIT_ORDER[this.units.length];if(expected!==unit)this.fail(unit,new Error(`bridge unit order invalid: expected ${expected??"none"}`));this.reservation={unit,group};try{writeOnceJson(this.root,`reservations/${String(this.units.length+1).padStart(2,"0")}-${unit}.json`,{schema_version:1,kind:"v37_g3b_unit_reservation",bridge_id:this.bridgeId,unit,group,runtime_composition_id:group==="primary_recovery"?RUNTIME_COMPOSITIONS[0].composition_id:RUNTIME_COMPOSITIONS[1].composition_id});}catch(error){this.fail(unit,error instanceof Error?error:new Error(String(error)));}}
	assertReserved(unit:Unit):void{this.assertOpen();const expected=UNIT_ORDER[this.units.length];const permits=this.reservation?.unit===unit||this.reservation?.group==="primary_recovery"&&["primary","recovery_a","recovery_b"].includes(unit)||this.reservation?.group==="regression"&&["regression_base","regression_candidate"].includes(unit);if(expected!==unit||!permits)this.fail(unit,new Error("bridge unit lacks matching in-flight reservation"));}
	validateUsage(unit:Unit,usage:Usage):void{if(!validUsage(usage))return this.fail(unit,new Error("unknown or invalid usage"));const cap=UNIT_CAPS[unit],totals=sumUsage([...this.units.map((v)=>v.usage),usage]);if(usage.provider_requests>cap.requests||usage.combined_tokens>cap.tokens||usage.tool_calls>cap.tools||usage.commands>cap.commands||usage.wall_time_ms>cap.wallMs||usage.cost_usd>cap.cost+Number.EPSILON||totals.provider_requests>GLOBAL_CAP.requests||totals.combined_tokens>GLOBAL_CAP.tokens||totals.tool_calls>GLOBAL_CAP.tools||totals.commands>GLOBAL_CAP.commands||totals.wall_time_ms>GLOBAL_CAP.wallMs||totals.cost_usd>GLOBAL_CAP.cost+Number.EPSILON)return this.fail(unit,new Error("bridge budget exceeded"));}
	complete(unit:Unit,usage:Usage,evidence:unknown):void{this.assertReserved(unit);this.validateUsage(unit,usage);const item:UnitInspection={unit,status:"complete",usage:{...usage},evidence_digest:digestObject(evidence)};this.units.push(item);try{writeOnceJson(this.root,`units/${String(this.units.length).padStart(2,"0")}-${unit}.json`,item);}catch(error){this.fail(unit,error instanceof Error?error:new Error(String(error)));}if(this.reservation?.group===null||this.reservation?.group==="primary_recovery"&&unit==="recovery_b"||this.reservation?.group==="regression"&&unit==="regression_candidate")this.reservation=null;}
	recordFailedUsage(unit:Unit,usage:Usage,evidence:unknown):void{if(!validUsage(usage))return;this.assertReserved(unit);const item:UnitInspection={unit,status:"failed",usage:{...usage},evidence_digest:digestObject(evidence)};this.units.push(item);try{writeOnceJson(this.root,`units/${String(this.units.length).padStart(2,"0")}-${unit}.json`,item);}catch{}}
	fail(unit:Unit,error:Error):never{this.reservation=null;this.state="faulted";const body={schema_version:1,kind:"v37_g3b_bridge_failure",bridge_id:this.bridgeId,unit,error_sha256:sha256(error.message)};try{writeOnceJson(this.root,"failure.json",body);}catch{}throw error;}
	inspection():RealExecutionPortBridgeInspectionV37G3B{const body={bridge_id:this.bridgeId,case_id:CASE_ID as typeof CASE_ID,state:this.state,completed_units:structuredClone(this.units),totals:sumUsage(this.units.map((v)=>v.usage)),real_access:{...this.real},credential_resolution_count:this.lease.count(),runtime_compositions:RUNTIME_COMPOSITIONS,in_flight:this.reservation?{...this.reservation}:null};return {...body,inspection_digest:digestObject(body)};}
	async close():Promise<void>{if(this.state==="closed")return;await this.runtime?.close();this.lease.clear();this.state="closed";if(existsSync(this.root))writeOnceJson(this.root,"close.json",{schema_version:1,kind:"v37_g3b_bridge_close",bridge_id:this.bridgeId,completed_unit_count:this.units.length,inspection_digest:this.inspection().inspection_digest});}
}

async function runModelUnit(coordinator:Coordinator,unit:Unit,workspaceRoot:string,prompt:string,systemPrompt:string,state?:HarnessStateVersionV3|StagedHarnessStateV3):Promise<{text:string;usage:Usage;events:FauxExecutionEventV3[]}> {
	coordinator.assertReserved(unit);const runtime=await coordinator.modelRuntime();const storage=new InMemorySessionStorage();const session=new Session(storage);const entries=state?.entries??[];const composed=entries.length===0?systemPrompt:composePromptAddendaV3({basePrompt:systemPrompt,expectedBasePromptSha256:sha256(systemPrompt),entries:entries.filter((e)=>e.kind==="prompt_addendum").map((e)=>({entry_id:e.entry_id,content:e.content}))}).composed_prompt;
	const profile=createBoundedToolProfile(workspaceRoot,{writable_paths:["subject.txt"],protected_paths:[],command_descriptors:[]},{allowed_tool_names:["workspace_read","workspace_list","workspace_search","workspace_edit","workspace_write"],allow_repository_commands:false});
	const harness=new AgentHarness({models:runtime.models,session,model:runtime.model,tools:profile.tools,toolContext:profile.context,systemPrompt:composed,thinkingLevel:"off",streamOptions:{maxRetries:0,timeoutMs:UNIT_CAPS[unit].wallMs}});let settled=0,requests=0,toolCalls=0;const started=Date.now();const offRequest=harness.on("before_provider_request",()=>{requests++;if(requests>UNIT_CAPS[unit].requests)throw new Error("bridge Provider request budget exceeded");coordinator.recordExternalRequests(1);return undefined;});const offTool=harness.on("tool_call",()=>{toolCalls++;if(toolCalls>UNIT_CAPS[unit].tools)return {block:true,reason:"bridge Tool-call budget exceeded"};return undefined;});const unsub=harness.subscribe((event)=>{if(event.type==="settled")settled++;});try{await harness.prompt(prompt);await harness.waitForIdle();}finally{unsub();offRequest();offTool();await harness.abort();}if(settled!==1)coordinator.fail(unit,new Error("model unit did not settle exactly once"));const context=await session.buildContext();const assistants=context.messages.filter((m)=>m.role==="assistant") as AssistantMessage[];const text=assistants.flatMap((m)=>typeof m.content==="string"?[m.content]:m.content.filter((p)=>p.type==="text").map((p)=>p.text)).join("");const usage=usageFromMessages(assistants,toolCalls,Math.max(0,Date.now()-started));if(usage.provider_requests!==requests)coordinator.fail(unit,new Error("Provider request/response usage mismatch"));const events:FauxExecutionEventV3[]=assistants.map((_m,index)=>({seq:index+1,type:"provider_call",call_id:`${unit}-${index+1}`}));return{text,usage,events};
}

function primaryPort(coordinator:Coordinator,lease:SharedCredentialLease):ProductPrimaryExecutionPortV37G3A{return {async execute(request){
	coordinator.reserve("primary","primary_recovery");const evidence:AttemptRuntimeEvidenceV2B[]=[];const roles:Unit[]=[];let port:ReturnType<typeof createRealExecutionPortV2B>|null=null;
	try{
		const authority=createOneRunProviderAuthorityV1B({authorized:true,resolver:{resolve:()=>lease.resolve()}});port=createRealExecutionPortV2B({runId:request.runId,authority,realCounters:coordinator.real,onAttemptStarted:({role})=>{const unit=role==="primary"?"primary":role==="continue_failed_session"?"recovery_a":"recovery_b";const expected=roles.length===0?"primary":roles.length===1?"recovery_a":"recovery_b";if(unit!==expected)coordinator.fail(unit,new Error("Primary/Recovery arm order drift"));roles.push(unit);},onAttemptEvidence:(item)=>evidence.push(structuredClone(item))});
		const terminal=await executeRunV2A({projectRoot:request.projectRoot,runRoot:request.runRoot,runId:request.runId,taskId:String((request.loadedCase.manifest.primary_task_spec.body as {task_id:string}).task_id),primaryMode:"fail",candidateModes:["pass","pass"],executionPort:port,realExecutionAuthorized:true,realCallCounters:coordinator.real});if(evidence.length!==3||roles.length!==3)coordinator.fail("primary",new Error("Primary V2 group did not produce exact three attempts"));for(let i=0;i<evidence.length;i++){const item=evidence[i]!,unit=UNIT_ORDER[i]!;const usage:Usage={provider_requests:item.usage.provider_requests,combined_tokens:item.usage.tokens,tool_calls:item.usage.tool_calls,commands:commandCalls(item.composition.session_path),wall_time_ms:item.usage.active_execution_time_ms,cost_usd:item.usage.real_cost_usd};coordinator.complete(unit,usage,{attempt_id:item.attempt_id,role:item.role,terminal_reason:item.terminal_reason,usage,runtime_composition_id:RUNTIME_COMPOSITIONS[0].composition_id});}return terminal as unknown as Record<string,unknown>;
	}catch(error){if(coordinator.inspection().state==="open")for(const item of evidence){const unit=item.role==="primary"?"primary":item.role==="continue_failed_session"?"recovery_a":"recovery_b";const usage:Usage={provider_requests:item.usage.provider_requests,combined_tokens:item.usage.tokens,tool_calls:item.usage.tool_calls,commands:commandCalls(item.composition.session_path),wall_time_ms:item.usage.active_execution_time_ms,cost_usd:item.usage.real_cost_usd};coordinator.recordFailedUsage(unit,usage,{attempt_id:item.attempt_id,role:item.role,terminal_reason:item.terminal_reason,usage,runtime_composition_id:RUNTIME_COMPOSITIONS[0].composition_id});}if(coordinator.inspection().state!=="open")throw error;return coordinator.fail(roles.at(-1)??"primary",error instanceof Error?error:new Error(String(error)));}finally{await port?.close?.();}
}};}

function candidatePort(coordinator:Coordinator,template:Readonly<{template_id:string;content:string;content_sha256:string}>):BoundedProposalPortV3{return {async propose(input){coordinator.reserve("candidate_proposal");try{const root=resolve(coordinator.root,"candidate-workspace");mkdirSync(root,{recursive:true});const prompt=`Return exactly one JSON object and no markdown. Preserve the frozen producer input and use exactly this registered prompt_addendum template.\nFrozen registered prompt-addendum template:\n${stableJson({template_id:template.template_id,content:template.content})}\nFrozen producer input:\n${stableJson(input)}`;const result=await runModelUnit(coordinator,"candidate_proposal",root,prompt,"You produce one bounded JSON refinement proposal. Do not invent evaluation authority.");coordinator.validateUsage("candidate_proposal",result.usage);let parsed:unknown;try{parsed=JSON.parse(result.text);}catch{throw new Error("Candidate proposal is not exact JSON");}let serialized:string;try{serialized=stableJson(parsed);}catch{throw new Error("Candidate proposal is not JSON serializable");}if(Buffer.byteLength(serialized,"utf8")>32*1024)throw new Error("bounded producer output limit exceeded");const validated=validateProposalAndBuildCandidateV3({rawProposal:parsed,opportunity:input.opportunity,currentBaseStateDigest:input.expected_base_state_digest,derivation:"model_proposal"});coordinator.complete("candidate_proposal",result.usage,{proposal_digest:digestObject(parsed),candidate_digest:validated.candidate_digest,runtime_composition_id:RUNTIME_COMPOSITIONS[1].composition_id});return parsed;}catch(error){return coordinator.fail("candidate_proposal",error instanceof Error?error:new Error(String(error)));}}};}

function regressionPort(coordinator:Coordinator):FauxValidationPortV3{return {async execute({workspaceRoot,state}){const unit=state.status==="accepted"?"regression_base":"regression_candidate";if(unit==="regression_base")coordinator.reserve(unit,"regression");else coordinator.assertReserved(unit);try{const prompt=state.status==="accepted"?"Inspect the bounded task workspace. Do not edit subject.txt. Finish after inspection.":"Update subject.txt so its exact contents are fixed followed by one newline. Do not alter any other file.";const result=await runModelUnit(coordinator,unit,workspaceRoot,prompt,"You are operating one symmetric bounded regression arm.",state);coordinator.complete(unit,result.usage,{state_digest:state.state_digest,workspace_subject_sha256:sha256(readFileSync(resolve(workspaceRoot,"subject.txt"),"utf8")),runtime_composition_id:RUNTIME_COMPOSITIONS[1].composition_id});return {settled:true as const,events:result.events};}catch(error){return coordinator.fail(unit,error instanceof Error?error:new Error(String(error)));}}};}

function followUpPort(coordinator:Coordinator,lease:SharedCredentialLease):RegisteredFollowUpRuntimePortV37G3A{return {async execute(request){coordinator.reserve("follow_up");try{const runtime=await coordinator.modelRuntime();const service=new PersistentInteractiveSessionServiceV36({runtimeRoot:request.runtimeRoot,workspaceRoot:request.workspace,projectId:request.projectId,workspaceId:request.workspaceId,sessionId:request.sessionId,title:"V3.7 registered bound-State follow-up",sessionPinDigest:request.sessionPinDigest});await service.create();const docker=new DockerRegisteredCommandExecutorV36({dockerExecutable:"docker"});const started=Date.now();const result=await service.executeBoundedTurn({sessionId:request.sessionId,runId:request.runId,prompt:request.prompt,taskPolicy:request.taskPolicy,commandExecutor:async({descriptor,workspace_root})=>await docker.execute({workspaceRoot:workspace_root,evidenceRoot:resolve(request.runtimeRoot,"docker",randomUUID()),descriptor}),budgetProfile:request.runtimeBudget,models:runtime.models,model:runtime.model,systemPrompt:request.systemPrompt,credentialReads:lease.count(),externalModel:true,authorityDigest:request.authorityDigest,registeredRuntimeObservation:request.registeredRuntimeObservation});const manifest=result.manifest;if(manifest.settled!==true||manifest.project_command_executions!==manifest.docker_project_command_executions)throw new Error("follow-up Runtime terminal mismatch");coordinator.recordExternalRequests(manifest.provider_requests);const usage:Usage={provider_requests:manifest.provider_requests,combined_tokens:manifest.input_tokens+manifest.output_tokens,tool_calls:manifest.tool_call_ids.length,commands:manifest.project_command_executions,wall_time_ms:Math.max(0,Date.now()-started),cost_usd:manifest.cost_usd};coordinator.complete("follow_up",usage,{manifest_digest:manifest.manifest_digest,registered_runtime_observation_digest:manifest.registered_runtime_observation_digest,runtime_composition_id:RUNTIME_COMPOSITIONS[1].composition_id});return result;}catch(error){return coordinator.fail("follow_up",error instanceof Error?error:new Error(String(error)));}}};}

class ClosedAwareProductService extends ProductServiceV37G3A {
	private readonly coordinator:Coordinator;
	constructor(projectRoot:string,ports:ProductCaseExecutionPortsV37G3A,authorization:ProductRealAccessAuthorizationV37G3A,coordinator:Coordinator){super(projectRoot,{caseExecutionPorts:{[CASE_ID]:ports},realAccessAuthorization:authorization});this.coordinator=coordinator;}
	override listCases(){const cases=super.listCases();return this.coordinator.inspection().state==="open"?cases:cases.map((item)=>item.case_id===CASE_ID?{...item,available_for_new_workflow:false}:item);}
	override async createWorkflow(caseId:string){this.coordinator.assertOpen();return super.createWorkflow(caseId);}
	override async act(workflowId:string,actionId:Parameters<ProductServiceV37G3A["act"]>[1]){this.coordinator.assertOpen();return super.act(workflowId,actionId);}
}

export function createRealExecutionPortBridgeV37G3B(projectRoot:string,authorityToken:RealExecutionPortBridgeAuthorityV37G3B,opaqueCredentialResolver:OpaqueCredentialResolverV1):RealExecutionPortBridgeV37G3B {
	const authority=exact(authorityToken,["schema_version","kind","case_id","project_id","configuration_candidate_commit","configuration_candidate_tree","manifest_body_digest","workflow_registration_digest","follow_up_execution_profile_digest","registry_index_digest","candidate_proposal_authority_digest","regression_authority_digest"],"bridge authority");
	const expected={schema_version:1,kind:"v37_g3b_host_execution_port_bridge_authority",case_id:CASE_ID,project_id:PROJECT_ID,configuration_candidate_commit:CONFIGURATION_CANDIDATE_COMMIT,configuration_candidate_tree:CONFIGURATION_CANDIDATE_TREE,manifest_body_digest:MANIFEST_DIGEST,workflow_registration_digest:REGISTRATION_DIGEST,follow_up_execution_profile_digest:FOLLOW_UP_PROFILE_DIGEST,registry_index_digest:REGISTRY_DIGEST,candidate_proposal_authority_digest:CANDIDATE_AUTHORITY_DIGEST,regression_authority_digest:REGRESSION_AUTHORITY_DIGEST};
	if(stableJson(authority)!==stableJson(expected))throw new Error("bridge authority identity mismatch");if(!opaqueCredentialResolver||typeof opaqueCredentialResolver.resolve!=="function")throw new Error("opaque Credential resolver is required");
	const loaded=loadRegisteredCaseFromHostRegistryV37G3A({projectRoot,caseId:CASE_ID});const declaration=primaryExecutionDeclarationV37G3A(loaded.manifest),derived=constructionAuthorityDigestsV37G3A(loaded.manifest),follow=followUpAccessExpectationV37G3A(loaded.follow_up_execution_profile);const templates=(loaded.manifest.candidate_policy_spec.body as {generic_prompt_addendum_templates?:unknown}).generic_prompt_addendum_templates;if(!Array.isArray(templates)||templates.length!==1)throw new Error("registered Candidate template inventory invalid");const template=exact(templates[0],["template_id","content","content_sha256"],"registered Candidate template");if(template.template_id!==CANDIDATE_TEMPLATE_ID||template.content!==CANDIDATE_TEMPLATE_CONTENT||template.content_sha256!==CANDIDATE_TEMPLATE_CONTENT_SHA256||sha256(String(template.content))!==CANDIDATE_TEMPLATE_CONTENT_SHA256)throw new Error("registered Candidate template identity mismatch");
	const runtimeBudget=loaded.follow_up_execution_profile.budget_profile as unknown as Record<string,unknown>;
	if(loaded.manifest.project_id!==PROJECT_ID||loaded.manifest.manifest_body_digest!==MANIFEST_DIGEST||loaded.current_envelope.registration_digest!==REGISTRATION_DIGEST||loaded.registry.registry_index_digest!==REGISTRY_DIGEST||loaded.follow_up_execution_profile.follow_up_execution_profile_digest!==FOLLOW_UP_PROFILE_DIGEST||derived.candidateProposalAuthorityDigest!==CANDIDATE_AUTHORITY_DIGEST||derived.regressionAuthorityDigest!==REGRESSION_AUTHORITY_DIGEST||stableJson(declaration.accessExpectation)!==stableJson(PRIMARY_MAXIMA)||stableJson(follow)!==stableJson(FOLLOW_UP_MAXIMA)||runtimeBudget.v36_runtime_budget_profile_id!=="v36_daily_bounded_edit_v2"||runtimeBudget.provider_requests_observation_threshold!==16||runtimeBudget.provider_requests_hard_max!==24)throw new Error("Host-loaded bridge configuration identity mismatch");
	const lease=new SharedCredentialLease(opaqueCredentialResolver),coordinator=new Coordinator(projectRoot,lease);const realAccessAuthorization:ProductRealAccessAuthorizationV37G3A={case_id:CASE_ID,manifest_body_digest:MANIFEST_DIGEST,follow_up_execution_profile_digest:FOLLOW_UP_PROFILE_DIGEST,primary_access_expectation:{...PRIMARY_MAXIMA},follow_up_access_expectation:{...FOLLOW_UP_MAXIMA},candidate_proposal_authority_digest:CANDIDATE_AUTHORITY_DIGEST,regression_authority_digest:REGRESSION_AUTHORITY_DIGEST};const caseExecutionPorts:ProductCaseExecutionPortsV37G3A=Object.freeze({primary:primaryPort(coordinator,lease),candidateProposal:candidatePort(coordinator,{template_id:String(template.template_id),content:String(template.content),content_sha256:String(template.content_sha256)}),regressionValidation:regressionPort(coordinator),followUpRuntime:followUpPort(coordinator,lease)});const service=new ClosedAwareProductService(projectRoot,caseExecutionPorts,realAccessAuthorization,coordinator);coordinator.initialize(authorityToken);return Object.freeze({caseExecutionPorts,realAccessAuthorization:Object.freeze(structuredClone(realAccessAuthorization)),service,inspect:()=>coordinator.inspection(),close:()=>coordinator.close()});
}
