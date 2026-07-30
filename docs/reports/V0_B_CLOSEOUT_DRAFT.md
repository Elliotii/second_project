# V0-B Closeout Draft — Post-audit bounded correction

```yaml
goal_id: V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME
document_status: basic_authorization_object_micro_correction_complete_pending_main_review_and_independent_reaudit
formal_goal_acceptance: false
recommended_disposition: PASS_V0_B_EVIDENCE_FOUNDATION_only_after_independent_reaudit_and_main_review
active_goal_control_state_modified: false
git_commit_created: false
real_model_calls: 0
external_provider_calls: 0
recovery_attempts: 0
child_attempts: 0
pi_core_patches: 0
```

## Closeout recommendation

The dedicated V0-B Session recommends
`PASS_V0_B_EVIDENCE_FOUNDATION` only after a new immutable corrected Candidate
Commit, focused independent re-audit plus full regressions, and main
Session/user reconciliation.

This draft does not accept or close V0-B. It does not modify control state,
authorize Stage 2, or create an implementation commit.

## First independent audit and bounded correction

The first independent audit of Candidate Commit
`18ba8466799198b1ce3e732990a49f626fb83d48` returned
`REQUEST_BOUNDED_CORRECTION` with four P1 blockers and one P2 bounded-scanner
gap. It denied that candidate's Gates A–H PASS / DoD 25-of-25 recommendation.
The candidate, its six Runs, raw audit probes, and Audit Report remain
preserved.

The user-authorized post-audit correction addressed only:

1. scan-attestation binding;
2. Evidence Index completeness;
3. terminal Journal suffix/order and Outcome projection;
4. post-scan wall-time truth plus a pre-marker deadline checkpoint;
5. audited bounded JSON/Authorization scanner variants.

No Contract revision, architecture redesign, Pi patch, real model, Recovery,
child Attempt, transaction runtime, general DLP, or OS sandbox was added.

The subsequent main-session review passed Findings 001–004 and reproduced one
remaining Finding 005 case: flat and nested Basic Authorization objects were
not rejected although the plain-text header was. The authorized micro-correction
changed only the bounded scanner regex and its formal regression. It now
rejects plain-text, flat JSON/Object, nested headers, and decoded-safe JSON
representations while keeping matched values out of evidence and benign
`authorization_required: false` controls accepted.

## Historical main-review correction disposition

> The following main-review candidate evidence is historical and superseded by
> the post-audit evidence later in this draft.

The first-round Gates A–H PASS, DoD 25/25, 42/42 test count, and first-round
authoritative IDs are superseded. Their Run artifacts remain unchanged.

Corrections completed:

1. integrated secret/reasoning scan before terminal commit;
2. link-aware and real-path-contained ArtifactRef/Inspect boundary;
3. complete Verifier execution evidence and full Journal ArtifactRefs;
4. complete bounded reasoning-redaction metadata;
5. actual evidence-mirror persistence-operation failure, separated from
   post-persistence corruption;
6. truthful wall-time usage, fixed Faux hard bounds, and route-consistent abort
   evidence.

## Historical main-review evidence

| Role | Run ID | Result |
| --- | --- | --- |
| authoritative pass | `run-dc84dc47-7fca-4e68-9118-7269e298c90f` | `passed/null`, inspect exit 0 |
| valid Agent failure | `run-7da827c4-4c8f-463f-ac57-99d137ee9ea9` | `failed/agent`, integrity-valid |
| invalid Verifier | `run-40360101-6ed0-4756-97ef-f63f98396bb1` | `invalid/verifier`, integrity-valid |
| post-persistence corruption | `run-4671912d-1e79-4eab-ad97-b54b70675147` | `invalid/evidence`, inspect exit 1 |
| persistence-operation failure | `run-82895dce-f949-4771-9eec-5e80a904ad10` | incomplete; no Verifier, Outcome, Index, or terminal |
| secret-scan rejection | `run-4a0e1530-e37d-43ab-a817-2a9d2ea62ebe` | incomplete; no terminal; secret value not persisted |

