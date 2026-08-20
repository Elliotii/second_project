import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { createModels, fauxAssistantMessage, fauxProvider } from "@earendil-works/pi-ai";
import type { TaskSpecV0B } from "../src/contracts/v0b-types.ts";
import type { FauxExecutionEventV3 } from "../src/contracts/v3g2-types.ts";
import type { ImprovementOpportunityV3, RefinementCandidateV3 } from "../src/contracts/v3-types.ts";
import { digestObject, fileSha256, sha256, stableJson, treeDigest } from "../src/hash.ts";
import { inspectRegisteredFollowUpAdmissionV37 } from "../src/inspect-v37g2.ts";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_SHA256 } from "../src/prompts/base.ts";
import { executeSymmetricValidationV3, type FauxValidationPortV3, type LocalCheckV3 } from "../src/refinement/comparator-v3.ts";
import type { BoundedProposalPortV3 } from "../src/refinement/producer-v3.ts";
import { executeRunV2A } from "../src/run-v2.ts";
import { PersistentInteractiveSessionServiceV36 } from "../src/session/persistent-session-v36.ts";
import { stageCandidateStateV3 } from "../src/state/staging-v3.ts";
import { applyValidationDecisionV3, initializeStateStoreV3, inspectStateStoreV3, rollbackActiveStateV3 } from "../src/state/store-v3.ts";
import { persistStateAssessmentG2 } from "../src/state/state-feedback-g2.ts";
import { V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE } from "../src/v36/budget-profile-v36.ts";
import { producePromptCandidateV37 } from "../src/v37/candidate-v37.ts";
import { loadRegisteredFollowUpExecutionProfileV37 } from "../src/v37/follow-up-execution-profile-v37.ts";
import { admitRegisteredRecoveryV37, persistRegisteredRecoveryPackageV37 } from "../src/v37/registered-recovery-v37.ts";
import { admitRegisteredFollowUpV37, executeRegisteredFollowUpV37, normalizeRegisteredBoundFollowUpV37, prepareRegisteredFollowUpV37, registeredFollowUpPromotionValidationRootV37, registeredFollowUpTreeDigestV37, submitRegisteredFollowUpEvidenceV37, type RegisteredFollowUpOptionsV37 } from "../src/v37/registered-follow-up-v37.ts";
import { bindPrimaryRunV37, createWorkflowRegistrationV37, loadWorkflowRegistrationV37 } from "../src/v37/workflow-registration-v37.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const ROOT = resolve(PROJECT_ROOT, ".runs/v37/g1-tests");
const G2_ROOT = resolve(PROJECT_ROOT, ".runs/v37/g2-tests");
const DATA_ROOT = ".runs/v37/g1-tests/g2-data";
const STATE_ROOT = resolve(PROJECT_ROOT, ".runs/v37/g1-tests/state-store");
const RUN_ROOT = resolve(ROOT, "g2-v2-source");
const WORKFLOW_ID = "v37-g2-workflow-main";
const CASE_ID = "v37-g1-det-recovery";
const GENERIC = "Before reporting completion, run the task-declared check and rely on its result rather than self-assessment.";
const options: RegisteredFollowUpOptionsV37 = { projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID, followUpRunId: "v37-g2-follow-up-run", sessionId: "v37-g2-follow-up-session", workspaceId: "v37-g2-follow-up-workspace", boundAt: "2026-08-20T04:00:00.000Z", confirmedAt: "2026-08-20T04:10:00.000Z", requestedAt: "2026-08-20T04:10:01.000Z" };
const recoveryOptions = { projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID, runRoot: RUN_ROOT, confirmedAt: "2026-08-20T03:00:00.000Z", requestedAt: "2026-08-20T03:00:01.000Z" };
let candidate: RefinementCandidateV3;
let admissionId = "";

function writeJson(path: string, value: unknown): void { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, `${stableJson(value)}\n`, "utf8"); }
function readJson<T>(path: string): T { return JSON.parse(readFileSync(path, "utf8")) as T; }

