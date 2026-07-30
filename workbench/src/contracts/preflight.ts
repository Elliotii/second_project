import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { digestObject, fileSha256, treeDigest, treeInventory } from "../hash.ts";
import { FAUX_SEQUENCE_SHA256 } from "../pi/faux-sequence.ts";
import { resolvePublicPiImports } from "../pi/public-imports.ts";
import { SYSTEM_PROMPT_ID, SYSTEM_PROMPT_SHA256 } from "../prompts/base.ts";
import type { CommandDescriptor, PreflightPlanV0A, StrategySpecV0A, TaskSpecV0A } from "../types.ts";
import { workspacePathIdentity, workspacePathPatternsOverlap } from "../workspace/path-identity.ts";

const TASK_KEYS = new Set([
	"schema_version",
	"task_id",
	"instruction_ref",
	"instruction_sha256",
	"workspace_source_ref",
	"workspace_source_digest",
	"writable_paths",
	"protected_paths",
	"tool_profile_id",
	"command_descriptors",
]);
const COMMAND_KEYS = new Set([
	"command_id",
	"executable",
	"argv",
	"cwd",
	"timeout_seconds",
	"max_combined_output_bytes",
]);
const SUPPORTED_COMMAND_IDS = new Set(["test", "build", "typecheck", "lint"]);
const TASK_SPEC_DIGEST_EXCLUSIONS = new Set(["task.json"]);

export const V0A_STRATEGY: StrategySpecV0A = {
	strategy_id: "v0a_faux_single_cycle",
	provider: "public_faux",
	system_prompt_id: "project_minimal_base_v1",
	skill_refs: [],
	completion_policy: "foundation_single_cycle_no_external_verifier",
	recovery_budget: 0,
};

function assertObject(value: unknown, label: string): asserts value is Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
}

function assertExactKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>, label: string): void {
	const unknown = Object.keys(value).filter((key) => !allowed.has(key));
	if (unknown.length > 0) throw new Error(`${label} contains unknown field(s): ${unknown.join(", ")}`);
	const missing = [...allowed].filter((key) => !(key in value));
	if (missing.length > 0) throw new Error(`${label} is missing field(s): ${missing.join(", ")}`);
}

function assertPlainRelativePath(value: unknown, label: string): asserts value is string {
	if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be a non-empty string`);
	const portable = value.replaceAll("\\", "/");
	if (
		value.includes("\0") ||
		isAbsolute(value) ||
		portable.startsWith("/") ||
		portable.startsWith("//") ||
		/^[A-Za-z]:/.test(portable) ||
		/^[A-Za-z][A-Za-z0-9+.-]*:/.test(portable) ||
		portable.split("/").includes("..")
	) {
		throw new Error(`${label} must be a bounded relative path: ${value}`);
	}
}

function parseStringArray(value: unknown, label: string): string[] {
	if (!Array.isArray(value) || value.length === 0 || value.some((entry) => typeof entry !== "string")) {
		throw new Error(`${label} must be a non-empty string array`);
	}
	for (const entry of value) assertPlainRelativePath(entry, label);
	return value as string[];
}

function parseCommand(value: unknown, index: number): CommandDescriptor {
	assertObject(value, `command_descriptors[${index}]`);
	assertExactKeys(value, COMMAND_KEYS, `command_descriptors[${index}]`);
	if (typeof value.command_id !== "string" || !SUPPORTED_COMMAND_IDS.has(value.command_id)) {
		throw new Error(`unsupported command ID: ${String(value.command_id)}`);
	}
	if (value.executable !== "current_node_executable") throw new Error("only current_node_executable is supported");
	if (!Array.isArray(value.argv) || value.argv.length === 0 || value.argv.some((entry) => typeof entry !== "string" || entry.length === 0)) {
		throw new Error("command argv must be a non-empty string array");
	}
	const forbiddenCommandToken =
		/^(?:powershell|pwsh|cmd|bash|sh|curl|wget|npm|npx|pnpm|yarn|bun|pip|pip3)(?:\.exe|\.cmd)?$/i;
	for (const argument of value.argv) {
		const portable = argument.replaceAll("\\", "/");
		if (
			argument.includes("\0") ||
			forbiddenCommandToken.test(argument) ||
			/^(?:-e|--eval|--input-type|--import)$/.test(argument) ||
			/^(?:https?|ftp):/i.test(argument) ||
			/^[A-Za-z]:/.test(portable) ||
			portable.startsWith("/") ||
			portable.startsWith("//") ||
			portable.split("/").includes("..") ||
			/[;&|<>`]/.test(argument) ||
			/^(?:install|add|serve|start|daemon|listen)$/i.test(argument)
		) {
			throw new Error(`forbidden command argument: ${argument}`);
		}
	}
	if (value.cwd !== "workspace") throw new Error("command cwd must be workspace");
	if (typeof value.timeout_seconds !== "number" || value.timeout_seconds <= 0 || value.timeout_seconds > 30) {
		throw new Error("command timeout_seconds must be in (0, 30]");
	}
	if (
		typeof value.max_combined_output_bytes !== "number" ||
		value.max_combined_output_bytes <= 0 ||
		value.max_combined_output_bytes > 50 * 1024
	) {
		throw new Error("command output budget must be in (0, 51200]");
	}
	return value as unknown as CommandDescriptor;
}

