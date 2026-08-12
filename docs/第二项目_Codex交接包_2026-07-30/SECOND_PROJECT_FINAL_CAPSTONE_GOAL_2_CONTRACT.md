# Final Capstone Goal 2 Contract — Regression-Gated State Feedback

```yaml
status: accepted_activated_zero_access
goal_id: FINAL_CAPSTONE_G2_REGRESSION_GATED_STATE_FEEDBACK
parent_version: SECOND_PROJECT_FINAL_CAPSTONE
goal_1_baseline_commit: 91521533e70b82daf75b418c4f9bd2eb38f1485e
goal_1_baseline_tree: bf756860673b447cdbe7160cc33b9cfed26100df
implementation_owner: fresh_top_level_goal_2_working_session
main_owner: replacement_final_capstone_main_session
credential_reads_authorized: 0
external_network_authorized: false
external_provider_or_model_calls_authorized: 0
pi_changes_authorized: false
git_commit_authority_for_working_session: false
goal_3_authorized: false
```

## 1. Objective

Implement the smallest Host-controlled connection that:

1. selects a small frozen regression pack from trusted applicability;
2. requires every publishable replacement Candidate to traverse the existing V3 symmetric
   validation and regression gate;
3. turns admitted follow-up evidence for a promoted bound State into one immutable,
   independently recomputable assessment: `retain`, `needs_reassessment`, or `rollback`;
4. permits an assessed rollback only when a fresh frozen fair comparison proves a
   State-attributable regression; and
5. routes mutation through the existing V3 State store, decision history, compare-and-swap
   pointer and rollback authority.

```text
Goal 1 admitted Evidence + promoted State lineage
  -> Host applicability selection
  -> frozen regression pack
  -> existing V3 Candidate validation / Promote or Reject
  -> bound follow-up admitted Evidence
  -> State assessment
       retain | needs_reassessment | rollback
  -> only valid rollback assessment may authorize existing Host rollback
```

Success does not mean that every Failure is caused by State, that a retained State is
generally beneficial, or that new Evidence may directly replace active State.

## 2. Binding inputs and Gate A

The Working Session must read, in order:

1. `CURRENT_STATE.md` from the exact Goal 2 Control Baseline;
2. `SECOND_PROJECT_FINAL_CAPSTONE_VERSION_CHARTER.md`;
3. this Contract;
4. `FINAL_CAPSTONE_G1_CLOSEOUT.md`;
5. `SECOND_PROJECT_FINAL_CAPABILITY_GAP_REVIEW_GOAL_AMENDMENT.md`;
6. `workbench/src/refinement/evidence-admission-g1.ts` and Goal 1 tests;
7. `workbench/src/refinement/comparator-v3.ts` and
   `workbench/tests/v3g2-validate-promote-reject-rollback.test.ts`;
8. `workbench/src/state/store-v3.ts`, `binding-v3.ts`, `inspect-v3.ts`, and their cited
   tests.

Before editing, Gate A records exact root commit/tree, clean tracked/staged state, the
pre-existing untracked Case Audit without adopting it, pinned clean Pi commit
`027a5847901b5dde30270abaa1041046cd2b4b55`, existing local TypeScript identity, and zero
Credential/network/Provider/model counters. Any mismatch stops before implementation.

## 3. Frozen semantics

### 3.1 Applicability-scoped Regression Gate

- Applicability comes only from an Inspector-valid Goal 1 admission's trusted task context
  and the existing Candidate/State applicability. Agent text, browser input, a Candidate
  field alone, or a caller-supplied list cannot select, omit or expand regression membership.
- A module-private, exact Host pack maps the Contract's bounded applicability keys to a
  small ordered set of frozen deterministic checks. Each check freezes verifier/task/source
  identity and digest; pack order and membership have one digest.
- Unknown applicability, empty pack, duplicate case, changed source, stale digest, unknown
  key, cross-project source or caller membership override fails closed.
- Candidate publication must use the existing V3 symmetric Base/Candidate validation,
  external verifier result, regression results, fairness identity, decision and
  `applyValidationDecisionV3`. Candidate source-Case PASS alone is insufficient.
