# V1-C Corrected Full-Pilot R2 Closeout Draft

Date: 2026-08-06 (Asia/Hong_Kong)

## Status

**Fact:** The dedicated R2 Execution Session completed its authorized work. All 24 initial cells are terminal, integrity-valid, comparable, and aggregated. The execution deliverables are ready for Main review. This draft does not itself accept the Goal or update control state.

## Deliverables

- `docs/reports/V1_C_R2_PILOT_EXECUTION_REPORT.md`
- `docs/reports/V1_C_R2_AGGREGATE_REPORT.md`
- `docs/reports/V1_C_R2_CLOSEOUT_DRAFT.md`
- the three preserved tracked cell-04-timeout pause reports
- `.runs/v1-c/full-pilot-r2/EVIDENCE_INDEX.md`
- `.runs/v1-c/full-pilot-r2/COMMANDS_AND_EXIT_CODES.md`
- the two preserved ignored cell-04-timeout records
- immutable generated evidence under `.runs/v1-c/full-pilot-r2/pilot`

## Definition-of-Done evidence

| Execution requirement | Result |
|---|---|
| Exact frozen baseline/Manifest/source/Pi/helper identity | satisfied |
| 24 cells executed in frozen order | satisfied |
| One cell per process; inspect before next cell | satisfied |
| Aggregate after every complete block | satisfied; eight blocks |
| No retry, fallback, replacement, or denominator discard | satisfied |
| A/B/C and C-initial/C-final reported | satisfied |
| Recovery and treatment-invalid denominators reported | satisfied |
| Usage/cost fully reconciled and below caps | satisfied |
| Manifest/Ledger/Journal/Session/Workspace/Verifier/Outcome linkage | satisfied by all 24 Inspectors |
| Secret and protected-path boundaries | satisfied |
| Source/control state unchanged; no stage/commit | satisfied |
| Cell 04 launcher limitation disclosed | satisfied |

Main/user acceptance and the resulting `CURRENT_STATE.md` change remain outside this Session's authority.

## Verification commands and results

- Strict TypeScript: exit `0`.
- Focused V1-B/V1-C pair: exit `0`, 40/40 tests passed.
- Original zero-call preflight: exit `0`, selected cell 01, all real counters zero.
- Continuation Inspectors for cells 01-04: exit `0` each.
- Continuation aggregate: exit `0`, accepted four-Run state and block-1 fairness reproduced.
- Continuation preflight: exit `0`, selected cell 05, all real counters zero.
- `run-next`: cells 01-03 and 05-24 exit `0`; cell 04 outer exit `124`, product exit unknown/unrecoverable.
- Per-cell tracked Inspector: exit `0` for every cell before the next was launched.
- Aggregate after each completed block: exit `0`; both fairness predicates true at blocks 1 through 8.
- Final all-Run Inspector sweep: 24/24 exit `0`, no integrity, terminality, comparability, secret, or protected-path failure.
- Final aggregate: exit `0`, 24 terminal/comparable, 22 pass, two fail, zero invalid.

## Final result

- A: 7 pass, 1 fail.
- B: 8 pass, 0 fail.
- C-initial: 7 pass, 1 fail.
- C-final: 7 pass, 1 fail.
- Recovery: 1 eligible, 1 started, 0 succeeded.
- Exact tracked cost: USD `0.0105276024`.
- Bounded descriptive claim: `SKILL_ONLY_DESCRIPTIVELY_BETTER`.

## Remaining unverified

- Statistical significance, replication, and generalization outside the fixed protocol.
- Exact cell-04 product-process exit code.
- Main's final acceptance, control-state update, and any future-phase decision.

## Scope changes or decisions needed

No execution scope was changed. Main must independently review the reports and cited evidence, then accept, narrow, reject, or request revision. V2 remains unauthorized.

## CURRENT_STATE_UPDATE_PROPOSAL

```yaml
active_goal: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
proposed_status: COMPLETE_PENDING_MAIN_ACCEPTANCE
execution_baseline_commit: c37ef6e6676cba245c0929dcdf98401f004fab54
manifest_id: c1587d04277a327bf0bd54bcf5abf6194663513f7c5960d3425bcbd322e78e14
pilot_root: .runs/v1-c/full-pilot-r2/pilot
comparison:
  planned: 24
  terminal: 24
  comparable: 24
  invalid: 0
  treatment_invalid: 0
  pass: 22
  fail: 2
  arm_A: { pass: 7, fail: 1 }
  arm_B: { pass: 8, fail: 0 }
  arm_C_initial: { pass: 7, fail: 1 }
  arm_C_final: { pass: 7, fail: 1 }
  recovery: { eligible: 1, started: 1, succeeded: 0 }
  descriptive_claim: SKILL_ONLY_DESCRIPTIVELY_BETTER
fairness:
  blocks_checked: 8
  bc_initial_byte_equal: true
  ab_only_skill_delta: true
usage:
  provider_requests: 200
  tool_calls: 242
  tokens: 327711
  active_execution_time_ms: 423252
  verifier_runs: 25
  child_attempts: 1
  cost_usd: 0.0105276024
cell_04_disclosure:
  outer_exit: 124
  product_exit: unknown_unrecoverable
  included_in_denominator: true
  retried_or_replaced: false
source_or_control_state_changed: false
v2_authorized: false
next_action: Main performs final acceptance and alone updates CURRENT_STATE.md.
```
