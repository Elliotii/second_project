# V3.6 Engineering Stabilization Campaign Status

```yaml
campaign_status:
  campaign_id: V3_6_ENGINEERING_STABILIZATION_CAMPAIGN
  status: active_es_n03_terminalization_compatibility_maintenance
  version_status: V3_6_remains_closed_accepted
  functional_baseline_commit: 7d63e76c3df357294d480c45e4bad785e8f2fa8a
  campaign_control_baseline_commit: e6451c273c1186728a6b6a8f98b02bf1f88b1cc4
  plan: docs/第二项目_Codex交接包_2026-07-30/V3_6_ENGINEERING_STABILIZATION_CAMPAIGN_PLAN.md
  baseline: docs/reports/V3_6_ENGINEERING_STABILIZATION_CAMPAIGN_BASELINE.md
  test_session_id: 019ff181-51a8-7381-aae9-b8223e6a8bd3
  natural_cases_started: 3
  natural_cases_completed: 3
  natural_cases_failed: 1
  findings_total: 1
  bounded_maintenance_count: 0
  decision_required_count: 1
  post_maintenance_retests: 0
  fault_injection_cases: 0
  candidate_failure_cases: 2_historical_unselected
  known_boundaries:
    - arbitrary_in_flight_crash
    - unknown_usage_or_response_loss
    - uncertain_tool_side_effect
    - same_session_durable_crash_recovery
    - generalized_transactional_multi_file_apply
  current_case: ES_N03_frozen_failure_decision_required
  current_task_sha256: 4852cfd2f9623c4e9a37d0880e4764c5d1c9bd117f10dcb7e36bb04da3812484
  current_blocker: null
  stop_condition_status: maintenance_in_progress_before_retest
  decision_required: false
  active_maintenance: POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_MAINTENANCE
  v4_authorized: false
```

## Current disposition

ES-N01 is Main-accepted as a normal completion with no F1–F11 Finding: one clean Session
and one Run settled, the registered Docker command passed 16/16, the proposed ChangeSet
contains exactly `src/inventory.ts` and `tests/inventory.test.ts`, registered Source stayed
at its frozen inventory, and there was no Apply/Retry/Fallback/Replacement/continuation.
Raw Evidence remains immutable under the ES-N01 data root; the external handoff SHA-256
is `6cddf552d21ac604ee4513c5f6544e737584c6b94ee122d0771c443f6fe3f7b0`.

ES-N02 is also Main-accepted as a normal completion with no F1–F11 Finding: one clean
Session and one Run settled, the registered Docker command passed 13/13, the proposed
ChangeSet contains exactly `src/skills.ts` and `tests/skills.test.ts`, registered Source
stayed at its frozen inventory, and there was no Apply/Retry/Fallback/Replacement/
continuation. Raw Evidence remains immutable under the ES-N02 data root; the external
handoff SHA-256 is
`eaae5de0271243cf1b5e23accafb6adfa3e1fcccf7ce3ba2ed46735c981a5314`.

Main authorized ES-N03 as one differentiated behavior-preserving refactor Case. The
existing Test Session ran it once from a new clean Session/data root and stopped with the
Failure handoff; no ES-N04, Retest or Fault Injection was performed.

ES-N03 is now frozen as a natural Failure. Its Tool-budget stop was correctly detected
internally, but an unavailable Tool call made persisted Session Tool counts diverge from
the registered-hook counter. No typed terminal, Manifest, command evidence or ChangeSet
was written, and normal Session list/detail degraded to generic `request_rejected`.
Main accepts the Evidence as F1 + F2 with F4 trajectory inefficiency and pauses the
Campaign under the repeated-terminalization-class Decision Required rule. See
`V3_6_ENGINEERING_STABILIZATION_ES_N03_DECISION_REQUIRED.md`. At that Decision Required
checkpoint, no next Case, maintenance, Retest or budget change was authorized.

The user accepted recommended Option A on 2026-08-12. Main activated one bounded,
zero-real-call Tool-accounting terminalization compatibility maintenance under the formal
Contract. It preserves all budget values and Agent Loop/Pi/Source/Apply authority. ES-N03
Retest remains gated until implementation, deterministic acceptance and the single focused
audit pass. ES-N04 remains unauthorized.

Implementation is owned by top-level Session
`019ff603-ac10-7ba1-a79e-98125f447964` in isolated worktree `ef7e`, starting from Launch
Record `73c124072a8ba495e6f25825bd48db774ef57581` with zero real access.

The zero-access candidate is integrated at
`02096eb80986060bf57a69062f001f358267b72e`. Main light review passed after one bounded
identity-domain correction returned to the original Implementation Session. The next and
only active gate is a fresh top-level focused read-only audit; Maintenance acceptance,
Retest and ES-N04 remain gated.

The exact Candidate Audit Baseline is
`1b826237249d29be111107be44f474c6355107a5`. The focused audit is owned by top-level
Session `019ff621-ec68-78e2-bc66-6d3bbca88de9` in isolated worktree `264f`.

The audit disposition is `REVISE`: it reproduced one blocking semantic-pairing gap in
schema 4, where a digest-recomputed registered ToolResult name mismatch could survive
Session reopen. One non-blocking report-accuracy issue also identified two trailing-space
lines in the Closeout Draft. Both findings are returned to the original Implementation
Session as one affected correction; no new audit or governance stage is created.

The original Implementation Session supplied bounded correction
`79e74f2b7c1801c5b9001633aebf82c03bd5d734`; Main integrated it as `958c09cd…` and froze
corrected Candidate Audit Baseline `6df87e2a4711fd6b3b0b61a6aa720f35815a70ff`.
Only the two audit findings are being rechecked by the original Audit Session.

The affected-finding recheck passed. Main formally accepted and closed the maintenance;
see `POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_CLOSEOUT.md`. The Campaign is now
at the exactly-one ES-N03 post-maintenance Retest gate. ES-N03 itself is not accepted or
replaced, and ES-N04 remains unauthorized.

Main froze the Retest authorization at `da25dbe779d9ff70ca0ccffa5096fa92866eab42`
and dispatched it to the existing top-level Test Session
`019ff181-51a8-7381-aae9-b8223e6a8bd3`. The Retest is one fresh Case evidence root with
the original task/profile/Source/provider/command; no Retry, continuation, Apply,
replacement, ES-N04 or Fault Injection is authorized.

Historical Attempt 1 and Attempt 2 are preserved as Campaign context and potential later
curation inputs; they do not increment the new Natural Case counters above.

## Immutable progress rule

This file records Main's current Campaign classification only. Raw `.runs/` Evidence and
Test Session handoffs remain the authoritative Case facts. A maintenance creates a new
commit and a Retest creates a new Evidence root; neither may overwrite the Before-Fix
Attempt.
