# V2-B Bounded R2 Amendment — Controlled Recovery Seed and Real Two-path Acceptance

```yaml
status: executed_closed_negative_not_valid_limited_closeout_accepted
goal_id: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
amendment_id: V2_B_BOUNDED_R2
version: V2
accepted_by_user: true
accepted_at: 2026-08-07
activated_at: 2026-08-07
control_baseline_commit_authorized: true
control_baseline_commit: resulting_HEAD_of_this_revision
implementation_owner: original_v2_b_stage_1_top_level_session_or_one_fresh_top_level_replacement
implementation_real_model_calls_authorized: 0
implementation_credential_reads_authorized: 0
implementation_network_authorized: false
focused_audit_authorized: consumed_passed
r2_execution_owner: completed_top_level_task_019fdbfe-b7a1-7080-a58f-27fb8093f124
r2_execution_real_access: consumed_no_further_access_authorized
r2_execution_baseline_commit: 571165a186444e16a0fafad2fcd886295d7efbab
r2_execution_baseline_tree: bb7245412093f132fec4236711e7bbda96d0a1c1
r2_sequence_id: v2b-r2-real-20260807-02
r2_sequence_status: paused
r2_sequence_reason: negative_not_valid
r2_main_disposition: PAUSE_V2_B_R2_NEGATIVE_NOT_VALID
per_attempt_real_cost_usd_max: 0.20
per_recovery_group_real_cost_usd_max: 0.60
r2_plus_one_infrastructure_replacement_real_cost_usd_max: 1.40
final_v2_b_acceptance_authorized: consumed_for_limited_closeout_not_pass
final_v2_acceptance_authorized: consumed_for_limited_closeout_not_pass
v3_authorized: false
pi_core_patch_authorized: false
sdk_extension_rpc_route_switch_authorized: false
third_recovery_path_authorized: false
```

> Closeout control update (2026-08-07): R2 ended at the binding
> `PAUSE_V2_B_R2_NEGATIVE_NOT_VALID` hard stop. The user accepted a limited
> closeout that preserves the valid controlled Seed/A/B/Selection evidence and
> the incomplete real Negative together. This is not a full R2 PASS and grants
> no continuation authority.

> 本 Amendment 是用户接受并激活的 V2-B R2 绑定修订。它只覆盖与 R1 自然触发正例、
> quiescent budget terminal、证据扫描和 R2 执行序列冲突的原 Contract 条款；未被明确覆盖的
> `V2_B_GOAL_CONTRACT.md` Scope、权限、预算、数据合同、Session 分权、Pi 边界和 Claims 继续有效。

## 1. Why R2 Is Necessary

### 1.1 Immutable R1 result

R1 `v2b-real-20260807-01` 必须永久保留为历史暂停证据：

```yaml
execution_baseline: a76cb3f340d26dc3dd336628761d22546886db27
primary_attempts: 1
provider_model_calls: 8
tool_calls: 10
tokens: 13262
known_cost_usd: 0.0004849208
verifier_runs: 0
recovery_seed: null
candidates: 0
negative_executed: false
terminal: paused_run_invalid
```

R1 证明了 Gate H、Direct real `AgentHarness` route、预算预留、已知 usage/cost 归并和 post-dispatch
fail-closed stop；它没有形成外部 Verifier 失败边界，因而没有回答 V2 Version Question。R1 的
`.runs`、Session、Journal、ledger、terminal 和报告不得覆盖、补写或重新命名为 R2 证据。

### 1.2 Two bounded defects/limitations

1. `inspect-v2.ts` / `inspect-v2b.ts` 以 path-insensitive byte regex 拒绝所有名为
   `reasoning` 的字段；R1 的命中路径仅为 `$/message/usage/reasoning`，而固定 Pi 将其定义为
   数值型 token usage metadata。该规则必须改为 schema-aware allow-only classification，不能
   简单删除 reasoning/secret 检查。
