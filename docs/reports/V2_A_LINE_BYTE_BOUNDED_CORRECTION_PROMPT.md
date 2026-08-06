# V2-A P1-002 Line-byte Bounded Correction Prompt

```yaml
status: authorized_ready_to_start
role: original_v2_a_implementation_owner
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
correction_base_commit: d6d7a82081658d1782897319dd1e615578ad77c7
correction_base_tree: 4802567158a66eba6748866442c3a3e6ae8010d8
finding: V2A-REAUDIT-P1-002-LINE-BYTE-NORMALIZATION
correction_count: one
architecture_change_authorized: false
real_model_calls_authorized: 0
credential_reads_authorized: 0
network_authorized: false
pi_change_authorized: false
git_stage_or_commit_authorized: false
control_state_edit_authorized: false
```

你是原 V2-A Implementation owner 的有界返修 Session。本轮只修一个 finding，不重新设计 V2-A，
不处理非命中项。

## 1. Re-entry Gate

修改前必须：

1. 完整读取根 `AGENTS.md`、`CURRENT_STATE.md`、正式
   `V2_A_GOAL_CONTRACT.md`；
2. 完整读取：
   - `V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_REPORT.md`；
   - `V2_A_CORRECTED_REAUDIT_MAIN_REVIEW_AND_LINE_BYTE_CORRECTION_DECISION.md`；
   - 本 Prompt；
3. 确认工作区为 `C:\Users\HUAWEI\.codex\worktrees\7675\project2`；
4. HEAD/tree 精确为
   `d6d7a82081658d1782897319dd1e615578ad77c7` /
   `4802567158a66eba6748866442c3a3e6ae8010d8`；
5. tracked/staged clean；仅允许现有 Main/audit-owned 未跟踪报告与 Prompt；
6. 共享 Pi `D:\AI\AI_Projects\project2\.upstream\pi` 为
   `027a5847901b5dde30270abaa1041046cd2b4b55` 且 clean；
7. Credential、network、外部 Provider/model、真实调用权限均为 0。

失败则写 `V2_A_LINE_BYTE_BOUNDED_CORRECTION_PAUSE_REPORT.md` 并停止。

## 2. 唯一 Source correction

修正 `workbench/src/inspect-v2.ts` 的 Session JSONL 解析/比较，使下列 invariant 真实成立：

- 解析 JSON 结构时不得用 `.trim()`、空行过滤或换行规范化来改变记录字节；
- 明确定义并校验 producer 允许的终止换行；拒绝空记录；
- `ParsedSession` 必须保留可用于比较的原始 bytes 或等价 exact byte slices；
- Candidate A 的 pre-run parent entry bytes 必须与 Seed parent Session 对应 entry bytes 完全一致；
- final Candidate Session 的原始 byte prefix 必须与已验证 pre-run Session 完全一致，且之后确有 Attempt bytes；
- Candidate B 仍必须无 parent 且零 pre-run entries；
- 不改变 Session 语义、策略、Selector、预算或 Runtime route。

建议使用 `Buffer` 做 prefix/entry-byte 比较，避免把 UTF-8 文本比较误称为 byte-exact。

## 3. 唯一 Test correction

在 `workbench/tests/v2a-post-audit.test.ts` 的 P1-002 family 中加入至少一个 coherent regression：

1. 从 fresh valid A-pass/B-fail Run 开始；
2. 只在 Candidate A pre-run Session 的最后一条 parent entry 行追加一个 ASCII 空格；
3. 一致刷新直接包裹该 Artifact 的 Candidate/Journal/terminal refs；
4. parent Session 和 final Session 保持原字节；
5. Inspector 必须 fail closed，错误明确指向 parent entry 或 final-prefix byte mismatch。

可同时覆盖 blank-record rejection，但不得扩张成通用 JSONL parser 工程。

## 4. Evidence regeneration

任何 source/test 修正和最终验证完成后，才能生成新 evidence：

```text
.runs/v2-a/line-byte-corrected-evidence/**
```

- 该 root 必须不存在后创建、write-once；
- 不得覆盖或修改 `.runs/v2-a/evidence/**`、`audit/**`、`corrected-evidence/**`、`reaudit/**`；
- 更新必要的 V2-A deterministic/final-validation script，使新 root 与 Run IDs 不和旧 evidence 混淆；
- 六个场景保持不变；
- 新 Manifest source digest 必须等于最终 live `workbench/src`；
- 六个 Run 必须 Inspector valid、fingerprint read-only、zero access；
- evidence 创建后不得再修改 `workbench/src`；如必须修改，放弃该新 root 并按新 identity 重建，不得覆盖。

## 5. 允许修改

仅允许必要的：

- `workbench/src/inspect-v2.ts`；
- `workbench/tests/v2a-post-audit.test.ts`；
- `workbench/scripts/run-v2a-deterministic-suite.mjs`；
- `workbench/scripts/run-v2a-final-validation.mjs`（仅当保持其路径/identity 正确所必需）；
- `workbench/README.md`、`workbench/package.json`（仅必要说明/命令）；
- `docs/reports/V2_A_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V2_A_CLOSEOUT_DRAFT.md`；
- 新 `docs/reports/V2_A_LINE_BYTE_BOUNDED_CORRECTION_REPORT.md`。

不得修改 Contract、Charter、`CURRENT_STATE.md`、`AGENTS.md`、09 治理文件、Pi、V0/V1 source/tests/
fixtures/evidence 或其他 V2 source。

## 6. 最小验证

必须运行：

- `npm run typecheck`；
- `node --test tests/v2a-post-audit.test.ts`；
- `npm run v2a:test`；
- 六个新 authoritative Runs 的 read-only Inspector/source/fingerprint loop；
- old evidence/audit/corrected-evidence/reaudit tree digest preservation check。

不要默认重跑全部 V0/V1 suites；本 finding 只触及 V2 Inspector JSONL byte parsing。只有出现具体回归证据
时才扩大测试，并在报告中说明。

## 7. 禁止与停止

禁止 Credential、网络、外部 Provider/model、真实调用、dependency install、Pi patch/private import、
SDK/Extension/RPC、第三方 package、worktree provider、source staging/commit、控制状态修改和 V2-B。

若 exact-byte 修正需要改变 Pi Session format、Direct route、Contract invariant、allowlist 或权限，立即写
Pause Report 并停止。

## 8. 交付与停止

交付：

- `V2_A_LINE_BYTE_BOUNDED_CORRECTION_REPORT.md`；
- Implementation Report / Closeout Draft 的对应 appendix；
- exact source delta、commands/exit codes、new evidence identity/digests；
- old evidence preservation；
- `CURRENT_STATE_UPDATE_PROPOSAL`，仅 proposal。

推荐 disposition 只能是：

- `PASS_V2_A_LINE_BYTE_CORRECTION_PENDING_HIT_REAUDIT`；
- `PAUSE_V2_A_ARCHITECTURE_DECISION`；
- `REVISE_V2_A_BOUNDED`（若仍未关闭，不得自行开启第二项修复）。

完成后停止，等待 Main 窄复核。不得 stage/commit 或接受 V2-A。
