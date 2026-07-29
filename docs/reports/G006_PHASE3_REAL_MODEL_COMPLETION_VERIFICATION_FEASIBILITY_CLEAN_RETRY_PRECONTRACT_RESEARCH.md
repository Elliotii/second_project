# G006 Phase 3 Real-model Completion Verification Clean Retry — Pre-contract Research

Date: 2026-07-29  
Research status: complete  
Goal status after this report: draft candidate only; not active  
Real-model calls performed by this research: 0

## 1. Research question and authority boundary

This report answers one bounded question:

> After G005 was closed as `INVALID_G005_EVIDENCE`, what must be fixed,
> frozen and reviewed before a clean G006 retry can produce interpretable
> Baseline / Candidate evidence without changing the task, model, Policy or Pi
> architecture?

This is pre-contract research, not G006 execution. It authorizes no code,
`.runs/g006`, dependency setup, provider call, Pi modification, formal
Workbench, or Git commit.

Evidence priority used here:

1. preserved G005 evidence and accepted G005 closeout;
2. pinned local Pi source at
   `027a5847901b5dde30270abaa1041046cd2b4b55`;
3. pinned Pi tests and public emitted-package shape;
4. the accepted Phase 3 plan and G005 Contract;
5. current official DeepSeek documentation for time-sensitive API facts;
6. inference and recommendation.

## 2. Executive conclusion

**Fact.** G005 did not establish a Pi/DeepSeek route failure. Its Baseline
completed four authenticated provider responses, three Tool/ToolResult
round-trips, a final response and settlement. The external Verifier did not run
and Candidate did not start.

**Fact.** The invalidity came from two project-side evidence defects:

1. `after_provider_response` was registered through `AgentHarness.on(...)`,
   while the pinned implementation emits it through `emitOwn(...)`, which
   reaches only `subscribe(...)` listeners;
2. Journal payload fields were spread into the envelope after the intended
   event `type`, so a payload such as `{ type: "thinking" }` overwrote the
   outer event type.

**Recommendation.** G006 should be a clean retry with the same experimental
inputs as G005 and only these behaviorally relevant implementation deltas:

- observe response events in the single public `subscribe(...)` stream;
- use a schema-versioned Journal envelope with nested payload data so envelope
  fields cannot be overwritten.

G006 should also enforce requirements that G005 already intended but failed to
freeze before the first call:

- pre-call hashes for Driver, Tools, Verifier, fixture and all tracked G006
  implementation files;
- a tested error-attribution decision table that cannot classify an Observer
  mismatch as a route failure;
- a mandatory Main Session source review, explicit implementation-baseline
  commit and exact clean `HEAD` check before any real-model call.

**Recommendation.** Use two authorization stages. Contract acceptance must not
by itself authorize a real-model request.

## 3. What remains frozen from G005

The following conditions should not change in G006:

| Dimension | Frozen value |
| --- | --- |
| Runtime candidate | direct public emitted `pi-agent-core` `AgentHarness` |
| Pi commit | `027a5847901b5dde30270abaa1041046cd2b4b55` |
| Pi Core patches | 0 |
| Provider | public `deepseekProvider()`; OpenAI Chat Completions |
| Model | `deepseek-v4-flash` |
| Thinking | `high`; payload `thinking.type=enabled`, `reasoning_effort=high` |
| Output cap | `max_tokens=8192` |
| Provider retries | 0 |
| Task | `parseDuration` fixed micro TypeScript task |
| Initial fixture | public-pass / external-verifier-fail |
| Tools | fixed read, source-write and public-test tools only |
| Verifier | same deterministic public + external acceptance suite |
| Baseline | one settled cycle, one Verifier, then stop |
| Candidate | same initial cycle; at most one verifier-triggered recovery |
| Pair count | exactly one Baseline and one Candidate attempt |
| Policy claim | mechanism feasibility only; no effectiveness claim |
| Environment | Windows-native PowerShell; no WSL |
| Package boundary | standard emitted `pi-ai` and `pi-agent-core` packages |

