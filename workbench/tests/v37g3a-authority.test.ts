import assert from "node:assert/strict";
import { linkSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { digestObject, fileSha256 } from "../src/hash.ts";
import { V37_G3A_LOADER_CONTRACT_ID, V37_G3A_LOADER_SOURCE_INVENTORY, V37_G3A_REGISTRY_LOCATION, deriveRegistryTrustRootDigestV37G3A, loadRegisteredCaseFromHostRegistryV37G3A, loaderContractFingerprintV37G3A, validateHostRegistryIndexV37G3A } from "../src/v37/host-registry-v37g3a.ts";
import { PROJECT_ROOT } from "./helpers.ts";
import { createWorkflowRegistrationV37G3A, loadWorkflowRegistrationV37G3A } from "../src/v37/workflow-registration-v37g3a.ts";

const ids=["v37-det-primary-pass","v37-det-recovery-promote-retain"];
test("G3A registry is exact, canonical, bounded and per-entry stable",()=>{
	const registry=JSON.parse(readFileSync(resolve(PROJECT_ROOT,"workbench/config/v37/g3a/registered-cases/registry-v1.json"),"utf8"));
	assert.deepEqual(registry.entries.map((entry:any)=>entry.case_id),ids);assert.equal(registry.entries.length,2);validateHostRegistryIndexV37G3A(registry);
	const loaded=loadRegisteredCaseFromHostRegistryV37G3A({projectRoot:PROJECT_ROOT,caseId:ids[0]!});const prior=loaded.registry_trust_root_digest;
	const extra={...structuredClone(registry.entries[1]),case_id:"v37-real-later-reviewed",manifest_location:"workbench/config/v37/g3a/registered-cases/manifests/later.json"};
	const body={...registry,entries:[...registry.entries,extra]};delete body.registry_index_digest;const appended={...body,registry_index_digest:digestObject(body)};validateHostRegistryIndexV37G3A(appended);
	assert.equal(deriveRegistryTrustRootDigestV37G3A(loaded),prior);
	assert.throws(()=>validateHostRegistryIndexV37G3A({...registry,caller_authority:true}),/exact-key/);
	const four={...body,entries:[...body.entries,{...extra,case_id:"v37-real-z"}],registry_index_digest:"0".repeat(64)};assert.throws(()=>validateHostRegistryIndexV37G3A(four),/identity/);
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

test("accepted v1 byte inventory remains exact",()=>{
	const inventory:Record<string,string>={
		"workbench/config/v37/registered-cases/registry-v1.json":"cdf3b081444f3288b38b1bdb92525b5613ab068effda3c9af7848fa31d31727b",
		"workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v1.json":"39292054a68592b5c1951e0193d428070eebc7f3700ccd6ab1f3797e2aa161c2",
		"workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.r1.json":"621efc8de7747d2d7ce8c2f780b45c271bb0b0b4dc3bbb449cf80447d1a340a3",
		"workbench/config/v37/follow-up-execution-profiles/v37-g1-det-recovery.g2.v1.json":"6820b9f8e31ee3f7a10e82a5ca7cf6d9ebae66b5a5325e7b7000cdcfbb9debb9",
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
