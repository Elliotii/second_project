# Post-V3.6 Budget-stop Terminalization Maintenance Goal Contract

```yaml
status: closed_accepted
accepted_by_user: 2026-08-12
goal_id: POST_V3_6_BUDGET_STOP_TERMINALIZATION_MAINTENANCE
goal_kind: bounded_post_closeout_product_correctness_maintenance
version_status: V3_6_remains_closed_accepted
control_baseline: resulting_HEAD_of_this_activation_revision
implementation_owner: one_new_top_level_zero_call_implementation_session
main_owner: current_main_session
focused_audit: one_fresh_top_level_read_only_session_after_candidate_freeze
real_model_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
provider_request_limit_change_authorized: false
pi_core_patch_authorized: false
sdk_extension_rpc_switch_authorized: false
retry_fallback_replacement_authorized: false
same_failed_session_continuation_authorized: false
apply_unverified_budget_stopped_changes_authorized: false
disposition: PASS_POST_V3_6_BUDGET_STOP_TERMINALIZATION_MAINTENANCE
initial_candidate_commit: d082f1a09dc0756afca5dc7dc39d433d0e73dd53
corrected_candidate_commit: fe0908cefe979e12c2faa403d9e881194d91aa96
focused_audit_final: PASS_POST_V3_6_BUDGET_STOP_TERMINALIZATION_FOCUSED_AUDIT_AFTER_HIT_RECHECK
closeout: docs/reports/POST_V3_6_BUDGET_STOP_TERMINALIZATION_CLOSEOUT.md
```

## 1. Goal

Correct one post-closeout V3.6 product defect without reopening or redesigning V3.6:

> When a bounded real Turn reaches the exact local Provider-request limit before the
> next dispatch, persist a typed, immutable, inspectable non-settled terminal state so
> the user can understand and safely review or dispose of the managed-workspace changes.

The maintenance preserves the accepted Direct Pi `AgentHarness`, persistent Session,
managed-copy, Docker command, ChangeSet and Host authority architecture.

## 2. Triggering fact baseline

The user-experience Run `v36-run-9b8d48eb-eff1-46b7-92bf-43e3034355be` in Session
`v36-session-df928a62-e4ba-4a71-9a52-9935816e6aa9` completed 16 Provider responses and
22 Tool calls, then the 17th request attempt was rejected locally before dispatch by the
frozen per-Turn request cap. The last registered Docker command completed and returned
13 tests / 12 passed / 1 failed. Registered Source stayed byte-identical; five managed
Workspace files changed. The Pi JSONL Session exists, but no Runtime `manifest.json` or
interactive `result.json` was written, so the current Inspector cannot reopen the Run and
the UI reports only a generic request rejection.

This is evidence of a terminalization/inspectability defect. It is not evidence of an
invalid Credential, Docker failure, Source mutation, general Pi failure, or a justified
new request-limit value.

## 3. Frozen scope

Implement only the minimum additive path required to:

1. recognize the exact V3.6 local pre-dispatch Provider-request-cap stop;
2. prove actual request attempts, dispatches/responses, known usage and quiescent
   Provider/Tool/side-effect state;
3. write exactly one typed immutable budget-stop terminal artifact;
4. preserve `settled: false`, `verification_mode: unverified`, `formal_outcome: null`,
   and all comparison/adaptation/promotion eligibility as `false`;
5. let the persistent Session Inspector accept exactly one valid terminal form per Run:
   a settled Runtime Manifest **xor** a typed budget-stop terminal;
6. preserve fail-closed behavior for missing, ambiguous, forged, mismatched or tampered
   terminal evidence;
7. expose a safe Session/Run projection with the true stop reason, used/max request count,
   known usage, last registered-command result and `unverified_changes` status;
8. keep the managed Workspace and safe Diff reviewable;
9. allow Export and Discard, but reject or omit Apply All for this incomplete unverified
   terminal state;
10. offer only a clean new Session minted from the current authenticated registered Source
    after discard/terminal review; never continue the failed Session and never register its
    managed copy as Source;
11. preserve existing settled V3.6 behavior and historical V0–V3.6 evidence semantics.

The implementation may adapt the proven V3.5 Goal 2.5 pre-dispatch terminal invariants,
but must not copy its experiment-specific Pair/Verifier contracts into V3.6.

## 4. Typed terminal minimum

The additive terminal contract must authenticate at least:

```yaml
trajectory_outcome: pre_dispatch_budget_terminal
terminal_reason: provider_request_budget_exhausted
settled: false
request_attempts: 17
provider_dispatches: 16
provider_responses: 16
provider_requests_max: 16
pending_provider_reservations: 0
pending_tool_calls: 0
pending_side_effects: 0
usage_known: true
verification_mode: unverified
formal_outcome: null
comparison_eligible: false
adaptation_eligible: false
promotion_eligible: false
workspace_identity_at_terminal: authenticated_sha256
authority_and_session_lineage: authenticated
```

