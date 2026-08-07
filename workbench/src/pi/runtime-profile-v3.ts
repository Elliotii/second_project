import type { Goal3ProviderProfileV3 } from "../contracts/v3g3-types.ts";
import { digestObject } from "../hash.ts";
import { DEEPSEEK_FIXED_PROFILE_V1, FIXED_PROVIDER_ENVELOPE_V1 } from "../provider/fixed-provider-v1.ts";
import type { BoundedTaskPolicy } from "../types.ts";

function profile(value: Omit<Goal3ProviderProfileV3, "profile_digest">): Goal3ProviderProfileV3 {
	return Object.freeze({ ...value, profile_digest: digestObject(value) });
}

export const GOAL3_FAUX_PROVIDER_PROFILE_V3 = profile({
	provider_kind: "faux",
	provider_id: "v3g3-faux-provider",
	model_id: "v3g3-faux-model",
	api: "v3g3-faux-api",
	endpoint: null,
	thinking_level: "off",
	retry: false,
	fallback: false,
});

export const GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3 = profile({
	provider_kind: "deepseek_real",
	provider_id: DEEPSEEK_FIXED_PROFILE_V1.provider,
	model_id: DEEPSEEK_FIXED_PROFILE_V1.model,
	api: "openai-completions",
	endpoint: DEEPSEEK_FIXED_PROFILE_V1.endpoint,
	thinking_level: "off",
	retry: false,
	fallback: false,
});

export const GOAL3_BUDGET_PROFILE_V3 = Object.freeze({
	profile_id: "v3g3-fixed-one-run-v1",
	provider_requests_max: FIXED_PROVIDER_ENVELOPE_V1.provider_requests_max,
	tool_calls_max: FIXED_PROVIDER_ENVELOPE_V1.tool_calls_max,
	token_limit: FIXED_PROVIDER_ENVELOPE_V1.token_limit,
	wall_time_ms_max: FIXED_PROVIDER_ENVELOPE_V1.wall_time_ms_max,
	cost_usd_max: FIXED_PROVIDER_ENVELOPE_V1.cost_usd_max,
});

export const GOAL3_BUDGET_PROFILE_DIGEST_V3 = digestObject(GOAL3_BUDGET_PROFILE_V3);
export const GOAL3_TOOL_PROFILE_ID_V3 = "v3g3_bounded_local";
const GOAL3_TOOL_NAMES_V3 = Object.freeze([
	"workspace_read",
	"workspace_list",
	"workspace_search",
	"workspace_edit",
	"workspace_write",
	"run_command",
]);

export function goal3ToolProfileDigestV3(policy: BoundedTaskPolicy): string {
	return digestObject({
		profile_id: GOAL3_TOOL_PROFILE_ID_V3,
		tool_names: GOAL3_TOOL_NAMES_V3,
		writable_paths: policy.writable_paths,
		protected_paths: policy.protected_paths,
		command_descriptors: policy.command_descriptors,
	});
}
