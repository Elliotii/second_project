# Pi Lifecycle and Session Analysis — G001

> Frozen source: commit `027a5847901b5dde30270abaa1041046cd2b4b55`.
> This is a static reconstruction; all end-to-end statements that require
> execution remain explicitly **Unconfirmed**.

## 1. Direct AgentHarness lifecycle

### 1.1 Prompt to stable external return

**Fact.** `AgentHarness.prompt()` rejects concurrent entry when its private
phase is not idle, sets phase to `turn`, creates a run promise, snapshots the
current session/config/resources/tools, and delegates to `executeTurn`
(`.upstream/pi/packages/agent/src/harness/agent-harness.ts:658-669`,
`createTurnState` at `:354-389`).

The source sequence is:

```text
external await harness.prompt(text)
  -> phase = turn; create run-promise barrier
  -> Session.buildContext() + session metadata + model/tools/env snapshot
  -> before_agent_start hook
  -> runAgentLoop(initial user message, context, config)
       agent_start
       turn_start
       message_start(user)
       message_end(user)       -> harness persists user entry first
       provider stream
         message_start(assistant partial/final)
         message_update*       -> text/thinking/tool-call deltas
         message_end(assistant)-> harness persists assistant entry
       [tool batch, if assistant requested tools]
       turn_end
       [prepareNextTurn/save point]
       [more model turns for tools/steer/follow-up]
       agent_end
  -> harness flushes pending session writes
  -> phase = idle
  -> awaited agent_end subscribers
  -> awaited settled subscribers
  -> executeTurn returns final assistant message
  -> final pending-write flush; run promise resolves
  -> external await returns
```

Evidence: low-level start and loop ordering is in
`packages/agent/src/agent-loop.ts:95-270`; assistant streaming is at
`:281-363`; harness persistence/reduction is in
`packages/agent/src/harness/agent-harness.ts:512-564,581-654`.

**Fact.** An assistant `stopReason` (`stop`, `toolUse`, `length`, `error`,
`aborted`, etc.) is a model-message outcome, not an agent settled signal. A
tool-using message can have completed its provider stream while the loop still
has tool execution and a follow-up model turn. `agent_end` is the final
low-level loop event; Direct `settled` follows pending-write flush and awaited
`agent_end` subscribers (`agent-harness.ts:538-564`).

**Fact.** `waitForIdle()` waits on the run promise, whose resolver is called in
the outer `prompt()` finally block (`agent-harness.ts:332-346,658-669,1054-1056`).
The matching test holds an awaited `agent_end` listener and proves both
`prompt()` and `waitForIdle()` remain pending
(`packages/agent/test/harness/agent-harness.test.ts:408`).

**Inference.** The clean Workbench completion boundary is the return of
`await harness.prompt(...)` (or an already-obtained prompt promise plus
`await harness.waitForIdle()`), not an assistant `message_end`, `turn_end`, or
a callback that sees `phase === idle`.

**Constraint.** Upstream notes explicitly say exact `settled` timing and
listener/hook reentrancy are still under review
(`packages/agent/docs/agent-harness.md:167,332-339,394-413`). The V0 adapter
must not launch the verifier or another prompt from inside `agent_end` or
`settled`; it must return to an outer sequential driver first.

### 1.2 Tool execution sequence

**Fact.** For a normal tool-using assistant message, the direct loop performs:

```text
message_end(assistant with toolCall blocks)
  -> tool_execution_start(call id/name/raw args)
  -> locate tool
  -> optional prepareArguments
  -> schema validation
  -> beforeToolCall / harness tool_call hook
       [may block with an error result]
  -> tool.execute(validated args, AbortSignal, update callback)
       tool_execution_update* (partial result)
  -> afterToolCall / harness tool_result hook
       [may replace content/details/isError/usage/terminate]
  -> tool_execution_end(final result)
  -> message_start(toolResult)
  -> message_end(toolResult) -> session persistence
  -> turn_end(assistant, ordered toolResults)
```

Evidence: `prepareToolCall`, `executePreparedToolCall` and
`finalizeExecutedToolCall` in
`.upstream/pi/packages/agent/src/agent-loop.ts:576-755`; event emission at
`:433-556,765-786`; harness hook mapping at
`src/harness/agent-harness.ts:442-484`; direct hook/persistence test at
`test/harness/agent-harness.test.ts:439`.

