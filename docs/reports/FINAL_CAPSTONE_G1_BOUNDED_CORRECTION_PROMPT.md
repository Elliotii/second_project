# Final Capstone Goal 1 — Bounded Correction Prompt

Resume the original Goal 1 Working Session. This is one bounded correction package from
Final Capstone Main Review. Goal 1 remains active but unaccepted. Do not enter Goal 2.

Read first:

1. `docs/reports/FINAL_CAPSTONE_G1_MAIN_REVIEW.md`;
2. the accepted Final Capstone Goal 1 Contract;
3. your existing Implementation Report and Closeout Draft; and
4. the four Goal 1 source/test files in your current delta.

## Correction 1 — require a real promoted bound-State follow-up

Current version-0 fixture is unbound (`bound_entries: []`, `lineage: null`) and cannot be
accepted as `v3g3_bound_state_followup`.

- Make the adapter reject an initialized/unbound base-State Run.
- Require a non-base State version, at least one actually applicable `bound_entry`, non-null
  recomputable promotion lineage, and a runtime path consistent with the bound State.
- Replace the positive fixture with a deterministic/Faux V3 flow that stages, validates,
  promotes and actually binds a State before the follow-up Run.
- Assert the admitted record preserves exact State version/digest/decision, binding digest,
  non-empty entries, promotion lineage and Case Authority.
- Add an explicit negative proving version 0 / empty binding / null lineage fails closed.

Reuse existing V3 helpers and tests. Do not modify accepted V3 source.

## Correction 2 — preserve V2 Run and Candidate Path identities truthfully

- `source_run_ids` may contain only actual V2 Run IDs.
- Do not write a `candidate_path_id` into `comparison.peer_run_id`.
- Preserve Recovery Seed/group, both Candidate Path identities, common Verifier, hard gates
  and Selection in the frozen admission provenance.
- If `FrozenEvidenceV3` schema 1 cannot truthfully encode Candidate Paths as peer Runs,
  omit its `comparison` field. `no_opportunity` is valid and preferred over false identity.
- Add tests asserting the single real Run identity and separate Candidate Path identities.

Do not revise the V3 schema or projector.

## Boundaries

Only modify the existing four Goal 1 source/test files and the two Working Session reports.
Ignored `.runs/final-capstone/g1/` evidence may be regenerated. Do not change accepted-core
source, control documents, historical evidence, `CURRENT_STATE.md`, Pi or Git state.

Credential, external network, Provider/model and real-model access remain zero. Do not
install dependencies, stage, commit, accept Goal 1, dispatch an audit or enter Goal 2.

## Verification and handoff

Run the original Contract matrix:

```powershell
node 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.json --noEmit
node --test tests/final-capstone-g1-evidence-admission.test.ts
node --test tests/v3g1-evidence-to-candidate.test.ts
node --test tests/v3g2-validate-promote-reject-rollback.test.ts
node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts
```

Update the Implementation Report and Closeout Draft truthfully. Return:

- exact correction delta;
- tests and exit codes;
- corrected V2 and V3 admission identities/digests;
- V3 unbound negative result;
- zero-access counters; and
- revised PASS/non-PASS recommendation.

Then stop for Main re-review.
