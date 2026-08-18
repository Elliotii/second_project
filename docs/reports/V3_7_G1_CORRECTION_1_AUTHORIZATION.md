# V3.7 Goal 1 Correction Round 1 Authorization

```yaml
status: COMPLETED_CANDIDATE_FAILED_MAIN_REREVIEW
goal: V3_7_G1_REGISTERED_RECOVERY_EVIDENCE_BRIDGE
correction_round: 1_of_2
failed_candidate_commit: 7aca62cc5b329414873bb334ba13547eb9c98d53
failed_candidate_tree: 0f70e8b51b0a4414db42a72b3cfa4bb7cd35b70a
binding_review: docs/reports/V3_7_G1_MAIN_PRELIMINARY_REVIEW.md
implementation_owner: fresh_replacement_goal_1_correction_session
implementation_session: /root/v37_g1_correction_1
candidate_commit: a62051044332d438cbc0f33ec6ccc3f74097ef2f
candidate_tree: 7eb150cdaecb9234d62fde2bba31f1e59dd7f107
main_rereview: docs/reports/V3_7_G1_CORRECTION_1_MAIN_REREVIEW.md
main_rereview_result: failed_one_residual_P1_003
owner_deviation_authorized_by_user: true
owner_deviation_authorized_on: 2026-08-18
owner_deviation_reason: predecessor_session_stopped_with_systemError_and_is_not_successor_resumable
architecture_and_acceptance_owner: authoritative_V3_7_successor_Main_Session
audit_authority: false
goal_2_authority: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_product_tasks: 0
```

## Mission

The accepted default owner was the original implementation Session. That Session cannot be
resumed by the successor Main after its `systemError`. The user explicitly authorized a fresh
replacement Session on 2026-08-18. This is an owner-only governance deviation: the frozen
candidate, correction budget, allowlist, test obligations and acceptance authority are unchanged.

Correct only findings `V37-G1-MAIN-P1-001` through `004` and add the necessary focused
regressions. Preserve the failed candidate commit/tree unchanged; create one new candidate
commit on top of it and return its exact commit/tree to Main.

Required outcomes:

1. A Host-owned pre-execution Primary Run binding ties exact Run ID and normalized Run-root
   identity to the workflow ID/registration and Primary task instance. Recovery derivation,
   persistence, admission and inspection reject an unbound or cross-workflow Run.
2. Registry/configuration baseline resolution is owned by the loader/candidate checkout or
   an equivalently non-caller-selectable frozen Host root. Runtime `projectRoot` cannot
   select another registry baseline, and the trust-root identity includes the loader
   baseline/fingerprint needed to distinguish its authority.
3. Candidate independence validation deterministically loads/recomputes the frozen Primary
   Task, Source and Verifier content identities and rejects direct task answers or
   verifier-derived answer leakage. Static authority indicators remain an additional guard,
   not the sole check. Generic transferable guidance must remain possible.
4. Disable blocks new workflow/execution/package/submission/admission/Candidate actions,
   while read-only inspection of an admission frozen under its pinned accepted envelope
   succeeds and revalidates all historical artifacts. No disabled workflow gains mutation
   authority.

## Exact correction boundary

Only these existing Goal 1 paths may change:

```text
workbench/src/contracts/v37-types.ts
workbench/src/v37/host-registry-v37.ts
workbench/src/v37/workflow-registration-v37.ts
workbench/src/v37/registered-recovery-v37.ts
workbench/src/v37/candidate-v37.ts
workbench/src/inspect-v37g1.ts
workbench/config/v37/registered-cases/registry-v1.json
workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v1.json
workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.r1.json
workbench/tests/v37g1-registered-recovery.test.ts
docs/reports/V3_7_G1_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G1_CLOSEOUT_DRAFT.md
```

Configuration files may change only when mechanically required to bind the corrected
loader fingerprint/baseline. Do not change Case semantics, task/source/verifier bytes,
profiles, budget, stop rules or State scope. Do not edit any old V2/G1/V3/G2 module,
`CURRENT_STATE.md`, Charter, Prompt or Main reports.

## Required deterministic tests

Add focused cases proving:

- the Primary binding is persisted before execution and rejects missing, changed and
  cross-workflow Run identity/root;
- an alternate caller project root cannot select or reproduce Host registry Authority;
- frozen Primary Task, Source and Verifier answer leakage is rejected while a generic
  transferable prompt addendum is accepted;
- after disable, new/mutating actions fail and the exact already accepted admission
  reopens read-only with unchanged identity;
- all original Goal 1 positives/negatives and required accepted regressions remain green.

Run the Goal 1 Prompt Section 10 matrix, the narrowest environment-equivalent strict
TypeScript check when the exact ignored dependency layout is unavailable, `git diff
--check`, allowlist/status checks and Pi cleanliness. Do not install dependencies or read
environment secrets.

## Stop and handoff

Stop for Main if correction requires an allowlist expansion, Charter change, old-family
semantic change, V2/G1/V3/G2 modification, general registry, Runtime Attestation, Pi,
Credential/network/Provider/model/Docker access or Goal 2 work.

On success, update the two implementation reports with the correction delta and exact
verification results, create one new candidate commit/tree, and return only the identity,
changed files, test summary, zero-access counters and remaining unverified items. Do not
audit, accept Goal 1, update control state, tag, push or begin Goal 2.
