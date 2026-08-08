# V3.5 Goal 2.5 Zero-access Implementation Report

```yaml
status: ZERO_ACCESS_CANDIDATE_READY_FOR_MAIN_REVIEW
goal_id: V3_5_G2_5_TERMINATION_SAFE_REAL_SKILL_CLOSURE
session_role: new_top_level_goal_2_5_implementation_session
control_baseline_commit: 6e56a3f7e6048f74a46791af463c4e2d2f98f5b8
implementation_commit: SELF
implementation_commit_resolution: the exact commit SHA containing this report is returned in the Session handoff because tracked bytes cannot contain their own Git object identity
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
real_pair_executed: false
goal_accepted_or_closed: false
```

## 1. Outcome

Fact: the bounded Goal 2.5 zero-access Candidate is implemented and its required mechanism
proof passes. The Candidate exposes the frozen `public_test` command ID in the actual Tool
interface, terminates only its successful public Tool result, distinguishes request attempts
from actual Provider dispatches, preserves the typed seventeenth-attempt local stop without
the Goal 2 secondary accounting failure, persists a V2-derived quiescence checkpoint before
Verifier handoff, and keeps Trajectory and Task outcomes orthogonal.

Fact: this Session did not read credentials, use external network access, call an external
Provider/model, execute a real model, or execute the real Base/Candidate pair. It did not
edit Pi, `CURRENT_STATE.md`, governance, the Charter, the formal Contract, historical
evidence, or accepted authority artifacts.

Recommendation: Main should perform its light source/evidence review. If Main accepts this
Candidate, the Contract-authorized fresh focused audit remains the next Gate. The real pair
must remain locked until Main freezes the exact audited Execution Baseline.

## 2. Gate A record

| Check | Observed fact | Disposition |
|---|---|---|
| Root `HEAD` | `6e56a3f7e6048f74a46791af463c4e2d2f98f5b8` | PASS |
| Root tracked status before implementation | clean | PASS |
| Worktree | `C:/Users/HUAWEI/.codex/worktrees/8b47/project2`, detached `HEAD` | RECORDED |
| Pinned Pi checkout | shared read-only checkout `D:/AI/AI_Projects/project2/.upstream/pi` | RECORDED |
| Pi `HEAD` | `027a5847901b5dde30270abaa1041046cd2b4b55` | PASS |
| Pi tree / status | tree `0aa996c1d6108d5ffd8ff24ff498d08720283f29`, clean | PASS |
| Ignored `.runs/` / reference material | preserved; none staged or committed | PASS |

## 3. Source delta and purpose

| File | Purpose |
|---|---|
| `workbench/src/pi/tool-profile.ts` | Derives the optional command-ID schema/description from frozen descriptors, tracks pending side effects, and returns public `terminate: true` only for configured successful non-timeout commands. Existing callers retain their prior behavior unless they opt in. |
| `workbench/src/contracts/v35g25-types.ts` | Defines typed runtime, reservation, checkpoint, Trajectory/Task outcome, and handoff evidence. Pre-Verifier Task outcome is `null`; only the Verifier handoff writes `passed` or `failed`. |
| `workbench/src/pi/pi-adapter-v35g25.ts` | Adds the Direct public `AgentHarness` Goal 2.5 route, actual Tool-projection digest capture, separate request-attempt/dispatch counters, typed local request-budget stop, actual-response-only usage reconciliation, Tool/side-effect quiescence, Faux proof port, and dormant one-Run DeepSeek composition. |
| `workbench/src/v35g25/case-v35g25.ts` | Narrows the Goal 2.5 Tool correction to the frozen Goal 2 Case and its sole legal `public_test` command. |
| `workbench/src/v35g25/checkpoint-v35g25.ts` | Adapts the V2 pre-Verifier checkpoint: raw reservation/response reconciliation, public Session reopen equality, Tool Result closure, side-effect closure, Workspace/protected snapshots, first-payload lineage, tamper checks, and Verifier gating. |
| `workbench/src/v35g25/payload-fairness-v35g25.ts` | Requires Base/Candidate actual first payload equality outside the frozen Skill treatment and freezes their shared Tool-interface digest. |
| `workbench/src/v35g25/pair-v35g25.ts` | Provides the later no-source-edit Base-first/Candidate-second real-pair controller with new identities, fresh Sessions/Workspaces, one Verifier per valid arm, Candidate gating, fairness, pair budgets, and fail-closed pause evidence. It was not executed in this phase. |
| `workbench/tests/v35g25-termination-safe.test.ts` | Supplies the Contract section 6 focused zero-access proof and negative checkpoint matrix. |
| `workbench/package.json` | Adds focused Goal 2.5 typecheck/test commands and makes the existing Goal 2 loader path explicit for Node 24 on Windows. |
| `docs/reports/V3_5_G2_5_IMPLEMENTATION_REPORT.md` | This Implementation Report. |
| `docs/reports/V3_5_G2_5_CLOSEOUT_DRAFT.md` | Non-accepting Closeout draft for Main. |

No dependency, Pi, runtime-route, frozen Case, Prompt, Skill, Verifier, model/provider, budget,
order, or fairness change was made.

## 4. Verification commands and exact results

