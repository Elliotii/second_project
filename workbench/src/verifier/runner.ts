import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { writeOnceBytes, artifactRef } from "../evidence/artifacts.ts";
import type { ArtifactRefV0B, TaskSpecV0B, VerifierResultV0B } from "../contracts/v0b-types.ts";
import { fileSha256 } from "../hash.ts";

interface VerifierWireResult {
	schema_version: 1;
	verifier_id: string;
	status: "passed" | "failed";
	summary: string;
	failed_checks?: string[];
}

function parseWireResult(output: string, verifierId: string): VerifierWireResult {
	const lines = output
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
	const last = lines.at(-1);
	if (!last) throw new Error("verifier produced no result");
	const value: unknown = JSON.parse(last);
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("verifier result is not an object");
	const result = value as Record<string, unknown>;
	const keys = Object.keys(result).sort();
	const allowedShapes = [
		["schema_version", "status", "summary", "verifier_id"].sort().join(","),
		["failed_checks", "schema_version", "status", "summary", "verifier_id"].sort().join(","),
	];
	if (!allowedShapes.includes(keys.join(","))) {
		throw new Error("verifier result has an invalid envelope");
	}
	if (
		result.schema_version !== 1 ||
		result.verifier_id !== verifierId ||
		(result.status !== "passed" && result.status !== "failed") ||
		typeof result.summary !== "string"
	) {
		throw new Error("verifier result contract mismatch");
	}
	if (
		"failed_checks" in result &&
		(!Array.isArray(result.failed_checks) ||
			result.failed_checks.length > 32 ||
			result.failed_checks.some((entry) => typeof entry !== "string" || [...entry].length > 256))
	) {
		throw new Error("verifier public failed_checks contract mismatch");
	}
	return result as unknown as VerifierWireResult;
}

async function spawnVerifier(options: {
	executable: string;
	argv: string[];
	cwd: string;
	workspaceRoot: string;
	workspaceEnvironmentKey: "V0B_WORKSPACE" | "V0C_WORKSPACE";
	timeoutMs: number;
	outputLimitBytes: number;
}): Promise<{ output: string; exitCode: number | null; timedOut: boolean; overflow: boolean; spawnError: string | null }> {
	return await new Promise((fulfill) => {
		let settled = false;
		let output = "";
		let timedOut = false;
		let overflow = false;
		let spawnError: string | null = null;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const finish = (exitCode: number | null): void => {
			if (settled) return;
			settled = true;
			if (timer) clearTimeout(timer);
			fulfill({ output, exitCode, timedOut, overflow, spawnError });
		};
		const child = spawn(options.executable, options.argv, {
			cwd: options.cwd,
			shell: false,
			windowsHide: true,
			stdio: ["ignore", "pipe", "pipe"],
			env: {
				NO_COLOR: "1",
				[options.workspaceEnvironmentKey]: options.workspaceRoot,
			},
		});
		const append = (label: string, chunk: Buffer): void => {
			const prefix = output.length === 0 || output.endsWith("\n") ? `[${label}] ` : "";
			const candidate = `${prefix}${chunk.toString("utf8")}`;
			const remaining = options.outputLimitBytes + 1 - Buffer.byteLength(output, "utf8");
			if (remaining <= 0) {
				overflow = true;
				child.kill();
				return;
			}
			if (Buffer.byteLength(candidate, "utf8") > remaining) overflow = true;
			output += Buffer.from(candidate, "utf8").subarray(0, remaining).toString("utf8");
			if (overflow) child.kill();
		};
		child.stdout.on("data", (chunk: Buffer) => append("stdout", chunk));
		child.stderr.on("data", (chunk: Buffer) => append("stderr", chunk));
		child.once("error", (error) => {
			spawnError = error.message;
			finish(null);
		});
		child.once("close", (code) => finish(code));
		timer = setTimeout(() => {
			timedOut = true;
			child.kill();
		}, options.timeoutMs);
	});
}

