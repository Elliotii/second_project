import type { ArtifactRefV0B } from "./v0b-types.ts";

export type Goal2ArmV35 = "base" | "candidate";
export type Goal2ResultLabelV35 = "positive_skill_effect" | "negative_skill_effect" | "both_passed" | "both_failed" | "invalid_pair";
export type Goal2EfficiencyLabelV35 = "base_efficiency_dominant" | "candidate_efficiency_dominant" | "mixed_or_no_material_difference" | "not_applicable";

export interface Goal2StateSelectionAuthorityV35 {
	schema_version: 1;
	project_id: string;
	source_project_id: string;
	source_state_root: string;
	source_state_root_sha256: string;
	source_authority_tree_digest: string;
	selected_state_version: 2;
	selected_state_digest: string;
	selected_decision_id: string;
	selected_decision_digest: string;
	skill_name: string;
	skill_entry_id: string;
	skill_source_sha256: string;
	skill_wrapper_sha256: string;
	authority_digest: string;
}

export interface Goal2SessionRecordV35 {
	schema_version: 1;
	project_id: string;
	arm: Goal2ArmV35;
	session_id: string;
	session_ref: string;
	workspace_id: string;
	run_id: string;
	run_ref: string;
	created_at: string;
	session_entry_count_after_run: number;
	session_entries_sha256_after_run: string;
	record_digest: string;
}

export interface Goal2FirstProviderPayloadEvidenceV35 {
	schema_version: 1;
	project_id: string;
	case_id: string;
	arm: Goal2ArmV35;
	run_id: string;
	capture_ordinal: 1;
	message_count: number;
	last_user_message_index: number;
	treatment_kind: "task_prompt" | "skill_wrapper_plus_task_prompt";
	task_prompt_sha256: string;
	skill_wrapper_sha256: string | null;
	expected_last_user_text_sha256: string;
	actual_last_user_text_sha256: string;
	treatment_marker_sha256: string;
	payload_sha256: string;
	normalized_payload_sha256: string;
	normalized_messages_sha256: string;
	system_messages_sha256: string;
	tools_sha256: string;
	model_sha256: string;
	request_fields_sha256: string;
	payload_top_level_keys_sha256: string;
	evidence_digest: string;
}

export interface Goal2ArmManifestV35 {
	schema_version: 1;
	project_id: string;
	case_id: string;
	arm: Goal2ArmV35;
	run_id: string;
	session_id: string;
	workspace_id: string;
	initial_workspace_digest: string;
	final_workspace_digest: string;
	protected_before_digest: string;
	protected_after_digest: string;
	task_prompt_sha256: string;
	state_selection_digest: string;
	binding_digest: string;
	case_authority_digest: string;
	effective_tool_surface_digest: string;
	v3_manifest_ref: ArtifactRefV0B;
	binding_ref: ArtifactRefV0B;
	final_subject_ref: ArtifactRefV0B;
	runtime_ref: ArtifactRefV0B;
	verifier_ref: ArtifactRefV0B;
	session_record_ref: ArtifactRefV0B;
	first_provider_payload_ref: ArtifactRefV0B;
	verifier_status: "passed" | "failed";
	external_verifier_runs: 1;
	provider_requests: number;
	tool_calls: number;
	tokens: number;
	cost_usd: number;
	elapsed_ms: number;
	semantic_diff_lines: number;
	manifest_digest: string;
}

export interface Goal2ComparisonV35 {
	schema_version: 1;
	comparison_id: string;
	project_id: string;
	case_id: string;
	arm_order: ["base", "candidate"];
	base_run_id: string;
	candidate_run_id: string;
	base_manifest_ref: ArtifactRefV0B;
	candidate_manifest_ref: ArtifactRefV0B;
	state_selection_digest: string;
	case_authority_digest: string;
	normalized_first_provider_payload_sha256: string;
	payload_fairness_digest: string;
	fairness_valid: boolean;
	result: Goal2ResultLabelV35;
	efficiency: Goal2EfficiencyLabelV35;
	comparison_digest: string;
}

export interface Goal2ComparisonReadViewV35 {
	schema_version: 1;
	kind: "goal2_skill";
	source_status: "available" | "unavailable";
	comparison_id: string | null;
	result: Goal2ResultLabelV35 | null;
	efficiency: Goal2EfficiencyLabelV35 | null;
	base: { run_id: string; session_id: string; verifier_status: "passed" | "failed"; provider_requests: number; tool_calls: number; tokens: number; cost_usd: number } | null;
	candidate: { run_id: string; session_id: string; verifier_status: "passed" | "failed"; provider_requests: number; tool_calls: number; tokens: number; cost_usd: number } | null;
	skill: { name: string; state_digest: string; source_sha256: string; wrapper_sha256: string } | null;
	source_refs: string[];
}
