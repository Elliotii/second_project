# V1-C Goal Contract — Bounded Budget-stop Correction and Comparison Completion

```yaml
status: accepted_activated_stage_1_not_started
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
version: V1
project: Agent Harness Reliability Workbench
prepared_at: 2026-08-05
prepared_by: main_session
derived_from: docs/reports/V1_C_PRECONTRACT_RESEARCH.md
accepted_by_user: 2026-08-05
contract_accepted: true
activation_authorized_by_user: 2026-08-05
active_goal: true
implementation_authorized: true_zero_real_call_stage_1_only
implementation_owner: dedicated_v1_c_stage_1_implementation_session
implementation_started: false
control_baseline_commit_authorized: consumed_by_resulting_HEAD_of_this_revision
control_baseline_commit: resulting_HEAD_of_this_revision
stage_1_real_model_calls_authorized: 0
stage_1_real_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
main_session_control_baseline_commit_authorized: consumed_by_resulting_HEAD_of_this_revision
dedicated_session_git_commit_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
dependency_install_authorized: false
external_download_authorized: false
v2_authorized: false
```

> 本文件是用户已经接受并激活的 V1-C 正式 Goal Contract。当前只授权 dedicated Stage 1 Session
> 执行 Contract allowlist 内的零真实调用实现和验证；不授权 Credential 读取、网络访问、真实
> Provider/模型调用或 dedicated-session Git Commit。Contract 接受、Goal
> Activation、Control Baseline、Candidate Commit、Audit、Execution Baseline、Canary 和完整
> Pilot 是彼此独立的控制点。

## 1. Goal Mission

V1-C 只处理一个已经由零真实调用确定性复现的 Workbench 边界问题，并在修复通过独立审计后，
有条件地补完 V1 的 A/B/C 比较：

1. 修复“Provider 请求上限在下一次请求派发前触发后，Pi 合成失败消息被误当成真实 Provider
   响应”的归因错误；
2. 保持真实 Provider 用量未知时的 fail-closed 计费和暂停语义；
3. 让本地有界 Stop 在不修改 Pi Core 的情况下完成 Pi 的失败事件序列并到达 `settled`；
4. 在 `settled` 后仍由三条 arm 共用的外部 Verifier 形成正式 Outcome；
5. 对冻结 Candidate 做 focused independent audit；
6. 以全新 Experiment identity 运行一个真实 Canary；
7. 只有 Canary 有效，才以另一个全新、不可变的 Pilot identity 重跑完整 A/B/C 描述性比较。

V1-C 不重开、不重写、不重新解释已经关闭的 V1-B。它是 V1 Charter §13.3 允许的、针对冻结
Candidate 缺陷和 infrastructure-dominated inconclusive 的一次独立有界补完。

## 2. Current Evidence Baseline

### 2.1 Accepted facts

- V1-A 已以 `PASS_V1_A_DETERMINISTIC_SUBSTRATE` 关闭并接受；其独立复审后的 Implementation
  Baseline 为 `784bd1ec06c2aa9ed554a7da661bdf582097bcdf`。
- V1-B 已以 `CLOSE_V1_B_INCONCLUSIVE_AUTHORIZED_SEQUENCE_EXHAUSTED` 关闭；不得追认其 Run
  为 terminal、valid 或 comparable。
- V1-B replacement cell 已记账 8 次真实 Provider/model request、10 次 Tool call，且请求上限
  为 8；暂停证据没有 pending Provider reservation。
- replacement workspace 在 V1-B 关闭后的只读检查中通过 public test 和冻结外部 Verifier；
  这不能回写历史 Outcome。
- 零真实调用 Faux reproduction 已证明：下一次请求在派发前因 cap 被拒绝时，Pi 会生成 synthetic
  assistant failure message，而现有 Workbench 会把它误送入 `commitProvider()`，随后错误归类为
  `invalid_or_unknown_usage_after_provider_response`。
- 固定 Pi public `AgentHarness` 路线仍可满足本 Goal；没有 Pi Core patch 证据。

### 2.2 Bounded inference

