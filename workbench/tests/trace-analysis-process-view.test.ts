import assert from "node:assert/strict";
import test from "node:test";
import type { CodingTaskRunManifest } from "../src/coding-task/contracts.ts";
import type { LoadedRun, TraceEvent } from "../src/trace-analysis/contracts.ts";
import { buildProcessView } from "../src/trace-analysis/process-view.ts";

function loaded(events: TraceEvent[], agent: Record<string, unknown> = { status: "completed", end_reason: "settled" }): LoadedRun {
	const runId = "process-view-run";
	return {
		descriptor: { runId, root: "unused", labels: {} },
		manifest: { run_id: runId } as CodingTaskRunManifest,
		trace: { events, agent },
		verifierResult: {}, manifestText: "", traceText: "", diffText: "", diffArtifact: "diff.json",
		verifierResultText: "", verifierOutputText: "", reportText: "",
		paths: { manifest: "", trace: "", diff: "", verifierResult: "", verifierOutput: "", report: "" },
		unavailableArtifacts: [],
	};
}

function pair(sequence: number, type: string, id: string, tool: string, start: Record<string, unknown> = {}, end: Record<string, unknown> = {}): TraceEvent[] {
	return [
		{ sequence, type, phase: "start", tool_call_id: id, tool_name: tool, ...start },
		{ sequence: sequence + 1, type: end.status === "error" ? "tool_error" : "tool_result", phase: "end", tool_call_id: id, tool_name: tool, status: "ok", ...end },
	];
}

test("normal inspection-mutation-validation path projects kinds, landmarks, targets, validation, locators, and agent state", () => {
	const view = buildProcessView(loaded([
		...pair(1, "file_read", "read-1", "workspace_read", { path: "src/a.ts" }),
		...pair(3, "file_write", "write-1", "workspace_edit", { path: "src/a.ts" }),
		...pair(5, "test", "test-1", "run_command", { command_id: "public_test" }, { command_id: "public_test", exit_code: 0, timed_out: false }),
	]));
	assert.deepEqual(view.timeline.operations.map((operation) => operation.normalized_kind), ["inspection", "mutation", "validation"]);
	assert.deepEqual(view.timeline.operations.map((operation) => operation.target), ["src/a.ts", "src/a.ts", "public_test"]);
	assert.equal(view.timeline.operations[2]!.validation_result, "pass");
	assert.deepEqual(view.overview.operation_count_by_kind, { inspection: 1, mutation: 1, validation: 1, execution: 0, other: 0 });
	assert.deepEqual(view.overview.operation_count_by_status, { success: 3, failure: 0 });
	assert.deepEqual(view.overview.first_inspection, { sequence: 1, locator: { artifact: "trace", run_id: "process-view-run", sequence: 1 } });
	assert.deepEqual(view.overview.first_mutation, { sequence: 3, locator: { artifact: "trace", run_id: "process-view-run", sequence: 3 } });
	assert.deepEqual(view.overview.last_mutation, view.overview.first_mutation);
	assert.deepEqual(view.overview.first_validation, { sequence: 6, locator: { artifact: "trace", run_id: "process-view-run", sequence: 6 } });
	assert.deepEqual(view.overview.last_validation, view.overview.first_validation);
	assert.deepEqual(view.overview.last_successful_validation, { sequence: 6, locator: { artifact: "trace", run_id: "process-view-run", sequence: 6 } });
	assert.equal(view.overview.inspections_before_first_mutation, 1);
	assert.equal(view.overview.validation_attempts, 1);
	assert.equal(view.overview.successful_validations, 1);
	assert.equal(view.overview.actions_after_last_successful_validation, 0);
	assert.deepEqual(view.overview.unique_targets_by_kind, { inspection: ["src/a.ts"], mutation: ["src/a.ts"], validation: ["public_test"], execution: [], other: [] });
	assert.equal(view.agent_status, "completed");
	assert.equal(view.agent_end_reason, "settled");
	assert.deepEqual(view.timeline, { total_operations: 3, returned_operations: 3, truncated: false, operations: view.timeline.operations });
});

