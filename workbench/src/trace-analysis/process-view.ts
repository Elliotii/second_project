import { operationStatus, pairedEndEvents, sourceTarget } from "../coding-task/normalization.ts";
import type { EvidenceLocator, LoadedRun, TraceEvent } from "./contracts.ts";

export type ProcessKind = "inspection" | "mutation" | "validation" | "execution" | "other";
export type InvocationStatus = "success" | "failure";
export type ValidationResult = "pass" | "fail";

export interface ProcessOperation {
	start_sequence: number;
	result_sequence: number;
	tool_call_id: string;
	raw_tool: string;
	normalized_kind: ProcessKind;
	target: string | null;
	invocation_status: InvocationStatus;
	validation_result: ValidationResult | null;
	start_locator: Extract<EvidenceLocator, { artifact: "trace" }>;
	result_locator: Extract<EvidenceLocator, { artifact: "trace" }>;
}

export interface ProcessLandmark {
	sequence: number;
	locator: Extract<EvidenceLocator, { artifact: "trace" }>;
}

export interface ProcessOverview {
	operation_count_by_kind: Record<ProcessKind, number>;
	operation_count_by_status: Record<InvocationStatus, number>;
	first_inspection: ProcessLandmark | null;
	first_mutation: ProcessLandmark | null;
	last_mutation: ProcessLandmark | null;
	first_validation: ProcessLandmark | null;
	last_validation: ProcessLandmark | null;
	last_successful_validation: ProcessLandmark | null;
	inspections_before_first_mutation: number | null;
	failed_tool_operations: ProcessLandmark[];
	validation_attempts: number;
	successful_validations: number;
	actions_after_last_successful_validation: number | null;
	unique_targets_by_kind: Record<ProcessKind, string[]>;
}

export interface ProcessTimeline {
	total_operations: number;
	returned_operations: number;
	truncated: false;
	operations: ProcessOperation[];
}

export interface ProcessView {
	run_id: string;
	agent_status: string | null;
	agent_end_reason: string | null;
	overview: ProcessOverview;
	timeline: ProcessTimeline;
}

type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject | null {
	return value !== null && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;
}

