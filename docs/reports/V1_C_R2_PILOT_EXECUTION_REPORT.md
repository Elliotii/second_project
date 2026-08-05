# V1-C Corrected Full-Pilot R2 Execution Report

Date: 2026-08-06 (Asia/Hong_Kong)
Goal: `V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION`
Execution baseline: `c37ef6e6676cba245c0929dcdf98401f004fab54`
Manifest ID: `c1587d04277a327bf0bd54bcf5abf6194663513f7c5960d3425bcbd322e78e14`

## Outcome

**Fact:** All 24 frozen initial cells executed in Manifest order. All 24 Runs are terminal, integrity-valid, comparable, and included in the formal denominator. There are 22 passes, two task failures, zero invalids, zero exclusions, and zero treatment-caused invalids.

**Fact:** No same-Run retry, fallback, replacement, later-cell overlap, source edit, control-state edit, staging, commit, or V2 work occurred. One C-arm child Recovery Attempt ran within the frozen budget.

**Fact:** Cell 04 retains outer launcher exit `124`; its exact product-process exit remains unknown and unrecoverable. Main's decision at control commit `9a7f7c03902c39ce3b7a551bb58aa4c906050517` preserved its terminal product evidence in the comparison denominator and authorized continuation from cell 05. Cell 04 was never rerun, replaced, rewritten, excluded, or relabeled.

## Identity and continuation gate

| Item | Value/result |
|---|---|
| HEAD | `c37ef6e6676cba245c0929dcdf98401f004fab54` |
| tree | `a1d01cb6345a3534493874a67bbed30711b34c44` |
| parent | `9f57be00f9d84279db01a6a2e17db80e9eae571d` |
| source digest | `2de1b76f7b9304ebe6d75e04ba3fa172f1d433cc219ad63ff10e6d6ff08c7ad3` |
| Pi commit | `027a5847901b5dde30270abaa1041046cd2b4b55` |
| helper SHA-256 | `2d83b0e1e3eafecb774a3e6faf4f6ac1ec29984ee256dc750a06805e3f577438` |
| Pilot root | `.runs/v1-c/full-pilot-r2/pilot` |
| continuation decision | `9a7f7c03902c39ce3b7a551bb58aa4c906050517:docs/reports/V1_C_R2_CELL04_OUTER_TIMEOUT_MAIN_REVIEW_AND_CONTINUATION_DECISION.md` |

Before cell 05, tracked read-only Inspectors reproduced cells 01-04 as terminal, integrity-valid, comparable, protected-path-clean, and secret-clean. The tracked aggregate reproduced four terminal/comparable Runs and passing block-1 fairness. Tracked preflight returned `ready`, selected `v1c-full-pilot-cell-05`, and reported zero Credential reads, network calls, Provider calls, and model calls. No matching `run-next` process was live.

The pause-time reports and ignored command/evidence records were preserved before final-report updates:

- `docs/reports/V1_C_R2_CELL04_OUTER_TIMEOUT_PAUSE_EXECUTION_REPORT.md`
- `docs/reports/V1_C_R2_CELL04_OUTER_TIMEOUT_PARTIAL_AGGREGATE_REPORT.md`
- `docs/reports/V1_C_R2_CELL04_OUTER_TIMEOUT_CLOSEOUT_DRAFT.md`
- `.runs/v1-c/full-pilot-r2/CELL04_OUTER_TIMEOUT_EVIDENCE_INDEX.md`
- `.runs/v1-c/full-pilot-r2/CELL04_OUTER_TIMEOUT_COMMANDS_AND_EXIT_CODES.md`

## Per-cell execution

Every cell after cell 04 used the exact frozen command in a distinct process with outer timeout `900000` ms. Every tracked Inspector returned exit `0` before the next cell was launched.

