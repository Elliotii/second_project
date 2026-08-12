import assert from "node:assert/strict";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import type { TaskSpecV0B } from "../src/contracts/v0b-types.ts";
import type { TrustedEvidenceHostRegistrationG1, TrustedEvidenceSourceG1 } from "../src/contracts/final-capstone-g1-types.ts";
import type { ActiveStateIdentityV3, FauxExecutionEventV3, HarnessStateVersionV3 } from "../src/contracts/v3g2-types.ts";
import type { ImprovementOpportunityV3, RefinementCandidateV3, StagedHarnessStateV3 } from "../src/contracts/v3-types.ts";
import { artifactRef, writeOnceBytes } from "../src/evidence/artifacts.ts";
import { digestObject, fileSha256, sha256, stableJson, treeDigest } from "../src/hash.ts";
import { inspectFinalCapstoneG2 } from "../src/inspect-final-capstone-g2.ts";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_SHA256 } from "../src/prompts/base.ts";
import { GOAL3_BUDGET_PROFILE_DIGEST_V3, GOAL3_BUDGET_PROFILE_V3, GOAL3_FAUX_PROVIDER_PROFILE_V3, goal3ToolProfileDigestV3 } from "../src/pi/runtime-profile-v3.ts";
import { admitCandidateV3, freezeAdmissionRegistryV3 } from "../src/refinement/admission-v3.ts";
import { executeSymmetricValidationV3, type FauxValidationPortV3, type LocalCheckV3 } from "../src/refinement/comparator-v3.ts";
import { admitTrustedEvidenceG1, inspectorIdentityG1 } from "../src/refinement/evidence-admission-g1.ts";
import { deterministicFixtureProposalV3, validateProposalAndBuildCandidateV3 } from "../src/refinement/producer-v3.ts";
import {
	executeAcceptedStateRegressionComparisonG2,
	executeRegressionGatedCandidatePublicationG2,
	inspectAcceptedStateRegressionComparisonG2,
	inspectRegressionGatedValidationG2,
} from "../src/refinement/regression-gate-g2.ts";
import { executeGoal3RunV3 } from "../src/run-v3.ts";
import { freezeRunBindingV3 } from "../src/state/binding-v3.ts";
import { buildBindingContextFromCaseAuthorityV3, freezeGoal3CaseAuthorityV3 } from "../src/state/case-authority-v3.ts";
import { stageCandidateStateV3 } from "../src/state/staging-v3.ts";
import { applyAssessedRollbackG2, persistStateAssessmentG2, type StateAssessmentContextG2 } from "../src/state/state-feedback-g2.ts";
import { applyValidationDecisionV3, initializeStateStoreV3, inspectStateStoreV3 } from "../src/state/store-v3.ts";

const PROJECT_ROOT = resolve(import.meta.dirname, "../..");
const G1_ROOT = resolve(PROJECT_ROOT, ".runs/final-capstone/g1");
const G2_ROOT = resolve(PROJECT_ROOT, ".runs/final-capstone/g2/test-cases");
const HISTORICAL_ROOT = "D:/AI/AI_Projects/project2";
const BASE_PATH = resolve(PROJECT_ROOT, "workbench/src/prompts/base.ts");
const PROJECT_ID = "final-capstone-g1-v3-project";
const TRIGGER_PROJECT_ID = "final-capstone-g1-project";
const PASS_RUN_ID = "run-022f93ce-b598-4cad-8e9c-c85719bf33a8";
const FAIL_RUN_ID = "run-015c48b5-5bae-44b1-b81a-f75c05077672";
const TASK_PROMPT = "Inspect the bounded workspace and report completion without changing protected files.";
const PROFILE = {
	providerModelProfileDigest: sha256("final-capstone-g2-public-faux"),
	toolProfileDigest: sha256("final-capstone-g2-bounded-local"),
	budgetDigest: sha256("final-capstone-g2-zero-real-bounded"),
	hardConstraintsDigest: sha256("final-capstone-g2-authority-frozen"),
};

type TriggerAdmission = { admissionRoot: string; registrationPath: string; admissionId: string; projectId: string };
type Sequence = {
	root: string;
	projectId: string;
	stateRoot: string;
	registryRoot: string;
	workspace: string;
	primary: LocalCheckV3;
	trigger: TriggerAdmission;
	promotionRunRoot: string;
	promotion: { applied: Awaited<ReturnType<typeof applyValidationDecisionV3>>; selection?: Awaited<ReturnType<typeof executeRegressionGatedCandidatePublicationG2>>["selection"] };
	initialActive: ActiveStateIdentityV3;
	promotedActive: ActiveStateIdentityV3;
};

function rel(path: string): string { return path.slice(PROJECT_ROOT.length + 1).replaceAll("\\", "/"); }
function active(value: { binding_revision: number; state_version: number; state_digest: string }): ActiveStateIdentityV3 { return { binding_revision: value.binding_revision, state_version: value.state_version, state_digest: value.state_digest }; }

function hostRegistration(registrationId: string, projectId: string, source: TrustedEvidenceSourceG1, taskKind: string, failureFamily: string | null): TrustedEvidenceHostRegistrationG1 {
	const body: Omit<TrustedEvidenceHostRegistrationG1, "registration_digest"> = { schema_version: 1, registration_id: registrationId, project_id: projectId, source, trusted_task_context: { task_kind: taskKind, failure_family: failureFamily }, expected_inspector: inspectorIdentityG1(PROJECT_ROOT, source) };
	return { ...body, registration_digest: digestObject(body) };
}

function writeRegistration(value: TrustedEvidenceHostRegistrationG1): string {
	const root = resolve(G1_ROOT, "host-registrations"); mkdirSync(root, { recursive: true }); const path = resolve(root, `${value.registration_id}.json`); writeFileSync(path, `${stableJson(value)}\n`); return rel(path);
}

