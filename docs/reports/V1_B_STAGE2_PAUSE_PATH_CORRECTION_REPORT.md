# V1-B Stage 2 Pause-path Bounded Correction Report

```yaml
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
session_role: original_v1_b_preparation_session
correction_scope: accepted_pause_recovery_amendment_zero_call_cycle
disposition_proposal: PASS_ZERO_CALL_PAUSE_PATH_CORRECTION_READY_FOR_FOCUSED_REAUDIT
pause_evidence_baseline_commit: c68e834b654d56a1ce8312b6f5f085230e74d7d1
pause_evidence_baseline_tree: 3c3b53ec1990ba50419380c09ddddc6070a4ebf6
original_execution_baseline_commit: 19617319c13a9eecbb325682c920e79d1517b89d
original_execution_baseline_tree: 48d2bee79a551fe53ac36ed12decea2357765645
original_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
original_paused_run: v1b-run-01-parse-duration-r1-a
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
corrected_workbench_source_digest_proposal: 634879c68345ccb689ba3768197612db1cad83e575f217d5f125cabba5d9c0d5
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
control_state_modified: false
git_staged: false
git_commit_created: false
stage_2_entered: false
```

## 1. Result

**Fact.** Gate A passed before editing. HEAD and tree exactly matched the frozen
Pause Evidence Baseline, tracked and staged state were clean, and pinned Pi was
exact and clean. The historical Manifest, historical paused evidence, accepted
fixtures, Pi, reference material and control state were not modified.

**Fact.** The bounded correction now persists a sanitized reservation event
before a Provider request can leave the Pi harness; carries six closed typed
pause phases; writes `pause-evidence.json` and the final `attempt_paused`
journal event before the Pilot appends `paused`; and charges the full pending
token/USD reservation when dispatch may have occurred but usage is unavailable.

**Fact.** Inspector independently accepts coherent paused evidence while
returning `terminal_valid: false` and `comparable: false`. It rejects missing,
duplicated, reordered, tampered, coherently rehashed, secret-shaped and
reasoning-shaped pause evidence. Aggregate retains the conservative accounting
but contributes zero terminal or effect-denominator Runs.

**Fact.** Deterministic replacement revision support freezes the predecessor
Manifest ID, USD 0.10 prior debit, USD 1.90 replacement cap, 24 new Run IDs,
unchanged treatment layout, at most 25 cross-sequence started initial Runs and
at most eight replacement child Attempts. No final replacement Manifest was
created.

**Inference.** The accepted pause-path defect is corrected at the authorized
source boundary and is ready for Main review and fresh focused re-audit. This is
not Candidate acceptance, does not create a new Execution Baseline and does not
authorize a replacement Stage 2 Pilot.

## 2. Gate A

| Check | Observed |
| --- | --- |
| Worktree | `C:/Users/HUAWEI/.codex/worktrees/28be/project2` |
| HEAD | `c68e834b654d56a1ce8312b6f5f085230e74d7d1` |
| HEAD tree | `3c3b53ec1990ba50419380c09ddddc6070a4ebf6` |
| Starting tracked / staged state | clean / clean |
| Pi HEAD / status | `027a5847901b5dde30270abaa1041046cd2b4b55` / clean |
| Original Manifest ID | `43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76` |
| Real credential/network/Provider/model access | `0 / 0 / 0 / 0` |

Gate evidence:
`.runs/v1-b/stage1/pause-path-correction-authoritative-final-20260805T063600Z-c68e834/gate-a.json`.

## 3. Contract traceability

| Requirement | Source | Positive proof | Counterexample / fail-closed proof |
| --- | --- | --- | --- |
| Write before dispatch | `pi/pi-run-handle-v1.ts` Provider hook; `run-v1.ts` journal callback | post-reservation test observes `provider_request_reserved` immediately before `attempt_paused` | persistence/hook failure cannot advance to request; event contains only identity, ordinal, counters, caps and phase |
| Six typed pause phases | `contracts/v1-types.ts::V1B_PAUSE_PHASES`; `provider/fixed-provider-v1.ts::V1BPauseBoundaryError` | pre-credential, credential-failure, post-credential, post-reservation, invalid-usage and other-runtime paths exercised | raw caught errors never enter the typed object or persisted evidence |
| Conservative unknown-usage charge | `pi/pi-run-handle-v1.ts::ThreeLevelBudgetV1B.createPauseSnapshot` | synthetic post-reservation and invalid-usage tests charge 65,536 tokens and USD 0.10 | Inspector rejects pending/charge mismatch and invalid accounting chain |
| Pause persistence order | `run-v1.ts::executeV1RunCell`; `pilot-v1.ts::runNextPilotCellV1B` | pause file -> `attempt_paused` -> ledger `paused` | missing, duplicate, reordered and digest-drift cases fail |
| Pause Inspector | `inspect-v1.ts::inspectPausedRunV1B` | authoritative copied Pilot returns pause-integrity valid | terminal/RunResult presence, coherent semantic rehash and protected-marker cases fail |
| Nonterminal/noncomparable | `inspect-v1.ts::inspectV1RunCell` and `aggregatePilotV1B` | authoritative aggregate: 1 started, 1 paused, 0 terminal, 0 comparable, USD 0.10 conservative | a pause cannot satisfy the terminal branch because terminal artifacts are forbidden |
| Replacement revision | `experiment/v1.ts::buildReplacementExecutionManifestV1B` and `validateReplacementSequenceStateV1B` | valid revision 2 and 24 new IDs pass | USD >1.90, predecessor mismatch, reused/nonmember IDs, >24 cells, >25 sequence starts, >8 children and retry/fallback/replacement drift fail |

