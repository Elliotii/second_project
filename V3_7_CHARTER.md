# V3.7 Charter — Registered Recovery and Runtime-effective State Follow-up

```yaml
charter_id: V3_7_REGISTERED_RECOVERY_AND_RUNTIME_FOLLOW_UP
status: PLAN_READY_FOR_REVIEW
date: 2026-08-18
authoritative_repository: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
authoritative_branch: codex/v2-b-bounded-r2
reviewed_head: 429945da1cc95a83186c15f45be81c977aab0223
reviewed_tree: 45e9a315d8d2673f5f82989bebe750ed299b7ec2
baseline_tag: final-capstone-g1-g2-accepted-g3-incomplete-2026-08-18
implementation_started: false
business_source_changes: false
real_provider_calls: 0
credential_reads: 0
goal_1_started: false
material_conflicts_found: []
```

## 1. Authority and decision vocabulary

This Charter converts the final revised `第二项目_V3.7_规划.md` into four bounded execution contracts without starting implementation. It is subordinate to the revised
version plan on version scope and to accepted repository evidence on source facts.

Material statements use these labels:

- **Repository Fact** — observed in the authoritative repository or an accepted record.
- **Charter Decision** — an engineering contract frozen here for V3.7.
- **Deferred Freeze** — a value that must be frozen at the named later control point.
- **Blocking Conflict** — a source/authority conflict that prevents Charter freeze.

### 1.1 Authoritative inputs

| Input | Role |
|---|---|
| final revised `C:/Users/HUAWEI/Downloads/第二项目_V3.7_规划.md` | version scope and bridge authorization |
| `V3_7_PREIMPLEMENTATION_REVIEW.md` | inherited source facts and composition gaps |
| Final Capstone G1/G2 Closeouts | accepted G1/G2 semantic baseline |
| Final Capstone G3 incomplete Closeout and completion verification | rejected-path and stop baseline |
| `CURRENT_STATE.md` and current plan | live repository control state |
| V3/V3.6 Charters, architecture guide and necessary Closeouts | reusable State/runtime/product contracts |

**Repository Fact.** The final revised V3.7 plan is the explicit user-authorized
revision anticipated by the Review. Its SHA-256 is
`f0fd51a955fee72dfebdf66a901f786fcc12e90524ca239016e650d390e07ac1`.
The Review inspected the same HEAD but an earlier plan revision; this is deliberate supersession, not a source conflict.

### 1.2 Baseline verification

| Check | Result |
|---|---|
| repository / branch | exact match to the status block |
| HEAD / tree | exact match to the Review and checkpoint |
| tag target | exact HEAD |
| Final Capstone G1 | `closed_accepted` |
| Final Capstone G2 | `closed_accepted` |
| Final Capstone G3 | `closed_incomplete`, `STOPPED_UNACCEPTED` |
| rejected Schema 2 paths | absent from HEAD and authoritative worktree |
| tracked working tree | clean before this Charter |
| pre-existing untracked delta | Review, G3 completion verification, Case Evidence Audit |

**Repository Fact.** The rejected G3 Schema 2 implementation remains outside the
authoritative tree. It was not inspected as a design input, copied, staged or adopted.

**Blocking Conflict.** None. The key source interfaces remain materially identical to
those recorded by the Review, so Charter freeze may proceed.

## 2. Version question and fixed Goal structure

V3.7 asks whether one Host-reviewed, versioned, content-addressed Registered Case can
traverse this product path through Host-controlled evidence and State authority:

```text
Primary problem -> Recovery A/B -> admitted recovery Evidence -> Prompt Candidate
-> symmetric Regression -> Promote -> runtime-effective bound follow-up
-> admitted follow-up Evidence -> G2 State Assessment
```

The version-level structure is fixed:

| Goal / Stage | Name | Required result |
|---|---|---|
| Goal 1 | Registered Recovery Evidence Bridge | accepted plus focused audit PASS |
| Goal 2 | Runtime-effective State Follow-up Bridge | Bridge 2A and 2B accepted plus focused audit PASS |
| Goal 3A | Reusable Product Capability | deterministic product path accepted |
| Goal 3B | One Frozen Real Full Loop | one frozen real Case executed once and closed truthfully |

Bridge names are fixed:

- Bridge 1 — Registered Recovery Evidence Bridge.
- Bridge 2A — Runtime-effective State Binding.
- Bridge 2B — Registered Bound-State Follow-up Evidence.

Bridge 2A and Bridge 2B form one Goal 2 contract and one acceptance decision.

## 3. Global engineering contract

This section is the single authority for rules shared by every Goal. Goal sections refer
here rather than restating them.

### 3.1 Preserved accepted semantics

**Charter Decision.** V3.7 adds explicit new variants and adapters. It does not reinterpret
historical artifacts.

- The three accepted Final Capstone G1 families and every old derivation remain unchanged.
- Old `v2a_recovery_comparison` evidence continues to project as `no_opportunity` when it
  lacks a genuine peer-Run comparison.
- Candidate Path IDs are never represented as peer Run IDs.
- Final Capstone G2 `retain`, `needs_reassessment`, rollback attribution and no-direct-
  supersede rules remain unchanged.
- V3 State Store versions, decisions, active pointer, CAS and rollback semantics remain
  unchanged.
- Ordinary V3.6 free-input Runs remain `unverified`, with null formal Outcome and all
  adaptation/comparison/promotion eligibility false.
- Pi Core and the public Direct Pi `AgentHarness` boundary remain unchanged.

### 3.2 New bridge invariants

Every V3.7 bridge object and action must be:

- Host-controlled and unavailable from caller-authored approval material;
- schema-versioned and exact-key validated;
- content-addressed with lower-case SHA-256 over canonical UTF-8 JSON;
- write-once or append-only, with idempotent reopen only for byte-identical content;
- fail-closed on missing, stale, ambiguous, cross-Case or cross-workflow lineage;
- usable only by a Registered Case and its Host-derived workflow registration;
- isolated from the ordinary V3.6 path.

Unless a schema below states otherwise, `*_digest` is computed over the complete body
excluding only that digest field. IDs derived from content use the first 32 hex characters
of the named seed digest; Host-minted IDs are opaque and validated independently.

### 3.3 Authority split

