# V3 Version Charter — Harness State Adaptation

```yaml
status: accepted
date: 2026-08-07
accepted_by_user: 2026-08-07
formalized_by_main_session: 2026-08-07
version: V3
project: Agent Harness Reliability Workbench
portfolio_identity: Adaptive Coding Agent Harness
version_mission: evidence_grounded_harness_state_adaptation_and_selective_reuse
repository_baseline: 3b6406fc142738dd85efa0e9ff6bc2a02dd6289c
v2_disposition: ACCEPT_V2_MECHANISM_EVIDENCE_WITH_NEGATIVE_INCOMPLETE_LIMITATION
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_package: "@earendil-works/pi-agent-core@0.82.1"
prime_reference_commit: b9a4461149419156599d60174dddf15458e2b9ee
active_goal: null
goal_1_status: closed_accepted
goal_1_disposition: PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE
goal_1_activation_authorized: consumed
goal_2_status: closed_accepted
goal_2_disposition: PASS_V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK
goal_2_authorized: consumed
goal_3_authorized: false
implementation_owner: null
implementation_authorized: false
implementation_started: true
implementation_completed: false_goal_3_pending
zero_call_candidate_baseline_commit: 07b81a4cf392854bbbde041f3dafae13b52a768f
goal_1_implementation_baseline_commit: 6ec958b83363c01e0eeec8be0360516dcdf2bc7e
real_model_calls_authorized: 0
real_model_calls_observed: 1
credential_reads_observed: 1
provider_calls_observed: 1
real_proposal_cost_usd: 0.0002016
external_network_authorized: false
pi_core_patch_authorized: false
git_commit_authorized: consumed_v3_goal_2_closeout
control_baseline_commit: 8107df7e7ca10206fbb3fc58f93c3baf3cd4ab75
goal_2_control_baseline_commit: f138ddd607816f266e9024291718eeab087b39f6
goal_2_candidate_baseline_commit: c86c6947e71f91ad3fb1262101aa092629b44eb0
goal_2_candidate_baseline_tree: f9a2ce17d374e357e6c6df1e5607b6b646373485
goal_2_implementation_baseline_commit: resulting_HEAD_of_this_revision
implementation_goal_count: 3
implementation_session_model: one_fresh_top_level_session_per_goal
```

> 本文件已由用户接受并正式化。当前只激活 Goal 1，且实现权只交给一个新的顶层
> Dedicated Implementation Session；当前 Main Session 不拥有实现权。本次授权不包含 Goal 2、
> Goal 3、真实模型调用、网络、凭据读取或 Pi 修改。

## 1. Version mission

V3 要让第二项目完成以下最小但完整的工程闭环：

```text
Trace / Verifier / A-B Evidence
  -> Improvement Opportunity
  -> Diagnosis / Lesson
  -> model-proposed typed Candidate
  -> staged Harness State
  -> Base vs Candidate validation
  -> Promote / Reject
  -> versioned active state
  -> selective binding in a subsequent Run
  -> regression evidence
  -> rollback when required
```

V3 的价值不是建设功能最多的 Coding Agent，也不是证明普适“自进化算法”。它要证明：一个受控 Coding Agent Harness 能从可靠执行证据中提出可审计的改进，修改两种真实 Harness State，并在不放宽评价标准的前提下验证、晋级、拒绝、复用和回滚。

V3 完成后，项目可形成以下版本叙事：

```text
V0 — Run Reliably
V1 — Observe
V2 — Explore / Recover
V3 — Learn -> Adapt -> Validate -> Reuse
```

V3 是当前规划中的 Portfolio Closure Version。达到本 Charter 的 Definition of Done 后停止，不继续为了 Future Work 扩大功能。

## 2. Current evidence baseline

### 2.1 Accepted V0–V2 facts

- V0-A/B/C 已关闭并接受：Workspaces、Direct Pi execution、Session、Journal、External Verifier、Outcome、Evidence 与 CLI 基础已成立。
- V1-A 已证明固定 Pi public Skill 路径、Windows path/loader guardrails、treatment payload identity 与 deterministic experiment substrate。
- V1-B 已形成 Baseline / Skill-only / Skill+Runtime 的有界 descriptive evidence；它不证明普遍策略优越性。
- V2-A 已证明 immutable failed Seed、两个 byte-isolated Candidate Workspaces、public JSONL Session fork/fresh semantics、Verifier、Selection 与 Inspector。
- V2-B 已真实运行 retained-history 与 fresh-session 两条路径；两者均通过 Verifier，V2 Selector 选择 A。
- V2-B 的真实 Negative 未到达 Verifier，因此 V2 以明确 limitation 关闭，而不是完整 Contract PASS。
- Pi Core patch 与 private import 仍为 0；Direct public emitted `AgentHarness` 仍是主 runtime。

