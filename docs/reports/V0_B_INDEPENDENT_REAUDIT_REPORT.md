# V0-B Focused Independent Re-audit Report

```yaml
report_role: focused_independent_reaudit
candidate_commit: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
candidate_parent: 18ba8466799198b1ce3e732990a49f626fb83d48
scope: V0B-AUD-001_through_005_plus_required_regressions_identity_and_boundaries
recommendation: PASS_FOCUSED_INDEPENDENT_REAUDIT
findings_resolved: 5
findings_unresolved: 0
findings_blocked: 0
formal_v0_b_acceptance: false
current_state_modified: false
source_modified: false
git_commit_created: false
real_or_external_provider_calls: 0
recovery_attempts: 0
child_attempts: 0
```

## 1. Focus and conclusion

**Fact:** This was the lightweight re-audit authorized by
`V0_B_INDEPENDENT_REAUDIT_START_PROMPT.md`. It rechecked only the five findings
from the first independent audit, the specified regression set, corrected
Candidate identity, and protected boundaries. It did not repeat the full
architecture/security audit or search for a sixth finding class.

**Fact:** `V0B-AUD-001` through `V0B-AUD-005` are resolved in the corrected
Candidate. The corrected source shares bounded terminal-evidence policies
between writer and inspector, the formal post-audit tests pass 11/11, the
complete Workbench suite passes 67/67, current mutation copies fail closed, and
the six current V0-B Runs replay their nominal states.

**Recommendation:** `PASS_FOCUSED_INDEPENDENT_REAUDIT`. This recommendation is
advisory and is not formal V0-B acceptance. The main project-control Session
and user retain the acceptance decision.

## 2. Gate A identity and boundary

| Check | Independent result |
| --- | --- |
| Root HEAD | exact `7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180` |
| Candidate parent | exact `18ba8466799198b1ce3e732990a49f626fb83d48` |
| Tracked changes before re-audit | `0` |
| Staged entries before re-audit | `0` |
| Allowed untracked inputs | re-audit prompt plus registered read-only `reference/` tree |
| First audit report SHA-256 | exact `10316dc66c99868772ec4548f0314a5cfc707ef45dd2b4047a127eb29e70393e` |
| Correction prompt SHA-256 | exact `e96f7b17a2f60382a229dde599efe622d2329a26a5801e82706eab1d3ae9bd77` |
| Implementation Report SHA-256 | exact `b3d1d266fa3d0aee0f9a860911a0e86d4cee4e675aaeaf81db2232bb9c7847c7` |
| Closeout Draft SHA-256 | exact `7db3b86cdebe219064b06d46a03dfc9573315a60b516b1c5fbcd79a395933b6c` |
| Source Inventory file SHA-256 | exact `6b9e90e4652df1ee85fc1f29e6d053d931901c17e098fa46dcb4cdbdf9ca9ac5` |
| Source Delta file SHA-256 | exact `49e6cf7a750f446734c87a662088843fb104d4d6c5c7994f3243cf9aca19237b` |
| Micro-correction probe SHA-256 | exact `c3a2e88e02309f2ef943d6637e55409a08d8186aaeeebda95c2a225ac42696bc` |
| Source Inventory | 52/52 Candidate blobs and checkout bytes match size/SHA-256 |
| Source Delta | 36/36 entries match change type and Candidate bytes |
| Baseline-to-Candidate actual delta | 40 entries: 36 declared source entries plus 4 explicitly excluded audit/control provenance files |
| Correction delta | 14 entries; protected/control/V0-A/Pi/reference hits `0` |
| Workbench tree digest | exact `b8034b235acdf50630c7bebc3859f001799986333622ae0ce1b545528d3fe8d0` |
| V0-A implementation baseline | commit `1a1565fa7e6d1440c8f99e2c7e587201a14111c1` exists |
| `.upstream/pi` | exact `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| `.runs/v0-a/pi` | exact `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |

The four provenance exceptions are:

- `V0_B_INDEPENDENT_RISK_AUDIT_REPORT.md`;
- `V0_B_INDEPENDENT_RISK_AUDIT_START_PROMPT.md`;
- `V0_B_MAIN_REVIEW_BOUNDED_CORRECTION_PROMPT.md`;
- `V0_B_POST_AUDIT_BOUNDED_CORRECTION_PROMPT.md`.

They are explicitly outside the Workbench Source Inventory in the bounded
correction material. Gate A passed; no Pause condition was hit.

The isolated re-audit workspace/raw root was:

```text
D:\AI\AI_Projects\project2\.runs\v0-b\reaudit\7e0d8f7
```

It used only ignored junctions to the existing local Pi packages and
`@types/node`; no install, download, Registry, network, credential, or model
operation occurred.

## 3. Five-finding closure matrix

