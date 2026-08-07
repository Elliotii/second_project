# V2-B Bounded R2 Main Light Review and Correction Prompt

```yaml
status: bounded_correction_requested
date: 2026-08-07
review_owner: main_session
implementation_owner: original_top_level_v2_b_stage_1_implementation_session
control_baseline_commit: b1c8cf6045a0118452734bdf3cbe7b65fcd645ac
candidate_commit_created: false
real_access_authorized_for_this_session: false
final_v2_b_acceptance_authorized: false
final_v2_acceptance_authorized: false
```

## 1. Disposition

`REVISE_V2_B_R2_BOUNDED_BEFORE_CANDIDATE_FREEZE`

Main 的有限审阅接受以下实现方向，不要求重做：

- controlled Seed 经过 Direct public `AgentHarness`、Tool 和 JSONL Session 路线形成；
- A/B 复用同一个 V2 Controller，A fork、B fresh 的处理差异保持不变；
- frozen Workspace、Failure Packet、Prompt、Skill、Tool、Verifier 和预算身份保持共同；
- schema-aware scanner 仅允许精确数值 `message.usage.reasoning`；
- Negative、Selector、预算、Case、路径和真实执行序列均不扩张。

Candidate 暂不能冻结。以下两个 finding 都属于 Amendment allowlist 内的 verifier-safety / evidence
边界缺陷；应由原 Implementation Session 有界修复后返回 Main 窄复核。

## 2. Binding Scope

只允许修改当前 R2 Amendment §8 allowlist 中与以下 finding、对应测试和报告直接相关的文件。
不得新增实验 Case、Recovery 路径、Retry、Fallback、Replacement、预算、Provider dispatch、Verifier
次数或架构层；不得为了产生 A/B 差异或更好结果调整 fixture、Prompt、Skill、Verifier、Selector、
Model/Profile 或 Session treatment。

继续禁止：Credential 读取、网络、外部 Provider/model、真实调用、Pi/private import、SDK/Extension/RPC、
accepted V1 fixture、`selector-v2.ts`、控制文件、Git stage/commit 和 V3 设计。

## 3. Finding R2-MR-001 — Quiescent terminal is asserted, not raw-derived

Severity: `P1 / blocking_before_candidate_commit`

### Evidence

- `workbench/src/pi/pi-run-handle-v2b.ts` 当前在 `getEntries()` 成功后，直接把
  `pending_side_effects`、`prior_usage_known`、`session_persisted`、`workspace_persisted` 和
  `evidence_closed` 写成全真值；它没有重开 Session，没有验证 Workspace 持久状态，也不可能在该
  层知道 Controller 后续 Journal、budget/terminal identity 是否已经闭合。
- `workbench/src/run-v2.ts` 的 Candidate 路径在收到上述对象后立即调用 Verifier；final Session、
  Workspace snapshot、Candidate terminal Journal 和 Candidate Artifact 都发生在 Verifier 之后。
- `workbench/src/run-v2b.ts` 的 Attempt evidence 直到整个 substrate 返回后才持久化。
- `workbench/src/inspect-v2b.ts` 只比较八个声明字段是否为预期常量，没有从原始 Session、Workspace、
  Journal、budget/reservation 和 terminal ordering 独立重算。

这不满足 Amendment §4、§9.6 和 Gate R2-C 对“严格、证据支持、Verifier-after-terminal”的要求。
它不是已观察到的真实 side-effect crash，也不授权建设通用 durability 系统；问题只是当前
Verifier eligibility 不能由调用方自报的布尔值决定。

### Required correction

在现有 shared V2 Controller 内建立最小的、pre-Verifier evidence checkpoint：

1. Runtime port 只能报告它实际观察到的 pre-dispatch refusal、pending Provider、pending Tool、
   usage/reservation 和 Tool lifecycle 状态；不得自行宣称 Workspace、Journal 或 outer evidence 已闭合。
2. 在 budget-stopped Candidate 运行 Verifier 之前，由 Controller 对当前 Attempt 完成并验证：
   - public JSONL Session 已落盘且可由独立读取/重开路径解析，Tool Call/Tool Result 无 pending；
   - Workspace 可读，路径/protected-secret guardrail 有效，并冻结 pre-Verifier snapshot/ref/digest；
   - usage/reservation 已知且 reconcile，无 pending Provider reservation/response；
   - 当前 Agent terminal identity 和上述 refs 已写入 append-only Journal/checkpoint，顺序早于 Verifier；
   - 现有可证明范围内没有 pending Tool side effect。不得扩大为 exactly-once 或通用 crash durability 声明。
