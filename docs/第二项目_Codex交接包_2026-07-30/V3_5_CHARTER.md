# V3.5 Version Charter — Persistent & Inspectable Adaptive Harness Workbench

```yaml
status: accepted_goal_1_closed_goal_2_closed_inconclusive_goal_2_5_pass_recommended_pending_user_acceptance
date: 2026-08-09
accepted_by_user: 2026-08-08
formalized_by_main_session: 2026-08-08
version: V3.5
project: Agent Harness Reliability Workbench
version_mission: persistent_inspectable_explainable_demonstrable_adaptive_harness
repository_baseline: 6c686f01928a44211119e75767190e221b319fe2
v3_status: closed_accepted
v3_disposition: PASS_V3_HARNESS_STATE_ADAPTATION_WITH_SINGLE_REAL_PROMPT_PATH_LIMITATION
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
active_goal: V3_5_G2_5_TERMINATION_SAFE_REAL_SKILL_CLOSURE
goal_1_status: closed_accepted
goal_1_disposition: PASS_V3_5_G1_PERSISTENT_SESSION_RUN_FOUNDATION
goal_1_implementation_owner: completed_top_level_session_019fde3d-d9c0-78b3-a5e3-0b4da427ab31
goal_1_control_baseline_commit: 745847d3f9e9579ea98a2d64c657b4c9d3ee91d1
goal_1_implementation_commit: 4122b3cb88c2e35b946e4129d5977c0fdb2c7309
goal_1_correction_commit: 0b62fb7447c76373fab1a4e26df15f29dd72dfa5
goal_2_status: closed_inconclusive
goal_2_disposition: CLOSE_V3_5_G2_INCONCLUSIVE_BASE_REQUEST_BUDGET_STOP
goal_2_5_status: execution_complete_valid_real_pair_pass_recommended_pending_user_acceptance
goal_3_status: not_activated
implementation_authorized: consumed_goal_2_5_zero_access_candidate_and_bounded_correction
real_model_calls_authorized: consumed_by_goal_2_5_replacement_observed_6
credential_reads_authorized: consumed_by_goal_2_5_replacement_observed_2
external_network_authorized: consumed_by_goal_2_5_replacement_observed_6
pi_core_patch_authorized: false
runtime_route_switch_authorized: false
git_commit_authorized: goal_2_5_control_implementation_audit_execution_and_closeout_within_contract
control_baseline_commit: 6e56a3f7e6048f74a46791af463c4e2d2f98f5b8
```

> 本 Charter 已由用户接受并正式化。Goal 1 已正式接受。Goal 2 的实现机制已冻结，但唯一真实 Pair 在 Base request budget 处停止，现以 inconclusive 收口。Goal 2.5 已在有界诊断和 Main 校准后接受并激活；初始阶段仅允许零调用实现，真实访问必须等待 Main 验收、一次聚焦审计与精确 Execution Baseline。Goal 3、V3.5 最终接受和 Pi 修改仍未授权。

## 1. Version mission

V3.5 的正式定位是：

> **Persistent & Inspectable Adaptive Harness Workbench**

它把 V3 已接受的 Adaptive Harness 机制推进为可长期使用、回顾、检查、解释和演示的 Workbench：

```text
Persist → Inspect → Explain → Demonstrate
```

V3.5 是产品化和可用性增强，不是新的 self-evolution research version。V3 保持 closed/accepted；本版本不重新设计或重新评测 V3，也不增加新的 adaptive authority。

## 2. Frozen scope and dependency order

V3.5 只包含三个顺序依赖的 Goal：

```text
Goal 1 — Persistent Session & Run Foundation
    ↓ accepted baseline
Goal 2 — One Bounded Real Adaptive Skill Closure
    ↓ accepted evidence
Goal 3 — Adaptive Harness Workbench WebUI & Demo
```

