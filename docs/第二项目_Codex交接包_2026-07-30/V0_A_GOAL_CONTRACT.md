# V0-A Goal Contract — Contracts, Preflight, Workspace and Pi Adapter

```yaml
goal_id: V0_A_CONTRACTS_PREFLIGHT_WORKSPACE_PI_ADAPTER
status: accepted_activated_pending_implementation
version: V0_A
date: 2026-07-30
accepted_by_user: 2026-07-30
execution_owner: future_dedicated_goal_session
implementation_owner: future_dedicated_goal_session
main_session_owner: current_codex_main_session
active_goal: true
goal_activation_state: activated_pending_dedicated_session_start
contract_accepted: true
activation_authorized: true
control_baseline_commit_authorized: consumed_by_resulting_HEAD_of_this_revision
control_baseline_commit: resulting_HEAD_of_this_revision
dedicated_goal_session_prompt_authorized: true_after_control_baseline_commit_confirmation
formal_workbench_creation_authorized: true_for_dedicated_goal_session_after_Gate_A
implementation_authorized: true_for_dedicated_goal_session_only
implementation_started: false
dependency_installation_authorized: false
external_network_authorized: false
real_model_calls_authorized: 0
git_commit_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
```

> 本 Contract 已由用户接受并激活，但实现尚未开始。当前主 Session 只负责控制状态、Control Baseline Commit、SHA 核验和启动 Prompt；只有未来专用 Goal Session 可从该 Commit 开始执行 Gate A，并在 Gate A 通过后实现 V0-A。

---

## 1. Mission

V0-A 的唯一使命是：

> 建立正式 Workbench 的最小基础，使一个版本化 TaskSpec 和单一 Strategy 能通过零副作用 Preflight、隔离 Workspace materialization、公共 Pi Adapter 和有界 Tool Profile，使用 Faux Provider 完成一次确定性真实 Coding Task，并形成 Task / Run / Attempt / Session / Workspace identity。

V0-A 回答：

1. 正式 `workbench/` 能否通过公共 Direct `AgentHarness` 运行，而不是继续依赖 G006 hard-coded Driver；
2. 无效配置能否在 Workspace、Session、Tool 和 Provider 副作用前失败；
3. Task、Run、Attempt、Strategy、Session 和 Workspace identity 能否不依赖 Pair/Variant；
4. bounded local Tool Profile 能否覆盖真实 Coding Agent 的 read/list/search/edit/write/test 基础；
5. Workspace 路径、symlink/reparse 和命令策略能否阻止默认越界；
6. Faux Provider 能否完成一次真实 TypeScript 代码修复并 settled；
7. V0-B 能否在不重写 V0-A 对象边界的情况下继续增加 Session persistence、Journal、Verifier 和 Outcome。

V0-A 不回答 Completion Policy 是否有效，也不产生 V0 完整 Outcome。

---

## 2. Authorization Model

### 2.1 Contract acceptance is not activation

唯一允许的后续顺序冻结为：

```text
用户接受正式 V0-A Goal Contract（已完成）
→ Contract 正式化，但仍未执行（已完成）
→ 用户单独授权 V0-A Activation 和 Control Baseline Commit（已完成）
→ 主 Session 更新 CURRENT_STATE、Contract 状态和必要控制文件（已完成）
→ 主 Session 创建并核验干净的 Control Baseline Commit（本次授权步骤）
→ 主 Session 记录 Baseline Commit
→ 主 Session 生成 V0-A 专用 Goal Session 启动 Prompt
→ 新专用 Session 从该 Commit 开始执行 Gate A
```

绑定规则：

1. Contract acceptance 仍不等于 Goal activation；
2. Activation 必须由用户单独授权；
3. 正式执行必须从已经提交 `active_goal: V0_A` 的干净 Control Baseline Commit 开始；
4. 主 Session 必须在创建专用 Session 前记录精确 Baseline Commit；
5. 专用 Goal Session 不得自行修改或提交 `CURRENT_STATE.md`、Contract 状态或其他控制状态；
6. 不采用“先提交 `active_goal: null` 的 baseline，再以未提交变更激活 Goal”的流程；
7. 只有 Gate A 通过后才可创建 `workbench/`。

Contract 接受不自动授权：

- 真实模型；
- 外部下载；
- Pi 修改；
- Git commit；
- V0-B/V0-C；
- 任何额外 Goal。

### 2.2 Current stop point

当前控制状态是 `accepted_activated_pending_implementation`。Control Baseline Commit 成功并确认精确 SHA 前，不得生成专用 Goal Session 启动 Prompt；专用 Session 未启动前不得执行本 Contract 的任何 Command 或 Gate。当前主 Session不得实现 V0-A。

---

## 3. Current Evidence

### 3.1 Fixed Pi

```yaml
path: .upstream/pi
commit: 027a5847901b5dde30270abaa1041046cd2b4b55
describe: v0.82.1-40-g027a5847
package: "@earendil-works/pi-agent-core@0.82.1"
node_engine: ">=22.19.0"
license: MIT
working_tree: clean_at_contract_draft
```

