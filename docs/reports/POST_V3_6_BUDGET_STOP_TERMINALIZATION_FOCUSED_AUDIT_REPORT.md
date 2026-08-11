# Post-V3.6 Budget-Stop Terminalization Focused Audit Report

```yaml
status: focused_audit_complete
goal_id: POST_V3_6_BUDGET_STOP_TERMINALIZATION_MAINTENANCE
disposition: REVISE_POST_V3_6_BUDGET_STOP_TERMINALIZATION_FOCUSED_AUDIT
candidate_commit: d082f1a09dc0756afca5dc7dc39d433d0e73dd53
candidate_tree: 62baa170db984228a372fdcef321e7b5836b025c
control_baseline_commit: 1564361a1fd952d38fc58f08202b4fb89950ed07
control_baseline_tree: 210ed728c795fa4d18e85e3cee48af4ee475bced
tracked_state_at_gate: clean
findings:
  p1: 1
  p2: 0
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_project_execution: 0
source_apply: 0
```

## Disposition

**Recommendation:** Return one bounded Contract-local correction to the original
Implementation Session. The Candidate is not ready for maintenance acceptance because
the reopened terminal Inspector does not independently authenticate all dynamic usage,
Tool, and registered-command claims that it projects as known terminal truth.

The finding is limited to persisted evidence reconciliation. The exact live creation
path, non-settled classification, Authority/Session/Workspace identity checks, safe UI
projection, Apply and continuation denial, Source-drift check, and normal settled path
otherwise passed the reviewed source and focused deterministic/Faux tests.

## Finding

### POST-V3.6-AUDIT-P1-001 — Rehashed terminal can forge known usage, Tool count, and last registered-command truth

**Fact:** `parseBudgetStopTerminal` in
`workbench/src/session/persistent-session-v36.ts:229` verifies the terminal's own
`terminal_digest`, fixed 17/16/16 constants, numeric ranges, and safe field shapes. The
reopen path at `PersistentInteractiveSessionServiceV36.inspect`
(`workbench/src/session/persistent-session-v36.ts:518`) separately checks the Session
entry count/digest and current Workspace identity. `InteractiveControlPlaneV36.session`
at `workbench/src/v36/authority-v36.ts:344` separately checks the terminal's
`authority_digest` against the Run Authority.

**Fact:** Those reopen checks do not recompute or cross-check
`input_tokens`, `output_tokens`, `cost_usd`, `tool_calls`, or
`last_registered_command` against the authenticated Pi Session entries and the persisted
Docker command Authority/terminal artifacts. The parser accepts any non-negative usage,
any positive safe-integer Tool count, and any syntactically valid command ID, exit code,
flags and SHA-256-shaped terminal digest when the outer terminal digest is recomputed
(`workbench/src/session/persistent-session-v36.ts:222-240`).

**Fact:** `safeBudgetStopTerminal` then projects those values as known usage and the last
registered-command result (`workbench/src/session/persistent-session-v36.ts:244-254`).
The focused regression only changes `provider_dispatches` without recomputing the digest;
it does not cover a rehashed usage/Tool/command forgery or a missing/tampered referenced
Docker terminal (`workbench/tests/v36-budget-stop-terminalization.test.ts`).

**Inference:** A locally modified `budget-stop.json` can retain the genuine Run Authority,
Session entry digest, Workspace identity and fixed 17/16/16 fields, replace the usage,
Tool-count or last-command fields, recompute `terminal_digest`, and still be accepted and
shown by Session/API/UI inspection. Therefore `usage_known: true` and registered-command
terminal truth are not fail-closed under forged/tampered evidence as required by Contract
Sections 3.2, 3.6, 3.7 and deterministic Exit Criteria 4 and 12.

**Smallest Contract-local correction:** During reopen, derive and reconcile Provider
usage/response and Tool-call/Tool-result counts from the authenticated Pi Session prefix,
and validate the last registered command against its persisted V3.6 Docker command
Authority plus `terminal.json` digest and safe fields. Reject missing, ambiguous,
digest-mismatched or value-mismatched command evidence. Add focused cases that rehash the
outer budget terminal after changing usage, Tool count and last-command data, plus cases
for missing/tampered Docker command evidence. Do not change the request cap, Runtime,
normal settled semantics, or any real-execution authority.

## Focused scope results

1. **Exact classification/accounting — passed at creation path.** The local
   `before_provider_request` hook alone creates the typed stop on attempt 17; the terminal
   requires 17 attempts, 16 responses and no pending Provider reservation. Non-budget
   token/cost errors remain unclassified and produce neither Manifest nor budget terminal.
