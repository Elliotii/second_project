# V3.7 Goal 3A Preimplementation Hard Stop

```yaml
status: DECISION_REQUIRED
recorded_on: 2026-08-20
goal: V3_7_G3A_REUSABLE_PRODUCT_CAPABILITY
implementation_started: false
source_changes: false
correction_budget_consumed: 0_of_2
blocker: accepted_singleton_G1_G2_authority_cannot_load_two_frozen_G3A_cases
recommended_decision: AUTHORIZE_VERSIONED_G3A_MULTI_CASE_AUTHORITY_EXTENSION
goal_3b_locked: true
real_access: false
```

## Stop reason

Goal 3A cannot truthfully receive an implementation Prompt from the current accepted
source without a narrow authority decision.

The Charter freezes two new deterministic Case identities:
`v37-det-recovery-promote-retain` and `v37-det-primary-pass`. The accepted Goal 1/2 Host
loader instead enforces a singleton registry and exact old Case
`v37-g1-det-recovery`:

- `host-registry-v37.ts` requires `entries.length === 1`, selects `entries[0]`, fixes the
  old Manifest/Envelope paths and validates exact old follow-up bytes;
- `workflow-registration-v37.ts` imports only that singleton loader and its baseline IDs;
- `follow-up-execution-profile-v37.ts` accepts only the old Case ID and one fixed profile;
- loader fingerprints participate in workflow trust-root and Primary Run authority
  identities.

Editing those accepted v1 files/configuration in place would change their fingerprints
and invalidate historical trust-root recomputation. Mapping a new Case ID onto old
artifacts would break Case identity and cross-Case isolation. Building a separate
prebaked success workflow would violate the Charter's same-production-path rule and Hard
Stop against demo/test-only success.

This conflict was discovered before Goal 3A source editing or Session dispatch. It is a
preimplementation structural decision, not a Goal 3A correction round.

## Preserved state

Goal 1 and Goal 2 remain closed and accepted at their recorded candidate/audit
identities. No accepted loader, registry, Manifest, profile, workflow, bridge, State or
product source was changed. Goal 3B remains locked and no Credential, network,
Provider/model or Docker product authority has been granted.

## Next action

User/Main must accept, narrow or reject the accompanying
`V3_7_G3A_AUTHORITY_EXTENSION_DECISION_PROPOSAL.md`. No Goal 3A implementation Session
may start until the decision is frozen in a Charter-subordinate amendment and an exact
implementation Prompt.
