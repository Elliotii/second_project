# G003 — Pi Direct AgentHarness Go Gate Retry

```yaml
goal_id: G003_PI_DIRECT_HARNESS_GO_GATE_RETRY
status: ready_to_start
owner: new_goal_session
reviewer: architecture_control_session
phase: Phase_2A_Deterministic_Integration_Spike
runtime_candidate: Direct_pi_agent_core_AgentHarness
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
project_commit_policy: require_clean_committed_HEAD_containing_G002_closeout_ADR_0002_and_this_contract
execution_platform: Windows_native_PowerShell
wsl_authorized: false
network_scope: npm_registry_only_for_locked_dependencies_and_exact_pi_ai_artifact
real_model_authorized: false
live_model_data_generation_authorized: false
custom_pi_build_boundary_authorized: false
reference_upstream_mutation_authorized: false
formal_workbench_authorized: false
git_commit_authorized_for_goal_session: false
```

## 1. Objective

Recover from G002's model-data setup blocker through the artifact-backed path
accepted in ADR-0002, then dynamically determine whether the pinned public
Direct `@earendil-works/pi-agent-core` `AgentHarness` can support the smallest
honest Completion Verification protocol on this Windows host:

```text
integrity-pinned release artifact supplies model-data bytes only
→ pinned source validates and emits its standard public packages
→ independent clean fixture
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

G003 retries the unchanged dynamic questions from G002. It does not evaluate
Policy effectiveness, call a real model, create the formal Workbench, validate
current provider catalogs, or authorize final Pi Go.

## 2. Why This Is a New Goal

G002 closed correctly as `BLOCKED_G002_SETUP` before Gates A-E because live
model-data hydration was outside its frozen command and provenance boundary.
The architecture review accepted that closeout and ADR-0002 authorized one
different setup input: the immutable npm artifact for
`@earendil-works/pi-ai@0.82.1`.

G003 does not rewrite G002's result. It adds the newly authorized setup step and
re-executes all five Gates under a new run root and new evidence package.

## 3. Activation Preconditions

This draft is not executable until architecture control:

1. reviews the complete contract;
2. changes its status to `ready_to_start`;
3. receives explicit user authorization for a project baseline commit;
4. commits the G002 report/closeout, G002 architecture review, ADR-0002, this
   contract, and the corresponding `CURRENT_STATE.md` update.

Before any setup, the G003 Goal Session must verify:

1. the root repository has a committed `HEAD`;
2. the root worktree is clean;
3. committed `HEAD` contains this contract with `status: ready_to_start`;
4. committed `HEAD` contains ADR-0002 and the accepted G002 architecture review;
5. the reference Pi checkout matches the pinned commit and is clean;
6. `.runs/g003` does not exist;
7. root `workbench/` does not exist;
8. Windows Node, npm and Git satisfy the recorded tool requirements.

Read the clean root `HEAD` with `git rev-parse HEAD` and record it as
`project_commit` in every manifest and report. Do not embed that hash into the
commit it identifies.

If any precondition fails, pause before network access, dependency install,
artifact download, tracked implementation edits, or generated workspace
creation.

## 4. Frozen Inputs

```yaml
reference_checkout: .upstream/pi
reference_remote: https://github.com/earendil-works/pi.git
reference_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
release_artifact_package: "@earendil-works/pi-ai@0.82.1"
release_artifact_registry: "https://registry.npmjs.org"
release_artifact_tarball_url: "https://registry.npmjs.org/@earendil-works/pi-ai/-/pi-ai-0.82.1.tgz"
release_artifact_integrity: "sha512-3WFYRhEp3lQB3444EhPMBcM7zSaEUE3eJgHOR7s4081NLqbw/FsWilIKWXSua0Gv3sRr7m9xMidR3pPDE7jI/A=="
release_artifact_shasum: "02ebdfc2997fd88ca1f51a7b5c01f337a9462f34"
release_artifact_git_head: b4f293684bba718d59cc1157679bcf6157b3a7f5
release_artifact_tag: v0.82.1
release_artifact_expected_data_files: 38
isolated_execution_root: .runs/g003
isolated_pi_clone: .runs/g003/pi
artifact_download_root: .runs/g003/source
artifact_staging_root: .runs/g003/staging
generated_evidence_root: .runs/g003/evidence
temporary_consumer_root: .runs/g003/consumer
baseline_workspace: .runs/g003/workspaces/baseline
candidate_workspace: .runs/g003/workspaces/candidate
tracked_spike_root: spikes/pi-runtime/g003
tracked_fixture_root: fixtures/tasks/g003-completion-recovery
```

Do not reuse `.runs/g002/pi`; preserve it as G002 evidence. The reference
`.upstream/pi` checkout remains immutable. Dependencies, tarballs, restored
model data, build output, consumer packages and run artifacts belong only under
`.runs/g003/`.

## 5. Required Read Order

Read completely before taking setup or implementation actions:

1. root `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. this Goal Contract;
4. `docs/decisions/ADR-0001-direct-agentharness-for-g002.md`;
5. `docs/decisions/ADR-0002-artifact-backed-model-data-for-g002-retry.md`;
6. `docs/reports/G002_ARCHITECTURE_REVIEW.md`;
7. `docs/reports/G002_PI_DIRECT_HARNESS_GO_GATE_REPORT.md`;
8. `docs/reports/G002_PI_DIRECT_HARNESS_GO_GATE_CLOSEOUT.md`;
9. `docs/reports/G001_PI_SOURCE_AUDIT_REPORT.md` and the G001 architecture
   review;
