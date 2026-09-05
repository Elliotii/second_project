import type {
	AlignmentBenefit,
	AlignmentCausation,
	ClaimScope,
	ContentCorrespondence,
	DifferentiationStatus,
	EvidenceDisposition,
	SkillRecommendation,
} from "./contracts.ts";
import type { AnalysisReportView, ReportEvidenceView, ReportFindingView, ReportPairEvidenceView, ReportRunView } from "./analysis-report-view.ts";

export const REPORT_ENUM_ZH = {
	contentCorrespondence: {
		DIRECT: { short: "直接对应", detail: "存在直接的 Skill 内容依据，与观察到的行为机制明确对应。" },
		PLAUSIBLE: { short: "合理但非直接对应", detail: "存在合理但非直接的 Skill 内容对应。" },
		NONE: { short: "无对应", detail: "未发现 Candidate Skill 内容能够解释该行为。" },
		CONTRADICTED: { short: "存在冲突", detail: "当前行为解释与 Candidate Skill 内容存在冲突。" },
		NOT_ASSESSABLE: { short: "无法评估", detail: "现有证据不足以评估 Skill 内容对应关系。" },
	} satisfies Record<ContentCorrespondence, { short: string; detail: string }>,
	differentiationStatus: {
		REPEATED: { short: "重复出现", detail: "条件差异在当前作用域内重复出现。" },
		MIXED: { short: "存在混合差异", detail: "存在条件差异信号，但方向或构成并不完全一致。" },
		NO_CLEAR_DIFFERENCE: { short: "未形成清晰差异", detail: "当前作用域内未形成清晰的条件差异。" },
		INSUFFICIENT: { short: "证据不足", detail: "现有证据不足以判断条件差异。" },
	} satisfies Record<DifferentiationStatus, { short: string; detail: string }>,
	benefit: {
		SUPPORTED: { short: "已支持", detail: "当前证据支持该差异带来已定义的收益。" },
		UNPROVEN: { short: "未证明", detail: "当前证据尚不足以证明收益。" },
		CONTRADICTED: { short: "与收益假设冲突", detail: "当前证据与收益假设存在冲突。" },
	} satisfies Record<AlignmentBenefit, { short: string; detail: string }>,
	causation: {
		UNPROVEN: { short: "未证明", detail: "当前证据尚不足以证明因果关系。" },
		UNSUPPORTED: { short: "不支持建立因果归因", detail: "当前证据不支持建立因果归因。" },
	} satisfies Record<AlignmentCausation, { short: string; detail: string }>,
	skillRecommendation: {
		NO_CHANGE_JUSTIFIED: { short: "当前证据不足以支持修改 Skill", detail: "当前证据不足以支持修改 Skill。" },
		HUMAN_REVIEW_FOR_NARROW_CHANGE: { short: "建议进入窄范围 Skill 修改人工审阅", detail: "现有证据支持进入窄范围 Skill 修改审阅；是否修改由人工决定。" },
		HUMAN_REVIEW_FOR_REVISION: { short: "建议进入较完整的 Skill 修订人工审阅", detail: "现有证据支持进入较完整的 Skill 修订审阅；是否修订由人工决定。" },
	} satisfies Record<SkillRecommendation, { short: string; detail: string }>,
	evidenceDisposition: {
		CLOSE: { short: "关闭", detail: "该分析发现已得到充分解释，可关闭。" },
		RETAIN_OBSERVATION: { short: "保留观察", detail: "保留该观察，当前不采取进一步行动。" },
		SEEK_MORE_EVIDENCE: { short: "继续取证", detail: "现有证据尚不足，建议在后续独立运行或案例中继续取证。" },
		ESCALATE_FOR_SKILL_REVIEW: { short: "进入人工 Skill 审阅", detail: "现有证据已足以进入人工 Skill 审阅。" },
	} satisfies Record<EvidenceDisposition, { short: string; detail: string }>,
} as const;

const CLAIM_SCOPE_ZH = {
	run_observation: "单次运行观察",
	cell_pattern: "单组模式观察",
	condition_comparison: "条件对照观察",
	cross_case: "跨案例观察",
} satisfies Record<ClaimScope, string>;

const OUTCOME_ZH: Record<string, string> = {
	PASS: "通过",
	TASK_FAILURE: "任务失败",
	INFRA_FAILURE: "基础设施失败",
	INVALID_TRIAL: "无效轮次",
};

const CONDITION_ZH: Record<string, string> = { no_skill: "无 Skill", with_skill: "有 Skill" };
const RELATION_ZH: Record<string, string> = { applicable: "适用", support: "支持", counter: "反证", repeated_support: "重复支持" };
const PHASE_ZH: Record<string, string> = { blind_analysis: "盲态分析", alignment_ready: "待受控揭盲", human_review_ready: "待人工审阅" };
const REVIEW_STATE_ZH = "待审阅";

function mdCell(value: string): string {
	return value.replaceAll("\\", "\\\\").replaceAll("|", "\\|").replaceAll("\r", "").replaceAll("\n", "<br>");
}

