# V2-A Post-audit Bounded Correction Report

```yaml
status: correction_complete_pending_main_review_and_focused_reaudit
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
correction_owner: original_v2_a_implementation_session
failed_candidate_audit_baseline: ece8856891f950a090f9adabf75ca8c8e707ce53
control_baseline_commit: 228973b7e7b826468c54b84f28faf8d9c0c33a6d
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
accepted_findings_corrected: 5
recommended_disposition: PASS_V2_A_BOUNDED_CORRECTION_PENDING_REAUDIT
gate_j: not_claimed
v2_a_final_acceptance: not_claimed
v2_b_authorized: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_cost_usd: 0
git_stage_or_commit_performed: false
```

## 1. Outcome

**Recommendation.** The five accepted P1 findings are corrected within the
existing V2-A Contract allowlist. Main should perform its narrow correction
review and, if satisfied, freeze a corrected Candidate for a fresh focused
re-audit limited to P1-001 through P1-005 and the required regressions.

**Fact.** No architecture fork, route change or allowlist expansion was
needed. The Direct public emitted `AgentHarness` and `JsonlSessionRepo` route,
the exactly-two-path runtime, the temporary-copy Workspace provider and the
selector policy remain unchanged.

**Fact.** The corrected Inspector no longer accepts Candidate/Group summaries
as evidence authority for the audited boundaries. It reads the primary and
Candidate raw Verifier results and nested Artifacts, validates byte-exact
Session lineage and prefix extension, checks immutable pre-run Workspace
inventories, recomputes Attempt/Group counts and terminal semantics, and
compares the Run source inventory against the live project root.

## 2. Re-entry Gate

The correction began only after these checks passed:

- workspace exactly
  `C:\Users\HUAWEI\.codex\worktrees\7675\project2`;
- HEAD exactly `ece8856891f950a090f9adabf75ca8c8e707ce53`;
- tracked/staged state clean, with only the four authorized Main-owned
  untracked Audit/Review/Correction documents;
- active Goal remained V2-A and real/credential/network authority remained 0;
- Pi was exactly `027a5847901b5dde30270abaa1041046cd2b4b55` and clean.

The prescribed Contract, Audit Report, Main correction decision, correction
prompt, current V2 source/tests/scripts and audit-local reproductions were read
before source edits.

## 3. Finding-to-correction map

### V2A-AUDIT-P1-001 — raw Verifier authority

**Fact.** `inspectRunV2A()` now reads the primary and each Candidate
`VerifierResult`, validates its top-level ArtifactRef, nested source snapshot
and full-output refs, expected Attempt and Verifier identities, execution
contract, exit/timeout/status relationship and raw wire projection. It derives
`verifier_passed` from the validated raw result/output and replays Selection
with independently derived gates.

**Regression.** `V2A-AUDIT-P1-001` covers both a coherently rehashed forged
Candidate/Selection summary over a raw failure and raw Verifier output tamper.
Both fail closed.

### V2A-AUDIT-P1-002 — Session byte lineage

**Fact.** The Inspector now performs Windows-safe canonical path comparison,
requires A's pre-run `parentSession` to equal the Seed parent Session, compares
every pre-run parent JSONL entry as exact line bytes, requires parent/A/B
Session IDs to be distinct, requires B to have no parent and zero pre-run
entries, and requires each final Session to contain its verified pre-run file
as an exact prefix followed by Attempt entries.

**Regression.** `V2A-AUDIT-P1-002` separately rejects a foreign parent path,
same-count changed parent entry, aliased Session ID and divergent final prefix,
with enclosing ArtifactRefs coherently refreshed.

### V2A-AUDIT-P1-003 — immutable initial Workspace evidence

**Fact.** The producer now clones both Candidate Workspaces, verifies
Seed/A/B byte equality and file isolation, writes `workspace-initial.json` for
both paths, and journals both snapshot refs before either `candidate_started`
event. Each snapshot contains sorted content inventory/digest plus ordinary
file, link-count and cross-Workspace file-identity evidence. Candidate records
bind the initial and final snapshots separately.

**Fact.** The Inspector validates snapshot schema, expected path, Workspace
identity/root, inventory ordering/digest, link policy and Seed/A/B content and
file-identity separation. It validates final snapshots independently against
the current final Workspace.

**Regression.** `V2A-AUDIT-P1-003` separately rejects missing, directly
tampered, cross-Candidate, final-substituted and coherently rehashed wrong
initial snapshots.

### V2A-AUDIT-P1-004 — frozen budget recomputation

**Fact.** Contract caps are exported as frozen code constants and required to
equal per-Attempt `8/16/1` and per-Group `24/48/3`. Candidate caps must equal
the Manifest. Provider dispatches, Tool calls, tokens, settled/budget-stop
semantics and Verifier runs are derived from final JSONL Session suffixes and
validated raw Verifier evidence. Group usage is recomputed as primary + A + B.

