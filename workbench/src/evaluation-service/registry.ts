import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileSha256 } from "../hash.ts";
import { resolveAnalysisRequestTimeoutMs } from "../trace-analysis/runtime-config.ts";
import {
	EVALUATION_JOB_KIND,
	type CredentialProfileRegistryFile,
	type EvaluationSpecRegistryFile,
	type FormalEvaluationBinding,
	type FormalExecutorFile,
	type RegisteredEvaluationSpec,
} from "./contracts.ts";

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const GIT_ID = /^[a-f0-9]{40}$/;

function object(value: unknown, label: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, allowed: readonly string[], required: readonly string[], label: string): void {
	const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
	const missing = required.filter((key) => !(key in value));
	if (unknown.length > 0 || missing.length > 0) throw new Error(`${label} fields are invalid`);
}

function id(value: unknown, label: string): string {
	if (typeof value !== "string" || !ID.test(value)) throw new Error(`${label} is invalid`);
	return value;
}

function integer(value: unknown, label: string, minimum: number): number {
	if (!Number.isSafeInteger(value) || Number(value) < minimum) throw new Error(`${label} must be an integer >= ${minimum}`);
	return Number(value);
}

function sha(value: unknown, label: string): string {
	if (typeof value !== "string" || !SHA256.test(value)) throw new Error(`${label} must be a lowercase SHA256`);
	return value;
}

function gitId(value: unknown, label: string): string {
	if (typeof value !== "string" || !GIT_ID.test(value)) throw new Error(`${label} must be a lowercase Git object ID`);
	return value;
}

export function safeProjectPath(projectRootValue: string, pathValue: unknown, label: string): string {
	if (typeof pathValue !== "string" || pathValue.length === 0 || isAbsolute(pathValue) || pathValue.includes("\0")) throw new Error(`${label} must be a project-relative path`);
	const projectRoot = resolve(projectRootValue);
	const path = resolve(projectRoot, pathValue);
	const rel = relative(projectRoot, path);
	if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error(`${label} escapes the project root`);
	return path;
}

function ordinaryFile(path: string, label: string): void {
	if (!existsSync(path)) throw new Error(`${label} is missing`);
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink !== 1) throw new Error(`${label} must be one ordinary non-link file`);
}

function parseBinding(value: unknown, index: number): FormalEvaluationBinding {
	const input = object(value, `binding ${index + 1}`);
	exactKeys(input, ["plan_id", "config_path", "config_sha256"], ["plan_id", "config_path", "config_sha256"], `binding ${index + 1}`);
	if (typeof input.config_path !== "string" || input.config_path.length === 0 || isAbsolute(input.config_path)) throw new Error(`binding ${index + 1} config_path is invalid`);
	return { plan_id: id(input.plan_id, `binding ${index + 1} plan_id`), config_path: input.config_path, config_sha256: sha(input.config_sha256, `binding ${index + 1} config_sha256`) };
}

function parseExecutorFile(value: unknown, index: number): FormalExecutorFile {
	const input = object(value, `executor file ${index + 1}`);
	exactKeys(input, ["path", "sha256"], ["path", "sha256"], `executor file ${index + 1}`);
	if (typeof input.path !== "string" || input.path.length === 0 || isAbsolute(input.path)) throw new Error(`executor file ${index + 1} path is invalid`);
	return { path: input.path, sha256: sha(input.sha256, `executor file ${index + 1} sha256`) };
}

