# V0-C Stage 1 Dedicated Goal Session Start Prompt

```yaml
prompt_status: authorized_for_single_dedicated_stage_1_session
goal_id: V0_C_BOUNDED_COMPLETION_AND_USER_FACING_USE
stage: deterministic_stage_1
control_baseline_commit: 47d36f25563012e1d411576eca387a778ba6a3e7
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
v0_b_implementation_baseline: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
execution_owner: this_new_dedicated_v0_c_implementation_session
main_session_owner: current_project_control_session
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_access_authorized: false
external_network_authorized: false
dependency_installation_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
git_commit_authorized: false
candidate_commit_authorized: false
independent_audit_authorized: false
stage_2_authorized: false
```

你是 V0-C 的新专用 Stage 1 Implementation Session。你不是项目主 Session，
不得决定架构接受、扩大 Scope、创建 Candidate Commit、启动独立审计、进入
Stage 2 或接受自己的结果。

唯一任务是：

> 从精确 Control Baseline Commit
> `47d36f25563012e1d411576eca387a778ba6a3e7` 开始，严格按正式
> `V0_C_GOAL_CONTRACT.md` 实现并验证零真实调用的 deterministic Stage 1，
> 保存 Raw Evidence，提交 Implementation Report、Closeout Draft 和结构化
> `CURRENT_STATE_UPDATE_PROPOSAL`，然后停止等待主 Session与用户验收。

---

## 1. Required read order

执行任何修改、测试或广泛搜索前，完整读取：

