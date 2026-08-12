# SECOND_PROJECT_FINAL_CAPABILITY_GAP_REVIEW — GOAL AMENDMENT

```yaml
amendment_type: narrow_goal_hardening
amends: SECOND_PROJECT_FINAL_CAPABILITY_GAP_REVIEW.md
date: 2026-08-13
decision: RECOMMEND_FINAL_CORE_DEVELOPMENT
implementation_authority: not_granted
```

## 1. Amendment scope

本 Amendment 只收紧原 Review 的三个 Goal，使其可作为后续 Final Capstone Version Charter / Goal Contract 的输入。它不重新 Review，不改变五个 Gap、事实判断或 Development Decision，也不授权实施、真实模型调用或新 Case。

本次修正两处语义：

1. 普通 follow-up Failure 只能触发 `needs_reassessment`，不能自动归因于 active State，也不能自动 rollback；
2. Final Closed-loop Acceptance 只使用一个极窄、预注册、冻结身份的 verifier-backed task，不建设通用 Verified Task 或 Verifier 平台。

**Conflict check:** 未发现这些修正与当前源码或原 Review 的事实冲突。现有 V3 已有 Candidate、Comparator、Promote/Reject、versioned State 和 rollback authority；本 Amendment 只是收紧“何种新证据足以触发何种 State 决策”的后续 Contract 语义。V3.6 free-input Run 仍保持原有 `unverified` 边界。

## 2. Revised Goal 1 — Trusted Evidence Admission

### 目标

让项目自己的可信运行 Evidence 正式进入现有 V3 Improvement 流程：

```text
existing accepted Run / Verifier / Comparison / Recovery artifacts
  -> Host-controlled admission
  -> provenance / lineage / terminal / verifier / State identity validation
  -> FrozenEvidenceV3
  -> existing V3 projector
```

### 收紧后的边界

- 只接纳来源明确、artifact integrity valid、terminal/lineage closed、Verifier/Comparison authority 可验证且具备明确 adaptation eligibility 的证据。
- follow-up evidence 必须记录其实际绑定的 State/version/binding identity；未绑定或身份不完整的证据不得用于 State-attributable regression 判断。
- Host 决定证据是否进入 admission；现有 V3 projector 决定它是否满足既有 trigger。Agent 不拥有 admission、promotion 或 publication authority。
- 普通 V3.6 daily free-input evidence 不因存在 Trace 或 ChangeSet 自动取得 `FrozenEvidenceV3`、formal Outcome 或 adaptation eligibility。

### 完成条件

- 已有 verifier-backed Run、valid Comparison/Recovery 和 bound-State follow-up 三类 accepted artifact 能被确定性映射或 fail closed。
- tamper、missing verifier、unclosed lineage、ambiguous State identity、ineligible Run 均不能进入 Improvement projector。
- 不新增自动 experience mining、failure clustering、Candidate-generation algorithm 或 continual-learning trigger。

## 3. Revised Goal 2 — Regression-Gated State Feedback

### 目标

Candidate 必须通过 applicability-scoped regression gate 才能长期发布；Promoted State 的后续证据只能产生以下三类有界 assessment：

#### `retain`

- follow-up evidence 是 verifier-backed、lineage-closed，并与实际绑定的 current State 身份一致；
- 结果与 current State 的适用范围和既有发布依据相容；
- 该证据可作为 supporting evidence 保留；
- `retain` 不扩大 State applicability，也不证明一般因果收益。

#### `needs_reassessment`

- 出现负面、异常、冲突或效果不明确的 evidence；
- 证据不足以证明 current State 导致 regression；
- active State 保持不变，不自动 rollback，不自动生成或发布 replacement State；
- 该 assessment 只允许相关 evidence 获得人工复核资格，并在满足 Goal 1 admission 与现有 V3 trigger 时，使一个新的 Improvement Candidate 进入审查。

#### `rollback`

- 只允许基于足够强的 **State-attributable regression evidence**；
- 最小可接受形态应是冻结的相同或明确可比较 Regression Case，current State arm FAIL、previous/base State arm PASS，并且 task/input/workspace、Verifier、tool/provider、budget 和 comparison authority 等冻结身份满足现有 comparator/fairness gate；或等价的既有 regression gate 能确定性重算出 current State regression；
- infrastructure、tool/environment、evidence invalidity、普通任务难度或无法归因的 Agent trajectory 不得成为 rollback 依据；
- 即使证据满足 rollback eligibility，State mutation 仍由 Harness/Host 的现有 rollback authority 执行并保留 immutable decision lineage；Agent 不得执行 rollback。

### Replacement / supersede 规则

新 evidence 不得直接 supersede current State。任何 replacement 必须重新走完整发布链：

```text
new admitted evidence
  -> needs_reassessment / new Improvement Candidate
  -> existing V3 Candidate
  -> applicability-scoped Validation / Regression
  -> Promote / Reject
  -> only a promoted version may replace the active pointer
```

不得新增绕过 Candidate/Validation/Promote 的 `supersede` 快捷决策。

### Regression Gate 边界与完成条件

- Candidate 不得只凭触发它的 source Case 获准发布；必须运行一个小型、冻结、按 applicability 选择且有 provenance/version identity 的 regression set。
- Candidate regression failure 必须 Reject；普通 follow-up failure 必须至多进入 `needs_reassessment`，除非满足上述 State-attributable rollback gate。
- Inspector 必须能重算 assessment、comparison identity、active-pointer mutation 与历史 lineage。
- 确定性负向测试至少证明：`ordinary failure != rollback`、`ambiguous attribution != rollback`、`new evidence != direct supersede`。

