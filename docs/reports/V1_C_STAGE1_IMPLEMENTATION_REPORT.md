# V1-C Stage 1 Implementation Report

```yaml
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
stage: stage_1_zero_real_call_implementation
session_role: dedicated_v1_c_stage_1_implementation_session
report_date: 2026-08-05
correction_id: V1_C_MR_001_REAL_MANIFEST_READINESS
control_baseline_commit: 016006e72e5baf4f558f1f63f1ffafcf122e119c
control_baseline_tree: 87704958ee787d804a9848b607293de411c532ef
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
recommended_disposition: PASS_STAGE_1_CANDIDATE
candidate_commit: null
independent_audit: not_started
real_model_calls: 0
real_provider_calls: 0
credential_reads: 0
external_network_calls: 0
```

## 1. Disposition

- **Fact:** Gate A identity and authority checks passed before source changes. Project HEAD/tree exactly matched the accepted control baseline; the project and pinned Pi checkout were clean.
- **Fact:** The bounded correction and deterministic evidence required by Gates B-H are present in the working tree. No files were staged or committed.
- **Fact:** Main Session's first limited review accepted the budget-stop mechanism and identified `V1_C_MR_001_REAL_MANIFEST_READINESS` as a Candidate-freeze blocker. The original Implementation Session completed that bounded correction without changing the accepted runtime core.
- **Recommendation:** Main Session may review the delta and, if accepted, create the frozen Candidate Commit and dispatch a fresh focused independent Audit Session.
- **Unconfirmed:** No independent audit, Candidate Commit, audited Execution Baseline, real Canary, or full Pilot has occurred. This report does not accept or close V1-C.

## 2. Gate A — identity, reading, and authority

The Session completed the Contract-required read order, including the active Contract, Charter, governance rules, V1-C research, V1-B/V1 closeouts, amendment, ADR, relevant plan sections, and both applicable Pi `AGENTS.md` files before inspecting their checkouts.

| Check | Observed result |
|---|---|
| `git rev-parse HEAD` | `016006e72e5baf4f558f1f63f1ffafcf122e119c` |
| `git show -s --format=%T HEAD` | `87704958ee787d804a9848b607293de411c532ef` |
| Project tracked status before implementation | clean |
| `CURRENT_STATE.md` active goal | exact V1-C goal |
| Formal Contract status | `accepted_activated_stage_1_not_started` |
| Primary Pi checkout | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| Registered run Pi checkout | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| Granted real-call authority | none |

- **Fact:** Read-only reference material did not affect tracked-clean status and was not modified.
- **Fact:** No authority existed for credentials, network, dependency installation, Pi edits/private imports, Git commits, control-state edits, Canary/Pilot execution, or V2.

## 3. Gate B — tracked zero-call reproduction

The new regression first runs the accepted legacy V1-B protocol with one Faux Provider response, then rejects request ordinal 2 before dispatch because the request cap is exhausted.

- **Fact:** Pi emits its synthetic assistant failure and reaches its terminal event path.
- **Fact:** The legacy Workbench path attempts Provider accounting without a pending reservation and produces `invalid_or_unknown_usage_after_provider_response`.
- **Fact:** The reproduction uses only the injected Faux route; its real-access counters remain zero.
- **Inference:** This deterministically establishes the Contract defect boundary without relying on unredacted failure text or a real Provider.

## 4. Gates C-E — correction semantics and accounting

The implementation adds the protocol `v1c_typed_predispatch_budget_stop_v1` and a typed, non-secret local stop signal. The signal binds:

- Run, Attempt, Session, Workspace, and request ordinal;
- the rejected transition from the current budget snapshot to the requested reservation;
- `before_provider_request`, `provider_requests_max`, and a single-consumption flag.

The hook records the signal before throwing a sanitized local exception. A synthetic assistant failure is attributable to the local stop only when there is no pending reservation and every binding matches. Consumption is single-use. The attributable message does not call `commitProvider()` and does not increment Provider requests, tokens, or cost.

When a reservation is pending, the local-stop branch is unavailable. Unknown usage remains fail-closed, nonterminal, and noncomparable, with the full pending reservation charged.

### Budget / stop / settled / Verifier trace matrix

