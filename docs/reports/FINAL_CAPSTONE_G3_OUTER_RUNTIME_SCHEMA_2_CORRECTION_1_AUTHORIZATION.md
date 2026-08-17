# Final Capstone Goal 3 Outer Runtime Schema 2 - Correction 1 Authorization

```yaml
status: authorized_bounded_correction
date: 2026-08-18
goal_id: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
amendment_id: FINAL_CAPSTONE_G3_OUTER_RUNTIME_MANIFEST_SCHEMA_2
correction_round: 1_of_1
correction_budget_after_authorization: exhausted_pending_correction_and_main_rereview
implementation_owner: top_level_session_01a01088-6def-7df3-8a4c-b7b239e4606b
implementation_worktree: C:/Users/HUAWEI/.codex/worktrees/d19a/project2
control_baseline_commit: eed86bb99b66201c9f1fd84f4081366cc8960c53
control_baseline_tree: 48608c2e9cd05cdbd29b9999886b4fce0ad72d9a
candidate_frozen: false
audit_started: false
real_acceptance_run_started: false
real_acceptance_run_consumed: false
```

## Main disposition

`Fact`: Main reviewed every changed source/test/report path returned by the fresh schema-2
implementation Session and independently reproduced literal strict TypeScript plus the
reported focused suite: `18/18` passed.

`Fact`: the additive types correctly distinguish one outer Run attempt from plural inner
Provider requests, and the component Faux test records two ordered observations with zero
real access. Schema-1 execution/inspection regressions in the focused set remain green.

`Conclusion`: the returned delta is not yet acceptable. It resolves the representation
problem but does not implement or prove the Host-owned, real-capable, independently
recomputed Final Capstone closure required by the formal Amendment. The following findings
are one bundled projection/lineage authority-and-integrity class. They consume the new
Amendment's sole correction round and must be corrected together.

## Finding set

### FC-G3-S2-MAIN-P1-001 - carrier authority remains caller-composed and incomplete

`Fact`: `executeFinalCapstoneV36FauxCarrier` is explicitly a test-only Faux function. It
accepts caller-provided task prompt, system prompt, task policy, command executor, budget
profile, authority digest, Provider profile and preconstructed inner service. There is no
production-capable Host entry point for the later frozen DeepSeek carrier.

`Fact`: `freezeGoal3RunV3Schema2` accepts an already materialized `innerManifest`,
observation object and inner refs from the caller. It does not itself reopen and accept the
complete frozen Final Capstone task/profile/SessionPin/interactive-authority/runtime/
Workspace/command/capability chain before freezing the outer runtime.

`Fact`: `inspectGoal3RunSchema2V3` reopens the persistent Session using identities read from
the outer runtime, but it proves only that those caller-recorded identities are internally
consistent with Session metadata and the inner Manifest. It does not bind the Session pin
to the complete frozen State binding, Project Profile, interactive authority, provider
policy, budget, Docker and capability identities required by the Contract.

`Fact`: `ProviderObservationArtifactV3Schema2` omits `provider_kind`. The outer runtime
projects Provider kind/profile from Case Authority instead of deriving the complete profile
from Host observation. The schema-2 Inspector also lacks the binding accounting rules:

- Faux must have credential/network/external Provider/real-model/cost counters all zero;
- real DeepSeek credential reads must be at most the frozen allowance and network/external
  Provider/real-model counters must equal exact inspected dispatches; and
- Provider requests, tokens, Tool calls, cost and wall-time relevant authority must remain
  within the exact frozen budget/profile.

`Fact`: the current schema-2 run path does not require
`frozenFinalCapstoneG3TaskSpec` as the unique Host task authority before execution/freeze.
The component test uses arbitrary prompt/pin/authority/task-policy values and never proves
that a complete outer carrier rejects them.

`Required correction`:

1. Add one canonical Host-owned, future-real-capable Final Capstone carrier/orchestrator
   inside the existing allowlist. The zero-call tests may inject Faux transport, but the
   production path must support the already frozen real Provider route without a separate
   schema or test-only implementation becoming the only implementation.
2. Derive the exact TaskSpec, instruction/prompt, command policy, State binding, Project
   Profile, SessionPin, interactive authority, Provider policy/profile, budget, Docker and
   capability identities from frozen Host inputs. Caller values may identify paths/ports
   but may not assert authoritative facts.
3. Before outer freeze, reopen and validate the inner artifacts and Host observation rather
   than trusting caller-supplied objects. Preserve one inner Run, one outer Run and the
   ordinary V3.6 unverified/null/false semantics.
4. Add `provider_kind` to the observation authority and independently enforce complete Faux
   and real accounting/budget rules. Every outer counter/profile/prompt/payload fact must be
   derived without substitution.
5. Fail closed on unsafe/escaping/reparse/hardlinked authority-root refs, including State,
   Goal 1 admission, Goal 2 validation and inner Runtime/Workspace roots after coherent
   registry or outer rehashing.

