import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { Queue } from "bullmq";
import { startEvaluationApi, type EvaluationApiHandle } from "../src/evaluation-service/api.ts";
import { EVALUATION_JOB_KIND, type EvaluationQueueData, type EvaluationQueueResult, type ServiceRuntimeConfig } from "../src/evaluation-service/contracts.ts";
import { EvaluationJobStore, readJsonFile } from "../src/evaluation-service/job-store.ts";
import { processIsAlive } from "../src/evaluation-service/process-supervisor.ts";
import { createProducerRedis } from "../src/evaluation-service/redis.ts";
import { loadEvaluationSpecRegistry } from "../src/evaluation-service/registry.ts";
import { diagnosticArtifacts, startEvaluationWorker } from "../src/evaluation-service/worker.ts";
import { CLIENT_EXIT, runEvaluationServiceClient } from "../scripts/evaluation-service-client.ts";

const REDIS_URL = process.env.EVALUATION_SERVICE_TEST_REDIS_URL ?? "redis://127.0.0.1:6389/15";
const PROJECT_ROOT = resolve("..");

function config(root: string, queueName: string, redisUrl = REDIS_URL): ServiceRuntimeConfig {
	return {
		projectRoot: PROJECT_ROOT,
		registryPath: resolve("config/evaluation-service/specs.json"),
		credentialRegistryPath: null,
		jobsRoot: root,
		redisUrl,
		queueName,
		host: "127.0.0.1",
		port: 4317,
		workerConcurrency: 2,
		globalConcurrency: 2,
		lockDurationMs: 5_000,
		stalledIntervalMs: 1_000,
		killGraceMs: 5_000,
		reconciliationGraceMs: 5_000,
	};
}

async function request(api: EvaluationApiHandle, method: string, path: string, body?: unknown): Promise<{ status: number; body: Record<string, unknown>; text: string }> {
	const address = api.address();
	const response = await fetch(`http://${address.host}:${address.port}${path}`, { method, ...(body === undefined ? {} : { headers: { "content-type": "application/json" }, body: JSON.stringify(body) }) });
	const text = await response.text();
	return { status: response.status, body: text ? JSON.parse(text) as Record<string, unknown> : {}, text };
}

async function submit(api: EvaluationApiHandle, spec: string, key: string): Promise<{ status: number; jobId: string }> {
	const response = await request(api, "POST", "/v1/evaluation-jobs", { kind: "formal_skill_evaluation", evaluation_spec_id: spec, idempotency_key: key });
	return { status: response.status, jobId: String(response.body.job_id ?? "") };
}

async function awaitResult(api: EvaluationApiHandle, jobId: string, timeoutMs = 15_000): Promise<Record<string, unknown>> {
	const deadline = Date.now() + timeoutMs;
	do {
		const result = await request(api, "GET", `/v1/evaluation-jobs/${jobId}/result`);
		if (result.status === 200) return result.body;
		assert.equal(result.status, 202);
		await new Promise((resolveDelay) => setTimeout(resolveDelay, 50));
	} while (Date.now() < deadline);
	throw new Error(`Job ${jobId} did not terminalize within ${timeoutMs} ms`);
}

async function removeQueue(configValue: ServiceRuntimeConfig): Promise<void> {
	const connection = createProducerRedis(configValue.redisUrl);
	await connection.connect();
	const queue = new Queue<EvaluationQueueData, EvaluationQueueResult, "formal_skill_evaluation">(configValue.queueName, { connection });
	await queue.obliterate({ force: true });
	await queue.close();
	connection.disconnect(false);
}

function clientCapture(): { stdout: string[]; stderr: string[]; io: { stdout(value: string): void; stderr(value: string): void } } {
	const stdout: string[] = [];
	const stderr: string[] = [];
	return { stdout, stderr, io: { stdout: (value) => stdout.push(value), stderr: (value) => stderr.push(value) } };
}

