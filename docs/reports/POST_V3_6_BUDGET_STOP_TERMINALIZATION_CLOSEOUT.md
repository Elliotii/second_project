# Post-V3.6 Budget-Stop Terminalization Maintenance Closeout

```yaml
status: closed_accepted
date: 2026-08-12
goal_id: POST_V3_6_BUDGET_STOP_TERMINALIZATION_MAINTENANCE
disposition: PASS_POST_V3_6_BUDGET_STOP_TERMINALIZATION_MAINTENANCE
version_status: V3_6_remains_closed_accepted
control_baseline_commit: 1564361a1fd952d38fc58f08202b4fb89950ed07
control_baseline_tree: 210ed728c795fa4d18e85e3cee48af4ee475bced
initial_candidate_commit: d082f1a09dc0756afca5dc7dc39d433d0e73dd53
corrected_candidate_commit: fe0908cefe979e12c2faa403d9e881194d91aa96
corrected_candidate_tree: 3d11fadf53a9a79345b55c3cbfed904b42dcdefc
focused_audit_initial: REVISE_POST_V3_6_BUDGET_STOP_TERMINALIZATION_FOCUSED_AUDIT
focused_audit_final: PASS_POST_V3_6_BUDGET_STOP_TERMINALIZATION_FOCUSED_AUDIT_AFTER_HIT_RECHECK
closeout_commit: resulting_HEAD_of_this_revision
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_core_patches: 0
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_project_execution: 0
source_apply: 0
active_goal: null
```

## 1. Result

The maintenance Goal is complete and accepted. V3.6 remains historically closed and
accepted; this post-closeout correction does not reopen its Version Question.

The exact local seventeenth Provider-request attempt now becomes one typed, immutable
`pre_dispatch_budget_terminal` before dispatch. The Run remains non-settled and
unverified. Persistent Session/Run inspection, the loopback API and the WebUI retain the
managed Workspace, safe Diff, known usage and last registered-command result without
creating a normal settled Manifest or formal Outcome.

## 2. User-visible behavior

For this exact terminal:

- the UI explains that the local request budget stopped the incomplete Run at 16/16
  dispatched requests and attempt 17;
- Files/Changes/Diff remain inspectable and explicitly unverified;
- Export and Discard remain available and non-mutating;
- Apply All is omitted and rejected server-side;
- the failed Session cannot continue; and
- a clean new Session may be minted only from the unchanged authenticated registered
  Source. The failed managed copy never becomes Source.

The 16-request cap is unchanged.

## 3. Evidence integrity

The persistent inspector accepts exactly one terminal form for a Run: a normal settled
`manifest.json` xor the typed `budget-stop.json`. Missing, ambiguous, forged, mismatched
or tampered evidence fails closed.

On creation and reopen, dynamic terminal truth is reconciled independently:

- Provider usage and ordered Tool call/result lifecycle are derived from the authenticated
  Pi Session turn prefix;
- the final registered command is matched to the exact existing Docker command
  `authority.json` and `terminal.json`, including refs, inner digests, command/result,
  frozen profile, cleanup and Authority lineage; and
- rehashed outer usage/Tool/command forgery plus missing, tampered or ambiguous nested
  command evidence is rejected.

## 4. Review history

Main accepted the initial implementation after one ordinary wording/Source-drift test
correction and froze Candidate `d082f1a...`.

The single fresh focused audit returned one finding,
`POST-V3.6-AUDIT-P1-001`: dynamic usage, Tool and last-command fields were initially only
self-consistent within the rehashable terminal. The original Implementation Session made
one Contract-local correction at `fe0908c...`; Main and the original audit Session then
performed hit-specific rechecks. The final audit disposition is
`PASS_POST_V3_6_BUDGET_STOP_TERMINALIZATION_FOCUSED_AUDIT_AFTER_HIT_RECHECK`, with zero
remaining finding.

## 5. Final deterministic verification

Main reran the integrated revision:

| Check | Result |
|---|---|
| strict TypeScript with the pinned existing compiler | PASS |
| `node --check workbench/src/webui/static/app.js` | PASS |
| focused and affected zero-access V3.6/V3.5 suite | 32 passed, 0 failed, 0 skipped |
| `git diff --check` | PASS |
| Pi HEAD/status | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |

The tests used Faux Provider responses, fake persisted registered-command evidence and
loopback HTTP. They did not execute Docker, read a Credential, use external network, call
a Provider/model, apply Source changes or retry the original UX task.

## 6. Claims and limitations

Allowed claim:

> V3.6 terminalizes and safely exposes the exact local pre-dispatch Provider-request
> budget stop without treating the Run as settled or allowing incomplete unverified
> changes to reach registered Source.

This does not prove that the original Mini RPG task completed, that 16 is an optimal cap,
that arbitrary crashes or post-dispatch loss are recoverable, that same-Session resume is
supported, or that a real post-maintenance UX retry passed. Budget tuning and any new real
UX execution remain separate future decisions.

## 7. Evidence map

- Contract: `docs/第二项目_Codex交接包_2026-07-30/POST_V3_6_BUDGET_STOP_TERMINALIZATION_MAINTENANCE_GOAL_CONTRACT.md`
- Implementation: `docs/reports/POST_V3_6_BUDGET_STOP_TERMINALIZATION_IMPLEMENTATION_REPORT.md`
- Initial audit: `docs/reports/POST_V3_6_BUDGET_STOP_TERMINALIZATION_FOCUSED_AUDIT_REPORT.md`
- Hit recheck: `docs/reports/POST_V3_6_BUDGET_STOP_TERMINALIZATION_FOCUSED_AUDIT_HIT_RECHECK_REPORT.md`
- Implementation draft: `docs/reports/POST_V3_6_BUDGET_STOP_TERMINALIZATION_CLOSEOUT_DRAFT.md`

## 8. Final status

The maintenance Goal is closed and accepted. `active_goal` is `null`. V4, a real UX
retry, request-cap tuning and all further real access remain unauthorized.