V3 不重新解释、补做或扩展 V2-B Negative。V2 的 accepted partial baseline 足以支持 V3。

### 2.2 Precontract design basis

V3 设计依据：

- `docs/reports/V3_HARNESS_STATE_ADAPTATION_PRECONTRACT_REVIEW.md`；
- 用户对该 Review 的 binding corrections；
- 当前 Workbench 源码与 tests；
- pinned Pi source/tests；
- pinned Prime Agent refinement/source tests。

Prime 只作为 reference implementation。V3 不把 Prime 变成新基座，也不引入 RLM、daemon、persistent IPython、persistent subagent 或完整 Prime Verifiers。

## 3. Version question and success standard

V3 必须回答：

> Workbench 能否从有效执行证据形成 evidence-grounded、model-proposed、typed Harness State Candidate，在 Harness 独占控制下 staging，以公平的 Base/Candidate 对照和外部 Verifier 决定 Promote/Reject，并让已晋级 State 在适用的后续 Run 中被确定性复用、可回归、可回滚？

版本成功不是“生成了一份 Skill”或“模型说它学到了经验”。成功必须由完整代码路径、tests 和 evidence 支持：

```text
Observe
  -> Diagnose
  -> Propose
  -> Stage
  -> Validate
  -> Promote / Reject
  -> Persist
  -> Selectively Bind
  -> Regress
  -> Roll Back
```

## 4. Frozen V3 product surface

V3 只增加以下产品能力：

1. 从有效 Run/Verifier/A-B evidence 产生 `ImprovementOpportunity`；
2. evidence-provenance-backed Diagnosis / Lesson；
3. deterministic fixture producer 与 bounded model-backed Candidate Producer；
4. typed `RefinementCandidate` / `HarnessEdit`；
5. immutable staged Candidate State；
6. `prompt_addendum` 与 `adaptive_skill` 两种 State adapter；
7. symmetric Base/Candidate intervention comparator；
8. Promote / Reject、immutable version、active binding、stale protection 与 rollback；
9. project-persistent active state；
10. lightweight applicability 与 deterministic selective binding；
11. Manifest / Artifact / Journal / Inspector 的 refinement lineage；
12. 约 3–5 个 behavioral/regression Cases 与有界真实代表性闭环。

V3 应通过 adapter 复用当前 runtime，不建设第二套 Agent Loop、Trace、Branch、Verifier、Replay 或 Eval Runtime。

## 5. Frozen adaptive State kinds

V3 只有两种可变 State：

### 5.1 `prompt_addendum`

- 表示 behavioral/instruction overlay；
- accepted base system prompt immutable；
- addendum 可 staging、版本化、验证、选择性绑定和 rollback；
- Run start 时组成静态 prompt 并冻结 digest；Run 中不重读 mutable state。

### 5.2 `adaptive_skill`

- 表示 reusable procedural guidance；
- 使用 Pi public Markdown/frontmatter Skill、`loadSkills()`、wrapper 与 explicit Skill invocation；
- Workbench 对 diagnostics、identity、collision、escape、link/hardlink 与 Windows path fail closed；
- accepted V1 Skill fixture 不修改；V3 Candidate 使用独立 immutable Skill materialization；
- 首版不得退化为 executable plugin、Prime Python callable 或任意代码 payload。

这两种 State 必须经过同一个 generalized lifecycle，但必须保留两条真实、可区分的 Pi/Workbench 加载路径。V3 不增加 Memory、Runtime Policy 或第三种 State。

## 6. Improvement triggers and evidence validity

V3 冻结三类 Trigger：

```text
hard_failure
inefficient_success
structural_trajectory_pathology
```

共同门槛：只有 identity、lineage、Artifact、terminal 与 Verifier evidence 均有效的结果才能成为 learning input。Infrastructure/evidence invalid、cancelled、缺失 Verifier 或无法闭合的 evidence 不得生成 Lesson 或 Candidate。

### 6.1 `hard_failure`

