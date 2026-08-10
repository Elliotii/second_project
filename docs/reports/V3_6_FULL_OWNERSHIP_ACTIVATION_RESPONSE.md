# V3.6 Full-Ownership Activation Response

```yaml
status: accepted_activated
version: V3.6_Open_Interactive_Agent_Mode
accepted_by_user: 2026-08-10
active_goal: V3_6_VERSION_EXECUTION
charter_started: false
implementation_started: false
```

## 1. 最终架构理解

V3.6 保持两个 Goal：

- **Goal 1：Open Authority and Pinned Session Control Plane**
  - 建立开放任务入口；
  - 由服务端铸造 Run Authority；
  - 固定 Session、Project、Harness State、Tool/Capability Profile 和 Execution Backend identity；
  - 提供安全、只读的 Product UI。
- **Goal 2：Bounded Execution, Change Handoff and Real Product Acceptance**
  - 让 registered command 进入唯一 Docker execution backend；
  - 形成 ToolResult、Trace 和不可变 Evidence；
  - 从 settled managed Workspace 生成 immutable ChangeSet；
  - 经用户审阅后，由宿主执行 Apply All 或 Discard；
  - 完成真实、连续两 Turn 的 Product Acceptance。

最终责任边界为：

```text
Host owns:
  Direct Pi AgentHarness
  Provider / Credential
  Persistent Session
  Harness State
  Run Authority
  Verifier / Outcome
  Evidence authority
  ChangeSet / Source Apply authority

Docker owns only:
  execution of one Host-authorized registered command
  inside one disposable Linux container
```

Docker 只获得 canonicalized、link-free 的当前 `managed_session_copy`。它不得获得 registered Source、`.git`、用户 home、`.runs`、Credential、Harness State、Verifier、Authority root 或 Docker socket/named pipe。

核心原则保持：

> **Agent proposes; Harness disposes.**

普通 interactive run 默认仍是：

```yaml
verification_status: unverified
formal_outcome: null
adaptation_eligible: false
comparison_eligible: false
promotion_eligible: false
```

Agent 自称完成不等于 formal PASS。

## 2. Charter 到 Closeout 的执行方式

最终 Activation 后，Main Session 将按以下顺序自主推进：

```text
正式化 V3_6_CHARTER
→ 同步控制状态
→ 创建并核验 Control Baseline Commit
→ 生成 Goal 1 Contract / Prompt
→ 创建新的顶层 Goal 1 Implementation Session
→ Main 轻量验收
→ 普通缺陷返回原 Session 有界修复
→ 整合 Goal 1 Implementation Commit
→ Goal 1 Closeout
→ Docker readiness blocking Gate
→ 生成 Goal 2 Contract / Prompt
→ 创建新的顶层 Goal 2 Implementation Session
→ deterministic acceptance
→ 风险触发时才做 focused audit
→ 必要时创建 fresh no-source-edit Product Acceptance Session
→ 真实连续两 Turn Journey
→ Goal 2 Closeout
→ V3.6 final regression
→ 同步 Charter / CURRENT_STATE / README / Architecture / Interview material
→ V3.6 Final Closeout Commit
```

普通 TypeScript、Node、fixture、CLI argument、serialization、path、CSS、i18n、UI projection、Docker command construction 和 focused-test 缺陷按正常软件开发处理，不自动升级为新 Stage、R1/R2、Amendment 或独立审计。

独立审计只在实现真实触碰以下高风险边界时使用：

- Run/Session Authority；
- Credential projection；
- Docker containment、timeout、descendant termination 或 cleanup；
- immutable ChangeSet、preimage/stale/tamper protection；
- host-controlled Source Apply；
- safe browser projection。

## 3. Pi Web 的吸收边界

`agegr/pi-web` 只作为 UI/Productization reference，不作为 Runtime 或 Architecture dependency。

### Goal 1 可吸收

- managed Session Workspace 的 file tree；
- read-only file preview；
- 明确提示该 Workspace 不是 registered Source；
- Pi native Skills 与 Harness validated/promoted Adaptations 的区分；
- Adaptation 的 name、description、scope/source、available/bound 等安全字段；
- Model、Harness State、Capability/Tool Profile、Execution Backend、Verification Status 等轻量 Run Context。

### Goal 2 可吸收

- 熟悉、清晰的 Files / Changes / Diff 阅读交互；
- ChangeSet lineage 与 Apply/Discard 状态展示。

### 明确不做

- 文件编辑器；
- create/delete/rename 文件操作；
- terminal 或完整 IDE；
- Skill install、marketplace、search、edit、enable/disable；
- Permission 平台；
- Git branch/commit/merge 或 per-hunk apply 平台；
- Pi Web Runtime、Pi Extension/RPC 切换；
- 新的 resource/lifecycle manager。

UI diff 始终只是安全 projection，不是 Source mutation authority。

## 4. Docker readiness 是 Goal 2 blocking prerequisite

Goal 2 在任何真实 Agent command dispatch 前，必须确定性证明：

- Docker client/server ready；
- Docker Desktop WSL 2 Linux backend ready；
- immutable image digest；
- exact backend/profile identity；
- `network none`；
- read-only root 和 bounded temporary filesystem；
- non-root user；
- capability drop 和 no-new-privileges；
- CPU、memory、PID、wall-time、output limits；
- 唯一读写 mount 是当前 managed Workspace；
- sensitive Host roots inaccessible；
- timeout 能终止完整 descendant tree；
- stdout、stderr、exit、timeout 能进入既有 ToolResult / Trace；
- cleanup deterministic；
- drift、unavailable、tamper fail closed；
- representative registered project 能在 frozen Linux image 且 runtime no-network 的条件下运行 registered commands。

