import type { ArtifactRefV0B } from "./v0b-types.ts";
import type { ApplicabilityV3, ImprovementOpportunityV3, RefinementCandidateV3 } from "./v3-types.ts";

export interface ContentSpecV37<T = unknown> {
	spec_id: string;
	body: T;
	spec_digest: string;
}

export interface StateStoreScopeSpecV37 {
	configured_location: string;
	project_id: string;
	runtime_base_prompt_digest: string;
	initial_state_digest: string;
	state_store_scope_digest: string;
}

export interface RegisteredPromptAddendumTemplateV37 {
	template_id: string;
	content: string;
	content_sha256: string;
}

export interface CandidatePolicyBodyV37 {
	candidate_type: "prompt_addendum";
	max_prompt_bytes: number;
	leakage_indicators: string[];
	generic_prompt_addendum_templates: RegisteredPromptAddendumTemplateV37[];
}

export interface RegisteredCaseManifestBodyV37 {
	schema_version: 1;
	kind: "v37_registered_case_manifest_body";
	case_id: string;
	manifest_version: number;
	project_id: string;
	source_baseline_spec: ContentSpecV37;
	primary_task_spec: ContentSpecV37;
	primary_verifier_spec: ContentSpecV37;
	problem_trigger_spec: ContentSpecV37;
	recovery_a_strategy_spec: ContentSpecV37;
	recovery_b_strategy_spec: ContentSpecV37;
	comparison_profile_spec: ContentSpecV37;
	candidate_policy_spec: ContentSpecV37<CandidatePolicyBodyV37>;
	regression_pack_spec: ContentSpecV37;
	state_applicability: ApplicabilityV3;
	state_store_scope_spec: StateStoreScopeSpecV37;
	follow_up_task_spec: ContentSpecV37;
	follow_up_source_baseline_spec: ContentSpecV37;
	follow_up_verifier_spec: ContentSpecV37;
	provider_profile_spec: ContentSpecV37;
	tool_profile_spec: ContentSpecV37;
	command_profile_spec: ContentSpecV37;
	budget_profile_spec: ContentSpecV37;
	stop_condition_profile_spec: ContentSpecV37;
	runtime_base_prompt_spec: ContentSpecV37<{ prompt: string }>;
	manifest_body_digest: string;
}

export interface CaseRegistrationEnvelopeV37 {
	schema_version: 1;
	kind: "v37_case_registration_envelope";
	case_id: string;
	manifest_version: number;
	approved_manifest_body_digest: string;
	registration_revision: number;
	previous_registration_digest: string | null;
	registration_status: "accepted" | "disabled";
	approval_record_id: string;
	approval_policy_id: "v37-main-reviewed-case-registration-v1";
	approved_at: string;
	disabled_at: string | null;
	registration_digest: string;
}

export interface HostRegistryEntryV37 {
	case_id: string;
	manifest_version: number;
	manifest_location: string;
	manifest_body_digest: string;
	envelope_locations: string[];
	envelope_digests: string[];
	current_registration_digest: string;
}

export interface HostRegistryIndexV37 {
	schema_version: 1;
	kind: "v37_host_registry_index";
	configuration_baseline_id: "v37-g1-host-registry-v1";
	loader_contract_id: "v37-host-registry-loader-v1";
	digest_algorithm: "sha256_over_canonical_utf8_json_v1";
	entries: HostRegistryEntryV37[];
	registry_index_digest: string;
}

export interface LoadedRegisteredCaseV37 {
	manifest: RegisteredCaseManifestBodyV37;
	envelopes: CaseRegistrationEnvelopeV37[];
	current_envelope: CaseRegistrationEnvelopeV37;
	registry: HostRegistryIndexV37;
	loader_contract_fingerprint: string;
	registry_trust_root_digest: string;
	historical_read_only: boolean;
}

export interface WorkflowRegistrationV37 {
	schema_version: 1;
	kind: "v37_workflow_registration";
	workflow_id: string;
	case_id: string;
	manifest_version: number;
	project_id: string;
	created_at: string;
	manifest_body_digest: string;
	registration_digest: string;
	registry_trust_root_digest: string;
	source_baseline_digest: string;
	state_store_scope_digest: string;
	provider_profile_digest: string;
	tool_profile_digest: string;
	command_profile_digest: string;
	budget_profile_digest: string;
	stop_condition_profile_digest: string;
	runtime_base_prompt_digest: string;
	workflow_registration_digest: string;
}

export interface TaskInstanceV37 {
	schema_version: 1;
	kind: "v37_task_instance";
	workflow_id: string;
	workflow_registration_digest: string;
	role: "primary" | "follow_up";
	task_spec_digest: string;
	task_instance_digest: string;
}

