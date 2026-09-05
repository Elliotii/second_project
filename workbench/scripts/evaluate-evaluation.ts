import { execFileSync } from "node:child_process";
import { accessSync, constants, existsSync, lstatSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { writeJson } from "../src/coding-task/artifacts.ts";
import type { CodingTaskRunManifest, CodingTaskSpec } from "../src/coding-task/contracts.ts";
import { runCodingTask } from "../src/coding-task/runner.ts";
import { snapshotWorkspace } from "../src/coding-task/workspace.ts";
import { fileSha256 } from "../src/hash.ts";
import { createDeepSeekCodingTaskRuntime, preflightPiRuntime } from "../src/runtime/pi-runtime.ts";
import { createDeferredCredentialFileResolverV35 } from "../src/session/real-smoke-turn-v35.ts";
import { loadAdaptiveSkillPathV3 } from "../src/skill/adapter-v3.ts";
import { loadFrozenSkillEvidenceFromEvaluation } from "../src/trace-analysis/controlled-unblind.ts";
import { parseThinEvaluationMapping, readBatchFreezeRecord, type PlannedRun, type ThinEvaluationMapping } from "../src/trace-analysis/evaluation.ts";
import { reviewEvaluation, type ReviewResult } from "./review-evaluation.ts";

export interface EvaluateCliOptions {
	projectRoot: string;
	plan: string;
	bindings: Array<{ planId: string; configPath: string }>;
	credentialFile: string;
	output: string;
	json: boolean;
}

export interface EvaluateResult {
	status: "human_review_ready";
	evaluation_id: string;
	planned_runs: number;
	completed_runs: number;
	mapping: string;
	review_phase: "human_review_ready";
	analysis_state: string;
	total_process_view_bytes: number;
	base_a_invocations: number;
	max_a_invocations: number;
	a_invocations: number;
	report_markdown: string;
	report_html: string;
	report_pdf: string;
}

type RunResult = { manifest: CodingTaskRunManifest; run_root: string };
type RunTask = (input: { plan: PlannedRun; task: CodingTaskSpec }) => Promise<RunResult>;

export const EVALUATE_HELP = `Purpose:
  Execute one existing frozen Skill Evaluation and produce final review artifacts.

  This command does not create an Evaluation Plan and does not retry failed operations.

Required:
  --project-root <path>
  --plan <path>
  --bind <plan_id>=<coding-task-config-path>  (repeat once per planned run)
  --credential-file <path>
  --output <new-path>

Optional:
  --json
  --help
`;

export function parseEvaluateArguments(argv: string[]): EvaluateCliOptions | { help: true; json: boolean } {
	const values = new Map<string, string>();
	const bindings: Array<{ planId: string; configPath: string }> = [];
	let json = false;
	let help = false;
	const valueNames = new Set(["--project-root", "--plan", "--credential-file", "--output"]);
	for (let index = 0; index < argv.length; index++) {
		const argument = argv[index]!;
		if (valueNames.has(argument)) {
			if (values.has(argument)) throw new Error(`duplicate argument ${argument}`);
			const value = argv[++index];
			if (value === undefined || value.length === 0) throw new Error(`${argument} requires a value`);
			values.set(argument, value);
			continue;
		}
		if (argument === "--bind") {
			const value = argv[++index];
			if (value === undefined) throw new Error("--bind requires <plan_id>=<config-path>");
			const separator = value.indexOf("=");
			if (separator < 1 || separator === value.length - 1) throw new Error("--bind requires <plan_id>=<config-path>");
			bindings.push({ planId: value.slice(0, separator), configPath: value.slice(separator + 1) });
			continue;
		}
		if (argument === "--json") {
			if (json) throw new Error("duplicate argument --json");
			json = true;
			continue;
		}
		if (argument === "--help") {
			if (help) throw new Error("duplicate argument --help");
			help = true;
			continue;
		}
		throw new Error(`unknown argument ${argument}`);
	}
	if (help) return { help: true, json };
	const missing = [...valueNames].filter((name) => !values.has(name));
	if (bindings.length === 0) missing.push("--bind");
	if (missing.length > 0) throw new Error(`missing required argument${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`);
	return {
		projectRoot: values.get("--project-root")!, plan: values.get("--plan")!, bindings,
		credentialFile: values.get("--credential-file")!, output: values.get("--output")!, json,
	};
}

function object(value: unknown, label: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	return value as Record<string, unknown>;
}

function strings(value: unknown, label: string): string[] {
	if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) throw new Error(`${label} must be a string array`);
	return value;
}

