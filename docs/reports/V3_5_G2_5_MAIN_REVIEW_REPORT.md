# V3.5 Goal 2.5 Main Zero-access Review

```yaml
status: PASS_FOR_FOCUSED_AUDIT
date: 2026-08-09
goal_id: V3_5_G2_5_TERMINATION_SAFE_REAL_SKILL_CLOSURE
control_baseline_commit: 6e56a3f7e6048f74a46791af463c4e2d2f98f5b8
initial_candidate_commit: e852f90fa49ae9320896b91338bfb966e328cf98
correction_commit: 6c5ccf7fbc76c5bc51355e707b7eabb194974b19
implementation_owner: top_level_session_019fe1df-6de4-7500-9f4f-7c6a03235233
real_pair_executed: false
goal_accepted_or_closed: false
```

## Decision

Main accepts the corrected zero-access Candidate for the one Contract-authorized fresh
focused audit. This is not Goal 2.5 acceptance and does not unlock the real pair by itself.

The initial review found three related bounded defects:

1. the preferred settled path did not authenticate persisted Runtime/Session/Workspace and
   first-payload state immediately before the Verifier;
2. the frozen Candidate did not contain a complete no-source-edit real execution entry;
3. arm evidence did not directly expose authenticated Session-to-Run linkage.

The original Implementation Session corrected all three without changing the frozen Case,
Prompt, Skill, Verifier, provider/model, budgets, arm order, fairness semantics, Pi route or
accepted authority boundaries.

## Source review

- `checkpoint-v35g25.ts` now persists a distinct settled-handoff record, authenticates the
  persisted Runtime and first payload, reopens the public JSONL Session, checks Tool-result
  closure, snapshots Workspace/protected state, and repeats the live authority checks before
  exactly one Verifier call.
- `pair-v35g25.ts` now uses that handoff on normal settled trajectories, keeps the existing
  V2-derived quiescent fallback for the exact pre-dispatch budget terminal, records a direct
  Session/Run link, and gates Candidate on a valid Base Task Outcome.
- `real-entry-v35g25.ts` and `scripts/v35g25-real-pair.ts` provide a tracked, exact-argument,
  authorization-token-controlled entry. Credential resolution remains environment-only and
  occurs only after exact audited-HEAD and pinned-Pi gates in the execution controller.
- Negative settled fixtures mutate persisted Runtime, Session/Tool-result, Workspace,
  protected bytes and first-payload evidence and observe zero Verifier calls and zero
  Candidate starts.

No second bounded implementation correction is justified by Main's review. The dedicated
focused audit remains necessary because terminalization and Verifier eligibility are
high-risk control-flow boundaries.

## Main verification

Run from `workbench/` at corrected commit `6c5ccf7...`:

| Command | Result |
| --- | --- |
| `npm.cmd run v35g25:typecheck` | exit 0 |
| `npm.cmd run v35g25:test` | 10 passed, 0 failed/skipped |
| `npm.cmd run v35g2:test` | 8 passed, 0 failed/skipped |
| `npm.cmd run v35g1:test` | 6 passed, 0 failed/skipped |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2b-r2.test.ts` | 8 passed, 0 failed/skipped |

`git diff --check` passed. Pinned Pi remained exactly
`027a5847901b5dde30270abaa1041046cd2b4b55` and clean. Credential, network, external
Provider/model and real-model access remained `0/0/0/0`; real cost remained `0`.

One discarded Main command invocation used the repository root instead of `workbench/` and
therefore found no root `package.json`; it changed no source or evidence and was rerun from
the correct directory with the results above.

## Mechanical commit deviation

The correction Session completed source and evidence work but its sandbox could not write
the shared Git worktree index lock. Main mechanically staged exactly the nine authorized
correction files and created commit `6c5ccf7...` on that Session's detached worktree. Main
did not edit the correction content, stage ignored evidence, or broaden scope. This is a
Git-metadata permission deviation, not an implementation-owner or semantic deviation.

## Remaining gate

The fresh audit must inspect only:

- public Tool termination;
- budget-stop quiescence;
- settled and budget-terminal Verifier handoff;
- evidence, Session/Run linkage and Base/Candidate fairness;
- the real entry's fail-before-access boundary.

It must not edit source, inspect credentials, use network/model access, redesign the Goal or
become a general V3.5 audit. Only a passing audit followed by a Main-created exact Execution
Baseline can unlock the single frozen real pair.
