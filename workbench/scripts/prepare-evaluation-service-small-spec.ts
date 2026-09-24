import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { snapshotWorkspace } from "../src/coding-task/workspace.ts";
import { fileSha256 } from "../src/hash.ts";

const PROJECT_ROOT = resolve("..");
const OUTPUT_ROOT = process.env.EVALUATION_SERVICE_SMALL_SPEC_OUTPUT
	? resolve(process.env.EVALUATION_SERVICE_SMALL_SPEC_OUTPUT)
	: resolve(PROJECT_ROOT, ".runs", "evaluation-service-specs", "small-real-v2");
const FIXTURE_ROOT = resolve(PROJECT_ROOT, "workbench", "fixtures", "evaluation-service-small");

function portable(path: string): string { return relative(PROJECT_ROOT, path).split(sep).join("/"); }
function write(path: string, value: unknown): void { writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", flag: "wx" }); }

if (existsSync(OUTPUT_ROOT)) throw new Error(`small real Spec output already exists: ${OUTPUT_ROOT}`);
mkdirSync(OUTPUT_ROOT, { recursive: true });

const sourceRoot = resolve(FIXTURE_ROOT, "source");
const verifierPath = resolve(FIXTURE_ROOT, "verifier.mjs");
const skillPath = resolve(FIXTURE_ROOT, "candidate", "evaluation-service-small", "SKILL.md");
const skillSha = fileSha256(skillPath);
const buildPath = resolve(OUTPUT_ROOT, "candidate-build.json");
write(buildPath, { status: "built", skill_path: skillPath, skill_sha256: skillSha });

const planIds = ["small-real-no-skill", "small-real-with-skill"];
const planPath = resolve(OUTPUT_ROOT, "frozen-plan.json");
const head = execFileSync("git", ["-C", PROJECT_ROOT, "rev-parse", "HEAD"], { encoding: "utf8", windowsHide: true }).trim();
const tree = execFileSync("git", ["-C", PROJECT_ROOT, "rev-parse", "HEAD^{tree}"], { encoding: "utf8", windowsHide: true }).trim();
write(planPath, {
	evaluation_id: "evaluation-service-small-real-v2",
	suite: "evaluation-service-small-real-v2",
	execution_head: head,
	candidate_build_ref: buildPath,
	candidate_expected_sha256: skillSha,
	planned_runs: planIds.map((planId, index) => ({
		plan_id: planId,
		case_id: "evaluation-service-small-case",
		condition: index === 0 ? "no_skill" : "with_skill",
		trial: 1,
		task_ref: "evaluation-service-small-task",
		planned_skill: index === 0 ? null : { build_ref: buildPath, expected_sha256: skillSha },
	})),
});

const sourceDigest = snapshotWorkspace(sourceRoot).tree_digest;
const bindings = planIds.map((planId, index) => {
	const path = resolve(OUTPUT_ROOT, `${planId}.config.json`);
	write(path, {
		task_id: "evaluation-service-small-task",
		prompt: "Change src/subject.ts so answer() returns 42, then run the declared public test.",
		...(index === 1 ? { skill: { path: skillPath, expected_sha256: skillSha } } : {}),
		source_root: portable(sourceRoot),
		existing_tree_digest: sourceDigest,
		writable_paths: ["src/subject.ts"],
		protected_paths: ["package.json", "test/public.test.mjs"],
		command_descriptors: [{ command_id: "public_test", executable: "current_node_executable", argv: ["--test", "test/public.test.mjs"], cwd: "workspace", timeout_seconds: 30, max_combined_output_bytes: 100_000 }],
		verifier_spec: { id: "evaluation-service-small-verifier", source_path: portable(verifierPath), sha256: fileSha256(verifierPath), timeout_ms: 30_000, output_limit_bytes: 100_000 },
		output_root: portable(resolve(OUTPUT_ROOT, "unused-config-output")),
		timeout_ms: 900_000,
	});
	return { plan_id: planId, config_path: portable(path), config_sha256: fileSha256(path) };
});

const executorPaths = [
	"workbench/package.json",
	"workbench/package-lock.json",
	"workbench/scripts/evaluate-evaluation.ts",
	"workbench/scripts/review-evaluation.ts",
	"workbench/src/coding-task/runner.ts",
	"workbench/src/runtime/pi-runtime.ts",
	"workbench/src/trace-analysis/evaluation.ts",
	"workbench/src/trace-analysis/model-runner.ts",
	"workbench/src/trace-analysis/model-tools.ts",
	"workbench/src/trace-analysis/runtime-config.ts",
	"workbench/src/evaluation-service/api.ts",
	"workbench/src/evaluation-service/bounded-log.ts",
	"workbench/src/evaluation-service/config.ts",
	"workbench/src/evaluation-service/contracts.ts",
	"workbench/src/evaluation-service/evaluation-job-child.ts",
	"workbench/src/evaluation-service/job-store.ts",
	"workbench/src/evaluation-service/process-supervisor.ts",
	"workbench/src/evaluation-service/redis.ts",
	"workbench/src/evaluation-service/registry.ts",
	"workbench/src/evaluation-service/result-validation.ts",
	"workbench/src/evaluation-service/worker.ts",
];
const registryPath = resolve(OUTPUT_ROOT, "specs.json");
write(registryPath, { schema_version: 1, specs: [{
	schema_version: 1,
	id: "small-real-two-run-v2",
	kind: "formal_skill_evaluation",
	enabled: true,
	job_timeout_ms: 2_400_000,
	log_limit_bytes: 16_777_216,
		executor: {
		kind: "formal_cli",
		plan_path: portable(planPath),
		plan_sha256: fileSha256(planPath),
		bindings,
		credential_profile_id: "deepseek-default",
		analysis_request_timeout_ms: 300_000,
		expected_workbench_commit: head,
		expected_workbench_tree: tree,
		executor_files: executorPaths.map((path) => ({ path, sha256: fileSha256(resolve(PROJECT_ROOT, path)) })),
	},
}] });
const estimatePath = resolve(OUTPUT_ROOT, "real-call-estimate.json");
write(estimatePath, {
	schema_version: 1,
	status: "estimate_not_authorization",
	model: "deepseek/deepseek-v4-flash",
	planned_coding_runs: 2,
	expected_coding_provider_requests_per_run: "approximately 3-8 for this small edit; model-controlled",
	expected_analysis_provider_requests: "approximately 1-3; controlled unblind may be zero-model when there are no kept findings",
	expected_total_provider_requests: "approximately 7-19; not a hard bound",
	pinned_model_price_usd_per_million_tokens: { input: 0.14, output: 0.28, cache_read: 0.0028 },
	working_cost_estimate_usd: "typically below 0.10 for this fixture; use 0.20 as a conservative authorization budget, not an enforced cap",
	important_limit: "The existing formal Evaluation has timeout bounds but no service-added token/request/cost cap. This service does not silently reduce its model or task budgets.",
});
process.stdout.write(`${JSON.stringify({ output_root: OUTPUT_ROOT, registry: registryPath, plan: planPath, estimate: estimatePath })}\n`);
