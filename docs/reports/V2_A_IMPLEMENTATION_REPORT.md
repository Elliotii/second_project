# V2-A Implementation Report

```yaml
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
session_role: dedicated_v2_a_implementation_session
control_baseline_commit: 228973b7e7b826468c54b84f28faf8d9c0c33a6d
planning_baseline_ancestor: bd903c963b68ba2b13ab56c20a7515a63f681021
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
implementation_status: complete_pending_main_review
gate_j_status: not_authorized_not_executed
candidate_commit: null
git_staged_files: 0
git_commits_created: 0
```

## Outcome

**Fact.** The dedicated Session implemented the Contract-bounded deterministic substrate on the direct public emitted Pi route:

```text
primary Skill-only Attempt
→ common external Verifier
→ valid failure only: immutable Recovery Seed
→ public JsonlSessionRepo fork Candidate A + fresh Candidate B
→ two isolated Workspace copies from the same Seed digest
→ both Candidate Attempts and both independent Verifiers
→ hard-gate-first deterministic Selection or none
→ read-only fail-closed Inspector
```

**Fact.** Gates A–I are supported by the evidence below. Gate J, Candidate freeze, focused audit, Goal acceptance and `PASS_V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE` remain Main/user control points and were not executed here.

**Recommendation.** Main should perform its light implementation review, create a Candidate/Audit Baseline only if satisfied, and request the separately authorized focused audit. The dedicated Session's proposed disposition is `PASS`, meaning “implementation complete pending Main review/audit,” not final Goal acceptance.

## Implemented Boundary

### Public Pi runtime and Session boundary

**Fact.** `workbench/src/run-v2.ts` imports `AgentHarness` and `JsonlSessionRepo` only from `@earendil-works/pi-agent-core`, and `NodeExecutionEnv` only from the public `@earendil-works/pi-agent-core/node` export. No private Pi import, Pi patch, SDK/Extension/RPC route or dependency change was introduced.

**Fact.** Candidate A is created with `JsonlSessionRepo.fork(parentMetadata, ...)`, has a distinct Session ID, a `parentSessionPath`, and the parent's persisted entries. Candidate B is created with `JsonlSessionRepo.create(...)`, has no parent path and zero pre-run entries. Model registry, Faux Provider, bounded Tool profile and `AgentHarness` are reconstructed independently for each path.

### Seed, Workspace and fairness

**Fact.** A valid primary Verifier failure freezes these write-once or digest-bound artifacts before either `candidate_started` event:

- task instruction snapshot;
- raw external Verifier output and structured result;
- bounded model-visible Failure Packet;
- failed Workspace snapshot plus tree digest;
- parent Pi JSONL Session reference plus digest;
- Skill, prompt, Tool profile, Pi and Workbench identities;
- `seed/recovery-seed.json`.

**Fact.** Initial pass writes no Failure Packet, Seed, Candidate directory, Selection or recovery call. Each valid failure creates exactly two Candidate paths. Each path is copied from the frozen Seed, scanned for link/reparse escape and shared file identity, run to a terminal Attempt, and independently verified. Runtime checks bind equal prompt, Skill, Model, Tool, Verifier, policy, budget and Seed digests; only Session history differs intentionally.

### Budget, Selection and inspection

**Fact.** Per primary/Candidate hard limits are 8 Faux dispatches, 16 Tool calls and 1 Verifier. Recovery Group hard limits are 24 Faux dispatches, 48 Tool calls, 3 Verifiers, exactly 2 Candidate paths and USD 0. A cap-exhausted Candidate terminalizes as `budget_stopped`, remains in the Recovery Group, is hard-gate-ineligible, and does not prevent the other Candidate from running.

**Fact.** `workbench/src/recovery/selector-v2.ts` evaluates all hard gates before secondary ordering. It returns `null` when none pass. Eligible ties compare allowed semantic diff size, tokens, Tool calls, active time, then the fixed A-before-B strategy order. It persists all evaluated/rejected IDs, gate results, ordering values and reasons.

**Fact.** `workbench/src/inspect-v2.ts` is read-only and independently checks Manifest identity, Journal sequence/order, ArtifactRefs, Seed and Workspace digests, Session history semantics, group membership/budget, both Candidate terminals, Selection reproduction, secret/reasoning scan, missing/duplicate/cross-group identity and link/hardlink isolation.

## Gate Evidence