function localPath(projectRoot: string, value: unknown, label: string): string {
	if (typeof value !== "string" || value.length === 0 || isAbsolute(value)) throw new Error(`${label} must be a non-empty project-relative path`);
	const path = resolve(projectRoot, value);
	const rel = relative(projectRoot, path);
	if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error(`${label} escapes the project root`);
	return path;
}

function parseTaskConfig(projectRoot: string, configPath: string, runsRoot: string): CodingTaskSpec {
	const input = object(JSON.parse(readFileSync(configPath, "utf8")) as unknown, "coding task config");
	const verifier = object(input.verifier_spec, "verifier_spec");
	if (typeof input.task_id !== "string" || typeof input.prompt !== "string") throw new Error("task_id and prompt are required");
	if (typeof verifier.id !== "string" || typeof verifier.sha256 !== "string" || !Number.isSafeInteger(verifier.timeout_ms) || !Number.isSafeInteger(verifier.output_limit_bytes)) throw new Error("verifier_spec is invalid");
	if (!Array.isArray(input.command_descriptors)) throw new Error("command_descriptors must be an array");
	let skill: CodingTaskSpec["skill"];
	if (input.skill !== undefined) {
		const value = object(input.skill, "skill");
		if (typeof value.path !== "string" || !isAbsolute(value.path)) throw new Error("skill.path must be an absolute path");
		if (typeof value.expected_sha256 !== "string" || !/^[a-f0-9]{64}$/.test(value.expected_sha256)) throw new Error("skill.expected_sha256 must be a lowercase SHA256");
		skill = { path: resolve(value.path), expected_sha256: value.expected_sha256 };
	}
	localPath(projectRoot, input.output_root, "output_root");
	return {
		task_id: input.task_id,
		prompt: input.prompt,
		...(skill ? { skill } : {}),
		source_root: localPath(projectRoot, input.source_root, "source_root"),
		...(typeof input.source_revision === "string" ? { source_revision: input.source_revision } : {}),
		...(typeof input.existing_tree_digest === "string" ? { existing_tree_digest: input.existing_tree_digest } : {}),
		writable_paths: strings(input.writable_paths, "writable_paths"),
		protected_paths: strings(input.protected_paths, "protected_paths"),
		command_descriptors: input.command_descriptors as CodingTaskSpec["command_descriptors"],
		verifier_spec: {
			id: verifier.id, source_path: localPath(projectRoot, verifier.source_path, "verifier source_path"), sha256: verifier.sha256,
			timeout_ms: Number(verifier.timeout_ms), output_limit_bytes: Number(verifier.output_limit_bytes),
		},
		output_root: runsRoot,
		timeout_ms: Number(input.timeout_ms),
	};
}

