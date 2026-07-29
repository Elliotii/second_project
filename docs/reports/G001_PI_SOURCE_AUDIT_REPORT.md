# G001 Pi Source Audit Report

```yaml
goal_id: G001_PI_SOURCE_AUDIT
source_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
source_description: pinned post-v0.82.1 main snapshot
audit_mode: static_read_only
provisional_disposition: ACCEPT_FOR_DYNAMIC_VERIFICATION
final_pi_go: not_authorized
```

## Executive conclusion

**Recommendation — `ACCEPT_FOR_DYNAMIC_VERIFICATION`.** Pi remains a viable
basis for the Agent Harness Reliability Workbench, and the new public Direct
`@earendil-works/pi-agent-core` `AgentHarness` should be the only primary
integration path in a bounded G002 deterministic spike.

**Recommendation.** The previous candidate architecture, **Pi Coding Agent SDK
Runner + Inline Extension, is superseded as the V0 experimental runtime basis
by the post-`v0.82.1` AgentHarness source**. It is not rejected as a Pi feature
path: keep it as a later compatibility check for the real interactive Coding
Agent path after Direct proves the policy boundary. RPC/process remains a
fallback only. Pi No-Go is not justified by current static evidence.

This is not a final Pi Go and does not freeze the V0 architecture or Completion
Verification schema. The architecture/control session must review this package
before authorizing G002.

## Source basis and method

**Fact.** The audit reconfirmed the upstream checkout before source inspection:

```text
HEAD: 027a5847901b5dde30270abaa1041046cd2b4b55
branch status: ## main...origin/main
short status entries: none
```

The checkout is therefore clean and exactly matches the Goal Contract. The
source is a pinned `main` snapshot 40 commits after tag `v0.82.1`, while relevant
package manifests still report `0.82.1`. It must not be described as the tagged
release itself (`docs/research/pi/upstream-snapshot.md`).

**Fact.** G001 read the project controls, the sole upstream `AGENTS.md`, package
manifests/entry points, Direct harness/loop/session/environment/compaction/tool
source, matching harness tests, Coding Agent SDK/session/runtime/extension
source and tests, and RPC protocol/mode/client evidence. No internet source was
needed; local pinned source and tests are the authority.

**Fact.** No dependency was installed; no build/test/lifecycle script was run;
no real model was called; `.upstream/pi` was not modified; no implementation or
`workbench/` directory was created; no commit was made.

## Decision answer

The Goal Contract asks whether V0 should use Direct AgentHarness, retain SDK +
Inline Extension, use RPC, or reject Pi.

| Option | Static decision | Rationale |
|---|---|---|
| Direct `pi-agent-core` `AgentHarness` | **Primary G002 candidate** | Smallest non-interactive public surface; explicit model/tools/env/session; awaited completion boundary; raw lifecycle/tool events; session header run metadata; clean external verifier composition. |
| Coding Agent SDK Runner + Inline Extension | **Superseded for V0 experiment; retained as later comparator** | Mature settled/retry/auto-compaction and real Pi application semantics, but broader settings/auth/resource/extension coupling than Completion Verification needs. |
| RPC/process adapter | **Fallback only** | Preserves Coding Agent semantics and adds isolation potential, but also child/process/JSONL/backpressure/correlation failure modes. No current evidence requires it. |
| Reject Pi / alternative runtime | **Not selected** | No static hard blocker prevents the bounded deterministic protocol. Alternative-runtime work would expand scope before a concrete Pi failure. |

## Detailed findings

### 1. Public integration surface — confirmed/partial

**Fact.** `AgentHarness` is re-exported by the public
`@earendil-works/pi-agent-core` root entry; `NodeExecutionEnv` is provided by the
declared `/node` entry. Construction explicitly requires a `Session`, `Models`,
model and optional tools/resources/system prompt/tool context/stream options
(`.upstream/pi/packages/agent/src/index.ts`;
`packages/agent/src/harness/agent-harness.ts:171-229`;
`packages/agent/src/harness/types.ts:911-958`).

