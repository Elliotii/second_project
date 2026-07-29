# Pi Source Map — G001

> Frozen basis: `earendil-works/pi` commit
> `027a5847901b5dde30270abaa1041046cd2b4b55` (post-`v0.82.1` main
> snapshot, package version `0.82.1`). This map records static source and test
> evidence only; no dependency was installed and no build or test was run.

## Evidence conventions

- **Fact** — directly present in the pinned source, manifest, documentation, or
  tests.
- **Inference** — a consequence of one or more facts, not an upstream guarantee.
- **Recommendation** — a project choice based on the evidence.
- **Unconfirmed** — requires G002 execution or upstream clarification.

Paths beginning with `.upstream/pi/` are pinned local evidence. Line numbers
refer to the frozen commit.

## Package and entry-point inventory

| Surface | Public entry point | Key public symbols | Responsibility | Primary evidence |
|---|---|---|---|---|
| `@earendil-works/pi-ai` | package root and provider subpaths | `Models`, `Model`, `streamSimple`, assistant message/event/usage types | Provider/model catalog and streaming protocol used by both Agent and AgentHarness | `.upstream/pi/packages/agent/src/harness/agent-harness.ts:1-9` imports; provider use in `AgentHarness.createStreamFn` at `:402-440` |
| `@earendil-works/pi-agent-core` | `.` | `Agent`, low-level agent loop, `AgentHarness`, session repos/storage, compaction, harness tools and types | Browser-neutral agent loop plus the new direct harness and session abstraction | `.upstream/pi/packages/agent/package.json` `exports["."]`; `.upstream/pi/packages/agent/src/index.ts` exports; `AgentHarness` at `src/harness/agent-harness.ts:171` |
| `@earendil-works/pi-agent-core/node` | `./node` | `NodeExecutionEnv` plus root exports | Node filesystem and shell implementation for harness tools/session storage | `.upstream/pi/packages/agent/package.json` `exports["./node"]`; `.upstream/pi/packages/agent/src/node.ts`; `NodeExecutionEnv` at `src/harness/env/nodejs.ts:344` |
| `@earendil-works/pi-coding-agent` | `.` | `createAgentSession`, `AgentSession`, `AgentSessionRuntime`, `DefaultResourceLoader`, `SessionManager`, extension API, tool factories, run modes | Mature coding-agent application/SDK with resource discovery, extensions, built-in tools, retries and auto-compaction | `.upstream/pi/packages/coding-agent/package.json`; `.upstream/pi/packages/coding-agent/src/index.ts`; `CreateAgentSessionOptions` at `src/core/sdk.ts:38-85`; `createAgentSession` at `:169` |
| Coding Agent RPC | `./rpc-entry`, also public symbols from package root | `runRpcMode`, `RpcClient`, `RpcCommand`, `RpcResponse`, `RpcSessionState` | JSONL stdin/stdout process integration over an `AgentSessionRuntime` | `.upstream/pi/packages/coding-agent/package.json` `exports["./rpc-entry"]`; `.upstream/pi/packages/coding-agent/src/modes/rpc/rpc-types.ts`; `runRpcMode` in `rpc-mode.ts` |

**Fact.** `AgentHarness` is reachable from the published package root, not
only from an internal source path: `src/index.ts` re-exports
`./harness/agent-harness.ts` and the harness types/session/tool modules.
However, the upstream design document still calls the lifecycle work “In
progress”, says exact `settled` timing is under review, and lists durable
recovery as planned (`.upstream/pi/packages/agent/docs/agent-harness.md:270-390`).

**Inference.** “Publicly exported” and “semantically frozen” are different:
the direct surface is consumable without an internal import, but its lifecycle
and durability contracts should be treated as pre-stable until G002 and an
upstream-version policy say otherwise.

## Direct AgentHarness map