由 valid terminal + external Verifier failure 等现有正式证据确定。不得把 infrastructure/evidence failure 伪装成任务失败。

### 6.2 `inefficient_success`

由 correctness 相同、可比 evidence 中的结构/usage 差异确定。第一版只使用预冻结、可解释的比较顺序，不引入综合 reward 或统计 superiority。

真实运行的微小 cost/time 波动默认只作为诊断，不单独授权 Promotion，除非 Case 执行前已经冻结 materiality rule。

### 6.3 `structural_trajectory_pathology`

必须至少支持一个真正的结构模式：

```text
same frozen test/check fails
  -> intervention/edit occurs
  -> same frozen test/check runs again
  -> same check fails again
```

该模式必须由 frozen command/check identity、Tool call/result linkage 与 bounded Artifact 确定性证明。`recovery happened + final verifier failed` 可作为补充结构信号，但不能成为唯一实现。

V3 不分析私有 reasoning quality，不建设 LLM thought-loop classifier 或通用 semantic pathology detector。

## 7. Diagnosis, Lesson and Candidate Producer

V3 必须保持概念分离：

```text
Trigger      -> 为什么值得检查
Diagnosis    -> 证据显示什么可复用模式
Lesson       -> 应保留什么经验或约束
HarnessEdit  -> Harness State 具体改变什么
```

Diagnosis / Lesson 可以是 Candidate evidence chain 中的结构化对象，不建设 Experience Repository。

Candidate generation 必须有两条入口：

1. deterministic fixture producer：用于 cheap、stable 的机制与错误路径测试；
2. bounded model-backed producer：从 frozen evidence 产生结构化 Diagnosis / Lesson / HarnessEdit proposal。

权限冻结为：

```text
Model / Agent:
  proposal authority only

Harness:
  schema and exact-key validation
  authority validation
  candidate construction
  staging
  intervention validation
  promotion/rejection
  active-state mutation
```

模型无权写 state store、修改 active pointer、选择 Verifier、改变 Promotion rule 或放宽 hard constraints。Model-backed producer 的实际调用需要后续独立预算和真实调用授权；当前 Goal 1 激活不授权调用。

## 8. Candidate and State lifecycle

冻结 lifecycle：

```text
Frozen Evidence
  -> Proposal
  -> validated RefinementCandidate
  -> immutable staged Candidate State
  -> Base/Candidate validation
  -> Promote or Reject
  -> immutable accepted State Version
  -> atomic Active State binding
  -> subsequent selective reuse
  -> regression evidence
  -> pointer rollback when required
```

Candidate 必须是一个 small coherent intervention。默认实现可以限制一个 edit；若最多支持两个 coherent edits 几乎不增加复杂度，可以实现，但必须证明：

```text
one valid edit + one invalid edit
  -> whole Candidate rejected
  -> active state unchanged
```

最终 claim 只能表述为 bounded Candidate atomicity，不能声称通用 multi-edit transaction system。

## 9. Immutable authority plane

Adaptive layer 只能改变：

```text
prompt_addendum
adaptive_skill
their applicability metadata
```

以下内容不可成为 Candidate target，也不可由 model/refiner 修改：

- External Verifier、Acceptance Criteria、Outcome semantics；
- regression authority、Promotion comparator/rule；
- Evidence writer、Inspector、Manifest identity；
- Tool permission、安全策略、protected paths；
- credential/network authority；
- hard provider/tool/token/time/cost ceilings；
- core runtime contracts；
- accepted base prompt、accepted fixtures、Pi source。

State store 必须位于模型可写 Workspace 之外，运行 Tool profile 不提供其 write authority。

核心不变量：

> Agent proposes; Harness disposes. The Harness may adapt how it acts, but cannot relax how improvement is judged.

## 10. Symmetric intervention validation

V3 复用 V2 的 comparison substrate：Workspace snapshot/copy、Session、execution ports、Verifier、Artifact、Journal、Manifest、Inspector 与 budget guardrails。

V3 不原样复用硬编码 retained-history/fresh-session treatment 的 V2 A/B controller。允许增加一个薄的 V3 symmetric comparator，但不建设第二套 Eval Runtime。

Base/Candidate validation 冻结以下 fairness invariant：

```text
same task
same workspace baseline
same model/provider
same tools
same verifier
same hard constraints
same session policy

only treatment delta = Harness State
```

