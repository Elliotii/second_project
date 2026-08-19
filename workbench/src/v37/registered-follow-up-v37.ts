import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall } from "@earendil-works/pi-ai";
import type { BoundedEditBudgetProfileV36 } from "../v36/budget-profile-v36.ts";
import type {
	CanonicalBoundStateAssessmentInputG2,
	FollowUpEvidenceConfirmationReceiptV37,
	FollowUpEvidenceSubmissionRequestV37,
	FollowUpFormalOutcomeV37,
	FollowUpRuntimeObservationV37,
	FollowUpVerifierArtifactV37,
	RegisteredBoundFollowUpAdmissionV37,
	RegisteredBoundFollowUpEvidenceBodyV37,
	RegisteredFollowUpBindingV37,
} from "../contracts/v37-types.ts";
import type { RefinementCandidateV3 } from "../contracts/v3-types.ts";
import { artifactRef } from "../evidence/artifacts.ts";
import type { RuntimeManifestG2V36 } from "../session/persistent-session-v36.ts";
import { PersistentInteractiveSessionServiceV36 } from "../session/persistent-session-v36.ts";
import { digestObject, fileSha256, sha256, stableJson, treeDigest } from "../hash.ts";
import { composePromptAddendaV3 } from "../prompts/adapter-v3.ts";
import { inspectRegisteredRecoveryAdmissionV37 } from "../inspect-v37g1.ts";
import { inspectValidationV3 } from "../refinement/comparator-v3.ts";
import { inspectStateStoreV3 } from "../state/store-v3.ts";
import { managedWorkspaceIdentityV36 } from "../workspace/managed-copy-v36.ts";
import { loadRegisteredFollowUpExecutionProfileV37 } from "./follow-up-execution-profile-v37.ts";
import { loadPrimaryRunBindingV37, loadWorkflowRegistrationV37, v37DataRootPath } from "./workflow-registration-v37.ts";

const ID = /^[a-z0-9][a-z0-9._:-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const INSPECTOR_ID = "inspect-v37g2-registered-follow-up-v1" as const;

export interface RegisteredFollowUpOptionsV37 {
	projectRoot: string;
	dataRoot: string;
	workflowId: string;
	followUpRunId: string;
	sessionId: string;
	workspaceId: string;
	boundAt: string;
	confirmedAt: string;
	requestedAt: string;
}

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function exact(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	const record = value as Record<string, unknown>;
	if (stableJson(Object.keys(record).sort()) !== stableJson([...keys].sort())) throw new Error(`${label} exact-key validation failed`);
	return record;
}

function ordinaryFile(path: string, label: string): string {
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error(`${label} must be an ordinary singly linked file`);
	return path;
}

function workflowFollowUpRoot(options: Pick<RegisteredFollowUpOptionsV37, "projectRoot" | "dataRoot" | "workflowId">, create: boolean): string {
	if (!ID.test(options.workflowId)) throw new Error("follow-up workflow identity invalid");
	const dataRoot = v37DataRootPath(options.projectRoot, options.dataRoot);
	const root = resolve(dataRoot, "workflows", options.workflowId, "follow-up");
	if (!contained(dataRoot, root)) throw new Error("follow-up artifact root escapes V3.7 data root");
	let cursor = dataRoot;
	for (const segment of relative(dataRoot, root).split(sep).filter(Boolean)) {
		cursor = resolve(cursor, segment);
		if (!existsSync(cursor)) {
			if (!create) throw new Error("follow-up artifact root is missing");
			mkdirSync(cursor);
		}
		const stats = lstatSync(cursor);
		if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error("follow-up artifact path contains a link/reparse or non-directory");
	}
	return realpathSync.native(root);
}

function artifactPath(root: string, relativePath: string, label: string, requireExisting: boolean): string {
	if (isAbsolute(relativePath) || relativePath.replaceAll("\\", "/").split("/").includes("..") || relativePath.includes("\0")) throw new Error(`${label} relative path invalid`);
	const target = resolve(root, relativePath);
	if (!contained(root, target)) throw new Error(`${label} escapes follow-up root`);
	let cursor = root;
	for (const segment of relative(root, target).split(sep).filter(Boolean)) {
		cursor = resolve(cursor, segment);
		if (!existsSync(cursor)) {
			if (requireExisting) throw new Error(`${label} is missing`);
			break;
		}
		const stats = lstatSync(cursor);
		if (stats.isSymbolicLink()) throw new Error(`${label} path contains a link/reparse point`);
		if (cursor !== target && !stats.isDirectory()) throw new Error(`${label} path contains a non-directory ancestor`);
	}
	return target;
}

function readJson<T>(root: string, relativePath: string, label: string): T {
	const path = ordinaryFile(artifactPath(root, relativePath, label, true), label);
	const bytes = readFileSync(path, "utf8");
	const value = JSON.parse(bytes) as T;
	if (bytes !== `${stableJson(value)}\n`) throw new Error(`${label} bytes are not canonical`);
	return value;
}

function writeJson(root: string, relativePath: string, value: unknown): void {
	const path = artifactPath(root, relativePath, "follow-up write-once artifact", false);
	const bytes = `${stableJson(value)}\n`;
	if (existsSync(path)) {
		if (readFileSync(ordinaryFile(path, "existing follow-up artifact"), "utf8") !== bytes) throw new Error("follow-up write-once artifact identity conflict");
		return;
	}
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, bytes, { encoding: "utf8", flag: "wx" });
}

function writeBytes(root: string, relativePath: string, bytes: string): void {
	const path = artifactPath(root, relativePath, "follow-up materialized file", false);
	if (existsSync(path)) {
		if (readFileSync(ordinaryFile(path, "existing materialized file"), "utf8") !== bytes) throw new Error("follow-up materialized file identity conflict");
		return;
	}
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, bytes, { encoding: "utf8", flag: "wx" });
}

function bodyDigest<T extends Record<string, unknown>>(value: T, digestKey: keyof T): string {
	const body = { ...value }; delete body[digestKey]; return digestObject(body);
}

function candidateBody(candidate: RefinementCandidateV3): Record<string, unknown> {
	const { candidate_id: _id, candidate_digest: _digest, ...body } = candidate;
	return body;
}

function activeIdentity(active: { binding_revision: number; state_version: number; state_digest: string }) {
	return { binding_revision: active.binding_revision, state_version: active.state_version, state_digest: active.state_digest };
}

function stateRootFromManifest(projectRoot: string, configuredLocation: string): string {
	if (isAbsolute(configuredLocation) || configuredLocation.replaceAll("\\", "/").split("/").includes("..")) throw new Error("State Store configured location invalid");
	const project = realpathSync.native(resolve(projectRoot));
	const state = resolve(project, configuredLocation);
	if (!contained(project, state)) throw new Error("State Store configured location escapes Host project");
	let cursor = project;
	for (const segment of relative(project, state).split(sep).filter(Boolean)) {
		cursor = resolve(cursor, segment);
		if (!existsSync(cursor)) throw new Error("registered State Store is missing");
		const stats = lstatSync(cursor);
		if (stats.isSymbolicLink()) throw new Error("registered State Store path contains a link/reparse point");
	}
	if (!lstatSync(state).isDirectory() || !contained(project, realpathSync.native(state))) throw new Error("registered State Store identity invalid");
	return state;
}

export function registeredFollowUpPromotionValidationRootV37(options: Pick<RegisteredFollowUpOptionsV37, "projectRoot" | "dataRoot" | "workflowId">): string {
	if (!ID.test(options.workflowId)) throw new Error("follow-up workflow identity invalid");
	const dataRoot = v37DataRootPath(options.projectRoot, options.dataRoot);
	const root = resolve(dataRoot, "workflows", options.workflowId, "promotion-validation");
	if (!contained(dataRoot, root)) throw new Error("promotion validation root escapes V3.7 data root");
	return root;
}

