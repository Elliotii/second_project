# V1 Version Charter — Skill / Runtime / Verifier Layered Reliability Experiment

```yaml
status: accepted
date: 2026-07-31
accepted_by_user: true
formalized_at: 2026-08-03
version: V1
project: Agent Harness Reliability Workbench
version_mission: fairly_measure_fixed_Skill_and_bounded_Runtime_Control_increment
current_project_phase: v1_b_stage_1_activated
active_goal: V1_B_FROZEN_BOUNDED_REAL_PILOT
V1_A_contract_status: closed_accepted
V1_B_contract_created: true
V1_B_activation_authorized: true
implementation_authorized: stage_1_only_zero_real_calls
real_model_calls_authorized: 0
pi_core_patch_authorized: false
external_download_authorized: false
git_commit_authorized: false
accepted_goal_count: 2
V1_B_integrated_plan: docs/reports/V1_B_INTEGRATED_DEVELOPMENT_PLAN.md
V1_B_integrated_plan_status: accepted
portfolio_north_star_after_V1: V2_failure_aware_bounded_multi_path_recovery
```

> 本文件是用户已接受的 V1 Version Charter。它冻结 V1 版本语义、边界、Goal
> 切分和版本级预算上限，但不创建 Goal、不授权 Activation、实现、真实模型调用或
> Git commit。

## 1. Version Mission

V1 的任务不是证明“Runtime 一定优于 Skill”，而是在同一 V0 Workbench 基础上
公平回答：

```text
固定的 Reliability Skill 能解决多少问题？
外部环境测量本身与 Runtime 干预应如何分开？
一次有界 same-Session Recovery 带来什么额外结果和成本？
结果是否足以 Promote、Revise、Reject，或只能 INCONCLUSIVE？
```

V1 必须比较三条产品 Strategy：

```text
A. Baseline
B. Skill-only
C. Skill + External Verifier / Runtime Control
```

其中 External Measurement Verifier 是所有 Strategy 共用的评分基础，不是 C
独有的 treatment。C 的 Runtime-Control treatment 只在 host 消费一个有效失败
VerifierResult 并决定是否发起一次 Recovery 时开始。

## 2. Current Evidence Baseline

### 2.1 Accepted V0 facts

- V0-A、V0-B、V0-C 均为 `closed_accepted`；
- V0-C disposition 为 `PASS_V0_C_USER_ACCEPTANCE`；
- V0-C Implementation Baseline 为
  `12db75aaea4db4afb774046cfcc94de772a2e90b`；
- accepted real Run 为
  `run-c3297fc5-bfd1-4bd1-b46c-3a636271a177`；
- 该 Run 的 initial Verifier 通过，因此真实 Recovery 仍未观察；
- V0 没有证明 Completion Policy 效果或统计提升；
- Pi Core patch 为 0，Direct public `AgentHarness` 仍是运行主路径。

### 2.2 Pi Skill source facts

固定 Pi Commit：

```text
027a5847901b5dde30270abaa1041046cd2b4b55
```

Pinned source 已证明：

- package root 公开导出 `AgentHarness`、Skill loaders/formatters 和 types；
- `AgentHarness.skill(name, task)` 与 `prompt(task)` 都进入一个普通
  `executeTurn()`，不必增加 preload Turn；
- Skill wrapper/body 会增加模型可见输入和 token/cost；
- Direct loader 支持 discovery 和 metadata/body parsing，但 host 负责 source、
  collision、diagnostic、reload 与 trust policy；
- `AgentHarness.skill()` 的 emitted public end-to-end Provider/Session route 尚未被
  pinned tests 直接动态证明；
- Windows Skill path projection 存在需要 V1-A 验证的具体风险。

### 2.3 Primary-source Gate

`SkillOS: Learning Skill Curation for Self-Evolving Agents`
（arXiv:2605.06614v1）已经完成 canonical identity、PDF integrity 和项目映射
验收。

Primary-source transfer 只接受：

- Skill content、selection、execution、evaluation 分层；
- frozen executor/common environment 的公平对照；
- selected content 必须进入真实 execution；
- downstream environment outcome 强于 acting-model self-claim；
- lifecycle 需要跨任务证据，不能由同任务自评确认。

V1 不采用 SkillOS 的 BM25、RL curator、mutable SkillRepo、insert/update/delete、
grouped training 或 LLM Judge。

## 3. V1 Scope and Product Surface

V1 在 V0 Product Surface 上增加的最小能力：

1. 一个 project-owned、tracked、self-contained Reliability `SKILL.md`；
2. Baseline / Skill-only / Skill+Runtime 三条 V1-owned Strategy；
3. public Pi `AgentHarness.skill()` initial invocation；
4. 非空 experiment identity 和 immutable Experiment Manifest；
5. 多个独立 Run 的只读 aggregation；
6. 一个 tracked、固定 DeepSeek profile 的 bounded provider composition；
7. 一个冻结的小型 Coding Task pack；
8. descriptive Skill/Runtime comparison report。

