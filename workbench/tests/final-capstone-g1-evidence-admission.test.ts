import assert from "node:assert/strict";
import { cpSync, linkSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import type { TaskSpecV0B } from "../src/contracts/v0b-types.ts";
import type { TrustedEvidenceHostRegistrationG1, TrustedEvidenceSourceG1 } from "../src/contracts/final-capstone-g1-types.ts";
import type { ActiveStateIdentityV3 } from "../src/contracts/v3g2-types.ts";
import type { RefinementCandidateV3, StagedHarnessStateV3 } from "../src/contracts/v3-types.ts";
import { digestObject, fileSha256, sha256, stableJson, treeDigest } from "../src/hash.ts";
import { inspectTrustedEvidenceAdmissionG1 } from "../src/inspect-final-capstone-g1.ts";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_SHA256 } from "../src/prompts/base.ts";
import { GOAL3_BUDGET_PROFILE_DIGEST_V3, GOAL3_BUDGET_PROFILE_V3, GOAL3_FAUX_PROVIDER_PROFILE_V3, goal3ToolProfileDigestV3 } from "../src/pi/runtime-profile-v3.ts";
import { admitCandidateV3, freezeAdmissionRegistryV3 } from "../src/refinement/admission-v3.ts";
import { executeSymmetricValidationV3, type FauxValidationPortV3 } from "../src/refinement/comparator-v3.ts";
import { admitTrustedEvidenceG1, deriveTrustedEvidenceAdmissionG1, inspectorIdentityG1 } from "../src/refinement/evidence-admission-g1.ts";
import { executeRunV2A } from "../src/run-v2.ts";
import { executeGoal3RunV3 } from "../src/run-v3.ts";
import { freezeRunBindingV3 } from "../src/state/binding-v3.ts";
import { buildBindingContextFromCaseAuthorityV3, freezeGoal3CaseAuthorityV3 } from "../src/state/case-authority-v3.ts";
import { stageCandidateStateV3 } from "../src/state/staging-v3.ts";
import { applyValidationDecisionV3, initializeStateStoreV3 } from "../src/state/store-v3.ts";

const PROJECT_ROOT = resolve(import.meta.dirname, "../..");
const G1_ROOT = resolve(PROJECT_ROOT, ".runs/final-capstone/g1");
const ADMISSION_ROOT = resolve(G1_ROOT, "admissions");
const REGISTRATION_ROOT = resolve(G1_ROOT, "host-registrations");
const HISTORICAL_ROOT = "D:/AI/AI_Projects/project2";
const FIXTURE_ROOT = resolve(PROJECT_ROOT, "fixtures/v3");
const PROJECT_ID = "final-capstone-g1-project";
const V3_PROJECT_ID = "final-capstone-g1-v3-project";
const PASS_RUN_ID = "run-022f93ce-b598-4cad-8e9c-c85719bf33a8";
const FAIL_RUN_ID = "run-015c48b5-5bae-44b1-b81a-f75c05077672";
const TASK_PROMPT = "Inspect the bounded workspace and report completion without changing protected files.";

let passRegistration = "";
let failRegistration = "";
let v2Registration = "";
let v3Registration = "";
let passAdmissionId = "";
let failAdmissionId = "";
let v2AdmissionId = "";
let v3AdmissionId = "";
let v3UnboundSource: TrustedEvidenceSourceG1 | null = null;

function rel(path: string): string {
	return path.slice(PROJECT_ROOT.length + 1).replaceAll("\\", "/");
}

function hostRegistration(registrationId: string, projectId: string, source: TrustedEvidenceSourceG1, taskKind: string, failureFamily: string | null): TrustedEvidenceHostRegistrationG1 {
	const body: Omit<TrustedEvidenceHostRegistrationG1, "registration_digest"> = {
		schema_version: 1,
		registration_id: registrationId,
		project_id: projectId,
		source,
		trusted_task_context: { task_kind: taskKind, failure_family: failureFamily },
		expected_inspector: inspectorIdentityG1(PROJECT_ROOT, source),
	};
	return { ...body, registration_digest: digestObject(body) };
}

function plainHostAuthorization(registration: TrustedEvidenceHostRegistrationG1, authorizationId = `authorization-${registration.registration_id}`) {
	return {
		schema_version: 1,
		authorization_id: authorizationId,
		project_id: registration.project_id,
		approved_registration_id: registration.registration_id,
		approved_registration_digest: registration.registration_digest,
		authority: "host_control_plane",
		adaptation_eligible: true,
		policy_id: "final-capstone-g1-trusted-evidence-admission-v1",
	};
}

function writeRegistration(value: TrustedEvidenceHostRegistrationG1): string {
	const path = resolve(REGISTRATION_ROOT, `${value.registration_id}.json`);
	writeFileSync(path, `${stableJson(value)}\n`, { flag: "wx" });
	return rel(path);
}

