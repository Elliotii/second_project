import type { WorkflowActionIdV37G3A } from "../contracts/v37g3a-types.ts";
import { V37_G3A_ACTION_IDS } from "../contracts/v37g3a-types.ts";
import { ProductServiceV37G3A } from "../v37/product-service-v37g3a.ts";
import type { WorkbenchApplicationV36G1 } from "./application-v36g1.ts";

export class WorkbenchApplicationV37G3A {
	readonly legacy: WorkbenchApplicationV36G1;
	readonly product: ProductServiceV37G3A;
	constructor(options:{legacy:WorkbenchApplicationV36G1;product:ProductServiceV37G3A}){this.legacy=options.legacy;this.product=options.product;}
	projects(){return this.legacy.projects();} submitTask(input:unknown){return this.legacy.submitTask(input);} interactiveSessions(){return this.legacy.interactiveSessions();} interactiveSession(id:string){return this.legacy.interactiveSession(id);} workspaceTree(id:string){return this.legacy.workspaceTree(id);} workspaceFile(id:string,path:string){return this.legacy.workspaceFile(id,path);} hasGoal2(){return this.legacy.hasGoal2();} handoff(input:unknown){return this.legacy.handoff(input);} startSessionFromUpdatedSource(input:unknown){return this.legacy.startSessionFromUpdatedSource(input);}
	cases(){return {schema_version:1 as const,cases:this.product.listCases()};}
	workflows(){return {schema_version:1 as const,workflows:this.product.listWorkflows()};}
	createWorkflow(caseId:string){return this.product.createWorkflow(caseId);}
	workflow(workflowId:string){return this.product.getWorkflow(workflowId);}
	action(workflowId:string,actionId:string){if(!(V37_G3A_ACTION_IDS as readonly string[]).includes(actionId))throw new Error("unknown action");return this.product.act(workflowId,actionId as WorkflowActionIdV37G3A);}
}
