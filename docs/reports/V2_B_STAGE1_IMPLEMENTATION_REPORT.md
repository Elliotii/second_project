# V2-B Stage 1 Thin Real Composition — Correction 2 Implementation Report

Date: 2026-08-07
Goal: `V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE`
Stage: `stage_1_zero_real_access_thin_real_composition`
Correction: second Main-requested bounded correction after `CONTINUE_BOUNDED` Complexity Checkpoint
Recommendation: `PASS_V2_B_STAGE1_THIN_REAL_COMPOSITION`

## 1. Outcome and claim boundary

**Fact:** The first and second bounded Main review dispositions are addressed inside the original
Contract §10.2 allowlist. Correction 2 changes no architecture, Contract scope, Case set, treatment,
budget, Selector, or evidence identity policy. The accepted V2-A Controller remains the only recovery
Controller.

**Fact:** The corrected product surface freezes a typed three-Case Stage 2 Execution Manifest,
performs read-only Gate H preflight, advances one append-only sequence step, terminalizes or Pauses,
and independently inspects the complete sequence. After Main binds the future Candidate/Execution
Baseline and immutable Manifest, a fresh no-source-edit Stage 2 Session can use the tracked CLI.

**Fact:** This Session made zero Credential reads, zero network calls, zero external Provider calls,
zero real-model calls, and incurred USD 0. It did not invoke the real Stage 2 path.

**Recommendation:** Main may review this corrected candidate. Only Main may accept Stage 1, create a
Candidate/Execution Baseline, freeze the real Manifest, change control state, or hand off to a fresh
top-level Stage 2 Session.

**Unconfirmed:** Real Provider behavior, real-model recovery effectiveness, strategy superiority,
V2-B acceptance, and the V2 Version Question remain unproven.

## 2. Gate A identity

| Obligation | Command/evidence | Result |
|---|---|---|
| exact start HEAD | `git rev-parse HEAD` | `33b347abbd92dc1d1cba3511fd5e69b64c06027d`, exit 0 |
| exact start Tree | `git show -s --format=%T HEAD` | `b0900b0891bf177c6a5093e47c4affb7e1b20ea2`, exit 0 |
| clean dispatch state | initial status and cached diff | tracked/staged clean before implementation |
| top-level owner | task dispatch metadata | dedicated new top-level task; 0 subagents |
| pinned Pi | `git -C D:/AI/AI_Projects/project2/.upstream/pi ...` | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| control authority | `CURRENT_STATE.md` and Contract | V2-B active; Stage 1 zero-real access only |
| dependencies | existing pinned emitted Pi/TypeScript files | reused read-only; no install/copy/runtime substitution |
| real access | counters and conduct | all zero; cost USD 0 |

The Codex worktree does not materialize ignored `workbench/node_modules`. Verification therefore used
a process-local ESM resolver and TypeScript API path overrides pointing at the already-installed,
exact-pinned cache under `D:/AI/AI_Projects/project2/.runs/v0-a/pi`. No dependency tree or project
path was created or changed.

## 3. Correction disposition

### 3.0 Correction 2: zero-dispatch activation and complete sequence linkage

- A Primary port-construction, Credential, or pre-provider boundary can now persist a typed
  `CasePauseV2B` bound to the immutable Manifest, source digest, Execution Baseline, Case/Run,
  exact Attempt-start prefix, usage, and counters. Provider requests and network/Provider/model
  dispatch must all independently derive as zero before `contingency_eligible=true`.
- That evidence-valid Primary Pause remains in the ledger while only the already-predeclared
  Contingency becomes eligible. Post-dispatch, unknown-usage, budget-overrun, recovery-none, malformed,
  foreign, or tampered evidence cannot grant Contingency authority. If Contingency still produces no
  valid Positive, the sequence retains `positive_not_triggered`; no replacement is created.
- The sequence Inspector now proves exact per-Case transition order, no entry after terminal/Pause,
  one-to-one ordered ledger Attempt starts against persisted Run Attempt refs/IDs/roles, exact Case
  terminal/Pause ref arrays and hashes, and completed/paused status/reason from observed outcomes.
