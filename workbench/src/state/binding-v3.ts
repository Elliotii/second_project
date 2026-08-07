import { lstatSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Skill } from "@earendil-works/pi-agent-core";
import type { ArtifactRefV0B } from "../contracts/v0b-types.ts";
import type { ActiveStateIdentityV3, ActiveStatePointerV3, HarnessStateVersionV3, StateDecisionV3, StateStoreInspectionV3 } from "../contracts/v3g2-types.ts";
import type { BindingContextV3, BoundStateEntryV3, FrozenRunBindingV3, Goal3CaseAuthorityV3, RefinementLineageV3 } from "../contracts/v3g3-types.ts";
import type { HarnessStateEntryV3 } from "../contracts/v3-types.ts";
import { artifactRef, writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, sha256, stableJson } from "../hash.ts";
import { composePromptAddendaV3 } from "../prompts/adapter-v3.ts";
import { loadAdaptiveSkillV3 } from "../skill/adapter-v3.ts";
import { inspectPromotionAdmissionLineageV3 } from "../refinement/admission-v3.ts";
import { assertContextAuthorizedByCaseV3, inspectGoal3CaseAuthorityV3 } from "./case-authority-v3.ts";
import { semanticStateEntriesV3 } from "./identity-v3.ts";
import { inspectStateStoreV3 } from "./store-v3.ts";

export interface FrozenBindingResultV3 {
	binding: FrozenRunBindingV3;
	bindingRef: ArtifactRefV0B;
	composedPrompt: string;
	adaptiveSkill: Skill | null;
}

function bindingBody(binding: FrozenRunBindingV3): Omit<FrozenRunBindingV3, "binding_digest"> {
	const { binding_digest: _digest, ...body } = binding;
	return body;
}

function activeIdentity(pointer: Pick<ActiveStatePointerV3, "binding_revision" | "state_version" | "state_digest">): ActiveStateIdentityV3 {
	return { binding_revision: pointer.binding_revision, state_version: pointer.state_version, state_digest: pointer.state_digest };
}

function applies(entry: HarnessStateEntryV3, context: BindingContextV3): boolean {
	const taskMatch = entry.applicability.task_kinds.length === 0 || entry.applicability.task_kinds.includes(context.trusted_task_identity.task_kind);
	const failureMatch = entry.applicability.failure_families.length === 0 || (context.trusted_failure_lineage !== null && entry.applicability.failure_families.includes(context.trusted_failure_lineage.failure_family));
	return taskMatch && failureMatch;
}

function boundIdentity(entry: HarnessStateEntryV3): BoundStateEntryV3 {
	const semantic = semanticStateEntriesV3([entry])[0];
	return { entry_id: entry.entry_id, kind: entry.kind, semantic_digest: digestObject(semantic), source_digest: entry.kind === "adaptive_skill" ? entry.source_sha256 : null };
}

function promotionLineage(options: { version: HarnessStateVersionV3; decisions: StateDecisionV3[]; projectRoot: string; admissionRegistryRoot: string; projectId: string }): RefinementLineageV3 | null {
	const { version, decisions } = options;
	if (version.state_version === 0) return null;
	const decision = decisions.find((entry) => entry.kind === "promotion" && entry.next_active.state_digest === version.state_digest);
	if (!decision || !decision.candidate_id || !decision.candidate_digest || !decision.staged_state_digest || !decision.validation_id || !decision.validation_digest) throw new Error("accepted version promotion lineage missing");
	if (version.source_candidate_id !== decision.candidate_id || version.source_candidate_digest !== decision.candidate_digest || version.source_staged_state_digest !== decision.staged_state_digest) throw new Error("accepted version source lineage mismatch");
	const admissionDigest = inspectPromotionAdmissionLineageV3({ registryRoot: options.admissionRegistryRoot, projectRoot: options.projectRoot, expectedProjectId: options.projectId, decision });
	return {
		candidate_id: decision.candidate_id,
		candidate_digest: decision.candidate_digest,
		staged_state_digest: decision.staged_state_digest,
		validation_id: decision.validation_id,
		validation_digest: decision.validation_digest,
		decision_id: decision.decision_id,
		decision_digest: decision.decision_digest,
		version_digest: version.state_digest,
		admission_digest: admissionDigest,
	};
}

