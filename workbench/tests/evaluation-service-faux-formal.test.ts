import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import test from "node:test";
import { Queue } from "bullmq";
import { snapshotWorkspace } from "../src/coding-task/workspace.ts";
import type { EvaluationQueueData, EvaluationQueueResult, ServiceRuntimeConfig } from "../src/evaluation-service/contracts.ts";
import { fileSha256 } from "../src/hash.ts";
import { startEvaluationApi } from "../src/evaluation-service/api.ts";
import { createProducerRedis } from "../src/evaluation-service/redis.ts";
import { startEvaluationWorker } from "../src/evaluation-service/worker.ts";

const PROJECT_ROOT = resolve("..");
const REDIS_URL = process.env.EVALUATION_SERVICE_TEST_REDIS_URL ?? "redis://127.0.0.1:6389/15";
const SKILL = "---\nname: service-faux-skill\ndescription: Deterministic service integration fixture.\ndisable-model-invocation: true\n---\n\nRun the declared check after the bounded edit.\n";

function portable(path: string): string { return relative(PROJECT_ROOT, path).split(sep).join("/"); }
function json(path: string, value: unknown): void { writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }

function fixture(): { root: string; registryPath: string } {
	mkdirSync(resolve(PROJECT_ROOT, ".runs"), { recursive: true });
	const root = mkdtempSync(resolve(PROJECT_ROOT, ".runs", "evaluation-service-faux-"));
	const source = resolve(root, "source");
	mkdirSync(resolve(source, "src"), { recursive: true });
	mkdirSync(resolve(source, "test"), { recursive: true });
	writeFileSync(resolve(source, "src", "subject.ts"), "export function answer(): number { return 0; }\n", "utf8");
	writeFileSync(resolve(source, "test", "public.test.mjs"), "import assert from 'node:assert/strict'; import test from 'node:test'; import { answer } from '../src/subject.ts'; test('answer', () => assert.equal(answer(), 42));\n", "utf8");
	writeFileSync(resolve(source, "package.json"), "{\"private\":true,\"type\":\"module\"}\n", "utf8");
	const verifier = resolve(root, "verifier.mjs");
	writeFileSync(verifier, "import { pathToFileURL } from 'node:url'; import { resolve } from 'node:path'; const { answer } = await import(pathToFileURL(resolve(process.env.V1_WORKSPACE, 'src/subject.ts'))); const passed = answer() === 42; console.log(JSON.stringify({schema_version:1,verifier_id:'service-faux-verifier',status:passed?'passed':'failed',summary:passed?'accepted':'failed'})); process.exitCode=passed?0:1;\n", "utf8");
	const candidateRoot = resolve(root, "candidate", "service-faux-skill");
	mkdirSync(candidateRoot, { recursive: true });
	const skillPath = resolve(candidateRoot, "SKILL.md");
	writeFileSync(skillPath, SKILL, "utf8");
	const buildPath = resolve(root, "candidate", "build.json");
	json(buildPath, { status: "built", skill_path: skillPath, skill_sha256: fileSha256(skillPath) });
	const planIds = ["faux-no-skill", "faux-with-skill"];
	const planPath = resolve(root, "plan.json");
	json(planPath, {
		evaluation_id: `service-faux-${randomUUID()}`, suite: "service-faux-two-run", execution_head: "f".repeat(40),
		candidate_build_ref: buildPath, candidate_expected_sha256: fileSha256(skillPath),
		planned_runs: planIds.map((planId, index) => ({ plan_id: planId, case_id: "service-faux-case", condition: index === 0 ? "no_skill" : "with_skill", trial: 1, task_ref: "service-faux-task", planned_skill: index === 0 ? null : { build_ref: buildPath, expected_sha256: fileSha256(skillPath) } })),
	});
	const sourceDigest = snapshotWorkspace(source).tree_digest;
	const bindings = planIds.map((planId, index) => {
		const configPath = resolve(root, `${planId}.json`);
		json(configPath, {
			task_id: "service-faux-task", prompt: "Implement answer() so the declared public check and hidden verifier pass.",
			...(index === 1 ? { skill: { path: skillPath, expected_sha256: fileSha256(skillPath) } } : {}),
			source_root: portable(source), existing_tree_digest: sourceDigest,
			writable_paths: ["src/subject.ts"], protected_paths: ["package.json", "test/public.test.mjs"],
			command_descriptors: [{ command_id: "public_test", executable: "current_node_executable", argv: ["--test", "test/public.test.mjs"], cwd: "workspace", timeout_seconds: 15, max_combined_output_bytes: 50_000 }],
			verifier_spec: { id: "service-faux-verifier", source_path: portable(verifier), sha256: fileSha256(verifier), timeout_ms: 15_000, output_limit_bytes: 50_000 },
			output_root: portable(resolve(root, "unused")), timeout_ms: 30_000,
		});
		return { plan_id: planId, config_path: portable(configPath), config_sha256: fileSha256(configPath) };
	});
	const executorPaths = [
		"workbench/scripts/run-faux-evaluation-service.ts",
		"workbench/scripts/evaluate-evaluation.ts",
		"workbench/scripts/review-evaluation.ts",
		"workbench/src/coding-task/runner.ts",
	];
	const registryPath = resolve(root, "specs.json");
	json(registryPath, { schema_version: 1, specs: [{
		schema_version: 1, id: "fixed-two-run-faux", kind: "formal_skill_evaluation", enabled: true, job_timeout_ms: 60_000, log_limit_bytes: 1_048_576,
		executor: {
			kind: "faux_formal_cli", plan_path: portable(planPath), plan_sha256: fileSha256(planPath), bindings, credential_profile_id: null,
			expected_workbench_commit: execFileSync("git", ["-C", PROJECT_ROOT, "rev-parse", "HEAD"], { encoding: "utf8", windowsHide: true }).trim(),
			expected_workbench_tree: execFileSync("git", ["-C", PROJECT_ROOT, "rev-parse", "HEAD^{tree}"], { encoding: "utf8", windowsHide: true }).trim(),
			executor_files: executorPaths.map((path) => ({ path, sha256: fileSha256(resolve(PROJECT_ROOT, path)) })),
		},
	}] });
	return { root, registryPath };
}

