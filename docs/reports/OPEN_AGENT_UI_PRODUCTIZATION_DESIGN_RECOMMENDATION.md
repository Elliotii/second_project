# 开放式 Agent UI 产品化设计建议

```yaml
status: design_recommendation_only
date: 2026-08-10
implementation_authorized: false
source_changes_authorized: false
real_model_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
pi_modification_authorized: false
next_version_authorized: false
repository_baseline_reviewed: 4cddf4e804aeb02629fd6cefe456a28a06492da8
```

## 1. 文档目的

本文讨论如何把当前已经通过真实产品路径 Smoke Test 的 Workbench，进一步做成：

> 用户可以选择项目和 Workspace，在浏览器中自由输入 Coding Task，由真实模型和 Pi `AgentHarness` 执行，并持久保留 Session、Run、Verifier、Outcome 和 Harness State 使用记录的开放式本地 Agent UI。

本文不是新版本 Charter、Goal Contract 或实施授权，不修改 V0–V3.5 以及 Post-V3.5 Smoke Test 的已接受事实。

“开放式”在本文中表示任务和对话内容可由用户自由输入，不表示模型拥有无限权限、无限预算、任意命令执行能力，或可以未经验证自动修改 Harness。

## 2. 当前事实基线

### 2.1 已有能力

当前 Workbench 已经具备：

- 基于公开入口的 Direct Pi `AgentHarness` 路径，无 Pi Core Patch；
- 本地持久 Pi Session，可列出、打开、跨进程重建并继续；
- Session、Run、Workspace、Tool、Verifier 和 Outcome 的关联；
- 浏览器到 Thin Local API 再到现有 Workbench 的本地产品表面；
- 安全、受限、可检查的 Session、Run、Comparison、Adaptation 和 State-history 投影；
- 固定 DeepSeek V4 Flash 的真实 Provider 路径；
- Credential opaque read、资源预算、Tool allowlist、Verifier 和 Outcome 边界；
- V3 `prompt_addendum` / `adaptive_skill` 两类 typed Harness State；
- Candidate 暂存、Base/Candidate 验证、Promote/Reject、不可变版本、Active Pointer、Rollback 和选择性绑定；
- 一次真实的、同一 Session 跨两个 Node 进程连续执行的双 Turn 产品 Smoke Test。

### 2.2 当前为什么不是开放式真实 Agent UI

当前 WebUI 的 Session 创建和 Prompt 输入接口是通用形式，但运行路径分为：

1. 默认演示路径：使用确定性 Faux Provider，可以自由输入，但不调用真实模型；
2. Post-V3.5 真实路径：使用冻结的 `real_product_smoke` Authority，只接受预定义的 Project、Workspace、Session、两个 Run ID、两个 Prompt digest、Verifier、工具权限和预算。

真实路径会对 Prompt digest、Run 顺序和 Authority identity 做 fail-closed 校验。因此它证明了真实产品链路，但没有把一次实验 Authority 泛化成可由用户安全创建的日常 Run Authority。

这不是 Pi 或 Direct `AgentHarness` 的能力障碍，而是尚未建设产品级的 Authority minting、Project registration、Verifier profile、State pinning 和操作确认边界。

## 3. 三类行为必须分开

开放 UI 不应把“执行任务”“判断任务结果”和“更新 Harness”混成一个按钮。

### 3.1 Agent Mode：自由 Coding Task

用户可以：

- 选择一个已登记 Project / Workspace；
- 创建或继续一个 Session；
- 自由输入 Coding Task；
- 让 Agent 使用该项目允许的工具和命令；
- 查看对话、Tool lifecycle、文件变化、资源使用和 Run 状态。

Agent Mode 默认不产生正式 Outcome，不自动生成或发布 Harness State。

### 3.2 Verified Run Mode：有权威的任务结果

在 Agent Mode 基础上额外冻结：

- Acceptance Criteria；
- Verifier profile 和源码/配置 digest；
- 可写与受保护路径；
- 命令 allowlist；
- 预算和停止条件。

只有 Verifier 和 evidence integrity 均有效的 Run，才可以成为正式 Outcome，并进入后续 Adaptation 的证据候选集合。

### 3.3 Adaptation Mode：受控更新 Harness State

Adaptation Mode 只能消费经用户选择、且身份完整的 Trace / Verifier / A-B evidence。流程应保持：

```text
Eligible Evidence
  -> Improvement Opportunity
  -> Diagnosis / Lesson
  -> RefinementCandidate
  -> staged_inactive State
  -> Base vs Candidate validation
  -> Promote / Reject
  -> immutable State version
  -> selective binding
  -> regression observation
  -> optional rollback
```

普通 Session、普通对话或单次主观满意不能直接改变 Active State。