**Fact.** `packages/agent/src/index.ts` 公开导出：

- `AgentHarness`；
- `Session` 和 Memory/JSONL storage/repo；
- `NodeExecutionEnv`；
- `createReadTool`、`createEditTool`、`createWriteTool`、`createBashTool`；
- `AgentHarnessTool`、`ExecutionEnv` 等公共类型。

### 3.2 G003

**Fact.** G003 证明 public emitted import、Faux Provider、外部 Workspace Driver、Attempt-like cycle、settlement 和同 Session recovery 软件机制可运行，Pi Core patch 为 0。

V0-A 只继承 public import、Faux Provider、Workspace control 和 settlement 证据，不实现 G003 Completion Recovery。

### 3.3 G006

**Fact.** G006 Gate 0 证明：

- Windows Node `v24.14.1`、npm `11.11.0` 路线可运行；
- public emitted runtime/type import 通过；
- strict TypeScript consumer 通过；
- 自定义 `AgentHarnessTool` 可注入；
- 8/8 离线测试通过；
- real route 后续通过，但 V0-A 不继承真实模型权限。

**Fact.** `.runs/g006/source/earendil-works-pi-ai-0.82.1.tgz` 当前本地存在，字节长度 `681668`，与 G003/G005/G006 三份归档的 SHA-512 相同；其接受的 registry identity 是：

```yaml
package: "@earendil-works/pi-ai@0.82.1"
dist_integrity: "sha512-3WFYRhEp3lQB3444EhPMBcM7zSaEUE3eJgHOR7s4081NLqbw/FsWilIKWXSua0Gv3sRr7m9xMidR3pPDE7jI/A=="
dist_shasum: "02ebdfc2997fd88ca1f51a7b5c01f337a9462f34"
archive_sha512_hex: "dd6158461129de5401df8e381213cc05c33bcd2684504dde2601ce47bb38d3cd4d2ea6f0fc5b168a520a5974ae6b41afdec46bee6f71322751de93c313b8c8fc"
```

V0-A 不重新下载该 Artifact；若本地 accepted artifact 或 isolated build 不可用，必须暂停。

### 3.4 Tool boundary evidence

**Fact.** Pi built-in read/edit/write 接受 relative 或 absolute path；`NodeExecutionEnv.absolutePath()` 会解析绝对路径，并不强制目标留在 Workspace。Pi tests 还明确覆盖通过 symlink 编辑文件。`createBashTool` 接受原始命令字符串，虽然有 `prepare` hook，但默认不是 command allowlist。

**Conclusion.** V0-A 可以复用 public built-in tool behavior，但必须增加项目自己的 Workspace path/symlink policy；不得把裸 Pi built-in file/bash tools当作安全边界。

---

## 4. Binding Inputs

V0-A 专用 Session 必须按顺序完整读取：

1. `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
4. `docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md`；
5. 用户接受后的正式 V0-A Goal Contract；
6. `docs/reports/PROJECT_ZERO_TO_CURRENT_PROGRESS_CONCLUSIONS_AND_COMPLETE_FORWARD_PLAN_2026-07-30.md` 中 G003、G006、技术栈和 Session 分工部分；
7. G003 Contract、Report、Closeout；
8. G006 Contract、Gate 0 Report、正式 Report、Closeout；
9. ADR-0001、ADR-0002、ADR-0003；
10. 进入 `.upstream/pi` 前完整读取其适用 `AGENTS.md`；
11. 固定 Pi 的下列源码和测试：
    - `packages/agent/src/index.ts`；
    - `packages/agent/src/harness/agent-harness.ts`；
    - `packages/agent/src/harness/types.ts`；
    - `packages/agent/src/harness/env/nodejs.ts`；
    - `packages/agent/src/harness/tools/index.ts`；
    - `read.ts`、`edit.ts`、`write.ts`、`bash.ts`、`path-utils.ts`；
    - `packages/agent/test/harness/agent-harness.test.ts`；
    - `packages/agent/test/harness/tools.test.ts`；
12. `spikes/pi-runtime/g006/` 中 public import/type resolution、Faux observer、tools 和 fixture；
13. `docs/reports/PI_CC_HARNESS_COMPARISON_MATRIX.md` 的 Agent Loop、Tool、Session 和 Permission 边界。

若正式 Contract 与 Charter 冲突，立即暂停，由主 Session和用户决定；执行 Session不得自行选择。

---

## 5. Binding Semantics Inherited from V0 Charter

以下语义不能由 V0-A 实现调整：

- 一个 Run 只执行一个 Task + Strategy；
- Attempt 是一个有界 Agent Cycle；
- `strategy_id` 是独立 identity；
- Attempt 保留 `parent_attempt_id`，V0-A 初始 Attempt 固定为 `null`；
- Session 和 Workspace identity 挂在 Attempt 上；
- Pi 通过一个 Adapter 边界使用；
- private Pi import 和 Pi Core patch 禁止；
- Workspace Provider 是独立边界；
- Agent 不能写 Task source、protected tests、Verifier 或 evidence root；
- 顶层 Outcome 方向是 `passed/failed/invalid/cancelled`，但 V0-A 不实现完整 Outcome；
- V0-A 的 Recovery Budget 是 0；
- V0-A 真实模型调用是 0；
- V1 Skill 与 Completion Policy 必须保持可分离；
- V2 所需 lineage 不得被 Pair/Variant 锁死；
- Worktree 后移；
- SearchCLI、论文和任何外部模块获取不进入 V0-A。

---

## 6. Scope

### 6.1 Formal application foundation

在用户授权 Activation 和 Control Baseline Commit，且主 Session 已完成控制状态更新、创建并记录干净 Baseline Commit 后，专用 Session 通过 Gate A 才允许首次创建：

```text
workbench/
```

候选最小结构：

```text
workbench/
  package.json
  tsconfig.json
  src/
    cli.ts
    contracts/
    preflight/
    workspace/
    pi/
    tools/
    prompts/
  test/
  scripts/
