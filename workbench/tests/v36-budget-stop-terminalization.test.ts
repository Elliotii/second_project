import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall } from "@earendil-works/pi-ai";
import { FROZEN_DOCKER_PROFILE_V36 } from "../src/execution/docker-v36.ts";
import { digestObject, sha256 } from "../src/hash.ts";
import { ProjectProfileRegistryV36 } from "../src/project/registry-v36.ts";
import { PersistentSessionServiceV35 } from "../src/session/persistent-session-v35.ts";
import { InteractiveControlPlaneV36, type InteractiveDispatchInputV36 } from "../src/v36/authority-v36.ts";
import { assertBoundedEditBudgetProfileV36, type BoundedEditBudgetProfileV36, V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE, V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE } from "../src/v36/budget-profile-v36.ts";
import { Goal3WorkbenchApplicationV35 } from "../src/webui/application-v35g3.ts";
import { WorkbenchApplicationV36G1 } from "../src/webui/application-v36g1.ts";
import { Goal2WorkbenchExtensionV36 } from "../src/webui/application-v36g2.ts";
import { loadGoal3DemoProjectionV35 } from "../src/webui/projection-v35g3.ts";
import { createWorkbenchLoopbackServerV36G1 } from "../src/webui/server-v36g1.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const implementation = `export function parseDuration(input) {
  if (typeof input !== "string") throw new Error("invalid duration");
  return 1000;
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

function writeFauxDockerCommandEvidence(input: InteractiveDispatchInputV36, commandId: string) {
	const commandRoot = resolve(dirname(input.authority_path), "docker-commands", "command-1");
	mkdirSync(commandRoot, { recursive: true });
	const authorityBody = {
		schema_version: 1 as const,
		authority_kind: "v36_docker_registered_command" as const,
		execution_id: `v36-docker-${input.run_id}`,
		command_id: commandId,
		executable: "node" as const,
		argv: ["--test"],
		workspace_identity: sha256(`${input.run_id}-workspace`),
		backend_profile_digest: FROZEN_DOCKER_PROFILE_V36.profile_digest,
		created_at: "2026-08-12T00:00:00.000Z",
	};
	const authority = { ...authorityBody, authority_digest: digestObject(authorityBody) };
	const terminalBody = {
		schema_version: 1 as const,
		execution_id: authority.execution_id,
		command_id: commandId,
		authority_digest: authority.authority_digest,
		backend_profile_digest: FROZEN_DOCKER_PROFILE_V36.profile_digest,
		status: "nonzero_exit" as const,
		create: { attempted: true, succeeded: true, container_identity: sha256(`${input.run_id}-container`) },
		start: { attempted: true, succeeded: true },
		output: { stdout: "", stderr: "faux registered command failed", combined_bytes_observed: 30, truncated: false },
		inspect: { attempted: true, succeeded: true, exit_code: 1, oom_killed: false, mount_count: 1, profile_match: true },
		timeout: { triggered: false, wall_timeout_ms: 30_000 as const },
		kill: { attempted: false, succeeded: false },
		remove: { attempted: true, succeeded: true },
		exit_code: 1,
		timed_out: false,
		cleanup_complete: true,
		error_code: null,
	};
	const terminal = { ...terminalBody, terminal_digest: digestObject(terminalBody) };
	writeFileSync(resolve(commandRoot, "authority.json"), `${JSON.stringify(authority)}\n`);
	writeFileSync(resolve(commandRoot, "terminal.json"), `${JSON.stringify(terminal)}\n`);
	return { authority, terminal };
}

function rehashTerminal(record: Record<string, unknown>): Record<string, unknown> {
	const { terminal_digest: _digest, ...body } = record;
	return { ...body, terminal_digest: digestObject(body) };
}

