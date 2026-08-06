# V2-B Goal Contract — Thin Real Composition and Frozen Bounded Real Recovery Acceptance

```yaml
status: active_stage_1_authorized_not_started
goal_id: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
version: V2
drafted_at: 2026-08-07
accepted_at: 2026-08-07
accepted_by_user: true
contract_accepted: true
active_goal: true
activated_at: 2026-08-07
activation_authorized: true
control_baseline_commit_authorized: consumed_by_resulting_HEAD_of_this_revision
control_baseline_commit: resulting_HEAD_of_this_revision
stage_1_implementation_authorized: true
stage_1_real_model_calls_authorized: 0
stage_1_credential_reads_authorized: 0
stage_1_network_authorized: false
stage_1_external_provider_calls_authorized: 0
stage_1_owner: new_top_level_v2_b_composition_implementation_session_to_be_created_after_baseline
stage_2_execution_authorized: false
stage_2_execution_conditionally_preauthorized: true_after_stage_1_main_acceptance_and_frozen_execution_baseline
stage_2_credential_reads_authorized: 0
stage_2_credential_reads_conditionally_preauthorized: opaque_contract_bounded_after_Gate_H
stage_2_network_authorized: false
stage_2_network_conditionally_preauthorized: true_after_Gate_H
stage_2_real_model_calls_authorized: 0
stage_2_real_model_calls_conditionally_preauthorized: contract_budget_after_Gate_H
stage_2_owner: future_new_top_level_v2_b_real_execution_session
subagent_execution_authorized: false
specialist_session_form: new_top_level_codex_sessions_only
candidate_execution_baseline_commit_conditionally_preauthorized: true_after_stage_1_main_acceptance
bounded_stage_1_correction_preauthorized: true_within_allowlist_and_no_architecture_scope_semantic_identity_change
focused_audit_conditionally_preauthorized: one_new_top_level_session_on_concrete_high_risk_finding
main_goal_mode_authorized: true_through_stage_2_evidence_and_main_disposition_recommendation
git_commit_authorized: control_and_candidate_execution_baselines_only
pi_core_patch_authorized: false
private_pi_import_authorized: false
sdk_extension_rpc_route_switch_authorized: false
external_download_or_dependency_install_authorized: false
final_v2_b_acceptance_authorized: false
final_v2_acceptance_authorized: false
v3_authorized: false
```

> 本文件已由用户激活 V2-B 的 Stage 1。当前只允许 Main 创建 Control Baseline、开启绑定
> Version Question 的 Goal，并创建一个新的顶层零真实访问 Stage 1 Session。Stage 2 的
> Credential、网络和真实调用仅为条件预授权，在 Stage 1 验收、冻结 Execution Baseline 和
> Gate H 之前均不生效。

## 1. Goal Mission

V2-B 要回答 V2 Version Question 的真实执行部分：

> 在一个真实 Coding Task 的初始 Attempt settled 且 common external Verifier 给出有效失败后，
> Workbench 能否冻结不可变 Recovery Seed，从完全相同的失败 Workspace bytes 创建两条隔离路径，
> 分别以保留父 Session history 和 fresh Session 运行真实模型，独立验证结果，并只选择通过全部
> hard gates 的 Candidate 或明确选择 none？当初始 Attempt 已通过时，能否不创建恢复分支？

V2-B 同时补上 accepted V2-A deterministic substrate 与真实 Provider 之间经本地源码证明缺失的
最小 composition seam。它不是新的 Provider 平台、Session 平台或 V3 自进化实现。

## 2. Why V2-B Has Two Stages

### 2.1 Current source fact

accepted V2-A 基线 `9ac6740155e763598180dcf80e8b735d967874ad` 中：

- `workbench/src/run-v2.ts` 内部创建 Faux Provider；
- `V2A_MODEL_ID` 固定为 `v2a-faux/faux-1`；
- Manifest 固定 `real_execution_authorized: false`；
- V2-A budget/evidence 固定真实调用和成本为 0；
- `executeRunV2A()` 没有真实 Provider、Credential resolver 或 real budget 输入。

