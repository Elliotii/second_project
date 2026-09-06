import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import test from "node:test";

const WORKBENCH_ROOT = resolve(import.meta.dirname, "..");
const ENTRY = resolve(WORKBENCH_ROOT, "scripts", "workbench.mjs");

function invoke(args: string[]): { status: number | null; stdout: string; stderr: string } {
	const result = spawnSync(process.execPath, [ENTRY, ...args], { cwd: WORKBENCH_ROOT, encoding: "utf8", env: { ...process.env, NODE_NO_WARNINGS: "1" }, windowsHide: true });
	return { status: result.status, stdout: String(result.stdout), stderr: String(result.stderr) };
}

test("canonical root and every command group are discoverable", () => {
	for (const [args, expected] of [
		[["--help"], "Agent Eval & Skill Optimization Workbench"],
		[["experience", "--help"], "predefined Coding Task configs"],
		[["skill", "--help"], "evidence-valid"],
		[["evaluation", "--help"], "frozen Formal Evaluation"],
		[["task", "--help"], "exactly one Coding Task"],
	] as Array<[string[], string]>) {
		const result = invoke(args); assert.equal(result.status, 0, result.stderr); assert.match(result.stdout, new RegExp(expected));
	}
});

test("all five canonical leaf commands expose purpose, inputs and output help", () => {
	for (const args of [
		["experience", "run", "--help"], ["skill", "build", "--help"], ["evaluation", "run", "--help"], ["evaluation", "review", "--help"], ["task", "run", "--help"],
	]) {
		const result = invoke(args); assert.equal(result.status, 0, `${args.join(" ")}: ${result.stderr}`); assert.match(result.stdout, /Purpose:/); assert.match(result.stdout, /Required:/); assert.match(result.stdout, /Output:|Output root|artifacts/i);
	}
});

test("unknown commands fail non-zero on stderr", () => {
	const result = invoke(["skill", "unknown"]); assert.equal(result.status, 1); assert.equal(result.stdout, ""); assert.match(result.stderr, /unknown command skill unknown/);
});
