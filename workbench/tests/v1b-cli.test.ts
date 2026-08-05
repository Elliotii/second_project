import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { PROJECT_ROOT } from "./helpers.ts";
import { buildExecutionManifestV1B } from "../src/experiment/v1.ts";
import { stableJson } from "../src/hash.ts";

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
	const manifestPath = resolve(pilotRoot("surface-manifest"), "manifest.json"); mkdirSync(resolve(manifestPath, ".."), { recursive: true }); writeFileSync(manifestPath, `${stableJson(buildExecutionManifestV1B(PROJECT_ROOT))}\n`, "utf8");
	const preflight = JSON.parse(cli(["v1b", "preflight", "--manifest", manifestPath, "--pilot-root", pilot]));
	assert.equal(preflight.status, "ready"); assert.equal(preflight.next_cell_id, "v1b-cell-01");
	assert.deepEqual(preflight.real_call_counters, { credential_reads: 0, network_calls: 0, provider_calls: 0, model_calls: 0 });
	const executed = JSON.parse(cli(["v1b", "run-next", "--manifest", manifestPath, "--pilot-root", pilot]));
	assert.equal(executed.run_id, "v1b-run-01-parse-duration-r1-a"); assert.deepEqual(executed.real_call_counters, preflight.real_call_counters);
	const inspected = JSON.parse(cli(["v1b", "inspect", "--pilot-root", pilot, "--run", executed.run_id]));
	assert.equal(inspected.integrity_valid, true);
	const aggregate = JSON.parse(cli(["v1b", "aggregate", "--pilot-root", pilot]));
	assert.deepEqual({ planned: aggregate.planned_runs, started: aggregate.started_runs, terminal: aggregate.terminal_runs, invalid: aggregate.invalid_runs, comparable: aggregate.comparable_runs }, { planned: 24, started: 1, terminal: 1, invalid: 0, comparable: 1 });
});

test("V1-B post-audit CLI requires explicit Stage 2 authority before Pilot initialization", () => {
	const realManifestPath = resolve(pilotRoot("real-manifest"), "manifest.json"); mkdirSync(resolve(realManifestPath, ".."), { recursive: true });
	writeFileSync(realManifestPath, `${stableJson(buildExecutionManifestV1B(PROJECT_ROOT, { executionMode: "stage2_real", executionBaselineCommit: "f".repeat(40), realExecutionAuthorized: true }))}\n`, "utf8");
	const missingPilot = pilotRoot("real-missing-authority");
	let result = spawnSync(process.execPath, [resolve(PROJECT_ROOT, "workbench/src/cli.ts"), "v1b", "run-next", "--manifest", realManifestPath, "--pilot-root", missingPilot], { cwd: PROJECT_ROOT, encoding: "utf8" });
	assert.equal(result.status, 1); assert.match(result.stderr, /fixed provider boundary failed/); assert.doesNotMatch(result.stderr, /dependencies are unavailable/); assert.equal(existsSync(missingPilot), false);

	const stage1Pilot = pilotRoot("stage1-real-switch");
	const stage1ManifestPath = resolve(pilotRoot("stage1-manifest"), "manifest.json"); mkdirSync(resolve(stage1ManifestPath, ".."), { recursive: true }); writeFileSync(stage1ManifestPath, `${stableJson(buildExecutionManifestV1B(PROJECT_ROOT))}\n`, "utf8");
	result = spawnSync(process.execPath, [resolve(PROJECT_ROOT, "workbench/src/cli.ts"), "v1b", "run-next", "--manifest", stage1ManifestPath, "--pilot-root", stage1Pilot, "--stage2-real-authority"], { cwd: PROJECT_ROOT, encoding: "utf8" });
	assert.equal(result.status, 1); assert.match(result.stderr, /fixed provider boundary failed/); assert.equal(existsSync(stage1Pilot), false);
});

test("V1-B tracked Stage 2 CLI fails sanitized and without dispatch when DEEPSEEK_API_KEY is absent", () => {
	const manifest = buildExecutionManifestV1B(PROJECT_ROOT, { executionMode: "stage2_real", executionBaselineCommit: "f".repeat(40), realExecutionAuthorized: true });
	const realManifestPath = resolve(pilotRoot("real-missing-credential-manifest"), "manifest.json"); mkdirSync(resolve(realManifestPath, ".."), { recursive: true }); writeFileSync(realManifestPath, `${stableJson(manifest)}\n`, "utf8");
	const pilot = pilotRoot("real-missing-credential");
	const result = spawnSync(process.execPath, [resolve(PROJECT_ROOT, "workbench/src/cli.ts"), "v1b", "run-next", "--manifest", realManifestPath, "--pilot-root", pilot, "--stage2-real-authority"], {
		cwd: PROJECT_ROOT,
		encoding: "utf8",
		env: {},
	});
	assert.equal(result.status, 1); assert.equal(result.stdout, ""); assert.match(result.stderr, /V1BTypedPauseError: V1-B execution paused at a typed boundary/); assert.doesNotMatch(result.stderr, /real execution dependencies are unavailable/);
	const ledger = readFileSync(resolve(pilot, "ledger.jsonl"), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
	assert.deepEqual({ planned: ledger.filter((entry) => entry.state === "planned").length, started: ledger.filter((entry) => entry.state === "started").length, paused: ledger.filter((entry) => entry.state === "paused").length, terminal: ledger.filter((entry) => entry.state === "terminal").length, invalid: ledger.filter((entry) => entry.state === "invalid").length }, { planned: 24, started: 1, paused: 1, terminal: 0, invalid: 0 });
	const first = manifest.cells[0]!; assert.deepEqual(ledger.filter((entry) => entry.state !== "planned").map((entry) => [entry.cell_id, entry.state]), [[first.cell_id, "started"], [first.cell_id, "paused"]]);
	assert.deepEqual(readdirSync(resolve(pilot, "runs")), [first.planned_run_id]);
	const journal = readFileSync(resolve(pilot, "runs", first.planned_run_id, "journal.jsonl"), "utf8").trim().split(/\r?\n/).map((line) => JSON.parse(line));
	assert.deepEqual(journal.map((entry) => entry.type), ["run_started", "workspace_materialized", "attempt_started", "attempt_paused"]);
	assert.equal(existsSync(resolve(pilot, "runs", first.planned_run_id, "pause-evidence.json")), true);
	const persisted = [result.stdout, result.stderr, ...readdirSync(pilot, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => readFileSync(resolve(entry.parentPath, entry.name), "utf8"))].join("\n");
	assert.doesNotMatch(persisted, /(?:bearer\s+[A-Za-z0-9._-]+|"(?:authorization|proxy[_-]?authorization)"\s*:|FAKE_(?:SENSITIVE|RESOLVER|PROVIDER|FACTORY))/i);
});
