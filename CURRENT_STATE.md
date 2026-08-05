# Current State

> Updated: 2026-08-06

```yaml
project:
  name: Agent Harness Reliability Workbench
  phase: v1_c_stage_1_accepted_execution_baseline_ready_canary_not_authorized
  status: V1_C_STAGE1_AUDITED_EXECUTION_BASELINE_READY_REAL_CANARY_NOT_AUTHORIZED

active_goal: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION

last_executed_goal:
  id: V1_B_FROZEN_BOUNDED_REAL_PILOT
  status: closed_inconclusive_not_completed
  contract: docs/第二项目_Codex交接包_2026-07-30/V1_B_GOAL_CONTRACT.md
  disposition: CLOSE_V1_B_INCONCLUSIVE_AUTHORIZED_SEQUENCE_EXHAUSTED
  replacement_execution_baseline_commit: f7cf45150724061269179716e1b2f487db1ff5c7

last_closed_goal:
  id: V1_B_FROZEN_BOUNDED_REAL_PILOT
  status: closed_inconclusive_not_completed
  contract: docs/第二项目_Codex交接包_2026-07-30/V1_B_GOAL_CONTRACT.md
  disposition: CLOSE_V1_B_INCONCLUSIVE_AUTHORIZED_SEQUENCE_EXHAUSTED
  closeout: docs/reports/V1_B_CLOSEOUT.md

last_completed_goal:
  id: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
  status: closed_accepted
  contract: docs/第二项目_Codex交接包_2026-07-30/V1_A_GOAL_CONTRACT.md
  disposition: PASS_V1_A_DETERMINISTIC_SUBSTRATE
  implementation_baseline_commit: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf

next_goal:
  id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
  status: active_waiting_real_canary_authorization
  contract: docs/第二项目_Codex交接包_2026-07-30/V1_C_GOAL_CONTRACT.md

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
  - G005_goal_contract_drafted_for_review
  - G005_credential_boundary_and_safe_templates_prepared
  - current_DeepSeek_V4_external_API_path_checked_for_contract_drafting
  - pinned_Pi_custom_model_dispatch_path_checked_for_G005
  - G005_goal_contract_accepted_by_user
  - G005_activation_and_bounded_real_model_execution_authorized_by_user
  - G005_credential_provisioning_attested_by_user_without_main_session_inspection
  - G005_activation_preconditions_passed
  - G005_artifact_backed_model_data_restore_and_standard_build_passed
  - G005_gate_a_passed
  - G005_baseline_completed_four_provider_calls_three_tool_round_trips_and_settled
  - G005_project_side_observer_and_journal_defects_identified
  - G005_main_session_option_b_architecture_decision_accepted
  - G005_closed_with_INVALID_G005_EVIDENCE
  - G005_invalid_evidence_closeout_architecture_review_accepted
  - G005_project_and_pinned_Pi_observability_attribution_calibrated
  - G006_pre_model_Gate_0_and_clean_baseline_sequence_defined_as_candidate_only
  - G006_precontract_local_source_and_evidence_research_completed
  - current_DeepSeek_V4_external_API_path_rechecked_for_G006_drafting
  - G006_two_stage_authorization_boundary_defined
  - G006_draft_contract_created_for_review
  - G006_goal_contract_accepted_by_user
  - G006_stage_1_Gate_0_activation_authorized_by_user
  - G006_stage_1_precondition_check_stopped_before_implementation_for_missing_contract_baseline_commit_authority
  - G006_accepted_contract_baseline_commit_authorized_and_created
  - G006_fresh_non_hardlinked_pi_clone_created
  - G006_locked_dependencies_hydrated_with_scripts_disabled
  - G006_exact_pi_ai_artifact_and_archive_boundary_reverified
  - G006_model_data_restore_and_standard_builds_passed
  - G006_public_emitted_import_and_strict_type_gates_passed
  - G006_subscriber_observer_Faux_regression_passed
  - G006_journal_v2_attribution_source_identity_and_frozen_input_regressions_passed
  - G006_stage_1_Gate_0_source_review_passed_with_zero_external_provider_calls
  - G006_implementation_baseline_commit_authorized_by_user
  - G006_reviewed_implementation_baseline_committed
  - G006_clean_HEAD_and_reviewed_source_identity_bound_with_zero_provider_calls
  - G006_stage_2_real_model_execution_authorized_by_user
  - G006_current_official_DeepSeek_V4_API_checkpoint_passed
  - G006_stage_2_Gate_A_passed_with_zero_provider_calls
  - G006_unique_write_once_paired_attempt_completed
  - G006_baseline_real_route_settled_and_external_verifier_passed
  - G006_candidate_real_route_settled_and_initial_external_verifier_passed
  - G006_candidate_recovery_correctly_not_triggered
  - G006_Gates_A_through_E_passed
  - G006_final_secret_rescan_passed
  - G006_execution_report_and_closeout_created
  - G006_execution_session_boundary_deviation_recorded
  - G006_independent_session_audit_waived_by_user
  - G006_PASS_REAL_MODEL_FEASIBILITY_architecture_acceptance_completed
  - G006_closed_accepted
  - future_main_and_dedicated_goal_session_boundary_fixed
  - G006_closeout_evidence_and_control_commit_authorized_by_user
  - project_zero_to_current_progress_conclusions_and_complete_forward_plan_created
  - project_synthesis_commit_and_push_authorized_by_user
  - V0_version_charter_accepted
  - V0_control_rule_accepted
  - V0_A_goal_contract_accepted
  - V0_A_activation_authorized
  - V0_A_control_baseline_commit_authorized
  - V0_A_control_state_updated_by_main_session
  - V0_A_control_baseline_commit_created_and_verified
  - V0_A_dedicated_goal_session_executed
  - V0_A_initial_implementation_completed_with_zero_real_model_calls_and_zero_pi_core_patches
  - V0_A_main_review_identified_dangling_junction_and_windows_case_alias_gaps
  - V0_A_bounded_path_security_correction_completed
  - V0_A_corrected_strict_typescript_and_32_tests_passed
  - V0_A_corrected_authoritative_run_verified
  - V0_A_Gates_A_through_G_and_DoD_20_of_20_accepted
  - V0_A_PASS_V0_A_FOUNDATION_accepted_by_main_session_and_user
  - V0_A_content_addressed_workbench_and_fixture_LF_policy_added
  - V0_A_implementation_baseline_commit_authorized_as_resulting_HEAD
  - V0_B_precontract_source_and_evidence_research_completed
  - V0_B_goal_contract_drafted
  - V0_B_goal_contract_accepted_by_user
  - V0_B_activation_authorized_by_user
  - V0_B_control_baseline_commit_authorized_by_user
  - V0_B_control_state_updated_by_main_session
  - V0_B_control_baseline_commit_created_and_verified
  - V0_B_dedicated_goal_session_completed_deterministic_stage_1
  - V0_B_initial_main_review_bounded_correction_completed
  - V0_B_first_candidate_commit_created
  - V0_B_first_independent_risk_audit_requested_bounded_correction
  - V0_B_five_audit_findings_corrected
  - V0_B_basic_authorization_object_micro_correction_completed
  - V0_B_corrected_candidate_commit_created
  - V0_B_focused_independent_reaudit_passed
  - V0_B_Gates_A_through_H_and_DoD_25_of_25_accepted
  - V0_B_PASS_V0_B_EVIDENCE_FOUNDATION_accepted_by_main_session_and_user
  - V0_B_control_and_evidence_closeout_authorized_by_user
  - V0_C_session_governance_revision_authorized_by_user
  - V0_C_precontract_research_authorized_by_user
  - V0_C_precontract_research_completed
  - V0_C_precontract_research_reviewed_by_main_session
  - V0_C_goal_contract_drafted_and_accepted_by_user
  - V0_C_activation_authorized_by_user
  - V0_C_control_baseline_commit_authorized_by_user
  - V0_C_zero_real_call_stage_1_dedicated_session_authorized_by_user
  - V0_C_deterministic_stage_1_completed
  - V0_C_initial_main_review_bounded_correction_completed
  - V0_C_first_candidate_commit_created
  - V0_C_first_focused_audit_requested_two_P2_bounded_corrections
  - V0_C_post_audit_two_finding_correction_completed
  - V0_C_corrected_candidate_commit_created
  - V0_C_focused_independent_reaudit_passed
  - V0_C_implementation_baseline_and_remaining_sequence_preauthorized_by_user
  - V0_C_implementation_baseline_commit_created_and_verified
  - V0_C_stage_2_initial_UAT_paused_before_HTTP_dispatch_on_local_composition_defect
  - V0_C_stage_2_UAT_composition_corrected_with_zero_real_calls
  - V0_C_stage_2_replacement_run_separately_authorized
  - V0_C_stage_2_replacement_user_acceptance_passed
  - V0_C_PASS_V0_C_USER_ACCEPTANCE_accepted_by_main_session_and_user
  - V0_C_closed_accepted
  - V0_closed_accepted
  - V1_skill_runtime_comparison_precontract_research_completed
  - V1_precontract_research_main_review_accepted_with_binding_corrections
  - V1_skill_primary_source_research_completed
  - V1_primary_source_gate_accepted_with_binding_interpretive_correction
  - V1_version_charter_drafted
  - Pi_SDK_Extension_future_compatibility_checkpoint_recorded
  - V1_version_charter_accepted_by_user
  - V1_version_charter_formalized_with_no_active_goal
  - V1_planning_baseline_commit_authorized_by_user
  - V1_planning_baseline_commit_created_and_verified
  - V1_A_goal_contract_draft_created
  - V1_A_goal_contract_accepted_by_user
  - V1_A_goal_contract_formalized_accepted_not_activated
  - V1_A_activation_authorized_by_user
  - V1_A_control_baseline_commit_authorized_by_user
  - V1_A_control_state_updated_by_main_session
  - V1_A_dedicated_zero_real_call_implementation_completed
  - V1_A_main_review_bounded_corrections_completed
  - V1_A_first_candidate_commit_created
  - V1_A_first_focused_independent_audit_requested_four_bounded_corrections
  - V1_A_post_audit_corrections_completed
  - V1_A_corrected_candidate_commit_created
  - V1_A_fresh_windows_focused_independent_reaudit_passed
  - V1_A_Gates_A_through_J_and_DoD_27_of_27_accepted
  - V1_A_PASS_V1_A_DETERMINISTIC_SUBSTRATE_accepted
  - V1_A_closed_accepted
  - V1_B_precontract_readiness_gap_identified_before_real_calls
  - V1_B_source_readiness_and_protocol_governance_specialist_reviews_completed
  - V1_B_integrated_development_plan_accepted_by_user
  - V1_B_two_stage_session_owner_charter_clarification_accepted
  - V1_B_full_24_cell_cell_at_a_time_pilot_plan_accepted
  - V1_B_focused_stage_1_audit_plan_accepted
  - V1_B_Pi_SDK_Extension_checkpoint_remains_deferred
  - V1_B_planning_charter_amendment_baseline_commit_authorized_by_user
  - V1_B_planning_charter_amendment_baseline_commit_created_and_verified
  - V1_B_goal_contract_draft_created
  - V1_B_goal_contract_accepted_by_user
  - V1_B_goal_contract_formalized
  - V1_B_activation_authorized_by_user
  - V1_B_control_baseline_commit_authorized_by_user
  - V1_B_zero_real_call_stage_1_authorized_by_user
  - V1_B_control_baseline_commit_created_and_verified
  - V1_B_stage_1_preparation_prompt_generated
  - V1_B_dedicated_preparation_session_started
  - V1_B_stage_1_Gate_A_identity_and_pi_precheck_passed
  - V1_B_first_stage_1_session_stopped_before_implementation_on_stale_control_narrative
  - V1_B_first_stage_1_session_zero_source_delta_and_zero_real_access_verified
  - V1_B_corrected_control_baseline_commit_created_and_verified
  - V1_B_fresh_stage_1_session_started_from_corrected_baseline
  - V1_B_stage_1_implementation_completed_with_zero_real_access
  - V1_B_first_candidate_rejected_after_focused_audit
  - V1_B_two_P1_findings_corrected_by_original_preparation_session
  - V1_B_main_rereview_test_only_micro_correction_completed
  - V1_B_corrected_candidate_commit_created
  - V1_B_focused_independent_reaudit_passed
  - V1_B_corrected_candidate_and_reaudit_accepted_by_main_session
  - V1_B_bounded_autonomy_execution_envelope_authorized_by_user
  - V1_B_execution_baseline_and_closeout_commits_authorized_by_user
  - V1_B_stage_2_opaque_credential_network_and_real_DeepSeek_calls_authorized_under_USD2_cap
  - V1_B_execution_baseline_created_at_19617319c13a9eecbb325682c920e79d1517b89d
  - V1_B_stage_2_Gates_K_and_L_passed
  - V1_B_stage_2_first_cell_started_once_and_paused_unclassified
  - V1_B_stage_2_later_cells_not_started
  - V1_B_stage_2_actual_usage_and_cost_unverified_due_pause_path_evidence_gap
  - V1_B_stage_2_pause_main_review_accepted
  - V1_B_pause_recovery_amendment_accepted_by_user
  - V1_B_one_zero_call_pause_path_correction_and_focused_reaudit_authorized
  - V1_B_replacement_pilot_authorized_after_new_execution_baseline
  - V1_B_original_unknown_cost_conservatively_debited_at_USD_0_10
  - V1_B_replacement_pilot_cost_cap_USD_1_90_and_sequence_started_initial_runs_max_25
  - V1_B_pause_path_first_corrected_candidate_rejected_with_three_P1_findings
  - V1_B_pause_path_second_corrected_candidate_closed_P1_002_and_P1_003_but_exposed_P1_004
  - V1_B_one_time_P1_004_micro_correction_exception_authorized_and_consumed
  - V1_B_P1_004_focused_independent_reaudit_passed
  - V1_B_final_audited_pause_path_candidate_accepted_at_6a4f6529c4cb2a3e5c726d3bc8cf6beb515b720e
  - V1_B_replacement_manifest_and_sequence_authority_materialized_and_zero_call_validated
  - V1_B_current_official_DeepSeek_V4_Flash_checkpoint_revalidated
  - V1_B_replacement_execution_baseline_and_fresh_stage_2_authorized
  - V1_B_replacement_execution_baseline_created_at_f7cf45150724061269179716e1b2f487db1ff5c7
  - V1_B_replacement_stage_2_Gates_K_L_and_M_passed
  - V1_B_replacement_stage_2_first_cell_started_once_and_paused_on_invalid_or_unknown_usage
  - V1_B_replacement_stage_2_later_cells_not_started
  - V1_B_authorized_original_and_replacement_sequence_exhausted
  - V1_B_closed_inconclusive_not_completed
  - V1_concluded_inconclusive_not_completed
  - V1_C_precontract_research_completed_and_accepted_for_contract_drafting
  - V1_C_goal_contract_accepted_and_formalized
  - V1_C_activation_and_control_baseline_authorized_by_user
  - V1_C_zero_real_call_stage_1_authorized_by_user
  - V1_C_zero_real_call_stage_1_completed
  - V1_C_first_candidate_rejected_after_three_P1_findings
  - V1_C_bounded_post_audit_corrections_and_main_micro_correction_completed
  - V1_C_corrected_candidate_commit_created_at_962b42a281d3092f0faf399b9f6f1ecaa0212f31
  - V1_C_fresh_focused_independent_reaudit_passed
  - V1_C_corrected_candidate_and_reaudit_accepted
  - V1_C_stage_1_closed_as_PASS_V1_C_STAGE1_AUDITED_CANDIDATE
  - V1_C_one_cell_Canary_manifest_materialized_and_zero_call_preflight_passed
  - V1_C_current_official_DeepSeek_provider_checkpoint_passed
  - V1_C_audited_execution_baseline_authorized_by_user
  - V2_remains_not_authorized

workspace:
  git_initialized: true
  initial_commit_created: true
  git_remote_configured: false
  push_authorized_by_user: true
  push_status: pending_user_remote_URL
  project_synthesis_commit: resulting_HEAD_of_this_revision
  upstream_directory: .upstream/pi
  runs_directory: .runs
  formal_workbench_created: true
  v0_a_control_baseline_commit: b6bfef1ceb796b822c1faf23ae43a04bcd1bd69b
  v0_a_implementation_baseline_commit: 1a1565fa7e6d1440c8f99e2c7e587201a14111c1
  v0_a_control_baseline_tracked_files_clean_required: true
  v0_b_control_baseline_commit: 32dc7b136053e2fdc17f294322a3cf7fef79e737
  v0_b_first_failed_audit_candidate: 18ba8466799198b1ce3e732990a49f626fb83d48
  v0_b_implementation_baseline_commit: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
  v0_b_control_evidence_closeout_commit: resulting_HEAD_of_this_revision
  v0_b_control_baseline_tracked_files_clean_required: true
  v0_c_control_baseline_commit: 47d36f25563012e1d411576eca387a778ba6a3e7
  v0_c_failed_audit_candidate_commit: 930c549b402fce9ffa96847a673ad187c64f6094
  v0_c_corrected_candidate_commit: 861b7241e8abf8608fc981a68bae39037f598f5d
  v0_c_implementation_baseline_commit: 12db75aaea4db4afb774046cfcc94de772a2e90b
  v0_c_closeout_commit: resulting_HEAD_of_this_revision
  v0_c_control_baseline_tracked_files_clean_required: true
  v1_planning_baseline_commit: 7617ce3f56bc8844a0e7eb3605b4327aa6412932
  v1_planning_baseline_tracked_files_clean_verified: true
  v1_a_control_baseline_commit: c9f91057db60cf61dab0d3aa305564d498c89cd6
  v1_a_control_baseline_tracked_files_clean_required: true
  v1_a_first_failed_audit_candidate: e3ff98948b26187b48af61928b56e7cacb550d31
  v1_a_implementation_baseline_commit: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
  v1_a_implementation_baseline_tree: 680810b7c2f8b12dbd3503b5a38f1ab162b63996
  v1_a_control_evidence_closeout_commit: resulting_HEAD_of_this_revision
  v1_b_planning_charter_amendment_baseline_commit: 51a0200450781faa7fb16c98b3547f294efcef7d
  v1_b_planning_charter_amendment_baseline_tree: c51177ea760d3153257703326a220b550af10393
  v1_b_first_control_baseline_commit: 84f548c93df40d8955a15572df30edac7b6df0fa
  v1_b_first_control_baseline_tree: 0df2d9f57cf2c2705e1f6255b3efa9c2e1be45de
  v1_b_corrected_control_baseline_commit: de75ca7a4d5376713f01ca475bc5ad7637c70443
  v1_b_corrected_control_baseline_tree: e930e1d0885b52bf911ed78912786723f321f06e
  v1_b_rejected_candidate_commit: 951e9161300eacd408e232aa6d1fa66ac02d0e10
  v1_b_corrected_candidate_commit: a11690e5827d9d540b731156799566bea21c689e
  v1_b_corrected_candidate_tree: 282c4dc93d31131fa0b20fc70c48831409664eee
  v1_b_execution_baseline_commit: 19617319c13a9eecbb325682c920e79d1517b89d
  v1_b_execution_baseline_tree: 48d2bee79a551fe53ac36ed12decea2357765645
  v1_b_pause_path_final_candidate_commit: 6a4f6529c4cb2a3e5c726d3bc8cf6beb515b720e
  v1_b_pause_path_final_candidate_tree: 7ab79aa4073baab1c7570424701ebf1302b34837
  v1_b_replacement_execution_baseline_commit: f7cf45150724061269179716e1b2f487db1ff5c7
  v1_b_replacement_execution_baseline_tree: 4fe46f3955b069f52dd5f581d794b860ef159b4e
  v1_b_closeout_commit: resulting_HEAD_of_this_revision
  v1_c_control_baseline_commit: 016006e72e5baf4f558f1f63f1ffafcf122e119c
  v1_c_control_baseline_tracked_files_clean_required: true
  v1_c_rejected_candidate_commit: e021662e2f4b6d2721f9b0378ac2efa64b706963
  v1_c_corrected_candidate_commit: 962b42a281d3092f0faf399b9f6f1ecaa0212f31
  v1_c_corrected_candidate_tree: d828f9fdb23c7099cdb1e4d5a993ff5579422dd4
  v1_c_audited_execution_baseline_commit: resulting_HEAD_of_this_revision
  v1_c_canary_manifest_id: c26e75989623ae1218be0a3996c59de2ccbce946988396695b38bb9fdc482c4c
  v1_c_workbench_source_digest: 4d12e4588917949ee84bb56c83ec67f7cb8093a304c8a3ab9980c97188174604
  registered_untracked_reference_directory: reference/

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
  status: accepted_for_V0_scope_V0_completed
  supersedes: Pi SDK Runner + Inline Extension as V0 experimental runtime basis
  retained_comparator: Pi Coding Agent SDK Runner + Inline Extension
  fallback: Pi RPC/process adapter only on observed isolation need
  g002_setup_recovery: artifact_backed_model_data_restore_authorized
  pi_ai_build_boundary: standard_build_offline_retained
  live_model_data_hydration: prohibited_for_G002_retry
  g003_review: ACCEPT_G003_PASS_DIRECT_GO_GATE_WITH_NON_BLOCKING_CORRECTIONS
  g003_basis_decision: docs/decisions/ADR-0003-direct-agentharness-for-bounded-robustness.md
  g005_review: ACCEPT_INVALID_EVIDENCE_CLOSEOUT_WITH_NON_BLOCKING_CORRECTIONS_APPLIED
  pinned_pi_observability_semantic_inconsistency:
    observed: true
    behavior: after_provider_response_is_typed_and_documented_as_on_hook_but_emitOwn_notifies_subscribers_only
    public_workaround: subscribe
    core_route_blocker: false
    pi_core_patch_required: false
  next_decision_material: docs/第二项目_Codex交接包_2026-07-30/ROADMAP_RECONCILIATION_REPORT.md

first_policy:
  candidate: Completion Verification
  status: V0_mechanism_implemented_deterministically_real_user_run_initial_pass_real_recovery_and_policy_effect_unverified

v0:
  charter: docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md
  charter_status: accepted
  status: closed_accepted
  completed_goals:
    - V0_A_CONTRACTS_PREFLIGHT_WORKSPACE_PI_ADAPTER
    - V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME
    - V0_C_BOUNDED_COMPLETION_AND_USER_FACING_USE
  remaining_goal: null
  roadmap_reconciliation: docs/第二项目_Codex交接包_2026-07-30/ROADMAP_RECONCILIATION_REPORT.md
  reference_acquisition_plan: docs/第二项目_Codex交接包_2026-07-30/REFERENCE_ACQUISITION_PLAN.md
  control_rule: docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md
  control_rule_status: accepted
  scoped_pi_go: accepted
  formal_workbench_created: true

v1:
  charter: docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md
  charter_status: accepted
  charter_accepted: true
  charter_formalized_at: 2026-08-03
  status: active_v1_c_stage_1_accepted_waiting_real_canary_authorization
  prior_status: concluded_inconclusive_not_completed
  active_goal: true
  current_candidate_goal: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
  formal_goal_contract_created: true
  activation_authorized: consumed_for_V1_A
  activation_authorized_at: 2026-08-03
  implementation_owner: dedicated_v1_a_implementation_session
  implementation_authorized: consumed_and_completed_zero_real_calls
  implementation_started: true
  implementation_completed: true
  real_model_calls_authorized: 0
  external_network_authorized: false
  pi_core_patch_authorized: false
  runtime_surface: direct_public_emitted_AgentHarness
  strategies:
    - baseline
    - skill_only
    - skill_plus_external_verifier_runtime_control
  accepted_goal_sequence:
    - V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
    - V1_B_FROZEN_BOUNDED_REAL_PILOT
  primary_source_gate: satisfied
  primary_source: SkillOS_arXiv_2605_06614v1
  primary_source_binding_correction: training_signal_is_distinct_from_diagnostic_judge_and_formal_external_outcome
  accepted_pilot_ceiling:
    tasks: 4
    repetitions_per_task: 2
    strategies_per_repetition: 3
    planned_initial_runs_max: 24
    child_attempts_max: 8
    whole_pilot_cost_usd_max: 2.00
  accepted_pause_recovery_amendment:
    original_started_initial_runs: 1
    original_actual_cost_usd: unknown
    conservative_prior_cost_debit_usd: 0.10
    replacement_initial_runs_max: 24
    replacement_pilot_cost_usd_max: 1.90
    authorized_sequence_started_initial_runs_max: 25
    replacement_child_attempts_max: 8
    P1_004_micro_correction_exception: accepted_consumed_final_no_fourth_correction
    final_pause_path_reaudit: PASS_FOCUSED_V1_B_P1_004_REAUDIT
  focused_V1_A_audit_required: satisfied
  V1_B_contract_before_V1_A_acceptance: prohibition_satisfied_V1_A_now_accepted
  pi_sdk_extension_effect_on_V1: none_deferred_non_blocking_compatibility_checkpoint
  planning_baseline_commit_authorized: consumed
  planning_baseline_commit: 7617ce3f56bc8844a0e7eb3605b4327aa6412932
  V1_A_contract_draft_authorized: true_after_planning_baseline_verification
  V1_A_contract_draft: superseded_by_formal_contract
  V1_A_contract_draft_status: superseded
  V1_A_contract: docs/第二项目_Codex交接包_2026-07-30/V1_A_GOAL_CONTRACT.md
  V1_A_contract_status: closed_accepted
  V1_A_contract_accepted: true
  V1_A_activation_authorized: true
  V1_A_control_baseline_commit_authorized: consumed
  V1_A_control_baseline_commit: c9f91057db60cf61dab0d3aa305564d498c89cd6
  V1_A_dedicated_session_prompt_authorized: true_after_control_baseline_confirmation
  V1_A_dedicated_session_prompt_status: consumed
  V1_A_dedicated_session_git_commit_authorized: false
  V1_A_real_model_calls_authorized: 0
  V1_A_external_provider_calls_authorized: 0
  V1_A_credential_reads_authorized: 0
  V1_A_external_network_authorized: false
  V1_A_pi_core_patch_authorized: false
  V1_A_private_pi_import_authorized: false
  V1_A_first_failed_audit_candidate: e3ff98948b26187b48af61928b56e7cacb550d31
  V1_A_corrected_candidate_commit: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
  V1_A_focused_reaudit_disposition: PASS_FOCUSED_V1_A_REAUDIT
  V1_A_disposition: PASS_V1_A_DETERMINISTIC_SUBSTRATE
  V1_A_implementation_baseline_commit: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
  V1_A_closeout: docs/reports/V1_A_CLOSEOUT.md
  V1_B_integrated_plan: docs/reports/V1_B_INTEGRATED_DEVELOPMENT_PLAN.md
  V1_B_integrated_plan_status: accepted
  V1_B_precontract_pause_report: docs/reports/V1_B_PRECONTRACT_READINESS_PAUSE_REPORT.md
  V1_B_session_model:
    stage_1_preparation: completed_dedicated_zero_call_source_edit_session
    stage_1_audit: completed_fresh_focused_independent_audit_sessions
    bounded_correction: completed_original_stage_1_preparation_session
    stage_2_execution: completed_original_and_replacement_fresh_no_source_edit_sessions
  V1_B_pilot_execution_surface: immutable_manifest_enforced_one_cell_at_a_time
  V1_B_pilot_scale: 24_initial_cells_max_8_child_attempts
  V1_B_whole_pilot_time_semantics: accumulated_active_execution_time_max_7200000ms
  V1_B_stage_1_focused_audit_required: true_after_candidate_freeze
  V1_B_planning_charter_amendment_baseline_commit_authorized: consumed
  V1_B_planning_charter_amendment_baseline_commit: 51a0200450781faa7fb16c98b3547f294efcef7d
  V1_B_planning_charter_amendment_baseline_tree: c51177ea760d3153257703326a220b550af10393
  V1_B_goal_contract_draft: superseded_by_formal_contract
  V1_B_goal_contract_draft_status: superseded
  V1_B_goal_contract: docs/第二项目_Codex交接包_2026-07-30/V1_B_GOAL_CONTRACT.md
  V1_B_formal_goal_contract_created: true
  V1_B_contract_status: closed_inconclusive_not_completed
  V1_B_activation_authorized: true
  V1_B_control_baseline_commit_authorized: consumed
  V1_B_first_control_baseline_commit: 84f548c93df40d8955a15572df30edac7b6df0fa
  V1_B_first_control_baseline_tree: 0df2d9f57cf2c2705e1f6255b3efa9c2e1be45de
  V1_B_control_baseline_commit: de75ca7a4d5376713f01ca475bc5ad7637c70443
  V1_B_control_baseline_tree: e930e1d0885b52bf911ed78912786723f321f06e
  V1_B_stage_1_owner: dedicated_v1_b_preparation_session
  V1_B_stage_1_authorized: true_zero_real_calls
  V1_B_stage_1_started: true
  V1_B_stage_1_completed: true
  V1_B_first_stage_1_thread_id: 019fcc05-43a5-7481-8cb7-7d51e2d7085f
  V1_B_first_stage_1_disposition: stopped_before_implementation_due_stale_CURRENT_STATE_narrative
  V1_B_first_stage_1_source_delta: 0
  V1_B_first_stage_1_real_access_counts: credential_0_network_0_provider_0_model_0
  V1_B_stage_1_thread_id: 019fcc0a-16e1-7791-98ef-ba2eaff857b8
  V1_B_stage_1_disposition: PASS_V1_B_STAGE1_PREPARATION_AFTER_CORRECTION_PENDING_GOAL_CLOSEOUT
  V1_B_rejected_candidate_commit: 951e9161300eacd408e232aa6d1fa66ac02d0e10
  V1_B_corrected_candidate_commit: 6a4f6529c4cb2a3e5c726d3bc8cf6beb515b720e
  V1_B_corrected_candidate_tree: 7ab79aa4073baab1c7570424701ebf1302b34837
  V1_B_focused_reaudit_disposition: PASS_FOCUSED_V1_B_P1_004_REAUDIT
  V1_B_stage_1_prompt: docs/reports/V1_B_STAGE1_PREPARATION_SESSION_START_PROMPT.md
  V1_B_execution_authorized: consumed_for_original_and_replacement_pilots
  V1_B_credential_reads_authorized: consumed_no_further_reads_authorized
  V1_B_external_network_authorized: consumed_no_further_network_authorized
  V1_B_real_model_calls_authorized: consumed_no_further_calls_authorized
  V1_B_candidate_commit_authorized: consumed
  V1_B_focused_audit_authorized: consumed
  V1_B_execution_baseline_authorized: consumed_for_replacement_resulting_HEAD
  V1_B_execution_baseline_commit: 19617319c13a9eecbb325682c920e79d1517b89d
  V1_B_execution_baseline_tree: 48d2bee79a551fe53ac36ed12decea2357765645
  V1_B_replacement_execution_baseline_commit: f7cf45150724061269179716e1b2f487db1ff5c7
  V1_B_replacement_execution_baseline_tree: 4fe46f3955b069f52dd5f581d794b860ef159b4e
  V1_B_replacement_manifest_id: 4f04542ea59b59110e2d9d62e08067932bf868884e05c153cd5a6bed08575b29
  V1_B_replacement_sequence_id: c58112fff77b0836a44668395d6ab97ece10996583254c9029c143ab84e01bd1
  V1_B_replacement_source_digest: b1fa032d42c4e381c880b8092bddb5a625169ea44ee2e0ea238da1595d0edf92
  V1_B_stage_2_authorized: consumed_replacement_paused_no_further_execution
  V1_B_stage_2_thread_id: 019fce76-e00b-77c3-8804-af9b652fa08e
  V1_B_stage_2_disposition: PAUSE_V1_B_PILOT
  V1_B_stage_2_policy_recommendation: INCONCLUSIVE
  V1_B_stage_2_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
  V1_B_stage_2_membership: planned_24_started_1_terminal_0_invalid_0_paused_1
  V1_B_stage_2_paused_run: v1b-run-01-parse-duration-r1-a
  V1_B_stage_2_actual_cost_usd: unknown
  V1_B_stage_2_retry_fallback_replacement: 0
  V1_B_replacement_stage_2_thread_id: 019fd116-2bb1-76e1-bedc-ad9def6dd2d3
  V1_B_replacement_stage_2_disposition: PAUSE_V1_B_REPLACEMENT_PILOT
  V1_B_replacement_stage_2_policy_recommendation: INCONCLUSIVE
  V1_B_replacement_stage_2_membership: planned_24_started_1_terminal_0_invalid_0_paused_1
  V1_B_replacement_stage_2_paused_run: v1b-replacement-run-01-parse-duration-r1-a
  V1_B_replacement_stage_2_provider_model_calls: 8
  V1_B_replacement_stage_2_tool_calls: 10
  V1_B_replacement_stage_2_tokens_known: 11670
  V1_B_replacement_stage_2_persisted_known_cost_usd: 0.0003864952
  V1_B_replacement_stage_2_actual_cost_usd: unknown
  V1_B_replacement_stage_2_fail_closed_debit_usd: 0.10
  V1_B_authorized_sequence_fail_closed_total_usd: 0.20
  V1_B_valid_comparable_runs: 0
  V1_B_pause_recovery_amendment: docs/第二项目_Codex交接包_2026-07-30/V1_B_PAUSE_RECOVERY_AMENDMENT.md
  V1_B_pause_path_correction_authorized: consumed_two_cycles_plus_user_authorized_P1_004_micro_exception
  V1_B_pause_path_correction_owner: original_v1_b_preparation_session
  V1_B_pause_path_reaudit_authorized: consumed_PASS_FOCUSED_V1_B_P1_004_REAUDIT
  V1_B_further_pause_path_corrections_authorized: false
  V1_B_replacement_conservative_prior_debit_usd: 0.10
  V1_B_replacement_pilot_cost_cap_usd: 1.90
  V1_B_authorized_sequence_started_initial_runs_max: 25
  V1_B_closeout_commit_authorized: consumed_by_resulting_HEAD_of_this_revision
  V1_B_closeout_disposition: CLOSE_V1_B_INCONCLUSIVE_AUTHORIZED_SEQUENCE_EXHAUSTED
  V1_B_closeout: docs/reports/V1_B_CLOSEOUT.md
  V1_closeout: docs/reports/V1_CLOSEOUT.md
  V1_definition_of_done: not_met
  V1_policy_recommendation: INCONCLUSIVE
  V1_B_further_execution_authorized: false
  V1_B_v2_authorized: false
  V1_C_precontract_research: docs/reports/V1_C_PRECONTRACT_RESEARCH.md
  V1_C_goal_contract: docs/第二项目_Codex交接包_2026-07-30/V1_C_GOAL_CONTRACT.md
  V1_C_contract_status: accepted_activated
  V1_C_contract_accepted: true
  V1_C_activation_authorized: true
  V1_C_control_baseline_commit_authorized: consumed
  V1_C_control_baseline_commit: 016006e72e5baf4f558f1f63f1ffafcf122e119c
  V1_C_stage_1_owner: dedicated_v1_c_stage_1_implementation_session
  V1_C_stage_1_authorized: consumed_completed_zero_real_calls
  V1_C_stage_1_started: true
  V1_C_stage_1_completed: true
  V1_C_stage_1_disposition: PASS_V1_C_STAGE1_AUDITED_CANDIDATE
  V1_C_rejected_candidate_commit: e021662e2f4b6d2721f9b0378ac2efa64b706963
  V1_C_corrected_candidate_commit: 962b42a281d3092f0faf399b9f6f1ecaa0212f31
  V1_C_corrected_candidate_tree: d828f9fdb23c7099cdb1e4d5a993ff5579422dd4
  V1_C_candidate_commit_authorized: consumed
  V1_C_focused_audit_authorized: consumed
  V1_C_focused_reaudit_disposition: PASS_FOCUSED_REAUDIT
  V1_C_execution_baseline_authorized: consumed_by_resulting_HEAD_of_this_revision
  V1_C_execution_baseline_commit: resulting_HEAD_of_this_revision
  V1_C_canary_manifest: fixtures/manifests/v1/v1c-real-canary-execution.json
  V1_C_canary_manifest_id: c26e75989623ae1218be0a3996c59de2ccbce946988396695b38bb9fdc482c4c
  V1_C_workbench_source_digest: 4d12e4588917949ee84bb56c83ec67f7cb8093a304c8a3ab9980c97188174604
  V1_C_official_provider_checkpoint: PASS_CURRENT_OFFICIAL_PROVIDER_CHECKPOINT
  V1_C_real_canary_authorized: false
  V1_C_real_canary_started: false
  V1_C_full_pilot_authorized: false
  V1_C_full_pilot_started: false
  V1_C_credential_reads_authorized: 0
  V1_C_external_network_authorized: false
  V1_C_real_provider_calls_authorized: 0
  V1_C_real_model_calls_authorized: 0
  V1_C_pi_core_patch_authorized: false
  V1_C_private_pi_import_authorized: false
  V1_C_dependency_install_authorized: false
  V1_C_dedicated_session_git_commit_authorized: false
  V1_C_v2_authorized: false

v0_a:
  goal_id: V0_A_CONTRACTS_PREFLIGHT_WORKSPACE_PI_ADAPTER
  contract: docs/第二项目_Codex交接包_2026-07-30/V0_A_GOAL_CONTRACT.md
  contract_status: closed_accepted
  contract_accepted: true
  active_goal: false
  activation_authorized: true
  implementation_owner: dedicated_v0_a_goal_session
  implementation_authorized: consumed_and_completed_by_dedicated_goal_session
  implementation_started: true
  implementation_completed: true
  main_session_review: passed_after_bounded_path_security_correction
  user_acceptance: accepted_2026_07_31
  disposition: PASS_V0_A_FOUNDATION
  control_baseline_commit_authorized: consumed
  control_baseline_commit: b6bfef1ceb796b822c1faf23ae43a04bcd1bd69b
  dedicated_goal_session_prompt_authorized: true_after_control_baseline_commit_confirmation
  dedicated_goal_session_prompt_status: consumed
  dedicated_goal_session_started: true
  dedicated_goal_session_completed: true
  formal_workbench_creation_authorized: true_for_dedicated_goal_session_after_Gate_A
  formal_workbench_created: true
  dependency_installation_authorized: false
  external_network_authorized: false
  real_model_calls_authorized: 0
  real_model_calls_observed: 0
  implementation_git_commit_authorized: consumed_by_resulting_HEAD_of_this_revision
  implementation_baseline_commit: 1a1565fa7e6d1440c8f99e2c7e587201a14111c1
  pi_core_patch_authorized: false
  pi_core_patch_count: 0
  private_pi_import_authorized: false
  private_pi_import_count: 0
  runs_root_creation_authorized: consumed
  authoritative_run_id: run-5c0b157e-31d7-4873-95a1-fd284377ace3
  superseded_run:
    id: run-9f71d3cd-af00-4c85-97e0-884587ee7a14
    disposition: superseded_due_main_review_path_security_correction
  workbench_file_count: 24
  workbench_tree_digest: 4ba620c14074a4ec96989f1aa670bbad612ab5714ea102a4564813c19d743c6e
  fixture_file_count: 5
  fixture_full_tree_digest: 07c35b8eee38d052fd9d4c1b36a316fec0a9f5a7126b73a33e6c2c1320e0dfff
  gates:
    A: passed
    B: passed
    C: passed
    D: passed
    E: passed
    F: passed
    G: passed
  definition_of_done:
    passed: 20
    failed: 0
    total: 20
  formal_outcome_created: false
  recovery_attempts: 0
  os_network_egress_blocking_proven: false
  implementation_report: docs/reports/V0_A_IMPLEMENTATION_REPORT.md
  closeout: docs/reports/V0_A_CLOSEOUT.md

v0_b:
  goal_id: V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME
  contract: docs/第二项目_Codex交接包_2026-07-30/V0_B_GOAL_CONTRACT.md
  precontract_research: docs/reports/V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME_PRECONTRACT_RESEARCH.md
  contract_status: closed_accepted
  contract_accepted: true
  active_goal: false
  activation_authorized: true
  implementation_owner: dedicated_v0_b_goal_session
  implementation_authorized: consumed_and_completed_by_dedicated_v0_b_goal_session
  implementation_started: true
  implementation_completed: true
  control_baseline_commit_authorized: consumed
  control_baseline_commit: 32dc7b136053e2fdc17f294322a3cf7fef79e737
  dedicated_goal_session_prompt_authorized: true_after_control_baseline_commit_confirmation
  dedicated_goal_session_prompt_status: consumed
  dedicated_goal_session_started: true
  dedicated_goal_session_completed: true
  formal_workbench_extension_authorized: consumed
  dependency_installation_authorized: false
  external_network_authorized: false
  real_model_calls_authorized: 0
  real_model_stage_2_authorized: false
  real_model_stage_2_executed: false
  dedicated_goal_session_git_commit_authorized: false
  pi_core_patch_authorized: false
  private_pi_import_authorized: false
  external_module_port_authorized: false
  disposition: PASS_V0_B_EVIDENCE_FOUNDATION
  main_session_review: accepted_after_bounded_correction_and_focused_independent_reaudit
  user_acceptance: accepted_2026_07_31
  first_failed_audit_candidate:
    commit: 18ba8466799198b1ce3e732990a49f626fb83d48
    audit_disposition: REQUEST_BOUNDED_CORRECTION
    findings: 5
    highest_severity: P1
  implementation_baseline_commit: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
  control_evidence_closeout_commit: resulting_HEAD_of_this_revision
  authoritative_run_id: run-914dc89c-defd-4e03-ab37-7fd09230fe93
  workbench_tree_digest: b8034b235acdf50630c7bebc3859f001799986333622ae0ce1b545528d3fe8d0
  source_inventory:
    files: 52
    mismatches: 0
    sha256: 6b9e90e4652df1ee85fc1f29e6d053d931901c17e098fa46dcb4cdbdf9ca9ac5
  source_delta:
    files: 36
    mismatches: 0
    sha256: 49e6cf7a750f446734c87a662088843fb104d4d6c5c7994f3243cf9aca19237b
  independent_reaudit:
    status: passed
    disposition: PASS_FOCUSED_INDEPENDENT_REAUDIT
    findings_resolved: 5
    findings_unresolved: 0
    report: docs/reports/V0_B_INDEPENDENT_REAUDIT_REPORT.md
  gates:
    A: passed
    B: passed
    C: passed
    D: passed
    E: passed
    F: passed
    G: passed
    H: passed
  definition_of_done:
    passed: 25
    failed: 0
    total: 25
  tests:
    strict_typescript: passed
    post_audit: 11_passed_0_failed_0_skipped
    complete_workbench: 67_passed_0_failed_0_skipped
    v0_a_public: 3_passed_0_failed_0_skipped
  runtime_counts:
    external_provider_calls: 0
    real_model_calls: 0
    recovery_attempts: 0
    child_attempts: 0
    pi_core_patches: 0
    private_pi_imports: 0
  known_issue:
    id: v0_b_post_audit_test_ignored_directory_setup
    classification: non_blocking_test_fixture_setup_debt
    observed: true
    product_semantic_failure: false
    independent_reaudit_effect: none
    revisit_trigger: future_test_runner_or_V0_C_test_environment_change
  reports:
    implementation: docs/reports/V0_B_IMPLEMENTATION_REPORT.md
    execution_closeout_draft: docs/reports/V0_B_CLOSEOUT_DRAFT.md
    first_independent_audit: docs/reports/V0_B_INDEPENDENT_RISK_AUDIT_REPORT.md
    focused_independent_reaudit: docs/reports/V0_B_INDEPENDENT_REAUDIT_REPORT.md
    accepted_closeout: docs/reports/V0_B_CLOSEOUT.md
  stage_1:
    deterministic_faux_only: true
    status: completed_accepted
    external_provider_calls: 0
    recovery_attempts: 0
    child_attempts: 0
  stage_2:
    status: optional_not_authorized_not_executed
    maximum_if_separately_authorized:
      real_runs: 1
      cost_cap_usd: 1

v0_c:
  goal_id: V0_C_BOUNDED_COMPLETION_AND_USER_FACING_USE
  status: closed_accepted
  contract: docs/第二项目_Codex交接包_2026-07-30/V0_C_GOAL_CONTRACT.md
  contract_status: closed_accepted
  contract_created: true
  contract_accepted: true
  contract_accepted_at: 2026-07-31
  activation_authorized: true
  activation_authorized_at: 2026-07-31
  active_goal: false
  control_baseline_commit_authorized: consumed
  control_baseline_commit: 47d36f25563012e1d411576eca387a778ba6a3e7
  research_authorized: true
  research_owner: dedicated_v0_c_precontract_research_session
  research_status: completed_main_session_reviewed
  research_report: docs/reports/V0_C_BOUNDED_COMPLETION_PRECONTRACT_RESEARCH.md
  research_disposition: ACCEPT_FOR_CONTRACT_DRAFTING_WITH_BINDING_NARROWING
  implementation_owner: dedicated_v0_c_stage_1_implementation_session
  implementation_authorized: consumed_completed_zero_real_calls
  implementation_started: true
  implementation_completed: true
  stage_1_real_model_calls_authorized: 0
  stage_1_real_model_calls_observed: 0
  stage_1_credential_access_authorized: false
  stage_1_external_network_authorized: false
  dependency_installation_authorized: false
  pi_core_patch_authorized: false
  private_pi_import_authorized: false
  dedicated_goal_session_prompt_authorized: true_after_control_baseline_commit_confirmation
  dedicated_goal_session_prompt_status: consumed
  dedicated_goal_session_started: true
  dedicated_goal_session_completed: true
  failed_audit_candidate_commit: 930c549b402fce9ffa96847a673ad187c64f6094
  failed_audit_disposition: REQUEST_V0_C_BOUNDED_CORRECTION
  corrected_candidate_commit: 861b7241e8abf8608fc981a68bae39037f598f5d
  corrected_workbench_digest: a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446
  focused_independent_reaudit:
    status: passed
    disposition: PASS_FOCUSED_V0_C_REAUDIT
    findings_resolved: 2
    unresolved_findings: 0
    report: docs/reports/V0_C_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md
  implementation_baseline_commit_authorized: consumed
  implementation_baseline_commit: 12db75aaea4db4afb774046cfcc94de772a2e90b
  implementation_baseline_workbench_digest: a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446
  stage_2_execution_owner: first_and_replacement_fresh_v0_c_user_acceptance_sessions
  stage_2_user_run_authorized: consumed
  stage_2_initial_authorized_runs: 1
  stage_2_initial_run:
    id: run-1d7829b0-338f-4555-b6ac-72d5d08b228d
    status: paused_pre_dispatch
    reason: uat_local_composition_expected_obsolete_three_tool_profile
    provider_calls: 0
    model_calls: 0
    tool_calls: 0
    verifier_runs: 0
    token_usage: 0
    cost_usage_usd: 0
  stage_2_replacement_authorized_runs: 1
  stage_2_replacement_run:
    id: run-c3297fc5-bfd1-4bd1-b46c-3a636271a177
    status: completed_passed_accepted
    attempt_id: attempt-f6d6a9c6-d299-44d5-9283-a71d48f37288
    session_id: session-0cd59a8b-5b9a-4665-8444-88e52470ffaf
    workspace_id: workspace-8c1e52a0-0d13-4f45-82ec-f6c26e3fdfad
    outcome: passed
    terminal_reason: verifier_passed
    inspector: committed_integrity_valid
    provider_calls: 5
    model_calls: 5
    tool_calls: 8
    verifier_runs: 1
    token_usage: 16625
    cost_usage_usd: 0.0012407808000000002
    recovery_observed: false
    composition_sha256: e543fce7d648fdfc4fcd1b91e7a21c8799a83662e86e850001d5a8741d4fb906
  stage_2_attempt_limit: 2
  stage_2_recovery_slot_limit: 1
  stage_2_cost_cap_usd: 2
  stage_2_real_model_calls_authorized: consumed_no_additional_calls_authorized
  stage_2_credential_access_authorized: consumed_for_fresh_UAT_sessions_only
  stage_2_external_network_authorized: consumed_for_frozen_deepseek_API_route_only
  automatic_second_run_authorized: false_first_session_paused_and_replacement_was_separately_authorized
  final_closeout_and_git_commit_authorized: consumed_by_resulting_HEAD_of_this_revision
  final_disposition: PASS_V0_C_USER_ACCEPTANCE
  main_session_review: accepted
  user_acceptance: accepted_by_continuous_V0_C_closeout_authorization_2026_07_31
  closeout: docs/reports/V0_C_CLOSEOUT.md

implementation:
  dependencies_installed: true_in_isolated_g002_g003_g005_and_g006_clones
  deterministic_spike_created: true_g003_g005_and_committed_g006_gate_0_spike
  real_model_run_completed: one_valid_G006_baseline_candidate_pair_both_initial_verifiers_passed
  formal_workbench_foundation_created: true_V0_A
  v0_a_direct_public_agentharness_faux_cycle: passed
  v0_b_evidence_session_verifier_outcome_foundation: closed_accepted
  v0_b_real_model_route: not_executed
  v0_c_completion_controller: closed_accepted
  v0_product_surface_real_user_run: passed

g005_authorization:
  goal_contract_created: true
  goal_contract: docs/goals/G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY.md
  goal_contract_status: closed_invalid_evidence
  contract_accepted_by_user: true
  activation_authorized_by_user: true
  reviewed_baseline_commit_authorized_by_user: true
  reviewed_baseline_commit: 33c7e534b2d0f13201384ab754c7f3c9351635a0
  active_goal: false
  execution_authorized: consumed_and_closed
  real_model_call_authorized: false_after_main_session_option_b_decision
  additional_G005_model_calls_authorized: false
  same_attempt_resume_authorized: false
  baseline_verifier_resume_authorized: false
  candidate_start_authorized: false
  generated_run_root_authorized: consumed_for_preserved_g005_evidence_only
  real_model_access_declared_available_by_user: true
  real_model_use_declared_permitted_by_user: true
  credential_value_provisioned: user_attested_filled_main_session_did_not_inspect
  local_credential_file: .env.g005
  tracked_credential_template: .env.example
  provider: deepseek
  frozen_candidate_model: deepseek-v4-flash
  frozen_candidate_thinking_level: high
  alternate_model_fallback_authorized: false
  pi_core_modification_authorized: false
  formal_workbench_creation_authorized: false

g005:
  contract_status: closed_invalid_evidence
  disposition: INVALID_G005_EVIDENCE
  architecture_review: ACCEPT_INVALID_EVIDENCE_CLOSEOUT_WITH_NON_BLOCKING_CORRECTIONS_APPLIED
  evidence_baseline_commit_authorized_by_user: true
  evidence_baseline_commit: resulting_HEAD_of_this_control_and_evidence_revision
  root_project_commit: 33c7e534b2d0f13201384ab754c7f3c9351635a0
  pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
  pi_core_patch_count: 0
  isolated_execution_root: .runs/g005
  baseline:
    provider_calls: 4
    tool_starts: 3
    tool_ends: 3
    settled: true
    external_verifier: not_run
  candidate:
    started: false
    provider_calls: 0
    external_verifier: not_run
  real_route_partial_evidence: positive_but_not_complete_gate
  completion_verification_policy_effect: unverified
  hidden_verifier_result: unconfirmed
  paused_secret_scan: partial_safety_evidence_not_final_gate_e
  raw_disposition:
    value: FAIL_REAL_MODEL_ROUTE
    evidence_path: .runs/g005/evidence/outcomes/execution-failure.json
    preserved_unchanged: true
    main_session_review: rejected_as_project_observer_false_negative
  gates:
    gate_a: passed
    gate_b: incomplete_invalid_for_gate
    gate_c: not_run
    gate_d: incomplete_invalid_observer_and_journal_schema
    gate_e: incomplete_partial_scan_only
  observer_defects:
    - G005_selected_on_instead_of_pinned_public_subscribe_path
    - pinned_Pi_type_and_docs_do_not_match_after_provider_response_emitOwn_dispatch_semantics
    - journal_inner_type_must_not_overwrite_outer_event_type
  report: docs/reports/G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_REPORT.md
  closeout: docs/reports/G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLOSEOUT.md
  pause_report: docs/reports/G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_PAUSE_REPORT.md

g006:
  id: G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY
  status: closed_accepted
  disposition: PASS_REAL_MODEL_FEASIBILITY
  contract: docs/goals/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY.md
  precontract_research: docs/reports/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY_PRECONTRACT_RESEARCH.md
  contract_created: true
  contract_creation_authorized: true
  contract_accepted_by_user: true
  contract_accepted_at: 2026-07-29
  activation_authorized: true
  activation_authorized_at: 2026-07-29
  stage_1_gate_0_implementation_authorized: true
  stage_2_real_model_execution_authorized: consumed
  stage_2_authorized_at: 2026-07-29
  real_model_call_authorized: false_after_single_attempt_consumed
  accepted_contract_baseline_commit_authorized: consumed
  implementation_baseline_commit_authorized: consumed
  implementation_baseline_commit: 05da78bc24d6bab92dc44ee44912a57159e45e72
  additional_git_commit_authorized: consumed_by_G006_closeout_evidence_and_control_commit
  closeout_evidence_and_control_commit_authorized_by_user: 2026-07-30
  closeout_evidence_and_control_commit: resulting_HEAD_of_this_revision
  additional_model_call_authorized: false
  additional_attempt_authorized: false
  execution_authorized: consumed_and_execution_complete
  runs_directory_created: true_preflight_and_attempt_001
  activation_preconditions:
    root_HEAD: aa2d12f701f4cecbc963a854e00a1d5bf312d77c
    accepted_contract_baseline_commit: aa2d12f701f4cecbc963a854e00a1d5bf312d77c
    accepted_contract_baseline_commit_authorized_and_created: true
    root_tracked_worktree_clean_at_stage_1_start: true
    accepted_untracked_reference_tree_only: true
    pi_reference_commit_verified: 027a5847901b5dde30270abaa1041046cd2b4b55
    pi_reference_clean: true
    g006_spike_absent: true
    g006_runs_root_absent: true
    formal_workbench_absent: true
    credential_file_ignored: true
  stage_1_execution_started: true
  stage_1_execution_completed: true
  stage_1_external_provider_calls: 0
  stage_1_credential_loaded_or_inspected: false
  gate_0:
    disposition: PASS_GATE_0_IMPLEMENTATION_BASELINE_COMMITTED
    source_file_count: 28
    source_tree_digest: c99e84ba09318a73482a2d790e10eb63e3a2240d0b0c209a843112ff62c82af4
    public_emitted_import: passed
    public_emitted_types: passed
    strict_typescript: passed
    offline_tests: 8_passed_0_failed
    pinned_pi_builds: passed
    attempt_root_created: false
    reviewed_implementation_identity_created: true_after_commit_in_ignored_preflight
    reviewed_clean_HEAD: 05da78bc24d6bab92dc44ee44912a57159e45e72
    reviewed_source_digest_matches_gate_0: true
    report: docs/reports/G006_GATE_0_IMPLEMENTATION_AND_OFFLINE_REVIEW.md
  setup:
    isolated_pi_root: .runs/g006/pi
    isolated_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
    isolated_pi_clean: true
    non_hardlinked: true
    artifact_archive_members: 712
    artifact_selected_data_files: 38
    restored_manifest_sha256: c2d89b03ccb2c095c59ead0437592b21e9676d049ad8e92ea90a466adf10b24d
    pi_ai_check_model_data: passed
    pi_ai_standard_build_offline: passed
    pi_agent_core_standard_build: passed
  stage_2_external_API_checkpoint:
    status: passed
    model: deepseek-v4-flash
    base_url: https://api.deepseek.com
    openAI_chat_completions: supported
    thinking_high_and_tools: supported
    reasoning_replay_after_tool_calls: required_and_preserved
    frozen_price_matches_current_official_price: true
    evidence: .runs/g006/preflight/stage2-external-api-checkpoint.json
  stage_2:
    gate_a: passed
    gate_b: passed
    gate_c: passed
    gate_d: passed
    gate_e: passed
    attempt_root: .runs/g006/attempt-001
    attempt_count: 1
    model_count: 1
    provider_requests: 8
    goal_duration_after_first_provider_ms: 55470
    pair_cost_usd: 0.0016993088
    baseline:
      provider_requests: 4
      tool_starts: 3
      tool_ends: 3
      settled: 1
      verifier_runs: 1
      initial_verifier: passed
      final_verifier: passed
    candidate:
      provider_requests: 4
      tool_starts: 3
      tool_ends: 3
      settled: 1
      verifier_runs: 1
      initial_verifier: passed
      final_verifier: passed
      recovery_triggered: false
      recovery_path: unobserved_because_initial_verifier_passed
    evidence:
      subscriber_response_counts_match_requests: true
      successful_assistant_and_response_ID_counts_match_requests: true
      session_tool_call_result_IDs_match: true
      journal_v2_envelopes_and_sequences_valid: true
      verifiers_after_settled: true
      initial_pair_configuration_equivalent: true
      reasoning_body_or_signature_persisted: false
      driver_secret_scan_matches: 0
      final_secret_rescan_files: 54
      final_secret_rescan_matches: 0
  report: docs/reports/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY_REPORT.md
  closeout: docs/reports/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY_CLOSEOUT.md
  architecture_acceptance: ACCEPT_G006_PASS_REAL_MODEL_FEASIBILITY_WITH_SESSION_BOUNDARY_DEVIATION_NOTED
  architecture_accepted_by_user: 2026-07-30
  execution_session_governance:
    declared_execution_owner: future_dedicated_G006_execution_session
    actual_execution_session: main_session
    deviation: main_session_implemented_executed_and_first_reviewed_G006
    technical_evidence_failure_observed: false
    review_independence_reduced: true
    independent_session_audit: waived_by_user_for_G006
    future_rule: main_session_owns_architecture_discussion_and_acceptance_dedicated_goal_session_owns_implementation_and_execution
  research_conclusion: bounded_clean_retry_is_justified_without_additional_specialist_research
  frozen_inputs:
    - same_pinned_Pi_and_public_direct_AgentHarness_route
    - same_DeepSeek_V4_Flash_high_model_profile
    - same_parseDuration_task_fixture_tools_verifier_policy_and_budgets
    - exactly_one_fresh_baseline_candidate_pair
  gate_0_requirements:
    - observe_and_count_after_provider_response_via_subscribe
    - journal_v2_nested_payload_protects_outer_event_fields
    - public_Faux_provider_observer_regression
    - offline_error_attribution_regression
    - full_pre_call_G006_source_identity
    - retain_G005_fixture_redaction_public_import_and_strict_type_gates
  authorization_sequence:
    - user_reviews_and_accepts_contract
    - user_separately_authorizes_stage_1_Gate_0_implementation
    - Gate_0_implementation_and_offline_tests_pause_with_zero_provider_calls
    - main_session_reviews_complete_source_delta
    - user_explicitly_authorizes_implementation_baseline_commit
    - exact_clean_HEAD_and_source_digest_are_recorded
    - user_separately_authorizes_stage_2_real_model_execution
    - one_fresh_runs_g006_attempt_and_one_symmetric_paired_attempt
    - execution_report_closeout_and_CURRENT_STATE_are_reviewed

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
  - docs/第二项目_Codex交接包_2026-07-30/V1_C_GOAL_CONTRACT.md
  - docs/reports/V1_C_PRECONTRACT_RESEARCH.md
  - docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md
  - docs/第二项目_Codex交接包_2026-07-30/V1_B_GOAL_CONTRACT.md
  - docs/第二项目_Codex交接包_2026-07-30/V1_B_PAUSE_RECOVERY_AMENDMENT.md
  - docs/reports/V1_CLOSEOUT.md
  - docs/reports/V1_B_CLOSEOUT.md
  - docs/reports/V1_B_REPLACEMENT_STAGE2_MAIN_REVIEW_AND_CLOSEOUT_DECISION.md
  - docs/reports/V1_B_REPLACEMENT_STAGE2_PAUSE_REPORT.md
  - docs/reports/V1_B_REPLACEMENT_STAGE2_EXECUTION_SESSION_START_PROMPT.md
  - docs/reports/V1_B_P1_004_MAIN_ACCEPTANCE_AND_REPLACEMENT_BASELINE_DECISION.md
  - docs/reports/V1_B_P1_004_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md
  - docs/reports/V1_B_REPLACEMENT_EXECUTION_BASELINE_PREFLIGHT.md
  - docs/reports/V1_B_STAGE2_MAIN_PAUSE_REVIEW.md
  - docs/reports/V1_B_PILOT_EXECUTION_REPORT.md
  - docs/reports/V1_B_AGGREGATE_REPORT.md
  - docs/reports/V1_B_CLOSEOUT_DRAFT.md
  - docs/reports/V1_B_INTEGRATED_DEVELOPMENT_PLAN.md
  - docs/reports/V1_B_PRECONTRACT_READINESS_PAUSE_REPORT.md
  - docs/reports/V1_A_CLOSEOUT.md
  - docs/reports/V1_A_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md
  - docs/第二项目_Codex交接包_2026-07-30/V1_A_GOAL_CONTRACT.md
  - docs/reports/V1_SKILL_PRIMARY_SOURCE_MAPPING_MAIN_REVIEW.md
  - docs/reports/V1_SKILL_PRIMARY_SOURCE_MAPPING.md
  - docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH_MAIN_REVIEW.md
  - docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH.md
  - docs/reports/V0_C_CLOSEOUT.md
  - docs/reports/V0_C_STAGE2_REPLACEMENT_USER_ACCEPTANCE_REPORT.md
  - docs/reports/V0_C_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md
  - docs/第二项目_Codex交接包_2026-07-30/V0_C_GOAL_CONTRACT.md
  - docs/reports/V0_C_BOUNDED_COMPLETION_PRECONTRACT_RESEARCH.md
  - docs/reports/V0_B_CLOSEOUT.md
  - docs/reports/V0_B_INDEPENDENT_REAUDIT_REPORT.md
  - docs/reports/V0_B_IMPLEMENTATION_REPORT.md
  - docs/第二项目_Codex交接包_2026-07-30/V0_B_GOAL_CONTRACT.md
  - docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md
  - docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md
  - docs/reports/V0_A_CLOSEOUT.md
  - docs/第二项目_Codex交接包_2026-07-30/V0_A_GOAL_CONTRACT.md
  - docs/reports/PROJECT_ZERO_TO_CURRENT_PROGRESS_CONCLUSIONS_AND_COMPLETE_FORWARD_PLAN_2026-07-30.md
  - docs/reports/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY_REPORT.md
  - docs/reports/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY_CLOSEOUT.md
  - docs/reports/CC_HARNESS_REFERENCE_ANALYSIS_DECISION_SUMMARY.md
  - docs/reports/CURRENT_RUNTIME_RISK_RECLASSIFICATION.md
  - docs/reports/PI_CC_HARNESS_COMPARISON_MATRIX.md

next_checkpoint:
  - V1_A_closed_accepted_on_independently_reaudited_implementation_baseline
  - original_and_replacement_V1_B_pilots_stopped_on_evidence_integrity_boundaries
  - V1_B_closed_inconclusive_with_zero_valid_comparable_runs
  - V1_C_stage_1_corrected_candidate_and_focused_reaudit_accepted
  - V1_C_audited_execution_baseline_and_one_cell_Canary_manifest_frozen
  - stop_before_credential_network_or_real_Canary_without_separate_user_authorization
  - stop_before_V2

open_user_decisions:
  - V1_C_real_canary_after_audited_execution_baseline
  - V1_C_full_pilot_after_valid_canary
```

