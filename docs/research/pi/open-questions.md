# Pi Open Questions and Smallest Dynamic Checks — G001

> Frozen source basis: `027a5847901b5dde30270abaa1041046cd2b4b55`.
> These are the behaviors that static evidence cannot prove. G001 did not
> install dependencies, build, run tests, invoke a model, or execute Pi.

## G002 execution envelope

**Recommendation.** G002 should be a deterministic source-integration spike,
not a policy evaluation. It should use Pi's faux provider or an equivalent
local scripted stream, a disposable fixture workspace, no credentials and no
network. It may hydrate the pinned checkout only if its own Goal Contract
explicitly authorizes `npm.cmd ci --ignore-scripts`; it must still keep
`.upstream/pi` source read-only.

One possible targeted runner intent after that authorization is:

```powershell
node .upstream/pi/node_modules/vitest/dist/cli.js --run spikes/pi-runtime/<single-test>.test.ts --config spikes/pi-runtime/vitest.config.ts
```

The exact command must be frozen in G002 after deciding whether the spike
imports pinned source directly or consumes a locally packed package. No broad
suite or real provider is needed.

## Required dynamic checks

### Q1 — Can Direct execute the exact two-cycle Completion Verification protocol?

- **Static status:** **Unconfirmed.** Public composition exists:
  `AgentHarness.prompt()` at
  `.upstream/pi/packages/agent/src/harness/agent-harness.ts:658-669`, session
  context refresh at `:354-389`, and the awaited idle test at
  `test/harness/agent-harness.test.ts:408`.
- **Risk:** Critical. Failure would remove the primary reason to choose Direct.
- **Smallest setup:** Script a faux provider with two terminal assistant
  responses. Use one JSONL Session carrying `metadata.run_id`; use a deterministic
  verifier stub that fails after the first prompt and passes after the recovery
  prompt. Instrument prompt return, verifier calls, session entries and events.
- **Command intent:** one targeted test named conceptually
  `direct-completion-recovery.test.ts`.
- **Pass:** exactly two `prompt()` calls, two settled returns, verifier order
  `after prompt 1` then `after prompt 2`, exactly one structured recovery user
  message, one session ID/run link, final pass, no extra provider call.
- **Fail:** verifier starts before settlement; recovery is folded into the first
  run; session ID changes; more than one recovery cycle/provider call occurs;
  prompt/idle does not settle.

### Q2 — Is the Direct public package entry usable at the pinned build boundary?

- **Static status:** **Unconfirmed.** The source root exports AgentHarness and
  the manifest declares `.`/`./node`, but G001 did not build or import emitted
  `dist` artifacts.
- **Risk:** High for packaging, low for source capability.
- **Smallest setup:** After G002 hydration/build authorization, perform a single
  import-only smoke test for `AgentHarness`, `JsonlSessionRepo`, `Session` from
  the root entry and `NodeExecutionEnv` from `/node`.
- **Command intent:** one Node import smoke command against the locally packed
  pinned package, or one targeted type/runtime test if the package must be built.
- **Pass:** every symbol resolves from declared public subpaths; no private
  source import is needed.
- **Fail:** missing emitted export, Node-only dependency leaks into the root
  entry, or adapter requires an internal path. Packaging failure pauses the
  spike for a narrow upstreamable fix decision.

### Q3 — Can a settled Direct Session reopen and continue with lossless Run linkage?

- **Static status:** **Unconfirmed end-to-end.** Repo create/open and header
  metadata are source/test-confirmed (`jsonl-repo.ts:75-101`;
  `storage.test.ts:282,324`), but a reconstructed harness continuation was not
  run.
- **Risk:** High for useful repeatable runs; not a claim about in-flight crash
  recovery.
- **Smallest setup:** Run one faux-provider prompt, close/discard the harness,
  reopen the JSONL Session, validate `{run_id}`, rebuild a new harness with the
  same model/tools/config, then submit one recovery prompt.
- **Command intent:** one targeted test named conceptually
  `direct-settled-session-reopen.test.ts`.
- **Pass:** identical session ID and `run_id`; reopened context contains the
  first user/assistant pair in order; second prompt appends on the same branch;
  host validation detects any missing tool/model mapping.
- **Fail:** metadata or active branch is lost, context order changes, or
  reconstruction requires core patching.

### Q4 — Does the event-to-journal projection preserve lifecycle and usage order?

- **Static status:** **Unconfirmed end-to-end.** Event order and persistence
  paths are source-confirmed, but the Workbench projection does not yet exist.
- **Risk:** High for explainability and valid run classification.
- **Smallest setup:** Script a single assistant tool call followed by a final
  assistant response; use a deterministic no-side-effect tool with one update.
  Project only run/cycle/settled, tool start/end, verifier and completion facts.
- **Command intent:** one targeted test named conceptually
  `direct-event-journal-order.test.ts`.
- **Pass:** journal order is `cycle_started`, tool start, tool end, settled,
  verifier; session order is user, assistant tool-use, toolResult, assistant;
  assistant usage/stop reason and tool error flag match source events; no raw
  token deltas are copied.
- **Fail:** tool facts reorder, `agent_settled` is confused with model stop, or
  session/journal cannot be correlated by stable call/session/run IDs.

### Q5 — Are Baseline and Candidate initial environments actually identical?

