# V3.5 Goal 2 Bounded Termination Postmortem

```yaml
report_status: completed_read_only_advisory
date: 2026-08-08
source_closeout_commit: 478bd7eb9acec1dff0985798daae6d89657a62e7
frozen_execution_baseline: ed2dc14e695233411f96af162d92b405188b04cf
goal_2_disposition_preserved: CLOSE_V3_5_G2_INCONCLUSIVE_BASE_REQUEST_BUDGET_STOP
goal_2_reopened: false
goal_2_5_activated: false
goal_3_authorized: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
source_changes: 0
evidence_changes: 0
```

## Executive answer

`Fact`: Base repaired `src/subject.ts` to the exact calibration/reference bytes on its
second Provider response. Requests 3 through 16 did not perform further task work. They
formed a command-discovery loop: the model guessed fourteen command IDs or readable paths,
and every Tool Result rejected the guess without disclosing the sole valid command ID
`public_test`.

`Fact`: the frozen System Prompt said to run the task-declared check, the task said to run
the declared public check, and `run_command` said only that it accepted a frozen descriptor
by ID. Neither the prompt nor the Tool schema/description exposed `public_test`; the schema
accepted an unconstrained string. See `workbench/src/prompts/base.ts` (`SYSTEM_PROMPT`, lines
5-10), `workbench/src/pi/tool-profile.ts` (`commandSchema`, `createBoundedToolProfile`, the
`run_command` Tool at lines 343-370), and `workbench/src/v35g2/case-v35g2.ts`
(`GOAL2_TASK_POLICY_V35`, lines 34-38).

`Inference`: the most likely immediate cause of the loop was an affordance gap, not task
difficulty: the model had already made the correct one-line repair, then explicitly tried to
discover the check name. There was also no host-owned, model-independent handoff rule after
task bytes became correct. Workspace correctness was intentionally hidden from the model and
must not itself be treated as a pass.

`Recommendation`: the minimum sufficient Goal 2.5 correction is **B, adapted from the
already implemented V2 verifier-safe budget terminal**: separate `Trajectory Outcome`
(`settled`, `pre_dispatch_budget_terminal`, or invalid) from `Task Outcome` (the frozen
external Verifier result). After a typed local pre-dispatch budget refusal, run the Verifier
exactly once only if a durable raw checkpoint proves Provider, Tool and side-effect
quiescence, known/reconciled usage, public Session reopen consistency, Workspace/protected
bytes consistency, and closed evidence. This rule must be identical for Base and Candidate.

`Recommendation`: do not retrospectively apply that rule to the consumed Goal 2 evidence.
The current prefix is diagnostically strong but lacks the Contract-level checkpoint needed
to authorize Verifier handoff.

## 1. Gate A and evidence boundary

`Fact`: `git rev-parse HEAD` returned
`478bd7eb9acec1dff0985798daae6d89657a62e7`; `git status --short` was blank. The delegated
worktree was detached at the exact requested commit. The source/test/fixture diff from
`ed2dc14e...` to the Closeout commit was blank.

`Fact`: the following files were read completely before source diagnosis:

- `AGENTS.md`;
- `CURRENT_STATE.md`;
- `docs/第二项目_Codex交接包_2026-07-30/V3_5_CHARTER.md`;
- `docs/第二项目_Codex交接包_2026-07-30/V3_5_G2_REAL_ADAPTIVE_SKILL_CASE_CONTRACT.md`;
- `docs/reports/V3_5_G2_CLOSEOUT.md`;
- `docs/reports/V3_5_G2_IMPLEMENTATION_REPORT.md`.

The completion, Verifier, fairness, runtime-object, evidence and human-decision sections of
`SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md` were also reviewed. That older plan has no
V3.5 section; the accepted V3.5 Charter and Goal 2 Contract are the current authority.

`Fact`: before reading Pi source, the applicable
`D:/AI/AI_Projects/project2/.upstream/pi/AGENTS.md` was read completely. The checkout returned
exact HEAD `027a5847901b5dde30270abaa1041046cd2b4b55`; status was blank.

