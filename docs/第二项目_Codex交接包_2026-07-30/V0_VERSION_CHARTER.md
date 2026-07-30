# Adaptive Coding Agent Harness — V0 Version Charter

```yaml
status: accepted
document_kind: V0_version_charter
date: 2026-07-30
accepted_by_user: 2026-07-30
binding_revisions_integrated: true
binding_review: 第二项目_三份草案验收与V0冻结建议_2026-07-30.md
version: V0
version_name: Evidence-grounded Coding Agent Workbench
project_identity_long_term: Reliability-first Adaptive Coding Agent Harness
current_active_goal: V0_C_BOUNDED_COMPLETION_AND_USER_FACING_USE
V0_A_status: closed_accepted
V0_A_implementation_owner: dedicated_v0_a_goal_session
V0_A_implementation_started: true
V0_A_implementation_completed: true
V0_A_implementation_baseline_commit: 1a1565fa7e6d1440c8f99e2c7e587201a14111c1
V0_B_status: closed_accepted
V0_B_implementation_owner: dedicated_v0_b_goal_session
V0_B_implementation_started: true
V0_B_real_model_calls_authorized: 0
V0_C_status: accepted_activated_pending_stage_1_implementation
V0_C_implementation_owner: dedicated_v0_c_stage_1_implementation_session
V0_C_implementation_started: false
V0_C_real_model_calls_authorized: 0
formal_workbench_created: true
pi_go_status: accepted_for_V0_scope
completion_mechanism_status: accepted_for_V0_not_implemented
V1_status: continuity_only_not_authorized
V2_status: portfolio_north_star_not_authorized
implementation_authorized_by_this_charter: false
real_model_call_authorized_by_this_charter: false
git_commit_authorized_by_this_charter: false
```

> 本文冻结 V0 的版本语义和治理边界。它不创建 `workbench/`、不激活 Goal，也不授权实现、真实模型调用或 Git 提交。

```yaml
charter_semantics:
  binding:
    - object_responsibilities
    - identity_and_lineage_requirements
    - protected_boundaries
    - outcome_semantics_direction_and_precedence
    - non_goals
    - goal_decomposition
    - definition_of_done
    - V1_V2_continuity

  implementation_details_delegated_to_accepted_goal_contracts:
    - exact_field_names
    - exact_file_layout
    - exact_cli_argument_shape
    - exact_enum_spelling
    - exact_adapter_method_signatures

  changes_requiring_main_session_and_user_review:
    - Task_Run_Attempt_object_boundaries
    - Attempt_lineage
    - Verifier_authority
    - Outcome_and_Invalid_semantics
    - Pi_Adapter_boundary
    - Recovery_Budget
    - V1_V2_continuity
    - Non_goals
```

每个 V0 Goal 可以在不改变上述绑定语义的前提下，由已接受的 Goal Contract
冻结该 Goal 的实现字段、目录和方法签名。当前 V0-A 已关闭接受；V0-B 的实现
细节以正式 `V0_B_GOAL_CONTRACT.md` 为准。

---

## 1. Version Mission

V0 的使命是：

> 建成一个可以实际执行 Coding Task、控制受限 Workspace、关联 Pi Session 与关键事件、在 Agent settled 后由外部确定性 Verifier 判断环境 Outcome，并保存可复核证据的最小 Coding Agent Workbench。

V0 必须是可运行产品基础，不是一次新的 Spike，也不是只生成比较报告的脚本集合。

V0 成功后，用户应能完成：

```text
选择 TaskSpec 与 Strategy
→ 预检配置和 Workspace
→ 运行 Pi Agent Cycle
→ 保存 Session/Journal/Tool/Usage 证据
→ 在 settled 后运行外部 Verifier
→ 按有界 Completion Policy 停止或恢复
→ 获得可追溯 Outcome
→ inspect 关键证据和失败归因
```

V0 不负责证明某个 Policy 提高成功率。它负责让该问题在 V1 可以被公平、重复、环境级地回答。

---

## 2. Current Evidence Baseline

### 2.1 已证明

**Fact.** 固定 Pi `027a5847901b5dde30270abaa1041046cd2b4b55` 的 public `@earendil-works/pi-agent-core` 导出 `AgentHarness`、Session、JSONL Repo、Tools 和相关类型。

**Fact.** G003 证明：

- 公共 emitted import 可消费；
- 固定 Faux Provider 可非交互运行；
- 外部 Driver 可控制 Workspace；
- Verifier 可在 settled 后执行；
- Candidate 可在同 Session 接收结构化失败反馈并完成一次恢复；
- Manifest、Journal、Session、Verifier、Outcome 可关联；
- Pi Core patch 为 0。

**Fact.** G006 证明：

- Windows/Node/strict TypeScript/公共 emitted path 可运行；
- DeepSeek V4 Flash 真实 Tool Loop 可运行；
- `subscribe(...)` 可观察 Provider Response；
- Journal v2 closed envelope 可保持事件身份；
- Tool Call、Tool Result、Session、Verifier、Outcome 可关联；
- Verifier 在 settled 后运行；
- 两个策略均在首次验证通过，因此没有触发恢复；
- 凭据和 reasoning body 未进入项目证据。

### 2.2 未证明

- 真实模型在 Verifier 失败后的恢复；
- Completion Verification 相对 Baseline 或 Skill-only 的效果；
- 跨任务、跨模型或跨 Pi Commit 泛化；
- V0 Tool Profile 的精确 Wrapper/命令白名单；Tool Profile 方向、Prompt 来源和 Recovery Budget 已冻结；
- settled Session 跨进程重建；
- crash-after-side-effect reconciliation；
- 长 Tool cancellation、真实 compaction pressure；
- Worktree 的必要性；
- Policy Promotion threshold。

### 2.3 证据解释

