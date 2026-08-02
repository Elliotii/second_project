# V1 Skill Primary-Source Mapping — Main Session Review

```yaml
status: main_session_review_complete
date: 2026-07-31
reviewed_report: docs/reports/V1_SKILL_PRIMARY_SOURCE_MAPPING.md
source_package: reference/papers/v1-skill-primary-source/skillos-2605.06614/
main_disposition: ACCEPT_PRIMARY_SOURCE_GATE_WITH_BINDING_INTERPRETIVE_CORRECTION
primary_source_gate: satisfied
additional_primary_source_required: false
V1_charter_creation_authorized_by_this_review: false
V1_contract_created: false
implementation_authorized: false
real_Workbench_model_calls_authorized: 0
git_commit_authorized: false
```

## 1. Decision

**Decision.** 接受 `SkillOS: Learning Skill Curation for Self-Evolving
Agents`（arXiv:2605.06614v1）作为 V1 的单一 primary-source 输入，处置为：

```text
ACCEPT_PRIMARY_SOURCE_GATE_WITH_BINDING_INTERPRETIVE_CORRECTION
```

一篇来源已经能够区分 Skill content、selection、invocation/execution、
evaluation 和 lifecycle；不需要为了增加文献数量而使用第二份来源。

该处置只关闭已接受 Reference Acquisition Plan 中的 V1 Skill primary-source
Gate，不接受 V1 Charter、Contract、Goal Activation、实施或真实调用。

## 2. File and authority audit

**Fact.** 专用 Session只创建：

```text
reference/papers/v1-skill-primary-source/skillos-2605.06614/source.pdf
reference/papers/v1-skill-primary-source/skillos-2605.06614/SOURCE.yaml
reference/papers/v1-skill-primary-source/skillos-2605.06614/PROJECT_MAPPING.md
docs/reports/V1_SKILL_PRIMARY_SOURCE_MAPPING.md
```

没有修改 Main Session既有文件、Workbench、Pi、`.runs/`、`CURRENT_STATE.md`
或其他用户 reference 资料；没有 clone、stage 或 commit。

**Fact.** 根仓库保持
`62a2c962e896d3f406dec43d260daeaa6904da0c`，固定 Pi 保持
`027a5847901b5dde30270abaa1041046cd2b4b55` 且 clean。

## 3. Canonical identity and integrity audit

Main Session通过 arXiv canonical record、arXiv Atom API、PDF HTTP headers、
本地 PDF metadata/hash 和页面渲染交叉核验：

```yaml
title: SkillOS: Learning Skill Curation for Self-Evolving Agents
identifier: arXiv:2605.06614v1
submitted: 2026-05-07T17:31:50Z
authors: 16
comments: 11 pages, 6 figures, 3 tables
localized_PDF_pages_with_appendices: 33
remote_content_type: application/pdf
remote_content_length: 7031485
local_bytes: 7031485
local_sha256: e55b880b9564c63f5f791c02f423d41bd356eecc07002f85c6babfce72ee39c6
encrypted: false
```

arXiv abstract page明确链接 arXiv perpetual non-exclusive distribution
license；`SOURCE.yaml` 正确地只记录 access/distribution note，没有推断代码、
数据或 derivative-work 的 permissive license。

## 4. Evidence audit

主 Session检查了 title page、Figure 1/2、Equation 1、Tables 1/2、Figure 6、
executor/content-judge/correctness-judge prompts、Table 4、dataset/evaluation
appendix 和 Appendix D limitation pages。

以下报告结论由原文支持：

- SkillOS 使用单 Markdown file、YAML name/description 与 instructions body；
- BM25 selection 与 frozen executor 分离；
- retrieved Skill bodies 进入 executor prompt；
- curator 对 SkillRepo 做 insert/update/delete；
- reward 同时包含 downstream task outcome、valid function calls、external LLM
  content-quality judge 和 compression；
- final evaluation 使用 held-out environment/ground-truth outcomes，所有配置在
  相同 executor、retrieval、step 和 decoding 条件下运行，并报告三 seeds；
- Appendix D 明确 flat Markdown、BM25 和 frozen executor 是研究简化/限制；
- 论文没有证明 Pi 行为、coding-task Skill 效果或 Runtime Control 增量。

## 5. Binding interpretive correction

V1 文档必须使用三类互不混淆的证据名称：

```text
training_signal
  paper: downstream reward / valid calls / compression

diagnostic_judge
  paper: executor-backed correctness judge or external content-quality LLM

formal_external_outcome
  project: environment-level deterministic Measurement Verifier
```

**Binding correction.** SkillOS 的 acting-executor self-judge 不是独立评价；
external content-quality LLM 虽是不同模型，也只是对 Skill utility 的 proxy。V1
唯一正式 Outcome 仍是 A/B/C 共用、位于 Agent 写权限之外的环境级 Measurement
Verifier。

不得把论文的 composite training reward、content judge 或 self-judgment 搬进
V1 Outcome，也不得因此增加 LLM Judge。

## 6. Project transfer decision

### Adopt for V1

- Skill content、selection、execution、evaluation 分层；
- frozen executor/common environment 的公平对照；
- selected content 必须可证明进入实际 execution；
- frozen task membership 和 common evaluator；
- downstream environment outcome 强于 model self-claim；
- 把 Skill wrapper/body/token overhead 作为完整 treatment 成本记录。

### Reject for V1

- BM25/dense/learned retrieval；
- RL curator；
- automatic insert/update/delete；
- grouped streaming training；
- Skill self-evaluation 或 LLM Judge 作为 Outcome；
- multi-file/executable/hierarchical Skill；
- paper prompt copying、Skill marketplace 或 registry。

### Defer

- V3：Experience → candidate Skill/policy → related-task regression；
- V4：selection/routing、promotion、retirement 和 rollback。

## 7. Effect on prior Main-Session corrections

Primary evidence不改变以下已绑定结论：

- Pi loader diagnostics 由 host fail closed；
- Windows Skill path/wrapper 需要 deterministic Gate；
- B/C initial 公平性由 payload identity 证明，而非要求 Outcome 相等；
- experiment membership 必须非空并由 manifest cross-check；
- tracked provider composition 必须在 V1-B freeze 前完成；
- treatment-caused invalids 不能从 guardrail/denominator 中消失；
- V1-B Contract 等 V1-A 接受后再正式起草；
- Pilot scale、budget、Failure Taxonomy 和 promotion threshold 仍由用户冻结。

## 8. Gate closeout

```yaml
primary_source_gate: satisfied
source_selected: SkillOS_arXiv_2605_06614v1
source_count: 1
second_source_required: false
binding_addition:
  - separate_training_signal_diagnostic_judge_and_formal_external_outcome
Pi_route_changed: false
V1_strategy_route_changed: false
recommended_next_action:
  - main_session_drafts_V1_VERSION_CHARTER_DRAFT
  - user_reviews_and_freezes_V1_scope
  - only_then_draft_V1_A_GOAL_CONTRACT
```