2. R1 第八个已知响应后，下一次 dispatch 的预算预留被安全拒绝；进程无 pending Provider/Tool
   副作用，Session 和 Workspace 已持久化，但旧合同将这一 quiescent terminal 直接判作 invalid，
   因而未运行外部 Verifier。环境结果型 Workbench 应允许在严格安全条件下验证此时的 Workspace，
   同时如实记录 Agent 未以普通 `settled` 结束。

## 2. Binding Interpretive Correction

V2 的核心问题是 Harness 能否从一个有效、不可变、Verifier-failed 的 Recovery Seed 运行两条
真实恢复路径并选择 passing Candidate 或 `none`。它不要求失败 Seed 必须由同一次真实模型自然
失败随机触发。

R2 因此将证据拆为两个不混淆的阶段：

```text
zero-call controlled primary Attempt
→ Direct public AgentHarness + public Pi JSONL Session
→ settled
→ public/maintenance check passes
→ external target Verifier fails
→ freeze immutable Recovery Seed

same frozen Seed
├─ A: real DeepSeek + parent-history JSONL fork
└─ B: real DeepSeek + fresh JSONL Session
→ independent target Verifier
→ hard-gate-first Selection or explicit none

separate real stable-format Negative
→ target Verifier passes
→ no Failure Packet / Seed / Candidate / Selection
```

这一修订允许回答：

> 在一个由真实 Direct Pi lifecycle 产生并由外部 Verifier确认的受控失败边界上，Workbench 是否能
> 执行真实模型的两路径恢复、独立验证和确定性选择。

它不能回答：

- 自然真实模型初始失败的发生率；
- 从同一模型自然失败到恢复的单次全链路成功率；
- A 或 B 在一般 Coding Task 上更优；
- 受控 Seed 中的父历史与真实模型自然失败历史完全等价。

## 3. Frozen R2 Cases

### 3.1 Controlled Positive Seed

```yaml
case_id: controlled_parse_duration_recovery_seed
task_id: v1-parse-duration
initial_provider: deterministic_faux_zero_external_access
historical_failure_pattern: v1c_r2_cell_14_parse_duration_skill_only
public_maintenance_check_expected: pass
external_target_verifier_expected: fail
primary_agent_lifecycle_expected: settled
candidate_count_after_seed: exactly_2
```

受控 initial Provider 只能将 Workspace 写成一个已知局部实现：它支持 `ms` 和 `s`，能通过任务
public test，但不满足 external target Verifier 的全部 invalid-input/单位行为。该 fixture 必须：

- 作为新的 tracked V2 R2 fixture 保存，记录来源 Run、原始片段和 SHA-256；
- 不修改 accepted V1 Task、Skill、Verifier 或历史 `.runs`；
- 实际经过 Direct public `AgentHarness`、Tool lifecycle 和 public JSONL Session，而不是由 host
  直接复制成失败 Workspace；
- 在 Agent `settled` 后先运行 public/maintenance check，再运行外部 target Verifier；
- 只有 maintenance pass、target fail、Session/Workspace/Verifier evidence valid 时才能冻结 Seed；
- 在任何 Candidate materialization 前写完并校验 Recovery Seed。

### 3.2 Real Recovery A/B

R2 从同一个受控 Seed 恰好运行：

| Path | Session | Workspace | Provider |
|---|---|---|---|
| A `continue_failed_session` | public JSONL fork，保留完整 parent entries 与 lineage | Seed 的隔离字节副本 | fixed DeepSeek V4 Flash |
| B `fresh_session_from_failure_seed` | public JSONL create，run 前 parent entries 为 0 | 同一 Seed 的另一个隔离字节副本 | 同一 fixed DeepSeek V4 Flash |

A/B 的 Task、Skill、Failure Packet、即时恢复 Prompt、Tool Profile、Verifier、Model/Profile、预算、
Pi/Workbench/Manifest identity 必须相同。唯一主要处理差异仍是 parent Session history。A/B 都必须
运行和 terminal；A 先通过不得跳过 B。

