# V3.6 Open Interactive Agent Mode — Preimplementation Planning Review

~~~yaml
status: accepted_preimplementation_planning
date: 2026-08-10
review_type: bounded_preimplementation_planning
revision_input: V3_6_PREIMPLEMENTATION_PLANNING_REVIEW_AMENDMENTS.md
independent_review_status: accepted_no_further_planning_revision_required
control_baseline_housekeeping: completed_resulting_HEAD_of_revision
implementation_authorized: false
execution_backend_selected: false
execution_backend_selection_authorized: false
real_model_calls_authorized: 0
credential_reads_authorized: 0
pi_core_modification_authorized: false
active_goal: null
repository_baseline: 4cddf4e804aeb02629fd6cefe456a28a06492da8
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
~~~

## 1. 结论先行

**Recommendation：** 接受附件的核心产品方向，但将其收窄为一个明显轻于 V3 的两 Goal 版本：

> 用户从宿主侧登记的项目中选择一个项目，输入自由文本 Coding Task；Workbench 在服务端生成不可由浏览器伪造的有界 Run Authority，固定 Session 所使用的代码、Harness State、工具与执行后端，并通过现有 Pi、Session、Trace 和 Read Model 完成可继续、可检查的开放式 Agent Run。

这里的“开放”只指：

- 用户可以自由描述任务；
- 可以在同一持久 Session 中继续对话；
- 可以选择已登记的受控项目和能力档位。

它不指：

- 浏览器可以提交宿主路径、命令、Credential 或 Provider 配置；
- Agent 可以执行任意 Shell、安装依赖、联网或 Git Push；
- Agent 可以修改 Active Harness State、Verifier 或历史 Evidence；
- 任意本地仓库都能在没有项目登记和执行环境准备的情况下安全运行。

V3.6 的 Version Question 建议冻结为：

> **能否在不削弱 V3/V3.5 Authority、State 和 Evidence 边界的前提下，让用户通过 WebUI 在一个登记项目中提交自由文本 Coding Task，并得到服务端铸造、由唯一选定后端有界执行、Session State 固定、跨进程可继续且可检查的真实 Agent Run；同时把 managed Workspace 中的结果形成不可变 ChangeSet，经用户审查后由宿主侧安全写回登记 Source？**

V3.6 不再验证 Skill/Policy 改善效果，也不继续演化 Harness State。它是产品化增量，而不是新的自进化研究版本。

## 2. 审查范围与事实基线

### 2.1 当前权威事实

**Fact：** CURRENT_STATE.md 将项目标记为 v3_5_completed / V3_5_CLOSED_ACCEPTED，active_goal: null。本轮没有 V3.6 实施授权。

**Fact：** V3.5 已接受的能力包括：

- 基于 Pi public JsonlSessionRepo 的 settled Session 持久化、列出、重新打开和继续；
- Session != Run 的明确分层；
- Session / Run / Evidence 的安全 Read Model；
- loopback-only Local API 与 inspectability-first WebUI；
- V3 Harness State 的候选、验证、Promote/Reject/Rollback 与只读 lineage 展示。

证据：docs/reports/V3_5_CLOSEOUT.md。

**Fact：** Post-V3.5 Product Smoke 已接受一条真实的两 Turn、跨进程、同 Session 连续链路；两 Turn 均通过各自冻结的 Verifier/Outcome。但它使用的是一次性固定 Authority 和固定 Prompt，不是开放式任务入口。

证据：docs/reports/POST_V3_5_PRODUCT_SMOKE_TEST_REPORT.md、docs/reports/POST_V3_5_MAINTENANCE_CLOSEOUT.md。

**Historical Fact：** 本报告编制时，工作树存在未提交的 WebUI 中英双语维护改动及 `OPEN_AGENT_UI_PRODUCTIZATION_DESIGN_RECOMMENDATION.md`。随后完成的 Control Baseline housekeeping 已将前者作为 additive post-V3.5 presentation maintenance 验收，将后者作为非 Spec 的设计 provenance 保留；处置和回归证据见 `docs/reports/V3_6_CONTROL_BASELINE_HOUSEKEEPING_REPORT.md`。

### 2.2 证据优先级

本报告按以下顺序判断：

1. 当前固定源码、测试和实际 Git 状态；
2. CURRENT_STATE.md、V3/V3.5 Closeout 和已接受控制文档；
3. 当前 Open Agent UI 设计建议；
4. 用户附件；
5. Sandbox / Execution Backend 官方文档；
6. 本报告的工程推断。

附件是高优先级规划输入，不是冻结 Spec。

## 3. 当前代码与规划的吻合度

### 3.1 可以直接复用的能力

