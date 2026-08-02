# V1-A Dedicated Goal Session Start Prompt

```yaml
prompt_status: authorized_for_single_dedicated_v1_a_implementation_session
goal_id: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
stage: deterministic_zero_real_call_implementation
control_baseline_commit: c9f91057db60cf61dab0d3aa305564d498c89cd6
planning_baseline_commit: 7617ce3f56bc8844a0e7eb3605b4327aa6412932
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
accepted_v0_c_implementation_baseline: 12db75aaea4db4afb774046cfcc94de772a2e90b
execution_owner: this_new_dedicated_v1_a_implementation_session
main_session_owner: current_project_control_session
implementation_authorized: true_zero_real_calls
deterministic_faux_provider_authorized: true
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
dependency_installation_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
pi_sdk_rpc_extension_route_authorized: false
external_module_download_or_port_authorized: false
git_commit_authorized: false
candidate_commit_authorized: false
focused_independent_audit_authorized: false
implementation_baseline_commit_authorized: false
V1_B_authorized: false
```

你是 V1-A 的新 dedicated Implementation Session。你不是项目主 Session，不能决定
架构接受、修改正式控制状态、扩大 Scope、创建 Git commit、启动 focused audit、
进入 V1-B 或接受自己的结果。

你的唯一任务是：

> 从精确 Control Baseline Commit
> `c9f91057db60cf61dab0d3aa305564d498c89cd6` 开始，严格按正式
> `V1_A_GOAL_CONTRACT.md` 实现和验证零真实调用的 deterministic Skill / fair
> experiment substrate，保存 Raw Evidence，提交 Implementation Report、Closeout
> Draft、Source Delta、Commands/Exit Codes、Evidence Index 和结构化
> `CURRENT_STATE_UPDATE_PROPOSAL`，然后停止等待 Main Session与用户验收。

---

## 1. Required read order

执行任何修改、测试或广泛搜索前，按顺序完整读取：

