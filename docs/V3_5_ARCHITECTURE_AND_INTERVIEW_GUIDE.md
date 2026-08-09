# V3.5 Architecture, Demo and Interview Guide

## 1. One-sentence project description

> I built a reliability-first Adaptive Coding Agent Harness on public Pi that controls
> Workspaces, verifies outcomes from the environment, compares bounded recovery and
> Harness-State treatments, persists settled Sessions and State lineage, and exposes the
> resulting evidence through a safe local Workbench UI.

## 2. Current architecture

```text
Browser
  -> fixed 127.0.0.1 HTTP/static surface
  -> Goal3WorkbenchApplicationV35
  -> safe Read Model and schema-aware Inspectors
  -> PersistentSessionServiceV35 / Run / Verifier / State controllers
  -> public Direct Pi AgentHarness
  -> bounded Workspace and external environment Verifier
```

### Responsibility boundaries

| Layer | Owns | Does not own |
|---|---|---|
| Pi | public Agent loop, model/tool protocol, public Session persistence primitives | Workbench Outcome, experiment identity, external Verifier, State promotion |
| Workbench runtime | Workspace, Run/Attempt, budgets, Session↔Run linkage, Verifier handoff | model-defined success |
| Evidence/Inspector | immutable artifacts, digest and lineage recomputation, fail-closed validation | execution or mutation |
| Harness State | Candidate, version, decision, active pointer, rollback, selective binding | Verifier or hard-budget authority |
| Read Model | bounded safe projections and explicit unavailable fields | raw-evidence authority |
| WebUI/API | local Session operations and inspectability | arbitrary path, shell, Credential, Provider or State-file mutation |

## 3. Why Direct AgentHarness remains the runtime

The project uses Pi's public Direct `AgentHarness` path because it proved sufficient for
bounded Workspace control, Tool execution, public Session persistence and deterministic or
real Provider composition without Pi Core changes. The Workbench adds reliability,
experiment and evidence responsibilities outside Pi rather than forking the upstream.

Pi SDK and Extension mechanisms remain legitimate future compatibility/reuse candidates,
especially for packaged interactive Pi use, permissions, Worktree integration and
extension distribution. They are not needed to explain or operate the accepted V3.5
runtime and do not replace it by default.

## 4. Version progression

| Version | Engineering question | Accepted result |
|---|---|---|
| V0 | Can a real Coding Agent task be controlled, traced and externally verified? | minimal usable Workbench |
| V1 | How do Baseline, Skill-only and Runtime Control compare? | bounded descriptive evidence; no universal winner |
| V2 | Can a failed trajectory branch into bounded alternatives and select by environment facts? | mechanism demonstrated; real Negative incomplete |
| V3 | Can evidence become typed, validated and selectively bound Harness State? | Prompt/Skill State lifecycle and one real prompt path |
| V3.5 | Can the accepted system be persistent, inspectable and demonstrable? | persistent foundation, one valid Skill Pair, local inspectable UI |

## 5. Demo

From `workbench/`:

```powershell
npm run v35g3:demo
```

Open `http://127.0.0.1:43135` and show:

1. create and continue a deterministic/Faux persistent Session;
2. inspect Session↔Run and safe conversation/Tool history;
3. inspect the V2 recovery disposition;
4. inspect the frozen Goal 2.5 Base/Candidate Pair and explain that both passed while the
   Candidate used more tokens;
5. follow Evidence → Diagnosis → Lesson → Candidate → Validation → Decision → active State
   → selective binding;
6. inspect immutable State versions and rollback history;
7. point out that browser rollback mutation is deliberately deferred.

For exact routes, host-configured read-only evidence inputs and digest identities, see
`docs/reports/V3_5_G3_DEMO_GUIDE.md`.

## 6. Key evidence to know

- Pi commit: `027a5847901b5dde30270abaa1041046cd2b4b55`.
- Goal 3 implementation: `b5c34033a4ff64d2bacd01279823611193834920`.
- Goal 2.5 comparison digest:
  `243d1c476385333d297bff296b69d9dd5d7be87ea041b25c974cc5dc7a7d920f`.
- Goal 3 Main verification: strict TypeScript plus 37 passing focused/affected tests and a
  successful real browser walkthrough.
- Pi Core patch count: 0.

## 7. Interview explanation

### What I reused

- Pi public `AgentHarness`, Session and Provider/tool interfaces;
- mature Harness invariants from primary-source study and bounded reference research;
- standard Git/Workspace/environment verification mechanisms.

### What I built

- the Workbench Driver, Workspace and Run/Attempt contracts;
- external Verifier and fail-closed evidence/Inspector chain;
- bounded recovery branching and selector substrate;
- typed Harness-State Candidate, validation, decision, version, rollback and binding flow;
- persistent Session↔Run catalog and safe Read Model;
- the loopback-only API, WebUI and portable demo projection.

### A useful failure story

The first V3.5 Skill Pair was not hidden or relabeled when it failed to reach a valid
comparison. The Base exhausted its request budget after reaching correct Workspace bytes
but did not settle, so the Verifier and Candidate never ran. The follow-up diagnosis found
a concrete lifecycle/Tool-affordance mismatch. A bounded correction then produced one
valid Pair. Both arms passed, and the Skill used more tokens. This is evidence discipline,
not a claim that the treatment won.

### Why the project is more than a Skill generator

The adaptive object is typed Harness State. A proposed change can be a Prompt addendum or
an adaptive Skill, but the Harness—not the model—owns validation, promotion, active-State
publication, rollback and selective binding. The project therefore evolves bounded
Harness behavior while preserving environment and operator authority.

## 8. Claims and non-claims

Good claim:

> The system can derive bounded Harness-State candidates from accepted evidence, validate
> them symmetrically, persist decisions and selectively reuse accepted State, while a local
> UI explains the complete evidence lineage.

Do not claim:

- general Skill or Policy superiority;
- autonomous continual self-improvement;
- production crash durability or exactly-once Tool effects;
- a full IDE, distributed platform, Router, Curator or semantic Memory system;
- that the browser or model controls Verifier, promotion or State authority.

## 9. Reading path

1. `README.md`
2. `docs/reports/V3_5_CLOSEOUT.md`
3. `docs/reports/V3_5_G3_DEMO_GUIDE.md`
4. `workbench/src/webui/server-v35g3.ts`
5. `workbench/src/read-model/workbench-v35g3.ts`
6. `workbench/src/v35g25/inspect-v35g25.ts`
7. `workbench/src/session/persistent-session-v35.ts`
8. `workbench/src/state/store-v3.ts`
