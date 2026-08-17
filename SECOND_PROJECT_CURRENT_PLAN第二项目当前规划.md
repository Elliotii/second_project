# 第二项目当前规划

> **暂定项目名**：Agent Harness Reliability Workbench  
> **当前日期**：2026-07-29  
> **当前阶段**：G001 已验收，初始项目基线已授权，G002 最小动态 Go Gate 已激活并等待新 Goal Session  
> **文档性质**：当前执行规划，不是冻结后的完整实施 Spec  
> **上游依据**：[第二项目研究与实现上游包](./SECOND_PROJECT_RESEARCH_AND_IMPLEMENTATION_CONTEXT第二项目研究与实现上游包.md)  
> **外部研究输入**：[第二项目实施前证据审查决策支持报告](./deep-research-report第二项目实施前证据审查决策支持报告.md)

---

# 0. 文档用途与决策纪律

本文件用于记录第二项目在完成原始研究包和 GPT 深度研究报告审阅后的当前规划。

它负责：

- 约束当前项目形态；
- 区分已确认事实、候选决策和开放问题；
- 给出 Pi Source Audit、Spike、V0 和 Pilot Eval 的执行顺序；
- 防止项目退化为薄报表工具或膨胀为通用 Agent 平台；
- 作为下一阶段实际工作的入口。

它不负责：

- 提前冻结未经源码验证的 Pi 行为；
- 提前冻结全部 Schema；
- 预先承诺项目指标；
- 把 GPT 深度研究报告中的内部引用标记当作可复核证据；
- 代替后续 Version Charter、ADR 和实验报告。

当前决策纪律：

```text
外部研究用于形成假设
→ 本地源码和测试用于确认接口
→ Spike 用于确认行为
→ Pilot Eval 用于判断 Policy 效果
→ 真实使用用于形成回归资产
```

---

# 1. 项目定义

## 1.1 一句话定位

> **基于 Pi 构建一个自己能够实际使用的 Coding Agent Reliability Workbench；通过受控 Workspace、确定性环境验证、关键运行事实记录和 Baseline / Candidate 对照，判断一条 Harness Policy 是否真正改善任务结果，并将有价值的真实失败沉淀为人工确认的回归资产。**

## 1.2 唯一中心问题

```text
一条 Harness Policy 修改
是否提高真实 Coding Task 的成功或可靠性
并且没有造成不可接受的回归？
```

所有功能都必须能回答下列至少一个问题：

- 它解决了哪一种真实 Coding Agent 失败？
- 它如何通过环境事实判断结果？
- 它是否改变了 Agent 行为，而不只是重新分类结果？
- 它与 Pi 上游能力的边界是什么？
- 它能否进入 Baseline / Candidate 对照？
- 它能否形成可复现的失败、回归或发布决策？

## 1.3 与“拾流”的分工

| 维度 | 拾流 | 第二项目 |
|---|---|---|
| 主要语言 | Python | TypeScript / Node.js |
| Agent 类型 | Research Agent | Coding Agent Harness |
| Tool | Search / Transcript / Evidence | File / Shell / Git / Test |
| Context | Evidence Context | Tool / Session Context |
| Outcome | Grounding / Citation | Environment State |
| Eval | Semantic / Evidence | Deterministic Assertions |
| Reliability | 保守回答、研究流程 | Runtime、Fault、Side Effect |
| Memory | User / Corpus / Artifact | Failure / Case / Policy |

第二项目不重复建设语义 RAG、大型用户 Memory、领域 Research Agent 或另一个 LangGraph 主系统。

---

# 2. 当前决策状态

## 2.1 已确认的项目级决策

| 决策 | 当前状态 |
|---|---|
| 项目必须是可实际使用的 Coding Agent Workbench | 已确认 |
| 自动 Outcome 优先使用 Test / Build / Assertion | 已确认 |
| Agent Final Answer 不等于 Task Success | 已确认 |
| Invalid Run 必须与 Agent Failure 分开 | 已确认 |
| Pi 上游能力与个人代码必须清楚分离 | 已确认 |
| 第一阶段不做大而全平台 | 已确认 |
| 一个固定任务只能证明 Spike 可行，不能证明 Policy 统计效果 | 已确认 |
| 正式数字必须来自真实实验，不预先编造 | 已确认 |

