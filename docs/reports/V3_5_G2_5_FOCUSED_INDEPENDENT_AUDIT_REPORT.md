Exit code: 0
Wall time: 0.2 seconds
Output:
# V3.5 Goal 2.5 Focused Independent Audit Report

## Disposition

`REVISE_V3_5_G2_5_FOCUSED_AUDIT`

**Recommendation:** Do not freeze Candidate `e174808550211f2236c3a5c08a350a45d1bcab48` as the no-source-edit Execution Baseline. Two bounded P1/Major findings remain inside the frozen public-Tool termination and budget-terminal Verifier-handoff boundaries. The original Goal 2.5 Implementation Session should receive one correction package limited to those findings. No real pair is authorized.

## Gate A and authority

| Check | Observed | Disposition |
|---|---|---|
| Audit baseline `HEAD` | `e174808550211f2236c3a5c08a350a45d1bcab48` | exact |
| Project tracked state before report | clean | pass |
| Pinned Pi `HEAD` | `027a5847901b5dde30270abaa1041046cd2b4b55` | exact |
| Pinned Pi tracked state | clean | pass |
| Credential/network/external Provider/model/real-pair authority | none | pass |

**Fact:** The linked worktree has no local ignored `.upstream/pi`; the Contract-pinned checkout was inspected read-only at `D:/AI/AI_Projects/project2/.upstream/pi`, the same absolute root frozen by `GOAL25_PINNED_PI_ROOT_V35` in `workbench/src/v35g25/pair-v35g25.ts:41-42`. Its commit and tracked cleanliness match Gate A. No Pi file was changed.

**Fact:** Required governance, Goal 2.5 reports, relevant plan sections, all Goal 2.5 source/tests, directly reused Goal 2/V2 checkpoint symbols, and applicable pinned Pi `AGENTS.md`, loop source, harness source, and tests were read before disposition.

## Findings

### `V3G25-AUDIT-P1-001` - mixed Tool batches can produce a Provider follow-up after successful `public_test` and still be classified as public-test termination

**Severity:** P1 / Major; blocks the Execution Baseline freeze.

**Audited boundary:** public Tool termination.

**Source and symbol evidence:**

- `workbench/src/pi/tool-profile.ts:365-395`, `createBoundedToolProfile`, returns `terminate: true` only for a successful, non-timeout configured command; Goal 2.5 configures only `public_test`. This part is correct.
- `D:/AI/AI_Projects/project2/.upstream/pi/packages/agent/src/agent-loop.ts:211-224`, `agentLoop`, appends all Tool Results, then continues when the executed batch did not terminate. `shouldTerminateToolBatch` at `:582-583` returns true only when **every** result in the batch has `terminate === true`.
- Pinned Pi test `D:/AI/AI_Projects/project2/.upstream/pi/packages/agent/test/agent-loop.test.ts:1201-1251` proves a sole terminating Tool Result causes one model call and preserves the Tool Result. The adjacent test at `:1253-1315` proves a mixed batch with one terminating and one non-terminating result makes a second model call.
- `workbench/src/pi/pi-adapter-v35g25.ts:131-137` counts any terminating `run_command` result, without binding it to a sole/final Tool batch or its Provider-dispatch ordinal. Lines `:215-223` later classify the run as `settled` when the last `public_test` succeeded, exactly one terminating result was seen, and the harness emitted one settled event. They do not reject a Provider request/response after that successful Tool Result.
- `workbench/tests/v35g25-termination-safe.test.ts:192-230` covers only a response containing one `public_test` Tool Call. Lines `:309-338` cover failed and timed-out checks, but no successful `public_test` mixed with another Tool Call.

**Reachable failure:** A Provider response can contain a successful `public_test` Tool Call and, for example, a `workspace_read` Tool Call in the same batch. The public check result has `terminate: true`, the read result does not, so pinned Pi persists both results and performs another Provider request. If that response ends normally, the harness emits `settled`; the adapter still observes one successful terminating public-test result and can record `trajectory_outcome: settled` and `public_test_terminated: true`. The accepted evidence would therefore say the public Tool Result terminated the loop even though it did not, and the required no-follow-up invariant was violated.

