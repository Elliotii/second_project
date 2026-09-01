import { existsSync, lstatSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { CodingTaskRunManifest, ExecutionStatus, VerificationStatus } from "../coding-task/contracts.ts";
import { resolveRunRelative, validateRunRootBoundary } from "../evidence/artifacts.ts";
import type {
	AnalysisContext,
	EvidenceLocator,
	EvidenceRead,
	LoadedRun,
	OutcomeResult,
	RunDescriptor,
	TraceArtifact,
	TraceEvent,
	TraceQuery,
	TraceSearchResult,
} from "./contracts.ts";

type JsonObject = Record<string, unknown>;

function object(value: unknown, label: string): JsonObject {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	return value as JsonObject;
}

function readRequiredText(runRoot: string, relativePath: string, label: string): { path: string; text: string } {
	let path: string;
	try {
		path = resolveRunRelative(runRoot, relativePath);
	} catch (error) {
		throw new Error(`${label}: ${error instanceof Error ? error.message : "invalid artifact path"}`);
	}
	if (!existsSync(path)) throw new Error(`${label} is missing`);
	const stats = lstatSync(path);
	if (!stats.isFile() || stats.isSymbolicLink()) throw new Error(`${label} is not an ordinary file`);
	return { path, text: readFileSync(path, "utf8") };
}

function artifactPath(manifest: CodingTaskRunManifest, key: keyof CodingTaskRunManifest["artifacts"]): string {
	const value = manifest.artifacts[key];
	if (typeof value !== "string" || value.length === 0) throw new Error(`run-manifest.json.artifacts.${key} is invalid`);
	return value;
}

function parseTrace(text: string): TraceArtifact {
	const raw = object(JSON.parse(text), "trace.json");
	if (!Array.isArray(raw.events)) throw new Error("trace.json.events must be an array");
	const events = raw.events.map((entry, index) => {
		const event = object(entry, `trace.json.events[${index}]`);
		if (!Number.isSafeInteger(event.sequence)) throw new Error(`trace.json.events[${index}].sequence must be a safe integer`);
		if (typeof event.type !== "string" || event.type.length === 0) throw new Error(`trace.json.events[${index}].type must be a non-empty string`);
		return event as TraceEvent;
	});
	return { ...raw, events } as TraceArtifact;
}

export function determineOutcome(input: {
	executionStatus: ExecutionStatus;
	manifestVerificationStatus: VerificationStatus;
	verifierStatus: unknown;
}): OutcomeResult {
	if (input.executionStatus === "completed" && input.manifestVerificationStatus === "passed" && input.verifierStatus === "passed") {
		return { outcome: "PASS", evaluable: true };
	}
	if (input.executionStatus === "completed" && input.manifestVerificationStatus === "failed" && input.verifierStatus === "failed") {
		return { outcome: "TASK_FAILURE", evaluable: true };
	}
	return { outcome: "INFRA_FAILURE", evaluable: false };
}

export function readRunArtifacts(descriptor: RunDescriptor): LoadedRun {
	const runRoot = resolve(descriptor.root);
	const boundaryErrors = validateRunRootBoundary(runRoot);
	if (boundaryErrors.length > 0) throw new Error(`Run ${descriptor.runId} root is invalid: ${boundaryErrors.join("; ")}`);
	const manifestRead = readRequiredText(runRoot, "run-manifest.json", "run-manifest.json");
	const manifest = JSON.parse(manifestRead.text) as CodingTaskRunManifest;
	if (manifest.run_id !== descriptor.runId) {
		throw new Error(`RunDescriptor runId ${descriptor.runId} does not match manifest run_id ${String(manifest.run_id)}`);
	}
	const traceRead = readRequiredText(runRoot, artifactPath(manifest, "trace"), "trace artifact");
	const diffRelative = existsSync(resolveRunRelative(runRoot, "diff.json")) ? "diff.json" : artifactPath(manifest, "diff");
	const diffRead = readRequiredText(runRoot, diffRelative, "diff artifact");
	const verifierResultRead = readRequiredText(runRoot, artifactPath(manifest, "verifier_result"), "verifier result");
	const verifierOutputRead = readRequiredText(runRoot, "verifier/output.txt", "verifier output");
	const reportRead = readRequiredText(runRoot, artifactPath(manifest, "report"), "report");
	return {
		descriptor: { ...descriptor, root: runRoot, labels: { ...descriptor.labels } },
		manifest,
		trace: parseTrace(traceRead.text),
		verifierResult: object(JSON.parse(verifierResultRead.text), "verifier/result.json"),
		manifestText: manifestRead.text,
		traceText: traceRead.text,
		diffText: diffRead.text,
		diffArtifact: diffRelative === "diff.json" ? "diff.json" : "diff.patch",
		verifierResultText: verifierResultRead.text,
		verifierOutputText: verifierOutputRead.text,
		reportText: reportRead.text,
		paths: {
			manifest: manifestRead.path,
			trace: traceRead.path,
			diff: diffRead.path,
			verifierResult: verifierResultRead.path,
			verifierOutput: verifierOutputRead.path,
			report: reportRead.path,
		},
	};
}

export function createAnalysisContext(descriptors: RunDescriptor[]): AnalysisContext {
	const runs = new Map<string, LoadedRun>();
	for (const descriptor of descriptors) {
		if (runs.has(descriptor.runId)) throw new Error(`duplicate RunDescriptor runId ${descriptor.runId}`);
		runs.set(descriptor.runId, readRunArtifacts(descriptor));
	}
	return { runs, coveredRuns: [...runs.keys()], loadedEvidence: [] };
}

function run(context: AnalysisContext, runId: string): LoadedRun {
	const value = context.runs.get(runId);
	if (!value) throw new Error(`Run ${runId} is not loaded`);
	return value;
}

export function listRuns(context: AnalysisContext): Array<Record<string, unknown>> {
	return [...context.runs.values()].map((loaded) => {
		const result = determineOutcome({
			executionStatus: loaded.manifest.execution_status,
			manifestVerificationStatus: loaded.manifest.verification_status,
			verifierStatus: loaded.verifierResult.status,
		});
		return {
			runId: loaded.manifest.run_id,
			taskId: loaded.manifest.task_id,
			...result,
			model: { ...loaded.manifest.model },
			skill: loaded.manifest.skill == null ? null : { ...loaded.manifest.skill },
			usage: { ...loaded.manifest.usage },
			artifacts: { ...loaded.paths },
			labels: { ...loaded.descriptor.labels },
		};
	});
}

function visibleFields(event: TraceEvent): Record<string, string | number | boolean> {
	const output: Record<string, string | number | boolean> = { sequence: event.sequence };
	for (const key of ["phase", "tool_name", "tool_call_id", "path", "command_id", "status", "exit_code", "timed_out"] as const) {
		const value = event[key];
		if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") output[key] = value;
	}
	return output;
}

function summary(event: TraceEvent): string {
	const compact = JSON.stringify(event);
	return compact.length <= 240 ? compact : `${compact.slice(0, 237)}...`;
}

export function searchTrace(context: AnalysisContext, runId: string, query: TraceQuery): TraceSearchResult[] {
	const loaded = run(context, runId);
	const limit = query.limit === undefined ? 20 : query.limit;
	if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new Error("TraceQuery.limit must be an integer from 1 to 100");
	const keyword = query.keyword?.toLocaleLowerCase();
	return loaded.trace.events
		.filter((event) => query.eventType === undefined || event.type === query.eventType)
		.filter((event) => query.toolName === undefined || event.tool_name === query.toolName)
		.filter((event) => keyword === undefined || JSON.stringify(event).toLocaleLowerCase().includes(keyword))
		.slice(0, limit)
		.map((event) => ({
			locator: { artifact: "trace", run_id: runId, sequence: event.sequence },
			eventType: event.type,
			summary: summary(event),
			fields: visibleFields(event),
		}));
}

function verifierContent(loaded: LoadedRun): string {
	const sourceRef = loaded.verifierResult.execution && typeof loaded.verifierResult.execution === "object"
		? (loaded.verifierResult.execution as JsonObject).source_snapshot_ref
		: undefined;
	let source: { path: string; content: string } | null = null;
	if (sourceRef && typeof sourceRef === "object" && typeof (sourceRef as JsonObject).path === "string") {
		const sourceRead = readRequiredText(loaded.descriptor.root, (sourceRef as JsonObject).path as string, "verifier source snapshot");
		source = { path: (sourceRef as JsonObject).path as string, content: sourceRead.text };
	}
	return JSON.stringify({ result: loaded.verifierResult, output: loaded.verifierOutputText, source_snapshot: source }, null, 2);
}

export function readEvidence(context: AnalysisContext, locator: EvidenceLocator): EvidenceRead {
	const loaded = run(context, locator.run_id);
	let content: string;
	if (locator.artifact === "trace") {
		const event = loaded.trace.events.find((candidate) => candidate.sequence === locator.sequence);
		if (!event) throw new Error(`Trace sequence ${locator.sequence} does not exist in Run ${locator.run_id}`);
		content = JSON.stringify(event, null, 2);
	} else if (locator.artifact === "diff") content = loaded.diffText;
	else if (locator.artifact === "verifier") content = verifierContent(loaded);
	else content = loaded.manifestText;
	const record = { artifact: locator.artifact, locator: structuredClone(locator), characterCount: content.length };
	context.loadedEvidence.push(record);
	return { ...record, content };
}

export function resolveFindingLocators(context: AnalysisContext, locators: EvidenceLocator[]): EvidenceRead[] {
	return locators.map((locator) => readEvidence(context, locator));
}