async function inspectRegisteredPromotionLineageV37(
	options: RegisteredFollowUpOptionsV37,
	candidate: RefinementCandidateV3,
	state: Awaited<ReturnType<typeof inspectStateStoreV3>>,
) {
	if (!state.active) throw new Error("follow-up promoted active State is missing");
	const activeVersion = state.versions.find((entry) => entry.state_digest === state.active!.state_digest);
	const decision = state.decisions.find((entry) => entry.decision_id === state.active!.decision_id);
	if (!activeVersion || !decision || state.active.state_version < 1 || decision.kind !== "promotion" || decision.result !== "promoted") throw new Error("follow-up requires a newly promoted active State");
	const runRoot = registeredFollowUpPromotionValidationRootV37(options);
	const validation = inspectValidationV3(runRoot);
	if (!validation.integrity_valid || !validation.validation || !validation.seed || !validation.candidate_arm || !validation.recomputed_decision) throw new Error(`follow-up promotion validation fails closed: ${validation.errors.join("; ")}`);
	const validationRef = artifactRef(runRoot, decision.validation_ref!.path, decision.validation_ref!.media_type, decision.validation_ref!.truncated);
	const checks: Array<[boolean, string]> = [
		[stableJson(validationRef) === stableJson(decision.validation_ref), "validation_ref"],
		[decision.validation_id === validation.validation.validation_id && decision.validation_digest === validation.validation.validation_digest, "validation_identity"],
		[decision.candidate_id === candidate.candidate_id && decision.candidate_digest === candidate.candidate_digest, "decision_candidate"],
		[activeVersion.source_candidate_id === candidate.candidate_id && activeVersion.source_candidate_digest === candidate.candidate_digest, "version_candidate"],
		[decision.next_active.state_digest === state.active.state_digest, "decision_active"],
		[validation.seed.candidate_id === candidate.candidate_id && validation.seed.candidate_digest === candidate.candidate_digest, "validation_candidate"],
		[validation.seed.candidate_state_digest === activeVersion.source_staged_state_digest, "staged_state"],
		[validation.seed.base_state_digest === activeVersion.parent_state_digest && candidate.expected_base_state_digest === validation.seed.base_state_digest, "base_state"],
		[validation.candidate_arm.verifier_status === "passed" && validation.candidate_arm.regression_passed, "candidate_result"],
		[validation.recomputed_decision.result === "promote", "validation_decision"],
	];
	const failed = checks.find(([passed]) => !passed);
	if (failed) throw new Error(`follow-up Candidate/promotion validation/State lineage mismatch: ${failed[1]}`);
	return { activeVersion, decision, runRoot, validation };
}

function recoveryAdmission(options: Pick<RegisteredFollowUpOptionsV37, "projectRoot" | "dataRoot" | "workflowId">) {
	const data = v37DataRootPath(options.projectRoot, options.dataRoot);
	const recovery = resolve(data, "workflows", options.workflowId, "recovery");
	const bindingPath = resolve(data, "workflows", options.workflowId, "execution", "primary-run-binding.json");
	const binding = JSON.parse(readFileSync(ordinaryFile(bindingPath, "Primary Run binding"), "utf8")) as { primary_run_root_location: string };
	const confirmation = JSON.parse(readFileSync(ordinaryFile(resolve(recovery, "confirmation.json"), "recovery confirmation"), "utf8")) as { confirmed_at: string };
	const request = JSON.parse(readFileSync(ordinaryFile(resolve(recovery, "request.json"), "recovery request"), "utf8")) as { requested_at: string };
	const inspected = inspectRegisteredRecoveryAdmissionV37({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId, runRoot: resolve(options.projectRoot, binding.primary_run_root_location), confirmedAt: confirmation.confirmed_at, requestedAt: request.requested_at });
	if (!inspected.integrity_valid || !inspected.admission || inspected.admission.result !== "admitted" || !inspected.admission.opportunity) throw new Error(`registered Recovery admission unavailable: ${inspected.errors.join("; ")}`);
	return inspected.admission;
}

async function deriveBinding(options: RegisteredFollowUpOptionsV37, candidate: RefinementCandidateV3) {
	if (![options.followUpRunId, options.sessionId, options.workspaceId].every((value) => ID.test(value)) || [options.boundAt, options.confirmedAt, options.requestedAt].some((value) => Number.isNaN(Date.parse(value)))) throw new Error("follow-up Host identity/timestamp invalid");
	if (digestObject(candidateBody(candidate)) !== candidate.candidate_digest || candidate.candidate_id !== `candidate-${candidate.candidate_digest.slice(0, 32)}`) throw new Error("follow-up Candidate identity invalid");
	const registered = loadWorkflowRegistrationV37({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId });
	const loadedProfile = loadRegisteredFollowUpExecutionProfileV37({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId });
	const admission = recoveryAdmission(options);
	if (candidate.evidence_identity.evidence_digest !== admission.evidence_body_digest || candidate.source_opportunity_id !== admission.opportunity!.opportunity_id || stableJson(candidate.lesson.applicability) !== stableJson(registered.loadedCase.manifest.state_applicability)) throw new Error("follow-up Candidate is not derived from this workflow admission/applicability");
	if (candidate.edits.length !== 1 || candidate.edits[0]?.kind !== "prompt_addendum") throw new Error("follow-up requires one prompt-addendum Candidate");
	const candidateEdit = candidate.edits[0];
	const template = registered.loadedCase.manifest.candidate_policy_spec.body.generic_prompt_addendum_templates.find((entry) => entry.template_id === candidateEdit.entry_id && entry.content === candidateEdit.content && entry.content_sha256 === sha256(candidateEdit.content));
	if (!template) throw new Error("follow-up Candidate is not the registered prompt-addendum template");
	const manifest = registered.loadedCase.manifest;
	const runtimeBase = manifest.runtime_base_prompt_spec.body.prompt;
	if (sha256(runtimeBase) !== manifest.state_store_scope_spec.runtime_base_prompt_digest) throw new Error("follow-up runtime Base Prompt identity mismatch");
	const stateRoot = stateRootFromManifest(options.projectRoot, manifest.state_store_scope_spec.configured_location);
	const state = await inspectStateStoreV3({ stateRoot, expectedProjectId: manifest.project_id, immutableBasePrompt: runtimeBase, immutableBasePromptSha256: manifest.state_store_scope_spec.runtime_base_prompt_digest });
	if (!state.integrity_valid || !state.active) throw new Error(`follow-up State Store inspection failed: ${state.errors.join("; ")}`);
	if (state.versions.find((entry) => entry.state_version === 0)?.state_digest !== manifest.state_store_scope_spec.initial_state_digest) throw new Error("follow-up State Store initial lineage mismatch");
	const { activeVersion, decision } = await inspectRegisteredPromotionLineageV37(options, candidate, state);
	const task = manifest.follow_up_task_spec.body as { task_kind: string; failure_family: string };
	const matching = activeVersion.entries.filter((entry) => entry.applicability.task_kinds.includes(task.task_kind) && entry.applicability.failure_families.includes(task.failure_family));
	if (matching.length === 0 || matching.some((entry) => entry.kind !== "prompt_addendum") || matching.length !== activeVersion.entries.length) throw new Error("follow-up State applicability is zero, ambiguous or contains adaptive Skills");
	const entries = matching.filter((entry): entry is Extract<typeof entry, { kind: "prompt_addendum" }> => entry.kind === "prompt_addendum").sort((left, right) => left.entry_id.localeCompare(right.entry_id));
	if (new Set(entries.map((entry) => entry.entry_id)).size !== entries.length) throw new Error("follow-up prompt addendum ordering is ambiguous");
	const composed = composePromptAddendaV3({ basePrompt: runtimeBase, expectedBasePromptSha256: manifest.state_store_scope_spec.runtime_base_prompt_digest, entries });
	const source = manifest.follow_up_source_baseline_spec.body as { source_path: string; source_bytes: string; source_sha256: string };
	const sourceWorkspaceDigest = digestObject({ source_path: source.source_path, source_sha256: source.source_sha256 });
	const profile = loadedProfile.profile;
	const body: Omit<RegisteredFollowUpBindingV37, "frozen_binding_digest"> = {
		schema_version: 1, kind: "v37_registered_follow_up_binding", case_id: manifest.case_id, workflow_id: registered.workflow.workflow_id, workflow_registration_digest: registered.workflow.workflow_registration_digest, follow_up_run_id: options.followUpRunId, follow_up_task_instance_digest: registered.follow_up.task_instance_digest, follow_up_source_workspace_digest: sourceWorkspaceDigest,
		state_store_scope_digest: manifest.state_store_scope_spec.state_store_scope_digest, state_version_id: state.active.state_version, active_state_digest: state.active.state_digest, active_binding_revision: state.active.binding_revision, promotion_decision_id: decision.decision_id, promotion_decision_digest: decision.decision_digest, candidate_id: candidate.candidate_id, candidate_digest: candidate.candidate_digest,
		runtime_base_prompt_digest: manifest.state_store_scope_spec.runtime_base_prompt_digest, composed_prompt_digest: composed.composed_prompt_sha256,
		parent_provider_profile_digest: profile.parent_provider_profile_digest, parent_tool_profile_digest: profile.parent_tool_profile_digest, parent_command_profile_digest: profile.parent_command_profile_digest, parent_budget_profile_digest: profile.parent_budget_profile_digest, parent_stop_condition_profile_digest: profile.parent_stop_condition_profile_digest,
		provider_profile_digest: profile.provider_profile_digest, tool_profile_digest: profile.tool_profile_digest, command_profile_digest: profile.command_profile_digest, budget_profile_digest: profile.budget_profile_digest, stop_condition_profile_digest: profile.stop_condition_profile_digest, follow_up_execution_profile_digest: profile.follow_up_execution_profile_digest, follow_up_execution_authority_digest: loadedProfile.authority.follow_up_execution_authority_digest, bound_at: options.boundAt,
	};
	return { registered, loadedProfile, stateRoot, state, candidate, binding: { ...body, frozen_binding_digest: digestObject(body) }, composedPrompt: composed.composed_prompt, sourceWorkspaceDigest };
}

