# 第二项目_V3.6_工程稳定化长程测试计划

```yaml
document_type: engineering_stabilization_campaign_plan
project: 第二项目
target: V3.6_Post_Closeout_Engineering_Stabilization
status_at_creation: planned_not_started
new_version: false
v3_6_reopened: false
architecture_change_authorized: false
formal_eval: false
benchmark: false
primary_mode: natural_workload_first
test_session_can_modify_product: false
main_can_make_bounded_maintenance: true
user_approval_required_for_scope_decisions: true
human_ui_ux_acceptance_in_scope: false
final_product_judgment_owner: user
```

---

# 0. 文档目的

本文件用于把 V3.6 在正式 Closeout 之后的真实工程测试，组织成一个：

> **Engineering Stabilization Campaign（工程稳定化长程测试阶段）**

它不是无限运行的测试器，也不是自动修复系统。

核心目标是：

```text
真实 Coding Workload
→ 自然执行
→ 保留完整 Evidence
→ 自然 Failure 出现时冻结现场
→ Detection / Evidence 优先分析
→ Main 做有界分类和维护决策
→ 必要时修复与 Regression
→ 必要时单独 Retest
→ 收敛并停止
```

本阶段最终需要回答的不是：

> “V3.6 每个 Feature 是否都能被演示一次？”

而是：

> **V3.6 在若干真实、合理、中等复杂度 Coding Task 下，是否已经具备足够稳定的执行、停止、证据、Source Authority 和 Failure 解释能力，可以停止底层 Feature Development，并进入最终 Failure Case 整理与 Human UI/UX Polish。**

---

# 1. 当前权威 Baseline

本 Campaign 启动前，以下状态视为既有事实，不重新证明。

## 1.1 V3.6 状态

```yaml
V3_6: closed_accepted
Pi_Core_patch: 0
active_goal: null
V4: not_started_not_authorized
```

V3.6 的核心产品路径已经存在：

```text
Registered Source
→ Host-owned Project Profile
→ New / Persistent Pi Session
→ managed_session_copy
→ free-text Coding Task
→ Direct Pi AgentHarness
→ registered command in bounded Docker backend
→ immutable Trace / Evidence
→ Changes / Diff
→ Apply / Discard / Export
→ Host-controlled Source mutation
```

已有 Authority 原则继续有效：

> **Agent proposes; Harness disposes.**

Agent、Browser、Docker 都不能直接拥有 Registered Source mutation authority。

## 1.2 当前 Daily Bounded-Edit Budget Baseline

当前 daily profile 为：

```yaml
profile_id: v36_daily_bounded_edit_v2
provider_requests_observation_threshold: 16
provider_requests_hard_max: 24
tool_calls_hard_max: 24
combined_tokens_hard_max: 131072
cost_usd_hard_max: 0.20
wall_time_ms_hard_max: 900000
retry_fallback_replacement: 0_0_0
```

重要：

- `16` 是 observation threshold，不是自动继续或 retry 权限；
- Provider request、Tool、Token、Cost、Wall-time 是相互独立的有限边界；
- 不得因为最近撞到某一维，就默认提高该维上限；
- Budget value 的任何进一步调整，都属于显式 Decision Required，除非 Main 能证明只是已有配置错误而非策略调整。

## 1.3 Finite-Budget Terminalization Baseline

当前已支持：

```text
FiniteBudgetTerminal
├─ provider_request_stop
├─ combined_token_stop
├─ cost_stop
├─ simultaneous_token_cost_stop
├─ tool_call_stop
└─ clean_boundary_wall_time_stop
```

可信 terminal 只能在所有适用条件可被 reconcile 时建立，例如：

```yaml
usage_known: true
pending_provider_reservations: 0
pending_tool_calls: 0
pending_side_effects: 0
session_identity_reconciled: true
workspace_identity_reconciled: true
command_evidence_reconciled: true
```

以下情况目前不应被伪装成安全 finite-budget terminal：

- arbitrary in-flight crash；
- unknown usage；
- response loss；
- uncertain side effect；
- 无法证明 quiescence 的 timeout / interruption。

这些可以成为未来 Boundary Case，但不自动形成新的架构开发任务。

---

# 2. 已有真实 UX / Engineering Evidence

已有两次自然 Attempt 必须作为 Campaign 历史 Evidence 保留，不得改写。

