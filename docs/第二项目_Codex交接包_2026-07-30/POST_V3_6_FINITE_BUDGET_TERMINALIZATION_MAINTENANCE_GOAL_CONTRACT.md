# Post-V3.6 Finite-budget Terminalization Maintenance Goal Contract

```yaml
status: closed_accepted
accepted_and_activated_by_user: 2026-08-12
closed_by_main_under_user_authority: 2026-08-12
goal_id: POST_V3_6_FINITE_BUDGET_TERMINALIZATION_MAINTENANCE
goal_kind: bounded_post_closeout_product_correctness_maintenance
version_status: V3_6_remains_closed_accepted
control_baseline_commit: c2dc5d7bac14bb63e30c3669e70caaddbf6d913f
control_baseline_tree: 4b313ca191694074169ca95bdad7eac45b65a08f
implementation_owner: completed_top_level_session_019ff261-eda6-7333-84f1-c3e5e56a258b
implementation_commit: f83b23da77bb8f57f383c8a44cf4909d73ccbfb1
implementation_tree: 15f41350490a5e1e0b8098f4cc1db7559175a903
main_owner: current_main_session
focused_audit: completed_top_level_session_019ff52f-8423-7622-bf60-6e0e2b74c656
focused_audit_commit: 4659c542e58bebc110572c7d13a0a101da6f0d2f
focused_audit_disposition: PASS_POST_V3_6_FINITE_BUDGET_TERMINALIZATION_FOCUSED_AUDIT
disposition: PASS_POST_V3_6_FINITE_BUDGET_TERMINALIZATION_MAINTENANCE
closeout: docs/reports/POST_V3_6_FINITE_BUDGET_TERMINALIZATION_CLOSEOUT.md
real_model_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
budget_value_change_authorized: false
ux_attempt_3_authorized: false
pi_core_patch_authorized: false
agent_loop_change_authorized: false
sdk_extension_rpc_switch_authorized: false
retry_resume_fallback_replacement_authorized: false
apply_unverified_terminal_changes_authorized: false
```

## 0. Accepted result

Main accepted and closed this bounded maintenance under the user's prior completion and
Closeout authority after the exact Candidate passed Main verification and one fresh
read-only focused audit. The frozen scope, budgets, authority boundaries, hard stops and
claims below were not amended. The formal evidence and remaining non-claims are recorded
in `docs/reports/POST_V3_6_FINITE_BUDGET_TERMINALIZATION_CLOSEOUT.md`.

## 1. Goal

Close one natural post-V3.6 product Finding without reopening V3.6:

> When a known finite daily budget boundary stops a bounded-edit Turn, produce a typed,
> immutable, persistent and safely inspectable non-settled terminal only when usage,
> Session, Workspace, command evidence and pending Provider/Tool/side-effect state can be
> reconciled truthfully.

The supported dimensions are Provider request, combined Token, cost, Tool call and
clean-boundary wall time. The maintenance preserves Direct public Pi `AgentHarness`,
persistent Pi JSONL Session, managed Session copy, Docker registered-command execution,
ChangeSet, registered Source, Verifier and Host apply authority.

## 2. Triggering fact baseline

Round A Attempt 2 ran from Git `cd0a15e9e48560dffabe156fb49b907221bbd924` in Session
`v36-session-45ea2114-db72-460b-9e2f-061b8dcff27a`, Run
`v36-run-5f3a128c-e840-42b7-bce0-f318fe7f62b9`.

It crossed the former 16-request boundary and received 19 successful Provider responses,
proving the accepted daily 24-request hard maximum was active. It then stopped after
authenticated accounting reached 142,918 combined Tokens against the unchanged 131,072
hard maximum. Cost was USD `0.0031895472` against USD `0.20`; Tool results were `24 / 24`.
Both registered Docker `test` commands passed, but the Turn did not settle. Registered
Source remained unchanged and managed changes remained isolated.

Because the existing terminal path recognizes only `ProviderRequestBudgetTerminalV36Error`,
the Token stop wrote neither `manifest.json` nor `budget-stop.json`; the safe HTTP surface
returned generic `request_rejected`.

Attempt 1 and Attempt 2 are immutable historical evidence. This Goal must not overwrite,
rewrite, relabel or replace either Attempt with deterministic fixture output.

Binding analysis: `docs/reports/V3_6_UX_ATTEMPT2_TOKEN_STOP_MAIN_ANALYSIS.md`.

## 3. Frozen semantic boundary

