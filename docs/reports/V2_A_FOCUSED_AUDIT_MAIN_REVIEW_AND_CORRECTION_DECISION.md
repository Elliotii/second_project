# V2-A Focused Audit Main Review and Correction Decision

```yaml
status: focused_audit_reviewed_bounded_correction_required
date: 2026-08-06
candidate_audit_baseline: ece8856891f950a090f9adabf75ca8c8e707ce53
audit_disposition_accepted: REVISE_V2_A_BOUNDED
blocking_findings_accepted: 5
highest_severity: P1
architecture_pause_required: false
route_change_required: false
bounded_correction_owner: original_v2_a_implementation_session
real_access_authorized: false
V2_A_final_acceptance: false
V2_B_authorized: false
```

## Decision

Main Session 有限复核并接受
`docs/reports/V2_A_FOCUSED_INDEPENDENT_AUDIT_REPORT.md` 的五项 P1：

- `V2A-AUDIT-P1-001`：Inspector 未从 raw Verifier evidence 独立派生 pass/fail；
- `V2A-AUDIT-P1-002`：A Session lineage 只检查 parent 存在和 entry count；
- `V2A-AUDIT-P1-003`：Candidate 缺少 immutable initial-Workspace Artifact；
- `V2A-AUDIT-P1-004`：Attempt/Group budgets 可以通过自报 cap/usage 被替换或低报；
- `V2A-AUDIT-P1-005`：Manifest/Pi/Workbench identity 只做 self-declaration，现有权威 Evidence
  与 frozen Candidate source digest 不匹配。

四个 coherent-rehash audit-local copies 被当前 Inspector 错误接受，以及所有现有 Recovery Seed
source digest 均不匹配 Candidate HEAD，构成直接、可复现的 Contract evidence failure。正常 producer
路径通过不能抵消这些 finding。

## Scope decision

五项问题都局限在 V2 evidence contracts、producer evidence、Inspector recomputation、tests 和
corrected authoritative Evidence。它们不否定：

- Direct public Pi route；
- `JsonlSessionRepo` create/open/fork；
- two-path runtime architecture；
- current temp-copy Workspace provider；
- fixed selector policy 本身。

因此处置为一次打包的 `REVISE_V2_A_BOUNDED`，返回原 Implementation Session。不得切换
SDK/Extension/RPC/worktree，不得进入 V2-B 或真实访问。

## Required correction outcome

返修后必须由 Inspector 从不可变原始 Artifact 独立派生，而不是相信 Candidate/Group summary：

1. Verifier status、attempt/source/output lineage；
2. A 与 parent Session 的 canonical path 和 entry bytes，以及 final Session 对 pre-run prefix；
3. A/B initial Workspace snapshot/inventory 与 Seed equality；
4. fixed caps、raw Session/Journal derived usage 与 Group recomputation；
5. exact pinned Pi、frozen Manifest constants 和 current workbench source inventory/digest。

旧 `.runs/v2-a/evidence/**` 必须保持不变并标记为 superseded-for-Gate-J。返修完成后创建新的
write-once corrected Evidence root，且只在所有 source 改动完成后生成；新 Seed source digest 必须
等于 corrected source 的独立 recomputation。

## Next control point

原 Implementation Session 完成返修后停止。Main 做窄复核；通过后依据既有条件授权创建
corrected Candidate Commit，并启动 fresh focused re-audit，只复审 P1-001–P1-005、strict
TypeScript、V2 tests 及必要 Workspace/Verifier/budget regressions。V2-A final acceptance 仍由
Main 与用户决定。
