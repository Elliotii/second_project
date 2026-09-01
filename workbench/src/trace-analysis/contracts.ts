import type { CodingTaskRunManifest } from "../coding-task/contracts.ts";

export type RunLabel = string | number | boolean;

export interface RunDescriptor {
	runId: string;
	root: string;
	labels: Record<string, RunLabel>;
	evaluation?: EvaluationRunSummary;
}

export type AnalysisOutcome = "PASS" | "TASK_FAILURE" | "INFRA_FAILURE";

export type EvaluationOutcome = AnalysisOutcome | "INVALID_TRIAL";

export interface EvaluationRunSummary {
	attempt: number;
	includedForEvaluation: boolean;
	outcome: EvaluationOutcome;
	evaluable: boolean;
	reason: string;
}

export interface OutcomeResult {
	outcome: AnalysisOutcome;
	evaluable: boolean;
}

export interface TraceEvent extends Record<string, unknown> {
	sequence: number;
	type: string;
	tool_name?: string;
	tool_call_id?: string;
	phase?: string;
}

export interface TraceArtifact extends Record<string, unknown> {
	events: TraceEvent[];
}

export interface LoadedRun {
	descriptor: RunDescriptor;
	manifest: CodingTaskRunManifest;
	trace: TraceArtifact;
	verifierResult: Record<string, unknown>;
	manifestText: string;
	traceText: string;
	diffText: string;
	diffArtifact: "diff.json" | "diff.patch";
	verifierResultText: string;
	verifierOutputText: string;
	reportText: string;
	paths: {
		manifest: string;
		trace: string;
		diff: string;
		verifierResult: string;
		verifierOutput: string;
		report: string;
	};
	unavailableArtifacts: Array<"trace" | "diff" | "verifierResult" | "verifierOutput" | "report">;
}

export type EvidenceLocator =
	| { artifact: "trace"; run_id: string; sequence: number }
	| { artifact: "diff" | "verifier" | "manifest"; run_id: string };

export interface EvidenceReadRecord {
	artifact: EvidenceLocator["artifact"];
	locator: EvidenceLocator;
	characterCount: number;
}

export interface EvidenceRead extends EvidenceReadRecord {
	content: string;
}

export interface AnalysisContext {
	runs: Map<string, LoadedRun>;
	coveredRuns: string[];
	loadedEvidence: EvidenceReadRecord[];
}

export interface TraceQuery {
	eventType?: string;
	toolName?: string;
	keyword?: string;
	limit?: number;
}

export interface TraceSearchResult {
	locator: Extract<EvidenceLocator, { artifact: "trace" }>;
	eventType: string;
	summary: string;
	fields: Record<string, string | number | boolean>;
}

export interface FindingDraft {
	id: string;
	observation: string;
	interpretation: string;
	limitation: string;
	applicable_runs: string[];
	support: EvidenceLocator[];
	counter: EvidenceLocator[];
	counter_checked: boolean;
	status: "draft" | "kept" | "dropped";
}

export interface AnalysisState {
	covered_runs: string[];
	notes: string[];
	open_questions: string[];
	next_action: string;
	loaded_evidence: EvidenceReadRecord[];
	finding_drafts: FindingDraft[];
}