### 3.3 Real Negative

```yaml
case_id: stable_format_negative
task_id: v1-stable-format
provider: fixed_DeepSeek_V4_Flash
expected: target_verifier_pass_and_no_recovery_objects
```

Negative 与 A/B 使用同一 audited Execution Baseline、Provider/Profile、Tool/Prompt/Skill 和预算
边界。若 target Verifier 不通过、Evidence invalid 或创建了 Recovery 对象，R2 必须停止；不得替换
Negative task。

## 4. Quiescent Budget Terminal

R2 不增加 provider request、Tool、token、time 或 Verifier 上限。单 Attempt 的第 9 次 dispatch 仍
必须在请求前被拒绝。只有同时满足以下条件时，`pre_dispatch_budget_terminal` 才是可验证的安全终态：

1. 拒绝发生在 Provider dispatch 前；
2. 没有 pending Provider response；
3. 没有 pending Tool Call、Tool Result 或未归档 side effect；
4. 之前所有 response usage 均已知且未超过 cap；
5. JSONL Session 已持久化且可重开；
6. Workspace 可读、路径策略和 protected-path scan 有效；
7. Journal、budget ledger 和 terminal identity 闭合；
8. 只运行一次 external Verifier，且 Verifier 不在 Agent writable boundary 内。

满足上述条件后必须运行 Verifier：

- Verifier pass：Candidate 可继续进入其余 hard gates；Negative 可形成有效 no-branch pass；
- Verifier fail：Candidate 明确 rejected；initial controlled Seed/Negative 按各自合同处置；
- Evidence/usage/side-effect 状态不明：仍为 invalid/Pause，不得运行或采用结果。

报告必须同时保留 `agent_completion: pre_dispatch_budget_terminal` 和 Verifier 结果。不得把它描述成
普通 `AgentHarness settled`，也不得把安全预算终态推广为任意 crash/timeout 的可接受终态。

## 5. Schema-aware Evidence Boundary

Inspector 只能对精确 JSON/JSONL schema path 允许：

```text
message.usage.reasoning = finite non-negative number
```

以下继续 fail closed：

- `reasoning_content`；
- thinking/reasoning content blocks 或字符串内容；
- `thinkingSignature`、`thoughtSignature`、`signature`；
- Authorization、Bearer、Credential、API key 或环境变量赋值；
- 非有限、负数、字符串、对象、数组或出现在其他 path 的 `reasoning`；
- 无法解析或 schema 未知的包含相关 key 的 artifact。

V2/V2-B Inspector 必须用 deterministic positive/negative fixtures 证明 allowance 足够窄，并验证
Tool Call/Tool Result identity、顺序和 terminal relationship 未因 parser 改造而弱化。

## 6. R2 Identity, Evidence and Replacement Rule

R2 必须拥有新的：

- Amendment-bound Manifest ID 与 Sequence ID；
- source digest、Execution Baseline SHA/tree 和 Pi SHA；
- Controlled Seed/parent Session/failed Workspace/Verifier digests；
- A/B Run、Attempt、Session、Workspace、Candidate、Selection IDs；
- Negative Run/Attempt/Session/Workspace/Verifier IDs；
- independent Inspector output、raw-to-derived budget/cost/counter reconciliation。

R2 正常序列只运行一次。最多允许一次完整 Recovery Group 的 infrastructure-only replacement，且：

1. 仅限 Credential resolution、transport、provider service 或本地进程启动等客观基础设施故障；
2. 原 A/B 没有形成完整、有效、可比较的 pair；
3. 原始证据保持不变并进入最终报告；
4. 必须从同一个 frozen Seed 重新运行完整 A/B group，禁止只替换单臂；
5. 不得用于 task failure、A/B 均 fail、Selector 为 none、结果不漂亮、Negative failure 或提高胜率；
6. R2 与这一次 replacement 的总真实成本合计不超过 USD 1.40。