test("HTTP, BullMQ, Worker, results, idempotency, legal TASK_FAILURE, failure, and timeout form one real Redis loop", async () => {
	const root = mkdtempSync(resolve(tmpdir(), "eval-service-redis-"));
	const configValue = config(root, `eval-service-test-${randomUUID()}`);
	let api: EvaluationApiHandle | null = null;
	let worker: Awaited<ReturnType<typeof startEvaluationWorker>> | null = null;
	try {
		api = await startEvaluationApi(configValue, 0);
		worker = await startEvaluationWorker(configValue);
		const health = await request(api, "GET", "/health");
		assert.equal(health.status, 200);

		const success = await submit(api, "fake-fast-success", "success-key");
		assert.equal(success.status, 202);
		assert.match(success.jobId, /^[a-f0-9]{64}$/);
		const duplicate = await submit(api, "fake-fast-success", "success-key");
		assert.equal(duplicate.status, 200);
		assert.equal(duplicate.jobId, success.jobId);
		const conflict = await submit(api, "fake-task-failure", "success-key");
		assert.equal(conflict.status, 409);
		const successfulResult = await awaitResult(api, success.jobId);
		assert.equal(successfulResult.reason, "completed");
		assert.equal((successfulResult.evaluation_result as Record<string, unknown>).task_outcome, "PASS");
		const artifacts = successfulResult.artifacts as Array<Record<string, unknown>>;
		const report = artifacts.find((artifact) => artifact.name === "report_markdown");
		assert.ok(report);
		const reportResponse = await fetch(`http://${api.address().host}:${api.address().port}${String(report.url)}`);
		assert.equal(reportResponse.status, 200);
		assert.match(await reportResponse.text(), /Task outcome: PASS/);

		const taskFailure = await submit(api, "fake-task-failure", "task-failure-key");
		const taskFailureResult = await awaitResult(api, taskFailure.jobId);
		assert.equal(taskFailureResult.reason, "completed");
		assert.equal((taskFailureResult.evaluation_result as Record<string, unknown>).task_outcome, "TASK_FAILURE");

		const executionFailure = await submit(api, "fake-execution-failure", "execution-failure-key");
		assert.equal((await awaitResult(api, executionFailure.jobId)).reason, "execution_failed");

		const timeout = await submit(api, "fake-timeout", "timeout-key");
		const timeoutResult = await awaitResult(api, timeout.jobId);
		assert.equal(timeoutResult.reason, "timed_out_cleanup_complete", JSON.stringify(timeoutResult));
		assert.equal(timeoutResult.cleanup_confirmed, true);

		const nested = await submit(api, "fake-nested-timeout", "nested-timeout-key");
		const nestedResult = await awaitResult(api, nested.jobId);
		assert.equal(nestedResult.reason, "timed_out_cleanup_complete", JSON.stringify(nestedResult));
		const store = new EvaluationJobStore(root);
		const processTreePath = resolve(store.jobRoot(nested.jobId), "attempt-1", "launch-0001", "process-tree.json");
		assert.equal(existsSync(processTreePath), true);
		const tree = readJsonFile(processTreePath) as { processes: Array<{ pid: number }> };
		assert.ok(tree.processes.length >= 2);
		assert.ok(tree.processes.every((entry) => !processIsAlive(entry.pid)));
	} finally {
		if (worker) await worker.close(true);
		if (api) await api.close();
		await removeQueue(configValue).catch(() => undefined);
		rmSync(root, { recursive: true, force: true });
	}
});

