# V3.7 Goal 1 Closeout Draft

```yaml
status: CORRECTION_1_READY_FOR_MAIN_PRELIMINARY_REREVIEW
goal_acceptance: NOT_CLAIMED
focused_audit: PENDING
original_starting_commit: 7d6b62223503309b4c39785eec767b437eee6abd
original_starting_tree: 3adbe64faff229766a60553afa444f3569918b81
control_amendment_integrated_commit: b477a99360bcb93128aaf23b796cc897b2cf1951
control_amendment_integrated_tree: d5c20bb328648e168a1378c34f60ab51f527d02b
candidate_commit: containing_commit_reported_in_session_handoff
candidate_tree: containing_tree_reported_in_session_handoff
failed_candidate_commit: 7aca62cc5b329414873bb334ba13547eb9c98d53
failed_candidate_tree: 0f70e8b51b0a4414db42a72b3cfa4bb7cd35b70a
correction_round: 1_of_2
correction_1_implementation_owner: fresh_replacement_goal_1_correction_session
owner_deviation_authorized_by_user: true
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_product_tasks: 0
goal_2_started: false
```

The containing candidate commit/tree is necessarily reported outside the self-hashed Git
object immediately after the one authorized commit is created.

The original implementation Session stopped with `systemError` and could not be resumed
by successor Main. The user explicitly authorized this fresh replacement Correction
Session. The owner-only deviation changes no Charter decision, allowlist, budget or
acceptance authority.

## Deliverables

The candidate contains exactly the twelve files listed in
`V3_7_G1_IMPLEMENTATION_REPORT.md`: three frozen Host configuration documents, six new
contract/production/inspection source modules, one focused deterministic test file, and
these two reports. No accepted business-source or test file was edited.

Implemented Goal 1 behavior:

- fixed, exact-key, content-addressed Host registry loading and envelope-chain trust;
- exact immutable Manifest including the Main-frozen deterministic follow-up task/source/
  verifier bytes needed for later same-workflow continuity;
- Host-derived immutable workflow and fixed task instances without parameterization;
- honest V2 Primary/Seed/two-Candidate-Path inspection and new Comparison identity;
- distinct immutable Recovery Evidence, confirmation and submission request;
- terminal `admitted` and `rejected/no_valid_recovery` G1 outcomes;
- direct Opportunity projection only from admitted registered recovery truth;
- prompt-only Candidate production bound to the exact active V3 State scope;
- fail-closed reopen against Authority, lineage, source/package mutation and filesystem
  substitution.
- Host-owned pre-execution Primary Run ID/root/workflow/task binding with global Run/root
  uniqueness;
- loader-owned candidate-checkout registry root plus loader contract fingerprint;
- deterministic frozen Primary Task/Source/Verifier content recomputation and direct
  answer-leakage rejection while generic transferable guidance remains accepted;
- disabled-current registration mutation denial with exact pinned accepted admission
  read-only reopen and unchanged identity.

## Frozen identity inventory

```yaml
configuration_baseline_id: v37-g1-host-registry-v1
loader_contract_id: v37-host-registry-loader-v1
registry_index_digest: ce7ddba86bbdd42499ad5977a0bd687fa5b9247de824d3f59623a0085370a523
manifest_body_digest: ca4c3b1bd7eb9b3746031630d9e8409d9e1263e323e97d219b26211c6a748c90
registration_digest: 94fd39a3c84171024df494552bfd4be162ccb4af006ef31dc46e9fe6f85f2724
loader_contract_fingerprint: 0d5a8c6f5cbed31b2ae9d59362f18705a6a0f10e440cedf3fe0f1de079e3d506
registry_trust_root_digest: ba8ecc6ea67b74f08182e7e1c09ee6f2ead8be71187a4b3e41c9451eefb822d7
state_store_scope_digest: ee650680b0e3bf68948125388a6148f870136a0c880778715e8f3009064577c0
initial_state_digest: ef49e812b72b03b23deeffec51e06b9c84f6cdcdfcc9d6c0f7969e70b94b8956
runtime_base_prompt_digest: 317f5fd3d0d2a144b71c2adde124b254c5bc61a704fd89f831738e3ecc752edf
follow_up_task_spec: 1c8c5ca89d0bb16b5cc99e1939e99c40a693c3fca4e0855d26ca79daadc5c1b8
follow_up_source_baseline_spec: 75046aceae2e751dee8b410de1393b7cf3f1743c82ae0e8b35e71f86d319f68d
follow_up_verifier_spec: 59934ae3ec0d8f6fc3254769dab513330002b1e75a57a0c95535375fb7fb1dd8
```

The complete remaining Manifest spec inventory is recorded verbatim in the implementation
report and is part of this Closeout evidence by that fixed report path.

## Verification summary

- V3.7 Goal 1 focused suite: PASS, 13/13.
- Accepted V2 recovery suite: PASS, 5/5.
- Accepted V3 G1 suite: PASS, 13/13.
- Accepted V3 G2 suite: PASS, 6/6.
- Final Capstone G1 with inherited fixed child loader: PASS, 24/24.
- Final Capstone G2 with inherited fixed child loader: PASS, 10/10.
- Strict environment-equivalent compile of every new TS/test root using pinned Node/Pi
  declarations: PASS, 0 diagnostics.
- Exact repository `tsc` stopped at `TS2688` because ignored Node declarations are absent
  from this isolated worktree.
- Exact Capstone commands reached 23/24 and 8/10; their only failures were spawned child
  processes that did not inherit the parent loader. The inherited-loader reruns above
  demonstrate the same test bodies pass without a source change.

Exact commands and the environment qualification are recorded in the implementation
report. No fixture was fabricated and no dependency was installed.

## Exit-criteria draft assessment

| Criterion | Draft result |
|---|---|
| Registered Manifest/Envelope/workflow Authority fails closed | satisfied by deterministic tests |
| V2 recovery truth and Candidate Path identity preserved | satisfied |
| Evidence/request separation and immutable reopen | satisfied |
| Admit/Reject and Opportunity semantics | satisfied |
| Candidate prompt-only/Base/applicability/State-scope contract | satisfied |
| Old G1/V2/V3/G2 behavior unchanged | source unchanged; accepted regressions pass with environment qualification above |
| Rejected Schema 2 remains absent | satisfied |
| Zero real access and zero Pi/Docker work | satisfied |
| Immutable candidate focused audit PASS | pending |
| Main final Goal 1 acceptance | pending |

## Remaining unverified and next control point

The exact full-workbench typecheck and loader-unpropagated child-process forms remain
environment-qualified as described above. The immutable candidate now requires Main
preliminary re-review, candidate commit/tree freeze, and a fresh independent read-only
focused audit. Any source/configuration change after freeze requires a new candidate and
fresh audit. Goal 2 must not start until audit PASS and Main Goal 1 acceptance.

The pre-candidate control amendment that supplied the exact follow-up identities changed
no Charter decision and consumed no correction budget. No Hard Stop or scope deviation
remains open.