```text
G001 + G003 + G006
  = Direct Pi architecture/integration mechanism works

G001 + G003 + G006
  ≠ Completion Policy improves coding performance
  ≠ final product reliability proven
```

---

## 3. Pi Go Scope

### 3.1 候选决定

**Decision.** 接受一个严格限定的 V0 Pi Go：

```yaml
runtime: public_direct_pi_agent_core_AgentHarness
pinned_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
package_version: 0.82.1
node_engine: ">=22.19.0"
license: MIT
host_environment: Windows_native_Node_TypeScript
pi_core_patch_allowed: false
private_import_allowed: false
sdk_runner_status: deferred_compatibility_comparator
rpc_status: conditional_only_after_observed_isolation_need
```

### 3.2 Go 的含义

Go 只表示 Direct `AgentHarness` 可以作为 V0 Runtime engine。它不表示：

- Pi 是 Workbench；
- Pi 已提供本项目的 Outcome、Verifier、Strategy 或 Eval；
- Pi 已提供完整 permission sandbox；
- Pi 已解决 crash-safe exactly-once；
- Pi 已提供完整 durable resume；
- 后续升级不需要回归。

### 3.3 Adapter 边界

V0 必须将 Pi 细节集中在 `PiAdapter` 或同等单一边界中，至少封装：

- Harness/Session/ExecutionEnv 构造；
- Model 和 Thinking 配置；
- Tool Registry 注入；
- public lifecycle subscription；
- prompt、settlement、abort；
- Pi Session identity/path；
- usage/response metadata 的安全投影；
- Pi error 到项目 failure class 的映射。

业务层不得依赖 Pi private source path、TUI state 或 G006 hard-coded driver。

### 3.4 复审触发

- pinned Commit 改变；
- public emitted import/type/build 回归；
- V0 Tool Profile 只能通过 private import 或 Pi patch 实现；
- Observer 无法提供 Outcome 所需的最小事件；
- Session/Tool identity 无法关联；
- real coding task 在 Direct 路径出现可复现阻塞；
- SDK/RPC 明确因果解决 Direct 路径的已观察故障。

---

## 4. Product Surface

V0 推荐只有两个必需用户入口和一个预检模式：

### 4.1 `run`

```text
workbench run <task-spec> --strategy <strategy-id>
```

职责：验证输入、物化 Workspace、创建 Run/Attempt、运行 Agent、执行 Verifier、保存 Outcome。

### 4.2 `inspect`

```text
workbench inspect <run-id-or-attempt-id>
```

职责：显示状态、策略、Session/Workspace/Verifier identity、预算、terminal reason、failure attribution 和 artifact links。默认不显示秘密、完整 reasoning 或无预算的大对象。

### 4.3 `run --dry-run`（建议）

只解析和验证：

- Task/Strategy/Tool/Profile/Model/Verifier；
- Source/Workspace materialization plan；
- 预算和 secret requirements；
- 将写入的 artifact roots。

不得创建正式 Attempt、调用模型、运行 Tool 或修改目标 Workspace。若用户决定采用高级 Plan/Checkpoint，可在具体 Goal 前研究 SearchCLI；V0 不因该研究而阻塞。

### 4.4 非 V0 主入口

- `compare`：V1 可基于多个独立 Run 聚合；V0 不写死 Pair；
- Dashboard/Web UI：不做；
- 通用 Schema Browser：不做；
- Experience/Skill/Router 管理 CLI：不做；
- 自动 Publish/Apply：不做。

---

## 5. Architecture and Responsibilities

### 5.1 最小架构

```text
CLI
  → Spec Loader / Preflight
  → Run Coordinator
      → Workspace Provider
      → Strategy Resolver
      → Pi Adapter
          → AgentHarness
          → Session
          → Tool Profile
      → Evidence Journal
      → External Verifier Runner
      → Completion Controller
      → Outcome Builder
  → Inspector / Reporter
```

### 5.2 责任表

| 组件 | V0 责任 | 不负责 |
| --- | --- | --- |
| CLI | `run`、`inspect`、预检、退出码 | TUI、Dashboard、远程平台 |
| Spec Loader | 解析、Schema 校验、digest、引用解析 | 自动猜测验收标准 |
| Run Coordinator | 状态机、预算、Attempt lineage、调用顺序 | Agent 推理 |
| Workspace Provider | 隔离物化、路径边界、初始/最终 digest | 通用 Sandbox、Exactly-once |
| Strategy Resolver | 组合 base prompt、skill refs、completion mode | 自动选择最佳 Route |
| Pi Adapter | Pi 生命周期、Session、Tools、abort/settle | Outcome 和 Policy 效果判断 |
| Tool Profile | 能力可见性、参数/路径/命令约束、审计 | OS 全面安全隔离 |
| Evidence Journal | closed envelope、IDs、事件投影、artifact refs | 保存完整秘密或无限输出 |
| Verifier Runner | settled 后执行外部验证并保存结果 | 让 Agent 改 Verifier/Acceptance Criteria |
| Completion Controller | 根据 Verifier、Strategy、Budget 决定 stop/recover | 无限重试、V2 Router |
| Outcome Builder | 归因、状态、证据完整性 | 统计 Policy 提升 |
| Inspector | 最小人类可读追溯 | 大型 Report/BI 平台 |

### 5.3 状态机

```text
planned
→ preflight_passed
→ workspace_ready
→ attempt_running
→ agent_settled
→ verifier_running
→ verifier_completed
→ policy_decided
→ [child_attempt_running | run_terminal]
```

任何 Observer、Journal、Verifier 或 provenance 缺失都不得自动落成 `task_failed`；应进入 `invalid` 或暂停路径。

### 5.4 已冻结的横切决定