| Actor | May do | Must not do |
|---|---|---|
| Agent | execute a registered task; propose Diagnosis, Lesson and Candidate | admit, promote, reject, assess, roll back or register a Case |
| Browser/user | choose opaque Case/workflow/action IDs; make two submission requests; review artifacts | supply paths, profiles, Verifier, budget, Outcome, Evidence truth or Host decisions |
| Host application | mint workflow/Run identities; derive registrations; dispatch registered actions | infer success from model self-report |
| G1 Inspector | independently recompute and Admit/Reject new Evidence | trust confirmation as Evidence truth |
| G2 controller | validate, publish, assess and strictly attributed rollback | accept a direct caller-selected result or target |
| Main Session | architecture, candidate/audit control and final acceptance | implement silently or waive a Contract gate |

The governing rule remains: **Agent proposes; Harness disposes.**

### 3.4 Persistence and filesystem identity

- Manifest bodies and registration envelopes are repository/Host-owned immutable
  artifacts, not browser-editable runtime records.
- Workflow headers, registrations, formal references, confirmations and transition
  receipts persist under a Host-owned data root with link/reparse/hardlink and real-path
  protections matching accepted G1/G2/V3.5/V3.6 patterns.
- Evidence, Candidate, Decision, State, Verifier, Outcome and Assessment bodies remain in
  their formal stores. The workflow record stores only typed references and digests.
- Reopen re-inspects every referenced formal artifact. A cached navigation stage is never
  authoritative and any mismatch fails closed.
- `.runs`, Credentials and local execution material remain ignored.

### 3.5 Candidate and source fairness

- V3.7 `closed_accepted` requires `candidate_type: prompt_addendum`.
- A V3.7 Candidate contains exactly one prompt-addendum edit with applicability equal to
  the Registered Case applicability.
- Candidate input is the current workflow's admitted recovery Opportunity plus the
  current accepted Base State digest.
- Recovery workspaces never become the Regression source baseline.
- Regression Base/Candidate start from byte-identical frozen source and differ only by
  the frozen Candidate treatment.
- The follow-up uses a separately frozen related source baseline and task.
- Normal product Apply/Discard/Export remain available but cannot contaminate frozen
  acceptance baselines.

### 3.6 Repository source anchors

| Contract edge | Existing source anchor / symbol |
|---|---|
| V2 recovery truth | `workbench/src/run-v2.ts#executeRecoveryGroupFromSeedV2`; `workbench/src/inspect-v2.ts#inspectRunV2A` |
| old G1 boundary | `workbench/src/contracts/final-capstone-g1-types.ts#TrustedEvidenceSourceG1`; `workbench/src/refinement/evidence-admission-g1.ts#FIXED_HOST_APPROVALS_G1`, `fixedHostApprovalG1`, `v2Derivation`, `v3Derivation` |
| V3 projection/producer | `workbench/src/refinement/evidence-v3.ts#projectImprovementOpportunityV3`; `workbench/src/refinement/producer-v3.ts#validateProposalAndBuildCandidateV3`, `createBoundedModelBackedProducerV3` |
| V3 State/binding/runtime | `workbench/src/state/store-v3.ts#inspectStateStoreV3`, `applyValidationDecisionV3`, `rollbackActiveStateV3`; `workbench/src/state/binding-v3.ts#freezeRunBindingV3`; `workbench/src/pi/pi-adapter-v3.ts#runHarnessV3` |
| G2 regression/assessment | `workbench/src/refinement/regression-gate-g2.ts#executeRegressionGatedCandidatePublicationG2`; `workbench/src/state/state-feedback-g2.ts#deriveAssessment`, `persistStateAssessmentG2`, `applyAssessedRollbackG2` |
| V3.6 product/runtime | `workbench/src/project/registry-v36.ts#ProjectProfileRegistryV36`; `workbench/src/v36/daily-product-v36.ts#createDailyProductApplicationV36`; `workbench/src/session/persistent-session-v36.ts#executeBoundedTurn` |
| product/read surface | `workbench/src/v36/authority-v36.ts#InteractiveControlPlaneV36`; `workbench/src/webui/application-v36g2.ts`; `workbench/src/workspace/change-set-v36.ts`; `workbench/src/read-model/workbench-v35g3.ts` |

These anchors constrain composition; they are not an exact implementation file allowlist.

### 3.7 Global non-goals

V3.7 does not build arbitrary runtime Case enrollment, a generic Registry, generic Eval,
general self-evolution, a new Evidence/State/workspace store, a new Agent runtime, a new
frontend framework, a general task designer, Runtime Attestation, Provider raw-payload
archival, Pi changes, containers beyond the accepted V3.6 backend, or a large UI.

### 3.8 Hard Stops

Stop the current Goal and return to Main/user if implementation would require: (1) browser, caller, Agent or confirmation-conferred Authority; (2) arbitrary enrollment or unregistered Evidence; (3) changed old G1 meaning or manufactured failure/comparison/binding/Outcome; (4) Candidate Path IDs represented as Runs; (5) ordinary V3.6 admission; (6) weakened G2 Assessment/rollback/no-direct-supersede; (7) changed V3 State Store/CAS; (8) rejected Schema 2; (9) strict Provider/Docker attestation or Pi changes; (10) a demo/test-only success path; (11) post-dispatch Case/Candidate/Verifier/Regression/follow-up/budget changes; (12) a third Recovery, retry, fallback, replacement or result hunting; (13) exhausted correction budget without audit PASS; (14) more than ten high-intensity days without user review; or (15) expansion back into strict Final Capstone G3.

### 3.9 Common implementation and audit sequence

Goal 1 and Goal 2 each use exactly this sequence:

```text
dedicated Implementation Session
-> candidate implementation commit
-> Main preliminary review
-> immutable audit candidate commit/tree freeze
-> fresh independent read-only Focused Audit Session
-> audit PASS
-> Main final Goal acceptance
```

If audit fails within budget, the original Implementation Session makes one bounded
correction, creates a new candidate commit/tree, Main re-reviews, and a fresh independent
focused audit reviews the new immutable candidate. Every post-audit source change requires
re-audit. Audit cannot write source, create the candidate, accept the Goal or also act as
Implementation Session.

## 4. Shared Registered Case and workflow identity

This section is the sole schema authority shared by Goals 1–3.

### 4.1 Immutable Manifest Body

**Charter Decision.** `RegisteredCaseManifestBodyV37` schema version 1 has these semantic
fields; implementation may group them into exact nested records but may not omit or add
authority-bearing inputs:

| Exact field group | Fields |
|---|---|
| identity | `schema_version: 1`, `kind: v37_registered_case_manifest_body`, `case_id`, `manifest_version`, `project_id` |
| Primary | `source_baseline_spec`, `primary_task_spec`, `primary_verifier_spec`, `problem_trigger_spec` |
| Recovery | `recovery_a_strategy_spec`, `recovery_b_strategy_spec`, `comparison_profile_spec` |
| adaptation | `candidate_policy_spec`, `regression_pack_spec`, `state_applicability`, `state_store_scope_spec` |
| follow-up | `follow_up_task_spec`, `follow_up_source_baseline_spec`, `follow_up_verifier_spec` |
| execution | `provider_profile_spec`, `tool_profile_spec`, `command_profile_spec`, `budget_profile_spec`, `stop_condition_profile_spec`, `runtime_base_prompt_spec` |
| content identity | `manifest_body_digest` |

Every `*_spec` contains an immutable body or a content-addressed repository reference and
its digest. The body contains no status, approval timestamp or mutable registration fact.
Manifest body changes require a new `manifest_version` and digest.

**Charter Decision.** Task parameterization is forbidden in V3.7. Both Primary and
follow-up tasks are exact registered task bodies. A task instance is still Host-derived
from `{workflow_registration_digest, task_spec_digest, role}` so the same Case can create
multiple distinct workflows without caller-supplied input binding.

### 4.2 Host-owned Registration Envelope

| Exact field group | Fields |
|---|---|
| identity | `schema_version: 1`, `kind: v37_case_registration_envelope`, `case_id`, `manifest_version`, `approved_manifest_body_digest` |
| chain/status | `registration_revision`, `previous_registration_digest: null \| sha256`, `registration_status: accepted \| disabled` |
| Host approval | `approval_record_id`, `approval_policy_id: v37-main-reviewed-case-registration-v1`, `approved_at`, `disabled_at: null \| timestamp` |
| content identity | `registration_digest` |

**Charter Decision.** Envelopes are immutable and append-only. Disable creates a new
envelope that references the previous accepted digest; it never mutates the Manifest or
old envelope. The bounded Host registry exposes one current envelope per Case/version and
accepts only envelopes present in reviewed Host configuration/repository artifacts.

The browser cannot submit an envelope, digest, status or approval record. Adding,
re-enabling or versioning a Case requires explicit Main review and a source/configuration
change; there is no runtime enrollment API.

**Charter Decision.** A disabled current registration:

- cannot create a new workflow;
- blocks every not-yet-started V3.7 execution, submission or State-mutating action in an
  existing workflow;
- permits read-only reopen, inspection and export of already frozen historical artifacts;
- does not invalidate an admission, Decision, State or Assessment already accepted while
  the pinned registration was current and accepted.

#### Registration runtime trust anchor

**Charter Decision.** Main Session chat conclusions, narrative approval and the literal
value of `approval_policy_id` are governance inputs only; none is Runtime Authority. The
only registration runtime trust anchor is a baseline-bound Host registry definition whose
trust-root tuple fixes the accepted repository commit/tree or Charter-allowed frozen
Host-configuration baseline, exact registry location, loader contract/fingerprint, and
allowed Manifest Body/Registration Envelope digests.

Runtime and Inspector must load Manifest Bodies and Registration Envelopes from that exact
trust root and recompute their digests and envelope chain. Browser confirmation,
caller-supplied digests, Session narrative, manually filled approval fields, and approval
records carried inside a submission package are never trust anchors. Package copies of a
Manifest, Envelope or approval record are non-authoritative references to compare against
the trust root; they cannot grant eligibility when the trusted registry entry is missing,
disabled or different.

**Deferred Freeze.** The Goal 1 Implementation Prompt must bind the exact Host registry
location, loader entry point and contract fingerprint, accepted repository/configuration
baseline, allowed digest inventory, and trust-root verification procedure. This is a
bounded loader/configuration boundary, not a signing system, PKI, Runtime Attestation or
new Authority Store.

### 4.3 Workflow Registration Derivation

The Host mints `workflow_id` using the V3.7 workflow application service, persists the
registration before Primary authority, and derives this exact semantic body:

| Exact field group | Fields |
|---|---|
| identity | `schema_version: 1`, `kind: v37_workflow_registration`, `workflow_id`, `case_id`, `manifest_version`, `project_id`, `created_at` |
| authority | `manifest_body_digest`, `registration_digest`, `registry_trust_root_digest`, `source_baseline_digest`, `state_store_scope_digest` |
| execution | `provider_profile_digest`, `tool_profile_digest`, `command_profile_digest`, `budget_profile_digest`, `stop_condition_profile_digest`, `runtime_base_prompt_digest` |
| content identity | `workflow_registration_digest` |

All fields except `workflow_id` and `created_at` are inherited from the currently accepted
Manifest/envelope and cannot be overridden. Inspector recomputation reloads both Host
artifacts, verifies their current or historical relationship, and recomputes every digest.
`registry_trust_root_digest` is the digest of the Section 4.2 trust-root tuple.

Copying a valid registration digest to another workflow fails because every formal task,
Run, confirmation, Evidence and transition reference binds the Host-minted workflow ID and
`workflow_registration_digest`. A workflow path whose embedded header names a different
ID is rejected.

### 4.4 Thin workflow instance

The workflow instance consists of:

- one immutable header containing the workflow registration reference;
- an append-only, sequence-numbered, digest-chained list of Host transition receipts;
- typed references/digests to formal artifacts;
- two distinct confirmation receipts;
- optional non-authoritative cached navigation projection.

There is no browser-writeable stage field. Each transition receipt is emitted only after
the Host re-inspects its prerequisites. On reopen, the current stage is derived again from
formal artifacts and the receipt chain.

### 4.5 Cross-Goal V3 State Store scope

**Repository Fact.** The repository has no explicit `StateRoot` type. Existing V3 State
lineage is scoped by the configured `stateRoot` location supplied to `store-v3.ts`, the
persisted `project_id`, the `immutableBasePromptSha256` used to initialize/reinspect and
compose prompt entries, and the initial accepted State `state_digest`. A point-in-time
active identity is the existing `ActiveStateIdentityV3` tuple
`{binding_revision, state_version, state_digest}`; a Candidate names its Base through
`expected_base_state_digest`.

**Charter Decision.** “V3.7 State Store scope” is only a cross-Goal identity-continuity
term for this existing tuple:

```text
Host-resolved canonical configured stateRoot location
+ project_id
+ runtime_base_prompt_digest (= immutableBasePromptSha256)
+ initial accepted State state_digest
```

