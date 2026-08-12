# Final Capstone Goal 1 Post-acceptance Negative Admission Correction Authorization

```yaml
status: completed_accepted_by_main
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
trigger_goal: FINAL_CAPSTONE_G2_REGRESSION_GATED_STATE_FEEDBACK
finding_id: FC-G1-POSTACCEPT-P1-001
correction_budget: 1_of_1_consumed_completed
implementation_owner: fresh_top_level_goal_1_post_acceptance_correction_session
credential_reads_authorized: 0
external_network_authorized: false
external_provider_or_model_calls_authorized: 0
real_model_calls_authorized: 0
pi_changes_authorized: false
git_stage_or_commit_authorized: false
```

## Main finding set

This is one indivisible Main finding set under the accepted correction-budget Amendment.

**Fact.** Goal 2 Gate C requires an Inspector-valid negative bound-State follow-up admission
before it can distinguish ordinary negative evidence from a State-attributable regression.

**Fact.** Accepted Goal 1 currently has exactly one fixed V3 bound-State registration,
`final-capstone-g1-v3-project/g1-host-v3`, and its admitted outcome is `passed` with
attribution `none`. A different negative registration digest correctly fails at
`fixedHostApprovalG1`.

**Disposition.** Preserve that fail-closed behavior. Add one and only one new exact,
source-defined Host approval for a deterministic negative V3 bound-State follow-up
registration. This uses the existing fixed approval root, existing V3 source family,
existing Inspector, existing admission record and existing schema. It does not add runtime
enrollment, caller grant data, signing, another State authority or a generic registry.

This is Goal 1's sole post-acceptance correction round (`1/1`). If the correction plus
required tests and Main re-review cannot keep Goal 1 accepted and closed, or the same
caller-mintable authority/integrity defect class recurs, Main returns `DECISION_REQUIRED`.

## Exact correction

1. Extend `FIXED_HOST_APPROVALS_G1` with one exact project/registration/digest tuple for a
   negative `v3g3_bound_state_followup` fixture.
2. The negative fixture must still prove a promoted non-base State, non-empty applicable
   binding, promotion lineage, matching runtime path, Case Authority, terminal Run and
   frozen independent Verifier. Only its legitimate Verifier result is negative.
3. The admitted record must recompute as `outcome.status: failed`,
   `outcome.verifier_status: failed`, and `validity.attribution: verifier`, while preserving
   exact State/version/binding/Decision/Case identity.
4. Reopen through `inspectTrustedEvidenceAdmissionG1` must pass independently and detect
   source/admission tamper as before.
5. Existing positive V3 approval and all authority-forgery negatives must remain unchanged.
6. Unknown or modified negative registrations, caller approval objects and arbitrary paths
   remain rejected by the private fixed root.

## Allowed delta

- `workbench/src/refinement/evidence-admission-g1.ts`;
- `workbench/tests/final-capstone-g1-evidence-admission.test.ts`;
- `docs/reports/FINAL_CAPSTONE_G1_POST_ACCEPTANCE_CORRECTION_REPORT.md`;
- `docs/reports/FINAL_CAPSTONE_G1_POST_ACCEPTANCE_CLOSEOUT_AMENDMENT_DRAFT.md`;
- ignored deterministic evidence under `.runs/final-capstone/g1/`.

Do not modify Goal 2 partial source, accepted State/history, `CURRENT_STATE.md`, Charter,
Contracts, prior Goal 1 reports, Pi, product source or Git state.

## Required verification

```powershell
node 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.json --noEmit
node --test tests/final-capstone-g1-evidence-admission.test.ts
node --test tests/v3g1-evidence-to-candidate.test.ts
node --test tests/v3g2-validate-promote-reject-rollback.test.ts
node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts
```

Record exact identities, hashes, commands/exits/counts, zero-access counters and remaining
limits, then stop for Main re-review without staging or committing.

## Main completion record

The dedicated Session returned the bounded two-file correction without staging or
committing. Main reviewed the complete delta, reran strict TypeScript and the frozen
51-test matrix, and accepted the correction. Candidate commit:
`5ff70947465f9dc2cbccd5d6e4ca10b6afb3868d`. Formal disposition and identities are in
`docs/reports/FINAL_CAPSTONE_G1_POST_ACCEPTANCE_CORRECTION_MAIN_REREVIEW.md` and
`docs/reports/FINAL_CAPSTONE_G1_POST_ACCEPTANCE_CLOSEOUT_AMENDMENT.md`.

The correction round is complete and Goal 1 remains closed/accepted. Its correction
budget is exhausted; no further Goal 1 source correction is authorized.
