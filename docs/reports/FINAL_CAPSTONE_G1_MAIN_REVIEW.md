# Final Capstone Goal 1 — Main Review

```yaml
status: revision_required_before_candidate_freeze
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
reviewed_head: 4c4d2f3f397be7784700a2323c2afeaecbad03f0
candidate_commit: null
focused_audit: not_started
disposition: REVISE_FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
```

## Outcome

Main does not accept Goal 1 on the current Working Session delta. The implementation is
bounded, type-correct and regression-clean, but two semantic identity/lineage findings
contradict the frozen Goal 1 Contract. Both are correctable inside the existing allowlist;
there is no architecture-level `DECISION_REQUIRED` and no reason to enter Goal 2.

No source repair, Candidate commit, staging, control-state edit or audit dispatch was
performed by Main.

## Findings

### G1-MAIN-P1-001 — Unbound base State is admitted as `v3g3_bound_state_followup`

**Fact.** The focused V3 fixture calls only `initializeStateStoreV3`, then freezes a Run
binding. The resulting `binding.json` has:

```yaml
active_state_version: 0
bound_entries: []
lineage: null
adaptive_skill_name: null
```

The adapter checks project/task/digest linkage but does not require a promoted State,
non-empty applicable binding or promotion lineage. It therefore labels and admits an
unbound base-State Run as the Contract's bound-State follow-up family.

**Evidence.** `workbench/tests/final-capstone-g1-evidence-admission.test.ts:92-124,181-190`;
`workbench/src/refinement/evidence-admission-g1.ts:200-219`; ignored artifact
`.runs/final-capstone/g1/sources/v3-bound/run/binding.json`.

**Contract impact.** Contract sections 3, 4.2, 4.3 and Gate B require a valid bound-State
follow-up with exact State/version/binding identity. Recording an unbound version-0
identity is not equivalent to proving that supported family.

**Required correction.** The V3 adapter must fail closed unless the inspected Run actually
consumed a promoted applicable State: at minimum non-base State version, non-empty
`bound_entries`, non-null recomputable promotion lineage, and a runtime path consistent
with the bound State. Replace the positive fixture with a deterministic/Faux promoted and
actually bound State Run. Add an explicit negative for initialized/unbound version 0.

### G1-MAIN-P1-002 — V2 Candidate Path IDs are persisted as Run IDs

**Fact.** V2-A has one top-level Run and two `candidate_path_id` identities. The adapter
currently writes the two Candidate Path IDs into `FrozenEvidenceV3.source_run_ids` and
writes the peer Candidate Path ID into `comparison.peer_run_id`.

**Evidence.** `workbench/src/refinement/evidence-admission-g1.ts:181-197` and
`workbench/tests/final-capstone-g1-evidence-admission.test.ts:171-179`; the V2 terminal
contains one `run_id` and Candidate records contain `candidate_path_id`.

**Contract impact.** The Final Capstone invariants require frozen, traceable Evidence and
Comparison identity. A Candidate Path must not be relabeled as a Run merely to fit the
existing schema-1 field names. Such relabeling can also make the existing
`inefficient_success` projector interpret a Recovery-path comparison as a peer-Run
comparison.

**Required correction.** Keep only actual Run identities in `source_run_ids`. Preserve the
Recovery Seed/group, both Candidate Path identities, common Verifier, hard gates and
Selection in the admission provenance. Do not populate schema-1 `comparison.peer_run_id`
with a Candidate Path ID. If schema 1 cannot truthfully represent the Recovery comparison,
omit its `comparison` field and retain the full typed/frozen identity in the admission
record; the admitted Evidence may correctly project to `no_opportunity`. Add assertions
that no Candidate Path is exposed as a Run ID.

## Independent verification

Main executed from the authoritative `g25main` Workbench with existing local dependencies:

```text
TypeScript --noEmit                                      PASS
Goal 1 focused suite                                     PASS 16/16
V3 Goal 1 regression                                     PASS 13/13
V3 Goal 2 regression                                     PASS 6/6
V3 Goal 3 regression                                     PASS 8/8
Total tests                                              PASS 43/43
```

The implementation/test file hashes match the Working Session report. No Credential,
external network, Provider/model or real-model access was used by Main.

## Scope and next control point

Return one bundled correction to the original Goal 1 Working Session. The allowed delta
remains the four Goal 1 source/test files plus the two Working Session reports and ignored
Goal 1 evidence. Existing accepted-core source remains read-only.

After correction, Main will review only these findings and the required regressions. A
Candidate commit and focused independent audit remain premature and unauthorized until
both findings close.
