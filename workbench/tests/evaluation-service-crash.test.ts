import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { Queue } from "bullmq";
import { startEvaluationApi, type EvaluationApiHandle } from "../src/evaluation-service/api.ts";
import type { EvaluationQueueData, EvaluationQueueResult, ServiceRuntimeConfig } from "../src/evaluation-service/contracts.ts";
import { EvaluationJobStore, readJsonFile } from "../src/evaluation-service/job-store.ts";
import { processIsAlive } from "../src/evaluation-service/process-supervisor.ts";
import { createProducerRedis } from "../src/evaluation-service/redis.ts";
import { startEvaluationWorker } from "../src/evaluation-service/worker.ts";

const REDIS_URL = process.env.EVALUATION_SERVICE_TEST_REDIS_URL ?? "redis://127.0.0.1:6389/15";
const PROJECT_ROOT = resolve("..");

function writeRegistry(path: string): void {
	writeFileSync(path, `${JSON.stringify({ schema_version: 1, specs: [{
		schema_version: 1, id: "crash-after-dispatch", kind: "formal_skill_evaluation", enabled: true,
		job_timeout_ms: 30_000, log_limit_bytes: 65_536,
		executor: { kind: "fake", behavior: "timeout", delay_ms: 0, credential_profile_id: null, stdout_bytes: 64 },
	}] }, null, 2)}\n`, "utf8");
}

function config(root: string, registryPath: string, queueName: string): ServiceRuntimeConfig {
	return { projectRoot: PROJECT_ROOT, registryPath, credentialRegistryPath: null, jobsRoot: root, redisUrl: REDIS_URL, queueName, host: "127.0.0.1", port: 4317, workerConcurrency: 1, globalConcurrency: 1, lockDurationMs: 1_000, stalledIntervalMs: 500, killGraceMs: 5_000, reconciliationGraceMs: 5_000 };
}

async function waitFor(predicate: () => boolean, timeoutMs: number): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	do {
		if (predicate()) return;
		await new Promise((resolveDelay) => setTimeout(resolveDelay, 50));
	} while (Date.now() < deadline);
	throw new Error("condition did not become true before timeout");
}

async function waitReady(child: ChildProcess): Promise<void> {
	await new Promise<void>((resolveReady, reject) => {
		let stdout = "";
		const timer = setTimeout(() => reject(new Error("Worker child did not become ready")), 10_000);
		child.once("error", reject);
		child.stdout!.on("data", (chunk: Buffer) => {
			stdout += chunk.toString("utf8");
			if (stdout.includes('"status":"ready"')) { clearTimeout(timer); resolveReady(); }
		});
	});
}

async function cleanupQueue(configValue: ServiceRuntimeConfig): Promise<void> {
	const redis = createProducerRedis(configValue.redisUrl);
	await redis.connect();
	const queue = new Queue<EvaluationQueueData, EvaluationQueueResult, "formal_skill_evaluation">(configValue.queueName, { connection: redis });
	await queue.obliterate({ force: true });
	await queue.close();
	redis.disconnect(false);
}

test("a stalled redelivery after Worker death never blindly respawns a dispatched evaluator", async () => {
	const fixtureRoot = mkdtempSync(resolve(tmpdir(), "eval-service-crash-"));
	const jobsRoot = resolve(fixtureRoot, "jobs");
	const registryPath = resolve(fixtureRoot, "specs.json");
	writeRegistry(registryPath);
	const configValue = config(jobsRoot, registryPath, `eval-crash-${randomUUID()}`);
	let api: EvaluationApiHandle | null = null;
	let crashedWorker: ChildProcess | null = null;
	let replacement: Awaited<ReturnType<typeof startEvaluationWorker>> | null = null;
	try {
		api = await startEvaluationApi(configValue, 0);
		const environment = {
			...process.env,
			EVALUATION_SERVICE_PROJECT_ROOT: configValue.projectRoot,
			EVALUATION_SERVICE_SPEC_REGISTRY: configValue.registryPath,
			EVALUATION_SERVICE_JOBS_ROOT: configValue.jobsRoot,
			EVALUATION_SERVICE_REDIS_URL: configValue.redisUrl,
			EVALUATION_SERVICE_QUEUE: configValue.queueName,
			EVALUATION_SERVICE_WORKER_CONCURRENCY: "1",
			EVALUATION_SERVICE_GLOBAL_CONCURRENCY: "1",
			EVALUATION_SERVICE_LOCK_DURATION_MS: "1000",
			EVALUATION_SERVICE_STALLED_INTERVAL_MS: "500",
			EVALUATION_SERVICE_KILL_GRACE_MS: "5000",
			EVALUATION_SERVICE_RECONCILIATION_GRACE_MS: "5000",
		};
		crashedWorker = spawn(process.execPath, ["--experimental-strip-types", resolve("src/evaluation-service/worker.ts")], { cwd: resolve("."), env: environment, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
		await waitReady(crashedWorker);
		const address = api.address();
		const submitted = await fetch(`http://${address.host}:${address.port}/v1/evaluation-jobs`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "formal_skill_evaluation", evaluation_spec_id: "crash-after-dispatch", idempotency_key: "worker-crash-key" }) });
		assert.equal(submitted.status, 202);
		const jobId = String((await submitted.json() as Record<string, unknown>).job_id);
		const store = new EvaluationJobStore(jobsRoot);
		const launchRoot = resolve(store.jobRoot(jobId), "attempt-1", "launch-0001");
		await waitFor(() => existsSync(resolve(launchRoot, "dispatch.json")) && existsSync(resolve(launchRoot, "runner-process.json")), 10_000);
		const runner = readJsonFile(resolve(launchRoot, "runner-process.json")) as { pid: number };
		assert.equal(processIsAlive(runner.pid), true);
		const workerExit = new Promise<void>((resolveExit) => crashedWorker!.once("exit", () => resolveExit()));
		assert.equal(crashedWorker.kill("SIGKILL"), true);
		await workerExit;
		crashedWorker = null;
		replacement = await startEvaluationWorker(configValue);
		let result: Record<string, unknown> | null = null;
		const deadline = Date.now() + 15_000;
		do {
			const response = await fetch(`http://${address.host}:${address.port}/v1/evaluation-jobs/${jobId}/result`);
			if (response.status === 200) result = await response.json() as Record<string, unknown>;
			else await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
		} while (!result && Date.now() < deadline);
		assert.ok(result);
		assert.equal(result.reason, "uncertain_requires_review");
		assert.equal(result.cleanup_confirmed, true);
		assert.match(String(result.message), /crossed the dispatch boundary/);
		assert.equal(processIsAlive(runner.pid), false);
		assert.deepEqual(readdirSync(resolve(store.jobRoot(jobId), "attempt-1")).filter((name) => name.startsWith("launch-")), ["launch-0001"]);
	} finally {
		if (crashedWorker) crashedWorker.kill("SIGKILL");
		if (replacement) await replacement.close(true);
		if (api) await api.close();
		await cleanupQueue(configValue).catch(() => undefined);
		rmSync(fixtureRoot, { recursive: true, force: true });
	}
});
