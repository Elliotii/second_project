# V1-B Stage 1 Focused Independent Re-audit Report

```yaml
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
session_role: original_independent_audit_session_focused_reaudit
disposition: PASS_FOCUSED_V1_B_STAGE1_REAUDIT
rejected_candidate_commit: 951e9161300eacd408e232aa6d1fa66ac02d0e10
corrected_candidate_commit: a11690e5827d9d540b731156799566bea21c689e
corrected_candidate_tree: 282c4dc93d31131fa0b20fc70c48831409664eee
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
manifest_id: be258f6f62276436fef65a44459d70611749043b9dc2d25ec134a0e7abc1055d
workbench_source_digest: ef30c4be9bc4143569f30aabbb66b2a01db9b2098082f35dba2137f3acb22ffe
findings_reaudited: 2
findings_closed: 2
new_blocking_findings: 0
source_repair_performed: false
control_state_modified: false
git_stage_or_commit_created: false
stage_2_entered: false
```

## 1. Disposition

**PASS_FOCUSED_V1_B_STAGE1_REAUDIT**

**Fact.** Gate A passed before correction inspection or test execution. The
re-audit began at exact corrected Candidate
`a11690e5827d9d540b731156799566bea21c689e`, tree
`282c4dc93d31131fa0b20fc70c48831409664eee`, whose direct parent is the
rejected Candidate `951e9161300eacd408e232aa6d1fa66ac02d0e10`. Tracked,
staged and `reference/` state were clean; Pi was exact and clean; Manifest ID
and Workbench source digest independently recomputed exactly.

**Fact.** Both original P1 findings are closed by source inspection, focused
regressions and independent re-audit counterexamples. No new non-local P0/P1
boundary failure was observed in the authorized correction surface.

**Inference.** The corrected Candidate satisfies this focused re-audit. This
disposition is not Goal acceptance, does not create an Execution Baseline and
does not authorize Stage 2; those decisions remain with Main Session/user.

## 2. Gate A and frozen identity

| Item | Observed result |
| --- | --- |
| Audit worktree | `C:/Users/HUAWEI/.codex/worktrees/d3c0/project2` |
| Corrected HEAD | `a11690e5827d9d540b731156799566bea21c689e` |
| Corrected HEAD tree | `282c4dc93d31131fa0b20fc70c48831409664eee` |
| Direct parent | rejected Candidate `951e9161300eacd408e232aa6d1fa66ac02d0e10` |
| Starting tracked/index state | clean / clean |
| `reference/` | clean |
| Pi checkout | `D:/AI/AI_Projects/project2/.upstream/pi` |
| Pi HEAD/status | `027a5847901b5dde30270abaa1041046cd2b4b55` / clean |
| Manifest ID | `be258f6f62276436fef65a44459d70611749043b9dc2d25ec134a0e7abc1055d` |
| Recomputed Manifest ID | exact match |
| Manifest cells/mode | 24 / `stage1_zero_call` |
| Workbench source digest | `ef30c4be9bc4143569f30aabbb66b2a01db9b2098082f35dba2137f3acb22ffe` |
| Recomputed source digest | exact match |
| Credential/network/Provider/model access | `0 / 0 / 0 / 0` |

**Fact.** The exact corrected Preparation checkout at
`C:/Users/HUAWEI/.codex/worktrees/28be/project2` had the same commit/tree and
pre-existing dependencies. Strict TypeScript, focused tests, regressions and
authoritative evidence replay ran there without installation. The independent
counterexamples ran from the audit worktree using only the pre-existing ignored
local dependency resolver retained from the first Audit.

**Fact.** The original Audit Report was not edited. Its final SHA-256 remains
`1c63c2de03d8a2e71ab9c7d0f08d06604472b83cb9258c29269db36bd2d4f14a`.

## 3. Finding closure table

| Finding | Original P1 boundary | Independent re-audit result | Closure |
| --- | --- | --- | --- |
| `V1B-AUD-F-001` | Final Workspace bytes could be coherently rebound without producer/Inspector rejection | Producer forbidden-marker injection paused before terminal commit; a coherently rehashed forged Workspace ref inspected invalid; clean Workspace inspected valid; junction traversal was rejected with the outside sentinel unchanged | **CLOSED** |
| `V1B-AUD-F-002` | Exact tracked CLI lacked the concrete real one-Run composition needed by a future frozen Stage 2 | Exact CLI now requires explicit authority, rejects mismatched modes before Pilot initialization, reaches concrete composition with an explicitly absent key, pauses the same started cell with sanitized error and no dispatch, remains lazy and rejects a second open | **CLOSED** |

