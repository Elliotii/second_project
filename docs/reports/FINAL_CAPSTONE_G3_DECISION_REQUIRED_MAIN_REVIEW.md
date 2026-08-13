# Final Capstone Goal 3 Decision-required Main Review

```yaml
status: DECISION_REQUIRED
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
main_disposition: DECISION_REQUIRED_PROMOTION_ADMISSION_REGISTRY_SOURCE_IDENTITY_CARDINALITY
correction_budget: 2_of_2_exhausted
same_authority_or_integrity_class_recurrence: false
candidate_frozen: false
mandatory_focused_audit_started: false
real_run_started: false
real_run_consumed: false
```

## Main verification

Main independently checked the Session finding against accepted source rather than relying
on the report alone.

`workbench/src/refinement/admission-v3.ts` establishes a one-source-pair registry model:

- constants `SOURCE_CANDIDATE_REF` and `SOURCE_STATE_REF` name the sole project-root pair;
- `freezeAdmissionRegistryV3` hashes that pair into every registry entry;
- `loadAdmissionRegistryV3` reloads only that pair; and
- `inspectPromotionAdmissionLineageV3` re-derives the admitted Candidate from it and rejects
  any different source refs.

`workbench/src/refinement/regression-gate-g2.ts` prevents a two-root workaround:

- `projectRelative` rejects cross-project roots;
- `validatedAdmission` runs the complete Goal 1 Inspector in the selected project root;
- Candidate publication requires the admission, registration, validation Run and source
  Workspace to remain under that root; and
- reopening the regression selection repeats those checks.

The fixed negative Goal 1 source itself contains an Inspector-valid promoted Candidate
lineage based on the existing fixed source pair. A new Candidate produced from its newly
admitted evidence carries different evidence identity and semantic payload. Overwriting or
aliasing the fixed files destroys the old lineage; copying State/Decision artifacts bypasses
the accepted store/CAS authority. The Contract's existing-only composition cannot satisfy
both lineages simultaneously.

## Budget application

The two allowed correction rounds were consumed as complete finding sets:

1. `FC-G3-PREIMPLEMENTATION-P1-001` — outer versus inner tool-profile identity;
2. `FC-G3-IMPLEMENTATION-P1-002` — V1 source task versus V0B Verifier authority schema.

Both corrections passed Main re-review and neither class recurred. The registry cardinality
finding is a third, distinct integration finding. The User Amendment does not permit a third
patch merely because it belongs to a different class. Platform/sandbox/tool execution
exceptions do not apply because this is an accepted-source architecture constraint.

## Decision boundary

Goal 3 and Final Capstone cannot be accepted or closed on current authority. No Candidate,
audit, Execution Baseline or real Run may proceed.

User direction is required to choose between:

1. authorizing a new structural Goal 3 amendment with explicit accepted-core authority for
   a per-entry promotion-admission registry source identity, a newly defined correction
   budget and mandatory fresh audit; or
2. closing Final Capstone as incomplete with Goal 3 unaccepted and the single real closed
   loop unexecuted.

Until then, preserve the implementation worktree's partial files as unaccepted stop
evidence and do not modify or execute them.
