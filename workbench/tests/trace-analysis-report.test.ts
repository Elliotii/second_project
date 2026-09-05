import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import type { AnalysisState, SkillBehaviorAlignment } from "../src/trace-analysis/contracts.ts";
import { buildAnalysisReportView } from "../src/trace-analysis/analysis-report-view.ts";
import { ANALYSIS_REPORT_FILENAMES } from "../src/trace-analysis/analysis-report-generate.ts";
import {
	REPORT_ENUM_ZH,
	buildSystemConclusion,
	findingContextSubtitle,
	renderAnalysisReportBriefHtml,
	renderAnalysisReportHtml,
	renderAnalysisReportMarkdown,
} from "../src/trace-analysis/analysis-report-render.ts";

const SKILL_SOURCE = "---\nname: skill\ndescription: Fixture Skill for report tests\ndisable-model-invocation: true\n---\n\n# Fixture Skill\n\nUse the fixture workflow.\n";
const SHA = createHash("sha256").update(SKILL_SOURCE).digest("hex");
function json(path: string, value: unknown): void { mkdirSync(resolve(path, ".."), { recursive: true }); writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }

function alignment(id: string): SkillBehaviorAlignment {
	return {
		behavior_finding_id: id,
		content_correspondence: "NONE",
		skill_evidence_refs: [],
		differentiation_status: id === "FD-1" ? "INSUFFICIENT" : "MIXED",
		condition_contrast: `condition contrast ${id}`,
		counter_and_claim_boundary: `counter boundary ${id}`,
		benefit: "UNPROVEN",
		causation: "UNSUPPORTED",
		max_supported_claim: `maximum supported claim ${id}`,
		skill_recommendation: "NO_CHANGE_JUSTIFIED",
		evidence_disposition: "CLOSE",
	};
}

function fixture(withFindings = true): { root: string; batchPath: string; mappingPath: string; statePath: string } {
	const root = mkdtempSync(resolve(tmpdir(), "analysis-report-"));
	const plans: Array<Record<string, unknown>> = [];
	const refs: Array<Record<string, unknown>> = [];
	const runIds: string[] = [];
	for (const caseId of ["A", "B", "C"]) for (const trial of [1, 2, 3]) for (const condition of ["no_skill", "with_skill"]) {
		const planId = `${caseId}-${condition}-${trial}`;
		const runId = `run-${planId}`;
		const runRoot = resolve(root, "runs", runId);
		const taskFailure = caseId === "A" && trial === 3 && condition === "no_skill";
		const plannedSkill = condition === "with_skill" ? { build_ref: resolve(root, "candidate", "build.json"), expected_sha256: SHA } : null;
		plans.push({ plan_id: planId, case_id: caseId, condition, trial, task_ref: `task-${caseId}`, planned_skill: plannedSkill });
		refs.push({ plan_id: planId, run_id: runId, run_root: runRoot, attempt: 1, included_for_evaluation: true, manual_invalid_reason: null });
		runIds.push(runId);
		json(resolve(runRoot, "run-manifest.json"), {
			schema_version: 1, run_id: runId, task_id: `task-${caseId}`, source_revision: null, existing_tree_digest: "tree",
			model: { provider: "faux", id: "fixture" }, pi_commit: "0".repeat(40),
			skill: condition === "with_skill" ? { path: "candidate/SKILL.md", actual_sha256: SHA } : null,
			execution_status: "completed", verification_status: taskFailure ? "failed" : "passed", failure_reason: null, agent_final_claim: null,
			started_at: "2026-01-01T00:00:00Z", finished_at: "2026-01-01T00:00:01Z",
			usage: { request_count: 1, input_tokens: 1, output_tokens: 1, cost_usd: 0, tool_count: 1, duration_ms: 1, unknown_fields: [] },
			changes: { added: [], modified: ["src/a.ts"], deleted: [] },
			artifacts: { session: "session/missing.jsonl", trace: "trace.json", diff: "diff.patch", verifier_result: "verifier/result.json", report: "report.md" }, known_limitations: [],
		});
		json(resolve(runRoot, "trace.json"), { events: [{ sequence: 1, type: "tool_result" }] });
		writeFileSync(resolve(runRoot, "diff.patch"), "diff --git a/src/a.ts b/src/a.ts\n", "utf8");
		json(resolve(runRoot, "verifier/result.json"), { status: taskFailure ? "failed" : "passed", exit_code: taskFailure ? 1 : 0 });
		writeFileSync(resolve(runRoot, "report.md"), "# report\n", "utf8");
	}
	const batchPath = resolve(root, "formal-plan.json");
	const mappingPath = resolve(root, "thin-evaluation-mapping.json");
	const statePath = resolve(root, "analysis-state.json");
	const skillPath = resolve(root, "candidate", "skill", "SKILL.md");
	mkdirSync(resolve(skillPath, ".."), { recursive: true });
	writeFileSync(skillPath, SKILL_SOURCE, "utf8");
	json(resolve(root, "candidate", "build.json"), { status: "built", skill_path: skillPath, skill_sha256: SHA });
	json(batchPath, { evaluation_id: "eval-report", suite: "fixture-suite", execution_head: "d".repeat(40), candidate_build_ref: resolve(root, "candidate", "build.json"), candidate_expected_sha256: SHA, provider: "faux", model: "fixture", planned_runs: plans });
	json(mappingPath, { evaluation_id: "eval-report", run_refs: refs });
	const first = "run-A-no_skill-3";
	const counter = "run-A-no_skill-2";
	const bAndC = runIds.filter((runId) => runId.startsWith("run-B-") || runId.startsWith("run-C-"));
	const repeated = "run-B-no_skill-1";
	const findings = withFindings ? [
		{ id: "FD-1", observation: "observation FD-1", interpretation: "interpretation FD-1", limitation: "limitation FD-1", applicable_runs: [first], repeated_support_run_ids: [], support: [{ artifact: "trace", run_id: first, sequence: 1 }], counter: [], counter_checked: true, status: "kept", sealed: true, claim_scope: "run_observation", agenda_item_id: "AI-1" },
		{ id: "FD-2", observation: "observation FD-2", interpretation: "interpretation FD-2", limitation: "limitation FD-2", applicable_runs: bAndC, repeated_support_run_ids: [repeated], support: [{ artifact: "trace", run_id: repeated, sequence: 1 }], counter: [{ artifact: "trace", run_id: counter, sequence: 1 }], counter_checked: true, status: "kept", sealed: true, claim_scope: "cross_case", agenda_item_id: "AI-2" },
	] : [];
	const agenda = withFindings ? [
		{ id: "AI-1", question: "q", trigger: "t", claim_scope: "run_observation", anchor_run_ids: [first], relevant_case_ids: ["A"], checked_runs: [first], settle_condition: "s", process_investigation_required: false, process_investigation_resolution: null, status: "settled", closure_reason: "done" },
		{ id: "AI-2", question: "q", trigger: "t", claim_scope: "cross_case", anchor_run_ids: ["run-B-no_skill-1", "run-C-no_skill-1"], relevant_case_ids: ["B", "C"], checked_runs: bAndC, settle_condition: "s", process_investigation_required: false, process_investigation_resolution: null, status: "settled", closure_reason: "done" },
	] : [];
	const state: AnalysisState = {
		phase: "human_review_ready", covered_runs: runIds, matrix_triage_complete: true,
		investigation_agenda: agenda as AnalysisState["investigation_agenda"], notes: [], open_questions: [], next_action: "human review", loaded_evidence: [],
		finding_drafts: findings as AnalysisState["finding_drafts"],
		controlled_unblind_result: { alignments: withFindings ? [alignment("FD-1"), alignment("FD-2")] : [], follow_up_observations: [] },
	};
	json(statePath, state);
	return { root, batchPath, mappingPath, statePath };
}

