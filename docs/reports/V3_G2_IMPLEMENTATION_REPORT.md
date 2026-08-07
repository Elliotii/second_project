# V3 Goal 2 — Validate, Promote / Reject and Rollback Implementation Report

```yaml
date: 2026-08-08
goal_id: V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK
status: implementation_complete_pending_main_acceptance
recommended_disposition: PASS_V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK_PENDING_MAIN_ACCEPTANCE
execution_owner: dedicated_top_level_goal_2_implementation_session
control_baseline_commit: f138ddd607816f266e9024291718eeab087b39f6
control_baseline_tree: 69812fb30ad7c2ee286a60d0cef35be847189d5d
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pinned_pi_package_version: 0.82.1
credential_reads: 0
external_network_requests: 0
external_provider_calls: 0
real_model_calls: 0
pi_core_patches: 0
private_pi_imports: 0
sdk_extension_rpc_switches: 0
git_stage_or_commit: 0
```

## 1. Outcome and claim boundary

**Fact:** Goal 2 now has a deterministic/Faux `staged Candidate -> symmetric
validation -> Promote/Reject -> immutable accepted version -> atomic active
pointer -> rollback` path. The implementation does not activate the real Goal
1 Candidate; every exercised store and pointer is under an ignored, isolated
Goal-local root.

**Fact:** Base and Candidate arms begin from byte-identical but file-identity-
independent temporary Workspace copies. Both arms create a distinct public Pi
JSONL Session with the same frozen `fresh_both` policy and zero parent/history.
The execution port receives only its State and Workspace, not an independent
arm-selection flag. Task, instruction, Provider/model profile, Tool profile,
Verifier, regression set, budgets, hard constraints and Session policy share
one frozen common identity; State digest/entries are the treatment delta.

**Fact:** Promotion is Harness-owned and deterministic. External Verifier raw
output and frozen regression output are validated before correctness and the
predeclared structural/Tool/Provider vector are considered. Cost/time are not
Promotion inputs. The focused decision-table test covers Base-fail/Candidate-
pass, Base-pass/Candidate-fail, both fail, both-pass material improvement,
both-pass tie/no improvement, regression failure and fairness/authority
failure.

**Fact:** The project State store provides content-identified immutable
versions, write-once decisions, a monotonic binding revision, temp-plus-rename
active pointer replacement, compare-and-swap stale protection, reopen, pointer
rollback and fail-closed inventory/link/path/digest validation. Reject and
stale-reject decisions preserve exact active pointer bytes. Rollback creates a
new immutable decision and pointer revision; it does not rewrite or delete the
promoted version or prior decisions.

**Fact:** The Inspector reads raw Artifacts rather than writer success flags. It
recomputes Workspace snapshots, fresh Session identity, raw execution metrics,
Verifier wire status, regression status, fairness, deterministic decision and
Candidate -> validation -> decision -> version -> pointer/rollback lineage.

**Recommendation:** Main should accept the Goal 2 mechanism as
`PASS_V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK` after finite source/evidence
review. This Session cannot make that acceptance, update control state, commit,
or start Goal 3.

## 2. Exit-criteria matrix

| Charter / Start Prompt criterion | Evidence | Result |
|---|---|---|
| Exact Control Baseline | Git commit/tree preflight | PASS |
| Pinned Pi source and emitted boundary clean | two fixed local checkouts, public import/type smoke | PASS |
| Symmetric State-only treatment | common identity, four independent Workspace copies, two fresh public JSONL Sessions | PASS |
| External Verifier and frozen regression | local process boundary through `runExternalVerifierV0B()`; raw output reparse | PASS |
| Good Candidate promoted | Base failed, Candidate passed, Candidate regression/authority passed | PASS |
| Bad/no-improvement Candidate rejected | both passed with equal material vector; adaptive Skill Candidate rejected | PASS |
| Complete deterministic decision table | seven table/gate branches | PASS |
| Immutable accepted version | version digest/path, write-once inventory and source Candidate lineage | PASS |
| Atomic active pointer and reopen | temp-plus-rename pointer, independent reopen | PASS |
| Stale Candidate rejected | expected binding revision mismatch produces immutable `stale_base` rejection | PASS |
| Corrupt/missing/link/path/inventory fail closed | five-variant store matrix | PASS |
| Rollback retains history | revision 1 Promote, revision 2 rollback to version 0; both versions and all decisions remain | PASS |
| Independent Inspector / tamper rejection | coherently rehashed fairness, raw Verifier and State lineage variants rejected | PASS |
| Accepted V0–V2 core unchanged | no accepted V0–V2 source/test/fixture delta | PASS |
| Goal 3 absent | no applicability matcher, Run binding, subsequent behavioral Run or real closure | PASS |

## 3. Implementation

### 3.1 Symmetric comparator

