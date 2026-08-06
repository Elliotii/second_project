# V2-A Line-byte Hit-specific Re-audit Session Start Prompt

```yaml
status: authorized_ready_to_start
role: fresh_hit_specific_independent_audit_session
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
candidate_audit_baseline_commit: de6d30c896079c6ae1164646ae55ead8e6a33c09
candidate_tree: 4dc5ca604f9b123e62568beef2fa49a612dd0e57
finding_under_reaudit: V2A-REAUDIT-P1-002-LINE-BYTE-NORMALIZATION
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
real_model_calls_authorized: 0
credential_reads_authorized: 0
network_authorized: false
source_repair_authorized: false
control_state_edit_authorized: false
git_stage_or_commit_authorized: false
v2_a_final_acceptance_authorized: false
v2_b_authorized: false
```

你是 fresh V2-A hit-specific independent Audit Session。只复审一个 finding：
`V2A-REAUDIT-P1-002-LINE-BYTE-NORMALIZATION`。P1-001/003/004/005 已由上一轮 fresh audit
关闭，不得重新审计或扩张。

## 1. Gate A

在任何技术审计前：

1. 完整读取根 `AGENTS.md` 与本 Prompt；
2. 确认工作区精确为 `C:\Users\HUAWEI\.codex\worktrees\7675\project2`；
3. HEAD/tree 精确为
   `de6d30c896079c6ae1164646ae55ead8e6a33c09` /
   `4dc5ca604f9b123e62568beef2fa49a612dd0e57`；
4. tracked/staged clean；只允许本 Prompt 为未跟踪文件；
5. 共享只读 Pi `D:\AI\AI_Projects\project2\.upstream\pi` 精确为
   `027a5847901b5dde30270abaa1041046cd2b4b55` 且 clean；
6. V2-A active；Gate J/final acceptance/V2-B/真实访问均未授权。

失败则写 `V2_A_LINE_BYTE_HIT_SPECIFIC_REAUDIT_PAUSE_REPORT.md` 并停止。

## 2. 必读

Gate 通过后完整读取：

- `CURRENT_STATE.md`；
- 正式 `V2_A_GOAL_CONTRACT.md`；
- `V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_REPORT.md` 的 P1-002、commands、claims 部分；
- `V2_A_CORRECTED_REAUDIT_MAIN_REVIEW_AND_LINE_BYTE_CORRECTION_DECISION.md`；
- `V2_A_LINE_BYTE_BOUNDED_CORRECTION_PROMPT.md`；
- `V2_A_LINE_BYTE_BOUNDED_CORRECTION_REPORT.md`；
- `V2_A_LINE_BYTE_CORRECTION_MAIN_NARROW_REVIEW.md`；
- 当前 `workbench/src/inspect-v2.ts` 的 `ParsedSessionV2A`、`parseSession()` 与 Candidate Session checks；
- 当前 `workbench/tests/v2a-post-audit.test.ts` 的 P1-002 family；
- `.runs/v2-a/line-byte-corrected-evidence/EVIDENCE_INDEX.md` 与 `SUMMARY.json`。

## 3. 唯一审计问题

只回答：

1. Session parser 是否保留完整 raw bytes 和逐记录 bytes，不使用 trim/filter/newline normalization；
2. 是否只接受固定 Pi producer 的 LF-terminated non-empty records，并对 blank/CRLF fail closed；
3. Candidate A pre-run parent entry bytes 是否与 Seed parent Session 逐条 exact equal；
4. final Candidate Session 是否以完整 verified pre-run raw bytes 为 exact prefix 且含后续 Attempt bytes；
5. Candidate B no-parent/zero-history 是否保持；
6. coherent trailing-ASCII-space reproduction 是否 fail closed；
7. 六个新 authoritative Runs 是否 source-bound、Inspector-valid、fingerprint read-only。

不得重新研究 raw Verifier、Workspace、budget、Manifest 常量或 Selector，除非它们因本次 line-byte delta
出现直接回归；没有具体证据时不得扩大。

## 4. 允许命令

- read-only source/report/evidence inspection；
- `npm run typecheck`；
- `node --test tests/v2a-post-audit.test.ts`；
- `npm run v2a:test`；
- 对原 ignored trailing-space reproduction 调用当前 Inspector，确认 fail closed；
- 对六个新 authoritative Runs 执行 read-only source/fingerprint/Inspector loop；
- 必要的旧 evidence tree digest preservation check。

不要运行完整 V0/V1 suites，不创建新的广泛 tamper matrix。只有当前测试与原 reproduction 不能回答
上述七问时，才可在 `.runs/v2-a/hit-reaudit/**` 建一个最小审计副本。

## 5. 禁止与 disposition

不得修改 source/tests/scripts/fixtures/evidence/control/Contract/Charter/AGENTS/Pi，stage/commit，读取
Credential，联网，调用 Provider/model，安装依赖，进入 V2-B 或接受 V2-A。

- finding 已关闭且验证通过：`PASS_V2_A_P1_002_HIT_SPECIFIC_REAUDIT`；
- 同一 finding 仍有合同内具体缺陷：`REVISE_V2_A_BOUNDED`；
- 需要架构/route/allowlist/权限变化：`PAUSE_V2_A_ARCHITECTURE_DECISION`。

## 6. 唯一交付物

写：`docs/reports/V2_A_LINE_BYTE_HIT_SPECIFIC_REAUDIT_REPORT.md`

包含 Gate A、七问逐项结论、commands/exit codes、evidence identity、findings、claims boundary 与
recommended disposition。完成后立即停止，等待 Main/用户；不得宣告 V2-A accepted。
