# Final Capstone Goal 2 Correction 1 Affected-Finding Re-audit

```yaml
status: completed_pass
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G2_REGRESSION_GATED_STATE_FEEDBACK
audit_scope: FC-G2-AUDIT-P1-001_and_FC-G2-AUDIT-P2-002_plus_required_regressions
audit_owner: fresh_top_level_affected_finding_reaudit_session
rejected_candidate_commit: 198854d2565f3aa591da2ca083d614091a37c3fa
corrected_candidate_commit: b068329854e45df48336bb65c49cf666ab019622
corrected_candidate_tree: fb96ac21816c1f03bdcfc9cc38e65f07a11b8be2
main_control_commit: 62f41b56a92194110c2b20c19abec6b861ee3b63
main_control_tree: 8e20e5e0084dc35dc60e98244515a9064aa24f17
correction_usage: 1_of_2_consumed_completed
same_class_recurrence: false
disposition: PASS_FINAL_CAPSTONE_G2_CORRECTION_1_AFFECTED_FINDING_REAUDIT
goal_2_accepted: false
goal_3_authorized: false
```

## 1. Result

**Recommendation — `PASS_FINAL_CAPSTONE_G2_CORRECTION_1_AFFECTED_FINDING_REAUDIT`.**

**Fact.** The corrected Candidate closes both affected findings. The authorized
deterministic hit tests pass, the complete Goal 2 focused suite and preserved regressions
pass with **61 passed, 0 failed**, and the nine exact committed Candidate file hashes match
Main's binary-safe Git-archive inventory. The same path/application authority or integrity
class did not recur; `DECISION_REQUIRED_SAME_CLASS_RECURRENCE` is not triggered.

**Recommendation.** Return this report to Main for Goal 2 acceptance review. This audit
does not itself accept Goal 2, alter control state, or authorize Goal 3.

## 2. Required reading and exact target identity

**Fact.** Before audit work, this Session completed the repository `AGENTS.md` read order:
`CURRENT_STATE.md`, the active Goal 2 Charter and Contract, every file listed under
`required_reading`, the relevant current-plan sections, and the four audit/correction
records named in the handoff. No source or test was changed.

**Fact.** The audit checkout is detached at Main control commit
`62f41b56a92194110c2b20c19abec6b861ee3b63`, tree
`8e20e5e0084dc35dc60e98244515a9064aa24f17`. Branch ref
`codex/v2-b-bounded-r2` points to the same commit.

**Fact.** Independent Git resolution returned:

| Identity | Observed |
|---|---|
| Rejected Candidate | `198854d2565f3aa591da2ca083d614091a37c3fa` |
| Corrected Candidate | `b068329854e45df48336bb65c49cf666ab019622` |
| Corrected Candidate tree | `fb96ac21816c1f03bdcfc9cc38e65f07a11b8be2` |
| Corrected Candidate parent | `96b51cee633dbeb6e94fb0b294f9a5cd877f69d0` |
| Correction delta | 6 files, 313 insertions, 52 deletions |

The nine Candidate paths under review are byte-identical between corrected Candidate and
the later Main control checkout. `git diff --check b068329^ b068329` passed.

## 3. `FC-G2-AUDIT-P1-001` — closed

### 3.1 Future-path and existing-artifact integrity

**Fact.** `safeProjectPath` now resolves the ordinary project root, walks every existing
descendant segment, rejects symlink/junction/reparse segments and non-directory
ancestors, verifies every observed real path remains under the real project root, and
revalidates a newly created assessment root before use
(`workbench/src/state/state-feedback-g2.ts`, `safeProjectPath`, lines 42–61 and
`persistStateAssessmentG2`, lines 215–223).