`Fact`: the external evidence root
`C:/Users/HUAWEI/.codex/worktrees/c400/project2/.runs/v3-5-g2/real-pair-20260808-01`
exists. It contains 14 files. A deterministic inventory over relative path, byte length and
per-file SHA-256 was
`4774605cac9374f61713d9fb0be5d9d42feffa26ff1fe096b814f08fa8b8f376` before writing this
report. The raw JSONL file SHA-256 was
`8f0b8ea128e2dfa89e25959136ba3ee74ba7c9467ef5e4231488fd8c9374a8e9`.

`Fact`: no Credential, network, Provider/model or real-model access occurred in this
postmortem. No Base/Candidate execution, public check, hidden Verifier, dependency install,
test that generated evidence, commit or stage operation ran.

## 2. Ordered reconstruction of the Base Session

The JSONL path is:

`C:/Users/HUAWEI/.codex/worktrees/c400/project2/.runs/v3-5-g2/real-pair-20260808-01/sessions/--C--Users-HUAWEI-.codex-worktrees-c400-project2-.runs-v3-5-g2-real-pair-20260808-01-workspaces-base--/2026-08-08T14-00-48-765Z_v35-g2-stable-unique-base-session-01.jsonl`

`Fact`: the file has 35 JSONL entries: one Session header plus 34 messages. The messages are
one user message, 16 assistant Tool requests, 16 Tool Results and one local assistant error.
The parent-ID chain is linear, all 16 Tool call IDs have exactly one matching Tool Result,
and the terminal message is an assistant `stopReason: "error"` message.

| Request | Assistant action | Tool Result | Workspace/trajectory state |
|---:|---|---|---|
| 1 | `workspace_read {path:"src/subject.ts"}` | Returned the original `.sort()` implementation | Task defect identified |
| 2 | Explained that `.sort()` breaks first-occurrence order; `workspace_write` wrote `[...new Set(values)]` | `Successfully wrote 90 bytes` | Workspace reached exact reference bytes |
| 3 | `run_command {command_id:"check"}` | `command ID is not allowed: check` | No byte change |
| 4 | `run_command {command_id:"test"}` | `command ID is not allowed: test` | No byte change |
| 5 | `run_command {command_id:"list_files"}` | rejected | No byte change |
| 6 | `run_command {command_id:"ls"}` | rejected | No byte change |
| 7 | `workspace_read {path:"package.json"}` | outside readable scope | No byte change |
| 8 | `run_command {command_id:"run_check"}` | rejected | No byte change |
| 9 | `run_command {command_id:"run test"}` | rejected | No byte change |
| 10 | `run_command {command_id:"verify"}` | rejected | No byte change |
| 11 | `workspace_read {path:"README.md"}` | path does not exist | No byte change |
| 12 | `run_command {command_id:"npm test"}` | rejected | No byte change |
| 13 | `workspace_read {path:"."}` | outside readable scope | No byte change |
| 14 | `run_command {command_id:"typecheck"}` | rejected | No byte change |
| 15 | `run_command {command_id:"build"}` | rejected | No byte change |
| 16 | `run_command {command_id:"compile"}` | rejected | No byte change |

`Fact`: after request 16, a seventeenth `before_provider_request` attempt was refused locally.
No seventeenth network/Provider/model dispatch occurred. Pi persisted a local assistant error
whose `errorMessage` is `Goal 3 provider request budget exceeded` and whose usage is zero.

`Fact`: raw known usage across the 16 real assistant responses is:

```yaml
input_tokens: 1808
cache_read_tokens: 16640
cache_write_tokens: 0
output_tokens: 902
total_tokens: 19350
cost_usd: 0.000552272
actual_provider_model_requests: 16
tool_calls_and_results: 16/16
```

`Fact`: final Base file identities were:

| Path | Bytes | SHA-256 |
|---|---:|---|
| `package.json` | 87 | `7852a78b1be7f60e901da63681809950e0fa579aa52517b811a1f6baeea25013` |
| `src/subject.ts` | 90 | `083640cc7a47940ba184f7f031379531602f7d9924a8a8c018a8b534cce2d8c4` |
| `test/public.test.mjs` | 252 | `46ee2aba0b4da27c8d4c22dab3b38b8d3da28e1b9731971a0b193f3050e2665b` |

