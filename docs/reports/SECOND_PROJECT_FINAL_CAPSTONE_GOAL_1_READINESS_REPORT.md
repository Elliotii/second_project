# Final Capstone Goal 1 — Main Readiness Report

```yaml
status: completed_read_only_main_readiness_check
date: 2026-08-13
authoritative_worktree: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
branch: codex/v2-b-bounded-r2
head_commit: 4c4d2f3f397be7784700a2323c2afeaecbad03f0
head_tree: f21b32938beaf638a68749aff28967d79aaa34a0
review_baseline_commit: 257a5f504e7d634d0133211f6be3a1963bdcebff
source_modified: false
readiness: SOURCE_AND_CONTRACT_READY_NOT_ACTIVATED
```

## 1. Main conclusion

**Fact.** No repository fact after Review baseline `257a5f5` changes the Final Capstone
decision. Commit `4c4d2f3` adds only the Final Capability Gap Review, its Goal Amendment,
and the Recovery Integration Decision Review; it changes no Workbench source, test,
fixture or accepted runtime evidence.

**Fact.** Goal 1 is implementation-ready at the source and Contract level. Existing
Inspectors expose sufficient seams for a thin Host admission boundary, and the current V3
projector remains healthy.

**Fact.** Goal 1 is not activated. No implementation Control Baseline, Working Session,
source edit, Candidate commit, Credential/network/model authority or Goal 2 authority has
been granted.

## 2. Material conflict check

No material conflict was found among current accepted source/evidence,
`CURRENT_STATE.md`, the Gap Review and the Amendment.

Three control-environment drifts were found and are non-blocking for the Charter:

1. `D:/AI/AI_Projects/project2` remains an old V1-B worktree with user modifications. The
   current authoritative Final Capstone line is the separate `g25main` worktree at
   `4c4d2f3`. Goal 1 must not execute in the old worktree.
2. Current `AGENTS.md` still contains one stale narrative paragraph saying the V3.6
   Engineering Stabilization Campaign is active, while current `CURRENT_STATE.md`, the
   accepted Campaign Closeout and later sections say it is closed. This does not change
   source facts or Final Capstone scope; Goal 1 is not authorized to repair it.
3. `docs/reports/SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md` exists as a pre-existing untracked
   user file although the Gap Review cites it. Its content supports, but does not solely
   establish, the Gap conclusion. Goal 1 must not modify, stage or adopt it without separate
   Main/User direction.

The Amendment controls the only substantive wording correction: ordinary follow-up Failure
can produce at most `needs_reassessment` absent State-attributable regression, and new
evidence cannot directly supersede active State.

## 3. Source readiness findings

### Existing reusable boundary

- `refinement/evidence-v3.ts` strictly validates `FrozenEvidenceV3` and keeps trigger
  semantics deterministic and fail closed.
- `inspect-v0b.ts` / `inspect-v0c.ts` validate committed verifier-backed Runs.
- `inspect-v2.ts#inspectRunV2A` recomputes Recovery Seed, Candidate, Verifier, selection,
  workspace/session and terminal lineage.
- `inspect-v3.ts#inspectGoal3RunV3` plus `state/binding-v3.ts` recompute bound State,
  Case Authority, runtime Manifest and Verifier lineage.
- artifact/digest/write-once helpers already exist.

### Actual missing seam

There is no Host boundary that selects one of those source families, proves eligibility,
freezes source provenance and emits `FrozenEvidenceV3`. Existing
`refinement/admission-v3.ts` admits an already-built Candidate against the current active
State; it must not be confused with runtime Evidence admission.

### Bounded implementation judgment

**Inference.** A new narrow contract type, admission module, independent Inspector and one
focused test file are sufficient. Existing accepted-core modules can remain unchanged.
If implementation disproves this assumption, the Contract requires a stop rather than an
allowlist expansion.

## 4. Verification record

Executed from `C:/Users/HUAWEI/.codex/worktrees/g25main/project2/workbench` with existing
local dependencies and no installation:

```text
TypeScript --noEmit                                      PASS (exit 0)
v3g1-evidence-to-candidate.test.ts                      PASS 13/13
v3g2-validate-promote-reject-rollback.test.ts           PASS 6/6
v3g3-admission.test.ts + v3g3-selective-reuse.test.ts   PASS 8/8
```

Commands:

```powershell
& 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.json --noEmit
node --test tests/v3g1-evidence-to-candidate.test.ts
node --test tests/v3g2-validate-promote-reject-rollback.test.ts
node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts
```

No Credential, external network, Provider/model or real-model operation was invoked.
No Pi, source, fixture, accepted evidence or control-state file was modified by this check.

## 5. Principal Goal 1 risks

1. **Trust laundering:** copying a source field such as `valid: true` instead of requiring
   the existing Inspector to recompute it.
2. **Eligibility escalation:** allowing Agent/browser/source artifacts to self-assert
   adaptation eligibility, especially daily V3.6 evidence that is intentionally ineligible.
3. **Lineage loss:** emitting `FrozenEvidenceV3` without retaining Verifier, comparison,
   selection or bound-State identity in the admission record.
4. **Authority conflation:** merging runtime Evidence admission with Candidate admission or
   State publication.
5. **Historical backfill:** treating prose Closeouts as raw machine evidence when historical
   roots are unavailable.
6. **Framework creep:** adding a generic schema/adapter registry rather than three bounded
   source-family adapters.

The Goal 1 Contract converts each risk into a fail-closed test or stop condition.

## 6. Recommended Working Session split

Use one fresh top-level Goal 1 Working Session for bounded zero-access implementation,
tests, raw evidence, Implementation Report and Closeout Draft. Main then performs light
review and, after separate authority, freezes a Candidate. Because admission controls
evidence integrity/provenance, use one fresh focused independent Audit Session on that
Candidate. Any bounded correction returns to the original Working Session.

Do not create Goal 2 or Goal 3 Working Sessions now.

## 7. Remaining control actions before launch

1. User accepts or revises the Charter and Goal 1 Contract.
2. User explicitly authorizes Goal 1 activation and a Main-owned Control Baseline commit.
3. Main creates/verifies the clean Control Baseline and substitutes its exact commit/tree
   into the prepared start Prompt.
4. User starts the fresh top-level Working Session.

Until then, the correct state is `SOURCE_AND_CONTRACT_READY_NOT_ACTIVATED`.
