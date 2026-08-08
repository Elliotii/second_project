import { lstatSync, mkdirSync, readFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import type { Skill } from "@earendil-works/pi-agent-core";
import type { Goal2ArmV35, Goal2StateSelectionAuthorityV35 } from "../contracts/v35g2-types.ts";
import type { FrozenRunBindingV3, RefinementLineageV3 } from "../contracts/v3g3-types.ts";
import type { AdaptiveSkillStateEntryV3 } from "../contracts/v3-types.ts";
import { writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, sha256, treeDigest } from "../hash.ts";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_SHA256 } from "../prompts/base.ts";
import { loadAdaptiveSkillV3 } from "../skill/adapter-v3.ts";
import type { FrozenBindingResultV3 } from "../state/binding-v3.ts";
import { buildBindingContextFromCaseAuthorityV3, inspectGoal3CaseAuthorityV3 } from "../state/case-authority-v3.ts";
import { semanticStateEntriesV3 } from "../state/identity-v3.ts";
import { inspectStateStoreV3 } from "../state/store-v3.ts";
import { GOAL2_PROJECT_ID_V35, GOAL2_SELECTED_STATE_DIGEST_V35, GOAL2_SKILL_NAME_V35, GOAL2_SKILL_SOURCE_SHA256_V35, GOAL2_SKILL_WRAPPER_SHA256_V35 } from "./case-v35g2.ts";

const HISTORICAL_PROJECT_ID = "v3-g3-portfolio-project";

function body(authority: Goal2StateSelectionAuthorityV35): Omit<Goal2StateSelectionAuthorityV35, "authority_digest"> {
	const { authority_digest: _digest, ...value } = authority;
	return value;
}

