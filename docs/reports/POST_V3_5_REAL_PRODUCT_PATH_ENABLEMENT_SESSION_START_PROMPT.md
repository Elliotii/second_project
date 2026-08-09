# Post-V3.5 Real Product Path Enablement Session Start Prompt

```yaml
status: ready_for_new_top_level_session
date: 2026-08-10
kind: bounded_post_closeout_product_maintenance
source_baseline: e4e64d148d07ea5ed189365486fecbb525b78af9
planning_baseline_commit: supplied_and_pinned_by_main_in_launch_message
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
implementation_authorized: false_pending_explicit_new_session_launch
real_model_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
pi_modification_authorized: false
git_commit_authorized: false
smoke_test_execution_authorized: false
```

You are the new top-level `Post-V3.5 Real Product Path Enablement` implementation
Session. This is a zero-real-call maintenance slice that prepares the accepted V3.5
Workbench for the separately authorized Product Smoke Test. It is not V3.6/V4 and does
not reopen V3.5.

## Required reading

Read completely, in order:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/reports/V3_5_CLOSEOUT.md`;
4. `docs/reports/V3_5_G3_CLOSEOUT.md`;
5. `docs/reports/POST_V3_5_PRODUCT_SMOKE_TEST_PLAN.md`;
6. `docs/第二项目_Codex交接包_2026-07-30/V3_5_CHARTER.md`;
7. the relevant current source named by the Plan, especially:
   - `workbench/scripts/start-v35g3-demo.ts`;
   - `workbench/src/session/persistent-session-v35.ts`;
   - `workbench/src/webui/application-v35g3.ts`;
   - `workbench/src/webui/server-v35g3.ts`;
   - `workbench/src/pi/pi-adapter-v3.ts`;
   - `workbench/src/pi/pi-adapter-v35g25.ts`;
   - `workbench/src/pi/runtime-profile-v3.ts`;
   - `workbench/src/pi/tool-profile.ts`;
   - `workbench/src/verifier/runner.ts`;
   - the affected contracts, inspectors and tests.

When inspecting the pinned Pi checkout, first read every applicable Pi `AGENTS.md`.
Use only public emitted Pi entry points and tests as Pi evidence.

## Gate A — identity and readiness

The Main launch message must supply the exact Planning Baseline Commit SHA. Before
editing:

1. confirm HEAD is exactly the launch-pinned Planning Baseline Commit;
2. confirm its first parent is `e4e64d148d07ea5ed189365486fecbb525b78af9` and its
   tree delta contains only this Prompt and
   `POST_V3_5_PRODUCT_SMOKE_TEST_PLAN.md`;
3. confirm tracked files are clean;
4. confirm pinned Pi is exactly
   `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
5. confirm emitted public Pi artifacts used by
   `workbench/scripts/v35g2-public-pi-loader.mjs` exist;
6. confirm the current WebUI route is deterministic/Faux and does not already provide the
   requested real persistent product path;
7. record the factual source symbols that require the bounded maintenance.

If any identity differs, stop without editing and report it. Do not use the historical
`D:\AI\AI_Projects\project2` checkout as product source merely because it owns ignored
runtime artifacts.

## Objective

Create the smallest zero-call candidate that will later allow one real product Session to
perform two settled coding turns across a full server restart while preserving safe
inspection:

```text
host-authorized real mode
→ public JsonlSessionRepo Session
→ Direct AgentHarness + fixed DeepSeek profile
→ bounded coding Tools and frozen public_test
→ settled Run
→ external Verifier / Outcome
→ immutable Session↔Run evidence
→ safe Read Model / WebUI projection
→ process restart
→ same Session context used in the next turn
```

All implementation verification in this Session must use deterministic/Faux or injected
test doubles. Do not resolve a Credential or make a network/model call.

## Binding design boundaries

The candidate must:

- preserve `npm run v35g3:demo` as the zero-access default;
- add an explicit host-selected real-smoke mode rather than browser-selected Provider or
  Credential input;
- reuse public `JsonlSessionRepo`, Direct `AgentHarness`, the fixed DeepSeek profile,
  existing Provider authority/opaque resolver boundary, bounded Tool Profile, external
  Verifier runner and evidence writers;
