import { readFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import type { NormalizedCodingRun } from "../coding-task/normalization.ts";
import type { LoadedSourceRunSet } from "./contracts.ts";

type JsonObject = Record<string, unknown>;

function object(value: unknown, label: string): JsonObject {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	return value as JsonObject;
}

function string(value: unknown, label: string): string {
	if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${label} must be a non-empty string`);
	return value;
}

function strings(value: unknown, label: string): string[] {
	if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) throw new Error(`${label} must be a string array`);
	return [...value] as string[];
}

function contained(root: string, path: string): boolean {
	const rel = relative(root, path);
	return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

function source(value: unknown, label: string): NormalizedCodingRun["operations"][number]["source"] {
	const raw = object(value, label);
	const file = string(raw.file, `${label}.file`);
	if (raw.record !== undefined && !Number.isSafeInteger(raw.record)) throw new Error(`${label}.record must be a safe integer`);
	return { file, ...(raw.record === undefined ? {} : { record: raw.record as number }) };
}

export function parseNormalizedCodingRun(value: unknown, label: string): NormalizedCodingRun {
	const raw = object(value, label);
	const task = object(raw.task, `${label}.task`);
	const changes = object(raw.changes, `${label}.changes`);
	const verifier = object(raw.verifier, `${label}.verifier`);
	if (!Array.isArray(raw.operations) || !Array.isArray(raw.tests)) throw new Error(`${label} operations/tests must be arrays`);
	if (verifier.status !== "passed" && verifier.status !== "failed" && verifier.status !== "not_run") throw new Error(`${label}.verifier.status is invalid`);
	const operations = raw.operations.map((entry, index) => {
		const operation = object(entry, `${label}.operations[${index}]`);
		if (operation.status !== "success" && operation.status !== "failure") throw new Error(`${label}.operations[${index}].status is invalid`);
		return {
			tool: string(operation.tool, `${label}.operations[${index}].tool`),
			...(operation.action === undefined ? {} : { action: string(operation.action, `${label}.operations[${index}].action`) }),
			...(operation.target === undefined ? {} : { target: string(operation.target, `${label}.operations[${index}].target`) }),
			status: operation.status,
			source: source(operation.source, `${label}.operations[${index}].source`),
		} satisfies NormalizedCodingRun["operations"][number];
	});
	const tests = raw.tests.map((entry, index) => {
		const test = object(entry, `${label}.tests[${index}]`);
		if (typeof test.passed !== "boolean") throw new Error(`${label}.tests[${index}].passed must be boolean`);
		return { command: string(test.command, `${label}.tests[${index}].command`), passed: test.passed, source: source(test.source, `${label}.tests[${index}].source`) };
	});
	return {
		runId: string(raw.runId, `${label}.runId`),
		task: {
			taskId: string(task.taskId, `${label}.task.taskId`),
			prompt: string(task.prompt, `${label}.task.prompt`),
			sourceRevision: task.sourceRevision === null ? null : string(task.sourceRevision, `${label}.task.sourceRevision`),
			existingTreeDigest: task.existingTreeDigest === null ? null : string(task.existingTreeDigest, `${label}.task.existingTreeDigest`),
			writablePaths: strings(task.writablePaths, `${label}.task.writablePaths`),
			protectedPaths: strings(task.protectedPaths, `${label}.task.protectedPaths`),
		},
		operations,
		tests,
		changes: {
			added: strings(changes.added, `${label}.changes.added`),
			modified: strings(changes.modified, `${label}.changes.modified`),
			deleted: strings(changes.deleted, `${label}.changes.deleted`),
			sourceFile: string(changes.sourceFile, `${label}.changes.sourceFile`),
		},
		verifier: { status: verifier.status, sourceFile: string(verifier.sourceFile, `${label}.verifier.sourceFile`) },
	};
}

export function loadSourceRunSet(path: string): LoadedSourceRunSet {
	const absolutePath = resolve(path);
	const root = dirname(absolutePath);
	const raw = object(JSON.parse(readFileSync(absolutePath, "utf8")) as unknown, "SourceRunSet");
	const taskFamily = string(raw.taskFamily, "SourceRunSet.taskFamily");
	if (!Array.isArray(raw.sourceRuns) || raw.sourceRuns.length < 2) throw new Error("SourceRunSet must contain at least two source Runs");
	const sourceRunIds: string[] = [];
	const runs: NormalizedCodingRun[] = [];
	for (const [index, entry] of raw.sourceRuns.entries()) {
		const ref = object(entry, `SourceRunSet.sourceRuns[${index}]`);
		const sourceRunId = string(ref.sourceRunId, `SourceRunSet.sourceRuns[${index}].sourceRunId`);
		if (string(ref.taskFamily, `SourceRunSet.sourceRuns[${index}].taskFamily`) !== taskFamily) throw new Error(`source Run ${sourceRunId} task family mismatch`);
		if (ref.historicalVerifierStatus !== "passed") throw new Error(`source Run ${sourceRunId} historical Verifier status is not passed`);
		const normalizedPath = resolve(root, string(ref.normalizedRunPath, `SourceRunSet.sourceRuns[${index}].normalizedRunPath`));
		if (!contained(root, normalizedPath)) throw new Error(`source Run ${sourceRunId} normalizedRunPath escapes SourceRunSet directory`);
		const run = parseNormalizedCodingRun(JSON.parse(readFileSync(normalizedPath, "utf8")) as unknown, `NormalizedCodingRun ${sourceRunId}`);
		if (run.runId !== sourceRunId) throw new Error(`source Run ${sourceRunId} normalized identity mismatch`);
		if (run.verifier.status !== "passed") throw new Error(`source Run ${sourceRunId} normalized Verifier status is not passed`);
		sourceRunIds.push(sourceRunId);
		runs.push(run);
	}
	if (new Set(sourceRunIds).size !== sourceRunIds.length) throw new Error("SourceRunSet source Run IDs must be unique");
	return { path: absolutePath, taskFamily, sourceRunIds, runs };
}