两臂可以选择同 fresh Session 或另一种相同 Session policy；具体选择由实现决定，但不得让 Session history 与 State 同时成为 treatment。

### 10.1 Promotion semantics

顺序必须是：

```text
evidence/identity/authority validity
  -> external correctness
  -> frozen regression
  -> structural metrics
  -> tool/provider usage
  -> predeclared material cost/time evidence
```

最低决策：

- Base fail、Candidate pass、regression/authority 通过：可 Promote；
- Base pass、Candidate fail：Reject；
- 两者 fail：Reject；
- 两者 pass：只有 Candidate 在预冻结、可解释的指标上严格改善且无回归时才 Promote；tie/no material improvement 时 Reject。

不得用 V2 strategy-order tie-break、模型自评或 Candidate 自己修改的标准做 Promotion。

## 11. Version, persistence, binding and rollback

V3 必须具有：

- immutable/content-identified State versions；
- write-once Candidate/Decision evidence；
- active state version/digest；
- apply 前 stale base version/digest rejection；
- atomic active binding；
- corrupt/missing/digest-mismatch state fail closed；
- single-writer assumption；
- rollback 通过 active pointer 回绑已接受旧版本，而非改写旧版本或 inverse mutation；
- Run start snapshot，确保运行期间 State 变化不影响该 Run。

具体 TypeScript interface、目录布局、stateRoot path、field name 和 symbol 不由 Charter 写死。Implementation Session 可以选择最小工程实现，只要上述行为和证据不变量保持不变。

Project persistence 的原型可以是 ignored operational state，不要求数据库或生产级 durability；最终 Closeout 必须披露其持久化边界。

## 12. Applicability and selective binding

每条 promoted State 必须具有小型、受控的 applicability metadata。Implementation 可选择最小字段，但至少要表达 task context，并在 failure/recovery context 可用时表达 failure family。

匹配必须是 deterministic、可重算、可记录的：

- 不使用 embedding、LLM router、ranking model 或相似度搜索；
- 无匹配时记录 empty binding，不加载全部 State；
- irrelevant State 不得绑定；
- 多个 adaptive Skill 冲突时 fail closed 或使用 Charter-compatible 的唯一确定性规则；
- Run Manifest 冻结 active State version/digest、binding context、bound entries 和实际 prompt/Skill digests；
- Inspector 能重算 binding，并确认 Run 中途没有 State drift。

该能力称为 Adaptive State Applicability / Binding，不是 Experience Router。

## 13. Implementation Goal 1 — Evidence → Candidate State

### 13.1 Objective

从有效执行证据形成一个安全、可审计、尚未生效的 Harness State Candidate。

### 13.2 In scope

- 三类 Trigger 的最小 evidence projection；
- frozen-check repeated-failure structural pattern；
- Diagnosis / Lesson evidence provenance；
- deterministic fixture producer；
- bounded model-backed producer；
- host-side proposal/schema/authority validation；
- unified Candidate/Edit boundary；
- prompt addendum 与 adaptive Skill staged adapters；
- immutable staged Candidate State；
- focused mechanism/security tests。

### 13.3 Core invariants

- invalid evidence 不产生 Candidate；
- 模型只有 proposal authority；
- Candidate 不能表达 authority-plane target；
- accepted base 与 active state 不变；
- 两种 State 是真实、不同的加载路径；
- staged Candidate 可被后续 Goal 重读和核验。

### 13.4 Exit criteria

- 三类 Trigger 各有至少一个 deterministic fixture；
- structural trigger 至少由一个真实 frozen check cycle 证明；
- Diagnosis / Lesson 可追溯到 immutable evidence；
- deterministic producer 和一个后续授权的 bounded real model-backed proposal 均形成合法 Candidate；
- prompt addendum 与 adaptive Skill 均能形成真实 staged State；
- malformed、stale 或 authority-targeting proposal fail closed；
- accepted base/active state byte-identical；
- Candidate 尚未被 Promote。

### 13.5 Goal-local non-goals

- Promotion/active binding；
- full behavioral A/B；
- selective reuse；
- Curator/Experience Repository；
- auto-refine/auto-publish。

## 14. Implementation Goal 2 — Validate → Promote / Reject / Rollback

### 14.1 Objective

证明 Candidate 只有在独立 evidence 支持时才能成为 active Harness State，并可安全拒绝或回滚。

### 14.2 In scope