function parseSpec(value: unknown, index: number): RegisteredEvaluationSpec {
	const input = object(value, `spec ${index + 1}`);
	exactKeys(input, ["schema_version", "id", "kind", "enabled", "job_timeout_ms", "log_limit_bytes", "executor"], ["schema_version", "id", "kind", "enabled", "job_timeout_ms", "log_limit_bytes", "executor"], `spec ${index + 1}`);
	if (input.schema_version !== 1 || input.kind !== EVALUATION_JOB_KIND || typeof input.enabled !== "boolean") throw new Error(`spec ${index + 1} identity is invalid`);
	const jobTimeoutMs = integer(input.job_timeout_ms, `spec ${index + 1} job_timeout_ms`, 1);
	const executor = object(input.executor, `spec ${index + 1} executor`);
	if (executor.kind === "fake") {
		exactKeys(executor, ["kind", "behavior", "delay_ms", "credential_profile_id", "stdout_bytes"], ["kind", "behavior", "delay_ms", "credential_profile_id", "stdout_bytes"], `spec ${index + 1} fake executor`);
		const behaviors = new Set(["success", "task_failure", "execution_failure", "timeout", "nested_timeout", "credential_echo"]);
		if (typeof executor.behavior !== "string" || !behaviors.has(executor.behavior)) throw new Error(`spec ${index + 1} fake behavior is invalid`);
		if (executor.credential_profile_id !== null && (typeof executor.credential_profile_id !== "string" || !ID.test(executor.credential_profile_id))) throw new Error(`spec ${index + 1} credential_profile_id is invalid`);
		return {
			schema_version: 1,
			id: id(input.id, `spec ${index + 1} id`),
			kind: EVALUATION_JOB_KIND,
			enabled: input.enabled,
			job_timeout_ms: jobTimeoutMs,
			log_limit_bytes: integer(input.log_limit_bytes, `spec ${index + 1} log_limit_bytes`, 1),
			executor: {
				kind: "fake",
				behavior: executor.behavior as "success" | "task_failure" | "execution_failure" | "timeout" | "nested_timeout" | "credential_echo",
				delay_ms: integer(executor.delay_ms, `spec ${index + 1} delay_ms`, 0),
				credential_profile_id: executor.credential_profile_id as string | null,
				stdout_bytes: integer(executor.stdout_bytes, `spec ${index + 1} stdout_bytes`, 0),
			},
		};
	}
	if (executor.kind !== "formal_cli" && executor.kind !== "faux_formal_cli") throw new Error(`spec ${index + 1} executor kind is invalid`);
	const commonExecutorKeys = ["kind", "plan_path", "plan_sha256", "bindings", "credential_profile_id", "expected_workbench_commit", "expected_workbench_tree", "executor_files"];
	exactKeys(executor, executor.kind === "formal_cli" ? [...commonExecutorKeys, "analysis_request_timeout_ms"] : commonExecutorKeys, commonExecutorKeys, `spec ${index + 1} formal executor`);
	if (typeof executor.plan_path !== "string" || executor.plan_path.length === 0 || isAbsolute(executor.plan_path)) throw new Error(`spec ${index + 1} plan_path is invalid`);
	if (!Array.isArray(executor.bindings) || executor.bindings.length === 0 || !Array.isArray(executor.executor_files) || executor.executor_files.length === 0) throw new Error(`spec ${index + 1} formal arrays are invalid`);
	const bindings = executor.bindings.map(parseBinding);
	if (new Set(bindings.map((entry) => entry.plan_id)).size !== bindings.length) throw new Error(`spec ${index + 1} bindings contain duplicate plan_id`);
	const executorFiles = executor.executor_files.map(parseExecutorFile);
	if (new Set(executorFiles.map((entry) => entry.path)).size !== executorFiles.length) throw new Error(`spec ${index + 1} executor_files contain duplicate paths`);
	const formalCommon = {
		plan_path: executor.plan_path,
		plan_sha256: sha(executor.plan_sha256, `spec ${index + 1} plan_sha256`),
		bindings,
		expected_workbench_commit: gitId(executor.expected_workbench_commit, `spec ${index + 1} expected_workbench_commit`),
		expected_workbench_tree: gitId(executor.expected_workbench_tree, `spec ${index + 1} expected_workbench_tree`),
		executor_files: executorFiles,
	};
	const analysisRequestTimeoutMs = executor.kind === "formal_cli"
		? resolveAnalysisRequestTimeoutMs(executor.analysis_request_timeout_ms as number | undefined, `spec ${index + 1} analysis_request_timeout_ms`)
		: undefined;
	if (analysisRequestTimeoutMs !== undefined && analysisRequestTimeoutMs >= jobTimeoutMs) throw new Error(`spec ${index + 1} analysis_request_timeout_ms must be less than job_timeout_ms`);
	const parsedExecutor = executor.kind === "formal_cli"
		? { kind: "formal_cli" as const, ...formalCommon, credential_profile_id: id(executor.credential_profile_id, `spec ${index + 1} credential_profile_id`), analysis_request_timeout_ms: analysisRequestTimeoutMs! }
		: executor.credential_profile_id === null
			? { kind: "faux_formal_cli" as const, ...formalCommon, credential_profile_id: null }
			: (() => { throw new Error(`spec ${index + 1} faux credential_profile_id must be null`); })();
	return {
		schema_version: 1,
		id: id(input.id, `spec ${index + 1} id`),
		kind: EVALUATION_JOB_KIND,
		enabled: input.enabled,
		job_timeout_ms: jobTimeoutMs,
		log_limit_bytes: integer(input.log_limit_bytes, `spec ${index + 1} log_limit_bytes`, 1),
		executor: parsedExecutor,
	};
}