- Goal 1 建立可持续使用的 Session、Run linkage 和 Read Model。
- Goal 2 在 Goal 1 的持久基础上完成一个预先冻结的真实 adaptive Skill 对照 Case。
- Goal 3 消费稳定 Read Model 和 Goal 2 evidence，形成薄、本地、可解释的产品界面。

不得并行绕过依赖，也不得为后续 Goal 提前建设与当前 Exit Criteria 无关的平台能力。

## 3. Architecture invariants and authority boundaries

### 3.1 Session is not Run

```text
Pi JSONL Session
= resumable conversation/context authority

Workbench Run
= bounded execution/evaluation authority
```

- Pi Session 保存可用于重开和继续的 conversation/context tree。
- Workbench Run 保存 task、workspace、budget、State binding、Verifier、Outcome、counters 和 evidence。
- 一个 Session 可以关联多个 Run；一个比较或恢复组也可以使用多个 Session。
- Run 边界不得从 Session 消息位置隐式猜测，二者必须以明确 identity/linkage 关联。

### 3.2 Catalog is navigation metadata

Goal 1 可建立薄 Session↔Run catalog，保存：

```text
session identity
Pi session reference
project/workspace identity
title
created / updated time
run references
parent relationship
schema version
```

但权威顺序保持：

- Pi JSONL 是 resumable conversation truth；
- Run artifacts 是 Run/Verifier/Outcome truth；
- V3 immutable State/decision artifacts 是 adaptation truth；
- catalog/read index 只是导航和投影，不得覆盖以上 authority。

Derived catalog/index 应在合理范围内可丢弃、可重建；broken、missing、cross-project 或 mismatched identity 必须 fail closed，不能静默改写事实。

### 3.3 Runtime plane and safe read plane

```text
Runtime Plane
full local Pi JSONL Session
→ reopen / continue

Read / Evidence Plane
allowlisted safe projection
→ CLI / API / WebUI / reports
```

完整 raw Session 不得直接提供给 API 或 WebUI。Safe projection 必须继续排除：

```text
credentials
private reasoning
unsafe raw provider payloads
arbitrary raw filesystem access
```

不得用脱敏、截断的 evidence projection 代替 Runtime continuation 所需的完整 Pi Session。

### 3.4 Read Model

```text
Raw Pi Session + V0–V3 Run/Evidence + V3 State Store
        ↓
versioned source adapters + existing inspectors
        ↓
stable read contracts
        ↓
CLI / local API / WebUI
```

Read Model 必须：

- read-only，且不是新的 truth store；
- 为 material fields 保留 source reference/digest；
- 将缺失历史信息呈现为 `not_recorded` 或 `unavailable`；
- 不猜测、不破坏性迁移历史数据；
- 只覆盖 V3.5 产品和 demo 所需的当前 Session/Run、一个 V2 recovery comparison、V3 prompt adaptation、Goal 2 Skill comparison，以及旧 Run 的安全 partial fallback。

不得演化成 V0–V3 全量 schema migration project。

### 3.5 Accepted adaptive authority remains unchanged

V3.5 不重新打开或修改：

```text
Verifier authority
Promotion semantics
Hard security/resource boundary
accepted Prompt / Skill semantics
V3 State lifecycle
```

Direct public Pi `AgentHarness` 保持 Runtime 路线。Pi Extension、SDK、RPC 或 server 不得在 V3.5 中替换该基座。

## 4. Goal 1 — Persistent Session & Run Foundation

### 4.1 Goal question

> Can a public Pi JSONL Session survive a settled process restart, remain correctly linked to Workbench Runs/evidence, be safely inspected, and continue through the same Direct AgentHarness route?

### 4.2 Frozen implementation boundary

采用：

```text
public Pi JsonlSessionRepo
+ thin Workbench Session service/catalog
+ safe typed Read Model
```

不建设第二套 conversation database。

必须形成以下跨进程闭环：

