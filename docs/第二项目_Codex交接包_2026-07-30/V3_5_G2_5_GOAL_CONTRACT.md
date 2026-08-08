# V3.5 Goal 2.5 — Termination-safe Real Adaptive Skill Closure Contract

```yaml
status: accepted_activated_execution_complete_pass_recommended_pending_user_acceptance
date: 2026-08-08
goal_id: V3_5_G2_5_TERMINATION_SAFE_REAL_SKILL_CLOSURE
charter: docs/第二项目_Codex交接包_2026-07-30/V3_5_CHARTER.md
predecessor: V3_5_G2_REAL_ADAPTIVE_SKILL_CLOSURE
predecessor_disposition: CLOSE_V3_5_G2_INCONCLUSIVE_BASE_REQUEST_BUDGET_STOP
research_basis: docs/reports/V3_5_G2_TERMINATION_POSTMORTEM.md
contract_accepted: true
accepted_by_user: 2026-08-08
formalized_by_main_session: 2026-08-08
active_goal: true
implementation_authorized: consumed_one_pre_dispatch_infrastructure_only_correction
credential_reads_authorized: consumed_by_replacement_observed_2
external_network_authorized: consumed_by_replacement_observed_6
real_model_calls_authorized: consumed_by_replacement_observed_6
git_commit_authorized: control_implementation_audit_execution_and_closeout_within_contract
focused_audit_authorized: true_once_after_zero_access_candidate
real_pair_authorized: consumed_once_successfully_no_further_execution
goal_3_authorized: false
v3_5_final_acceptance_authorized: false
```

This Contract is accepted and activated. The initial implementation phase has zero Credential, network and real-model authority. Real access becomes usable only after Main accepts the zero-access Candidate, one focused audit passes, and Main freezes an exact Execution Baseline. Goal 2 remains closed and its ignored real evidence remains immutable.

The user accepted the bounded
`V3_5_G2_5_PRE_DISPATCH_INFRASTRUCTURE_AMENDMENT.md` after the first command stopped before
either arm. The Amendment authorizes one caller-side directory correction, one cold-start
regression, Main light review, a corrected Execution Baseline and exactly one replacement
Pair. It does not reopen the audit or change any experiment semantic.

## 1. Goal question

> Can the already frozen Base/Candidate adaptive-Skill comparison complete with valid,
> persistent external-Verifier evidence after correcting the observed public-Tool
> affordance and termination boundary, without changing the Case, treatment, model,
> budget or accepted authority semantics?

Completion requires one newly authorized pair with two valid external Verifier results.
A Skill win is not required.

## 2. Accepted fact basis

Goal 2 established:

- the Base repaired the task to the reference bytes on Provider response 2;
- responses 3–16 guessed unavailable command IDs because the only legal ID,
  `public_test`, was absent from the model-visible Tool schema and description;
- the seventeenth local request refusal occurred before network dispatch;
- the Workbench then hit a secondary failure-report accounting defect;
- no external Verifier or Candidate ran, so Goal 2 has no comparison result.

Pinned Pi publicly supports Tool results with `terminate: true`; when every Tool result in
the batch terminates, Pi skips the automatic follow-up model request and emits the normal
`agent_end`/Harness `settled` lifecycle. This is a reference-supported public mechanism,
not a Pi patch or new Runtime.

## 3. Main design decision

The specialist report recommends the V2-style quiescent budget terminal as the minimum
sufficient correction. Main accepts that mechanism as a required fail-closed fallback, but
modifies the primary route:

```text
model-visible legal command ID
→ public_test executes
→ successful public check returns Pi public terminate:true
→ normal AgentHarness settled
→ frozen external Verifier

fallback only:
typed pre-dispatch budget refusal
→ durable strict quiescence checkpoint
→ trajectory_outcome = pre_dispatch_budget_terminal
→ frozen external Verifier
```

Reasons:

1. exposing the legal command ID repairs the concrete observed affordance defect;
2. Pi's public termination hint gives the clean settled-first route without a new submit
   Tool or low-level loop fork;
3. the V2-derived checkpoint prevents another model loop from making Task Outcome
   permanently unknowable while retaining a truthful non-settled Trajectory Outcome;
4. all three rules are identical for Base and Candidate and do not inspect the hidden
   Verifier before handoff.

