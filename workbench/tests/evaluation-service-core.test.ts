import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { createBoundedLogSink } from "../src/evaluation-service/bounded-log.ts";
import { loadServiceRuntimeConfig } from "../src/evaluation-service/config.ts";
import { EVALUATION_JOB_KIND, type RegisteredEvaluationSpec } from "../src/evaluation-service/contracts.ts";
import { EvaluationJobStore, SubmissionConflictError } from "../src/evaluation-service/job-store.ts";
import { loadEvaluationSpecRegistry, safeProjectPath } from "../src/evaluation-service/registry.ts";

function fakeSpec(id: string): RegisteredEvaluationSpec {
	return { schema_version: 1, id, kind: EVALUATION_JOB_KIND, enabled: true, job_timeout_ms: 30_000, log_limit_bytes: 1024, executor: { kind: "fake", behavior: "success", delay_ms: 0, credential_profile_id: null, stdout_bytes: 0 } };
}

test("deployment concurrency is configurable and is not fixed to two", () => {
	const config = loadServiceRuntimeConfig({
		EVALUATION_SERVICE_PROJECT_ROOT: resolve("."),
		EVALUATION_SERVICE_WORKER_CONCURRENCY: "4",
		EVALUATION_SERVICE_GLOBAL_CONCURRENCY: "8",
	});
	assert.equal(config.workerConcurrency, 4);
	assert.equal(config.globalConcurrency, 8);
});

test("checked-in registry exposes multiple allowlisted small fake Specs", () => {
	const specs = loadEvaluationSpecRegistry(resolve("config/evaluation-service/specs.json"));
	assert.ok(specs.size >= 6);
	assert.equal(specs.get("fake-task-failure")?.executor.kind, "fake");
	assert.throws(() => safeProjectPath(resolve("."), "../escape", "test path"), /escapes/);
});

test("formal Spec makes Analysis request timeout auditable, configurable, and subordinate to the Job deadline", () => {
	const root = mkdtempSync(resolve(tmpdir(), "eval-registry-timeout-"));
	const registry = resolve(root, "specs.json");
	const executor = (timeout?: unknown) => ({
		kind: "formal_cli", plan_path: "plan.json", plan_sha256: "a".repeat(64),
		bindings: [{ plan_id: "p1", config_path: "config.json", config_sha256: "b".repeat(64) }],
		credential_profile_id: "deepseek", expected_workbench_commit: "c".repeat(40), expected_workbench_tree: "d".repeat(40),
		executor_files: [{ path: "executor.ts", sha256: "e".repeat(64) }],
		...(timeout === undefined ? {} : { analysis_request_timeout_ms: timeout }),
	});
	const spec = (id: string, timeout?: unknown) => ({ schema_version:1, id, kind:EVALUATION_JOB_KIND, enabled:true, job_timeout_ms:400_000, log_limit_bytes:1024, executor:executor(timeout) });
	try {
		writeFileSync(registry, `${JSON.stringify({ schema_version:1, specs:[spec("default"), spec("targeted", 300_000)] })}\n`, "utf8");
		const loaded = loadEvaluationSpecRegistry(registry);
		const defaultExecutor = loaded.get("default")?.executor;
		const targetedExecutor = loaded.get("targeted")?.executor;
		assert.equal(defaultExecutor?.kind === "formal_cli" ? defaultExecutor.analysis_request_timeout_ms : null, 120_000);
		assert.equal(targetedExecutor?.kind === "formal_cli" ? targetedExecutor.analysis_request_timeout_ms : null, 300_000);
		writeFileSync(registry, `${JSON.stringify({ schema_version:1, specs:[spec("invalid", 400_000)] })}\n`, "utf8");
		assert.throws(() => loadEvaluationSpecRegistry(registry), /must be less than job_timeout_ms/);
		writeFileSync(registry, `${JSON.stringify({ schema_version:1, specs:[spec("string", "300000")] })}\n`, "utf8");
		assert.throws(() => loadEvaluationSpecRegistry(registry), /safe integer/);
	} finally { rmSync(root, { recursive: true, force: true }); }
});

test("filesystem submission index deduplicates identical payloads and rejects key reuse", () => {
	const root = mkdtempSync(resolve(tmpdir(), "eval-job-store-"));
	try {
		const store = new EvaluationJobStore(root);
		const input = { kind: EVALUATION_JOB_KIND, evaluation_spec_id: "fake-one", idempotency_key: "stable-key" } as const;
		const first = store.createSubmission(input, fakeSpec("fake-one"));
		const second = store.createSubmission(input, fakeSpec("fake-one"));
		assert.equal(first.created, true);
		assert.equal(second.created, false);
		assert.equal(first.jobId, second.jobId);
		assert.throws(() => store.createSubmission({ ...input, evaluation_spec_id: "fake-two" }, fakeSpec("fake-two")), SubmissionConflictError);
	} finally { rmSync(root, { recursive: true, force: true }); }
});

test("bounded streaming logs redact secrets across chunk boundaries without using a process maxBuffer", () => {
	const root = mkdtempSync(resolve(tmpdir(), "eval-log-"));
	try {
		const path = resolve(root, "stdout.log");
		const sink = createBoundedLogSink(path, 48, ["secret-value-123"]);
		sink.write("prefix secret-");
		sink.write("value-123 suffix ");
		for (let index = 0; index < 100; index++) sink.write("abcdefghij");
		const result = sink.close();
		const stored = readFileSync(path, "utf8");
		assert.equal(stored.includes("secret-value-123"), false);
		assert.equal(stored.includes("[REDACTED]"), true);
		assert.equal(result.stored_bytes, 48);
		assert.equal(result.truncated, true);
		assert.equal(result.redactions, 1);
	} finally { rmSync(root, { recursive: true, force: true }); }
});

test("the formal Evaluation entry no longer reads DEEPSEEK_API_KEY from process.env", () => {
	const source = readFileSync(resolve("scripts/evaluate-evaluation.ts"), "utf8");
	assert.equal(source.includes("process.env.DEEPSEEK_API_KEY"), false);
	assert.match(source, /credentialResolverFactory/);
});