**Smallest correction boundary:** Limit correction to `workbench/src/pi/pi-adapter-v35g25.ts` (and, only if needed, the Goal 2.5 tool restriction seam) plus `workbench/tests/v35g25-termination-safe.test.ts`. Bind accepted termination to the actual final Tool batch/dispatch ordering and reject a mixed batch or any post-success Provider attempt before Verifier eligibility. Add a mixed-batch negative that proves no external Provider follow-up is dispatched and zero Verifiers/Candidates start. Do not patch Pi or change the Tool, Provider, Case, budget, retry, fallback, or treatment surface.

### `V3G25-AUDIT-P1-002` - budget-terminal handoff does not recheck live Session or Workspace after the persisted checkpoint

**Severity:** P1 / Major; blocks the Execution Baseline freeze.

**Audited boundary:** budget-terminal quiescence and persisted Verifier ordering.

**Source and symbol evidence:**

- `workbench/src/v35g25/checkpoint-v35g25.ts:94-193`, `createGoal25PreVerifierCheckpointV35`, correctly reopens the public Session, reconciles known Provider usage, checks Tool closure, snapshots Session/Workspace, checks protected bytes, and writes the checkpoint before the Verifier.
- `inspectGoal25PreVerifierCheckpointV35` at `:196-229` authenticates the checkpoint and its stored Runtime, first-payload, Session-snapshot, and Workspace-snapshot artifacts. It accepts no live Session, Workspace, task-policy, or protected-before inputs and therefore cannot compare the current execution state to those snapshots.
- `handoffGoal25VerifierV35` at `:232-252` calls that stored-artifact inspection and immediately invokes `runVerifier`. In the real controller, `workbench/src/v35g25/pair-v35g25.ts:305-306` uses exactly this handoff for budget terminals without a live-state check between persisted checkpoint and Verifier.
- The settled path has the missing protection: `inspectGoal25SettledVerifierHandoffV35` in `workbench/src/v35g25/checkpoint-v35g25.ts:353-408` reopens the **current** Session, validates its entry count/digest and Tool closure, and recomputes current Workspace/protected digests immediately before the Verifier.
- `workbench/tests/v35g25-termination-safe.test.ts:398-424` changes checkpoint summary fields in memory and tests `goal25CheckpointGateErrors`; it does not mutate the live Session or Workspace after checkpoint persistence and call `handoffGoal25VerifierV35`. By contrast, settled-handoff live tampering is exercised at `:264-306`.

**Reachable failure:** After a valid budget-terminal checkpoint is written, the live JSONL Session or Workspace can change while the content-addressed checkpoint snapshots remain intact. The budget handoff validates only those stale snapshots, invokes the external Verifier once against the changed live Workspace, and can mark Base eligible so Candidate starts. This violates the named Session-mismatch and Workspace/protected-drift zero-Verifier/zero-Candidate conditions and breaks the checkpoint-to-Verifier state binding.

**Smallest correction boundary:** Limit correction to the budget-terminal inspection/handoff in `workbench/src/v35g25/checkpoint-v35g25.ts`, its call site in `workbench/src/v35g25/pair-v35g25.ts`, required contract types if signatures change, and the focused test. Reopen and authenticate the current Session and recompute current Workspace/protected state immediately before the budget-terminal Verifier, using the persisted checkpoint identity as authority. Add post-checkpoint Session, Workspace, and protected-byte mutations that each prove zero Verifier calls and zero Candidate starts. Reuse the settled-handoff pattern; do not create a new subsystem.

## Five-boundary disposition

### 1. Public Tool termination - FAIL

