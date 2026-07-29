# Current State

> Updated: 2026-07-29

```yaml
project:
  name: Agent Harness Reliability Workbench
  phase: g003_ready_to_start
  status: goal_session_handoff_ready

active_goal:
  id: null
  status: none
  contract: null
  disposition: null

last_closed_goal:
  id: G002_PI_DIRECT_HARNESS_GO_GATE
  status: closed_blocked
  contract: docs/goals/G002_PI_DIRECT_HARNESS_GO_GATE.md
  disposition: BLOCKED_G002_SETUP
  architecture_review: accepted_blocked_closeout

last_completed_goal:
  id: G001_PI_SOURCE_AUDIT
  status: complete
  contract: docs/goals/G001_PI_SOURCE_AUDIT.md
  architecture_review: accepted

next_goal:
  id: G003_PI_DIRECT_HARNESS_GO_GATE_RETRY
  status: ready_to_start
  contract: docs/goals/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY.md
  authorized_setup_strategy: integrity_pinned_npm_artifact_model_data_restore

completed_work:
  - original_research_context_reviewed
  - deep_research_report_reviewed
  - current_plan_written
  - root_git_initialized
  - project_control_files_created
  - pi_downloaded_and_pinned
  - upstream_snapshot_created
  - G001_contract_created
  - G001_static_source_audit_completed
  - G001_evidence_package_created
  - G001_architecture_review_accepted
  - ADR_0001_direct_agentharness_for_G002_accepted
  - G002_draft_contract_created
  - G002_contract_activated
  - initial_project_commit_authorized
  - initial_project_commit_created
  - G002_activation_preconditions_verified
  - G002_isolated_pi_clone_created
  - G002_dependencies_hydrated_with_scripts_disabled
  - G002_setup_blocker_recorded
  - G002_blocked_closeout_architecture_reviewed
  - artifact_backed_model_data_recovery_authorized
  - live_model_data_generation_rejected_for_G002_retry
  - standard_emitted_package_build_boundary_retained
  - ADR_0002_artifact_backed_model_data_for_G002_retry_accepted
  - G003_goal_contract_drafted
  - G003_contract_architecture_control_reviewed
  - G003_baseline_commit_authorized
  - G003_contract_activated

workspace:
  git_initialized: true
  initial_commit_created: true
  upstream_directory: .upstream/pi
  runs_directory: .runs
  formal_workbench_created: false

pi:
  downloaded: true
  remote: https://github.com/earendil-works/pi.git
  commit: 027a5847901b5dde30270abaa1041046cd2b4b55
  branch: main
  nearest_tag: v0.82.1
  commits_after_nearest_tag: 40
  exact_head_tag: null
  package_version: 0.82.1
  working_tree_clean: true
  source_audited: true
  source_audit_disposition: ACCEPT_FOR_DYNAMIC_VERIFICATION
  architecture_review: accepted_for_bounded_dynamic_verification
  basis_decision: provisional_accept_for_G002_only
  high_priority_signal: post_release_agent_harness_confirmed_public_but_semantically_in_progress

architecture:
  candidate: Direct pi-agent-core AgentHarness
  status: accepted_as_G002_primary_not_frozen_for_V0
  supersedes: Pi SDK Runner + Inline Extension as V0 experimental runtime basis
  retained_comparator: Pi Coding Agent SDK Runner + Inline Extension
  fallback: Pi RPC/process adapter only on observed isolation need
  g002_setup_recovery: artifact_backed_model_data_restore_authorized
  pi_ai_build_boundary: standard_build_offline_retained
  live_model_data_hydration: prohibited_for_G002_retry

first_policy:
  candidate: Completion Verification
  status: not_frozen

implementation:
  dependencies_installed: true_in_isolated_g002_clone
  deterministic_spike_created: false
  real_model_run_completed: false

g002:
  contract_created: true
  contract_status: closed_blocked
  disposition: BLOCKED_G002_SETUP
  architecture_review: ACCEPT_G002_BLOCKED_CLOSEOUT
  architecture_review_report: docs/reports/G002_ARCHITECTURE_REVIEW.md
  project_commit_policy: record_clean_root_HEAD_at_goal_start
  project_commit: e991de16cf5d46b81ff26dd00ac0a1743cd826d9
  execution_environment: Windows_native_PowerShell
  wsl_authorized: false
  isolated_dependency_root: .runs/g002/pi
  scope: minimal_dynamic_go_gate
  setup_progress:
    activation_preconditions: passed
    isolated_clone: passed
    dependency_hydration: passed
    pi_ai_targeted_build: blocked_missing_generated_model_data
    pi_agent_core_targeted_build: not_run
  gates:
    gate_a: blocked_not_run
    gate_b: blocked_not_run
    gate_c: blocked_not_run
    gate_d: blocked_not_run
    gate_e: blocked_not_run
  report: docs/reports/G002_PI_DIRECT_HARNESS_GO_GATE_REPORT.md
  closeout: docs/reports/G002_PI_DIRECT_HARNESS_GO_GATE_CLOSEOUT.md

g003_authorization:
  goal_contract_created: true
  goal_contract: docs/goals/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY.md
  goal_contract_status: ready_to_start
  activation_ready: true
  purpose: retry_G002_Gates_A_through_E_after_bounded_setup_recovery
  model_data_source: "@earendil-works/pi-ai@0.82.1 npm release artifact"
  source_integrity: "sha512-3WFYRhEp3lQB3444EhPMBcM7zSaEUE3eJgHOR7s4081NLqbw/FsWilIKWXSua0Gv3sRr7m9xMidR3pPDE7jI/A=="
  source_shasum: "02ebdfc2997fd88ca1f51a7b5c01f337a9462f34"
  source_git_head: b4f293684bba718d59cc1157679bcf6157b3a7f5
  expected_data_inventory: 38_files
  pinned_source_validation_required: true
  live_catalog_generation_authorized: false
  custom_or_partial_pi_ai_build_authorized: false
  decision: docs/decisions/ADR-0002-artifact-backed-model-data-for-g002-retry.md

next_checkpoint:
  - commit_G002_closeout_architecture_decision_and_G003_contract_baseline
  - verify_clean_committed_project_HEAD
  - hand_off_clean_committed_HEAD_to_new_G003_goal_session

open_user_decisions: []
```

## Current Constraints

- Keep `.upstream/pi` immutable as the reference checkout.
- At G003 start, verify and record the clean committed root `HEAD` as
  `project_commit`.
- Keep the hydrated G002 dependencies and generated setup artifacts only in the
  isolated `.runs/g002/pi` clone.
- Do not create the formal Workbench or call a real model.
- Do not use WSL, SDK/RPC fallback, or a Pi core patch without new evidence and
  architecture review.
- Do not run Pi's live `hydrate:model-data` or `generate-models` commands for
  the G002 retry.
- A separately contracted retry may restore only the integrity-pinned
  `@earendil-works/pi-ai@0.82.1` artifact's `dist/providers/data/` payload into
  an isolated `.runs/` clone, and must pass pinned-source `check:model-data`
  before building.
- Preserve Pi's standard emitted-package build boundary; do not use a custom or
  partial Pi AI build as Gate A evidence.
- Do not create `.runs/g003`, download the artifact, install dependencies or
  execute any Gate until the G003 contract is committed as `ready_to_start` in
  a clean project baseline.
- Do not commit Git changes unless explicitly requested.

## Expected Next Handoff

Commit the accumulated G002 closeout/architecture decision and activated G003
control files, verify a clean `HEAD`, and hand that hash to a new G003 Goal
Session. Final Pi Go, real-model execution, the V0 Version Charter and
architecture freeze remain unauthorized.
