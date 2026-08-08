# V3.5 Goal 2.5 Post-audit Correction Main Re-review

```yaml
status: PASS_FOR_HIT_ONLY_RECHECK
date: 2026-08-09
audit_baseline: e174808550211f2236c3a5c08a350a45d1bcab48
audit_disposition: REVISE_V3_5_G2_5_FOCUSED_AUDIT
correction_commit: 2df7da60a365ea2de5ca80e8ada1b59048779117
replacement_session: 019fe257-c912-72a1-ac1f-b7dd3b8cf217
real_pair_executed: false
```

## Decision

Main accepts the two focused-audit corrections for a hit-only recheck by the same Audit
Session. No architecture, Case, Tool surface, Prompt, Skill, Verifier, provider/model,
budget, fairness, Pi route or accepted historical authority changed.

### `V3G25-AUDIT-P1-001`

The existing adapter now records a typed post-success Provider-request attempt. The
`before_provider_request` hook rejects that attempt before reservation, dispatch and the
real-access callback. A mixed batch therefore remains at one actual dispatch/response,
persists `trajectory_outcome: invalid`, sets `public_test_terminated: false`, and cannot
reach Verifier or Candidate. The normal sole successful `public_test` path remains settled.

### `V3G25-AUDIT-P1-002`

The budget-terminal checkpoint now records a bounded Session reference and entry count. Its
handoff reopens the current public JSONL Session, compares identity/reference/count/digest
and Tool closure, and recomputes current Workspace/protected digests immediately before the
Verifier. Post-checkpoint Session, Workspace or protected-byte drift stops before Verifier
and Candidate.

## Main verification

Run from the replacement worktree's `workbench/` before the exact bounded commit:

| Command | Result |
| --- | --- |
| `npm.cmd run v35g25:typecheck` | exit 0 |
| `npm.cmd run v35g25:test` | 12 passed |
| `npm.cmd run v35g2:test` | 8 passed |
| `npm.cmd run v35g1:test` | 6 passed |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2b-r2.test.ts` | 8 passed |

Final test state: 34 passed, 0 failed/skipped plus strict TypeScript. Access remained
`0/0/0/0/0`, real cost `0`, and Pi remained pinned and clean.

The replacement Session was necessary only because the original Session remained blocked
on a stale shared-index approval after Main had already created its correction commit. The
replacement began from exact Main baseline `0ee2ba3...`; Main again mechanically staged and
created only the seven allowlisted correction files because the same shared-index permission
boundary recurred. Main did not edit implementation content.

## Next gate

Recheck only the mixed-batch post-success local guard and the budget-terminal live handoff,
plus the affected focused tests. Do not repeat the general audit. If both findings close,
Main may freeze the resulting exact commit as the no-source-edit Execution Baseline.