test("Report View forms nine mechanical pairs and preserves Findings and recommendations", async () => {
	const value = fixture();
	try {
		const view = await buildAnalysisReportView(value);
		assert.equal(view.pairs.length, 9);
		assert.deepEqual(view.findings.map((entry) => entry.id), ["FD-1", "FD-2"]);
		assert.deepEqual(view.findings.map((entry) => entry.skillRecommendation), ["NO_CHANGE_JUSTIFIED", "NO_CHANGE_JUSTIFIED"]);
		assert.deepEqual(view.provenance.taskSources, [
			{ caseId: "A", taskRefs: ["task-A"] },
			{ caseId: "B", taskRefs: ["task-B"] },
			{ caseId: "C", taskRefs: ["task-C"] },
		]);
		assert.equal(view.provenance.candidateSkillRelativePath, "skill/SKILL.md");
		assert.equal(view.provenance.formalEvaluationLocalPath, value.root);
		assert.equal(view.findings[0]!.pairEvidence.length, 0);
		assert.equal(view.findings[1]!.pairEvidence.length, 7);
		const repeatedPair = view.findings[1]!.pairEvidence.find((entry) => entry.caseId === "B" && entry.trial === 1)!;
		assert.deepEqual(repeatedPair.noSkillRelation, ["applicable", "support", "repeated_support"]);
		assert.equal(findingContextSubtitle(view, view.findings[0]!), "单次运行观察 · 案例 A · 第 3 轮 · 无 Skill · 任务失败");
		assert.equal(findingContextSubtitle(view, view.findings[1]!), "跨案例观察 · 案例 B / C");
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("zero-Finding State renders without inventing a Finding", async () => {
	const value = fixture(false);
	try {
		const view = await buildAnalysisReportView(value);
		assert.equal(view.findings.length, 0);
		assert.match(renderAnalysisReportMarkdown(view), /本次未形成需要人工审阅的分析发现/);
		assert.doesNotMatch(renderAnalysisReportMarkdown(view), /### FD-/);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("all canonical enums have fixed zh-CN display copy", () => {
	assert.deepEqual(Object.keys(REPORT_ENUM_ZH.contentCorrespondence).sort(), ["CONTRADICTED", "DIRECT", "NONE", "NOT_ASSESSABLE", "PLAUSIBLE"]);
	assert.deepEqual(Object.keys(REPORT_ENUM_ZH.differentiationStatus).sort(), ["INSUFFICIENT", "MIXED", "NO_CLEAR_DIFFERENCE", "REPEATED"]);
	assert.deepEqual(Object.keys(REPORT_ENUM_ZH.benefit).sort(), ["CONTRADICTED", "SUPPORTED", "UNPROVEN"]);
	assert.deepEqual(Object.keys(REPORT_ENUM_ZH.causation).sort(), ["UNPROVEN", "UNSUPPORTED"]);
	assert.deepEqual(Object.keys(REPORT_ENUM_ZH.skillRecommendation).sort(), ["HUMAN_REVIEW_FOR_NARROW_CHANGE", "HUMAN_REVIEW_FOR_REVISION", "NO_CHANGE_JUSTIFIED"]);
	assert.deepEqual(Object.keys(REPORT_ENUM_ZH.evidenceDisposition).sort(), ["CLOSE", "ESCALATE_FOR_SKILL_REVIEW", "RETAIN_OBSERVATION", "SEEK_MORE_EVIDENCE"]);
});

test("report filenames use the deterministic Chinese naming family without a wall-clock date", () => {
	assert.deepEqual(ANALYSIS_REPORT_FILENAMES, {
		markdown: "Skill评测审阅报告.md",
		html: "Skill评测审阅报告.html",
		pdfBrief: "Skill评测审阅简报.pdf",
	});
});

test("system conclusion mechanically counts Finding-level decisions without a whole-Skill enum", async () => {
	const value = fixture();
	try {
		const view = await buildAnalysisReportView(value);
		const conclusion = buildSystemConclusion(view);
		assert.match(conclusion.text, /当前 2 条分析发现均不足以支持修改 Skill/);
		assert.match(conclusion.text, /2 条分析发现的证据处置均为关闭/);
		assert.match(conclusion.text, /未证明 Skill 收益/);
		assert.match(conclusion.text, /不支持建立因果归因/);
		assert.doesNotMatch(conclusion.text, /Overall|总体 Skill|最终 Skill/);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});

test("Markdown and HTML rendering is deterministic, ordered, and HTML-escaped", async () => {
	const value = fixture();
	try {
		const view = await buildAnalysisReportView(value);
		view.findings[0]!.observation = '<tag a="b"> & value';
		const markdown = renderAnalysisReportMarkdown(view);
		const html = renderAnalysisReportHtml(view);
		const brief = renderAnalysisReportBriefHtml(view);
		assert.equal(markdown, renderAnalysisReportMarkdown(view));
		assert.equal(html, renderAnalysisReportHtml(view));
		assert.ok(markdown.indexOf("## 本次系统结论（待人工确认）") < markdown.indexOf("## 1. 评测概览"));
		assert.ok(markdown.indexOf("## 1. 评测概览") < markdown.indexOf("## 2. 结果矩阵"));
		assert.ok(markdown.indexOf("## 5. 人工审阅汇总") < markdown.indexOf("## 6. 附录"));
		for (const expected of ["本次系统结论", "结果矩阵", "分析发现概览", "当前最大可支持结论", "Skill 修改建议", "证据处置", "人工审阅状态"]) assert.match(markdown, new RegExp(expected));
		for (const anchor of ["system-conclusion", "overview", "outcome-matrix", "finding-overview", "finding-fd-1", "finding-fd-2", "human-review-summary", "appendix"]) {
			assert.match(markdown, new RegExp(`<a id="${anchor}"></a>`));
			assert.match(markdown, new RegExp(`\\(#${anchor}\\)`));
			assert.match(html, new RegExp(`(?:id|href)="(?:#)?${anchor}"`));
		}
		assert.match(html, /&lt;tag a=&quot;b&quot;&gt; &amp; value/);
		assert.doesNotMatch(html, /<tag a="b">/);
		for (const full of [markdown, html]) {
			assert.match(full, /测试任务来源/);
			assert.match(full, /Formal Evaluation 位置/);
			assert.match(full, /Candidate Skill 位置/);
			assert.match(full, /task-A/);
			assert.match(full, /skill\/SKILL\.md/);
		}
		assert.doesNotMatch(brief, /测试任务来源|Formal Evaluation 位置|Candidate Skill 位置|task-A|skill\/SKILL\.md/);
		for (const rendered of [markdown, html, brief]) {
			assert.doesNotMatch(rendered, /NO_CHANGE_JUSTIFIED|\bCLOSE\b|\bMIXED\b|\bNONE\b|\bUNPROVEN\b|\bUNSUPPORTED\b|\bPENDING\b/);
		}
		assert.match(brief, /单次运行观察 · 案例 A · 第 3 轮 · 无 Skill · 任务失败/);
		assert.match(brief, /跨案例观察 · 案例 B \/ C/);
	} finally { rmSync(value.root, { recursive: true, force: true }); }
});
