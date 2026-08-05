# V1-C Canary Main Acceptance and Full Pilot Baseline Decision

```yaml
status: accepted_main_decision
decision_date: 2026-08-06
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
canary_disposition: PASS_V1_C_REAL_CANARY
full_pilot_conditional_preauthorization: activated
full_pilot_execution_started: false
v2_authorized: false
```

## 1. Main decision

**Fact:** Main Session independently reviewed the dedicated Canary Session report and raw evidence. The
one authorized Arm-A Run is terminal, integrity-valid and comparable; the common Verifier passed and the
formal failure class is `task_pass`.

**Decision:** accept the Canary as `PASS_V1_C_REAL_CANARY`. The user's previously granted conditional
authorization therefore activates for one disjoint 24-cell full Pilot under the remaining USD 1.90 hard
cap. This does not accept V1-C, does not establish an A/B/C winner and does not authorize V2.

## 2. Accepted Canary identity and result

| Field | Accepted value |
| --- | --- |
| Authorization baseline | `2aff5ccdcc7aa780cc4bf68f9030d6123c750d7b` |
| Audited source Candidate | `962b42a281d3092f0faf399b9f6f1ecaa0212f31` |
| Canary Manifest ID | `c26e75989623ae1218be0a3996c59de2ccbce946988396695b38bb9fdc482c4c` |
| Run | `v1c-canary-run-01-parse-duration-r1-a` |
| Session | `v1b-session-be03c594-6a20-430f-9f1c-78c72a2bb3ba` |
| Outcome | `task_pass`; common Verifier `passed` |
| Inspector | `terminal_valid: true`, `integrity_valid: true`, `comparable: true`, no errors |
| Real counters | 1 Credential read; 8 network/Provider/model calls |
| Work | 10 Tool calls; 12,147 tokens; 17,083 ms active execution |
| Exact tracked cost | USD `0.00042865199999999996` |
| Child Attempts | 0 |

Request ordinal 9 was rejected locally before dispatch after the eight-request cap was reached. Its typed
diagnostic was recorded and consumed before `attempt_settled`, the common Verifier and terminalization. It
was not a ninth Provider request and did not create a pending reservation.

## 3. Main verification

Main Session reran these read-only/deterministic checks against the Canary worktree:

```text
node .runs/v1-c/canary/independent-cross-check.mjs                       # exit 0
node .runs/v1-c/canary/scan-evidence.mjs                                # exit 0; 26 files, zero matches
node workbench/src/cli.ts v1b inspect --pilot-root .runs/v1-c/canary/pilot --run v1c-canary-run-01-parse-duration-r1-a
                                                                            # exit 0
node .runs/v0-a/pi/node_modules/typescript/bin/tsc -p workbench/tsconfig.json
                                                                            # exit 0
node --test workbench/tests/v1c-budget-stop.test.ts                      # exit 0; 13/13
node --test workbench/tests/v1b-stage1.test.ts workbench/tests/v1b-cli.test.ts
                                                                            # exit 0; 31/31
```

The report is the only tracked Canary-session addition. Product source, tests, fixtures, Manifest,
governance files, Pi and `CURRENT_STATE.md` were unchanged; nothing was staged or committed by the
execution Session.

The execution report also records several failed invocations while the Session authored audit-local
read-only helper assertions and narrowed false-positive scanner patterns. Those failures did not touch the
Credential or network, did not create another Run and did not change product artifacts. The final helpers
and the tracked Inspector all pass, so they are not a Canary Pause Condition.

## 4. Full Pilot freeze

The disjoint immutable full Pilot Manifest is:

```yaml
path: fixtures/manifests/v1/v1c-full-pilot-execution.json
manifest_id: e32b11a162fec752e95ff48bf2b1021f20109a8e804aa025131568d49f50e8a1
experiment_id: v1-c-bounded-pilot
identity_role: full_pilot
audited_source_candidate: 962b42a281d3092f0faf399b9f6f1ecaa0212f31
workbench_source_digest: 4d12e4588917949ee84bb56c83ec67f7cb8093a304c8a3ab9980c97188174604
initial_cells: 24
child_attempts_max: 8
full_pilot_cost_hard_cap_usd: 1.90
canary_actual_cost_usd: 0.00042865199999999996
maximum_v1_c_real_sequence_cost_under_current_authority_usd: 1.900428652
```

The Canary Run is not a member of this Manifest and cannot be counted in the aggregate. The source,
tasks, order, Prompt, Skill, Verifier, Tool profile and Provider/model remain frozen. The full Pilot must
run from the resulting Main-owned baseline in a fresh no-source-edit Session, one cell at a time.

## 5. Continuing boundaries

- no retry, fallback, automatic replacement or same-Run replay;
- no source, test, fixture, Manifest, Prompt, Skill, task, Verifier, Tool or model changes during execution;
- no Pi patch, private import, SDK/Extension switch, dependency install or external download;
- stop at the first unknown usage/cost, evidence conflict, secret boundary failure, invalid-threshold stop,
  repeated invalid cause, nonterminal earlier cell, source defect or other Contract Pause Condition;
- the execution Session may write only ignored Pilot evidence and the Contract-listed execution,
  aggregate and Closeout-draft reports; it may not stage, commit or edit control state;
- Main Session alone reviews evidence, accepts or closes V1-C, updates formal state and creates the already
  authorized closeout commit;
- V2 remains unauthorized.

## 6. Claims boundary

The Canary proves only that one new-identity real Arm-A Run exercised the corrected budget-stop,
settlement, common-Verifier, Outcome and evidence path successfully. It does not compare Skill-only with
Runtime Control and does not predict the full Pilot result. Any later recommendation must remain
descriptive and evidence-bounded; no statistical-significance or universal-superiority claim is allowed.