V1 不修改 V0 历史 Run、Schema、证据或 accepted Closeout。V1 新增 V1-owned
contracts/adapters/fixtures，并尽量复用 V0 已接受的 Workspace、Tool、Session、
Journal、Verifier、Outcome、Evidence、Inspect 和 Completion Controller。

### 3.1 Frozen V1 runtime surface

V1 的唯一执行 Runtime 是固定 Pi 公共 emitted package 的 Direct
`AgentHarness`。V1-A 和 V1-B 均不得静默改用 `pi-coding-agent` SDK、RPC、Pi
Extension runtime 或第三方 Pi Package，也不得通过用户级、项目级或临时 Extension
discovery 改变 System Prompt、Tools、Tool Call、Tool Result 或 Provider payload。

```yaml
v1_runtime_surface:
  runtime: direct_public_emitted_AgentHarness
  pi_coding_agent_SDK_used: false
  pi_RPC_used: false
  pi_extension_discovery_used: false
  third_party_pi_packages_used: false
  frozen_skill_source: project_owned_tracked_SKILL_md
```

这不是对 SDK/Extension 的否定。它们是 V1 产生可进入真实 Pi 使用形态的 Policy
后，或 V2 clean-Session / clean-Workspace Contract 前的延后兼容候选；该检查点不
属于 V1 treatment、DoD 或当前实现范围。

## 4. Strategy and Treatment Semantics

### 4.1 A — Baseline

```yaml
strategy_id: v1_baseline
skill_ref: null
initial_invocation: AgentHarness.prompt(task_instruction)
measurement_verifier: common
failed_valid_initial_result: stop_without_feedback
recovery_budget: 0
```

### 4.2 B — Skill-only

```yaml
strategy_id: v1_skill_only
skill_ref: frozen_reliability_skill
initial_invocation: AgentHarness.skill(skill_name, task_instruction)
measurement_verifier: common
failed_valid_initial_result: stop_without_feedback
recovery_budget: 0
```

### 4.3 C — Skill + Runtime Control

```yaml
strategy_id: v1_skill_runtime_recover_once
skill_ref: same_frozen_reliability_skill_as_B
initial_invocation: AgentHarness.skill(skill_name, task_instruction)
measurement_verifier: common
failed_valid_initial_result: bounded_completion_decision
recovery_budget: 1
recovery_mode: same_session_same_workspace
```

### 4.4 C analytical checkpoints

```text
C-initial
  initial Attempt + common Verifier + decision point

C-final
  optional child Attempt + second common Verifier
  or initial result when no child is eligible/started
```

`C-initial` / `C-final` 不是第四条 Strategy，不增加独立 randomized arm。

本 Charter 中的 `Runtime Control` 专指 Workbench host 在读取有效失败的外部
VerifierResult 后，依据 eligibility、Stop Policy 和 Recovery Budget 作出的
`stop` / `recover_once` 决策；它不指 Pi Extension、SDK Session Runtime 或第三方
权限/恢复 Package。

## 5. Fairness Contract

每个 task/repetition block 的 A/B/C 必须固定相同：

- TaskSpec、instruction bytes、source tree digest；
- writable/protected paths 和 copied Workspace provider；
- model/provider/version/thinking/decoding policy；
- base System Prompt ID、digest 和 bytes；
- Tool Profile、schemas、descriptions、permission/path policy；
- external Measurement Verifier ID、digest、snapshot、timeout/output cap；
- initial Attempt request/Tool/token/wall-time/cost allocation；
- Pi package/Commit 和 Workbench Implementation Baseline；
- Outcome precedence、terminalization、evidence scan 和 invalid rules。

唯一 intended model-visible A→B delta：

```text
Pi Skill invocation wrapper
+ frozen Skill body
```

B→C 在 initial Verifier 之前不得有 model-visible delta。以下必须保持 host-only：

- Strategy/Policy/Experiment identity；
- Recovery reserve；
- future Failure Packet；
- C-only decision semantics。

### 5.1 Required deterministic fairness Gate

V1-A 使用 one-response Faux Provider 证明：

1. A/B/C 各只有一个 initial Turn 和一个 initial Provider request；
2. 没有 Skill preload Turn；
3. B/C initial provider payload byte-equivalent；
4. A/B/C base System Prompt 与 Tool schemas byte-equivalent；
5. A/B 唯一模型可见差异是 frozen Skill treatment；
6. policy/experiment identity 不进入模型 context；
7. all arms 使用同一个 Measurement Verifier；
8. A/B 在失败 measurement 后停止；
9. 只有 C 可以创建 child Attempt；
10. Session/Journal/Evidence 中 Skill identity/digest 可关联且无凭据/reasoning
    泄露。