function setup(options: { terminalized?: boolean; budgetProfile?: BoundedEditBudgetProfileV36; dailyTerminal?: boolean; crossObservationAndSettle?: boolean } = {}) {
	const root = resolve(PROJECT_ROOT, ".runs/post-v3-6-budget-stop-maintenance", `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
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
		risk_notice: "Faux-only maintenance regression; no Provider, network, Docker, or Source mutation is authorized.",
		execution_backend_profile_id: "docker-v36g2-frozen",
		provider_model_policy_id: "host-faux-policy",
		pi_native_skills: [],
		harness_adaptations: [],
		command_descriptors: [{ command_id: "test", executable: "current_node_executable", argv: ["--test"], cwd: "workspace", timeout_seconds: 30, max_combined_output_bytes: 65_536 }],
		current_state: () => ({ state_digest: sha256("budget-stop-state") }),
	}]);
	const dispatch = async (input: InteractiveDispatchInputV36) => {
		const models = createModels();
		const registration = fauxProvider({ provider: `v36-budget-stop-faux-${input.run_id}` });
		models.setProvider(registration.provider);
		const readCount = options.dailyTerminal ? 22 : 14;
		const toolResponses = [
			fauxAssistantMessage(fauxToolCall("workspace_write", { path: "src/parse-duration.js", content: implementation }, { id: `${input.run_id}-write` }), { stopReason: "toolUse" }),
			fauxAssistantMessage(fauxToolCall("run_command", { command_id: "test" }, { id: `${input.run_id}-test` }), { stopReason: "toolUse" }),
			...Array.from({ length: readCount }, (_, index) => fauxAssistantMessage(fauxToolCall("workspace_read", { path: "src/parse-duration.js" }, { id: `${input.run_id}-read-${index + 1}` }), { stopReason: "toolUse" })),
		];
		registration.setResponses(options.crossObservationAndSettle ? [...toolResponses.slice(0, 16), fauxAssistantMessage("Faux settled after crossing the observation threshold.")] : options.terminalized === false ? [toolResponses[0]!, toolResponses[1]!, fauxAssistantMessage("Faux settled bounded Turn.")] : toolResponses);
		return await input.service.executeBoundedTurn({
			sessionId: input.session_id,
			runId: input.run_id,
			prompt: input.task_text,
			taskPolicy: { writable_paths: ["src/parse-duration.js"], protected_paths: ["test/**", "package.json"], command_descriptors: [{ command_id: "test", executable: "current_node_executable", argv: ["--test"], cwd: "workspace", timeout_seconds: 30, max_combined_output_bytes: 65_536 }] },
			commandExecutor: async ({ descriptor }) => {
				const evidence = writeFauxDockerCommandEvidence(input, descriptor.command_id);
				return { command_id: descriptor.command_id, executable: "faux_registered_command", argv: [...descriptor.argv], exit_code: 1, timed_out: false, truncated: false, output: "faux registered command failed", backend_profile_digest: FROZEN_DOCKER_PROFILE_V36.profile_digest, authority_digest: evidence.authority.authority_digest, terminal_digest: evidence.terminal.terminal_digest, cleanup_complete: true };
			},
			budgetProfile: options.budgetProfile ?? V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE,
			models,
			model: registration.getModel(),
			systemPrompt: "Use only the bounded Workspace tools and the registered command.",
			authorityDigest: input.authority.authority_digest,
			credentialReads: 0,
			externalModel: false,
		});
	};
	const plane = new InteractiveControlPlaneV36({ dataRoot: data, registry, goal2Enabled: true, dispatch });
	const legacy = new Goal3WorkbenchApplicationV35({ sessionService: new PersistentSessionServiceV35({ dataRoot: legacyData, projectId: "legacy", workspaceRoot: legacyWorkspace, workspaceId: "legacy" }), projection: loadGoal3DemoProjectionV35(resolve(PROJECT_ROOT, "fixtures/v3-5/goal3-demo/projection.json")) });
	const app = new WorkbenchApplicationV36G1({ legacy, controlPlane: plane, goal2: new Goal2WorkbenchExtensionV36(plane) });
	return { data, source, registry, plane, app };
}

test("Host-owned frozen and daily budget profiles are exact and reject drift", () => {
	assert.deepEqual(V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE, { profile_id: "v36g2_frozen_acceptance_v1", provider_requests_observation_threshold: 16, provider_requests_hard_max: 16, tool_calls_hard_max: 24, combined_tokens_hard_max: 131_072, cost_usd_hard_max: 0.2, wall_time_ms_hard_max: 900_000 });
	assert.deepEqual(V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE, { profile_id: "v36_daily_bounded_edit_v2", provider_requests_observation_threshold: 16, provider_requests_hard_max: 24, tool_calls_hard_max: 24, combined_tokens_hard_max: 131_072, cost_usd_hard_max: 0.2, wall_time_ms_hard_max: 900_000 });
	assert.doesNotThrow(() => assertBoundedEditBudgetProfileV36(V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE));
	assert.throws(() => assertBoundedEditBudgetProfileV36({ ...V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE, provider_requests_hard_max: 25 }), /budget profile is invalid/);
});

test("a normal bounded faux Turn remains a settled V3.6 result", async () => {
	const fixture = setup({ terminalized: false });
	const sourceBefore = readFileSync(resolve(fixture.source, "src/parse-duration.js"), "utf8");
	const view = await fixture.plane.submit({ project_id: "duration-parser", requested_mode: "bounded_edit", task_text: "Make the smallest parser repair and use the registered test command.", title: "Settled control" });
	const run = view.runs[0]!;
	assert.equal(run.settled, true);
	assert.equal(run.terminal, null);
	assert.equal(existsSync(resolve(fixture.data, "sessions", view.session_id, "runtime", "runs", run.run_id, "manifest.json")), true);
	assert.equal(existsSync(resolve(fixture.data, "sessions", view.session_id, "runtime", "runs", run.run_id, "budget-stop.json")), false);
	assert.equal(existsSync(resolve(fixture.data, "interactive-evidence", "runs", run.run_id, "result.json")), true);
	assert.equal(readFileSync(resolve(fixture.source, "src/parse-duration.js"), "utf8"), sourceBefore);
});

test("the daily profile observes 16 requests without stopping and can settle on request 17", async () => {
	const fixture = setup({ budgetProfile: V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE, crossObservationAndSettle: true });
	const view = await fixture.plane.submit({ project_id: "duration-parser", requested_mode: "bounded_edit", task_text: "Complete a medium bounded edit and run the registered command.", title: "Daily observation threshold" });
	const run = view.runs[0]!;
	assert.equal(run.settled, true);
	assert.equal(run.terminal, null);
	const manifest = JSON.parse(readFileSync(resolve(fixture.data, "sessions", view.session_id, "runtime", "runs", run.run_id, "manifest.json"), "utf8")) as { provider_requests: number };
	assert.equal(manifest.provider_requests, 17);
});

test("the daily profile terminalizes exactly at request attempt 25 while preserving safe review", async () => {
	const fixture = setup({ budgetProfile: V36_DAILY_BOUNDED_EDIT_BUDGET_PROFILE, dailyTerminal: true });
	const view = await fixture.plane.submit({ project_id: "duration-parser", requested_mode: "bounded_edit", task_text: "Reach the daily hard boundary deterministically.", title: "Daily hard stop" });
	const run = view.runs[0]!;
	assert.equal(run.settled, false);
	assert.deepEqual(run.terminal!.request_usage, { attempts: 25, used: 24, max: 24 });
	assert.equal(view.persistent_session.runs[0]!.terminal!.trajectory_outcome, "pre_dispatch_budget_terminal");
	const reopened = new InteractiveControlPlaneV36({ dataRoot: fixture.data, registry: fixture.registry, goal2Enabled: true });
	assert.deepEqual((await reopened.session(view.session_id)).runs[0]!.terminal!.request_usage, { attempts: 25, used: 24, max: 24 });
});

test("the exact local seventeenth Provider request persists one authenticated non-settled terminal and remains safely inspectable", { timeout: 30_000 }, async () => {
	const fixture = setup();
	const loopback = createWorkbenchLoopbackServerV36G1(fixture.app);
	const address = await loopback.start();
	try {
		const sourceBefore = readFileSync(resolve(fixture.source, "src/parse-duration.js"), "utf8");
		const submitted = await raw(address.port, "/api/v1/v36/tasks", "POST", { project_id: "duration-parser", requested_mode: "bounded_edit", task_text: "Make the smallest parser repair and use the registered test command.", title: "Budget terminal" });
		assert.equal(submitted.status, 201, submitted.text);
		const view = submitted.value as {
			session_id: string;
			pins: { source_snapshot_identity: string };
			runs: Array<{ run_id: string; settled: boolean; terminal: { terminal_reason: string; request_usage: { attempts: number; used: number; max: number }; usage: { known: boolean }; last_registered_command: { command_id: string; exit_code: number | null } | null } }>;
			persistent_session: { runs: Array<{ settled: boolean; terminal: { trajectory_outcome: string } | null }> };
			goal2: { continuation: string; changes: { change_set_digest: string; changes: Array<{ path: string }>; handoff_actions: string[] } };
		};
		const run = view.runs[0]!;
		assert.equal(run.settled, false);
		assert.equal(run.terminal!.terminal_reason, "provider_request_budget_exhausted");
		assert.deepEqual(run.terminal!.request_usage, { attempts: 17, used: 16, max: 16 });
		assert.equal(run.terminal!.usage.known, true);
		assert.deepEqual({ command_id: run.terminal!.last_registered_command!.command_id, exit_code: run.terminal!.last_registered_command!.exit_code }, { command_id: "test", exit_code: 1 });
		assert.equal(view.persistent_session.runs[0]!.settled, false);
		assert.equal(view.persistent_session.runs[0]!.terminal!.trajectory_outcome, "pre_dispatch_budget_terminal");
		assert.equal(view.goal2.continuation, "new_session_required_after_budget_terminal");
		assert.deepEqual(view.goal2.changes.changes.map((change) => change.path), ["src/parse-duration.js"]);
		assert.deepEqual(view.goal2.changes.handoff_actions, ["discard", "export"]);
		assert.equal(readFileSync(resolve(fixture.source, "src/parse-duration.js"), "utf8"), sourceBefore);

		const runtimeRun = resolve(fixture.data, "sessions", view.session_id, "runtime", "runs", run.run_id);
		const evidenceRun = resolve(fixture.data, "interactive-evidence", "runs", run.run_id);
		assert.equal(existsSync(resolve(runtimeRun, "budget-stop.json")), true);
		assert.equal(existsSync(resolve(runtimeRun, "manifest.json")), false);
		assert.equal(existsSync(resolve(evidenceRun, "authority.json")), true);
		assert.equal(existsSync(resolve(evidenceRun, "result.json")), false);
		const terminalPath = resolve(runtimeRun, "budget-stop.json");
		const originalTerminal = readFileSync(terminalPath, "utf8");
		assert.doesNotMatch(originalTerminal, /credential|authorization|bearer/i);
		assert.doesNotMatch(originalTerminal, /[A-Za-z]:[\\/]/);

		const reopened = new InteractiveControlPlaneV36({ dataRoot: fixture.data, registry: fixture.registry, goal2Enabled: true });
		const reopenedView = await reopened.session(view.session_id);
		assert.equal(reopenedView.runs[0]!.terminal!.request_usage.used, 16);
		const continued = await raw(address.port, "/api/v1/v36/tasks", "POST", { project_id: "duration-parser", requested_mode: "bounded_edit", task_text: "Continue this failed Session.", session_id: view.session_id });
		assert.equal(continued.status, 400);
		const applied = await raw(address.port, "/api/v1/v36/handoff", "POST", { session_id: view.session_id, change_set_digest: view.goal2.changes.change_set_digest, action: "apply_all" });
		assert.equal(applied.status, 400);
		assert.match(applied.text, /request rejected/);
		assert.equal(readFileSync(resolve(fixture.source, "src/parse-duration.js"), "utf8"), sourceBefore);

		const projected = await raw(address.port, `/api/v1/v36/sessions/${view.session_id}`);
		assert.equal(projected.status, 200, projected.text);
		const changeSetDigest = (projected.value as { goal2: { changes: { change_set_digest: string } } }).goal2.changes.change_set_digest;
		const exported = await raw(address.port, "/api/v1/v36/handoff", "POST", { session_id: view.session_id, change_set_digest: changeSetDigest, action: "export" });
		assert.equal(exported.status, 200, exported.text);
		const discarded = await raw(address.port, "/api/v1/v36/handoff", "POST", { session_id: view.session_id, change_set_digest: changeSetDigest, action: "discard" });
		assert.equal(discarded.status, 200, discarded.text);
		assert.equal(readFileSync(resolve(fixture.source, "src/parse-duration.js"), "utf8"), sourceBefore);
		writeFileSync(resolve(fixture.source, "src/parse-duration.js"), `${sourceBefore}\n// fixture-only registered Source drift\n`);
		const sessionsBeforeDrift = (await reopened.sessions()).length;
		const drifted = await raw(address.port, "/api/v1/v36/sessions/from-updated-source", "POST", { previous_session_id: view.session_id });
		assert.equal(drifted.status, 400);
		assert.equal((await reopened.sessions()).length, sessionsBeforeDrift);
		writeFileSync(resolve(fixture.source, "src/parse-duration.js"), sourceBefore);
		const fresh = await raw(address.port, "/api/v1/v36/sessions/from-updated-source", "POST", { previous_session_id: view.session_id });
		assert.equal(fresh.status, 201, fresh.text);
		const freshView = fresh.value as { session_id: string; title: string; runs: unknown[]; pins: { source_snapshot_identity: string } };
		assert.notEqual(freshView.session_id, view.session_id);
		assert.match(freshView.title, /^Clean Registered Source/);
		assert.equal(freshView.runs.length, 0);
		assert.equal(freshView.pins.source_snapshot_identity, view.pins.source_snapshot_identity);

		const dockerCommandRoot = resolve(evidenceRun, "docker-commands", "command-1");
		const dockerAuthorityPath = resolve(dockerCommandRoot, "authority.json");
		const dockerTerminalPath = resolve(dockerCommandRoot, "terminal.json");
		const originalDockerAuthority = readFileSync(dockerAuthorityPath, "utf8");
		const originalDockerTerminal = readFileSync(dockerTerminalPath, "utf8");
		const forgedUsage = JSON.parse(originalTerminal) as Record<string, unknown>;
		forgedUsage.input_tokens = (forgedUsage.input_tokens as number) + 1;
		writeFileSync(terminalPath, `${JSON.stringify(rehashTerminal(forgedUsage))}\n`);
		await assert.rejects(() => reopened.session(view.session_id), /Session-derived accounting does not match/);
		const forgedToolCount = JSON.parse(originalTerminal) as Record<string, unknown>;
		forgedToolCount.tool_calls = 15;
		writeFileSync(terminalPath, `${JSON.stringify(rehashTerminal(forgedToolCount))}\n`);
		await assert.rejects(() => reopened.session(view.session_id), /Session-derived accounting does not match/);
		const forgedLastCommand = JSON.parse(originalTerminal) as Record<string, unknown>;
		forgedLastCommand.last_registered_command = { ...(forgedLastCommand.last_registered_command as Record<string, unknown>), exit_code: 0 };
		writeFileSync(terminalPath, `${JSON.stringify(rehashTerminal(forgedLastCommand))}\n`);
		await assert.rejects(() => reopened.session(view.session_id), /Docker command evidence does not match/);
		writeFileSync(terminalPath, originalTerminal);
		unlinkSync(dockerAuthorityPath);
		await assert.rejects(() => reopened.session(view.session_id), /Docker command evidence is missing or ambiguous/);
		writeFileSync(dockerAuthorityPath, originalDockerAuthority);
		const tamperedDockerTerminal = JSON.parse(originalDockerTerminal) as Record<string, unknown>;
		tamperedDockerTerminal.exit_code = 0;
		writeFileSync(dockerTerminalPath, `${JSON.stringify(rehashTerminal(tamperedDockerTerminal))}\n`);
		await assert.rejects(() => reopened.session(view.session_id), /Docker command evidence does not match/);
		writeFileSync(dockerTerminalPath, originalDockerTerminal);
		writeFileSync(resolve(dockerCommandRoot, "unexpected.json"), "{}\n");
		await assert.rejects(() => reopened.session(view.session_id), /Docker command evidence is missing or ambiguous/);
		unlinkSync(resolve(dockerCommandRoot, "unexpected.json"));

		unlinkSync(terminalPath);
		await assert.rejects(() => reopened.session(view.session_id), /exactly one settled Manifest or budget terminal/);
		writeFileSync(terminalPath, originalTerminal);
		writeFileSync(resolve(runtimeRun, "manifest.json"), "{}\n");
		await assert.rejects(() => reopened.session(view.session_id), /exactly one settled Manifest or budget terminal/);
		unlinkSync(resolve(runtimeRun, "manifest.json"));
		const forgedAuthority = JSON.parse(originalTerminal) as Record<string, unknown>;
		forgedAuthority.authority_digest = sha256("forged-authority");
		const { terminal_digest: _forgedDigest, ...forgedBody } = forgedAuthority;
		forgedAuthority.terminal_digest = digestObject(forgedBody);
		writeFileSync(terminalPath, `${JSON.stringify(forgedAuthority)}\n`);
		await assert.rejects(() => reopened.session(view.session_id), /authority identity/);
		await assert.rejects(() => reopened.startSessionFromUpdatedSource(view.session_id), /authority identity/);
		const mismatchedSession = JSON.parse(originalTerminal) as Record<string, unknown>;
		mismatchedSession.session_id = "forged-session";
		const { terminal_digest: _sessionDigest, ...sessionBody } = mismatchedSession;
		mismatchedSession.terminal_digest = digestObject(sessionBody);
		writeFileSync(terminalPath, `${JSON.stringify(mismatchedSession)}\n`);
		await assert.rejects(() => reopened.session(view.session_id), /Runtime\/Session\/Workspace identity mismatch/);
		const tamperedCounter = JSON.parse(originalTerminal) as Record<string, unknown>;
		tamperedCounter.provider_dispatches = 15;
		writeFileSync(terminalPath, `${JSON.stringify(tamperedCounter)}\n`);
		await assert.rejects(() => reopened.session(view.session_id), /budget terminal is invalid/);
		writeFileSync(terminalPath, originalTerminal);
		const js = await raw(address.port, "/app.js");
		assert.match(js.text, /Provider request budget stop|Apply All is denied/);
	} finally {
		await loopback.stop();
	}
});
