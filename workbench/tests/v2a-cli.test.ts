import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import test from "node:test";
import { PROJECT_ROOT } from "./helpers.ts";

test("V2-A CLI runs and inspects a zero-call initial-pass Run", () => {
	const runRoot = resolve(PROJECT_ROOT, ".runs/v2-a/cli-tests", `initial-pass-${process.pid}-${Date.now()}`);
	const run = JSON.parse(execFileSync(process.execPath, [resolve(PROJECT_ROOT, "workbench/src/cli.ts"), "v2a", "run", "--run-root", runRoot, "--run-id", "v2a-cli-initial-pass", "--scenario", "initial_pass_no_branch"], { cwd: PROJECT_ROOT, encoding: "utf8" }));
	assert.equal(run.outcome, "initial_pass");
	assert.deepEqual(run.real_call_counters, { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 });
	const inspected = JSON.parse(execFileSync(process.execPath, [resolve(PROJECT_ROOT, "workbench/src/cli.ts"), "v2a", "inspect", "--run-root", runRoot], { cwd: PROJECT_ROOT, encoding: "utf8" }));
	assert.equal(inspected.integrity_valid, true, inspected.errors.join("; "));
});
