# V1-C Closeout — Comparison Completion

```yaml
status: closed_accepted
date: 2026-08-06
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
disposition: PASS_V1_C_COMPARISON_COMPLETION
execution_disposition: PASS_VALID_V1_C_R2_PILOT
policy_result: SKILL_ONLY_DESCRIPTIVELY_BETTER
skill_only_decision: PROMOTE_WITHIN_FROZEN_PROTOCOL
runtime_control_decision: REJECT_CURRENT_TREATMENT_AS_V1_DEFAULT
active_goal: false
real_model_calls_authorized_after_closeout: 0
v2_authorized: false
```

## Outcome

V1-C is complete and accepted. The corrected R2 Pilot executed all 24 frozen
initial cells in Manifest order and produced a valid A/B/C descriptive
comparison:

- A Baseline: 7/8 passed;
- B Skill-only: 8/8 passed;
- C Skill + Runtime Control: 7/8 initial and 7/8 final;
- Recovery: one eligible, one started, zero succeeded;
- invalid and treatment-invalid Runs: zero;
- all eight fairness blocks passed;
- exact tracked cost: USD `0.0105276024`.

Main independently reran all 24 Inspectors and the final aggregate, verified the
single child lineage and sampled A/B/C evidence chains, and found no blocking
evidence conflict. The Goal satisfies its comparison objective without Pi Core
patches, private imports, dependency download, source changes during real
execution, fallback, retry or replacement.

## Accepted evidence

- `docs/reports/V1_C_R2_PILOT_EXECUTION_REPORT.md`
- `docs/reports/V1_C_R2_AGGREGATE_REPORT.md`
- `docs/reports/V1_C_R2_CLOSEOUT_DRAFT.md`
- `docs/reports/V1_C_R2_MAIN_ACCEPTANCE_AND_V1_POLICY_DECISION.md`
- `docs/reports/V1_C_R2_CELL04_OUTER_TIMEOUT_MAIN_REVIEW_AND_CONTINUATION_DECISION.md`
- the three preserved cell-04 pause-time reports;
- ignored immutable R2 evidence under `.runs/v1-c/full-pilot-r2/`.

## Limitation retained

Cell 04 remains in the denominator with outer launcher exit `124` and unknown,
unrecoverable product-process exit code. Its product evidence is complete and
passed all tracked and Main-run Inspectors. It was never rerun or replaced. The
project therefore makes no production-grade launcher/process-ownership claim.

## Final policy interpretation

Skill-only is promoted only as the preferred bounded V1 default. The current
same-Session Runtime Control treatment is not promoted: its only Recovery did
not improve the failed Run and increased resource use. The external Verifier
remains shared reliability infrastructure, and the failed same-Session recovery
becomes a future V2 design input rather than a reason to continue tuning V1.

## Remaining unverified

- replication and statistical significance;
- other tasks, models, Providers, Skills, prompts, tools and budgets;
- general Skill or Runtime Control superiority;
- cross-process resume, durable crash recovery and V2 multi-path selection;
- Pi SDK/Extension integration of the promoted Skill treatment.

## Stop point

V1-C and V1 are closed. No further V1 real call, correction, retry, replacement
or report-only execution is authorized. V2 is not activated. Any next work must
start with Main/user review of the post-V1 compatibility/reuse checkpoint and
the bounded V2 precontract question.