async function triggerAdmission(kind: "failed" | "passed"): Promise<TriggerAdmission> {
	mkdirSync(resolve(G1_ROOT, "admissions"), { recursive: true });
	const sourceProject = resolve(G1_ROOT, "sources/v0-project");
	const runId = kind === "failed" ? FAIL_RUN_ID : PASS_RUN_ID;
	const generation = kind === "failed" ? "v0c" : "v0b";
	const target = resolve(sourceProject, `.runs/${generation === "v0c" ? "v0-c" : "v0-b"}/runs/${runId}`);
	mkdirSync(resolve(target, ".."), { recursive: true });
	cpSync(resolve(HISTORICAL_ROOT, `.runs/${generation === "v0c" ? "v0-c" : "v0-b"}/runs/${runId}`), target, { recursive: true });
	const source: TrustedEvidenceSourceG1 = { family: "verifier_backed", generation, source_project_root: rel(sourceProject), run_id: runId };
	const registration = hostRegistration(kind === "failed" ? "g1-host-v0-fail" : "g1-host-v0-pass", TRIGGER_PROJECT_ID, source, "typescript-maintenance", kind === "failed" ? "verifier-failure" : null);
	const registrationPath = writeRegistration(registration);
	const admitted = await admitTrustedEvidenceG1({ projectRoot: PROJECT_ROOT, admissionRoot: rel(resolve(G1_ROOT, "admissions")), registrationPath, expectedProjectId: TRIGGER_PROJECT_ID });
	return { admissionRoot: rel(resolve(G1_ROOT, "admissions")), registrationPath, admissionId: admitted.record.admission_id, projectId: TRIGGER_PROJECT_ID };
}

function verifierSource(root: string, verifierId: string, target: "subject" | "protected"): string {
	const path = resolve(root, `${verifierId}.mjs`); const file = target === "subject" ? "subject.txt" : "protected.txt"; const expected = target === "subject" ? "fixed\n" : "protected-stable\n";
	writeFileSync(path, `import { readFileSync } from "node:fs";\nimport { resolve } from "node:path";\nconst root=process.env.V0B_WORKSPACE;\nlet passed=false;\ntry{passed=typeof root==="string"&&readFileSync(resolve(root,${JSON.stringify(file)}),"utf8")===${JSON.stringify(expected)};}catch{}\nconsole.log(JSON.stringify({schema_version:1,verifier_id:${JSON.stringify(verifierId)},status:passed?"passed":"failed",summary:passed?"passed":"failed",...(passed?{}:{failed_checks:[${JSON.stringify(target)}]})}));\nprocess.exit(passed?0:1);\n`);
	return path;
}

function protectedStabilityCheck(workspace: string, root: string): LocalCheckV3 {
	const verifierId = "final-capstone-g2-protected-stability-v1";
	const source = `import { readFileSync } from "node:fs";\nimport { resolve } from "node:path";\nconst root=process.env.V0B_WORKSPACE;\nlet passed=false;\ntry{passed=typeof root==="string"&&readFileSync(resolve(root,"protected.txt"),"utf8")==="protected-stable\\n";}catch{}\nconsole.log(JSON.stringify({schema_version:1,verifier_id:"final-capstone-g2-protected-stability-v1",status:passed?"passed":"failed",summary:passed?"passed":"failed",...(passed?{}:{failed_checks:["protected-stability"]})}));\nprocess.exit(passed?0:1);\n`;
	const sourcePath = resolve(root, `${verifierId}.mjs`); writeFileSync(sourcePath, source);
	const task: TaskSpecV0B = { schema_version: 1, task_id: "final-capstone-g2-protected-stability", instruction_ref: "final-capstone-g2-host-regression-pack-v1", instruction_sha256: sha256("final-capstone-g2-host-regression-pack-v1/protected-stability"), workspace_source_ref: resolve(workspace), workspace_source_digest: treeDigest(workspace), writable_paths: [], protected_paths: [], verifier_id: verifierId, verifier_ref: "host-regression-pack-v1/protected-stability.mjs", verifier_sha256: sha256(source), acceptance_visibility: "hidden_external", tool_profile_id: "final_capstone_g2_regression_only", command_descriptors: [], verifier_command: { executable: "current_node_executable", argv: ["host-regression-pack-v1/protected-stability.mjs"], cwd: "project", timeout_ms: 5_000, output_limit_bytes: 8_192 } };
	return { task, sourcePath };
}

function taskSpec(workspace: string, verifierId: string, sourcePath: string): TaskSpecV0B {
	return { schema_version: 1, task_id: `final-capstone-g2-${verifierId}`, instruction_ref: "final-capstone-g2-frozen-instruction", instruction_sha256: sha256("execute bounded Final Capstone Goal 2 case"), workspace_source_ref: workspace, workspace_source_digest: treeDigest(workspace), writable_paths: ["subject.txt", "protected.txt"], protected_paths: [], verifier_id: verifierId, verifier_ref: sourcePath, verifier_sha256: fileSha256(sourcePath), acceptance_visibility: "hidden_external", tool_profile_id: "v3g3_bounded_local", command_descriptors: [], verifier_command: { executable: "current_node_executable", argv: [sourcePath], cwd: "project", timeout_ms: 5_000, output_limit_bytes: 8_192 } };
}

function events(prefix: string, provider: number, tool: number, pathology: number): FauxExecutionEventV3[] {
	const result: FauxExecutionEventV3[] = [];
	for (let index = 0; index < provider; index++) result.push({ seq: result.length + 1, type: "provider_call", call_id: `${prefix}-provider-${index}` });
	for (let index = 0; index < tool; index++) result.push({ seq: result.length + 1, type: "tool_call", call_id: `${prefix}-tool-${index}` });
	for (let index = 0; index < pathology; index++) result.push({ seq: result.length + 1, type: "structural_pathology", check_id: `${prefix}-pathology-${index}` });
	return result;
}