10. `docs/research/pi/open-questions.md`, especially Q1, Q2, Q4 and Q5;
11. relevant Phase 2, Completion Verification, fairness, run-semantics and Pi
    Go/No-Go sections of `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md`;
12. `.upstream/pi/AGENTS.md`;
13. after cloning, the isolated Pi `AGENTS.md` and every Pi source, test,
    package or build file used by the implementation, completely.

Local pinned source, exact artifact bytes, targeted tests and observed command
output remain authority.

## 6. Evidence Labels

Material conclusions and reports must label claims as:

- **Fact** — observed command output, verified artifact bytes, or pinned
  source/test evidence;
- **Inference** — reasoned consequence of Facts;
- **Recommendation** — project choice;
- **Unconfirmed** — not exercised by this gate.

Do not treat upstream tests as observed facts until the exact targeted command
passes in the isolated execution clone.

## 7. Authorized Setup

### 7.1 Windows-native execution

Use Windows PowerShell, Node `24.14.1`, `npm.cmd`, and Windows Git. Do not move
to WSL, Docker, a container or another shell. A Windows-specific
incompatibility is evidence requiring a pause, not permission to change
platforms.

### 7.2 Fresh isolated Pi clone

After reconfirming that `.runs/g003` is absent, create a local non-hardlinked
clone from the immutable reference and detach it at the pinned commit:

```powershell
git clone --local --no-hardlinks .upstream/pi .runs/g003/pi
git -C .runs/g003/pi checkout --detach 027a5847901b5dde30270abaa1041046cd2b4b55
```

Use command-local `safe.directory` declarations if Windows ownership requires
them; do not change global Git configuration. Verify exact `HEAD`, remote,
non-hardlinked object storage and empty tracked status before installing.

If `.runs/g003` exists, pause. Do not delete, overwrite, merge with or reuse it.

### 7.3 Locked dependency installation

Inside `.runs/g003/pi`, authorize only:

```powershell
npm.cmd ci --ignore-scripts
```

Dependency network access is limited to the lockfile's npm registry artifacts.
Do not run audit fixes, upgrades, install lifecycle scripts or broad package
commands. Record npm cache/registry behavior and the bounded vulnerability
summary without modifying dependencies.

### 7.4 Release-boundary compatibility check

Before downloading the model-data artifact, prove that the tracked boundary
which interprets the release data is unchanged between release `gitHead` and
the pinned test commit. The comparison must cover:

```text
packages/ai/package.json
packages/ai/scripts/check-model-data.ts
packages/ai/scripts/model-data.ts
packages/ai/src/models.generated.ts
packages/ai/src/providers/*.models.ts
packages/ai/src/providers/all.ts
```

