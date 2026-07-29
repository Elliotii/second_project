# CC Harness Pattern Map

```yaml
source: reference/cc-harness-knowledge
purpose: transferable_pattern_extraction
feature_parity_target: false
pi_behavior_proven_by_this_report: false
implementation_authorized: false
```

## 1. 阅读方法

本报告只提炼：

```text
Problem → Design Goal → Invariant → Common Pattern → Failure Mode → Applicability Boundary
```

不提炼 Class Name、目录布局或功能清单。每节的 `not_implied` 都是强边界：参考笔记不能证明 Pi 行为，不能授权实施，也不等于第二项目必须采用。

## 2. Agent Loop

```yaml
pattern: typed_agent_loop_and_explicit_turn_boundaries
problem: 模型输出、Tool Call、Tool Result、下一轮请求和停止原因容易被混成一个不可审计循环。
design_goal: 让每次状态转换可配对、可观察，并能区分继续原因与终止原因。
invariants:
  - tool_request_and_tool_result_are_distinct_events
  - tool_result_must_retain_the_tool_call_identity
  - transport_completion_is_not_run_completion
  - every_accepted_tool_call_needs_a_protocol_result_even_on_error_or_abort
common_failure_modes:
  - tool_result_missing_or_mispaired
  - provider_stream_end_mistaken_for_agent_completion
  - hook_error_breaks_transcript_order
  - queued_user_input_is_consumed_without_a_durable_boundary
maturity: mature_cross_harness_pattern
possible_relevance: G003 的 Baseline/Candidate Cycle、settled 后 Verifier 和一次 Recovery 都依赖明确 Cycle 边界。
not_implied:
  - Pi 已实现统一 durable lifecycle ledger
  - 第二项目需要重新实现 Agent Loop
  - 固定 Faux Provider 通过即证明真实模型 Policy 有效
```

用户学习映射：用户学过的 Agent Loop 不是“while 循环”，而是协议状态机。第二项目当前采用外部 Driver 把 Pi 的一次 settled Cycle 当作 Verifier 边界；不采用重写 Loop，因为 G003 已证明公开 Direct Loop 可承载该协议。

## 3. Context Management

```yaml
pattern: routed_context_projection_with_budgeted_externalization
problem: 完整历史、工具大输出、资源说明和长期约束全部塞进 Prompt 会造成窗口耗尽、关键约束丢失和成本失控。
design_goal: 从多个状态源构建当轮 Model-visible Projection，并为大对象保留可检索路径。
invariants:
  - source_state_is_not_the_same_as_model_visible_projection
  - large_tool_results_require_explicit_budgeting
  - full_artifacts_can_be_externalized_while_projection_retains_a_pointer
  - critical_constraints_must_survive_projection_and_compaction
  - expensive_llm_summary_should_not_be_the_first_response_to_every_large_result
common_failure_modes:
  - full_tool_output_floods_context
  - summary_drops_exact_paths_errors_or_constraints
  - persistent_memory_is_treated_as_authority
  - context_mutates_during_an_in_flight_provider_request
maturity: mature_pattern_with_system_specific_policies
possible_relevance: Pi 已有 Session context projection、Tool Output 截断和显式 Compaction；Workbench 后续需观察真实任务是否仍丢失关键约束。
not_implied:
  - 必须建设通用 Context 平台
  - 必须复制 Claude Code 的全部 compaction 层级
  - 笔记描述的预算数值适用于 Pi
```

用户学习映射：用户学过的 Context Projection 在 Pi 中对应 `Session.buildContext()`、turn snapshot 和 compaction-aware entries；当前项目应先利用这些入口并记录缺口，而不是新增第二套消息存储。

## 4. Tool Runtime