| Area | Symbol(s) | Responsibility | Matching test evidence |
|---|---|---|---|
| Construction/config | `AgentHarness`, `AgentHarnessOptions` | Explicit `Session`, `Models`, model, tool registry, active tools, tool context, system prompt, resources, queue modes and stream options | `agent-harness.test.ts:93` constructs directly; `:314` verifies save-point refresh; `agent-harness-stream.test.ts:39` verifies request snapshots |
| Non-interactive execution | `prompt`, `skill`, `promptFromTemplate` | Starts a direct low-level loop and returns the last assistant message | implementation `agent-harness.ts:658-702`; direct faux-provider tests throughout `agent-harness.test.ts` |
| External completion boundary | `prompt`, `waitForIdle`, `settled` | `agent_end` flushes pending writes, emits awaited listeners, then `settled`; the public run promise resolves after the prompt call unwinds | `agent-harness.ts:538-564, 651-669, 1054-1056`; `agent-harness.test.ts:408` verifies `waitForIdle` includes awaited listeners |
| Queues/continuation | `steer`, `followUp`, `nextTurn` | Queues messages during a run or for the next explicit run | `agent-harness.ts:703-722`; tests at `agent-harness.test.ts:188,242` |
| Same-session feedback | `appendMessage`, `prompt` | Appends an external message at idle or defers it while busy; another prompt builds context from the same `Session` | `agent-harness.ts:724-735, 354-389`; pending-write order test at `agent-harness.test.ts:378` |
| Raw lifecycle | inherited `AgentEvent` through `subscribe` | `agent_start/end`, `turn_start/end`, message stream, `tool_execution_start/update/end` | `src/types.ts` `AgentEvent`; event generation in `agent-loop.ts:95-270, 281-336, 388, 446, 501, 765`; direct subscription at `agent-harness.ts:1058` |
| Actionable hooks | `on("before_agent_start" | "context" | "tool_call" | "tool_result" | provider/session events)` | Prompt/context transforms, tool block/result patch/terminate, provider request/payload hooks, compaction/tree hooks | event types at `harness/types.ts:584-713`; tool hook test `agent-harness.test.ts:439`; payload-chain test `agent-harness-stream.test.ts:178` |
| Session tree | `Session`, `SessionStorage`, `JsonlSessionRepo`, `JsonlSessionStorage`, memory variants | Append-only entries with parent IDs and durable leaf changes; build active context and fork/open sessions | `session.ts:150-364`; JSONL repo `jsonl-repo.ts:38-159`; tests `session.test.ts:25,43,212`, `storage.test.ts:256,282,324` |
| Workspace/runtime | `ExecutionEnv`, `NodeExecutionEnv`, `createBashTool`, read/write/edit tools | Host-supplied CWD, shell, environment and filesystem capabilities; tools receive a per-turn context snapshot | `harness/types.ts` `ExecutionEnv`; `nodejs.ts:237,344-498`; context-provider test `agent-harness.test.ts:525`; Node environment tests in `nodejs-env.test.ts` |
| Compaction | `prepareCompaction`, `compact`, `AgentHarness.compact` | Explicit lossy summary persisted as a compaction entry; context rebuild keeps the summary and retained tail | `compaction/compaction.ts`; `agent-harness.ts:738-787`; `session.ts:37-87`; tests `compaction.test.ts` and `agent-harness.test.ts:562` |

### Public versus implementation detail

- **Fact — public contract:** package exports, exported classes/interfaces,
  `AgentHarness` methods, `Session`/repo/storage interfaces, event unions and
  tool factories are reachable through the declared package entry points.
- **Fact — implementation detail:** `createTurnState`, `executeTurn`,
  `handleAgentEvent`, pending-write arrays, queue-drain mechanics and
  `runAgentLoop` orchestration inside the harness are private even though the
  separate low-level loop functions are also exported.
- **Recommendation:** the Workbench adapter should use `AgentHarness`,
  `Session`/repo, public events/hooks, and `NodeExecutionEnv`; it should not
  import private harness files or depend on private phase/queue internals.

## Low-level Agent/loop map

| Symbol | Role | Material boundary |
|---|---|---|
| `runAgentLoop`, `runAgentLoopContinue` | Async lifecycle driver | Emits the lifecycle in awaited order and returns newly produced messages (`agent-loop.ts:95,120`) |
| `runLoop` | Model/tool/follow-up loop | Distinguishes assistant stop reason, tool continuation, steering, follow-up, and final `agent_end` (`agent-loop.ts:155-270`) |
| `streamAssistantResponse` | Provider stream reducer | Converts/transforms context, forwards abort signal, emits message start/update/end, returns final assistant message (`agent-loop.ts:281-363`) |
| `executeToolCallsSequential/Parallel` | Tool batch engine | Emits start before validation/execution, runs hooks, emits end, then tool-result message artifacts (`agent-loop.ts:433-556,765`) |
| `Agent` | Stateful compatibility wrapper | Owns transcript and queue state, exposes `prompt`, `continue`, `abort`, `waitForIdle`; `AgentHarness` deliberately calls `runAgentLoop` directly | `.upstream/pi/packages/agent/src/agent.ts`; harness call at `agent-harness.ts:613-622` |

**Fact.** `AgentHarness` no longer depends on `Agent`; it directly owns the
loop, session persistence, queue draining and provider wrapper. The upstream
implementation notes mark this item done
(`.upstream/pi/packages/agent/docs/agent-harness.md:437-453`).

## Coding Agent SDK + Inline Extension map

