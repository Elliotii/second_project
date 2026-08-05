# V1-C Full Pilot Aggregate Report

```yaml
status: partial_prefix_paused_source_digest_authority_conflict
manifest_id: e32b11a162fec752e95ff48bf2b1021f20109a8e804aa025131568d49f50e8a1
planned_initial_cells: 24
started_initial_cells: 4
terminal_cells: 4
integrity_valid_cells: 4
invalid_cells: 0
comparable_cells: 4
child_attempts: 1
remaining_unstarted_cells: 20
policy_recommendation: INCONCLUSIVE
```

This is a bounded partial-prefix report, not the Contract-required fixed 24-cell Aggregate Report.
Execution stopped before cell 05 because the Start Prompt source digest (`鈥84bf56鈥) conflicts with
the tracked Manifest, Pilot Manifest and Run evidence digest (`鈥84bb56鈥).

| Metric | A | B | C | Total |
| --- | ---: | ---: | ---: | ---: |
| Planned | 8 | 8 | 8 | 24 |
| Started and terminal | 2 | 1 | 1 | 4 |
| Final pass | 2 | 1 | 1 | 4 |
| Initial Verifier fail | 0 | 0 | 1 | 1 |
| Recovery started | 0 | 0 | 1 | 1 |
| Recovery final pass | 0 | 0 | 1 | 1 |
| Invalid | 0 | 0 | 0 | 0 |
| Comparable internally | 2 | 1 | 1 | 4 |

The common Measurement Verifier was used for A, B and C. No A/B runtime treatment occurred. All four
created Runs are Inspector-valid and internally comparable, but the prefix is unbalanced: block 2 has
only its A cell. Consequently it cannot support a fair A/B/C effect estimate.

| Accounting | Observed |
| --- | ---: |
| Provider/model requests | 40 |
| Tool calls | 46 |
| Tokens | 91,413 |
| Active execution time | 131,463 ms |
| Verifier Runs | 5 |
| Child Attempts | 1 |
| Pilot cost | USD 0.0038111696 |

The read-only tracked aggregate command exited 1 on the already complete block 1:
`A/B delta is not exactly the frozen Skill treatment in block 1`. A sanitized difference-path check
showed that after the aggregate's current normalization, the only remaining A/B difference is
`$.provider_payload.messages[1].content[0].text`. The aggregate normalizes the user treatment text under
`context.messages` but not its corresponding copy under `provider_payload.messages`.

**Fact:** This is an independent aggregate fairness-control rejection. It is not caused by incomplete
block 2 and cannot be repaired by this no-source-edit Session. No aggregate JSON or Policy result was
accepted.

**Inference:** The four final passes and one successful C Recovery are descriptive product observations
only. They do not establish Skill or Runtime effectiveness and cannot be extrapolated to the 20
unstarted cells.

**Recommendation:** `INCONCLUSIVE` pending Main resolution of both the source-digest authority conflict
and the aggregate fairness-control defect. Do not promote, revise or reject the treatment from this
partial prefix.