function nonEmptyString(value: unknown, label: string): string {
	if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${label} must be a non-empty string`);
	return value;
}

function sequence(event: TraceEvent, label: string): number {
	if (!Number.isSafeInteger(event.sequence)) throw new Error(`${label}.sequence must be a safe integer`);
	return event.sequence;
}

function processKind(eventType: string): ProcessKind {
	if (eventType === "file_read") return "inspection";
	if (eventType === "file_write") return "mutation";
	if (eventType === "test") return "validation";
	if (eventType === "command") return "execution";
	return "other";
}

function validationResult(kind: ProcessKind, status: InvocationStatus, end: JsonObject): ValidationResult | null {
	if (kind !== "validation" || status !== "success") return null;
	if (!Number.isSafeInteger(end.exit_code) || typeof end.timed_out !== "boolean") return null;
	return end.exit_code === 0 && end.timed_out === false ? "pass" : "fail";
}

function locator(runId: string, eventSequence: number): Extract<EvidenceLocator, { artifact: "trace" }> {
	return { artifact: "trace", run_id: runId, sequence: eventSequence };
}

export function projectProcessOperations(run: LoadedRun): ProcessOperation[] {
	const events = run.trace.events as JsonObject[];
	const endEvents = pairedEndEvents(events);
	const starts = run.trace.events
		.map((event, index) => ({ event, index, sequence: sequence(event, `trace.events[${index}]`) }))
		.filter(({ event }) => event.phase === "start")
		.sort((left, right) => left.sequence - right.sequence);
	const seenStarts = new Set<string>();
	return starts.map(({ event, index, sequence: startSequence }) => {
		const toolCallId = nonEmptyString(event.tool_call_id, `trace.events[${index}].tool_call_id`);
		if (seenStarts.has(toolCallId)) throw new Error(`trace has duplicate start event for tool_call_id ${toolCallId}`);
		seenStarts.add(toolCallId);
		const end = endEvents.get(toolCallId);
		if (!end) throw new Error(`trace has no end event for tool_call_id ${toolCallId}`);
		const resultSequence = sequence(end as TraceEvent, `trace end event for tool_call_id ${toolCallId}`);
		const rawTool = nonEmptyString(event.tool_name, `trace.events[${index}].tool_name`);
		const invocationStatus = operationStatus(end, toolCallId);
		const kind = processKind(event.type);
		return {
			start_sequence: startSequence,
			result_sequence: resultSequence,
			tool_call_id: toolCallId,
			raw_tool: rawTool,
			normalized_kind: kind,
			target: sourceTarget(event) ?? null,
			invocation_status: invocationStatus,
			validation_result: validationResult(kind, invocationStatus, end),
			start_locator: locator(run.manifest.run_id, startSequence),
			result_locator: locator(run.manifest.run_id, resultSequence),
		};
	});
}

function startLandmark(operation: ProcessOperation): ProcessLandmark {
	return { sequence: operation.start_sequence, locator: operation.start_locator };
}

function resultLandmark(operation: ProcessOperation): ProcessLandmark {
	return { sequence: operation.result_sequence, locator: operation.result_locator };
}

function first(operations: ProcessOperation[], kind: ProcessKind): ProcessOperation | undefined {
	return operations.find((operation) => operation.normalized_kind === kind);
}

function last(operations: ProcessOperation[], predicate: (operation: ProcessOperation) => boolean): ProcessOperation | undefined {
	return operations.findLast(predicate);
}

export function buildProcessOverview(operations: ProcessOperation[]): ProcessOverview {
	const operationCountByKind: Record<ProcessKind, number> = { inspection: 0, mutation: 0, validation: 0, execution: 0, other: 0 };
	const operationCountByStatus: Record<InvocationStatus, number> = { success: 0, failure: 0 };
	const uniqueTargetSets: Record<ProcessKind, Set<string>> = {
		inspection: new Set(), mutation: new Set(), validation: new Set(), execution: new Set(), other: new Set(),
	};
	for (const operation of operations) {
		operationCountByKind[operation.normalized_kind]++;
		operationCountByStatus[operation.invocation_status]++;
		if (operation.target !== null) uniqueTargetSets[operation.normalized_kind].add(operation.target);
	}
	const firstInspection = first(operations, "inspection");
	const firstMutation = first(operations, "mutation");
	const lastMutation = last(operations, (operation) => operation.normalized_kind === "mutation");
	const firstValidation = first(operations, "validation");
	const lastValidation = last(operations, (operation) => operation.normalized_kind === "validation");
	const lastSuccessfulValidation = last(operations, (operation) => operation.validation_result === "pass");
	return {
		operation_count_by_kind: operationCountByKind,
		operation_count_by_status: operationCountByStatus,
		first_inspection: firstInspection ? startLandmark(firstInspection) : null,
		first_mutation: firstMutation ? startLandmark(firstMutation) : null,
		last_mutation: lastMutation ? startLandmark(lastMutation) : null,
		first_validation: firstValidation ? resultLandmark(firstValidation) : null,
		last_validation: lastValidation ? resultLandmark(lastValidation) : null,
		last_successful_validation: lastSuccessfulValidation ? resultLandmark(lastSuccessfulValidation) : null,
		inspections_before_first_mutation: firstMutation
			? operations.filter((operation) => operation.normalized_kind === "inspection" && operation.start_sequence < firstMutation.start_sequence).length
			: null,
		failed_tool_operations: operations.filter((operation) => operation.invocation_status === "failure").map(resultLandmark),
		validation_attempts: operations.filter((operation) => operation.normalized_kind === "validation").length,
		successful_validations: operations.filter((operation) => operation.validation_result === "pass").length,
		actions_after_last_successful_validation: lastSuccessfulValidation
			? operations.filter((operation) => operation.start_sequence > lastSuccessfulValidation.result_sequence).length
			: null,
		unique_targets_by_kind: {
			inspection: [...uniqueTargetSets.inspection], mutation: [...uniqueTargetSets.mutation], validation: [...uniqueTargetSets.validation],
			execution: [...uniqueTargetSets.execution], other: [...uniqueTargetSets.other],
		},
	};
}

export function buildProcessView(run: LoadedRun): ProcessView {
	const operations = projectProcessOperations(run);
	const agent = object(run.trace.agent);
	return {
		run_id: run.manifest.run_id,
		agent_status: typeof agent?.status === "string" ? agent.status : null,
		agent_end_reason: typeof agent?.end_reason === "string" ? agent.end_reason : null,
		overview: buildProcessOverview(operations),
		timeline: {
			total_operations: operations.length,
			returned_operations: operations.length,
			truncated: false,
			operations,
		},
	};
}