## 4. `V1B-AUD-F-001` focused closure

**Fact.** `workbench/src/run-v1.ts::scanFinalWorkspaceTreeV1B` performs sorted
final-Workspace traversal, rejects a linked root, path-link entries, realpath
escapes, hardlinks and unsupported entries, scans every regular-file byte with
the existing protected persisted-evidence rule, and returns a typed
`WorkspaceTreeRefV1B`. `executeV1RunCell` calls it before RunResult/terminal
commit and binds the result into both terminal evidence and `terminal.json`.

**Fact.** `workbench/src/inspect-v1.ts::inspectV1RunCell` independently invokes
the same fail-closed traversal against actual final Workspace bytes, then
compares the recomputed ref with both persisted bindings. Existing terminal and
ArtifactRef byte scans remain present; the forbidden-byte regex is unchanged;
required ArtifactRef cardinality is still enforced. The clean independent Run
retained nine ArtifactRefs and a passing three-file Workspace ref.

**Independent counterexamples.** The re-audit produced all of the following:

1. Producer injection of forbidden Workspace markers resulted in 24 planned,
   one started, one paused, zero terminal and zero invalid transitions. No
   `terminal.json` was written and no later cell started.
2. A valid copied Run was modified with `Bearer` and `FAKE_SENSITIVE` markers;
   its Workspace digest/ref and outer evidence hashes were coherently forged.
   Inspector returned `integrity_valid: false` with a typed-boundary error.
3. The unmodified copied Run returned `integrity_valid: true`, with
   `workspace_tree_ref.scan.passed: true`.
4. A Windows junction from `workspace/escape` to an outside directory was
   rejected with `V1BTypedPauseError`; the outside sentinel bytes were unchanged.

**Inference.** The original digest-only self-binding gap is closed on both the
producer and independent Inspector sides without weakening clean positive
behavior, protected-path checks, ArtifactRefs or the established persisted-byte
boundary.

## 5. `V1B-AUD-F-002` focused closure

**Fact.** `workbench/src/cli.ts::main` now exposes the exact tracked
`--stage2-real-authority` switch and constructs the frozen authority identity
plus a lazy `DEEPSEEK_API_KEY` resolver. `workbench/src/product-surface-v1.ts`
validates Manifest mode, switch presence and authority/profile identity before
initialization, then supplies `createTrackedRealCompositionV1B` to
`runNextPilotCellV1B`. `OneRunProviderAuthorityV1B.assertAvailable` is
non-consuming; `open` remains single-use.

**Independent exact-surface observations.** Child processes were spawned with a
minimal explicit environment containing only the audit-local dependency-loader
option and therefore omitting `DEEPSEEK_API_KEY` and all parent environment
values.

- A valid `stage2_real` Manifest without the switch failed with sanitized
  `FixedProviderBoundaryErrorV1B` before Pilot initialization.
- The Stage 1 Manifest plus the switch failed with the same typed boundary
  before Pilot initialization.
- A valid real Manifest plus the switch reached the concrete public-Pi/one-Run
  path. Missing credential resolution failed with the sanitized boundary;
  ledger state was 24 planned, one started, the same cell paused, zero terminal
  and zero invalid. Only the first Run directory existed, and its journal ended
  at `run_started`, `workspace_materialized`, `attempt_started`.
- Persisted output contained no Bearer/Authorization/fake-sensitive credential
  shape. Source order resolves the credential before provider construction or
  dispatch; the failed resolution therefore performed zero network, external
  Provider and model calls and did not increment a successful credential read.
- A counted fake resolver remained at zero calls through composition creation,
  availability check, Run open and close. Reopening the same authority failed
  with `FixedProviderBoundaryErrorV1B`.
- Denied authority and missing resolver both failed before any `started`
  transition. No untracked runtime wrapper was required.

**Fact.** The corrected real Manifest preserves
`alternate_model_fallback: false`, `retry_same_run: false` and
`automatic_replacement: false`; recovery policy and Provider profile are byte-
equivalent in meaning to the tracked Stage 1 Manifest.