- V3 symmetric comparator adapter；
- Base/Candidate treatment proof；
- external Verifier 与 frozen regression；
- both-pass structural/usage comparison；
- Promote / Reject decision evidence；
- immutable version、active pointer、stale protection；
- fail-closed reload；
- pointer rollback；
- Inspector/lineage tests。

### 14.3 Core invariants

- Harness State 是唯一 treatment delta；
- Verifier、regression、budget、tools 与 authority plane frozen；
- rejected Candidate 不改变 active state；
- old versions/decisions 永不重写；
- rollback 不删除历史；
- Inspector 独立重算 outcome 和 binding identity。

### 14.4 Exit criteria

至少证明：

```text
good Candidate -> promoted
bad/no-improvement Candidate -> rejected
promoted Candidate -> rollback to prior accepted version
```

并满足：

- symmetric fairness evidence 完整；
- stale Candidate rejected；
- corrupt/missing State fail closed；
- active pointer 可 reopen；
- Candidate/validation/decision/version lineage 可审计；
- accepted V0–V2 core contracts 无修改。

### 14.5 Goal-local non-goals

- broad task suite；
- Router；
- model-based Promotion Judge；
- statistical superiority；
- production multi-writer store。

## 15. Implementation Goal 3 — Selective Reuse & Portfolio Closure

### 15.1 Objective

证明已晋级经验能够跨 Run 持久存在，只在适用任务中被确定性绑定，并在后续 Run 和回归中产生可核验结果。

### 15.2 In scope

- project-persistent active state；
- applicability metadata 与 matcher；
- Run-start state freeze；
- subsequent Run binding；
- Manifest/Inspector refinement lineage；
- relevant/prior-pass/irrelevant regression；
- 约 3–5 个 behavioral/regression Cases；
- bounded real representative closures；
- V3 final closeout 与 Portfolio claims/limitations。

### 15.3 Core invariants

- unrelated State 不绑定；
- Run 中 state/binding 不漂移；
- subsequent Run 能指向准确 Candidate/Decision/Version；
- regression authority 不由 State 修改；
- real Execution Session 无 source/state-authority mutation；
- Case 数量不为追求漂亮结果而扩张。

### 15.4 Exit criteria

- active state 跨独立 Run reopen；
- relevant Run 确定性绑定，irrelevant Run 不绑定；
- Manifest/Inspector 重算 version/digest/bound entries；
- 3–5 个 Case 覆盖三个 Trigger、prior-pass regression 与 irrelevant negative，可在不丢覆盖的情况下合并；
- 至少一个 subsequent Run 消费 promoted state；
- 至少一次 Reject 或 rollback 有行为 evidence；
- 真实闭环软目标 2：最好分别覆盖 prompt addendum 与 adaptive Skill；
- 若第二个闭环命中模型噪声、成本或既有 hard stop，允许以 1 个真实闭环 + explicit limitation 收口；
- 不允许以零真实 behavioral closure 宣称完整 Portfolio V3；
- 最终 claims 与 limitations 由 Main/用户接受。

### 15.5 Goal-local non-goals

- 10+ Cases、large benchmark、统计显著性；
- blind evaluation、SWE-bench、Prime Verifiers integration；
- Experience Router/DB；
- V4 或长期 continual evolution。

## 16. Behavioral evidence plan

默认最多五个 Case：

1. `hard_failure -> prompt_addendum -> Promote -> relevant subsequent Run`；
2. `inefficient_success -> adaptive_skill -> Promote`；
3. `structural repeated failure -> Candidate -> Promote or evidence-backed Reject`；
4. prior-pass related/regression Case；
5. irrelevant task non-binding + rollback evidence。

这些 Case 可以合并，只要三类 Trigger、两种 State、回归、irrelevant binding 与 rollback 仍被证明。

Faux Provider/fixtures 用于机制和大部分回归。真实证据软目标是两条代表性闭环，最低一条。真实调用的 Provider、模型、预算、Case identity 和 hard cap 必须在调用前单独冻结并由用户授权，本 Charter 不预设价格或调用数。

## 17. Development and Session governance

V3 使用工程化轻治理：

