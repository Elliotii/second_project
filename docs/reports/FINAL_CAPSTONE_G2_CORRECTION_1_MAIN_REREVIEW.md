# Final Capstone Goal 2 Correction 1 Main Re-review

```yaml
status: passed_corrected_candidate_frozen_pending_affected_finding_reaudit
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G2_REGRESSION_GATED_STATE_FEEDBACK
working_session: 019ff806-4002-7de0-83ce-a0932837bfba
rejected_candidate: 198854d2565f3aa591da2ca083d614091a37c3fa
corrected_candidate_commit: b068329854e45df48336bb65c49cf666ab019622
corrected_candidate_tree: fb96ac21816c1f03bdcfc9cc38e65f07a11b8be2
finding_set: FC-G2-AUDIT-P1-001_and_FC-G2-AUDIT-P2-002
correction_budget: 1_of_2_consumed_completed
credential_reads_observed: 0
external_network_calls_observed: 0
external_provider_or_model_calls_observed: 0
real_model_calls_observed: 0
```

## Main disposition

**Decision.** Correction round 1 closes the bundled Main finding set for purposes of Candidate freeze. Main froze corrected Candidate `b068329854e45df48336bb65c49cf666ab019622`. Goal 2 remains unaccepted until a fresh affected-finding re-audit passes.

**Fact — path integrity.** Main reviewed the corrected project-root and artifact-root walkers and reproduced the Windows junction and hardlink cases. A future assessment root cannot traverse an existing junction/reparse segment; existing assessment, authorization and application artifacts must be ordinary singly-linked canonical JSON.

**Fact — interruption recovery.** Main reproduced an application-directory obstruction after V3 rollback. The first application attempt left one valid new V3 rollback Decision and the pointer at its exact next identity while no Goal 2 application existed. After removing the obstruction, retry persisted the one derived application without creating a second Decision. Orphan authorization, conflicting bytes and later pointer movement rejected.

**Fact — authority boundary.** Normal mutation still calls only `rollbackActiveStateV3` with the assessed immediate-parent target and compare-and-swap active identity. Recovery does not call rollback or write `active.json`; it requires the exact assessment-derived authorization, exactly one matching valid V3 Decision, and the current pointer plus `decision_id` to name that Decision.

The same path/application integrity class did not recur in Main re-review. Amendment escalation to `DECISION_REQUIRED` is therefore not triggered. Correction usage is `1/2`; the remaining round is not permission to continue this same defect class if the re-audit reproduces it.

## Main verification

From `C:/Users/HUAWEI/.codex/worktrees/g25main/project2/workbench`, Main ran:

| Command | Exit | Result |
|---|---:|---|
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit` | 0 | literal strict TypeScript PASS |
| focused `--test-name-pattern` for path, obstruction/recovery and conflict/orphan/later-pointer cases | 0 | 3 passed, 0 failed |
| `node --test tests/final-capstone-g2-regression-state-feedback.test.ts` | 0 | 10 passed, 0 failed |
| `node --test tests/final-capstone-g1-evidence-admission.test.ts` | 0 | 24 passed, 0 failed |
| `node --test tests/v3g1-evidence-to-candidate.test.ts` | 0 | 13 passed, 0 failed |
| `node --test tests/v3g2-validate-promote-reject-rollback.test.ts` | 0 | 6 passed, 0 failed |
| `node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts` | 0 | 8 passed, 0 failed |

Aggregate required matrix: **61 passed, 0 failed, 0 skipped/cancelled/todo**, plus literal strict TypeScript and `git diff --check`.

The original Working Session's literal typecheck failure is confirmed as a fresh-worktree ignored-dependency layout fault: Main's literal command passes against the exact integrated source. It does not consume a correction round.

## Corrected Candidate Git archive inventory

Hash domain: SHA-256 over exact regular-file bytes extracted from `git archive b068329854e45df48336bb65c49cf666ab019622 -- <nine paths>`. These are committed Candidate bytes, not working-tree text-pipeline output.

| Path | Git archive SHA-256 |
|---|---|
| `docs/reports/FINAL_CAPSTONE_G2_CLOSEOUT_DRAFT.md` | `6c8151cd2e00bfddd8049dbac7631a6679983b535c31c48973c85482ce49dd1d` |
| `docs/reports/FINAL_CAPSTONE_G2_CORRECTION_1_REPORT.md` | `a0031a065e845dc2553872a2f497f069ea3d46af889ad10c5ba8be9b1678e09e` |
| `docs/reports/FINAL_CAPSTONE_G2_IMPLEMENTATION_REPORT.md` | `3053c1f825485c99ac9282bb439e75bf27eed25d5a46368ce15f84a622646167` |
| `workbench/src/contracts/final-capstone-g2-types.ts` | `62b6ac8ab966ec674e5ec1784001958df4f40644cf7df141141811d828d5f2b6` |
| `workbench/src/inspect-final-capstone-g2.ts` | `8bbbf9964a00cd39124462ea9172ed141af5c90b71e81a2fba04890d662598a2` |
| `workbench/src/refinement/comparator-v3.ts` | `2081fdb0d0b09ba5488a466750118ef7486403ad1560a52d4fff26dd7128d220` |
| `workbench/src/refinement/regression-gate-g2.ts` | `6b51dc0a7123dd71fa9eae4fb937e55537f5534ec3521d8fb91bafb106a8472f` |
| `workbench/src/state/state-feedback-g2.ts` | `e4507977a510c28f638ea447d5d16306225748ac160c8bc1c850460999c26ebb` |
| `workbench/tests/final-capstone-g2-regression-state-feedback.test.ts` | `e16b1552c375e0a51a88115326e0d74f5782ff0f9d4e52b528910b8aa4a0b7a6` |

This explicit domain supersedes the two ambiguous Markdown hashes in the initial Main review and closes `FC-G2-AUDIT-P2-002` for Candidate freeze.

## Remaining gate

A fresh top-level affected-finding re-audit must inspect only `FC-G2-AUDIT-P1-001`, `FC-G2-AUDIT-P2-002`, and required regressions against corrected Candidate `b068329854e45df48336bb65c49cf666ab019622`. It may not repair source, change control state, accept Goal 2, or broaden scope. If it reproduces the same path/application integrity class, Main must return `DECISION_REQUIRED` without another patch.

Goal 3 remains unauthorized.
