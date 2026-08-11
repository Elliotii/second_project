# Post-V3.6 Budget-Stop Terminalization Implementation Report

```yaml
status: bounded_audit_correction_complete_pending_main_hit_specific_rereview
goal_id: POST_V3_6_BUDGET_STOP_TERMINALIZATION_MAINTENANCE
implementation_owner: delegated_top_level_zero_real_access_implementation_session
control_baseline_commit: 1564361a1fd952d38fc58f08202b4fb89950ed07
control_baseline_tree: 210ed728c795fa4d18e85e3cee48af4ee475bced
starting_tracked_status: clean
pi_core_patches: 0
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_execution: not_run
source_apply: not_run
audit_finding_corrected: POST-V3.6-AUDIT-P1-001
```

## Outcome

**Fact:** The bounded V3.6 Turn now recognizes only the exact local seventeenth Provider-request attempt as a typed `pre_dispatch_budget_terminal`. It writes one immutable `budget-stop.json`, rather than a settled Runtime Manifest or interactive result evidence.

**Fact:** The terminal has `settled:false`, reason `provider_request_budget_exhausted`, attempts `17`, dispatches/responses `16`, maximum `16`, zero pending Provider/Tool/side-effect state, known usage, unverified/null/false outcome and eligibility fields, authenticated Workspace identity, Session pin, and Run Authority digest.

**Fact:** The persistent inspector accepts `manifest.json xor budget-stop.json`; it rejects missing, ambiguous, forged, Session-mismatched, authority-mismatched, and digest/counter-tampered terminal evidence.

**Fact:** This correction addresses `POST-V3.6-AUDIT-P1-001`. At terminal creation and on reopen, the service checks the authenticated Pi Session prefix/end identity and independently derives Provider-response usage plus ordered Tool-call/Tool-result lifecycle counts from the persisted Session entries. Rehashed `budget-stop.json` usage or Tool-count fields therefore fail closed rather than becoming trusted state.

**Fact:** At terminal creation and on reopen, the service validates the final registered command against the existing per-Run `interactive-evidence/runs/<run>/docker-commands/command-<ordinal>/authority.json` and `terminal.json` artifacts. It requires exact ordinal/ref paths and directory contents, validates both inner digests and frozen-profile fields, and reconciles command ID, Docker authority/terminal lineage, exit/timed-out/truncated fields, cleanup, and inspected profile. The existing Docker executor and Authority architecture were not changed.

**Fact:** The safe API/WebUI projection identifies the local stop, used/max request count, known usage, last registered-command result, and explicitly unverified changes. Diff, Export, and Discard remain available; Apply All is absent from the projected actions and rejected server-side.

**Fact:** Continuation of a budget-stopped Session is denied. A clean new Session can be created only after terminal Authority validation and only while the current registered Source inventory still equals the original authenticated Source snapshot. The budget-terminal task/title say clean/current registered Source; successful Apply retains the existing updated-Source wording. The failed managed copy is never made Source.

**Fact:** Normal settled bounded-Turn behavior remains available. A focused faux-only control test produces the ordinary settled Manifest and interactive result evidence, with no budget-stop artifact.

## Source delta

The Contract-bounded implementation changes only the allowed V3.6 source, tests, README, and these reports:

- Typed raw and safe terminal projections in `workbench/src/contracts/v36-types.ts` and `workbench/src/contracts/v36g2-types.ts`.
- Local request accounting, quiescence reconciliation, immutable artifact validation, and persistent inspection in `workbench/src/session/persistent-session-v36.ts`.
- Authority lineage, continuation denial, conditional truthful clean-Session wording, and authenticated clean-Session provenance in `workbench/src/v36/authority-v36.ts`.
- Goal 2 handoff denial and truthful continuation projection in `workbench/src/webui/application-v36g2.ts`, with the necessary async server forwarding.
- Bilingual terminal status and handoff affordance rendering in `workbench/src/webui/static/app.js`.
- Required authority digest forwarding in the existing daily product and frozen product-entry dispatch paths; the frozen product entry refuses a terminal as outside its settled two-Turn Journey contract.
- README documentation, one new focused faux-only terminalization regression, and one existing non-budget token/cost regression assertion.

No control file, Charter, Contract, accepted Closeout, Pi source, upstream checkout, reference material, request cap, SDK/Extension/RPC route, Case, or registered Source was modified. No files were staged or committed.

### Audit-correction delta

This `POST-V3.6-AUDIT-P1-001` correction changes only:

- `workbench/src/contracts/v36g2-types.ts`: exact terminal references for the last Docker command and the pre-Turn Pi Session prefix identity.
- `workbench/src/session/persistent-session-v36.ts`: Session-derived usage/Tool reconciliation and fail-closed existing Docker evidence validation during terminal creation and reopen.
- `workbench/tests/v36-budget-stop-terminalization.test.ts`: faux persisted Docker evidence plus rehashed outer usage/Tool/last-command and missing/tampered/ambiguous nested-evidence failure cases.
- This implementation report and the Closeout Draft.

## Verification

All commands below exited `0`.

