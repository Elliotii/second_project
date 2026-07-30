import assert from "node:assert/strict";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import test from "node:test";
import { preflightV0B, V0B_TASK_PATH } from "../src/contracts/preflight-v0b.ts";
import { stableJson } from "../src/hash.ts";
import { dryRunV0B } from "../src/run-v0b.ts";
import { PROJECT_ROOT, testCaseRoot } from "./helpers.ts";

function runEntries(): string[] {
	const root = resolve(PROJECT_ROOT, ".runs/v0-b/runs");
	return existsSync(root) ? readdirSync(root).sort() : [];
}

function manifest(): Record<string, unknown> {
	return JSON.parse(readFileSync(resolve(PROJECT_ROOT, V0B_TASK_PATH), "utf8")) as Record<string, unknown>;
}

function writeManifest(label: string, value: unknown): string {
	const root = testCaseRoot(`v0b-${label}`).replace(".runs\\v0-a", ".runs\\v0-b").replace(".runs/v0-a", ".runs/v0-b");
	mkdirSync(root, { recursive: true });
	const path = resolve(root, "manifest.json");
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
	return relative(PROJECT_ROOT, path).split(sep).join("/");
}

test("V0-B dry-run is canonical, identity-free, and side-effect free", () => {
	const before = runEntries();
	const output = dryRunV0B({ projectRoot: PROJECT_ROOT });
	const after = runEntries();
	const plan = JSON.parse(output) as Record<string, unknown>;
	assert.equal(output, stableJson(plan));
	assert.deepEqual(after, before);
	assert.equal(plan.formal_run_identity_created, false);
	assert.equal(plan.provider_calls, 0);
	assert.equal(plan.real_model_budget, 0);
	assert.equal(plan.recovery_budget, 0);
	assert.equal("run_id" in plan, false);
	assert.equal("attempt_id" in plan, false);
	assert.equal("session_id" in plan, false);
	assert.equal("workspace_id" in plan, false);
});

test("V0-B preflight fixes task, strategy, verifier, source, and public Pi identities", () => {
	const result = preflightV0B({ projectRoot: PROJECT_ROOT, dryRun: true });
	assert.equal(result.task.task_id, "v0-b-parse-duration");
	assert.equal(result.strategy.strategy_id, "v0_observe_only_faux");
	assert.equal(result.strategy.completion_policy_id, "observe_only");
	assert.equal(result.strategy.recovery_mode, "none");
	assert.equal(result.task.verifier_id, "v0-b-parse-duration-hidden-v1");
	assert.equal(result.task.verifier_command.timeout_ms, 30_000);
	assert.equal(result.task.verifier_command.output_limit_bytes, 262_144);
	assert.match(result.plan.pi_public_import, /packages\/agent\/dist\/index\.js/);
});

test("V0-B malformed input fails before formal Run side effects", () => {
	const cases: Array<{ name: string; mutate: (value: Record<string, unknown>) => void; match: RegExp }> = [
		{ name: "unknown", mutate: (value) => Object.assign(value, { surprise: true }), match: /unknown field/ },
		{ name: "instruction", mutate: (value) => Object.assign(value, { instruction_sha256: "0".repeat(64) }), match: /digest mismatch/ },
		{ name: "verifier", mutate: (value) => Object.assign(value, { verifier_sha256: "0".repeat(64) }), match: /verifier digest mismatch/ },
		{ name: "path", mutate: (value) => Object.assign(value, { writable_paths: ["task.md"] }), match: /writable\/protected path conflict/ },
	];
	for (const item of cases) {
		const before = runEntries();
		const value = manifest();
		item.mutate(value);
		const path = writeManifest(item.name, value);
		assert.throws(() => preflightV0B({ projectRoot: PROJECT_ROOT, taskPath: path, dryRun: false }), item.match);
		assert.deepEqual(runEntries(), before);
	}
});
