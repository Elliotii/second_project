import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { Queue } from "bullmq";
import { startEvaluationApi } from "../src/evaluation-service/api.ts";
import type { EvaluationJobTerminal, EvaluationQueueData, EvaluationQueueResult, ServiceRuntimeConfig } from "../src/evaluation-service/contracts.ts";
import { EvaluationJobStore } from "../src/evaluation-service/job-store.ts";
import { createProducerRedis } from "../src/evaluation-service/redis.ts";
import { startEvaluationWorker } from "../src/evaluation-service/worker.ts";

const PROJECT_ROOT = resolve("..");
const REDIS_URL = process.env.EVALUATION_SERVICE_TEST_REDIS_URL ?? "redis://127.0.0.1:6389/15";

function percentile(values: readonly number[], fraction: number): number {
	if (values.length === 0) return 0;
	const sorted = [...values].sort((left, right) => left - right);
	return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)]!;
}

function maximumOverlap(intervals: Array<{ start: number; end: number }>): number {
	const events = intervals.flatMap((interval) => [{ at: interval.start, delta: 1 }, { at: interval.end, delta: -1 }]).sort((left, right) => left.at - right.at || left.delta - right.delta);
	let active = 0;
	let maximum = 0;
	for (const event of events) { active += event.delta; maximum = Math.max(maximum, active); }
	return maximum;
}

function directoryBytes(root: string): number {
	return readdirSync(root, { withFileTypes: true }).reduce((total, entry) => {
		const path = resolve(root, entry.name);
		return total + (entry.isDirectory() ? directoryBytes(path) : entry.isFile() ? statSync(path).size : 0);
	}, 0);
}

async function cleanupQueue(config: ServiceRuntimeConfig): Promise<void> {
	const redis = createProducerRedis(config.redisUrl);
	await redis.connect();
	const queue = new Queue<EvaluationQueueData, EvaluationQueueResult, "formal_skill_evaluation">(config.queueName, { connection: redis });
	await queue.obliterate({ force: true });
	await queue.close();
	redis.disconnect(false);
}

