import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import type { CodingTaskRunManifest } from "../src/coding-task/contracts.ts";
import { snapshotWorkspace } from "../src/coding-task/workspace.ts";
import type { ReviewResult } from "../scripts/review-evaluation.ts";
import { evaluateEvaluation, formatEvaluateResult, parseEvaluateArguments, type EvaluateCliOptions } from "../scripts/evaluate-evaluation.ts";

const SKILL = "---\nname: evaluate-fixture\ndescription: Evaluate CLI fixture\ndisable-model-invocation: true\n---\n\n# Evaluate Fixture\n\nFollow the fixture.\n";
const SKILL_SHA = createHash("sha256").update(SKILL).digest("hex");

function json(path: string, value: unknown): void {
	mkdirSync(resolve(path, ".."), { recursive: true });
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function fixture(): { root: string; options: EvaluateCliOptions; planIds: string[] } {
	const root = mkdtempSync(resolve(tmpdir(), "evaluate-cli-"));
	const source = resolve(root, "source");
	mkdirSync(resolve(source, "src"), { recursive: true });
	writeFileSync(resolve(source, "src", "subject.ts"), "export const value = 1;\n", "utf8");
	const sourceDigest = snapshotWorkspace(source).tree_digest;
	const verifier = resolve(root, "verifier.mjs");
	writeFileSync(verifier, "console.log('{}');\n", "utf8");
	const verifierSha = createHash("sha256").update(readFileSync(verifier)).digest("hex");
	const skillPath = resolve(root, "candidate", "evaluate-fixture", "SKILL.md");
	mkdirSync(resolve(skillPath, ".."), { recursive: true });
	writeFileSync(skillPath, SKILL, "utf8");
	const buildPath = resolve(root, "candidate", "build.json");
	json(buildPath, { status: "built", skill_path: skillPath, skill_sha256: SKILL_SHA });
	const planIds = ["p-no-skill", "p-with-skill"];
	const plannedRuns = planIds.map((planId, index) => ({
		plan_id: planId, case_id: "case-1", condition: index === 0 ? "no_skill" : "with_skill", trial: 1, task_ref: `task-${index + 1}`,
		planned_skill: index === 0 ? null : { build_ref: buildPath, expected_sha256: SKILL_SHA },
	}));
	const plan = resolve(root, "plan.json");
	json(plan, { evaluation_id: "eval-cli-2", suite: "fixture", execution_head: "a".repeat(40), candidate_build_ref: buildPath, candidate_expected_sha256: SKILL_SHA, planned_runs: plannedRuns });
	const bindings = planIds.map((planId, index) => {
		const configPath = resolve(root, `${planId}.config.json`);
		json(configPath, {
			task_id: `task-${index + 1}`, prompt: `do task ${index + 1}`,
			...(index === 1 ? { skill: { path: skillPath, expected_sha256: SKILL_SHA } } : {}),
			source_root: "source", existing_tree_digest: sourceDigest,
			writable_paths: ["src/**"], protected_paths: [],
			command_descriptors: [{ command_id: "test", executable: "current_node_executable", argv: ["test.mjs"], cwd: "workspace", timeout_seconds: 10, max_combined_output_bytes: 1000 }],
			verifier_spec: { id: "fixture-verifier", source_path: "verifier.mjs", sha256: verifierSha, timeout_ms: 10_000, output_limit_bytes: 10_000 },
			output_root: "unused-runs", timeout_ms: 60_000,
		});
		return { planId, configPath };
	});
	const credential = resolve(root, "credential.env");
	writeFileSync(credential, "", "utf8");
	return { root, planIds, options: { projectRoot: root, plan, bindings, credentialFile: credential, output: resolve(root, "evaluate-output"), json: true } };
}

function manifest(runId: string, verificationStatus: "passed" | "failed"): CodingTaskRunManifest {
	return {
		schema_version: 1, run_id: runId, task_id: runId, source_revision: null, existing_tree_digest: "tree",
		model: { provider: "faux", id: "fixture" }, pi_commit: "0".repeat(40), skill: null,
		execution_status: "completed", verification_status: verificationStatus, failure_reason: null, agent_final_claim: null,
		started_at: "2026-01-01T00:00:00Z", finished_at: "2026-01-01T00:00:01Z",
		usage: { request_count: 1, input_tokens: 1, output_tokens: 1, cost_usd: 0, tool_count: 0, duration_ms: 1, unknown_fields: [] },
		changes: { added: [], modified: [], deleted: [] }, artifacts: { session: "session.jsonl", trace: "trace.json", diff: "diff.patch", verifier_result: "verifier/result.json", report: "report.md" }, known_limitations: [],
	};
}

function reviewed(root: string): ReviewResult {
	return {
		status: "human_review_ready", evaluation_id: "eval-cli-2", output: resolve(root, "review"), analysis_state: resolve(root, "review", "analysis-state.json"),
		report_markdown: resolve(root, "review", "report.md"), report_html: resolve(root, "review", "report.html"), report_pdf: resolve(root, "review", "brief.pdf"),
		total_process_view_bytes: 1, base_a_invocations: 1, max_a_invocations: 2, a_invocations: 1,
	};
}

test("binding preflight rejects missing, duplicate, and unknown plan IDs before the first Run", async () => {
	for (const kind of ["missing", "duplicate", "unknown"] as const) {
		const value = fixture();
		let runs = 0;
		try {
			const bindings = kind === "missing" ? value.options.bindings.slice(0, 1)
				: kind === "duplicate" ? [...value.options.bindings, { ...value.options.bindings[0]! }]
					: [...value.options.bindings, { planId: "unknown", configPath: value.options.bindings[0]!.configPath }];
			await assert.rejects(evaluateEvaluation({ ...value.options, bindings }, { runTask: async () => { runs++; throw new Error("must not run"); } }), new RegExp(kind === "missing" ? "missing config binding" : `${kind}.*binding|binding.*${kind}`));
			assert.equal(runs, 0);
			assert.equal(existsSync(value.options.output), false);
		} finally { rmSync(value.root, { recursive: true, force: true }); }
	}
});

test("success runs the frozen order, writes current Thin Mapping, and hands off to review", async () => {
	const value = fixture();
	const order: string[] = [];
	let reviewCalls = 0;
	try {
		const result = await evaluateEvaluation(value.options, {
			runTask: async ({ plan, task }) => {
				order.push(plan.plan_id);
				assert.equal(task.output_root, resolve(value.options.output, "runs"));
				const runRoot = resolve(task.output_root, `run-${plan.plan_id}`);
				mkdirSync(runRoot, { recursive: true });
				return { manifest: manifest(`run-${plan.plan_id}`, "passed"), run_root: runRoot };
			},
			review: async (options) => {
				reviewCalls++;
				assert.equal(existsSync(options.mapping), true);
				return reviewed(value.options.output);
			},
		});
		assert.deepEqual(order, value.planIds);
		assert.equal(reviewCalls, 1);
		assert.equal(result.completed_runs, 2);
		const mapping = JSON.parse(readFileSync(result.mapping, "utf8")) as { run_refs: Array<Record<string, unknown>> };
		assert.deepEqual(mapping.run_refs.map((entry) => entry.plan_id), value.planIds);
		assert.ok(mapping.run_refs.every((entry) => entry.attempt === 1 && entry.included_for_evaluation === true && entry.manual_invalid_reason === null));
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("a legal failed outcome remains mapped and does not stop later planned Runs", async () => {
	const value = fixture();
	const observed: string[] = [];
	try {
		const result = await evaluateEvaluation(value.options, {
			runTask: async ({ plan, task }) => {
				observed.push(plan.plan_id);
				const runRoot = resolve(task.output_root, `run-${plan.plan_id}`);
				mkdirSync(runRoot, { recursive: true });
				return { manifest: manifest(`run-${plan.plan_id}`, observed.length === 1 ? "failed" : "passed"), run_root: runRoot };
			},
			review: async () => reviewed(value.options.output),
		});
		assert.deepEqual(observed, value.planIds);
		assert.equal(result.completed_runs, 2);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("operational failure stops without retry or review and preserves prior Run artifacts", async () => {
	const value = fixture();
	let calls = 0;
	let reviewCalls = 0;
	const preserved = resolve(value.options.output, "runs", "run-first", "marker.txt");
	try {
		await assert.rejects(evaluateEvaluation(value.options, {
			runTask: async ({ task }) => {
				calls++;
				if (calls === 2) throw new Error("operational stop");
				mkdirSync(resolve(preserved, ".."), { recursive: true });
				writeFileSync(preserved, "preserved", "utf8");
				return { manifest: manifest("run-first", "passed"), run_root: resolve(task.output_root, "run-first") };
			},
			review: async () => { reviewCalls++; return reviewed(value.options.output); },
		}), /after 1\/2 completed Runs: operational stop/);
		assert.equal(calls, 2);
		assert.equal(reviewCalls, 0);
		assert.equal(existsSync(preserved), true);
		assert.equal(existsSync(resolve(value.options.output, "mapping", "thin-evaluation-mapping.json")), false);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("JSON result is one parseable document containing Mapping, Analysis, and report paths", () => {
	const value = fixture();
	try {
		const result = {
			status: "human_review_ready", evaluation_id: "eval-cli-2", planned_runs: 2, completed_runs: 2,
			mapping: "mapping.json", review_phase: "human_review_ready", analysis_state: "analysis-state.json",
			total_process_view_bytes: 1, base_a_invocations: 1, max_a_invocations: 2, a_invocations: 1,
			report_markdown: "report.md", report_html: "report.html", report_pdf: "brief.pdf",
		} as const;
		const parsed = JSON.parse(formatEvaluateResult(result, true)) as Record<string, unknown>;
		for (const key of ["mapping", "analysis_state", "report_markdown", "report_html", "report_pdf"]) assert.equal(typeof parsed[key], "string");
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("argument parser accepts explicit repeated plan bindings and help", () => {
	assert.deepEqual(parseEvaluateArguments(["--help"]), { help: true, json: false });
	const parsed = parseEvaluateArguments(["--project-root", "root", "--plan", "plan", "--bind", "p1=a.json", "--bind", "p2=b.json", "--credential-file", "credential", "--output", "out", "--json"]);
	assert.ok(!("help" in parsed));
	assert.deepEqual(parsed.bindings, [{ planId: "p1", configPath: "a.json" }, { planId: "p2", configPath: "b.json" }]);
});
