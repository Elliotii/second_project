# V1-B Pause-path Post-audit Bounded Correction Prompt

```yaml
status: authorized_second_and_final_zero_call_correction
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
owner: original_v1_b_preparation_session
main_review_disposition: ACCEPT_THREE_P1_FINDINGS_AND_REVISE_CANDIDATE
rejected_candidate_commit: cdc9780fd6b3e9b34cdc4156713377d601c595ec
rejected_candidate_tree: fced95adf974cf95f26cb7a3c88ed871a7202ab8
pause_evidence_baseline_commit: c68e834b654d56a1ce8312b6f5f085230e74d7d1
original_execution_baseline_commit: 19617319c13a9eecbb325682c920e79d1517b89d
original_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
accepted_findings:
  - P1-001_counter_transition_snapshot_contradiction
  - P1-002_close_failure_overrides_typed_pause
  - P1-003_replacement_sequence_validator_not_on_execution_path
credential_reads_authorized: 0
external_network_authorized: false
external_provider_calls_authorized: 0
real_model_calls_authorized: 0
git_commit_authorized: false
control_state_edit_authorized: false
replacement_manifest_creation_authorized: false
replacement_stage_2_authorized: false
v2_authorized: false
```

## 1. Role, authority and stop point

You are the original V1-B Preparation Session. The Main Session has completed
a limited review of the fresh focused independent audit and accepts its three
P1 findings as Contract-scoped defects. No P0 was found.

Perform only the second and final zero-real-call bounded correction permitted
by the accepted `V1_B_PAUSE_RECOVERY_AMENDMENT.md`. Repair the three findings,
add their exact deterministic regressions, run only the required suites, update
the bounded correction reports and stop for Main review.

Do not accept V1-B, create a Candidate or Execution Baseline commit, materialize
the final replacement Manifest, edit control state, read credentials, access
the network, call a Provider/model, execute Stage 2, or enter V2.

## 2. Required reading and identity Gate

Read before editing:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. the formal V1 Charter and V1-B Goal Contract;
4. `V1_B_PAUSE_RECOVERY_AMENDMENT.md`;
5. `docs/reports/V1_B_STAGE2_PAUSE_PATH_CORRECTION_REPORT.md`;
6. `docs/reports/V1_B_STAGE2_PAUSE_PATH_CORRECTION_CLOSEOUT_DRAFT.md`;
7. the audit prompt in this checkout:
   `docs/reports/V1_B_PAUSE_PATH_FOCUSED_INDEPENDENT_AUDIT_PROMPT.md`;
8. the audit report, read-only:
   `C:/Users/HUAWEI/.codex/worktrees/1772/project2/docs/reports/V1_B_PAUSE_PATH_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`;
9. audit-local counterexamples, read-only:
   `C:/Users/HUAWEI/.codex/worktrees/1772/project2/.runs/v1-b/audit/focused-20260805T065403Z-cdc9780/`;
10. the exact affected source and tests.

Before any edit verify and record:

- worktree is `C:/Users/HUAWEI/.codex/worktrees/28be/project2`;
- HEAD is exact rejected Candidate
  `cdc9780fd6b3e9b34cdc4156713377d601c595ec`;
- `HEAD^{tree}` is
  `fced95adf974cf95f26cb7a3c88ed871a7202ab8`;
- tracked and staged state are clean; the two expected untracked Main prompt
  files are not a source/control delta;
- pinned Pi is exact `027a5847901b5dde30270abaa1041046cd2b4b55`
  and clean;
- real access counters remain `0 / 0 / 0 / 0`.

If identity differs, an allowlisted source already differs from the rejected
Candidate, Pi is not exact/clean, or another path is modified, stop with a
Pause Report.

## 3. Binding correction A — exact counter semantics

Close P1-001 without adding a general telemetry platform.

`inspectPausedRunV1B` must relate every `counter_transition` to all of:

- the Manifest execution mode;
- the closed typed pause phase;
- request ordinal;
- the matching `counter_snapshot`;
- the presence and order of the reservation event.

Freeze an explicit phase/mode matrix and fail closed on any contradiction. At
minimum:

- all pre-credential and credential-failure external counters remain zero;
- post-credential/pre-reservation has exactly one credential read and zero
  reservation/network/Provider/model dispatch;
- a real Stage-2 post-reservation or invalid-usage path has the exact single
  possible-dispatch transition and a snapshot consistent with that transition;
- a deterministic Stage-1 fault seam has explicit zero-access semantics and
  cannot masquerade as the real Stage-2 transition;
- monotonically valid but semantically wrong values fail;
- coherently rehashing the journal, ArtifactRef, journal digest and ledger does
  not make a contradictory counter story valid.

Add the audit's coherent counter contradiction as a regression. Preserve
nonterminal/noncomparable behavior and conservative post-reservation charging.

## 4. Binding correction B — typed pause survives close failure

Close P1-002 at the smallest cleanup boundary.

If durable pause evidence and `attempt_paused` have already been written, a
later `handle.close()` failure must not replace `V1BTypedPauseError` or strand
the Pilot ledger at `started`.

Required behavior:

- preserve the typed sanitized pause as the primary public error;
- permit `runNextPilotCellV1B` to append the write-once `paused` ledger link;
- never persist or expose raw close-error text;
- if cleanup failure is recorded at all, use only a closed sanitized secondary
  classification that cannot change terminal/comparable/accounting semantics;
