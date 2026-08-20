import assert from "node:assert/strict";
import { linkSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { digestObject, fileSha256 } from "../src/hash.ts";
import { V37_G3A_LOADER_CONTRACT_ID, V37_G3A_LOADER_SOURCE_INVENTORY, V37_G3A_REGISTRY_LOCATION, constructionAuthorityDigestsV37G3A, deriveRegistryTrustRootDigestV37G3A, followUpAccessExpectationV37G3A, loadRegisteredCaseFromHostRegistryV37G3A, loaderContractFingerprintV37G3A, primaryExecutionDeclarationV37G3A, validateHostRegistryIndexV37G3A } from "../src/v37/host-registry-v37g3a.ts";
import { PROJECT_ROOT } from "./helpers.ts";
import { createWorkflowRegistrationV37G3A, loadWorkflowRegistrationV37G3A } from "../src/v37/workflow-registration-v37g3a.ts";
import { ProductServiceV37G3A } from "../src/v37/product-service-v37g3a.ts";
import { assertBoundedEditBudgetProfileV36, type BoundedEditBudgetProfileV36 } from "../src/v36/budget-profile-v36.ts";

const ids=["v37-det-primary-pass","v37-det-recovery-promote-retain","v37-real-recovery-promote-retain"];
test("G3A registry is exact, canonical, bounded and per-entry stable",()=>{
	const registry=JSON.parse(readFileSync(resolve(PROJECT_ROOT,"workbench/config/v37/g3a/registered-cases/registry-v2.json"),"utf8"));
	assert.deepEqual(registry.entries.map((entry:any)=>entry.case_id),ids);assert.equal(registry.entries.length,3);validateHostRegistryIndexV37G3A(registry);
	const loaded=loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:PROJECT_ROOT,caseId:ids[0]!});const prior=loaded.registry_trust_root_digest;
	assert.equal(deriveRegistryTrustRootDigestV37G3A(loaded),prior);
	assert.throws(()=>validateHostRegistryIndexV37G3A({...registry,caller_authority:true}),/exact-key/);
	const body={...registry,entries:[...registry.entries,{...structuredClone(registry.entries[2]),case_id:"v37-real-z"}]};delete body.registry_index_digest;const four={...body,registry_index_digest:digestObject(body)};assert.throws(()=>validateHostRegistryIndexV37G3A(four),/identity/);
});

test("G3B zero-access configuration loads exact real Case but grants no execution authority",async()=>{
	const loaded=loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:PROJECT_ROOT,caseId:ids[2]!});
	assert.equal(loaded.manifest.project_id,"v37-real-recovery-project");assert.equal(loaded.manifest.manifest_version,2);assert.equal(loaded.manifest.manifest_body_digest,"dcaf5ff929a5a98ae32fe42b7f1700cf4a7dd0630e2989b10b8fd5fb219a39dc");
	assert.equal(loaded.follow_up_execution_profile.follow_up_execution_profile_digest,"89fa6b4227495ddd1d972c91f1139532858842c4e3a13529d682b99aa93b7ace");
	const budget=loaded.follow_up_execution_profile.budget_profile as unknown as Record<string,unknown>;
	const runtimeBudget={profile_id:budget.v36_runtime_budget_profile_id,provider_requests_observation_threshold:budget.provider_requests_observation_threshold,provider_requests_hard_max:budget.provider_requests_hard_max,tool_calls_hard_max:budget.tool_calls_hard_max,combined_tokens_hard_max:budget.combined_tokens_hard_max,cost_usd_hard_max:budget.cost_usd_hard_max,wall_time_ms_hard_max:budget.wall_time_ms_hard_max};
	assert.deepEqual(runtimeBudget,{profile_id:"v36_64_request_bounded_edit_v3",provider_requests_observation_threshold:64,provider_requests_hard_max:64,tool_calls_hard_max:96,combined_tokens_hard_max:524288,cost_usd_hard_max:0.2,wall_time_ms_hard_max:3600000});
	assert.doesNotThrow(()=>assertBoundedEditBudgetProfileV36(runtimeBudget as unknown as BoundedEditBudgetProfileV36));
	assert.deepEqual(primaryExecutionDeclarationV37G3A(loaded.manifest),{primaryMode:"fail",executionPortKind:"injected",realAccessDeclared:true,accessExpectation:{credential_reads:1,external_provider_calls:192,network_calls:192,real_model_calls:192}});
	assert.deepEqual(followUpAccessExpectationV37G3A(loaded.follow_up_execution_profile),{credential_reads:1,network_calls:64,external_provider_calls:64,real_model_calls:64});
	assert.deepEqual(constructionAuthorityDigestsV37G3A(loaded.manifest),{candidateProposalAuthorityDigest:"c93ce9bb18b23990f909c24ea2fdf13d0f6b9b6b93f7401b0f8aef22bbaf6450",regressionAuthorityDigest:"91497eba6a828e2845ca22145669926e0debbe4ca0aa5f1b67a06fb12d5750ab"});
	const product=new ProductServiceV37G3A(PROJECT_ROOT);const real=product.listCases().find((item)=>item.case_id===ids[2]);assert.equal(real?.available_for_new_workflow,false);await assert.rejects(product.createWorkflow(ids[2]!),/lacks matching Host-constructed execution authority/);
});