V1 的 DeepSeek/opaque Credential/budget 路径已经真实使用，但其 handle 内部新建
`InMemorySessionStorage`，不能直接接管 V2-A 已审计的外部 `JsonlSessionRepo` fork/fresh Session。

### 2.2 Binding correction

因此 V2-B 保持一个 Goal，但分为：

```text
Stage 1 — zero-call thin real composition
→ Main light review and frozen Execution Baseline
→ Stage 2 — fresh no-source-edit frozen real acceptance
→ Main/user V2 decision
```

不得以 `.runs` 外部 wrapper、monkey patch、复制第二套 V2 Controller、SDK/Extension 切换或绕过
Manifest/Inspector 的方式伪造“零源码修改真实执行”。

## 3. Authority and Control Sequence

唯一允许的顺序：

```text
用户接受正式 V2-B Contract
→ Contract 正式化，但 active_goal 仍为 null
→ 用户单独授权 Stage 1 Activation + Control Baseline Commit
→ Main 更新 CURRENT_STATE、Contract 和必要治理文件
→ Main 创建并核验干净 Control Baseline Commit
→ Main 记录精确 SHA 并生成 Stage 1 Prompt
→ Main 创建新的顶层 V2-B Stage 1 Codex Session
→ Stage 1 零真实调用实现并提交 Report/Closeout Draft/State Proposal
→ Main 轻量验收
→ 用户授权 Candidate/Execution Baseline Commit
→ Main 创建并核验冻结 Execution Baseline
→ 用户单独授权 Stage 2 Credential、网络、真实调用和最终预算
→ Main 生成固定 SHA/Manifest 的 Stage 2 Prompt
→ Main 创建另一个新的顶层 V2-B Stage 2 Codex Session
→ Stage 2 先做零访问 preflight，再执行冻结 Case
→ Main 验收 Evidence 与 Version Question
→ 用户决定 V2-B/V2 是否正式接受
```

Contract 接受不等于 Activation；Stage 1 权限不向 Stage 2 自动传递，Stage 2 权限也不向 Stage 1
倒流。任何 Git Commit 均由 Main 在用户明确授权后创建。

## 4. Binding Inputs and Read Order

所有未来 V2-B Session 必须完整读取：

1. `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. `docs/第二项目_Codex交接包_2026-07-30/V2_VERSION_CHARTER.md`；
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
5. 正式化后的 `V2_B_GOAL_CONTRACT.md`；
6. `docs/reports/V2_A_CLOSEOUT.md`；
7. `docs/reports/V2_A_GATE_J_MAIN_SYNTHESIS_AND_FINAL_ACCEPTANCE_RECOMMENDATION.md`；
8. `docs/reports/V1_C_R2_MAIN_ACCEPTANCE_AND_V1_POLICY_DECISION.md`；
9. `docs/reports/V1_C_R2_PILOT_EXECUTION_REPORT.md`；
10. Contract 引用的 Workbench source/tests/fixtures；
11. 进入 `.upstream/pi` 前适用的全部 Pi `AGENTS.md`。

证据优先级继续为：固定本地源码/测试/命令、`CURRENT_STATE`/accepted Closeout/ADR、正式 Charter/
Contract、研究和参考资料、推断。

## 5. Fixed Evidence Baseline

```yaml
v2_a_implementation_baseline: 9ac6740155e763598180dcf80e8b735d967874ad
v2_a_final_candidate: de6d30c896079c6ae1164646ae55ead8e6a33c09
v2_a_disposition: PASS_V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
v2_a_workbench_source_digest: 10f85d0cd4195cb94ce269029a37bf2ed4ea70b5e0e42eb740e060726e1d08ce
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
runtime_route: direct_public_emitted_AgentHarness
session_route: public_JsonlSessionRepo_create_open_fork
workspace_provider: controlled_temporary_copy
skill: reliability_completion_v1
tool_profile: bounded_tools_v1
thinking_level: off
selector: accepted_v2_a_hard_gate_first_selector
```

V2-A 历史 evidence 继续绑定其原 source digest，不因 Stage 1 新基线而被重写。Stage 1 必须生成
新的 source identity 和 deterministic evidence，并证明 V2-A 回归保持；不得声称旧 evidence 是由
新源码生成。

## 6. Frozen Cases

### 6.1 Primary Positive Case

```yaml
task_id: v1-parse-duration
repetition: 1
initial_policy: accepted_skill_only_input
expected_behavior_class: valid_initial_failure_then_exactly_two_candidates
```

选择理由：V1 的两个真实失败都集中在 `parse-duration`，且其中一次 Skill-enabled initial failure
实际触发过 Recovery；但该任务并非必然失败，因此这里只作为触发候选，不承诺结果。

### 6.2 Contingency Positive Case

```yaml
task_id: v1-parse-duration
repetition: 2
activation_condition:
  - primary_positive_is_valid_initial_pass
  - primary_positive_stops_before_any_provider_dispatch_with_no_evidence_identity_loss