- do not convert a pause into terminal evidence and do not add retry/fallback.

Add a deterministic throwing-close regression proving:

`pause-evidence.json -> attempt_paused -> ledger paused`, nonterminal,
noncomparable, zero dispatch, sanitized output, and no raw close marker.

## 5. Binding correction C — enforce predecessor sequence on the real path

Close P1-003 without creating a scheduler or the final real replacement
Manifest.

The public revision-2 `preflight` and `run-next` handoff must require immutable
predecessor/sequence evidence and must actually invoke
`validateReplacementSequenceStateV1B` before Pilot initialization, before
execution authority creation, and again at every started initial Run or child
Attempt boundary where the sequence state changes.

The required state must bind at least:

- exact predecessor Manifest ID
  `43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76`;
- exact original paused Run and one predecessor initial start;
- conservative prior debit USD `0.10`;
- no prior replacement Pilot;
- revision 2 and the exact 24 new Run IDs;
- maximum 25 started initial Runs across predecessor + replacement;
- maximum eight replacement child Attempts;
- no reused/nonmember ID, second replacement, retry, fallback or automatic
  replacement.

Missing sequence state must fail before a Pilot root or `started` relation is
created. Two fresh Pilot roots using the same revision-2 Manifest/sequence must
not both be authorized. Persist only the minimal deterministic sequence binding
needed for fail-closed validation; do not build a general registry/database.

Main Session still owns final predecessor-state materialization, final tracked
replacement Manifest, final zero-call Gate and Execution Baseline after the
focused re-audit passes. Tests may build deterministic temporary fixtures only.

## 6. Authorized paths

Only the accepted Contract/Amendment allowlist may change. Expected minimal
source/test subset:

```text
workbench/src/contracts/v1-types.ts             # only if a narrow typed sequence/cleanup field is required
workbench/src/experiment/v1.ts
workbench/src/inspect-v1.ts
workbench/src/run-v1.ts
workbench/src/pilot-v1.ts
workbench/src/product-surface-v1.ts
workbench/src/cli.ts                             # only if predecessor-state input must cross the tracked CLI
workbench/tests/v1b-stage1.test.ts
workbench/tests/v1b-cli.test.ts
workbench/README.md                              # only bounded public semantics
docs/reports/V1_B_STAGE2_PAUSE_PATH_CORRECTION_REPORT.md
docs/reports/V1_B_STAGE2_PAUSE_PATH_CORRECTION_CLOSEOUT_DRAFT.md
.runs/v1-b/stage1/**                             # ignored additive evidence only
```

Do not modify accepted Task, Skill, System Prompt, Tool, Verifier or historical
Manifest fixtures; V0/V1-A accepted source; Pi; `reference/`; `CURRENT_STATE.md`;
the formal Contract/Charter/Amendment; governance files; dependency state; Git
index or history. Preserve all existing ignored evidence and add a new uniquely
named evidence directory.

If a source path outside the existing §6.2 allowlist is required, stop with a
Source Expansion Proposal instead of editing it.

## 7. Required deterministic verification

With zero credential/network/Provider/model access:

1. reproduce and close P1-001's coherently rehashed counter contradiction;
2. reproduce and close P1-002's throwing-close ledger-stranding case;
3. reproduce and close P1-003 through the public preflight/run-next surface,
   including missing state and two fresh Pilot roots;
4. retain positive pre-credential, credential-failure, post-credential,
   post-reservation, invalid-usage and other-runtime pause cases;
5. retain write-before-dispatch, full pending reservation, sanitized evidence,
   nonterminal/noncomparable and aggregate denominator behavior;
6. run strict TypeScript;
7. run all V1-B focused tests (at least the current 26 plus new regressions);
8. run the required V1-A/V0-C regressions sequentially (current 42);
9. recompute the Workbench source digest and source delta;
10. confirm Pi, protected fixtures/control/reference and Git index remain
    unchanged.

Do not run broad unrelated suites and do not install/download dependencies.

## 8. Deliverables

Update the two bounded Stage-2 pause-path correction reports with:

- exact source delta;
- finding-closure matrix for P1-001 through P1-003;
- exact commands, working directories and exit codes;
- focused and regression test counts;
- zero-access accounting;
- additive Evidence Index and source inventory/delta;
- corrected Workbench source digest proposal;
- a narrow re-audit checklist limited to the three findings and required
  regressions;
- structured `CURRENT_STATE_UPDATE_PROPOSAL` stating that the rejected Candidate
  remains rejected and Main Session owns any corrected Candidate/acceptance.

Then stop. Do not stage or commit.

## 9. Automatic pause conditions

Stop immediately if:

- any fix needs a third bounded correction cycle, architectural redesign,
  general durable-runtime/scheduler/registry/database feature, or V2 behavior;
- exact counter semantics cannot be defined without retaining raw payload,
  response, error or credential data;
- cleanup cannot preserve typed pause and write-once ledger ordering;
- sequence enforcement cannot reject a second replacement at the tracked public
  boundary;
- any existing Contract Pause Condition fires;
- a new non-local defect changes the correction/audit scope.

Return a bounded Pause Report with facts and options; do not choose an
architecture fork silently.
