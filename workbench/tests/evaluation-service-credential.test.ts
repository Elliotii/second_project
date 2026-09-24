import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { Queue } from "bullmq";
import { startEvaluationApi } from "../src/evaluation-service/api.ts";
import type { EvaluationQueueData, EvaluationQueueResult, ServiceRuntimeConfig } from "../src/evaluation-service/contracts.ts";
import { createProducerRedis } from "../src/evaluation-service/redis.ts";
import { startEvaluationWorker } from "../src/evaluation-service/worker.ts";

const REDIS_URL = process.env.EVALUATION_SERVICE_TEST_REDIS_URL ?? "redis://127.0.0.1:6389/15";

function allFileBytes(root: string): Buffer[] {
	return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
		const path = resolve(root, entry.name);
		return entry.isDirectory() ? allFileBytes(path) : entry.isFile() ? [readFileSync(path)] : [];
	});
}

test("Worker-managed credential never enters Redis Job data, HTTP, or persisted Job artifacts", async () => {
	const root = mkdtempSync(resolve(tmpdir(), "eval-service-credential-"));
	const jobsRoot = resolve(root, "jobs");
	const secret = `sentinel-${randomUUID()}-credential`;
	const credentialFile = resolve(root, "private.env");
	const credentialRegistry = resolve(root, "credentials.json");
	const registryPath = resolve(root, "specs.json");
	writeFileSync(credentialFile, `DEEPSEEK_API_KEY=${secret}\n`, "utf8");
	writeFileSync(credentialRegistry, `${JSON.stringify({ schema_version: 1, profiles: [{ id: "test-secret", file: credentialFile }] })}\n`, "utf8");
	writeFileSync(registryPath, `${JSON.stringify({ schema_version: 1, specs: [{ schema_version: 1, id: "credential-redaction", kind: "formal_skill_evaluation", enabled: true, job_timeout_ms: 10_000, log_limit_bytes: 65_536, executor: { kind: "fake", behavior: "credential_echo", delay_ms: 0, credential_profile_id: "test-secret", stdout_bytes: 32 } }] })}\n`, "utf8");
	const config: ServiceRuntimeConfig = {
		projectRoot: resolve(".."), registryPath, credentialRegistryPath: credentialRegistry, jobsRoot, redisUrl: REDIS_URL,
		queueName: `eval-credential-${randomUUID()}`, host: "127.0.0.1", port: 4317, workerConcurrency: 1, globalConcurrency: 1,
		lockDurationMs: 5_000, stalledIntervalMs: 1_000, killGraceMs: 5_000, reconciliationGraceMs: 5_000,
	};
	const api = await startEvaluationApi(config, 0);
	const worker = await startEvaluationWorker(config);
	const redis = createProducerRedis(config.redisUrl);
	try {
		const address = api.address();
		const submitted = await fetch(`http://${address.host}:${address.port}/v1/evaluation-jobs`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "formal_skill_evaluation", evaluation_spec_id: "credential-redaction", idempotency_key: "credential-test" }) });
		assert.equal(submitted.status, 202);
		const jobId = String((await submitted.json() as Record<string, unknown>).job_id);
		let responseText = "";
		const deadline = Date.now() + 10_000;
		do {
			const response = await fetch(`http://${address.host}:${address.port}/v1/evaluation-jobs/${jobId}/result`);
			responseText = await response.text();
			if (response.status === 200) break;
			await new Promise((resolveDelay) => setTimeout(resolveDelay, 50));
		} while (Date.now() < deadline);
		assert.match(responseText, /"reason":"completed"/);
		assert.equal(responseText.includes(secret), false);
		for (const bytes of allFileBytes(jobsRoot)) assert.equal(bytes.includes(Buffer.from(secret)), false);
		await redis.connect();
		for (const key of await redis.keys(`bull:${config.queueName}:*`)) {
			const dump = await redis.dump(key);
			if (dump) assert.equal(Buffer.from(dump).includes(Buffer.from(secret)), false, key);
		}
		const stdout = allFileBytes(jobsRoot).find((bytes) => bytes.includes(Buffer.from("redaction-probe=")));
		assert.ok(stdout);
		assert.equal(stdout.includes(Buffer.from("[REDACTED]")), true);
	} finally {
		await worker.close(true);
		await api.close();
		const cleanupRedis = createProducerRedis(config.redisUrl);
		await cleanupRedis.connect();
		const queue = new Queue<EvaluationQueueData, EvaluationQueueResult, "formal_skill_evaluation">(config.queueName, { connection: cleanupRedis });
		await queue.obliterate({ force: true });
		await queue.close();
		cleanupRedis.disconnect(false);
		if (redis.status !== "end") redis.disconnect(false);
		rmSync(root, { recursive: true, force: true });
	}
});
