# V3.7 Goal 2 Audit Remediation Amendment

~~~yaml
status: ACCEPTED_BY_USER
accepted_on: 2026-08-20
applies_to: V3_7_G2_RUNTIME_EFFECTIVE_STATE_FOLLOW_UP_BRIDGE
trigger: FAIL_V3_7_G2_FOCUSED_AUDIT_V37_G2_AUDIT_P1_001
failed_audit_candidate_commit: 3adb5654a24633375d3171f115e8b73d86c023ed
failed_audit_candidate_tree: 333d265bab61ec81c0a84bbc2e24bca02253be89
ordinary_correction_budget: 2_of_2_consumed
exceptional_remediation_budget: 1_of_1_authorized
goal_2_acceptance: false
goal_3_authority: false
~~~

## Authority and purpose

The user explicitly approved this one-time amendment after Main reproduced the focused
audit finding and recommended a bounded repair. This amendment changes only the Goal 2
correction-budget stop and the historical-admission rule below. Every other V3.7 Charter,
Goal 2 profile-authority amendment and frozen Goal Contract decision remains unchanged.

This is an exceptional Audit Remediation, not ordinary Correction round 3. It permits one
new implementation candidate, one Main preliminary review and one fresh independent
read-only re-audit. If the new candidate fails this finding or exposes another P1 inside
the remediated boundary, Goal 2 closes unaccepted unless the user makes a new
project-control decision.

## Amended historical-admission contract

Preparing, dispatching or admitting a new follow-up remains bound to the current active
State and retains the existing immediate pre-request drift check. No live mutation may
use a stale or caller-selected State identity.

Historical inspection and normalization of an already accepted follow-up instead validate
the immutable identities recorded by that follow-up's binding: the bound State version,
its promotion Decision, validation evidence and candidate/staged/base lineage. The
current active pointer may later move to another valid State, including the exact prior
version through the production rollback path. Such a later pointer change must not
invalidate or rewrite the accepted follow-up's historical admission evidence.

The historical validator must locate the version by both the binding's State version ID
and active State digest, locate the promotion Decision by both its recorded ID and digest,
and prove that the Decision's `next_active` identity equals the frozen binding. It must
continue to reject missing, changed, cross-workflow or otherwise inconsistent frozen
State, Decision, validation and lineage evidence. The current State store must itself
remain structurally valid, but its active pointer is not historical binding authority.

## Scope and preserved decisions

The remediation may change only the registered follow-up historical-lineage helper, the
Goal 2 focused deterministic test and the two Goal 2 implementation reports.

It must not add a registered execution profile; change the accepted profile, Manifest,
Registry, Envelope, Task, Source, Verifier, State publication, Store/CAS, promotion,
rollback, provider/tool/command/budget/stop semantics; edit old V2/G1/V3/G2 modules or
Pi; or grant any real-access authority. Current-active checks for prepare, execute,
submit and new admission must not be weakened.

Disabled registration continues to block new Host follow-up actions. It may only permit
read-only inspection and normalization of already accepted historical follow-ups, with
their accepted artifact and binding identities unchanged.

## Required gate

The new candidate must pass:

- accepted follow-up creation and admission, followed by production rollback to the exact
  immediate parent State, followed by identity-stable historical admission inspection and
  normalization;
- the same historical reopen after disabling the registration, while new prepare,
  execute, submit and admit actions remain blocked and accepted artifacts remain intact;
- frozen bound State/Decision/validation/lineage tamper rejection even when the current
  active pointer has moved elsewhere;
- all original Goal 2 tests, Prompt regressions and the strict environment-equivalent
  TypeScript check;
- Main preliminary review and a fresh independent read-only affected-finding re-audit.

Goal 3 remains locked until re-audit PASS and Main formally accepts Goal 2.