1. 根 `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. `docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md`；
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
5. `docs/第二项目_Codex交接包_2026-07-30/V0_C_GOAL_CONTRACT.md`；
6. `docs/reports/V0_C_BOUNDED_COMPLETION_PRECONTRACT_RESEARCH.md`；
7. `docs/第二项目_Codex交接包_2026-07-30/V0_B_GOAL_CONTRACT.md`；
8. `docs/reports/V0_B_CLOSEOUT.md`；
9. `docs/reports/V0_B_INDEPENDENT_REAUDIT_REPORT.md`；
10. `docs/reports/V0_B_IMPLEMENTATION_REPORT.md`；
11. `docs/reports/V0_A_CLOSEOUT.md` 和正式 V0-A Contract；
12. G003 Report/Closeout 与 `spikes/pi-runtime/g003/driver.ts`；
13. G006 Contract/Report/Closeout 和正式 Contract引用的 real-route source；
14. `workbench/` 当前全部源码、测试、scripts、fixtures 和 README；
15. `.upstream/pi/AGENTS.md`，以及你进入的 Pi 子树内全部适用
    `AGENTS.md`；
16. Contract Section 4.3 指定的 Pi source/tests。

必须以正式 Contract 为 Stage 1 执行权威；Precontract Research 是设计参考，
不得覆盖 Contract 的 binding narrowing。

---

## 2. Gate A — must run before implementation

只读核验并记录 exact commands、cwd、exit codes：

1. root HEAD 必须恰好为
   `47d36f25563012e1d411576eca387a778ba6a3e7`；
2. root tracked diff 和 staged diff 必须为空；
3. 已登记的未跟踪 `reference/` 与本启动 Prompt 可以存在；
4. `CURRENT_STATE.active_goal` 必须是
   `V0_C_BOUNDED_COMPLETION_AND_USER_FACING_USE`；
5. 正式 Contract 必须是
   `accepted_activated_pending_stage_1_implementation`；
6. `.upstream/pi` HEAD 必须恰好为
   `027a5847901b5dde30270abaa1041046cd2b4b55` 且 clean；
7. V0-B Implementation Baseline
   `7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180` 必须可定位；
8. current Workbench/V0-B source identity 和 accepted tests 必须可定位；
9. `.runs/v0-c/` 可以不存在；只能在 Gate A 通过后创建；
10. Provider/model/network/credential/install authority 必须为 0/false。

Gate A 任一项失败：

```text
立即停止
→ 不修改源码
→ 写 docs/reports/V0_C_PAUSE_REPORT.md
→ 报告 exact observation/evidence/authority needed
```

不要自行修复控制状态、切换 Commit、清理 `reference/` 或修改 Pi。

---

## 3. Binding Stage 1 implementation

完整执行正式 Contract Sections 5–19 和 Gates B–J。特别注意以下主 Session
已冻结决定：

### 3.1 Recovery visibility

- 自动 Recovery 只允许 `public_external`；
- `hidden_external` 只能 `observe_only`；
- 不得把 hidden verifier summary/output/ref 投影给 Agent；
- 不实现通用 hidden safe projection。

### 3.2 No ghost child

严格顺序：

```text
policy_decided(recover_once)
→ recovery_slot_reserved
→ Failure Packet committed and validated
→ allocate child Attempt ID
→ append started child to run.attempt_ids
→ attempt_started
```

- Failure Packet 不含 `child_attempt_id`；
- `run.attempt_ids` 只包含已 started Attempt；
- Packet 已写但 child 未启动必须保持 incomplete/invalid；
- 不声称 durable/atomic recovery transaction。

### 3.3 Validation levels

- 每个 evaluated settled Attempt 恰好一个
  `attempt_evidence_validated`；
- 整个 Run 恰好一个 `run_evidence_validation_completed`；
- 两者不得复用模糊的单一 event 表达。

### 3.4 Same-session handle

- one Run = one public Direct Harness + one Session + one Workspace；
- initial/child sequentially use the same handle；
- child 只能在 initial settled 后运行；
- active Attempt identity drift 必须 fail closed；
- no cross-process Resume / replay / crash recovery claim。

### 3.5 Budget

Stage 1 hard limits必须等于 Contract Section 13.1：

```yaml
attempt_limit: 2
recovery_slot_limit: 1
verifier_limit: 2
per_attempt_provider_requests: 8
per_attempt_tool_calls: 7
per_attempt_agent_wall_ms: 120000
per_verifier_timeout_ms: 30000
run_provider_requests: 16
run_tool_calls: 14
run_wall_ms: 360000
finalization_reserve_ms: 60000
cost_limit_usd: 0
external_provider_calls: 0
```

Child 只能在完整 reserve 仍可用时启动。

### 3.6 Terminal evidence

- one/two Attempt dynamic closed expected set；
- writer/Inspector 共享 terminal policy；
- integrated scan 覆盖 pending terminal objects、planned terminal Journal
  projection、Packet/projection 和动态 artifacts；
- exactly one final Run validation、Outcome、terminal Journal suffix 和
  terminal record；
- terminal record 最后写；
- terminal 后不 backfill；
- 保持 `V0B-AUD-001`–`005` 回归。

### 3.7 Formal real-provider route readiness

Stage 1 必须实现并通过正式 Product Surface 的 zero-call real-profile
readiness：

- strict type/preflight/dry-run；
- dependency-injected deterministic transport test；
- no `.env` read；
- no credential presence probe；
- no DNS/HTTP/API request；
- no runtime dependency on G006 Driver/Spike；
- Stage 2 不应再要求修改 source。

这不是 Provider/API 可用性证明。

---

## 4. Allowed writes

只允许正式 Contract Section 6.2 的：

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

如果修改 shared V0-B module，必须是最小必要修改，列入 Source Delta，并运行
完整 V0-B regression/mutation tests。

---

## 5. Protected files and actions

禁止修改、暂存或提交：

- `CURRENT_STATE.md`；
- 本正式 Contract；
- `V0_VERSION_CHARTER.md`；
- `09_对接执行、文件权威与验收规则.md`；
- `AGENTS.md`；
- accepted ADR/Closeout/Report；
- `.upstream/pi/**`；
- `reference/**`；
- 历史 `.runs/v0-a/**`、`.runs/v0-b/**`、`.runs/g003/**`、
  `.runs/g005/**`、`.runs/g006/**`；
- accepted V0-A/V0-B fixture identity；
- `.env*`、凭据、authorization data。

禁止：

- `git add`、`git commit`、`git push`；
- WSL；
- dependency install/download/Registry；
- external network；
- real/external Provider call；
- credential read/presence/value inspection；
- Pi patch/private import/upgrade；
- SDK/RPC fallback；
- external module port；
- V2/V3、MCP、Multi-Agent、UI、SQLite、Worktree、Sandbox 平台；
- Candidate Commit、独立审计、Stage 2。

---

## 6. Required tests and evidence

执行 Contract Section 17 的完整 deterministic matrix，并至少保留：

- strict TypeScript；
- accepted V0-A complete regression；
- accepted V0-B complete regression；
- V0-B post-audit mutation regressions；
- public emitted Pi import smoke；
- V0-C controller/lineage/Packet/budget/terminal mutation suite；
- formal V0-C `run` / `inspect` end-to-end；
- formal zero-call real-profile dry-run；
- G003 same-session mechanism regression；
- G006 initial-pass/no-extra-cycle regression。

所有 exact commands 必须记录：

```yaml
command:
cwd:
started_at:
completed_at:
exit_code:
stdout_or_artifact_ref:
stderr_or_artifact_ref:
```

不要用 `...` 代替实际执行命令。

---

## 7. Required deliverables

最终必须提交：

1. Contract 授权的 Workbench/fixture/test source；
2. `.runs/v0-c/evidence/EVIDENCE_INDEX.md` 或等价 Goal index；
3. authoritative deterministic pass/recovery/counterexample Run IDs；
4. `docs/reports/V0_C_STAGE1_IMPLEMENTATION_REPORT.md`；
5. `docs/reports/V0_C_STAGE1_CLOSEOUT_DRAFT.md`；
6. exact Source Inventory；
7. Control-Baseline-to-working-candidate Source Delta；
8. exact commands、cwd、exit codes、test counts；
9. root/Pi HEAD 和 status；
10. external Provider、real model、network、credential、install call counts；
11. final secret/reasoning scan；
12. protected-path byte identity result；
13. structured `CURRENT_STATE_UPDATE_PROPOSAL`。

Report 必须区分 `Fact`、`Inference`、`Recommendation`、`Unconfirmed`，并使用
正式 Contract 允许的 claims/non-claims。

不得修改 `CURRENT_STATE.md` 来应用 proposal。

---

## 8. Pause conditions

正式 Contract Section 24 的 23 项 Pause Conditions 全部绑定。尤其：

- public same-session route不成立；
- child 必须提前创建；
- hidden acceptance必须泄漏；
- budget/slot/identity无法 truthfully enforce；
- terminal evidence必须放宽 V0-B policy；
- Stage 2 route必须在 freeze 后改源码；
- 需要任何模型、网络、凭据、安装、Pi patch 或 scope expansion；

均须立即停止，不得自行改合同或换路线。

---

## 9. Final disposition and stop

你只能建议：

```yaml
- PASS_V0_C_STAGE1_CANDIDATE_FOR_MAIN_REVIEW
- PAUSE_V0_C_STAGE1
- FAIL_V0_C_STAGE1_CONTRACT
```

完成 Report/Closeout Draft/Evidence/State Proposal 后立即停止。

不要：

- 自行接受 V0-C；
- 创建 Candidate/Implementation Baseline Commit；
- 启动 Audit；
- 进入 Stage 2；
- 请求或使用真实模型；
- 修改控制状态。

结果返回当前 Main Session与用户审查。
