# Final Capstone Goal 2 Focused Independent Audit

```yaml
status: completed_correction_required
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G2_REGRESSION_GATED_STATE_FEEDBACK
audit_owner: fresh_independent_focused_audit_session
candidate_commit: 198854d2565f3aa591da2ca083d614091a37c3fa
candidate_tree: 29a0b2e4a85fb2452763a88bfa54055735aac823
audit_worktree_head: 22299f09fc9c235f527f472e4c57335effeb73c0
audit_worktree_tree: d64ed2021ae666302bf2cbf85714425c749e0b92
finding_set: FC-G2-AUDIT-P1-001_and_FC-G2-AUDIT-P2-002
disposition: CORRECTION_REQUIRED
goal_2_correction_budget_before_audit: 0_of_2
audit_consumes_correction_round: false
goal_2_accepted: false
goal_3_authorized: false
```

## 1. Result

**Recommendation — `CORRECTION_REQUIRED`.** Do not accept Goal 2 and do not authorize
Goal 3. Return one bounded correction package to original Working Session
`019ff806-4002-7de0-83ce-a0932837bfba`.

The Candidate's Host-owned regression membership, Goal 1 admission reopen, V3 symmetric
Candidate validation/publication reuse, assessment derivation, immediate-parent
attribution checks and ordinary happy-path V3 rollback linkage are materially present.
All 58 Contract test observations pass. The focused audit nevertheless found one blocking
authority/integrity finding set: a separately assessed rollback can mutate the existing
V3 State store and then fail before its mandatory Goal 2 application record exists, with
no retry recovery; the same module also accepts an assessment root through an intermediate
junction. The seven Goal 2 tests do not exercise either boundary. A separate evidence
inventory mismatch affects two of Main's eight declared Candidate hashes.

This is the initial Goal 2 audit at correction usage `0/2`. It is therefore
`CORRECTION_REQUIRED`, not `DECISION_REQUIRED`. If the same application/path-integrity
class recurs after an authorized correction, the binding Amendment requires Main to stop
with `DECISION_REQUIRED`.

## 2. Target identity and exact bytes

**Fact.** `git rev-parse` independently resolved Candidate commit
`198854d2565f3aa591da2ca083d614091a37c3fa`, tree
`29a0b2e4a85fb2452763a88bfa54055735aac823`, and parent
`1c24d0d83c04a3671b2573c1d097b67953b64cf5`. Its delta is exactly eight files: seven
additions, one modification, 1,299 insertions and two deletions.

**Fact.** The audit worktree is on the later report/control commit `22299f09...`. A scoped
`git diff --exit-code 198854d -- <eight paths>` returned `0`; the bytes under review equal
the Candidate. Candidate blobs were also exported with `git archive` under ignored audit
evidence and SHA-256 hashed independently.

| Candidate path | Observed Candidate SHA-256 | Main inventory |
|---|---|---|
| `workbench/src/contracts/final-capstone-g2-types.ts` | `62b6ac8ab966ec674e5ec1784001958df4f40644cf7df141141811d828d5f2b6` | match |
| `workbench/src/refinement/comparator-v3.ts` | `2081fdb0d0b09ba5488a466750118ef7486403ad1560a52d4fff26dd7128d220` | match |
| `workbench/src/refinement/regression-gate-g2.ts` | `6b51dc0a7123dd71fa9eae4fb937e55537f5534ec3521d8fb91bafb106a8472f` | match |
| `workbench/src/state/state-feedback-g2.ts` | `6bee578fa3824bdd7d639fb5458cabd377ae02a727839e8796612440c62db07e` | match |
| `workbench/src/inspect-final-capstone-g2.ts` | `5ab1cd8ddbbf6037e273be4298a933e5646d987eb894984a9dd240f1fa96d3fb` | match |
| `workbench/tests/final-capstone-g2-regression-state-feedback.test.ts` | `478d519f9613c7ef16d28b46da26d86fc25941670480c7d69a3531add5753d12` | match |
| `docs/reports/FINAL_CAPSTONE_G2_IMPLEMENTATION_REPORT.md` | `8c10f8b2e25d5f7a38b7f0809888fd908edc30162032e828dbf6ed01981e6413` | **mismatch:** declares `7172d910...` |
| `docs/reports/FINAL_CAPSTONE_G2_CLOSEOUT_DRAFT.md` | `656580f155aaa87056dfd9c94102d38c73426ca2d404ae044d394a5d02fa1638` | **mismatch:** declares `1c5d1d70...` |