function displayOutcome(value: string): string { return OUTCOME_ZH[value] ?? value; }
function displayCondition(value: string): string { return CONDITION_ZH[value] ?? value; }
function displayPhase(value: string): string { return PHASE_ZH[value] ?? value; }
function relationText(values: string[]): string { return values.length > 0 ? values.map((value) => RELATION_ZH[value] ?? value).join("、") : "—"; }
function detail(value: { short: string; detail: string }): string { return `${value.short} — ${value.detail}`; }

function locatorText(evidence: ReportEvidenceView): string {
	return evidence.artifact === "trace"
		? `trace / sequence ${(evidence.locator as Extract<typeof evidence.locator, { artifact: "trace" }>).sequence}`
		: evidence.artifact;
}

function countValues<T extends string>(values: T[]): Map<T, number> {
	const counts = new Map<T, number>();
	for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
	return counts;
}

function countedDisplay<T extends string>(values: T[], labels: Record<T, { short: string }>): string {
	return [...countValues(values)].map(([value, count]) => `${count} 条“${labels[value].short}”`).join("；");
}

export interface SystemConclusionView {
	text: string;
	boundary: string;
}

export function buildSystemConclusion(view: AnalysisReportView): SystemConclusionView {
	const count = view.findings.length;
	if (count === 0) return {
		text: "本次未形成需要人工审阅的分析发现。人工审阅尚未完成。",
		boundary: "本结论不构成对 Skill 有效性、最优性或条件优越性的证明。",
	};
	const recommendations = view.findings.map((finding) => finding.skillRecommendation);
	const dispositions = view.findings.map((finding) => finding.evidenceDisposition);
	const benefits = view.findings.map((finding) => finding.benefit);
	const causations = view.findings.map((finding) => finding.causation);
	const uniform = <T extends string>(values: T[], expected: T): boolean => values.every((value) => value === expected);
	const recommendationText = uniform(recommendations, "NO_CHANGE_JUSTIFIED")
		? `当前 ${count} 条分析发现均不足以支持修改 Skill`
		: `Skill 修改建议：${countedDisplay(recommendations, REPORT_ENUM_ZH.skillRecommendation)}`;
	const dispositionText = uniform(dispositions, "CLOSE")
		? `${count} 条分析发现的证据处置均为关闭`
		: `证据处置：${countedDisplay(dispositions, REPORT_ENUM_ZH.evidenceDisposition)}`;
	const benefitText = uniform(benefits, "UNPROVEN")
		? "当前证据未证明 Skill 收益"
		: `收益判断：${countedDisplay(benefits, REPORT_ENUM_ZH.benefit)}`;
	const causationText = uniform(causations, "UNSUPPORTED")
		? "当前证据不支持建立因果归因"
		: `因果判断：${countedDisplay(causations, REPORT_ENUM_ZH.causation)}`;
	return {
		text: `${recommendationText}；${dispositionText}。${benefitText}，${causationText}。人工审阅尚未完成。`,
		boundary: "这不等于证明 Skill 有效、最优，也不等于证明有 Skill 优于无 Skill。",
	};
}

function findingRuns(view: AnalysisReportView, finding: ReportFindingView): ReportRunView[] {
	const applicable = new Set(finding.applicableRuns);
	return view.runs.filter((run) => applicable.has(run.runId));
}

export function findingContextSubtitle(view: AnalysisReportView, finding: ReportFindingView): string {
	const runs = findingRuns(view, finding);
	if (finding.claimScope === "run_observation" && runs.length === 1) {
		const run = runs[0]!;
		return `${CLAIM_SCOPE_ZH[finding.claimScope]} · 案例 ${run.caseId} · 第 ${run.trial} 轮 · ${displayCondition(run.condition)} · ${displayOutcome(run.outcome)}`;
	}
	const cases = [...new Set(runs.map((run) => run.caseId))].sort();
	return `${CLAIM_SCOPE_ZH[finding.claimScope]}${cases.length > 0 ? ` · 案例 ${cases.join(" / ")}` : ""}`;
}

function mdEvidence(entries: ReportEvidenceView[]): string {
	if (entries.length === 0) return "- 无";
	return [
		"| 运行 ID | 证据类型 | 定位信息 |",
		"| --- | --- | --- |",
		...entries.map((entry) => `| ${mdCell(entry.runId)} | ${entry.artifact} | ${mdCell(locatorText(entry))} |`),
	].join("\n");
}

function mdPairEvidence(rows: ReportPairEvidenceView[]): string {
	if (rows.length === 0) return "";
	return `\n#### 成对对照证据\n\n| 案例 | 轮次 | 无 Skill 运行 / 结果 | 证据关系 | 有 Skill 运行 / 结果 | 证据关系 |\n| --- | ---: | --- | --- | --- | --- |\n${rows.map((row) => `| ${mdCell(row.caseId)} | ${row.trial} | ${mdCell(row.noSkill.runId)} / ${displayOutcome(row.noSkill.outcome)} | ${relationText(row.noSkillRelation)} | ${mdCell(row.withSkill.runId)} / ${displayOutcome(row.withSkill.outcome)} | ${relationText(row.withSkillRelation)} |`).join("\n")}\n`;
}