V1-B replacement Run 很可能在完成第 8 次请求后尝试第 9 次请求，因 cap 被拒绝并进入上述已复现
的错误路径。由于历史证据没有保存原始内部错误文本，这仍是高可信推断，不得改写为历史事实。

### 2.3 Authority order

```text
pinned source / tests / actual command output
→ CURRENT_STATE / accepted Closeout / accepted ADR
→ accepted V1 Charter / formal V1-C Contract（接受后）
→ accepted V1-C Candidate and Execution Baselines（形成后）
→ specialist reports and design references
→ inference
```

## 3. Required Reading

所有 V1-C Session 必须按顺序完整读取：

```text
AGENTS.md
CURRENT_STATE.md
docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md
docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md
docs/第二项目_Codex交接包_2026-07-30/V1_C_GOAL_CONTRACT.md（正式化后）
docs/reports/V1_C_PRECONTRACT_RESEARCH.md
docs/reports/V1_B_CLOSEOUT.md
docs/reports/V1_CLOSEOUT.md
docs/第二项目_Codex交接包_2026-07-30/V1_B_PAUSE_RECOVERY_AMENDMENT.md
docs/decisions/ADR-0003-direct-agentharness-for-bounded-robustness.md
```

Stage 1 和 Audit 还必须阅读 Contract 指定的 Workbench source/tests。进入 `.upstream/pi` 前必须
完整读取适用的 Pi `AGENTS.md`，且只能进行只读核验。

`reference/cc-harness-knowledge/` 只提供成熟 Harness invariant，不证明 Pi 行为；
`reference/src/` 不是实现 Spec。Pi SDK、Extension 和可安装扩展保留为后续兼容/复用候选，不进入
V1-C Scope。

## 4. Binding Semantics

### 4.1 Provider response 与 Pi synthetic failure 必须分离

V1-C 必须使用显式、类型化的本地状态区分：

```text
before_provider_request 尝试 reservation
→ 本地请求上限拒绝，Provider 未派发
→ Workbench 先记录 typed local budget-stop signal
→ hook 抛出受控错误
→ Pi 生成 synthetic assistant failure message
→ Workbench 依据 typed stop + reservation state 识别它不是 Provider response
→ 不调用 commitProvider，不伪造 Provider usage
→ Pi 完成 agent_end / settled
→ 共用 External Verifier 运行
```

不得只凭 `stopReason`、消息文本或 Provider 名称推断归因。不得将 raw `errorMessage`、Provider raw
response、Credential 或内部异常栈写入 tracked 文档、Manifest、Journal、Outcome 或可提交证据。

### 4.2 保守分支

- 若 assistant failure 到达时仍有 pending Provider reservation，则不能把它视为零用量本地 Stop；
  必须保持 usage-unknown 的 fail-closed pause，并对最终 pending reservation 做保守全额计费。
- 若没有 pending reservation，也没有匹配的 typed local stop，则必须形成独立的 bounded runtime
  failure 诊断，不得冒充 Provider response 或 task Outcome。
- 只有与同一请求 ordinal、同一 Run、同一 reservation transition 绑定的 typed stop 才可消费。
- 同一 typed stop 只能消费一次；重复、乱序或跨 Run 复用必须被 Inspector 拒绝。

### 4.3 Completion 与 Outcome

- Pi synthetic failure message 是运行时诊断，不是正式 Outcome。
- 正式 Outcome 继续只由 frozen external Verifier 在 Pi `settled` 后生成。
- 如果 Verifier 通过，Run 可以是 task pass，同时另行记录 `budget_stop_reached` 诊断；不得把效率
  问题抹掉。
- 如果 Verifier 失败，A/B 形成正常 terminal task failure；C 只有在原有 recovery eligibility、
  child budget 和 lineage 规则全部成立时，才可执行一次既有有界恢复。
- Measurement Verifier 仍是 A/B/C 共用基础设施，不能变成 C-only treatment。

### 4.4 历史与版本边界

