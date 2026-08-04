# V1-A Goal Contract — Deterministic Skill and Experiment Substrate

```yaml
goal_id: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
status: closed_accepted
version: V1_A
date: 2026-08-03
contract_drafting_authorized_by_user: true
accepted_by_user: true
accepted_at: 2026-08-03
contract_accepted: true
activation_authorized: true
activated_by_user: true
activated_at: 2026-08-03
active_goal: false
planning_baseline_commit: 7617ce3f56bc8844a0e7eb3605b4327aa6412932
control_baseline_commit_authorized: consumed
control_baseline_commit: c9f91057db60cf61dab0d3aa305564d498c89cd6
implementation_owner: dedicated_v1_a_implementation_session
implementation_authorized: consumed_and_completed_zero_real_calls
implementation_started: true
implementation_completed: true
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
dependency_installation_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
pi_sdk_rpc_extension_route_authorized: false
external_module_download_or_port_authorized: false
dedicated_session_git_commit_authorized: false
candidate_commit_authorized: consumed
first_failed_audit_candidate: e3ff98948b26187b48af61928b56e7cacb550d31
focused_independent_audit_required_after_candidate_freeze: satisfied
focused_independent_audit_authorized: consumed
focused_independent_reaudit_disposition: PASS_FOCUSED_V1_A_REAUDIT
implementation_baseline_commit_authorized: consumed
implementation_baseline_commit: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
implementation_baseline_tree: 680810b7c2f8b12dbd3503b5a38f1ab162b63996
final_disposition: PASS_V1_A_DETERMINISTIC_SUBSTRATE
closed_at: 2026-08-04
closeout: docs/reports/V1_A_CLOSEOUT.md
V1_B_contract_creation_authorized: false
V1_B_execution_authorized: false
dedicated_session_prompt_authorized: consumed
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
accepted_v0_c_implementation_baseline: 12db75aaea4db4afb774046cfcc94de772a2e90b
accepted_v1_charter: docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md
```

> 本文件是已经完成并关闭的 V1-A Goal Contract。实现由 dedicated V1-A
> Implementation Session 从精确 Control Baseline 完成；Main Session负责审查、
> Candidate 冻结、独立复审和最终验收。V1-A 全程未调用真实模型/外部 Provider，
> 未读取凭据、联网、安装依赖或修改 Pi。V1-B 仍未激活或授权执行。

---

## 1. Mission

V1-A 的唯一使命是：

> 在已接受的 V0 Workbench 上，用固定 Pi 的 public emitted
> `AgentHarness.skill()` 路线建立一个零真实调用、可确定性复核的 Skill 与三路公平
> 实验基础层，使后续 V1-B 能从冻结实现基线比较 Baseline、Skill-only 和
> Skill + External Verifier / Runtime Control，而不需要临场修改源码。

V1-A 必须回答：

1. public emitted Pi Skill symbols 与 `AgentHarness.skill()` 能否在当前固定 Pi、
   Windows 和 strict TypeScript consumer 下被实际消费；
2. Workbench 能否只接受一个 project-owned、tracked、self-contained Skill，固定其
   metadata、source、digest 和 wrapper identity，并在 zero/duplicate/diagnostic/
   link/escape 时 fail closed；
3. A/B/C 能否各使用一个正常 initial Turn，且 B/C initial model-visible payload
   byte-equivalent、没有 Skill preload Turn；
4. Measurement Verifier 能否作为三路共同评分基础，与仅属于 C 的
   Intervention/Recovery treatment 分开；
5. Experiment Manifest、Run membership 和 read-only aggregation 能否在没有
   database/dashboard/scheduler 的情况下拒绝 missing、duplicate、drift、mixed
   revision 和非法 invalid attribution；
6. 后续真实 Pilot 所需的一个固定 DeepSeek composition boundary 能否以 tracked、
   injected、one-use、fail-closed 形式准备好，同时本 Goal 的 credential/network/
   external Provider/model call 保持为 0；
7. 四类候选 Coding Task、统一 Tool/Verifier boundary 和 deterministic calibration
   能否在真实结果出现前准备并固定；
8. V0-A/B/C 的已接受行为与测试能否保持不回写、不破坏。

V1-A 不回答 Skill 或 Runtime 是否改善真实 Coding 成功率；该问题只属于未来单独
授权的 V1-B frozen Pilot。

---

## 2. Authorization and Governance

### 2.1 Unique control sequence

唯一允许的控制顺序是：

```text
V1 bounded research、primary-source Gate 和 Charter 接受
→ V1 Planning Baseline Commit 创建并核验
→ Main Session起草本 V1-A Goal Contract Draft
→ 用户审查并接受/修订正式 V1-A Contract
→ Contract 状态变为 accepted_not_activated，active_goal 仍为 null
→ 用户单独授权 V1-A Activation + Control Baseline Commit
→ Main Session更新 CURRENT_STATE、正式 Contract 和必要控制文件
→ Main Session创建并核验 active_goal: V1_A 的干净 tracked Control Baseline
→ Main Session记录精确 Control Baseline SHA 并生成专用 Session启动 Prompt
→ 新的 dedicated V1-A Implementation Session 从该 SHA 执行 Gate A
→ Implementation Session以零真实调用完成 Candidate、Report 与 Closeout Draft
→ Main Session做有界实现验收，缺陷返回原 Implementation Session返修
→ 用户另行授权 Candidate Audit Baseline Commit
→ Main Session创建冻结 Candidate Commit
→ 新的 focused independent audit Session只审计本 Contract 指定风险
→ finding 返回原 Implementation Session有界返修并按影响范围聚焦复审
→ 用户另行授权 accepted V1-A Implementation Baseline Commit 与控制收口
→ Main Session接受或拒绝 V1-A，并更新 CURRENT_STATE
→ 只有 V1-A closed_accepted 后，Main Session才可起草 V1-B Contract
```

### 2.2 Binding governance rules

1. Contract 接受不等于 Activation。
2. Planning Baseline、Control Baseline、Candidate Commit、focused audit、
   Implementation Baseline 和最终 Closeout 是不同控制点。