## 2.2 候选决策，等待 Pi Spike 证实

```yaml
basis:
  candidate: Pi
  status: accepted_for_bounded_dynamic_verification_not_final_go

architecture:
  candidate: Direct pi-agent-core AgentHarness
  status: accepted_as_G002_primary_not_frozen_for_V0
  retained_real_path_comparator: Pi Coding Agent SDK Runner + Inline Extension
  fallback: RPC/process only after observed isolation need

first_policy:
  candidate: Completion Verification
  status: not_frozen

second_policy:
  candidate: Oversized Tool Result Externalization
  status: deferred_until_first_policy_stable

core_patch:
  target: 0
  status: statically_not_required_dynamic_gate_pending

session_as_full_trace:
  assumption: rejected_until_proven
```

## 2.3 当前开放问题

G001 已静态回答上游版本、公共入口、生命周期、Session、Tool 顺序与候选插入点。当前开放问题收敛为：

1. 固定 Commit 的 emitted public package 是否能从声明入口正常导入？
2. Direct AgentHarness 是否能动态完成严格的两 Cycle Completion Verification？
3. Baseline 与 Candidate 初始 Fixture、工具、环境和配置能否规范化为等价？
4. 外部 Event Journal、Pi Session 与 Verifier 顺序能否稳定关联？
5. Direct 生命周期的未冻结语义是否会阻塞外层顺序 Driver？
6. 同一 Policy Core 能否在 Phase 3 进入 Pi Coding Agent 的真实使用路径？
7. Settled Session 重建、Windows Cancellation 和 Side-effect Crash 应在后续稳健性目标如何验证？

---

# 3. 候选系统结构

## 3.1 结构总览

```text
TaskSpec
   ↓
Workspace Preparation
   ↓
Spike / Workbench Driver ───────→ Direct Pi AgentHarness
   │                                  │
   ├─ Run Manifest                    ├─ Pi Agent Loop
   ├─ Model / Budget / Tool Profile   ├─ Pi Tools + NodeExecutionEnv
   ├─ Session / Run Link              ├─ Pi Session / JSONL
   ├─ Policy Toggle                   └─ Public Lifecycle Events
   └─ Minimal Event Projector              │
   ↓                                       │
External Deterministic Verifier            │
   ↓                                       │
Minimal Runtime Event Journal ←────────────┘
   ↓
Environment Outcome
   ↓
Baseline / Candidate Report
```

## 3.2 职责边界

### 尽量继承 Pi

- Provider 与 LLM API；
- Direct AgentHarness 与 Agent Loop；
- 基础 Tool Calling；
- File / Shell / Edit 等 Coding Tool；
- NodeExecutionEnv；
- Session / JSONL；
- 公共生命周期 Event 与 Hook；
- 后续真实路径所需的 Coding Agent SDK / Extension 能力。

### 本项目重点建设

- Task Spec；
- Run Manifest；
- Workspace Contract；
- Pi Session Reference；
- 最小 Runtime Event Journal；
- Deterministic Environment Verifier；
- Completion Reliability Policy；
- Baseline / Candidate Runner；
- Failure Attribution；
- Run Report；
- Regression Case；
- 后续 Fault 与 Policy Lifecycle。

## 3.3 双使用路径

项目不能只支持固定任务评测。

### 实验路径

```text
Task Manifest
→ Direct AgentHarness Adapter
→ Outer Sequential Policy Driver
→ Verifier
→ Outcome / Report
```

### 真实使用路径

```text
Pi CLI / Coding Agent SDK
→ Compatibility Adapter / 必要时 Inline Extension
→ 与实验路径相同的 Policy Core
→ 真实仓库任务
→ 关键事实与 Outcome
→ Failure Candidate
```

V0 必须证明同一条 Policy 能进入真实 Pi 使用路径。若只能在实验 Runner 中生效，项目仍然过度偏向 Eval Harness，不满足“可实际使用的 Agent”要求。

---

# 4. 第一条候选 Policy：Completion Verification

## 4.1 目标失败

```text
Agent 给出完成性最终回复
但测试、构建或确定性断言没有通过
```

## 4.2 Baseline

