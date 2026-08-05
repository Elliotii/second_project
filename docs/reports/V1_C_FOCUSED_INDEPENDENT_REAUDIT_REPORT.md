# V1-C Focused Independent Re-audit Report

```yaml
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
session_role: fresh_independent_reaudit
reaudit_date: 2026-08-05
reaudit_disposition: PASS_FOCUSED_REAUDIT
control_baseline_commit: 016006e72e5baf4f558f1f63f1ffafcf122e119c
rejected_candidate_commit: e021662e2f4b6d2721f9b0378ac2efa64b706963
corrected_candidate_commit: 962b42a281d3092f0faf399b9f6f1ecaa0212f31
corrected_candidate_tree: d828f9fdb23c7099cdb1e4d5a993ff5579422dd4
corrected_candidate_parent: e021662e2f4b6d2721f9b0378ac2efa64b706963
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
p0_findings: 0
p1_findings: 0
p2_findings: 0
p3_findings: 0
credential_reads: 0
external_network_calls: 0
real_provider_calls: 0
real_model_calls: 0
source_test_fixture_edits: 0
control_state_edits: 0
git_stage_or_commit: 0
real_canary_or_full_pilot: 0
v2_entered: false
```

## 1. Disposition

- **Fact:** The corrected Candidate is the exact immutable commit/tree/parent above. The project was tracked-clean and staged-clean at Gate A. Both registered Pi checkouts were clean at the pinned commit.
- **Fact:** Main Session resolved the original start prompt's “9 files” statement as `PROMPT_COUNT_TYPO_ONLY`. The authoritative Control-Baseline-to-Candidate delta is exactly the 10 allowlisted files in section 2. No Candidate change followed from that clarification.
- **Fact:** P1-001, P1-002, P1-003 and Main P1-001R are independently closed by source inspection, the mandatory 44 tracked tests, and 3 audit-local negative probes.
- **Fact:** Strict TypeScript and the corrected-commit whitespace check pass.
- **Fact:** No P0, P1, P2 or P3 finding remains within this re-audit scope.
- **Recommendation:** Main Session may accept the corrected Candidate for Gate J and decide the separately controlled audited Execution Baseline. This report does not create that baseline and does not authorize a Canary or full Pilot.
- **Unconfirmed:** Real Provider behavior, real Credential resolution, the real Canary and the full A/B/C Pilot remain untested and unauthorized.

Final disposition: `PASS_FOCUSED_REAUDIT`.

## 2. Gate A identity and source delta

| Check | Observed result |
|---|---|
| Corrected Candidate SHA | `962b42a281d3092f0faf399b9f6f1ecaa0212f31` |
| Corrected Candidate tree | `d828f9fdb23c7099cdb1e4d5a993ff5579422dd4` |
| Corrected Candidate parent | `e021662e2f4b6d2721f9b0378ac2efa64b706963` |
| Project tracked/staged status at Gate A | clean / clean |
| Primary Pi | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| Registered-run Pi | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| Rejected-to-corrected delta | exactly 5 expected files |
| Control-Baseline-to-corrected delta | exactly 10 Main-bound allowlisted files |

The exact 10-file Stage 1 delta is:

1. `docs/reports/V1_C_STAGE1_CLOSEOUT_DRAFT.md`
2. `docs/reports/V1_C_STAGE1_IMPLEMENTATION_REPORT.md`
3. `workbench/src/contracts/v1-types.ts`
4. `workbench/src/experiment/v1.ts`
5. `workbench/src/inspect-v1.ts`
6. `workbench/src/pi/pi-run-handle-v1.ts`
7. `workbench/src/pilot-v1.ts`
8. `workbench/src/product-surface-v1.ts`
9. `workbench/src/run-v1.ts`
10. `workbench/tests/v1c-budget-stop.test.ts`

The correction commit itself changes only the two Stage 1 reports, `inspect-v1.ts`, `product-surface-v1.ts`, and the focused V1-C test.

## 3. Finding dispositions

### P1-001 — Attempt-aware paused evidence: resolved

**Source evidence.** `workbench/src/inspect-v1.ts::inspectPausedRunV1B()` reconstructs one or two `attempt_started` records, verifies lineage, groups reservations by exact Attempt, restarts request ordinals at 1 per Attempt, and retains Run-wide external/commit accounting. Reservation and commit matching includes Run, Attempt, Session, Workspace, request ordinal and reservation ID. Prior Attempts require one `attempt_settled` followed by one `verifier_completed`; the active paused Attempt rejects settled/Verifier evidence when a reservation is pending.