## 2.1 Attempt 1

自然中等 Coding Task：

- Agent 仍在有效 test-and-correct trajectory；
- 第 14 次左右运行测试；
- 第 15–16 次继续读取失败并修正；
- 第 17 次 Provider request 在 dispatch 前被原 16-request hard cap 阻止。

它自然暴露：

1. 原 16-request daily hard cap 偏紧；
2. Provider-request budget stop 缺少安全、可解释的产品 terminalization。

后续已完成：

- Provider-request budget terminalization maintenance；
- request daily profile 从 16 hard 改为 16 observation / 24 hard。

Attempt 1 本身保持 immutable historical evidence。

## 2.2 Attempt 2

相同自然 Coding Task 的 post-maintenance retest：

```yaml
successful_provider_responses: 19
tool_results: 24
combined_tokens: 142918
combined_tokens_hard_max: 131072
docker_test_runs: 2
latest_docker_test_result: PASS
registered_source_changed: false
```

它证明：

- Provider-request adequacy maintenance 在其原 scope 内生效；
- Agent 越过旧 16-response boundary；
- 新自然 Finding 是 Token stop 没有进入统一 typed / persistent / inspectable terminal path；
- Tool 同时已经达到 24/24；
- 两次 registered Docker tests 都 PASS，但 overall Turn 并未 settled，因此不能把 command PASS 提升成 Run PASS。

后续已完成：

> `POST_V3_6_FINITE_BUDGET_TERMINALIZATION_MAINTENANCE`

并保持：

- 不提高任何 budget value；
- 不运行真实 Attempt 3；
- 不 rewrite Attempt 2；
- 不自动 retry / resume / replace / continue。

---

# 3. Campaign 不是做什么

本阶段明确不是：

- 新版本开发；
- V4；
- V3.6 architecture reopening；
- 模型 Coding Benchmark；
- 正式统计 Eval；
- 为了“证明 Feature”而构造 Demo Case；
- 为了触发 Retry / Branch / Recovery 而预埋失败；
- 追求所有任务最终都成功；
- 追求每种 Failure 类型都必须覆盖；
- UI 重设计阶段；
- 无限 bug hunting；
- 自动提高 Budget 的调参循环；
- 自动化自修 Harness 系统。

本阶段允许出现失败。

本阶段允许某些 Finding 最终被接受为 Limitation。

本阶段允许 Harness 正确地选择：

```text
STOP / FAIL CLOSED
```

而不是 Recovery。

---

# 4. 核心原则

## 4.1 Natural Workload First

优先使用：

> **真实、合理、开发者确实可能提交给 Coding Agent 的任务。**

不允许先决定：

```text
“我要展示 Branch”
```

再倒推一个必然失败的任务。

不允许：

```text
“我要展示 Retry”
```

所以故意让首次路径失败。

任务可以自然成功，也可以自然失败。

**正常成功同样是有效 Evidence。**

## 4.2 Detection / Evidence Before Recovery

Failure 出现后，第一问题不是：

> “怎么让它继续成功？”

而是：

```text
1. 具体在哪里失败？
2. 谁 Detection？
3. Detection 使用什么 Evidence？
4. Evidence 是否独立于 Agent 自我声明？
5. Harness 当前认为什么状态？
6. Harness 当前 Response 是否安全和诚实？
```

只有回答完以上问题，才允许讨论：

```text
Retry
Alternative Path
Recovery
Reject
Discard
Stop
Fail Closed
```

## 4.3 External Evidence Over Agent Self-Report

Evidence 优先级原则：

```text
Test / Verifier Result
Exit Code
File / Diff / Environment State
Authenticated Session / Run Evidence
Artifact
Raw Tool Response
Docker Command Evidence
Harness Trace
──────────────────────────────
Agent 自我解释 / “我完成了”
```

Agent summary 可用于帮助理解，但不能单独承担 authority。

## 4.4 STOP 是一等正确结果

本项目不假设：

```text
Failure → Retry
```

正确 Response 可能是：

```text
Failure
├─ Continue
├─ Retry
├─ Alternative Path
├─ Recovery
├─ Reject
├─ Quarantine / Preserve
└─ Stop / Fail Closed
```

若 Evidence 不足、Authority 不允许、side effect 不确定或 State 无法 reconcile：

> **停止通常比继续更可靠。**

