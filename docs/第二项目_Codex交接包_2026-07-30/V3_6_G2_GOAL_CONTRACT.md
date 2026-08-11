# V3.6 Goal 2 Contract — Bounded Execution, Change Handoff and Product Acceptance

```yaml
status: accepted_activated_deterministic_accepted_real_execution_pending
goal_id: V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_PRODUCT_ACCEPTANCE
version_owner: Main_Session
implementation_owner: completed_top_level_session_019ff037-fe8d-7242-bbf4-0cf71a95929d
real_execution_owner: pending_fresh_top_level_no_source_edit_session
control_baseline: resulting_HEAD_of_this_revision
readiness_report: docs/reports/V3_6_DOCKER_READINESS_REPORT.md
implementation_real_model_calls_authorized: 0
implementation_credential_reads_authorized: 0
implementation_external_network_authorized: false
docker_project_commands_authorized: deterministic_goal_tests_only
implementation_commit_authorized: one_bounded_goal_branch_commit
corrected_implementation_commit: 5ec7d2b0e81e54e2c8a73200e39f45ba631b244f
focused_audit_disposition: PASS_V3_6_G2_FOCUSED_AUDIT
execution_baseline: resulting_HEAD_of_this_revision
pi_core_patch_authorized: false
second_backend_authorized: false
host_command_fallback_authorized: false
```

## 1. Objective

Complete the accepted V3.6 Version Question without reopening V0–V3.5:

> add one fail-closed Docker registered-command path to the Goal 1 Host-authorized persistent Session, derive one immutable ChangeSet from the managed Session copy, expose safe review, and allow only explicit Host-controlled Apply All, Discard or Export before one separately frozen real two-Turn product Journey.

Goal 2 is product closure, not a general sandbox, Git/merge platform, permission platform or Eval.

## 2. Starting authority and Gate A

The dedicated Implementation Session must start from the exact Control Baseline pinned in its launch Prompt and read, in order:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `V3_6_CHARTER.md`;
4. this Contract;
5. `V3_6_DOCKER_READINESS_REPORT.md`;
6. `V3_6_G1_CLOSEOUT.md` and Goal 1 implementation report;
7. accepted V3.6 Planning, Backend Selection and Long-running Plan;
8. relevant V3/V3.5/Post-V3.5 authority, artifact, workspace, session, tool and WebUI source/tests;
9. applicable pinned Pi instructions and public exports before making Pi claims.

Gate A records exact Git/tree/Pi identities, clean tracked state, Docker client/server/context, exact image availability by digest, the frozen Profile, zero Credential/network/provider/model counts, and zero readiness containers before implementation.

The Docker CLI is Host-only. On this host it is currently under `%LOCALAPPDATA%/Programs/DockerDesktop/resources/bin/docker.exe`; the implementation must support an explicit Host configuration/path without projecting it to Browser, model, Session-safe view or tracked evidence.

## 3. Frozen backend profile

Only this backend/profile is allowed:

```yaml
backend_kind: docker_engine_linux_container
host_frontend: docker_desktop_wsl2
platform: linux/amd64
image_reference: node@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03
network_mode: none
root_filesystem: read_only
tmpfs: /tmp:rw,noexec,nosuid,nodev,size=67108864
user: 65532:65532
cpus: 0.5
memory_bytes: 536870912
memory_swap_bytes: 536870912
pids_limit: 64
nofile: 1024:1024
cap_drop: ALL
no_new_privileges: true
pull_policy: never
wall_timeout_ms: 30000
combined_output_budget_bytes: 65536
workspace_mount_destination: /workspace
workspace_mount_count: 1
container_lifecycle: one_disposable_container_per_registered_command
```

No source mount, additional mount, published port, Docker socket, device, privileged mode, host namespace, network, image pull, Host-command fallback or alternate backend is permitted. Each exact command gets a new container; persistent Pi Session state remains on the Host and workspace continuity comes only from `managed_session_copy`.

## 4. Implementation scope

Implement only:

1. a thin V3.6 Docker executor for Host-minted registered command IDs and exact argv;
2. image/profile/runtime validation, timeout/kill/remove and immutable terminal evidence;
3. V3.6 bounded-edit Agent tools using the accepted managed copy; no direct Source tools;
4. backend/profile identity pinned into Session and Run Authority;
5. managed-workspace before/final inventory and immutable add/modify/delete ChangeSet blobs;
6. safe Files/Changes/Diff/backend/terminal projections;
7. server-side Apply All, Discard and Export using only a persisted ChangeSet digest;
8. whole-set preflight for envelope/digest/ArtifactRef/blob/preimage/stale/protected/scope/traversal/reparse/tamper checks;
9. truthful per-file Apply receipt, including `partial_apply_error` and bounded recovery material if a write fails after earlier writes;
10. exactly one successful Apply per Session, after which continuation requires a new Session;
11. additive bilingual WebUI explanation and explicit user action;
12. one dependency-free representative Node project fixture and deterministic tests;
13. implementation report, Closeout Draft and structured state-update proposal.

