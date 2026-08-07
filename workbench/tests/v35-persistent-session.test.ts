import assert from "node:assert/strict";
import { cpSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import test from "node:test";
import { JsonlSessionRepo, type AgentMessage } from "@earendil-works/pi-agent-core";
import { NodeExecutionEnv } from "@earendil-works/pi-agent-core/node";
import { PersistentSessionServiceV35 } from "../src/session/persistent-session-v35.ts";
import { goal2SkillComparisonPlaceholderV35, readLegacyRunFallbackV35, readV2RecoveryComparisonV35, readV3PromptAdaptationV35 } from "../src/read-model/read-model-v35.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const LOADER = "./.runs/v3-5-g1/runtime/public-pi-loader.mjs";

function roots(label: string): { root: string; dataRoot: string; workspaceRoot: string } {
	const root = resolve(PROJECT_ROOT, ".runs/v3-5-g1/tests", `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	const dataRoot = resolve(root, "data");
	const workspaceRoot = resolve(root, "workspace");
	mkdirSync(dataRoot, { recursive: true });
	mkdirSync(workspaceRoot, { recursive: true });
	writeFileSync(resolve(workspaceRoot, "context.txt"), "persistent context fixture\n", "utf8");
	return { root, dataRoot, workspaceRoot };
}

function processTurn(action: "create" | "continue", input: { dataRoot: string; workspaceRoot: string; sessionId: string; runId: string; prompt: string }): Record<string, unknown> {
	const result = spawnSync(process.execPath, ["--experimental-loader", LOADER, "./workbench/scripts/v35-session-cli.ts", action, "--data-root", input.dataRoot, "--project-id", "project-v35", "--workspace-root", input.workspaceRoot, "--workspace-id", "workspace-v35", "--session-id", input.sessionId, "--run-id", input.runId, "--prompt", input.prompt, "--title", "Persistent proof"], { cwd: PROJECT_ROOT, encoding: "utf8", env: { NO_COLOR: "1" } });
	assert.equal(result.status, 0, result.stderr);
	return JSON.parse(result.stdout) as Record<string, unknown>;
}

test("V3.5 Goal 1 Process A/Process B proof reopens prior context and preserves two Run links", () => {
	const root = roots("cross-process");
	const first = processTurn("create", { ...root, sessionId: "session-proof", runId: "run-a", prompt: "Process A prompt" });
	const firstManifest = first.manifest as Record<string, unknown>;
	assert.equal(firstManifest.prior_context_message_count, 0);
	assert.deepEqual(firstManifest.tool_call_ids, ["run-a-tool-1"]);
	assert.deepEqual(firstManifest.tool_result_ids, ["run-a-tool-1"]);
	const second = processTurn("continue", { ...root, sessionId: "session-proof", runId: "run-b", prompt: "Process B prompt" });
	const secondManifest = second.manifest as Record<string, unknown>;
	assert.ok(Number(secondManifest.prior_context_message_count) >= 4);
	assert.equal(secondManifest.prior_context_sha256, secondManifest.provider_observed_prior_context_sha256);
	assert.ok((second.listed_before as string[]).includes("session-proof"));
	const view = second.view as { runs: Array<{ run_id: string; context_reconstructed: boolean }>; messages: Array<{ role: string; tool_call_id: string | null }> };
	assert.deepEqual(view.runs.map((run) => run.run_id), ["run-a", "run-b"]);
	assert.equal(view.runs.every((run) => run.context_reconstructed), true);
	assert.ok(view.messages.some((message) => message.role === "tool" && message.tool_call_id === "run-a-tool-1"));
	assert.ok(view.messages.some((message) => message.role === "tool" && message.tool_call_id === "run-b-tool-1"));
});

test("safe Session projection removes reasoning, credentials, raw tool arguments, and absolute paths", async () => {
	const root = roots("safe-projection");
	const service = new PersistentSessionServiceV35({ dataRoot: root.dataRoot, projectId: "project-v35", workspaceRoot: root.workspaceRoot, workspaceId: "workspace-v35" });
	await service.create({ sessionId: "session-safe", title: "Safe projection" });
	const repo = new JsonlSessionRepo({ fs: new NodeExecutionEnv({ cwd: root.dataRoot, shellEnv: {} }), sessionsRoot: resolve(root.dataRoot, "sessions") });
	const metadata = (await repo.list()).find((entry) => entry.id === "session-safe");
	assert.ok(metadata);
	const session = await repo.open(metadata);
	await session.appendMessage({ role: "assistant", content: [{ type: "thinking", thinking: "PRIVATE_REASONING_SENTINEL", thinkingSignature: "PRIVATE_SIGNATURE" }, { type: "toolCall", id: "unsafe-call", name: "probe", arguments: { path: "C:/unsafe/raw/path", authorization: "Bearer TOP_SECRET" } }], api: "faux", provider: "faux", model: "faux", usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } }, stopReason: "toolUse", timestamp: 1 } as unknown as AgentMessage);
	await session.appendMessage({ role: "toolResult", toolCallId: "unsafe-call", toolName: "probe", content: [{ type: "text", text: "authorization=TOP_SECRET from C:/unsafe/result/path" }], isError: false, timestamp: 2 } as unknown as AgentMessage);
	const view = await service.inspect("session-safe");
	const serialized = JSON.stringify(view);
	assert.doesNotMatch(serialized, /PRIVATE_REASONING_SENTINEL|PRIVATE_SIGNATURE|TOP_SECRET|C:\/unsafe\/raw\/path/);
	assert.match(serialized, /credential omitted/);
	assert.ok(view.messages.some((message) => message.tool_arguments_sha256 !== null));
});

test("catalog, project, Workspace, missing Run, corruption, and path escape fail closed", async () => {
	const root = roots("fail-closed");
	const service = new PersistentSessionServiceV35({ dataRoot: root.dataRoot, projectId: "project-v35", workspaceRoot: root.workspaceRoot, workspaceId: "workspace-v35" });
	await service.create({ sessionId: "session-guard", title: "Guard" });
	await service.executeTurn({ sessionId: "session-guard", runId: "run-guard", prompt: "guard prompt" });
	const catalogPath = resolve(root.dataRoot, "catalog-v1.json");
	const original = readFileSync(catalogPath, "utf8");
	const catalog = JSON.parse(original) as { project_id: string; sessions: Array<{ workspace_id: string; pi_session_ref: string; run_refs: Array<{ run_ref: string }> }> };
	catalog.project_id = "foreign-project";
	writeFileSync(catalogPath, JSON.stringify(catalog), "utf8");
	assert.throws(() => service.list(), /cross-project/);
	writeFileSync(catalogPath, original, "utf8");
	const mismatch = JSON.parse(original) as typeof catalog;
	mismatch.sessions[0]!.workspace_id = "foreign-workspace";
	writeFileSync(catalogPath, JSON.stringify(mismatch), "utf8");
	await assert.rejects(service.inspect("session-guard"), /Workspace identity mismatch/);
	writeFileSync(catalogPath, original, "utf8");
	const escape = JSON.parse(original) as typeof catalog;
	escape.sessions[0]!.pi_session_ref = "../escape.jsonl";
	writeFileSync(catalogPath, JSON.stringify(escape), "utf8");
	await assert.rejects(service.inspect("session-guard"), /invalid operational relative path/);
	writeFileSync(catalogPath, original, "utf8");
	const missingRun = JSON.parse(original) as typeof catalog;
	missingRun.sessions[0]!.run_refs[0]!.run_ref = "runs/missing/manifest.json";
	writeFileSync(catalogPath, JSON.stringify(missingRun), "utf8");
	await assert.rejects(service.inspect("session-guard"), /missing/);
	writeFileSync(catalogPath, "{broken", "utf8");
	assert.throws(() => service.list(), /missing or corrupt/);
	const missingCatalog = resolve(root.root, "missing-catalog");
	cpSync(root.dataRoot, missingCatalog, { recursive: true });
	unlinkSync(resolve(missingCatalog, "catalog-v1.json"));
	assert.throws(() => new PersistentSessionServiceV35({ dataRoot: missingCatalog, projectId: "project-v35", workspaceRoot: root.workspaceRoot, workspaceId: "workspace-v35" }), /catalog is missing/);
});

test("versioned Read Model adapters use bounded source references and explicit unavailable fallback", () => {
	const root = roots("read-model");
	const v2 = resolve(root.root, "v2");
	mkdirSync(resolve(v2, "candidates/a"), { recursive: true });
	writeFileSync(resolve(v2, "candidates/a/candidate.json"), JSON.stringify({ candidate_path_id: "candidate-a" }), "utf8");
	writeFileSync(resolve(v2, "terminal.json"), JSON.stringify({ run_id: "v2-run", outcome: "recovery_selected", selected_candidate_id: "candidate-a", candidate_refs: [{ path: "candidates/a/candidate.json" }] }), "utf8");
	assert.deepEqual(readV2RecoveryComparisonV35({ sourceRoot: v2 }).candidate_ids, ["candidate-a"]);
	const v3 = resolve(root.root, "v3");
	mkdirSync(v3, { recursive: true });
	writeFileSync(resolve(v3, "manifest.json"), JSON.stringify({ run_id: "v3-run", binding_digest: "binding", verifier_status: "passed" }), "utf8");
	writeFileSync(resolve(v3, "runtime.json"), JSON.stringify({ run_id: "v3-run", binding_digest: "binding", runtime_path: "prompt_addendum" }), "utf8");
	assert.equal(readV3PromptAdaptationV35({ sourceRoot: v3 }).runtime_path, "prompt_addendum");
	assert.equal(goal2SkillComparisonPlaceholderV35().source_status, "unavailable");
	const legacy = resolve(root.root, "legacy");
	mkdirSync(legacy, { recursive: true });
	writeFileSync(resolve(legacy, "manifest.json"), JSON.stringify({ run_id: "legacy-run", status: "passed" }), "utf8");
	assert.equal(readLegacyRunFallbackV35({ sourceRoot: legacy }).session_link, "not_recorded");
	assert.throws(() => readLegacyRunFallbackV35({ sourceRoot: legacy, sourceRef: "../escape.json" }), /path escape/);
});

test("catalog cannot override authoritative Run or Pi Session identity", async () => {
	const root = roots("authority");
	const service = new PersistentSessionServiceV35({ dataRoot: root.dataRoot, projectId: "project-v35", workspaceRoot: root.workspaceRoot, workspaceId: "workspace-v35" });
	await service.create({ sessionId: "session-authority", title: "Authority" });
	await service.executeTurn({ sessionId: "session-authority", runId: "run-authority", prompt: "authority prompt" });
	const tampered = resolve(root.root, "tampered");
	cpSync(root.dataRoot, tampered, { recursive: true });
	const manifestPath = resolve(tampered, "runs/run-authority/manifest.json");
	const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { session_id: string };
	manifest.session_id = "foreign-session";
	writeFileSync(manifestPath, JSON.stringify(manifest), "utf8");
	const rejected = new PersistentSessionServiceV35({ dataRoot: tampered, projectId: "project-v35", workspaceRoot: root.workspaceRoot, workspaceId: "workspace-v35" });
	await assert.rejects(rejected.inspect("session-authority"), /catalog\/Run authority identity mismatch/);
});
