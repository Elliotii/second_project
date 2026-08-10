import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { parseBrowserTaskRequestV36, InteractiveControlPlaneV36, validateInteractiveAuthorityV36 } from "../src/v36/authority-v36.ts";
import { ProjectProfileRegistryV36 } from "../src/project/registry-v36.ts";
import { readJsonArtifact, writeOnceJson } from "../src/evidence/artifacts.ts";
import { digestObject, sha256 } from "../src/hash.ts";
import { PROJECT_ROOT } from "./helpers.ts";

function setup(label: string) {
	const root = resolve(PROJECT_ROOT, ".runs/v3-6/g1/tests", `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	const source = resolve(root, "source");
	const data = resolve(root, "data");
	mkdirSync(source, { recursive: true });
	mkdirSync(data, { recursive: true });
	writeFileSync(resolve(source, "context.txt"), "source revision one\n");
	let stateDigest = sha256("state-one");
	const registry = () => new ProjectProfileRegistryV36([{
		project_id: "registered-project",
		display_name: "Registered project",
		source_root: source,
		writable_paths: ["src/**"],
		protected_paths: ["package.json"],
		supported_modes: ["inspect_only", "bounded_edit"],
		risk_notice: "Managed copy only; project commands remain disabled in Goal 1.",
		execution_backend_profile_id: "docker-goal2-planned",
		provider_model_policy_id: "host-faux-policy",
		pi_native_skills: [{ id: "pi-skill-review", name: "Review", description: "Pi native read-only Skill metadata.", source: "pi_native", read_only: true }],
		harness_adaptations: [{ id: "adaptation-format", kind: "prompt_addendum", name: "Formatting guidance", status: "not_bound", read_only: true }],
		current_state: () => ({ state_digest: stateDigest }),
	}]);
	return { root, source, data, registry, setState: (value: string) => { stateDigest = sha256(value); } };
}

test("V3.6 browser task schema is exact and rejects client authority injection", () => {
	assert.deepEqual(parseBrowserTaskRequestV36({ project_id: "p", requested_mode: "inspect_only", task_text: "Inspect", title: "Title" }), { project_id: "p", requested_mode: "inspect_only", task_text: "Inspect", title: "Title" });
	for (const field of ["path", "argv", "env", "credential_ref", "provider", "model", "budget", "verifier", "state_digest", "backend_identity", "run_id"]) {
		assert.throws(() => parseBrowserTaskRequestV36({ project_id: "p", requested_mode: "inspect_only", task_text: "Inspect", [field]: "injected" }), /fields are invalid/);
	}
	assert.throws(() => parseBrowserTaskRequestV36({ project_id: "p", requested_mode: "inspect_only" }), /fields are invalid/);
	assert.throws(() => parseBrowserTaskRequestV36({ project_id: "p", requested_mode: "shell", task_text: "x" }), /mode is invalid/);
});

test("pinned capability digest matches actual and planned Goal 1 write semantics", async () => {
	for (const mode of ["inspect_only", "bounded_edit"] as const) {
		const fixture = setup(`capability-${mode}`);
		const plane = new InteractiveControlPlaneV36({ dataRoot: fixture.data, registry: fixture.registry() });
		const view = await plane.submit({ project_id: "registered-project", requested_mode: mode, task_text: `Observe ${mode} capability identity` });
		const expectedCapabilities = {
			mode,
			file_read: true,
			file_write: false,
			planned_file_write: mode === "bounded_edit",
			project_commands: false,
			docker_commands: false,
			source_apply: false,
		};
		const stored = JSON.parse(readFileSync(resolve(fixture.data, "sessions", view.session_id, "session.json"), "utf8")) as { pin: { capability_digest: string } };
		assert.equal(stored.pin.capability_digest, digestObject(expectedCapabilities));
		assert.equal(view.pins.capability_digest, stored.pin.capability_digest);
		assert.deepEqual(view.capabilities, {
			file_read: true,
			file_write: false,
			planned_file_write: mode === "bounded_edit",
			project_commands: false,
			docker_commands: false,
			source_apply: false,
		});
	}
});

test("Host mints IDs, persists immutable Authority before dispatch, and keeps two-Turn Session pins across reopen", async () => {
	const fixture = setup("pinning");
	const dispatchObservations: string[] = [];
	const createPlane = () => new InteractiveControlPlaneV36({
		dataRoot: fixture.data,
		registry: fixture.registry(),
		dispatch: async (input) => {
			assert.equal(existsSync(input.authority_path), true);
			const runRoot = resolve(input.authority_path, "..");
			const authority = validateInteractiveAuthorityV36(runRoot, readJsonArtifact(runRoot, "authority.json"));
			assert.equal(authority.run_id, input.run_id);
			dispatchObservations.push(authority.authority_digest);
			return await input.service.executeTurn({ sessionId: input.session_id, runId: input.run_id, prompt: input.task_text });
		},
	});
	const firstPlane = createPlane();
	const first = await firstPlane.submit({ project_id: "registered-project", requested_mode: "inspect_only", task_text: "Inspect the managed copy", title: "Pinned Session" });
	assert.match(first.session_id, /^v36-session-/);
	assert.match(first.runs[0]!.run_id, /^v36-run-/);
	assert.notEqual(first.session_id, first.runs[0]!.run_id);
	assert.equal(first.verification.mode, "unverified");
	assert.equal(first.verification.formal_outcome, null);
	assert.deepEqual([first.verification.comparison_eligible, first.verification.adaptation_eligible, first.verification.promotion_eligible], [false, false, false]);
	assert.deepEqual(first.capabilities, { file_read: true, file_write: false, planned_file_write: false, project_commands: false, docker_commands: false, source_apply: false });
	const runtimeManifest = JSON.parse(readFileSync(resolve(fixture.data, "sessions", first.session_id, "runtime", "runs", first.runs[0]!.run_id, "manifest.json"), "utf8")) as { active_tool_names: string[]; project_command_executions: number; docker_project_command_executions: number };
	assert.deepEqual(runtimeManifest.active_tool_names, ["workspace_read", "workspace_list"]);
	assert.equal(runtimeManifest.active_tool_names.some((name) => /write|edit|command/.test(name)), false);
	assert.deepEqual([runtimeManifest.project_command_executions, runtimeManifest.docker_project_command_executions], [0, 0]);
	const firstPins = structuredClone(first.pins);

	fixture.setState("state-two");
	writeFileSync(resolve(fixture.source, "context.txt"), "source revision two\n");
	const reopenedPlane = createPlane();
	const second = await reopenedPlane.submit({ project_id: "registered-project", requested_mode: "inspect_only", task_text: "Continue with prior context", session_id: first.session_id });
	assert.deepEqual(second.pins, firstPins);
	assert.equal(second.runs.length, 2);
	assert.equal(second.persistent_session.runs.length, 2);
	assert.equal(second.persistent_session.runs[1]!.context_reconstructed, true);
	assert.equal(dispatchObservations.length, 2);

	const current = await reopenedPlane.submit({ project_id: "registered-project", requested_mode: "inspect_only", task_text: "Start with current Source and State" });
	assert.notEqual(current.session_id, first.session_id);
	assert.notEqual(current.pins.source_snapshot_identity, firstPins.source_snapshot_identity);
	assert.notEqual(current.pins.harness_state_digest, firstPins.harness_state_digest);
	assert.notEqual(current.pins.code_identity, firstPins.code_identity);
	assert.deepEqual(current.pi_native_skills.map((entry) => entry.source), ["pi_native"]);
	assert.deepEqual(current.harness_adaptations.map((entry) => entry.kind), ["prompt_addendum"]);
});

test("fresh processes reopen the same public Pi JSONL Session and settle a second Turn", () => {
	const fixture = setup("cross-process");
	const run = (action: "create" | "continue", sessionId?: string) => {
		const args = ["--experimental-loader", "./workbench/scripts/v35g2-public-pi-loader.mjs", "./workbench/scripts/v36g1-session-cli.ts", action, "--data-root", fixture.data, "--source-root", fixture.source, "--state-digest", sha256("cross-process-state"), "--task-text", action === "create" ? "Process A task" : "Process B continuation", ...(sessionId ? ["--session-id", sessionId] : [])];
		const result = spawnSync(process.execPath, args, { cwd: PROJECT_ROOT, encoding: "utf8", env: { NO_COLOR: "1" } });
		assert.equal(result.status, 0, result.stderr);
		return JSON.parse(result.stdout) as { session_id: string; runs: Array<{ run_id: string }>; persistent_session: { runs: Array<{ context_reconstructed: boolean }>; messages: Array<{ role: string }> } };
	};
	const first = run("create");
	assert.equal(first.runs.length, 1);
	const second = run("continue", first.session_id);
	assert.equal(second.session_id, first.session_id);
	assert.equal(second.runs.length, 2);
	assert.equal(second.persistent_session.runs.length, 2);
	assert.equal(second.persistent_session.runs.every((entry) => entry.context_reconstructed), true);
	assert.ok(second.persistent_session.messages.filter((message) => message.role === "user").length >= 2);
});

test("Authority duplicate write, tamper, missing artifact and Profile drift fail closed", async () => {
	const fixture = setup("authority-fail-closed");
	const plane = new InteractiveControlPlaneV36({ dataRoot: fixture.data, registry: fixture.registry() });
	const created = await plane.submit({ project_id: "registered-project", requested_mode: "inspect_only", task_text: "Create immutable authority" });
	const evidenceRoot = resolve(fixture.data, "interactive-evidence", "runs");
	const runIds = readdirSync(evidenceRoot);
	assert.equal(runIds.length, 1);
	const root = resolve(evidenceRoot, runIds[0]!);
	assert.throws(() => writeOnceJson(root, "authority.json", {}), /exist/i);
	const authorityPath = resolve(root, "authority.json");
	const original = readFileSync(authorityPath, "utf8");
	writeFileSync(authorityPath, original.replace("unverified", "registered"));
	await assert.rejects(() => plane.session(created.session_id), /Authority|artifact|invalid/);

	const missingFixture = setup("authority-missing");
	const missingPlane = new InteractiveControlPlaneV36({ dataRoot: missingFixture.data, registry: missingFixture.registry() });
	const missing = await missingPlane.submit({ project_id: "registered-project", requested_mode: "inspect_only", task_text: "Create then remove authority" });
	const missingRun = readdirSync(resolve(missingFixture.data, "interactive-evidence", "runs"))[0]!;
	unlinkSync(resolve(missingFixture.data, "interactive-evidence", "runs", missingRun, "authority.json"));
	await assert.rejects(() => missingPlane.session(missing.session_id), /Authority|missing|invalid/);

	const driftRegistry = new ProjectProfileRegistryV36([{
		project_id: "registered-project", display_name: "Changed registered project", source_root: missingFixture.source, writable_paths: ["different/**"], protected_paths: [], supported_modes: ["inspect_only"], risk_notice: "Changed Host profile.", execution_backend_profile_id: "docker-goal2-planned", provider_model_policy_id: "host-faux-policy", pi_native_skills: [], harness_adaptations: [], current_state: () => ({ state_digest: sha256("state-one") }),
	}]);
	const driftPlane = new InteractiveControlPlaneV36({ dataRoot: missingFixture.data, registry: driftRegistry });
	await assert.rejects(() => driftPlane.submit({ project_id: "registered-project", requested_mode: "inspect_only", task_text: "Continue", session_id: missing.session_id }), /drift rejected/);
});