1. 根 `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. `docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md`；
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
5. `docs/第二项目_Codex交接包_2026-07-30/V1_A_GOAL_CONTRACT.md`；
6. `docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH.md`；
7. `docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH_MAIN_REVIEW.md`；
8. `docs/reports/V1_SKILL_PRIMARY_SOURCE_MAPPING.md`；
9. `docs/reports/V1_SKILL_PRIMARY_SOURCE_MAPPING_MAIN_REVIEW.md`；
10. `docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md`；
11. `docs/第二项目_Codex交接包_2026-07-30/V0_C_GOAL_CONTRACT.md`；
12. `docs/reports/V0_C_CLOSEOUT.md`；
13. `docs/reports/V0_C_STAGE2_REPLACEMENT_USER_ACCEPTANCE_REPORT.md`；
14. `workbench/` 当前全部源码、测试、scripts、config 和 README；
15. `.upstream/pi/AGENTS.md`，以及你实际进入的每个 Pi 子树内全部适用的
    `AGENTS.md`；
16. 正式 Contract §4.3 指定的 Pi source/tests。

正式 Contract 是 V1-A 执行权威。研究报告和 SkillOS mapping 只提供证据/设计输入，
不能覆盖 Contract、Charter、当前源码或实际测试。

---

## 2. Gate A — must pass before implementation

只读核验并记录 exact commands、cwd、exit codes：

1. root HEAD 必须恰好为：

   ```text
   c9f91057db60cf61dab0d3aa305564d498c89cd6
   ```

2. root tracked diff 和 staged diff 必须为空；
3. 已登记的未跟踪 `reference/` 和本 post-baseline 启动 Prompt 可以存在，不得为了
   追求空 `git status` 而删除、修改或提交它们；
4. 除上述两类外，不应存在 V1-A source/evidence/report delta；
5. `CURRENT_STATE.active_goal.id` 必须是
   `V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE`；
6. 正式 Contract 必须是 `accepted_activated_pending_implementation`；
7. implementation owner 必须是 dedicated V1-A Implementation Session，且
   implementation 尚未开始；
8. `.upstream/pi` HEAD 必须恰好为
   `027a5847901b5dde30270abaa1041046cd2b4b55` 且 clean；
9. Planning Baseline
   `7617ce3f56bc8844a0e7eb3605b4327aa6412932` 和 accepted V0-C baseline
   `12db75aaea4db4afb774046cfcc94de772a2e90b` 必须可定位；
10. `.runs/v1-a/` 必须尚未由本 Session创建；只能在 Gate A 全部通过后创建；
11. real-model/external-provider/credential/network/install/Pi-patch/private-import/
    Git-commit authority 必须为 0/false；
12. V1-B、Candidate Commit、focused audit 和 Implementation Baseline 必须未授权。

Gate A 任一项失败：

```text
立即停止
→ 不修改源码
→ 写 docs/reports/V1_A_PAUSE_REPORT.md
→ 记录 exact observation、evidence、why blocking 和 required authority/decision
```

不要自行切换 Commit、修改控制状态、清理 `reference/`、删除已有 evidence 或修改 Pi。

---

## 3. Binding implementation outcomes

完整执行正式 Contract §5–§20 和 Gates B–I。以下是必须优先保持的最小主线。

### 3.1 Public emitted Skill route

- 只使用固定 Pi public emitted package root；
- 动态证明 `AgentHarness`、Skill loader/formatter/types 和
  `AgentHarness.skill()` route；
- A 使用一个 `prompt(task)` initial Turn；
- B/C 使用一个 `skill(skillName, task)` initial Turn；
- 不增加 Skill preload Turn；
- 不使用 private import、Pi patch、SDK、RPC、Extension discovery 或第三方 Pi
  Package。

### 3.2 Exact-one Skill and Windows path boundary

- 一个 project-owned、tracked、self-contained Reliability `SKILL.md`；
- hidden exact-one catalog，`disable-model-invocation: true`；
- source/metadata/size/digest/wrapper identity 固定；
- 任意 Pi loader diagnostic 必须在 Workbench boundary fail closed；
- zero/duplicate/name collision/case alias/source drift 必须拒绝；
- symlink/junction/reparse/hardlink/dangling/escape 必须拒绝；
- Windows separator/casing 不得造成 B/C wrapper drift；
- first Skill 不引用相对资源，也不实现 reload/registry/lifecycle。

### 3.3 Three-arm treatment isolation

one-response Faux evidence 必须证明：

- A/B/C 各恰好一个 initial Turn 和一个 initial Provider request；
- B/C initial model-visible Provider payload byte-equivalent；
- A/B/C base System Prompt、Tool name/schema/description/order 相同；
- A/B 唯一预期模型可见 delta 是 public Pi Skill wrapper/body；
- policy/experiment/recovery/budget identity 不进入 initial model context；
- Skill overhead bytes/tokens 被记录，不被隐藏或归一化；
- 不要求 nondeterministic B/C Outcome 相同。

### 3.4 Verifier and C-only intervention

严格顺序：

```text
initial cycle settled
→ same external Measurement Verifier for A/B/C
→ valid VerifierResult persisted
→ A/B terminal OR C eligibility decision
→ only eligible failed C may start one same-Session child
→ child settled + one Verifier
→ final validation/evidence/terminalization
```

必须覆盖 A/B pass/fail stop、C pass stop、C eligible failure one child、invalid/
budget/infrastructure/cancel no child、no ghost child 和 no ordinal 3。

### 3.5 Experiment identity and aggregation

- V1-owned Task/Strategy/SkillRef/Experiment/Run-membership contracts；
- non-empty experiment identity 与 immutable Manifest 双向核验；
- Run 独立 write-once，aggregator read-only；
- 拒绝 missing/duplicate/drift/mixed revision/nonterminal/illegal child；
- treatment-caused invalid 不得从 arm guardrail/denominator 中消失；
- 不实现 database、scheduler、dashboard 或 promotion system。

### 3.6 Fixed provider seam — zero-call only

tracked boundary 只允许：

```text
one fixed DeepSeek profile descriptor
+ public Pi provider/AgentHarness factory seam
+ externally injected opaque credential resolution
+ one-use authority
+ frozen budget envelope
+ redacted usage/cost projection
```

只用 non-secret fake dependencies 测试。必须证明 default/dry-run fail closed、authority
one-use、no fallback/retry/registry、no secret persistence，且真实模型、外部 Provider、
credential、network count 全部为 0。

### 3.7 Candidate Task pack

准备并确定性校准四类 bounded TypeScript Task candidate：normal fix、edge case、
declared-public-check、protected-scope。每项需要 source/instruction/path identity、公开
check、Workspace 外 external Verifier、reviewed reference patch、unmodified expected
fail/reference expected pass、repeatable Verifier 和 hidden-answer non-leakage。

不得运行真实 arm、根据真实结果挑 Task 或人为制造失败来强迫 Recovery。

---

## 4. Allowed writes

Gate A 通过后，只允许 Contract §6.2 指定范围：

- bounded `workbench/src/**` V1 modules 和最小 shared/CLI adapter changes；
- `workbench/tests/**` V1-A tests/necessary regressions；
- `workbench/scripts/**` V1-A deterministic/evidence scripts；
- 必要的 `workbench/package.json`、`tsconfig.json`、`README.md` 有界更新；
- `fixtures/skills/v1/**`；
- `fixtures/tasks/v1/**`；
- `fixtures/verifiers/v1/**`；
- `fixtures/manifests/v1/**`；
- `fixtures/calibration/v1/**` 或等价 Workspace 外 calibration material；
- ignored `.runs/v1-a/**` evidence；
- `docs/reports/V1_A_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V1_A_CLOSEOUT_DRAFT.md`；
- 命中 Pause 时的 `docs/reports/V1_A_PAUSE_REPORT.md`。

新 V1-owned module 优先。若必须修改 shared V0 source，必须最小化并在 Source Delta
中逐文件说明，同时通过全部适用 V0 regression。

---

## 5. Protected files and prohibited actions

不得修改、暂存、提交、删除或生成到：

- `CURRENT_STATE.md`、`AGENTS.md`；
- 正式 V1 Charter、V1-A Contract、`09`、ADR、accepted Closeout/control files；
- `.upstream/pi/**`；
- `reference/**`；
- `.runs/v0-a/**`、`.runs/v0-b/**`、`.runs/v0-c/**` 或 G00x evidence；
- accepted V0 fixtures/manifests/verifiers/history；
- `.env`、`.env.*`、credential material；
- Git index/history/remote。

不得：

- 安装依赖、下载资料、联网检索或访问外部 API；
- 请求/读取 credential；
- 调用真实模型或外部 Provider；
- 修改 Pi、使用 private import 或切换 SDK/RPC/Extension route；
- 创建 Git commit；
- 启动 audit、进入 V1-B/V2/V3；
- 自行接受 Goal 或修改 `active_goal`。

你只能在 Implementation Report 或 Closeout Draft 中提交结构化
`CURRENT_STATE_UPDATE_PROPOSAL`，不能直接应用它。

---

## 6. Budgets and commands

Goal-wide hard boundary：

```yaml
real_model_calls: 0
external_provider_calls: 0
credential_reads: 0
external_network_requests: 0
dependency_installs: 0
pi_core_patches: 0
private_pi_imports: 0
external_module_downloads_or_ports: 0
git_commits: 0
```

每个 deterministic fixture Run：

```yaml
initial_attempts_max: 1
child_attempts_max: 1_for_C_only
attempt_ordinal_max: 2
verifier_runs_max: 2_for_C_else_1
faux_provider_requests_max: 16
tool_calls_max: 24
wall_time_ms_max: 900000
formal_cost_usd: 0
```

使用当前已存在的依赖/工具链。运行前先读取 package scripts 和适用 Pi instructions。
使用最窄命令逐步验证；最终至少记录：

- strict TypeScript command；
- public emitted Skill import/route smoke；
- V1-A focused tests；
- V1-A deterministic suite；
- applicable V0-A/B/C regressions；
- source/protected identity and secret/reasoning scans；
- root/Pi HEAD and status。

不得仅写“测试通过”；必须记录 exact command、cwd、exit code、pass/fail/skip count 和
duration。不得为了修复测试环境而 install 或修改 Pi。

---

## 7. Required evidence and deliverables

必须提交：

1. authorized source/fixture/test changes；
2. `.runs/v1-a/evidence/EVIDENCE_INDEX.md`；
3. Gates B–H 的 deterministic raw artifacts；
4. `docs/reports/V1_A_IMPLEMENTATION_REPORT.md`；
5. `docs/reports/V1_A_CLOSEOUT_DRAFT.md`；
6. exact Source Inventory；
7. exact Control-Baseline-to-Candidate Source Delta；
8. Workbench/fixture tree digest；
9. exact commands、cwd、exit codes、counts、durations；
10. root/Pi HEAD and status；
11. Faux versus external Provider call counts；
12. real model/network/credential/install counts；
13. protected-path/source identity result；
14. secret/reasoning scan；
15. structured `CURRENT_STATE_UPDATE_PROPOSAL`。

Report 必须明确区分：

```text
Fact
Inference
Recommendation
Unconfirmed
```

允许建议 V1-A Candidate 进入 Main Review；不得声称 Skill/Runtime 在真实任务上有效。

---

## 8. Pause conditions

正式 Contract §22 的全部 Pause Conditions 绑定。尤其以下任一情况立即停止：

- Control Baseline/root/Pi/active state mismatch；
- public Skill route需要 private import、Pi patch、SDK/RPC/Extension/package；
- dependency install/download/network/model-data hydration becomes necessary；
- exact-one loader diagnostic不能 fail closed；
- Windows path/wrapper不能稳定且需要替换 public Pi semantics；
- B/C initial payload不能 byte-equivalent；
- Task/Model/Prompt/Tools/Verifier/initial budget drift；
- hidden acceptance、Verifier、credential、secret 或 reasoning泄漏；
- Agent可以写 protected acceptance material；
- C 在 valid failed VerifierResult 前 Recovery或可以创建多个 child；
- Manifest/membership/source identity不能证明或 aggregator必须改 raw evidence；
- general Skill/provider/eval platform成为前提；
- 发生任何真实模型/外部 Provider/network/credential read；
- V0 regression需要 broad historical rewrite；
- Task pack无法在当前 Tool Profile 内校准；
- control/reference/Pi/accepted evidence被修改；
- scope扩展到 V1-B/V2/V3 或 SDK/Extension compatibility；
- deterministic hard cap超限。

Pause Report 只写 observation、evidence、why blocking、minimal options 和 required
decision；不得自行换路线或扩大 Contract。

---

## 9. Final disposition and stop

你只能建议：

```yaml
- PASS_V1_A_CANDIDATE_FOR_MAIN_REVIEW
- PAUSE_V1_A_IMPLEMENTATION
- FAIL_V1_A_CONTRACT
```

完成 source、evidence、Implementation Report、Closeout Draft 和 State Proposal 后
立即停止。

不要：

- 自行接受/关闭 V1-A；
- 修改/暂存控制状态；
- 创建 Candidate 或 Implementation Baseline Commit；
- 启动 focused audit；
- 调用真实模型/Provider；
- 进入 V1-B/V2/V3；
- 继续追加“顺手优化”。

将结果返回当前 Main Session与用户做有界验收。