真实 B/C initial Outcome 不要求相等；模型随机性不是自动 fairness failure。

## 6. Reliability Skill Contract

### 6.1 Frozen V1 Skill semantics

```yaml
owner: project
format: SKILL.md
source_count: 1
catalog_visibility: hidden
disable_model_invocation: true
selection: host_explicit_exact_one
invocation: AgentHarness.skill_as_initial_turn
relative_resources: forbidden
scripts_or_executable_resources: forbidden
held_constant_between: [B, C]
```

### 6.2 Required identity

- `skill_id`；
- canonical project source path；
- source reference；
- SHA-256；
- byte length；
- metadata；
- complete formatted wrapper digest；
- projected token estimate；
- experiment revision。

### 6.3 Host fail-closed requirements

V1 host 必须拒绝：

- zero or multiple Skill results；
- any Pi loader diagnostic；
- invalid name/description/parent identity；
- duplicate/collision；
- symlink、junction/reparse、hardlink 或 real-path escape；
- digest/byte drift；
- relative resource；
- source outside approved project-owned root；
- Windows path representation 不能生成稳定正确 wrapper。

Pi loader warning 不等于 Pi 已经拒绝 Skill；拒绝策略属于 Workbench host。

### 6.4 Candidate behavioral content

Skill 应指导 Agent：

- 修改前检查任务和相关 Workspace 文件；
- 识别 writable/protected boundary；
- 只做最小充分修改；
- 只使用 host 提供的 Tool 和 command ID；
- 修改后执行 declared public check；
- public check 失败时在当前 initial Attempt/budget 内继续检查和修复；
- 检查最终 diff/change projection；
- 不修改 tests、verifier、manifest、package/control files 或 protected paths；
- check 未执行或失败时不得声称成功；
- 无法完成时报告诚实的 bounded failure。

Skill 不包含 hidden acceptance、Verifier implementation、Outcome、Failure
Taxonomy、permission、credential、budget enforcement、Recovery eligibility、
Failure Packet、child creation、aggregation 或 promotion policy。

## 7. Measurement, Intervention and Outcome

V1 明确三层：

```text
Measurement Verifier
  A/B/C 每个 settled initial Attempt 后相同执行

Completion / Intervention Gate
  消费有效 VerifierResult + policy/budget state
  只对 C 决定 stop 或 recover_once

Recovery Action
  只对 eligible failed C initial Attempt
  同 Session/Workspace 中一个 child Attempt
```

### 7.1 Evidence terminology

V1 文档和数据必须区分：

```text
training_signal
diagnostic_judge
formal_external_outcome
```

V1 不实现 training signal 或 LLM diagnostic judge。正式 Outcome 只由外部
environment-level deterministic Verifier 产生，不读取 Agent 的 success claim。

### 7.2 Outcome and invalid attribution

V0 Outcome precedence 继续有效。V1 另外要求：

- treatment-independent infrastructure/evidence invalid 可以从效果成功率分母
  排除，但必须保留在 planned/started/invalid 统计；
- 由 Skill/Runtime 行为引发的 forbidden mutation、budget overrun、invalid
  completion、evidence corruption 或 boundary violation 必须计入对应 arm 的
  guardrail/failure；
- 分类和 denominator 必须在真实 Run 前冻结；
- rerun 使用新 Run ID，原证据不可覆盖。

具体 Failure Taxonomy 由用户审查 Charter 后在 V1-B Contract 前冻结，不得由
执行 Session看到结果后决定。

## 8. Experiment Identity and Aggregation

V1 使用非 Pair-specific 的 immutable Experiment Manifest：

```yaml
schema_version: 1
experiment_id: v1-<uuid>
protocol_id: v1_skill_runtime_pilot_v1
protocol_sha256: <sha256>
task_set_sha256: <sha256>
strategy_ids:
  - v1_baseline
  - v1_skill_only
  - v1_skill_runtime_recover_once
model_profile_id: <fixed>
thinking_level: <fixed>
workbench_commit: <exact>
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
planned_cells:
  - task_id: <id>
    repetition: <n>
    order_slot: <n>
    strategy_id: <id>
    run_id: null_or_completed_id
    disposition: planned_or_terminal_or_invalid_or_paused
```

规则：

- 每个 V1 Run 自带同一个非空 `experiment_id`；
- Manifest 与 Run membership 双向核验；
- planned cells 在真实结果前冻结；
- 每个 Run 独立、write-once；
- aggregator 只读验证 terminal evidence，不修改 Run；
- aggregator 拒绝 missing、duplicate、drifted、mixed-revision、identity mismatch
  和未按规则处置的 invalid Run；
- 不增加 database、scheduler、Pair object、dashboard 或 promotion system。

