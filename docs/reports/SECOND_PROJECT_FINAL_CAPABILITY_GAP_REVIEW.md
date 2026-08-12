# SECOND_PROJECT_FINAL_CAPABILITY_GAP_REVIEW

```yaml
review_type: read_only_final_capability_gap_review
review_date: 2026-08-13
review_baseline_commit: 257a5f504e7d634d0133211f6be3a1963bdcebff
review_baseline_tree: db473471d09442d90d0367a2ca0554dbc191761d
project_state: V3_6_CLOSED_ACCEPTED
active_goal: null
decision: RECOMMEND_FINAL_CORE_DEVELOPMENT
```

## Executive conclusion

**Fact.** 第二项目已经分别拥有可用或受控成立的执行、Trace/Evidence、Verifier、two-path Recovery、Harness Adaptation、持久化/检查和 Interactive Coding 能力；它们不是空白设计。

**Judgment.** 它们目前还不是一个能持续运转的完整 Harness 主闭环。现有最完整的纵向链是 V3 的受控链：冻结的 V2 failure evidence → Candidate → 确定性验证/晋升 → 选择性绑定 → 一次真实后续 Run。日常 V3.6 Interactive Product 没有正式消费 V3 active State 的绑定实现；它的新 Run 又被 authority 明确标记为 `unverified`、`comparison_eligible: false`、`adaptation_eligible: false`、`promotion_eligible: false`，因此不能自然回流到 V3 Improvement。

**Recommendation.** 值得补的最后一层核心能力是一个**有界、Host-controlled 的 Evidence-to-State feedback closure**：只接纳已有可信 Verifier/Comparison 支撑的运行证据，复用 V3 Candidate/Validation/State/Binding，要求 promoted State 经适用范围内的后续受控评价，并把新证据用于 `retain / rollback / supersede` 决策。它不是通用自进化平台，也不要求把 V2 Recovery 自动接入所有 V3.6 free-input task。

---

## A. Current Capability Map

| 能力 | 当前状态 | 事实边界 |
|---|---|---|
| 可靠的有界 Interactive Coding 执行 | `DIRECTLY_USABLE` | V3.6 已有 persistent Session、managed Workspace、registered Docker command、budget/terminal、ChangeSet、Host Apply/Discard/Export；正式 two-Turn product Journey 与后续 terminalization maintenance 已接受。 |
| Trace / immutable Evidence / Inspector | `DIRECTLY_USABLE` | 多版本均有 write-once evidence、lineage、digest 和 fail-closed Inspector；V3.5/V3.6 提供安全 read projection。可检查不等于证据自动具备 Improvement 资格。 |
| 外部 Verification / formal Outcome | `EXPERIMENT_BOUND` | 对冻结、注册、可验证任务成立；V3.6 日常 free-input Run 的 formal Outcome 仍为 `null/unverified`。 |
| V2 two-path Recovery / Candidate selection | `EXPERIMENT_BOUND` | controlled verifier-failed Seed 上真实 A/B 均执行并验证；不是 natural initial failure，也未成为 V3.6 通用运行路径。 |
| Evidence → typed Improvement/Candidate | `IMPLEMENTED_BUT_NOT_CONNECTED` | V3 投影器和 Host proposal validator 已实现；正式演示输入是受控 V2 evidence，缺少从现行产品 Run artifact 到 `FrozenEvidenceV3` 的一般受信准入连接。 |
| Base/Candidate Validation、Promote/Reject、version、Rollback | `EXPERIMENT_BOUND` | 决策、完整性、公平性和回滚机制成立；现有验证是小型 frozen fixture/mechanism evidence，不是长期 State 更新所需的已维护产品回归门。 |
| Promoted State 的 selective binding | `EXPERIMENT_BOUND` | V3 独立 Run 路径完成四个确定性 Case 和一次真实 prompt-addendum bound Run；V3.6 日常入口只读取 State digest/声明式 adaptation descriptor，没有调用 V3 `freezeRunBindingV3`。 |
| Session / Run / State / Comparison persistence and inspection | `DIRECTLY_USABLE` | V3.5 已能 reopen settled Sessions 并检查 Run、Verifier、comparison、promotion、binding、rollback lineage；不证明自动反馈。 |
| ChangeSet / Host-controlled Apply | `DIRECTLY_USABLE` | V3.6 保持 Agent mutation 与 Host apply authority 分离。 |
| New Run Evidence → 当前 State 再评价 | `MISSING` | 没有产品路径把 bound 后续 Run 的结果正式投影回该 State 的效果评估或下一次 Improvement admission。 |