async function inspectOriginalAuthorityMutation(path: string, mutate: ((value: any) => void) | null, expectedError: RegExp): Promise<void> {
	const originalBytes = readFileSync(path);
	try {
		if (mutate === null) rmSync(path);
		else { const value = JSON.parse(originalBytes.toString("utf8")) as any; mutate(value); writeJson(path, value); }
		const inspected = await inspectRegisteredFollowUpAdmissionV37(options);
		const errors = inspected.errors.join("; ");
		assert.equal(inspected.integrity_valid, false, path);
		assert.match(errors, expectedError, path);
		assert.doesNotMatch(errors, /registered Recovery admission unavailable/, path);
	} finally {
		writeFileSync(path, originalBytes);
		assert.deepEqual(readFileSync(path), originalBytes);
	}
}

async function inspectAcceptedArtifactMutation(relativePath: string, mutate: ((value: any) => void) | null, expectedError: RegExp): Promise<void> {
	return inspectOriginalAuthorityMutation(resolve(PROJECT_ROOT, DATA_ROOT, "workflows", WORKFLOW_ID, "follow-up", relativePath), mutate, expectedError);
}

function proposal(opportunity: ImprovementOpportunityV3, base: string): unknown {
	const applicability = { task_kinds: ["typescript-maintenance"], failure_families: ["verifier-failure"] };
	return { schema_version: 1, proposal_id: "v37-g2-candidate-proposal", evidence_digest: opportunity.evidence_identity.evidence_digest, expected_base_state_digest: base, diagnosis: { pattern_id: opportunity.trigger, statement: "The registered Primary failed and bounded Recovery succeeded.", evidence_refs: structuredClone(opportunity.evidence_refs) }, lesson: { statement: "Use the registered verification discipline.", expected_outcome: "The related task is checked before completion.", applicability }, edits: [{ kind: "prompt_addendum", entry_id: "v37-verify-before-finish", content: GENERIC, applicability }] };
}

const port: BoundedProposalPortV3 = { propose: async (input) => proposal(input.opportunity, input.expected_base_state_digest) };

function publicationVerifier(workspace: string, verifierId = "v37-g2-publication-verifier", file = "subject.txt", expected = "fixed\n"): LocalCheckV3 {
	const source = `import { readFileSync } from "node:fs";\nimport { resolve } from "node:path";\nconst root=process.env.V0B_WORKSPACE;\nlet passed=false;\ntry{passed=typeof root==="string"&&readFileSync(resolve(root,${JSON.stringify(file)}),"utf8")===${JSON.stringify(expected)};}catch{}\nconsole.log(JSON.stringify({schema_version:1,verifier_id:${JSON.stringify(verifierId)},status:passed?"passed":"failed",summary:passed?"passed":"failed",...(passed?{}:{failed_checks:[${JSON.stringify(file)}]})}));\nprocess.exit(passed?0:1);\n`;
	const sourcePath = resolve(G2_ROOT, `${verifierId}.mjs`); writeFileSync(sourcePath, source);
	const task: TaskSpecV0B = { schema_version: 1, task_id: "v37-g2-publication-task", instruction_ref: "v37-g2-production-publication", instruction_sha256: sha256("v37-g2-production-publication"), workspace_source_ref: workspace, workspace_source_digest: treeDigest(workspace), writable_paths: ["subject.txt"], protected_paths: ["protected.txt"], verifier_id: verifierId, verifier_ref: sourcePath, verifier_sha256: fileSha256(sourcePath), acceptance_visibility: "hidden_external", tool_profile_id: "v3g3_bounded_local", command_descriptors: [], verifier_command: { executable: "current_node_executable", argv: [sourcePath], cwd: "project", timeout_ms: 5_000, output_limit_bytes: 8_192 } };
	return { task, sourcePath };
}

function executionEvents(prefix: string, count: number): FauxExecutionEventV3[] {
	return Array.from({ length: count }, (_, index) => ({ seq: index + 1, type: "provider_call" as const, call_id: `${prefix}-${index}` }));
}

