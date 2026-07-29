# Current State

> Updated: 2026-07-29

```yaml
project:
  name: Agent Harness Reliability Workbench
  phase: post_g003_reference_analysis
  status: awaiting_g005_contract_creation_authorization

active_goal:
  id: null
  status: none
  contract: null
  disposition: null

last_executed_goal:
  id: G003_PI_DIRECT_HARNESS_GO_GATE_RETRY
  status: complete
  contract: docs/goals/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY.md
  disposition: PASS_DIRECT_GO_GATE
  architecture_review: ACCEPT_G003_PASS_DIRECT_GO_GATE_WITH_NON_BLOCKING_CORRECTIONS

last_closed_goal:
  id: G002_PI_DIRECT_HARNESS_GO_GATE
  status: closed_blocked
  contract: docs/goals/G002_PI_DIRECT_HARNESS_GO_GATE.md
  disposition: BLOCKED_G002_SETUP
  architecture_review: accepted_blocked_closeout

last_completed_goal:
  id: G003_PI_DIRECT_HARNESS_GO_GATE_RETRY
  status: complete
  contract: docs/goals/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY.md
  disposition: PASS_DIRECT_GO_GATE
  architecture_review: accepted_for_next_bounded_robustness_checkpoint

next_goal:
  id: G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY
  status: candidate_only_contract_creation_not_authorized
  contract: null
  candidate_scope_not_frozen: bounded_real_model_direct_agentharness_completion_verification_feasibility

retired_goal_candidate:
  id: G004_DIRECT_HARNESS_ROBUSTNESS
  status: retired_before_contract
  contract: null
  execution_started: false
  reason: broad_pre_phase3_robustness_umbrella_not_supported_by_reclassified_risks

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
  - G003_activation_preconditions_verified
  - G003_fresh_non_hardlinked_pi_clone_created
  - G003_locked_dependencies_hydrated_with_scripts_disabled
  - G003_release_boundary_compatibility_verified
  - G003_exact_pi_ai_artifact_integrity_and_archive_safety_verified
  - G003_data_only_model_data_restore_completed
  - G003_pinned_source_model_data_validation_passed
  - G003_standard_pi_ai_and_agent_core_builds_passed
  - G003_gate_a_public_emitted_import_passed
  - G003_gate_b_baseline_observation_passed
  - G003_gate_c_one_cycle_recovery_passed
  - G003_gate_d_event_session_verifier_order_passed
  - G003_gate_e_initial_fairness_manifest_passed
  - G003_report_and_closeout_created
  - G003_report_evidence_label_corrected
  - G003_architecture_review_accepted_with_non_blocking_corrections
  - ADR_0003_direct_agentharness_for_bounded_robustness_accepted
  - G003_evidence_baseline_commit_authorized
  - G003_evidence_baseline_committed
  - cc_harness_knowledge_inventory_completed
  - harness_pattern_map_completed
  - pinned_pi_harness_comparison_completed
  - current_runtime_risks_reclassified
  - reference_backed_policy_candidates_ranked
  - broad_G004_pre_phase3_umbrella_retired_before_contract
  - main_session_specialist_session_governance_accepted

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
  basis_decision: g003_mechanism_accepted_no_current_architecture_blocker_not_final_go
  high_priority_signal: post_release_agent_harness_confirmed_public_but_semantically_in_progress

architecture:
  candidate: Direct pi-agent-core AgentHarness
  status: accepted_as_G005_real_model_feasibility_candidate_not_frozen_for_V0
  supersedes: Pi SDK Runner + Inline Extension as V0 experimental runtime basis
  retained_comparator: Pi Coding Agent SDK Runner + Inline Extension
  fallback: Pi RPC/process adapter only on observed isolation need
  g002_setup_recovery: artifact_backed_model_data_restore_authorized
  pi_ai_build_boundary: standard_build_offline_retained
  live_model_data_hydration: prohibited_for_G002_retry
  g003_review: ACCEPT_G003_PASS_DIRECT_GO_GATE_WITH_NON_BLOCKING_CORRECTIONS
  g003_basis_decision: docs/decisions/ADR-0003-direct-agentharness-for-bounded-robustness.md
  next_decision_material: docs/reports/CC_HARNESS_REFERENCE_ANALYSIS_DECISION_SUMMARY.md

first_policy:
  candidate: Completion Verification
  status: deterministic_mechanism_feasible_real_model_effect_not_verified_not_frozen

implementation:
  dependencies_installed: true_in_isolated_g002_and_g003_clones
  deterministic_spike_created: true_g003_only
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
  goal_contract_status: executed_complete
  activation_ready: false
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

g003:
  contract_status: complete
  disposition: PASS_DIRECT_GO_GATE
  architecture_review: ACCEPT_G003_PASS_DIRECT_GO_GATE_WITH_NON_BLOCKING_CORRECTIONS
  architecture_review_report: docs/reports/G003_ARCHITECTURE_REVIEW.md
  project_commit: 3723626a63bae69b3932f2ef48f54de2235b5460
  pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
  isolated_execution_root: .runs/g003
  artifact:
    package: "@earendil-works/pi-ai@0.82.1"
    integrity_verified: true
    shasum_verified: true
    archive_members: 712
    selected_data_files: 38
    restored_manifest_sha256: c2d89b03ccb2c095c59ead0437592b21e9676d049ad8e92ea90a466adf10b24d
  setup:
    activation_preconditions: passed
    isolated_clone: passed
    dependency_hydration: passed
    release_boundary_compatibility: passed
    archive_safety: passed
    pinned_source_model_data_validation: passed
    pi_ai_standard_build_offline: passed
    pi_agent_core_standard_build: passed
  gates:
    gate_a: passed
    gate_b: passed
    gate_c: passed
    gate_d: passed
    gate_e: passed
  baseline:
    provider_calls: 2
    verifier_runs: 1
    final_status: failed_as_required
  candidate:
    provider_calls: 4
    verifier_runs: 2
    recovery_prompts: 1
    final_status: passed
  report: docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_REPORT.md
  closeout: docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_CLOSEOUT.md
  evidence_label_correction_applied: true
  registry_raw_response_capture_gap: retained_non_blocking
  strict_library_typecheck_risk: third_party_declarations_missing_with_skipLibCheck_false

reference_analysis:
  status: complete_accepted_for_project_control_alignment
  task_kind: read_only_analysis_not_execution_goal
  knowledge_root: reference/cc-harness-knowledge
  semantic_files_read: 29
  source_mirror: reference/src
  source_mirror_role: implementation_detail_reference_when_notes_are_insufficient
  architecture_blockers_found: 0
  G004_recommendation: retire_broad_pre_phase3_umbrella
  next_high_value_candidate: bounded_real_model_completion_verification_feasibility
  reports:
    decision_summary: docs/reports/CC_HARNESS_REFERENCE_ANALYSIS_DECISION_SUMMARY.md
    risk_reclassification: docs/reports/CURRENT_RUNTIME_RISK_RECLASSIFICATION.md
    pi_comparison: docs/reports/PI_CC_HARNESS_COMPARISON_MATRIX.md
    pattern_map: docs/reports/CC_HARNESS_PATTERN_MAP.md
    knowledge_inventory: docs/reports/CC_HARNESS_KNOWLEDGE_INVENTORY.md
    policy_candidates: docs/reports/REFERENCE_BACKED_POLICY_CANDIDATES.md
    closeout: docs/reports/CC_HARNESS_REFERENCE_ANALYSIS_CLOSEOUT.md
  risk_summary:
    settled_cross_process_reconstruction: mature_pattern_unverified
    crash_after_side_effect: future_reliability_case
    registry_raw_response: provenance_debt
    strict_typescript_consumer: known_issue
    windows_cold_import: known_issue
    long_running_tool_cancellation: mature_pattern_unverified
    context_compaction: mature_pattern_unverified
    completion_verification: current_goal_candidate
    pi_upstream_evolution: known_issue
    recovery_budget: mature_pattern_unverified

required_reading:
  - docs/reports/CC_HARNESS_REFERENCE_ANALYSIS_DECISION_SUMMARY.md
  - docs/reports/CURRENT_RUNTIME_RISK_RECLASSIFICATION.md
  - docs/reports/PI_CC_HARNESS_COMPARISON_MATRIX.md

next_checkpoint:
  - review_this_control_plane_alignment
  - request_explicit_user_authorization_before_creating_G005_goal_contract
  - if_authorized_draft_G005_in_the_main_session_without_execution

open_user_decisions:
  - authorize_or_reject_G005_goal_contract_creation
  - later_select_provider_model_call_budget_and_fixture_during_G005_contract_review
```