It may also carry the existing safe, known usage and registered-command terminal refs.
It must not contain Credential values, raw reasoning, unsafe Host paths or browser-writable
authority. It must not claim that the AgentHarness settled, the task completed, tests
passed, or the changes are safe to apply.

## 5. Allowed source and deliverables

The Implementation Session may add or modify only:

- `workbench/src/contracts/*v36*.ts`;
- `workbench/src/session/persistent-session-v36.ts`;
- `workbench/src/v36/authority-v36.ts`;
- `workbench/src/webui/application-v36g2.ts`;
- `workbench/src/webui/server-v36g1.ts`;
- additive V3.6 WebUI static files under `workbench/src/webui/static/`;
- a narrowly necessary V3.6 adapter or helper under `workbench/src/v36/`;
- `workbench/tests/*v36*budget*test.ts` and narrowly affected existing V3.6 tests;
- `workbench/README.md` only for the new user-visible terminal behavior;
- `docs/reports/POST_V3_6_BUDGET_STOP_TERMINALIZATION_IMPLEMENTATION_REPORT.md`;
- `docs/reports/POST_V3_6_BUDGET_STOP_TERMINALIZATION_CLOSEOUT_DRAFT.md`;
- ignored test evidence under `.runs/post-v3-6-budget-stop-maintenance/`.

It must not modify `CURRENT_STATE.md`, `AGENTS.md`, this Contract, V3.6 Charter or
Closeouts, accepted evidence, Pi, Credential files, registered real Source, `reference/`,
or unrelated source/tests. It must not stage or commit. Main alone owns Candidate and
Closeout commits and final acceptance.

## 6. Deterministic Exit Criteria

Zero-access tests must prove:

1. the exact 17th pre-dispatch attempt creates the typed terminal once;
2. attempts are 17 while actual dispatches and responses remain 16;
3. pending Provider reservations, Tool calls and side effects are all zero;
4. known usage and registered-command terminal truth are retained;
5. the Run remains non-settled, unverified and ineligible;
6. Session list/detail and Run inspection work after a simulated process reopen;
7. the UI identifies the bounded stop and shows used/max counts instead of a generic
   rejection;
8. managed changes and Diff remain inspectable and explicitly unverified;
9. Apply All is absent or fails closed, while Export and Discard remain non-mutating;
10. a clean new Session is minted only from authenticated registered Source;
11. registered Source bytes remain unchanged;
12. missing, ambiguous, forged, mismatched and tampered terminal artifacts fail closed;
13. unrelated/non-budget errors are not misclassified as safe budget terminals;
14. existing settled V3.6, handoff, browser and affected V3/V3.5 regressions pass;
15. strict TypeScript passes with zero Credential, network, Provider/model and Pi access.

## 7. Review and focused audit

Main performs one light implementation review. Ordinary Contract-local defects return to
the same Implementation Session for bounded correction.

After Main freezes a Candidate Commit, one fresh top-level read-only audit checks only:

- exact pre-dispatch-stop classification and dispatch accounting;
- quiescence and usage reconciliation;
- settled-versus-budget-stopped exclusivity and artifact integrity;
- Session/Run/Workspace/ChangeSet lineage;
- safe browser projection;
- Apply denial, registered Source immutability and clean-new-Session provenance.

The audit may not edit source, broaden scope or accept the Goal. A finding returns to the
original Implementation Session; re-review is limited to the finding and required
regressions.

## 8. Hard stops

Stop for Main/user if implementation would require:

- changing the 16-request cap or any real-call budget;
- real Credential, network, Provider/model access or a real retry;
- continuing the failed Session or applying its unverified incomplete changes;
- treating an unknown, post-dispatch-loss, crash or non-budget error as this safe terminal;
- weakening evidence, Session, Source, ChangeSet, Verifier or Harness State authority;
- Pi modification, private Pi import, SDK/Extension/RPC switching or a second Runtime;
- retry, fallback, replacement, additional Case or generalized recovery/transaction work;
- changing accepted V3.6 normal-settled semantics; or
- a second material correction to the same core terminal design.

## 9. Completion and claims

When all Exit Criteria and the focused audit pass, Main may accept and close this
maintenance Goal and create a Maintenance Closeout Commit.

Allowed claim:

> V3.6 now terminalizes and safely exposes the exact local pre-dispatch Provider-request
> budget stop without treating the Run as settled or allowing incomplete unverified
> changes to reach registered Source.

Not allowed: the original task completed; the 16-request cap is optimal; arbitrary failures
are recoverable; same-Session resume is supported; or a real UX retry passed. Any real UX
retry requires separate later user authority from a clean baseline.

## 10. Accepted result

Main accepted this Goal after one Contract-local implementation correction, one fresh
focused audit, one bounded audit-finding correction in the original Implementation
Session, and a hit-specific recheck in the original audit Session. The exact stop is now
typed, persistent, inspectable, evidence-reconciled and Apply-denied. All deterministic
Exit Criteria passed with zero real access. The binding disposition and limits are in
`docs/reports/POST_V3_6_BUDGET_STOP_TERMINALIZATION_CLOSEOUT.md`.