test("loader rejects caller authority and alternate roots",()=>{
	assert.throws(()=>loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:PROJECT_ROOT,caseId:"unknown"}),/not present/);
	assert.throws(()=>loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:resolve(PROJECT_ROOT,"workbench"),caseId:ids[0]!}),/alternate Host/);
	assert.throws(()=>loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:PROJECT_ROOT,caseId:ids[0]!,registryLocation:"caller"} as never),/override/);
});

test("loader requires canonical registry bytes and fingerprints every validation source",()=>{
	const registryPath=resolve(PROJECT_ROOT,V37_G3A_REGISTRY_LOCATION),bytes=readFileSync(registryPath,"utf8"),registry=JSON.parse(bytes);
	try{writeFileSync(registryPath,JSON.stringify(registry,null,2));assert.throws(()=>loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:PROJECT_ROOT,caseId:ids[0]!}),/not canonical/);}finally{writeFileSync(registryPath,bytes);}
	assert.deepEqual(V37_G3A_LOADER_SOURCE_INVENTORY,["workbench/src/hash.ts","workbench/src/contracts/v37-types.ts","workbench/src/contracts/v37g3a-types.ts","workbench/src/v37/host-registry-v37.ts","workbench/src/v37/host-registry-v37g3a.ts"]);
	const expected=digestObject({loader_contract_id:V37_G3A_LOADER_CONTRACT_ID,loader_sources:V37_G3A_LOADER_SOURCE_INVENTORY.map((location)=>({location,sha256:fileSha256(resolve(PROJECT_ROOT,location))})),registry_location:V37_G3A_REGISTRY_LOCATION,root_resolution:"module_owned_candidate_checkout_v1"});
	assert.equal(loaderContractFingerprintV37G3A(PROJECT_ROOT),expected);
	const dataRoot=".runs/v37/g3a-authority-loader-fingerprint",workflowId="v37-g3a-loader-fingerprint";rmSync(resolve(PROJECT_ROOT,dataRoot),{recursive:true,force:true});createWorkflowRegistrationV37G3A({projectRoot:PROJECT_ROOT,dataRoot,caseId:ids[0]!,workflowId,createdAt:"2026-08-20T18:30:00.000Z"});
	const semanticPath=resolve(PROJECT_ROOT,"workbench/src/contracts/v37g3a-types.ts"),semanticBytes=readFileSync(semanticPath,"utf8");
	try{writeFileSync(semanticPath,`${semanticBytes}\n`);assert.throws(()=>loadWorkflowRegistrationV37G3A({projectRoot:PROJECT_ROOT,dataRoot,workflowId}),/recomputation mismatch/);}finally{writeFileSync(semanticPath,semanticBytes);rmSync(resolve(PROJECT_ROOT,dataRoot),{recursive:true,force:true});}
});

