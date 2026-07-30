import assert from "node:assert/strict";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import test from "node:test";
import { resolve } from "node:path";
import { dryRunV0A } from "../src/run.ts";
import { preflight } from "../src/contracts/preflight.ts";
import { stableJson } from "../src/hash.ts";
import { FORMAL_TASK_PATH, PROJECT_ROOT, testCaseRoot } from "./helpers.ts";

const STRATEGY = "v0a_faux_single_cycle";

function formalSpec(): Record<string, unknown> {
	return JSON.parse(readFileSync(resolve(PROJECT_ROOT, FORMAL_TASK_PATH), "utf8")) as Record<string, unknown>;
}

function writeCase(label: string, value: unknown): string {
	const root = testCaseRoot(label);
	const path = resolve(root, "task.json");
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
	return path;
}

function runEntries(): string[] {
	const root = resolve(PROJECT_ROOT, ".runs/v0-a/runs");
	return existsSync(root) ? readdirSync(root).sort() : [];
}

test("dry-run emits a canonical zero-side-effect plan without formal identities", async () => {
	const before = runEntries();
	const output = await dryRunV0A({ projectRoot: PROJECT_ROOT, taskPath: FORMAL_TASK_PATH, strategyId: STRATEGY });
	const after = runEntries();
	assert.deepEqual(after, before);
	const plan = JSON.parse(output) as Record<string, unknown>;
	assert.equal(output, stableJson(plan));
	assert.equal(plan.formal_run_identity_created, false);
	assert.equal(plan.provider_calls, 0);
	assert.equal(plan.real_model_budget, 0);
	assert.equal(plan.recovery_budget, 0);
	assert.equal("run_id" in plan, false);
	assert.equal("attempt_id" in plan, false);
	assert.equal("session_id" in plan, false);
	assert.equal("workspace_id" in plan, false);
});

test("preflight rejects malformed or inconsistent tasks before execution", async (t) => {
	const cases: Array<{ name: string; mutate: (spec: Record<string, unknown>) => void; match: RegExp }> = [
		{ name: "unknown field", mutate: (spec) => Object.assign(spec, { surprise: true }), match: /unknown field/ },
		{
			name: "missing reference",
			mutate: (spec) => Object.assign(spec, { workspace_source_ref: "fixtures/tasks/does-not-exist" }),
			match: /workspace source does not exist/,
		},
		{
			name: "instruction digest mismatch",
			mutate: (spec) => Object.assign(spec, { instruction_sha256: "0".repeat(64) }),
			match: /instruction digest mismatch/,
		},
		{
			name: "path conflict",
			mutate: (spec) => Object.assign(spec, { writable_paths: ["task.md"] }),
			match: /writable\/protected path conflict/,
		},
		{
			name: "glob path conflict",
			mutate: (spec) => Object.assign(spec, { writable_paths: ["test/**"] }),
			match: /writable\/protected path conflict/,
		},
		{
			name: "unknown command ID",
			mutate: (spec) => {
				const descriptor = structuredClone((spec.command_descriptors as unknown[])[0]) as Record<string, unknown>;
				descriptor.command_id = "deploy";
				spec.command_descriptors = [descriptor];
			},
			match: /unsupported command ID/,
		},
	];
	for (const item of cases) {
		await t.test(item.name, async () => {
			const spec = formalSpec();
			item.mutate(spec);
			const taskPath = writeCase(`preflight-${item.name.replaceAll(" ", "-")}`, spec);
			await assert.rejects(
				preflight({ projectRoot: PROJECT_ROOT, taskPath, strategyId: STRATEGY, dryRun: true }),
				item.match,
			);
		});
	}
});

test(
	"Windows preflight rejects case-only writable/protected conflicts before formal side effects",
	{ skip: process.platform !== "win32" },
	async () => {
		const before = runEntries();
		const spec = formalSpec();
		spec.writable_paths = ["TASK.MD"];
		const taskPath = writeCase("preflight-case-only-conflict", spec);
		await assert.rejects(
			preflight({ projectRoot: PROJECT_ROOT, taskPath, strategyId: STRATEGY, dryRun: true }),
			/writable\/protected path conflict/,
		);
		assert.deepEqual(runEntries(), before);
	},
);

test("preflight rejects shell, network, install, background, and escaping command descriptors", async (t) => {
	const forbidden = [
		["--eval", "fetch('https://example.invalid')"],
		["npm", "install"],
		["../outside.mjs"],
		["--test", "test/public.test.ts", "&"],
		["https://example.invalid/script.mjs"],
	];
	for (const argv of forbidden) {
		await t.test(argv.join(" "), async () => {
			const spec = formalSpec();
			const descriptor = structuredClone((spec.command_descriptors as unknown[])[0]) as Record<string, unknown>;
			descriptor.argv = argv;
			spec.command_descriptors = [descriptor];
			const taskPath = writeCase("forbidden-command", spec);
			await assert.rejects(
				preflight({ projectRoot: PROJECT_ROOT, taskPath, strategyId: STRATEGY, dryRun: true }),
				/forbidden command argument/,
			);
		});
	}
});

test("dry-run tolerates the run parent while creating no child identity", async () => {
	const runRoot = resolve(PROJECT_ROOT, ".runs/v0-a/runs");
	mkdirSync(runRoot, { recursive: true });
	const before = runEntries();
	await preflight({ projectRoot: PROJECT_ROOT, taskPath: FORMAL_TASK_PATH, strategyId: STRATEGY, dryRun: true });
	assert.deepEqual(runEntries(), before);
});
