import { readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { CodingTaskSpec } from "../src/coding-task/contracts.ts";
import { runCodingTask } from "../src/coding-task/runner.ts";
import { createDeepSeekCodingTaskRuntime, preflightPiRuntime } from "../src/runtime/pi-runtime.ts";

export interface TaskRunOptions { projectRoot: string; config: string; json: boolean }

export const TASK_RUN_HELP = `Purpose:
  Execute exactly one Coding Task in an isolated Workspace and run its External Verifier.

Required:
  --project-root <path>  Project root used to resolve config paths.
  --config <path>        Existing Coding Task config JSON.

Optional:
  --json                 Emit exactly one JSON result on stdout.
  --help

Runtime:
  PI_RUNTIME_ROOT identifies the pinned emitted Pi runtime.
  DEEPSEEK_API_KEY supplies the existing DeepSeek credential.

Output:
  The config output_root receives Session, Trace, Diff, Verifier, Manifest and Report artifacts.
`;

export function parseTaskRunArguments(argv: string[]): TaskRunOptions | { help: true; json: boolean } {
	const values = new Map<string, string>(); let json = false; let help = false;
	for (let index = 0; index < argv.length; index++) {
		const argument = argv[index]!;
		if (argument === "--project-root" || argument === "--config") {
			if (values.has(argument)) throw new Error(`duplicate argument ${argument}`);
			const value = argv[++index]; if (!value) throw new Error(`${argument} requires a value`); values.set(argument, value); continue;
		}
		if (argument === "--json") { if (json) throw new Error("duplicate argument --json"); json = true; continue; }
		if (argument === "--help") { if (help) throw new Error("duplicate argument --help"); help = true; continue; }
		throw new Error(`unknown argument ${argument}`);
	}
	if (help) return { help: true, json };
	const missing = ["--project-root", "--config"].filter((name) => !values.has(name));
	if (missing.length > 0) throw new Error(`missing required argument${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`);
	return { projectRoot: values.get("--project-root")!, config: values.get("--config")!, json };
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
	if (path !== projectRoot && !path.startsWith(`${projectRoot}\\`) && !path.startsWith(`${projectRoot}/`)) throw new Error(`${label} escapes the project root`);
	return path;
}

function skillInput(value: unknown): CodingTaskSpec["skill"] {
	if (value === undefined) return undefined;
	const skill = object(value, "skill");
	if (typeof skill.path !== "string" || !isAbsolute(skill.path)) throw new Error("skill.path must be an absolute path");
	if (typeof skill.expected_sha256 !== "string" || !/^[a-f0-9]{64}$/.test(skill.expected_sha256)) throw new Error("skill.expected_sha256 must be a lowercase SHA256");
	return { path: resolve(skill.path), expected_sha256: skill.expected_sha256 };
}

export function parseCodingTaskConfig(projectRoot: string, value: unknown, outputRoot?: string): CodingTaskSpec {
	const input = object(value, "coding task config");
	const verifier = object(input.verifier_spec, "verifier_spec");
	if (typeof input.task_id !== "string" || typeof input.prompt !== "string") throw new Error("task_id and prompt are required");
	if (typeof verifier.id !== "string" || typeof verifier.sha256 !== "string" || !Number.isSafeInteger(verifier.timeout_ms) || !Number.isSafeInteger(verifier.output_limit_bytes)) throw new Error("verifier_spec is invalid");
	if (!Array.isArray(input.command_descriptors)) throw new Error("command_descriptors must be an array");
	const configuredOutputRoot = localPath(projectRoot, input.output_root, "output_root");
	return {
		task_id: input.task_id,
		prompt: input.prompt,
		...(input.skill === undefined ? {} : { skill: skillInput(input.skill) }),
		source_root: localPath(projectRoot, input.source_root, "source_root"),
		...(typeof input.source_revision === "string" ? { source_revision: input.source_revision } : {}),
		...(typeof input.existing_tree_digest === "string" ? { existing_tree_digest: input.existing_tree_digest } : {}),
		writable_paths: strings(input.writable_paths, "writable_paths"),
		protected_paths: strings(input.protected_paths, "protected_paths"),
		command_descriptors: input.command_descriptors as CodingTaskSpec["command_descriptors"],
		verifier_spec: { id: verifier.id, source_path: localPath(projectRoot, verifier.source_path, "verifier source_path"), sha256: verifier.sha256, timeout_ms: Number(verifier.timeout_ms), output_limit_bytes: Number(verifier.output_limit_bytes) },
		output_root: outputRoot === undefined ? configuredOutputRoot : resolve(outputRoot),
		timeout_ms: Number(input.timeout_ms),
	};
}

export async function runTaskCommand(options: TaskRunOptions): Promise<Record<string, unknown>> {
	const projectRoot = resolve(options.projectRoot);
	const configPath = resolve(options.config);
	preflightPiRuntime();
	const task = parseCodingTaskConfig(projectRoot, JSON.parse(readFileSync(configPath, "utf8")) as unknown);
	const runtime = await createDeepSeekCodingTaskRuntime(process.env.DEEPSEEK_API_KEY ?? "");
	const result = await runCodingTask({ task, runtime });
	const root = result.run_root;
	return {
		run_id: result.manifest.run_id, run_root: root, execution_status: result.manifest.execution_status, verification_status: result.manifest.verification_status,
		trace: resolve(root, result.manifest.artifacts.trace), diff: resolve(root, result.manifest.artifacts.diff), verifier: resolve(root, result.manifest.artifacts.verifier_result),
		manifest: resolve(root, "run-manifest.json"), report: resolve(root, result.manifest.artifacts.report),
	};
}

function formatTaskResult(result: Record<string, unknown>, json: boolean): string {
	if (json) return `${JSON.stringify(result)}\n`;
	return `Coding Task complete\n\nRun: ${result.run_id}\nExecution: ${result.execution_status}\nVerification: ${result.verification_status}\nRun root:\n${result.run_root}\n\nTrace: ${result.trace}\nDiff: ${result.diff}\nVerifier: ${result.verifier}\nManifest: ${result.manifest}\nReport: ${result.report}\n`;
}

async function main(): Promise<void> {
	const jsonMode = process.argv.slice(2).includes("--json");
	try {
		const parsed = parseTaskRunArguments(process.argv.slice(2));
		if ("help" in parsed) { process.stdout.write(TASK_RUN_HELP); return; }
		const result = await runTaskCommand(parsed);
		process.stdout.write(formatTaskResult(result, parsed.json));
		if (result.execution_status !== "completed" || result.verification_status === "not_run") process.exitCode = 1;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (jsonMode) process.stdout.write(`${JSON.stringify({ status: "error", message })}\n`);
		process.stderr.write(`Coding Task failed: ${message}\n`);
		process.exitCode = 1;
	}
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === entry) await main();