**Fact.** `git diff --check 198854d^ 198854d` returned `0`.

## 3. Bundled finding set

### `FC-G2-AUDIT-P1-001` — P1 blocking: rollback linkage is not failure-atomic, and its future assessment path follows intermediate junctions

**Fact — source.** `safeProjectPath` returns after lexical containment when
`requireExisting` is false, without checking any existing ancestor for a link/reparse
point (`workbench/src/state/state-feedback-g2.ts:42-53`). Both assessment derivation and
initial persistence use this mode (`:114-118`, `:179-185`). This differs from the
fail-closed existing-path checks used for State, promotion and comparison inputs.

**Fact — source.** `applyAssessedRollbackG2` persists authorization, invokes the mutating
existing `rollbackActiveStateV3`, and only afterwards creates the mandatory Goal 2
application record (`workbench/src/state/state-feedback-g2.ts:199-223`, especially
`:217-222`). There is no recovery branch for `authorization exists + matching V3 rollback
Decision exists + application missing`. On retry, absence of the application makes
`enforceCurrent` true (`:201-204`), so the already-rolled-back pointer is rejected as
stale. The independent Inspector can detect authorization/application incompleteness
(`workbench/src/inspect-final-capstone-g2.ts:38-42`) but cannot restore the missing link.

**Fact — deterministic reproduction.** The permitted ignored audit script
`.runs/final-capstone/g2-audit/reproduce-integrity-boundaries.mts` returned exit `0` and
recorded:

- an assessment persisted through `junction-parent/assessment-root`; its real path was
  `junction-target/assessment-root`, and `wrote_through_intermediate_junction` was `true`;
- before application, active State was revision `1`, version `1`, digest
  `97836dc57d3160ace710a76bbd6a89e1c5076c6cb586b26add850cdd0b5cd201`;
- an ordinary file pre-created at the future `applications` directory caused the
  post-rollback application write to fail with `EEXIST`;
- despite the thrown error, the existing V3 State store was valid and active at revision
  `2`, version `0`, digest
  `fe15b153b4d35198eaed3f31734cae18c7feacc2a25adf277faa0d937301940b`;
- the authorization existed, the application did not, the Goal 2 Inspector failed with
  `assessed rollback authorization/application completeness mismatch`, and retry failed
  with `stale active identity cannot be assessed`.

The exact outputs are frozen at:

- `.runs/final-capstone/g2-audit/junction-write-reproduction/result.json`;
- `.runs/final-capstone/g2-audit/incomplete-application-reproduction/result.json`.

The junction target was intentionally kept inside the authorized audit directory. The
reproduction proves the intermediate junction is followed. **Inference.** Because the
source performs no real-path containment check in this mode, the same call shape would
also follow an intermediate junction whose target is outside the project; the audit did
not write outside its allowed directory to demonstrate that larger impact.

**Impact.** A supposedly linked, inspectable assessed rollback can mutate authoritative
State while returning failure and leaving no complete application lineage. That violates
the Contract's persist/link/reopen requirement and its incomplete-write fail-closed
boundary. Following a future path through an intermediate junction also permits the Host
assessment write authority to be redirected. Inspector detection after mutation is not
equivalent to preventing or recoverably completing the mutation.

**Coverage gap.** The focused test's rollback Case exercises only the unobstructed happy
path (`workbench/tests/final-capstone-g2-regression-state-feedback.test.ts:215-227`). Its
tamper Case starts after both authorization and application exist (`:260-265`). No Goal 2
test covers intermediate junctions, hardlinks on idempotent artifacts, an obstructed
application destination, or recovery after the V3 Decision/pointer has already changed.

**Required bounded correction.** Within the Contract-allowed Goal 2 files:

1. canonicalize future assessment roots from the nearest existing ordinary ancestor,
   reject every existing symlink/junction/reparse segment, and enforce final real-path
   project containment;
2. require existing idempotent assessment/authorization/application artifacts to be
   ordinary singly linked canonical files before accepting their bytes;