```text
Process A
→ create persistent Session
→ settled AgentHarness turn
→ Tool call/result
→ linked Run
→ exit

Process B
→ list/open same Session
→ rebuild prior context
→ continue
→ create next Run
→ preserve prior + new Run linkage
```

Goal 1 只证明 `settled reopen / continue`，不证明 in-flight crash recovery、exactly-once Tool effects、distributed storage 或 multi-writer transactionality。

### 4.3 Exit Criteria

Goal 1 只有在以下条件同时满足时才可建议接受：

1. Process A 创建 public Pi JSONL Session，完成包含 Tool call/result 的 settled deterministic turn，保存关联 Run 后退出。
2. Process B 能 list/open 同一 Session，重建先前 context，并继续产生第二个 settled turn/Run。
3. Session 与前后两个 Run 的双向 linkage 可检查，且不会混淆 conversation 与 evaluation authority。
4. CLI/service 可输出安全 conversation、Tool、Run history projection，不暴露凭据、private reasoning、任意路径或不安全 raw payload。
5. corrupt、missing、cross-project、workspace mismatch 和 path escape 必须 fail closed。
6. 所需 V0–V3 focused regressions 通过；旧 evidence 缺失时明确显示 unavailable，不伪造兼容性。
7. external Provider/model calls、credential reads 和 network access 均为 0。
8. Pi Core patch 和 private import 均为 0，Direct public `AgentHarness` 路线保持不变。

## 5. Goal 2 — One Bounded Real Adaptive Skill Closure

### 5.1 Preconditions and question

Goal 2 只在 Goal 1 正式接受后启动。它回答：

> Can one accepted historical adaptive Skill be explicitly selected in an isolated case-owned State authority and evaluated on one pre-frozen, related held-out task through the real Direct Pi/model path with fair, persistent evidence?

V3 deterministic adaptive Skill 是 accepted historical State；最终 global active pointer 已 rollback 到 prompt-only State。因此：

- Goal 2 不得把该 Skill 描述为当前 global active State；
- 必须通过 isolated case-owned State authority 显式选择它；
- 不得修改 closed V3 的 global active pointer。

### 5.2 Deferred short Case Contract

Charter 不冻结 exact fixture、task text、model/provider budget 或 efficiency metrics。Goal 1 接受后，应由 Main 与用户审查一份短 Case Contract，至少冻结：

```text
task source
workspace digest
task prompt
model/provider profile
Tools and budgets
Verifier source/digest
allowed Skill content
answer-leakage check
comparison metrics
stop rule
```

Case 应是一个新的、小型、易理解、install-free、deterministic、低环境噪声的本地 TypeScript maintenance task。不得默认引入大型 benchmark。

### 5.3 Fairness invariant

```text
same task
same workspace baseline
same provider/model
same Tools
same budgets
same Verifier
same stop semantics
fresh persistent Sessions

only treatment delta = adaptive Skill binding
```

真实 dispatch 前一次性冻结 Case。只执行 one Base + one Candidate；不得 Case hunting、outcome-driven replacement 或为了让 Skill 获胜而增加路径。Skill win 不是 Goal completion requirement。

### 5.4 Exit Criteria

1. 短 Case Contract 在任何真实 dispatch 前被用户接受并冻结。
2. Skill 内容通过 answer-leakage 检查，仅提供 reusable procedure。
3. Base/Candidate 从 byte-identical workspace baseline 和 fresh persistent Sessions 开始，除 Skill binding 外 treatment identity 相同。
4. 两臂均通过真实 Direct Pi/model 路线执行，且遵守冻结 budget/stop rule。
5. Session、Run、Verifier、Outcome、comparison 和 State/binding evidence 完整持久化并可检查。
6. 无论 Skill 胜、平或负，都按预先冻结规则接受 observed result，不更换 Case。
7. V3 authority、closed global State 和 Pi 均未被修改。

## 6. Goal 3 — Adaptive Harness Workbench WebUI & Demo

