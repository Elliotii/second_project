# Post-V3.5 Product Smoke Test Plan

```yaml
status: completed_and_closed
date: 2026-08-10
kind: post_closeout_product_smoke_plan
reopens_v3_5: false
starts_v3_6_or_v4: false
product_source_baseline: e4e64d148d07ea5ed189365486fecbb525b78af9
goal_3_implementation: b5c34033a4ff64d2bacd01279823611193834920
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
real_model_calls_authorized_by_this_plan: 0
source_changes_authorized_by_this_plan: 0
current_real_product_journey_readiness: passed
accepted_by_user_for_next_step: 2026-08-10
zero_call_enablement_preparation_authorized: true
real_smoke_execution_authorized: authorized_separately_and_consumed
real_smoke_execution_completed: true
real_smoke_report: docs/reports/POST_V3_5_PRODUCT_SMOKE_TEST_REPORT.md
```

## 1. Purpose and non-goals

The future `Product Smoke Test & Maintenance Session` should test one natural product
journey rather than re-evaluate a Harness mechanism:

```text
start local Workbench
→ create a persistent Session
→ complete one small real coding Run
→ inspect Session / Run / Tool / Verifier / Harness evidence
→ stop the actual server process
→ restart the product
→ reopen the same Session
→ complete a context-dependent real follow-up Run
→ inspect the two-Run history and evidence
```

The main new observation sought is real-model, cross-process settled Session continuation.
The result is post-closeout product evidence. It does not reopen V3.5, create a new Eval
version, or authorize a new Portfolio claim automatically.

This test does not:

- run or reinterpret Goal 2 / Goal 2.5 adaptive-Skill A/B;
- activate historical Skill State or change the current State pointer;
- add a Router, Curator, Memory, Vector DB, Experience Repository, realtime architecture,
  IDE, multi-user or remote service;
- change Pi, Verifier authority, State/Promotion authority or Direct `AgentHarness` route;
- treat user feedback as statistical or causal evidence.

## 2. Frozen V3.5 baseline

The execution Session must start from the exact product source commit
`e4e64d148d07ea5ed189365486fecbb525b78af9`. Goal 3 implementation is
`b5c34033a4ff64d2bacd01279823611193834920`. Pi remains fixed at
`027a5847901b5dde30270abaa1041046cd2b4b55` with zero Pi Core patches.

The current Main worktree containing the accepted product baseline is:

```text
C:\Users\HUAWEI\.codex\worktrees\g25main\project2
```

`D:\AI\AI_Projects\project2` is not the product-source baseline: at planning time it is a
historical `main` checkout at `de75ca7a4d5376713f01ca475bc5ad7637c70443` with unrelated
user changes. It must not be used as the Smoke Test source checkout and must not be cleaned,
rewritten or merged implicitly.

The accepted loader currently obtains emitted public Pi packages from:

```text
D:\AI\AI_Projects\project2\.runs\g006\pi
```

That checkout was verified at the pinned Pi commit and clean. The execution Session must
verify this identity read-only before use. It must not install into or edit that checkout.

Generated Smoke Test work must stay under an ignored root such as:

```text
<execution-checkout>\.runs\post-v3-5-product-smoke\<smoke-id>\
```

It must not reuse V3.5 Goal 2/2.5 workspaces or evidence roots.

## 3. Actual startup and readiness facts

### 3.1 Observed prerequisites

- `workbench/package.json` requires Node `>=22.19.0`.
- Planning-time host versions were Node `v24.14.1` and npm `11.11.0`.
- No `npm install` is part of the accepted startup path.
- `workbench/scripts/v35g2-public-pi-loader.mjs` maps public Pi package imports to the
  emitted packages in the pinned `.runs/g006/pi` checkout.
- The credential template names `DEEPSEEK_API_KEY`. A real local credential file exists as
  `D:\AI\AI_Projects\project2\.env.g005`; it must be read opaquely only after separate
  real-execution authorization. Its content must never be printed, copied into evidence,
  placed in a browser request or committed.
