# Final Capstone Goal 2 Correction 1 Report

```yaml
status: COMPLETED_PENDING_MAIN_REREVIEW
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G2_REGRESSION_GATED_STATE_FEEDBACK
finding_set: FC-G2-AUDIT-P1-001_and_FC-G2-AUDIT-P2-002
correction_usage: 1_of_2
rejected_candidate: 198854d2565f3aa591da2ca083d614091a37c3fa
authorization_control_commit: 96b51cee633dbeb6e94fb0b294f9a5cd877f69d0
staged: false
committed: false
```

## 1. Outcome

The indivisible round-1 finding set is corrected in the original implementation worktree. The audit-hit equivalents pass, the full corrected matrix is 61/61, strict TypeScript against the canonical public Pi declarations passes, and no forbidden access or edit occurred.

This Session recommends Main re-review and affected-finding re-audit. It does not accept Goal 2, freeze a Candidate, update control state, or authorize Goal 3.

## 2. Finding disposition

### `FC-G2-AUDIT-P1-001`

Corrected within the authorized Goal 2 files:

1. `safeProjectPath` now treats future assessment roots as future directories, starts at an ordinary project root, walks every existing path segment, rejects symlink/junction/reparse segments and non-directory ancestors, checks each existing real path remains inside the real project root, and revalidates the newly created final root before writing.
2. Goal 2 artifact descendants are independently walked beneath the ordinary assessment root. Existing assessment, authorization, and application files must be ordinary, singly linked, canonical JSON. Idempotent writes reopen and validate those bytes rather than accepting a raw byte match.
3. Normal application still creates the exact Host authorization and calls only existing `rollbackActiveStateV3` with the assessed active identity and parent target.
4. If the V3 mutation succeeds but application persistence fails, retry enters recovery only when all of these recompute:
   - the stored assessment is exactly `rollback` and its target remains the immediate parent;
   - the stored authorization is canonical and byte-identical to the authorization derived from that assessment;
   - the application is absent;
   - the V3 store independently passes;
   - exactly one valid rollback Decision has the assessed prior active, target, derived next revision/version/digest, and valid Decision digest;
   - the current pointer identity and `decision_id` still equal that Decision's `next_active` and ID.
5. Recovery derives and writes one canonical Goal 2 application record from the existing Decision. It does not call rollback, write `active.json`, or create a Decision.
6. Missing/ambiguous Decision, orphan pre-mutation authorization, conflicting canonical bytes, hardlinks, unsafe paths, invalid store, non-parent target, or unrelated/later pointer movement rejects.
7. Inspector artifact reopen now walks intermediate paths and enforces canonical ordinary-file bytes for authorization/application in addition to its existing assessment, State, Decision, and linkage recomputation.

No `store-v3.ts`, comparator semantics, Goal 1, binding, Pi, or product source was changed in this correction.

### `FC-G2-AUDIT-P2-002`

The prior hash statements are superseded. This correction uses one explicit domain:

- `working_tree_sha256` = SHA-256 of exact checkout file bytes at Working Session handoff.

It does not label these as Git blob/archive/commit identities. The final working-tree inventory is ignored evidence at `.runs/final-capstone/g2/correction-1-working-tree-inventory.json`. Main must recompute every committed-path identity from the exact corrected Candidate after creating it.

## 3. Audit-hit evidence

The final focused test run produced `.runs/final-capstone/g2/test-cases/recovery/correction-1-recovery-summary.json`:

| Identity | Value |
|---|---|
| Assessment | `state-assessment-bd8984c37f2f4fbf76be968554e10fd4` |
| Assessment digest | `1a8391b90b5480690b13bb6ce7ef3ad4255493aedd8a491d187168291cdaeab4` |
| Admission | `admission-068e846adc94c9663dfdcf267c5ffc4b` |
| Evidence | `evidence-f1a2a04629fd8626ceca8d8d61f245ff` |
| Authorization | `rollback-authorization-52b8f0d0622350091197fb6c823a70d8` |
| Authorization digest | `de8ff09f4f595496bb6f5751e961b6e95afafa91131c622b5ccf15bcc849e2d0` |
| Application | `rollback-application-dc4e8ff509d829bfb848aebb5b176e29` |
| Application digest | `fe656f36cd7713adb0f6ce8564b8ffa489ad37c806a0883192387be5b297976a` |
| Existing V3 rollback Decision | `decision-2eceb1105315bfc4d654d82db232d08c` |
| Decision digest | `2eceb1105315bfc4d654d82db232d08c36f9f6d918a68fdc88eab5896ab3c03a` |
| Active after recovery | revision 2, version 0, `fe15b153b4d35198eaed3f31734cae18c7feacc2a25adf277faa0d937301940b` |

Decision counts are `2` before application, `3` after the deliberately obstructed post-mutation write, and still `3` after recovery. This is direct deterministic evidence that recovery completed the missing Goal 2 link without invoking rollback again.

The 10-test focused suite also proves:

- an intermediate Windows junction is rejected and no redirected assessment directory is written;
- hardlinked assessment, authorization, and application artifacts reject on idempotent reopen;
- an ordinary file obstructing the future `applications` directory causes the exact post-V3-mutation failure;
- removal of the obstruction permits deterministic recovery and subsequent idempotence;
- a fresh process independently reopens the recovered application;
- conflicting canonical authorization/application bytes reject;
- a matching authorization without a V3 rollback Decision rejects while the pre-mutation pointer remains byte-identical; and
- a later valid V3 pointer movement rejects recovery.

## 4. Commands, exits and counts

Node tests used process-only:

`NODE_OPTIONS=--experimental-loader=file:///C:/Users/HUAWEI/.codex/worktrees/2549/project2/workbench/scripts/v35g2-public-pi-loader.mjs`

| Command | Exit | Result |
|---|---:|---|
| `node 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.json --noEmit` | 1 | known fresh-worktree `TS2688`; local ignored `@types/node` absent, source checking not reached |
| `node 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.v35g2.json --noEmit` | 0 | strict canonical public-Pi declaration check passes |
| `node --test tests/final-capstone-g2-regression-state-feedback.test.ts` | 0 | 10/10 pass |
| `node --test tests/final-capstone-g1-evidence-admission.test.ts` | 0 | 24/24 pass |
| `node --test tests/v3g1-evidence-to-candidate.test.ts` | 0 | 13/13 pass |
| `node --test tests/v3g2-validate-promote-reject-rollback.test.ts` | 0 | 6/6 pass |
| `node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts` | 0 | 8/8 pass |

Corrected aggregate: **61 passed, 0 failed, 0 skipped/cancelled/todo**. The focused 10 include equivalent deterministic reproductions of the audit's junction and interrupted-application hits.

## 5. Access, Pi and scope

| Counter/action | Count |
|---|---:|
| Credential reads | 0 |
| External network calls | 0 |
| External Provider calls | 0 |
| Real-model calls | 0 |
| Dependency installations | 0 |
| Pi edits/private imports | 0 |
| Goal 1 edits | 0 |
| V3 store/comparator correction edits | 0 |
| Control-state edits | 0 |
| Staging/commits | 0 |

Both canonical Pi checkouts remain expected at `027a5847901b5dde30270abaa1041046cd2b4b55`; final cleanliness is recorded in the Working Session handoff inventory.

## 6. Remaining limits and gates

- The literal `tsconfig.json` command remains unavailable in this deliberately unprepared worktree; the canonical declaration config passes. No dependency link/copy/install was authorized.
- No process-kill injection was used. The deterministic filesystem obstruction reaches the same persistent boundary: authorization and one V3 Decision exist, the pointer changed, and application is absent.
- No multi-process stress or real Provider/model behavior was exercised. The recovery rejects any observed later pointer movement and makes no broader crash-recovery claim.
- Main re-review, corrected Candidate creation, exact committed Git blob/archive inventory, and affected-finding re-audit remain required.
- Because this is authority/integrity correction 1/2, recurrence of the same path/application class requires `DECISION_REQUIRED`; this Session makes no claim that Main or audit has closed it yet.