> 当前依赖状态：Goal 2 没有形成有效 Base/Candidate evidence，因此本节的启动前提尚未满足。Goal 2.5 已获独立 Contract/Activation，将尝试补足该证据；在其真实结果由 Main 和用户处置前，本节仍不得启动。

### 6.1 Preconditions and architecture

Goal 3 在 Goal 1 接受且 Goal 2 evidence 已冻结后启动：

```text
Browser
→ loopback-only thin local API
→ Workbench application/read services
→ existing Run / Session / Verifier / State controllers
→ public Direct Pi AgentHarness
```

第一版优先 `post-run inspectability > realtime streaming`。实时 token/Tool streaming 不是 Exit Criterion。

Frontend technology 不在 Charter 中写死。Goal 3 Session 应依据 clarity、small dependency surface、maintainability、easy-to-learn structure 和 no Runtime replacement 选择轻量实现。

### 6.2 Required product capability

WebUI 至少提供：

```text
Persistent Session sidebar
Session reopen / continue
safe conversation / Tool history
Run / Verifier / Outcome
V2 recovery comparison
V3 Base/Candidate comparison
Adaptation lineage
Prompt / Skill diff
State/version history
selective binding explanation
guarded rollback
```

Adaptation view 必须能从现有证据回答：为什么改变、什么 evidence 触发、诊断与 Lesson 是什么、提出了什么 Prompt/Skill、如何验证、为何 Promote/Reject、哪个 State 激活、哪些后续 Run 使用，以及为何发生 binding。

### 6.3 UI authority boundary

UI 可以：

- 读取 allowlisted safe projections；
- create/open/continue Session；
- 提交 bounded task；
- 检查 Run、Trace/Evidence、Verifier/Outcome 和 State；
- 通过 existing guarded Harness controller 调用 rollback，并提供 expected-active identity。

UI 不可以：

- 直接编辑 Prompt/Skill 文件、active pointer、Verifier、Promotion rule 或 hard budget/security authority；
- 读取任意 filesystem path 或接收凭据；
- 直接写 State 文件；
- 切换 Runtime、使用 Pi Extension/RPC/server 作为新基座或修改 Pi Core。

### 6.4 Exit Criteria

1. 用户能通过 UI 列出、打开、回顾并继续 persistent Session。
2. safe conversation/Tool history 和 Session↔Run history 可用，无 unsafe raw exposure。
3. Run、Verifier、Outcome 和 source references/digests 可检查。
4. V2 recovery 与 V3 Base/Candidate comparison 可见，浏览器不重新定义比较语义。
5. adaptation lineage、Prompt/Skill diff、State/version history 和 selective binding 原因可以端到端解释。
6. rollback 如暴露，只能经过 guarded controller 和 expected-active identity check。
7. post-run inspection 与可复现 demo 完成；realtime streaming 不作为完成条件。
8. Direct Pi Runtime、V3 authority 和安全边界保持不变。

## 7. Non-goals

V3.5 不建设：

```text
Semantic Memory
Vector DB
Cross-session semantic retrieval
Experience Repository
LLM Router
Curator
Runtime Policy optimizer
Automatic publishing
Long-term autonomous continual evolution
Database migration platform
Distributed state
Multi-user platform
Remote machine manager
Full IDE
Terminal emulator
Pi feature parity
Realtime streaming as acceptance criterion
```

完整 Architecture、最终 README 和 Interview consolidation 在 V3.5 code/evidence freeze 后另行处理，不属于三个 Goal 的实施范围。

## 8. Implementation governance

### 8.1 Roles

```text
Main Session
= Charter / scope / activation / baseline / acceptance authority

Goal 1 Session
= persistent foundation implementation

Goal 2 Session
= bounded real Skill Case implementation/execution

Goal 3 Session
= WebUI/demo implementation
```

每个 Goal 使用一个新的 top-level Implementation Session。不得以 Main Session 或当前子 Agent 静默替代已声明 owner。

### 8.2 Default Goal flow