**Fact.** The derived Candidate copy, including terminal state, usage and Hard
Gates, is the only input to Inspector selector replay. Budget-stopped paths are
retained but ineligible.

**Regression.** `V2A-AUDIT-P1-004` separately rejects Manifest cap raise, a
raw over-cap Session with a raised Candidate cap, Group under-report and a
budget terminal/gate flip.

### V2A-AUDIT-P1-005 — live source anchor and frozen Manifest

**Fact.** At Run initialization the producer writes
`config/workbench-source.json`, containing the deterministic sorted
`workbench/src` inventory and digest. Manifest v2 binds that ArtifactRef,
scope/digest, exact Pi SHA, task, policy, model, thinking level, strategies,
Tool profile/digest, Skill/ref/digest, Verifier/ref/digest, instruction/ref,
base prompt, real-access state and exact budgets. Recovery Seed v2 binds the
same source Artifact and digest.

**Fact.** The Inspector requires an explicit `projectRoot`, recomputes the live
`workbench/src` inventory, and performs Manifest/Seed/source-Artifact/live-tree
comparison. CLI and Product Surface pass the project root explicitly. The
revision label is a fixed inventory scheme identifier, not a self-referential
future Git SHA.

**Regression.** `V2A-AUDIT-P1-005` separately rejects coherently rehashed Pi,
revision, model and stale source-inventory variants.

## 4. Source and test delta

Authorized implementation files changed:

- `workbench/src/contracts/v2-types.ts`: v2 evidence schemas, frozen constants,
  source inventory and Workspace snapshot contracts;
- `workbench/src/run-v2.ts`: source anchor, dual pre-run snapshots, raw Session
  usage reconciliation and expanded journal/terminal refs;
- `workbench/src/inspect-v2.ts`: independent raw validation/recomputation for
  all five findings;
- `workbench/src/product-surface-v2.ts` and `workbench/src/cli.ts`: explicit
  project-root inspection wiring;
- `workbench/tests/v2a-recovery.test.ts`: new Inspector signature wiring;
- new `workbench/tests/v2a-post-audit.test.ts`: five coherent-rehash families;
- V2-A evidence scripts, package command and README: corrected-root generation
  and boundary documentation.

`workbench/src/recovery/selector-v2.ts` did not require modification; the
Inspector now supplies it an independently derived Candidate projection.

## 5. Verification

| Command | Exit | Result |
|---|---:|---|
| `npm run typecheck` | 0 | strict TypeScript passed |
| `npm run v2a:test` | 0 | 11 passed, 0 failed, 0 skipped |
| `node --test tests/v2a-post-audit.test.ts` | 0 | 5 finding families passed, 0 failed, 0 skipped |
| `node --test tests/workspace.test.ts tests/v0b-verifier.test.ts` | 0 | 11 passed, 0 failed, 0 skipped |
| `npm run v1a:test` | 0 | 18 passed, 0 failed, 0 skipped |
| `npm run v1a:deterministic` | 0 | all deterministic gates passed; real-access counters 0 |
| `npm run v1b:test` | 0 | 31 passed, 0 failed, 0 skipped |
| `node --test tests/v1c-budget-stop.test.ts` | 0 | 13 passed, 0 failed, 0 skipped |
| `node --check scripts/run-v2a-deterministic-suite.mjs` | 0 | parse passed |
| `node --check scripts/run-v2a-final-validation.mjs` | 0 | parse passed |
| `npm run v2a:deterministic` | 0 | six corrected authoritative Runs created once |
| read-only full corrected-evidence inspection/fingerprint loop | 0 | 6/6 integrity-valid and unchanged by Inspector |

Development-loop observations were retained rather than hidden: the first
post-structure typecheck exposed only missing `projectRoot` call sites; the
first existing V2 suite run passed 4/6 and exposed budget-stop error-message
counting plus an obsolete assertion. Both were corrected before the final
green commands and before corrected evidence creation.

Total final Node regression count is 84 tests: V2-A 11, Workspace/V0-B 11,
V1-A 18, V1-B 31 and V1-C 13, plus the V1-A deterministic suite.

## 6. Corrected authoritative evidence

Ignored write-once root: `.runs/v2-a/corrected-evidence/`.

Source identity:

```yaml
workbench_source_scope: workbench/src
workbench_source_digest: b5caeb1b5301d4276a9becdcbbd47df122ebfa09313d202528f134721bbb15d6
summary_sha256: fae2d6893dafa9c9c9ded47beb82d049e070c3e6b5a8382f300e8884cb3a0789
corrected_evidence_tree_digest: 53a049a44bae86bac10f641a04175b63e2b4a8da298c387334de55fc5e98f9d0
```

