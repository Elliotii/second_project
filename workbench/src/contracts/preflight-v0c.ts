import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { CommandDescriptor } from "../types.ts";
import { digestObject, fileSha256, treeDigest, treeInventory } from "../hash.ts";
import { resolvePublicPiImports } from "../pi/public-imports.ts";
import { SYSTEM_PROMPT_SHA256 } from "../prompts/base.ts";
import { workspacePathIdentity, workspacePathPatternsOverlap } from "../workspace/path-identity.ts";
import type {
	AgentFeedbackSchemaV0C,
	StrategySpecV0C,
	TaskSpecV0C,
} from "./v0c-types.ts";

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
	"agent_feedback_schema",
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
	"recovery_budget",
	"tool_profile_id",
	"model_profile_id",
]);
const COMMAND_KEYS = new Set(["command_id", "executable", "argv", "cwd", "timeout_seconds", "max_combined_output_bytes"]);
const VERIFIER_COMMAND_KEYS = new Set(["executable", "argv", "cwd", "timeout_ms", "output_limit_bytes"]);
const FEEDBACK_KEYS = new Set([
	"type",
	"fields",
	"max_projection_bytes",
	"max_summary_characters",
	"max_failed_checks",
	"max_failed_check_characters",
]);
const SOURCE_DIGEST_EXCLUSIONS = new Set(["task.json"]);
const SHA256 = /^[a-f0-9]{64}$/;

export const V0C_TASK_PATH = "fixtures/manifests/v0-c-parse-duration-public.json";
export const V0C_OBSERVE_STRATEGY_PATH = "fixtures/manifests/v0-c-observe-only-faux.json";
export const V0C_RECOVERY_STRATEGY_PATH = "fixtures/manifests/v0-c-recover-once-faux.json";
export const V0C_REAL_STRATEGY_PATH = "fixtures/manifests/v0-c-recover-once-deepseek-v4-flash.json";

export interface V0CPreflightPlan {
	schema_version: 1;
	mode: "dry_run" | "execution_preflight";
	task_id: string;
	strategy_id: string;
	config_digest: string;
	task_sha256: string;
	strategy_sha256: string;
	verifier_sha256: string;
	workspace_source_digest: string;
	workspace_target_template: ".runs/v0-c/runs/<generated-run-id>/workspace";
	evidence_target_template: ".runs/v0-c/runs/<generated-run-id>";
	pi_public_import: string;
	attempt_plan: { minimum: 1; maximum: 1 | 2 };
	recovery_budget: 0 | 1;
	child_start_reserve:
		| null
		| {
				provider_requests: 8;
				tool_calls: 7;
				agent_wall_time_ms: 120000;
				verifier_runs: 1;
				verifier_wall_time_ms: 30000;
				finalization_wall_time_ms: 60000;
		  };
	model_profile_id: StrategySpecV0C["model_profile_id"];
	credential_requirement: "none" | "required_only_when_separately_authorized_for_execution";
	credential_read: false;
	network_calls: 0;
	provider_calls: 0;
	formal_run_identity_created: false;
}

function assertObject(value: unknown, label: string): asserts value is Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
}

