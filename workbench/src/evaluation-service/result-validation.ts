import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { loadAnalysisState } from "../trace-analysis/state.ts";
import { parseThinEvaluationMapping } from "../trace-analysis/evaluation.ts";
import type { ArtifactReference, EvaluationChildTerminal, RegisteredEvaluationSpec } from "./contracts.ts";
import { EvaluationJobStore } from "./job-store.ts";

function object(value: unknown, label: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	return value as Record<string, unknown>;
}

function outputArtifact(outputRootValue: string, value: unknown, label: string): string {
	if (typeof value !== "string" || value.length === 0) throw new Error(`${label} is missing`);
	const outputRoot = resolve(outputRootValue);
	const path = resolve(value);
	const rel = relative(outputRoot, path);
	if (rel === "" || rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error(`${label} escapes the Evaluation output root`);
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error(`${label} is not an ordinary file`);
	return path;
}

function findFiles(root: string, basename: string): string[] {
	const output: string[] = [];
	for (const entry of readdirSync(root, { withFileTypes: true })) {
		const path = resolve(root, entry.name);
		if (entry.isSymbolicLink()) continue;
		if (entry.isDirectory()) output.push(...findFiles(path, basename));
		else if (entry.isFile() && entry.name === basename) output.push(path);
	}
	return output.sort();
}

function inspectRunManifests(paths: readonly string[]): Array<Record<string, unknown>> {
	return paths.map((path) => {
		const manifest = object(JSON.parse(readFileSync(path, "utf8")) as unknown, "run-manifest.json");
		const execution = manifest.execution_status;
		const verification = manifest.verification_status;
		if (!new Set(["completed", "timeout", "aborted", "infrastructure_failed"]).has(String(execution))) throw new Error("run manifest execution_status is invalid");
		if (!new Set(["passed", "failed", "not_run"]).has(String(verification))) throw new Error("run manifest verification_status is invalid");
		return { run_id: manifest.run_id, execution_status: execution, verification_status: verification, failure_reason: manifest.failure_reason ?? null };
	});
}

export interface ValidatedEvaluationResult {
	publicResult: Record<string, unknown>;
	artifacts: ArtifactReference[];
}

export function validateEvaluationResult(options: { store: EvaluationJobStore; jobId: string; launchRoot: string; spec: RegisteredEvaluationSpec; child: EvaluationChildTerminal }): ValidatedEvaluationResult {
	if (options.child.reason !== "completed" || options.child.evaluation_result === null) throw new Error("evaluator did not complete");
	const outputRoot = resolve(options.launchRoot, "evaluation-output");
	if (!existsSync(outputRoot) || !lstatSync(outputRoot).isDirectory() || lstatSync(outputRoot).isSymbolicLink()) throw new Error("Evaluation output root is missing or invalid");
	const result = options.child.evaluation_result;
	if (result.status !== "human_review_ready") throw new Error("Evaluation result did not reach human_review_ready");
	if (options.spec.executor.kind === "fake") {
		const named: Array<[string, string]> = [
			["fake_manifest", outputArtifact(outputRoot, result.fake_manifest, "fake manifest")],
			["mapping", outputArtifact(outputRoot, result.mapping, "mapping")],
			["analysis_state", outputArtifact(outputRoot, result.analysis_state, "analysis state")],
			["report_markdown", outputArtifact(outputRoot, result.report_markdown, "report")],
		];
		return {
			publicResult: { evaluation_status: "human_review_ready", evaluation_id: result.evaluation_id, planned_runs: result.planned_runs, completed_runs: result.completed_runs, task_outcome: result.task_outcome, executor: "fake" },
			artifacts: named.map(([name, path]) => options.store.artifact(options.jobId, name, path)),
		};
	}
	if (options.spec.executor.kind === "formal_cli" && result.analysis_request_timeout_ms !== options.spec.executor.analysis_request_timeout_ms) throw new Error("Evaluation result Analysis request timeout does not match the registered Spec");
	const required: Array<[string, unknown]> = [
		["mapping", result.mapping], ["analysis_state", result.analysis_state], ["report_markdown", result.report_markdown], ["report_html", result.report_html], ["report_pdf", result.report_pdf],
	];
	const requiredPaths = new Map(required.map(([name, value]) => [name, outputArtifact(outputRoot, value, name)]));
	const artifacts = [...requiredPaths].map(([name, path]) => options.store.artifact(options.jobId, name, path));
	const manifests = findFiles(resolve(outputRoot, "runs"), "run-manifest.json");
	if (manifests.length !== result.completed_runs) throw new Error("run manifest count does not match completed_runs");
	const runOutcomes = inspectRunManifests(manifests);
	const mapping = parseThinEvaluationMapping(JSON.parse(readFileSync(requiredPaths.get("mapping")!, "utf8")) as unknown);
	if (mapping.evaluation_id !== result.evaluation_id || mapping.run_refs.length !== result.completed_runs) throw new Error("Mapping identity or Run count does not match the Evaluation result");
	const manifestIds = new Set(runOutcomes.map((outcome) => outcome.run_id));
	if (mapping.run_refs.some((reference) => !manifestIds.has(reference.run_id))) throw new Error("Mapping refers to a Run without a validated manifest");
	const analysis = loadAnalysisState(requiredPaths.get("analysis_state")!, { requireExplicitPhase: true });
	if (analysis.phase !== "human_review_ready") throw new Error("Analysis State did not reach human_review_ready");
	for (let index = 0; index < manifests.length; index++) artifacts.push(options.store.artifact(options.jobId, `run_manifest_${index + 1}`, manifests[index]!));
	let access: Record<string, unknown> | undefined;
	if (options.spec.executor.kind === "faux_formal_cli") {
		const metadata = outputArtifact(outputRoot, result.faux_execution_metadata, "Faux execution metadata");
		const parsed = object(JSON.parse(readFileSync(metadata, "utf8")) as unknown, "Faux execution metadata");
		if (parsed.credential_reads !== 0 || parsed.network_calls !== 0 || parsed.external_provider_calls !== 0 || parsed.real_model_calls !== 0) throw new Error("Faux execution metadata declares external access");
		artifacts.push(options.store.artifact(options.jobId, "faux_execution_metadata", metadata));
		access = { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 };
	}
	return {
		publicResult: {
			evaluation_status: "human_review_ready",
			evaluation_id: result.evaluation_id,
			planned_runs: result.planned_runs,
			completed_runs: result.completed_runs,
			review_phase: result.review_phase,
			run_outcomes: runOutcomes,
			executor: options.spec.executor.kind,
			...(options.spec.executor.kind === "formal_cli" ? { analysis_request_timeout_ms: options.spec.executor.analysis_request_timeout_ms } : {}),
			...(access ? { access } : {}),
		},
		artifacts,
	};
}
