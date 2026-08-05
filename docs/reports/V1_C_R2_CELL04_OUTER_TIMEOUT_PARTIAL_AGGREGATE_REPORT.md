# V1-C R2 Partial Aggregate Report

Date: 2026-08-06 (Asia/Hong_Kong)
Manifest ID: `c1587d04277a327bf0bd54bcf5abf6194663513f7c5960d3425bcbd322e78e14`

## Aggregate status

**Fact:** This is a read-only partial aggregate over the four terminal Runs present when the Session stopped at a material Pause Condition. It is not the planned final 24-cell aggregate.

| Arm | Planned | Started | Terminal | Invalid | Comparable | Pass | Fail | Treatment-invalid |
|:---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A | 8 | 2 | 2 | 0 | 2 | 2 | 0 | 0 |
| B | 8 | 1 | 1 | 0 | 1 | 1 | 0 | 0 |
| C | 8 | 1 | 1 | 0 | 1 | 0 | 1 | 0 |
| Total | 24 | 4 | 4 | 0 | 4 | 3 | 1 | 0 |

There are zero paused or excluded Runs in product evidence. The Session-level execution pause occurred after cell 04 terminalized.

## Resource use

| Arm | Provider requests | Tool calls | Tokens | Active ms | Verifiers | Child Attempts | Cost USD |
|:---:|---:|---:|---:|---:|---:|---:|---:|
| A | 16 | 20 | 22,732 | 24,103 | 2 | 0 | 0.0006622504 |
| B | 8 | 10 | 12,405 | 10,483 | 1 | 0 | 0.0003847872 |
| C | 16 | 18 | 60,956 | 88,527 | 2 | 1 | 0.0026890416 |
| Total | 40 | 48 | 96,093 | 123,113 | 5 | 1 | 0.0037360792 |

All tracked totals are within the frozen Pilot caps. Usage/cost is reconciled; there is no unknown usage or cost in the terminal evidence for the four started Runs.

## C checkpoints and Recovery

| Measure | Count |
|---|---:|
| C initial passed | 0 |
| C initial failed | 1 |
| C final passed | 0 |
| C final failed | 1 |
| Recovery eligible | 1 |
| Recovery started | 1 |
| Recovery succeeded | 0 |

## Fairness and concentration

**Fact:** The tracked aggregate returned exit `0` and reported one completed block. For that block, `bc_initial_byte_equal=true` and `ab_only_skill_delta=true`.

**Fact:** The only complete block is `parse-duration`, repetition 1: A passed, B passed, and C failed after one bounded Recovery Attempt. Block 2 contains only its A cell. No other task/repetition has started.

**Inference:** Arm results are maximally concentrated in one complete task/repetition block plus one unmatched A cell. They cannot support the frozen 24-cell descriptive comparison.

## Descriptive claim

`INCONCLUSIVE`

This classification reflects incomplete execution, not statistical equivalence. No statistical significance, universal superiority, or generalization beyond the fixed model/task/Skill/budget protocol is claimed.
