import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { request } from "node:http";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall } from "@earendil-works/pi-ai";
import { DockerRegisteredCommandExecutorV36, FROZEN_DOCKER_PROFILE_V36 } from "../src/execution/docker-v36.ts";
import { sha256 } from "../src/hash.ts";
import { ProjectProfileRegistryV36 } from "../src/project/registry-v36.ts";
import { PersistentInteractiveSessionServiceV36 } from "../src/session/persistent-session-v36.ts";
import { PersistentSessionServiceV35 } from "../src/session/persistent-session-v35.ts";
import { InteractiveControlPlaneV36 } from "../src/v36/authority-v36.ts";
import { Goal3WorkbenchApplicationV35 } from "../src/webui/application-v35g3.ts";
import { WorkbenchApplicationV36G1 } from "../src/webui/application-v36g1.ts";
import { Goal2WorkbenchExtensionV36 } from "../src/webui/application-v36g2.ts";
import { loadGoal3DemoProjectionV35 } from "../src/webui/projection-v35g3.ts";
import { createWorkbenchLoopbackServerV36G1 } from "../src/webui/server-v36g1.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const dockerExecutable = process.env.V36_DOCKER_EXECUTABLE ?? resolve(process.env.LOCALAPPDATA ?? "", "Programs/DockerDesktop/resources/bin/docker.exe");
const implementation = `export function parseDuration(input) {
  if (typeof input !== "string") throw new Error("invalid duration");
  const match = /^(0|[1-9]\\d*)(ms|s|m|h)$/.exec(input);
  if (!match) throw new Error("invalid duration");
  const value = Number(match[1]);
  const factors = { ms: 1, s: 1000, m: 60000, h: 3600000 };
  const result = value * factors[match[2]];
  if (!Number.isSafeInteger(value) || !Number.isSafeInteger(result)) throw new Error("invalid duration");
  return result;
}
`;

function raw(port: number, path: string, method = "GET", body?: unknown): Promise<{ status: number; value: unknown; text: string }> {
	return new Promise((accept, reject) => {
		const bytes = body === undefined ? undefined : Buffer.from(JSON.stringify(body));
		const req = request({ host: "127.0.0.1", port, path, method, headers: bytes ? { "content-type": "application/json", "content-length": bytes.length } : {} }, (res) => {
			const chunks: Buffer[] = [];
			res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
			res.on("end", () => { const text = Buffer.concat(chunks).toString("utf8"); let value: unknown = text; try { value = JSON.parse(text) as unknown; } catch {} accept({ status: res.statusCode ?? 0, value, text }); });
		});
		req.on("error", reject);
		if (bytes) req.write(bytes);
		req.end();
	});
}