1. 本 Charter 经用户接受后，作为三个 implementation Goals 的共同执行合同；默认不再创建每 Goal Contract。
2. Goal 是 implementation unit，不是新的 Stage/Gate/文档层。
3. Main Session 维护事实、范围、Goal Exit 验收、commit 与最终 claims。
4. 每个 Goal 使用一个新的、顶层独立 Dedicated Implementation Session；不以当前 Main 的 subagent 替代，也不让同一 Implementation Session 跨 Goal 继续拥有实现权。
5. 顺序固定为：Goal 1 从 V3 Control Baseline 开始；Goal 2 从已接受的 Goal 1 Implementation Baseline 开始；Goal 3 从已接受的 Goal 2 Implementation Baseline 开始。后一个 Goal 不得提前并行实现。
6. Goal Session 负责本 Goal 的 bounded implementation、focused tests、raw evidence、Implementation Report 和 Closeout Draft；不得接受 Goal、修改 `CURRENT_STATE.md`/Charter、暂存或 commit、扩大 Scope，或决定后续 Goal。
7. Main Session 对每个 Goal 做轻量验收。allowlist 内普通 defect 返回原 Goal Session 修复；不为同一 Goal 的普通返修创建 Replacement/Correction/Audit Session。
8. Session separation 只用于 context/authority isolation，不自动产生 Readiness、R1/R2、Amendment 或 Audit。
9. compile、fixture、schema、path、adapter、prompt wording 和普通 focused regression defect 按 `fix -> focused tests -> Main review -> commit` 处理。
10. Independent audit 不默认执行。只有具体 finding 触碰 authority/promotion/active-state boundary、accepted core contract，出现不可解释 material regression，或用户要求时，才启动一次 focused audit。
11. Goal 1 的 bounded model-backed proposal 可由 Goal 1 Session在独立授权下执行；模型仍只有 proposal authority，普通 parser/schema/adapter defect 可在该 Goal 内正常修复。Goal 3 的真实 behavioral closure 必须从冻结 implementation baseline 开始，并使用一个新的 no-source-edit Execution Session；它是结果权限隔离，不是第四个 implementation Goal，也不产生新治理层。
12. 达到当前 Goal Exit 即停止，不因为 Future Work 继续扩张。

如果仓库现有通用治理文字与本节的 V3-specific 用户决定冲突，以用户接受后的本 Charter 为 V3 实施治理依据；工程事实和 accepted V0–V2 Closeout 不受影响。

## 18. Version Definition of Done

V3 只有在以下全部成立时才可建议最终接受：

1. 三类 Trigger 均有最小、可重算 evidence；
2. structural trigger 包含真正 frozen-check repeated-failure pattern；
3. Diagnosis / Lesson 有 immutable provenance；
4. deterministic 与 bounded model-backed producer 均成立；
5. prompt addendum 与 adaptive Skill 两种 State 均真实跑通；
6. Model proposal 与 Harness mutation authority 分离；
7. Candidate staging 不污染 accepted base/active state；
8. Base/Candidate fairness 证明 State 是唯一 treatment delta；
9. External Verifier/regression 后才 Promote；
10. Promote、Reject、version、stale reject、fail-closed reload 和 pointer rollback 均成立；
11. active state 可跨 Run 持久化；
12. applicability/selective binding 与 irrelevant non-binding 成立；
13. subsequent Run 冻结并记录 state version/digest/bound entries；
14. 约 3–5 个 Case 覆盖核心行为与回归；
15. 至少一个 bounded real behavioral closure；第二个为软目标；
16. Authority Plane 未被 Candidate 放宽；
17. Pi Core patch/private import 为 0；
18. V0–V2 accepted tests 与 relevant focused regressions 通过；
19. 最终 evidence、commands、cost、limitations 与 source delta 可复核；
20. Main Session 与用户接受最终 Portfolio claims。

## 19. Version non-goals

V3 不做：

- Memory 或 Runtime Policy State；
- adaptive budget、Verifier、Promotion、security 或 credential policy；
- Curator platform、Experience Repository、LLM Router、embedding retrieval；
- auto-refine/auto-publish、continual autonomous evolution；
- RLM、daemon、persistent IPython、persistent subagent；
- SDK/Extension/RPC route switch；
- Pi Core modification/private imports；
- second Agent Loop/Trace/Branch/Verifier/Eval Runtime；
- production database、distributed lock、multi-writer merge、OS sandbox；
- large benchmark、statistical superiority、universal self-improvement claim；
- reopening V2-B Negative；
- formal V4。

## 20. Hard stops

出现以下情况必须停止并返回 Main/用户，不得静默扩大：