## Current Constraints

- Keep `.upstream/pi` immutable as the reference checkout.
- Preserve `.runs/g002` and `.runs/g003` as ignored generated evidence; do not
  merge, overwrite or commit them.
- V0-A is closed and accepted. Its dedicated Goal Session created the formal
  `workbench/` only after Gate A, and the corrected implementation is bound to
  the resulting implementation baseline revision. Do not reopen or extend V0-A
  without a new reviewed contract or explicit user direction. G005 remains
  closed as invalid evidence and no additional G005 model call, Verifier
  continuation or Candidate start is authorized.
- Do not use WSL, SDK/RPC fallback, or a Pi core patch without new evidence and
  architecture review.
- Do not treat G003's fixed-task pass as Policy effectiveness or current
  provider-catalog validation. Scoped Pi Go and the V0 architecture are now
  frozen by the accepted V0 Charter; real recovery and Policy effectiveness
  remain unproven.
- G004 was retired before a contract was created. Do not recreate it as a broad
  pre-Phase-3 robustness umbrella or silently reuse its identifier.
- Preserve `.runs/g005` raw evidence and `spikes/pi-runtime/g005/` as the
  identity of the invalid run. Do not modify, delete, overwrite or backfill
  either during closeout review. The raw `FAIL_REAL_MODEL_ROUTE` record is
  historically preserved but its interpretation was rejected by Main Session.