export function loadEvaluationSpecRegistry(pathValue: string): Map<string, RegisteredEvaluationSpec> {
	const path = resolve(pathValue);
	ordinaryFile(path, "Evaluation Spec registry");
	const input = object(JSON.parse(readFileSync(path, "utf8")) as unknown, "Evaluation Spec registry");
	exactKeys(input, ["schema_version", "specs"], ["schema_version", "specs"], "Evaluation Spec registry");
	if (input.schema_version !== 1 || !Array.isArray(input.specs)) throw new Error("Evaluation Spec registry is invalid");
	const parsed: EvaluationSpecRegistryFile = { schema_version: 1, specs: input.specs.map(parseSpec) };
	const output = new Map<string, RegisteredEvaluationSpec>();
	for (const spec of parsed.specs) {
		if (output.has(spec.id)) throw new Error(`duplicate Evaluation Spec ${spec.id}`);
		output.set(spec.id, spec);
	}
	return output;
}

export function loadCredentialProfiles(pathValue: string | null): Map<string, string> {
	if (pathValue === null) return new Map();
	const path = resolve(pathValue);
	ordinaryFile(path, "Credential profile registry");
	const input = object(JSON.parse(readFileSync(path, "utf8")) as unknown, "Credential profile registry");
	exactKeys(input, ["schema_version", "profiles"], ["schema_version", "profiles"], "Credential profile registry");
	if (input.schema_version !== 1 || !Array.isArray(input.profiles)) throw new Error("Credential profile registry is invalid");
	const parsed: CredentialProfileRegistryFile = { schema_version: 1, profiles: input.profiles.map((value, index) => {
		const profile = object(value, `Credential profile ${index + 1}`);
		exactKeys(profile, ["id", "file"], ["id", "file"], `Credential profile ${index + 1}`);
		if (typeof profile.file !== "string" || profile.file.length === 0) throw new Error(`Credential profile ${index + 1} file is invalid`);
		return { id: id(profile.id, `Credential profile ${index + 1} id`), file: isAbsolute(profile.file) ? resolve(profile.file) : resolve(dirname(path), profile.file) };
	}) };
	const output = new Map<string, string>();
	for (const profile of parsed.profiles) {
		if (output.has(profile.id)) throw new Error(`duplicate Credential profile ${profile.id}`);
		ordinaryFile(profile.file, `Credential profile ${profile.id}`);
		output.set(profile.id, profile.file);
	}
	return output;
}

export function validateFormalSpecFiles(projectRootValue: string, spec: RegisteredEvaluationSpec): void {
	if (spec.executor.kind === "fake") return;
	const projectRoot = resolve(projectRootValue);
	const commit = execFileSync("git", ["-C", projectRoot, "rev-parse", "HEAD"], { encoding: "utf8", windowsHide: true }).trim();
	const tree = execFileSync("git", ["-C", projectRoot, "rev-parse", "HEAD^{tree}"], { encoding: "utf8", windowsHide: true }).trim();
	if (commit !== spec.executor.expected_workbench_commit || tree !== spec.executor.expected_workbench_tree) throw new Error("registered Workbench Git identity mismatch");
	const plan = safeProjectPath(projectRoot, spec.executor.plan_path, "plan_path");
	ordinaryFile(plan, "Frozen Evaluation Plan");
	if (fileSha256(plan) !== spec.executor.plan_sha256) throw new Error("Frozen Evaluation Plan digest mismatch");
	for (const binding of spec.executor.bindings) {
		const path = safeProjectPath(projectRoot, binding.config_path, `config ${binding.plan_id}`);
		ordinaryFile(path, `config ${binding.plan_id}`);
		if (fileSha256(path) !== binding.config_sha256) throw new Error(`config ${binding.plan_id} digest mismatch`);
	}
	for (const file of spec.executor.executor_files) {
		const path = safeProjectPath(projectRoot, file.path, `executor file ${file.path}`);
		ordinaryFile(path, `executor file ${file.path}`);
		if (fileSha256(path) !== file.sha256) throw new Error(`executor file digest mismatch: ${file.path}`);
	}
}
