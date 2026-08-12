# Post-V3.6 ES-N03 Tool-accounting Terminalization Maintenance Goal Contract

```yaml
status: accepted_activated
accepted_and_activated_by_user: 2026-08-12
goal_id: POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_MAINTENANCE
goal_kind: bounded_campaign_finding_maintenance
parent_goal: V3_6_ENGINEERING_STABILIZATION_CAMPAIGN
version_status: V3_6_remains_closed_accepted
trigger_case: ES_N03
trigger_finding: ES_N03_F1_001
binding_decision: user_accepted_recommended_option_A
control_baseline_commit: 856dfa066b34a477e7e7aea92b3c2ed8dfc4734c
control_baseline_tree: 9ba0f742fe9d67188c371d505a93e253547adcb6
implementation_owner: top_level_session_019ff603-ac10-7ba1-a79e-98125f447964
implementation_worktree: C:/Users/HUAWEI/.codex/worktrees/ef7e/project2
launch_record_commit: 73c124072a8ba495e6f25825bd48db774ef57581
main_owner: current_main_session
focused_audit: required_once_after_main_candidate_freeze
post_maintenance_retest: exactly_one_ES_N03_retest_after_accepted_maintenance
real_model_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
budget_value_change_authorized: false
agent_loop_change_authorized: false
pi_core_patch_authorized: false
retry_resume_fallback_replacement_authorized: false
source_apply_authorized: false
v4_authorized: false
```

## 1. Goal

Close the single natural ES-N03 correctness Finding without reopening V3.6:

> When a registered Tool-budget stop follows one or more Pi-rejected unavailable Tool
> requests in the same persisted Session turn, preserve every Tool request/result identity
> and still produce exactly one truthful, typed, persistent and safely inspectable
> non-settled terminal when all usage, lifecycle, Workspace and authority evidence is
> quiescent and reconcilable.

This Goal repairs the Workbench adapter/evidence seam only. It retains Direct public Pi
`AgentHarness`, Pi JSONL Session persistence, managed Workspace, daily budget values,
Docker command authority, ChangeSet, registered Source and Host-controlled Apply.

## 2. Triggering immutable baseline

ES-N03 ran once from Main authorization commit
`e409295c3bfcf113ce98d90526bc4df52ff1d5bb`:

```yaml
session_id: v36-session-42b6664a-020b-452c-80bb-c166ce945b01
run_id: v36-run-75e76161-6e96-4cef-beb3-4209192b7859
external_handoff_sha256: c7d39ae34ef54d09c19e22a9886361651b4d3aed71f80beb651ad8f4e7d559d3
persisted_tool_calls: 26
persisted_tool_results: 26
unavailable_tool_requests: 1_read_tool
registered_tool_attempts_inferred: 25
registered_tool_executions_inferred: 24
typed_terminal: absent
runtime_manifest: absent
change_set: absent
registered_command_executions: 0
http_projection: generic_request_rejected
source_mutated: false
retry_or_recovery: false
```

The raw `.runs/` Case evidence and external handoff are immutable Before-Fix Evidence.
They must not be rewritten, relabeled or replaced by deterministic fixtures or the later
Retest.

Binding analysis:
`docs/reports/V3_6_ENGINEERING_STABILIZATION_ES_N03_DECISION_REQUIRED.md`.

## 3. Frozen accounting semantics

### 3.1 Disjoint Tool domains

The implementation must preserve these distinct meanings:

1. **Persisted Tool request/result identity:** every assistant-emitted Tool call in the
   Pi Session, including registered, unavailable, invalid-argument and hook-blocked calls,
   must have exactly one matching persisted Tool Result.
2. **Registered budget-scoped Tool attempt:** a call whose name resolves to the frozen
   active Workbench Tool surface and reaches Pi's public `tool_call` hook. The unchanged
   daily hard cap of 24 continues to apply to this domain.
3. **Registered Tool execution/completion:** a budget-scoped call that was not blocked
   before Tool execution and whose registered lifecycle is complete.