1. 两种 State 需要 Pi Core patch、private import 或 SDK/Extension/RPC switch；
2. Base/Candidate 无法保持 Harness State 为唯一 treatment delta；
3. Candidate 必须能修改 Verifier、Promotion、hard budget/security 或 evidence authority 才能工作；
4. model-backed producer 必须获得 state mutation authority；
5. 无法实现 fail-closed State load、immutable version、atomic/inspectable active binding 或 rollback；
6. prompt addendum 与 adaptive Skill 实际退化为同一加载路径；
7. V3 必须增加第三 State、Router、Experience Platform 或大型 Eval 才能完成 claim；
8. 出现不可解释 material regression；
9. 同一核心 State/lifecycle 设计连续两次 fundamental failure；
10. 必须重写 accepted V0–V2 core contracts；
11. 真实执行越过单独冻结的 credential/network/cost/attempt hard cap；
12. 最终无法取得任何有效 real behavioral closure。

普通 compile/test/fixture/schema/path/adapter/prompt defect 不属于 hard stop。

## 21. Claims boundary

### 21.1 完成后允许的 claims

在 DoD 和最终用户接受均满足后，可以准确表述：

- 构建了一个基于 Pi Direct AgentHarness 的可靠 Coding Agent Workbench；
- 能从外部验证和结构化 Trace 中识别改进机会；
- 使用 bounded model-backed producer 形成 evidence-grounded typed Harness State Candidate；
- 能对 prompt addendum 和 adaptive Skill 进行 staging、Base/Candidate 验证、Promote/Reject、版本化和 rollback；
- 能在后续 Run 中按 deterministic applicability 选择性复用已晋级 State；
- 保持 Verifier、Promotion、hard constraints 与 evidence authority 不可由 adaptive layer 放宽。

### 21.2 不允许的 claims

- 通用自进化 Agent 或普适自改进算法；
- 自动生成的 Candidate 一定改善真实任务；
- 统计显著或 benchmark-level improvement；
- 无人监督的自动发布/长期 continual evolution；
- production durability、multi-writer consistency 或 OS sandbox；
- Experience Router/Curator/Memory/Runtime Policy 已实现；
- V2 retained-history/fresh-session 存在一般优劣结论。

若只完成一个真实闭环，最终材料必须显式写明第二状态的真实 behavioral evidence 未完成，但可保留 deterministic mechanism evidence。

## 22. Current control point

用户已接受本 Charter，并单独授权 Goal 1 Activation、V3 Control Baseline Commit 与新的顶层 Goal 1 Implementation Session。Control Baseline 冻结为：

```yaml
V3_VERSION_CHARTER: accepted
active_goal: null
goal_1_status: closed_accepted
goal_1_disposition: PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE
goal_1_activation_authorized: consumed
goal_2_status: closed_accepted
goal_2_disposition: PASS_V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK
goal_2_authorized: consumed
goal_3_authorized: false
implementation_owner: null
implementation_authorized: false
implementation_started: true
implementation_completed: false_goal_3_pending
zero_call_candidate_baseline_commit: 07b81a4cf392854bbbde041f3dafae13b52a768f
goal_1_implementation_baseline_commit: 6ec958b83363c01e0eeec8be0360516dcdf2bc7e
real_model_calls_authorized: 0
real_model_calls_observed: 1
external_network_authorized: false
pi_core_patch_authorized: false
git_commit_authorized: consumed_v3_goal_2_closeout
goal_2_control_baseline_commit: f138ddd607816f266e9024291718eeab087b39f6
goal_2_candidate_baseline_commit: c86c6947e71f91ad3fb1262101aa092629b44eb0
goal_2_implementation_baseline_commit: resulting_HEAD_of_this_revision
```

本段仅记录 Charter 最初冻结时的 Goal 1 启动边界；后续 Goal 1/2 的真实当前状态由 22.2–22.4 节取代。Main Session 只负责正式控制状态、Control Baseline、启动 Prompt、顶层 Session 创建、轻量验收与 commit，不代替 Dedicated Session 修改 V3 产品源码。

### 22.1 Accepted start sequence

Charter 被用户接受后，V3 的唯一启动顺序是：

