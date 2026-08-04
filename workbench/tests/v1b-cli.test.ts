import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { PROJECT_ROOT } from "./helpers.ts";

function pilotRoot(label: string): string {
	const value = resolve(PROJECT_ROOT, ".runs/v1-b/stage1/cli-tests", `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	mkdirSync(resolve(value, ".."), { recursive: true });
	return value;
}

function cli(args: string[]): string {
	return execFileSync(process.execPath, [resolve(PROJECT_ROOT, "workbench/src/cli.ts"), ...args], { cwd: PROJECT_ROOT, encoding: "utf8" }).trim();
}

test("V1-B CLI exposes preflight, unique run-next, inspect and aggregate routing", () => {
	const pilot = pilotRoot("surface");
	const preflight = JSON.parse(cli(["v1b", "preflight", "--pilot-root", pilot]));
	assert.equal(preflight.status, "ready"); assert.equal(preflight.next_cell_id, "v1b-cell-01");
	assert.deepEqual(preflight.real_call_counters, { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 });
	const executed = JSON.parse(cli(["v1b", "run-next", "--pilot-root", pilot]));
	assert.equal(executed.run_id, "v1b-run-01-parse-duration-r1-a"); assert.deepEqual(executed.real_call_counters, preflight.real_call_counters);
	const inspected = JSON.parse(cli(["v1b", "inspect", "--pilot-root", pilot, "--run", executed.run_id]));
	assert.equal(inspected.integrity_valid, true);
	const aggregate = JSON.parse(cli(["v1b", "aggregate", "--pilot-root", pilot]));
	assert.deepEqual({ planned: aggregate.planned_runs, started: aggregate.started_runs, terminal: aggregate.terminal_runs, invalid: aggregate.invalid_runs, comparable: aggregate.comparable_runs }, { planned: 24, started: 1, terminal: 1, invalid: 0, comparable: 1 });
});
