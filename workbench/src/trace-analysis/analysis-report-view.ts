import { readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type {
	AlignmentBenefit,
	AlignmentCausation,
	AnalysisPhase,
	ClaimScope,
	ContentCorrespondence,
	DifferentiationStatus,
	EvidenceDisposition,
	EvidenceLocator,
	SkillRecommendation,
} from "./contracts.ts";
import { validateAnalysisWorkflow } from "./analysis.ts";
import { loadAnalysisState } from "./state.ts";
import { loadFrozenSkillEvidenceFromEvaluation, validateControlledUnblindResult } from "./controlled-unblind.ts";
import { prepareEvaluationAnalysis } from "./evaluation.ts";
import { fileSha256 } from "../hash.ts";

export interface ReportRunView {
	runId: string;
	caseId: string;
	trial: number;
	condition: string;
	outcome: string;
}

export interface ReportPairView {
	caseId: string;
	trial: number;
	noSkill: ReportRunView;
	withSkill: ReportRunView;
}

export interface ReportEvidenceView {
	role: "support" | "counter";
	runId: string;
	artifact: EvidenceLocator["artifact"];
	locator: EvidenceLocator;
}

export interface ReportPairEvidenceView extends ReportPairView {
	noSkillRelation: string[];
	withSkillRelation: string[];
}

export interface ReportSkillEvidenceView {
	candidateSha256: string;
	startLine: number;
	endLine: number;
	text: string;
}

export interface ReportFindingView {
	id: string;
	observation: string;
	interpretation: string;
	limitation: string;
	claimScope: ClaimScope;
	applicableRuns: string[];
	repeatedSupportRunIds: string[];
	support: ReportEvidenceView[];
	counter: ReportEvidenceView[];
	contentCorrespondence: ContentCorrespondence;
	differentiationStatus: DifferentiationStatus;
	conditionContrast: string;
	counterAndClaimBoundary: string;
	benefit: AlignmentBenefit;
	causation: AlignmentCausation;
	maxSupportedClaim: string;
	skillRecommendation: SkillRecommendation;
	evidenceDisposition: EvidenceDisposition;
	skillEvidence: ReportSkillEvidenceView[];
	pairEvidence: ReportPairEvidenceView[];
}

export interface AnalysisReportView {
	evaluation: {
		evaluationId: string;
		suite: string;
		provider: string;
		model: string;
		candidateSha256: string;
		executionHead: string;
		analysisStateSha256: string;
		analysisPhase: AnalysisPhase;
		runCount: number;
		pairCount: number;
		outcomeCounts: Record<"no_skill" | "with_skill", Record<string, number>>;
	};
	provenance: {
		taskSources: Array<{ caseId: string; taskRefs: string[] }>;
		formalEvaluationRelativePath: string | null;
		formalEvaluationLocalPath: string;
		candidateBuildRef: string;
		candidateSkillRelativePath: string;
		candidateSkillLocalPath: string;
	};
	pairs: ReportPairView[];
	findings: ReportFindingView[];
	runs: ReportRunView[];
	followUpObservations: string[];
}

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function slash(value: string): string {
	return value.split(sep).join("/");
}

function repositoryRelative(path: string): string | null {
	const value = relative(REPOSITORY_ROOT, path);
	return value === "" || value === ".." || value.startsWith(`..${sep}`) ? null : slash(value);
}

function sameSet(left: string[], right: string[]): boolean {
	return left.length === right.length && left.every((value) => right.includes(value));
}

function evidenceView(role: "support" | "counter", locator: EvidenceLocator): ReportEvidenceView {
	return { role, runId: locator.run_id, artifact: locator.artifact, locator: structuredClone(locator) };
}

function relation(runId: string, applicable: Set<string>, support: Set<string>, counter: Set<string>, repeated: Set<string>): string[] {
	const values: string[] = [];
	if (applicable.has(runId)) values.push("applicable");
	if (support.has(runId)) values.push("support");
	if (counter.has(runId)) values.push("counter");
	if (repeated.has(runId)) values.push("repeated_support");
	return values;
}

export async function buildAnalysisReportView(options: { batchPath: string; mappingPath: string; statePath: string }): Promise<AnalysisReportView> {
	const prepared = prepareEvaluationAnalysis({ batchPath: options.batchPath, mappingPath: options.mappingPath });
	const state = loadAnalysisState(options.statePath, { requireExplicitPhase: true });
	if (state.phase !== "human_review_ready") throw new Error("Report generation requires human_review_ready Analysis State");
	validateAnalysisWorkflow(state, prepared.descriptors);

	const included = prepared.evaluatedRuns.filter((run) => run.includedForEvaluation);
	const includedIds = included.map((run) => run.run_id);
	if (!sameSet(state.covered_runs, includedIds)) throw new Error("Analysis State covered_runs does not exactly match included Evaluation Runs");
	const includedIdSet = new Set(includedIds);
	const kept = state.finding_drafts.filter((finding) => finding.status === "kept" && finding.sealed);
	for (const finding of kept) {
		const referenced = [...finding.applicable_runs, ...finding.repeated_support_run_ids, ...finding.support.map((entry) => entry.run_id), ...finding.counter.map((entry) => entry.run_id)];
		for (const runId of referenced) if (!includedIdSet.has(runId)) throw new Error(`Finding ${finding.id} references Run ${runId} outside included Evaluation Runs`);
	}

	const unblind = state.controlled_unblind_result!;
	const hasSkillRefs = unblind.alignments.some((entry) => entry.skill_evidence_refs.length > 0);
	const frozenSkill = await loadFrozenSkillEvidenceFromEvaluation(options.batchPath);
	const skill = hasSkillRefs
		? frozenSkill
		: { candidate_sha256: frozenSkill.candidate_sha256, line_count: 0, numbered_content: "", source_lines: [] };
	const validated = validateControlledUnblindResult(state, unblind, skill);
	const candidateBuildPath = resolve(prepared.batch.candidate_build_ref);
	const candidateBuild = JSON.parse(readFileSync(candidateBuildPath, "utf8")) as Record<string, unknown>;
	if (typeof candidateBuild.skill_path !== "string" || candidateBuild.skill_path.trim().length === 0) throw new Error("Candidate build skill_path must be a non-empty string for Report provenance");
	const candidateSkillPath = resolve(candidateBuild.skill_path);
	const formalEvaluationPath = dirname(resolve(options.batchPath));
	const taskSources = new Map<string, Set<string>>();
	for (const plan of prepared.batch.planned_runs) taskSources.set(plan.case_id, new Set([...(taskSources.get(plan.case_id) ?? []), plan.task_ref]));

	const runs: ReportRunView[] = included.map((run) => ({
		runId: run.run_id,
		caseId: run.plan.case_id,
		trial: run.plan.trial,
		condition: run.plan.condition,
		outcome: run.outcome,
	}));
	const pairBuckets = new Map<string, ReportRunView[]>();
	for (const run of runs) {
		const key = JSON.stringify([run.caseId, run.trial]);
		pairBuckets.set(key, [...(pairBuckets.get(key) ?? []), run]);
	}
	const pairs = [...pairBuckets.values()].map((bucket): ReportPairView => {
		const noSkill = bucket.filter((run) => run.condition === "no_skill");
		const withSkill = bucket.filter((run) => run.condition === "with_skill");
		if (bucket.length !== 2 || noSkill.length !== 1 || withSkill.length !== 1) throw new Error(`Case ${bucket[0]?.caseId ?? "?"} trial ${bucket[0]?.trial ?? "?"} is not an exact no_skill/with_skill pair`);
		return { caseId: bucket[0]!.caseId, trial: bucket[0]!.trial, noSkill: noSkill[0]!, withSkill: withSkill[0]! };
	}).sort((left, right) => left.caseId.localeCompare(right.caseId) || left.trial - right.trial);

	const alignmentById = new Map(validated.alignments.map((entry) => [entry.behavior_finding_id, entry]));
	const findings = kept.map((finding): ReportFindingView => {
		const alignment = alignmentById.get(finding.id);
		if (!alignment) throw new Error(`Finding ${finding.id} has no Controlled-Unblind alignment`);
		if (!finding.claim_scope) throw new Error(`Finding ${finding.id} has no claim_scope`);
		const applicable = new Set(finding.applicable_runs);
		const support = new Set(finding.support.map((entry) => entry.run_id));
		const counter = new Set(finding.counter.map((entry) => entry.run_id));
		const repeated = new Set(finding.repeated_support_run_ids);
		const touchedPairs = pairs.filter((pair) => [pair.noSkill.runId, pair.withSkill.runId].some((runId) => applicable.has(runId) || support.has(runId) || counter.has(runId) || repeated.has(runId)));
		const showPairs = touchedPairs.length >= 2 || repeated.size > 0;
		return {
			id: finding.id,
			observation: finding.observation,
			interpretation: finding.interpretation,
			limitation: finding.limitation,
			claimScope: finding.claim_scope,
			applicableRuns: [...finding.applicable_runs],
			repeatedSupportRunIds: [...finding.repeated_support_run_ids],
			support: finding.support.map((entry) => evidenceView("support", entry)),
			counter: finding.counter.map((entry) => evidenceView("counter", entry)),
			contentCorrespondence: alignment.content_correspondence,
			differentiationStatus: alignment.differentiation_status,
			conditionContrast: alignment.condition_contrast,
			counterAndClaimBoundary: alignment.counter_and_claim_boundary,
			benefit: alignment.benefit,
			causation: alignment.causation,
			maxSupportedClaim: alignment.max_supported_claim,
			skillRecommendation: alignment.skill_recommendation,
			evidenceDisposition: alignment.evidence_disposition,
			skillEvidence: alignment.skill_evidence_refs.map((ref) => ({
				candidateSha256: ref.candidate_sha256,
				startLine: ref.start_line,
				endLine: ref.end_line,
				text: skill.source_lines.slice(ref.start_line - 1, ref.end_line).join("\n"),
			})),
			pairEvidence: showPairs ? touchedPairs.map((pair) => ({
				...pair,
				noSkillRelation: relation(pair.noSkill.runId, applicable, support, counter, repeated),
				withSkillRelation: relation(pair.withSkill.runId, applicable, support, counter, repeated),
			})) : [],
		};
	});

	const outcomeCounts = { no_skill: {} as Record<string, number>, with_skill: {} as Record<string, number> };
	for (const run of runs) {
		if (run.condition !== "no_skill" && run.condition !== "with_skill") throw new Error(`Unsupported report condition ${run.condition}`);
		outcomeCounts[run.condition][run.outcome] = (outcomeCounts[run.condition][run.outcome] ?? 0) + 1;
	}
	return {
		evaluation: {
			evaluationId: prepared.batch.evaluation_id,
			suite: prepared.batch.suite,
			provider: typeof prepared.batch.metadata.provider === "string" ? prepared.batch.metadata.provider : "Not available",
			model: typeof prepared.batch.metadata.model === "string" ? prepared.batch.metadata.model : "Not available",
			candidateSha256: prepared.batch.candidate_expected_sha256,
			executionHead: prepared.batch.execution_head,
			analysisStateSha256: fileSha256(options.statePath),
			analysisPhase: state.phase,
			runCount: runs.length,
			pairCount: pairs.length,
			outcomeCounts,
		},
		provenance: {
			taskSources: [...taskSources].sort(([left], [right]) => left.localeCompare(right)).map(([caseId, taskRefs]) => ({ caseId, taskRefs: [...taskRefs].sort() })),
			formalEvaluationRelativePath: repositoryRelative(formalEvaluationPath),
			formalEvaluationLocalPath: formalEvaluationPath,
			candidateBuildRef: prepared.batch.candidate_build_ref,
			candidateSkillRelativePath: slash(relative(dirname(candidateBuildPath), candidateSkillPath)),
			candidateSkillLocalPath: candidateSkillPath,
		},
		pairs,
		findings,
		runs: [...runs].sort((left, right) => left.caseId.localeCompare(right.caseId) || left.trial - right.trial || left.condition.localeCompare(right.condition)),
		followUpObservations: validated.follow_up_observations.map((entry) => entry.observation),
	};
}