export interface PrimaryRunBindingV37 {
	schema_version: 1;
	kind: "v37_primary_run_binding";
	binding_authority_id: string;
	binding_authority_location: string;
	workflow_id: string;
	workflow_registration_digest: string;
	primary_task_instance_digest: string;
	primary_run_id: string;
	primary_run_root_location: string;
	bound_at: string;
	primary_run_binding_digest: string;
}

export interface RecoveryComparisonArmV37 {
	candidate_path_id: string;
	strategy_id: string;
	strategy_digest: string;
	workspace_digest: string;
	terminal_artifact_digest: string;
	verifier_artifact_digest: string;
}

export interface RegisteredRecoveryComparisonV37 {
	schema_version: 1;
	kind: "v37_registered_recovery_comparison";
	comparison_decision_id: string;
	workflow_id: string;
	workflow_registration_digest: string;
	primary_run_id: string;
	recovery_group_id: string;
	recovery_seed_id: string;
	arms: [RecoveryComparisonArmV37, RecoveryComparisonArmV37];
	comparison_profile_digest: string;
	selector_implementation_version: "v2a-selector-derived-v1";
	decision_result: "selected" | "no_valid_recovery" | "invalid";
	selected_candidate_path_id: string | null;
	decision_reason: string[];
	comparison_decision_digest: string;
}

export interface RegisteredRecoveryEvidenceBodyV37 {
	schema_version: 1;
	family: "v37_registered_recovery_learning_episode";
	case_id: string;
	manifest_body_digest: string;
	case_registration_digest: string;
	workflow_id: string;
	workflow_registration_digest: string;
	primary_task_instance_digest: string;
	primary_run_id: string;
	primary_source_workspace_digest: string;
	primary_terminal_artifact_digest: string;
	primary_verifier_artifact_digest: string;
	primary_problem_class: string;
	recovery_group_id: string;
	recovery_seed_id: string;
	common_verifier_digest: string;
	arms: [RecoveryComparisonArmV37, RecoveryComparisonArmV37];
	comparison_decision_id: string;
	comparison_decision_digest: string;
	provider_profile_digest: string;
	tool_profile_digest: string;
	command_profile_digest: string;
	budget_profile_digest: string;
	stop_condition_profile_digest: string;
	source_artifact_refs: ArtifactRefV0B[];
	evidence_body_digest: string;
}

export interface EvidenceConfirmationReceiptV37 {
	schema_version: 1;
	kind: "v37_recovery_evidence_confirmation_receipt";
	workflow_id: string;
	workflow_registration_digest: string;
	evidence_body_digest: string;
	action_id: "confirm_registered_recovery_evidence";
	confirmed_at: string;
	confirmation_receipt_id: string;
	confirmation_receipt_digest: string;
}

export interface RecoveryEvidenceSubmissionRequestV37 {
	schema_version: 1;
	kind: "v37_recovery_evidence_submission_request";
	workflow_id: string;
	workflow_registration_digest: string;
	evidence_body_digest: string;
	confirmation_receipt_id: string;
	confirmation_receipt_digest: string;
	requested_at: string;
	submission_request_digest: string;
}

export interface RegisteredRecoveryAdmissionV37 {
	schema_version: 1;
	kind: "v37_registered_recovery_admission";
	admission_id: string;
	workflow_id: string;
	workflow_registration_digest: string;
	manifest_body_digest: string;
	case_registration_digest: string;
	registry_trust_root_digest: string;
	evidence_body_digest: string;
	submission_request_digest: string;
	comparison_decision_digest: string;
	inspector_id: "inspect-v37g1-registered-recovery-v1";
	inspector_fingerprint: string;
	result: "admitted" | "rejected";
	reasons: string[];
	source_inventory_digest: string;
	opportunity: ImprovementOpportunityV3 | null;
	admission_digest: string;
}

export interface RegisteredRecoveryInspectionV37 {
	integrity_valid: boolean;
	errors: string[];
	admission: RegisteredRecoveryAdmissionV37 | null;
}

export interface CandidateResultV37 {
	candidate: RefinementCandidateV3;
	workflow_id: string;
	state_store_scope_digest: string;
	active_state_digest: string;
}

export interface FollowUpProviderProfileV37 {
	profile_id: "v37-g2-deterministic-faux-v1";
	provider_kind: "public_emitted_faux";
	model_id: "v37-g2-faux/faux-1";
	external: false;
	credential_reads: 0;
	network_calls: 0;
	real_model_calls: 0;
}

export interface FollowUpToolProfileV37 {
	profile_id: "v37-g2-bounded-follow-up-v1";
	allowed_tool_names: ["workspace_read", "workspace_list", "workspace_search", "workspace_edit", "workspace_write", "run_command"];
	writable_paths: ["src/policy.mjs"];
	protected_paths: ["verifier/follow-up.test.mjs"];
	allow_repository_commands: false;
}