- The fixed reusable real profile is DeepSeek `deepseek-v4-flash`, no fallback, no retry,
  through the existing `GOAL3_DEEPSEEK_PROVIDER_PROFILE_V3` composition.

Preflight commands, all read-only:

```powershell
git rev-parse HEAD
git status --short
node --version
npm.cmd --version
git -C D:\AI\AI_Projects\project2\.runs\g006\pi rev-parse HEAD
git -C D:\AI\AI_Projects\project2\.runs\g006\pi status --short
Test-Path D:\AI\AI_Projects\project2\.runs\g006\pi\packages\agent\dist\index.js
Test-Path D:\AI\AI_Projects\project2\.runs\g006\pi\packages\ai\dist\providers\deepseek.js
Test-Path D:\AI\AI_Projects\project2\.env.g005
```

Expected Git/Pi identities are the SHAs frozen above. The product checkout must have no
tracked source delta before smoke preparation. The untracked `reference/` and ignored
`.runs/` boundaries must remain untouched.

### 3.2 Exact currently available product command

From `<execution-checkout>\workbench`:

```powershell
npm.cmd run v35g3:demo -- --port 43135 `
  --data-root <smoke-root>\data `
  --workspace-root <smoke-root>\workspace
```

The actual URL is:

```text
http://127.0.0.1:43135
```

The startup event explicitly reports `mode: deterministic_faux_demo`. Current routes are
fixed local routes for overview, Session list/detail/create/continue, V2/Goal 2.5
comparison, adaptation and State history.

### 3.3 Binding readiness finding

**Fact:** the accepted V3.5 baseline does not currently expose a real coding-task product
entry. `PersistentSessionServiceV35.executeTurn()`:

- constructs a Faux Provider internally;
- uses a read-only Tool Profile with no writable paths or commands;
- records and accepts only zero Credential/network/Provider/model counters;
- creates no ordinary-Run external Verifier/Outcome evidence.

The WebUI `POST /api/v1/sessions/:id/turns` calls that exact deterministic service. The
existing real DeepSeek ports belong to bounded V3 or Goal 2.5 execution paths; Goal 2.5 is
explicitly excluded and neither path is a reusable real persistent WebUI continuation
entry.

Therefore the full requested Product Smoke Test is **not executable on the frozen baseline
without an additional bounded product-path enablement**. There is no honest real startup
command to place in this plan today.

This is consistent with the accepted V3.5 limitation “real-model persistent Session
continuation remains future product work.” It is not, by itself, a defect contradicting the
accepted V3.5 claims.

## 4. Product Readiness Gate before any Credential read

The future Session must execute this Gate before Phase A and before reading a Credential:

1. Confirm the exact source and Pi identities.
2. Confirm whether a post-plan, Main/user-authorized real product entry now exists.
3. Trace its Session create/open/continue call chain to public `JsonlSessionRepo` and Direct
   `AgentHarness`.
4. Confirm it supplies bounded write/edit/read/list/search and one frozen `public_test`
   command only within the smoke workspace.
5. Confirm ordinary Run evidence records real counters, Tool lifecycle, external Verifier,
   Outcome, Session linkage and provider-observed prior-context identity.
6. Confirm the WebUI receives only safe projections and no Credential/raw Session/private
   reasoning.
7. Confirm the exact real startup command, URL, stop method and budget before dispatch.

If no separately authorized real product entry exists, disposition is:

```text
BLOCKED_BEFORE_SMOKE_REAL_PRODUCT_ENTRY_MISSING
```

The Session must write the factual readiness result and return to Main/user. It must not
read the Credential, call the network, run Goal 2.5 as a substitute, or silently implement
the missing path under “ordinary maintenance.”

A future bounded enablement may reuse public Pi Session persistence, the fixed DeepSeek
composition, bounded Tool Profile, external Verifier runner, Run/evidence writers and the
existing WebUI application boundary. It must preserve the Faux demo as the safe default.
Because it changes the accepted product execution path and Run schema, that enablement
requires explicit Main/user authorization even if it remains post-closeout maintenance
rather than V3.6/V4.