| Case | Provider accounting | Typed stop | Pi state | Verifier | Formal result |
|---|---|---|---|---|---|
| V1-C pass | 1 request, 1227 tokens, USD 0; denied ordinal 2 adds zero | recorded then consumed once at ordinal 2 | `settled` precedes Verifier | common Verifier `passed` | terminal `task_pass` |
| V1-C fail | 1 request, 1188 tokens, USD 0; denied ordinal 2 adds zero | recorded then consumed once at ordinal 2 | `settled` precedes Verifier | common Verifier `failed` | terminal `task_fail` |
| Genuine unknown usage | known request 1 plus pending reservation at ordinal 2 | none | paused before Verifier | not run | nonterminal/noncomparable `invalid_or_unknown_usage_after_provider_response` |
| Genuine unknown charge | known 1227 tokens + pending 64309 tokens | none | paused | not run | charged total 2 requests, 65536 tokens, USD 0.10 |

- **Fact:** Runtime diagnostics are stored separately from formal Outcome fields and contain typed identifiers/counters only.
- **Fact:** Persisted V1-C evidence does not store raw Pi error text, raw Provider response, stack, prompt payload, reasoning, or secrets.
- **Fact:** The common external Verifier executes only after the `settled` evidence event for both pass and fail cases.
- **Fact:** The fail case is a formal Verifier failure, not a runtime diagnostic failure.

## 5. Gates F-G — Inspector and treatment boundary

The Inspector now validates the complete typed-stop journal chain, exact identity and ordinal binding, record-before-consume ordering, consume-before-settled ordering, settled-before-Verifier ordering, absence of a reservation at the denied ordinal, and exact Provider commit/accounting totals.

Deterministic negative cases reject:

- duplicate consumption;
- wrong Run;
- wrong request ordinal;
- reordered consumption;
- forged transition phase;
- coherently changed request, tool, token, or cost counters;
- missing pending-reservation evidence in the genuine unknown-usage path.

V1-B evidence remains on the legacy protocol and is rejected if V1-C events or diagnostics are injected. V1-C now has three legal, completely reconstructed identities: Stage 1 deterministic template, future real Canary, and future full Pilot. Rehashed membership, namespace, budget, authority, mode, role, protocol, source-digest, and Execution-Baseline hybrids are rejected.

The A/B/C regression creates a single fairness block:

| Arm | Planned | Started | Terminal | Comparable | Passed | Failed |
|---|---:|---:|---:|---:|---:|---:|
| A | 8 | 1 | 1 | 1 | 1 | 0 |
| B | 8 | 1 | 1 | 1 | 0 | 1 |
| C | 8 | 1 | 1 | 1 | 1 | 0 |

- **Fact:** B/C initial payloads are byte-equal; A/B differ only by the frozen public Skill treatment.
- **Fact:** All arms use the same external Verifier route.
- **Fact:** Only C is recovery-eligible. The regression observed one eligible, started, and successful C child.
- **Fact:** The deterministic V1-C manifest remains explicitly a Stage 1 template and cannot be used as a real Canary or Pilot identity. Separate future builders produce isolated Canary and full-Pilot shapes.

### V1_C_MR_001_REAL_MANIFEST_READINESS

- **Fact:** `buildRealCanaryExecutionManifestV1C()` accepts a future Main-supplied nonzero 40-hex Execution Baseline Commit and constructs exactly one `v1-parse-duration` Arm A/baseline cell in the `v1c-canary-*` namespace. Its initial and aggregate cap is 8 Provider requests, 12 tools, 65,536 tokens, 300 seconds, USD 0.10, one Verifier, and zero children.
- **Fact:** `buildFullPilotExecutionManifestV1C()` accepts the same kind of future baseline input and reconstructs the frozen 4-task × 2-repetition × 3-arm order in the disjoint `v1c-full-pilot-*` namespace, with initial request cap 8, at most eight children, and USD 1.90 Pilot cap.
- **Fact:** Both real templates use `stage2_real`, `real_execution_authorized: true`, the V1-C control baseline, current Workbench source digest, and no retry, fallback, automatic replacement, or V1-B replacement-sequence authority.
- **Fact:** Complete reconstruction equality is selected by `identity_role`; the validator also requires the current source digest and a nonzero lowercase 40-hex Execution Baseline Commit.
- **Fact:** The existing public surface preflights both test-only real shapes with all real-call counters zero. Missing Stage 2 authority and Stage 2 authority supplied to Stage 1 both fail before Pilot-root creation or credential resolution.
- **Fact:** Tests use only sentinel commit `1111111111111111111111111111111111111111`. No final real Manifest fixture, final Manifest ID, Candidate Commit, accepted Canary result, or full-Pilot authorization was materialized.
- **Recommendation:** Main Session should perform a narrow review of MR-001 before Candidate freeze.

