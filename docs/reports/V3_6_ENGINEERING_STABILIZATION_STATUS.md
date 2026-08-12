# V3.6 Engineering Stabilization Campaign Status

```yaml
campaign_status:
  campaign_id: V3_6_ENGINEERING_STABILIZATION_CAMPAIGN
  status: active_natural_case_1_running
  version_status: V3_6_remains_closed_accepted
  functional_baseline_commit: 7d63e76c3df357294d480c45e4bad785e8f2fa8a
  campaign_control_baseline_commit: e6451c273c1186728a6b6a8f98b02bf1f88b1cc4
  plan: docs/第二项目_Codex交接包_2026-07-30/V3_6_ENGINEERING_STABILIZATION_CAMPAIGN_PLAN.md
  baseline: docs/reports/V3_6_ENGINEERING_STABILIZATION_CAMPAIGN_BASELINE.md
  test_session_id: 019ff181-51a8-7381-aae9-b8223e6a8bd3
  natural_cases_started: 1
  natural_cases_completed: 0
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
  current_case: ES_N01_healing_potion_feature_running_in_test_session
  current_task_sha256: 0f5b7b47866f5a666bda0a2de418a033a22bbc5e5804871a7e8370f8eb17b52a
  current_blocker: null
  stop_condition_status: not_yet_met
  decision_required: false
  active_maintenance: null
  v4_authorized: false
```

## Current disposition

Campaign activation is complete. Main dispatched the frozen ES-N01 healing-potion
Natural Case to existing Test Session `019ff181-51a8-7381-aae9-b8223e6a8bd3` from exact
Authorization Record Commit `5f86fa0f7b2cd623dffee38d62958f2361af4157`. The Session is
running and must stop after one dispatch with a normal-completion record or Finding
handoff. No second Case, Retest or Fault Injection is authorized until Main receives and
classifies that evidence.

Historical Attempt 1 and Attempt 2 are preserved as Campaign context and potential later
curation inputs; they do not increment the new Natural Case counters above.

## Immutable progress rule

This file records Main's current Campaign classification only. Raw `.runs/` Evidence and
Test Session handoffs remain the authoritative Case facts. A maintenance creates a new
commit and a Retest creates a new Evidence root; neither may overwrite the Before-Fix
Attempt.
