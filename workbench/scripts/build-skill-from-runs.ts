import { accessSync, constants, existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { prepareSourceRunSet } from "../src/coding-task/source-run-set.ts";
import { preflightPiRuntime } from "../src/runtime/pi-runtime.ts";
import { buildSkillCandidate } from "../src/skill-build/build.ts";
import type { SkillBuildArtifact, SkillBuildRequest, SkillBuildResult } from "../src/skill-build/contracts.ts";
import { loadSourceRunSet } from "../src/skill-build/source-loader.ts";

const MODEL = "deepseek/deepseek-v4-flash";

export interface BuildSkillFromRunsOptions {
	taskFamily: string;
	sourceRuns: string[];
	buildId: string;
	output: string;
	json: boolean;
}

export interface BuildSkillFromRunsResult {
	task_family: string;
	source_run_count: number;
	source_run_ids: string[];
	source_run_set: string;
	build_id: string;
	build_status: SkillBuildResult["status"];
	build_json: string;
	candidate_spec?: string;
	skill?: string;
	skill_sha256?: string;
	error?: { code: string; message: string };
}

type BuildCandidate = (request: SkillBuildRequest) => Promise<SkillBuildResult>;

export const BUILD_SKILL_FROM_RUNS_HELP = `Purpose:
  Build one Candidate Skill from an explicitly selected set of existing Source Runs.

Required:
  --task-family <id>
  --source-run <run-root>  Repeat for each selected evidence-valid Run; order is preserved.
  --build-id <id>
  --output <fresh-output-root>

Optional:
  --json
  --help

Credential:
  DEEPSEEK_API_KEY is resolved by the existing induction runtime.
  PI_RUNTIME_ROOT must identify the existing pinned emitted Pi runtime.

Output:
  source-set/ contains normalized evidence; build/ contains build.json and, when built, CandidateSpec and SKILL.md with its SHA.
`;

export function parseBuildSkillFromRunsArguments(argv: string[]): BuildSkillFromRunsOptions | { help: true; json: boolean } {
	const values = new Map<string, string>();
	const sourceRuns: string[] = [];
	const flags = new Set<string>();
	const singleValueNames = new Set(["--task-family", "--build-id", "--output"]);
	const flagNames = new Set(["--json", "--help"]);
	for (let index = 0; index < argv.length; index++) {
		const argument = argv[index]!;
		if (singleValueNames.has(argument) || argument === "--source-run") {
			if (singleValueNames.has(argument) && values.has(argument)) throw new Error(`duplicate argument ${argument}`);
			const value = argv[++index];
			if (value === undefined || value.length === 0) throw new Error(`${argument} requires a value`);
			if (argument === "--source-run") sourceRuns.push(value);
			else values.set(argument, value);
			continue;
		}
		if (flagNames.has(argument)) {
			if (flags.has(argument)) throw new Error(`duplicate argument ${argument}`);
			flags.add(argument);
			continue;
		}
		throw new Error(`unknown argument ${argument}`);
	}
	if (flags.has("--help")) return { help: true, json: flags.has("--json") };
	const missing = [...singleValueNames].filter((name) => !values.has(name));
	if (missing.length > 0) throw new Error(`missing required argument${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`);
	return {
		taskFamily: values.get("--task-family")!,
		sourceRuns,
		buildId: values.get("--build-id")!,
		output: values.get("--output")!,
		json: flags.has("--json"),
	};
}

function validateOutputRoot(pathValue: string): string {
	const output = resolve(pathValue);
	if (existsSync(output)) {
		const stats = lstatSync(output);
		if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error("output root must be an ordinary directory");
		if (readdirSync(output).length !== 0) throw new Error("output root must be empty");
		accessSync(output, constants.W_OK);
		return output;
	}
	const parent = dirname(output);
	if (!existsSync(parent)) throw new Error("output root parent does not exist");
	const stats = lstatSync(parent);
	if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error("output root parent must be an ordinary directory");
	accessSync(parent, constants.W_OK);
	return output;
}

function validateExplicitInputs(options: BuildSkillFromRunsOptions): { output: string; sourceRuns: string[] } {
	if (options.taskFamily.trim().length === 0) throw new Error("task family must be non-empty");
	if (options.buildId.trim().length === 0) throw new Error("build ID must be non-empty");
	if (options.sourceRuns.length < 1) throw new Error("at least one --source-run value is required");
	const sourceRuns = options.sourceRuns.map((path) => resolve(path));
	if (new Set(sourceRuns.map((path) => path.toLowerCase())).size !== sourceRuns.length) throw new Error("source Run paths must be unique");
	return { output: validateOutputRoot(options.output), sourceRuns };
}

export async function buildSkillFromRuns(options: BuildSkillFromRunsOptions, dependencies: {
	buildCandidate?: BuildCandidate;
	preflightRuntime?: () => void;
	onStage?: (stage: "preflight" | "induction") => void;
} = {}): Promise<BuildSkillFromRunsResult> {
	dependencies.onStage?.("preflight");
	const validated = validateExplicitInputs(options);
	const sourceSetRoot = resolve(validated.output, "source-set");
	const buildRoot = resolve(validated.output, "build");
	prepareSourceRunSet({ taskFamily: options.taskFamily, runs: validated.sourceRuns.map((sourceRunPath) => ({ sourceRunPath })) }, sourceSetRoot);
	const sourceRunSetPath = resolve(sourceSetRoot, "source-runs.json");
	const loaded = loadSourceRunSet(sourceRunSetPath);
	(dependencies.preflightRuntime ?? (() => {
		preflightPiRuntime();
		if (!process.env.DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY is required for Candidate induction");
	}))();
	dependencies.onStage?.("induction");
	const build = await (dependencies.buildCandidate ?? buildSkillCandidate)({
		buildId: options.buildId,
		sourceRunSetPath,
		outputDirectory: buildRoot,
		model: MODEL,
	});
	const artifact = JSON.parse(readFileSync(build.buildPath, "utf8")) as SkillBuildArtifact;
	if (build.error?.code === "model_request_failed" || (build.error?.code === "skill_build_invalid" && artifact.validation.issues.length === 0)) {
		throw new Error(`Candidate build execution failed: ${build.error.message}`);
	}
	const result: BuildSkillFromRunsResult = {
		task_family: loaded.taskFamily,
		source_run_count: loaded.sourceRunIds.length,
		source_run_ids: [...loaded.sourceRunIds],
		source_run_set: sourceRunSetPath,
		build_id: options.buildId,
		build_status: build.status,
		build_json: build.buildPath,
		...(build.error ? { error: build.error } : {}),
	};
	if (build.status === "built") {
		if (!build.specPath || !build.skillPath || artifact.skill_sha256 === null) throw new Error("built result is missing Candidate artifacts or Skill SHA");
		result.candidate_spec = build.specPath;
		result.skill = build.skillPath;
		result.skill_sha256 = artifact.skill_sha256;
	}
	return result;
}

export function formatBuildSkillFromRunsResult(result: BuildSkillFromRunsResult, json: boolean): string {
	if (json) return `${JSON.stringify(result)}\n`;
	const candidate = result.build_status === "built"
		? `\nCandidateSpec:\n${result.candidate_spec}\n\nSKILL.md:\n${result.skill}\n\nSkill SHA-256:\n${result.skill_sha256}\n`
		: result.error ? `\nBuild detail: ${result.error.code}: ${result.error.message}\n` : "";
	return `Candidate induction complete\n\nTask family: ${result.task_family}\nSource Runs: ${result.source_run_count}\nRun IDs:\n${result.source_run_ids.map((id) => `- ${id}`).join("\n")}\n\nSourceRunSet:\n${result.source_run_set}\n\nBuild ID: ${result.build_id}\nBuild status: ${result.build_status}\nBuild JSON:\n${result.build_json}\n${candidate}`;
}

async function main(): Promise<void> {
	const jsonMode = process.argv.slice(2).includes("--json");
	let stage = "arguments";
	try {
		const parsed = parseBuildSkillFromRunsArguments(process.argv.slice(2));
		if ("help" in parsed) {
			process.stdout.write(BUILD_SKILL_FROM_RUNS_HELP);
			return;
		}
		const result = await buildSkillFromRuns(parsed, { onStage: (next) => { stage = next; } });
		process.stdout.write(formatBuildSkillFromRunsResult(result, parsed.json));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (jsonMode) process.stdout.write(`${JSON.stringify({ status: "error", stage, message })}\n`);
		process.stderr.write(`Candidate induction failed (${stage}): ${message}\n`);
		process.exitCode = 1;
	}
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === entry) await main();
