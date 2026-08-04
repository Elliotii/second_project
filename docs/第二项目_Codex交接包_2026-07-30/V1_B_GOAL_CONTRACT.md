# V1-B Goal Contract Draft — Frozen Bounded Real Pilot

```yaml
status: accepted_activated_stage_1_authorized
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
version: V1
project: Agent Harness Reliability Workbench
prepared_at: 2026-08-04
prepared_by: main_session
accepted_by_user: 2026-08-04
activated_by_user: 2026-08-04
planning_charter_amendment_baseline_commit: 51a0200450781faa7fb16c98b3547f294efcef7d
planning_charter_amendment_baseline_tree: c51177ea760d3153257703326a220b550af10393
v1_a_implementation_baseline_commit: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
contract_accepted: true
active_goal: true
implementation_authorized: stage_1_only
stage_1_authorized: true
stage_1_implementation_owner: dedicated_v1_b_preparation_session
first_control_baseline_commit: 84f548c93df40d8955a15572df30edac7b6df0fa
first_control_baseline_tree: 0df2d9f57cf2c2705e1f6255b3efa9c2e1be45de
first_stage_1_thread_id: 019fcc05-43a5-7481-8cb7-7d51e2d7085f
first_stage_1_disposition: stopped_preimplementation_on_stale_control_narrative_zero_delta
control_baseline_commit: resulting_HEAD_of_this_revision
stage_1_started: false_pending_corrected_baseline_restart
candidate_commit_authorized: false
focused_audit_authorized: false
execution_baseline_authorized: false
stage_2_authorized: false
credential_reads_authorized: 0
external_network_authorized: false
real_model_calls_authorized: 0
real_provider_calls_authorized: 0
whole_pilot_cost_authorized_usd: 0
pi_core_patch_authorized: false
private_pi_import_authorized: false
dependency_install_authorized: false
dedicated_session_git_commit_authorized: false
```

> 本文件是用户已接受并已激活的 V1-B 正式 Goal Contract。当前授权只覆盖新的
> dedicated Preparation Session 从精确 Control Baseline 执行零真实调用 Stage 1。
> Candidate Commit、focused audit、Execution Baseline、Stage 2、凭据/网络、真实
> Provider/model 调用和 USD2 Pilot 均仍是后续独立控制点。

## 1. Goal Mission

V1-B 在固定的 Pi、Workbench、任务、Skill、System Prompt、Tool、Verifier、
Provider、Model、Budget 和 Experiment identity 下：

1. 先以零真实调用建立并审计 tracked 的真实 Pi execution path；
2. 再由新的 no-source-edit Execution Session 运行一次冻结的 24-cell descriptive
   Pilot；
3. 比较：
   - A — Baseline；
   - B — Skill-only；
   - C — Skill + External Verifier / Runtime Control；
4. 报告 observed task result、Recovery、cost、usage、invalid 和 guardrail；
5. 给出 `Promote`、`Revise`、`Reject` 或 `Inconclusive` 的证据受限建议。

V1-B 不预设 B 或 C 获胜。一个协议有效、但所有 arm 都初次通过、没有自然
Recovery 或没有明显 arm 差异的 Pilot，仍可以是有效完成的 V1-B。

## 2. Authority and Required Reading

### 2.1 Evidence priority

```text
pinned source / tests / actual command output
→ CURRENT_STATE / accepted Closeout / accepted ADR
→ accepted V1 Charter / formal V1-B Contract（接受后）
→ accepted V1-B Integrated Development Plan
→ specialist reports and external references
→ inference
```

### 2.2 Every V1-B Session must read

```text
AGENTS.md
CURRENT_STATE.md
docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md
docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md
docs/第二项目_Codex交接包_2026-07-30/V1_B_GOAL_CONTRACT.md（正式化后）
docs/reports/V1_B_INTEGRATED_DEVELOPMENT_PLAN.md
docs/reports/V1_B_PRECONTRACT_READINESS_PAUSE_REPORT.md
docs/reports/V1_A_CLOSEOUT.md
docs/reports/V1_A_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md
docs/decisions/ADR-0003-direct-agentharness-for-bounded-robustness.md
```

Stage 1 和 Audit 还必须读取 Contract 指定的 V1-A/V0-C source/test 路径。进入
`.upstream/pi` 前必须完整读取适用的 Pi `AGENTS.md`。

### 2.3 External-reference boundary