## 4.5 Before-Fix Evidence Immutable

任何被发现的真实 Failure 都必须保留原始 Evidence。

禁止：

```text
Failure
→ 修复
→ 删除 / 覆盖原始 Trace
→ 只留下最终成功
```

正确关系：

```text
Before-Fix Attempt
→ immutable evidence

Maintenance
→ independent change

Post-Maintenance Retest
→ new evidence
```

两者不能互相覆盖或重写。

## 4.6 No Result Hunting

禁止：

- 同一个失败 Case 反复改参数直到“跑过”；
- 看到 request 撞顶就自动提高 request；
- 再撞 Token 就提高 Token；
- 再撞 Tool 就提高 Tool；
- 换更容易 Case 伪装成修复有效；
- 通过多次 Replacement Run 挑一个成功结果。

如果对同一自然 Case 做 maintenance 后 retest：

> 必须明确标记为 post-maintenance retest，并保留前一次失败。

---

# 5. 角色与权限

## 5.1 Test Session

角色：

> **Engineering Test Runner + Evidence Reviewer**

Test Session 可以自主：

- 创建 V3.6 Product Session；
- 使用已冻结 Registered Project / Host Profile；
- 提交 Campaign 允许的自然 Coding Task；
- 等待 Agent 执行；
- 检查 Run / Session；
- 检查 Workspace；
- 检查 Changes / Diff；
- 检查 registered Docker command；
- 检查 Trace / Evidence；
- 检查 budget accounting；
- 检查 terminal；
- 检查 registered Source 是否保持 Authority；
- 形成 Finding；
- 做只读 Root Cause / Evidence Review；
- 形成 Main Handoff；
- 在 Main 明确 Closeout + 授权后做 post-maintenance retest。

Test Session 不可以：

- 修改 V3.6 产品代码；
- 修改 Harness architecture；
- 调 Budget；
- 修改 Pi；
- 修改 Authority；
- 决定自动 Retry / Continue；
- 在 Finding 尚未分类时偷偷“帮系统修好”；
- 覆盖 Before-Fix Evidence；
- 为了得到成功结果换 Case。

测试 fixture/setup 的明显独立 bug 可以修复，但必须：

```text
记录 setup failure
→ 修 fixture
→ 建立新的 clean baseline
→ 再开始正式 Case
```

## 5.2 Main Session

角色：

> **Campaign Owner + Maintenance Decision Authority**

Main 负责：

- 维护 Campaign baseline；
- 接收 Test Session Findings；
- 判断 Failure 类型；
- 判断是否需要 maintenance；
- 对明确的小型 bounded maintenance 自主决策和 Closeout；
- 必要时建立 Contract；
- 组织 implementation / deterministic regression / focused audit；
- 明确授权 Test Session 是否可以 retest；
- 维护 Campaign status；
- 到 Stop Condition 时关闭 Campaign。

Main 不应：

- 把每个失败都转化为开发需求；
- 把 Test Session 变成自动修复器；
- 因同一个 Case 失败而不断提高权限；
- 偷偷启动 V4；
- 为了补齐简历故事强行做新 Feature。

## 5.3 User

User 是最终 Scope 和 Product Judgment Authority。

必须返回 User 的事项见后文 `Decision Required Gate`。

Engineering Stabilization 期间：

> User 不需要持续人工盯 Agent 每一次 Tool Call。

工程运行、Evidence Review 和低风险维护可以由 Test/Main 闭环承担。

Human UI/UX Acceptance 不属于本阶段，后续单独执行。

---

# 6. 测试 Workload 设计

## 6.1 继续使用 Mini RPG Rules Engine

当前 Mini RPG Rules Engine 可以继续作为主要真实 Workload Fixture。

原因：

- 规则容易理解；
- 多模块；
- 有自然 State Transition；
- 有测试；
- 不依赖网络；
- 适合 Docker；
- 修改有明确业务语义；
- 不需要为测试 Harness 理解大型第三方工程。

保持：

```text
Registered Source
→ Harness-created managed Workspace
```

不得让 Agent 直接编辑 Source。

## 6.2 Campaign 推荐 Natural Task 数量

建议：

> **4–6 个差异化自然 Coding Task**

不是硬性统计目标。

如果在更少任务后已经达到 Stop Condition，可以提前结束。