**Fact.** `safeArtifactPath`, `readOrdinaryJson`, `readArtifactJson`, and
`writeIdempotentJson` require assessment, authorization, and application artifacts to be
reachable through link-safe descendants and, when present, to be ordinary singly-linked
canonical JSON files (`state-feedback-g2.ts`, lines 63–110). The independent Inspector
applies the same descendant and ordinary-file checks to authorization/application reopen
(`workbench/src/inspect-final-capstone-g2.ts`, `artifactJson`, lines 31–47 and calls at
lines 74–75).

**Fact — deterministic hit.** The Windows junction and assessment-hardlink test passed.
The junction target remained unwritten. The application/authorization hardlink checks
also passed in the recovery test. Therefore the corrected bounded implementation does not
traverse the reproduced intermediate junction/reparse/symlink path or accept multiply
linked idempotent artifacts.

**Bounded concurrency qualification.** No Contract-relevant same-class TOCTOU defect was
reproduced. An unbounded hostile process replacing filesystem components between Host
checks is outside this Contract and was not promoted into a finding. The authorized
deterministic path and link-integrity boundary passed.

### 3.2 Post-V3-mutation recovery and exact linkage

**Fact — reproduced boundary.** The focused correction test again obstructed the future
`applications` directory with an ordinary file. The first call persisted the exact Host
authorization, invoked the existing V3 rollback, created one valid V3 rollback Decision
and moved the pointer, then failed before a Goal 2 application record could be written.
The independent Inspector rejected the incomplete authorization/application pair.

**Fact — deterministic retry.** After only the obstruction was removed, retry linked the
existing Decision and wrote one canonical application. Decision counts were:

```text
before application:        2
after interrupted attempt: 3
after recovery:            3
```

The recovery evidence at
`.runs/final-capstone/g2/test-cases/recovery/correction-1-recovery-summary.json` records
`recovered_without_second_rollback: true`. The recovered identities were:

| Artifact | Identity / digest |
|---|---|
| Assessment | `state-assessment-b161df679a289a3173b96cbc0c812722` / `2983e637a02bdf040582a88e60279aec86abbbef212325618ebe7af2d357c694` |
| Authorization | `rollback-authorization-4fd0a91e825a59b57e3719c59fc9d8c1` / `0b53141187de1cc7fe79f1e55ddd06600a6fe4292a51b1b4c63de81b1a71079f` |
| Application | `rollback-application-56fdefbb9f372fd1584580e89c8c36de` / `c43a8c2beffce2011912e86d34640bfcf93e1db11bb217849dec9eb413f7ebeb` |
| Existing V3 rollback Decision | `decision-2eceb1105315bfc4d654d82db232d08c` / `2eceb1105315bfc4d654d82db232d08c36f9f6d918a68fdc88eab5896ab3c03a` |
| Recovered active | revision `2`, version `0`, digest `fe15b153b4d35198eaed3f31734cae18c7feacc2a25adf277faa0d937301940b` |

Subsequent application was idempotent, and a fresh process independently reopened the
complete lineage.

**Fact — fail-closed matrix.** Source inspection and deterministic tests establish:

- orphan authorization with no matching Decision rejects and preserves the pre-mutation
  pointer;
- missing or ambiguous matching Decision rejects because recovery requires exactly one;
- conflicting authorization/application bytes reject;
- invalid State store or missing active pointer rejects through `inspectStateStoreV3`;
- non-parent targets cannot produce a rollback assessment;
- stale pre-mutation active identity cannot apply;
- unrelated/later pointer movement rejects recovery; and
- application/Decision/State/pointer tamper fails independent Inspector reopen.

### 3.3 Authority boundary

**Fact.** Normal authority remains the existing `rollbackActiveStateV3` call with the
assessment-derived immediate-parent target and compare-and-swap active identity
(`state-feedback-g2.ts`, line 286). The recovery branch does not call rollback, create a
parallel Decision, or directly write `active.json`; it validates exactly one existing V3
Decision and current pointer, derives the application, and persists only that link
(`state-feedback-g2.ts`, lines 268–282).

