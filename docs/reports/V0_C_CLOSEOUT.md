# V0-C Closeout — Bounded Completion and User-facing Use

```yaml
goal_id: V0_C_BOUNDED_COMPLETION_AND_USER_FACING_USE
status: closed_accepted
date: 2026-07-31
disposition: PASS_V0_C_USER_ACCEPTANCE
v0_disposition: V0_CLOSED_ACCEPTED
control_baseline_commit: 47d36f25563012e1d411576eca387a778ba6a3e7
failed_audit_candidate_commit: 930c549b402fce9ffa96847a673ad187c64f6094
corrected_candidate_commit: 861b7241e8abf8608fc981a68bae39037f598f5d
implementation_baseline_commit: 12db75aaea4db4afb774046cfcc94de772a2e90b
workbench_tree_digest: a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
authoritative_run_id: run-c3297fc5-bfd1-4bd1-b46c-3a636271a177
real_model_calls: 5
token_usage: 16625
cost_usage_usd: 0.0012407808000000002
recovery_observed: false
pi_core_patch_count: 0
```

## 1. Final disposition

主 Session在独立读取正式 UAT Report、Run terminal、Outcome、Evidence
Index、Verifier result、policy decision、secret scan 和正式 Inspector 输出后，
接受：

```text
PASS_V0_C_USER_ACCEPTANCE
```

V0-C 由此正式关闭。V0-A、V0-B、V0-C 三个 Goal 均已完成并接受，V0
作为最小可用 Coding Agent Workbench 基础版本正式收口。

这一结论只表示：

- Completion Controller、一次有界 same-Session Recovery 机制和预算/停止边界
  已在确定性路径中实现并验证；
- 冻结的真实 Coding Task 已通过正式 Product Surface 完成；
- Run、Attempt、Session、Workspace、Verifier、Outcome、Evidence 和 terminal
  可以形成可检查的端到端链路；
- Direct `pi-agent-core` `AgentHarness` 路径在 V0 范围内继续成立，Pi Core
  patch 为 0。

它不表示 Completion Policy 已经在统计意义上提升真实 Coding 成功率，也不表示
本次真实 Run 观察到了失败后的 Recovery。

## 2. Accepted implementation identity

| Boundary | Accepted identity |
| --- | --- |
| V0-C Control Baseline | `47d36f25563012e1d411576eca387a778ba6a3e7` |
| First audited Candidate | `930c549b402fce9ffa96847a673ad187c64f6094` |
| Corrected Candidate | `861b7241e8abf8608fc981a68bae39037f598f5d` |
| Implementation Baseline | `12db75aaea4db4afb774046cfcc94de772a2e90b` |
| Workbench digest | `a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446` |
| Pi | `027a5847901b5dde30270abaa1041046cd2b4b55` |

第一次 focused audit 发现两项 P2 问题。原 Implementation Session 完成有界
返修，新的 Candidate 经同一独立审计 Session focused re-audit 后得到：

```text
PASS_FOCUSED_V0_C_REAUDIT
```

复审后无未解决 finding。主 Session随后创建并核验精确 Implementation
Baseline，Stage 2 只在该冻结基线上执行。

## 3. Stage 1 and audit result

最终接受的确定性 Stage 1 证明：

- `observe_only` 和 `verify_recover_once_same_session` 两种策略均可表达；
- valid initial failure 可在所有 eligibility 与 budget gate 通过后创建唯一 child
  Attempt；
- Recovery slot 至多消费一次，不创建未启动的 ghost child；
- invalid evidence、invalid Verifier、infrastructure、cancel 和 budget 路径
  fail closed；
- 每个 settled Attempt 对应一次 Attempt-level Verifier/validation；
- 一个 Run 只产生一次 final validation、Outcome 和 terminal commit；
- 动态 Evidence Index、Inspector、secret scan 和 reasoning-safe Session
  覆盖一或两个 Attempt；
- Stage 1 的真实模型、外部 Provider和凭据访问均为 0。

最终复审使用的窄回归、V0-B 回归、完整 Workbench 测试和 strict TypeScript
均通过。原始运行证据、返修历史和审计报告被保留，没有改写失败历史。

## 4. Stage 2 history

### 4.1 首次 UAT：在 HTTP 前正确暂停

首次 fresh UAT 创建了：

