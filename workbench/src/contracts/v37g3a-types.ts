import type {
	CaseRegistrationEnvelopeV37,
	RegisteredCaseManifestBodyV37,
	RegisteredFollowUpExecutionProfileV37,
	WorkflowRegistrationV37,
} from "./v37-types.ts";

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
	configuration_baseline_id: "v37-g3a-host-registry-v1";
	loader_contract_id: "v37-g3a-host-registry-loader-v1";
	digest_algorithm: "sha256_over_canonical_utf8_json_v1";
	entries: HostRegistryEntryV37G3A[];
	registry_index_digest: string;
}

export interface LoadedRegisteredCaseV37G3A {
	manifest: RegisteredCaseManifestBodyV37;
	envelopes: CaseRegistrationEnvelopeV37[];
	current_envelope: CaseRegistrationEnvelopeV37;
	follow_up_execution_profile: RegisteredFollowUpExecutionProfileV37;
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
	| "ready_for_primary" | "ready_for_recovery" | "no_recovery_needed"
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