3. make assessed rollback application recoverable across the post-V3-mutation/pre-link
   boundary, including deterministic reopen of a matching authorization plus existing V3
   rollback Decision and completion of exactly one canonical application record;
4. add focused negatives for intermediate junction, hardlink/idempotent target,
   obstructed or interrupted application write, recovery/idempotence, conflicting bytes,
   and stale/concurrent State; and
5. rerun the Contract matrix and affected finding reproduction.

This correction need not change `store-v3.ts`, the existing V3 decision table, Goal 1, or
any product source.

### `FC-G2-AUDIT-P2-002` — P2 evidence-integrity: two frozen Candidate hashes in Main review are incorrect

**Fact.** `docs/reports/FINAL_CAPSTONE_G2_MAIN_REVIEW.md:68-69` declares hashes that do not
match the exact Candidate blobs for the Implementation Report and Closeout Draft. The six
source/test hashes match. Repeated SHA-256 over a `git archive` of Candidate `198854d`
confirmed the two values in section 2 above.

**Impact.** The Candidate commit/tree remains unambiguous, so this does not independently
change source behavior. It does prevent the stated eight-file inventory from authenticating
the exact audited Candidate. Main should correct or supersede the inventory when it freezes
the corrected Candidate; the audit Session did not edit Main's control report.

## 4. Requirements that passed focused review

**Fact — Host regression authority.** The two supported applicability keys and ordered
packs are module-private (`workbench/src/refinement/regression-gate-g2.ts:31-45`). The key
is derived from the independently reopened Goal 1 trusted task context (`:89-93`,
`:136-143`); the public publication/comparison requests contain no membership or Session
policy field and use exact-key rejection (`:212-239`, `:242-267`). Reopen recomputes exact
membership, order, verifier source, task and pack/V3 regression identities (`:168-194`).

**Fact — Goal 1 authority.** `loadValidatedAdmissionG2` delegates to the Goal 1 independent
Inspector before reading the canonical admission. The fixed negative registration remains
bound to digest `365dc532...` in the module-private Goal 1 root. Goal 1's 24 tests, including
combined caller authorization forgery and negative-admission reopen/tamper Cases, pass.
The original Goal 1 caller-mintable approval defect did not recur in this Candidate.

**Fact — V3 publication preservation.** Candidate publication uses existing
`executeSymmetricValidationV3`, independently reopens selection plus validation, and calls
existing `applyValidationDecisionV3`; no new store, pointer or decision table was added
(`workbench/src/refinement/regression-gate-g2.ts:212-239`). A selected regression failure
recomputes to V3 Reject and writes no accepted version.

**Fact — attribution table.** Assessment derives its result rather than accepting one from
the caller. `retain` requires admitted PASS; ordinary negative defaults to
`needs_reassessment`; `rollback` additionally requires the same admission/context,
Verifier attribution, exact promotion/comparison frozen identity and Workspace, immediate
parent/current States, parent hard-pass/current regression and exact parent target
(`workbench/src/state/state-feedback-g2.ts:114-176`). Assessment persistence itself does
not call State mutation.

**Fact — existing rollback authority.** On the unobstructed path, application calls only
`rollbackActiveStateV3` with the assessed expected active identity and immediate parent;
the resulting immutable V3 rollback Decision and CAS pointer identities are linked and
independently recomputed. No direct `active.json` write or parallel State decision table
appears in the Candidate.

**Qualification.** These passing facts do not cure `FC-G2-AUDIT-P1-001`: the valid
unobstructed path and post-hoc detection do not make the failure boundary recoverable.

## 5. Commands, exits and counts

All test commands used the absolute public loader
`file:///C:/Users/HUAWEI/.codex/worktrees/364d/project2/workbench/scripts/v35g2-public-pi-loader.mjs`.
No dependency was installed.