`state_store_scope_spec` in the Manifest binds those values through
`state_store_scope_digest`; the workflow registration inherits that digest without
override. `runtime_base_prompt_digest` must equal the SHA-256 of the exact immutable V3.6
runtime base policy prompt passed to `initializeStateStoreV3`, `inspectStateStoreV3`,
Candidate staging/validation and binding composition for this scope.

Goal 1 resolves its current Base by reopening this exact store and binding the Candidate's
`expected_base_state_digest` to the current `ActiveStateIdentityV3.state_digest` and
`project_id`. Candidate applicability must equal the Manifest `state_applicability`; it
filters entries inside this scope and cannot select or redefine a different scope.
Regression publication calls the existing State publication path against the same
canonical location, `project_id`, immutable base-prompt digest and expected active
identity, so the promoted version remains in the same parent/decision lineage. Goal 2
must reopen that same configured store and bind the promoted active identity from that
lineage; it may not create, clone, switch to or temporarily materialize another State
Store lineage for follow-up.

The invariant is:

```text
Goal 1 Candidate Base State scope
= Regression publication target State scope
= Goal 2 follow-up runtime binding State scope
```

Any scope-location, `project_id`, base-prompt digest, initial-State digest, expected-Base,
active-pointer, Candidate applicability, promotion lineage or workflow-scope mismatch
fails closed. This contract creates no `StateRoot` type, Store or persistence layer.

## 5. Goal 1 Contract — Registered Recovery Evidence Bridge

### 5.1 Goal question and ownership

Can a valid Registered Case Primary problem plus two isolated Recovery arms and their
registered Comparison be admitted as new recovery-learning Evidence and projected into a
real V3 Opportunity without changing old G1 meaning or granting caller Authority?

```yaml
implementation_owner: dedicated_new_goal_1_implementation_session
architecture_and_acceptance_owner: V3_7_Main_Session
real_model_calls: 0
external_provider_calls: 0
ordinary_correction_budget: 2
```

### 5.2 Scope and module boundary

Allowed module areas:

- new V3.7 contract/Manifest/registration/workflow-registration types;
- a bounded Host Case registration loader, trust-root verifier and Inspector;
- new G1 recovery episode derivation, persistence and Inspector;
- new Opportunity projector and V3.7 Candidate-policy wrapper;
- minimal adapters to accepted V2 inspection and existing V3 producer interfaces;
- V3.7 fixtures, focused deterministic tests and the Goal 1 report/Closeout draft.

Forbidden module areas:

- V2 controller/selector semantic changes;
- old G1 family branches, fixed approvals or old projector behavior;
- G2 Assessment, V3 State Store/CAS, V3.6 runtime/product/UI and Pi;
- real Provider/model paths and Goal 2/3 implementation.

Exact files and patch order, plus the Section 4.2 registry trust-root freeze, are
**Deferred Freeze** to the Goal 1 Implementation Prompt.

### 5.3 Recovery execution and Comparison identity

**Charter Decision.** Goal 1 reuses the accepted V2 recovery execution truth. It records
the one real Primary Run/Recovery controller identity plus the two real Candidate Path
execution identities. It does not invent `recovery_a_run_id` or `recovery_b_run_id` when
the accepted controller did not create peer Runs.

The new immutable Comparison Decision has:

| Exact field group | Fields |
|---|---|
| identity | `schema_version: 1`, `kind: v37_registered_recovery_comparison`, `comparison_decision_id`, `workflow_id`, `workflow_registration_digest` |
| episode | `primary_run_id`, `recovery_group_id`, `recovery_seed_id` |
| each ordered arm | `candidate_path_id`, `strategy_id`, `strategy_digest`, `workspace_digest`, `terminal_artifact_digest`, `verifier_artifact_digest` |
| decision | `comparison_profile_digest`, `selector_implementation_version`, `decision_result: selected \| no_valid_recovery \| invalid`, `selected_candidate_path_id`, `decision_reason` |
| content identity | `comparison_decision_digest` |

`comparison_decision_id` derives from the workflow registration, Primary/Seed/group,
ordered Candidate Path identities, profile digest, terminal digests and Verifier digests.
The decision is Host-computed from the frozen comparison profile. Browser/model output is
not an input. `no_valid_recovery` is terminal and ineligible for learning Evidence.

### 5.4 Recovery Evidence Body and submission request

The formal Evidence truth body is `RegisteredRecoveryEvidenceBodyV37`:

| Exact field group | Fields |
|---|---|
| identity | `schema_version: 1`, `family: v37_registered_recovery_learning_episode`, `case_id`, `manifest_body_digest`, `case_registration_digest`, `workflow_id`, `workflow_registration_digest` |
| Primary | `primary_task_instance_digest`, `primary_run_id`, `primary_source_workspace_digest`, `primary_terminal_artifact_digest`, `primary_verifier_artifact_digest`, `primary_problem_class` |
| Recovery shared | `recovery_group_id`, `recovery_seed_id`, `common_verifier_digest` |
| each A/B arm | `candidate_path_id`, `strategy_digest`, `workspace_digest`, `terminal_artifact_digest`, `verifier_artifact_digest` |
| Comparison | `comparison_decision_id`, `comparison_decision_digest` |
| execution | `provider_profile_digest`, `tool_profile_digest`, `command_profile_digest`, `budget_profile_digest`, `stop_condition_profile_digest` |
| content identity | `evidence_body_digest` |

The separate `RecoveryEvidenceSubmissionRequestV37` contains only:

Its exact fields are `schema_version: 1`, `kind:
v37_recovery_evidence_submission_request`, `workflow_id`,
`workflow_registration_digest`, `evidence_body_digest`, `confirmation_receipt_id`,
`confirmation_receipt_digest`, `requested_at` and `submission_request_digest`.

The Host mints the confirmation receipt from an allowed UI action and exact evidence
digest. The request is idempotent for that digest. Neither object adds facts to the other.

### 5.5 G1 Admission and Opportunity projection

**Charter Decision.** Implement a semantically independent top-level G1 variant named
`v37_registered_recovery_learning_episode`. Do not route it through
`fixedHostApprovalG1`, do not add fields to old `FrozenEvidenceV3`, and do not fabricate
an old peer-Run comparison.

The new G1 Inspector independently verifies:

- Manifest/envelope reloaded from the Section 4.2 registration trust root;
- workflow registration and task-instance derivation;
- Primary execution, valid registered problem trigger and frozen Verifier result;
- both isolated Candidate Path executions and common Verifier identity;
- registered Comparison/Selection and at least one valid improvement arm;
- exact profiles, budgets, stops, inventories and terminal truth;
- submission request binding and cross-Case/cross-workflow exclusion.

