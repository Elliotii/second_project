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