export interface FollowUpCommandProfileV37 {
	profile_id: "v37-g2-follow-up-command-v1";
	commands_hard_max: 1;
	descriptors: [{
		command_id: "follow_up_test";
		executable: "current_node_executable";
		argv: ["--test", "verifier/follow-up.test.mjs"];
		cwd: "workspace";
		timeout_seconds: 15;
		max_combined_output_bytes: 65536;
	}];
}

export interface FollowUpBudgetProfileV37 {
	profile_id: "v37-g2-deterministic-budget-v1";
	v36_runtime_budget_profile_id: "v36g2_frozen_acceptance_v1";
	provider_requests_observation_threshold: 16;
	provider_requests_hard_max: 16;
	tool_calls_hard_max: 24;
	combined_tokens_hard_max: 131072;
	cost_usd_hard_max: 0.2;
	commands_hard_max: 1;
	verifier_runs_hard_max: 1;
	verifier_timeout_ms_hard_max: 15000;
	verifier_output_bytes_hard_max: 65536;
	wall_time_ms_hard_max: 900000;
}

export interface FollowUpStopConditionProfileV37 {
	profile_id: "v37-g2-no-retry-stop-v1";
	retry: 0;
	same_run_retry: 0;
	fallback: 0;
	replacement: 0;
	automatic_replacement: 0;
	task_swap: 0;
	result_hunting: 0;
	terminal_requires_complete_inspection: true;
}

export interface RegisteredFollowUpExecutionProfileV37 {
	schema_version: 1;
	kind: "v37_registered_follow_up_execution_profile";
	profile_id: "v37-g2-follow-up-profile-v1";
	case_id: string;
	manifest_body_digest: string;
	parent_provider_profile_digest: string;
	parent_tool_profile_digest: string;
	parent_command_profile_digest: string;
	parent_budget_profile_digest: string;
	parent_stop_condition_profile_digest: string;
	provider_profile: FollowUpProviderProfileV37;
	provider_profile_digest: string;
	tool_profile: FollowUpToolProfileV37;
	tool_profile_digest: string;
	command_profile: FollowUpCommandProfileV37;
	command_profile_digest: string;
	budget_profile: FollowUpBudgetProfileV37;
	budget_profile_digest: string;
	stop_condition_profile: FollowUpStopConditionProfileV37;
	stop_condition_profile_digest: string;
	follow_up_execution_profile_digest: string;
}

export interface FollowUpExecutionAuthorityV37 {
	workflow_id: string;
	workflow_registration_digest: string;
	registry_trust_root_digest: string;
	manifest_body_digest: string;
	parent_provider_profile_digest: string;
	parent_tool_profile_digest: string;
	parent_command_profile_digest: string;
	parent_budget_profile_digest: string;
	parent_stop_condition_profile_digest: string;
	configuration_location: string;
	loader_contract_id: "v37-follow-up-execution-profile-loader-v1";
	loader_contract_fingerprint: string;
	follow_up_execution_profile_digest: string;
	follow_up_execution_authority_digest: string;
}

export interface RegisteredFollowUpBindingV37 {
	schema_version: 1;
	kind: "v37_registered_follow_up_binding";
	case_id: string;
	workflow_id: string;
	workflow_registration_digest: string;
	follow_up_run_id: string;
	follow_up_task_instance_digest: string;
	follow_up_source_workspace_digest: string;
	state_store_scope_digest: string;
	state_version_id: number;
	active_state_digest: string;
	active_binding_revision: number;
	promotion_decision_id: string;
	promotion_decision_digest: string;
	candidate_id: string;
	candidate_digest: string;
	runtime_base_prompt_digest: string;
	composed_prompt_digest: string;
	parent_provider_profile_digest: string;
	parent_tool_profile_digest: string;
	parent_command_profile_digest: string;
	parent_budget_profile_digest: string;
	parent_stop_condition_profile_digest: string;
	provider_profile_digest: string;
	tool_profile_digest: string;
	command_profile_digest: string;
	budget_profile_digest: string;
	stop_condition_profile_digest: string;
	follow_up_execution_profile_digest: string;
	follow_up_execution_authority_digest: string;
	bound_at: string;
	frozen_binding_digest: string;
}

export interface FollowUpRuntimeObservationV37 {
	schema_version: 1;
	kind: "v37_follow_up_runtime_observation";
	workflow_id: string;
	workflow_registration_digest: string;
	follow_up_run_id: string;
	session_id: string;
	workspace_id: string;
	system_prompt_digest: string;
	frozen_binding_digest: string;
	follow_up_execution_authority_digest: string;
	observed_before_first_provider_request: true;
	runtime_observed_binding_digest: string;
}