Admission produces an immutable `RegisteredRecoveryAdmissionV37` with the source
inventory, inspector identity/fingerprint, body/request identities, admitted/rejected
result and digest. Rejection is terminal for the workflow stage and cannot be edited.

The new projector consumes only an admitted record and directly creates an
`ImprovementOpportunityV3`. Its observations truthfully name Primary problem, Candidate
Path strategy difference, arm Verifier results and selected/non-selected path. It never
passes through the old inefficient-success comparison branch.

### 5.6 Candidate producer interface

The accepted interface remains:

```text
ImprovementOpportunityV3 + current accepted Base State digest
-> BoundedProposalPortV3
-> validateProposalAndBuildCandidateV3
-> V37CandidatePolicy
-> RefinementCandidateV3
```

`V37CandidatePolicy` requires one `prompt_addendum`, exact Manifest applicability,
Evidence identity from this workflow, no authority-targeting fields, and registered
content/scope limits. Its Base State and applicability checks use only the Section 4.5
State Store scope. Deterministic/Faux proposal uses this same production interface.

One pre-freeze content correction is allowed only for schema, format, missing fields,
scope or detected task-answer leakage. It occurs before any Regression result exists,
preserves the original proposal, creates a new proposal/Candidate identity and never
changes Evidence, Case, Candidate type or applicability. Model use for that correction is
zero in Goal 1 and **Deferred Freeze** to Goal 3B for the real Case.

### 5.7 Implementation order

1. Manifest body, envelope and workflow registration validators/Inspectors.
2. Honest V2 Primary/Seed/Candidate Path mapping and Comparison Decision.
3. Evidence Body and independent submission request.
4. G1 derivation, persistence, reopen and Inspector.
5. Opportunity projector and Candidate-policy integration.
6. Deterministic negative/positive tests and accepted regressions.
7. Candidate commit, Main review and the common focused-audit sequence.

### 5.8 Deterministic test categories

Coverage must include Manifest/envelope accept, unregister, disable, mutation and historical reopen; Host derivation versus caller/browser forgery; fixed task instances, multiple workflows and cross-Case/workflow substitution; Primary PASS/missing Verifier/invalid trigger; A/B isolation/common Verifier/terminal completeness; Candidate Path versus Run identity; Comparison select/both-fail/tamper; confirmation/request separation and replay; G1 Admit/Reject and Opportunity truth; Candidate evidence/applicability/scope/correction/freeze; old V2 `no_opportunity`; accepted G1/G2/V3 regressions; and rejected Schema 2 absence.

### 5.9 Exit Criteria

Goal 1 exits only when all Sections 4–5 schema/Authority contracts fail closed; a valid deterministic episode is admitted and yields an Opportunity consumed through the V3.7 Candidate wrapper; all negative categories pass; old G1 semantics and accepted regressions remain unchanged; exact verification and unverified items are reported; the immutable candidate receives independent focused-audit PASS; and Main gives final acceptance.

The focused audit is limited to Manifest/registration Authority, workflow derivation,
Primary/Seed/arm/Comparison lineage, request separation, new G1 admission/projector,
browser/caller non-authority and preservation of old family behavior. It does not re-audit
all V2/G1.

### 5.10 Next Session responsibility

After user acceptance of this Charter, the next Session is a fresh dedicated Goal 1
Implementation Session. It freezes an exact file allowlist and test list in its launch
Prompt, implements only Goal 1 with zero real access, creates the candidate implementation
commit, writes its implementation report and Goal 1 Closeout draft, then stops for Main.

## 6. Goal 2 Contract — Runtime-effective State Follow-up Bridge

### 6.1 Goal question and ownership

Can an accepted promoted Prompt State be loaded, frozen and actually supplied to the
V3.6 product Agent runtime for a registered follow-up, then produce formal Verifier/
Outcome Evidence that enters unchanged G2 State Assessment semantics?

```yaml
implementation_owner: dedicated_new_goal_2_implementation_session
architecture_and_acceptance_owner: V3_7_Main_Session
real_model_calls: 0
external_provider_calls: 0
ordinary_correction_budget: 2
```

Goal 2 may start only after Goal 1 final acceptance and audit PASS.

### 6.2 Scope and module boundary

Allowed module areas:

- V3.7 follow-up contracts and registered execution service;
- minimal V3.6 product composition/session observation extension;
- reuse or extraction of neutral V3 binding composition helpers;
- formal follow-up Verifier/Outcome packaging and Inspector;
- new G1 follow-up admission variant;
- narrow G2 canonical normalization adapter and Assessment reopen integration;
- focused deterministic tests and Goal 2 report/Closeout draft.

Forbidden module areas:

- Pi Core or a new Agent runtime;
- V3 State Store/CAS/rollback implementation semantics;
- old G1 bound-follow-up derivation semantics;
- G2 decision table, attribution tests or direct-supersede rules;
- ordinary V3.6 eligibility/outcome semantics;
- full workflow WebUI, adaptive Skill real path or Runtime Attestation.

Exact files and patch order are **Deferred Freeze** to the Goal 2 Implementation Prompt.

### 6.3 Bridge 2A — State loading and frozen binding

The registered follow-up service must:

1. load the exact workflow plus Manifest/envelope from the Section 4.2 trust root, then
   reopen the exact Section 4.5 V3 State Store scope;
2. independently inspect the active pointer, version and promotion Decision;
3. derive the exact Manifest task/failure applicability context;
4. select all and only applicable accepted `prompt_addendum` entries;
5. require that the newly promoted State and this workflow's Candidate lineage are among
   the binding inputs;
6. reject zero matches, applicable adaptive Skills, stale pointer or ambiguous lineage;
7. compose from the Manifest's frozen V3.6 runtime base policy prompt;
8. persist the binding before dispatch and recheck expected active identity immediately
   before the first Provider dispatch.

The final system prompt is the Section 4.5 immutable runtime base policy prompt plus
ordered applicable promoted prompt addenda. Goal 2 cannot treat the old V3.6 State digest
pin as consumption, forge V3 G3 Case Authority or substitute another State lineage.

The binding has at least:

| Exact field group | Fields |
|---|---|
| identity | `schema_version: 1`, `kind: v37_registered_follow_up_binding`, `workflow_id`, `workflow_registration_digest`, `project_id`, `follow_up_task_instance_digest` |
| State lineage | `state_store_scope_digest`, `active_binding_revision`, `active_state_version`, `active_state_digest`, `promotion_decision_id`, `promotion_decision_digest`, `candidate_id`, `candidate_digest`, `candidate_admission_digest` |
| treatment | `applicability_context`, `applicability_decision: applicable`, `bound_prompt_entry_identities`, `runtime_base_prompt_digest`, `composed_prompt_digest` |
| execution | `provider_profile_digest`, `tool_profile_digest`, `command_profile_digest`, `budget_profile_digest`, `stop_condition_profile_digest` |
| content identity | `binding_digest` |

After freeze, the binding is immutable. A later State pointer change does not rewrite
historical evidence, but pointer drift before dispatch stops the Run rather than silently
rebinding.

### 6.4 Runtime-observed binding, Verifier and Outcome

Application-layer observation is sufficient and is deliberately narrower than strict
attestation. The Host writes a pre-dispatch plan before entering `AgentHarness`, then the
V3.6 bounded-turn call records the exact `systemPrompt` argument digest and binding digest
received from the registered service. Settled/terminal inspection binds that observation
to Run, Session, workspace, authority and execution-profile identities.

No claim is made about Provider-internal byte handling. Provider payload archival,
coherent outer rehash defense and cryptographic Runtime Attestation are out of scope.

After a valid terminal Run, the Host executes the frozen follow-up Verifier and derives a
formal Outcome using an existing accepted Outcome pattern or a semantically equivalent
V3.7 exact schema. Model self-report cannot set either value. Budget/cancelled/integrity
terminals never become a verifier failure.

### 6.5 Execution budget and stop identity

The registered execution contract is inherited without caller override:

The exact inherited identity tuple is `{provider_profile_digest,
tool_profile_digest, command_profile_digest, budget_profile_digest,
stop_condition_profile_digest}`.

The budget profile body must freeze per-unit Provider request, combined-token, cost,
Tool-call, command, verifier timeout/output and wall-time limits. The stop profile freezes
terminalization plus retry/fallback/replacement values, all zero unless a later user
decision explicitly amends the Charter.

Goal 2 deterministic profile values and Goal 3B real values are **Deferred Freeze** to
their respective Implementation/Execution Prompts. The profile schema, digest derivation,
Manifest inheritance and evidence equality checks are frozen now.

### 6.6 Bridge 2B Evidence Body and request

`RegisteredBoundFollowUpEvidenceBodyV37` is:

| Exact field group | Fields |
|---|---|
| identity | `schema_version: 1`, `family: v37_registered_bound_state_followup`, `case_id`, `manifest_body_digest`, `case_registration_digest`, `workflow_id`, `workflow_registration_digest`, `follow_up_run_id` |
| task/source | `follow_up_task_instance_digest`, `follow_up_source_workspace_digest` |
| State/Candidate | `state_store_scope_digest`, `state_version_id`, `active_state_digest`, `promotion_decision_id`, `promotion_decision_digest`, `candidate_id`, `candidate_digest` |
| binding/runtime | `frozen_binding_digest`, `runtime_base_prompt_digest`, `composed_prompt_digest`, `runtime_observed_binding_digest` |
| execution | `provider_profile_digest`, `tool_profile_digest`, `command_profile_digest`, `budget_profile_digest`, `stop_condition_profile_digest` |
| result | `verifier_artifact_digest`, `formal_outcome_artifact_digest`, `formal_outcome`, `terminal_status` |
| content identity | `evidence_body_digest` |

The separate `FollowUpEvidenceSubmissionRequestV37` uses the same request schema as Goal 1
with `kind: v37_follow_up_evidence_submission_request` and a distinct second confirmation
receipt. The initial receipt is invalid for this request.

### 6.7 G1 Admission and G2 normalization

**Charter Decision.** Add a second independent G1 variant named
`v37_registered_bound_state_followup`. It accepts only the registered service package and
rejects ordinary V3.6 Runs, digest-only pins, caller system prompts/State IDs, missing
formal Outcomes, applicability mismatch and cross-Case lineage.

The G1 Inspector recomputes Manifest/workflow identity, accepted promotion lineage,
binding/composed-prompt identity, application-layer runtime observation, follow-up task/
source, execution contract, terminal, Verifier, Outcome and second request binding.

**Charter Decision.** Introduce `CanonicalBoundStateAssessmentInputG2` as a narrow internal
normal form. The existing `v3g3_bound_state_followup` adapter and the new V3.7 adapter each
independently validate their source admission before producing:

Its exact semantic fields are `admission_identity`, `evidence_identity`,
`trusted_task_context`, `state_store_scope_digest`, `bound_active_state_identity`,
`bound_promotion_decision_identity`, `binding_digest`, `outcome_status`,
`verifier_status` and `failure_attribution`.

`deriveAssessment` consumes this canonical value but its decision table is unchanged:
PASS can retain; ordinary negative needs reassessment; rollback still requires the same
fresh symmetric immediate-parent/current comparison and exact attribution; no Evidence
directly supersedes State.

### 6.8 Implementation order

1. Registered follow-up binding contract and State/applicability loader.
2. V3.6 product composition and pre-dispatch/runtime observation seam.
3. formal Verifier/Outcome and execution-contract inspection.
4. follow-up Evidence Body, second request and G1 admission.
5. dual-source canonical G2 normalization with unchanged decision logic.
6. persistence/reopen, deterministic tests and accepted regressions.
7. Candidate commit, Main review and common focused-audit sequence.

### 6.9 Deterministic test categories

Coverage must include digest-pin-without-injection; accepted/missing/stale/mismatched/inapplicable State; Candidate/promotion/State lineage and prompt composition; pointer drift; the real production seam delivering the composed prompt to `AgentHarness`; missing/mismatched runtime observation; exact execution-contract inheritance and terminalization; Verifier/Outcome positive/negative/missing/invalid cases; ordinary V3.6 and caller prompt/State rejection; second-confirmation and workflow isolation; G1 Admit/Reject/reopen; both G2 normalizers; retain/reassessment/strict rollback/no-direct-supersede; and Pi, State Store/CAS, old G1 and Schema 2 guards.

### 6.10 Exit Criteria and focused audit

Goal 2 exits only when both bridges pass as one candidate: applicability loads and freezes accepted State before dispatch; production V3.6 receives the exact composed Prompt; observation, terminal, Verifier and Outcome are inspectable; G1 admits valid and rejects invalid/caller packages; canonical normalization reaches unchanged G2 decisions; ordinary V3.6 and accepted State/G2 boundaries remain unchanged; verification and unverified items are reported; independent focused audit passes the immutable candidate; and Main gives final acceptance.

