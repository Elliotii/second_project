import { lstatSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import type {
	HarnessAdaptationDescriptorV36,
	InteractiveRequestedModeV36,
	ProjectSkillDescriptorV36,
	SafeProjectProfileV36,
} from "../contracts/v36-types.ts";
import { digestObject, sha256 } from "../hash.ts";

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const SAFE_TEXT_PROHIBITED = /(?:[A-Za-z]:[\\/]|\\\\|Bearer\s+|api[_-]?key|authorization|password|secret|access[_-]?token)/i;

export interface ProjectProfileRegistrationV36 {
	project_id: string;
	display_name: string;
	source_root: string;
	writable_paths: string[];
	protected_paths: string[];
	supported_modes: InteractiveRequestedModeV36[];
	risk_notice: string;
	execution_backend_profile_id: string;
	provider_model_policy_id: string;
	pi_native_skills: ProjectSkillDescriptorV36[];
	harness_adaptations: HarnessAdaptationDescriptorV36[];
	current_state(): { state_digest: string };
}

export interface ResolvedProjectProfileV36 {
	registration: ProjectProfileRegistrationV36;
	canonical_source_root: string;
	profile_digest: string;
	execution_backend_profile_digest: string;
	provider_model_policy_digest: string;
	projected: SafeProjectProfileV36;
}

function identifier(value: string, label: string): void {
	if (!ID.test(value)) throw new Error(`${label} is invalid`);
}

function safeText(value: string, label: string, maxBytes: number): void {
	if (typeof value !== "string" || Buffer.byteLength(value, "utf8") === 0 || Buffer.byteLength(value, "utf8") > maxBytes || SAFE_TEXT_PROHIBITED.test(value)) throw new Error(`${label} is not browser-safe`);
}

function exactKeys<T extends object>(value: T, expected: readonly string[], label: string): void {
	const actual = Object.keys(value).sort();
	const wanted = [...expected].sort();
	if (JSON.stringify(actual) !== JSON.stringify(wanted)) throw new Error(`${label} fields are invalid`);
}

function validateSkill(value: ProjectSkillDescriptorV36): void {
	exactKeys(value, ["id", "name", "description", "source", "read_only"], "Pi Skill descriptor");
	identifier(value.id, "Pi Skill ID");
	safeText(value.name, "Pi Skill name", 128);
	safeText(value.description, "Pi Skill description", 512);
	if (value.source !== "pi_native" || value.read_only !== true) throw new Error("Pi Skill descriptor is not read-only");
}

function validateAdaptation(value: HarnessAdaptationDescriptorV36): void {
	exactKeys(value, ["id", "kind", "name", "status", "read_only"], "Harness Adaptation descriptor");
	identifier(value.id, "Harness Adaptation ID");
	safeText(value.name, "Harness Adaptation name", 128);
	if (!["prompt_addendum", "adaptive_skill"].includes(value.kind) || !["active", "available", "not_bound"].includes(value.status) || value.read_only !== true) throw new Error("Harness Adaptation descriptor is invalid");
}

export class ProjectProfileRegistryV36 {
	private readonly profiles = new Map<string, ResolvedProjectProfileV36>();

	constructor(registrations: readonly ProjectProfileRegistrationV36[]) {
		if (registrations.length === 0) throw new Error("at least one registered Project Profile is required");
		for (const registration of registrations) {
			exactKeys(registration, ["project_id", "display_name", "source_root", "writable_paths", "protected_paths", "supported_modes", "risk_notice", "execution_backend_profile_id", "provider_model_policy_id", "pi_native_skills", "harness_adaptations", "current_state"], "Project Profile");
			identifier(registration.project_id, "project ID");
			if (this.profiles.has(registration.project_id)) throw new Error("duplicate Project Profile ID");
			safeText(registration.display_name, "project display name", 256);
			safeText(registration.risk_notice, "project risk notice", 1_024);
			identifier(registration.execution_backend_profile_id, "execution backend profile ID");
			identifier(registration.provider_model_policy_id, "provider/model policy ID");
			if (!Array.isArray(registration.supported_modes) || registration.supported_modes.length === 0 || new Set(registration.supported_modes).size !== registration.supported_modes.length || registration.supported_modes.some((mode) => mode !== "inspect_only" && mode !== "bounded_edit")) throw new Error("supported modes are invalid");
			if (!Array.isArray(registration.writable_paths) || !Array.isArray(registration.protected_paths)) throw new Error("Project Profile path policy is invalid");
			registration.pi_native_skills.forEach(validateSkill);
			registration.harness_adaptations.forEach(validateAdaptation);
			const source = resolve(registration.source_root);
			const stats = lstatSync(source);
			if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error("registered Source root must be an ordinary directory");
			const canonicalSource = realpathSync.native(source);
			const sourceRootIdentity = sha256(process.platform === "win32" ? canonicalSource.toLowerCase().replaceAll("\\", "/") : canonicalSource);
			const profileBody = {
				project_id: registration.project_id,
				display_name: registration.display_name,
				source_root_identity: sourceRootIdentity,
				workspace_strategy: "managed_session_copy",
				writable_paths: registration.writable_paths,
				protected_paths: registration.protected_paths,
				supported_modes: registration.supported_modes,
				execution_backend_profile_id: registration.execution_backend_profile_id,
				provider_model_policy_id: registration.provider_model_policy_id,
			};
			const profileDigest = digestObject(profileBody);
			const projected: SafeProjectProfileV36 = {
				schema_version: 1,
				project_id: registration.project_id,
				display_name: registration.display_name,
				profile_digest: profileDigest,
				workspace_strategy: "managed_session_copy",
				supported_modes: [...registration.supported_modes],
				capability_summary: {
					inspect_only: "read_only_files_no_commands",
					bounded_edit: registration.supported_modes.includes("bounded_edit") ? "planned_file_edits_commands_disabled_until_goal2" : "unavailable",
				},
				risk_notice: registration.risk_notice,
				pi_native_skills: structuredClone(registration.pi_native_skills),
				harness_adaptations: structuredClone(registration.harness_adaptations),
				read_only: true,
			};
			this.profiles.set(registration.project_id, {
				registration,
				canonical_source_root: canonicalSource,
				profile_digest: profileDigest,
				execution_backend_profile_digest: digestObject({ profile_id: registration.execution_backend_profile_id }),
				provider_model_policy_digest: digestObject({ policy_id: registration.provider_model_policy_id }),
				projected,
			});
		}
	}

	list(): SafeProjectProfileV36[] {
		return [...this.profiles.values()].map((profile) => structuredClone(profile.projected));
	}

	resolve(projectId: string): ResolvedProjectProfileV36 {
		identifier(projectId, "project ID");
		const profile = this.profiles.get(projectId);
		if (!profile) throw new Error("registered Project Profile is unavailable");
		const state = profile.registration.current_state();
		if (!state || !SHA256.test(state.state_digest)) throw new Error("current Harness State identity is invalid");
		return profile;
	}
}