| Command | Exit | Result |
|---|---:|---|
| `git rev-parse 198854d...` / `git rev-parse 198854d...^{tree}` | 0 | exact Candidate commit/tree |
| `git diff --exit-code 198854d... -- <eight paths>` | 0 | later audit worktree bytes equal Candidate |
| `git archive 198854d... -- <eight paths>` plus SHA-256 | 0 | exact table in section 2; two Main-report hash mismatches |
| `git diff --check 198854d...^ 198854d...` | 0 | clean |
| literal `tsc -p tsconfig.json --noEmit` in fresh audit worktree | 1 | `TS2688`, ignored local `@types/node` absent; source checking not reached |
| `tsc -p tsconfig.v35g2.json --noEmit` in fresh audit worktree | 0 | canonical strict source check PASS |
| literal `tsc -p tsconfig.json --noEmit` in prepared Main worktree at later control commit with identical Candidate source bytes | 0 | Main's literal strict result independently reproduced |
| `node --test tests/final-capstone-g2-regression-state-feedback.test.ts` | 0 | 7 passed, 0 failed |
| `node --test tests/final-capstone-g1-evidence-admission.test.ts` | 0 | 24 passed, 0 failed |
| `node --test tests/v3g1-evidence-to-candidate.test.ts` | 0 | 13 passed, 0 failed |
| `node --test tests/v3g2-validate-promote-reject-rollback.test.ts` | 0 | 6 passed, 0 failed |
| `node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts` | 0 | 8 passed, 0 failed |
| focused rollback setup test by name | 0 | 1 passed, 0 failed; used only to create deterministic audit-local input |
| `.runs/final-capstone/g2-audit/reproduce-integrity-boundaries.mts` | 0 | both blocking integrity manifestations reproduced |

Contract aggregate: **58 passed, 0 failed, 0 skipped/cancelled/todo**, plus canonical strict
TypeScript and an independently reproduced literal strict pass in Main's prepared layout.
The green matrix is accurate as a count but lacks the failure-boundary negatives above.

## 6. Pi, access and workspace state

**Fact.** Both canonical Pi checkouts were read-only inspected after reading their root
`AGENTS.md`:

| Checkout | Commit | Tree | Status |
|---|---|---|---|
| `D:/AI/AI_Projects/project2/.upstream/pi` | `027a5847901b5dde30270abaa1041046cd2b4b55` | `0aa996c1d6108d5ffd8ff24ff498d08720283f29` | clean |
| `D:/AI/AI_Projects/project2/.runs/g006/pi` | `027a5847901b5dde30270abaa1041046cd2b4b55` | `0aa996c1d6108d5ffd8ff24ff498d08720283f29` | clean |

| Access/action | Observed count |
|---|---:|
| Credential reads | 0 |
| External network calls | 0 |
| External Provider calls | 0 |
| Real-model calls | 0 |
| Dependency installations | 0 |
| Pi edits/private imports | 0 |
| Product executions | 0 |
| Source/test/fixture/control-state repairs | 0 |
| Staging/commits | 0 |

Only deterministic/Faux Contract tests, read-only source/control inspection and ignored
audit-local reproduction evidence were used. The only tracked write is this audit report.

## 7. Remaining unverified and claim limits

- No real Provider/model or V3.6 product behavior was exercised; it was forbidden and is
  unnecessary for this zero-access Goal.
- The audit did not kill a process at the exact instruction boundary. It induced a
  deterministic filesystem failure after the same V3 Decision/pointer mutation and before
  the application write, proving the resulting persistent state and failed recovery.
- Multi-process race stress was not run. The bounded correction must cover stale/concurrent
  behavior around the same application boundary with deterministic tests.
- The junction reproduction kept its target inside audit-local ignored storage. External
  redirection impact is an inference from the observed traversal and source path logic.
- Goal 2 is not accepted, Goal 3 remains unauthorized, and this audit makes no Final
  Capstone closeout claim.

## 8. Recommended Main disposition

1. Record this audit as `CORRECTION_REQUIRED` with Goal 2 still at `0/2` until Main
   authorizes one bundled correction round.
2. Return `FC-G2-AUDIT-P1-001` and the supporting P2 inventory correction to original
   Working Session `019ff806-4002-7de0-83ce-a0932837bfba` as one bounded package.
3. Re-review the corrected path/application failure boundary and required regressions;
   then freeze a new exact Candidate and update all eight hashes.
4. Re-audit only this finding set and necessary regressions unless new concrete evidence
   justifies broader scope.
5. If the same application/path authority or integrity class recurs after correction,
   stop with `DECISION_REQUIRED` under the accepted correction-budget Amendment.