## 9. Provider and Credential Boundary

V1 候选真实 profile 延续 V0 已验证的固定 DeepSeek V4 Flash 路线；V1-B
preflight 必须重新核验当时的精确 model descriptor 和官方 API 可用性。

V1-A 必须在 zero-call candidate 中 tracked：

```text
one fixed DeepSeek profile
+ public Pi provider / AgentHarness handle factory
+ one-use execution authority
+ externally injected opaque credential resolution
+ frozen budget envelope
+ redacted request/usage/cost evidence
```

不得：

- 枚举 arbitrary providers；
- 在 domain/evidence object 中读取或保存 credential value；
- 建设 `.env` registry 或 credential manager；
- fallback/retry 到其他 model；
- 安装/下载依赖或 model data；
- 绕过 one-use authority；
- 把 V0 ignored UAT composition 当作 tracked implementation。

V1-A 使用 non-secret fake dependencies 测试这条 boundary，真实 credential /
network/Provider/model call 均为 0。

## 10. Task Pack and Pilot Protocol

### 10.1 Accepted descriptive Pilot scale

```yaml
tasks: 4
repetitions_per_task: 2
strategies_per_repetition: 3
planned_initial_runs: 24
maximum_C_child_attempts: 8
maximum_started_attempts: 32
```

该规模是用户接受的 V1 版本级 descriptive Pilot 上限，不支持 statistical
significance。V1-B Contract 可以根据 V1-A 的零调用成本投影进一步缩小，但不得
在不修订 Charter 的情况下静默扩大。

### 10.2 Task families

1. 正常 bounded TypeScript bug fix；
2. 容易遗漏真实 edge case、public check 有帮助而 external Verifier 更强的任务；
3. 必须运行 declared public check 才能发现常见错误的任务；
4. scope-constrained 任务，其中修改 protected config/tests 是 invalid shortcut。

每个任务必须：

- 可由现有 bounded Tool Profile 完成；
- 不需要 install、network、Git commit、raw shell text 或外部服务；
- 有 Workspace 外部 deterministic Verifier；
- 有仅用于 solvability calibration 的 reviewed reference solution；
- 固定 source digest、instruction、writable/protected paths；
- 避免 style-only、LLM Judge 或含糊 acceptance。

禁止：

- 根据 arm 结果事后选择/删除任务；
- 为强迫 Recovery 而故意破坏任务；
- trivial near-certain text replacement；
- dependency/environment/long-context/cancellation/resume/multi-path fault；
- prompt、filename、Skill 或 Tool output 泄露 hidden answer/Verifier。

### 10.3 Zero-call calibration before Pilot

- 验证 Task/Skill/Strategy/Verifier/source digests；
- reference patch 使 Verifier 通过；
- unmodified source 在应失败的任务上失败；
- Verifier 重复运行 deterministically；
- treatment-isolation Gate 通过；
- task set/protocol 在真实 Outcome 前冻结。

每个 task/repetition block 预先记录 A/B/C 的 deterministic permutation，以降低
简单时间/顺序偏差；不得声称模型 seed 可复现。

## 11. Metrics and Analysis Plan

### 11.1 Primary descriptive metrics

- initial verified success by arm；
- final verified success by arm；
- A-initial versus B-initial Skill-treatment delta；
- B/C initial payload identity 和 outcome/randomness diagnostic；
- C Recovery eligibility、trigger、start 和 success；
- C-initial versus C-final bounded Recovery result；
- B-final versus C-final overall Runtime increment；
- declared-check execution；
- forbidden/protected mutation；
- invalid/infrastructure/evidence rate；
- request、Tool、token、latency、cost per Attempt/Run/task/arm。

不自动使用 `false_completion`，因为 `settled` 或 assistant final 不证明模型明确
声称成功。若以后需要该指标，必须有预先定义的 deterministic completion-claim
annotation，不能用 LLM Judge。

### 11.2 Result classes

```text
Promote
  bounded evidence shows useful gain within guardrails

Revise
  mechanism works but content/protocol/cost needs bounded correction

Reject
  no observed benefit, worse outcomes, or guardrail failure

Inconclusive
  too few failures, mixed directions, high nondeterminism, invalid-heavy runs,
  or no natural Recovery activation
```

不得在看到结果后扩展任务集、增加 Trial 或改 denominator 以获得偏好结论。

## 12. Budget and Authorization Boundaries

### 12.1 V1-A

```yaml
real_model_calls: 0
external_provider_calls: 0
credential_reads: 0
external_network: false
dependency_install: false
pi_core_patch: false
```

### 12.2 Accepted V1-B Charter caps

以下是用户接受的 V1 版本级安全上限；正式 V1-B Contract 仍须在 V1-A 接受后
单独起草、审查和授权，并可以只向下收紧：

