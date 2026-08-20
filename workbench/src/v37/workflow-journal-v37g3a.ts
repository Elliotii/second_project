import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import type { WorkflowRegistrationV37 } from "../contracts/v37-types.ts";
import type { WorkflowActionIdV37G3A, WorkflowHeaderV37G3A, WorkflowTransitionReceiptV37G3A } from "../contracts/v37g3a-types.ts";
import { writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, stableJson } from "../hash.ts";

const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;
function contained(root: string, target: string): boolean { const rel = relative(root, target); return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`)); }
function rootPath(projectRoot: string, dataRoot: string, create: boolean): string {
	if (isAbsolute(dataRoot) || dataRoot.replaceAll("\\", "/").split("/").includes("..")) throw new Error("journal root must be Host project-relative");
	const project = resolve(projectRoot), root = resolve(project, dataRoot);
	if (!contained(project, root)) throw new Error("journal root escapes Host project");
	if (!existsSync(root)) { if (!create) throw new Error("journal root is missing"); mkdirSync(root, { recursive: true }); }
	let cursor = project;
	for (const segment of relative(project, root).split(sep).filter(Boolean)) { cursor = resolve(cursor, segment); const stats = lstatSync(cursor); if (stats.isSymbolicLink() || !stats.isDirectory()) throw new Error("journal root contains link/reparse or non-directory"); }
	if (!contained(realpathSync.native(project), realpathSync.native(root))) throw new Error("journal real path escapes Host project");
	return root;
}
function safeDescendant(root:string,target:string,createDirectories:boolean):string{
	if(!contained(root,target)||target===root)throw new Error("journal descendant escapes Host-owned root");
	const directory=dirname(target);
	let cursor=root;
	for(const segment of relative(root,directory).split(sep).filter(Boolean)){
		cursor=resolve(cursor,segment);
		if(!existsSync(cursor)){
			if(!createDirectories)throw new Error("journal descendant is missing");
			mkdirSync(cursor);
		}
		const stats=lstatSync(cursor);
		if(stats.isSymbolicLink()||!stats.isDirectory())throw new Error("journal descendant contains link/reparse or non-directory");
	}
	if(!contained(realpathSync.native(root),realpathSync.native(directory)))throw new Error("journal descendant real path escapes Host-owned root");
	return target;
}
function ordinaryJson<T>(root:string,path:string):T { safeDescendant(root,path,false); const stats=lstatSync(path); if(!stats.isFile()||stats.isSymbolicLink()||stats.nlink!==1) throw new Error("journal artifact must be ordinary singly linked file"); const bytes=readFileSync(path,"utf8"); const value=JSON.parse(bytes) as T; if(bytes!==`${stableJson(value)}\n`) throw new Error("journal artifact bytes are not canonical"); return value; }
function headerBody(value: WorkflowHeaderV37G3A) { const { header_digest:_digest,...body}=value; return body; }
function receiptBody(value: WorkflowTransitionReceiptV37G3A) { const { receipt_digest:_digest,...body}=value; return body; }

export function createWorkflowJournalV37G3A(options: { projectRoot: string; dataRoot: string; workflow: WorkflowRegistrationV37; createdAt: string }): WorkflowHeaderV37G3A {
	const root=rootPath(options.projectRoot,options.dataRoot,true);
	const body: Omit<WorkflowHeaderV37G3A,"header_digest">={schema_version:1,kind:"v37_g3a_workflow_header",workflow:structuredClone(options.workflow),created_at:options.createdAt};
	const header={...body,header_digest:digestObject(body)};
	safeDescendant(root,resolve(root,"workflows",options.workflow.workflow_id,"journal","header.json"),true);
	writeOnceJson(root,`workflows/${options.workflow.workflow_id}/journal/header.json`,header);
	return header;
}

export function loadWorkflowJournalV37G3A(options:{projectRoot:string;dataRoot:string;workflowId:string}):{header:WorkflowHeaderV37G3A;receipts:WorkflowTransitionReceiptV37G3A[]} {
	if(!ID.test(options.workflowId)) throw new Error("workflow ID invalid");
	const root=rootPath(options.projectRoot,options.dataRoot,false), journal=resolve(root,"workflows",options.workflowId,"journal");
	const header=ordinaryJson<WorkflowHeaderV37G3A>(root,resolve(journal,"header.json"));
	if(header.workflow.workflow_id!==options.workflowId||digestObject(headerBody(header))!==header.header_digest) throw new Error("workflow journal header identity invalid");
	const receiptRoot=resolve(journal,"receipts");
	if(existsSync(receiptRoot))safeDescendant(root,resolve(receiptRoot,"placeholder.json"),false);
	const names=existsSync(receiptRoot)?readdirSync(receiptRoot).sort():[];
	if(names.some((name,index)=>name!==`${String(index+1).padStart(4,"0")}.json`)) throw new Error("workflow journal receipt sequence is not contiguous");
	let prior:string|null=null;
	const receipts=names.map((name,index)=>{ const receipt=ordinaryJson<WorkflowTransitionReceiptV37G3A>(root,resolve(receiptRoot,name)); if(receipt.workflow_id!==options.workflowId||receipt.sequence!==index+1||receipt.previous_receipt_digest!==prior||digestObject(receiptBody(receipt))!==receipt.receipt_digest) throw new Error("workflow journal receipt chain invalid"); prior=receipt.receipt_digest; return receipt; });
	return {header,receipts};
}

export function appendWorkflowReceiptV37G3A(options:{projectRoot:string;dataRoot:string;workflowId:string;actionId:WorkflowActionIdV37G3A;artifactRefs:Array<{kind:string;id:string;digest:string}>;recordedAt:string}):WorkflowTransitionReceiptV37G3A {
	const loaded=loadWorkflowJournalV37G3A(options), sequence=loaded.receipts.length+1;
	const body:Omit<WorkflowTransitionReceiptV37G3A,"receipt_digest">={schema_version:1,kind:"v37_g3a_transition_receipt",workflow_id:options.workflowId,sequence,action_id:options.actionId,previous_receipt_digest:loaded.receipts.at(-1)?.receipt_digest??null,artifact_refs:structuredClone(options.artifactRefs),recorded_at:options.recordedAt};
	const receipt={...body,receipt_digest:digestObject(body)};
	const root=rootPath(options.projectRoot,options.dataRoot,false);
	safeDescendant(root,resolve(root,"workflows",options.workflowId,"journal","receipts",`${String(sequence).padStart(4,"0")}.json`),true);
	writeOnceJson(root,`workflows/${options.workflowId}/journal/receipts/${String(sequence).padStart(4,"0")}.json`,receipt);
	return receipt;
}