如果第 4–6 个任务仍不断出现新的 blocker-class Harness correctness issue，可以暂停 Campaign，而不是无限增加 Case 数量。

## 6.3 Natural Task 类型

建议覆盖不同开发形态，而不是覆盖 Harness Feature：

### A. Feature Addition

例如：

- 新增状态效果；
- 新增一项 Item 行为；
- 新增 Quest 条件。

### B. Bug Fix

例如：

- 某状态转换边界错误；
- 满血时消耗治疗药；
- cooldown 负数。

### C. Cross-Module Behavior Change

需要理解并修改 2–4 个模块。

### D. Regression Fix

基于已有测试或自然行为缺陷做小修。

### E. Refactor With Preserved Behavior

要求小范围重构且必须保持测试通过。

### F. Open-Ended Inspection

例如：

> 阅读当前项目，找一个明确真实的边界条件或状态转换问题，做最小修复并运行测试。

---

# 7. Natural Task 选择纪律

Test Session 选择任务时必须满足：

- 开发者可能真实提出；
- 不预设 Agent 一定失败；
- 不故意隐藏标准答案；
- 不为了触发 Retry/Branch/Recovery；
- 不需要外部网络；
- 不需要大型框架；
- 不把测试变成模型能力极限赛；
- 预计熟练开发者 10–30 分钟左右可理解完成；
- 一般涉及 2–4 个文件理解，1–3 个文件修改；
- 不要求“一次模型 response 完成”。

---

# 8. 每个 Case 的执行协议

```text
Freeze Task
↓
Freeze Source / Profile / Budget / Registered Commands
↓
Create New Product Session
↓
Dispatch Natural Coding Task
↓
Agent Executes
↓
Observe without intervention
↓
Terminal / Settled
↓
Evidence Review
```

如果正常完成：

```text
record completion
→ verify Evidence coherence
→ verify Source authority
→ continue
```

如果 Failure：

```text
freeze
→ no retry
→ no replacement
→ no parameter change
→ Evidence Review
→ classify
→ Main Handoff
```

---

# 9. 正常成功 Case 也要记录什么

正常完成不是“没有信息”。

轻量记录：

```yaml
task:
session_id:
run_id:
provider_requests:
tool_calls:
combined_tokens:
registered_commands:
terminal_status:
workspace_changes:
source_action:
source_authority_preserved:
notable_observation:
```

重点观察：

- 是否自然 settled；
- Evidence 是否完整；
- Docker command 是否与 UI/Trace 一致；
- Diff 是否对应真实 Workspace；
- Source 是否只通过 Host action 修改；
- 没有 silent retry/fallback/replacement；
- budget headroom 是否明显异常。

不要因为正常成功就进行额外 Fault Injection。

---

# 10. Failure 一级记录模板

每个自然 Failure 先做轻量记录：

```markdown
## Finding <ID>

### Task
<原始任务>

### Observed Behavior
<发生了什么>

### Detection
<谁检测到 Failure>

### Key Evidence
- ...
- ...

### Harness Response
<Stop / Terminal / Retry / Alternative / Reject / Other>

### Source / Workspace State
- Workspace:
- Registered Source:

### Classification
<见 Finding Taxonomy>

### Immediate Disposition
- continue
- handoff_main
- accepted_limitation
- decision_required

### Before-Fix Evidence
<不可变 artifact / trace / run refs>
```

---

# 11. Finding Taxonomy

## F1 — Harness Correctness Bug

例如：

- Trace 与真实执行不一致；
- Evidence identity 错；
- Apply authority 漏洞；
- Source 被错误修改；
- terminal 状态错误；
- settled / unverified 语义错误；
- deterministic regression。

通常 maintenance-worthy。

## F2 — Failure Inspectability / Terminalization Gap

例如：

- 系统知道失败但产品只显示 generic error；
- 保留了 Workspace 但用户/Inspector 无法判断状态；
- 已知 stop 没有可信 terminal。

通常 maintenance-worthy，但不能为了可视化伪造 Evidence。

## F3 — Budget Adequacy Question

例如：

- Agent 健康收敛但反复被某有限 budget 截断。

必须先判断：

```text
budget genuinely too tight?
agent trajectory inefficient?
completion behavior inefficient?
another independent cap?
expected bounded stop?
```

禁止直接调参。

默认：

> **Decision Required。**

## F4 — Agent / Model Inefficiency

例如：

