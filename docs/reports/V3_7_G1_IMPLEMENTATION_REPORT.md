# V3.7 Goal 1 Implementation Report

```yaml
status: AUDIT_REMEDIATION_READY_FOR_MAIN_PRELIMINARY_REVIEW
goal: V3.7 Goal 1 - Registered Recovery Evidence Bridge
implementation_owner: dedicated_v37_goal_1_implementation_session
correction_1_implementation_owner: fresh_replacement_goal_1_correction_session
correction_2_implementation_owner: fresh_replacement_goal_1_correction_session
audit_remediation_implementation_owner: fresh_dedicated_goal_1_audit_remediation_session
audit_remediation_amendment: V3_7_G1_AUDIT_REMEDIATION_AMENDMENT.md
audit_remediation_starting_commit: 0cf5b81976880d57a8b09bbd3f87be68853cbb3b
audit_remediation_starting_tree: d6c59a29d1833fccd53164c295c5bf3bc90ebcba
audit_remediation_budget: 1_of_1
owner_deviation_authorized_by_user: true
owner_deviation_reason: predecessor_session_stopped_with_systemError_and_is_not_successor_resumable
original_starting_commit: 7d6b62223503309b4c39785eec767b437eee6abd
original_starting_tree: 3adbe64faff229766a60553afa444f3569918b81
control_amendment_main_commit: f01e7b471cc11cd87d2babe6a7dc508465480cba
control_amendment_integrated_commit: b477a99360bcb93128aaf23b796cc897b2cf1951
control_amendment_integrated_tree: d5c20bb328648e168a1378c34f60ab51f527d02b
candidate_commit: SELF
candidate_tree: SELF
initial_failed_candidate_commit: 7aca62cc5b329414873bb334ba13547eb9c98d53
initial_failed_candidate_tree: 0f70e8b51b0a4414db42a72b3cfa4bb7cd35b70a
correction_1_failed_candidate_commit: a62051044332d438cbc0f33ec6ccc3f74097ef2f
correction_1_failed_candidate_tree: 7eb150cdaecb9234d62fde2bba31f1e59dd7f107
correction_round: 2_of_2
implementation_started: true
goal_2_started: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_product_tasks: 0
pi_source_reads_or_changes: 0
hard_stops: []
scope_deviations: []
```

The candidate identity cannot be embedded literally in a file that participates in its
own Git commit/tree hash. The dedicated Session reports the exact containing commit and
tree immediately after creating the single authorized candidate commit.

## Changed-file inventory

- `workbench/src/contracts/v37-types.ts`
- `workbench/src/v37/host-registry-v37.ts`
- `workbench/src/v37/workflow-registration-v37.ts`
- `workbench/src/v37/registered-recovery-v37.ts`
- `workbench/src/v37/candidate-v37.ts`
- `workbench/src/inspect-v37g1.ts`
- `workbench/config/v37/registered-cases/registry-v1.json`
- `workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v1.json`
- `workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.r1.json`
- `workbench/tests/v37g1-registered-recovery.test.ts`
- `docs/reports/V3_7_G1_IMPLEMENTATION_REPORT.md`
- `docs/reports/V3_7_G1_CLOSEOUT_DRAFT.md`

No accepted business-source module, old G1 family, V2 schema/truth, V3 State Store/CAS,
G2 Assessment/rollback, Pi source, `CURRENT_STATE.md`, or rejected Schema 2 path changed.

## One-time audit remediation

The user-accepted `V3_7_G1_AUDIT_REMEDIATION_AMENDMENT.md` authorizes this one exceptional
root-cause candidate on top of `0cf5b81976880d57a8b09bbd3f87be68853cbb3b`. Its exact
changed-file inventory is:

- `workbench/src/contracts/v37-types.ts`
- `workbench/src/v37/host-registry-v37.ts`
- `workbench/src/v37/workflow-registration-v37.ts`
- `workbench/src/v37/registered-recovery-v37.ts`
- `workbench/src/v37/candidate-v37.ts`
- `workbench/config/v37/registered-cases/registry-v1.json`
- `workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v1.json`
- `workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.r1.json`
- `workbench/tests/v37g1-registered-recovery.test.ts`
- `docs/reports/V3_7_G1_IMPLEMENTATION_REPORT.md`
- `docs/reports/V3_7_G1_CLOSEOUT_DRAFT.md`