```

精确文件布局可由专用 Session在不改变 Contract 语义的前提下收敛；不得增加 Dashboard、database、server 或 V1/V2 模块。

### 6.2 V0-A contract objects

若本 Contract 被接受，V0-A 至少实现以下字段语义；精确 TypeScript 命名可在实现报告中说明，但不得合并对象边界。

#### `TaskSpecV0A`

```yaml
schema_version: 1
task_id: string
instruction_ref: workspace_source_relative_read_only_path
instruction_sha256: sha256
workspace_source_ref: project_relative_path
workspace_source_digest: sha256
writable_paths: list_of_relative_globs
protected_paths: list_of_relative_globs
tool_profile_id: v0a_bounded_local
command_descriptors: list
```

#### `StrategySpecV0A`

```yaml
strategy_id: v0a_faux_single_cycle
provider: public_faux
system_prompt_id: project_minimal_base_v1
skill_refs: []
completion_policy: foundation_single_cycle_no_external_verifier
recovery_budget: 0
```

#### `RunRecordV0A`

```yaml
run_id: generated_unique_id
task_id: string
strategy_id: string
config_digest: sha256
workspace_id: string
attempt_ids: [one_initial_attempt]
status: planned_or_running_or_settled_or_invalid
```

#### `AttemptRecordV0A`

```yaml
attempt_id: generated_unique_id
run_id: string
ordinal: 1
parent_attempt_id: null
strategy_id: string
session_id: string
workspace_id: string
status: planned_or_running_or_settled_or_error
terminal_reason: string_or_null
```

V0-A 的 `settled` 不是 `passed`；没有外部 Verifier 时，CLI 不得输出正式任务 Outcome。

### 6.3 Preflight

`--dry-run` 必须在不创建正式 Run/Attempt、Workspace、Session、Tool 副作用或 Provider 请求的前提下验证：

- TaskSpec Schema 和未知字段策略；
- 所有引用文件存在；
- source/instruction digest；
- writable/protected path 不冲突；
- command descriptor 使用受支持 ID；
- Strategy、Tool Profile 和 Faux Provider identity；
- Pi Adapter public import 可解析；
- artifact/run root 目标不存在或无冲突；
- 预计 Workspace 和 evidence roots；
- Recovery Budget 为 0；
- real model budget 为 0；
- 不读取 `.env.g005` 或任何 API key。

Dry Run 只能输出 canonical plan 到 stdout；是否保存非正式 preflight artifact 由 Gate 要求决定，但不得创建正式 Run identity。

### 6.4 Workspace Provider

V0-A 只实现 `temporary_copy` provider：

- source 位于项目受控 fixture；
- target 位于 `.runs/v0-a/runs/<run-id>/workspace/`；
- target 必须原先不存在；
- 复制前后记录 source/initial tree digest；
- 不使用 hardlink；
- 不创建 Git worktree；
- Task instruction、protected public tests 和 package metadata可读但不可写；
- 只有 `src/parse-duration.ts` 是 V0-A task 的 Agent writable path；
- evidence/run metadata 位于 Agent write scope 外；
- Workspace 初始树不得包含 symlink、junction 或其他 reparse-point escape；
- 每次文件 Tool 调用都重新检查路径边界，不能只依赖初始化扫描。

### 6.5 Pi Adapter

V0-A `PiAdapter` 或等价单一模块负责：

- 从 public emitted `@earendil-works/pi-agent-core` 导入；
- 构造 public `AgentHarness`；
- 使用 public Faux Provider；
- 注入 project-owned minimal System Prompt；
- 注入 bounded Tool Profile；
- 创建一个带项目 identity 的 Session；
- 调用一个 prompt；
- 等待 settled；
- 公开最小 settlement result；
- best-effort cleanup/abort；
- 将 Pi error 映射为 V0-A execution error，不定义完整 V0 Outcome。

所有 Pi-specific import 必须集中；业务层不得导入 `.upstream/pi/**/src` 或依赖 G006 Driver。

### 6.6 System Prompt

V0-A 使用项目自有的最小 base prompt，至少表达：

- Agent 在受限 Workspace 中工作；
- 只能使用提供的 Tool；
- 不得访问或修改 Workspace 外部；
- protected path 不得修改；
- 应运行 Task 声明的检查；
- Tool/Session settlement 不等于外部验证成功；
- Task instruction 单独注入；
- Skill overlay 在 V0-A 为空。

不得复制 Claude Code System Prompt。Prompt identity 和 digest 必须进入 Run config digest。

---

## 7. Bounded Tool Profile

### 7.1 File tools

V0-A 暴露以下语义能力：

```text
read
list
search
edit
write
```

冻结实现方向：

- `read`、`edit`、`write`：允许复用 Pi public built-in tool 的读取预算、edit diff 和 mutation queue，但必须由项目 Wrapper 在调用前执行 Workspace policy；
- `list`：项目 `AgentHarnessTool`，基于 Node/ExecutionEnv 列目录，限制 root、depth、entry count 和输出 bytes；
- `search`：项目 `AgentHarnessTool`，以 `rg` 的 explicit executable + argv 方式运行，`shell: false`，cwd 固定 Workspace，限制 path、match count、line count 和 bytes；
- 不暴露 delete、move、rename、chmod 或任意路径 Tool。

V0-A 对 Agent 暴露的 Wrapper ID 和参数面冻结为：

```yaml
tool_wrappers:
  workspace_read:
    agent_arguments: [path, offset_line_optional, limit_lines_optional]
  workspace_list:
    agent_arguments: [path_optional, depth_optional]
    default_path: "."
    max_depth: 4
  workspace_search:
    agent_arguments: [query, path_optional]
    match_mode: fixed_string
    default_path: "."
  workspace_edit:
    agent_arguments: [path, old_text, new_text]
  workspace_write:
    agent_arguments: [path, content]
  run_command:
    agent_arguments: [command_id]
