# V2-A Goal Contract — Deterministic Recovery Seed, Isolation and Selection

```yaml
status: implementation_complete_main_review_accepted_focused_audit_pending
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
version: V2_A
project: Agent Harness Reliability Workbench
prepared_at: 2026-08-06
prepared_by: main_session
planning_baseline_commit: bd903c963b68ba2b13ab56c20a7515a63f681021
accepted_by_user: true
accepted_at: 2026-08-06
contract_accepted: true
active_goal: true
activation_authorized: true
activated_by_user: true
activated_at: 2026-08-06
control_baseline_commit_authorized: consumed_by_resulting_HEAD_of_this_revision
control_baseline_commit: resulting_HEAD_of_this_revision
implementation_owner: dedicated_v2_a_implementation_session
implementation_authorized: true
implementation_started: true
implementation_completed: true
implementation_session_recommendation: PASS
main_light_review_disposition: ACCEPT_FOR_FOCUSED_AUDIT
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
dependency_installation_authorized: false
external_download_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
pi_sdk_rpc_extension_route_authorized: false
third_party_pi_package_authorized: false
git_worktree_provider_authorized: false
dedicated_session_git_commit_authorized: false
dedicated_session_prompt_authorized: consumed
bounded_correction_authorized: conditional_within_contract_after_main_review
candidate_commit_authorized: consumed_by_resulting_HEAD_of_this_revision
candidate_audit_baseline_commit: resulting_HEAD_of_this_revision
focused_independent_audit_authorized: true_after_exact_candidate_SHA_confirmation
V2_B_contract_creation_authorized: false
V2_B_execution_authorized: false
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
accepted_v1_c_control_closeout_baseline: c37ef6e6676cba245c0929dcdf98401f004fab54
accepted_v2_charter: docs/第二项目_Codex交接包_2026-07-30/V2_VERSION_CHARTER.md
```

> 本文件是用户已接受并已激活的 V2-A 正式 Goal Contract。dedicated V2-A Implementation
> Session 已以零凭据、零网络、零外部 Provider/真实模型调用完成 Gates A–I；Main light review
> 接受其进入 Candidate freeze。当前 resulting HEAD 是 Candidate Audit Baseline，下一步只执行
> Gate J focused audit；V2-A 最终接受、V2-B 和任何真实访问仍未授权。

---

## 1. Goal Mission

V2-A 的唯一使命是：

> 在已接受的 V0 Workbench 和 V1 Skill 基线上，以零真实调用实现一个可复核的
> `Recovery Seed → 两条隔离 Candidate → 独立 Verifier → Selection Decision`
> 基础层，并证明两条路径的主要变量仅为是否保留失败前的父 Session 历史。

V2-A 必须确定性回答：

1. 初始 Attempt `settled` 且外部 Verifier 有效失败后，能否在任何 Candidate 开始前
   一次性冻结不可变 Recovery Seed；
2. 能否从同一个失败 Workspace digest 创建两个不串扰的受控副本；
3. 路径 A 能否从公开 Pi Session primitive 派生并保留父历史，路径 B 能否使用不含
   父历史的新 Session；
4. A/B 能否接收字节相同的恢复指令、Failure Packet、Skill、Policy、Task、Tool、
   Verifier 和预算合同；
5. 两条 Candidate 是否都真正执行并各自形成 terminal、可 Inspect 的结果，而不是在
   第一条通过后提前停止；
6. 选择器能否只在通过全部 Hard Gates 的 Candidate 中确定性选择，或明确返回
   `selected_candidate_id: null`；
7. 初始 Verifier 已通过时，能否不创建 Failure Packet、Recovery Seed、Candidate 或
   额外恢复调用；
8. V0/V1 已接受产品边界是否保持不变，且不修改 Pi Core。

V2-A 不回答：

- 真实任务中 A 或 B 哪条更好；
- 多路径是否提升通用 Coding 成功率；
- Experience、Skill 生成或 Harness 自进化是否有效。

这些分别属于未来 V2-B 和 V3；V2-A 通过不等于 V2 完成。

## 2. Authorization and Governance

### 2.1 唯一控制顺序

