# V3.7 Goal 3B Follow-up Daily-24 Profile Correction Amendment

```yaml
status: ACCEPTED_BY_USER_2026_08_21
finding: G3B-HOST-BRIDGE-P1-001
authority: V3_7_CHARTER.md_sections_8_2_8_3
implementation_owner: dedicated_zero_access_configuration_correction_session
real_access: false
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
candidate_capacity: 1
```

## Decision

Goal 3B keeps a Provider-request hard maximum of **24**. Its registered real follow-up
profile must bind the already accepted V3.6 daily Runtime profile
`v36_daily_bounded_edit_v2`, whose exact tuple is observation threshold `16` and hard
maximum `24`.

The observation threshold is not a request cap. It marks the accepted early observation
boundary; request 24 remains the finite pre-dispatch hard stop. This Amendment does not
change either accepted V3.6 profile and does not create a new `24/24` Runtime contract.

## Exact implementation boundary

The dedicated correction Session may change exactly:

1. `workbench/config/v37/g3a/follow-up-execution-profiles/v37-real-recovery-promote-retain.v1.json`;
2. `workbench/config/v37/g3a/registered-cases/registry-v1.json`;
3. `workbench/tests/v37g3a-authority.test.ts`;
4. add `docs/reports/V3_7_G3B_FOLLOW_UP_DAILY_24_PROFILE_CORRECTION_REPORT.md`.

The correction must only:

- change `v36_runtime_budget_profile_id` to `v36_daily_bounded_edit_v2`;
- change `provider_requests_observation_threshold` to the accepted daily value `16`;
- preserve `provider_requests_hard_max: 24` and every other frozen budget/access/command/
  Tool/stop field;
- recompute the budget-profile, follow-up-profile and registry-index digests;
- update only directly dependent assertions;
- add a deterministic compatibility assertion against
  `assertBoundedEditBudgetProfileV36` so this exact mismatch fails during focused
  configuration verification rather than at Provider dispatch.

Manifest, registration envelope, Candidate-proposal authority, Regression authority,
Task/Source/Verifier bytes, Provider access maxima and the accepted V3.6 source/contracts
must remain byte unchanged.

## Verification and continuation

Run only the directly affected G3B configuration/authority test selection, strict
TypeScript, diff/allowlist and immutable-input checks. No broad product/version suite is
required without new concrete evidence.

The Session creates one immutable Candidate and returns it to Main. Main review and a
fresh read-only focused audit of the corrected profile/registry/Runtime compatibility are
required because this changes frozen budget Authority. Audit PASS only permits resuming
the already accepted Host execution-port bridge; it does not authorize real access.

Hard Stop without Candidate if the correction needs an existing Runtime/profile change,
new budget semantics, a path outside this allowlist, Credential/network/Provider/model
access, or any real execution.
