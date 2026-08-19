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