| Finding | Result | Source/symbol | Test and probe | Actual result |
| --- | --- | --- | --- | --- |
| `V0B-AUD-001` scan attestation binding | resolved | `terminal-policy.ts`: `TERMINAL_SCAN_*`, `terminalScanFileScopesV0B`, `secretRelevantObjectProjectionV0B`, `preterminalJournalBytesV0B`; `inspect-v0b.ts:222-334` | `v0b-post-audit.test.ts` scan-policy tests; preserved scope-omission/file-forgery/object-forgery copies; focused unknown-scope probe | Missing, duplicate, unknown, wrong-kind, forged file/object digest, and terminal-label mismatch all produce `integrity_valid:false`. |
| `V0B-AUD-002` Index completeness | resolved | `terminal-policy.ts`: `TERMINAL_INDEX_RESPONSIBILITIES_V0B`, `terminalIndexItemV0B`, `validateTerminalIndexPolicyV0B`; writer and inspector both call the policy | post-audit Index tests; preserved rebound `attempt.json` omission copy; focused unexpected-entry probe | Omission, responsibility mismatch, missing Tool artifact, unexpected entry, duplicate/cycle path are rejected within the exact V0-B terminal set. |
| `V0B-AUD-003` terminal Journal suffix | resolved | `terminal-policy.ts`: `terminalLifecycleDataV0B`, `validateTerminalJournalSuffixV0B`; `journal.ts`: terminal validation mode; `inspect-v0b.ts:374-397` | swapped suffix, event-after-terminal, duplicate terminal, Outcome-projection mismatch tests; preserved terminal-order copy | Required `evidence_validation_completed < outcome_created < run_terminal`, exactly-once counts, final suffix, and Outcome projection are enforced. |
| `V0B-AUD-004` wall-time truth | resolved | `run-v0b.ts:712-748` post-scan usage refresh/fail-closed decision; `run-v0b.ts:783-810` final pre-marker check | deterministic two-clock-path test; `run-76ba3cab-3d2b-42a3-a65c-dc1eb0774142` | Integrated-scan crossing records 150/100 ms, remains incomplete, and has no Outcome, Index, or terminal marker. A later pre-marker crossing has no accepted terminal. |
| `V0B-AUD-005` scanner variants | resolved | `secret-scan.ts`: `RULES`, `decodedJsonRepresentations`, `scanPreterminalEvidenceV0B`; shared secret-relevant projection | two bounded scanner tests; micro-correction probe result | Escaped JSON key, Basic text/file, Bearer tab/newline object, flat Basic object, and nested Basic header object reject. Existing controls reject, benign authorization metadata passes, and matches persist only rule/scope metadata. |

### 3.1 Independent fail-closed replay

The corrected Candidate independently inspected the preserved mutation copies:

| Mutation | `committed` | `integrity_valid` | Principal diagnostic |
| --- | ---: | ---: | --- |
| required scan scope omitted | true | false | exact scope policy mismatch / missing `session_evidence` |
| file scope digest forged | true | false | `session_evidence` digest mismatch |
| object scope digest forged | true | false | `pending_run_object` digest mismatch |
| `attempt.json` removed from rebound Index | true | false | required terminal evidence omitted |
| Outcome/terminal Journal order swapped | true | false | lifecycle ordering and suffix invalid |
| wall-time scan crossing | false | false | terminal missing |

A focused audit-local probe additionally produced:

```yaml
unknown_scan_scope:
  committed: true
  integrity_valid: false
  diagnostic: preterminal scan contains unknown scope
unexpected_index_entry:
  committed: true
  integrity_valid: false
  diagnostic: Evidence Index contains unexpected V0-B terminal evidence
```

Raw result:

```text
.runs/v0-b/reaudit/7e0d8f7/.runs/v0-b/reaudit-evidence/focused-extra-probe-results.json
```

### 3.2 Scanner result safety

All six required synthetic credential/header variants in
`basic-authorization-object-micro-correction-probe-results.json` have
`status: rejected`, `match_count: 1`, and only `rule_id`/`scope_label`
metadata. An independent content search found zero persisted synthetic values
in that result. The benign
`{ authorization_required: false, authorization_scheme: "none" }` control
passes.

This remains a bounded V0-B JSON/JSONL/text ruleset, not general DLP.

## 4. Required regressions

Runtime: Node `v24.14.1`; TypeScript `5.9.3`.