```text
Agent settled
→ 运行 Verifier
→ 记录初始和最终结果
→ 不把失败反馈给 Agent
→ Run 结束
```

## 4.3 Candidate

```text
Agent settled
→ 运行相同 Verifier
→ 如果通过，Run 成功
→ 如果失败，把确定性失败摘要反馈给 Agent
→ 允许一次有预算限制的恢复 Cycle
→ 再次运行相同 Verifier
→ Run 结束
```

首轮 Candidate 只允许一种 Recovery Strategy，不能同时实现多种 Stop / Retry / Repair 策略。

## 4.4 为什么不能只重新标记结果

如果 Candidate 只是：

```text
Verifier failed
→ 将 success 改标为 failed
```

那么 False Completion Rate 会机械下降，但任务成功率没有提高。这只是一种更准确的 Outcome 分类，不是一条改变 Agent 行为的 Reliability Policy。

因此首条 Policy 必须包含一次受控反馈和恢复机会。

## 4.5 Verifier 触发语义

首轮不判断最终文本“看起来是否完成”，也不引入 LLM Judge。

```text
每次外部 Agent Cycle settled
→ 无条件运行确定性 Verifier
```

这样可避免完成意图分类成为新的不确定变量。

---

# 5. 指标与实验设计

## 5.1 指标

### 主指标

```text
Verified Task Success Rate
```

### Policy 直接指标

```text
Recovery Success Rate
= 初次验证失败后，经 Candidate 恢复并最终通过的比例
```

### 诊断指标

```text
Initial False Completion Rate
= Agent 首次 settled，但首次环境验证未通过的比例
```

### Guardrail

- 额外 Agent Cycle；
- Turn；
- Tool Call；
- Token；
- Latency；
- Cost；
- Invalid Run Rate；
- Forbidden Path / 越界修改；
- Verifier Failure Rate。

## 5.2 Spike 与 Eval 分离

### 可行性 Spike

只使用一个固定任务，用于回答：

- SDK 能否运行；
- Event 能否观察；
- Session 能否关联；
- Verifier 能否附着；
- Candidate 能否继续一次；
- 是否需要 Core Patch。

该阶段只产生技术 Go/No-Go，不产生作品集效果数字。

### Policy Pilot Eval

Spike 通过后，使用：

```text
小型固定任务集
× Baseline / Candidate
× 重复 Trial
```

只有这一阶段才允许计算 Rate、比较收益和判断 Policy 是否晋级。

## 5.3 公平对照

Baseline 与 Candidate 应尽量固定：

- Task 初始状态；
- 模型；
- Thinking Level；
- System Prompt；
- Tool Profile；
- Workspace；
- Verifier；
- 初始预算；
- Pi 与 Workbench 版本。

Candidate 的额外恢复成本不能隐藏，必须进入 Guardrail。

---

# 6. 运行语义与数据对象

## 6.1 术语

```text
Task
= 可重复的任务定义

Run / Trial
= 某个 Task 在某个 Policy Variant 下的一次完整运行

Agent Cycle
= 初始执行，或由外部 Policy 触发的一次受控恢复执行

Pi Retry
= Pi 内部 Provider / Compaction / Summarization Retry

Session Reference
= Run 涉及的一个或多个 Pi Session 文件
```

外部 Agent Cycle 与 Pi Retry 必须分开记录。

## 6.2 最小候选对象

```yaml
TaskSpec:
  task_id:
  instruction:
  fixture:
  allowed_scope:
  verifier:
  budget:

RunManifest:
  run_id:
  task_id:
  policy_variant:
  pi_commit:
  workbench_commit:
  model:
  thinking_level:
  tool_profile:
  workspace:
  started_at:

RunSessionLink:
  run_id:
  primary_session:
  session_refs: []

AgentCycle:
  cycle_index:
  reason:
    - initial
    - verification_recovery
  verifier_before:
  verifier_after:

EnvironmentOutcome:
  initial_status:
  final_status:
  assertions: []
  verifier_status:
  recovery_attempted:
  recovery_succeeded:

RunResult:
  status:
    - passed
    - failed
    - invalid_run
    - cancelled
```

这些对象是 Spike 起点，不是冻结 Schema。

## 6.3 Event Journal 最小原则

