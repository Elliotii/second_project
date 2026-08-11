# Post-V3.6 Budget-Stop Terminalization Focused Audit Hit Recheck

```yaml
status: hit_specific_recheck_complete
scope: POST-V3.6-AUDIT-P1-001_only
disposition: PASS_POST_V3_6_BUDGET_STOP_TERMINALIZATION_FOCUSED_AUDIT_AFTER_HIT_RECHECK
corrected_candidate_commit: fe0908cefe979e12c2faa403d9e881194d91aa96
corrected_candidate_tree: 3d11fadf53a9a79345b55c3cbfed904b42dcdefc
parent_initial_candidate: d082f1a09dc0756afca5dc7dc39d433d0e73dd53
prior_audit_report_commit: c6b93430f8c13b310267a222fb93c566c898e759
remaining_hit_specific_findings: 0
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_project_execution: 0
source_apply: 0
```

## Disposition

**Recommendation:** `POST-V3.6-AUDIT-P1-001` is closed. The corrected Candidate passes
the authorized hit-specific recheck. This report does not repeat or broaden the full
audit and does not accept the maintenance Goal; Main retains acceptance authority.

## Hit-specific verification

### 1. Session-derived usage and ordered Tool reconciliation — PASS

**Fact:** `PersistentInteractiveSessionServiceV36.executeBoundedTurn` now records the
pre-Turn Session entry count and digest before dispatch and stores both the pre-Turn and
terminal Session identities in the typed terminal
(`workbench/src/session/persistent-session-v36.ts:490`, `:627-630`).

**Fact:** `reconcileBudgetTerminalSession`
(`workbench/src/session/persistent-session-v36.ts:340`) authenticates the exact Session
prefix and turn boundary, requires one user message, derives the 16 non-error Assistant
Provider responses and their finite non-negative usage, collects ordered Tool-call and
Tool-result IDs, and derives registered-command order from `run_command` arguments. It
rejects any mismatch with terminal Provider response count, input/output/cost usage,
Tool count, ordered Tool closure, command ordinal, or final command ID (`:341-387`). The
same reconciliation runs before terminal creation and on every reopen (`:638`, `:678`).

### 2. Persisted Docker command evidence and lineage — PASS

**Fact:** The terminal now carries the exact command ordinal, Docker Authority digest,
canonical relative Authority/terminal refs, and Docker terminal digest
(`workbench/src/contracts/v36g2-types.ts`, `RegisteredCommandTerminalV36`). The parser
requires the canonical `docker-commands/command-N/{authority,terminal}.json` refs.

**Fact:** `validateBudgetTerminalCommandEvidence`
(`workbench/src/session/persistent-session-v36.ts:324`) requires the exact ordered command
directory set and the exact two-file final-command evidence set. It validates both inner
digests and exact schemas, the frozen backend profile, command ID, execution ID,
Authority digest, terminal digest, exit/timed-out/truncated result, cleanup completion,
inspected profile and inspected exit code, and accepts only succeeded, nonzero-exit or
timed-out terminal states (`:327-337`). Missing, additional/ambiguous, malformed,
digest-tampered or cross-artifact-mismatched evidence fails closed.

### 3. Rehashed and nested evidence tests — PASS

**Fact:** The focused test now rehashes the outer budget terminal after separately
changing usage, Tool count and the last-command exit code; all are rejected by independent
Session or Docker evidence reconciliation. It also removes Docker Authority evidence,
rehashes a changed Docker terminal, and adds ambiguous nested command evidence; all are
rejected. The ordinary missing/ambiguous Runtime terminal, Run Authority mismatch,
Session mismatch and fixed-counter tamper cases remain present
(`workbench/tests/v36-budget-stop-terminalization.test.ts`).

### 4. Correction scope — PASS

**Fact:** Initial Candidate to corrected Candidate changes exactly five files:

- `workbench/src/contracts/v36g2-types.ts`;
- `workbench/src/session/persistent-session-v36.ts`;
- `workbench/tests/v36-budget-stop-terminalization.test.ts`;
- the maintenance Implementation Report; and
- the maintenance Closeout Draft.

There is no source/control expansion beyond the prior finding's Contract-local correction.
No request cap, Pi, Credential, Provider/model, Docker executor, Source/ChangeSet mutation,
normal settled path, WebUI authority, `CURRENT_STATE.md`, Contract, Charter, accepted
Closeout, fixture, or unrelated test changed. `git diff --check` passed.

## Commands and results

| Command | Exit | Result |
|---|---:|---|
| `git rev-parse HEAD; git rev-parse 'HEAD^{tree}'; git status --porcelain=v1` before switch | 0 | Prior audit-report commit `c6b9343...`; tracked/untracked state clean. |
| `git rev-parse fe0908c...; git rev-parse 'fe0908c...^{tree}'; git rev-parse 'fe0908c...^'` | 0 | Corrected Candidate, tree and parent exactly matched the delegated identities. |
| `git switch --detach fe0908cefe979e12c2faa403d9e881194d91aa96` plus identity/cleanliness recheck | 0 | Detached corrected Candidate selected; exact tree; clean state. |
| `git diff --name-status d082f1a... fe0908c...` and `git diff --stat ...` | 0 | Exactly five correction files. |
| `git diff --check d082f1a... fe0908c...` | 0 | No whitespace errors. |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v36-budget-stop-terminalization.test.ts tests/v36g1-authority-session.test.ts` from `workbench/` | 0 | 7 passed, 0 failed, 0 skipped. |

## Limits and access accounting

**Fact:** Per Main direction, strict TypeScript was not retried in this audit worktree;
Main independently passed strict TypeScript on the corrected Candidate. This recheck did
not revisit the prior environment limitation.

**Fact:** No Credential was read; no external network, Provider/model, real-model, Docker
project execution, Source Apply, retry, staging or commit occurred. Tests used Faux/public
loader paths, fake persisted Docker evidence, loopback behavior and ignored test evidence.

**Unconfirmed:** Real Provider and live Docker behavior remain deliberately outside this
hit-specific zero-access recheck.

`POST-V3.6-AUDIT-P1-001` is closed with no remaining hit-specific defect. Stop for Main
review.
