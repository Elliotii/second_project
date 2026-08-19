# V3.7 Goal 1 Closeout Draft

```yaml
status: AUDIT_REMEDIATION_READY_FOR_MAIN_PRELIMINARY_REVIEW
goal_acceptance: NOT_CLAIMED
focused_reaudit: PENDING
original_starting_commit: 7d6b62223503309b4c39785eec767b437eee6abd
original_starting_tree: 3adbe64faff229766a60553afa444f3569918b81
control_amendment_integrated_commit: b477a99360bcb93128aaf23b796cc897b2cf1951
control_amendment_integrated_tree: d5c20bb328648e168a1378c34f60ab51f527d02b
candidate_commit: SELF
candidate_tree: SELF
initial_failed_candidate_commit: 7aca62cc5b329414873bb334ba13547eb9c98d53
initial_failed_candidate_tree: 0f70e8b51b0a4414db42a72b3cfa4bb7cd35b70a
correction_1_failed_candidate_commit: a62051044332d438cbc0f33ec6ccc3f74097ef2f
correction_1_failed_candidate_tree: 7eb150cdaecb9234d62fde2bba31f1e59dd7f107
correction_round: 2_of_2
correction_1_implementation_owner: fresh_replacement_goal_1_correction_session
audit_remediation_amendment: V3_7_G1_AUDIT_REMEDIATION_AMENDMENT.md
audit_remediation_implementation_owner: fresh_dedicated_goal_1_audit_remediation_session
audit_remediation_starting_commit: 0cf5b81976880d57a8b09bbd3f87be68853cbb3b
audit_remediation_starting_tree: d6c59a29d1833fccd53164c295c5bf3bc90ebcba
audit_remediation_budget: 1_of_1
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

Correction 2 is the final ordinary correction round. It is limited to residual finding
`V37-G1-MAIN-P1-003-R1`: exact frozen exported task symbols now fail content-independence
without a token-count threshold, Verifier-derived literal pairs remain rejected, and
generic transferable guidance remains accepted. No Correction 1 registry, binding,
recovery, historical-reopen or configuration behavior changed.

The later user-accepted one-time Audit Remediation corrects exactly
`V37-G1-AUDIT-P1-001` through `003`. Run uniqueness now uses one fixed Host-global
authority root and exact global/local binding equality; Candidate guidance accepts only
an exact Manifest-registered generic template identity/content/hash; and every formal
Recovery artifact operation validates the full trusted-root-to-file component chain.
This is not ordinary Correction round 3 and grants no Goal acceptance or Goal 2 authority.

## Deliverables

The remediation candidate changes exactly the eleven files listed in the implementation
report: three frozen Host configuration documents, five V3.7 type/production modules,
one focused deterministic test file and these two reports. `inspect-v37g1.ts` and all
accepted business-source/test modules remain unchanged in this remediation.

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
registry_index_digest: 53766376c27574a3e86b8bd89b322da64c70becc54e864f8c61af8e385d05b73
manifest_body_digest: 98b522161f0f132c5fd0507fe6df396252d010a47177b6c5a182de50ef0e83b5
registration_digest: 5def6e32ace9a4b432e3ebaec1715ba28effd8145db01465ce1c5e5b29e4bd0c
candidate_policy_spec: 3a3556f1d1d6f71aab9139bf0a9e0bc50201ef843f94c06f3b239e819406b617
loader_contract_fingerprint: b59df9033b6b15a06dd6b523ea1a730bae3f62468d08b7334afa49de5e7ba671
registry_trust_root_digest: 0e40f812dd0d91f6310dc4e256078deea42acb76a0590b594c133fac32d5e9b8
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

- V3.7 Goal 1 focused suite: PASS, 14/14, including all three audit repro classes.
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

The earlier pre-candidate control amendment that supplied exact follow-up identities
changed no Charter decision and consumed no correction budget. This later exceptional
Audit Remediation consumes its one-time `1_of_1` implementation candidate authority.
No implementation Hard Stop or scope deviation remains open.