async function deriveBinding(options: {
	stateRoot: string;
	projectId: string;
	pointer: ActiveStatePointerV3;
	version: HarnessStateVersionV3;
	decisions: StateDecisionV3[];
	context: BindingContextV3;
	immutableBasePrompt: string;
	immutableBasePromptSha256: string;
	projectRoot: string;
	admissionRegistryRoot: string;
	caseAuthority: Goal3CaseAuthorityV3;
}): Promise<{ binding: FrozenRunBindingV3; composedPrompt: string; adaptiveSkill: Skill | null }> {
	assertContextAuthorizedByCaseV3(options.context, options.caseAuthority);
	if (options.pointer.project_id !== options.projectId || options.version.project_id !== options.projectId || options.version.state_digest !== options.pointer.state_digest || options.version.state_version !== options.pointer.state_version) throw new Error("binding project/active version mismatch");
	const matches = options.version.entries.filter((entry) => applies(entry, options.context)).sort((a, b) => a.entry_id.localeCompare(b.entry_id));
	const promptEntries = matches.filter((entry) => entry.kind === "prompt_addendum");
	const skillEntries = matches.filter((entry) => entry.kind === "adaptive_skill");
	if (skillEntries.length > 1) throw new Error("multiple matching adaptive Skills fail closed");
	const preview = promptEntries.length === 0 ? null : composePromptAddendaV3({ basePrompt: options.immutableBasePrompt, expectedBasePromptSha256: options.immutableBasePromptSha256, entries: promptEntries });
	const composedPrompt = preview?.composed_prompt ?? options.immutableBasePrompt;
	let adaptiveSkill: Skill | null = null;
	let adaptiveSkillSourceSha256: string | null = null;
	let adaptiveSkillWrapperSha256: string | null = null;
	let adaptiveSkillName: string | null = null;
	if (skillEntries.length === 1) {
		const entry = skillEntries[0]!;
		const loaded = await loadAdaptiveSkillV3({ skillRoot: resolve(options.stateRoot, "versions", options.version.state_digest, "skills"), expectedName: entry.skill_name, expectedSourceSha256: entry.source_sha256 });
		if (loaded.wrapper_sha256 !== entry.wrapper_sha256) throw new Error("frozen adaptive Skill wrapper identity mismatch");
		adaptiveSkill = loaded.skill; adaptiveSkillName = entry.skill_name; adaptiveSkillSourceSha256 = loaded.source_sha256; adaptiveSkillWrapperSha256 = loaded.wrapper_sha256;
	}
	const body: Omit<FrozenRunBindingV3, "binding_digest"> = {
		schema_version: 1,
		project_id: options.projectId,
		active_binding_revision: options.pointer.binding_revision,
		active_state_version: options.pointer.state_version,
		active_state_digest: options.pointer.state_digest,
		active_decision_id: options.pointer.decision_id,
		case_authority_digest: options.caseAuthority.authority_digest,
		binding_context: structuredClone(options.context),
		binding_context_digest: digestObject(options.context),
		bound_entries: matches.map(boundIdentity),
		composed_prompt_sha256: sha256(composedPrompt),
		adaptive_skill_name: adaptiveSkillName,
		adaptive_skill_source_sha256: adaptiveSkillSourceSha256,
		adaptive_skill_wrapper_sha256: adaptiveSkillWrapperSha256,
		lineage: promotionLineage({ version: options.version, decisions: options.decisions, projectRoot: options.projectRoot, admissionRegistryRoot: options.admissionRegistryRoot, projectId: options.projectId }),
	};
	return { binding: { ...body, binding_digest: digestObject(body) }, composedPrompt, adaptiveSkill };
}