function mdFinding(view: AnalysisReportView, finding: ReportFindingView): string {
	const skillEvidence = finding.skillEvidence.length === 0
		? "- 无 Skill 证据引用"
		: finding.skillEvidence.map((entry) => `- Candidate \`${entry.candidateSha256}\`，第 ${entry.startLine}-${entry.endLine} 行\n\n\`\`\`text\n${entry.text}\n\`\`\``).join("\n");
	return `<a id="finding-${finding.id.toLowerCase()}"></a>

### ${finding.id}

*${findingContextSubtitle(view, finding)}*

#### 发生了什么

**观察**

${finding.observation}

**解释**

${finding.interpretation}

#### 作用域

- 观察作用域：${CLAIM_SCOPE_ZH[finding.claimScope]}
- 适用运行：${finding.applicableRuns.map((id) => `\`${id}\``).join("、") || "无"}
- 重复支持运行：${finding.repeatedSupportRunIds.map((id) => `\`${id}\``).join("、") || "无"}

#### 条件对照

- 条件差异：${detail(REPORT_ENUM_ZH.differentiationStatus[finding.differentiationStatus])}
- 条件对照：${finding.conditionContrast}
${mdPairEvidence(finding.pairEvidence)}
#### Skill–行为机制核对

- Skill 内容对应：${detail(REPORT_ENUM_ZH.contentCorrespondence[finding.contentCorrespondence])}

${skillEvidence}

#### 支持证据

${mdEvidence(finding.support)}

#### 反证 / 限制性证据

${mdEvidence(finding.counter)}

#### 证据边界

- 收益：${detail(REPORT_ENUM_ZH.benefit[finding.benefit])}
- 因果：${detail(REPORT_ENUM_ZH.causation[finding.causation])}

**当前最大可支持结论**

${finding.maxSupportedClaim}

**反证与结论边界**

${finding.counterAndClaimBoundary}

**局限**

${finding.limitation}

#### 系统建议

- Skill 修改建议：${detail(REPORT_ENUM_ZH.skillRecommendation[finding.skillRecommendation])}
- 证据处置：${detail(REPORT_ENUM_ZH.evidenceDisposition[finding.evidenceDisposition])}

#### 人工审阅

**人工 Skill 决定**

- 系统建议：${REPORT_ENUM_ZH.skillRecommendation[finding.skillRecommendation].short}
- [ ] 接受系统建议
- [ ] 覆盖为：________________

**人工证据处置**

- 系统建议：${REPORT_ENUM_ZH.evidenceDisposition[finding.evidenceDisposition].short}
- [ ] 接受系统建议
- [ ] 覆盖为：________________

**审阅备注**

________________________________

________________________________

- 人工审阅状态：${REVIEW_STATE_ZH}
`;
}

function passFail(counts: Record<string, number>): string {
	const pass = counts.PASS ?? 0;
	const fail = Object.entries(counts).filter(([outcome]) => outcome !== "PASS").reduce((sum, [, count]) => sum + count, 0);
	return `${pass} / ${fail}`;
}

function markdownProvenance(view: AnalysisReportView): string {
	const taskSources = view.provenance.taskSources.map((entry) => `  - 案例 ${mdCell(entry.caseId)}：${entry.taskRefs.map((ref) => `\`${ref}\``).join("、")}`).join("\n");
	return `- 测试任务来源：\n${taskSources}
- Formal Evaluation 位置：${view.provenance.formalEvaluationRelativePath ? `\`${view.provenance.formalEvaluationRelativePath}\`` : "Not available"}
- Formal Evaluation 本机位置：\`${view.provenance.formalEvaluationLocalPath}\`
- Candidate Skill 位置：\`${view.provenance.candidateSkillRelativePath}\`（相对于 Candidate Build）
- Candidate Skill 本机位置：\`${view.provenance.candidateSkillLocalPath}\`
- Candidate Build：\`${view.provenance.candidateBuildRef}\``;
}