The first-round authoritative Run
`run-80a75c40-a70d-4117-b4e0-77ceeb089266` is marked
`superseded_due_main_review_evidence_and_path_correction`. Its three
counterexamples are preserved as superseded first-round evidence.

## Historical main-review verification summary

```yaml
corrected_gate_a_through_h: recommended_pass
definition_of_done: recommended_25_of_25_subject_to_audit_and_acceptance
strict_typescript: passed
workbench_tests:
  passed: 56
  failed: 0
  skipped: 0
targeted_path_malformed_scan_verifier_tests:
  passed: 11
  failed: 0
  skipped: 0
v0_a_authoritative_run_regression: passed
v0_a_public_task_tests:
  passed: 3
  failed: 0
  skipped: 0
public_emitted_pi_import_smoke: passed
corrected_terminal_run_scan_matches: 0
corrected_six_run_external_scan_matches: 0
root_staged_files: 0
protected_tracked_diff: 0
pi_status: clean
```

## Windows link coverage

Actual junction/reparse tests covered intermediate escape, dangling ancestor,
linked Run root, final-link rejection, and directory masquerading. The current
Windows account could not create a file symlink without extra privilege, so
the final-link fallback was an actual directory junction through the same
`lstat().isSymbolicLink()` rejection branch. Direct file-symlink execution is
not claimed.

## Scope and non-claims

The correction did not:

- modify `CURRENT_STATE.md`, the formal Contract, Charter, control rule,
  accepted ADRs, or V0-A Closeout;
- modify Pi, the accepted V0-A fixture, V0-A authoritative evidence, old V0-B
  Runs, or `reference/`;
- call a real model or external Provider;
- use external network, install dependencies, or read credentials/`.env`;
- add Recovery, a second/child Attempt, Stage 2, V0-C, V1, or V2;
- stage files, create a Git commit, or run the independent risk audit.

The correction does not prove an OS sandbox, network-egress guarantee,
process-tree termination, cross-process Resume, crash reconciliation,
exactly-once execution, real-model effectiveness, Completion Policy
improvement, or statistical validity.

## Historical main-review source evidence

```yaml
corrected_source_inventory_files: 50
corrected_source_delta_files: 34
workbench_tree_digest_bound_by_authoritative_run: 17daf52f08312659819877a7117e404aa1af0c0f293565a7a0448ca2627213d9
```

Detailed source inventory, delta, commands, and Goal evidence index:

- `.runs/v0-b/evidence/source-inventory.json`;
- `.runs/v0-b/evidence/source-delta.json`;
- `.runs/v0-b/evidence/commands-and-exit-codes.md`;
- `.runs/v0-b/evidence/EVIDENCE_INDEX.md`.

## Historical post-audit corrected evidence

| Role | Run ID | Result |
| --- | --- | --- |
| authoritative pass | `run-aa71e3dc-1913-4d2e-aae8-86ad66c67f6a` | `passed/null`, committed, integrity-valid |
| valid Agent failure | `run-3676b527-ecb7-4f8f-98d5-3df7f1018783` | `failed/agent`, integrity-valid |
| invalid Verifier | `run-3a53c1b0-60f9-40b4-99a5-6890e3d5b94d` | `invalid/verifier`, integrity-valid |
| post-persistence corruption | `run-12d367db-a5d4-44c0-adc4-6cd51ee9880f` | `invalid/evidence`, integrity-invalid |
| persistence-operation failure | `run-fc3688c7-a904-49a6-83db-74d2408612a2` | incomplete; terminal absent |
| secret-scan rejection | `run-6a47dd03-c533-4c45-821c-278a7e1e3d14` | incomplete; terminal absent |
| wall-time scan crossing | `run-5146b78e-3d60-41ba-bf75-5b41e1da1582` | incomplete; Outcome and terminal absent |

All earlier V0-B evidence sets remain unchanged and are
`superseded_due_independent_audit_bounded_correction` for current Claims.