```

Agent 不得传入 root、cwd、executable、argv、env、shell、timeout、输出上限、glob、regex flag 或 Workspace scope。Wrapper 可在内部调用 Pi public tool，但 Journal/事件必须使用上述项目 Tool ID，避免把 Pi 内部名称变成项目合同。

### 7.2 Workspace path policy

每个路径操作必须：

1. 只接受 Workspace-relative path；
2. 拒绝 absolute、UNC、drive-qualified、URI、空字节和 `..` escape；
3. normalize separator 后验证 `relative(workspaceRoot, resolved)` 不以 `..` 开始且不是 absolute；
4. 对现有路径逐段 `lstat`，拒绝 symlink/junction/reparse point；
5. 对新文件验证最近现有 parent 的 real path 仍在 Workspace；
6. read/list/search 必须落在 readable scope；
7. edit/write 必须同时匹配 `writable_paths` 且不匹配 `protected_paths`；
8. 每次 Tool 调用重新验证，避免初始化后替换路径；
9. 拒绝越界时形成正常 Tool error/result，不执行副作用；
10. Gate 必须覆盖 traversal、absolute path 和 symlink/reparse escape。

若 public Pi built-in tool 无法在不修改 Pi Core 的情况下被可靠包裹，暂停；不得先暴露裸 Tool 再补安全说明。

### 7.3 Command tool

V0-A 不向 Agent 暴露 raw `bash`、PowerShell 或自由 command string。暴露一个 command-ID Tool 或等价的 policy-checked wrapper：

```yaml
command_ids:
  task_declared:
    - test
    - build
    - typecheck
    - lint

  repository_inspection:
    - git_status
    - git_diff
    - git_log
```

V0-A 冻结的非 Task Git descriptor 是：

```yaml
repository_command_descriptors:
  git_status:
    executable: git
    argv: ["status", "--short", "--branch", "--untracked-files=all"]
  git_diff:
    executable: git
    argv: ["diff", "--no-ext-diff", "--no-color", "--"]
  git_log:
    executable: git
    argv: ["log", "--max-count=20", "--format=%H%x09%an%x09%aI%x09%s", "--"]
