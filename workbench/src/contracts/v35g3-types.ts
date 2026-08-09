import type { SafeSessionViewV35, SourceAvailabilityV35 } from "./v35-types.ts";

export interface Goal3SessionSummaryV35 {
	session_id: string;
	title: string;
	created_at: string;
	updated_at: string;
	parent_session_id: string | null;
	run_ids: string[];
}

export interface Goal3SessionRunViewV35 {
	schema_version: 1;
	source_status: "available";
	sessions: Goal3SessionSummaryV35[];
	details: SafeSessionViewV35[];
}

export interface Goal25ArmSafeViewV35 {
	arm: "base" | "candidate";
	run_id: string;
	session_id: string;
	trajectory_outcome: string;
	task_outcome: string;
	verifier_status: string;
	verifier_id: string;
	request_attempts: number;
	provider_dispatches: number;
	input_tokens: number;
	output_tokens: number;
	tool_calls: number;
	cost_usd: number;
	manifest_digest: string;
	binding_digest: string;
	case_authority_digest: string;
	tool_interface_sha256: string;
	session_entries_sha256: string;
	source_ref: string;
}

export interface Goal25ComparisonSafeViewV35 {
	schema_version: 1;
	kind: "goal25_skill_comparison";
	source_status: SourceAvailabilityV35;
	derived_non_authoritative: boolean;
	pair_id: string | null;
	comparison_digest: string | null;
	payload_fairness_digest: string | null;
	result_statement: string;
	base: Goal25ArmSafeViewV35 | null;
	candidate: Goal25ArmSafeViewV35 | null;
	aggregates: {
		credential_reads: number | "not_recorded";
		network_calls: number | "not_recorded";
		external_provider_calls: number | "not_recorded";
		real_model_calls: number | "not_recorded";
		provider_dispatches: number | "not_recorded";
		input_tokens: number | "not_recorded";
		output_tokens: number | "not_recorded";
		cost_usd: number | "not_recorded";
	};
	source_refs: string[];
}

export interface V2RecoverySafeViewV35 {
	schema_version: 1;
	kind: "v2_recovery";
	source_status: SourceAvailabilityV35;
	outcome: string | null;
	selected_candidate_id: string | null;
	candidate_ids: string[];
	note: string;
	source_refs: string[];
}

export interface AdaptationStageSafeV35 {
	stage: "evidence" | "diagnosis" | "lesson" | "prompt_or_skill" | "validation" | "decision" | "active_state" | "selective_binding";
	status: SourceAvailabilityV35;
	label: string;
	digest: string | null;
	source_ref: string | null;
}

export interface AdaptationLineageSafeViewV35 {
	schema_version: 1;
	kind: "v3_adaptation_lineage";
	source_status: SourceAvailabilityV35;
	run_id: string | null;
	runtime_path: string | null;
	stages: AdaptationStageSafeV35[];
	prompt_diff: string | "not_recorded";
	skill_diff: string | "not_recorded";
	selective_binding_explanation: string;
}

export interface StateHistorySafeViewV35 {
	schema_version: 1;
	source_status: SourceAvailabilityV35;
	active: { binding_revision: number; state_version: number; state_digest: string; decision_id: string } | "unavailable";
	versions: Array<{ state_version: number; state_digest: string; parent_state_digest: string | null; entry_kinds: string[] }>;
	decisions: Array<{ decision_sequence: number; decision_id: string; kind: string; result: string; reason: string; prior_state_digest: string | null; next_state_digest: string; rollback_target_digest: string | null; decision_digest: string }>;
	rollback_mutation: "deferred";
}

export interface Goal3DemoProjectionV35 {
	schema_version: 1;
	projection_kind: "v35_goal3_sanitized_demo";
	derived_non_authoritative: true;
	accepted_goal25_comparison_digest: string;
	overview: {
		product: "Persistent & Inspectable Adaptive Harness Workbench";
		mode: "deterministic_faux_demo" | "real_product_smoke";
		notice: string;
	};
	v2_recovery: V2RecoverySafeViewV35;
	goal25_comparison: Goal25ComparisonSafeViewV35;
	adaptation: AdaptationLineageSafeViewV35;
	state_history: StateHistorySafeViewV35;
}