Changing any of these after a provider call would make the clean retry
uninterpretable. A need to change one before a call must return to the Main
Session rather than being chosen by the execution session.

## 4. Defect 1 — provider-response observation

### 4.1 Pinned source facts

**Fact.** In
`.upstream/pi/packages/agent/src/harness/agent-harness.ts`,
`AgentHarness.createStreamFn()` installs an `onResponse` callback on
`Models.streamSimple()`. That callback constructs an
`after_provider_response` event and calls `AgentHarness.emitOwn()`.

**Fact.** In the same file, `emitOwn()` enumerates only handlers registered
under the `"*"` subscriber key. `AgentHarness.subscribe(...)` registers under
that key. `AgentHarness.on(type, ...)` registers under the named event key and
is used only by the `emitHook(...)` paths.

**Fact.** In
`.upstream/pi/packages/agent/src/harness/types.ts`,
`AfterProviderResponseEvent` is included in `AgentHarnessOwnEvent`, and
`AgentHarnessEventResultMap` contains `after_provider_response: undefined`.
Consequently the public type surface permits
`harness.on("after_provider_response", ...)` even though that handler is not
invoked by the actual `emitOwn()` path.

**Inference.** This is a pinned Pi observability semantic inconsistency, but it
does not block the direct route because `subscribe(...)` is public and receives
the event. G006 does not require a Pi Core patch.

### 4.2 G005 project defect

**Fact.** `spikes/pi-runtime/g005/driver.ts`, inside `runVariant()`, increments
`providerResponses` from
`harness.on("after_provider_response", ...)` and later requires that count to
be non-zero.

**Fact.** Preserved G005 evidence independently contains four assistant
responses with response IDs and usage, but the named-hook counter remained
zero.

**Inference.** The G005 `FAIL_REAL_MODEL_ROUTE` raw disposition was a false
negative produced by the Observer.

### 4.3 Minimum G006 correction and regression

G006 should:

1. remove the named `on("after_provider_response")` registration;
2. handle `event.type === "after_provider_response"` in the same
   `subscribe(...)` listener that records assistant, Tool and settled events;
3. use the public emitted Faux Provider to make two deterministic provider
   turns, including one Tool/ToolResult turn;
4. assert `faux.state.callCount === subscriberResponseCount === 2` and that the
   observed response statuses are the expected synthetic statuses;
5. assert the correlation with assistant messages and settlement.

The pinned Faux Provider is suitable because
`.upstream/pi/packages/ai/src/providers/faux.ts`, `createFauxCore()`, invokes
`streamOptions.onResponse({ status: 200, headers: {} }, model)` once per Faux
provider request. The package export wildcard exposes the emitted
`providers/faux` entry, and G003 already proved public Faux consumption through
the emitted package boundary.

The test should exercise the actual public callback path. Manually injecting a
synthetic `AgentHarnessEvent` into project code would be weaker evidence.

## 5. Defect 2 — Journal envelope collision

### 5.1 G005 project fact

`spikes/pi-runtime/g005/driver.ts` constructs entries as:

```ts
{ seq, timestamp, type, runId, sessionId, cycle, ...fields }
```

`ReasoningRecord` and `ToolAuditRecord` both contain their own `type` fields.
Spreading those records last changes intended outer event types such as
`reasoning_metadata` and `tool_side_effect` into `thinking` and
`source_write`.

### 5.2 Minimum G006 correction

Use a versioned, closed envelope:

```ts
type JournalEntry = {
  schemaVersion: 2;
  seq: number;
  timestamp: string;
  type: JournalEventType;
  runId: string;
  sessionId: string;
  cycle: Cycle;
  data: Record<string, unknown>;
};
```

All event-specific content belongs under `data`. Reasoning and side-effect
records may retain their own domain `type`, but only as nested data. The
Journal builder must not accept a flat `Partial<JournalEntry>` payload.

Required offline regression:

- create a `reasoning_metadata` entry with nested domain
  `{ type: "thinking" }`;
- create a `tool_side_effect` entry with nested domain
  `{ type: "source_write" }`;
- serialize and parse each entry;
- assert the outer event types remain stable and the nested domain types remain
  available;
- assert sequence and correlation fields cannot be supplied by payload data.

This is a schema correction, not a new Trace platform.

## 6. Additional evidence gaps found during research

### 6.1 Implementation identity was post-hoc

**Fact.** The G005 Contract required verifier and tool implementation hashes in
Gate E. The initial G005 manifests did not include Driver, Tool, Verifier or
full tracked Spike identities. Those hashes were calculated read-only during
closeout after the invalid run.

**Recommendation.** G006 must compute a complete tracked source inventory and
tree digest before the first provider call, write them into both initial
manifests, and re-compute them immediately before Baseline and Candidate. Any
drift is `INVALID_G006_EVIDENCE` and prohibits the call.

This is enforcement of the original provenance requirement, not expansion of
the experimental Policy.

### 6.2 Error ownership was under-specified

**Fact.** G005 mapped all route-assertion failures to
`FAIL_REAL_MODEL_ROUTE`, including an Observer counter mismatch contradicted by
assistant-message evidence.

**Recommendation.** G006 needs a frozen decision table:

| Observed condition | Classification | Disposition |
| --- | --- | --- |
| Instrument counters contradict preserved provider/assistant evidence | instrumentation/evidence | `INVALID_G006_EVIDENCE` |
| Initial state, source identity or configuration drifts | fairness/evidence | `INVALID_G006_EVIDENCE` |
| Credential/model/service/network/rate/quota failure | external service | `BLOCKED_G006_SETUP_OR_EXTERNAL_SERVICE` |
| Valid instrumentation shows the frozen public provider/tool/session route cannot complete | route | `FAIL_REAL_MODEL_ROUTE` |
| Model completes route but produces verifier-failing code | task outcome | preserve as valid outcome; do not relabel route |
| Both variants finish under the contract, regardless of pass/fail outcome | valid mechanism evidence | `PASS_REAL_MODEL_FEASIBILITY` |

The first two rows should be covered by pure offline tests before a call.

### 6.3 Preflight and attempt evidence need separate roots

**Recommendation.** Stage 1 may create `.runs/g006/preflight/` and a fresh
isolated `.runs/g006/pi` for offline validation. The real paired attempt should
use a separate write-once `.runs/g006/attempt-001/` root that must be absent at
the clean-HEAD checkpoint. This avoids confusing Gate 0 artifacts with model
attempt evidence and prevents an accidental rerun from appending to a prior
attempt.

### 6.4 Final secret scan must exist before success

G005 only completed a paused partial scan. G006 should include its secret-scan
implementation in the pre-call source inventory and require a final scan over
tracked G006 code, attempt evidence and both workspaces. Only configured status,
file count and match count may be recorded.

## 7. Current DeepSeek API recheck

Official pages checked on 2026-07-29:

- <https://api-docs.deepseek.com/updates/>
- <https://api-docs.deepseek.com/api/create-chat-completion>
- <https://api-docs.deepseek.com/guides/thinking_mode>
- <https://api-docs.deepseek.com/quick_start/agent_integrations/pi_mono/>
- <https://api-docs.deepseek.com/quick_start/pricing/>

**Fact.** The official API still lists `deepseek-v4-flash` and
`deepseek-v4-pro`, keeps `https://api.deepseek.com`, supports OpenAI Chat
Completions, Tool Calls, `thinking.type`, `reasoning_effort` values `high` and
`max`, and `max_tokens`.

**Fact.** Thinking mode requires `reasoning_content` to be returned in context
after an assistant Tool Call. The G005 partial run observed this replay through
the pinned Pi route without persisting the private reasoning body.

**Fact.** The official pricing page currently lists V4 Flash cache-hit input
`$0.0028`, cache-miss input `$0.14`, and output `$0.28` per 1M tokens.