The focused audit is limited to applicability/State lineage, frozen binding, actual
application-layer prompt consumption, runtime observation, execution-contract equality,
Verifier/Outcome truth, follow-up G1 admission, G2 normalization and preservation of
Assessment/rollback semantics. It does not re-audit all V3/V3.6/G2.

### 6.11 Next Session responsibility

After Goal 1 final acceptance, a fresh dedicated Goal 2 Implementation Session freezes
its exact allowlist/test list, implements both Bridge 2A/2B with zero real access, creates
one candidate implementation commit, writes the report and Goal 2 Closeout draft, then
stops for Main. It may not begin Goal 3.

## 7. Goal 3A Contract — Reusable Product Capability

### 7.1 Goal question and ownership

Can a user operate the accepted Goal 1/2 path through the loopback WebUI for multiple
workflow instances, persist/reopen it safely, and remain outside formal Authority?

```yaml
implementation_owner: dedicated_new_goal_3a_product_implementation_session
architecture_and_acceptance_owner: V3_7_Main_Session
real_model_calls: 0
external_provider_calls: 0
ordinary_correction_budget: 2
```

Goal 3A may start only after Goal 1 and Goal 2 final acceptance and audit PASS.

### 7.2 Scope and module boundary

Allowed module areas are thin V3.7 orchestration, workflow journal/reopen, safe Read Model,
loopback API/action handlers, existing UI extension, two deterministic Manifests and
product tests. Existing V3.6 Files/Changes/Diff/Apply/Discard/Export and bilingual locale
must be reused.

Forbidden are bridge-semantic changes, new Authority stores, new frontend framework,
dashboard/IDE/terminal/graph editor, arbitrary Case editor, profile/Verifier editor,
streaming subsystem, real Provider access and Goal 3B execution.

Exact files/actions and patch order are **Deferred Freeze** to the Goal 3A Implementation
Prompt.

### 7.3 Product actions and browser non-authority

The WebUI exposes only Host-defined actions valid at the re-derived current stage:

```text
list Cases -> create workflow -> run Primary -> run Recovery A/B
-> inspect Comparison/ChangeSets -> initial confirmation -> request G1 admission
-> generate/validate/freeze Candidate -> run Regression -> inspect Decision/State
-> run bound follow-up -> second confirmation -> request G1 admission
-> inspect Assessment -> reopen/export/apply/discard where already authorized
```

Requests carry only opaque Case/workflow/action IDs and the narrow confirmation action.
Every action reloads Manifest, envelope, workflow registration and formal prerequisites.
The API rejects paths, Provider/model, commands/argv, Verifier, budget, Evidence content,
Candidate content, State identity, Decision, Assessment and rollback targets.

Primary routing is a non-authoritative projection:

| Formal fact | Route |
|---|---|
| Primary PASS | terminal `no_recovery_needed` |
| valid registered verifier problem | Recovery enabled |
| both recoveries fail | terminal `recovery_inconclusive` |
| Evidence/Candidate/Regression/follow-up rejection | honest stage terminal |
| integrity/platform/budget/cancelled | fail closed; never learning Evidence |

### 7.4 Two deterministic Registered Cases

Goal 3A freezes exactly these semantic fixtures; exact task/source bytes, profile values
and file paths are **Deferred Freeze** to its Implementation Prompt:

| Case ID | Required route |
|---|---|
| `v37-det-recovery-promote-retain` | full valid problem -> A/B -> admit -> Candidate -> Regression PASS -> Promote -> bound follow-up PASS -> retain |
| `v37-det-primary-pass` | Primary PASS -> `no_recovery_needed`, with no Recovery/Evidence/Candidate availability |

Both are reviewed Host Manifests, not test bypasses. The first runs the same application,
bridge, persistence, Read Model, API and action handlers later used by the real Case. Faux
Provider and deterministic command backend are the only substitutions. Tests may create
tampered copies for negative coverage, but those copies are never registered Cases.

### 7.5 Exit Criteria, correction and audit boundary

Goal 3A exits when both deterministic Cases run through production actions; multiple workflows remain isolated and cross-Case substitution fails; positive/negative routes and both confirmations use Host services; Candidate/State originate from current formal artifacts; reopen re-inspects references and rejects drift; UI stays non-authoritative and ordinary V3.6 behavior remains; strict TypeScript, product tests and affected regressions pass; verification/unverified items are reported; and Main accepts Goal 3A before any real Case freeze.

Independent focused audit is not automatic because Goals 1/2 already audit the core
bridges. If Goal 3A changes an accepted Authority, external-side-effect, Source-Apply,
terminalization or lineage rule rather than merely invoking it, Main must freeze a
candidate and order a read-only focused audit of that exact boundary before acceptance.
Any source change after such audit requires re-audit.

## 8. Goal 3B Contract — One Frozen Real Full Loop

### 8.1 Goal question and authority

Does one preselected real Registered Case traverse every formal stage through Assessment
on the exact Goal 3A production path?

```yaml
execution_owner: fresh_no_source_edit_goal_3b_real_acceptance_session
freeze_and_acceptance_owner: V3_7_Main_Session
source_write_authority: false
control_state_write_authority: false
case_count: 1
retry: 0
fallback: 0
replacement: 0
rerun_after_dispatch: 0
```

### 8.2 Deferred real freeze

**Deferred Freeze.** Only after Goal 3A acceptance, Main must present for user review and
freeze in the Goal 3B Execution Prompt:

- exact real Manifest body and accepted registration envelope;
- Project, Primary/follow-up source baselines and task bodies;
- Primary/follow-up Verifiers and problem trigger;
- Recovery A/B strategies and Comparison profile;
- one prompt-addendum Candidate proposal prompt and pre-freeze correction rule;
- Regression pack and State applicability;
- Provider/model, Tool/command and V3.6 Docker profile identities;
- per-unit request/token/cost/Tool/command/time limits and one global USD hard cap;
- stop, terminalization, invalid-run and secret-handling rules;
- exact execution baseline commit/tree and accepted bridge identities.

The Case must meet the revised plan's Harness-level problem, transferability, independent
Verifier, external applicability Regression and related non-duplicate follow-up criteria.
Selection after observing results is forbidden.

### 8.3 One-shot and invalid-run rules

The seven logical execution units are Primary, Recovery A, Recovery B, Candidate proposal,
Regression Base, Regression Candidate and bound follow-up. A sole pre-freeze Candidate
reproposal is allowed only if frozen in advance and budgeted as an eighth unit.

