# SECOND_PROJECT_FINAL_CAPSTONE Version Charter

```yaml
status: accepted_active
version_id: SECOND_PROJECT_FINAL_CAPSTONE
date: 2026-08-13
planning_source_commit: 4c4d2f3f397be7784700a2323c2afeaecbad03f0
planning_source_tree: f21b32938beaf638a68749aff28967d79aaa34a0
decision: RECOMMEND_FINAL_CORE_DEVELOPMENT
active_goal: null
implementation_authority: goal_1_consumed_goal_2_requires_detailed_contract
credential_reads_authorized: 0
external_network_authorized: false
external_provider_or_model_calls_authorized: 0
pi_changes_authorized: false
```

## 1. Authority and purpose

This Charter converts the accepted direction in
`docs/reports/SECOND_PROJECT_FINAL_CAPABILITY_GAP_REVIEW.md` and its binding
`SECOND_PROJECT_FINAL_CAPABILITY_GAP_REVIEW_GOAL_AMENDMENT.md` into the final bounded
development sequence. Repository source, tests, immutable evidence and accepted Closeouts
remain the authority for implementation facts. Where the original Gap Review and the
Amendment differ, the Amendment controls.

This Charter was accepted through the Final Capstone Main handoff. Goal 1 has since been
implemented and closed under its detailed Contract. Goal 2 and Goal 3 remain separately
bounded by their detailed Contracts; real access remains unauthorized until an applicable
later Contract explicitly grants it.

## 2. Mission and Version Question

Final Capstone closes the last three system edges without rebuilding the already accepted
V0–V3.6 capabilities:

```text
accepted runtime Evidence
  -> Harness Improvement Candidate
  -> Validation / Regression
  -> Promote / Reject
  -> Versioned Harness State
  -> Effective Binding
  -> Real Coding Run
  -> New Runtime Evidence
  -> State Assessment
```

The Version Question is:

> Can the existing Workbench admit only trusted, eligible runtime evidence into the
> existing V3 Improvement pipeline, gate long-lived State publication with bounded
> applicability-scoped regression, bind a promoted State in the real V3.6 product path,
> and use the resulting verifier-backed evidence to make an inspectable `retain`,
> `needs_reassessment`, or strictly attributable `rollback` assessment?

The durable principle is **Agent proposes; Harness disposes.** After this question is
answered by one bounded real product closure, core feature development stops.

## 3. Frozen Goal sequence

Goals execute strictly in order. A later Goal may not be detailed, activated or implemented
until Main has accepted the authoritative Closeout of its predecessor.

### Goal 1 — Trusted Evidence Admission

Add a Host-controlled, fail-closed admission boundary that validates existing accepted
Run/Verifier, Comparison/Recovery and bound-State follow-up artifacts, freezes their
identity and provenance, deterministically produces `FrozenEvidenceV3`, and then delegates
trigger semantics to the existing V3 projector.

Goal 1 does not add Candidate generation, automatic mining, State assessment, State
publication, V3.6 effective binding or real execution. Its detailed Contract is
`SECOND_PROJECT_FINAL_CAPSTONE_GOAL_1_CONTRACT.md`.

### Goal 2 — Regression-Gated State Feedback

After Goal 1 Closeout, freeze a detailed Contract that:

- selects a small, frozen regression set from trusted applicability rather than Agent input;
- requires Candidate publication to pass source-Case validation plus the selected regression set;
- persists and independently recomputes `retain`, `needs_reassessment`, and `rollback` assessments;
- allows rollback only for State-attributable regression evidence under a frozen fair comparison;
- keeps `needs_reassessment` non-mutating; and
- routes every replacement through the existing V3 Candidate → Validation/Regression →
  Promote/Reject → active-pointer authority.

Goal 2 must reuse the existing V3 comparator, store, decision and rollback authority. Its
current description is a high-level Contract boundary, not an API or file-layout decision.

### Goal 3 — One Real Closed-loop Product Acceptance

After Goal 2 Closeout, freeze a detailed Contract for exactly one pre-registered,
identity-frozen verifier-backed Coding Task. The accepted product chain must be:

```text
accepted Evidence -> Candidate -> Regression Gate -> Promote
  -> V3 State effective binding -> one real V3.6 Coding Run
  -> independent Verifier / Trace / ChangeSet
  -> new Goal 1 admission -> Goal 2 State assessment
```

The single real result may legitimately yield `retain` or `needs_reassessment`. The project
must not manufacture a failure, replace the task, add another Run, or hunt for `rollback`.
The task is an acceptance carrier only; it does not create a generic Verified Task or
Verifier product.

## 4. Cross-goal invariants

1. Agent authority is proposal-only. Admission, validation, promotion, rollback,
   active-pointer mutation and Source Apply are Harness/Host authority.
