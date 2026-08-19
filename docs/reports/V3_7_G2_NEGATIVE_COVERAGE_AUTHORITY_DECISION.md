# V3.7 Goal 2 Negative Coverage Authority Decision

```yaml
status: ACCEPTED_BY_USER
decision: RESUME_CORRECTION_1_WITHOUT_REGISTERED_PROFILE_EXPANSION
accepted_on: 2026-08-20
starting_candidate_commit: 584d233e31485d1bd87a7392ddc361200477ecf6
starting_candidate_tree: 3177f7303e82c0f774e4078773ed1669d65853f6
registered_follow_up_profiles: exactly_1_unchanged
registered_cases_added: 0
correction_budget_consumed_by_zero_delta_stop: false
real_access: credentials_0_network_0_provider_0_model_0
```

## Authority-order finding

Charter Section 6.7 requires both source adapters to validate independently and feed one
canonical decision table. Section 6.9 and Goal 2 Prompt Section 8 require deterministic
coverage of formal Verifier/Outcome positive, negative, missing and invalid behavior,
both normalizers, and retain/reassessment/strict rollback/no-direct-supersede. Those are
parallel coverage categories; neither document requires a registered end-to-end
cross-product for every category.

The accepted Goal 2 execution-profile Amendment freezes one immutable registered
follow-up profile. Charter Section 7.4 freezes the complete deterministic follow-up route
as PASS-to-retain and expressly allows non-registered tampered copies for negative
coverage. Therefore adding a second registered negative profile is optional scope
expansion, not a prerequisite for satisfying the original Charter contract.

## Correction 1 interpretation

Correction 1 must still repair every Main finding:

1. enforce the exact Manifest State Store scope and real promotion lineage;
2. observe and recompute the actual effective execution-profile/input identities;
3. remove source-family gating from canonical reassessment/comparison/rollback logic;
4. prove full identity-stable read-only historical reopen after registration disable;
5. cover actual formal Verifier/Outcome failure, missing and invalid boundaries without
   manufacturing artifacts.

The single V3.7 registered profile proves the positive production route through retain.
The unchanged canonical decision implementation and accepted existing negative
comparison fixtures prove reassessment and strict rollback. No caller-built canonical
value may enter persistence or rollback, and no profile/config/loader, Goal 1, Charter or
Prompt file is added to the Correction allowlist.

## Governance

The earlier zero-delta stop is resolved and does not consume a correction round or
candidate commit. Resume the original implementation owner from the unchanged initial
candidate. Goal 2 remains unaccepted, audit remains unstarted and Goal 3 remains locked.