export async function prepareRegisteredFollowUpV37(options: RegisteredFollowUpOptionsV37 & { candidate: RefinementCandidateV3 }): Promise<RegisteredFollowUpBindingV37> {
	const derived = await deriveBinding(options, options.candidate);
	const root = workflowFollowUpRoot(options, true);
	writeJson(root, "candidate.json", options.candidate);
	writeJson(root, "binding.json", derived.binding);
	const planBody = { schema_version: 1 as const, kind: "v37_follow_up_pre_dispatch_plan" as const, workflow_id: options.workflowId, follow_up_run_id: options.followUpRunId, frozen_binding_digest: derived.binding.frozen_binding_digest, follow_up_execution_authority_digest: derived.binding.follow_up_execution_authority_digest, task_spec_digest: derived.registered.loadedCase.manifest.follow_up_task_spec.spec_digest, source_spec_digest: derived.registered.loadedCase.manifest.follow_up_source_baseline_spec.spec_digest, verifier_spec_digest: derived.registered.loadedCase.manifest.follow_up_verifier_spec.spec_digest };
	writeJson(root, "pre-dispatch-plan.json", { ...planBody, plan_digest: digestObject(planBody) });
	const workspace = resolve(root, "workspace");
	mkdirSync(workspace, { recursive: true });
	const source = derived.registered.loadedCase.manifest.follow_up_source_baseline_spec.body as { source_path: string; source_bytes: string; source_sha256: string };
	const verifier = derived.registered.loadedCase.manifest.follow_up_verifier_spec.body as { verifier_path: string; verifier_bytes: string; verifier_sha256: string };
	writeBytes(workspace, source.source_path, source.source_bytes);
	writeBytes(workspace, verifier.verifier_path, verifier.verifier_bytes);
	if (fileSha256(resolve(workspace, source.source_path)) !== source.source_sha256 || fileSha256(resolve(workspace, verifier.verifier_path)) !== verifier.verifier_sha256) throw new Error("follow-up materialized Source/Verifier identity mismatch");
	return derived.binding;
}

function loadPrepared(options: RegisteredFollowUpOptionsV37, historical = false) {
	const root = workflowFollowUpRoot(options, false);
	const candidate = readJson<RefinementCandidateV3>(root, "candidate.json", "follow-up Candidate");
	const binding = readJson<RegisteredFollowUpBindingV37>(root, "binding.json", "follow-up binding");
	exact(candidate, ["schema_version", "candidate_id", "proposal_id", "source_opportunity_id", "evidence_identity", "diagnosis", "lesson", "expected_base_state_digest", "edits", "candidate_digest"], "follow-up Candidate");
	exact(candidate.evidence_identity, ["evidence_id", "evidence_digest"], "follow-up Candidate Evidence identity");
	exact(candidate.diagnosis, ["diagnosis_id", "opportunity_id", "pattern_id", "evidence_identity", "evidence_refs", "statement", "derivation"], "follow-up Candidate Diagnosis");
	exact(candidate.lesson, ["lesson_id", "diagnosis_id", "evidence_identity", "statement", "expected_outcome", "applicability"], "follow-up Candidate Lesson");
	if (candidate.edits.length !== 1 || candidate.edits[0]?.kind !== "prompt_addendum") throw new Error("follow-up Candidate edit schema invalid");
	exact(candidate.edits[0], ["kind", "entry_id", "content", "applicability"], "follow-up Candidate edit");
	exact(candidate.edits[0].applicability, ["task_kinds", "failure_families"], "follow-up Candidate applicability");
	exact(binding, ["schema_version", "kind", "case_id", "workflow_id", "workflow_registration_digest", "follow_up_run_id", "follow_up_task_instance_digest", "follow_up_source_workspace_digest", "state_store_scope_digest", "state_version_id", "active_state_digest", "active_binding_revision", "promotion_decision_id", "promotion_decision_digest", "candidate_id", "candidate_digest", "runtime_base_prompt_digest", "composed_prompt_digest", "parent_provider_profile_digest", "parent_tool_profile_digest", "parent_command_profile_digest", "parent_budget_profile_digest", "parent_stop_condition_profile_digest", "provider_profile_digest", "tool_profile_digest", "command_profile_digest", "budget_profile_digest", "stop_condition_profile_digest", "follow_up_execution_profile_digest", "follow_up_execution_authority_digest", "bound_at", "frozen_binding_digest"], "follow-up binding");
	return { root, candidate, binding, historical };
}

function sameActive(binding: RegisteredFollowUpBindingV37, active: { binding_revision: number; state_version: number; state_digest: string }): boolean {
	return binding.active_binding_revision === active.binding_revision && binding.state_version_id === active.state_version && binding.active_state_digest === active.state_digest;
}

