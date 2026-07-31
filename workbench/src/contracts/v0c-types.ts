import type {
	ArtifactRefV0B,
	BudgetSnapshotV0B,
	EvidenceIndexItemV0B,
	FailureClassV0B,
	JsonValue,
	OutcomeStatusV0B,
	SecretScanResultV0B,
	SessionRefV0B,
	VerifierResultV0B,
	WorkspaceRefV0B,
} from "./v0b-types.ts";
import type { CommandDescriptor } from "../types.ts";

export type AttemptOrdinalV0C = 1 | 2;
export type CompletionPolicyV0C = "observe_only" | "verify_recover_once_same_session";
export type RecoveryModeV0C = "none" | "same_session";
export type ModelProfileV0C = "public_emitted_faux" | "deepseek_v4_flash_real";

export interface AgentFeedbackSchemaV0C {
	type: "verifier_failure";
	fields: ["parent_attempt_id", "verifier_id", "failure_summary", "failed_checks", "instruction"];
	max_projection_bytes: 8192;
	max_summary_characters: 2000;
	max_failed_checks: 32;
	max_failed_check_characters: 256;
}

export interface TaskSpecV0C {
	schema_version: 1;
	task_id: string;
	instruction_ref: string;
	instruction_sha256: string;
	workspace_source_ref: string;
	workspace_source_digest: string;
	writable_paths: string[];
	protected_paths: string[];
	verifier_id: string;
	verifier_ref: string;
	verifier_sha256: string;
	acceptance_visibility: "hidden_external" | "public_external";
	agent_feedback_schema: AgentFeedbackSchemaV0C | null;
	tool_profile_id: "v0_bounded_local_v1";
	command_descriptors: CommandDescriptor[];
	verifier_command: {
		executable: "current_node_executable";
		argv: string[];
		cwd: "project";
		timeout_ms: number;
		output_limit_bytes: number;
	};
}

export interface StrategySpecV0C {
	schema_version: 1;
	strategy_id: string;
	base_prompt_id: string;
	base_prompt_sha256: string;
	skill_refs: [];
	completion_policy_id: CompletionPolicyV0C;
	recovery_mode: RecoveryModeV0C;
	recovery_budget: 0 | 1;
	tool_profile_id: "v0_bounded_local_v1";
	model_profile_id: ModelProfileV0C;
}

export interface AttemptBudgetV0C extends BudgetSnapshotV0B {
	agent_wall_time_limit_ms: number;
	verifier_runs_limit: number;
	verifier_runs_usage: number;
}

export interface RunBudgetV0C {
	provider_request_limit: number;
	provider_request_usage: number;
	tool_call_limit: number;
	tool_call_usage: number;
	wall_time_limit_ms: number;
	wall_time_usage_ms: number;
	finalization_wall_time_reserve_ms: number;
	verifier_limit: number;
	verifier_usage: number;
	token_limit: number | "not_applicable";
	token_usage: number | "unknown";
	cost_limit_usd: number;
	cost_usage_usd: number;
	external_provider_calls: number;
}

export interface RunRecordV0C {
	schema_version: 1;
	run_id: string;
	task_id: string;
	strategy_id: string;
	comparison_group_id: null;
	created_at: string;
	status: "running" | "terminal";
	config_digest: string;
	source_identity: {
		control_baseline_commit: string;
		v0b_implementation_baseline: string;
		pi_commit: string;
		workbench_tree_digest: string;
		task_sha256: string;
		strategy_sha256: string;
		verifier_sha256: string;
	};
	provider_identity: {
		kind: ModelProfileV0C;
		external: boolean;
		credentials_used: boolean;
	};
	budget: RunBudgetV0C;
	recovery_slots: { limit: 0 | 1; consumed: 0 | 1 };
	attempt_ids: string[];
}

export interface AttemptRecordV0C {
	schema_version: 1;
	attempt_id: string;
	run_id: string;
	ordinal: AttemptOrdinalV0C;
	strategy_id: string;
	parent_attempt_id: string | null;
	trigger: "initial" | "verifier_failure";
	session_id: string;
	workspace_id: string;
	failure_packet_id: string | null;
	started_at: string;
	settled_at: string | null;
	terminal_reason: string | null;
	budget_allocation: AttemptBudgetV0C;
	budget_usage: AttemptBudgetV0C;
}

export interface FailurePacketAgentProjectionV0C {
	type: "verifier_failure";
	parent_attempt_id: string;
	verifier_id: string;
	failure_summary: string;
	failed_checks: string[];
	instruction: "repair_the_task_then_finish";
}

