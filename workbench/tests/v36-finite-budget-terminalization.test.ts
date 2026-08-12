import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall, type AssistantMessage } from "@earendil-works/pi-ai";
import type { ReconciledFiniteBudgetTerminalV36 } from "../src/contracts/v36g2-types.ts";
import { FROZEN_DOCKER_PROFILE_V36 } from "../src/execution/docker-v36.ts";
import { digestObject, sha256 } from "../src/hash.ts";
import { ProjectProfileRegistryV36 } from "../src/project/registry-v36.ts";
import { PersistentSessionServiceV35 } from "../src/session/persistent-session-v35.ts";
import { InteractiveControlPlaneV36, type InteractiveDispatchInputV36 } from "../src/v36/authority-v36.ts";
import { V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE } from "../src/v36/budget-profile-v36.ts";
import { Goal3WorkbenchApplicationV35 } from "../src/webui/application-v35g3.ts";
import { WorkbenchApplicationV36G1 } from "../src/webui/application-v36g1.ts";
import { Goal2WorkbenchExtensionV36 } from "../src/webui/application-v36g2.ts";
import { loadGoal3DemoProjectionV35 } from "../src/webui/projection-v35g3.ts";
import { createWorkbenchLoopbackServerV36G1 } from "../src/webui/server-v36g1.ts";
import { PROJECT_ROOT } from "./helpers.ts";

type Scenario = "token" | "cost" | "token_and_cost" | "tool" | "wall";

function writeCommandEvidence(input: InteractiveDispatchInputV36, pass: boolean) {
	const commandRoot = resolve(dirname(input.authority_path), "docker-commands", "command-1");
	mkdirSync(commandRoot, { recursive: true });
	const authorityBody = {
		schema_version: 1 as const, authority_kind: "v36_docker_registered_command" as const, execution_id: `execution-${input.run_id}`, command_id: "test", executable: "node" as const, argv: ["--test"],
		workspace_identity: sha256(`${input.run_id}-workspace`), backend_profile_digest: FROZEN_DOCKER_PROFILE_V36.profile_digest, created_at: "2026-08-12T00:00:00.000Z",
	};
	const authority = { ...authorityBody, authority_digest: digestObject(authorityBody) };
	const exitCode = pass ? 0 : 1;
	const terminalBody = {
		schema_version: 1 as const, execution_id: authority.execution_id, command_id: "test", authority_digest: authority.authority_digest, backend_profile_digest: FROZEN_DOCKER_PROFILE_V36.profile_digest,
		status: pass ? "succeeded" as const : "nonzero_exit" as const,
		create: { attempted: true, succeeded: true, container_identity: sha256(`${input.run_id}-container`) }, start: { attempted: true, succeeded: true },
		output: { stdout: pass ? "pass" : "", stderr: pass ? "" : "fail", combined_bytes_observed: 4, truncated: false },
		inspect: { attempted: true, succeeded: true, exit_code: exitCode, oom_killed: false, mount_count: 1, profile_match: true }, timeout: { triggered: false, wall_timeout_ms: 30_000 as const },
		kill: { attempted: false, succeeded: false }, remove: { attempted: true, succeeded: true }, exit_code: exitCode, timed_out: false, cleanup_complete: true, error_code: null,
	};
	const terminal = { ...terminalBody, terminal_digest: digestObject(terminalBody) };
	writeFileSync(resolve(commandRoot, "authority.json"), `${JSON.stringify(authority)}\n`);
	writeFileSync(resolve(commandRoot, "terminal.json"), `${JSON.stringify(terminal)}\n`);
	return { authority, terminal, exitCode };
}