function runtimeTaskPolicy(profile: ReturnType<typeof loadRegisteredFollowUpExecutionProfileV37>["profile"]) {
	return { writable_paths: [...profile.tool_profile.writable_paths], protected_paths: [...profile.tool_profile.protected_paths], command_descriptors: structuredClone(profile.command_profile.descriptors) as never };
}

function runtimeBudgetProfile(profile: ReturnType<typeof loadRegisteredFollowUpExecutionProfileV37>["profile"]): BoundedEditBudgetProfileV36 {
	return {
		profile_id: profile.budget_profile.v36_runtime_budget_profile_id,
		provider_requests_observation_threshold: profile.budget_profile.provider_requests_observation_threshold,
		provider_requests_hard_max: profile.budget_profile.provider_requests_hard_max,
		tool_calls_hard_max: profile.budget_profile.tool_calls_hard_max,
		combined_tokens_hard_max: profile.budget_profile.combined_tokens_hard_max,
		cost_usd_hard_max: profile.budget_profile.cost_usd_hard_max,
		wall_time_ms_hard_max: profile.budget_profile.wall_time_ms_hard_max,
	};
}

export async function executeRegisteredFollowUpV37(options: RegisteredFollowUpOptionsV37): Promise<{ evidence: RegisteredBoundFollowUpEvidenceBodyV37; outcome: FollowUpFormalOutcomeV37; verifier: FollowUpVerifierArtifactV37 }> {
	const prepared = loadPrepared(options);
	const derived = await deriveBinding(options, prepared.candidate);
	if (stableJson(derived.binding) !== stableJson(prepared.binding)) throw new Error("follow-up pre-dispatch binding recomputation mismatch");
	const workspace = resolve(prepared.root, "workspace");
	const runtimeRoot = resolve(prepared.root, "runtime");
	mkdirSync(runtimeRoot, { recursive: true });
	const service = new PersistentInteractiveSessionServiceV36({ runtimeRoot, workspaceRoot: workspace, projectId: derived.registered.workflow.project_id, workspaceId: options.workspaceId, sessionId: options.sessionId, title: "V3.7 registered bound-State follow-up", sessionPinDigest: digestObject({ workflow_registration_digest: derived.registered.workflow.workflow_registration_digest, follow_up_run_id: options.followUpRunId }) });
	await service.create();
	const models = createModels();
	const provider = fauxProvider({ provider: "v37-g2-deterministic-faux" });
	models.setProvider(provider.provider);
	provider.setResponses([
		() => fauxAssistantMessage(fauxToolCall("workspace_edit", { path: "src/policy.mjs", old_text: "  return value;", new_text: "  return Math.max(0, value);" }, { id: `${options.followUpRunId}-edit` }), { stopReason: "toolUse", timestamp: 1 }),
		() => fauxAssistantMessage("The registered follow-up edit is complete and awaits the Host verifier.", { timestamp: 2 }),
	]);
	const profile = derived.loadedProfile.profile;
	const taskPolicy = runtimeTaskPolicy(profile);
	const runtimeBudget = runtimeBudgetProfile(profile);
	const result = await service.executeBoundedTurn({
		sessionId: options.sessionId, runId: options.followUpRunId, prompt: (derived.registered.loadedCase.manifest.follow_up_task_spec.body as { task_body: string }).task_body,
		taskPolicy,
		commandExecutor: async () => { throw new Error("registered follow-up command execution is Host-owned after settled runtime"); }, budgetProfile: runtimeBudget, models, model: provider.getModel(), systemPrompt: derived.composedPrompt, authorityDigest: derived.binding.follow_up_execution_authority_digest,
		registeredRuntimeObservation: {
			workflow_id: options.workflowId, workflow_registration_digest: derived.registered.workflow.workflow_registration_digest, follow_up_run_id: options.followUpRunId, system_prompt_digest: derived.binding.composed_prompt_digest, frozen_binding_digest: derived.binding.frozen_binding_digest, follow_up_execution_authority_digest: derived.binding.follow_up_execution_authority_digest,
			provider_profile_digest: profile.provider_profile_digest, tool_profile_digest: profile.tool_profile_digest, command_profile_digest: profile.command_profile_digest, budget_profile_digest: profile.budget_profile_digest, stop_condition_profile_digest: profile.stop_condition_profile_digest, task_policy_input_digest: digestObject(taskPolicy), runtime_budget_input_digest: digestObject(runtimeBudget),
			before_first_provider_request: () => {
				const current = readJson<{ binding_revision: number; state_version: number; state_digest: string }>(derived.stateRoot, "active.json", "active State pointer");
				if (!sameActive(derived.binding, current)) throw new Error("active State pointer drifted before first Provider request");
			},
		},
	});
	if (!("manifest_digest" in result.manifest) || "terminal_kind" in result.manifest || result.manifest.settled !== true || result.manifest.real_model_calls !== 0 || result.manifest.external_provider_calls !== 0 || result.manifest.network_calls !== 0 || result.manifest.credential_reads !== 0) throw new Error("registered follow-up Runtime did not settle under zero-access profile");
	const runtimeManifest = result.manifest as RuntimeManifestG2V36;
	const observationRoot = resolve(runtimeRoot, "runs", options.followUpRunId);
	const observation = readJson<FollowUpRuntimeObservationV37>(observationRoot, "registered-observation.json", "follow-up Runtime observation");
	if (observation.system_prompt_digest !== derived.binding.composed_prompt_digest || observation.frozen_binding_digest !== derived.binding.frozen_binding_digest || observation.follow_up_execution_authority_digest !== derived.binding.follow_up_execution_authority_digest || observation.follow_up_run_id !== options.followUpRunId || observation.provider_profile_digest !== profile.provider_profile_digest || observation.tool_profile_digest !== profile.tool_profile_digest || observation.command_profile_digest !== profile.command_profile_digest || observation.budget_profile_digest !== profile.budget_profile_digest || observation.stop_condition_profile_digest !== profile.stop_condition_profile_digest || observation.task_policy_input_digest !== digestObject(taskPolicy) || observation.runtime_budget_input_digest !== digestObject(runtimeBudget) || bodyDigest(observation as unknown as Record<string, unknown>, "runtime_observed_binding_digest") !== observation.runtime_observed_binding_digest) throw new Error("follow-up Runtime observation mismatch");
	const descriptor = profile.command_profile.descriptors[0];
	const verifierResult = spawnSync(process.execPath, descriptor.argv, { cwd: workspace, shell: false, windowsHide: true, timeout: descriptor.timeout_seconds * 1000, maxBuffer: descriptor.max_combined_output_bytes, env: { V0B_WORKSPACE: workspace }, encoding: "utf8" });
	const output = `${verifierResult.stdout ?? ""}${verifierResult.stderr ?? ""}`;
	const timedOut = verifierResult.error && (verifierResult.error as NodeJS.ErrnoException).code === "ETIMEDOUT";
	const verifierStatus: FollowUpVerifierArtifactV37["status"] = timedOut || verifierResult.status === null ? "invalid" : verifierResult.status === 0 ? "passed" : "failed";
	const verifierBody: Omit<FollowUpVerifierArtifactV37, "verifier_artifact_digest"> = { schema_version: 1, kind: "v37_follow_up_verifier_artifact", verifier_id: (derived.registered.loadedCase.manifest.follow_up_verifier_spec.body as { verifier_id: string }).verifier_id, verifier_source_sha256: (derived.registered.loadedCase.manifest.follow_up_verifier_spec.body as { verifier_sha256: string }).verifier_sha256, command_profile_digest: profile.command_profile_digest, follow_up_run_id: options.followUpRunId, exit_code: verifierResult.status, timed_out: Boolean(timedOut), output_truncated: Buffer.byteLength(output) > descriptor.max_combined_output_bytes, output_sha256: sha256(Buffer.from(output).subarray(0, descriptor.max_combined_output_bytes)), status: verifierStatus };
	const verifier: FollowUpVerifierArtifactV37 = { ...verifierBody, verifier_artifact_digest: digestObject(verifierBody) };
	writeBytes(prepared.root, "verifier-output.txt", Buffer.from(output).subarray(0, descriptor.max_combined_output_bytes).toString("utf8"));
	writeJson(prepared.root, "verifier.json", verifier);
	const outcomeBody: Omit<FollowUpFormalOutcomeV37, "formal_outcome_artifact_digest"> = { schema_version: 1, kind: "v37_follow_up_formal_outcome", follow_up_run_id: options.followUpRunId, runtime_manifest_digest: runtimeManifest.manifest_digest, runtime_observed_binding_digest: observation.runtime_observed_binding_digest, verifier_artifact_digest: verifier.verifier_artifact_digest, formal_outcome: verifier.status, terminal_status: "settled" };
	const outcome: FollowUpFormalOutcomeV37 = { ...outcomeBody, formal_outcome_artifact_digest: digestObject(outcomeBody) };
	writeJson(prepared.root, "outcome.json", outcome);
	const evidenceBody: Omit<RegisteredBoundFollowUpEvidenceBodyV37, "evidence_body_digest"> = {
		schema_version: 1, family: "v37_registered_bound_state_followup", case_id: derived.registered.workflow.case_id, manifest_body_digest: derived.registered.workflow.manifest_body_digest, case_registration_digest: derived.registered.workflow.registration_digest, workflow_id: options.workflowId, workflow_registration_digest: derived.registered.workflow.workflow_registration_digest, follow_up_run_id: options.followUpRunId, follow_up_task_instance_digest: derived.registered.follow_up.task_instance_digest, follow_up_source_workspace_digest: derived.sourceWorkspaceDigest,
		state_store_scope_digest: derived.binding.state_store_scope_digest, state_version_id: derived.binding.state_version_id, active_state_digest: derived.binding.active_state_digest, promotion_decision_id: derived.binding.promotion_decision_id, promotion_decision_digest: derived.binding.promotion_decision_digest, candidate_id: derived.binding.candidate_id, candidate_digest: derived.binding.candidate_digest, frozen_binding_digest: derived.binding.frozen_binding_digest, runtime_base_prompt_digest: derived.binding.runtime_base_prompt_digest, composed_prompt_digest: derived.binding.composed_prompt_digest, runtime_observed_binding_digest: observation.runtime_observed_binding_digest,
		parent_provider_profile_digest: profile.parent_provider_profile_digest, parent_tool_profile_digest: profile.parent_tool_profile_digest, parent_command_profile_digest: profile.parent_command_profile_digest, parent_budget_profile_digest: profile.parent_budget_profile_digest, parent_stop_condition_profile_digest: profile.parent_stop_condition_profile_digest, provider_profile_digest: profile.provider_profile_digest, tool_profile_digest: profile.tool_profile_digest, command_profile_digest: profile.command_profile_digest, budget_profile_digest: profile.budget_profile_digest, stop_condition_profile_digest: profile.stop_condition_profile_digest, follow_up_execution_profile_digest: profile.follow_up_execution_profile_digest, follow_up_execution_authority_digest: derived.binding.follow_up_execution_authority_digest,
		verifier_artifact_digest: verifier.verifier_artifact_digest, formal_outcome_artifact_digest: outcome.formal_outcome_artifact_digest, formal_outcome: outcome.formal_outcome, terminal_status: outcome.terminal_status,
	};
	const evidence: RegisteredBoundFollowUpEvidenceBodyV37 = { ...evidenceBody, evidence_body_digest: digestObject(evidenceBody) };
	writeJson(prepared.root, "evidence.json", evidence);
	return { evidence, outcome, verifier };
}

