import type { NormalizedCodingRun } from "../coding-task/normalization.ts";

export interface SkillBuildRequest {
	buildId: string;
	sourceRunSetPath: string;
	outputDirectory: string;
	model: string;
}

export interface SkillBuildResult {
	status: "built" | "insufficient_evidence" | "invalid";
	specPath?: string;
	skillPath?: string;
	buildPath: string;
	error?: { code: string; message: string };
}

export interface CandidateDraft {
	schema_version: 1;
	title: string;
	when_to_use: string[];
	steps: Array<{ instruction: string; support_run_ids: string[] }>;
	completion_checks: string[];
	do_not: string[];
}

export interface CandidateSpec extends CandidateDraft {
	task_family: string;
}

export interface SkillInductionDecision {
	decision: "build" | "insufficient_evidence";
	rationale: string;
	candidate: CandidateSpec | null;
}

export interface InductionContext {
	buildId: string;
	taskFamily: string;
}

export interface ValidationIssue {
	code: string;
	message: string;
	field?: string;
	matched_value?: string;
	rule?: string;
}
export interface ValidationResult { passed: boolean; issues: ValidationIssue[] }

export interface LoadedSourceRunSet {
	path: string;
	taskFamily: string;
	sourceRunIds: string[];
	runs: NormalizedCodingRun[];
}

export interface InductionUsage {
	prompt_id: "bundle-procedure-induction-v1";
	model: string;
	request_count: number;
	input_tokens: number | null;
	output_tokens: number | null;
	duration_ms: number | null;
}

export interface InductionModelResponse {
	text: string;
	model: string;
	input_tokens: number | null;
	output_tokens: number | null;
	duration_ms: number | null;
}

export interface InductionModelRuntime {
	complete(systemPrompt: string, userPrompt: string): Promise<InductionModelResponse>;
	close?(): Promise<void>;
}

export interface SkillInductionExecution {
	decision: SkillInductionDecision;
	usage: InductionUsage;
}

export interface InductionPersistenceHooks {
	onRawResponse(response: InductionModelResponse, usage: InductionUsage): void;
	onParsedDecision(decision: SkillInductionDecision, usage: InductionUsage): void;
}

export interface SkillBuildArtifact {
	schema_version: 1;
	request: SkillBuildRequest;
	status: SkillBuildResult["status"];
	source_run_set_path: string;
	source_run_set_sha256: string | null;
	source_run_ids: string[];
	model: string;
	prompt_id: InductionUsage["prompt_id"];
	request_count: number;
	input_tokens: number | null;
	output_tokens: number | null;
	duration_ms: number | null;
	induction_decision: SkillInductionDecision["decision"] | null;
	rationale: string | null;
	raw_response_text: string | null;
	parsed_candidate: CandidateSpec | null;
	candidate_spec_path: string | null;
	skill_path: string | null;
	skill_sha256: string | null;
	validation: ValidationResult;
	loader_preflight: "passed" | "not_run";
	deterministic_replay_count: number;
	error: SkillBuildResult["error"] | null;
}
