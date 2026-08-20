import type {
	CaseRegistrationEnvelopeV37,
	FollowUpBudgetProfileV37,
	FollowUpCommandProfileV37,
	FollowUpStopConditionProfileV37,
	FollowUpToolProfileV37,
	RegisteredCaseManifestBodyV37,
	WorkflowRegistrationV37,
} from "./v37-types.ts";

export interface ExecutionAccessExpectationV37G3A {
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
}

export interface DeterministicFollowUpProviderProfileV37G3A {
	profile_id: "v37-g2-deterministic-faux-v1";
	provider_kind: "public_emitted_faux";
	model_id: "v37-g2-faux/faux-1";
	external: false;
	credential_reads: 0;
	network_calls: 0;
	real_model_calls: 0;
}

export interface HostExternalFollowUpProviderProfileV37G3A {
	profile_id: string;
	provider_kind: "host_registered_external_v37g3a";
	model_id: string;
	external: true;
	credential_reads: number;
	network_calls: number;
	external_provider_calls: number;
	real_model_calls: number;
}

export type FollowUpProviderProfileV37G3A = DeterministicFollowUpProviderProfileV37G3A | HostExternalFollowUpProviderProfileV37G3A;

export interface RegisteredFollowUpExecutionProfileV37G3A {
	schema_version: 1;
	kind: "v37_registered_follow_up_execution_profile";
	profile_id: string;
	case_id: string;
	manifest_body_digest: string;
	parent_provider_profile_digest: string;
	parent_tool_profile_digest: string;
	parent_command_profile_digest: string;
	parent_budget_profile_digest: string;
	parent_stop_condition_profile_digest: string;
	provider_profile: FollowUpProviderProfileV37G3A;
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

export interface HostRegistryEntryV37G3A {
	case_id: string;
	manifest_version: number;
	manifest_location: string;
	manifest_body_digest: string;
	envelope_locations: string[];
	envelope_digests: string[];
	current_registration_digest: string;
	follow_up_execution_profile_location: string;
	follow_up_execution_profile_digest: string;
}

export interface HostRegistryIndexV37G3A {
	schema_version: 1;
	kind: "v37_host_registry_index";
	configuration_baseline_id: "v37-g3a-host-registry-v1" | "v37-g3a-host-registry-v2";
	loader_contract_id: "v37-g3a-host-registry-loader-v1";
	digest_algorithm: "sha256_over_canonical_utf8_json_v1";
	entries: HostRegistryEntryV37G3A[];
	registry_index_digest: string;
}

export interface LoadedRegisteredCaseV37G3A {
	manifest: RegisteredCaseManifestBodyV37;
	envelopes: CaseRegistrationEnvelopeV37[];
	current_envelope: CaseRegistrationEnvelopeV37;
	follow_up_execution_profile: RegisteredFollowUpExecutionProfileV37G3A;
	registry: HostRegistryIndexV37G3A;
	registry_entry: HostRegistryEntryV37G3A;
	loader_contract_fingerprint: string;
	registry_trust_root_digest: string;
	historical_read_only: boolean;
}

export const V37_G3A_ACTION_IDS = [
	"run_primary", "run_recovery", "confirm_recovery_evidence",
	"request_recovery_admission", "produce_candidate", "run_regression",
	"run_follow_up", "confirm_follow_up_evidence",
	"request_follow_up_admission", "assess_state",
] as const;
export type WorkflowActionIdV37G3A = typeof V37_G3A_ACTION_IDS[number];

export type WorkflowStageV37G3A =
	| "ready_for_primary" | "ready_for_recovery" | "no_recovery_needed" | "recovery_inconclusive"
	| "ready_for_recovery_confirmation" | "ready_for_recovery_admission"
	| "ready_for_candidate" | "ready_for_regression" | "candidate_rejected"
	| "ready_for_follow_up" | "ready_for_follow_up_confirmation"
	| "ready_for_follow_up_admission" | "ready_for_assessment" | "complete";

export interface WorkflowHeaderV37G3A {
	schema_version: 1;
	kind: "v37_g3a_workflow_header";
	workflow: WorkflowRegistrationV37;
	created_at: string;
	header_digest: string;
}

export interface WorkflowTransitionReceiptV37G3A {
	schema_version: 1;
	kind: "v37_g3a_transition_receipt";
	workflow_id: string;
	sequence: number;
	action_id: WorkflowActionIdV37G3A;
	previous_receipt_digest: string | null;
	artifact_refs: Array<{ kind: string; id: string; digest: string }>;
	recorded_at: string;
	receipt_digest: string;
}

export interface WorkflowReadModelV37G3A {
	workflow_id: string;
	case_id: string;
	stage: WorkflowStageV37G3A;
	available_actions: WorkflowActionIdV37G3A[];
	historical_read_only: boolean;
	artifacts: Array<{ kind: string; id: string; digest: string }>;
	receipt_count: number;
}
