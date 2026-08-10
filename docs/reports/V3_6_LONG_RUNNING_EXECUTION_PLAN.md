# V3.6 Long-Running Execution Plan

```yaml
status: activated_execution_plan
date: 2026-08-10
version: V3.6_Open_Interactive_Agent_Mode
version_owner: Main_Session
implementation_goals: 2
selected_backend: docker_engine_linux_container_via_docker_desktop_wsl2
historical_functional_control_baseline: 00d0524a80b9c30f5ec141b733fb757e7a5f59d4
identity_record_commit: 9943660ae603476a9187d6498c4b34ceacd2990b
real_product_journeys: 1
second_backend: forbidden
host_command_fallback: forbidden
pi_core_patch: forbidden
```

## 1. Version Question and completion claim

V3.6 must answer:

> Can the existing Workbench accept a free-text Coding Task for a registered local project, mint Host-owned immutable Authority, keep Project/State/Profile/Backend pinned across a persistent Session, execute registered project commands inside the single selected Docker backend, preserve truthful Trace/Evidence, form an immutable managed-workspace ChangeSet, and apply or discard it only through explicit user-approved Host handoff?

The final claim is product usability and boundary integrity. V3.6 does not claim Policy/Skill improvement, statistical effectiveness, arbitrary-project support, multi-tenant security or resistance to Docker/host-kernel vulnerabilities.

## 2. Ownership model

### Main Session

Main owns:

- Version Question, scope and Charter;
- Goal Contracts and exact baselines;
- creation of top-level Implementation/Audit/Execution Sessions;
- architecture and authority decisions;
- light review, correction routing and integration;
- control-state updates and Git commits;
- Goal acceptance, final claims and V3.6 Closeout.

### Goal Implementation Sessions

Each Goal uses a new top-level Codex task starting from an exact clean Control Baseline. It owns only:

- Contract-allowlisted source/tests/fixtures/reports;
- deterministic commands and raw evidence;
- a bounded implementation commit;
- Implementation Report and Closeout Draft.

It must not modify `CURRENT_STATE.md`, accept its Goal, expand scope, modify Pi, switch backend or create real-call authority.

### Correction and audit

- Ordinary defects return to the original Implementation Session as one bundled correction.
- Main rechecks only affected findings plus necessary regression.
- A fresh focused audit is created only when the frozen Candidate actually changes high-risk command-execution, Credential, Authority, safe-projection or Source-Apply boundaries.
- Audit is read-only and cannot repair, accept or commit source.

## 3. Phase and commit map

| Phase | Owner/session | Inputs | Outputs/evidence | Integration/commit | Stop condition |
| --- | --- | --- | --- | --- | --- |
| Phase 0 control closeout | Main | accepted Planning, Selection, Activation | this plan; accepted status in control records | docs/control Activation Commit | Git/Pi identity mismatch |
| Charter freeze | Main | Phase 0 commit | `V3_6_CHARTER.md`; Goal 1 Contract/Prompt | Goal 1 Control Baseline Commit | Charter contradicts accepted boundary |
| Goal 1 implementation | new top-level Implementation Session | exact Goal 1 baseline | source/tests/fixtures, report, closeout draft, bounded commit | Main `--ff-only` integration after review | Authority/Session redesign or Pi change needed |
| Goal 1 acceptance | Main | integrated candidate | focused test results, Source Delta, Goal 1 Closeout | Goal 1 Acceptance Commit | Exit Criteria incomplete |
| Docker Readiness | fresh bounded readiness task or Main-controlled operational Gate | accepted Docker selection; installed Docker | client/server/image/profile/mount/network/resource/timeout/cleanup evidence | Readiness/Goal 2 Control Baseline Commit | user install/license action or Docker hard stop |
| Goal 2 implementation | new top-level Implementation Session | audited readiness and exact Goal 2 baseline | Docker executor, ChangeSet/apply/UI, tests, report, bounded commit | Main `--ff-only` integration | second backend/fallback/authority change needed |
| Focused audit, if triggered | fresh top-level read-only Audit Session | frozen Goal 2 Candidate | focused report covering actual high-risk deltas | no source commit; findings return to Goal 2 Session | accepted core boundary cannot be preserved |
| Deterministic acceptance | Main | corrected Goal 2 Candidate | mechanism tests, browser review, regression, Execution Baseline | Execution Baseline Commit | containment/evidence/apply semantics invalid |
| Real product acceptance | fresh no-source-edit Execution Session | exact Execution Baseline | one two-Turn Journey, ignored raw evidence, execution report | Main records disposition; no source edits in Execution Session | budget, authority, containment or evidence hard stop |
| Final regression/docs | Main or bounded documentation task | accepted Goal 1/2 evidence | final tests, README/Architecture/Interview/Closeout | V3.6 Final Closeout Commit | claims exceed evidence |

