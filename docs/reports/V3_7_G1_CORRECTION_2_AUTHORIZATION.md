# V3.7 Goal 1 Correction Round 2 Authorization

```yaml
status: COMPLETED_MAIN_REREVIEW_PASSED_AUDIT_CANDIDATE_FROZEN
goal: V3_7_G1_REGISTERED_RECOVERY_EVIDENCE_BRIDGE
correction_round: 2_of_2
failed_candidate_commit: a62051044332d438cbc0f33ec6ccc3f74097ef2f
failed_candidate_tree: 7eb150cdaecb9234d62fde2bba31f1e59dd7f107
binding_review: docs/reports/V3_7_G1_CORRECTION_1_MAIN_REREVIEW.md
implementation_owner: /root/v37_g1_correction_1
candidate_commit: 0cf5b81976880d57a8b09bbd3f87be68853cbb3b
candidate_tree: d6c59a29d1833fccd53164c295c5bf3bc90ebcba
main_rereview: docs/reports/V3_7_G1_CORRECTION_2_MAIN_REREVIEW.md
main_rereview_result: passed
architecture_and_acceptance_owner: authoritative_V3_7_successor_Main_Session
audit_authority: false
goal_2_authority: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_product_tasks: 0
```

## Mission

Correct only residual finding `V37-G1-MAIN-P1-003-R1`. Preserve both prior candidate
commits/trees without amend and create one new candidate commit on top of `a620510...`.

The content-independence predicate must reject a concise Candidate that names an exact
frozen Task/Source/Verifier symbol and supplies a task-specific answer or transformation,
without relying on the current five-shared-token threshold. It must continue to reject
the existing long direct answer and verifier-derived literal leakage while accepting the
existing generic transferable guidance.

## Exact correction boundary

Only these paths may change:

```text
workbench/src/v37/candidate-v37.ts
workbench/tests/v37g1-registered-recovery.test.ts
docs/reports/V3_7_G1_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G1_CLOSEOUT_DRAFT.md
```

Do not alter registry, workflow/Run binding, recovery, historical reopen, configuration,
old-family semantics, control state, Charter, Prompt, Main reports, Pi or Goal 2.

## Required deterministic tests

- reject the exact short Main repro `Make parseDuration multiply seconds by 1000.`;
- retain rejection of the existing longer direct answer and verifier-derived literal
  leakage;
- retain acceptance of generic transferable guidance;
- rerun Goal 1 focused tests, the Prompt Section 10 regression matrix, the narrowest
  environment-equivalent strict TypeScript check, `git diff --check`, allowlist/status
  and Pi cleanliness.

Stop for Main if the correction requires any allowlist expansion or contract change. On
success, update both implementation reports, create one new candidate commit/tree and
stop. Do not audit, accept Goal 1, update control state or start Goal 2.
