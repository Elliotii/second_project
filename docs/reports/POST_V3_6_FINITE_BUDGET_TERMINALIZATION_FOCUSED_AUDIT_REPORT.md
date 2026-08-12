# Post-V3.6 Finite-Budget Terminalization Focused Audit Report

```yaml
goal_id: POST_V3_6_FINITE_BUDGET_TERMINALIZATION_MAINTENANCE
audit_role: fresh_top_level_read_only_focused_audit
candidate_commit: f83b23da77bb8f57f383c8a44cf4909d73ccbfb1
candidate_tree: 15f41350490a5e1e0b8098f4cc1db7559175a903
control_baseline: c2dc5d7bac14bb63e30c3669e70caaddbf6d913f
fixed_pi: 027a5847901b5dde30270abaa1041046cd2b4b55
disposition: PASS_POST_V3_6_FINITE_BUDGET_TERMINALIZATION_FOCUSED_AUDIT
goal_acceptance: not_claimed
control_state_edit: false
real_access: false
```

## Gate A

**Fact:** Candidate `HEAD` and tree exactly matched the supplied values. `git status --short --branch` showed a detached clean `HEAD`; no staged files were present. The only Candidate delta from the control baseline was the Contract-allowlisted implementation, tests and two draft/report documents.

**Fact:** `AGENTS.md`, `CURRENT_STATE.md`, the active Goal Contract, Main analysis, Implementation Report, Closeout Draft and the current project plan were read. The fixed Pi checkout reported exact `HEAD` `027a5847901b5dde30270abaa1041046cd2b4b55` and empty status. The Pi check used a command-local Git safe-directory override only; no global configuration or Pi file changed.

**Fact:** Protected blobs for `AGENTS.md`, `CURRENT_STATE.md`, the active Contract, Attempt-2 analysis and registered fixture Source matched Candidate `HEAD`. The registered fixture Source remained blob `852c8803f85891e6298daddb353e0885e4a33221`.

## Findings

No audit findings requiring correction were identified.

### F-001 — Severity: none — PASS — Capture-phase and variant truth

The schema-3 parser requires either one accounted usage dimension (`combined_token` and/or `cost`), exactly one `tool_call` dimension with `allowed + 1` observation, or one clean-boundary `wall_time` dimension. Allowed values come from the validated Host budget profile. The deterministic matrix proves Token, cost, simultaneous Token+cost, Tool and wall-time cases, including the Tool distinction of 25 attempts, 24 executed/completed and one blocked call. Capture phases remain explicit and simultaneous dimensions remain in one terminal.

### F-002 — Severity: none — PASS — Quiescence and accounting

Terminal creation and reopen require provider attempts/dispatches/responses to reconcile, known persisted usage, zero pending Provider reservations, zero pending Tool calls, zero pending side effects, complete Tool lifecycle accounting, and reconciled Session-derived counters. Reopen derives usage from persisted Pi Session AssistantMessage entries and does not trust terminal-only usage fields.

### F-003 — Severity: none — PASS — Lineage, write-once state and digest binding

The implementation binds terminal state to Run, Session, Workspace, Session prefix/end digests, pin and authority identity, and the harness diagnostic digest. Command authority and terminal evidence are checked by exact path, digest, ordinal, identity, status, exit and cleanup values. Terminal and settled Manifest artifacts are mutually exclusive. Missing, duplicate, unrelated, forged, mismatched and tampered artifacts fail closed in the focused tests.

### F-004 — Severity: none — PASS — Legacy compatibility and schema-3 tamper behavior

Schema 1 preserves the accepted `17/16/16` Provider terminal and schema 2 preserves `25/24/24`. Their original parser/projection path remains distinct from additive schema 3. Schema-3 exact-key, profile, dimension, reconciliation, diagnostic, command-observation and terminal-digest mutations are rejected. No terminal-controlled field can self-authenticate forged accounting because reopen recomputes Session usage and identities and validates the terminal digest.

### F-005 — Severity: none — PASS — Safe product surface and handoff boundaries

Every terminal remains `settled: false`, `unverified`, with null formal Outcome and false comparison/adaptation/promotion eligibility. Authenticated command `PASS`/`FAIL` is retained only as command observation. Diff, Export and Discard remain available; server-side Apply is denied for terminal runs; same-Session continuation is denied; clean-new-Session continuation requires the authenticated registered Source.

### F-006 — Severity: none — PASS — Deterministic loopback closure of the Token-stop gap

The loopback task API produced an authority-backed HTTP `201` schema-3 Token terminal with exact `combined_token` `131073/131072`; the corresponding Apply request was denied. Browser input cannot select the service-only persisted-usage test seam. The generic finite-terminal renderer exposes crossed dimensions, observed/allowed values, Tool accounting and the explicit unverified state.

## Verification

| Command | Result |
|---|---|
| Candidate/Pi identity, clean-status and protected-blob checks | PASS; exact supplied identities, no tracked/staged changes, Pi unchanged |
| Pinned TypeScript compiler with `workbench/tsconfig.v35g2.json --noEmit` | PASS |
| `node --check workbench/src/webui/static/app.js` | PASS |
| Focused finite terminal and legacy tests | 8 passed, 0 failed, 0 skipped |
| Token/cost pre-Manifest negative test | 1 passed, 0 failed, 0 skipped |
| Narrow V3.6/V3.5 HTTP, API and i18n regressions | 10 passed, 0 failed, 0 skipped |
| Docker `info` in this audit boundary | unavailable: Docker pipe permission denied |

Main’s Implementation Report records the exact unchanged registered Docker regression after Docker Desktop readiness as 1/1 passed. This audit does not replace that integrated Main-owned result and did not retry it.

## Proven claims and non-claims

**Proven by this audit:** bounded schema-3 variant classification; capture-phase preservation; simultaneous Token+cost representation; Provider/Tool/usage/side-effect quiescence checks; Session/Run/Workspace/authority/command lineage; write-once terminal/settled XOR; schema-1/schema-2 compatibility; schema-3 parser, digest, reopen and tamper rejection; safe API/WebUI dimensions and values; deterministic loopback Token-stop closure; command observation separation from settlement/verification; Diff/Export/Discard retention; Apply and failed-Session continuation denial; and clean-new-Session registered-Source provenance.

**Not claimed:** real Provider/model behavior, Credential or external-network access, UX Attempt 3, verifier or Outcome behavior, budget adequacy/optimality, arbitrary crash/timeout/unknown-usage recovery, retry/resume/replacement, Pi changes, Agent Loop changes, Source Apply success, or Goal/V3.6 acceptance. Docker was not available to this audit process; the accepted integrated Docker evidence remains Main-owned.

The audit creates no Candidate, control-state, Contract or Closeout acceptance and makes no source, fixture, Attempt-evidence, Pi or budget change.