The expected diff is empty. `packages/ai/scripts/generate-models.ts` is not part
of this compatibility assertion because it changed and is prohibited from
execution. If any listed file differs or the release commit cannot be verified,
pause.

### 7.5 Exact artifact acquisition

Query only the npm registry for the exact package version and record its
metadata. Require exact equality for package name, version, registry tarball
URL, `dist.integrity`, `dist.shasum` and `gitHead` against Section 4.

Download exactly one tarball into the previously absent
`.runs/g003/source/` with lifecycle scripts disabled. Intended command shape:

```powershell
npm.cmd pack @earendil-works/pi-ai@0.82.1 --ignore-scripts --pack-destination .runs/g003/source --registry=https://registry.npmjs.org
```

Do not install the artifact as code and do not execute any file from it.

### 7.6 Independent integrity and archive-safety verification

Before extraction:

1. require exactly one `.tgz` in the artifact download root;
2. compute SHA-512 and compare its bytes to the base64 payload in the recorded
   `dist.integrity` value;
3. compute SHA-1 and compare it to the recorded `dist.shasum`;
4. save the complete archive member inventory;
5. reject absolute paths, drive-qualified paths, backslashes, `..` traversal,
   links, devices or other non-regular entries in the selected data subtree;
6. require exactly 38 members under
   `package/dist/providers/data/`: `.manifest.json` plus 37 provider `.json`
   files;
7. reject any selected member with another extension or nested directory.

Do not extract if any check fails.

### 7.7 Staged data-only restore

Create a new staging directory and extract only:

```text
package/dist/providers/data/**
```

Require the target `.runs/g003/pi/packages/ai/src/providers/data/` to be
absent, then copy only the staged data directory into that target. Do not copy
published JavaScript, declarations, package metadata, source maps or any other
artifact content.

Record:

- registry metadata;
- tarball SHA-512 and SHA-1;
- full and selected archive inventories;
- embedded `.manifest.json` verbatim;
- sorted relative path, size and SHA-256 for every restored file;
- exact extraction and copy commands with exit codes.

These generated records stay under `.runs/g003/evidence/`; the G003 report
must reproduce the material identifiers and bounded results.

### 7.8 Pinned-source validation and standard targeted builds

Run the pinned source's validator before any build:

```powershell
npm.cmd run check:model-data --workspace=@earendil-works/pi-ai
```

Only on exit 0, run the same standard package builds in dependency order:

```powershell
npm.cmd run build:offline --workspace=@earendil-works/pi-ai
npm.cmd run build --workspace=@earendil-works/pi-agent-core
```

After each step verify that the isolated Pi clone has no tracked changes.
Ignored restored data and emitted `dist/` files are expected generated state.

Do not run the Pi root build, full check, full test suite, `build` for Pi AI,
`hydrate:model-data`, `generate-models`, Coding Agent/TUI builds or unrelated
workspace builds. If validation or either standard targeted build fails, pause
and report the exact boundary without substituting a partial build.

## 8. Fixed Deterministic Task

Create one minimal tracked fixture under
`fixtures/tasks/g003-completion-recovery/` with:

- one allowed output file;
- one exact deterministic assertion over that file;
- no network, Git mutation, package install or external service;
- a reset procedure that produces byte-equivalent Baseline and Candidate
  initial workspaces.

Use Pi's public local faux provider and public Direct harness surfaces. The
shared faux script must be identical for Baseline and Candidate:

1. initial tool call writes a deterministically incorrect value;
2. initial final assistant response settles the first external Agent Cycle;
3. recovery tool call writes the exact correct value;
4. recovery final assistant response settles the second external Agent Cycle.

Baseline stops after consuming steps 1-2 and leaves the recovery responses
unused. Candidate consumes steps 1-4 only after the external verifier failure
is submitted through exactly one new `harness.prompt()` call. Assert exact faux
provider call counts of two for Baseline and four for Candidate so hidden turns
cannot pass unnoticed.

