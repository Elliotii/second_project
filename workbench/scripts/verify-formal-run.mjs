import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { treeInventory } from "../src/hash.ts";

const [runRootArgument] = process.argv.slice(2);
if (!runRootArgument) throw new Error("usage: verify-formal-run.mjs <run-root>");

const projectRoot = resolve(import.meta.dirname, "../..");
const runRoot = resolve(projectRoot, runRootArgument);
const workspaceRoot = resolve(runRoot, "workspace");
const sourceRoot = resolve(projectRoot, "fixtures/tasks/v0-a-parse-duration");
const readJson = (name) => JSON.parse(readFileSync(resolve(runRoot, name), "utf8"));

const run = readJson("run.json");
const attempt = readJson("attempt.json");
const task = readJson("task-spec.json");
const strategy = readJson("strategy.json");
const plan = readJson("preflight-plan.json");
const session = readJson("session-projection.json");
const settlement = readJson("settlement.json");
const workspace = readJson("workspace-ref.json");
const acceptance = readJson("foundation-acceptance.json");
const provider = readJson("provider-boundary.json");
const audit = readJson("tool-audit.json");
const initial = readJson("workspace-initial-inventory.json");
const final = readJson("workspace-final-inventory.json");

assert.equal(run.status, "settled");
assert.equal(run.task_id, task.task_id);
assert.equal(run.strategy_id, strategy.strategy_id);
assert.equal(run.config_digest, plan.config_digest);
assert.equal(plan.formal_run_identity_created, false);
assert.equal(plan.provider_calls, 0);
assert.equal(attempt.status, "settled");
assert.equal(attempt.parent_attempt_id, null);
assert.equal(attempt.run_id, run.run_id);
assert.equal(attempt.attempt_id, run.attempt_ids[0]);
assert.equal(session.session_id, attempt.session_id);
assert.equal(session.attempt_id, attempt.attempt_id);
assert.equal(session.workspace_id, run.workspace_id);
assert.equal(workspace.workspace_id, run.workspace_id);
assert.equal(settlement.settled, true);
assert.equal(settlement.settled_event_observed, true);
assert.equal(settlement.provider_response_events, 8);
assert.equal(workspace.source_digest, workspace.initial_tree_digest);
assert.equal(workspace.hardlink_pairs, 0);
assert.equal(acceptance.status, "passed");
assert.equal(acceptance.formal_outcome, null);
assert.deepEqual(acceptance.changed_paths, ["src/parse-duration.ts"]);
assert.equal(acceptance.protected_files_unchanged, true);
assert.equal(acceptance.only_allowed_paths_changed, true);
assert.equal(provider.external_provider_calls, 0);
assert.equal(provider.faux_provider_calls, 8);

const sourceInventory = treeInventory(sourceRoot);
assert.deepEqual(initial, sourceInventory);
assert.deepEqual(final, treeInventory(workspaceRoot));
for (const file of sourceInventory) {
	const sourceStats = statSync(resolve(sourceRoot, file.path));
	const targetStats = statSync(resolve(workspaceRoot, file.path));
	assert.notEqual(`${sourceStats.dev}:${sourceStats.ino}`, `${targetStats.dev}:${targetStats.ino}`, `hardlink: ${file.path}`);
}
for (let index = 0; index < audit.length; index += 2) {
	assert.equal(audit[index]?.type, "start");
	assert.equal(audit[index + 1]?.type, "end");
	assert.equal(audit[index]?.tool_call_id, audit[index + 1]?.tool_call_id);
	assert.equal(audit[index]?.tool_name, audit[index + 1]?.tool_name);
}
assert.deepEqual(
	audit.filter((event) => event.type === "start").map((event) => event.tool_name),
	["workspace_list", "workspace_search", "workspace_read", "workspace_read", "workspace_read", "workspace_edit", "run_command"],
);

process.stdout.write(
	`${JSON.stringify({
		status: "verified",
		run_id: run.run_id,
		attempt_id: attempt.attempt_id,
		session_id: session.session_id,
		workspace_id: workspace.workspace_id,
		initial_file_count: initial.length,
		hardlink_pairs: 0,
		changed_paths: acceptance.changed_paths,
		protected_files_unchanged: true,
		tool_pairs: audit.length / 2,
		external_provider_calls: 0,
		formal_outcome: null,
	})}\n`,
);