export function submitRegisteredFollowUpEvidenceV37(options: RegisteredFollowUpOptionsV37): { confirmation: FollowUpEvidenceConfirmationReceiptV37; request: FollowUpEvidenceSubmissionRequestV37 } {
	loadRegisteredFollowUpExecutionProfileV37({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId });
	const root = workflowFollowUpRoot(options, false);
	const evidence = readJson<RegisteredBoundFollowUpEvidenceBodyV37>(root, "evidence.json", "follow-up Evidence");
	const registered = loadWorkflowRegistrationV37({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId });
	const confirmationSeed = { workflow_id: options.workflowId, evidence_body_digest: evidence.evidence_body_digest, confirmed_at: options.confirmedAt };
	const confirmationBody: Omit<FollowUpEvidenceConfirmationReceiptV37, "confirmation_receipt_digest"> = { schema_version: 1, kind: "v37_follow_up_evidence_confirmation_receipt", workflow_id: options.workflowId, workflow_registration_digest: registered.workflow.workflow_registration_digest, evidence_body_digest: evidence.evidence_body_digest, action_id: "confirm_registered_bound_follow_up_evidence", confirmed_at: options.confirmedAt, confirmation_receipt_id: `v37-follow-up-confirmation-${digestObject(confirmationSeed).slice(0, 32)}` };
	const confirmation: FollowUpEvidenceConfirmationReceiptV37 = { ...confirmationBody, confirmation_receipt_digest: digestObject(confirmationBody) };
	const requestBody: Omit<FollowUpEvidenceSubmissionRequestV37, "submission_request_digest"> = { schema_version: 1, kind: "v37_follow_up_evidence_submission_request", workflow_id: options.workflowId, workflow_registration_digest: registered.workflow.workflow_registration_digest, evidence_body_digest: evidence.evidence_body_digest, confirmation_receipt_id: confirmation.confirmation_receipt_id, confirmation_receipt_digest: confirmation.confirmation_receipt_digest, requested_at: options.requestedAt };
	const request: FollowUpEvidenceSubmissionRequestV37 = { ...requestBody, submission_request_digest: digestObject(requestBody) };
	writeJson(root, "confirmation.json", confirmation); writeJson(root, "request.json", request);
	return { confirmation, request };
}

function inspectorFingerprint(): string {
	return digestObject({ inspector_id: INSPECTOR_ID, source_sha256: fileSha256(resolve(import.meta.dirname, "../inspect-v37g2.ts")), registered_service_sha256: fileSha256(resolve(import.meta.dirname, "registered-follow-up-v37.ts")) });
}