在该 Goal 获得用户明确激活和 commit authority 后，Implementation Session 默认执行：

```text
read Charter and launch scope
→ inspect relevant source
→ implement
→ focused tests
→ fix ordinary bounded bugs
→ create bounded Goal commit
→ short completion report
→ stop for Main review
```

Main Session 负责核验 commit/evidence、判断是否满足 Exit Criteria、更新控制状态并请求或记录用户最终接受。

默认不新增 Formal Goal Contract、Independent Audit、Readiness Gate、R1/R2、Replacement Run 或 large stage hierarchy。只有具体风险证据或 Hard Stop 才提升治理复杂度。Goal 2 的短 Case Contract 是唯一预期的额外冻结材料。

普通 TypeScript、serialization、path、HTTP、CSS、UI、catalog、polling、fixture 和 focused-test 问题由原 Implementation Session 作为正常工程缺陷修复，不自动返回 Main 或创建新 Session。

## 9. Hard stops

只有出现以下情况才停止 Goal 并返回 Main/user：

1. public Pi Session 无法在不 patch Pi/private import 的情况下支持所需 settled continuation；
2. safe projection 无法与 resumable raw Session 分离；
3. persistence integration 必须改变 V3 authority semantics；
4. Session↔Run 无法关联，除非让 derived catalog 成为新 authority；
5. Goal 2 必须依赖 answer leakage、Case hunting、额外 treatment path 或新 Eval Runtime；
6. WebUI 必须切换 Runtime，或必须暴露任意 filesystem/credential/unsafe raw payload；
7. 新发现的明确 correctness defect 与 accepted V3 claim 冲突。

不得把普通实现缺陷升级为 Hard Stop。

## 10. Claims boundary

V3.5 完成后，在证据支持范围内可以声称：

- settled Pi Session 可跨进程重开、检查并继续，且与 Workbench Runs/evidence 正确关联；
- Adaptive Harness 的 Run、comparison、State lifecycle 和 selective binding 可通过安全 Read Model 检查和解释；
- 一个预先冻结的真实 adaptive Skill Base/Candidate Case 已按观察结果完成；
- 本地 Workbench UI 能演示 persistent use 与 evidence-grounded adaptation。

不得声称：

- in-flight crash recovery、exactly-once Tool side effects、distributed/multi-writer durability；
- adaptive Skill 普遍优于 Base；
- continual self-evolution、semantic memory、自动路由或生产级多用户平台；
- V3.5 WebUI 是完整 Pi IDE 或替代 Pi Runtime。

## 11. Current control state after Goal 2.5 Main zero-access review

