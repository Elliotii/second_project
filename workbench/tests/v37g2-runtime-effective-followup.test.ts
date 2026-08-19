import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { createModels, fauxAssistantMessage, fauxProvider } from "@earendil-works/pi-ai";
import type { ImprovementOpportunityV3, RefinementCandidateV3 } from "../src/contracts/v3-types.ts";
import { artifactRef } from "../src/evidence/artifacts.ts";
import { digestObject, sha256, stableJson } from "../src/hash.ts";
import { inspectRegisteredFollowUpAdmissionV37 } from "../src/inspect-v37g2.ts";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_SHA256 } from "../src/prompts/base.ts";
import type { BoundedProposalPortV3 } from "../src/refinement/producer-v3.ts";
import { executeRunV2A } from "../src/run-v2.ts";
import { PersistentInteractiveSessionServiceV36 } from "../src/session/persistent-session-v36.ts";
import { acceptedStateVersionDigestV3 } from "../src/state/identity-v3.ts";
import { stageCandidateStateV3 } from "../src/state/staging-v3.ts";
import { initializeStateStoreV3, inspectStateStoreV3 } from "../src/state/store-v3.ts";
import { persistStateAssessmentG2 } from "../src/state/state-feedback-g2.ts";
import { V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE } from "../src/v36/budget-profile-v36.ts";
import { producePromptCandidateV37 } from "../src/v37/candidate-v37.ts";
import { loadRegisteredFollowUpExecutionProfileV37 } from "../src/v37/follow-up-execution-profile-v37.ts";
import { admitRegisteredRecoveryV37, persistRegisteredRecoveryPackageV37 } from "../src/v37/registered-recovery-v37.ts";
import { admitRegisteredFollowUpV37, executeRegisteredFollowUpV37, normalizeRegisteredBoundFollowUpV37, prepareRegisteredFollowUpV37, submitRegisteredFollowUpEvidenceV37, type RegisteredFollowUpOptionsV37 } from "../src/v37/registered-follow-up-v37.ts";
import { bindPrimaryRunV37, createWorkflowRegistrationV37 } from "../src/v37/workflow-registration-v37.ts";
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

function rel(path: string): string { return relative(PROJECT_ROOT, path).split(sep).join("/"); }
function writeJson(path: string, value: unknown): void { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, `${stableJson(value)}\n`, "utf8"); }
function readJson<T>(path: string): T { return JSON.parse(readFileSync(path, "utf8")) as T; }

function proposal(opportunity: ImprovementOpportunityV3, base: string): unknown {
	const applicability = { task_kinds: ["typescript-maintenance"], failure_families: ["verifier-failure"] };
	return { schema_version: 1, proposal_id: "v37-g2-candidate-proposal", evidence_digest: opportunity.evidence_identity.evidence_digest, expected_base_state_digest: base, diagnosis: { pattern_id: opportunity.trigger, statement: "The registered Primary failed and bounded Recovery succeeded.", evidence_refs: structuredClone(opportunity.evidence_refs) }, lesson: { statement: "Use the registered verification discipline.", expected_outcome: "The related task is checked before completion.", applicability }, edits: [{ kind: "prompt_addendum", entry_id: "v37-verify-before-finish", content: GENERIC, applicability }] };
}

const port: BoundedProposalPortV3 = { propose: async (input) => proposal(input.opportunity, input.expected_base_state_digest) };

