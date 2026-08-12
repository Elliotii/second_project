# Post-V3.6 ES-N03 Tool-accounting Terminalization Maintenance Closeout

```yaml
status: closed_accepted
goal_id: POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_MAINTENANCE
parent_goal: V3_6_ENGINEERING_STABILIZATION_CAMPAIGN
version_status: V3_6_remains_closed_accepted
disposition: PASS_POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_MAINTENANCE
control_baseline_commit: 856dfa066b34a477e7e7aea92b3c2ed8dfc4734c
initial_implementation_commit: 8ba45fdd15c73fca9c5aa9de4f7bd2cce61b6598
main_integrated_candidate_commit: 02096eb80986060bf57a69062f001f358267b72e
candidate_audit_baseline_commit: 1b826237249d29be111107be44f474c6355107a5
focused_audit_disposition: REVISE
bounded_correction_commit: 79e74f2b7c1801c5b9001633aebf82c03bd5d734
main_integrated_correction_commit: 958c09cd35ffe99eb32103fb72424a600d394439
corrected_candidate_audit_baseline_commit: 6df87e2a4711fd6b3b0b61a6aa720f35815a70ff
affected_finding_recheck: PASS_AFFECTED_FINDINGS
hard_stop: NOT_TRIGGERED
next_gate: exactly_one_ES_N03_post_maintenance_retest
```

## Disposition

Main formally accepts and closes this bounded maintenance. All twelve deterministic Exit
Criteria in the Contract are satisfied. V3.6 remains `closed_accepted`; the Engineering
Stabilization Campaign remains active. This Closeout does not claim that ES-N03 completed,
that its partial Workspace changes are correct, or that the daily Tool cap is universally
adequate.

Allowed claim:

> A reconciled registered Tool-budget stop remains typed, persistent and inspectable even
> when the same Pi Session contains explicitly accounted unavailable Tool requests, while
> all persisted Tool identities, legacy terminal formats and Host authority remain intact.

## Accepted behavior

- Additive schema 4 separates complete persisted Tool call/result identities from
  registered attempts, executions/completions, pre-hook rejections and the unique
  registered budget-blocked call.
- Unavailable and active-tool pre-hook rejected requests remain paired errors outside the
  registered execution, command and side-effect domains.
- The unchanged daily Tool hard maximum remains 24 registered executions, with attempt 25
  represented as the unique registered budget block.
- Reopen authenticates exhaustive/disjoint identities, exact registered-minus-executed
  blocked state and equal Tool names for every persisted call/result pair.
- Safe Session/Run/WebUI projection remains bounded. Diff/Export/Discard remain available;
  Apply and same-failed-Session continuation remain server-side denied.
- Historical schema 1, 2 and 3 semantics remain compatible. Pi, Agent Loop, Tool surface,
  budgets, registered Source, Verifier/Outcome and authority boundaries remain unchanged.

## Review and audit history

Main light review returned one Contract-local execution-domain correction to the original
Implementation Session. The first focused audit then reproduced one blocking semantic
pairing gap: a digest-recomputed registered ToolResult name mismatch could survive reopen.
It also identified two trailing-space lines in the draft report.

The original Implementation Session supplied one affected correction. Main integrated it,
and the original Audit Session rechecked only the two findings. The final affected-finding
disposition is `PASS_AFFECTED_FINDINGS`; no second broad audit was created.

Evidence:

- `POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_IMPLEMENTATION_REPORT.md`
- `POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_MAIN_REVIEW.md`
- `POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_FOCUSED_AUDIT_REPORT.md`
- `POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_AFFECTED_FINDING_RECHECK.md`

## Verification

Implementation final affected regression set: 28/28 passed. Main independently ran:

```text
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v36-finite-budget-terminalization.test.ts tests/v36-budget-stop-terminalization.test.ts
```

Result: 9/9 passed, Exit Code 0.

Main also ran strict TypeScript and browser syntax checks; both exited 0. Whole corrected
candidate `git diff --check` from Control Baseline through `6df87e2a…` exited 0. Fixed Pi
remained `027a5847901b5dde30270abaa1041046cd2b4b55` and clean.

```yaml
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_cost_usd: 0
pi_changes: 0
registered_source_apply: 0
```

## Remaining work and non-claims

Exactly one post-maintenance ES-N03 Retest is the next Campaign gate. It must use the same
frozen task, registered Source baseline, command, provider/model and unchanged daily
profile in a fresh Session/data root. It is new evidence, not a Retry or replacement.

No ES-N04, Fault Injection, budget adjustment, continuation, Apply, V4 or unrelated feature
is authorized by this Closeout. The Retest need not pass; any result returns to Main for
classification under the existing Campaign rules.
