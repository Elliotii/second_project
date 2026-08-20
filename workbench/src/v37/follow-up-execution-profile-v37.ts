import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type {
	FollowUpBudgetProfileV37,
	FollowUpCommandProfileV37,
	FollowUpExecutionAuthorityV37,
	FollowUpProviderProfileV37,
	FollowUpStopConditionProfileV37,
	FollowUpToolProfileV37,
	RegisteredFollowUpExecutionProfileV37,
} from "../contracts/v37-types.ts";
import { digestObject, fileSha256, stableJson } from "../hash.ts";
import { loadWorkflowRegistrationV37 } from "./workflow-registration-v37.ts";

export const V37_FOLLOW_UP_PROFILE_LOCATION = "workbench/config/v37/follow-up-execution-profiles/v37-g1-det-recovery.g2.v2.json" as const;
export const V37_FOLLOW_UP_CONFIGURATION_BASELINE_ID = "v37-g2-follow-up-profile-v2" as const;
export const V37_FOLLOW_UP_PROFILE_LOADER_CONTRACT_ID = "v37-follow-up-execution-profile-loader-v1" as const;
const HOST_PROJECT_ROOT = resolve(import.meta.dirname, "../../..");
const SHA256 = /^[a-f0-9]{64}$/;

const PROVIDER: FollowUpProviderProfileV37 = {
	profile_id: "v37-g2-deterministic-faux-v1", provider_kind: "public_emitted_faux", model_id: "v37-g2-faux/faux-1", external: false, credential_reads: 0, network_calls: 0, real_model_calls: 0,
};
const TOOL: FollowUpToolProfileV37 = {
	profile_id: "v37-g2-bounded-follow-up-v1", allowed_tool_names: ["workspace_read", "workspace_list", "workspace_search", "workspace_edit", "workspace_write", "run_command"], writable_paths: ["src/policy.mjs"], protected_paths: ["verifier/follow-up.test.mjs"], allow_repository_commands: false,
};
const COMMAND: FollowUpCommandProfileV37 = {
	profile_id: "v37-g2-follow-up-command-v1", commands_hard_max: 1, descriptors: [{ command_id: "follow_up_test", executable: "current_node_executable", argv: ["--test", "verifier/follow-up.test.mjs"], cwd: "workspace", timeout_seconds: 15, max_combined_output_bytes: 65536 }],
};
const BUDGET: FollowUpBudgetProfileV37 = {
	profile_id: "v37-g2-deterministic-budget-v2", v36_runtime_budget_profile_id: "v36_64_request_bounded_edit_v3", provider_requests_observation_threshold: 64, provider_requests_hard_max: 64, tool_calls_hard_max: 96, combined_tokens_hard_max: 524288, cost_usd_hard_max: 0.2, commands_hard_max: 1, verifier_runs_hard_max: 1, verifier_timeout_ms_hard_max: 15000, verifier_output_bytes_hard_max: 65536, wall_time_ms_hard_max: 3600000,
};
const STOP: FollowUpStopConditionProfileV37 = {
	profile_id: "v37-g2-no-retry-stop-v1", retry: 0, same_run_retry: 0, fallback: 0, replacement: 0, automatic_replacement: 0, task_swap: 0, result_hunting: 0, terminal_requires_complete_inspection: true,
};

const PROFILE_KEYS = [
	"schema_version", "kind", "profile_id", "case_id", "manifest_body_digest",
	"parent_provider_profile_digest", "parent_tool_profile_digest", "parent_command_profile_digest", "parent_budget_profile_digest", "parent_stop_condition_profile_digest",
	"provider_profile", "provider_profile_digest", "tool_profile", "tool_profile_digest", "command_profile", "command_profile_digest", "budget_profile", "budget_profile_digest", "stop_condition_profile", "stop_condition_profile_digest", "follow_up_execution_profile_digest",
] as const;

function exact(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	const record = value as Record<string, unknown>;
	if (stableJson(Object.keys(record).sort()) !== stableJson([...keys].sort())) throw new Error(`${label} exact-key validation failed`);
	return record;
}

