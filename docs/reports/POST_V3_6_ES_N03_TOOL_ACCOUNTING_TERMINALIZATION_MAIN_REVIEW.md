# Post-V3.6 ES-N03 Tool-accounting Terminalization — Main Review

```yaml
status: passed_after_one_bounded_correction
goal_id: POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_MAINTENANCE
implementation_session: 019ff603-ac10-7ba1-a79e-98125f447964
implementation_candidate_commit: 8ba45fdd15c73fca9c5aa9de4f7bd2cce61b6598
main_integrated_candidate_commit: 02096eb80986060bf57a69062f001f358267b72e
main_integrated_candidate_tree: a2ec251fe5d5374b96b9c39a248b019d4686109b
disposition: PASS_MAIN_LIGHT_REVIEW_TO_FOCUSED_AUDIT
real_access: zero
```

## Review result

Main verified the exact changed-file allowlist, source semantics, Faux evidence, reports
and final commands. The candidate adds schema 4 only when a reconciled finite-budget Turn
contains Tool calls rejected before Pi's public registered `tool_call` hook. It keeps the
complete persisted Tool call/result identity separate from registered budget attempts,
executions, ordinary pre-hook rejections and the unique budget-blocked registered call.

Historical schema 1/2/3 field sets and parse meanings remain unchanged. The registered
Tool hard maximum remains 24. Pi, Agent Loop, Tool surface, Source/Apply/Verifier and
budget values did not change.

## Bounded correction

Main found one Contract-local integrity omission in the initial candidate: schema 4 did
not state for every terminal reason that execution IDs are a subset of registered attempt
IDs or that registered blocked IDs/count are the exact registered-minus-executed set.
The original Implementation Session corrected it by adding explicit unconditional
invariants and digest-recomputed tamper regressions for unavailable and active pre-hook
identities injected into the execution domain.

The correction did not alter architecture, scope, budgets, authority, Pi or Agent Loop.
It is one ordinary bounded correction, not a second material terminal-design failure.

## Main verification

Main independently ran:

```text
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v36-finite-budget-terminalization.test.ts tests/v36-budget-stop-terminalization.test.ts
```

Result: 9/9 passed, Exit Code 0.

```text
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.v35g2.json --noEmit
node --check src/webui/static/app.js
```

Both passed with Exit Code 0. `git diff --check` passed before Candidate freeze.

The Implementation Session's final combined affected regression result is 28/28, with
zero Credential, network, external Provider/model, real-model or cost access.

## Audit gate

The candidate is suitable for the Contract-required single focused read-only audit.
Audit must remain limited to:

- disjoint/exhaustive persisted versus registered Tool identity;
- pre-hook rejection and unique budget-block truth;
- Session-derived reconciliation and schema 1/2/3 compatibility;
- safe projection and no secret/Host-path expansion;
- Diff/Export/Discard availability, server-side Apply/continuation denial;
- registered Source, Pi and authority immutability.

Maintenance acceptance and ES-N03 Retest remain unauthorized until the audit passes.
