import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { CLIENT_EXIT, parseClientArguments, runEvaluationServiceClient } from "../scripts/evaluation-service-client.ts";

const JOB_A = "a".repeat(64);
const JOB_B = "b".repeat(64);

function json(response: ServerResponse, status: number, value: unknown): void {
	const body = `${JSON.stringify(value)}\n`;
	response.writeHead(status, { "content-type": "application/json", "content-length": Buffer.byteLength(body) });
	response.end(body);
}

async function server(handler: (request: IncomingMessage, response: ServerResponse) => void): Promise<{ baseUrl: string; close(): Promise<void> }> {
	const instance = createServer(handler);
	await new Promise<void>((resolveListen, reject) => {
		instance.once("error", reject);
		instance.listen(0, "127.0.0.1", () => { instance.off("error", reject); resolveListen(); });
	});
	const address = instance.address();
	assert.ok(address && typeof address !== "string");
	return { baseUrl: `http://127.0.0.1:${address.port}`, close: () => new Promise<void>((resolveClose, reject) => instance.close((error) => error ? reject(error) : resolveClose())) };
}

function capture(): { stdout: string[]; stderr: string[]; io: { stdout(value: string): void; stderr(value: string): void } } {
	const stdout: string[] = [];
	const stderr: string[] = [];
	return { stdout, stderr, io: { stdout: (value) => stdout.push(value), stderr: (value) => stderr.push(value) } };
}

test("client accepts only a loopback HTTP origin and validates command-specific arguments", () => {
	assert.throws(() => parseClientArguments(["specs", "--base-url", "https://example.com"]), /loopback HTTP URL|origin/);
	assert.throws(() => parseClientArguments(["submit", "--spec", "registered"]), /idempotency-key/);
	assert.throws(() => parseClientArguments(["artifact", "--job", JOB_A, "--name", "report"]), /--output/);
	assert.equal(parseClientArguments(["wait", "--job", JOB_A, "--timeout-ms", "5", "--poll-ms", "1"]).command, "wait");
});

test("specs and repeated submit use only the existing HTTP contract and surface conflicts", async () => {
	const seen: Array<{ method: string; url: string; body: Record<string, unknown> | null }> = [];
	const api = await server((request, response) => {
		void (async () => {
			let body: Record<string, unknown> | null = null;
			if (request.method === "POST") {
				const chunks: Buffer[] = [];
				for await (const chunk of request) chunks.push(Buffer.from(chunk));
				body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
			}
			seen.push({ method: request.method ?? "", url: request.url ?? "", body });
			if (request.url === "/v1/evaluation-specs") { json(response, 200, { specs: [{ id: "registered" }] }); return; }
			if (body?.idempotency_key === "conflict") { json(response, 409, { error: "idempotency_conflict", message: "key is bound to another payload" }); return; }
			json(response, 202, { job_id: body?.idempotency_key === "key-a" ? JOB_A : JOB_B, status: "queued", deduplicated: false });
		})().catch(() => response.destroy());
	});
	try {
		const listed = capture();
		assert.equal(await runEvaluationServiceClient(["specs", "--base-url", api.baseUrl], listed.io), CLIENT_EXIT.success);
		assert.equal(JSON.parse(listed.stdout[0]!).specs[0].id, "registered");
		const submitted = capture();
		assert.equal(await runEvaluationServiceClient(["submit", "--base-url", api.baseUrl, "--spec", "registered", "--idempotency-key", "key-a", "--idempotency-key", "key-b"], submitted.io), CLIENT_EXIT.success);
		assert.deepEqual(JSON.parse(submitted.stdout[0]!).results.map((entry: Record<string, unknown>) => entry.job_id), [JOB_A, JOB_B]);
		assert.deepEqual(seen.filter((entry) => entry.method === "POST").map((entry) => entry.body?.idempotency_key), ["key-a", "key-b"]);
		const conflict = capture();
		assert.equal(await runEvaluationServiceClient(["submit", "--base-url", api.baseUrl, "--spec", "registered", "--idempotency-key", "key-a", "--idempotency-key", "conflict"], conflict.io), CLIENT_EXIT.serviceError);
		const conflictResult = JSON.parse(conflict.stderr[0]!);
		assert.equal(conflictResult.error, "idempotency_conflict");
		assert.equal(conflictResult.failed_idempotency_key, "conflict");
		assert.equal(conflictResult.accepted_results[0].job_id, JOB_A);
	} finally { await api.close(); }
});