**Fact.** Parallel is the default batch mode. Preflight is sequential, allowed
tools execute concurrently, `tool_execution_end` follows actual completion
order, but persisted `toolResult` messages are emitted later in assistant source
order (`agent-loop.ts:411-556`; documented in `packages/agent/README.md` under
“With Tool Calls”). A tool marked `executionMode: "sequential"` forces the
whole batch to sequential mode.

**Fact.** A `length`-stopped assistant message causes every apparent tool call
to be failed without execution because streamed arguments may be truncated
(`agent-loop.ts:204-217,375-409`). If the final tool batch has every result
marked `terminate: true`, the next automatic model call is skipped; otherwise
the loop continues (`agent-loop.ts:570-574`).

**Inference.** Tool start/end are directly observable. Tool result persistence
is also observable via `message_end(toolResult)`, but tool start/end are not
themselves stored as Direct Session entries. The Workbench minimal event journal
must project the raw events if those facts are required after process exit.

**Fact / hazard.** A tool side effect occurs before the final tool-result
message append. A crash between those actions can leave an external side effect
with no persisted result. None of Direct, Coding Agent, or RPC provides an
exactly-once transaction across that boundary. The upstream durability design
identifies this explicitly and says unfinished non-idempotent calls must not be
retried automatically (`packages/agent/docs/durable-harness.md:175-180`).

### 1.3 Error and cancellation

**Fact.** Provider streams encode ordinary request/model failures as a final
assistant message with `stopReason: "error"` or `"aborted"`; the loop emits
`turn_end` then `agent_end` (`agent-loop.ts:195-202`). If the Direct wrapper
itself catches a thrown hook/loop error, it synthesizes and persists an
assistant failure message, then emits the normal closing events
(`agent-harness.ts:40-62,566-579,606-636`). The corresponding test verifies the
error message is persisted and a later prompt is possible
(`agent-harness.test.ts:284`).

**Fact.** `abort()` clears steer/follow-up queues, signals the active abort
controller, waits for idle, then emits an `abort` event; `nextTurn` is preserved
(`agent-harness.ts:1025-1052`; test `agent-harness.test.ts:188`). Abort does not
roll back filesystem/process effects that already occurred.

**Unconfirmed.** G001 did not dynamically verify that every selected built-in
tool settles promptly on cancellation on this Windows host. This is a G002
check, not a static claim.

## 2. Session, persistence and replay

### 2.1 Direct Session record model

**Fact.** Direct JSONL storage begins with a version-3 session header containing
`id`, timestamp, CWD, optional parent session and optional arbitrary metadata.
Each subsequent line is an append-only tree entry with `id`, `parentId`,
timestamp and a discriminated type
(`packages/agent/src/harness/session/jsonl-storage.ts:11-24,217-287`).

Persisted entry types are:

```text
message
thinking_level_change
model_change
active_tools_change
compaction
branch_summary
custom
custom_message
label
session_info
leaf
```

Evidence: `.upstream/pi/packages/agent/src/harness/types.ts:399-464`.

**Fact.** This is a mixture of transcript, branch-scoped configuration, lossy
context checkpoints, application data and cursor facts—not a complete runtime
event journal and not a single mutable snapshot. `Session.buildContext()` walks
the active branch, applies compaction selection and optional entry transforms,
then projects only model-relevant messages (`session/session.ts:37-148,150-217`).

**Fact.** JSONL `setLeafId()` appends a durable `leaf` entry; reopen reconstructs
the current leaf from the latest leaf-affecting entry
(`jsonl-storage.ts:249-272`; test `storage.test.ts:324`). `JsonlSessionRepo`
supports create/open/list/delete/fork, while `Session` supports branch reads,
entry reads and context reconstruction (`jsonl-repo.ts:38-159`;
`session.ts:150-364`).

**Fact.** A Workbench `run_id` can be placed in Direct session header metadata
at create time without patching Pi (`harness/types.ts:486-490,540-544`;
`jsonl-repo.ts:75-89`; round-trip test `storage.test.ts:282`). The external
project journal should still retain a `RunSessionLink`, because a run may later
reference more than one session or an invalid session file.