### 3.1 Common product contract, distinct Runtime variants

The product may expose a common finite-budget terminal union, but it must preserve each
variant's actual capture phase and accounting semantics:

| Variant | Required truthful meaning |
| --- | --- |
| Provider request | the next request was refused before dispatch; attempts may be max + 1 while dispatches and responses remain max |
| Combined Token | the limit was crossed by authenticated cumulative usage after a Provider response was accounted |
| Cost | the limit was crossed by authenticated cumulative cost after a Provider response was accounted |
| Tool call | the next Tool call was refused before Tool execution; attempted and actually executed/completed counts remain distinct |
| Clean-boundary wall time | wall time was observed over limit at a boundary where Provider, Tool and side-effect state is quiescent and known |

If Token and cost cross on the same accounted Provider response, the terminal must retain
both crossed dimensions rather than inventing a false single cause.

In-flight timeout, crash, post-dispatch response loss, unknown usage or uncertain Tool
side effects are not clean-boundary finite-budget terminals and must remain fail-closed.

### 3.2 Mandatory trusted-generation invariants

A new safe terminal may be written only if all applicable invariants are proven:

```yaml
settled: false
usage_known: true
pending_provider_reservations: 0
pending_tool_calls: 0
pending_side_effects: 0
provider_accounting_reconciled: true
tool_lifecycle_reconciled: true
session_identity_reconciled: true
workspace_identity_reconciled: true
authority_identity_reconciled: true
command_evidence_reconciled: true
verification_mode: unverified
formal_outcome: null
comparison_eligible: false
adaptation_eligible: false
promotion_eligible: false
```

Command-evidence reconciliation may prove zero registered-command executions. When one or
more registered commands exist, the terminal must retain the exact last command
observation and authenticated evidence references/digests. PASS/FAIL describes that
command only; it never promotes the overall Run to settled, verified or formally passed.

### 3.3 Persistence and compatibility

Each Runtime Run must continue to contain exactly one accepted terminal authority form:

```text
settled manifest XOR typed finite-budget terminal
```

The implementation must preserve read compatibility and validation behavior for existing
Provider-request schema-1 `17/16/16` and schema-2 daily `25/24/24` terminals. Historical
artifacts must not be rewritten or migrated in place.

New terminal artifacts must be write-once, digest-authenticated, reasoning/secret/Host-
path safe, and independently reconciled against Pi Session entries, Workspace identity,
Run authority and registered-command evidence when reopened.

## 4. Product behavior

For every accepted finite-budget terminal:

1. Session list/detail and Run inspection remain available.
2. The safe projection shows the true crossed dimension or dimensions, observed/allowed
   values, capture phase and last registered-command observation when present.
3. Managed Files, Changes and Diff remain inspectable and explicitly unverified.
4. Export and Discard remain available under existing authority.
5. Apply is denied server-side for any non-settled finite-budget terminal; hiding a button
   is not sufficient.
6. The failed Session cannot be continued. Only the existing clean-new-Session path from
   the current authenticated registered Source may be used.
7. Registered Source remains byte-identical unless a separately authorized, settled and
   eligible Host-controlled Apply occurs; this Goal authorizes no Apply.
8. Non-budget errors and unreconciled interruptions must not be projected as safe budget
   terminals.

## 5. Allowed files and deliverables

The Implementation Session may add or modify only:

- `workbench/src/contracts/*v36*.ts`;
- `workbench/src/session/persistent-session-v36.ts`;
- `workbench/src/v36/authority-v36.ts`;
- `workbench/src/webui/application-v36g2.ts`;
- `workbench/src/webui/server-v36g1.ts` only if narrowly required for safe projection;
- additive/narrow V3.6 WebUI static files under `workbench/src/webui/static/`;
- a narrowly necessary V3.6 helper under `workbench/src/v36/`;
- `workbench/tests/*v36*budget*test.ts` and narrowly affected existing V3.6 tests;
- `workbench/README.md` only for the new terminal behavior;
- `docs/reports/POST_V3_6_FINITE_BUDGET_TERMINALIZATION_IMPLEMENTATION_REPORT.md`;
- `docs/reports/POST_V3_6_FINITE_BUDGET_TERMINALIZATION_CLOSEOUT_DRAFT.md`;
- ignored deterministic evidence under a new `.runs/post-v3-6-finite-budget-terminalization/` root.