- keep `Session != Run` and keep the catalog as navigation metadata;
- support workspace-scoped read/list/search/edit/write plus only frozen logical command
  descriptors; never accept arbitrary shell text from the browser;
- allow real counters in a versioned ordinary-Run contract without weakening the existing
  deterministic manifest checks;
- record one settled event, closed Tool lifecycle, real usage counters, Verifier/Outcome,
  Session↔Run identity and safe provider-observed prior-context identity;
- permit the next process to reopen the same Pi Session and create a new Run;
- expose ordinary Run Verifier/Outcome, binding/no-binding and context-reconstruction facts
  through the safe Read Model;
- keep raw Session, raw Provider payload, Credential and private reasoning out of HTTP/UI
  responses and tracked evidence;
- retain loopback-only fixed routes and opaque browser identifiers;
- leave V2/V3/V3.5 accepted comparison, State, Verifier and Promotion authority unchanged.

Prefer an injected turn execution strategy or another thin adapter over copying the whole
Goal 2.5 Pair runtime. Do not reuse Goal 2.5 as the Smoke Test route.

## Minimum zero-call tests

Add focused deterministic tests for:

1. Faux default remains unchanged and zero-access;
2. real mode cannot start without explicit host authority and an opaque resolver;
3. browser requests cannot supply Provider, Credential, filesystem roots, arbitrary
   commands or Verifier source;
4. a fake real-mode turn records nonzero simulated counters without exposing secrets;
5. write/edit and `public_test` are confined to a frozen workspace/task policy;
6. Verifier/Outcome are attached only after settled Tool closure;
7. process A/process B reopen reconstructs the exact prior context prefix and associates two
   Runs with one Session;
8. safe views expose the reconstruction proof and ordinary Verifier/Outcome while rejecting
   raw/unsafe data;
9. corrupt identity, Workspace mismatch, path escape and evidence mismatch fail closed;
10. affected Goal 1 and Goal 3 regressions remain green.

Tests must inject fake Credential/Provider behavior in memory. A test must fail if the
environment resolver or external network is touched.

## Allowed changes

Only the smallest affected Workbench contracts, Session/runtime adapter, host launcher,
safe Read Model/API/UI fields, package scripts, focused tests and this Session's report may
change. A small generated smoke fixture may be placed under ignored `.runs/` only.

Ordinary TypeScript, path, serialization, HTTP and test defects may be fixed in this same
Session without creating another Stage or Session.

## Forbidden actions

- no Credential read, `.env.g005` content inspection, external network or real model;
- no Pi patch, private import, dependency install or SDK/Extension/RPC switch;
- no actual Product Smoke Test, Goal 2/2.5 execution or historical Skill activation;
- no Retry, fallback, replacement, extra Case or adaptive treatment;
- no State/Promotion/Verifier authority change;
- no arbitrary command, shell, artifact-download or State-mutation HTTP route;
- no `CURRENT_STATE.md`, accepted Closeout, Charter or ADR modification;
- no Git stage or commit;
- no V3.6/V4 design or implementation.

## Hard stops

Stop and report before expanding scope if:

- public Pi settled Session continuation cannot support the real path without Pi changes or
  private imports;
- safe provider-observed context proof would require persisting raw payload/private
  reasoning;
- ordinary Run Verifier/Outcome cannot be added without changing accepted authority
  semantics;
- browser or persisted config would need to contain a Credential;
- the path requires replacing Direct `AgentHarness` or reusing Goal 2.5 Pair semantics;
- an explicit correctness defect contradicts an accepted V3/V3.5 claim;
- more than one material architecture correction is required.

## Deliverables and stop point

Create:

```text
docs/reports/POST_V3_5_REAL_PRODUCT_PATH_ENABLEMENT_REPORT.md
```

The report must include:

- Gate A facts;
- selected minimal design and rejected alternatives;
- Source Delta;
- exact commands, exit codes and test counts;
- zero Credential/network/Provider/model evidence;
- exact proposed real startup command and required host-only arguments;
- expected budget/counter behavior;
- remaining unverified real facts;
- whether the candidate is ready for Main review and a separate real Smoke authorization;
- any hard stop or accepted-claim impact.

Do not claim the real journey passed. Stop after zero-call implementation, tests and report,
leaving the worktree uncommitted for Main/user review and separate commit authority.
