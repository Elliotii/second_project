# Reference-backed Policy Candidates

```yaml
status: candidates_only
implementation_authorized: false
experiment_authorized: false
ranking_basis:
  - direct_relation_to_second_project_goal
  - observed_or_specific_failure
  - pi_existing_mechanism
  - smallest_validatable_behavior
  - JD_signal
  - bounded_complexity
```

## 1. 排名

| Rank | Candidate | 当前建议时机 | 核心理由 |
| --- | --- | --- | --- |
| 1 | Completion Verification | 首个获授权的 Phase 3 real-model bounded experiment | 项目主故事；G003 已证明机制，缺真实效果证据 |
| 2 | Recovery Budget | 与 Completion Verification 同时采集、用户评审后冻结 | 防止循环/成本失控；不需新 runtime |
| 3 | Tool Result Budget + Progressive Disclosure | 真实任务出现 large-output/context pressure 后 | Pi 已有 read/bash 基础，先观察 actual gap |
| 4 | Critical Constraint Preservation | 首次需要 compaction 或观察到约束遗忘后 | 与长任务可靠性相关，但当前无失败 |
| 5 | Tool Cancellation | 正式路径包含 long-running command 时 | 有源码/test 基础，缺 profile-specific dynamic evidence |
| 6 | Side-effect Reconciliation | 出现 crash/retry ambiguity 或计划自动 replay 时 | 高价值 reliability case，但不应建设 Exactly-once 平台 |
| 7 | Settled Session Reconstruction | V0 明确要求跨进程 resume 时 | primitive 已有；需求和完整重建合同未确定 |

## 2. Candidate 1 — Completion Verification

```yaml
candidate_policy:
  name: completion_verification
  target_failure: agent_reports_completion_but_workspace_or_tests_do_not_satisfy_task
  evidence_failure_already_observed: deterministic_fixture_only; real_model_performance_not_observed
  reference_pattern: model_stop_is_not_task_success; verify_after_cycle_settlement
  pi_current_capability: AgentHarness prompt/settled events; external workspace tool execution; same-session next prompt
  actual_gap: no_real_model_or_real_repository_evidence_that_candidate_improves_outcome
  smallest_possible_experiment: one tiny TypeScript repository task, one deterministic verifier, same task/model/budget, Baseline versus one-recovery Candidate
  deterministic_outcome: verifier pass/fail, cycle count, recovery count, terminal reason, workspace diff, event ordering
  JD_signal: environment_level_verification + trace + baseline_candidate_comparison
  likely_complexity: low_to_medium
  pi_core_patch_required: false
  recommended_timing: first_authorized_phase3_experiment
```

**Fact.** G003 已证明外部 Driver/Verifier 和同 Session 一次 Recovery 可行；它没有证明真实模型的 improvement。

**Recommendation.** 这是唯一应继续保持“下一阶段首选”的候选。它不需要 G004 先清空所有未验证风险。

## 3. Candidate 2 — Recovery Budget

```yaml
candidate_policy:
  name: bounded_recovery_budget
  target_failure: repeated_verifier_failure_causes_unbounded_cycles_cost_or_non_explainable_stop
  evidence_failure_already_observed: false
  reference_pattern: retry_budget + failure_class + terminal_reason
  pi_current_capability: external driver can count cycles/prompts/verifier runs; G003 enforced exactly one recovery
  actual_gap: production_budget_cost_time_and_failure_class_semantics_not_frozen
  smallest_possible_experiment: collect outcome and cost for zero versus one recovery in the same bounded Phase 3 case; do not add a second recovery automatically
  deterministic_outcome: max_attempts_respected; terminal_reason_present; no_cycle_after_budget_exhaustion
  JD_signal: explicit_policy_semantics + cost_control + explainable_recovery
  likely_complexity: low
  pi_core_patch_required: false
  recommended_timing: observe_with_candidate_1; freeze_only_after_user_review
```

**Inference.** Budget 是外部 Policy，不需要 Pi durable runtime。当前“一次”只应继续作为安全上限，不应被写成最佳实践。