export async function materializeGoal2StateSelectionV35(options: { sourceStateRoot: string; authorityRoot: string }): Promise<{ authority: Goal2StateSelectionAuthorityV35; authorityPath: string; stateRoot: string }> {
	const source = await inspectStateStoreV3({ stateRoot: options.sourceStateRoot, expectedProjectId: HISTORICAL_PROJECT_ID, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	if (!source.integrity_valid) throw new Error(`historical V3 State identity invalid: ${source.errors.join("; ")}`);
	const selected = source.versions.find((version) => version.state_version === 2 && version.state_digest === GOAL2_SELECTED_STATE_DIGEST_V35);
	if (!selected || selected.entries.length !== 1 || selected.entries[0]?.kind !== "adaptive_skill") throw new Error("exact historical adaptive State version is unavailable");
	const skillEntry = selected.entries[0] as AdaptiveSkillStateEntryV3;
	if (skillEntry.skill_name !== GOAL2_SKILL_NAME_V35 || skillEntry.source_sha256 !== GOAL2_SKILL_SOURCE_SHA256_V35 || skillEntry.wrapper_sha256 !== GOAL2_SKILL_WRAPPER_SHA256_V35) throw new Error("historical adaptive Skill identity mismatch");
	const decision = source.decisions.find((entry) => entry.kind === "promotion" && entry.next_active.state_digest === selected.state_digest);
	if (!decision) throw new Error("historical adaptive State promotion lineage missing");
	const sourceTreeDigest = treeDigest(options.sourceStateRoot);
	mkdirSync(options.authorityRoot, { recursive: true });
	const stateRoot = realpathSync.native(resolve(options.sourceStateRoot));
	const loaded = await loadAdaptiveSkillV3({ skillRoot: resolve(stateRoot, "versions", selected.state_digest, "skills"), expectedName: GOAL2_SKILL_NAME_V35, expectedSourceSha256: GOAL2_SKILL_SOURCE_SHA256_V35 });
	if (loaded.wrapper_sha256 !== GOAL2_SKILL_WRAPPER_SHA256_V35) throw new Error("derived Goal 2 Skill wrapper identity mismatch");
	const portableRoot = stateRoot.replaceAll("\\", "/");
	const authorityBody: Omit<Goal2StateSelectionAuthorityV35, "authority_digest"> = { schema_version: 1, project_id: GOAL2_PROJECT_ID_V35, source_project_id: HISTORICAL_PROJECT_ID, source_state_root: portableRoot, source_state_root_sha256: sha256(portableRoot), source_authority_tree_digest: sourceTreeDigest, selected_state_version: 2, selected_state_digest: selected.state_digest, selected_decision_id: decision.decision_id, selected_decision_digest: decision.decision_digest, skill_name: skillEntry.skill_name, skill_entry_id: skillEntry.entry_id, skill_source_sha256: skillEntry.source_sha256, skill_wrapper_sha256: skillEntry.wrapper_sha256 };
	const authority = { ...authorityBody, authority_digest: digestObject(authorityBody) };
	const ref = writeOnceJson(options.authorityRoot, "selection.json", authority);
	return { authority, authorityPath: resolve(options.authorityRoot, ref.path), stateRoot };
}

export async function inspectGoal2StateSelectionV35(options: { authorityRoot: string }): Promise<{ authority: Goal2StateSelectionAuthorityV35; stateRoot: string; skillEntry: AdaptiveSkillStateEntryV3; skill: Skill; lineage: RefinementLineageV3 }> {
	const authorityPath = resolve(options.authorityRoot, "selection.json");
	const stats = lstatSync(authorityPath);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error("Goal 2 State selection authority is not an ordinary file");
	const authority = JSON.parse(readFileSync(authorityPath, "utf8")) as Goal2StateSelectionAuthorityV35;
	if (JSON.stringify(Object.keys(authority).sort()) !== JSON.stringify(["schema_version", "project_id", "source_project_id", "source_state_root", "source_state_root_sha256", "source_authority_tree_digest", "selected_state_version", "selected_state_digest", "selected_decision_id", "selected_decision_digest", "skill_name", "skill_entry_id", "skill_source_sha256", "skill_wrapper_sha256", "authority_digest"].sort())) throw new Error("Goal 2 State selection exact-key validation failed");
	if (authority.schema_version !== 1 || authority.project_id !== GOAL2_PROJECT_ID_V35 || authority.source_project_id !== HISTORICAL_PROJECT_ID || authority.selected_state_version !== 2 || authority.selected_state_digest !== GOAL2_SELECTED_STATE_DIGEST_V35 || authority.skill_name !== GOAL2_SKILL_NAME_V35 || authority.skill_source_sha256 !== GOAL2_SKILL_SOURCE_SHA256_V35 || authority.skill_wrapper_sha256 !== GOAL2_SKILL_WRAPPER_SHA256_V35 || authority.authority_digest !== digestObject(body(authority))) throw new Error("Goal 2 State selection identity mismatch");
	if (authority.source_state_root_sha256 !== sha256(authority.source_state_root)) throw new Error("Goal 2 historical State path identity mismatch");
	const stateRoot = realpathSync.native(resolve(authority.source_state_root));
	if (stateRoot.replaceAll("\\", "/") !== authority.source_state_root || treeDigest(stateRoot) !== authority.source_authority_tree_digest) throw new Error("Goal 2 historical State authority drift");
	const store = await inspectStateStoreV3({ stateRoot, expectedProjectId: HISTORICAL_PROJECT_ID, immutableBasePrompt: SYSTEM_PROMPT, immutableBasePromptSha256: SYSTEM_PROMPT_SHA256 });
	if (!store.integrity_valid) throw new Error(`Goal 2 isolated State inspection failed: ${store.errors.join("; ")}`);
	const selected = store.versions.find((entry) => entry.state_version === 2 && entry.state_digest === authority.selected_state_digest);
	const decision = store.decisions.find((entry) => entry.decision_id === authority.selected_decision_id && entry.decision_digest === authority.selected_decision_digest);
	if (!selected || !decision || decision.kind !== "promotion" || decision.next_active.state_digest !== selected.state_digest || selected.entries.length !== 1 || selected.entries[0]?.kind !== "adaptive_skill") throw new Error("Goal 2 selected State lineage mismatch");
	const skillEntry = selected.entries[0] as AdaptiveSkillStateEntryV3;
	const loaded = await loadAdaptiveSkillV3({ skillRoot: resolve(stateRoot, "versions", selected.state_digest, "skills"), expectedName: authority.skill_name, expectedSourceSha256: authority.skill_source_sha256 });
	if (loaded.wrapper_sha256 !== authority.skill_wrapper_sha256) throw new Error("Goal 2 selected Skill wrapper drift");
	if (!decision.candidate_id || !decision.candidate_digest || !decision.staged_state_digest || !decision.validation_id || !decision.validation_digest) throw new Error("Goal 2 selected State lineage incomplete");
	return { authority, stateRoot, skillEntry, skill: loaded.skill, lineage: { candidate_id: decision.candidate_id, candidate_digest: decision.candidate_digest, staged_state_digest: decision.staged_state_digest, validation_id: decision.validation_id, validation_digest: decision.validation_digest, decision_id: decision.decision_id, decision_digest: decision.decision_digest, version_digest: selected.state_digest, admission_digest: null } };
}

export async function freezeGoal2RunBindingV35(options: { arm: Goal2ArmV35; selectionAuthorityRoot: string; caseAuthorityPath: string; runRoot: string }): Promise<FrozenBindingResultV3> {
	const selected = await inspectGoal2StateSelectionV35({ authorityRoot: options.selectionAuthorityRoot });
	const caseAuthority = inspectGoal3CaseAuthorityV3({ authorityPath: options.caseAuthorityPath, expectedProjectId: GOAL2_PROJECT_ID_V35 });
	const context = buildBindingContextFromCaseAuthorityV3(caseAuthority);
	const treatment = options.arm === "candidate";
	const semantic = semanticStateEntriesV3([selected.skillEntry])[0];
	const bindingBody: Omit<FrozenRunBindingV3, "binding_digest"> = { schema_version: 1, project_id: GOAL2_PROJECT_ID_V35, active_binding_revision: 2, active_state_version: 2, active_state_digest: selected.authority.selected_state_digest, active_decision_id: selected.authority.selected_decision_id, case_authority_digest: caseAuthority.authority_digest, binding_context: context, binding_context_digest: digestObject(context), bound_entries: treatment ? [{ entry_id: selected.skillEntry.entry_id, kind: "adaptive_skill", semantic_digest: digestObject(semantic), source_digest: selected.skillEntry.source_sha256 }] : [], composed_prompt_sha256: SYSTEM_PROMPT_SHA256, adaptive_skill_name: treatment ? selected.skillEntry.skill_name : null, adaptive_skill_source_sha256: treatment ? selected.skillEntry.source_sha256 : null, adaptive_skill_wrapper_sha256: treatment ? selected.skillEntry.wrapper_sha256 : null, lineage: selected.lineage };
	const binding = { ...bindingBody, binding_digest: digestObject(bindingBody) };
	const bindingRef = writeOnceJson(options.runRoot, "binding.json", binding);
	return { binding, bindingRef, composedPrompt: SYSTEM_PROMPT, adaptiveSkill: treatment ? selected.skill : null };
}