Historical functional Control Baseline `00d0524…` is never redefined. Later commits are V3.6 Activation, Goal and Closeout identities layered on top of it.

## 4. Charter freeze

Main will create one `V3_6_CHARTER.md` that freezes:

- the Version Question above;
- exactly two Goals;
- Docker Engine Linux container through Docker Desktop WSL2 as the sole backend;
- one disposable container per registered command;
- `managed_session_copy` as the sole workspace strategy;
- `inspect_only` and Docker-backed `bounded_edit` capability profiles;
- Host-owned Project Registry, Authority, Credential, State, Verifier, Evidence and Source Apply;
- default interactive semantics: unverified, no formal Outcome, not comparison/adaptation/promotion eligible;
- one successful Apply per Session;
- one bounded two-Turn real Journey;
- all accepted non-goals and Hard Stops.

The Charter does not redesign historical schemas or create a generic Sandbox/Permission/Git platform.

## 5. Goal 1 — Open Authority and Pinned Session Control Plane

### Scope

- thin host-owned registered Project Profile Registry and safe projection;
- server-generated Session and Run identity;
- write-once interactive Run Authority before any Credential/provider access;
- project/profile/workspace/code/state/backend/provider-policy pinning;
- continue-pinned vs new-Session-with-current-State semantics;
- separate interactive evidence namespace and truthful unverified semantics;
- WebUI project selection, free-text task entry and risk/authority context;
- read-only managed Workspace tree/file preview;
- read-only Pi native Skill vs Harness Adaptation/binding visibility;
- deterministic/Faux new Session and second Turn;
- unchanged V3/V3.5/Post-V3.5 paths.

### Tests and evidence

At minimum:

1. browser can submit only `project_id`, mode, task text, optional title/session id;
2. host path/argv/env/Credential/Provider/budget/Verifier injection rejected;
3. Authority persisted before any external-dispatch seam;
4. same Session preserves code/state/profile/backend/provider-policy identities;
5. current Active State changes only affect a new Session;
6. free task is unverified and ineligible for comparison/adaptation/promotion;
7. inspect-only lacks write and command tools;
8. safe projections contain no host path/secret/authority material;
9. managed Workspace file preview is read-only and clearly not Source;
10. strict TypeScript plus affected V3.5/Post-V3.5 regressions pass.

Goal 1 uses zero Credential reads, external network, Provider/model calls and real calls.

## 6. Docker Readiness blocking Gate

Docker Desktop is currently absent. After Goal 1 acceptance, Main stops only for the user-required Docker Desktop installation and license acceptance if still missing. Once present, the Gate verifies without LLM/Credential use:

- Windows client and Linux server identity;
- WSL2 Linux backend;
- one immutable Node/Linux image digest and `--pull never` formal-run policy;
- `--network none`;
- read-only root, bounded tmpfs, non-root user, cap-drop-all, no-new-privileges;
- frozen CPU/memory/memory-swap/PID/wall/output limits;
- exactly one canonical link-free managed-workspace mount;
- absence of Source, `.git`, home, `.runs`, Credential, State, Verifier, Authority and Docker socket mounts;
- stdout/stderr/exit/timeout mapping;
- timeout terminates descendants through whole-container kill;
- cleanup removes the exact container and records terminal evidence;
- unavailable/drift/tamper fail closed;
- one representative registered project command runs with runtime network disabled.

Gate evidence is stored under ignored `.runs/v3-6/readiness/` with a tracked report. Failure caused by a normal argv/path/image fixture bug is corrected in scope. Inability to establish the frozen boundary is a Hard Stop; Host fallback is forbidden.

## 7. Goal 2 — Bounded Execution, Change Handoff and Product Acceptance

### Scope

