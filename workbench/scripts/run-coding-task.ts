import { readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import type { CodingTaskSpec } from "../src/coding-task/contracts.ts";
import { runCodingTask } from "../src/coding-task/runner.ts";
import { createDeepSeekCodingTaskRuntime, preflightPiRuntime } from "../src/runtime/pi-runtime.ts";

function argument(name: string): string {
	const index = process.argv.indexOf(name);
	const value = index >= 0 ? process.argv[index + 1] : undefined;
	if (!value) throw new Error(`${name} is required`);
	return value;
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

function parseConfig(projectRoot: string, value: unknown): CodingTaskSpec {
	const input = object(value, "coding task config");
	const verifier = object(input.verifier_spec, "verifier_spec");
	if (typeof input.task_id !== "string" || typeof input.prompt !== "string") throw new Error("task_id and prompt are required");
	if (typeof verifier.id !== "string" || typeof verifier.sha256 !== "string" || !Number.isSafeInteger(verifier.timeout_ms) || !Number.isSafeInteger(verifier.output_limit_bytes)) throw new Error("verifier_spec is invalid");
	if (!Array.isArray(input.command_descriptors)) throw new Error("command_descriptors must be an array");
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
		output_root: localPath(projectRoot, input.output_root, "output_root"),
		timeout_ms: Number(input.timeout_ms),
	};
}

const projectRoot = resolve(argument("--project-root"));
const configPath = resolve(argument("--config"));
preflightPiRuntime();
const task = parseConfig(projectRoot, JSON.parse(readFileSync(configPath, "utf8")) as unknown);
const runtime = await createDeepSeekCodingTaskRuntime(process.env.DEEPSEEK_API_KEY ?? "");
const result = await runCodingTask({ task, runtime });
process.stdout.write(`${JSON.stringify({ run_id: result.manifest.run_id, run_root: result.run_root, execution_status: result.manifest.execution_status, verification_status: result.manifest.verification_status })}\n`);
if (result.manifest.execution_status !== "completed" || result.manifest.verification_status === "not_run") process.exitCode = 1;