```

上述 Git descriptor 只能以 Workspace root 为 cwd，不能接受额外 Agent 参数。`test/build/typecheck/lint` 不是四个全局可执行字符串，而是 TaskSpec 中按 `command_id` 固定的静态 descriptor；Preflight 必须拒绝重复 ID、空 argv、shell wrapper，以及任何未由 TaskSpec 声明的 ID。V0-A 的正式 fixture 只声明下方 `test` descriptor。

规则：

- Task command descriptor 必须在只读 TaskSpec 中固定 executable、argv、cwd=`workspace`、timeout 和 output budget；
- 实现使用 direct process spawn/execFile 或等价 `shell: false` 路径；
- Agent 只传 `command_id`，不能覆盖 executable、argv、cwd、env 或 timeout；
- Git 只允许 status/diff/log 的固定 argv；
- 禁止 commit、push、reset、checkout、clean、install、network command 和 background service；
- 默认环境不继承 credential；
- timeout 后等待进程 settlement；V0-A 不承诺完整 process-tree cancellation，若固定任务出现残留则暂停；
- 默认最大 timeout 30 秒、输出投影不超过 50 KB；V0-A 固定 test command 使用 15 秒和 8 KB；
- non-zero exit 作为 Tool result/error保存，不自动定义正式 Outcome。

V0-A deterministic task 只启用：

```yaml
command_id: test
executable: current_node_executable
argv: ["--test", "test/public.test.ts"]
cwd: workspace_root
timeout_seconds: 15
max_combined_output_bytes: 8192
```

Git inspection wrappers需要单元测试，但 V0-A fixture 不要求 Agent 调用 Git。

### 7.4 Tool result budgets

- read/list/search 遵守 2,000 lines / 50 KB 绝对上限；
- V0-A fixture 的单次 read/search 建议更低，但不得破坏任务完成；
- truncated result 必须指出 truncation；
- V0-A 不建设 full Artifact externalization；若完成 Task 必须依赖超过上限的结果，暂停并交给 V0-B/后续设计；
- Tool start/end/error 和 stable call ID 必须可由测试观察，但完整 Journal 留给 V0-B。

---

## 8. Faux Provider and Deterministic Real Coding Task

### 8.1 Provider

- 使用 public emitted Faux Provider；
- 外部 Provider request count 必须为 0；
- 不加载 `.env.g005`；
- 不读取 `DEEPSEEK_API_KEY`；
- 固定 tool-call/assistant sequence，允许测试每个关键边界；
- Provider fixture identity/digest 进入 config digest。

### 8.2 Task

V0-A 创建新的正式 fixture，不修改历史 G006 fixture：

```text
fixtures/tasks/v0-a-parse-duration/
```

它可以基于 G006 已验证的 `parseDuration` public task 行为重新物化，但必须记录来源映射。Fixture 至少包括：

- `task.md`；
- `package.json`；
- `src/parse-duration.ts` 的已知缺陷初始实现；
- `test/public.test.ts`；
- V0-A TaskSpec；
- 只允许 Agent 修改 `src/parse-duration.ts`。

### 8.3 Deterministic agent cycle

Faux sequence 至少完成：

1. list Workspace；
2. search `parseDuration` 或任务关键符号；
3. read task、source 和 public test；
4. edit `src/parse-duration.ts`；
5. 调用 `test` command ID；
6. 返回 final assistant message；
7. `AgentHarness` settled。

`write` capability通过独立 disposable tool integration test验证；不为满足工具清单而让 task 产生无关文件。

### 8.4 Acceptance boundary

V0-A 的外部 Gate 可以在 Agent settled 后由测试代码检查：

- public tests 通过；
- protected files bytes 未改变；
- 只有允许路径发生变化；
- final Workspace digest 已记录；
- Run/Attempt/Session/Workspace IDs 一致。

这只是 V0-A Goal acceptance，不是 Workbench 的通用 External Verifier/Outcome 实现；后者属于 V0-B。

---

## 9. Commands

以下是未来专用 Session 从已记录 Control Baseline Commit 启动后必须执行或实现后可执行的命令。当前本轮不得运行。

### 9.1 Activation preflight commands

```powershell
git -c safe.directory=D:/AI/AI_Projects/project2 rev-parse HEAD
git -c safe.directory=D:/AI/AI_Projects/project2 status --short
git -C .upstream/pi rev-parse HEAD
git -C .upstream/pi status --short
node --version
npm.cmd --version
rg --version
git --version
```

必须记录精确版本和输出。根项目 HEAD 必须精确等于主 Session 已记录的 Control Baseline Commit；该 Commit 必须同时包含正式 Contract、`active_goal: V0_A`、Activation 状态和必要控制文件。跟踪文件必须 clean；允许的未跟踪 `reference/` 必须与 Baseline 记录一致。

### 9.2 Local Pi execution basis

V0-A 应优先从已经接受的本地 G006 isolated Pi/build 形成新的非硬链接隔离副本或以同等可审计方式建立 `.runs/v0-a/pi`，不得修改 `.upstream/pi` 或 `.runs/g006`。

建立后必须运行：

```powershell
git -C .runs/v0-a/pi rev-parse HEAD
git -C .runs/v0-a/pi status --short
node workbench/scripts/public-import-smoke.mjs
```

若需要重新安装依赖、重新下载 Artifact 或访问 registry，而激活授权没有明确包含该动作，立即暂停。不得静默 hydration、partial emitted build 或 Pi patch。

### 9.3 Required verification commands after implementation

最终 Contract 的命令接口冻结为以下意图；若路径只因实现布局调整，必须在 Report 中给出一一映射：

```powershell
.runs/v0-a/pi/node_modules/.bin/tsc.cmd -p workbench/tsconfig.json
node --test workbench/test
node workbench/src/cli.ts run --task fixtures/tasks/v0-a-parse-duration/task.json --strategy v0a_faux_single_cycle --dry-run
node workbench/src/cli.ts run --task fixtures/tasks/v0-a-parse-duration/task.json --strategy v0a_faux_single_cycle
```

还必须运行：

- public emitted import resolution check；
- private-import scan；
- Pi Core diff check；
- Tool Profile negative-security tests；
- dry-run side-effect inventory comparison；
- deterministic task final Workspace acceptance check；
- external provider call count assertion `0`。

不得使用宽泛 root test/build 命令替代这些有界 Gates。

---

## 10. Gates

### Gate A — Activation and source basis

Pass：

- 主 Session 记录的 Control Baseline Commit 已存在，且 HEAD 精确匹配；
- 该 Commit 中正式 Contract 状态为 activated，`CURRENT_STATE.md` 明确记录 `active_goal: V0_A`；
- root tracked worktree clean；
- Pi reference Commit 精确匹配且 clean；
- `workbench/` 和 `.runs/v0-a/` 在首次激活前不存在；
- 当前 Active Goal、Activation 授权和 Contract identity 彼此一致；
- real model/environment credential未加载；
- public emitted Pi basis 可用。

Fail/Pause：任何身份不一致、未授权目录已存在、需要下载/安装但未授权。

### Gate B — Contracts and zero-side-effect preflight

Pass：

- Task/Strategy/Run/Attempt objects分离；
- `strategy_id` 和 nullable `parent_attempt_id` 存在；
- invalid schema、missing ref、digest mismatch、path conflict、unknown command ID 在副作用前失败；
- `--dry-run` 前后正式 run roots、Workspace、Session 和 provider call count 均不变；
- canonical plan可读且不含 secret。

### Gate C — Workspace Provider and path boundary

Pass：

- temp copy target initially absent；
- no hardlink；
- source/initial digest匹配；
- absolute、`..`、UNC/drive、URI、symlink/junction/reparse escape 全部拒绝；
- protected tests/package/task不能写；
- `src/parse-duration.ts` 可以 edit/write；
- evidence root 不在 Agent write scope；
- Worktree未实现。

### Gate D — Public Pi Adapter

Pass：

- imports只从 public emitted package；
- strict TypeScript通过；
- AgentHarness构造、prompt、settled和cleanup通过；
- Session/Attempt/Workspace identity可关联；
- Pi Core/private import scan为 0；
- 不依赖 G006 hard-coded Driver API。

### Gate E — Bounded Tool Profile

Pass：

- read/list/search/edit/write可在 Workspace 内正常工作；
- raw shell不存在；
- command ID只能执行冻结 descriptor；
- test/build/typecheck/lint/repository inspection的 policy tests覆盖 allow/deny；
- git commit/push/reset/checkout/clean、network、install、background和外写全部拒绝；
- timeout/output caps可观察；
- Tool call IDs和 end/error配对；
- 被拒绝 Tool无副作用。

### Gate F — Deterministic real Coding Task

Pass：

- public Faux Provider完成一次 single-cycle coding run；
- sequence覆盖 list/search/read/edit/test；
- `AgentHarness` settled；
- external Provider calls = 0；
- public tests通过；
- protected files字节不变；
- 只有允许 source发生变化；
- Run/Attempt/Session/Workspace IDs一致；
- CLI只报告 execution settled / acceptance-gate result，不伪装成 V0 formal Outcome。

### Gate G — Scope and continuity

Pass：

- 没有 Journal/Verifier/Completion Recovery/real model/SearchCLI/Worktree/V1/V2/V3实现；
- V0-B 可在现有对象边界增加 Session persistence、Journal、Verifier、Outcome；
- V1 可增加 Skill strategy而不修改 Run/Attempt identity；
- V2 可创建 child Attempt而不引入 Pair schema；
- Source/License/Attribution记录完整。

任一 Gate 未通过，V0-A 不能被主 Session接受。

---

## 11. Evidence Artifacts

### 11.1 Tracked deliverables

若 V0-A 被激活，专用 Session必须提交供审查的 tracked deliverables：

- `workbench/` V0-A source、tests、README；
- `fixtures/tasks/v0-a-parse-duration/`；
- `docs/reports/V0_A_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V0_A_CLOSEOUT_DRAFT.md`；
- 精确 source inventory/digest；
- command/result table；
- 未验证项和 scope changes；
- 在 `V0_A_IMPLEMENTATION_REPORT.md` 或 `V0_A_CLOSEOUT_DRAFT.md` 中提交结构化 `CURRENT_STATE_UPDATE_PROPOSAL`。

`CURRENT_STATE_UPDATE_PROPOSAL` 至少包含：

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  proposal_status: pending_main_session_review
  goal_id: V0_A_CONTRACTS_PREFLIGHT_WORKSPACE_PI_ADAPTER
  observed_execution_status: string
  recommended_disposition: PASS_or_FAIL_or_INVALID_or_PAUSED
  control_baseline_commit: full_git_sha
  implementation_source_identity: object
  gates: object
  definition_of_done: object
  pi_commit: full_git_sha
  pi_core_patch_count: integer
  real_model_calls: 0
  workbench_created: boolean
  evidence_refs: array
  unverified_items: array
  proposed_state_changes: array
```