**Known external documentation inconsistency.** The official Pi integration
example currently shows V4 Flash `cacheRead: 0.028`, while the official pricing
page shows `0.0028`. Pricing is metadata, not a request-behavior input. G006
should use the pricing page as the rate authority, record the retrieval time,
and must not change task, model, budgets or disposition because of a pricing
documentation mismatch.

**Recommendation.** No model or API change is needed for the retry. Recheck
these facts at the Stage 2 checkpoint because they are external and
time-sensitive.

## 8. Proposed two-stage authorization

### Stage 1 — Gate 0 implementation and offline proof

After the user separately accepts and activates the Contract, Stage 1 may:

- create `spikes/pi-runtime/g006/` by copying the frozen G005 implementation
  and applying only goal/path identity changes plus the two approved fixes;
- create a fresh isolated G006 Pi setup and preflight root;
- run emitted-package import, strict consumer, fixture, redaction, Faux
  Observer, Journal schema, attribution and provenance tests;
- write a Gate 0 review report;
- stop before `.runs/g006/attempt-001`, credentials or provider calls.

It may not commit without explicit user authorization.

### Mandatory checkpoint

The Main Session reviews the complete G006 source delta and Gate 0 evidence.
The user must then explicitly authorize the clean implementation-baseline Git
commit. After the commit, the project records exact `HEAD` and verifies status
is clean except the already accepted untracked `reference/` tree.

### Stage 2 — one real paired attempt

Stage 2 requires a separate explicit user authorization after the clean-HEAD
checkpoint. Only then may the execution session create
`.runs/g006/attempt-001/`, load the existing ignored `.env.g005` as a local
credential carrier, and make the contracted model calls.

The earlier G005 permission was consumed by G005 and must not be interpreted as
open-ended G006 call authority.

## 9. G006 Gate structure recommended by this research

| Gate | Purpose | Provider calls allowed |
| --- | --- | ---: |
| Gate 0 | fixes, source freeze machinery and offline regressions | 0 |
| Gate A | clean HEAD, fresh attempt root, public imports, credential boolean and current API facts | 0 |
| Gate B | one Baseline real-model run and external Verifier | bounded by G005 budgets |
| Gate C | one Candidate run and conditional single recovery | bounded by G005 budgets |
| Gate D | response/tool/session/reasoning/journal correlation | no extra calls |
| Gate E | parity, provenance, budgets, immutable evidence and secret scan | no extra calls |

Gate 0 is a pre-model correctness gate, not a new Policy evaluation.

## 10. Research sufficiency decision

**Recommendation.** No additional Deep Research or Claude Code source-study
session is needed before drafting or Stage 1 implementation.

Reasons:

- both defects are directly demonstrated by local G005 code and pinned Pi
  dispatch behavior;
- the required regression path is exposed by Pi's own public Faux Provider;
- no ambiguous mature Harness mechanism is being adopted;
- no Session, durability, compaction, permission, subagent or general Tool
  Runtime architecture is changing;
- current external model facts have been rechecked from primary official
  sources.

Additional research becomes justified only if Stage 1 reveals a new public API
uncertainty, emitted-package incompatibility or need to change the frozen
experimental surface. That condition should pause G006 rather than broaden it.

## 11. Final recommendation

Draft G006 as a two-stage, same-input clean retry. Do not activate it as part of
the drafting action. The draft should require:

1. no mutation or backfill of G005 code/evidence;
2. a new `spikes/pi-runtime/g006/` implementation identity;
3. Gate 0 fixes and offline regressions before credentials or model use;
4. full source hashes before the first call;
5. Main Session review and explicit clean-baseline commit;
6. separate Stage 2 real-model authorization;
7. exactly one fresh Baseline/Candidate pair;
8. precise evidence/external-service/route/task-outcome attribution;
9. no Policy-effect claim from one pair;
10. no Pi Core patch, Workbench, G004 revival or unrelated reliability work.

This report supports Contract drafting only. It does not itself activate G006.
