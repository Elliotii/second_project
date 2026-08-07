import type { ActiveStateIdentityV3 } from "./v3g2-types.ts";
import type { EvidenceIdentityV3, HarnessStateKindV3 } from "./v3-types.ts";

export interface CandidateAdmissionV3 {
	schema_version: 1;
	project_id: string;
	original_candidate_id: string;
	original_candidate_digest: string;
	original_staged_state_digest: string;
	evidence_identity: EvidenceIdentityV3;
	original_accepted_base_sentinel_digest: string;
	target_active: ActiveStateIdentityV3;
	semantic_payload_digest: string;
	semantic_preservation: true;
	admitted_candidate_id: string;
	admitted_candidate_digest: string;
	admitted_staged_state_digest: string;
	admission_digest: string;
}

export interface AdmissionRegistryEntryV3 {
	admitted_candidate_digest: string;
	admission_digest: string;
	admission_ref: string;
	admission_file_sha256: string;
	source_candidate_ref: "fixtures/v3/goal1-real-candidate.json";
	source_candidate_sha256: string;
	source_state_ref: "fixtures/v3/goal1-real-staged-state.json";
	source_state_sha256: string;
}

export interface AdmissionRegistryV3 {
	schema_version: 1;
	project_id: string;
	entries: AdmissionRegistryEntryV3[];
	registry_digest: string;
}

export interface TrustedFailureLineageV3 {
	source_run_id: string;
	failure_family: string;
	lineage_digest: string;
}

export interface TrustedTaskIdentityV3 {
	task_id: string;
	case_id: string;
	task_kind: string;
	identity_digest: string;
}

export interface BindingContextV3 {
	trusted_task_identity: TrustedTaskIdentityV3;
	trusted_failure_lineage: TrustedFailureLineageV3 | null;
}

export interface Goal3ProviderProfileV3 {
	provider_kind: "faux" | "deepseek_real";
	provider_id: string;
	model_id: string;
	api: string;
	endpoint: string | null;
	thinking_level: "off";
	retry: false;
	fallback: false;
	profile_digest: string;
}

export interface Goal3CaseAuthorityV3 {
	schema_version: 1;
	project_id: string;
	task_id: string;
	case_id: string;
	task_kind: string;
	allowed_failure_lineage: TrustedFailureLineageV3 | null;
	task_prompt_sha256: string;
	verifier_id: string;
	verifier_sha256: string;
	tool_profile_id: string;
	tool_profile_digest: string;
	budget_profile_id: string;
	budget_profile_digest: string;
	provider_profile: Goal3ProviderProfileV3;
	authority_digest: string;
}

export interface BoundStateEntryV3 {
	entry_id: string;
	kind: HarnessStateKindV3;
	semantic_digest: string;
	source_digest: string | null;
}

export interface RefinementLineageV3 {
	candidate_id: string;
	candidate_digest: string;
	staged_state_digest: string;
	validation_id: string;
	validation_digest: string;
	decision_id: string;
	decision_digest: string;
	version_digest: string;
	admission_digest: string | null;
}

export interface FrozenRunBindingV3 {
	schema_version: 1;
	project_id: string;
	active_binding_revision: number;
	active_state_version: number;
	active_state_digest: string;
	active_decision_id: string;
	case_authority_digest: string;
	binding_context: BindingContextV3;
	binding_context_digest: string;
	bound_entries: BoundStateEntryV3[];
	composed_prompt_sha256: string;
	adaptive_skill_name: string | null;
	adaptive_skill_source_sha256: string | null;
	adaptive_skill_wrapper_sha256: string | null;
	lineage: RefinementLineageV3 | null;
	binding_digest: string;
}

export interface Goal3RunManifestV3 {
	schema_version: 1;
	run_id: string;
	case_id: string;
	task_id: string;
	task_prompt_sha256: string;
	binding_ref_sha256: string;
	binding_digest: string;
	case_authority_digest: string;
	runtime_path: "prompt_addendum" | "adaptive_skill" | "unbound_prompt";
	provider_kind: "faux" | "deepseek_real";
	provider_id: string;
	model_id: string;
	provider_profile_digest: string;
	dispatch_attempts: number;
	provider_dispatches: number;
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
	provider_requests: number;
	input_tokens: number;
	output_tokens: number;
	cost_usd: number;
	verifier_status: "passed" | "failed";
	manifest_digest: string;
}

export interface DirectPiRuntimeEvidenceV3 {
	schema_version: 1;
	run_id: string;
	binding_digest: string;
	case_authority_digest: string;
	runtime_path: "prompt_addendum" | "adaptive_skill" | "unbound_prompt";
	session_id: string;
	settled_events: number;
	provider_kind: "faux" | "deepseek_real";
	provider_id: string;
	model_id: string;
	provider_profile_digest: string;
	dispatch_attempts: number;
	provider_dispatches: number;
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
	provider_requests: number;
	input_tokens: number;
	output_tokens: number;
	cost_usd: number;
	tool_calls: number;
	tool_profile_digest: string;
	task_prompt_sha256: string;
	observed_system_prompt_sha256: string;
	observed_user_message_sha256: string;
	observed_skill_wrapper_sha256: string | null;
	model_payload_sha256: string;
	runtime_digest: string;
}