- V1-B 所有 Manifest、Run、Journal、Pause、Report 和 Closeout 保持不可变。
- 新语义必须通过 additive V1-C protocol/schema/identity 或明确版本分支生效；不得静默改变 V1-B
  历史 Inspector 结论。
- V1-B Run 不得混入 V1-C Canary 或 Pilot 分母。
- treatment-caused invalid 仍必须进入比较分母，不得以 replacement Run 消失。

## 5. Scope

### 5.1 Stage 1 可修改范围

专用 V1-C Stage 1 Implementation Session 仅可在必要时修改：

```text
workbench/src/contracts/v1-types.ts
workbench/src/pi/pi-run-handle-v1.ts
workbench/src/run-v1.ts
workbench/src/inspect-v1.ts
workbench/src/pilot-v1.ts
workbench/src/product-surface-v1.ts
workbench/src/experiment/v1.ts
workbench/tests/v1c-budget-stop.test.ts（可新建）
workbench/tests/v1b-stage1.test.ts
workbench/tests/v1b-cli.test.ts
fixtures/manifests/v1/v1c-*.json（仅确定性 template / fixture）
docs/reports/V1_C_STAGE1_IMPLEMENTATION_REPORT.md
docs/reports/V1_C_STAGE1_CLOSEOUT_DRAFT.md
```

修改必须是为满足 Gates 所需的最小 additive delta。若某个列出的文件不必修改，应保持不变。

### 5.2 Protected inputs

不得修改：

- `.upstream/pi/`；
- V1-A / V1-B 已接受 Contract、Manifest、task、Verifier、Skill、System Prompt 和历史 evidence；
- `CURRENT_STATE.md`、本 Contract、治理规则和已接受 ADR；
- `.env`、Credential 和 Provider secrets；
- `package.json`、lockfile、依赖版本或 generated package boundary；
- `reference/`；
- V0 accepted evidence。

Implementation Session 不得生成最终真实 Canary/Pilot identity，不得 stage 或 commit。最终 Manifest
与 Baseline 只由 Main Session 在独立授权点生成、核验和提交。

### 5.3 Non-goals

V1-C 不包括：

- Pi Core patch、private import、RPC、SDK 或 Extension 集成；
- 提高模型能力、改 Prompt、改 Skill、改 task 或改 Verifier；
- 自适应改变请求上限；
- 自动 retry、fallback、replacement 或同 Run 重试；
- V2 多路径恢复、跨进程 resume、通用 durability、Router 或 Experience Repository；
- Dashboard、Web UI、数据库、Sandbox 或新的 Provider abstraction；
- 统计显著性或通用 Policy 优越性声明。

## 6. Session Responsibilities

### 6.1 Main Session

Main Session 独占：

- Contract 正式化、Activation 和控制状态；
- Control Baseline、Candidate Commit、Execution Baseline 和 Closeout Commit；
- 实现轻量审查、审计结论处置、Canary 验收和完整 Pilot 验收；
- `CURRENT_STATE.md`、Contract 和治理文件更新；
- 是否继续、返修、暂停或关闭 V1-C 的决定。

### 6.2 Dedicated Stage 1 Implementation Session

只执行零真实调用的确定性修复、测试、原始证据、Implementation Report、Closeout Draft 和结构化
`CURRENT_STATE_UPDATE_PROPOSAL`。不得修改或暂存控制状态，不得 commit，不得接受 Goal。

### 6.3 Fresh Focused Independent Audit Session

只审计冻结 Candidate 的 budget/stop、Provider attribution、terminalization、evidence、Inspector 和历史
边界；可以运行零调用 regression 并写 audit-local ignored evidence 与 Audit Report。不得修复源码、
修改控制状态、commit 或扩展为通用 Harness 审计。

### 6.4 Bounded Correction

若 Main Session 接受可修复 finding，只能交回原 Stage 1 Implementation Session 做有界返修。复审只
覆盖受影响 finding 和必要 regression，除非出现新的具体高风险证据。

### 6.5 Fresh Canary Execution Session