async function recompute(options: RegisteredFollowUpOptionsV37, historical: boolean) {
	const prepared = loadPrepared(options, historical);
	const registered = loadWorkflowRegistrationV37({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId, allowHistoricalReadOnly: historical ? true : undefined });
	const loadedProfile = loadRegisteredFollowUpExecutionProfileV37({ projectRoot: options.projectRoot, dataRoot: options.dataRoot, workflowId: options.workflowId, ...(historical ? { allowHistoricalReadOnly: true as const } : {}) });
	const binding = prepared.binding;
	if (digestObject(candidateBody(prepared.candidate)) !== prepared.candidate.candidate_digest || bodyDigest(binding as unknown as Record<string, unknown>, "frozen_binding_digest") !== binding.frozen_binding_digest) throw new Error("follow-up Candidate/binding digest mismatch");
	const profile = loadedProfile.profile;
	if (binding.workflow_registration_digest !== registered.workflow.workflow_registration_digest || binding.follow_up_execution_authority_digest !== loadedProfile.authority.follow_up_execution_authority_digest || binding.follow_up_task_instance_digest !== registered.follow_up.task_instance_digest || binding.state_store_scope_digest !== registered.loadedCase.manifest.state_store_scope_spec.state_store_scope_digest || binding.runtime_base_prompt_digest !== registered.loadedCase.manifest.state_store_scope_spec.runtime_base_prompt_digest || binding.parent_provider_profile_digest !== profile.parent_provider_profile_digest || binding.parent_tool_profile_digest !== profile.parent_tool_profile_digest || binding.parent_command_profile_digest !== profile.parent_command_profile_digest || binding.parent_budget_profile_digest !== profile.parent_budget_profile_digest || binding.parent_stop_condition_profile_digest !== profile.parent_stop_condition_profile_digest || binding.provider_profile_digest !== profile.provider_profile_digest || binding.tool_profile_digest !== profile.tool_profile_digest || binding.command_profile_digest !== profile.command_profile_digest || binding.budget_profile_digest !== profile.budget_profile_digest || binding.stop_condition_profile_digest !== profile.stop_condition_profile_digest || binding.follow_up_execution_profile_digest !== profile.follow_up_execution_profile_digest) throw new Error("follow-up workflow/profile authority mismatch");
	const plan = readJson<Record<string, unknown>>(prepared.root, "pre-dispatch-plan.json", "follow-up pre-dispatch plan");
	const planRecord = exact(plan, ["schema_version", "kind", "workflow_id", "follow_up_run_id", "frozen_binding_digest", "follow_up_execution_authority_digest", "task_spec_digest", "source_spec_digest", "verifier_spec_digest", "plan_digest"], "follow-up pre-dispatch plan");
	const { plan_digest: declaredPlanDigest, ...planBody } = planRecord;
	if (planRecord.schema_version !== 1 || planRecord.kind !== "v37_follow_up_pre_dispatch_plan" || digestObject(planBody) !== declaredPlanDigest || planRecord.workflow_id !== options.workflowId || planRecord.follow_up_run_id !== options.followUpRunId || planRecord.frozen_binding_digest !== binding.frozen_binding_digest || planRecord.follow_up_execution_authority_digest !== binding.follow_up_execution_authority_digest || planRecord.task_spec_digest !== registered.loadedCase.manifest.follow_up_task_spec.spec_digest || planRecord.source_spec_digest !== registered.loadedCase.manifest.follow_up_source_baseline_spec.spec_digest || planRecord.verifier_spec_digest !== registered.loadedCase.manifest.follow_up_verifier_spec.spec_digest) throw new Error("follow-up pre-dispatch plan recomputation mismatch");
	const recovery = recoveryAdmission(options);
	if (prepared.candidate.evidence_identity.evidence_digest !== recovery.evidence_body_digest || prepared.candidate.source_opportunity_id !== recovery.opportunity!.opportunity_id) throw new Error("follow-up Candidate/Recovery admission lineage mismatch");
	const manifest = registered.loadedCase.manifest;
	const stateRoot = stateRootFromManifest(options.projectRoot, manifest.state_store_scope_spec.configured_location);
	const state = await inspectStateStoreV3({ stateRoot, expectedProjectId: manifest.project_id, immutableBasePrompt: manifest.runtime_base_prompt_spec.body.prompt, immutableBasePromptSha256: manifest.state_store_scope_spec.runtime_base_prompt_digest });
	if (!state.integrity_valid) throw new Error(`follow-up bound State inspection failed: ${state.errors.join("; ")}`);
	const inspectedPromotion = await inspectRegisteredPromotionLineageV37(options, prepared.candidate, state);
	const boundVersion = inspectedPromotion.activeVersion;
	const boundDecision = inspectedPromotion.decision;
	if (boundVersion.state_digest !== binding.active_state_digest || boundVersion.state_version !== binding.state_version_id || boundDecision.decision_id !== binding.promotion_decision_id || boundDecision.decision_digest !== binding.promotion_decision_digest) throw new Error("follow-up bound Candidate/promotion/State lineage mismatch");
	const taskContext = manifest.follow_up_task_spec.body as { task_kind: string; failure_family: string };
	const boundEntries = boundVersion.entries.filter((entry) => entry.applicability.task_kinds.includes(taskContext.task_kind) && entry.applicability.failure_families.includes(taskContext.failure_family));
	if (boundEntries.length === 0 || boundEntries.length !== boundVersion.entries.length || boundEntries.some((entry) => entry.kind !== "prompt_addendum")) throw new Error("follow-up bound State applicability/entry kind mismatch");
	const recomposed = composePromptAddendaV3({ basePrompt: manifest.runtime_base_prompt_spec.body.prompt, expectedBasePromptSha256: manifest.state_store_scope_spec.runtime_base_prompt_digest, entries: boundEntries.map((entry) => ({ entry_id: entry.entry_id, content: "content" in entry ? entry.content : "" })) });
	if (recomposed.composed_prompt_sha256 !== binding.composed_prompt_digest) throw new Error("follow-up composed prompt recomputation mismatch");
	const observation = readJson<FollowUpRuntimeObservationV37>(resolve(prepared.root, "runtime", "runs", options.followUpRunId), "registered-observation.json", "follow-up observation");
	const runtimeManifest = readJson<RuntimeManifestG2V36>(resolve(prepared.root, "runtime", "runs", options.followUpRunId), "manifest.json", "follow-up Runtime Manifest");
	const verifier = readJson<FollowUpVerifierArtifactV37>(prepared.root, "verifier.json", "follow-up Verifier");
	const outcome = readJson<FollowUpFormalOutcomeV37>(prepared.root, "outcome.json", "follow-up Outcome");
	const evidence = readJson<RegisteredBoundFollowUpEvidenceBodyV37>(prepared.root, "evidence.json", "follow-up Evidence");
	const confirmation = readJson<FollowUpEvidenceConfirmationReceiptV37>(prepared.root, "confirmation.json", "follow-up confirmation");
	const request = readJson<FollowUpEvidenceSubmissionRequestV37>(prepared.root, "request.json", "follow-up request");
	exact(observation, ["schema_version", "kind", "workflow_id", "workflow_registration_digest", "follow_up_run_id", "session_id", "workspace_id", "system_prompt_digest", "frozen_binding_digest", "follow_up_execution_authority_digest", "provider_profile_digest", "tool_profile_digest", "command_profile_digest", "budget_profile_digest", "stop_condition_profile_digest", "task_policy_input_digest", "runtime_budget_input_digest", "observed_before_first_provider_request", "runtime_observed_binding_digest"], "follow-up observation");
	exact(verifier, ["schema_version", "kind", "verifier_id", "verifier_source_sha256", "command_profile_digest", "follow_up_run_id", "exit_code", "timed_out", "output_truncated", "output_sha256", "status", "verifier_artifact_digest"], "follow-up Verifier");
	exact(outcome, ["schema_version", "kind", "follow_up_run_id", "runtime_manifest_digest", "runtime_observed_binding_digest", "verifier_artifact_digest", "formal_outcome", "terminal_status", "formal_outcome_artifact_digest"], "follow-up Outcome");
	exact(evidence, ["schema_version", "family", "case_id", "manifest_body_digest", "case_registration_digest", "workflow_id", "workflow_registration_digest", "follow_up_run_id", "follow_up_task_instance_digest", "follow_up_source_workspace_digest", "state_store_scope_digest", "state_version_id", "active_state_digest", "promotion_decision_id", "promotion_decision_digest", "candidate_id", "candidate_digest", "frozen_binding_digest", "runtime_base_prompt_digest", "composed_prompt_digest", "runtime_observed_binding_digest", "parent_provider_profile_digest", "parent_tool_profile_digest", "parent_command_profile_digest", "parent_budget_profile_digest", "parent_stop_condition_profile_digest", "provider_profile_digest", "tool_profile_digest", "command_profile_digest", "budget_profile_digest", "stop_condition_profile_digest", "follow_up_execution_profile_digest", "follow_up_execution_authority_digest", "verifier_artifact_digest", "formal_outcome_artifact_digest", "formal_outcome", "terminal_status", "evidence_body_digest"], "follow-up Evidence");
	exact(confirmation, ["schema_version", "kind", "workflow_id", "workflow_registration_digest", "evidence_body_digest", "action_id", "confirmed_at", "confirmation_receipt_id", "confirmation_receipt_digest"], "follow-up confirmation");
	exact(request, ["schema_version", "kind", "workflow_id", "workflow_registration_digest", "evidence_body_digest", "confirmation_receipt_id", "confirmation_receipt_digest", "requested_at", "submission_request_digest"], "follow-up request");
	for (const [value, key, declared, label] of [
		[observation, "runtime_observed_binding_digest", observation.runtime_observed_binding_digest, "observation"], [verifier, "verifier_artifact_digest", verifier.verifier_artifact_digest, "Verifier"], [outcome, "formal_outcome_artifact_digest", outcome.formal_outcome_artifact_digest, "Outcome"], [evidence, "evidence_body_digest", evidence.evidence_body_digest, "Evidence"], [confirmation, "confirmation_receipt_digest", confirmation.confirmation_receipt_digest, "confirmation"], [request, "submission_request_digest", request.submission_request_digest, "request"],
	] as const) if (bodyDigest(value as unknown as Record<string, unknown>, key) !== declared) throw new Error(`follow-up ${label} digest mismatch`);
	const { manifest_digest: _runtimeDigest, ...runtimeBody } = runtimeManifest;
	const expectedTaskPolicyDigest = digestObject(runtimeTaskPolicy(profile));
	const expectedRuntimeBudgetDigest = digestObject(runtimeBudgetProfile(profile));
	if (runtimeManifest.schema_version !== 3 || digestObject(runtimeBody) !== runtimeManifest.manifest_digest || runtimeManifest.registered_runtime_observation_digest !== observation.runtime_observed_binding_digest || runtimeManifest.prompt_sha256 !== sha256((manifest.follow_up_task_spec.body as { task_body: string }).task_body) || runtimeManifest.workspace_identity_after !== managedWorkspaceIdentityV36(resolve(prepared.root, "workspace")) || runtimeManifest.external_provider_calls !== 0 || runtimeManifest.real_model_calls !== 0 || runtimeManifest.network_calls !== 0 || runtimeManifest.credential_reads !== 0 || observation.workflow_id !== options.workflowId || observation.workflow_registration_digest !== registered.workflow.workflow_registration_digest || observation.follow_up_run_id !== options.followUpRunId || observation.session_id !== options.sessionId || observation.workspace_id !== options.workspaceId || observation.system_prompt_digest !== binding.composed_prompt_digest || observation.frozen_binding_digest !== binding.frozen_binding_digest || observation.follow_up_execution_authority_digest !== binding.follow_up_execution_authority_digest || observation.provider_profile_digest !== profile.provider_profile_digest || observation.tool_profile_digest !== profile.tool_profile_digest || observation.command_profile_digest !== profile.command_profile_digest || observation.budget_profile_digest !== profile.budget_profile_digest || observation.stop_condition_profile_digest !== profile.stop_condition_profile_digest || observation.task_policy_input_digest !== expectedTaskPolicyDigest || observation.runtime_budget_input_digest !== expectedRuntimeBudgetDigest || observation.observed_before_first_provider_request !== true) throw new Error("follow-up Runtime Manifest recomputation mismatch");
	const runtimeService = new PersistentInteractiveSessionServiceV36({ runtimeRoot: resolve(prepared.root, "runtime"), workspaceRoot: resolve(prepared.root, "workspace"), projectId: registered.workflow.project_id, workspaceId: options.workspaceId, sessionId: options.sessionId, title: "V3.7 registered bound-State follow-up", sessionPinDigest: digestObject({ workflow_registration_digest: registered.workflow.workflow_registration_digest, follow_up_run_id: options.followUpRunId }) });
	const runtimeView = await runtimeService.inspect();
	if (!runtimeView.runs.some((run) => run.run_id === options.followUpRunId && run.settled && run.context_reconstructed)) throw new Error("follow-up V3.6 Session/Run reopen mismatch");
	const outputPath = ordinaryFile(resolve(prepared.root, "verifier-output.txt"), "follow-up Verifier output");
	if (fileSha256(outputPath) !== verifier.output_sha256) throw new Error("follow-up Verifier output digest mismatch");
	const bindingEvidencePairs: Array<[unknown, unknown]> = [[evidence.case_id, registered.workflow.case_id], [evidence.manifest_body_digest, registered.workflow.manifest_body_digest], [evidence.case_registration_digest, registered.workflow.registration_digest], [evidence.workflow_id, registered.workflow.workflow_id], [evidence.workflow_registration_digest, registered.workflow.workflow_registration_digest], [evidence.follow_up_run_id, binding.follow_up_run_id], [evidence.follow_up_task_instance_digest, binding.follow_up_task_instance_digest], [evidence.follow_up_source_workspace_digest, binding.follow_up_source_workspace_digest], [evidence.state_store_scope_digest, binding.state_store_scope_digest], [evidence.state_version_id, binding.state_version_id], [evidence.active_state_digest, binding.active_state_digest], [evidence.promotion_decision_id, binding.promotion_decision_id], [evidence.promotion_decision_digest, binding.promotion_decision_digest], [evidence.candidate_id, binding.candidate_id], [evidence.candidate_digest, binding.candidate_digest], [evidence.frozen_binding_digest, binding.frozen_binding_digest], [evidence.runtime_base_prompt_digest, binding.runtime_base_prompt_digest], [evidence.composed_prompt_digest, binding.composed_prompt_digest], [evidence.parent_provider_profile_digest, binding.parent_provider_profile_digest], [evidence.parent_tool_profile_digest, binding.parent_tool_profile_digest], [evidence.parent_command_profile_digest, binding.parent_command_profile_digest], [evidence.parent_budget_profile_digest, binding.parent_budget_profile_digest], [evidence.parent_stop_condition_profile_digest, binding.parent_stop_condition_profile_digest], [evidence.provider_profile_digest, binding.provider_profile_digest], [evidence.tool_profile_digest, binding.tool_profile_digest], [evidence.command_profile_digest, binding.command_profile_digest], [evidence.budget_profile_digest, binding.budget_profile_digest], [evidence.stop_condition_profile_digest, binding.stop_condition_profile_digest], [evidence.follow_up_execution_profile_digest, binding.follow_up_execution_profile_digest], [evidence.follow_up_execution_authority_digest, binding.follow_up_execution_authority_digest]];
	const confirmationSeed = { workflow_id: options.workflowId, evidence_body_digest: evidence.evidence_body_digest, confirmed_at: confirmation.confirmed_at };
	if (bindingEvidencePairs.some(([left, right]) => stableJson(left) !== stableJson(right)) || evidence.runtime_observed_binding_digest !== observation.runtime_observed_binding_digest || evidence.verifier_artifact_digest !== verifier.verifier_artifact_digest || evidence.formal_outcome_artifact_digest !== outcome.formal_outcome_artifact_digest || evidence.formal_outcome !== outcome.formal_outcome || evidence.terminal_status !== outcome.terminal_status || verifier.verifier_id !== (manifest.follow_up_verifier_spec.body as { verifier_id: string }).verifier_id || verifier.verifier_source_sha256 !== (manifest.follow_up_verifier_spec.body as { verifier_sha256: string }).verifier_sha256 || verifier.command_profile_digest !== profile.command_profile_digest || verifier.follow_up_run_id !== options.followUpRunId || outcome.follow_up_run_id !== options.followUpRunId || outcome.runtime_manifest_digest !== runtimeManifest.manifest_digest || outcome.runtime_observed_binding_digest !== observation.runtime_observed_binding_digest || outcome.verifier_artifact_digest !== verifier.verifier_artifact_digest || confirmation.kind !== "v37_follow_up_evidence_confirmation_receipt" || confirmation.action_id !== "confirm_registered_bound_follow_up_evidence" || confirmation.workflow_id !== options.workflowId || confirmation.workflow_registration_digest !== registered.workflow.workflow_registration_digest || confirmation.evidence_body_digest !== evidence.evidence_body_digest || confirmation.confirmed_at !== options.confirmedAt || confirmation.confirmation_receipt_id !== `v37-follow-up-confirmation-${digestObject(confirmationSeed).slice(0, 32)}` || request.kind !== "v37_follow_up_evidence_submission_request" || request.workflow_id !== options.workflowId || request.workflow_registration_digest !== registered.workflow.workflow_registration_digest || request.confirmation_receipt_id !== confirmation.confirmation_receipt_id || request.confirmation_receipt_digest !== confirmation.confirmation_receipt_digest || request.evidence_body_digest !== evidence.evidence_body_digest || request.requested_at !== options.requestedAt) throw new Error("follow-up formal artifact lineage mismatch");
	if (outcome.terminal_status !== "settled" || !["passed", "failed"].includes(outcome.formal_outcome) || outcome.formal_outcome !== verifier.status) throw new Error("follow-up terminal/Verifier/Outcome is not admissible");
	const inventory = ["binding.json", "candidate.json", "pre-dispatch-plan.json", "workspace/src/policy.mjs", "workspace/verifier/follow-up.test.mjs", "verifier-output.txt", "verifier.json", "outcome.json", "evidence.json", "confirmation.json", "request.json", `runtime/runs/${options.followUpRunId}/manifest.json`, `runtime/runs/${options.followUpRunId}/registered-observation.json`].map((path) => ({ path, sha256: fileSha256(resolve(prepared.root, path)) }));
	return { prepared, registered, evidence, confirmation, request, binding, verifier, outcome, sourceInventoryDigest: digestObject(inventory) };
}

