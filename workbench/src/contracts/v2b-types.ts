import type { ArtifactRefV0B } from "./v0b-types.ts";
import type { ProviderReservationEvidenceV2, RuntimeBudgetStopObservationV2 } from "./v2-types.ts";

export const V2B_CONTROL_BASELINE_COMMIT = "b1c8cf6045a0118452734bdf3cbe7b65fcd645ac" as const;
export const V2B_CONTROL_BASELINE_TREE = "5c494f27fd01da4a70c8c162c0f6d588c9613b98" as const;
export const V2B_PINNED_PI_COMMIT = "027a5847901b5dde30270abaa1041046cd2b4b55" as const;
export const V2B_MODEL_PROFILE_ID = "deepseek_fixed_v1" as const;
export const V2B_SKILL_ID = "reliability-completion-v1" as const;
export const V2B_TOOL_PROFILE_ID = "bounded_tools_v1" as const;
export const V2B_POLICY_ID = "v2b_two_path_real_recovery" as const;
export const V2B_CREDENTIAL_PROFILE = "DEEPSEEK_API_KEY" as const;

export const V2B_ATTEMPT_CAPS = Object.freeze({
	provider_requests: 8,
	tool_calls: 12,
	tokens: 65_536,
	active_execution_time_ms: 300_000,
	verifier_runs: 1,
	real_cost_usd: 0.20,
} as const);

export const V2B_GROUP_CAPS = Object.freeze({
	attempts_exact_on_valid_failure: 3,
	candidate_paths_exact: 2,
	provider_requests: 24,
	tool_calls: 36,
	tokens: 196_608,
	active_execution_time_ms: 900_000,
	verifier_runs: 3,
	real_cost_usd: 0.60,
} as const);

export const V2B_SEQUENCE_CAPS = Object.freeze({
	started_attempts: 7,
	provider_requests: 56,
	tool_calls: 84,
	tokens: 458_752,
	active_execution_time_ms: 2_100_000,
	verifier_runs: 7,
	credential_reads: 3,
	real_cost_usd: 1.40,
} as const);

export type CaseIdV2B = "primary_positive" | "contingency_positive" | "negative";
export type ExpectedBehaviorV2B = "valid_initial_failure_then_two_candidates" | "valid_initial_pass_no_branch";
export type AttemptRoleV2B = "primary" | "continue_failed_session" | "fresh_session_from_failure_seed";
export type RuntimeTerminalReasonV2B = "settled" | "budget_stopped" | "usage_invalid" | "usage_overflow" | "runtime_invalid";

export interface QuiescenceEvidenceV2B {
	pre_dispatch_refusal: boolean;
	pending_provider_responses: 0;
	pending_tool_calls: 0;
	pending_side_effects: 0;
	prior_usage_known: boolean;
	session_persisted: boolean;
	workspace_persisted: boolean;
	evidence_closed: boolean;
}

export interface CaseDefinitionV2B {
	case_id: CaseIdV2B;
	task_id: "v1-parse-duration" | "v1-stable-format";
	repetition: 1 | 2;
	expected_behavior: ExpectedBehaviorV2B;
	activation: "always" | "only_after_primary_valid_initial_pass_or_zero_dispatch_stop";
	forbidden_after: "never" | "primary_valid_seed_or_post_dispatch_invalid";
}

export const V2B_FROZEN_CASES: readonly CaseDefinitionV2B[] = Object.freeze([
	Object.freeze({
		case_id: "primary_positive",
		task_id: "v1-parse-duration",
		repetition: 1,
		expected_behavior: "valid_initial_failure_then_two_candidates",
		activation: "always",
		forbidden_after: "never",
	}),
	Object.freeze({
		case_id: "contingency_positive",
		task_id: "v1-parse-duration",
		repetition: 2,
		expected_behavior: "valid_initial_failure_then_two_candidates",
		activation: "only_after_primary_valid_initial_pass_or_zero_dispatch_stop",
		forbidden_after: "primary_valid_seed_or_post_dispatch_invalid",
	}),
	Object.freeze({
		case_id: "negative",
		task_id: "v1-stable-format",
		repetition: 1,
		expected_behavior: "valid_initial_pass_no_branch",
		activation: "always",
		forbidden_after: "never",
	}),
]);

export interface RealCallCountersV2B {
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
}

