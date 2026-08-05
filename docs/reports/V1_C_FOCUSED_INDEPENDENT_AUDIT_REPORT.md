# V1-C Focused Independent Audit Report

```yaml
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
session_role: fresh_focused_independent_audit
audit_date: 2026-08-05
audit_disposition: NEEDS_BOUNDED_CORRECTION
control_baseline_commit: 016006e72e5baf4f558f1f63f1ffafcf122e119c
candidate_commit: e021662e2f4b6d2721f9b0378ac2efa64b706963
candidate_tree: e0eebb93562fdc24e616ba3ff7c795a2f956084d
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
p0_findings: 0
p1_findings: 3
p2_findings: 0
p3_findings: 0
credential_reads: 0
external_network_calls: 0
real_provider_calls: 0
real_model_calls: 0
source_or_test_repairs: 0
control_state_edits: 0
git_stage_or_commit: 0
real_canary_or_full_pilot: 0
v2_entered: false
```

## 1. Outcome

**Fact.** Gate A passed. Project `HEAD` and tree exactly matched the frozen
Candidate above; the Candidate parent was the exact Control Baseline. The
project had no tracked, staged or untracked delta at audit start. Both the
primary and registered-run Pi checkouts were clean at
`027a5847901b5dde30270abaa1041046cd2b4b55`.

**Fact.** The mandatory verification passes on an exact detached Candidate
audit copy using only the repository's existing dependency trees: strict
TypeScript, V1-C 10/10, V1-B 31/31 and Candidate `git diff --check` all exit 0.

**Fact.** Three in-scope P1 findings remain. A genuine unknown-usage pause in a
C child Attempt is produced with the correct pending reservation and full
conservative charge but rejected by the Inspector; coherently rehashed terminal
Journal sequence drift is accepted as terminal/comparable; and a present but
unauthorized Stage 2 authority can materialize a real-identity Pilot root before
the authority is rejected.

**Inference.** None of the three counterexamples performs a credential read or
external dispatch, and none proves a false real Provider charge. They are P1
rather than P0. They nevertheless block Candidate acceptance because they touch
the Contract's accounting, evidence-integrity and authority-before-side-effect
boundaries.

**Recommendation.** Return only the three bounded corrections below to the
original V1-C Implementation Session. Re-audit these findings and the mandatory
41 focused regressions. Do not create an Execution Baseline or authorize a real
Canary from this Candidate.

## 2. Identity and source delta

| Check | Result |
|---|---|
| Candidate SHA | `e021662e2f4b6d2721f9b0378ac2efa64b706963` |
| Candidate tree | `e0eebb93562fdc24e616ba3ff7c795a2f956084d` |
| Candidate parent / Control Baseline | `016006e72e5baf4f558f1f63f1ffafcf122e119c` |
| Primary Pi | exact pinned commit, clean |
| Registered-run Pi | exact pinned commit, clean |
| Candidate delta | exactly 9 files: 6 source, 1 test, 2 reports |
| Protected delta | 0 paths |
| Audit tracked delta | this report only |
| Audit source/test/fixture/Manifest/control delta | 0 paths |
| Audit-local ignored evidence | `.runs/v1-c/audit/` only |

The exact Candidate source/test SHA-256 values independently observed were:

| Path | SHA-256 |
|---|---|
| `workbench/src/contracts/v1-types.ts` | `fbda8e2176eb9244fed5b39419089e7ffb0f44001b7f80d9750ca3998603f23c` |
| `workbench/src/experiment/v1.ts` | `48113307740502be05091438588d1faf236bcb364d41318701164fc38ea8c353` |
| `workbench/src/inspect-v1.ts` | `3b466321a7b470e9fc628787c2869ba6d59b87fe946bdfcd875f40b4319caf39` |
| `workbench/src/pi/pi-run-handle-v1.ts` | `44ab06f8808e392ba2538e2d5af106a78bab46254afbe0929673791c1bc35014` |
| `workbench/src/pilot-v1.ts` | `5455ea0c29da265d4d439020bcfc2f084f1aa959dd93d83693bf3477b096fafc` |
| `workbench/src/run-v1.ts` | `0786856ac79ec1299b33518ac8e3ab5cc1cd0844374c7d9b0dd3bd3944f8ae36` |
| `workbench/tests/v1c-budget-stop.test.ts` | `cbf68de5fa3eb92650bb6c381d2971b2db73e7ba8bc411c9b515b13dd7cd9faf` |