**Positive evidence.** `workbench/tests/v1c-budget-stop.test.ts` produces initial C failure, child request 1 commit, then child request 2 unknown-usage pause. Inspection is integrity-valid and pause-valid, terminal/comparable false, child ordinal 2, no child Verifier, and the pending reservation is charged in full.

**Negative evidence.** The same test coherently mutates wrong Attempt, ordinal drift, missing commit and cross-Attempt rebinding; all are rejected. The mandatory focused suite passes 13/13.

**Impact.** The legal Contract-permitted C-child pause is reconstructible without weakening identity, ordinal, one-to-one commit or fail-closed charge checks.

### P1-001R — prior/active Attempt Provider-event boundaries: resolved

**Source evidence.** `workbench/src/inspect-v1.ts::inspectPausedRunV1B()` requires each prior Attempt's reservation, commit and local-stop events to be strictly inside its `attempt_started..attempt_settled` interval. Active paused Attempt Provider/local-stop events must be strictly inside `attempt_started..attempt_paused`. The existing `settled < Verifier < next Attempt start` rule remains enforced.

**Tracked evidence.** The focused mutation `prior-provider-after-verifier` moves a prior reservation/commit after settled/Verifier, repairs every sequence/digest/reference, and is rejected.

**Independent evidence.** `.runs/v1-c/reaudit/focused-negative-probes.test.ts` builds a legal two-Attempt terminal C path containing prior-Attempt typed local-stop events, moves those events after settled/Verifier, coherently rehashes all dependent terminal evidence, and confirms Inspector rejection. Probe passes 1/1.

**Impact.** A coherent rehash cannot relocate prior or active Provider/local-stop facts outside the Attempt phase that owns them.

### P1-002 — terminal Journal integrity: resolved

**Source evidence.** `workbench/src/inspect-v1.ts::validateJournalEnvelopes()` requires every physical envelope to have `schema_version === 1` and `seq === index + 1`. `validateTerminalJournalStructure()` requires one start, settled and Verifier per terminal Attempt in order; binds Provider/stop events inside their Attempt; and requires exactly one `run_terminal|run_invalid` matching the terminal disposition as the final physical event.

**Tracked evidence.** Coherently rebound bad sequence, missing settled, duplicate Verifier and settled/Verifier reorder variants are all rejected. Normal terminal pass/fail, typed local-stop diagnostics, and the frozen V1-B terminal paths remain valid in the 13 V1-C and 31 V1-B passing tests.

**Independent evidence.** The audit-local probe changes a terminal Journal envelope to `schema_version: 2`, repairs the Journal ArtifactRef, terminal-evidence ref and terminal marker, and confirms rejection. Probe passes 1/1.

**Impact.** Coherent downstream rehashing no longer hides physical envelope or minimal critical-event grammar violations.

### P1-003 — authority before side effects: resolved

**Source evidence.** `workbench/src/product-surface-v1.ts::runNextV1B()` loads and validates the Manifest, rejects Stage 2 authority supplied to Stage 1, requires authority for Stage 2, and for V1-C requires the exact authority/profile identity, `authorized === true`, and a resolver before replacement claiming, Pilot initialization, Run namespace creation or credential resolution. The resolver is not called by this preflight check. Credential resolution remains inside `createPiRunHandleV1()::createRealHarness()` after genuine run execution begins.

**Tracked evidence.** Absent authority, `authorized:false`, missing resolver, Stage 1 supplied Stage 2 authority and zero-call preflight all fail or pass at their intended boundaries with no Pilot root and zero credential reads. Frozen V1-B lazy-authority tests remain green.

**Independent evidence.** The audit-local probe supplies V1-C Stage 2 authority/profile identity mismatches. Both return the sanitized fixed-boundary error, invoke no resolver and create no Pilot root. Probe passes 1/1.

**Impact.** Unusable V1-C Stage 2 authority cannot consume or strand a write-once Pilot/Run namespace before authorization is proven.

## 4. Preserved Stage 1 boundary

