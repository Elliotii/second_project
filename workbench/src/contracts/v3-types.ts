import type { ArtifactRefV0B } from "./v0b-types.ts";

export type ImprovementTriggerV3 = "hard_failure" | "inefficient_success" | "structural_trajectory_pathology";
export type HarnessStateKindV3 = "prompt_addendum" | "adaptive_skill";

export interface EvidenceIdentityV3 {
	evidence_id: string;
	evidence_digest: string;
}

export type TrajectoryEventV3 =
	| { seq: number; kind: "check_call"; call_id: string; command_id: string; argv_sha256: string }
	| { seq: number; kind: "check_result"; call_id: string; result_id: string; command_id: string; argv_sha256: string; exit_code: number; output_ref: ArtifactRefV0B }
	| { seq: number; kind: "edit_call"; call_id: string }
	| { seq: number; kind: "edit_result"; call_id: string; result_id: string; edit_ref: ArtifactRefV0B };

export interface FrozenEvidenceV3 {
	schema_version: 1;
	evidence_id: string;
	evidence_digest: string;
	source_run_ids: string[];
	validity: {
		integrity_valid: boolean;
		terminal_valid: boolean;
		lineage_closed: boolean;
		attribution: "agent" | "verifier" | "none" | "infrastructure" | "evidence" | "user";
	};
	outcome: {
		status: "passed" | "failed" | "invalid" | "cancelled";
		verifier_status: "passed" | "failed" | "invalid" | "missing";
	};
	task_context: { task_kind: string; failure_family: string | null };
	evidence_refs: ArtifactRefV0B[];
	usage?: { provider_calls: number; tool_calls: number };
	comparison?: {
		peer_run_id: string;
		common_verifier: true;
		peer_verifier_status: "passed";
		vector: {
			provider_calls: { peer: number; observed: number };
			tool_calls: { peer: number; observed: number };
		};
	};
	trajectory?: { events: TrajectoryEventV3[] };
}

export interface ImprovementOpportunityV3 {
	schema_version: 1;
	opportunity_id: string;
	trigger: ImprovementTriggerV3;
	source_run_ids: string[];
	evidence_identity: EvidenceIdentityV3;
	evidence_refs: ArtifactRefV0B[];
	observations: Record<string, string | number | boolean>;
	derivation: "deterministic_projection";
	task_context: FrozenEvidenceV3["task_context"];
}

export interface DiagnosisV3 {
	diagnosis_id: string;
	opportunity_id: string;
	pattern_id: ImprovementTriggerV3;
	evidence_identity: EvidenceIdentityV3;
	evidence_refs: ArtifactRefV0B[];
	statement: string;
	derivation: "deterministic_fixture" | "model_proposal";
}

export interface ApplicabilityV3 {
	task_kinds: string[];
	failure_families: string[];
}

export interface LessonV3 {
	lesson_id: string;
	diagnosis_id: string;
	evidence_identity: EvidenceIdentityV3;
	statement: string;
	expected_outcome: string;
	applicability: ApplicabilityV3;
}

export type HarnessEditV3 =
	| {
		kind: "prompt_addendum";
		entry_id: string;
		content: string;
		applicability: ApplicabilityV3;
	}
	| {
		kind: "adaptive_skill";
		entry_id: string;
		skill_name: string;
		description: string;
		markdown_body: string;
		applicability: ApplicabilityV3;
	};

export interface RefinementProposalV3 {
	schema_version: 1;
	proposal_id: string;
	evidence_digest: string;
	expected_base_state_digest: string;
	diagnosis: {
		pattern_id: ImprovementTriggerV3;
		statement: string;
		evidence_refs: ArtifactRefV0B[];
	};
	lesson: {
		statement: string;
		expected_outcome: string;
		applicability: ApplicabilityV3;
	};
	edits: HarnessEditV3[];
}

export interface RefinementCandidateV3 {
	schema_version: 1;
	candidate_id: string;
	proposal_id: string;
	source_opportunity_id: string;
	evidence_identity: EvidenceIdentityV3;
	diagnosis: DiagnosisV3;
	lesson: LessonV3;
	expected_base_state_digest: string;
	edits: HarnessEditV3[];
	candidate_digest: string;
}

export interface PromptAddendumStateEntryV3 extends Extract<HarnessEditV3, { kind: "prompt_addendum" }> {
	content_sha256: string;
	composed_prompt_sha256: string;
}

export interface AdaptiveSkillStateEntryV3 extends Extract<HarnessEditV3, { kind: "adaptive_skill" }> {
	source_ref: string;
	source_sha256: string;
	source_size_bytes: number;
	wrapper_sha256: string;
	wrapper_size_bytes: number;
	disable_model_invocation: true;
	invocation_mode: "explicit_skill";
}

export type HarnessStateEntryV3 = PromptAddendumStateEntryV3 | AdaptiveSkillStateEntryV3;

export interface StagedHarnessStateV3 {
	schema_version: 1;
	status: "staged_inactive";
	state_digest: string;
	candidate_id: string;
	candidate_digest: string;
	evidence_identity: EvidenceIdentityV3;
	expected_base_state_digest: string;
	entries: HarnessStateEntryV3[];
}
