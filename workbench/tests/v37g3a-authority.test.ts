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
	const registry=JSON.parse(readFileSync(resolve(PROJECT_ROOT,"workbench/config/v37/g3a/registered-cases/registry-v1.json"),"utf8"));
	assert.deepEqual(registry.entries.map((entry:any)=>entry.case_id),ids);assert.equal(registry.entries.length,3);validateHostRegistryIndexV37G3A(registry);
	const loaded=loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:PROJECT_ROOT,caseId:ids[0]!});const prior=loaded.registry_trust_root_digest;
	assert.equal(deriveRegistryTrustRootDigestV37G3A(loaded),prior);
	assert.throws(()=>validateHostRegistryIndexV37G3A({...registry,caller_authority:true}),/exact-key/);
	const body={...registry,entries:[...registry.entries,{...structuredClone(registry.entries[2]),case_id:"v37-real-z"}]};delete body.registry_index_digest;const four={...body,registry_index_digest:digestObject(body)};assert.throws(()=>validateHostRegistryIndexV37G3A(four),/identity/);
});

test("G3B zero-access configuration loads exact real Case but grants no execution authority",async()=>{
	const loaded=loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:PROJECT_ROOT,caseId:ids[2]!});
	assert.equal(loaded.manifest.project_id,"v37-real-recovery-project");assert.equal(loaded.manifest.manifest_body_digest,"36a4cf214c0c9e3ab05764184cb7e702304ddb80e7570fa3c5af3282de8a384f");
	assert.equal(loaded.follow_up_execution_profile.follow_up_execution_profile_digest,"f139a899b4304f6f403f3077ad76857a05780f824186f308489a54f15c61c8e4");
	const budget=loaded.follow_up_execution_profile.budget_profile as unknown as Record<string,unknown>;
	const runtimeBudget={profile_id:budget.v36_runtime_budget_profile_id,provider_requests_observation_threshold:budget.provider_requests_observation_threshold,provider_requests_hard_max:budget.provider_requests_hard_max,tool_calls_hard_max:budget.tool_calls_hard_max,combined_tokens_hard_max:budget.combined_tokens_hard_max,cost_usd_hard_max:budget.cost_usd_hard_max,wall_time_ms_hard_max:budget.wall_time_ms_hard_max};
	assert.deepEqual(runtimeBudget,{profile_id:"v36_daily_bounded_edit_v2",provider_requests_observation_threshold:16,provider_requests_hard_max:24,tool_calls_hard_max:24,combined_tokens_hard_max:131072,cost_usd_hard_max:0.2,wall_time_ms_hard_max:900000});
	assert.doesNotThrow(()=>assertBoundedEditBudgetProfileV36(runtimeBudget as unknown as BoundedEditBudgetProfileV36));
	assert.deepEqual(primaryExecutionDeclarationV37G3A(loaded.manifest),{primaryMode:"fail",executionPortKind:"injected",realAccessDeclared:true,accessExpectation:{credential_reads:1,external_provider_calls:48,network_calls:48,real_model_calls:48}});
	assert.deepEqual(followUpAccessExpectationV37G3A(loaded.follow_up_execution_profile),{credential_reads:1,network_calls:24,external_provider_calls:24,real_model_calls:24});
	assert.deepEqual(constructionAuthorityDigestsV37G3A(loaded.manifest),{candidateProposalAuthorityDigest:"5356ffff6acf35fa41df96addce0e987034462d848d3cc3aeee6ac652a684054",regressionAuthorityDigest:"beb420eb73b66536501f3b242f5dc04daf5ee18c5ede5c82067a2cdbb0c9db7d"});
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
	const manifest=resolve(PROJECT_ROOT,"workbench/config/v37/g3a/registered-cases/manifests/v37-det-primary-pass.v1.json"),hard=resolve(PROJECT_ROOT,".runs/v37/g3a-authority-links/manifest-hardlink.json");mkdirSync(resolve(hard,".."),{recursive:true});linkSync(manifest,hard);try{assert.throws(()=>loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:PROJECT_ROOT,caseId:ids[0]!}),/ordinary singly linked/);}finally{rmSync(hard,{force:true});}
	const target=resolve(PROJECT_ROOT,".runs/v37/g3a-authority-links/target");mkdirSync(target,{recursive:true});
	for(const [name,type] of [["symlink","dir"],["junction","junction"]] as const){const link=resolve(PROJECT_ROOT,`.runs/v37/g3a-authority-links/${name}`);rmSync(link,{recursive:true,force:true});try{symlinkSync(target,link,type);}catch(error){if(name==="symlink"&&(error as NodeJS.ErrnoException).code==="EPERM")continue;throw error;}try{assert.throws(()=>createWorkflowRegistrationV37G3A({projectRoot:PROJECT_ROOT,dataRoot:`.runs/v37/g3a-authority-links/${name}`,caseId:ids[0]!,workflowId:`v37-g3a-${name}`,createdAt:"2026-08-20T18:00:00.000Z"}),/symlink|junction/);}finally{rmSync(link,{recursive:true,force:true});}}
});

test("registered configuration byte inventory remains exact",()=>{
	const inventory:Record<string,string>={
		"workbench/config/v37/registered-cases/registry-v1.json":"280378885f44bf24cbeeb2651e17fc27f5d871551e36c20dcb2f2c297c67b021",
		"workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v1.json":"b01068f0218be54440ebd80532b080c5f591ca53a64630bed260b66940d69853",
		"workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.r1.json":"16f078f6adb90650f3a04e62ac615232ee35999045ecea6d0c306ba54be1c561",
		"workbench/config/v37/follow-up-execution-profiles/v37-g1-det-recovery.g2.v1.json":"d6e95e73ae2c1bd6a6ce4904696e1576831318204bb5dfd4f4e2c55e205eef48",
		"workbench/src/contracts/v37-types.ts":"df4c46a90377723cdd0d968b703bbeff6b013825783be7a6581aa40657785bd3",
		"workbench/src/v37/host-registry-v37.ts":"9c837ada3ef20b48764b00b6ec95966de646691d76723f553ab849d4da9fa79b",
		"workbench/src/v37/workflow-registration-v37.ts":"615775449f6244486f40600de237e3c7ffed9b80b0e719d11ca12d2d2cceea8c",
		"workbench/src/v37/registered-recovery-v37.ts":"4f9ca29c83cc4a6f2c787fea8fee9dc3a002ac8158635de29b404aa334db250d",
		"workbench/src/v37/candidate-v37.ts":"2e72c05ba5e0e66dbcd64d4740dfbc836ebc4d4a8e7a51fd15f3969621888036",
		"workbench/src/v37/follow-up-execution-profile-v37.ts":"f9d6db8b165ab8804c2bbca99cd4732dd59792beaa3042f474599f333c7f142f",
		"workbench/src/v37/registered-follow-up-v37.ts":"bc181c4079d571db867ba61daeef59347e7af4d60bf9559795c52c452fa5f6f4",
		"workbench/src/inspect-v37g1.ts":"52aa75137b96e743660875b6efb7a1d4f680e0c8847991c9187c3b5a81f05c89",
		"workbench/src/inspect-v37g2.ts":"187f70395b893a2e130f6856fe2b266c74fa9745e42c7229d3675a5b1d9cd4a1"};
	for(const [path,expected] of Object.entries(inventory))assert.equal(fileSha256(resolve(PROJECT_ROOT,path)),expected,path);
});
