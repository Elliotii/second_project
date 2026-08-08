# V3.5 Goal 2.5 Focused Audit Hit-only Recheck Prompt

```yaml
status: authorized_hit_only_recheck
goal_id: V3_5_G2_5_TERMINATION_SAFE_REAL_SKILL_CLOSURE
session: same_audit_session_019fe241-6a78-79e2-8c3d-2444095a9f02
corrected_candidate_baseline: cbe3c2b841b701c80a0c098dd362b9b91b90466f
findings: [V3G25-AUDIT-P1-001, V3G25-AUDIT-P1-002]
source_edit_authorized: false
access_authority: zero_credentials_zero_network_zero_provider_zero_real_model
```

Recheck only the two findings from your completed focused audit. Main has mechanically moved
your clean audit worktree to exact corrected Candidate
`cbe3c2b841b701c80a0c098dd362b9b91b90466f`; verify that identity and pinned Pi cleanliness
before testing.

1. For `V3G25-AUDIT-P1-001`, inspect the typed post-success pre-dispatch guard and run the
   mixed Tool-batch negative. Confirm no Provider dispatch/response occurs after the
   successful `public_test`, the trajectory is invalid rather than misclassified, and zero
   Verifiers/Candidates start. Confirm the sole successful-public-test settled fixture still
   passes.
2. For `V3G25-AUDIT-P1-002`, inspect the budget checkpoint's Session ref/count/digest and the
   handoff's live Session/Tool/Workspace/protected recheck. Run the post-checkpoint Session,
   Workspace and protected-drift negatives and confirm zero Verifiers/Candidates.
3. Run strict TypeScript, `v35g25:test`, and only the directly affected narrow regressions
   needed to exclude a hit regression. Do not repeat general architecture/history review.

Update the existing tracked
`docs/reports/V3_5_G2_5_FOCUSED_INDEPENDENT_AUDIT_REPORT.md` by appending a clearly dated
Hit Recheck section with exact commands/results and final disposition. Do not alter its
original findings. Write no other tracked file, do not commit, and do not modify source,
control state, Pi or evidence authority. Access remains `0/0/0/0/0`; do not execute the real
entry.

Stop with either `PASS_V3_5_G2_5_FOCUSED_AUDIT_AFTER_HIT_RECHECK` or a concrete remaining
finding. A pass may recommend this exact Candidate for Main's no-source-edit Execution
Baseline; it does not authorize the real pair by itself.