async function promoteCandidate(value: RefinementCandidateV3): Promise<void> {
	const agentWorkspace = resolve(G2_ROOT, "staging-agent"); const acceptedBase = resolve(G2_ROOT, "accepted-base");
	mkdirSync(agentWorkspace, { recursive: true }); mkdirSync(acceptedBase, { recursive: true });
	const stagedRoot = resolve(G2_ROOT, "staged");
	const staged = await stageCandidateStateV3({ candidate: value, stateRoot: stagedRoot, agentWorkspaceRoot: agentWorkspace, acceptedBaseRoots: [acceptedBase], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	const initialized = await inspectStateStoreV3({ stateRoot: STATE_ROOT, expectedProjectId: "v37-g1-project", immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(initialized.integrity_valid, true, initialized.errors.join("; "));
	const prior = { binding_revision: initialized.active!.binding_revision, state_version: initialized.active!.state_version, state_digest: initialized.active!.state_digest };
	const workspace = resolve(G2_ROOT, "publication-workspace"); mkdirSync(workspace, { recursive: true }); writeFileSync(resolve(workspace, "subject.txt"), "broken\n"); writeFileSync(resolve(workspace, "protected.txt"), "protected-stable\n");
	const verifier = publicationVerifier(workspace);
	const regression = publicationVerifier(workspace, "v37-g2-publication-protected", "protected.txt", "protected-stable\n");
	const validationRoot = registeredFollowUpPromotionValidationRootV37(options);
	const publicationPort: FauxValidationPortV3 = { execute: async ({ state, workspaceRoot }) => { if (state.status === "staged_inactive") writeFileSync(resolve(workspaceRoot, "subject.txt"), "fixed\n"); return { settled: true, events: executionEvents(state.status, state.status === "accepted" ? 3 : 2) }; } };
	const baseState = initialized.versions.find((entry) => entry.state_digest === prior.state_digest)!;
	const validated = await executeSymmetricValidationV3({ projectRoot: PROJECT_ROOT, runRoot: validationRoot, validationId: "v37-g2-production-publication", projectId: "v37-g1-project", sourceWorkspaceRoot: workspace, task: verifier.task, verifier, regressions: [regression], baseState, candidateState: staged.state, providerModelProfileDigest: sha256("v37-g2-publication-provider"), toolProfileDigest: sha256("v37-g2-publication-tools"), budgetDigest: sha256("v37-g2-publication-budget"), hardConstraintsDigest: sha256("v37-g2-publication-constraints"), port: publicationPort });
	const applied = await applyValidationDecisionV3({ stateRoot: STATE_ROOT, projectId: "v37-g1-project", runRoot: validationRoot, validationRef: validated.validationRef, stagedStateRoot: stagedRoot, candidateStateDigest: staged.state.state_digest, expectedActive: prior, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(applied.decision.result, "promoted");
	const checked = await inspectStateStoreV3({ stateRoot: STATE_ROOT, expectedProjectId: "v37-g1-project", immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(checked.integrity_valid, true, checked.errors.join("; "));
}

test.before(async () => {
	rmSync(ROOT, { recursive: true, force: true }); rmSync(G2_ROOT, { recursive: true, force: true }); rmSync(resolve(PROJECT_ROOT, ".runs/v37/host-authority"), { recursive: true, force: true });
	const agentWorkspace = resolve(ROOT, "agent-workspace"); const acceptedBase = resolve(ROOT, "accepted-base"); mkdirSync(agentWorkspace, { recursive: true }); mkdirSync(acceptedBase, { recursive: true });
	const initialized = await initializeStateStoreV3({ stateRoot: STATE_ROOT, projectId: "v37-g1-project", agentWorkspaceRoot: agentWorkspace, acceptedBaseRoots: [acceptedBase], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(initialized.version.state_digest, "ef49e812b72b03b23deeffec51e06b9c84f6cdcdfcc9d6c0f7969e70b94b8956");
	createWorkflowRegistrationV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, caseId: CASE_ID, workflowId: WORKFLOW_ID, createdAt: "2026-08-20T02:00:00.000Z" });
	bindPrimaryRunV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID, runId: "v37-g2-primary", runRoot: RUN_ROOT, boundAt: "2026-08-20T02:10:00.000Z" });
	await executeRunV2A({ projectRoot: PROJECT_ROOT, runRoot: RUN_ROOT, runId: "v37-g2-primary", primaryMode: "fail", candidateModes: ["pass", "pass"] });
	persistRegisteredRecoveryPackageV37(recoveryOptions); admitRegisteredRecoveryV37(recoveryOptions);
	candidate = (await producePromptCandidateV37({ ...recoveryOptions, immutableBasePrompt: SYSTEM_PROMPT, port })).candidate;
	await promoteCandidate(candidate);
	await prepareRegisteredFollowUpV37({ ...options, candidate });
	await executeRegisteredFollowUpV37(options);
	submitRegisteredFollowUpEvidenceV37(options);
	admissionId = (await admitRegisteredFollowUpV37(options)).admission_id;
});

test("fixed profile loads exact effective and parent execution identities and rejects caller override", () => {
	const loaded = loadRegisteredFollowUpExecutionProfileV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID });
	assert.equal(loaded.profile.follow_up_execution_profile_digest, "70984877cb930789f19eb34f485dc426217f1f7c3cc2c17472582ab450cefbb8");
	assert.equal(loaded.profile.provider_profile.external, false);
	assert.equal(loaded.profile.parent_provider_profile_digest, "f695d0e636960c117c7176bd395e6fc19d2adaa9f649cf68973a15d715662e89");
	assert.match(loaded.authority.follow_up_execution_authority_digest, /^[a-f0-9]{64}$/);
	assert.throws(() => loadRegisteredFollowUpExecutionProfileV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID, profile: { external: true } } as never), /override rejected/);
});

test("binding uses promoted applicable prompt State and production V3.6 observes exact composed prompt", async () => {
	const root = resolve(PROJECT_ROOT, DATA_ROOT, "workflows", WORKFLOW_ID, "follow-up");
	const binding = readJson<any>(resolve(root, "binding.json")); const observation = readJson<any>(resolve(root, "runtime/runs", options.followUpRunId, "registered-observation.json")); const manifest = readJson<any>(resolve(root, "runtime/runs", options.followUpRunId, "manifest.json"));
	const loaded = loadRegisteredFollowUpExecutionProfileV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID });
	assert.equal(binding.state_version_id, 1); assert.equal(binding.candidate_digest, candidate.candidate_digest); assert.equal(observation.system_prompt_digest, binding.composed_prompt_digest); assert.equal(observation.frozen_binding_digest, binding.frozen_binding_digest); assert.deepEqual([observation.provider_profile_digest, observation.tool_profile_digest, observation.command_profile_digest, observation.budget_profile_digest, observation.stop_condition_profile_digest], [loaded.profile.provider_profile_digest, loaded.profile.tool_profile_digest, loaded.profile.command_profile_digest, loaded.profile.budget_profile_digest, loaded.profile.stop_condition_profile_digest]); assert.match(observation.task_policy_input_digest, /^[a-f0-9]{64}$/); assert.match(observation.runtime_budget_input_digest, /^[a-f0-9]{64}$/); assert.equal(manifest.real_model_calls, 0); assert.equal(manifest.external_provider_calls, 0); assert.equal(manifest.project_command_executions, 0);
	await assert.rejects(prepareRegisteredFollowUpV37({ ...options, followUpRunId: "v37-g2-mismatch", candidate: { ...candidate, candidate_digest: "0".repeat(64) } }), /Candidate identity invalid/);
});

