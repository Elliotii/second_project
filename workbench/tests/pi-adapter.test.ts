import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { REPAIRED_PARSE_DURATION_SOURCE } from "../src/pi/faux-sequence.ts";
import { runPiSingleCycle } from "../src/pi/pi-adapter.ts";
import { copyFormalWorkspace } from "./helpers.ts";

test("public Direct Pi Adapter runs the deterministic single cycle and preserves identity links", async () => {
	const { workspaceRoot, task } = copyFormalWorkspace("pi-adapter");
	const identity = {
		sessionId: "session-adapter-test",
		attemptId: "attempt-adapter-test",
		workspaceId: "workspace-adapter-test",
	};
	const result = await runPiSingleCycle({ workspaceRoot, task, ...identity });
	assert.equal(result.settled, true);
	assert.equal(result.settled_event_observed, true);
	assert.equal(result.terminal_reason, "assistant_final");
	assert.equal(result.session_id, identity.sessionId);
	assert.equal(result.attempt_id, identity.attemptId);
	assert.equal(result.workspace_id, identity.workspaceId);
	assert.equal(result.external_provider_calls, 0);
	assert.equal(result.faux_provider_calls, 8);
	assert.equal(result.provider_response_events, 8);
	assert.equal(result.command_executions.length, 1);
	assert.equal(result.command_executions[0]?.command_id, "test");
	assert.equal(result.command_executions[0]?.exit_code, 0);
	assert.equal(result.tool_audit.filter((event) => event.type === "start").length, 7);
	assert.equal(result.tool_audit.filter((event) => event.type === "end").length, 7);
	assert.equal(result.tool_audit.filter((event) => event.type === "error").length, 0);
	assert.equal(readFileSync(resolve(workspaceRoot, "src/parse-duration.ts"), "utf8"), REPAIRED_PARSE_DURATION_SOURCE);
});