export function loadTaskSpec(taskPath: string, projectRoot: string): { task: TaskSpecV0A; taskPath: string } {
	const absoluteTaskPath = resolve(projectRoot, taskPath);
	const taskRelative = relative(resolve(projectRoot), absoluteTaskPath);
	if (taskRelative === ".." || taskRelative.startsWith(`..${sep}`) || isAbsolute(taskRelative)) {
		throw new Error("task spec path escapes project root");
	}
	if (!existsSync(absoluteTaskPath)) throw new Error(`task spec does not exist: ${taskPath}`);
	const parsed: unknown = JSON.parse(readFileSync(absoluteTaskPath, "utf8"));
	assertObject(parsed, "TaskSpecV0A");
	assertExactKeys(parsed, TASK_KEYS, "TaskSpecV0A");
	if (parsed.schema_version !== 1) throw new Error("unsupported task schema_version");
	for (const key of ["task_id", "instruction_sha256", "workspace_source_digest"] as const) {
		if (typeof parsed[key] !== "string" || parsed[key].length === 0) throw new Error(`${key} must be a non-empty string`);
	}
	if (!/^[a-f0-9]{64}$/.test(parsed.instruction_sha256 as string)) throw new Error("instruction_sha256 must be lowercase SHA-256");
	if (!/^[a-f0-9]{64}$/.test(parsed.workspace_source_digest as string)) {
		throw new Error("workspace_source_digest must be lowercase SHA-256");
	}
	assertPlainRelativePath(parsed.instruction_ref, "instruction_ref");
	assertPlainRelativePath(parsed.workspace_source_ref, "workspace_source_ref");
	const writable = parseStringArray(parsed.writable_paths, "writable_paths");
	const protectedPaths = parseStringArray(parsed.protected_paths, "protected_paths");
	if (new Set(writable.map(workspacePathIdentity)).size !== writable.length) throw new Error("duplicate writable path");
	if (new Set(protectedPaths.map(workspacePathIdentity)).size !== protectedPaths.length) {
		throw new Error("duplicate protected path");
	}
	if (parsed.tool_profile_id !== "v0a_bounded_local") throw new Error("unsupported tool_profile_id");
	if (!Array.isArray(parsed.command_descriptors) || parsed.command_descriptors.length === 0) {
		throw new Error("command_descriptors must be a non-empty array");
	}
	const commands = parsed.command_descriptors.map(parseCommand);
	if (new Set(commands.map((entry) => entry.command_id)).size !== commands.length) {
		throw new Error("duplicate command ID");
	}
	for (const writablePath of writable) {
		if (protectedPaths.some((protectedPath) => workspacePathPatternsOverlap(protectedPath, writablePath))) {
			throw new Error(`writable/protected path conflict: ${writablePath}`);
		}
	}
	return { task: parsed as unknown as TaskSpecV0A, taskPath: absoluteTaskPath };
}

