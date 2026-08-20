# V3.7 Goal 3A Successor Long-Running Goal Plan

```yaml
status: PAUSED_AT_FINAL_G3B_USER_REVIEW_GATE
recorded_on: 2026-08-20
goal: V3_7_G3A_REUSABLE_PRODUCT_CAPABILITY
objective_end: Goal_3A_closed_accepted_and_Goal_3B_freeze_package_ready_for_user_review
real_access: false
goal_3b_execution: forbidden
ordinary_correction_budget: 2
```

## Outcome boundary

This long-running Goal ends after Goal 3A is formally accepted and Main has prepared the
exact Goal 3B Case/Manifest/profile/budget/execution-baseline proposal. It does not freeze
or execute Goal 3B and does not consume the unique real Run.

## Execution stages

| Stage | Owner | Completion condition | Stop condition |
|---|---|---|---|
| 1. Authority freeze | Main | accepted Amendment, exact Prompt and Control Baseline | authority conflict or out-of-scope requirement |
| 2. Authority gate | dedicated Implementation Session | v1 inventory unchanged; new exact two-entry Schema-1 loader passes | v1 mutation, caller authority or Schema 2 |
| 3. Service gate | dedicated Implementation Session | exact two Cases use versioned accepted bridge semantics | new Evidence/State/G2 semantics or test-only success |
| 4. Product gate | dedicated Implementation Session | journal, re-derived Read Model, loopback API and bilingual UI work through Host actions | browser authority or demo-only shortcut |
| 5. Deterministic gate | dedicated Implementation Session | both frozen Cases, restart/reopen, isolation, negative route and V3.6 handoff behavior pass | frozen claim fails outside correction authority |
| 6. Candidate gate | dedicated Implementation Session | allowlist-clean Candidate plus reports and required checks | out-of-allowlist delta or verification failure |
| 7. Main review | Main | preliminary review passes exact Candidate | bounded finding returned for Correction |
| 8. Focused Audit | fresh independent read-only Session | audit PASS on immutable Candidate | audit finding or platform stop |
| 9. Goal acceptance | Main | all Exit Criteria and audit PASS recorded | correction exhaustion or unresolved P1 |
| 10. G3B preparation | Main | exact freeze proposal ready for user review | any attempt to grant or consume real authority |

## Autonomous continuation rule

Internal stages continue without additional user confirmation. Main pauses only for a
Charter Hard Stop, exhausted Correction budget, an authority expansion, a material user
choice, or the final Goal 3B review gate.

## New-finding rule

Read-only investigation is allowed. Repair is allowed only for a reproduced finding that
blocks a frozen route, risks corruption/irreversible effects/false success, invalidates a
core accepted claim, or is an explicit acceptance regression. All other issues are
deferred and do not expand tests or product scope.

## Expected reports

- `docs/reports/V3_7_G3A_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_7_G3A_CLOSEOUT_DRAFT.md`;
- `docs/reports/V3_7_G3A_MAIN_PRELIMINARY_REVIEW.md`;
- `docs/reports/V3_7_G3A_FOCUSED_AUDIT.md`;
- `docs/reports/V3_7_G3A_CLOSEOUT.md`;
- `docs/reports/V3_7_G3B_FREEZE_PROPOSAL.md`.

## Current checkpoint

```yaml
stage: goal_3b_freeze_proposal_user_review
implementation_started: true
candidate_frozen: true
audit_started: true
goal_3a_status: closed_accepted
goal_3a_disposition: PASS_V3_7_G3A_REUSABLE_PRODUCT_CAPABILITY
goal_3a_accepted_candidate_commit: a764749e0d7f0355cef06decdcd5541af62a8f2f
goal_3a_accepted_candidate_tree: 070ce4177ebacf0250aeedf2e0db38c842c1e8a4
goal_3a_acceptance_control_commit: 31efa1f374522090e89260af853d6bc2639fa68b
goal_3a_acceptance_control_tree: 80f40dbfe3c551c5cf370fd273c2287373d301d5
goal_3b_freeze_proposal: docs/reports/V3_7_G3B_FREEZE_PROPOSAL.md
goal_3b_freeze_proposal_status: ready_for_user_review_with_one_pre_freeze_blocker
goal_3b_pre_freeze_blocker: G3B-PREFREEZE-P1-001
goal_3b_locked: true
real_access_authorized: false
provider_dispatches: 0
credential_reads: 0
```