在审计通过、Main Session 创建新的 Execution Baseline 且用户单独授权后运行。它不得修改 source、
test、fixture、Manifest、Verifier、Skill、Prompt、control state、staging 或 commit。

### 6.6 Fresh Full Pilot Execution Session

只有 Main Session 接受 Canary 后才能启动。它以独立于 Canary 的全新 immutable identity 运行完整
Pilot；同样没有任何 source-edit 或 commit 权限。

## 7. Gates

### Gate A — Identity, authority and clean Control Baseline

- Contract 已正式接受且单独 Activation；
- Main Session 已更新 `CURRENT_STATE.md` 为 `active_goal: V1_C...`；
- Main Session 创建并记录干净 tracked Control Baseline Commit；
- 已登记的只读 untracked `reference/` 可以存在；
- Pi commit 精确为 `027a5847901b5dde30270abaa1041046cd2b4b55` 且 clean；
- Stage 1 的 Credential、网络、外部 Provider/模型调用均为 0。

失败即停止，不实现。

### Gate B — Zero-call defect reproduction

以 tracked deterministic test 复现：完成一次 Faux Provider response 后，下一次请求在派发前被 cap
拒绝；旧路径会误归因，修复后路径必须可观察且不依赖时间、网络或真实模型。

### Gate C — Typed attribution and accounting

证明：

- cap denial 发生在 Provider dispatch 前；
- typed local stop 与 Run/request ordinal/reservation transition 绑定且只能消费一次；
- synthetic failure 不增加 Provider request、token 或 cost；
- 真实 response 仍正常 commit；
- pending reservation 不会被错误清零；
- 重复、乱序、缺失或伪造 stop 触发 fail-closed。

### Gate D — Settled and common Verifier

证明本地 cap denial 不再由 Workbench subscriber 二次异常打断 Pi；Pi 到达 `settled`，随后与正常
Run 一样执行共同 External Verifier，并形成符合 §4.3 的 terminal Outcome。

### Gate E — Genuine unknown-usage pause

构造后续请求已经 reserve、但 usage 无法确定的 deterministic case。最终 pending reservation 必须
完整保留并保守收费；Run 必须是 nonterminal、noncomparable pause，且不得错误运行正式 Verifier。

### Gate F — Inspector and history boundary

Inspector 必须通过 V1-C 多请求 positive cases，并拒绝：

- request/tool/token/cost counter 篡改；
- pending reservation 丢失或错误结算；
- typed stop 的 Run/ordinal/phase 错配；
- `settled`、Verifier 和 Outcome 顺序错误；
- V1-B identity 冒充 V1-C；
- Canary 与完整 Pilot identity 混用。

既有 V1-B 历史 evidence 的关闭结论保持不变。

### Gate G — Treatment and fairness regression

证明 A/B/C 的初始 payload identity、公用 Measurement Verifier、B 无 runtime treatment、C 仅在有效
failed Verifier 后进入既有 recovery，以及 denominator 规则均未改变。

### Gate H — Stage 1 verification

最低要求：

- strict TypeScript 通过；
- focused V1-C tests 通过；
- Contract 指定的 V1-A/V1-B/V0-C 相关 regressions 通过；
- protected file digest 与 source delta 符合 allowlist；
- secrets scan 和零真实调用证明通过；
- Pi 两个已登记 checkout 均保持固定 commit 且 clean。

### Gate I — Stage 1 handoff

Implementation Session 交付完整报告、命令与 exit code、Evidence Index、Source Delta、未验证项、
Pause Condition 和 `CURRENT_STATE_UPDATE_PROPOSAL` 后停止。它不得自行接受、stage 或 commit。

### Gate J — Candidate Commit and focused audit

Main Session 轻量审查通过并获得单独授权后，创建 Candidate Commit；然后由 fresh focused Audit
Session 审计。任何 accepted high-risk finding 必须先有界返修并窄复审。

### Gate K — Audited Execution Baseline and new Canary identity

Audit 通过后，Main Session 获得单独授权，创建 audited Execution Baseline 和一个新的 Canary
Manifest。Manifest 必须固定 commit/tree/source digest、Pi、Provider/model、task、Skill、Prompt、
Verifier、Tool profile、budget、arm、order 和 secret/evidence boundary。