该 Proposal 只是待主 Session 审查的事实建议，不得伪装成已经写入 `CURRENT_STATE.md` 的状态。只有主 Session 完成实现验收并再次获得用户授权后，才可以修改 `CURRENT_STATE.md`。

### 11.2 Ignored evidence

`.runs/v0-a/` 保存：

- activation preflight identity；
- isolated Pi identity；
- dry-run before/after inventory；
- unit/integration test raw output；
- tool negative-case output；
- deterministic run root；
- Run/Attempt records；
- Workspace initial/final inventory和 digest；
- Session identity/projection（不要求 V0-B 级持久化）；
- external provider call count proof；
- final scope/secret scan。

不得把 `.runs/v0-a/` 提交 Git。

### 11.3 Evidence discipline

- 原始失败不得回填；
- 重跑必须创建新的 run identity，并需要 Contract范围内授权；
- 观察器/测试基础设施失败必须标为 invalid evidence，不得归因 Agent；
- 专用 Session必须记录每条 Command、cwd、exit code和结果；
- 专用 Session不得修改、暂存或提交 `CURRENT_STATE.md`、正式 Contract 状态或其他控制文件；
- 没有用户授权不得创建实现 baseline Commit。

---

## 12. Definition of Done

V0-A 只有全部满足才可提交 `PASS_V0_A_FOUNDATION` 供主 Session审查：

