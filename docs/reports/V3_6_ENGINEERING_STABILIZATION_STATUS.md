# V3.6 Engineering Stabilization Campaign Status

```yaml
campaign_status:
  campaign_id: V3_6_ENGINEERING_STABILIZATION_CAMPAIGN
  status: activated_control_baseline_pending
  version_status: V3_6_remains_closed_accepted
  functional_baseline_commit: 7d63e76c3df357294d480c45e4bad785e8f2fa8a
  campaign_control_baseline_commit: resulting_HEAD_of_activation_revision
  plan: docs/第二项目_Codex交接包_2026-07-30/V3_6_ENGINEERING_STABILIZATION_CAMPAIGN_PLAN.md
  baseline: docs/reports/V3_6_ENGINEERING_STABILIZATION_CAMPAIGN_BASELINE.md
  test_session_id: 019ff181-51a8-7381-aae9-b8223e6a8bd3
  natural_cases_started: 0
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
  current_case: ES_N01_pending_test_session_freeze_and_dispatch
  current_blocker: null
  stop_condition_status: not_yet_met
  decision_required: false
  active_maintenance: null
  v4_authorized: false
```

## Current disposition

Campaign activation is in progress. The Campaign begins with exactly one new Natural
Workload Case. The existing Test Session must freeze and execute that Case, then stop and
return a normal-completion record or Finding handoff to Main. No second Case, Retest or
Fault Injection is authorized until Main receives and classifies that evidence.

Historical Attempt 1 and Attempt 2 are preserved as Campaign context and potential later
curation inputs; they do not increment the new Natural Case counters above.

## Immutable progress rule

This file records Main's current Campaign classification only. Raw `.runs/` Evidence and
Test Session handoffs remain the authoritative Case facts. A maintenance creates a new
commit and a Retest creates a new Evidence root; neither may overwrite the Before-Fix
Attempt.