**Inference.** The tracked product surface is now concretely reachable while
remaining explicit, fail-closed, lazy and one-Run bounded. The original need for
untracked Stage 2 wiring is removed.

## 6. Required regressions and authoritative replay

| Command | Working directory | Exit | Observed result |
| --- | --- | ---: | --- |
| `node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | corrected Preparation `workbench/` | 0 | strict TypeScript passed; 3.6 s |
| `node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts` | corrected Preparation `workbench/` | 0 | 19/19 passed; 45.3 s |
| `node --test --test-concurrency=1 tests/v1a-deterministic.test.ts tests/v0c-stage1.test.ts tests/v0c-post-audit-correction.test.ts tests/v0c-main-review-correction.test.ts` | corrected Preparation `workbench/` | 0 | 42/42 passed; 34.3 s |
| `node workbench/src/cli.ts v1b aggregate --pilot-root .runs/v1-b/stage1/gate-h-pilot-authoritative-after-post-audit-correction` | corrected Preparation root | 0 | 24 planned/started/terminal, 0 invalid, 24 comparable; 13 pass, 11 fail; all eight fairness blocks valid |
| loop `v1b inspect` over every authoritative planned Run ID | corrected Preparation root | 0 | 24 inspected, 24 valid, 0 invalid; 13.3 s |
| `node --import=<ignored-local-resolver> .runs/v1-b/audit/reaudit-a11690e/reaudit-checks.mjs` | audit worktree | 0 | both finding counterexample groups passed; 4.6 s |

**Fact.** The authoritative aggregate recomputed
`bc_initial_byte_equal: true` and `ab_only_skill_delta: true`. The correction
diff did not change Task/Skill/Verifier, budget, retry/fallback policy, Pi,
fixtures outside the corrected Manifest, or general platform scope. No concrete
non-local evidence required reopening F-003 through F-005.

## 7. Bounded incidents, evidence and accounting

**Fact.** A first read-only Inspector loop selected a nonexistent
`event_type` field and therefore selected zero Runs. The selector was corrected
to ledger `state: planned`; the conclusive replay inspected 24/24 valid Runs.

**Fact.** The first counterexample script execution completed the F-001/F-002
boundary assertions, then exited on an overly narrow audit-script expectation
for the policy object shape. The assertion was corrected to check the actual
frozen no-fallback/no-retry/no-replacement fields and unchanged recovery/
Provider profiles. The conclusive `-final` cases passed. Preliminary unsuffixed
ignored directories remain identified in the Evidence Index; no Candidate,
fixture, Pi, reference or control-state file changed.

Evidence root:

`C:/Users/HUAWEI/.codex/worktrees/d3c0/project2/.runs/v1-b/audit/reaudit-a11690e/`

Key evidence:

- `gate-a.json` 鈥?exact identity and starting accounting;
- `verification-summary.json` 鈥?exact commands, working directories, exits and
  bounded incidents;
- `reaudit-check-results.json` 鈥?independent finding closure observations;
- `evidence-index.json` 鈥?SHA-256/size tree inventory of the re-audit evidence;
- `reaudit-checks.mjs` 鈥?independent counterexample procedure.

```yaml
audit_session_candidate_source_repairs: 0
audit_session_control_state_delta: 0
audit_session_pi_delta: 0
audit_session_fixture_delta: 0
audit_session_reference_delta: 0
audit_session_git_stage_operations: 0
audit_session_git_commits: 0
dependency_installs_or_downloads: 0
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
report_output:
  - docs/reports/V1_B_STAGE1_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md
ignored_evidence_output:
  - .runs/v1-b/audit/reaudit-a11690e/
```

## 8. Unverified and control handoff

**Unconfirmed / unauthorized.** This re-audit did not read a credential value,
contact a network or Provider, invoke a real model, execute any real arm, assess
real arm outcomes or cost, create Candidate/Execution Baseline commits, modify
control state, or enter Stage 2. It did not re-audit general Pi/V0/Windows/SDK/
Extension/platform scope.

**Recommendation.** Main Session/user may review this focused pass, the two
finding closures and cited ignored evidence. Any Candidate acceptance,
Execution Baseline creation or separately bounded Stage 2 authorization remains
a Main Session/user control decision.

Work stops here pending Main Session/user acceptance of this re-audit result.
