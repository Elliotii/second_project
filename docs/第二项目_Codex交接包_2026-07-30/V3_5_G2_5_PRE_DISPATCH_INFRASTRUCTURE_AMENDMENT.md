# V3.5 Goal 2.5 Pre-dispatch Infrastructure Amendment

```yaml
status: accepted_activated
date: 2026-08-09
parent_contract: docs/第二项目_Codex交接包_2026-07-30/V3_5_G2_5_GOAL_CONTRACT.md
trigger: PAIR_PREPARATION_ENOENT_WORKSPACES_PARENT_MISSING
previous_real_pair_authority: consumed_pre_arm
correction_control_baseline: resulting_HEAD_of_this_revision
additional_independent_audit: false
replacement_real_pair_authorized: exactly_once_after_corrected_execution_baseline
goal_2_5_final_acceptance_authorized: false
goal_3_authorized: false
```

## Binding correction scope

The sole previous command stopped before Base arm creation, Credential-resolver access,
network, Provider/model, Tool or Verifier activity. This Amendment authorizes only:

1. create the intermediate `<pair-root>/workspaces` directory before calling the existing
   non-recursive `createTemporaryWorkspace` helper for Base and Candidate;
2. add one focused cold-start regression beginning from an absent Pair root and proving
   `prepareGoal25PairV35` creates both isolated Workspaces plus its frozen preflight;
3. run strict TypeScript, the focused Goal 2.5 suite and directly affected regressions;
4. Main light review and a corrected clean Execution Baseline;
5. one fresh no-source-edit Base-then-Candidate replacement Pair under the unchanged Case,
   Prompt, Skill, Verifier, provider/model, order and budgets;
6. Main limited evidence review and disposition.

## Frozen boundaries

```yaml
case_change: false
prompt_or_skill_change: false
verifier_change: false
provider_model_or_runtime_change: false
budget_change: false
retry: 0
fallback: 0
additional_replacement_after_this_one: 0
extra_arm_or_case: 0
pi_patch_or_private_import: false
sdk_extension_rpc_switch: false
goal_3: false
```

The correction Session has zero Credential, network and real-model authority. No second
independent audit is required because this change is limited to an ordinary caller-side
directory precondition plus its direct regression. Any change to terminalization,
Verifier handoff, evidence authority, State, budget or experiment semantics is a hard stop.

The replacement Pair retains the original per-arm caps of 16 Provider dispatches, 17
request attempts, 131072 tokens, 24 Tool calls, one Verifier and USD 0.20; whole-Pair caps
remain two arms, two Credential-resolver reads, 32 Provider dispatches and USD 0.40.