| 现有能力 | 真实入口 / Symbol | V3.6 用法 | 判断 |
| --- | --- | --- | --- |
| Direct Pi Agent Runtime | workbench/src/session/real-smoke-turn-v35.ts → createPostV35RealSmokeTurnExecutor；Pi packages/agent/src/harness/agent-harness.ts → AgentHarness | 继续作为唯一主 Runtime | reuse |
| Pi public Session persistence | Pi packages/agent/src/harness/session/jsonl-repo.ts → JsonlSessionRepo.create/open/list/fork；公开导出于 packages/agent/src/index.ts | 开放 Session 的创建、重开、继续；必要时显式 fork | reuse |
| Workbench persistent Session | workbench/src/session/persistent-session-v35.ts → PersistentSessionServiceV35.create/executeTurn/inspect | 保留 Session/Run 关系和跨进程继续 | reuse + thin extension |
| Web application boundary | workbench/src/webui/application-v35g3.ts → WorkbenchApplicationV35G3.createSession/continueSession | 增加项目选择、服务端 Authority minting 和 safe projection | adapt |
| Loopback HTTP server | workbench/src/webui/server-v35g3.ts | 继续保持 loopback-only；浏览器只提交不敏感输入 | adapt |
| Tool path boundary | workbench/src/pi/tool-profile.ts → createBoundedToolProfile；workbench/src/workspace/path-policy.ts | 继续承担文件工具的 canonical-path、reparse、writable/protected 检查 | reuse |
| Managed workspace copy | workbench/src/workspace/temp-copy.ts → createTemporaryWorkspace | 从登记 Source 生成无 symlink/junction、digest-verified 的隔离副本 | reuse + extend |
| File/tree identity | workbench/src/hash.ts → fileSha256/treeInventory/treeDigest | Source snapshot、ChangeSet preimage/postimage 和 stale 校验 | reuse |
| Immutable evidence | workbench/src/evidence/artifacts.ts → writeOnceJson/writeOnceBytes | Authority、Run、binding、terminal evidence 继续 write-once | reuse |
| Harness State authority | workbench/src/state/store-v3.ts；workbench/src/state/binding-v3.ts → freezeRunBindingV3 | 读取和固定 Active State；开放 Run 不获得 mutation authority | reuse |
| Safe Read Model / WebUI | workbench/src/read-model/、workbench/src/webui/ | 展示 Session、Run、messages、tools、state/binding 和 evidence | reuse + additive projection |

**Fact：** Pi 的 AgentHarness、Session、JsonlSessionRepo 都从 pi-agent-core 的公开入口导出。V3.6 不需要 Pi Core patch，也没有证据要求切换 SDK、Extension 或 RPC。

### 3.2 真正缺少的能力

V3.6 只应新增以下五项产品能力：

1. **Project Profile Registry**：宿主侧登记项目、可写范围、保护范围、逻辑命令、Verifier 能力、执行后端和预算预设；浏览器只看到 opaque project_id 与安全说明。
2. **Interactive Run Authority Minter**：服务端生成 Session/Run ID，绑定用户 Prompt digest、Project/Profile digest、State digest、代码身份、工具能力、执行后端和预算，并在 Credential/Provider dispatch 前持久化。
3. **Session State Pinning**：同一 Session 默认继续使用创建时固定的 code/state/profile/backend；使用最新 Active State 必须新建 Session，V3.6 不做 in-place upgrade。
4. **Interactive Evidence Semantics**：开放任务默认标记为 unverified、adaptation_eligible: false，不伪造 passed/failed。现有冻结 Case 的 Verified Run 仍走原路径。
5. **Execution Backend for project commands**：通过有界 Selection Gate 选出恰好一个成熟后端，把 Agent 可能影响的项目代码执行从宿主机直接 spawn 中隔离出去；文件工具仍复用当前路径策略。
6. **Controlled Change Handoff**：从 managed Workspace 形成不可变 ChangeSet，交由用户审查，再由宿主以逐文件 preimage、protected-path 和 artifact-integrity 校验安全 apply 或 fail closed。

不需要新建 Agent Loop、Session 数据库、Trace 系统、State Store、Eval Runtime、Router 或 Experience Repository。

## 4. 对附件建议的逐项处置

| 附件建议 | 处置 | 修正后的含义 |
| --- | --- | --- |
| Open Interactive Agent Mode | accept | 开放 Prompt，不开放 Authority |
| Thin Project Registry | accept | 只用 host-owned 配置/文件；不建数据库和多用户项目管理 |
| Dynamic Authority Minter | accept | 新 schema、新 namespace；不修改历史 PostV35RealSmokeAuthority 语义 |
| Session State pinning | accept | continue=pinned；latest=new Session；in-place upgrade deferred |
| code/state/evidence identity 分离 | accept | 每个 Run 写入三类 digest/identity；不做大型版本平台 |
| inspect_only / bounded_edit | modify | inspect_only 只用安全只读工具；bounded_edit 只有在执行后端 Gate 通过后开放项目命令 |
| Interactive vs Verified | accept with correction | 自由任务默认为 unverified；仅预先冻结 Verifier 的已登记任务可称 Verified |
| 有代表性的 Sandbox 候选池 | accept with bound | 先统一 broad screening，shortlist 不超过 3；只有最终两项仍接近时才允许 tiny deterministic PoC；最终只实现一个 |
| 先建立通用多后端抽象 | reject | 只在一个选中后端加现有 local adapter 能证明接口稳定时建立薄 port；不设计插件平台 |
| 默认独立审计 | modify | 仅当实现触及 command execution、Credential、Authority 或 safe projection 高风险边界时做一次 focused audit |
| 多轮自然任务 + UX review + polish 多阶段 | simplify | 合并为一个真实产品验收 Session；普通 UI 修复留在原实现 Session |
| Adaptation UI / 自动学习 | reject for V3.6 | 保持只读 lineage；不创建 refinement/promotion 入口 |
| managed_session_copy | accept | 保持当前 temporary-copy 路线，不改成 worktree-first |
| Change Handoff | accept with implementation correction | 新增不可变 ChangeSet + user review + host-controlled apply；不建设 Git patch/merge 平台 |

