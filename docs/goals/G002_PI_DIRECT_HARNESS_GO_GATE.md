# G002 — Pi Direct AgentHarness Minimal Dynamic Go Gate

```yaml
goal_id: G002_PI_DIRECT_HARNESS_GO_GATE
status: ready_to_start
owner: new_goal_session
reviewer: architecture_control_session
phase: Phase_2A_Deterministic_Integration_Spike
runtime_candidate: Direct_pi_agent_core_AgentHarness
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
project_commit_policy: record_clean_root_HEAD_at_goal_start
execution_platform: Windows_native_PowerShell
wsl_authorized: false
network_scope: dependency_hydration_only
real_model_authorized: false
reference_upstream_mutation_authorized: false
formal_workbench_authorized: false
git_commit_authorized_for_goal_session: false
```

## 1. Objective

Dynamically determine whether the pinned public Direct
`@earendil-works/pi-agent-core` `AgentHarness` can support the smallest honest
Completion Verification protocol on this Windows host:

```text
independent clean fixture
→ scripted local faux provider performs initial task cycle
→ outer driver waits for Direct prompt settlement
→ external deterministic verifier observes failure
→ Baseline records failure and stops
→ Candidate submits exactly one structured recovery prompt
→ same AgentHarness and Session perform one recovery cycle
→ outer driver waits again
→ same verifier observes success
→ event/session/run evidence remains correlated and explainable
```

This goal answers a runtime feasibility question. It does not evaluate Policy
effectiveness, call a real model, create the formal Workbench, or authorize
final Pi Go.

## 2. Activation Preconditions

The user explicitly authorized creation of the initial project Git commit on
2026-07-29. This contract is activated as part of that baseline commit.

Before setup, the G002 Goal Session must verify:

1. the root repository has a committed `HEAD`;
2. the root worktree is clean at Goal start;
3. the committed G002 contract status is `ready_to_start`;
4. the reference Pi checkout matches the pinned commit and is clean.

The G002 Goal Session must read that clean root `HEAD` with
`git rev-parse HEAD` at startup and record it as `project_commit` in every
manifest and report. The hash is intentionally not embedded into the commit
that it identifies, which would create an impossible self-reference.

If a new Goal Session sees any precondition unsatisfied, it must pause without
installing dependencies or creating generated workspaces.

## 3. Frozen Inputs

```yaml
reference_checkout: .upstream/pi
reference_remote: https://github.com/earendil-works/pi.git
reference_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
isolated_execution_root: .runs/g002
isolated_pi_clone: .runs/g002/pi
tracked_spike_root: spikes/pi-runtime/g002
tracked_fixture_root: fixtures/tasks/g002-completion-recovery
```

The reference `.upstream/pi` checkout remains immutable. Dependency
installation, generated build output and temporary consumer packages belong
only under `.runs/g002/`.

## 4. Required Read Order

Read completely before taking setup or implementation actions:

1. root `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. this Goal Contract;
4. `docs/decisions/ADR-0001-direct-agentharness-for-g002.md`;
5. `docs/reports/G001_ARCHITECTURE_REVIEW.md`;
6. `docs/reports/G001_PI_SOURCE_AUDIT_REPORT.md`;
7. `docs/research/pi/open-questions.md`, especially Q1, Q2, Q4 and Q5;
8. relevant Phase 2, Completion Verification, run-semantics and Pi Go/No-Go
   sections of `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md`;
9. `.upstream/pi/AGENTS.md`;
10. every Pi source/test/package file used by the implementation, completely.

Local pinned source and observed targeted commands remain authority.

## 5. Evidence Labels

Material conclusions and reports must label claims as:

- **Fact** — observed command output or pinned source/test evidence;
- **Inference** — reasoned consequence of Facts;
- **Recommendation** — project choice;
- **Unconfirmed** — not exercised by this gate.

Do not convert existing upstream tests into observed facts until the targeted
test command actually passes in the isolated execution clone.

## 6. Authorized Setup

### 6.1 Windows-native execution

Use Windows PowerShell, local Node `24.14.1`, `npm.cmd`, and Windows Git. Do not
move the spike to WSL, Docker, a container or another shell environment. If a
Windows-specific incompatibility is observed, report it as evidence and pause;
do not change platforms silently.

### 6.2 Isolated Pi clone

After reconfirming that `.runs/g002` does not already exist, create a local
non-hardlinked clone from the immutable reference checkout and detach it at the
pinned commit. The intended command shape is:

```powershell
git clone --local --no-hardlinks .upstream/pi .runs/g002/pi
git -C .runs/g002/pi checkout --detach 027a5847901b5dde30270abaa1041046cd2b4b55
```

If `.runs/g002` already exists, pause for review; do not delete or overwrite it.

Read the cloned Pi `AGENTS.md` before operating inside the clone. Verify the
clone commit and clean tracked status before dependency installation.

### 6.3 Dependency hydration and targeted build

This goal authorizes network dependency hydration only inside
`.runs/g002/pi` with lifecycle scripts disabled:

```powershell
npm.cmd ci --ignore-scripts
```

It also authorizes only the narrow package builds required for the public
Direct import check, in dependency order:

```powershell
npm.cmd run build:offline --workspace=@earendil-works/pi-ai
npm.cmd run build --workspace=@earendil-works/pi-agent-core
```

Do not run the root build, full check, full test suite, lifecycle scripts, or
Coding Agent/TUI builds. If these two package builds are insufficient, pause
and report the missing boundary instead of broadening commands.

## 7. Fixed Deterministic Task

Create one minimal tracked fixture under
`fixtures/tasks/g002-completion-recovery/` with:

- one allowed output file;
- one exact deterministic assertion over that file;
- no network, Git mutation, package install or external service;
- a reset procedure that produces byte-equivalent Baseline and Candidate
  initial workspaces.

Use the Pi faux provider or an equivalent upstream local scripted provider.
The scripted initial behavior must be byte/semantically identical for Baseline
and Candidate and must create a verifier failure through an observable file
tool action. Candidate recovery must receive a structured deterministic failure
message and correct the file through exactly one external recovery Agent Cycle.

The verifier is ordinary spike-driver code and must never be registered as an
Agent tool.

## 8. Required Gates

### Gate A — Public emitted-package import

From an isolated temporary consumer under `.runs/g002/`, prove that the built
package's declared public imports resolve:

- `AgentHarness`, Session/repo types needed by the spike from
  `@earendil-works/pi-agent-core`;
- `NodeExecutionEnv` from `@earendil-works/pi-agent-core/node`.

Pass only if no private `src/` import or project alias is required. Record the
exact consumer setup, command, stdout/stderr and exit code.

### Gate B — Baseline observation

On a fresh fixture copy:

1. construct Direct AgentHarness through the spike adapter;
2. run one initial external Agent Cycle;
3. wait for `await harness.prompt()` to return;
4. run the external verifier exactly once;
5. observe deterministic failure;
6. record the failure and stop without feedback or recovery.

Pass only if no verifier starts before prompt settlement and no recovery prompt
or extra provider turn occurs after the failed verification.

### Gate C — Candidate one-cycle recovery

On an independently reset byte-equivalent fixture:

1. reproduce the same initial Agent behavior and initial verifier failure;
2. submit exactly one structured verifier-failure message as the next
   `harness.prompt()` input;
3. reuse the same Harness, Session ID, session branch and `run_id` link;
4. allow exactly one recovery Agent Cycle;
5. wait for the second prompt to settle;
6. run the same verifier exactly once more and observe success;
7. stop regardless of final result.

Do not use `followUp`, `steer`, an extra `appendMessage`, hidden SDK retry, or
additional recovery cycles.

### Gate D — Event/session/verifier order

Project a minimal external journal and prove at least:

```text
run_started
session_linked
agent_cycle_started(initial)
tool_execution_start
tool_execution_end
agent_settled
verifier_started
verifier_completed(failed)
policy_decision
[candidate only]
agent_cycle_started(verification_recovery)
tool_execution_start
tool_execution_end
agent_settled
verifier_started
verifier_completed(passed)
run_completed
```

The corresponding Pi Session order must contain the expected user, assistant
tool-use, tool-result and final-assistant messages for each external cycle.
Correlate stable run, session and tool-call IDs. Do not copy raw token deltas
into the project journal.

### Gate E — Initial fairness manifest

Generate canonical Baseline and Candidate initial manifests containing at
least:

- project commit and Pi commit;
- normalized fixture tree digest;
- model/provider/faux-script identity;
- thinking level;
- system-prompt digest;
- tool names, schemas and active set;
- stream/retry options;
- allowed environment-key names and relevant values/digests;
- verifier identity and assertion digest.

Pass only if normalized manifests differ solely in run identity, policy variant
and absolute disposable workspace path. Any other difference makes both runs
invalid evidence.

## 9. Tracked Deliverables

Create only the smallest coherent spike implementation under:

```text
spikes/pi-runtime/g002/
```

It must contain:

- a README with exact setup and execution commands;
- the Direct adapter and sequential policy driver;
- deterministic verifier and minimal event projector;
- public-import smoke consumer/script source;
- one or more narrowly targeted tests needed for Gates B-E;
- explicit timeout protection for every asynchronous gate.

Also create:

1. `fixtures/tasks/g002-completion-recovery/`;
2. `docs/reports/G002_PI_DIRECT_HARNESS_GO_GATE_REPORT.md`;
3. `docs/reports/G002_PI_DIRECT_HARNESS_GO_GATE_CLOSEOUT.md`;
4. an accurate `CURRENT_STATE.md` update.

Generated dependency/build/run artifacts stay under `.runs/g002/` and remain
ignored. Reports must preserve exact commands, exit codes, bounded relevant
output and hashes needed to reproduce conclusions.

## 10. Required Disposition

The report must return exactly one:

- `PASS_DIRECT_GO_GATE` — every Gate A-E passed;
- `FAIL_DIRECT_GO_GATE` — setup ran far enough to establish a precise Direct
  capability failure;
- `BLOCKED_G002_SETUP` — permissions, dependency/build boundary or another
  precondition prevented a valid test.

A failed or blocked gate does not authorize SDK, RPC, WSL, a Pi core patch,
another runtime, broader build/test commands or implementation expansion.

## 11. Definition of Done

G002 is complete only when:

- activation preconditions and both pinned commits are recorded;
- reference `.upstream/pi` is finally reconfirmed clean and unchanged;
- isolated setup and every executed command are recorded exactly;
- Gates A-E each have explicit pass/fail evidence;
- Baseline stops after its first failed verification;
- Candidate performs at most one recovery and at most two verifier runs;
- the initial Baseline/Candidate environment manifests normalize equal;
- the session and external journal are correlated and their ordering is
  asserted automatically;
- no real provider/model, WSL, container, SDK, extension or RPC path was used;
- tracked spike code passes its narrow tests;
- all untested behavior is listed as Unconfirmed;
- the report and Goal Closeout exist;
- `CURRENT_STATE.md` reflects the disposition and next architecture review;
- no Git commit was created by the Goal Session.

This definition can be satisfied with a documented `FAIL_DIRECT_GO_GATE` or
`BLOCKED_G002_SETUP`; the goal is to determine the gate honestly, not force a
passing result.

## 12. Explicitly Deferred

- settled-session reconstruction in a new process;
- Windows long-running shell cancellation characterization;
- crash after tool side effect but before result persistence;
- Coding Agent SDK/Inline Extension compatibility;
- RPC isolation;
- real-model feasibility;
- final Run/Event/Outcome schema;
- policy effect evaluation;
- formal Workbench implementation.

## 13. Pause Conditions

Pause without expanding scope if:

- this contract is not marked `ready_to_start`, or the root repository has no
  clean committed `HEAD` to record as `project_commit`;
- root or reference upstream state does not match the activation snapshot;
- `.runs/g002` already exists;
- dependency hydration would require lifecycle scripts;
- public import requires private Pi paths or a Pi source change;
- targeted builds require a root/full build or unrelated package builds;
- a test would require credentials, network model calls or real provider state;
- Windows-native execution appears impossible;
- a failure suggests SDK, RPC, WSL, container or core-patch adoption;
- a requested change would freeze user-owned Outcome, Failure Taxonomy,
  recovery budget, side-effect or promotion decisions.

## 14. New-Session Prompt

Use this prompt only after the architecture/control session communicates the
verified clean baseline `HEAD`:

```text
/goal 执行 docs/goals/G002_PI_DIRECT_HARNESS_GO_GATE.md 的完整目标。先验证合同状态、项目 commit、固定 Pi commit、干净工作树和所有 Activation Preconditions。只在 .runs/g002/pi 隔离副本内使用 npm.cmd ci --ignore-scripts，并且只运行合同授权的 pi-ai 与 pi-agent-core 定向构建；允许为这些依赖下载申请网络权限。使用 Windows 原生 PowerShell，不使用 WSL。完成 Gates A-E、全部指定 Spike/Fixture/Report/Closeout 交付物并更新 CURRENT_STATE.md。不修改 .upstream/pi、不调用真实模型、不创建 workbench、不使用 SDK/RPC、不运行广泛测试或构建、不提交 Git。失败时返回合同规定的精确 disposition，不得静默切换架构。
```