not_activated_when:
  - primary_positive_forms_a_valid_recovery_seed
  - both_primary_candidates_fail
  - primary_has_post_dispatch_invalid_or_unknown_usage
```

Contingency 必须在结果未知前进入 immutable Manifest。它不是 retry/replacement；Primary Evidence
永远保留并进入报告。Primary 一旦形成有效 Seed 并运行 A/B，无论选择 Candidate 或 none，都不得
为了得到更漂亮结果启动 Contingency。

### 6.3 Negative Case

```yaml
task_id: v1-stable-format
repetition: 1
expected_behavior_class: valid_initial_pass_no_recovery_objects_or_extra_calls
```

选择理由：`stable-format` 在 V1 两个 repetition 的 A/B/C 六个真实 Run 中全部通过。若它意外初始
失败，Controller 必须按产品规则处理并完整保留 Evidence，但该 Run 不能冒充 Negative Case；
V2 Version Question 因缺少有效 negative evidence 而 Pause，不临场替换任务。

### 6.4 Positive not triggered

若 Primary 和 Contingency 都形成有效 initial pass，V2-B 必须处置为
`PAUSE_V2_B_POSITIVE_NOT_TRIGGERED`。不得将两个 no-branch Run 当作 Positive 完成，也不得临场增加
第三个任务。

## 7. Candidate Fairness and Runtime Semantics

Positive Seed 下必须恰好运行：

- A `continue_failed_session`：从 parent JSONL Session fork，保留字节相同的父 entries；
- B `fresh_session_from_failure_seed`：新建 JSONL Session，运行前 entries 为 0。

A/B 必须共享：

- task/instruction/constraints；
- failed Workspace Seed bytes/digest；
- Failure Packet model-visible bytes；
- immediate recovery instruction bytes；
- Skill 与 System Prompt；
- Provider/Model/thinking level；
- Tool Profile；
- external Verifier；
- per-Attempt budget；
- Pi/Workbench/Manifest identity。

唯一主要处理差异是父 Session history。A/B 都必须运行并 terminal；不得在 A 通过后跳过 B。

## 8. Provider, Credential and Network Boundary

建议冻结的 Provider/Profile：沿用 accepted V1 `DEEPSEEK_FIXED_PROFILE_V1`，即 DeepSeek V4 Flash、
thinking off、无 fallback、无 Pi/HTTP 自动 retry。正式 Contract 接受前仍需用户确认 exact profile。

Stage 1：

- Credential reads、network、external Provider/model calls、real cost 均为 0；
- 真实形状路径只能使用注入的 deterministic stub；
- stub 不得读取 `.env` 或创建 socket/HTTP request。

Stage 2：

- Credential 只在 Manifest、source identity、budget 和 preflight 全部通过后 late-bound 解析；
- Credential value、Authorization header、reasoning/signature 不进入 Journal、Session projection、
  Workspace、错误、报告或 tracked/ignored Evidence；
- 每个 Provider request 必须在 dispatch 前 reserve，并在 response 后提交 known usage；
- unknown/missing usage fail closed 并保留 conservative charge；
- request/model/network counters 必须可由原始 runtime events 重算；
- Credential resolution failure、Provider error 或 timeout 不得触发自动 retry/fallback。

V2-B 不声称 OS 级网络 egress 被阻断。

## 9. Recommended Budget Envelope

以下为基于 V1 已接受 real envelope 的 Contract 推荐值；Cost 上限是控制 ceiling，不是价格预测，
正式接受前需用户确认或替换：

```yaml
per_attempt:
  provider_requests_max: 8
  tool_calls_max: 12
  tokens_max: 65536
  active_execution_time_ms_max: 300000
  verifier_runs_max: 1
  real_cost_usd_max: 0.20