```text
V2 Precontract Research 与 V2 Charter 接受
→ V2 Planning Baseline bd903c963b68ba2b13ab56c20a7515a63f681021
→ Main Session 起草本 Draft
→ 用户审查并接受/修订正式 V2-A Contract
→ 正式 Contract 状态 accepted_not_activated，active_goal 仍为 null
→ 用户单独授权 V2-A Activation + Control Baseline Commit
→ Main Session 更新 CURRENT_STATE、正式 Contract 和必要控制文件
→ Main Session 创建并核验 active_goal: V2_A 的干净 tracked Control Baseline
→ Main Session 固定精确 SHA 并生成 dedicated Implementation Session Prompt
→ dedicated V2-A Implementation Session 从该 SHA 先执行 Gate A
→ zero-call 实现、测试、Evidence、Implementation Report、Closeout Draft
→ Main Session 进行轻量有界实现验收
→ 缺陷返回原 Implementation Session 有界返修
→ 用户另行授权 Candidate Audit Baseline Commit 与 focused audit
→ Main Session 冻结 Candidate Commit
→ fresh focused independent Audit Session 只审计本合同指定高风险边界
→ 如有 finding，返回原 Implementation Session，并只复审命中项与必要回归
→ 用户另行授权 accepted Implementation Baseline 与控制收口
→ Main Session 与用户接受或拒绝 V2-A
→ 只有 V2-A closed_accepted 后，Main Session 才可起草 V2-B Contract
```

### 2.2 绑定治理规则

1. Contract 接受不等于 Activation；Activation 不等于 Candidate/audit/最终接受。
2. 当前唯一已存在的基线是 Planning Baseline
   `bd903c963b68ba2b13ab56c20a7515a63f681021`。
3. V2-A 的 Credential、网络、外部 Provider 和真实模型调用必须恰好为 0。
4. deterministic Faux Provider 只作为 Pi public route 的测试替身，计数必须与真实调用
   分离，并记录为非外部调用。
5. dedicated Implementation Session 不得修改、暂存或提交：
   - `CURRENT_STATE.md`、`AGENTS.md`；
   - 正式 Charter、Contract、`09_对接执行、文件权威与验收规则.md`；
   - accepted ADR、Closeout 或其他控制文件。
6. dedicated Implementation Session 不得创建 Git commit；只能提交允许的 source/test/
   fixture/report delta、ignored Evidence 和结构化状态更新建议。
7. Main Session 独占 Contract 解释、范围裁决、Candidate freeze、控制状态更新和 Goal 接受。
8. focused Audit Session 不得修源码、修改控制状态、创建 commit 或扩大为全项目审计。
9. 正确性 defect 返回原 Implementation Session；Main/Audit 不静默修实现。
10. 不因“一个修复轮次”之类机械数量上限而在 Version Question 未回答时强行收口；但任何
    新增步骤必须绑定具体 finding、DoD 和停止条件。
11. 专用 Session 的新建议不会自动成为 Gate、Goal 或架构变更；Main 必须筛选。
12. 本合同不向 V2-B 传递真实调用、预算或执行权限。

## 3. Binding Inputs and Read Order

未来 dedicated V2-A Implementation Session 在运行命令或修改文件前必须完整读取：

1. 根 `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. `docs/第二项目_Codex交接包_2026-07-30/V2_VERSION_CHARTER.md`；
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
5. 用户接受后的正式 `V2_A_GOAL_CONTRACT.md`；
6. `docs/reports/V2_FAILURE_AWARE_BOUNDED_RECOVERY_PRECONTRACT_RESEARCH.md`；
7. `docs/reports/V1_CLOSEOUT.md`；
8. `docs/reports/V1_C_R2_MAIN_ACCEPTANCE_AND_V1_POLICY_DECISION.md`；
9. `docs/第二项目_Codex交接包_2026-07-30/V1_C_GOAL_CONTRACT.md`；
10. `workbench/README.md` 以及本合同涉及的当前 Workbench source/tests/scripts；
11. `fixtures/skills/v1/reliability-completion/SKILL.md`、采用的 V1 task/verifier/strategy；
12. `.upstream/pi/AGENTS.md` 及进入子树时适用的全部 `AGENTS.md`；
13. §4.3 列出的固定 Pi 源码与测试。

权威顺序：

```text
pinned source / tests / actual command output
→ CURRENT_STATE / accepted Closeout / accepted ADR
→ accepted V2 Version Charter
→ 用户接受后的正式 V2-A Contract
→ accepted Main-Session research review
→ reference notes / SDK or Extension comparison
→ Session inference
```

若 HEAD、Pi、Contract、适用指令或授权状态不一致，Gate A 失败并 Pause；Implementation
Session 不得自行修改控制状态。

## 4. Fixed Evidence Baseline

### 4.1 Project facts

**Fact.** V0-A/B/C 已关闭接受；V1-A 与 V1-C 已关闭接受。V1 形成了可运行的三路
Workbench、环境级 Verifier、Manifest/Run/Attempt/Session/Workspace/Outcome 证据和公开
Pi `AgentHarness` 真实调用路线。

**Fact.** V1-C R2 结果为 Baseline `7/8`、Skill-only `8/8`、Skill + same-Session
Runtime Control `7/8`；唯一触发的 C Recovery 没有成功。该结果是描述性的，不证明
Skill-only 普遍更优。

**Fact.** 当前 V1 使用 `InMemorySessionStorage`；接受的失败 Run 没有保存 Candidate 前
不可变失败 Workspace 快照，也没有保存可 reopen 的父 Session。因此它是 V2 的任务和
失败模式输入，不是权威 V2 Recovery Seed。

### 4.2 Accepted V2 architecture

- Direct public emitted `pi-agent-core` `AgentHarness` 仍是主路线；
- 首选 public `JsonlSessionRepo` 的 create/open/fork；
- 当前受控 temp-copy/path-policy 是首版 Workspace provider；
- A/B 共享同一失败 Workspace Seed、V1 promoted Skill、Failure Packet、Recovery Policy、
  Model、Tool Profile、Verifier 和预算；
- 主要变量仅是父 Session history retained vs absent；
- 初始通过不分支；初始有效失败后恰好创建并运行两条 Candidate；
- 选择器允许 `none`，不得为了漂亮结果强制选择；
- V2 只分 V2-A deterministic substrate 和 V2-B frozen real acceptance 两个 Goal。

### 4.3 Pinned Pi evidence to verify, not modify

固定 Pi commit：`027a5847901b5dde30270abaa1041046cd2b4b55`。

至少核验：

- `.upstream/pi/packages/agent/src/index.ts` 的 public exports；
- `.upstream/pi/packages/agent/src/harness/session/jsonl-repo.ts:JsonlSessionRepo`；
- `.upstream/pi/packages/agent/src/harness/session/repo-utils.ts:getEntriesToFork`；
- `.upstream/pi/packages/agent/test/harness/repo.test.ts` 的 create/open/fork/lineage tests；
- 当前 emitted package root 或 `./node` 的公开 import boundary。

任何 Pi 结论必须引用 path、symbol 和 test/actual command。不得依 README 或
`reference/src/` 证明 Pi 行为。

### 4.4 Deferred Pi surfaces

`pi-coding-agent` SDK、Extension、可安装 Package 和 Git worktree 仅是已记录的未来兼容/
复用候选。除非 Direct public route 命中 Pause Condition 并经 Main/用户重新决策，本 Goal
不得切换或引入它们。

## 5. Frozen Architecture and Semantics

### 5.1 Product flow

```text
frozen task + promoted V1 Skill + fixed policy
→ primary Skill-only Attempt on controlled Workspace
→ AgentHarness settled
→ common external Verifier