```yaml
system_prompt:
  source: project_owned_minimal_base
  task_instruction_overlay: separate
  future_skill_overlay: separate
  claude_prompt_copy: forbidden

workspace:
  V0_default: temporary_copy
  worktree_implementation: deferred
  workspace_provider_boundary: required

reference_acquisition:
  searchcli_now: false
  papers_now: false
  policy: acquire_only_on_specific_goal_or_version_gate

external_module_port:
  pre_authorized_now: none
  reuse_in_principle: allowed
  future_gate: source_version_license_attribution_and_validation

real_recovery_observation:
  route: natural_V0_V1_runs
  forced_Phase_3B: rejected
```

System Prompt、Task instruction 和未来 Skill overlay 必须拥有独立 identity/digest，避免 V1 比较时把 Skill 效果混入 base prompt。

---

## 6. Data Contracts

V0 使用版本化、append-friendly、可演进的 JSON/JSONL 合同。以下对象职责、identity 和 lineage 是绑定语义；字段名、文件布局、CLI 参数、枚举拼写和 Adapter 方法签名是 V0-A Contract 候选，不因出现在 Charter 中就成为不可更改的实现细节。

### 6.1 `TaskSpec`

```yaml
schema_version: 1
task_id: string
title: string
instruction_ref: artifact_ref
instruction_sha256: string
workspace_source:
  kind: fixture_or_directory_or_git
  source_ref: string
  source_identity: string
verifier_ref: artifact_ref
verifier_sha256: string
tool_profile_id: string
acceptance_visibility: public_or_hidden_external
limits_ref: string
```

规则：Agent 可见的任务说明与外部 Acceptance Criteria 必须区分。最终 Verifier 和隐藏验收资产不得位于 Agent 可写范围。

### 6.2 `StrategySpec`

```yaml
schema_version: 1
strategy_id: string
base_prompt_id: string
skill_refs: []
completion_policy_id: observe_only_or_verify_recover_once_same_session
recovery_mode: none_or_same_session
tool_profile_id: string
model_profile_id: string
```

V0 不限定 `strategy_id` 为 `baseline/candidate`。V1 可新增 `baseline`、`skill_only`、`skill_plus_runtime`，而不改 Run/Attempt Schema。

### 6.3 `Run`

```yaml
schema_version: 1
run_id: string
task_id: string
strategy_id: string
comparison_group_id: string_or_null
created_at: rfc3339
status: planned_or_running_or_terminal
config_digest: sha256
source_identity: object
provider_identity: redacted_object
budget: object
attempt_ids: []
```

一个 Run 执行一个 Task + Strategy。公平比较通过多个独立 Run 的 `comparison_group_id` 或报告层完成。

### 6.4 `Attempt`

```yaml
schema_version: 1
attempt_id: string
run_id: string
ordinal: integer
strategy_id: string
parent_attempt_id: string_or_null
trigger: initial_or_verifier_failure_or_user_resume
session_id: string
workspace_id: string
started_at: rfc3339
settled_at: rfc3339_or_null
terminal_reason: string_or_null
budget_allocation: object
budget_usage: object
```

定义：一个 Attempt 是一次有界 Agent Cycle，从 prompt/input 开始，到 Agent settled/abort/error 和一次随后 Verifier/Policy decision 边界结束。

V0 same-session recovery 创建 child Attempt，复用 `session_id` 和 `workspace_id`。V2 clean-session recovery 可以创建 child Attempt，使用新 `session_id` 和新/重建 `workspace_id`，无需改变 Schema。

### 6.5 `WorkspaceRef`

```yaml
workspace_id: string
provider: temp_copy
root_ref: redacted_or_project_relative
source_identity: object
initial_tree_digest: sha256
final_tree_digest: sha256_or_null
parent_workspace_id: string_or_null
write_scope: []
```

V0 默认 `temp_copy`。`git_worktree` 只作为未来 provider 候选，不是硬要求。

### 6.6 `SessionRef`

```yaml
session_id: string
runtime: pi_agent_core
pi_commit: string
storage_ref: artifact_ref
metadata_digest: sha256
model_profile_id: string
tool_profile_id: string
reasoning_persistence: metadata_only_or_none
```

Session 是 Agent 对话/状态记录，不是 Run、Workspace、Policy 或 Outcome 的唯一真相源。

### 6.7 `JournalEntryV0`

```yaml
schema_version: 1
seq: integer
timestamp: rfc3339
type: closed_event_enum
run_id: string
attempt_id: string
session_id: string
workspace_id: string
data: object
```

规则：`data.type` 不得覆盖外层 `type`；大结果写 Artifact，并在 `data` 保存 digest、size、truncation 和 retrieval ref。

### 6.8 `VerifierResult`

```yaml
schema_version: 1
verifier_id: string
verifier_sha256: string
attempt_id: string
started_at: rfc3339
completed_at: rfc3339
status: passed_or_failed_or_invalid
exit_code: integer_or_null
summary: bounded_string
full_output_ref: artifact_ref
full_output_sha256: sha256
```

### 6.9 `Outcome`

```yaml
schema_version: 1
run_id: string
final_attempt_id: string
status: passed_or_failed_or_invalid_or_cancelled
failure_class: agent_or_verifier_or_infrastructure_or_evidence_or_budget_or_user_or_null
terminal_reason: string
initial_verifier_status: string_or_null
final_verifier_status: string_or_null
recovery_triggered: boolean
attempt_count: integer
evidence_index_ref: artifact_ref
```

`unconfirmed` 是报告结论或研究状态，不建议作为一次完成 Run 的终态；若关键证据不足，应使用 `invalid` 并说明缺失。

---

## 7. Tool / Session / Workspace

### 7.1 Tool Profile

V0 Tool Profile 的能力方向冻结为：

