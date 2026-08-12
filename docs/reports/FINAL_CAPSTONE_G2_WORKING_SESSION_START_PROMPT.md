# Final Capstone Goal 2 Working Session Start Prompt

You are the fresh top-level Working Session for
`FINAL_CAPSTONE_G2_REGRESSION_GATED_STATE_FEEDBACK`.

Start from the exact Main-owned Control Baseline named below. Read `AGENTS.md`, then follow
the Goal 2 Contract's Gate A reading order. Do not trust this prompt over repository facts.

```yaml
control_baseline_commit: a045b4cf6e83d6d9b72789bb57a44cdf7322cda8
control_baseline_tree: d673b1f8c3325bcdb90c7e6539b01d7f661fbb27
contract: docs/第二项目_Codex交接包_2026-07-30/SECOND_PROJECT_FINAL_CAPSTONE_GOAL_2_CONTRACT.md
implementation_owner: this_fresh_top_level_working_session
credential_reads_authorized: 0
external_network_authorized: false
external_provider_or_model_calls_authorized: 0
real_model_calls_authorized: 0
pi_changes_authorized: false
git_stage_or_commit_authorized: false
```

Implement only the Contract-listed applicability-scoped Regression Gate, promoted-State
follow-up assessment and assessed rollback linkage. Preserve:

- `ordinary failure != rollback`;
- `negative evidence != State-attributable regression`;
- `new evidence != direct supersede`;
- `needs_reassessment` never mutates active State; and
- every replacement repeats existing V3 Candidate → Validation/Regression → Promote/Reject.

Use existing local dependencies only. Do not edit control state or accepted Goal 1 files.
If the bounded implementation requires a forbidden accepted-core change or new authority,
stop with the exact `DECISION_REQUIRED` fact. Otherwise run the complete matrix, write the
Implementation Report and Closeout Draft, and stop for Main without staging or committing.