function ensureProjectRelative(projectRoot: string, path: string, label: string): string {
	const absolute = resolve(projectRoot, path);
	const rel = relative(resolve(projectRoot), absolute);
	if (rel.startsWith(`..${sep}`) || rel === ".." || isAbsolute(rel)) throw new Error(`${label} escapes project root`);
	return absolute;
}

export async function preflight(options: {
	projectRoot: string;
	taskPath: string;
	strategyId: string;
	dryRun: boolean;
}): Promise<{ task: TaskSpecV0A; plan: PreflightPlanV0A; workspaceSourceRoot: string; taskPath: string }> {
	if (options.strategyId !== V0A_STRATEGY.strategy_id) throw new Error(`unsupported strategy: ${options.strategyId}`);
	const { task, taskPath } = loadTaskSpec(options.taskPath, options.projectRoot);
	const workspaceSourceRoot = ensureProjectRelative(options.projectRoot, task.workspace_source_ref, "workspace_source_ref");
	if (!existsSync(workspaceSourceRoot)) throw new Error(`workspace source does not exist: ${task.workspace_source_ref}`);
	treeInventory(workspaceSourceRoot);
	const instructionPath = ensureProjectRelative(workspaceSourceRoot, task.instruction_ref, "instruction_ref");
	if (!existsSync(instructionPath)) throw new Error(`instruction does not exist: ${task.instruction_ref}`);
	const observedInstructionDigest = fileSha256(instructionPath);
	if (observedInstructionDigest !== task.instruction_sha256) throw new Error("instruction digest mismatch");
	const observedSourceDigest = treeDigest(workspaceSourceRoot, TASK_SPEC_DIGEST_EXCLUSIONS);
	if (observedSourceDigest !== task.workspace_source_digest) throw new Error("workspace source digest mismatch");
	const runsRoot = resolve(options.projectRoot, ".runs/v0-a/runs");
	if (existsSync(runsRoot) && !statSync(runsRoot).isDirectory()) throw new Error("V0-A run root conflicts with a non-directory");

	let piPublicImport: string;
	try {
		piPublicImport = resolvePublicPiImports();
	} catch (error) {
		throw new Error("public Pi Adapter imports are not resolvable", { cause: error });
	}
	const configDigest = digestObject({
		task,
		strategy: V0A_STRATEGY,
		prompt: { id: SYSTEM_PROMPT_ID, sha256: SYSTEM_PROMPT_SHA256 },
		faux_sequence_sha256: FAUX_SEQUENCE_SHA256,
	});
	const plan: PreflightPlanV0A = {
		schema_version: 1,
		mode: options.dryRun ? "dry_run" : "execution_preflight",
		task_id: task.task_id,
		strategy: V0A_STRATEGY,
		config_digest: configDigest,
		instruction_sha256: observedInstructionDigest,
		workspace_source_digest: observedSourceDigest,
		workspace_source_root: relative(options.projectRoot, workspaceSourceRoot).split(sep).join("/"),
		workspace_target_template: ".runs/v0-a/runs/<generated-run-id>/workspace",
		evidence_target_template: ".runs/v0-a/runs/<generated-run-id>",
		pi_public_import: piPublicImport,
		real_model_budget: 0,
		recovery_budget: 0,
		formal_run_identity_created: false,
		provider_calls: 0,
	};
	return { task, plan, workspaceSourceRoot, taskPath };
}

export const WORKSPACE_DIGEST_EXCLUSIONS = TASK_SPEC_DIGEST_EXCLUSIONS;
