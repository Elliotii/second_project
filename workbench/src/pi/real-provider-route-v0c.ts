export interface RealProviderProfileV0C {
	profile_id: "deepseek_v4_flash_real";
	provider_id: "deepseek";
	model_id: "deepseek-v4-flash";
	credential_name: "DEEPSEEK_API_KEY";
}

export interface ProviderUsageProjectionV0C {
	provider_id: string;
	model_id: string;
	request_id: string;
	input_tokens: number | "unknown";
	output_tokens: number | "unknown";
	cost_usd: number | "unknown";
}

export interface ProviderTransportV0C {
	request(input: Readonly<{ model_id: string; prompt: string }>): Promise<Readonly<{
		request_id: string;
		text: string;
		input_tokens?: number;
		output_tokens?: number;
		cost_usd?: number;
	}>>;
}

export const DEEPSEEK_V4_FLASH_PROFILE_V0C: RealProviderProfileV0C = Object.freeze({
	profile_id: "deepseek_v4_flash_real",
	provider_id: "deepseek",
	model_id: "deepseek-v4-flash",
	credential_name: "DEEPSEEK_API_KEY",
});
const CONSUMED_REAL_AUTHORITIES = new WeakSet<object>();

export interface RealExecutionAuthorityV0C {
	readonly kind: "v0c_real_execution_authority";
	readonly authorized: true;
	readonly source: "stage2_user_authorization" | "deterministic_injected_test";
}

export interface CredentialResolutionV0C {
	readonly credential_handle: unknown;
	readonly real_credential_reads: number;
}

export interface ExecutionBudgetEnvelopeV0C {
	attempt: {
		provider_requests: number;
		tool_calls: number;
		agent_wall_time_ms: number;
		token_cap: number | "not_applicable";
		cost_cap_usd: number;
	};
	run: {
		provider_requests: number;
		tool_calls: number;
		wall_time_ms: number;
		finalization_reserve_ms: number;
		verifier_runs: number;
		token_cap: number | "not_applicable";
		cost_cap_usd: number;
	};
	child_reserve: {
		provider_requests: number;
		tool_calls: number;
		agent_wall_time_ms: number;
		verifier_runs: number;
		verifier_wall_time_ms: number;
		token_cap: number | "not_applicable";
		cost_cap_usd: number;
		finalization_wall_time_ms: number;
	};
}

export const STAGE2_MAXIMUM_BUDGET_V0C: ExecutionBudgetEnvelopeV0C = Object.freeze({
	attempt: { provider_requests: 8, tool_calls: 12, agent_wall_time_ms: 300000, token_cap: 65536, cost_cap_usd: 1 },
	run: {
		provider_requests: 16,
		tool_calls: 24,
		wall_time_ms: 900000,
		finalization_reserve_ms: 120000,
		verifier_runs: 2,
		token_cap: 131072,
		cost_cap_usd: 2,
	},
	child_reserve: {
		provider_requests: 8,
		tool_calls: 12,
		agent_wall_time_ms: 300000,
		verifier_runs: 1,
		verifier_wall_time_ms: 30000,
		token_cap: 65536,
		cost_cap_usd: 1,
		finalization_wall_time_ms: 120000,
	},
});

export interface RealExecutionDependenciesV0C {
	readonly authority: RealExecutionAuthorityV0C;
	readonly resolveCredential: (profile: RealProviderProfileV0C) => Promise<CredentialResolutionV0C>;
	readonly createHandle: (
		options: PiRunHandleOptionsV0C,
		context: {
			profile: RealProviderProfileV0C;
			credential_handle: unknown;
		},
	) => PiRunHandleV0C;
	readonly budget: ExecutionBudgetEnvelopeV0C;
}

export function createRealExecutionAuthorityV0C(
	source: RealExecutionAuthorityV0C["source"],
): RealExecutionAuthorityV0C {
	return Object.freeze({ kind: "v0c_real_execution_authority", authorized: true, source });
}

export function validateRealExecutionDependenciesV0C(value: RealExecutionDependenciesV0C | undefined): asserts value is RealExecutionDependenciesV0C {
	if (
		!value ||
		value.authority.kind !== "v0c_real_execution_authority" ||
		value.authority.authorized !== true ||
		typeof value.resolveCredential !== "function" ||
		typeof value.createHandle !== "function"
	) throw new Error("real Provider execution authority/dependencies are unavailable");
	validateExecutionBudgetV0C(value.budget);
}

export function consumeRealExecutionAuthorityV0C(authority: RealExecutionAuthorityV0C): void {
	if (CONSUMED_REAL_AUTHORITIES.has(authority)) throw new Error("real Provider execution authority is already consumed");
	CONSUMED_REAL_AUTHORITIES.add(authority);
}