主要依据：[`CURRENT_STATE.md`](../../CURRENT_STATE.md)、[`SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md`](SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md)、[`V2_CLOSEOUT.md`](V2_CLOSEOUT.md)、[`V3_CLOSEOUT.md`](V3_CLOSEOUT.md)、[`V3_5_CLOSEOUT.md`](V3_5_CLOSEOUT.md)、[`V3_6_CLOSEOUT.md`](V3_6_CLOSEOUT.md)、[`V3_6_RECOVERY_INTEGRATION_DECISION_REVIEW.md`](V3_6_RECOVERY_INTEGRATION_DECISION_REVIEW.md)。

---

## B. Actual Broken Loop

### B.1 当前真实主链

```text
V3.6 Real Interactive Coding Run
  -> Session / Workspace / Trace / Terminal / ChangeSet / Apply       [已连通]
  -> formal verifier-backed Outcome                                  [仅冻结/注册任务；daily 默认未验证]

V2 controlled failed Seed
  -> real A/B Recovery -> independent Verifiers -> Selector           [受控实验内已连通]
  -> curated FrozenEvidenceV3                                         [一次受控连接]
  -> V3 Opportunity -> Proposal/Candidate                             [已连通]
  -> deterministic Base/Candidate + regression -> Promote/Reject      [机制实验内已连通]
  -> versioned State -> selective binding -> one real bound Run       [V3 独立路径内已连通]
  -X-> new Run evidence -> evaluation of the bound State              [断点]
  -X-> retain / rollback / supersede based on subsequent evidence      [断点]

V3 active State
  -X-> V3.6 daily Interactive Product effective binding               [断点；现有仅 pin digest/展示 descriptor]
```

### B.2 五个问题的直接回答

#### Q1. Real Evidence → Improvement

**Fact.** 不是“完全没有实现”。`projectImprovementOpportunityV3` 能验证 `FrozenEvidenceV3` 并从 hard failure、inefficient success 或严格六事件 repeated-check pathology 投影 Opportunity；无完整性、终态、闭合 lineage、Verifier 或合法 attribution 时 fail closed（`workbench/src/refinement/evidence-v3.ts`, `projectImprovementOpportunityV3`; `workbench/tests/v3g1-evidence-to-candidate.test.ts`）。

**Fact.** 实际成立的是一次 curated/controlled 连接：V2 controlled failure evidence 被用作 V3 proposal input。V3.6 daily evidence 则被 authority 固定为不可比较、不可适配、不可晋升（`workbench/src/v36/authority-v36.ts`, `validateInteractiveAuthorityV36`）。

**Answer.** 当前属于：**机制存在 + frozen/controlled evidence 已走通一次 + 缺产品级受信准入连接**。不能声称任意真实 Coding Run、Recovery 或 Verifier artifact 已可直接成为 V3 Improvement 输入。

#### Q2. When to Improve

**Fact.** 当前决定不是“任意一次 failure 即自动学习”。输入先由人/Goal 冻结并选择，再由确定性 projector 检查：

- `hard_failure`：Outcome/Verifier 均失败，attribution 必须是 agent/verifier；
- `inefficient_success`：两边同一 Verifier 均通过且 provider/tool vector 严格更差；
- `structural_trajectory_pathology`：严格匹配同一 command 两次失败、中间一次 edit 的闭合六事件轨迹；
- invalid/cancelled、infrastructure/evidence/user attribution、missing verifier、未闭合 lineage 全部不触发。

**Judgment.** 对一个**受控 Adaptive Harness**，这些触发语义足以作为当前最小候选门；项目没有证据需要自动聚类、Experience Database 或 repeated-failure platform。真正不足的是：谁把哪些产品证据冻结/准入、如何去重/关联当前 State、以及谁作长期变更的显式 Host 决策。这里应保留人工选择，不应把“自动触发”当成完成条件。

#### Q3. Validation / Regression Strength