async function validateTaskBeforeExecution(plan: PlannedRun, task: CodingTaskSpec): Promise<void> {
	if (task.task_id !== plan.task_ref) throw new Error(`plan_id ${plan.plan_id} task_ref does not match config task_id`);
	if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(task.task_id)) throw new Error(`plan_id ${plan.plan_id} task_id is invalid`);
	if (!task.prompt || Buffer.byteLength(task.prompt, "utf8") > 64 * 1024) throw new Error(`plan_id ${plan.plan_id} task prompt is invalid`);
	if ((task.source_revision === undefined) === (task.existing_tree_digest === undefined)) throw new Error(`plan_id ${plan.plan_id} requires exactly one Source identity`);
	if (!Number.isSafeInteger(task.timeout_ms) || task.timeout_ms < 1 || task.timeout_ms > 900_000) throw new Error(`plan_id ${plan.plan_id} task timeout is invalid`);
	if (task.writable_paths.length === 0 || task.command_descriptors.length === 0) throw new Error(`plan_id ${plan.plan_id} task path or command policy is empty`);
	if (!existsSync(task.source_root) || !lstatSync(task.source_root).isDirectory() || lstatSync(task.source_root).isSymbolicLink()) throw new Error(`plan_id ${plan.plan_id} source_root is invalid`);
	if (!existsSync(task.verifier_spec.source_path) || !lstatSync(task.verifier_spec.source_path).isFile() || lstatSync(task.verifier_spec.source_path).isSymbolicLink()) throw new Error(`plan_id ${plan.plan_id} verifier source is invalid`);
	if (fileSha256(task.verifier_spec.source_path) !== task.verifier_spec.sha256) throw new Error(`plan_id ${plan.plan_id} Verifier source digest mismatch`);
	if (task.source_revision) {
		const actual = execFileSync("git", ["-C", task.source_root, "rev-parse", "HEAD"], { encoding: "utf8", windowsHide: true }).trim();
		if (actual !== task.source_revision) throw new Error(`plan_id ${plan.plan_id} Source revision mismatch`);
	} else if (snapshotWorkspace(task.source_root).tree_digest !== task.existing_tree_digest) throw new Error(`plan_id ${plan.plan_id} Source existing_tree_digest mismatch`);
	if (plan.planned_skill === null && task.skill !== undefined) throw new Error(`plan_id ${plan.plan_id} config supplies an unplanned Skill`);
	if (plan.planned_skill !== null) {
		if (!task.skill || task.skill.expected_sha256 !== plan.planned_skill.expected_sha256) throw new Error(`plan_id ${plan.plan_id} config does not match the planned Skill identity`);
		await loadAdaptiveSkillPathV3({ skillPath: task.skill.path, expectedSourceSha256: task.skill.expected_sha256 });
	}
}

function validateOutputRoot(pathValue: string): string {
	const output = resolve(pathValue);
	if (existsSync(output)) throw new Error("evaluate output root must not already exist");
	const parent = dirname(output);
	if (!existsSync(parent)) throw new Error("evaluate output root parent does not exist");
	const stats = lstatSync(parent);
	if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error("evaluate output root parent must be an ordinary directory");
	accessSync(parent, constants.W_OK);
	return output;
}

function bindConfigs(plans: PlannedRun[], bindings: EvaluateCliOptions["bindings"]): Map<string, string> {
	const known = new Set(plans.map((plan) => plan.plan_id));
	const output = new Map<string, string>();
	for (const binding of bindings) {
		if (!known.has(binding.planId)) throw new Error(`unknown plan_id binding ${binding.planId}`);
		if (output.has(binding.planId)) throw new Error(`duplicate binding for plan_id ${binding.planId}`);
		output.set(binding.planId, resolve(binding.configPath));
	}
	const missing = plans.filter((plan) => !output.has(plan.plan_id)).map((plan) => plan.plan_id);
	if (missing.length > 0) throw new Error(`missing config binding for plan_id: ${missing.join(", ")}`);
	return output;
}