## 4. Candidate 3 — Tool Result Budget + Progressive Disclosure

```yaml
candidate_policy:
  name: budgeted_tool_result_projection
  target_failure: large_tool_output_displaces_constraints_or_hides_the_actionable_tail
  evidence_failure_already_observed: false_in_project
  reference_pattern: bounded_projection + externalized_full_artifact + retrieval_pointer
  pi_current_capability: read head truncation with offset; bash tail truncation with fullOutputPath; 2000-line/50KB defaults
  actual_gap: no_project_level_policy_for_non_builtin_tools_or_task_specific_retrieval; threshold suitability unmeasured
  smallest_possible_experiment: only after a real large-output case, assert model projection size, full artifact existence, pointer validity and successful targeted follow-up retrieval
  deterministic_outcome: projection_under_budget; full_artifact_hashable_and_retrievable; no_missing_pointer
  JD_signal: context_engineering + observable_artifact_handling
  likely_complexity: low_if_adapter_only; high_if_generalized
  pi_core_patch_required: false_for_workbench_projection; unconfirmed_for_all_third_party_tools
  recommended_timing: defer_until_first_context_pressure_failure
```

**Fact.** Pi 已有该 Pattern 的重要基础（`read.ts`, `bash.ts`, `truncate.ts`, `tools.test.ts`）。

**Recommendation.** 不要为了展示 Context Engineering 重做已有截断；未来只补实际 tool/profile 的最小 gap。

## 5. Candidate 4 — Critical Constraint Preservation

```yaml
candidate_policy:
  name: critical_constraint_preservation_across_compaction
  target_failure: compaction_summary_drops_exact_acceptance_constraints_paths_or_verifier_feedback
  evidence_failure_already_observed: false
  reference_pattern: typed_critical_constraints + protected_recent_tail + retrieval_paths
  pi_current_capability: explicit prepare/compact; retainedTail; previousSummary; file operation details; compaction entry in Session
  actual_gap: no_workbench_contract_or_verifier_that_checks_constraint_survival_after_real_compaction
  smallest_possible_experiment: when context pressure exists, inject a unique acceptance constraint, compact once, inspect projected context, then require the agent/verifier to honor it
  deterministic_outcome: constraint_identifier_and_exact_requirement_remain_retrievable_and_behaviorally_honored
  JD_signal: long_task_context_management + verifiable_compaction
  likely_complexity: medium
  pi_core_patch_required: false_for_external_check_or_custom_instruction; unconfirmed_for_structural_metadata
  recommended_timing: after_first_real_compaction_need
```

**Inference.** 知识包使“摘要看起来合理”升级为“关键约束可检索且行为上被遵守”的验证标准。但当前没有 context pressure，不能先造平台。

## 6. Candidate 5 — Tool Cancellation

```yaml
candidate_policy:
  name: bounded_tool_cancellation_and_settlement
  target_failure: timeout_or_abort_returns_while_process_tree_or_side_effect_continues
  evidence_failure_already_observed: false_on_current_project_path
  reference_pattern: cancellation_request + executor_ack + process_tree_stop + post_cancel_state_inspection
  pi_current_capability: AgentHarness.abort; AbortSignal propagation; bash timeout; NodeExecutionEnv active process cleanup; upstream tests
  actual_gap: no_dynamic_evidence_for_emitted_package_plus_windows_driver_plus_long_tool_profile
  smallest_possible_experiment: one long command writes heartbeat markers; abort at a fixed point; assert harness settlement, process exit and marker cessation
  deterministic_outcome: no_new_marker_after_barrier; process_absent; terminal_reason_is_abort_or_timeout
  JD_signal: runtime_control + failure_injection + environment_verification
  likely_complexity: low_to_medium
  pi_core_patch_required: false_expected
  recommended_timing: only_before_or_during_a_version_that_allows_long_running_tools
```

**Recommendation.** 保留为条件性 case，不把它与 cold import、strict typecheck 和 Session resume 打包成宽 G004。

## 7. Candidate 6 — Side-effect Reconciliation

