# V3.6 Engineering Stabilization — ES-N03 Post-maintenance Retest Main Review

```yaml
status: accepted_main_disposition
case_id: ES_N03_RETEST
disposition: ACCEPT_MAINTENANCE_TARGET_VERIFIED_TASK_REMAINS_TERMINAL
session_id: v36-session-8279b1d5-951f-4ad2-941d-c630d3bcc264
run_id: v36-run-5a1a5004-03fd-423f-b747-b9dd4b38e0f4
terminal_reason: tool_call_budget_exhausted
terminal_schema: 4
task_completed: false
maintenance_objective_verified: true
source_changed: false
next_retest: forbidden
```

## Main disposition

Main accepts the Retest as valid post-maintenance evidence. The same material lifecycle
recurred naturally: 26 persisted Tool calls/results, 25 registered attempts, 24 executions
and one pre-execution budget block. Unlike Before-Fix ES-N03, the Run returned HTTP 201
with a typed schema-4 terminal; Session list/detail/Workspace remained safely inspectable
over HTTP 200.

The maintenance target is therefore verified. The coding task itself is not accepted:
the first registered `run_command` was budget-blocked before execution, the proposed
nine-file ChangeSet is unverified, formal Outcome remains null, and Apply remains denied.

## Final classification

- F1 Harness correctness bug: not reproduced after maintenance.
- F2 terminalization/inspectability gap: closed by maintenance and same-lifecycle Retest.
- F3 budget adequacy: retained as a known bounded-workload limitation, not a new
  correctness finding. Tool attempts reached 25/24 and combined tokens reached
  119665/131072 before verification.
- F4 trajectory inefficiency: observed. Twelve registered reads, ten fine-grained edits
  and one unavailable Tool request contributed to the stop; this does not prove runaway.
- F9 correct stop/fail-closed: verified. Pending Provider/Tool/side-effect state was zero,
  Source was unchanged and the Run remained unverified.
- F10 expected limitation: the finite hard boundary and new-Session requirement worked as
  frozen.

No budget change is recommended from this one bounded Retest. Raising the Tool cap would
likely move pressure toward the combined-token cap and would require a separate user
decision; this Campaign does not make that decision.

## Evidence and authority

- External handoff:
  `C:/Users/HUAWEI/Downloads/V3_6_ENGINEERING_STABILIZATION_ES_N03_RETEST_HANDOFF.md`
- Handoff SHA-256:
  `344ac0fed5a04da2397c225da7dd8ed89c1f20e3c9921ba321551a8eca1a3602`
- Session/Run/Workspace:
  `v36-session-8279b1d5-951f-4ad2-941d-c630d3bcc264` /
  `v36-run-5a1a5004-03fd-423f-b747-b9dd4b38e0f4` /
  `v36-workspace-1d9ee832-9057-48bb-b110-c3a01176460f`
- Terminal digest:
  `f3076347aab288559ef42e1e491bf6741fb05d1feaf5cb76188ba47439551284`
- ChangeSet digest:
  `ca1d6d973087ce76f484a8fc413cec5ccce7ca13861940431fcb94703a71cf43`
- Provider requests: 17; Tool attempts/executions: 25/24; combined tokens: 119665;
  cost: USD 0.0026217016; wall time: 41023 ms.

The original Before-Fix evidence remains immutable. This Retest is not a Retry,
replacement or proof that the proposed refactor is correct. No second Retest, ES-N04,
Fault Injection, continuation, Apply or budget change is authorized.
