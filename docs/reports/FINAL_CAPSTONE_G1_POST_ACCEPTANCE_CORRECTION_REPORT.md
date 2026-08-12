# Final Capstone Goal 1 Post-acceptance Correction Report

```yaml
status: correction_completed_pending_main_rereview
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
finding_id: FC-G1-POSTACCEPT-P1-001
correction_budget: 1_of_1_consumed_pending_main_rereview
control_baseline_commit: 092fb6b771b807381074c6b37af93c6f39eb7bb7
control_baseline_tree: 3adb6d43188f9506647849946714bdb8ad91b7e5
credential_reads_observed: 0
external_network_calls_observed: 0
external_provider_or_model_calls_observed: 0
real_model_calls_observed: 0
git_staging_or_commit: false
```

## Result

**Recommendation.** Preserve `PASS_FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION` and
close `FC-G1-POSTACCEPT-P1-001` after Main re-review.

**Fact.** The private `FIXED_HOST_APPROVALS_G1` root now contains exactly one additional
approval:

```text
final-capstone-g1-v3-project/g1-host-v3-negative
  -> fixed-approval-g1-host-v3-negative
  -> 365dc532234a44c4d9b0cabc9e39c2e94989989f5b4ead7a2b7b230a753b9ff8
```

No public API, registration schema, admission schema, State authority or runtime enrollment
surface changed. The existing positive V3 approval and all caller-forgery negatives remain
unchanged.

## Gate and identity record

Before editing, root `HEAD` was
`092fb6b771b807381074c6b37af93c6f39eb7bb7` with tree
`3adb6d43188f9506647849946714bdb8ad91b7e5`; tracked and staged state were clean.
Pinned upstream and G006 Pi were both clean at
`027a5847901b5dde30270abaa1041046cd2b4b55` / tree
`0aa996c1d6108d5ffd8ff24ff498d08720283f29`.

The accepted pre-change source hashes were:

| Path | SHA-256 |
|---|---|
| `workbench/src/refinement/evidence-admission-g1.ts` | `a71b813c59f4e008b8f6c83a6381b500a7476cdd2a8e525eb575a927e9911493` |
| `workbench/tests/final-capstone-g1-evidence-admission.test.ts` | `5b9696418a2c2bb8eb8e045d85c0ddad4f8f26f6bf27ef2cc698c50d57721cf2` |

The pinned TypeScript entry point was
`D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc`, SHA-256
`8d5fa5bd883fec0979fc2004f1fea1d99aef40570155d550eadc0b03b55513bf0`
(case-insensitive hexadecimal; normalized lowercase below:
`8d5fa5bd883fec0979fc2004f1fea1d99aef40570155d550eadc0b03b55513bf0`).

## Exact correction

Only two tracked implementation/test files changed:

| Path | Change | Final SHA-256 |
|---|---|---|
| `workbench/src/refinement/evidence-admission-g1.ts` | Added the one exact private negative approval tuple. | `b6dad2af606fd0dac24f40947e60ad8b36e62360d1596305cdcdd3e90e27b0fc` |
| `workbench/tests/final-capstone-g1-evidence-admission.test.ts` | Added deterministic promoted-bound negative V3 generation, admission/reopen identity checks, tamper checks and exact-root negatives. | `7cd24b100482a2057c6fcc59280d0c8a3e1d30df638082af7368f2d24d828400` |

The test fixture keeps the promoted non-base State, applicable prompt-addendum binding,
promotion Decision/admission lineage, matching runtime path, Case Authority, one settled
Direct public Pi Faux execution and frozen independent Verifier. It changes only the
follow-up Workspace byte checked by that Verifier so the legitimate Verifier returns
`failed`.

## Red-first evidence

The untouched focused suite passed 22/22 through the existing approved public-Pi loader.
After adding the negative fixture and tests but before the approval tuple, the focused run
exited `1`: 21 passed and three failed. The primary failure was the required rejection:

```text
Host-owned approval root does not approve this registration identity/digest
```

The other two failures were dependent reopen checks lacking the not-yet-created negative
admission ID. After adding only the exact tuple, authority/reopen/tamper paths passed. One
test-only expected projection initially omitted the preserved `active_binding_revision`;
including that fourth exact State identity field produced the final 24/24 pass.

## Negative admission identity

