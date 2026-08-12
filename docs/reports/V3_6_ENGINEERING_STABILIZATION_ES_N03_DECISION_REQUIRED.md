# V3.6 Engineering Stabilization ES-N03 — Decision Required

```yaml
status: paused_decision_required
campaign_id: V3_6_ENGINEERING_STABILIZATION_CAMPAIGN
case_id: ES_N03
finding_id: ES_N03_F1_001
primary_classification: F1_Harness_Correctness_Bug
secondary_classification:
  - F2_Failure_Inspectability_Terminalization_Gap
  - F4_Agent_Model_Inefficiency
main_disposition: ACCEPT_FAILURE_EVIDENCE_AND_PAUSE_CAMPAIGN
external_handoff_sha256: c7d39ae34ef54d09c19e22a9886361651b4d3aed71f80beb651ad8f4e7d559d3
next_case_authorized: false
maintenance_authorized: false
retest_authorized: false
budget_change_recommended: false
```

## Observed evidence

**Fact:** ES-N03 started from the frozen Main commit, unchanged registered Source, a
fresh data root and one clean Product Session. Its only dispatch returned generic HTTP
400 `request_rejected` after the Agent partially changed the managed Workspace.

**Fact:** The Session contains 26 Tool calls and 26 Tool Results. One request used the
unavailable name `read_tool`; the final `workspace_read` was blocked with the internal
diagnostic `V36_RECONCILED_FINITE_BUDGET_EXHAUSTED: tool_call_budget_exhausted`.

**Fact:** There is no `result.json`, Runtime Manifest, `budget-stop.json`, Docker command
evidence or immutable ChangeSet. Session list/detail also return generic rejection. The
Workspace remains read-only inspectable only when its Session ID is already known.

**Fact:** No tests ran in the formal Run. There was no completion claim, Apply, Discard,
Retry, Fallback, Replacement, continuation or budget change. Registered Source retained
the 14-file linear digest
`fe94e4e28ea907df3feb1609a4a4a309b82dd099c8fa8cde40ddfe6a44705f8a`.
Port `43139` and managed Docker containers were clean after shutdown.

## Root-cause confidence

**Fact:** `PersistentInteractiveSessionServiceV36.runBoundedTurn()` increments its local
`toolCallAttempts` only through the registered `tool_call` hook. The accepted schema-3
terminal then requires Session-derived Tool call/result counts to equal that local count.

**Fact:** the unavailable `read_tool` was persisted by Pi with its Tool Result, but it did
not enter the registered-tool hook counter. The later budget-blocked registered call did
enter that counter. The resulting domains are therefore 26 persisted calls versus an
inferred 25 registered attempts (24 executed plus one budget-blocked).

**Inference — high confidence:** this count-domain mismatch made
`reconcileFiniteBudgetTerminalSession()` reject the otherwise recognized Tool-budget stop
before `budget-stop.json` could be written. The HTTP boundary then reduced that internal
failure to generic `request_rejected`.

The exact responsible symbols are:

- `workbench/src/session/persistent-session-v36.ts` —
  `PersistentInteractiveSessionServiceV36.runBoundedTurn()`;
- the `harness.on("tool_call", ...)` attempt counter;
- `reconcileFiniteBudgetTerminalSession()`;
- `parseFiniteBudgetStopTerminal()` and its one-blocked-call invariant.

## Why Main must stop

This is not a request-cap adequacy question. Provider requests were 12/24, combined tokens
66,541/131,072, cost USD `0.001768312`/0.20 and wall time about 30/900 seconds. The Agent
trajectory was inefficient and exhausted the Tool budget before tests, but blocking that
attempt was correct.

The product defect is that a known finite-budget stop did not become the accepted typed,
persistent and inspectable terminal. This is the same core terminalization/inspectability
class that already received one maintenance, although ES-N03 revealed a new unavailable-
Tool count variant. The Campaign's Decision Required Gate explicitly requires Main to
stop when the same Finding class naturally repeats after maintenance or when terminal
authority semantics need another change.

## Options

### Option A — bounded compatibility maintenance (recommended)

Authorize one narrow, zero-real-call maintenance Goal that:

1. freezes the canonical accounting relationship among all persisted Tool requests,
   registered Tool executions, unavailable/unregistered Tool Results and the final
   budget-blocked Tool request;
2. terminalizes this quiescent finite-budget variant without weakening evidence
   reconciliation or silently dropping a persisted Tool identity;
3. restores authenticated Session list/detail plus Diff/Export/Discard while Apply stays
   server-side denied and registered Source remains immutable;
4. adds deterministic regression for an unavailable Tool before a Tool-budget stop and
   retains all existing schema-1/schema-2/schema-3 compatibility tests;
5. uses one bounded Implementation Session, Main review and one focused read-only audit
   because budget/stop/evidence authority is affected;
6. after accepted maintenance, permits exactly one separately recorded ES-N03 Retest with
   the same task, Source, registered command and unchanged daily budget profile.

This option does **not** authorize a higher Tool cap, Agent-loop change, automatic Retry,
continuation, replacement, Pi modification or a generalized crash/durable-workflow system.

### Option B — defer and close with a known defect

Keep ES-N03 immutable, record that unknown/unavailable Tool calls can prevent truthful
Tool-budget terminalization, perform no Retest and close the Campaign as not fully stable
on this boundary. This is honest but leaves a concrete accepted-semantics correctness gap
in the user-facing product, so Main does not recommend it while Option A remains bounded.

### Option C — continue unrelated natural Cases first

Not recommended and not currently permitted. It would leave an active F1/F2 Decision
Required unresolved and weaken the one-Case-at-a-time Campaign discipline.

## Smallest safe recommendation

Choose Option A. Freeze budget values and the Agent Loop; repair only the Tool accounting
and typed-terminal projection seam revealed by ES-N03. The deterministic fixture must
exercise the unavailable Tool identity explicitly, because the prior faux Tool-budget test
covered only registered tools and therefore could not reveal this mismatch.

## Risks and what remains if deferred

- A careless fix could exclude persisted unknown calls from evidence, weaken fail-closed
  reconciliation or misstate `tool_calls_blocked`.
- Expanding the terminal schema without a compatibility rule could break existing
  schema-1/schema-2/schema-3 evidence.
- Raising the cap would merely postpone the failure and would not fix inspectability.
- If deferred, any real task that emits an unavailable Tool before later exhausting the
  Tool budget may again become a generic, undiscoverable failed Session.

No ES-N04, maintenance, audit or Retest may begin until the user decides.
