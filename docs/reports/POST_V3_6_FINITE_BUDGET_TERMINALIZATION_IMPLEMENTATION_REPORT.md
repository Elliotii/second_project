# Post-V3.6 Finite-Budget Terminalization Implementation Report

```yaml
status: main_bounded_correction_complete_pending_main_rereview_and_focused_audit
goal_id: POST_V3_6_FINITE_BUDGET_TERMINALIZATION_MAINTENANCE
implementation_owner: delegated_top_level_zero_real_access_implementation_session
control_baseline_commit: c2dc5d7bac14bb63e30c3669e70caaddbf6d913f
control_baseline_tree: 4b313ca191694074169ca95bdad7eac45b65a08f
starting_tracked_status: clean
fixed_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
candidate_commit: null_main_owned
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_execution: accepted_local_regression_only
source_apply: not_run
pi_core_patches: 0
staged_or_committed: false
```

## Outcome

**Fact:** The implementation adds an additive, write-once schema-3 `v36_reconciled_finite_budget_terminal` for known reconciled combined-Token, cost, Tool-call and clean-boundary wall-time stops. The accepted schema-1 `17/16/16` and schema-2 `25/24/24` pre-dispatch Provider-request terminals remain on their original parser, validation and safe-projection path.

**Fact:** Schema 3 preserves each crossed dimension, its observed and allowed values, and its capture phase. Simultaneous Token and cost crossings remain two dimensions in one terminal. It does not persist or trust a usage floor. Reopen derives input, output and cost exclusively from persisted Pi Session AssistantMessage usage.

## Main bounded correction

**Fact — F-001 corrected:** `per_response_usage_floor` was removed from the raw type, exact field set, parser, terminal writer and reopen reconciliation. A narrow service-only test seam replaces AssistantMessage usage at the public Session append boundary, before JSONL persistence. Runtime accounting and reopen therefore consume the same persisted message bytes. Browser input cannot select the seam: the HTTP task parser rejects the extra field. Rehashed terminal cost/dimension forgery and any reintroduced floor field fail closed.

**Fact — F-002 corrected:** Schema-3 request and Tool maxima now come from the exact validated Host-owned `budget_profile_id`, not current usage. Crossed-dimension `allowed` values must also match that profile. Focused Token and cost assertions prove request maximum `16` and Tool maximum `24` for the frozen profile; legacy schema-1/schema-2 projections remain exact.

**Fact — F-003 corrected:** A loopback regression sends an authority-backed Token stop through `POST /api/v1/v36/tasks`, receives HTTP `201` with the typed `combined_token` dimension `131073/131072`, and proves the corresponding Apply handoff is rejected server-side. It also checks the generic finite-terminal static renderer. No real Provider or UX attempt is involved.

## Main re-review regression disposition

**Fact:** Main's exact normal two-Turn command initially reproduced HTTP `400`. Its generated registered-command terminal showed `status: preflight_failed` and `error_code: docker_runtime_unavailable`; it contained no budget terminal. A direct Docker Engine check at that time could not open `dockerDesktopLinuxEngine`.

**Fact:** Main started the already-installed accepted Docker Desktop Linux Engine, independently observed Docker `29.6.2 linux`, and ran the exact unchanged live-Docker normal test successfully `1/1`. This Session's managed sandbox continued to report pipe denial; that is recorded only as an environment observation, not a code result. Main owns the final integrated Docker/full regression. The normal two-Turn source test remains unchanged and non-terminal by design.

**Fact:** A provisional deterministic command-executor diagnostic edit was fully reverted before final verification. No source behavior or test semantics were changed in response to this environmental failure. The only lasting correction for this Main re-review finding is truthful evidence/reporting.

**Fact:** Provider attempts/dispatches/responses, Tool attempts/executions/completions/blocked calls/results, pending reservations, pending Tool work, pending side effects, known usage, Workspace identity, Session prefix/end identity, Run authority and command evidence must reconcile before the terminal is written. The blocked 25th Tool call is distinguished from the 24 executed/completed calls, while its blocked Tool result remains visible and reconciled.

**Fact:** Harness-generated terminal diagnostics are bound by digest to the persisted Pi Session. Missing, duplicate, unrelated or altered diagnostics fail reopen validation. Terminal and settled Manifest artifacts remain mutually exclusive.