| Command | Exit | Result |
| --- | ---: | --- |
| `tsc.cmd -p workbench/tsconfig.json --noEmit` | 0 | strict TypeScript passed |
| first clean-isolation `node --test 'workbench/tests/v0b-post-audit.test.ts'` | 1 | 10 passed; one fixture-setup ENOENT before assertion |
| create ignored `.runs/v0-b/test-cases/` directory | 0 | no source/evidence mutation |
| rerun `node --test 'workbench/tests/v0b-post-audit.test.ts'` | 0 | 11 passed, 0 failed, 0 skipped |
| `node --test 'workbench/test'` | 0 | 67 passed, 0 failed, 0 skipped |
| `node 'workbench/scripts/public-import-smoke.mjs'` | 0 | public emitted Pi imports resolved |
| `node 'workbench/scripts/verify-formal-run.mjs' '.runs/v0-a/runs/run-5c0b157e-31d7-4873-95a1-fd284377ace3'` | 0 | accepted V0-A authoritative Run verified |
| V0-A authoritative Workspace `node --test 'test/public.test.ts'` | 0 | 3 passed, 0 failed, 0 skipped |
| current six-Run nominal inspect replay | 0 | results in Section 5 |
| preserved mutation-copy inspect replay | 0 | all intended mutations rejected |
| focused unknown-scope/unexpected-Index probes | 0 | both rejected |

**Fact:** The initial post-audit-test exit 1 was caused solely by
`writeFileSync()` targeting a missing ignored test-case directory in the fresh
isolated audit root. After creating that directory, the exact test file passed
11/11 and the complete suite passed 67/67. No product source or test was
changed.

## 5. Current V0-B Run replay

| Role / Run | `committed` | `integrity_valid` | Outcome |
| --- | ---: | ---: | --- |
| authoritative pass `run-914dc89c-defd-4e03-ab37-7fd09230fe93` | true | true | `passed/null` |
| valid Agent failure `run-71cab6c1-146e-408e-ad6e-f3fcca69a2fb` | true | true | `failed/agent` |
| invalid Verifier `run-b39a2e08-c8b3-472f-9273-227f31d28830` | true | true | `invalid/verifier` |
| post-persistence corruption `run-fa298df7-19bc-462a-87a4-9c9bdec1dad4` | true | false | `invalid/evidence` |
| persistence operation failure `run-95bc62c4-7bf5-4f74-bd32-ecd627fc8ee3` | false | false | incomplete; no terminal |
| secret-scan rejection `run-155f1cae-9ae5-4c69-a261-ef32f80d482b` | false | false | incomplete; no terminal |

All six current Runs, plus the wall-crossing Run, bind the expected Workbench
digest, record `external:false`, `credentials_used:false`,
`external_provider_calls:0`, one ordinal-1 initial Attempt, and no parent
Attempt. Source and test review confirm Recovery and child Attempts remain zero.

## 6. Before/after boundary status

```yaml
candidate:
  head_before: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
  tracked_changes_before: 0
  staged_entries_before: 0
  expected_head_after: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
  expected_tracked_changes_after: 0
  expected_staged_entries_after: 0
protected_control_candidate_delta: 0
current_state_modified: false
pi:
  upstream_head: 027a5847901b5dde30270abaa1041046cd2b4b55
  upstream_clean: true
  v0_a_dependency_head: 027a5847901b5dde30270abaa1041046cd2b4b55
  v0_a_dependency_clean: true
model_network_install_credential_activity: 0
```

The only official output of this re-audit is this report. Audit-local generated
Runs, synthetic inputs, and focused probe evidence remain under the authorized
ignored re-audit root. `CURRENT_STATE.md`, Contract, Charter, control rules,
ADR, product source/tests, V0-A, Pi, reference material, prior audit raw
evidence, and existing V0-B evidence were not modified.

## 7. Unverified boundaries and deferred observation

The focused re-audit does not verify or claim:

- real-model effectiveness, Completion Policy effect, or Recovery effect;
- cross-process Resume, crash reconciliation, or exactly-once Tool execution;
- OS sandbox/network-egress blocking, concurrent same-account race resistance,
  real-time scheduling, exact final disk-byte timing, or process-tree
  cancellation;
- general DLP, encrypted/compressed/arbitrary encoding detection;
- V0-C, V1, or V2 implementation.

```yaml
deferred_non_blocking_observations:
  - >
    v0b-post-audit.test.ts assumes the ignored .runs/v0-b/test-cases directory
    already exists. A fresh isolated root needs that harmless setup directory;
    this did not affect any product assertion or five-finding closure result.
```

## 8. Final recommendation

```yaml
recommendation: PASS_FOCUSED_INDEPENDENT_REAUDIT
basis:
  - Gate_A_identity_and_boundaries_passed
  - V0B-AUD-001_resolved
  - V0B-AUD-002_resolved
  - V0B-AUD-003_resolved
  - V0B-AUD-004_resolved
  - V0B-AUD-005_resolved
  - strict_typescript_passed
  - post_audit_tests_11_of_11_passed
  - complete_workbench_tests_67_of_67_passed
  - public_Pi_import_and_V0_A_regressions_passed
formal_v0_b_acceptance: false
next_owner: main_project_control_session_and_user
auditor_action: stop_and_wait
```
