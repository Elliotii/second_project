# V3.7 Preimplementation Review

## 1. Executive decision

```yaml
review_id: V3_7_PREIMPLEMENTATION_REVIEW
status: completed_read_only_no_go
final_decision: DO_NOT_START_V3_7_IMPLEMENTATION
authoritative_repository: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
authoritative_branch: codex/v2-b-bounded-r2
reviewed_head: 429945da1cc95a83186c15f45be81c977aab0223
reviewed_tree: 45e9a315d8d2673f5f82989bebe750ed299b7ec2
baseline_tag: final-capstone-g1-g2-accepted-g3-incomplete-2026-08-18
baseline_tag_target: 429945da1cc95a83186c15f45be81c977aab0223
source_changes_made: false
real_provider_calls: 0
credential_reads: 0
docker_product_runs: 0
review_file_status: uncommitted_review_artifact
semantic_change_required: true_under_the_current_V3_7_plan
five_day_scope_feasible: false
new_v3_7_main_recommended: false
```

**Decision — DO NOT START V3.7 IMPLEMENTATION.**

**Fact.** The accepted repository contains substantial reusable V2 recovery, V3 Candidate/State, V3.6 Session/ChangeSet, persistence, Read Model, API and UI substrate. A non-authoritative workflow record and thin action/projection layer are also structurally feasible.

**Fact.** The requested full loop is nevertheless not structurally reachable under the accepted Final Capstone G1/G2 and V3.6 semantics. Four material breaks are source-confirmed:

1. accepted V2 recovery evidence is deliberately projected by G1 as `no_opportunity`, so it cannot enter V3 Diagnosis/Lesson/Candidate;
2. G1's approval root is a closed, source-coded table of exact registration identities and digests, so a reusable product cannot admit newly created workflow/Run registrations without changing accepted approval-root behavior;
3. V3.6 records a Harness State digest but does not load or consume promoted V3 State in the Agent runtime;
4. V3.6 follow-up Runs are `unverified`, non-adaptation-eligible artifacts and cannot enter the only G1 family that G2 Assessment accepts. The missing bridge is the same authority/integrity boundary that strict Goal 3 stopped without acceptance.

These are not route names, UI layout, Case details, budget numbers or other Charter-resolvable choices. They affect Evidence admission, Authority, runtime State consumption and complete-path identity continuity. Meeting the current V3.7 plan would require at least one accepted-core semantic amendment or a newly accepted bridge/Evidence family, both forbidden by this review's GO criteria.

## 2. Baseline verification

### 2.1 Repository and Git identity

| Check | Observed result | Status |
|---|---|---|
| Repository | `C:/Users/HUAWEI/.codex/worktrees/g25main/project2` | confirmed |
| Branch | `codex/v2-b-bounded-r2` | confirmed |
| HEAD | `429945da1cc95a83186c15f45be81c977aab0223` | confirmed |
| Tree | `45e9a315d8d2673f5f82989bebe750ed299b7ec2` | confirmed |
| Annotated tag dereference | `final-capstone-g1-g2-accepted-g3-incomplete-2026-08-18^{}` -> reviewed HEAD | confirmed |
| Upstream tracking branch | none configured | confirmed, non-blocking |
| Remote | `github https://github.com/Elliotii/second_project.git` | confirmed |
| Branch/worktree switch | none | confirmed |

**Fact.** `CURRENT_STATE.md` records `goal_1: closed_accepted`, `goal_2: closed_accepted`, `goal_3: closed_incomplete`, `active_goal: null`, and strict-G3 flags `candidate_frozen: false`, `schema_2_delta_accepted: false`, `further_patch_authorized: false` (`CURRENT_STATE.md:39-45`, `CURRENT_STATE.md:217-222`).

**Fact.** G1 closes as `PASS_FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION` in `docs/reports/FINAL_CAPSTONE_G1_CLOSEOUT.md`. G2 closes as `PASS_FINAL_CAPSTONE_G2_REGRESSION_GATED_STATE_FEEDBACK` in `docs/reports/FINAL_CAPSTONE_G2_CLOSEOUT.md`. Strict G3 closes as `STOPPED_UNACCEPTED` with Schema 2 unaccepted and no further patch authority in `docs/reports/FINAL_CAPSTONE_G3_INCOMPLETE_CLOSEOUT.md`.

### 2.2 Accepted files and rejected-path absence

**Fact.** The accepted G1/G2 Closeouts, contracts, implementations and tests are present, including:

- `workbench/src/contracts/final-capstone-g1-types.ts`;
- `workbench/src/refinement/evidence-admission-g1.ts`;
- `workbench/tests/final-capstone-g1-evidence-admission.test.ts`;
- `workbench/src/contracts/final-capstone-g2-types.ts`;
- `workbench/src/refinement/regression-gate-g2.ts`;
- `workbench/src/state/state-feedback-g2.ts`;
- `workbench/tests/final-capstone-g2-regression-state-feedback.test.ts`.

**Fact.** These rejected Schema 2 implementation paths are absent from the authoritative tree:

- `workbench/src/contracts/final-capstone-g3-types.ts`;
- `workbench/src/pi/final-capstone-g3-v36-port.ts`;
- `workbench/src/final-capstone-g3.ts`;
- `workbench/src/inspect-final-capstone-g3.ts`;
- `workbench/tests/final-capstone-g3-closed-loop.test.ts`.