Prefer a new V3.6 adapter over rewriting shared accepted modules. A minimal optional executor-injection seam in the existing bounded tool profile is allowed only if its default behavior remains byte/behavior compatible and all affected historical tests pass; do not silently replace V0–V3.5 execution semantics.

## 5. Allowed paths

The Implementation Session may add or modify only:

- `workbench/src/contracts/v36*.ts`;
- `workbench/src/v36/**`;
- `workbench/src/execution/*v36*.ts`;
- `workbench/src/project/*v36*.ts`;
- `workbench/src/session/*v36*.ts`;
- `workbench/src/read-model/*v36*.ts`;
- `workbench/src/webui/*v36*.ts` and additive `workbench/src/webui/static/**`;
- `workbench/src/workspace/*v36*.ts`;
- `workbench/src/pi/tool-profile.ts` only for the optional default-preserving injection seam described above;
- `workbench/scripts/*v36*`;
- `workbench/tests/v36g2*.test.ts` and `workbench/fixtures/v36g2/**`;
- `workbench/package.json`, bounded test tsconfig and `workbench/README.md`;
- `docs/reports/V3_6_G2_IMPLEMENTATION_REPORT.md` and `V3_6_G2_CLOSEOUT_DRAFT.md`;
- ignored `.runs/v3-6/g2/**`.

It must not modify `CURRENT_STATE.md`, `AGENTS.md`, Charter, Contract, accepted Closeouts, Credential, tracked reference, Pi, real registered Source outside Goal-local ignored fixtures, or accepted State/Verifier/promotion authority.

## 6. Authority and Change Handoff invariants

- Browser/model may choose only a visible registered `command_id`; Host alone resolves executable/argv/profile/budget.
- Docker is spawned with `shell:false`; no model/browser shell, argv, env, path, image, mount or policy input crosses the boundary.
- Authority and backend profile digest exist before create/start; terminal evidence records create/start/output/inspect/timeout/kill/remove truthfully.
- ToolResult and Trace distinguish stdout, stderr, exit, timeout, truncation, cleanup and backend identity without exposing Host paths or Docker internals that carry authority.
- Interactive Runs remain unverified/ineligible unless the frozen representative verifier passes; no adaptation/promotion follows from open tasks.
- The only writable execution location is the managed Session copy. Agent, container and Browser never write registered Source.
- ChangeSet derives deterministically from authenticated initial/final inventories. Every after blob is write-once and content-addressed.
- Browser handoff input is exact-schema: Session ID, ChangeSet digest and one action. It contains no path, patch, replacement bytes or override.
- Apply revalidates all authority and all touched preimages before first Source mutation. Add requires absence; modify/delete require exact before digest.
- Protected, out-of-scope, traversal, reparse, stale, hardlink-substitution, envelope/ref/blob tamper and Session/apply-state drift fail closed.
- Multi-file mutation is not called atomic. If an I/O failure occurs after prior writes, receipt status is `partial_apply_error`, records exact per-file state and recovery bytes/refs, and never reports success.
- Discard is terminal for that ChangeSet and leaves Source unchanged. Export cannot mutate Source.
- A successful Apply is allowed once per Session; subsequent continuation/apply fails with New Session guidance.

## 7. Deterministic acceptance

At minimum prove:

1. backend missing, wrong context/version/profile/image or digest drift fails closed with zero Host fallback;
2. exact Docker argv/profile/Authority/evidence identity and `--pull never`;
3. only one canonical link-free managed copy is mounted and sensitive Host roots are absent;
4. network none, read-only root, tmpfs, non-root, capability, no-new-privileges and resource limits match;
5. stdout/stderr/exit/nonzero/truncation map correctly;
6. wall timeout kills parent/descendants, exact container is removed, cleanup evidence is terminal;
7. registered command ID cannot inject argv/shell/env/path/image/mount/network/budget;
8. settled workspace deterministically produces immutable add/modify/delete ChangeSet and safe Diff;
9. unchanged touched preimages apply exact after blobs;
10. stale/add-collision/protected/out-of-scope/traversal/reparse/hardlink/tamper cases reject before mutation;
11. Discard leaves Source byte-identical and Export is non-mutating;
12. injected mid-apply failure produces truthful partial journal/recovery material;
13. second Apply and continuation after successful Apply reject;
14. safe API/UI explains project, Session, authority, backend, unverified/verified state, files, Changes and handoff result;
15. Goal 1 plus affected V3/V3.5/Post-V3.5 regressions and strict TypeScript pass;
16. Pi remains pinned/clean and tracked source/evidence passes the existing secret scan.