```yaml
pattern: validated_tool_lifecycle_with_retry_semantics
problem: Tool 同时涉及参数协议、权限、副作用、并发、取消、输出预算和错误转换，简单函数调用无法表达全部风险。
design_goal: 在执行前完成校验和 Gate，在执行后形成稳定、可配对、可分类的 Result。
invariants:
  - schema_validation_precedes_execution
  - capability_visibility_permission_and_execution_are_different_states
  - concurrent_safe_does_not_mean_permitted_or_retry_safe
  - side_effect_state_can_diverge_from_session_state
  - retry_safety_depends_on_tool_semantics
common_failure_modes:
  - malformed_arguments_reach_executor
  - non_idempotent_tool_is_replayed_after_crash
  - side_effect_occurs_before_result_is_persisted
  - truncated_output_loses_retrieval_path
  - cancellation_returns_before_child_process_or_write_settles
maturity: mature_pattern; exactly_once_is_not_a_general_default
possible_relevance: Completion Verification 依赖真实 workspace 副作用；未来最有价值的是小范围 Side-effect Reconciliation 和 Cancellation case。
not_implied:
  - 需要通用事务系统
  - 所有 Tool 都应自动重试
  - Hook 的 allow 结果可以绕过上层 deny
```

用户学习映射：用户学过的 Tool/ToolResult、Result Budget 和 Permission 分层，应分别映射到 Pi 的 AgentTool、loop tool events、built-in tool truncation 和外部 Policy；不能用一个 `execute()` 笼统替代这些边界。

## 5. Session / Resume

```yaml
pattern: durable_records_plus_host_reconstruction
problem: Session 日志可以持久，但 Model、Tool Registry、Workspace、进程和 Hook 是外部运行时对象，不能靠旧进程内存恢复。
design_goal: 从持久记录重建可继续的投影，并重新验证外部现实和运行时依赖。
invariants:
  - persisted_state_must_not_depend_on_old_process_memory
  - workspace_model_tool_registry_policy_run_attempt_and_budget_must_be_reconstructable_or_revalidated
  - settled_resume_and_in_flight_crash_recovery_are_distinct_problems
  - tool_call_and_tool_result_relationship_must_survive_restart
  - durable_metadata_does_not_recreate_external_processes
common_failure_modes:
  - session_reopens_but_required_tool_or_model_is_missing
  - workspace_has_changed_since_last_record
  - in_flight_tool_is_blindly_replayed
  - runtime_registry_is_assumed_to_be_persistent
maturity: settled_resume_is_common; in_flight_recovery_remains_system_specific
possible_relevance: 当前只验证同进程 settled recovery；跨进程需求必须由 V0 使用方式触发。
not_implied:
  - Pi Session 已经等同于可恢复的完整 Harness
  - V0 必须支持跨进程 Resume
  - 未验证 Resume 就是 Pi No-Go
```

用户学习映射：用户学过的 Resume/Fork 应拆成“日志可打开”“模型投影可重建”“外部依赖可重建”“未完成副作用可协调”四层。第二项目目前只需诚实记录各层证据。

## 6. Permission / Hook

```yaml
pattern: separate_policy_gate_and_extension_hook
problem: 扩展变换、权限判定和执行控制如果混在一起，局部 allow 可能绕过更高层 deny，或者观察 Hook 意外改变执行。
design_goal: 保持校验、Hook、Permission/Approval、Execution 的明确顺序和合并规则。
invariants:
  - permission_and_execution_are_separate_concerns
  - hooks_and_permissions_have_distinct_authority
  - a_lower_layer_allow_must_not_override_a_higher_layer_deny
  - denied_tool_calls_still_need_protocol_complete_results
common_failure_modes:
  - observational_hook_mutates_behavior
  - permission_prompt_occurs_after_side_effect
  - deny_drops_the_tool_result
  - path_or_command_policy_is_implicitly_assumed
maturity: mature_pattern; policy surface varies by product
possible_relevance: Direct AgentHarness 的 tool hook 可以 block/patch，但 Workbench 仍需明确环境权限由谁负责。
not_implied:
  - Pi Direct Harness 已有完整 Permission 平台
  - 第二项目应建设通用审批系统
  - Hook 数量越多可靠性越高
```