export function validateExecutionBudgetV0C(value: ExecutionBudgetEnvelopeV0C): void {
	const max = STAGE2_MAXIMUM_BUDGET_V0C;
	const positive = [
		value.attempt.provider_requests, value.attempt.tool_calls, value.attempt.agent_wall_time_ms,
		value.run.provider_requests, value.run.tool_calls, value.run.wall_time_ms,
		value.run.finalization_reserve_ms, value.run.verifier_runs,
		value.child_reserve.provider_requests, value.child_reserve.tool_calls,
		value.child_reserve.agent_wall_time_ms, value.child_reserve.verifier_runs,
		value.child_reserve.verifier_wall_time_ms, value.child_reserve.finalization_wall_time_ms,
	];
	if (positive.some((entry) => !Number.isFinite(entry) || entry <= 0)) throw new Error("real execution budget must be positive");
	if (
		value.attempt.provider_requests > max.attempt.provider_requests ||
		value.attempt.tool_calls > max.attempt.tool_calls ||
		value.attempt.agent_wall_time_ms > max.attempt.agent_wall_time_ms ||
		value.attempt.cost_cap_usd > max.attempt.cost_cap_usd ||
		value.run.provider_requests > max.run.provider_requests ||
		value.run.tool_calls > max.run.tool_calls ||
		value.run.wall_time_ms > max.run.wall_time_ms ||
		value.run.finalization_reserve_ms > max.run.finalization_reserve_ms ||
		value.run.verifier_runs > max.run.verifier_runs ||
		value.run.cost_cap_usd > max.run.cost_cap_usd
	) throw new Error("real execution budget exceeds the frozen Stage 2 maximum");
	for (const [actual, maximum] of [
		[value.attempt.token_cap, max.attempt.token_cap],
		[value.run.token_cap, max.run.token_cap],
		[value.child_reserve.token_cap, max.child_reserve.token_cap],
	] as const) {
		if (
			actual !== "not_applicable" &&
			(maximum === "not_applicable" || !Number.isFinite(actual) || actual <= 0 || actual > maximum)
		) throw new Error("real execution token budget exceeds the frozen Stage 2 maximum");
	}
	if (
		value.run.provider_requests < value.child_reserve.provider_requests ||
		value.run.tool_calls < value.child_reserve.tool_calls ||
		value.run.wall_time_ms < value.child_reserve.agent_wall_time_ms + value.child_reserve.verifier_wall_time_ms + value.child_reserve.finalization_wall_time_ms ||
		value.run.verifier_runs < value.child_reserve.verifier_runs ||
		value.run.cost_cap_usd < value.child_reserve.cost_cap_usd
	) throw new Error("real execution budget cannot preserve the child-start reserve");
	if (
		value.attempt.provider_requests < value.child_reserve.provider_requests ||
		value.attempt.tool_calls < value.child_reserve.tool_calls ||
		value.attempt.agent_wall_time_ms < value.child_reserve.agent_wall_time_ms ||
		value.attempt.cost_cap_usd < value.child_reserve.cost_cap_usd ||
		(value.attempt.token_cap !== "not_applicable" &&
			value.child_reserve.token_cap !== "not_applicable" &&
			value.attempt.token_cap < value.child_reserve.token_cap)
	) throw new Error("per-Attempt budget cannot satisfy the frozen child allocation");
}

export function assertRealExecutionAuthorityV0C(input: {
	execution_authorized: boolean;
	credential_present: boolean;
}): void {
	if (!input.execution_authorized) throw new Error("real Provider execution is not authorized");
	if (!input.credential_present) throw new Error("required real Provider credential is unavailable");
}

export async function projectProviderRequestV0C(input: {
	profile: RealProviderProfileV0C;
	prompt: string;
	transport: ProviderTransportV0C;
	execution_authorized: boolean;
	credential_present: boolean;
}): Promise<{ text: string; usage: ProviderUsageProjectionV0C }> {
	assertRealExecutionAuthorityV0C(input);
	const result = await input.transport.request({ model_id: input.profile.model_id, prompt: input.prompt });
	if (!result.request_id || typeof result.text !== "string") throw new Error("Provider response identity is invalid");
	return {
		text: result.text,
		usage: {
			provider_id: input.profile.provider_id,
			model_id: input.profile.model_id,
			request_id: result.request_id,
			input_tokens: result.input_tokens ?? "unknown",
			output_tokens: result.output_tokens ?? "unknown",
			cost_usd: result.cost_usd ?? "unknown",
		},
	};
}
import type { PiRunHandleOptionsV0C, PiRunHandleV0C } from "./pi-adapter-v0c.ts";
