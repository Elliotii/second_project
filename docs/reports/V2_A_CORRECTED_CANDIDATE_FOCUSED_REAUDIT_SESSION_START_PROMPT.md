# V2-A Corrected Candidate Focused Re-audit Session Start Prompt

```yaml
status: authorized_ready_to_start
role: fresh_focused_independent_audit_session
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
corrected_candidate_audit_baseline_commit: d6d7a82081658d1782897319dd1e615578ad77c7
corrected_candidate_tree: 4802567158a66eba6748866442c3a3e6ae8010d8
first_failed_candidate: ece8856891f950a090f9adabf75ca8c8e707ce53
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
real_model_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
source_repair_authorized: false
control_state_edit_authorized: false
git_stage_or_commit_authorized: false
v2_a_final_acceptance_authorized: false
v2_b_authorized: false
```

你是 fresh V2-A focused independent re-audit Session。你的任务不是重新做通用安全审计，也不是实现
V2-A；只独立复审第一轮五项 blocking P1 是否被当前 corrected Candidate 充分关闭，并运行必要回归。

## 1. Gate A：先核验，失败即停止

在任何审计命令前：

1. 确认工作区是 `C:\Users\HUAWEI\.codex\worktrees\7675\project2`；
2. 完整读取根 `AGENTS.md`；
3. 确认 `git rev-parse HEAD` 精确等于
   `d6d7a82081658d1782897319dd1e615578ad77c7`；
4. 确认 `git show -s --format=%T HEAD` 精确等于
   `4802567158a66eba6748866442c3a3e6ae8010d8`；
5. 确认 tracked 与 staged 均 clean。允许存在 Main 在该 Commit 后创建的唯一未跟踪 Prompt：
   `docs/reports/V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_SESSION_START_PROMPT.md`；
6. 确认 Pi 为 `027a5847901b5dde30270abaa1041046cd2b4b55` 且 clean；
7. 确认 V2-A 仍 active，final acceptance/V2-B/真实访问均未授权。

任一不满足，写 `docs/reports/V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_PAUSE_REPORT.md`
并立即停止，不要自行修复。

## 2. 必读材料

按顺序完整读取：

1. `CURRENT_STATE.md`；
2. `docs/第二项目_Codex交接包_2026-07-30/V2_A_GOAL_CONTRACT.md`；
3. `docs/reports/V2_A_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`；
4. `docs/reports/V2_A_FOCUSED_AUDIT_MAIN_REVIEW_AND_CORRECTION_DECISION.md`；
5. `docs/reports/V2_A_POST_AUDIT_BOUNDED_CORRECTION_PROMPT.md`；
6. `docs/reports/V2_A_POST_AUDIT_BOUNDED_CORRECTION_REPORT.md`；
7. `docs/reports/V2_A_POST_AUDIT_CORRECTION_MAIN_NARROW_REVIEW.md`；
8. `docs/reports/V2_A_IMPLEMENTATION_REPORT.md` 与 `V2_A_CLOSEOUT_DRAFT.md`；
9. 当前 V2-A source、scripts 与 tests；
10. `.runs/v2-a/corrected-evidence/EVIDENCE_INDEX.md`、`SUMMARY.json` 及每类至少一个必要原始 Artifact；
11. 如需核对 Pi Session 行为，先完整读取适用的 Pi `AGENTS.md`，然后只读固定 Pi 源码/测试。

## 3. 唯一审计范围

只回答下列问题：

### P1-001 raw Verifier authority

- Inspector 是否从 raw Verifier output/result、nested Artifact refs、Attempt/Verifier identity、
  exit/timeout/status 和执行合同推导 verifier gate；
- coherently rehashed Candidate/Selection summary 是否无法把 raw failure 伪造成 pass。

### P1-002 Session byte lineage

- A 的 canonical parent path、parent entry line bytes、final prefix extension 是否被校验；
- B 是否强制无 parent 且 pre-run entries 为 0；
- parent/A/B Session IDs 是否互异。

### P1-003 immutable initial Workspace

- A/B 是否在 `candidate_started` 前写入独立、不可替代的 initial Workspace ArtifactRef；
- Inspector 是否校验固定路径、inventory/digest、Seed equality、link policy 与 A/B/Seed isolation；
- final snapshot 是否不能冒充 initial snapshot。

### P1-004 frozen budget recomputation

- Attempt `8/16/1` 与 Group `24/48/3` 是否由 frozen constants 约束；
- usage 是否从 raw Session suffix 与 validated raw Verifier 推导；
- Group 是否由 primary+A+B 重算；budget-stopped path 是否保留但不可选。

### P1-005 Manifest/Pi/live source anchor

- exact Pi、task/model/policy/strategy/tool/Skill/Verifier/prompt/budget constants 是否 fail closed；
- Inspector 是否使用显式 `projectRoot` 重算 live `workbench/src` inventory/digest；
- corrected evidence 是否与当前 committed source 一致且 Inspector read-only。

不得扩张到 V2-B、真实模型效果、一般 durability、exactly-once、通用 sandbox、第三方 Package、
worktree provider、SDK/Extension/RPC 切换、V3 Experience/Curator/Router 或非命中项代码风格审查。

## 4. 允许的命令与证据

允许：

- read-only source/report/evidence inspection；
- `npm run typecheck`；
- `npm run v2a:test`；
- `node --test tests/v2a-post-audit.test.ts`；
- 仅为五项 finding 所需的最小 Workspace/V0-B/V1 回归；
- 对六个 corrected authoritative Runs 执行 read-only Inspector/fingerprint/source-digest loop；
- 如现有回归不足以确认某 finding，可在 ignored `.runs/v2-a/reaudit/**` 创建最小审计本地 tamper copy，
  但不得修改权威 evidence、源码或 tests。

禁止：

- 读取 Credential、联网、调用外部 Provider/model 或真实模型；
- 安装依赖；
- 修改源码、tests、fixtures、scripts、Contract、Charter、`CURRENT_STATE.md`、`AGENTS.md` 或 Pi；
- stage/commit；
- 修复 finding；
- 覆盖 `.runs/v2-a/evidence/**`、`.runs/v2-a/audit/**` 或
  `.runs/v2-a/corrected-evidence/**`。

## 5. Finding 与停止规则

- 只有能由具体 source/evidence/reproduction 支持、并影响 P1-001..P1-005 关闭性的缺陷，才可成为
  blocking finding；
- 不要把一般强化建议升级为 blocker；建议放入 non-blocking observations；
- 若发现合同内可修 defect，处置为 `REVISE_V2_A_BOUNDED`，不自行修复；
- 若需要架构、allowlist、Pi route 或权限变化，处置为
  `PAUSE_V2_A_ARCHITECTURE_DECISION` 并立即停止；
- 若五项均关闭且必要回归通过，处置为 `PASS_V2_A_CORRECTED_FOCUSED_REAUDIT`；
- 无论哪种处置，都不得接受 V2-A 或进入 V2-B。

## 6. 唯一交付物

写入：

`docs/reports/V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_REPORT.md`

至少包含：

- Gate A 精确 SHA/tree/Pi/status；
- P1-001..P1-005 逐项证据与结论；
- 执行命令、exit code、test count；
- 六个 corrected Run 的 source/fingerprint/read-only 检查；
- finding 清单（severity、证据路径、最小 reproduction、影响）；
- 未验证事项和 claims boundary；
- 推荐 disposition。

完成报告后立即停止，等待 Main 与用户审阅。