test("formal Verifier, Outcome, second confirmation and independent admission recompute", async () => {
	const inspected = await inspectRegisteredFollowUpAdmissionV37(options);
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; ")); assert.equal(inspected.admission!.result, "admitted");
	const root = resolve(PROJECT_ROOT, DATA_ROOT, "workflows", WORKFLOW_ID, "follow-up");
	const verifier = readJson<any>(resolve(root, "verifier.json")); const outcome = readJson<any>(resolve(root, "outcome.json")); const confirmation = readJson<any>(resolve(root, "confirmation.json")); const recoveryConfirmation = readJson<any>(resolve(PROJECT_ROOT, DATA_ROOT, "workflows", WORKFLOW_ID, "recovery/confirmation.json"));
	assert.equal(verifier.status, "passed"); assert.equal(outcome.formal_outcome, "passed"); assert.equal(outcome.terminal_status, "settled"); assert.equal(confirmation.kind, "v37_follow_up_evidence_confirmation_receipt"); assert.notEqual(confirmation.confirmation_receipt_digest, recoveryConfirmation.confirmation_receipt_digest);
	assert.deepEqual(submitRegisteredFollowUpEvidenceV37(options), { confirmation, request: readJson(resolve(root, "request.json")) });
});

test("actual frozen Verifier fails on deterministic negative material and missing/invalid formal artifacts fail closed", async () => {
	const registered = loadWorkflowRegistrationV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID });
	const profile = loadRegisteredFollowUpExecutionProfileV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID }).profile;
	const negative = resolve(G2_ROOT, "non-registered-verifier-negative"); const source = registered.loadedCase.manifest.follow_up_source_baseline_spec.body as any; const verifier = registered.loadedCase.manifest.follow_up_verifier_spec.body as any;
	mkdirSync(dirname(resolve(negative, source.source_path)), { recursive: true }); mkdirSync(dirname(resolve(negative, verifier.verifier_path)), { recursive: true });
	writeFileSync(resolve(negative, source.source_path), source.source_bytes, { encoding: "utf8", flag: "wx" }); writeFileSync(resolve(negative, verifier.verifier_path), verifier.verifier_bytes, { encoding: "utf8", flag: "wx" });
	const descriptor = profile.command_profile.descriptors[0]; const failed = spawnSync(process.execPath, descriptor.argv, { cwd: negative, shell: false, windowsHide: true, timeout: descriptor.timeout_seconds * 1000, maxBuffer: descriptor.max_combined_output_bytes, env: { V0B_WORKSPACE: negative }, encoding: "utf8" });
	assert.equal(failed.status, 1); assert.match(`${failed.stdout}${failed.stderr}`, /fail 1/);
	await inspectAcceptedArtifactMutation("outcome.json", null, /follow-up Outcome is missing/);
	await inspectAcceptedArtifactMutation("verifier.json", (value) => { value.status = "invalid"; }, /follow-up Verifier digest mismatch/);
});

