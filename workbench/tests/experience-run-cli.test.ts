import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { parseExperienceRunArguments, runExperience } from "../scripts/run-experience.ts";
import type { CodingTaskRunManifest } from "../src/coding-task/contracts.ts";
import { snapshotWorkspace } from "../src/coding-task/workspace.ts";

function fixture(count = 2): { root: string; configs: string[]; options: Parameters<typeof runExperience>[0] } {
	const root = mkdtempSync(resolve(tmpdir(), "experience-run-cli-")); const source = resolve(root, "source"); mkdirSync(source); writeFileSync(resolve(source, "subject.txt"), "before\n");
	const verifier = resolve(root, "verifier.mjs"); writeFileSync(verifier, "console.log('{}');\n"); const verifierSha = createHash("sha256").update(readFileSync(verifier)).digest("hex");
	const configs = Array.from({ length: count }, (_, index) => {
		const path = resolve(root, `task-${index + 1}.json`); writeFileSync(path, `${JSON.stringify({
			task_id: `task-${index + 1}`, prompt: "Perform the predefined task.", source_root: "source", existing_tree_digest: snapshotWorkspace(source).tree_digest,
			writable_paths: ["subject.txt"], protected_paths: [], command_descriptors: [{ command_id: "check", executable: "current_node_executable", argv: ["--version"], cwd: "workspace", timeout_seconds: 10, max_combined_output_bytes: 1000 }],
			verifier_spec: { id: "fixture-verifier", source_path: "verifier.mjs", sha256: verifierSha, timeout_ms: 10000, output_limit_bytes: 10000 }, output_root: "unused-runs", timeout_ms: 30000,
		}, null, 2)}\n`); return path;
	});
	return { root, configs, options: { projectRoot: root, runs: configs, credentialFile: resolve(root, "unused.env"), output: resolve(root, "experience"), json: true } };
}

function manifest(runId: string, verification: "passed" | "failed" | "not_run", execution: CodingTaskRunManifest["execution_status"] = "completed"): CodingTaskRunManifest {
	return {
		schema_version: 1, run_id: runId, task_id: runId, source_revision: null, existing_tree_digest: "tree", model: { provider: "fixture", id: "fixture" }, pi_commit: "0".repeat(40), skill: null,
		execution_status: execution, verification_status: verification, failure_reason: execution === "completed" ? null : "provider", agent_final_claim: null, started_at: "2026-01-01T00:00:00.000Z", finished_at: "2026-01-01T00:00:01.000Z",
		usage: { request_count: 1, input_tokens: 1, output_tokens: 1, cost_usd: 0, tool_count: 0, duration_ms: 1, unknown_fields: [] }, changes: { added: [], modified: [], deleted: [] },
		artifacts: { session: "session.jsonl", trace: "trace.json", diff: "diff.patch", verifier_result: "verifier/result.json", report: "report.md" }, known_limitations: [],
	};
}

test("arguments preserve every repeated predefined Run instance and expose help", () => {
	assert.deepEqual(parseExperienceRunArguments(["--help"]), { help: true, json: false });
	const parsed = parseExperienceRunArguments(["--project-root", "root", "--run", "a.json", "--run", "a.json", "--run", "b.json", "--credential-file", "key.env", "--output", "out", "--json"]);
	assert.ok(!("help" in parsed)); assert.deepEqual(parsed.runs, ["a.json", "a.json", "b.json"]);
});

test("ordered Runs execute once each and a legal Verifier failure continues", async () => {
	const value = fixture(3); const calls: number[] = [];
	try {
		const result = await runExperience(value.options, { runTask: async ({ sequence, task }) => { calls.push(sequence); const root = resolve(value.options.output, "runs", `run-${sequence}`); return { manifest: manifest(`run-${sequence}`, sequence === 2 ? "failed" : "passed"), run_root: root }; } });
		assert.deepEqual(calls, [1, 2, 3]); assert.deepEqual(result.runs.map((run) => run.verification_status), ["passed", "failed", "passed"]); assert.equal(result.completed_runs, 3);
		assert.equal(existsSync(result.summary), true); assert.equal(JSON.parse(readFileSync(result.summary, "utf8")).completed_runs, 3);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("operational status short-circuits without retry and preserves completed refs", async () => {
	const value = fixture(3); const calls: number[] = [];
	try {
		await assert.rejects(runExperience(value.options, { runTask: async ({ sequence }) => { calls.push(sequence); return { manifest: manifest(`run-${sequence}`, sequence === 1 ? "passed" : "not_run", sequence === 2 ? "infrastructure_failed" : "completed"), run_root: resolve(value.options.output, "runs", `run-${sequence}`) }; } }), /stopped after 2\/3 Runs/);
		assert.deepEqual(calls, [1, 2]); assert.equal(existsSync(resolve(value.options.output, "experience-summary.json")), false);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("all configs preflight before the first Coding Run", async () => {
	const value = fixture(2); let calls = 0;
	try {
		const invalid = JSON.parse(readFileSync(value.configs[1]!, "utf8")) as Record<string, unknown>; (invalid.verifier_spec as Record<string, unknown>).sha256 = "f".repeat(64); writeFileSync(value.configs[1]!, JSON.stringify(invalid));
		await assert.rejects(runExperience(value.options, { runTask: async () => { calls++; return { manifest: manifest("unused", "passed"), run_root: "unused" }; } }), /Verifier source digest mismatch/);
		assert.equal(calls, 0); assert.equal(existsSync(value.options.output), false);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});
