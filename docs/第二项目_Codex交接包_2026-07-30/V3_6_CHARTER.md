# V3.6 Version Charter — Open Interactive Agent Mode

```yaml
status: accepted_activated
accepted_by_user: 2026-08-10
version_owner: Main_Session
activation_control_commit: 06a94d4ce8c0034487da83a421191d152585aea9
historical_functional_control_baseline: 00d0524a80b9c30f5ec141b733fb757e7a5f59d4
selected_execution_backend: docker_engine_linux_container_via_docker_desktop_wsl2
implementation_goals: 2
goal_1_status: closed_accepted
goal_1_disposition: PASS_V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE
goal_1_implementation_commit: 81bc7c8b5667efaa0c10df507a7a0d2a59827e1e
docker_readiness_status: closed_passed
docker_readiness_report: docs/reports/V3_6_DOCKER_READINESS_REPORT.md
goal_2_status: accepted_activated
goal_2_contract: docs/第二项目_Codex交接包_2026-07-30/V3_6_G2_GOAL_CONTRACT.md
pi_core_patch_authorized: false
second_backend_authorized: false
host_command_fallback_authorized: false
```

## 1. Version mission

V3.6 turns the accepted V3.5 Workbench into a bounded open interactive Coding Agent product surface. A user may select a registered local project, enter a free-text task, continue the same persistent Session, inspect what happened, review an immutable ChangeSet, and explicitly apply or discard it without giving the browser or Agent Host authority.

The Version Question is:

> Can the existing Workbench accept a free-text Coding Task for a registered local project, mint Host-owned immutable Authority, keep Project/State/Profile/Backend pinned across a persistent Session, execute registered project commands inside the single selected Docker backend, preserve truthful Trace/Evidence, form an immutable managed-workspace ChangeSet, and apply or discard it only through explicit user-approved Host handoff?

## 2. Accepted evidence baseline

V3.6 reuses rather than reopens these accepted facts:

- Direct public Pi `AgentHarness` remains the Runtime route; Pi is pinned at `027a5847901b5dde30270abaa1041046cd2b4b55`.
- V3 provides immutable typed Harness State, staging, validation, Promote/Reject/Rollback and selective binding.
- V3.5 provides Pi public Session persistence, `Session != Run`, cross-process continue, a safe Read Model, loopback Local API and inspectability-first WebUI.
- Post-V3.5 proves one bounded two-Turn real product path; it does not prove open task Authority or OS containment.
- The functional V3.6 Control Baseline remains `00d0524a80b9c30f5ec141b733fb757e7a5f59d4` / tree `be0ee4864250f7b29c803a9ba5c69f80be20668c`.

## 3. Product surface

The browser may submit only:

```text
project_id
requested_mode: inspect_only | bounded_edit
task_text
optional title
optional existing session_id
```

The Host owns and resolves paths, command descriptors, Provider/model policy, Credential references, budget, Verifier policy, backend identity and Source-apply authority. IDs for new Sessions and Runs are server-generated.

Interactive free-text Runs default to:

```yaml
verification_mode: unverified
formal_outcome: null
comparison_eligible: false
adaptation_eligible: false
promotion_eligible: false
```

These semantics may not be upgraded merely because a command succeeds or the model says the task is complete.

## 4. Architecture and ownership

```text
Browser
  -> loopback Thin Local API
  -> Host-owned Project Registry + Authority Minter
  -> pinned persistent Session + managed_session_copy
  -> Direct Pi AgentHarness
  -> file tools constrained to managed workspace
  -> registered run_command via the one Docker backend
  -> existing Trace / Evidence / Read Model
  -> immutable ChangeSet
  -> user review
  -> Host-controlled Apply or Discard
```

Host-owned immutable authority includes Project/Profile, Source snapshot, Session, Workspace, code, Harness State, capability, backend/image/policy, Provider/model policy, budget, evidence and Change Handoff identities. Neither Browser nor Agent may broaden them.

`managed_session_copy` is the only V3.6 workspace strategy. Source is never mounted in the execution container. A Session pins its code, State, Project Profile, capability and backend identities. Continuing a Session preserves them; using current Source or current Active State requires a new Session.

## 5. Goal decomposition

### Goal 1 — Open Authority and Pinned Session Control Plane

Goal 1 is zero-call and does not require Docker. It adds:

- a thin host-owned registered Project Profile Registry and safe projection;
- server-minted Session/Run identity and write-once Interactive Run Authority before any external-dispatch seam;
- Session pinning and new-Session-with-current-State semantics;
- separate interactive Evidence and truthful unverified semantics;
- `inspect_only` and planned `bounded_edit` capability projection without enabling Host commands;
- free-text task entry and safe Authority/risk context in the WebUI;
- read-only managed Workspace tree/file preview;
- read-only distinction between Pi native Skills and Harness Adaptations/bindings;
- deterministic/Faux new Session plus second Turn while retaining V3/V3.5 paths.

### Docker Readiness Gate

After Goal 1 acceptance, Docker Desktop installation and license acceptance remain user-owned prerequisites. Readiness must prove the selected Linux-container profile on this Windows/WSL2 machine, including immutable image identity, mount/network/resource/timeout/descendant/cleanup behavior, before Goal 2 execution starts. Docker absence pauses at this Gate; it does not justify a different architecture.

### Goal 2 — Bounded Execution, Change Handoff and Product Acceptance

Goal 2 adds:

- a narrow Docker registered-command executor used only by V3.6 `run_command`;
- fail-closed backend/image/profile binding and terminal evidence;
- immutable managed-workspace inventory and ChangeSet blobs;
- safe Files/Changes/Diff projections;
- Apply All, Discard and Export;
- host-only preimage/stale/protected/scope/reparse/tamper validation;
- truthful per-file journal and `partial_apply_error` recovery material;
- one successful Source Apply per Session, after which continuation requires a new Session;
- one representative project and one bounded real two-Turn product Journey.

No third Goal is permitted.

## 6. Docker execution boundary

Docker Engine Linux containers through Docker Desktop WSL2 are the sole execution backend. Each registered command gets one disposable container. The formal profile must use a pinned image digest, `--pull never`, `--network none`, a read-only root, bounded tmpfs, non-root user, dropped capabilities, `no-new-privileges`, frozen CPU/memory/swap/PID/wall/output limits and exactly one canonical link-free managed-workspace mount.

Source, `.git`, Host home, `.runs`, Credential, Harness State, Verifier, Authority roots and Docker socket must not be mounted. Timeout kills the whole container and descendants; cleanup records terminal evidence. Unavailable, drifted or tampered runtime state fails closed. There is no Host command fallback and no second backend.

## 7. Change Handoff

The only write-back flow is:

```text
managed workspace
  -> immutable ChangeSet envelope + write-once blobs
  -> safe user review
  -> Host-controlled Apply All or Discard
```

Apply validates envelope/digests/ArtifactRefs/blobs, Source preimages, writable/protected scope, traversal/reparse conditions and Session apply state. Stale, protected, out-of-scope or tampered input fails closed before mutation where possible. If an injected or real failure occurs after some files were written, the result is `partial_apply_error` with a truthful per-file journal and minimal recovery material; success must never be fabricated. Only one successful Apply is allowed per Session.

## 8. Validation and evidence

Mechanism evidence uses deterministic/Faux tests and ignored raw artifacts. Goal 1 proves Authority minting/persistence, pinning, safe projection, unverified semantics, inspect-only capability and two-Turn continuity. Goal 2 proves Docker containment, terminal evidence, ChangeSet integrity, Apply/Discard/tamper/stale/protected behavior and WebUI explanation.

A focused independent audit is not automatic. Main may create one only when a frozen candidate actually changes high-risk command-execution, Credential, Authority, safe-projection or Source-Apply boundaries and Main review cannot close the risk with focused tests.

## 9. Bounded real product acceptance

Only after deterministic acceptance and an exact Execution Baseline, a fresh no-source-edit Execution Session may perform one Journey:

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

Turn 2 must use prior Session context for the same task. The Goal 2 Contract freezes whether the resulting ChangeSet is applied or discarded; the result is not rerun to obtain a prettier outcome.

## 10. Definition of Done

V3.6 is complete only when:

1. Goal 1 and Goal 2 Exit Criteria pass from exact accepted baselines;
2. browser input cannot inject Host authority;
3. a persistent Session pins project/code/state/profile/backend/provider policy across Turns;
4. interactive Evidence remains truthful and unverified unless a registered frozen Verifier says otherwise;
5. project commands execute only in the selected bounded Docker profile with no Host fallback;
6. ChangeSet review and Host Apply/Discard preserve integrity and authority boundaries;
7. one real two-Turn Journey is completed or truthfully stopped by a frozen hard condition;
8. strict TypeScript, focused V3.6 tests and affected V3/V3.5/Post-V3.5 regressions pass;
9. Pi remains pinned and clean, secrets remain outside tracked evidence, and final Source Delta is explained;
10. README, Architecture/Interview material and `V3_6_CLOSEOUT.md` state exact claims and limitations.

## 11. Non-goals

V3.6 does not build arbitrary shell execution, dependency installation, arbitrary-project onboarding, multiple backends, Host fallback, an IDE/terminal/editor, Git/merge platform, Permission platform, Skill marketplace, Adaptation UI, automatic learning/publishing, Router/Experience/Memory platform, remote/multi-user service, production sandbox, Pi Core changes or SDK/Extension/RPC switching.

Pi Web and Claude Code are bounded UX/permission references only, not runtimes or feature-parity targets.

## 12. Hard stops

Main must return to the user only if:

- Docker Desktop installation/license or another user-owned third-party action is required;
- a second backend, Host fallback, Pi modification or runtime-route switch is required;
- the accepted two-Goal scope or Version Question must change;
- managed copy, Session/State/Verifier/Evidence/Authority or Source-Apply ownership must be weakened or redesigned;
- the selected Docker profile cannot prove its mount/network/resource/descendant/cleanup boundaries;
- real acceptance needs more budget, retry, fallback, replacement or another task;
- accepted V3/V3.5 facts are materially false; or
- the final truthful claim cannot be supported.

Compile, TypeScript, fixture, path, serialization, HTTP, UI, Docker argv and focused regression defects are ordinary implementation work.

## 13. Claims boundary

On successful closeout the project may claim a Pi-based local Workbench with Host-minted open-task authority, pinned persistent Sessions, bounded Docker command execution, inspectable Evidence and user-reviewed immutable Change Handoff. It may not claim arbitrary untrusted-code security, statistical task improvement, autonomous self-evolution, arbitrary-project compatibility, multi-tenant isolation or immunity to Docker/Host kernel vulnerabilities.