test("HTTP-triggered fixed two-Run Faux Evaluation traverses Pi, tools, Verifier, Mapping, Analysis, and reports with zero real access", async () => {
	const value = fixture();
	const config: ServiceRuntimeConfig = {
		projectRoot: PROJECT_ROOT, registryPath: value.registryPath, credentialRegistryPath: null, jobsRoot: resolve(value.root, "jobs"), redisUrl: REDIS_URL,
		queueName: `eval-faux-formal-${randomUUID()}`, host: "127.0.0.1", port: 4317, workerConcurrency: 1, globalConcurrency: 1,
		lockDurationMs: 60_000, stalledIntervalMs: 5_000, killGraceMs: 10_000, reconciliationGraceMs: 5_000,
	};
	const api = await startEvaluationApi(config, 0);
	const worker = await startEvaluationWorker(config);
	try {
		const address = api.address();
		const submitted = await fetch(`http://${address.host}:${address.port}/v1/evaluation-jobs`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "formal_skill_evaluation", evaluation_spec_id: "fixed-two-run-faux", idempotency_key: "faux-formal-e2e" }) });
		const submittedText = await submitted.text();
		assert.equal(submitted.status, 202, submittedText);
		const jobId = String((JSON.parse(submittedText) as Record<string, unknown>).job_id);
		let result: Record<string, unknown> | null = null;
		const deadline = Date.now() + 60_000;
		do {
			const response = await fetch(`http://${address.host}:${address.port}/v1/evaluation-jobs/${jobId}/result`);
			if (response.status === 200) result = await response.json() as Record<string, unknown>;
			else await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
		} while (!result && Date.now() < deadline);
		assert.ok(result);
		const diagnostic = result.reason === "completed" ? JSON.stringify(result) : await (await fetch(`http://${address.host}:${address.port}${String((result.artifacts as Array<Record<string, unknown>>).find((entry) => entry.name === "stderr")?.url)}`)).text();
		assert.equal(result.reason, "completed", diagnostic);
		const evaluation = result.evaluation_result as Record<string, unknown>;
		assert.equal(evaluation.executor, "faux_formal_cli");
		assert.equal(evaluation.planned_runs, 2);
		assert.equal(evaluation.completed_runs, 2);
		assert.deepEqual(evaluation.access, { credential_reads: 0, network_calls: 0, external_provider_calls: 0, real_model_calls: 0 });
		const outcomes = evaluation.run_outcomes as Array<Record<string, unknown>>;
		assert.deepEqual(outcomes.map((entry) => entry.verification_status), ["passed", "passed"]);
		const artifactNames = (result.artifacts as Array<Record<string, unknown>>).map((entry) => entry.name);
		for (const name of ["mapping", "analysis_state", "report_markdown", "report_html", "report_pdf", "run_manifest_1", "run_manifest_2", "faux_execution_metadata", "analysis_provider_requests"]) assert.ok(artifactNames.includes(name), name);
		const providerDiagnostic = (result.artifacts as Array<Record<string, unknown>>).find((entry) => entry.name === "analysis_provider_requests")!;
		const providerDiagnosticResponse = await fetch(`http://${address.host}:${address.port}${String(providerDiagnostic.url)}`);
		assert.equal(providerDiagnosticResponse.status, 200);
		assert.equal(providerDiagnosticResponse.headers.get("x-content-sha256"), providerDiagnostic.sha256);
		const providerDiagnosticJson = await providerDiagnosticResponse.json() as Record<string, unknown>;
		assert.equal(providerDiagnosticJson.kind, "analysis_provider_request_diagnostics");
		assert.ok((providerDiagnosticJson.invocations as unknown[]).length >= 1);
		assert.deepEqual(providerDiagnosticJson.privacy, { prompts_recorded:false, response_text_recorded:false, thinking_recorded:false, tool_arguments_recorded:false, credentials_recorded:false, response_headers_allowlisted:true });
	} finally {
		await worker.close(true);
		await api.close();
		const redis = createProducerRedis(config.redisUrl);
		await redis.connect();
		const queue = new Queue<EvaluationQueueData, EvaluationQueueResult, "formal_skill_evaluation">(config.queueName, { connection: redis });
		await queue.obliterate({ force: true });
		await queue.close();
		redis.disconnect(false);
		rmSync(value.root, { recursive: true, force: true });
	}
});