## 7. Session Ownership and Control Sequence

只使用三个非 Main 顶层 Codex Session角色，不使用子 Agent：

1. **Implementation Session**：优先返回原 V2-B Stage 1 顶层 Session；若不可恢复，允许创建一个
   fresh 顶层 Replacement Implementation Session。它只有零调用 source/test/fixture/report 权限。
2. **Focused Audit Session**：Candidate freeze 后创建一次 fresh 顶层只读审计，范围只覆盖本
   Amendment 的 Seed、fairness、budget terminal、Inspector、F2P/P2P 与必要回归。
3. **R2 Execution Session**：audited Execution Baseline 后创建 fresh 顶层 no-source-edit Session，
   先 Gate H，随后才 opaque 读取 Credential、联网和执行真实 A/B + Negative。

唯一顺序：

```text
accepted Amendment + Main Goal mode
→ Main Control Baseline Commit
→ zero-call Implementation
→ Main light review / allowlist correction
→ Main Candidate Commit
→ one fresh focused audit
→ hit-specific correction and re-review when required
→ Main audited Execution Baseline Commit
→ fresh R2 Execution Session
→ Gate H with zero access
→ controlled Seed
→ real A/B
→ real Negative
→ Main evidence review and V2 disposition recommendation
→ stop for user final acceptance decision
```

Implementation/Audit/Execution Session 均不得修改 `CURRENT_STATE.md`、正式 Charter/Contract/
Amendment、Git index/commit 或 Pi。Main 不代替它们实现、审计或运行真实结果。

## 8. Zero-call Implementation Allowlist

在原 V2-B allowlist 基础上，本 Amendment 允许有界修改或新建：

- `workbench/src/contracts/v2-types.ts`；
- `workbench/src/contracts/v2b-types.ts`；
- `workbench/src/run-v2.ts`；
- `workbench/src/run-v2b.ts`；
- `workbench/src/inspect-v2.ts`；
- `workbench/src/inspect-v2b.ts`；
- `workbench/src/pi/pi-run-handle-v2b.ts`；
- `workbench/src/product-surface-v2.ts`；
- `workbench/src/product-surface-v2b.ts`；
- `workbench/src/cli.ts`；
- `workbench/tests/v2b-stage1.test.ts`；
- `workbench/tests/v2b-r2.test.ts`；
- `fixtures/recovery/v2b-r2/**`；
- `workbench/package.json`、`workbench/README.md`；
- `docs/reports/V2_B_BOUNDED_R2_*` Implementation/Closeout/Source Delta/Evidence Index 报告。

实现必须从当前 `executeRunV2A()` 提取或暴露一个最小的 Seed-to-Recovery-Group seam，使 accepted
V2-A 和 R2 共用同一个 Seed/Workspace/Session/Verifier/Selector Controller。不得复制第二套
Controller。优先保持概念边界：

```text
prepareAndFreezeRecoverySeed()
executeRecoveryGroupFromSeed()
```

具体 symbol 名可由实现选择，但 source delta/report 必须证明复用关系和 V2-A regression。

继续禁止修改 accepted V1 Task/Skill/Verifier fixtures、`selector-v2.ts`、Pi、reference、依赖/lockfile、
SDK/Extension/RPC route、第三路径和 `.runs` 历史证据。

## 9. Required Deterministic Evidence

零调用阶段至少证明：