```yaml
V0_tool_profile:
  file:
    - read
    - list
    - search
    - edit
    - write

  shell:
    mode: allowlisted_or_policy_checked
    allowed_by_default:
      - test
      - build
      - typecheck
      - lint
      - repository_inspection

  git:
    allowed_by_default:
      - status
      - diff
      - log_when_needed
    forbidden_by_default:
      - commit
      - push
      - destructive_reset
      - uncontrolled_checkout

  forbidden_by_default:
    - network_access
    - package_installation
    - background_service
    - workspace_external_write
    - privilege_escalation
```

所有 Tool 必须具有稳定 call ID、schema validation、start/end/error/abort evidence；stdout/stderr 必须有预算，完整大输出外置时保留 retrieval ref；路径 canonicalize 后必须仍在 Workspace read/write scope。

**Fact.** 固定 Pi 公共入口导出 `createReadTool`、`createEditTool`、`createWriteTool` 和带 `prepare` hook 的 `createBashTool`；`NodeExecutionEnv` 本身允许绝对路径，并不是 Workspace sandbox。因此 V0 不能直接把未包裹的 built-in file/bash tools 当作安全边界。

**Binding direction for V0-A.** V0-A Contract 必须基于真实 Pi 能力冻结：复用哪些 public built-in tool、如何增加 Workspace canonical-path/symlink boundary、如何补齐 list/search、如何用无任意 shell 的 command ID 或等价 policy check 实现命令白名单。精确 Wrapper 名称和命令描述符仍属于 V0-A Contract 实现约束。

### 7.2 Session

- 每个 Attempt 必须明确 `session_id`；
- same-session recovery 的 child Attempt 复用 Session；
- Session entries 与 Tool Call/Result 必须可配对；
- V0 不承诺跨进程 resume；
- settled 后进程退出可以保留 Session artifact，但重新继续是未来条件性 case；
- Session persistence 失败使 Run `invalid`，不能只靠 Journal 推测 Agent transcript 完整。

### 7.3 Workspace

- Agent 只能写入物化 Workspace；
- Task source、Verifier、hidden acceptance 和证据根与 Agent write scope 分离；
- 每次 Run 记录 initial digest；每个 terminal Attempt 后记录 final digest；
- Baseline/Skill/Runtime 比较必须来自相同 source identity 和规范化 initial digest；
- V0 默认临时复制；Worktree 通过 provider 接口后移；
- V0 不声称 OS Sandbox；工具边界是应用级能力约束。

### 7.4 Side-effect boundary

V0 遇到进程 crash、Tool Result 未持久化或 Workspace 状态不确定时：

- 不自动重放非幂等 Tool；
- 将 Run 标记为 `invalid` 或暂停；
- 保存已知 Tool Call ID、Workspace digest/diff 和最后完整 Journal seq；
- 允许人工检查；
- 不建设通用 transaction/Exactly-once 系统。

---

## 8. Verifier and Outcome

### 8.1 Verifier authority

Verifier 是 Agent 外部环境事实源。它必须：

- 在 Agent Cycle settled 后运行；
- 具有固定 identity 和 digest；
- 不在 Agent 可写 Workspace 中，或至少通过不可写副本/独立路径执行；
- 使用受控 cwd/env/timeout；
- 保留 exit code、bounded summary、完整输出 artifact 和 digest；
- 自身错误返回 `invalid`，而不是 task failure；
- 不调用同一 Agent 让其自评成功。

若 Agent 需要公共测试，它可以运行公开测试；最终 Outcome 仍由外部 Verifier Runner 重新执行或运行独立验收。

### 8.2 顶层 Outcome 语义

| 状态 | 含义 |
| --- | --- |
| `passed` | 最终外部 Verifier 有效运行并通过，证据完整，预算未违规 |
| `failed` | Verifier 有效运行并失败，且允许的恢复已结束或不存在 |
| `invalid` | Observer、Journal、Session、Verifier、Workspace provenance、secret safety 或基础设施使结果不可用于任务/策略判断 |
| `cancelled` | 用户主动取消或拒绝继续所需授权；budget exhaustion 不归入 cancelled |

### 8.3 最小 Failure Class

- `agent`：Agent/provider/tool protocol 导致任务未达标；
- `verifier`：Verifier 自身无法执行或合同错误；通常顶层为 `invalid`；
- `infrastructure`：环境、构建、文件系统、进程等故障；
- `evidence`：关键事件、Session、identity、artifact 缺失或矛盾；
- `budget`：时间、请求、Tool、Token、成本或 Attempt 预算耗尽；
- `user`：用户取消或拒绝所需授权。

### 8.4 Outcome precedence

以下 precedence 在 V0-A 实现前冻结。表中的“有效 Verifier 失败”指 Verifier 自身成功执行并判定任务不通过；它与“Verifier 无法运行”不同。

| 观察 | 顶层 Outcome | Failure Class | Precedence / 说明 |
| --- | --- | --- | --- |
| Journal、Session、Run/Attempt/Identity 等关键证据缺失、矛盾或无法关联 | `invalid` | `evidence` | 最高证据优先级；不得用 Report 文本补齐，也不得继续作 Task/Policy 判断 |
| Verifier 无法启动、超时、合同错误或输出不可解析 | `invalid` | `verifier` | 不能把 Verifier infrastructure failure 当作任务失败 |
| Provider、Tool、Workspace 或进程基础设施阻断，且没有形成有效环境结论 | `invalid` | `infrastructure` | 若同时存在关键证据损坏，`invalid/evidence` 优先 |
| 用户在有效任务结论前主动取消或拒绝继续授权 | `cancelled` | `user` | 用户取消优先于把“未验证”伪装成 failed；已形成并持久化的 terminal Outcome 不被事后取消覆盖 |
| 时间、请求、Tool、Token、成本或 Attempt Budget 在有效通过结论前耗尽，且证据链完整 | `failed` | `budget` | 预算是有效 Policy stop，不是基础设施无效，也不是用户取消；预算计数本身失真则改为 `invalid/evidence` |
| 外部 Verifier 有效执行并通过，且关键证据完整 | `passed` | `null` | 只有环境通过才可成为 passed |
| 外部 Verifier 有效执行并失败，且 Recovery Budget 已结束或策略不允许恢复 | `failed` | `agent` | V0 暂用 `agent` 表示任务未达标；未来可加更精确 task class，但不得改变顶层语义 |