The subject hash equals the calibration reference hash and protected files match their
frozen identities. Candidate remained at the initial 97-byte subject hash `2a95f2cc...`.

### Model-visible completion signals

`Fact`: the model could see (1) the instruction to run a declared public check, (2) the
generic `run_command` descriptor, (3) the successful 90-byte write, and (4) rejection text
for each invalid guess. It could not see the reference bytes, hidden Verifier, Case
Authority, or the allowed command-descriptor list.

`Fact`: none of the rejection Tool Results named `public_test` or enumerated allowed command
IDs. The successful write signaled only file-write completion, not task correctness or
trajectory completion.

`Inference`: requests 3-16 are one repeated discovery behavior with minor lexical variation,
not fourteen independent repair attempts.

## 3. Actual Workbench call chain and handoff boundary

The real path is:

```text
workbench/scripts/v35g2-real-pair.ts
  -> executeGoal2RealPairV35
  -> executeGoal2PairV35 (Base first; Candidate only after Base manifest)
  -> executeArm
  -> executeGoal3RunV3
  -> executeBoundDirectPiV3 / createGoal3DeepSeekExecutionPortV3
  -> runHarnessV3
  -> public Pi AgentHarness.prompt (Base) or .skill (Candidate)
  -> Pi provider request -> assistant Tool call -> Tool Result -> next provider request
  -> Pi agent_end -> AgentHarness settled
  -> runHarnessV3 writes runtime.json
  -> executeGoal3RunV3 runs frozen external Verifier once
  -> executeArm writes Session/Run/Goal 2 manifests
  -> Candidate, comparison and inspection
```

`Fact`: principal Workbench symbols are:

- `workbench/src/v35g2/pair-v35g2.ts`: `executeArm` (line 91),
  `executeGoal2PairV35` (line 173), `executeGoal2RealPairV35` (line 207).
- `workbench/src/run-v3.ts`: `executeGoal3RunV3` (line 15); the Verifier call is after the
  awaited runtime call at line 30.
- `workbench/src/pi/pi-adapter-v3.ts`: `runHarnessV3` (line 71), usage reconciliation
  subscriber (lines 87-97), request reservation/budget hook (lines 99-115), exact-settled
  check (line 129), and `createGoal3DeepSeekExecutionPortV3` (line 194).
- `workbench/src/pi/tool-profile.ts`: `createBoundedToolProfile`; `run_command` is at lines
  343-370.
- `workbench/src/verifier/runner.ts`: `runExternalVerifierV0B`, the authoritative bounded
  external process/result parser.

`Fact`: `runHarnessV3` increments `provider_requests` before checking the cap. On the
seventeenth attempt it throws before creating a new reservation and before Pi calls
`models.streamSimple`. Therefore external counters remain 16 while the local attempted
ordinal is 17.

`Fact`: `executeGoal3RunV3` cannot reach the Verifier until `executeBoundDirectPiV3`
returns. Because `runHarnessV3` threw, it wrote no `runtime.json`, and the following artifacts
are absent: Base `runtime.json`, V3 `manifest.json`, Goal 2 manifest, Session record,
first-provider-payload evidence, final subject snapshot and Verifier result. `comparison.json`
and the Candidate Run/Session are also absent.

### Relevant frozen tests

`Fact`: `workbench/tests/v35g2-real-adaptive-skill.test.ts` proves the narrow Tool surface,
the valid `public_test` ID, frozen identities, persistent Session composition, first-payload
fairness, Base-first stopping and reference calibration. Its over-budget fake only returns a
completed fake runtime with 17 requests and then checks `arm budget invalid`; it does not
exercise the real adapter's seventeenth pre-dispatch refusal, Pi failure reporting, raw
quiescence checkpoint, or post-stop Verifier handoff.

`Fact`: the repository already contains a stronger applicable precedent:
`workbench/src/pi/pi-run-handle-v2b.ts` records a typed pre-dispatch refusal, pending Provider
reservation/response state, pending Tool calls and reconciled usage; and
`workbench/src/run-v2.ts:createCandidatePreVerifierCheckpointV2A` (line 600) reopens the
public Session, snapshots Session and Workspace, proves Tool lifecycle closure and protected
bytes, writes a checkpoint before the Verifier, and refuses the Verifier when the raw gate
fails. `workbench/tests/v2b-r2.test.ts` test `R2-C safe pre-dispatch budget terminal is
quiescent, verified once, retained, and tamper-evident` (line 140) covers the positive path
and field/artifact tampering; `R2-MR raw gate stops before Verifier...` covers fail-closed
negative paths.