async function runScenario(outputRoot: string, label: string, concurrency: number, count: number, specId: string): Promise<Record<string, unknown>> {
	const jobsRoot = resolve(outputRoot, label, "job-store");
	const config: ServiceRuntimeConfig = {
		projectRoot: PROJECT_ROOT,
		registryPath: resolve("config/evaluation-service/specs.json"),
		credentialRegistryPath: null,
		jobsRoot,
		redisUrl: REDIS_URL,
		queueName: `capacity-${label}-${randomUUID()}`,
		host: "127.0.0.1",
		port: 4317,
		workerConcurrency: concurrency,
		globalConcurrency: concurrency,
		lockDurationMs: 30_000,
		stalledIntervalMs: 5_000,
		killGraceMs: 5_000,
		reconciliationGraceMs: 5_000,
	};
	const api = await startEvaluationApi(config, 0);
	const worker = await startEvaluationWorker(config);
	const store = new EvaluationJobStore(jobsRoot);
	const address = api.address();
	let peakCoordinatorRss = process.memoryUsage().rss;
	const memorySampler = setInterval(() => { peakCoordinatorRss = Math.max(peakCoordinatorRss, process.memoryUsage().rss); }, 20);
	const cpuBefore = process.cpuUsage();
	const scenarioStarted = performance.now();
	const submittedAt = Date.now();
	try {
		const submissions = await Promise.all(Array.from({ length: count }, async (_, index) => {
			const started = performance.now();
			const response = await fetch(`http://${address.host}:${address.port}/v1/evaluation-jobs`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "formal_skill_evaluation", evaluation_spec_id: specId, idempotency_key: `${label}-${index}` }) });
			if (response.status !== 202) throw new Error(`submission ${index} returned ${response.status}`);
			const body = await response.json() as Record<string, unknown>;
			return { jobId: String(body.job_id), latencyMs: performance.now() - started };
		}));
		await Promise.all(submissions.map(async ({ jobId }) => {
			const deadline = Date.now() + 120_000;
			do {
				const response = await fetch(`http://${address.host}:${address.port}/v1/evaluation-jobs/${jobId}/result`);
				if (response.status === 200) {
					const terminal = await response.json() as EvaluationJobTerminal;
					if (terminal.reason !== "completed") throw new Error(`Job ${jobId} terminalized as ${terminal.reason}`);
					return;
				}
				await new Promise((resolveDelay) => setTimeout(resolveDelay, 20));
			} while (Date.now() < deadline);
			throw new Error(`Job ${jobId} did not complete within 120 seconds`);
		}));
		const durationMs = performance.now() - scenarioStarted;
		const cpu = process.cpuUsage(cpuBefore);
		const intervals = submissions.map(({ jobId }) => {
			const request = store.readRequest(jobId);
			const launch = JSON.parse(readFileSync(resolve(store.jobRoot(jobId), "attempt-1", "launch-0001", "launch-reservation.json"), "utf8")) as { reserved_at: string };
			const completed = store.readTerminal(jobId)!;
			return { accepted: Date.parse(request.accepted_at), start: Date.parse(launch.reserved_at), end: Date.parse(completed.finished_at) };
		});
		const waits = intervals.map((interval) => interval.start - interval.accepted);
		return {
			label,
			spec_id: specId,
			job_count: count,
			configured_worker_concurrency: concurrency,
			configured_global_concurrency: concurrency,
			observed_max_execution_overlap: maximumOverlap(intervals),
			duration_ms: Math.round(durationMs * 100) / 100,
			completed_jobs_per_second: Math.round((count / (durationMs / 1_000)) * 100) / 100,
			submission_latency_ms: { p50: Math.round(percentile(submissions.map((entry) => entry.latencyMs), 0.5) * 100) / 100, p95: Math.round(percentile(submissions.map((entry) => entry.latencyMs), 0.95) * 100) / 100, max: Math.round(Math.max(...submissions.map((entry) => entry.latencyMs)) * 100) / 100 },
			queue_wait_ms: { p50: percentile(waits, 0.5), p95: percentile(waits, 0.95), max: Math.max(...waits) },
			coordinator_cpu_ms: Math.round((cpu.user + cpu.system) / 1_000),
			peak_coordinator_rss_bytes: peakCoordinatorRss,
			job_artifact_bytes: directoryBytes(jobsRoot),
			started_at_epoch_ms: submittedAt,
		};
	} finally {
		clearInterval(memorySampler);
		await worker.close(true);
		await api.close();
		await cleanupQueue(config).catch(() => undefined);
	}
}

async function main(): Promise<void> {
	const bulkCount = Number(process.env.EVALUATION_SERVICE_CAPACITY_JOB_COUNT ?? "100");
	if (!Number.isSafeInteger(bulkCount) || bulkCount < 100 || bulkCount > 1_000) throw new Error("EVALUATION_SERVICE_CAPACITY_JOB_COUNT must be an integer from 100 to 1000");
	const runId = `capacity-${new Date().toISOString().replace(/[-:.TZ]/g, "")}-${randomUUID().slice(0, 8)}`;
	const outputRoot = resolve(PROJECT_ROOT, ".runs", "evaluation-service-capacity", runId);
	mkdirSync(outputRoot, { recursive: true });
	const scenarios: Record<string, unknown>[] = [];
	for (const concurrency of [1, 2, 4, 8]) scenarios.push(await runScenario(outputRoot, `concurrency-${concurrency}`, concurrency, Math.max(16, concurrency * 4), "fake-delay-100ms"));
	scenarios.push(await runScenario(outputRoot, `bulk-${bulkCount}`, 8, bulkCount, "fake-fast-success"));
	const report = {
		schema_version: 1,
		run_id: runId,
		created_at: new Date().toISOString(),
		redis_url_redacted: REDIS_URL.replace(/:\/\/[^@/]+@/, "://[REDACTED]@"),
		interpretation_boundary: "Fake evaluator service-mechanism measurements only; not Coding Agent or model throughput.",
		scenarios,
	};
	const reportPath = resolve(outputRoot, "capacity-report.json");
	writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
	process.stdout.write(`${JSON.stringify({ report: relative(PROJECT_ROOT, reportPath).replaceAll("\\", "/"), ...report })}\n`);
}

await main();