## 6. Source delta

No file was changed merely to exhaust the allowlist.

| Path | Delta | Purpose |
|---|---:|---|
| `workbench/src/contracts/v1-types.ts` | +49/-5 | Additive V1-C protocol, typed stop/diagnostic schema, and three isolated identity roles |
| `workbench/src/experiment/v1.ts` | +97/-0 | Stage 1 plus parameterized future Canary/full-Pilot builders and complete reconstruction validation |
| `workbench/src/inspect-v1.ts` | +65/-11 | Typed-stop, multi-request accounting, ordering, tamper, and V1-B history boundary checks |
| `workbench/src/pi/pi-run-handle-v1.ts` | +71/-9 | Pre-dispatch typed stop record/consume boundary and exact Provider accounting |
| `workbench/src/pilot-v1.ts` | +3/-1 | Deterministic test scenario and request-ordinal plumbing |
| `workbench/src/run-v1.ts` | +17/-9 | Journal events, diagnostics, and deterministic Verifier scenario plumbing |
| `workbench/tests/v1c-budget-stop.test.ts` | new | Gates B-G plus MR-001 identity, tamper, preflight, and fail-closed deterministic tests |
| `docs/reports/V1_C_STAGE1_IMPLEMENTATION_REPORT.md` | new | This report |
| `docs/reports/V1_C_STAGE1_CLOSEOUT_DRAFT.md` | new | Main-review closeout draft |

MR-001 changed only `v1-types.ts`, `experiment/v1.ts`, the V1-C focused test, this report, the Closeout Draft, and the ignored Evidence Index. `workbench/src/product-surface-v1.ts`, the four accepted runtime-core files, V1-B tests, and all fixture manifests remained unchanged. Relative to the first reviewed working tree, MR-001 added 59 lines to `experiment/v1.ts`; the focused test grew from 170 to 239 lines.

Final correction source/test hashes are:

| Path | SHA-256 |
|---|---|
| `workbench/src/contracts/v1-types.ts` | `fbda8e2176eb9244fed5b39419089e7ffb0f44001b7f80d9750ca3998603f23c` |
| `workbench/src/experiment/v1.ts` | `48113307740502be05091438588d1faf236bcb364d41318701164fc38ea8c353` |
| `workbench/tests/v1c-budget-stop.test.ts` | `cbf68de5fa3eb92650bb6c381d2971b2db73e7ba8bc411c9b515b13dd7cd9faf` |

## 7. Commands and exit codes

Commands were run from the repository root unless a working directory is stated.

| Command | Exit | Result |
|---|---:|---|
| Gate A five identity/status commands from the Start Prompt | 0 | Exact project/Pi identities; clean initial statuses |
| `node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` (`workbench/`) — first run | 1 | Exposed one narrowing error and missing deterministic-scenario plumbing; corrected within allowlist |
| same strict TypeScript command — rerun | 0 | pass |
| `node --test tests/v1c-budget-stop.test.ts` (`workbench/`) — first run | 1 | 6/7; reproduction incorrectly expected zero Faux tokens; assertion corrected to preserve observed Provider usage |
| same focused test — rerun/final | 0 | 7/7 pass |
| `node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts` (`workbench/`) | 0 | 31/31 pass |
| `node --test --test-concurrency=1 tests/v1a-deterministic.test.ts tests/v0c-stage1.test.ts tests/v0c-post-audit-correction.test.ts tests/v0c-main-review-correction.test.ts` (`workbench/`) | 0 | 42/42 pass |
| `git diff --check;` strict TypeScript; focused V1-C test (`workbench/`) | 0 | formatting, typecheck, and 7/7 focused tests pass |
| allowlist/status and targeted secret/raw-persistence scans | 0 | 7/7 then-current paths allowed; scans returned no matches (`rg` exit 1 is the expected no-match result) |
| protected inventory/diff check | 0 | 352 protected entries; zero working-tree differences |
| final primary and registered-run Pi identity/status checks | 0 | both exact pinned commit and clean |
| MR-001 correction identity/core-hash precheck | 0 | exact project/Pi identity; four accepted core SHA-256 values recorded |
| MR-001 strict TypeScript (`workbench/`) | 0 | pass on first correction run |
| MR-001 focused V1-C (`workbench/`) | 0 | 10/10 pass; includes three readiness tests |
| MR-001 V1-B stage1 + CLI regressions (`workbench/`) | 0 | 31/31 pass |
| MR-001 final strict TypeScript plus `git diff --check` | 0 | pass |
| MR-001 final status/core-hash/control/Pi/secret/zero-access/fixture/Pilot-root check | 0 | no violation; secret and nonzero-access `rg` returned expected no-match exit 1 |