## 5. Execution Backend Selection Gate

### 5.1 当前 Host Runner 的事实边界

**Fact：** createBoundedToolProfile 对 read/list/search/edit/write 使用 Workspace path policy，并且命令由项目侧预先登记、shell:false 执行。浏览器和模型不能直接提交任意 argv。

**Fact：** 注册命令仍通过 Node spawn 在宿主机执行。即使文件工具只能写 Workspace，Agent 修改后的 package.json、build script、test fixture 或源码仍可能在随后执行测试时访问宿主文件系统或网络。

因此当前能力可以称为：

~~~text
path-bounded file tools
+ host-frozen command descriptors
+ process timeout/output budget
~~~

不能称为 OS sandbox、network-egress isolation 或 untrusted project-code containment。这与 workbench/README.md 和 V0-A/V3.5 的既有限定一致。

### 5.2 V3.6 最小 Threat Model

V3.6 只处理以下边界：

- 浏览器不能指定宿主路径、命令、Credential 或 Provider 配置；
- Agent 只能修改 Session 的 managed disposable Workspace；
- 项目命令及其 descendant/subprocess 不能直接在无隔离宿主环境执行；
- 项目命令默认不能访问外部网络；
- CPU、内存、进程数、墙钟时间和输出有明确上限；
- Provider/Credential 留在宿主侧，绝不注入项目执行环境；
- Verifier/Acceptance Authority 位于 Agent 不可写边界外；
- 每次执行记录 backend identity、image/snapshot identity、policy digest 和退出状态。

V3.6 不承诺防御宿主内核或底层 Sandbox runtime 漏洞，也不建设生产多租户安全平台。

### 5.3 Claude Code 的有限参考位置

Claude Code 只作为成熟 local coding-agent 的设计边界参考，不是 V3.6 runtime 或 backend 候选。可转移的不变量是：

- **Tool Permission/Approval 与 OS isolation 是两层不同控制。** Permission 决定某个工具调用能否尝试；Sandbox 约束 Bash 及其子进程实际能访问的 filesystem/network。
- deny/ask/allow 需要显式优先级，blocked/denied/approval 状态应在 UI 中可解释；
- file-tool policy 不能证明 subprocess containment；
- Sandbox 不可用时，安全要求模式必须 fail closed，不能静默无隔离执行；
- filesystem 与 network containment 必须同时考虑，且 descendant process 继承同一边界；
- broad write path、Unix socket 或 unsandboxed escape hatch 都可能破坏隔离声明。