## 4. Exact source delta

No path outside the correction allowlist changed. Source/test delta before these
two reports was 477 insertions and 43 deletions across nine files:

| Path | + | - | Purpose |
| --- | ---: | ---: | --- |
| `workbench/src/contracts/v1-types.ts` | 73 | 1 | typed phases, sanitized reservation/pause evidence, replacement revision and ledger refs |
| `workbench/src/experiment/v1.ts` | 47 | 5 | deterministic replacement revision and sequence validation |
| `workbench/src/inspect-v1.ts` | 75 | 3 | independent paused-evidence validation and noncomparable aggregation |
| `workbench/src/pi/pi-run-handle-v1.ts` | 82 | 15 | pre-dispatch event, typed failure mapping and conservative pending reservation settlement |
| `workbench/src/pilot-v1.ts` | 16 | 6 | pause ref/journal digest ledger binding and paused conservative usage loading |
| `workbench/src/provider/fixed-provider-v1.ts` | 11 | 0 | sanitized typed pause carrier |
| `workbench/src/run-v1.ts` | 37 | 2 | pause file/journal persistence before Pilot ledger pause |
| `workbench/tests/v1b-cli.test.ts` | 8 | 5 | corrected-source Manifest binding and typed missing-credential evidence expectations |
| `workbench/tests/v1b-stage1.test.ts` | 128 | 6 | seven pause/replacement regression groups plus corrected-source Manifest construction |

The accepted Manifest fixture was intentionally not rewritten. Existing tests
materialize the current deterministic Stage 1 Manifest in ignored test space so
that the historical committed fixture remains immutable after this source
correction.

## 5. Verification commands and results

| Command | Working directory | Exit | Result |
| --- | --- | ---: | --- |
| `node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | `workbench/` | 0 | strict TypeScript passed |
| `node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts` | `workbench/` | 0 | 26/26 passed: the original 19 focused tests plus seven correction groups |
| `node --test --test-concurrency=1 tests/v1a-deterministic.test.ts tests/v0c-stage1.test.ts tests/v0c-post-audit-correction.test.ts tests/v0c-main-review-correction.test.ts` | `workbench/` | 0 | 42/42 passed |
| `node workbench/src/cli.ts v1b inspect --pilot-root .../post-reservation-pilot-final --run v1b-run-01-parse-duration-r1-a` | repository root | 0 | coherent pause valid; terminal false; comparable false |
| `node workbench/src/cli.ts v1b aggregate --pilot-root .../post-reservation-pilot-final` | repository root | 0 | 24 planned, 1 started, 1 paused, 0 terminal, 0 comparable; USD 0.10 conservative |
| `git diff --check` | repository root | 0 | no whitespace errors |

The focused tests include the exact tracked CLI invocation with
`stage2_real`, `--stage2-real-authority` and an explicit empty environment that
omits `DEEPSEEK_API_KEY`; it writes typed sanitized pause evidence and performs
zero external dispatch.

## 6. Accounting

```yaml
real_credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
dependency_installs_or_downloads: 0
pi_delta: 0
accepted_fixture_delta: 0
control_state_delta: 0
git_stage_operations: 0
git_commits: 0
synthetic_post_reservation_example:
  provider_request_reservations: 1
  conservative_token_charge: 65536
  conservative_cost_charge_usd: 0.10
  network_calls: 0
  external_provider_calls: 0
  real_model_calls: 0
