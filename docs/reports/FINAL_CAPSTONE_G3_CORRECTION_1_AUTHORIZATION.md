# Final Capstone Goal 3 Correction 1 Authorization

```yaml
status: accepted_bounded_correction_1
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
finding_set: FC-G3-PREIMPLEMENTATION-P1-001
finding_class: tool_profile_authority_identity
correction_round: 1_of_2
real_run_started: false
credential_reads: 0
external_network_calls: 0
external_provider_or_model_calls: 0
pi_changes: 0
```

## Main finding

The fresh Goal 3 implementation Session passed Gate A and stopped before its first edit.
It reproduced the initially frozen TaskSpec digest
`336503d26d2c0d31aa74f7ee22b16cf52801ddb4cfa82cc3212e1163278e09e5`, whose complete
V1-task-object domain contained
`tool_profile_id: final_capstone_g3_v36_registered_only`.

Main independently confirmed that this TaskSpec cannot enter the accepted outer V3 Goal 3
authority plane:

- `workbench/src/pi/runtime-profile-v3.ts#GOAL3_TOOL_PROFILE_ID_V3` freezes
  `v3g3_bounded_local`;
- `workbench/src/state/case-authority-v3.ts#validateGoal3CaseAuthorityV3` rejects a Case
  Authority with any other `tool_profile_id`; and
- `workbench/src/run-v3.ts#executeGoal3RunV3` requires the Case Authority and verifier
  TaskSpec profile IDs to be identical.

This is one concrete authority finding set. It is not split into multiple findings.

## Bounded correction

The Contract now freezes the outer TaskSpec profile as `v3g3_bounded_local`. Recomputing
the complete existing V1 `parse-duration` task object with only these three replacements:

1. `task_id: final-capstone-g3-v1-parse-duration`;
2. `tool_profile_id: v3g3_bounded_local`; and
3. the one frozen `test` command descriptor;

produces corrected TaskSpec digest
`58cc5ff437714996ae2312868bf182618e964a9e3cdf780e16d429d524ca661d`.

The inner V3.6 Project Profile and interactive authority remain separately frozen as
Docker-backed registered-command authority (`docker_registered_only`). This correction
does not add a command, widen a path, change the tool-profile digest
`76464e44b6c39c0afd5a54ce09b6a12498a084f022a7003315ab0f323b135fcb`, alter V3/V3.6
source, or upgrade ordinary V3.6 verification/eligibility semantics.

## Budget and continuation

This correction is conservatively counted as Goal 3 implementation/integration correction
round `1/2`. The initial Session remains the original implementation owner and may resume
from the corrected Main Control Baseline. It must re-run Gate A, then perform the original
Contract-bounded zero-access implementation and regressions.

If the same tool-profile authority identity class recurs after this correction, Main must
stop with `DECISION_REQUIRED`. Real execution remains withheld; the unique real Run is
unconsumed and no correction grants rerun, fallback, replacement, task swap, result hunting
or failure-manufacture authority.
