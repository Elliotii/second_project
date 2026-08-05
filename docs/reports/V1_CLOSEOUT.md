# V1 Version Closeout — Skill / Runtime Comparison

```yaml
status: closed_accepted
closeout_date: 2026-08-06
v1_a: closed_accepted_PASS_V1_A_DETERMINISTIC_SUBSTRATE
v1_b: closed_inconclusive_authorized_sequence_exhausted
v1_c: closed_accepted_PASS_V1_C_COMPARISON_COMPLETION
version_disposition: PASS_V1_SKILL_RUNTIME_COMPARISON_WITH_SKILL_ONLY_DESCRIPTIVE_LEAD
skill_only_policy_decision: PROMOTE_WITHIN_FROZEN_PROTOCOL
current_same_session_runtime_control_decision: REJECT_AS_V1_DEFAULT
active_goal_after_closeout: null
v2_status: portfolio_north_star_not_authorized
```

## Version conclusion

V1 is complete. It implemented a deterministic Skill/experiment substrate,
survived the failed V1-B evidence path without rewriting history, corrected the
bounded budget-stop attribution defect in V1-C, and ultimately completed the
frozen 24-cell Baseline / Skill-only / Skill + Runtime Control comparison.

The accepted R2 result is:

| Arm | Final pass | Fail | Invalid | Cost USD |
|---|---:|---:|---:|---:|
| Baseline | 7/8 | 1 | 0 | 0.0027878144 |
| Skill-only | 8/8 | 0 | 0 | 0.0027217848 |
| Skill + Runtime Control | 7/8 | 1 | 0 | 0.0050180032 |

All eight block-level fairness checks passed. C had one eligible and executed
same-Session Recovery; it did not recover the failed task. The exact Pilot cost
was USD `0.0105276024`.

## Version decision

- Promote Skill-only as the bounded default carried into the next design stage.
- Do not promote the current same-Session Runtime Control treatment as a V1
  default; it showed no final outcome gain and incurred higher cost in the only
  Recovery case.
- Retain the external Verifier as common reliability infrastructure rather than
  treating it as a C-only feature.
- Carry the unsuccessful same-Session Recovery as concrete motivation for V2's
  future clean-Session / clean-Workspace comparison, without claiming that V2
  is implemented or authorized.

## Evidence and limitations

The result is valid bounded engineering evidence, not a benchmark or causal
proof over a population. The observed Skill-only lead is one Run and both task
failures are concentrated in `parse-duration`. Claims are limited to the fixed
tasks, two repetitions, model, Prompt, Skill, Tool Profile, Verifier and budgets.

R2 cell 04 has complete terminal product evidence but an outer runner exit of
`124` and an unknown product-process exit code. Main kept it in the denominator
without retry or replacement and explicitly excludes production-grade process
orchestration claims.

## Version Definition of Done

| Requirement | Result |
|---|---|
| Deterministic Skill and experiment substrate | satisfied by V1-A |
| Real fixed A/B/C comparison | satisfied by accepted V1-C R2 Pilot |
| Skill-only is a genuine arm | satisfied |
| Runtime treatment begins only after valid C failure | satisfied |
| Common external Measurement Verifier | satisfied |
| Immutable Manifest, lineage and evidence | satisfied |
| Fairness and denominator rules | satisfied; 8/8 blocks, 0 invalid |
| Bounded real budget | satisfied |
| Policy decision | satisfied; bounded Skill promote, current Runtime reject |
| No statistical/universal claim | satisfied |

## Historical record

- V1-B remains closed inconclusive and its invalid/incomplete real sequences are
  not mixed into the V1-C denominator.
- The first V1-C four-Run prefix remains immutable diagnostic evidence excluded
  from R2.
- The superseded interim V1 closeout is preserved at
  `docs/reports/V1_CLOSEOUT_INTERIM_SUPERSEDED_2026-08-05.md`.
- Formal V1-C acceptance is recorded in
  `docs/reports/V1_C_R2_MAIN_ACCEPTANCE_AND_V1_POLICY_DECISION.md` and
  `docs/reports/V1_C_CLOSEOUT.md`.

## Next-stage boundary

V2 remains the Portfolio North Star but is not authorized. Before a V2 Contract
is drafted, Main should revisit the already recorded bounded Pi SDK/Extension
compatibility checkpoint, because V1 has now produced a Skill treatment worth
considering for real Pi use and V2 may need clean Session / Workspace semantics.
That checkpoint is read-only design work, not a Direct `AgentHarness` route
change and not permission to implement SDK/Extension integration.

