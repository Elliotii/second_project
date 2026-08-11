import { stableJson } from "../hash.ts";

export interface BoundedEditBudgetProfileV36 {
	profile_id: "v36g2_frozen_acceptance_v1" | "v36_daily_bounded_edit_v2";
	provider_requests_observation_threshold: number;
	provider_requests_hard_max: number;
	tool_calls_hard_max: number;
	combined_tokens_hard_max: number;
	cost_usd_hard_max: number;
	wall_time_ms_hard_max: number;
}

export const V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE = Object.freeze({
	profile_id: "v36g2_frozen_acceptance_v1",
	provider_requests_observation_threshold: 16,
	provider_requests_hard_max: 16,
	tool_calls_hard_max: 24,
	combined_tokens_hard_max: 131_072,
	cost_usd_hard_max: 0.2,
	wall_time_ms_hard_max: 900_000,
} as const satisfies BoundedEditBudgetProfileV36);

export const V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE = Object.freeze({
	profile_id: "v36_daily_bounded_edit_v2",
	provider_requests_observation_threshold: 16,
	provider_requests_hard_max: 24,
	tool_calls_hard_max: 24,
	combined_tokens_hard_max: 131_072,
	cost_usd_hard_max: 0.2,
	wall_time_ms_hard_max: 900_000,
} as const satisfies BoundedEditBudgetProfileV36);

export function assertBoundedEditBudgetProfileV36(profile: BoundedEditBudgetProfileV36): void {
	const expected = profile.profile_id === V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE.profile_id
		? V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE
		: profile.profile_id === V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE.profile_id
			? V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE
			: null;
	if (expected === null || stableJson(profile) !== stableJson(expected)) throw new Error("V3.6 bounded-edit budget profile is invalid");
}