- Candidate regression failure is Reject. A rejected Candidate writes no accepted State
  version and does not mutate the active pointer.

The Goal may add a narrow wrapper around existing V3 validation. It may not create a second
Candidate store, comparator, promotion rule, active pointer or publication path.

### 3.2 State assessment

An assessment request names, but cannot self-assert the validity of:

- one immutable Goal 1 bound-State follow-up admission;
- the exact promoted State version/digest, promotion Decision and binding digest consumed
  by that Run;
- the trusted task/failure applicability;
- the current active pointer identity at assessment time; and
- optionally, one frozen State-regression comparison and an earlier accepted rollback
  target.

The Host derives exactly one result:

| Result | Required evidence | Mutation |
|---|---|---|
| `retain` | admitted bound follow-up passed its frozen independent Verifier and exact State/binding lineage recomputes | none |
| `needs_reassessment` | admitted follow-up is negative but lacks a valid fair State-attributable regression comparison, or ordinary negative evidence is otherwise insufficient for rollback | none |
| `rollback` | a fresh symmetric accepted-State comparison holds Workspace, task, Verifier, regression pack, tool/model/budget profile and Session policy constant; current active State fails a check it previously passed while the immediate parent accepted State passes all hard checks; integrity, fairness, attribution and lineage all recompute | assessment only; separate Host application required |

`retain` does not prove general causal benefit. `needs_reassessment` never changes the
active pointer. Infrastructure, environment, evidence-integrity, user-attribution,
ambiguous attribution, missing comparison, fairness drift, changed applicability or an
invalid/unknown terminal cannot become `rollback`.

### 3.3 Assessed rollback application

- Persist the assessment write-once before any mutation.
- Only a recomputed `rollback` assessment may create a Host rollback authorization.
- The target must be the current active State's immediate accepted parent. Arbitrary older
  targets, current target, stale active identity and cross-project target fail closed.
- The application calls the existing `rollbackActiveStateV3` with compare-and-swap active
  identity. It does not directly write `active.json` or a parallel decision.
- Persist an application/link record connecting assessment, authorization, existing V3
  rollback Decision, prior/next active identity and target digest. Inspector recomputes the
  entire lineage.
- Agent output never invokes rollback authority. Existing legacy Host operator rollback is
  not relabeled as evidence-assessed rollback; the Final Capstone route claims only the new
  linked assessed path.

### 3.4 Replacement State rule

New admitted evidence may produce `needs_reassessment` or feed a separately constructed V3
Candidate. It must never directly supersede active State. Every replacement repeats:

```text
Candidate -> applicability-scoped Validation/Regression -> Promote or Reject
```

## 4. Bounded implementation surface

The Working Session may create or modify only:

- one new narrow type file under `workbench/src/contracts/`;
- one new regression-gate module under `workbench/src/refinement/`;
- one new assessment/application module under `workbench/src/state/`;
- one new independent Goal 2 Inspector under `workbench/src/`;
- one new focused Goal 2 test file under `workbench/tests/`;
- deterministic Goal 2 fixtures under `fixtures/final-capstone/g2/` only if source-generated
  checks cannot express the frozen identity;
- ignored raw evidence under `.runs/final-capstone/g2/`;
- `docs/reports/FINAL_CAPSTONE_G2_IMPLEMENTATION_REPORT.md`; and
- `docs/reports/FINAL_CAPSTONE_G2_CLOSEOUT_DRAFT.md`.

A minimal additive change to `workbench/src/refinement/comparator-v3.ts` and its existing
contract types is allowed only to expose one common symmetric accepted-State comparison
primitive needed for assessment. Existing Candidate validation output, decision table,
digests and tests must remain byte/behavior compatible. If `store-v3.ts`, Goal 1 source,
V3 binding, V3 Inspector or any V3.6 product source appears to require a change, stop and
return the exact symbol and reason to Main before editing.

## 5. Forbidden work

- no edits to `CURRENT_STATE.md`, `AGENTS.md`, Charter, Contract, Goal 1 source/reports,
  accepted Closeouts or historical evidence;
- no new Candidate generator, trigger rule, State store, active pointer, publication
  decision table, Verifier framework or generic applicability DSL;