3. V1-A 真实模型调用、外部 Provider 调用、凭据读取和外部网络必须恰好为 0。
4. deterministic Faux Provider 可以作为 public Pi route 的测试替身，但必须与
   real-model/external-provider 计数分开记录。
5. 专用 Implementation Session不得修改、暂存或提交：
   - `CURRENT_STATE.md`；
   - 本正式 Contract 的控制状态；
   - `AGENTS.md`；
   - `09_对接执行、文件权威与验收规则.md`；
   - V0/V1 Charter、ADR、accepted Closeout 或其他控制文件。
6. Implementation Session不得创建 Git commit；它只能提交 source、ignored
   evidence、Implementation Report、Closeout Draft 和结构化状态更新建议。
7. Main Session拥有 Contract 解释、架构决定、Candidate 冻结、最终验收和
   `CURRENT_STATE.md` 更新权。
8. focused audit Session不得修源码、修改控制状态、创建 Candidate Commit 或扩大
   为 general V0/Pi/security audit。
9. 实现缺陷必须返回原 Implementation Session有界返修；Main/Audit Session不静默
   修复实现。
10. 本 Contract 不把任何权限传递给 V1-B。

### 2.3 Final accepted stop point

```yaml
pre_activation_planning_baseline: 7617ce3f56bc8844a0e7eb3605b4327aa6412932
control_baseline_commit: c9f91057db60cf61dab0d3aa305564d498c89cd6
implementation_baseline_commit: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
root_tracked_files: clean_at_frozen_candidate_before_closeout
registered_untracked_reference_directory: reference/
pi_HEAD: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_status: clean
V1_charter: accepted
V1_A_contract: closed_accepted
active_goal: null
implementation_owner: dedicated_v1_a_implementation_session
implementation_authorized: consumed_and_completed_zero_real_calls
implementation_started: true
implementation_completed: true
gate_J: passed_after_bounded_correction_and_fresh_focused_reaudit
disposition: PASS_V1_A_DETERMINISTIC_SUBSTRATE
real_model_calls_authorized: 0
real_model_calls_observed: 0
```

本 Contract 已经完成并关闭。历史 Activation、dedicated Session、Candidate、audit
和 correction 过程由最终 Closeout 保留；当前不得重新打开 V1-A，也不得把其授权
传递给 V1-B。

---

## 3. Binding Inputs and Read Order

未来专用 V1-A Implementation Session在运行命令或修改文件前必须完整读取：