test("tool invocation failure is counted separately and points to the result event", () => {
	const view = buildProcessView(loaded(pair(10, "file_write", "write-error", "workspace_edit", { path: "src/a.ts" }, { status: "error" })));
	assert.equal(view.timeline.operations[0]!.invocation_status, "failure");
	assert.deepEqual(view.overview.failed_tool_operations, [{ sequence: 11, locator: { artifact: "trace", run_id: "process-view-run", sequence: 11 } }]);
	assert.equal(view.overview.operation_count_by_status.failure, 1);
});

test("successful validation invocation with a failing command is not a failed tool operation", () => {
	const view = buildProcessView(loaded([
		...pair(1, "test", "test-fail", "run_command", { command_id: "public_test" }, { command_id: "public_test", exit_code: 1, timed_out: false }),
		...pair(3, "file_write", "fix", "workspace_edit", { path: "src/a.ts" }),
	]));
	assert.equal(view.timeline.operations[0]!.invocation_status, "success");
	assert.equal(view.timeline.operations[0]!.validation_result, "fail");
	assert.equal(view.overview.failed_tool_operations.length, 0);
	assert.equal(view.overview.validation_attempts, 1);
	assert.equal(view.overview.successful_validations, 0);
	assert.equal(view.overview.actions_after_last_successful_validation, null);
});

test("no mutation and no validation retain not-applicable nulls", () => {
	const view = buildProcessView(loaded(pair(1, "file_read", "read-only", "workspace_list", { path: "." })));
	assert.equal(view.overview.first_mutation, null);
	assert.equal(view.overview.inspections_before_first_mutation, null);
	assert.equal(view.overview.validation_attempts, 0);
	assert.equal(view.overview.last_successful_validation, null);
	assert.equal(view.overview.actions_after_last_successful_validation, null);
});

test("unknown tools are retained as other with a null target", () => {
	const view = buildProcessView(loaded(pair(1, "tool_call", "unknown-1", "custom_tool")));
	assert.equal(view.timeline.operations.length, 1);
	assert.equal(view.timeline.operations[0]!.normalized_kind, "other");
	assert.equal(view.timeline.operations[0]!.target, null);
	assert.deepEqual(view.overview.unique_targets_by_kind.other, []);
});

test("start and result locators address their respective trace events", () => {
	const operation = buildProcessView(loaded(pair(7, "command", "command-1", "run_command", { command_id: "format" }, { command_id: "format", exit_code: 0, timed_out: false }))).timeline.operations[0]!;
	assert.deepEqual(operation.start_locator, { artifact: "trace", run_id: "process-view-run", sequence: 7 });
	assert.deepEqual(operation.result_locator, { artifact: "trace", run_id: "process-view-run", sequence: 8 });
});

test("actions after the last successful validation start after its result sequence", () => {
	const view = buildProcessView(loaded([
		{ sequence: 1, type: "test", phase: "start", tool_call_id: "test-1", tool_name: "run_command", command_id: "test" },
		{ sequence: 2, type: "file_read", phase: "start", tool_call_id: "overlap", tool_name: "workspace_read", path: "src/a.ts" },
		{ sequence: 3, type: "tool_result", phase: "end", tool_call_id: "test-1", tool_name: "run_command", status: "ok", command_id: "test", exit_code: 0, timed_out: false },
		{ sequence: 4, type: "tool_result", phase: "end", tool_call_id: "overlap", tool_name: "workspace_read", status: "ok" },
		...pair(5, "command", "after", "run_command", { command_id: "format" }, { command_id: "format", exit_code: 0, timed_out: false }),
	]));
	assert.equal(view.overview.actions_after_last_successful_validation, 1);
});

test("same input produces identical mechanical output", () => {
	const input = loaded([...pair(1, "file_read", "read", "workspace_read", { path: "src/a.ts" }), ...pair(3, "tool_call", "unknown", "custom_tool")]);
	assert.deepEqual(buildProcessView(input), buildProcessView(input));
});