test("two delayed fake Jobs overlap while keeping launch roots, terminals, and Artifacts isolated", async () => {
	const root = mkdtempSync(resolve(tmpdir(), "eval-service-two-job-"));
	const configValue = config(root, `eval-service-two-job-${randomUUID()}`);
	let api: EvaluationApiHandle | null = null;
	let worker: Awaited<ReturnType<typeof startEvaluationWorker>> | null = null;
	try {
		api = await startEvaluationApi(configValue, 0);
		worker = await startEvaluationWorker(configValue);
		const [left, right] = await Promise.all([
			submit(api, "fake-delay-100ms", "two-job-left"),
			submit(api, "fake-delay-100ms", "two-job-right"),
		]);
		assert.equal(left.status, 202);
		assert.equal(right.status, 202);
		assert.notEqual(left.jobId, right.jobId);
		const [leftResult, rightResult] = await Promise.all([awaitResult(api, left.jobId), awaitResult(api, right.jobId)]);
		assert.equal(leftResult.reason, "completed");
		assert.equal(rightResult.reason, "completed");

		const store = new EvaluationJobStore(root);
		const launch = (jobId: string) => resolve(store.jobRoot(jobId), "attempt-1", "launch-0001");
		const interval = (jobId: string) => {
			const reservation = readJsonFile(resolve(launch(jobId), "launch-reservation.json")) as { job_id: string; launch_token: string; reserved_at: string };
			const terminal = store.readTerminal(jobId);
			assert.ok(terminal);
			assert.equal(reservation.job_id, jobId);
			return { token: reservation.launch_token, start: Date.parse(reservation.reserved_at), end: Date.parse(terminal.finished_at), artifacts: terminal.artifacts };
		};
		const leftInterval = interval(left.jobId);
		const rightInterval = interval(right.jobId);
		assert.notEqual(leftInterval.token, rightInterval.token);
		assert.ok(Math.max(leftInterval.start, rightInterval.start) < Math.min(leftInterval.end, rightInterval.end), JSON.stringify({ leftInterval, rightInterval }));
		assert.notEqual(store.jobRoot(left.jobId), store.jobRoot(right.jobId));
		assert.ok(leftInterval.artifacts.length > 0 && rightInterval.artifacts.length > 0);
		const leftPaths = leftInterval.artifacts.map((artifact) => store.resolvePublicArtifact(left.jobId, artifact.path));
		const rightPaths = rightInterval.artifacts.map((artifact) => store.resolvePublicArtifact(right.jobId, artifact.path));
		assert.ok(leftPaths.every((path) => path.startsWith(store.jobRoot(left.jobId)) && !path.includes(right.jobId)));
		assert.ok(rightPaths.every((path) => path.startsWith(store.jobRoot(right.jobId)) && !path.includes(left.jobId)));
		assert.notEqual(leftPaths[0], rightPaths[0]);
	} finally {
		if (worker) await worker.close(true);
		if (api) await api.close();
		await removeQueue(configValue).catch(() => undefined);
		rmSync(root, { recursive: true, force: true });
	}
});

test("thin client drives the real loopback API through submit, wait, result, and Artifact download", async () => {
	const root = mkdtempSync(resolve(tmpdir(), "eval-service-client-integration-"));
	const configValue = config(resolve(root, "jobs"), `eval-service-client-${randomUUID()}`);
	let api: EvaluationApiHandle | null = null;
	let worker: Awaited<ReturnType<typeof startEvaluationWorker>> | null = null;
	try {
		api = await startEvaluationApi(configValue, 0);
		worker = await startEvaluationWorker(configValue);
		const baseUrl = `http://${api.address().host}:${api.address().port}`;
		const submitted = clientCapture();
		assert.equal(await runEvaluationServiceClient(["submit", "--base-url", baseUrl, "--spec", "fake-task-failure", "--idempotency-key", "client-integration"], submitted.io), CLIENT_EXIT.success);
		const jobId = String(JSON.parse(submitted.stdout[0]!).results[0].job_id);
		assert.match(jobId, /^[a-f0-9]{64}$/);

		const waited = clientCapture();
		assert.equal(await runEvaluationServiceClient(["wait", "--base-url", baseUrl, "--job", jobId, "--timeout-ms", "10000", "--poll-ms", "10"], waited.io), CLIENT_EXIT.success);
		assert.equal(JSON.parse(waited.stdout[0]!).results[0].evaluation_result.task_outcome, "TASK_FAILURE");

		const queried = clientCapture();
		assert.equal(await runEvaluationServiceClient(["result", "--base-url", baseUrl, "--job", jobId], queried.io), CLIENT_EXIT.success);
		assert.equal(JSON.parse(queried.stdout[0]!).results[0].reason, "completed");

		const output = resolve(root, "downloaded-report.md");
		const artifact = clientCapture();
		assert.equal(await runEvaluationServiceClient(["artifact", "--base-url", baseUrl, "--job", jobId, "--name", "report_markdown", "--output", output], artifact.io), CLIENT_EXIT.success);
		assert.match(readFileSync(output, "utf8"), /TASK_FAILURE/);
	} finally {
		if (worker) await worker.close(true);
		if (api) await api.close();
		await removeQueue(configValue).catch(() => undefined);
		rmSync(root, { recursive: true, force: true });
	}
});