Pi Session 继续承载会话消息和 Pi 原生 Session 数据。本项目不复制完整 Model 内容或流式 Token。

首轮 Event Journal 只补：

```text
run_started
session_linked
agent_cycle_started
agent_settled
pi_retry_observed（如可获得）
verifier_started
verifier_completed
policy_decision
continuation_queued
run_completed
run_invalidated
```

是否增加 Tool Start/End、Context Transform 或 Compaction 事件，必须由 Pi Session 源码审计结果决定。

---

# 7. 候选技术栈

## 7.1 当前主栈

```text
TypeScript
Node.js 24.14.1（满足固定 Pi 的 >=22.19.0 要求）
Pi Agent Core
Direct AgentHarness（G002 主候选）
NodeExecutionEnv
Pi Session / JSONL
Pi Coding Agent SDK / Extension（Phase 3 兼容性路径）
Windows PowerShell + npm.cmd（当前 Spike 环境）
```

Bun 当前未安装，也不作为 G002 前置条件。WSL 不进入 G002；只有 Windows 原生路径出现具体阻塞并经架构复核后才重新决定。

## 7.2 Workbench

```text
CLI
JSON / JSONL
Git
临时 Workspace（首个 Spike）
Git Worktree（真实仓库阶段再比较）
Shell
Test / Build / Lint
Markdown / JSON Report
```

SQLite、HTML Report 和容器暂不进入首个 Spike。

## 7.3 条件性后期能力

```text
Fault Injection
Replay
Regression Case
Policy Registry
Feature Flag
HITL
Container / Sandbox Adapter
MCP
Godot Adapter
Subagent / Multi-workspace
Harbor Adapter
Web UI
```

其中 Fault、Regression 和真实使用闭环属于作品集 Closeout 前应达到的能力；其余必须由真实失败、场景边界或求职收益重新授权。

---

# 8. 工作区设计

当前候选布局：

```text
project2/
├─ SECOND_PROJECT_RESEARCH_AND_IMPLEMENTATION_CONTEXT第二项目研究与实现上游包.md
├─ deep-research-report第二项目实施前证据审查决策支持报告.md
├─ SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md
├─ README.md
├─ .gitignore
│
├─ docs/
│  ├─ research/
│  │  └─ pi/
│  │     ├─ upstream-snapshot.md
│  │     ├─ source-map.md
│  │     ├─ capability-matrix.md
│  │     └─ risk-report.md
│  ├─ decisions/
│  └─ reports/
│
├─ spikes/
│  └─ pi-runtime/
│
├─ fixtures/
│  └─ tasks/
│
├─ workbench/                 # Pi Go 后再创建正式应用
│  ├─ src/
│  │  ├─ cli/
│  │  ├─ runner/
│  │  ├─ pi-adapter/
│  │  ├─ policies/completion/
│  │  ├─ verifier/
│  │  ├─ journal/
│  │  └─ report/
│  └─ test/
│
├─ .upstream/
│  └─ pi/                     # 本地上游检出，不进入个人 Git
│
└─ .runs/                     # 运行 Workspace、Session Link、Trace、Outcome
```

在 Pi Go 之前，只创建研究、Spike、Fixture 和上游边界，不创建完整 `workbench/` 实现。

---

# 9. 分阶段执行规划

## Phase 0：工作区与上游固定

### 目标

建立可复核的研究环境和清楚的个人贡献边界。

### 工作

- 初始化根 Git 仓库，但不自动 Commit；
- 创建 `.gitignore`、README 和目录说明；
- 将 `.upstream/`、`.runs/`、`node_modules/`、敏感环境文件排除；
- 下载 Pi 到 `.upstream/pi`；
- 记录 Remote、Commit、Tag、Release、Package 版本；
- 检查 Node Engine、Package Manager、许可证；
- 不立即安装 Bun；
- 不立即创建正式 Workbench。

### 交付物

- `docs/research/pi/upstream-snapshot.md`；
- 工作区边界；
- 可复核的 Pi Commit。

### 完成条件

```text
能够准确回答“研究的是哪一个 Pi 版本”
并能区分上游代码与个人代码
```

## Phase 1：Pi Source Audit

### 目标

通过源码和测试回答基座可行性，而不是依赖 README。

