# V2-A P1-002 Line-byte Bounded Correction Report

```yaml
status: completed_pending_main_review_and_hit_reaudit
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
session_role: original_v2_a_implementation_owner
correction_base_commit: d6d7a82081658d1782897319dd1e615578ad77c7
correction_base_tree: 4802567158a66eba6748866442c3a3e6ae8010d8
finding: V2A-REAUDIT-P1-002-LINE-BYTE-NORMALIZATION
recommended_disposition: PASS_V2_A_LINE_BYTE_CORRECTION_PENDING_HIT_REAUDIT
gate_j: not_passed_pending_fresh_hit_specific_reaudit
architecture_change: false
scope_change: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
git_staged_or_committed: false
```

## 1. Outcome

**Fact.** The single authorized P1-002 line-byte defect is corrected. Session
inspection no longer trims, filters or newline-normalizes JSONL content before
lineage comparison. It retains complete `Buffer` bytes plus exact record byte
slices, accepts only the Pi producer's LF-terminated record format, rejects
empty/blank records and CRLF record endings, and parses JSON only after the
record boundaries are fixed.

**Fact.** Candidate A's pre-run parent entry bytes are compared record by
record with the frozen parent Session. The final Candidate Session must contain
the entire validated pre-run file as an exact raw byte prefix and must contain
additional parsed Attempt records. Candidate B still has no parent and zero
pre-run entries.

**Fact.** No Session semantic, Strategy, Selector, budget, runtime route,
Contract invariant, Pi code or permission changed.

**Recommendation.** Main should perform a narrow correction review and, if
satisfied, freeze a new Candidate identity for one fresh hit-specific re-audit.
This Session recommends only:

`PASS_V2_A_LINE_BYTE_CORRECTION_PENDING_HIT_REAUDIT`

It does not pass Gate J, accept V2-A or authorize V2-B.

## 2. Re-entry Gate

The Gate passed before any edit:

- workspace exactly
  `C:\Users\HUAWEI\.codex\worktrees\7675\project2`;
- HEAD exactly `d6d7a82081658d1782897319dd1e615578ad77c7`;
- tree exactly `4802567158a66eba6748866442c3a3e6ae8010d8`;
- tracked and staged diffs both exited `0`/clean;
- only seven existing Main/audit-owned re-audit, decision and Prompt reports
  were untracked;
- shared Pi exactly
  `D:\AI\AI_Projects\project2\.upstream\pi` at
  `027a5847901b5dde30270abaa1041046cd2b4b55`, with empty status;
- `.runs/v2-a/line-byte-corrected-evidence` did not exist;
- Credential, network, external Provider/model and real-call authority remained
  zero.

No Pause Condition was hit.

## 3. Exact bounded correction

### Source

`workbench/src/inspect-v2.ts` is the only modified source file.

- `ParsedSessionV2A` now retains `rawBytes: Buffer` and
  `recordBytes: Buffer[]`.
- `parseSession()` reads bytes directly. It requires a non-empty file whose
  final byte is the producer LF (`0x0a`). Each LF must terminate exactly one
  non-empty record; blank records and CRLF bytes fail closed.
- JSON decoding occurs only after exact record slices are retained.
- Candidate A compares its entry slices to the parent entry slices with
  `Buffer.equals()`.
- The final Candidate Session compares its complete raw prefix to the verified
  pre-run Session with `Buffer.equals()` and requires additional bytes.
- Candidate B's existing no-parent/zero-entry check is unchanged.

The fixed Pi producer evidence is
`packages/agent/src/harness/session/jsonl-storage.ts`, where
`JsonlSessionStorage.create()` and `appendEntry()` write every JSON record with
one trailing `\n`. The project did not modify Pi.

### Regression

`workbench/tests/v2a-post-audit.test.ts` adds exactly one P1-002 coherent
variant, `trailing-parent-entry-space`:

1. create a fresh valid A-pass/B-fail Run;
2. insert one ASCII space before Candidate A pre-run Session's final LF;
3. refresh only its pre-run ArtifactRef/digest and the directly enclosing
   Candidate, Journal and terminal Candidate refs;
4. leave the frozen parent Session and final Candidate Session bytes unchanged;
5. require Inspector failure explicitly naming parent-entry bytes or the raw
   final-prefix mismatch.

P1-002 now has five variants. The five post-audit families contain 20 coherent
tamper variants in total.

## 4. New write-once evidence

Evidence was generated only after final source/test verification:

```yaml
root: .runs/v2-a/line-byte-corrected-evidence
workbench_source_scope: workbench/src
workbench_source_digest: 10f85d0cd4195cb94ce269029a37bf2ed4ea70b5e0e42eb740e060726e1d08ce
summary_path: SUMMARY.json
summary_sha256: c80d1cfdd4a6cbf5df116c8152dd7eac4ad417957b1a1a74cf8ed2ec9a3b75b2
evidence_index_sha256: 7bd586f35a0debf0f63da49e9143a8233d5fd41cdcb4203749359e7851b19f52
evidence_tree_digest: 194eff335f018e2138285a96d91d41fd4f5b84a945f3487378e952ab85abeb76
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_cost_usd: 0
```

| Run ID | Recovery Group | Fingerprint |
|---|---|---|
| `v2a-line-byte-corrected-authoritative-initial-pass` | none | `ca6ba2da31e7f5814f1d8096c17e7ab871497096d8711c5e0b307e50b84bb056` |
| `v2a-line-byte-corrected-authoritative-a-pass-b-fail` | `v2a-line-byte-corrected-authoritative-a-pass-b-fail-recovery-group-01` | `fa8bf72b91295dcf4aa802bb46285620ed96f79d299eb66fae2e3c8c5174ee17` |
| `v2a-line-byte-corrected-authoritative-a-fail-b-pass` | `v2a-line-byte-corrected-authoritative-a-fail-b-pass-recovery-group-01` | `b154f07b8f041ca81eadb21a3146ed5675d7a93bd07a30ab0f69c9e8238d46de` |
| `v2a-line-byte-corrected-authoritative-a-pass-b-pass` | `v2a-line-byte-corrected-authoritative-a-pass-b-pass-recovery-group-01` | `f2e4d00ce2ab7a7a485f46f81db169571667127e99d1a380c07cb8fa032e9642` |
| `v2a-line-byte-corrected-authoritative-a-fail-b-fail` | `v2a-line-byte-corrected-authoritative-a-fail-b-fail-recovery-group-01` | `87a010418ce7210707d98c9c80687d1283b33f3144feb4ab86d5bb214e8cad47` |
| `v2a-line-byte-corrected-authoritative-a-budget-b-pass` | `v2a-line-byte-corrected-authoritative-a-budget-b-pass-recovery-group-01` | `d86bea9d3cf6e354efd0fe23ce49f0fd7e7d566fc055200221cb0f45ee492751` |

**Fact.** All six Runs independently inspected as integrity-valid. Every Run's
source digest matched final live `workbench/src`, its before/after inspection
fingerprint was identical and matched `SUMMARY.json`, and its terminal
real-access counters were `0/0/0/0`.

`workbench/scripts/run-v2a-final-validation.mjs` was identity-rewired to this
new root and a disjoint `v2a-line-byte-corrected-*` Run ID, but was not executed;
the authorized evidence set remains the required six scenarios.

## 5. Old evidence preservation

The following digests were identical before and after generation and read-only
inspection:

| Root | Before | After |
|---|---|---|
| `.runs/v2-a/evidence` | `ee5c2bc5edc0088dd779c0094ccbd2fc78b623b421307d9621126f7432c8e2ae` | same |
| `.runs/v2-a/audit` | `dbd3c53c8056693c2c85548a210024d78157929516423d80e0dfad75fa7ef210` | same |
| `.runs/v2-a/corrected-evidence` | `53a049a44bae86bac10f641a04175b63e2b4a8da298c387334de55fc5e98f9d0` | same |
| `.runs/v2-a/reaudit` | `49def50919c32a38abc4fe25a01ec2d2c25419919f835bdc4e3ee855128766b1` | same |

No old evidence file was overwritten, deleted, merged or reclassified in
place.

## 6. Verification commands and results

| Command / check | Exit | Result |
|---|---:|---|
| Re-entry workspace/HEAD/tree/status/Pi/root-absence checks | 0 | exact identities; tracked/staged clean; allowed untracked reports only |
| pre-generation old evidence tree digest loop | 0 | four preservation baselines recorded |
| `npm run typecheck` | 0 | strict TypeScript passed after source correction |
| `node --test tests/v2a-post-audit.test.ts` | 0 | 5/5 families passed, 0 failed/skipped |
| `npm run v2a:test` | 0 | 11/11 tests passed, 0 failed/skipped |
| final `npm run typecheck` | 0 | passed after the regression assertion was tightened |
| `node --check scripts/run-v2a-deterministic-suite.mjs` | 0 | passed |
| `node --check scripts/run-v2a-final-validation.mjs` | 0 | passed |
| final `node --test tests/v2a-post-audit.test.ts` | 0 | 5/5 families passed, including explicit line-byte error assertion |
| final `npm run v2a:test` | 0 | 11/11 passed, 0 failed/skipped |
| `npm run v2a:deterministic` | 0 | created the new root once; six authoritative Runs |
| six-Run Inspector/source/fingerprint loop | 0 | 6/6 valid, read-only and final-source-bound |
| post-generation five-root digest loop | 0 | all four old roots preserved; new root digest recorded |