**Fact:** `public_test` is model-visible as the sole legal command ID (`workbench/src/pi/tool-profile.ts:230-245`; `workbench/src/v35g25/case-v35g25.ts:3-18`), unknown IDs fail closed (`tool-profile.ts:370-375`), and only successful non-timeout `public_test` returns `terminate: true` (`:384-395`). Pinned Pi persists the Tool Result before applying batch termination (`agent-loop.ts:472-485`, `:773-791`), and its harness persists message-end entries and settles at agent end (`agent-harness.ts:538-562`).

**Fact:** Finding `V3G25-AUDIT-P1-001` prevents the stronger required claim that this successful public Tool Result actually terminates the accepted loop with no Provider follow-up.

### 2. Budget-terminal quiescence - FAIL

**Fact:** `runTerminationSafeHarness` refuses attempt 17 locally before reservation/dispatch (`workbench/src/pi/pi-adapter-v35g25.ts:168-190`), requires 17 attempts/16 dispatches, zero pending Provider/Tool/side-effect state, and known usage (`:215-258`). The checkpoint independently reopens Session data, reconciles reservations to raw assistant usage, verifies Tool closure and terminal Workspace/protected identity, and persists its authenticated snapshots before the Verifier (`workbench/src/v35g25/checkpoint-v35g25.ts:94-193`). The focused positive path observes 17/16/16 and one Verifier (`workbench/tests/v35g25-termination-safe.test.ts:340-396`).

**Fact:** Finding `V3G25-AUDIT-P1-002` leaves a post-checkpoint live-state window in which named drift conditions can reach the Verifier and Candidate gate.

### 3. Settled Verifier handoff - PASS

**Fact:** `createGoal25SettledVerifierHandoffV35` authenticates persisted Runtime and complete first-payload evidence, reopens the public JSONL Session, requires Tool-call/Tool-result closure, snapshots Workspace/Session state, and writes the handoff (`workbench/src/v35g25/checkpoint-v35g25.ts:255-335`). Inspection then reauthenticates artifacts, reopens the current Session, verifies exact count/digest/Tool closure, and recomputes live Workspace/protected state before exactly one Verifier (`:353-438`).

**Fact:** Focused tests cover the valid one-Verifier path and persisted Runtime, Tool-result, Workspace, protected-byte, missing-payload, and tampered-payload failures with zero Verifiers/Candidates (`workbench/tests/v35g25-termination-safe.test.ts:233-306`).

### 4. Evidence and fairness - PASS

**Fact:** `prepareGoal25PairV35` creates byte-identical Base/Candidate Workspaces from the frozen fixture and freezes one Case/Verifier authority (`workbench/src/v35g25/pair-v35g25.ts:152-198`). Each arm receives the same Task, Tool restrictions, budgets, and Verifier path, with Candidate Skill binding as the treatment (`:201-319`; `workbench/src/v35g2/state-selection-v35g2.ts:67-76`).

**Fact:** The actual first Provider payload is captured from the public hook and normalized only at the exact final user treatment text (`workbench/src/v35g2/payload-fairness-v35g2.ts:37-95`). Comparison requires equality of normalized payload, Tool projection, system messages, model, request fields, and top-level keys (`workbench/src/v35g25/payload-fairness-v35g25.ts:15-36`). The focused fairness test passes (`workbench/tests/v35g25-termination-safe.test.ts:427-460`).

**Fact:** Session/Run evidence uses pair-root-relative content-addressed refs plus Session entry count/digest and an authenticated link digest (`workbench/src/v35g25/pair-v35g25.ts:111-135`; focused test `:462-481`). Candidate execution is gated on Base having a non-null, non-invalid external-Verifier Task Outcome, and source/Pi identity is rechecked before Candidate (`pair-v35g25.ts:397-405`).

### 5. Dormant real entry - PASS

**Fact:** `parseGoal25RealPairArgumentsV35` requires exactly five unique flag/value pairs, the exact authorization token, and a 40-hex audited baseline (`workbench/src/v35g25/real-entry-v35g25.ts:18-43`). Credential resolution is deferred to the returned opaque resolver (`:46-53`).