**Fact.** Direct provides `prompt`, skill/template prompt variants, queue
operations, `appendMessage`, explicit `compact`, tree navigation, model/tool/
resource/stream setters, `abort`, `waitForIdle`, subscriptions and typed hooks
(`agent-harness.ts:658-1079`). It has no dependency on TUI state.

**Fact.** Coding Agent exposes a separate non-interactive SDK through
`createAgentSession()` and `AgentSession`, plus public runtime/service helpers,
extension API and tool factories (`packages/coding-agent/src/core/sdk.ts:38-169`;
`src/core/index.ts`). An Inline Extension is a public factory loaded through
`DefaultResourceLoaderOptions.extensionFactories`
(`extensions/types.ts:1494-1505`; `resource-loader.ts:125-160,896-918`).

**Fact.** RPC is a declared package subpath and typed JSONL protocol
(`packages/coding-agent/package.json`; `src/modes/rpc/rpc-types.ts`).

**Partial / risk.** Direct is public but not semantically frozen. Upstream calls
the lifecycle work “In progress”, says exact `settled` timing remains under
review and lists durable recovery as planned
(`packages/agent/docs/agent-harness.md:270-390`). V0 must pin the exact commit
and isolate Pi behind one adapter.

### 2. Lifecycle and events — confirmed, with one constrained boundary

**Fact.** The low-level sequence and exact event union are source-defined:
`agent_start`, `turn_start`, user message events, assistant stream events,
tool start/update/end, tool-result message events, `turn_end`, optional further
turns/queues, and `agent_end`
(`packages/agent/src/types.ts` `AgentEvent`;
`src/agent-loop.ts:95-270,281-363,411-786`).

**Fact.** Model stop is not agent settled. An assistant message may finish
before tools and further turns. Direct `agent_end` closes the loop; the harness
then flushes pending writes, sets idle, awaits `agent_end` subscribers and emits
`settled` (`harness/agent-harness.ts:538-564`). `waitForIdle` includes awaited
listener settlement in the matching test (`test/harness/agent-harness.test.ts:408`).

**Recommendation.** The Workbench must use return from
`await harness.prompt()` as its verifier insertion barrier. It must not reenter
the harness from an `agent_end`/`settled` callback while upstream timing is under
review.

**Fact.** Tool start/end and streamed updates are directly observable. Direct
also exposes `tool_call` and `tool_result` hooks that can block or patch final
results, including termination (`agent-harness.ts:442-484`;
`agent-loop.ts:576-755`; test `agent-harness.test.ts:439`). Context transforms
are directly observable/actionable through `context`; provider request/payload
hooks expose request boundaries.

### 3. Session, storage and replay — partial

**Fact.** Direct JSONL session storage is an append-only tree log with a
version-3 header, arbitrary header metadata, entry IDs/parents/timestamps and a
durable leaf entry (`packages/agent/src/harness/session/jsonl-storage.ts`;
`harness/types.ts:399-551`). It stores transcript messages, model/thinking/tool
configuration changes, compactions, summaries and custom entries. It is a
mixture of transcript, branch state and context snapshots—not a complete event
journal.

**Fact.** Header metadata can attach `run_id` without patching core
(`jsonl-repo.ts:75-89`; metadata round-trip test
`test/harness/storage.test.ts:282`). Repos can reopen/fork sessions and
`Session.buildContext()` reconstructs an active settled branch
(`jsonl-repo.ts:93-159`; `session/session.ts:150-217`).

**Fact.** Compaction transforms future model context and is lossy there, but the
old append-only entries remain in the log. Raw token deltas, tool lifecycle,
queue/provider/settled events are not session entries and require selective
external journal projection.

**Absent.** Direct does not persist accepted prompts as durable operations,
queues, turns, provider requests or tool start/finish. It cannot resume an
in-flight run or safely replay a non-idempotent tool after crash. The upstream
durability documents describe, rather than implement, that target
(`packages/agent/docs/durable-harness.md`; `docs/agent-harness.md:370-390`).

**Inference.** V0 may claim settled-session reopen only after G002 reconstructs
host dependencies and proves it. It may not claim active-run crash recovery.

### 4. Tools, workspace and side effects — confirmed with explicit limitations