`workbench/src/refinement/comparator-v3.ts` adds the thin Goal 2 adapter. It
reuses `createTemporaryWorkspace()`, public `JsonlSessionRepo`,
`runExternalVerifierV0B()`, write-once ArtifactRefs and current tree digests.
It does not call or modify the V2 retained/fresh controller or V2 Selector.

Each validation freezes:

```text
task / instruction
Provider-model profile
Tool profile
Verifier source and task
regression sources and tasks
budget / hard constraints
fresh_both Session policy
Base and Candidate State identities
```

The Base and Candidate raw event streams independently derive only three
material both-pass metrics: structural pathology count, Tool calls and
Provider calls. Each arm runs the same external Verifier and regression set.

### 3.2 Promotion rule

`decideValidationV3()` implements the frozen rule:

1. invalid fairness/authority rejects;
2. Candidate regression failure rejects;
3. Base fail + Candidate pass promotes;
4. Base pass + Candidate fail rejects;
5. both fail rejects;
6. both pass promotes only when Candidate is no worse on all three material
   metrics and strictly better on at least one; otherwise it rejects.

V2 strategy ordering, model self-rating, cost and elapsed time are absent from
the rule.

### 3.3 Immutable State lifecycle

`workbench/src/state/store-v3.ts` implements a single-writer ignored store:

```text
versions/<state_digest>/state.json (+ immutable Skill material when present)
decisions/<decision_id>.json
active.json
```

Initialization creates version 0 and an immutable initialization decision.
Promotion reloads and verifies the staged Goal 1 State, materializes and
reopens an immutable accepted version, writes the promotion decision, then
atomically replaces the pointer. Rejection writes a decision only. Stale
checks bind both the Candidate base digest and expected active binding
revision/version/digest. Rollback points to an existing accepted version and
increments only the pointer binding revision.

Store reopen rejects corrupt/missing manifests, wrong digests, unreferenced
versions, non-contiguous decisions, broken parent lineage, unexpected
inventory, symlink/reparse points, hardlinks and Windows alias/path variants.
Prompt derived identity and Pi-public adaptive Skill source/wrapper/authority
identity are revalidated.

### 3.4 Independent inspection

The pure `inspectValidationV3()` and async `inspectStateStoreV3()` /
`inspectGoal2LineageV3()` surfaces do not consume a writer `success` flag. They
re-open declared Artifacts and State history, check exact object shapes, parse
raw Verifier wire results, derive raw metric counts and reproduce the decision.
The combined inspector binds Candidate, validation, decision, accepted version
and active/rollback pointer history.

## 4. Source Delta

Expected tracked Goal 2 delta before Main review is eight files:

| Path | Change |
|---|---|
| `workbench/package.json` | Add only the Goal-local `v3g2:test` script. |
| `workbench/src/contracts/v3g2-types.ts` | Goal 2 validation, version, decision, pointer and inspection contracts. |
| `workbench/src/refinement/comparator-v3.ts` | Symmetric comparator, frozen rule and independent validation inspection. |
| `workbench/src/state/identity-v3.ts` | Shared semantic State digest projection. |
| `workbench/src/state/store-v3.ts` | Immutable versions/decisions, active pointer, stale protection, reopen and rollback. |
| `workbench/tests/v3g2-validate-promote-reject-rollback.test.ts` | Six focused tests covering all Goal 2 Exit behavior and tamper paths. |
| `docs/reports/V3_G2_IMPLEMENTATION_REPORT.md` | This report. |
| `docs/reports/V3_G2_CLOSEOUT_DRAFT.md` | Non-accepting Main review draft. |

No accepted V0–V2 contract, source, test or fixture changed. Goal 1 source was
not modified. `AGENTS.md`, `CURRENT_STATE.md`, the Charter, accepted base
prompt, accepted V1 Skill, Pi and reference trees are unchanged.

## 5. Commands and observed results

| Command / check | Exit / result |
|---|---|
| Initial `git status`, commit and tree check | 0; exact `f138ddd...` / `69812fb...`; tracked/index clean |
| Both Pi checkout identity/status/package checks | 0; exact `027a584...`, clean, package `0.82.1` |
| Public `AgentHarness` / `loadSkills` / `NodeExecutionEnv` runtime smoke | 0; all functions |
| Standalone public type smoke | 0 after one ignored ESM bridge correction |
| `node D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc -p .runs/v3-g2/runtime/tsconfig.workbench.json` | 0; strict TypeScript |
| `npm --prefix workbench run v3g2:test` | 0; 6 passed, 0 failed, 0 skipped |
| `node --experimental-loader ./.runs/v3-g2/runtime/public-pi-loader.mjs --test workbench/tests/v3g1-evidence-to-candidate.test.ts` | 0; 13 passed, 0 failed, 0 skipped |
| `node --experimental-loader ./.runs/v3-g2/runtime/public-pi-loader.mjs --test workbench/tests/v2a-recovery.test.ts workbench/tests/v2a-post-audit.test.ts` | 0; 10 passed, 0 failed, 0 skipped |
| `node --experimental-loader ./.runs/v3-g2/runtime/public-pi-loader.mjs --test workbench/tests/v0b-evidence.test.ts workbench/tests/v0b-verifier.test.ts workbench/tests/workspace.test.ts` | 0; 15 passed, 0 failed, 0 skipped |
| `git diff --check` | 0 |
| Final protected boundary / Pi status | tracked delta allowlisted; both Pi checkouts clean |