export async function runExternalVerifierV0B(options: {
	projectRoot: string;
	runRoot: string;
	workspaceRoot: string;
	attemptId: string;
	task: TaskSpecV0B;
	verifierSnapshotPath: string;
	verifierSnapshotRef: ArtifactRefV0B;
	faultInjection?: "missing" | "spawn" | "parse" | "timeout" | "output_cap";
	outputPath?: string;
	workspaceEnvironmentKey?: "V0B_WORKSPACE" | "V0C_WORKSPACE";
}): Promise<VerifierResultV0B> {
	const startedMs = Date.now();
	const startedAt = new Date().toISOString();
	const verifierPath = options.verifierSnapshotPath;
	const sourceSha256 = existsSync(verifierPath) ? fileSha256(verifierPath) : "0".repeat(64);
	const sourceDigestVerified = sourceSha256 === options.task.verifier_sha256;
	let processResult: Awaited<ReturnType<typeof spawnVerifier>>;
	if (!sourceDigestVerified) {
		processResult = {
			output: "[coordinator] verifier snapshot digest mismatch\n",
			exitCode: null,
			timedOut: false,
			overflow: false,
			spawnError: "verifier_snapshot_digest_mismatch",
		};
	} else if (options.faultInjection === "missing") {
		processResult = {
			output: "[coordinator] fixed verifier-missing test injection\n",
			exitCode: null,
			timedOut: false,
			overflow: false,
			spawnError: "verifier_missing",
		};
	} else if (options.faultInjection === "spawn") {
		processResult = {
			output: "[coordinator] fixed verifier-spawn test injection\n",
			exitCode: null,
			timedOut: false,
			overflow: false,
			spawnError: "spawn_error",
		};
	} else if (options.faultInjection === "parse") {
		processResult = {
			output: "[stdout] fixed malformed verifier result\n",
			exitCode: 0,
			timedOut: false,
			overflow: false,
			spawnError: null,
		};
	} else if (options.faultInjection === "timeout") {
		processResult = {
			output: "[coordinator] fixed verifier-timeout test injection\n",
			exitCode: null,
			timedOut: true,
			overflow: false,
			spawnError: null,
		};
	} else if (options.faultInjection === "output_cap") {
		processResult = {
			output: "x".repeat(options.task.verifier_command.output_limit_bytes + 1),
			exitCode: null,
			timedOut: false,
			overflow: true,
			spawnError: null,
		};
	} else if (!existsSync(verifierPath)) {
		processResult = {
			output: "[coordinator] verifier path is missing\n",
			exitCode: null,
			timedOut: false,
			overflow: false,
			spawnError: "verifier_missing",
		};
	} else {
		processResult = await spawnVerifier({
			executable: process.execPath,
			argv: [verifierPath],
			cwd: options.projectRoot,
			workspaceRoot: options.workspaceRoot,
			workspaceEnvironmentKey: options.workspaceEnvironmentKey ?? "V0B_WORKSPACE",
			timeoutMs: options.task.verifier_command.timeout_ms,
			outputLimitBytes: options.task.verifier_command.output_limit_bytes,
		});
	}
	const outputBytes = Buffer.from(processResult.output, "utf8");
	const boundedBytes = outputBytes.subarray(0, options.task.verifier_command.output_limit_bytes);
	const outputPath = writeOnceBytes(options.runRoot, options.outputPath ?? "artifacts/verifier-output.txt", boundedBytes);
	const outputRef = artifactRef(
		options.runRoot,
		outputPath,
		"text/plain; charset=utf-8",
		processResult.overflow || outputBytes.length > boundedBytes.length,
	);
	const completedAt = new Date().toISOString();
	const durationMs = Math.max(0, Date.now() - startedMs);
	let status: VerifierResultV0B["status"] = "invalid";
	let summary = "verifier did not produce a valid result";
	let invalidReason: string | null = null;
	let publicFailedChecks: string[] | undefined;
	if (processResult.spawnError) {
		invalidReason = processResult.spawnError;
		summary = `Verifier infrastructure invalid: ${processResult.spawnError}`;
	} else if (processResult.timedOut) {
		invalidReason = "timeout";
		summary = "Verifier exceeded its timeout";
	} else if (processResult.overflow) {
		invalidReason = "output_limit_exceeded";
		summary = "Verifier exceeded its output hard cap";
	} else {
		try {
			const wire = parseWireResult(processResult.output.replace(/^\[(?:stdout|stderr)\] /gm, ""), options.task.verifier_id);
			if ((wire.status === "passed" && processResult.exitCode !== 0) || (wire.status === "failed" && processResult.exitCode !== 1)) {
				throw new Error("verifier status and exit code disagree");
			}
			status = wire.status;
			summary = wire.summary.slice(0, 2_000);
			publicFailedChecks = wire.failed_checks;
		} catch (error) {
			invalidReason = `contract_parse_failure: ${error instanceof Error ? error.message : String(error)}`;
			summary = "Verifier result contract is invalid";
		}
	}
	return {
		schema_version: 1,
		verifier_id: options.task.verifier_id,
		verifier_sha256: options.task.verifier_sha256,
		attempt_id: options.attemptId,
		started_at: startedAt,
		completed_at: completedAt,
		duration_ms: durationMs,
		execution: {
			executable: process.execPath,
			executable_identity: {
				node_version: process.version,
			},
			argv: [verifierPath],
			cwd: options.projectRoot,
			cwd_identity: "project_root",
			shell: false,
			environment_allowlist_keys: ["NO_COLOR", options.workspaceEnvironmentKey ?? "V0B_WORKSPACE"],
			timeout_ms: options.task.verifier_command.timeout_ms,
			output_limit_bytes: options.task.verifier_command.output_limit_bytes,
			source_snapshot_ref: options.verifierSnapshotRef,
			source_sha256: sourceSha256,
			source_digest_verified: sourceDigestVerified,
		},
		status,
		exit_code: processResult.exitCode,
		timed_out: processResult.timedOut,
		summary,
		...(publicFailedChecks ? { public_failed_checks: publicFailedChecks } : {}),
		full_output_ref: outputRef,
		full_output_sha256: outputRef.sha256,
		invalid_reason: invalidReason,
	};
}