## 5. Recommended smoke-test workspace and task

After the Readiness Gate passes, create a fresh ignored, install-free ESM workspace with:

```text
package.json
src/parse-retry-after.mjs
test/parse-retry-after.test.mjs
```

Use Node's built-in test runner. Freeze an external verifier outside the model-readable
workspace. The Tool Profile should permit only:

- reading/searching/listing the workspace;
- editing/writing `src/**` and `test/**`;
- the logical command `public_test` mapped to `node --test`;
- no repository Git commands, shell text, dependency installation or access outside the
  workspace.

### Turn 1

Ask the agent to implement `parseRetryAfter(value, nowMs)` with a small documented contract:

- non-negative integer seconds become milliseconds;
- a valid HTTP date becomes `max(0, date - nowMs)`;
- invalid values return `null`;
- run the frozen public tests.

The Turn 1 prompt also gives one generated opaque continuation marker, for example
`context-<random-id>`, and says to remember it for the Session but not write it to the
workspace during Turn 1. Store the expected marker only in the host-owned Smoke Manifest
and the Pi Session, never in the initial Workspace or follow-up prompt.

### Turn 2

After a full process stop and restart, use the same Session and ask:

> 基于刚才的实现，导出我们先前约定的 continuation marker，并增加相关 edge-case
> test；不要让我重新说明 marker，同时保持第一轮 API 和测试通过。

The exact marker is deliberately omitted. The frozen second verifier checks the original
API, new edge behavior and exact marker. This is a product smoke canary, not a Skill
treatment or benchmark.

Before the first real dispatch, freeze and hash:

- initial Workspace tree;
- both user prompts, with the marker held in a protected host Manifest;
- Tool Profile and command descriptor;
- provider/model and whole-smoke budget;
- both verifier programs;
- Session/project/workspace identity.

Recommended future execution envelope, pending separate authorization:

```yaml
real_arms: 0
real_session_turns: 2
retry: 0
fallback: 0
replacement: 0
provider_requests_total_max: 16
tool_calls_total_max: 24
combined_tokens_total_max: 131072
cost_usd_total_max: 0.20
wall_time_total_max_minutes: 30
```

The test is about completing the natural journey, not consuming the budget. Any change to
these limits must occur before the first dispatch.

## 6. Phase A — Startup

After Readiness passes, start the exact authorized real-product launcher as one directly
tracked hidden Node process, redirecting stdout/stderr to `<smoke-root>\logs`. Do not start
through an untracked chain of terminals. The command name must come from the authorized
implementation; the current `v35g3:demo` command is not sufficient.

Expected observations:

- binds only `127.0.0.1` on the frozen port;
- reports `real_product_smoke` or another explicit non-Faux mode;
- WebUI loads without a startup or console error;
- initial Session list is empty for the fresh smoke data root;
- no Credential is returned by overview/API responses.

Record the exact command, source commit, PID, URL, startup event and HTTP status. If the
launcher reports Faux/demo mode, stop before Credential access.

## 7. Phase B — First real Session

1. In the WebUI create the frozen opaque Session ID and title.
2. Submit Turn 1 through the product task surface.
3. Allow exactly one real settled Run under the frozen budget.
4. Run the frozen external verifier once after the Agent turn becomes settled.
5. Confirm the marker is absent from the Workspace after Turn 1.

Expected observations:

- one Pi JSONL Session and one immutable Run identity;
- real Direct Pi/model route and bounded Tool events;
- `settled` exactly once with no pending Tool/side-effect state;
- external Verifier and Outcome are linked to the Run;
- the public test passes;
- Credential/call/token/cost counters are present but Credential bytes are absent;
- State binding is explicit as none/not_applicable unless an already accepted binding
  genuinely matches. No historical Skill is activated for the smoke.

## 8. Phase C — Product inspection

The user should manually inspect:

