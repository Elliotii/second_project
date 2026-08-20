import type { FollowUpExecutionAuthorityV37 } from "../contracts/v37-types.ts";
import type { RegisteredFollowUpExecutionProfileV37G3A } from "../contracts/v37g3a-types.ts";
import { digestObject, fileSha256, stableJson } from "../hash.ts";
import { fileURLToPath } from "node:url";
import { loadWorkflowRegistrationV37G3A } from "./workflow-registration-v37g3a.ts";

export const V37_G3A_FOLLOW_UP_PROFILE_LOADER_CONTRACT_ID = "v37-follow-up-execution-profile-loader-v1" as const;

export function followUpProfileLoaderFingerprintV37G3A(projectRoot: string, configurationLocation: string): string {
	return digestObject({
		loader_contract_id: V37_G3A_FOLLOW_UP_PROFILE_LOADER_CONTRACT_ID,
		loader_source_sha256: fileSha256(fileURLToPath(import.meta.url)),
		configuration_location: configurationLocation,
		root_resolution: "G3A_registry_entry_owned_v1",
		digest_algorithm: "sha256_over_canonical_utf8_json_v1",
	});
}

export function loadRegisteredFollowUpExecutionProfileV37G3A(options: { projectRoot: string; dataRoot: string; workflowId: string; allowHistoricalReadOnly?: true }): { profile: RegisteredFollowUpExecutionProfileV37G3A; authority: FollowUpExecutionAuthorityV37 } {
	const keys = Object.keys(options).sort();
	if (stableJson(keys) !== stableJson(["dataRoot", "projectRoot", "workflowId"]) && stableJson(keys) !== stableJson(["allowHistoricalReadOnly", "dataRoot", "projectRoot", "workflowId"])) throw new Error("follow-up profile loader caller override rejected");
	const registered = loadWorkflowRegistrationV37G3A({ ...options, allowHistoricalReadOnly: options.allowHistoricalReadOnly });
	const profile = structuredClone(registered.loadedCase.follow_up_execution_profile);
	const entry = registered.loadedCase.registry_entry;
	const parents = {
		parent_provider_profile_digest: registered.workflow.provider_profile_digest,
		parent_tool_profile_digest: registered.workflow.tool_profile_digest,
		parent_command_profile_digest: registered.workflow.command_profile_digest,
		parent_budget_profile_digest: registered.workflow.budget_profile_digest,
		parent_stop_condition_profile_digest: registered.workflow.stop_condition_profile_digest,
	};
	if (profile.case_id !== registered.workflow.case_id || profile.manifest_body_digest !== registered.workflow.manifest_body_digest || Object.entries(parents).some(([key, value]) => profile[key as keyof typeof profile] !== value)) throw new Error("follow-up profile parent workflow execution tuple mismatch");
	const loaderFingerprint = followUpProfileLoaderFingerprintV37G3A(options.projectRoot, entry.follow_up_execution_profile_location);
	const body: Omit<FollowUpExecutionAuthorityV37, "follow_up_execution_authority_digest"> = {
		workflow_id: registered.workflow.workflow_id,
		workflow_registration_digest: registered.workflow.workflow_registration_digest,
		registry_trust_root_digest: registered.workflow.registry_trust_root_digest,
		manifest_body_digest: registered.workflow.manifest_body_digest,
		...parents,
		configuration_location: entry.follow_up_execution_profile_location,
		loader_contract_id: V37_G3A_FOLLOW_UP_PROFILE_LOADER_CONTRACT_ID,
		loader_contract_fingerprint: loaderFingerprint,
		follow_up_execution_profile_digest: profile.follow_up_execution_profile_digest,
	};
	return { profile, authority: { ...body, follow_up_execution_authority_digest: digestObject(body) } };
}