function terminalResponses(runId: string, scenario: Scenario): AssistantMessage[] {
	const command = fauxAssistantMessage(fauxToolCall("run_command", { command_id: "test" }, { id: `${runId}-command` }), { stopReason: "toolUse" });
	const tokenExhaustingTool = fauxAssistantMessage(fauxToolCall("workspace_read", { path: "src/parse-duration.js" }, { id: `${runId}-token` }), { stopReason: "toolUse" });
	const costExhaustingTool = fauxAssistantMessage(fauxToolCall("workspace_read", { path: "src/parse-duration.js" }, { id: `${runId}-cost` }), { stopReason: "toolUse" });
	if (scenario === "token") return [tokenExhaustingTool];
	if (scenario === "cost") return [command, costExhaustingTool];
	if (scenario === "token_and_cost") return [command, tokenExhaustingTool];
	if (scenario === "tool") {
		const calls = Array.from({ length: 25 }, (_, index) => fauxToolCall("workspace_read", { path: "src/parse-duration.js" }, { id: `${runId}-read-${index + 1}` }));
		return [fauxAssistantMessage(calls.slice(0, 12), { stopReason: "toolUse" }), fauxAssistantMessage(calls.slice(12), { stopReason: "toolUse" })];
	}
	return [fauxAssistantMessage("wall stop must occur before dispatch")];
}

function usage(input: number, output: number, cost: number): AssistantMessage["usage"] {
	return { input, output, cacheRead: 0, cacheWrite: 0, totalTokens: input + output, cost: { input: cost, output: 0, cacheRead: 0, cacheWrite: 0, total: cost } };
}

function terminalUsage(scenario: Scenario): AssistantMessage["usage"][] | undefined {
	if (scenario === "token") return [usage(1, 131_072, 0)];
	if (scenario === "cost") return [usage(1, 1, 0.1), usage(1, 1, 0.100_001)];
	if (scenario === "token_and_cost") return [usage(1, 1, 0.1), usage(1, 131_072, 0.100_001)];
	return undefined;
}