export async function admitRegisteredFollowUpV37(options: RegisteredFollowUpOptionsV37): Promise<RegisteredBoundFollowUpAdmissionV37> {
	const checked = await recompute(options, false);
	const seed = { workflow_id: options.workflowId, evidence_body_digest: checked.evidence.evidence_body_digest, submission_request_digest: checked.request.submission_request_digest };
	const body: Omit<RegisteredBoundFollowUpAdmissionV37, "admission_digest"> = { schema_version: 1, kind: "v37_registered_bound_follow_up_admission", admission_id: `v37-follow-up-admission-${digestObject(seed).slice(0, 32)}`, workflow_id: options.workflowId, workflow_registration_digest: checked.registered.workflow.workflow_registration_digest, manifest_body_digest: checked.registered.workflow.manifest_body_digest, case_registration_digest: checked.registered.workflow.registration_digest, registry_trust_root_digest: checked.registered.workflow.registry_trust_root_digest, evidence_body_digest: checked.evidence.evidence_body_digest, submission_request_digest: checked.request.submission_request_digest, inspector_id: INSPECTOR_ID, inspector_fingerprint: inspectorFingerprint(), result: "admitted", reasons: [], source_inventory_digest: checked.sourceInventoryDigest };
	const admission: RegisteredBoundFollowUpAdmissionV37 = { ...body, admission_digest: digestObject(body) };
	writeJson(checked.prepared.root, "admission.json", admission);
	return admission;
}