The dedicated Session may run Docker tests but uses zero Credential, external provider/model, real-model or runtime network access. Container runtime network remains `none`.

## 8. Representative real Journey frozen input

Implementation creates one tracked dependency-free fixture template. The later Execution Session creates a fresh ignored registered Source from its exact digest; it does not use or mutate the project repository as Source.

```yaml
project_kind: dependency_free_node_duration_parser
writable_scope: src/parse-duration.js
protected_scope:
  - test/**
  - package.json
registered_command_id: test
registered_command: node --test
turn_count: 2
model: deepseek-v4-flash
handoff_action: apply_all_if_and_only_if_valid_nonempty_changeset_and_frozen_verifier_pass
retry: 0
fallback: 0
replacement: 0
extra_task_or_case: 0
```

Turn 1:

> Implement `parseDuration(input)` in `src/parse-duration.js`. It must parse non-negative integer values ending in `ms`, `s`, `m`, or `h` into milliseconds and throw `Error("invalid duration")` for malformed, signed, decimal, mixed-unit, unsafe-integer or overflow inputs. Modify only the implementation file and run the registered test command.

Turn 2, in the same persistent Session:

> Review the duration parser you just implemented for boundary cases, make only the smallest correction still needed, run the registered test command again, and briefly explain what you checked. Do not modify tests or package metadata.

The task, fixture digest, verifier/command, prompts, profile, budgets and Apply condition are frozen before first dispatch. No rerun may seek a prettier outcome.

## 9. Real Journey budget and separation

Real acceptance starts only after Main accepts deterministic Goal 2 evidence and creates an exact Execution Baseline. A fresh top-level no-source-edit Execution Session may then use:

```yaml
credential_reads_max: 2
provider_requests_max_per_turn: 16
tool_calls_max_per_turn: 24
tokens_max_per_turn: 131072
cost_usd_max_per_turn: 0.20
journey_provider_requests_max: 32
journey_tool_calls_max: 48
journey_tokens_max: 262144
journey_cost_usd_max: 0.40
```

The Execution Session may invoke the product's Host-controlled Apply path but may not directly edit Source, implementation, tests, fixture, Contract, Authority, backend policy or evidence. After first Provider dispatch, no runtime/evidence semantic edit is allowed.

## 10. Ownership, review and audit

The new top-level Implementation Session owns the bounded source/tests/raw evidence, one bounded commit, Implementation Report, Closeout Draft and state-update proposal, then stops.

Main owns review, ordinary bundled correction back to the same Session, integration, deterministic acceptance, Execution Baseline, real-session launch, final claims and control state. Independent audit is not automatic. Main creates one fresh focused read-only audit only if a concrete unresolved command-execution, safe-projection or Source-Apply risk remains after focused tests; the audit cannot repair or accept.

## 11. Hard stops

Stop for Main/user only if:

- a second backend, Host fallback, image change/pull during formal run, Pi change or runtime route switch is required;
- Browser/model/Agent must receive Host authority or registered Source write access;
- the single managed mount, network-none, resource, descendant or cleanup boundary cannot be preserved;
- Source Apply cannot validate full preflight or truthfully report partial failure;
- accepted Session/State/Verifier/Evidence/Authority semantics must be weakened;
- real acceptance needs more budget, retry, fallback, replacement or another task;
- the two-Goal V3.6 Version Question or claim must change.

Ordinary TypeScript, Docker argv, fixture, path, serialization, HTTP, UI, CSS/i18n and focused regression defects are normal implementation work.

## 12. Deliverables and stop point

- Contract-bounded source, fixture and tests;
- ignored `.runs/v3-6/g2/**` evidence and Evidence Index;
- `docs/reports/V3_6_G2_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_6_G2_CLOSEOUT_DRAFT.md`;
- exact commands/exit codes, Source Delta, secret scan and implementation commit/tree;
- structured `CURRENT_STATE_UPDATE_PROPOSAL` without changing control files.

After returning those materials, the Implementation Session stops for Main review. It does not execute the real Journey or accept Goal 2/V3.6.