| Gate | Status | Evidence |
|---|---|---|
| A — identity/authority | PASS | HEAD `228973b...`; ancestry check exit 0; tracked/staged clean before source work; only registered startup prompt untracked; Pi `027a584...` clean; active Goal/owner/status matched; zero access authority. |
| B — public Pi Session | PASS | Public emitted import probe returned functions; Windows test `V2-A Gate B uses public emitted JsonlSessionRepo create/open/fork on Windows` passed; authoritative Runs persist fork/fresh JSONL Sessions. |
| C — Seed order/immutability | PASS | Initial-pass test shows no recovery objects; Journal requires `seed_frozen` before either Candidate; write-once overwrite throws; Seed Workspace tamper is rejected. |
| D — Workspace equality/isolation | PASS | Both initial digests equal Seed; runtime rejects links/shared file identities; mutation of copied Candidate A leaves Seed/B digests unchanged; existing Workspace policy regressions 11/11 pass. |
| E — fairness/Session delta | PASS | Common Artifact and immediate prompt digests equal; A pre-run history >0 and B =0; both Candidate start/terminal events exist even when A passes. |
| F — Selector matrix | PASS | Faux end-to-end pass/fail, fail/pass, pass/pass, fail/fail and budget/pass cases pass; exact equal secondary values resolve to A; invalid/cross-group/duplicate are rejected; none is retained. |
| G — lineage/Inspector | PASS | Six matrix Runs plus one final-source Run inspect valid; fingerprint before/after inspection equal; tamper/missing/duplicate/cross-group tests fail closed; raw Verifier and JSONL Session evidence retained. |
| H — typecheck/regressions | PASS | Typecheck; V2-A 6/6; Workspace/Verifier 11/11; V1-A 18/18 plus deterministic script; V1-B 31/31; V1-C 13/13; all 0 skipped/fail. |
| I — deliverables/session boundary | PASS | This report, Closeout Draft, ignored Evidence Index, Source Delta, commands/exit codes and proposal are present; staged/commit delta 0; Pi/protected/control diff 0; zero real access. |
| J — focused audit | PENDING | Not authorized to this Session; not executed. |

## Authoritative Deterministic Evidence

Ignored index: `.runs/v2-a/evidence/EVIDENCE_INDEX.md`

Base matrix Summary ArtifactRef:

```yaml
path: .runs/v2-a/evidence/SUMMARY.json
sha256: eae4655284b447492156411a7beff8c6636e22c82334c001ddd8b4ba2b6ea7b6
size_bytes: 4046
```

Final-source validation supplement (added write-once; the base index/Runs were not overwritten):

```yaml
index: .runs/v2-a/evidence/EVIDENCE_INDEX_SUPPLEMENT.md
run_id: v2a-authoritative-final-source-a-pass-b-fail
recovery_group_id: v2a-authoritative-final-source-a-pass-b-fail-recovery-group-01
summary_path: .runs/v2-a/evidence/FINAL_SOURCE_VALIDATION.json
summary_sha256: 330c660d4a70bff1973f51050ae874f04cb613f2bcf38d59f0f4ac74068e376f
summary_size_bytes: 794
inspector_integrity_valid: true
inspector_read_only: true
candidate_protected_secret_path_gates: [true, true]
```

| Run ID | Recovery Group | Result |
|---|---|---|
| `v2a-authoritative-initial-pass` | none | initial pass; no recovery objects |
| `v2a-authoritative-a-pass-b-fail` | `v2a-authoritative-a-pass-b-fail-recovery-group-01` | selected Candidate A |
| `v2a-authoritative-a-fail-b-pass` | `v2a-authoritative-a-fail-b-pass-recovery-group-01` | selected Candidate B |
| `v2a-authoritative-a-pass-b-pass` | `v2a-authoritative-a-pass-b-pass-recovery-group-01` | both eligible; persisted secondary ordering selected B on lower observed active time |
| `v2a-authoritative-a-fail-b-fail` | `v2a-authoritative-a-fail-b-fail-recovery-group-01` | selected none |
| `v2a-authoritative-a-budget-b-pass` | `v2a-authoritative-a-budget-b-pass-recovery-group-01` | A retained as budget-stopped/ineligible; selected B |
| `v2a-authoritative-final-source-a-pass-b-fail` | `v2a-authoritative-final-source-a-pass-b-fail-recovery-group-01` | final-source supplement after protected/secret gate recomputation; selected A |

