import { execFileSync } from "node:child_process";
import { accessSync, constants, existsSync, lstatSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { writeJson } from "../src/coding-task/artifacts.ts";
import type { CodingTaskRunManifest, CodingTaskSpec } from "../src/coding-task/contracts.ts";
import { runCodingTask } from "../src/coding-task/runner.ts";
import { snapshotWorkspace } from "../src/coding-task/workspace.ts";
import { fileSha256 } from "../src/hash.ts";
import { createDeepSeekCodingTaskRuntime, preflightPiRuntime } from "../src/runtime/pi-runtime.ts";
import { createDeferredCredentialFileResolverV35 } from "../src/session/real-smoke-turn-v35.ts";
import { loadAdaptiveSkillPathV3 } from "../src/skill/adapter-v3.ts";
import { parseCodingTaskConfig } from "./run-coding-task.ts";

export interface ExperienceRunOptions {
	projectRoot: string;
	runs: string[];
	credentialFile: string;
	output: string;
	json: boolean;
}

export interface ExperienceRunResult {
	status: "completed";
	planned_runs: number;
	completed_runs: number;
	output: string;
	summary: string;
	runs: Array<{
		sequence: number;
		config: string;
		run_id: string;
		run_root: string;
		execution_status: CodingTaskRunManifest["execution_status"];
		verification_status: CodingTaskRunManifest["verification_status"];
		trace: string;
		diff: string;
		verifier: string;
		manifest: string;
		report: string;
	}>;
}

type RunResult = { manifest: CodingTaskRunManifest; run_root: string };
type RunTask = (input: { sequence: number; configPath: string; task: CodingTaskSpec }) => Promise<RunResult>;

export const EXPERIENCE_RUN_HELP = `Purpose:
  Execute predefined Coding Run instances in caller-supplied order and preserve their evidence.

Required:
  --project-root <path>
  --run <coding-task-config-path>  Repeat once for every desired Run instance; order is preserved.
  --credential-file <path>        Existing file containing DEEPSEEK_API_KEY.
  --output <fresh-output-root>

Optional:
  --json
  --help

Semantics:
  Each --run invokes runCodingTask() exactly once. A completed Run with Verifier status failed is retained and execution continues. Setup, provider, runtime, IO, or not_run failure stops the sequence without retry.

Output:
  runs/<run-id>/ contains the existing Run artifacts; experience-summary.json lists every completed Run.
`;

export function parseExperienceRunArguments(argv: string[]): ExperienceRunOptions | { help: true; json: boolean } {
	const values = new Map<string, string>(); const runs: string[] = []; let json = false; let help = false;
	const valueNames = new Set(["--project-root", "--credential-file", "--output"]);
	for (let index = 0; index < argv.length; index++) {
		const argument = argv[index]!;
		if (valueNames.has(argument) || argument === "--run") {
			if (valueNames.has(argument) && values.has(argument)) throw new Error(`duplicate argument ${argument}`);
			const value = argv[++index]; if (!value) throw new Error(`${argument} requires a value`);
			if (argument === "--run") runs.push(value); else values.set(argument, value);
			continue;
		}
		if (argument === "--json") { if (json) throw new Error("duplicate argument --json"); json = true; continue; }
		if (argument === "--help") { if (help) throw new Error("duplicate argument --help"); help = true; continue; }
		throw new Error(`unknown argument ${argument}`);
	}
	if (help) return { help: true, json };
	const missing = [...valueNames].filter((name) => !values.has(name)); if (runs.length === 0) missing.push("--run");
	if (missing.length > 0) throw new Error(`missing required argument${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`);
	return { projectRoot: values.get("--project-root")!, runs, credentialFile: values.get("--credential-file")!, output: values.get("--output")!, json };
}

function freshOutput(pathValue: string): string {
	const output = resolve(pathValue);
	if (existsSync(output)) throw new Error("experience output root must not already exist");
	const parent = dirname(output); if (!existsSync(parent)) throw new Error("experience output root parent does not exist");
	const stats = lstatSync(parent); if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error("experience output root parent must be an ordinary directory");
	accessSync(parent, constants.W_OK); return output;
}

async function preflightTask(task: CodingTaskSpec, sequence: number): Promise<void> {
	const label = `Run ${sequence}`;
	if (!existsSync(task.source_root) || !lstatSync(task.source_root).isDirectory() || lstatSync(task.source_root).isSymbolicLink()) throw new Error(`${label} source_root is invalid`);
	if (!existsSync(task.verifier_spec.source_path) || !lstatSync(task.verifier_spec.source_path).isFile() || lstatSync(task.verifier_spec.source_path).isSymbolicLink()) throw new Error(`${label} Verifier source is invalid`);
	if (fileSha256(task.verifier_spec.source_path) !== task.verifier_spec.sha256) throw new Error(`${label} Verifier source digest mismatch`);
	if ((task.source_revision === undefined) === (task.existing_tree_digest === undefined)) throw new Error(`${label} requires exactly one Source identity`);
	if (task.source_revision) {
		const actual = execFileSync("git", ["-C", task.source_root, "rev-parse", "HEAD"], { encoding: "utf8", windowsHide: true }).trim();
		if (actual !== task.source_revision) throw new Error(`${label} Source revision mismatch`);
	} else if (snapshotWorkspace(task.source_root).tree_digest !== task.existing_tree_digest) throw new Error(`${label} Source existing_tree_digest mismatch`);
	if (task.skill) await loadAdaptiveSkillPathV3({ skillPath: task.skill.path, expectedSourceSha256: task.skill.expected_sha256 });
}

export async function runExperience(options: ExperienceRunOptions, dependencies: {
	runTask?: RunTask;
	runtimePreflight?: () => void;
	credentialResolverFactory?: typeof createDeferredCredentialFileResolverV35;
	onStage?: (stage: "preflight" | "coding" | "summary") => void;
} = {}): Promise<ExperienceRunResult> {
	dependencies.onStage?.("preflight");
	const projectRoot = resolve(options.projectRoot); const output = freshOutput(options.output); const runsRoot = resolve(output, "runs");
	const configs = options.runs.map((path) => resolve(path)); const tasks: CodingTaskSpec[] = [];
	for (const [index, configPath] of configs.entries()) {
		const stats = lstatSync(configPath); if (!stats.isFile() || stats.isSymbolicLink()) throw new Error(`Run ${index + 1} config is not an ordinary file`);
		const task = parseCodingTaskConfig(projectRoot, JSON.parse(readFileSync(configPath, "utf8")) as unknown, runsRoot);
		await preflightTask(task, index + 1); tasks.push(task);
	}
	let credential: string | null = null;
	if (!dependencies.runTask) {
		(dependencies.runtimePreflight ?? preflightPiRuntime)();
		credential = await (dependencies.credentialResolverFactory ?? createDeferredCredentialFileResolverV35)(resolve(options.credentialFile)).resolve();
	}
	mkdirSync(runsRoot, { recursive: true });
	const entries: ExperienceRunResult["runs"] = [];
	const runTask: RunTask = dependencies.runTask ?? (async ({ task }) => {
		const runtime = await createDeepSeekCodingTaskRuntime(credential!); return runCodingTask({ task, runtime });
	});
	dependencies.onStage?.("coding");
	for (const [index, task] of tasks.entries()) {
		let result: RunResult;
		try { result = await runTask({ sequence: index + 1, configPath: configs[index]!, task }); }
		catch (error) { throw new Error(`Experience Run ${index + 1} failed after ${entries.length}/${tasks.length} completed Runs: ${error instanceof Error ? error.message : String(error)}`); }
		const root = resolve(result.run_root); const manifest = result.manifest;
		entries.push({ sequence: index + 1, config: configs[index]!, run_id: manifest.run_id, run_root: root, execution_status: manifest.execution_status, verification_status: manifest.verification_status, trace: resolve(root, manifest.artifacts.trace), diff: resolve(root, manifest.artifacts.diff), verifier: resolve(root, manifest.artifacts.verifier_result), manifest: resolve(root, "run-manifest.json"), report: resolve(root, manifest.artifacts.report) });
		if (manifest.execution_status !== "completed" || manifest.verification_status === "not_run") throw new Error(`Experience Run ${index + 1} ended with operational status ${manifest.execution_status}/${manifest.verification_status}; stopped after ${entries.length}/${tasks.length} Runs`);
	}
	dependencies.onStage?.("summary");
	const summaryPath = resolve(output, "experience-summary.json");
	const result: ExperienceRunResult = { status: "completed", planned_runs: tasks.length, completed_runs: entries.length, output, summary: summaryPath, runs: entries };
	writeJson(summaryPath, result); return result;
}

export function formatExperienceResult(result: ExperienceRunResult, json: boolean): string {
	if (json) return `${JSON.stringify(result)}\n`;
	return `Experience execution complete\n\nRuns: ${result.completed_runs}/${result.planned_runs}\nSummary:\n${result.summary}\n\n${result.runs.map((run) => `${run.sequence}. ${run.run_id} — ${run.execution_status}/${run.verification_status}\n   ${run.run_root}`).join("\n")}\n`;
}

async function main(): Promise<void> {
	const jsonMode = process.argv.slice(2).includes("--json"); let stage = "arguments";
	try {
		const parsed = parseExperienceRunArguments(process.argv.slice(2)); if ("help" in parsed) { process.stdout.write(EXPERIENCE_RUN_HELP); return; }
		const result = await runExperience(parsed, { onStage: (next) => { stage = next; } }); process.stdout.write(formatExperienceResult(result, parsed.json));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error); if (jsonMode) process.stdout.write(`${JSON.stringify({ status: "error", stage, message })}\n`);
		process.stderr.write(`Experience execution failed (${stage}): ${message}\n`); process.exitCode = 1;
	}
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === entry) await main();
