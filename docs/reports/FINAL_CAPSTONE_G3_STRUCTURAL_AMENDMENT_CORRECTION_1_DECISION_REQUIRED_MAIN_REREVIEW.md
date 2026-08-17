# Final Capstone Goal 3 Structural Amendment Correction 1 - Main Re-review

```yaml
status: DECISION_REQUIRED
date: 2026-08-18
goal_id: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
amendment_id: FINAL_CAPSTONE_G3_PROMOTION_ADMISSION_PER_ENTRY_SOURCE_AUTHORITY
correction_round: 1_of_1_exhausted
implementation_session: 019ff9ef-76c4-7da0-bf11-f6ef3b53ea86
implementation_worktree: C:/Users/HUAWEI/.codex/worktrees/06c7/project2
main_control_commit: 04e87d0d509dc177c3701d35754b3defe5442b0b
main_control_tree: 9a3d37266f3ddbc7ad0976ce34931cbda8de281f
candidate_frozen: false
mandatory_focused_audit_started: false
real_acceptance_run_started: false
real_acceptance_run_consumed: false
real_acceptance_runs_max: 1
```

## Main disposition

`Fact`: the dedicated implementation Session returned `DECISION_REQUIRED` during the sole
Structural Amendment correction. It performed no further edits or tests after identifying
that FC-G3-SA-MAIN-P1-001 cannot be satisfied inside the frozen Amendment allowlist.

`Fact`: Main independently reproduced the semantic conflict from the accepted local source:

1. `workbench/src/inspect-v3.ts::inspectGoal3RunV3` requires a schema-1 Faux runtime to
   have `provider_requests === 1`, and also requires
   `provider_dispatches === provider_requests`.
2. `workbench/src/session/persistent-session-v36.ts::executeBoundedTurn` requires at least
   one completed registered Docker command for a settled bounded-edit carrier. Its bounded
   tool profile does not configure successful-command termination.
3. Pinned Pi
   `D:/AI/AI_Projects/project2/.runs/g006/pi/packages/agent/src/agent-loop.ts` continues
   after Tool results unless the Tool batch returns `terminate === true`.
4. The correction worktree therefore projects an honest multi-request V3.6 carrier by
   substituting the outer Faux `provider_dispatches` and `provider_requests` with `1` in
   `workbench/src/pi/final-capstone-g3-v36-port.ts`. It also represents multiple Provider
   payload identities through one aggregate digest.
5. `workbench/src/refinement/evidence-admission-g1.ts::v3Derivation` consumes the accepted
   outer `runtime.provider_dispatches` as Provider-call usage, so the substituted outer
   value is authoritative downstream rather than an ignorable compatibility label.

`Conclusion`: the same projection authority/integrity class named by
FC-G3-SA-MAIN-P1-001 remains unresolved after correction. Eliminating it requires changing
accepted outer V3 schema/Inspector semantics or V3.6 bounded-turn semantics, both outside
the Amendment allowlist. The binding correction-budget rule therefore requires
`DECISION_REQUIRED`; Main may not issue another patch round, freeze a Candidate, start the
mandatory audit, or start the real acceptance Run.

## Preserved implementation state

- The implementation worktree still contains exactly ten changed allowlisted paths: four
  modified tracked paths and six untracked new paths. Nothing is staged or committed.
- Newly added negative tests were not typechecked or executed after the final correction
  edits. Earlier `86/86` evidence predates those edits and cannot qualify the delta.
- The implementation and closeout reports remain non-accepting and stale with respect to
  correction usage and the final stop.
- A transient untracked `workbench/node_modules` junction remains in the implementation
  worktree after one ordinary unlink failure. Main did not retry, escalate, traverse for
  mutation, or adopt it. It is not part of the Git delta and did not consume correction
  budget.
- Credential reads, network calls, external Provider/model calls, real-model calls,
  Source Apply actions, State/pointer mutations and real acceptance Runs remain zero.

## Main decision boundary

The User authorized Main on 2026-08-18 to prepare the recommended evidence-backed decision
proposal for an explicit Final Capstone outer V3 runtime/manifest schema 2. That proposal is
recorded in
`docs/reports/FINAL_CAPSTONE_G3_OUTER_RUNTIME_SCHEMA_2_DECISION_PROPOSAL.md`.

This authorization is authority to prepare and review the proposal only. It is not yet a
formal Contract Amendment, implementation authority, a new correction round, Candidate
authority, audit authority or real-access authority.