No rejected implementation worktree was opened or used as a design source.

### 2.3 Plan and working tree

**Fact.** The attached plan was read in full from `C:/Users/HUAWEI/Downloads/第二项目_V3.7_规划.md`; size `28,249` bytes; SHA-256 `ddb0978c09cb74615743a8f9cce3ab421a31d8cfa98d6aeec5975bf4f6a58997`.

Before this review, the authoritative worktree already contained two unrelated untracked reports:

- `docs/reports/FINAL_CAPSTONE_G3_INCOMPLETE_CLOSEOUT_COMPLETION_VERIFICATION.md`;
- `docs/reports/SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md`.

They were preserved and are not review-created delta.

```yaml
working_tree_expected_delta:
  - V3_7_PREIMPLEMENTATION_REVIEW.md
pre_existing_untracked_files_preserved:
  - docs/reports/FINAL_CAPSTONE_G3_INCOMPLETE_CLOSEOUT_COMPLETION_VERIFICATION.md
  - docs/reports/SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md
```

## 3. End-to-end composition map

```text
V2 Primary / Recovery A / Recovery B / Selection
  -> [BLOCKED: G1 admits selected comparison only as PASS without peer comparison]
G1 Trusted Evidence Admission
  -> projector_result = no_opportunity for accepted V2 source
  -> [BLOCKED: no V3 Opportunity, Diagnosis, Lesson or Candidate]
V3 Candidate / staged State
  -> G2 fixed applicability pack / symmetric comparator
  -> Promote / Reject / V3 State Store
  -> [REUSABLE only if a valid Candidate and accepted applicability exist]
V3 State publication / active pointer
  -> [BLOCKED: V3.6 pins a digest but does not consume V3 State entries]
V3.6 follow-up Run / ChangeSet
  -> [BLOCKED: Run remains unverified and is not v3g3_bound_state_followup]
G1 follow-up admission
  -> [BLOCKED: accepted family requires V3 G3 binding/runtime/Case artifacts]
G2 Assessment
  -> retain / needs_reassessment / attributable rollback
  -> [REUSABLE only after a valid G1 bound-State follow-up admission]
```

**Inference.** The middle V3 Candidate -> G2 -> State segment is a genuine reusable island, and the V3.6 product surface is a genuine reusable island. The current plan assumes interfaces between those islands that do not exist in the accepted tree.

## 4. Source / symbol inventory