- SkillOS Primary-source Gate 已由 V1 Charter 满足，不在 V1-B 重做论文研究；
- `cc-harness-knowledge` 只解释成熟模式，不证明 Pi；
- `reference/src/` Claude Code 镜像不是 V1-B 实现 Spec，不复制代码；
- SearchCLI、Youtu-Agent、OpenHarness、Harbor/Terminal-Bench 和 V2/V3 论文不进入
  本 Goal；
- Pi SDK/Extension/成熟扩展保持延后兼容检查点；
- Stage 2 前只对当前官方 DeepSeek API/model descriptor/usage/pricing 做一次有界
  时效性复核。

## 3. Accepted Starting Facts

### 3.1 V1-A facts

V1-A 已以 `PASS_V1_A_DETERMINISTIC_SUBSTRATE` 关闭，基线为：

```yaml
commit: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
tree: 680810b7c2f8b12dbd3503b5a38f1ab162b63996
focused_reaudit: PASS_FOCUSED_V1_A_REAUDIT
real_model_calls: 0
external_provider_calls: 0
```

已证明：

- public Pi `AgentHarness.skill()` deterministic route；
- exact-one hidden Skill 和 Windows wrapper/path boundary；
- A/B/C deterministic treatment semantics；
- complete Faux B/C initial request-model equality；
- common Verifier 和 C-only intervention；
- immutable deterministic Manifest 和 read-only aggregation；
- fixed DeepSeek profile、one-use authority seam、credential error sanitation 和
  strict usage projection；
- fresh Windows Git blob/worktree/fixture identity；
- 必要 V0 regressions。

未证明：

- tracked concrete real Pi factory/runner/CLI；
- real Provider request/usage/cost enforcement；
- 24-cell real Pilot；
- Skill 或 Runtime 对真实任务有效；
- real failed Verifier 后 Recovery effect。

### 3.2 Readiness gap

当前 V1-A source 中：

- `PublicPiHarnessFactoryV1` 仍是抽象 seam；
- `FixedTransportV1.request()` 不能表达完整 Pi messages/tools/usage lifecycle；
- 当前 one-use authority 在第一次 request 后即消费，不适合多轮 Agent Run；
- `runTreatmentProbeV1()` 只运行 Faux；
- 没有 V1 real `run-next`、Pilot ledger、Inspector 或 CLI；
- accepted V0-C 的具体 UAT composition 是 ignored artifact，不可当作 tracked V1
  implementation。

因此 Stage 1 是 V1-B 的必要前置，而不是重开 V1-A。

### 3.3 Pi route facts

固定 Pi 的当前主路线仍为 public emitted Direct `AgentHarness`：

- `.upstream/pi/packages/agent/src/harness/agent-harness.ts::AgentHarness`；
- `.upstream/pi/packages/ai/src/models.ts::createModels/setProvider`；
- `.upstream/pi/packages/ai/src/providers/deepseek.ts::deepseekProvider`。

本 Goal 不静默切换到 `pi-coding-agent` SDK、RPC、Extension runtime 或第三方
package。

## 4. Goal Structure and Session Ownership

V1-B 是一个 Goal，包含两个执行 Stage 和一个中间 Audit Gate。

### 4.1 Main Session

负责：

- Contract、Activation、Scope、Budget 和 Failure Taxonomy；
- Control Baseline、Candidate Commit 和 Execution Baseline Commit；
- Implementation/Audit/Execution 报告验收；
- finding 裁决与返修范围；
- Stage 2 真实调用前的用户授权确认；
- 最终 V1-B/V1 disposition 和 `CURRENT_STATE.md`。

不得：

- 代替 Stage 1 Session 日常实现；
- 代替独立审计；
- 代替 Stage 2 执行真实 Pilot；
- 在结果后改变 task、Skill、Verifier、Manifest、taxonomy 或 denominator。

### 4.2 Stage 1 Preparation Session

Owner：新的 dedicated zero-call V1-B Preparation Session。

负责：

- Contract 范围内的 source/fixture/test 实现；
- concrete public Pi composition；
- one-cell runner、Pilot ledger、Inspector、CLI；
- 24-cell Faux simulation；
- strict TypeScript、focused tests 和必要 regressions；
- raw zero-call evidence、Implementation Report 和 Stage 1 Closeout Draft；
- `CURRENT_STATE_UPDATE_PROPOSAL`。

不得：

- 读取真实 credential；
- 发起 network、Provider 或 model call；
- 修改 Pi、private import 或安装依赖；
- 修改控制文件；
- stage/commit；
- 接受自己的实现或进入 Stage 2。

### 4.3 Focused Independent Audit Session

Owner：新的 fresh independent Audit Session。

负责 exact Candidate/fresh Windows checkout 的有界审计。不得修复、commit、修改
控制状态、读取 credential 或真实调用。

