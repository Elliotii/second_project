# V1-B Stage 1 Focused Independent Audit Report

```yaml
goal_id: V1_B_BOUNDED_REAL_PILOT
session_role: fresh_focused_independent_audit
disposition: REVISE_V1_B_STAGE1_AFTER_AUDIT
candidate_commit: 951e9161300eacd408e232aa6d1fa66ac02d0e10
candidate_tree: a9ad6eee8ae4cfe32ee3e9e04613a8d16e5296f6
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
manifest_id: ec8a7a6f8dcc375dd18781e8f54b2ab00f5d2d7fba3938dee1011933de5f3b3b
workbench_source_digest: ce768cfd8af488861b251d94b6b5e14dec164e453c65bdba444fdc5aa0ade127
blocking_findings: 2
source_repair_performed: false
control_state_modified: false
git_stage_or_commit_created: false
```

## 1. Disposition

**REVISE_V1_B_STAGE1_AFTER_AUDIT**

**Fact.** Gate A passed before source inspection or tests. The Audit began at the exact Candidate commit/tree, with clean tracked/index/reference state, exact clean Pi, exact Manifest ID and independently recomputed Workbench source digest. Credential/network/external Provider/real model access remained `0 / 0 / 0 / 0`.

**Fact.** Strict TypeScript passed, the V1-B focused suite passed 15/15, the required sequential V1-A/V0-C regression set passed 42/42, all 24 authoritative Stage 1 Runs passed Inspector, and the authoritative aggregate recomputed 24 comparable terminal cells plus all eight fairness blocks.

**Fact.** Two independent, audit-authored counterexamples nevertheless expose Candidate defects at frozen Contract boundaries:

1. final Workspace bytes are outside both the producer secret/reasoning scan and the Inspector byte scan; a coherently rebound Workspace containing `Bearer` and `FAKE_SENSITIVE` markers is accepted as valid evidence;
2. the tracked CLI never supplies the concrete real execution composition accepted by `runNextV1B`; a valid real-mode Manifest therefore stops before `started` with `real execution dependencies are unavailable`.

**Inference.** Both defects affect evidence validity or the ability of the future no-source-edit Stage 2 Session to execute the exact tracked product surface. The Candidate cannot advance to Execution Baseline in its present form.

## 2. Gate A and frozen identity

| Item | Observed result |
| --- | --- |
| Audit worktree | `C:/Users/HUAWEI/.codex/worktrees/d3c0/project2` |
| HEAD | `951e9161300eacd408e232aa6d1fa66ac02d0e10` |
| HEAD tree | `a9ad6eee8ae4cfe32ee3e9e04613a8d16e5296f6` |
| Starting tracked/index state | clean / clean |
| `reference/` | clean |
| Pi checkout used read-only | `D:/AI/AI_Projects/project2/.upstream/pi` |
| Pi HEAD/status | `027a5847901b5dde30270abaa1041046cd2b4b55` / clean |
| Manifest ID | `ec8a7a6f8dcc375dd18781e8f54b2ab00f5d2d7fba3938dee1011933de5f3b3b` |
| Recomputed Manifest ID | exact match |
| Manifest cells/mode | 24 / `stage1_zero_call` |
| Source digest | `ce768cfd8af488861b251d94b6b5e14dec164e453c65bdba444fdc5aa0ade127` |
| Independently recomputed source digest | exact match over the frozen 17-path domain |
| Credential/network/Provider/model access | `0 / 0 / 0 / 0` |

**Fact.** The Audit worktree intentionally had no local `node_modules`. Tests used an ignored audit-local resolver pointing only to the pre-existing pinned local dependency trees. Nothing was installed, downloaded, patched into Pi, or added outside the authorized report and `.runs/v1-b/audit/**` evidence.

**Fact.** Candidate authoritative evidence is retained in the original exact-Candidate, clean Preparation checkout at `C:/Users/HUAWEI/.codex/worktrees/28be/project2/.runs/v1-b/stage1/gate-h-pilot-authoritative-after-main-review-correction`. Because the public Skill wrapper binds its canonical absolute source path, aggregate/Inspector verification was executed with that exact checkout as `projectRoot`; the code, commit and tree are the same frozen Candidate.

