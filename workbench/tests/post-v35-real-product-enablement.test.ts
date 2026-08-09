import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import type { PostV35RealSmokeAuthority } from "../src/contracts/post-v35-real-types.ts";
import { digestObject, fileSha256, sha256, stableJson, treeDigest } from "../src/hash.ts";
import { PersistentSessionServiceV35 } from "../src/session/persistent-session-v35.ts";
import { createPostV35RealSmokeTurnExecutor, parsePostV35RealSmokeAuthority } from "../src/session/real-smoke-turn-v35.ts";
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
		initial_workspace_sha256: treeDigest(workspaceRoot),
		system_prompt: "Use only the bounded workspace tools and finish by running public_test.",
		task_policy: { writable_paths: ["src/**", "test/**"], protected_paths: ["package.json"], command_descriptors: [{ command_id: "public_test" as const, executable: "current_node_executable" as const, argv: ["--test"], cwd: "workspace" as const, timeout_seconds: 30, max_combined_output_bytes: 65_536 }] },
		provider_profile: "deepseek-v4-flash" as const,
		binding_status: "not_applicable" as const,
		budget: { provider_requests_total_max: 16 as const, tool_calls_total_max: 24 as const, combined_tokens_total_max: 131_072 as const, cost_usd_total_max: 0.2 as const, wall_time_total_ms_max: 1_800_000 as const },
		turns: [
			{ ordinal: 1 as const, prompt_sha256: sha256(PROMPT_ONE), verifier_id: "post-v35-turn-one", verifier_source_path: verifierOne, verifier_sha256: fileSha256(verifierOne), verifier_timeout_ms: 30_000, verifier_output_limit_bytes: 65_536 },
			{ ordinal: 2 as const, prompt_sha256: sha256(PROMPT_TWO), verifier_id: "post-v35-turn-two", verifier_source_path: verifierTwo, verifier_sha256: fileSha256(verifierTwo), verifier_timeout_ms: 30_000, verifier_output_limit_bytes: 65_536 },
		] as PostV35RealSmokeAuthority["turns"],
	};
	const authority = { ...body, authority_digest: digestObject(body) };
	const authorityPath = resolve(root, "authority.json");
	writeFileSync(authorityPath, `${stableJson(authority)}\n`);
	mkdirSync(dataRoot, { recursive: true });
	return { root, dataRoot, workspaceRoot, authorityPath, authority };
}

function runProcess(action: "create" | "continue", fixture: ReturnType<typeof roots>, runId: string, prompt: string): { manifest: Record<string, unknown>; view: Record<string, unknown> } {
	const result = spawnSync(process.execPath, ["--experimental-loader", LOADER, "scripts/post-v35-real-smoke-faux-driver.ts", "--action", action, "--data-root", fixture.dataRoot, "--workspace-root", fixture.workspaceRoot, "--authority", fixture.authorityPath, "--session-id", "real-session", "--run-id", runId, "--prompt", prompt], { cwd: WORKBENCH_ROOT, encoding: "utf8", env: { NO_COLOR: "1" } });
	assert.equal(result.status, 0, result.stderr);
	return JSON.parse(result.stdout) as { manifest: Record<string, unknown>; view: Record<string, unknown> };
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
	await assert.rejects(reader.inspect("real-session"), /Verifier\/Outcome evidence mismatch/);
});
