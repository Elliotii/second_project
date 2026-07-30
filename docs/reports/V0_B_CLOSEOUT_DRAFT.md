# V0-B Closeout Draft — Main-review correction

```yaml
goal_id: V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME
document_status: corrected_draft_pending_independent_risk_audit_and_main_review
formal_goal_acceptance: false
recommended_disposition: PASS_V0_B_EVIDENCE_FOUNDATION
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
`PASS_V0_B_EVIDENCE_FOUNDATION` only after the independently authorized
read-only risk audit and main Session reconciliation.

This draft does not accept or close V0-B. It does not modify control state,
authorize Stage 2, or create an implementation commit.

## Main-review correction disposition

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

## Corrected evidence

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

## Verification summary

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

## Source evidence

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

Use the structured corrected proposal in
`docs/reports/V0_B_IMPLEMENTATION_REPORT.md`. The dedicated Session has not
applied it.

## Required next action

```yaml
next_action:
  owner: current_codex_main_session
  steps:
    - verify corrected root/Pi identity and source scope
    - bind corrected inventory, delta, six Run IDs, and 56-test count
    - start the separately authorized independent read-only risk audit
    - reconcile audit findings with implementation evidence
    - request user acceptance, another bounded correction, or rejection
```

## Stop point

The bounded correction is complete. Stop now. Do not modify control state,
create a commit, execute Stage 2, start the audit from this Session, or enter
the next Goal.