同一 Run 只能有一个 terminal Outcome。先检查 evidence validity，再判断 Verifier/infrastructure validity，最后应用 user/budget/task terminal reason；实现不得用枚举顺序代替上述因果判断。

---

## 9. Completion Mechanism

### 9.1 V0 冻结机制

V0 实现两个并列 Strategy capability：

1. `observe_only`
   - 一个初始 Attempt；
   - settled 后执行一次 Verifier；
   - 不因失败自动恢复；
   - 形成 passed/failed/invalid/cancelled Outcome。

2. `verify_recover_once_same_session`
   - 一个初始 Attempt；
   - settled 后执行 Verifier；
   - 首次通过则停止；
   - 首次失败且证据有效、预算允许时，创建一个 child Attempt；
   - child Attempt 复用 Session/Workspace，接收 bounded Failure Packet；
   - 再执行一次 Verifier并停止。

### 9.2 Failure Packet

V0 只需运行时 Artifact，不建设 Repository：

```yaml
failure_packet:
  verifier_id: string
  parent_attempt_id: string
  failure_summary: bounded_string
  failed_checks: []
  output_ref: artifact_ref
  workspace_digest: sha256
  budget_remaining: object
```

不得包含秘密、隐藏 expected implementation、可被 Agent 修改的 Verifier 路径或无限制日志。

### 9.3 Stop Policy

- Recovery Budget 由 Strategy 明确为 0 或 1；
- Verifier invalid 不触发 Recovery；
- Evidence invalid 不触发 Recovery；
- 请求/Tool/时间/成本预算不足不触发新 Attempt；
- abort/cancel 后不得偷偷继续；
- terminal reason 必须唯一、可解释；
- V0 不支持自动选择多条恢复 Route。

### 9.4 V0 的效果边界

实现该机制只允许声称：

- completion loop 可运行；
- policy branch 和 budget 被正确执行；
- deterministic failure/recovery fixture 通过；
- real route 可以在未触发时正确停止。

不得声称它优于 Skill、Baseline 或任何其他策略。V1 才做三路对照。

---

## 10. Evidence and Secret Boundaries

### 10.1 证据根

每个 Run 应在忽略目录下拥有 write-once 或 collision-safe evidence root：

```text
.runs/<run-id>/
  run.json
  attempts/<attempt-id>.json
  workspaces/...
  sessions/...
  events/...
  verifier/...
  artifacts/...
  outcome.json
  report.md
```

V0 可以调整文件名，但必须保持 ID 关联和原始证据不可回填。

### 10.2 必须持久化

- Source/Pi/Artifact/Provider/Model/Tool/Profile identity；
- Task/Strategy/Run/Attempt/Session/Workspace/Verifier IDs；
- 配置 digest 和初始/最终 Workspace digest；
- lifecycle 的最小可审计投影；
- Tool Call/Result identity、状态和有预算的结果；
- Provider usage/cost/latency 的可用 metadata；
- Verifier 结果和完整输出引用；
- Policy decision、budget usage、terminal reason；
- Outcome 和 evidence index。

### 10.3 禁止持久化

- API key、authorization header、`.env` 内容；
- 完整 hidden reasoning / chain-of-thought；
- 无预算的完整 Provider body；
- 用户 Workspace 外的无关文件；
- 不需要的个人信息；
- 可让 Agent 推断隐藏 expected implementation 的材料。

### 10.4 Evidence validity

- 任何关键 ID 矛盾都使 Run `invalid`；
- 关键 Journal event 缺失不得用 Report 文本补写；
- 无效 Run 保留原始证据，但不混入 Policy 成败；
- secret scan 应在所有 deterministic final artifacts 写完后执行；
- `.runs/` 继续忽略，不提交运行凭据和原始 Workspace。

---

## 11. V1 / V2 Continuity

### 11.1 V1 Skill continuity

V1 必须公平比较：

```text
A. Baseline
B. Skill-only
C. Skill + External Verifier / Runtime Control
```

V0 为此保留：

- 独立 `strategy_id`；
- `skill_refs` 与 `completion_policy_id` 分离；
- 固定 common base prompt；
- Task、Model、Thinking、Tool Profile、Workspace source、Verifier 和 Budget snapshot；
- Comparison 由多个 Run 聚合，不修改 Run Schema；
- 任何策略都使用同一 Verifier/Outcome 合同。

V0 不实现 Skill lifecycle、Skill selection、Skill repository 或 Skill improvement。

### 11.2 V2 Recovery continuity

V2 的 Portfolio North Star 是：

```text
Failure-aware Bounded Multi-path Adaptive Recovery

same Session + same Workspace
vs
clean Session + Failure Packet / Skill + reconstructed Workspace
```

V0 为此只保留：

- `Attempt`；
- `parent_attempt_id`；
- `strategy_id`；
- Attempt-level `session_id`、`workspace_id`；
- Failure Packet artifact；
- Run/Attempt budgets；
- terminal reason 和 verifier-linked Outcome。

V0 不实现：

- clean-session route；
- automatic route selection；
- Router；
- cross-process resume；
- general side-effect reconciliation；
- multi-agent recovery。

### 11.3 V3 continuity

V3 方向为：

```text
Trace → Diagnosis → Experience → Candidate Intervention
→ Related Task / Regression → Promote / Reject / Rollback
```