function assertExact(value: Record<string, unknown>, keys: ReadonlySet<string>, label: string): void {
	const unknown = Object.keys(value).filter((key) => !keys.has(key));
	const missing = [...keys].filter((key) => !(key in value));
	if (unknown.length > 0) throw new Error(`${label} contains unknown field(s): ${unknown.join(", ")}`);
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

function parseStringPaths(value: unknown, label: string): string[] {
	if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must be a non-empty array`);
	for (const path of value) assertRelative(path, label);
	return value as string[];
}

function parseCommand(value: unknown): CommandDescriptor {
	assertObject(value, "command descriptor");
	assertExact(value, COMMAND_KEYS, "command descriptor");
	if (value.command_id !== "test" || value.executable !== "current_node_executable" || value.cwd !== "workspace") {
		throw new Error("unsupported command descriptor");
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
		throw new Error("invalid command timeout");
	}
	if (
		!Number.isInteger(value.max_combined_output_bytes) ||
		(value.max_combined_output_bytes as number) <= 0 ||
		(value.max_combined_output_bytes as number) > 50 * 1024
	) {
		throw new Error("invalid command output budget");
	}
	return value as unknown as CommandDescriptor;
}

function parseFeedback(value: unknown): AgentFeedbackSchemaV0C | null {
	if (value === null) return null;
	assertObject(value, "agent_feedback_schema");
	assertExact(value, FEEDBACK_KEYS, "agent_feedback_schema");
	const expectedFields = ["parent_attempt_id", "verifier_id", "failure_summary", "failed_checks", "instruction"];
	if (
		value.type !== "verifier_failure" ||
		JSON.stringify(value.fields) !== JSON.stringify(expectedFields) ||
		value.max_projection_bytes !== 8192 ||
		value.max_summary_characters !== 2000 ||
		value.max_failed_checks !== 32 ||
		value.max_failed_check_characters !== 256
	) {
		throw new Error("agent_feedback_schema does not match the frozen V0-C projection");
	}
	return value as unknown as AgentFeedbackSchemaV0C;
}

function loadObject(path: string, label: string): Record<string, unknown> {
	if (!existsSync(path)) throw new Error(`${label} does not exist`);
	const value: unknown = JSON.parse(readFileSync(path, "utf8"));
	assertObject(value, label);
	return value;
}

export function preflightV0C(options: {
	projectRoot: string;
	taskPath?: string;
	strategyPath?: string;
	dryRun: boolean;
	realExecutionAuthorized?: boolean;
}): {
	task: TaskSpecV0C;
	strategy: StrategySpecV0C;
	plan: V0CPreflightPlan;
	taskPath: string;
	strategyPath: string;
	workspaceSourceRoot: string;
	verifierPath: string;
} {
	const taskPath = projectPath(options.projectRoot, options.taskPath ?? V0C_TASK_PATH, "task manifest");
	const strategyPath = projectPath(options.projectRoot, options.strategyPath ?? V0C_OBSERVE_STRATEGY_PATH, "strategy manifest");
	const taskValue = loadObject(taskPath, "TaskSpecV0C");
	assertExact(taskValue, TASK_KEYS, "TaskSpecV0C");
	if (taskValue.schema_version !== 1 || typeof taskValue.task_id !== "string" || taskValue.task_id.length === 0) {
		throw new Error("unsupported TaskSpecV0C");
	}
	for (const key of ["instruction_sha256", "workspace_source_digest", "verifier_sha256"] as const) {
		if (typeof taskValue[key] !== "string" || !SHA256.test(taskValue[key])) throw new Error(`${key} must be lowercase SHA-256`);
	}
	assertRelative(taskValue.instruction_ref, "instruction_ref");
	assertRelative(taskValue.workspace_source_ref, "workspace_source_ref");
	assertRelative(taskValue.verifier_ref, "verifier_ref");
	if (taskValue.acceptance_visibility !== "public_external" && taskValue.acceptance_visibility !== "hidden_external") {
		throw new Error("unsupported acceptance_visibility");
	}
	const feedback = parseFeedback(taskValue.agent_feedback_schema);
	if (taskValue.tool_profile_id !== "v0_bounded_local_v1") throw new Error("unsupported tool profile");
	const writable = parseStringPaths(taskValue.writable_paths, "writable_paths");
	const protectedPaths = parseStringPaths(taskValue.protected_paths, "protected_paths");
	if (new Set(writable.map(workspacePathIdentity)).size !== writable.length) throw new Error("duplicate writable path");
	if (new Set(protectedPaths.map(workspacePathIdentity)).size !== protectedPaths.length) throw new Error("duplicate protected path");
	for (const path of writable) {
		if (protectedPaths.some((candidate) => workspacePathPatternsOverlap(path, candidate))) {
			throw new Error(`writable/protected path conflict: ${path}`);
		}
	}
	if (!Array.isArray(taskValue.command_descriptors) || taskValue.command_descriptors.length !== 1) {
		throw new Error("V0-C requires one task command");
	}
	taskValue.command_descriptors.map(parseCommand);
	assertObject(taskValue.verifier_command, "verifier_command");
	assertExact(taskValue.verifier_command, VERIFIER_COMMAND_KEYS, "verifier_command");
	if (
		taskValue.verifier_command.executable !== "current_node_executable" ||
		taskValue.verifier_command.cwd !== "project" ||
		!Array.isArray(taskValue.verifier_command.argv) ||
		taskValue.verifier_command.argv.length !== 1 ||
		taskValue.verifier_command.argv[0] !== taskValue.verifier_ref ||
		taskValue.verifier_command.timeout_ms !== 30000 ||
		taskValue.verifier_command.output_limit_bytes !== 262144
	) {
		throw new Error("Verifier command does not match frozen V0-C limits");
	}

	const strategyValue = loadObject(strategyPath, "StrategySpecV0C");
	assertExact(strategyValue, STRATEGY_KEYS, "StrategySpecV0C");
	if (
		strategyValue.schema_version !== 1 ||
		typeof strategyValue.strategy_id !== "string" ||
		strategyValue.base_prompt_sha256 !== SYSTEM_PROMPT_SHA256 ||
		!Array.isArray(strategyValue.skill_refs) ||
		strategyValue.skill_refs.length !== 0 ||
		strategyValue.tool_profile_id !== taskValue.tool_profile_id
	) {
		throw new Error("unsupported or inconsistent V0-C strategy");
	}
	const observe =
		strategyValue.completion_policy_id === "observe_only" &&
		strategyValue.recovery_mode === "none" &&
		strategyValue.recovery_budget === 0;
	const recover =
		strategyValue.completion_policy_id === "verify_recover_once_same_session" &&
		strategyValue.recovery_mode === "same_session" &&
		strategyValue.recovery_budget === 1;
	if (!observe && !recover) throw new Error("invalid completion/recovery combination");
	if (
		strategyValue.model_profile_id !== "public_emitted_faux" &&
		strategyValue.model_profile_id !== "deepseek_v4_flash_real"
	) {
		throw new Error("unsupported model profile");
	}
	if (recover && (taskValue.acceptance_visibility !== "public_external" || !feedback)) {
		throw new Error("automatic recovery requires public_external acceptance and agent_feedback_schema");
	}
	if (
		strategyValue.model_profile_id === "deepseek_v4_flash_real" &&
		!options.dryRun &&
		options.realExecutionAuthorized !== true
	) {
		throw new Error("real Provider execution is not authorized");
	}
	const task = taskValue as unknown as TaskSpecV0C;
	const strategy = strategyValue as unknown as StrategySpecV0C;
	const workspaceSourceRoot = projectPath(options.projectRoot, task.workspace_source_ref, "workspace_source_ref");
	const instructionPath = projectPath(options.projectRoot, task.instruction_ref, "instruction_ref");
	const verifierPath = projectPath(options.projectRoot, task.verifier_ref, "verifier_ref");
	for (const [path, label] of [[workspaceSourceRoot, "workspace source"], [instructionPath, "instruction"], [verifierPath, "verifier"]] as const) {
		if (!existsSync(path)) throw new Error(`${label} does not exist`);
	}
	treeInventory(workspaceSourceRoot);
	if (fileSha256(instructionPath) !== task.instruction_sha256) throw new Error("instruction digest mismatch");
	if (treeDigest(workspaceSourceRoot, SOURCE_DIGEST_EXCLUSIONS) !== task.workspace_source_digest) throw new Error("workspace source digest mismatch");
	if (fileSha256(verifierPath) !== task.verifier_sha256) throw new Error("verifier digest mismatch");
	const verifierRelative = relative(workspaceSourceRoot, verifierPath);
	if (!(verifierRelative === ".." || verifierRelative.startsWith(`..${sep}`))) throw new Error("Verifier must be outside Workspace source");
	const runsRoot = resolve(options.projectRoot, ".runs/v0-c/runs");
	if (existsSync(runsRoot) && !statSync(runsRoot).isDirectory()) throw new Error("V0-C run root conflicts with a non-directory");
	const piPublicImport = resolvePublicPiImports();
	const childStartReserve = recover
		? {
				provider_requests: 8 as const,
				tool_calls: 7 as const,
				agent_wall_time_ms: 120000 as const,
				verifier_runs: 1 as const,
				verifier_wall_time_ms: 30000 as const,
				finalization_wall_time_ms: 60000 as const,
			}
		: null;
	const plan: V0CPreflightPlan = {
		schema_version: 1,
		mode: options.dryRun ? "dry_run" : "execution_preflight",
		task_id: task.task_id,
		strategy_id: strategy.strategy_id,
		config_digest: digestObject({ task, strategy }),
		task_sha256: fileSha256(taskPath),
		strategy_sha256: fileSha256(strategyPath),
		verifier_sha256: task.verifier_sha256,
		workspace_source_digest: task.workspace_source_digest,
		workspace_target_template: ".runs/v0-c/runs/<generated-run-id>/workspace",
		evidence_target_template: ".runs/v0-c/runs/<generated-run-id>",
		pi_public_import: piPublicImport,
		attempt_plan: { minimum: 1, maximum: recover ? 2 : 1 },
		recovery_budget: strategy.recovery_budget,
		child_start_reserve: childStartReserve,
		model_profile_id: strategy.model_profile_id,
		credential_requirement:
			strategy.model_profile_id === "public_emitted_faux" ? "none" : "required_only_when_separately_authorized_for_execution",
		credential_read: false,
		network_calls: 0,
		provider_calls: 0,
		formal_run_identity_created: false,
	};
	return { task, strategy, plan, taskPath, strategyPath, workspaceSourceRoot, verifierPath };
}