function setup() {
	const root = resolve(PROJECT_ROOT, ".runs/v3-6/g2/bounded-session", `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	const source = resolve(root, "registered-source");
	const data = resolve(root, "data");
	const legacyData = resolve(root, "legacy-data");
	const legacyWorkspace = resolve(root, "legacy-workspace");
	cpSync(resolve(PROJECT_ROOT, "workbench/fixtures/v36g2/duration-parser"), source, { recursive: true });
	for (const path of [data, legacyData, legacyWorkspace]) mkdirSync(path, { recursive: true });
	const registry = new ProjectProfileRegistryV36([{
		project_id: "duration-parser",
		display_name: "Duration parser",
		source_root: source,
		writable_paths: ["src/parse-duration.js"],
		protected_paths: ["test/**", "package.json"],
		supported_modes: ["inspect_only", "bounded_edit"],
		risk_notice: "Commands run in the frozen network-none Docker profile; Source changes require explicit handoff.",
		execution_backend_profile_id: "docker-v36g2-frozen",
		provider_model_policy_id: "host-faux-policy",
		pi_native_skills: [],
		harness_adaptations: [],
		command_descriptors: [{ command_id: "test", executable: "current_node_executable", argv: ["--test"], cwd: "workspace", timeout_seconds: 30, max_combined_output_bytes: 65_536 }],
		current_state: () => ({ state_digest: sha256("goal2-state") }),
	}]);
	const executor = new DockerRegisteredCommandExecutorV36({ dockerExecutable });
	let turn = 0;
	const plane = new InteractiveControlPlaneV36({
		dataRoot: data,
		registry,
		goal2Enabled: true,
		dispatch: async (input) => {
			turn += 1;
			const models = createModels();
			const registration = fauxProvider({ provider: `v36g2-faux-${turn}` });
			models.setProvider(registration.provider);
			registration.setResponses(turn === 1 ? [
				fauxAssistantMessage(fauxToolCall("workspace_write", { path: "src/parse-duration.js", content: implementation }, { id: `${input.run_id}-write` }), { stopReason: "toolUse" }),
				fauxAssistantMessage(fauxToolCall("run_command", { command_id: "test" }, { id: `${input.run_id}-test` }), { stopReason: "toolUse" }),
				fauxAssistantMessage("Implemented and checked the duration parser."),
			] : [
				fauxAssistantMessage(fauxToolCall("run_command", { command_id: "test" }, { id: `${input.run_id}-test` }), { stopReason: "toolUse" }),
				fauxAssistantMessage("Reviewed integer and overflow boundaries; no correction was needed."),
			]);
			const commandParent = resolve(dirname(input.authority_path), "docker-commands");
			mkdirSync(commandParent, { recursive: true });
			let commandOrdinal = 0;
			return await input.service.executeBoundedTurn({
				sessionId: input.session_id,
				runId: input.run_id,
				prompt: input.task_text,
				taskPolicy: (() => { const registration = registry.resolve("duration-parser").registration; return { writable_paths: [...registration.writable_paths], protected_paths: [...registration.protected_paths], command_descriptors: [...(registration.command_descriptors ?? [])] }; })(),
				commandExecutor: async ({ descriptor, workspace_root }) => await executor.execute({ workspaceRoot: workspace_root, evidenceRoot: resolve(commandParent, `command-${++commandOrdinal}`), descriptor }),
				models,
				model: registration.getModel(),
				systemPrompt: "Modify only the registered managed Workspace scope and run only the registered test command in Docker.",
			});
		},
	});
	const legacy = new Goal3WorkbenchApplicationV35({ sessionService: new PersistentSessionServiceV35({ dataRoot: legacyData, projectId: "legacy", workspaceRoot: legacyWorkspace, workspaceId: "legacy" }), projection: loadGoal3DemoProjectionV35(resolve(PROJECT_ROOT, "fixtures/v3-5/goal3-demo/projection.json")) });
	const app = new WorkbenchApplicationV36G1({ legacy, controlPlane: plane, goal2: new Goal2WorkbenchExtensionV36(plane) });
	return { root, source, app };
}

test("bounded-edit two-Turn Session uses Docker registered commands, exposes safe Changes, and applies once through exact handoff", { timeout: 90_000 }, async () => {
	const fixture = setup();
	const loopback = createWorkbenchLoopbackServerV36G1(fixture.app);
	const address = await loopback.start();
	try {
		const first = await raw(address.port, "/api/v1/v36/tasks", "POST", { project_id: "duration-parser", requested_mode: "bounded_edit", task_text: "Implement parseDuration and run the registered test command.", title: "Duration parser" });
		assert.equal(first.status, 201, first.text);
		const firstView = first.value as { session_id: string; capabilities: { file_write: boolean; docker_commands: boolean; source_apply: boolean }; runs: Array<{ command_execution: string }>; goal2: { changes: { change_set_digest: string; status: string; changes: Array<{ path: string }> } } };
		assert.deepEqual(firstView.capabilities, { file_read: true, file_write: true, planned_file_write: true, project_commands: true, docker_commands: true, source_apply: true });
		assert.equal(firstView.runs[0]!.command_execution, "docker_registered_only");
		assert.equal(firstView.goal2.changes.status, "proposed");
		assert.deepEqual(firstView.goal2.changes.changes.map((entry) => entry.path), ["src/parse-duration.js"]);
		assert.equal(readFileSync(resolve(fixture.source, "src/parse-duration.js"), "utf8").includes("not implemented"), true);

		const second = await raw(address.port, "/api/v1/v36/tasks", "POST", { project_id: "duration-parser", requested_mode: "bounded_edit", task_text: "Review boundary cases, make the smallest correction needed, and run tests again.", session_id: firstView.session_id });
		assert.equal(second.status, 201, second.text);
		const secondView = second.value as { persistent_session: { runs: Array<{ context_reconstructed: boolean }> }; runs: unknown[]; goal2: { changes: { change_set_digest: string } } };
		assert.equal(secondView.runs.length, 2);
		assert.equal(secondView.persistent_session.runs.length, 2);
		assert.equal(secondView.persistent_session.runs.every((run) => run.context_reconstructed), true);

		const injected = await raw(address.port, "/api/v1/v36/handoff", "POST", { session_id: firstView.session_id, change_set_digest: secondView.goal2.changes.change_set_digest, action: "apply_all", path: "src/parse-duration.js" });
		assert.equal(injected.status, 400);
		const applied = await raw(address.port, "/api/v1/v36/handoff", "POST", { session_id: firstView.session_id, change_set_digest: secondView.goal2.changes.change_set_digest, action: "apply_all" });
		assert.equal(applied.status, 200, applied.text);
		assert.deepEqual({ status: (applied.value as { status: string }).status, source_state: (applied.value as { source_state: string }).source_state, retry_safe: (applied.value as { retry_safe: boolean }).retry_safe }, { status: "applied", source_state: "updated", retry_safe: false });
		assert.match(readFileSync(resolve(fixture.source, "src/parse-duration.js"), "utf8"), /Number\.isSafeInteger/);
		const projected = await raw(address.port, `/api/v1/v36/sessions/${firstView.session_id}`);
		assert.equal(projected.status, 200, projected.text);
		const projectedView = projected.value as { pins: { source_snapshot_identity: string }; goal2: { continuation: string; changes: { handoff_result: { status: string; source_state: string } } } };
		assert.equal(projectedView.goal2.continuation, "new_session_required_after_apply");
		assert.equal(projectedView.goal2.changes.handoff_result.status, "applied");
		assert.equal(projectedView.goal2.changes.handoff_result.source_state, "updated");
		const blocked = await raw(address.port, "/api/v1/v36/tasks", "POST", { project_id: "duration-parser", requested_mode: "bounded_edit", task_text: "Continue after apply.", session_id: firstView.session_id });
		assert.equal(blocked.status, 400);
		assert.match(blocked.text, /request rejected/);
		const next = await raw(address.port, "/api/v1/v36/sessions/from-updated-source", "POST", { previous_session_id: firstView.session_id });
		assert.equal(next.status, 201, next.text);
		const nextView = next.value as { session_id: string; runs: unknown[]; pins: { source_snapshot_identity: string }; goal2: { continuation: string } };
		assert.notEqual(nextView.session_id, firstView.session_id);
		assert.notEqual(nextView.pins.source_snapshot_identity, projectedView.pins.source_snapshot_identity);
		assert.equal(nextView.runs.length, 0);
		assert.equal(nextView.goal2.continuation, "allowed");
		const html = await raw(address.port, "/");
		const js = await raw(address.port, "/app.js");
		assert.match(html.text, /Docker evidence|变更交接/);
		assert.match(js.text, /api\/v1\/v36\/handoff|from-updated-source|Changes and Diff/);
		assert.doesNotMatch(first.text + second.text + applied.text, /[A-Za-z]:[\\/]|DockerDesktop|credential/i);
	} finally { await loopback.stop(); }
});

test("a final assistant response exceeding token or cost caps fails before an accepted bounded-Turn Manifest", async () => {
	for (const variant of ["tokens", "cost"] as const) {
		const root = resolve(PROJECT_ROOT, ".runs/v3-6/g2/budget-tests", `${variant}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
		const workspace = resolve(root, "workspace");
		const runtime = resolve(root, "runtime");
		cpSync(resolve(PROJECT_ROOT, "workbench/fixtures/v36g2/duration-parser"), workspace, { recursive: true });
		mkdirSync(runtime, { recursive: true });
		const service = new PersistentInteractiveSessionServiceV36({ runtimeRoot: runtime, workspaceRoot: workspace, projectId: "budget-project", workspaceId: "budget-workspace", sessionId: `budget-${variant}`, title: "Budget", sessionPinDigest: sha256(`pin-${variant}`) });
		await service.create();
		const models = createModels();
		const registration = fauxProvider({ provider: `v36g2-budget-${variant}` });
		models.setProvider(registration.provider);
		registration.setResponses([
			fauxAssistantMessage(fauxToolCall("run_command", { command_id: "test" }, { id: `${variant}-test` }), { stopReason: "toolUse" }),
			fauxAssistantMessage("final over-budget response"),
		]);
		const runId = `budget-run-${variant}`;
		await assert.rejects(() => service.executeBoundedTurn({
			sessionId: `budget-${variant}`,
			runId,
			prompt: "Run the registered test.",
			taskPolicy: { writable_paths: ["src/parse-duration.js"], protected_paths: ["test/**", "package.json"], command_descriptors: [{ command_id: "test", executable: "current_node_executable", argv: ["--test"], cwd: "workspace", timeout_seconds: 30, max_combined_output_bytes: 65_536 }] },
			commandExecutor: async ({ descriptor }) => ({ command_id: descriptor.command_id, executable: "docker_registered_node", argv: [...descriptor.argv], exit_code: 0, timed_out: false, truncated: false, output: "passed", backend_profile_digest: FROZEN_DOCKER_PROFILE_V36.profile_digest, authority_digest: sha256(`authority-${variant}`), terminal_digest: sha256(`terminal-${variant}`), cleanup_complete: true }),
			models,
			model: registration.getModel(),
			systemPrompt: "Run only the registered command.",
			testOnlyFinalAssistantUsageFloor: variant === "tokens" ? { combined_tokens: 131_073 } : { cost_usd: 0.200_001 },
		}), /token\/cost budget exceeded/);
		assert.equal(existsSync(resolve(runtime, "runs", runId, "manifest.json")), false);
		assert.equal(existsSync(resolve(runtime, "runs", runId, "budget-stop.json")), false);
	}
});