3. 只有从这些 raw/persisted facts 推导出的 quiescent gate 通过，才允许恰好一次 Verifier；缺失、
   无法重开、不可读、不一致或顺序错误必须在 Verifier 前 fail closed。
4. Inspector 必须从原始 refs、Session/Workspace bytes、usage/reservation 和 Journal ordering 重新推导
   该 gate；不得仅接受 summary/Attempt evidence 中的全真布尔对象。
5. settled 路径和 accepted V2-A 行为只做必要兼容，不重构第二套 Controller。

允许选择更小的等价实现，但报告必须逐项说明八个条件的 raw source、推导位置、持久化时点以及
Verifier ordering。若实现这些条件需要新的 durable-runtime 架构层或改变实验语义，立即按 hard stop
返回，不得继续扩张。

## 4. Finding R2-MR-002 — Caller-controlled legacy bypass weakens fail-closed gate

Severity: `P1 / blocking_before_candidate_commit`

### Evidence

- `HarnessResultV2A.legacyVerifierEligibleBudgetStop?: true` 是外部可构造的返回字段。
- `isVerifierEligibleCompletion()` 允许任何 injected `ExecutionPortV2` 通过该字段绕过八项
  quiescent gate。
- deterministic V2-A port 设置该字段；同时 `inspect-v2.ts` 的 `reportedBudgetTerminal` 仅凭 raw
  dispatch 数量和 Candidate summary 的 `agent_completion` 即可把终态计入 `unique_terminal_settled`。

R2 必须保留 accepted V2-A regression，但兼容权不能来自 injected port/candidate summary 自报。

### Required correction

1. 删除或封闭 caller-controlled `legacyVerifierEligibleBudgetStop` 数据字段及等价公开绕过。
2. 若 accepted V2-A deterministic regression 确实需要兼容，只能由 Controller 自己能够证明的
   internal/default deterministic execution mode 授权；R2 注入的 V2-B port 绝不能获得该权限。
3. `inspect-v2.ts` 的 budget-terminal `unique_terminal_settled` / `agent_completion` 推导必须绑定
   Finding R2-MR-001 的 raw-derived quiescent checkpoint；不能以 Candidate summary 自报代替。
4. 保留 accepted V2-A 全量 regression；不得借兼容修复改变 R2 的真实 terminal 语义。

## 5. Minimum deterministic proof

在现有 R2 focused tests 中增加或调整最小 tamper/negative proof；这不是新增实验 Case：

- 删除或破坏 pre-Verifier Session reopen evidence、Workspace snapshot/ref、usage/reservation closure、
  Tool-result closure或 terminal Journal ordering中的任一项，Inspector 必须拒绝；
- 任一 raw condition 不成立时，Verifier spy/counter 必须保持 0；
- 修改 summary/quiescence booleans 不能把无 raw proof 的 Attempt 变成 eligible；
- crafted injected port 不能通过 legacy flag 或等价字段绕过 gate；
- valid quiescent budget terminal 仍只运行一次 Verifier并保持 `settled: false`、
  `agent_completion: pre_dispatch_budget_terminal`；
- exact numeric reasoning usage allowance及 content/signature/secret rejection 保持；
- V2-A full、V2-B focused、必要 V1 provider/path/security regressions 保持通过且 zero skipped。

## 6. Required verification and deliverables

完成后更新：

- `docs/reports/V2_B_BOUNDED_R2_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V2_B_BOUNDED_R2_CLOSEOUT_DRAFT.md`；
- `.runs/v2-b/r2-stage1/EVIDENCE_INDEX.md`；
- `.runs/v2-b/r2-stage1/COMMANDS_AND_EXIT_CODES.md`；
- `.runs/v2-b/r2-stage1/SOURCE_DELTA.md`；
- `.runs/v2-b/r2-stage1/ZERO_ACCESS.json`。

至少重新运行并记录：strict TypeScript、R2 focused suite、V2-B focused regression、V2-A full
regression、必要 V1 Provider/budget/CLI 和 Workspace/Verifier security tests、`git diff --check`、
source allowlist、Pi exact/clean 及零访问计数。

最终只可返回：

- `PASS_FOR_R2_FOCUSED_AUDIT`：两项 finding 关闭、无架构/实验语义变化、全部 canonical proof 通过；或
- 精确的 Contract hard stop / remaining finding。

不得 stage/commit，不得启动 audit 或 real execution。提交修订后的 Source Delta、命令与退出码、
Evidence Index 和 CURRENT_STATE_UPDATE_PROPOSAL 后停止，等待 Main 窄复核。