V0 的 immutable evidence、Strategy ID、Attempt lineage 和 Verifier outcome 足够成为未来输入。V0 不创建 Experience Repository、Curator 或 Promotion service。

---

## 12. Non-goals

V0 明确不做：

- Completion Policy 效果证明或统计 Promotion；
- V1 Skill-only 比较；
- V2 multi-path recovery；
- V3 Experience/Curator/Promotion；
- V4 Routing/Retirement；
- V5 Godot Adapter；
- Multi-Agent/Subagent 平台；
- MCP/A2A 生态；
- Web UI、Dashboard、SQLite 分析平台；
- 通用 Sandbox、Container 平台；
- 通用 Durable Runtime 或 Exactly-once Tool transaction；
- 完整 Permission/Approval 产品；
- 跨进程 settled Resume；
- 通用 Worktree 管理；
- 全自动 package installation/network access；
- Pi SDK/RPC 兼容实现；
- Claude Code feature parity；
- SearchCLI/Youtu-Agent/OpenHarness/Harbor/Terminal-Bench 集成；
- 自动生成、推广或淘汰 Skill/Policy；
- 大型 Report/Schema/Inspector 平台。

---

## 13. Goal Decomposition

本节冻结 V0 拆分为三个 Goal，但不创建 Active Goal 或执行授权。每个 Goal 的 Contract 仍需用户单独接受，执行仍需单独激活。

### 13.1 V0-A — Contracts, Workspace and Pi Adapter

目标：创建正式最小项目骨架，使一个 Task/Strategy 能通过 preflight、Workspace materialization 和 public Pi Adapter 执行到 settled。

候选范围：

- V0 contracts 与 validation；
- `run --dry-run`；
- Run/Attempt IDs；
- temp-copy Workspace Provider；
- public Pi Adapter；
- restricted deterministic tools；
- Faux Provider；
- 最小 CLI `run`；
- source/config digest。

真实 Coding Task：用确定性 Provider 完成一个真实 TypeScript 文件修改并运行测试。它是实际代码任务，不要求真实模型。

DoD：无外部模型也能从 TaskSpec 到 settled Attempt；无效配置在任何副作用前失败；路径不能逃逸 Workspace；Pi private import 和 Core patch 为 0。

模型预算：0。

### 13.2 V0-B — Evidence, Session, Verifier and Outcome

目标：把一次执行变成可复核 Outcome，而不是只有进程退出码。

候选范围：

- SessionRef 和持久化；
- Journal V0 closed envelope；
- Tool/Provider/settled 事件投影；
- Artifact externalization；
- 外部 Verifier Runner；
- Outcome/Failure/Invalid；
- Budget/abort/terminal reason；
- secret/reasoning boundary；
- `inspect`；
- 一次受限真实模型 smoke（需二次授权）。

真实 Coding Task：固定且非平凡的小型 Coding Task，使用外部 Verifier；先离线/确定性通过，再单独授权真实模型。

DoD：从 Manifest 可追到 Run、Attempt、Workspace、Session、Journal、Verifier 和 Outcome；Observer/Evidence 故障不会被误报为 Agent failure；real smoke 如获授权，必须遵守单次预算。

### 13.3 V0-C — Bounded Completion and User-facing Use

目标：正式实现 `observe_only` 与 `verify_recover_once_same_session` 两种 Strategy，并让用户实际使用一次。

候选范围：

- child Attempt lineage；
- bounded Failure Packet；
- 0/1 Recovery Budget；
- policy decision/stop branches；
- G003 deterministic recovery regression；
- G006 initial-pass/no-extra-cycle regression；
- Inspector/Markdown summary 的最小完成；
- 用户选择的一个受限真实 Coding Task（需二次授权）。

真实 Coding Task：用户可理解并亲自检查的代码任务；若自然首次失败，记录恢复；若首次通过，诚实记录不触发，不追逐失败。

DoD：所有 policy branch 有确定性测试；真实任务可运行；用户能解释为何停止或恢复；不做效果 claim；输出可作为 V1 三路比较的输入。

### 13.4 为什么冻结为三个 Goal

- V0-A 主要失败类是 contracts/path/runtime composition；
- V0-B 主要失败类是 evidence/verifier/attribution；
- V0-C 主要失败类是 policy/lineage/real use；
- 每个 Goal 都能有独立的 Definition of Done 和 Pause Conditions；
- 每个 Goal 都交给专用 Goal Session；主 Session负责 Contract、Activation/Control Baseline、`CURRENT_STATE.md` 与控制文件、实现审查和用户验收。专用 Session不得直接修改或提交控制状态，只能在 Report/Closeout Draft 中提出结构化更新建议。

不得把三个 Goal 静默合并为一个无边界实现 Goal，也不得由某个执行 Session 抢跑后续 Goal。

### 13.5 真实模型预算

```yaml
real_model_budget:
  V0_A:
    real_calls: 0

  V0_B:
    max_authorized_runs: 1
    purpose: real_route_smoke
    cost_cap_usd: 1

  V0_C:
    max_authorized_runs: 1
    purpose: user_visible_real_coding_task
    cost_cap_usd: 2

  total_cost_cap_usd: 3
  automatic_extra_retry: false
  additional_run_requires_user_authorization: true
```

V0-B/V0-C 的额度是版本上限，不是自动执行授权；每个真实 Run 仍需对应 Goal 的明确授权。Strategy 内已经授权的 0/1 Recovery Attempt 不另算人工授权 Run，但必须受同一 Run 的请求、Tool、时间、Token 和成本硬预算约束。

---

## 14. Definition of Done

V0 只有同时满足以下条件才完成：

### 14.1 Product

- `run` 和 `inspect` 可用；
- `run --dry-run` 或等价 preflight 在副作用前给出明确结果；
- 至少两个 Strategy：observe-only、verify/recover-once-same-session；
- 用户能实际执行一个 Coding Task，而不是只能跑内部单元测试。