- Deterministic token/cost overflow injection now passes through `assertKnownUsageV1B`, records an
  observed known value greater than the reservation, and triggers the real over-reservation check.
  Conservative charging and non-release remain unchanged.

### 3.1 Frozen no-source-edit Stage 2 surface

- `ExecutionManifestV2B` binds exact Execution Baseline commit/tree, Pi commit, live Workbench source
  inventory/digest, frozen policy/profile/tool/Skill identities, exact budgets, and the predeclared
  Primary, conditional Contingency, and Negative Runs.
- `preflightExecutionManifestV2B` validates the Manifest digest, live source bytes, exact Git/Pi
  identities, and clean tracked/staged state before sequence mutation or port construction.
- `v2b-stage2 build-manifest|preflight|run-next|inspect` is the frozen tracked CLI. `run-next` requires
  explicit Stage 2 authority; construction and authority-denial tests resolve no Credential and create
  no sequence root.

### 3.2 Whole-sequence authority, activation, and budget

- `manifest.json` is write-once. `ledger.jsonl` is append-only and begins with all three planned Cases.
- Run/Case/Attempt IDs are deterministic and Manifest-bound. Duplicate Attempt IDs, foreign Runs,
  repetition, replacement, a third Case, nonterminal restart, and post-terminal advance fail closed.
- Contingency activates only after Primary valid initial pass or the Contract-authorized valid
  zero-dispatch stop; otherwise it is immutably skipped.
- Every started Attempt first appends its complete conservative Attempt reservation. Reservations are
  never released. A pure capacity guard enforces Group Attempt count and every sequence request, Tool,
  token, execution-time, Verifier, started-Attempt, and cost ceiling before a start.
- Terminal/paused ledger events link the Run terminal and reconcile actual usage and counters. Invalid,
  budget-stopped, and paused Attempts remain charged. No retry/fallback/replacement path exists.

### 3.3 Credential semantics

- `RunCredentialLeaseV2B` resolves the opaque Credential once per started Run, after preflight and the
  durable Attempt-start reservation. The lease is reused only by Primary/A/B composition inside that
  Run and is cleared on close.
- Each real Run must reconcile exactly one Credential read; deterministic proof Runs reconcile zero.
  The frozen three-Case sequence cap remains three reads.
- Tests used only an injected synthetic no-secret resolver. No environment Credential value was read.

### 3.4 Reservation overflow and terminalization

- Each Provider request reserves before dispatch. Known usage is validated and must not exceed its
  pending token/cost reservation.
- Unknown/missing usage and injected token/cost overflow terminalize fail-closed and retain the full
  reservation as conservative charge. Typed reasons distinguish `usage_invalid`, `usage_overflow`, and
  `budget_stopped`.
- Deterministic tests cover request and Tool caps, token and cost overflow, unknown usage, Group cap,
  every whole-sequence dimension, and paused aggregate reconciliation.

### 3.5 Evidence-safe payload identity

- `safeProviderProjectionV2B` redacts only Authorization/Credential/API-key/access-token/secret and
  reasoning/signature fields. Non-secret request-shape fields such as `max_tokens` remain.
- A `max_tokens` change changes the safe payload identity. Secret/reasoning/signature values never
  enter evidence, and the final canonical evidence scan has zero matches.

### 3.6 A/B fairness

- The V2-A Inspector still proves byte-identical failed Workspace/Seed inputs, immutable Failure Packet,
  recovery instruction, Skill, Tool Profile, Verifier, budget, Pi, Workbench source, candidate isolation,
  and exact continue/fresh Session lineage.
- V2-B adds common Provider, model, thinking, system prompt, Tool names/profile, and Attempt-cap identity.
  A and B must have the same `common_input_sha256` and `common_artifact_digest`.
- Provider payload hashes are individually evidence-bound but deliberately not required equal because
  the public Session histories legitimately differ. Parent Session history remains the only intended
  treatment difference.

## 4. Gate A–G trace