test("tampered observation, Outcome and cross-workflow package fail closed", async () => {
	await inspectAcceptedArtifactMutation(`runtime/runs/${options.followUpRunId}/registered-observation.json`, (value) => { value.system_prompt_digest = "0".repeat(64); }, /follow-up observation digest mismatch/);
	await inspectAcceptedArtifactMutation("outcome.json", (value) => { value.formal_outcome = "failed"; }, /follow-up Outcome digest mismatch/);
	await inspectAcceptedArtifactMutation("evidence.json", (value) => {
		value.workflow_id = "foreign-workflow";
		const body = { ...value }; delete body.evidence_body_digest; value.evidence_body_digest = digestObject(body);
	}, /follow-up formal artifact lineage mismatch/);
});

test("active-pointer drift at the production pre-request hook prevents Provider dispatch", async () => {
	const root = resolve(G2_ROOT, "pointer-drift-seam"); const workspace = resolve(root, "workspace"); mkdirSync(workspace, { recursive: true }); writeFileSync(resolve(workspace, "subject.txt"), "stable\n");
	const service = new PersistentInteractiveSessionServiceV36({ runtimeRoot: resolve(root, "runtime"), workspaceRoot: workspace, projectId: "v37-g2-project", workspaceId: "v37-g2-drift-workspace", sessionId: "v37-g2-drift-session", title: "drift", sessionPinDigest: sha256("v37-g2-drift-pin") }); await service.create();
	const models = createModels(); const provider = fauxProvider({ provider: "v37-g2-drift-faux" }); models.setProvider(provider.provider); provider.setResponses([() => fauxAssistantMessage("must not dispatch", { timestamp: 1 })]);
	const taskPolicy = { writable_paths: [], protected_paths: [], command_descriptors: [] };
	await assert.rejects(service.executeBoundedTurn({ sessionId: "v37-g2-drift-session", runId: "v37-g2-drift-run", prompt: "bounded task", taskPolicy, commandExecutor: async () => { throw new Error("unused"); }, budgetProfile: V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE, models, model: provider.getModel(), systemPrompt: "registered composed prompt", authorityDigest: sha256("v37-g2-drift-authority"), registeredRuntimeObservation: { workflow_id: "v37-g2-drift-workflow", workflow_registration_digest: sha256("v37-g2-drift-workflow-registration"), follow_up_run_id: "v37-g2-drift-run", system_prompt_digest: sha256("registered composed prompt"), frozen_binding_digest: sha256("v37-g2-drift-binding"), follow_up_execution_authority_digest: sha256("v37-g2-drift-authority"), provider_profile_digest: sha256("v37-g2-drift-provider"), tool_profile_digest: sha256("v37-g2-drift-tool"), command_profile_digest: sha256("v37-g2-drift-command"), budget_profile_digest: sha256("v37-g2-drift-budget"), stop_condition_profile_digest: sha256("v37-g2-drift-stop"), task_policy_input_digest: digestObject(taskPolicy), runtime_budget_input_digest: digestObject(V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE), before_first_provider_request: () => { throw new Error("active State pointer drifted before first Provider request"); } } }), /pointer drifted/);
	assert.equal(provider.state.callCount, 0); assert.equal(existsSync(resolve(root, "runtime/runs/v37-g2-drift-run/registered-observation.json")), false);
});