| Cell | Arm | Task / repetition | Outer exit | Initial | Final | Attempts | Cost USD |
|---:|:---:|---|---:|:---:|:---:|---:|---:|
| 01 | A | parse-duration / 1 | 0 | pass | pass | 1 | 0.0003565240 |
| 02 | B | parse-duration / 1 | 0 | pass | pass | 1 | 0.0003847872 |
| 03 | C | parse-duration / 1 | 0 | fail | fail | 2 | 0.0026890416 |
| 04 | A | bounded-index / 1 | 124 outer; product unknown | pass | pass | 1 | 0.0003057264 |
| 05 | C | bounded-index / 1 | 0 | pass | pass | 1 | 0.0003509240 |
| 06 | B | bounded-index / 1 | 0 | pass | pass | 1 | 0.0003740408 |
| 07 | B | state-transition / 1 | 0 | pass | pass | 1 | 0.0002762816 |
| 08 | A | state-transition / 1 | 0 | pass | pass | 1 | 0.0003128496 |
| 09 | C | state-transition / 1 | 0 | pass | pass | 1 | 0.0002811200 |
| 10 | B | stable-format / 1 | 0 | pass | pass | 1 | 0.0003518872 |
| 11 | C | stable-format / 1 | 0 | pass | pass | 1 | 0.0003806040 |
| 12 | A | stable-format / 1 | 0 | pass | pass | 1 | 0.0003452400 |
| 13 | C | parse-duration / 2 | 0 | pass | pass | 1 | 0.0003252256 |
| 14 | A | parse-duration / 2 | 0 | fail | fail | 1 | 0.0003503752 |
| 15 | B | parse-duration / 2 | 0 | pass | pass | 1 | 0.0003026688 |
| 16 | C | bounded-index / 2 | 0 | pass | pass | 1 | 0.0003377472 |
| 17 | B | bounded-index / 2 | 0 | pass | pass | 1 | 0.0003574984 |
| 18 | A | bounded-index / 2 | 0 | pass | pass | 1 | 0.0003579016 |
| 19 | A | state-transition / 2 | 0 | pass | pass | 1 | 0.0004590376 |
| 20 | B | state-transition / 2 | 0 | pass | pass | 1 | 0.0003052952 |
| 21 | C | state-transition / 2 | 0 | pass | pass | 1 | 0.0003335136 |
| 22 | B | stable-format / 2 | 0 | pass | pass | 1 | 0.0003693256 |
| 23 | C | stable-format / 2 | 0 | pass | pass | 1 | 0.0003198272 |
| 24 | A | stable-format / 2 | 0 | pass | pass | 1 | 0.0003001600 |

Cell 03 is the only Recovery-eligible Run. Its initial Attempt failed, its one bounded child Attempt also failed, and both Attempts settled. Cell 14 is a terminal A-arm task failure without Recovery eligibility.

## Integrity and budget reconciliation

Final read-only reconciliation reran all 24 tracked Inspectors. All returned exit `0` with:

- `integrity_valid=true`, `terminal_valid=true`, and `comparable=true`;
- zero Inspector errors;
- unchanged protected paths;
- passing secret scans with zero matches and zero reasoning payloads;
- matching Manifest/Ledger/Journal/Attempt/Session/Workspace/Verifier/Outcome evidence.

Final tracked usage is 200 Provider requests, 242 Tool calls, 327,711 tokens, 423,252 ms active execution time, 25 Verifier runs, one child Attempt, and USD `0.0105276024`. Every total is below its frozen cap. Usage and cost are fully reconciled.

## Scope and claims

**Fact:** All eight completed blocks pass `bc_initial_byte_equal` and `ab_only_skill_delta`. Each task appears in exactly two repetitions and each task/repetition block contains exactly one A, B, and C Run.

**Fact:** Final pass counts are A 7/8, B 8/8, and C-final 7/8. C-initial is also 7/8.

**Recommendation:** The bounded fixed-protocol descriptive label is `SKILL_ONLY_DESCRIPTIVELY_BETTER`.

This is a descriptive result for this fixed model/task/Skill/budget protocol. It is not evidence of statistical significance, universal superiority, production-grade orchestration, process-crash recovery, or generalization beyond this Pilot.

## What remains unverified

- Statistical significance and replication outside the frozen 24 cells.
- Other models, Providers, tasks, prompts, Skills, tools, or budgets.
- Product-process exit code for cell 04.
- Final Goal acceptance and control-state update by Main.

## CURRENT_STATE_UPDATE_PROPOSAL

```yaml
active_goal: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
execution_status: READY_FOR_MAIN_ACCEPTANCE
execution_baseline_commit: c37ef6e6676cba245c0929dcdf98401f004fab54
manifest_id: c1587d04277a327bf0bd54bcf5abf6194663513f7c5960d3425bcbd322e78e14
pilot_root: .runs/v1-c/full-pilot-r2/pilot
planned_runs: 24
started_runs: 24
terminal_runs: 24
comparable_runs: 24
invalid_runs: 0
treatment_invalid_runs: 0
passed_runs: 22
failed_runs: 2
arm_results:
  A: { pass: 7, fail: 1, invalid: 0 }
  B: { pass: 8, fail: 0, invalid: 0 }
  C_initial: { pass: 7, fail: 1, invalid: 0 }
  C_final: { pass: 7, fail: 1, invalid: 0 }
recovery: { eligible: 1, started: 1, succeeded: 0 }
tracked_cost_usd: 0.0105276024
descriptive_claim: SKILL_ONLY_DESCRIPTIVELY_BETTER
fairness: { blocks_checked: 8, bc_initial_byte_equal: true, ab_only_skill_delta: true }
cell_04_observation_limit:
  outer_exit: 124
  product_exit: unknown_unrecoverable
  terminal_evidence_in_denominator: true
source_or_control_state_changed: false
v2_authorized: false
next_action: Main reviews evidence, accepts/narrows/rejects the closeout draft, and alone updates control state.
```