```yaml
post_audit_verification:
  strict_typescript: passed
  workbench_tests: 66_passed_0_failed_0_skipped
  post_audit_tests: 10_passed_0_failed_0_skipped
  existing_correction_tests: 11_passed_0_failed_0_skipped
  v0_a_authoritative_run_regression: passed
  v0_a_public_task_tests: 3_passed_0_failed_0_skipped
  public_emitted_pi_import_smoke: passed
  audit_mutation_copies_fail_closed: true
  workbench_tree_digest: d8726451a2fe858296fb53bb5d86cac51ba28977f324727d7a95006c0512d6b9
  source_inventory_files: 52
  source_delta_files: 36
  real_model_calls: 0
  external_provider_calls: 0
  recovery_attempts: 0
  child_attempts: 0
```

The historical five-finding correction matrix and `INDEPENDENT_REAUDIT_INPUT` are
in Sections 15–17 of `V0_B_IMPLEMENTATION_REPORT.md`. The probe-copy results
are at
`.runs/v0-b/evidence/post-audit-correction-probe-results.json`.

The `run-aa71e3dc…` set is preserved but
`superseded_due_basic_authorization_object_micro_correction`.

## Basic Authorization object micro-corrected evidence

| Role | Run ID | Result |
| --- | --- | --- |
| authoritative pass | `run-914dc89c-defd-4e03-ab37-7fd09230fe93` | `passed/null`, committed, integrity-valid |
| valid Agent failure | `run-71cab6c1-146e-408e-ad6e-f3fcca69a2fb` | `failed/agent`, integrity-valid |
| invalid Verifier | `run-b39a2e08-c8b3-472f-9273-227f31d28830` | `invalid/verifier`, integrity-valid |
| post-persistence corruption | `run-fa298df7-19bc-462a-87a4-9c9bdec1dad4` | `invalid/evidence`, integrity-invalid |
| persistence-operation failure | `run-95bc62c4-7bf5-4f74-bd32-ecd627fc8ee3` | incomplete; terminal absent |
| secret-scan rejection | `run-155f1cae-9ae5-4c69-a261-ef32f80d482b` | incomplete; terminal absent |
| wall-time scan crossing | `run-76ba3cab-3d2b-42a3-a65c-dc1eb0774142` | incomplete; Outcome/terminal absent |

```yaml
micro_correction_verification:
  strict_typescript: passed
  post_audit_tests: 11_passed_0_failed_0_skipped
  complete_workbench_tests: 67_passed_0_failed_0_skipped
  flat_basic_object: rejected_metadata_only
  nested_basic_header_object: rejected_metadata_only
  existing_basic_text_file: rejected_metadata_only
  benign_authorization_required_control: passed
  workbench_tree_digest: b8034b235acdf50630c7bebc3859f001799986333622ae0ce1b545528d3fe8d0
  real_model_calls: 0
  external_provider_calls: 0
  recovery_attempts: 0
  child_attempts: 0
```

Current probe-copy result:

- `.runs/v0-b/evidence/basic-authorization-object-micro-correction-probe-results.json`

## Remaining unverified

- V0-B-specific real-model observe-only route;
- Completion Policy and Recovery effect;
- cross-process Resume;
- in-flight crash recovery and side-effect reconciliation;
- exactly-once Tool execution;
- OS sandbox, network-egress blocking, and process-tree termination;
- statistical Eval validity;
- direct file-symlink execution under this Windows account.

## `CURRENT_STATE_UPDATE_PROPOSAL`

The dedicated Session has not applied this proposal:

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  active_goal: V0_B
  status: basic_authorization_object_micro_correction_complete_pending_main_review_and_independent_reaudit
  formal_acceptance: false
  first_audit_candidate: 18ba8466799198b1ce3e732990a49f626fb83d48
  independent_reaudit: pending
```

## Required next action

```yaml
next_action:
  owner: current_codex_main_session
  steps:
    - review the five-finding correction matrix and source/evidence boundaries
    - authorize and create an immutable corrected Candidate Audit Baseline Commit
    - launch a focused independent re-audit plus full regressions
    - reconcile the re-audit before requesting V0-B acceptance
```

## Stop point

The post-audit bounded correction is complete. Stop now. Do not modify control
state, create a commit, execute Stage 2, run the independent re-audit from this
Session, accept V0-B, or enter the next Goal.
