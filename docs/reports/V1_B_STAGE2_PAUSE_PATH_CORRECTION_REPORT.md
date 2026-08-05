# V1-B Stage 2 Pause-path Post-audit Bounded Correction Report

Status: `READY_FOR_MAIN_SESSION_FOCUSED_REAUDIT`

## 1. Frozen identity and authority

```yaml
rejected_candidate_commit: cdc9780fd6b3e9b34cdc4156713377d601c595ec
rejected_candidate_tree: fced95adf974cf95f26cb7a3c88ed871a7202ab8
pause_evidence_baseline_commit: c68e834b654d56a1ce8312b6f5f085230e74d7d1
original_execution_baseline_commit: 19617319c13a9eecbb325682c920e79d1517b89d
original_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
original_paused_run: v1b-run-01-parse-duration-r1-a
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
real_calls_authorized: 0
```

**Fact.** Gate A passed before editing: HEAD/tree matched the rejected Candidate,
tracked and staged state were clean, only the two expected Main Session prompt
files were untracked, and pinned Pi was exact and clean. No reset, checkout,
cleanup, staging or commit occurred.

## 2. Finding closure matrix

| Finding | Bounded correction | Deterministic proof | Result |
|---|---|---|---|
| P1-001 | `inspectPausedRunV1B` now binds phase to execution mode, request ordinal, matching Attempt/Session/Workspace, journal order, reservation caps, exact `0->1` Provider-request transition and the exact real-versus-Stage-1 external-counter matrix. | A coherently rehashed real-mode artifact with `network/provider/model 0->0` but snapshot `1/1/1` is rejected. All six positive typed phases remain accepted. | CLOSED |
| P1-002 | `executeV1RunCell` marks the pause durable only after `pause-evidence.json` and `attempt_paused` are written. A later access-close exception cannot replace the typed sanitized pause; non-pause close failures are projected to the fixed sanitized boundary. | Throwing-close regression observes `pause-evidence.json -> attempt_paused -> ledger paused`, retains `V1BTypedPauseError`, excludes the raw marker and remains nonterminal/noncomparable. | CLOSED |
| P1-003 | Revision-2 public preflight/run-next and CLI require an exact immutable replacement-sequence authority. A manifest-derived write-once claim journal binds one Pilot root; the runtime validator is invoked before Pilot initialization, before Provider authority creation, before each initial `started`, and before each child start. | Missing sequence state fails before Pilot creation; the first Pilot starts once and pauses; a second fresh Pilot with the same Manifest/sequence is rejected; the child cap rejects child 9 and duplicate initial Run IDs fail closed. | CLOSED |

**Fact.** The sequence mechanism is one manifest-derived claim journal under the
ignored `.runs/v1-b/replacement-sequence-claims/` boundary. It is not a general
scheduler, registry or database and creates no final replacement Manifest.

## 3. Exact source/test delta

Relative to rejected Candidate `cdc9780...`, the bounded code/test delta is nine
files, 247 insertions and 27 deletions:

| Path | + | - | Purpose |
|---|---:|---:|---|
| `workbench/src/cli.ts` | 4 | 3 | carries `--replacement-sequence-state` through tracked CLI |
| `workbench/src/contracts/v1-types.ts` | 25 | 0 | immutable sequence authority/runtime-state types |
| `workbench/src/experiment/v1.ts` | 28 | 10 | exact authority builder/identity/validation and typed runtime validation |
| `workbench/src/inspect-v1.ts` | 24 | 0 | exact pause counter, identity, order and cap matrix |
| `workbench/src/pilot-v1.ts` | 6 | 1 | sequence validation at authority/initial-start boundary |
| `workbench/src/product-surface-v1.ts` | 74 | 6 | public sequence requirement and write-once manifest claim journal |
| `workbench/src/run-v1.ts` | 7 | 2 | child boundary plus durable typed-pause close precedence |
| `workbench/tests/v1b-cli.test.ts` | 17 | 1 | tracked replacement CLI missing-state/second-root regression |
| `workbench/tests/v1b-stage1.test.ts` | 62 | 4 | three finding regressions and child/start caps |

The two authorized report files are also updated. No fixture, Manifest, Pi,
control-state, reference, accepted V0/V1-A source or Git-index entry changed.

## 4. Verification commands and results

All commands ran from
`C:/Users/HUAWEI/.codex/worktrees/28be/project2/workbench` unless stated.

