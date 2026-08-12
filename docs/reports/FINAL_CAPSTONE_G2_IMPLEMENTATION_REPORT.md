# Final Capstone Goal 2 Implementation Report

Status: `COMPLETED_PENDING_MAIN_REREVIEW`

Recommended Main disposition: re-review correction round 1/2 against `FC-G2-AUDIT-P1-001` and `FC-G2-AUDIT-P2-002`, freeze a corrected Candidate only if the finding set is closed, and run the bounded affected-finding re-audit. This Working Session does not accept Goal 2 or authorize Goal 3.

## 1. Authority and Gate A

- **Fact — Control Baseline:** detached `HEAD` is exactly `e1e5f8d1281424b97487c5d52c7562cf16076e4a`; tree is `ba10d478995385e90780cc9de2183636055edeb7`. Main explicitly clarified that detached HEAD is expected for this generated worktree. Initial tracked, staged, and untracked status was empty.
- **Fact — branch authority:** the authorized branch name is `codex/v2-b-bounded-r2`. This Session did not switch, move, stage, or commit it.
- **Fact — pinned public Pi:** both `D:/AI/AI_Projects/project2/.upstream/pi` and `D:/AI/AI_Projects/project2/.runs/g006/pi` were independently read-only checked at commit `027a5847901b5dde30270abaa1041046cd2b4b55`, tree `0aa996c1d6108d5ffd8ff24ff498d08720283f29`, with empty status. No Pi bytes were changed or copied into this worktree.
- **Fact — public boundary probe:** with the checked-in public-Pi loader addressed as a file URL, `AgentHarness` and `JsonlSessionRepo` both resolved as public functions. Loader SHA-256 is `b12bc1c4a437159576b99347fda9917a2d0a1ded97a8bb76c185a1e0a9cd137a`.
- **Fact — compiler:** pinned TypeScript is 5.9.3; `typescript/bin/tsc` SHA-256 is `8d5fa5bd883fec0979fc2004f1fe1d99aef40570155d550eadc0b03b55513bf0`.
- **Fact — Goal 1 binding:** tracked Goal 1 authority remains the fixed registration `g1-host-v3-negative` with digest `365dc532234a44c4d9b0cabc9e39c2e94989989f5b4ead7a2b7b230a753b9ff8`. Per Main clarification, Goal 2 source-generates legitimate Inspector-valid follow-ups under that fixed authority and freezes their worktree-local admission/evidence identities; it neither copies correction-Session ignored evidence nor claims those generated IDs equal the accepted correction record.
- **Fact — correction authority:** Main rejected Candidate `198854d2565f3aa591da2ca083d614091a37c3fa` and authorized the indivisible round-1 package at control commit `96b51cee633dbeb6e94fb0b294f9a5cd877f69d0`. Goal 2 correction usage is now `1/2`.

## 2. Exact allowed delta

| File | Delta |
|---|---|
| `workbench/src/contracts/final-capstone-g2-types.ts` | new narrow Goal 2 contracts |
| `workbench/src/refinement/comparator-v3.ts` | minimal additive accepted-State symmetric comparison primitive; existing Candidate behavior preserved |
| `workbench/src/refinement/regression-gate-g2.ts` | new Host-owned applicability and regression gate |
| `workbench/src/state/state-feedback-g2.ts` | assessment/application plus round-1 path and recovery correction |
| `workbench/src/inspect-final-capstone-g2.ts` | independent reopen Inspector plus round-1 artifact-path validation |
| `workbench/tests/final-capstone-g2-regression-state-feedback.test.ts` | focused 10-test Gate B/C/D and audit-hit matrix |
| `docs/reports/FINAL_CAPSTONE_G2_IMPLEMENTATION_REPORT.md` | updated implementation report |
| `docs/reports/FINAL_CAPSTONE_G2_CLOSEOUT_DRAFT.md` | updated Main-owned acceptance draft |
| `docs/reports/FINAL_CAPSTONE_G2_CORRECTION_1_REPORT.md` | round-1 report |

No `store-v3.ts`, `binding-v3.ts`, `inspect-v3.ts`, Goal 1 source/test/report, accepted State/history, Contract, Charter, `CURRENT_STATE.md`, `AGENTS.md`, Pi, reference, dependency, or control-state file was edited.

Hash-domain rule: all hashes created by this Working Session after correction are explicitly `working_tree_sha256`, meaning SHA-256 over checkout bytes at handoff. They are not Git blob, archive, tree, or committed-Candidate identities. The ignored inventory is `.runs/final-capstone/g2/correction-1-working-tree-inventory.json`. Main alone must recompute the exact committed-path Git archive inventory after freezing the corrected Candidate; the superseded two Markdown hash claims are not reused.

## 2.1 Correction round 1/2

- Future assessment roots are walked from the ordinary project root through every existing segment. Junction/reparse paths, non-directory ancestors and real-path escapes reject.
- Existing assessment, authorization and application artifacts require a link-safe descendant path plus ordinary singly-linked canonical JSON bytes.
- Interrupted post-V3 application persistence recovers only from an exact authorization, exactly one matching valid rollback Decision and a pointer still naming that Decision. Recovery writes only the missing application and never invokes rollback again.
- Orphan authorization, missing/ambiguous Decision, conflicting bytes, invalid store and later pointer movement reject.