| Area | Path / symbol | Source-grounded finding | Relevant test/evidence |
|---|---|---|---|
| V2 recovery | `workbench/src/run-v2.ts#executeRecoveryGroupFromSeedV2` and `runV2A` | Freezes failed Seed, two isolated Candidate workspaces, independent Verifiers and deterministic Selection. Terminal outcomes are `initial_pass`, `recovery_selected`, `recovery_none`. | `workbench/tests/v2a-recovery.test.ts`; V2 Closeouts |
| V2 identities | `workbench/src/contracts/v2-types.ts#RecoverySeedV2A`, `CandidatePathV2A`, `SelectionDecisionV2A` | Run, Seed, group, Candidate path, Session/workspace and Verifier lineage are persisted. Candidate path IDs are not peer Run IDs. | G1 correction and re-review evidence |
| G1 families | `workbench/src/contracts/final-capstone-g1-types.ts#TrustedEvidenceSourceG1` | Exactly three accepted families: `verifier_backed`, `v2a_recovery_comparison`, `v3g3_bound_state_followup`. | G1 tests |
| G1 approval | `workbench/src/refinement/evidence-admission-g1.ts#FIXED_HOST_APPROVALS_G1`, `fixedHostApprovalG1` | Module-private exact table binds project/registration to exact registration digest; caller authorization is rejected. | G1 test lines 381+ |
| V2 -> G1 | `evidence-admission-g1.ts#v2Derivation` | Requires `recovery_selected`, exactly two common-Verifier PASS arms; freezes one source Run, PASS/PASS provenance, and deliberately omits FrozenEvidence comparison. | G1 test lines 246-260 |
| G1 projection | `workbench/src/refinement/evidence-v3.ts#projectImprovementOpportunityV3` | A PASS becomes `inefficient_success` only when a real `comparison.peer_run_id` and vector exist. Otherwise no Opportunity. | G1 V2 test expects `no_opportunity` |
| Candidate | `workbench/src/refinement/producer-v3.ts#validateProposalAndBuildCandidateV3`, `createBoundedModelBackedProducerV3` | Bounded Diagnosis/Lesson/Prompt-or-Skill Candidate, exact evidence/base/applicability linkage. No task-answer/Skill leakage policy checker exists. | V3 G1 tests/Closeout |
| Candidate staging | `workbench/src/state/staging-v3.ts#stageCandidateStateV3` | Stages inactive prompt addendum or adaptive Skill with content identities and applicability. | V3 tests |
| Comparator | `workbench/src/refinement/comparator-v3.ts#executeSymmetricValidationV3` | Copies the same frozen workspace into Base/Candidate arms and freezes State/profile/check identities. Port is still Faux-validation-shaped. | V3 G2 tests |
| G2 packs | `workbench/src/refinement/regression-gate-g2.ts#CHECK_DEFINITIONS`, `PACKS`, `applicabilityKey` | Only two exact applicability keys and fixed checks are accepted. Unknown packs fail closed. | G2 authority tests |
| G2 publication | `regression-gate-g2.ts#executeRegressionGatedCandidatePublicationG2` | Valid admission plus fixed pack drives symmetric validation and existing V3 publication. | G2 tests |
| V3 State | `workbench/src/state/store-v3.ts#applyValidationDecisionV3`, `rollbackActiveStateV3`, `inspectStateStoreV3` | Immutable versions/decisions, active pointer and CAS are reusable. | V3 G2 and Final Capstone G2 tests |
| V3 binding | `workbench/src/state/binding-v3.ts#freezeRunBindingV3` | Filters applicable entries, freezes promotion lineage, composes prompt and/or loads adaptive Skill. | V3 G3 tests/Closeout |
| V3 runtime | `workbench/src/pi/pi-adapter-v3.ts#runHarnessV3` | Actually passes `frozen.composedPrompt` and adaptive Skill to public Pi `AgentHarness`; verifies observed treatment identities. | V3 G3 accepted evidence |
| V3.6 registry | `workbench/src/project/registry-v36.ts#ProjectProfileRegistryV36` | Host registers project, paths, profiles, commands and a `current_state()` digest. The digest is an identity pin, not State loading. | V3.6 G1 tests |
| V3.6 authority | `workbench/src/v36/authority-v36.ts#InteractiveControlPlaneV36` | Host mints/persists Run authority and pins State/profile/workspace identities. Formal outcome stays null; comparison/adaptation/promotion stay false. | `v36g1-authority-session.test.ts` |
| V3.6 runtime | `workbench/src/session/persistent-session-v36.ts#executeTurn`, `executeBoundedTurn`, `inspect` | Uses a static or caller-supplied policy system prompt. Inspection records verifier/outcome/binding as `not_recorded`. | V3.6 tests |
| V3.6 product composition | `workbench/src/v36/daily-product-v36.ts#createDailyProductApplicationV36` | Supplies a static path/command policy prompt; does not open V3 State Store or call `freezeRunBindingV3`. | `v36-product-polish.test.ts` |
| ChangeSet | `workbench/src/workspace/change-set-v36.ts#createChangeSetV36`, `performChangeHandoffV36` | Content-addressed ChangeSet, Source preimage checks, Apply/Discard/Export and Host lineage are reusable. | V3.6 G2 tests/Closeout |
| Web API | `workbench/src/webui/server-v36g1.ts#route` | Exact narrow task/handoff routes and safe GET projections; browser cannot submit Host paths/profile/verifier/budget. | V3.6 Web/API tests |
| Assessment | `workbench/src/state/state-feedback-g2.ts#deriveAssessment`, `persistStateAssessmentG2`, `applyAssessedRollbackG2` | Requires `v3g3_bound_state_followup`; PASS retains, ordinary negative needs reassessment, fresh attributable regression may authorize rollback. | Final Capstone G2 tests |

## 5. Composition matrix

| Edge | Producer | Consumer | Identity continuity | Gap | Classification | Certainty | Blocker |
|---|---|---|---|---|---|---|---|
| V2 Primary -> recovery | V2 Run/Verifier | V2 Controller | Run, Seed, group and workspace identities preserved | Product Case registration/orchestration is hardcoded, not general | bounded_adapter_or_orchestration | confirmed | no by itself |
| V2 selected recovery -> G1 | V2 terminal/Selection/two Candidate paths | G1 `v2Derivation` | G1 preserves source Run and Candidate-path provenance | Only `recovery_selected` with two PASS arms is accepted; primary verifier failure is not admitted | semantic_change_or_blocker | confirmed | yes |
| G1 V2 admission -> V3 Opportunity | G1 FrozenEvidence | V3 projector | Evidence digest is preserved | FrozenEvidence has no comparison peer; projector returns `no_opportunity` | semantic_change_or_blocker | confirmed | yes |
| New workflow Run -> G1 approval | Host workflow/Case registration | `fixedHostApprovalG1` | Registration digest changes with source identity/path | Fixed source table cannot approve newly minted registration identities | semantic_change_or_blocker | confirmed | yes |
| Opportunity -> Candidate | V3 projector | V3 producer | Evidence/base/applicability lineage is exact | Needs bounded leakage/pre-freeze validator | bounded_adapter_or_orchestration | confirmed | no by itself |
| Candidate -> G2 pack | staged V3 State | G2 regression gate | Candidate/admission/workspace digests preserved | Only two hardcoded applicability packs | configuration_or_registration, potentially bounded source extension | confirmed | no by itself |
| G2 -> V3 State | symmetric comparator | V3 State Store | Decision/version/active identities preserved | No material gap for accepted keys | direct_reuse | confirmed | no |
| V3 State -> V3 runtime | V3 binding freezer | V3 `runHarnessV3` | Complete binding and runtime observation | This path is not V3.6 Product/ChangeSet path | direct_reuse only inside V3 G3 runtime | confirmed | yes for requested product loop |
| V3 State -> V3.6 follow-up | V3 State Store | V3.6 Session runtime | V3.6 pins only a digest | No State entry loading, applicability filtering or runtime-effective binding | semantic_change_or_blocker for current complete path | confirmed | yes |
| V3.6 follow-up -> G1 | V3.6 Run/Session/ChangeSet | G1 `v3Derivation` | V3.6 lacks required V3 binding/runtime/Case lineage | No accepted G1 family for V3.6 ordinary runs | semantic_change_or_blocker | confirmed | yes |
| G1 bound follow-up -> G2 Assessment | G1 accepted bound family | G2 assessment | Exact State/promotion/Verifier linkage | Reusable only when the required G1 family exists | direct_reuse | confirmed | upstream-blocked |
| Workflow record -> formal artifacts | proposed navigation record | UI/read model | Can store only typed refs and derive status | Record does not exist | non_authoritative_product_extension | likely | no by itself |
| UI -> Host actions | browser opaque action/Case ID | application service | Existing exact request boundary reusable | New thin routes/projections needed | non_authoritative_product_extension | confirmed | no by itself |