export async function evaluateEvaluation(options: EvaluateCliOptions, dependencies: {
	runTask?: RunTask;
	review?: typeof reviewEvaluation;
	runtimePreflight?: () => void;
	onStage?: (stage: "preflight" | "coding" | "mapping" | "review") => void;
} = {}): Promise<EvaluateResult> {
	dependencies.onStage?.("preflight");
	const projectRoot = resolve(options.projectRoot);
	const planPath = resolve(options.plan);
	const credentialFile = resolve(options.credentialFile);
	const output = validateOutputRoot(options.output);
	const runsRoot = resolve(output, "runs");
	const mappingPath = resolve(output, "mapping", "thin-evaluation-mapping.json");
	const reviewRoot = resolve(output, "review");
	const plan = readBatchFreezeRecord(planPath);
	const bindings = bindConfigs(plan.planned_runs, options.bindings);
	await loadFrozenSkillEvidenceFromEvaluation(planPath);
	createDeferredCredentialFileResolverV35(credentialFile);
	const tasks = new Map<string, CodingTaskSpec>();
	for (const planned of plan.planned_runs) {
		if (planned.planned_skill !== null && (planned.planned_skill.build_ref !== plan.candidate_build_ref || planned.planned_skill.expected_sha256 !== plan.candidate_expected_sha256)) throw new Error(`plan_id ${planned.plan_id} planned Skill does not match the frozen Candidate identity`);
		const task = parseTaskConfig(projectRoot, bindings.get(planned.plan_id)!, runsRoot);
		await validateTaskBeforeExecution(planned, task);
		tasks.set(planned.plan_id, task);
	}
	if (!dependencies.runTask) {
		(dependencies.runtimePreflight ?? (() => { preflightPiRuntime(); }))();
		if (!process.env.DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY is required for Coding Runs");
	}
	mkdirSync(runsRoot, { recursive: true });
	const refs: ThinEvaluationMapping["run_refs"] = [];
	const runTask: RunTask = dependencies.runTask ?? (async ({ task }) => {
		const runtime = await createDeepSeekCodingTaskRuntime(process.env.DEEPSEEK_API_KEY ?? "");
		return runCodingTask({ task, runtime });
	});
	dependencies.onStage?.("coding");
	for (const planned of plan.planned_runs) {
		let result: RunResult;
		try {
			result = await runTask({ plan: planned, task: tasks.get(planned.plan_id)! });
		} catch (error) {
			throw new Error(`Coding execution failed for plan_id ${planned.plan_id} after ${refs.length}/${plan.planned_runs.length} completed Runs: ${error instanceof Error ? error.message : String(error)}`);
		}
		refs.push({ plan_id: planned.plan_id, run_id: result.manifest.run_id, run_root: resolve(result.run_root), attempt: 1, included_for_evaluation: true, manual_invalid_reason: null });
	}
	dependencies.onStage?.("mapping");
	const mapping = parseThinEvaluationMapping({ evaluation_id: plan.evaluation_id, run_refs: refs });
	writeJson(mappingPath, mapping);
	dependencies.onStage?.("review");
	const review = dependencies.review ?? reviewEvaluation;
	const reviewed: ReviewResult = await review({ plan: planPath, mapping: mappingPath, credentialFile, output: reviewRoot, dryRun: false, json: options.json });
	if (reviewed.status !== "human_review_ready" || reviewed.a_invocations === undefined || reviewed.analysis_state === undefined || reviewed.report_markdown === undefined || reviewed.report_html === undefined || reviewed.report_pdf === undefined) throw new Error("review did not return complete human_review_ready artifacts");
	return {
		status: "human_review_ready", evaluation_id: plan.evaluation_id, planned_runs: plan.planned_runs.length, completed_runs: refs.length,
		mapping: mappingPath, review_phase: reviewed.status, analysis_state: reviewed.analysis_state,
		total_process_view_bytes: reviewed.total_process_view_bytes, base_a_invocations: reviewed.base_a_invocations,
		max_a_invocations: reviewed.max_a_invocations, a_invocations: reviewed.a_invocations,
		report_markdown: reviewed.report_markdown, report_html: reviewed.report_html, report_pdf: reviewed.report_pdf,
	};
}

export function formatEvaluateResult(result: EvaluateResult, json: boolean): string {
	if (json) return `${JSON.stringify(result)}\n`;
	return `Evaluation complete\n\nEvaluation: ${result.evaluation_id}\nRuns: ${result.completed_runs}/${result.planned_runs}\nStatus: ${result.review_phase}\n\nMapping:\n${result.mapping}\n\nAnalysis State:\n${result.analysis_state}\n\nMarkdown:\n${result.report_markdown}\n\nHTML:\n${result.report_html}\n\nPDF:\n${result.report_pdf}\n`;
}

async function main(): Promise<void> {
	const jsonMode = process.argv.slice(2).includes("--json");
	let stage = "arguments";
	try {
		const parsed = parseEvaluateArguments(process.argv.slice(2));
		if ("help" in parsed) {
			process.stdout.write(EVALUATE_HELP);
			return;
		}
		const result = await evaluateEvaluation(parsed, { onStage: (next) => { stage = next; } });
		process.stdout.write(formatEvaluateResult(result, parsed.json));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (jsonMode) process.stdout.write(`${JSON.stringify({ status: "error", stage, message })}\n`);
		else process.stderr.write(`Evaluation failed (${stage}): ${message}\n`);
		process.exitCode = 1;
	}
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === entry) await main();