## 3. Implementation and reused authority

- `executeRegressionGatedCandidatePublicationG2` independently reopens an Inspector-valid Goal 1 admission, derives one of two module-private applicability keys, materializes the exact non-empty ordered Host pack, runs existing `executeSymmetricValidationV3`, independently reopens selection plus validation, then calls existing `applyValidationDecisionV3`.
- The two frozen contexts are `typescript-maintenance/verifier-failure -> [protected-stability]` and `typescript-maintenance/none -> [protected-stability, subject-fixed]`. Caller-supplied pack membership is not in the accepted request schema.
- `executeSymmetricAcceptedStateComparisonV3` is the only V3 comparator extension. It reuses the existing arm runner, external Verifier runner, fresh public JSONL Session policy, raw-evidence metrics, workspace isolation, and independent arm inspection for accepted immediate-parent versus current State.
- `persistStateAssessmentG2` derives exactly `retain`, `needs_reassessment`, or `rollback`; persists canonical write-once bytes before mutation; and never accepts a caller-selected result.
- Rollback requires the same exact admission, frozen Workspace/task/Verifier/pack/tool/model/budget/Session identity as promotion, current-versus-immediate-parent lineage, a parent pass of all hard checks, a current regression, and Verifier attribution. The separate `applyAssessedRollbackG2` creates Host authorization and calls existing `rollbackActiveStateV3` with CAS; it never writes the active pointer directly.
- `inspectFinalCapstoneG2` recomputes Goal 1 admission, binding/Decision/State provenance, promotion, comparison, assessment, authorization, application, V3 rollback Decision, and canonical State-history bytes after process reopen. Historical assessments remain inspectable after later legal pointer movement.

## 4. Frozen regression identities

Stable source identities:

| Check | Source SHA-256 |
|---|---|
| `protected-stability` | `5e9b5336b85f31182072563604d5d2751b78f715e1861bac4bf0df6a0c0c0538` |
| `subject-fixed` | `e13656aa94d20e8cc91aec0423358f80b37e589ae10d93393a09e85a8787dc0f` |

The focused evidence froze exact selection identities. Because the frozen task includes the source Workspace identity, pack digests are evidence-instance-specific:

| Case | Applicability | Ordered checks | Pack digest | Selection / digest |
|---|---|---|---|---|
| `pack-one` | `typescript-maintenance/verifier-failure` | `protected-stability` | `11bd0380579a7d94367e5fa32493a0509936e794ccb73d41438274a4e09b51de` | `regression-selection-a52de921f8b6041151f65b2826931218` / `276a716bf104325d501cc9ff489943270fe5657070e8425467a2d53fb67fe3b7` |
| `pack-two` | `typescript-maintenance/none` | `protected-stability`, `subject-fixed` | `7107908444b233985ace6ad1ce6aaba65b28ef459dcd0076fa34af2086e08c72` | `regression-selection-3e7c0f665d9addaf351fdb47a6a2d474` / `65b4cbe0e4342e69506e800e3c8170691f6ea5f4d3dbe6e8a59a8a1f987e7065` |

## 5. Assessment and application evidence

Representative worktree-local generated identities from the final focused run:

| Result | Assessment / digest | Admission / digest | Evidence / digest |
|---|---|---|---|
| `retain` | `state-assessment-b6251b8beb3e1647bacc7181b5e0e64b` / `c803a9f7e232758c0b5d1826a462f2193dd26b8bb185fd5d4ec1255fae24d4cb` | `admission-c6443b6cee36aa6260458f756c17182e` / `11e4ffe45d34dccdbc48885ae5fd3cdc1f3e1195553c1f8f68ada42c6d8e4865` | `evidence-9d3b858d670e8a44a3475d3449a336ee` / `4d099d473f8b576a0ce156442bede724fded992b186d763c819d166288235ac5` |
| `needs_reassessment` | `state-assessment-bf8cbfdc038d47a524319beeeef7cf01` / `6d728232db1acb0c20b31239d22a02c0172a9c01ea252866b6481555c532f949` | `admission-495e0ef737172bf167bc44ca412844c7` / `269f2ada55ca1aa350ac9f5a4e1ce688936af64425fd8cb3f36f9ff14e6a32c4` | `evidence-8221489685d2504465a249c43b2c78a5` / `4d9171d902afda3e72c303ef3e33f44a8e71c19579a465369319d60c6c66fdab` |
| `rollback` | `state-assessment-ef85ef70089883755482ab564dc445ec` / `dfc9963fd6644ec8a74960423e4627295b5acda470338f1df65aa6f89ac66a11` | `admission-dda2f6f5f3e24ec7de241cb0c8482902` / `ba3d692b7cc5c716105ef6a08241fa3873f5dfa28a3b201809237058d0ba5722` | `evidence-54cfa280401a258c30f95a4c8816ef25` / `225fc57b250cfceb9c99fd220ad5edc9bab13133a8af78ede0d5ffe44c2378f6` |

