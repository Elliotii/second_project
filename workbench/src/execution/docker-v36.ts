import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdirSync, realpathSync } from "node:fs";
import { resolve } from "node:path";
import type { CommandDescriptor } from "../types.ts";
import type { DockerBackendProfileV36, DockerCommandAuthorityV36, DockerTerminalEvidenceV36 } from "../contracts/v36g2-types.ts";
import { writeOnceJson } from "../evidence/artifacts.ts";
import { digestObject, sha256, stableJson } from "../hash.ts";
import { managedWorkspaceInventoryV36 } from "../workspace/managed-copy-v36.ts";

const IMAGE = "node@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03" as const;

const PROFILE_BODY = Object.freeze({
	schema_version: 1 as const,
	backend_kind: "docker_engine_linux_container" as const,
	host_frontend: "docker_desktop_wsl2" as const,
	docker_context: "desktop-linux" as const,
	docker_client_version: "29.6.2" as const,
	docker_server_version: "29.6.2" as const,
	platform: "linux/amd64" as const,
	image_reference: IMAGE,
	network_mode: "none" as const,
	root_filesystem: "read_only" as const,
	tmpfs: "/tmp:rw,noexec,nosuid,nodev,size=67108864" as const,
	user: "65532:65532" as const,
	cpus: 0.5 as const,
	memory_bytes: 536870912 as const,
	memory_swap_bytes: 536870912 as const,
	pids_limit: 64 as const,
	nofile: "1024:1024" as const,
	cap_drop: "ALL" as const,
	no_new_privileges: true as const,
	pull_policy: "never" as const,
	wall_timeout_ms: 30000 as const,
	combined_output_budget_bytes: 65536 as const,
	workspace_mount_destination: "/workspace" as const,
	workspace_mount_count: 1 as const,
	container_lifecycle: "one_disposable_container_per_registered_command" as const,
});

export const FROZEN_DOCKER_PROFILE_V36: DockerBackendProfileV36 = Object.freeze({
	...PROFILE_BODY,
	profile_digest: digestObject(PROFILE_BODY),
});

interface CliResultV36 {
	code: number | null;
	stdout: Buffer;
	stderr: Buffer;
	observedBytes: number;
	timedOut: boolean;
	spawnError: boolean;
}

export interface DockerRegisteredCommandResultV36 {
	command_id: string;
	executable: "docker_registered_node";
	argv: string[];
	exit_code: number | null;
	timed_out: boolean;
	truncated: boolean;
	stdout: string;
	stderr: string;
	output: string;
	backend_profile_digest: string;
	authority_digest: string;
	terminal_digest: string;
	cleanup_complete: boolean;
}

