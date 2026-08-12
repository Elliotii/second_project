# Final Capstone Goal 1 Closeout

```yaml
status: closed_accepted
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
disposition: PASS_FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
rejected_audit_candidate_commit: 0c1c91efcbed3f0db4a3735de1996deff99f9bac
rejected_audit_candidate_tree: 194a90cac93cd1fe4c398f9db3db1829f0b9196e
accepted_correction_commit: null
accepted_correction_identity: file_sha256_inventory_below
post_acceptance_correction_candidate_commit: 5ff70947465f9dc2cbccd5d6e4ca10b6afb3868d
post_acceptance_closeout_amendment: docs/reports/FINAL_CAPSTONE_G1_POST_ACCEPTANCE_CLOSEOUT_AMENDMENT.md
credential_reads_observed: 0
external_network_calls_observed: 0
external_provider_or_model_calls_observed: 0
real_model_calls_observed: 0
goal_2_implementation_authorized: false
```

## Main acceptance decision

**Decision.** `ACCEPT` and `CLOSE GOAL 1` with disposition
`PASS_FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION`.

**Fact.** The accepted implementation establishes a Host-controlled, fail-closed boundary
for exactly three source families, freezes their provenance and identity into an immutable
admission record plus existing `FrozenEvidenceV3`, and delegates trigger semantics to the
unchanged V3 projector.

**Fact.** The public derivation, admission and reopen boundaries no longer accept an
authorization object. Eligibility is granted only by the module-private fixed Host approval
root in `workbench/src/refinement/evidence-admission-g1.ts#fixedHostApprovalG1`. Changing an
approval requires a reviewed Host source change; caller-created objects, IDs, digests,
booleans and paths cannot extend the root.

**Fact.** The Goal does not create or mutate a Candidate, State version, active pointer,
Workspace, Source, accepted historical evidence or Pi. It does not authorize Goal 2 State
assessment, publication, replacement, promotion, rollback or product binding.

## Finding closure

| Finding | Final evidence | Disposition |
|---|---|---|
| `G1-MAIN-P1-001` unbound V3 base State admitted as bound follow-up | Adapter requires State version greater than zero, a non-empty applicable binding, non-null promotion lineage and matching State digest/runtime path; explicit version-0 negative passes | CLOSED |
| `G1-MAIN-P1-002` Candidate Path IDs relabeled as Run IDs | V2 admission freezes the one actual Run ID, retains both Candidate Paths in provenance and omits schema-1 peer-Run comparison | CLOSED |
| `G1-AUDIT-P1-001` caller can mint Host eligibility | Public APIs accept no approval material; the fixed Host root rejects changed registrations and the preserved combined registration-plus-authorization forgery at derivation, file admission and reopen | CLOSED |

The first post-audit correction, which merely moved the grant to a second caller-created
plain object, remains rejected historical evidence. It is not part of the accepted
implementation.

## Contract and regression verification

Main reran the exact Contract matrix from
`C:/Users/HUAWEI/.codex/worktrees/g25main/project2/workbench` using existing local
dependencies:

| Command | Exit | Result |
|---|---:|---|
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit` | 0 | strict TypeScript PASS |
| `node --test tests/final-capstone-g1-evidence-admission.test.ts` | 0 | 22 passed, 0 failed |
| `node --test tests/v3g1-evidence-to-candidate.test.ts` | 0 | 13 passed, 0 failed |
| `node --test tests/v3g2-validate-promote-reject-rollback.test.ts` | 0 | 6 passed, 0 failed |
| `node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts` | 0 | 8 passed, 0 failed |

Aggregate: **49 passed, 0 failed**, plus clean strict TypeScript.

The focused suite proves positive V0-B/V0-C, V2 and promoted-bound-V3 family coverage;
idempotent/write-once reopen; independent Inspector recomputation; source/Verifier/
terminal/lineage/attribution integrity; exact-key validation; path escape, junction/reparse
and prohibited-hardlink rejection; cross-project and stale-Inspector rejection; unbound or
ambiguous State rejection; admission/evidence digest tamper rejection; and no mutation of
Source, State, pointer or Workspace bytes.

Pinned Pi remained clean at
`027a5847901b5dde30270abaa1041046cd2b4b55` / tree
`0aa996c1d6108d5ffd8ff24ff498d08720283f29`.

## Accepted source identity

No corrected Candidate commit was created because this Main handoff did not include Git
commit authority. The accepted bytes are frozen for this Closeout by SHA-256:

| Path | SHA-256 |
|---|---|
| `workbench/src/contracts/final-capstone-g1-types.ts` | `f77f7e87f34c650aced5b1854a6ffa415eeadf1070517bd6199aba3ef92013b2` |
| `workbench/src/refinement/evidence-admission-g1.ts` | `a71b813c59f4e008b8f6c83a6381b500a7476cdd2a8e525eb575a927e9911493` |
| `workbench/src/inspect-final-capstone-g1.ts` | `19f0c4584df342e29267a8c501d2cbf4a45f7fe7c47dd49fe0fa0e64f566cc74` |
| `workbench/tests/final-capstone-g1-evidence-admission.test.ts` | `5b9696418a2c2bb8eb8e045d85c0ddad4f8f26f6bf27ef2cc698c50d57721cf2` |

Only the five Contract-allowed tracked correction paths were modified relative to the
rejected Candidate; staging was empty and `git diff --check` passed. Existing Main/audit
records and the pre-existing untracked Case Evidence Audit were not adopted as source.

## Audit governance record

**Fact.** Frozen Candidate `0c1c91e` received the required fresh focused independent audit;
that audit found `G1-AUDIT-P1-001`, and Main rejected the Candidate. The first correction
was also rejected by Main after the preserved combined-forgery reproduction remained green.

**Fact.** The final hit-only correction has not received a second independent Session
re-audit. The Replacement Final Capstone Main handoff explicitly directed Main to perform
formal acceptance from the existing correction, defensive regression, complete Contract
matrix, recorded results, reports and source, without reopening adversarial research. Main
therefore closes the exact audited hit through preserved deterministic regression and the
full Contract matrix. This is a disclosed control-route decision, not a claim of fresh
independent re-audit.

## Claim limits and remaining unverified items

- The fixed approval root is an in-process Host source boundary, not cryptographic signing,
  an OS permission boundary or a runtime enrollment service.
- Adding an approved registration requires an authorized source change and review.
- Goal 1 proves trusted Evidence admission and existing V3 projection only. It does not
  prove State assessment, regression-gated State publication, V3.6 effective binding or a
  real closed loop.
- Ordinary free-input V3.6 evidence remains unverified and ineligible.
- No fresh independent Session re-audit reviewed the final hit-only correction, as disclosed
  above.

There is no remaining Goal 1 Contract finding and no architecture-level
`DECISION_REQUIRED` condition. Goal 2 Contract drafting is now permitted; Goal 2 source
implementation remains separately gated by its detailed Contract.

## Post-acceptance correction amendment

Goal 1 later consumed its sole post-acceptance bounded correction to add one exact fixed
negative V3 bound-State admission required by Goal 2 Gate C. Main accepted that correction
after strict TypeScript and 51/51 frozen regressions. The authoritative amendment and
corrected two-file identities are recorded in
`docs/reports/FINAL_CAPSTONE_G1_POST_ACCEPTANCE_CLOSEOUT_AMENDMENT.md`; it supersedes only
the original two-file hash entries and 49-test count, without broadening the Goal 1 claim.