2. **Quiescence and known usage — revise for persisted reconciliation.** Live creation
   checks zero pending Provider, Tool and side-effect state and known finite usage. Finding
   P1-001 applies to reopened evidence authenticity.
3. **Manifest xor terminal and basic tamper failure — passed, subject to P1-001.** Missing
   or ambiguous Manifest/terminal forms, wrong fixed counters, Session mismatch and Run
   Authority mismatch fail closed. Dynamic terminal truth remains insufficiently
   cross-authenticated.
4. **Lineage — passed for Run Authority, Session pin, Workspace identity and ChangeSet.**
   The terminal is matched to Run Authority; the persistent Session prefix and Workspace
   identity are matched; ChangeSet generation retains Project/Session/Run/Profile/Source
   lineage. Registered-command evidence lineage requires the correction above.
5. **Safe loopback/browser projection — passed for disclosure boundary.** The projection
   contains bounded safe fields and no Credential, reasoning body, Authorization material,
   or Host path. It truthfully labels changes unverified, subject to P1-001's authenticity
   issue.
6. **Apply and continuation denial — passed.** `Apply All` is omitted and rejected
   server-side, and the failed Session cannot continue.
7. **Diff/Export/Discard Source non-mutation — passed.** Diff remains available; Export
   and Discard do not mutate registered Source. Discard persists only its authenticated
   handoff receipt.
8. **Registered Source and clean-Session provenance — passed.** Focused tests preserve
   registered Source, reject Source inventory drift without minting a Session, restore the
   authenticated inventory, and mint a distinct empty Session from that registered Source.
9. **Normal settled and non-budget behavior — passed.** The normal bounded Faux control
   persists the existing settled Manifest/result form, and token/cost budget errors do not
   become Provider-request terminals.

## Source Delta audit

**Fact:** Candidate versus Control changes 14 files: two maintenance reports, README,
two V3.6 contract files, the V3.6 persistent Session service, three V3.6 product/authority
adapters, the Goal 2 WebUI application/server/static client, one new focused test, and one
narrowly affected V3.6 test. All are inside the Contract allowlist. There is no delta in
`CURRENT_STATE.md`, `AGENTS.md`, the Contract, accepted Closeouts, Pi, fixtures,
registered Source, `reference/`, request-cap constants outside the exact retained value,
or unrelated source/tests. `git diff --check` passed.

## Commands and observed exit codes

| Command | Exit | Result |
|---|---:|---|
| `git rev-parse HEAD; git rev-parse 'HEAD^{tree}'; git status --porcelain=v1 --untracked-files=no` | 0 | Exact Candidate/tree; tracked state clean. |
| `git diff --name-status 1564361a... d082f1a...` and `git diff --stat ...` | 0 | 14-file Contract-local Source Delta. |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v36-budget-stop-terminalization.test.ts tests/v36g1-workspace-projection.test.ts tests/v36g1-http-ui.test.ts tests/v36g1-authority-session.test.ts tests/v36g2-change-handoff.test.ts tests/v36g2-product-entry.test.ts tests/v36-product-polish.test.ts tests/v35g25-termination-safe.test.ts` from `workbench/` | 0 | 32 passed, 0 failed, 0 skipped. |
| `node --check workbench/src/webui/static/app.js` | 0 | Browser JavaScript syntax passed. |
| `git diff --check 1564361a... d082f1a...` | 0 | No whitespace errors. |
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p workbench/tsconfig.json --noEmit` | 1 | Audit-worktree dependency resolution failed at `TS2688` because the temporary root `node_modules` junction was absent. |
| Same compiler with explicit `--typeRoots D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/@types` | 1 | Node types resolved, but workbench-local Pi package imports did not; no Candidate type error was established. |

## Limitations and access accounting

**Fact:** Per Main direction, the audit did not spend further time on the worktree-local
TypeScript dependency precondition and did not create a junction. Main independently ran
the exact pinned compiler successfully on the Candidate. The two audit-local failures are
an environment limitation, not a Candidate finding.

**Fact:** No Credential was read; no external network, Provider/model, real-model, Docker
project execution, verifier, Source Apply, retry, cap change, Pi inspection/change,
staging or commit occurred. Tests used loader-mapped public Pi artifacts, Faux providers,
fake registered-command results, loopback HTTP and ignored test evidence only.

**Unconfirmed:** Real Provider behavior, the original failed UX Session, live Docker
terminal artifacts, and a real clean-session journey were deliberately not executed.

Main retains Goal acceptance and scope control. This audit stops for Main review.