if verifier passed:
  terminal initial_pass
  no Failure Packet / Seed / Candidate / Selection

if verifier validly failed:
  build bounded Failure Packet
  → freeze failed Workspace and parent Session as immutable Recovery Seed
  → prove Seed integrity before any Candidate starts
  → clone Candidate A Workspace and derive/fork parent Session history
  → clone Candidate B Workspace and create fresh Session without parent history
  → run both Candidates independently with identical recovery instruction bytes
  → run the same external Verifier independently
  → evaluate all Hard Gates
  → select eligible Candidate deterministically, or select none
  → persist inspectable Selection Decision
```

### 5.2 Fixed Candidate strategies

| strategy_id | Session semantics | Workspace start |
|---|---|---|
| `continue_failed_session` | 从失败边界公开派生/复制的 Session，保留父 entries 和 lineage；不得直接继续修改原父 Session | Recovery Seed 的隔离副本 |
| `fresh_session_from_failure_seed` | 全新 Session，不含父 conversation/tool history；仍绑定同一 parent Attempt/Seed lineage | 同一 Recovery Seed 的另一个隔离副本 |

两条策略都必须运行；不得在 A 通过后跳过 B，也不得复用同一可变 Session 或 Workspace。

### 5.3 Fairness contract

A/B 必须相同：

- task instruction reference 和 digest；
- failed Workspace seed digest；
- model-visible Failure Packet bytes；
- recovery instruction bytes；
- promoted V1 Skill source/digest；
- Recovery Policy、Model identity、Tool Profile、Verifier；
- 每路径预算上限和终止规则；
- Workbench/Pi revision。

唯一有意差异是：A 的模型上下文保留父 Session history，B 不保留。不能要求两者完整
model input bytes 相同，因为 Session history 正是实验变量；必须证明即时恢复指令和所有共同
Artifact 字节相同。

### 5.4 Public Session boundary

- 优先使用固定 emitted `pi-agent-core` public `JsonlSessionRepo` create/open/fork；
- A 必须生成不同于父 Session 的派生 Session identity，并保留可核验 parent lineage；
- B 必须生成全新 Session identity，父 entries 数为 0；
- 两条 Candidate 的 runtime Model/Tool registry/Workspace/Policy 由 Workbench 明确重建，
  不能依赖旧进程中未持久化的对象；
- 本 Goal 不声称实现 in-flight crash recovery、exactly-once Tool 或通用 durable runtime；
- fresh-process resume 不是额外平台 Gate；若实现自然使用新进程，可以保留证据，但不得为此
  扩张架构。

### 5.5 No implementation by report inflation

只实现 Version Question 必需的 contracts、runtime、tests、fixtures、Inspector 和 evidence。
不得建设 Dashboard、数据库、Scheduler、任意策略插件框架或通用 workflow engine。

## 6. Minimal Data Contracts

实现可以调整字段名，但不得丢失以下语义和 digest/lineage invariant。

### 6.1 RecoverySeed

```yaml
recovery_seed_id: string
recovery_group_id: string
parent_run_id: string
parent_attempt_id: string
task_id: string
task_instruction_ref: artifact_ref
task_instruction_sha256: sha256
failure_packet_ref: artifact_ref
failure_packet_sha256: sha256
failed_workspace_snapshot_ref: artifact_ref
failed_workspace_snapshot_digest: sha256
parent_session_ref: artifact_ref
parent_session_digest: sha256
verifier_result_ref: artifact_ref
verifier_result_sha256: sha256
tool_profile_digest: sha256
prompt_digest: sha256
skill_digest: sha256
pi_commit: sha1
workbench_digest: sha256
created_before_candidate_attempts: true
```

### 6.2 CandidatePath and Rollout

```yaml
candidate_path_id: string
recovery_group_id: string
recovery_seed_id: string
strategy_id: continue_failed_session | fresh_session_from_failure_seed
parent_attempt_id: string
session_ref: artifact_ref
session_digest_before_run: sha256
workspace_ref: artifact_ref
initial_workspace_digest: sha256
attempt_id: string
settled: boolean
final_workspace_ref: artifact_ref
final_workspace_digest: sha256
verifier_result_ref: artifact_ref
evidence_valid: boolean
budget_usage: object
terminal_reason: string
```

### 6.3 SelectionDecision

```yaml
recovery_group_id: string
evaluated_candidate_ids: string[]
eligible_candidate_ids: string[]
rejected_candidate_ids: string[]
selected_candidate_id: string | null
hard_gate_results: object
secondary_ordering: object
terminal_reason: selected | no_passing_candidate | all_invalid | tie_resolved
```

所有对象必须以 immutable Manifest identity、Run/Attempt/Session/Workspace/Verifier/Artifact
引用闭合。不能只存 ID 而不保留可校验的内容引用或 digest。

## 7. Recovery Seed and Workspace Invariants

1. Seed 只能在 primary Agent settled 且 Verifier 返回有效 failure 后生成。
2. Seed 必须在任何 Candidate Session/Workspace 创建或运行前完成并校验。
3. Seed 内容一旦冻结不得覆盖、补写或从 Candidate 最终状态反推。
4. 两个 Candidate 的初始 Workspace content digest 必须与 Seed 相同。
5. Candidate Workspace 之间及其与 Seed 之间不得存在 hardlink、junction/reparse escape、
   symlink escape 或其他会导致写入串扰的共享可变文件。
6. Candidate A/B 的路径 identity 必须经过现有 Windows case/path policy。
7. Agent 只能修改其 Candidate Workspace allowlist；不能触碰 Verifier、Task、Skill、
   Manifest、Selection rule、evidence root 或另一个 Candidate。
8. 未选 Candidate 不得自动 apply 到用户仓库；V2-A 本身不执行发布。

## 8. Failure Packet Boundary

### 8.1 Model-visible projection

- 原始任务指令或其完整受控投影；
- external Verifier 失败检查名；
- 有界、去敏的失败摘要和允许的命令输出；
- 已修改文件清单与有界 diff 摘要；
- writable/protected/forbidden 约束；
- parent Attempt 标识；
- 剩余路径预算与停止条件。

### 8.2 Host-only evidence

- 原始 Verifier 输出和完整 Artifact refs；
- 所有 SHA-256；
- Manifest/Run/Attempt/Session/Workspace 关联；
- secret scan、protected-path scan 和 evidence validity；
- Selector 所需的成本、tokens、Tool/Provider 计数和 active time。

模型可见摘要必须保留回到原始 Artifact 的检索路径。不得将 credential、reasoning、
signature、完整 Provider raw response 或不必要的系统路径写入模型投影或 tracked report。

## 9. Selection Policy

### 9.1 Hard Gates

Candidate 只有全部满足下列条件才 eligible：

1. Manifest/Seed/Artifact identity 完整且 digest 匹配；
2. 从权威 Seed digest 开始，且与另一 Candidate 无串扰；
3. Session strategy 和 parent lineage 符合合同；
4. Agent reached `settled`，并形成唯一 terminal Attempt；
5. budget 未越界且计数完整；
6. common external Verifier `passed`；
7. protected paths、secret scan 和 path-policy 通过；
8. Journal/Outcome/Run/Attempt/Session/Workspace/Verifier lineage 闭合。

invalid、budget-stopped、evidence-incomplete 或 Verifier failed Candidate 不能因 diff 小、速度快
或顺序靠前而获胜，也不能从 Recovery Group 报告中消失。

### 9.2 Secondary ordering

只有多个 Candidate 均 eligible 时，按以下冻结顺序比较：

1. allowed-path semantic diff 更小；
2. Faux/未来真实成本或 tokens 更低；
3. Tool calls 更少；
4. active execution time 更短；
5. 若仍完全相同，使用固定 strategy order：
   `continue_failed_session` 在 `fresh_session_from_failure_seed` 前。

选择器必须保存逐项比较值和理由。若无 eligible Candidate，必须返回 `null`；不得为满足
“一定选一个”而放宽 Hard Gates。

## 10. Deterministic Cases

V2-A 至少用 Faux Provider 和冻结 fixture 证明以下场景：

1. `initial_pass_no_branch`：无 Failure Packet/Seed/Candidate/Selection 和恢复调用；
2. `valid_initial_failure_seed_before_candidates`：Seed 在任一 Candidate 前写入并冻结；
3. `a_pass_b_fail_select_a`；
4. `a_fail_b_pass_select_b`；
5. `a_pass_b_pass_secondary_tie_break`；
6. `a_fail_b_fail_select_none`；
7. `invalid_or_budget_stopped_candidate_cannot_win`；
8. `a_retains_parent_history_b_does_not`；
9. `candidate_workspace_isolation_and_equal_start_digest`；
10. `seed_or_evidence_tamper_rejected`；
11. `two_candidates_execute_even_if_first_candidate_passes`；
12. `public_emitted_jsonl_session_create_open_fork_on_windows`。

同一 fixture 可以覆盖多个场景，但不得只用手工构造 JSON 绕过真实 Workbench boundary。
Session、Workspace、Verifier 与 Selection 的主链必须至少有一条 end-to-end deterministic Run。

## 11. Deterministic Budget and Stop

V2-A 只使用无成本 Faux Provider。为避免低上限机械阻断实现，冻结的是较宽但明确的安全上限：

```yaml
per_primary_attempt:
  faux_provider_dispatches_max: 8
  tool_calls_max: 16
  verifier_runs_max: 1