**Fact.** The exact-equality selector regression normalizes all pre-strategy ordering values and deterministically selects `continue_failed_session` (Candidate A), proving the frozen final tie-break independently of wall-clock variation in end-to-end runs.

## Source Inventory and Delta

### Modified connection files

| Path | Purpose |
|---|---|
| `workbench/package.json` | Adds `v2a:test` and `v2a:deterministic` scripts only. |
| `workbench/src/cli.ts` | Adds bounded `v2a run/inspect` routing; no credential or real route. |
| `workbench/README.md` | Documents the zero-call V2-A surface and claims boundary. |

### New V2-A source/test/script files

| Path | Lines | SHA-256 before reports |
|---|---:|---|
| `workbench/src/contracts/v2-types.ts` | 171 | `cd334e07a8408d22961f596a65d588e0efd4ba5a3d05a081d717669796b199c7` |
| `workbench/src/recovery/selector-v2.ts` | 77 | `823bf5437b5a184bafa9b4ad1d30ef7861894f9f449400369a1d2a5c97d90834` |
| `workbench/src/run-v2.ts` | 721 | `921605aff5dbc3163ac8dee2db3b797db8742ecb7bbe1d253a457446fdc0f98b` |
| `workbench/src/inspect-v2.ts` | 299 | `e39999e5650cd1549d9337e53356abe5f3e2e2578a865ffcdfef3fadd3bf38b3` |
| `workbench/src/product-surface-v2.ts` | 30 | `1d756145d1c0c602f3b294056c167285c2bcdeebe1404cd445c02d8fc51e5f74` |
| `workbench/tests/v2a-recovery.test.ts` | 153 | `11e55824baa3d5b4c8c74e535f233ec52bbce84fc9797d106f6a71ac67a2f8f4` |
| `workbench/tests/v2a-cli.test.ts` | 14 | `9d5db4779b434e807c35225d5ff97fc0e45eadd671451392b6a6d860eb3371d2` |
| `workbench/scripts/run-v2a-deterministic-suite.mjs` | 90 | `fc80896b49cf6dfc27ac032c5be8b9704c1e93962b62ba6322e1b9d510a3efef` |
| `workbench/scripts/run-v2a-final-validation.mjs` | 40 | `e7b46bc9e5617b50c2efc8aaba6ce571c10b5165bc8c1f026bc800f87bb3e796` |

The two required report files are this file and `docs/reports/V2_A_CLOSEOUT_DRAFT.md`. The pre-existing untracked `docs/reports/V2_A_IMPLEMENTATION_SESSION_START_PROMPT.md` is not part of the implementation delta and was not modified.

### Protected/unchanged proof

**Fact.** `git diff --name-only -- fixtures workbench/src/contracts/v1-types.ts workbench/src/run-v1.ts workbench/src/inspect-v1.ts workbench/tests/v1a-deterministic.test.ts workbench/tests/v1b-stage1.test.ts workbench/tests/v1b-cli.test.ts workbench/tests/v1c-budget-stop.test.ts CURRENT_STATE.md` returned empty.

**Fact.** Pi remained at `027a5847901b5dde30270abaa1041046cd2b4b55` with empty `git status --short`. No `reference/` tree exists in this worktree, so no reference file was addressed or modified. No Contract, Charter, plan, `CURRENT_STATE.md`, V0/V1 fixture/source/evidence, dependency lockfile or Pi file changed.

## Exact Commands and Exit Codes

### Gate A/read-only identity

| Command | Exit | Result |
|---|---:|---|
| `git rev-parse HEAD` | 0 | `228973b7e7b826468c54b84f28faf8d9c0c33a6d` |
| `git status --short` | 0 | only the pre-existing untracked startup prompt |
| `git merge-base --is-ancestor bd903c963b68ba2b13ab56c20a7515a63f681021 HEAD` | 0 | ancestry valid |
| active Goal/Contract owner/status `rg` checks | 0 | activated V2-A and dedicated owner |
| Pi `git rev-parse HEAD` | 0 | pinned commit |
| Pi `git status --short` | 0 | empty |

### Implementation verification