4. **Unavailable Tool request:** an assistant-emitted name outside the active Tool
   surface. Pi rejects it before the public `tool_call` hook and persists an error
   ToolResult. It is not a registered Tool execution and has no Workbench side effect.
5. **Budget-blocked registered call:** the first registered attempt beyond the unchanged
   hard cap. It remains distinct from unavailable requests and executed calls.

The terminal must reconcile the complete persisted set as a disjoint, exhaustive union.
No unavailable request/result may be silently sliced away, counted as a registered Tool
execution or omitted from integrity checks.

### 3.2 Budget boundary remains unchanged

This maintenance does not redefine or increase a budget. The daily profile remains:

```yaml
provider_request_observation_threshold: 16
provider_request_hard_max: 24
registered_tool_attempt_hard_max: 24
combined_token_hard_max: 131072
cost_usd_hard_max: 0.20
wall_time_ms_hard_max: 900000
```

Unavailable Tool requests remain bounded by the finite Provider/Token/cost/wall-time
envelope and must be separately visible. This Goal does not claim that the registered
Tool-attempt cap independently limits arbitrary invalid Tool names.

### 3.3 Trusted terminal generation

A typed terminal may be written only when all prior finite-budget invariants remain true
and the adapter additionally proves:

- every persisted Tool call/result ID is valid, unique and exactly paired;
- every registered budget-scoped attempt is identified from the frozen active Tool
  surface and reconciles with the public hook/profile lifecycle;
- every unavailable Tool request names no active Tool, has an error ToolResult and has no
  registered execution, command or pending side effect;
- the budget-blocked registered call is uniquely identifiable;
- complete-Session identity/hash includes all calls and results, not only budget-scoped
  calls;
- ambiguous, duplicate, missing, forged or overlapping categories fail closed.

The terminal remains `settled: false`, `unverified`, null Outcome and ineligible for
comparison, adaptation, promotion and Apply.

### 3.4 Persistence compatibility

Historical Provider-request schema-1/schema-2 and reconciled finite-budget schema-3
artifacts remain immutable and readable with their original meaning. The implementation
may add the smallest explicit versioned terminal variant required to represent unavailable
Tool identities truthfully; it must not silently reinterpret or migrate historical
artifacts. A new version is not permission to generalize the terminal protocol beyond
this Finding.

## 4. Product behavior

For the accepted ES-N03 variant:

1. Session list/detail and Run inspection return an authenticated safe projection rather
   than generic rejection.
2. The projection distinguishes registered attempts/executions, unavailable requests and
   the budget-blocked call without exposing reasoning, secrets or Host paths.
3. Managed Files, Changes and Diff remain inspectable and explicitly unverified.
4. Export and Discard remain available.
5. Apply is denied server-side.
6. The terminal Session cannot continue; only the existing clean-new-Session path from
   authenticated registered Source remains available.
7. Registered Source stays byte-identical.
8. If any reconciliation precondition is not proven, the adapter fails closed and must not
   mint a typed terminal.

## 5. Allowed implementation surface

The dedicated Implementation Session may modify only:

- `workbench/src/contracts/*v36*.ts`;
- `workbench/src/session/persistent-session-v36.ts`;
- `workbench/src/webui/application-v36g2.ts` if narrowly required for safe projection;
- `workbench/src/webui/server-v36g1.ts` if narrowly required for safe projection;
- additive/narrow V3.6 static projection code only if required to display the new typed
  accounting fields;
- `workbench/tests/*v36*budget*test.ts` and narrowly affected V3.6 tests;
- `workbench/README.md` only for the corrected terminal behavior;
- `docs/reports/POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_IMPLEMENTATION_REPORT.md`;
- `docs/reports/POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_CLOSEOUT_DRAFT.md`;
- ignored deterministic evidence under a new dedicated `.runs/` root.

