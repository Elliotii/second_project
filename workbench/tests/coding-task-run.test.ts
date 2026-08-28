import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall } from "@earendil-works/pi-ai";
import { runCodingTask } from "../src/coding-task/runner.ts";
import type { CodingTaskModelRuntime, CodingTaskSpec } from "../src/coding-task/contracts.ts";
import { fileSha256 } from "../src/hash.ts";
import { snapshotWorkspace } from "../src/coding-task/workspace.ts";

function fauxRuntime(source: string): CodingTaskModelRuntime {
	const models = createModels();
	const registration = fauxProvider({ provider: "coding-task-deterministic" });
	models.setProvider(registration.provider);
	registration.setResponses([
		fauxAssistantMessage(fauxToolCall("workspace_read", { path: "src/subject.ts" }, { id: "read" }), { stopReason: "toolUse" }),
		fauxAssistantMessage(fauxToolCall("workspace_edit", { path: "src/subject.ts", old_text: source, new_text: "export function answer(): number { return 42; }\n" }, { id: "edit" }), { stopReason: "toolUse" }),
		fauxAssistantMessage(fauxToolCall("run_command", { command_id: "public_test" }, { id: "test" }), { stopReason: "toolUse" }),
		fauxAssistantMessage("Implemented answer and the declared public test passed."),
	]);
	return { models, model: registration.getModel(), async close(): Promise<void> {} };
}

test("ordinary Coding Task persists Session, Trace, Diff, Verifier, manifest, and report", async () => {
	const root = mkdtempSync(resolve(tmpdir(), "coding-task-e2e-"));
	const sourceRoot = resolve(root, "source");
	mkdirSync(resolve(sourceRoot, "src"), { recursive: true });
	mkdirSync(resolve(sourceRoot, "test"), { recursive: true });
	const initial = "export function answer(): number { return 0; }\n";
	writeFileSync(resolve(sourceRoot, "src/subject.ts"), initial);
	writeFileSync(resolve(sourceRoot, "test/public.test.mjs"), "import assert from 'node:assert/strict'; import test from 'node:test'; import { answer } from '../src/subject.ts'; test('answer', () => assert.equal(answer(), 42));\n");
	writeFileSync(resolve(sourceRoot, "package.json"), "{\"private\":true,\"type\":\"module\"}\n");
	const verifierPath = resolve(root, "verifier.mjs");
	writeFileSync(verifierPath, "import { pathToFileURL } from 'node:url'; import { resolve } from 'node:path'; const { answer } = await import(pathToFileURL(resolve(process.env.V1_WORKSPACE, 'src/subject.ts'))); const passed = answer() === 42; console.log(JSON.stringify({schema_version:1,verifier_id:'answer-verifier',status:passed?'passed':'failed',summary:passed?'accepted':'failed'})); process.exitCode=passed?0:1;\n");
	const task: CodingTaskSpec = {
		task_id: "deterministic-answer", prompt: "Implement answer and run the public test.", source_root: sourceRoot, existing_tree_digest: snapshotWorkspace(sourceRoot).tree_digest,
		writable_paths: ["src/subject.ts"], protected_paths: ["package.json", "test/public.test.mjs"],
		command_descriptors: [{ command_id: "public_test", executable: "current_node_executable", argv: ["--test", "test/public.test.mjs"], cwd: "workspace", timeout_seconds: 15, max_combined_output_bytes: 50_000 }],
		verifier_spec: { id: "answer-verifier", source_path: verifierPath, sha256: fileSha256(verifierPath), timeout_ms: 15_000, output_limit_bytes: 50_000 },
		output_root: resolve(root, "runs"), timeout_ms: 30_000,
	};
	const result = await runCodingTask({ task, runtime: fauxRuntime(initial), runId: "deterministic-run" });
	assert.equal(result.manifest.execution_status, "completed");
	assert.equal(result.manifest.verification_status, "passed");
	assert.equal(result.manifest.usage.request_count, 4);
	assert.deepEqual(result.manifest.changes, { added: [], modified: ["src/subject.ts"], deleted: [] });
	for (const path of [result.manifest.artifacts.session, "trace.json", "diff.patch", "diff.json", "verifier/result.json", "run-manifest.json", "report.md"]) assert.equal(existsSync(resolve(result.run_root, path)), true, path);
	const trace = JSON.parse(readFileSync(resolve(result.run_root, "trace.json"), "utf8")) as { events: Array<{ type: string }>; verification: { status: string }; agent: { final_claim: string } };
	assert.ok(trace.events.some((event) => event.type === "file_read"));
	assert.ok(trace.events.some((event) => event.type === "file_write"));
	assert.ok(trace.events.some((event) => event.type === "test"));
	assert.equal(trace.verification.status, "passed");
	assert.match(trace.agent.final_claim, /public test passed/);
	assert.match(readFileSync(resolve(result.run_root, "diff.patch"), "utf8"), /\+export function answer\(\): number \{ return 42; \}/);
	assert.match(readFileSync(resolve(result.run_root, "report.md"), "utf8"), /External Verifier result: passed/);
});

test("Agent success claim cannot override an External Verifier failure", async () => {
	const root = mkdtempSync(resolve(tmpdir(), "coding-task-verifier-fail-"));
	const sourceRoot = resolve(root, "source");
	mkdirSync(resolve(sourceRoot, "src"), { recursive: true });
	writeFileSync(resolve(sourceRoot, "src/subject.ts"), "export const answer = 42;\n");
	const verifierPath = resolve(root, "verifier.mjs");
	writeFileSync(verifierPath, "console.log(JSON.stringify({schema_version:1,verifier_id:'forced-failure',status:'failed',summary:'forced task failure',failed_checks:['forced']})); process.exitCode=1;\n");
	const models = createModels();
	const registration = fauxProvider({ provider: "coding-task-claim-mismatch" });
	models.setProvider(registration.provider);
	registration.setResponses([fauxAssistantMessage("The task is complete and successful.")]);
	const runtime: CodingTaskModelRuntime = { models, model: registration.getModel(), async close(): Promise<void> {} };
	const task: CodingTaskSpec = {
		task_id: "claim-mismatch", prompt: "Inspect the task and report completion.", source_root: sourceRoot, existing_tree_digest: snapshotWorkspace(sourceRoot).tree_digest,
		writable_paths: ["src/subject.ts"], protected_paths: [],
		command_descriptors: [{ command_id: "public_test", executable: "current_node_executable", argv: ["--test"], cwd: "workspace", timeout_seconds: 15, max_combined_output_bytes: 50_000 }],
		verifier_spec: { id: "forced-failure", source_path: verifierPath, sha256: fileSha256(verifierPath), timeout_ms: 15_000, output_limit_bytes: 50_000 },
		output_root: resolve(root, "runs"), timeout_ms: 30_000,
	};
	const result = await runCodingTask({ task, runtime, runId: "claim-mismatch-run" });
	assert.equal(result.manifest.execution_status, "completed");
	assert.equal(result.manifest.verification_status, "failed");
	assert.match(result.manifest.agent_final_claim ?? "", /successful/);
	assert.match(readFileSync(resolve(result.run_root, "report.md"), "utf8"), /Agent final claim: The task is complete and successful[\s\S]*External Verifier result: failed/);
});
