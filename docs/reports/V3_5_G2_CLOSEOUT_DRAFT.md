# V3.5 Goal 2 Closeout Draft

```yaml
goal_id: V3_5_G2_REAL_ADAPTIVE_SKILL_CLOSURE
document_status: superseded_by_V3_5_G2_CLOSEOUT_md
goal_2_accepted: false
implementation_status: frozen_at_ed2dc14e695233411f96af162d92b405188b04cf
real_pair_status: invalid_pair_base_request_budget_stop
real_pair_authority_consumed: true
credential_reads: 1
network_calls: 16
external_provider_calls: 16
real_model_calls: 16
real_cost_usd: 0.000552272
```

This document preserves the dedicated Goal Session's draft. Main's formal disposition is
recorded in `V3_5_G2_CLOSEOUT.md`. This draft does not authorize Goal 3 or accept V3.5.

## Version Question

Can the accepted historical adaptive Skill be explicitly selected from isolated case-owned State and evaluated on the one frozen related held-out task through the real Direct Pi/model path with fair, persistent and inspectable Base/Candidate evidence?

`Fact`: the mechanism was frozen and the sole real command was attempted. Base reached the 16-request limit and the 17th pre-dispatch attempt was refused locally; Candidate and both hidden Verifiers never ran. The frozen Version Question is therefore not answered by valid Base/Candidate evidence.

## Current exit-criteria state

| Exit criterion | Draft status |
|---|---|
| Frozen Contract and exact identities before real access | Satisfied for implementation preflight |
| Leakage/applicability checks and unchanged V3 State pointer | Satisfied at zero access |
| Byte-identical Workspaces and fresh persistent Sessions | Initial Workspaces matched; only Base Session was created before invalid stop |
| Exactly one real Base and Candidate through Direct Pi | Not satisfied: Base invalid, Candidate not started |
| Same external Verifier exactly once per arm | Not satisfied: zero Verifier runs |
| Persistent Session/Run/Tool/Verifier/comparison evidence and safe Read Model | Partial Base Session prefix only; no terminal Run Manifest or comparison |
| Actual first Provider payload differs only by exact Skill treatment text | Not evidenced for the pair: first-payload artifact was not terminally persisted |
| Accept observed result without hunting/replacement/tuning | Satisfied procedurally: invalid pair preserved, no retry/replacement/tuning |
| Pi, accepted V3 authority and prior facts unchanged | Satisfied at terminal stop |

## Terminal evidence for Main review

Observed facts:

1. execution used exact frozen commit `ed2dc14e695233411f96af162d92b405188b04cf` and pair root `.runs/v3-5-g2/real-pair-20260808-01`;
2. `pause.json` is immutable invalid evidence with one credential read and 16 actual network/Provider/model calls;
3. Base Session persists 19,350 tokens, 16 Tool calls/results and USD `0.000552272`; Base Verifier did not run;
4. Candidate Run and Session do not exist and Candidate consumed zero access/cost;
5. `inspectGoal2PairV35` is invalid because `comparison.json` is absent; the safe Read Model is unavailable with null result/efficiency;
6. both protected-byte digests, source commit, pinned Pi, historical State tree, Case/Skill/fixture/Verifier identities remain unchanged;
7. no retry, replacement, fallback, extra Case/arm, source edit, State edit or Goal 3 entry occurred.

The intended frozen sequence was:

```text
Base once
→ same hidden external Verifier once
→ Candidate with exact adaptive Skill once
→ same hidden external Verifier once
→ persistent comparison/read-model inspection
→ stop
```

The sequence stopped during Base before either external Verifier or Candidate. The one-pair authority is consumed; this draft grants no rerun.

## Result and acceptance state

```yaml
pair_terminal_status: invalid_pair
comparison_result_label: null
efficiency_label: null
base_verifier_status: not_run
candidate_verifier_status: not_run
pair_integrity: false
main_acceptance: pending
```

No Skill win is required. Valid, fair, persistent evidence is the completion target. An invalid or interrupted pair must remain invalid evidence with no retry, replacement Case, fallback or extra arm.

## Remaining authority boundary

- Main retains Goal 2 acceptance and control-state ownership.
- The sole frozen pair authority is consumed; this Goal Session has no rerun, replacement or further real-access authority.
- Goal 3 and final V3.5 acceptance remain unauthorized.
- Pi patches, private imports, SDK/Extension/RPC/server switching, retries, fallbacks, replacement Cases and extra arms remain forbidden.

## CURRENT_STATE_UPDATE_PROPOSAL

This is a proposal for Main; `CURRENT_STATE.md` was not modified.

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  active_version: V3.5
  active_goal: V3_5_G2_REAL_ADAPTIVE_SKILL_CLOSURE
  goal_2_execution_baseline: ed2dc14e695233411f96af162d92b405188b04cf
  real_pair_root: .runs/v3-5-g2/real-pair-20260808-01
  real_pair_status: invalid_pair_base_request_budget_stop
  real_pair_authority_consumed: true
  evidence_valid_for_version_question: false
  base:
    credential_reads: 1
    actual_provider_model_requests: 16
    refused_pre_dispatch_attempt: 17
    input_tokens: 18448
    output_tokens: 902
    total_tokens: 19350
    tool_calls: 16
    cost_usd: 0.000552272
    verifier_runs: 0
  candidate:
    started: false
    credential_reads: 0
    provider_model_requests: 0
    tokens: 0
    tool_calls: 0
    cost_usd: 0
    verifier_runs: 0
  pair:
    inspector_integrity_valid: false
    read_model_source_status: unavailable
    comparison_result: null
    efficiency: null
  preserved:
    source_commit: ed2dc14e695233411f96af162d92b405188b04cf
    pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
    historical_state_tree_digest: 0c6167f82595ef36d6e9cdabbce8eac09f18b341f48694fcacb84ff6b48f3ffa
    protected_bytes_unchanged: true
  next_decision_owner: Main_plus_user
  next_decision: limited_or_inconclusive_Goal_2_closeout
  forbidden_without_new_authority:
    - rerun
    - replacement_pair
    - budget_change
    - source_or_schema_correction
    - Goal_3
```

Draft disposition: `PAUSE_V3_5_G2_REAL_PAIR_INVALID_BASE_REQUEST_BUDGET`; not a Goal acceptance.