function safeOutput(bytes: Buffer, limit: number): string {
	return bytes.subarray(0, limit).toString("utf8")
		.replace(/(?:[A-Za-z]:[\\/]|\\\\)[^\s"']+/g, "[host path omitted]")
		.replace(/\bBearer\s+[^\s]+/gi, "Bearer [credential omitted]");
}

async function runCli(executable: string, args: readonly string[], timeoutMs: number, onTimeout?: () => Promise<void>, captureLimit = 1_048_576): Promise<CliResultV36> {
	return await new Promise((accept) => {
		const env: NodeJS.ProcessEnv = { NO_COLOR: "1" };
		for (const key of ["SystemRoot", "WINDIR", "USERPROFILE", "HOMEDRIVE", "HOMEPATH", "APPDATA", "LOCALAPPDATA", "PATH", "Path"]) if (process.env[key] !== undefined) env[key] = process.env[key];
		const child = spawn(executable, [...args], { shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"], env });
		const stdout: Buffer[] = [];
		const stderr: Buffer[] = [];
		let capturedBytes = 0;
		let observedBytes = 0;
		let timedOut = false;
		let spawnError = false;
		const append = (target: Buffer[], chunkValue: Buffer): void => {
			const chunk = Buffer.from(chunkValue);
			observedBytes += chunk.length;
			const remaining = Math.max(0, captureLimit - capturedBytes);
			if (remaining > 0) {
				const captured = chunk.subarray(0, remaining);
				target.push(captured);
				capturedBytes += captured.length;
			}
		};
		child.stdout.on("data", (chunk) => append(stdout, Buffer.from(chunk)));
		child.stderr.on("data", (chunk) => append(stderr, Buffer.from(chunk)));
		child.once("error", () => { spawnError = true; });
		const timer = setTimeout(() => {
			timedOut = true;
			void Promise.resolve(onTimeout?.()).finally(() => child.kill());
		}, timeoutMs);
		child.once("close", (code) => {
			clearTimeout(timer);
			accept({ code, stdout: Buffer.concat(stdout), stderr: Buffer.concat(stderr), observedBytes, timedOut, spawnError });
		});
	});
}

function terminalBody(value: DockerTerminalEvidenceV36): Omit<DockerTerminalEvidenceV36, "terminal_digest"> {
	const { terminal_digest: _digest, ...body } = value;
	return body;
}

export function validateFrozenDockerProfileV36(value: unknown): void {
	if (stableJson(value) !== stableJson(FROZEN_DOCKER_PROFILE_V36)) throw new Error("docker_frozen_profile_mismatch");
}

export function validateDockerVersionV36(value: { Client?: { Version?: string; Context?: string }; Server?: { Version?: string; Os?: string; Arch?: string; Platform?: { Name?: string } } }): void {
	if (value.Client?.Version !== "29.6.2" || value.Client.Context !== "desktop-linux" || value.Server?.Version !== "29.6.2" || value.Server.Os !== "linux" || value.Server.Arch !== "amd64" || value.Server.Platform?.Name !== "Docker Desktop 4.85.0 (235549)") throw new Error("docker_runtime_identity_mismatch");
}

export function validateDockerImageIdentityV36(value: string): void {
	if (value.trim() !== `sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03|linux|amd64`) throw new Error("docker_image_identity_mismatch");
}

function parseVersion(stdout: Buffer): void {
	validateDockerVersionV36(JSON.parse(stdout.toString("utf8")) as { Client?: { Version?: string; Context?: string }; Server?: { Version?: string; Os?: string; Arch?: string; Platform?: { Name?: string } } });
}

export class DockerRegisteredCommandExecutorV36 {
	private readonly dockerExecutable: string;

	constructor(options: { dockerExecutable: string }) {
		if (typeof options.dockerExecutable !== "string" || options.dockerExecutable.length === 0) throw new Error("docker Host configuration is unavailable");
		this.dockerExecutable = options.dockerExecutable;
	}

	async execute(options: { workspaceRoot: string; evidenceRoot: string; descriptor: CommandDescriptor }): Promise<DockerRegisteredCommandResultV36> {
		validateFrozenDockerProfileV36(FROZEN_DOCKER_PROFILE_V36);
		if (options.descriptor.executable !== "current_node_executable" || options.descriptor.cwd !== "workspace" || options.descriptor.timeout_seconds > FROZEN_DOCKER_PROFILE_V36.wall_timeout_ms / 1_000 || options.descriptor.max_combined_output_bytes > FROZEN_DOCKER_PROFILE_V36.combined_output_budget_bytes) throw new Error("registered command descriptor is incompatible with the frozen Docker profile");
		const workspaceRoot = realpathSync.native(resolve(options.workspaceRoot));
		const workspaceIdentity = managedWorkspaceInventoryV36(workspaceRoot).inventory_digest;
		mkdirSync(options.evidenceRoot, { recursive: false });
		const executionId = `v36-docker-${randomUUID()}`;
		const authorityBody: Omit<DockerCommandAuthorityV36, "authority_digest"> = { schema_version: 1, authority_kind: "v36_docker_registered_command", execution_id: executionId, command_id: options.descriptor.command_id, executable: "node", argv: [...options.descriptor.argv], workspace_identity: workspaceIdentity, backend_profile_digest: FROZEN_DOCKER_PROFILE_V36.profile_digest, created_at: new Date().toISOString() };
		const authority: DockerCommandAuthorityV36 = { ...authorityBody, authority_digest: digestObject(authorityBody) };
		writeOnceJson(options.evidenceRoot, "authority.json", authority);
		const name = `v36g2-${randomUUID()}`;
		let terminal: DockerTerminalEvidenceV36 = {
			schema_version: 1, execution_id: executionId, command_id: options.descriptor.command_id, authority_digest: authority.authority_digest, backend_profile_digest: FROZEN_DOCKER_PROFILE_V36.profile_digest, status: "preflight_failed",
			create: { attempted: false, succeeded: false, container_identity: null }, start: { attempted: false, succeeded: false }, output: { stdout: "", stderr: "", combined_bytes_observed: 0, truncated: false }, inspect: { attempted: false, succeeded: false, exit_code: null, oom_killed: null, mount_count: null, profile_match: false }, timeout: { triggered: false, wall_timeout_ms: 30000 }, kill: { attempted: false, succeeded: false }, remove: { attempted: false, succeeded: false }, exit_code: null, timed_out: false, cleanup_complete: false, error_code: null, terminal_digest: "",
		};
		let created = false;
		try {
			const version = await runCli(this.dockerExecutable, ["--context", "desktop-linux", "version", "--format", "{{json .}}"], 10_000);
			if (version.code !== 0 || version.spawnError) throw new Error("docker_runtime_unavailable");
			parseVersion(version.stdout);
			const image = await runCli(this.dockerExecutable, ["--context", "desktop-linux", "image", "inspect", IMAGE, "--format", "{{.Id}}|{{.Os}}|{{.Architecture}}"], 10_000);
			if (image.code !== 0) throw new Error("docker_image_identity_mismatch");
			validateDockerImageIdentityV36(image.stdout.toString("utf8"));
			terminal.create.attempted = true;
			const createArgs = ["--context", "desktop-linux", "create", "--name", name, "--pull", "never", "--platform", "linux/amd64", "--network", "none", "--read-only", "--tmpfs", "/tmp:rw,noexec,nosuid,nodev,size=67108864", "--user", "65532:65532", "--cpus", "0.5", "--memory", "536870912", "--memory-swap", "536870912", "--pids-limit", "64", "--ulimit", "nofile=1024:1024", "--cap-drop", "ALL", "--security-opt", "no-new-privileges", "--mount", `type=bind,src=${workspaceRoot},dst=/workspace`, "--workdir", "/workspace", IMAGE, "node", ...options.descriptor.argv];
			const create = await runCli(this.dockerExecutable, createArgs, 10_000);
			if (create.code !== 0 || create.spawnError) throw new Error("docker_create_failed");
			created = true;
			terminal.create.succeeded = true;
			terminal.create.container_identity = sha256(create.stdout.toString("utf8").trim());
			terminal.start.attempted = true;
			const start = await runCli(this.dockerExecutable, ["--context", "desktop-linux", "start", "--attach", name], FROZEN_DOCKER_PROFILE_V36.wall_timeout_ms, async () => {
				terminal.kill.attempted = true;
				const killed = await runCli(this.dockerExecutable, ["--context", "desktop-linux", "kill", name], 10_000);
				terminal.kill.succeeded = killed.code === 0;
			}, FROZEN_DOCKER_PROFILE_V36.combined_output_budget_bytes + 1);
			terminal.start.succeeded = !start.spawnError;
			terminal.timeout.triggered = start.timedOut;
			terminal.timed_out = start.timedOut;
			const observed = start.observedBytes;
			const stdoutBudget = Math.min(start.stdout.length, FROZEN_DOCKER_PROFILE_V36.combined_output_budget_bytes);
			const stderrBudget = Math.max(0, FROZEN_DOCKER_PROFILE_V36.combined_output_budget_bytes - stdoutBudget);
			terminal.output = { stdout: safeOutput(start.stdout, stdoutBudget), stderr: safeOutput(start.stderr, stderrBudget), combined_bytes_observed: observed, truncated: observed > FROZEN_DOCKER_PROFILE_V36.combined_output_budget_bytes };
			terminal.inspect.attempted = true;
			const inspect = await runCli(this.dockerExecutable, ["--context", "desktop-linux", "container", "inspect", name, "--format", "{{json .}}"], 10_000);
			if (inspect.code !== 0) throw new Error("docker_inspect_failed");
			const inspected = JSON.parse(inspect.stdout.toString("utf8")) as {
				State?: { ExitCode?: number; OOMKilled?: boolean };
				Config?: { User?: string };
				HostConfig?: {
					NetworkMode?: string; ReadonlyRootfs?: boolean; Memory?: number; MemorySwap?: number; PidsLimit?: number; NanoCpus?: number;
					CapDrop?: string[]; SecurityOpt?: string[]; Tmpfs?: Record<string, string>; Ulimits?: Array<{ Name?: string; Soft?: number; Hard?: number }>;
					Privileged?: boolean; PublishAllPorts?: boolean; PortBindings?: Record<string, unknown> | null; Devices?: unknown[]; PidMode?: string; IpcMode?: string;
				};
				Mounts?: Array<{ Destination?: string; RW?: boolean; Type?: string }>;
			};
			const mount = inspected.Mounts?.[0];
			const nofile = inspected.HostConfig?.Ulimits?.find((entry) => entry.Name === "nofile");
			const profileMatch = inspected.Config?.User === "65532:65532"
				&& inspected.HostConfig?.NetworkMode === "none"
				&& inspected.HostConfig.ReadonlyRootfs === true
				&& inspected.HostConfig.Memory === 536870912
				&& inspected.HostConfig.MemorySwap === 536870912
				&& inspected.HostConfig.PidsLimit === 64
				&& inspected.HostConfig.NanoCpus === 500_000_000
				&& inspected.HostConfig.CapDrop?.length === 1 && inspected.HostConfig.CapDrop[0] === "ALL"
				&& inspected.HostConfig.SecurityOpt?.some((entry) => entry.includes("no-new-privileges")) === true
				&& inspected.HostConfig.Tmpfs?.["/tmp"]?.split(",").sort().join(",") === "nodev,noexec,nosuid,rw,size=67108864".split(",").sort().join(",")
				&& nofile?.Soft === 1024 && nofile.Hard === 1024
				&& inspected.HostConfig.Privileged === false && inspected.HostConfig.PublishAllPorts === false
				&& (inspected.HostConfig.PortBindings === null || Object.keys(inspected.HostConfig.PortBindings ?? {}).length === 0)
				&& (inspected.HostConfig.Devices?.length ?? 0) === 0 && (inspected.HostConfig.PidMode ?? "") === "" && (inspected.HostConfig.IpcMode ?? "private") !== "host"
				&& inspected.Mounts?.length === 1 && mount?.Destination === "/workspace" && mount.RW === true && mount.Type === "bind";
			terminal.inspect = { attempted: true, succeeded: true, exit_code: inspected.State?.ExitCode ?? null, oom_killed: inspected.State?.OOMKilled ?? null, mount_count: inspected.Mounts?.length ?? null, profile_match: profileMatch };
			terminal.exit_code = inspected.State?.ExitCode ?? start.code;
			if (!profileMatch) throw new Error("docker_inspected_profile_mismatch");
			terminal.status = start.timedOut ? "timed_out" : terminal.exit_code === 0 ? "succeeded" : "nonzero_exit";
		} catch (error) {
			terminal.error_code = error instanceof Error ? error.message : "docker_execution_failed";
			if (terminal.start.attempted && terminal.status === "preflight_failed") terminal.status = "start_failed";
		} finally {
			if (created) {
				terminal.remove.attempted = true;
				const removed = await runCli(this.dockerExecutable, ["--context", "desktop-linux", "rm", "--force", name], 10_000);
				terminal.remove.succeeded = removed.code === 0;
			}
			terminal.cleanup_complete = !created || terminal.remove.succeeded;
			if (!terminal.cleanup_complete) terminal.status = "cleanup_failed";
			terminal = { ...terminal, terminal_digest: digestObject(terminalBody(terminal)) };
			writeOnceJson(options.evidenceRoot, "terminal.json", terminal);
		}
		if (terminal.status === "preflight_failed" || terminal.status === "start_failed" || terminal.status === "cleanup_failed") throw new Error(terminal.error_code ?? terminal.status);
		return { command_id: options.descriptor.command_id, executable: "docker_registered_node", argv: [...options.descriptor.argv], exit_code: terminal.exit_code, timed_out: terminal.timed_out, truncated: terminal.output.truncated, stdout: terminal.output.stdout, stderr: terminal.output.stderr, output: [terminal.output.stdout, terminal.output.stderr].filter(Boolean).join("\n"), backend_profile_digest: terminal.backend_profile_digest, authority_digest: terminal.authority_digest, terminal_digest: terminal.terminal_digest, cleanup_complete: terminal.cleanup_complete };
	}
}