- **Static status:** **Unconfirmed operationally.** `NodeExecutionEnv` exposes
  explicit CWD, shell and env controls (`harness/env/nodejs.ts:237-252,
  344-392`), but equality depends on Workbench construction.
- **Risk:** Critical for fair comparison.
- **Smallest setup:** Prepare two independent copies of one fixture. Construct
  both variants through the same adapter, emit a canonical manifest containing
  fixture digest, cwd-relative tree digest, model/thinking/system-prompt hash,
  tool definitions/active names, stream options and allowed env keys.
- **Command intent:** one targeted manifest-equivalence test; no model response
  is required.
- **Pass:** manifests differ only in `run_id`, workspace absolute path and
  `policy_variant`; normalized initial workspace digests are equal.
- **Fail:** any hidden settings/resource/tool/retry/env difference. The run is
  invalid, not evidence for or against the policy.

### Q6 — Does cancellation settle on the chosen Windows shell/tool profile?

- **Static status:** **Unconfirmed for the final adapter.** Direct abort and
  `NodeExecutionEnv` process-tree cancellation have source tests, including
  Windows-specific cases (`agent-harness.test.ts:188`;
  `nodejs-env.test.ts`).
- **Risk:** Medium-high; a hung cancellation can corrupt run orchestration.
- **Smallest setup:** Faux model emits one long-running bash call that creates a
  marker then waits. Abort after tool start and enforce a short outer timeout.
- **Command intent:** one targeted Windows-only test.
- **Pass:** abort returns within the bound, provider/tool signal is aborted,
  child process tree stops, final assistant/session state records aborted/error,
  and no second provider turn starts.
- **Fail:** timeout, surviving child, missing terminal session message, or an
  unexpected continuation.

### Q7 — How is a side-effect-without-result crash classified?

- **Static status:** **Known gap; dynamic characterization Unconfirmed.** Pi has
  no durable tool-operation recovery and upstream warns against replaying
  unknown non-idempotent calls (`packages/agent/docs/durable-harness.md:175-180`).
- **Risk:** Critical if misclassified; not a blocker if the Workbench marks it
  invalid and never replays automatically.
- **Smallest setup:** In a disposable child process, execute a deterministic
  tool that writes a marker and then pause before result persistence; terminate
  the child, reopen the session read-only, and inspect marker/session/journal.
- **Command intent:** one isolated child-process characterization test; run only
  after Q1-Q4 pass.
- **Pass:** adapter detects “tool started without durable result”, preserves the
  workspace for diagnosis, labels `invalid_run`, and does not retry the tool.
- **Fail:** automatic replay, false success/failure classification, or loss of
  diagnostic linkage.

### Q8 — Can Direct constraints remain identical across the recovery boundary?

- **Static status:** **Unconfirmed.** Per-turn snapshots refresh model,
  thinking, resources, tools, tool context and stream options; tests show this
  can change at save points (`agent-harness.test.ts:314`;
  `agent-harness-stream.test.ts:139`).
- **Risk:** High: an unintended mid-run change invalidates Baseline/Candidate
  fairness.
- **Smallest setup:** Reuse Q1 and record canonical config before both prompt
  calls. Attempt no setters from event callbacks.
- **Command intent:** assertion inside the Q1 targeted test, not a separate run.
- **Pass:** all frozen configuration hashes are identical for initial and
  recovery cycles except the user message/cycle budget.
- **Fail:** resources/tools/model/stream options drift or are sourced from
  mutable global state.

## Conditional comparator checks

### Q9 — Does the Coding Agent path preserve the same policy boundary?

- **Static status:** **Unconfirmed end-to-end; not required to choose the G002
  primary path.** Coding Agent has `agent_settled`, inline factories and second
  prompt capability (`agent-session.ts:1061-1103`;
  `extensions/types.ts:1494-1505`).
- **Risk:** Medium for the later real Pi usage path.
- **Smallest setup:** Only after Direct Q1-Q5 pass, repeat the same faux-provider
  fixture with retries and auto-compaction explicitly disabled. Use an inline
  extension solely to observe events; keep the external verifier outside it.
- **Pass:** the outer driver sees one `agent_settled` per external cycle, exact
  one recovery prompt, same verifier ordering and no hidden retry/compaction.
- **Fail:** application services introduce uncontrolled behavior or the policy
  requires extension-owned hidden state.

### Q10 — Is RPC isolation necessary?

- **Static status:** **Not indicated.** RPC works as a protocol, but no current
  fact demonstrates an in-process isolation requirement.
- **Risk:** Expands implementation and failure surface unnecessarily.
- **Trigger/check:** Run only if Direct fails because an in-process provider/tool
  cannot be cancelled or isolated. Re-run Q1/Q4 through one child process and
  inject a child exit.
- **Pass:** RPC removes the specific observed blocker while preserving event,
  session and verifier ordering.
- **Fail:** it merely moves the failure across JSONL or adds ambiguous process
  state. Do not adopt RPC without a causal win.

## Questions intentionally left for user review

These are not G001 source unknowns and must not be silently frozen by G002:

- final Outcome semantics and `invalid_run` rules;
- Failure Taxonomy;
- recovery token/time/tool-call budget;
- allowed side-effect and forbidden-path boundary;
- whether an Eval case is valid;
- Baseline/Candidate fairness acceptance;
- policy promotion and rollback thresholds.

G002 may collect evidence about these decisions, but the architecture/control
session remains the authority.

