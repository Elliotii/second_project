import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { digestObject, fileSha256, treeDigest, treeInventory } from "../hash.ts";
import { resolvePublicPiImports } from "../pi/public-imports.ts";
import { SYSTEM_PROMPT_SHA256 } from "../prompts/base.ts";
import type { CommandDescriptor } from "../types.ts";
import { workspacePathIdentity, workspacePathPatternsOverlap } from "../workspace/path-identity.ts";
import type { StrategySpecV0B, TaskSpecV0B } from "./v0b-types.ts";

const TASK_KEYS = new Set([
	"schema_version",
	"task_id",
	"instruction_ref",
	"instruction_sha256",
	"workspace_source_ref",
	"workspace_source_digest",
	"writable_paths",
	"protected_paths",
	"verifier_id",
	"verifier_ref",
	"verifier_sha256",
	"acceptance_visibility",
	"tool_profile_id",
	"command_descriptors",
	"verifier_command",
]);
const STRATEGY_KEYS = new Set([
	"schema_version",
	"strategy_id",
	"base_prompt_id",
	"base_prompt_sha256",
	"skill_refs",
	"completion_policy_id",
	"recovery_mode",
	"tool_profile_id",
	"model_profile_id",
]);
const COMMAND_KEYS = new Set([
	"command_id",
	"executable",
	"argv",
	"cwd",
	"timeout_seconds",
	"max_combined_output_bytes",
]);
const VERIFIER_COMMAND_KEYS = new Set(["executable", "argv", "cwd", "timeout_ms", "output_limit_bytes"]);
const SOURCE_DIGEST_EXCLUSIONS = new Set(["task.json"]);
const SUPPORTED_COMMAND_IDS = new Set(["test", "build", "typecheck", "lint"]);
const SHA256 = /^[a-f0-9]{64}$/;

export const V0B_TASK_PATH = "fixtures/manifests/v0-b-parse-duration.json";
export const V0B_STRATEGY_PATH = "fixtures/manifests/v0-b-observe-only-strategy.json";

function assertObject(value: unknown, label: string): asserts value is Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
}

function assertExactKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>, label: string): void {
	const unknown = Object.keys(value).filter((key) => !allowed.has(key));
	if (unknown.length > 0) throw new Error(`${label} contains unknown field(s): ${unknown.join(", ")}`);
	const missing = [...allowed].filter((key) => !(key in value));
	if (missing.length > 0) throw new Error(`${label} is missing field(s): ${missing.join(", ")}`);
}

function assertRelative(value: unknown, label: string): asserts value is string {
	if (typeof value !== "string" || value.length === 0 || value.includes("\0")) throw new Error(`${label} must be non-empty`);
	const portable = value.replaceAll("\\", "/");
	if (
		isAbsolute(value) ||
		portable.startsWith("/") ||
		portable.startsWith("//") ||
		/^[A-Za-z]:/.test(portable) ||
		/^[A-Za-z][A-Za-z0-9+.-]*:/.test(portable) ||
		portable.split("/").includes("..")
	) {
		throw new Error(`${label} must be a bounded relative path`);
	}
}

function projectPath(projectRoot: string, value: string, label: string): string {
	assertRelative(value, label);
	const absolute = resolve(projectRoot, value);
	const rel = relative(resolve(projectRoot), absolute);
	if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error(`${label} escapes project root`);
	return absolute;
}

function parsePathArray(value: unknown, label: string): string[] {
	if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must be a non-empty array`);
	for (const entry of value) assertRelative(entry, label);
	return value as string[];
}

function parseCommand(value: unknown, index: number): CommandDescriptor {
	assertObject(value, `command_descriptors[${index}]`);
	assertExactKeys(value, COMMAND_KEYS, `command_descriptors[${index}]`);
	if (typeof value.command_id !== "string" || !SUPPORTED_COMMAND_IDS.has(value.command_id)) {
		throw new Error(`unsupported command ID: ${String(value.command_id)}`);
	}
	if (value.executable !== "current_node_executable" || value.cwd !== "workspace") {
		throw new Error("task commands must use current_node_executable in workspace");
	}
	if (!Array.isArray(value.argv) || value.argv.length === 0 || value.argv.some((entry) => typeof entry !== "string")) {
		throw new Error("command argv must be a non-empty string array");
	}
	for (const argument of value.argv as string[]) {
		const portable = argument.replaceAll("\\", "/");
		if (
			argument.includes("\0") ||
			/^(?:powershell|pwsh|cmd|bash|sh|curl|wget|npm|npx|pnpm|yarn|bun|pip|pip3)(?:\.exe|\.cmd)?$/i.test(argument) ||
			/^(?:-e|--eval|--input-type|--import)$/.test(argument) ||
			/^(?:https?|ftp):/i.test(argument) ||
			/^[A-Za-z]:/.test(portable) ||
			portable.startsWith("/") ||
			portable.startsWith("//") ||
			portable.split("/").includes("..") ||
			/[;&|<>`]/.test(argument)
		) {
			throw new Error(`forbidden command argument: ${argument}`);
		}
	}
	if (!Number.isInteger(value.timeout_seconds) || (value.timeout_seconds as number) <= 0 || (value.timeout_seconds as number) > 30) {
		throw new Error("command timeout_seconds must be in (0, 30]");
	}
	if (
		!Number.isInteger(value.max_combined_output_bytes) ||
		(value.max_combined_output_bytes as number) <= 0 ||
		(value.max_combined_output_bytes as number) > 50 * 1024
	) {
		throw new Error("command output budget must be in (0, 51200]");
	}
	return value as unknown as CommandDescriptor;
}