### 审计范围

- Agent Loop；
- AgentSession / AgentSessionRuntime；
- SessionManager / JSONL；
- SDK Entry；
- Extension API；
- Tool Lifecycle；
- Context；
- Compaction；
- Retry；
- Termination / Settled；
- Workspace / CWD；
- Permission；
- 测试覆盖。

### 交付物

- Source Map；
- Capability Matrix；
- Tool/Session 顺序图；
- Open Questions；
- Go/No-Go Risk Report。

## Phase 2：确定性集成 Spike

### 目标

尽量使用 Faux Provider 或固定响应，验证软件接口，不先依赖真实模型效果。

### 只验证

- Direct AgentHarness 的 emitted public package 入口；
- 非交互 AgentHarness 启动；
- 指定临时 Workspace；
- 触发 Tool；
- 捕获关键 Event；
- 建立 Run / Session Link；
- Agent Settled 后运行 Verifier；
- Candidate 反馈失败并继续一次；
- 生成最小 Report；
- Pi Core Patch 是否为 0。

### 完成条件

```text
一个固定 Task
+ 一个 Manifest
+ 一个 Policy Toggle
+ 一个 Event / Session Link
+ 一个 Deterministic Outcome
+ 一个 Baseline / Candidate Report
```

该阶段不得宣称 Policy 效果。

## Phase 3：真实模型端到端可行性

### 目标

用一个微型 TypeScript 仓库任务验证真实 Coding Agent 行为。

### 运行

- Baseline：Verifier 只观察；
- Candidate：Verifier 失败后允许一次恢复；
- 使用相同初始任务、模型、工具、环境和 Verifier；
- 记录额外成本；
- 验证同一 Policy Core 能进入 Pi 真实交互路径。

### 完成条件

- 端到端数据流可解释；
- Session 与 Run 可关联；
- Outcome 稳定；
- Candidate 确实改变 Agent 行为；
- 用户能够解释关键代码路径。

## Phase 4：冻结 V0 Version Charter

只有 Phase 0–3 通过后，才冻结：

- Pi Go/No-Go；
- 架构；
- 数据合同；
- Event Journal 边界；
- Workspace 策略；
- Completion Policy；
- 任务集；
- Eval 预算；
- Portfolio-ready 条件。

## Phase 5：实现最小可用 Workbench

### V0 必须支持

- 固定 Task Manifest；
- 临时 Workspace；
- Pi SDK Runner；
- Completion Policy Toggle；
- 确定性 Verifier；
- 一次有界恢复；
- Session Link；
- JSON / Markdown Report；
- Pi 真实交互使用路径。

### V0 不包含

- Web Dashboard；
- 通用数据库平台；
- 多 Policy 编排；
- 多 Agent；
- 完整容器平台；
- MCP；
- Godot。

## Phase 6：Completion Policy Pilot Eval

### 目标

在小型固定任务集上运行重复 Trial，判断 Completion Policy 是否真正改善结果。

### 输出

- Verified Task Success；
- Recovery Success；
- Initial False Completion；
- Invalid Run；
- Token / Latency / Cost Guardrail；
- Failure Attribution；
- Promote / Revise / Reject 决策。

## Phase 7：Fault、Regression 与真实使用闭环

### 目标

完成项目从实验工具到可靠性 Workbench 的关键闭环。

```text
真实使用 Run
→ Failure Candidate
→ 最小复现与 Assertions 草案
→ 人工确认
→ Regression Case
→ Baseline / Candidate 重跑
→ Policy 发布、拒绝或回滚
```

只加入与当前 Policy 直接相关的少量 Fault，不建设通用 Fault 平台。

## Phase 8：第二条 Policy 与条件性扩展

优先候选：

```text
Oversized Tool Result
→ 完整结果外置
→ 摘要
→ 可回读引用
```

Session Reliability、Godot、MCP、Container、Subagent 等能力继续根据真实失败、技术证据和求职收益决定。

### Pi SDK / Extension 兼容检查点（延后、非阻塞）