### 4.4 Bounded Correction Session

Owner：原 Stage 1 Preparation Session。

只修复 Main Session 接受的 finding；完成后停止。Main/Audit Session 不静默代修。

### 4.5 Stage 2 Execution Session

Owner：新的 fresh no-source-edit V1-B Execution Session。

只允许：

- 从精确 Execution Baseline 读取 tracked product surface；
- 读取用户另行授权的 opaque credential；
- 按 immutable Manifest 逐 cell 执行 Pilot；
- 写 `.runs/v1-b/` ignored evidence；
- 写 V1-B Execution/Aggregate/Closeout Draft 和状态提案。

禁止修改或暂存：

- Workbench source/tests；
- task/Skill/System Prompt/Tool/Verifier fixtures；
- execution Manifest；
- Charter/Contract/09/ADR/`CURRENT_STATE.md`；
- Pi/reference；
- Git index/history。

核心不变量：看到真实 arm Outcome 的 Session 没有源码修改权。

## 5. Stage and Authorization Sequence

```text
用户接受正式 V1-B Contract
→ Contract 正式化为 accepted_not_activated
→ 用户单独授权 Activation + Control Baseline Commit + Stage 1
→ Main 更新控制状态并创建干净 Control Baseline
→ Stage 1 Preparation Session 零调用实现
→ Main Review
→ 用户授权 Candidate Commit
→ Main 创建精确 Candidate Commit
→ 用户授权 focused audit
→ fresh Audit Session 审计 Candidate
→ 原 Preparation Session有界返修/聚焦复审（如需要）
→ 用户授权 Execution Baseline Commit
→ Main 完成仅 identity materialization 的 final Manifest binding 并冻结 Baseline
→ 用户单独授权 credential/network/real-call/USD2 Stage 2
→ fresh Stage 2 Execution Session逐 cell运行 Pilot
→ Main + User 验收 V1-B/V1
→ 用户另行授权 Closeout/control Commit
```

前一阶段权限不自动流入后一阶段。

## 6. Stage 1 Scope

### 6.1 Required implementation

Stage 1 必须形成最小 tracked execution path：

1. public Pi + fixed DeepSeek `PiRunHandleV1`；
2. 一次 Run capability 内可有多轮 Provider request，但 capability 不得启动第二个
   Run；
3. 单 cell `executeV1RunCell`；
4. Manifest-enforced `run-next`；
5. write-once Pilot ledger；
6. terminal artifacts → `RunResultV1` 的独立 Inspector；
7. read-only aggregate；
8. `preflight`、`run-next`、`inspect`、`aggregate` product surface；
9. deterministic V1-B execution Manifest template；
10. zero-call tests/evidence。

### 6.2 Authorized source paths for Stage 1

正式 Stage 1 Activation 后，Preparation Session 的默认可写范围只包括：

```text
workbench/src/provider/fixed-provider-v1.ts
workbench/src/pi/pi-run-handle-v1.ts
workbench/src/run-v1.ts
workbench/src/pilot-v1.ts
workbench/src/inspect-v1.ts
workbench/src/product-surface-v1.ts
workbench/src/cli.ts
workbench/src/contracts/v1-types.ts
workbench/src/experiment/v1.ts
workbench/tests/v1b-stage1.test.ts
workbench/tests/v1b-cli.test.ts
workbench/package.json                  # only scripts/exports strictly required by V1-B
workbench/README.md                     # bounded product-surface documentation
fixtures/manifests/v1/v1b-*
docs/reports/V1_B_STAGE1_*
.runs/v1-b/stage1/**                    # ignored evidence only
```

现有 accepted task、Skill、Verifier、System Prompt 和 strategy fixtures 默认只读。
V0 lower-level source 默认只读并通过 public project imports 复用。若必须修改未列路径、
accepted V1 fixture 或 V0 core source，Stage 1 立即暂停并提交 Source Expansion
Proposal；不得自行扩大。

### 6.3 Explicitly read-only reuse candidates

- `workbench/src/run-v0c.ts::executeV0CRun` 的编排模式；
- `workbench/src/pi/pi-adapter-v0c.ts::createPiRunHandleV0C`；
- `workbench/src/pi/real-provider-route-v0c.ts`；
- accepted Workspace/Tool Profile/Verifier/Journal/Session/Evidence/Outcome/Completion
  components；
- V1-A Skill runtime、treatment probe、Manifest validation 和 aggregation。

复用已有 lower-level behavior，不复制 ignored V0-C UAT composition，不建设版本无关
Provider/Eval 平台。

## 7. Stage 1 Technical Contracts