MR-001 exact verification commands:

```text
node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json
node --test tests/v1c-budget-stop.test.ts
node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts
git diff --check
git rev-parse HEAD
git show -s --format=%T HEAD
git status --short --untracked-files=all
git diff --cached --name-only
git -C D:\AI\AI_Projects\project2\.upstream\pi rev-parse HEAD
git -C D:\AI\AI_Projects\project2\.upstream\pi status --short
git -C D:\AI\AI_Projects\project2\.runs\v0-a\pi rev-parse HEAD
git -C D:\AI\AI_Projects\project2\.runs\v0-a\pi status --short
```

- **Fact:** Failures above are retained in the command history and are not hidden by the final passing results.
- **Fact:** Existing local dependency trees were referenced through ignored junctions; no package manager or install command was run, and no dependency/lockfile/package boundary changed.

## 8. Gate H integrity and zero-access proof

| Check | Result |
|---|---|
| Protected tracked inventory | 352 entries |
| Protected HEAD inventory SHA-256 | `06643824f2517fab0efca5fc4ee36d072bbcca07b430fe48d74773873f4d20fd` |
| Protected working-tree diffs | 0 |
| Staged paths | 0 |
| Secret-pattern scan | no match |
| Raw error/response/stack persistence scan | no match |
| Primary Pi identity/status | exact pinned commit, clean |
| Registered-run Pi identity/status | exact pinned commit, clean |
| MR-001 accepted-core hash mismatches | 0 |
| MR-001-created Pilot roots | 0 |
| Final Manifest fixture deltas | 0 |

- **Fact:** Every injected execution reported `credential_reads=0`, `network_calls=0`, `provider_calls=0`, and `model_calls=0`.
- **Fact:** No command in this Session read an environment credential, opened a transport, called a Provider/model, used external network, installed a dependency, or changed Pi.
- **Fact:** `CURRENT_STATE.md`, governance documents, accepted evidence, reference trees, manifests, package metadata, and Pi source remain unchanged.

## 9. Unverified items and Pause Conditions

- **Unconfirmed:** The correction has not been independently audited against a frozen Candidate Commit.
- **Unconfirmed:** The new builders establish only future Manifest readiness. No real Provider behavior, Canary outcome, or A/B/C Pilot result is established by Stage 1.
- **Unconfirmed:** Main Session has not accepted the implementation, frozen an Execution Baseline, or authorized later stages.
- **Recommendation:** Pause if Main review finds a protected-state difference, non-allowlisted delta, schema/history rewrite, raw sensitive persistence, accounting ambiguity, or a need to expand the Contract. Otherwise proceed only to Candidate freeze and focused independent audit.
- **Fact:** No Pause Condition was encountered by this Implementation Session.

## 10. CURRENT_STATE_UPDATE_PROPOSAL

This is a proposal only. The dedicated Session did not modify `CURRENT_STATE.md`.

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  apply_by: main_session_only
  goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
  active_goal: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
  proposed_stage_status: stage_1_implementation_candidate_ready_for_main_review
  recommended_disposition: PASS_STAGE_1_CANDIDATE
  control_baseline_commit: 016006e72e5baf4f558f1f63f1ffafcf122e119c
  implementation_worktree_committed: false
  candidate_commit: null
  independent_audit_status: not_started
  audited_execution_baseline: null
  real_canary_status: not_authorized_not_started
  full_pilot_status: not_authorized_not_started
  v1_c_accepted_or_closed: false
  v1_b_history_changed: false
  next_control_point: main_review_and_optional_candidate_commit
```