### Gate L — Official Provider checkpoint

真实调用前，只允许通过官方 DeepSeek API 文档做最小当前性核验：endpoint、model identifier、usage
字段和计费字段。若与 frozen adapter/Manifest 不一致，立即暂停，不在 Execution Session 修源码。

### Gate M — One-cell real Canary

建议的未来权限（本 Contract 当前不授予）：

```yaml
new_experiment_identity: required
task: parse-duration
arm: A_baseline
initial_runs: 1
request_cap: 8
tool_cap: 12
token_cap: 65536
wall_clock_cap_seconds: 300
cost_cap_usd: 0.10
retry: 0
fallback: 0
replacement: 0
source_edits: 0
```

Canary 合格条件：

- 可以正常 `settled`，或经 typed cap denial 后由 Pi 完整到达 `settled`；
- usage/cost 精确，且 reservation 状态一致；
- common Verifier 形成有效 pass 或 fail Outcome；
- Inspector 判定 terminal、integrity valid、comparable；
- 没有 retry、fallback、replacement、source delta 或 secret 泄漏。

若出现 genuine usage unknown、证据不一致、非 terminal、不可比较或成本未知，Canary 不通过，完整
Pilot 不得开始。

### Gate N — Canary main review

Canary Session 提交 Evidence Index、执行报告和结构化状态更新建议后停止。Main Session 独立复核
Manifest、Ledger、Journal、Session、Verifier、Outcome、Inspector、usage/cost 和 protected digest。

### Gate O — New full-Pilot identity and baseline

只有 Canary 被 Main Session 和用户接受后，才可另行授权新的完整 Pilot Manifest 与 Execution
Baseline。Canary Run 不得计入完整 Pilot。

### Gate P — Frozen 24-cell descriptive Pilot

沿用 V1 Charter 的冻结比较设计：

```yaml
tasks: 4
repetitions_per_task: 2
arms: [A_baseline, B_skill_only, C_skill_plus_runtime_control]
initial_runs: 24
max_child_attempts: 8
execution: one_cell_at_a_time
same_run_retry: 0
fallback: 0
replacement: 0
request_cap_per_initial_attempt: 8
```

除非在观察任何新 Pilot outcome 之前通过正式 Contract Amendment 重新冻结，否则 task、order、arm、
Prompt、Skill、Verifier、Tool、Provider/model 和 attempt budgets 不得改变。

### Gate Q — Aggregate and closeout

生成固定口径的 24-cell 描述性 aggregate，报告：

- A/B/C initial pass/fail/invalid；
- C-initial 与 C-final checkpoint；
- Recovery 触发、成功和预算；
- treatment-caused invalid denominator；
- request/tool/token/cost 和 stop diagnostics；
- observed failure、scope deviation 和未验证项；
- `Promote`、`Revise`、`Reject` 或 `Inconclusive` 的证据受限建议。

不得作统计显著性、跨模型推广或 Skill/Runtime 普遍优越性声明。

## 8. Real-call and Cost Authority

本 Contract 的当前真实权限为 0。未来必须单独授权，并建议冻结为：

```yaml
v1_c_total_real_sequence_hard_cap_usd: 2.00
canary_hard_cap_usd: 0.10
full_pilot_remaining_hard_cap_usd: 1.90
unknown_usage_policy: fail_closed_full_reservation_charge
automatic_budget_increase: forbidden
```

V1-B 历史保守 debit 单独报告，不从 V1-C 新 identity 中伪造实际账单，也不改变 V1-C hard cap。
任何 unknown cost、预算超限或官方 usage/计费字段变化都触发暂停。

## 9. Deliverables

### Stage 1

- `docs/reports/V1_C_STAGE1_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V1_C_STAGE1_CLOSEOUT_DRAFT.md`；
- focused deterministic evidence index；
- exact commands and exit codes；
- source delta and protected digest；
- budget/stop/settled/verifier trace matrix；
- structured `CURRENT_STATE_UPDATE_PROPOSAL`。