### 7.1 Provider and Run authority

- fixed provider/model only；
- credential name identity only，value 不进入 domain/evidence；
- Stage 1 resolver 使用 non-secret fake；
- V1-A accepted 的 one-request seam 和回归保持兼容；V1-B 另加 versioned one-Run
  capability，其消费点是“创建一个 bounded Run handle”，不是“第一次 Provider
  request”，不得静默改写 V1-A 历史语义；
- 一个 authorized Run 内每次 Provider request 仍须单独 reserve/check；
- handle close 后不得恢复或创建第二个 Run；
- resolver/transport/provider/factory/public-handle errors 统一净化；
- unknown、negative、non-finite、fractional、inconsistent 或 over-envelope usage
  fail closed。

### 7.2 Complete initial fairness

每个 task/repetition block 的 A/B/C 必须相同：

- TaskSpec/instruction/source/workspace；
- model provider/api/id/version/thinking/decoding/request options；
- base System Prompt bytes；
- Tool schemas/descriptions/path/permission；
- common Verifier；
- initial Budget；
- Workbench/Pi revisions；
- terminal/invalid/evidence rules。

A→B 唯一 intended model-visible delta：Pi Skill invocation wrapper + frozen Skill body。

B→C 在 initial Verifier 前无 model-visible delta。Strategy/Experiment identity、Recovery
reserve、Failure Packet 和 C decision 都是 host-only。

公平性 proof 必须观察真实 Pi dispatch 前的完整 request model、messages、tools 和
relevant options，不能只比较自选缩减投影。真实 B/C Outcome 不要求相等。

### 7.3 Run/Attempt semantics

- A：1 initial Attempt + 1 Verifier；pass/fail 都 terminal；无 child；
- B：1 initial Attempt + 1 Verifier；pass/fail 都 terminal；无 child；
- C：1 initial Attempt + 1 Verifier；pass 时 terminal；
- C 只有在 valid failed VerifierResult、eligible failure、Stop Policy 允许且完整
  child reserve 预先存在时创建 1 child；
- C child 必须与 parent 同 Process/Session/Workspace；
- C child 后最多再运行 1 Verifier；
- `C-initial` / `C-final` 是 checkpoint，不是第四 arm；
- Provider/infra/evidence invalid 不触发 policy recovery。

### 7.4 One-cell-at-a-time product surface

`run-next`：

1. 验证 exact Manifest/Execution Baseline/Pi/profile；
2. 从 Manifest + ledger 计算唯一 next cell；
3. 拒绝任意跳选、已开始 cell 或 evidence overwrite；
4. 创建独立 copied Workspace；
5. 完成该 cell 的 initial 和合法 C child；
6. write-once terminalize；
7. 只有上一个 cell 完整 terminal 后才允许下一 cell；
8. 不确定中断写 paused 并停止，不自动 retry。

不同 planned Run 之间允许进程重新启动；本 Goal 不依赖跨进程 Session resume。

### 7.5 Manifest and ledger

V1-A deterministic Manifest 保持历史只读。V1-B 新建 versioned execution
Manifest，至少固定：

- exact Workbench Commit/tree/source digest；
- Pi Commit/version；
- task/Skill/System Prompt/Tool/Verifier/model/profile/protocol digests；
- all 24 `cell_id` and preallocated `planned_run_id`；
- task/repetition/order/strategy；
- all budgets；
- Failure Taxonomy、denominator、terminal/evidence schema；
- credential profile identity，不含 value。

Manifest 不保存运行中 disposition。Pilot ledger 追加 `planned → started →
terminal|invalid|paused` transition；Manifest 不可回写。

## 8. Frozen Pilot Protocol

### 8.1 Tasks and strategies

```yaml
tasks:
  - v1-parse-duration
  - v1-bounded-index
  - v1-state-transition
  - v1-stable-format
repetitions_per_task: 2
strategies:
  A: baseline
  B: skill_only
  C: skill_plus_runtime_control
initial_cells: 24
maximum_C_child_attempts: 8
maximum_started_attempts: 32
```

### 8.2 Proposed deterministic block order

正式 Contract 接受后，Stage 1 必须将以下 order 写入 execution Manifest template；
不得根据真实 Outcome 调整：

| Block | Task | Rep | Within-block order |
| ---: | --- | ---: | --- |
| 1 | `v1-parse-duration` | 1 | A → B → C |
| 2 | `v1-bounded-index` | 1 | A → C → B |
| 3 | `v1-state-transition` | 1 | B → A → C |
| 4 | `v1-stable-format` | 1 | B → C → A |
| 5 | `v1-parse-duration` | 2 | C → A → B |
| 6 | `v1-bounded-index` | 2 | C → B → A |
| 7 | `v1-state-transition` | 2 | A → B → C |
| 8 | `v1-stable-format` | 2 | B → C → A |