## 3. Findings

### P1-001 — paused Inspector conflates Run-wide requests with the active child Attempt

**Contract boundary.** Exact Run/Attempt/Session/Workspace/request-ordinal
accounting, genuine unknown-usage pause integrity and C-only recovery.

**Fact.** `workbench/src/pi/pi-run-handle-v1.ts::runAttempt()` resets
`currentProviderRequests` for each Attempt (lines 471–473), so request ordinals
are Attempt-scoped. `workbench/src/inspect-v1.ts::inspectPausedRunV1B()` instead
flattens every Run-wide `provider_request_reserved` event and requires its
ordinal to equal the global array index plus one (lines 92–93). It also requires
every prior reservation and commit to carry the paused child Attempt identity
(lines 100 and 143–146).

**Independent counterexample.** The audit terminalized the first A and B cells,
then ran the C cell with a failed initial Verifier and a child Attempt. The
child's request 1 committed; child request 2 was reserved and deliberately
paused as genuine usage unknown. The Producer retained the pending request-2
reservation and conservative charge. Inspector returned:

```json
{
  "integrity_valid": false,
  "pause_integrity_valid": false,
  "errors": [
    "paused Provider request ordinal sequence drift",
    "provider reservation write-before-dispatch identity/order drift",
    "post-reservation provider request transition is not exact ordinal transition",
    "V1-C paused Provider commit identity/order drift"
  ]
}
```

Evidence:
`.runs/v1-c/audit/candidate-worktree-e021662e/.runs/v1-c/audit/probes/child-attempt-unknown-usage-result.json`.

**Impact.** A legal real C recovery that encounters unknown usage in its child
would be paused by the Producer but rejected by the Inspector and aggregate.
The full Pilot therefore is not ready for every Contract-permitted C path.

**Smallest correction.** Reconstruct reservations and request ordinals per
Attempt. Validate completed prior Attempts independently, validate the final
pending reservation against the active paused Attempt, and recompute Run-wide
known plus conservative usage across both scopes without weakening exact
identity/order checks.

**Required regression.** Preserve the audit's initial-fail → C-child → child
request-2 unknown-usage case. Require Inspector integrity true, pause integrity
true, terminal/comparable false, no child Verifier after the pause, exact child
ordinal 2, and the full final reservation charge. Add cross-Attempt identity,
ordinal, missing-commit and coherent-rehash negatives.

### P1-002 — terminal Inspector accepts coherently rehashed Journal sequence drift

**Contract boundary.** Missing/duplicate/out-of-order Journal detection and
coherent-rehash resistance for terminal/comparable evidence.

**Fact.** The paused path checks `event.seq === index + 1` in
`workbench/src/inspect-v1.ts::inspectPausedRunV1B()` line 82. The terminal path
`validateRuntimeDiagnosticsV1C()` parses only `type` and `data` at line 255 and
checks selected event indices at lines 275–287; it never validates terminal
Journal envelope sequence numbers.

**Independent counterexample.** From a valid V1-C terminal Run, the audit set
the first Journal event's `seq` to `999`, recomputed the Journal ArtifactRef,
terminal-evidence digest and terminal marker references, then inspected the
Run. Inspector returned `integrity_valid: true`, `terminal_valid: true` and
`comparable: true` with no errors.

Evidence:
`.runs/v1-c/audit/candidate-worktree-e021662e/.runs/v1-c/audit/probes/terminal-seq-result.json`.

**Impact.** The Inspector can accept a coherently rebound terminal Journal that
violates its append-only sequence contract. The existing stop/commit tests do
not establish the Prompt's complete missing/duplicate/wrong-order guarantee for
terminal evidence.

