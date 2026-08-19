import type { WorkflowActionIdV37G3A, WorkflowReadModelV37G3A, WorkflowStageV37G3A, WorkflowTransitionReceiptV37G3A } from "../contracts/v37g3a-types.ts";
import { loadWorkflowRegistrationV37G3A } from "../v37/workflow-registration-v37g3a.ts";
import { loadWorkflowJournalV37G3A } from "../v37/workflow-journal-v37g3a.ts";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { digestObject } from "../hash.ts";

const routes: Record<WorkflowStageV37G3A, WorkflowActionIdV37G3A[]>={ready_for_primary:["run_primary"],ready_for_recovery:["run_recovery"],no_recovery_needed:[],ready_for_recovery_confirmation:["confirm_recovery_evidence"],ready_for_recovery_admission:["request_recovery_admission"],ready_for_candidate:["produce_candidate"],ready_for_regression:["run_regression"],candidate_rejected:[],ready_for_follow_up:["run_follow_up"],ready_for_follow_up_confirmation:["confirm_follow_up_evidence"],ready_for_follow_up_admission:["request_follow_up_admission"],ready_for_assessment:["assess_state"],complete:[]};
function deriveStage(caseId:string, receipts:WorkflowTransitionReceiptV37G3A[]):WorkflowStageV37G3A {
	let stage:WorkflowStageV37G3A="ready_for_primary";
	for(const receipt of receipts){
		if(!routes[stage].includes(receipt.action_id)) throw new Error("workflow receipt action is premature or repeated");
		if(receipt.action_id==="run_primary") stage=caseId==="v37-det-primary-pass"?"no_recovery_needed":"ready_for_recovery";
		else if(receipt.action_id==="run_recovery") stage="ready_for_recovery_confirmation";
		else if(receipt.action_id==="confirm_recovery_evidence") stage="ready_for_recovery_admission";
		else if(receipt.action_id==="request_recovery_admission") stage="ready_for_candidate";
		else if(receipt.action_id==="produce_candidate") stage="ready_for_regression";
		else if(receipt.action_id==="run_regression") stage=receipt.artifact_refs.some((ref)=>ref.kind==="regression_rejected")?"candidate_rejected":"ready_for_follow_up";
		else if(receipt.action_id==="run_follow_up") stage="ready_for_follow_up_confirmation";
		else if(receipt.action_id==="confirm_follow_up_evidence") stage="ready_for_follow_up_admission";
		else if(receipt.action_id==="request_follow_up_admission") stage="ready_for_assessment";
		else if(receipt.action_id==="assess_state") stage="complete";
	}
	return stage;
}

function objectContainsId(value:unknown,id:string):boolean{
	if(Array.isArray(value))return value.some((item)=>objectContainsId(item,id));
	if(!value||typeof value!=="object")return false;
	return Object.entries(value as Record<string,unknown>).some(([key,item])=>((key.endsWith("_id")||key.endsWith("_version"))&&String(item)===id)||(key.endsWith("_digest")&&typeof item==="string"&&id.endsWith(item.slice(0,32)))||objectContainsId(item,id));
}
function containsArtifact(value:unknown,ref:{id:string;digest:string}):boolean{
	if(value&&typeof value==="object"&&digestObject(value)===ref.digest&&objectContainsId(value,ref.id))return true;
	if(Array.isArray(value))return value.some((item)=>containsArtifact(item,ref));
	if(value&&typeof value==="object")return Object.values(value as Record<string,unknown>).some((item)=>containsArtifact(item,ref));
	return false;
}
function rootContainsArtifact(root:string,ref:{id:string;digest:string}):boolean{
	if(!existsSync(root))return false;
	const visit=(path:string):boolean=>{const stats=lstatSync(path);if(stats.isSymbolicLink())throw new Error("formal artifact root contains a link/reparse point");if(stats.isDirectory())return readdirSync(path).some((name)=>visit(resolve(path,name)));if(!stats.isFile()||!path.endsWith(".json"))return false;try{return containsArtifact(JSON.parse(readFileSync(path,"utf8")),ref);}catch{return false;}};
	return visit(root);
}
function verifyFormalRefs(projectRoot:string,dataRoot:string,workflowId:string,stateRoot:string,receipts:WorkflowTransitionReceiptV37G3A[]):void{
	const roots=[resolve(projectRoot,dataRoot,"workflows",workflowId),resolve(projectRoot,".runs/v37/g3a-product/runs",workflowId),resolve(projectRoot,".runs/v37/g3a-product/regression",workflowId),resolve(projectRoot,".runs/v37/g3a-product/assessments",workflowId),stateRoot];
	for(const receipt of receipts)for(const ref of receipt.artifact_refs)if(!roots.some((root)=>rootContainsArtifact(root,ref)))throw new Error(`formal artifact reference drift: ${ref.kind}`);
}
export function readWorkflowV37G3A(options:{projectRoot:string;dataRoot:string;workflowId:string}):WorkflowReadModelV37G3A {
	const journal=loadWorkflowJournalV37G3A(options);
	if(journal.header.workflow.workflow_id!==options.workflowId) throw new Error("journal/workflow identity mismatch");
	const registered=loadWorkflowRegistrationV37G3A({...options,allowHistoricalReadOnly:true});
	if(registered.workflow.workflow_registration_digest!==journal.header.workflow.workflow_registration_digest) throw new Error("journal/workflow registration drift");
	const stage=deriveStage(registered.workflow.case_id,journal.receipts);
	verifyFormalRefs(options.projectRoot,options.dataRoot,options.workflowId,resolve(options.projectRoot,registered.loadedCase.manifest.state_store_scope_spec.configured_location),journal.receipts);
	const historical=registered.loadedCase.historical_read_only;
	return {workflow_id:options.workflowId,case_id:registered.workflow.case_id,stage,available_actions:historical?[]:structuredClone(routes[stage]),historical_read_only:historical,artifacts:journal.receipts.flatMap((receipt)=>structuredClone(receipt.artifact_refs)),receipt_count:journal.receipts.length};
}