1. **Session:** title, identity, conversation and safe Tool events.
2. **Run:** Run ID, settled state, timestamps and Session linkage.
3. **Trace:** Tool request/result order and bounded counters.
4. **Verifier / Outcome:** frozen verifier identity and factual result.
5. **Compare:** ordinary Run should show `not_applicable`; historical V2/Goal 2.5 views may
   remain available but must not be rerun or reinterpreted.
6. **Adaptation:** `not_applicable`/historical-only unless real evidence applies.
7. **Harness State:** active identity and no mutation.
8. **Applied State / Why Applied:** explicit no-match/not-applied or a genuine accepted
   binding explanation; never invented adaptation.

The Product Smoke Session records objective availability and correctness. The user records
whether the experience feels natural and understandable.

## 9. Phase D — Hard process stop

Stop the actual tracked server PID, not just the tab. The launcher should be a direct Node
process so one PID owns the HTTP listener.

Verification commands:

```powershell
Stop-Process -Id <recorded-pid>
Get-Process -Id <recorded-pid> -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort <port> -State Listen -ErrorAction SilentlyContinue
```

Pass requires no process result and no listener. Record stop time, PID and the empty checks.
Do not delete the data root, Session JSONL, Workspace or Run evidence.

## 10. Phase E — Restart and reopen

Restart the same frozen product command with the same data root, workspace root,
project/workspace identity and a newly recorded PID.

Expected observations:

- the prior Session is listed under the same Session ID;
- the prior conversation and safe Tool history are available;
- the prior Run ID and Run/evidence linkage remain available;
- the prior Verifier/Outcome projection agrees with authoritative artifacts;
- no catalog entry, Run or State identity is regenerated or silently rewritten.

## 11. Phase F — Real follow-up continuation

Submit Turn 2 in the reopened Session and execute one bounded real Run plus its frozen
verifier.

UI history alone is not continuation proof. Pass requires both:

### Structural proof

- before shutdown, record the Pi Session entry-prefix count and digest;
- after reopen, `session.buildContext()` reconstructs that exact prefix;
- the first real Provider payload for Turn 2 records a safe prefix identity/digest matching
  the pre-stop Session context;
- Run 2 records the same Session ID, distinct Run ID, prior Run reference and a
  `context_reconstructed: true` equivalent derived from authenticated evidence;
- Tool-call and Tool-result relationships survive the restart.

No raw Provider payload, private reasoning or Credential is persisted for this proof.

### Behavioral proof

- Turn 2 prompt does not contain the marker;
- the marker was absent from the Workspace before Turn 2;
- the agent writes the exact prior-session marker required by the frozen verifier;
- all Turn 1 and Turn 2 tests pass.

Structural proof is mandatory. The marker is a secondary user-visible canary and cannot
replace the provider-observed context identity.

## 12. Phase G — Final inspection

The user and Session inspect:

- two distinct Runs under one unchanged Session identity;
- ordered conversation and Tool history across restart;
- both Verifier/Outcome records;
- prior-context reconstruction evidence for Run 2;
- unchanged State authority and explicit binding/no-binding explanation;
- `not_applicable` for comparison/adaptation fields that do not apply;
- final Workspace and verifier result.

Then stop the second server PID and re-run the process/listener checks. Unset the
process-local Credential environment and do not persist its value.

## 13. Objective evidence to record

Under `<smoke-root>\evidence`, record only safe data:

- exact source/Pi SHAs and initial tracked status;
- startup/restart commands with secrets omitted;
- both PIDs, URLs, timestamps, exit codes and listener checks;
- Smoke Manifest and all frozen digests;
- Session ID/reference, entry counts and prefix digests;
- two Run IDs/manifests and Session↔Run links;
- safe Tool lifecycle projections;
- Verifier/Outcome identities and exit codes;
- real request/token/Tool/cost counters;
- structural prior-context proof;
- marker result without Credential or private reasoning;
- screenshots or browser observations with safe data only;
- source delta and any maintenance commit.

Generated evidence stays ignored. Only the final report and an explicitly authorized
ordinary maintenance commit may be tracked.

