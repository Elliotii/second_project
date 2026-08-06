# V2-A Corrected Re-audit Main Review and Line-byte Correction Decision

```yaml
status: completed
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
audited_candidate: d6d7a82081658d1782897319dd1e615578ad77c7
audit_disposition: REVISE_V2_A_BOUNDED
accepted_finding: V2A-REAUDIT-P1-002-LINE-BYTE-NORMALIZATION
main_disposition: RETURN_ONE_BOUNDED_CORRECTION_TO_ORIGINAL_IMPLEMENTATION_OWNER
architecture_change: false
scope_change: false
gate_j: not_passed
v2_a_final_acceptance: not_authorized
v2_b_authorized: false
```

## Main decision

Main 接受 fresh focused re-audit 的唯一 blocking finding。审计 Session 在正式结果回传时触发了外部
额度限制，但完整报告已先写入
`V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_REPORT.md`，审计本地 reproduction 也已保留。
Main 不把该工具中断隐瞒为正常完成；同时独立读取报告与 reproduction，并重新调用当前 Inspector
确认 finding 可复现。

独立观察：

```yaml
audit_evidence_root: .runs/v2-a/reaudit/p1-002-trailing-line-bytes-fresh-25480-1786013915811
pre_run_last_parent_entry_differs_from_parent: true
pre_run_last_parent_entry_differs_from_final_prefix: true
delta: one_trailing_ASCII_space
inspector_integrity_valid: true
inspector_errors: []
```

根因是 `workbench/src/inspect-v2.ts` 的 `parseSession()` 对整个 JSONL 使用 `.trim()`，使末条记录
行尾字节在 lineage 比较前被吞掉。该问题直接命中既有 P1-002 byte-exact invariant，不改变 V2-A
架构、Session primitive、Pi route、权限或文件 allowlist。

Main 因此授权原 V2-A Implementation owner 只完成一项有界修正：保留并比较 JSONL 真实记录/
prefix bytes，增加 coherent trailing-byte 回归，并在源码最终冻结后生成一个新的 write-once evidence
root。旧 `.runs/v2-a/evidence/**`、`audit/**`、`corrected-evidence/**` 和 `reaudit/**` 均不得覆盖。

返修后只做命中项窄复核与一次 fresh hit-specific re-audit；不重新开启一般 V2-A 审计，不增加新功能。

V2-A final acceptance、V2-B、真实调用、Credential、网络、Pi 修改和 SDK/Extension 切换继续未授权。