```

Synthetic fake-resolver observations are test seams and are not real
credential reads. No environment credential value was read.

## 7. Evidence index

Authoritative ignored evidence root:

`.runs/v1-b/stage1/pause-path-correction-authoritative-final-20260805T063600Z-c68e834/`

Key artifacts:

- `gate-a.json` — frozen starting identity;
- `verification-summary.json` — commands, results and zero-call accounting;
- `strict-typescript.exit.txt` — strict compile exit evidence (successful
  compiler stdout was empty);
- `v1b-focused.txt` and `.exit.txt` — 26/26 focused evidence;
- `v1a-v0c-regressions.txt` and `.exit.txt` — 42/42 sequential regression evidence;
- `post-reservation-pilot-final/` — coherent sanitized pause example;
- `post-reservation-inspect-final.json` — pause valid / terminal false / comparable false;
- `post-reservation-aggregate-final.json` — conservative accounting without denominator entry;
- `evidence-index.json` and `evidence-index-addendum.json` — recursive SHA-256
  inventory and additive post-index inventory;
- `evidence-preservation-recovery.json` — exact hash verification for the
  evidence-preservation incident described below.

### Evidence-preservation incident

**Fact.** A cleanup command targeting five preliminary ignored-evidence paths
was already pending when Main Session directed that all existing ignored
evidence be preserved and future capture be additive. The command completed
before termination took effect. The five targets represented 15 files.

**Fact.** All 15 affected files were immediately restored from the surviving
original generated test directory plus deterministic command output. Every
restored byte length and SHA-256 exactly matches the pre-cleanup
`evidence-index.json`; `evidence-preservation-recovery.json` records each
comparison and `all_hashes_exact: true`.

**Fact.** No further ignored evidence was deleted or overwritten. The final
authoritative capture is the unique additive directory named above.

## 8. Corrected digest and replacement binding proposal

```yaml
corrected_workbench_source_digest_proposal: 634879c68345ccb689ba3768197612db1cad83e575f217d5f125cabba5d9c0d5
replacement_manifest_revision: 2
predecessor_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
conservative_prior_debit_usd: 0.10
replacement_pilot_cost_cap_usd: 1.90
replacement_planned_initial_runs: 24
sequence_started_initial_runs_max: 25
replacement_child_attempts_max: 8
final_replacement_manifest_materialized: false
```

The final replacement Manifest ID is intentionally not proposed because it
must bind the Main-created corrected Candidate/new Execution Baseline commit.
The builder recomputes it deterministically only after that identity exists.

## 9. Focused re-audit checklist

1. Recompute exact Candidate tree and the proposed Workbench source digest.
2. Independently observe that the journal reservation event is durable before
   the Provider boundary can dispatch.
3. Reproduce pre-credential, credential-failure, post-credential,
   post-reservation, invalid-usage and other-runtime typed pause phases.
4. Verify full pending token/USD reservation charging when usage is unavailable.
5. Verify pause file -> `attempt_paused` -> ledger `paused` ordering and all
   identity/digest relations.
6. Re-run missing, duplicate, reordered, tampered and coherently rehashed pause
   counterexamples, including protected markers.
7. Confirm pause-integrity valid remains terminal-invalid and noncomparable.
8. Re-run revision-2 predecessor/cost/membership/start/child/retry/fallback
   counterexamples.
9. Run strict TypeScript, all 26 focused tests and the 42 sequential regressions.
10. Confirm zero real credential/network/Provider/model access and zero Pi,
    fixture, control-state, staging or commit delta by this Session.

## 10. Unverified and stop point

**Unconfirmed / unauthorized.** No real Provider request, real model response,
real usage record, real cost or replacement Pilot behavior was observed. No
corrected Candidate, focused re-audit, new Execution Baseline or final
replacement Manifest was created. Those remain Main/user-controlled steps.

Work stops after producing this zero-call correction evidence.

## 11. `CURRENT_STATE_UPDATE_PROPOSAL`

```yaml
proposal_only: true
active_goal: V1_B_FROZEN_BOUNDED_REAL_PILOT
phase: v1_b_pause_path_correction_complete_pending_main_review_and_focused_reaudit
pause_evidence_baseline_commit: c68e834b654d56a1ce8312b6f5f085230e74d7d1
pause_evidence_baseline_tree: 3c3b53ec1990ba50419380c09ddddc6070a4ebf6
original_execution_baseline_commit: 19617319c13a9eecbb325682c920e79d1517b89d
original_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
original_pilot_status: immutable_paused
original_actual_cost_usd: unknown
correction_session_disposition_proposal: PASS_ZERO_CALL_PAUSE_PATH_CORRECTION_READY_FOR_FOCUSED_REAUDIT
corrected_workbench_source_digest_proposal: 634879c68345ccb689ba3768197612db1cad83e575f217d5f125cabba5d9c0d5
focused_tests: 26_of_26_passed
required_regressions: 42_of_42_passed
strict_typescript: passed
real_access_accounting:
  credential_reads: 0
  network_calls: 0
  external_provider_calls: 0
  real_model_calls: 0
replacement_protocol_support:
  predecessor_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
  conservative_prior_debit_usd: 0.10
  replacement_pilot_cap_usd: 1.90
  replacement_cells: 24
  sequence_started_initial_runs_max: 25
  replacement_child_attempts_max: 8
candidate_commit: pending_main_materialization
focused_pause_path_reaudit: pending_fresh_audit_session
new_execution_baseline: not_created
final_replacement_manifest: not_created
replacement_stage_2: not_started
v2_authorized: false
```
