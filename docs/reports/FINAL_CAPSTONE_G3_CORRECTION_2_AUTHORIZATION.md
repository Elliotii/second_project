# Final Capstone Goal 3 Correction 2 Authorization

```yaml
status: accepted_bounded_correction_2
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
finding_set: FC-G3-IMPLEMENTATION-P1-002
finding_class: task_schema_verifier_authority_identity
correction_round: 2_of_2
correction_budget_after_round: exhausted
same_class_as_round_1: false
real_run_started: false
credential_reads: 0
external_network_calls: 0
external_provider_or_model_calls: 0
pi_changes: 0
```

## Main finding

After correction 1, the original implementation Session repeated Gate A and began only
the Contract-allowed type and V3.6 port files. It then stopped before tests or execution on
one new authority finding set.

The Contract called the complete corrected V1 task object—digest
`58cc5ff437714996ae2312868bf182618e964a9e3cdf780e16d429d524ca661d`—a
`TaskSpecV0B`. Accepted source proves they are different schemas:

- `workbench/src/contracts/v1-types.ts#TaskSpecV1` uses `external_verifier_*` plus V1
  family/public-check/reference-patch fields;
- `workbench/src/contracts/v0b-types.ts#TaskSpecV0B` requires `verifier_*`,
  `acceptance_visibility` and `verifier_command`; and
- `workbench/src/run-v3.ts#executeGoal3RunV3` plus
  `workbench/src/verifier/runner.ts#runExternalVerifierV0B` consume the V0B fields.

Using the complete V1 object would leave the outer frozen Verifier authority undefined.
A cast, alias, non-enumerable field, Proxy or caller-selected mapping would be an integrity
bypass. None was used.

This `task_schema_verifier_authority_identity` class is distinct from correction 1's
`tool_profile_authority_identity` class. It is treated as one finding set and is not split.

## Bounded correction

The Contract now freezes an exact `TaskSpecV0B` projection. Its canonical stable-JSON
object contains:

- schema version 1 and task ID `final-capstone-g3-v1-parse-duration`;
- the frozen instruction, Workspace, writable and protected fields;
- verifier ID/ref/source digest projected from the frozen V1 `external_verifier_*` fields;
- `acceptance_visibility: hidden_external`;
- outer `tool_profile_id: v3g3_bounded_local` and the one frozen `test` descriptor; and
- verifier command: current Node executable, frozen verifier ref argument, project cwd,
  30,000 ms timeout and 65,536-byte output cap.

Main independently computed the full projection digest as
`d251789ebbfa8b5f9a59a2fcd695a34723eee1b9d374d8a9caca3461f122e888`.

The original V1 task JSON remains separately frozen without reinterpretation by its file
SHA-256 `d2c7c3b085b351ce868ca2a6706f103f07a037e1320ab1bd1702d988a0f09cec` and complete
object digest `164923ab6f289879be84f59a2b28e51bcdcea9287a595b7b51bc4ca6e8acbe9a`.

No source, fixture, tool, command, provider, budget, State, evidence or real authority was
expanded. The Session's two partial allowed source files remain uncommitted and must be
reviewed as part of the resumed implementation; this authorization does not accept them.

## Exhausted budget and continuation

This consumes Goal 3 correction round `2/2`. The original implementation Session may
resume only after Main's correction-2 re-review passes and Main freezes the exact corrected
Control Baseline. It must repeat Gate A, revalidate the V0B projection, and then complete
the originally authorized zero-access implementation and tests.

There is no further correction authority. If implementation/integration cannot reach the
Candidate/audit gate from this correction, if any new acceptance-blocking finding remains,
or if either authority/integrity defect class recurs, Main returns `DECISION_REQUIRED`.
The unique real Run remains unconsumed and separately withheld.