**Fact.** V3 comparator 具备重要的长期变更安全机制：fresh symmetric Base/Candidate、共同冻结 identity、外部 Verifier、`regression_checks[]` 及集合 digest、authority/fairness 检查、候选回归失败即 Reject、完整性重算和 rollback（`workbench/src/refinement/comparator-v3.ts`; `workbench/tests/v3g2-validate-promote-reject-rollback.test.ts`）。

**Fact.** 当前被接受的 Goal 2 是 deterministic/Faux mechanism evidence；测试实际使用一个 frozen regression check。四个 V3 Goal 3 Case 覆盖决策/绑定行为，却没有形成一个按 State applicability 维护、可供后续真实 State 更新重复使用的产品 regression pack。

**Answer.** 底层 gate 机制不是薄弱原型，但其**验证内容和运营连接仍是 single-fixture/small-case bound**。真正缺少的不是大型 Eval Platform，而是一个小型、冻结、按 `task_kind / failure_family` 选择、带来源和版本身份的 regression set，并规定 State 更新不得只由触发它的单一 Case 决定。

#### Q4. Promoted State → New Evidence

**Fact.** V3 已证明 `Promote -> version/active pointer -> selective binding -> subsequent real Run -> external Verifier result`。`executeGoal3RunV3` 的 Manifest 固定 binding 和 Verifier 身份（`workbench/src/run-v3.ts`, `executeGoal3RunV3`; `workbench/tests/v3g3-selective-reuse.test.ts`）。

**Fact.** `freezeRunBindingV3` 在 tracked source 中没有生产调用者，只有 V3 测试/专用执行编排；V3.6 daily product 读取 `harness_state_digest` 和预声明 `harness_adaptations`，但不调用它。V3 Run Manifest 也没有生成新的 `FrozenEvidenceV3`、State-effectiveness evaluation 或 feedback decision。

**Answer.** 当前证明到“State 可以被选择性绑定并在一次真实 Run 中使用”。后续证据**不会正式回到该 State 的评价/改进流程**。这是全项目最大的核心断点。

#### Q5. Recovery → Improvement

**Fact.** V2 failure/A-B Recovery/Verifier evidence 已在 V3 Goal 1 中成为一次受控 Improvement 输入，所以不能说完全断开。

**Judgment.** 不需要 V2 Controller 与 V3 或 V3.6 直接耦合。只要通用的 accepted-evidence admission 能保留 Seed、candidate、common verifier、selector 和 provenance，V2 就只是其中一种证据生产者。专门建设“V2→V3 自动连接”是可选工作，不是核心闭环前提；把 V2 自动插入所有 V3.6 free-input task 仍应 `DO_NOT_BUILD`，理由见既有 Recovery Integration Decision Review。

---

## C. Top Gaps

### Gap 1 — Accepted Run Evidence Admission / Projection

- **当前事实（Fact）：** 多种 Run schema 能产生 Trace、Verifier、comparison 和 terminal artifacts；V3 也有严格的 `FrozenEvidenceV3` validator/projector。但没有一个产品边界把“哪些现有 Run 证据被接纳、如何转换、如何绑定 artifact/ref/run/state identity”正式连接起来。V3.6 daily Run 本身明确不具备 adaptation eligibility。
- **分类：** `MEANINGFUL_CORE_DEVELOPMENT`
- **重要性（Inference）：** 没有这条边，真实运行与长期 Harness 改进仍是两个由开发者手工搬运工件的系统。
- **粗略工作量：** 中等；以 schema mapping、Host admission decision、fail-closed Inspector 和少量 source-family adapter 为主，不需要新 Runtime。
- **首次连接的已有能力：** V0/V1/V2/V3/V3.5 的可信 Outcome/Verifier/Comparison evidence → V3 Opportunity/Candidate provenance。
- **不做的真实限制：** 只能继续通过专门 Goal/fixture 手工构造 Improvement 输入，无法诚实声称系统会从自己的 accepted Run evidence 改进。

### Gap 2 — Applicability-scoped Regression Gate

- **当前事实（Fact）：** comparator 已支持 `regression_checks[]`、集合 digest、公平双臂和候选回归失败即 Reject；现有接受证据仍是一个小型 frozen validation fixture 和有限 Case 表。
- **分类：** `MEANINGFUL_CORE_DEVELOPMENT`
- **重要性（Inference）：** 长期 Prompt/Skill State 若只在原触发 Case 上获胜，就无法区分修复、过拟合和邻近回归。
- **粗略工作量：** 小到中等；冻结少量按 applicability 选择的现有 verifier-backed task，不建设通用 Eval 平台。
- **首次连接的已有能力：** V1/V3.5 公平比较经验 + V3 comparator/decision/state store → 可重复的长期 State 发布门。
- **不做的真实限制：** Promote/Reject 仍主要证明机制正确，不能承担持续 State 更新的产品级 regression responsibility。

