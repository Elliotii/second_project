import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { DockerRegisteredCommandExecutorV36, FROZEN_DOCKER_PROFILE_V36, validateDockerImageIdentityV36, validateDockerVersionV36, validateFrozenDockerProfileV36 } from "../src/execution/docker-v36.ts";
import { managedWorkspaceInventoryV36 } from "../src/workspace/managed-copy-v36.ts";
import type { CommandDescriptor } from "../src/types.ts";
import { PROJECT_ROOT } from "./helpers.ts";

const dockerExecutable = process.env.V36_DOCKER_EXECUTABLE ?? resolve(process.env.LOCALAPPDATA ?? "", "Programs/DockerDesktop/resources/bin/docker.exe");

function root(label: string): { workspace: string; evidence: string } {
	const value = resolve(PROJECT_ROOT, ".runs/v3-6/g2/docker-tests", `${label}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	const workspace = resolve(value, "workspace");
	mkdirSync(workspace, { recursive: true });
	return { workspace, evidence: resolve(value, "evidence") };
}

function descriptor(argv: string[], output = 65_536): CommandDescriptor {
	return { command_id: "test", executable: "current_node_executable", argv, cwd: "workspace", timeout_seconds: 30, max_combined_output_bytes: output };
}

test("frozen profile, runtime, image and managed-copy metadata drift fail closed without Docker dispatch", () => {
	validateFrozenDockerProfileV36(FROZEN_DOCKER_PROFILE_V36);
	const runtime = { Client: { Version: "29.6.2", Context: "desktop-linux" }, Server: { Version: "29.6.2", Os: "linux", Arch: "amd64", Platform: { Name: "Docker Desktop 4.85.0 (235549)" } } };
	validateDockerVersionV36(runtime);
	validateDockerImageIdentityV36("sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03|linux|amd64");
	assert.throws(() => validateFrozenDockerProfileV36({ ...FROZEN_DOCKER_PROFILE_V36, network_mode: "bridge" }), /frozen_profile_mismatch/);
	assert.throws(() => validateDockerVersionV36({ ...runtime, Client: { ...runtime.Client, Context: "default" } }), /runtime_identity_mismatch/);
	assert.throws(() => validateDockerVersionV36({ ...runtime, Server: { ...runtime.Server, Version: "29.6.1" } }), /runtime_identity_mismatch/);
	assert.throws(() => validateDockerImageIdentityV36("sha256:wrong|linux|amd64"), /image_identity_mismatch/);
	const value = root("git-rejected");
	mkdirSync(resolve(value.workspace, ".git"));
	assert.throws(() => managedWorkspaceInventoryV36(value.workspace), /must not contain \.git/);
});

test("frozen Docker executor persists pre-create Authority and exact terminal stdout/stderr/cleanup evidence", { timeout: 60_000 }, async () => {
	const value = root("success");
	writeFileSync(resolve(value.workspace, "probe.mjs"), "console.log('v36-stdout'); console.error('v36-stderr');\n");
	const executor = new DockerRegisteredCommandExecutorV36({ dockerExecutable });
	const result = await executor.execute({ workspaceRoot: value.workspace, evidenceRoot: value.evidence, descriptor: descriptor(["probe.mjs"]) });
	assert.equal(result.exit_code, 0);
	assert.equal(result.timed_out, false);
	assert.equal(result.cleanup_complete, true);
	assert.match(result.stdout, /v36-stdout/);
	assert.match(result.stderr, /v36-stderr/);
	assert.equal(result.backend_profile_digest, FROZEN_DOCKER_PROFILE_V36.profile_digest);
	const authority = JSON.parse(readFileSync(resolve(value.evidence, "authority.json"), "utf8")) as Record<string, unknown>;
	const terminal = JSON.parse(readFileSync(resolve(value.evidence, "terminal.json"), "utf8")) as { status: string; inspect: { mount_count: number; profile_match: boolean }; remove: { succeeded: boolean } };
	assert.equal(authority.backend_profile_digest, FROZEN_DOCKER_PROFILE_V36.profile_digest);
	assert.equal(terminal.status, "succeeded");
	assert.deepEqual(terminal.inspect, { attempted: true, succeeded: true, exit_code: 0, oom_killed: false, mount_count: 1, profile_match: true });
	assert.equal(terminal.remove.succeeded, true);
	assert.doesNotMatch(JSON.stringify({ authority, terminal }), /DockerDesktop|AppData|Users[\\/]/i);
});

test("nonzero exit and combined output truncation are distinct from timeout", { timeout: 60_000 }, async () => {
	const value = root("nonzero-truncated");
	writeFileSync(resolve(value.workspace, "probe.mjs"), "process.stdout.write('o'.repeat(70000)); process.stderr.write('err'); process.exit(7);\n");
	const result = await new DockerRegisteredCommandExecutorV36({ dockerExecutable }).execute({ workspaceRoot: value.workspace, evidenceRoot: value.evidence, descriptor: descriptor(["probe.mjs"]) });
	assert.equal(result.exit_code, 7);
	assert.equal(result.timed_out, false);
	assert.equal(result.truncated, true);
	const terminal = JSON.parse(readFileSync(resolve(value.evidence, "terminal.json"), "utf8")) as { status: string; output: { combined_bytes_observed: number; truncated: boolean } };
	assert.equal(terminal.status, "nonzero_exit");
	assert.equal(terminal.output.truncated, true);
	assert.ok(terminal.output.combined_bytes_observed > FROZEN_DOCKER_PROFILE_V36.combined_output_budget_bytes);
});

test("wall timeout kills the whole container and terminal cleanup removes it", { timeout: 50_000 }, async () => {
	const value = root("timeout");
	writeFileSync(resolve(value.workspace, "hang.mjs"), "import { spawn } from 'node:child_process'; spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)']); setInterval(()=>{},1000);\n");
	const result = await new DockerRegisteredCommandExecutorV36({ dockerExecutable }).execute({ workspaceRoot: value.workspace, evidenceRoot: value.evidence, descriptor: descriptor(["hang.mjs"]) });
	assert.equal(result.timed_out, true);
	assert.equal(result.cleanup_complete, true);
	const terminal = JSON.parse(readFileSync(resolve(value.evidence, "terminal.json"), "utf8")) as { status: string; timeout: { triggered: boolean }; kill: { attempted: boolean; succeeded: boolean }; remove: { succeeded: boolean } };
	assert.equal(terminal.status, "timed_out");
	assert.deepEqual(terminal.timeout, { triggered: true, wall_timeout_ms: 30000 });
	assert.deepEqual(terminal.kill, { attempted: true, succeeded: true });
	assert.equal(terminal.remove.succeeded, true);
});

test("missing backend fails closed after immutable Authority with no Host fallback", async () => {
	const value = root("missing");
	const missing = resolve(value.workspace, "docker-does-not-exist.exe");
	await assert.rejects(() => new DockerRegisteredCommandExecutorV36({ dockerExecutable: missing }).execute({ workspaceRoot: value.workspace, evidenceRoot: value.evidence, descriptor: descriptor(["--version"]) }), /docker_runtime_unavailable/);
	const terminal = JSON.parse(readFileSync(resolve(value.evidence, "terminal.json"), "utf8")) as { status: string; create: { attempted: boolean }; error_code: string };
	assert.equal(terminal.status, "preflight_failed");
	assert.equal(terminal.create.attempted, false);
	assert.equal(terminal.error_code, "docker_runtime_unavailable");
});
