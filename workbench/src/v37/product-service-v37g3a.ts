import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { TaskSpecV0B } from "../contracts/v0b-types.ts";
import type { FauxExecutionEventV3 } from "../contracts/v3g2-types.ts";
import type { RefinementCandidateV3 } from "../contracts/v3-types.ts";
import type { WorkflowActionIdV37G3A, WorkflowReadModelV37G3A } from "../contracts/v37g3a-types.ts";
import { writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, fileSha256, sha256, stableJson, treeDigest } from "../hash.ts";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_SHA256 } from "../prompts/base.ts";
import { executeSymmetricValidationV3, type FauxValidationPortV3, type LocalCheckV3 } from "../refinement/comparator-v3.ts";
import type { BoundedProposalPortV3 } from "../refinement/producer-v3.ts";
import { executeRunV2A } from "../run-v2.ts";
import { stageCandidateStateV3 } from "../state/staging-v3.ts";
import { applyValidationDecisionV3, initializeStateStoreV3, inspectStateStoreV3 } from "../state/store-v3.ts";
import { persistStateAssessmentG2 } from "../state/state-feedback-g2.ts";
import { producePromptCandidateV37G3A } from "./candidate-v37g3a.ts";
import { loadRegisteredCaseFromHostRegistryV37G3A } from "./host-registry-v37g3a.ts";
import { admitRegisteredRecoveryV37G3A, deriveRegisteredRecoveryPackageV37G3A } from "./registered-recovery-v37g3a.ts";
import { admitRegisteredFollowUpV37G3A, executeRegisteredFollowUpV37G3A, normalizeRegisteredBoundFollowUpV37G3A, prepareRegisteredFollowUpV37G3A, registeredFollowUpPromotionValidationRootV37G3A, submitRegisteredFollowUpEvidenceV37G3A, type RegisteredFollowUpOptionsV37G3A } from "./registered-follow-up-v37g3a.ts";
import { bindPrimaryRunV37G3A, createWorkflowRegistrationV37G3A, loadWorkflowRegistrationV37G3A, v37G3ADataRootPath } from "./workflow-registration-v37g3a.ts";
import { appendWorkflowReceiptV37G3A, createWorkflowJournalV37G3A } from "./workflow-journal-v37g3a.ts";
import { readWorkflowV37G3A } from "../read-model/workflow-v37g3a.ts";

export const V37_G3A_PRODUCT_DATA_ROOT = ".runs/v37/g3a-product/data" as const;
const PRODUCT_ROOT = ".runs/v37/g3a-product" as const;
const RECOVERY_CASE = "v37-det-recovery-promote-retain";
const PRIMARY_PASS_CASE = "v37-det-primary-pass";
const GENERIC = "Before reporting completion, run the task-declared check and rely on its result rather than self-assessment.";

export interface ProductPortsV37G3A { now?: () => string; mintId?: (kind: "workflow"|"run"|"session"|"workspace") => string; regressionCandidatePass?: boolean; }

function readJson<T>(path:string):T { return JSON.parse(readFileSync(path,"utf8")) as T; }
function artifact(kind:string,id:string,value:unknown){return {kind,id,digest:digestObject(value)};}
function events(prefix:string,count:number):FauxExecutionEventV3[]{return Array.from({length:count},(_,index)=>({seq:index+1,type:"provider_call" as const,call_id:`${prefix}-${index+1}`}));}