function promotePort(options: { breakRegression?: boolean } = {}): FauxValidationPortV3 {
	return { execute: async ({ state, workspaceRoot }) => {
		if (state.status === "staged_inactive") { writeFileSync(resolve(workspaceRoot, "subject.txt"), "fixed\n"); if (options.breakRegression) writeFileSync(resolve(workspaceRoot, "protected.txt"), "changed\n"); }
		return { settled: true, events: state.status === "accepted" ? events("base", 3, 3, 1) : events("candidate", 2, 2, 0) };
	} };
}

async function candidateForContext(options: { root: string; agentWorkspace: string; projectId: string; targetActive: ActiveStateIdentityV3; failureFamily: string | null }): Promise<{ candidate: RefinementCandidateV3; state: StagedHarnessStateV3; stagedRoot: string; registryRoot: string }> {
	const evidencePath = writeOnceBytes(options.root, "candidate-evidence.txt", "frozen Goal 2 Candidate evidence\n"); const evidenceRef = artifactRef(options.root, evidencePath, "text/plain", false);
	const opportunity: ImprovementOpportunityV3 = { schema_version: 1, opportunity_id: "final-capstone-g2-opportunity", trigger: "hard_failure", source_run_ids: ["final-capstone-g2-source-run"], evidence_identity: { evidence_id: "final-capstone-g2-evidence", evidence_digest: sha256("final-capstone-g2-evidence") }, evidence_refs: [evidenceRef], observations: { frozen: true }, derivation: "deterministic_projection", task_context: { task_kind: "typescript-maintenance", failure_family: options.failureFamily } };
	const proposal = deterministicFixtureProposalV3({ opportunity, currentBaseStateDigest: options.targetActive.state_digest, kind: "prompt_addendum" });
	const sourceCandidate = validateProposalAndBuildCandidateV3({ rawProposal: proposal, opportunity, currentBaseStateDigest: options.targetActive.state_digest, derivation: "deterministic_fixture" });
	const sourceStagedRoot = resolve(options.root, "source-staged"); const sourceStaged = await stageCandidateStateV3({ candidate: sourceCandidate, stateRoot: sourceStagedRoot, agentWorkspaceRoot: options.agentWorkspace, acceptedBaseRoots: [BASE_PATH], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	const admitted = admitCandidateV3({ admissionRoot: resolve(options.root, "candidate-admissions"), projectId: options.projectId, sourceCandidate, sourceState: sourceStaged.state, targetActive: options.targetActive });
	const registryRoot = resolve(options.root, "candidate-admission-registry"); freezeAdmissionRegistryV3({ registryRoot, projectRoot: PROJECT_ROOT, projectId: options.projectId, admissionPaths: [admitted.path] });
	const stagedRoot = resolve(options.root, "admitted-staged"); const staged = await stageCandidateStateV3({ candidate: admitted.admittedCandidate, stateRoot: stagedRoot, agentWorkspaceRoot: options.agentWorkspace, acceptedBaseRoots: [BASE_PATH], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	return { candidate: admitted.admittedCandidate, state: staged.state, stagedRoot, registryRoot };
}

async function setupSequence(label: string, triggerKind: "failed" | "passed" = "failed", breakRegression = false): Promise<Sequence> {
	rmSync(G1_ROOT, { recursive: true, force: true }); mkdirSync(G2_ROOT, { recursive: true }); rmSync(resolve(G2_ROOT, label), { recursive: true, force: true });
	const trigger = await triggerAdmission(triggerKind);
	const root = resolve(G2_ROOT, label); mkdirSync(root, { recursive: true }); const agentWorkspace = resolve(root, "agent-workspace"); mkdirSync(agentWorkspace);
	const projectId = trigger.projectId;
	const stateRoot = resolve(root, "state"); const initialized = await initializeStateStoreV3({ stateRoot, projectId, agentWorkspaceRoot: agentWorkspace, acceptedBaseRoots: [BASE_PATH], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	const expectedActive = active(initialized.active); const prepared = await candidateForContext({ root, agentWorkspace, projectId, targetActive: expectedActive, failureFamily: triggerKind === "failed" ? "verifier-failure" : null });
	const registryRoot = prepared.registryRoot;
	const workspace = resolve(root, "validation-workspace"); mkdirSync(workspace); writeFileSync(resolve(workspace, "subject.txt"), "broken\n"); writeFileSync(resolve(workspace, "protected.txt"), "protected-stable\n");
	const verifierPath = verifierSource(root, "final-capstone-g2-primary", "subject"); const verifierTask = taskSpec(workspace, "final-capstone-g2-primary", verifierPath); const primary = { task: verifierTask, sourcePath: verifierPath };
	const promotionRunRoot = resolve(root, "promotion-validation");
	const result = await executeRegressionGatedCandidatePublicationG2({ projectRoot: PROJECT_ROOT, runRoot: promotionRunRoot, validationId: `final-capstone-g2-${label}`, projectId, admissionRoot: trigger.admissionRoot, registrationPath: trigger.registrationPath, admissionId: trigger.admissionId, stateRoot, stagedStateRoot: prepared.stagedRoot, candidateState: prepared.state, expectedActive, sourceWorkspaceRoot: workspace, task: verifierTask, verifier: primary, ...PROFILE, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256, port: promotePort({ breakRegression }) });
	const promotion = { applied: result.applied, selection: result.selection };
	return { root, projectId, stateRoot, registryRoot, workspace, primary, trigger, promotionRunRoot, promotion, initialActive: expectedActive, promotedActive: active(promotion.applied.active) };
}

async function setupAssessmentSequence(label: string): Promise<Sequence> {
	rmSync(G1_ROOT, { recursive: true, force: true }); mkdirSync(G2_ROOT, { recursive: true }); rmSync(resolve(G2_ROOT, label), { recursive: true, force: true });
	const root = resolve(G2_ROOT, label); mkdirSync(root, { recursive: true }); const agentWorkspace = resolve(root, "agent-workspace"); mkdirSync(agentWorkspace);
	const stateRoot = resolve(root, "state"); const initialized = await initializeStateStoreV3({ stateRoot, projectId: PROJECT_ID, agentWorkspaceRoot: agentWorkspace, acceptedBaseRoots: [BASE_PATH], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 }); const expectedActive = active(initialized.active);
	const prepared = await candidateForContext({ root, agentWorkspace, projectId: PROJECT_ID, targetActive: expectedActive, failureFamily: "verifier-failure" });
	const workspace = resolve(root, "validation-workspace"); mkdirSync(workspace); writeFileSync(resolve(workspace, "subject.txt"), "broken\n"); writeFileSync(resolve(workspace, "protected.txt"), "protected-stable\n");
	const verifierPath = verifierSource(root, "final-capstone-g2-primary", "subject"); const verifierTask = taskSpec(workspace, "final-capstone-g2-primary", verifierPath); const regression = protectedStabilityCheck(workspace, root); const primary = { task: verifierTask, sourcePath: verifierPath };
	const promotionRunRoot = resolve(root, "promotion-validation"); const validated = await executeSymmetricValidationV3({ projectRoot: PROJECT_ROOT, runRoot: promotionRunRoot, validationId: `final-capstone-g2-${label}`, projectId: PROJECT_ID, sourceWorkspaceRoot: workspace, task: verifierTask, verifier: primary, regressions: [regression], baseState: initialized.version, candidateState: prepared.state, ...PROFILE, port: promotePort() });
	const applied = await applyValidationDecisionV3({ stateRoot, projectId: PROJECT_ID, runRoot: promotionRunRoot, validationRef: validated.validationRef, stagedStateRoot: prepared.stagedRoot, candidateStateDigest: prepared.state.state_digest, expectedActive, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	const trigger = { admissionRoot: "", registrationPath: "", admissionId: "", projectId: PROJECT_ID };
	return { root, projectId: PROJECT_ID, stateRoot, registryRoot: prepared.registryRoot, workspace, primary, trigger, promotionRunRoot, promotion: { applied }, initialActive: expectedActive, promotedActive: active(applied.active) };
}

async function boundAdmission(sequence: Sequence, outcome: "passed" | "failed"): Promise<TriggerAdmission> {
	mkdirSync(resolve(G1_ROOT, "admissions"), { recursive: true });
	const scratch = resolve(sequence.root, "followup"); mkdirSync(scratch, { recursive: true }); const workspace = resolve(scratch, "workspace"); mkdirSync(workspace); writeFileSync(resolve(workspace, "subject.txt"), outcome === "passed" ? "fixed\n" : "broken\n"); writeFileSync(resolve(workspace, "protected.txt"), "protected-stable\n");
	const label = outcome === "passed" ? "g1-v3-bound-followup" : "g1-v3-bound-negative-followup"; const verifierId = `${label}-verifier`; const verifierPath = verifierSource(scratch, verifierId, "subject"); const task = taskSpec(workspace, verifierId, verifierPath);
	const failureLineage = { source_run_id: "g1-trusted-prior-run", failure_family: "verifier-failure", lineage_digest: digestObject({ source_run_id: "g1-trusted-prior-run", failure_family: "verifier-failure" }) };
	const authority = freezeGoal3CaseAuthorityV3({ authorityRoot: resolve(scratch, "case-authority"), projectId: PROJECT_ID, taskId: task.task_id, caseId: label, taskKind: "typescript-maintenance", allowedFailureLineage: failureLineage, taskPromptSha256: sha256(TASK_PROMPT), verifierId: task.verifier_id, verifierSha256: task.verifier_sha256, toolProfileId: task.tool_profile_id, toolProfileDigest: goal3ToolProfileDigestV3(task), budgetProfileId: GOAL3_BUDGET_PROFILE_V3.profile_id, budgetProfileDigest: GOAL3_BUDGET_PROFILE_DIGEST_V3, providerProfile: GOAL3_FAUX_PROVIDER_PROFILE_V3 });
	const runRoot = resolve(scratch, "run"); mkdirSync(runRoot); const frozen = await freezeRunBindingV3({ projectRoot: PROJECT_ROOT, stateRoot: sequence.stateRoot, admissionRegistryRoot: sequence.registryRoot, caseAuthorityPath: authority.path, runRoot, projectId: PROJECT_ID, context: buildBindingContextFromCaseAuthorityV3(authority.authority), immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	await executeGoal3RunV3({ projectRoot: PROJECT_ROOT, runRoot, runId: label, caseId: label, caseAuthorityPath: authority.path, workspaceRoot: workspace, taskPrompt: TASK_PROMPT, taskPolicy: task, verifierTask: task, verifierSourcePath: verifierPath, frozen });
	const bundle = resolve(G1_ROOT, `sources/${outcome === "passed" ? "v3-bound" : "v3-bound-negative"}`); mkdirSync(bundle, { recursive: true }); cpSync(runRoot, resolve(bundle, "run"), { recursive: true }); cpSync(sequence.stateRoot, resolve(bundle, "state"), { recursive: true }); cpSync(sequence.registryRoot, resolve(bundle, "candidate-admission-registry"), { recursive: true }); mkdirSync(resolve(bundle, "case-authority")); cpSync(authority.path, resolve(bundle, `case-authority/${label}.json`));
	const source: TrustedEvidenceSourceG1 = { family: "v3g3_bound_state_followup", bundle_root: rel(bundle), run_root: "run", state_root: "state", candidate_admission_registry_root: "candidate-admission-registry", case_authority_path: `case-authority/${label}.json`, immutable_base_prompt: SYSTEM_PROMPT, immutable_base_prompt_sha256: SYSTEM_PROMPT_SHA256 };
	const registration = hostRegistration(outcome === "passed" ? "g1-host-v3" : "g1-host-v3-negative", PROJECT_ID, source, "typescript-maintenance", "verifier-failure"); const registrationPath = writeRegistration(registration);
	const admitted = await admitTrustedEvidenceG1({ projectRoot: PROJECT_ROOT, admissionRoot: rel(resolve(G1_ROOT, "admissions")), registrationPath, expectedProjectId: PROJECT_ID });
	assert.equal(admitted.record.frozen_evidence.outcome.status, outcome);
	return { admissionRoot: rel(resolve(G1_ROOT, "admissions")), registrationPath, admissionId: admitted.record.admission_id, projectId: PROJECT_ID };
}

function assessmentContext(sequence: Sequence, admission: TriggerAdmission, comparisonRunRoot: string | null, target: string | null): StateAssessmentContextG2 {
	return { projectRoot: PROJECT_ROOT, assessmentRoot: resolve(sequence.root, "assessments"), admissionRoot: admission.admissionRoot, registrationPath: admission.registrationPath, admissionId: admission.admissionId, projectId: PROJECT_ID, stateRoot: sequence.stateRoot, expectedActive: sequence.promotedActive, promotionValidationRunRoot: sequence.promotionRunRoot, comparisonRunRoot, requestedRollbackTargetDigest: target, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 };
}

test("Goal 2 selects two exact Host packs and rejects caller membership, stale source/digest, duplicate, reorder, unknown applicability, and cross-project input", async () => {
	const one = await setupSequence("pack-one", "failed"); assert.equal(one.promotion.applied.decision.result, "promoted"); assert.equal(one.promotion.selection!.checks.length, 1);
	const reopened = await inspectRegressionGatedValidationG2({ projectRoot: PROJECT_ROOT, runRoot: one.promotionRunRoot }); assert.equal(reopened.integrity_valid, true, reopened.errors.join("; "));
	const copyAndMutate = async (label: string, mutate: (record: any) => void) => { const target = resolve(one.root, label); cpSync(one.promotionRunRoot, target, { recursive: true }); const path = resolve(target, "g2-regression-selection.json"); const record = JSON.parse(readFileSync(path, "utf8")); mutate(record); const { selection_digest: _old, ...body } = record; record.selection_digest = digestObject(body); writeFileSync(path, `${stableJson(record)}\n`); return await inspectRegressionGatedValidationG2({ projectRoot: PROJECT_ROOT, runRoot: target }); };
	assert.equal((await copyAndMutate("duplicate", (record) => record.checks.push(record.checks[0]))).integrity_valid, false);
	assert.equal((await copyAndMutate("stale-source", (record) => record.checks[0].source_sha256 = "0".repeat(64))).integrity_valid, false);
	assert.equal((await copyAndMutate("stale-pack", (record) => record.pack_digest = "0".repeat(64))).integrity_valid, false);
	const callerOverride = { projectRoot: PROJECT_ROOT, runRoot: resolve(one.root, "caller-override"), validationId: "caller-override", projectId: one.projectId, admissionRoot: one.trigger.admissionRoot, registrationPath: one.trigger.registrationPath, admissionId: one.trigger.admissionId, stateRoot: one.stateRoot, stagedStateRoot: "unused", candidateState: {} as StagedHarnessStateV3, expectedActive: one.promotedActive, sourceWorkspaceRoot: one.workspace, task: one.primary.task, verifier: one.primary, ...PROFILE, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256, port: promotePort(), regressions: [] };
	await assert.rejects(executeRegressionGatedCandidatePublicationG2(callerOverride as never), /exact-key/);
	const two = await setupSequence("pack-two", "passed"); assert.equal(two.promotion.applied.decision.result, "promoted"); assert.equal(two.promotion.selection!.applicability_key, "typescript-maintenance/none"); assert.deepEqual(two.promotion.selection!.checks.map((entry) => entry.check_id), ["protected-stability", "subject-fixed"]);
	const reorder = resolve(two.root, "reorder"); cpSync(two.promotionRunRoot, reorder, { recursive: true }); const reorderPath = resolve(reorder, "g2-regression-selection.json"); const record = JSON.parse(readFileSync(reorderPath, "utf8")); record.checks.reverse(); const { selection_digest: _old, ...body } = record; record.selection_digest = digestObject(body); writeFileSync(reorderPath, `${stableJson(record)}\n`); assert.equal((await inspectRegressionGatedValidationG2({ projectRoot: PROJECT_ROOT, runRoot: reorder })).integrity_valid, false);
	await assert.rejects(executeRegressionGatedCandidatePublicationG2({ ...(callerOverride as any), runRoot: resolve(two.root, "cross-project"), sourceWorkspaceRoot: resolve(HISTORICAL_ROOT, ".runs"), regressions: undefined } as never), /exact-key|cross-project/);
});

test("source Case PASS plus selected regression FAIL rejects and preserves the active pointer", async () => {
	const sequence = await setupSequence("regression-reject", "failed", true); assert.equal(sequence.promotion.applied.decision.result, "rejected"); assert.equal(sequence.promotion.applied.decision.reason, "candidate_regression_failed"); assert.deepEqual(active(sequence.promotion.applied.active), sequence.initialActive);
	const store = await inspectStateStoreV3({ stateRoot: sequence.stateRoot, expectedProjectId: sequence.projectId, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 }); assert.equal(store.versions.length, 1); assert.equal(store.versions.some((entry) => entry.source_candidate_id !== null), false);
	const inspected = await inspectRegressionGatedValidationG2({ projectRoot: PROJECT_ROOT, runRoot: sequence.promotionRunRoot }); assert.equal(inspected.integrity_valid, true, inspected.errors.join("; ")); assert.deepEqual(inspected.recomputed_decision, { result: "reject", reason: "candidate_regression_failed" });
});

test("valid bound follow-up PASS yields retain; ordinary negative yields needs_reassessment; neither mutates State, Workspace, or Source", async () => {
	const retained = await setupAssessmentSequence("retain"); const passAdmission = await boundAdmission(retained, "passed"); const beforeRetain = { state: treeDigest(retained.stateRoot), workspace: treeDigest(retained.workspace), source: treeDigest(resolve(G1_ROOT, "sources/v3-bound")) };
	const retainedResult = await persistStateAssessmentG2(assessmentContext(retained, passAdmission, null, null)); assert.equal(retainedResult.assessment.assessment_result, "retain"); assert.deepEqual({ state: treeDigest(retained.stateRoot), workspace: treeDigest(retained.workspace), source: treeDigest(resolve(G1_ROOT, "sources/v3-bound")) }, beforeRetain);
	const retainedAgain = await persistStateAssessmentG2(assessmentContext(retained, passAdmission, null, null)); assert.equal(retainedAgain.idempotent_existing, true);
	const retainedInspection = await inspectFinalCapstoneG2({ ...assessmentContext(retained, passAdmission, null, null), assessmentId: retainedResult.assessment.assessment_id }); assert.equal(retainedInspection.integrity_valid, true, retainedInspection.errors.join("; "));
	const negative = await setupAssessmentSequence("needs"); const failAdmission = await boundAdmission(negative, "failed"); const beforeNeeds = { state: treeDigest(negative.stateRoot), workspace: treeDigest(negative.workspace), source: treeDigest(resolve(G1_ROOT, "sources/v3-bound-negative")) };
	const needs = await persistStateAssessmentG2(assessmentContext(negative, failAdmission, null, null)); assert.equal(needs.assessment.assessment_result, "needs_reassessment"); assert.equal(needs.assessment.assessment_reason, "ordinary_negative_evidence"); assert.deepEqual({ state: treeDigest(negative.stateRoot), workspace: treeDigest(negative.workspace), source: treeDigest(resolve(G1_ROOT, "sources/v3-bound-negative")) }, beforeNeeds);
	await assert.rejects(applyAssessedRollbackG2({ ...assessmentContext(negative, failAdmission, null, null), assessmentId: needs.assessment.assessment_id }), /only a recomputed rollback assessment/);
});

test("fresh fair accepted-State comparison yields rollback assessment, then separate Host application reuses V3 rollback/CAS and links all identities", async () => {
	const sequence = await setupAssessmentSequence("rollback"); const admission = await boundAdmission(sequence, "failed");
	const comparisonRoot = resolve(sequence.root, "accepted-state-comparison"); const comparisonPort: FauxValidationPortV3 = { execute: async ({ state, workspaceRoot }) => { if (state.state_digest === sequence.initialActive.state_digest) writeFileSync(resolve(workspaceRoot, "subject.txt"), "fixed\n"); return { settled: true, events: events(state.state_digest === sequence.initialActive.state_digest ? "parent" : "current", 2, 2, 0) }; } };
	const compared = await executeAcceptedStateRegressionComparisonG2({ projectRoot: PROJECT_ROOT, runRoot: comparisonRoot, comparisonId: "final-capstone-g2-rollback-comparison", projectId: PROJECT_ID, admissionRoot: admission.admissionRoot, registrationPath: admission.registrationPath, admissionId: admission.admissionId, stateRoot: sequence.stateRoot, expectedActive: sequence.promotedActive, sourceWorkspaceRoot: sequence.workspace, task: sequence.primary.task, verifier: sequence.primary, ...PROFILE, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256, port: comparisonPort });
	assert.equal(compared.inspection.state_regression_observed, true); assert.equal((await inspectAcceptedStateRegressionComparisonG2({ projectRoot: PROJECT_ROOT, runRoot: comparisonRoot })).integrity_valid, true);
	const context = assessmentContext(sequence, admission, comparisonRoot, sequence.initialActive.state_digest); const beforeAssessment = readFileSync(resolve(sequence.stateRoot, "active.json")); const beforeAssessmentStateTree = treeDigest(sequence.stateRoot); const beforeAssessmentWorkspaceTree = treeDigest(sequence.workspace); const beforeAssessmentSourceTree = treeDigest(resolve(G1_ROOT, "sources/v3-bound-negative")); const assessed = await persistStateAssessmentG2(context); const afterAssessmentActive = readFileSync(resolve(sequence.stateRoot, "active.json")); assert.equal(assessed.assessment.assessment_result, "rollback"); assert.deepEqual(afterAssessmentActive, beforeAssessment); assert.equal(treeDigest(sequence.stateRoot), beforeAssessmentStateTree);
	const applied = await applyAssessedRollbackG2({ ...context, assessmentId: assessed.assessment.assessment_id }); assert.equal(applied.idempotent_existing, false); assert.equal(applied.application.target_state_digest, sequence.initialActive.state_digest); assert.equal(applied.application.prior_active.state_digest, sequence.promotedActive.state_digest); assert.equal(applied.application.next_active.state_digest, sequence.initialActive.state_digest);
	assert.equal(treeDigest(sequence.workspace), beforeAssessmentWorkspaceTree); assert.equal(treeDigest(resolve(G1_ROOT, "sources/v3-bound-negative")), beforeAssessmentSourceTree);
	writeFileSync(resolve(sequence.root, "g2-evidence-summary.json"), `${stableJson({ schema_version: 1, assessment_id: assessed.assessment.assessment_id, assessment_digest: assessed.assessment.assessment_digest, admission_id: assessed.assessment.admission_id, evidence_id: assessed.assessment.evidence_id, before_assessment: { active: sequence.promotedActive, active_bytes_sha256: sha256(beforeAssessment), state_tree_digest: beforeAssessmentStateTree, workspace_tree_digest: beforeAssessmentWorkspaceTree, source_tree_digest: beforeAssessmentSourceTree }, after_assessment: { active: sequence.promotedActive, active_bytes_sha256: sha256(afterAssessmentActive), state_tree_digest: beforeAssessmentStateTree, workspace_tree_digest: treeDigest(sequence.workspace), source_tree_digest: treeDigest(resolve(G1_ROOT, "sources/v3-bound-negative")) }, after_application: { active: applied.application.next_active, state_tree_digest: treeDigest(sequence.stateRoot), workspace_tree_digest: treeDigest(sequence.workspace), source_tree_digest: treeDigest(resolve(G1_ROOT, "sources/v3-bound-negative")), authorization_id: applied.authorization.authorization_id, application_id: applied.application.application_id, v3_rollback_decision_id: applied.application.v3_rollback_decision_id }, zero_access: { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 } })}\n`);
	const inspected = await inspectFinalCapstoneG2({ ...context, assessmentId: assessed.assessment.assessment_id }); assert.equal(inspected.integrity_valid, true, inspected.errors.join("; ")); assert.ok(inspected.authorization); assert.ok(inspected.application);
	const again = await applyAssessedRollbackG2({ ...context, assessmentId: assessed.assessment.assessment_id }); assert.equal(again.idempotent_existing, true);
	const script = `import { inspectFinalCapstoneG2 as inspect } from ${JSON.stringify(new URL("../src/inspect-final-capstone-g2.ts", import.meta.url).href)}; const result=await inspect(JSON.parse(process.argv[1])); console.log(JSON.stringify(result)); process.exit(result.integrity_valid?0:1);`;
	const reopened = spawnSync(process.execPath, ["--input-type=module", "-e", script, JSON.stringify({ ...context, assessmentId: assessed.assessment.assessment_id })], { encoding: "utf8" }); assert.equal(reopened.status, 0, reopened.stderr); assert.equal(JSON.parse(reopened.stdout).integrity_valid, true);
});

test("invalid/fairness-drift comparison, non-parent target, and stale active identity cannot yield or apply rollback", async () => {
	const sequence = await setupAssessmentSequence("negative-matrix"); const admission = await boundAdmission(sequence, "failed");
	const comparisonRoot = resolve(sequence.root, "comparison"); const port: FauxValidationPortV3 = { execute: async ({ state, workspaceRoot }) => { if (state.state_digest === sequence.initialActive.state_digest) writeFileSync(resolve(workspaceRoot, "subject.txt"), "fixed\n"); return { settled: true, events: [] }; } };
	await executeAcceptedStateRegressionComparisonG2({ projectRoot: PROJECT_ROOT, runRoot: comparisonRoot, comparisonId: "negative-matrix-comparison", projectId: PROJECT_ID, admissionRoot: admission.admissionRoot, registrationPath: admission.registrationPath, admissionId: admission.admissionId, stateRoot: sequence.stateRoot, expectedActive: sequence.promotedActive, sourceWorkspaceRoot: sequence.workspace, task: sequence.primary.task, verifier: sequence.primary, ...PROFILE, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256, port });
	const nonParent = await persistStateAssessmentG2(assessmentContext(sequence, admission, comparisonRoot, "f".repeat(64))); assert.equal(nonParent.assessment.assessment_result, "needs_reassessment");
	const driftRoot = resolve(sequence.root, "comparison-drift"); cpSync(comparisonRoot, driftRoot, { recursive: true }); writeFileSync(resolve(driftRoot, "arms/candidate/verifier-output.txt"), "tampered\n"); const drift = await persistStateAssessmentG2(assessmentContext(sequence, admission, driftRoot, sequence.initialActive.state_digest)); assert.equal(drift.assessment.assessment_result, "needs_reassessment"); assert.equal(drift.assessment.assessment_reason, "comparison_missing_or_invalid");
	await assert.rejects(persistStateAssessmentG2({ ...assessmentContext(sequence, admission, null, null), expectedActive: { ...sequence.promotedActive, binding_revision: sequence.promotedActive.binding_revision + 1 } }), /does not match|stale/);
});

test("changed Workspace, Verifier, pack/profile/Session policy, untrusted attribution, and caller-selected result cannot authorize rollback", async () => {
	const sequence = await setupAssessmentSequence("authority-matrix"); const admission = await boundAdmission(sequence, "failed"); const before = { state: treeDigest(sequence.stateRoot), workspace: treeDigest(sequence.workspace) };
	const driftPort: FauxValidationPortV3 = { execute: async ({ state, workspaceRoot }) => { if (state.state_digest === sequence.initialActive.state_digest) writeFileSync(resolve(workspaceRoot, "subject.txt"), "fixed\n"); return { settled: true, events: [] }; } };
	const executeDrift = async (label: string, overrides: Record<string, unknown> = {}) => {
		const runRoot = resolve(sequence.root, `comparison-${label}`); const workspace = (overrides.sourceWorkspaceRoot as string | undefined) ?? sequence.workspace; const verifier = (overrides.verifier as LocalCheckV3 | undefined) ?? sequence.primary; const task = (overrides.task as TaskSpecV0B | undefined) ?? verifier.task;
		return await executeAcceptedStateRegressionComparisonG2({ projectRoot: PROJECT_ROOT, runRoot, comparisonId: `authority-matrix-${label}`, projectId: PROJECT_ID, admissionRoot: admission.admissionRoot, registrationPath: admission.registrationPath, admissionId: admission.admissionId, stateRoot: sequence.stateRoot, expectedActive: sequence.promotedActive, sourceWorkspaceRoot: workspace, task, verifier, ...PROFILE, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256, port: driftPort, ...overrides } as never);
	};
	for (const [label, overrides] of [["budget", { budgetDigest: sha256("changed-budget") }], ["tool", { toolProfileDigest: sha256("changed-tool") }], ["model", { providerModelProfileDigest: sha256("changed-model") }]] as const) {
		const compared = await executeDrift(label, overrides); assert.equal(compared.inspection.state_regression_observed, true); const assessed = await persistStateAssessmentG2(assessmentContext(sequence, admission, resolve(sequence.root, `comparison-${label}`), sequence.initialActive.state_digest)); assert.equal(assessed.assessment.assessment_result, "needs_reassessment"); assert.equal(assessed.assessment.assessment_reason, "comparison_not_state_attributable"); await assert.rejects(applyAssessedRollbackG2({ ...assessmentContext(sequence, admission, resolve(sequence.root, `comparison-${label}`), sequence.initialActive.state_digest), assessmentId: assessed.assessment.assessment_id }), /only a recomputed rollback assessment/);
	}
	const alternateWorkspace = resolve(sequence.root, "alternate-workspace"); cpSync(sequence.workspace, alternateWorkspace, { recursive: true }); writeFileSync(resolve(alternateWorkspace, "unrelated.txt"), "different initial Workspace\n"); const alternateTask = taskSpec(alternateWorkspace, sequence.primary.task.verifier_id, sequence.primary.sourcePath); await executeDrift("workspace", { sourceWorkspaceRoot: alternateWorkspace, task: alternateTask, verifier: { task: alternateTask, sourcePath: sequence.primary.sourcePath } }); const workspaceAssessment = await persistStateAssessmentG2(assessmentContext(sequence, admission, resolve(sequence.root, "comparison-workspace"), sequence.initialActive.state_digest)); assert.equal(workspaceAssessment.assessment.assessment_result, "needs_reassessment");
	const alternateVerifierPath = verifierSource(sequence.root, "final-capstone-g2-alternate-primary", "subject"); const alternateVerifierTask = taskSpec(sequence.workspace, "final-capstone-g2-alternate-primary", alternateVerifierPath); await executeDrift("verifier", { task: alternateVerifierTask, verifier: { task: alternateVerifierTask, sourcePath: alternateVerifierPath } }); const verifierAssessment = await persistStateAssessmentG2(assessmentContext(sequence, admission, resolve(sequence.root, "comparison-verifier"), sequence.initialActive.state_digest)); assert.equal(verifierAssessment.assessment.assessment_result, "needs_reassessment");
	const exactRequest = { projectRoot: PROJECT_ROOT, runRoot: resolve(sequence.root, "comparison-caller-pack"), comparisonId: "authority-matrix-caller-pack", projectId: PROJECT_ID, admissionRoot: admission.admissionRoot, registrationPath: admission.registrationPath, admissionId: admission.admissionId, stateRoot: sequence.stateRoot, expectedActive: sequence.promotedActive, sourceWorkspaceRoot: sequence.workspace, task: sequence.primary.task, verifier: sequence.primary, ...PROFILE, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256, port: promotePort() };
	await assert.rejects(executeAcceptedStateRegressionComparisonG2({ ...exactRequest, regressions: [] } as never), /exact-key/); await assert.rejects(executeAcceptedStateRegressionComparisonG2({ ...exactRequest, sessionPolicy: "shared" } as never), /exact-key/);
	const callerSelected = await persistStateAssessmentG2({ ...assessmentContext(sequence, admission, null, null), assessment_result: "rollback" } as never); assert.equal(callerSelected.assessment.assessment_result, "needs_reassessment");
	const assessmentPath = resolve(sequence.root, `assessments/assessments/${callerSelected.assessment.assessment_id}.json`); const assessmentBytes = readFileSync(assessmentPath, "utf8"); writeFileSync(assessmentPath, `${assessmentBytes} `); await assert.rejects(persistStateAssessmentG2(assessmentContext(sequence, admission, null, null)), /write-once/); writeFileSync(assessmentPath, assessmentBytes);
	const admissionPath = resolve(PROJECT_ROOT, admission.admissionRoot, admission.admissionId, "admission.json"); const admissionBytes = readFileSync(admissionPath, "utf8");
	for (const attribution of ["infrastructure", "evidence", "user", "ambiguous"]) { const altered = JSON.parse(admissionBytes); altered.frozen_evidence.validity.attribution = attribution; writeFileSync(admissionPath, `${stableJson(altered)}\n`); await assert.rejects(persistStateAssessmentG2(assessmentContext(sequence, admission, null, null)), /Goal 1 admission fails closed/); writeFileSync(admissionPath, admissionBytes); }
	assert.deepEqual({ state: treeDigest(sequence.stateRoot), workspace: treeDigest(sequence.workspace) }, before);
});

test("independent Inspector detects assessment, authorization, application, comparison, State history, Decision, and pointer tamper", async () => {
	const sequence = await setupAssessmentSequence("tamper"); const admission = await boundAdmission(sequence, "failed"); const comparisonRoot = resolve(sequence.root, "comparison"); const port: FauxValidationPortV3 = { execute: async ({ state, workspaceRoot }) => { if (state.state_digest === sequence.initialActive.state_digest) writeFileSync(resolve(workspaceRoot, "subject.txt"), "fixed\n"); return { settled: true, events: [] }; } };
	await executeAcceptedStateRegressionComparisonG2({ projectRoot: PROJECT_ROOT, runRoot: comparisonRoot, comparisonId: "tamper-comparison", projectId: PROJECT_ID, admissionRoot: admission.admissionRoot, registrationPath: admission.registrationPath, admissionId: admission.admissionId, stateRoot: sequence.stateRoot, expectedActive: sequence.promotedActive, sourceWorkspaceRoot: sequence.workspace, task: sequence.primary.task, verifier: sequence.primary, ...PROFILE, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256, port });
	const context = assessmentContext(sequence, admission, comparisonRoot, sequence.initialActive.state_digest); const assessed = await persistStateAssessmentG2(context); const applied = await applyAssessedRollbackG2({ ...context, assessmentId: assessed.assessment.assessment_id }); const inspect = () => inspectFinalCapstoneG2({ ...context, assessmentId: assessed.assessment.assessment_id }); assert.equal((await inspect()).integrity_valid, true);
	const files = [resolve(context.assessmentRoot, `assessments/${assessed.assessment.assessment_id}.json`), resolve(context.assessmentRoot, `authorizations/${assessed.assessment.assessment_id}.json`), resolve(context.assessmentRoot, `applications/${assessed.assessment.assessment_id}.json`), resolve(comparisonRoot, "accepted-state-comparison.json"), resolve(sequence.stateRoot, `versions/${sequence.promotedActive.state_digest}/state.json`), resolve(sequence.stateRoot, `decisions/${applied.application.v3_rollback_decision_id}.json`), resolve(sequence.stateRoot, "active.json")];
	for (const path of files) { const original = readFileSync(path, "utf8"); writeFileSync(path, `${original} `); assert.equal((await inspect()).integrity_valid, false, path); writeFileSync(path, original); assert.equal((await inspect()).integrity_valid, true, path); }
});