用户学习映射：当前项目可以用 Pi Hook 作为受控适配点，但不能把 Hook 当 Sandbox。Workspace 边界、命令授权和 Harness Policy 必须分别说明。

## 7. Planning / Todo

```yaml
pattern: separate_ephemeral_plan_from_durable_task_state
problem: 模型当前计划、长期任务记录、运行中进程和项目控制目标常被误认为同一个状态。
design_goal: 让软计划、持久任务、owner 和 runtime liveness 各自有清晰来源。
invariants:
  - todo_is_not_a_durable_task_ledger
  - task_owner_is_not_runtime_liveness
  - claim_is_not_the_same_as_started
  - dependency_and_completion_require_explicit_rules
common_failure_modes:
  - stale_owner_blocks_progress
  - todo_projection_is_mistaken_for_truth
  - task_marked_complete_without_verification
  - cycle_or_orphan_is_not_reconciled
maturity: mature_distinction; implementation varies
possible_relevance: 本项目 Goal Contract/CURRENT_STATE 是项目控制面，不应混入 Pi Session 或成为 Agent Runtime Task System。
not_implied:
  - Direct Pi 必须增加 TodoWrite
  - 第二项目需要持久任务平台
  - 项目 Goal 与 Agent Session 应共用状态机
```

用户学习映射：用户已经掌握 Planning/Todo；第二项目当前采纳的是 Goal Contract 的可审计完成条件，而不是复制 Agent 内部 Todo 功能。

## 8. Skill

```yaml
pattern: progressive_disclosure_of_instruction_resources
problem: 把所有专项说明常驻 Context 会浪费窗口，完全隐藏又会使模型无法发现能力。
design_goal: 先暴露 name/description/location，匹配后再加载完整正文和相对资源。
invariants:
  - catalog_metadata_is_distinct_from_skill_body
  - visibility_invocation_and_permission_are_separate
  - relative_resources_need_a_stable_base_path
  - host_owns_discovery_deduplication_and_reload_policy
common_failure_modes:
  - entire_skill_catalog_is_inlined
  - stale_skill_body_survives_reload
  - path_resolution_escapes_the_expected_base
  - skill_invocation_is_mistaken_for_permission
maturity: mature_context_efficiency_pattern
possible_relevance: Pi Direct Harness 已有 Skill 资源与显式调用；本项目没有当前 Policy 需要它。
not_implied:
  - 必须实现全量 Skill 生态
  - Skill 可以替代 Verifier 或 Permission
  - Pi 的 loader 行为与参考系统完全相同
```

用户学习映射：Pi 的 Skill 对应“资源发现 + System Prompt 列表 + 显式 skill turn”，但当前 Completion Verification 不应伪装成 Skill；它属于外部可靠性 Policy。

## 9. Subagent

```yaml
pattern: child_runtime_with_explicit_context_and_ownership_boundaries
problem: 子运行时容易与持久任务、Session Fork、团队成员和独立 Workspace 混为一谈。
design_goal: 明确 child context、permission bubble、结果回传和资源所有权。
invariants:
  - child_runtime_is_not_a_persistent_task_record
  - fork_resume_and_fresh_child_have_different_context_semantics
  - permission_must_not_expand_implicitly_across_delegation
  - workspace_ownership_and_cleanup_need_explicit_owners
common_failure_modes:
  - child_inherits_excessive_context_or_permission
  - parent_treats_message_delivery_as_completion
  - orphan_process_or_workspace_survives
  - session_fork_is_mistaken_for_concurrent_execution
maturity: mature_but_outside_current_project_scope
possible_relevance: 仅作为“状态与所有权分离”的教学参考。
not_implied:
  - 第二项目需要 Multi-Agent
  - Pi Direct Harness 缺少 Subagent 就不能做 Reliability Workbench
  - G004 应验证子代理
```

