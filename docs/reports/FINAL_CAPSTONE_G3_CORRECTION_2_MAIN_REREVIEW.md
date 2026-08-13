# Final Capstone Goal 3 Correction 2 Main Re-review

```yaml
status: PASS_FINAL_CAPSTONE_G3_CORRECTION_2_MAIN_REREVIEW
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
finding: FC-G3-IMPLEMENTATION-P1-002
finding_class: task_schema_verifier_authority_identity
corrected_control_candidate_commit: 7e754927efd82c171cf57b823c21dff7162916c2
corrected_control_candidate_tree: 66dd78f9bbd87977eb5cd0b5126ab53b6201c4bb
correction_budget: 2_of_2_consumed_exhausted
same_class_as_round_1: false
real_run_started: false
```

## Result

Main accepts correction 2. The Contract now keeps two identities distinct:

1. the immutable V1 task source object, preserved by its file SHA-256 and original complete
   object digest; and
2. the exact `TaskSpecV0B` projection consumed by the accepted outer V3 Run and external
   Verifier authority.

The V0B projection explicitly contains every field required by
`workbench/src/contracts/v0b-types.ts#TaskSpecV0B`, including verifier identity,
`hidden_external` visibility and the verifier command. It also retains the corrected outer
profile ID `v3g3_bounded_local` and the one frozen command descriptor.

Main independently reconstructed the projection from the immutable V1 task JSON and
computed digest
`d251789ebbfa8b5f9a59a2fcd695a34723eee1b9d374d8a9caca3461f122e888`. The command,
tool-profile, Verifier source, provider, budget and Docker digests remain unchanged.

## Accepted-source compatibility

Main rechecked:

- `workbench/src/contracts/v1-types.ts#TaskSpecV1`;
- `workbench/src/contracts/v0b-types.ts#TaskSpecV0B`;
- `workbench/src/run-v3.ts#executeGoal3RunV3`; and
- `workbench/src/verifier/runner.ts#runExternalVerifierV0B`.

The corrected projection supplies the exact names and values these outer-envelope symbols
consume. The V1-only family/public-check/reference-patch fields remain provenance in the
source task identity and do not contaminate or ambiguously extend the V0B authority object.
No cast, alias, Proxy, hidden field or caller-selected mapping is needed.

## Verification and boundaries

Main ran the stable-JSON `digestObject` reconstruction locally; it printed
`corrected V0B task projection PASS` and exited 0. `git diff --check` and cached diff checks
passed before the correction candidate commit.

No implementation source, accepted core, fixture, State, evidence or Pi checkout changed
in the correction candidate. No credential, external network, Provider/model or real-model
access occurred. The unique real Run remains unconsumed.

## Disposition

Finding `FC-G3-IMPLEMENTATION-P1-002` is closed for this correction. The original
implementation Session may resume its partial allowed delta from the Main revision
containing this re-review, must repeat Gate A, and must complete the original zero-access
implementation and tests.

The Goal 3 correction budget is exhausted. Any further acceptance-blocking
implementation/integration finding, or recurrence of either authority/integrity class,
requires `DECISION_REQUIRED`; no additional correction is authorized.