| Area | Symbol(s) | Responsibility | Evidence |
|---|---|---|---|
| SDK construction | `createAgentSession`, `CreateAgentSessionOptions` | Resolves CWD, model/auth/settings, resources, session manager, built-in/custom tools and creates `AgentSession` | `src/core/sdk.ts:38-85,169+`; `sdk-session-manager.test.ts` verifies explicit manager/CWD/tool binding |
| Runtime replacement | `AgentSessionRuntime`, `createAgentSessionRuntime` | Rebuilds cwd-bound services for new/resumed/forked sessions, aborting and disposing the old runtime | `src/core/agent-session-runtime.ts`; lifecycle tests in `agent-session-runtime-events.test.ts` |
| Full settled boundary | `AgentSession.prompt`, `_runAgentPrompt`, `agent_settled`, `waitForIdle` | Runs core Agent, then coding-agent retry/compaction/queued continuation loop, finally emits `agent_settled` | `agent-session.ts:1061-1103,1114-1265,1542-1553`; event type `:139-180` |
| Extension events | `ExtensionAPI.on`, `AgentSettledEvent`, tool/context/provider/session events | Inline or file extensions observe/transform the mature coding-agent lifecycle | `extensions/types.ts:669-740, 853-940, 1185-1231` |
| Inline extension loading | `InlineExtension`, `DefaultResourceLoaderOptions.extensionFactories`, `loadExtensionFromFactory` | Injects an extension factory without a disk extension file; requires a configured resource loader | `extensions/types.ts:1494-1505`; `resource-loader.ts:125-160,896-918`; `extensions/loader.ts:482-497` |
| Coding session | `SessionManager` | Synchronous append-only JSONL tree, model/thinking/compaction/custom entries, session ID/CWD header | `session-manager.ts:30-156,844-970,1015-1188,1260-1303` |
| Built-in resilience | `_handlePostAgentRun`, `_checkCompaction`, `_prepareRetry` | Adds automatic provider-error retry and threshold/overflow compaction around core Agent runs | `agent-session.ts:1075-1103,1943-2210,2631-2725` |

**Fact.** The SDK path does not require the TUI: `createAgentSession()` returns
an `AgentSession`, and print/JSON/RPC/TUI are separate run modes. It is still an
application-level runtime with settings, resource discovery, auth and Node
filesystem behavior that the direct harness does not impose.

**Fact.** The Coding Agent session header has `id`, timestamp, CWD and optional
parent session, but no arbitrary metadata field (`session-manager.ts:32-44`). An
external `run_id` can be recorded as a custom entry (`appendCustomEntry` at
`:1121-1133`) or in a separate link record, not losslessly attached to the
header without changing that surface.

## RPC/process map

| Symbol/protocol | Role | Evidence |
|---|---|---|
| `RpcCommand` | Prompt/steer/follow-up/abort, state, model, thinking, compaction, retry, bash and session commands | `.upstream/pi/packages/coding-agent/src/modes/rpc/rpc-types.ts` |
| `RpcResponse` | Correlated success/failure responses | same file; prompt acknowledgement semantics tested at `rpc-prompt-response-semantics.test.ts:187-284` |
| streamed `AgentSessionEvent` | Lifecycle/event channel | `runRpcMode` subscribes to the session and writes JSON lines in `rpc-mode.ts` |
| `RpcClient.waitForIdle` | Waits for `agent_settled` | `.upstream/pi/packages/coding-agent/src/modes/rpc/rpc-client.ts` `waitForIdle`; child-exit rejection test in `rpc-client-process-exit.test.ts` |

**Inference.** RPC preserves the mature `AgentSession` semantics and adds a
process boundary, but not a new stronger session/recovery model. It also adds
JSON serialization, child-process lifecycle, stdout backpressure and command
correlation failure modes. It is therefore an isolation fallback, not the
smallest V0 integration surface.

## Evidence coverage summary

| Audit dimension | Best pinned evidence | Coverage |
|---|---|---|
| Public integration surface | manifests, root indexes, exported types | **confirmed** |
| Non-interactive entry | direct harness and SDK construction/tests | **confirmed** |
| Model/tool/message lifecycle | low-level loop + direct harness tests | **confirmed** |
| Same-process settled boundary | prompt/wait tests and Coding Agent settled loop | **confirmed** |
| Session entry order/tree/context | session/storage sources and tests | **confirmed** |
| Crash recovery of active run/tool/queues | design docs only; implementation absent | **absent** |
| Auto-compaction/agent-turn retry in Direct Harness | explicit compaction only; upstream notes say decision points not implemented | **absent** |
| Host-controlled CWD/env/tool registry | execution environment and tool context | **confirmed**, with no sandbox |
| Exact end-to-end Completion Verification protocol | composable from public calls, not executed in this goal | **unconfirmed** pending G002 |