### Gap 3 — Promoted State Effectiveness Feedback

- **当前事实（Fact）：** promoted State 可持久化、rollback、selectively bind，也被一次真实 Run 消费；没有 follow-up evidence → current-State assessment → retain/rollback/supersede 的正式 lineage。
- **分类：** `MEANINGFUL_CORE_DEVELOPMENT`
- **重要性（Inference）：** 这是“适配一次”与“受控 Adaptive Harness”之间的决定性差别，也是实际主链的最大断点。
- **粗略工作量：** 中等；新增的是有界 evaluation/decision records 和现有 State/Run Inspector 的组合，不是自主 proposal loop。
- **首次连接的已有能力：** Promote/Version/Binding + real Verifier/Comparison + rollback + V3.5 inspection → 一个完整反馈回路。
- **不做的真实限制：** 已晋升资产会存在并被使用，却没有系统证据说明它应继续保留、回滚或被后续 Candidate 替代。

### Gap 4 — V3 State Binding into the Interactive Product

- **当前事实（Fact）：** V3.6 Session 会 pin State digest 并展示静态 adaptation descriptors，但没有复用 V3 active-pointer/applicability/admission lineage 的 binding composition。
- **分类：** `THIN_CONNECTION`
- **重要性（Inference）：** 若最终真实验收仍绕过 Interactive Product，执行产品与适配系统会继续是两个入口。
- **粗略工作量：** 小到中等，但只有在 Gap 1–3 的 authority/eligibility 边界冻结后才可称“薄”；应组合既有 binding，不重写 prompt/session/workspace/runtime。
- **首次连接的已有能力：** V3 State/selective binding → V3.6 persistent Session/managed Workspace/Trace/ChangeSet/Apply。
- **不做的真实限制：** Workbench UI 可展示 adaptation，专用 V3 runner 可消费 adaptation，但用户日常 coding surface 不是同一条受控主链。

### Gap 5 — Generic Recovery/Verification for Free-input V3.6 Tasks

- **当前事实（Fact）：** free-input task 没有统一可信 Outcome/Verifier，V2 Recovery 还要求 verifier-failed Seed、候选 Workspace/Session lineage 和 selector authority；既有 Review 已证明这不是薄接入。
- **分类：** `DO_NOT_BUILD`
- **重要性（Recommendation）：** 它会重新打开 Failure Trigger、Verifier、Budget/Terminal、Workspace、ChangeSet/Apply 和 UI 边界，并把最后闭环变成新的通用 Agent 平台。
- **粗略工作量：** 大且边界开放。
- **若做可能连接的能力：** V2 Controller 与全部 V3.6 daily Runs；但连接本身不等于可信，因为缺少通用 Outcome authority。
- **不做的真实限制：** 只有预注册、可验证、明确适配/比较资格的任务能进入闭环；任意 free-input Run 仍保持 `unverified`。这是诚实边界，不是本 Review 建议消除的缺陷。

---

## D. Final Judgment

**当前第二项目是否已有真正成型的 Harness 主闭环？——还没有。**

它已经有成型的**组件链和一次受控纵向证明**，但没有成型的**持续反馈系统**。具体而言：

1. Runtime/Session/Workspace/Trace/Terminal/ChangeSet/Apply 已是可用产品路径；
2. Recovery、comparison、Candidate、validation、promotion、rollback、binding 均有真实或确定性受控证据；
3. 但是 accepted product evidence 到 Improvement admission、V3 active State 到 V3.6 effective binding、以及 subsequent evidence 到 State 再评价三条边没有同时成立；
4. 因此当前最强安全 claim 是“拥有经过验证的 Harness building blocks 和一条受控 adaptation case”，不是“一个会基于自身新证据受控改进的连续 Harness 系统”。

最值得补的最后一层核心能力是：