The initial behavior, complete queued script, model, system prompt, tools and
options must be identical. The verifier is ordinary outer-driver code and must
never be registered as an Agent tool.

## 9. Required Gates

### Gate A — Public standard emitted-package import

From an isolated consumer under `.runs/g003/`, install or link only the two
locally built package roots in a way that uses their declared `package.json`
exports. Prove that these public imports resolve:

- `AgentHarness` and Session/repo types needed by the spike from
  `@earendil-works/pi-agent-core`;
- `NodeExecutionEnv` from `@earendil-works/pi-agent-core/node`.

Pass only if:

- runtime JavaScript and TypeScript declarations come from emitted `dist/`;
- no private `src/` path, TypeScript path alias or custom package export is
  used;
- the consumer does not fall back to the published agent package;
- exact consumer metadata, resolved package paths, commands, stdout/stderr and
  exit codes are recorded.

### Gate B — Baseline observation

On a fresh fixture copy:

1. construct Direct AgentHarness through the spike adapter;
2. run one initial external Agent Cycle;
3. wait for `await harness.prompt()` to return;
4. run the external verifier exactly once;
5. observe deterministic failure;
6. record the failure and stop without feedback or recovery.

Pass only if no verifier starts before prompt settlement, exactly two faux
provider calls occur, and no recovery prompt or additional provider turn
occurs after failed verification.

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

Pass only if exactly four total faux provider calls occur. Do not use
`followUp`, `steer`, an extra `appendMessage`, hidden SDK retry or another
recovery cycle.

### Gate D — Event/session/verifier order

Project a minimal external journal and automatically prove at least:

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
continuation_queued
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
Correlate stable run, session and tool-call IDs. Do not copy raw model content
or token deltas into the project journal.

### Gate E — Initial fairness manifest

Generate canonical Baseline and Candidate initial manifests containing at
least:

- project commit and Pi commit;
- model-data artifact version, integrity and restored-manifest hash;
- normalized fixture tree digest;
- model/provider/complete faux-script identity;
- thinking level;
- system-prompt digest;
- tool names, schemas and active set;
- stream/retry options;
- allowed environment-key names and relevant values/digests;
- verifier identity and assertion digest.

Pass only if normalized manifests differ solely in run identity, policy
variant and absolute disposable workspace path. Any other difference makes
both runs invalid evidence.

## 10. Tracked Deliverables

Create only the smallest coherent spike implementation under:

```text
spikes/pi-runtime/g003/
```

It must contain:

- a README with exact setup and execution commands;
- artifact provenance/inventory verification support used by the run;
- the Direct adapter and strictly sequential policy driver;
- deterministic verifier and minimal event projector;
- public emitted-import smoke consumer source;
- one or more narrowly targeted tests needed for Gates B-E;
- explicit timeout protection for every asynchronous Gate.

Also create:

1. `fixtures/tasks/g003-completion-recovery/`;
2. `docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_REPORT.md`;
3. `docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_CLOSEOUT.md`;
4. an accurate `CURRENT_STATE.md` update.

Generated dependencies, downloads, restored data, builds, consumers,
workspaces and run evidence stay under `.runs/g003/` and remain ignored.
Reports must preserve exact commands, exit codes, bounded relevant output and
hashes needed to reproduce conclusions.

Use the narrowest targeted test commands. Do not run a root or package-wide Pi
test suite. Every asynchronous Gate must have an explicit maximum duration;
timeout is a failed or blocked observation, never an invitation to wait
indefinitely.

## 11. Required Disposition

The report must return exactly one:

- `PASS_DIRECT_GO_GATE` — setup and every Gate A-E passed;
- `FAIL_DIRECT_GO_GATE` — setup reached the Direct runtime and established a
  precise capability failure in one or more Gates;
- `BLOCKED_G003_SETUP` — activation, provenance, restoration, validation,
  package build, permission or another precondition prevented a valid Direct
  test.

A failed or blocked result does not authorize SDK, RPC, WSL, a Pi core patch,
another runtime, live catalog generation, custom emitted packages, broader
build/test commands or implementation expansion.

## 12. Definition of Done

G003 is complete only when:

- activation preconditions and both committed source hashes are recorded;
- `.upstream/pi` is finally reconfirmed clean and unchanged;
- exact npm metadata, tarball hashes, safe inventory and restored file hashes
  are recorded;
- release-boundary compatibility and pinned-source model-data validation have
  explicit results;
- isolated setup and every executed command are recorded exactly;
- Gates A-E each have explicit pass/fail/blocked evidence;
- Baseline stops after its first failed verification;
- Candidate performs at most one recovery and at most two verifier runs;
- provider-call caps are automatically asserted;
- initial Baseline/Candidate manifests normalize equal;
- Pi Session and external journal are correlated and their ordering is
  asserted automatically;
- no real provider/model, live catalog generator, WSL, container, SDK,
  extension, RPC or custom Pi build path was used;
- tracked spike code passes only its narrow tests;
- all untested behavior is listed as **Unconfirmed**;
- the report and Goal Closeout exist;
- `CURRENT_STATE.md` reflects the disposition and next architecture review;
- no Git commit was created by the Goal Session.

The definition can be satisfied with a documented `PASS_DIRECT_GO_GATE`,
`FAIL_DIRECT_GO_GATE` or `BLOCKED_G003_SETUP`. The goal is to produce an honest
decision-quality observation, not force a passing result.

## 13. Explicitly Deferred

- current/live provider catalog correctness;
- settled-session reconstruction in a new process;
- Windows long-running shell cancellation characterization;
- crash after tool side effect but before result persistence;
- Coding Agent SDK/Inline Extension compatibility;
- RPC isolation;
- real-model feasibility;
- final Run/Event/Outcome schema;
- Policy effect evaluation;
- formal Workbench implementation.

## 14. Pause Conditions

Pause without expanding scope if:

- this contract is not committed with `status: ready_to_start` or the root has
  no clean committed `HEAD` to record as `project_commit`;
- root or reference upstream state differs from the activation snapshot;
- `.runs/g003` already exists;
- dependency installation would require lifecycle scripts or non-lockfile
  upgrades;
- release metadata, hashes, `gitHead`, inventory or archive safety differs
  from the frozen values;
- the release-boundary compatibility diff is non-empty;
- the model-data restore target already exists;
- pinned-source `check:model-data` rejects the restored data;
- targeted builds require a root/full build, live generator, source edit,
  custom package boundary or unrelated package build;
- public import requires private Pi paths or a Pi source change;
- a test requires credentials, network model calls or real provider state;
- Windows-native execution appears impossible;
- a result suggests SDK, RPC, WSL, container or core-patch adoption;
- a requested change would freeze user-owned Outcome, Failure Taxonomy,
  recovery budget, side-effect or promotion decisions.

## 15. New-Session Prompt

Use this only after the contract is committed as `ready_to_start` and
architecture control provides the clean baseline `HEAD`:

```text
/goal 执行 docs/goals/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY.md 的完整目标。先严格验证 committed contract 状态、干净项目 HEAD、固定 Pi commit、.runs/g003 不存在以及全部 Activation Preconditions。只使用 Windows 原生 PowerShell。创建全新的 .runs/g003/pi 非硬链接隔离副本；仅运行 npm.cmd ci --ignore-scripts。按照合同仅从 npm registry 下载固定 @earendil-works/pi-ai@0.82.1 制品，核验记录的 SHA-512、SHA-1、gitHead、38 文件清单和归档安全，只提取 dist/providers/data 到隔离副本；禁止运行 hydrate:model-data 或 generate-models。必须先通过 pinned-source check:model-data，再运行标准 pi-ai build:offline 与 pi-agent-core build。随后完成原 G002 的 Gates A-E、指定 Spike/Fixture/Report/Closeout 和 CURRENT_STATE 更新。不要修改 .upstream/pi，不调用真实模型，不创建 workbench，不使用 WSL/SDK/RPC/容器/自定义 Pi 构建，不运行广泛测试或构建，不提交 Git。任何前置、来源、校验或构建边界异常都按合同暂停并返回精确 disposition，不得静默扩权。
```
