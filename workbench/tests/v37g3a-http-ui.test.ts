import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { WorkbenchApplicationV36G1 } from "../src/webui/application-v36g1.ts";
import { WorkbenchApplicationV37G3A } from "../src/webui/application-v37g3a.ts";
import { createWorkbenchLoopbackServerV36G1 } from "../src/webui/server-v36g1.ts";
import { ProductServiceV37G3A } from "../src/v37/product-service-v37g3a.ts";
import { PROJECT_ROOT } from "./helpers.ts";

async function json(url:string,init?:RequestInit){const response=await fetch(url,init);return {response,value:await response.json() as any};}
test("loopback API exposes exact browser-non-authoritative G3A actions",async()=>{
	let serial=0;const product=new ProductServiceV37G3A(PROJECT_ROOT,{mintId:(kind)=>`v37-g3a-http-${kind}-${++serial}`});
	const app=new WorkbenchApplicationV37G3A({legacy:{} as WorkbenchApplicationV36G1,product});const loopback=createWorkbenchLoopbackServerV36G1(app);const address=await loopback.start(0);
	try{
		const cases=await json(`${address.url}/api/v1/v37/cases`);assert.equal(cases.response.status,200);assert.equal(cases.value.cases.length,2);
		const created=await json(`${address.url}/api/v1/v37/workflows`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({case_id:"v37-det-primary-pass"})});assert.equal(created.response.status,201);assert.equal(created.value.stage,"ready_for_primary");
		const injected=await json(`${address.url}/api/v1/v37/workflows`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({case_id:"v37-det-primary-pass",provider:"caller"})});assert.equal(injected.response.status,400);
		const action=await json(`${address.url}/api/v1/v37/workflows/${created.value.workflow_id}/actions/run_primary`,{method:"POST",headers:{"content-type":"application/json"},body:"{}"});assert.equal(action.response.status,200);assert.equal(action.value.stage,"no_recovery_needed");
		const badAction=await json(`${address.url}/api/v1/v37/workflows/${created.value.workflow_id}/actions/run_recovery`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({path:"caller"})});assert.equal(badAction.response.status,400);
	}finally{await loopback.stop();}
});

test("UI remains bilingual and preserves V3.6 change handoff controls",()=>{
	const index=readFileSync(resolve(PROJECT_ROOT,"workbench/src/webui/static/index.html"),"utf8"),app=readFileSync(resolve(PROJECT_ROOT,"workbench/src/webui/static/app.js"),"utf8"),i18n=readFileSync(resolve(PROJECT_ROOT,"workbench/src/webui/static/i18n.js"),"utf8");
	assert.match(index,/Registered recovery \/ 注册恢复/);assert.match(index,/zh-CN/);assert.match(i18n,/SUPPORTED_LOCALES.*en.*zh-CN/);for(const label of ["Changes and Diff","Apply All","Discard","Export"])assert.match(app,new RegExp(label));
});

test("tracked G3A source contains no rejected Schema 2 or real-access route",()=>{for(const path of ["src/v37/host-registry-v37g3a.ts","src/v37/product-service-v37g3a.ts","src/webui/application-v37g3a.ts"]){const bytes=readFileSync(resolve(PROJECT_ROOT,"workbench",path),"utf8");assert.doesNotMatch(bytes,/schema_version\s*[:=]\s*2|Credential|external_provider_calls:\s*[1-9]|real_model_calls:\s*[1-9]/,path);}});