## 6. Accepted-core semantic analysis

### 6.1 G1 Evidence family and approval root

```yaml
v2_to_g1:
  feasible: false_for_the_planned_complete_loop
  required_change_class: semantic_change_or_blocker
  identity_continuity: partial_source_run_and_candidate_path_provenance_only
  semantic_change_required: true
  blockers:
    - accepted_v2_selection_projects_to_no_opportunity
    - primary_verifier_failure_has_no_accepted_G1_family
    - dynamic_workflow_registration_is_not_approved_by_FIXED_HOST_APPROVALS_G1
```

**Fact.** A new V2 Run identity can be inspected by the existing family only if a reviewed registration with its exact source association is itself approved. The current approval table has no runtime enrollment mechanism. Host derivation cannot be replaced by browser confirmation or a caller-supplied approval object; the tests intentionally reject both.

**Fact.** Primary verifier failure and the resulting valid comparison cannot both be represented by the current `v2a_recovery_comparison` derivation as V3-triggering FrozenEvidence without changing what G1 freezes. Adding another source family is explicitly forbidden by the V3.7 plan.

### 6.2 G1 -> V3 Candidate

**Fact.** V3 Candidate generation is not tied to one fixture ID at the producer API. It accepts a typed `ImprovementOpportunityV3`, preserves evidence identity, bounds output and supports prompt or Skill edits.

**Fact.** The current accepted V2 admission never produces that Opportunity. An adapter cannot truthfully manufacture a comparison peer or convert Candidate-path identities into peer Run identities; doing so would reverse the accepted G1 correction.

**Fact.** Existing proposal validation checks shape, bounded sizes, evidence/base identity and applicability consistency. It does not implement explicit task-answer leakage or Skill leakage detection. A pre-freeze validator and one bounded schema/format correction could be added without changing Candidate decision authority, provided it creates a new Candidate identity and runs before Regression. Freeze-after-correction is feasible. This is non-blocking in isolation.

### 6.3 Candidate -> G2 Regression -> State

```yaml
candidate_to_state:
  feasible: true_only_for_current_exact_G1_admissions_and_G2_applicability_keys
  required_change_class: configuration_or_registration_plus_bounded_adapter_or_orchestration
  regression_reusable: bounded_not_general
  state_publication_reusable: true
  semantic_change_required: false_for_existing_keys
  blockers:
    - upstream_candidate_is_unreachable_from_planned_V2_evidence
    - new_case_applicability_must_fit_or_authoritatively_extend_two_fixed_packs
```

**Fact.** Base/Candidate arms begin from copies of the same frozen source workspace and freeze Candidate, Base State, provider/model, tool, budget, hard-constraint and regression identities. PASS/FAIL can reuse current Promote/Reject and V3 State CAS semantics.

**Fact.** The current regression registry is not a general Host Case registry. It contains two keys, `typescript-maintenance/verifier-failure` and `typescript-maintenance/none`, with fixed checks. A new Case that does not fit those exact contexts is rejected. Adding bounded, reviewed pack definitions may be ordinary configuration/source registration, but the Charter would have to freeze the exact allowed keys and checks; browser membership selection must remain impossible.

### 6.4 State -> V3.6 follow-up

```yaml
state_to_v36_follow_up:
  feasible: false_in_the_accepted_authoritative_tree
  binding_is_runtime_effective: false
  required_change_class: semantic_change_or_blocker_for_the_current_full_loop
  pi_core_change_required: false
  rejected_schema_2_required: not_logically_the_only_design_but_the_missing_authority_bridge_is_equivalent_in_scope
  blockers:
    - V3_6_pins_state_digest_without_loading_state_entries
    - V3_6_runtime_uses_static_or_caller_supplied_policy_prompt
    - V3_6_inspection_records_binding_status_not_recorded
```

**Fact.** Pi Core need not change. The accepted V3 runtime already proves public-Pi consumption of a composed prompt or adaptive Skill. The problem is product composition and evidence authority: V3.6 does not call that binding path, and its ordinary Run contract explicitly denies adaptation/promotion eligibility.

**Inference.** Injecting the composed prompt into V3.6 is mechanically bounded, especially for `prompt_addendum`. It is not sufficient for acceptance because the current V3.6/G1 contracts do not attest the resulting binding and formal Verifier/Outcome lineage. Claiming runtime consumption from the pinned digest alone would be false.