`V37-G1-AUDIT-P1-001` is corrected by a fixed binding-authority root beneath the
loader-owned checkout. Its authority ID/location derives from configuration baseline,
loader contract/fingerprint, Case/version and Manifest digest, never runtime `dataRoot`.
Immutable Host-global by-Run-ID/by-Run-root indexes and the workflow-local binding must
contain the same exact authority/workflow/task/Run/root body.

`V37-G1-AUDIT-P1-002` is corrected by the Manifest-registered finite generic guidance
inventory. The producer's prompt edit `entry_id`, content and content SHA-256 must match
one exact registered template. Unregistered free text, direct answers, symbol-omitting
answers, literals and paraphrases therefore fail before the frozen Task/Source/Verifier
recomputation layer; static authority indicators remain independently fail closed.

`V37-G1-AUDIT-P1-003` is corrected by component-by-component formal path validation from
the trusted data root through `workflows/<id>/recovery` and the final JSON file. Persist,
admit, recompute and read-only reopen reject intermediate symlink/junction/reparse paths;
final files must be ordinary and singly linked.

## Correction round 1

The user-authorized fresh replacement Session corrected only findings
`V37-G1-MAIN-P1-001` through `004`. The correction delta changes these eight allowlisted
paths: the five V3.7 source/type modules below, the focused test, and both reports.

- `workbench/src/contracts/v37-types.ts`
- `workbench/src/v37/host-registry-v37.ts`
- `workbench/src/v37/workflow-registration-v37.ts`
- `workbench/src/v37/registered-recovery-v37.ts`
- `workbench/src/v37/candidate-v37.ts`
- `workbench/tests/v37g1-registered-recovery.test.ts`
- `docs/reports/V3_7_G1_IMPLEMENTATION_REPORT.md`
- `docs/reports/V3_7_G1_CLOSEOUT_DRAFT.md`

The correction adds a write-once, globally unique pre-execution Primary Run binding for
Run ID/root/workflow/task identity; makes the registry baseline loader-module-owned and
adds its source contract fingerprint to the trust root; reloads and recomputes the exact
frozen Primary Task, Source tree and Verifier before Candidate content-independence
checks; and gives admission recomputation a read-only historical path whose pinned
accepted trust-root prefix remains stable after an append-only disable. New workflow,
execution/package derivation, admission and Candidate mutation continue to require the
current accepted envelope.

## Correction round 2

Main re-review preserved Correction 1 and found one residual of P1-003: the concise
task-specific answer `Make parseDuration multiply seconds by 1000.` remained admissible.
Correction 2 changes only Candidate content validation, its focused tests and these two
reports. It derives protected symbols from actual frozen Source exports that are also
present in the frozen Task and Verifier. Any exact protected symbol in Candidate content
is non-transferable and rejected without a shared-token threshold. Independent Verifier
literal-pair rejection remains active. Tests now explicitly reject the short Main repro,
the original long direct answer and `For 3s return 3000.`, while the existing generic
pre-completion verification guidance remains accepted.

## Implemented contracts and source symbols

| Contract | Implementation |
|---|---|
| Fixed Host trust root | `loadRegisteredCaseFromHostRegistryV37`, `validateRegisteredCaseManifestV37`, `validateRegistrationEnvelopeV37` |
| Workflow/task identity | `createWorkflowRegistrationV37`, `loadWorkflowRegistrationV37`; fixed Primary/follow-up task instances, no caller parameters |
| V2 truth and Comparison | `deriveRegisteredRecoveryPackageV37`; reopens `inspectRunV2A`, preserves two Candidate Path identities, emits `selected` or terminal `no_valid_recovery` |
| Evidence/request persistence | `persistRegisteredRecoveryPackageV37`; distinct immutable Evidence, confirmation and submission request objects |
| G1 Admit/Reject | `admitRegisteredRecoveryV37`, `recomputeRegisteredRecoveryAdmissionV37`, `inspectRegisteredRecoveryAdmissionV37` |
| Opportunity projection | direct `ImprovementOpportunityV3` construction only for admitted selected recovery; no opportunity for terminal rejection |
| Candidate boundary | `producePromptCandidateV37`; exact active Base/State scope/applicability and one prompt addendum through the existing bounded producer |

