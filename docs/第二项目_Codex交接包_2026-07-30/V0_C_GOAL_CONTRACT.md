# V0-C Goal Contract — Bounded Completion and User-facing Use

```yaml
goal_id: V0_C_BOUNDED_COMPLETION_AND_USER_FACING_USE
status: closed_accepted
version: V0_C
date: 2026-07-31
contract_drafting_authorized_by_user: true
accepted_by_user: 2026-07-31
activated_by_user: 2026-07-31
contract_accepted: true
activation_authorized: true
active_goal: false
control_baseline_commit_authorized: consumed
control_baseline_commit: 47d36f25563012e1d411576eca387a778ba6a3e7
stage_1_execution_owner: dedicated_v0_c_implementation_session
stage_1_implementation_authorized: true_zero_real_calls_after_control_baseline_confirmation
stage_1_implementation_started: true
stage_1_implementation_completed: true
stage_1_real_model_calls_authorized: 0
candidate_commit_authorized: consumed
failed_audit_candidate_commit: 930c549b402fce9ffa96847a673ad187c64f6094
corrected_candidate_commit: 861b7241e8abf8608fc981a68bae39037f598f5d
corrected_workbench_digest: a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446
focused_independent_audit_owner: original_independent_v0_c_audit_session
focused_independent_audit_authorized: consumed
focused_independent_reaudit_disposition: PASS_FOCUSED_V0_C_REAUDIT
implementation_baseline_commit_authorized: consumed
implementation_baseline_commit: 12db75aaea4db4afb774046cfcc94de772a2e90b
stage_2_execution_owner: first_and_replacement_fresh_v0_c_user_acceptance_sessions
stage_2_user_run_authorized: consumed
stage_2_initial_authorized_runs: 1
stage_2_initial_run_status: paused_pre_dispatch_zero_real_calls
stage_2_replacement_authorized_runs: 1
stage_2_replacement_run_status: completed_passed_accepted
stage_2_attempt_limit: 2
stage_2_recovery_slot_limit: 1
stage_2_cost_cap_usd: 2
stage_2_real_model_calls_authorized: consumed_no_additional_calls_authorized
stage_2_real_model_calls_observed: 5
stage_2_credential_access_authorized: consumed_for_fresh_UAT_sessions_only
stage_2_external_network_authorized: consumed_for_frozen_deepseek_API_route_only
automatic_second_run_authorized: false
final_acceptance: PASS_V0_C_USER_ACCEPTANCE
final_closeout_and_git_commit_authorized: consumed_by_resulting_HEAD_of_this_revision
authoritative_run_id: run-c3297fc5-bfd1-4bd1-b46c-3a636271a177
authoritative_run_outcome: passed
authoritative_run_recovery_observed: false
authoritative_run_cost_usd: 0.0012407808000000002
closeout: docs/reports/V0_C_CLOSEOUT.md
dedicated_session_git_commit_authorized: false
dependency_installation_authorized: false
external_network_authorized_for_stage_1: false
credential_access_authorized_for_stage_1: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
external_module_port_authorized: false
root_drafting_head: bb4d1023d9359a5b4172e9ce2e3c9332a6a917be
v0_b_implementation_baseline: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
```

> 用户已于 2026-07-31 接受并激活本 Contract。确定性 Stage 1、focused
> audit、两项有界返修和 corrected Candidate focused re-audit 均已完成。
> 第一次 fresh UAT 因 UAT-local 旧三工具断言在 HTTP 前暂停，真实调用和成本
> 均为 0；用户随后单独授权了修正后的 replacement UAT。replacement Run
> `run-c3297fc5-bfd1-4bd1-b46c-3a636271a177` 在冻结 Implementation
> Baseline 上通过正式 Product Surface，初始 Verifier 通过，Outcome 为
> `passed`，成本为 USD `0.0012407808000000002`。主 Session据此接受
> `PASS_V0_C_USER_ACCEPTANCE` 并正式关闭 V0-C 和 V0。真实失败后的 Recovery
> 及 Completion Policy 效果仍未证明。

---

## 1. Mission

V0-C 的唯一使命是：

> 在已接受的 V0-A Workspace/Pi Adapter 和 V0-B Evidence/Session/
> Verifier/Outcome 基础上，正式实现 `observe_only` 与
> `verify_recover_once_same_session` 两种 Completion Strategy，使一次
> 有效初始失败能够在严格证据、可见性和预算条件满足时触发至多一个 child
> Attempt，并最终通过正式 `run` / `inspect` Product Surface 完成一次用户
> 可理解的真实 Coding Task。

V0-C 必须回答：

1. Workbench 能否在不改写 V0-B 历史语义的前提下表达一或两个 Attempt；
2. same-process、same-Harness、same-Session、same-Workspace continuation
   能否通过固定 Pi 的 public emitted API 实现；
3. Completion Controller 能否对 pass、valid failure、invalid evidence、
   invalid Verifier、infrastructure、cancel 和 budget 做确定性决策；
4. Recovery eligibility 能否在 child 启动前完成证据、可见性、Failure
   Packet 和预算检查；
5. Recovery slot 能否恰好消费一次，且不产生未启动的“幽灵 child Attempt”；
6. 每个 settled Attempt 能否拥有恰好一次 Verifier 与 Attempt-level
   validation，同时整个 Run 只有一次 final validation、Outcome 和 terminal
   commit；
7. 动态 Evidence Index、secret scan 和 Inspector 能否覆盖一个或两个
   Attempt，且继续 fail closed；
8. 正式 Product Surface 能否在零真实调用的 Stage 1 中准备好 real-provider
   route，使 Stage 2 不需要临场修改源码；
9. 用户能否在冻结实现基线上实际运行一次受限 Coding Task，并解释为何停止
   或恢复。

V0-C 不证明 Completion Verification 提高成功率，也不实现 V2 多路径恢复。

---

## 2. Authorization and Governance

### 2.1 Contract acceptance is not activation

唯一允许的控制顺序是：

```text
主 Session 审查 Precontract Research 并起草本 Contract
→ 用户审查并接受正式 V0-C Contract
→ Contract 正式化为 accepted_not_activated
→ 用户单独授权 V0-C Activation 和 Control Baseline Commit
→ 主 Session 更新 CURRENT_STATE、Contract 状态和必要控制文件
→ 主 Session 创建并核验 active_goal: V0_C 的干净 Control Baseline Commit
→ 主 Session 记录精确 Baseline SHA 并生成 Stage 1 启动 Prompt
→ 新的专用 V0-C Implementation Session 从该 Commit 执行 Gate A
→ Stage 1 以零真实模型调用完成 deterministic Candidate
→ 主 Session 审查并将缺陷返还原 Implementation Session 有界返修
→ 用户另行授权 Candidate Commit
→ 新的 Focused Independent Audit Session 审计冻结 Candidate
→ 原 Implementation Session 仅在有 finding 时做有界返修
→ 审计通过后，用户另行授权 Implementation Baseline Commit
→ 用户另行冻结 Stage 2 Task、Model、Workspace、反馈与 Run/Cost Budget
→ 新的 User-Acceptance Session 只通过正式 Product Surface 执行一次 Run
→ 主 Session 与用户决定 Accept / Revise / Reject
→ 用户另行授权 Closeout、CURRENT_STATE 同步和最终 Git commit
```

绑定规则：

1. Contract 接受不等于 Activation。
2. Activation、Control Baseline、Candidate Commit、独立审计、
   Implementation Baseline、Stage 2 和最终 Closeout 是不同授权点。
3. Stage 1 的真实模型/外部 Provider调用必须恰好为 0。
4. 研究、实现和审计 Session 不得读取凭据；Stage 2 凭据不向前传递。
5. 任何专用 Session 都不得修改、暂存或提交：
   - `CURRENT_STATE.md`；
   - 正式 V0-C Contract 控制状态；
   - `09_对接执行、文件权威与验收规则.md`；
   - V0 Charter、ADR 或其他项目控制文件。
6. 专用 Session不得创建 Git commit。
7. Implementation Session只能在 Report / Closeout Draft 中提交结构化
   `CURRENT_STATE_UPDATE_PROPOSAL`。