### 2.2 What survives and what is transformed

**Fact.** Final user, assistant and tool-result messages—including assistant
usage, stop reason and error text—are persisted as message entries. Model,
thinking and active-tool changes are separate entries. Compaction and branch
summary entries retain generated summary text, usage and optional details.

**Fact.** Direct context compaction is lossy only for future model context: the
append-only prior entries remain in the storage log, while context building
selects the latest compaction and its retained tail or first-kept subtree
(`session/session.ts:37-87`; `compaction/compaction.ts`; tests
`session.test.ts:73-96`). Custom entries are retained but omitted from model
context unless an application projector is configured (`session.ts:92-148`;
`session.test.ts:152-183`).

**Fact.** Raw streamed token deltas, tool start/update/end, queue updates,
provider-response headers and `settled` are not Session entry types. They are
ephemeral events unless the external journal records selected projections.
Concrete JS tool implementations, model registries, auth, hooks and resource
loaders cannot be serialized in the session. The host must recreate compatible
runtime dependencies on reopen (`packages/agent/docs/durable-harness.md:9-24,
42-80`).

**Fact.** Direct Session can reopen a completed transcript, but the implemented
AgentHarness has no restore builder for active tools/model/config and no durable
operation/turn/provider/tool/queue records. The upstream design marks recovery
as planned (`packages/agent/docs/agent-harness.md:370-390`).

**Inference.** For V0, “resume” is safe to claim only as: reopen a settled
session, validate host-supplied model/tools/config, and submit another explicit
prompt. It is not safe to claim resumption of an in-flight provider stream,
tool call, queue drain or half-finished run.

### 2.3 Coding Agent session contrast

**Fact.** Coding Agent `SessionManager` also stores a version-3 append-only
JSONL tree with message/model/thinking/compaction/summary/custom entries
(`packages/coding-agent/src/core/session-manager.ts:30-156,844-970`). Its
header does not accept arbitrary metadata, so the Workbench must append a
custom entry or keep an external run link (`:32-44,1121-1133`).

**Fact.** Coding Agent deliberately delays initial persistent file materialization
until an assistant message exists; before that it can retain entries in memory
(`session-manager.ts:1015-1049`). This differs from Direct JSONL storage, which
writes its header immediately on create.

**Fact.** Coding Agent adds a stronger same-process settled abstraction:
`AgentSession._runAgentPrompt()` awaits core Agent, repeatedly performs automatic
retry/compaction/queued continuation, then emits `agent_settled`
(`agent-session.ts:1061-1103`). This is application lifecycle, not crash
recovery.

## 3. Context, compaction and retry

**Fact.** Direct model context is assembled at each turn from the active Session
branch. The `context` hook can replace the `AgentMessage[]`; `convertToLlm`
then filters/transforms it before the provider call
(`agent-harness.ts:442-451`; `agent-loop.ts:281-303`). Context-hook output is
observable at the hook boundary but is not automatically persisted as a new
session entry.

**Fact.** Direct `compact()` is an idle-only explicit operation with
`session_before_compact` and `session_compact` hooks. It persists a compaction
entry and usage (`agent-harness.ts:738-787`; test
`agent-harness.test.ts:562`). Although token estimation and `shouldCompact()`
helpers exist, the upstream notes say the automatic compaction decision point
is not implemented in AgentHarness (`packages/agent/docs/agent-harness.md:236,
332-339`).

**Fact.** Direct `streamOptions.maxRetries` is passed to provider streaming, so
transport/provider retries may happen inside one request. Direct harness retry
events currently cover only generated compaction and branch-summary requests,
not ordinary agent-turn requests (`agent-harness.ts:256-274,402-440`;
`harness/types.ts:665-682`).

**Fact.** Coding Agent wraps the same core loop with explicit auto retry events
and threshold/overflow compaction (`agent-session.ts:164-180,1943-2210,
2631-2725`). Therefore an SDK/RPC Baseline and Candidate can silently diverge
from a Direct run unless compaction/retry settings are explicitly fixed and
recorded.