export async function recomputeRegisteredFollowUpAdmissionV37(options: RegisteredFollowUpOptionsV37 & { historicalReadOnly?: true }): Promise<RegisteredBoundFollowUpAdmissionV37> {
	const checked = await recompute(options, true);
	const stored = readJson<RegisteredBoundFollowUpAdmissionV37>(checked.prepared.root, "admission.json", "follow-up admission");
	exact(stored, ["schema_version", "kind", "admission_id", "workflow_id", "workflow_registration_digest", "manifest_body_digest", "case_registration_digest", "registry_trust_root_digest", "evidence_body_digest", "submission_request_digest", "inspector_id", "inspector_fingerprint", "result", "reasons", "source_inventory_digest", "admission_digest"], "follow-up admission");
	const admissionSeed = { workflow_id: options.workflowId, evidence_body_digest: checked.evidence.evidence_body_digest, submission_request_digest: checked.request.submission_request_digest };
	if (bodyDigest(stored as unknown as Record<string, unknown>, "admission_digest") !== stored.admission_digest || stored.admission_id !== `v37-follow-up-admission-${digestObject(admissionSeed).slice(0, 32)}` || stored.workflow_id !== checked.registered.workflow.workflow_id || stored.workflow_registration_digest !== checked.registered.workflow.workflow_registration_digest || stored.manifest_body_digest !== checked.registered.workflow.manifest_body_digest || stored.case_registration_digest !== checked.registered.workflow.registration_digest || stored.registry_trust_root_digest !== checked.registered.workflow.registry_trust_root_digest || stored.inspector_id !== INSPECTOR_ID || stored.inspector_fingerprint !== inspectorFingerprint() || stored.source_inventory_digest !== checked.sourceInventoryDigest || stored.evidence_body_digest !== checked.evidence.evidence_body_digest || stored.submission_request_digest !== checked.request.submission_request_digest || stored.result !== "admitted" || stored.reasons.length !== 0) throw new Error("follow-up admission recomputation mismatch");
	return stored;
}

export async function normalizeRegisteredBoundFollowUpV37(options: RegisteredFollowUpOptionsV37 & { historicalReadOnly?: true }): Promise<CanonicalBoundStateAssessmentInputG2> {
	const admission = await recomputeRegisteredFollowUpAdmissionV37(options);
	const root = workflowFollowUpRoot(options, false);
	const evidence = readJson<RegisteredBoundFollowUpEvidenceBodyV37>(root, "evidence.json", "follow-up Evidence");
	const binding = readJson<RegisteredFollowUpBindingV37>(root, "binding.json", "follow-up binding");
	return {
		admission_identity: { admission_id: admission.admission_id, admission_digest: admission.admission_digest }, evidence_identity: { evidence_id: evidence.follow_up_run_id, evidence_digest: evidence.evidence_body_digest }, trusted_task_context: { task_kind: "typescript-maintenance", failure_family: "verifier-failure" }, state_store_scope_digest: evidence.state_store_scope_digest,
		bound_active_state_identity: { binding_revision: binding.active_binding_revision, state_version: evidence.state_version_id, state_digest: evidence.active_state_digest }, bound_promotion_decision_identity: { decision_id: evidence.promotion_decision_id, decision_digest: evidence.promotion_decision_digest }, binding_digest: evidence.frozen_binding_digest,
		outcome_status: evidence.formal_outcome, verifier_status: evidence.formal_outcome === "passed" ? "passed" : evidence.formal_outcome === "failed" ? "failed" : "invalid", failure_attribution: evidence.formal_outcome === "failed" ? "verifier" : evidence.formal_outcome === "passed" ? "none" : "infrastructure",
	};
}

export function registeredFollowUpTreeDigestV37(options: Pick<RegisteredFollowUpOptionsV37, "projectRoot" | "dataRoot" | "workflowId">): string {
	return treeDigest(workflowFollowUpRoot(options, false));
}
