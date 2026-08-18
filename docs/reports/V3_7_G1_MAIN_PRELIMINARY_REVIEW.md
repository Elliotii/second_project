# V3.7 Goal 1 Main Preliminary Review

```yaml
status: FAILED_CORRECTION_REQUIRED
goal: V3_7_G1_REGISTERED_RECOVERY_EVIDENCE_BRIDGE
review_owner: authoritative_V3_7_successor_Main_Session
candidate_commit: 7aca62cc5b329414873bb334ba13547eb9c98d53
candidate_tree: 0f70e8b51b0a4414db42a72b3cfa4bb7cd35b70a
candidate_amended: false
audit_candidate_frozen: false
audit_started: false
goal_2_locked: true
correction_round: 1_of_2_authorized
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_product_tasks: 0
```

## Recovery and evidence basis

**Fact.** The candidate identity matches the predecessor handoff and the dedicated
Implementation worktree is clean at the exact commit/tree above. Its twelve-file delta is
the allowlisted Goal 1 implementation; no accepted V2/G1/V3/G2 source changed.

**Fact.** The predecessor's preliminary findings existed only in Session progress. No
tracked preliminary-review report had been created before the predecessor stopped. This
report is the first repository control record that binds those findings to the exact
candidate.

The successor Main reproduced the four checks in a detached exact-candidate worktree. The
diagnostic test is audit-local ignored evidence under
`.runs/v37/g1-main-review/preliminary-review-repro.test.ts`; it is not candidate source.

```powershell
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g1-registered-recovery.test.ts
# PASS 11/11

node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 ../.runs/v37/g1-main-review/preliminary-review-repro.test.ts
# PASS 4/4 reproductions
```

## Findings

### V37-G1-MAIN-P1-001 — Primary Run is not pre-bound to workflow registration

**Fact.** `deriveRegisteredRecoveryPackageV37` accepts a `runRoot` at derivation time and
checks the V2 Run against the registered Case/profile, but no Host-owned pre-execution
artifact binds the Primary `run_id` and Run-root identity to the workflow. The exact V2
Run created for workflow A can therefore be projected as workflow B Evidence.

**Contract violation.** Charter Sections 3.2, 3.3 and 4.3 require cross-workflow lineage to
fail closed and every formal Run to bind the Host-minted workflow ID and workflow
registration digest. Goal 1 Prompt Sections 1, 7 and 9 require the corresponding fixed
workflow/Run identity and substitution rejection.

### V37-G1-MAIN-P1-002 — caller `projectRoot` selects the registry baseline

**Fact.** `loadRegisteredCaseFromHostRegistryV37` resolves the fixed relative registry
location against runtime `options.projectRoot`. An identical copied configuration under a
different root loads successfully and produces the same `registry_trust_root_digest`; the
resolved baseline origin is absent from that identity.

**Contract violation.** Charter Section 4.2 and Goal 1 Prompt Section 5 require one
baseline-bound Host registry definition and forbid caller registry override. A fixed
relative filename is insufficient when its root remains caller-selected.

### V37-G1-MAIN-P1-003 — Candidate independence does not inspect frozen task/source/verifier

**Fact.** `producePromptCandidateV37` checks only the static
`candidate_policy_spec.body.leakage_indicators`. It does not load or compare the frozen
Primary Task, source workspace or Verifier content. A prompt addendum containing the
registered task's concrete answer passes validation when it avoids those four indicators.

**Contract violation.** Charter Sections 3.5 and 5.6 and Goal 1 Prompt Sections 6 and 9
require rejection of task-answer leakage through deterministic inspection of the frozen
Task, Source and Verifier inputs, not only authority-key substrings.

### V37-G1-MAIN-P1-004 — disabled registration breaks historical read-only admission reopen

**Fact.** The low-level registry loader can return `historical_read_only: true`, but
`inspectRegisteredRecoveryAdmissionV37` calls recomputation through the current-only
workflow/registry path. After a valid accepted admission is frozen and the current
envelope becomes disabled, inspection returns invalid solely because the Case is disabled.

**Contract violation.** Charter Section 4.2 requires disable to block new execution,
submission and State mutation while preserving read-only reopen/inspection/export and
already accepted historical artifacts. Goal 1 Prompt Sections 8 and 9 require the same
historical read-only reopen behavior.

## Main disposition

```yaml
preliminary_review: failed
finding_count: 4
highest_severity: P1
original_candidate_preserved: true
correction_scope: four_confirmed_findings_plus_necessary_tests_and_reports_only
ordinary_correction_budget_consumed: 1_of_2
next_action: return_bounded_Correction_1_to_original_Implementation_Session
```

No finding changes the accepted Charter, old G1 family semantics, V2 truth, V3 State/CAS
or G2 semantics. All four are correctable within the original Goal 1 allowlist and
ordinary correction budget. Audit remains unauthorized until a new candidate passes Main
preliminary re-review.

