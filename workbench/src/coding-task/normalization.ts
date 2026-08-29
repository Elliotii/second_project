import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { readJsonArtifact, resolveRunRelative, validateRunRootBoundary } from "../evidence/artifacts.ts";
import { writeJson } from "./artifacts.ts";
import type { CodingTaskRunManifest } from "./contracts.ts";

export interface SourceRunInput {
	sourceRunPath: string;
}

export interface SourceLocation {
	file: string;
	record?: number;
}

export interface NormalizedTask {
	taskId: string;
	prompt: string;
	sourceRevision: string | null;
	existingTreeDigest: string | null;
	writablePaths: string[];
	protectedPaths: string[];
}

export interface NormalizedCodingRun {
	runId: string;
	task: NormalizedTask;
	operations: Array<{
		tool: string;
		action?: string;
		target?: string;
		status: "success" | "failure";
		source: SourceLocation;
	}>;
	tests: Array<{
		command: string;
		passed: boolean;
		source: SourceLocation;
	}>;
	changes: {
		added: string[];
		modified: string[];
		deleted: string[];
		sourceFile: string;
	};
	verifier: {
		status: "passed" | "failed" | "not_run";
		sourceFile: string;
	};
}

type JsonObject = Record<string, unknown>;
type ChangeSet = { added: string[]; modified: string[]; deleted: string[] };

function object(value: unknown, label: string): JsonObject {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	return value as JsonObject;
}