- `G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY` now
  is closed with accepted `PASS_REAL_MODEL_FEASIBILITY`. Both variants passed
  their initial Verifier; Candidate recovery was correctly not triggered and
  remains unobserved. No additional G006 model call or attempt is authorized.
  Fallback runtime and package-boundary changes remain unauthorized.
- G006 was implemented, executed and first-reviewed by the Main Session despite
  the Contract naming a dedicated execution Session. The user accepted G006
  without a retroactive independent audit. For future execution Goals, the Main
  Session owns architecture/user decisions/final acceptance and a dedicated
  Goal Session owns implementation/execution and reports back.
- Carry risks according to
  `docs/reports/CURRENT_RUNTIME_RISK_RECLASSIFICATION.md`; an unverified mature
  pattern is not an observed failure or an automatic Goal/Gate.
- Treat `reference/cc-harness-knowledge` and `reference/src` as read-only design
  references. Do not modify or commit them without explicit authorization.
- The V0-A Control Baseline Commit is
  `b6bfef1ceb796b822c1faf23ae43a04bcd1bd69b`. The user accepted V0-A and
  its Implementation Baseline Commit is
  `1a1565fa7e6d1440c8f99e2c7e587201a14111c1`. The dedicated V0-A Goal
  Session never had Git commit authority.