继续保持：**Agent proposes; Harness disposes.**

## 4. Revised Goal 3 — One Real Closed-loop Product Acceptance

### 目标

只通过一个极窄、预注册、冻结身份的 verifier-backed bounded Coding Task，使下列主闭环第一次在真实 V3.6 产品路径中完整转通：

```text
accepted Evidence
  -> Candidate
  -> applicability-scoped Regression Gate
  -> Promote
  -> V3 State effective binding
  -> one real V3.6 coding Run
  -> independent Verifier / Trace / ChangeSet
  -> new admitted Evidence
  -> State assessment
```

### 验收载体边界

- 恰好使用一个在 Contract 中明确命名的 task、Workspace fixture、task/input digest、independent frozen Verifier、Verifier source digest、command/tool profile、budget profile、applicability 和 adaptation eligibility。
- 该 task 只是 Final Closed-loop Acceptance 的验收载体，不形成可扩展的 Verified Task 产品抽象。
- V3.6 Interactive Product 必须真实消费已晋升 V3 State；binding identity 在 Run start 冻结并进入 Trace/Manifest/Inspector lineage。
- formal Outcome 只来自该 task 的 independent frozen Verifier，不来自 Agent 自述、UI 状态或 ChangeSet 存在性。
- 新 evidence 必须经 Goal 1 admission 后产生 Goal 2 定义的一个合法 assessment。

### 真实验收判定

- 单次真实 Run 产生 `retain` 或 `needs_reassessment` 均可形成有效闭环，前提是结论与 evidence 一致且不夸大。
- 不为获得 `rollback` 展示而制造失败、追加真实 Run、替换 task 或 result hunt。
- rollback attribution/authority 的正确性可由冻结 comparator/regression evidence 与确定性负向测试证明；只有实际出现满足 Goal 2 强门槛的证据时，真实 rollback 才合法。
- ChangeSet 是否 Apply/Discard 继续由 Host 决定；Apply 不得被当作 Verifier PASS 或 State effectiveness 的替代证据。

### 完成与立即停止条件

以下条件同时满足即停止：

1. 一个冻结 task 的单次真实产品闭环完成；
2. accepted prior evidence、Candidate、regression decision、promotion/version、effective binding、Run、Verifier/Trace/ChangeSet、new admission 和 State assessment 具有 Inspector-valid lineage；
3. Goal 2 的 attribution、rollback 和 no-direct-supersede 负向门通过；
4. 不追加第二 task family、不追求统计结论、不扩建平台。

## 5. Cross-goal invariants

- **Agent proposes; Harness disposes.** Agent 只有 bounded proposal authority；admission、validation、promotion、rollback、active-pointer mutation 和 Apply 均属于 Harness/Host authority。
- Evidence、Verifier、comparison、State version、binding 和 decision identity 必须冻结、可追溯、可由 Inspector 重算；不得覆盖历史负面证据。
- `negative evidence` 不等于 `State-attributable regression`；`needs_reassessment` 不得修改 active State。
- 任何 replacement State 都必须重新经过现有 V3 Candidate → Validation/Regression → Promote/Reject Gate。
- applicability 必须来自受信、冻结的 task context，不由 Agent 临时声明或扩大。
- free-input V3.6 Run 默认继续 `unverified`；只有 Contract 明确注册的 acceptance task 取得本 Goal 所需的 formal Outcome/adaptation eligibility。
- 所有路径 fail closed；infrastructure/evidence/user attribution 不得被包装成 Agent failure、State regression 或 rollback 理由。
- Goal 1–3 复用现有 V3/V3.5/V3.6 authority，不创建第二套 State、Verifier、Session、Workspace、Runtime 或 Apply authority。

## 6. Explicit non-goals

本 Amendment 明确不授权或建议：

- generic Verified Task Platform；
- generic Verifier framework 或 Verifier DSL；
- free-input task automatic verification；
- hidden-test generation；
- arbitrary V3.6 task formal Outcome；
- V2 Recovery 自动接入所有 V3.6 free-input tasks；
- automatic experience mining、failure clustering 或 Experience Database；
- 新 Candidate-generation algorithm 或 automatic continual-learning trigger；
- 一次普通 Task FAIL 自动 rollback；
- new evidence 直接 supersede active State；
- 通用 LLM Judge、无限 retry/branch、Multi-Agent、新 Runtime/Agent Loop、自动修改 Harness source、模型训练、Policy DSL、distributed/multi-user platform 或 continual autonomous self-evolution；
- 新 Case、PoC、详细 Implementation Spec 或本次直接实施。

## 7. Development decision

# RECOMMEND_FINAL_CORE_DEVELOPMENT

该建议保持不变。修订后的三个 Goal 仍只完成原项目的最后一层核心闭环连接：可信 Evidence 进入既有 V3 Improvement，长期 State 变更受 regression 和归因门控制，并由一个极窄的真实产品任务证明闭环。它们不扩展为通用 Verification、Recovery 或自主学习平台。

本 Amendment 到此停止，等待 User / Main Session 决定是否进入 Final Capstone Version Charter / Goal Contract。