export interface UsageV2B {
	provider_requests: number;
	tool_calls: number;
	input_tokens: number;
	output_tokens: number;
	cache_read_tokens: number;
	cache_write_tokens: number;
	conservative_charged_tokens: number;
	tokens: number;
	active_execution_time_ms: number;
	verifier_runs: number;
	real_cost_usd: number;
	conservative_charged_cost_usd: number;
}

export interface ProviderReservationV2B extends ProviderReservationEvidenceV2 {}

export interface CompositionShapeV2B {
	provider: "deepseek";
	model_id: "deepseek-v4-flash";
	api: "openai-completions";
	endpoint: "https://api.deepseek.com/chat/completions";
	thinking_level: "off";
	retry: false;
	fallback: false;
	session_id: string;
	session_path: string;
	session_cwd: string;
	parent_session_path: string | null;
	task_id: string;
	skill_id: typeof V2B_SKILL_ID;
	tool_profile_id: typeof V2B_TOOL_PROFILE_ID;
	system_prompt_sha256: string;
	prompt_sha256: string;
	provider_payload_sha256: string;
	context_message_count: number;
	tool_names: string[];
	common_input_sha256: string;
}

export interface AttemptRuntimeEvidenceV2B {
	schema_version: "v2b-attempt-runtime-evidence-v1";
	attempt_id: string;
	role: AttemptRoleV2B;
	terminal_reason: RuntimeTerminalReasonV2B;
	settled: boolean;
	agent_completion: "settled" | "pre_dispatch_budget_terminal" | "invalid";
	quiescence: QuiescenceEvidenceV2B | null;
	runtime_budget_stop_observation: RuntimeBudgetStopObservationV2 | null;
	composition: CompositionShapeV2B;
	usage: UsageV2B;
	reservations: ProviderReservationV2B[];
	counters_before: RealCallCountersV2B;
	counters_after: RealCallCountersV2B;
	no_retry_fallback: true;
}

export interface RunManifestV2B {
	schema_version: "v2b-run-manifest-v2";
	manifest_id: string;
	run_id: string;
	case: CaseDefinitionV2B;
	stage: "stage1_zero_real_access" | "stage2_deterministic_proof" | "stage2_real";
	control_baseline_commit: typeof V2B_CONTROL_BASELINE_COMMIT;
	control_baseline_tree: typeof V2B_CONTROL_BASELINE_TREE;
	pi_commit: typeof V2B_PINNED_PI_COMMIT;
	provider_profile_id: typeof V2B_MODEL_PROFILE_ID;
	credential_profile_name: typeof V2B_CREDENTIAL_PROFILE;
	skill_id: typeof V2B_SKILL_ID;
	tool_profile_id: typeof V2B_TOOL_PROFILE_ID;
	policy_id: typeof V2B_POLICY_ID;
	workbench_source_ref: ArtifactRefV0B;
	workbench_source_digest: string;
	execution_manifest_id: string | null;
	execution_baseline_commit: string | null;
	execution_baseline_tree: string | null;
	all_cases: readonly CaseDefinitionV2B[];
	budgets: {
		attempt: typeof V2B_ATTEMPT_CAPS;
		group: typeof V2B_GROUP_CAPS;
		sequence: typeof V2B_SEQUENCE_CAPS;
	};
	real_execution_authorized: boolean;
	deterministic_stub_required: boolean;
	retry: false;
	fallback: false;
	replacement: false;
}

export interface RunTerminalV2B {
	schema_version: "v2b-run-terminal-v2";
	manifest_id: string;
	run_id: string;
	case_id: CaseIdV2B;
	substrate_root: "substrate";
	substrate_terminal_ref: ArtifactRefV0B;
	outcome: "initial_pass" | "recovery_selected" | "recovery_none";
	selected_candidate_id: string | null;
	attempt_evidence_refs: ArtifactRefV0B[];
	usage: UsageV2B;
	real_call_counters: RealCallCountersV2B;
	terminal_reason: "stage1_stub_completed" | "stage2_stub_completed" | "stage2_real_completed";
}

export interface InspectResultV2B {
	schema_version: "v2b-stage1-inspection-v1";
	run_id: string | null;
	integrity_valid: boolean;
	terminal_valid: boolean;
	errors: string[];
	manifest: RunManifestV2B | null;
	terminal: RunTerminalV2B | null;
	attempts: AttemptRuntimeEvidenceV2B[];
}