- 重复读同一文件；
- 细粒度编辑过多；
- 测试通过后仍持续无效探索；
- 反复修改同一逻辑。

除非 Harness 应有机制能明确阻止，否则不自动算 Harness bug。

记录 Evidence。

## F5 — Tool / Environment Failure

例如：

- Docker command failure；
- timeout；
- Tool error；
- fixture/package 环境问题。

需要区分：

```text
Tool correctly failed
vs
Harness mishandled Tool failure
```

## F6 — Session / State / Workspace Failure

例如：

- Session reopen mismatch；
- Workspace lineage 不一致；
- stale state；
- State binding drift。

若违反既有 Contract，通常 maintenance-worthy。

## F7 — False Completion

定义：

> Agent 声称完成，但 Test / Verifier / Diff / Environment Evidence 证明并未完成。

这是高价值 Failure 类型。

需要特别记录：

```text
Agent claim
vs
external evidence
vs
Harness response
```

## F8 — Recovery / Alternative Path Case

仅自然发生时记录。

必须回答：

- First Path 为什么失败；
- 谁检测；
- 什么 Evidence 触发 Alternative；
- 第二路径是否真的不同；
- 为什么最终认为新路径更好；
- Outcome 是否有外部证据。

禁止为了得到该 Case 而人工构造第一路径失败。

## F9 — Correct Stop / Fail-Closed Case

例如：

- Evidence 无法 reconcile；
- uncertain side effect；
- authority mismatch；
- tampered evidence；
- unsupported crash boundary。

这种 Case 即使没有 Recovery，也可能是优秀 Reliability Evidence。

## F10 — Expected Limitation

符合现有冻结边界：

- arbitrary shell 不支持；
- general IDE 不支持；
- auto rollback 不支持；
- arbitrary crash recovery 不支持；
- unknown side-effect recovery 不支持。

记录即可，不修。

## F11 — New Feature / Architecture Request

例如：

- Terminal；
- Git GUI；
- multi-backend；
- generic sandbox platform；
- full IDE；
- general workflow engine；
- durable distributed recovery。

全部：

```text
defer
```

本 Campaign 不扩大。

---

# 12. Main Maintenance Gate

## 12.1 Main 可自主处理：Bounded Maintenance

仅当问题满足：

- 明确属于已有 V3.6 Contract / accepted semantics；
- Root Cause 清楚；
- 修复范围小；
- 不改变 Architecture；
- 不改变用户授权边界；
- 不提高真实模型权限；
- 不增加自动自治；
- 可以 deterministic regression；
- 不需要重新定义 Version Question。

例如：

- 明确 correctness bug；
- Evidence projection bug；
- tamper check bug；
- known terminal path bug；
- UI 将 `unverified` 错显示为 PASS；
- deterministic regression。

流程：

```text
Finding
→ bounded Contract
→ Implementation
→ deterministic regression
→ focused audit if justified
→ Closeout
→ explicit retest authorization
```

## 12.2 Decision Required Gate

出现以下任一条件：

> **Main 必须 STOP，并通知 User。**

包括但不限于：

1. 调整 Provider request hard max；
2. 调整 Tool hard max；
3. 调整 Token hard max；
4. 调整 Cost hard max；
5. 调整 Wall-time hard max；
6. 改 completion policy；
7. 改 Agent Loop；
8. automatic continuation；
9. automatic retry；
10. fallback / replacement；
11. 改 Recovery / Branch policy；
12. 改 Session terminal semantics 的核心 Authority；
13. 改 State publication semantics；
14. 改 Source Apply authority；
15. Pi Core patch；
16. 新 execution backend；
17. 新 sandbox architecture；
18. 需要处理 uncertain side effect；
19. 需要 general crash recovery；
20. 同一 Finding 已做一次 maintenance 仍自然重复；
21. Main 对“bug / limitation / agent inefficiency”分类没有把握；
22. 修复预计演化为多阶段项目；
23. 明显增加成本、实现时间或面试叙事范围；
24. 任何可能形成 V4 的事项。

Main 应生成：

```text
DECISION_REQUIRED
```

说明：

```text
Observed evidence
Root cause confidence
Why current boundary is insufficient
Options
Smallest safe option
Risks
What remains if deferred
```

等待 User 决策。

---

# 13. Retest 规则

Retest 不是 Retry。

只有：