It must not modify or stage `CURRENT_STATE.md`, `AGENTS.md`, this Contract, accepted
Closeouts, Attempt 1/2 evidence, Pi, `reference/`, credentials, registered real Source,
budget values, Agent Loop semantics, Verifier/Outcome semantics or unrelated source.

The Implementation Session must not create a Git commit. Main alone owns Candidate,
integration and Closeout commits.

## 6. Deterministic Exit Criteria

Zero-real-access tests must prove:

1. exact Provider-request schema-1 and schema-2 terminals remain readable, inspectable and tamper-detecting;
2. a cumulative combined-Token stop after an accounted response creates exactly one typed non-settled terminal;
3. a cumulative cost stop after an accounted response creates exactly one typed non-settled terminal;
4. simultaneous Token and cost crossing preserves both dimensions in one terminal;
5. a Tool-call hard stop distinguishes attempted from executed/completed Tool counts and creates a terminal only after Tool lifecycle and side effects reconcile;
6. a wall-time stop creates a terminal only at an explicitly tested clean boundary;
7. in-flight/unknown usage, pending Provider, pending Tool, pending side effect and inconsistent Session/Workspace/authority state fail closed;
8. zero command executions reconcile as zero, while present PASS and FAIL registered commands retain exact authenticated observations without changing overall Run status;
9. every terminal remains `settled: false`, `unverified`, null Outcome and ineligible;
10. process reopen independently validates the persisted terminal and safe Session/Run projection;
11. the safe API/WebUI shows stop dimensions and consumed/allowed values instead of generic rejection for an accepted known stop;
12. Diff/Export/Discard remain available, while Apply is denied server-side for every variant and continuation requires a clean new Session from authenticated Source;
13. registered Source bytes remain unchanged;
14. missing, ambiguous, duplicate, forged, mismatched and tampered artifacts fail closed;
15. unrelated/non-budget errors are not misclassified;
16. strict TypeScript, browser syntax and narrow affected V3.6/V3.5 regressions pass;
17. verification uses zero Credential, network, Provider/model and real-model access and leaves both fixed Pi and registered Source unchanged.

Tests may use Faux Provider responses and deterministic injected clocks/usage floors or
equivalent test-only seams. They must not replace or mutate real Attempt evidence.

## 7. Main review and focused audit

Main performs one light implementation review. Ordinary Contract-local defects return to
the same Implementation Session as one bounded correction package.

After Main freezes a Candidate Commit, one new top-level read-only audit checks only:

- variant classification and capture-phase truth;
- Provider/Token/cost/Tool/wall accounting and quiescence;
- Session/Run/Workspace/authority/command-evidence lineage;
- settled-manifest versus finite-budget-terminal exclusivity;
- legacy schema-1/schema-2 compatibility and artifact tamper rejection;
- safe projection and generic-error closure;
- server-side Apply denial, failed-Session continuation denial and registered Source immutability.

The audit must not edit source or control state, broaden scope, create the Candidate Commit
or accept the Goal. A concrete finding returns to the original Implementation Session;
recheck is limited to the finding and required regressions.

## 8. Hard stops

Stop for Main/user if implementation would require:

- increasing or removing any finite budget;
- UX Attempt 3 or any real Credential/network/Provider/model call;
- automatic retry, resume, continuation, fallback or replacement;
- changing Pi or the Agent Loop;
- applying incomplete/unverified changes or weakening Source/ChangeSet/Verifier/Session authority;
- classifying unknown in-flight Provider/Tool/side-effect state as reconciled;
- introducing crash recovery, a transaction manager, durable workflow platform, another backend or SDK/Extension/RPC route;
- reopening V3.6, entering V4 or adding a new Harness feature; or
- a second material failure of the same core terminal design.

## 9. Completion and claims

Main may close the Goal only after all Exit Criteria pass, the focused audit passes, a
formal Closeout records exact commands/evidence and control state returns to
`active_goal: null`.

Allowed claim:

> V3.6 safely terminalizes known, reconciled finite Provider-request, combined-Token,
> cost, Tool-call and clean-boundary wall-time stops as persistent non-settled Runs while
> preserving legacy Provider terminals, inspectable isolated changes and Host-controlled
> Apply denial.

Not allowed: Attempt 2 or the original task completed; passing a registered command proves
the overall Run or changes are verified; any budget is universally optimal; arbitrary
timeouts, crashes or unknown side effects are recoverable; same-Session resume, automatic
retry or real UX Attempt 3 passed; or V3.6/Pi/Agent Loop gained broader capabilities.