export async function freezeRunBindingV3(options: { projectRoot: string; stateRoot: string; admissionRegistryRoot: string; caseAuthorityPath: string; runRoot: string; projectId: string; context: BindingContextV3; immutableBasePrompt: string; immutableBasePromptSha256: string }): Promise<FrozenBindingResultV3> {
	const caseAuthority = inspectGoal3CaseAuthorityV3({ authorityPath: options.caseAuthorityPath, expectedProjectId: options.projectId });
	const store = await inspectStateStoreV3({ stateRoot: options.stateRoot, expectedProjectId: options.projectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
	if (!store.integrity_valid || !store.active) throw new Error(`active State fails closed at Run start: ${store.errors.join("; ")}`);
	const version = store.versions.find((entry) => entry.state_digest === store.active!.state_digest);
	if (!version) throw new Error("active State version missing at Run start");
	const derived = await deriveBinding({ stateRoot: options.stateRoot, projectId: options.projectId, pointer: store.active, version, decisions: store.decisions, context: options.context, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256, projectRoot: options.projectRoot, admissionRegistryRoot: options.admissionRegistryRoot, caseAuthority });
	const bindingRef = writeOnceJson(options.runRoot, "binding.json", derived.binding);
	return { ...derived, bindingRef };
}

function historicalPointer(binding: FrozenRunBindingV3, store: StateStoreInspectionV3): ActiveStatePointerV3 {
	const decision = store.decisions.find((entry) => entry.decision_id === binding.active_decision_id);
	if (!decision || stableJson(decision.next_active) !== stableJson({ binding_revision: binding.active_binding_revision, state_version: binding.active_state_version, state_digest: binding.active_state_digest })) throw new Error("historical binding decision lineage mismatch");
	return { schema_version: 1, project_id: binding.project_id, ...decision.next_active, decision_id: decision.decision_id, pointer_digest: digestObject({ schema_version: 1, project_id: binding.project_id, ...decision.next_active, decision_id: decision.decision_id }) };
}

export async function inspectRunBindingV3(options: { projectRoot: string; stateRoot: string; admissionRegistryRoot: string; caseAuthorityPath: string; runRoot: string; expectedProjectId: string; immutableBasePrompt: string; immutableBasePromptSha256: string }): Promise<{ integrity_valid: boolean; errors: string[]; binding: FrozenRunBindingV3 | null; current_active: ActiveStateIdentityV3 | null; case_authority: Goal3CaseAuthorityV3 | null }> {
	const errors: string[] = [];
	let binding: FrozenRunBindingV3 | null = null;
	let currentActive: ActiveStateIdentityV3 | null = null;
	let caseAuthority: Goal3CaseAuthorityV3 | null = null;
	try {
		caseAuthority = inspectGoal3CaseAuthorityV3({ authorityPath: options.caseAuthorityPath, expectedProjectId: options.expectedProjectId });
		const path = resolve(options.runRoot, "binding.json"); const stats = lstatSync(path);
		if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("binding record must be an ordinary file");
		binding = JSON.parse(readFileSync(path, "utf8")) as FrozenRunBindingV3;
		if (binding.binding_digest !== digestObject(bindingBody(binding))) throw new Error("binding content identity mismatch");
		const store = await inspectStateStoreV3({ stateRoot: options.stateRoot, expectedProjectId: options.expectedProjectId, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256 });
		if (!store.integrity_valid || !store.active) throw new Error(`State store inspection failed: ${store.errors.join("; ")}`);
		currentActive = activeIdentity(store.active);
		const version = store.versions.find((entry) => entry.state_digest === binding!.active_state_digest);
		if (!version) throw new Error("historical bound State version missing");
		const pointer = historicalPointer(binding, store);
		const recomputed = await deriveBinding({ stateRoot: options.stateRoot, projectId: options.expectedProjectId, pointer, version, decisions: store.decisions, context: binding.binding_context, immutableBasePrompt: options.immutableBasePrompt, immutableBasePromptSha256: options.immutableBasePromptSha256, projectRoot: options.projectRoot, admissionRegistryRoot: options.admissionRegistryRoot, caseAuthority });
		if (stableJson(binding) !== stableJson(recomputed.binding)) throw new Error("binding recomputation mismatch");
	} catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
	return { integrity_valid: errors.length === 0, errors, binding, current_active: currentActive, case_authority: caseAuthority };
}