2. Evidence, Verifier, Comparison, State version, Binding and Decision identities are
   frozen, traceable, write-once where persisted, and Inspector-recomputable.
3. `ordinary failure != rollback`; `negative evidence != State-attributable regression`;
   `new evidence != direct supersede`.
4. `needs_reassessment` never mutates the active State.
5. A replacement State must re-enter the existing V3 Candidate → Validation/Regression →
   Promote/Reject path. No parallel publication or shortcut supersede authority is allowed.
6. Applicability comes from a trusted frozen task context. Agent/user free text cannot
   expand it at admission or binding time.
7. Ordinary free-input V3.6 Runs remain `unverified`, with null formal Outcome and false
   comparison/adaptation/promotion eligibility.
8. Infrastructure, tool, environment, evidence-integrity and user-attribution failures
   cannot be relabeled as Agent failure, State regression or rollback authority.
9. Goals reuse V3/V3.5/V3.6 State, Inspector, Session, Workspace, Runtime and Apply
   authority. They do not create a second authority plane.
10. Historical negative and paused evidence is immutable and is never overwritten,
    backfilled or upgraded by later success.

## 5. Main / Working Session governance

Correction rounds are additionally bounded by
`docs/reports/FINAL_CAPSTONE_CORRECTION_BUDGET_AMENDMENT.md`. That accepted User
Amendment controls the maximum rounds and structural-defect stop rule without expanding
any Goal authority.

- Main owns this Charter, Goal Contracts, architecture and scope decisions, Control and
  Candidate baselines, Main review, Goal acceptance, `CURRENT_STATE.md`, and Final Closeout.
- Each implementation Goal uses a fresh top-level Working Session only after explicit User
  activation and an exact Main-owned Control Baseline.
- A Working Session owns only its Contract-bounded implementation, focused deterministic
  tests, ignored raw evidence, Implementation Report and Closeout Draft. It may not edit
  control state, accept its Goal, enter the next Goal, stage files or commit unless a later
  explicit authority document says otherwise.
- Correctable implementation findings return as one bounded package to the original
  Working Session. Main and audit Sessions do not silently repair source.
- Independent audit is risk-driven. Goal 1's evidence admission/integrity boundary and
  Goal 2's publication/rollback boundary require a focused independent audit after Main
  freezes each Candidate. Goal 3 uses a fresh no-source-edit Execution Session and a
  focused lineage/authority review before final acceptance.
- Any Contract conflict, required major new subsystem, generic Verifier/Recovery design,
  or authority expansion returns `DECISION_REQUIRED` to Main/User.

## 6. Final Definition of Done and Stop Condition

Final Capstone is complete only when all are true:

1. trusted runtime Evidence can enter the existing V3 Improvement projector through a
   formal fail-closed Host admission boundary;
2. Candidate publication is controlled by a small frozen applicability-scoped regression gate;
3. follow-up evidence for a promoted State produces a legal, recomputable State assessment;
4. rollback and replacement cannot bypass existing V3 validation/publication authority;
5. one frozen verifier-backed task completes the real V3.6 product closure exactly once;
6. prior Evidence, Candidate, regression Decision, State version, effective Binding, real
   Run, Verifier/Trace/ChangeSet, new admission and assessment have Inspector-valid lineage;
7. authority, integrity, negative, attribution and regression tests pass; and
8. Main and User accept all three Goal Closeouts and the Final Capstone Closeout.

When these conditions hold:

# STOP CORE FEATURE DEVELOPMENT

Do not add a second task family, statistical Pilot, broader Verification, generalized
Recovery, Experience system, autonomous improvement cycle or new Agent platform version.

## 7. Explicit non-goals

- generic Verified Task Platform, Verifier framework or Verifier DSL;
- free-input automatic verification, arbitrary V3.6 formal Outcome or hidden-test generation;
- automatic V2 Recovery for all V3.6 tasks, unlimited retry, branching or result hunting;
- Experience Database, automatic mining/clustering, new Candidate-generation algorithm or
  continual-learning trigger;
- generic LLM Judge, Multi-Agent, new Runtime/Agent Loop, Agent-authored Harness source,
  model training, large Policy DSL, distributed/multi-user product or autonomous self-evolution;
- Pi Core changes, private Pi imports, SDK/Extension/RPC route switch or a second execution backend;
- reopening or rewriting accepted V0–V3.6 history.

## 8. Current control point

```yaml
charter_acceptance: accepted_by_final_capstone_handoff
goal_1_contract: closed_accepted
goal_1_source_readiness: passed
goal_1_working_session: completed
goal_2_detailed_contract: accepted_activated_zero_access
goal_3_detailed_contract: forbidden_until_goal_2_main_acceptance
real_access: not_authorized
next_action: main_creates_goal_2_control_baseline_then_starts_fresh_working_session
```
