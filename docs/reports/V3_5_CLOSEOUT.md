# V3.5 Closeout — Persistent & Inspectable Adaptive Harness Workbench

```yaml
status: closed_accepted
date: 2026-08-09
version: V3.5
disposition: PASS_V3_5_PERSISTENT_INSPECTABLE_ADAPTIVE_HARNESS_WORKBENCH_WITH_BOUNDED_SINGLE_CASE_SKILL_EVIDENCE
accepted_by_user: 2026-08-09
active_goal: null
goal_1: PASS_V3_5_G1_PERSISTENT_SESSION_RUN_FOUNDATION
goal_2: CLOSE_V3_5_G2_INCONCLUSIVE_BASE_REQUEST_BUDGET_STOP
goal_2_5: PASS_V3_5_G2_5_VALID_REAL_PAIR_NO_SKILL_ADVANTAGE_OBSERVED
goal_3: PASS_V3_5_G3_LOCAL_INSPECTABLE_WORKBENCH
goal_3_implementation_commit: b5c34033a4ff64d2bacd01279823611193834920
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_core_patches: 0
next_version_authorized: false
```

## 1. Version result

V3.5 is complete and accepted as a bounded productization version of the Adaptive Coding
Agent Harness. It turns the accepted V0–V3 mechanisms into a Workbench that can persist
settled Sessions, associate them with Runs and evidence, expose safe read projections and
demonstrate adaptation history through a local UI.

V3.5 does not reopen or replace V3. It preserves the accepted Direct Pi Runtime,
Verifier, promotion, active-State and selective-binding authorities.

## 2. Goal outcomes

### Goal 1 — Persistent Session & Run Foundation

Accepted as `PASS_V3_5_G1_PERSISTENT_SESSION_RUN_FOUNDATION`.

- Public Pi JSONL persistence supports settled deterministic/Faux Session reopen and
  continuation across processes.
- Session↔Run linkage and a bounded safe Read Model are explicit.
- Catalog data is navigation metadata, not execution authority.
- Path, link, corruption and identity variants fail closed.

This does not prove in-flight crash recovery, exactly-once Tool effects, real-model
cross-process continuation or multi-writer durability.

### Goal 2 and Goal 2.5 — Bounded real adaptive Skill evidence

The original Goal 2 remains closed as
`CLOSE_V3_5_G2_INCONCLUSIVE_BASE_REQUEST_BUDGET_STOP`. Its Base reached the reference
Workspace bytes but did not settle before the frozen request cap; no Verifier or Candidate
ran. That invalid Pair remains historical evidence and is not relabeled.

Goal 2.5 corrected the concrete termination/handoff affordance and produced one valid,
frozen Base/Candidate Pair. Both arms settled and passed the same external Verifier. The
Candidate consumed 770 more total tokens, so the accepted conclusion is limited to:

```text
one valid real adaptive-Skill comparison completed
!= Skill improved task success
!= Skill improved general efficiency
```

### Goal 3 — Adaptive Harness Workbench WebUI & Demo

Accepted as `PASS_V3_5_G3_LOCAL_INSPECTABLE_WORKBENCH`.

- A fail-closed Inspector and safe Read Model project existing evidence.
- A loopback-only local API and dependency-free WebUI expose Session, Run, comparison,
  adaptation and State-history views.
- Persistent Session create/open/continue uses the accepted Workbench service.
- The committed demo is sanitized and non-authoritative.
- Main completed a real browser walkthrough with no console errors.
- Browser State mutation remains intentionally absent.

## 3. Completed version loop

```text
Persistent Pi Session
  -> Session / Run / Trace / Verifier evidence
  -> safe schema-aware Read Model
  -> Base / Candidate and recovery comparison
  -> Diagnosis / Lesson / Candidate / decision / active State lineage
  -> selective-binding explanation
  -> local post-run inspection and reproducible demo
```

## 4. Real access and cost

Goal 1 and Goal 3 used zero Credential, external network, Provider/model and real-model
access.

The two bounded real experiments in the Goal 2 family recorded:

| Evidence path | Credential reads | Provider/model requests | Cost USD | Result |
|---|---:|---:|---:|---|
| Goal 2 original Pair | 1 | 16 | `0.000552272` | inconclusive Base budget stop |
| Goal 2.5 valid replacement Pair | 2 | 6 | `0.0002796752` | both arms passed |
| V3.5 total | 3 | 22 | `0.0008319472` | bounded evidence only |

All related execution authority is consumed. No further V3.5 real access is authorized.

## 5. Allowed Portfolio claims

The project may accurately state that it:

- uses public Direct Pi `AgentHarness` without Pi Core patches;
- persists and reopens settled Coding Agent Sessions and associates them with immutable
  Run/evidence identities;
- keeps raw evidence authority separate from safe presentation projections;
- compares bounded recovery and Harness-State treatments through external Verifiers;
- persists versioned Harness State with Promote/Reject/Rollback and selective binding;
- completed one valid real Base/Candidate adaptive-Skill Pair without hiding its negative
  efficiency result;
- exposes the evidence, decisions and adaptation lineage through a loopback-only local
  Workbench UI.

## 6. Mandatory limitations

The project must not claim:

- that adaptive Skill was superior in the Goal 2.5 Case;
- general, causal or statistical Skill improvement;
- real-model cross-process Session continuation;
- in-flight crash recovery or exactly-once Tool side effects;
- automatic continual self-evolution, semantic memory, Router or Curator capability;
- production-grade remote, multi-user or distributed security/durability;
- realtime streaming, a full IDE or Pi feature parity;
- browser-controlled State mutation.

## 7. Deferred product work

The following remain possible future inputs, not hidden V3.5 failures:

- real-model persistent Session continuation;
- automatic catalog reconciliation or rebuild;
- stronger crash-after-side-effect reconciliation;
- a guarded UI rollback action through the existing controller;
- realtime inspection only if a concrete use case requires it;
- later bounded comparison with official Pi SDK/Extension packaging where compatibility or
  interactive Pi use creates a concrete need.

No V4 or later version is authorized by this Closeout.

## 8. Final repository state

- V0, V1, V2, V3 and V3.5 are closed under their recorded dispositions.
- `active_goal: null`.
- Goal 3 implementation is `b5c34033a4ff64d2bacd01279823611193834920`.
- fixed Pi remains `027a5847901b5dde30270abaa1041046cd2b4b55` and clean.
- the resulting HEAD of the documentation revision is the V3.5 Closeout Commit.
