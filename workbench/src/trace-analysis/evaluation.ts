import { existsSync, lstatSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { CodingTaskRunManifest } from "../coding-task/contracts.ts";
import { resolveRunRelative, validateRunRootBoundary } from "../evidence/artifacts.ts";
import type { OpaqueCredentialResolverV1 } from "../provider/fixed-provider-v1.ts";
import { determineOutcome } from "./analysis.ts";
import type { EvaluationOutcome, EvaluationRunSummary, RunDescriptor, RunLabel } from "./contracts.ts";
import type { AnalysisInvocationResult } from "./model-runner.ts";

type JsonObject = Record<string, unknown>;

export interface PlannedSkill {
	build_ref: string;
	expected_sha256: string;
}

export interface PlannedRun {
	plan_id: string;
	case_id: string;
	condition: string;
	trial: number;
	task_ref: string;
	planned_skill: PlannedSkill | null;
}

export interface BatchFreezeRecord {
	evaluation_id: string;
	suite: string;
	execution_head: string;
	candidate_build_ref: string;
	candidate_expected_sha256: string;
	planned_runs: PlannedRun[];
	metadata: Record<string, unknown>;
}

export interface EvaluationRunRef {
	plan_id: string;
	run_id: string;
	run_root?: string;
	attempt: number;
	included_for_evaluation: boolean;
	manual_invalid_reason: string | null;
}

export interface ThinEvaluationMapping {
	evaluation_id: string;
	run_refs: EvaluationRunRef[];
}

export interface EvaluatedRun extends EvaluationRunSummary {
	run_id: string;
	run_root: string;
	plan: PlannedRun;
	labels: Record<string, RunLabel>;
}

export interface ComparisonGroup {
	case_id: string;
	trial: number;
	conditions: string[];
	run_ids: string[];
}

const SHA256 = /^[a-f0-9]{64}$/;

function object(value: unknown, label: string): JsonObject {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	return value as JsonObject;
}

function string(value: unknown, label: string): string {
	if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${label} must be a non-empty string`);
	return value;
}

function positiveInteger(value: unknown, label: string): number {
	if (!Number.isSafeInteger(value) || Number(value) < 1) throw new Error(`${label} must be a positive safe integer`);
	return Number(value);
}

function sha256(value: unknown, label: string): string {
	const result = string(value, label);
	if (!SHA256.test(result)) throw new Error(`${label} must be a lowercase SHA256`);
	return result;
}

function readJson(path: string, label: string): unknown {
	return JSON.parse(readFileSync(resolve(path), "utf8")) as unknown;
}

function parsePlannedRun(value: unknown, index: number): PlannedRun {
	const input = object(value, `planned_runs[${index}]`);
	let plannedSkill: PlannedSkill | null;
	if (input.planned_skill === null) plannedSkill = null;
	else {
		const skill = object(input.planned_skill, `planned_runs[${index}].planned_skill`);
		plannedSkill = { build_ref: string(skill.build_ref, `planned_runs[${index}].planned_skill.build_ref`), expected_sha256: sha256(skill.expected_sha256, `planned_runs[${index}].planned_skill.expected_sha256`) };
	}
	return {
		plan_id: string(input.plan_id, `planned_runs[${index}].plan_id`), case_id: string(input.case_id, `planned_runs[${index}].case_id`),
		condition: string(input.condition, `planned_runs[${index}].condition`), trial: positiveInteger(input.trial, `planned_runs[${index}].trial`),
		task_ref: string(input.task_ref, `planned_runs[${index}].task_ref`), planned_skill: plannedSkill,
	};
}

export function parseBatchFreezeRecord(value: unknown): BatchFreezeRecord {
	const input = object(value, "Batch Freeze Record");
	if (!Array.isArray(input.planned_runs)) throw new Error("Batch Freeze Record planned_runs must be an array");
	const plannedRuns = input.planned_runs.map(parsePlannedRun);
	const ids = new Set<string>();
	for (const plan of plannedRuns) {
		if (ids.has(plan.plan_id)) throw new Error(`duplicate plan_id ${plan.plan_id}`);
		ids.add(plan.plan_id);
	}
	const known = new Set(["evaluation_id", "suite", "execution_head", "candidate_build_ref", "candidate_expected_sha256", "planned_runs"]);
	return {
		evaluation_id: string(input.evaluation_id, "evaluation_id"), suite: string(input.suite, "suite"), execution_head: string(input.execution_head, "execution_head"),
		candidate_build_ref: string(input.candidate_build_ref, "candidate_build_ref"), candidate_expected_sha256: sha256(input.candidate_expected_sha256, "candidate_expected_sha256"),
		planned_runs: plannedRuns, metadata: Object.fromEntries(Object.entries(input).filter(([key]) => !known.has(key))),
	};
}

export function parseThinEvaluationMapping(value: unknown): ThinEvaluationMapping {
	const input = object(value, "Thin Evaluation Mapping");
	if (!Array.isArray(input.run_refs)) throw new Error("Thin Evaluation Mapping run_refs must be an array");
	const refs = input.run_refs.map((value, index): EvaluationRunRef => {
		const entry = object(value, `run_refs[${index}]`);
		if (entry.included_for_evaluation !== undefined && typeof entry.included_for_evaluation !== "boolean") throw new Error(`run_refs[${index}].included_for_evaluation must be boolean`);
		if (entry.manual_invalid_reason !== undefined && entry.manual_invalid_reason !== null && typeof entry.manual_invalid_reason !== "string") throw new Error(`run_refs[${index}].manual_invalid_reason must be string or null`);
		return {
			plan_id: string(entry.plan_id, `run_refs[${index}].plan_id`), run_id: string(entry.run_id, `run_refs[${index}].run_id`),
			...(entry.run_root === undefined ? {} : { run_root: string(entry.run_root, `run_refs[${index}].run_root`) }),
			attempt: positiveInteger(entry.attempt, `run_refs[${index}].attempt`), included_for_evaluation: entry.included_for_evaluation ?? false,
			manual_invalid_reason: typeof entry.manual_invalid_reason === "string" && entry.manual_invalid_reason.trim().length > 0 ? entry.manual_invalid_reason.trim() : null,
		};
	});
	return { evaluation_id: string(input.evaluation_id, "evaluation_id"), run_refs: refs };
}

export function readBatchFreezeRecord(path: string): BatchFreezeRecord { return parseBatchFreezeRecord(readJson(path, "Batch Freeze Record")); }
export function readThinEvaluationMapping(path: string): ThinEvaluationMapping { return parseThinEvaluationMapping(readJson(path, "Thin Evaluation Mapping")); }

function ordinaryFile(path: string): boolean {
	if (!existsSync(path)) return false;
	const stats = lstatSync(path);
	return stats.isFile() && !stats.isSymbolicLink();
}

function actualRun(runRoot: string): { manifest: CodingTaskRunManifest; verifierStatus: unknown; missing: string[] } {
	const root = resolve(runRoot);
	const boundary = validateRunRootBoundary(root);
	if (boundary.length > 0) throw new Error(`Run root is invalid: ${boundary.join("; ")}`);
	const manifestPath = resolveRunRelative(root, "run-manifest.json");
	if (!ordinaryFile(manifestPath)) throw new Error("run-manifest.json is missing or not an ordinary file");
	const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as CodingTaskRunManifest;
	const relative = (key: keyof CodingTaskRunManifest["artifacts"]): string => {
		const value = manifest.artifacts?.[key];
		if (typeof value !== "string" || value.length === 0) return `__invalid_${key}__`;
		return value;
	};
	const paths = {
		trace: resolveRunRelative(root, relative("trace")),
		diff: ordinaryFile(resolveRunRelative(root, "diff.json")) ? resolveRunRelative(root, "diff.json") : resolveRunRelative(root, relative("diff")),
		verifier_result: resolveRunRelative(root, relative("verifier_result")),
	};
	const missing = Object.entries(paths).filter(([, path]) => !ordinaryFile(path)).map(([name]) => name);
	let verifierStatus: unknown = "not_run";
	if (!missing.includes("verifier_result")) verifierStatus = object(JSON.parse(readFileSync(paths.verifier_result, "utf8")), "verifier result").status;
	return { manifest, verifierStatus, missing };
}

function result(outcome: EvaluationOutcome, reason: string): EvaluationRunSummary {
	return { attempt: 0, includedForEvaluation: false, outcome, evaluable: outcome === "PASS" || outcome === "TASK_FAILURE", reason };
}

export function evaluatePlannedRun(batch: BatchFreezeRecord, plan: PlannedRun, ref: EvaluationRunRef, runRoot: string): EvaluationRunSummary {
	if (ref.manual_invalid_reason) return { ...result("INVALID_TRIAL", ref.manual_invalid_reason), attempt: ref.attempt, includedForEvaluation: ref.included_for_evaluation };
	const actual = actualRun(runRoot);
	const mismatch: string[] = [];
	if (actual.manifest.run_id !== ref.run_id) mismatch.push(`run_id expected ${ref.run_id} but observed ${String(actual.manifest.run_id)}`);
	if (actual.manifest.task_id !== plan.task_ref) mismatch.push(`task_ref expected ${plan.task_ref} but observed ${String(actual.manifest.task_id)}`);
	if (plan.planned_skill === null && actual.manifest.skill !== null) mismatch.push("planned no Skill but an actual Skill was loaded");
	if (plan.planned_skill !== null) {
		if (plan.planned_skill.build_ref !== batch.candidate_build_ref || plan.planned_skill.expected_sha256 !== batch.candidate_expected_sha256) mismatch.push("planned Skill does not match the frozen Candidate identity");
		if (actual.manifest.skill === null) mismatch.push("planned Skill was not loaded");
		else {
			if (typeof actual.manifest.skill.path !== "string" || actual.manifest.skill.path.length === 0) mismatch.push("actual Skill path is missing");
			if (actual.manifest.skill.actual_sha256 !== plan.planned_skill.expected_sha256) mismatch.push(`Skill SHA expected ${plan.planned_skill.expected_sha256} but observed ${String(actual.manifest.skill.actual_sha256)}`);
		}
	}
	if (mismatch.length > 0) return { ...result("INVALID_TRIAL", mismatch.join("; ")), attempt: ref.attempt, includedForEvaluation: ref.included_for_evaluation };
	const explicitInfra = actual.manifest.execution_status !== "completed" || actual.manifest.verification_status === "not_run" || actual.manifest.failure_reason !== null;
	if (explicitInfra) return { ...result("INFRA_FAILURE", `Run infrastructure status: execution=${actual.manifest.execution_status}, verification=${actual.manifest.verification_status}, failure_reason=${String(actual.manifest.failure_reason)}`), attempt: ref.attempt, includedForEvaluation: ref.included_for_evaluation };
	if (actual.missing.length > 0) return { ...result("INVALID_TRIAL", `completed Run is missing required artifacts: ${actual.missing.join(", ")}`), attempt: ref.attempt, includedForEvaluation: ref.included_for_evaluation };
	const base = determineOutcome({ executionStatus: actual.manifest.execution_status, manifestVerificationStatus: actual.manifest.verification_status, verifierStatus: actual.verifierStatus });
	return { attempt: ref.attempt, includedForEvaluation: ref.included_for_evaluation, ...base, reason: `Day 1 outcome ${base.outcome}` };
}

function scalarMetadata(metadata: Record<string, unknown>): Record<string, RunLabel> {
	return Object.fromEntries(Object.entries(metadata).filter((entry): entry is [string, RunLabel] => ["string", "number", "boolean"].includes(typeof entry[1])));
}

export function joinEvaluation(options: { batch: BatchFreezeRecord; mapping: ThinEvaluationMapping; resolveRunRoot?: (ref: EvaluationRunRef) => string | undefined }): EvaluatedRun[] {
	if (options.mapping.evaluation_id !== options.batch.evaluation_id) throw new Error("Mapping evaluation_id does not match Batch Freeze Record");
	const plans = new Map(options.batch.planned_runs.map((plan) => [plan.plan_id, plan]));
	const runIds = new Set<string>(); const attempts = new Set<string>(); const selected = new Set<string>();
	const output: EvaluatedRun[] = [];
	for (const ref of options.mapping.run_refs) {
		const plan = plans.get(ref.plan_id);
		if (!plan) throw new Error(`unknown plan_id ${ref.plan_id}`);
		if (runIds.has(ref.run_id)) throw new Error(`duplicate run_id ${ref.run_id}`);
		runIds.add(ref.run_id);
		const attemptKey = `${ref.plan_id}\u0000${ref.attempt}`;
		if (attempts.has(attemptKey)) throw new Error(`duplicate attempt ${ref.attempt} for plan_id ${ref.plan_id}`);
		attempts.add(attemptKey);
		if (ref.included_for_evaluation && selected.has(ref.plan_id)) throw new Error(`multiple included_for_evaluation Attempts for plan_id ${ref.plan_id}`);
		if (ref.included_for_evaluation) selected.add(ref.plan_id);
		const runRoot = ref.run_root ?? options.resolveRunRoot?.(ref);
		if (!runRoot) throw new Error(`Run Root cannot be resolved for run_id ${ref.run_id}`);
		const evaluation = evaluatePlannedRun(options.batch, plan, ref, resolve(runRoot));
		output.push({ run_id: ref.run_id, run_root: resolve(runRoot), plan, labels: { ...scalarMetadata(options.batch.metadata), evaluation_id: options.batch.evaluation_id, suite: options.batch.suite, case_id: plan.case_id, condition: plan.condition, trial: plan.trial }, ...evaluation });
	}
	return output;
}

export function findEvaluableComparisonGroups(runs: EvaluatedRun[]): { groups: ComparisonGroup[]; complete_case_trials: Array<{ case_id: string; trial: number }>; has_analyzable_group: boolean } {
	const buckets = new Map<string, EvaluatedRun[]>();
	for (const run of runs.filter((entry) => entry.includedForEvaluation)) {
		const key = JSON.stringify([run.plan.case_id, run.plan.trial]);
		buckets.set(key, [...(buckets.get(key) ?? []), run]);
	}
	const groups: ComparisonGroup[] = [];
	for (const bucket of buckets.values()) {
		const conditions = [...new Set(bucket.map((run) => run.plan.condition))];
		if (bucket.every((run) => run.evaluable) && conditions.length >= 2) groups.push({ case_id: bucket[0]!.plan.case_id, trial: bucket[0]!.plan.trial, conditions, run_ids: bucket.map((run) => run.run_id) });
	}
	return { groups, complete_case_trials: groups.map(({ case_id, trial }) => ({ case_id, trial })), has_analyzable_group: groups.length > 0 };
}

export function evaluatedRunDescriptors(runs: EvaluatedRun[]): RunDescriptor[] {
	return runs.map((run) => ({ runId: run.run_id, root: run.run_root, labels: { ...run.labels }, evaluation: { attempt: run.attempt, includedForEvaluation: run.includedForEvaluation, outcome: run.outcome, evaluable: run.evaluable, reason: run.reason } }));
}

export function prepareEvaluationAnalysis(options: { batchPath: string; mappingPath: string; resolveRunRoot?: (ref: EvaluationRunRef) => string | undefined }) {
	const batch = readBatchFreezeRecord(options.batchPath); const mapping = readThinEvaluationMapping(options.mappingPath);
	const evaluatedRuns = joinEvaluation({ batch, mapping, ...(options.resolveRunRoot ? { resolveRunRoot: options.resolveRunRoot } : {}) });
	const comparison = findEvaluableComparisonGroups(evaluatedRuns);
	return { batch, mapping, evaluatedRuns, comparison, descriptors: evaluatedRunDescriptors(evaluatedRuns) };
}

export async function runEvaluationAnalysis(options: {
	mode: "fresh" | "resume"; batchPath: string; mappingPath: string; outputDirectory: string; credentialResolver: OpaqueCredentialResolverV1;
	resolveRunRoot?: (ref: EvaluationRunRef) => string | undefined;
	invoke?: (options: { mode: "fresh" | "resume"; descriptors: RunDescriptor[]; outputDirectory: string; credentialResolver: OpaqueCredentialResolverV1 }) => Promise<AnalysisInvocationResult>;
}): Promise<AnalysisInvocationResult> {
	const prepared = prepareEvaluationAnalysis(options);
	if (!prepared.comparison.has_analyzable_group) throw new Error("Evaluation has no complete evaluable comparison group; Analysis Invocation was not started");
	const invoke = options.invoke ?? (await import("./model-runner.ts")).runAnalysisInvocation;
	return invoke({ mode: options.mode, descriptors: prepared.descriptors, outputDirectory: options.outputDirectory, credentialResolver: options.credentialResolver });
}