function cloneRegistration(value: TrustedEvidenceHostRegistrationG1, id: string, source = value.source): TrustedEvidenceHostRegistrationG1 {
	return hostRegistration(id, value.project_id, source, value.trusted_task_context.task_kind, value.trusted_task_context.failure_family);
}

function deriveRegistered(registration: TrustedEvidenceHostRegistrationG1, expectedProjectId = registration.project_id) {
	return deriveTrustedEvidenceAdmissionG1({ projectRoot: PROJECT_ROOT, expectedProjectId, registration });
}

function verifierSource(root: string, verifierId: string, target: "subject" | "protected"): string {
	const path = resolve(root, `${verifierId}.mjs`);
	const file = target === "subject" ? "subject.txt" : "protected.txt";
	const expected = target === "subject" ? "fixed\n" : "protected-stable\n";
	writeFileSync(path, `import { readFileSync } from "node:fs";\nimport { resolve } from "node:path";\nconst root = process.env.V0B_WORKSPACE;\nconst passed = typeof root === "string" && readFileSync(resolve(root, ${JSON.stringify(file)}), "utf8") === ${JSON.stringify(expected)};\nconsole.log(JSON.stringify({schema_version:1,verifier_id:${JSON.stringify(verifierId)},status:passed?"passed":"failed",summary:passed?"passed":"failed",...(passed?{}:{failed_checks:[${JSON.stringify(target)}]})}));\nprocess.exit(passed?0:1);\n`);
	return path;
}

function taskSpec(workspace: string, verifierId: string, sourcePath: string): TaskSpecV0B {
	return {
		schema_version: 1,
		task_id: `g1-${verifierId}`,
		instruction_ref: "g1-frozen-instruction",
		instruction_sha256: sha256("execute bounded Goal 1 V3 case"),
		workspace_source_ref: workspace,
		workspace_source_digest: treeDigest(workspace),
		writable_paths: ["subject.txt"],
		protected_paths: ["protected.txt"],
		verifier_id: verifierId,
		verifier_ref: sourcePath,
		verifier_sha256: fileSha256(sourcePath),
		acceptance_visibility: "hidden_external",
		tool_profile_id: "v3g3_bounded_local",
		command_descriptors: [],
		verifier_command: { executable: "current_node_executable", argv: [sourcePath], cwd: "project", timeout_ms: 5_000, output_limit_bytes: 8_192 },
	};
}

function activeIdentity(value: { binding_revision: number; state_version: number; state_digest: string }): ActiveStateIdentityV3 {
	return { binding_revision: value.binding_revision, state_version: value.state_version, state_digest: value.state_digest };
}