1. Contract 已接受，用户已单独授权 Activation 和 Control Baseline Commit，主 Session 已提交并记录包含 `active_goal: V0_A` 的干净 Baseline Commit；
2. V0-A 由新的专用 Goal Session执行；
3. 正式 `workbench/` 仅在激活后创建；
4. Task/Strategy/Run/Attempt/Session/Workspace identity实现且不含 Pair/Variant锁定；
5. `parent_attempt_id` 存在且初始 Attempt 为 `null`；
6. `--dry-run` 零正式副作用；
7. temp-copy Workspace Provider通过路径、protected file、symlink/reparse tests；
8. public Direct Pi Adapter通过 emitted import和 strict typecheck；
9. Pi Core patch/private import为 0；
10. bounded file/list/search/command profile通过正负 tests；
11. raw shell、network、install、background、external write、privilege escalation未暴露；
12. project-owned minimal System Prompt与 task overlay分离；
13. Faux Provider deterministic real coding task完成并 settled；
14. task public tests通过、protected bytes不变、only allowed diff；
15. external provider calls精确为 0；
16. V0-A 没有产生正式 Verifier Outcome或 Recovery；
17. V0-B/V1/V2连续性检查通过；
18. 全部 required commands和 Gates有证据；
19. Report、Closeout Draft、source inventory、未验证项和结构化 `CURRENT_STATE_UPDATE_PROPOSAL` 完整，且专用 Session 未修改控制状态；
20. 没有未经授权的下载、Commit或 scope expansion。

主 Session和用户接受前，执行结果只能是 `pending_main_review`，不能自动将 V0-A 标为 accepted。

---

## 13. Non-goals

V0-A 明确不覆盖：

- 完整 Journal / Evidence schema；
- durable Pi Session storage/reopen；
- External Verifier Contract 和通用 Outcome 闭环；
- `inspect` 完整实现；
- `compare`；
- Completion Verification；
- same-session Recovery；
- child Attempt执行；
- Failure Packet；
- 真实模型或 `.env.g005`；
- V0-B/V0-C 的真实模型预算；
- SearchCLI、Youtu-Agent、论文、OpenHarness、Harbor、Terminal-Bench；
- Worktree；
- 跨进程 resume；
- crash-after-side-effect reconciliation；
- 长工具 cancellation 平台；
- Context Compaction；
- Skill-only；
- V1/V2/V3/V4/V5；
- Multi-Agent、MCP、A2A；
- Web UI、SQLite、server、container、通用 sandbox；
- Pi SDK/RPC；
- Pi Core patch/private import；
- 通用 Permission 平台；
- 自动 Git commit/push；
- 外部模块移植；
- 效果 Pilot、Policy Promotion 或 Portfolio 效果 claim。

---

## 14. Pause Conditions

专用 Session必须在以下任一情况立即停止并写 `docs/reports/V0_A_PAUSE_REPORT.md`：

