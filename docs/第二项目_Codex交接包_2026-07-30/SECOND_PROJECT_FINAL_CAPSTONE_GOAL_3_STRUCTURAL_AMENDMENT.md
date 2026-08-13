# Second Project Final Capstone Goal 3 Structural Amendment

```yaml
status: accepted_binding_formal_amendment
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
amendment_id: FINAL_CAPSTONE_G3_PROMOTION_ADMISSION_PER_ENTRY_SOURCE_AUTHORITY
user_decision: AUTHORIZE_G3_STRUCTURAL_AMENDMENT
user_decision_sha256: fd11740e27845bc70f223f50c60cb1f9b472a692d98131b0bd61bbcf979adca9
pre_amendment_main_commit: 000e7b4f95258b33fab76ea3864f2e93881f4c73
pre_amendment_main_tree: 33d83cf9430b658428a667bd7cebdc3f1e9f01b2
amendment_freeze_commit: resulting_commit_of_this_revision
existing_goal_3_correction_budget: 2_of_2_exhausted_unchanged
structural_amendment_correction_budget: 1
schema_decision: explicit_registry_schema_2_with_strict_schema_1_compatibility_reader
real_acceptance_run_started: false
real_acceptance_run_consumed: false
real_acceptance_runs_max: 1
implementation_owner: fresh_dedicated_top_level_zero_call_structural_amendment_session
```

## 1. Authority and objective

The User accepts the finding in
`docs/reports/FINAL_CAPSTONE_G3_DECISION_REQUIRED_MAIN_REVIEW.md` and the bounded direction
in `docs/reports/FINAL_CAPSTONE_G3_STRUCTURAL_AMENDMENT_DECISION_PROPOSAL.md`, subject to
the additional schema-semantics and Host-owned-association constraints frozen here.

This is a new, narrow structural Amendment. It is not Goal 3 correction round 3 and does
not reset or reinterpret Goal 3's exhausted `2/2` correction budget.

The sole structural objective is:

```text
one admission-registry entry
  -> one authorized Candidate/State source identity
  -> independently reopenable and Inspector-verifiable promotion lineage
```

The Amendment removes the accepted registry implementation's global single-source-pair
cardinality restriction so that one registry can truthfully reopen both the legacy
fixed-fixture promotion and the distinct Final Capstone promotion. It does not authorize a
second hard-coded pair, copied State/Decision artifacts, direct State or pointer mutation,
a fourth Goal 1 family, or a generic artifact/source registry.

All unchanged sections of the original Goal 3 Contract, Final Capstone Charter, capability
Amendment and correction-budget Amendment remain binding.

## 2. Formal schema-semantics decision

### Facts

The accepted schema-1 contract is not merely a generic per-entry shape:

- `AdmissionRegistryEntryV3.source_candidate_ref` is the literal type
  `fixtures/v3/goal1-real-candidate.json`;
- `AdmissionRegistryEntryV3.source_state_ref` is the literal type
  `fixtures/v3/goal1-real-staged-state.json`;
- `freezeAdmissionRegistryV3`, `loadAdmissionRegistryV3` and
  `inspectPromotionAdmissionLineageV3` enforce those exact literals; and
- the accepted V3 Goal 3 evidence and Closeout describe the registry as bound to the exact
  tracked Goal 1 Candidate/State fixture identities.

### Decision

Supporting non-legacy per-entry sources would broaden the accepted semantics of schema 1.
Therefore schema 1 must not be silently reinterpreted. The implementation must introduce
an explicit registry schema 2 and a strict compatibility reader.

The schema rules are:

1. Existing schema-1 types, exact keys, fixed source refs, digest domain and validation
   behavior remain unchanged.
2. Existing schema-1 registry bytes must reopen and validate without mutation.
3. Schema 1 must continue rejecting any non-fixed source ref even if all outer hashes are
   coherently recomputed.
4. Schema 2 alone may represent more than one authorized source pair.
5. The reader must dispatch strictly on exact integer `schema_version`; unknown versions,
   hybrid key sets, schema downgrade/upgrade relabeling and cross-version entry shapes fail
   closed.
6. The existing public schema-1 freeze path remains behaviorally compatible. The new
   schema-2 freeze path must be explicit; an ambiguous overload or implicit upgrade is
   forbidden.

## 3. Schema-2 authority model

Schema 2 is a narrow discriminated registry, not a generic path registry. Each entry must
bind its complete entry body inside the registry digest and use exactly one of two Host
authority kinds.

### 3.1 Legacy entry

`legacy_fixed_goal1_fixture_v1` preserves the existing fixed fixture semantics. Its source
refs must remain the two accepted literal fixture paths and their exact file hashes. It may
be imported into a schema-2 registry only after the existing schema-1 admission inspection
passes. No alternative legacy pair is authorized.

### 3.2 Final Capstone entry

`final_capstone_g1_g2_promotion_v1` is the only authorized non-legacy kind. Its entry must
bind, with exact refs, hashes and content identities:

- the source `RefinementCandidateV3` and matching source `StagedHarnessStateV3`;
- the Candidate admission created by existing `admitCandidateV3` authority;
- the exact fixed-negative Goal 1 Host registration and Inspector-valid admission;
- the Goal 2 regression selection and validation Run;
- the resulting accepted V3 promotion decision supplied by the already inspected State
  history; and
- the admitted Candidate and staged-State digests connecting those artifacts.

No caller-selected label, ref, path, file, hash, admission identity, applicability,
promotion result or active-pointer claim is authority by itself.

## 4. Host-owned derivation and freeze algorithm

The new explicit schema-2 freeze path must derive authority by reopening accepted artifacts
under one canonical project root. It must perform all of these checks before writing an
entry:

1. Resolve every input beneath the canonical project root without symlink, junction,
   reparse-point or path-escape traversal. Every source and authority file must be an
   ordinary singly linked file.
2. Reopen the fixed-negative Goal 1 registration and admission through
   `inspectTrustedEvidenceAdmissionG1`; require the accepted fixed Host approval, exact
   project identity, `typescript-maintenance/verifier-failure`, a non-empty projected
   opportunity and the exact registration identity frozen by the original Goal 3 Contract.
3. Reconstruct the source Candidate's proposal projection and verify it through the
   existing V3 producer against that exact Goal 1 projected opportunity. Its evidence,
   opportunity, diagnosis, lesson, applicability, base and complete Candidate digest must
   match. Merely sharing an evidence digest is insufficient.
4. Recompute the source Candidate/State semantic lineage and the existing
   `CandidateAdmissionV3` derivation for the promotion decision's exact `prior_active`.
5. Reopen the Goal 2 Run through `inspectRegressionGatedValidationG2`; require the exact
   Goal 1 admission digest and trusted applicability, the exact Host-selected regression
   pack, the admitted staged-State digest, an integrity-valid/fair validation and a
   recomputed `promote` result.
6. Match the already inspected V3 promotion decision exactly to the admitted Candidate,
   admitted staged State, Goal 2 validation ID/digest/ref, prior active identity and
   promoted result. Registry code must not create, copy or mutate that decision or the
   active pointer.
7. Only after all checks pass, copy the source Candidate/State bytes into a registry-owned
   ordinary write-once source directory, then hash the frozen copies. A conflicting prior
   write fails closed. The Agent-editable Workspace must not overlap this directory.
8. Freeze the inspected admission and all authority refs/digests into the schema-2 entry.
   Sort entries by admitted Candidate digest and reject duplicates.

Inspection is deliberately two-tiered so the accepted synchronous V3 binding interface and
`workbench/src/state/binding-v3.ts` remain unchanged:

1. The existing synchronous `inspectPromotionAdmissionLineageV3` dispatches strictly by
   registry schema, selects the entry by the promotion decision's Candidate digest first,
   resolves only that entry's frozen sources and authority refs, verifies their recorded
   hashes, reconstructs the Candidate/State/admission and matches the exact promotion
   decision. For schema 1 it retains the complete accepted fixed-pair behavior.
2. A new explicit asynchronous schema-2 authority Inspector in `admission-v3.ts` reruns the
   Goal 1 and Goal 2 Inspectors and verifies the complete Host chain after process reopen.
   `inspect-final-capstone-g3.ts` must require both the existing outer V3 Inspector and this
   complete schema-2 authority Inspector. Final Capstone evidence, new Goal 1 admission and
   Goal 2 assessment may not be produced unless that combined inspection passes.

The complete authority proof refs and hashes are part of each schema-2 entry and registry
digest, so the synchronous binding lineage cannot be detached from the exact Host proof
later validated by the asynchronous Inspector. No edit to V3 binding source is authorized.

An internally self-consistent Candidate/State pair with matching hashes remains
unauthorized unless this complete Host chain succeeds.

## 5. Bounded implementation surface

The dedicated implementation Session may edit or create only:

- `workbench/src/contracts/v3g3-types.ts`;
- `workbench/src/refinement/admission-v3.ts`;
- `workbench/tests/v3g3-admission.test.ts`;
- `workbench/tests/v3g3-selective-reuse.test.ts`;
- `workbench/src/contracts/final-capstone-g3-types.ts`;
- `workbench/src/pi/final-capstone-g3-v36-port.ts`;
- `workbench/src/final-capstone-g3.ts`;
- `workbench/src/inspect-final-capstone-g3.ts`;
- `workbench/tests/final-capstone-g3-closed-loop.test.ts`;
- ignored deterministic evidence only under `.runs/final-capstone/g3/`;
- `docs/reports/FINAL_CAPSTONE_G3_STRUCTURAL_AMENDMENT_IMPLEMENTATION_REPORT.md`; and
- `docs/reports/FINAL_CAPSTONE_G3_CLOSEOUT_DRAFT.md`.

It may import and call existing public Goal 1, Goal 2, V3 and V3.6 symbols but may not edit
those accepted modules. The stopped Session's partial files are advisory, unaccepted
evidence only; the fresh Session must independently derive every adopted line against this
Amendment and may not copy them as authority.

