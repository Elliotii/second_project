# V3 Closeout — Harness State Adaptation

```yaml
status: closed_accepted
date: 2026-08-08
version: V3
disposition: PASS_V3_HARNESS_STATE_ADAPTATION_WITH_SINGLE_REAL_PROMPT_PATH_LIMITATION
accepted_by_user: 2026-08-08
active_goal: null
goal_1: PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE
goal_2: PASS_V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK
goal_3: PASS_V3_G3_SELECTIVE_REUSE_AND_BOUNDED_REAL_CLOSURE
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_core_patches: 0
V4_authorized: false
```

## 1. Version result

V3 is complete and accepted as a bounded Harness State Adaptation version. It
closes the intended engineering loop:

```text
Trace / Verifier / A-B evidence
  -> typed Improvement Opportunity
  -> Diagnosis / Lesson
  -> bounded model-proposed RefinementCandidate
  -> staged prompt_addendum or adaptive_skill State
  -> symmetric Base/Candidate validation
  -> deterministic Promote / Reject
  -> immutable version and active pointer
  -> deterministic selective binding in a subsequent Run
  -> external Verifier and independent Inspector
```

V3 changes the project from a Workbench that only measures and recovers into an
Adaptive Coding Agent Harness that can propose, validate, persist, selectively
reuse and roll back bounded Harness State without giving the model authority over
Verifier, Promotion, hard constraints or State publication.

## 2. Goal outcomes

### Goal 1 — Evidence to Candidate State

Accepted as `PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE`.

- Three Trigger families project from closed valid evidence.
- Diagnosis, Lesson and Candidate retain immutable evidence provenance.
- Deterministic and bounded model-backed producers are supported.
- Both `prompt_addendum` and `adaptive_skill` adapters stage and fail closed.
- One `deepseek-v4-flash` proposal produced a host-validated prompt Candidate;
  the model had proposal authority only.

### Goal 2 — Validate, Promote, Reject and Roll Back

Accepted as `PASS_V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK`.

- Base/Candidate validation is symmetric and State-only.
- The Harness owns decision rules and external checks.
- Promote, Reject, immutable versions/decisions, stale compare-and-swap,
  fail-closed reopen, atomic active pointer and rollback are demonstrated.
- No real access or Pi change was used for this lifecycle proof.

### Goal 3 — Selective Reuse and Real Closure

Accepted as `PASS_V3_G3_SELECTIVE_REUSE_AND_BOUNDED_REAL_CLOSURE`.

- Active State persists and reopens across independent Runs.
- Applicability binds relevant State and leaves unrelated tasks unbound.
- Run-start binding freezes Candidate/Admission/Decision/Version identities.
- Four focused Cases cover all Trigger families, both State paths, regression,
  Reject, rollback and irrelevant non-binding.
- One real prompt-addendum-first Direct Pi task changed the external Verifier
  from valid failure to valid pass and passed Inspector within budget.

## 3. V3 Definition of Done

All 20 accepted Charter items are closed:

- DoD 1–19 are supported by source, deterministic tests, stored State, real Run
  evidence, Verifier output and Inspector recomputation;
- DoD 20 is satisfied by Main review and the user's explicit limited acceptance.

The second external-real-model State path was explicitly a soft target. Its
absence does not block V3, but remains part of the version name and claims
limitation.

## 4. Real access and cost

Across V3:

| Purpose | Credential reads | Provider/model requests | Cost USD |
|---|---:|---:|---:|
| Goal 1 bounded Candidate proposal | 1 | 1 | `0.0002016` |
| Goal 3 bounded prompt-addendum Agent Run | 1 | 6 | `0.0007371112` |
| Total | 2 | 7 | `0.0009387112` |

All real authorities are consumed. No further V3 call is authorized.

## 5. Allowed Portfolio claims

The project may accurately state that it:

- builds on public Direct Pi `AgentHarness` without Pi Core patches;
- derives typed improvement Candidates from environment/Trace evidence;
- separates model proposal authority from Harness validation/publication;
- validates prompt and Skill State against the same external authority before
  deterministic Promote/Reject;
- persists immutable State versions, protects stale updates and supports
  rollback;
- selectively binds applicable promoted State into a subsequent Run;
- completed one bounded real prompt-addendum coding repair with an
  Inspector-valid evidence chain.

## 6. Mandatory limitations

The project must not claim:

- causal benefit from the one real prompt-addendum Run;
- general or statistical superiority;
- external-real-model adaptive-Skill validation;
- universal autonomous self-evolution;
- a Router, Curator, Memory/Runtime Policy platform or automatic publishing;
- production-grade crash durability, multi-writer consistency or OS sandbox;
- separate-worktree isolation for the Goal 3 real Run.

The real Session used `InMemorySessionStorage`; the persisted evidence contains
Session ID and runtime/Tool counters rather than a complete replayable Pi Session
transcript. This does not change accepted V3 State-lifecycle evidence.

## 7. Future work retained after closeout

Future planning may consider, when a concrete use case requires it:

- complete Pi Session and Tool-event persistence for real adaptive Runs;
- one-command derivation of failure lineage from Verifier Artifacts;
- stronger privacy-preserving real-payload binding proof;
- durable or concurrent State-store semantics;
- a separately authorized real adaptive-Skill task;
- the previously planned V4 questions around experience-guided routing and
  retirement, only after a new bounded design review.

These are backlog inputs, not hidden V3 failures and not V4 authorization.

## 8. Final repository state

- V0, V1, V2 and V3 are closed under their recorded accepted dispositions.
- `active_goal: null`.
- fixed Pi remains `027a5847901b5dde30270abaa1041046cd2b4b55` and clean.
- V3 Goal 3 Implementation Baseline is
  `74e7e73a07321f191d1b266ab8dd3cb94f66cade`.
- this closeout revision's resulting HEAD is the V3 Closeout Commit.
- V4 is not authorized.
