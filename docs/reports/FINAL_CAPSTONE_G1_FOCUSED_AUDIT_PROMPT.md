# Final Capstone Goal 1 — Focused Independent Audit Prompt

```yaml
prompt_status: ready_for_frozen_candidate_audit
goal_id: FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
candidate_commit: 0c1c91efcbed3f0db4a3735de1996deff99f9bac
candidate_tree: 194a90cac93cd1fe4c398f9db3db1829f0b9196e
audit_owner: fresh_top_level_focused_independent_audit_session
```

Final Capstone Main has frozen the Candidate and supplied its exact commit/tree below.

You are a fresh independent Audit Session for the frozen Final Capstone Goal 1 Candidate.
You may inspect source and run deterministic regressions. You may not repair source, modify
control state or reports, stage, commit, accept Goal 1 or enter Goal 2.

## Gate A

Before review, prove:

- exact `HEAD == 0c1c91efcbed3f0db4a3735de1996deff99f9bac` and
  tree equals `194a90cac93cd1fe4c398f9db3db1829f0b9196e`;
- tracked/staged worktree clean;
- Candidate contains the accepted Charter, Goal 1 Contract, implementation/test files,
  Implementation Report, Closeout Draft and Main review/re-review reports;
- pinned Pi is `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
- Credential/network/Provider/model/real-model counters are all zero; and
- no dependency installation is required.

If any identity differs, stop with `BLOCKED_FINAL_CAPSTONE_G1_AUDIT_GATE_A` and zero delta.

## Focused audit questions

1. Does only a Host-controlled exact registration grant eligibility, with Agent/browser/
   source-artifact/caller escalation failing closed?
2. Does every supported family rerun its existing authoritative Inspector rather than trust
   copied validity fields?
3. Are path containment, ordinary-file, link/reparse/hardlink, digest, inventory and
   cross-project boundaries fail closed on both admission and reopen inspection?
4. Are V0-B/V0-C terminal, Outcome, Verifier and attribution identities preserved without
   relabeling infrastructure/evidence/user failures as Improvement triggers?
5. Does V2 preserve exactly one Run identity while keeping Candidate Paths, Seed/group,
   hard gates, common Verifier and Selection distinct, with no Candidate Path encoded as a
   peer Run?
6. Does V3 require a genuinely promoted and applicable bound State, non-null recomputable
   lineage and matching runtime path, while rejecting version 0/empty binding/null lineage?
7. Does the admission record freeze all provenance needed for Goal 2 without changing
   `FrozenEvidenceV3` schema 1 or existing projector semantics?
8. Are persistence and reopen inspection deterministic/write-once-equivalent and does
   admission leave Candidate, State, pointer, Workspace, Source and accepted history unchanged?
9. Does any path silently create a fourth source family, generic registry/framework,
   product integration, State mutation or broader authority?

Review the two closed Main findings explicitly and report any regression.

## Required commands

```powershell
node 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.json --noEmit
node --test tests/final-capstone-g1-evidence-admission.test.ts
node --test tests/v3g1-evidence-to-candidate.test.ts
node --test tests/v3g2-validate-promote-reject-rollback.test.ts
node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts
```

Use existing local dependencies only. Do not access Credentials or external services.

## Output

Create only an audit-local ignored report/evidence unless Main separately names a tracked
report path. Return one disposition:

- `PASS_FINAL_CAPSTONE_G1_FOCUSED_AUDIT`; or
- `REVISE_FINAL_CAPSTONE_G1_FOCUSED_AUDIT` with findings prioritized P0–P2.

For every finding cite exact file, symbol/line, reproduction and Contract consequence.
Separate blocking findings from non-blocking observations. Then stop for Main review.
