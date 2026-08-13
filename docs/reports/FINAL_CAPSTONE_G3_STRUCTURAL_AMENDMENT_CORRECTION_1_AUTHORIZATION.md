# Final Capstone Goal 3 Structural Amendment — Correction 1 Authorization

```yaml
status: authorized_bounded_correction
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
amendment_id: FINAL_CAPSTONE_G3_PROMOTION_ADMISSION_PER_ENTRY_SOURCE_AUTHORITY
correction_round: 1_of_1
correction_budget_after_authorization: exhausted_pending_correction_and_rereview
implementation_owner: top_level_session_019ff9ef-76c4-7da0-bf11-f6ef3b53ea86
real_acceptance_run_started: false
real_acceptance_run_consumed: false
real_access_authorized: false
```

## Main disposition

`Fact`: Main reviewed the complete ten-path Structural Amendment delta returned by the
replacement implementation Session. The schema-2 promotion-admission repair is directionally
sound, but the new Final Capstone carrier is not yet acceptable because its inner-V3.6 to
outer-V3 evidence projection and final inspection are not independently recomputable.

This document is one concrete Main finding set and consumes the Amendment's sole bounded
correction round. The findings below are one authority/integrity class and must be corrected
together. They must not be split into later micro-findings.

## Finding set

### FC-G3-SA-MAIN-P1-001 — caller-asserted inner-to-outer projection authority

`Fact`: `createFinalCapstoneGoal3ExecutionPortV36` accepts
`observed_system_prompt_sha256`, `observed_user_message_sha256`,
`model_payload_sha256`, and `provider_profile` from the caller. It checks the system value
against the frozen V3 binding and checks only the shape of the other two hashes. It does not
derive those values from a Host-captured provider observation. It also does not bind the
claimed Provider/model profile to the V3.6 Session pin/authority or the frozen Final Capstone
profile identities.

`Fact`: the adapter manually parses the V3.6 Session, authority, Runtime Manifest and terminal
evidence, but does not perform their full accepted exact-key/digest/identity validation. The
positive deterministic test intentionally supplies an arbitrary `captured-model-payload`
hash, demonstrating that a caller-selected but well-shaped observation can pass.

`Impact`: a self-consistent caller can label a different or incompletely inspected V3.6
carrier as the frozen Provider/model treatment and produce an outer V3 runtime record. This
violates the original Goal 3 Contract's requirement that the adapter project only recorded
V3.6 facts and never fabricate prompt observation, tool identity, usage, cost or
terminalization.

`Required correction`:

- make provider-observed prompt/payload evidence Host-captured, write-once and bound to the
  exact inner Session/Run; remove caller-selected observation facts from the authoritative
  projection path;
- validate/recompute the complete V3.6 pin, authority, Runtime Manifest and terminal evidence
  and bind them to the frozen Final Capstone Project Profile, Docker backend,
  Provider/model-policy, task prompt, active State and capability identities;
- derive every outer runtime counter, Provider/model identity, prompt/payload identity, tool
  count, usage and cost from those inspected records without value substitution; and
- preserve single-use execution and the ordinary V3.6 `unverified`/null/false semantics.

### FC-G3-SA-MAIN-P1-002 — final lineage inspection does not recompute the projection

`Fact`: `inspectFinalCapstoneG3` verifies that each lineage artifact ref points to some
in-project ordinary file with its recorded hash, but it does not require each ref/hash to
equal the exact artifact path named by the closeout options. It does not recompute the outer
runtime projection from the inner V3.6 records, and it does not compare
`lineage.real_access` to the inspected outer Manifest/runtime counters.

`Impact`: a coherently rehashed lineage can detach its named artifacts or real-access summary
from the actual carrier while the separate inner and outer inspections still pass.

`Required correction`:

- require every lineage ref/hash to be the exact expected carrier artifact, not merely an
  arbitrary valid in-project file;
- independently recompute the inner-to-outer projection during final inspection and compare
  the complete persisted outer runtime identity;
- recompute the lineage access counters and all derivable IDs/results/counts from inspected
  artifacts; and
- fail closed on any detached ref, counter, profile, prompt/payload, Session/Run or
  ChangeSet/Handoff substitution.

### FC-G3-SA-MAIN-P2-003 — focused negative proof is incomplete

`Fact`: the current tests cover schema-1 literal refs, unknown versions, one relabeling,
cross-entry frozen-source substitution, path escape, an extra file, hardlink/junction,
conflicting write and a non-promotion Decision. They do not prove rejection of the concrete
projection and lineage defects above, and the implementation report overstates exact
promotion-mismatch coverage.

`Required correction`: add focused negative tests for caller-forged observation/profile
labels, tampered V3.6 pin/authority/evidence, inner/outer counter or payload mismatch,
detached lineage refs and real-access summaries, plus the Amendment's remaining material
schema/authority substitutions (hybrid version shapes, missing/duplicate inventory,
unauthorized or swapped Goal 1 authority, wrong Goal 2 authority and exact promotion
Decision mismatch). Correct report claims to the exact tests actually run.

## Boundaries and stop rule

The correction remains limited to the formal Structural Amendment allowlist. It has zero
Credential-read, network, external Provider/model, real-model, Pi-edit, Source-Apply, State
mutation and Git-commit authority. It may create only ignored deterministic evidence under
`.runs/final-capstone/g3/`.

The original Session must run the complete required regression set and return one correction
report for one Main re-review. If this authority/integrity class recurs, the fix cannot stay
inside the allowlist, or the corrected delta remains unacceptable, Main must return
`DECISION_REQUIRED`. The unique real acceptance Run remains unstarted and unconsumed.