| Gate | Implementation | Positive proof | Negative/tamper proof | Result |
|---|---|---|---|---|
| A | frozen control/Pi/source identities | exact object checks | dirty/wrong baseline/Pi/source preflight | PASS |
| B | one Controller; public JSONL Session; real-shaped port | initial pass, A/B, dormant real construction | unauthorized/reused authority; resolver remains 0 | PASS |
| C | pre-dispatch reservations and typed usage | known usage and sequence reconciliation | real known-over-reservation, request/Tool/unknown/Group/sequence failures | PASS |
| D | immutable three-Case Manifest/ledger and Case Pause | initial-pass and exact zero-dispatch Contingency activation | post-dispatch/invalid/tampered activation; repeat/replacement/third Case | PASS |
| E | independent read-only Run/sequence Inspectors | canonical Runs, normal sequence, zero-dispatch sequence | missing/extra/wrong-role Attempt, transition, Case-ref, Pause/counter/provider tamper | PASS |
| F | strict and focused inherited regressions | all required bounded suites below | development/infrastructure failures disclosed | PASS |
| G | reports, corrected Index, delta and proposal | all deliverables present | no control-state/stage/commit mutation | PASS recommendation |

Gate H itself is not claimed. Stage 1 proves the frozen preflight/construction surface needed for a
future fresh Stage 2 Session.

## 5. Verification

| Command | Exit/result |
|---|---|
| strict TypeScript via pinned TypeScript API with exact public-package path overrides | 0; 0 diagnostics |
| `node --test tests/v2b-stage1.test.ts` with process-local pinned resolver | 0; 18 pass, 0 fail, 0 skipped |
| `node --test tests/v2a-recovery.test.ts tests/v2a-cli.test.ts tests/v2a-post-audit.test.ts` | 0; 11/11, 0 skipped |
| `node --test tests/v1b-stage1.test.ts tests/v1c-budget-stop.test.ts` | 0; 40/40, 0 skipped |
| `node --test --test-name-pattern "exposes preflight\|post-audit CLI requires" tests/v1b-cli.test.ts` | 0; necessary bounded V1 CLI 2/2, 0 skipped |
| `node --test tests/workspace.test.ts tests/v0b-verifier.test.ts tests/v0b-evidence.test.ts tests/v0b-inspect.test.ts` | 0; 18/18, 0 skipped |
| nine corrected canonical `v2b-stage1 run` plus matching `inspect` calls | 0; every Inspector valid, counters zero |
| deterministic normal and Primary-zero-dispatch sequence construction/advance/inspection | 0; both completed, 4 Attempts each; Pause preserved/eligible only in zero-dispatch route; counters zero |
| final identity/allowlist/protected/secret/diff bundle | 0; 14 changed, 0 outside, 0 protected, staged 0, Pi clean, scan 0 |

The necessary bounded V1 CLI proof passes 2/2. The earlier full-file diagnostic still records that two
legacy tests explicitly spawning children with `env:{}` cannot resolve the ignored dependency cache
from this worktree; it remains disclosed and is not counted as a final green command.

Development diagnostics and their nonzero exits—including the initial worktree-local npm path
failure, TypeScript API argument/path probes, focused test corrections, the quoted inline proof probe,
and the legacy CLI limitation—are retained in the corrected ignored Evidence Index. None caused
Credential, network, Provider/model, dependency-install, protected-file, or Git-control mutation.

## 6. Canonical corrected evidence

`.runs/v2-b/stage1/correction-2/evidence/` contains nine valid Run roots: initial pass, A selected, B
selected, selector none, request cap, unknown usage, token overflow, cost overflow, and Tool cap.

`.runs/v2-b/stage1/correction-2/sequence-normal/` and `sequence-zero-dispatch/` contain complete
deterministic Stage 2-shaped sequences. Both completed with four Attempts and all counters zero. The
normal route formed a Primary Seed and skipped Contingency. The zero-dispatch route preserved one
valid Primary Case Pause, independently inspected it before continuation, activated only Contingency,
then completed Positive plus Negative.