The Inspector reloads the fixed Host registry and all V2 source artifacts; package-carried
approval data is not Authority. Registry/digest overrides, browser/caller approval,
cross-workflow substitution, link/reparse ambiguity, source/package mutation, stale Base,
adaptive Skill and authority/leakage text fail closed.

## Frozen Host configuration

```yaml
configuration_baseline_id: v37-g1-host-registry-v1
registry_location: workbench/config/v37/registered-cases/registry-v1.json
manifest_location: workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v1.json
envelope_location: workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.r1.json
loader_entry_point: workbench/src/v37/host-registry-v37.ts#loadRegisteredCaseFromHostRegistryV37
loader_contract_id: v37-host-registry-loader-v1
digest_algorithm: sha256_over_canonical_utf8_json_v1
case_id: v37-g1-det-recovery
manifest_version: 1
registry_index_digest: 53766376c27574a3e86b8bd89b322da64c70becc54e864f8c61af8e385d05b73
manifest_body_digest: 98b522161f0f132c5fd0507fe6df396252d010a47177b6c5a182de50ef0e83b5
registration_digest: 5def6e32ace9a4b432e3ebaec1715ba28effd8145db01465ce1c5e5b29e4bd0c
loader_contract_fingerprint: b59df9033b6b15a06dd6b523ea1a730bae3f62468d08b7334afa49de5e7ba671
registry_trust_root_digest: 0e40f812dd0d91f6310dc4e256078deea42acb76a0590b594c133fac32d5e9b8
```

Complete Manifest spec digest inventory:

```yaml
source_baseline_spec: 4665eeb9e69f9531ee6bc0b40fff86a61fa4373100ceadf6e12b91eb9e51c4cd
primary_task_spec: 39c61f4cc73f4ef3ca4932427773009dd4c2aedfc212c687145372b8cba49eb0
primary_verifier_spec: 89d1b28a40472aa1d49ff48351623fb3eead93fd70fbd6654592a3f98d6bfde0
problem_trigger_spec: c4aa306a8410dbac0a1923d3966f7523a264155e71e9f035f8668e12b9a78b48
recovery_a_strategy_spec: 060aec5724bb0a6d19caecd0b60bb0f79b15d086d03f641b7bec4854af87754f
recovery_b_strategy_spec: f59dbca50b981d588f196b5e475c9c79cd44ba4790b9a51ef332134e72977765
comparison_profile_spec: 23b1948e5569a784af1c186371efe98d50faa922f183f54a4671d0159d99f1f6
candidate_policy_spec: 3a3556f1d1d6f71aab9139bf0a9e0bc50201ef843f94c06f3b239e819406b617
regression_pack_spec: 296ddaaeac5883c35a2ceb6fec4b3f18ad383af5e78083d3a801c1dea8e11c4e
follow_up_task_spec: 1c8c5ca89d0bb16b5cc99e1939e99c40a693c3fca4e0855d26ca79daadc5c1b8
follow_up_source_baseline_spec: 75046aceae2e751dee8b410de1393b7cf3f1743c82ae0e8b35e71f86d319f68d
follow_up_verifier_spec: 59934ae3ec0d8f6fc3254769dab513330002b1e75a57a0c95535375fb7fb1dd8
provider_profile_spec: f695d0e636960c117c7176bd395e6fc19d2adaa9f649cf68973a15d715662e89
tool_profile_spec: 2f44ac225979c1965e7612bbcaa06b6b550f3004b294dce6bb276d6da425fbbe
command_profile_spec: ac8b697d2b850d7b234801c65523dccbbdd67f1849c4ecce3f725062c1809e08
budget_profile_spec: d7963f6d311682b73a7dc84cc5b66f245db49a133f03cd485b3b5b37f9375ec1
stop_condition_profile_spec: 5d7f0f95a9bf3b3d1b0a43bc602ce9bd8832dbe1397901acf11d7e764bdb377f
runtime_base_prompt_spec: 02802ee30a2e24895d380b28ea8cb32adcb92e8546693fb03f06181c0cd45c31
```