**Fact:** The safe Run remains `settled: false`, `unverified`, with null Outcome and false comparison/adaptation/promotion eligibility. A last registered command is either absent or retains an authenticated `PASS`/`FAIL` observation without changing overall Run status.

**Fact:** Diff, Export and Discard remain available for every terminal variant. Apply is denied server-side for every terminal variant. Same-Session continuation is denied; the existing clean-new-Session path remains constrained to the authenticated current registered Source.

**Fact:** No accepted Attempt evidence, budget value, Agent Loop, Verifier/Outcome semantic, control state, Pi file, reference file, Credential or registered real Source was edited. Deterministic tests use copied fixture Source only and assert that its original bytes remain unchanged.

## Exact source delta

Only Contract-allowlisted files changed:

- `workbench/src/contracts/v36-types.ts`: widens safe Run terminals to the finite-terminal union and adds the persistent finite-terminal mode.
- `workbench/src/contracts/v36g2-types.ts`: adds schema-3 raw/safe terminal, crossed-dimension and command-observation types while leaving the legacy Provider schema shape intact.
- `workbench/src/session/persistent-session-v36.ts`: implements capture, write-once persistence, strict parsing, Session/Tool/Workspace/authority/command reconciliation, reopen projection and settled-manifest XOR enforcement.
- `workbench/src/webui/application-v36g2.ts`: applies Export/Discard-only projection, server-side Apply denial and clean-new-Session continuation semantics to every terminal variant.
- `workbench/src/webui/static/app.js`: renders crossed dimensions, observed/allowed values, Tool accounting, usage, nullable command evidence and unverified safety status.
- `workbench/tests/v36-finite-budget-terminalization.test.ts`: deterministic matrix and schema-3 reopen/tamper/handoff/Source tests.
- `workbench/tests/v36-budget-stop-terminalization.test.ts`: additive schema-2 tamper regression; existing schema-1 validation coverage retained.
- `workbench/tests/v36g2-bounded-session-api.test.ts`: persisted-message usage seam coverage and the existing fail-before-artifact negative assertion.
- This report and `docs/reports/POST_V3_6_FINITE_BUDGET_TERMINALIZATION_CLOSEOUT_DRAFT.md`.

Ignored deterministic artifacts and the strict-TypeScript path shim live only below `.runs/post-v3-6-finite-budget-terminalization/`; they are not Candidate content.

## Exact verification commands and exit codes