## 14. User feedback categories

The Session presents facts and asks the user to supply separate feedback under:

```text
A. Bug
   Functionality is wrong.

B. UX Problem
   Functionality works, but the interaction is unnatural or inconvenient.

C. Comprehension Problem
   Data exists, but the Harness behavior is difficult to understand.

D. Nice-to-have
   The journey works without it; it may improve future usability.
```

The Session must not infer the user's subjective experience from test output.

## 15. Allowed maintenance fixes

After the real Product Readiness Gate has passed, the Product Smoke Test Session may fix
ordinary bounded product defects such as:

- UI rendering, session title/order and navigation;
- missing already-authorized safe projection fields;
- broken local links;
- small API serialization errors;
- startup-script, layout, display-formatting or polling defects.

Flow:

```text
diagnose → focused fix → focused test → bounded maintenance commit → resume at affected phase
```

It must preserve already-created evidence and may not rewrite an observed failure. Adding
the currently missing real persistent execution route, changing Run schema/authority,
changing credential boundaries or adding a Tool/Verifier execution contract is **not** an
ordinary fix under this plan and requires Main/user authorization first.

## 16. Hard stops

Stop and return factual evidence if:

- the Product Readiness Gate remains blocked;
- the reopened real Session does not restore prior Agent context;
- Session↔Run identity is wrong or catalog navigation overrides an authority artifact;
- continuation needs a Pi Core patch/private import or a Runtime route switch;
- raw/full Session, Credential, private reasoning or unsafe Provider data reaches WebUI;
- Read Model contradicts authoritative Session/Run/Verifier/State evidence;
- WebUI bypasses Verifier, State or Promotion authority;
- a concrete correctness defect contradicts an accepted V3/V3.5 claim;
- the first real turn or follow-up hits the frozen budget/terminal boundary;
- a Retry, fallback, replacement, extra task, Skill treatment or outcome-driven fixture
  change would be needed.

Ordinary CSS, rendering, serialization and display defects are not hard stops unless they
hide or alter authoritative facts.

## 17. Final report format

The future Session must create:

```text
docs/reports/POST_V3_5_PRODUCT_SMOKE_TEST_REPORT.md
```

Recommended structure:

1. baseline and authority;
2. Product Readiness Gate result;
3. tested journey and exact commands;
4. Phase A–G pass/fail table;
5. restart/reopen/real-context structural proof;
6. behavioral continuation marker result;
7. Session/Run/Tool/Verifier/State evidence index;
8. real access, tokens and cost;
9. bugs and ordinary maintenance fixes;
10. unresolved issues and hard stops;
11. impact, if any, on accepted V3/V3.5 claims;
12. final maintenance commit or `none`;
13. explicit note that user UX/comprehension feedback is separate.

If readiness is blocked, the report may stop after Sections 1–2 and the factual missing
path analysis. It must not report a Product Smoke pass.

## 18. Handoff to Main Session

The Product Smoke Test Session returns:

- the final report path;
- exact tested source/maintenance commit;
- Phase A–G disposition or readiness-block disposition;
- evidence root and safe evidence index;
- bugs fixed and unresolved hard stops;
- a structured `CURRENT_STATE_UPDATE_PROPOSAL` only if a concrete accepted-claim issue was
  found.

It must not modify `CURRENT_STATE.md`, reopen V3.5, create V3.6/V4, or make architecture
acceptance decisions. Main Session and user decide whether any finding is merely product
maintenance, a documentation correction, or input to a future version.

## 19. Suggested execution Session role

Create one new top-level task titled:

```text
Post-V3.5 Product Smoke Test & Maintenance
```

Its role is:

```text
read this plan
→ run Product Readiness Gate
→ guide actual product use when ready
→ record objective facts
→ repair only authorized ordinary product bugs
→ write the report
→ stop for Main/user review
```

It is not a new-version architect, Harness researcher or Eval owner. On the current frozen
baseline, its first expected result is the readiness block unless Main/user separately
authorizes and freezes the missing bounded real-product entry before execution.