任何关键证明失败时：

```text
fail closed
→ no Host fallback
→ no sandboxed claim
```

如果项目依赖 Windows-only executable 或不兼容 frozen Linux image，它在 V3.6 首版中属于 unsupported project，而不是切回 Host execution 的理由。

## 5. Change Handoff 两项 clarification

### 5.1 Partial multi-file Apply

V3.6 不假装 per-file atomic rename 等于 multi-file transaction。

建议采用轻量实现：

```text
immutable ChangeSet
→ preflight all files
→ persist apply journal / recovery material
→ apply files one by one with atomic leaf replacement
→ persist each terminal file result
```

如果部分文件已 Apply 后发生异常：

- 返回真实 `partial_apply_error`；
- 明确哪些文件成功、失败或尚未尝试；
- 保存必要的 `before_blob_ref` 或等价最小 recovery material；
- 不把状态显示为 complete、rolled_back 或 retry-safe；
- 不建设通用 transaction engine。

若无法形成 recoverable、non-misleading semantics，则触发 Hard Stop。

### 5.2 First-version post-Apply lifecycle

首版冻结：

> **每个 Session 最多一次成功 Source Apply。**

成功 Apply 后继续 Coding 必须采用：

```text
current registered Source
→ New Session
→ new managed workspace
→ new pinned identities
```

V3.6 不实现 post-Apply workspace rebase、handoff epoch、同 Session Source resync 或多次 Apply。

## 6. 自治后 Main 自行决定的事项

最终 Activation 后，在冻结范围内 Main 可以自行：

- 正式化 Charter 和两个 Goal Contract；
- 创建并管理新的顶层 Goal Implementation Session；
- 选择窄接口、schema、adapter 和文件布局；
- 修改正常项目源码；
- 编写 focused tests 与 fixture；
- 处理 typing、serialization、path、UI、Docker argv、timeout、cleanup 等普通缺陷；
- 将有界 finding 返回原 Implementation Session 修复；
- 决定是否满足风险触发条件并创建一次 focused audit；
- 执行 deterministic acceptance；
- 在已授权 Credential、network 和 budget 内执行 real product acceptance；
- 完成 Goal closeout、状态同步和 V3.6 final closeout。

Main 仍负责架构、范围、事实接受和最终 claim；Implementation Session 只负责其 Contract 内的实现、测试、证据与 Closeout Draft。

## 7. 需要重新找用户的 Hard Stop

只有出现真实 boundary/authority change 时暂停，包括：

1. 需要改变两个 Goal，或实质扩大/缩减 V3.6；
2. 需要第二 backend、重新选型或 Host fallback；
3. Docker readiness 出现无法在当前合同内解决的 Hard Stop；
4. 必须改变 `managed_session_copy`；
5. 必须改变 Persistent Session、Harness State、Verifier、ChangeSet 或 Source Apply authority；
6. 需要修改 Pi Core 或切换 Direct AgentHarness、SDK、Extension、RPC 路线；
7. 需要建设通用 Sandbox、Permission、Git、IDE 或多 backend platform；
8. 发现 accepted V3/V3.5/Post-V3.5 事实存在会影响 claim 的重大 correctness defect；
9. 需要用户执行或接受尚未授权的外部动作；
10. 需要超出 Credential、network、real-model 或成本预算；
11. 无法形成真实、完整且不误导的 acceptance claim。

## 8. 当前剩余前提

当前没有未解决的架构未知项。仍需最终 Activation 明确覆盖以下运行与治理权限：

- Docker Desktop 安装及许可接受；
- Docker image 获取所需外部网络；
- Goal 2 真实模型调用所需 Credential、Provider 网络和预算；
- Control、Goal integration 和 Final Closeout Git Commit 权限。

当前只读事实：

```yaml
docker_cli_installed: false
sbx_cli_installed: false
wsl_version: 2.6.3.0
v3_6_active_goal: null
selection_report_committed: false
```

Docker 未安装是 Goal 2 的外部 prerequisite，不是架构未知。Selection Report 尚未提交是 Activation 前的机械控制状态，也不要求重新规划 V3.6。

## 9. Activation boundary

本文件只记录 Full-Ownership Activation Response：

```yaml
v3_6_activation_authorized: true
charter_creation_authorized: true
implementation_authorized: true
docker_install_authorized: false_requires_user_install_and_license_acceptance
external_network_authorized: bounded_backend_acquisition_and_real_acceptance_after_required_gates
credential_read_authorized: bounded_real_acceptance_only_after_execution_baseline
real_model_call_authorized: bounded_real_acceptance_only_after_execution_baseline
git_commit_authorized: control_goal_integration_and_final_closeout
```

用户已完成最终 Activation Review。Main 获得 V3.6 端到端自治执行权；Docker Desktop 安装与许可接受仍是必须由用户本人完成的外部 prerequisite。其余工作按 `V3_6_LONG_RUNNING_EXECUTION_PLAN.md` 连续推进，只有本文件第 7 节列出的 Hard Stop 才返回用户。