It must not modify or stage `CURRENT_STATE.md`, `AGENTS.md`, this Contract, Campaign
status/plan, accepted Closeouts, ES-N03 raw Evidence, Pi, `reference/`, credentials,
registered Source, budget values, Agent Loop, Verifier/Outcome, Docker/backend,
ChangeSet/Apply authority or unrelated source. It must not create a Git commit; Main owns
Candidate/integration/Closeout commits.

## 6. Deterministic Exit Criteria

Zero-real-access evidence must prove:

1. a deterministic Pi/Faux trajectory containing an unavailable Tool request before a
   registered Tool-budget stop creates exactly one typed terminal and no Manifest;
2. all persisted call/result identities are exactly paired and exhaustively categorized;
3. unavailable Tool requests are error results with no registered execution, command or
   side effect and are visibly distinct from the budget-blocked registered call;
4. registered attempt/execution/completion/blocked counts retain their frozen semantics
   and the daily hard maximum remains 24;
5. missing/duplicate/mismatched/forged unavailable identities, non-error unavailable
   results, category overlap and unproven side effects fail closed;
6. historical schema-1 `17/16/16`, schema-2 `25/24/24` and accepted schema-3 terminals
   remain readable, inspectable and tamper-detecting;
7. ordinary registered-only Provider/Token/cost/Tool/wall terminal variants remain
   unchanged;
8. reopen independently validates the new terminal from disk;
9. safe Session list/detail and Run projection expose the typed stop and accounting
   categories, while Diff/Export/Discard work and Apply/continuation remain denied;
10. registered Source, fixed Pi and protected evidence remain unchanged;
11. strict TypeScript, browser syntax and narrow V3.6/V3.5 affected regressions pass;
12. Credential reads, network calls, external Provider/model calls and real-model calls
    are all zero.

No deterministic fixture may overwrite or substitute for ES-N03 Before-Fix Evidence.

## 7. Review, audit and Retest gates

Main performs one light review. Ordinary Contract-local defects return to the same
Implementation Session as one bounded correction package.

After Main freezes a Candidate Commit, one new top-level read-only focused audit checks
only Tool-domain classification, full Session identity reconciliation, finite-budget
terminal authority, legacy compatibility, safe projection, Apply/continuation denial and
Source immutability. It must not repair source or modify control state.

After the maintenance is accepted, Main may authorize exactly one ES-N03 Retest using the
same task, registered Source baseline, registered command, provider/model and unchanged
daily profile. Retest is new post-maintenance Evidence, not a Retry or replacement. The
Test Session must again stop at Main disposition; no ES-N04 follows automatically.

## 8. Hard stops

Stop for Main/user if completion would require:

- increasing/removing any budget or changing the registered budget domain;
- changing Pi or the Agent Loop;
- automatic Retry, resume, continuation, fallback or replacement;
- classifying uncertain in-flight Tool/Provider/side-effect state as reconciled;
- weakening Session/evidence integrity, Source/Workspace separation, ChangeSet,
  Verifier/Outcome or server-side Apply authority;
- general crash recovery, transaction/durable-workflow infrastructure, a new backend or
  SDK/Extension/RPC route;
- more than one material correction of this terminal design;
- reopening V3.6, entering V4 or adding an unrelated Harness feature.

## 9. Completion and claims

This maintenance may close only after all deterministic Exit Criteria pass, the focused
audit passes, a formal Closeout records exact commands/evidence and Campaign control state
returns from active maintenance to the Retest gate.

Allowed claim:

> A reconciled registered Tool-budget stop remains typed, persistent and inspectable even
> when the same Pi Session contains explicitly accounted unavailable Tool requests, while
> all persisted Tool identities, legacy terminal formats and Host authority remain intact.

Not allowed: ES-N03 completed; its partial changes are correct or applicable; the Tool cap
is universally adequate; unavailable calls are registered executions; arbitrary Tool
failures, crashes or uncertain side effects are recoverable; V3.6 was reopened; or Pi/
Agent Loop was modified.