**Fact.** 固定 Pi 的 `pi-coding-agent` 公共层已经提供
`packages/coding-agent/src/core/sdk.ts#createAgentSession`、
`agent-session-runtime.ts#AgentSessionRuntime`、
`session-manager.ts#SessionManager` 和 `extensions/types.ts#ExtensionAPI`；
`test/agent-session-runtime-events.test.ts`、
`test/suite/agent-session-model-extension.test.ts` 与
`test/extensions-runner.test.ts` 覆盖 Session new/resume/fork、Tool Call 阻断、
Tool Result 修改和 Extension 生命周期。Pi Package 还允许从 npm、git 或本地路径
安装 Extension/Skill，但第三方 Package 拥有完整进程权限，“可安装”不等于已经通过
本项目的成熟度、安全或兼容性审计。

```yaml
pi_application_integration_checkpoint:
  status: deferred_non_blocking
  does_not_change:
    - Direct_AgentHarness_as_controlled_experiment_runtime
    - current_V1_scope_fairness_or_goal_sequence
  evaluation_triggers:
    - V1_produces_a_policy_worth_exposing_in_real_Pi_interactive_use
    - before_drafting_V2_clean_session_or_clean_workspace_recovery_contract
  bounded_questions:
    - can_a_thin_Extension_adapter_reuse_the_same_project_owned_policy_core
    - can_SDK_session_runtime_replace_host_reimplementation_for_new_resume_or_fork
    - can_an_audited_Worktree_extension_or_module_supply_lifecycle_helpers_without_owning_Workbench_lineage
    - can_Pi_tool_result_projection_and_truncation_be_reused_without_weakening_raw_evidence
  retained_workbench_authority:
    - Run_Attempt_Workspace_and_Session_lineage
    - external_Verifier_and_formal_Outcome
    - immutable_evidence_budget_and_experiment_fairness
    - protected_paths_and_security_claim_boundaries
  stop_conditions:
    - no_concrete_V1_or_V2_problem_is_solved
    - adoption_changes_V1_treatment_fairness
    - source_license_version_or_Windows_compatibility_cannot_be_verified
    - integration_requires_private_import_or_Pi_Core_patch_without_new_review
    - integration_weakens_external_evidence_authority
```

**Recommendation.** V1 不加载新的 SDK/Extension 路线。若命中上述触发条件，由主
Session授权一次有界只读兼容审计，输出 `direct_dependency`、`thin_adapter`、
`module_port`、`behavioral_reference` 或 `reject` 之一；没有具体问题时不得把它升级
成 Goal。

---

# 10. Pi Go / No-Go

## 10.1 Go

```yaml
go:
  - fixed_task_can_run_programmatically
  - sdk_does_not_depend_on_hidden_tui_state
  - critical_tool_lifecycle_is_observable
  - tool_result_or_context_can_be_postprocessed
  - policy_can_be_toggled
  - deterministic_outcome_can_be_attached
  - session_can_be_linked_to_run
  - workspace_can_be_controlled_for_spike
  - core_patch_not_required_or_only_narrow_upstreamable_gap
  - dataflow_is_explainable
```

## 10.2 No-Go / Reconsider

```yaml
no_go:
  - critical_events_require_large_core_fork
  - fixed_run_requires_hidden_interactive_state
  - tool_result_cannot_be_postprocessed
  - verifier_cannot_be_attached_cleanly
  - workspace_cannot_be_controlled
  - session_cannot_be_linked_to_external_run
  - typescript_changes_are_not_reviewable
  - basic_spike_requires_building_a_large_platform
```

## 10.3 Plan B

Plan B 必须由具体失败原因触发：

- Pi 上游 PR + 独立小 Workbench；
- 更薄的 Pi RPC / Process Adapter；
- mini-SWE-agent 或更小 Runtime 的独立 Runner；
- 成熟 Agent + 外部 Outcome / Trace / Policy Adapter；
- 重新 Spike 其他小型 Harness。

---

# 11. 第一阶段明确不做

```text
完整 Claude Code Clone
通用 Eval SaaS
大型 Web Dashboard
大型 Memory 平台
Multi-Agent Swarm
A2A
自动 Gold
全自动修改 Harness 并上线
完整 Harbor 集成
通用多租户 Sandbox
复杂游戏生产流水线
纯 Benchmark 刷榜
为了展示技术而加入 MCP
```

这些能力不是永久禁止，但必须由新版本目标、真实失败或明确求职收益重新授权。