**Recommendation.** The Direct G002 spike should use a context-small fixture,
set explicit stream retry values, perform no automatic compaction, and record
that constraint. This isolates Completion Verification from Pi retry/compaction
policy. Later experiments may add those dimensions only through a reviewed
version charter.

## 4. Completion Verification insertion

### 4.1 Clean Direct protocol

**Recommendation.** Implement the policy in an outer Workbench driver, not an
AgentHarness hook and not an agent tool:

```text
create one Session with metadata.run_id
create one explicit NodeExecutionEnv + identical tool registry/config

initial = await harness.prompt(task instruction)
// prompt return is the external settled barrier

initialVerification = await externalVerifier.run(same workspace)
append external journal facts

if Baseline:
    stop, regardless of verifier pass/fail

if Candidate and initialVerification failed:
    recovery = await harness.prompt(structured deterministic failure message)
    // same harness + same Session; exactly one new external Agent Cycle
    finalVerification = await externalVerifier.run(same workspace)

finish RunResult with explicit status and reason
```

**Fact.** This path uses only public operations: Direct `prompt()` can be called
again after the previous call has settled, and each call rebuilds context from
the same `Session` (`agent-harness.ts:354-389,658-669`). The verifier does not
need to be a registered tool, so the model cannot call or alter verifier logic
through the tool registry.

**Recommendation.** The structured failure message itself should be the second
`prompt()` input. Do not call `appendMessage(userFailure)` and then a second
prompt, because that creates two consecutive external user messages and makes
the recovery protocol harder to explain. Do not use `followUp` while the first
run is still active, because then Pi would treat recovery as an automatic
continuation within the same low-level run rather than a separately journaled
external Agent Cycle.

**Inference.** Adapter code required for the deterministic spike is small:

1. Pi construction/config adapter;
2. event-to-minimal-journal projector;
3. sequential two-cycle policy driver;
4. external verifier adapter;
5. explicit outcome builder.

No core patch is statically required.

### 4.2 Ordering and fairness invariants

The G002 adapter must enforce these **Recommendations**:

1. Wait for `prompt()` to return before every verifier invocation.
2. Run the verifier directly from Workbench code with a separate process/env
   contract; never expose it as an Agent tool.
3. Reuse the exact same model, thinking level, system prompt, tool registry,
   active tools, stream options and environment construction for Baseline and
   Candidate initial cycles.
4. Start both variants from independently reset copies of the same fixture;
   “same workspace” means same state for a given run’s Agent and verifier, not a
   single dirty directory shared across variants.
5. Disable or record all Pi internal retries and compaction. External recovery
   is `AgentCycle(reason=verification_recovery)`, never a Pi Retry.
6. Candidate may run the verifier at most twice and submit exactly one recovery
   prompt. Baseline runs it once and stops.
7. Record the full deterministic verifier command, exit code, bounded output
   digest/summary and timestamps outside Pi Session.
8. Record every assistant final message, usage and stop reason from Pi Session,
   but do not duplicate raw token deltas in the project journal.
9. If cancellation, session persistence, verifier execution or workspace
   integrity fails, mark `invalid_run` rather than infer task failure.

### 4.3 Known hazards and precise blockers

- **Fact:** no OS permission sandbox. Absolute paths and inherited environment
  exist unless the host/tool adapter restricts them. V0 must use a disposable
  scoped workspace and validate forbidden-path mutations externally.
- **Fact:** tool side-effect/result persistence is not atomic. A process crash
  during a tool call invalidates the run; automatic replay is forbidden.
- **Fact:** Direct has no durable in-flight run recovery. G002 must test a
  settled two-cycle protocol only.
- **Unconfirmed:** same-process reopen with host reconstruction and a second
  prompt must be exercised before claiming cross-process settled-session resume.
- **Unconfirmed:** Windows shell cancellation and exact environment equivalence
  must be observed under the chosen tools.
- **Unconfirmed:** Direct `settled` reentrancy is intentionally avoided, but the
  sequential outer protocol still needs a deterministic test.

None of these is a static blocker for the bounded protocol. Any G002 failure of
the first, second, or third required invariant is a precise reason to reconsider
the Direct basis; it does not authorize silently switching to SDK or RPC.