Authoritative corrected Run IDs:

- `v2a-corrected-authoritative-initial-pass`;
- `v2a-corrected-authoritative-a-pass-b-fail` /
  `v2a-corrected-authoritative-a-pass-b-fail-recovery-group-01`;
- `v2a-corrected-authoritative-a-fail-b-pass` /
  `v2a-corrected-authoritative-a-fail-b-pass-recovery-group-01`;
- `v2a-corrected-authoritative-a-pass-b-pass` /
  `v2a-corrected-authoritative-a-pass-b-pass-recovery-group-01`;
- `v2a-corrected-authoritative-a-fail-b-fail` /
  `v2a-corrected-authoritative-a-fail-b-fail-recovery-group-01`;
- `v2a-corrected-authoritative-a-budget-b-pass` /
  `v2a-corrected-authoritative-a-budget-b-pass-recovery-group-01`.

Every Run independently reproduced source digest
`b5caeb1b5301d4276a9becdcbbd47df122ebfa09313d202528f134721bbb15d6`.
Every Inspector fingerprint was identical before and after inspection.

## 7. Evidence preservation and access boundary

**Fact.** Old `.runs/v2-a/evidence/**` is preserved byte-for-byte and is now
classified `superseded_for_gate_J_due_independent_recomputation_findings`.
Its tree digest before and after correction is
`ee5c2bc5edc0088dd779c0094ccbd2fc78b623b421307d9621126f7432c8e2ae`.

**Fact.** Audit-local `.runs/v2-a/audit/**` is preserved byte-for-byte. Its tree
digest before and after correction is
`dbd3c53c8056693c2c85548a210024d78157929516423d80e0dfad75fa7ef210`.

**Fact.** No credential was read; no network, external Provider/model or real
model route was invoked; no dependency was installed; no Pi build/full test
was run. Pi remained pinned and clean. No V0/V1 source, fixture, Manifest,
report or accepted evidence was modified.

Final boundary verification after report creation passed:

- `git diff --check`: exit 0;
- `git rev-parse HEAD`: unchanged at
  `ece8856891f950a090f9adabf75ca8c8e707ce53`;
- `git diff --cached --name-only`: empty;
- protected/control/Contract/Charter/plan diffs: empty;
- `reference/`: absent in this worktree, therefore untouched;
- Pi HEAD/status: pinned SHA and clean;
- live source/corrected evidence/old evidence/old audit digests:
  `b5caeb1b...15d6` / `53a049a4...9d0` / `ee5c2bc...e2ae` /
  `dbd3c53c...f210`.

## 8. Remaining unknowns and claims boundary

**Unconfirmed.** Main has not reviewed this correction delta or created a
corrected Candidate commit.

**Unconfirmed.** A fresh focused re-audit has not re-evaluated P1-001 through
P1-005. Gate J therefore remains not passed.

**Unconfirmed.** Main/user have not accepted V2-A. This Session does not claim
Goal completion.

This correction does not authorize or measure V2-B, real recovery effect,
strategy superiority, production durability, exactly-once Tools, automatic
apply/publish, SDK/Extension/RPC switching, third-party packages, worktrees,
multi-agent routing, V3 or V4.

## 9. CURRENT_STATE_UPDATE_PROPOSAL

```yaml
proposal_only: true
proposed_goal_status: bounded_correction_complete_pending_main_review_and_reaudit
proposed_disposition: PASS_V2_A_BOUNDED_CORRECTION_PENDING_REAUDIT
accepted_findings:
  V2A-AUDIT-P1-001: corrected_and_regressed
  V2A-AUDIT-P1-002: corrected_and_regressed
  V2A-AUDIT-P1-003: corrected_and_regressed
  V2A-AUDIT-P1-004: corrected_and_regressed
  V2A-AUDIT-P1-005: corrected_and_regressed
gate_j: pending_fresh_focused_reaudit
authoritative_corrected_run_ids:
  - v2a-corrected-authoritative-initial-pass
  - v2a-corrected-authoritative-a-pass-b-fail
  - v2a-corrected-authoritative-a-fail-b-pass
  - v2a-corrected-authoritative-a-pass-b-pass
  - v2a-corrected-authoritative-a-fail-b-fail
  - v2a-corrected-authoritative-a-budget-b-pass
workbench_source_digest: b5caeb1b5301d4276a9becdcbbd47df122ebfa09313d202528f134721bbb15d6
real_model_calls_observed: 0
external_provider_calls_observed: 0
credential_reads_observed: 0
network_calls_observed: 0
real_cost_usd_observed: 0
pi_core_patch_count: 0
private_pi_import_count: 0
candidate_commit: null
```