### Focused Audit

- `docs/reports/V1_C_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`；
- finding severity、evidence、required regression 和 disposition。

### Canary

- immutable Canary Manifest and identity；
- `docs/reports/V1_C_CANARY_EXECUTION_REPORT.md`；
- Canary Evidence Index；
- exact usage/cost and Inspector result；
- structured `CURRENT_STATE_UPDATE_PROPOSAL`。

### Full Pilot and Goal closeout

- immutable full Pilot Manifest and identity；
- `docs/reports/V1_C_PILOT_EXECUTION_REPORT.md`；
- `docs/reports/V1_C_AGGREGATE_REPORT.md`；
- `docs/reports/V1_C_CLOSEOUT_DRAFT.md`；
- complete Evidence Index and exact commands/exit codes；
- structured `CURRENT_STATE_UPDATE_PROPOSAL`。

Dedicated Sessions 不得直接修改 `CURRENT_STATE.md` 或正式 Contract。

## 10. Definition of Done

V1-C 只有在以下全部满足时才可按完成处置：

1. V1-C Contract 已接受、单独激活并绑定干净 Control Baseline；
2. 零调用 test 稳定复现旧误归因并证明新路径；
3. pre-dispatch cap denial 与 Provider response 被类型化分离；
4. local stop 不增加 Provider usage/cost；
5. genuine unknown usage 保留最终 pending reservation 并保守收费；
6. typed stop 的 identity、ordinal、phase 和 single-consumption 可审计；
7. Pi 在 local cap stop 后完整到达 `settled`；
8. common Verifier 在 `settled` 后运行；
9. Verifier Outcome 与 runtime diagnostic 分离；
10. A/B terminal semantics 和 C recovery eligibility 保持原义；
11. V1-C Inspector positive/tamper tests 通过；
12. V1-B 历史 evidence 和关闭结论未改变；
13. strict TypeScript 和必要 V0/V1 regressions 通过；
14. Pi 无 patch、无 private import、固定且 clean；
15. secrets、raw response 和 raw internal error 未进入 tracked evidence；
16. focused independent audit 通过，或 accepted findings 已返修并窄复审通过；
17. 新 identity Canary 合格；
18. 完整 Pilot 使用另一个新 identity 且没有混入 Canary/V1-B Run；
19. 24 个 initial cells 全部按冻结 order 执行或按 Contract 规则形成可审计 terminal/invalid 记录；
20. 没有 retry、fallback、replacement 或静默丢弃 denominator；
21. 真实序列总保守成本不超过 USD 2.00；
22. aggregate 明确区分 A/B/C、C-initial/C-final、Recovery 和 invalid；
23. 所有 Run 可由 Manifest、Ledger、Journal、Pi Session、Verifier 和 Outcome 关联；
24. 所有 Session 交付规定报告、证据、source delta 和状态更新建议；
25. Main Session 与用户完成最终验收、控制状态收口和 Implementation Baseline Commit。

如果 Canary 按规则暂停，Goal 可以被真实地关闭为 `inconclusive_not_completed`，但不能声称满足上述
完整 DoD，也不能启动完整 Pilot。

## 11. Pause Conditions

任何 Session 遇到以下情况必须立即停止并提交 Pause Report：

- 需要修改 Pi Core、private import、SDK、RPC、Extension 或下载外部模块；
- 需要改变 Prompt、Skill、task、Verifier、Tool profile 或 Provider/model 才能通过；
- 无法证明 cap denial 发生在 Provider dispatch 前；
- 必须持久化 raw internal error/response/secret 才能归因；
- Pi 无法在受控 local stop 后安全达到 `settled`；
- Measurement Verifier 变成 C-only treatment；
- 必须重写 V1-B 历史 evidence 或结论；
- Inspector 与 Ledger/Journal/Outcome 对同一 Run 有冲突；
- Stage 1/Audit 触碰 Credential、网络或真实调用；
- Real Execution 发现 source defect、需要修源码或 Manifest 漂移；
- Provider usage/cost 未知，或任一 hard cap 可能超限；
- 需要 retry、fallback、replacement 或自动提高 budget 才能继续；
- 进入 V2、多路径恢复或通用平台建设；
- protected 文件、Pi 状态或 Baseline identity 发生未授权变化。