Rollback linkage:

- comparison `final-capstone-g2-rollback-comparison`, digest `20f8805c10663c53f43af0c15cb760415ccf9a72c92c373acd5745b503143c01`;
- authorization `rollback-authorization-6a4fc3e153b390a68f393804a85da290`, digest `d9343262298c69755edaa676525036385fb378454c53b5aafedda1eac47bde2a`;
- application `rollback-application-76f55b2498e055a94dcf7153f03c2904`, digest `6b592ceeee0fa30f338ddef0fb6bfbd1513f33c6bc4e3f208aff849b78911c85`;
- reused V3 rollback Decision `decision-2eceb1105315bfc4d654d82db232d08c`, digest `2eceb1105315bfc4d654d82db232d08c36f9f6d918a68fdc88eab5896ab3c03a`.

Before assessment and after assessment, active identity remained revision 1/version 1/State `97836dc57d3160ace710a76bbd6a89e1c5076c6cb586b26add850cdd0b5cd201`; active bytes SHA-256 remained `79c3d86e7172d33f5fd8b6a65a4a74d158424b2484a2ca8a61f0b1eb3804b9c1`; State tree remained `cdc84c54efd45d8323fa7ce2861434c09f4e31924c72a0befc0ddf4970fffc28`. Separate Host application moved only the pointer through V3 CAS to revision 2/version 0/State `fe15b153b4d35198eaed3f31734cae18c7feacc2a25adf277faa0d937301940b`; resulting State tree is `d48736a20094081180d9928b717f207a5c28310a7ff8da9b7a84e18080107208`.

Workspace tree stayed `0a74757d4d769ec12fb7e7864ba9730ffdb732f17ab18e2e93125b1ba32eca79` and Goal 1 source tree stayed `723fc3d9e615329e4ae1f766a6069e3ecee96f8acce3381fa36366f273f5fa09` across assessment and application. Exact summary: `.runs/final-capstone/g2/test-cases/rollback/g2-evidence-summary.json`.

## 6. Verification commands and results

All Node test commands used process-only `NODE_OPTIONS=--experimental-loader=file:///C:/Users/HUAWEI/.codex/worktrees/2549/project2/workbench/scripts/v35g2-public-pi-loader.mjs` because this generated worktree intentionally has no ignored local Pi/dependency links.

| Command | Exit | Result |
|---|---:|---|
| `node 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.json --noEmit` | 1 | environment-layout failure `TS2688`: local ignored `@types/node` absent; no source diagnostics were reached |
| same command plus canonical `--typeRoots` | 1 | confirms `tsconfig.json` also lacks portable public Pi path mappings in a fresh worktree |
| `node 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.v35g2.json --noEmit` | 0 | strict check passes against canonical public Pi declarations |
| `node --test tests/final-capstone-g2-regression-state-feedback.test.ts` | 0 | 10/10 pass, including audit-hit path/recovery/hardlink/concurrency equivalents |
| `node --test tests/final-capstone-g1-evidence-admission.test.ts` | 0 | 24/24 pass |
| `node --test tests/v3g1-evidence-to-candidate.test.ts` | 0 | 13/13 pass |
| `node --test tests/v3g2-validate-promote-reject-rollback.test.ts` | 0 | 6/6 pass |
| `node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts` | 0 | 8/8 pass |

Total corrected matrix: **61/61 pass**, zero skipped/cancelled/todo. This is the original 58-observation Contract matrix plus three focused correction tests. `git diff --check` passes.

## 7. Zero-access and boundary accounting

| Counter/action | Count |
|---|---:|
| Credential reads | 0 |
| Network calls | 0 |
| External Provider calls | 0 |
| Real-model calls | 0 |
| Dependency installations | 0 |
| Pi edits/private imports | 0 |
| Goal 1 edits | 0 |
| Control-state edits | 0 |
| Staging/commits | 0 |

Only Faux/deterministic local execution and the existing public emitted Pi boundary were used.

## 8. Remaining unverified and decisions

- **Unconfirmed due environment layout:** the literal `tsconfig.json` command cannot pass in this generated worktree without creating the links/copies Main expressly prohibited. The checked-in canonical declaration config `tsconfig.v35g2.json` passes strictly. Main should classify this as the documented fresh-worktree environment limitation or run the literal command in a prepared worktree; no product/config expansion is recommended here.
- Real Provider/model behavior is intentionally unverified and unauthorized.
- Main correction re-review, corrected Candidate freeze, and affected-finding re-audit remain outstanding.
- No architecture, scope, or product decision is requested from this Working Session.

## 9. Report-only `CURRENT_STATE_UPDATE_PROPOSAL`

Do not apply before Main correction re-review and affected-finding re-audit. If accepted, Main may record Goal 2 as `PASS_FINAL_CAPSTONE_G2_REGRESSION_GATED_STATE_FEEDBACK`, cite the corrected frozen Candidate plus initial audit, correction report, rereview and re-audit, preserve Goal 1 and all accepted history, and keep Goal 3 unauthorized until its own Contract. This Session did not edit `CURRENT_STATE.md`.