| Field | Value |
|---|---|
| Registration | `g1-host-v3-negative` |
| Registration digest | `365dc532234a44c4d9b0cabc9e39c2e94989989f5b4ead7a2b7b230a753b9ff8` |
| Admission | `admission-d7d749ba6b637b4345d258b5c70217af` |
| Admission digest | `6d9a5ddf59b24797d2bc456f62657441de347025aaec57f8c9dfebdbc8cfb2d5` |
| Frozen Evidence | `evidence-4acc76a00245b8dd100541bbd5be6f73` |
| Evidence digest | `0cc13d22e4ee7bef471c90d3a52d1221f1490a6bd003ab034f31a2dbc4f38c98` |
| Source Run | `g1-v3-bound-negative-followup` |
| Outcome / Verifier / attribution | `failed` / `failed` / `verifier` |
| Existing projector result | `hard_failure` |
| Binding revision / State version | `1` / `1` |
| State digest | `8c26430e7b17adfec0e59f329eb371b75cb97965f31aa16b5b885d0dbe03790a` |
| Promotion Decision | `decision-761cd851f23ad2b4f825b36ef2b8c334` |
| Decision digest | `761cd851f23ad2b4f825b36ef2b8c334a9a0e6bf6cb3cf3a1c913fcd14d0bd39` |
| Promotion admission digest | `32d166ccc03a359aedbd8d2704bc9c55108d59fa99b4a9df950a0f9a14338132` |
| Binding digest | `b286259a06734f80f70756c7cd9a256444ac75af3880b2c8631db771e7b44d73` |
| Binding-context digest | `689308fa34fb8d948c030cced20036042ffcc7073144aa548b60f5ed22fc503e` |
| Case Authority digest | `98d6e6324899410ec0cb533d376e2ef61423d1a60a14ae0dd9732247c0acd677` |
| Runtime | `prompt_addendum`, one settled event |

The runtime counters are one local Faux Provider dispatch, zero Tool calls, and
Credential/network/external-Provider/real-model counts `0/0/0/0`.

## Verification

The fresh worktree had no dependency tree. An attempted temporary junction to the accepted
project dependency tree resolved runtime packages but inherited stale nested V0-A links.
PowerShell then failed to remove the exact validated junction with a
`NullReferenceException`. Main explicitly directed this Session not to retry deletion,
unlinking, moving or modifying it and to leave it as ignored environment residue:

```text
C:/Users/HUAWEI/.codex/worktrees/77e0/project2/workbench/node_modules
  -> D:/AI/AI_Projects/project2/workbench/node_modules
```

Therefore the literal typecheck command stopped before source checking with missing Node
types; adding only `--typeRoots` then exposed the same stale Pi package links. No install or
dependency mutation was performed. The authoritative strict check used ignored overlay
`.runs/final-capstone/g1/typecheck/tsconfig.json`, which extends the unchanged root
`tsconfig.json` and maps types directly to the same pinned G006 declarations plus the
known-good accepted Goal 1 Node types.

| Command | Exit | Result |
|---|---:|---|
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p ../.runs/final-capstone/g1/typecheck/tsconfig.json --noEmit` | 0 | strict TypeScript PASS using pinned-G006 overlay |
| `node --test tests/final-capstone-g1-evidence-admission.test.ts` | 0 | 24 passed, 0 failed |
| `node --test tests/v3g1-evidence-to-candidate.test.ts` | 0 | 13 passed, 0 failed |
| `node --test tests/v3g2-validate-promote-reject-rollback.test.ts` | 0 | 6 passed, 0 failed |
| `node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts` | 0 | 8 passed, 0 failed |

The four Node test commands ran with the existing
`workbench/scripts/v35g2-public-pi-loader.mjs` supplied through `NODE_OPTIONS`; it resolves
only public Pi packages to pinned G006. Aggregate: **51 passed, 0 failed**, plus clean
strict TypeScript. `git diff --check` passed.

## Authority and tamper coverage

- Existing positive `g1-host-v3` admission still passes.
- The new exact negative registration passes independently through
  `inspectTrustedEvidenceAdmissionG1` after admission.
- Verifier source/result drift and admission-digest tamper fail reopen.
- A changed/unknown negative registration ID/digest fails at the private root.
- A matching caller-created approval object remains inert and cannot cross file admission.
- Arbitrary paths, cross-project input, unknown families/keys, unbound V3 State and all
  prior combined registration/authorization forgeries remain rejected.

## Evidence, residue and limits

Ignored `.runs/final-capstone/g1/` contains 630 files / 1,108,518 bytes:

| Subtree | Files | Bytes |
|---|---:|---:|
| `admissions/` | 6 | 115,714 |
| `host-registrations/` | 9 | 7,380 |
| `negative/` | 389 | 717,654 |
| `sources/` | 225 | 266,985 |
| `typecheck/` | 1 | 785 |

The ignored/untracked `workbench/node_modules` junction is environment residue only. It is
not staged, committed, inventoried as product evidence or claimed as a source deliverable.

No Goal 2 partial source, accepted State/history, control state, Charter, Contract, prior
Goal 1 report, Pi, product source or Git index changed. This Session cannot accept Goal 1,
resume Goal 2, update `CURRENT_STATE.md`, stage or commit. Main re-review remains required;
the Goal 1 post-acceptance correction budget is exhausted at `1/1`.