No edits are authorized to Goal 1/2 source, V3 State store/binding, V3.6 source, Pi, task or
Verifier fixtures, profiles, Provider, budget, Docker, Source Apply, Charter, original Goal
Contracts, accepted Closeouts, `CURRENT_STATE.md`, `AGENTS.md`, references or general
product surfaces.

If the required implementation cannot stay inside this list, stop and return
`DECISION_REQUIRED` without expanding the list.

## 6. Required deterministic proof

All implementation, test, Main integration and pre-execution audit work has authority for
exactly zero Credential reads, zero network calls, zero external Provider/model calls and
zero real-model calls.

The implementation must add focused proof that:

- one schema-2 registry independently reopens the legacy fixed-pair promotion and the
  distinct Final Capstone promotion;
- each entry recomputes only from its own frozen source pair and complete Host authority;
- schema-1 legacy registries reopen byte-for-byte without mutation and retain their exact
  rejection behavior;
- unknown versions, hybrid schema, downgrade/upgrade relabeling and non-fixed schema-1 refs
  fail closed;
- arbitrary self-consistent sources, unauthorized or swapped Goal 1 admissions, wrong Goal
  2 selection/validation, non-promote results and promotion-decision mismatch fail closed;
- cross-entry source/admission/authority substitution fails even after coherent outer
  rehashing;
- missing, duplicate or extra entry/source/authority files, conflicting write-once bytes,
  path escape, symlink/junction/reparse points and hardlinks fail closed;
- no registry action creates or mutates State, Decision, pointer, source fixture or Agent
  Workspace; and
- the complete deterministic Goal 3 closed loop proves both legal terminal assessments,
  exactly once per simulated carrier, with no real access.

The exact minimum verification commands remain those in section 7 Gate E of the original
Goal 3 Contract, with the new Final Capstone test present. Literal strict TypeScript and all
named Goal 1, Goal 2, V3 and relevant V3.6 regressions must pass. The Session must record
exact commands, exits and counts; Main must independently repeat the required set.

## 7. Session governance and gates

The execution-session owner is one fresh dedicated top-level zero-call Structural Amendment
implementation Session created from the Main Control Baseline that contains this frozen
Amendment. It owns only the bounded source/test/report delta and raw deterministic evidence.
It must not stage, commit, edit control state, accept Goal 3 or access real services.

The original stopped Goal 3 implementation Session remains stopped. It is not the owner of
this Amendment and must not be resumed.

After the dedicated Session returns:

1. Main independently reviews every changed line and authority identity and reproduces all
   required deterministic verification.
2. Main may return at most one concrete finding set for one bounded correction in the same
   dedicated Session.
3. One correction round means one Main finding set, one bounded correction, required
   tests/regressions and one Main re-review. Finding splitting is forbidden.
4. If the same authority/integrity class recurs after correction, the frozen scope must be
   exceeded, or the delta remains unacceptable after the one round, return
   `DECISION_REQUIRED`.
5. Only an accepted Main review may freeze the Candidate commit.
6. A fresh focused independent audit of that exact Candidate is mandatory. It must
   specifically test unauthorized source admission, cross-entry substitution, schema-1
   compatibility and schema-version confusion. It may not repair source or access real
   services.
7. Any audit correction consumes the same single Structural Amendment correction budget.
   After an allowed correction, re-audit the affected findings and required regressions.

## 8. Structural Amendment correction budget

```yaml
rounds_max: 1
rounds_used_at_freeze: 0
applies_only_to: newly_authorized_structural_delta
existing_goal_3_budget: remains_exhausted_2_of_2
same_authority_or_integrity_class_recurrence: DECISION_REQUIRED
micro_finding_splitting: forbidden
platform_safety_usage_sandbox_tool_interruptions_count: false
```

This new budget does not authorize unrelated Goal 3 repair or reopen accepted Goal 1/2/V3
or V3.6 behavior.

## 9. Unique real acceptance boundary

The unique Goal 3 real acceptance Run remains unconsumed. It may not start until the formal
Amendment is frozen, bounded implementation is complete, deterministic verification and
Main review pass, Candidate is frozen, and the mandatory focused audit passes.

After those gates, the original Goal 3 real protocol remains exact:

- one frozen `final-capstone-g3-v1-parse-duration` acceptance task;
- one independent frozen Verifier;
- at most one real Provider dispatch path;
- no rerun or same-Run retry/continuation;
- no fallback, replacement, task swap, result hunting or manufactured failure; and
- the first terminal real result remains authoritative, including `retain`,
  `needs_reassessment`, integrity stop or execution fault.

Normal stage transitions after this Amendment require no additional User authorization.
Main must return to the User only for `DECISION_REQUIRED`, actual platform execution block,
exhausted Amendment correction budget without acceptance, scope escape, or completed
`FINAL_CAPSTONE_CLOSEOUT`.

## 10. Completion

This Amendment is complete only when its bounded structural behavior is accepted as part of
Goal 3 or truthfully stopped under its decision rules. It does not itself accept Goal 3,
consume the real Run, complete the Final Capstone or authorize further core development.