per_recovery_group:
  attempts_exact_on_valid_failure: 3
  candidate_paths_exact: 2
  provider_requests_max: 24
  tool_calls_max: 36
  tokens_max: 196608
  active_execution_time_ms_max: 900000
  verifier_runs_max: 3
  real_cost_usd_max: 0.60

whole_v2_b_sequence:
  started_attempts_max: 7
  provider_requests_max: 56
  tool_calls_max: 84
  tokens_max: 458752
  active_execution_time_ms_max: 2100000
  verifier_runs_max: 7
  credential_reads_max: 3
  real_cost_usd_max: 1.40
```

预算是 runtime fail-closed boundary，不是完成标准。预算停止的 Attempt/Candidate 必须 terminalize、
保留在 Recovery Group 和报告中。不得通过忽略 stopped/invalid Evidence 释放预算。

## 10. Stage 1 — Thin Real Composition Scope

### 10.1 Required behavior

Stage 1 必须：

1. 为 V2 Controller 增加显式 deterministic/real execution port；
2. 让真实 `AgentHarness` 使用调用方提供的 JSONL `Session`，不得内部偷偷改回 in-memory Session；
3. 复用现有 DeepSeek public Provider、opaque Credential、pre-dispatch budget 和 known-usage模式；
4. 保留 V2-A Seed、Workspace、A/B Session、Verifier、Selector、Inspector 语义；
5. 为 Real Manifest、usage、cost、counter 和 terminal evidence 增加明确 schema；
6. deterministic stub 覆盖 initial pass、initial fail→A/B、none、budget/usage failure；
7. Stage 1 全过程真实访问计数为 0。

不得复制第二套 Seed/Workspace/Selector Controller 来规避复用问题。

### 10.2 Candidate source allowlist

Stage 1 可在 Contract 最终确认后新建或有界修改：

- `workbench/src/contracts/v2-types.ts`；
- `workbench/src/contracts/v2b-types.ts`；
- `workbench/src/run-v2.ts`；
- `workbench/src/run-v2b.ts`；
- `workbench/src/product-surface-v2.ts`；
- `workbench/src/product-surface-v2b.ts`；
- `workbench/src/inspect-v2.ts`；
- `workbench/src/inspect-v2b.ts`；
- `workbench/src/pi/pi-run-handle-v2b.ts`；
- `workbench/src/cli.ts`；
- `workbench/tests/v2b-stage1.test.ts`；
- `workbench/package.json`；
- `workbench/README.md`；
- Contract 指定的 V2-B Stage 1 report/closeout draft。

优先新建 V2-B schema/adapter 并对 V2-A 做最小 seam refactor。若必须修改
`selector-v2.ts`、Task/Skill/Verifier fixture、V1 source 或 allowlist 外实质源码，立即 Pause。

### 10.3 Protected/forbidden

- `.upstream/pi/**`；
- `reference/**`；
- `.env*`、Credential 和 Provider raw secret；
- accepted V0/V1/V2-A evidence；
- `fixtures/tasks/v1/**`、`fixtures/verifiers/v1/**`、`fixtures/skills/v1/**`；
- `workbench/src/recovery/selector-v2.ts`；
- `CURRENT_STATE.md`、正式 Charter/Contract/ADR；
- dependency install、external download、SDK/Extension/RPC、Git worktree provider；
- Git stage/commit/push。

## 11. Session Ownership

### 11.1 Main Session

- 当前主 Session保留 architecture、Contract、Manifest、baseline、Git、验收和状态权；
- 创建并核验 Baseline；
- 生成 Prompt 并创建新的顶层 Session；
- 轻量复核报告和原始 Evidence；
- 决定 correction/audit/Pause/Closeout；
- 不代替 Stage 1 实现或 Stage 2 真实执行。

### 11.2 Stage 1 top-level Implementation Session

- 必须是新建、侧边栏可见的顶层 Codex Session/任务；
- 只执行 Stage 1 allowlist；
- 不创建子 Agent；
- 不读取 Credential、联网、调用模型或 commit；
- 产出 Implementation Report、Closeout Draft、Source Delta、Commands/Exit Codes、Evidence Index、
  `CURRENT_STATE_UPDATE_PROPOSAL`；
- 命中 Pause Condition 后停止。

### 11.3 Stage 2 top-level Execution Session

- 必须是另一个新建、侧边栏可见的顶层 Codex Session/任务；
- 与 Stage 1 不是同一 Session，也不使用子 Agent；
- 无 source/test/fixture/Skill/Prompt/Verifier/Manifest/control/stage/commit 权；
- 先完成 read-only preflight，随后才可在独立授权内读取 Credential并真实执行；
- 不 retry、fallback、replacement、增加 Case 或修改选择规则；
- 产出 Execution Report、Closeout Draft、Commands/Exit Codes、Evidence Index、原始 counter/cost
  reconciliation 和 `CURRENT_STATE_UPDATE_PROPOSAL`；
- 报告完成后停止，不能自行接受 V2。

### 11.4 Correction and audit

- 普通 Stage 1 defect 返回原顶层 Stage 1 Session 合并返修；
- Stage 2 发现 source defect 时立即 Pause，不能临场修复；
- 默认不创建独立 Audit Session；
- 只有 Main 将具体 finding 映射到 Credential、budget、Session lineage、evidence 或 terminal blocker
  后，才向用户建议另一个新的顶层 focused Audit Session；
- focused Audit 也不得使用子 Agent或修复源码。

## 12. Gates

### Gate A — Control Identity and Session Authority

- exact Control Baseline 是当前 HEAD 的祖先；
- tracked/staged files clean；
- Pi fixed and clean；
- `active_goal`、Contract status、Stage owner 与授权一致；
- Session 是新的顶层 Codex task，不是子 Agent；
- Stage 1 真实访问权限全部为 0。

### Gate B — Real Composition Port, Zero Access

- real-shaped port 接受外部 JSONL Session 和 Workspace/Skill/Tool/Prompt；
- deterministic stub 实际经过该 port；
- credential resolver、network transport、DeepSeek Provider 均未被调用；
- malformed/missing/consumed authority fail closed。

### Gate C — Budget, Usage and Secret Boundary

- pre-dispatch reservation、post-response known usage、unknown usage pause 有 deterministic tests；
- Attempt/Group/whole sequence caps 可重算；
- Credential/headers/reasoning/signature 不进入 Evidence；
- no retry/fallback and one-use authority enforced。

### Gate D — Manifest, Cases and Fairness

- Primary、Contingency、Negative 与 activation rule 可由 immutable Manifest 校验；
- A/B common Artifact bytes 和唯一 Session-history delta 可复核；
- Contingency 不因 recovery none 启动；
- no third positive/negative replacement。

### Gate E — Inspector and Evidence

- Real schema 能关联 Run/Attempt/Seed/Group/Candidate/Session/Workspace/Verifier/Selection/usage；
- tamper/missing/duplicate/cross-run/source drift fail closed；
- Inspector read-only；
- V2-A old evidence 保留不覆盖。

### Gate F — Typecheck and Regression

- strict TypeScript pass；
- V2-B Stage 1 focused suite pass，0 skipped；
- V2-A full suite pass，0 skipped；
- V1 real Provider/budget/CLI 必要回归 pass；
- Workspace/Verifier path-security 必要回归 pass。

### Gate G — Stage 1 Deliverables and Main Acceptance

- Stage 1 deliverables 完整；
- source delta 在 allowlist 内；
- real access counters 均为 0；
- Main 接受后且用户授权，才可创建 Execution Baseline。

### Gate H — Fresh Stage 2 Read-only Preflight

在任何 Credential read/network/model call 前：

- exact Execution Baseline、Manifest、source digest、Pi SHA 全部匹配；
- tracked/staged clean；
- Stage 2 no-source-edit authority成立；
- focused typecheck/tests/Inspector pass；
- Provider profile在固定本地 public registry 可解析；
- budget 和 user authorization 已记录；
- 所有真实访问 counters 仍为 0。

任何一项失败立即 Pause，零真实调用。

### Gate I — Positive Execution

- Primary 只启动一次；
- valid initial failure 时在 Candidate 前冻结 Seed，并运行恰好 A/B；
- valid initial pass 时无 branch，并按 Manifest 规则决定是否启动 Contingency；
- Contingency 最多一次；
- A/B 都失败时保留 `no_passing_candidate`，不追跑；
- invalid/unknown usage/budget stop 保留并按 Contract terminalize。

### Gate J — Negative Execution

- `stable-format` 只启动一次；
- valid initial pass 时无 Failure Packet/Seed/Candidate/额外调用；
- 若初始失败并触发产品恢复，Evidence 必须完整保留，但 Negative DoD 不满足并 Pause；
- 不临场替换 Negative task。

### Gate K — Final Reconciliation

- 所有 started Runs terminal 或有完整 typed Pause；
- raw usage/cost/counters 与 Journal/Session/Manifest/terminal 一致；
- Inspector 对每个 Run read-only pass；
- protected/secret scan pass；
- Stage 2 source/tracked diff 为 0；
- Pi fixed and clean。

### Gate L — Stage 2 Deliverables and Main Review

- Execution Report、Closeout Draft、Evidence Index、Commands/Exit Codes、Case table、Selection、cost、
  limitations 和 `CURRENT_STATE_UPDATE_PROPOSAL` 完整；
- Stage 2 停止等待 Main/用户；
- Main 按 Version Question，而不是按“Session 已跑完”决定 V2 disposition。

## 13. Definition of Done

V2-B 必须同时满足：

1. 正式 Contract 被用户接受并按顺序激活；
2. Stage 1、Stage 2 都由新的顶层 Codex Session执行，子 Agent数为 0；
3. Stage 1 thin composition 没有复制第二套 V2 Controller；
4. Direct public `AgentHarness` 和 JSONL Session route 保持；
5. Stage 1 Credential/network/external/real calls/cost 均为 0；
6. typed authority、budget、usage、secret、Manifest、Inspector deterministic Gates 通过；
7. V2-A 与必要 V1/V0 回归通过；
8. frozen Execution Baseline 和 immutable Manifest 在真实访问前形成；
9. Stage 2 在 Credential 前通过 fresh read-only preflight；
10. 至少一个预冻结 Positive 形成有效 initial failure 和 immutable Seed；
11. Positive A/B 从相同 failed Workspace bytes 开始并都 terminal；
12. A 保留 parent history，B fresh，其他共同输入满足公平合同；
13. Selector 只选择通过全部 hard gates 的 Candidate或明确 none；
14. 一个 valid Negative initial pass 不创建任何 recovery object或额外调用；
15. 全部 Run/Pause、usage、cost 和 lineage 可 Inspect；
16. Stage 2 tracked/source delta 为 0；
17. Pi patch/private import、SDK/Extension/RPC、第三方 package/worktree 均为 0；
18. 报告真实结果，不因 outcome 不漂亮追跑或改标准；
19. Main 与用户接受一个正式 V2-B disposition；
20. Main 与用户单独决定整个 V2 是否关闭。

若两条 Candidate 都失败但机制/evidence 有效，第 13 项可由明确 none 满足；这不等于真实恢复成功。

## 14. Pause Conditions

任一命中立即停止当前 Session：

1. Baseline/Manifest/Pi/source identity不成立；
2. 顶层 Session 无法建立，只能使用子 Agent；
3. Stage 1 需要 Credential、网络、真实 Provider/model或外部下载；
4. 真实 composition 需要复制 Controller、绕过 Inspector或弱化 V2-A hard gates；
5. 必须修改 Pi、private import、切 SDK/Extension/RPC；
6. 必须修改 selector、V1 Task/Skill/Verifier fixture或 allowlist 外实质源码；
7. 同一 Session 同时拥有 source edit 和真实 Outcome观察权；
8. Credential/secret/reasoning/signature进入任何 Evidence；
9. unknown usage不能 fail closed或预算无法在 dispatch 前执行；
10. A/B Seed Workspace、共同输入或 Session-history唯一差异无法证明；
11. Candidate发生 Workspace/Session串扰；
12. 无 passing Candidate时 Selector仍强制选择；
13. invalid/budget-stopped Evidence消失；
14. Primary/Contingency/Negative activation不符合 immutable Manifest；
15. 两个 Positive 都未形成有效失败边界；
16. Negative 未形成 valid initial pass；
17. Stage 2 需要 source/Manifest/Verifier临场修改；
18. 需要第三个 Case、retry、fallback或replacement才能得到想要结果；
19. 实际工作扩张成平台、V3 Experience/Router或大样本 benchmark；
20. 用户需要决定未冻结的 Provider、预算、架构或范围分叉。

普通、明确且在 Stage 1 allowlist 内的 defect 可返回原顶层 Stage 1 Session；第二个 material
correction/audit 前必须由 Main 做 Complexity Checkpoint，但不能因流程次数本身提前关闭 Version。

## 15. Deliverables

### Stage 1

- `docs/reports/V2_B_STAGE1_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V2_B_STAGE1_CLOSEOUT_DRAFT.md`；
- ignored Stage 1 Evidence Index；
- Source Delta；
- Commands/Exit Codes；
- Gates A–G 和 DoD 对应项；
- unverified/claim boundary；
- `CURRENT_STATE_UPDATE_PROPOSAL`。

### Stage 2

- `docs/reports/V2_B_REAL_EXECUTION_REPORT.md`；
- `docs/reports/V2_B_CLOSEOUT_DRAFT.md`；
- ignored authoritative Evidence Index；
- exact Run/Attempt/Seed/Group/Candidate/Selection IDs；
- Primary/Contingency/Negative activation table；
- Provider/Tool/Token/time/Verifier/cost reconciliation；
- Commands/Exit Codes；
- Gates H–L 和 DoD；
- limitations/claims；
- `CURRENT_STATE_UPDATE_PROPOSAL`。

专用 Session不得直接修改 `CURRENT_STATE.md` 或正式 Contract。

## 16. Allowed Closeout Dispositions

Main 只能在核验原始 Evidence 后建议：

- `PASS_V2_B_REAL_RECOVERY_SELECTED`：Positive 至少一个 Candidate 通过并被正确选择，Negative
  valid initial pass/no-branch；
- `PASS_V2_B_REAL_RECOVERY_MECHANISM_NO_PASSING_CANDIDATE`：Positive A/B 都真实 terminal 且
  Selector正确为 none，Negative valid initial pass/no-branch；
- `PAUSE_V2_B_POSITIVE_NOT_TRIGGERED`：两个预冻结 Positive 均 valid initial pass；
- `PAUSE_V2_B_NEGATIVE_NOT_OBSERVED`：冻结 Negative 未形成 valid initial pass；
- `REVISE_V2_B_BOUNDED`：存在可在正式 allowlist 内修正的具体实现 defect；
- `PAUSE_V2_B_ARCHITECTURE_OR_AUTHORITY`：命中架构、权限、secret、budget或evidence分叉；
- `REJECT_V2_B_ROUTE`：Direct real-composition 或核心 V2机制被证据否定。

专用 Session只能提出建议，不能自行接受 Goal或关闭 V2。

## 17. Claims Boundary

### 17.1 `PASS_V2_B_REAL_RECOVERY_SELECTED` 后允许

- 在冻结真实 Task/Model/Skill/Tool/Verifier/预算下，Workbench 从初始失败形成 Seed、运行 A/B、
  验证并选择了一个 passing Candidate；
- 报告该 Case 中 A/B Outcome、Selection和真实资源成本；
- initial pass Case 没有无必要分支。

### 17.2 `PASS_V2_B_REAL_RECOVERY_MECHANISM_NO_PASSING_CANDIDATE` 后允许

- 真实多路径机制和证据链按合同运行；
- 本次冻结 Case 没有产生 passing Candidate；
- Selector正确选择 none。

### 17.3 始终不允许

- A 或 B 普遍更优；
- 多路径统计显著提高通用 Coding performance；
- Skill、fresh Session或Failure Packet具有独立因果效果；
- production durability、OS sandbox、exactly-once Tool或通用 crash recovery；
- SDK/Extension/Package/worktree已集成；
- V3 Experience、Curator、Router、Skill/Policy evolution已实现；
- 系统已经自主拆解任意任务或自我进化。

## 18. User Decisions Required Before Contract Acceptance

```yaml
user_decisions_required:
  - decision: accept_one_V2_B_goal_with_two_top_level_stages
    status: accepted_in_charter_amendment_2026_08_07
    recommendation: accept
    consequence: preserves source-edit/real-outcome separation without creating V2-C

  - decision: prohibit_subagents_for_all_V2_B_specialist_work
    status: accepted_by_user_2026_08_07
    recommendation: accept
    consequence: every specialist owner is a visible independent top-level Codex Session

  - decision: accept_case_set
    status: accepted_by_user_2026_08_07
    options:
      - parse_duration_primary_and_contingency_plus_stable_format_negative
      - revise_before_contract_acceptance
    recommendation: parse_duration_primary_and_contingency_plus_stable_format_negative
    consequence: reuses accepted real evidence and avoids new fixture design

  - decision: accept_skill_only_as_initial_and_common_recovery_input
    status: accepted_by_user_2026_08_07
    options:
      - accepted_V1_skill_for_initial_A_and_B
      - revise_treatment_semantics
    recommendation: accepted_V1_skill_for_initial_A_and_B
    consequence: preserves V1 policy continuity and keeps A/B primary delta to Session history

  - decision: accept_fixed_DeepSeek_V4_Flash_profile
    status: accepted_by_user_2026_08_07
    options:
      - reuse_DEEPSEEK_FIXED_PROFILE_V1
      - provide_another_exact_profile_before_acceptance
    recommendation: reuse_DEEPSEEK_FIXED_PROFILE_V1
    consequence: reuses accepted Provider composition and avoids a new model study

  - decision: accept_recommended_budget_envelope
    status: accepted_by_user_2026_08_07_with_all_cost_ceilings_doubled
    options:
      - accepted_8_request_per_attempt_and_USD_1_40_whole_sequence_cap
      - provide_revised_exact_caps_before_acceptance
    recommendation: accept_or_replace_with_equally_bounded_caps
    consequence: bounds up to seven Attempts without turning the cap into a completion rule

  - decision: accept_no_default_independent_audit
    status: accepted_by_user_2026_08_07
    options:
      - fresh_Stage_2_read_only_preflight_then_real_execution
      - require_separate_focused_audit_before_Stage_2
    recommendation: fresh_Stage_2_read_only_preflight_then_real_execution
    consequence: reduces V1-style process weight while preserving a fresh no-source-edit gate

  - decision: accept_separate_activation_and_real_authority
    status: accepted_by_user_2026_08_07
    options:
      - Stage_1_activation_then_later_Stage_2_real_authorization
      - reject
    recommendation: Stage_1_activation_then_later_Stage_2_real_authorization
    consequence: Contract acceptance alone grants no implementation or real access
```

## 19. Activation and Current Control Point

用户已授权 Main：

- 激活 V2-B 并创建本次 revision 的 Control Baseline Commit；
- 在确认精确 SHA 后生成 Stage 1 Prompt，开启绑定 Version Question 的 Goal；
- 创建一个新的顶层 Stage 1 Implementation Session；
- 对 allowlist 内小型 defect 执行有界返修和轻量复核；
- Stage 1 通过后创建 Candidate/Execution Baseline；
- 满足 Gate H 后创建另一个新的顶层 Stage 2 Session，并在正式预算内 opaque 读取 Credential、
  联网和调用冻结 DeepSeek Profile；
- 对具体高风险 finding 条件触发一次新的顶层 focused Audit Session。

当前 Control Baseline 形成前后，Stage 1 真实访问仍必须全部为 0。Stage 2 权限不提前生效。
最终接受/关闭 V2-B 或 V2、Pi 修改、SDK/Extension/RPC 切换、增加 Case/Retry/Fallback/
Replacement 和进入 V3 仍未授权。