function nonEmptyString(value: unknown, label: string): string {
	if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${label} must be a non-empty string`);
	return value;
}

function nullableString(value: unknown, label: string): string | null {
	if (value === null || value === undefined) return null;
	return nonEmptyString(value, label);
}

function stringArray(value: unknown, label: string): string[] {
	if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) throw new Error(`${label} must be a string array`);
	return [...value] as string[];
}

function changes(value: unknown, label: string): ChangeSet {
	const raw = object(value, label);
	return {
		added: stringArray(raw.added, `${label}.added`),
		modified: stringArray(raw.modified, `${label}.modified`),
		deleted: stringArray(raw.deleted, `${label}.deleted`),
	};
}

function eventSequence(event: JsonObject, label: string): number {
	if (!Number.isSafeInteger(event.sequence)) throw new Error(`${label}.sequence must be a safe integer`);
	return event.sequence as number;
}

function pairedEndEvents(events: JsonObject[]): Map<string, JsonObject> {
	const ends = new Map<string, JsonObject>();
	for (const [index, event] of events.entries()) {
		if (event.phase !== "end") continue;
		const id = nonEmptyString(event.tool_call_id, `trace.events[${index}].tool_call_id`);
		if (ends.has(id)) throw new Error(`trace has duplicate end event for tool_call_id ${id}`);
		ends.set(id, event);
	}
	return ends;
}

function operationStatus(event: JsonObject, toolCallId: string): "success" | "failure" {
	if (event.status === "ok") return "success";
	if (event.status === "error") return "failure";
	throw new Error(`trace end event for tool_call_id ${toolCallId} has no explicit status`);
}

function sourceTarget(event: JsonObject): string | undefined {
	for (const field of ["target", "path", "command_id"] as const) {
		if (typeof event[field] === "string") return event[field] as string;
	}
	return undefined;
}

function extractTrace(trace: JsonObject, traceFile: string): Pick<NormalizedCodingRun, "task" | "operations" | "tests"> {
	const rawTask = object(trace.task, "trace.task");
	const sourceRevision = nullableString(rawTask.source_revision, "trace.task.source_revision");
	const existingTreeDigest = nullableString(rawTask.existing_tree_digest, "trace.task.existing_tree_digest");
	if (sourceRevision === null && existingTreeDigest === null) throw new Error("trace.task has no persisted source snapshot fact");
	const task: NormalizedTask = {
		taskId: nonEmptyString(rawTask.task_id, "trace.task.task_id"),
		prompt: nonEmptyString(rawTask.prompt, "trace.task.prompt"),
		sourceRevision,
		existingTreeDigest,
		writablePaths: stringArray(rawTask.writable_paths, "trace.task.writable_paths"),
		protectedPaths: stringArray(rawTask.protected_paths, "trace.task.protected_paths"),
	};
	if (!Array.isArray(trace.events)) throw new Error("trace.events must be an array");
	const events = trace.events.map((entry, index) => object(entry, `trace.events[${index}]`));
	const endEvents = pairedEndEvents(events);
	const starts = events
		.map((event, index) => ({ event, index, sequence: eventSequence(event, `trace.events[${index}]`) }))
		.filter(({ event }) => event.phase === "start")
		.sort((left, right) => left.sequence - right.sequence);
	const seenStarts = new Set<string>();
	const operations: NormalizedCodingRun["operations"] = [];
	const tests: NormalizedCodingRun["tests"] = [];
	for (const { event, index, sequence } of starts) {
		const toolCallId = nonEmptyString(event.tool_call_id, `trace.events[${index}].tool_call_id`);
		if (seenStarts.has(toolCallId)) throw new Error(`trace has duplicate start event for tool_call_id ${toolCallId}`);
		seenStarts.add(toolCallId);
		const end = endEvents.get(toolCallId);
		if (!end) throw new Error(`trace has no end event for tool_call_id ${toolCallId}`);
		const tool = nonEmptyString(event.tool_name, `trace.events[${index}].tool_name`);
		const status = operationStatus(end, toolCallId);
		const action = typeof event.action === "string" ? event.action : undefined;
		const target = sourceTarget(event);
		operations.push({ tool, ...(action === undefined ? {} : { action }), ...(target === undefined ? {} : { target }), status, source: { file: traceFile, record: sequence } });
		if (event.type === "test") {
			const command = nonEmptyString(event.command_id, `trace.events[${index}].command_id`);
			if (end.command_id !== command) throw new Error(`test end event for tool_call_id ${toolCallId} does not match command_id`);
			if (!Number.isSafeInteger(end.exit_code) || typeof end.timed_out !== "boolean") throw new Error(`test end event for tool_call_id ${toolCallId} has no explicit command result`);
			tests.push({ command, passed: end.exit_code === 0 && end.timed_out === false, source: { file: traceFile, record: sequence } });
		}
	}
	return { task, operations, tests };
}

function stripDiffPath(value: string, prefix: "a/" | "b/"): string {
	const path = value.trim();
	if (!path.startsWith(prefix) || path.length === prefix.length) throw new Error("diff.patch has an unsupported file header");
	return path.slice(prefix.length);
}

function changesFromPatch(patch: string): ChangeSet {
	const output: ChangeSet = { added: [], modified: [], deleted: [] };
	const blocks = patch.split(/^diff --git /m).slice(1);
	for (const block of blocks) {
		const lines = block.split(/\r?\n/);
		const oldLine = lines.find((line) => line.startsWith("--- "));
		const newLine = lines.find((line) => line.startsWith("+++ "));
		if (!oldLine || !newLine) throw new Error("diff.patch change has no complete file headers");
		const oldValue = oldLine.slice(4);
		const newValue = newLine.slice(4);
		if (oldValue === "/dev/null") output.added.push(stripDiffPath(newValue, "b/"));
		else if (newValue === "/dev/null") output.deleted.push(stripDiffPath(oldValue, "a/"));
		else {
			const oldPath = stripDiffPath(oldValue, "a/");
			const newPath = stripDiffPath(newValue, "b/");
			if (oldPath !== newPath) throw new Error("diff.patch rename cannot be projected as a single changed file");
			output.modified.push(newPath);
		}
	}
	return output;
}

function extractChanges(runRoot: string, manifest: JsonObject): NormalizedCodingRun["changes"] {
	if (manifest.changes !== undefined) return { ...changes(manifest.changes, "run-manifest.json.changes"), sourceFile: "run-manifest.json" };
	if (existsSync(resolveRunRelative(runRoot, "diff.json"))) {
		const diff = object(readJsonArtifact(runRoot, "diff.json"), "diff.json");
		if (diff.changes !== undefined) return { ...changes(diff.changes, "diff.json.changes"), sourceFile: "diff.json" };
	}
	const artifacts = object(manifest.artifacts, "run-manifest.json.artifacts");
	const patchFile = nonEmptyString(artifacts.diff, "run-manifest.json.artifacts.diff");
	const patchPath = resolveRunRelative(runRoot, patchFile);
	if (!existsSync(patchPath)) throw new Error("changed-files source is missing");
	return { ...changesFromPatch(readFileSync(patchPath, "utf8")), sourceFile: patchFile.replaceAll("\\", "/") };
}

function extractVerifier(runRoot: string, manifest: JsonObject): NormalizedCodingRun["verifier"] {
	const artifacts = object(manifest.artifacts, "run-manifest.json.artifacts");
	const sourceFile = nonEmptyString(artifacts.verifier_result, "run-manifest.json.artifacts.verifier_result").replaceAll("\\", "/");
	const result = object(readJsonArtifact(runRoot, sourceFile), sourceFile);
	if (result.status !== "passed" && result.status !== "failed" && result.status !== "not_run") throw new Error(`${sourceFile}.status is invalid`);
	return { status: result.status, sourceFile };
}

export function resolveSourceLocation(sourceRunPath: string, source: SourceLocation): string {
	const path = resolveRunRelative(sourceRunPath, source.file);
	if (!existsSync(path)) throw new Error("Source Location file is missing");
	if (source.record !== undefined) {
		if (!Number.isSafeInteger(source.record)) throw new Error("Source Location record is invalid");
		const artifact = object(readJsonArtifact(sourceRunPath, source.file), "Source Location artifact");
		if (!Array.isArray(artifact.events) || !artifact.events.some((entry) => object(entry, "Source Location event").sequence === source.record)) {
			throw new Error("Source Location record is missing");
		}
	}
	return path;
}

export function normalizeCodingRun(input: SourceRunInput, outputDirectory: string): NormalizedCodingRun {
	const runRoot = resolve(input.sourceRunPath);
	const boundaryErrors = validateRunRootBoundary(runRoot);
	if (boundaryErrors.length > 0) throw new Error(`source Run is invalid: ${boundaryErrors.join("; ")}`);
	const manifest = object(readJsonArtifact<CodingTaskRunManifest>(runRoot, "run-manifest.json"), "run-manifest.json");
	const runId = nonEmptyString(manifest.run_id, "run-manifest.json.run_id");
	const artifacts = object(manifest.artifacts, "run-manifest.json.artifacts");
	const traceFile = nonEmptyString(artifacts.trace, "run-manifest.json.artifacts.trace").replaceAll("\\", "/");
	const trace = object(readJsonArtifact(runRoot, traceFile), traceFile);
	const projected = extractTrace(trace, traceFile);
	const normalized: NormalizedCodingRun = {
		runId,
		...projected,
		changes: extractChanges(runRoot, manifest),
		verifier: extractVerifier(runRoot, manifest),
	};
	for (const entry of [...normalized.operations, ...normalized.tests]) resolveSourceLocation(runRoot, entry.source);
	writeJson(resolve(outputDirectory, `${runId}.json`), normalized);
	return normalized;
}