The focused finding did not produce concrete evidence requiring any V0/V1
suite expansion, so no broad V0/V1 regression was run.

## 7. Source and report delta

| Path | Final SHA-256 | Purpose |
|---|---|---|
| `workbench/src/inspect-v2.ts` | `4c14e116bac32588e87853b7927028e862b102872141cb2b03e39042d9b6d784` | exact Session record/prefix byte parsing and comparison |
| `workbench/tests/v2a-post-audit.test.ts` | `db1aa2cb0dc4da26d67071d684d1e9e586e7136337ebed96cf33fe825604b198` | one coherent trailing-space regression |
| `workbench/scripts/run-v2a-deterministic-suite.mjs` | `1d6be71201e229661ad59e48b98d561f7026f0002171ecb69e0e8e151ba78528` | new root and six disjoint Run IDs |
| `workbench/scripts/run-v2a-final-validation.mjs` | `e940569654814049390768e568b43484d6a2753062e8cc72db2ff2a1b98d6279` | new root/identity wiring only |
| `workbench/README.md` | `4c7a92043e717cef8dec50dc77d0dd2c39e574e44dedabd51ffe384208de54e6` | exact-byte and evidence-boundary note |
| `docs/reports/V2_A_IMPLEMENTATION_REPORT.md` | report appendix | additive correction record |
| `docs/reports/V2_A_CLOSEOUT_DRAFT.md` | draft appendix | additive pending-re-audit status |
| `docs/reports/V2_A_LINE_BYTE_BOUNDED_CORRECTION_REPORT.md` | new report | this authoritative handoff |

`git diff --stat` before report edits showed exactly five implementation files,
80 insertions and 47 deletions. No package, dependency, other V2 source, V0/V1,
Pi, Contract, Charter, governance, plan or control-state file changed.

## 8. Unverified and claims boundary

**Unconfirmed.** A fresh hit-specific independent re-audit has not run. Gate J
therefore remains not passed.

**Unconfirmed.** Main has not reviewed/frozen this correction as a new
Candidate and has not accepted V2-A.

This correction does not prove real Provider/model recovery, Candidate
strategy superiority, production durability, crash recovery, exactly-once Tool
execution, SDK/Extension integration, V2-B or V3 capability.

## 9. CURRENT_STATE_UPDATE_PROPOSAL

```yaml
proposal_only: true
proposed_goal_status: line_byte_bounded_correction_complete_pending_main_review_and_hit_reaudit
proposed_disposition: PASS_V2_A_LINE_BYTE_CORRECTION_PENDING_HIT_REAUDIT
finding:
  id: V2A-REAUDIT-P1-002-LINE-BYTE-NORMALIZATION
  implementation_status: corrected
  audit_status: pending_fresh_hit_specific_reaudit
gate_j: pending
workbench_source_digest: 10f85d0cd4195cb94ce269029a37bf2ed4ea70b5e0e42eb740e060726e1d08ce
authoritative_evidence_root: .runs/v2-a/line-byte-corrected-evidence
authoritative_run_ids:
  - v2a-line-byte-corrected-authoritative-initial-pass
  - v2a-line-byte-corrected-authoritative-a-pass-b-fail
  - v2a-line-byte-corrected-authoritative-a-fail-b-pass
  - v2a-line-byte-corrected-authoritative-a-pass-b-pass
  - v2a-line-byte-corrected-authoritative-a-fail-b-fail
  - v2a-line-byte-corrected-authoritative-a-budget-b-pass
real_model_calls_observed: 0
external_provider_calls_observed: 0
credential_reads_observed: 0
network_calls_observed: 0
real_cost_usd_observed: 0
pi_core_patch_count: 0
candidate_commit: null
```

## 10. Stop

The original Implementation owner stops here for Main narrow review. No files
were staged or committed; V2-A final acceptance and V2-B remain unauthorized.
