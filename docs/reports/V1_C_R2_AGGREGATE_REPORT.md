# V1-C Corrected Full-Pilot R2 Aggregate Report

Date: 2026-08-06 (Asia/Hong_Kong)
Manifest ID: `c1587d04277a327bf0bd54bcf5abf6194663513f7c5960d3425bcbd322e78e14`

## Final aggregate

| Arm | Planned | Terminal | Invalid | Comparable denominator | Pass | Fail | Treatment-invalid |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| A | 8 | 8 | 0 | 8 | 7 | 1 | 0 |
| B | 8 | 8 | 0 | 8 | 8 | 0 | 0 |
| C | 8 | 8 | 0 | 8 | 7 | 1 | 0 |
| Total | 24 | 24 | 0 | 24 | 22 | 2 | 0 |

There are zero paused or excluded product Runs. Cell 04 remains a normal terminal/comparable A-arm denominator member; its outer launcher observation limitation does not alter its product Outcome.

## C checkpoints and Recovery

| Measure | Pass | Fail | Invalid |
|---|---:|---:|---:|
| C-initial | 7 | 1 | 0 |
| C-final | 7 | 1 | 0 |

Recovery counts are 1 eligible, 1 started, and 0 succeeded. The single Recovery child Attempt belongs to cell 03 and is included in all resource totals.

## Resource use by arm

| Arm | Provider requests | Tool calls | Tokens | Active ms | Verifiers | Child Attempts | Cost USD |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| A | 64 | 80 | 87,812 | 86,867 | 8 | 0 | 0.0027878144 |
| B | 64 | 76 | 95,073 | 78,734 | 8 | 0 | 0.0027217848 |
| C | 72 | 86 | 144,826 | 257,651 | 9 | 1 | 0.0050180032 |
| Total | 200 | 242 | 327,711 | 423,252 | 25 | 1 | 0.0105276024 |

All totals are below the frozen caps: 256 Provider requests, 384 Tool calls, 2,097,152 tokens, 7,200,000 ms active execution time, 32 Verifiers, eight child Attempts, and USD 1.90.

## Block fairness and outcome concentration

All eight completed blocks pass both frozen fairness predicates.

| Task | Repetition | A | B | C-final |
|---|---:|:---:|:---:|:---:|
| parse-duration | 1 | pass | pass | fail |
| bounded-index | 1 | pass | pass | pass |
| state-transition | 1 | pass | pass | pass |
| stable-format | 1 | pass | pass | pass |
| parse-duration | 2 | fail | pass | pass |
| bounded-index | 2 | pass | pass | pass |
| state-transition | 2 | pass | pass | pass |
| stable-format | 2 | pass | pass | pass |

**Fact:** The two failures are concentrated in `parse-duration`, but occur in different repetitions and different arms: C in repetition 1 and A in repetition 2. B passes both parse-duration repetitions and all six other cells. Every task contributes six Runs, every arm contributes two Runs per task, and no task/repetition cell is missing.

## Descriptive claim

`SKILL_ONLY_DESCRIPTIVELY_BETTER`

**Reason:** B has the highest final pass count and rate at 8/8, compared with A at 7/8 and C-final at 7/8. C's bounded Recovery did not improve its 7/8 initial checkpoint.

The observed margin is one Run. This label is confined to the frozen model/task/Skill/budget protocol and does not claim statistical significance, universal Skill superiority, Runtime-Control inferiority in general, or external generalization.

## Cell 04 disclosure

Cell 04's outer command runner returned `124`. Its exact product-process exit code is unknown and unrecoverable. Its immutable product evidence is terminal, integrity-valid, comparable, passed, secret-clean, protected-path-clean, and fully cost-reconciled. Main expressly kept it in the denominator; it was not retried or replaced.