## 3. F-001鈥揊-005 conclusions

### F-001 鈥?PASS within its stated semantic/ref cases

**Fact.** The focused tests independently rewrite and coherently rehash wrong task, Skill, Verifier and Workbench relations; they also remove or duplicate Verifier refs. `inspectV1RunCell` rejects every tested case. The authoritative evidence independently inspected 24/24 valid Runs.

**Fact.** Relevant Candidate symbols are `workbench/src/inspect-v1.ts::inspectV1RunCell`, `expectedVerifierDigest`, semantic binding reconstruction, ArtifactRef validation and the required Verifier-ref inventory. The positive/counterexample coverage is in `workbench/tests/v1b-stage1.test.ts`, test `V1-B F-001 Inspector rejects coherent semantic rehash and missing/duplicate Verifier refs`.

**Qualification.** F-001's enumerated task/Skill/Verifier/Workbench cases pass. The separate final-Workspace evidence omission is reported under F-002 because the Prompt explicitly requires final-evidence marker rejection.

### F-002 鈥?REVISE: final Workspace bytes evade both scans

**Fact.** In `workbench/src/run-v1.ts::executeV1RunCell`, the producer calls `scanSafeArtifacts` only over `artifactPaths` plus the RunResult/terminal objects (around lines 239鈥?49). The copied final Workspace is not in `artifactPaths` and is not represented by an ArtifactRef; only `terminal.json.final_workspace_digest` binds the tree.

**Fact.** In `workbench/src/inspect-v1.ts::inspectV1RunCell`, `assertActualBytesSafe` scans `terminal.json`, `terminal-evidence.json`, and each declared `terminal.artifact_refs` path (lines 165 and 189鈥?91). The Inspector recomputes the Workspace tree digest at line 177 but never scans any Workspace file bytes.

**Independent counterexample.** The Audit copied authoritative Run `v1b-run-01-parse-duration-r1-a`, first proved it inspect-valid, appended both `Bearer FAKE_AUDIT_WORKSPACE_TOKEN` and `FAKE_SENSITIVE_AUDIT_WORKSPACE_MARKER` to the allowed final Workspace source file, and coherently updated `terminal.final_workspace_digest`. The second inspection still returned `integrity_valid: true`, with no errors. Evidence: `.runs/v1-b/audit/workspace-byte-counterexample-result.json` and `.runs/v1-b/audit/workspace-byte-counterexample/`.

**Expected.** Goal Contract 搂11.1 requires Workspace refs and a secret/reasoning/protected-path scan; 搂11.2 and Audit Prompt F-002 require fake markers entering final evidence to be rejected by the producer or Inspector. A digest-only self-binding does not satisfy the byte-scan boundary.

### F-003 鈥?PASS

**Fact.** Complete B/C initial dispatch equality is checked before normalization. The aggregate reconstructs the exact public Skill wrapper and requires A/B to differ only by the frozen wrapper plus instruction. Arbitrary treatment text, missing/extra wrapper text, wrong Skill body, model/options/tool drift and B/C inequality are rejected. The authoritative aggregate reports `blocks_checked: 8`, `bc_initial_byte_equal: true`, and `ab_only_skill_delta: true`.

**Pi evidence.** Candidate composition imports only public emitted `@earendil-works/pi-agent-core` and `@earendil-works/pi-ai` surfaces. The pinned source evidence is `.upstream/pi/packages/agent/src/harness/agent-harness.ts::AgentHarness.skill`, `.upstream/pi/packages/agent/src/index.ts`, `.upstream/pi/packages/ai/src/index.ts`, and `.upstream/pi/packages/ai/src/providers/deepseek.ts`; no private Pi import, SDK/RPC/Extension path, or Pi patch was found.

### F-004 鈥?PASS

**Fact.** The typed matrix covers `task_pass`, `task_fail`, `treatment_guardrail_failure`, `infrastructure_invalid`, `evidence_invalid`, global budget stop and unknown pause. Treatment-invalid stays in the denominator, infrastructure/evidence-invalid is excluded only from effect success while retained in planned/started/invalid counts, unknown stops as paused, the invalid ratio pauses at `>= 25%`, and the same infrastructure/evidence cause pauses on its second occurrence.

