import type { ArtifactRefV0B } from "./v0b-types.ts";
import type { FrozenEvidenceV3, ImprovementOpportunityV3 } from "./v3-types.ts";

export type TrustedEvidenceSourceFamilyG1 =
	| "verifier_backed"
	| "v2a_recovery_comparison"
	| "v3g3_bound_state_followup";

export type TrustedEvidenceSourceG1 =
	| {
		family: "verifier_backed";
		generation: "v0b" | "v0c";
		source_project_root: string;
		run_id: string;
	}
	| {
		family: "v2a_recovery_comparison";
		run_root: string;
	}
	| {
		family: "v3g3_bound_state_followup";
		bundle_root: string;
		run_root: string;
		state_root: string;
		candidate_admission_registry_root: string;
		case_authority_path: string;
		immutable_base_prompt: string;
		immutable_base_prompt_sha256: string;
	};

export interface TrustedEvidenceHostRegistrationG1 {
	schema_version: 1;
	registration_id: string;
	project_id: string;
	source: TrustedEvidenceSourceG1;
	trusted_task_context: {
		task_kind: string;
		failure_family: string | null;
	};
	host_grant: {
		authority: "host";
		adaptation_eligible: true;
		policy_id: "final-capstone-g1-trusted-evidence-admission-v1";
	};
	expected_inspector: {
		inspector_id: string;
		inspector_fingerprint: string;
	};
	registration_digest: string;
}

export interface TrustedEvidenceSourceInventoryItemG1 extends ArtifactRefV0B {
	source_role: "run_artifact" | "state_artifact" | "candidate_admission_artifact" | "case_authority_artifact";
}

export interface TrustedEvidenceAdmissionRecordG1 {
	schema_version: 1;
	admission_id: string;
	project_id: string;
	registration_id: string;
	registration_digest: string;
	source_family: TrustedEvidenceSourceFamilyG1;
	source_run_ids: string[];
	source_anchor: string;
	inspector: {
		inspector_id: string;
		inspector_fingerprint: string;
		integrity_valid: true;
		terminal_valid: true;
	};
	source_inventory: TrustedEvidenceSourceInventoryItemG1[];
	source_inventory_digest: string;
	provenance: Record<string, unknown>;
	trusted_task_context: TrustedEvidenceHostRegistrationG1["trusted_task_context"];
	host_eligibility: TrustedEvidenceHostRegistrationG1["host_grant"];
	frozen_evidence: FrozenEvidenceV3;
	projector_result: ImprovementOpportunityV3 | "no_opportunity";
	admission_digest: string;
}

export interface TrustedEvidenceAdmissionResultG1 {
	record: TrustedEvidenceAdmissionRecordG1;
	record_path: string;
	idempotent_existing: boolean;
}

export interface TrustedEvidenceAdmissionInspectionG1 {
	integrity_valid: boolean;
	errors: string[];
	admission_id: string | null;
	admission_digest: string | null;
	evidence_id: string | null;
	evidence_digest: string | null;
	projector_result: string | null;
}
