import { lstatSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import type {
	HarnessAdaptationDescriptorV36,
	InteractiveRequestedModeV36,
	ProjectSkillDescriptorV36,
	SafeProjectProfileV36,
} from "../contracts/v36-types.ts";
import { digestObject, sha256 } from "../hash.ts";
import type { CommandDescriptor } from "../types.ts";
import { FROZEN_DOCKER_PROFILE_V36 } from "../execution/docker-v36.ts";

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
	command_descriptors?: CommandDescriptor[];
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
			const keys = Object.keys(registration);
			if (keys.some((key) => !["project_id", "display_name", "source_root", "writable_paths", "protected_paths", "supported_modes", "risk_notice", "execution_backend_profile_id", "provider_model_policy_id", "pi_native_skills", "harness_adaptations", "command_descriptors", "current_state"].includes(key)) || ["project_id", "display_name", "source_root", "writable_paths", "protected_paths", "supported_modes", "risk_notice", "execution_backend_profile_id", "provider_model_policy_id", "pi_native_skills", "harness_adaptations", "current_state"].some((key) => !keys.includes(key))) throw new Error("Project Profile fields are invalid");
			identifier(registration.project_id, "project ID");
			if (this.profiles.has(registration.project_id)) throw new Error("duplicate Project Profile ID");
			safeText(registration.display_name, "project display name", 256);
			safeText(registration.risk_notice, "project risk notice", 1_024);
			identifier(registration.execution_backend_profile_id, "execution backend profile ID");
			identifier(registration.provider_model_policy_id, "provider/model policy ID");
			if (!Array.isArray(registration.supported_modes) || registration.supported_modes.length === 0 || new Set(registration.supported_modes).size !== registration.supported_modes.length || registration.supported_modes.some((mode) => mode !== "inspect_only" && mode !== "bounded_edit")) throw new Error("supported modes are invalid");
			if (!Array.isArray(registration.writable_paths) || !Array.isArray(registration.protected_paths)) throw new Error("Project Profile path policy is invalid");
			const commands = registration.command_descriptors ?? [];
			if (!Array.isArray(commands) || commands.some((command) => command.executable !== "current_node_executable" || command.cwd !== "workspace" || !Array.isArray(command.argv) || command.argv.some((entry) => typeof entry !== "string") || !Number.isSafeInteger(command.timeout_seconds) || command.timeout_seconds < 1 || !Number.isSafeInteger(command.max_combined_output_bytes) || command.max_combined_output_bytes < 1)) throw new Error("Project Profile command descriptors are invalid");
			if (registration.execution_backend_profile_id === "docker-v36g2-frozen") {
				if (commands.length === 0 || new Set(commands.map((command) => command.command_id)).size !== commands.length || commands.some((command) => !ID.test(command.command_id) || command.timeout_seconds > FROZEN_DOCKER_PROFILE_V36.wall_timeout_ms / 1_000 || command.max_combined_output_bytes > FROZEN_DOCKER_PROFILE_V36.combined_output_budget_bytes || command.argv.length === 0 || command.argv.some((entry) => entry.length === 0 || entry.includes("\0")))) throw new Error("frozen Docker command registry is invalid");
			}
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
				command_descriptors: commands,
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
					bounded_edit: registration.supported_modes.includes("bounded_edit") ? (commands.length > 0 ? "docker_bounded_edit_change_handoff" : "planned_file_edits_commands_disabled_until_goal2") : "unavailable",
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
				execution_backend_profile_digest: registration.execution_backend_profile_id === "docker-v36g2-frozen" ? FROZEN_DOCKER_PROFILE_V36.profile_digest : digestObject({ profile_id: registration.execution_backend_profile_id }),
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
