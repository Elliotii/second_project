# Final Capstone Goal 3 Structural Amendment Gate A Credential Exposure Stop

```yaml
status: DECISION_REQUIRED_CREDENTIAL_ROTATION
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
amendment_id: FINAL_CAPSTONE_G3_PROMOTION_ADMISSION_PER_ENTRY_SOURCE_AUTHORITY
implementation_session: 019ff9dd-2a00-7043-a0b7-3f88312afaaf
implementation_worktree: C:/Users/HUAWEI/.codex/worktrees/e9e9/project2
control_baseline_commit: 1c1a1d4aa72a80035a9b413631327801b6bd907c
control_baseline_tree: d9b5130152ccec0c015e2bbb83079f57700c57e3
structural_amendment_correction_budget: 0_of_1_consumed
real_run_started: false
real_run_consumed: false
```

## Fact

During zero-call Gate A dependency-resolution checking, the dedicated implementation
Session mistakenly enumerated environment variables. Its tool output printed the value of
`ANTHROPIC_AUTH_TOKEN`.

The Session stopped immediately and later provided an incident-only summary without
reproducing, hashing, measuring or otherwise exposing the value again. It confirmed:

- the value appeared in tool output visible in that dedicated task;
- no workspace file captured the value;
- no network, external Provider, model or real-model call occurred;
- no real acceptance Run started;
- no file was staged or committed; and
- no control state was edited by the Session.

Main did not read the original tool output or the exposed value. Main inspected only the
worktree's file-name/status surface. The stopped worktree contains two modified, unstaged,
unaccepted partial source files:

- `workbench/src/contracts/v3g3-types.ts`;
- `workbench/src/refinement/admission-v3.ts`.

Main has not adopted, executed, copied, staged, committed or deleted that partial delta.

## Classification

This is a credential-safety execution fault, not a Main implementation finding and not a
Structural Amendment correction round. The Structural Amendment budget remains `0/1`.
The original Goal 3 budget remains exhausted at `2/2` and is unchanged.

The zero-Credential precondition for this Session is irrecoverably violated. The same
Session cannot continue even after token rotation because its Gate A evidence is no longer
zero-read.

## Required user action

Treat `ANTHROPIC_AUTH_TOKEN` as compromised and revoke/rotate it through the account or
secret-management surface that issued it. Do not send the old or replacement value in this
task.

After the User confirms rotation, Main may create one fresh replacement top-level zero-call
implementation Session from a newly frozen clean control baseline. The replacement Session
must not enumerate environment variables or read credentials; dependency resolution must
use explicit known paths and non-secret metadata only.

## Preserved gates

- The Formal Structural Amendment remains frozen and binding.
- Candidate freeze and mandatory focused audit have not started.
- Credential/network/Provider/model authority remains zero for deterministic work.
- The unique real Goal 3 acceptance Run remains unconsumed.
- No rerun, fallback, replacement task, task swap, result hunting or manufactured failure
  is authorized.

Disposition:

`DECISION_REQUIRED_ROTATE_ANTHROPIC_AUTH_TOKEN_THEN_FRESH_ZERO_CALL_SESSION`