| Command | Result |
|---|---|
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.v35g2.json --noEmit` from `workbench/` | Strict TypeScript passed after `POST-V3.6-AUDIT-P1-001`. |
| `node --check workbench/src/webui/static/app.js` | Browser JavaScript syntax passed. |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v36-budget-stop-terminalization.test.ts` from `workbench/` | 2 passed: normal settled control and exact terminal path. |
| Same loader with `tests/v36-budget-stop-terminalization.test.ts tests/v36g1-workspace-projection.test.ts tests/v36g1-http-ui.test.ts tests/v36g1-authority-session.test.ts tests/v36g2-change-handoff.test.ts tests/v36g2-product-entry.test.ts tests/v36-product-polish.test.ts tests/v35g25-termination-safe.test.ts` | 32 passed, 0 failed, 0 skipped before Main's wording/drift correction request. |
| Same loader with `tests/v36-budget-stop-terminalization.test.ts tests/v36g1-authority-session.test.ts` | 7 passed, 0 failed, 0 skipped after the bounded wording/drift correction. |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v36-budget-stop-terminalization.test.ts` from `workbench/` | 2 passed, 0 failed, 0 skipped after `POST-V3.6-AUDIT-P1-001`; includes rehashed outer usage, Tool-count, and last-command data plus missing, tampered, and ambiguous nested command evidence. |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v36g1-authority-session.test.ts` from `workbench/` | 5 passed, 0 failed, 0 skipped as the affected V3.6 authority/session regression. |
| `git diff --check` | No whitespace errors. |

The focused terminal test proves all deterministic Exit-Criteria cases that do not require real access: exact 17/16/16 accounting; non-settled safe inspection after a fresh control-plane instance; safe Diff/Export/Discard; denied Apply and same-Session continuation; fixture-only registered-Source inventory drift rejected before clean-Session creation; restored authenticated Source identity and clean-Session creation; original terminal tamper classes; and rehashed outer usage, Tool-count, and last-command data plus missing, tampered, and ambiguous nested Docker command evidence. It uses `fauxProvider`, a faux persisted registered-command evidence fixture, and loopback HTTP only. It neither resolves a Credential nor invokes an external Provider, real model, Docker command, or Source Apply.

**Fact:** `npm.cmd run typecheck` remains unusable in this worktree because its existing script points to the absent `../.runs/v0-a/pi/node_modules/typescript/bin/tsc`. The equivalent pinned local TypeScript compiler command above passed; no dependency installation or package-script change was made.

**Fact:** To resolve that existing compiler/dependency-path defect for the zero-access checks, this Session created an untracked workspace-root `node_modules` junction to the already-present local G006 Pi dependency tree. The environment rejected the validated cleanup command; the junction remains untracked and must be removed as routine local housekeeping when filesystem deletion is available. It is not a dependency installation, source change, staged item, or Candidate content.

## Unverified and deliberately not run

- **Unconfirmed:** The original real UX Session was not retried, resumed, relabeled, or modified. No real Provider/model, Credential, network, Docker command, verifier, or Source Apply occurred.
- **Unconfirmed:** The untouched live Docker executor suite was not run in this zero-real-access maintenance Session. The focused regressions use a fake registered-command terminal only.
- **Fact:** The focused audit returned `REVISE` for `POST-V3.6-AUDIT-P1-001`; this bounded correction is complete. Main's hit-specific re-review remains required. This Session does not accept the Goal or V3.6.
- **Fact:** This implementation does not prove arbitrary failure recovery, post-dispatch loss handling, crash recovery, exactly-once Tools, general request-cap suitability, or same-Session continuation.

## CURRENT_STATE_UPDATE_PROPOSAL

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  active_goal: POST_V3_6_BUDGET_STOP_TERMINALIZATION_MAINTENANCE
  maintenance_status: bounded_audit_correction_complete_pending_main_hit_specific_rereview
  implementation_control_baseline_commit: 1564361a1fd952d38fc58f08202b4fb89950ed07
  implementation_control_baseline_tree: 210ed728c795fa4d18e85e3cee48af4ee475bced
  candidate_commit: d082f1a09dc0756afca5dc7dc39d433d0e73dd53_pre_correction_main_candidate
  audit_finding: POST-V3.6-AUDIT-P1-001
  audit_correction: session_derived_usage_tool_reconciliation_and_existing_docker_command_evidence_validation
  strict_typescript: passed_with_pinned_existing_local_compiler
  javascript_syntax: passed
  focused_terminalization_tests: 2_passed_0_failed_0_skipped
  pre_correction_selected_zero_access_regressions: 32_passed_0_failed_0_skipped
  post_correction_affected_zero_access_regressions: 7_passed_0_failed_0_skipped
  post_audit_correction_focused_terminalization_tests: 2_passed_0_failed_0_skipped
  post_audit_correction_authority_session_regression: 5_passed_0_failed_0_skipped
  exact_terminal: attempts_17_dispatches_16_responses_16_nonsettled_unverified
  apply_for_budget_terminal: denied
  same_failed_session_continuation: denied
  clean_new_session: registered_source_inventory_authenticated_only
  registered_source_mutation: no_real_source_mutation_fixture_only_drift_restored
  credential_reads: 0
  external_network_calls: 0
  external_provider_calls: 0
  real_model_calls: 0
  docker_execution: not_run
  source_apply: not_run
  pi_core_patches: 0
  remaining_gate: Main_hit_specific_read_only_rereview_of_POST-V3.6-AUDIT-P1-001
  acceptance_owner: Main_Session
  v3_6_status: remains_closed_and_accepted_pending_maintenance_goal_review
```