1. controlled Provider 实际通过 Direct AgentHarness/Tool 写入局部实现并 settled；
2. public/maintenance pass + target Verifier fail 才能形成 Seed；
3. Seed 在任何 Candidate 前 write-once，A/B 初始 Workspace digest 相同；
4. A parent JSONL fork 保留 exact parent entries/lineage，B fresh entries 为 0；
5. A/B 共同 Artifact bytes 相同且 Session history 是主要 delta；
6. safe pre-dispatch budget terminal 的全部八项条件和 Verifier-after-terminal 分支；
7. unsafe/pending/unknown usage/overflow/side-effect terminal 继续 fail closed；
8. numeric `message.usage.reasoning` exact-path pass，content/signature/secret/unknown-shape fail；
9. F2P/P2P：maintenance pass 与 target fail/pass 分离且 treatment-caused invalid 不消失；
10. Negative pass 不创建 Failure Packet/Seed/Candidate/Selection；
11. A/B pass/fail、fail/pass、fail/fail 与 safe-budget-terminal 组合选择正确；
12. strict TypeScript、V2-A full regression、V2-B focused regression 和必要 V1 Provider/path tests pass；
13. Credential、network、external Provider/model、真实成本全部为 0；
14. source delta 严格落在 allowlist，Pi fixed/clean。

## 10. Focused Audit Scope

独立审计只回答：

- Controlled Seed 是否经 Direct Pi public JSONL route 形成、在 Candidate 前冻结且来源如实；
- A/B Workspace/Artifact 是否相同、Session lineage 是否是唯一主要差异且无串扰；
- safe budget terminal 是否严格限于 pre-dispatch quiescent boundary；
- Inspector 是否只允许精确数值 usage path，并继续拒绝 content/signature/secret；
- public/maintenance 与 target Verifier 的 F2P/P2P 语义是否未被混淆；
- V2-A 与必要 V1/V0 回归是否保持。

Audit 不修源码、不扩大到通用 durable runtime、全项目 secret audit 或 Pi SDK/Extension 研究。

## 11. R2 Gates

### Gate R2-A — Control Baseline

Amendment/Contract/CURRENT_STATE/AGENTS 一致；tracked/staged clean；Pi fixed/clean；Implementation owner、
zero-access 与 allowlist 明确。

### Gate R2-B — Controlled Seed and Shared Controller

受控 Seed 经过 Direct public route；maintenance pass/target fail；write-once ordering、Session persistence、
Workspace digest 与 shared Controller seam 全部可复核。

### Gate R2-C — Terminal and Inspector Correction

safe/unsafe budget terminal、Verifier ordering、usage/secret schema positive/negative tests全部通过。

### Gate R2-D — Regression and Zero Access

strict TypeScript、focused R2、V2-A 和必要 V2-B/V1 regressions 通过；零 Credential/network/external/
real call/cost；source allowlist 和 Pi boundary通过。

### Gate R2-E — Candidate Audit

Main 冻结 Candidate；fresh focused audit无 blocking finding，或命中项返修并复审通过。

### Gate H-R2 — Fresh Execution Preflight

exact audited Execution Baseline SHA/tree、Manifest ID、source/fixture digest、Pi SHA、Credential authority和
预算匹配；tracked/staged clean；focused tests/Inspector pass；所有 R2 real counters 为 0。

### Gate I-R2 — Controlled Seed and Real A/B

Seed 只做 zero-call deterministic primary；Seed valid 后真实 A/B 各启动一次并 terminal；A/B fairness、
Verifier、Selector、usage/cost/lineage完整。A/B 都 fail 时 `selected_candidate_id: null` 是有效机制结果。

### Gate J-R2 — Real Negative

stable-format 只启动一次；target Verifier pass；无 recovery object/extra recovery call。失败立即停止，
不得换 Case。

### Gate K-R2 — Final Reconciliation

全部 started Attempt 有 terminal；Inspector read-only pass；raw/derived counters/cost一致；secret/protected
scan pass；R2 Execution source/tracked delta 为 0；Pi fixed/clean。

## 12. R2 Definition of Done

R2 证据完成至少要求：

