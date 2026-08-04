# V1-B Stage 1 Main Review Bounded Correction Prompt

```yaml
status: authorized_for_original_stage1_preparation_session
owner: original_v1_b_stage1_preparation_session
goal: V1_B_FROZEN_BOUNDED_REAL_PILOT
stage: stage_1_bounded_correction
main_review_disposition: REVISE_V1_B_STAGE1
candidate_commit_authorized: false
focused_audit_authorized: false
execution_baseline_authorized: false
stage_2_authorized: false
credential_reads_authorized: 0
external_network_authorized: false
external_provider_calls_authorized: 0
real_model_calls_authorized: 0
git_commit_authorized: false
```

## 1. Role and frozen boundaries

你是原 V1-B Stage 1 Preparation Session。本轮只修复 Main Session 已确认的五组
Contract 缺口。继续从当前专用 worktree 的未提交 Stage 1 delta 工作；不得重置、丢弃
或覆盖既有实现和原始证据。

必须保持：

- corrected Control Baseline 仍为
  `de75ca7a4d5376713f01ca475bc5ad7637c70443` / tree
  `e930e1d0885b52bf911ed78912786723f321f06e`；
- Pi 为 `027a5847901b5dde30270abaa1041046cd2b4b55` 且 clean；
- source delta 只在 `V1_B_GOAL_CONTRACT.md` §6.2 allowlist；
- accepted task、Skill、Verifier、System Prompt、strategy、V0 source、Pi、reference、
  `CURRENT_STATE.md` 和其他控制文件只读；
- 不读取 credential，不联网，不调用外部 Provider/真实模型，不安装依赖，不进入 Audit、
  Candidate Commit、Execution Baseline 或 Stage 2；
- 不暂存、不提交。

Main Review 的有界反例证据位于：

`C:/Users/HUAWEI/.codex/worktrees/28be/project2/.runs/v1-b/main-review/6496088d-25b7-4e42-a1e5-fea61f8a6282`

该目录是 ignored diagnostic evidence，不是 authoritative Pilot，不得覆盖或删除。

## 2. Binding findings and required corrections

### F-001 — Inspector 必须独立核对完整语义绑定和必要证据

已复现：在保持 ArtifactRef 摘要自洽后，修改 `RunResult.evidence.task_digest`，或从
`terminal.artifact_refs` 删除 Verifier result/output，`inspectV1RunCell()` 仍返回
`integrity_valid: true`。

最小修复要求：

1. Inspector 从 Manifest、cell 和当前冻结源码独立推导并核对 task、workspace、base
   prompt、Skill、strategy、Tool、Verifier、model profile、Workbench source、Pi、
   Session/Workspace/Attempt/terminal relations；
2. 每个实际 Attempt 必须恰好有相应的 Verifier result/output 引用，路径、digest、size、
   Attempt relation 和 status 均核对；
3. 不信任 `RunResult` 或 `terminal-evidence` 自报的 semantic digest；
4. 增加 coherent-rehash counterexamples，至少覆盖错误 task/Skill/Verifier/Workbench
   binding 和缺失/重复 Verifier refs。

不要求建设签名、数据库、通用供应链或恶意管理员防篡改平台。

### F-002 — Secret/reasoning 扫描必须覆盖最终持久化证据

已复现：当前 scan 在 `terminal-evidence.json` 写入前完成；向最终 initial dispatch
options 注入 `Authorization: Bearer FAKE_SENSITIVE_MARKER` 并同步 digest/ref 后，Inspector
仍接受。

最小修复要求：

1. 对 model/options/context/provider payload 使用严格、大小写不敏感的 secret/reasoning
   字段过滤或明确 allowlist；
2. 在内存中对最终将持久化的 terminal evidence、RunResult、journal、Verifier outputs、
   Failure Packet 和其他声明 ArtifactRef 执行扫描，再 write-once；
3. Inspector 独立扫描实际 bytes，不能只信任 `secret_scan.passed`；
4. 覆盖 `Authorization` 大小写变体、Bearer marker、reasoning/thinking/signature 字段和
   fake resolver/provider/factory error marker；
5. scan failure 必须 fail closed / pause，不能通过删除 artifact 后继续。

不得记录 credential value、长度、hash、prefix 或 suffix。

### F-003 — A/B 差异必须精确绑定冻结 Skill treatment

已复现：`normalizedDispatch()` 替换整条最后 user text，导致同时把 B/C treatment 改成
任意文本后，aggregate 仍报告 `ab_only_skill_delta: true`。

最小修复要求：

1. B/C initial dispatch 继续完整 byte-equal；
2. A/B 比较必须验证差异恰好对应公开 Pi `skill()` 对冻结 Skill wrapper/body 的预期
   变换，不能把任意 user content 归一化为合法；