---

# 12. 人工决策边界

Codex 可以负责：

- 上游源码审计；
- 代码地图；
- Adapter；
- 类型合同；
- CLI；
- 测试；
- Verifier；
- Journal；
- Report；
- 重构和自动验证。

以下决定必须由用户理解并最终批准：

- Outcome 语义；
- Failure Taxonomy；
- Policy 的因果假设；
- Baseline / Candidate 公平性；
- Recovery Budget；
- Side Effect 边界；
- Eval Case 是否有效；
- Policy Promotion / Rollback 门槛；
- Portfolio 中的个人贡献表述。

---

# 13. 当前状态与紧接着的行动

## 13.1 当前状态

```yaml
workspace:
  git_initialized: true
  files:
    - original_research_context
    - deep_research_report
    - current_plan
    - project_control_files
    - pi_upstream_snapshot
    - G001_goal_contract

local_tools:
  node: 24.14.1
  npm_cmd: 11.11.0
  git: 2.53.0.windows.3
  bun: not_installed

pi:
  downloaded: true
  commit_pinned: 027a5847901b5dde30270abaa1041046cd2b4b55
  nearest_tag: v0.82.1
  commits_after_tag: 40
  release_pinned: false
  source_audited: true
  source_audit_disposition: ACCEPT_FOR_DYNAMIC_VERIFICATION
  architecture_review: accepted
  go_no_go: provisional_dynamic_verification_only

implementation:
  workbench_created: false
  spike_created: false
  policy_frozen: false

next_goal:
  id: G002_PI_DIRECT_HARNESS_GO_GATE
  status: ready_to_start
  runtime_candidate: Direct pi-agent-core AgentHarness
```

## 13.2 下一工作单元

G001 已完成并通过独立架构验收，用户已授权初始项目基线提交，G002 契约已激活。下一步严格按以下顺序执行：

1. 在新的 Goal Session 执行 G002，并在启动时记录干净根仓库 `HEAD`；
2. 完成公共包导入、Baseline、Candidate 单次恢复、Event 顺序和初始环境等价五个 Gate；
3. 回到架构控制 Session 验收动态证据并决定 Direct Pi Go Gate 是否通过；
4. 通过后再规划 Session 重建、Windows Cancellation 等稳健性验证和 Phase 3 真实路径。

G002 只验证最小动态协议，不安装依赖到 `.upstream/pi`，不使用 WSL，不创建正式 Workbench，不冻结 Completion Policy，不引入 SDK/RPC 作为静默退路，也不产生 Policy 效果数字。

---

# 14. Portfolio-ready 最低条件

项目不能仅以“代码已完成”收尾。最低应证明：

- 它是自己实际使用过的 Coding Agent Workbench；
- 至少解决或验证过一种真实 Coding Agent 失败；
- Outcome 主要来自环境事实；
- Baseline / Candidate 条件可解释；
- 至少有一个真实失败进入人工确认的 Regression Case；
- 至少有一次 Policy Promote / Revise / Reject 决策；
- Pi 上游能力与个人贡献边界清楚；
- 用户能解释关键 Runtime、Session、Tool 和 Verifier 数据流；
- 数字来自真实实验，并同时报告 Guardrail；
- 没有把单任务 Spike、重新分类结果或框架能力包装成个人提升。

最终项目仍应能够用一句话解释：

> **我没有重新实现 Coding Agent；我基于 Pi 构建了一层可实际使用、可自动验证、可复现失败并能用对照实验管理 Harness Policy 的可靠性 Workbench。**

---

# 15. V3.5 Final Closeout — Current Authority

> 本节是 2026-08-09 的当前路线状态，覆盖本文件早期“当前状态/下一步”快照；早期章节
> 继续作为规划与决策 provenance 保留。

## 15.1 Current state

```yaml
latest_version: V3.5
status: closed_accepted
active_goal: null
disposition: PASS_V3_5_PERSISTENT_INSPECTABLE_ADAPTIVE_HARNESS_WORKBENCH_WITH_BOUNDED_SINGLE_CASE_SKILL_EVIDENCE
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_core_patches: 0
next_version_authorized: false
```

V3.5 已把 V3 的 Adaptive Harness State 能力产品化为：

