import type { ArtifactRefV0B, VerifierResultV0B } from "./v0b-types.ts";

export const V2A_STRATEGY_ORDER = ["continue_failed_session", "fresh_session_from_failure_seed"] as const;
export type RecoveryStrategyV2A = (typeof V2A_STRATEGY_ORDER)[number];
export type CandidateModeV2A = "pass" | "fail" | "budget_stop" | "invalid";

export interface BudgetUsageV2A {
	faux_provider_dispatches: number;
	tool_calls: number;
	verifier_runs: number;
	tokens: number;
	active_execution_time_ms: number;
	real_cost_usd: 0;
}

export interface BudgetCapsV2A {
	faux_provider_dispatches_max: 8;
	tool_calls_max: 16;
	verifier_runs_max: 1;
}

export interface RecoverySeedV2A {
	schema_version: "v2a-recovery-seed-v1";
	recovery_seed_id: string;
	recovery_group_id: string;
	parent_run_id: string;
	parent_attempt_id: string;
	task_id: string;
	task_instruction_ref: ArtifactRefV0B;
	task_instruction_sha256: string;
	failure_packet_ref: ArtifactRefV0B;
	failure_packet_sha256: string;
	failed_workspace_snapshot_ref: ArtifactRefV0B;
	failed_workspace_snapshot_digest: string;
	parent_session_ref: ArtifactRefV0B;
	parent_session_digest: string;
	verifier_result_ref: ArtifactRefV0B;
	verifier_result_sha256: string;
	tool_profile_digest: string;
	prompt_digest: string;
	skill_digest: string;
	pi_commit: "027a5847901b5dde30270abaa1041046cd2b4b55";
	workbench_digest: string;
	created_before_candidate_attempts: true;
}

export interface CandidateHardGatesV2A {
	identity_complete: boolean;
	seed_and_isolation_valid: boolean;
	session_lineage_valid: boolean;
	unique_terminal_settled: boolean;
	budget_valid: boolean;
	verifier_passed: boolean;
	protected_secret_path_valid: boolean;
	lineage_complete: boolean;
}

export interface CandidatePathV2A {
	schema_version: "v2a-candidate-path-v1";
	candidate_path_id: string;
	recovery_group_id: string;
	recovery_seed_id: string;
	strategy_id: RecoveryStrategyV2A;
	parent_attempt_id: string;
	session_ref: ArtifactRefV0B;
	session_snapshot_before_run_ref: ArtifactRefV0B;
	session_digest_before_run: string;
	parent_history_entry_count: number;
	workspace_ref: ArtifactRefV0B;
	initial_workspace_digest: string;
	attempt_id: string;
	settled: boolean;
	final_workspace_ref: ArtifactRefV0B;
	final_workspace_digest: string;
	verifier_result_ref: ArtifactRefV0B;
	verifier_status: VerifierResultV0B["status"];
	evidence_valid: boolean;
	budget_usage: BudgetUsageV2A;
	budget_caps: BudgetCapsV2A;
	budget_within_limits: boolean;
	terminal_reason: "settled" | "budget_stopped" | "runtime_invalid";
	allowed_semantic_diff_size: number;
	immediate_recovery_prompt_sha256: string;
	common_artifact_digest: string;
	hard_gates: CandidateHardGatesV2A;
}

export interface CandidateOrderingV2A {
	candidate_path_id: string;
	allowed_semantic_diff_size: number;
	tokens: number;
	tool_calls: number;
	active_execution_time_ms: number;
	strategy_order: number;
}

export interface SelectionDecisionV2A {
	schema_version: "v2a-selection-decision-v1";
	recovery_group_id: string;
	evaluated_candidate_ids: string[];
	eligible_candidate_ids: string[];
	rejected_candidate_ids: string[];
	selected_candidate_id: string | null;
	hard_gate_results: Record<string, CandidateHardGatesV2A>;
	secondary_ordering: CandidateOrderingV2A[];
	comparison_reason: string[];
	terminal_reason: "selected" | "no_passing_candidate" | "all_invalid" | "tie_resolved";
}

export interface RunManifestV2A {
	schema_version: "v2a-run-manifest-v1";
	manifest_id: string;
	run_id: string;
	task_id: string;
	policy_id: "v2a_two_path_bounded_recovery";
	model_id: "v2a-faux/faux-1";
	tool_profile_id: "bounded_tools_v1";
	skill_id: "reliability-completion-v1";
	pi_commit: "027a5847901b5dde30270abaa1041046cd2b4b55";
	workbench_revision: "228973b7e7b826468c54b84f28faf8d9c0c33a6d+v2a-source-delta";
	real_execution_authorized: false;
	recovery_candidate_count_on_valid_failure: 2;
	per_attempt_budget: BudgetCapsV2A;
	per_group_budget: {
		candidate_paths_exact_on_valid_failure: 2;
		faux_provider_dispatches_max: 24;
		tool_calls_max: 48;
		verifier_runs_max: 3;
		real_cost_usd: 0;
	};
}

export interface ExecuteRunOptionsV2A {
	projectRoot: string;
	runRoot: string;
	runId: string;
	primaryMode: "pass" | "fail";
	candidateModes?: readonly [CandidateModeV2A, CandidateModeV2A];
}

export interface RunTerminalV2A {
	schema_version: "v2a-run-terminal-v1";
	manifest_id: string;
	run_id: string;
	primary_attempt_id: string;
	primary_verifier_status: VerifierResultV0B["status"];
	outcome: "initial_pass" | "recovery_selected" | "recovery_none";
	recovery_group_id: string | null;
	recovery_seed_ref: ArtifactRefV0B | null;
	candidate_refs: ArtifactRefV0B[];
	selection_ref: ArtifactRefV0B | null;
	selected_candidate_id: string | null;
	real_call_counters: {
		credential_reads: 0;
		network_calls: 0;
		external_provider_calls: 0;
		real_model_calls: 0;
	};
}

export interface InspectResultV2A {
	schema_version: "v2a-inspection-v1";
	run_id: string | null;
	integrity_valid: boolean;
	terminal_valid: boolean;
	errors: string[];
	terminal: RunTerminalV2A | null;
	recovery_seed: RecoverySeedV2A | null;
	candidates: CandidatePathV2A[];
	selection: SelectionDecisionV2A | null;
}