## Deterministic identities

```yaml
project_id: v37-g1-project
state_store_configured_location: .runs/v37/g1-tests/state-store
state_store_scope_digest: ee650680b0e3bf68948125388a6148f870136a0c880778715e8f3009064577c0
initial_state_digest: ef49e812b72b03b23deeffec51e06b9c84f6cdcdfcc9d6c0f7969e70b94b8956
runtime_base_prompt_digest: 317f5fd3d0d2a144b71c2adde124b254c5bc61a704fd89f831738e3ecc752edf
primary_task_id: v1-parse-duration
follow_up_task_id: v37-g1-det-follow-up-clamp-retries
follow_up_task_body_sha256: 4ff40dfc9c27c3083b2694175ea34f78ceecf522202a894f91c7fd614c8a73b8
follow_up_source_sha256: 77271bd589e03e3d3b54dd25db95877baf5f45b3b21917b9e4e67893776f8c11
follow_up_verifier_sha256: 2a4019af3501332b9c53365ed907120b2c9e496de59ebf37c4fd8dab78d4ec87
follow_up_verifier_command_sha256: 4b54db2265af6b195de93467a95970bdac4a1d7f2a5a3af85a628e9f84305033
test_workflow_ids:
  - v37-g1-workflow-a
  - v37-g1-workflow-b
  - v37-g1-workflow-both-fail
```

Workflow and task-instance digests are Host-derived per instance at creation time and are
therefore not static registry constants.

## Verification

| Command | Result |
|---|---|
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit` | Environment stop before source checking: `TS2688`, isolated worktree has no `node_modules/@types/node` |
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p ../.runs/v37/g1-correction/tsconfig.json --noEmit` | PASS, 0 diagnostics; strict seven-root environment-equivalent check with pinned Node/Pi declarations |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g1-registered-recovery.test.ts` | PASS, 14/14; includes alternate-data-root ID/root conflicts, exact registered template positive, unregistered/direct/literal/paraphrase negatives, recovery-descendant junction and disabled historical reopen |
| same command, `tests/v2a-recovery.test.ts` | PASS, 5/5 |
| same command, `tests/v3g1-evidence-to-candidate.test.ts` | PASS, 13/13 |
| same command, `tests/v3g2-validate-promote-reject-rollback.test.ts` | PASS, 6/6 |
| exact command, `tests/final-capstone-g1-evidence-admission.test.ts` | 23/24; only spawned child lacked inherited Pi loader and failed module resolution before product inspection |
| same G1 Capstone with identical fixed loader inherited through `NODE_OPTIONS` by child processes | PASS, 24/24 |
| exact command, `tests/final-capstone-g2-regression-state-feedback.test.ts` | 8/10; both spawned-child failures were the same missing Pi package resolution |
| same G2 Capstone with identical fixed loader inherited through `NODE_OPTIONS` by child processes | PASS, 10/10 |
| `git diff --check` plus remediation allowlist from `0cf5b819...` | PASS; exactly eleven Amendment-allowlisted files after both reports are included |
| Pi cleanliness | Environment-qualified: `.upstream/pi` is absent from this isolated worktree; no Pi path was read or changed |

No product assertion failed once the already-authorized fixed public Pi loader was visible
to the tests' child Node processes. No dependency was installed and no tracked file was
changed to compensate for the isolated-worktree dependency layout.

## Remaining unverified

- The exact repository-wide `tsc -p tsconfig.json --noEmit` invocation remains blocked by
  the isolated worktree's absent ignored Node type dependencies; the bounded strict check
  over all new roots passed.
- The two exact Capstone commands do not propagate their parent loader into spawned child
  processes in this isolated worktree; the source-equivalent inherited-loader reruns pass.
- Fresh independent read-only re-audit and Main Goal acceptance remain pending and are not claimed.
- Goal 1 performs no State publication and Goal 2 execution is not started.
- Main preliminary review, immutable candidate freeze and fresh independent read-only
  re-audit remain pending and are not claimed.
