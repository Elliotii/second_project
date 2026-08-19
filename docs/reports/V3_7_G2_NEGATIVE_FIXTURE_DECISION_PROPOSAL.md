# V3.7 Goal 2 Negative Fixture Decision Proposal

```yaml
recommended_decision: AUTHORIZE_BOUNDED_REGISTERED_NEGATIVE_FOLLOW_UP_SCENARIO
changes_goal_1: false
changes_state_store_or_g2_decision_table: false
real_access: false
new_registered_cases: 0
new_registered_follow_up_scenarios: 1
```

Approve a narrow addendum to the Goal 2 execution-profile Amendment and Correction 1:

1. Extend the fixed Goal 2 profile inventory from one positive scenario to exactly two
   named scenarios: the existing correct-edit PASS and one no-edit Verifier-FAIL.
2. Bind scenario identity into execution authority, binding, runtime observation,
   Verifier, Outcome, Evidence, admission and canonical input.
3. Keep Task, Source, Verifier, Candidate, promoted State and all Goal 1 files unchanged.
4. Permit edits only to the existing Goal 2 profile config/loader plus the seven
   Correction paths and reports.
5. Require both scenarios to use the same production seam and actual frozen Verifier;
   forbid injected or caller-authored Outcome.
6. Preserve two ordinary Correction rounds; the zero-delta stop does not consume a
   candidate commit or correction round.

On approval, Main will formalize the addendum, update the Correction authorization and
resume the original implementation Session. It will not start a new implementation or
Goal 3.