per_candidate_attempt:
  faux_provider_dispatches_max: 8
  tool_calls_max: 16
  verifier_runs_max: 1

per_recovery_group:
  candidate_paths_exact_on_valid_failure: 2
  faux_provider_dispatches_max: 24
  tool_calls_max: 48
  verifier_runs_max: 3
  real_cost_usd: 0
```

- 上限是 runtime fail-closed boundary，不是“做到一半就宣布 Goal 完成”的步骤上限。
- 某 Candidate 命中预算必须 terminalize 为 ineligible，并仍留在 Selection/Inspector 中；另一
  Candidate 仍按合同执行，最终可选择另一条或 none。
- 若冻结 fixture 在合理实现下反复需要超过此上限，必须 Pause 并提供证据；专用 Session 不得
  静默提高预算。
- 无 same-Attempt retry、fallback、自动 replacement、第三 Candidate 或无限循环。

## 12. Source and Filesystem Scope

### 12.1 Candidate implementation allowlist

正式 Activation 后，dedicated Implementation Session 只可在以下范围新建或有界修改：

- `workbench/src/contracts/v2-types.ts`；
- `workbench/src/recovery/**`；
- `workbench/src/session/**` 中明确 V2 专用或兼容性最小扩展；
- `workbench/src/pi/pi-run-handle-v2.ts` 和必要的 V2 public adapter；
- `workbench/src/run-v2.ts`；
- `workbench/src/inspect-v2.ts`；
- `workbench/src/product-surface-v2.ts`；
- `workbench/src/cli.ts` 的 V2 product-surface 最小接线；
- `workbench/src/evidence/**`、`workspace/**` 中复用现有边界所需的最小向后兼容扩展；
- `workbench/tests/v2a-*.test.ts`；
- `workbench/test`、`workbench/package.json`、`workbench/README.md` 的有界接线与说明；
- `workbench/scripts/run-v2a-*.mjs`（仅在有必要生成确定性 Evidence 时）；
- `fixtures/manifests/v2/**`、`fixtures/strategies/v2/**`；
- 必要的全新 `fixtures/tasks/v2/**`、`fixtures/verifiers/v2/**`，但优先复用冻结 V1 task/
  verifier/Skill，不修改 V1 原件；
- `docs/reports/V2_A_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V2_A_CLOSEOUT_DRAFT.md`；
- ignored `.runs/v2-a/**`，且只能在 Gate A 通过后创建。

若必须修改 allowlist 外的 project source/test，立即 Pause，由 Main 判断是合同微调还是架构扩张。

### 12.2 Protected and forbidden

- `CURRENT_STATE.md`、`AGENTS.md`、正式 Charter/Contract/治理文件；
- V0/V1 accepted source semantics、fixtures、Manifest、Skill、Verifier、报告和 Evidence；
- `.upstream/pi/**`；
- `reference/**`；
- `.env*`、Credential 和 secret；
- `.git/**`；
- Verifier/Task/Selection/Acceptance Criteria 被 Candidate Agent 自己修改；
- dependency installation、外部下载、SDK/Extension/RPC/第三方 Package、Git worktree provider。

V2 新 fixture/verifier 可以由 Implementation Session 在 Source Stage 创建，但运行时 Candidate
Agent 必须无法修改它们。任何 V1 复用资产保持字节不变。

## 13. Session Responsibilities

### 13.1 Main Session

- 冻结/解释 Contract 和 Version Question；
- 更新控制状态并创建 Control/Candidate/Implementation Baseline commit；
- 做轻量有界验收；
- 决定 finding 是否需要 correction、audit 或 Pause；
- 与用户接受/拒绝 V2-A；
- V2-A 接受后才起草 V2-B。

### 13.2 Dedicated V2-A Implementation Session

- 只执行本 Contract allowlist、Gates 和 deterministic Cases；
- 保存命令、exit codes、raw ignored Evidence、Source Delta；
- 产出 Implementation Report、Closeout Draft 和 `CURRENT_STATE_UPDATE_PROPOSAL`；
- 命中 Pause Condition 立即停止；
- 不接受 Goal、不改控制状态、不 commit、不进入真实执行。

### 13.3 Focused independent Audit Session

只在 Main 冻结 Candidate 且用户授权后检查：

- Seed 的顺序、不可变性和 tamper rejection；
- JSONL Session lineage 与 A/B history delta；
- Candidate Workspace 的同起点和隔离；
- Selector hard gates、none、invalid/budget retention；
- terminal/budget/evidence/secret/protected boundaries；
- 本合同要求的必要回归。

不做 general security review、Pi 全量审计、V3 设计或 source repair。

## 14. Gates

### Gate A — Identity, Authority and Clean Control Baseline

- 精确 HEAD 必须为未来记录的 V2-A Control Baseline，且 ancestry 包含 Planning Baseline
  `bd903c963b68ba2b13ab56c20a7515a63f681021`；
- tracked/staged clean；已登记的 untracked `reference/` 可以存在但不得变化；
- Pi HEAD 固定且 clean；
- `active_goal: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE`、Contract activated、owner 正确；
- Credential/network/real call/install/Pi patch 均未授权且为 0。

失败：立即 Pause，零 source delta。

### Gate B — Public Pi Session Primitive

- strict TypeScript consumer 从固定 emitted public export 消费 Session repo；
- Windows 上实际验证 create/open/fork 与 parent lineage；
- A 从父 Session 派生为独立 identity，B fresh 且无父 entries；
- 无 private import、Pi patch 或 SDK route。

失败且没有同一 public Direct route 的有界修法：Pause 架构决策。

### Gate C — Seed Order and Immutability

- valid failure 才创建 Seed；
- Seed 在 Candidate 前完成；
- digest 完整且写后 tamper 被拒绝；
- initial pass 不生成恢复对象。

### Gate D — Workspace Equality and Isolation

- A/B initial digest 相同且等于 Seed；
- 无 hardlink/junction/reparse/symlink escape；
- 修改一条 Candidate 不影响 Seed 或另一条；
- protected/path-policy 回归通过。

### Gate E — Candidate Fairness and Session Delta

- A/B 共同 Artifact 和即时恢复 prompt bytes 相同；
- A 可证明看到父 history，B 可证明没有父 history；
- 两条都运行并 terminal；不得 first-pass short-circuit；
- 主要差异没有混入 Skill、Workspace、Tool、Verifier、Model 或预算变化。

### Gate F — Selector Scenario Matrix

- pass/fail、fail/pass、pass/pass、fail/fail、invalid/budget 场景全部通过；
- Hard Gates 优先；
- none 是合法 terminal Decision；
- invalid Candidate 保留但不得获胜；
- tie-break 可复现且理由可 Inspect。

### Gate G — Lineage, Inspector and Evidence

- Run/Attempt/Recovery Group/Seed/Candidate/Session/Workspace/Verifier/Selection 可闭合；
- tamper、missing、duplicate、cross-group 或 mixed identity fail closed；
- secret/protected scan 通过；
- raw Evidence 不被摘要覆盖；
- Inspector 为 read-only。

### Gate H — Typecheck and Focused Regressions

- `npm run typecheck` 通过；
- V2-A dedicated suite 通过，0 skipped；
- 至少覆盖当前 Workspace path policy、V0-B Verifier、V1-A deterministic、V1-B Stage 1/
  CLI 和 V1-C budget-stop 的必要回归；
- 不运行 broad Pi build/test/install，除非 Contract 后续明确授权。

### Gate I — Deliverables and Session Boundary

- Implementation Report、Closeout Draft、Evidence Index、Source Delta、Commands/Exit Codes 完整；
- `CURRENT_STATE_UPDATE_PROPOSAL` 结构化且未直接修改状态；
- Git staged/commit delta 为 0；
- Provider/model/network/credential 为 0；
- Pi/reference/control files 字节不变。

### Gate J — Focused Independent Audit

Gate J 不由 Implementation Session 自行通过。Main 冻结 Candidate、用户授权后，由 fresh
Audit Session 执行 §13.3。V2-A 只有 Gate J 通过且 Main/用户正式接受后才能关闭。

## 15. Definition of Done

V2-A 必须同时满足：

1. Gates A–I 由 Implementation evidence 支持；
2. Gate J 经用户授权的 focused audit 通过；
3. Direct public `AgentHarness` 仍为 runtime 主路线；
4. public emitted JSONL Session create/open/fork Windows Gate 通过；
5. valid failure 在任何 Candidate 前生成 immutable Recovery Seed；
6. initial pass 不创建任何 recovery object 或恢复调用；
7. A/B 从同一 Seed Workspace digest 开始；
8. A/B Workspace 与 Session 相互隔离；
9. A 保留父 history，B 不保留；
10. A/B 的共同 Artifact、prompt、Skill、Policy、Model、Tool、Verifier、budget 相同；
11. valid failure 时两条 Candidate 都执行并 terminal；
12. A-pass/B-fail 选 A；
13. A-fail/B-pass 选 B；
14. pass/pass 按 secondary rule 可复现选择；
15. fail/fail 明确选择 none；
16. invalid/budget-stopped Candidate 保留且不能获胜；
17. Seed/evidence tamper、mixed identity、串扰 fail closed；
18. Inspector 能闭合全部 lineage 和 Selection reason；
19. strict TypeScript、V2 suite 和必要 V0/V1 regressions 通过；
20. real/external calls、Credential、network、cost 均为 0；
21. Pi Core patch/private import、SDK/Extension/RPC、第三方 Package、worktree 均为 0；
22. protected/control/V0/V1/reference 文件未被越权修改；
23. Implementation Report、Closeout Draft、Evidence Index、Source Delta、Commands/Exit Codes
    和 `CURRENT_STATE_UPDATE_PROPOSAL` 完整；
24. Main 与用户接受 `PASS_V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE`。

DoD 24/24 只证明 deterministic substrate，不能宣称 V2 或真实恢复效果已经完成。

## 16. Deliverables

dedicated Implementation Session 必须交付：

1. 本合同 allowlist 内的 source/test/fixture delta；
2. `docs/reports/V2_A_IMPLEMENTATION_REPORT.md`；
3. `docs/reports/V2_A_CLOSEOUT_DRAFT.md`；
4. `.runs/v2-a/evidence/EVIDENCE_INDEX.md`；
5. Source inventory/delta，含 protected 与 Pi/reference unchanged proof；
6. exact Commands 与 Exit Codes；
7. authoritative deterministic Run/Recovery Group IDs 与 artifact paths；
8. Gate A–I 和 DoD 逐项证据；
9. unverified items、scope deviations、Pause/claim boundary；
10. 结构化 `CURRENT_STATE_UPDATE_PROPOSAL`，至少包含：

```yaml
proposal_only: true
proposed_goal_status: implementation_complete_pending_main_review
proposed_disposition: PASS | REVISE_BOUNDED | PAUSE | REJECT
gates: object
dod: object
authoritative_run_ids: string[]
real_model_calls_observed: 0
external_provider_calls_observed: 0
credential_reads_observed: 0
pi_core_patch_count: 0
candidate_commit: null
```

Implementation Session 不得直接修改 `CURRENT_STATE.md` 或正式 Contract。

## 17. Pause Conditions

任一命中立即停止并写 `V2_A_PAUSE_REPORT.md`；不得为了“完成两路比较”越权绕过：

1. Gate A identity/authority/cleanliness 不成立；
2. Recovery Seed 无法在 Candidate 前冻结；
3. A/B 初始 Workspace digest 不同或发生任何串扰；
4. Session history 差异与 Skill/Prompt/Workspace/Tool/Verifier 差异无法分离；
5. Direct public route 需要 Pi Core patch/private import；
6. 必须切换 SDK/Extension/RPC、第三方 Package 或 worktree 才能继续；
7. Agent 能修改 Verifier、tests、Manifest、Selection rule、evidence authority 或控制状态；
8. 无 passing Candidate 时 Selector 仍强制选择；
9. invalid/budget-stopped Candidate 从 Recovery Group 消失；
10. raw Tool/Verifier evidence 被可变投影覆盖；
11. Credential、secret、reasoning、signature 或 Provider raw response 泄露；
12. immutable artifact 在冻结后被覆盖或无法校验；
13. 需要联网、下载、安装依赖或调用真实 Provider/model；
14. V2-A 开始扩张为 durable runtime、Scheduler、数据库、Experience、Router、自动 Skill
    生成或任意策略框架；
15. 需要 allowlist 外的实质 source/control 修改；
16. Candidate 高风险控制流无法在一次 focused audit 范围内有界复核；
17. 实现无法回答本 Goal Question，且问题不是普通可返修 defect。

Pause Report 只需说明 observation、evidence、impact、已停止的外部访问计数和需要 Main/用户
决定的选项。局部普通 defect 不自动升级为架构 Pause；可在当前 Implementation Session 的
allowlist 内明确修复并验证时，应在报告中诚实记录后继续。

## 18. Claims Boundary

### 18.1 V2-A 通过后允许

- Workbench 能在确定性测试中从有效失败边界冻结 Recovery Seed；
- 能从相同失败 Workspace 创建并隔离 same-history 与 fresh-history 两条 Candidate；
- 能证明 public Pi Session primitive 在当前固定 Windows emitted route 可消费；
- 能用 Hard Gates 选择 passing Candidate 或明确选择 none；
- 初始通过时不会无必要创建恢复分支；
- 全链路 deterministic evidence 可由 Inspector 复核。

### 18.2 V2-A 通过后仍不允许

- V2 已完成；
- A 或 B 在真实 Coding Task 中更好；
- 多路径提高通用成功率或具有统计显著性；
- 系统会自主拆分任意任务、生成 Skill、学习 Experience 或进化 Harness；
- 具备 production durability、OS sandbox、crash recovery 或 exactly-once Tool；
- SDK/Extension/Package/worktree 已集成；
- V2-B、V3 或 V4 已授权/实现。

## 19. Closeout Dispositions

Main Session 只能在审查 Evidence 与 focused audit 后向用户建议：

- `PASS_V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE`：全部 DoD 满足；
- `REVISE_V2_A_BOUNDED`：存在可在本合同内修复的具体 defect；
- `PAUSE_V2_A_ARCHITECTURE_DECISION`：命中需要用户决定的架构 fork；
- `REJECT_V2_A_ROUTE`：Direct route 或合同核心机制被证据否定。

专用 Session 只能提出建议，不能自行接受 Goal。V2-B Contract 只有第一种 disposition 被 Main
和用户正式接受后才可起草。

## 20. User Decisions Required for Contract Acceptance

```yaml
user_decisions_required:
  - decision: accept_V2_A_goal_question_and_exact_two_candidate_semantics
    evidence: accepted V2 Charter requires both isolated candidates from one immutable failed seed and forbids first-pass short-circuit
    options:
      - accept
      - revise
    recommendation: accept
    consequence: deterministic substrate cannot close after exercising only one recovery path

  - decision: accept_public_direct_JsonlSessionRepo_as_preferred_session_route
    evidence: pinned public pi-agent-core exports create/open/fork and current Workbench already uses Direct AgentHarness
    options:
      - accept_with_windows_gate
      - require_SDK_or_Extension_now
    recommendation: accept_with_windows_gate
    consequence: adds only the Session primitive V2 needs while preserving the main route

  - decision: accept_current_temp_copy_as_V2_A_workspace_provider
    evidence: current path-policy/temp-copy is accepted and no concrete worktree scale failure exists
    options:
      - accept
      - require_git_worktree_provider_now
    recommendation: accept
    consequence: avoids unrelated lifecycle complexity while still proving isolation

  - decision: accept_deterministic_budget_and_scenario_matrix
    evidence: wide fail-closed caps avoid V1-style premature closeout while no-retry and exact-two-path rules keep execution bounded
    options:
      - accept
      - revise_caps_or_cases
    recommendation: accept
    consequence: both paths and all selector outcomes must be demonstrated without unlimited loops

  - decision: accept_one_focused_independent_audit_after_candidate_freeze
    evidence: Seed immutability, Session lineage, Workspace isolation and Selection are high-risk boundaries
    options:
      - accept_focused_audit
      - main_review_only
      - broad_audit
    recommendation: accept_focused_audit
    consequence: preserves correctness with one narrow audit rather than repeating V1 process weight

  - decision: accept_V2_A_source_allowlist_and_protected_boundaries
    evidence: listed seams cover deterministic substrate and keep Pi, V0/V1 evidence and control state immutable
    options:
      - accept
      - revise_allowlist_before_activation
    recommendation: accept
    consequence: implementation can proceed without silent scope expansion
```

用户已接受以上全部决定，并同时授权 V2-A Activation、Control Baseline Commit 和 dedicated
Implementation Session。当前正式状态为已激活、实现尚未开始；只有精确 Control Baseline Commit
创建并核验后，专用 Session 才可开始 Gate A。V2-A 最终接受、V2-B、真实调用、网络、凭据、Pi
修改及 SDK/Extension 路线切换均未授权。