**Smallest correction.** Validate every terminal Journal envelope's schema and
contiguous sequence before semantic checks, and enforce the minimal terminal
event grammar needed by this Candidate: Run/Attempt start, per-Attempt
reservation/commit, local-stop record/consume, Attempt settled, Verifier and
terminal disposition ordering.

**Required regression.** Coherently update every downstream digest/reference
after injecting a bad sequence, missing critical event, duplicate critical
event and reordered critical event; all must be rejected. Preserve the current
positive local-stop and genuine-unknown cases.

### P1-003 — unusable Stage 2 authority is rejected after Pilot-root materialization

**Contract boundary.** Stage 2 authority must fail closed before Pilot-root or
credential side effects.

**Fact.** `workbench/src/product-surface-v1.ts::runNextV1B()` rejects an absent
authority and wrong authority/profile names at lines 111–114, but it does not
validate `authorized: true` or resolver availability. It initializes a new
Pilot at line 117. Only afterward does
`workbench/src/pilot-v1.ts::runNextPilotCellV1B()` call
`realAuthority.assertAvailable()` at line 141.

**Independent counterexample.** The audit supplied an otherwise well-formed
Stage 2 authority with `authorized: false` to a sentinel-baseline V1-C Canary
Manifest. The call threw `FixedProviderBoundaryErrorV1B` and performed zero
credential reads, but the real-identity Pilot root already existed with its
Manifest/ledger structure.

```json
{"credential_reads":0,"pilot_root_exists":true}
```

Evidence:
`.runs/v1-c/audit/candidate-worktree-e021662e/.runs/v1-c/audit/probes/unauthorized-authority-result.json`.

**Impact.** An unusable authority can mutate the write-once execution namespace
before authorization is proven. This violates the explicit MR-001 pre-side-
effect Gate and can consume or strand a future Canary/Pilot root even though no
Provider access occurs.

**Smallest correction.** Prove the concrete one-Run authority is available
before `initializePilotV1B()` and before any replacement/identity claim that is
not itself the intended authorization proof. Do not resolve the credential at
preflight.

**Required regression.** For `authorized: false` and for a missing resolver,
require sanitized failure, zero credential reads and no Pilot root. Preserve
the existing absent-authority, Stage-1-rejects-Stage-2 and valid zero-call
preflight cases.

## 4. Risk-question conclusions

### A. Budget-stop attribution and accounting

- **Fact — pass:** the typed local request-cap stop is recorded inside
  `before_provider_request` before pinned Pi calls `models.streamSimple()`;
  pinned Pi source is
  `.upstream/pi/packages/agent/src/harness/agent-harness.ts::createStreamFn()`.
- **Fact — pass for terminal local stops:** consumption is bound to exact
  Run/Attempt/Session/Workspace/Attempt-scoped ordinal, requires no pending
  reservation and is single-use in the tested path.
- **Fact — pass:** a local stop adds no Provider request, token or cost; Pi's
  synthetic failure is not committed as a Provider response.
- **Fact — Producer pass / Inspector fail in one legal topology:** genuine
  unknown usage retains the pending reservation and full conservative charge,
  but P1-001 rejects that valid evidence when it occurs in a C child Attempt.

### B. Settled, Verifier and treatment boundary

- **Fact — pass:** local cap stops reach Pi `settled`; the common external
  Verifier runs afterward; runtime diagnostics and formal Outcome remain
  separate.
- **Fact — pass:** A/B terminal task semantics, B/C initial-payload equality,
  common Verifier use and C-only recovery eligibility remain intact in the
  positive regressions.
- **Fact — pass:** V1-B schema/identity stays legacy and rejects V1-C events;
  accepted V1-B evidence, reports and closeout semantics were not changed.
- **Fact — blocked readiness:** P1-001 prevents trustworthy inspection of a
  legal C-child pause, so the complete treatment path is not yet audit-ready.

### C. MR-001 Manifest readiness

- **Fact — pass:** Stage 1, Canary and full Pilot have disjoint experiment,
  role, cell and Run namespaces and are validated by role-specific complete
  reconstruction equality.
