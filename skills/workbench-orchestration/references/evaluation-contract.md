# Multi-Run and formal evaluation contract

Use this reference before Experience collection, Source Run selection, or Formal Evaluation.

## Choose the level deliberately

Distinguish:

- single-task execution;
- screening or non-independent validation;
- Experience collection;
- Candidate induction from Source Runs;
- formal held-out Candidate evaluation;
- re-analysis of an existing evaluation.

Do not escalate inspection or a one-task request into formal evaluation without alignment.

## Align material variables

Recover first, then align only unresolved variables that affect experiment meaning, cost, sample size, or claim scope:

- goal and desired final output;
- tasks and number of tasks;
- conditions and repetitions;
- model/runtime and budget;
- test/External Verifier policy;
- Source versus held-out roles;
- Source Run selection policy;
- retry and stop policy;
- whether Codex may construct missing tests/verifiers.

If a Frozen Plan supplies these values, do not ask again or redesign it.

## Freeze Source selection before outcomes drive selection

When the user has not named Source Runs, propose a prospective policy such as “all evidence-valid Runs from the frozen Experience execution in this task family.” Freeze it before result-dependent selection. Do not inspect outcomes and cherry-pick the best-looking Runs.

Passed and failed task outcomes can both be learning evidence when execution completed and the External Verifier legally established the outcome. Operational/not-run/corrupt evidence remains ineligible. Interpret specific trajectory behavior in outcome context rather than treating a whole Run as uniformly good or bad.

## Preserve formal independence

Formal evaluation requires a frozen Candidate identity/SHA, Plan, cases, conditions, trials, source/held-out roles, runtime/model, budgets, verifier identities, and exact plan-to-config bindings. The current Workbench consumes this contract; it does not design it.

Prefer an External Verifier outside the treatment boundary. If a newly constructed verifier or test would expose task answers to the evaluated Agent or otherwise contaminate the comparison, ask the user or explicitly label the exercise screening/non-independent rather than formal.

## Respect the post-dispatch freeze

Once Experience or Formal Evaluation starts, do not change tasks, trials, conditions, Candidate, verifier, held-out definitions, budget, or selection policy because of observed outcomes. Do not retry/replace failed Runs or extend the denominator to improve the result. A desired change requires an explicitly new execution/evaluation contract.

## Interpret review recommendations

Analysis may return `NO_CHANGE_JUSTIFIED`, `HUMAN_REVIEW_FOR_NARROW_CHANGE`, or `HUMAN_REVIEW_FOR_REVISION`. These are evidence-bounded human-review dispositions, not automatic edits and not an add-only taxonomy. Any later change may add, remove, shorten, relax, replace, or rewrite content according to a separate human decision.