> **Bounded Evidence-to-State Feedback Closure**：Host 只从 verifier-backed、lineage-closed、明确 eligibility 的运行证据中接纳 Improvement 输入；Candidate 通过小型 applicability-scoped regression gate 后才可晋升；promoted State 在 Interactive Product 的受控任务上被实际绑定；后续证据必须反向支撑 retain、rollback 或 supersede 决策。

这层能力直接完成原项目的 Reliability/Recovery/Adaptation 主线，因为它把已经存在的执行、证据、验证、适配、持久化和产品入口闭合，而不是增加普通 Coding Agent 功能。

---

## E. Development Decision

# RECOMMEND_FINAL_CORE_DEVELOPMENT

以下仅是 3 个 Goal 级阶段轮廓，不是 Implementation Spec，也不授权执行。

### Goal 1 — Trusted Evidence Admission and State-aware Projection

建立一个 Host-controlled、fail-closed 的准入边界，把已有 verifier-backed Run/Comparison/Recovery artifacts 投影为 V3 `FrozenEvidenceV3`，保留 source Run、Verifier、comparison、binding State、terminal validity 和 artifact provenance；人工决定是否准入，投影器决定是否满足现有三类 trigger。

- **复用：** V0/V1 Outcome/Inspector、V2 Failure Packet/Selector、V3 evidence schema/projector、V3.5 comparison/read model、V3.6 Trace/terminal artifacts。
- **完成条件：** 至少覆盖 ordinary verifier failure、valid comparison、bound-State follow-up 三种已存在 evidence family；tamper、missing verifier、unclosed lineage、ineligible daily Run 均 fail closed。

### Goal 2 — Bounded Regression and State Effectiveness Decision

将现有 V3 comparator 从单一 fixture 使用方式收敛为小型 applicability-scoped regression gate，并为 promoted State 增加基于后续证据的 `retain / rollback / supersede-candidate` 决策记录；仍由 Harness/Host 发布，Agent 只有 proposal authority。

- **复用：** V3 Base/Candidate comparator、decision table、versioned store、active pointer、rollback、admission lineage；V3.5 公平 Pair 和 Inspector。
- **完成条件：** Candidate 不能只凭 source Case 晋升；State follow-up evidence 可确定性地产生 retain 或 rollback/supersede 路径，历史和 active pointer 可重开检查。

### Goal 3 — One Frozen Real Closed-loop Product Acceptance

在一个预注册、有独立 frozen Verifier、明确 adaptation eligibility 的 bounded coding task 上，通过 V3.6 Interactive Product 完成一次闭环验收：accepted prior evidence → Candidate/gate → Promote → applicable binding → real Run → Verifier/Trace/ChangeSet/Host Apply 或 Discard → new admitted evidence → State retain 或 rollback 决策。

- **复用：** V3 binding/state、V3.5 persistence/inspection、V3.6 Session/Workspace/Docker/budget/terminal/ChangeSet/Apply。
- **真实验收必须证明：** 同一产品入口真实消费已晋升 State；绑定身份在 Run start 冻结；Outcome 来自独立 Verifier而非 Agent 自述；新证据确实返回 State 评价；负结果可以 Reject/Rollback，不能 result hunting。
- **明确不做：** 通用 LLM Judge、free-input hidden-test generation、V2 自动接入所有 V3.6 task、无限 retry/branch、Failure clustering/Experience platform、Multi-Agent、新 Runtime/Agent Loop、自动修改 Harness TypeScript、模型训练、Policy DSL、distributed/multi-user、自主 continual self-evolution。
- **立即停止条件：** 上述一个 frozen real loop 通过 Main/用户验收，三条断边均有 Inspector-valid lineage，且所有负向/回归/authority tests 通过后即停止；不追加第二任务族、不追求统计结论、不扩建平台。

---

## Evidence and claim limits

- **Fact source priority:** 当前 accepted state 与正式 Closeout 高于抽象版本叙事；关键断点才下钻 source/tests。
- **Unconfirmed:** 本 Review 没有证明任何 prompt addendum 或 adaptive Skill 在一般任务上具有因果、统计或跨任务收益。
- **Unconfirmed:** 本 Review 没有证明 V3.6 任意 free-input task 可以获得可信 formal Outcome。
- **Recommendation boundary:** `RECOMMEND_FINAL_CORE_DEVELOPMENT` 只推荐上述闭环连接，不授权源码修改、真实模型调用、新 Case、PoC、新版本或实施。

本 Review 到此停止，等待 Main / User 决策。