function setup(scenario: Scenario) {
	const root = resolve(PROJECT_ROOT, ".runs/post-v3-6-finite-budget-terminalization", `${scenario}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	const source = resolve(root, "registered-source");
	const data = resolve(root, "data");
	const legacyData = resolve(root, "legacy-data");
	const legacyWorkspace = resolve(root, "legacy-workspace");
	cpSync(resolve(PROJECT_ROOT, "workbench/fixtures/v36g2/duration-parser"), source, { recursive: true });
	for (const path of [data, legacyData, legacyWorkspace]) mkdirSync(path, { recursive: true });
	const registry = new ProjectProfileRegistryV36([{
		project_id: "duration-parser", display_name: "Duration parser", source_root: source, writable_paths: ["src/parse-duration.js"], protected_paths: ["test/**", "package.json"], supported_modes: ["bounded_edit"],
		risk_notice: "Deterministic finite-budget terminal regression.", execution_backend_profile_id: "docker-v36g2-frozen", provider_model_policy_id: "host-faux-policy", pi_native_skills: [], harness_adaptations: [],
		command_descriptors: [{ command_id: "test", executable: "current_node_executable", argv: ["--test"], cwd: "workspace", timeout_seconds: 30, max_combined_output_bytes: 65_536 }], current_state: () => ({ state_digest: sha256("finite-budget-state") }),
	}]);
	const dispatch = async (input: InteractiveDispatchInputV36) => {
		const models = createModels();
		const registration = fauxProvider({ provider: `finite-budget-${scenario}-${input.run_id}` });
		models.setProvider(registration.provider);
		registration.setResponses(terminalResponses(input.run_id, scenario).map((message) => () => message));
		let wallReads = 0;
		const wallClock = scenario === "wall" ? () => wallReads++ === 0 ? 0 : 900_001 : undefined;
		return await input.service.executeBoundedTurn({
			sessionId: input.session_id, runId: input.run_id, prompt: `exercise ${scenario} terminal`, taskPolicy: { writable_paths: ["src/parse-duration.js"], protected_paths: ["test/**", "package.json"], command_descriptors: [{ command_id: "test", executable: "current_node_executable", argv: ["--test"], cwd: "workspace", timeout_seconds: 30, max_combined_output_bytes: 65_536 }] },
			commandExecutor: async ({ descriptor }) => {
				const evidence = writeCommandEvidence(input, scenario === "cost");
				return { command_id: descriptor.command_id, executable: "faux_registered_command", argv: [...descriptor.argv], exit_code: evidence.exitCode, timed_out: false, truncated: false, output: evidence.exitCode === 0 ? "pass" : "fail", backend_profile_digest: FROZEN_DOCKER_PROFILE_V36.profile_digest, authority_digest: evidence.authority.authority_digest, terminal_digest: evidence.terminal.terminal_digest, cleanup_complete: true };
			},
			budgetProfile: V36G2_FROZEN_BOUNDED_EDIT_BUDGET_PROFILE, models, model: registration.getModel(), systemPrompt: "Use only bounded tools.", authorityDigest: input.authority.authority_digest,
			...(terminalUsage(scenario) === undefined ? {} : { testOnlyAssistantUsageByResponse: terminalUsage(scenario) }),
			...(wallClock === undefined ? {} : { testOnlyClock: wallClock }),
		});
	};
	const plane = new InteractiveControlPlaneV36({ dataRoot: data, registry, goal2Enabled: true, dispatch });
	const legacy = new Goal3WorkbenchApplicationV35({ sessionService: new PersistentSessionServiceV35({ dataRoot: legacyData, projectId: "legacy", workspaceRoot: legacyWorkspace, workspaceId: "legacy" }), projection: loadGoal3DemoProjectionV35(resolve(PROJECT_ROOT, "fixtures/v3-5/goal3-demo/projection.json")) });
	const app = new WorkbenchApplicationV36G1({ legacy, controlPlane: plane, goal2: new Goal2WorkbenchExtensionV36(plane) });
	return { root, source, data, registry, plane, app };
}

test("known Token, cost, simultaneous Token+cost, Tool and clean-boundary wall stops persist one truthful schema-3 terminal", { timeout: 30_000 }, async () => {
	for (const scenario of ["token", "cost", "token_and_cost", "tool", "wall"] as const) {
		const fixture = setup(scenario);
		const sourceBefore = readFileSync(resolve(fixture.source, "src/parse-duration.js"));
		let submitted: Awaited<ReturnType<WorkbenchApplicationV36G1["submitTask"]>>;
		try { submitted = await fixture.app.submitTask({ project_id: "duration-parser", requested_mode: "bounded_edit", task_text: `exercise ${scenario}`, title: scenario }); }
		catch (error) { throw new Error(`${scenario}: ${error instanceof Error ? error.message : String(error)}`, { cause: error }); }
		const view = submitted as typeof submitted & { goal2: { continuation: string; changes: { change_set_digest: string; handoff_actions: string[] } } };
		const run = view.runs[0]!;
		assert.equal(run.settled, false, scenario);
		assert.equal(run.terminal?.settled, false);
		assert.equal(run.terminal?.verification_mode, "unverified");
		assert.equal(run.terminal?.formal_outcome, null);
		assert.deepEqual([run.terminal?.comparison_eligible, run.terminal?.adaptation_eligible, run.terminal?.promotion_eligible], [false, false, false]);
		const dimensions = run.terminal!.stop_dimensions.map((entry) => entry.dimension);
		assert.deepEqual(dimensions, scenario === "token_and_cost" ? ["combined_token", "cost"] : [scenario === "token" ? "combined_token" : scenario === "tool" ? "tool_call" : scenario === "wall" ? "wall_time" : "cost"]);
		assert.equal(run.terminal!.request_usage.max, 16);
		assert.equal(run.terminal!.tool_usage.max, 24);
		if (scenario === "token" || scenario === "cost") assert.deepEqual({ request_max: run.terminal!.request_usage.max, tool_max: run.terminal!.tool_usage.max }, { request_max: 16, tool_max: 24 });
		assert.equal(view.goal2.continuation, "new_session_required_after_budget_terminal");
		assert.deepEqual(view.goal2.changes.handoff_actions, ["discard", "export"]);
		assert.deepEqual(readFileSync(resolve(fixture.source, "src/parse-duration.js")), sourceBefore);
		const terminalPath = resolve(fixture.data, "sessions", view.session_id, "runtime", "runs", run.run_id, "budget-stop.json");
		assert.equal(existsSync(terminalPath), true);
		assert.equal(existsSync(resolve(dirname(terminalPath), "manifest.json")), false);
		const raw = JSON.parse(readFileSync(terminalPath, "utf8")) as ReconciledFiniteBudgetTerminalV36;
		assert.equal(raw.schema_version, 3);
		assert.equal("per_response_usage_floor" in raw, false);
		assert.equal(raw.provider_accounting_reconciled, true);
		assert.equal(raw.tool_lifecycle_reconciled, true);
		assert.equal(raw.command_evidence_reconciled, true);
		if (scenario === "cost") assert.equal(raw.last_registered_command?.observation, "PASS");
		else if (scenario === "token_and_cost") assert.equal(raw.last_registered_command?.observation, "FAIL");
		else assert.equal(raw.last_registered_command, null);
		if (scenario === "tool") assert.deepEqual({ attempts: raw.tool_call_attempts, executed: raw.tool_calls_executed, completed: raw.tool_calls_completed }, { attempts: 25, executed: 24, completed: 24 });
		const reopened = new InteractiveControlPlaneV36({ dataRoot: fixture.data, registry: fixture.registry, goal2Enabled: true });
		assert.deepEqual((await reopened.session(view.session_id)).runs[0]!.terminal!.stop_dimensions, run.terminal!.stop_dimensions);
		await assert.rejects(() => fixture.app.handoff({ session_id: view.session_id, change_set_digest: view.goal2.changes.change_set_digest, action: "apply_all" }), /Apply All is denied/);
		assert.ok(await fixture.app.handoff({ session_id: view.session_id, change_set_digest: view.goal2.changes.change_set_digest, action: "export" }));
		assert.ok(await fixture.app.handoff({ session_id: view.session_id, change_set_digest: view.goal2.changes.change_set_digest, action: "discard" }));
		await assert.rejects(() => fixture.plane.submit({ project_id: "duration-parser", requested_mode: "bounded_edit", task_text: "continue", session_id: view.session_id }), /clean new Session/);
		const fresh = await fixture.app.startSessionFromUpdatedSource({ previous_session_id: view.session_id });
		assert.notEqual(fresh.session_id, view.session_id);
		assert.equal(fresh.runs.length, 0);
		assert.deepEqual(readFileSync(resolve(fixture.source, "src/parse-duration.js")), sourceBefore);
	}
});

test("loopback task API returns an authority-backed typed Token terminal and denies Apply", async () => {
	const fixture = setup("token");
	const sourceBefore = readFileSync(resolve(fixture.source, "src/parse-duration.js"));
	const loopback = createWorkbenchLoopbackServerV36G1(fixture.app);
	const address = await loopback.start();
	try {
		const forbiddenSeam = await fetch(`${address.url}/api/v1/v36/tasks`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ project_id: "duration-parser", requested_mode: "bounded_edit", task_text: "forbidden seam", testOnlyAssistantUsageByResponse: [usage(1, 131_072, 0)] }) });
		assert.equal(forbiddenSeam.status, 400);
		const response = await fetch(`${address.url}/api/v1/v36/tasks`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ project_id: "duration-parser", requested_mode: "bounded_edit", task_text: "authority-backed Token stop", title: "HTTP Token terminal" }) });
		assert.equal(response.status, 201, await response.clone().text());
		const view = await response.json() as { session_id: string; runs: Array<{ settled: boolean; terminal: { terminal_reason: string; stop_dimensions: Array<{ dimension: string; observed: number; allowed: number }>; request_usage: { max: number }; tool_usage: { max: number } } | null }>; goal2: { changes: { change_set_digest: string } } };
		assert.equal(view.runs[0]!.settled, false);
		assert.equal(view.runs[0]!.terminal!.terminal_reason, "accounted_usage_budget_exhausted");
		assert.deepEqual(view.runs[0]!.terminal!.stop_dimensions, [{ dimension: "combined_token", observed: 131_073, allowed: 131_072, capture_phase: "after_provider_response_accounted" }]);
		assert.deepEqual({ request_max: view.runs[0]!.terminal!.request_usage.max, tool_max: view.runs[0]!.terminal!.tool_usage.max }, { request_max: 16, tool_max: 24 });
		const applied = await fetch(`${address.url}/api/v1/v36/handoff`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ session_id: view.session_id, change_set_digest: view.goal2.changes.change_set_digest, action: "apply_all" }) });
		assert.equal(applied.status, 400);
		assert.match(await applied.text(), /request rejected/);
		const javascript = await (await fetch(`${address.url}/app.js`)).text();
		assert.match(javascript, /Crossed finite budget|stop_dimensions/);
		assert.deepEqual(readFileSync(resolve(fixture.source, "src/parse-duration.js")), sourceBefore);
	} finally {
		await loopback.stop();
	}
});

test("forged schema-3 reconciliation, dimensions, command observation and terminal digest fail closed", async () => {
	const fixture = setup("cost");
	const view = await fixture.plane.submit({ project_id: "duration-parser", requested_mode: "bounded_edit", task_text: "cost", title: "cost" });
	const run = view.runs[0]!;
	const path = resolve(fixture.data, "sessions", view.session_id, "runtime", "runs", run.run_id, "budget-stop.json");
	const original = readFileSync(path, "utf8");
	for (const mutate of [
		(value: ReconciledFiniteBudgetTerminalV36) => { value.pending_provider_reservations = 1 as 0; },
		(value: ReconciledFiniteBudgetTerminalV36) => { value.pending_tool_calls = 1 as 0; },
		(value: ReconciledFiniteBudgetTerminalV36) => { value.pending_side_effects = 1 as 0; },
		(value: ReconciledFiniteBudgetTerminalV36) => { value.provider_accounting_reconciled = false as true; },
		(value: ReconciledFiniteBudgetTerminalV36) => { value.tool_lifecycle_reconciled = false as true; },
		(value: ReconciledFiniteBudgetTerminalV36) => { value.usage_known = false as true; },
		(value: ReconciledFiniteBudgetTerminalV36) => { value.stop_dimensions[0]!.observed = value.stop_dimensions[0]!.allowed; },
		(value: ReconciledFiniteBudgetTerminalV36) => { value.cost_usd += 1; value.stop_dimensions[0]!.observed = value.cost_usd; },
		(value: ReconciledFiniteBudgetTerminalV36) => { Object.assign(value, { per_response_usage_floor: { combined_tokens: null, cost_usd: 1.200_001 } }); },
		(value: ReconciledFiniteBudgetTerminalV36) => { value.executed_tool_call_ids = []; },
		(value: ReconciledFiniteBudgetTerminalV36) => { value.harness_diagnostic_error_sha256 = sha256("forged diagnostic"); },
		(value: ReconciledFiniteBudgetTerminalV36) => { value.workspace_identity_at_terminal = sha256("forged workspace"); },
		(value: ReconciledFiniteBudgetTerminalV36) => { value.authority_digest = sha256("forged authority"); },
		(value: ReconciledFiniteBudgetTerminalV36) => { value.last_registered_command!.observation = "FAIL"; },
	] as const) {
		const forged = JSON.parse(original) as ReconciledFiniteBudgetTerminalV36;
		mutate(forged);
		const { terminal_digest: _digest, ...body } = forged;
		forged.terminal_digest = digestObject(body);
		writeFileSync(path, `${JSON.stringify(forged)}\n`);
		await assert.rejects(() => fixture.plane.session(view.session_id));
	}
	writeFileSync(path, original.replace(/[a-f0-9]{64}/, "0".repeat(64)));
	await assert.rejects(() => fixture.plane.session(view.session_id));
	writeFileSync(path, original);
	writeFileSync(resolve(dirname(path), "manifest.json"), "{}\n");
	await assert.rejects(() => fixture.plane.session(view.session_id), /exactly one settled Manifest or budget terminal/);
	unlinkSync(resolve(dirname(path), "manifest.json"));
	unlinkSync(path);
	await assert.rejects(() => fixture.plane.session(view.session_id), /exactly one settled Manifest or budget terminal/);
});
