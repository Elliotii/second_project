import type { ArtifactRefV0B, TaskSpecV0B } from "./v0b-types.ts";
import type {
	ActiveStateIdentityV3,
	FrozenValidationIdentityV3,
	ValidationArmV3,
	ValidationDecisionV3,
} from "./v3g2-types.ts";

export type RegressionApplicabilityKeyG2 =
	| "typescript-maintenance/verifier-failure"
	| "typescript-maintenance/none";

export interface FrozenRegressionCheckG2 {
	check_id: string;
	verifier_id: string;
	source_sha256: string;
	source_size_bytes: number;
	task: TaskSpecV0B;
	task_digest: string;
}

export interface RegressionPackSelectionG2 {
	schema_version: 1;
	selection_id: string;
	project_id: string;
	admission_root: string;
	registration_path: string;
	admission_id: string;
	admission_digest: string;
	trusted_task_context: { task_kind: string; failure_family: string | null };
	applicability_key: RegressionApplicabilityKeyG2;
	candidate_state_digest: string;
	source_workspace_ref: string;
	source_workspace_digest: string;
	checks: FrozenRegressionCheckG2[];
	pack_digest: string;
	selection_digest: string;
}

export interface RegressionGatedValidationInspectionG2 {
	integrity_valid: boolean;
	errors: string[];
	selection: RegressionPackSelectionG2 | null;
	validation_id: string | null;
	validation_digest: string | null;
	recomputed_decision: ValidationDecisionV3 | null;
}

export interface AcceptedStateComparisonSeedG2 {
	schema_version: 1;
	comparison_id: string;
	project_id: string;
	parent_state_digest: string;
	current_state_digest: string;
	source_workspace_digest: string;
	parent_state_ref: ArtifactRefV0B;
	current_state_ref: ArtifactRefV0B;
	frozen_identity: FrozenValidationIdentityV3;
	common_identity_digest: string;
	seed_digest: string;
}

export interface AcceptedStateComparisonG2 {
	schema_version: 1;
	comparison_id: string;
	seed_ref: ArtifactRefV0B;
	parent_arm_ref: ArtifactRefV0B;
	current_arm_ref: ArtifactRefV0B;
	comparison_digest: string;
}

export interface AcceptedStateComparisonInspectionG2 {
	integrity_valid: boolean;
	fairness_valid: boolean;
	errors: string[];
	seed: AcceptedStateComparisonSeedG2 | null;
	parent_arm: ValidationArmV3 | null;
	current_arm: ValidationArmV3 | null;
	comparison: AcceptedStateComparisonG2 | null;
	state_regression_observed: boolean;
}

export type StateAssessmentResultG2 = "retain" | "needs_reassessment" | "rollback";

export interface StateAssessmentG2 {
	schema_version: 1;
	assessment_id: string;
	project_id: string;
	admission_id: string;
	admission_digest: string;
	evidence_id: string;
	evidence_digest: string;
	trusted_task_context: { task_kind: string; failure_family: string | null };
	bound_state: ActiveStateIdentityV3;
	bound_decision_id: string;
	bound_decision_digest: string;
	binding_digest: string;
	promotion_validation_id: string;
	promotion_validation_digest: string;
	assessment_result: StateAssessmentResultG2;
	assessment_reason:
		| "bound_followup_passed"
		| "ordinary_negative_evidence"
		| "comparison_missing_or_invalid"
		| "comparison_not_state_attributable"
		| "valid_state_attributable_regression";
	comparison_id: string | null;
	comparison_digest: string | null;
	rollback_target_digest: string | null;
	assessment_digest: string;
}

export interface AssessedRollbackAuthorizationG2 {
	schema_version: 1;
	authorization_id: string;
	project_id: string;
	assessment_id: string;
	assessment_digest: string;
	expected_active: ActiveStateIdentityV3;
	target_state_digest: string;
	authority: "host_assessed_rollback";
	authorization_digest: string;
}

export interface AssessedRollbackApplicationG2 {
	schema_version: 1;
	application_id: string;
	project_id: string;
	assessment_id: string;
	assessment_digest: string;
	authorization_id: string;
	authorization_digest: string;
	v3_rollback_decision_id: string;
	v3_rollback_decision_digest: string;
	prior_active: ActiveStateIdentityV3;
	next_active: ActiveStateIdentityV3;
	target_state_digest: string;
	application_digest: string;
}

export interface FinalCapstoneG2Inspection {
	integrity_valid: boolean;
	errors: string[];
	assessment: StateAssessmentG2 | null;
	authorization: AssessedRollbackAuthorizationG2 | null;
	application: AssessedRollbackApplicationG2 | null;
}