### 6.5 Follow-up -> G1 -> G2 Assessment

```yaml
follow_up_to_assessment:
  feasible: false_from_a_V3_6_follow_up
  second_confirmation_required: true
  required_change_class: semantic_change_or_blocker
  semantic_change_required: true_under_current_plan
  blockers:
    - G1_accepts_only_v3g3_bound_state_followup_for_bound_State_evidence
    - V3_6_Run_has_no_formal_Verifier_Outcome_or_binding_lineage
    - G2_assessment_rejects_every_other_source_family
```

**Fact.** G2 Assessment and persistence are reusable after a valid bound-State G1 admission. Second confirmation can be modeled as a separate non-authoritative user action that asks the Host to submit the follow-up artifact; it cannot create eligibility. Ordinary negative evidence cannot directly roll back. Only a fresh, symmetric, immediate-parent/current accepted-State comparison with valid attribution can authorize rollback. This accepted semantic must remain unchanged.

### 6.6 Summary by accepted core

| Accepted core | Change needed under current plan? | Judgment |
|---|---:|---|
| G1 approval root | yes | blocker; dynamic registrations are outside fixed approvals |
| G1 Evidence family/derivation | yes | blocker; V2 evidence cannot produce Candidate and V3.6 follow-up is not accepted |
| G2 regression semantics | no for exact current keys; bounded registry extension may be needed | reusable but narrow |
| G2 assessment/rollback | no and must not change | reusable only after valid upstream admission |
| V3 State Store/CAS | no | direct reuse |
| Runtime State consumption | yes in V3.6 composition/evidence | blocker for required path |
| Pi Core | no | no Pi change required |
| Rejected Schema 2 | must remain absent | current plan has no accepted substitute |

## 7. Workflow / Case / UI feasibility

### 7.1 Non-authoritative workflow record

**Recommendation.** If a revised plan later resolves the accepted-core blockers, create one thin write-once/append-only workflow instance record containing only:

- workflow ID, Case ID and project ID;
- navigation stage;
- typed references/digests to formal Run, Evidence, Candidate, Decision, State, follow-up and Assessment artifacts;
- user-confirmation action receipts;
- timestamps and terminal/reopen hints.

It must not duplicate formal Artifact bodies, calculate outcomes, own transitions that conflict with Inspectors, or become an alternate Evidence/Decision/State/Assessment store. On reopen, the Host must re-inspect formal references. Any mismatch must fail closed and the formal Authority wins.

Existing V3.5/V3.6 Session persistence, safe Read Model and exact loopback API can support navigation/reopen. Cross-Case injection can be rejected by requiring every referenced artifact's Host-derived project/Case/workflow lineage to match. Multiple workflow IDs may reference the same registered Case. This avoids a second authoritative state machine.

**Fact.** This workflow boundary is feasible. It does not solve G1's fixed approval root or the missing V3.6 evidence bridge.

### 7.2 Host-controlled Case mapping

| Field | Current support | Minimum allowed change / owner |
|---|---|---|
| `project_id` | V3.6 Project Profile registry | direct reuse; Host registered |
| `case_id` | no V3.7 Case registry | bounded Host configuration |
| `primary_task` | V2 task pack / V3.6 task text | Host registered Case template; browser selects opaque Case ID |
| `primary_verifier` | V2/V3 task verifier contracts, V3.6 command registry | Host derives exact verifier/command/digest |
| `problem_trigger` | V2 verifier-failure route | bounded orchestration; never browser-authored outcome |
| `recovery_path_a/b` | V2 fixed retained/fresh strategies | bounded Case strategy registration |
| `comparison_profile` | V2 selector and V3 comparator exist separately | bounded orchestration with exact profile |
| `candidate_type/scope` | V3 supports prompt/Skill and applicability | Host config; browser cannot submit content authority |
| `regression_pack` | two G2 fixed packs | exact Host registration; browser cannot select members |
| `state_applicability` | V3 typed applicability | Host derives from accepted Case/admission |
| `follow_up_task/verifier` | no full-loop registry | bounded Host configuration after core decision |
| provider/tool/command profiles | V3/V3.6 registries and digests | direct reuse/configuration; opaque IDs only |
| budgets/stop conditions | V2/V3/V3.6 fixed profiles | frozen Host configuration |

Browser may submit only an opaque `case_id`, a workflow creation request, task-independent confirmation/action IDs, and perhaps an opaque existing workflow ID. It must never submit Provider/model, filesystem path, command argv, Verifier, budget, stop rule, formal Outcome, Comparison result, Candidate content, State ID, Promote/Reject or Assessment result.

At least two deterministic Case configurations are mechanically possible without a general task designer by limiting the registry to two reviewed records and exact schemas. They are not currently able to traverse the accepted G1 chain. Therefore “two Case configuration” is feasible, while “two complete accepted deterministic loops” is blocked.

### 7.3 Primary Outcome routing

**Fact.** V2 already distinguishes `initial_pass`, `recovery_selected`, `recovery_none`, candidate budget stops and invalid evidence. V3.6 has reconciled pre-dispatch/finite budget terminals but deliberately has no formal Outcome. Neither subsystem provides one accepted combined taxonomy covering every V3.7 route (`no_recovery_needed`, verifier failure, integrity failure, pre-dispatch platform failure, budget stop, cancelled).