六种排列各至少出现一次；各 arm 在每个 slot 出现 2 或 3 次。这降低简单顺序偏差，
但不声称 model seed 或 Outcome 可复现。

### 8.3 No post-outcome selection

禁止：

- 删除不利 task/cell；
- 修改 repetition/order；
- same-Run retry；
- silent replacement；
- fallback model/provider；
- 因全部初次通过、没有 Recovery 或某 arm 暂时领先而提前停止；
- 为强迫 Recovery 故意破坏任务。

## 9. Budget Contract

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
  accumulated_active_execution_time_ms_max: 7200000
  alternate_model_fallback: false
  retry_same_run: false
  automatic_replacement: false
```

规则：

- 每次 Provider request、Tool call 和 child Attempt 前原子 reserve；
- reservation 同时检查 Attempt、Run、Pilot 三层；
- 不足则不 dispatch；
- unknown usage/cost 不是 0，必须 pause；
- response 后实际 usage 超 reservation/cap 时 terminalize guardrail failure 并暂停；
- active execution time 不包含 Main/User 人工等待，但每 Attempt/Run wall time 独立；
- USD2 是 hard cap，不是消费目标。

## 10. Failure Taxonomy and Denominator

真实 Outcome 前冻结：

| Class | Definition | Effect denominator | Pilot behavior |
| --- | --- | --- | --- |
| `task_pass` | valid terminal evidence，Verifier pass | include | continue |
| `task_fail` | valid terminal evidence，Verifier fail | include as failure | continue；only eligible C may recover once |
| `treatment_guardrail_failure` | treatment 导致 protected mutation、budget overrun、invalid completion/evidence/terminalization | include as arm failure/guardrail | terminalize；根据 hard Pause rule 停止 |
| `infrastructure_invalid` | 预声明且有证据的 treatment-independent Provider/OS/process/workspace infrastructure failure | exclude only from effect success denominator；retain planned/started/invalid | apply invalid threshold |
| `evidence_invalid` | treatment-independent evidence persistence/inspection failure | exclude only when attribution is proven；retain all counts | pause unless predeclared terminal handling applies |
| `global_budget_stop` | next dispatch cannot fit whole-Pilot reserve | no hidden failure reassignment | pause Pilot |
| `paused_unclassified` | attribution or terminal state cannot be proven | do not exclude | pause Pilot |

### 10.1 Attribution rules

- Execution Session只能应用预冻结 decision table，不得创造新排除理由；
- treatment-caused invalid 永不从对应 arm denominator 消失；
- 无法证明 treatment-independent 时，按 `paused_unclassified`；
- 每个 invalid 保存 cause ID、evidence、affected boundary 和 attribution basis；
- replacement 默认不存在，因为 24 initial cells 已用尽 cap；
- 任何 replacement/repeat 必须新 Run ID、保留原证据，并由 Main/User 另行修订。

### 10.2 Invalid threshold

每个 cell terminal 后计算：

```text
infrastructure_or_evidence_invalid_count / started_run_count
```

达到或超过 25%，或同一 infrastructure/evidence cause ID 第二次出现，立即暂停整个
Pilot。不得继续凑满样本。

## 11. Evidence Contract

### 11.1 Per-cell write-once evidence

- experiment/manifest/cell/planned-run/actual-run identity；
- task/repetition/order/strategy；
- Workbench/Pi/source/task/Skill/System Prompt/Tool/Verifier/model digests；
- Workspace、Session、Journal、Attempt、Tool、Provider、Verifier、Outcome refs；
- complete initial fairness projection/proof；
- request/tool/token/time/cost reservations and actual usage；
- initial/final Verifier checkpoints；
- C eligibility/decision/reserve/Failure Packet/parent-child lineage；
- terminal/invalid/paused disposition；
- secret/reasoning/protected-path scan；
- exact commands/exit codes where applicable。

### 11.2 Secret and reasoning boundary

- real value only exists in opaque credential resolver/Provider boundary；
- `DEEPSEEK_API_KEY` name may be recorded，value/length/hash/prefix/suffix may not；
- errors crossing the public factory/runner boundary are sanitized；
- no raw Authorization header；
- no chain-of-thought/reasoning blocks；
- fake marker counterexamples required in Stage 1/Audit；
- scan failure is a Pause Condition，不可只删 artifact 后继续。

### 11.3 Inspector and aggregator

Inspector/aggregator：

- read-only；
- independently load terminal artifacts；
- cross-check Manifest membership and ledger transition；
- reject missing/duplicate/mixed-revision/drifted/overwritten evidence；
- recompute metrics，不信任 execution summary；
- never mutate Run/Manifest/ledger。

## 12. Stage 1 Gates

### Gate A — Control and identity

- root HEAD exact Control Baseline；
- tracked/staged clean；
- only registered untracked `reference/` may exist；
- Pi exact/clean；
- Contract accepted/active and Stage 1 explicitly authorized；
- credential/network/provider/model counters all 0。

### Gate B — Source boundary

- source delta only in §6.2 allowlist；
- no Pi/private import/dependency install；
- accepted task/Skill/Verifier/System Prompt fixtures unchanged；
- no SDK/RPC/Extension/provider platform。

### Gate C — Concrete public composition

- tracked factory imports public emitted Pi only；
- fixed DeepSeek profile；
- fake construction can open/close a Run handle with 0 dispatch；
- one authority cannot open a second Run；
- one Run can perform bounded multiple fake requests。

### Gate D — Fairness

- complete B/C initial dispatch equality；
- negative descriptor/options drift counterexamples fail；
- A/B only intended Skill delta；
- no policy/experiment identity in model context。

### Gate E — Attempt and recovery

- A/B no child；
- C pass no child；
- invalid failure no child；
- only eligible valid C failure + full reserve creates one child；
- same Session/Workspace parent-child lineage。

### Gate F — Budget and authority

- every request/tool/child pre-reserved；
- three-level caps；
- invalid usage fail closed；
- no fallback/retry/replacement；
- Pilot pause thresholds enforced。

### Gate G — Manifest, ledger and terminalization

- immutable execution Manifest template；
- preallocated 24 members；
- unique next-cell selection；
- write-once ledger/terminal artifacts；
- pause cannot silently advance；
- Inspector rejects all required counterexamples。

### Gate H — Zero-call 24-cell simulation

- all 24 initial Faux cells planned/executed/terminalized once；
- C pass/fail/child cases covered；
- maximum 32 Attempts/256 requests/384 tools/USD2 simulated；
- real credential/network/provider/model counters remain 0。

### Gate I — Secret/evidence boundary

- resolver/transport/provider/factory/public handle fake-marker errors sanitized；
- no reasoning payload；
- protected-path and hidden Verifier boundaries pass；
- evidence scan passes。

### Gate J — Fresh Windows and regressions

- strict TypeScript；
- exact source/fixture/Manifest identity from Git blobs and fresh
  `core.autocrlf=true` checkout；
- V1-B focused tests；
- V1-A focused regression；
- necessary V0-C real-route/Completion/evidence regressions；
- full regression only if concrete non-local evidence requires it。

## 13. Stage 1 Definition of Done

Stage 1 满足全部：

1. Gates A–J pass；
2. tracked concrete public Pi composition exists；
3. one-cell runner/ledger/Inspector/CLI exists；
4. 24-cell zero-call simulation passes；
5. all real-call/network/credential counters 0；
6. Contract traceability matrix includes clause → source → positive test → counterexample
   → evidence；
7. no unauthorized source/control/Pi/reference delta；
8. reports/deltas/commands/evidence complete；
9. Stage 1 Session stops without commit or acceptance；
10. Main Session can create a reproducible Candidate Commit。

Stage 1 suggested disposition：

```text
PASS_V1_B_STAGE1_EXECUTION_READY
REVISE_V1_B_STAGE1
PAUSE_V1_B_STAGE1
```

它不关闭 V1-B，也不证明真实 route/Skill/Runtime 效果。

## 14. Focused Independent Audit Contract

Audit 从 Main Session 创建的 exact Candidate Commit/tree 在 fresh Windows
worktree 执行，只覆盖：

1. frozen Git/source/fixture/Manifest identity；
2. public Pi import/composition；
3. complete B/C fairness；
4. Run authority 和 credential/error sanitation；
5. usage/cost/per-dispatch budget；
6. C-only eligibility/order/lineage/reserve；
7. Manifest/ledger/write-once terminal/Inspector；
8. hidden Verifier/protected paths/secret/reasoning；
9. targeted V1 + necessary V0 regressions。

Audit 不运行真实 Provider，不全面重审 Pi/V0/Windows，不研究 SDK/Extension，不修复
源码。每项 finding 必须含：severity、Contract boundary、source symbol、独立反例、
evidence、candidate impact、minimal correction owner 和 required regressions。

通过 disposition：`PASS_FOCUSED_V1_B_STAGE1_AUDIT`。

## 15. Execution Baseline Freeze

Audit 通过后，Main Session在用户授权下：

1. 接受 audited source Candidate；
2. 将 final Commit/tree/source digest 写入 execution Manifest；
3. 固定当前官方 DeepSeek descriptor/pricing snapshot identity；
4. 运行 zero-call identity/preflight；
5. 创建 Execution Baseline Commit；
6. 核验 tracked clean、Pi clean、reference untouched；
7. 生成绑定 exact SHA 的 Stage 2 Prompt；
8. 等待独立的 Stage 2 real-call authority。

Candidate 后只允许 deterministic identity materialization。若 task、Skill、Verifier、
System Prompt、Tool、provider behavior、budget 或 protocol 改变，必须重新判断
Candidate/audit，而不能称为“只绑 Manifest”。

## 16. Stage 2 Gates

### Gate K — Frozen execution identity（0 calls）

- exact Execution Baseline HEAD/tree；
- tracked/staged clean；
- Pi exact/clean；
- execution Manifest/24 cells/digests valid；
- product surface dry preflight pass；
- no source/fixture/control delta。

### Gate L — Current official Provider checkpoint（0 calls）

- official DeepSeek API endpoint/model descriptor available；
- exact model remains `deepseek-v4-flash` or Main/User separately resolve drift；
- usage/pricing fields sufficient for fail-closed budget；
- no fallback/retry needed；
- checkpoint source URLs/timestamps captured without copying credentials。

Descriptor drift、unverifiable pricing/usage 或 fallback need 立即暂停，不由 Execution
Session选新 model。

### Gate M — Authority and credential boundary（before first dispatch）

- user Stage 2 authorization recorded；
- USD2 cap recorded；
- opaque credential presence confirmed；
- value not logged/serialized；
- one Pilot execution authority cannot be reused；
- initial whole-Pilot reserve valid。

### Gate N — Cell loop

For each next cell：

1. verify Manifest/ledger/identity；
2. apply invalid threshold；
3. reserve Budget；
4. run exactly one cell；
5. terminalize/write-once；
6. inspect evidence；
7. update append-only Pilot ledger；
8. continue only if no Pause Condition。

### Gate O — Final reconciliation

- every planned cell terminal/invalid/paused；
- no missing/duplicate/retry/replacement；
- all 24 cells terminal only when Pilot completes without pause；
- attempt/request/tool/token/time/cost totals within caps；
- secret/reasoning scans pass；
- Inspector/aggregator independently pass。

## 17. Stage 2 Definition of Done

V1-B Pilot 完成要求：

1. Gates K–O pass；
2. exact frozen product surface，source delta 0；
3. all planned membership reconciled；
4. common Verifier and initial budget maintained；
5. only eligible C consumed child reserve；
6. invalid attribution/denominator frozen rules applied；
7. no budget/secret/reasoning/protected-path breach；
8. raw/redacted evidence and aggregate report complete；
9. observed result remains descriptive；
10. Execution Session stops without accepting V1-B or committing。

Goal validity disposition 与 Policy recommendation 分开：

```yaml
goal_execution_disposition:
  - PASS_VALID_V1_B_PILOT
  - PAUSE_V1_B_PILOT
  - INVALID_V1_B_EVIDENCE