**Fact.** Caller/Agent input cannot mint rollback authority: the assessment result and
authorization bytes are deterministically derived from Inspector-valid Goal 1 admission,
promotion, comparison, State lineage, immediate-parent target, and the module's exact
authorization seed. Caller-selected result fields remain inert and tested.

## 4. `FC-G2-AUDIT-P2-002` — closed

**Fact.** This audit independently created an on-disk tar with:

```powershell
git archive --format=tar --output=<ignored-candidate.tar> b068329854e45df48336bb65c49cf666ab019622 -- <nine paths>
tar -xf <ignored-candidate.tar> -C <ignored-archive-directory>
Get-FileHash -Algorithm SHA256 -LiteralPath <each-extracted-file>
```

This is binary-safe Git archive extraction; no Git blob bytes passed through a PowerShell
text pipeline. The tar SHA-256 was
`5e828ace68699514a8bbc81b818a6a8c82f378200ad960afd4ad0d8a0198f550`.

All nine extracted regular-file hashes match
`FINAL_CAPSTONE_G2_CORRECTION_1_MAIN_REREVIEW.md` exactly:

| Path | Observed Git-archive SHA-256 |
|---|---|
| `docs/reports/FINAL_CAPSTONE_G2_CLOSEOUT_DRAFT.md` | `6c8151cd2e00bfddd8049dbac7631a6679983b535c31c48973c85482ce49dd1d` |
| `docs/reports/FINAL_CAPSTONE_G2_CORRECTION_1_REPORT.md` | `a0031a065e845dc2553872a2f497f069ea3d46af889ad10c5ba8be9b1678e09e` |
| `docs/reports/FINAL_CAPSTONE_G2_IMPLEMENTATION_REPORT.md` | `3053c1f825485c99ac9282bb439e75bf27eed25d5a46368ce15f84a622646167` |
| `workbench/src/contracts/final-capstone-g2-types.ts` | `62b6ac8ab966ec674e5ec1784001958df4f40644cf7df141141811d828d5f2b6` |
| `workbench/src/inspect-final-capstone-g2.ts` | `8bbbf9964a00cd39124462ea9172ed141af5c90b71e81a2fba04890d662598a2` |
| `workbench/src/refinement/comparator-v3.ts` | `2081fdb0d0b09ba5488a466750118ef7486403ad1560a52d4fff26dd7128d220` |
| `workbench/src/refinement/regression-gate-g2.ts` | `6b51dc0a7123dd71fa9eae4fb937e55537f5534ec3521d8fb91bafb106a8472f` |
| `workbench/src/state/state-feedback-g2.ts` | `e4507977a510c28f638ea447d5d16306225748ac160c8bc1c850460999c26ebb` |
| `workbench/tests/final-capstone-g2-regression-state-feedback.test.ts` | `e16b1552c375e0a51a88115326e0d74f5782ff0f9d4e52b528910b8aa4a0b7a6` |

Observed mismatches: **0 of 9**. Main's explicit committed-byte hash domain is correct.

## 5. Commands, exits, and counts

All Node tests used only the local public-Pi loader through process-local `NODE_OPTIONS`:

`--experimental-loader=file:///C:/Users/HUAWEI/.codex/worktrees/120b/project2/workbench/scripts/v35g2-public-pi-loader.mjs`

