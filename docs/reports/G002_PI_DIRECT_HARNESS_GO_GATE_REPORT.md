# G002 Pi Direct AgentHarness Go Gate Report

```yaml
goal_id: G002_PI_DIRECT_HARNESS_GO_GATE
disposition: BLOCKED_G002_SETUP
project_commit: e991de16cf5d46b81ff26dd00ac0a1743cd826d9
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
execution_platform: Windows_native_PowerShell
completed_at: 2026-07-29
gates_executed: []
real_model_used: false
wsl_used: false
sdk_rpc_extension_used: false
upstream_reference_modified: false
git_commit_created: false
```

## Disposition

`BLOCKED_G002_SETUP`

**Fact.** All Activation Preconditions passed, the isolated dependency install
completed, and the first contract-authorized targeted build failed before
TypeScript emission because the pinned checkout contains no generated model-data
directory required by `@earendil-works/pi-ai`'s `build:offline` script.

**Fact.** The failed command explicitly requested the additional command
`npm run hydrate:model-data`. That command is outside G002's frozen command and
network boundary. The Goal Contract says to pause if the two targeted builds are
insufficient, so it was not run.

**Inference.** This result establishes a setup/build-boundary blocker. It does
not establish a Direct `AgentHarness` capability failure and therefore is not
`FAIL_DIRECT_GO_GATE`.

**Recommendation.** Architecture control should decide whether a later goal may
hydrate and provenance-pin Pi model data, or whether the emitted-package build
boundary should be revised. G002 does not choose either path.

## Activation Preconditions

| Check | Evidence | Result |
|---|---|---|
| Committed root `HEAD` | `git rev-parse HEAD` -> `e991de16cf5d46b81ff26dd00ac0a1743cd826d9` | Pass |
| Clean root worktree at goal start | `git status --porcelain=v1 --untracked-files=all` -> empty | Pass |
| Committed contract ready | `git show HEAD:docs/goals/G002_PI_DIRECT_HARNESS_GO_GATE.md` contains `status: ready_to_start` | Pass |
| Reference Pi commit | `027a5847901b5dde30270abaa1041046cd2b4b55` | Pass |
| Reference Pi clean | porcelain status -> empty | Pass |
| Fresh execution root | `.runs/g002` did not exist | Pass |
| Required host | Node `v24.14.1`; npm `11.11.0`; Git `2.53.0.windows.3` | Pass |
| Forbidden formal app | root `workbench/` absent | Pass |

**Fact.** The isolated non-hardlinked clone was detached at the same Pi commit
and had empty tracked status before dependency installation.

## Command Ledger

All commands ran in Windows PowerShell. The source/reference reads used
`Get-Content -LiteralPath <path> -Raw`; relevant plan headings were located with
`rg`, and all implementation-relevant Pi files listed below were read completely.

### Required reads (all exit 0)

```powershell
Get-Content -LiteralPath 'AGENTS.md' -Raw
Get-Content -LiteralPath 'CURRENT_STATE.md' -Raw
Get-Content -LiteralPath 'docs/goals/G002_PI_DIRECT_HARNESS_GO_GATE.md' -Raw
Get-Content -LiteralPath 'docs/decisions/ADR-0001-direct-agentharness-for-g002.md' -Raw
Get-Content -LiteralPath 'docs/reports/G001_ARCHITECTURE_REVIEW.md' -Raw
Get-Content -LiteralPath 'docs/reports/G001_PI_SOURCE_AUDIT_REPORT.md' -Raw
Get-Content -LiteralPath 'docs/research/pi/open-questions.md' -Raw
rg -n -A 45 -B 2 "^## Phase 2|^# 10\. Pi Go / No-Go|^# 4\. 第一条候选 Policy|^# 6\. 运行语义" -- 'SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md'
rg -n -A 25 -B 2 "^## 4\.5|^## 6\.3|^## 5\.3" -- 'SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md'
Get-Content -LiteralPath '.upstream/pi/AGENTS.md' -Raw
```

Pi package/source/test files read completely before setup or while diagnosing
the authorized build boundary:

```text
.upstream/pi/package.json
.upstream/pi/packages/ai/package.json
.upstream/pi/packages/agent/package.json
.upstream/pi/packages/ai/src/index.ts
.upstream/pi/packages/ai/src/models.ts
.upstream/pi/packages/ai/src/providers/faux.ts
.upstream/pi/packages/agent/src/index.ts
.upstream/pi/packages/agent/src/node.ts
.upstream/pi/packages/agent/src/types.ts
.upstream/pi/packages/agent/src/harness/types.ts
.upstream/pi/packages/agent/src/harness/agent-harness.ts
.upstream/pi/packages/agent/src/harness/env/nodejs.ts
.upstream/pi/packages/agent/src/harness/session/jsonl-repo.ts
.upstream/pi/packages/agent/src/harness/session/jsonl-storage.ts
.upstream/pi/packages/agent/src/harness/session/session.ts
.upstream/pi/packages/agent/test/harness/agent-harness.test.ts
.runs/g002/pi/packages/ai/scripts/check-model-data.ts
.runs/g002/pi/packages/ai/scripts/model-data.ts
```

### Activation and clone