test("Host paths reject hardlink, symlink and junction authority",()=>{
	const manifest=resolve(PROJECT_ROOT,"workbench/config/v37/g3a/registered-cases/manifests/v37-det-primary-pass.v2.json"),hard=resolve(PROJECT_ROOT,".runs/v37/g3a-authority-links/manifest-hardlink.json");mkdirSync(resolve(hard,".."),{recursive:true});linkSync(manifest,hard);try{assert.throws(()=>loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:PROJECT_ROOT,caseId:ids[0]!}),/ordinary singly linked/);}finally{rmSync(hard,{force:true});}
	const target=resolve(PROJECT_ROOT,".runs/v37/g3a-authority-links/target");mkdirSync(target,{recursive:true});
	for(const [name,type] of [["symlink","dir"],["junction","junction"]] as const){const link=resolve(PROJECT_ROOT,`.runs/v37/g3a-authority-links/${name}`);rmSync(link,{recursive:true,force:true});try{symlinkSync(target,link,type);}catch(error){if(name==="symlink"&&(error as NodeJS.ErrnoException).code==="EPERM")continue;throw error;}try{assert.throws(()=>createWorkflowRegistrationV37G3A({projectRoot:PROJECT_ROOT,dataRoot:`.runs/v37/g3a-authority-links/${name}`,caseId:ids[0]!,workflowId:`v37-g3a-${name}`,createdAt:"2026-08-20T18:00:00.000Z"}),/symlink|junction/);}finally{rmSync(link,{recursive:true,force:true});}}
});

test("accepted v1 artifacts remain exact and current v2 authority inventory is fixed",()=>{
	const inventory:Record<string,string>={
		"workbench/config/v37/registered-cases/registry-v1.json":"cdf3b081444f3288b38b1bdb92525b5613ab068effda3c9af7848fa31d31727b",
		"workbench/config/v37/registered-cases/registry-v2.json":"0ba5b2ee3a2e777c7184dc8ab0b77962a1accef981efb58e7e34d4089138dcde",
		"workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v1.json":"39292054a68592b5c1951e0193d428070eebc7f3700ccd6ab1f3797e2aa161c2",
		"workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.r1.json":"621efc8de7747d2d7ce8c2f780b45c271bb0b0b4dc3bbb449cf80447d1a340a3",
		"workbench/config/v37/follow-up-execution-profiles/v37-g1-det-recovery.g2.v1.json":"6820b9f8e31ee3f7a10e82a5ca7cf6d9ebae66b5a5325e7b7000cdcfbb9debb9",
		"workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v2.json":"e59a3f5997d15908728057b3677111e5b068964b6191f17e4d2c10cb5dbcbc7b",
		"workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.v2.r1.json":"f08e9f55df21128084188d1d36e3d0dbcca1bb7fce278dbccea059d96b12d5c7",
		"workbench/config/v37/follow-up-execution-profiles/v37-g1-det-recovery.g2.v2.json":"946b303a90b3454e1d9cd57dd2e60f43e2178cb8a20b487e71760493dee5b92a",
		"workbench/src/contracts/v37-types.ts":"1259913990b38cf92d34cb53b066acc5fb705c43e198655af1b8099bfcff3134",
		"workbench/src/v37/host-registry-v37.ts":"91cbdfc606bd3c1e718740511ee52cee668d25fae876f467c43ef097d6705d8a",
		"workbench/src/v37/workflow-registration-v37.ts":"615775449f6244486f40600de237e3c7ffed9b80b0e719d11ca12d2d2cceea8c",
		"workbench/src/v37/registered-recovery-v37.ts":"4f9ca29c83cc4a6f2c787fea8fee9dc3a002ac8158635de29b404aa334db250d",
		"workbench/src/v37/candidate-v37.ts":"2e72c05ba5e0e66dbcd64d4740dfbc836ebc4d4a8e7a51fd15f3969621888036",
		"workbench/src/v37/follow-up-execution-profile-v37.ts":"835c6dc9a41b7ba7bfd5fb45d06e4caa07ec3359ab082efd9860a74f64176780",
		"workbench/src/v37/registered-follow-up-v37.ts":"bc181c4079d571db867ba61daeef59347e7af4d60bf9559795c52c452fa5f6f4",
		"workbench/src/inspect-v37g1.ts":"52aa75137b96e743660875b6efb7a1d4f680e0c8847991c9187c3b5a81f05c89",
		"workbench/src/inspect-v37g2.ts":"187f70395b893a2e130f6856fe2b266c74fa9745e42c7229d3675a5b1d9cd4a1"};
	for(const [path,expected] of Object.entries(inventory))assert.equal(fileSha256(resolve(PROJECT_ROOT,path)),expected,path);
});