export interface FailurePacketV0C {
	schema_version: 1;
	failure_packet_id: string;
	run_id: string;
	parent_attempt_id: string;
	verifier_id: string;
	verifier_sha256: string;
	verifier_result_ref: ArtifactRefV0B;
	verifier_result_sha256: string;
	failure_summary: string;
	failed_checks: string[];
	workspace_digest: string;
	budget_remaining: {
		provider_requests: number;
		tool_calls: number;
		agent_wall_time_ms: number;
		verifier_runs: number;
		verifier_wall_time_ms: number;
		finalization_wall_time_ms: number;
	};
	agent_projection_ref: ArtifactRefV0B;
	agent_projection_sha256: string;
	created_at: string;
}

export type CompletionDecisionKindV0C =
	| "stop_passed"
	| "stop_failed"
	| "stop_invalid"
	| "stop_cancelled"
	| "recover_once";

export type CompletionDecisionReasonV0C =
	| "verifier_passed"
	| "verifier_failed_policy_stop"
	| "verifier_failed_hidden_acceptance"
	| "verifier_failed_recover_once"
	| "evidence_invalid"
	| "verifier_invalid"
	| "infrastructure_blocked"
	| "user_cancelled"
	| "budget_exhausted"
	| "child_start_reserve_insufficient"
	| "recovery_slot_unavailable"
	| "failure_packet_invalid";

export interface CompletionDecisionV0C {
	schema_version: 1;
	decision_id: string;
	run_id: string;
	after_attempt_id: string;
	decision: CompletionDecisionKindV0C;
	reason: CompletionDecisionReasonV0C;
	evidence_valid: boolean;
	verifier_status: VerifierResultV0B["status"] | null;
	recovery_slot_before: 0 | 1;
	recovery_slot_after: 0 | 1;
	budget_snapshot: RunBudgetV0C;
	failure_packet_id: string | null;
	created_at: string;
}

export const JOURNAL_EVENT_TYPES_V0C = [
	"run_started",
	"run_terminal",
	"attempt_started",
	"attempt_settled",
	"attempt_aborted",
	"attempt_error",
	"workspace_materialized",
	"workspace_finalized",
	"workspace_attempt_snapshot",
	"session_linked",
	"session_entry_persisted",
	"provider_request_started",
	"provider_response_observed",
	"tool_call_started",
	"tool_call_completed",
	"tool_call_error",
	"tool_call_aborted",
	"verifier_started",
	"verifier_completed",
	"attempt_evidence_validated",
	"policy_decided",
	"recovery_slot_reserved",
	"failure_packet_created",
	"run_evidence_validation_completed",
	"outcome_created",
] as const;

export type JournalEventTypeV0C = (typeof JOURNAL_EVENT_TYPES_V0C)[number];

export interface JournalEntryV0C {
	schema_version: 1;
	seq: number;
	timestamp: string;
	type: JournalEventTypeV0C;
	run_id: string;
	attempt_id: string | null;
	session_id: string;
	workspace_id: string;
	data: Record<string, JsonValue>;
}

export interface AttemptEvidenceValidationV0C {
	schema_version: 1;
	run_id: string;
	attempt_id: string;
	valid: boolean;
	errors: string[];
	checked_artifact_count: number;
	tool_call_count: number;
	tool_result_count: number;
}

export interface RunEvidenceValidationV0C {
	schema_version: 1;
	run_id: string;
	valid: boolean;
	errors: string[];
	attempt_count: 1 | 2;
	attempt_validation_count: number;
	verifier_count: number;
	recovery_slots_consumed: 0 | 1;
	attempt_ids: string[];
	attempt_validation_ids: string[];
	verifier_attempt_ids: string[];
	cumulative_budget: {
		provider_requests: number;
		tool_calls: number;
		verifier_runs: number;
		external_provider_calls: number;
		cost_usd: number;
	};
	expected_evidence_paths: string[];
	terminal_suffix: ["outcome_created", "run_terminal"];
	terminal_plan_digest: string;
}

export interface OutcomeV0C {
	schema_version: 1;
	run_id: string;
	final_attempt_id: string;
	status: OutcomeStatusV0B;
	failure_class: FailureClassV0B;
	terminal_reason: string;
	initial_verifier_status: VerifierResultV0B["status"] | null;
	final_verifier_status: VerifierResultV0B["status"] | null;
	recovery_triggered: boolean;
	attempt_count: 1 | 2;
	recovery_slots_consumed: 0 | 1;
	evidence_index_ref: "evidence-index.json";
}

export interface EvidenceIndexV0C {
	schema_version: 1;
	run_id: string;
	items: EvidenceIndexItemV0B[];
}

export interface TerminalRecordV0C {
	schema_version: 1;
	run_id: string;
	outcome_sha256: string;
	evidence_index_sha256: string;
	preterminal_scan: {
		completed: true;
		scope_labels: string[];
		match_count: 0;
		result_ref: ArtifactRefV0B;
	};
	committed_at: string;
}

export type WorkspaceRefV0C = WorkspaceRefV0B;
export type SessionRefV0C = SessionRefV0B;
export type SecretScanResultV0C = SecretScanResultV0B;
