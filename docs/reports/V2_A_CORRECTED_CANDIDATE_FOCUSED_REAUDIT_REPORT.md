# V2-A Corrected Candidate Focused Re-audit Report

```yaml
status: completed_with_one_blocking_finding
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
gate: J_corrected_candidate_focused_reaudit
session_role: fresh_focused_independent_audit_session
corrected_candidate_audit_baseline_commit: d6d7a82081658d1782897319dd1e615578ad77c7
corrected_candidate_tree: 4802567158a66eba6748866442c3a3e6ae8010d8
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
recommended_disposition: REVISE_V2_A_BOUNDED
highest_severity: P1
finding_count: 1
source_repairs: 0
control_state_edits: 0
git_stage_or_commit: 0
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## 1. Outcome

**Recommendation.** Do not pass the corrected focused re-audit on Candidate
`d6d7a82081658d1782897319dd1e615578ad77c7`. Return one narrowly bounded
P1-002 correction to the original V2-A Implementation Session. The appropriate
disposition is:

> `REVISE_V2_A_BOUNDED`

**Fact.** P1-001, P1-003, P1-004 and P1-005 are closed by the corrected source,
raw corrected evidence, coherent-tamper regressions and required regressions.
P1-002 is mostly corrected, including canonical parent path, semantic parent
entry content, unique parent/A/B IDs, B's empty history and final-prefix checks,
but its promised byte-exact line comparison still normalizes the last JSONL
record with `.trim()`.

**Fact.** A fresh audit-local Run remained `integrity_valid: true` after one
trailing ASCII space was appended to Candidate A's last pre-run parent-entry
line and all directly enclosing ArtifactRefs/Candidate/Journal/terminal refs
were coherently refreshed. The frozen parent Session and final Candidate
Session retained the original line bytes. The Inspector therefore accepted a
pre-run Session whose parent entry bytes matched neither authority byte-for-byte.

This is a Contract-local Inspector parsing defect. It requires no architecture,
allowlist, Pi route or permission change.

## 2. Corrected Gate A

Gate A passed before technical audit work:

- workspace exactly
  `C:\Users\HUAWEI\.codex\worktrees\7675\project2`;
- HEAD exactly `d6d7a82081658d1782897319dd1e615578ad77c7`;
- tree exactly `4802567158a66eba6748866442c3a3e6ae8010d8`;
- `git diff --quiet --` and `git diff --cached --quiet --` both exited `0`;
- root porcelain status contained exactly the four restart-authorized untracked
  Main/audit documents and no tracked/staged delta;
- shared read-only Pi path was exactly
  `D:\AI\AI_Projects\project2\.upstream\pi`, HEAD was
  `027a5847901b5dde30270abaa1041046cd2b4b55`, and Pi status was empty;
- `CURRENT_STATE.md` showed V2-A active, focused re-audit authorized, and final
  acceptance/V2-B/Credential/network/real access unauthorized.

The Gate script reported `gate_failures=0` and exit `0`.

## 3. Focused finding disposition

### P1-001 — raw Verifier authority: closed

**Fact.** `workbench/src/inspect-v2.ts:339-407` validates each primary/Candidate
VerifierResult ArtifactRef, nested source and full-output refs, expected Attempt
and Verifier identities, source digest, execution contract, exit/timeout/status
semantics and raw wire projection. Candidate `verifier_passed` is derived from
that validated raw result at `:603-647`, and Selection is replayed from derived
Candidate copies at `:838-842`.

**Fact.** The standalone P1 suite rejected both forged summary/Selection over a
raw failure and raw-output tamper. The representative corrected A-pass/B-fail
Run contained independently matching raw output/result refs and selected only A.

**Conclusion.** Coherently rehashed Candidate/Selection summaries cannot turn a
validated raw Verifier failure into a passing Hard Gate.

### P1-002 — Session byte lineage: not fully closed

**Fact.** `workbench/src/inspect-v2.ts:563-588` checks Candidate cwd, final
prefix extension, A's canonical parent path, A's parent entries, and B's
no-parent/zero-entry rule. `:810-812` requires distinct parent/A/B Session IDs.
The corrected normal evidence satisfies these checks, and the four committed
semantic/path/identity/prefix tamper variants fail closed.

**Blocking defect.** `parseSession()` at
`workbench/src/inspect-v2.ts:279` applies `.trim()` to the entire JSONL file
before retaining `rawLines`. Consequently, the comparisons at `:569` and `:579`
do not compare the final record's actual line bytes: terminal JSON whitespace is
discarded before both parent-entry and final-prefix comparisons.

Minimal audit-local reproduction:

1. Create a fresh valid Faux A-pass/B-fail Run under ignored
   `.runs/v2-a/reaudit/**`; baseline Inspector result is valid.
2. In `candidates/a/session-before.jsonl`, replace its final newline with
   `" \n"`, adding one trailing ASCII space after the final frozen parent entry.
3. Refresh `session_snapshot_before_run_ref` and
   `session_digest_before_run`, the Candidate ArtifactRef in terminal/Journal,
   and no other Session bytes.
4. Inspect the coherently rebound Run.

Observed result:

```yaml
evidence_root: .runs/v2-a/reaudit/p1-002-trailing-line-bytes-fresh-25480-1786013915811
baseline_integrity_valid: true
tampered_integrity_valid: true
tampered_errors: []
```

The reproduced command intentionally returned nonzero after observing the
unexpected valid result. The tampered pre-run entry line is byte-different from
both the frozen parent Session and the unchanged final Session prefix, yet all
P1-002 gates remained accepted.

**Impact.** The Inspector does not meet the accepted P1-002 requirement to
compare frozen parent entry line bytes and final prefix bytes exactly. The
demonstrated delta is JSON-insignificant whitespace and does not establish a
semantic history substitution, but the frozen audit invariant explicitly
requires byte lineage; passing Gate J would overclaim that invariant.

**Bounded correction.** Parse JSONL without trimming or filtering record bytes.
Permit only the producer's explicitly defined terminal newline while preserving
every record's exact bytes, then compare the parent's entry-byte slice with A's
pre-run entry-byte slice and the entire pre-run byte prefix with the final
Session. Add a coherent trailing-byte (and preferably blank-record) regression.

### P1-003 — immutable initial Workspace: closed

**Fact.** `workbench/src/run-v2.ts:774-810` clones and isolation-checks A/B,
writes separate `workspace-initial.json` ArtifactRefs, and journals both refs
before either `candidate_started`. `workbench/src/inspect-v2.ts:406-449` and
`:526-552` validate frozen path, schema, inventory/digest, Workspace ID/root,
link policy and Seed equality; `:813-814` rejects Seed/A/B shared file identity.

**Fact.** Missing, direct tamper, cross-Candidate, final-substituted and
coherently wrong initial snapshots all failed closed. The representative raw
Seed/A/B snapshots had identical inventory/digest
`5690aab9c1e7eb3905258c342d7bad4504e23377c18fec9fde39f22f9a99defa`
and disjoint recorded file identities.

### P1-004 — frozen budget recomputation: closed

**Fact.** `workbench/src/contracts/v2-types.ts:27-47` freezes Attempt `8/16/1`
and Group `24/48/3`. Manifest validation rejects any cap drift.
`workbench/src/inspect-v2.ts:292-330` derives usage from final JSONL Session
suffixes; `:593-647` derives terminal/budget/Verifier usage; and `:816-836`
recomputes Group usage as primary + A + B.

**Fact.** Manifest cap raise, raw over-cap Session, Group under-report and
terminal/gate flip all failed closed. The corrected budget Run retained A as
`budget_stopped`/ineligible and selected B; all six corrected Runs remained
within Group `24/48/3`.

### P1-005 — Manifest/Pi/live source anchor: closed

**Fact.** `workbench/src/contracts/v2-types.ts:7-15` and `:133-171` freeze Pi,
task/model/policy/strategies/tool/Skill/Verifier/prompt/source/budget identities.
`workbench/src/inspect-v2.ts:222-274` fails closed on those constants and checks
the current frozen Task/Skill/Tool/Verifier. `:220-244` consumes explicit
`projectRoot` and compares the Run source Artifact/Manifest against a live
`workbench/src` inventory. CLI/Product Surface pass `projectRoot` explicitly.

**Fact.** Rehashed Pi, revision, model and stale source inventory variants all
failed closed. Independent recomputation for every corrected Run matched live
source digest
`b5caeb1b5301d4276a9becdcbbd47df122ebfa09313d202528f134721bbb15d6`.

## 4. Commands and results

| Command / check | Exit | Result |
|---|---:|---|
| corrected Gate A assertion script | 0 | exact workspace/SHA/tree/Pi; tracked/staged clean; exactly four authorized untracked documents |
| `npm run typecheck` | 0 | strict TypeScript passed |
| `node --test tests/v2a-post-audit.test.ts` | 0 | 5/5 finding families passed, 0 failed/skipped; 19 committed tamper variants |
| `npm run v2a:test` | 0 | 11/11 passed, 0 failed/skipped |
| `node --test tests/workspace.test.ts tests/v0b-verifier.test.ts` | 0 | 11/11 passed, 0 failed/skipped |
| `npm run v1a:test` | 0 | 18/18 passed, 0 failed/skipped |
| `npm run v1a:deterministic` | 0 | deterministic gates passed; credential/network/external/real counters zero |
| `npm run v1b:test` | 0 | 31/31 passed, 0 failed/skipped |
| `node --test tests/v1c-budget-stop.test.ts` | 0 | 13/13 passed, 0 failed/skipped |
| read-only six-Run Inspector/source/fingerprint loop | 0 | 6/6 valid; live/source/summary digest equal; before/after fingerprint unchanged |
| corrected evidence tree/Summary hash check | 0 | tree `53a049a4...f9d0`; Summary `fae2d689...0789`, matching correction evidence |
| fresh P1-002 trailing-line-byte reproduction | nonzero intentional signal | baseline valid; coherently rebound tamper incorrectly remained valid with zero errors |

There were 84 unique passing Node tests in the full bound regression set
(V2-A 11, Workspace/V0-B 11, V1-A 18, V1-B 31, V1-C 13), plus the V1-A
deterministic script. The standalone 5-family P1 rerun is included in V2-A's
11 tests and is not double-counted.

## 5. Six corrected authoritative Runs

| Run | Inspector | Read-only fingerprint | Source digest |
|---|---|---|---|
| `v2a-corrected-authoritative-initial-pass` | valid | `f308c5673938d7623b50cc3ed8312e30b78e9b04142203be436588e9dd78a725` | `b5caeb1b...15d6` |
| `v2a-corrected-authoritative-a-pass-b-fail` | valid | `fc8f0e60894c8800a1b74d7896d43da3e20f2bee3632438717a15e8e312ffdce` | `b5caeb1b...15d6` |
| `v2a-corrected-authoritative-a-fail-b-pass` | valid | `c85b9b1b36b42436d6e29b778939393d540fb2d1dddd2a016185f3ab920463cf` | `b5caeb1b...15d6` |
| `v2a-corrected-authoritative-a-pass-b-pass` | valid | `b96a1586498e9f2f473ee82e7b8a219e7bfc89620c00142c11bc400ff109027a` | `b5caeb1b...15d6` |
| `v2a-corrected-authoritative-a-fail-b-fail` | valid | `4ad41688984559baf81f32031c7343db768a9332339904341305a28004cb6ba6` | `b5caeb1b...15d6` |
| `v2a-corrected-authoritative-a-budget-b-pass` | valid | `41fa14232a2ea40b6f1ce942574d7f8b53f4866dad8b232ee5ad362116cdb2cc` | `b5caeb1b...15d6` |

For each Run, the fingerprint before and after `inspectRunV2A()` was identical
and matched `SUMMARY.json`. The authoritative corrected evidence tree remained
`53a049a44bae86bac10f641a04175b63e2b4a8da298c387334de55fc5e98f9d0`.

## 6. Finding list

```yaml
findings:
  - id: V2A-REAUDIT-P1-002-LINE-BYTE-NORMALIZATION
    maps_to: V2A-AUDIT-P1-002
    severity: P1
    source: workbench/src/inspect-v2.ts:279,569,579
    evidence: .runs/v2-a/reaudit/p1-002-trailing-line-bytes-fresh-25480-1786013915811
    minimum_reproduction: append one trailing ASCII space to A pre-run final parent-entry line and coherently refresh enclosing refs
    observed: Inspector returned integrity_valid true with zero errors
    impact: exact parent-entry and final-prefix byte lineage is not independently enforced
    bounded_fix: preserve exact JSONL record/prefix bytes; add coherent terminal-whitespace regression
```

No P0, architecture, permission or route finding was identified. No additional
non-blocking observation is promoted.

## 7. Unverified and claims boundary

- Real Provider/model behavior, credentials, network and V2-B were not tested
  and remain unauthorized.
- This report does not compare A/B real effectiveness, prove strategy
  superiority, production durability, crash recovery or exactly-once Tool
  behavior.
- It does not authorize a Pi patch, private import, SDK/Extension/RPC route,
  third-party package, worktree provider, V3 work or Goal acceptance.
- Passing normal corrected Runs and all committed regressions does not close
  the newly reproduced exact-byte bypass.

## 8. Boundary and stop

No source, test, fixture, Contract, Charter, `CURRENT_STATE.md`, `AGENTS.md`, Pi,
reference, authoritative corrected evidence, stage or commit was modified. The
only audit writes were ignored `.runs/v2-a/reaudit/**` tamper evidence and this
authorized report. Credential/network/external Provider/real-model counts are
`0/0/0/0`.

**Recommended disposition: `REVISE_V2_A_BOUNDED`.** This Session does not pass
Gate J, accept V2-A or enter V2-B, and stops after this report for Main/user
review.
