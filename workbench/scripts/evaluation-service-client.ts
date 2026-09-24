import { createHash } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_BASE_URL = "http://127.0.0.1:4317";
const DEFAULT_WAIT_TIMEOUT_MS = 45 * 60 * 1_000;
const DEFAULT_POLL_INTERVAL_MS = 1_000;

type Command = "specs" | "submit" | "status" | "wait" | "result" | "artifact";

export const CLIENT_EXIT = {
	success: 0,
	usage: 2,
	waitTimeout: 3,
	serviceError: 4,
	jobFailure: 5,
	artifactError: 6,
} as const;

interface ClientIo {
	stdout(value: string): void;
	stderr(value: string): void;
}

interface ParsedArguments {
	command: Command;
	baseUrl: URL;
	spec: string | null;
	jobs: string[];
	keys: string[];
	artifactName: string | null;
	output: string | null;
	timeoutMs: number;
	pollIntervalMs: number;
}

class ClientError extends Error {
	readonly exitCode: number;
	readonly code: string;
	readonly details: Record<string, unknown>;
	constructor(exitCode: number, code: string, message: string, details: Record<string, unknown> = {}) {
		super(message);
		this.exitCode = exitCode;
		this.code = code;
		this.details = details;
	}
}

function positiveInteger(value: string, option: string): number {
	const parsed = Number(value);
	if (!Number.isSafeInteger(parsed) || parsed < 1) throw new ClientError(CLIENT_EXIT.usage, "invalid_arguments", `${option} must be a positive safe integer`);
	return parsed;
}

function validateBaseUrl(value: string): URL {
	let url: URL;
	try { url = new URL(value); }
	catch { throw new ClientError(CLIENT_EXIT.usage, "invalid_base_url", "--base-url must be a valid loopback HTTP URL"); }
	if (url.protocol !== "http:" || !["127.0.0.1", "localhost"].includes(url.hostname) || url.username || url.password || (url.pathname !== "/" && url.pathname !== "") || url.search || url.hash) {
		throw new ClientError(CLIENT_EXIT.usage, "invalid_base_url", "--base-url must be an origin on http://127.0.0.1 or http://localhost");
	}
	url.pathname = "/";
	return url;
}

function one(values: string[], option: string): string | null {
	if (values.length > 1) throw new ClientError(CLIENT_EXIT.usage, "invalid_arguments", `${option} may be provided only once`);
	return values[0] ?? null;
}

export function parseClientArguments(argv: readonly string[], environment: NodeJS.ProcessEnv = process.env): ParsedArguments {
	const [rawCommand, ...rest] = argv;
	if (!rawCommand || !["specs", "submit", "status", "wait", "result", "artifact"].includes(rawCommand)) {
		throw new ClientError(CLIENT_EXIT.usage, "invalid_arguments", "command must be one of: specs, submit, status, wait, result, artifact");
	}
	const options = new Map<string, string[]>();
	for (let index = 0; index < rest.length; index += 2) {
		const name = rest[index];
		const value = rest[index + 1];
		if (!name?.startsWith("--") || value === undefined || value.startsWith("--")) throw new ClientError(CLIENT_EXIT.usage, "invalid_arguments", `option ${name ?? "<missing>"} requires one value`);
		if (!["--base-url", "--spec", "--job", "--idempotency-key", "--name", "--output", "--timeout-ms", "--poll-ms"].includes(name)) throw new ClientError(CLIENT_EXIT.usage, "invalid_arguments", `unknown option ${name}`);
		options.set(name, [...(options.get(name) ?? []), value]);
	}
	const command = rawCommand as Command;
	const baseUrl = validateBaseUrl(one(options.get("--base-url") ?? [], "--base-url") ?? environment.EVALUATION_SERVICE_BASE_URL ?? DEFAULT_BASE_URL);
	const spec = one(options.get("--spec") ?? [], "--spec");
	const jobs = options.get("--job") ?? [];
	const keys = options.get("--idempotency-key") ?? [];
	const artifactName = one(options.get("--name") ?? [], "--name");
	const output = one(options.get("--output") ?? [], "--output");
	const timeout = one(options.get("--timeout-ms") ?? [], "--timeout-ms");
	const poll = one(options.get("--poll-ms") ?? [], "--poll-ms");
	const timeoutMs = timeout ? positiveInteger(timeout, "--timeout-ms") : DEFAULT_WAIT_TIMEOUT_MS;
	const pollIntervalMs = poll ? positiveInteger(poll, "--poll-ms") : DEFAULT_POLL_INTERVAL_MS;

	if (command === "submit" && (!spec || keys.length === 0)) throw new ClientError(CLIENT_EXIT.usage, "invalid_arguments", "submit requires --spec and at least one --idempotency-key");
	if (["status", "wait", "result"].includes(command) && jobs.length === 0) throw new ClientError(CLIENT_EXIT.usage, "invalid_arguments", `${command} requires at least one --job`);
	if (command === "artifact" && (jobs.length !== 1 || !artifactName || !output)) throw new ClientError(CLIENT_EXIT.usage, "invalid_arguments", "artifact requires exactly one --job, one --name, and one --output");
	if (command !== "submit" && (spec || keys.length > 0)) throw new ClientError(CLIENT_EXIT.usage, "invalid_arguments", `--spec and --idempotency-key are valid only for submit`);
	if (command !== "artifact" && (artifactName || output)) throw new ClientError(CLIENT_EXIT.usage, "invalid_arguments", "--name and --output are valid only for artifact");
	if (command !== "wait" && (timeout || poll)) throw new ClientError(CLIENT_EXIT.usage, "invalid_arguments", "--timeout-ms and --poll-ms are valid only for wait");
	if (command === "specs" && jobs.length > 0) throw new ClientError(CLIENT_EXIT.usage, "invalid_arguments", "specs does not accept --job");
	return { command, baseUrl, spec, jobs, keys, artifactName, output, timeoutMs, pollIntervalMs };
}