用户学习映射：用户学过 Subagent，但第二项目目标是单 Agent Harness Policy 对照；当前明确拒绝把 Multi-Agent 引入主线。

## 10. Completion / Stop

```yaml
pattern: environment_verified_completion_with_bounded_recovery
problem: 模型声称完成不等于 workspace 满足任务；无限恢复又会造成成本、循环和不可解释行为。
design_goal: 在 Agent Cycle settled 后由外部环境 Verifier 判断结果，并用明确 Budget 决定 stop/recover。
invariants:
  - model_stop_is_not_task_success
  - verifier_runs_after_side_effects_and_agent_cycle_settle
  - recovery_requires_structured_failure_feedback
  - every_recovery_policy_needs_a_budget_and_terminal_reason
  - fixed_fixture_feasibility_is_not_policy_effectiveness
common_failure_modes:
  - final_text_is_used_as_the_only_oracle
  - verifier_runs_while_tools_are_still_active
  - recovery_prompt_loses_failure_evidence
  - retries_continue_without_budget
  - one_deterministic_task_is_reported_as_statistical_improvement
maturity: core_reliability_pattern; policy thresholds are project-specific
possible_relevance: 这是第二项目第一条候选 Policy；G003 已证明机制闭环，真实效果尚未证明。
not_implied:
  - Completion Verification Policy 已被冻结
  - 一次 recovery 是最佳 Budget
  - G003 已证明真实模型表现提升
```

用户学习映射：这正是用户已学 Stop Policy 在本项目中的落点。Pi 负责 Cycle，Workbench Driver/Verifier 负责 Outcome，Policy 决定是否给一次受限 Recovery；三者不应合并。

## 11. Trace / Observability

```yaml
pattern: correlate_protocol_events_durable_state_and_external_outcomes
problem: 只有最终回答或只有 Session transcript 都无法解释 Tool 副作用、Verifier 时序和 Policy 决策。
design_goal: 用稳定 ID 将 Run、Attempt、Cycle、Tool Call、Session、Verifier 和 Outcome 关联。
invariants:
  - observable_event_is_not_automatically_durable_evidence
  - session_log_is_not_a_complete_runtime_trace
  - delivery_requested_is_not_delivery_completed
  - external_reality_needs_independent_observation
  - trace_schema_must_preserve_correlation_ids_and_terminal_reasons
common_failure_modes:
  - event_emitted_before_state_commit
  - tool_call_id_is_dropped_in_projection
  - process_exit_or_file_state_is_not_recorded
  - log_volume_replaces_semantic trace
maturity: mature_pattern; schema should follow actual decisions
possible_relevance: G003 的 Manifest、Event Journal、Pi Session、Outcome 已形成最小关联链。
not_implied:
  - 需要通用 Observability 平台
  - Pi Session 应承载所有 Trace
  - 所有低层事件现在都值得持久化
```

用户学习映射：当前项目采用“最小足够 Trace”，只记录解释 Baseline/Candidate 与 Verifier 决策所需事实。没有真实决策用途的事件不应为了完整性而扩张 Schema。

## 12. 横切不变量与采用边界

从十类能力中最值得第二项目持续保留的横切不变量是：

1. `known ≠ visible ≠ permitted ≠ executed`；
2. `source state ≠ model projection`；
3. `runtime identity ≠ task/workspace ownership`；
4. `persistent metadata ≠ durable executor`；
5. `session reopen ≠ complete runtime resume`；
6. `model stop ≠ verified completion`；
7. `isolation ≠ sandbox ≠ integration`；
8. `unverified ≠ failed ≠ architecture blocker`。

**Recommendation.** 当前只把 Completion Verification、受限 Recovery、Context/Tool Output 预算意识和未来 Side-effect Reconciliation 保留为与主故事直接相关的 Pattern。Subagent、Teams、Cron、MCP、完整 Permission、通用 Durable Runtime 继续作为明确的非目标。