| Command | Exit | Result |
|---|---:|---|
| `npm run typecheck` (first implementation pass) | 1 | three local TypeScript defects; corrected inside allowlist |
| `npm run typecheck` (after correction) | 0 | pass |
| narrow Gate B + initial-pass test | 1 | Gate B passed; initial Workspace parent-directory defect found |
| initial-pass narrow rerun | 0 | pass |
| end-to-end narrow run | 0 | pass |
| `npm run v2a:test` (first full run) | 1 | budget fixture reached internal 8-turn settle; host cap terminalization corrected without raising budget |
| scenario-matrix narrow rerun | 0 | pass |
| `npm run typecheck; npm run v2a:test` | 0 | typecheck pass; 6/6 V2 tests, 0 skipped |
| `node --test tests/workspace.test.ts tests/v0b-verifier.test.ts` | 0 | 11/11, 0 skipped |
| `npm run v1a:test; npm run v1a:deterministic` | 0 | 18/18 + deterministic gates pass; all real counters 0 |
| `npm run v1b:test` | 0 | 31/31, 0 skipped |
| `node --test tests/v1c-budget-stop.test.ts` | 0 | 13/13, 0 skipped |
| `npm run v2a:deterministic` (first invocation) | 1 | script parse error before Evidence root creation; no evidence delta |
| guarded `npm run v2a:deterministic` rerun | 0 | 6 authoritative Runs valid; Evidence Index/Summary created write-once |
| `npm run typecheck; npm run v2a:test` after final protected/secret gate strengthening | 0 | typecheck pass; 6/6 V2 tests, 0 skipped |
| `node scripts/run-v2a-final-validation.mjs` | 0 | final-source A-pass/B-fail Run valid; Inspector read-only; both protected/secret/path gates true; zero real access |
| `node --check scripts/run-v2a-deterministic-suite.mjs` and `node --check scripts/run-v2a-final-validation.mjs` | 0 | both evidence scripts parse |
| read-only CLI inspection loop over all 7 authoritative Run roots | 0 | every Run `integrity_valid: true`, `errors: 0`; expected Candidate/Selection cardinality |
| final `git diff --check` | 0 | no whitespace errors |
| final protected-path `git diff --name-only` and Pi status | 0 | protected list empty; Pi pinned and clean |

No install, network, real Provider/model, credential, Pi build/test, staging or commit command was run.

## Definition of Done Status

| DoD | Status | Note |
|---:|---|---|
| 1 | PASS | Gates A–I supported. |
| 2 | PENDING | Gate J requires separately authorized focused audit. |
| 3–23 | PASS | Direct AgentHarness; public JSONL; Seed/order; no-branch; A/B equality/isolation/history; fairness; both terminal; selector matrix/none/budget retention; tamper/lineage Inspector; tests; zero access; no forbidden route/write; deliverables. |
| 24 | PENDING | Main/user acceptance not performed. |

## Unverified, Deviations and Claims Boundary

**Unconfirmed.** Gate J has not been run, so the frozen Candidate has not received independent focused audit.

**Unconfirmed.** Main has not created Candidate or Audit Baseline commits and has not accepted V2-A.

**Fact.** No scope deviation occurred. Ordinary local implementation defects were observed and corrected within the allowlist: two event-handler return types plus Skill digest field use, missing Workspace parent creation, and cap-exhaustion terminalization. One evidence-script quote typo failed before evidence creation and was corrected. Final delivery review then strengthened the protected/secret Workspace gate from a construction assertion to producer-and-Inspector byte recomputation; a new write-once final-source Run validated that correction without overwriting earlier evidence.

**Fact.** This work does not prove real-model recovery effectiveness, policy superiority, general durable restart, exactly-once tools, V2-B adaptive routing, automatic apply/publish, multi-agent behavior, or portfolio effect numbers.

## CURRENT_STATE_UPDATE_PROPOSAL

```yaml
proposal_only: true
proposed_goal_status: implementation_complete_pending_main_review
proposed_disposition: PASS
gates:
  A: passed
  B: passed
  C: passed
  D: passed
  E: passed
  F: passed
  G: passed
  H: passed
  I: passed
  J: pending_separate_authorization
dod:
  implementation_items_1_and_3_through_23: passed
  focused_audit_item_2: pending
  main_user_acceptance_item_24: pending
authoritative_run_ids:
  - v2a-authoritative-initial-pass
  - v2a-authoritative-a-pass-b-fail
  - v2a-authoritative-a-fail-b-pass
  - v2a-authoritative-a-pass-b-pass
  - v2a-authoritative-a-fail-b-fail
  - v2a-authoritative-a-budget-b-pass
  - v2a-authoritative-final-source-a-pass-b-fail
real_model_calls_observed: 0
external_provider_calls_observed: 0
credential_reads_observed: 0
network_calls_observed: 0
real_cost_usd_observed: 0
pi_core_patch_count: 0
private_pi_import_count: 0
candidate_commit: null
```