export function renderAnalysisReportMarkdown(view: AnalysisReportView): string {
	const conclusion = buildSystemConclusion(view);
	const queue = view.findings.length === 0
		? "当前没有需要人工审阅的分析发现。"
		: `| 分析发现 | 范围 | 条件差异 | Skill 内容对应 | 收益 | 因果 | Skill 修改建议 | 证据处置 |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n${view.findings.map((finding) => `| [${finding.id}](#finding-${finding.id.toLowerCase()}) | ${CLAIM_SCOPE_ZH[finding.claimScope]} | ${REPORT_ENUM_ZH.differentiationStatus[finding.differentiationStatus].short} | ${REPORT_ENUM_ZH.contentCorrespondence[finding.contentCorrespondence].short} | ${REPORT_ENUM_ZH.benefit[finding.benefit].short} | ${REPORT_ENUM_ZH.causation[finding.causation].short} | ${REPORT_ENUM_ZH.skillRecommendation[finding.skillRecommendation].short} | ${REPORT_ENUM_ZH.evidenceDisposition[finding.evidenceDisposition].short} |`).join("\n")}`;
	const findingBlocks = view.findings.length === 0 ? "当前没有需要人工审阅的分析发现。" : view.findings.map((finding) => mdFinding(view, finding)).join("\n\n");
	const evidenceIndex = view.findings.flatMap((finding) => [...finding.support, ...finding.counter].map((entry) => `| ${finding.id} | ${entry.role === "support" ? "支持" : "反证"} | ${mdCell(entry.runId)} | ${entry.artifact} | ${mdCell(locatorText(entry))} |`));
	return `# Skill 评测审阅报告

<a id="system-conclusion"></a>

## 本次系统结论（待人工确认）

> **${conclusion.text}**
>
> **结论边界：**${conclusion.boundary}

<a id="table-of-contents"></a>

## 目录

- [本次系统结论](#system-conclusion)
- [评测概览](#overview)
- [结果矩阵](#outcome-matrix)
- [分析发现概览](#finding-overview)
${view.findings.map((finding) => `- [${finding.id}](#finding-${finding.id.toLowerCase()})`).join("\n")}
- [人工审阅汇总](#human-review-summary)
- [附录](#appendix)

<a id="overview"></a>

## 1. 评测概览

| 字段 | 值 |
| --- | --- |
| 评测 ID | ${mdCell(view.evaluation.evaluationId)} |
| 评测集 | ${mdCell(view.evaluation.suite)} |
| Candidate SHA | \`${view.evaluation.candidateSha256}\` |
| 服务商 / 模型 | ${mdCell(view.evaluation.provider)} / ${mdCell(view.evaluation.model)} |
| 运行数 | ${view.evaluation.runCount} |
| 对照组数 | ${view.evaluation.pairCount} |
| 无 Skill：通过 / 非通过 | ${passFail(view.evaluation.outcomeCounts.no_skill)} |
| 有 Skill：通过 / 非通过 | ${passFail(view.evaluation.outcomeCounts.with_skill)} |
| 分析发现数 | ${view.findings.length} |
| 分析状态 | ${displayPhase(view.evaluation.analysisPhase)} |
| 人工审阅 | ${REVIEW_STATE_ZH} |

<a id="outcome-matrix"></a>

## 2. 结果矩阵

| 案例 | 轮次 | 无 Skill | 有 Skill |
| --- | ---: | --- | --- |
${view.pairs.map((pair) => `| ${mdCell(pair.caseId)} | ${pair.trial} | ${displayOutcome(pair.noSkill.outcome)} (\`${pair.noSkill.runId}\`) | ${displayOutcome(pair.withSkill.outcome)} (\`${pair.withSkill.runId}\`) |`).join("\n")}

**说明：结果差异本身不等价于 Skill 收益或因果效应。**

<a id="finding-overview"></a>

## 3. 分析发现概览

${queue}

<a id="finding-details"></a>

## 4. 分析发现详情

${findingBlocks}

<a id="human-review-summary"></a>

## 5. 人工审阅汇总

${view.findings.length === 0 ? "当前没有待审阅的分析发现。" : `| 分析发现 | 系统 Skill 建议 | 人工 Skill 决定 | 系统证据处置 | 人工证据处置 | 审阅状态 |\n| --- | --- | --- | --- | --- | --- |\n${view.findings.map((finding) => `| ${finding.id} | ${REPORT_ENUM_ZH.skillRecommendation[finding.skillRecommendation].short} | ${REVIEW_STATE_ZH} | ${REPORT_ENUM_ZH.evidenceDisposition[finding.evidenceDisposition].short} | ${REVIEW_STATE_ZH} | ${REVIEW_STATE_ZH} |`).join("\n")}`}

本报告是一次性人工审阅工作表。重新生成报告可能覆盖手工编辑；当前没有人工决定写回或持久化合同。

<a id="appendix"></a>

## 6. 附录

### 附录 A — 评测来源

- 评测 ID：${view.evaluation.evaluationId}
${markdownProvenance(view)}
- Candidate SHA：\`${view.evaluation.candidateSha256}\`
- 服务商 / 模型：${view.evaluation.provider} / ${view.evaluation.model}
- 分析状态：${displayPhase(view.evaluation.analysisPhase)}
- Formal 执行 Git HEAD：\`${view.evaluation.executionHead}\`
- Analysis State SHA256：\`${view.evaluation.analysisStateSha256}\`

### 附录 B — 完整运行索引

| 案例 | 轮次 | 条件 | 运行 ID | 结果 |
| --- | ---: | --- | --- | --- |
${view.runs.map((run) => `| ${mdCell(run.caseId)} | ${run.trial} | ${displayCondition(run.condition)} | ${mdCell(run.runId)} | ${displayOutcome(run.outcome)} |`).join("\n")}

### 附录 C — 证据索引

${evidenceIndex.length === 0 ? "当前没有分析发现的证据定位信息。" : `| 分析发现 | 证据角色 | 运行 ID | 证据类型 | 定位信息 |\n| --- | --- | --- | --- | --- |\n${evidenceIndex.join("\n")}`}
`;
}

export function escapeHtml(value: string): string {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

const h = escapeHtml;
function htmlDetail(value: { short: string; detail: string }): string { return `<strong>${h(value.short)}</strong><span class="enum-help">${h(value.detail)}</span>`; }
function htmlEvidence(entries: ReportEvidenceView[]): string {
	if (entries.length === 0) return "<p>无</p>";
	return `<table><thead><tr><th>运行 ID</th><th>证据类型</th><th>定位信息</th></tr></thead><tbody>${entries.map((entry) => `<tr><td><code>${h(entry.runId)}</code></td><td>${h(entry.artifact)}</td><td>${h(locatorText(entry))}</td></tr>`).join("")}</tbody></table>`;
}
function htmlPairEvidence(rows: ReportPairEvidenceView[]): string {
	if (rows.length === 0) return "";
	return `<h4>成对对照证据</h4><table><thead><tr><th>案例</th><th>轮次</th><th>无 Skill 运行 / 结果</th><th>证据关系</th><th>有 Skill 运行 / 结果</th><th>证据关系</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${h(row.caseId)}</td><td>${row.trial}</td><td><code>${h(row.noSkill.runId)}</code><br>${h(displayOutcome(row.noSkill.outcome))}</td><td>${h(relationText(row.noSkillRelation))}</td><td><code>${h(row.withSkill.runId)}</code><br>${h(displayOutcome(row.withSkill.outcome))}</td><td>${h(relationText(row.withSkillRelation))}</td></tr>`).join("")}</tbody></table>`;
}
function htmlFinding(view: AnalysisReportView, finding: ReportFindingView): string {
	const refs = finding.skillEvidence.length === 0 ? "<p>无 Skill 证据引用</p>" : finding.skillEvidence.map((entry) => `<p>Candidate <code>${h(entry.candidateSha256)}</code>，第 ${entry.startLine}-${entry.endLine} 行</p><pre>${h(entry.text)}</pre>`).join("");
	return `<article id="finding-${h(finding.id.toLowerCase())}"><h3>${h(finding.id)}</h3><p class="context">${h(findingContextSubtitle(view, finding))}</p><h4>发生了什么</h4><h5>观察</h5><p>${h(finding.observation)}</p><h5>解释</h5><p>${h(finding.interpretation)}</p><h4>作用域</h4><ul><li>观察作用域：${h(CLAIM_SCOPE_ZH[finding.claimScope])}</li><li>适用运行：${finding.applicableRuns.map((id) => `<code>${h(id)}</code>`).join("、") || "无"}</li><li>重复支持运行：${finding.repeatedSupportRunIds.map((id) => `<code>${h(id)}</code>`).join("、") || "无"}</li></ul><h4>条件对照</h4><p>条件差异：${htmlDetail(REPORT_ENUM_ZH.differentiationStatus[finding.differentiationStatus])}</p><p>条件对照：${h(finding.conditionContrast)}</p>${htmlPairEvidence(finding.pairEvidence)}<h4>Skill–行为机制核对</h4><p>Skill 内容对应：${htmlDetail(REPORT_ENUM_ZH.contentCorrespondence[finding.contentCorrespondence])}</p>${refs}<h4>支持证据</h4>${htmlEvidence(finding.support)}<h4>反证 / 限制性证据</h4>${htmlEvidence(finding.counter)}<h4>证据边界</h4><p>收益：${htmlDetail(REPORT_ENUM_ZH.benefit[finding.benefit])}</p><p>因果：${htmlDetail(REPORT_ENUM_ZH.causation[finding.causation])}</p><h5>当前最大可支持结论</h5><p>${h(finding.maxSupportedClaim)}</p><h5>反证与结论边界</h5><p>${h(finding.counterAndClaimBoundary)}</p><h5>局限</h5><p>${h(finding.limitation)}</p><h4>系统建议</h4><p>Skill 修改建议：${htmlDetail(REPORT_ENUM_ZH.skillRecommendation[finding.skillRecommendation])}</p><p>证据处置：${htmlDetail(REPORT_ENUM_ZH.evidenceDisposition[finding.evidenceDisposition])}</p><h4>人工审阅</h4><div class="worksheet"><p><strong>人工 Skill 决定</strong><br>系统建议：${h(REPORT_ENUM_ZH.skillRecommendation[finding.skillRecommendation].short)}<br>☐ 接受系统建议　☐ 覆盖为：________________</p><p><strong>人工证据处置</strong><br>系统建议：${h(REPORT_ENUM_ZH.evidenceDisposition[finding.evidenceDisposition].short)}<br>☐ 接受系统建议　☐ 覆盖为：________________</p><p><strong>审阅备注</strong><br>________________________________<br>________________________________</p><p>人工审阅状态：${REVIEW_STATE_ZH}</p></div></article>`;
}

const FULL_CSS = `:root{font-family:Inter,"Microsoft YaHei",Arial,sans-serif;color:#172033;background:#eef2f7}body{margin:0}.page{max-width:1180px;margin:auto;background:white;padding:32px 48px;box-shadow:0 2px 20px #ccd3df}h1,h2,h3{color:#11264b}h2{margin-top:38px;border-bottom:2px solid #dce5f2;padding-bottom:8px}h4{margin-top:26px;color:#23456e}p,li{line-height:1.6}nav{position:sticky;top:0;background:#f7f9fc;border:1px solid #d6dfeb;padding:10px 14px;z-index:1}nav a{display:inline-block;margin:3px 14px 3px 0;color:#24578f}.conclusion{border:2px solid #5078a8;background:#eef5fc;padding:14px 18px;margin:18px 0}.boundary{font-size:.92em;color:#45566b}.context{font-weight:600;color:#45617f;background:#f4f7fb;padding:7px 10px}table{width:100%;border-collapse:collapse;margin:12px 0 20px;font-size:13px}th,td{border:1px solid #cbd5e1;padding:7px;vertical-align:top}th{background:#edf3fa;text-align:left}code{font-family:Consolas,monospace;font-size:.92em;overflow-wrap:anywhere}.enum-help{display:block;color:#526173;margin-top:3px}.notice,.worksheet{border-left:4px solid #5078a8;background:#f4f7fb;padding:10px 14px}.worksheet{border-color:#98a6b8}article{padding-top:8px}@media print{body{background:white}.page{box-shadow:none;max-width:none;padding:10mm}nav{position:static}}`;

export function renderAnalysisReportHtml(view: AnalysisReportView): string {
	const conclusion = buildSystemConclusion(view);
	const navFindings = view.findings.map((finding) => `<a href="#finding-${h(finding.id.toLowerCase())}">${h(finding.id)}</a>`).join("");
	const queueRows = view.findings.map((finding) => `<tr><td><a href="#finding-${h(finding.id.toLowerCase())}">${h(finding.id)}</a></td><td>${h(CLAIM_SCOPE_ZH[finding.claimScope])}</td><td>${h(REPORT_ENUM_ZH.differentiationStatus[finding.differentiationStatus].short)}</td><td>${h(REPORT_ENUM_ZH.contentCorrespondence[finding.contentCorrespondence].short)}</td><td>${h(REPORT_ENUM_ZH.benefit[finding.benefit].short)}</td><td>${h(REPORT_ENUM_ZH.causation[finding.causation].short)}</td><td>${h(REPORT_ENUM_ZH.skillRecommendation[finding.skillRecommendation].short)}</td><td>${h(REPORT_ENUM_ZH.evidenceDisposition[finding.evidenceDisposition].short)}</td></tr>`).join("");
	const evidenceRows = view.findings.flatMap((finding) => [...finding.support, ...finding.counter].map((entry) => `<tr><td>${h(finding.id)}</td><td>${entry.role === "support" ? "支持" : "反证"}</td><td><code>${h(entry.runId)}</code></td><td>${h(entry.artifact)}</td><td>${h(locatorText(entry))}</td></tr>`)).join("");
	const taskSources = view.provenance.taskSources.map((entry) => `<li>案例 ${h(entry.caseId)}：${entry.taskRefs.map((ref) => `<code>${h(ref)}</code>`).join("、")}</li>`).join("");
	const provenance = `<li>测试任务来源：<ul>${taskSources}</ul></li><li>Formal Evaluation 位置：${view.provenance.formalEvaluationRelativePath ? `<code>${h(view.provenance.formalEvaluationRelativePath)}</code>` : "Not available"}</li><li>Formal Evaluation 本机位置：<code>${h(view.provenance.formalEvaluationLocalPath)}</code></li><li>Candidate Skill 位置：<code>${h(view.provenance.candidateSkillRelativePath)}</code>（相对于 Candidate Build）</li><li>Candidate Skill 本机位置：<code>${h(view.provenance.candidateSkillLocalPath)}</code></li><li>Candidate Build：<code>${h(view.provenance.candidateBuildRef)}</code></li>`;
	return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Skill 评测审阅报告</title><style>${FULL_CSS}</style></head><body><main class="page"><h1>Skill 评测审阅报告</h1><section id="system-conclusion" class="conclusion"><h2>本次系统结论（待人工确认）</h2><p><strong>${h(conclusion.text)}</strong></p><p class="boundary"><strong>结论边界：</strong>${h(conclusion.boundary)}</p></section><nav aria-label="报告目录"><strong>目录：</strong><a href="#system-conclusion">本次系统结论</a><a href="#overview">评测概览</a><a href="#outcome-matrix">结果矩阵</a><a href="#finding-overview">分析发现概览</a>${navFindings}<a href="#human-review-summary">人工审阅汇总</a><a href="#appendix">附录</a></nav><section id="overview"><h2>1. 评测概览</h2><table><tbody><tr><th>评测 ID</th><td>${h(view.evaluation.evaluationId)}</td></tr><tr><th>评测集</th><td>${h(view.evaluation.suite)}</td></tr><tr><th>Candidate SHA</th><td><code>${h(view.evaluation.candidateSha256)}</code></td></tr><tr><th>服务商 / 模型</th><td>${h(view.evaluation.provider)} / ${h(view.evaluation.model)}</td></tr><tr><th>运行数</th><td>${view.evaluation.runCount}</td></tr><tr><th>对照组数</th><td>${view.evaluation.pairCount}</td></tr><tr><th>无 Skill：通过 / 非通过</th><td>${passFail(view.evaluation.outcomeCounts.no_skill)}</td></tr><tr><th>有 Skill：通过 / 非通过</th><td>${passFail(view.evaluation.outcomeCounts.with_skill)}</td></tr><tr><th>分析发现数</th><td>${view.findings.length}</td></tr><tr><th>分析状态</th><td>${h(displayPhase(view.evaluation.analysisPhase))}</td></tr><tr><th>人工审阅</th><td>${REVIEW_STATE_ZH}</td></tr></tbody></table></section><section id="outcome-matrix"><h2>2. 结果矩阵</h2><table><thead><tr><th>案例</th><th>轮次</th><th>无 Skill</th><th>有 Skill</th></tr></thead><tbody>${view.pairs.map((pair) => `<tr><td>${h(pair.caseId)}</td><td>${pair.trial}</td><td>${h(displayOutcome(pair.noSkill.outcome))}<br><code>${h(pair.noSkill.runId)}</code></td><td>${h(displayOutcome(pair.withSkill.outcome))}<br><code>${h(pair.withSkill.runId)}</code></td></tr>`).join("")}</tbody></table><p class="notice"><strong>说明：结果差异本身不等价于 Skill 收益或因果效应。</strong></p></section><section id="finding-overview"><h2>3. 分析发现概览</h2>${view.findings.length === 0 ? "<p>当前没有需要人工审阅的分析发现。</p>" : `<table><thead><tr><th>分析发现</th><th>范围</th><th>条件差异</th><th>Skill 内容对应</th><th>收益</th><th>因果</th><th>Skill 修改建议</th><th>证据处置</th></tr></thead><tbody>${queueRows}</tbody></table>`}</section><section id="finding-details"><h2>4. 分析发现详情</h2>${view.findings.length === 0 ? "<p>当前没有需要人工审阅的分析发现。</p>" : view.findings.map((finding) => htmlFinding(view, finding)).join("")}</section><section id="human-review-summary"><h2>5. 人工审阅汇总</h2>${view.findings.length === 0 ? "<p>当前没有待审阅的分析发现。</p>" : `<table><thead><tr><th>分析发现</th><th>系统 Skill 建议</th><th>人工 Skill 决定</th><th>系统证据处置</th><th>人工证据处置</th><th>审阅状态</th></tr></thead><tbody>${view.findings.map((finding) => `<tr><td>${h(finding.id)}</td><td>${h(REPORT_ENUM_ZH.skillRecommendation[finding.skillRecommendation].short)}</td><td>${REVIEW_STATE_ZH}</td><td>${h(REPORT_ENUM_ZH.evidenceDisposition[finding.evidenceDisposition].short)}</td><td>${REVIEW_STATE_ZH}</td><td>${REVIEW_STATE_ZH}</td></tr>`).join("")}</tbody></table>`}<p>本报告是一次性人工审阅工作表。重新生成报告可能覆盖手工编辑；当前没有人工决定写回或持久化合同。</p></section><section id="appendix"><h2>6. 附录</h2><h3>附录 A — 评测来源</h3><ul><li>评测 ID：${h(view.evaluation.evaluationId)}</li>${provenance}<li>Candidate SHA：<code>${h(view.evaluation.candidateSha256)}</code></li><li>服务商 / 模型：${h(view.evaluation.provider)} / ${h(view.evaluation.model)}</li><li>分析状态：${h(displayPhase(view.evaluation.analysisPhase))}</li><li>Formal 执行 Git HEAD：<code>${h(view.evaluation.executionHead)}</code></li><li>Analysis State SHA256：<code>${h(view.evaluation.analysisStateSha256)}</code></li></ul><h3>附录 B — 完整运行索引</h3><table><thead><tr><th>案例</th><th>轮次</th><th>条件</th><th>运行 ID</th><th>结果</th></tr></thead><tbody>${view.runs.map((run) => `<tr><td>${h(run.caseId)}</td><td>${run.trial}</td><td>${h(displayCondition(run.condition))}</td><td><code>${h(run.runId)}</code></td><td>${h(displayOutcome(run.outcome))}</td></tr>`).join("")}</tbody></table><h3>附录 C — 证据索引</h3>${evidenceRows.length === 0 ? "<p>当前没有分析发现的证据定位信息。</p>" : `<table><thead><tr><th>分析发现</th><th>证据角色</th><th>运行 ID</th><th>证据类型</th><th>定位信息</th></tr></thead><tbody>${evidenceRows}</tbody></table>`}</section></main></body></html>`;
}

const BRIEF_CSS = `@page{size:A4;margin:7mm}*{box-sizing:border-box}body{font-family:"Microsoft YaHei",Arial,sans-serif;color:#172033;margin:0;font-size:7.8pt}h1{font-size:16pt;margin:0 0 4px;color:#11264b}.conclusion{border:2px solid #5078a8;background:#eef5fc;padding:6px 9px;margin:4px 0}.conclusion h2{font-size:10.5pt;margin:0 0 2px}.conclusion p{margin:2px 0}.boundary{color:#45566b;font-size:7.2pt}.meta{display:grid;grid-template-columns:1.3fr .8fr 1fr;gap:3px;margin-top:4px}.card{border:1px solid #ccd6e3;border-radius:3px;padding:3px 5px}h2{font-size:10pt;margin:5px 0 2px;color:#23456e}.matrix{width:100%;border-collapse:collapse}.matrix th,.matrix td{border:1px solid #d4dbe5;padding:1.5px 4px;text-align:center}.findings{display:grid;grid-template-columns:1fr 1fr;gap:4px}.finding{border:1px solid #9fb1c8;border-left:4px solid #456f9d;padding:4px 6px}.finding h3{margin:0;font-size:10pt}.context{font-weight:600;color:#45617f}.finding p{margin:2px 0;line-height:1.2}.label{color:#586779}.decision{background:#f2f6fa;padding:3px 4px}.claim{font-size:7.2pt}.review{margin-top:4px;background:#e9f0f7;padding:4px 7px;font-weight:bold}.provenance{font-size:6.5pt;color:#637083;margin-top:4px;overflow-wrap:anywhere}code{font:7pt Consolas,monospace}.notice{font-weight:bold;margin:2px 0}`;

export function renderAnalysisReportBriefHtml(view: AnalysisReportView): string {
	const conclusion = buildSystemConclusion(view);
	return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>Skill 评测审阅简报</title><style>${BRIEF_CSS}</style></head><body><h1>Skill 评测审阅简报</h1><section class="conclusion"><h2>本次系统结论（待人工确认）</h2><p><strong>${h(conclusion.text)}</strong></p><p class="boundary"><strong>结论边界：</strong>${h(conclusion.boundary)}</p></section><div class="meta"><div class="card"><span class="label">评测 ID</span><br>${h(view.evaluation.evaluationId)}</div><div class="card"><span class="label">评测规模</span><br>${view.evaluation.runCount} 次运行 / ${view.evaluation.pairCount} 组对照</div><div class="card"><span class="label">服务商 / 模型</span><br>${h(view.evaluation.provider)} / ${h(view.evaluation.model)}</div></div><h2>结果矩阵</h2><table class="matrix"><thead><tr><th>案例</th><th>轮次</th><th>无 Skill</th><th>有 Skill</th></tr></thead><tbody>${view.pairs.map((pair) => `<tr><td>${h(pair.caseId)}</td><td>${pair.trial}</td><td>${h(displayOutcome(pair.noSkill.outcome))}</td><td>${h(displayOutcome(pair.withSkill.outcome))}</td></tr>`).join("")}</tbody></table><p class="notice">说明：结果差异本身不等价于 Skill 收益或因果效应。</p><h2>分析发现</h2>${view.findings.length === 0 ? "<p>本次未形成需要人工审阅的分析发现。</p>" : `<div class="findings">${view.findings.map((finding) => `<section class="finding"><h3>${h(finding.id)}</h3><p class="context">${h(findingContextSubtitle(view, finding))}</p><p>条件差异：<strong>${h(REPORT_ENUM_ZH.differentiationStatus[finding.differentiationStatus].short)}</strong><br>Skill 内容对应：<strong>${h(REPORT_ENUM_ZH.contentCorrespondence[finding.contentCorrespondence].short)}</strong><br>收益：<strong>${h(REPORT_ENUM_ZH.benefit[finding.benefit].short)}</strong><br>因果：<strong>${h(REPORT_ENUM_ZH.causation[finding.causation].short)}</strong></p><p class="decision"><span class="label">Skill 修改建议</span><br><strong>${h(REPORT_ENUM_ZH.skillRecommendation[finding.skillRecommendation].short)}</strong></p><p class="decision"><span class="label">证据处置</span><br><strong>${h(REPORT_ENUM_ZH.evidenceDisposition[finding.evidenceDisposition].short)}</strong></p><p class="claim"><span class="label">当前最大可支持结论</span><br>${h(finding.maxSupportedClaim)}</p></section>`).join("")}</div>`}<div class="review">人工审阅状态：${REVIEW_STATE_ZH}</div><div class="provenance">Candidate SHA：${h(view.evaluation.candidateSha256)}</div></body></html>`;
}