```text
settled persistent Session
→ Session / Run / Verifier / State evidence
→ safe Read Model
→ bounded comparison and adaptation lineage
→ loopback-only local WebUI and reproducible demo
```

## 15.2 Accepted Goal results

- Goal 1：跨进程重开和继续 settled deterministic/Faux Pi Session、Session↔Run 和安全
  Read Model；不声称 in-flight crash recovery 或 real-model continuation。
- Goal 2：原真实 Pair 在 Base request budget 停止，以 inconclusive 关闭并保留。
- Goal 2.5：一个有效真实 Pair 的 Base/Candidate 都通过；Candidate 使用更多 tokens，未
  观察到 Skill 的任务成功优势。
- Goal 3：本地 loopback API、WebUI、portable demo 和 evidence-grounded adaptation
  inspectability 完成；浏览器没有 State mutation authority。

## 15.3 Current project identity

项目当前可概括为：

> **一个可靠性优先、环境反馈驱动、支持有界恢复和 Harness State 适配，并能持久保存、
> 检查和解释其 Session、Run、Verifier、comparison 与 State lineage 的 Adaptive Coding
> Agent Harness Workbench。**

Direct Pi `AgentHarness` 仍是已接受 Runtime。Pi SDK/Extension 是未来出现具体交互、
打包、权限、Worktree 或兼容需求时的有界参考候选，不是当前静默路线切换。

## 15.4 Next-step rule

当前不自动进入 V4。任何下一版本必须重新完成：

```text
concrete product/portfolio question
→ bounded primary-source/current-code review
→ explicit version boundary and non-goals
→ user acceptance and Activation
```

不得因为 V3.5 已完成而自动建设 Router、Curator、Experience Platform、semantic Memory、
multi-user service、database、streaming subsystem、IDE 或 Pi feature parity。

---

# 16. Final Capstone Goal 3 - Current Authority (2026-08-18)

本节是对本文件早期 current-state / next-step 快照的增量覆盖，不改写其历史 provenance。

```yaml
version: SECOND_PROJECT_FINAL_CAPSTONE
active_goal: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
goal_1: closed_accepted
goal_2: closed_accepted
goal_3: outer_runtime_manifest_schema_2_structural_amendment_authorized
original_goal_3_corrections: 2_of_2_exhausted
promotion_admission_structural_amendment_corrections: 1_of_1_exhausted
outer_runtime_schema_2_amendment_corrections: 0_of_1_authorized
candidate_frozen: false
mandatory_focused_audit_started: false
unique_real_run: 0_of_1_unstarted_unconsumed
```

第一份 Goal 3 Structural Amendment 证明了 per-entry promotion-admission 方向，但其唯一
correction 无法把 inner V3.6 多请求 bounded-edit carrier 诚实投影为 outer V3 schema-1
Faux 单请求形状。用户因此授权了另一份窄结构 Amendment：

`docs/第二项目_Codex交接包_2026-07-30/SECOND_PROJECT_FINAL_CAPSTONE_GOAL_3_OUTER_RUNTIME_SCHEMA_2_STRUCTURAL_AMENDMENT.md`。

当前接受路线是：

```text
freeze explicit schema-2 Amendment and Control Baseline
  -> fresh dedicated zero-call implementation Session
  -> Main line-by-line review and complete Gate E
  -> Candidate freeze
  -> fresh mandatory focused audit
  -> audited Execution Baseline
  -> exactly one frozen real acceptance Run
  -> Goal 3 and aggregate Final Capstone Closeout
  -> STOP CORE FEATURE DEVELOPMENT
```

Schema 1 保持精确兼容。Schema 2 仅限冻结的 Final Capstone V3.6 bridge，必须保留有序、
Host-observed 的 request identity 及完整 inner/outer counters，不得 value substitution。
不授权 V3.6 或 Pi 变更、新任务、新 Goal 1 family、task swap、rerun、fallback、result
hunting 或 manufactured failure。

新 Amendment 最多有一轮 bounded correction。同一 projection authority/integrity 缺陷
再次出现、scope escape，或一轮后仍不能验收，均返回 `DECISION_REQUIRED`。平台 safety、
usage limit、sandbox/tool interruption 不计入该轮。