```text
Main maintenance closed
+
explicit retest authorization
```

后，Test Session 才可 retest。

## 13.1 同 Case Retest

如果 maintenance 与某个 Failure 直接相关，可以保留：

```text
same task
same source baseline
same registered commands
same general profile
```

但必须记录：

```text
Attempt N = before fix
Attempt N+1 = post-maintenance retest
```

不允许抹掉前一次失败。

## 13.2 不要求 Retest 必须 PASS

Retest 可以：

- PASS；
- 暴露新的独立 Finding；
- 命中 Expected Limitation；
- 触发 Decision Required。

不能为了得到 PASS 继续调整参数。

---

# 14. Budget 特别治理

Budget 是当前最需要防止“串行追 cap”的区域。

每次 budget-related Finding 必须先回答：

```text
1. Agent 是否仍在健康推进？
2. 是否存在重复、打转或无效 Tool 使用？
3. 是否已经得到 passing command evidence？
4. 是否只是 final completion / summary 阶段被截断？
5. 哪个 budget dimension 首先真正 exceed？
6. 其他 dimension 是否也接近 hard max？
7. 当前 stop 是否被正确 terminalize？
8. Cost 是否真的构成问题？
9. Token/context growth 是否已经异常？
10. 如果提高该 cap，最可能下一个撞到什么？
```

只有这些问题回答后，才允许 Main 提出 budget adjustment 给 User。

禁止：

```text
hit X → raise X
```

---

# 15. Fault Injection 策略

## 15.1 顺序

```text
Natural Workload
↓
Natural Failure Discovery
↓
Engineering Stabilization
↓
如有必要
Targeted Fault Injection
```

Fault Injection 不得抢在 Natural Workload 前面。

## 15.2 数量

建议：

> **0–2 个**

不是硬性要求。

如果自然 Failure 已经覆盖足够 Reliability 信息，可以完全不做。

## 15.3 适合 Fault Injection 的对象

只有那些：

- 现实中重要；
- 自然出现概率低；
- 已有 Harness 机制值得验证；
- 不需要新架构；

例如：

- registered command deterministic failure；
- Docker timeout；
- stale Source conflict；
- tampered terminal / evidence；
- clean-boundary Tool failure。

## 15.4 不适合作为 Fault Injection 理由

不要为了展示：

- Retry；
- Branch；
- Recovery；
- self-repair；

而故意让 Agent 首次实现失败。

这些机制只有自然出现或有明确 isolated reliability question 时才测试。

---

# 16. Failure Case Curation 与 Stabilization 分离

Engineering Stabilization 阶段：

> 只做真实测试和 Evidence 记录。

不要每个 Finding 都包装成“面试故事”。

Campaign 接近关闭时，再进入：

> **Reliability Case Curation**

---

# 17. 最终高价值 Case 筛选标准

一个 Case 值得保留，最好能回答：

1. **Failure 是否真实、明确、可观察？**
2. **谁 Detection？**
3. **Evidence 是否独立于 Agent 自我声明？**
4. **Harness Response 是否有意义且符合 Authority？**
5. **Outcome / Stop 为什么可信？**
6. **它说明哪个 Harness Principle？**
7. **它暴露了什么 Limitation？**

不是越戏剧化越好。

---

# 18. 高价值 Case 完整结构

只有最终入选 Case 才升级成：

```text
Task
↓
Failure
↓
Detection
↓
Evidence
↓
Harness Response
↓
Alternative Path / Recovery / Stop（如有）
↓
Verified Outcome
↓
Limitation
↓
Counterfactual
```

Alternative Path 不是必填。

---

# 19. Counterfactual（反事实）

每个最终 Case 可附一个简短 Counterfactual：

> 如果没有当前 Harness 机制，最可能发生什么？

例如：

```text
Without external verification,
Agent false completion may have been accepted.
```

或：

```text
Without Source/Workspace separation,
incomplete managed changes might have reached registered Source.
```

Counterfactual 必须明确标为 inference，不得伪装成已发生 Fact。

---

# 20. 最终 Case 数量目标

建议：

```text
2–3 Natural Failure Cases
+
0–2 Fault Injection Cases
+
最好 1 个 Boundary Case
```

这些可以部分重叠。

不需要机械凑数量。

一个非常强的 Boundary Case，可能比多个普通 Recovery Case 更有价值。

---