## Post-audit bounded correction appendix — 2026-08-06

The focused audit disposition `REVISE_V2_A_BOUNDED` supersedes this report's
pre-audit PASS recommendation and old Gate-J evidence claim. Main accepted five
P1 findings and returned one Contract-bounded package to the original
Implementation Session.

**Fact.** All five findings were corrected without an architecture or
allowlist change:

- raw VerifierResult/output/source validation now derives verifier gates;
- A parent history and A/B final Session prefixes are compared byte-exactly,
  with canonical parent paths and unique parent/A/B IDs;
- both Candidate initial Workspace inventory/link snapshots are frozen before
  either Candidate starts;
- fixed Attempt/Group caps and raw JSONL/Verifier usage drive terminal,
  budget and selector replay semantics;
- every Run binds a deterministic `workbench/src` inventory, and Inspector
  recomputes it from explicit `projectRoot`.

The new `v2a-post-audit.test.ts` suite contains five finding families and all
required coherent-rehash subvariants. Final V2-A tests are 11/11 with zero
failed/skipped. Required Workspace/V0-B/V1-A/V1-B/V1-C regressions are all
green.

Old `.runs/v2-a/evidence/**` is preserved and classified
`superseded_for_gate_J_due_independent_recomputation_findings`. The new
write-once authority is `.runs/v2-a/corrected-evidence/**`, containing six
Runs bound to source digest
`b5caeb1b5301d4276a9becdcbbd47df122ebfa09313d202528f134721bbb15d6`.
All six inspect as integrity-valid and read-only.

The authoritative correction record is
`docs/reports/V2_A_POST_AUDIT_BOUNDED_CORRECTION_REPORT.md`. This appendix does
not pass Gate J, accept V2-A, create a Candidate commit or authorize V2-B.

```yaml
correction_recommendation: PASS_V2_A_BOUNDED_CORRECTION_PENDING_REAUDIT
gate_j: pending_fresh_focused_reaudit
candidate_commit: null
real_access: 0
```

## P1-002 line-byte bounded correction appendix — 2026-08-06

The corrected Candidate re-audit closed P1-001, P1-003, P1-004 and P1-005 but
reproduced one remaining P1-002 defect: `parseSession()` trimmed the complete
JSONL text, so a trailing ASCII space on Candidate A's final pre-run parent
entry could survive coherent ref refresh while exact byte lineage was claimed.

The original Implementation Session completed the one authorized hit-specific
correction. Inspector now retains complete `Buffer` bytes and exact record byte
slices, requires the Pi producer's LF-terminated records, rejects blank/CRLF
records, compares Candidate A parent entries with `Buffer.equals()`, and
requires the final Session to contain the full verified pre-run raw byte prefix
plus Attempt bytes. Candidate B remains parentless with zero pre-run entries.

The P1-002 family adds one coherent `trailing-parent-entry-space` regression;
the five post-audit families now cover 20 variants. Final TypeScript,
standalone post-audit 5/5 and full V2-A 11/11 checks passed with zero skipped.

New write-once authority:

```yaml
evidence_root: .runs/v2-a/line-byte-corrected-evidence
workbench_source_digest: 10f85d0cd4195cb94ce269029a37bf2ed4ea70b5e0e42eb740e060726e1d08ce
summary_sha256: c80d1cfdd4a6cbf5df116c8152dd7eac4ad417957b1a1a74cf8ed2ec9a3b75b2
evidence_tree_digest: 194eff335f018e2138285a96d91d41fd4f5b84a945f3487378e952ab85abeb76
authoritative_runs: 6
inspector_valid_and_read_only: 6
real_access: 0
```

The old evidence, audit, corrected-evidence and re-audit tree digests were
preserved exactly. The complete record is
`docs/reports/V2_A_LINE_BYTE_BOUNDED_CORRECTION_REPORT.md`.

```yaml
line_byte_correction_recommendation: PASS_V2_A_LINE_BYTE_CORRECTION_PENDING_HIT_REAUDIT
gate_j: pending_fresh_hit_specific_reaudit
candidate_commit: null
v2_a_accepted: false
v2_b_authorized: false
```