function contained(root: string, target: string): boolean {
	const rel = relative(root, target);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function hostRoot(projectRoot: string): string {
	const owned = realpathSync.native(HOST_PROJECT_ROOT);
	let supplied: string;
	try { supplied = realpathSync.native(resolve(projectRoot)); }
	catch { throw new Error("caller projectRoot does not identify the loader-owned Host checkout"); }
	if (owned.toLowerCase() !== supplied.toLowerCase()) throw new Error("caller projectRoot cannot select an alternate follow-up profile baseline");
	return owned;
}

function fixedProfilePath(root: string): string {
	const target = resolve(root, V37_FOLLOW_UP_PROFILE_LOCATION);
	if (!contained(root, target)) throw new Error("follow-up profile escapes Host checkout");
	let cursor = root;
	for (const segment of relative(root, target).split(sep).filter(Boolean)) {
		cursor = resolve(cursor, segment);
		if (!existsSync(cursor)) throw new Error("registered follow-up profile is missing");
		if (lstatSync(cursor).isSymbolicLink()) throw new Error("registered follow-up profile path contains a link/reparse point");
	}
	const stats = lstatSync(target);
	if (!stats.isFile() || stats.nlink !== 1 || !contained(realpathSync.native(root), realpathSync.native(target))) throw new Error("registered follow-up profile must be an ordinary singly linked Host file");
	return target;
}

function validateProfile(value: unknown): RegisteredFollowUpExecutionProfileV37 {
	const profile = exact(value, PROFILE_KEYS, "registered follow-up execution profile");
	if (profile.schema_version !== 1 || profile.kind !== "v37_registered_follow_up_execution_profile" || profile.profile_id !== V37_FOLLOW_UP_CONFIGURATION_BASELINE_ID || profile.case_id !== "v37-g1-det-recovery" || !SHA256.test(String(profile.manifest_body_digest))) throw new Error("registered follow-up profile identity invalid");
	for (const key of ["parent_provider_profile_digest", "parent_tool_profile_digest", "parent_command_profile_digest", "parent_budget_profile_digest", "parent_stop_condition_profile_digest"] as const) if (!SHA256.test(String(profile[key]))) throw new Error("registered follow-up parent execution identity invalid");
	for (const [key, expected] of [["provider_profile", PROVIDER], ["tool_profile", TOOL], ["command_profile", COMMAND], ["budget_profile", BUDGET], ["stop_condition_profile", STOP]] as const) {
		if (stableJson(profile[key]) !== stableJson(expected)) throw new Error(`registered follow-up ${key} body mismatch`);
		const digestKey = `${key}_digest`;
		if (digestObject(profile[key]) !== profile[digestKey]) throw new Error(`registered follow-up ${key} digest mismatch`);
	}
	const { follow_up_execution_profile_digest: declared, ...body } = profile;
	if (!SHA256.test(String(declared)) || digestObject(body) !== declared) throw new Error("registered follow-up execution profile digest mismatch");
	return structuredClone(value) as RegisteredFollowUpExecutionProfileV37;
}

export function followUpProfileLoaderFingerprintV37(projectRoot: string): string {
	const root = hostRoot(projectRoot);
	return digestObject({
		configuration_baseline_id: V37_FOLLOW_UP_CONFIGURATION_BASELINE_ID,
		configuration_location: V37_FOLLOW_UP_PROFILE_LOCATION,
		loader_contract_id: V37_FOLLOW_UP_PROFILE_LOADER_CONTRACT_ID,
		loader_source_sha256: fileSha256(resolve(root, "workbench/src/v37/follow-up-execution-profile-v37.ts")),
		root_resolution: "module_owned_candidate_checkout_v1",
		digest_algorithm: "sha256_over_canonical_utf8_json_v1",
	});
}

export function loadRegisteredFollowUpExecutionProfileV37(options: { projectRoot: string; dataRoot: string; workflowId: string; allowHistoricalReadOnly?: true }): { profile: RegisteredFollowUpExecutionProfileV37; authority: FollowUpExecutionAuthorityV37 } {
	const keys = Object.keys(options).sort();
	if (stableJson(keys) !== stableJson(["dataRoot", "projectRoot", "workflowId"]) && stableJson(keys) !== stableJson(["allowHistoricalReadOnly", "dataRoot", "projectRoot", "workflowId"])) throw new Error("follow-up profile loader caller override rejected");
	const root = hostRoot(options.projectRoot);
	const registered = loadWorkflowRegistrationV37({ ...options, allowHistoricalReadOnly: options.allowHistoricalReadOnly });
	const profile = validateProfile(JSON.parse(readFileSync(fixedProfilePath(root), "utf8")));
	const workflow = registered.workflow;
	const manifest = registered.loadedCase.manifest;
	const parents = {
		parent_provider_profile_digest: workflow.provider_profile_digest,
		parent_tool_profile_digest: workflow.tool_profile_digest,
		parent_command_profile_digest: workflow.command_profile_digest,
		parent_budget_profile_digest: workflow.budget_profile_digest,
		parent_stop_condition_profile_digest: workflow.stop_condition_profile_digest,
	};
	if (profile.case_id !== workflow.case_id || profile.manifest_body_digest !== manifest.manifest_body_digest || Object.entries(parents).some(([key, value]) => profile[key as keyof typeof profile] !== value)) throw new Error("follow-up profile parent workflow execution tuple mismatch");
	const loaderFingerprint = followUpProfileLoaderFingerprintV37(root);
	const body: Omit<FollowUpExecutionAuthorityV37, "follow_up_execution_authority_digest"> = {
		workflow_id: workflow.workflow_id,
		workflow_registration_digest: workflow.workflow_registration_digest,
		registry_trust_root_digest: workflow.registry_trust_root_digest,
		manifest_body_digest: workflow.manifest_body_digest,
		...parents,
		configuration_location: V37_FOLLOW_UP_PROFILE_LOCATION,
		loader_contract_id: V37_FOLLOW_UP_PROFILE_LOADER_CONTRACT_ID,
		loader_contract_fingerprint: loaderFingerprint,
		follow_up_execution_profile_digest: profile.follow_up_execution_profile_digest,
	};
	return { profile, authority: { ...body, follow_up_execution_authority_digest: digestObject(body) } };
}