test("registered observation rejects actual task-policy or runtime-budget input mismatch before dispatch", async () => {
	const root = resolve(G2_ROOT, "profile-input-mismatch"); const workspace = resolve(root, "workspace"); mkdirSync(workspace, { recursive: true });
	const service = new PersistentInteractiveSessionServiceV36({ runtimeRoot: resolve(root, "runtime"), workspaceRoot: workspace, projectId: "v37-g2-project", workspaceId: "v37-g2-input-workspace", sessionId: "v37-g2-input-session", title: "input mismatch", sessionPinDigest: sha256("v37-g2-input-pin") }); await service.create();
	const models = createModels(); const provider = fauxProvider({ provider: "v37-g2-input-faux" }); models.setProvider(provider.provider); provider.setResponses([() => fauxAssistantMessage("must not dispatch", { timestamp: 1 })]);
	const taskPolicy = { writable_paths: [], protected_paths: [], command_descriptors: [] };
	await assert.rejects(service.executeBoundedTurn({ sessionId: "v37-g2-input-session", runId: "v37-g2-input-run", prompt: "bounded task", taskPolicy, commandExecutor: async () => { throw new Error("unused"); }, budgetProfile: V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE, models, model: provider.getModel(), systemPrompt: "registered composed prompt", authorityDigest: sha256("v37-g2-input-authority"), registeredRuntimeObservation: { workflow_id: "v37-g2-input-workflow", workflow_registration_digest: sha256("v37-g2-input-registration"), follow_up_run_id: "v37-g2-input-run", system_prompt_digest: sha256("registered composed prompt"), frozen_binding_digest: sha256("v37-g2-input-binding"), follow_up_execution_authority_digest: sha256("v37-g2-input-authority"), provider_profile_digest: sha256("v37-g2-input-provider"), tool_profile_digest: sha256("v37-g2-input-tool"), command_profile_digest: sha256("v37-g2-input-command"), budget_profile_digest: sha256("v37-g2-input-budget"), stop_condition_profile_digest: sha256("v37-g2-input-stop"), task_policy_input_digest: sha256("wrong-task-policy"), runtime_budget_input_digest: digestObject(V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE), before_first_provider_request: () => {} } }), /observation input is invalid/);
	assert.equal(provider.state.callCount, 0);
});