| Command | Working directory | Exit | Result |
|---|---|---:|---|
| `git rev-parse HEAD; git status --short` | repository root, before edits | 0 | Exact HEAD `c2dc5d7bac14bb63e30c3669e70caaddbf6d913f`; no tracked or untracked output. |
| `git -C D:/AI/AI_Projects/project2/.upstream/pi rev-parse HEAD; git -C D:/AI/AI_Projects/project2/.upstream/pi status --short` | repository root | 0 | Exact Pi HEAD `027a5847901b5dde30270abaa1041046cd2b4b55`; empty status. |
| `npm run typecheck` | `workbench/` | 1 | Existing package script cannot find ignored `../.runs/v0-a/pi/node_modules/typescript/bin/tsc`; no dependency was installed or script changed. |
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p .runs/post-v3-6-finite-budget-terminalization/tooling/tsconfig.json --noEmit` | repository root | 0 | Strict TypeScript passed with existing local pinned dependencies and an ignored path-only config. |
| `node --check src/webui/static/app.js` | `workbench/` | 0 | Browser JavaScript syntax passed. |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v36-finite-budget-terminalization.test.ts tests/v36-budget-stop-terminalization.test.ts` | `workbench/` | 0 | 8 zero-Docker tests passed, 0 failed, 0 skipped. |
| Same loader with `--test-name-pattern="final assistant response" tests/v36g2-bounded-session-api.test.ts` | `workbench/` | 0 | 1 zero-Docker negative test passed, 0 failed, 0 skipped. |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v36g1-http-ui.test.ts tests/v35g3-i18n.test.ts tests/v35g3-application-api.test.ts` | `workbench/` | 0 | 10 passed, 0 failed, 0 skipped. |
| `git diff --check` | repository root | 0 | No whitespace errors. |
| `git hash-object workbench/fixtures/v36g2/duration-parser/src/parse-duration.js; git rev-parse HEAD:workbench/fixtures/v36g2/duration-parser/src/parse-duration.js` | repository root | 0 | Both are `852c8803f85891e6298daddb353e0885e4a33221`; registered fixture Source is unchanged. |
| Protected-file `git hash-object` versus `git rev-parse HEAD:<path>` for `AGENTS.md`, `CURRENT_STATE.md`, the Contract, Attempt-2 analysis, both accepted maintenance Closeouts and registered fixture Source | repository root | 0 | Every pair matched; Attempt/control/accepted evidence and Source are immutable. |
| `git diff --cached --name-only` plus fixed-Pi `status --short` | repository root | 0 | Both empty; nothing staged and Pi remains unmodified. |
| `git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C D:/AI/AI_Projects/project2/.upstream/pi rev-parse HEAD; ... status --short` | repository root under managed sandbox identity | 0 | Pi exact HEAD `027a5847901b5dde30270abaa1041046cd2b4b55`; status empty. Command-local override only; no global config or Pi write. |

Main re-review regression commands:

| Command | Boundary | Exit | Result |
|---|---|---:|---|
| `node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 --test-name-pattern='bounded-edit two-Turn' workbench/tests/v36g2-bounded-session-api.test.ts` | managed sandbox while Engine unavailable/inaccessible | 1 | HTTP 400; evidence recorded `docker_runtime_unavailable`, not a budget terminal. |
| Same exact command after Main started Docker | Main Session, Docker-capable boundary | 0 | Main reports 1 passed, 0 failed; authoritative live-Docker result. |

All Provider activity was deterministic local Faux activity expressly permitted by the Contract. There were zero Credential reads, external-network calls, external Provider calls, real-model calls, UX attempts, real task retries and Source Apply operations. This Session's final verification reran only zero-Docker commands; Main owns and supplied the live-Docker result.

## Evidence index

| Evidence | Location | What it proves |
|---|---|---|
| Raw/safe schema | `workbench/src/contracts/v36g2-types.ts` | Typed dimensions, reconciliation counters, command observation and non-settled eligibility semantics. |
| Persistence/reopen | `workbench/src/session/persistent-session-v36.ts` | Write-once terminal creation, exact validation and independent reopen reconciliation. |
| Product authority | `workbench/src/webui/application-v36g2.ts` | Export/Discard preservation, server-side Apply denial and continuation behavior. |
| Safe WebUI | `workbench/src/webui/static/app.js` | Crossed dimensions, observed/allowed values and explicit unverified status. |
| Schema-3 matrix | `workbench/tests/v36-finite-budget-terminalization.test.ts` | Token, cost, simultaneous Token+cost, Tool and wall terminals; PASS/FAIL/zero-command; reopen; handoff; clean Session; tamper failures. |
| Legacy compatibility | `workbench/tests/v36-budget-stop-terminalization.test.ts` | Schema-1 `17/16/16`, schema-2 `25/24/24`, reopen and tamper detection. |
| Settled/non-terminal regression | `workbench/tests/v36g2-bounded-session-api.test.ts` | Normal two-Turn flow and fail-before-artifact negative behavior. |
| V3.6/V3.5 narrow regression | `workbench/tests/v36g1-http-ui.test.ts`, `workbench/tests/v35g3-i18n.test.ts`, `workbench/tests/v35g3-application-api.test.ts` | Loopback/static safety, legacy application behavior and bilingual rendering substrate. |

## Exit Criteria matrix

| # | Criterion | Disposition |
|---:|---|---|
| 1 | Schema-1/schema-2 compatibility and tamper detection | PASS: exact legacy counters reopen; rehashed counter drift fails. |
| 2 | Accounted combined-Token terminal | PASS: schema 3, one terminal, no settled Manifest. |
| 3 | Accounted cost terminal | PASS: synthetic usage is persisted in AssistantMessage authority; terminal/reopen use only Session usage. |
| 4 | Simultaneous Token+cost truth | PASS: both ordered dimensions persist in one terminal. |
| 5 | Tool hard stop and lifecycle distinction | PASS: 25 attempted, 24 executed/completed, 1 blocked, 25 results. |
| 6 | Clean-boundary wall terminal | PASS: injected clock crosses before Provider dispatch; zero command. |
| 7 | Unknown/pending/inconsistent state fails closed | PASS: pending Provider/Tool/side-effect, usage/reconciliation, Session/Workspace/authority mutations reject; terminal-only usage/floor forgery rejects. |
| 8 | Zero/PASS/FAIL commands | PASS: zero-command Token/wall; PASS cost; FAIL simultaneous; nested evidence validated. |
| 9 | Non-settled/unverified/null/ineligible | PASS for all five schema-3 variants and both legacy variants. |
| 10 | Independent process reopen | PASS with a fresh `InteractiveControlPlaneV36`. |
| 11 | Safe API/WebUI specificity | PASS: authority-backed POST returns HTTP 201 typed Token terminal with exact `131073/131072`; static renderer and browser syntax pass. |
| 12 | Diff/Export/Discard; Apply/continuation denial | PASS for every matrix variant; clean authenticated new Session succeeds. |
| 13 | Registered Source unchanged | PASS for tracked registered fixture by blob identity and for every copied test Source by byte assertion; no real Source path was opened for mutation. |
| 14 | Missing/ambiguous/duplicate/forged/mismatched/tampered artifacts | PASS: XOR, digest, counters, diagnostic, command, Session, Workspace and authority cases reject. |
| 15 | Non-budget errors not misclassified | PASS: missing authority and unrelated malformed states create neither terminal nor settled Manifest. |
| 16 | TypeScript, browser syntax, narrow V3.6/V3.5 regressions | PASS via the commands above; package-script path defect recorded separately. |
| 17 | Zero real access; Pi/Source unchanged | PASS: local/Faux/loopback only; fixed Pi HEAD/status unchanged; no real Source mutation. |

## Remaining unverified items and non-claims

- **Unconfirmed:** Main review and the Contract-required fresh top-level focused read-only audit have not occurred. This Session does not freeze a Candidate, accept the Goal or edit control state.
- **Unconfirmed:** No real Provider/model, Credential, external network, verifier, UX Attempt 3 or real task path was exercised. Faux behavior is deterministic maintenance evidence only; local Docker execution proves only the existing normal regression.
- **Fact:** The existing `npm run typecheck` path remains broken in this worktree because its ignored compiler path is absent. Equivalent strict TypeScript passed; repairing build tooling is outside the allowlist.
- **Fact:** This implementation does not claim Attempt 2 or the original task completed, that a command PASS verifies the Run or changes, that budgets are optimal, or that arbitrary timeout/crash/unknown-side-effect states are recoverable.
- **Fact:** Same-Session resume, retry, replacement, Pi changes, Agent Loop changes, Verifier/Outcome changes and V4 remain out of scope.

## CURRENT_STATE_UPDATE_PROPOSAL

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  active_goal: POST_V3_6_FINITE_BUDGET_TERMINALIZATION_MAINTENANCE
  maintenance_status: main_bounded_correction_complete_pending_main_rereview_and_focused_audit
  implementation_control_baseline_commit: c2dc5d7bac14bb63e30c3669e70caaddbf6d913f
  implementation_control_baseline_tree: 4b313ca191694074169ca95bdad7eac45b65a08f
  fixed_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
  candidate_commit: null_main_owned
  schema_1_provider_terminal: compatible_17_16_16
  schema_2_provider_terminal: compatible_25_24_24
  schema_3_finite_terminals: combined_token_cost_simultaneous_tool_clean_boundary_wall
  terminal_status: nonsettled_unverified_null_outcome_ineligible
  apply_for_every_terminal: denied_server_side
  review_actions: diff_export_discard
  same_session_continuation: denied
  clean_new_session: authenticated_registered_source_only
  strict_typescript: passed_with_existing_local_pinned_compiler
  package_typecheck_script: failed_missing_ignored_v0_a_compiler_path
  browser_syntax: passed
  zero_docker_focused_tests: 9_passed_0_failed_0_skipped
  narrow_v36_v35_regressions: 10_passed_0_failed_0_skipped
  registered_fixture_source: unchanged_blob_852c8803f85891e6298daddb353e0885e4a33221
  credential_reads: 0
  external_network_calls: 0
  external_provider_calls: 0
  real_model_calls: 0
  docker_execution: Main_exact_normal_two_turn_1_passed
  source_apply: not_run
  pi_core_patches: 0
  staged_or_committed: false
  main_correction: F_001_F_002_F_003_corrected
  main_rereview_regression: sandbox_docker_runtime_unavailable_environment_only_Main_exact_test_1_passed
  attempt_and_control_evidence: unchanged_against_HEAD_blobs
  next_gate: Main_bounded_correction_rereview_then_fresh_top_level_focused_read_only_audit
  acceptance_owner: Main_Session
  v3_6_status: remains_closed_and_accepted
```