## 4. 必须区分的三种版本

### 4.1 Harness Code Version

指 Workbench TypeScript、Runtime、Session、Verifier、Evidence、UI 等程序源码版本。

建议身份：

```yaml
harness_code:
  git_commit: <full-sha>
  dirty: false
  pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
  schema_compatibility: <declared-range>
```

核心代码更新必须通过 Git branch/worktree、测试、审查和 commit 完成，不能作为 Harness State 写入，也不能让运行中的服务直接覆盖自己的 checkout。

### 4.2 Harness State Version

指 V3 已实现的 Prompt / Skill 自适应状态：

```yaml
harness_state:
  project_id: <project>
  state_version: <integer>
  state_digest: <sha256>
  binding_revision: <integer>
  decision_id: <immutable-decision>
```

该版本继续使用已有不可变版本、Active Pointer、expected-active compare-and-swap、原子切换和 Rollback 机制。

### 4.3 Session / Run Evidence Version

每次执行至少冻结：

```yaml
execution_identity:
  session_id: <id>
  run_id: <id>
  session_schema_version: <version>
  run_manifest_schema_version: <version>
  harness_code_commit: <full-sha>
  pi_commit: <full-sha>
  state_version: <integer-or-null>
  state_digest: <sha256-or-null>
  tool_profile_digest: <sha256>
  provider_profile_digest: <sha256>
  verifier_digest: <sha256-or-null>
```

这样才能回答：“这次结果到底由哪一版代码、哪一版 State、哪一套工具和哪一个 Verifier 产生？”

## 5. Session 的 State 固定策略

### 5.1 推荐默认值

创建 Session 时记录 State snapshot：

```yaml
session_state_policy:
  mode: pinned
  state_version: <active-version-at-session-creation>
  state_digest: <active-digest-at-session-creation>
```

同一 Session 后续 Turn 默认继续使用该 State，避免 Active State 更新后，同一长对话中的行为无提示漂移。

### 5.2 显式升级

当新 State 已 Promote 时，UI 可以提供：

- `Continue with pinned State`：保持当前行为；
- `Fork with latest State`：从当前对话派生新 Session，使用最新 State；
- `Upgrade this Session`：高级操作，必须显示旧/新版本和差异，并产生不可变升级记录。

第一版优先支持前两项，暂不建议原地升级 Session。

### 5.3 Run 级冻结仍然保留

即使 Session 已固定 State，每个 Run 仍应写入完整 binding artifact，冻结实际使用的 State、Candidate/Decision/Version lineage 和 applicability 判断结果。

## 6. 防污染策略

### 6.1 默认不学习

Agent Mode 的任何 Run 默认：

```yaml
adaptation_eligibility: false
state_mutation: forbidden
```

只有用户主动选择并通过 eligibility checks 后，Run 才进入 Adaptation Mode。

### 6.2 证据准入

建议最小准入条件：

- Run、Session、Workspace 和 Harness identities 完整；
- Trace terminalization 和 evidence integrity 有效；
- Verifier 已冻结且结果可复算；
- 没有越权修改 Verifier、测试、Acceptance Criteria 或 protected files；
- Failure / inefficiency 能归类为明确的 improvement opportunity；
- Candidate 不携带任务答案、绝对路径、Credential 或一次性数据。

### 6.3 Candidate 隔离

所有 Candidate 必须：

- `staged_inactive`；
- 存放在 Agent Tool Workspace 之外；
- 保留来源 evidence、Diagnosis、Lesson 和 expected base State；
- 只能包含允许的 `prompt_addendum` 或 `adaptive_skill`；
- 不能直接修改 Active Pointer；
- 验证失败后保留 Reject 决策，但不进入 Active State。

### 6.4 验证和发布

第一版继续使用已有 V2/V3 substrate：

```text
same task/related held-out task
same starting Workspace
same Provider/model profile
same Tool profile and budgets
same Verifier
only treatment delta = Candidate State
```

Harness 根据冻结规则产生 Promote/Reject 建议。浏览器中的最终 Promote 最初应要求用户确认，而不是自动发布。

### 6.5 Scope 和 Applicability

State 应至少按 `project_id` 隔离；Applicability 继续使用可信的 task kind 和 failure family，不直接依赖模型任意输出的标签。

第一版不做跨项目自动共享，也不做语义检索、LLM Router 或全局 Experience Repository。

### 6.6 回滚和 Kill Switch

需要提供：

- 查看 Active State 及其上一版本；
- 查看 Promote/Reject/Rollback lineage；
- 通过 expected-active identity 执行受保护 Rollback；
- 全局临时禁用 Adaptive State，回到 immutable base prompt；
- Run 启动时 State integrity 无效则 fail closed，而不是静默使用损坏状态。