policy_recommendation:
  - PROMOTE
  - REVISE
  - REJECT
  - INCONCLUSIVE
```

`PASS_VALID_V1_B_PILOT` 只表示协议与证据有效，不表示 Skill 或 Runtime 获胜。

## 18. Deliverables

### 18.1 Stage 1 Preparation Session

- `docs/reports/V1_B_STAGE1_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V1_B_STAGE1_CLOSEOUT_DRAFT.md`；
- Source Delta；
- Commands/Exit Codes；
- Evidence Index；
- Contract Traceability Matrix；
- Execution Baseline/Manifest Binding Proposal；
- `CURRENT_STATE_UPDATE_PROPOSAL`。

### 18.2 Audit Session

- `docs/reports/V1_B_STAGE1_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`；
- ignored audit-local Evidence Index；
- exact Candidate/Pi/worktree identity；
- findings/counterexamples；
- zero credential/network/provider/model accounting。

### 18.3 Stage 2 Execution Session

- `docs/reports/V1_B_PILOT_EXECUTION_REPORT.md`；
- `docs/reports/V1_B_AGGREGATE_REPORT.md`；
- `docs/reports/V1_B_CLOSEOUT_DRAFT.md`；
- raw/redacted Evidence Index；
- membership reconciliation；
- per-arm/checkpoint descriptive metrics；
- request/tool/token/time/cost/invalid report；
- execution disposition + policy recommendation；
- `CURRENT_STATE_UPDATE_PROPOSAL`。

## 19. Pause Conditions

任何适用 Session 命中以下条件立即停止：

1. HEAD/tree/Pi/Manifest identity 不符；
2. 需要 Pi patch/private import/SDK/RPC/Extension 才能继续；
3. 需要安装/下载依赖或 model data；
4. source delta 超 §6.2 或 accepted fixtures 需要改变；
5. public concrete factory 无法零调用构造；
6. B/C complete initial dispatch 不一致；
7. credential/reasoning/hidden acceptance 泄露；
8. Agent 可写 protected tests/Verifier/acceptance/control；
9. per-request/tool/child 不能在 dispatch 前 reserve；
10. unknown usage/cost 无法 fail closed；
11. 任一 request/tool/token/time/cost cap 越界或即将越界；
12. same-Run retry、fallback、replacement 或人工挑 cell 才能继续；
13. C child eligibility/lineage/reserve 无法证明；
14. Manifest/ledger/terminal/Inspector 不一致；
15. infrastructure/evidence invalid 比例达到 25%；
16. 同一 infrastructure/evidence cause 第二次出现；
17. frozen source defect 在 Stage 2 暴露；
18. current DeepSeek descriptor/pricing/usage 改变或不可核验；
19. V1-B 开始建设 provider/eval/scheduler/database/dashboard/Worktree 平台；
20. Scope 扩到 V2 multi-path、V3 Experience 或 general Skill routing。

Pause 时只提交：观察、证据、已消费预算、terminal/ledger 状态、为什么不能安全
继续、Main/User 需要决定的选项。不得临场修复或追加 Run。

## 20. Non-goals

- statistical benchmark/significance；
- general Skill effectiveness；
- multi-model/provider；
- autonomous Skill selection/curation；
- general Provider/Credential/Eval platform；
- database/dashboard/scheduler；
- Git Worktree product feature；
- OS sandbox/network egress guarantee；
- cross-process in-flight/settled Session resume；
- clean-Session/clean-Workspace multi-path Recovery；
- V2/V3/V4/V5 implementation；
- SDK/Extension adoption or compatibility audit；
- Pi Core change。

## 21. Claims

### 21.1 Allowed after Stage 1 acceptance

- tracked public Pi execution composition exists；
- bounded one-cell product surface, Pilot ledger and Inspector pass zero-call tests；
- high-risk boundaries passed focused Candidate audit。

Not allowed：真实 route 已调用、Skill/Runtime 有效、Pilot 完成。

### 21.2 Allowed after valid Stage 2 completion

- exact fixed environment 下 A/B/C 的 observed descriptive result；
- observed cost/usage/invalid/guardrail；
- natural Recovery 是否出现及其 observed effect；
- full membership/no retry/budget compliance。

Not allowed：statistical significance、universal improvement、production-ready、
multi-path/Experience complete。

## 22. Main Session Acceptance Checklist

Main Session 最终至少：

1. 核对 Execution Baseline/Manifest/source delta 0；
2. 抽查 A、B、C 和实际 child（若有）的完整证据链；
3. 独立运行 Inspector/aggregator；
4. 复算 membership/attempt/request/tool/token/time/cost；
5. 检查 no retry/fallback/replacement/deletion；
6. 核对 invalid attribution/denominator；
7. 检查 secret/reasoning/protected-path scans；
8. 区分 Fact/Inference/Recommendation；
9. 不把“无 Recovery”误判为无效 Pilot；
10. 与用户决定 execution validity 和 policy recommendation；
11. 获得用户授权后才同步 Closeout/`CURRENT_STATE`/Commit。

Stage 2 无 source delta 且 evidence consistent 时不自动再做 source audit。只有具体
evidence/terminal/identity 冲突才建议新的有限审计。

## 23. Accepted Contract and Current Stop Point

```yaml
accepted_user_decisions:
  contract: accepted
  activation: authorized
  control_baseline_commit: authorized
  stage_1_preparation_session: authorized
  stage_1_real_model_calls: 0
  stage_2: not_authorized
```

当前唯一顺序：

```text
Main Session同步 active_goal 和 Stage 1-only 控制事实
→ Main Session创建并核验干净 Control Baseline Commit
→ Main Session生成绑定 exact SHA 的 Stage 1 Preparation Session Prompt
→ 新 dedicated Session从该 Commit 执行 Gate A
→ Stage 1 Session完成零调用实现、报告和 CURRENT_STATE_UPDATE_PROPOSAL 后停止
→ Main Session验收
```