1. root HEAD 不等于已记录 Control Baseline Commit，或该 Commit 中 `active_goal: V0_A`、Activation 状态、正式 Contract、Pi Commit、工作树状态彼此不一致；
2. `workbench/` 或 `.runs/v0-a/` 在首次激活前已存在且来源不明；
3. 需要修改 Pi Core、使用 private import或 partial emitted build；
4. 本地 accepted Pi Artifact/build不可复用，继续需要下载/安装而未授权；
5. public Direct AgentHarness无法构造所需 Tool/Profile/Session；
6. built-in tool不能在不修改 Pi的情况下被可靠包裹，而替代方案会扩大 scope；
7. Workspace路径或 symlink/reparse escape无法阻止；
8. command wrapper必须接受 raw shell才能完成固定任务；
9. Agent能修改 protected tests、TaskSpec、evidence root或 Workspace外文件；
10. Preflight必须产生正式 Workspace/Session/Provider副作用；
11. Faux Provider deterministic task无法通过公共入口完成或不能 settled；
12. 需要真实模型、网络、package install、background service或额外权限；
13. 需要实现 Journal、Verifier Outcome、Recovery、Worktree、V1/V2/V3才能完成；
14. V0-A 对象模型必须删除 `strategy_id`、`parent_attempt_id`或 Attempt-level identity；
15. Outcome/Failure semantics必须改变；
16. Credential、reasoning body或敏感环境进入 artifacts；
17. 运行 evidence缺失，无法区分 Agent failure和infrastructure/evidence failure；
18. 用户工作区修改与 V0-A source重叠且无法安全绕开；
19. 需要 Git commit但用户未授权；
20. Contract的任何 binding semantic需要调整。

Pause Report 只写：观察、证据、已执行命令、为什么阻塞、最小选项和需要用户决定的权限。不得在暂停后自行选择架构分支。

---

## 15. Claims Allowed / Not Allowed

### 15.1 若 V0-A 被接受，允许声称

- 正式 Workbench foundation 使用固定 Pi public Direct `AgentHarness`；
- V0-A 通过 Task/Run/Attempt/Strategy identity执行单一有界 Cycle；
- temp-copy Workspace和路径策略阻止默认越界写入；
- bounded read/list/search/edit/write/test Tool Profile可运行；
- project-owned minimal prompt、Task overlay和 future Skill overlay边界已建立；
- Faux Provider完成一个确定性真实 TypeScript coding task并 settled；
- public emitted import、strict TypeScript和零 Pi Core patch通过；
- V0-A 为 V0-B、V1和V2保留对象连续性。

### 15.2 即使 V0-A 被接受，也不得声称

- 正式 V0 已完成；
- Workbench 已有完整 Journal、Verifier或 Outcome；
- Agent settled 等于任务 passed；
- Completion Verification已实现或有效；
- 真实模型路线由 V0-A 再次证明；
- 真实 Recovery已观察；
- Tool Profile是 OS Sandbox；
- Worktree、Resume、Durability或Cancellation已解决；
- Skill-only或多路径恢复已实现；
- V0-A 达到目标 Portfolio Milestone；
- 外部复用模块是个人原创；
- 结果可泛化到其他 Task、Model或 Pi Commit。

---

## 16. Required Report and Closeout

执行完成后，专用 Session必须停止并提交：

1. `docs/reports/V0_A_IMPLEMENTATION_REPORT.md`；
2. `docs/reports/V0_A_CLOSEOUT_DRAFT.md`；
3. source delta和完整文件清单；
4. exact commands、cwd、exit codes和结果；
5. Gate A–G表；
6. Definition of Done逐项表；
7. 未验证项；
8. scope changes或incidents；
9. 建议 disposition：
   - `PASS_V0_A_FOUNDATION`；
   - `FAIL_V0_A_FOUNDATION`；
   - `INVALID_V0_A_EVIDENCE`；
   - `PAUSED_V0_A`；
10. 结构化 `CURRENT_STATE_UPDATE_PROPOSAL`；
11. 给主 Session的最小审查入口。

专用 Session不得将自己的建议 disposition写成用户已接受结果，也不得直接修改或提交 `CURRENT_STATE.md`。

---

## 17. Dedicated-session Handoff After Activation Baseline

只有在用户已经单独授权 Activation 和 Control Baseline Commit，且主 Session 已按第 2 节顺序更新控制状态、创建并记录干净 Baseline Commit 后，主 Session 才生成执行 Prompt。不得提前生成 Prompt，也不得让专用 Session 从未提交控制状态开始。该 Prompt 必须：

- 指向本正式 Contract；
- 写明精确 Control Baseline Commit，并要求启动 HEAD 完全匹配；
- 明确 dedicated Goal Session身份；
- 重申 0 real calls、0 Pi patches、0 private imports；
- 重申 no Journal/Verifier/Recovery/V1/V2/V3 scope；
- 要求先完成 Gate A并在任何冲突时暂停；
- 不授权 Git commit，也不允许修改 `CURRENT_STATE.md` 或正式控制文件；
- 要求在 Report/Closeout Draft 中提交 `CURRENT_STATE_UPDATE_PROPOSAL`；
- 要求实现/执行完成后返回主 Session验收。

当前不得生成或使用该执行 Prompt。