```text
run-1d7829b0-338f-4555-b6ac-72d5d08b228d
```

UAT-local composition 沿用了旧 G006 三工具断言，错误拒绝了 V0-C 已冻结的六工具
Profile。失败发生在 HTTP dispatch 前：

- 外部 Provider调用：0；
- 真实模型调用：0；
- Tool 调用：0；
- Verifier：0；
- token / cost：0；
- Recovery：0；
- Outcome / terminal：未创建。

该 Session遵守 Pause Condition，没有自动执行第二个 Run。原 Run 和 UAT 工件
完整保留并标记为 pre-dispatch composition failure；它不构成 Workbench
Completion 机制失败。

### 4.2 零调用 composition 修正

原 UAT Session只修正 UAT-local composition，不修改 Workbench、fixture、Pi
或控制状态。修正后的 composition：

```yaml
sha256: e543fce7d648fdfc4fcd1b91e7a21c8799a83662e86e850001d5a8741d4fb906
tool_profile:
  - workspace_read
  - workspace_list
  - workspace_search
  - workspace_edit
  - workspace_write
  - run_command
```

主 Session独立复跑 strict TypeScript 和零调用 validator，确认 Product Run、
Run identity、credential、network、Provider和 model call 计数均为 0。

### 4.3 单独授权的 replacement UAT

新的 fresh UAT Session对冻结 replacement composition 只调用了一次正式产品
运行：

```yaml
run_id: run-c3297fc5-bfd1-4bd1-b46c-3a636271a177
attempt_id: attempt-f6d6a9c6-d299-44d5-9283-a71d48f37288
session_id: session-0cd59a8b-5b9a-4665-8444-88e52470ffaf
workspace_id: workspace-8c1e52a0-0d13-4f45-82ec-f6c26e3fdfad
attempt_count: 1
initial_verifier: passed
policy_decision: stop_passed
outcome: passed
terminal_reason: verifier_passed
recovery_slots_consumed: 0
```

正式 Inspector 返回 exit 0：

```yaml
committed: true
integrity_valid: true
indexed_artifacts: 27
errors: []
```

## 5. Usage and budget

| Usage | Observed | Frozen cap |
| --- | ---: | ---: |
| Provider requests/responses | 5 / 5 | 16 requests |
| Tool calls/results | 8 / 8 | 24 |
| Tokens | 16,625 | 131,072 |
| Cost USD | 0.0012407808 | 2 |
| Attempt wall time | 33,408 ms | 300,000 ms |
| Run wall time | 33,455 ms | 900,000 ms |
| Verifier runs | 1 | 2 |
| Attempts | 1 | 2 |
| Recovery slots | 0 | 1 |

调用外壳在约 5 秒时返回 timeout/124，但同一个已启动 Node 进程继续运行并自然
完成。UAT Session没有再次调用命令。由于调用者超时后无法取得 detached child
的数值 OS exit code，该 exit code 保持 `Unconfirmed`；产品完成则由 write-once
success summary、已提交 terminal 和正式 Inspector 共同证明。

## 6. Evidence, source and security boundaries

最终证据确认：

- Journal 有 54 个事件，唯一终止后缀为 `outcome_created`、`run_terminal`；
- Attempt validation 与 Run validation 均有效；
- `terminal.json` 绑定 Outcome 和 Evidence Index digest；
- integrated preterminal secret scan 覆盖 16 个文件和 10 个内存对象，0 命中；
- post-report scan 覆盖 40 个文件，credential、Bearer/secret pattern 和持久化
  reasoning 字段均为 0 命中；
- 4 个 reasoning block、8,080 字符 / 8,154 UTF-8 bytes 和 4 个 signature
  只以计数形式记录，原始 reasoning 未持久化；
- Workbench、fixture、Pi、首次失败 Run 与旧 UAT 工件身份保持不变；
- 受保护 Workspace 文件保持不变，唯一任务改动位于授权的
  `src/parse-duration.ts`；
- Pi Core patch、private import、dependency install 和 UAT source edit 均为
  0。

Stage 2 的真实 provider composition 通过 Contract 允许的外部 execution
dependency seam 注入；UAT-local composition 位于忽略的 `.runs/` 中，不是新的
产品源代码或通用 provider registry。

## 7. Gate and Definition of Done closeout