- V0-B is closed and accepted with `PASS_V0_B_EVIDENCE_FOUNDATION`. Its Control
  Baseline Commit is `32dc7b136053e2fdc17f294322a3cf7fef79e737` and its
  accepted Implementation Baseline Commit is
  `7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180`. Do not reopen its Stage 1,
  execute optional Stage 2, rewrite accepted Runs, or continue either closed
  dedicated Session without explicit new user direction.
- Preserve the V0-B focused re-audit observation that
  `workbench/tests/v0b-post-audit.test.ts` expects the ignored
  `.runs/v0-b/test-cases/` setup directory. It is accepted as non-blocking test
  fixture setup debt. Revisit only when the test runner or V0-C test
  environment is already in scope; do not rewrite V0-B evidence history.
- V0-C is closed and accepted with `PASS_V0_C_USER_ACCEPTANCE`. Its
  Implementation Baseline Commit is
  `12db75aaea4db4afb774046cfcc94de772a2e90b`, binding Workbench digest
  `a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446`.
  Preserve the first pre-dispatch UAT pause and the accepted replacement Run
  `run-c3297fc5-bfd1-4bd1-b46c-3a636271a177`. The replacement Run passed its
  initial Verifier, so real Recovery remains unobserved. No additional V0-C
  Run, credential/network use, real-model call, source change or repair is
  authorized.