| Command | Exit | Result |
|---|---:|---|
| `git rev-parse b068329...` and `git rev-parse b068329...^{tree}` | 0 | exact Candidate commit/tree |
| `git diff --exit-code b068329... 62f41b5... -- <nine paths>` | 0 | control checkout bytes equal Candidate |
| binary-safe `git archive --output=<tar>` + `tar -xf` + `Get-FileHash` | 0 | 9/9 hashes match |
| `git diff --check b068329...^ b068329...` | 0 | clean |
| hit-only `node --test --test-name-pattern='future assessment roots|post-mutation application obstruction|recovery rejects conflicting' tests/final-capstone-g2-regression-state-feedback.test.ts` | 0 | 3 passed, 0 failed |
| literal `tsc -p tsconfig.json --noEmit` | 1 | `TS2688`: fresh audit worktree lacks ignored local `@types/node`; source checking not reached |
| canonical `tsc -p tsconfig.v35g2.json --noEmit` | 0 | strict public-Pi declaration source check PASS |
| `node --test tests/final-capstone-g2-regression-state-feedback.test.ts` | 0 | 10 passed, 0 failed |
| `node --test tests/final-capstone-g1-evidence-admission.test.ts` | 0 | 24 passed, 0 failed |
| `node --test tests/v3g1-evidence-to-candidate.test.ts` | 0 | 13 passed, 0 failed |
| `node --test tests/v3g2-validate-promote-reject-rollback.test.ts` | 0 | 6 passed, 0 failed |
| `node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts` | 0 | 8 passed, 0 failed |

Aggregate required matrix: **61 passed, 0 failed, 0 skipped/cancelled/todo**, plus canonical
strict TypeScript. The literal `TS2688` is the previously documented dependency-layout
execution fault and does not contradict Main's literal pass against identical integrated
source. No dependency copy/link/install was authorized or performed.

## 6. Findings and Amendment decision

| Finding | Priority | Re-audit disposition |
|---|---:|---|
| `FC-G2-AUDIT-P1-001` path/application authority and integrity | P1 | CLOSED; no same-class recurrence reproduced |
| `FC-G2-AUDIT-P2-002` exact Candidate hash domain/inventory | P2 | CLOSED; 9/9 exact Git-archive hashes match |

No new finding was opened. The audit did not split either finding class or broaden into a
platform/general audit.

**Amendment result:** `DECISION_REQUIRED_SAME_CLASS_RECURRENCE` is not applicable because
the same corrected class did not recur.

## 7. Access, Pi, and workspace state

After reading the applicable pinned Pi `AGENTS.md`, both canonical Pi checkouts were
read-only verified:

| Pi checkout | Commit | Tree | Status |
|---|---|---|---|
| `D:/AI/AI_Projects/project2/.upstream/pi` | `027a5847901b5dde30270abaa1041046cd2b4b55` | `0aa996c1d6108d5ffd8ff24ff498d08720283f29` | clean |
| `D:/AI/AI_Projects/project2/.runs/g006/pi` | `027a5847901b5dde30270abaa1041046cd2b4b55` | `0aa996c1d6108d5ffd8ff24ff498d08720283f29` | clean |

| Access/action | Observed count |
|---|---:|
| Credential reads | 0 |
| External network calls | 0 |
| External Provider calls | 0 |
| Real-model calls | 0 |
| Dependency installations/copies/links | 0 |
| Pi edits/private imports | 0 |
| Product executions | 0 |
| Product source/test/fixture/control-state repairs | 0 |
| Staging/commits | 0 |

The only tracked write by this Session is this authorized report. Audit-local archive
evidence is ignored under `.runs/final-capstone/g2-reaudit/`.

## 8. Remaining unverified and claim limits

- No Credential, network, Provider/model, real-model, Docker product, or V3.6 real-product
  behavior was exercised; all were forbidden and unnecessary for this deterministic Goal.
- No process was killed at an exact instruction boundary. The deterministic filesystem
  obstruction reproduces the same persistent post-V3-mutation/pre-application state and
  proves retry completion without a second rollback.
- No multi-process race stress or unbounded hostile filesystem adversary was tested. The
  Contract-relevant deterministic stale/later-pointer behavior rejects; no broader OS
  transactional or adversarial concurrency claim is made.
- This report closes only the two affected audit findings. Main retains Goal 2 acceptance,
  control-state update, Closeout, and all Goal 3 authority.

## 9. Final disposition

# PASS_FINAL_CAPSTONE_G2_CORRECTION_1_AFFECTED_FINDING_REAUDIT
