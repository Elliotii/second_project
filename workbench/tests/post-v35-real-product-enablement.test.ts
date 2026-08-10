import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, linkSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { createModels, fauxAssistantMessage, fauxProvider, fauxToolCall, type AssistantMessage } from "@earendil-works/pi-ai";
import type { PostV35RealSmokeAuthority } from "../src/contracts/post-v35-real-types.ts";
import type { VerifierResultV0B } from "../src/contracts/v0b-types.ts";
import { digestObject, fileSha256, sha256, stableJson, treeDigest } from "../src/hash.ts";
import { PersistentSessionServiceV35 } from "../src/session/persistent-session-v35.ts";
import { assertPostV35BudgetV35, createDeferredCredentialFileResolverV35, createPostV35RealSmokeTurnExecutor, parsePostV35RealSmokeAuthority, type PostV35RealModelFactory } from "../src/session/real-smoke-turn-v35.ts";
import { Goal3WorkbenchApplicationV35 } from "../src/webui/application-v35g3.ts";
import { loadGoal3DemoProjectionV35 } from "../src/webui/projection-v35g3.ts";
import { createGoal3LoopbackServerV35 } from "../src/webui/server-v35g3.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const WORKBENCH_ROOT = resolve(PROJECT_ROOT, "workbench");
const LOADER = "./scripts/v35g2-public-pi-loader.mjs";
const PROMPT_ONE = "Implement the frozen first smoke turn.";
const PROMPT_TWO = "Continue from the prior Session without restating its context.";