- V0 and V1-A are closed and accepted. V1-A's independently re-audited
  Implementation Baseline is
  `784bd1ec06c2aa9ed554a7da661bdf582097bcdf`. Do not reopen or silently
  rewrite it. V1-B is closed inconclusive, not completed. Both authorized real
  Pilot identities paused before a terminal/comparable Run existed; their
  actual costs remain unknown and conservative accounting totals USD 0.20.
  V1-B remains historically closed with no further correction, retry, fallback
  or replacement authority. V1-C is active only for its dedicated zero-call
  Stage 1 correction. Candidate Commit, focused audit, Credential/network use,
  real Canary, full Pilot and every real-model call remain separately
  unauthorized. V1 still has no completed Baseline/Skill-only/Skill+Runtime
  comparison. V2 bounded multi-path recovery remains the Portfolio North Star
  but is not authorized.

## Expected Next Handoff

V0-A, V0-B and V0-C are closed and accepted. V0 now provides the minimal real
Coding Agent Workbench foundation: controlled Workspace, Direct Pi
`AgentHarness`, formal Run/Attempt/Session/Workspace lineage, deterministic
Verifier, Outcome, Evidence Index, Inspector and a bounded completion/recovery
mechanism. One frozen real Coding Task passed the formal Product Surface within
budget, but it passed its initial Verifier; real recovery effect and Completion
Policy effectiveness remain unproven.