```yaml
candidate_policy:
  name: conservative_side_effect_reconciliation
  target_failure: workspace_changes_but_tool_result_is_missing_then_retry_duplicates_or_corrupts_the_effect
  evidence_failure_already_observed: false
  reference_pattern: stable_tool_call_id + side_effect_journal + retry_safety_class + workspace_inspection
  pi_current_capability: stable toolCallId in request/result; Session messages; external journal; workspace inspection; process-local mutation queue
  actual_gap: no_durable_tool_start_commit_result_state_and_no_resume_reconciler
  smallest_possible_experiment: a single idempotent marker-write tool crashes after write and before recorded result; restart reads session plus workspace and chooses mark-interrupted/no-replay
  deterministic_outcome: marker_exists_once; no_automatic_non_idempotent_replay; reconciliation_decision_recorded
  JD_signal: durability_reasoning + failure_recovery + auditability
  likely_complexity: medium_if_one_case; very_high_if_generalized
  pi_core_patch_required: false_for_external_single_case; likely_architectural_if_generalized
  recommended_timing: future_reliability_case_after_concrete_trigger
```

**Recommendation.** 只接受保守的单 Case：detect/reconcile/no blind replay。拒绝 Exactly-once、通用 transaction manager 和所有 Tool 统一幂等合同。

## 8. Candidate 7 — Settled Session Reconstruction

```yaml
candidate_policy:
  name: settled_session_reconstruction
  target_failure: a_settled_run_cannot_be_reopened_in_a_new_process_with_equivalent_runtime_configuration
  evidence_failure_already_observed: false
  reference_pattern: load_persisted_state + recreate_runtime_dependencies + validate_external_reality + continue_from_durable_boundary
  pi_current_capability: JsonlSessionRepo open/list/fork; Session buildContext; persisted model/thinking/active-tools/leaf/compaction entries
  actual_gap: host_contract_for_model_tool_registry_policy_run_attempt_budget_and_workspace_reconstruction_is_unverified
  smallest_possible_experiment: process A settles and writes session/manifest; process B opens public Session, recreates Faux model/tools/env and performs one continuation without private imports
  deterministic_outcome: prior_context_and_ids_recovered; runtime_dependency_mismatch_fails_explicitly; continuation_persists_to_same_session_lineage
  JD_signal: session_durability + explicit_runtime_reconstruction
  likely_complexity: medium
  pi_core_patch_required: not_expected_for_settled_only_case_but_unconfirmed
  recommended_timing: only_if_cross_process_resume_becomes_a_V0_requirement_or_public_API_architecture_question
```

**Fact.** Pi 的 public Session reopen primitives 和 design direction 都存在；没有观察到 route blocked。

**Recommendation.** 当前不执行。它不应因“成熟 Harness 有 Resume”而优先于真实模型 Completion Verification。

## 9. 明确拒绝的候选扩张

以下内容即使在知识包中成熟，也不满足当前 adoption gate：

| Pattern | 当前决定 | 原因 |
| --- | --- | --- |
| Subagent / Multi-Agent | 拒绝进入路线 | 不解决单 Agent Completion Policy；扩大状态/权限/所有权面 |
| MCP ecosystem | 拒绝进入路线 | 与当前 Provider/Tool path 无关；会变成连接平台 |
| Full Permission platform | 拒绝进入路线 | 受控 Workspace 足够；没有审批产品需求 |
| General durable runtime | 拒绝进入路线 | 没有跨进程/in-flight requirement；复杂度远超 V0 |
| Exactly-once tools | 拒绝作为通用目标 | Tool 语义异质；成熟系统通常也只能分类/reconcile |
| Claude Code feature parity | 明确非目标 | 项目目标是 Reliability Workbench，不是产品复刻 |

## 10. 推荐决策

**Recommendation.** 候选排序不应被解释为执行顺序授权。当前只建议：

1. 取消宽泛 G004 的前置地位；
2. 等用户审查后，决定是否授权一个极小 Phase 3 Completion Verification real-model experiment；
3. 同时记录 Recovery Budget 数据但不冻结阈值；
4. 其余 Pattern 全部等待明确触发条件。