```yaml
active_goal: V3_5_G2_5_TERMINATION_SAFE_REAL_SKILL_CLOSURE
goal_1_status: closed_accepted
goal_1_disposition: PASS_V3_5_G1_PERSISTENT_SESSION_RUN_FOUNDATION
goal_1_control_baseline_commit: 745847d3f9e9579ea98a2d64c657b4c9d3ee91d1
goal_1_implementation_commit: 4122b3cb88c2e35b946e4129d5977c0fdb2c7309
goal_1_correction_commit: 0b62fb7447c76373fab1a4e26df15f29dd72dfa5
goal_2_status: closed_inconclusive
goal_2_disposition: CLOSE_V3_5_G2_INCONCLUSIVE_BASE_REQUEST_BUDGET_STOP
goal_2_execution_baseline_commit: ed2dc14e695233411f96af162d92b405188b04cf
goal_2_5_contract: accepted_activated
goal_2_5_status: execution_complete_valid_real_pair_pass_recommended_pending_user_acceptance
goal_2_5_control_baseline_commit: 6e56a3f7e6048f74a46791af463c4e2d2f98f5b8
goal_2_5_zero_access_candidate_commit: e852f90fa49ae9320896b91338bfb966e328cf98
goal_2_5_zero_access_correction_commit: 6c5ccf7fbc76c5bc51355e707b7eabb194974b19
goal_2_5_zero_access_implementation_authorized: consumed
goal_2_5_main_review: passed_after_one_bounded_correction
goal_2_5_focused_audit_authorized: consumed_revise_two_findings
goal_2_5_focused_audit_baseline: e174808550211f2236c3a5c08a350a45d1bcab48
goal_2_5_focused_audit_disposition: REVISE_V3_5_G2_5_FOCUSED_AUDIT
goal_2_5_focused_audit_correction_commit: 2df7da60a365ea2de5ca80e8ada1b59048779117
goal_2_5_focused_audit_hit_recheck: completed_pass_same_audit_session
goal_2_5_focused_audit_final_disposition: PASS_V3_5_G2_5_FOCUSED_AUDIT_AFTER_HIT_RECHECK
goal_2_5_execution_baseline_commit: 12c64739eb0b1db715def18800c28ea728f31610
goal_2_5_real_execution_session: 019fe370-1abb-7923-a41a-922d975d0a32
goal_2_5_real_pair_authorized: consumed_once_pre_arm_no_replacement_authorized
goal_2_5_real_pair_status: consumed_pre_arm_workspace_parent_enoent_pending_user_decision
goal_2_5_real_pair_report: docs/reports/V3_5_G2_5_REAL_PAIR_EXECUTION_REPORT.md
goal_2_5_main_disposition_report: docs/reports/V3_5_G2_5_MAIN_DISPOSITION_REPORT.md
goal_2_5_pre_dispatch_amendment: docs/第二项目_Codex交接包_2026-07-30/V3_5_G2_5_PRE_DISPATCH_INFRASTRUCTURE_AMENDMENT.md
goal_2_5_correction_control_baseline: 9a0f38301bebb5934b34909f8c012a1c84c2d0af
goal_2_5_pre_dispatch_correction_commit: 6d3f4601ca47c57473bb737eb88e08a471f7d60e
goal_2_5_pre_dispatch_correction_main_review: PASS_V3_5_G2_5_PRE_DISPATCH_INFRASTRUCTURE_CORRECTION
goal_2_5_corrected_execution_baseline: 91fb8be73f809a67bedf58efcf520914ce93f737
goal_2_5_replacement_execution_session: 019fe38f-7c3d-7a02-92c3-0f7eef53196f
goal_2_5_replacement_pair_status: consumed_once_successfully
goal_2_5_comparison_digest: 243d1c476385333d297bff296b69d9dd5d7be87ea041b25c974cc5dc7a7d920f
goal_2_5_main_recommendation: PASS_V3_5_G2_5_VALID_REAL_PAIR_NO_SKILL_ADVANTAGE_OBSERVED
goal_2_5_acceptance: pending_user_decision
goal_2_5_replacement_pair_authorized: consumed_once_successfully_no_further_execution
goal_2_5_pair_cost_usd_hard_cap: 0.40
goal_3_authorized: false
v3_5_final_acceptance_authorized: false
```

Goal 1 的接受证据见 `docs/reports/V3_5_G1_CLOSEOUT.md`。其结论只覆盖 settled、
deterministic/Faux 的跨进程 Session reopen/continue、Session↔Run linkage 和安全 Read
Model；不覆盖 in-flight crash recovery、exactly-once Tool effects、自动 catalog rebuild、
多写者事务或真实模型 continuation。

Goal 2 已按 `CLOSE_V3_5_G2_INCONCLUSIVE_BASE_REQUEST_BUDGET_STOP` 关闭；其 invalid
pair 必须保留且不得重标。Goal 2.5 的新 Contract 已接受并激活。Main 必须先创建干净
Control Baseline 并启动一个新的顶层零访问 Implementation Session；真实
Credential/network/model authority 只有在零调用实现通过 Main 验收、一次窄范围独立审计并
冻结精确 audited Execution Baseline 后，才可用于一次 Base-first/Candidate Pair。Goal 3 与
V3.5 最终接受仍须另行授权。