**Recommendation.** A future plan may add a non-authoritative workflow routing projection over existing formal terminal facts. Recovery may start only from an Inspector-valid V2 primary verifier failure. Primary PASS must route to `no_recovery_needed`; it must never be rewritten or scripted into a failure. Integrity/platform/budget/cancelled conditions must terminate or pause the workflow and must not create formal failure Evidence. A script may not write an Outcome artifact.

Changing accepted V2/V3.6 Outcome semantics is not needed for UI routing, but using V3.6 ordinary results as G1 formal outcomes would be an accepted-core change and remains blocked.

### 7.4 WebUI gap matrix

| Capability | Status | Notes |
|---|---|---|
| Case list | missing_but_allowed | Thin Host projection over bounded registry |
| Create workflow | thin_action_needed | Opaque Case ID only |
| Primary | thin_action_needed | Host orchestration required |
| Recovery A / B | existing_but_read_only + thin_action_needed | V2 read projection exists; product launch action absent |
| Comparison | existing_but_read_only | Historical V2/V3.5 projection exists; formal calculation remains Host-side |
| ChangeSet | existing_and_reusable | V3.6 Files/Changes/Diff/Apply/Discard/Export |
| Initial Evidence submission | blocked | Dynamic G1 approval and V2 trigger mismatch |
| Candidate generation | blocked upstream | V3 producer exists but no Opportunity from planned V2 admission |
| Candidate diff | thin_projection_needed | Allowed after valid Candidate exists |
| Regression | thin_action_needed but upstream_blocked | Host action only |
| Decision | thin_projection_needed | UI must not choose/calculate Promote/Reject |
| State / binding | existing_but_read_only | State history exists; V3.6 effective binding absent |
| Follow-up | blocked | Runtime-effective accepted binding/evidence bridge absent |
| Follow-up Evidence submission | blocked | No accepted G1 family for V3.6 Run |
| Assessment | existing_but_read_only + upstream_blocked | G2 machinery exists; valid input absent |
| Restart / reopen | existing_and_reusable | Session/read-model patterns reusable; workflow record needed |

No new frontend framework, Dashboard, IDE, terminal emulator, streaming layer or graph editor is needed. Thin actions/projections are sufficient only after the core blockers are resolved.

## 8. Deterministic Goal 1 feasibility

### 8.1 Same production path judgment

**Fact.** Faux Provider, deterministic command backend and fixed workspace can replace real peripheral execution dependencies while sharing application services, persistence, Read Model, API and UI handlers.

**Fact.** They cannot currently share the requested complete production workflow because that workflow does not exist for either deterministic or real execution. Building a deterministic-only full loop around fabricated approval, comparison or follow-up evidence would be a test/demo-only path and is prohibited.

Therefore Goal 1 and Goal 2 cannot yet be shown to share the same complete production path. This independently satisfies a mandatory NO-GO condition.

### 8.2 Minimum future test matrix

The following is testable after an explicit plan/authority revision, but was not implemented:

| Test | Existing reusable basis | New category needed | Currently structurally testable? |
|---|---|---|---|
| Two different Cases | V2/V3 fixtures | bounded Case registry | configuration yes; accepted full loop no |
| Same Case, multiple workflows | Session identity patterns | workflow persistence | yes after record exists |
| Primary PASS | V2 | orchestration route | yes |
| Primary verifier failure | V2 | orchestration route | yes |
| Recovery A/B and Comparison | V2 | product adapter | yes |
| G1 admit/reject | G1 tests | dynamic Host registration authority | no under current fixed root |
| Candidate | V3 tests | leakage/pre-freeze checks | no from planned V2 admission |
| Regression PASS/FAIL | G2/V3 tests | Case pack configs | yes for exact current packs |
| Promote/Reject | V3/G2 tests | thin orchestration | yes |
| State binding | V3 G3 tests | V3.6 runtime composition/evidence | no in V3.6 path |
| Follow-up | V3.6 Session tests | accepted binding bridge | no |
| Assessment | G2 tests | V3.6 -> G1 admission bridge | no |
| Restart/reopen | V3.5/V3.6 tests | workflow reinspection | yes |
| Cross-Case rejection | authority tests | workflow lineage test | yes |
| UI non-authority | V3.6 API tests | V3.7 action matrix | yes |
| Candidate freeze immutability | V3 staging/comparator | pre-freeze correction lifecycle | yes |
| Applicability mismatch | V3/G2 tests | Case registry tests | yes |
| Rejected Schema 2 absence | Git/path check | regression guard | yes |

**Fact.** No structural testing obstacle exists for thin workflow/UI/config work. The structural obstacle is that the intended accepted production interfaces are absent, not that the code is untestable.

## 9. Real Goal 2 feasibility

### 9.1 Logical execution and budget model