export class ProductServiceV37G3A {
	readonly projectRoot:string;
	readonly dataRoot=V37_G3A_PRODUCT_DATA_ROOT;
	private readonly now:()=>string;
	private readonly mint:(kind:"workflow"|"run"|"session"|"workspace")=>string;
	private readonly candidatePass:boolean;
	private serial=0;
	constructor(projectRoot:string,ports:ProductPortsV37G3A={}){
		this.projectRoot=resolve(projectRoot); this.now=ports.now??(()=>new Date().toISOString()); this.mint=ports.mintId??((kind)=>`v37-g3a-${kind}-${++this.serial}`); this.candidatePass=ports.regressionCandidatePass??true;
		loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:this.projectRoot,caseId:RECOVERY_CASE});
	}
	listCases(){return [PRIMARY_PASS_CASE,RECOVERY_CASE].map((case_id)=>{const loaded=loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:this.projectRoot,caseId:case_id,allowDisabledHistorical:true});return {case_id,manifest_version:loaded.manifest.manifest_version,registration_status:loaded.current_envelope.registration_status,available_for_new_workflow:!loaded.historical_read_only};});}
	listWorkflows():WorkflowReadModelV37G3A[]{
		const root=resolve(this.projectRoot,this.dataRoot,"workflows"); if(!existsSync(root))return[];
		return readdirSync(root,{withFileTypes:true}).filter((entry)=>entry.isDirectory()&&!entry.isSymbolicLink()).map((entry)=>entry.name).sort().map((workflowId)=>this.getWorkflow(workflowId));
	}
	async createWorkflow(caseId:string):Promise<WorkflowReadModelV37G3A>{
		if(![RECOVERY_CASE,PRIMARY_PASS_CASE].includes(caseId))throw new Error("Case is not registered for Goal 3A");
		const workflowId=this.mint("workflow"),createdAt=this.now();
		const created=createWorkflowRegistrationV37G3A({projectRoot:this.projectRoot,dataRoot:this.dataRoot,caseId,workflowId,createdAt});
		createWorkflowJournalV37G3A({projectRoot:this.projectRoot,dataRoot:this.dataRoot,workflow:created.workflow,createdAt});
		const manifest=loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:this.projectRoot,caseId}).manifest;
		const stateRoot=resolve(this.projectRoot,manifest.state_store_scope_spec.configured_location);
		if(!existsSync(stateRoot)){
			const initRoot=resolve(this.projectRoot,PRODUCT_ROOT,"initialization",caseId); const agent=resolve(initRoot,"agent"),accepted=resolve(initRoot,"accepted");mkdirSync(agent,{recursive:true});mkdirSync(accepted,{recursive:true});
			const initialized=await initializeStateStoreV3({stateRoot,projectId:manifest.project_id,agentWorkspaceRoot:agent,acceptedBaseRoots:[accepted],immutableBasePrompt:SYSTEM_PROMPT,immutableBasePromptSha256:SYSTEM_PROMPT_SHA256});
			if(initialized.version.state_digest!==manifest.state_store_scope_spec.initial_state_digest)throw new Error("frozen initial State digest mismatch");
		}
		return this.getWorkflow(workflowId);
	}
	getWorkflow(workflowId:string){return readWorkflowV37G3A({projectRoot:this.projectRoot,dataRoot:this.dataRoot,workflowId});}
	async act(workflowId:string,actionId:WorkflowActionIdV37G3A):Promise<WorkflowReadModelV37G3A>{
		const model=this.getWorkflow(workflowId); if(model.historical_read_only)throw new Error("disabled workflow is read-only"); if(!model.available_actions.includes(actionId))throw new Error("action is unknown, premature or repeated");
		const registered=loadWorkflowRegistrationV37G3A({projectRoot:this.projectRoot,dataRoot:this.dataRoot,workflowId});
		const refs=await this.executeAction(actionId,registered.workflow.case_id,workflowId);
		appendWorkflowReceiptV37G3A({projectRoot:this.projectRoot,dataRoot:this.dataRoot,workflowId,actionId,artifactRefs:refs,recordedAt:this.now()});
		return this.getWorkflow(workflowId);
	}
	private workflowRoot(workflowId:string){return resolve(this.projectRoot,this.dataRoot,"workflows",workflowId);}
	private runRoot(workflowId:string){return resolve(this.projectRoot,PRODUCT_ROOT,"runs",workflowId,"primary");}
	private recoveryTimes(workflowId:string){return {confirmedAt:`2026-08-20T13:${String(Math.abs(hashCode(workflowId))%50).padStart(2,"0")}:00.000Z`,requestedAt:`2026-08-20T13:${String(Math.abs(hashCode(workflowId))%50).padStart(2,"0")}:01.000Z`};}
	private followOptions(workflowId:string):RegisteredFollowUpOptionsV37G3A { const n=Math.abs(hashCode(workflowId))%50;return {projectRoot:this.projectRoot,dataRoot:this.dataRoot,workflowId,followUpRunId:`${workflowId}-follow-up`,sessionId:`${workflowId}-session`,workspaceId:`${workflowId}-workspace`,boundAt:`2026-08-20T14:${String(n).padStart(2,"0")}:00.000Z`,confirmedAt:`2026-08-20T14:${String(n).padStart(2,"0")}:10.000Z`,requestedAt:`2026-08-20T14:${String(n).padStart(2,"0")}:11.000Z`}; }
	private async executeAction(actionId:WorkflowActionIdV37G3A,caseId:string,workflowId:string):Promise<Array<{kind:string;id:string;digest:string}>>{
		if(actionId==="run_primary")return this.runPrimary(caseId,workflowId);
		if(caseId!==RECOVERY_CASE)throw new Error("Primary-pass workflow has no learning actions");
		const times=this.recoveryTimes(workflowId), common={projectRoot:this.projectRoot,dataRoot:this.dataRoot,workflowId,runRoot:this.runRoot(workflowId),...times};
		if(actionId==="run_recovery"){
			const pkg=deriveRegisteredRecoveryPackageV37G3A(common),root=v37G3ADataRootPath(this.projectRoot,this.dataRoot);writeOnceJson(root,`workflows/${workflowId}/recovery/comparison.json`,pkg.comparison);writeOnceJson(root,`workflows/${workflowId}/recovery/evidence.json`,pkg.evidence);return [artifact("comparison",pkg.comparison.comparison_decision_id,pkg.comparison),artifact("recovery_evidence",`evidence-${pkg.evidence.evidence_body_digest.slice(0,32)}`,pkg.evidence)];
		}
		if(actionId==="confirm_recovery_evidence"){
			const pkg=deriveRegisteredRecoveryPackageV37G3A(common),root=v37G3ADataRootPath(this.projectRoot,this.dataRoot);writeOnceJson(root,`workflows/${workflowId}/recovery/confirmation.json`,pkg.confirmation);return [artifact("recovery_confirmation",pkg.confirmation.confirmation_receipt_id,pkg.confirmation)];
		}
		if(actionId==="request_recovery_admission"){
			const pkg=deriveRegisteredRecoveryPackageV37G3A(common),root=v37G3ADataRootPath(this.projectRoot,this.dataRoot);writeOnceJson(root,`workflows/${workflowId}/recovery/request.json`,pkg.request);const admission=admitRegisteredRecoveryV37G3A(common);return [artifact("recovery_admission",admission.admission_id,admission)];
		}
		if(actionId==="produce_candidate"){
			const port:BoundedProposalPortV3={propose:async(input)=>({schema_version:1,proposal_id:`${workflowId}-proposal`,evidence_digest:input.opportunity.evidence_identity.evidence_digest,expected_base_state_digest:input.expected_base_state_digest,diagnosis:{pattern_id:input.opportunity.trigger,statement:"The registered Primary failed before bounded Recovery succeeded.",evidence_refs:structuredClone(input.opportunity.evidence_refs)},lesson:{statement:"Use the registered verification discipline.",expected_outcome:"The related task is checked before completion.",applicability:{task_kinds:["typescript-maintenance"],failure_families:["verifier-failure"]}},edits:[{kind:"prompt_addendum",entry_id:"v37-verify-before-finish",content:GENERIC,applicability:{task_kinds:["typescript-maintenance"],failure_families:["verifier-failure"]}}]})};
			const result=await producePromptCandidateV37G3A({...common,immutableBasePrompt:SYSTEM_PROMPT,port});writeOnceJson(v37G3ADataRootPath(this.projectRoot,this.dataRoot),`workflows/${workflowId}/candidate.json`,result);return [artifact("candidate",result.candidate.candidate_id,result.candidate)];
		}
		if(actionId==="run_regression")return this.runRegression(workflowId);
		if(actionId==="run_follow_up"){
			const candidate=this.candidate(workflowId),options=this.followOptions(workflowId);await prepareRegisteredFollowUpV37G3A({...options,candidate});const result=await executeRegisteredFollowUpV37G3A(options);return [artifact("follow_up_evidence",`evidence-${result.evidence.evidence_body_digest.slice(0,32)}`,result.evidence),artifact("follow_up_outcome",result.outcome.follow_up_run_id,result.outcome)];
		}
		if(actionId==="confirm_follow_up_evidence"){
			const value=submitRegisteredFollowUpEvidenceV37G3A(this.followOptions(workflowId));return [artifact("follow_up_confirmation",value.confirmation.confirmation_receipt_id,value.confirmation)];
		}
		if(actionId==="request_follow_up_admission"){
			const admission=await admitRegisteredFollowUpV37G3A(this.followOptions(workflowId));return [artifact("follow_up_admission",admission.admission_id,admission)];
		}
		const canonical=await normalizeRegisteredBoundFollowUpV37G3A(this.followOptions(workflowId));const registered=loadWorkflowRegistrationV37G3A({projectRoot:this.projectRoot,dataRoot:this.dataRoot,workflowId});const scope=registered.loadedCase.manifest.state_store_scope_spec;const assessmentRoot=resolve(this.projectRoot,PRODUCT_ROOT,"assessments",workflowId);const result=await persistStateAssessmentG2({projectRoot:this.projectRoot,assessmentRoot,admissionRoot:assessmentRoot,registrationPath:resolve(assessmentRoot,"unused.json"),admissionId:canonical.admission_identity.admission_id,projectId:registered.workflow.project_id,stateRoot:resolve(this.projectRoot,scope.configured_location),expectedActive:canonical.bound_active_state_identity,promotionValidationRunRoot:registeredFollowUpPromotionValidationRootV37G3A(this.followOptions(workflowId)),comparisonRunRoot:null,requestedRollbackTargetDigest:null,immutableBasePrompt:SYSTEM_PROMPT,immutableBasePromptSha256:SYSTEM_PROMPT_SHA256,registeredFollowUpG3A:this.followOptions(workflowId)});return [artifact("state_assessment",result.assessment.assessment_id,result.assessment)];
	}
	private async runPrimary(caseId:string,workflowId:string){
		const runRoot=this.runRoot(workflowId),runId=`${workflowId}-primary`;bindPrimaryRunV37G3A({projectRoot:this.projectRoot,dataRoot:this.dataRoot,workflowId,runId,runRoot,boundAt:this.now()});
		if(caseId===RECOVERY_CASE){const terminal=await executeRunV2A({projectRoot:this.projectRoot,runRoot,runId,primaryMode:"fail",candidateModes:["pass","pass"]});return [artifact("primary_terminal",terminal.run_id,terminal)];}
		const source=resolve(this.projectRoot,"workbench/fixtures/v37g3a/primary-pass/workspace"),workspace=resolve(runRoot,"primary/workspace");mkdirSync(dirname(workspace),{recursive:true});cpSync(source,workspace,{recursive:true});const verifier=resolve(this.projectRoot,"fixtures/verifiers/v1/parse-duration.mjs");const result=spawnSync(process.execPath,[verifier],{cwd:workspace,env:{V1_WORKSPACE:workspace},encoding:"utf8",timeout:15000,maxBuffer:65536});const body={schema_version:1,kind:"v37_g3a_primary_terminal",run_id:runId,task_id:"v37-g3a-primary-pass-parse-duration",workspace_digest:treeDigest(workspace),verifier_source_sha256:fileSha256(verifier),verifier_status:result.status===0?"passed":"failed",outcome:result.status===0?"passed":"failed",credential_reads:0,network_calls:0,external_provider_calls:0,real_model_calls:0};const terminal={...body,terminal_digest:digestObject(body)};writeOnceJson(runRoot,"terminal.json",terminal);if(terminal.outcome!=="passed")throw new Error("registered Primary-pass verifier did not pass");return [artifact("primary_terminal",runId,terminal)];
	}
	private candidate(workflowId:string):RefinementCandidateV3{return readJson<{candidate:RefinementCandidateV3}>(resolve(this.workflowRoot(workflowId),"candidate.json")).candidate;}
	private async runRegression(workflowId:string){
		const candidate=this.candidate(workflowId),registered=loadWorkflowRegistrationV37G3A({projectRoot:this.projectRoot,dataRoot:this.dataRoot,workflowId}),scope=registered.loadedCase.manifest.state_store_scope_spec,stateRoot=resolve(this.projectRoot,scope.configured_location);
		const state=await inspectStateStoreV3({stateRoot,expectedProjectId:registered.workflow.project_id,immutableBasePrompt:SYSTEM_PROMPT,immutableBasePromptSha256:SYSTEM_PROMPT_SHA256});if(!state.integrity_valid||!state.active)throw new Error("Regression State Store invalid");const prior={binding_revision:state.active.binding_revision,state_version:state.active.state_version,state_digest:state.active.state_digest};
		const root=resolve(this.projectRoot,PRODUCT_ROOT,"regression",workflowId),agent=resolve(root,"agent"),accepted=resolve(root,"accepted"),stagedRoot=resolve(root,"staged");mkdirSync(agent,{recursive:true});mkdirSync(accepted,{recursive:true});const staged=await stageCandidateStateV3({candidate,stateRoot:stagedRoot,agentWorkspaceRoot:agent,acceptedBaseRoots:[accepted],immutableBasePrompt:SYSTEM_PROMPT,immutableBasePromptSha256:SYSTEM_PROMPT_SHA256});
		const workspace=resolve(root,"workspace");mkdirSync(workspace,{recursive:true});writeFileSync(resolve(workspace,"subject.txt"),"broken\n");writeFileSync(resolve(workspace,"protected.txt"),"protected-stable\n");const verifier=this.publicationVerifier(root,workspace,"subject.txt","fixed\n"),regression=this.publicationVerifier(root,workspace,"protected.txt","protected-stable\n","protected");const validationRoot=registeredFollowUpPromotionValidationRootV37G3A(this.followOptions(workflowId));const port:FauxValidationPortV3={execute:async({state:version,workspaceRoot})=>{if(version.status==="staged_inactive"&&this.candidatePass)writeFileSync(resolve(workspaceRoot,"subject.txt"),"fixed\n");return {settled:true,events:events(version.status,version.status==="accepted"?3:2)};}};const base=state.versions.find((entry)=>entry.state_digest===prior.state_digest)!;const validation=await executeSymmetricValidationV3({projectRoot:this.projectRoot,runRoot:validationRoot,validationId:`${workflowId}-validation`,projectId:registered.workflow.project_id,sourceWorkspaceRoot:workspace,task:verifier.task,verifier,regressions:[regression],baseState:base,candidateState:staged.state,providerModelProfileDigest:sha256("v37-g3a-regression-provider"),toolProfileDigest:sha256("v37-g3a-regression-tools"),budgetDigest:sha256("v37-g3a-regression-budget"),hardConstraintsDigest:sha256("v37-g3a-regression-constraints"),port});if(validation.validation.decision.result!=="promote")return [artifact("regression_rejected",validation.validation.validation_id,validation.validation)];const applied=await applyValidationDecisionV3({stateRoot,projectId:registered.workflow.project_id,runRoot:validationRoot,validationRef:validation.validationRef,stagedStateRoot:stagedRoot,candidateStateDigest:staged.state.state_digest,expectedActive:prior,immutableBasePrompt:SYSTEM_PROMPT,immutableBasePromptSha256:SYSTEM_PROMPT_SHA256});return [artifact("promotion_decision",applied.decision.decision_id,applied.decision),artifact("state",String(applied.active.state_version),applied.active)];
	}
	private publicationVerifier(root:string,workspace:string,file:string,expected:string,suffix="main"):LocalCheckV3{
		const id=`v37-g3a-${suffix}-verifier`,source=`import {readFileSync} from "node:fs";import {resolve} from "node:path";const root=process.env.V0B_WORKSPACE;let passed=false;try{passed=typeof root==="string"&&readFileSync(resolve(root,${JSON.stringify(file)}),"utf8")===${JSON.stringify(expected)};}catch{}console.log(JSON.stringify({schema_version:1,verifier_id:${JSON.stringify(id)},status:passed?"passed":"failed",summary:passed?"passed":"failed"}));process.exit(passed?0:1);`;const sourcePath=resolve(root,`${id}.mjs`);writeFileSync(sourcePath,source);const task:TaskSpecV0B={schema_version:1,task_id:`${id}-task`,instruction_ref:id,instruction_sha256:sha256(id),workspace_source_ref:workspace,workspace_source_digest:treeDigest(workspace),writable_paths:["subject.txt"],protected_paths:["protected.txt"],verifier_id:id,verifier_ref:sourcePath,verifier_sha256:fileSha256(sourcePath),acceptance_visibility:"hidden_external",tool_profile_id:"v3g3_bounded_local",command_descriptors:[],verifier_command:{executable:"current_node_executable",argv:[sourcePath],cwd:"project",timeout_ms:5000,output_limit_bytes:8192}};return {task,sourcePath};
	}
}
function hashCode(value:string){let result=0;for(const char of value)result=((result<<5)-result+char.charCodeAt(0))|0;return result;}