```text
Main formalizes accepted Charter
  -> Main updates CURRENT_STATE / necessary governance pointers
  -> Main creates and verifies a clean V3 Control Baseline Commit
  -> Main records exact baseline SHA
  -> Main verifies the pinned emitted Pi artifact boundary and Goal-local ignored loader/type paths
  -> Main generates Goal 1 top-level Session start prompt
  -> new Goal 1 Session runs only Goal 1
  -> Goal 1 returns evidence and stops for Main review
```

### 22.2 Goal 1 accepted closeout (2026-08-08)

This subsection supersedes only the earlier Goal 1 current-control prose; it
does not change the accepted V3 technical scope, Goal 2/3 design, non-goals or
hard stops.

- Main accepted Goal 1 as `PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE`.
- Candidate Baseline: `07b81a4cf392854bbbde041f3dafae13b52a768f` / tree
  `cbb2669a53c811ff1ae6ca1a27ae6c53fadb178d`.
- One separately authorized `deepseek-v4-flash` request produced the
  host-validated Candidate digest
  `48ee92898bdb1eeedfc33956a67725f030bae04d042238af147c30348379c7f4`.
- The resulting State digest
  `efbaf666637726231d3c3765a23bf579ebb6f2698dd6e8332904e0db938953d9`
  remains `staged_inactive`; no promotion or active binding occurred.
- Credential/network/Provider/model counts were exactly 1/1/1/1, cost was USD
  `0.0002016`, and retry/fallback/replacement counts were all zero.
- `active_goal` is now `null`. Goal 2 and Goal 3 require separate user
  authorization; no further real access or Pi modification is authorized.

### 22.3 Goal 2 activation (2026-08-08)

The user subsequently authorized the next planned step. Goal 2 is active from
the accepted Goal 1 Implementation Baseline
`6ec958b83363c01e0eeec8be0360516dcdf2bc7e` with these additional control
bindings:

- one new top-level Dedicated Goal 2 Implementation Session;
- zero Credential reads, network requests, external Provider calls and real
  model calls;
- deterministic/Faux validation evidence only;
- no per-Goal Contract, Stage chain or default independent audit;
- no Goal 3 applicability, selective Run binding, real behavioral closure or
  Portfolio closeout;
- no Pi modification or SDK/Extension/RPC route switch.

Goal 2 stops when the Charter's good-Promote, bad/no-improvement-Reject,
rollback, fairness, stale, corrupt/missing, reopen and lineage exit criteria are
demonstrated and reported for Main review.

Goal 1 被 Main/用户接受并形成 Implementation Baseline 后，才以相同模式启动 Goal 2；Goal 2 接受后才启动 Goal 3。每一步只以前一步已接受的 clean tracked baseline 为起点。

当前 Workbench 的 bare package imports 需要一个 worktree-local、ignored loader/type-path bridge 指向已存在的 pinned emitted Pi artifacts。新 Goal Session 不应复制或安装另一套 Pi，也不应依赖 Git 无法携带的旧 worktree `.runs` 相对路径。该 bridge 属于机械 runtime hydration：必须固定 Pi commit/package identity、只使用 public emitted entries、保持 Pi checkout clean，并在 Session Gate A 做 import/type-path smoke。具体 ignored 文件路径留给启动 Prompt，不写入产品架构。

### 22.4 Goal 2 accepted closeout (2026-08-08)

- Main accepted Goal 2 as `PASS_V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK`.
- Control Baseline: `f138ddd607816f266e9024291718eeab087b39f6` / tree
  `69812fb30ad7c2ee286a60d0cef35be847189d5d`.
- Candidate Baseline: `c86c6947e71f91ad3fb1262101aa092629b44eb0` / tree
  `f9a2ce17d374e357e6c6df1e5607b6b646373485`.
- Deterministic/Faux evidence proves symmetric State-only validation,
  Harness-owned Promote/Reject, immutable versions/decisions, stale rejection,
  fail-closed reopen, atomic active-pointer replacement and pointer rollback.
- Main independently passed strict TypeScript, Goal 2 6/6 and Goal 1 regression
  13/13, and verified all indexed Artifact/source hashes.
- Credential/network/Provider/model counts were 0/0/0/0. The real Goal 1
  Candidate remains `staged_inactive`; Goal 2 used only isolated ignored stores.
- No concrete authority/Promotion/active-state finding remained after Main
  review, so the Charter's risk-driven audit trigger was not met.
- `active_goal` is `null`. Goal 3, further real access and Pi or integration-route
  changes require separate user authorization.