### 14.2 Runtime

- 使用固定 public Direct `AgentHarness`；
- Pi Core patch/private import 为 0；
- Tool Profile 可执行真实本地 coding task；
- Workspace 路径和写边界可验证；
- Agent Cycle settlement、abort 和 timeout 可记录。

### 14.3 Data and evidence

- Task/Strategy/Run/Attempt/Session/Workspace/Verifier/Outcome 合同冻结；
- `strategy_id`、`parent_attempt_id`、Attempt-level Session/Workspace 存在；
- Journal closed envelope、seq 和 IDs 可关联；
- Tool Call/Result、Session 和 Verifier 有完整链路；
- 大输出有预算和 retrieval ref；
- Invalid evidence 不混入 Agent/Policy failure。

### 14.4 Completion

- Verifier 只在 settled 后运行；
- observe-only 不恢复；
- initial pass 不错误触发恢复；
- initial valid failure 在预算允许时只触发一个 child Attempt；
- invalid/budget/abort 不触发恢复；
- G003 recovery fixture 与 G006 no-recovery fixture 均回归通过。

### 14.5 Safety and provenance

- Secret/credential/reasoning body 不进入证据；
- 最终 artifact 写完后 secret scan 通过；
- Pi source/version/license 和 model/provider identity 可追踪；
- Verifier/hidden acceptance 不可由 Agent 修改；
- 未引入未核验许可证的外部代码。

### 14.6 Continuity and explanation

- V1 可添加 Skill-only Strategy 而不改核心 Run/Attempt Schema；
- V2 可增加 clean-session child Attempt 而不改 lineage 核心；
- 用户能解释 Agent Loop、Tool、Session、Workspace、Verifier、Completion Controller 和 Outcome 的责任；
- README/架构说明准确区分 Pi、复用模块和个人贡献；
- 所有未验证边界和非 claim 明确。

V0 DoD 不要求 Completion Policy 有统计提升，也不要求自然 Recovery 一定出现。

---

## 15. Pause Conditions

任一条件出现，专用 Goal Session 必须停止并返回 Pause Report：

1. 固定 Pi Commit、License、public exports 或 working tree 与 Charter 不一致；
2. V0 需要 Pi Core patch、private import 或自定义 partial emitted boundary；
3. 合理的 V0 Tool Profile 无法通过 Direct path 注入；
4. Agent 可以修改 Verifier、hidden tests 或 Acceptance Criteria；
5. Workspace canonical path 无法限制在授权根；
6. Observer/Journal/Session/Tool Result 无法形成最小关联；
7. Evidence failure 只能被误报为 Agent failure；
8. Secret 或 reasoning body 进入持久化证据；
9. 实现开始引入 V2 Router、V3 Experience platform、Multi-Agent、MCP、UI、SQLite 或通用 Sandbox；
10. 外部模块来源、版本或许可证不清却准备复制/移植；
11. 需要新增模型调用、Attempt、成本或权限但没有用户授权；
12. 真实 Task 要求网络、安装、Git push、后台服务或 Workspace 外副作用，而 Contract 未授权；
13. Worktree、跨进程 Resume 或 crash reconciliation 从条件性需求变成完成 V0 的硬依赖；
14. Goal 必须更改已接受 Outcome、Budget 或 Strategy 语义才能继续；
15. 工作区存在无法绕开的用户修改冲突；
16. V0 Goal 被扩大为效果 Pilot 或 V2/V3 实现。

Pause Report 只记录观察、证据、阻塞原因、可选项和所需用户决定；不得静默改架构。

---

## 16. Accepted User Decisions and Remaining Authority

用户已经接受：scoped Pi Go、bounded local Tool Profile、project-owned minimal System Prompt、顶层 Outcome 方向及 precedence、0/1 Recovery Budget、两个 Completion Strategy、三个 V0 Goal、真实模型双重预算、Worktree 后移、SearchCLI/论文按触发获取、外部模块逐项复用 Gate，以及自然 V0/V1 Recovery 观察。

仍需逐次授权的是：

- 接受和激活每个 Goal Contract；
- 创建正式 `workbench/` 和安装依赖；
- V0-B/V0-C 的各一次真实模型 Run；
- 任何额外 Run、Retry、成本或权限；
- 任何外部模块复制、移植或直接依赖；
- Pi 升级、Pi Core patch、private import 或替代 Runtime；
- Git commit；
- 从 V0-A 进入 V0-B、从 V0-B 进入 V0-C。

---

## 17. Claims Allowed / Not Allowed

### 17.1 V0 完成后允许声称

- 基于固定 Pi Direct `AgentHarness` 建成了可实际运行的 Coding Agent Workbench；
- 能控制 Workspace、Task、Model、Tool Profile、Session 和预算；
- 能在 Agent settled 后执行独立环境 Verifier；
- 能关联 Run、Attempt、Session、Workspace、Tool、Journal、Verifier 和 Outcome；
- 能区分 task failure、invalid evidence、budget/abort 等终态；
- 能执行 observe-only 和一次有界 same-session recovery 机制；
- 数据合同为 V1 Skill-only 和 V2 多路径恢复保留连续性；
- 没有修改 Pi Core；
- 用户真实执行并检查过至少一个 Coding Task。

### 17.2 V0 完成后仍不允许声称

- Completion Verification 提高了真实任务成功率；
- Runtime Control 优于 Skill-only；
- same-session recovery 优于 clean-session recovery；
- 真实 Recovery 已出现，除非自然运行确实观察到；
- 项目已实现 Adaptive Routing、Experience reuse 或 self-improvement；
- Pi 已解决 Sandbox、Exactly-once、完整 Resume 或 crash durability；
- 结果可泛化到所有模型、任务和 Pi 版本；
- Claude Code 的代码或架构由本项目原创；
- 单次成功或低成本代表统计效果；
- V0 可以作为基础设施阶段经历写入简历，但不得表述为第二项目已经达到目标 Portfolio Milestone。