- narrow Docker registered-command executor injected only into V3.6 `run_command`;
- backend/image/profile identity bound into Authority, Session and Run evidence;
- no direct host command fallback;
- managed Workspace initial/final inventory;
- immutable ChangeSet with write-once add/modify blobs;
- safe Files/Changes/Diff projection;
- Apply All, Discard and Export;
- host-only apply service with envelope/digest/ArtifactRef/blob/preimage/stale/protected/scope/reparse validation;
- truthful per-file journal and `partial_apply_error` recovery material;
- one successful Apply per Session, then New Session required;
- one registered representative project and one bounded real two-Turn Journey.

### Deterministic tests

At minimum:

1. backend unavailable/drift → fail closed, zero host fallback;
2. exact Docker argv/profile/evidence identity;
3. only managed copy mounted; sensitive roots unavailable;
4. no network and bounded resources;
5. descendant timeout and cleanup terminal evidence;
6. stdout/stderr/exit/timeout map to existing ToolResult/Trace;
7. unchanged preimage → Apply All bytes equal immutable blobs;
8. stale preimage → blocked, Source unchanged;
9. protected/out-of-scope/traversal/reparse → rejected;
10. tampered envelope/digest/ref/blob → rejected;
11. Discard → Source unchanged;
12. injected mid-apply failure → truthful partial journal and recovery material;
13. second successful Apply in one Session → rejected with New Session guidance;
14. safe UI explains workspace, unverified status, backend, Changes and terminal handoff result;
15. strict TypeScript and accepted V3/V3.5/Post-V3.5 regressions pass.

## 8. Bounded real product acceptance

The frozen Journey uses:

```yaml
project_count: 1
session_count: 1
turn_count: 2
model: deepseek-v4-flash
credential_reads_max: 2
provider_requests_max_per_turn: 16
tool_calls_max_per_turn: 24
tokens_max_per_turn: 131072
cost_usd_max_per_turn: 0.20
journey_provider_requests_max: 32
journey_tool_calls_max: 48
journey_tokens_max: 262144
journey_cost_usd_max: 0.40
retry: 0
fallback: 0
replacement: 0
extra_task_or_case: 0
```

Turn 1 performs a bounded code change and registered check. Turn 2 must depend on prior Session context and refine, explain or complete the same task. After settlement, the Session produces one immutable ChangeSet. The product acceptance chooses one explicit Apply All or Discard path frozen in the Goal 2 Contract; it does not hunt for a prettier result.

The fresh Execution Session may read Credential opaquely only after read-only preflight. It cannot edit source, fixture, Contract, Manifest, Authority, tests, backend policy or budget. After first provider dispatch, no runtime/evidence semantic edits are allowed and no rerun can hide a failure.

## 9. Final regression and product material

Main verifies:

- Goal 1 and Goal 2 focused tests;
- strict TypeScript;
- V3 State/Adaptation and V3.5 Session/Read Model/WebUI regressions;
- Post-V3.5 deterministic smoke regressions;
- loopback-only HTTP and safe projection;
- Pi checkout commit/status;
- tracked Source Delta and ignored Evidence Index;
- final Git clean state.

Then update only what is needed:

- `CURRENT_STATE.md` and `AGENTS.md`;
- V3.6 Charter and Goal Closeouts;
- Workbench/root README usage and limitations;
- Architecture/Interview material explaining Host-vs-container authority, pinned Session and Change Handoff;
- `V3_6_CLOSEOUT.md` with exact claims, evidence, limitations and commits.

## 10. Complexity and stop policy

The following are ordinary implementation work and do not stop autonomy: TypeScript, Node, fixture, path, Docker argv, HTTP, CSS/i18n, serialization, focused-test and bounded cleanup bugs.

Main pauses only when:

- user must install/accept Docker Desktop or another third-party action;
- a second backend, Host fallback, Pi change or runtime route switch is required;
- the accepted two-Goal scope or authority boundary must change;
- managed-copy, Session, State, Verifier, ChangeSet or Source Apply authority must be weakened/redesigned;
- Docker cannot prove mount/network/resource/descendant/cleanup boundaries;
- real acceptance needs more budget, retry, fallback, replacement or another task;
- accepted V3/V3.5 facts are materially false;
- truthful final claim cannot be supported.

No Phase completion by itself is a pause point. No ordinary bug creates a new Goal, Stage, R1/R2 or Amendment chain.
