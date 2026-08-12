# Post-V3.6 Finite-Budget Terminalization Maintenance Closeout

```yaml
status: closed_accepted
goal_id: POST_V3_6_FINITE_BUDGET_TERMINALIZATION_MAINTENANCE
disposition: PASS_POST_V3_6_FINITE_BUDGET_TERMINALIZATION_MAINTENANCE
version_status: V3_6_remains_closed_accepted
control_baseline_commit: c2dc5d7bac14bb63e30c3669e70caaddbf6d913f
control_baseline_tree: 4b313ca191694074169ca95bdad7eac45b65a08f
implementation_commit: f83b23da77bb8f57f383c8a44cf4909d73ccbfb1
implementation_tree: 15f41350490a5e1e0b8098f4cc1db7559175a903
audit_commit: 4659c542e58bebc110572c7d13a0a101da6f0d2f
audit_disposition: PASS_POST_V3_6_FINITE_BUDGET_TERMINALIZATION_FOCUSED_AUDIT
fixed_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
active_goal_after_closeout: null
real_model_calls: 0
credential_reads: 0
external_provider_or_network_calls: 0
ux_attempt_3: not_run
```

## 1. Disposition

**Fact:** The Goal satisfies its bounded Contract and is formally accepted. V3.6 remains
closed and accepted; this maintenance does not reopen or broaden its accepted claim.

**Fact:** The implementation adds one additive schema-3 terminal authority for known,
reconciled finite-budget stops while preserving the two historical Provider-request
terminal schemas. A Run still has exactly one accepted terminal authority form:

```text
settled manifest XOR typed finite-budget terminal
```

## 2. Supported finite-budget terminals

| Variant | Trusted capture meaning |
| --- | --- |
| Provider request, schema 1 | The 17th request was refused before dispatch under the historical 16-request profile; `17/16/16` attempt/dispatch/response accounting is preserved. |
| Provider request, schema 2 | The 25th request was refused before dispatch under the daily 24-request profile; `25/24/24` accounting is preserved. |
| Combined Token, schema 3 | Authenticated cumulative Session usage crossed the finite Token maximum after an accounted Provider response. |
| Cost, schema 3 | Authenticated cumulative Session cost crossed the finite cost maximum after an accounted Provider response. |
| Simultaneous Token + cost, schema 3 | One accounted Provider response crossed both dimensions; both are retained in the same terminal. |
| Tool call, schema 3 | The next Tool call was refused before execution; attempted, executed, completed, blocked and result counts remain distinct. |
| Clean-boundary wall time, schema 3 | The wall limit was observed only at a tested quiescent boundary with no pending Provider, Tool or side effect. |

## 3. Trusted-generation and reopen conditions

A schema-3 terminal is accepted only when all applicable usage is known and derived from
persisted Pi Session messages; Provider attempts, dispatches and responses reconcile;
Tool attempts, execution, completion, blocking and results reconcile; and pending
Provider reservations, Tool calls and side effects are all zero. Session, Workspace,
Run authority, fixed budget profile, command evidence and Harness diagnostic identities
must match their authenticated digests.

The terminal is write-once and independently revalidated on process reopen. Missing,
duplicate, ambiguous, unrelated, forged, mismatched or tampered artifacts fail closed.
In-flight timeout, crash, unknown usage, response loss and uncertain side effects are not
projected as safe finite-budget terminals.

An authenticated last registered command may retain its exact `PASS` or `FAIL`
observation. That observation applies only to the command: it does not settle or verify
the Run and does not create a formal Outcome.

## 4. Product and authority behavior

Every terminal remains:

```yaml
settled: false
verification: unverified
formal_outcome: null
comparison_eligible: false
adaptation_eligible: false
promotion_eligible: false
```

Session/Run inspection plus Files, Changes and Diff remain available. Export and Discard
remain allowed. Apply is denied by server-side Host authority for every terminal variant;
the failed Session cannot be continued. A clean new Session may be created only from the
current authenticated registered Source. Registered Source bytes and the accepted
Session, Verifier, ChangeSet and Apply authority boundaries are unchanged.

## 5. Attempt 2 gap and historical compatibility

**Fact:** The generic `request_rejected` product gap exposed by Attempt 2 is closed for a
future known, reconciled Token/cost/Tool/clean-wall stop. The deterministic loopback path
returned HTTP `201` with a typed Token terminal at `131073/131072`, and its Apply request
was denied server-side.

