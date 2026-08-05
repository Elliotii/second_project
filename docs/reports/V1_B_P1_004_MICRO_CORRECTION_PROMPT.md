# V1-B P1-004 One-time Micro-correction Prompt

```yaml
status: authorized_one_time_micro_correction_exception
authorized_by_user: 2026-08-05
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
owner: original_v1_b_preparation_session
starting_candidate_commit: c360ebc4af9ef941252e6aff99638eca00b161e0
starting_candidate_tree: 96f1f6ed016971e8801c9229ece4004bbc782f62
starting_workbench_source_digest: 0494bd0f749cd587df779596c95f84fafc1c4fe65f57eabf511810476d5989e7
reaudit_disposition: PAUSE_SCOPE_OR_ARCHITECTURE
open_finding: P1-004_within_P1-001
closed_findings:
  - P1-002
  - P1-003
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
credential_reads_authorized: 0
external_network_authorized: false
provider_calls_authorized: 0
real_model_calls_authorized: 0
git_commit_authorized: false
control_state_edit_authorized: false
manifest_edit_authorized: false
stage_2_authorized: false
v2_authorized: false
further_correction_cycles_authorized: 0
```

## 1. Role and exact stop point

You are the original V1-B Preparation Session. The user has explicitly granted
one and only one micro-correction exception after the two normal correction
cycles were consumed.

Correct only P1-004: the Inspector currently rejects the producer's own
coherent real-mode pause after durable reservation but before dispatch. Preserve
P1-002 and P1-003 unchanged. Run the bounded verification, update the two
existing correction reports, and stop for Main review.

Do not repair anything else. Do not create another correction proposal if this
micro-fix fails; stop with a Pause Report. Do not stage or commit.

## 2. Required reading and identity Gate

Read:

1. `AGENTS.md` and `CURRENT_STATE.md`;
2. the formal V1 Charter, V1-B Contract and Pause Recovery Amendment;
3. `docs/reports/V1_B_PAUSE_PATH_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md`;
4. `docs/reports/V1_B_PAUSE_PATH_REAUDIT_PAUSE_REPORT.md`;
5. the current correction report and Closeout Draft;
6. `workbench/src/inspect-v1.ts`, the producer reservation/counter path in
   `workbench/src/pi/pi-run-handle-v1.ts`, and the exact focused tests.

Before editing verify:

- worktree is `C:/Users/HUAWEI/.codex/worktrees/28be/project2`;
- HEAD/tree exactly match the starting Candidate above;
- index is clean and the only pre-existing untracked files are Main-owned
  re-audit/pause/micro-correction documents;
- Pi is exact and clean;
- real access remains `0 / 0 / 0 / 0`.

Any mismatch is an immediate pause.

## 3. Exact semantic correction

Do not change the producer or the reservation event. Freeze the existing
write-ahead semantics explicitly:

- `provider_request_reserved` is durable before possible dispatch;
- its real Stage-2 reservation transitions remain exact `0 -> 1` for the one
  bounded Provider request and the possible network/Provider/model calls;
- `pause.counter_snapshot` records the producer's actual/conservatively possible
  state when the pause is captured;
- immediately after reservation but before Pi reaches dispatch, the only valid
  external snapshot is `0 / 0 / 0`;
- after dispatch may have occurred, the only other valid external snapshot is
  `1 / 1 / 1`;
- mixed or partial external tuples are invalid;
- credential reads remain exactly `1` for these real Stage-2 post-reservation
  states;
- Stage-1 deterministic semantics remain exact zero-access;
- both valid Stage-2 states retain the complete pending reservation and full
  conservative charge;
- the original coherent forgery (`0 -> 0` external transition with `1 / 1 / 1`
  snapshot and repaired digests) remains invalid.

This is a semantic relation between a write-ahead reservation and the later
snapshot, not permission to accept arbitrary monotonic counters. Do not add a
new phase, field, schema, runtime component, journal type, scheduler or general
counter platform.

## 4. Authorized files

Only these tracked files may change:

```text
workbench/src/inspect-v1.ts
workbench/tests/v1b-stage1.test.ts
docs/reports/V1_B_STAGE2_PAUSE_PATH_CORRECTION_REPORT.md
docs/reports/V1_B_STAGE2_PAUSE_PATH_CORRECTION_CLOSEOUT_DRAFT.md
```

New evidence may be written only to a unique additive directory under:

`.runs/v1-b/stage1/**`

All other source, tests, fixtures, Manifest files, control documents, Pi,
reference material, dependency state and Git history/index are read-only. If
the correction needs `pi-run-handle-v1.ts`, contracts, product surface, CLI or
any other path, stop; no source expansion is authorized.

## 5. Required deterministic proof

At minimum:

1. build the unmodified real-mode deterministic post-reservation/pre-dispatch
   pause and assert Inspector returns pause-integrity valid, terminal false and
   comparable false;
2. assert its external snapshot is exactly `0 / 0 / 0`, reservation transition
   remains exact `0 -> 1`, and full USD 0.10 / 65,536-token conservative charge
   is retained;
3. mutate the same coherent evidence to the original forged
   `0 -> 0` transition + `1 / 1 / 1` snapshot, repair every dependent digest,
   and assert rejection;
4. reject mixed snapshot tuples such as `1 / 0 / 1` under coherent digest
   repair;
5. retain the valid possible-dispatch `1 / 1 / 1` state and Stage-1 zero state;
6. retain P1-002 throwing-close and P1-003 sequence/public-path regressions;
7. run strict TypeScript;
8. run all current V1-B focused tests (31 or more);
9. run the 42 required sequential V1-A/V0-C regressions;
10. recompute the Workbench source digest and confirm zero forbidden delta.

No credential, environment secret, network, Provider or model access may occur.

## 6. Deliverables

Update the existing correction report and Closeout Draft with:

- a P1-004 closure row and exact positive/negative semantics;
- exact two-file source/test delta;
- commands and exit codes;
- focused/regression counts;
- zero-access accounting;
- unique additive evidence index;
- corrected source digest proposal;
- re-audit checklist limited to P1-004 plus mandatory regressions;
- a structured `CURRENT_STATE_UPDATE_PROPOSAL` that leaves acceptance, Candidate
  creation, re-audit and Stage 2 to Main Session.

Then stop. Do not modify the re-audit report or Pause Report, create a Manifest,
edit control state, stage, commit, call a model, or enter Stage 2/V2.

## 7. Automatic pause

Stop immediately if:

- the positive and negative counter stories cannot both be expressed in the
  existing schema;
- any producer/schema/path change is needed;
- P1-002 or P1-003 regresses;
- a new P0/P1 appears;
- any test requires real access;
- another correction cycle would be needed.

No fourth correction is authorized.