```yaml
gates:
  A_control_and_source_identity: passed
  B_contracts_and_completion_controller: passed
  C_attempt_lineage_and_recovery_slot: passed
  D_verifier_and_validation_cardinality: passed
  E_budget_stop_and_failure_packet: passed
  F_evidence_secret_and_inspector: passed
  G_zero_call_real_route_readiness: passed
  focused_independent_reaudit: passed
  stage_2_replacement_user_acceptance: passed

definition_of_done:
  passed: 10
  failed: 0
  total: 10
```

Stage 2 的首次 pre-dispatch Pause 和随后单独授权 replacement 均被保留。最终
accepted UAT Session内恰好执行一个 Product Surface Run，没有自动第二个 Run。

## 8. Claims allowed

可以声称：

- V0 是可实际运行真实 Coding Task 的最小 Agent Harness Reliability
  Workbench；
- Workbench 可控制 Workspace、驱动固定 Pi `AgentHarness`、关联
  Run/Attempt/Session/Workspace，运行外部确定性 Verifier，并生成可检查的
  Outcome、Journal、Evidence Index 和 terminal；
- Workbench 有一个已确定性验证的一次有界 same-Session Recovery 机制；
- 一次冻结的真实 DeepSeek Coding Task 通过正式 Product Surface 成功完成；
- V0 在不修改 Pi Core 的情况下完成。

## 9. Claims not allowed

不得声称：

- Completion Verification 已提高真实模型任务成功率；
- 真实失败后的 Recovery 已在本次 UAT 中发生或成功；
- 单次成功可代表统计可靠性、泛化能力或 Policy promotion；
- V0 已解决跨进程 resume、in-flight crash recovery、side-effect
  exactly-once、通用 sandbox/DLP、长任务 cancellation 或通用 provider
  compatibility；
- V1 Skill-only、V2 多路径恢复、V3 Experience 或后续版本已经实现。

## 10. Remaining unverified

```yaml
remaining_unverified:
  - real_failure_followed_by_successful_same_session_recovery
  - completion_policy_effectiveness
  - repeated_trial_statistics_and_fair_comparison
  - skill_only_baseline
  - skill_plus_runtime_comparison
  - cross_process_session_reconstruction
  - crash_after_side_effect_reconciliation
  - long_running_tool_cancellation
  - multi_path_recovery
  - experience_reuse_and_routing
```

这些项目不会因为“未验证”自动成为新 Goal 或 Gate。下一版本首先按已接受路线
规划 V1 的 Baseline / Skill-only / Skill + External Verifier 对照；任何 Contract、
真实调用或实现仍需用户另行授权。

## 11. Final control state

```yaml
active_goal: null
V0_A: closed_accepted
V0_B: closed_accepted
V0_C: closed_accepted
V0: closed_accepted
next_version: V1_candidate_not_authorized
additional_V0_C_runs_authorized: false
additional_real_model_calls_authorized: false
V1_contract_created: false
V1_activation_authorized: false
V1_implementation_authorized: false
```

## 12. Evidence index

- `docs/reports/V0_C_IMPLEMENTATION_REPORT.md`
- `docs/reports/V0_C_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`
- `docs/reports/V0_C_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md`
- `docs/reports/V0_C_STAGE2_UAT_PAUSE_REPORT.md`
- `docs/reports/V0_C_STAGE2_UAT_COMPOSITION_CORRECTION_REPORT.md`
- `docs/reports/V0_C_STAGE2_REPLACEMENT_USER_ACCEPTANCE_REPORT.md`
- `.runs/v0-c/runs/run-c3297fc5-bfd1-4bd1-b46c-3a636271a177/`

`.runs/` 继续作为忽略的生成证据目录，不进入 Git。

## 13. Exact final verification commands

```text
.runs/v0-a/pi/node_modules/.bin/tsc.cmd -p workbench/tsconfig.json
node --test workbench/tests/v0c-post-audit-correction.test.ts
node workbench/src/cli.ts inspect --run run-c3297fc5-bfd1-4bd1-b46c-3a636271a177
git status --short
git -C .upstream/pi rev-parse HEAD
git -C .upstream/pi status --short
```

最终 Git commit 由主 Session按用户预授权创建；专用 Implementation、Audit 和
UAT Session均未获得 commit 权限。