**Fact.** The focused counterexamples prove no silent advance after a previously started nonterminal cell and no start on global reserve failure.

### F-005 鈥?PASS

**Fact.** Provider reserve failure, child time reserve failure and child Verifier-capacity failure leave Attempt/Run/Pilot usage unchanged. Inspector recomputes `before`, `reserved`, `actual`, `after`, cap ceilings, Attempt/Run continuity, and cross-Run Pilot continuity. Coherently rehashed chain drift and `actual > reserved` are rejected.

**Fact.** C-only eligibility, one child maximum, same Session/Workspace lineage and complete child reserve are exercised by the focused suite and the 24-cell zero-call evidence. No fallback, same-Run retry or automatic replacement path was observed.

## 4. Findings

```yaml
finding_id: V1B-AUD-F-001
severity: P1
contract_boundary: Goal Contract 搂11.1 Workspace refs; 搂11.2 secret/reasoning boundary; Gate I; Audit Prompt F-002
source_symbol:
  - workbench/src/run-v1.ts::executeV1RunCell / scanSafeArtifacts
  - workbench/src/inspect-v1.ts::inspectV1RunCell / assertActualBytesSafe
independent_counterexample: append forbidden Bearer and FAKE_SENSITIVE markers to an otherwise valid final Workspace, coherently update terminal.final_workspace_digest, then re-run Inspector
observed_result: before integrity_valid=true; after integrity_valid=true; errors=[]
expected_result: producer must pause/reject before terminal commit, or Inspector must return integrity_valid=false for any forbidden marker in final Workspace evidence
evidence_path:
  - .runs/v1-b/audit/workspace-byte-counterexample-result.json
  - .runs/v1-b/audit/workspace-byte-counterexample/
candidate_impact: Candidate can certify a final Workspace containing credential-shaped/fake-sensitive evidence while secret_scan says passed; Stage 2 evidence confidentiality and validity are not established
minimal_correction_owner: original_v1_b_stage1_preparation_session
required_regressions:
  - producer test proving allowed Workspace bytes containing Authorization/Bearer/reasoning/signature/fake markers cannot terminalize as valid
  - independent coherent-rehash Inspector counterexample over final Workspace bytes
  - positive clean Workspace evidence test and all V1-B F-001/F-002 regressions
  - required V1-A/V0-C evidence regressions
```

```yaml
finding_id: V1B-AUD-F-002
severity: P1
contract_boundary: Goal Contract 搂3.1 tracked concrete real Pi factory/runner/CLI; 搂4.5 exact tracked product surface; 搂6.1 items 1/4/8; 搂7.4 run-next
source_symbol:
  - workbench/src/cli.ts::main (V1-B run-next branch, line 62)
  - workbench/src/product-surface-v1.ts::runNextV1B
  - workbench/src/pilot-v1.ts::runNextPilotCellV1B (line 122)
independent_counterexample: build an audit-local structurally valid stage2_real Manifest with zero credential/network authority, invoke the tracked CLI run-next, and inspect the initialized ledger
observed_result: CLI passes no realExecution dependency; nested CLI exit=1 with "real execution dependencies are unavailable"; ledger remains 24 planned, 0 started
expected_result: the exact tracked product surface must contain the concrete public-Pi/one-Run composition needed by the future no-source-edit Stage 2 Session, with credential resolution remaining lazy until an authorized first request
evidence_path:
  - .runs/v1-b/audit/real-cli-counterexample-result.json
  - .runs/v1-b/audit/real-cli-manifest.json
  - .runs/v1-b/audit/real-cli-pilot/
candidate_impact: a no-source-edit Stage 2 Session cannot execute the real Pilot through the tracked CLI; it would need untracked wiring or a post-Candidate source change, contrary to the frozen execution sequence
minimal_correction_owner: original_v1_b_stage1_preparation_session
required_regressions:
  - zero-credential tracked-CLI test reaching a fake/denied concrete real composition without Provider/network/model dispatch
  - one-use Run authority and lazy resolver assertions through the same tracked entry point
  - valid real Manifest fails closed before started only for denied authority/invalid identity, not because composition is absent
  - full V1-B focused suite and required V1-A/V0-C regressions
```

## 5. Verification commands and observed results

