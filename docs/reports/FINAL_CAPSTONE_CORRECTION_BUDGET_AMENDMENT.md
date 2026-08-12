# Final Capstone Correction Budget Amendment

```yaml
status: accepted_binding
date: 2026-08-13
authority: user_amendment_to_replacement_final_capstone_main_handoff
goal_1_correction_rounds_max_after_formal_acceptance: 1
goal_1_correction_rounds_used: 0
goal_2_correction_rounds_max_after_initial_implementation_review: 2
goal_2_correction_rounds_used: 0
goal_3_correction_rounds_max_for_implementation_integration: 2
goal_3_correction_rounds_used: 0
execution_faults_consume_budget: false
```

## Binding rule

This Amendment adds hard correction budgets to the accepted Final Capstone governance. It
does not change any Goal's mission, source allowlist, authority, real-access budget,
single-real-run rule or non-goals.

One correction round is exactly:

```text
one concrete Main finding set
  -> one bounded correction
  -> required tests / regressions
  -> one Main re-review
```

One finding set must not be split into multiple micro-findings to evade the budget.

If the same class of authority or integrity defect recurs after correction, Main treats it
as a possible structural design defect and stops with `DECISION_REQUIRED`; it does not
continue an indefinite patch sequence.

Platform safety review, usage-limit interruption, sandbox/tool interruption and execution
faults do not consume a correction round.

## Goal budgets

### Goal 1

Goal 1 is already formally accepted and closed. At most one further bounded correction
round may be opened if a concrete accepted-Contract defect is later established. If that
single correction plus Main re-review cannot preserve `ACCEPT/CLOSE GOAL 1`, return
`DECISION_REQUIRED`.

Current usage: `0/1` post-acceptance rounds.

### Goal 2

After initial implementation and Main review, at most two bounded correction rounds may be
used. If Goal 2 still cannot be accepted after the second round, return
`DECISION_REQUIRED`.

Current usage: `0/2`; the active Working Session is still performing initial implementation,
not a correction round.

### Goal 3

Implementation/integration may use at most two bounded correction rounds. The frozen real
acceptance task remains exactly one real Run with no result hunting: no rerun, task
replacement or manufactured Failure may be used to obtain a preferred outcome.

Current usage: `0/2`; Goal 3 remains unauthorized until Goal 2 is closed.

## Priority

This Amendment controls correction-loop governance where it adds a stricter limit to the
Final Capstone Charter, Goal Contracts and Replacement Main handoff. All other accepted
rules remain unchanged.