export interface FollowUpVerifierArtifactV37 {
	schema_version: 1;
	kind: "v37_follow_up_verifier_artifact";
	verifier_id: string;
	verifier_source_sha256: string;
	command_profile_digest: string;
	follow_up_run_id: string;
	exit_code: number | null;
	timed_out: boolean;
	output_truncated: boolean;
	output_sha256: string;
	status: "passed" | "failed" | "invalid";
	verifier_artifact_digest: string;
}

export interface FollowUpFormalOutcomeV37 {
	schema_version: 1;
	kind: "v37_follow_up_formal_outcome";
	follow_up_run_id: string;
	runtime_manifest_digest: string;
	runtime_observed_binding_digest: string;
	verifier_artifact_digest: string;
	formal_outcome: "passed" | "failed" | "invalid" | "cancelled";
	terminal_status: "settled" | "budget_terminal" | "integrity_terminal";
	formal_outcome_artifact_digest: string;
}

export interface RegisteredBoundFollowUpEvidenceBodyV37 {
	schema_version: 1;
	family: "v37_registered_bound_state_followup";
	case_id: string;
	manifest_body_digest: string;
	case_registration_digest: string;
	workflow_id: string;
	workflow_registration_digest: string;
	follow_up_run_id: string;
	follow_up_task_instance_digest: string;
	follow_up_source_workspace_digest: string;
	state_store_scope_digest: string;
	state_version_id: number;
	active_state_digest: string;
	promotion_decision_id: string;
	promotion_decision_digest: string;
	candidate_id: string;
	candidate_digest: string;
	frozen_binding_digest: string;
	runtime_base_prompt_digest: string;
	composed_prompt_digest: string;
	runtime_observed_binding_digest: string;
	parent_provider_profile_digest: string;
	parent_tool_profile_digest: string;
	parent_command_profile_digest: string;
	parent_budget_profile_digest: string;
	parent_stop_condition_profile_digest: string;
	provider_profile_digest: string;
	tool_profile_digest: string;
	command_profile_digest: string;
	budget_profile_digest: string;
	stop_condition_profile_digest: string;
	follow_up_execution_profile_digest: string;
	follow_up_execution_authority_digest: string;
	verifier_artifact_digest: string;
	formal_outcome_artifact_digest: string;
	formal_outcome: "passed" | "failed" | "invalid" | "cancelled";
	terminal_status: "settled" | "budget_terminal" | "integrity_terminal";
	evidence_body_digest: string;
}

export interface FollowUpEvidenceConfirmationReceiptV37 {
	schema_version: 1;
	kind: "v37_follow_up_evidence_confirmation_receipt";
	workflow_id: string;
	workflow_registration_digest: string;
	evidence_body_digest: string;
	action_id: "confirm_registered_bound_follow_up_evidence";
	confirmed_at: string;
	confirmation_receipt_id: string;
	confirmation_receipt_digest: string;
}

export interface FollowUpEvidenceSubmissionRequestV37 {
	schema_version: 1;
	kind: "v37_follow_up_evidence_submission_request";
	workflow_id: string;
	workflow_registration_digest: string;
	evidence_body_digest: string;
	confirmation_receipt_id: string;
	confirmation_receipt_digest: string;
	requested_at: string;
	submission_request_digest: string;
}

export interface RegisteredBoundFollowUpAdmissionV37 {
	schema_version: 1;
	kind: "v37_registered_bound_follow_up_admission";
	admission_id: string;
	workflow_id: string;
	workflow_registration_digest: string;
	manifest_body_digest: string;
	case_registration_digest: string;
	registry_trust_root_digest: string;
	evidence_body_digest: string;
	submission_request_digest: string;
	inspector_id: "inspect-v37g2-registered-follow-up-v1";
	inspector_fingerprint: string;
	result: "admitted" | "rejected";
	reasons: string[];
	source_inventory_digest: string;
	admission_digest: string;
}

export interface CanonicalBoundStateAssessmentInputG2 {
	admission_identity: { admission_id: string; admission_digest: string };
	evidence_identity: { evidence_id: string; evidence_digest: string };
	trusted_task_context: { task_kind: string; failure_family: string | null };
	state_store_scope_digest: string;
	bound_active_state_identity: { binding_revision: number; state_version: number; state_digest: string };
	bound_promotion_decision_identity: { decision_id: string; decision_digest: string };
	binding_digest: string;
	outcome_status: "passed" | "failed" | "invalid" | "cancelled";
	verifier_status: "passed" | "failed" | "invalid" | "missing";
	failure_attribution: "verifier" | "none" | "infrastructure";
}
