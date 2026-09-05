import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import type { AnalysisState } from "../src/trace-analysis/contracts.ts";
import type { AnalysisInvocationResult } from "../src/trace-analysis/model-runner.ts";
import {
	formatHumanResult,
	parseReviewArguments,
	reviewEvaluation,
	runBoundedAnalysis,
} from "../scripts/review-evaluation.ts";

const SKILL_SOURCE = "---\nname: cli-fixture\ndescription: CLI fixture Skill\ndisable-model-invocation: true\n---\n\n# CLI Fixture\n\nFollow the fixture.\n";
const SKILL_SHA = createHash("sha256").update(SKILL_SOURCE).digest("hex");

function json(path: string, value: unknown): void {
	mkdirSync(resolve(path, ".."), { recursive: true });
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function fixture(): { root: string; plan: string; mapping: string; credential: string; output: string } {
	const root = mkdtempSync(resolve(tmpdir(), "review-cli-"));
	const skillPath = resolve(root, "candidate", "cli-fixture", "SKILL.md");
	const buildPath = resolve(root, "candidate", "build.json");
	mkdirSync(resolve(skillPath, ".."), { recursive: true });
	writeFileSync(skillPath, SKILL_SOURCE, "utf8");
	json(buildPath, { status: "built", skill_path: skillPath, skill_sha256: SKILL_SHA });
	const plans: Record<string, unknown>[] = [];
	const refs: Record<string, unknown>[] = [];
	for (const condition of ["no_skill", "with_skill"]) {
		const runId = `run-${condition}`;
		const planId = `plan-${condition}`;
		const runRoot = resolve(root, "runs", runId);
		const withSkill = condition === "with_skill";
		plans.push({
			plan_id: planId, case_id: "case-1", condition, trial: 1, task_ref: "task-1",
			planned_skill: withSkill ? { build_ref: buildPath, expected_sha256: SKILL_SHA } : null,
		});
		refs.push({ plan_id: planId, run_id: runId, run_root: runRoot, attempt: 1, included_for_evaluation: true, manual_invalid_reason: null });
		json(resolve(runRoot, "run-manifest.json"), {
			schema_version: 1, run_id: runId, task_id: "task-1", source_revision: null, existing_tree_digest: "tree",
			model: { provider: "faux", id: "fixture" }, pi_commit: "0".repeat(40),
			skill: withSkill ? { path: skillPath, actual_sha256: SKILL_SHA } : null,
			execution_status: "completed", verification_status: "passed", failure_reason: null, agent_final_claim: null,
			started_at: "2026-01-01T00:00:00Z", finished_at: "2026-01-01T00:00:01Z",
			usage: { request_count: 1, input_tokens: 1, output_tokens: 1, cost_usd: 0, tool_count: 1, duration_ms: 1, unknown_fields: [] },
			changes: { added: [], modified: [], deleted: [] },
			artifacts: { session: "session/missing.jsonl", trace: "trace.json", diff: "diff.patch", verifier_result: "verifier/result.json", report: "report.md" }, known_limitations: [],
		});
		json(resolve(runRoot, "trace.json"), { agent: { status: "completed", end_reason: "done" }, events: [
			{ sequence: 1, type: "file_read", phase: "start", tool_call_id: "tool-1", tool_name: "read", path: skillPath },
			{ sequence: 2, type: "tool_result", phase: "end", tool_call_id: "tool-1", tool_name: "read", status: "ok" },
		] });
		writeFileSync(resolve(runRoot, "diff.patch"), "", "utf8");
		json(resolve(runRoot, "verifier/result.json"), { status: "passed", exit_code: 0 });
	}
	const plan = resolve(root, "plan.json");
	const mapping = resolve(root, "mapping.json");
	const credential = resolve(root, "credential.env");
	json(plan, { evaluation_id: "eval-cli", suite: "cli-fixture", execution_head: "a".repeat(40), candidate_build_ref: buildPath, candidate_expected_sha256: SKILL_SHA, planned_runs: plans });
	json(mapping, { evaluation_id: "eval-cli", run_refs: refs });
	writeFileSync(credential, "", "utf8");
	return { root, plan, mapping, credential, output: resolve(root, "review-output") };
}

function state(phase: AnalysisState["phase"]): AnalysisState {
	return { phase, covered_runs: ["run-no_skill", "run-with_skill"], matrix_triage_complete: phase !== "blind_analysis", investigation_agenda: [], notes: [], open_questions: [], next_action: phase === "blind_analysis" ? "continue" : "human review", loaded_evidence: [], finding_drafts: [], ...(phase === "human_review_ready" ? { controlled_unblind_result: { alignments: [], follow_up_observations: [] } } : {}) };
}

function invocation(phase: AnalysisState["phase"]): AnalysisInvocationResult {
	if (phase === "human_review_ready") return { stage: "controlled_unblind", mode: "resume", model: null, usage: { provider_requests: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0, wall_time_ms: 1 }, state_path: "analysis-state.json", state: state(phase), model_invoked: false, tool_names: [], assistant_text: "" };
	return { stage: "blind_analysis", mode: phase === "blind_analysis" ? "fresh" : "resume", state_path: "analysis-state.json", state: state(phase) } as AnalysisInvocationResult;
}

test("arguments expose help and reject missing required paths", () => {
	assert.deepEqual(parseReviewArguments(["--help"]), { help: true, json: false });
	assert.throws(() => parseReviewArguments(["--plan", "plan.json"]), /missing required arguments/);
});

test("valid JSON dry-run computes the frozen bound without reading credential content or writing output", async () => {
	const value = fixture();
	try {
		const result = await reviewEvaluation({ plan: value.plan, mapping: value.mapping, credentialFile: value.credential, output: value.output, dryRun: true, json: true });
		assert.equal(result.status, "ready");
		assert.equal(result.provider_requests, 0);
		assert.ok(result.total_process_view_bytes > 0);
		assert.equal(result.base_a_invocations, Math.ceil(result.total_process_view_bytes / 75_000));
		assert.equal(result.max_a_invocations, result.base_a_invocations + 1);
		assert.equal(existsSync(value.output), false);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("dry-run fails before execution on Candidate digest drift and output collision", async () => {
	const value = fixture();
	try {
		writeFileSync(resolve(value.root, "candidate", "cli-fixture", "SKILL.md"), `${SKILL_SOURCE}\ndrift\n`, "utf8");
		await assert.rejects(reviewEvaluation({ plan: value.plan, mapping: value.mapping, credentialFile: value.credential, output: value.output, dryRun: true, json: false }), /digest mismatch/);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
	const collision = fixture();
	try {
		mkdirSync(collision.output);
		writeFileSync(resolve(collision.output, "existing.txt"), "preserve", "utf8");
		await assert.rejects(reviewEvaluation({ plan: collision.plan, mapping: collision.mapping, credentialFile: collision.credential, output: collision.output, dryRun: true, json: false }), /output root must be empty/);
		assert.equal(existsSync(resolve(collision.output, "existing.txt")), true);
	} finally { rmSync(collision.root, { recursive: true, force: true }); }
});

test("CLI --json --dry-run keeps stdout as one parseable document", () => {
	const value = fixture();
	try {
		const result = spawnSync(process.execPath, ["--experimental-loader", "./scripts/v35g2-public-pi-loader.mjs", "scripts/review-evaluation.ts", "--plan", value.plan, "--mapping", value.mapping, "--credential-file", value.credential, "--output", value.output, "--dry-run", "--json"], { cwd: resolve(import.meta.dirname, ".."), encoding: "utf8" });
		assert.equal(result.status, 0, result.stderr);
		const parsed = JSON.parse(result.stdout) as Record<string, unknown>;
		assert.equal(parsed.status, "ready");
		assert.equal(parsed.provider_requests, 0);
		assert.equal(existsSync(value.output), false);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("human output reports the terminal status and authoritative artifact paths", () => {
	const text = formatHumanResult({ status: "human_review_ready", evaluation_id: "eval-cli", output: "out", analysis_state: "state.json", report_markdown: "report.md", report_html: "report.html", report_pdf: "brief.pdf", total_process_view_bytes: 1, base_a_invocations: 1, max_a_invocations: 2, a_invocations: 1 });
	for (const expected of ["human_review_ready", "state.json", "report.md", "report.html", "brief.pdf"]) assert.match(text, new RegExp(expected));
});

test("bounded lifecycle performs A fresh/resume then exactly one controlled-unblind transition", async () => {
	const modes: string[] = [];
	const results = [invocation("blind_analysis"), invocation("alignment_ready"), invocation("human_review_ready")];
	const output = await runBoundedAnalysis({
		plan: "plan", mapping: "mapping", output: "output", credentialResolver: { resolve: async () => "unused" }, maxAInvocations: 3,
		invoke: async (options) => { modes.push(options.mode); return results.shift()!; },
	});
	assert.deepEqual(modes, ["fresh", "resume", "resume"]);
	assert.equal(output.aInvocations, 2);
	assert.equal(output.result.state.phase, "human_review_ready");
});

test("bound exhaustion stops without retry and leaves persisted State untouched", async () => {
	const root = mkdtempSync(resolve(tmpdir(), "review-cli-bound-"));
	const statePath = resolve(root, "analysis-state.json");
	writeFileSync(statePath, "preserved", "utf8");
	let calls = 0;
	try {
		await assert.rejects(runBoundedAnalysis({
			plan: "plan", mapping: "mapping", output: root, credentialResolver: { resolve: async () => "unused" }, maxAInvocations: 2,
			invoke: async () => { calls++; return invocation("blind_analysis"); },
		}), /A invocation bound exhausted at 2\/2/);
		assert.equal(calls, 2);
		assert.equal(existsSync(statePath), true);
	} finally { rmSync(root, { recursive: true, force: true }); }
});