All earlier Stage 1 and correction-1 roots are preserved but superseded by `correction-2/**`.

## 7. Source delta and protected boundaries

Exactly 14 tracked/untracked paths differ, all in Contract §10.2:

- modified: `workbench/README.md`, `workbench/package.json`, `workbench/src/cli.ts`,
  `workbench/src/contracts/v2-types.ts`, `workbench/src/inspect-v2.ts`, `workbench/src/run-v2.ts`;
- added: `workbench/src/contracts/v2b-types.ts`, `workbench/src/inspect-v2b.ts`,
  `workbench/src/pi/pi-run-handle-v2b.ts`, `workbench/src/product-surface-v2b.ts`,
  `workbench/src/run-v2b.ts`, `workbench/tests/v2b-stage1.test.ts`, and these two reports.

`CURRENT_STATE.md`, `workbench/src/recovery/selector-v2.ts`, fixtures, accepted V0/V1/V2-A evidence,
Pi, `reference/**`, Charter/Contract/ADR/control files have no delta. No file is staged. No commit,
push, branch change, reset, real dispatch, or Stage 2 action occurred.

## 8. Unverified items

### Relevant Definition of Done mapping

| DoD | Stage 1 disposition |
|---|---|
| 1 | satisfied: accepted Contract and ordered Stage activation supplied by Main/user |
| 2 | Stage 1 half satisfied: new top-level Session, 0 subagents; fresh Stage 2 remains pending |
| 3 | satisfied: one accepted V2 Controller with an injected port; no copy |
| 4 | satisfied: direct public `AgentHarness` and caller JSONL Session route |
| 5 | satisfied: all Stage 1 real-access/cost counters zero |
| 6 | satisfied: typed authority/budget/usage/secret/Manifest/Inspector deterministic Gates |
| 7 | satisfied: V2-A 11/11, V1 provider/budget 40/40, V0 path/security 18/18; CLI limitation disclosed |
| 8–16 | not Stage 1 completion claims: real Execution Baseline, fresh preflight/execution/outcomes/reconciliation remain pending |
| 17 | satisfied for Stage 1 delta: no Pi patch/private import/SDK/Extension/RPC/third-party/worktree product feature; must remain true in Stage 2 |
| 18 | satisfied for this report: observed outcomes and limitations are retained without replacement or threshold change |
| 19–20 | Main/user V2-B and separate V2 dispositions remain pending |

- Candidate and Execution Baseline commits do not exist.
- Main has not accepted Stage 1 or frozen the real Execution Manifest.
- A fresh Stage 2 Gate H preflight has not run.
- No real Credential, network, Provider/model, real usage/cost, Positive/Negative outcome, or recovery
  effectiveness has been observed.
- V2-B final acceptance, DoD real-execution items, the Version Question, and V2 disposition remain open.
- Stage 1 proves application-path zero access from counters/stubs/commands, not OS-level egress blocking.

## 9. CURRENT_STATE_UPDATE_PROPOSAL

This is a proposal only. This Session did not edit `CURRENT_STATE.md`.

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  apply_by: main_session_only
  goal_id: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
  active_goal: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
  proposed_stage_status: stage_1_corrected_thin_real_composition_ready_for_main_review
  main_review_correction: 2
  recommended_disposition: PASS_V2_B_STAGE1_THIN_REAL_COMPOSITION
  control_baseline_commit: 33b347abbd92dc1d1cba3511fd5e69b64c06027d
  control_baseline_tree: b0900b0891bf177c6a5093e47c4affb7e1b20ea2
  candidate_commit: null
  execution_baseline_commit: null
  implementation_worktree_committed: false
  stage_1_real_access:
    credential_reads: 0
    network_calls: 0
    external_provider_calls: 0
    real_model_calls: 0
    real_cost_usd: 0
  stage_2_status: not_started_waiting_for_main_acceptance_frozen_manifest_and_gate_h
  v2_b_accepted_or_closed: false
  v2_version_question_answered: false
  next_control_point: main_review_candidate_freeze_execution_baseline_manifest_and_fresh_stage_2_handoff
```