### FC-G3-S2-MAIN-P1-002 - final lineage does not bind exact artifact refs and hashes

`Fact`: `FinalCapstoneG3Lineage` records a hash only for the outer Manifest. Goal 1
admission, Goal 2 validation, promotion Decision, ChangeSet, Handoff and assessment refs do
not each carry their exact file hash.

`Fact`: `inspectFinalCapstoneG3` inspects artifacts supplied separately through options but
does not require every lineage ref to equal the exact inspected artifact path. In
particular, `goal1_admission_ref`, `promotion_decision_ref`, `change_set_ref` and
`assessment_ref` are not used to open the corresponding authoritative object; several are
checked only through a matching digest from a different path. A coherently rehashed lineage
can therefore detach named refs from the carrier inspected through options.

`Fact`: `freezeFinalCapstoneG3Lineage` accepts the Goal 2 validation path but does not reopen
that path when deriving its validation digest. It derives the value from the promotion
Decision instead. The final Inspector also does not require the complete exact-once inner
Run/Handoff/Verifier/admission/assessment inventories promised by the Contract.

`Required correction`:

1. Record exact project-relative ref plus ordinary-file SHA-256 for every final lineage
   member: outer runtime/Manifest/observation, inner Manifest/authority, Goal 1 admission,
   Goal 2 validation, promotion Decision, Verifier, ChangeSet, Handoff and assessment.
2. During freeze and inspection, require each ref to equal the exact artifact named by the
   canonical carrier/options, reopen that exact file, recompute its content digest and
   compare all IDs/results/counters.
3. Use path-safe ordinary singly-linked resolution and exact directory inventories. Reject
   detached but same-digest refs, extra/missing/duplicate artifacts, cross-Session/Run
   substitution and coherent outer rehashing.

### FC-G3-S2-MAIN-P1-003 - required end-to-end and negative proof is absent

`Fact`: `final-capstone-g3-closed-loop.test.ts` does not call
`freezeGoal3RunV3Schema2`, the schema-2 outer Inspector on a complete carrier,
`executeFinalCapstoneG3Feedback`, `freezeFinalCapstoneG3Lineage`, or
`inspectFinalCapstoneG3`. It does not produce either legal `retain` or
`needs_reassessment` closed loop.

`Fact`: no changed test calls `freezeAdmissionRegistryV3Schema2` or
`inspectPromotionAdmissionAuthorityV3Schema2`. The returned `v3g3-admission.test.ts` and
`v3g3-selective-reuse.test.ts` are unchanged schema-1 tests, so the report's schema-2
promotion-admission authority claims have no executed proof.

`Fact`: the named `coherently rehashed request substitution` subtest changes the payload
hash but also supplies a different expected outer Run ID. It can pass solely because the
outer ID is detached; it does not prove rejection of the coherently rehashed payload
substitution under otherwise correct identities.

`Required correction`:

1. Build complete deterministic/Faux end-to-end carriers through the canonical production
   path, outer freeze/inspection, schema-2 promotion-admission authority, Goal 1 follow-up,
   Goal 2 assessment, ChangeSet/discard Handoff, final lineage freeze and final Inspector.
2. Prove both legal terminal assessments, each with exact one inner Run, one outer Run, one
   Verifier, one Handoff, one admission and one assessment, and no State/pointer/Source
   mutation.
3. Add direct schema-2 registry positive/negative proof, including schema-1 byte/behavior
   compatibility, unauthorized/swapped Goal 1 authority, wrong Goal 2 authority,
   non-promote/exact promotion mismatch, inventory/path/link/hardlink and cross-entry
   substitutions.
4. Add focused negatives for every finding above. Each test must isolate the intended
   tamper so it cannot pass because of a different earlier mismatch.
5. Correct the implementation report and closeout draft to the exact tests, commands,
   access counters, platform faults and remaining limitations.

## Platform evidence

The child-process public-Pi resolution failures and Docker-unavailable cases in the initial
Gate E sweep are execution/platform faults, not source findings and do not consume another
round. The correction Session must rerun the narrowest available deterministic proof and
record any remaining platform limitation exactly. Main will reproduce the complete Gate E
before Candidate freeze.

## Boundaries and stop rule

All correction work remains inside the formal schema-2 Amendment allowlist. Credential
reads, environment enumeration, network, external Provider/model calls, real-model calls,
Pi changes, dependency installation, Source Apply, State/pointer mutation, staging, commit,
Candidate, audit and real execution remain forbidden.

This correction exhausts the Amendment budget at `1/1`. If any part cannot be corrected
inside the allowlist, schema 1 cannot remain exact, the same projection/lineage authority
class remains after correction, or the corrected delta cannot satisfy Main re-review,
return `DECISION_REQUIRED`. Do not split or defer a listed item into another source round.