### 17.3 Portfolio Checkpoints

```yaml
portfolio_checkpoints:
  checkpoint_A:
    versions: [V0, V1]
    meaning: credible_reliability_and_eval_foundation
    resume_eligible: true
    differentiation: medium

  checkpoint_B:
    versions: [V2]
    meaning: bounded_multi_path_adaptive_recovery
    portfolio_core: true
    resume_ready_target: true

  checkpoint_C:
    versions: [V3]
    meaning: controlled_experience_candidate_regression_and_promotion
    strong_differentiation: true
    required_for_checkpoint_B: false
```

Checkpoint B 是求职阶段的目标 Portfolio Milestone。V3 的 Promote/Reject/Rollback 属于 Checkpoint C 的增强差异化，不是 V2 Portfolio core 的硬前置。

---

## 18. Accepted Decisions

```yaml
accepted_decisions:
  - decision: freeze_scoped_pi_go_for_v0
    evidence: public source audit, deterministic G003 and real-route G006 all support Direct AgentHarness with zero core patches
    options: [accept_scoped_go, request_one_bounded_architecture_check, reject_direct_pi_for_v0]
    accepted_value: accept_scoped_go_at_pinned_commit_with_adapter_and_review_triggers
    consequence: acceptance permits the first formal workbench Goal; rejection reopens runtime selection

  - decision: choose_v0_tool_profile
    evidence: fixed G006 tools prove injection but are too narrow for general real coding use
    options: [bounded_local_coding_profile, fixed_task_tools_only, broad_shell_network_install_profile]
    accepted_value: bounded_local_profile_per_section_7_1
    consequence: this choice determines permission, cancellation and side-effect scope

  - decision: choose_system_prompt_source
    evidence: a stable common base is required for V1 fairness; G006 project prompt worked; Claude mirror cannot be copied
    options: [project_owned_minimal_base, pi_default_resource_prompt, user_supplied_per_task_prompt]
    accepted_value: project_owned_minimal_base_with_task_and_skill_overlays_separated
    consequence: fixes prompt attribution and comparison fairness

  - decision: acquire_searchcli_now
    evidence: advanced plan/checkpoint is optional; canonical repository and license remain unverified
    options: [defer_until_V0_A_need, bounded_acquisition_before_V0_A, reject]
    accepted_value: defer_until_specific_goal_need
    consequence: simple V0 preflight proceeds now; advanced behavior may add a short research gate

  - decision: localize_core_papers_now
    evidence: V0 architecture is already supported by local source and runs
    options: [defer_by_version, minimal_primary_set_now, full_pack_now]
    accepted_value: acquire_version_specific_primary_sources
    consequence: papers do not block V0 and remain tied to concrete design questions

  - decision: choose_v0_goal_count
    evidence: contracts/runtime, evidence/verifier and completion/user-use have distinct failure classes
    options: [three_goals, two_goals, one_goal]
    accepted_value: three_bounded_goals_V0_A_V0_B_V0_C
    consequence: more review points but cleaner scope, evidence and dedicated-session ownership

  - decision: set_real_model_budget
    evidence: G006 cost was 0.0016993088 USD but repeat/cost controls are part of reliability semantics
    options: [per_goal_cap, shared_cap, zero_real_calls]
    accepted_value: V0_A_zero_calls_V0_B_one_run_cost_cap_1_USD_V0_C_one_run_cost_cap_2_USD_total_cost_cap_3_USD
    consequence: real usability is checked without creating an open-ended experiment budget

  - decision: include_worktree_in_v0
    evidence: copy-based isolation already works and no current failure requires Git worktree lifecycle
    options: [defer_with_workspace_provider, require_now, exclude_permanently]
    accepted_value: defer_with_workspace_provider
    consequence: V0 remains small while V2/real-repo use can add a worktree provider later

  - decision: implement_completion_mechanism_in_v0
    evidence: deterministic mechanism and real route are proven; effect is not
    options: [observe_and_recover_once_strategies, observe_only, defer_all_to_V1]
    accepted_value: implement_both_observe_only_and_verify_recover_once_same_session
    consequence: V0 has a real reliability control surface and V1 can test it fairly

  - decision: authorize_any_external_module_port
    evidence: no proposed non-Pi module has passed source/version/license review
    options: [none_now_case_by_case_later, authorize_specific_named_module, broad_authority]
    accepted_value: none_now_case_by_case_later
    consequence: reuse remains available without contaminating V0 provenance

  - decision: accept_v0_outcome_and_failure_taxonomy_direction
    evidence: G005 invalid evidence and G006 valid pass require explicit separation
    options: [accept_passed_failed_invalid_cancelled_plus_failure_class, revise_now, defer]
    accepted_value: passed_failed_invalid_cancelled_with_section_8_4_precedence
    consequence: implementation cannot silently define success or blame

  - decision: set_v0_recovery_budget
    evidence: G003 proves one recovery works but not that one is optimal
    options: [zero_or_one_by_strategy, always_one, configurable_more_than_one]
    accepted_value: zero_or_one_by_strategy_with_hard_run_budget
    consequence: bounded behavior and clean V1 comparison; no unbounded loop

  - decision: timing_of_real_recovery_observation
    evidence: G006 first-pass outcomes produced no trigger and manufacturing failure would bias evidence
    options: [natural_V0_V1_observation, new_forced_Phase3B, require_before_Charter]
    accepted_value: natural_V0_V1_observation
    consequence: V0 may complete with recovery still unobserved, but the non-claim remains explicit
```