## 4. Pinned Pi settled semantics

`Fact`: in pinned Pi public source
`D:/AI/AI_Projects/project2/.upstream/pi/packages/agent/src/agent-loop.ts`, a Tool call causes
another provider turn unless the finalized Tool batch terminates (lines 205-224). A normal
assistant response with no Tool call exits the loop (lines 264-274). Every Tool Result can
carry `terminate: true`; a batch terminates only when every finalized result does so
(`shouldTerminateToolBatch`, lines 582-584).

`Fact`: `AgentHarness` turns Pi `agent_end` into its public `settled` event only after Session
writes and awaited event listeners complete
(`.../src/harness/agent-harness.ts:handleAgentEvent`, lines 538-562). `waitForIdle()` waits for
the run promise; it does not independently declare task completion.

`Fact`: Pi's public tests demonstrate both semantics:

- `.../test/agent-loop.test.ts`, `should stop after a tool batch when every tool result sets
  terminate=true` (line 1201);
- `.../test/harness/agent-harness.test.ts`, `runs tool_call and tool_result hooks through the
  direct loop` (line 439), including a hook-provided `terminate: true`;
- `.../test/harness/agent-harness.test.ts`, `settles thrown hook failures with persisted
  assistant error messages` (line 284).

`Fact`: Pi `settled` is an execution-idle/lifecycle fact, not a task-success fact. A
successfully reported assistant error can still lead through `agent_end` to `settled`. The
Workbench must inspect terminal reason/assistant stop reason separately and must retain the
external Verifier as Task Outcome authority.

`Fact`: the public Harness caller can control System Prompt, resources, active Tools, Tool
implementations, `tool_result` patches including `terminate`, pre-provider hooks, Session,
prompt/Skill invocation, queues and abort. It cannot directly emit or set `settled`.
`AgentHarnessOptions` does not expose the low-level loop's `shouldStopAfterTurn` callback.
Throwing from `before_provider_request` enters failure reporting; it is not a graceful
completion signal.

## 5. Root cause and the secondary failure-report defect

### Ranked causes

1. `Inference` — **highest likelihood: model-visible command affordance gap.** The only valid
   ID was `public_test`, but neither instruction nor Tool schema disclosed it. The exact
   post-repair sequence is the model trying plausible names.
2. `Fact` — **no Workbench-owned alternate verifier-safe terminal on this V3/Goal 2 path.**
   Correct Workspace bytes could not cause handoff; only return from `runHarnessV3` could.
3. `Fact` — **no explicit successful-check termination signal.** `run_command` returned an
   ordinary Tool Result without `terminate`; even a future successful `public_test` would
   require the model to produce a later no-Tool assistant response before Pi settled.
4. `Fact` — **failure-report observer defect at the cap.** It obscured the typed local cause
   and prevented clean Pi error terminalization.
5. `Recommendation` — budget size and Case complexity are not credible primary causes. The
   task was correctly repaired by request 2.

### Why the second error occurred

`Fact`: the primary seventeenth-attempt error was `Goal 3 provider request budget exceeded`.
Pi caught it and called `emitRunFailure`, which constructs a zero-usage assistant error and
emits `message_start`, `message_end`, `turn_end`, then `agent_end`
(`agent-harness.ts:createFailureMessage`, `emitRunFailure`, lines 55-73 and 567-578).

`Fact`: the Workbench subscriber processes every assistant `message_end` as a Provider
response. The synthetic local error had no `pendingBudget`, so line 92 threw `Goal 3 Provider
usage exceeded its pre-dispatch reservation`. Pi then raised the aggregate `Agent run failed
and failure reporting failed` at lines 625-636. The primary error remains visible in the
persisted Session, while `pause.json` contains only the aggregate message.