# 21. Boundary Case

Campaign 最好最终明确保留至少一个：

> **当前 Harness 知道自己处理不好，因此选择诚实停止或明确 defer 的边界。**

候选例如：

- in-flight crash with uncertain side effect；
- post-dispatch response loss；
- unknown Tool side effect；
- same-Session durable crash recovery；
- generalized transactional multi-file apply。

不为了简历把 Boundary 临时消灭。

Boundary Case 应说明：

```text
What is known
What is unknown
Why current Harness stops
Why continuing would violate evidence/authority
What a future system would need
```

---

# 22. Human UI/UX 与本 Campaign 的关系

当前 Human Observation 已经明确：

> V3.6 当前 WebUI / interaction flow 的可理解性和易用性存在明显问题。

本 Campaign 不负责大规模 UI 重设计。

Engineering Test 可以验证：

- UI 是否能投影真实状态；
- terminal 是否能展示；
- Apply 是否正确禁止；
- Files / Changes / Diff 是否能访问；
- Source / Workspace 状态是否一致。

但不能替 User 判断：

- 第一眼是否看懂；
- 下一步是否自然；
- 信息架构是否合理；
- 是否敢 Apply；
- 页面是否过度工程化；
- 状态提示是否友好。

因此流程：

```text
Engineering Stabilization
→ CLOSE
→ Human UI/UX Acceptance
→ UI / Interaction Polish
```

Computer Use 可以做 automated smoke path，但不能替代 Human UX Acceptance。

---

# 23. Campaign Progress Tracking

Main 建议维护一个轻量状态：

```yaml
campaign_status:
  natural_cases_started:
  natural_cases_completed:
  natural_cases_failed:
  findings_total:
  bounded_maintenance_count:
  decision_required_count:
  post_maintenance_retests:
  fault_injection_cases:
  candidate_failure_cases:
  known_boundaries:
  current_blocker:
  stop_condition_status:
```

不需要建设新数据库或 Dashboard。

一个 Markdown 状态文件即可。

---

# 24. Campaign 节奏

推荐节奏：

```text
Case
→ Review
→ Next Case
```

如果 Failure：

```text
Case
→ Freeze
→ Main Handoff
→ Decision
→ Maintenance / Defer / Decision Required
→ Retest if authorized
→ Next Case
```

不要多个 Failure 同时并行开发。

---

# 25. 什么时候继续下一个 Case

满足：

- 当前 Case 已形成 Evidence；
- 如果有 Finding，已分类；
- 若需要 maintenance，已完成或明确 defer；
- 当前 Git / Source / Session baseline 清楚；
- 没有 active_goal 冲突；

才进入下一 Case。

---

# 26. Campaign Stop Conditions

本 Campaign **不以“再也找不到 Bug”为结束条件**。

满足以下大部分即可关闭：

1. 已完成若干差异化 Natural Coding Tasks；
2. normal path 已出现多次自然稳定 completion；
3. 不再连续出现新的 blocker-class Harness correctness issue；
4. 已知 Failure 能被可信 Detection + Evidence 解释；
5. Source / Workspace / Apply Authority 在测试中保持可信；
6. budget / terminal stop 不再退化为 generic unknown state；
7. 新 Finding 大多落入：
   - Agent/model behavior；
   - expected limitation；
   - known boundary；
   - minor non-blocking friction；
8. 已形成足够的 Failure Case 候选；
9. 继续增加 Natural Case 的信息增益明显下降；
10. 没有尚未处理的 Decision Required；
11. 没有 active maintenance goal。

---

# 27. 提前暂停条件

即使未达到正常 Stop Condition，出现以下情况也应暂停：

- 同类高严重度 Finding 连续出现；
- 一个 Finding 维护一次后仍自然重复；
- Main 开始建议明显扩大架构；
- 测试开始主要在测模型能力而不是 Harness；
- 测试开始不断调预算；
- 测试成本明显增加但 Evidence 增益下降；
- Mini RPG Fixture 已不再适合回答问题；
- UI/UX 问题已经成为真正主阻塞而非 Engineering Reliability；
- User 需要做 Scope Decision。

---

# 28. Campaign Closeout 输出

Campaign 结束时形成：

## 28.1 `V3_6_ENGINEERING_STABILIZATION_CLOSEOUT.md`

包含：