V1-A is closed and accepted with `PASS_V1_A_DETERMINISTIC_SUBSTRATE`. Its
Control Baseline is `c9f91057db60cf61dab0d3aa305564d498c89cd6`; its fresh
Windows re-audited Implementation Baseline is
`784bd1ec06c2aa9ed554a7da661bdf582097bcdf`. It established the deterministic
Skill/experiment substrate with zero real-model calls, but did not test Skill
effectiveness, real Recovery or strategy superiority.

V1-B is closed with
`CLOSE_V1_B_INCONCLUSIVE_AUTHORIZED_SEQUENCE_EXHAUSTED`. The original Pilot and
the separately authorized replacement Pilot each started only cell 1 and then
paused on evidence-integrity boundaries. The replacement reached eight
Provider/model requests and ten Tool calls before an invalid/unknown usage
response produced a pause state that the frozen Inspector rejected. Across
both Pilots there are zero terminal/comparable Runs. Actual cost is unknown;
fail-closed accounting totals USD 0.20 and remains below the USD 2 cap.

V1-B remains closed as `V1_CONCLUDED_INCONCLUSIVE_NOT_COMPLETED` historical
evidence. V1-A's deterministic substrate remains accepted, but V1 still has no
valid A/B/C aggregate, no Skill/Runtime winner and no observed real Recovery
effect.

V1-C is the active Goal. Its zero-real-call Stage 1 corrected the
request-cap/synthetic-failure attribution boundary, preserved conservative
unknown-usage accounting and passed fresh focused re-audit. Corrected Candidate
`962b42a281d3092f0faf399b9f6f1ecaa0212f31` is accepted as
`PASS_V1_C_STAGE1_AUDITED_CANDIDATE`; the resulting Main-owned revision
freezes the audited Execution Baseline and the disjoint one-cell Canary
Manifest. Official DeepSeek profile/schema compatibility and zero-call
preflight pass. Credential access, real network/Provider/model calls, Canary
execution and the full Pilot remain separately unauthorized. V2 remains
unauthorized.