3. Skill source/wrapper identity 必须与 frozen Skill bytes 和 Manifest binding 关联；
4. 增加 arbitrary text、缺失 wrapper、额外文本、错误 Skill body 和 options/model/tool
   drift counterexamples。

优先复用 accepted V1-A treatment probe/Skill runtime invariant；不要复制新的 Skill
系统或改 Pi。

### F-004 — Failure Taxonomy、ledger、Inspector 和 denominator 必须形成最小可运行闭环

已确认：成功路径只形成 `task_pass` / `task_fail` / 泛化 `evidence_invalid`；异常路径统一
写 `stage1_unclassified_failure` pause。当前没有由 typed boundary 产生并被 Inspector/
aggregate 正确处理的 `infrastructure_invalid` / `evidence_invalid` 路径，invalid threshold
只能检查人工 ledger。

最小修复要求：

1. 使用显式 typed internal result/error，不根据自由文本猜分类；
2. `task_pass`、`task_fail`、`treatment_guardrail_failure`、
   `infrastructure_invalid`、`evidence_invalid`、`global_budget_stop`、
   `paused_unclassified` 的 disposition、ledger state、cause ID 和 denominator 关系符合
   Contract §10；
3. treatment-caused invalid 保留在对应 arm denominator；只有预冻结且可证明的
   treatment-independent infrastructure/evidence invalid 才允许 exclusion；
4. Inspector 能检查 `terminal` 和 `invalid`；aggregate 能保留 planned/started/invalid、
   comparable/excluded/treatment-invalid counts；paused 不得伪装 complete；
5. 增加有界 deterministic injection seam/test，证明至少：一个 typed infrastructure
   invalid、一个 evidence invalid、一个 treatment guardrail failure、unknown→paused、
   25% threshold 和同 cause 第二次出现会在下一 cell 前暂停。

这不是建设通用异常分类平台；只覆盖 V1-B Contract 预冻结边界。

### F-005 — Budget reserve 必须原子、完整且可被 Inspector 重算

已确认：部分 reservation 先修改 usage 再 assert；child reserve 未显式覆盖剩余
Verifier/active-time capacity；Inspector 只数 reservation 条数，没有核对 before/after
连续性、reserved ceiling、actual usage 和三层 cap。

最小修复要求：

1. Provider、Tool、Verifier、child 的 reserve 先在 clone/proposal 上完整检查 Attempt、
   Run、Pilot，再一次性提交；失败不得留下半更新状态；
2. complete child reserve 覆盖 child Attempt 最大 provider/tool/token/time/cost 以及其
   Verifier，并同时检查 Run/Pilot 剩余 capacity；
3. Provider reservation evidence 保存足以证明的 token/cost ceiling 和 committed actual
   usage；unknown/malformed/over-reserve fail closed；
4. Inspector 验证每个 level 的 before→after 连续性、正确增量、actual≤reserved≤cap；
   aggregate 按 Manifest order 验证跨 Run 的 Pilot continuity 和最终 cap；
5. 增加 no-partial-mutation、insufficient child time/verifier、tampered reservation chain、
   unknown/over actual usage counterexamples。

不得扩张成通用事务、durable scheduler 或 exactly-once 平台。

## 3. Required verification

返修完成后至少运行：

1. strict TypeScript；
2. 修订后的 V1-B focused tests；
3. Main Review 四类 coherent counterexample 的正式回归版；
4. V1-A 18-test regression；
5. Contract 要求的 V0-C deterministic 与 post-audit regressions；
6. 新 authoritative 24-cell zero-call simulation；
7. fresh Windows `core.autocrlf=true` identity + TypeScript + V1-B focused tests；
8. source/fixture/control/Pi delta 和 `0 / 0 / 0 / 0` real-access accounting。

源码变化会改变 source digest 和 Stage 1 Manifest。必须：

- 重建 tracked Stage 1 Manifest；
- 生成新的唯一 authoritative Stage 1 Pilot/evidence index；
- 保留旧 authoritative root 原始 bytes，并标记为
  `superseded_due_main_review_bounded_correction`；
- 不把返修证据称为 Stage 2 retry、replacement cell 或真实 Pilot。

## 4. Deliverables and stop point

更新：

- `docs/reports/V1_B_STAGE1_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V1_B_STAGE1_CLOSEOUT_DRAFT.md`；
- `.runs/v1-b/stage1/evidence-index.json`；
- `CURRENT_STATE_UPDATE_PROPOSAL`（仅报告内）；
- Source Delta、commands/exit codes、finding→source→test→evidence matrix。

另增加简短 correction section，逐项写明 F-001 至 F-005：修了什么、反例结果、仍未
验证什么。

完成后停止并建议以下之一：

```text
PASS_V1_B_STAGE1_AFTER_BOUNDED_CORRECTION
REVISE_V1_B_STAGE1
PAUSE_V1_B_STAGE1
```

不得自行接受 Stage 1、修改控制状态、创建 Git commit、启动 Audit 或进入 Stage 2。