function endpoint(baseUrl: URL, path: string): URL {
	return new URL(path.replace(/^\//, ""), baseUrl);
}

async function boundedResponseJson(response: Response): Promise<Record<string, unknown>> {
	const text = (await response.text()).slice(0, 16 * 1024);
	try {
		const parsed = JSON.parse(text) as unknown;
		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
	} catch { return {}; }
}

async function requestJson(baseUrl: URL, path: string, init: RequestInit = {}, acceptedStatuses: readonly number[] = [200]): Promise<{ status: number; body: Record<string, unknown> }> {
	let response: Response;
	try { response = await fetch(endpoint(baseUrl, path), init); }
	catch { throw new ClientError(CLIENT_EXIT.serviceError, "service_unavailable", "Evaluation Service could not be reached"); }
	const body = await boundedResponseJson(response);
	if (!acceptedStatuses.includes(response.status)) {
		throw new ClientError(CLIENT_EXIT.serviceError, typeof body.error === "string" ? body.error : "http_error", typeof body.message === "string" ? body.message : `Evaluation Service returned HTTP ${response.status}`, { http_status: response.status });
	}
	return { status: response.status, body };
}

function jobPath(jobId: string, suffix = ""): string {
	if (!/^[a-f0-9]{64}$/.test(jobId)) throw new ClientError(CLIENT_EXIT.usage, "invalid_job_id", "--job must be a 64-character lowercase hexadecimal Job ID");
	return `/v1/evaluation-jobs/${jobId}${suffix}`;
}

async function waitForJob(argumentsValue: ParsedArguments, jobId: string): Promise<Record<string, unknown>> {
	const deadline = Date.now() + argumentsValue.timeoutMs;
	while (Date.now() < deadline) {
		const status = (await requestJson(argumentsValue.baseUrl, jobPath(jobId))).body;
		if (status.status === "terminal") {
			const result = (await requestJson(argumentsValue.baseUrl, jobPath(jobId, "/result"))).body;
			if (result.reason !== "completed") throw new ClientError(CLIENT_EXIT.jobFailure, "job_failed", `Evaluation Job ${jobId} ended as ${String(result.reason ?? "unknown")}`, { job_id: jobId, terminal_reason: result.reason ?? null });
			return result;
		}
		if (["queue_failed", "inconsistent_requires_review"].includes(String(status.status))) throw new ClientError(CLIENT_EXIT.jobFailure, "job_state_failed", `Evaluation Job ${jobId} entered ${String(status.status)}`, { job_id: jobId, status: status.status });
		await new Promise((resolveDelay) => setTimeout(resolveDelay, Math.min(argumentsValue.pollIntervalMs, Math.max(1, deadline - Date.now()))));
	}
	throw new ClientError(CLIENT_EXIT.waitTimeout, "wait_timeout", `Client wait timed out for Job ${jobId}; the background Job was not cancelled`, { job_id: jobId, timeout_ms: argumentsValue.timeoutMs });
}

function sha256(bytes: Uint8Array): string {
	return createHash("sha256").update(bytes).digest("hex");
}

async function downloadArtifact(argumentsValue: ParsedArguments): Promise<Record<string, unknown>> {
	const jobId = argumentsValue.jobs[0]!;
	const output = resolve(argumentsValue.output!);
	if (existsSync(output)) throw new ClientError(CLIENT_EXIT.artifactError, "output_exists", "Artifact output path already exists", { output });
	const resultResponse = await requestJson(argumentsValue.baseUrl, jobPath(jobId, "/result"), {}, [200, 202]);
	if (resultResponse.status === 202) throw new ClientError(CLIENT_EXIT.jobFailure, "result_not_ready", `Evaluation Job ${jobId} is not terminal`, { job_id: jobId });
	const artifacts = Array.isArray(resultResponse.body.artifacts) ? resultResponse.body.artifacts as Array<Record<string, unknown>> : [];
	const artifact = artifacts.find((entry) => entry.name === argumentsValue.artifactName);
	if (!artifact || typeof artifact.url !== "string" || typeof artifact.bytes !== "number" || typeof artifact.sha256 !== "string") throw new ClientError(CLIENT_EXIT.artifactError, "artifact_not_found", "Named Artifact is absent from the formal result", { job_id: jobId, name: argumentsValue.artifactName });
	const artifactUrl = endpoint(argumentsValue.baseUrl, artifact.url);
	if (artifactUrl.origin !== argumentsValue.baseUrl.origin) throw new ClientError(CLIENT_EXIT.artifactError, "artifact_origin_mismatch", "Artifact URL escaped the configured Evaluation Service origin");
	let response: Response;
	try { response = await fetch(artifactUrl); }
	catch { throw new ClientError(CLIENT_EXIT.serviceError, "service_unavailable", "Evaluation Service could not be reached while downloading the Artifact"); }
	if (response.status !== 200) {
		const body = await boundedResponseJson(response);
		throw new ClientError(CLIENT_EXIT.artifactError, typeof body.error === "string" ? body.error : "artifact_download_failed", typeof body.message === "string" ? body.message : `Artifact request returned HTTP ${response.status}`, { http_status: response.status });
	}
	const bytes = new Uint8Array(await response.arrayBuffer());
	const digest = sha256(bytes);
	const responseDigest = response.headers.get("x-content-sha256");
	if (bytes.byteLength !== artifact.bytes || digest !== artifact.sha256 || responseDigest !== artifact.sha256) throw new ClientError(CLIENT_EXIT.artifactError, "artifact_integrity_failed", "Downloaded Artifact does not match the formal result metadata", { expected_bytes: artifact.bytes, actual_bytes: bytes.byteLength });
	try { writeFileSync(output, bytes, { flag: "wx" }); }
	catch { throw new ClientError(CLIENT_EXIT.artifactError, "artifact_write_failed", "Artifact output could not be created without overwriting an existing file", { output }); }
	return { command: "artifact", job_id: jobId, name: argumentsValue.artifactName, output, bytes: bytes.byteLength, sha256: digest };
}

async function execute(argumentsValue: ParsedArguments): Promise<Record<string, unknown>> {
	switch (argumentsValue.command) {
		case "specs": return { command: "specs", ...(await requestJson(argumentsValue.baseUrl, "/v1/evaluation-specs")).body };
		case "submit": {
			const results = [];
			for (const key of argumentsValue.keys) {
				try {
					const response = await requestJson(argumentsValue.baseUrl, "/v1/evaluation-jobs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "formal_skill_evaluation", evaluation_spec_id: argumentsValue.spec, idempotency_key: key }) }, [200, 202]);
					results.push({ idempotency_key: key, http_status: response.status, ...response.body });
				} catch (error) {
					if (error instanceof ClientError) throw new ClientError(error.exitCode, error.code, error.message, { ...error.details, failed_idempotency_key: key, accepted_results: results });
					throw error;
				}
			}
			return { command: "submit", evaluation_spec_id: argumentsValue.spec, results };
		}
		case "status": return { command: "status", results: await Promise.all(argumentsValue.jobs.map(async (jobId) => ({ job_id: jobId, ...(await requestJson(argumentsValue.baseUrl, jobPath(jobId))).body }))) };
		case "result": return { command: "result", results: await Promise.all(argumentsValue.jobs.map(async (jobId) => ({ job_id: jobId, ...(await requestJson(argumentsValue.baseUrl, jobPath(jobId, "/result"), {}, [200, 202])).body }))) };
		case "wait": return { command: "wait", results: await Promise.all(argumentsValue.jobs.map((jobId) => waitForJob(argumentsValue, jobId))) };
		case "artifact": return downloadArtifact(argumentsValue);
	}
}

export async function runEvaluationServiceClient(argv: readonly string[], io: ClientIo = { stdout: (value) => process.stdout.write(value), stderr: (value) => process.stderr.write(value) }, environment: NodeJS.ProcessEnv = process.env): Promise<number> {
	try {
		const result = await execute(parseClientArguments(argv, environment));
		io.stdout(`${JSON.stringify(result)}\n`);
		return CLIENT_EXIT.success;
	} catch (error) {
		const value = error instanceof ClientError ? error : new ClientError(CLIENT_EXIT.serviceError, "client_error", error instanceof Error ? error.message : "Evaluation Service client failed");
		io.stderr(`${JSON.stringify({ error: value.code, message: value.message, ...value.details })}\n`);
		return value.exitCode;
	}
}

async function main(): Promise<void> {
	process.exitCode = await runEvaluationServiceClient(process.argv.slice(2));
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === entry) void main();
