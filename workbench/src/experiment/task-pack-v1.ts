import { copyFileSync, cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { VerifierResultV0B } from "../contracts/v0b-types.ts";
import { validateTaskSpecV1, type TaskSpecV1 } from "../contracts/v1-types.ts";
import { artifactRef } from "../evidence/artifacts.ts";
import { fileSha256, treeDigest } from "../hash.ts";
import { createBoundedToolProfile, readProtectedBytes } from "../pi/tool-profile.ts";
import { runExternalVerifierV0B } from "../verifier/runner.ts";

const TASK_PATHS = ["fixtures/tasks/v1/parse-duration/task.json", "fixtures/tasks/v1/bounded-index/task.json", "fixtures/tasks/v1/state-transition/task.json", "fixtures/tasks/v1/stable-format/task.json"] as const;
function readJson(path: string): unknown { return JSON.parse(readFileSync(path, "utf8")); }

export function loadCandidateTaskPackV1(projectRoot: string): TaskSpecV1[] {
	return TASK_PATHS.map((path) => {
		const task = readJson(resolve(projectRoot, path)) as TaskSpecV1; validateTaskSpecV1(task);
		if (fileSha256(resolve(projectRoot, task.instruction_ref)) !== task.instruction_sha256 || treeDigest(resolve(projectRoot, task.workspace_source_ref)) !== task.workspace_source_digest || fileSha256(resolve(projectRoot, task.external_verifier_ref)) !== task.external_verifier_sha256 || fileSha256(resolve(projectRoot, task.reference_patch_ref)) !== task.reference_patch_sha256) throw new Error(`Task frozen identity drift: ${task.task_id}`);
		return task;
	});
}

function v0Adapter(task: TaskSpecV1) {
	return { schema_version: 1 as const, task_id: task.task_id, instruction_ref: task.instruction_ref, instruction_sha256: task.instruction_sha256,
		workspace_source_ref: task.workspace_source_ref, workspace_source_digest: task.workspace_source_digest, writable_paths: task.writable_paths,
		protected_paths: task.protected_paths, verifier_id: task.external_verifier_id, verifier_ref: task.external_verifier_ref,
		verifier_sha256: task.external_verifier_sha256, acceptance_visibility: "hidden_external" as const, tool_profile_id: task.tool_profile_id,
		command_descriptors: task.command_descriptors, verifier_command: { executable: "current_node_executable" as const, argv: [task.external_verifier_ref], cwd: "project" as const, timeout_ms: 15_000, output_limit_bytes: 32_768 } };
}

export async function runMeasurementVerifierV1(options: { projectRoot: string; workspaceRoot: string; task: TaskSpecV1; attemptId: string }): Promise<VerifierResultV0B> {
	const safeAttempt = options.attemptId.replace(/[^A-Za-z0-9._-]/g, "_");
	const runRoot = resolve(options.projectRoot, ".runs/v1-a/verifier-probes", `${safeAttempt}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	mkdirSync(runRoot, { recursive: true });
	const snapshot = resolve(runRoot, "verifier-snapshot.mjs"); copyFileSync(resolve(options.projectRoot, options.task.external_verifier_ref), snapshot);
	return await runExternalVerifierV0B({ projectRoot: options.projectRoot, runRoot, workspaceRoot: options.workspaceRoot, attemptId: options.attemptId,
		task: v0Adapter(options.task), verifierSnapshotPath: snapshot, verifierSnapshotRef: artifactRef(runRoot, snapshot, "text/javascript", false), workspaceEnvironmentKey: "V1_WORKSPACE" });
}

async function runPublicCheck(workspace: string, task: TaskSpecV1): Promise<number | null> {
	const profile = createBoundedToolProfile(workspace, task); const command = profile.tools.find((tool) => tool.name === "run_command");
	if (!command) throw new Error("bounded public command tool missing");
	const result = await command.execute("v1-public-check", { command_id: "public_test" }, new AbortController().signal, () => undefined, profile.context);
	const projection = JSON.parse(String(result.content[0]?.type === "text" ? result.content[0].text : "{}")) as { exit_code?: number | null };
	return projection.exit_code ?? null;
}

export function assertTaskWorkspaceBoundaryV1(task: TaskSpecV1, before: Record<string, string>, afterRoot: string): void {
	const after = readProtectedBytes(afterRoot, task);
	for (const path of task.protected_paths) if (after[path] !== before[path]) throw new Error(`protected Task file changed: ${path}`);
}

export async function calibrateTaskPackV1(projectRoot: string): Promise<Array<{ task_id: string; unmodified_public_exit: number | null; unmodified_status: string; reference_public_exit: 0; reference_status: "passed"; repeatable: true }>> {
	const results = [];
	for (const task of loadCandidateTaskPackV1(projectRoot)) {
		const root = resolve(projectRoot, ".runs/v1-a/task-calibration", `${task.task_id}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
		cpSync(resolve(projectRoot, task.workspace_source_ref), root, { recursive: true });
		const protectedBefore = readProtectedBytes(root, task);
		const unmodifiedPublic = await runPublicCheck(root, task);
		const unmodified = await runMeasurementVerifierV1({ projectRoot, workspaceRoot: root, task, attemptId: `${task.task_id}-unmodified` });
		if (unmodified.status !== "failed") throw new Error(`Unmodified task must fail external verifier: ${task.task_id}`);
		copyFileSync(resolve(projectRoot, task.reference_patch_ref), resolve(root, "src/subject.ts")); assertTaskWorkspaceBoundaryV1(task, protectedBefore, root);
		const referencePublic = await runPublicCheck(root, task); const first = await runMeasurementVerifierV1({ projectRoot, workspaceRoot: root, task, attemptId: `${task.task_id}-reference-1` });
		const second = await runMeasurementVerifierV1({ projectRoot, workspaceRoot: root, task, attemptId: `${task.task_id}-reference-2` });
		if (referencePublic !== 0 || first.status !== "passed" || second.status !== "passed") throw new Error(`Reference calibration failed: ${task.task_id}`);
		results.push({ task_id: task.task_id, unmodified_public_exit: unmodifiedPublic, unmodified_status: unmodified.status, reference_public_exit: 0 as const, reference_status: "passed" as const, repeatable: true as const });
	}
	return results;
}

export async function verifierRejectsNonsolutionV1(projectRoot: string, task: TaskSpecV1): Promise<boolean> {
	const root = resolve(projectRoot, ".runs/v1-a/task-counterexamples", `${task.task_id}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	cpSync(resolve(projectRoot, task.workspace_source_ref), root, { recursive: true });
	writeFileSync(resolve(root, "src/subject.ts"), "export const nonsolution = true;\n");
	return (await runMeasurementVerifierV1({ projectRoot, workspaceRoot: root, task, attemptId: `${task.task_id}-nonsolution` })).status === "failed";
}