```yaml
per_initial_attempt_all_arms:
  provider_requests_max: 8
  tool_calls_max: 12
  token_max: 65536
  agent_wall_time_ms_max: 300000
  cost_usd_max: 0.10

per_A_or_B_run:
  verifier_runs_max: 1
  recovery_attempts_max: 0
  cost_usd_max: 0.10

per_C_run:
  provider_requests_max: 16
  tool_calls_max: 24
  token_max: 131072
  verifier_runs_max: 2
  recovery_attempts_max: 1
  wall_time_ms_max: 900000
  cost_usd_max: 0.20

whole_pilot:
  initial_runs_max: 24
  started_attempts_max: 32
  provider_requests_max: 256
  tool_calls_max: 384
  cost_usd_max: 2.00
  elapsed_execution_window_ms_max: 7200000
  alternate_model_fallback: false
  retry_same_run: false
```

这些是 safety caps，不是预期消费。Charter 接受、V1-A Activation、V1-A
Implementation Baseline、V1-B Contract 接受、V1-B Stage 1 freeze 和 V1-B
Stage 2 真实调用分别是独立授权点。

`elapsed_execution_window_ms_max` 在 V1-B 中冻结为累计 active execution time，
不计入 Main Session/用户审查、命令之间人工等待或授权等待；per-Attempt 和
per-Run wall-time caps 仍独立生效。该解释不得由看到真实 Outcome 的 Execution
Session事后改变。

## 13. Goal Decomposition and Session Ownership

### 13.1 V1-A — Deterministic Skill and Experiment Substrate

Owner：新的 dedicated V1-A Implementation Session。

范围：

- public emitted Skill dynamic route；
- exact-one Skill loader 与 Windows wrapper Gate；
- V1-owned Task/Strategy/Skill/Experiment contracts；
- A/B/C treatment-isolation；
- common Verifier 与 C-only intervention；
- immutable Manifest / read-only aggregator；
- test-only Faux scenarios；
- tracked fixed-provider composition boundary 的 zero-call implementation；
- task pack/protocol fixtures；
- V0 regression。

V1-A 只提交 Report、Closeout Draft、Source Delta、Commands/Exit Codes、Evidence
Index 和 `CURRENT_STATE_UPDATE_PROPOSAL`。专用 Session不得修改控制状态或
commit。

Candidate 冻结后必须进行一次 focused independent audit，范围只覆盖：

- treatment/payload isolation；
- Skill source/path/diagnostic boundary；
- experiment membership/aggregation；
- hidden Verifier/protected path；
- provider authority/credential/evidence seam；
- necessary V0 regressions。

### 13.2 V1-B — Frozen Bounded Real Pilot

正式 Contract 只在 V1-A accepted 后起草。

V1-B 保持一个 Goal、两个执行 Stage，不增加默认第三个 V1 Goal：

1. **Stage 1 — Zero-call Execution Preparation**
   - Owner：新的 dedicated V1-B Preparation Session；
   - 允许在正式 Contract 明列的 V1-owned source/fixture/test/report 路径内做
     有界修改；
   - 建立 tracked public Pi composition、one-cell runner、Pilot ledger、
     Inspector、V1 product surface 和完整 zero-call regressions；
   - real model/provider call、credential read、external network、Pi patch、private
     import、dependency install 和专用 Session Git commit 均为 0/false。
2. **Stage 1 Focused Audit**
   - Owner：新的 fresh independent Audit Session；
   - 只审计冻结 Candidate 的 Provider/credential、fairness、budget/stop、C-only
     lineage、Manifest/terminalization/evidence、Windows identity 和必要回归；
   - 不修源码、不创建 Candidate Commit、不修改控制状态、不调用真实 Provider；
   - finding 由原 Preparation Session 有界返修，仅复审受影响 finding 和必要
     regression，除非出现新的具体非局部证据。
3. **Stage 2 — Frozen Real Pilot**
   - Owner：新的 fresh dedicated V1-B Execution Session；
   - 只从 Main Session 记录的 exact Execution Baseline 和 immutable Manifest
     逐 cell 执行一次完整 frozen Pilot；
   - 没有 source/fixture/test/Manifest/control edit、stage 或 commit authority；
   - credential/network/real-call/USD2 authority 必须由用户在 Stage 1 和 audit
     接受后单独授权。

Stage 2 推荐使用 Manifest 强制的 one-cell-at-a-time `run-next` surface；不同
planned Run 之间可以重新启动进程，C child 必须在同一进程、Session 和 Workspace
内完成。该设计不声称或要求跨进程 Session resume。

所有 planned cells 必须 terminal、invalid 或 paused；禁止静默 deletion、same-Run
retry、fallback 或 automatic replacement。若 frozen source 变化，必须回到 Main
Session重新决定 candidate identity、Manifest binding 和是否 re-audit。