- **Fact:** `workbench/src/experiment/v1.ts` keeps Stage 1, one-cell real Canary and 24-cell full Pilot identities, roles, namespaces, memberships and budgets disjoint and selected by complete reconstruction equality.
- **Fact:** The Canary remains one Arm-A `v1-parse-duration` cell with request/tool/token/time/cost caps `8/12/65536/300s/USD0.10` and zero children.
- **Fact:** The full Pilot remains 4 tasks × 2 repetitions × 3 arms, 24 cells, at most 8 children and USD 1.90, with no retry, fallback or automatic replacement.
- **Fact:** `workbench/src/pi/pi-run-handle-v1.ts` still records the typed local cap stop before hook failure, prevents synthetic failure from committing Provider usage, preserves genuine unknown-usage pending reservation/full charge, and permits the Pi path to reach `settled`.
- **Fact:** `workbench/src/run-v1.ts` still runs the common external Verifier after settled and keeps runtime diagnostic separate from formal pass/fail Outcome. Only C remains recovery-eligible after an initial failed Verifier.
- **Fact:** V1-B uses its frozen legacy schema/history path. The 31 V1-B regressions pass and no accepted V1-B evidence or conclusion was modified.

## 5. Verification commands, exit codes and counts

Commands were executed from `workbench/` unless stated otherwise.

| Command | Exit | Result |
|---|---:|---|
| Nine Gate A identity/status commands | 0 each | exact Candidate/tree/parent and clean project/Pi identities |
| Candidate correction/full-delta allowlist comparison | 0 | correction 5 files; complete Stage 1 delta exactly 10 allowlisted files |
| `node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` — first run | 2 | stopped before compilation: Workbench dependency projection absent |
| `node --test tests/v1c-budget-stop.test.ts` — first run | 1 | module-load failure; 0 Candidate cases executed |
| `node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts` — first run | 1 | module-load failure; 0 Candidate cases executed |
| same strict TypeScript command after authorized ignored junctions | 0 | pass |
| same focused V1-C command after junctions | 0 | 13/13 pass, 0 fail/skip |
| same V1-B regression command after junctions | 0 | 31/31 pass, 0 fail/skip |
| `git diff e021662e2f4b6d2721f9b0378ac2efa64b706963 962b42a281d3092f0faf399b9f6f1ecaa0212f31 --check` | 0 | pass |
| `node --test focused-negative-probes.test.ts` from `.runs/v1-c/reaudit/` | 0 | 3/3 pass, 0 fail/skip |

The first three environment failures are retained. The compiler/tests did not reach Candidate logic because this Codex worktree lacked local dependency projections. The re-audit created only the two Prompt-authorized ignored junctions:

```text
workbench/node_modules
  -> D:/AI/AI_Projects/project2/workbench/node_modules

.runs/v0-a/pi/node_modules
  -> D:/AI/AI_Projects/project2/.runs/v0-a/pi/node_modules
```

Both targets existed before projection. No package manager, installer, download or dependency modification was used.

## 6. Audit-local evidence and tracked Source Delta

Audit-local ignored evidence is confined to:

```text
.runs/v1-c/reaudit/
```

It contains the independent negative-probe source, sentinel Manifest and generated test-only evidence roots. None is a final Canary/Pilot identity.

The re-audit's tracked Source Delta is exactly:

```text
docs/reports/V1_C_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md
```

No tracked source, test, fixture, Manifest, Prompt, Skill, Verifier, Provider, Pi, Contract, `CURRENT_STATE.md` or governance file was edited or staged.

## 7. Zero-access attestation and limits

- **Fact:** This Session read no `.env` or Credential value.
- **Fact:** This Session made zero external network calls, zero real Provider calls and zero real model calls.
- **Fact:** All execution used deterministic Faux/test-only paths. Resolver counters observed by the authority probes remained zero.
- **Fact:** No dependency was installed or downloaded; neither Pi checkout was modified.
- **Fact:** No real Canary/full Pilot was run or materialized, no source/test/fixture/control state was repaired, and no Git stage or commit occurred.
- **Fact:** V1-B history remained immutable and V2 was not entered.
- **Unconfirmed:** A legal real authority's Credential-resolution/Provider path was intentionally not triggered. Its behavior remains a future separately authorized Canary concern.

## 8. Final disposition

`PASS_FOCUSED_REAUDIT`

The corrected Candidate closes P1-001, P1-002, P1-003 and P1-001R within the authorized focused scope. This Session stops here for Main Session and user acceptance.
