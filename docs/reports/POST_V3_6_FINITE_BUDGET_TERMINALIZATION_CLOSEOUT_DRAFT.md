# Post-V3.6 Finite-Budget Terminalization Closeout Draft

```yaml
status: draft_not_accepted
goal_id: POST_V3_6_FINITE_BUDGET_TERMINALIZATION_MAINTENANCE
implementation_disposition: main_bounded_correction_complete_pending_main_rereview_and_focused_audit
version_status: V3_6_remains_closed_and_accepted
control_baseline_commit: c2dc5d7bac14bb63e30c3669e70caaddbf6d913f
fixed_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
candidate_commit: null_main_owned
```

## Draft disposition

**Recommendation:** Main may perform the bounded-correction re-review, freeze a Candidate if satisfied, and dispatch the Contract-required fresh top-level focused read-only audit. This draft does not accept or close the Goal.

**Fact:** Known reconciled Provider-request, combined-Token, cost, simultaneous Token+cost, Tool-call and clean-boundary wall-time stops now have persistent, inspectable non-settled terminal paths. Schema-1 and schema-2 Provider terminals remain compatible; schema 3 is additive.

**Fact:** The new terminal separates capture phases and Provider, usage, Tool and command accounting. It is created only after quiescence plus Session, Workspace, Run authority and command-evidence reconciliation. Reopen repeats those checks and rejects missing, ambiguous, duplicate, forged, mismatched or tampered evidence.

**Fact:** PASS/FAIL is only the exact observation of the last authenticated registered command. Every terminal remains unverified with null Outcome and false eligibility. Zero-command terminals are valid when all zero-command evidence reconciles.

**Fact:** Safe inspection and Diff/Export/Discard remain available. Apply is denied server-side for every terminal variant; continuation requires a clean new Session from authenticated registered Source.

## Main correction disposition

- **F-001 corrected:** no usage floor remains in schema 3. Deterministic usage is written into the persisted AssistantMessage at a service-only Session append seam; reopen trusts only Session usage. Browser task input cannot select that seam.
- **F-002 corrected:** schema-3 safe request/Tool maxima are derived from the exact validated Host budget profile. Token and cost regressions assert `16` requests and `24` Tools for the frozen profile.
- **F-003 corrected:** loopback `POST /api/v1/v36/tasks` returns HTTP 201 for an authority-backed typed Token terminal with exact crossed values, and the handoff endpoint denies Apply. Static generic finite-terminal rendering is asserted.
- The stale legacy type comment no longer claims that Provider request is the only non-settled terminal form.

## Verification summary

- Strict TypeScript passed using the existing pinned local compiler and an ignored path-only config.
- Browser JavaScript syntax passed.
- This Session's final zero-Docker focused checks passed 9/9 after the Main correction.
- Narrow V3.6/V3.5 HTTP, application and i18n regressions passed 10/10.
- This Session's HTTP 400 evidence was `docker_runtime_unavailable` inside its managed sandbox and is only an environment observation. After Engine readiness, Main ran the exact unchanged Docker-backed command and reported 1/1 passed. Main owns final integrated Docker/full regression.
- The package `npm run typecheck` command exited 1 only because its pre-existing ignored V0-A compiler path is absent; no dependency or script change was authorized.
- Fixed Pi remained at `027a5847901b5dde30270abaa1041046cd2b4b55` with empty status.
- Protected control, Contract, Attempt-2 analysis, accepted Closeout and registered fixture Source blobs matched exact HEAD objects after correction.
- No Credential, external network, external Provider, real model, verifier, Source Apply, staging or commit action occurred in this Session's final checks. Main supplied the separate live-Docker result.

The exact commands, exit codes, evidence index, 17-item Exit Criteria matrix, source delta and `CURRENT_STATE_UPDATE_PROPOSAL` are in `POST_V3_6_FINITE_BUDGET_TERMINALIZATION_IMPLEMENTATION_REPORT.md`.

## Required remaining gate

Main bounded-correction re-review and one fresh top-level focused read-only audit remain required. The audit should focus only on:

- capture/accounting distinctions and simultaneous Token+cost truth;
- schema-3 Session/Tool/Workspace/authority/command reconciliation and diagnostic binding;
- legacy schema-1/schema-2 compatibility;
- safe projection, server-side Apply denial and clean-Session authority; and
- tamper failures without reopening Attempt evidence, Pi internals or broader architecture.

## Limits retained

This draft does not claim that Attempt 2 or the original task completed, command PASS means overall verification, budget values are optimal, arbitrary failures are recoverable, same-Session resume/retry works, real UX Attempt 3 passed, or V3.6/Pi/Agent Loop gained broader behavior.

No `CURRENT_STATE.md` edit, Candidate commit, audit disposition, Goal acceptance or Closeout acceptance is included.