`Conclusion (Inference)`: this is **not the cause of the 14-request discovery loop**. It is a
secondary reporting/terminalization defect triggered by the primary cap refusal. It is also
material to any Goal 2.5 controlled-stop design: a naive fix that merely ignores all
assistant messages without reservations could hide real accounting defects, while a naive
fix that lets Pi report the error as ordinary `settled` could mislabel an error trajectory.
A future correction must allow only the exact typed pre-dispatch synthetic failure message,
preserve the primary reason, and record `settled: false`,
`trajectory_outcome: pre_dispatch_budget_terminal`.

## 6. Does the current refusal meet the safe controlled-stop conditions?

| Condition | Current evidence | Judgment |
|---|---|---|
| Provider quiescent | 17th refusal occurs before `models.streamSimple`; external counters are 16; prior reservation is cleared by request 16 | `Inference`: physically likely true; no durable runtime observation/ledger |
| Tool quiescent | 16 Tool calls have 16 matching results; final Tool Result is persisted | `Fact`: raw Tool lifecycle is closed |
| Side-effect quiescent | only one completed write; all later `run_command` guesses were rejected before spawn | `Inference`: likely true; no explicit pending-side-effect checkpoint |
| Usage known | all 16 real assistant usages are finite and sum exactly to 19,350 tokens / USD 0.000552272 | `Fact` for raw messages; no persisted reservation ledger/reconciliation proof |
| Session consistent | JSONL parses, has a linear parent chain and closed Tool linkage | `Fact`; no public `JsonlSessionRepo.open` equality checkpoint was persisted |
| Workspace consistent | all three final file hashes match expected reference/protected identities | `Fact`; no write-once pre-Verifier Workspace snapshot/checkpoint exists |
| Fairness/evidence closed | Base first payload was captured only in memory and never written; runtime/Session/manifest/final snapshot absent | `Fact`: not satisfied |

`Recommendation`: the current refusal must **not** be promoted to a verifier-safe terminal.
It has enough evidence to motivate the correction, but not enough to meet the already proven
V2 raw gate. Missing proof includes: typed stop artifact, request-attempt versus dispatch
counters, reservation ledger, pending Provider/Tool/side-effect state, public Session reopen
equality, durable Session and Workspace snapshots, protected-byte gate, first-payload
fairness evidence written before handoff, and journal ordering that places the checkpoint
before the Verifier.

`Unconfirmed`: no process-level snapshot was persisted at the refusal instant, so absolute
absence of an in-flight OS handle or non-Tool side effect cannot be retroactively proven.
This is why no Verifier may be run now even though source and raw artifacts strongly indicate
quiescence.

## 7. Options A-E

| Option | Decision | Evidence and risk | Base/Candidate fairness |
|---|---|---|---|
| A. Only strengthen frozen System/task completion instruction | **Adapt, not sufficient alone** | Naming `public_test` and telling the model to stop after it passes would directly address discoverability, but remains model-obedience dependent and cannot guarantee handoff after another loop/error. | Fair only if byte-identical and frozen for both arms before dispatch. It creates a new Goal 2.5 prompt identity and cannot relabel Goal 2. |
| B. Separate Task Outcome / Trajectory Outcome; after quiescent local stop run one frozen Verifier | **Adopt as minimum sufficient correction** | Existing V2 source/tests prove the pattern. It is model-independent, fail-closed, and retains truthful `settled:false` on a budget terminal. Main risk is accidentally broadening eligibility; constrain it to exact pre-dispatch refusal plus durable raw gate. | Identical stop/checkpoint/Verifier rules for both arms preserve the sole Skill delta. A valid Verifier pass/fail is accepted regardless of which arm settles or budget-stops. |
| C. Add explicit public completion/submit Tool or thinnest equivalent | **Defer; optional later adaptation** | A dedicated Tool adds surface and still requires model invocation. The thinnest form is a successful `public_test` Tool Result with `terminate:true`, supported by Pi public APIs/tests. It can reduce cost and produce a clean settled path, but is not sufficient if the Tool is never called. | Fair if identical in both arms. It changes Tool semantics and should not be bundled unless Main chooses a settled-first optimization beyond the minimum B correction. |
| D. Only raise Provider request budget | **Reject** | The task was correct at request 2; more budget extends an unproductive naming loop without guaranteeing settlement. It weakens the stop boundary and tunes after observing the outcome. | Symmetric caps are superficially fair, but the change confounds resource allocation and does not repair termination semantics. |
| E. Modify/simplify the Case | **Reject** | The Case is already install-free and solved in one write. Changing it after observing the outcome is Case hunting and would abandon the frozen held-out identity. | Violates the strongest continuity/fairness constraint even if both new arms share the edited Case. |