async function generateV3Bundle(name: "v3-bound" | "v3-unbound", promoted: boolean): Promise<TrustedEvidenceSourceG1> {
	const bundle = resolve(G1_ROOT, `sources/${name}`);
	const stateRoot = resolve(bundle, "state");
	const registryRoot = resolve(bundle, "candidate-admission-registry");
	const agentWorkspace = resolve(bundle, "agent-workspace");
	mkdirSync(agentWorkspace, { recursive: true });
	mkdirSync(registryRoot, { recursive: true });
	const initialized = await initializeStateStoreV3({ stateRoot, projectId: V3_PROJECT_ID, agentWorkspaceRoot: agentWorkspace, acceptedBaseRoots: [resolve(PROJECT_ROOT, "workbench/src/prompts/base.ts")], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	if (promoted) {
		const sourceCandidate = JSON.parse(readFileSync(resolve(FIXTURE_ROOT, "goal1-real-candidate.json"), "utf8")) as RefinementCandidateV3;
		const sourceState = JSON.parse(readFileSync(resolve(FIXTURE_ROOT, "goal1-real-staged-state.json"), "utf8")) as StagedHarnessStateV3;
		const targetActive = activeIdentity(initialized.active);
		const admitted = admitCandidateV3({ admissionRoot: resolve(bundle, "candidate-admissions"), projectId: V3_PROJECT_ID, sourceCandidate, sourceState, targetActive });
		freezeAdmissionRegistryV3({ registryRoot, projectRoot: PROJECT_ROOT, projectId: V3_PROJECT_ID, admissionPaths: [admitted.path] });
		const stagedRoot = resolve(bundle, "staged");
		const staged = await stageCandidateStateV3({ candidate: admitted.admittedCandidate, stateRoot: stagedRoot, agentWorkspaceRoot: agentWorkspace, acceptedBaseRoots: [FIXTURE_ROOT], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
		const validationWorkspace = resolve(bundle, "validation-workspace"); mkdirSync(validationWorkspace);
		writeFileSync(resolve(validationWorkspace, "subject.txt"), "broken\n"); writeFileSync(resolve(validationWorkspace, "protected.txt"), "protected-stable\n");
		const verifierPath = verifierSource(bundle, "g1-v3-promotion-verifier", "subject");
		const regressionPath = verifierSource(bundle, "g1-v3-promotion-regression", "protected");
		const verifierTask = taskSpec(validationWorkspace, "g1-v3-promotion-verifier", verifierPath);
		const regressionTask = taskSpec(validationWorkspace, "g1-v3-promotion-regression", regressionPath);
		const port: FauxValidationPortV3 = { execute: async ({ state, workspaceRoot }) => {
			if (state.status === "staged_inactive") writeFileSync(resolve(workspaceRoot, "subject.txt"), "fixed\n");
			return { settled: true, events: [] };
		} };
		const validationRoot = resolve(bundle, "validation");
		const validation = await executeSymmetricValidationV3({ projectRoot: PROJECT_ROOT, runRoot: validationRoot, validationId: "g1-v3-promote", projectId: V3_PROJECT_ID, sourceWorkspaceRoot: validationWorkspace, task: verifierTask, verifier: { task: verifierTask, sourcePath: verifierPath }, regressions: [{ task: regressionTask, sourcePath: regressionPath }], baseState: initialized.version, candidateState: staged.state, providerModelProfileDigest: sha256("g1-public-emitted-faux"), toolProfileDigest: sha256("g1-v3-bounded-local"), budgetDigest: sha256("g1-zero-real-bounded"), hardConstraintsDigest: sha256("g1-authority-frozen"), port });
		const applied = await applyValidationDecisionV3({ stateRoot, projectId: V3_PROJECT_ID, runRoot: validationRoot, validationRef: validation.validationRef, stagedStateRoot: stagedRoot, candidateStateDigest: staged.state.state_digest, expectedActive: targetActive, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
		assert.equal(applied.decision.result, "promoted"); assert.ok(applied.version); assert.equal(applied.active.state_version > 0, true);
	}
	const workspace = resolve(bundle, "followup-workspace"); mkdirSync(workspace);
	writeFileSync(resolve(workspace, "subject.txt"), "fixed\n"); writeFileSync(resolve(workspace, "protected.txt"), "protected-stable\n");
	const label = promoted ? "g1-v3-bound-followup" : "g1-v3-unbound-followup";
	const verifierId = `${label}-verifier`;
	const verifierPath = verifierSource(bundle, verifierId, "protected");
	const task = taskSpec(workspace, verifierId, verifierPath);
	const failureLineage = promoted ? { source_run_id: "g1-trusted-prior-run", failure_family: "verifier-failure", lineage_digest: digestObject({ source_run_id: "g1-trusted-prior-run", failure_family: "verifier-failure" }) } : null;
	const authority = freezeGoal3CaseAuthorityV3({
		authorityRoot: resolve(bundle, "case-authority"),
		projectId: V3_PROJECT_ID,
		taskId: task.task_id,
		caseId: label,
		taskKind: "typescript-maintenance",
		allowedFailureLineage: failureLineage,
		taskPromptSha256: sha256(TASK_PROMPT),
		verifierId: task.verifier_id,
		verifierSha256: task.verifier_sha256,
		toolProfileId: task.tool_profile_id,
		toolProfileDigest: goal3ToolProfileDigestV3(task),
		budgetProfileId: GOAL3_BUDGET_PROFILE_V3.profile_id,
		budgetProfileDigest: GOAL3_BUDGET_PROFILE_DIGEST_V3,
		providerProfile: GOAL3_FAUX_PROVIDER_PROFILE_V3,
	});
	const runRoot = resolve(bundle, "run"); mkdirSync(runRoot);
	const frozen = await freezeRunBindingV3({ projectRoot: PROJECT_ROOT, stateRoot, admissionRegistryRoot: registryRoot, caseAuthorityPath: authority.path, runRoot, projectId: V3_PROJECT_ID, context: buildBindingContextFromCaseAuthorityV3(authority.authority), immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	await executeGoal3RunV3({ projectRoot: PROJECT_ROOT, runRoot, runId: label, caseId: label, caseAuthorityPath: authority.path, workspaceRoot: workspace, taskPrompt: TASK_PROMPT, taskPolicy: task, verifierTask: task, verifierSourcePath: verifierPath, frozen });
	return { family: "v3g3_bound_state_followup", bundle_root: rel(bundle), run_root: "run", state_root: "state", candidate_admission_registry_root: "candidate-admission-registry", case_authority_path: `case-authority/${label}.json`, immutable_base_prompt: SYSTEM_PROMPT, immutable_base_prompt_sha256: SYSTEM_PROMPT_SHA256 };
}

test.before(async () => {
	assert.equal(resolve(G1_ROOT).startsWith(resolve(PROJECT_ROOT, ".runs") + "\\"), true);
	rmSync(G1_ROOT, { recursive: true, force: true });
	mkdirSync(ADMISSION_ROOT, { recursive: true });
	mkdirSync(REGISTRATION_ROOT, { recursive: true });
	const v0Project = resolve(G1_ROOT, "sources/v0-project");
	const passTarget = resolve(v0Project, `.runs/v0-b/runs/${PASS_RUN_ID}`);
	const failTarget = resolve(v0Project, `.runs/v0-c/runs/${FAIL_RUN_ID}`);
	mkdirSync(resolve(passTarget, ".."), { recursive: true });
	mkdirSync(resolve(failTarget, ".."), { recursive: true });
	cpSync(resolve(HISTORICAL_ROOT, `.runs/v0-b/runs/${PASS_RUN_ID}`), passTarget, { recursive: true });
	cpSync(resolve(HISTORICAL_ROOT, `.runs/v0-c/runs/${FAIL_RUN_ID}`), failTarget, { recursive: true });
	const passSource: TrustedEvidenceSourceG1 = { family: "verifier_backed", generation: "v0b", source_project_root: rel(v0Project), run_id: PASS_RUN_ID };
	const failSource: TrustedEvidenceSourceG1 = { family: "verifier_backed", generation: "v0c", source_project_root: rel(v0Project), run_id: FAIL_RUN_ID };
	const pass = hostRegistration("g1-host-v0-pass", PROJECT_ID, passSource, "typescript-maintenance", null);
	passRegistration = writeRegistration(pass);
	const fail = hostRegistration("g1-host-v0-fail", PROJECT_ID, failSource, "typescript-maintenance", "verifier-failure");
	failRegistration = writeRegistration(fail);
	const v2Run = resolve(G1_ROOT, "sources/v2-recovery");
	await executeRunV2A({ projectRoot: PROJECT_ROOT, runRoot: v2Run, runId: "g1-v2-recovery-comparison", primaryMode: "fail", candidateModes: ["pass", "pass"] });
	const v2Source: TrustedEvidenceSourceG1 = { family: "v2a_recovery_comparison", run_root: rel(v2Run) };
	const v2 = hostRegistration("g1-host-v2", PROJECT_ID, v2Source, "typescript-maintenance", "recovery-comparison");
	v2Registration = writeRegistration(v2);
	const v3Source = await generateV3Bundle("v3-bound", true);
	const v3 = hostRegistration("g1-host-v3", V3_PROJECT_ID, v3Source, "typescript-maintenance", "verifier-failure");
	v3Registration = writeRegistration(v3);
	v3UnboundSource = await generateV3Bundle("v3-unbound", false);
});

test("verifier-backed PASS admits deterministically and valid non-trigger evidence yields no_opportunity", async () => {
	const first = await admitTrustedEvidenceG1({ projectRoot: PROJECT_ROOT, admissionRoot: rel(ADMISSION_ROOT), registrationPath: passRegistration, expectedProjectId: PROJECT_ID });
	const second = await admitTrustedEvidenceG1({ projectRoot: PROJECT_ROOT, admissionRoot: rel(ADMISSION_ROOT), registrationPath: passRegistration, expectedProjectId: PROJECT_ID });
	passAdmissionId = first.record.admission_id;
	assert.equal(first.record.frozen_evidence.outcome.status, "passed");
	assert.equal(first.record.frozen_evidence.outcome.verifier_status, "passed");
	assert.equal(first.record.projector_result, "no_opportunity");
	assert.equal(second.idempotent_existing, true);
	assert.equal(second.record.admission_digest, first.record.admission_digest);
	assert.deepEqual(first.record.host_eligibility, {
		schema_version: 1,
		approval_id: "fixed-approval-g1-host-v0-pass",
		project_id: PROJECT_ID,
		approved_registration_id: "g1-host-v0-pass",
		approved_registration_digest: "bb20f847ebace33b73d9f5fe51bbf5055f6b92cbd23c03a8a6dcd8b118383156",
		authority: "host_fixed_approval",
		adaptation_eligible: true,
		policy_id: "final-capstone-g1-trusted-evidence-admission-v1",
	});
});

test("verifier-backed FAIL admits and unchanged V3 projector produces hard_failure Opportunity", async () => {
	const result = await admitTrustedEvidenceG1({ projectRoot: PROJECT_ROOT, admissionRoot: rel(ADMISSION_ROOT), registrationPath: failRegistration, expectedProjectId: PROJECT_ID });
	failAdmissionId = result.record.admission_id;
	assert.equal(result.record.frozen_evidence.outcome.status, "failed");
	assert.equal(result.record.frozen_evidence.validity.attribution, "agent");
	assert.notEqual(result.record.projector_result, "no_opportunity");
	if (result.record.projector_result !== "no_opportunity") assert.equal(result.record.projector_result.trigger, "hard_failure");
});

test("V2 Recovery/Comparison freezes both arms, common Verifier, selection, and no-opportunity projection", async () => {
	const result = await admitTrustedEvidenceG1({ projectRoot: PROJECT_ROOT, admissionRoot: rel(ADMISSION_ROOT), registrationPath: v2Registration, expectedProjectId: PROJECT_ID });
	v2AdmissionId = result.record.admission_id;
	const terminal = result.record.provenance.terminal as { run_id: string };
	const candidatePaths = result.record.provenance.candidate_paths as Array<{ candidate_path_id: string; hard_gates: Record<string, boolean>; common_artifact_digest: string }>;
	assert.deepEqual(result.record.source_run_ids, [terminal.run_id]);
	assert.deepEqual(result.record.frozen_evidence.source_run_ids, [terminal.run_id]);
	assert.equal(candidatePaths.length, 2);
	assert.equal(candidatePaths.every((candidate) => !result.record.source_run_ids.includes(candidate.candidate_path_id)), true);
	assert.equal(candidatePaths.every((candidate) => Object.keys(candidate.hard_gates).length > 0), true);
	assert.equal(new Set(candidatePaths.map((candidate) => candidate.common_artifact_digest)).size, 1);
	assert.equal(typeof (result.record.provenance.selection as { selected_candidate_id: string }).selected_candidate_id, "string");
	assert.equal(result.record.frozen_evidence.comparison, undefined);
	assert.equal(result.record.provenance.frozen_evidence_comparison, "omitted_candidate_paths_are_not_peer_runs");
	assert.equal(result.record.projector_result, "no_opportunity");
});

test("V3 Goal 3 follow-up freezes exact promoted State, applicable binding, promotion lineage, and Case Authority identity", async () => {
	const result = await admitTrustedEvidenceG1({ projectRoot: PROJECT_ROOT, admissionRoot: rel(ADMISSION_ROOT), registrationPath: v3Registration, expectedProjectId: V3_PROJECT_ID });
	v3AdmissionId = result.record.admission_id;
	const state = result.record.provenance.state as { active_state_version: number; active_state_digest: string; active_decision_id: string };
	const binding = result.record.provenance.binding as { binding_digest: string; bound_entries: Array<{ kind: string }>; lineage: { decision_id: string; decision_digest: string; version_digest: string; admission_digest: string | null } | null };
	const manifest = result.record.provenance.manifest as { runtime_path: string; case_authority_digest: string };
	assert.equal(state.active_state_version > 0, true);
	assert.match(state.active_state_digest, /^[a-f0-9]{64}$/);
	assert.match(binding.binding_digest, /^[a-f0-9]{64}$/);
	assert.equal(binding.bound_entries.length > 0, true);
	assert.equal(binding.bound_entries.some((entry) => entry.kind === "prompt_addendum"), true);
	assert.ok(binding.lineage);
	assert.equal(binding.lineage.version_digest, state.active_state_digest);
	assert.equal(binding.lineage.decision_id, state.active_decision_id);
	assert.match(binding.lineage.decision_digest, /^[a-f0-9]{64}$/);
	assert.match(String(binding.lineage.admission_digest), /^[a-f0-9]{64}$/);
	assert.equal(manifest.runtime_path, "prompt_addendum");
	assert.equal(manifest.case_authority_digest, result.record.provenance.case_authority_digest);
	assert.match(String(result.record.provenance.case_authority_digest), /^[a-f0-9]{64}$/);
});

test("admission writes only its immutable admission record and leaves Source, State, pointer, Workspace, and accepted source unchanged", async () => {
	const sourceProject = resolve(G1_ROOT, "sources/v0-project");
	const v2Run = resolve(G1_ROOT, "sources/v2-recovery");
	const v3Bundle = resolve(G1_ROOT, "sources/v3-bound");
	const before = { v0: treeDigest(sourceProject), v2: treeDigest(v2Run), v3: treeDigest(v3Bundle), accepted: treeDigest(resolve(PROJECT_ROOT, "workbench/src")) };
	const original: TrustedEvidenceHostRegistrationG1 = JSON.parse(readFileSync(resolve(PROJECT_ROOT, passRegistration), "utf8"));
	const fresh = cloneRegistration(original, "g1-host-v0-pass-immutability");
	const registrationPath = writeRegistration(fresh);
	const admitted = await admitTrustedEvidenceG1({ projectRoot: PROJECT_ROOT, admissionRoot: rel(ADMISSION_ROOT), registrationPath, expectedProjectId: PROJECT_ID });
	assert.equal(admitted.idempotent_existing, false);
	assert.deepEqual({ v0: treeDigest(sourceProject), v2: treeDigest(v2Run), v3: treeDigest(v3Bundle), accepted: treeDigest(resolve(PROJECT_ROOT, "workbench/src")) }, before);
	assert.equal(resolve(admitted.record_path).startsWith(resolve(ADMISSION_ROOT) + "\\"), true);
});

test("independent Inspector reopens the process and reruns source Inspectors/recomputation", async () => {
	for (const [registrationPath, admissionId, projectId] of [[passRegistration, passAdmissionId, PROJECT_ID], [failRegistration, failAdmissionId, PROJECT_ID], [v2Registration, v2AdmissionId, PROJECT_ID], [v3Registration, v3AdmissionId, V3_PROJECT_ID]] as const) {
		const inspected = await inspectTrustedEvidenceAdmissionG1({ projectRoot: PROJECT_ROOT, admissionRoot: rel(ADMISSION_ROOT), registrationPath, admissionId, expectedProjectId: projectId });
		assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
	}
	const script = `import { inspectTrustedEvidenceAdmissionG1 as inspect } from ${JSON.stringify(new URL("../src/inspect-final-capstone-g1.ts", import.meta.url).href)}; const options=JSON.parse(process.argv[1]); const result=await inspect(options); console.log(JSON.stringify(result)); process.exit(result.integrity_valid?0:1);`;
	const options = { projectRoot: PROJECT_ROOT, admissionRoot: rel(ADMISSION_ROOT), registrationPath: passRegistration, admissionId: passAdmissionId, expectedProjectId: PROJECT_ID };
	const reopened = spawnSync(process.execPath, ["--input-type=module", "-e", script, JSON.stringify(options)], { encoding: "utf8" });
	assert.equal(reopened.status, 0, reopened.stderr);
	assert.equal(JSON.parse(reopened.stdout).integrity_valid, true);
});

test("fail-closed source integrity matrix rejects tamper, Verifier loss, nonterminal, unclosed lineage, and invalid attribution", async (t) => {
	const base: TrustedEvidenceHostRegistrationG1 = JSON.parse(readFileSync(resolve(PROJECT_ROOT, passRegistration), "utf8"));
	const sourceProject = resolve(PROJECT_ROOT, (base.source as Extract<TrustedEvidenceSourceG1, { family: "verifier_backed" }>).source_project_root);
	const sourceRun = resolve(sourceProject, `.runs/v0-b/runs/${PASS_RUN_ID}`);
	for (const item of [
		{ name: "artifact tamper", path: "outcome.json", mutate: (bytes: string) => `${bytes} ` },
		{ name: "invalid attribution", path: "outcome.json", mutate: (bytes: string) => bytes.replace('"failure_class":null', '"failure_class":"agent"') },
		{ name: "unclosed lineage", path: "journal/events.jsonl", mutate: (bytes: string) => bytes.replace(/\n[^\n]*\n?$/, "\n") },
	] as const) await t.test(item.name, async () => {
		const id = `negative-${item.name.replaceAll(" ", "-")}`;
		const cloneRoot = resolve(G1_ROOT, `negative/${id}`); cpSync(sourceProject, cloneRoot, { recursive: true });
		const path = resolve(cloneRoot, `.runs/v0-b/runs/${PASS_RUN_ID}`, item.path); writeFileSync(path, item.mutate(readFileSync(path, "utf8")));
		const source: TrustedEvidenceSourceG1 = { family: "verifier_backed", generation: "v0b", source_project_root: rel(cloneRoot), run_id: PASS_RUN_ID };
		await assert.rejects(deriveRegistered(hostRegistration(id, PROJECT_ID, source, "typescript-maintenance", null)));
	});
	await t.test("missing or invalid Verifier", async () => {
		const cloneRoot = resolve(G1_ROOT, "negative/missing-verifier"); cpSync(sourceProject, cloneRoot, { recursive: true });
		rmSync(resolve(cloneRoot, `.runs/v0-b/runs/${PASS_RUN_ID}/evidence/verifier-result.json`));
		const source: TrustedEvidenceSourceG1 = { family: "verifier_backed", generation: "v0b", source_project_root: rel(cloneRoot), run_id: PASS_RUN_ID };
		await assert.rejects(deriveRegistered(hostRegistration("negative-missing-verifier", PROJECT_ID, source, "typescript-maintenance", null)));
	});
	await t.test("uncommitted or nonterminal", async () => {
		const cloneRoot = resolve(G1_ROOT, "negative/nonterminal"); cpSync(sourceProject, cloneRoot, { recursive: true });
		rmSync(resolve(cloneRoot, `.runs/v0-b/runs/${PASS_RUN_ID}/terminal.json`));
		const source: TrustedEvidenceSourceG1 = { family: "verifier_backed", generation: "v0b", source_project_root: rel(cloneRoot), run_id: PASS_RUN_ID };
		await assert.rejects(deriveRegistered(hostRegistration("negative-nonterminal", PROJECT_ID, source, "typescript-maintenance", null)));
	});
});

test("fixed Host approval root rejects changed identity, caller grants, and caller-selected registration", async () => {
	const base: TrustedEvidenceHostRegistrationG1 = JSON.parse(readFileSync(resolve(PROJECT_ROOT, passRegistration), "utf8"));
	const cloned = cloneRegistration(base, "forged-cloned-registration");
	await assert.rejects(
		deriveRegistered(cloned),
		/Host-owned approval root does not approve this registration identity\/digest/,
	);
	const forgedBody = {
		...structuredClone(base),
		registration_id: "forged-self-authorized-registration",
		host_grant: { authority: "host", adaptation_eligible: true, policy_id: "final-capstone-g1-trusted-evidence-admission-v1" },
	};
	delete (forgedBody as Partial<TrustedEvidenceHostRegistrationG1>).registration_digest;
	const forged = { ...forgedBody, registration_digest: digestObject(forgedBody) } as unknown as TrustedEvidenceHostRegistrationG1;
	await assert.rejects(
		deriveRegistered(forged),
		/exact-key/,
	);
	const clonedPath = writeRegistration(cloned);
	await assert.rejects(
		admitTrustedEvidenceG1({ projectRoot: PROJECT_ROOT, admissionRoot: rel(ADMISSION_ROOT), registrationPath: clonedPath, expectedProjectId: PROJECT_ID }),
		/Host-owned approval root does not approve this registration identity\/digest/,
	);
	const reopened = await inspectTrustedEvidenceAdmissionG1({ projectRoot: PROJECT_ROOT, admissionRoot: rel(ADMISSION_ROOT), registrationPath: clonedPath, admissionId: passAdmissionId, expectedProjectId: PROJECT_ID });
	assert.equal(reopened.integrity_valid, false);
	assert.match(reopened.errors.join("; "), /Host-owned approval root does not approve this registration identity\/digest/);
});

test("combined registration and matching plain authorization forgery cannot cross any exported boundary", async (t) => {
	const base: TrustedEvidenceHostRegistrationG1 = JSON.parse(readFileSync(resolve(PROJECT_ROOT, passRegistration), "utf8"));
	const forged = cloneRegistration(base, "main-forged-registration-and-authorization");
	const forgedAuthorization = plainHostAuthorization(forged, "main-forged-host-authorization");
	const forgedPath = writeRegistration(forged);
	await t.test("direct derivation", async () => {
		const options = { projectRoot: PROJECT_ROOT, expectedProjectId: PROJECT_ID, registration: forged, hostAuthorization: forgedAuthorization };
		await assert.rejects(
			deriveTrustedEvidenceAdmissionG1(options),
			/Host-owned approval/,
		);
	});
	await t.test("file admission", async () => {
		const options = { projectRoot: PROJECT_ROOT, admissionRoot: rel(ADMISSION_ROOT), registrationPath: forgedPath, hostAuthorization: forgedAuthorization, expectedProjectId: PROJECT_ID };
		await assert.rejects(
			admitTrustedEvidenceG1(options),
			/Host-owned approval/,
		);
	});
	await t.test("reopen inspection", async () => {
		const options = { projectRoot: PROJECT_ROOT, admissionRoot: rel(ADMISSION_ROOT), registrationPath: forgedPath, hostAuthorization: forgedAuthorization, admissionId: passAdmissionId, expectedProjectId: PROJECT_ID };
		const inspected = await inspectTrustedEvidenceAdmissionG1(options);
		assert.equal(inspected.integrity_valid, false);
		assert.match(inspected.errors.join("; "), /Host-owned approval/);
	});
});

test("fail-closed registration authority matrix rejects cross-project, escape, stale Inspector, and unknown family/key", async () => {
	const base: TrustedEvidenceHostRegistrationG1 = JSON.parse(readFileSync(resolve(PROJECT_ROOT, passRegistration), "utf8"));
	await assert.rejects(deriveTrustedEvidenceAdmissionG1({ projectRoot: PROJECT_ROOT, expectedProjectId: "cross-project", registration: base }), /project/);
	const escape = cloneRegistration(base, "negative-escape", { ...(base.source as Extract<TrustedEvidenceSourceG1, { family: "verifier_backed" }>), source_project_root: ".." });
	await assert.rejects(deriveRegistered(escape), /project-relative|escape/);
	const stale = structuredClone(base); stale.expected_inspector.inspector_fingerprint = "0".repeat(64); const { registration_digest: _stale, ...staleBody } = stale; stale.registration_digest = digestObject(staleBody);
	await assert.rejects(deriveRegistered(stale), /stale Inspector/);
	const unknownFamily = { ...structuredClone(base), source: { family: "v36_daily", settled: true, trace: {}, change_set: {}, adaptation_eligible: true } } as unknown as TrustedEvidenceHostRegistrationG1; const { registration_digest: _unknown, ...unknownBody } = unknownFamily; unknownFamily.registration_digest = digestObject(unknownBody);
	await assert.rejects(deriveRegistered(unknownFamily), /unknown source family/);
	const unknownKey = { ...structuredClone(base), caller_validity: true }; const { registration_digest: _key, ...keyBody } = unknownKey as TrustedEvidenceHostRegistrationG1 & { caller_validity: boolean }; unknownKey.registration_digest = digestObject(keyBody);
	await assert.rejects(deriveRegistered(unknownKey), /exact-key/);
});

test("fail-closed filesystem matrix rejects junction/reparse and prohibited hardlink", async () => {
	const base: TrustedEvidenceHostRegistrationG1 = JSON.parse(readFileSync(resolve(PROJECT_ROOT, passRegistration), "utf8"));
	const source = base.source as Extract<TrustedEvidenceSourceG1, { family: "verifier_backed" }>;
	const sourceProject = resolve(PROJECT_ROOT, source.source_project_root);
	const junctionProject = resolve(G1_ROOT, "negative/junction-project"); mkdirSync(junctionProject, { recursive: true });
	symlinkSync(resolve(sourceProject, ".runs"), resolve(junctionProject, ".runs"), "junction");
	const junctionSource: TrustedEvidenceSourceG1 = { ...source, source_project_root: rel(junctionProject) };
	await assert.rejects(deriveRegistered(hostRegistration("negative-junction", PROJECT_ID, junctionSource, "typescript-maintenance", null)), /symlink|junction/);
	const hardlinkProject = resolve(G1_ROOT, "negative/hardlink-project"); cpSync(sourceProject, hardlinkProject, { recursive: true });
	const terminal = resolve(hardlinkProject, `.runs/v0-b/runs/${PASS_RUN_ID}/terminal.json`); linkSync(terminal, resolve(hardlinkProject, `.runs/v0-b/runs/${PASS_RUN_ID}/terminal-hardlink.json`));
	const hardlinkSource: TrustedEvidenceSourceG1 = { ...source, source_project_root: rel(hardlinkProject) };
	await assert.rejects(deriveRegistered(hostRegistration("negative-hardlink", PROJECT_ID, hardlinkSource, "typescript-maintenance", null)), /hardlink/);
});

test("V3 inspected version-0 Run with empty binding and null lineage is not a bound-State follow-up", async () => {
	assert.ok(v3UnboundSource);
	const source = v3UnboundSource as Extract<TrustedEvidenceSourceG1, { family: "v3g3_bound_state_followup" }>;
	const binding = JSON.parse(readFileSync(resolve(PROJECT_ROOT, source.bundle_root, source.run_root, "binding.json"), "utf8")) as { active_state_version: number; bound_entries: unknown[]; lineage: unknown };
	assert.equal(binding.active_state_version, 0);
	assert.deepEqual(binding.bound_entries, []);
	assert.equal(binding.lineage, null);
	await assert.rejects(
		deriveRegistered(hostRegistration("negative-v3-unbound", V3_PROJECT_ID, source, "typescript-maintenance", null)),
		/requires a promoted non-base State, applicable bound entry, and promotion lineage/,
	);
});

test("V3 missing or ambiguous State identity fails closed", async () => {
	const base: TrustedEvidenceHostRegistrationG1 = JSON.parse(readFileSync(resolve(PROJECT_ROOT, v3Registration), "utf8"));
	const source = base.source as Extract<TrustedEvidenceSourceG1, { family: "v3g3_bound_state_followup" }>;
	const missing = cloneRegistration(base, "negative-v3-missing-state", { ...source, state_root: "missing-state" });
	await assert.rejects(deriveRegistered(missing), /missing/);
	const ambiguous = structuredClone(base); (ambiguous as unknown as Record<string, unknown>).state_version = 0; const { registration_digest: _ambiguous, ...ambiguousBody } = ambiguous as TrustedEvidenceHostRegistrationG1 & { state_version: number }; ambiguous.registration_digest = digestObject(ambiguousBody);
	await assert.rejects(deriveRegistered(ambiguous), /exact-key/);
});

test("stored admission and embedded FrozenEvidence digest tamper are rejected", async () => {
	const path = resolve(ADMISSION_ROOT, passAdmissionId, "admission.json");
	const original = readFileSync(path, "utf8");
	const record = JSON.parse(original);
	record.frozen_evidence.evidence_digest = "0".repeat(64);
	writeFileSync(path, `${stableJson(record)}\n`);
	let inspected = await inspectTrustedEvidenceAdmissionG1({ projectRoot: PROJECT_ROOT, admissionRoot: rel(ADMISSION_ROOT), registrationPath: passRegistration, admissionId: passAdmissionId, expectedProjectId: PROJECT_ID });
	assert.equal(inspected.integrity_valid, false);
	writeFileSync(path, original);
	const admission = JSON.parse(original); admission.admission_digest = "f".repeat(64); writeFileSync(path, `${stableJson(admission)}\n`);
	inspected = await inspectTrustedEvidenceAdmissionG1({ projectRoot: PROJECT_ROOT, admissionRoot: rel(ADMISSION_ROOT), registrationPath: passRegistration, admissionId: passAdmissionId, expectedProjectId: PROJECT_ID });
	assert.equal(inspected.integrity_valid, false);
	writeFileSync(path, original);
});
