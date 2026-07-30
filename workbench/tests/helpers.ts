import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { loadTaskSpec } from "../src/contracts/preflight.ts";
import { createTemporaryWorkspace } from "../src/workspace/temp-copy.ts";
import type { TaskSpecV0A } from "../src/types.ts";

export const PROJECT_ROOT = resolve(import.meta.dirname, "../..");
export const FORMAL_TASK_PATH = "fixtures/tasks/v0-a-parse-duration/task.json";
export const FORMAL_SOURCE_ROOT = resolve(PROJECT_ROOT, "fixtures/tasks/v0-a-parse-duration");

export function testCaseRoot(label: string): string {
	const root = resolve(PROJECT_ROOT, ".runs/v0-a/test-cases", `${label}-${randomUUID()}`);
	mkdirSync(root, { recursive: true });
	return root;
}

export function loadFormalTask(): TaskSpecV0A {
	return loadTaskSpec(FORMAL_TASK_PATH, PROJECT_ROOT).task;
}

export function copyFormalWorkspace(label: string, task: TaskSpecV0A = loadFormalTask()): {
	testRoot: string;
	workspaceRoot: string;
	task: TaskSpecV0A;
} {
	const testRoot = testCaseRoot(label);
	const workspaceRoot = resolve(testRoot, "workspace");
	createTemporaryWorkspace({
		projectRoot: PROJECT_ROOT,
		sourceRoot: FORMAL_SOURCE_ROOT,
		targetRoot: workspaceRoot,
		workspaceId: `test-workspace-${randomUUID()}`,
		task,
	});
	return { testRoot, workspaceRoot, task };
}