```powershell
git rev-parse HEAD
# exit 0: e991de16cf5d46b81ff26dd00ac0a1743cd826d9

git status --porcelain=v1 --untracked-files=all
# exit 0: <empty>

git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C .upstream/pi rev-parse HEAD
# exit 0: 027a5847901b5dde30270abaa1041046cd2b4b55

git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C .upstream/pi status --porcelain=v1 --untracked-files=all
# exit 0: <empty>

git clone --local --no-hardlinks .upstream/pi .runs/g002/pi
# exit 128: Windows Git rejected the source Git directory as dubious ownership.
```

The failed clone left only the newly created empty `.runs/g002` directory. Its
resolved absolute path and emptiness were verified. That empty generated
directory was removed non-recursively, then the same local clone was retried
with command-local safe-directory declarations; no global Git configuration
was changed.

```powershell
git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi/.git clone --local --no-hardlinks .upstream/pi .runs/g002/pi
# exit 0: clone completed

Get-Content -LiteralPath '.runs/g002/pi/AGENTS.md' -Raw
# exit 0

git -C .runs/g002/pi checkout --detach 027a5847901b5dde30270abaa1041046cd2b4b55
# exit 0

git -C .runs/g002/pi rev-parse HEAD
# exit 0: 027a5847901b5dde30270abaa1041046cd2b4b55

git -C .runs/g002/pi status --porcelain=v1 --untracked-files=all
# exit 0: <empty>
```

### Dependency hydration

```powershell
npm.cmd ci --ignore-scripts
```

The first sandboxed attempt exited 1 because npm could not open its user cache:

```text
npm error code EPERM
npm error path C:\Users\HUAWEI\AppData\Local\npm-cache\_cacache\tmp\839a9370
```

The identical command was retried with the user-authorized cache/network
permission and exited 0:

```text
added 328 packages, and audited 342 packages in 5m
3 high severity vulnerabilities
```

No audit fix, upgrade, install script, or lifecycle script was run.

### Authorized targeted build

```powershell
npm.cmd run build:offline --workspace=@earendil-works/pi-ai
# exit 1
```

Bounded relevant output:

```text
> @earendil-works/pi-ai@0.82.1 build:offline
> npm run check:model-data && tsgo -p tsconfig.build.json && shx rm -rf dist/providers/data && shx cp -r src/providers/data dist/providers/data

amazon-bedrock.json is not valid JSON: ENOENT: no such file or directory, open 'D:\AI\AI_Projects\project2\.runs\g002\pi\packages\ai\src\providers\data\amazon-bedrock.json'

Model data is missing or stale. Run `npm run hydrate:model-data` from the repository root.
```

**Fact.** Both the isolated clone and immutable reference lack
`packages/ai/src/providers/data/`. `scripts/model-data.ts` function
`validateGeneratedModelData()` requires that directory, and
`scripts/check-model-data.ts` exits 1 when validation throws. Because the shell
chain stopped at `check:model-data`, `tsgo` and the copy steps did not run.

The second authorized build was consequently not run:

```powershell
npm.cmd run build --workspace=@earendil-works/pi-agent-core
# not run: dependency-order predecessor failed and the contract pause condition applied
```

## Gates A-E

| Gate | Result | Evidence |
|---|---|---|
| A - Public emitted-package import | Blocked / not executed | `pi-ai` emitted dependency could not be built within the authorized boundary. |
| B - Baseline observation | Blocked / not executed | Gate A/setup predecessor unavailable; no spike or provider call was permitted. |
| C - Candidate one-cycle recovery | Blocked / not executed | Same setup blocker; no recovery cycle ran. |
| D - Event/session/verifier order | Blocked / not executed | No Direct run existed to journal or correlate. |
| E - Initial fairness manifest | Blocked / not executed | No Baseline/Candidate workspaces or manifests were created after the pause condition. |

**Fact.** No Gate failed on Direct runtime behavior; all five remained
unexecuted because the emitted-package setup boundary was not reached.

## Deliverable Status

| Deliverable | Status |
|---|---|
| `spikes/pi-runtime/g002/` | Not created; setup pause occurred before implementation. |
| `fixtures/tasks/g002-completion-recovery/` | Not created; setup pause occurred before fixture reset/run. |
| Gate manifests and run artifacts | Not created. |
| This report | Created. |
| G002 closeout | Created. |
| `CURRENT_STATE.md` | Updated to blocked/architecture review required. |

This absence is not a silent scope reduction: the Goal Contract explicitly
requires a pause rather than an extra hydration/build command when its two
authorized package builds are insufficient.

## Final Integrity Checks

**Fact.** After the build failure:

- `.upstream/pi` remained at `027a5847901b5dde30270abaa1041046cd2b4b55`;
- `.upstream/pi` porcelain status remained empty;
- the isolated clone remained at the same commit with no tracked changes;
- root `workbench/` remained absent;
- no Git commit was created by G002.

## Unconfirmed

- Public emitted-package import for AgentHarness and NodeExecutionEnv.
- Direct Baseline settlement and one-cycle Candidate recovery.
- Provider-call limits and absence of hidden retries in the dynamic protocol.
- Pi Session/external-journal/verifier ordering and stable ID correlation.
- Baseline/Candidate normalized initial-manifest equality.
- Every behavior listed as explicitly deferred by the Goal Contract.

## Required Review Decision

Architecture control must decide whether to authorize a new bounded setup that
adds reviewed model-data hydration/provenance or to choose another emitted-build
boundary. G002 does not authorize or recommend SDK, RPC, WSL, containers, a Pi
core patch, another runtime, a real model, or a formal Workbench.
