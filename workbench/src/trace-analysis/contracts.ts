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
	repeated_support_run_ids: string[];
	support: EvidenceLocator[];
	counter: EvidenceLocator[];
	counter_checked: boolean;
	status: "draft" | "kept" | "dropped";
	sealed: boolean;
	claim_scope?: ClaimScope;
	agenda_item_id?: string;
}

export type AnalysisPhase = "blind_analysis" | "alignment_ready";

export type ClaimScope = "run_observation" | "cell_pattern" | "condition_comparison" | "cross_case";

export type ProcessInvestigationResolution =
	| "bounded_contrast"
	| "evidence_backed_irrelevance"
	| "explicit_confound"
	| "not_repeated_after_check";

export interface InvestigationAgendaItem {
	id: string;
	question: string;
	trigger: string;
	claim_scope: ClaimScope;
	anchor_run_ids: string[];
	relevant_case_ids: string[];
	checked_runs: string[];
	settle_condition: string;
	process_investigation_required: boolean;
	process_investigation_resolution: ProcessInvestigationResolution | null;
	status: "open" | "settled" | "deprioritized";
	closure_reason: string;
}

export interface AnalysisState {
	phase: AnalysisPhase;
	covered_runs: string[];
	matrix_triage_complete: boolean;
	investigation_agenda: InvestigationAgendaItem[];
	notes: string[];
	open_questions: string[];
	next_action: string;
	loaded_evidence: EvidenceReadRecord[];
	finding_drafts: FindingDraft[];
}