本节修订是对原 §13.2 owner 描述和已接受 BC-5 实现落点的有界澄清：V1-A 已交付
并审计 fixed Provider boundary 和 interfaces；真实可执行 tracked composition 在
V1-B Stage 1 零调用形成。它不重新打开 V1-A，不改变 Direct public
`AgentHarness`、两 Goal、三 Strategy、Pilot scale 或 Budget。

### 13.3 No default V1-C

只在以下条件之一出现时讨论 V1-C：

- V1-B 在 frozen candidate defect 上暂停；
- infrastructure-dominated inconclusive result 需要用户另行批准一次 bounded
  repeat；
- 结果产生一个无法在 Main Session审查中解决的独立架构问题。

报告生成本身不构成新 Goal。

## 14. Definition of Done

V1 完成至少要求：

1. V1-A accepted，public Pi Skill route、fairness、identity、provider boundary 和
   regressions 有确定性证据；
2. focused V1-A audit 通过或所有 finding 经原实现 Session有界返修并聚焦复审
   关闭；
3. V1-B 的 Task/Skill/Protocol/Model/Budget/Experiment Manifest 在真实结果前
   冻结；
4. 所有 planned cells 可核对，无覆盖、静默 retry 或事后挑选；
5. A/B/C 使用同一 Measurement Verifier 和 initial budget；
6. 只有 eligible failed C 可以消耗一个 child reserve；
7. request/Tool/token/time/cost/credential/evidence scans 通过；
8. treatment-caused invalids 被正确归因；
9. 输出 raw evidence、aggregate report 和 Promote/Revise/Reject/Inconclusive
   decision；
10. claims 保持 bounded descriptive，不写成 benchmark/统计/production 结论；
11. Main Session与用户完成接受或拒绝，并同步正式控制状态。

## 15. Pause Conditions

任何 Session遇到以下情况立即停止：

1. public Skill route 需要 Pi private import/Core patch；
2. Windows Skill wrapper 无法在 host boundary 稳定正确生成；
3. B/C initial model-visible payload 无法保持一致；
4. A/B/C 的 Task/Model/Tools/Verifier/initial budget 漂移；
5. hidden acceptance、Verifier source、credential 或 reasoning 泄露；
6. Agent 可写 Verifier、tests、acceptance criteria 或其他 protected file；
7. general Skill/provider/eval platform 成为实施前提；
8. provider/model descriptor 改变或需要 fallback/retry；
9. 任一硬 request/Tool/token/time/cost budget 越界；
10. invalid/infrastructure Runs 达到 started Runs 的 25%，或同一原因重复两次；
11. experiment membership/source identity 无法证明；
12. V1 被扩大为 autonomous selection/lifecycle、V2 multi-path 或 V3 Experience；
13. Direct public Skill 路线需要改用 SDK、RPC、Extension/Package 或未审查的资源
    discovery 才能继续。

不得因为某 arm 暂时领先、全部任务初次通过或没有自然 Recovery 就提前停止；这些
都是合法 Pilot 结果。

## 16. V2 / V3 Continuity

V1 保留：

- independent Run identity；
- `strategy_id`；
- non-empty experiment membership；
- `Attempt.parent_attempt_id`；
- per-Attempt Session/Workspace refs；
- Failure Packet 与 bounded Recovery evidence；
- Skill identity 与 Outcome separation。

V1 不实现：

- V2 same-Session versus clean-Session multi-path selection；
- new Session / clean Workspace Recovery；
- failure-aware Router；
- V3 Experience extraction、Skill mutation、related-task regression、promotion /
  rollback；
- V4 selection/routing/retirement。

V2 仍是 Portfolio North Star；V1 必须在获得足够可信的 Skill/Runtime comparative
evidence 后停止，不能长期扩张为 Eval platform。

若 V1 结果支持把某项 Skill/Policy 用于真实 Pi 交互形态，主 Session可以在 V1
收口后提出一次有界、只读的 SDK/Extension compatibility audit；无具体 V1/V2
问题时不得自动创建该 Goal。V2 Contract 前若需要 clean Session 或 Git Worktree，
再评估 `AgentSessionRuntime` 和经来源、License、版本及 Windows 行为审计的
Worktree module/Extension，并保留 Workbench 对 Run/Attempt/Workspace/Outcome 的
权威。

## 17. Non-goals

- autonomous Skill discovery/selection；
- Skill registry/marketplace/cache/reload/lifecycle platform；
- Claude Code feature parity；
- BM25、embedding retrieval 或 learned router；
- LLM Judge、hidden-test generation 或 acceptance mutation；
- arbitrary Provider registry/credential manager；
- `pi-coding-agent` SDK/RPC、Extension discovery 或第三方 Pi Package 作为 V1
  执行/treatment 路线；