**Boundary:** Attempt 2 itself is immutable and was not retried, migrated, rewritten or
relabeled. This maintenance does not claim that Attempt 2 or its original task completed.

**Fact:** Historical Provider-request schema 1 (`17/16/16`) and schema 2 (`25/24/24`)
remain readable, inspectable and tamper-detecting on their original path. Schema 3 is
additive and does not rewrite historical artifacts.

## 6. Verification and audit evidence

Main and the focused audit verified the exact Candidate `f83b23d…`:

| Check | Result |
| --- | --- |
| Strict TypeScript through the existing pinned local compiler | PASS |
| Browser JavaScript syntax | PASS |
| Finite-terminal and legacy focused tests | 8 passed, 0 failed, 0 skipped |
| Token/cost pre-Manifest negative test | 1 passed, 0 failed, 0 skipped |
| Narrow V3.6/V3.5 HTTP, API and i18n regressions | 10 passed, 0 failed, 0 skipped |
| Existing live-Docker normal two-Turn regression, after Docker Engine readiness | 1 passed, 0 failed |
| Registered fixture Source blob | unchanged: `852c8803f85891e6298daddb353e0885e4a33221` |
| Fixed Pi checkout | exact `027a5847…`, clean |
| Focused independent audit | `PASS_POST_V3_6_FINITE_BUDGET_TERMINALIZATION_FOCUSED_AUDIT` |

The audit found no source correction requirement. Its scope covered capture-phase truth,
finite accounting and quiescence, Session/Run/Workspace/authority/command lineage,
terminal/Manifest exclusivity, legacy compatibility, tamper rejection, safe projection,
Apply denial, failed-Session continuation denial and Source immutability.

Exact verification commands, all run from the repository root unless noted:

```text
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p .runs/post-v3-6-finite-budget-terminalization/tooling/tsconfig.json --noEmit
  exit 0

node --check workbench/src/webui/static/app.js
  exit 0

node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 workbench/tests/v36-finite-budget-terminalization.test.ts workbench/tests/v36-budget-stop-terminalization.test.ts
  exit 0; 8 passed, 0 failed, 0 skipped

node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 --test-name-pattern="final assistant response" workbench/tests/v36g2-bounded-session-api.test.ts
  exit 0; 1 passed, 0 failed, 0 skipped

node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 workbench/tests/v36g1-http-ui.test.ts workbench/tests/v35g3-i18n.test.ts workbench/tests/v35g3-application-api.test.ts
  exit 0; 10 passed, 0 failed, 0 skipped

node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 --test-name-pattern="bounded-edit two-Turn" workbench/tests/v36g2-bounded-session-api.test.ts
  exit 0 after Main restored the already-installed Docker Desktop Engine; 1 passed, 0 failed
```

The complete command/evidence index is preserved in
`POST_V3_6_FINITE_BUDGET_TERMINALIZATION_IMPLEMENTATION_REPORT.md`; the independent
recheck is preserved in
`POST_V3_6_FINITE_BUDGET_TERMINALIZATION_FOCUSED_AUDIT_REPORT.md`.

The package-level `npm run typecheck` command remains unable to find its ignored
historical `.runs/v0-a` compiler path in a detached worktree. Equivalent strict
TypeScript passed with the existing pinned local compiler. This pre-existing tooling-path
issue is recorded and was not converted into new maintenance scope.

## 7. Remaining limits and non-claims

- No Credential, external network, external Provider or real model was accessed.
- No UX Attempt 3, real task rerun, Retry, Resume, Fallback, Replacement or automatic continuation occurred.
- No budget value, Agent Loop, Pi Core, Verifier/Outcome, Session, ChangeSet, registered Source or Apply authority changed.
- This does not prove any budget is universally optimal.
- It does not terminalize arbitrary timeout, crash, unknown usage, post-dispatch response loss or uncertain side effects.
- A registered command `PASS` does not mean the Run settled, the changes are verified, or a formal Outcome exists.
- It does not prove same-Session recovery, Apply success, V4 behavior or a broader durable-workflow capability.

## 8. Final control state

```yaml
V3_6: closed_accepted
maintenance_goal: closed_accepted
active_goal: null
next_goal: null_not_authorized
attempt_3: not_run_not_authorized
engineering_stabilization_loop: not_started_not_authorized
V4: not_started_not_authorized
```

The implementation-owned
`POST_V3_6_FINITE_BUDGET_TERMINALIZATION_CLOSEOUT_DRAFT.md` remains immutable historical
handoff evidence and is superseded as authority by this formal Main-owned Closeout.