System Prompt and task text remain byte-unchanged. A dedicated completion/submit Tool is
not added.

## 4. Frozen inputs retained from Goal 2

The formal Contract must preserve exactly:

- pinned Pi commit `027a5847901b5dde30270abaa1041046cd2b4b55`;
- Direct public `AgentHarness` route;
- DeepSeek `deepseek-v4-flash`, thinking off, retry/fallback disabled;
- historical State version 2 and Skill `adaptive-inefficient-success`, including exact
  source and wrapper digests;
- task `v35-stable-unique`, initial Workspace bytes, task prompt, reference bytes and
  hidden external Verifier bytes/digest;
- Base-first order, fresh persistent Sessions and byte-identical initial Workspaces;
- writable/protected paths;
- Base has no adaptive Skill and Candidate has the exact frozen Skill as the sole treatment
  delta;
- original per-arm and pair budgets;
- no retry, fallback, replacement, extra arm or extra Case.

Goal 2.5 uses new Session, Run, comparison and evidence identities. It must not continue,
overwrite or relabel `.runs/v3-5-g2/real-pair-20260808-01`.

## 5. Zero-access implementation scope

One new top-level Goal 2.5 Session owns the bounded implementation and, only after later
Main approval of the audited Execution Baseline, the single real pair.

Allowed correction:

1. derive the model-visible `run_command.command_id` schema/description from the frozen
   allowed command descriptors so `public_test` is explicit and unknown IDs remain
   fail-closed;
2. freeze and persist a digest of the actual Tool interface projection used in both first
   Provider payloads;
3. allow only a successful frozen `public_test` result to return Pi's public
   `terminate: true`; failed/timed-out commands remain ordinary non-terminating results;
4. add a typed local pre-dispatch request-budget terminal with separate request-attempt and
   actual-dispatch counters;
5. reconcile only actual Provider responses and preserve the exact synthetic local stop
   without the Goal 2 secondary usage-report failure;
6. adapt the existing V2 pre-Verifier checkpoint rather than build new durability
   infrastructure: reservation/response state, Tool and side-effect closure, known usage,
   public Session reopen equality, Workspace/protected snapshot, first-payload evidence and
   checkpoint-before-Verifier ordering;
7. persist orthogonal outcomes:

```yaml
trajectory_outcome: settled | pre_dispatch_budget_terminal | invalid
task_outcome: passed | failed | invalid
```

Only the frozen external Verifier may produce `task_outcome: passed|failed`.

No source outside the thin Tool/runtime/Goal-2.5 adapter, focused tests, scripts and reports
may change. Accepted V0–V3.5 Goal 1 behavior must remain unchanged.

## 6. Required zero-call proof

Before any Credential or network access:

1. strict TypeScript passes;
2. the actual Tool projection exposes exactly `public_test` for this Case and rejects
   unknown IDs;
3. a Faux public-Pi path proves successful `public_test` persists its Tool Result,
   terminates the automatic follow-up and yields exactly one Harness `settled`;
4. failed/timed-out public checks do not falsely terminate;
5. the exact seventeenth-attempt local refusal proves 16 dispatches, no seventeenth network
   call, no pending reservation/response and preservation of the primary stop reason;
6. a positive quiescent-stop fixture writes the raw checkpoint before exactly one Verifier
   and permits Candidate;
7. negative fixtures for pending Provider/Tool/side effect, unknown usage, Session mismatch,
   missing Tool Result, Workspace/protected drift, missing first payload, timeout,
   post-dispatch loss and tampered checkpoint all run zero Verifiers and start zero
   Candidates;
8. Base/Candidate first payloads are identical outside the frozen Skill treatment;
9. Goal 2 focused tests plus the narrow Goal 1/V3/V2-checkpoint regressions pass;
10. Credential/network/external Provider/model/real-model counters remain
    `0/0/0/0/0`.

## 7. Review and Session flow

```text
user accepts formal Contract
→ user separately authorizes Activation and Control Baseline
→ new top-level Goal 2.5 Implementation Session
→ zero-access implementation + one bounded commit
→ Main light review
→ one fresh focused audit of only:
     Tool termination
     budget-stop quiescence
     Verifier handoff
     evidence/fairness
→ any hit returned to the original Session
→ Main freezes audited Execution Baseline
→ original Goal 2.5 Session receives no-source-edit real follow-up
→ one Base then one Candidate
→ Main limited evidence review
→ stop for user acceptance
```