```yaml
logical_execution_units:
  minimum: 7
  units:
    - Primary_Run
    - Recovery_Path_A
    - Recovery_Path_B
    - Candidate_proposal
    - Regression_Base_Run
    - Regression_Candidate_Run
    - State_bound_follow_up_Run
  optional_additional_unit:
    - one_pre_freeze_candidate_reproposal_only_if_correction_uses_a_model
provider_dispatch_points:
  - Primary_Run
  - Recovery_Path_A
  - Recovery_Path_B
  - Candidate_proposal
  - Regression_Base_Run
  - Regression_Candidate_Run
  - State_bound_follow_up_Run
tool_side_effect_points:
  - Primary_Run_workspace
  - Recovery_A_workspace
  - Recovery_B_workspace
  - Candidate_artifact_staging
  - Regression_Base_workspace
  - Regression_Candidate_workspace
  - State_publication_after_Host_decision
  - Follow_up_workspace_and_ChangeSet
budget_fields_required:
  - per_unit_provider_request_cap
  - per_unit_input_output_combined_token_caps
  - per_unit_cost_cap_and_global_USD_hard_cap
  - per_unit_tool_call_and_command_caps
  - verifier_timeout_and_output_caps
  - wall_time_caps
  - retry_fallback_replacement_caps_fixed_to_zero_unless_explicitly_authorized
  - correction_budget_and_whether_reproposal_consumes_a_unit
  - stop_and_terminalization_rules
facts_needed_before_goal_2_freeze:
  - exact_model_provider_price_and_dispatch_behavior
  - exact_Case_tasks_workspaces_verifiers_and_registered_commands
  - exact_candidate_type_and_proposal_prompt
  - exact_regression_pack_and_applicability
  - exact_follow_up_task_and_verifier
  - exact_treatment_symmetry_and_frozen_profiles
  - exact_no_retry_no_fallback_no_replacement_rules
  - accepted_authority_bridge_for_G1_and_V3_6_follow_up
```

**Fact.** Once all inputs and runtime routes exist, the existing V2/V3/V3.6 budget profiles show that these units can be bounded before freeze. The current blocker is not inability to count requests or cost; it is lack of an accepted complete path.

### 9.2 Real Case criteria and candidate type

No real Case was selected or frozen.

A future Case must have a reproducible Harness-level problem rather than a task answer; real Primary/A/B Agent execution; independent common Verifier; meaningful retained-history versus fresh-session strategy difference; transferable Lesson; source-external applicability regressions; and a related, non-duplicate follow-up. It must be selected before the single real run and cannot be hunted after results.

**Recommendation.** If the plan is revised and the authority bridge is accepted, prefer `prompt_addendum` for the first frozen full loop. The accepted V3 runtime already composes prompt State, and V3.6 already accepts a Host-supplied system prompt. This minimizes the mechanical runtime delta relative to adaptive Skill loading. It does not remove the required G1/runtime-evidence decision.

Maximum risks before Goal 2 freeze:

- choosing a Case whose V2 evidence still cannot produce an accepted Opportunity;
- mistaking State-digest pinning for runtime consumption;
- using a V3.6 ChangeSet Run that G1 cannot admit;
- inventing a demo-only bridge or performing Case/result hunting;
- allowing Candidate content to encode the source-task answer.

## 10. ChangeSet, Source and fairness

| Requirement | Finding |
|---|---|
| Primary, A, B isolated workspaces | V2 directly supports Seed clones and isolated Candidates |
| Independent ChangeSets for all three | V3.6 ChangeSet supports one Session workspace; a bounded adapter is needed to export each V2 arm as a reviewable ChangeSet |
| Inspect/export after Comparison | feasible using immutable V2 snapshots plus V3.6 projection/export patterns |
| Recovery changes excluded from Regression baseline | feasible; G2 comparator copies a separately supplied frozen source workspace |
| Base/Candidate byte-identical start | directly supported by V3 comparator |
| Follow-up independent frozen related source baseline | feasible via V3.6 source snapshot/session pin |
| Only planned follow-up difference is State binding | not currently demonstrable in V3.6 because binding is not consumed or attested |
| Apply/Discard/Export retained | directly reusable from V3.6 |

No new workspace framework is required. A bounded adapter can expose V2 snapshots as ChangeSet-like review artifacts without changing their authority. However, the full fairness claim fails at follow-up treatment because V3.6 does not currently consume the State binding.

## 11. Five-day scope and risks

```yaml
optimistic_estimate: not_valid_for_the_current_plan_because_authority_design_precedes_implementation
expected_estimate: exceeds_3_5_to_5_high_intensity_development_days
main_uncertainty: which_explicit_accepted_core_authority_amendment_the_user_would_choose
likely_scope_breaker: dynamic_G1_admission_plus_V3_6_runtime_binding_and_attested_follow_up_bridge
five_day_scope_feasible: false
```

Thin workflow persistence, bounded Case config, UI actions/projections and deterministic orchestration could plausibly fit the nominal window in isolation. The current plan also needs an accepted authority redesign, new focused audit surface and revised integration tests. That is not a normal five-day product extension.

### 11.1 Blocking risks

- G1 V2 admission yields `no_opportunity` and cannot produce Candidate input.
- New workflow/Run registrations cannot enter fixed G1 Host approvals.
- V3.6 binding is identity-only, not runtime-effective.
- V3.6 follow-up cannot enter G1 or G2 Assessment.
- A deterministic-only bridge would violate the same-production-path rule.

### 11.2 Non-blocking risks