async function promoteCandidate(value: RefinementCandidateV3): Promise<void> {
	const agentWorkspace = resolve(G2_ROOT, "staging-agent"); const acceptedBase = resolve(G2_ROOT, "accepted-base");
	mkdirSync(agentWorkspace, { recursive: true }); mkdirSync(acceptedBase, { recursive: true });
	const stagedRoot = resolve(G2_ROOT, "staged");
	const staged = await stageCandidateStateV3({ candidate: value, stateRoot: stagedRoot, agentWorkspaceRoot: agentWorkspace, acceptedBaseRoots: [acceptedBase], immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	const initialized = await inspectStateStoreV3({ stateRoot: STATE_ROOT, expectedProjectId: "v37-g1-project", immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	assert.equal(initialized.integrity_valid, true, initialized.errors.join("; "));
	const prior = initialized.active!;
	const versionBody = { schema_version: 1 as const, status: "accepted" as const, project_id: "v37-g1-project", state_version: 1, parent_state_digest: prior.state_digest, source_candidate_id: value.candidate_id, source_candidate_digest: value.candidate_digest, source_staged_state_digest: staged.state.state_digest, entries: structuredClone(staged.state.entries) };
	const version = { ...versionBody, state_digest: acceptedStateVersionDigestV3(versionBody) };
	writeJson(resolve(STATE_ROOT, "versions", version.state_digest, "state.json"), version);
	const validationRoot = resolve(G2_ROOT, "promotion-marker"); mkdirSync(validationRoot, { recursive: true }); writeJson(resolve(validationRoot, "validation.json"), { schema_version: 1, marker: "registered-v37-g2-promotion" });
	const nextActive = { binding_revision: prior.binding_revision + 1, state_version: 1, state_digest: version.state_digest };
	const decisionBody = { schema_version: 1 as const, decision_sequence: 1, kind: "promotion" as const, project_id: "v37-g1-project", result: "promoted" as const, reason: "base_failed_candidate_passed" as const, candidate_id: value.candidate_id, candidate_digest: value.candidate_digest, staged_state_digest: staged.state.state_digest, validation_id: "v37-g2-promotion-validation", validation_digest: sha256("v37-g2-promotion-validation"), validation_ref: artifactRef(validationRoot, "validation.json", "application/json", false), prior_active: { binding_revision: prior.binding_revision, state_version: prior.state_version, state_digest: prior.state_digest }, next_active: nextActive, rollback_target_digest: null };
	const decisionDigest = digestObject(decisionBody); const decision = { ...decisionBody, decision_id: `decision-${decisionDigest.slice(0, 32)}`, decision_digest: decisionDigest };
	writeJson(resolve(STATE_ROOT, "decisions", `${decision.decision_id}.json`), decision);
	const pointerBody = { schema_version: 1 as const, project_id: "v37-g1-project", ...nextActive, decision_id: decision.decision_id };
	writeJson(resolve(STATE_ROOT, "active.json"), { ...pointerBody, pointer_digest: digestObject(pointerBody) });
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
	assert.equal(loaded.profile.follow_up_execution_profile_digest, "10ab0ebbdcbf1861bfed078400bcd75df900e28e82f4a3c6dfece4b18718dff5");
	assert.equal(loaded.profile.provider_profile.external, false);
	assert.equal(loaded.profile.parent_provider_profile_digest, "f695d0e636960c117c7176bd395e6fc19d2adaa9f649cf68973a15d715662e89");
	assert.match(loaded.authority.follow_up_execution_authority_digest, /^[a-f0-9]{64}$/);
	assert.throws(() => loadRegisteredFollowUpExecutionProfileV37({ projectRoot: PROJECT_ROOT, dataRoot: DATA_ROOT, workflowId: WORKFLOW_ID, profile: { external: true } } as never), /override rejected/);
});

test("binding uses promoted applicable prompt State and production V3.6 observes exact composed prompt", async () => {
	const root = resolve(PROJECT_ROOT, DATA_ROOT, "workflows", WORKFLOW_ID, "follow-up");
	const binding = readJson<any>(resolve(root, "binding.json")); const observation = readJson<any>(resolve(root, "runtime/runs", options.followUpRunId, "registered-observation.json")); const manifest = readJson<any>(resolve(root, "runtime/runs", options.followUpRunId, "manifest.json"));
	assert.equal(binding.state_version_id, 1); assert.equal(binding.candidate_digest, candidate.candidate_digest); assert.equal(observation.system_prompt_digest, binding.composed_prompt_digest); assert.equal(observation.frozen_binding_digest, binding.frozen_binding_digest); assert.equal(manifest.real_model_calls, 0); assert.equal(manifest.external_provider_calls, 0); assert.equal(manifest.project_command_executions, 0);
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

test("tampered observation, Outcome and cross-workflow package fail closed", async () => {
	for (const [label, file, mutate] of [
		["observation", `runtime/runs/${options.followUpRunId}/registered-observation.json`, (value: any) => { value.system_prompt_digest = "0".repeat(64); }],
		["outcome", "outcome.json", (value: any) => { value.formal_outcome = "failed"; }],
		["workflow", "evidence.json", (value: any) => { value.workflow_id = "foreign-workflow"; }],
	] as const) {
		const copied = resolve(G2_ROOT, `tamper-${label}`); cpSync(resolve(PROJECT_ROOT, DATA_ROOT), copied, { recursive: true }); const path = resolve(copied, "workflows", WORKFLOW_ID, "follow-up", file); const value = readJson<any>(path); mutate(value); writeJson(path, value);
		const result = await inspectRegisteredFollowUpAdmissionV37({ ...options, dataRoot: rel(copied) }); assert.equal(result.integrity_valid, false, label);
	}
});

test("active-pointer drift at the production pre-request hook prevents Provider dispatch", async () => {
	const root = resolve(G2_ROOT, "pointer-drift-seam"); const workspace = resolve(root, "workspace"); mkdirSync(workspace, { recursive: true }); writeFileSync(resolve(workspace, "subject.txt"), "stable\n");
	const service = new PersistentInteractiveSessionServiceV36({ runtimeRoot: resolve(root, "runtime"), workspaceRoot: workspace, projectId: "v37-g2-project", workspaceId: "v37-g2-drift-workspace", sessionId: "v37-g2-drift-session", title: "drift", sessionPinDigest: sha256("v37-g2-drift-pin") }); await service.create();
	const models = createModels(); const provider = fauxProvider({ provider: "v37-g2-drift-faux" }); models.setProvider(provider.provider); provider.setResponses([() => fauxAssistantMessage("must not dispatch", { timestamp: 1 })]);
	await assert.rejects(service.executeBoundedTurn({ sessionId: "v37-g2-drift-session", runId: "v37-g2-drift-run", prompt: "bounded task", taskPolicy: { writable_paths: [], protected_paths: [], command_descriptors: [] }, commandExecutor: async () => { throw new Error("unused"); }, budgetProfile: V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE, models, model: provider.getModel(), systemPrompt: "registered composed prompt", authorityDigest: sha256("v37-g2-drift-authority"), registeredRuntimeObservation: { workflow_id: "v37-g2-drift-workflow", workflow_registration_digest: sha256("v37-g2-drift-workflow-registration"), follow_up_run_id: "v37-g2-drift-run", system_prompt_digest: sha256("registered composed prompt"), frozen_binding_digest: sha256("v37-g2-drift-binding"), follow_up_execution_authority_digest: sha256("v37-g2-drift-authority"), command_profile_digest: sha256("v37-g2-drift-command"), before_first_provider_request: () => { throw new Error("active State pointer drifted before first Provider request"); } } }), /pointer drifted/);
	assert.equal(provider.state.callCount, 0); assert.equal(existsSync(resolve(root, "runtime/runs/v37-g2-drift-run/registered-observation.json")), false);
});

test("new canonical adapter reaches unchanged retain decision without direct State supersede", async () => {
	const canonical = await normalizeRegisteredBoundFollowUpV37(options);
	assert.equal(canonical.outcome_status, "passed"); assert.equal(canonical.verifier_status, "passed"); assert.equal(canonical.admission_identity.admission_id, admissionId);
	const assessmentRoot = resolve(G2_ROOT, "assessments"); const promotionRoot = resolve(G2_ROOT, "promotion-marker");
	const result = await persistStateAssessmentG2({ projectRoot: PROJECT_ROOT, assessmentRoot, admissionRoot: "unused-v37-admission-root", registrationPath: "unused-v37-registration", admissionId, projectId: "v37-g1-project", stateRoot: STATE_ROOT, expectedActive: canonical.bound_active_state_identity, promotionValidationRunRoot: promotionRoot, comparisonRunRoot: null, requestedRollbackTargetDigest: null, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256, registeredFollowUp: options });
	assert.equal(result.assessment.assessment_result, "retain"); assert.equal(result.assessment.assessment_reason, "bound_followup_passed"); assert.equal(result.assessment.bound_state.state_digest, canonical.bound_active_state_identity.state_digest);
});

test("ordinary V3.6 cannot become admitted and Schema 2 remains absent", async () => {
	const missing = await inspectRegisteredFollowUpAdmissionV37({ ...options, workflowId: "ordinary-v36-workflow" }); assert.equal(missing.integrity_valid, false);
	for (const path of ["workbench/src/contracts/final-capstone-g3-types.ts", "workbench/src/pi/final-capstone-g3-v36-port.ts", "workbench/src/final-capstone-g3.ts", "workbench/src/inspect-final-capstone-g3.ts", "workbench/tests/final-capstone-g3-closed-loop.test.ts"]) assert.equal(existsSync(resolve(PROJECT_ROOT, path)), false, path);
});

test("disabled registration blocks new actions while accepted follow-up reopens read-only", async () => {
	const host = resolve(G2_ROOT, "disabled-host"); cpSync(resolve(PROJECT_ROOT, "workbench/src"), resolve(host, "workbench/src"), { recursive: true }); cpSync(resolve(PROJECT_ROOT, "workbench/config/v37"), resolve(host, "workbench/config/v37"), { recursive: true }); cpSync(resolve(PROJECT_ROOT, "fixtures"), resolve(host, "fixtures"), { recursive: true });
	const workflowModule = await import(`${pathToFileURL(resolve(host, "workbench/src/v37/workflow-registration-v37.ts")).href}?before-disable=${Date.now()}`);
	const profileModule = await import(`${pathToFileURL(resolve(host, "workbench/src/v37/follow-up-execution-profile-v37.ts")).href}?before-disable=${Date.now()}`);
	const disabledDataRoot = ".runs/v37/g2-disabled-data"; const disabledWorkflowId = "v37-g2-disabled-workflow";
	workflowModule.createWorkflowRegistrationV37({ projectRoot: host, dataRoot: disabledDataRoot, caseId: CASE_ID, workflowId: disabledWorkflowId, createdAt: "2026-08-20T05:00:00.000Z" });
	const acceptedProfile = profileModule.loadRegisteredFollowUpExecutionProfileV37({ projectRoot: host, dataRoot: disabledDataRoot, workflowId: disabledWorkflowId });
	const registryPath = resolve(host, "workbench/config/v37/registered-cases/registry-v1.json"); const registry = readJson<any>(registryPath); const first = readJson<any>(resolve(host, registry.entries[0].envelope_locations[0])); const disabledBody = { ...first, registration_revision: 2, previous_registration_digest: first.registration_digest, registration_status: "disabled", disabled_at: "2026-08-20T06:00:00.000Z" }; delete disabledBody.registration_digest; const disabled = { ...disabledBody, registration_digest: digestObject(disabledBody) }; const disabledLocation = ".runs/v37/g2-disabled-envelope.json"; writeJson(resolve(host, disabledLocation), disabled); registry.entries[0].envelope_locations.push(disabledLocation); registry.entries[0].envelope_digests.push(disabled.registration_digest); registry.entries[0].current_registration_digest = disabled.registration_digest; delete registry.registry_index_digest; registry.registry_index_digest = digestObject(registry); writeJson(registryPath, registry);
	assert.throws(() => profileModule.loadRegisteredFollowUpExecutionProfileV37({ projectRoot: host, dataRoot: disabledDataRoot, workflowId: disabledWorkflowId }), /disabled/);
	const historical = profileModule.loadRegisteredFollowUpExecutionProfileV37({ projectRoot: host, dataRoot: disabledDataRoot, workflowId: disabledWorkflowId, allowHistoricalReadOnly: true });
	assert.equal(historical.profile.follow_up_execution_profile_digest, acceptedProfile.profile.follow_up_execution_profile_digest); assert.equal(historical.authority.follow_up_execution_authority_digest, acceptedProfile.authority.follow_up_execution_authority_digest);
});