- no direct pointer mutation, direct supersede, automatic replacement Candidate, automatic
  rollback from ordinary failure, retry, branch or result hunting;
- no V3.6 product binding, real Coding Run, Goal 3 task/fixture or Source Apply;
- no Credential read, network, Provider/model, real-model call, dependency installation,
  Pi edit/private import, SDK/Extension/RPC switch or second execution backend;
- no WebUI/CLI/product integration, database, plugin registry, Experience system,
  clustering, continual-learning loop or Multi-Agent design;
- no staging, commit, control-state edit, Goal acceptance or Goal 3 entry by the Working
  Session.

## 6. Required tests and gates

### Gate B — Host regression selection

- at least two supported applicability contexts select exact non-empty ordered packs;
- caller omission/addition/reordering, unknown applicability, stale source/digest, duplicate
  check and cross-project input reject;
- source Case PASS plus selected-regression FAIL rejects Candidate and preserves pointer;
- all selected checks PASS may reach existing V3 Promote logic; and
- selection and validation independently reopen with identical identities.

### Gate C — Assessment table

- valid bound follow-up PASS deterministically yields `retain` with no mutation;
- ordinary/ambiguous negative yields `needs_reassessment` with no mutation;
- valid State-attributable fair comparison yields `rollback` assessment but does not mutate
  until Host application;
- infrastructure/evidence/user attribution, missing/invalid/fairness-drift comparison,
  different initial Workspace, different Verifier/pack/budget/tool/model/Session policy,
  non-parent target and stale active identity cannot yield or apply rollback.

### Gate D — Authority, lineage and write-once

- Agent/caller cannot choose regression membership or assessment result;
- repeated identical assessment/application is deterministic/idempotent or write-once
  equivalent; conflicting bytes fail closed;
- `retain` and `needs_reassessment` never modify State/pointer/Workspace/Source;
- assessed rollback uses existing V3 rollback and CAS authority; and
- Inspector detects assessment, authorization, comparison, State history, decision, pointer
  or application tamper after process reopen.

### Gate E — Preserved semantics

At minimum run:

```powershell
node 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.json --noEmit
node --test tests/final-capstone-g2-regression-state-feedback.test.ts
node --test tests/final-capstone-g1-evidence-admission.test.ts
node --test tests/v3g1-evidence-to-candidate.test.ts
node --test tests/v3g2-validate-promote-reject-rollback.test.ts
node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts
```

## 7. Deliverables

The Implementation Report records Gate A, exact delta, source symbols reused or minimally
extended, commands/exits/counts, regression pack identities, positive and negative
assessment/application identities, before/after pointer and tree digests, ignored evidence,
zero-access counters, Pi clean state, remaining unverified items and a report-only
`CURRENT_STATE_UPDATE_PROPOSAL`.

The Closeout Draft maps every criterion and recommends only
`PASS_FINAL_CAPSTONE_G2_REGRESSION_GATED_STATE_FEEDBACK` or a precise non-PASS result.

## 8. Main review and audit

The accepted `FINAL_CAPSTONE_CORRECTION_BUDGET_AMENDMENT.md` applies: initial Main review
may be followed by at most two bounded correction rounds. The same authority/integrity
defect class recurring after correction, or failure to reach acceptance after round two,
returns `DECISION_REQUIRED`.

Main reviews the complete delta and evidence, returns one bundled bounded correction if
needed, and alone freezes the Candidate. Because this Goal controls regression membership,
assessment attribution and rollback authorization, a fresh focused independent audit of
the frozen Candidate is mandatory. Findings return to the original Working Session.

Goal 3 remains forbidden until Goal 2 has an accepted authoritative Closeout. Goal 2 uses
zero real access; all real execution authority belongs only to a later Goal 3 Contract.

## 9. Stop conditions

Return `DECISION_REQUIRED` if the Goal cannot be completed without changing the existing
V3 publication decision table or store format, weakening Goal 1 admission, creating a new
State authority, treating caller data as Host regression authority, adding a generic
framework, changing V3.6 daily eligibility, using real access, or expanding beyond the
bounded files above.
