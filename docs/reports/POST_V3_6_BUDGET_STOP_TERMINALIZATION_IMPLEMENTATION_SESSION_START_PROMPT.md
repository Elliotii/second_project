# Post-V3.6 Budget-stop Terminalization Maintenance — Implementation Session Start Prompt

You are the one new top-level zero-real-access Implementation Session for:

```text
POST_V3_6_BUDGET_STOP_TERMINALIZATION_MAINTENANCE
```

Start only from exact Control Baseline:

```text
1564361a1fd952d38fc58f08202b4fb89950ed07
tree 210ed728c795fa4d18e85e3cee48af4ee475bced
```

## Required read order

Before changing anything, verify the exact baseline and tracked cleanliness, then read:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/POST_V3_6_BUDGET_STOP_TERMINALIZATION_MAINTENANCE_GOAL_CONTRACT.md` completely;
4. `docs/第二项目_Codex交接包_2026-07-30/V3_6_CHARTER.md` only as accepted architecture authority;
5. `docs/reports/V3_6_CLOSEOUT.md` and `docs/reports/POST_V3_6_PRODUCTIZATION_POLISH_REPORT.md`;
6. the Contract-relevant current V3.6 source and tests;
7. only the bounded mature local terminal pattern in
   `workbench/src/pi/pi-adapter-v35g25.ts`,
   `workbench/src/contracts/v35g25-types.ts`, and
   `workbench/tests/v35g25-termination-safe.test.ts`.

Do not reinterpret or reopen V3.6. The V3.5 Goal 2.5 files are reference patterns only;
do not port their Pair, Verifier or experiment contracts.

## Execute the Contract

Implement the smallest additive change that makes the exact local 17th pre-dispatch
Provider-request attempt produce immutable typed non-settled terminal evidence and keeps
the Session/Run/managed changes safely inspectable.

Required behavior includes:

- exact stop classification and 17 attempts / 16 dispatches / 16 responses;
- zero pending Provider reservations, Tool calls and side effects;
- known usage and registered-command terminal truth;
- strict settled-manifest xor budget-stop-terminal inspection;
- safe Session/Run/WebUI projection with the real reason and used/max budget;
- `unverified`, `formal_outcome:null`, all eligibility false;
- inspectable Files/Changes/Diff;
- Export and Discard allowed, Apply All fail-closed;
- a clean new Session only from authenticated registered Source, never continuation of
  the failed Session or promotion of its managed copy;
- fail-closed tamper/ambiguity/non-budget handling;
- existing settled V3.6 behavior unchanged.

Use zero Credential reads, network, Provider/model calls and real-model calls. Do not
install dependencies, modify Pi, change the 16-request cap, retry the real task, create a
new Case, modify accepted control files, or broaden into general recovery/transactions.

Ordinary TypeScript, test, fixture, serialization, HTTP and UI defects are normal work:
fix them within the allowlist and continue. Stop immediately on a Contract Hard Stop.

## Verification and deliverables

Run the narrow focused tests first, then strict TypeScript and only the affected accepted
regressions needed by the Contract. Record exact commands and exit codes.

Produce:

- Contract-bounded source and tests;
- `docs/reports/POST_V3_6_BUDGET_STOP_TERMINALIZATION_IMPLEMENTATION_REPORT.md`;
- `docs/reports/POST_V3_6_BUDGET_STOP_TERMINALIZATION_CLOSEOUT_DRAFT.md`;
- exact Source Delta and test result summary;
- a structured `CURRENT_STATE_UPDATE_PROPOSAL` inside the Implementation Report;
- an explicit list of anything unverified.

Do not modify or stage `CURRENT_STATE.md`, `AGENTS.md`, the Contract, Charter or accepted
Closeouts. Do not create a Git commit. When all work is complete, stop and return the
report to Main for light review and Candidate creation.