1. Baseline；
2. 实际完成的 Natural Tasks；
3. 正常 completion 证据；
4. Findings 汇总；
5. Maintenance 汇总；
6. Before/After Evidence 关系；
7. 未修 Limitation；
8. Decision Required 历史；
9. 是否执行 Fault Injection；
10. 当前 Engineering Stability 判断；
11. 是否可以停止底层 Feature Development；
12. Human UI/UX handoff。

## 28.2 `V3_6_FAILURE_CASE_CANDIDATES.md`

只列候选，不强制全部进入面试。

每个候选：

```text
Case ID
Task
Failure
Detection
Evidence
Harness Response
Outcome
Limitation
Counterfactual
Why it is interview-worthy
```

## 28.3 可选：`V3_6_ENGINEERING_STABILIZATION_STATUS.md`

作为 Campaign 进行中的轻量状态文件。

不是长期平台。

Campaign Closeout 后可以冻结。

---

# 29. 面试价值但不是测试目标

本 Campaign 可能自然产生以下面试素材：

- real workload 暴露低 request cap；
- Evidence-driven budget adequacy decision；
- command PASS ≠ Run PASS；
- finite-budget typed terminalization；
- Source/Workspace Authority；
- false completion；
- fail-closed boundary；
- natural Recovery / Alternative Path；
- Before-Fix Trace → Root Cause → Fix → Regression；
- 明确知道什么不解决。

但：

> **不能为了这些素材反过来操纵测试。**

面试材料是测试的副产品，不是测试输入。

---

# 30. 与 Human UX 阶段的最终交接

Engineering Stabilization Closeout 后：

```text
Engineering Stability
→ sufficiently stable
```

才进入：

> **Human UI/UX Acceptance**

届时由 User 主导：

```text
Project selection
→ New Session
→ Task
→ Agent activity
→ Files
→ Changes / Diff
→ Apply / Discard
→ Receipt
→ New Session
```

关注：

- 看不看得懂；
- 下一步是否清楚；
- 状态是否可信；
- 信息是否过载；
- 是否敢 Apply；
- 失败后是否知道发生什么。

Test Codex / Computer Use 只能辅助，不拥有最终 UX 判断权。

---

# 31. 最终结束路线

理想收尾：

```text
V3.6 closed_accepted
↓
Engineering Stabilization Campaign
↓
Failure Case Curation
↓
Human UI/UX Polish
↓
Final System Consolidation
↓
Interview Ownership
↓
STOP FEATURE DEVELOPMENT
```

不因为仍存在 Known Boundary 而阻止结束。

---

# 32. Main Session 启动规则

Main 接受本计划后，应首先：

1. 确认当前 authoritative Git / Pi / V3.6 baseline；
2. 确认最新 finite-budget terminalization Closeout；
3. 建立 Campaign 状态文件；
4. 不重新设计 V3.6；
5. 向当前 Test Session 发出明确的 Engineering Stabilization 授权；
6. 先继续 Natural Workload；
7. 不预先安排 Fault Injection；
8. 不预先安排 Failure Case 故事；
9. 任何 Decision Required 条件命中立即暂停。

---

# 33. Test Session 启动规则

Test Session 接受授权后：

1. 读取本计划；
2. 读取当前 Mini RPG baseline；
3. 读取 Attempt 1 / Attempt 2 的历史 Evidence，但不得把这些已知结果当成新 Case；
4. 保留它们作为 Campaign historical cases；
5. 从新的自然 Coding Task 开始；
6. 不主动修改产品；
7. 不主动调整 budget；
8. Failure 时先 Freeze + Evidence Review；
9. Main 未授权 retest 前不重跑；
10. Main 未授权下一 Case 前不在 active Finding 上继续探索。

---

# 34. 一句话治理原则

> **Test 负责让真实工作发生并保存事实；Main 负责判断哪些事实值得成为维护；User 负责决定何时值得改变边界。**

---

# 35. 一句话测试原则

> **不要为了证明 Harness 有能力而制造 Failure；让真实 Coding Task 自然暴露问题，然后证明 Harness 是否能够正确 Detection、Evidence、Respond 和 Stop。**

---

# 36. 一句话结束原则

> **当继续测试主要只会重复已知行为，而不再显著增加对 Harness Reliability 的理解时，就停止 Engineering Stabilization，转入 Human UI/UX 和面试 Ownership。**