## 7. 开放式真实 Run Authority

不应直接删除现有 Authority 检查，而应增加由本地主机受控生成的日常 Authority。

### 7.1 Project Registration

用户先登记项目：

```yaml
project_profile:
  project_id: <stable-id>
  workspace_root: <canonical-path>
  writable_paths: [src/**, test/**]
  protected_paths: [.git/**, package.json]
  tool_profile_id: <profile>
  command_profile_id: <profile>
  verifier_profiles: [optional-list]
  default_budget_profile: <profile>
  default_state_policy: pinned
```

Workspace root、State root、Evidence root 和 Credential file 不能由浏览器任意传入；浏览器只发送已登记的 opaque ID。

### 7.2 Host-side Authority Minting

用户点击执行后，本地主机根据登记配置生成并持久化一次 Run Authority，至少冻结：

- 用户原始 Prompt digest；
- Project、Workspace、Session 和 Run identities；
- Provider/model profile；
- Tool/command policy；
- State binding；
- 预算与 deadline；
- Verifier profile或 `unverified_interactive`；
- Credential profile name，但不包含 Credential 内容。

Authority 必须先持久化成功，再读取 Credential 和 dispatch。

### 7.3 两类 Outcome

开放 UI 应明确区分：

```yaml
interactive_run:
  outcome: unverified
  adaptation_eligible: false

verified_run:
  outcome: passed | failed | invalid
  adaptation_eligible: integrity_valid && verifier_completed
```

“Agent 说完成了”不能等同于正式 Outcome。

## 8. 工具、权限和预算

### 8.1 工具 Profile

第一版建议固定少量 Profile，而不是提供任意 Shell：

- `inspect_only`：读取、搜索和列目录；
- `bounded_edit`：读取、写入、编辑和已登记测试命令；
- `git_worktree_development`：后续可选，仅用于受控代码开发。

命令通过 logical command ID 映射到主机端固定 executable、argv、cwd 和环境 allowlist。浏览器不得发送任意 executable 或 shell 字符串。

### 8.2 权限确认

首版可以采用简单确认层：

- 普通 allowlisted read/edit：按 Project Profile 自动允许；
- 新命令、protected path、Workspace 外路径：拒绝；
- Git commit、安装依赖、外部副作用：单独 Profile 或人工确认；
- 修改 Verifier、测试、Acceptance Criteria：Verified Run 中默认拒绝。

### 8.3 预算

开放输入不等于开放预算。每个 Run 应有：

- Provider request；
- Tool call；
- token；
- cost；
- wall time；
- output size；
- optional verifier time。

预算配置由主机登记的 Profile 决定，UI 只能在允许范围内选择。

## 9. Harness 自身源码更新

如果用户让 Agent 使用本项目作为 Workspace 来修改 Harness 本身，应视为普通软件发布，不属于 V3 State Adaptation。

推荐流程：

```text
accepted Harness Git commit
  -> isolated worktree/branch
  -> Agent edits source
  -> strict TypeScript + focused tests + affected regressions
  -> verifier/review
  -> bounded implementation commit
  -> human acceptance
  -> release/fast-forward integration
  -> restart on accepted commit
```

运行中的服务不得修改自身 checkout。新 Run Manifest 应记录 Harness commit；旧 Session 仍可检查，但如果 schema 不兼容，应只读打开或经过显式 migration。

核心 Runtime、Verifier authority、State Store、Credential、安全边界的修改，不能依靠 Harness State Promote 机制发布。

## 10. 建议的最小产品架构

```text
Browser
  -> Thin Loopback API
     -> Project Registry (host-only paths/profiles)
     -> Authority Minter
     -> Session Service / JsonlSessionRepo
     -> Direct Pi AgentHarness
     -> Tool & Budget Controller
     -> optional External Verifier
     -> Run/Evidence Store
     -> safe Read Model

Adaptation UI
  -> Evidence Eligibility Check
  -> existing V3 Candidate/Staging
  -> existing V2/V3 Validation
  -> guarded Promote/Reject/Rollback Controller
```

Direct `AgentHarness` 继续作为主路径。此工作不需要切换 Pi SDK/Extension/RPC，也不需要修改 Pi Core。

## 11. 推荐实施顺序

### Milestone A：开放式真实 Agent Run

目标：可以在登记项目中自由输入真实任务，但不自动修改 Harness State。

最小内容：

1. Project Profile 和 Host-only Registry；
2. 动态但受控的 Run Authority minting；
3. 真实 Session create/open/continue；
4. `interactive_unverified` 与 `verified` Run 类型；
5. 固定 Provider、Tool、Budget profiles；
6. Session State pinning；
7. Run Manifest 写入代码/Pi/State/profile identities；
8. WebUI 显示执行状态、Tool、预算、Verifier、Outcome 和使用的 State。

