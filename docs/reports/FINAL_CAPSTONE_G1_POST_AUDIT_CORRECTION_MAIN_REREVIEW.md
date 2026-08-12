# Final Capstone Goal 1 — Post-audit Correction Main Re-review

```yaml
status: correction_rejected_p1_remains_open
goal_id: FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
rejected_candidate_commit: 0c1c91efcbed3f0db4a3735de1996deff99f9bac
audit_finding: G1-AUDIT-P1-001
working_session_focused_tests: 18_passed_0_failed
main_combined_forgery_reproduction: accepted_incorrectly
goal_acceptance: blocked
goal_2: unauthorized
```

## Main disposition

Main does not accept the post-audit correction. The six-file delta is within the authorized
allowlist, typechecks, and passes its 18 focused tests, but it does not close
`G1-AUDIT-P1-001`.

The correction separates registration bytes from a second `hostAuthorization` object.
However, both objects are still supplied as ordinary `unknown` values by the same caller to
the exported derivation. `validateHostAuthorizationG1` proves only that the second object is
internally well-shaped and matches the first object's caller-computable ID/digest. It does
not prove Host provenance or prevent that caller from constructing a matching authorization.

## Main combined-forgery reproduction

Main performed an in-memory, zero-write reproduction:

1. clone a valid registration;
2. change its registration ID;
3. recompute its ordinary registration digest;
4. construct a new plain authorization object that approves the forged ID/digest and claims
   `authority: "host_control_plane"` plus `adaptation_eligible: true`; and
5. pass both objects to `deriveTrustedEvidenceAdmissionG1`.

The correction accepted the pair:

```json
{"accepted":true,"registration_id":"main-forged-registration-and-authorization","authorization_id":"main-forged-host-authorization","authority":"host_control_plane","eligible":true,"admission_id":"admission-c3c0cd92bb17e1d342bd2899108d8600"}
```

This is the same authority failure with the grant moved from one caller-authored object to a
second caller-authored object. Goal 1 Contract section 4.1 and Gate D remain unsatisfied.

## Why the focused suite is falsely green

The focused negative test checks a forged/cloned registration against the original valid
authorization. That mismatch correctly fails. It does not test a forged registration paired
with a newly forged matching authorization. Main ran the reported typecheck and focused
suite independently: both exit `0`, with 18/18 tests passing, while the combined forgery
above is accepted.

## Preserved findings

- The earlier V2 identity correction remains closed.
- The earlier V3 promoted bound-State correction remains closed.
- No new scope or regression finding is asserted.
- Candidate/State/pointer/Workspace/Source/history remained unmodified by Main's in-memory
  reproduction.
- Credential, network, Provider/model and real-model counters remained zero.

## Next control point

Return one further hit-only correction to the original Goal 1 Working Session. It must add
the combined-forgery negative first and establish an actual Host-owned trust root or fixed
Host-owned approval boundary. Merely accepting another caller-created plain object,
boolean, ID, digest, path or matching pair under a trusted-sounding parameter name is not a
correction.

No corrected Candidate commit, re-audit, Goal 1 acceptance or Goal 2 work is authorized.
