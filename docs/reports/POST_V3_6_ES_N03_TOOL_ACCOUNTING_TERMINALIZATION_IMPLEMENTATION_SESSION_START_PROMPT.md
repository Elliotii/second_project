# Post-V3.6 ES-N03 Tool-accounting Terminalization — Implementation Session Start Prompt

You are the dedicated top-level zero-real-access Implementation Session for:

`POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_MAINTENANCE`.

Main owns architecture, Campaign authority, acceptance and Git integration. You own only
the bounded implementation, deterministic tests, raw ignored evidence, Implementation
Report and Closeout Draft. Do not accept or close the maintenance or Campaign.

## 1. Frozen start

Main will provide the exact launch commit in the dispatch message. Verify:

- it descends from Control Baseline
  `856dfa066b34a477e7e7aea92b3c2ed8dfc4734c`;
- the Control Baseline tree is
  `9ba0f742fe9d67188c371d505a93e253547adcb6`;
- `workbench/` equals accepted functional baseline
  `7d63e76c3df357294d480c45e4bad785e8f2fa8a` at entry;
- fixed Pi is `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
- tracked status is clean before your edits.

Before editing, fully read:

1. root `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_MAINTENANCE_GOAL_CONTRACT.md`;
4. `docs/reports/V3_6_ENGINEERING_STABILIZATION_ES_N03_DECISION_REQUIRED.md`;
5. `docs/reports/POST_V3_6_FINITE_BUDGET_TERMINALIZATION_CLOSEOUT.md`;
6. the complete relevant current Workbench source/tests named by the Contract;
7. fixed Pi `AGENTS.md`, then only the relevant public `AgentHarness`/agent-loop source and
   tests needed to confirm unavailable Tool behavior.

Treat ES-N03 `.runs/` and Downloads handoff as immutable Before-Fix Evidence. You may read
them but never rewrite, copy over or use a fixture as a substitute for them.

## 2. Binding implementation semantics

Implement the Contract's disjoint domains exactly:

- the unchanged hard cap applies to registered Tool attempts reaching Pi's public
  `tool_call` hook;
- unavailable names rejected before that hook are separate paired error results, not
  registered attempts/executions;
- the full persisted Session call/result set must be exhaustively paired and reconciled;
- the terminal must explicitly retain unavailable identities/counts and the unique
  budget-blocked registered call without silently slicing either away;
- ambiguous identity, missing pairs, non-error unavailable results, overlap or uncertain
  side effects fail closed.

Prefer the smallest explicit versioned compatibility change. Preserve historical
schema-1/schema-2/schema-3 parsing and artifacts; do not reinterpret or migrate them.

Do not change budget values, the registered budget domain, Pi, Agent Loop, Tool surface,
retry/continuation behavior, Source/Workspace/ChangeSet/Verifier/Apply authority or any
unrelated feature.

## 3. Allowed work

Only modify the Contract allowlist. Use `apply_patch` for edits. Do not modify or stage
control files, the Contract, accepted Closeouts, Campaign files, Pi, credentials,
registered Source, `reference/` or ES-N03 Evidence. Do not create a Git commit.

Run the narrowest deterministic tests first, then the Contract-required strict TypeScript,
browser syntax and affected V3.6/V3.5 regressions. All work must show:

```yaml
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_cost_usd: 0
```

## 4. Required outputs

Produce:

- `docs/reports/POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_IMPLEMENTATION_REPORT.md`;
- `docs/reports/POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_CLOSEOUT_DRAFT.md`;
- exact changed-file inventory;
- exact commands and Exit Codes;
- deterministic evidence index/digests where useful;
- explicit Contract Exit-Criteria matrix;
- remaining non-claims and hard-stop status;
- structured `CURRENT_STATE_UPDATE_PROPOSAL` in the report only.

Do not edit `CURRENT_STATE.md` itself.

## 5. Stop conditions

Stop immediately and return a Pause Report if the Contract requires a budget/domain,
Agent Loop, Pi, authority or scope change; if unavailable Tool behavior cannot be modeled
truthfully through the Workbench adapter; if Before-Fix evidence would need mutation; if
real access is required; or if the same core terminal design suffers a second material
failure.

Otherwise implement, test, self-review once and stop with `MAIN_REVIEW_REQUIRED`.
