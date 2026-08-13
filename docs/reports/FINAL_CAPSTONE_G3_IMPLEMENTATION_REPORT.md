# Final Capstone Goal 3 Implementation Report

## Status

`DECISION_REQUIRED_ACCEPTED_PROMOTION_ADMISSION_REGISTRY_SINGLE_SOURCE_CONFLICT`

The Goal 3 correction budget is exhausted at `2/2`. The original implementation Session
adopted each corrected baseline, repeated Gate A, and independently reconstructed the
frozen identities. After correction 2 it resumed only section-5 files, then stopped on one
further acceptance-blocking integration finding. No additional correction was attempted.

## Final corrected Gate A

- Main Control Baseline commit/tree:
  `f672994675cbc337898d5c7dad2712ed83216ad7` /
  `35af253c58c59f26b1e948bda2552be6c7d71482`
- Both canonical Pi checkouts were clean at commit
  `027a5847901b5dde30270abaa1041046cd2b4b55`, tree
  `0aa996c1d6108d5ffd8ff24ff498d08720283f29`.
- Public emitted `AgentHarness` import and pinned TypeScript resolution passed.
- Corrected V0B TaskSpec projection independently reproduced
  `d251789ebbfa8b5f9a59a2fcd695a34723eee1b9d374d8a9caca3461f122e888`.
- The frozen V1 task, instruction, Workspace, Verifier, command, tool, provider, budget and
  Docker identities all matched the corrected Contract.
- Credential/network/Provider/model/real-model counters remained zero.

Neither correction-1 `tool_profile_authority_identity` nor correction-2
`task_schema_verifier_authority_identity` recurred.

## Acceptance-blocking integration finding

The complete chain requires both:

1. an independently recomputable prior fixed-negative Goal 1 admission whose bound V3 Run
   has its own promoted Candidate lineage; and
2. a distinct Candidate produced from that prior admission, published by Goal 2, promoted
   into State, and independently recomputable in the final bound V3 Run.

Accepted `workbench/src/refinement/admission-v3.ts` supports only one project-root source
Candidate/State pair:

- `SOURCE_CANDIDATE_REF` is fixed to
  `fixtures/v3/goal1-real-candidate.json`;
- `SOURCE_STATE_REF` is fixed to
  `fixtures/v3/goal1-real-staged-state.json`;
- `freezeAdmissionRegistryV3` records every registry entry against those same files;
- `loadAdmissionRegistryV3` reloads that pair; and
- `inspectPromotionAdmissionLineageV3` re-derives promotion lineage from that pair and
  rejects any other source references.

The prior fixed-negative bound Run and the newly produced Candidate have different evidence
identity and semantic payload. They cannot truthfully share the one pair. Replacing the
files for the new Candidate makes the prior source admission and promotion lineage fail
recomputation after reopen.

Separate roots preserve each lineage, but accepted
`workbench/src/refinement/regression-gate-g2.ts` rejects their composition:

- `projectRelative` rejects cross-project paths;
- `validatedAdmission` recomputes the Goal 1 admission under the caller's project root;
- `executeRegressionGatedCandidatePublicationG2` requires Run, Workspace, registration and
  admission under that root; and
- `inspectRegressionGatedValidationG2` later recomputes the stored selection and admission
  under the same root.

Copying a State/Decision tree between roots would bypass the existing store/CAS authority.
Switching, deleting, aliasing, linking or overwriting the fixed pair would violate immutable
lineage and fail process-reopen inspection. Closing this gap requires a new per-entry
registry source-reference capability or materially different authoritative composition.

Finding class: `promotion_admission_registry_source_identity_cardinality`.

## Session delta and verification status

The implementation worktree preserves these unstaged, uncommitted, incomplete files:

- `workbench/src/contracts/final-capstone-g3-types.ts`;
- `workbench/src/pi/final-capstone-g3-v36-port.ts`;
- `workbench/src/final-capstone-g3.ts`;
- this Implementation Report; and
- `FINAL_CAPSTONE_G3_CLOSEOUT_DRAFT.md`.

Main did not adopt the three partial source files. They are not Candidate-quality evidence.
The Inspector and focused deterministic test were never created. Gate B/C/D, required
regressions, Candidate freeze, focused audit and real acceptance were not run.

## Access and execution counters

```yaml
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
model_calls: 0
real_model_calls: 0
real_dispatches: 0
dependency_installations: 0
pi_changes_or_private_imports: 0
real_acceptance_run_started: false
real_acceptance_run_consumed: false
```

## Required disposition

`DECISION_REQUIRED`. Reaching the Candidate/audit gate requires an accepted structural
change to promotion-admission registry source identity or a materially different Goal 3
composition. The correction budget is exhausted, so the Main Session must not silently
repair it or create another correction round.