- **Fact — pass:** Canary is exactly one `v1-parse-duration` A/baseline cell,
  USD 0.10, zero children. Full Pilot is exactly 4 tasks × 2 repetitions × 3
  arms, 24 cells, USD 1.90 and at most 8 children.
- **Fact — pass:** current source digest, authority/mode, membership, namespace,
  budget and nonzero lowercase 40-hex Execution Baseline hybrids are rejected;
  the final Execution Baseline value is not hardcoded.
- **Fact — pass:** public preflight is zero-call; absent Stage 2 authority and
  Stage 2 authority supplied to Stage 1 fail before Pilot-root and credential
  effects.
- **Fact — fail:** P1-003 shows a present but unusable Stage 2 authority is not
  rejected until after Pilot-root materialization.
- **Fact — pass:** V1-C does not require V1-B replacement-sequence authority and
  does not add a general sequence platform.

### D. Evidence and integrity

- **Fact — paused-path partial pass:** the tested initial-Attempt pause path
  rejects missing, duplicate, reordered, wrong identity/ordinal and coherent
  counter rehashes.
- **Fact — fail:** P1-001 shows its reconstruction is not Attempt-aware for a
  child pause; P1-002 shows terminal Journal coherent sequence rehash is
  accepted.
- **Fact — pass:** tracked evidence stores no credential, raw Provider
  response/error/stack, prompt payload or reasoning. The Candidate contains
  only the expected 9 files; Pi, Contract, `CURRENT_STATE.md` and accepted
  V1-B evidence are unchanged.

## 5. Commands, exit codes and counts

| Command | Context | Exit | Result |
|---|---|---:|---|
| Eight Gate A identity/status commands from the Start Prompt | audit worktree / registered Pi paths | 0 each | exact identities; clean |
| `node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | initial Codex worktree | 1 | dependency projection absent; compiler did not start |
| `node --test tests/v1c-budget-stop.test.ts` | initial Codex worktree | 1 | module-load failure; 0 Candidate cases executed |
| `node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts` | initial Codex worktree | 1 | module-load failure; 0 Candidate cases executed |
| exact strict TypeScript command | exact detached Candidate audit copy with existing ignored dependency projections | 0 | pass |
| exact focused V1-C command | same exact Candidate copy | 0 | 10/10 pass |
| exact V1-B regression command | same exact Candidate copy | 0 | 31/31 pass |
| `git diff e021662e...^ e021662e... --check` | audit worktree | 0 | pass |
| `node --test ../.runs/v1-c/audit/focused-negative-probes.test.ts` | exact Candidate copy | 0 | 3/3 defect reproductions passed as assertions |
| Candidate/protected delta and SHA checks | audit worktree | 0 | exactly 9 Candidate paths; protected delta 0 |

The first three exit-1 results are retained because the Prompt's relative
dependency paths were not projected into this Codex worktree. No install was
performed. The audit created an exact detached Candidate copy under the allowed
ignored audit root, verified its SHA/tree/clean state, and projected only the
already-existing local dependency directories there before rerunning the exact
commands.

## 6. Zero-access attestation and remaining limits

**Fact.** This Audit Session read no `.env` or credential value, made no
external network request, made no Provider/model call, installed no dependency,
modified no Pi checkout, and did not run a Canary or full Pilot. All injected
routes were deterministic Faux/test-only routes; every observed credential-read
counter was zero.

**Fact.** The Audit Session did not repair source/tests/fixtures/Manifest,
modify `CURRENT_STATE.md` or another control file, stage or commit, accept the
Goal, or enter V2.

**Unconfirmed.** Real Provider behavior, real Canary validity and the full
A/B/C comparison remain untested and unauthorized by this audit.

## 7. Disposition

`NEEDS_BOUNDED_CORRECTION`

Only P1-001 through P1-003 and their stated regressions should return to the
original Implementation Session. A fresh re-audit should cover those findings,
the V1-C 10/10 suite, V1-B 31/31 suite, strict TypeScript, Candidate
`diff --check`, exact identity and zero-access checks. No Execution Baseline,
credential/network authority, real Canary, full Pilot or V2 work is justified
until that re-audit passes.