function loadJson(path: string, label: string): Record<string, unknown> {
	if (!existsSync(path)) throw new Error(`${label} does not exist`);
	const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
	assertObject(parsed, label);
	return parsed;
}

export interface V0BPreflightPlan {
	schema_version: 1;
	mode: "dry_run" | "execution_preflight";
	task_id: string;
	strategy_id: string;
	config_digest: string;
	task_sha256: string;
	strategy_sha256: string;
	verifier_sha256: string;
	workspace_source_digest: string;
	workspace_target_template: ".runs/v0-b/runs/<generated-run-id>/workspace";
	evidence_target_template: ".runs/v0-b/runs/<generated-run-id>";
	pi_public_import: string;
	real_model_budget: 0;
	recovery_budget: 0;
	formal_run_identity_created: false;
	provider_calls: 0;
}

export function preflightV0B(options: {
	projectRoot: string;
	taskPath?: string;
	strategyPath?: string;
	dryRun: boolean;
}): {
	task: TaskSpecV0B;
	strategy: StrategySpecV0B;
	plan: V0BPreflightPlan;
	workspaceSourceRoot: string;
	taskPath: string;
	strategyPath: string;
	verifierPath: string;
} {
	const taskPath = projectPath(options.projectRoot, options.taskPath ?? V0B_TASK_PATH, "task manifest");
	const strategyPath = projectPath(options.projectRoot, options.strategyPath ?? V0B_STRATEGY_PATH, "strategy manifest");
	const parsedTask = loadJson(taskPath, "TaskSpecV0B");
	assertExactKeys(parsedTask, TASK_KEYS, "TaskSpecV0B");
	if (parsedTask.schema_version !== 1) throw new Error("unsupported TaskSpecV0B schema_version");
	for (const key of ["task_id", "verifier_id", "tool_profile_id"] as const) {
		if (typeof parsedTask[key] !== "string" || parsedTask[key].length === 0) throw new Error(`${key} must be non-empty`);
	}
	for (const key of ["instruction_sha256", "workspace_source_digest", "verifier_sha256"] as const) {
		if (typeof parsedTask[key] !== "string" || !SHA256.test(parsedTask[key])) throw new Error(`${key} must be lowercase SHA-256`);
	}
	if (parsedTask.acceptance_visibility !== "hidden_external" && parsedTask.acceptance_visibility !== "public_external") {
		throw new Error("unsupported acceptance_visibility");
	}
	if (parsedTask.tool_profile_id !== "v0_bounded_local_v1") throw new Error("unsupported V0-B tool_profile_id");
	const writablePaths = parsePathArray(parsedTask.writable_paths, "writable_paths");
	const protectedPaths = parsePathArray(parsedTask.protected_paths, "protected_paths");
	if (new Set(writablePaths.map(workspacePathIdentity)).size !== writablePaths.length) throw new Error("duplicate writable path");
	if (new Set(protectedPaths.map(workspacePathIdentity)).size !== protectedPaths.length) throw new Error("duplicate protected path");
	for (const writablePath of writablePaths) {
		if (protectedPaths.some((protectedPath) => workspacePathPatternsOverlap(writablePath, protectedPath))) {
			throw new Error(`writable/protected path conflict: ${writablePath}`);
		}
	}
	if (!Array.isArray(parsedTask.command_descriptors) || parsedTask.command_descriptors.length === 0) {
		throw new Error("command_descriptors must be non-empty");
	}
	const commands = parsedTask.command_descriptors.map(parseCommand);
	if (new Set(commands.map((entry) => entry.command_id)).size !== commands.length) throw new Error("duplicate command ID");
	assertRelative(parsedTask.instruction_ref, "instruction_ref");
	assertRelative(parsedTask.workspace_source_ref, "workspace_source_ref");
	assertRelative(parsedTask.verifier_ref, "verifier_ref");
	assertObject(parsedTask.verifier_command, "verifier_command");
	assertExactKeys(parsedTask.verifier_command, VERIFIER_COMMAND_KEYS, "verifier_command");
	if (
		parsedTask.verifier_command.executable !== "current_node_executable" ||
		parsedTask.verifier_command.cwd !== "project" ||
		!Array.isArray(parsedTask.verifier_command.argv) ||
		parsedTask.verifier_command.argv.length !== 1 ||
		parsedTask.verifier_command.argv[0] !== parsedTask.verifier_ref
	) {
		throw new Error("verifier command identity is not frozen");
	}
	if (
		!Number.isInteger(parsedTask.verifier_command.timeout_ms) ||
		(parsedTask.verifier_command.timeout_ms as number) <= 0 ||
		(parsedTask.verifier_command.timeout_ms as number) > 30_000
	) {
		throw new Error("verifier timeout must be in (0, 30000]");
	}
	if (
		!Number.isInteger(parsedTask.verifier_command.output_limit_bytes) ||
		(parsedTask.verifier_command.output_limit_bytes as number) <= 0 ||
		(parsedTask.verifier_command.output_limit_bytes as number) > 262_144
	) {
		throw new Error("verifier output limit must be in (0, 262144]");
	}

	const parsedStrategy = loadJson(strategyPath, "StrategySpecV0B");
	assertExactKeys(parsedStrategy, STRATEGY_KEYS, "StrategySpecV0B");
	if (
		parsedStrategy.schema_version !== 1 ||
		parsedStrategy.strategy_id !== "v0_observe_only_faux" ||
		parsedStrategy.base_prompt_sha256 !== SYSTEM_PROMPT_SHA256 ||
		!Array.isArray(parsedStrategy.skill_refs) ||
		parsedStrategy.skill_refs.length !== 0 ||
		parsedStrategy.completion_policy_id !== "observe_only" ||
		parsedStrategy.recovery_mode !== "none" ||
		parsedStrategy.tool_profile_id !== parsedTask.tool_profile_id ||
		parsedStrategy.model_profile_id !== "public_emitted_faux"
	) {
		throw new Error("unsupported or inconsistent V0-B strategy");
	}

	const task = parsedTask as unknown as TaskSpecV0B;
	const strategy = parsedStrategy as unknown as StrategySpecV0B;
	const workspaceSourceRoot = projectPath(options.projectRoot, task.workspace_source_ref, "workspace_source_ref");
	const instructionPath = projectPath(options.projectRoot, task.instruction_ref, "instruction_ref");
	const verifierPath = projectPath(options.projectRoot, task.verifier_ref, "verifier_ref");
	for (const [path, label] of [
		[workspaceSourceRoot, "workspace source"],
		[instructionPath, "instruction"],
		[verifierPath, "verifier"],
	] as const) {
		if (!existsSync(path)) throw new Error(`${label} does not exist`);
	}
	treeInventory(workspaceSourceRoot);
	if (fileSha256(instructionPath) !== task.instruction_sha256) throw new Error("instruction digest mismatch");
	if (treeDigest(workspaceSourceRoot, SOURCE_DIGEST_EXCLUSIONS) !== task.workspace_source_digest) {
		throw new Error("workspace source digest mismatch");
	}
	if (fileSha256(verifierPath) !== task.verifier_sha256) throw new Error("verifier digest mismatch");
	const verifierRelativeToSource = relative(workspaceSourceRoot, verifierPath);
	if (!(verifierRelativeToSource === ".." || verifierRelativeToSource.startsWith(`..${sep}`))) {
		throw new Error("verifier must be outside Workspace source");
	}
	const runsRoot = resolve(options.projectRoot, ".runs/v0-b/runs");
	if (existsSync(runsRoot) && !statSync(runsRoot).isDirectory()) throw new Error("V0-B run root conflicts with a non-directory");
	const piPublicImport = resolvePublicPiImports();
	const taskSha256 = fileSha256(taskPath);
	const strategySha256 = fileSha256(strategyPath);
	const plan: V0BPreflightPlan = {
		schema_version: 1,
		mode: options.dryRun ? "dry_run" : "execution_preflight",
		task_id: task.task_id,
		strategy_id: strategy.strategy_id,
		config_digest: digestObject({ task, strategy }),
		task_sha256: taskSha256,
		strategy_sha256: strategySha256,
		verifier_sha256: task.verifier_sha256,
		workspace_source_digest: task.workspace_source_digest,
		workspace_target_template: ".runs/v0-b/runs/<generated-run-id>/workspace",
		evidence_target_template: ".runs/v0-b/runs/<generated-run-id>",
		pi_public_import: piPublicImport,
		real_model_budget: 0,
		recovery_budget: 0,
		formal_run_identity_created: false,
		provider_calls: 0,
	};
	return { task, strategy, plan, workspaceSourceRoot, taskPath, strategyPath, verifierPath };
}
