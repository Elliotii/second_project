import type { BoundedTaskPolicy } from "../types.ts";

export interface PostV35SmokeBudget {
	provider_requests_total_max: 16;
	tool_calls_total_max: 24;
	combined_tokens_total_max: 131072;
	cost_usd_total_max: 0.2;
	wall_time_total_ms_max: 1800000;
}

export interface PostV35SmokeTurnAuthority {
	ordinal: 1 | 2;
	prompt_sha256: string;
	verifier_id: string;
	verifier_source_path: string;
	verifier_sha256: string;
	verifier_timeout_ms: number;
	verifier_output_limit_bytes: number;
}

export interface PostV35RealSmokeAuthority {
	schema_version: 1;
	mode: "real_product_smoke";
	project_id: string;
	workspace_id: string;
	initial_workspace_sha256: string;
	system_prompt: string;
	task_policy: BoundedTaskPolicy;
	provider_profile: "deepseek-v4-flash";
	binding_status: "not_applicable";
	budget: PostV35SmokeBudget;
	turns: [PostV35SmokeTurnAuthority, PostV35SmokeTurnAuthority];
	authority_digest: string;
}

export interface PostV35RealSmokeOutcome {
	schema_version: 1;
	run_id: string;
	session_id: string;
	verifier_id: string;
	verifier_status: "passed" | "failed";
	outcome: "passed" | "failed";
	binding_status: "not_applicable";
	context_reconstructed: true;
}