- Dashboard、SQLite、distributed runner、Eval SaaS；
- Worktree、container、general sandbox、MCP、Multi-Agent、Godot；
- cross-process Resume、crash durability、exactly-once Tools；
- V2/V3/V4 implementation；
- paper-level statistical proof或 public benchmark claim。

## 18. Claims Allowed / Not Allowed

### Allowed after V1 completion, subject to evidence

- 在固定 Pi、Workbench、模型、任务和预算下完成了公平的 Baseline / Skill-only /
  Skill+Runtime 三路比较；
- 一个 project-owned Skill 通过 public Pi route 进入 initial Agent Turn；
- external environment Verifier 对所有 Strategy 使用相同合同；
- Runtime 只在有效失败 measurement 后执行一次有界 Recovery；
- 报告了 Skill/Runtime 的 observed descriptive result 和完整成本/invalid guardrail；
- 结果是 Promote、Revise、Reject 或 Inconclusive 中的哪一种以及原因。

### Not allowed

- Skill 或 Runtime 在统计上显著提高一般 coding performance；
- Runtime 必然优于 Skill-only；
- 一次或少量 Recovery 证明生产可靠性；
- SkillOS 证明本项目 Skill 有效；
- V1 是通用 benchmark、Eval platform 或 multi-provider product；
- V2/V3 已实现；
- LLM self-judge 等于 independent external Outcome。

## 19. Accepted Charter Decisions

用户接受本 Charter 后，以下各项均按各自 `recommendation` 冻结为版本级边界。
这不授权 V1-A/V1-B Contract、Activation、实现、Credential/Network、真实调用或
Git commit。

```yaml
accepted_charter_decisions:
  - decision: accept_primary_source_gate
    evidence: canonical SkillOS v1 source, PDF integrity and Main Session evidence audit passed
    options:
      - accept_single_source_gate
      - require_second_primary_source
    recommendation: accept_single_source_gate
    consequence: V1 Charter may rely on content/selection/execution/evaluation separation without further literature expansion

  - decision: freeze_skill_invocation_semantics
    evidence: public Pi skill() replaces prompt() in one normal turn; hidden explicit invocation removes selection as a factor
    options:
      - hidden_exact_one_skill_plus_explicit_initial_invocation
      - visible_catalog_plus_explicit_invocation
      - manual_prompt_overlay
    recommendation: hidden_exact_one_skill_plus_explicit_initial_invocation
    consequence: V1 measures a reproducible fixed Skill treatment, not routing quality

  - decision: accept_two_goal_V1
    evidence: V1-A has a distinct zero-call implementation/audit decision; V1-B is frozen real execution
    options:
      - V1_A_then_V1_B
      - one_large_V1_goal
      - three_default_goals
    recommendation: V1_A_then_V1_B
    consequence: preserves owner and authority boundaries without creating report-only governance

  - decision: accept_tracked_fixed_provider_boundary_in_V1_A
    evidence: V0 real composition is ignored UAT-local; V1-B has no source-edit authority
    options:
      - one_tracked_DeepSeek_profile_with_external_credential_injection
      - keep_untracked_external_composition
      - general_provider_registry
    recommendation: one_tracked_DeepSeek_profile_with_external_credential_injection
    consequence: real Pilot is reproducible without provider-platform expansion

  - decision: freeze_hidden_acceptance_boundary
    evidence: common external measurement is required; Skill cannot be a security boundary
    options:
      - hidden_external_verifier_plus_visible_read_only_public_checks
      - new_all_test_read_visibility_system
    recommendation: hidden_external_verifier_plus_visible_read_only_public_checks
    consequence: all arms can run declared checks while hidden acceptance remains outside Agent control

  - decision: freeze_Pilot_scale
    evidence: four task families cover the intended failures; two repetitions remain descriptive and keep V1 bounded
    options:
      - four_tasks_times_two_repetitions_times_three_strategies
      - three_task_smoke_only
      - six_to_ten_task_larger_pilot
    recommendation: four_tasks_times_two_repetitions_times_three_strategies
    consequence: 24 initial Runs, at most 8 child Attempts; meaningful descriptive evidence but no statistical claim

  - decision: freeze_whole_Pilot_cost_cap
    evidence: accepted V0-C Run cost about USD 0.00124, but V1 needs matched cells and possible Recovery reserves
    options:
      - USD_2_hard_cap
      - lower_cap_after_V1_A_cost_projection
      - larger_cap
    recommendation: USD_2_hard_cap_with_V1_A_projection_and_separate_V1_B_authorization
    consequence: cost remains bounded; actual expected usage may be much lower

  - decision: freeze_invalid_attribution_rule
    evidence: excluding treatment-caused invalids would bias arm comparison
    options:
      - exclude_only_treatment_independent_infrastructure_or_evidence_invalids
      - exclude_all_invalid_runs
      - count_all_invalids_as_task_failure
    recommendation: exclude_only_treatment_independent_infrastructure_or_evidence_invalids
    consequence: policy failures remain visible while unrelated harness failures do not distort success denominators

  - decision: require_focused_V1_A_candidate_audit
    evidence: V1-A changes treatment isolation, source identity, aggregation and credential/evidence seams
    options:
      - one_focused_independent_audit
      - main_session_review_only
      - full_general_V0_reaudit
    recommendation: one_focused_independent_audit
    consequence: validates causal/evidence boundaries without repeating the entire V0 audit

  - decision: clarify_V1_B_two_stage_session_ownership
    accepted_at: 2026-08-04
    evidence: V1_A accepted abstract provider seams but the repository does not yet contain the tracked concrete real factory/runner/CLI required by a no-source-edit Pilot Session
    options:
      - same_V1_B_goal_with_zero_call_preparation_then_frozen_execution
      - reopen_closed_V1_A
      - allow_execution_local_ignored_adapter
    recommendation: same_V1_B_goal_with_zero_call_preparation_then_frozen_execution
    consequence: preserves the two-goal V1 while ensuring the Session that sees real outcomes cannot edit source

  - decision: retain_full_24_cell_cell_at_a_time_pilot
    accepted_at: 2026-08-04
    evidence: accepted four-task/two-repetition/three-strategy scale remains bounded; independent cells do not require a single long-lived process
    recommendation: immutable_manifest_enforced_run_next_with_24_initial_cells
    consequence: preserves the descriptive Pilot while avoiding an unnecessary cross-process Session-resume requirement

  - decision: clarify_whole_pilot_time_cap
    accepted_at: 2026-08-04
    evidence: human review and authorization waiting are not Provider execution time
    recommendation: accumulated_active_execution_time
    consequence: preserves the two-hour hard execution cap while per-Attempt and per-Run wall-time caps remain separately enforced

  - decision: require_one_focused_V1_B_stage_1_audit
    accepted_at: 2026-08-04
    evidence: Stage 1 changes real Provider composition, credential, budget, C-only lineage, Manifest and terminalization boundaries
    recommendation: one_focused_independent_audit_not_full_general_reaudit
    consequence: validates the high-risk delta without repeating all V0/V1-A assurance

  - decision: keep_Pi_SDK_Extension_checkpoint_deferred_for_V1_B
    accepted_at: 2026-08-04
    evidence: pinned public AgentHarness/model/provider paths cover V1-B; the current gap is Workbench-owned tracked composition
    recommendation: defer_until_concrete_later_integration_trigger
    consequence: does not block V1-B and does not create an SDK/Extension abstraction
```