## 8. Verifier authority

`Fact`: byte equality with the calibration reference is diagnostic only. The hidden Verifier
checks exact string identity, order, deduplication, empty input and non-mutation. The reference
is neither model-visible nor Run input, and a different implementation could legitimately
pass.

`Recommendation`: Goal 2.5 must persist two orthogonal fields:

```yaml
trajectory_outcome: settled | pre_dispatch_budget_terminal | invalid
task_outcome: passed | failed | invalid  # only from the frozen external Verifier
```

Only a valid frozen Verifier result may populate `passed` or `failed`. Workspace/reference
digest equality may appear only as diagnostic metadata. The pre-Verifier checkpoint must be
write-once and durable before the Verifier starts. If the checkpoint fails, the Verifier must
not run and Candidate must not start.

## 9. Minimal Goal 2.5 proposal

### Go/no-go

`Recommendation`: **conditional GO** for one newly contracted Goal 2.5, but only after Main
accepts the Outcome split and zero-call tests prove the raw quiescence gate. If Main requires
Pi `settled` as the only eligible handoff and declines B, the recommendation is **NO-GO**
rather than another real run based only on stronger prompting or more budget.

### Immutable items

- exact pinned Pi commit and Direct public `AgentHarness` route;
- historical Skill bytes/wrapper and isolated case-owned selection;
- exact Case, initial Workspace, task prompt, hidden Verifier and reference identities;
- provider/model/thinking level, Base-first order, fresh persistent Sessions;
- writable/protected paths and external Verifier authority;
- only treatment delta = Candidate Skill binding;
- no retry, fallback, replacement, extra arm, extra Case or Goal 3 work.

### Allowed correction

Only a thin Goal 2/real-adapter terminalization correction and its focused tests:

1. introduce a typed local pre-dispatch request-budget stop; keep request attempts separate
   from actual Provider dispatches;
2. reconcile only real Provider assistant responses; accept only the exact synthetic local
   error associated with that typed stop, preserving the primary reason;
3. persist first-provider-payload digest evidence on the stop path;
4. track pending Provider reservation/response, Tool calls and side effects;
5. before Verifier, reopen the public Session and compare exact entries, prove Tool-call/result
   closure, persist Session and Workspace snapshots, validate protected bytes and reconcile
   raw usage/reservations;
6. write the checkpoint before running exactly one frozen Verifier;
7. represent Pi `settled` and `pre_dispatch_budget_terminal` distinctly.

Do not change Pi, the Case, prompt, Skill, Verifier or budgets for the minimum B correction.

### Required zero-call tests

- exact 17th-attempt pre-dispatch refusal: 16 dispatches, zero pending reservation/response,
  no seventeenth network call, primary error preserved, no secondary report failure;
- positive quiescent stop: durable first payload, reconciled ledger, closed Tool lifecycle,
  Session reopen equality, Workspace/protected snapshot, checkpoint-before-Verifier order,
  exactly one Verifier, then Candidate eligibility;
- negative matrix: pending Provider response/reservation, pending Tool/side effect, unknown or
  overflow usage, Session mismatch, Tool-result deletion, Workspace/protected drift, missing
  first-payload evidence, crash/timeout/post-dispatch loss; every case must run zero Verifiers
  and start zero Candidates;
- normal non-error settled path remains valid and distinct;
- Base/Candidate stop semantics and non-treatment payload identities are identical;
- existing Goal 2 focused tests and necessary Goal 1/V3 regressions remain passing.

### Gates and hard stops

1. clean reviewed implementation commit; exact Pi/Case/Skill/Verifier/source identities;
2. strict TypeScript and all zero-call tests pass with Credential/network/Provider/model
   counters `0/0/0/0`;