1. R1 历史证据与报告已提交并保持不可变；
2. Amendment、Goal mode、Control Baseline 与顶层 Session owner 已冻结；
3. zero-call controlled Seed 机制与 shared Controller seam 实现并通过 focused audit；
4. Inspector false positive 和 safe budget terminal 得到 bounded、fail-closed 修正；
5. audited Execution Baseline 在真实访问前形成；
6. Controlled Seed 有 valid maintenance-pass/target-fail/settled/JSONL evidence；
7. real A/B 从相同 Seed 开始并都 terminal；
8. Selector 只选 passing Candidate 或明确 none；
9. real Negative pass 且无 recovery objects；
10. 全部 identity、usage、cost、Session、Workspace、Verifier、Selection 可 Inspect；
11. R2 Execution source/tracked delta 为 0，Pi patch/private import/route switch 为 0；
12. Main 形成回答 V2 Version Question 的 disposition 建议并停止等待用户。

DoD 不要求某条路径获胜，也不要求至少一个 Candidate pass；它要求真实 A/B 机制和 Negative 行为
证据有效。最终接受 V2-B/V2 仍由用户单独决定。

## 13. Hard Exit Conditions

任一命中立即停止连续推进：

1. Controlled Seed 无法通过 public Direct AgentHarness + JSONL Session route 形成；
2. 必须修改 Pi、private import、Selector、accepted V1 fixture 或切 SDK/Extension/RPC；
3. A/B Workspace/共同输入不相同，或 Session history不是唯一主要 treatment delta；
4. Credential、reasoning content、signature 或 secret 进入任何 Evidence；
5. 出现 post-dispatch unknown/lost Provider result、pending Tool/side effect或不可分类终态；
6. Negative target Verifier不通过或生成 recovery objects；
7. 需要第三条路径、额外 Case、提高非成本预算、task-result replacement 或 V3 能力；
8. second material architecture revision；
9. infrastructure replacement 不满足 §6 的全部条件或会使总真实成本超过 USD 1.40；
10. 实现、Audit、Execution 的顶层 Session/权限隔离无法保持。

普通编译、路径、fixture、schema、report defect 且落在 allowlist、未改变架构/实验语义/预算/身份时，
可返回 Implementation Session 有界修复后继续。

## 14. Allowed Dispositions and Claims

Main 在 Stage 2 后只能建议：

- `PASS_V2_B_R2_REAL_RECOVERY_SELECTED`：A/B 至少一条 passing 且正确选择，Negative有效；
- `PASS_V2_B_R2_MECHANISM_NO_PASSING_CANDIDATE`：A/B 全部有效 terminal、均未通过、Selector为 none，
  Negative有效；
- `REVISE_V2_B_R2_BOUNDED`：仍存在 allowlist 内可零调用修正的具体 defect，且未命中硬退出；
- `PAUSE_V2_B_R2_*`：Gate、Evidence、Negative、基础设施或权限条件不成立；
- `REJECT_V2_B_ROUTE`：Direct route 或核心机制被具体证据否定。

通过后允许声明：

- Workbench 从一个可复核的 controlled verifier-failed Seed 运行了真实 A/B recovery；
- A/B 的主要变量为父 Session history，均由同一 target Verifier判断；
- Selector 选择 passing Candidate 或正确选择 none；
- 一个真实 initial-pass Negative 没有产生恢复分支；
- 报告该受控 Case 的路径结果与资源成本。

始终禁止声明：自然真实模型失败被端到端恢复、A/B 普遍优劣、统计提升、自我进化、生产 durability、
OS sandbox、exactly-once Tool、Pi SDK/Extension 集成或 V3 已实现。

## 15. Authorization Record and Stop Point

用户已授权 Main 连续推进：Amendment/控制状态/Control Baseline、零调用 Implementation、allowlist返修、
Main 轻量验收、Candidate Commit、一次 fresh focused audit、命中项返修、audited Execution Baseline、
fresh R2 Execution、Gate H 后 opaque Credential/network/DeepSeek真实 A/B + Negative，以及最终 Main
处置建议。用户也已授权绑定本结果的 Goal mode。

本授权不包含最终 V2-B/V2 接受、V3、Pi 修改、SDK/Extension/RPC 切换、第三路径或本 Amendment
以外的 Case/预算扩张。Main 完成处置建议后必须停止，等待用户最终决定。