export interface PlannedCaseV2B extends CaseDefinitionV2B {
	ordinal: 1 | 2 | 3;
	planned_run_id: string;
}

export interface ExecutionManifestV2B {
	schema_version: "v2b-execution-manifest-v1";
	manifest_id: string;
	sequence_id: string;
	stage: "stage2_deterministic_proof" | "stage2_real";
	execution_baseline_commit: string;
	execution_baseline_tree: string;
	pi_commit: typeof V2B_PINNED_PI_COMMIT;
	provider_profile_id: typeof V2B_MODEL_PROFILE_ID;
	credential_profile_name: typeof V2B_CREDENTIAL_PROFILE;
	skill_id: typeof V2B_SKILL_ID;
	tool_profile_id: typeof V2B_TOOL_PROFILE_ID;
	policy_id: typeof V2B_POLICY_ID;
	workbench_source_digest: string;
	workbench_source_inventory: unknown[];
	planned_cases: readonly PlannedCaseV2B[];
	budgets: {
		attempt: typeof V2B_ATTEMPT_CAPS;
		group: typeof V2B_GROUP_CAPS;
		sequence: typeof V2B_SEQUENCE_CAPS;
	};
	real_execution_authorized: boolean;
	retry: false;
	fallback: false;
	replacement: false;
}

export type SequenceCaseStateV2B = "planned" | "started" | "terminal" | "paused" | "skipped";

export interface CasePauseV2B {
	schema_version: "v2b-case-pause-v1";
	manifest_id: string;
	sequence_id: string;
	execution_baseline_commit: string;
	execution_baseline_tree: string;
	workbench_source_digest: string;
	case_id: CaseIdV2B;
	run_id: string;
	phase: "pre_dispatch" | "post_dispatch_or_invalid";
	reason: "execution_boundary";
	evidence_valid: true;
	contingency_eligible: boolean;
	provider_requests: number;
	attempts: Array<{ attempt_id: string; role: AttemptRoleV2B }>;
	actual_usage: UsageV2B;
	real_call_counters: RealCallCountersV2B;
}

export interface SequenceLedgerEntryV2B {
	schema_version: "v2b-sequence-ledger-v1";
	seq: number;
	manifest_id: string;
	sequence_id: string;
	case_id: CaseIdV2B;
	planned_run_id: string;
	state: SequenceCaseStateV2B;
	timestamp: string;
	reason: string | null;
	run_terminal_ref: ArtifactRefV0B | null;
	case_pause_ref: ArtifactRefV0B | null;
	attempt_id: string | null;
	attempt_role: AttemptRoleV2B | null;
	reserved_usage: UsageV2B;
	actual_usage: UsageV2B;
	real_call_counters: RealCallCountersV2B;
}

export interface SequenceTerminalV2B {
	schema_version: "v2b-sequence-terminal-v1";
	manifest_id: string;
	sequence_id: string;
	status: "completed" | "paused";
	reason: "sequence_completed" | "positive_not_triggered" | "negative_not_valid" | "run_invalid" | "budget_exhausted";
	case_terminal_refs: ArtifactRefV0B[];
	case_pause_refs: ArtifactRefV0B[];
	ledger_ref: ArtifactRefV0B;
	started_attempts: number;
	reserved_usage: UsageV2B;
	actual_usage: UsageV2B;
	real_call_counters: RealCallCountersV2B;
}

export interface SequenceInspectResultV2B {
	schema_version: "v2b-sequence-inspection-v1";
	sequence_id: string | null;
	integrity_valid: boolean;
	terminal_valid: boolean;
	errors: string[];
	manifest: ExecutionManifestV2B | null;
	ledger: SequenceLedgerEntryV2B[];
	terminal: SequenceTerminalV2B | null;
}

export interface Stage2PreflightV2B {
	schema_version: "v2b-stage2-preflight-v1";
	manifest_id: string;
	sequence_id: string;
	valid: true;
	execution_baseline_commit: string;
	execution_baseline_tree: string;
	workbench_source_digest: string;
	pi_commit: typeof V2B_PINNED_PI_COMMIT;
	real_call_counters: RealCallCountersV2B;
}