1. 根 `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. `docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md`；
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
5. 用户接受后的正式 `V1_A_GOAL_CONTRACT.md`；
6. `docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH.md`；
7. `docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH_MAIN_REVIEW.md`；
8. `docs/reports/V1_SKILL_PRIMARY_SOURCE_MAPPING.md`；
9. `docs/reports/V1_SKILL_PRIMARY_SOURCE_MAPPING_MAIN_REVIEW.md`；
10. `docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md`；
11. `docs/第二项目_Codex交接包_2026-07-30/V0_C_GOAL_CONTRACT.md`；
12. `docs/reports/V0_C_CLOSEOUT.md`；
13. `docs/reports/V0_C_STAGE2_REPLACEMENT_USER_ACCEPTANCE_REPORT.md`；
14. `workbench/` 当前全部源码、测试、scripts、配置和 README；
15. `.upstream/pi/AGENTS.md` 以及进入的子树适用的全部 `AGENTS.md`；
16. 本 Contract §4.3 指定的固定 Pi 源码和测试。

权威顺序：

```text
固定源码 / 测试 / 实际命令
→ CURRENT_STATE / accepted Closeout / ADR
→ accepted V1 Version Charter
→ 用户接受后的正式 V1-A Contract
→ accepted Main-Session research reviews
→ source research / primary-source mapping / reference notes
→ Implementation Session推断
```

如实际 HEAD、Pi、V0 baseline、Contract、适用指令或授权状态不一致，Gate A 失败并
立即 Pause，不得自行修正控制状态。

---

## 4. Fixed Evidence Baseline

### 4.1 Project baseline

**Fact.** V0-A、V0-B、V0-C 均为 `closed_accepted`。V0 已经提供：

- temporary-copy Workspace 与严格路径边界；
- Direct public emitted `AgentHarness` Adapter；
- Task/Strategy/Run/Attempt/Session/Workspace lineage；
- append-only Journal、Session evidence、Evidence Index 和 secret scan；
- external deterministic Verifier、formal Outcome 与 Inspector；
- at most one same-Session Recovery 的 Completion mechanism；
- 一个通过正式 Product Surface 的真实 DeepSeek Run。

Accepted V0-C Implementation Baseline：

```text
12db75aaea4db4afb774046cfcc94de772a2e90b
```

Accepted real Run：

```text
run-c3297fc5-bfd1-4bd1-b46c-3a636271a177
```

该 Run 初始 Verifier 通过，故真实 Recovery、Skill 效果、Runtime-Control 增量和统计
改进均未证明。

### 4.2 Planning baseline

V1-A Contract drafting 固定于：

```text
7617ce3f56bc8844a0e7eb3605b4327aa6412932
```

该 Commit 包含已接受 V1 Charter、V1 Precontract/Primary-source reports、Pi
SDK/Extension 延后兼容提醒和 V0 closeout metadata。它不包含 `reference/`、
`.runs/`、credential、Pi 改动或 V1 implementation。

### 4.3 Pinned Pi public Skill evidence

固定 Pi：

```text
027a5847901b5dde30270abaa1041046cd2b4b55
```

必须优先核验以下 public source/test chain：

| Concern | Source / symbol | Test |
| --- | --- | --- |
| public exports | `.upstream/pi/packages/agent/src/index.ts` | emitted package import Gate to be added by V1-A |
| Skill load/metadata/ignore/source | `packages/agent/src/harness/skills.ts` — `loadSkills`, `loadSourcedSkills`, `loadSkillFromFile` | `packages/agent/test/harness/skills.test.ts` |
| Skill invocation formatting | `skills.ts` — `formatSkillInvocation` | `packages/agent/test/harness/resource-formatting.test.ts` |
| optional catalog formatting | `harness/system-prompt.ts` — `formatSkillsForSystemPrompt` | `packages/agent/test/harness/system-prompt.test.ts` |
| Skill type | `harness/types.ts` — `Skill` | compile/public declaration Gate |
| one-turn invocation | `harness/agent-harness.ts` — `createTurnState`, `prompt`, `skill`, `executeTurn`, `handleAgentEvent` | V1-A emitted Faux end-to-end Gate |
| provider/tool loop | `packages/agent/src/agent-loop.ts` — `runAgentLoop` | V1-A no-extra-turn accounting |

Pinned Pi tests do not currently prove the exact emitted public
`AgentHarness.skill()` Provider/Session route end to end；这是 V1-A 必须关闭的动态未知项，
不是 Pi incapability。

### 4.4 Primary-source boundary

SkillOS arXiv `2605.06614v1` 只支持以下设计分层：

```text
Skill content
≠ selection
≠ invocation/execution
≠ diagnostic/training signal
≠ formal external Outcome
```

V1-A 不实现 SkillOS 的 BM25、RL curator、mutable SkillRepo、LLM Judge 或 lifecycle。
绑定解释为：

```text
training_signal != diagnostic_judge != formal_external_outcome
```

---

## 5. Frozen Design Decisions

V1-A 不得重新打开以下已接受决定：

1. Runtime 使用 Direct public emitted `AgentHarness`；
2. V1 只有 A Baseline、B Skill-only、C Skill + Runtime Control 三条 Strategy；
3. Measurement Verifier 是 A/B/C 共用基础，不是 C treatment；
4. C treatment 只在 host 消费一个 valid failed VerifierResult 并决定 Recovery 时开始；
5. B/C initial model-visible payload 必须 byte-equivalent；
6. A/B 唯一预期模型可见差异是 Pi public formatter 生成的 frozen Skill wrapper/body；
7. Skill 使用 hidden exact-one catalog、`disable-model-invocation: true` 与 explicit
   initial `AgentHarness.skill(skillName, taskInstruction)`；
8. 不先 `prompt()` 再 `skill()`，不存在 Skill preload Turn；
9. first Skill self-contained，不引用相对资源；
10. Task/Model/System Prompt/Tools/Verifier/initial budget 在 matched block 内相同；
11. C 的 policy identity、child reserve 和 experiment identity 是 host-only，不进入
    initial model context；
12. Experiment Manifest immutable，aggregator read-only；
13. treatment-caused invalid 不得从 denominator 中消失；
14. 一个 tracked fixed DeepSeek composition boundary 可以在 V1-A 以 fake injected
    dependencies 实现，但 credential/network/real Provider 调用为 0；
15. SDK、RPC、Extension discovery 和第三方 Pi Package 不进入 V1；
16. V1-A Candidate 在任何真实 V1-B call 前必须通过 focused independent audit。

---

## 6. In Scope

### 6.1 Required implementation surface

V1-A 必须有界实现：

1. public emitted Skill import and invocation adapter；
2. exact-one project-owned Skill loader/preflight boundary；
3. 一个 tracked、self-contained Reliability `SKILL.md`；
4. V1-owned Task、Strategy、SkillRef、Experiment 和 Run-membership contracts；
5. 三个固定 Strategy manifests：A/B/C；
6. one-turn A/B/C deterministic Faux route；
7. B/C initial payload equality 与 A/B expected-delta evidence；
8. all-arm common Measurement Verifier ordering；
9. A/B stop 和 C-only eligible one-child deterministic behavior；
10. immutable Experiment Manifest validation；
11. read-only aggregation and denominator/invalid attribution；
12. one fixed DeepSeek composition/authority/credential injection boundary 的 zero-call
    source and tests；
13. 四类 candidate Coding Task、public checks、external Verifiers 和 reference
    calibration material；
14. V1-A deterministic suite、public import smoke、strict TypeScript 和 V0 regressions；
15. ignored evidence、Implementation Report、Closeout Draft 和状态更新建议。

### 6.2 Allowed writes after Activation

Implementation Session只能修改或创建：

- `workbench/src/**` 中 V1-owned modules，以及实现 V1 Product Surface 所必需的
  最小 shared/CLI adapter changes；
- `workbench/tests/**` 中 V1-A tests 和必要 regression harness；
- `workbench/scripts/**` 中 V1-A deterministic/evidence scripts；
- `workbench/package.json`、`workbench/tsconfig.json`、`workbench/README.md` 的
  必要、无依赖安装的有界更新；
- `fixtures/skills/v1/**`；
- `fixtures/tasks/v1/**`；
- `fixtures/verifiers/v1/**`；
- `fixtures/manifests/v1/**`；
- `fixtures/calibration/v1/**` 或等价的 Agent Workspace 外 calibration material；
- `.runs/v1-a/**` ignored deterministic evidence；
- `docs/reports/V1_A_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V1_A_CLOSEOUT_DRAFT.md`。

文件布局可以根据当前 Workbench 最小调整，但不得借此创建通用 Skill、Provider、Eval
或 plugin platform。所有实际变更必须在 Source Delta 中逐文件说明。

### 6.3 Protected paths and historical semantics

Implementation Session不得修改、暂存、删除、覆盖或生成到：

- `.upstream/pi/**`；
- `reference/**`；
- `.runs/v0-a/**`、`.runs/v0-b/**`、`.runs/v0-c/**` 及所有 G00x evidence；
- `CURRENT_STATE.md`、`AGENTS.md`、正式 Charter/Contract/control rule/ADR；
- accepted V0/G001–G006 reports and Closeouts；
- `fixtures/tasks/v0-a-parse-duration/**`；
- accepted V0 manifests/verifiers；
- `.env`、`.env.*` 或任何 credential file；
- Git index、Git history 或 remote。

允许最小修改现有 Workbench shared source，但不得改变已接受 V0 contract schema、
历史 Run/evidence bytes 或让 V0 tests 静默失效。若必须破坏性改写 V0-owned symbol 或
fixture，立即 Pause 并返回 Main Session。

### 6.4 Out of scope

- V1-B real Pilot、任何真实 Coding Run 或 effect conclusion；
- autonomous Skill discovery/selection、Skill registry/cache/reload/lifecycle；
- LLM Judge、hidden-test generation 或 acceptance mutation；
- arbitrary Provider registry、credential manager 或 model fallback；
- SDK/RPC/Extension runtime、第三方 Pi Package、module port/download；
- Worktree、container、OS sandbox、MCP、Multi-Agent、Godot；
- cross-process Resume、crash durability、exactly-once Tool；
- V2 multi-path、V3 Experience、V4 routing；
- dashboard、SQLite、distributed runner、Eval SaaS；
- package installation、external browsing/download 或 Pi build-boundary redesign。

---

## 7. Session Ownership

### 7.1 Main Session

负责：

- Contract 解释和架构裁决；
- Activation、Control Baseline 和专用 Prompt；
- 实现验收、返修范围、Candidate Commit；
- focused audit 范围和处置；
- V1-A 最终接受/拒绝；
- `CURRENT_STATE.md`、正式 Contract 和控制文件更新；
- 是否进入 V1-B Contract drafting。

### 7.2 Dedicated V1-A Implementation Session

负责：

- Gate A 后的 bounded source/fixture/test implementation；
- deterministic commands 和 raw evidence；
- Source Inventory / Delta / digest；
- Implementation Report 与 Closeout Draft；
- 结构化 `CURRENT_STATE_UPDATE_PROPOSAL`。

不得自行接受 V1-A、修改控制状态、创建 commit、启动 audit 或进入 V1-B。

### 7.3 Focused Independent Audit Session

只在冻结 Candidate SHA 后、经用户单独授权启动。它可以只读检查 Candidate、运行
授权 deterministic regressions、写 audit-local ignored evidence 和 Audit Report；不
修 source、不接受 Goal、不创建 commit。

---

## 8. Architecture Responsibilities

```text
V1 Task/Strategy/Skill/Experiment manifests
→ V1 preflight and identity validation
→ temporary copied Workspace + existing path/tool policy
→ Direct public AgentHarness
   A: prompt(task)
   B: skill(frozenSkill, task)
   C: skill(frozenSkill, task)
→ same external Measurement Verifier
→ A/B terminal OR C valid-failure intervention
→ optional one same-Session child for C only
→ V1 Run membership + immutable evidence
→ read-only aggregation
```

Responsibilities remain separated：

| Layer | Owns | Must not own |
| --- | --- | --- |
| Skill | bounded behavioral instructions and public check guidance | permission, hidden acceptance, credential, budget, Recovery routing |
| Pi Adapter | public Skill/prompt invocation, events, Session/Tool lifecycle | formal Outcome, experiment promotion |
| Workspace/Tool policy | writable/protected path enforcement and copied source | Skill effectiveness decision |
| Measurement Verifier | deterministic environment outcome for every arm | C-only treatment or Skill selection |
| Completion/Intervention | C-only decision after valid failed VerifierResult | changing Verifier or initial payload |
| Experiment layer | membership, identities, planned cells, read-only aggregation | mutating Run evidence or scheduling platform |
| Provider composition | fixed model descriptor, injected authority/credential seam | credential persistence, fallback registry |

---

## 9. Minimum V1 Data Contracts

实现可以选择 TypeScript 文件结构，但必须表达并验证以下语义。

### 9.1 SkillRefV1

```yaml
skill_id: non_empty_stable_id
name: pinned_valid_pi_skill_name
description: non_empty
source_ref: tracked_project_relative_path
canonical_source_path: approved_root_member
source_sha256: exact
source_size_bytes: bounded
disable_model_invocation: true
invocation_mode: explicit_initial_skill
catalog_visibility: hidden
self_contained: true
relative_resources: []
wrapper_sha256: exact_at_preflight
```

不得把 full Skill body 重复写入每个 domain object；tracked source 与 digest 是
authority。Evidence 可以保留审查所需 snapshot/digest，但不能让 Agent 修改 authority。

### 9.2 StrategySpecV1

```yaml
strategy_id: baseline | skill_only | skill_plus_runtime_control
initial_invocation: prompt | skill
skill_ref: null | exact_SkillRefV1
measurement_verifier_id: same_for_matched_block
completion_policy_id: observe_only | verify_recover_once_same_session
recovery_mode: none | same_session_once
initial_budget: same_for_A_B_C
child_reserve: none_for_A_B_or_host_only_for_C
model_visible_policy_fields: []
```

### 9.3 ExperimentManifestV1

```yaml
experiment_id: non_empty
experiment_revision: immutable
protocol_id: exact
task_pack_digest: exact
skill_digest: exact
strategy_digests: exact_three
model_profile_id: fixed
thinking_level: fixed
base_prompt_id_and_digest: exact
tool_profile_id_and_digest: exact
verifier_ids_and_digests: exact
workbench_commit: exact_candidate_or_implementation_baseline
workbench_tree_digest: exact
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
planned_cells:
  - task_id
  - repetition
  - order_slot
  - strategy_id
  - run_id: null_or_terminal_id
  - disposition: planned_or_terminal_or_invalid_or_paused
```

V1-A 使用 deterministic fixture Runs 证明合同；它不填充真实 V1-B outcome。

### 9.4 Run membership and treatment evidence

每个 V1 Run 至少记录：

- non-empty `experiment_id` 与 immutable Manifest ref/digest；
- task/repetition/order/strategy identity；
- source, prompt, Skill, Tool, Verifier, model/profile and Workbench digests；
- initial Workspace digest；
- initial invocation mode and initial model-visible payload digest；
- Skill wrapper/body/input byte counts；
- Attempt/Session/Workspace lineage；
- initial Verifier result；
- C-only recovery eligibility/start/final checkpoint；
- provider/tool/token/time/cost counters with truthful source；
- invalid/infrastructure/treatment attribution；
- terminal evidence refs。

### 9.5 AggregationResultV1

Aggregator 必须只读输出：

- accepted/rejected Manifest and source identities；
- planned/terminal/invalid/paused/missing/duplicate cell counts；
- per-arm initial/final verified results；
- B/C initial payload equality diagnostics；
- C Recovery eligible/started/succeeded counts；
- request/Tool/token/time/cost totals；
- invalid attribution and denominator rules；
- refusal reasons for incomplete/drifted/mixed-revision evidence。

它不得修改 Run、补齐缺失 cell、重跑任务、选择赢家或执行 promotion。

---

## 10. Skill Loading and Windows Path Boundary

Workbench boundary 必须：

1. 只接受一个 configured project-owned Skill root/artifact；
2. 使用 public emitted Pi loader/formatter，不复制或私有导入 Pi implementation；
3. canonicalize approved root 与 candidate file；
4. 在调用 Pi loader 前后都验证 source identity；
5. 对任意 loader diagnostic fail closed；
6. 要求恰好一个 Skill、恰好一个 expected name、description 非空；
7. 要求 `disable-model-invocation: true`；
8. 固定 source bytes/digest/size 和 Pi-formatted wrapper bytes/digest；
9. 拒绝 duplicate file、duplicate name、collision、case alias；
10. 拒绝 symlink、junction/reparse、hardlink alias、dangling link 和 approved root escape；
11. 证明 Windows separator/casing 处理不会让 B/C wrapper 漂移；
12. 禁止相对资源、动态 reload、user/project Extension discovery 和外部 Skill root。

如果 public Pi formatter 产生的 absolute `location` 不能在 B/C 间稳定一致，或必须
通过自定义 wrapper 取代 public semantics 才能继续，应 Pause，不得静默重写。

---

## 11. Treatment Fairness and Verifier Contract

### 11.1 Initial-turn invariants

使用 one-response Faux Provider 捕获并证明：

1. A/B/C 各恰好一个 initial Agent Turn；
2. A/B/C initial 各恰好一个 Provider request；
3. 没有额外 Skill preload Turn；
4. A 使用 `harness.prompt(taskInstruction)`；
5. B/C 使用 `harness.skill(skillName, taskInstruction)`；
6. B/C initial Provider payload byte-equivalent；
7. A/B/C base System Prompt bytes/digest 相同；
8. A/B/C Tool name/schema/description/order 相同；
9. A/B model-visible expected delta 仅为 public Pi Skill wrapper/body；
10. experiment/policy/recovery/budget identity 不进入 initial model context；
11. Session/Journal 可以记录 Skill identity/digest，但不记录 secret/reasoning；
12. Skill overhead bytes/tokens 单独度量，不被“归一化”删除。

B/C 相等是 payload identity Gate，不要求 nondeterministic Outcome 相同。

### 11.2 Verifier and treatment ordering

```text
initial Agent cycle settles
→ same external Measurement Verifier runs once for A/B/C
→ valid VerifierResult persists
→ A/B terminalize without Recovery
→ only C may evaluate intervention eligibility
→ only eligible valid failure may start one same-Session child
→ child settles and Verifier runs once
→ final Run evidence validates and terminalizes
```

Verifier executable/source 必须在 Agent Workspace 外，Task/Verifier digest 固定，
Agent 不可写。A/B/C 使用相同 public check visibility 和相同 hidden external
acceptance。不得声称所有 protected tests 不可读，除非另有独立合同和测试；V1-A 不
新增该处理。

### 11.3 Deterministic controller cases

V1-A 至少证明：

- A initial pass/fail 均停止；
- B initial pass/fail 均停止；
- C initial pass 停止；
- C valid eligible failure 恰好创建一个 child；
- C invalid verifier/evidence、infrastructure、cancel、budget exhausted 不创建 child；
- C child 后永不创建 ordinal 3；
- C initial/final 是 checkpoints，不是第四 Strategy。

---

## 12. Experiment Identity and Read-only Aggregation

### 12.1 Manifest rules

- Manifest 必须在任何 V1-B real result 前冻结；V1-A 创建 deterministic candidate；
- experiment ID 非空且每个 Run 双向 cross-check；
- planned cell 不得静默删除、覆盖或换 Run；
- source/Task/Skill/Strategy/Tool/Verifier/model/Workbench/Pi identity 全部可复核；
- 每个 Run 独立 write-once；
- scenario/fault injection 只存在于 test fixture，不进入 real protocol manifest。

### 12.2 Invalid attribution

Aggregator 至少区分：

```text
treatment-caused invalid
treatment-independent infrastructure invalid
evidence invalid
paused before execution
terminal task outcome
```

只有预先定义的 treatment-independent infrastructure/evidence invalid 才可以从比较
denominator 排除。Skill/Runtime 导致的 policy、budget、protected-path、terminalization
或 evidence failure 必须保留在对应 arm guardrail 中。

### 12.3 Required rejection fixtures

Aggregator 必须拒绝：

- empty/mismatched experiment ID；
- missing planned cell；
- duplicate cell or Run membership；
- changed Task/Skill/Strategy/Verifier digest；
- mixed Pi/Workbench revision；
- nonterminal Run treated as success；
- treatment-caused invalid silently excluded；
- Run evidence mutated by aggregation；
- C child without eligible initial failure；
- retry/replacement not declared by Manifest revision。

---

## 13. Provider, Credential and Authority Boundary

V1-A 必须 tracked 一个 bounded future V1-B composition seam：

```text
fixed DeepSeek profile descriptor
+ public Pi Provider / AgentHarness handle factory
+ externally injected opaque credential resolution
+ one-use execution authority
+ frozen request/tool/token/time/cost envelope
+ redacted usage/cost evidence projection
```

本 Goal 只用 non-secret fake dependencies 测试，且必须证明：

- 默认无 authority/dependency 时 fail before formal runtime identity；
- dry-run/preflight 不读取 credential、不 dispatch HTTP；
- credential value 不进入 domain/evidence/error/log；
- authority 恰好消费一次，不能 reuse/retry；
- alternate model/fallback/retry 为 false；
- model profile fixed，不枚举 registry；
- external Provider/model/network counts 为 0；
- `network_calls` 不再作为误导性真实调用 denominator；V1-owned output 使用可证明的
  Provider request/response/usage/cost evidence。

若实现需要真实 credential、外部 API checkpoint、model-data hydration、dependency
install 或 provider catalog discovery，立即 Pause。这些只属于未来 V1-B preflight。

---

## 14. Candidate Task Pack and Calibration

V1-A 必须准备四类 bounded TypeScript Coding Task candidate：

1. normal bounded bug fix；
2. 容易遗漏真实 edge case、public check 有帮助而 external Verifier 更强；
3. 必须运行 declared public check 才容易发现问题；
4. scope-constrained，修改 protected config/tests 属于 invalid shortcut。

每个 Task candidate 必须：

- 使用当前 bounded Tool Profile 可以完成；
- 无 install、network、Git、raw shell text 或外部服务需求；
- source/instruction/writable/protected paths 固定；
- public check 对所有 arm 相同；
- external deterministic Verifier 位于 Workspace 外；
- reviewed reference patch 仅用于 solvability calibration，不进入 Agent Workspace；
- unmodified source 在设计要求失败处失败；
- reference patch 通过 Verifier；
- Verifier 重复执行结果和 exit behavior deterministic；
- 不泄露 hidden answer/Verifier；
- 不使用 style-only、LLM Judge、含糊 acceptance 或人为强迫 Recovery 的 defect。

V1-A 不根据真实模型结果删改 Task；V1-B Contract 才冻结最终 Pilot Manifest。

---

## 15. Budget and Execution Limits

### 15.1 Goal-wide hard boundary

```yaml
real_model_calls: 0
external_provider_calls: 0
credential_reads: 0
external_network_requests: 0
dependency_installs: 0
pi_core_patches: 0
private_pi_imports: 0
external_module_downloads_or_ports: 0
git_commits_by_dedicated_session: 0
```

### 15.2 Deterministic runtime caps

对于每个 deterministic V1-A fixture Run：

```yaml
initial_attempts_max: 1
child_attempts_max: 1_for_C_only
attempt_ordinal_max: 2
verifier_runs_max: 2_for_C_else_1
faux_provider_requests_max: 16_per_run
tool_calls_max: 24_per_run
wall_time_ms_max: 900000_per_run
formal_cost_usd: 0
```

这些是 test safety caps，不是未来 V1-B 预算。若实现需要更高 deterministic cap，必须
在执行前 Pause 并说明具体 fixture、原因和最小修订，不得自行提高。

---

## 16. Evidence and Secret Boundaries

`.runs/v1-a/` 必须 ignored、append-oriented、不得覆盖 accepted V0 evidence。至少生成：

- Control Baseline identity；
- Source Inventory 与 baseline-to-candidate Source Delta；
- Workbench/fixture tree digest；
- public emitted Skill import evidence；
- exact-one loader/path/diagnostic cases；
- one-turn and treatment-isolation digest evidence；
- B/C payload equality result；
- Verifier/intervention ordering cases；
- Manifest/aggregation acceptance and rejection fixtures；
- provider seam zero-call/authority tests；
- task calibration evidence；
- strict TypeScript and V0/V1 regression results；
- protected-path/source-byte identity；
- credential/secret/reasoning scan；
- root/Pi HEAD and status；
- `EVIDENCE_INDEX.md` linking every Gate to exact artifact/command。

不得持久化：

- credential value/header；
- hidden chain-of-thought/reasoning；
- user home secret material；
- external Verifier source inside Agent Workspace；
- mutable aggregate that replaces raw Run evidence。

Skill body、Task instruction、Tool schema 和 public checks 是 tracked project input，可
记录 exact digest/byte snapshot；仍须避免把未公开 hidden acceptance 混入 model-visible
payload。

---

## 17. Deterministic Test Matrix

至少覆盖以下 cases：

### 17.1 Public Pi route

- emitted public import for `AgentHarness` and Skill helpers；
- `AgentHarness.skill()` one-turn Provider/Session route；
- no preload Turn and settled lifecycle；
- no private import or Pi patch。

### 17.2 Loader and path

- valid exact-one `SKILL.md`；
- missing/invalid description；
- invalid name/parent mismatch；
- `disable-model-invocation` mismatch；
- duplicate file/name/collision；
- loader diagnostic fail closed；
- source digest/byte drift；
- symlink/junction/reparse/hardlink/dangling/escape；
- Windows case and separator alias；
- relative resource rejected。

### 17.3 Fairness and controller

- A prompt, B/C skill；
- A/B/C one initial request；
- B/C payload byte equality；
- A/B expected Skill-only delta；
- common system prompt/tools/verifier/budget identity；
- policy/experiment identity hidden from model；
- A/B stop, C pass stop, C eligible failure one child；
- invalid/budget/infrastructure/cancel no child；
- no ordinal 3。

### 17.4 Experiment and aggregation

- valid immutable Manifest and membership；
- missing/duplicate/drift/mixed revision rejection；
- invalid attribution denominators；
- read-only aggregate does not mutate Runs；
- planned cells remain accountable。

### 17.5 Provider seam and task calibration

- no-authority fail closed；
- fake injected authority one-use；
- dry-run zero credential/network/provider；
- no secret in evidence/error；
- four Task candidates calibrated；
- Verifier repeatability；
- reference patch pass/unmodified expected fail；
- protected input identity。

### 17.6 Regression

- strict TypeScript consumer；
- all applicable V0-A/B/C tests；
- V0-C deterministic suite；
- public CLI/inspect behavior not silently regressed。

Implementation Report 必须记录实际命令、cwd、exit code、test count 和 duration；不得
只写“通过”。

---

## 18. Gates

### Gate A — Control baseline and source identity

- root HEAD 等于启动 Prompt 固定的 Control Baseline；
- tracked files clean；已登记未跟踪 `reference/` 可以存在但不得修改；
- Pi HEAD 精确且 clean；
- formal Contract `accepted_activated`、`active_goal: V1_A`；
- `.runs/v1-a/` 只在 Gate A 后创建；
- protected inputs byte identity recorded。

### Gate B — Public emitted Skill route

- public import/typecheck pass；
- emitted `AgentHarness.skill()` one-turn Faux Provider/Session route pass；
- no private import、Pi patch、SDK/RPC/Extension route。

### Gate C — Exact-one Skill and Windows path boundary

- metadata/source/digest/wrapper identity pass；
- all diagnostics fail closed；
- duplicate/collision/link/escape/alias cases pass；
- self-contained/no-relative-resource rule pass。

### Gate D — Three-arm treatment isolation

- A/B/C one initial Turn/request；
- no preload；
- B/C payload byte-equivalent；
- A/B delta only Skill wrapper/body；
- common System Prompt/Tools/Task/Verifier/initial budget identity；
- host-only identities absent from initial model context。

### Gate E — Measurement and bounded intervention

- same Verifier after every initial Attempt；
- A/B never Recovery；
- only eligible failed C creates one child；
- invalid/budget/infrastructure/cancel no child；
- no ghost child/ordinal 3；
- initial/final checkpoints remain one C Strategy。

### Gate F — Experiment identity and aggregation

- immutable Manifest/membership pass；
- read-only aggregate pass；
- rejection fixtures pass；
- invalid attribution/denominator rules pass；
- no database/scheduler/promotion behavior。

### Gate G — Provider/credential boundary

- tracked fixed composition seam exists；
- fake injection/one-use authority pass；
- default fail-closed and dry-run pass；
- real calls/network/credential reads all 0；
- no registry/fallback/retry/secret persistence。

### Gate H — Task pack and regression

- four candidate Task families and deterministic calibration pass；
- strict TypeScript pass；
- applicable V0 and V1 tests pass；
- V0 source/evidence semantics not rewritten；
- protected source/fixture identity pass。

### Gate I — Evidence and dedicated-session closeout

- Evidence Index covers Gates A–H；
- Source Inventory/Delta/digests exact；
- commands/exit codes/test counts complete；
- secret/reasoning scan pass；
- reports and `CURRENT_STATE_UPDATE_PROPOSAL` complete；
- dedicated Session did not modify control files or create commit。

### Gate J — Focused independent audit

Gate J 不由 Implementation Session完成。它只在 Main Session审查 Candidate、用户授权
Candidate Commit 与 focused audit 后执行。V1-A 最终接受要求 Gate J pass，或所有
finding 经有界返修和聚焦复审关闭。

---

## 19. Definition of Done

V1-A Candidate 至少满足：

1. Gates A–I 全部通过；
2. public emitted Skill symbols and `AgentHarness.skill()` route dynamically pass；
3. exact-one Skill loader/preflight fail closed；
4. Windows path/wrapper identity Gate pass；
5. one tracked self-contained Reliability Skill exists；
6. A/B/C Strategy identity and semantics fixed；
7. B/C initial payload byte-equivalent；
8. no extra Skill Turn；
9. common Measurement Verifier ordering pass；
10. B stop versus C conditional one-child pass；
11. structured Skill/Task/Strategy/Experiment identities validated；
12. immutable Manifest and read-only aggregator rejection matrix pass；
13. treatment-caused invalid attribution remains visible；
14. tracked fixed-provider seam exists and zero-call authority tests pass；
15. four candidate Tasks and deterministic calibration pass；
16. real model/provider/network/credential count equals 0；
17. Pi patch/private import/external module count equals 0；
18. strict TypeScript and applicable V0/V1 regression suites pass；
19. protected V0 inputs/evidence remain unchanged；
20. Evidence Index、Source Inventory/Delta、commands and scans complete；
21. Implementation Report、Closeout Draft 和 state proposal complete；
22. no Skill/Runtime effectiveness claim is made。

V1-A final acceptance additionally requires：

23. Main Session bounded implementation review passes；
24. exact Candidate SHA/digest frozen；
25. Gate J focused audit passes or findings are closed by bounded correction/review；
26. user and Main Session accept `PASS_V1_A_DETERMINISTIC_SUBSTRATE`；
27. accepted Implementation Baseline Commit and final control state are recorded。

V1-A 完成不要求任何真实 Skill success、真实 Recovery 或 V1-B result。

---

## 20. Required Deliverables

### 20.1 Dedicated Implementation Session

必须提交：

1. authorized bounded Workbench/fixture/test source；
2. `.runs/v1-a/evidence/EVIDENCE_INDEX.md`；
3. deterministic Run/test artifacts for Gates B–H；
4. `docs/reports/V1_A_IMPLEMENTATION_REPORT.md`；
5. `docs/reports/V1_A_CLOSEOUT_DRAFT.md`；
6. exact Source Inventory；
7. Control-Baseline-to-Candidate Source Delta；
8. Workbench/fixture tree digests；
9. exact commands、cwd、exit codes、counts and durations；
10. root/Pi HEAD and status；
11. Faux versus external Provider call counts；
12. credential/network/model call counts；
13. protected-path/source identity result；
14. secret/reasoning scan；
15. structured `CURRENT_STATE_UPDATE_PROPOSAL`。

`CURRENT_STATE_UPDATE_PROPOSAL` 至少给出：

```yaml
proposed_project_status:
proposed_active_goal:
implementation_started:
implementation_completed:
gates_A_through_I:
definition_of_done_candidate_count:
candidate_disposition:
source_digest:
authoritative_deterministic_evidence:
real_model_calls_observed:
external_provider_calls_observed:
credential_reads_observed:
pi_core_patch_count:
private_import_count:
unverified_or_audit_pending:
recommended_next_control_action:
```

### 20.2 Focused Audit Session

必须提交：

- `docs/reports/V1_A_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`；
- audit-local ignored evidence；
- exact Candidate SHA/tree digest；
- findings with severity、file、symbol、test and evidence；
- exact commands and exit codes；
- `PASS_FOCUSED_V1_A_AUDIT`、`REQUEST_BOUNDED_CORRECTION` 或
  `PAUSE_FOCUSED_V1_A_AUDIT`。

Audit Session不得写 V1-A Closeout、修源码、创建 commit 或更新控制状态。

---

## 21. Focused Independent Audit Scope

审计只覆盖：

1. public Skill body/wrapper and A/B/C treatment isolation；
2. B/C initial payload equality and absence of hidden policy identity；
3. exact-one Skill source/path/diagnostic/collision boundary；
4. Windows alias/link/escape guardrails affected by V1 Skill source；
5. Experiment membership/source identity/immutable aggregation；
6. invalid attribution and denominator integrity；
7. hidden Verifier/protected path boundary；
8. Provider authority/credential/evidence seam；
9. C-only intervention and no ghost/extra child；
10. necessary V0 regressions。

不得扩展到：

- general Pi or V0 re-audit；
- broad Windows filesystem/security review；
- real Provider/API/model test；
- Skill effectiveness or statistical methodology review；
- V1-B execution；
- SDK/Extension/Worktree compatibility；
- V2/V3 architecture；
- generic DLP、sandbox、durability or platform design。

---

## 22. Pause Conditions

任何 Session遇到以下情况立即停止并提交 Pause Report：

1. root/Control Baseline/Pi identity or tracked cleanliness mismatch；
2. applicable `AGENTS.md`、Charter、Contract 或用户授权冲突；
3. public Skill route requires private import、Pi Core patch、SDK、RPC、Extension 或
   third-party Pi Package；
4. dependency installation、external download/network 或 model-data hydration becomes
   necessary；
5. loader diagnostic cannot fail closed or exact-one Skill cannot be proven；
6. Windows wrapper/path identity cannot be stable without replacing public Pi semantics；
7. B/C initial model-visible payload cannot be byte-equivalent；
8. A/B/C Task/Model/System Prompt/Tools/Verifier/initial budget drifts；
9. hidden acceptance、Verifier source、credential、secret or reasoning leaks；
10. Agent can modify verifier/tests/acceptance/protected material；
11. C Recovery starts before valid failed VerifierResult or can create more than one child；
12. Manifest/membership/source identity cannot be proven or aggregator must mutate evidence；
13. general Skill/provider/eval platform becomes a prerequisite；
14. fixed provider seam requires real credential/API/fallback/retry；
15. any real model/external Provider/network/credential read occurs；
16. accepted V0 behavior/regression fails and cannot be corrected without broad V0 rewrite；
17. four Task candidates cannot be calibrated within current bounded Tool Profile；
18. `reference/`、accepted evidence、Pi or control files are modified；
19. implementation expands into V1-B, V2/V3 or SDK/Extension compatibility；
20. deterministic per-Run hard cap in §15.2 is exceeded。

Pause Report 只说明 observation、evidence、why blocking、minimal options 和 required user
decision；不得在报告中自行扩大 Contract。

---

## 23. Claims Allowed / Not Allowed

### 23.1 Allowed only after V1-A final acceptance

- 固定 Pi public emitted `AgentHarness.skill()` 可被 Workbench 动态消费；
- project-owned exact-one Skill source/path/digest/diagnostic boundary 已确定性验证；
- A/B/C initial treatment isolation 和 B/C payload identity 已确定性验证；
- common Verifier 与 C-only intervention 在 Faux scenarios 中按合同运行；
- immutable Experiment Manifest/read-only aggregation 可拒绝指定 invalid evidence；
- fixed provider composition seam 在零凭据、零网络、零真实调用条件下可测试；
- V1-B 拥有一个经审计的 deterministic implementation candidate。

### 23.2 Not allowed

- Skill 提高真实 Coding 成功率；
- Runtime Control 优于 Skill-only；
- DeepSeek real Skill path 已通过；
- 真实失败后的 Recovery 已成功；
- V1 comparison、Pilot 或统计证据已经完成；
- SkillOS 证明本 Skill 有效；
- Permission boundary 等于 OS Sandbox；
- SDK/Extension/Worktree 已兼容或被采用；
- V2/V3 已实现；
- V1-A 是通用 Skill/Provider/Eval platform。

---

## 24. Closeout Dispositions

Main Session只能选择：

```text
PASS_V1_A_DETERMINISTIC_SUBSTRATE
REQUEST_BOUNDED_V1_A_CORRECTION
PAUSE_V1_A_FOR_USER_DECISION
REJECT_V1_A_CANDIDATE
```

- `PASS` 要求 Gates A–J、final DoD、focused audit 和用户接受全部满足；
- `REQUEST_BOUNDED_CORRECTION` 必须列出具体 finding、owner、允许文件、regressions
  和停止条件；
- `PAUSE` 用于需要新授权、架构选择或 materially expanded scope；
- `REJECT` 保留 evidence，不静默改路线或直接进入 V1-B。

---

## 25. Final Accepted Closeout State

当前 Contract 已完成并正式关闭：

```yaml
planning_baseline_commit: 7617ce3f56bc8844a0e7eb3605b4327aa6412932
contract_status: closed_accepted
contract_accepted: true
activation_authorized: true
active_goal: null
control_baseline_commit: c9f91057db60cf61dab0d3aa305564d498c89cd6
implementation_owner: dedicated_v1_a_implementation_session
implementation_authorized: consumed_and_completed_zero_real_calls
implementation_started: true
implementation_completed: true
candidate_commit: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
gate_J: passed_after_bounded_correction_and_fresh_focused_reaudit
disposition: PASS_V1_A_DETERMINISTIC_SUBSTRATE
implementation_baseline_commit: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
real_model_calls_authorized: 0
real_model_calls_observed: 0
next_control_action: draft_bounded_V1_B_goal_contract_for_user_review
```

V1-A 的 Scope、证据和实现基线已经冻结，不得在 V1-B 起草或执行时静默改写。
V1-B Contract 接受、Activation、真实模型、credential/network 和 Pilot budget 仍是
独立控制点。