**Fact.** Direct tool registry/profile and per-turn tool context are explicit.
`NodeExecutionEnv` receives a CWD plus optional shell path/base environment;
each shell call may override CWD/env and disable inheritance
(`harness/env/nodejs.ts:237-252,344-498`; async context test
`agent-harness.test.ts:525`). This is enough to construct identical Baseline and
Candidate adapters.

**Fact.** Pi has no built-in permission sandbox and runs with launcher authority.
`NodeExecutionEnv` resolves absolute/home paths as well as paths relative to CWD
(`pi/README.md` “Permissions & Containerization”; `nodejs.ts:50-64`). Project
trust controls resource loading, not OS authority.

**Recommendation.** G002 must use disposable fixture directories, identical
canonical environment manifests and external forbidden-path checks. A general
sandbox remains out of scope. The verifier must stay outside the Agent tool
surface.

**Fact / hazard.** A tool can create a side effect before its result is appended.
A crash in that gap is ambiguous and must become `invalid_run`; no automatic
replay is allowed (`packages/agent/docs/durable-harness.md:175-180`).

### 5. Context, compaction, retry and failure — partial

**Fact.** Direct assembles context from the Session at each save point, then
applies the `context` hook and LLM conversion
(`agent-harness.ts:354-389,442-451`; `agent-loop.ts:281-303`). Explicit
compaction and before/after hooks exist and persist summary usage
(`agent-harness.ts:738-787`; test `agent-harness.test.ts:562`).

**Absent.** Direct does not yet invoke automatic compaction decisions during an
agent run, despite exporting token/threshold helpers. It also has no
agent-turn-level retry lifecycle. `streamOptions.maxRetries` can cause
provider-internal retries without Direct per-attempt events; Direct retry events
cover compaction/branch-summary generation only
(`agent-harness.ts:256-274,402-440`; `docs/agent-harness.md:236,332-339`).

**Fact.** Coding Agent supplies automatic retry and threshold/overflow
compaction around core Agent and delays `agent_settled` until those and queued
continuations finish (`packages/coding-agent/src/core/agent-session.ts:1061-1103,
1943-2210,2631-2725`). This strength also creates a fairness hazard if settings
are not pinned.

**Recommendation.** The first Direct spike should use a small context, explicit
provider retry settings and no compaction. It must record these constraints.
Pi Retry and external Agent Cycle must remain distinct.

### 6. Completion Verification insertion — statically traced, dynamically unconfirmed

The clean path requires no core fork:

```text
await Direct prompt(task)                # settled outer boundary
run external deterministic verifier
Baseline: record and stop
Candidate failure only:
  await Direct prompt(structuredFailure) # same harness/session; one Agent Cycle
  run verifier exactly once more
record explicit RunResult and reason
```

**Fact.** Every operation in the trace is public. A second `prompt()` rebuilds
context from the same Session (`agent-harness.ts:354-389,658-669`). The
structured verifier failure should be the second prompt itself; `followUp`
would blur the external cycle boundary, and an extra `appendMessage` plus prompt
would create two user messages.

**Unconfirmed.** G001 did not execute this end to end. G002 must prove exact
call/event/session/verifier ordering, one recovery maximum, and stable config.
See `docs/research/pi/open-questions.md` Q1-Q8.

### 7. Fair-comparison hazards

The following can invalidate a Baseline/Candidate comparison:

1. different initial fixture or environment;
2. different model/thinking/system prompt/tool profile/stream settings;
3. provider-internal retries not recorded or fixed;
4. SDK auto-retry/auto-compaction enabled for only one path;
5. Candidate recovery folded into Pi follow-up rather than a separate external
   Agent Cycle;
6. verifier exposed as a model-callable tool;
7. tool side effect without durable result;
8. raw absolute workspace paths treated as semantic differences;
9. failed persistence/cancellation/verifier execution counted as task failure
   rather than invalid run.

These are **Recommendations** for run validity, not frozen Outcome or Failure
Taxonomy decisions.

## Go/No-Go evaluation