Exit Criteria：

- 任意两项预先登记的低风险 Coding Task 可以从 UI 输入并 settled；
- 服务重启后同一 Session 可继续；
- 每次真实 dispatch 前 Authority 已持久化；
- 未验证 Run 不伪装为 passed/failed Outcome；
- Credential 和 host-only paths 不进入浏览器安全投影；
- 无 Harness State mutation。

### Milestone B：受控 Adaptation UI

目标：从合格证据发起现有 V3 State pipeline，而不是建设新的学习平台。

最小内容：

1. 选择一个 eligible Run/Comparison；
2. 展示 Evidence → Diagnosis → Lesson → Candidate；
3. 创建 `staged_inactive` Candidate；
4. 使用现有验证 substrate；
5. 展示 Base/Candidate、回归和 Promotion 决策；
6. 用户确认 Promote/Reject；
7. guarded Rollback；
8. Session Fork with latest State。

Exit Criteria：

- 普通 Agent Run 无法直接改变 Active State；
- Candidate、Validation、Decision、Version 和 Binding lineage 可端到端复算；
- Promote 需要完整验证且 State-only treatment delta；
- stale update 和损坏 State fail closed；
- Rollback 后新 Run 使用目标版本，历史 Run 仍保留原 binding；
- 不引入 Router、Curator、Memory 或自动发布。

### Milestone C：Harness 源码 Dogfooding（可选、后置）

目标：允许该 Agent 在隔离 worktree 中开发 Harness 自身，但仍通过 Git 和人工发布，不进行运行时自修改。

该 Milestone 不应成为开放 UI 的前置条件。

## 12. 不建议第一版实现的内容

- 任意 Shell 或浏览器提交任意 executable/argv；
- 自动安装依赖；
- 自动 Git commit/merge/push；
- 普通对话结束后自动生成和 Promote State；
- 跨项目全局 Skill 池；
- Semantic Memory、Vector DB、Experience Repository；
- LLM Router、Curator、Runtime Policy optimizer；
- 多用户、远程部署和分布式 State Store；
- 实时 token streaming 作为首版完成条件；
- Agent 修改 Verifier、测试或 Acceptance Criteria 后仍把结果视为有效验证；
- 运行中的 Harness 覆盖自身源码或自动发布自身新版本。

## 13. 主要风险与 Hard Stops

出现以下情况应暂停设计或实施并由 Main 与用户决定：

1. 动态 Authority 需要把 host path、Credential 或任意命令开放给浏览器；
2. 只有移除 fail-closed evidence/Verifier/State identity 才能支持自由输入；
3. Session continuation 无法在明确 State 版本下保持可解释性；
4. Agent 必须修改当前运行 checkout 才能支持 Harness 更新；
5. State Promote 无法保持 Base/Candidate 对称和外部 Verifier authority；
6. 需要 Pi Core Patch 或切换 SDK/Extension/RPC 才能完成首版；
7. UI 开始演变为完整 IDE、终端模拟器或通用 Eval 平台；
8. 同一个 Session 无提示地跨 State 版本运行；
9. 未验证的交互 Run 被用于自动学习或 Portfolio 效果结论。

普通 TypeScript、HTTP、UI、serialization、path、fixture、CSS 和 profile 配置问题属于正常软件开发，不应自动升级为复杂审计或多阶段治理。

## 14. 推荐决策

**Recommendation.** 如果后续决定建设开放 UI，先冻结一个轻量产品化版本，只完成 Milestone A：

> 任意用户任务可以通过真实 Direct Pi 路径运行，Session 可持久继续，Run Authority、工具、预算和证据完整，但任何 Harness State 更新仍默认关闭。

Milestone A 稳定并经过真实用户体验后，再实施 Milestone B，把已经存在的 V3 Candidate、Validation、State Store 和 Rollback 能力通过受保护的操作界面暴露出来。

该顺序既不会浪费现有 V3/V3.5 工作，也能避免把“开放式 Agent UI”和“自动自进化平台”一次性绑在一起，从而降低复杂度和污染风险。

## 15. 当前停止点

本文落盘后：

- 不修改 `CURRENT_STATE.md`；
- 不激活新版本或 Goal；
- 不创建 Project Registry 或开放 Authority；
- 不调用模型、读取 Credential 或联网；
- 不修改 Workbench、Pi、State Store 或现有 evidence；
- 不创建 Git commit。

后续若用户决定实施，应先审查本文并明确：版本命名、Milestone A Scope、默认 Tool Profile、Session State pinning、Verified Run 最小语义、真实模型预算及实施 Session owner。