test("HTTP remains queryable in degraded mode and fails Redis-unavailable submissions closed", async () => {
	const root = mkdtempSync(resolve(tmpdir(), "eval-service-no-redis-"));
	const configValue = config(root, `eval-service-offline-${randomUUID()}`, "redis://127.0.0.1:6398/15");
	const store = new EvaluationJobStore(root);
	const spec = loadEvaluationSpecRegistry(configValue.registryPath).get("fake-fast-success");
	assert.ok(spec);
	const submission = store.createSubmission({ kind:EVALUATION_JOB_KIND, evaluation_spec_id:spec.id, idempotency_key:"offline-completed-diagnostic" }, spec);
	const launchRoot = resolve(store.jobRoot(submission.jobId), "attempt-1", "launch-0001");
	const diagnosticPath = resolve(launchRoot, "evaluation-output", "review", "analysis-provider-requests.json");
	mkdirSync(resolve(diagnosticPath, ".."), { recursive:true });
	writeFileSync(diagnosticPath, `${JSON.stringify({ schema_version:1, kind:"analysis_provider_request_diagnostics", invocations:[] })}\n`, "utf8");
	const artifacts = diagnosticArtifacts(store, submission.jobId, launchRoot);
	assert.deepEqual(artifacts.map((entry) => entry.name), ["analysis_provider_requests"]);
	assert.throws(() => store.artifact(submission.jobId, "escape", resolve(root, "..", "outside-diagnostic.json")), /escapes the Job root/);
	store.writeTerminal({ schema_version:1, job_id:submission.jobId, attempt:1, reason:"execution_failed", started_at:"2026-09-24T00:00:00.000Z", finished_at:"2026-09-24T00:00:01.000Z", message:"synthetic Analysis failure", cleanup_confirmed:true, evaluation_result:null, artifacts });
	const api = await startEvaluationApi(configValue, 0);
	try {
		assert.equal((await request(api, "GET", "/health")).status, 503);
		const status = await request(api, "GET", `/v1/evaluation-jobs/${submission.jobId}`);
		assert.equal(status.status, 200);
		assert.equal(status.body.status, "terminal");
		assert.equal(status.body.queue_state, "unavailable");
		const completed = await request(api, "GET", `/v1/evaluation-jobs/${submission.jobId}/result`);
		assert.equal(completed.status, 200);
		const diagnostic = (completed.body.artifacts as Array<Record<string, unknown>>).find((entry) => entry.name === "analysis_provider_requests");
		assert.ok(diagnostic);
		const downloaded = await fetch(`http://${api.address().host}:${api.address().port}${String(diagnostic.url)}`);
		assert.equal(downloaded.status, 200);
		assert.equal(Number(downloaded.headers.get("content-length")), diagnostic.bytes);
		assert.equal(downloaded.headers.get("x-content-sha256"), diagnostic.sha256);
		assert.equal(Buffer.byteLength(await downloaded.text()), diagnostic.bytes);
		writeFileSync(diagnosticPath, "tampered\n", "utf8");
		const rejected = await fetch(`http://${api.address().host}:${api.address().port}${String(diagnostic.url)}`);
		assert.equal(rejected.status, 409);
		assert.match(await rejected.text(), /artifact_integrity_failed/);
		const response = await request(api, "POST", "/v1/evaluation-jobs", { kind: "formal_skill_evaluation", evaluation_spec_id: "fake-fast-success", idempotency_key: "offline-key" });
		assert.equal(response.status, 503);
		assert.equal(response.text.includes("redis://"), false);
	} finally {
		await api.close();
		rmSync(root, { recursive: true, force: true });
	}
});