一手参考：[Claude Code permissions](https://code.claude.com/docs/en/permissions)、[Claude Code sandboxing](https://code.claude.com/docs/en/sandboxing)。本地只读源码镜像中的 reference/src/utils/sandbox/sandbox-adapter.ts、reference/src/utils/permissions/permissions.ts 和 reference/src/cli/structuredIO.ts 可用于后续核对具体模式；其版本与完整 provenance 未建立，不能证明最新产品行为，也不授权复制模块。

本项目不复刻 Claude Code 的通用 Permission 平台。V3.6 继续使用 host-owned Project Profile、两种固定 capability profile 和用户对最终 ChangeSet 的显式 apply/reject。

### 5.4 Gate 唯一问题

Selection Gate 只回答：

> 对当前 Windows + TypeScript + Pi + registered local project + persistent Session + managed_session_copy 产品模型，哪个成熟 Execution Backend 最适合作为 V3.6 唯一实现后端？

Gate 是 adoption selection，不是 Sandbox 技术综述，也不提前假定 Docker、Daytona 或其他候选胜出。

### 5.5 Broad Screening

候选池覆盖少量有代表性的路线：

| 类别 | 候选 |
| --- | --- |
| local / local-first | Docker / Docker Desktop、OpenSandbox、Gondolin、microsandbox、Windows Sandbox |
| managed / remote | Daytona、E2B、Fly Sprites、Modal、Cloudflare Sandbox |

统一比较矩阵至少包含：

~~~text
execution model: local / remote
isolation boundary
Windows compatibility
TypeScript integration
Pi/Harness integration complexity
managed_session_copy compatibility
local repo copy/import/sync cost
persistent workspace / reconnect
child-process containment
filesystem containment
network control
resource limits
secret / credential handling
stdout/stderr/exit/timeout observability
snapshot/fork if relevant
operational dependency
cost and licensing
maturity
estimated V3.6 glue-code weight
~~~

Broad Screening 可以快速淘汰候选，但必须写明与当前项目 requirement 的具体不匹配原因，最终得到 shortlist <= 3。

当前一手资料已经证明不同路线各有真实能力，但不足以提前决定 winner：

- Docker 提供 network-none、bind mount 和资源约束，Windows 可经 Docker Desktop 使用；[Docker network none](https://docs.docker.com/engine/network/drivers/none/)、[bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)、[resource constraints](https://docs.docker.com/engine/containers/resource_constraints/)。
- Daytona 提供 TypeScript SDK、隔离环境和 networkBlockAll，但带来云端 Credential、remote workspace 与运维依赖；[Daytona SDK](https://www.daytona.io/docs/en/typescript-sdk/)、[network limits](https://www.daytona.io/docs/en/network-limits/)。
- E2B 提供命令、文件和 reconnect/pause 能力，但 deny-by-default network 契约仍需 Gate 内确认；[E2B Sandbox API](https://e2b.dev/docs/sdk-reference/js-sdk/v2.1.2/sandbox)。
- OpenSandbox、Cloudflare Sandbox、Gondolin、microsandbox 和 Windows Sandbox 分别代表 self-hosted platform、cloud container、experimental microVM、embedded microVM 和 Windows-native VM 路线；它们进入 broad screen 不等于进入实现。

### 5.6 Deep Selection 与可选 tiny PoC

只深挖 shortlist，重点回答：

1. 与 managed_session_copy 是否自然兼容；
2. command execution 如何映射回现有 ToolResult / Trace；
3. backend/image/policy identity 如何进入 Authority 与 Run Manifest；
4. network/mount/resource/cleanup 是否能形成可复核证据；
5. Credential、Harness State、Authority Root、Verifier authority 是否留在 backend 外；
6. Windows 本机 prerequisite、许可证和用户维护负担；
7. 是否需要改变 Direct Pi Runtime；
8. 是否会迫使项目建设 generic remote sync 或显著增加版本重量。

若 desk research 已有明显 winner，不做 PoC。只有最终两个候选仍接近且关键差异无法从一手资料确定时，才向用户单独申请对 final 2 做 tiny deterministic PoC。PoC 最多验证：

~~~text
create environment
copy/import tiny workspace
read/edit
run one registered Node command
collect stdout/stderr/exit/timeout
test network and workspace boundary
cleanup/reopen if relevant
~~~

PoC 不调用 LLM、不读取项目 Credential、不发展成 backend implementation。

### 5.7 Selection Result 与停止条件

Gate 必须输出 exactly one V3.6 execution backend，并记录来源、版本/服务、License、prerequisite、验证方式和未覆盖边界。V3.6 不同时实现两个 backend。

若所有成熟候选都明显不适合，回到用户决策：

~~~text
A. V3.6 降级为 inspect_only
B. 接受一个明确的 managed/cloud prerequisite
C. 暂停 V3.6
~~~

不得在同一 Goal 中因普通 implementation bug 连续切换 backend；不得静默 fallback 到 host command execution 后继续声称 sandboxed bounded_edit。

## 6. 最小数据与 Authority 设计

### 6.1 Project Profile

建议使用一个 host-owned、tracked-or-local-config 的薄 Registry。最小字段：

~~~yaml
project_id: opaque stable id
display_name: browser-safe name
source_root_ref: host-only, never projected
workspace_strategy: managed_session_copy
writable_paths: frozen allowlist
protected_paths: frozen allowlist
command_descriptors: host-only logical ids + structured argv
verifier_profile_id: optional, host-owned
execution_backend_profile_id: host-owned
budget_profile_id: host-owned
change_handoff_policy_id: host-owned
profile_digest: immutable digest
~~~

浏览器安全投影只包含 project_id、显示名、模式、能力说明和风险提示；不返回路径、argv、env、Credential ref 或完整 policy。

### 6.2 Interactive Run Authority

不要扩大或覆写 PostV35RealSmokeAuthority。创建新 schema，服务端在 dispatch 前 write-once 持久化：

~~~yaml
schema_version: new interactive authority version
mode: interactive_agent
run_id: server-generated
session_id: server-generated or validated existing id
project_id: opaque id
project_profile_digest: frozen
prompt_digest: frozen
workspace_identity_before: frozen
code_identity_before: frozen
source_snapshot_identity: frozen
harness_state_digest: frozen
tool_profile_digest: frozen
execution_backend_identity: frozen
provider_model_identity: host-selected
budgets: frozen
verification_mode: unverified | registered_verifier
adaptation_eligible: false
source_mutation_authority: host_controlled_user_approved_only
authority_digest: immutable
~~~

浏览器只提交：

~~~text
project_id
requested_mode: inspect_only | bounded_edit
task_text
session_id（仅继续已有 Session 时）
optional title
~~~

Run ID、Profile、命令、预算、Provider、Credential、Verifier 和 backend 都由宿主侧解析与生成。

### 6.3 Session pinning

Session 创建时固定：

- project_profile_digest；
- workspace/session_workspace_id；
- harness_state_digest；
- execution_backend_profile_digest；
- provider/model policy id；
- authority schema version。

每个 Turn 都必须 cross-check 这些值。发生 drift 时 fail closed，不自动升级。

V3.6 用户操作只需要：

- **Continue pinned Session**；
- **New Session with current Active State**。

显式 Fork from Session 可在 Pi public JsonlSessionRepo.fork 和现有 catalog 适配很薄时加入；否则后移。Upgrade Session in place 明确不做。

### 6.4 Evidence pollution prevention

开放 Run 使用独立 mode/schema/namespace，并写入：

~~~yaml
verification_status: unverified
formal_outcome: null
adaptation_eligible: false
comparison_eligible: false
promotion_eligible: false
~~~

只有事先由 Project Profile 指向、在 Agent 不可写边界外冻结的 Verifier 才能产生正式 Outcome。用户自由文本、Agent 自写测试或 UI 显示的“任务完成”都不能升级为 passed。

V3/V3.5 历史 Evidence 不回填、不迁移、不重解释；Read Model 按 schema/mode 做 additive projection。

## 7. Execution Backend 的最小接入边界

### 7.1 推荐接口形态

不要先设计通用 Sandbox 平台。只需要围绕现有命令工具形成一个窄 port，例如概念上的：

~~~text
executeRegisteredCommand({
  backend_profile,
  session_workspace,
  command_descriptor,
  timeout,
  output_budget
})
→ { stdout, stderr, exit_code, timed_out, backend_evidence }
~~~

实现上优先采用以下之一：

1. 给 createBoundedToolProfile 增加可选 command executor，默认保留历史路径所用 host executor，V3.6 路径注入唯一 selected-backend executor；或
2. 仅替换 run_command tool，而其他 read/list/search/edit/write 工具保持不变。

选择哪一种应由实现前 source design 决定。禁止把多个候选做成插件市场或配置 DSL；V3.6 运行路径在 selected backend 不可用时必须 fail closed。

### 7.2 Workspace 关系

首版使用每个 Session 一个 managed disposable Workspace：

~~~text
registered source
→ controlled copy/session workspace
→ file tools operate on that workspace
→ selected backend executes registered commands against same workspace
→ before/after inventory + diff persisted
~~~

容器只获得这一个 Workspace 的写挂载。不得挂载：

- 仓库上层目录；
- .git 凭据或用户 home；
- .runs authority root；
- Harness State store；
- Credential 文件；
- Docker socket；
- Verifier/Acceptance Criteria authority。

若 Project Profile 无法在这样的环境中运行，它不是 V3.6 首版支持项目；不要为兼容它扩大 backend。

## 8. Managed Workspace Change Handoff

### 8.1 为什么必须补齐

**Fact：** createTemporaryWorkspace 已经能从 digest-verified Source 创建拒绝 symlink/junction 的普通文件副本；treeInventory/treeDigest 能形成稳定逐文件身份；writeOnceJson/writeOnceBytes 和 ArtifactRef 能形成不可变证据；path policy 已有 writable/protected/reparse 防线。

**Fact：** 当前没有把 managed Workspace 改动安全写回 registered source 的产品路径，也没有 ChangeSet schema、用户 apply/reject 或 source preimage stale protection。

因此 Change Handoff 与真实代码兼容，但它是 Goal 2 的新能力，不能写成已有事实。

### 8.2 Authority invariant

> **Agent 可以修改 managed Session Workspace，但没有 registered Source mutation authority。**

冻结路径：

~~~text
Registered Source Project
→ host snapshot
→ managed Session Workspace
→ Agent edits
→ selected-backend commands/tests
→ Run settled
→ immutable ChangeSet
→ WebUI user review
→ Apply All / Reject / Export
→ host-controlled apply
→ Registered Source Project
~~~

浏览器的 Apply 请求只引用 immutable change_set_digest；不能携带 host path、替换内容、patch text 或绕过策略的字段。真正写 Source 的能力只存在于 host-owned handoff service。

### 8.3 最小 ChangeSet

~~~yaml
change_set:
  schema_version: 1
  project_id: <registered-project-id>
  session_id: <id>
  run_id: <id>
  source_snapshot_identity: <digest>
  project_profile_digest: <digest>

  changes:
    - path: <project-relative-path>
      operation: modify | add | delete
      before_sha256: <digest-or-absent>
      after_sha256: <digest-or-absent>
      after_blob_ref: <immutable-artifact-ref-or-null>

  change_set_digest: <digest>
  status: proposed
~~~

ChangeSet 必须由 initial Source inventory 与 settled managed Workspace inventory 确定性计算，并把 add/modify 的最终 bytes 存为 write-once blob。Human-readable diff 只是安全 UI projection，Apply 不能重新解析展示用 diff。

### 8.4 Host-controlled Apply

Apply 前逐项执行：

1. 重新验证 ChangeSet envelope、digest、ArtifactRef、blob size/hash；
2. 重新解析 Project Profile，确认 project/profile/Source identity 未被替换；
3. 对 modify/delete 验证当前 Source file SHA-256 等于 before_sha256；
4. 对 add 验证目标仍 absent；
5. 拒绝 protected path、writable scope 外路径、absolute/traversal/reparse 路径；
6. 对整个 touched set 完成校验后才开始写入；
7. 使用同目录临时文件 + atomic rename 写 add/modify，delete 使用明确目标；
8. Apply 后重新计算 touched file 与 Source identity，写入不可变 apply receipt。

若 Session snapshot 中 foo.ts=SHA_A、Agent 结果为 SHA_B，而当前 Source 已变为 SHA_C，则 SHA_C != SHA_A 必须产生 conflict 并 fail closed。

首版只支持 Apply All。禁止：

- silent overwrite；
- automatic merge；
- LLM-driven conflict resolution；
- per-hunk apply；
- 绕过 preimage/stale/protected/tamper 检查；
- Agent 或 backend 直接写 registered Source。

**工程修正：** Amendments 建议 Apply All，但若多文件写入中发生宿主 I/O failure，单纯逐文件 rename 不能提供跨文件事务原子性。V3.6 不因此建设数据库或通用事务系统；Goal 2 必须至少先完成全量 preflight，并在 receipt 中如实记录 partial_apply_error。若实现无法给出可恢复且不误报成功的最小语义，应 Hard Stop，而不是声称 all-or-nothing。

### 8.5 最小 UI

~~~text
Changes

src/foo.ts        Modified
src/helper.ts     Added
test/foo.test.ts  Modified

[View Diff]
[Apply All]
[Discard]
[Export ChangeSet]
~~~

Source drift 时显示明确 blocked 原因。Discard 只关闭/标记提案，不改 Source；Export 只导出 immutable ChangeSet 与 blobs，不自动解决冲突。

Git worktree、branch、commit、merge 和 per-hunk UI 全部 deferred。除非 Selection Gate 证明 managed_session_copy 根本不可成立，否则 Goal 内不得自行替换 workspace strategy。

## 9. 推荐实施顺序与 Session 划分

V3.6 应使用 **两个 Goal**，而不是多阶段链。

### Phase 0 — Main 控制收口（非实施 Goal）

1. 用户审阅本报告；
2. 单独验收并收口当前未提交的中英双语 UI 维护，或明确将其排除；
3. 完成一次有界 Execution Backend Selection Gate：broad screen → shortlist <= 3 → deep selection，只有 final 2 仍接近时才另行申请 tiny PoC；
4. Main 提交 exactly-one backend 的选择建议；用户接受唯一 backend，或选择 inspect-only / 暂停；
5. Main 起草并冻结 V3_6_CHARTER.md；
6. 创建干净 Control Baseline。

### Goal 1 — Open Authority and Pinned Session Control Plane

**Owner：** 新的独立顶层 Implementation Session。

**真实调用：** 0。

**Scope：**

- Project Profile Registry 与 safe projection；
- server-generated Session/Run identity；
- Interactive Authority mint + write-before-dispatch；
- Session code/state/profile/backend pinning；
- unverified / adaptation_eligible:false 语义；
- WebUI 项目选择、自由 Prompt、明显的 mode/authority/risk 展示；
- Faux/deterministic end-to-end，继续同一 Session；
- 保持历史 V3/V3.5 schema 与 smoke path 不变。

**Exit Criteria：**

- 浏览器无法提交路径、命令、Credential、Provider、预算或 Verifier；
- Authority 在任何外部访问前持久化；
- Session drift fail closed；
- 自由任务永不伪装成 formal pass；
- 当前 V3.5 与 Post-V3.5 regressions 通过；
- 无 Pi 修改、无外部访问。

### Goal 2 — Bounded Execution, Change Handoff and Real Product Acceptance

**Owner：** 新的独立顶层 Implementation Session；真实验收由另一新的 no-source-edit Execution Session 完成。

**Scope：**

- 接入 Decision Gate 选中的一个 backend；
- inspect_only 和 backend-backed bounded_edit；
- 一个或少量已登记的代表项目 Profile；
- 命令 ToolResult/Trace、backend evidence、timeout/cleanup；
- managed Workspace initial/final inventory 与 immutable ChangeSet；
- WebUI Changes review、Apply All、Discard、Export；
- host-controlled apply、preimage/stale/protected/tamper fail-closed 和 apply receipt；
- safe UI status/error projection；
- deterministic containment regressions；
- 一条真实、自然、两 Turn 的用户产品路径。

**Exit Criteria：**

- 项目命令不在宿主机直接执行；
- backend fail closed，不能静默 fallback 到 host；
- Credential 不进入 Workspace/backend/model-visible evidence；
- 网络、资源、mount、image 和 cleanup policy 均有可复核证据；
- 同一 Session 两 Turn 保持 pinned state/profile/backend；
- Agent/backend 对 registered Source 没有直接写权限；
- settled managed Workspace 可确定性形成 immutable ChangeSet；
- Apply 只接受服务端已持久化 change_set_digest，且只由 host-owned service 执行；
- unchanged preimage 时 Apply All 成功并产生可复核 receipt；
- stale preimage、protected/out-of-scope path、tampered envelope/blob、reparse path 均 fail closed；
- Discard 保持 registered Source 字节不变；
- UI 可回看 conversation、tools、diff/trace、authority、unverified 状态、Changes 与 apply/discard 结果；
- 真实产品路径只需证明可用性与边界，不做效果比较或统计 claim。

### 审查策略

- Main 对每个 Goal 做轻量验收；
- 普通 TypeScript、HTTP、CSS、fixture、serialization、Docker argv 问题返回原 Session 正常修复；
- 不默认创建独立审计；
- 只有 Candidate 实际改动 command execution、Credential、Authority persistence 或 HTTP safe projection 的高风险边界时，才在真实调用前创建一次 focused audit；
- 不建立 Readiness Gate、R1/R2、Replacement Run 或多轮 Amendment 链。

预计最多：两个 Implementation Session、零或一个 focused audit Session、一个 no-source-edit Real Product Acceptance Session。数量是复杂度检查点，不是完成上限。

## 10. 验证方案

### 10.1 Mechanism tests

建议集中在一组小而明确的机制测试，而不是新建大型 Eval。至少覆盖：

1. project ID 能解析，浏览器路径/命令字段被拒绝；
2. Authority 在 credential/model dispatch 前 write-once；
3. Session continue 使用原 pinned state/profile/backend；
4. Active State 改变后旧 Session 不漂移，新 Session 才获得新 State；
5. 自由任务记录为 unverified 且不能进入 adaptation/promotion；
6. inspect_only 拒绝写工具和 project command；
7. backend 不可用时 fail closed，无 host fallback；
8. backend 看不到 Credential、state store、authority root 和宿主其他目录；
9. network/resource/timeout/cleanup 证据完整；
10. V3.5 persistent Session、Read Model、WebUI、Post-V3.5 smoke faux regression 不回退。
11. unchanged touched Source preimage → Apply All 成功且 bytes 等于 immutable after blob；
12. touched Source drift → Apply blocked，Source 不被静默覆盖；
13. protected/out-of-scope/reparse path 出现在 ChangeSet → reject；
14. tampered ChangeSet envelope、digest、ArtifactRef 或 blob → reject；
15. Discard → registered Source 保持不变。

### 10.2 Real product path

V3.6 不需要重新做 24-cell 比较，也不需要 Skill treatment。建议只冻结：

- 一个已登记项目；
- 一个新建 Session；
- 两个自然连续 Turn；
- 第一个 Turn 进行受控修改并运行登记检查；
- 第二个 Turn 基于第一 Turn 结果解释、调整或补充；
- settled 后产生 immutable ChangeSet，用户在 UI 查看 Changes/diff；
- 用户显式执行一次 Apply All 或 Discard；若 Apply，则检查 registered Source 与 apply receipt；
- 一组明确预算；
- 无 Retry/Fallback/Replacement；
- 最终由用户查看 UI 是否能理解“做了什么、在哪运行、改了什么、为什么仍是 unverified、哪些改动等待应用、Source 是否已被安全更新”。

这回答的是产品可用性，不回答 Harness policy 效果。

## 11. 版本重量评估

**Judgment：V3.6 可以且应明显轻于 V3。**

理由：

- 不新增学习/诊断/候选/验证/Promote/Reject/rollback 生命周期；
- 不做 A/B、多路径恢复或统计 Eval；
- 主要复用 V3.5 Session、Read Model、WebUI 和 Post-V3.5 real executor 经验；
- 新建的核心只有 Registry、Authority、Pinning、一个 execution adapter 和一个受控 Change Handoff；
- 只做一个真实产品 Journey。

使 V3.6 变重的主要风险不是 UI，而是 Sandbox 横向选型和“支持任意项目”的诱惑。控制方法是：

~~~text
one selected backend
one fixed image/snapshot family
one or few registered projects
two capability profiles
one real journey
no backend marketplace
no arbitrary shell/install/network
~~~

若执行过程中出现第二个 backend、通用远程 Workspace 同步层、容器编排控制面、依赖构建服务或多租户认证，说明已经偏离 V3.6。

## 12. Non-goals

V3.6 不建设：

- 任意 Shell、Package Install、联网浏览或 Git Push；
- Sandbox platform / backend marketplace；
- Kubernetes、远程机器池或多租户控制面；
- Adaptation 操作 UI、automatic learning 或 state promotion；
- Memory、Vector DB、Router、Curator、Experience Repository；
- IDE、terminal emulator、Git GUI；
- in-place Session State upgrade；
- 多 Provider/Model 切换 UI；
- Pi SDK/Extension/RPC 路线切换；
- Pi Core patch；
- 对开放任务自动生成并授予权威 Verifier；
- 统计意义上的 Agent 效果评估。
- 通用 Permission/Approval 平台；
- Git worktree-first、branch/commit/merge lifecycle；
- per-hunk apply、自动 merge 或 LLM conflict resolution。

## 13. 主要风险与 Hard Stops

### 13.1 主要风险

1. **Host execution leak**：项目命令仍在宿主执行，却被 UI/报告称为 sandboxed。
2. **Authority confusion**：浏览器输入被直接转换成路径、argv、budget 或 verifier authority。
3. **State drift**：旧 Session 在不显式新建/fork 的情况下使用了新 Active State。
4. **Evidence pollution**：开放任务的自述完成被写成 formal pass 或进入 adaptation dataset。
5. **Mount overreach**：backend 获得 source parent、home、Credential、.runs 或 Docker socket。
6. **Dependency trap**：为了“任意项目”开始动态安装依赖或开放网络。
7. **Backend sprawl**：一个 Goal 同时实现 Docker 与云端 Sandbox。
8. **Accepted-path regression**：修改共用 tool/session/evidence 代码导致 V3/V3.5 历史路径变化。
9. **Direct Source mutation**：Agent、backend 或浏览器绕过 Handoff 直接写 registered Source。
10. **Stale overwrite**：Source 在 Session 期间变化，Apply 未核验 preimage 即覆盖。
11. **ChangeSet tamper**：UI diff、artifact envelope 或 after blob 被替换后仍被 Apply。
12. **Partial apply ambiguity**：多文件 Apply 中途失败，却被报告为完整成功或无法恢复。

### 13.2 Hard Stops

命中以下任一项应暂停并交回 Main/用户：

- 需要 Pi Core 修改、SDK/Extension/RPC 切换；
- 需要删除或弱化 path、protected file、Credential、Authority、State 或 evidence fail-closed 检查；
- 浏览器必须提供宿主路径、命令、Credential 或 Provider 配置才能运行；
- 选中 backend 无法证明 host mount、network、resource 或 cleanup 边界；
- backend 失败后只能退回 host command execution；
- Verifier/Acceptance Criteria 必须放入 Agent 可写 Workspace；
- 必须引入第二个 backend、容器编排平台或通用 remote sync 才能满足 Goal；
- 需要 arbitrary install/network/push 才能完成代表 Case；
- 开放 Run 无法与 Verified/Adaptation evidence 分离；
- Agent/backend 必须获得 registered Source direct-write authority；
- ChangeSet Apply 无法验证 source preimage、protected/writable scope、ArtifactRef/blob identity 或 reparse boundary；
- 多文件 Apply 失败后无法准确给出 applied/not-applied 状态，或会把 partial result 伪装成成功；
- 为 Change Handoff 必须建设 Git GUI、branch/merge 平台、自动 conflict resolution 或新 Harness protocol；
- V3.6 工作量开始接近 V3 的 Goal/审计/返修链，且无法通过删减项目或模式收窄。

## 14. 用户需要再次决定的事项

~~~yaml
user_decisions_required:
  - decision: accept_or_revise_v3_6_scope
    evidence: V3.6 can be a two-Goal product increment using existing V3.5 substrate
    options:
      - accept recommended registered-project open-prompt scope
      - narrow to inspect-only
      - revise before Charter
    recommendation: accept registered-project open-prompt scope
    consequence: enables Charter drafting but not implementation

  - decision: disposition_of_current_uncommitted_i18n_changes
    status: resolved_accept_as_post_v3_5_presentation_maintenance
    evidence: bilingual UI delta exists but is not in accepted baseline
    options:
      - review and close it before V3.6 baseline
      - explicitly exclude it from V3.6 baseline
    recommendation: review and close it first
    consequence: ambiguous Control Baseline removed without changing accepted runtime or evidence semantics

  - decision: authorize_execution_backend_selection_gate
    evidence: current host spawn is not OS-isolated and the existing evidence does not establish a winner
    options:
      - authorize bounded broad-screen / shortlist / deep-selection later
      - narrow V3.6 to inspect-only
      - stop V3.6
    recommendation: authorize the bounded Selection Gate in a later round
    consequence: no backend, install, network, download or PoC is authorized by this Planning

  - decision: accept_exactly_one_backend_after_gate
    evidence: V3.6 must avoid both premature Docker selection and multi-backend implementation
    options:
      - accept the Gate winner
      - accept a stated managed/cloud prerequisite
      - narrow to inspect-only or pause
    recommendation: decide only after the Gate report
    consequence: required before V3_6_CHARTER freeze

  - decision: session_state_policy
    evidence: pinning prevents silent behavioral drift and reuses existing immutable State authority
    options:
      - continue pinned and create new Session for latest State
      - add explicit fork if thin
      - require in-place upgrade
    recommendation: pinned continue; optional thin fork; no in-place upgrade
    consequence: controls Session metadata and UI actions

  - decision: open_run_outcome_semantics
    evidence: arbitrary prompts do not have an independent frozen acceptance oracle
    options:
      - default unverified and keep registered Verified flows separate
      - attempt dynamic formal verification
    recommendation: default unverified
    consequence: avoids evidence and adaptation pollution

  - decision: version_goal_count
    evidence: two bounded implementation concerns exist: control plane and isolated execution/product acceptance
    options:
      - two Goals
      - three or more Goals
    recommendation: two Goals
    consequence: keeps V3.6 materially lighter than V3

  - decision: change_handoff_scope
    evidence: managed_session_copy currently lacks a safe product path back to registered Source
    options:
      - immutable ChangeSet + user review + host Apply All
      - export-only with no host apply
      - direct Agent write to Source
    recommendation: immutable ChangeSet + user review + host Apply All
    consequence: adds a bounded Goal 2 product closure without adding Git/merge infrastructure

  - decision: later_real_product_acceptance_budget
    evidence: one two-Turn journey is sufficient for the V3.6 usability claim
    options:
      - freeze one bounded two-Turn journey later
      - no real acceptance
      - expand to multiple cases
    recommendation: freeze one journey only when Goal 2 candidate is accepted
    consequence: not authorized in the current round
~~~

## 15. 推荐下一步

本报告经用户审阅后，建议按以下顺序继续：

1. 已完成中英双语 UI 维护的验收/收口和 Control Baseline housekeeping；
2. Revised Planning 已通过独立审阅，不再要求继续修订；
3. 等待用户另行授权 Execution Backend Selection Gate；
4. Gate 完成 broad screening、shortlist <= 3 和 deep selection；只有 final 2 仍接近时才另行决定 tiny PoC；
5. 用户接受 exactly-one backend，或选择 inspect-only / 暂停；
6. Main 起草 V3_6_CHARTER_DRAFT.md，只冻结两个 Goal、一个 backend、Change Handoff 和一个真实 Journey 目标；
7. 用户单独接受 Charter、Activation 和 Control Baseline 后，才创建 Goal 1 Implementation Session。

当前停止点：

~~~yaml
v3_6_implementation: not_started
charter: not_created
goal_contract: not_created
execution_backend_selected: false
sandbox_poc: not_started
external_download_or_install: 0
credential_reads: 0
real_model_calls: 0
pi_changes: 0
next_action: await_separate_user_authorization_for_execution_backend_selection_gate
~~~