## 6. Development defects and bounded repairs

1. The first standalone public type smoke inherited `verbatimModuleSyntax`
   without an ESM package boundary and emitted TS1295. The ignored standalone
   tsconfig was narrowed to the already accepted Goal 1 bridge shape; public
   type smoke and strict Workbench TypeScript then passed.
2. The first passing comparator port API exposed an explicit `arm` label. A
   self-review found that this weakened the State-only treatment proof. The API
   was corrected so the port receives only State and Workspace; each arm now
   also produces a real public fresh JSONL Session artifact. The focused suite
   and all regressions passed afterward.
3. The same review added exact-key checks for validation/State/Verifier
   envelopes and closed unreferenced-version history. No architecture, Scope,
   State kind, external authority or accepted-core change was required.
4. A final verification wrapper first used the absent worktree-local TypeScript
   path and omitted the public-Pi loader from the V2-A/V0 regression commands.
   Those invocations failed at module resolution and were not counted as
   product evidence. The exact pinned compiler and ignored public loader shown
   above were then used; strict typecheck and all affected regressions passed.

These were ordinary Goal-local bridge/adapter/inspection defects. They caused
zero Credential, network, Provider/model, Pi, accepted-file or Git-history
side effects.

## 7. Evidence Index

Authoritative ignored evidence is indexed at:

`.runs/v3-g2/evidence/evidence-index.json`

Primary roots from the final focused run:

- Promote and rollback: `.runs/v3-g2/test-cases/promote-rollback-3148-1786123781751-83c52156b7a75/`;
- no-improvement Reject: `.runs/v3-g2/test-cases/reject-no-improvement-3148-1786123782395-51df4c011c1f7/`;
- stale reject: `.runs/v3-g2/test-cases/stale-3148-1786123782979-8fc89e81e6be/`;
- store tamper matrix: `.runs/v3-g2/test-cases/store-tamper-3148-1786123783416-62b44b0021f46/`;
- Inspector tamper matrix: `.runs/v3-g2/test-cases/inspector-tamper-3148-1786123783483-5ab4c0aad9a548/`.

The final authoritative good-validation digest is
`3527e54d5a68a7169249909e1b83f30a9769b2f5bc799bcd59923ec9ff904176`;
its file identity is recorded in the Evidence Index. The accepted version
remains preserved after rollback, while `active.json` returns to State version
0 at binding revision 2.

## 8. Remaining limitations / unverified

- This is deterministic/Faux mechanism evidence, not real-model behavioral
  effectiveness or statistical evidence.
- The store is ignored operational state. Deleting `.runs` deletes it; no
  production durability, crash transaction recovery or multi-writer claim is
  made.
- The design assumes one writer. It implements compare-and-swap stale
  protection but no lock service, merge or database.
- Goal 2 does not integrate active State into a subsequent product Run. Run
  start snapshot, applicability, selective binding, irrelevant non-binding and
  real behavioral closure remain Goal 3 work and are not claimed here.
- Main must independently review the tracked delta and ignored evidence before
  accepting Goal 2 or creating an Implementation Baseline commit.

## 9. CURRENT_STATE_UPDATE_PROPOSAL

This is a proposal only. This Session did not edit `CURRENT_STATE.md`.

```yaml
active_goal: V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK
goal_2_implementation_status: complete_pending_main_acceptance
goal_2_recommended_disposition: PASS_V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK_PENDING_MAIN_ACCEPTANCE
goal_2_control_baseline_commit: f138ddd607816f266e9024291718eeab087b39f6
goal_2_control_baseline_tree: 69812fb30ad7c2ee286a60d0cef35be847189d5d
goal_2_focused_tests: 6_passed_0_failed_0_skipped
goal_1_regression: 13_passed_0_failed_0_skipped
v2_a_regression: 10_passed_0_failed_0_skipped
v0_reused_boundary_regression: 15_passed_0_failed_0_skipped
credential_reads_observed: 0
external_network_requests_observed: 0
external_provider_calls_observed: 0
real_model_calls_observed: 0
pi_core_patches: 0
private_pi_imports: 0
sdk_extension_rpc_switches: 0
git_staged_or_committed: false
goal_3_authorized: false
remaining_gate: main_finite_review_and_goal_2_acceptance
```

Final Session recommendation:

`PASS_V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK_PENDING_MAIN_ACCEPTANCE`
