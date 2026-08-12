# Final Capstone Goal 1 — Post-audit Bounded Correction Prompt

```yaml
prompt_status: ready_for_original_goal_1_working_session
goal_id: FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
rejected_candidate_commit: 0c1c91efcbed3f0db4a3735de1996deff99f9bac
rejected_candidate_tree: 194a90cac93cd1fe4c398f9db3db1829f0b9196e
audit_disposition: REVISE_FINAL_CAPSTONE_G1_FOCUSED_AUDIT
open_finding: G1-AUDIT-P1-001
owner: original_goal_1_working_session
real_access: forbidden
git_commit: forbidden
```

Continue as the original Final Capstone Goal 1 Working Session. Perform one bounded
post-audit correction for `G1-AUDIT-P1-001`, then stop for Main review.

## Binding defect

The rejected Candidate treats caller-authored `authority: "host"` and
`adaptation_eligible: true`, plus a caller-recomputable ordinary digest, as proof of Host
authorization. A caller can clone a valid registration, change its identity, recompute the
digest and obtain an admitted record. This violates Goal 1 Contract section 4.1 and Gate D:
caller data must not self-grant eligibility.

## Required correction semantics

1. Separate registration byte integrity from Host authorization. A registration's own
   fields or self-digest must never be sufficient to grant eligibility.
2. Admission and reopen inspection must require a distinct, exact Host-controlled authority
   input or boundary whose approved registration identity/digest is compared against the
   registration being processed.
3. The Host-controlled value must enter through a separately named trusted parameter or
   fixed Host-owned boundary, not through the same caller-authored registration object or a
   caller-selected arbitrary registration path.
4. Direct derivation without that Host authorization must fail closed. A forged clone with a
   recomputed digest must fail closed even when it claims `authority: "host"` and
   `adaptation_eligible: true`.
5. Admission and reopen inspection must validate the same Host authorization binding so a
   stored admission cannot become valid merely by supplying a forged matching registration.
6. Preserve exact-key validation, the three source families, existing Inspector reruns,
   path/link/hardlink controls, deterministic/write-once behavior, provenance, the two
   previously corrected V2/V3 semantics and zero mutation of Candidate/State/pointer/
   Workspace/Source/history.
7. Do not introduce credentials, signing infrastructure, a generic registry/framework,
   plugin system, product integration or new external dependency. A bounded in-process
   Host-authorized identity/digest binding is sufficient for Goal 1.

## Required tests

Add focused positive and negative coverage proving at least:

- the exact Host-authorized registration still admits and reopens deterministically;
- a cloned registration with changed ID and recomputed self-digest is rejected;
- a forged registration claiming Host authority and eligibility is rejected;
- missing, mismatched or stale Host authorization identity/digest is rejected;
- caller-selected registration bytes/path cannot substitute for the Host-approved identity;
- both previously closed Main findings remain closed; and
- existing integrity, family, immutability and regression cases remain green.

## Allowed delta

Only these Goal 1 files may change:

- `workbench/src/contracts/final-capstone-g1-types.ts`;
- `workbench/src/refinement/evidence-admission-g1.ts`;
- `workbench/src/inspect-final-capstone-g1.ts`;
- `workbench/tests/final-capstone-g1-evidence-admission.test.ts`;
- `docs/reports/FINAL_CAPSTONE_G1_IMPLEMENTATION_REPORT.md`;
- `docs/reports/FINAL_CAPSTONE_G1_CLOSEOUT_DRAFT.md`.

Audit-local ignored evidence may be generated. Do not modify accepted-core V0–V3.6
source/tests/evidence, the Charter, Contract, Main/audit reports, `CURRENT_STATE.md`, Pi,
historical Runs, State, active pointers or product surfaces.

## Verification

Run the exact Contract commands from the authoritative Goal 1 worktree using existing local
dependencies only:

```powershell
node 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.json --noEmit
node --test tests/final-capstone-g1-evidence-admission.test.ts
node --test tests/v3g1-evidence-to-candidate.test.ts
node --test tests/v3g2-validate-promote-reject-rollback.test.ts
node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts
```

Record exact command results, focused adversarial reproduction, changed paths, artifact
hashes, zero-access counters and anything unverified in the Implementation Report and
Closeout Draft. Do not stage or commit. Return the correction to Main and stop.