After any Provider dispatch, Tool/command side effect, or unit-specific execution
authority/formal artifact freeze, the Case cannot restart, retry, replace or rerun. A
mechanical launch may be repeated only when all three counts are zero; the already
accepted Manifest, registration and empty workflow header do not by themselves count as
a unit execution artifact. Main must verify and record that precondition before restart.

Regression Base/Candidate are one indivisible Pair; neither arm may be rerun alone.
Follow-up runs once. Any honest negative result terminates at its formal stage and leads to
`closed_incomplete`, not result hunting.

### 8.4 Accepted outcomes

`closed_accepted` requires the complete observed chain through an admitted follow-up and
persisted G2 Assessment. `retain` and `needs_reassessment` are both valid final Assessment
values if every earlier stage is valid.

`closed_incomplete` is required for a legal real execution that terminates at Primary
PASS, recovery inconclusive, admission rejection, invalid Candidate, Candidate Reject,
follow-up rejection, execution invalidity or another frozen negative route.

`rejected` is required if an accepted bridge or reusable product capability cannot stand
within this Charter. Core failure cannot be relabeled as an unlucky real Case.

### 8.5 User unguided check and final Closeout

After execution, the user independently uses the WebUI without step-by-step Codex guidance
to locate the Case/workflow, explain its final stage, inspect Primary/A/B/Comparison,
Evidence, Diagnosis/Lesson/Candidate, Regression/Decision/State, binding, follow-up
Verifier/Outcome, second admission and Assessment, then reopen the same workflow after a
service restart.

This check uses existing artifacts and no new model call. Only a genuine navigation block
allows minimal rescue, which must be recorded.

Main then writes one `V3_7_FINAL_CLOSEOUT.md`, truthfully records all budgets/calls/cost,
unverified items, source and evidence identities, user-check result and claim limits, and
updates existing architecture/README/control state only under the separately reviewed
closeout authority. No automatic new Goal or version follows.

## 9. Goal transition and acceptance table

| Control point | Owner | May proceed only when |
|---|---|---|
| Charter review | user/Main | this file accepted once |
| Goal 1 implementation | fresh dedicated Session | accepted Charter and exact launch Prompt |
| Goal 1 audit | fresh independent Session | immutable candidate commit/tree frozen |
| Goal 1 acceptance | Main | audit PASS and all Exit Criteria |
| Goal 2 implementation | fresh dedicated Session | Goal 1 final accepted |
| Goal 2 audit | fresh independent Session | immutable candidate commit/tree frozen |
| Goal 2 acceptance | Main | audit PASS and both Bridge 2A/2B Exit Criteria |
| Goal 3A implementation | fresh dedicated Session | Goals 1/2 final accepted |
| Goal 3A acceptance | Main | deterministic product Exit Criteria |
| Goal 3B freeze | Main/user | exact Case, budgets and execution baseline reviewed |
| Goal 3B execution | fresh no-source-edit Session | separate explicit real-access authorization |
| V3.7 acceptance | Main/user | truthful outcome, unguided check and Final Closeout |

No Goal acceptance, audit PASS or unused authority automatically starts the next row.

## 10. Decisions requiring user review before implementation

The user should explicitly review these Charter decisions:

1. task parameterization is forbidden; task instances bind exact registered task bodies;
2. disabling a Case makes existing incomplete workflows read-only, while preserving
   already accepted historical artifacts;
3. Recovery arm truth keeps Candidate Path identities and never invents peer Run IDs;
4. Comparison is a new Host-owned V3.7 Decision artifact, not old FrozenEvidence
   comparison data;
5. both G1 additions are independent top-level variants rather than altered old families;
6. V3.7 Candidate policy is exactly one prompt addendum;
7. registration Runtime Authority comes only from the Section 4.2 baseline-bound Host
   registry trust root, never narrative/package approval material;
8. Goal 1 Base, Regression publication and Goal 2 binding use the single Section 4.5
   State Store scope identified by configured location, `project_id`, immutable base-prompt
   digest and initial accepted State digest;
9. G2 receives new follow-up admission through a canonical normalization adapter while
   its decision logic remains unchanged;
10. Goal 3A has two named semantic deterministic Cases and only risk-triggered additional
   audit beyond mandatory Goal 1/2 audits;
11. exact real Case/provider/budgets remain deferred to a separate post-Goal-3A freeze.

## 11. Items not completed by this Charter

- no Goal implementation, source/test/UI code or implementation Prompt;
- no Candidate, audit baseline, execution baseline, commit, tag or push;
- no Manifest, workflow, Evidence, State binding or runtime artifact;
- no Credential read, network, Provider/model call, Docker product task or real Case;
- no exact Goal file allowlist, patch order or exhaustive test-file list;
- no exact deterministic fixture bytes or real Case/budget values;
- no `V3_7_EXECUTION_PLAN.md` because no independent blocking material is needed.

## 12. Stop state

```yaml
status: PLAN_READY_FOR_REVIEW
authoritative_repository: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
authoritative_branch: codex/v2-b-bounded-r2
reviewed_head: 429945da1cc95a83186c15f45be81c977aab0223
reviewed_tree: 45e9a315d8d2673f5f82989bebe750ed299b7ec2
charter_file: V3_7_CHARTER.md
implementation_started: false
business_source_changes: false
real_provider_calls: 0
credential_reads: 0
goal_1_started: false
material_conflicts_found: []
charter_decisions_requiring_user_review:
  - fixed_task_instances_no_parameterization
  - disabled_case_existing_incomplete_workflows_become_read_only
  - candidate_path_identity_preserved_in_new_comparison_decision
  - two_independent_new_G1_variants
  - exactly_one_prompt_addendum_candidate
  - baseline_bound_Host_registry_is_the_only_registration_runtime_trust_anchor
  - one_cross_goal_State_Store_scope_binds_configured_location_project_base_prompt_and_initial_State
  - canonical_G2_normalization_with_unchanged_decision_logic
  - Goal_3A_additional_audit_is_risk_triggered
  - real_Case_and_numeric_budgets_deferred_until_post_Goal_3A_freeze
items_not_completed:
  - implementation
  - Goal_1_start
  - exact_implementation_prompts_and_file_allowlists
  - deterministic_fixture_bytes
  - real_Case_and_budget_freeze
  - candidate_audit_execution_or_closeout_commits
```

Stop here and wait for user confirmation of the Charter.