## 12. Claims

### 12.1 Stage 1 + Audit 后允许

- Workbench 的特定 pre-dispatch request-cap/synthetic-failure 归因缺陷已被确定性修复；
- 修复在固定 Pi public `AgentHarness` 路线上不需要 Pi Core patch；
- focused audit 覆盖了本 Contract 指定的高风险边界。

不得声称真实 Provider 路径已验证或 V1 比较已完成。

### 12.2 Canary 后允许

- 新 V1-C identity 下，一个真实 A-arm Run 的预算、终止、Verifier、Outcome 和 evidence 路径有效。

不得用单个 Canary 比较 Skill-only 与 Runtime Control，也不得把 Canary 纳入完整 Pilot。

### 12.3 Full Pilot 验收后允许

- 在固定 task、Prompt、Skill、Tool、Provider/model、budget 和 24-cell descriptive Pilot 下，观察到
  A/B/C 的具体结果、成本、invalid 和 Recovery 行为；
- 可以给出证据受限的 V1 Policy 建议。

不得声称统计显著、普遍最优、跨模型有效或 V2 已实现。

## 13. Formalization and Activation Sequence

唯一允许顺序：

```text
用户审查并接受正式 V1-C Goal Contract
→ Contract 正式化为 accepted_not_activated
→ 用户单独授权 V1-C Activation 与 Control Baseline Commit
→ Main Session 更新 CURRENT_STATE、Contract 和必要治理状态
→ Main Session 创建并核验 tracked-clean Control Baseline Commit
→ Main Session 记录精确 Commit SHA
→ Main Session 生成 Stage 1 专用 Session 启动 Prompt
→ fresh dedicated Stage 1 Session 从该 Commit 执行 Gate A
```

后续 Candidate、Audit、Execution Baseline、Credential/Network/Real Calls、Canary 和 Full Pilot 仍按
Gates 分别授权；前一 Gate 的权限不会自动流入后一 Gate。

## 14. User Decisions Required

```yaml
user_decisions_required:
  - decision: v1_c_goal_contract_acceptance
    status: consumed_accepted_2026_08_05
    evidence: docs/reports/V1_C_PRECONTRACT_RESEARCH.md
    outcome: accepted_not_activated
    consequence: scope_is_formal_but_execution_remains_unauthorized

  - decision: authorize_activation_and_control_baseline
    evidence: accepted_formal_v1_c_goal_contract
    options: [authorize_later, do_not_authorize]
    recommendation: authorize_only_after_contract_acceptance
    consequence: enables_zero_call_stage_1_only

  - decision: authorize_candidate_commit_and_focused_audit
    evidence: main_reviewed_stage_1_implementation_report
    options: [authorize, return_for_correction, close_incomplete]
    recommendation: decide_after_stage_1_evidence
    consequence: freezes_or_rejects_the_high_risk_candidate

  - decision: authorize_real_canary
    evidence: passed_focused_audit_and_audited_execution_baseline
    options: [authorize_up_to_usd_0_10, do_not_authorize]
    recommendation: decide_only_after_audit
    consequence: validates_one_new_identity_real_cell_but_not_arm_comparison

  - decision: authorize_full_pilot
    evidence: main_accepted_valid_canary
    options: [authorize_remaining_sequence_up_to_usd_1_90, stop_after_canary]
    recommendation: authorize_only_if_canary_is_terminal_integrity_valid_and_comparable
    consequence: permits_the_new_24_cell_A_B_C_descriptive_comparison
```

本 Contract 已由用户接受并激活。Main Session 已获 Control Baseline Commit 权限；dedicated
Stage 1 Session 仅获零真实调用实现权限。Candidate Commit、focused audit、Execution Baseline、
Credential、网络、真实 Canary、完整 Pilot 和所有真实调用仍未授权。
