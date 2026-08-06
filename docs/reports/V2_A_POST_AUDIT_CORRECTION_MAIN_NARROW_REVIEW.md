# V2-A Post-audit Correction Main Narrow Review

```yaml
status: completed
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
review_owner: main_session
review_scope: V2A-AUDIT-P1-001_through_P1-005_and_required_regressions_only
failed_candidate_audit_baseline: ece8856891f950a090f9adabf75ca8c8e707ce53
recommended_disposition: ACCEPT_CORRECTED_CANDIDATE_FOR_FOCUSED_REAUDIT
gate_j: pending_fresh_focused_reaudit
v2_a_final_acceptance: not_authorized_not_claimed
v2_b_authorized: false
real_model_calls: 0
credential_reads: 0
network_calls: 0
external_provider_calls: 0
```

## 1. Main conclusion

Main 接受本次五项 finding 的有界返修，允许将当前 source、tests、scripts、报告与控制状态冻结为新的
corrected Candidate Audit Baseline，并从其精确 SHA 启动一次 fresh focused re-audit。

本结论只表示返修具备复审条件，不表示 Gate J 已通过，不表示 V2-A 已完成或被接受，也不授权
V2-B、真实调用、网络、Credential、Pi 修改或 SDK/Extension 路线切换。

## 2. Finding closure checked by Main

| Finding | Main narrow check | Result |
|---|---|---|
| `V2A-AUDIT-P1-001` | Inspector 从 raw Verifier output/result、执行合同、Attempt identity 和 Artifact refs 推导 verifier gate；一致性重哈希 summary 不能覆盖 raw failure | ready_for_reaudit |
| `V2A-AUDIT-P1-002` | A 校验 canonical parent path、parent entry line bytes 与 final prefix；B 必须无 parent/零历史；parent/A/B Session ID 必须互异 | ready_for_reaudit |
| `V2A-AUDIT-P1-003` | A/B 在 `candidate_started` 前各自冻结 initial Workspace ArtifactRef；Inspector 校验 Seed equality、路径、inventory、link policy 与隔离 | ready_for_reaudit |
| `V2A-AUDIT-P1-004` | Attempt `8/16/1`、Group `24/48/3` 为冻结常量；usage 从 raw Session suffix 与 raw Verifier 重算，Group 从 primary+A+B 重算 | ready_for_reaudit |
| `V2A-AUDIT-P1-005` | Manifest/Seed 绑定固定 Pi 与 frozen constants；Inspector 使用显式 `projectRoot` 重算 live `workbench/src` inventory/digest | ready_for_reaudit |

Main 未在本次窄复核中增加新功能要求或扩张 V2-A 架构。

## 3. Main verification

在 `workbench/` 执行：

| Command | Exit | Result |
|---|---:|---|
| `npm run typecheck` | 0 | strict TypeScript passed |
| `npm run v2a:test` | 0 | 11 passed, 0 failed, 0 skipped |
| `node --test tests/v2a-post-audit.test.ts` | 0 | 5 finding families passed；覆盖 19 个 coherent-tamper variants |
| read-only six-Run source/fingerprint/Inspector loop | 0 | 6/6 integrity-valid；Inspector 前后 fingerprint 不变；summary fingerprint 一致 |

独立交叉检查：

```yaml
live_workbench_source_digest: b5caeb1b5301d4276a9becdcbbd47df122ebfa09313d202528f134721bbb15d6
corrected_evidence_source_digest: b5caeb1b5301d4276a9becdcbbd47df122ebfa09313d202528f134721bbb15d6
old_evidence_tree_digest: ee5c2bc5edc0088dd779c0094ccbd2fc78b623b421307d9621126f7432c8e2ae
old_audit_tree_digest: dbd3c53c8056693c2c85548a210024d78157929516423d80e0dfad75fa7ef210
corrected_evidence_tree_digest: 53a049a44bae86bac10f641a04175b63e2b4a8da298c387334de55fc5e98f9d0
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_status: clean
staged_before_main_freeze: empty
```

## 4. Evidence and claims boundary

- 原 `.runs/v2-a/evidence/**` 与审计本地 `.runs/v2-a/audit/**` 未被覆盖；
- 新权威候选证据位于 ignored `.runs/v2-a/corrected-evidence/**`，不会进入 Git；
- corrected Candidate 仍只证明 deterministic substrate 与 fail-closed evidence mechanism；
- 尚未证明真实模型恢复效果、哪条策略更优、生产 durability 或 V2-B acceptance；
- Gate J 只能由 fresh focused re-audit 的独立结果支持，最终 Goal acceptance 仍需 Main 与用户的后续明确决定。

## 5. Next bounded control point

```text
Main freezes corrected Candidate Audit Baseline
-> verifies exact SHA, tracked cleanliness and Pi cleanliness
-> generates a SHA-bound focused re-audit prompt
-> fresh independent Audit Session rechecks P1-001..P1-005 and required regressions
-> Main reviews the audit result
-> stop before V2-A final acceptance
```
