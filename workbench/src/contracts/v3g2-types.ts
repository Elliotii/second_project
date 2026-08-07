import type { ArtifactRefV0B } from "./v0b-types.ts";
import type { HarnessStateEntryV3 } from "./v3-types.ts";

export interface HarnessStateVersionV3 {
	schema_version: 1;
	status: "accepted";
	project_id: string;
	state_version: number;
	parent_state_digest: string | null;
	source_candidate_id: string | null;
	source_candidate_digest: string | null;
	source_staged_state_digest: string | null;
	entries: HarnessStateEntryV3[];
	state_digest: string;
}

export interface ActiveStatePointerV3 {
	schema_version: 1;
	project_id: string;
	binding_revision: number;
	state_version: number;
	state_digest: string;
	decision_id: string;
	pointer_digest: string;
}

export interface ActiveStateIdentityV3 {
	binding_revision: number;
	state_version: number;
	state_digest: string;
}

export type CandidateDecisionReasonV3 =
	| "base_failed_candidate_passed"
	| "both_passed_material_improvement"
	| "candidate_failed"
	| "both_failed"
	| "no_material_improvement"
	| "candidate_regression_failed"
	| "authority_or_fairness_invalid"
	| "stale_base";

export interface StateDecisionV3 {
	schema_version: 1;
	decision_id: string;
	decision_sequence: number;
	kind: "initialize" | "promotion" | "rejection" | "rollback";
	project_id: string;
	result: "initialized" | "promoted" | "rejected" | "rolled_back";
	reason: "initial_state" | CandidateDecisionReasonV3 | "operator_rollback";
	candidate_id: string | null;
	candidate_digest: string | null;
	staged_state_digest: string | null;
	validation_id: string | null;
	validation_digest: string | null;
	validation_ref: ArtifactRefV0B | null;
	prior_active: ActiveStateIdentityV3 | null;
	next_active: ActiveStateIdentityV3;
	rollback_target_digest: string | null;
	decision_digest: string;
}

export interface FrozenValidationIdentityV3 {
	task_digest: string;
	instruction_digest: string;
	provider_model_profile_digest: string;
	tool_profile_digest: string;
	external_verifier_id: string;
	external_verifier_source_sha256: string;
	external_verifier_digest: string;
	regression_checks: Array<{ verifier_id: string; source_sha256: string; task_digest: string }>;
	regression_set_digest: string;
	budget_digest: string;
	hard_constraints_digest: string;
	session_policy: "fresh_both";
}

export interface InterventionValidationSeedV3 {
	schema_version: 1;
	validation_id: string;
	project_id: string;
	candidate_id: string;
	candidate_digest: string;
	base_state_digest: string;
	candidate_state_digest: string;
	source_workspace_digest: string;
	base_state_ref: ArtifactRefV0B;
	candidate_state_ref: ArtifactRefV0B;
	frozen_identity: FrozenValidationIdentityV3;
	common_identity_digest: string;
	seed_digest: string;
}

export type FauxExecutionEventV3 =
	| { seq: number; type: "provider_call"; call_id: string }
	| { seq: number; type: "tool_call"; call_id: string }
	| { seq: number; type: "structural_pathology"; check_id: string };

export interface FauxExecutionEvidenceV3 {
	schema_version: 1;
	arm: "base" | "candidate";
	settled: true;
	events: FauxExecutionEventV3[];
}

export interface StructuralUsageVectorV3 {
	structural_pathology_count: number;
	tool_calls: number;
	provider_calls: number;
}

export interface ValidationArmV3 {
	schema_version: 1;
	arm: "base" | "candidate";
	treatment_state_digest: string;
	common_identity_digest: string;
	initial_workspace_digest: string;
	initial_workspace_ref: ArtifactRefV0B;
	session_id: string;
	session_ref: ArtifactRefV0B;
	session_parent: null;
	session_entry_count_before: 0;
	execution_ref: ArtifactRefV0B;
	verifier_result_ref: ArtifactRefV0B;
	regression_result_refs: ArtifactRefV0B[];
	final_workspace_digest: string;
	metrics: StructuralUsageVectorV3;
	verifier_status: "passed" | "failed" | "invalid";
	regression_passed: boolean;
	authority_valid: boolean;
}

export interface ValidationDecisionV3 {
	result: "promote" | "reject";
	reason: CandidateDecisionReasonV3;
}

export interface InterventionValidationV3 {
	schema_version: 1;
	validation_id: string;
	seed_ref: ArtifactRefV0B;
	base_arm_ref: ArtifactRefV0B;
	candidate_arm_ref: ArtifactRefV0B;
	decision: ValidationDecisionV3;
	validation_digest: string;
}

export interface ValidationInspectionV3 {
	schema_version: 1;
	validation_id: string | null;
	integrity_valid: boolean;
	fairness_valid: boolean;
	lineage_valid: boolean;
	errors: string[];
	seed: InterventionValidationSeedV3 | null;
	base_arm: ValidationArmV3 | null;
	candidate_arm: ValidationArmV3 | null;
	recomputed_decision: ValidationDecisionV3 | null;
	validation: InterventionValidationV3 | null;
}

export interface StateStoreInspectionV3 {
	schema_version: 1;
	project_id: string | null;
	integrity_valid: boolean;
	errors: string[];
	active: ActiveStatePointerV3 | null;
	versions: HarnessStateVersionV3[];
	decisions: StateDecisionV3[];
}