function roots(label: string): { root: string; dataRoot: string; workspaceRoot: string; authorityPath: string; authority: PostV35RealSmokeAuthority } {
	const root = resolve(PROJECT_ROOT, ".runs/post-v3-5-product-enablement/tests", `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	const dataRoot = resolve(root, "data");
	const workspaceRoot = resolve(root, "workspace");
	mkdirSync(resolve(workspaceRoot, "src"), { recursive: true });
	mkdirSync(resolve(workspaceRoot, "test"), { recursive: true });
	writeFileSync(resolve(workspaceRoot, "package.json"), `${JSON.stringify({ type: "module" })}\n`);
	writeFileSync(resolve(workspaceRoot, "test/public.test.mjs"), "import test from 'node:test'; import assert from 'node:assert/strict'; test('public', () => assert.equal(1, 1));\n");
	const verifier = (id: string, expected: string): string => `import { readFileSync } from "node:fs"; import { resolve } from "node:path"; const ok = readFileSync(resolve(process.env.V35_WORKSPACE, "src/result.txt"), "utf8") === ${JSON.stringify(expected)}; process.stdout.write(JSON.stringify({ schema_version: 1, verifier_id: ${JSON.stringify(id)}, status: ok ? "passed" : "failed", summary: ok ? "passed" : "wrong result", ...(ok ? {} : { failed_checks: ["result"] }) }) + "\\n"); process.exitCode = ok ? 0 : 1;\n`;
	const verifierOne = resolve(root, "verifier-one.mjs");
	const verifierTwo = resolve(root, "verifier-two.mjs");
	writeFileSync(verifierOne, verifier("post-v35-turn-one", "turn-one\n"));
	writeFileSync(verifierTwo, verifier("post-v35-turn-two", "turn-two\n"));
	const body = {
		schema_version: 1 as const,
		mode: "real_product_smoke" as const,
		project_id: "post-v35-test-project",
		workspace_id: "post-v35-test-workspace",
		session_id: "real-session",
		initial_workspace_sha256: treeDigest(workspaceRoot),
		system_prompt: "Use only the bounded workspace tools and finish by running public_test.",
		task_policy: { writable_paths: ["src/**", "test/**"], protected_paths: ["package.json"], command_descriptors: [{ command_id: "public_test" as const, executable: "current_node_executable" as const, argv: ["--test"], cwd: "workspace" as const, timeout_seconds: 30, max_combined_output_bytes: 65_536 }] },
		provider_profile: "deepseek-v4-flash" as const,
		binding_status: "not_applicable" as const,
		per_turn_budget: { provider_requests_total_max: 16 as const, tool_calls_total_max: 24 as const, combined_tokens_total_max: 131_072 as const, cost_usd_total_max: 0.2 as const, wall_time_ms_max: 900_000 as const },
		whole_journey_budget: { provider_requests_total_max: 32 as const, tool_calls_total_max: 48 as const, combined_tokens_total_max: 262_144 as const, cost_usd_total_max: 0.4 as const, wall_time_total_ms_max: 1_800_000 as const },
		turns: [
			{ ordinal: 1 as const, run_id: "real-run-one", prompt_sha256: sha256(PROMPT_ONE), verifier_id: "post-v35-turn-one", verifier_source_path: verifierOne, verifier_sha256: fileSha256(verifierOne), verifier_timeout_ms: 30_000, verifier_output_limit_bytes: 65_536 },
			{ ordinal: 2 as const, run_id: "real-run-two", prompt_sha256: sha256(PROMPT_TWO), verifier_id: "post-v35-turn-two", verifier_source_path: verifierTwo, verifier_sha256: fileSha256(verifierTwo), verifier_timeout_ms: 30_000, verifier_output_limit_bytes: 65_536 },
		] as PostV35RealSmokeAuthority["turns"],
	};
	const authority = { ...body, authority_digest: digestObject(body) };
	const authorityPath = resolve(root, "authority.json");
	writeFileSync(authorityPath, `${stableJson(authority)}\n`);
	mkdirSync(dataRoot, { recursive: true });
	return { root, dataRoot, workspaceRoot, authorityPath, authority };
}

function spawnProcess(action: "create" | "create-only" | "continue", fixture: ReturnType<typeof roots>, runId: string, prompt: string, sessionId = "real-session") {
	const result = spawnSync(process.execPath, ["--experimental-loader", LOADER, "scripts/post-v35-real-smoke-faux-driver.ts", "--action", action, "--data-root", fixture.dataRoot, "--workspace-root", fixture.workspaceRoot, "--authority", fixture.authorityPath, "--session-id", sessionId, "--run-id", runId, "--prompt", prompt, "--access-audit", resolve(fixture.root, "access-audit.jsonl")], { cwd: WORKBENCH_ROOT, encoding: "utf8", env: { NO_COLOR: "1" } });
	return result;
}

function runProcess(action: "create" | "continue", fixture: ReturnType<typeof roots>, runId: string, prompt: string, sessionId = "real-session"): { manifest: Record<string, unknown>; view: Record<string, unknown> } {
	const result = spawnProcess(action, fixture, runId, prompt, sessionId);
	assert.equal(result.status, 0, result.stderr);
	return JSON.parse(result.stdout) as { manifest: Record<string, unknown>; view: Record<string, unknown> };
}

function accessEvents(fixture: ReturnType<typeof roots>): string[] {
	const path = resolve(fixture.root, "access-audit.jsonl");
	return existsSync(path) ? readFileSync(path, "utf8").trim().split(/\r?\n/).filter(Boolean) : [];
}

function withUsage(message: AssistantMessage): AssistantMessage {
	return { ...message, usage: { input: 11, output: 7, cacheRead: 0, cacheWrite: 0, totalTokens: 18, cost: { input: 0.000001, output: 0.000001, cacheRead: 0, cacheWrite: 0, total: 0.000002 } } };
}

function deadlineModelFactory(runId: string, observeRequest: (timeoutMs: number | undefined) => void): PostV35RealModelFactory {
	return {
		create() {
			const models = createModels();
			const registration = fauxProvider({ provider: `post-v35-deadline-${runId}` });
			models.setProvider(registration.provider);
			registration.setResponses([
				(_context, streamOptions) => { observeRequest(streamOptions?.timeoutMs); return withUsage(fauxAssistantMessage(fauxToolCall("workspace_write", { path: "src/result.txt", content: "turn-one\n" }, { id: `${runId}-write` }), { stopReason: "toolUse" })); },
				(_context, streamOptions) => { observeRequest(streamOptions?.timeoutMs); return withUsage(fauxAssistantMessage(fauxToolCall("run_command", { command_id: "public_test" }, { id: `${runId}-test` }), { stopReason: "toolUse" })); },
			]);
			return { models, model: registration.getModel(), async close(): Promise<void> {} };
		},
	};
}

function passedVerifierResult(options: { task: { verifier_id: string; verifier_sha256: string; verifier_command: { timeout_ms: number; output_limit_bytes: number } }; attemptId: string; verifierSnapshotRef: VerifierResultV0B["execution"]["source_snapshot_ref"]; verifierSnapshotPath: string; projectRoot: string }): VerifierResultV0B {
	return {
		schema_version: 1,
		verifier_id: options.task.verifier_id,
		verifier_sha256: options.task.verifier_sha256,
		attempt_id: options.attemptId,
		started_at: "2000-01-01T00:00:00.000Z",
		completed_at: "2000-01-01T00:00:00.001Z",
		duration_ms: 1,
		execution: { executable: process.execPath, executable_identity: { node_version: process.version }, argv: [options.verifierSnapshotPath], cwd: options.projectRoot, cwd_identity: "project_root", shell: false, environment_allowlist_keys: ["NO_COLOR", "V35_WORKSPACE"], timeout_ms: options.task.verifier_command.timeout_ms, output_limit_bytes: options.task.verifier_command.output_limit_bytes, source_snapshot_ref: options.verifierSnapshotRef, source_sha256: options.task.verifier_sha256, source_digest_verified: true },
		status: "passed",
		exit_code: 0,
		timed_out: false,
		summary: "passed",
		full_output_ref: options.verifierSnapshotRef,
		full_output_sha256: options.verifierSnapshotRef.sha256,
		invalid_reason: null,
	};
}

test("Faux default remains unchanged and real mode requires explicit host authority without touching a resolver", async () => {
	const fixture = roots("authority");
	const faux = new PersistentSessionServiceV35({ dataRoot: fixture.dataRoot, projectId: fixture.authority.project_id, workspaceRoot: fixture.workspaceRoot, workspaceId: fixture.authority.workspace_id });
	await faux.create({ sessionId: "faux-session", title: "Faux" });
	const result = await faux.executeTurn({ sessionId: "faux-session", runId: "faux-run", prompt: "remain faux" });
	assert.equal(result.manifest.schema_version, 1);
	assert.equal(result.manifest.credential_reads, 0);
	let resolverCalls = 0;
	const resolver = { async resolve(): Promise<string> { resolverCalls++; return "NOT_USED"; } };
	createPostV35RealSmokeTurnExecutor({ authorized: true, authority: fixture.authority, credentialResolver: resolver, modelFactory: { create() { throw new Error("must not create at composition time"); } } });
	assert.equal(resolverCalls, 0);
	assert.throws(() => createPostV35RealSmokeTurnExecutor({ authorized: false, authority: fixture.authority, credentialResolver: resolver }), /host authority/);
	assert.throws(() => createPostV35RealSmokeTurnExecutor({ authorized: true, authority: fixture.authority }), /opaque Credential resolver/);
});

test("frozen per-turn and whole-journey budgets are both enforced", () => {
	const fixture = roots("budgets");
	const per = fixture.authority.per_turn_budget;
	const whole = fixture.authority.whole_journey_budget;
	const zero = { provider_requests: 0, tool_calls: 0, combined_tokens: 0, cost_usd: 0, wall_time_ms: 0 };
	const exactTurn = { provider_requests: 16, tool_calls: 24, combined_tokens: 131_072, cost_usd: 0.2, wall_time_ms: 900_000 };
	assert.doesNotThrow(() => assertPostV35BudgetV35(exactTurn, exactTurn, per, whole));
	for (const over of [
		{ ...zero, provider_requests: 17 },
		{ ...zero, tool_calls: 25 },
		{ ...zero, combined_tokens: 131_073 },
		{ ...zero, cost_usd: 0.200_001 },
		{ ...zero, wall_time_ms: 900_001 },
	]) assert.throws(() => assertPostV35BudgetV35(over, zero, per, whole), /per-turn/);
	for (const [current, prior] of [
		[{ ...zero, provider_requests: 16 }, { ...zero, provider_requests: 17 }],
		[{ ...zero, tool_calls: 24 }, { ...zero, tool_calls: 25 }],
		[{ ...zero, combined_tokens: 131_072 }, { ...zero, combined_tokens: 131_073 }],
		[{ ...zero, cost_usd: 0.2 }, { ...zero, cost_usd: 0.200_001 }],
		[{ ...zero, wall_time_ms: 900_000 }, { ...zero, wall_time_ms: 900_001 }],
	] as const) assert.throws(() => assertPostV35BudgetV35(current, prior, per, whole), /whole-journey/);
});

test("deferred Credential resolver reads only at resolve and rejects replaced or linked identity", async () => {
	const fixture = roots("credential-identity");
	const invalidAtStartup = resolve(fixture.root, "invalid-at-startup.env");
	writeFileSync(invalidAtStartup, "NOT_A_CREDENTIAL=true\n");
	const deferredInvalid = createDeferredCredentialFileResolverV35(invalidAtStartup);
	await assert.rejects(deferredInvalid.resolve(), /opaque Credential source/);

	const replaced = resolve(fixture.root, "replaced.env");
	writeFileSync(replaced, "DEEPSEEK_API_KEY=FIRST\n");
	const deferredReplaced = createDeferredCredentialFileResolverV35(replaced);
	unlinkSync(replaced);
	writeFileSync(replaced, "DEEPSEEK_API_KEY=SECOND\n");
	await assert.rejects(deferredReplaced.resolve(), /identity changed/);

	const linked = resolve(fixture.root, "linked.env");
	const secondLink = resolve(fixture.root, "linked-copy.env");
	writeFileSync(linked, "DEEPSEEK_API_KEY=VALUE\n");
	const deferredLinked = createDeferredCredentialFileResolverV35(linked);
	linkSync(linked, secondLink);
	await assert.rejects(deferredLinked.resolve(), /ordinary non-link/);
});

test("browser cannot supply Provider, Credential, roots, commands or Verifier source", async () => {
	const fixture = roots("http-fields");
	const service = new PersistentSessionServiceV35({ dataRoot: fixture.dataRoot, projectId: fixture.authority.project_id, workspaceRoot: fixture.workspaceRoot, workspaceId: fixture.authority.workspace_id });
	const app = new Goal3WorkbenchApplicationV35({ sessionService: service, projection: loadGoal3DemoProjectionV35(resolve(PROJECT_ROOT, "fixtures/v3-5/goal3-demo/projection.json")) });
	await app.createSession({ session_id: "browser-session", title: "Browser" });
	const server = createGoal3LoopbackServerV35(app); const address = await server.start(0);
	try {
		for (const field of ["provider", "credential", "workspace_root", "command", "verifier_source"]) {
			const response = await fetch(`${address.url}/api/v1/sessions/browser-session/turns`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ run_id: `run-${field.replace("_", "-")}`, prompt: "x", [field]: "unsafe" }) });
			assert.equal(response.status, 400);
		}
	} finally { await server.stop(); }
});

test("fake real mode persists two settled verified Runs across process reopen with exact context proof", () => {
	const fixture = roots("cross-process-real");
	const first = runProcess("create", fixture, "real-run-one", PROMPT_ONE);
	assert.equal(first.manifest.schema_version, 2);
	assert.equal(first.manifest.mode, "real_product_smoke");
	assert.equal(first.manifest.credential_reads, 1);
	assert.ok(Number(first.manifest.provider_requests) > 0);
	assert.ok(Number(first.manifest.input_tokens) > 0);
	assert.equal(first.manifest.verifier_status, "passed");
	assert.equal(first.manifest.outcome, "passed");
	const second = runProcess("continue", fixture, "real-run-two", PROMPT_TWO);
	assert.equal(second.manifest.prior_run_id, "real-run-one");
	assert.ok(Number(second.manifest.prior_context_message_count) > 0);
	assert.equal(second.manifest.prior_context_sha256, second.manifest.provider_observed_prior_context_sha256);
	assert.equal(second.manifest.verifier_status, "passed");
	const view = second.view as { runs: Array<Record<string, unknown>> };
	assert.deepEqual(view.runs.map((run) => run.run_id), ["real-run-one", "real-run-two"]);
	assert.equal(view.runs.every((run) => run.context_reconstructed === true && run.binding_status === "not_applicable" && run.verifier_status === "passed"), true);
	assert.doesNotMatch(JSON.stringify(second), /IN_MEMORY_TEST_CREDENTIAL|private.reasoning|authorization/i);
});

test("whole-smoke authority rejects wrong Session, wrong Run, replay and third Run before access", () => {
	const wrongSessionFixture = roots("wrong-session");
	const createdWrongSession = spawnProcess("create-only", wrongSessionFixture, "unused", "unused", "second-session");
	assert.equal(createdWrongSession.status, 0, createdWrongSession.stderr);
	const wrongSessionFirst = spawnProcess("continue", wrongSessionFixture, "real-run-one", PROMPT_ONE, "second-session");
	assert.notEqual(wrongSessionFirst.status, 0);
	assert.match(wrongSessionFirst.stderr, /Session identity/);
	assert.equal(accessEvents(wrongSessionFixture).length, 0);

	const fixture = roots("authority-replay");
	runProcess("create", fixture, "real-run-one", PROMPT_ONE);
	let count = accessEvents(fixture).length;
	assert.equal(count, 2);

	for (const result of [
		spawnProcess("continue", fixture, "wrong-run", PROMPT_TWO),
		spawnProcess("continue", fixture, "real-run-one", PROMPT_ONE),
	]) {
		assert.notEqual(result.status, 0);
		assert.equal(accessEvents(fixture).length, count);
	}

	const created = spawnProcess("create-only", fixture, "unused", "unused", "second-session");
	assert.equal(created.status, 0, created.stderr);
	const wrongSession = spawnProcess("continue", fixture, "real-run-one", PROMPT_ONE, "second-session");
	assert.notEqual(wrongSession.status, 0);
	assert.equal(accessEvents(fixture).length, count);

	runProcess("continue", fixture, "real-run-two", PROMPT_TWO);
	count = accessEvents(fixture).length;
	assert.equal(count, 4);
	const third = spawnProcess("continue", fixture, "real-run-three", PROMPT_TWO);
	assert.notEqual(third.status, 0);
	assert.equal(accessEvents(fixture).length, count);
});

test("prior evidence tamper and catalog reference substitution fail before access", () => {
	const tampered = roots("prior-tamper");
	runProcess("create", tampered, "real-run-one", PROMPT_ONE);
	const count = accessEvents(tampered).length;
	const outcomePath = resolve(tampered.dataRoot, "runs/real-run-one/outcome.json");
	const outcome = JSON.parse(readFileSync(outcomePath, "utf8")) as Record<string, unknown>;
	outcome.verifier_status = "failed";
	writeFileSync(outcomePath, `${stableJson(outcome)}\n`);
	const afterTamper = spawnProcess("continue", tampered, "real-run-two", PROMPT_TWO);
	assert.notEqual(afterTamper.status, 0);
	assert.equal(accessEvents(tampered).length, count);

	const substituted = roots("prior-substitution");
	runProcess("create", substituted, "real-run-one", PROMPT_ONE);
	const substituteCount = accessEvents(substituted).length;
	const catalogPath = resolve(substituted.dataRoot, "catalog-v1.json");
	const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as { sessions: Array<{ run_refs: Array<{ run_ref: string }> }> };
	mkdirSync(resolve(substituted.dataRoot, "runs/substituted"), { recursive: true });
	writeFileSync(resolve(substituted.dataRoot, "runs/substituted/manifest.json"), readFileSync(resolve(substituted.dataRoot, "runs/real-run-one/manifest.json")));
	catalog.sessions[0]!.run_refs[0]!.run_ref = "runs/substituted/manifest.json";
	writeFileSync(catalogPath, `${stableJson(catalog)}\n`);
	const afterSubstitution = spawnProcess("continue", substituted, "real-run-two", PROMPT_TWO);
	assert.notEqual(afterSubstitution.status, 0);
	assert.match(afterSubstitution.stderr, /path substitution/);
	assert.equal(accessEvents(substituted).length, substituteCount);
});

test("schema-v2 prior-Run chain and increasing Session prefix counts are authenticated before access", async () => {
	const fixture = roots("prior-chain-authenticated");
	runProcess("create", fixture, "real-run-one", PROMPT_ONE);
	runProcess("continue", fixture, "real-run-two", PROMPT_TWO);
	const count = accessEvents(fixture).length;
	const firstManifestPath = resolve(fixture.dataRoot, "runs/real-run-one/manifest.json");
	const secondManifestPath = resolve(fixture.dataRoot, "runs/real-run-two/manifest.json");
	const catalogPath = resolve(fixture.dataRoot, "catalog-v1.json");
	const firstManifest = JSON.parse(readFileSync(firstManifestPath, "utf8")) as Record<string, unknown>;
	const originalSecond = JSON.parse(readFileSync(secondManifestPath, "utf8")) as Record<string, unknown>;
	const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as { sessions: Array<{ run_refs: Array<{ manifest_sha256?: string }> }> };
	const reader = new PersistentSessionServiceV35({ dataRoot: fixture.dataRoot, projectId: fixture.authority.project_id, workspaceRoot: fixture.workspaceRoot, workspaceId: fixture.authority.workspace_id });

	const nonIncreasing = { ...originalSecond, session_entry_count_after_turn: firstManifest.session_entry_count_after_turn, session_entries_sha256_after_turn: firstManifest.session_entries_sha256_after_turn };
	writeFileSync(secondManifestPath, `${stableJson(nonIncreasing)}\n`);
	catalog.sessions[0]!.run_refs[1]!.manifest_sha256 = fileSha256(secondManifestPath);
	writeFileSync(catalogPath, `${stableJson(catalog)}\n`);
	await assert.rejects(reader.inspect("real-session"), /prefix count is not strictly increasing/);

	const forgedChain = { ...originalSecond, prior_run_id: "forged-prior" };
	writeFileSync(secondManifestPath, `${stableJson(forgedChain)}\n`);
	catalog.sessions[0]!.run_refs[1]!.manifest_sha256 = fileSha256(secondManifestPath);
	writeFileSync(catalogPath, `${stableJson(catalog)}\n`);
	await assert.rejects(reader.inspect("real-session"), /prior-Run chain identity mismatch/);
	const continuation = spawnProcess("continue", fixture, "real-run-three", PROMPT_TWO);
	assert.notEqual(continuation.status, 0);
	assert.match(continuation.stderr, /prior-Run chain identity mismatch/);
	assert.equal(accessEvents(fixture).length, count);
});

test("one hard deadline shrinks request timeouts and covers setup and Verifier without sleeping", async () => {
	const successful = roots("deadline-success");
	let now = 10_000;
	const requestTimeouts: Array<number | undefined> = [];
	let verifierTimeout = 0;
	const successfulExecutor = createPostV35RealSmokeTurnExecutor({
		authorized: true,
		authority: successful.authority,
		credentialResolver: { async resolve(): Promise<string> { now += 100; return "IN_MEMORY_TEST_CREDENTIAL"; } },
		modelFactory: deadlineModelFactory("real-run-one", (timeoutMs) => { requestTimeouts.push(timeoutMs); if (requestTimeouts.length === 1) now += 300_000; }),
		testOnlyClock: () => now,
		testOnlyVerifierRunner: async (options) => { verifierTimeout = options.task.verifier_command.timeout_ms; now += 5_000; return passedVerifierResult(options); },
	});
	const successfulService = new PersistentSessionServiceV35({ dataRoot: successful.dataRoot, projectId: successful.authority.project_id, workspaceRoot: successful.workspaceRoot, workspaceId: successful.authority.workspace_id, turnExecutor: successfulExecutor });
	await successfulService.create({ sessionId: "real-session", title: "deadline" });
	const result = await successfulService.executeTurn({ sessionId: "real-session", runId: "real-run-one", prompt: PROMPT_ONE });
	assert.equal(requestTimeouts.length, 2);
	assert.ok(Number(requestTimeouts[1]) < Number(requestTimeouts[0]));
	assert.equal(verifierTimeout, 30_000);
	assert.equal(result.manifest.schema_version, 2);
	if (result.manifest.schema_version === 2) assert.equal(result.manifest.wall_time_ms, 305_100);

	const setupExpired = roots("deadline-setup-expired");
	let setupNow = 20_000;
	let setupModelCalls = 0;
	const setupExecutor = createPostV35RealSmokeTurnExecutor({ authorized: true, authority: setupExpired.authority, credentialResolver: { async resolve(): Promise<string> { setupNow += 900_001; return "IN_MEMORY_TEST_CREDENTIAL"; } }, modelFactory: { create() { setupModelCalls++; throw new Error("model must not be constructed after setup deadline"); } }, testOnlyClock: () => setupNow });
	const setupService = new PersistentSessionServiceV35({ dataRoot: setupExpired.dataRoot, projectId: setupExpired.authority.project_id, workspaceRoot: setupExpired.workspaceRoot, workspaceId: setupExpired.authority.workspace_id, turnExecutor: setupExecutor });
	await setupService.create({ sessionId: "real-session", title: "deadline setup" });
	await assert.rejects(setupService.executeTurn({ sessionId: "real-session", runId: "real-run-one", prompt: PROMPT_ONE }), /deadline/);
	assert.equal(setupModelCalls, 0);

	const verifierExpired = roots("deadline-verifier-expired");
	let verifierNow = 30_000;
	const verifierExecutor = createPostV35RealSmokeTurnExecutor({ authorized: true, authority: verifierExpired.authority, credentialResolver: { async resolve(): Promise<string> { return "IN_MEMORY_TEST_CREDENTIAL"; } }, modelFactory: deadlineModelFactory("real-run-one", () => undefined), testOnlyClock: () => verifierNow, testOnlyVerifierRunner: async (options) => { verifierNow += 900_001; return passedVerifierResult(options); } });
	const verifierService = new PersistentSessionServiceV35({ dataRoot: verifierExpired.dataRoot, projectId: verifierExpired.authority.project_id, workspaceRoot: verifierExpired.workspaceRoot, workspaceId: verifierExpired.authority.workspace_id, turnExecutor: verifierExecutor });
	await verifierService.create({ sessionId: "real-session", title: "deadline verifier" });
	await assert.rejects(verifierService.executeTurn({ sessionId: "real-session", runId: "real-run-one", prompt: PROMPT_ONE }), /deadline/);
	assert.equal(existsSync(resolve(verifierExpired.dataRoot, "runs/real-run-one/manifest.json")), false);
});

test("frozen Tool policy, prompt identity, third Run and authoritative evidence mismatches fail closed", async () => {
	const invalid = roots("invalid-authority");
	const widened = structuredClone(invalid.authority) as PostV35RealSmokeAuthority;
	widened.task_policy.command_descriptors[0]!.argv.push("--inspect");
	const widenedBody = { ...widened } as Record<string, unknown>; delete widenedBody.authority_digest; widened.authority_digest = digestObject(widenedBody);
	assert.throws(() => parsePostV35RealSmokeAuthority(widened), /command descriptor values/);

	const fixture = roots("fail-closed-real");
	runProcess("create", fixture, "real-run-one", PROMPT_ONE);
	assert.throws(() => runProcess("continue", fixture, "bad-prompt", "browser changed the frozen prompt"));
	runProcess("continue", fixture, "real-run-two", PROMPT_TWO);
	assert.throws(() => runProcess("continue", fixture, "real-run-three", PROMPT_TWO));
	const outcomePath = resolve(fixture.dataRoot, "runs/real-run-two/outcome.json");
	const outcome = JSON.parse(readFileSync(outcomePath, "utf8")) as Record<string, unknown>;
	outcome.verifier_status = "failed";
	writeFileSync(outcomePath, `${stableJson(outcome)}\n`);
	const reader = new PersistentSessionServiceV35({ dataRoot: fixture.dataRoot, projectId: fixture.authority.project_id, workspaceRoot: fixture.workspaceRoot, workspaceId: fixture.authority.workspace_id });
	await assert.rejects(reader.inspect("real-session"), /Verifier\/Outcome byte identity mismatch/);
});