test("new canonical adapter reaches unchanged retain decision without direct State supersede", async () => {
	const canonical = await normalizeRegisteredBoundFollowUpV37(options);
	assert.equal(canonical.outcome_status, "passed"); assert.equal(canonical.verifier_status, "passed"); assert.equal(canonical.admission_identity.admission_id, admissionId);
	const assessmentRoot = resolve(G2_ROOT, "assessments"); const promotionRoot = registeredFollowUpPromotionValidationRootV37(options);
	const result = await persistStateAssessmentG2({ projectRoot: PROJECT_ROOT, assessmentRoot, admissionRoot: "unused-v37-admission-root", registrationPath: "unused-v37-registration", admissionId, projectId: "v37-g1-project", stateRoot: STATE_ROOT, expectedActive: canonical.bound_active_state_identity, promotionValidationRunRoot: promotionRoot, comparisonRunRoot: null, requestedRollbackTargetDigest: null, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256, registeredFollowUp: options });
	assert.equal(result.assessment.assessment_result, "retain"); assert.equal(result.assessment.assessment_reason, "bound_followup_passed"); assert.equal(result.assessment.bound_state.state_digest, canonical.bound_active_state_identity.state_digest);
	const clone = resolve(G2_ROOT, "state-clone"); cpSync(STATE_ROOT, clone, { recursive: true });
	await assert.rejects(persistStateAssessmentG2({ projectRoot: PROJECT_ROOT, assessmentRoot: resolve(G2_ROOT, "clone-assessments"), admissionRoot: "unused-v37-admission-root", registrationPath: "unused-v37-registration", admissionId, projectId: "v37-g1-project", stateRoot: clone, expectedActive: canonical.bound_active_state_identity, promotionValidationRunRoot: promotionRoot, comparisonRunRoot: null, requestedRollbackTargetDigest: null, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256, registeredFollowUp: options }), /State scope/);
});

