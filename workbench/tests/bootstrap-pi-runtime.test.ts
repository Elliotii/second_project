import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const WORKBENCH_ROOT = resolve(import.meta.dirname, "..");
const ENTRY = resolve(WORKBENCH_ROOT, "scripts", "bootstrap-pi-runtime.mjs");

test("bootstrap help freezes the runtime identity and safe install behavior", () => {
	const result = spawnSync(process.execPath, [ENTRY, "--help"], { cwd: WORKBENCH_ROOT, encoding: "utf8", windowsHide: true });
	assert.equal(result.status, 0, String(result.stderr));
	assert.match(String(result.stdout), /027a5847901b5dde30270abaa1041046cd2b4b55/);
	assert.match(String(result.stdout), /integrity-pinned Pi AI\/Agent 0\.82\.1 release artifacts/);
});

test("bootstrap check fails closed for an absent runtime root without creating it", () => {
	const absent = resolve(WORKBENCH_ROOT, "..", ".runs", "release-test-absent-runtime");
	const result = spawnSync(process.execPath, [ENTRY, "--check", "--runtime-root", absent], { cwd: WORKBENCH_ROOT, encoding: "utf8", windowsHide: true });
	assert.equal(result.status, 1);
	assert.match(String(result.stderr), /Pi runtime is missing/);
});

test("canonical Pi loader uses the caller runtime instead of a machine-local path", () => {
	const source = readFileSync(resolve(WORKBENCH_ROOT, "scripts", "v35g2-public-pi-loader.mjs"), "utf8");
	assert.match(source, /process\.env\.PI_RUNTIME_ROOT/);
	assert.doesNotMatch(source, /D:\/AI\/|[A-Z]:\\\\/);
});

test("runtime dependency lock freezes the two published Pi packages", () => {
	const lock = JSON.parse(readFileSync(resolve(WORKBENCH_ROOT, "runtime-dependencies", "package-lock.json"), "utf8"));
	assert.equal(lock.packages["node_modules/@earendil-works/pi-ai"].version, "0.82.1");
	assert.equal(lock.packages["node_modules/@earendil-works/pi-agent-core"].version, "0.82.1");
});
