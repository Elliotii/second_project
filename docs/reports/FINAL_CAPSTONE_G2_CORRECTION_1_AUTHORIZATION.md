# Final Capstone Goal 2 Correction 1 Authorization

```yaml
status: authorized_round_in_progress
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G2_REGRESSION_GATED_STATE_FEEDBACK
finding_set: FC-G2-AUDIT-P1-001_and_FC-G2-AUDIT-P2-002
correction_budget: 1_of_2_consumed_in_progress
rejected_candidate_commit: 198854d2565f3aa591da2ca083d614091a37c3fa
implementation_owner: original_working_session_019ff806-4002-7de0-83ce-a0932837bfba
credential_reads_authorized: 0
external_network_authorized: false
external_provider_or_model_calls_authorized: 0
real_model_calls_authorized: 0
pi_changes_authorized: false
git_stage_or_commit_authorized: false
```

## One indivisible Main finding set

Main accepts the focused audit's two supported findings as one bounded correction round.
They must not be split into separate micro-rounds.

### P1 — failure-atomic assessed rollback and path integrity

The Candidate permits future assessment output through an existing intermediate junction,
accepts existing idempotent artifacts without an ordinary singly-linked canonical-file
check, and can persist authorization, mutate the V3 State pointer, then fail before the
mandatory Goal 2 application record. The latter state is not retry-recoverable because
the pointer is then stale.

Within the existing Contract-allowed Goal 2 files only:

1. Validate future assessment roots from the nearest existing ordinary ancestor; reject
   every existing symlink/junction/reparse segment and enforce real-path containment.
2. Before treating an existing assessment, authorization or application as idempotent,
   require an ordinary, singly-linked, canonical JSON file.
3. Add deterministic recovery for exactly the state `matching assessment + matching
   authorization + missing application + one existing V3 rollback Decision whose prior
   active, target, next active and digest recompute`. Complete exactly one canonical
   application record without invoking a second rollback. Reject ambiguity, conflicting
   authorization/Decision/application bytes, unrelated or later pointer movement, stale
   pre-mutation state and non-parent targets.
4. Preserve the unobstructed path through existing `rollbackActiveStateV3`; do not change
   `store-v3.ts`, create a parallel Decision, write `active.json` directly, or weaken CAS.
5. Add focused negatives for intermediate junction, hardlink/idempotent artifacts,
   obstructed application destination, post-mutation recovery/idempotence, conflicting
   bytes and stale/concurrent State. Preserve Inspector detection and historical reopen.

### P2 — exact Candidate evidence inventory

Main's first review recorded checkout SHA-256 for two Markdown files while labeling them
as exact Candidate bytes. The corrected reports must distinguish checkout bytes from Git
blob/archive bytes or use one explicit domain consistently. The next Candidate review
must recompute every tracked path from the exact committed Candidate; do not reuse the
superseded inventory.

## Allowed delta

The original Working Session may modify only the Goal 2 Contract's existing bounded paths
needed for this finding set, expected to be:

- `workbench/src/state/state-feedback-g2.ts`;
- `workbench/src/inspect-final-capstone-g2.ts` only if recovery/completeness inspection
  requires it;
- `workbench/tests/final-capstone-g2-regression-state-feedback.test.ts`;
- Goal 2 implementation/Closeout reports and one correction report;
- ignored Goal 2 correction evidence.

No Goal 1, V3 store/comparator/publication semantics, binding, Pi, control state, Contract,
Charter, accepted history, product source, staging or commit is authorized.

## Required verification and stop rule

Run the exact Goal 2 focused suite, the audit reproductions or equivalent new hit tests,
literal/canonical strict TypeScript as available, and the complete 58-test preserved
matrix. Record exact commands/exits/counts, hashes, recovery identities, path negatives,
zero-access counters and remaining limits.

Return the complete correction for one Main re-review. Because this finding set concerns
authority/integrity, recurrence of the same application/path class after this correction
requires `DECISION_REQUIRED` under the Amendment. A different correctable class may use
the one remaining Goal 2 round only through a new Main finding set.

