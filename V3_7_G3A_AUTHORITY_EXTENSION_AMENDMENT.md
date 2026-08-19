# V3.7 Goal 3A Optimized Versioned Authority Extension Amendment

```yaml
status: ACCEPTED_BY_USER
accepted_on: 2026-08-20
applies_to: V3_7_G3A_REUSABLE_PRODUCT_CAPABILITY
authority: V3_7_CHARTER.md
accepted_proposal: docs/reports/V3_7_G3A_PLANNING_OPTIMIZATION_PROPOSAL.md
user_direction: plan_and_execute_the_first_successor_long_running_goal
goal_1_status: closed_accepted
goal_2_status: closed_accepted
goal_3a_implementation_started: false
goal_3a_ordinary_correction_budget: 0_of_2_consumed
goal_3b_authority: false
real_access: false
```

## 1. Authority and purpose

The user authorized the recommended optimized Goal 3A extension and the first successor
long-running Goal. This Amendment is subordinate to `V3_7_CHARTER.md`. It changes only
the Goal 3A implementation authority needed to replace the unworkable singleton-loader
assumption with a bounded, versioned, Schema-1 multi-Case product baseline.

The accepted Goal 1/2 outcomes, artifact schemas, Evidence families, Candidate type,
State decisions, G2 Assessment/rollback semantics, exact Goal 3A Case IDs, Goal 3A Exit
Criteria and Goal 3B one-real-Case boundary remain unchanged.

## 2. Preserved accepted v1 baseline

The accepted singleton Goal 1/2 registry, Manifest, Envelope, follow-up profile and v1
bridge implementation remain the sole authority for historical `v37-g1-det-recovery`
workflows. Goal 3A must not edit, migrate, substitute or reinterpret them.

The Goal 3A Implementation Prompt freezes the exact SHA-256 inventory. Historical v1
reopen continues through the original v1 loader and inspectors. There is no compatibility
reader, fingerprint substitution or conversion of historical artifacts.

## 3. New bounded Schema-1 product baseline

Goal 3A may add one new source-controlled Host configuration baseline with:

- schema version 1 and a new loader contract identity;
- exactly two entries in canonical Case-ID order at Goal 3A Candidate freeze:
  `v37-det-recovery-promote-retain` and `v37-det-primary-pass`;
- one exact Manifest, append-only registration-envelope chain and exact effective
  follow-up execution profile per entry;
- exact-key validation, canonical bytes and content-addressed locations/digests;
- a validated global index plus a per-entry trust root that depends only on the stable
  loader contract and the selected entry's authority material;
- no runtime enrollment, directory scan, caller location/digest, browser authority,
  Case/profile editor or acceptance based on narrative approval fields.

Within this new baseline, a registry entry may add exact
`follow_up_execution_profile_location` and
`follow_up_execution_profile_digest` fields. These are Host-frozen authority inputs and
form part of the selected entry's trust root. This is a bounded Schema-1 configuration
extension, not Runtime/Registry Schema 2.

## 4. Stable bounded append for Goal 3B

The loader and product service must permit one later source-controlled append without an
implementation-source change. Goal 3B may append exactly one Main/user-frozen real Case
entry, producing a maximum V3.7 inventory of three Cases.

An append may occur only in the separate Goal 3B freeze commit. Existing entries cannot
be removed, reordered, replaced or version-swapped, and their per-entry trust roots must
remain identical. The append grants no Credential, network, Provider/model, Docker
product or execution authority.

## 5. Versioned service boundary

Goal 3A may add new versioned product adapters for registration, recovery admission,
Candidate creation, Regression/State publication, bound follow-up admission,
normalization and workflow orchestration. They must consume only the new Host-loaded
authority and preserve the accepted Goal 1/2 schemas and semantic decisions.

The implementation may make one additive, type-safe integration change to
`state-feedback-g2.ts` only if required to accept the new Host-recomputed canonical
follow-up normalizer. The browser or caller must never supply a canonical assessment
input. Existing v1 and legacy normalizers, decision results, persistence schemas,
rollback rules and tests must remain unchanged.

No new Evidence family, Candidate type, State decision, Assessment result, rollback rule,
Runtime schema, compatibility projection or test-only success path is authorized.

## 6. Product and workflow authority

Goal 3A may add only the Charter-defined thin workflow journal, re-derived Read Model,
loopback API/action handlers and existing bilingual UI extension. Browser requests carry
only opaque Case/workflow/action identities and the two exact confirmation actions.

Every transition reloads Host authority and formal prerequisites. The journal is
append-only and digest-chained; cached stage/navigation data is non-authoritative. The
current stage and available actions are re-derived on every reopen.

The two deterministic Cases and the later Goal 3B real Case must use the same versioned
product application and action handlers. Faux Provider and registered deterministic
command ports are the only Goal 3A substitutions.

## 7. New-finding triage and corrections

A source or test correction is permitted only when Main records that the finding:

1. blocks a frozen Goal 3A production/demo route;
2. risks data corruption, irreversible side effects or false success;
3. invalidates a current core capability claim; or
4. is an explicit Goal 3A acceptance regression.

Other findings are recorded as `deferred_limitation`, `out_of_scope` or
`optional_improvement`. They cannot create a new product contract, state-machine state,
compatibility layer, evaluation stage, registered Case or broad regression suite.

Goal 3A retains exactly two ordinary Correction rounds. An out-of-allowlist fix, repeated
Authority/integrity class, exhausted budget or Charter Hard Stop returns to Main/user.

## 8. Candidate and focused audit

Because the new loader and product service introduce new registration/execution
Authority, Goal 3A requires one immutable Candidate and one fresh independent read-only
Focused Audit before Main acceptance. Every post-audit source/configuration change
requires re-audit of the new Candidate.

The audit is limited to the boundaries frozen in the accepted optimized proposal. It may
not implement repairs, expand product scope, start Goal 3B or perform real access.

## 9. Explicit exclusions

This Amendment does not authorize Goal 3B configuration freeze or execution, real
Provider/model calls, Credential reads, external network, Docker product execution,
dependency installation, Pi inspection/change, rejected Schema 2, arbitrary enrollment,
additional Cases, migration, production hardening or a new version.