| Command | Exit | Result |
|---|---:|---|
| `npm.cmd run typecheck` | 0 | strict TypeScript passed |
| `node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts` | 0 | 31/31 passed |
| `node --test --test-concurrency=1 tests/v1a-deterministic.test.ts tests/v0c-stage1.test.ts tests/v0c-post-audit-correction.test.ts tests/v0c-main-review-correction.test.ts` | 0 | 42/42 passed sequentially |
| `git diff --check` (repository root) | 0 | no whitespace errors |
| `git diff --cached --name-only` (repository root) | 0 | empty; index unchanged |

**Fact.** Actual access totals for this correction are:

```yaml
credential_material_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
installs_or_downloads: 0
```

Deterministic resolver/fault seams exercised typed counter transitions without
reading an environment credential or dispatching any request.

## 5. Evidence index

Authoritative additive ignored evidence root:

`C:/Users/HUAWEI/.codex/worktrees/28be/project2/.runs/v1-b/stage1/pause-path-post-audit-second-final-correction-authoritative-20260805T152841922/`

- `strict-typescript.txt` / `.exit.txt`: strict compile output and exit 0.
- `v1b-focused.txt` / `.exit.txt`: 31/31 focused tests and exit 0.
- `v1a-v0c-regressions.txt` / `.exit.txt`: 42/42 sequential regressions and exit 0.
- `verification-summary.json`: frozen identity, counts, boundaries and digest.
- `source-inventory.json`: SHA-256 inventory of every changed code/test file.
- `source-delta.txt`: exact tracked code/test numstat.
- `evidence-index.json`: recursive SHA-256/size inventory of authoritative evidence except itself.

An earlier additive capture ending in `20260805T152615706` was preserved
byte-for-byte after a final close-path refinement. It is non-authoritative; no
historical ignored evidence was overwritten or removed.

## 6. Corrected digest proposal

```yaml
corrected_workbench_source_digest_proposal: 0494bd0f749cd587df779596c95f84fafc1c4fe65f57eabf511810476d5989e7
candidate_commit: null
candidate_tree: null
owner_for_candidate_materialization: Main Session
```

**Fact.** The rejected Candidate remains rejected. This Session did not create a
corrected Candidate or final replacement Manifest.

## 7. Focused re-audit checklist

1. Re-run the coherent P1-001 counter contradiction and verify rejection for the
   exact mode/phase/transition mismatch.
2. Re-run the P1-002 throwing-close seam and verify typed pause remains primary,
   the raw marker is absent, and ledger ends `started -> paused`.
3. Exercise revision-2 `preflightV1B`, `runNextV1B` and tracked CLI with missing,
   mismatched and valid sequence authority.
4. Verify one manifest-derived claim cannot bind two Pilot roots and every
   initial/child start invokes `validateReplacementSequenceStateV1B` first.
5. Re-run strict TypeScript, 31 focused tests and the 42 sequential regressions.
6. Confirm actual access remains `0/0/0/0`, index remains empty, Pi remains exact,
   and no protected path changed.

## 8. Unverified and stop point

**Unconfirmed.** A corrected Candidate commit/tree does not yet exist. Main
Session must review this delta, materialize any corrected Candidate, and decide
whether a fresh focused re-audit accepts it. No Stage 2 execution, final
replacement Manifest, credential access or real call was attempted.

## 9. `CURRENT_STATE_UPDATE_PROPOSAL`

```yaml
active_goal: V1-B
v1b_status: active_paused_post_audit_correction_ready_for_focused_reaudit
rejected_candidate:
  commit: cdc9780fd6b3e9b34cdc4156713377d601c595ec
  tree: fced95adf974cf95f26cb7a3c88ed871a7202ab8
  disposition: remains_rejected
accepted_findings_closed_by_proposal:
  - P1-001_exact_pause_counter_semantics
  - P1-002_typed_pause_survives_close_cleanup
  - P1-003_sequence_validator_on_public_execution_path
verification:
  strict_typescript: passed
  v1b_focused: 31_of_31_passed
  required_v1a_v0c_regressions: 42_of_42_passed
  actual_access:
    credential_material_reads: 0
    network_calls: 0
    external_provider_calls: 0
    real_model_calls: 0
corrected_workbench_source_digest_proposal: 0494bd0f749cd587df779596c95f84fafc1c4fe65f57eabf511810476d5989e7
authoritative_evidence: .runs/v1-b/stage1/pause-path-post-audit-second-final-correction-authoritative-20260805T152841922
main_session_owns:
  - bounded_delta_review
  - corrected_candidate_commit_and_tree
  - focused_reaudit_handoff_and_acceptance
  - any_future_execution_baseline
  - final_replacement_manifest_materialization
prohibited_until_separately_authorized:
  - credential_or_network_access
  - provider_or_real_model_call
  - stage2_execution
  - control_state_update
  - staging_or_commit_by_preparation_session
```

Work stops here for Main Session review.