## 20. Acceptance and Next Sequence

接受本 Charter 只冻结 V1 version scope，不等于：

- 创建或接受 V1-A Contract；
- Activation；
- Control Baseline Commit；
- Implementation；
- Audit；
- Credential/Network/Provider authority；
- V1-B real Pilot；
- Git commit。

后续唯一顺序：

```text
用户接受 V1 Version Charter
→ Main Session正式化 Charter 并同步 active_goal: null 的控制事实
→ 用户单独授权 V1 Planning Baseline Commit
→ Main Session创建并核验 Planning Baseline
→ Main Session起草 V1-A Goal Contract Draft
→ 用户审查并接受正式 V1-A Contract
→ 用户单独授权 V1-A Activation + Control Baseline Commit
→ Main Session冻结控制状态和 baseline
→ dedicated V1-A Implementation Session执行零调用实现
→ Main Session复核并冻结 Candidate
→ focused independent audit
→ 有界返修/聚焦复审（如需要）
→ 用户与 Main Session接受 V1-A Implementation Baseline
→ Main Session完成 V1-B bounded readiness review（已完成）
→ 用户接受 V1-B Integrated Development Plan 和本 Charter 有界澄清（已完成）
→ 用户单独授权 V1-B Planning/Charter Amendment Baseline Commit
→ Main Session创建并核验该 baseline
→ Main Session起草 V1-B Goal Contract Draft
→ 用户审查并接受正式 V1-B Contract；此时仍未激活
→ 用户单独授权 V1-B Activation + Control Baseline Commit + zero-call Stage 1
→ dedicated V1-B Preparation Session执行 Stage 1
→ Main Session复核并在用户授权后冻结 Candidate Commit
→ fresh focused independent Audit Session审计 Stage 1 Candidate
→ 原 Preparation Session有界返修/聚焦复审（如需要）
→ Main Session在用户授权后冻结 V1-B Execution Baseline
→ 用户单独授权 credential/network/real-call/USD2 Stage 2
→ fresh no-source-edit V1-B Execution Session逐 cell执行 frozen Pilot
→ Main Session与用户验收 V1-B/V1 并另行授权控制状态收口
```