8. Audit Session不得修源码；UAT Session不得修改源码或临场修复。
9. Stage 2 的一个授权 Run 可以在同一 Run 内消费至多一个 child Attempt，
   但不得自动创建第二个 Run。

### 2.2 Current stop point

```yaml
pre_activation_root_head: bb4d1023d9359a5b4172e9ce2e3c9332a6a917be
control_baseline_commit: 47d36f25563012e1d411576eca387a778ba6a3e7
active_goal: null
V0_A: closed_accepted
V0_B: closed_accepted
V0_C: closed_accepted
V0: closed_accepted
V0_C_precontract_research: completed_main_review_accepted_for_contract
V0_C_contract: closed_accepted
V0_C_activation: authorized_and_recorded
V0_C_implementation: deterministic_stage_1_completed
V0_C_audit: focused_reaudit_passed
V0_C_implementation_baseline: 12db75aaea4db4afb774046cfcc94de772a2e90b
V0_C_stage_2: replacement_user_acceptance_passed_and_accepted
additional_real_model_calls_authorized: 0
```

本节保留完整授权顺序作为历史控制记录。V0-C 已经关闭；不得从本 Contract
重新启动 UAT、Recovery、模型调用或实现。

---

## 3. Binding Inputs and Read Order

V0-C 专用 Session在执行任何命令或修改前必须完整读取：

1. 根 `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. 正式 `V0_VERSION_CHARTER.md`；
4. `09_对接执行、文件权威与验收规则.md`；
5. 正式 `V0_C_GOAL_CONTRACT.md`；
6. `V0_B_GOAL_CONTRACT.md`；
7. `docs/reports/V0_B_CLOSEOUT.md`；
8. `docs/reports/V0_B_INDEPENDENT_REAUDIT_REPORT.md`；
9. `docs/reports/V0_B_IMPLEMENTATION_REPORT.md`；
10. `docs/reports/V0_C_BOUNDED_COMPLETION_PRECONTRACT_RESEARCH.md`；
11. G003 Report/Closeout 和 `spikes/pi-runtime/g003/driver.ts`；
12. G006 Contract/Report/Closeout 和被本 Contract 引用的 real-route source；
13. `workbench/` 当前全部源码、测试、scripts 和 README；
14. `.upstream/pi/AGENTS.md` 以及进入的每个子树适用的 `AGENTS.md`；
15. 本 Contract 指定的固定 Pi 源码与测试。

权威顺序：

```text
固定源码 / 测试 / 实际命令
→ CURRENT_STATE / accepted Closeout / accepted ADR
→ accepted V0 Charter
→ 用户接受后的正式 V0-C Contract
→ Precontract Research 与成熟 Harness 参考
→ 实现 Session 推断
```

如真实仓库、Pi、V0-B baseline、正式控制状态或适用指令与 Contract 不一致，
命中 Pause Condition。

---

## 4. Fixed Evidence Baseline

### 4.1 Accepted project baseline

```yaml
V0_A:
  status: closed_accepted
  disposition: PASS_V0_A_FOUNDATION
  implementation_baseline_commit: 1a1565fa7e6d1440c8f99e2c7e587201a14111c1
  authoritative_run_id: run-5c0b157e-31d7-4873-95a1-fd284377ace3

V0_B:
  status: closed_accepted
  disposition: PASS_V0_B_EVIDENCE_FOUNDATION
  implementation_baseline_commit: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
  control_evidence_closeout_commit: 2f05713ccda4ea9145cc948fb4b3ac6f0ebd3768
  authoritative_run_id: run-914dc89c-defd-4e03-ab37-7fd09230fe93
  workbench_tree_digest: b8034b235acdf50630c7bebc3859f001799986333622ae0ce1b545528d3fe8d0
  independent_reaudit: passed
  strict_typescript: passed
  complete_tests: 67_passed_0_failed_0_skipped
  real_model_calls: 0
  recovery_attempts: 0
  child_attempts: 0