**Fact:** The controller verifies exact clean project `HEAD` and exact clean pinned Pi before constructing the per-arm execution port (`workbench/src/v35g25/pair-v35g25.ts:138-150`, `:397-405`, and arm construction at `:233`). The factory permits only one construction per arm (`:361-372`); each resulting DeepSeek port is one-use and resolves the credential only inside `execute` (`workbench/src/pi/pi-adapter-v35g25.ts:323-390`).

**Fact:** The focused entry test rejects missing/wrong arguments before pair creation, observes zero resolver reads during composition, constructs at most Base and Candidate once, and preserves zero access (`workbench/tests/v35g25-termination-safe.test.ts:483-529`). The real entry was not executed in this audit.

## Verification commands and results

All test commands ran from `C:/Users/HUAWEI/.codex/worktrees/558f/project2/workbench`; identity and diff commands ran from the project root. No dependencies were installed.

| Command | Exit/result |
|---|---|
| root `git rev-parse HEAD` and tracked status; pinned Pi `git rev-parse HEAD` and tracked status | `0`; exact identities, both clean |
| `npm.cmd run v35g25:typecheck` | `0`; strict TypeScript clean |
| `npm.cmd run v35g25:test` | `0`; 10/10 passed |
| `npm.cmd run v35g2:test` | `0`; 8/8 passed |
| first `npm.cmd run v35g1:test` | `1`; 0/1, failed before test execution because this linked worktree lacked the ignored Goal 1 loader |
| supplemental Goal 1 run through `./scripts/v35g2-public-pi-loader.mjs` | `1`; 5/6 passed, process-bound test still required the missing ignored Goal 1 loader |
| final `npm.cmd run v35g1:test` after recreating the ignored loader from the repository's existing pinned loader mapping | `0`; 6/6 passed |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2b-r2.test.ts` | `0`; 8/8 passed |
| `git diff --check e174808550211f2236c3a5c08a350a45d1bcab48` before report | `0`; clean |

Final authorized regression state: **32 tests passed, 0 failed, 0 skipped**, plus strict TypeScript. The two initial Goal 1 failures were prerequisite-resolution failures, not behavioral failures; the exact command passed after the ignored loader was restored. Ignored test/runtime artifacts remain under `.runs/`.

## Access counters and change boundary

| Counter | Observed |
|---|---:|
| Credential reads | 0 |
| Network calls | 0 |
| External Provider calls | 0 |
| Real model calls | 0 |
| Real-pair starts | 0 |

Access counters: **`0/0/0/0/0`**. Real cost: **USD 0**.

**Fact:** No source, test, fixture, Contract, control-state, historical evidence, Main report, Pi file, Git index, branch, or history was modified. The only tracked change is this report. The recreated Goal 1 loader and test outputs are ignored audit-local runtime artifacts.

## Remaining limitations that are not findings

- **Unconfirmed:** No real Provider/model path or Base/Candidate pair ran, so external-model behavior, observed Skill effect, real cost, and the Version Question remain unanswered. This is the required audit authority boundary, not a Candidate defect.
- **Unconfirmed:** The zero-access tests do not establish crash recovery, exactly-once Tool side effects, process-kill durability, statistical superiority, or generalization beyond the single frozen Case. These claims are outside Goal 2.5.
- **Fact:** The linked worktree did not initially contain Goal 1's ignored runtime loader. Recreating that ignored prerequisite made the exact accepted Goal 1 regression pass; this is an audit-environment limitation, not a tracked-source finding.

## Stop decision

**Recommendation:** Return findings `V3G25-AUDIT-P1-001` and `V3G25-AUDIT-P1-002` together to the original Goal 2.5 Implementation Session. Re-audit only the corrected Tool-termination/no-follow-up invariant, the budget-terminal live Session/Workspace handoff, their new negative tests, and necessary narrow regressions. Main retains correction, commit, acceptance, and real-execution authority.

This Audit Session stops here. It does not create a commit, update `CURRENT_STATE.md`, freeze an Execution Baseline, or authorize the real pair.