test("accepted follow-up survives production rollback while frozen historical lineage still fails closed", async () => {
	const followUpRoot = resolve(PROJECT_ROOT, DATA_ROOT, "workflows", WORKFLOW_ID, "follow-up");
	const binding = readJson<any>(resolve(followUpRoot, "binding.json")); const acceptedAdmission = readJson<any>(resolve(followUpRoot, "admission.json")); const canonicalBefore = await normalizeRegisteredBoundFollowUpV37(options); const beforeTree = registeredFollowUpTreeDigestV37(options);
	const before = await inspectStateStoreV3({ stateRoot: STATE_ROOT, expectedProjectId: "v37-g1-project", immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 }); assert.equal(before.integrity_valid, true, before.errors.join("; ")); assert.equal(before.active!.state_digest, binding.active_state_digest);
	const boundVersion = before.versions.find((entry) => entry.state_version === binding.state_version_id && entry.state_digest === binding.active_state_digest); assert.ok(boundVersion?.parent_state_digest);
	const rolledBack = await rollbackActiveStateV3({ stateRoot: STATE_ROOT, projectId: "v37-g1-project", targetStateDigest: boundVersion.parent_state_digest, expectedActive: { binding_revision: before.active!.binding_revision, state_version: before.active!.state_version, state_digest: before.active!.state_digest }, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(rolledBack.decision.result, "rolled_back"); assert.equal(rolledBack.active.state_digest, boundVersion.parent_state_digest);
	const inspected = await inspectRegisteredFollowUpAdmissionV37(options); assert.equal(inspected.integrity_valid, true, inspected.errors.join("; ")); assert.deepEqual(inspected.admission, acceptedAdmission);
	const canonicalAfter = await normalizeRegisteredBoundFollowUpV37({ ...options, historicalReadOnly: true }); assert.deepEqual(canonicalAfter, canonicalBefore); assert.equal(registeredFollowUpTreeDigestV37(options), beforeTree);
	await assert.rejects(prepareRegisteredFollowUpV37({ ...options, followUpRunId: "v37-g2-post-rollback-prepare", candidate }), /newly promoted active State/);
	await assert.rejects(executeRegisteredFollowUpV37(options), /newly promoted active State/);
	await assert.rejects(admitRegisteredFollowUpV37(options), /newly promoted active State/);
	assert.equal(registeredFollowUpTreeDigestV37(options), beforeTree);
	for (const [path, mutate, expected] of [
		[resolve(STATE_ROOT, "versions", binding.active_state_digest, "state.json"), (value: any) => { value.state_digest = "0".repeat(64); }, /follow-up bound State inspection failed/],
		[resolve(STATE_ROOT, "decisions", `${binding.promotion_decision_id}.json`), (value: any) => { value.decision_digest = "0".repeat(64); }, /follow-up bound State inspection failed/],
		[resolve(registeredFollowUpPromotionValidationRootV37(options), "validation.json"), (value: any) => { value.validation_digest = "0".repeat(64); }, /follow-up promotion validation fails closed/],
	] as const) await inspectOriginalAuthorityMutation(path, mutate, expected);
	const restored = await inspectRegisteredFollowUpAdmissionV37(options); assert.equal(restored.integrity_valid, true, restored.errors.join("; ")); assert.deepEqual(restored.admission, acceptedAdmission); assert.equal(registeredFollowUpTreeDigestV37(options), beforeTree);
});

test("ordinary V3.6 cannot become admitted and Schema 2 remains absent", async () => {
	const missing = await inspectRegisteredFollowUpAdmissionV37({ ...options, workflowId: "ordinary-v36-workflow" }); assert.equal(missing.integrity_valid, false);
	for (const path of ["workbench/src/contracts/final-capstone-g3-types.ts", "workbench/src/pi/final-capstone-g3-v36-port.ts", "workbench/src/final-capstone-g3.ts", "workbench/src/inspect-final-capstone-g3.ts", "workbench/tests/final-capstone-g3-closed-loop.test.ts"]) assert.equal(existsSync(resolve(PROJECT_ROOT, path)), false, path);
});

test("disabled registration blocks new actions while accepted follow-up reopens read-only", async () => {
	const acceptedProfile = loadRegisteredFollowUpExecutionProfileV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID }); const acceptedAdmission = readJson<any>(resolve(PROJECT_ROOT, DATA_ROOT, "workflows", WORKFLOW_ID, "follow-up/admission.json")); const beforeTree = registeredFollowUpTreeDigestV37(options);
	const registryPath = resolve(PROJECT_ROOT, "workbench/config/v37/registered-cases/registry-v1.json"); const originalRegistryBytes = readFileSync(registryPath, "utf8"); const registry = JSON.parse(originalRegistryBytes) as any; const first = readJson<any>(resolve(PROJECT_ROOT, registry.entries[0].envelope_locations[0])); const disabledBody = { ...first, registration_revision: 2, previous_registration_digest: first.registration_digest, registration_status: "disabled", disabled_at: "2026-08-20T06:00:00.000Z" }; delete disabledBody.registration_digest; const disabled = { ...disabledBody, registration_digest: digestObject(disabledBody) }; const disabledLocation = ".runs/v37/g2-tests/disabled-envelope.json"; writeJson(resolve(PROJECT_ROOT, disabledLocation), disabled); registry.entries[0].envelope_locations.push(disabledLocation); registry.entries[0].envelope_digests.push(disabled.registration_digest); registry.entries[0].current_registration_digest = disabled.registration_digest; delete registry.registry_index_digest; registry.registry_index_digest = digestObject(registry);
	try {
		writeJson(registryPath, registry);
		assert.throws(() => loadRegisteredFollowUpExecutionProfileV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID }), /disabled/);
		await assert.rejects(prepareRegisteredFollowUpV37({ ...options, followUpRunId: "v37-g2-disabled-prepare", candidate }), /disabled/); await assert.rejects(executeRegisteredFollowUpV37(options), /disabled/); assert.throws(() => submitRegisteredFollowUpEvidenceV37(options), /disabled/); await assert.rejects(admitRegisteredFollowUpV37(options), /disabled/);
		const inspected = await inspectRegisteredFollowUpAdmissionV37(options); assert.equal(inspected.integrity_valid, true, inspected.errors.join("; ")); assert.equal(inspected.admission!.admission_id, acceptedAdmission.admission_id); assert.equal(inspected.admission!.admission_digest, acceptedAdmission.admission_digest);
		const canonical = await normalizeRegisteredBoundFollowUpV37({ ...options, historicalReadOnly: true }); assert.equal(canonical.admission_identity.admission_digest, acceptedAdmission.admission_digest); assert.equal(registeredFollowUpTreeDigestV37(options), beforeTree);
		const historical = loadRegisteredFollowUpExecutionProfileV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID, allowHistoricalReadOnly: true }); assert.equal(historical.profile.follow_up_execution_profile_digest, acceptedProfile.profile.follow_up_execution_profile_digest); assert.equal(historical.authority.follow_up_execution_authority_digest, acceptedProfile.authority.follow_up_execution_authority_digest);
	} finally { writeFileSync(registryPath, originalRegistryBytes, "utf8"); }
});