```

未来 Control Baseline 必须包含用户接受后的正式 Contract 和
`active_goal: V0_C_BOUNDED_COMPLETION_AND_USER_FACING_USE`。本节的 drafting
HEAD 不是未来执行 Baseline。

### 4.2 Fixed Pi

```yaml
path: .upstream/pi
commit: 027a5847901b5dde30270abaa1041046cd2b4b55
describe: v0.82.1-40-g027a5847
package: "@earendil-works/pi-agent-core@0.82.1"
license: MIT
expected_status: clean
pi_core_patch_allowed: false
private_import_allowed: false
```

### 4.3 Pi source basis

Pi 行为结论绑定：

- `.upstream/pi/packages/agent/src/index.ts`
  - public emitted export boundary；
- `.upstream/pi/packages/agent/src/harness/agent-harness.ts`
  - `AgentHarness.createTurnState()`；
  - `AgentHarness.handleAgentEvent()`；
  - `AgentHarness.executeTurn()`；
  - `AgentHarness.prompt()`；
  - `AgentHarness.abort()`；
  - `AgentHarness.waitForIdle()`；
  - `AgentHarness.subscribe()`；
- `.upstream/pi/packages/agent/src/harness/session/session.ts`
  - `Session`；
  - `appendMessage()`；
  - `getEntries()`；
  - `buildContext()`；
- `.upstream/pi/packages/agent/test/harness/agent-harness.test.ts`
  - later prompt after abort/failure；
  - thrown hook failure settles；
  - `waitForIdle` ordering；
- `.upstream/pi/packages/agent/test/harness/session.test.ts`
  - ordered context、branching、storage-backed reconstruction；
- `.upstream/pi/packages/agent/test/harness/storage.test.ts`
  - JSONL create/open/append/leaf reconstruction。

**Fact.** 上述 public route 加 G003 动态证据支持 same-process、
same-Harness、same-Session settled continuation。

**Non-claim.** 它不证明跨进程 Resume、in-flight crash recovery、
side-effect reconciliation 或 Exactly-once Tool execution。

---

## 5. Precontract Research Review and Binding Narrowing

### 5.1 Main-session disposition

主 Session 对
`docs/reports/V0_C_BOUNDED_COMPLETION_PRECONTRACT_RESEARCH.md` 的处置为：

```yaml
disposition: ACCEPT_FOR_CONTRACT_DRAFTING_WITH_BINDING_NARROWING
research_role: advisory_technical_reference
contract_role: binding_after_user_acceptance
additional_specialist_research_required_before_contract: false
claude_source_mirror_review_required_now: false
```

研究报告充分形成了：

- V0-B → V0-C Source/Symbol Delta；
- Pi same-session continuation call chain；
- Attempt lineage 候选；
- Completion Controller 候选状态机；
- Failure Packet 候选；
- deterministic branch matrix；
- independent audit focus；
- Stage 2 frozen-product boundary。

研究报告没有进入 `reference/src/` 是符合项目边界的：固定 Pi、当前 Workbench、
G003/G006 和 `cc-harness-knowledge` 已足以作本 Goal 决策。

研究报告 Section 16 使用了 representative command 表达，而不是完整 forensic
command transcript。这是只读研究报告的非阻塞文档质量限制；Stage 1、Audit
和 Stage 2 必须分别保存 exact commands、cwd、exit codes 和 test counts。

### 5.2 Binding narrowing 1 — no pre-start ghost child

研究候选中的 `child_reserved` 不得被实现为已存在的 child Attempt。

绑定顺序：

```text
policy_decided(recover_once)
→ recovery_slot_reserved
→ Failure Packet evidence committed and validated
→ child Attempt ID allocated
→ run.attempt_ids appends child ID
→ attempt_started
```

规则：

- `run.attempt_ids` 只包含已执行 `attempt_started` 的 Attempt；
- Failure Packet 不要求 `child_attempt_id`；
- Packet 通过 `failure_packet_id` 和 `parent_attempt_id` 关联；
- child ID 只在 `attempt_started` 前的最小临界区分配；
- Packet 已写但 child 未启动时，Run 必须保持 incomplete/invalid evidence，
  不得伪造 ordinal-2 Attempt；
- Recovery slot 是单进程 Controller 的单调状态，不宣称 crash-safe atomic
  reservation 或 durable transaction。

### 5.3 Binding narrowing 2 — two validation levels

V0-C 必须区分：

1. `attempt_evidence_validated`
   - 每个 settled 且执行过 Verifier 的 Attempt 恰好一次；
   - 验证该 Attempt 的 Session/Journal/Workspace/Verifier/artifact 证据；
2. `run_evidence_validation_completed`
   - 整个 Run 恰好一次；
   - 在最终 policy decision 后、Outcome 前；
   - 验证全部 started Attempts、lineage、Failure Packet、预算、动态 Index
     expected set 和 terminal plan。

不得沿用模糊的单一 `evidence_validation_completed` 同时表达两个层级。

### 5.4 Binding narrowing 3 — recovery visibility

V0-C 自动 Recovery 只允许：

```yaml
acceptance_visibility: public_external
completion_policy_id: verify_recover_once_same_session
```

`hidden_external`：

- 可以用于 `observe_only`；
- 可以形成 pass/failed/invalid Outcome；
- 不得把 raw summary、stdout/stderr、ArtifactRef 或隐藏 expected
  implementation 投影给 Agent；
- 不具备 V0-C 自动 Recovery eligibility。

V0-C 不实现 hidden acceptance 的通用 safe projection contract。若未来确有
需求，必须由新 Contract amendment 或后续 Goal 单独审查。

### 5.5 Binding narrowing 4 — real route readiness

Stage 1 必须实现正式 Product Surface 使用的 real-provider configuration /
adapter boundary，并用 strict types、preflight、dependency injection 和
credential-free dry-run 验证，但：

- 不读取 `.env` 或凭据；
- 不实例化需要网络的真实请求；
- 不产生 DNS/HTTP/API call；
- 不依赖 G006 Driver、Spike 私有入口或运行时 source import；
- 不固定未来 Stage 2 的具体模型、任务或实际价格事实；
- Stage 2 前必须重新核验 provider/model/API/price facts。

---

## 6. Scope

### 6.1 Stage 1 in scope

Stage 1 可以在 `workbench/` 和新 V0-C fixture 中实现：

1. additive、versioned V0-C contracts and preflight；
2. `observe_only` 和 `verify_recover_once_same_session`；
3. one/two started Attempt lineage；
4. long-lived public Direct Pi execution handle；
5. run-level Completion Controller；
6. one bounded Failure Packet and public Agent projection；
7. per-entry active Attempt identity；
8. per-Attempt artifact、Verifier 和 validation；
9. one final Run validation、Outcome、Evidence Index 和 terminal record；
10. cumulative Run budget and one Recovery slot；
11. V0-C `run` / `run --dry-run` / `inspect`；
12. deterministic Faux branch suite；
13. V0-A/V0-B/G003/G006 required regressions；
14. formal real-provider product route readiness with zero calls；
15. README/architecture explanation；
16. implementation evidence、Report、Closeout Draft、Source Inventory/Delta
    和 `CURRENT_STATE_UPDATE_PROPOSAL`。

建议使用 additive V0-C modules；允许为避免两套安全策略而小幅共享重构：

```text
workbench/src/contracts/v0c-types.ts
workbench/src/contracts/preflight-v0c.ts
workbench/src/completion/controller-v0c.ts
workbench/src/completion/failure-packet-v0c.ts
workbench/src/pi/pi-adapter-v0c.ts
workbench/src/evidence/journal-v0c.ts
workbench/src/evidence/terminal-policy-v0c.ts
workbench/src/outcome/builder-v0c.ts
workbench/src/inspect-v0c.ts
workbench/src/run-v0c.ts
```

名称可在 Report 中说明后小幅调整，但责任不得重新合并为单体 Driver。

### 6.2 Allowed write paths — Stage 1

```text
workbench/src/**
workbench/tests/**
workbench/test/**
workbench/scripts/**
workbench/README.md
workbench/package.json
fixtures/manifests/v0-c-*
fixtures/verifiers/v0-c-*/**
fixtures/tasks/v0-c-*/**
.runs/v0-c/**
docs/reports/V0_C_STAGE1_IMPLEMENTATION_REPORT.md
docs/reports/V0_C_STAGE1_CLOSEOUT_DRAFT.md
docs/reports/V0_C_PAUSE_REPORT.md
```

对既有 shared module 的修改必须：

- 是 V0-C 所需的最小修改；
- 保持 V0-B public behavior 和历史 evidence replay；
- 由 V0-B 全套回归及相关 mutation tests 覆盖；
- 进入 Source Delta 并说明原因。

### 6.3 Protected inputs

不得修改：

- `.upstream/pi/**`；
- `.runs/v0-a/**`、`.runs/v0-b/**`、`.runs/g003/**`、`.runs/g005/**`、
  `.runs/g006/**` 的历史证据；
- `reference/**`；
- 已接受的 V0-A/V0-B fixture identity；
- 已接受的 G001–G006 Contract/Report/Closeout；
- V0-A/V0-B Implementation Report、Audit Report、Closeout；
- `V0_VERSION_CHARTER.md`；
- V0-A/V0-B 正式 Contract；
- `09_对接执行、文件权威与验收规则.md`；
- `CURRENT_STATE.md`；
- accepted ADR；
- 根三份研究/规划 Markdown；
- `.env*`、凭据或用户 Workspace 外文件。

### 6.4 Out of scope

- Completion Policy 效果或统计比较；
- V1 Skill-only；
- V2 clean-session/multi-path Recovery、Router 或 route selection；
- V3 Experience/Curator/Promotion；
- 跨进程 Resume；
- in-flight crash recovery；
- side-effect replay/reconciliation platform；
- Exactly-once Tool transaction；
- hidden acceptance 通用安全反馈投影；
- more than one child Attempt；
- Worktree；
- OS Sandbox 或系统级 network-egress guarantee；
- arbitrary network Tool、package installation、background service；
- Pi upgrade、Core patch、private import、SDK/RPC fallback；
- external module port/new dependency；
- MCP、Subagent、Multi-Agent、A2A、SQLite、UI、Dashboard；
- Git commit/push by a dedicated Session。

---

## 7. Stage Owners and Isolation

| Stage | Owner | Authority | Stop point |
| --- | --- | --- | --- |
| Contract / architecture | current Main Session | draft、review、user decisions | no implementation |
| Stage 1 deterministic implementation | new dedicated V0-C Implementation Session | Contract-scoped source/tests/evidence, 0 real calls | Report + Closeout Draft |
| Candidate freeze | Main Session after user authorization | create exact Candidate Commit | no audit execution |
| Focused audit | fresh independent Audit Session | read candidate, run bounded regressions, write audit-local evidence/report | advisory report |
| Bounded correction | original Implementation Session | only accepted findings and regressions | corrected Report/Delta |
| Stage 2 UAT | fresh User-Acceptance Session | one frozen-product Run with separate credentials/budget | UAT Report |
| Final acceptance | Main Session + user | Accept / Revise / Reject / Closeout | explicit user decision |

权限不得在 Stage 间自动继承。

---

## 8. Architecture Responsibilities

```text
CLI
  → V0-C Preflight
  → Run Coordinator
      → Workspace Provider
      → Strategy / Budget Snapshot
      → Completion Controller
          → long-lived Pi Run Handle
              → public AgentHarness
              → one Session
              → one Workspace
          → per-Attempt Evidence / Verifier
          → Failure Packet
      → Run-level Evidence Validator
      → Outcome Builder
      → Dynamic Evidence Index + Terminal Record
  → V0-C Inspector
```

| Component | Owns | Must not own |
| --- | --- | --- |
| CLI | Product arguments、exit codes、dry-run | Recovery causality |
| Preflight | manifest、visibility、strategy、budget、route readiness | side effects |
| Coordinator | IDs、ordering、resource lifetime、terminalization | Agent reasoning |
| Completion Controller | eligibility、slot、budget、stop/recover decision | Pi Loop internals |
| Pi Run Handle | one Harness/Session/Workspace across Attempts | Outcome judgment |
| Journal | active Attempt event identity、closed enum、seq | implicit retries |
| Failure Packet Builder | safe bounded public feedback | hidden acceptance leakage |
| Verifier Runner | per-Attempt external environment fact | Agent self-evaluation |
| Attempt Validator | per-Attempt evidence | Run terminal commit |
| Run Validator | lineage、budgets、dynamic evidence set | evidence repair |
| Outcome Builder | Charter causal precedence | duplicate terminalization |
| Inspector | read-only integrity and explanation | mutation or repair |

---

## 9. V0-C Data Contracts

字段名允许为 strict TypeScript 做有据可查的小幅调整，但 identity、lineage、
visibility、budget 和 terminal semantics 不得改变。

### 9.1 TaskSpecV0C

保留 V0-B identity，并至少包含：

```yaml
schema_version: 1
task_id: string
instruction_ref: run_safe_project_relative_ref
instruction_sha256: sha256
workspace_source_ref: project_relative_ref
workspace_source_digest: sha256
writable_paths: []
protected_paths: []
verifier_id: string
verifier_ref: project_relative_ref
verifier_sha256: sha256
acceptance_visibility: public_external_or_hidden_external
agent_feedback_schema: public_failure_packet_v1_or_none
tool_profile_id: string
command_descriptors: []
verifier_command: bounded_external_command
```

Preflight 规则：

- `verify_recover_once_same_session` 要求
  `acceptance_visibility: public_external` 和
  `agent_feedback_schema: public_failure_packet_v1`；
- `hidden_external` 只允许 `observe_only`；
- Verifier、Task source 和 hidden acceptance 不在 Agent write scope；
- invalid visibility/strategy 组合在 Workspace、Session、Attempt、Provider 或
  Verifier副作用前失败。

### 9.2 StrategySpecV0C

```yaml
schema_version: 1
strategy_id: string
base_prompt_id: string
base_prompt_sha256: sha256
skill_refs: []
completion_policy_id: observe_only_or_verify_recover_once_same_session
recovery_mode: none_or_same_session
recovery_budget: 0_or_1
tool_profile_id: string
model_profile_id: string
```

有效组合只有：

| completion policy | recovery mode | recovery budget |
| --- | --- | ---: |
| `observe_only` | `none` | 0 |
| `verify_recover_once_same_session` | `same_session` | 1 |

`strategy_id` 不得写死为 baseline/candidate，`skill_refs` 保持独立且 Stage 1
必须为空。

### 9.3 RunRecordV0C

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
budget: RunBudgetV0C
recovery_slots:
  limit: 0_or_1
  consumed: 0_or_1
attempt_ids:
  - started_attempt_id
```

规则：

- `attempt_ids.length` 只能为 1 或 2；
- 数组只包含已经发生 `attempt_started` 的 Attempt；
- 顺序严格对应 ordinal；
- Report 文本不能补充不存在的 Attempt。

### 9.4 AttemptRecordV0C

```yaml
schema_version: 1
attempt_id: string
run_id: string
ordinal: 1_or_2
strategy_id: string
parent_attempt_id: string_or_null
trigger: initial_or_verifier_failure
session_id: string
workspace_id: string
failure_packet_id: string_or_null
started_at: rfc3339
settled_at: rfc3339_or_null
terminal_reason: string_or_null
budget_allocation: object
budget_usage: object
```

规则：

- initial：ordinal 1、parent null、trigger initial、packet null；
- child：ordinal 2、parent 为 initial ID、trigger verifier_failure；
- child 与 initial 的 run/strategy/session/workspace 相同；
- child 必须引用已验证的 Failure Packet；
- 不允许 ordinal 3；
- 已 started child 即使 abort/error/invalid 也必须保留在 lineage 中。

### 9.5 FailurePacketV0C

完整 evidence object：

```yaml
schema_version: 1
failure_packet_id: string
run_id: string
parent_attempt_id: string
verifier_id: string
verifier_sha256: sha256
verifier_result_ref: artifact_ref
verifier_result_sha256: sha256
failure_summary: bounded_string
failed_checks:
  - bounded_string
workspace_digest: sha256
budget_remaining: bounded_object
agent_projection_ref: artifact_ref
agent_projection_sha256: sha256
created_at: rfc3339
```

不得包含 `child_attempt_id`。child 只在 Packet 已验证后创建，并在自己的
`failure_packet_id` 字段反向关联。

### 9.6 CompletionDecisionV0C

```yaml
schema_version: 1
decision_id: string
run_id: string
after_attempt_id: string
decision: stop_passed_or_stop_failed_or_stop_invalid_or_stop_cancelled_or_recover_once
reason: closed_reason_enum
evidence_valid: boolean
verifier_status: passed_or_failed_or_invalid_or_null
recovery_slot_before: 0_or_1
recovery_slot_after: 0_or_1
budget_snapshot: object
failure_packet_id: string_or_null
created_at: rfc3339
```

每个 evaluated Attempt 恰好一个 decision；child decision 不得再次
`recover_once`。

### 9.7 JournalEntryV0C

保留 V0-B closed envelope：

```yaml
schema_version: 1
seq: positive_integer
timestamp: rfc3339
type: closed_event_enum
run_id: string
attempt_id: string_or_null
session_id: string
workspace_id: string
data: object
```

新增/明确的 lifecycle event：

```yaml
- attempt_evidence_validated
- policy_decided
- recovery_slot_reserved
- failure_packet_created
- run_evidence_validation_completed
```

Run-level event 的 `attempt_id` 必须使用明确的 `null`，不得借用错误的 active
Attempt。所有 Agent/Tool/Session/Verifier entry 必须带当前 started Attempt
ID。`data` 不得覆盖 outer IDs 或 event type。

### 9.8 OutcomeV0C

```yaml
schema_version: 1
run_id: string
final_attempt_id: string
status: passed_or_failed_or_invalid_or_cancelled
failure_class: agent_or_verifier_or_infrastructure_or_evidence_or_budget_or_user_or_null
terminal_reason: closed_terminal_reason
initial_verifier_status: passed_or_failed_or_invalid_or_null
final_verifier_status: passed_or_failed_or_invalid_or_null
recovery_triggered: boolean
attempt_count: 1_or_2
recovery_slots_consumed: 0_or_1
evidence_index_ref: run_relative_path
```

Outcome 继续使用 V0 Charter 因果 precedence。不得通过 enum 顺序推断。

---

## 10. Completion Controller

### 10.1 State model

```text
planned
→ initial_running
→ initial_settled
→ initial_verifying
→ initial_validated
→ initial_policy_deciding
   ├─→ run_finalizing
   └─→ recovery_slot_reserved
       → failure_packet_committed
       → child_running
       → child_settled
       → child_verifying
       → child_validated
       → child_policy_deciding
       → run_finalizing
→ run_validated
→ outcome_created
→ run_terminal
```

没有任何路径可从 child policy decision 回到 recovery eligibility。

### 10.2 Initial decision table

| Initial observation | Other gates | Decision |
| --- | --- | --- |
| evidence invalid | any | `invalid/evidence`; no child |
| Verifier invalid | evidence valid | `invalid/verifier`; no child |
| infrastructure blocked | evidence valid | `invalid/infrastructure`; no child |
| user cancelled | before valid terminal | `cancelled/user`; no child |
| budget exhausted/counter invalid | counters valid/invalid | `failed/budget` or `invalid/evidence`; no child |
| Verifier passed | all valid | `passed`; no child |
| Verifier failed + observe-only | all valid | `failed/agent`; no child |
| Verifier failed + hidden acceptance | all valid | `failed/agent`; no child |
| Verifier failed + recovery strategy | public、slot、reserve、Packet valid | reserve once, start child |
| Verifier failed + recovery strategy | slot unavailable | `failed/agent`; no child |
| Verifier failed + recovery strategy | start reserve insufficient | `failed/budget`; no child |
| Verifier failed + recovery strategy | Packet invalid/persist failure | `invalid/evidence`; no child |

### 10.3 Child decision table

| Child observation | Decision |
| --- | --- |
| evidence invalid | `invalid/evidence` |
| Verifier invalid | `invalid/verifier` |
| infrastructure blocked | `invalid/infrastructure` |
| user cancelled | `cancelled/user` |
| hard budget exhausted before valid pass | `failed/budget` |
| Verifier passed | `passed/null` |
| Verifier failed | `failed/agent` |

### 10.4 Eligibility order

```text
Attempt settled?
→ Attempt evidence valid?
→ Verifier execution valid?
→ user cancellation?
→ cumulative budget counters valid?
→ Verifier passed or failed?
→ Strategy permits recovery?
→ acceptance visibility is public_external?
→ Recovery slot available?
→ full child-start reserve available?
→ reserve Recovery slot
→ construct, persist, scan and validate Failure Packet
→ allocate/start child
```

任何失败都不得通过 Report prose、catch-all retry 或 default branch 继续。

---

## 11. Attempt, Session and Adapter Lifecycle

### 11.1 Long-lived handle

V0-C Pi Adapter 必须提供等价于：

```ts
interface PiRunHandleV0C {
  readonly sessionId: string;
  readonly workspaceId: string;
  runAttempt(input: {
    attemptId: string;
    prompt: string;
    budget: AttemptBudgetV0C;
  }): Promise<SettlementV0C>;
  abort(): Promise<AbortEvidenceV0C>;
  close(): Promise<void>;
}
```

精确名称可调整；绑定语义是：

- 每个 Run 只构造一个 Harness/Session/Workspace；
- initial 和 child 通过同一个 handle；
- handle 仅在 Run finalization 后 close；
- 不允许并发 Attempt；
- 每次 `runAttempt()` 前必须把 active Attempt identity fail-closed 地切换；
- event callback 无 active started Attempt 时不得猜测 ID；
- callback 中发现 identity drift 时 Run 为 `invalid/evidence`。

### 11.2 No durable-runtime claim

Controller、handle 和 Recovery reservation 都是当前进程内能力。进程在 Packet
提交、child 启动或 Tool 副作用后崩溃时：

- 保留已有 artifact；
- 不自动 replay；
- 不重建 child；
- `inspect` 报 incomplete/invalid；
- 不宣称 resume、reconciliation 或 exactly-once。

---

## 12. Failure Packet and Agent Projection

Agent-visible projection 只能是稳定序列化的：

```yaml
type: verifier_failure
parent_attempt_id: string
verifier_id: string
failure_summary: bounded_string
failed_checks: []
instruction: repair_the_task_then_finish
```

硬上限：

```yaml
serialized_projection_utf8_bytes: 8192
failure_summary_characters: 2000
failed_checks_count: 32
failed_check_characters_each: 256
serialization: stable_json
digest: sha256
```

不得包含：

- credential、authorization header；
- reasoning body/signature；
- hidden expected implementation；
- raw absolute/writable Verifier path；
- raw stdout/stderr；
- unbounded free text；
- 允许新读权限的 ArtifactRef；
- 未经结构化验证的 infrastructure error。

完整 Verifier output 只进入 Agent write/read scope 外的 evidence artifact。
Packet、projection、digest、size、visibility 和 workspace digest 任一不匹配，
不得启动 child。

---

## 13. Budget Contract

### 13.1 Stage 1 deterministic hard limits

Stage 1 使用 public emitted Faux Provider：

```yaml
stage_1:
  external_provider_calls: 0
  real_model_calls: 0
  credential_reads: 0
  recovery_slot_limit: 1
  attempt_limit: 2
  verifier_limit: 2

  per_attempt:
    provider_request_limit: 8
    tool_call_limit: 7
    agent_wall_time_limit_ms: 120000
    verifier_timeout_ms: 30000
    verifier_output_hard_cap_bytes: 262144

  run:
    provider_request_limit: 16
    tool_call_limit: 14
    wall_time_limit_ms: 360000
    finalization_wall_time_reserve_ms: 60000
    cost_limit_usd: 0
    token_limit: not_applicable

  minimum_child_start_reserve:
    provider_requests: 8
    tool_calls: 7
    agent_wall_time_ms: 120000
    verifier_runs: 1
    verifier_wall_time_ms: 30000
    finalization_wall_time_ms: 60000
```

`minimum_child_start_reserve` 是 policy eligibility 输入，不是 crash-safe
financial reservation。initial Attempt 同样受 per-attempt hard cap，不能消费
child 分配。Failure Packet 构建前必须检查完整 reserve；Packet/scan 消耗也
计入 Run wall time。

### 13.2 Stage 2 maximum envelope

Stage 2 仍需单独授权，最大不得超过：

```yaml
stage_2_maximum:
  authorized_runs: 1
  attempt_limit: 2
  recovery_slot_limit: 1
  verifier_limit: 2
  per_attempt_provider_requests: 8
  per_attempt_tool_calls: 12
  per_attempt_agent_wall_time_ms: 300000
  per_verifier_timeout_ms: 30000
  per_provider_request_max_output_tokens: 8192
  run_provider_requests: 16
  run_tool_calls: 24
  run_total_token_cap: 131072
  run_total_cost_cap_usd: 2
  run_wall_time_cap_ms: 900000
  automatic_second_run: false
```

若 Stage 2 使用 Recovery Strategy，冻结的 UAT manifest 必须至少保留：

```yaml
stage_2_child_start_reserve:
  provider_requests: 8
  tool_calls: 12
  agent_wall_time_ms: 300000
  verifier_runs: 1
  verifier_wall_time_ms: 30000
  token_cap: 65536
  cost_cap_usd: 1
  finalization_wall_time_ms: 120000
```

用户可以授权更严格的总预算，但如果更严格预算不足以满足上述 child reserve，
只能选择 `observe_only`，不得把 Recovery Strategy 变成“尽力而为”的隐式
行为。价格、模型、Task、Workspace 和凭据只在 Stage 2 前单独冻结。

### 13.3 Exhaustion semantics

- budget counter 缺失/矛盾 → `invalid/evidence`；
- start reserve 不足且 initial valid fail → `failed/budget`；
- child 已启动后 hard budget 耗尽且 evidence 完整 → `failed/budget`；
- budget 超限不得启动第三 Attempt、第二 Run 或 alternate model；
- Verifier/scan/finalization budget 不得被 Provider/Tool 消耗掩盖。

---

## 14. Evidence, Validation and Terminalization

### 14.1 Per-Attempt ordering

```text
attempt_started
→ Agent / Provider / Tool / Session events
→ attempt_settled
→ workspace_attempt_snapshot
→ verifier_started
→ verifier_completed
→ attempt_evidence_validated
→ policy_decided
```

没有 settled 的 abort/error route 不得运行 Verifier。

### 14.2 Recovery transition

```text
initial policy_decided(recover_once)
→ recovery_slot_reserved
→ failure_packet_created
→ child attempt_started
```

### 14.3 Final ordering

```text
final policy_decided(stop)
→ run_evidence_validation_completed
→ build deterministic pending Run/Attempt/Outcome/abort objects
→ integrated secret scan over existing files + pending objects + planned terminal Journal projection
→ refresh and recheck final budget
→ append outcome_created
→ append run_terminal as final Journal event
→ write final Run/Attempt/Outcome/abort objects
→ create Evidence Index from the finalized Journal and closed expected set
→ terminal record committed last
```

`Outcome.evidence_index_ref` 使用经过验证的 run-relative path，而不是带 Index
digest 的 ArtifactRef，以避免 Outcome/Index digest cycle。Integrated scan
必须像已接受的 V0-B policy 一样覆盖：

- 全部既有 terminal-candidate files；
- pending Run、全部 Attempt、Outcome、abort 和其他 secret-relevant objects；
- pending `outcome_created` / `run_terminal` 的固定 data projection；
- Failure Packet 和 Agent projection；
- 动态 Tool/Verifier artifacts。

scan 完成后只允许写入由上述已扫描对象确定性序列化出的 terminal 文件、只含
path/digest/size/responsibility 的 Index，以及只含固定 digest metadata 的
terminal record。若 scan 后预算越界、对象发生变化或出现未扫描的动态内容，
不得提交 terminal record。

以下不变量不可变：

- exactly one Run-level validation；
- exactly one Outcome；
- exactly one final terminal Journal suffix；
- terminal record 最后写；
- terminal record 绑定 Outcome 和 Index digest；
- terminal 后无事件、artifact backfill 或 Outcome rewrite；
- Inspector 与 writer 共享 closed expected-set policy，而不是各自猜测。

### 14.4 Dynamic closed evidence set

Evidence Index expected set 必须由已 started 的 `run.attempt_ids`、strategy、
决策和 Packet existence 确定：

- one-Attempt Run 不得出现 child/Packet 文件；
- two-Attempt Run 必须包含两个 Attempt 的 object、workspace snapshot、
  Verifier result/output、Attempt validation 和 child Packet/projection；
- unexpected、duplicate、missing、digest-mismatched、wrong-responsibility
  entry 均被拒绝；
- V0-B accepted static expected set 不得被放宽或改写。

---

## 15. Verifier and Visibility Contract

每个 settled Attempt 恰好运行一次相同 identity/digest 的外部 Verifier：

- 位于 Agent write scope 外；
- preflight 固定 path/digest/executable/argv/cwd/env/timeout/output cap；
- `shell: false` 或等价无 shell 注入；
- pass、valid task fail、invalid Verifier 分开；
- full output 是 attempt-scoped ArtifactRef；
- Attempt 2 不得覆盖 Attempt 1 输出；
- hidden acceptance 的任何 raw result 不进入 Agent projection。

Public recovery fixture 的 failure summary / failed checks 必须来自固定、结构化、
有界、可公开的 Verifier result schema，而不是截取任意 stderr。

---

## 16. Product Surface and Real-route Readiness

### 16.1 Required CLI

```text
workbench run --task <manifest> --strategy <strategy> --dry-run
workbench run --task <manifest> --strategy <strategy>
workbench inspect <run-id>
```

允许精确参数顺序小幅调整，但 Stage 2 不得依赖内部 Driver、test-only injection、
G006 source 或直接 import `run-v0c.ts`。

### 16.2 Dry-run

`--dry-run` 必须：

- 验证 Task/Strategy/Verifier/Tool/Model/Profile identities；
- 验证 visibility/recovery compatibility；
- 显示 one/two Attempt plan 和 budget/reserve；
- 显示 Workspace/evidence roots；
- 对 real profile 显示 credential requirement，但不读取 credential；
- 不创建正式 Run/Attempt/Workspace/Session；
- 不调用 Provider、Tool 或 Verifier；
- 不修改 fixture/target Workspace。

### 16.3 Stage 1 real route

Stage 1 必须证明：

- real-provider profile 能通过正式 Spec/Preflight/CLI route 表达；
- Pi Adapter/Provider factory boundary strict typecheck；
- request/usage/identity 投影接口可由 deterministic fake transport 测试；
- missing credential 或 execution authority 在调用前 fail closed；
- zero-call route 不依赖 `spikes/pi-runtime/g006` at runtime；
- provider calls、network calls、credential reads 均为 0。

这不证明当前 provider API 可用；Stage 2 前必须重新核验。

---

## 17. Deterministic Stage 1 Matrix

全部使用 public emitted Faux Provider，真实/外部 Provider 调用为 0：

| Case | Initial | Child | Expected |
| --- | --- | --- | --- |
| observe-pass | valid pass | absent | passed, 1 Attempt |
| observe-fail | valid fail | absent | failed/agent, 1 Attempt |
| recovery-policy-initial-pass | valid pass | absent | passed, slot 0 |
| recover-once-pass | valid fail | valid pass | passed, 2 Attempts |
| recover-once-fail | valid fail | valid fail | failed/agent, 2 Attempts |
| hidden-recovery-preflight | hidden external | absent | preflight reject |
| initial-verifier-invalid | invalid | absent | invalid/verifier |
| initial-evidence-invalid | any | absent | invalid/evidence |
| initial-abort/cancel | no valid conclusion | absent | cancel/invalid; no Verifier/child |
| child-start-reserve-insufficient | valid fail | absent | failed/budget |
| child-budget-exhausted | valid fail | budget stop | failed/budget, 2 Attempts |
| Packet malformed/oversized | valid fail | absent | invalid/evidence |
| Packet digest/visibility mismatch | valid fail | absent | invalid/evidence |
| Packet persisted but child not started | valid fail | absent | incomplete/invalid; no ghost ID |
| duplicate child request | valid fail | forbidden | rejected; no third Attempt |
| duplicate Verifier | any | forbidden | invalid/evidence |
| premature Outcome/event after terminal | any | forbidden | Inspector reject |
| child Session/Workspace drift | valid fail | invalid child | invalid/evidence |
| active Attempt event drift | any | invalid | invalid/evidence |
| G003 continuation regression | fail | recovery pass | same-session mechanism passes |
| G006 no-extra-cycle regression | pass | absent | no recovery/extra Verifier |
| real-profile zero-call dry-run | none | none | ready plan, no credential/network/call |

Required regression：

- strict TypeScript；
- all accepted V0-A tests；
- all accepted V0-B tests, including `V0B-AUD-001`–`005` mutations；
- isolated V0-B post-audit test setup is self-created if V0-C touches that
  runner；否则只保留 known issue；
- public emitted Pi import smoke；
- formal V0-C CLI end-to-end；
- V0-C Inspector mutation suite。

---

## 18. Gates

### Gate A — Control and source identity

Pass：

- Contract 为 accepted + activated；
- `CURRENT_STATE.active_goal` 为 V0-C；
- exact Control Baseline Commit recorded；
- root tracked files clean；
- registered untracked `reference/` 可存在但未修改/提交；
- `.upstream/pi` exact commit and clean；
- V0-B implementation baseline and digest verified；
- dedicated Stage 1 owner correct；
- real model/provider authority is 0。

### Gate B — Contract, preflight and versioned compatibility

Pass：

- strict V0-C types；
- valid strategy/visibility/budget combinations；
- invalid input fails before side effects；
- V0-B manifests and behavior remain accepted；
- dry-run creates no formal runtime object。

### Gate C — Attempt lineage and active identity

Pass：

- one/two started Attempt lineage valid；
- no ghost child ID；
- no ordinal 3；
- child parent/run/strategy/session/workspace/Packet link valid；
- active Attempt identity cannot drift in callbacks。

### Gate D — same-session Pi continuation

Pass：

- one long-lived public Direct handle；
- initial and child use same Harness/Session/Workspace；
- settled before second prompt；
- handle closes only after finalization；
- Pi patches/private imports 0。

### Gate E — Completion Controller and budget

Pass：

- full decision matrix；
- one Recovery slot；
- reserve checked before Packet/child；
- invalid/verifier/budget/abort/cancel never starts child；
- child cannot re-enter eligibility；
- cumulative and per-Attempt counters truthful。

### Gate F — Failure Packet and visibility

Pass：

- public-only automatic recovery；
- projection bounds/digest/stable serialization；
- hidden acceptance never forwarded；
- malformed/missing/oversized/secret-bearing Packet fails closed；
- full output stays outside Agent scope。

### Gate G — per-Attempt Verifier and validation

Pass：

- Verifier only after settled；
- exactly once per settled evaluated Attempt；
- outputs never overwrite；
- one Attempt validation per evaluated Attempt；
- valid fail and invalid Verifier distinct。

### Gate H — Run Outcome, Index and terminal evidence

Pass：

- exactly one Run validation/Outcome/terminal suffix/record；
- dynamic closed Index complete for one/two Attempts；
- integrated scan covers both Attempts and Packet；
- terminal record binds Outcome/Index；
- mutation suite fails closed；
- V0-B terminal policy regressions remain green。

### Gate I — Product Surface and zero-call real-route readiness

Pass：

- formal `run` / `inspect`；
- deterministic public task through Product Surface；
- real profile dry-run through Product Surface；
- credentials not read；
- network/provider calls 0；
- Stage 2 would not require source edits。

### Gate J — Scope, reports and provenance

Pass：

- V0-A/V0-B/G003/G006 regressions；
- protected inputs unchanged；
- external downloads/dependencies/modules 0；
- exact commands, exit codes, Source Inventory/Delta and Evidence Index；
- claims/non-claims complete；
- structured `CURRENT_STATE_UPDATE_PROPOSAL`。

### Gate K — Focused independent audit

Gate K 只有用户在 Candidate Commit 后另行授权才存在。它必须通过后才能请求
Implementation Baseline 和 Stage 2。

### Gate R — Stage 2 user-facing Run

Gate R 只有用户另行冻结 Task/Model/Workspace/feedback/budgets/credentials 并
授权后才存在。Stage 1 Activation 不授权 Gate R。

---

## 19. Definition of Done

### 19.1 Stage 1 Candidate DoD

1. Gates A–J pass；
2. accepted V0-A/V0-B regression sets green；
3. strict TypeScript passes；
4. public emitted Pi imports only；
5. both Strategy capabilities work deterministically；
6. one/two Attempt lineage validates；
7. `run.attempt_ids` contains only started Attempts；
8. no third Attempt or second Recovery slot；
9. same-session child preserves Harness/Session/Workspace；
10. active Attempt Journal identity is correct；
11. invalid/verifier/budget/abort/cancel never starts child；
12. Packet is public-only、bounded、digest-bound and secret-safe；
13. each evaluated settled Attempt has exactly one Verifier；
14. each evaluated Attempt has exactly one Attempt validation；
15. Run has exactly one final validation、Outcome、Index、terminal suffix and
    terminal record；
16. dynamic Index rejects omission、unexpected entry、duplicate、digest and
    responsibility mutation；
17. Stage 1 hard budgets and child reserve are enforced；
18. formal CLI deterministic task passes；
19. formal real profile route passes zero-call dry-run；
20. external/real Provider calls are exactly 0；
21. credential reads and external network calls are exactly 0；
22. Pi Core patches/private imports are exactly 0；
23. accepted historical evidence and protected files unchanged；
24. final secret/reasoning scan is zero match；
25. Implementation Report、Closeout Draft、Evidence Index、Source
    Inventory/Delta、commands/exit codes 和 state proposal complete；
26. all limitations and Stage 2 status explicit。

### 19.2 Final V0-C DoD

在 Stage 1 之外还必须：

1. focused independent audit passes，或 findings 被原 Implementation Session
   修复并通过聚焦复审；
2. exact Implementation Baseline Commit and Workbench digest frozen；
3. Stage 2 的 Task/Model/Workspace/feedback/credential/run/cost budgets 由用户
   单独授权；
4. fresh UAT Session 只通过正式 Product Surface执行恰好一个 Run；
5. UAT Session不修改源码；
6. Run/Attempt/Session/Workspace/Verifier/Outcome/terminal evidence 可 inspect；
7. 若 initial pass，诚实记录 no recovery；若自然 failure 且合资格，至多一个
   child；
8. 用户能解释 stop/recover 原因；
9. final Report 明确不作效果、泛化或真实 Recovery claim，除非确实观察到；
10. Main Session 与用户正式接受 V0-C。

V0-C final DoD 不要求自然真实 Recovery 一定出现。

---

## 20. Required Deliverables

### 20.1 Stage 1 Implementation Session

必须提交：

1. authorized Workbench/fixture/test source；
2. `.runs/v0-c/evidence/EVIDENCE_INDEX.md` 或等价 Goal index；
3. authoritative deterministic pass/recovery/counterexample Runs；
4. `docs/reports/V0_C_STAGE1_IMPLEMENTATION_REPORT.md`；
5. `docs/reports/V0_C_STAGE1_CLOSEOUT_DRAFT.md`；
6. exact Source Inventory and Control-Baseline-to-Candidate Source Delta；
7. exact commands、cwd、exit codes、test counts；
8. root/Pi HEAD and status；
9. Provider/network/credential/model call counts；
10. secret/reasoning scan；
11. protected-path byte identity result；
12. structured `CURRENT_STATE_UPDATE_PROPOSAL`。

### 20.2 Focused Audit Session

必须提交：

- `docs/reports/V0_C_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`；
- audit-local ignored evidence；
- exact Candidate SHA/digest；
- findings by severity/source/symbol/test；
- exact commands and exit codes；
- `PASS_FOCUSED_AUDIT`、`REQUEST_BOUNDED_CORRECTION` 或 `PAUSE_AUDIT`。

Audit Session不得写 Closeout、修源码、创建 Commit 或更新控制状态。

### 20.3 Stage 2 User-Acceptance Session

必须提交：

- one authorized Run under `.runs/v0-c/`；
- `docs/reports/V0_C_STAGE2_USER_ACCEPTANCE_REPORT.md`；
- exact frozen baseline/task/model/provider/budget identity；
- commands、exit codes、request/tool/token/cost/time usage；
- Outcome/Inspector summary；
- secret scan；
- source byte identity before/after；
- recovery observed or not observed；
- no-source-edit attestation；
- structured final state proposal。

---

## 21. Focused Independent Audit Scope

V0-C 因改变 control flow、lineage、budget/stop、Failure Packet、
Verifier/evidence 和 terminalization，Candidate 冻结后应进行一次独立审计。

范围只包括：

1. public-only child eligibility；
2. exactly one Recovery slot；
3. no ghost child and no ordinal 3；
4. parent/child/session/workspace/Packet lineage；
5. invalid/budget/abort/cancel no-child；
6. Packet size/digest/visibility/secret boundary；
7. per-Attempt Verifier and validation exactly once；
8. cumulative budget and child reserve；
9. one Run validation/Outcome/terminal record；
10. dynamic Index completeness；
11. regression of `V0B-AUD-001`–`005`。

不得扩展到：

- 全面 Windows path security；
- 全量 Pi audit；
- cross-process Resume；
- crash durability；
- general DLP；
- Policy effectiveness；
- V2/V3 architecture。

---

## 22. Stage 2 User-Acceptance Boundary

Stage 2 开始前必须同时满足：

- Stage 1 Candidate 经主 Session审查；
- focused audit passed；
- exact Implementation Baseline Commit/digest frozen；
- formal real route zero-call validated；
- user freezes one Task、Workspace source、public feedback、Model/Profile；
- user freezes one Run and exact request/tool/token/time/cost caps；
- credential只对 fresh UAT Session可用；
- UAT Session没有 source-edit 或 Git authority。

Task 限制：

- 用户可理解、可检查的本地 Coding Task；
- 不要求网络、安装、Git commit/push、后台服务、提权或 Workspace 外副作用；
- Verifier/Acceptance 不可由 Agent 修改；
- 不制造 synthetic failure；
- initial pass 就停止；
- implementation defect 立即停止并返回 Main Session，不在 UAT 修复。

---

## 23. Required Report Claims

每份报告必须区分：

- `Fact`；
- `Inference`；
- `Recommendation`；
- `Unconfirmed`。

Stage 1 Implementation Report 至少解释：

- V0-B 哪些模块复用、共享重构或保持不变；
- Pi public same-session call chain；
- Completion Controller 状态与 decision table；
- no-ghost-child 机制；
- Attempt-level / Run-level validation 区别；
- public-only Failure Packet；
- exact budget/reserve；
- formal real route如何做到零调用；
- V1/V2 continuity；
- source paths、symbols、tests；
- all limitations。

---

## 24. Pause Conditions

命中任一项立即停止并提交 `docs/reports/V0_C_PAUSE_REPORT.md`：

1. root baseline、active Goal、V0-B baseline、Pi commit/version/license/status
   不一致；
2. 需要 Pi Core patch、private import、partial emitted build、SDK/RPC fallback；
3. 需要依赖安装、Registry、下载、外部模块或 Stage 1 网络；
4. Stage 1 需要读取凭据或调用真实/外部 Provider；
5. same Harness/Session/Workspace continuation 无法通过 public path 实现；
6. active Attempt identity 在 callbacks 中无法可靠绑定；
7. child 必须在 Packet/预算/slot gate 前创建才能继续；
8. `run.attempt_ids` 必须记录未 started child 才能继续；
9. hidden acceptance 必须暴露给 Agent 才能完成 Recovery；
10. cumulative budget、child reserve 或 exactly-one slot 无法 truthful enforce；
11. invalid/verifier/budget/abort/cancel 会错误启动 child；
12. child 可再次进入 Recovery 或出现第三 Attempt；
13. 每个 Attempt 的 Verifier/validation 无法 exactly once；
14. final validation、Outcome、Index 或 terminal record 可重复/提前写入；
15. dynamic Index 只能通过放宽 V0-B integrity policy 实现；
16. reasoning、secret、credential、hidden expected implementation 进入证据或
    Agent projection；
17. Verifier/acceptance 位于 Agent write scope；
18. Stage 2 正式 route 必须在 Candidate freeze 后改源码；
19. 需要修改 protected control/reference/Pi/historical evidence；
20. 需要扩大为 cross-process Resume、durable runtime、Exactly-once、V2/V3；
21. Stage 2 需要第二 Run、alternate model、额外成本或未授权 side effect；
22. 用户工作区存在无法绕开的冲突；
23. 新事实要求改变 Charter 的 Outcome、Recovery Budget、Strategy 或 V1/V2
    continuity。

Pause Report 只记录：

- observation；
- exact source/run evidence；
- why blocked；
- preserved state；
- actual Provider/model/network/credential counts；
- user/Main Session decision needed。

不得自行换路线或扩大权限。

---

## 25. Claims Allowed

### 25.1 After accepted Stage 1 and audit

可以声称：

- Workbench deterministically implements observe-only and one bounded
  same-session recovery；
- one/two Attempt lineage、Failure Packet、budget/stop 和 terminal evidence
  可验证；
- invalid evidence/Verifier/budget/cancel 不会错误触发 child；
- same-process public Direct Pi route不需要 Core patch/private import；
- formal real-provider product route 已做 zero-call readiness validation。

必须附加：

- no V0-C real user Run yet；
- real Recovery effect and Policy effectiveness unproven。

### 25.2 After final V0-C acceptance

除 Stage 1 claims 外，可以声称：

- 用户从冻结 Product Surface实际执行过一个受限真实 Coding Task；
- exact Run 的 stop/recover、budget、Outcome 和 evidence 可复核；
- V0 已形成可实际使用的最小 Completion-controlled Coding Agent Workbench。

只有真实 Run 确实触发 Recovery 时，才可声称观察到一次真实 same-session
Recovery；仍不得将单次观察写成 effectiveness。

---

## 26. Claims Not Allowed

即使 V0-C 完成，也不得声称：

- Completion Verification 提高了成功率；
- Runtime Control 优于 Skill-only；
- same-session 优于 clean-session；
- statistical reliability or generalization；
- cross-process Resume、crash reconciliation、Exactly-once；
- OS Sandbox/system network egress blocking/general DLP；
- V1 Skill competition、V2 adaptive multi-path、V3 Experience；
- Pi 自带本项目 Outcome/Verifier/Completion Policy；
- 一个真实 Task 或一次低成本代表生产可靠性；
- 未自然发生的 real Recovery 已被证明。

---

## 27. Closeout Dispositions

Stage 1 Implementation Session只能建议：

```yaml
- PASS_V0_C_STAGE1_CANDIDATE_FOR_MAIN_REVIEW
- PAUSE_V0_C_STAGE1
- FAIL_V0_C_STAGE1_CONTRACT
```

Audit Session只能建议：

```yaml
- PASS_FOCUSED_V0_C_AUDIT
- REQUEST_V0_C_BOUNDED_CORRECTION
- PAUSE_V0_C_AUDIT
```

Stage 2 UAT Session只能建议：

```yaml
- PASS_V0_C_USER_ACCEPTANCE
- PAUSE_V0_C_USER_ACCEPTANCE
- FAIL_V0_C_FROZEN_PRODUCT
```

最终 V0-C disposition 只由 Main Session复核并由用户接受：

```yaml
- PASS_V0_C_BOUNDED_COMPLETION_AND_USER_FACING_USE
- REVISE_V0_C
- PAUSE_V0_C
- REJECT_V0_C
```

---

## 28. Accepted Decisions and Remaining Authority

```yaml
accepted_decisions:
  - decision: accept_formal_V0_C_Goal_Contract
    accepted_by_user: 2026-07-31
    accepted_value: accepted
    consequence: Contract_is_binding

  - decision: authorize_V0_C_Activation_and_Control_Baseline_Commit
    accepted_by_user: 2026-07-31
    accepted_value: authorized
    consequence: main_session_records_active_goal_and_creates_exact_baseline

  - decision: authorize_Stage_1_implementation
    accepted_by_user: 2026-07-31
    accepted_value: dedicated_session_zero_real_calls_after_exact_baseline
    consequence: Stage_1_may_start_only_from_confirmed_Control_Baseline

  - decision: authorize_remaining_V0_C_sequence
    accepted_by_user: 2026-07-31
    accepted_value: corrected_candidate_commit_then_focused_reaudit_then_implementation_baseline_then_one_UAT_then_closeout
    budget: one_run_two_attempts_one_recovery_total_DeepSeek_cost_at_or_below_USD_2
    consequence: no_additional_routine_user_authorization_required_before_closeout

future_user_decisions_required: []
```

本 Contract 已由 Main Session选择、用户接受并冻结以下设计决定：

- automatic Recovery = `public_external` only；
- hidden acceptance 不进入 V0-C Recovery；
- no pre-start ghost child；
- Attempt-level 与 Run-level validation 分离；
- Stage 1 exact deterministic reserve；
- Stage 2 maximum envelope and child reserve；
- real route在 Stage 1 zero-call readiness 中完成；
- Candidate freeze 后进行一次 focused independent audit。

技术 Scope、Gates、Pause Conditions 和 Claims 未改变。剩余执行权限仅覆盖
已冻结的 V0-C 路径，不覆盖第二个 Run、源码临场修复、Pi 修改、依赖安装、
V1/V2/V3 或其他范围扩张。

---

## 29. Accepted Closeout Record

```yaml
accepted_disposition: PASS_V0_C_USER_ACCEPTANCE
accepted_by_main_session: 2026-07-31
accepted_under_user_continuous_closeout_authorization: 2026-07-31
implementation_baseline_commit: 12db75aaea4db4afb774046cfcc94de772a2e90b
workbench_tree_digest: a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446
first_uat:
  run_id: run-1d7829b0-338f-4555-b6ac-72d5d08b228d
  status: paused_pre_dispatch
  real_model_calls: 0
  cost_usd: 0
replacement_uat:
  run_id: run-c3297fc5-bfd1-4bd1-b46c-3a636271a177
  attempt_id: attempt-f6d6a9c6-d299-44d5-9283-a71d48f37288
  outcome: passed
  terminal_reason: verifier_passed
  inspector: committed_integrity_valid
  real_model_calls: 5
  tool_calls: 8
  tokens: 16625
  cost_usd: 0.0012407808000000002
  recovery_observed: false
closeout: docs/reports/V0_C_CLOSEOUT.md
```

第一次 UAT 的 pre-dispatch composition defect 与修正后的 replacement UAT
都作为历史证据保留。replacement Run 的初始 Verifier 通过，因此只证明
`stop_passed` 真实路径；真实失败后的 same-Session Recovery 和 Completion
Policy effectiveness 继续是明确未验证项，不得扩大解释。

---

## 30. Final Stop Point

```yaml
contract_status: closed_accepted
contract_accepted: true
active_goal: false
implementation_started: true
implementation_completed: true
implementation_baseline_commit: 12db75aaea4db4afb774046cfcc94de772a2e90b
stage_2_initial_authorized_runs: 1_consumed_paused_pre_dispatch
stage_2_replacement_authorized_runs: 1_consumed_completed_passed
stage_2_real_model_calls_authorized: 0_additional
stage_2_credential_access_authorized: false_after_closeout
stage_2_external_network_authorized: false_after_closeout
stage_2_cost_cap_usd: 2
stage_2_actual_cost_usd: 0.0012407808000000002
git_commit_authorized: consumed_by_resulting_HEAD_of_this_revision
next_owner: main_session_for_V1_planning_only_after_explicit_user_authorization
```

V0-C 已关闭。任何额外 V0-C Run、模型调用、凭据或网络使用、源码返修、Pi
修改或证据回填均未获授权。V1 只是下一版本候选，不得由本 Contract 自动创建、
激活或实现。