## Current Constraints

- Keep `.upstream/pi` immutable as the reference checkout.
- Preserve `.runs/g002` and `.runs/g003` as ignored generated evidence; do not
  merge, overwrite or commit them.
- Do not create the formal Workbench or call a real model.
- Do not use WSL, SDK/RPC fallback, or a Pi core patch without new evidence and
  architecture review.
- Do not treat G003's fixed-task pass as Policy effectiveness, final Pi Go,
  current provider-catalog validation, or a V0 architecture freeze.
- G004 was retired before a contract was created. Do not recreate it as a broad
  pre-Phase-3 robustness umbrella or silently reuse its identifier.
- G005 is a candidate only. Do not create its Goal Contract, call a real model,
  create `.runs/g005`, begin Phase 3, adopt a fallback runtime or change the
  standard package boundary without new explicit authorization.
- Carry risks according to
  `docs/reports/CURRENT_RUNTIME_RISK_RECLASSIFICATION.md`; an unverified mature
  pattern is not an observed failure or an automatic Goal/Gate.
- Treat `reference/cc-harness-knowledge` and `reference/src` as read-only design
  references. Do not modify or commit them without explicit authorization.
- Do not commit Git changes unless explicitly requested.

## Expected Next Handoff

Review this control-plane alignment. If separately authorized, draft—but do not
execute—`G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY` in the main
session. Final Pi Go, real-model execution, Phase 3, the V0 Version Charter,
formal Workbench creation and architecture freeze remain unauthorized.