| Plan criterion | G001 result | Evidence/constraint |
|---|---|---|
| fixed task can run programmatically | **confirmed statically** | Direct `prompt()` and tests |
| no hidden TUI dependency | **confirmed** | agent-core Direct surface |
| critical tool lifecycle observable | **confirmed** | raw events + hooks |
| tool result/context postprocessable | **confirmed** | `tool_result`, `context` hooks |
| policy can be toggled | **confirmed by external composition** | Baseline stops; Candidate conditionally submits one prompt |
| deterministic outcome can attach | **confirmed by composition** | verifier is external; G002 exercises it |
| session can link to run | **confirmed** | header metadata + external link |
| workspace controllable for spike | **confirmed with no-sandbox constraint** | explicit `NodeExecutionEnv` |
| no/only narrow core patch | **confirmed statically** | no core patch required for traced path |
| dataflow explainable | **confirmed** | lifecycle/session trace in companion report |

No plan No-Go item is presently established. Specifically, critical events do
not require a large fork, fixed runs do not require TUI, results/context are
postprocessable, verifier insertion is clean, workspace/session link are
controllable, and the spike does not require a large platform.

## Risk register

| Risk | Level | Evidence status | G002/later treatment |
|---|---:|---|---|
| Direct lifecycle contract changes upstream | High | Fact: design in progress | pin commit; one adapter; import smoke check |
| No active-run crash recovery | High | Fact: absent | exclude claim; characterize invalid run later |
| Side effect before result persistence | High | Fact | never auto-replay; invalid-run classification |
| No permission sandbox | High | Fact | disposable workspace + external boundary checks |
| Provider retry opacity | Medium-high | Fact | explicit retry config; record provider attempts when possible |
| No Direct auto-compaction | Medium | Fact | bounded context/no compaction in first spike |
| Reentrant settled timing | Medium | Fact/open upstream | outer sequential driver only |
| Cross-process settled-session reconstruction | Medium | Unconfirmed | targeted G002 reopen test |
| Windows shell cancellation | Medium | Unconfirmed in final adapter | targeted bounded cancellation test |
| SDK parity for real Pi path | Medium | Unconfirmed | conditional comparator after Direct passes |
| RPC process/protocol complexity | Medium | Fact/inference | do not adopt without observed need |

## Bounded G002 plan

G002 should not implement a general Workbench. Its contract should authorize
only the minimum dependency hydration/test execution needed for deterministic
checks and should preserve `.upstream/pi` source as read-only.

### Mandatory sequence

1. **Public import check:** validate only declared root and `/node` exports from
   a locally emitted/packed pinned package.
2. **Direct two-cycle test:** faux provider, one JSONL Session with `run_id`,
   deterministic fail-then-pass verifier, exactly one recovery prompt.
3. **Settled-session reopen:** discard/rebuild the harness and continue the same
   session with validated host dependencies.
4. **Event/journal ordering:** one deterministic tool call/update/result and
   final response, correlated to session entries.
5. **Fairness manifest:** prove normalized Baseline/Candidate inputs/config are
   identical except policy/run identity.
6. **Windows cancellation:** abort one long tool call and prove bounded
   settlement/no unexpected continuation.

Each item is one targeted test; stop at the first failure and report the exact
criterion. Do not add RPC, real providers, a Web UI, database, container,
general sandbox, Eval suite or final schema.

### Conditional sequence

- Run the Coding Agent SDK + Inline Extension comparator only after Direct
  mandatory checks pass, with auto retry/compaction disabled.
- Run RPC only if a specific in-process isolation/cancellation failure appears
  and RPC can be tested against that same failure.
- Characterize child-process crash after side effect only after the normal
  protocol is proven; expected behavior is detection and `invalid_run`, not
  recovery.

Detailed setup intent and pass/fail criteria are in
`docs/research/pi/open-questions.md`.

## Remaining user decisions

G001 does not decide:

- final Pi Go or V0 Version Charter;
- Outcome semantics or Failure Taxonomy;
- recovery budget;
- allowed side-effect/forbidden-path boundary;
- Eval validity and Baseline/Candidate fairness acceptance;
- policy promotion/rollback thresholds.

The immediate decision requested from the architecture/control session is only:
whether to authorize a G002 Goal Contract using the bounded sequence above.