test("wait distinguishes completed business failure, infrastructure failure, and local timeout without cancellation", async () => {
	const methods: string[] = [];
	const api = await server((request, response) => {
		methods.push(`${request.method} ${request.url}`);
		if (request.url === `/v1/evaluation-jobs/${JOB_A}`) { json(response, 200, { job_id: JOB_A, status: "terminal", terminal_reason: "completed" }); return; }
		if (request.url === `/v1/evaluation-jobs/${JOB_A}/result`) { json(response, 200, { job_id: JOB_A, reason: "completed", evaluation_result: { task_outcome: "TASK_FAILURE" }, artifacts: [] }); return; }
		if (request.url === `/v1/evaluation-jobs/${JOB_B}`) { json(response, 200, { job_id: JOB_B, status: "terminal", terminal_reason: "execution_failed" }); return; }
		if (request.url === `/v1/evaluation-jobs/${JOB_B}/result`) { json(response, 200, { job_id: JOB_B, reason: "execution_failed", evaluation_result: null, artifacts: [] }); return; }
		json(response, 404, { error: "not_found", message: "not found" });
	});
	try {
		const businessFailure = capture();
		assert.equal(await runEvaluationServiceClient(["wait", "--base-url", api.baseUrl, "--job", JOB_A, "--timeout-ms", "100", "--poll-ms", "1"], businessFailure.io), CLIENT_EXIT.success);
		assert.equal(JSON.parse(businessFailure.stdout[0]!).results[0].evaluation_result.task_outcome, "TASK_FAILURE");
		const infrastructureFailure = capture();
		assert.equal(await runEvaluationServiceClient(["wait", "--base-url", api.baseUrl, "--job", JOB_B, "--timeout-ms", "100", "--poll-ms", "1"], infrastructureFailure.io), CLIENT_EXIT.jobFailure);

		const pendingJob = "c".repeat(64);
		const pendingApi = await server((_request, response) => json(response, 200, { job_id: pendingJob, status: "running", terminal_reason: null }));
		try {
			const timedOut = capture();
			assert.equal(await runEvaluationServiceClient(["wait", "--base-url", pendingApi.baseUrl, "--job", pendingJob, "--timeout-ms", "20", "--poll-ms", "2"], timedOut.io), CLIENT_EXIT.waitTimeout);
			assert.match(timedOut.stderr[0]!, /not cancelled/);
		} finally { await pendingApi.close(); }
		assert.ok(methods.every((entry) => entry.startsWith("GET ")));
	} finally { await api.close(); }
});

test("artifact verifies formal metadata and refuses to overwrite an existing output", async () => {
	const root = mkdtempSync(resolve(tmpdir(), "evaluation-client-"));
	const output = resolve(root, "report.md");
	const payload = Buffer.from("# verified report\n", "utf8");
	const digest = createHash("sha256").update(payload).digest("hex");
	const api = await server((request, response) => {
		if (request.url === `/v1/evaluation-jobs/${JOB_A}/result`) { json(response, 200, { job_id: JOB_A, reason: "completed", artifacts: [{ name: "report_markdown", bytes: payload.length, sha256: digest, url: `/v1/evaluation-jobs/${JOB_A}/artifacts/report_markdown` }] }); return; }
		if (request.url === `/v1/evaluation-jobs/${JOB_A}/artifacts/report_markdown`) { response.writeHead(200, { "content-length": payload.length, "x-content-sha256": digest }); response.end(payload); return; }
		json(response, 404, { error: "not_found", message: "not found" });
	});
	try {
		const downloaded = capture();
		assert.equal(await runEvaluationServiceClient(["artifact", "--base-url", api.baseUrl, "--job", JOB_A, "--name", "report_markdown", "--output", output], downloaded.io), CLIENT_EXIT.success);
		assert.equal(readFileSync(output, "utf8"), payload.toString("utf8"));
		assert.equal(JSON.parse(downloaded.stdout[0]!).sha256, digest);
		const repeated = capture();
		assert.equal(await runEvaluationServiceClient(["artifact", "--base-url", api.baseUrl, "--job", JOB_A, "--name", "report_markdown", "--output", output], repeated.io), CLIENT_EXIT.artifactError);
		assert.equal(JSON.parse(repeated.stderr[0]!).error, "output_exists");
		assert.equal(existsSync(output), true);
	} finally { await api.close(); rmSync(root, { recursive: true, force: true }); }
});

test("an unreachable service has a distinct nonzero exit", async () => {
	const output = capture();
	assert.equal(await runEvaluationServiceClient(["specs", "--base-url", "http://127.0.0.1:1"], output.io), CLIENT_EXIT.serviceError);
	assert.equal(JSON.parse(output.stderr[0]!).error, "service_unavailable");
});