| Command | Exit | Result |
|---|---:|---|
| `npm.cmd run v35g25:typecheck` | 0 | strict TypeScript PASS |
| `npm.cmd run v35g25:test` | 0 | 6 passed, 0 failed/skipped |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/tool-profile.test.ts` | 0 | 6 passed, 0 failed/skipped |
| `npm.cmd run v35g2:test` | 0 | 8 passed, 0 failed/skipped |
| `npm.cmd run v35g1:test` | 0 | 6 passed, 0 failed/skipped |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2b-r2.test.ts` | 0 | 8 passed, 0 failed/skipped |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts` | 0 | Main-observed supplemental result: 8 passed, 0 failed/skipped |
| `git diff --check` | 0 | no whitespace errors |

This Session directly recorded 34 passing tests. Main supplied the exact additional V3
regression result (8/8) after correcting the ignored evidence-path boundary; it is recorded
as supplemental evidence and does not change this Session's access counters.

## 5. Contract section 6 proof disposition

| Required proof | Evidence | Disposition |
|---|---|---|
| Strict TypeScript | `v35g25:typecheck` | PASS |
| Exact visible `public_test`; unknown fail closed | focused test 1 | PASS |
| Successful Faux public Tool Result, no follow-up, one public `settled` | focused test 2 plus runtime/Session artifacts | PASS |
| Failed/timed-out checks do not terminate | focused test 3 | PASS |
| Seventeenth attempt refused; 16 dispatches; no seventeenth external call; primary stop preserved | focused test 4 and `runtime-v35g25.json` | PASS |
| Positive checkpoint precedes exactly one Verifier and permits Candidate | focused test 4 and checkpoint/outcome artifacts | PASS |
| All named negative checkpoint fixtures run zero Verifiers/Candidates | focused test 4 negative matrix | PASS |
| Base/Candidate first payload equality outside Skill | focused test 5 | PASS |
| Goal 2 + narrow Goal 1/V3/V2 regressions | command table | PASS |
| Counters `0/0/0/0/0` | focused test 6 and evidence index | PASS |

## 6. Evidence index

Tracked summary:

- `docs/reports/V3_5_G2_5_IMPLEMENTATION_REPORT.md`
- `docs/reports/V3_5_G2_5_CLOSEOUT_DRAFT.md`

Ignored raw index:

- `.runs/v3-5-g2-5/zero-access-implementation-20260808/evidence-index.json`

Latest focused raw roots:

- success: `.runs/v3-5-g2-5/tests/successful-termination-12492-1786203788792-cea2e51dbc77d8/`
- budget terminal/checkpoint/outcome: `.runs/v3-5-g2-5/tests/budget-terminal-12492-1786203789224-5709fab00638d8/`
- Base payload: `.runs/v3-5-g2-5/tests/payload-base-12492-1786203789406-75e57d98770ea8/`
- Candidate payload: `.runs/v3-5-g2-5/tests/payload-candidate-12492-1786203789586-c29e3a0a2f5df8/`

The ignored Goal 1 loader copy lives only under this allocated worktree at
`.runs/v3-5-g1/runtime/public-pi-loader.mjs`; it references the accepted emitted G006 Pi
runtime read-only and is not staged or committed.

## 7. Zero-access counters

```yaml
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_cost_usd: 0
```

Fact: the dormant DeepSeek factory was typechecked and its construction boundary remained
uninvoked. No `.env.g005` or other credential source was read.

## 8. Deviations and limitations

No semantic or scope deviation occurred.

Mechanical observations:

1. PowerShell blocked `npm.ps1`; all recorded npm commands use `npm.cmd`.
2. The historical Goal 1 loader was absent in this worktree. An ignored equivalent was
   created under the allocated worktree only, after which the exact regression passed 6/6.
3. The first local V3 regression attempt encountered the historical hard-coded Main
   `.runs` path boundary. Main directed that this Session not remain blocked, supplied an
   exact 8/8 result, and required it be recorded as supplemental evidence. No further
   escalation was requested.

Remaining limitations:

- the focused independent audit has not run;
- Main has not reviewed or frozen an Execution Baseline;
- the dormant real DeepSeek composition has not been executed;
- the real Base/Candidate pair, its two external Verifiers, comparison, and cost evidence do
  not exist;
- no Skill-effect claim, Goal acceptance, Goal closeout, Goal 3 activation, or final V3.5
  acceptance is supported by this Candidate.

## 9. Gate and Exit-Criteria disposition

| Item | Disposition |
|---|---|
| Accepted Contract and clean Control Baseline precede implementation | PASS |
| Zero-access implementation/proof | PASS |
| Main light review | PENDING |
| Fresh focused audit | PENDING |
| Exact audited Execution Baseline | PENDING |
| Single real Base/Candidate pair | NOT AUTHORIZED IN THIS PHASE / PENDING |
| Final evidence review and user acceptance | PENDING |
| Pi, V3 State authority, V3.5 Goal 1 and closed facts unchanged | PASS |

## 10. CURRENT_STATE_UPDATE_PROPOSAL

For Main only; this Session did not edit `CURRENT_STATE.md`.

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  active_goal: V3_5_G2_5_TERMINATION_SAFE_REAL_SKILL_CLOSURE
  proposed_status: ZERO_ACCESS_CANDIDATE_READY_FOR_MAIN_REVIEW
  control_baseline_commit: 6e56a3f7e6048f74a46791af463c4e2d2f98f5b8
  implementation_commit: USE_SESSION_HANDOFF_SHA
  zero_access_proof:
    strict_typescript: passed
    focused_tests: 6_passed
    narrow_regressions:
      tool_profile: 6_passed
      goal_2: 8_passed
      goal_1: 6_passed
      v2_checkpoint: 8_passed
      v3_main_supplemental: 8_passed
    counters: 0/0/0/0/0
  next_gate: Main light review, then one fresh focused audit if Main accepts the Candidate
  real_pair_authority: locked_pending_exact_audited_execution_baseline
  goal_accepted: false
  goal_3_authorized: false
```
