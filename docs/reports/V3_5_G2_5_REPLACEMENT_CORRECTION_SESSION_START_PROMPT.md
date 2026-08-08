# V3.5 Goal 2.5 Replacement Correction Session Start Prompt

```yaml
status: authorized_bounded_replacement_correction
goal_id: V3_5_G2_5_TERMINATION_SAFE_REAL_SKILL_CLOSURE
starting_baseline: 0ee2ba3b00980222225fe6b816399bc47b064ef2
original_implementation_session: 019fe1df-6de4-7500-9f4f-7c6a03235233
replacement_reason: original_session_stuck_on_stale_git_approval_after_main_mechanical_commit
source_edit_authority: audit_findings_only
credential_reads_authorized: 0
network_authorized: false
external_provider_or_model_calls_authorized: 0
real_pair_authorized: false
```

You are a fresh top-level bounded Replacement Correction Session for V3.5 Goal 2.5. The
user previously authorized Main to use a new Session when useful. The original owner is
stuck on a stale Git approval for a commit Main already created; this replacement prevents
that mechanical UI state from blocking two accepted focused-audit findings. Main retains
all architecture, control, audit, execution and acceptance authority.

## Gate A

Verify before edits:

1. exact `HEAD` is `0ee2ba3b00980222225fe6b816399bc47b064ef2`;
2. tracked files are clean;
3. pinned Pi is exactly `027a5847901b5dde30270abaa1041046cd2b4b55` and tracked-clean;
4. the frozen audit report is
   `docs/reports/V3_5_G2_5_FOCUSED_INDEPENDENT_AUDIT_REPORT.md` with disposition
   `REVISE_V3_5_G2_5_FOCUSED_AUDIT`;
5. all Credential/network/external Provider/model/real-pair counters begin and remain 0.

Stop if identity is wrong. Do not rebase, reset, switch route, modify Pi or reconstruct
historical evidence.

## Required reading

Read `AGENTS.md`, `CURRENT_STATE.md`, the accepted V3.5 Charter, governance file, formal Goal
2.5 Contract, focused audit report, Main review report, current Implementation Report and
Closeout Draft, then the exact Goal 2.5 source/tests named by the findings. Read applicable
pinned Pi `AGENTS.md` before consulting the cited public Pi loop symbols.

## Only authorized corrections

Implement only `V3G25-AUDIT-P1-001` and `V3G25-AUDIT-P1-002` exactly as bounded in
`V3_5_G2_5_FOCUSED_AUDIT_CORRECTION_PROMPT.md`:

1. bind accepted public-test termination to actual Provider/Tool ordering; if Pi attempts a
   Provider request after a successful terminating `public_test`, reject it locally before
   external dispatch, classify the trajectory invalid, and start zero Verifiers/Candidates;
   preserve the normal sole-successful-public-test settled path;
2. immediately before budget-terminal Verifier handoff, reopen the live public Session and
   compare identity/count/digest/Tool closure to the checkpoint, then recompute current
   Workspace/protected digests and require exact checkpoint/pre-run equality;
3. add only hit-specific mixed-batch and post-checkpoint live-tamper tests.

Do not change Case, Prompt, Skill, Verifier, Tool surface, provider/model, budget, arm order,
fairness, Session authority, Pi route or accepted historical facts. Do not add retry,
fallback, replacement Pair, extra arm/Case or new subsystem.

## Verification and deliverables

- run strict TypeScript, focused Goal 2.5 tests and only affected Goal 2/Goal 1/V2 checkpoint
  regressions;
- keep access counters exactly `0/0/0/0/0` and do not execute the dormant real entry;
- update only `V3_5_G2_5_IMPLEMENTATION_REPORT.md` and
  `V3_5_G2_5_CLOSEOUT_DRAFT.md` to record the two corrections, commands and limitations;
- create one bounded commit containing only allowed source/test/report files;
- if shared Git metadata alone blocks the commit, return an exact clean delta to Main;
- do not modify `CURRENT_STATE.md`, `AGENTS.md`, Charter, governance, Contract, audit report,
  Main reports or prompts;
- do not accept/close Goal 2.5, freeze Execution Baseline or perform real access.

Stop after the commit/report and return the exact SHA, file list, tests and zero-access
counters. Main will perform a narrow review and ask the same audit Session to recheck only
the two findings.