| Command | Working directory | Exit | Result |
| --- | --- | ---: | --- |
| `git rev-parse HEAD` / `git rev-parse HEAD^{tree}` / clean status checks | Audit worktree | 0 | exact Candidate/tree; tracked, staged and `reference/` clean |
| independent Manifest/source digest recomputation | Audit worktree | 0 | exact `ec8a...f3b3b` / `ce768...de127` |
| `node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | exact-Candidate Preparation Workbench | 0 | strict TypeScript passed |
| `node --test workbench/tests/v1b-stage1.test.ts workbench/tests/v1b-cli.test.ts` | Audit worktree with ignored local resolver | 0 | 15/15 passed; 41.5 s |
| `node --test --test-concurrency=1 workbench/tests/v1a-deterministic.test.ts workbench/tests/v0c-stage1.test.ts workbench/tests/v0c-post-audit-correction.test.ts workbench/tests/v0c-main-review-correction.test.ts` | Audit worktree | 0 | 42/42 passed; 37.5 s |
| `node workbench/src/cli.ts v1b aggregate --pilot-root .runs/v1-b/stage1/gate-h-pilot-authoritative-after-main-review-correction` | exact-Candidate Preparation checkout | 0 | 24/24 terminal/comparable; 13 pass, 11 fail; 8 fairness blocks |
| loop `v1b inspect` over all authoritative terminal/invalid Run IDs | exact-Candidate Preparation checkout | 0 | 24 inspected, 24 valid, 0 invalid |
| `node .runs/v1-b/audit/run-workspace-byte-counterexample.mjs` | Audit worktree | 0 | defect reproduced; before and after both inspect-valid |
| `node .runs/v1-b/audit/record-zero-call-real-cli-counterexample.mjs` | Audit worktree | 0 | defect reproduced; nested tracked CLI exit 1, 0 started |

**Fact.** An earlier default-concurrency four-file regression invocation produced 41/42 with one V0-C close-count assertion (`2 !== 1`). The exact failing test passed alone, the complete V0-C post-audit file passed alone, and the bounded four-file set then passed 42/42 with `--test-concurrency=1`. This is recorded as a non-acceptance test-run incident, not hidden or promoted to a Candidate finding.

**Fact.** Initial ignored dependency-loader attempts failed before executing Candidate tests because the Audit worktree contained no dependency links. Only the audit-local resolver was corrected; no Candidate, Pi, fixture, control or reference file changed.

## 6. Evidence index and accounting

Audit evidence root:

`C:/Users/HUAWEI/.codex/worktrees/d3c0/project2/.runs/v1-b/audit/`

Key artifacts:

- `evidence-index.json` 鈥?recursive SHA-256/size inventory of ignored audit evidence;
- `gate-a.json` 鈥?exact Candidate/Pi/Manifest/source/access identity;
- `verification-summary.json` 鈥?commands, exits, bounded incidents and access accounting;
- `workspace-byte-counterexample-result.json` and `workspace-byte-counterexample/` 鈥?F-002 reproducer/result/copy;
- `real-cli-counterexample-result.json`, `real-cli-manifest.json` and `real-cli-pilot/` 鈥?tracked real CLI reproducer/result;
- audit-local `.mjs` reproducers and dependency resolver.

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
tracked_audit_output:
  - docs/reports/V1_B_STAGE1_FOCUSED_INDEPENDENT_AUDIT_REPORT.md
ignored_audit_output:
  - .runs/v1-b/audit/
```

## 7. Unverified and next control action

**Unconfirmed / unauthorized.** This Audit did not read credentials, contact a network or Provider, invoke a real model, validate current DeepSeek pricing/descriptor data, execute a real arm, assess Skill/recovery effectiveness, create an Execution Baseline, or enter Stage 2. It did not re-audit general V0/Pi/Windows/platform concerns.

**Recommendation.** Main Session should review these two P1 findings and return only the accepted bounded correction prompt to the original V1-B Stage 1 Preparation Session. After a corrected Candidate is frozen, a fresh focused re-audit should cover both findings and the listed regressions. Do not create the Execution Baseline or authorize Stage 2 from this Candidate.

Work stops here pending Main Session/user acceptance of this Audit result.