The audit is risk-driven because the correction changes terminalization and Verifier
eligibility. It must not become a general V3.5 audit. No R1/R2, replacement protocol or
additional Case is planned.

## 8. Frozen real authority proposed

```yaml
order: [base, candidate]
per_arm:
  provider_dispatches_max: 16
  provider_request_attempts_max: 17
  tokens_max: 131072
  tool_calls_max: 24
  verifier_runs_exact: 1
  cost_usd_max: 0.20
whole_pair:
  arms_exact: 2
  credential_reads_max: 2
  provider_dispatches_max: 32
  cost_usd_max: 0.40
retry: 0
fallback_model_or_provider: 0
replacement: 0
extra_arm: 0
extra_case: 0
```

The seventeenth attempt is permitted only as the typed, local, pre-dispatch refusal. It
must never become a seventeenth network/Provider/model call.

## 9. Runtime gates and hard stops

For each arm:

- prefer normal non-error Pi `settled` after successful `public_test`;
- otherwise accept only the exact typed pre-dispatch budget terminal after every raw
  quiescence checkpoint field passes;
- persist the checkpoint before starting the Verifier;
- run the frozen external Verifier exactly once;
- if trajectory, checkpoint, Verifier, Session, Workspace, identity, usage or evidence is
  invalid, stop before the next arm;
- Candidate may start only after Base has a valid Task Outcome and closed evidence.

Hard stop without retry when:

- Case, Prompt, Skill, Verifier, provider/model or budget would need to change;
- actual Tool interface cannot be frozen or kept identical outside the Skill delta;
- Pi patch/private import or SDK/Extension/RPC/server switch is required;
- quiescence depends on inference rather than persisted raw evidence;
- hidden Verifier result is consulted before handoff;
- a source/evidence correction is proposed after real dispatch;
- a second pair, replacement or additional Case is proposed.

## 10. Exit Criteria

1. The accepted formal Contract and clean Control Baseline precede implementation.
2. Zero-access proof and the focused audit pass on one frozen implementation.
3. Base and Candidate each execute once from byte-identical Workspaces and fresh Sessions.
4. The only treatment delta is the exact frozen adaptive Skill.
5. Each arm records one valid Trajectory Outcome and one external-Verifier Task Outcome.
6. Two Verifier results, Tool/interface fairness, Session/Run linkage, checkpoints,
   Workspaces, usage and comparison evidence are persistently inspectable.
7. The observed result is accepted without tuning, replacement or extra execution.
8. Pi, V3 State authority, V3.5 Goal 1 and all closed facts remain unchanged.

## 11. Claims

If all Exit Criteria pass, allowed:

- one fair, fixed-case Base/Candidate adaptive-Skill comparison completed through Direct Pi;
- exact observed Task and Trajectory outcomes;
- public Tool affordance, public Pi termination hint and verifier-safe budget terminal
  formed a bounded completion boundary;
- persistent Session/Run/Verifier/comparison evidence is inspectable.

Not allowed:

- general Skill superiority;
- workspace/reference equality is task success;
- Goal 2 was retroactively repaired or reopened;
- arbitrary crash/timeout/post-dispatch failure is Verifier-eligible;
- V3.5 or Goal 3 is accepted.

## 12. Accepted binding decisions

```yaml
accepted_binding_decisions:
  - decision_id: Main_combined_correction
    evidence: observed_hidden_command_ID_loop_plus_public_Pi_terminate_support_plus_V2_quiescence_precedent
    outcome: accepted
    consequence: freezes_the_smallest_route_that_fixes_the_observed_bug_and_retains_a_fail_closed_fallback
  - decision_id: goal_2_5_contract
    evidence: Goal_2_closeout_and_bounded_postmortem
    outcome: accepted_and_activated
    consequence: authorizes_zero_access_implementation_under_this_contract
  - decision_id: bounded_long_running_envelope
    evidence: accepted_formal_contract_and_clean_control_baseline
    outcome: authorized
    consequence: controls_zero_access_implementation_audit_and_single_real_pair
```