3. Main reviews the exact source delta and checkpoint schema before any real authority;
4. run Base once; accept only a genuine non-error settled terminal or a checkpointed typed
   pre-dispatch budget terminal;
5. persist and run exactly one Base Verifier; invalid checkpoint or Verifier is a hard stop
   before Candidate;
6. run Candidate once under the identical rule; any invalid terminal/checkpoint/Verifier is
   a hard stop with no retry or replacement;
7. form a comparison only after two valid external Verifier results and fairness evidence.

### Budget recommendation

Preserve, do not raise, the original caps:

```yaml
per_arm:
  provider_dispatches_max: 16
  tool_calls_max: 24
  tokens_max: 131072
  verifier_runs_exact: 1
  cost_usd_max: 0.20
pair:
  arms_exact: 2
  provider_dispatches_max: 32
  cost_usd_max: 0.40
retry_fallback_replacement_extra_arm_case: 0/0/0/0/0
```

The request-attempt counter may reach 17 only as the recorded local refusal; it must not be
counted as a Provider dispatch or network call.

### Allowed claims

If both arms produce valid Verifier results, Goal 2.5 may claim one fair, fixed-case observed
Base/Candidate comparison and its exact result label. If either arm uses the controlled stop,
it must also say that the trajectory did not Pi-settle. It may not claim general Skill
superiority, that correct bytes implied pass, that Goal 2 was repaired/reopened, or that V3.5
or Goal 3 is accepted.

## 10. Final requested conclusions

1. **Most likely root causes, ranked:** hidden valid command ID / command-discovery loop;
   missing Workbench-owned verifier-safe alternate terminal; no successful-check termination
   signal; secondary failure-report accounting defect; budget/Case are not primary causes.
2. **Recommended minimum correction:** adopt B with the V2-style durable raw quiescence gate,
   typed stop and truthful Outcome split. Do not require prompt, Case, Tool or budget changes.
3. **Why this does not tune for a pretty result:** it changes neither task inputs nor treatment
   content, does not look at hidden correctness before handoff, applies identically to both
   arms, and accepts pass, fail or budget-stopped trajectories as long as the same frozen
   Verifier produces valid Task Outcomes.
4. **Goal 2.5 go/no-go:** conditional GO after zero-call proof and a new user-accepted
   Contract/Activation; otherwise NO-GO. Never continue or relabel the consumed Goal 2 pair.
5. **At most three Main choices:**
   1. accept or reject `pre_dispatch_budget_terminal` as a distinct verifier-eligible
      Trajectory Outcome under the strict raw gate;
   2. keep the minimum B-only correction (recommended), or additionally authorize the
      optional C settled-first optimization in the new Contract;
   3. after zero-call review, authorize one pair under unchanged caps or cancel Goal 2.5.

## 11. Commands and exit codes

All commands were read-only except creation of this report.

| Command/purpose | Exit | Result |
|---|---:|---|
| `git rev-parse HEAD; git status --short` | 0 | exact Closeout commit; blank tracked status |
| `git diff --name-status ed2dc14e...478bd7e... -- workbench/src workbench/tests fixtures/v3-5/goal2` | 0 | blank; frozen mechanism unchanged |
| `git -c safe.directory=... -C D:/AI/AI_Projects/project2/.upstream/pi rev-parse HEAD; ... status --short` | 0 | exact pinned Pi; clean |
| `Test-Path` plus recursive external-evidence inventory | 0 | root exists; 14 files |
| PowerShell `ConvertFrom-Json` over `.NET File.ReadLines("\\?\\...")` | 0 | 35 entries; 16 Tool request/result pairs; linear chain |
| `.NET SHA256` over evidence files using the Windows long-path prefix | 0 | inventory and per-file hashes above |
| source/test `rg -n` and complete relevant-file reads | 0 | call chain, Pi semantics and V2 precedent located |
| first recursive `Get-FileHash` attempt on the long JSONL path | 1 | PowerShell 5 path-resolution limit; no file changed; replaced by read-only `.NET` long-path hashing |
| first aggregate inventory attempt | 124 | local 10-second command timeout; no file changed; identical command completed with a 30-second cap |

No implementation/test command was necessary or run because this Session had no source-edit
authority and the relevant existing tests were inspected rather than regenerated.