- exact workflow record schema and route names;
- UI layout and Candidate diff presentation;
- bounded Case registry shape;
- V2 arm-to-ChangeSet projection;
- pre-freeze leakage/schema validator;
- exact regression pack registration if kept bounded and Host-controlled.

### 11.3 Unresolved but Charter-resolvable only after plan revision

- the two deterministic Cases;
- exact real Case;
- Prompt versus Skill final freeze;
- exact budgets and correction count;
- user confirmation receipt shape;
- workflow stage names and reopen navigation;
- UI arrangement and bilingual labels.

## 12. Verification performed

Read-only/static commands were used for Git identity, path presence, search and source inspection. No network, Credential, real Provider/model or Docker product command was invoked.

```text
node D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc -p tsconfig.json --noEmit
  -> exit 0

node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 \
  tests/v36g1-authority-session.test.ts tests/v36-product-polish.test.ts
  -> 6/6 pass
```

An attempted combined G1/G2 regression invocation produced 8 passes and 18 setup failures. The failures were not product assertions: the authoritative worktree lacks ignored historical `.runs/final-capstone/g1/sources/.../tool-results` material required by the G1 suite, and concurrent G1/G2 test setup then contended on the same ignored root (`ESRCH`, `ENOTEMPTY`, `EPERM`). No missing artifacts were fabricated and no rejected worktree was consulted. This execution interruption does not alter the source-grounded blocker findings; accepted Closeouts retain their historical recorded results.

```yaml
remaining_unverified:
  - fresh_full_G1_suite_in_this_worktree_due_to_missing_ignored_fixture_artifacts
  - fresh_full_G2_suite_isolated_from_G1_setup_contention
  - any_V3_7_implementation_or_real_path_because_both_were_forbidden
```

## 13. Inputs for a future Main after plan revision

This section does not create a Charter.

### Confirmed reusable interfaces

- V2 Recovery Seed, two isolated Candidate paths, Verifier and Selection artifacts;
- V3 Opportunity/Candidate types and bounded producer once valid FrozenEvidence exists;
- V3 staging, symmetric comparison, State Store, CAS, rollback and actual public-Pi binding path;
- G2 fixed-pack regression and assessment semantics once valid G1 inputs exist;
- V3.5/V3.6 persistence, Read Model, loopback API, narrow browser schema;
- V3.6 registered Project/command profiles, managed workspace, ChangeSet and Apply/Discard/Export.

### Confirmed implementation gaps

- bounded Case/workflow orchestration and non-authoritative record;
- V2 arm ChangeSet projection;
- Candidate leakage/pre-freeze correction validator;
- bounded Case/regression registration;
- thin actions/projections and reopen UI;
- most importantly, an explicitly authorized G1/runtime bridge decision not allowed under the present plan.

### Forbidden semantic changes under the current plan

- weakening or bypassing `FIXED_HOST_APPROVALS_G1`;
- relabeling V2 Candidate paths as peer Runs;
- fabricating FrozenEvidence comparison or formal failure;
- adding an Evidence family silently;
- treating V3.6 State digest as proof of runtime consumption;
- allowing browser/user confirmation to confer Authority;
- weakening G2 assessment/rollback attribution;
- importing rejected Schema 2 or changing Pi Core.

### Facts requiring later freeze

- explicit revised authority model for dynamic Case/Run admission;
- accepted representation of the V2 failure/comparison evidence needed by V3;
- accepted V3.6 runtime binding and evidence contract;
- accepted follow-up family/bridge into G1 and G2;
- exact Case records, Candidate type, pack, profiles, budgets and corrections;
- focused audit boundaries for the new high-risk authority path.

### Recommended ownership boundaries

- Main/user: accepted-core amendments, scope, Charter, Case/budget freeze and acceptance;
- dedicated implementation Session: bounded source/tests/report only after Charter;
- focused independent audit: G1 approval/evidence lineage, runtime binding, terminal/Verifier truth and assessment boundary;
- Stage 2 execution Session: frozen real Case only, no source/control edits;
- browser: opaque action requests and confirmations only.

## 14. Final rationale

The plan correctly anticipated that much of V3.7 could be thin composition. Source confirms reusable recovery, Candidate/State, Session, workspace, ChangeSet, persistence, Read Model and WebUI layers. It also confirms that Pi Core, a new frontend framework, a new State Store and a new workspace framework are unnecessary.

The plan's decisive assumption is false: accepted artifacts do not currently compose into the full loop without semantic change. The first G1 edge, the V3.6 State-consumption edge and the follow-up G1 edge all fail closed by design. The fixed approval root also prevents the dynamic Run registrations that a reusable product workflow needs. These are precisely GO-blocking Authority, identity, Evidence admission and runtime-consumption facts.

Because the current plan forbids the changes needed to bridge those edges, implementation must not start. The version plan must first be revised by explicit user decision. A future decision may narrow V3.7, or explicitly authorize a new accepted-core design and its audit burden, but that choice is outside this review.

## 15. Exact next action

> Return the blocking findings to the User. Do not create a V3.7 Main Session or begin implementation until the version plan is revised by an explicit User decision.

Do not create `V3_7_CHARTER.md`. Do not start Goal 1. Do not modify business source. Do not run a real Case.
