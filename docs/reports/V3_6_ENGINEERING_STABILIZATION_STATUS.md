# V3.6 Engineering Stabilization Campaign Status

```yaml
campaign_status:
  campaign_id: V3_6_ENGINEERING_STABILIZATION_CAMPAIGN
  status: active_natural_case_2_authorized_pending_dispatch
  version_status: V3_6_remains_closed_accepted
  functional_baseline_commit: 7d63e76c3df357294d480c45e4bad785e8f2fa8a
  campaign_control_baseline_commit: e6451c273c1186728a6b6a8f98b02bf1f88b1cc4
  plan: docs/第二项目_Codex交接包_2026-07-30/V3_6_ENGINEERING_STABILIZATION_CAMPAIGN_PLAN.md
  baseline: docs/reports/V3_6_ENGINEERING_STABILIZATION_CAMPAIGN_BASELINE.md
  test_session_id: 019ff181-51a8-7381-aae9-b8223e6a8bd3
  natural_cases_started: 1
  natural_cases_completed: 1
  natural_cases_failed: 0
  findings_total: 0
  bounded_maintenance_count: 0
  decision_required_count: 0
  post_maintenance_retests: 0
  fault_injection_cases: 0
  candidate_failure_cases: 2_historical_unselected
  known_boundaries:
    - arbitrary_in_flight_crash
    - unknown_usage_or_response_loss
    - uncertain_tool_side_effect
    - same_session_durable_crash_recovery
    - generalized_transactional_multi_file_apply
  current_case: ES_N02_skill_cooldown_regression_authorized_pending_dispatch
  current_task_sha256: f21515983e65388b0f8b4b57c0aca25800d6f278adb15eae98c5e900c8f1489a
  current_blocker: null
  stop_condition_status: not_yet_met
  decision_required: false
  active_maintenance: null
  v4_authorized: false
```

## Current disposition

ES-N01 is Main-accepted as a normal completion with no F1–F11 Finding: one clean Session
and one Run settled, the registered Docker command passed 16/16, the proposed ChangeSet
contains exactly `src/inventory.ts` and `tests/inventory.test.ts`, registered Source stayed
at its frozen inventory, and there was no Apply/Retry/Fallback/Replacement/continuation.
Raw Evidence remains immutable under the ES-N01 data root; the external handoff SHA-256
is `6cddf552d21ac604ee4513c5f6544e737584c6b94ee122d0771c443f6fe3f7b0`.

Main has authorized one differentiated Natural regression-fix Case, ES-N02. The same
existing Test Session must run it from a new clean Session/data root and then stop with a
normal-completion record or Finding handoff. No ES-N03, Retest or Fault Injection is yet
authorized.

Historical Attempt 1 and Attempt 2 are preserved as Campaign context and potential later
curation inputs; they do not increment the new Natural Case counters above.

## Immutable progress rule

This file records Main's current Campaign classification only. Raw `.runs/` Evidence and
Test Session handoffs remain the authoritative Case facts. A maintenance creates a new
commit and a Retest creates a new Evidence root; neither may overwrite the Before-Fix
Attempt.
