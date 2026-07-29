# Agent Harness Reliability Workbench：从项目起点到当前的进展、阶段结论与完整后续规划

```yaml
document_status: current_project_synthesis_and_forward_plan
date: 2026-07-30
project_head_at_creation: fc8ce71b30d39d9bfaede6a14a2206372efdc1ec
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
current_phase: G006_closed_pending_next_phase_decision
active_goal: null
formal_workbench_created: false
final_pi_go: not_yet_formally_frozen
v0_version_charter: not_created
new_goal_authorized_by_this_document: false
real_model_call_authorized_by_this_document: false
git_commit_authorized_by_this_document: false
git_commit_authorized_by_user_after_creation: 2026-07-30
git_push_authorized_by_user: 2026-07-30
git_push_status_at_document_commit: pending_remote_configuration
```

## 1. 文档用途和证据纪律

这份文件是现阶段的项目总纲，集中回答三件事：

1. 从项目起点到 G006，我们实际做过什么；
2. 每个阶段已经得到哪些完整结论，以及哪些结论仍然不能声称；
3. 从当前节点到最小可用 Workbench、Pilot Eval 和 Portfolio-ready，应按什么顺序继续。

它不替代：

- 各 Goal Contract 的执行约束；
- ADR 中已经接受的局部架构决策；
- `CURRENT_STATE.md` 的即时授权状态；
- 后续需要用户审查的 V0 Version Charter；
- 原始 `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md` 中尚未被正式修改的长期边界。

本文件使用以下证据标签：

- **Fact**：由本地源码、本地测试、实际命令、固定 Git 身份或已接受报告直接证明；
- **Inference**：由多项事实支持，但尚未成为冻结合同；
- **Recommendation**：主 Session 对下一步的建议，需要用户接受后才转为决定；
- **Unconfirmed**：尚未动态验证、没有足够样本或没有授权冻结的内容。

外部研究、`reference/cc-harness-knowledge/` 和 `reference/src/` 只提供成熟 Harness Pattern 参考。Pi 当前做了什么，仍由固定 Pi 源码、测试和项目运行证据决定。

---

## 2. 当前一句话状态

> **项目已经完成 Pi 静态源码审计、Direct AgentHarness 确定性恢复机制验证和一次有效的真实模型端到端配对实验；当前没有激活 Goal，尚未创建正式 `workbench/`，下一步应先完成 Phase 4 的架构决策与 V0 Version Charter，而不是继续重复 Pi 基础可行性实验。**

当前已经形成三层证据：

```text
G001：固定 Pi 源码表明 Direct AgentHarness 可以组合
→ G003：Faux Provider 下的同 Session 有界恢复闭环可以运行
→ G006：真实 DeepSeek Tool Loop、Session、Journal、Verifier 路径可以运行
```

这三层证据共同证明的是：

```text
Architecture / Integration Mechanism Works
```

尚未证明的是：

```text
Completion Verification Improves Real-model Coding Performance
```

---

## 3. 从 0 到当前实际完成的工作

本节简要记录做过的事情；第 4 节完整记录每个阶段的结论。

### 3.1 项目起点：研究唯一文件和原始设想

- 阅读用户最初提供的第二项目研究与实现上下文；
- 识别项目中心目标不是重新实现 Coding Agent，而是构建 Harness Reliability Workbench；
- 将“环境级确定性验证 + Trace + Baseline/Candidate 对照”确立为核心故事；
- 识别 Completion Verification 为第一条候选 Policy；
- 判断需要 GPT 网页版 Deep Research 支撑实施前证据审查，并准备研究 Prompt；
- 深度阅读返回报告，将其作为背景材料而不是项目事实源；
- 起草并落盘当前项目规划、工作区设计、证据纪律和分阶段路线。

### 3.2 Phase 0：建立工作区和固定上游

- 初始化项目根 Git；
- 建立 `AGENTS.md`、`CURRENT_STATE.md`、Goal、ADR、Report 和 Research 目录；
- 在 `.upstream/pi/` 下载 Pi 并固定到精确 Commit；
- 建立 `.runs/` 忽略边界，用于依赖、临时克隆和运行证据；
- 明确 `.upstream/pi/` 只读、`reference/` 用户所有、`.runs/` 不提交；
- 采用 Windows 原生 PowerShell + Node.js，而没有引入 WSL；
- 建立初始项目基线 Commit。

### 3.3 G001：Pi 静态源码审计

- 完整审计 Direct `pi-agent-core`、Coding Agent SDK + Extension 和 RPC 三条候选路径；
- 建立 Source Map、Capability Matrix、Lifecycle/Session 分析和 Open Questions；
- 对公共导出、Agent Loop、Tool 生命周期、Session、Context、Compaction、Cancellation 和 Workspace 控制进行源码/测试映射；
- 将 Direct `AgentHarness` 提升为 G002 主候选；
- 完成 G001 报告、Closeout 和架构验收；
- 接受 ADR-0001。

### 3.4 G002：首次 Direct 动态 Go Gate

- 从干净项目基线激活 G002；
- 创建隔离 Pi 克隆；
- 使用 `npm ci --ignore-scripts` 安装锁定依赖；
- 在运行第一个动态 Gate 前发现 `pi-ai` 标准构建缺失生成后的 model-data；
- 停止执行，没有静默运行实时 hydration、修改 emitted-package 边界或修改 Pi Core；
- 完成受阻报告、Closeout 和架构复核。

### 3.5 G003：Artifact-backed model-data 恢复与确定性重试

- 审计 npm 发布 Artifact、完整性、文件清单和固定源码兼容性；
- 接受 ADR-0002：只从完整性固定的 `@earendil-works/pi-ai@0.82.1` Artifact 恢复 model-data；
- 保留 Pi 标准构建边界，不运行实时 Catalog hydration；
- 创建新的无硬链接 Pi 克隆；
- 恢复并用固定源码校验 38 个 model-data 文件；
- 成功构建标准 `pi-ai` 和 `pi-agent-core` emitted packages；
- 完成公共导入、Baseline、Candidate 一次恢复、Event/Session/Verifier 顺序、初始公平性五个 Gate；
- 创建确定性 Fixture、Spike、报告和 Closeout；
- 接受 ADR-0003，继续保留 Direct `AgentHarness`。

### 3.6 Harness Reference Analysis 与 G004 退役

- 完整阅读用户整理的 29 个 `cc-harness-knowledge` 语义文件；
- 建立 Knowledge Inventory、Harness Pattern Map、Pi Comparison Matrix、Risk Reclassification 和 Policy Candidates；
- 将成熟 Harness 知识映射到 Pi 的 Agent Loop、Tool、Session、Context、Permission、Planning、Skill、Subagent、Stop 和 Trace；
- 明确参考资料只能提炼 Problem、Invariant、Failure Mode 和 Applicability Boundary，不能证明 Pi 行为；
- 重新分类跨进程 Session、Crash-after-side-effect、Registry Raw Response、Cancellation、Compaction 等风险；
- 判断宽泛的 G004 不能满足 risk-to-goal gate，在 Contract 创建前正式退役；
- 将 Completion Verification 保持为第一 Policy 候选，将 Tool Result Budget 保持为后续候选。

### 3.7 G005：第一次真实模型实验及无效证据关闭

- 为 DeepSeek V4 Flash 准备被忽略的本地凭据边界和安全模板；
- 固定模型、Thinking、任务、工具、Verifier、预算和运行次数；
- 完成真实模型 Gate A；
- Baseline 实际发出 4 次 Provider 请求、完成 3 次 Tool 往返并 settled；
- 在外部 Verifier 前发现项目观察器没有看到 Provider Response，Journal 外层事件类型也可能被 payload 覆盖；
- 停止实验，没有恢复同一 Attempt、没有启动 Candidate、没有追加模型调用；
- 审计后确认主要问题位于项目观察器和 Journal Schema，而不是已经证明的 Pi Provider 路线失败；
- 将整个 G005 证据判为 `INVALID_G005_EVIDENCE` 并保留原始失败记录；
- 选择干净重试，而不是回填或修补旧证据。

### 3.8 G006：干净真实模型重试

- 先进行 G006 Pre-contract Research；
- 冻结两阶段授权：Stage 1 Gate 0 离线实现，Stage 2 单次真实模型执行；
- 新建独立 G006 Spike，共 28 个源码文件；
- 改用 `AgentHarness.subscribe(...)` 观察 `after_provider_response`；
- 建立 Journal v2 闭合外层 Envelope，将业务 payload 放入 `data`；
- 增加来源归因、错误归因、严格 TypeScript、公开 emitted import 和 Faux Provider 回归测试；
- 8/8 离线测试通过，标准 Pi 构建、公共导入和严格类型检查通过；
- 固定实现 Commit 和源码树 Digest 后才授权 Stage 2；
- 完成唯一一次真实 Baseline/Candidate 配对实验；
- 完成最终证据关联和凭据扫描；
- 用户接受 `PASS_REAL_MODEL_FEASIBILITY` 并正式关闭 G006；
- 如实记录 G006 由主 Session 执行而不是专用 Session 的流程偏差；
- 固定未来“主 Session 决策验收 + 专用 Goal Session 执行”的模式。

### 3.9 当前 Git 和控制状态

- 当前项目 HEAD：`fc8ce71b30d39d9bfaede6a14a2206372efdc1ec`；
- 本文件创建时的基线 HEAD `fc8ce71` 之前共有 9 个项目 Commit；用户随后已授权提交和 push，本次提交将成为第 10 个项目 Commit；
- G006 实现基线：`05da78bc24d6bab92dc44ee44912a57159e45e72`；
- G006 Closeout 提交：`fc8ce71b30d39d9bfaede6a14a2206372efdc1ec`；
- 固定 Pi Commit：`027a5847901b5dde30270abaa1041046cd2b4b55`；
- `.upstream/pi` 保持干净；
- 当前无 Active Goal；
- 正式 `workbench/` 尚未创建；
- `reference/` 保持用户所有、未跟踪且未修改。

项目 Git 时间线：

| Commit | 内容 |
| --- | --- |
| `e991de1` | 建立通过 G001 的研究、规划和控制基线 |
| `3723626` | 关闭受阻 G002，准备 Artifact-backed G003 |
| `62f304e` | 固化 G003 Direct Harness 确定性 Go Gate 证据 |
| `b99b25b` | 集成 Harness Reference Analysis，退役 G004 |
| `33c7e53` | 接受并激活 G005 真实模型可行性契约 |
| `2614453` | 保存并关闭 G005 无效真实模型证据 |
| `aa2d12f` | 接受 G006 干净重试契约 |
| `05da78b` | 固化 G006 Gate 0 实现基线 |
| `fc8ce71` | 接受并关闭 G006 真实模型可行性证据 |

---

## 4. 每个阶段的完整结论

### 4.1 初始研究和项目定义阶段

**Fact.** 第二项目的目标已经稳定为：构建一个自己能够实际使用的 Coding Agent Harness Reliability Workbench，通过受控 Workspace、确定性环境验证、关键 Trace 和 Baseline/Candidate 对照，判断 Harness Policy 是否改善真实任务结果。

**Fact.** 项目不以重新实现 Coding Agent 为目标；Pi 负责 Agent 执行，项目负责可靠性策略、实验和证据。

**Fact.** 第一候选 Policy 是 Completion Verification：Agent 声称完成后，由 Agent 外部的确定性 Verifier 检查；Candidate 只在首次验证失败后获得一次结构化反馈和一次有界恢复机会。

**Fact.** 项目从一开始就排除了完整 Claude Code Clone、通用 Eval SaaS、大型 Web Dashboard、Multi-Agent、MCP、通用 Sandbox、Godot 和纯 Benchmark 刷榜。

**Conclusion.** 项目的核心价值不在于“又接了一个模型”，而在于把 Harness 行为变成可控制、可观察、可验证、可对照和可回归的工程对象。

**Non-claim.** 原始研究和 Deep Research 报告不能证明固定 Pi 的具体行为，也不能代替本地源码和运行证据。

### 4.2 Phase 0 工作区和上游固定

**Fact.** Pi 已固定到 `027a5847901b5dde30270abaa1041046cd2b4b55`，包版本为 `0.82.1`，该 Commit 位于最近 `v0.82.1` Tag 之后 40 个 Commit。

**Fact.** 上游源码、个人源码、生成运行证据和用户参考资料已有清晰文件系统边界。

**Fact.** 当前环境为 Windows 原生 PowerShell、Node.js、TypeScript；没有发现需要 WSL 才能继续的阻塞。

**Conclusion.** 项目已经能够准确回答“研究和运行的是哪个 Pi 版本”“哪些是上游代码”“哪些是个人实现”“哪些证据不会进入 Git”。这满足了可复核研究和后续对照实验的基础条件。

**Non-claim.** 固定 Commit 只建立可复现边界，不等于该 Commit 已经适合最终 V0 或生产使用。

### 4.3 G001 静态 Pi 审计

**Fact.** `@earendil-works/pi-agent-core` 的根入口公开导出了 `AgentHarness`、Session、JSONL Repo、Tools 和 Harness 类型。核心入口为：

- `.upstream/pi/packages/agent/src/index.ts`；
- `.upstream/pi/packages/agent/src/harness/agent-harness.ts`，symbol `AgentHarness`；
- `.upstream/pi/packages/agent/test/harness/agent-harness.test.ts`。

**Fact.** Direct `AgentHarness` 可以显式注入 Model、Tools、Session、Thinking、Stream Options 和 `NodeExecutionEnv`，不依赖 TUI 才能构造和调用。

**Fact.** Direct 路径暴露 Provider、Message、Tool、Turn、Agent、Save Point 和 Settled 等可观察生命周期；外部 Driver 可以在 `await prompt()` 后运行 Verifier。

**Fact.** Session 支持消息、模型、Thinking、Active Tools、Compaction、Branch、Custom Entry 和 JSONL 持久化；JSONL Header 可以保留自定义 metadata。

**Fact.** Direct 路径不提供通用 Sandbox、Crash-safe Exactly-once Tool Effects、自动恢复 in-flight Provider/Tool、完整自动 Compaction Policy 或完整 Durable Runtime。

**Conclusion.** G001 的正式 disposition 是 `ACCEPT_FOR_DYNAMIC_VERIFICATION`。没有发现阻止最小 Completion Verification Spike 的静态架构问题。

**Architecture conclusion.** Direct `AgentHarness` 比 SDK Runner + Inline Extension 更窄、更容易控制和解释，因此成为动态 Spike 主候选；SDK 路径保留为后续兼容性比较；RPC 只在观察到明确隔离需求后考虑。

**Non-claim.** G001 没有证明 emitted package 能运行、同 Session Recovery 能运行、真实模型能运行，也没有授权最终 Pi Go。

### 4.4 G002 首次动态 Gate

**Fact.** G002 在任何动态 Agent Gate 或模型调用前停止。

**Fact.** 阻塞原因是固定 Pi 源码不跟踪 `packages/ai/src/providers/data/` 的生成数据，而标准 `pi-ai` build 会校验并复制该目录。

**Fact.** 依赖安装成功；阻塞属于发布/构建数据边界，不是 `AgentHarness` 构造、Tool Loop、Session 或 Verifier 的运行失败。

**Conclusion.** G002 disposition 为 `BLOCKED_G002_SETUP`。它既不是 Direct Pi Go，也不是 Pi No-Go。

**Decision.** 不允许为了绕过阻塞而静默运行可变的实时 Catalog hydration、构建私有的部分 emitted package、切换 SDK/RPC 或修改 Pi Core。

**Recovery conclusion.** 可以在一次受限重试中使用完整性固定的 npm Release Artifact 提供 model-data，但必须由固定源码自己的 validator 复核。

### 4.5 G003 确定性集成 Spike

**Fact.** 完整性固定的 `@earendil-works/pi-ai@0.82.1` Artifact 提供了 38 个所需 model-data 文件，固定 Pi 源码校验通过，标准 `pi-ai` 和 `pi-agent-core` 构建通过。

**Fact.** Direct emitted public import 通过；严格的外部 Driver 可以控制 Workspace、Task、Tools、Session 和 Verifier。

**Fact.** G003 的 Baseline 只观察验证结果，Candidate 在首次 Verifier 失败后收到结构化失败反馈，并在同一个 `AgentHarness` / Session 中完成一次受限恢复。

**Fact.** Manifest、Event Journal、Pi Session、Verifier 和 Outcome 可以关联；Baseline/Candidate 初始 Workspace 和配置可以规范化为等价；Pi Core patch 数量为 0。

**Conclusion.** G003 disposition 为 `PASS_DIRECT_GO_GATE`。Direct `AgentHarness` 的最小确定性机制成立，没有当前架构阻塞。

**Architecture conclusion.** ADR-0003 保留 Direct `AgentHarness` 作为下一阶段主实验运行时。SDK 仍是比较项，RPC 仍是条件性备选。

**Non-claim.** G003 使用固定 Faux Provider 和固定任务，只证明软件机制，不证明真实模型恢复、Policy 效果、统计提升、最终 Pi Go 或生产可靠性。

### 4.6 Harness Reference Analysis 和 G004

**Fact.** 用户已学习的 Harness 知识被映射为成熟问题和不变量，而不是复制 Claude Code 类名、目录结构或功能清单。

**Fact.** 参考分析确认：Tool Request/Result 分离、Context Budget、外置 Artifact、Critical Constraint Preservation、Session Resume、Side-effect Reconciliation、Stop Policy 等都是成熟 Harness 中的重要问题。

**Fact.** 这些 Pattern 不能证明 Pi 已支持，也不会自动升级为当前 Goal。

**Risk conclusion.** 当前风险被重新分类：

- settled Session 跨进程重建：`mature_pattern_unverified`，条件性优先级；
- crash-after-side-effect：高相关的 `future_reliability_case`，尚无观察失败；
- Registry Raw Response：低优先级 provenance debt；
- Long-running Tool Cancellation：成熟模式未验证；
- Context Compaction：未来 Policy/可靠性问题，不是当前阻塞；
- Pi Upstream Evolution：已知风险，通过固定 Commit 和 Adapter 管理；
- Recovery Budget：需要在 Version Charter 中由用户参与冻结；
- Strict TypeScript Consumer 和 Windows Cold Import：后来已在 G006 当前路径通过，但升级 Pi 时仍需回归。

**Conclusion.** 宽泛 G004 会把多个未验证项错误扩张成前置 Gate，不满足 risk-to-goal gate，因此在 Contract 创建前退役。没有从 G003 直接跳过 G004 编号去执行一个同名 Goal。

**Policy conclusion.** Completion Verification 仍是第一候选；Tool Result Budget / Progressive Disclosure 是最合理的第二 Policy 候选，但必须等第一 Policy 完成 Pilot 决策后再决定。

### 4.7 G005 第一次真实模型实验

**Fact.** G005 Baseline 成功发出 4 次真实 Provider 请求、完成 3 次 Tool 往返并 settled，说明真实 Provider/Tool 路径至少部分可达。

**Fact.** 项目使用 `harness.on("after_provider_response")` 观察响应，但固定 Pi 的 `emitOwn()` 实际只通知 `subscribe()` 总订阅者；类型和文档表面与实际 dispatch 语义不完全一致。

**Fact.** G005 Journal 将业务 payload 的 `type` 展开到外层，可能覆盖闭合事件 Envelope 的 `type`，破坏事件身份。

**Fact.** 外部 Verifier 尚未运行，Candidate 没有启动；因此不能根据保存的原始 `FAIL_REAL_MODEL_ROUTE` 将问题归因给 Pi 或 Provider。

**Conclusion.** G005 的正式 disposition 是 `INVALID_G005_EVIDENCE`，不是 `FAIL_PI`。项目观察器和证据 Schema 的缺陷使整次实验不能作为 Phase 3 Gate。

**Corrective conclusion.** 必须保留 G005 原始证据，禁止回填；修复应进入新的、预先固定源码身份的干净 Attempt。

**Learning conclusion.** 公共类型声明不足以证明 Runtime dispatch；对关键 Trace 必须同时检查固定源码，并用 Provider Request、Subscriber Response、Assistant Message、Response ID 和 Session 进行独立关联。

### 4.8 G006 干净真实模型重试

**Fact.** Gate 0 固定了 28 个 G006 源码文件和 Digest；公开 emitted import、公共 emitted types、严格 TypeScript、Pi 标准构建和 8/8 离线回归测试通过。

**Fact.** G006 使用 `subscribe(...)` 观察 Provider Response，Journal v2 采用闭合 Envelope：

```text
schemaVersion, seq, timestamp, type, runId, sessionId, cycle, data
```

**Fact.** 唯一一次真实配对 Attempt 使用：

```yaml
model: deepseek-v4-flash
thinking: high
attempts: 1
variants: [baseline, candidate]
provider_requests_total: 8
provider_requests_each_variant: 4
tool_starts_each_variant: 3
tool_ends_each_variant: 3
verifier_runs_each_variant: 1
goal_duration_after_first_provider_ms: 55470
pair_cost_usd: 0.0016993088
```

**Fact.** Baseline 和 Candidate 都完成真实 Tool Coding Cycle、settled 后外部 Verifier、Session/Tool Call/ToolResult/Event/Outcome 关联，并都在首次 Verifier 通过。

**Fact.** Candidate 的 Recovery 没有触发；这符合 Policy 条件，而不是缺失记录。没有人为制造失败，没有第二 Attempt、备用模型或额外 Verifier。

**Fact.** 推理正文和签名没有持久化；最终凭据扫描覆盖 54 个文件，0 命中；Pi Core patch 数量为 0。

**Conclusion.** G006 disposition 为 `PASS_REAL_MODEL_FEASIBILITY`，已由用户接受并关闭。真实 Direct `AgentHarness` + DeepSeek + Tool + Session + 外部 Verifier 路线可行。

**Mechanism conclusion.** G003 已证明确定性恢复机制，G006 已证明真实运行和证据路线。两者合并后，继续用单个任务追逐一次失败的边际价值很低。

**Non-claim.** G006 没有证明真实模型 Recovery 成功、Completion Verification 提升成功率、Candidate 成本趋势、多任务泛化、最终 Pi Go、V0 架构冻结或生产可靠性。

**Governance conclusion.** G006 Contract 声明应由专用执行 Session 运行，但实际由主 Session 实现、执行和首次复核。用户接受本次证据并免除额外独立审计；未来执行 Goal 必须采用主 Session 决策/验收、专用 Goal Session 执行/报告的边界。

---

## 5. 当前对 Pi 的完整认识

### 5.1 Pi 在项目中的正确角色

**Conclusion.** Pi 最适合作为 Workbench 的 Agent 执行引擎，而不是 Workbench 本身。

```text
Pi Agent Core
  负责 Model / Provider / Tool Loop / Message / Session / Runtime Events

Project Pi Adapter
  负责固定 Pi 配置、公共 API 适配、事件投影和上游隔离

Reliability Workbench
  负责 Task / Workspace / Baseline-Candidate / Policy / Verifier
  / Budget / Fairness / Journal / Outcome / Report / Regression
```

这种分层使个人贡献与上游能力清楚：我们不把 Pi 的 Agent 能力包装成自己的实现，而是把可靠性实验、证据和 Policy 管理作为个人工作。

### 5.2 Direct AgentHarness 是公共、可组合、非交互入口

**Fact.** `packages/agent/src/index.ts` 从包根导出 `AgentHarness` 及相关 Session/Tool 类型。

**Fact.** `packages/agent/src/harness/agent-harness.ts` 的 `AgentHarness` 构造器显式接收 Session、Models、Model、Thinking、Tools、System Prompt、Tool Context、Stream Options 和 Retry；`prompt()`、`waitForIdle()`、`subscribe()`、`abort()`、`compact()` 和工具更新都是明确方法。

**Fact.** `packages/agent/test/harness/agent-harness.test.ts` 覆盖构造、settled、awaited listener、Tool hooks、abort、工具配置和 Session 行为；`agent-harness-stream.test.ts` 覆盖 Provider Request/Payload 和 Stream Options。

**Conclusion.** 当前固定 Commit 不需要 TUI 隐藏状态即可运行 Direct Harness，也不需要通过 Coding Agent App 才能完成最小工作台循环。

### 5.3 生命周期边界足以支撑外部顺序 Driver

**Fact.** `AgentHarness.handleAgentEvent()` 在 `message_end` 持久化消息；在 `turn_end` 刷新 pending Session 写入并生成 save point；在 `agent_end` 刷新写入、把 phase 置为 idle、发出 `agent_end`，最后发出 `settled`。

**Fact.** `waitForIdle()` 等待当前 run promise；相关测试证明它会等待外部 run settlement 和 awaited listeners。

**Conclusion.** Workbench 应在 Harness 外层顺序编排：

```text
prompt
→ await settled
→ run deterministic verifier
→ make policy decision
→ optional one bounded recovery prompt
→ final verifier/outcome
```

**Boundary.** 不应从 `settled` callback 内重入启动复杂恢复；当前已验证的是外层顺序 Driver。

### 5.4 Tool Runtime 能观察和修改，但没有 Exactly-once

**Fact.** `packages/agent/src/agent-loop.ts` 在 Tool 执行前验证参数，调用 `beforeToolCall`，发出 Tool Start/Update/End，允许 `afterToolCall` 修改内容、details、error、usage 和 terminate，随后写入 Tool Result Message。

**Conclusion.** Completion Verification 可以完全位于 Agent Tool 之外；它不需要修改 Pi Tool Runtime。

**Gap.** Pi 没有把 Tool 副作用、Tool Result 持久化和进程恢复放入同一事务。进程在副作用完成、结果持久化前崩溃时，Workspace 和 Session 可能分叉。

**Current treatment.** V0 不建设通用事务平台；发生这种情况时，先通过 Workspace/Git 状态检查和 Failure Taxonomy 把 Run 标为 invalid 或需要人工 reconciliation。

### 5.5 Session 是可持久化树状 Transcript，不是完整 Durable Runtime

**Fact.** `packages/agent/src/harness/session/session.ts` 的 `Session` 支持消息、配置变化、Custom Entry、Compaction、Branch Summary、Label、Session Name 和 `moveTo()`。

**Fact.** `JsonlSessionStorage` 使用 JSONL Header + append-only entries，并通过 leaf entry 记录当前分支；`JsonlSessionRepo` 支持 create/open/list/fork。

**Fact.** Header metadata 可以保存外部 `run_id`；G003/G006 已证明 Run、Session 和外部 Journal 可以关联。

**Conclusion.** Pi Session 适合作为 Agent Transcript 和恢复材料，Workbench 仍需单独保存 Run、Attempt、Workspace、Policy、Budget、Verifier 和 Outcome 状态。

**Unconfirmed.** “进程 A settled 后退出，进程 B 打开 JSONL、重建 Model/Tools/Harness 并继续”在源码上有公开构件，但当前项目尚未完成跨进程动态验证。

**Absent.** Pi 不能恢复正在进行中的 Provider 请求、未知完成状态的 Tool 副作用或内存队列。

### 5.6 Context 和 Compaction：有机制，没有冻结的长期策略

**Fact.** Direct Harness 支持 context hook、显式 `compact()`、Compaction Entry、Branch Summary 和根据当前 Session 分支重建 Context。

**Fact.** Direct 路径没有 Coding Agent 应用层那样完整的自动阈值/overflow compaction 和应用级 retry policy。

**Conclusion.** V0 应通过任务规模、Token Budget、Tool Result Budget 和显式 Policy 限制 Context；不应在当前阶段建设通用 Context 平台。

**Future candidate.** 当 Pilot 暴露 Tool Result 过大或上下文压力时，第二 Policy 可以采用“完整 Artifact 外置 + 摘要 + 可回读引用”的 Progressive Disclosure。

### 5.7 Workspace 和执行环境可控制，但 Pi 不是 Sandbox

**Fact.** `packages/agent/src/harness/env/nodejs.ts` 的 `NodeExecutionEnv` 可以显式设置 `cwd`、shell path、shell env、每次执行的 env 和环境继承行为。

**Fact.** 路径解析仍允许绝对路径，Pi 进程继承启动者的 OS 权限。

**Conclusion.** Workbench 可以创建受控临时 Workspace、固定 CWD 和环境以实现实验公平性，但不能把这种控制描述为安全 Sandbox。

**Boundary.** Container 或 OS Sandbox 只有在出现真实安全/隔离需求并经用户授权后才进入路线。

### 5.8 公共事件 API 有真实语义陷阱

**Fact.** `AfterProviderResponseEvent` 出现在 `AgentHarnessEventResultMap`，表面上可通过 `on()` 注册。

**Fact.** 当前 `AgentHarness.emitOwn()` 只遍历总订阅者集合；Provider Response 通过 `emitOwn()` 发出。因此 G005 的 `on("after_provider_response")` 没有收到事件，而 G006 的 `subscribe()` 收到了全部 8 个响应。

**Conclusion.** 这是固定 Pi 的类型/文档/dispatch 语义不一致，但存在公共无 patch 规避路径，不构成当前 No-Go。

**Architecture implication.** 所有 Pi 事件接入都应集中在自己的 Adapter 中，并用关联计数/ID 验证，而不是让 Workbench 各模块直接依赖上游细节。

### 5.9 model-data 是构建与供应链边界

**Fact.** 固定源码缺少生成后的 Provider model-data，而标准 build 需要它。

**Fact.** 完整性固定的 npm Artifact 包含发布时 model-data；固定源码自己的 validator 能验证恢复结果。

**Conclusion.** 这不是 Agent Runtime 架构失败，但说明 Pi 源码 Checkout 不等同于自包含的离线发布构建输入。

**Current rule.** 继续使用精确 Artifact、Integrity、SHA、文件清单和固定源码校验；不把 Release-era model-data 当成当前 Provider 可用性或价格证据。

### 5.10 真实 DeepSeek 路线已经可用，但 Provider 不应写死到领域层

**Fact.** G006 已证明固定 Pi 的 OpenAI-completions 兼容路径能够处理 DeepSeek V4 Flash、high thinking、Tool Calls、多轮 Tool Result 和 reasoning replay。

**Conclusion.** DeepSeek 可作为当前低成本真实执行 Provider，但 Workbench Contract 应记录 Provider/Model Descriptor，而不是让 Completion Policy 或 Outcome 依赖 DeepSeek 特有字段。

**Non-claim.** 一次成功配对不证明其他 Provider、模型、Thinking Level 或长期稳定性。

### 5.11 Direct、SDK 和 RPC 的最终关系

| 路径 | 当前定位 | 理由 |
| --- | --- | --- |
| Direct `pi-agent-core` `AgentHarness` | V0 主运行时候选 | 公共、窄、可控制、无 TUI、零 Core patch，G003/G006 已动态通过 |
| Pi Coding Agent SDK + Inline Extension | 后续兼容性比较项 | 应用层更成熟，但依赖面更宽；用于验证 Policy 是否能进入真实 Pi Coding Agent 使用形态 |
| RPC / Process Adapter | 条件性备选 | 只有观察到进程隔离能解决的具体问题才值得承担协议、子进程和恢复复杂度 |
| 其他 Runtime | No-Go 后备 | 当前没有触发放弃 Pi 的证据 |

### 5.12 对 Pi 的综合判断

**Inference.** 原计划的 Pi Go 条件——可编程固定任务、无隐藏 TUI、关键 Tool 生命周期可观察、Tool/Context 可处理、Policy 可切换、Outcome 可附着、Session 可关联、Workspace 可控制、无大 Core Fork、数据流可解释——已经分别获得 G001/G003/G006 证据支持。

**Recommendation.** 在 V0 Version Charter 中给予 Direct `AgentHarness` 一个“V0 范围内的 Pi Go”，同时保留精确 Commit、Adapter 边界、已知缺口和升级重审条件。

**Not yet decided.** 当前没有一份已接受的 V0 Version Charter，因此项目控制状态仍不把它写成最终 Pi Go 或永久架构冻结。

---

## 6. 当前候选系统架构

```text
CLI / Main Controller
  └─ Run Plan
      ├─ Task Manifest
      ├─ Variant: Baseline | Candidate
      ├─ Workspace Factory
      ├─ Pi Direct Adapter
      │   ├─ AgentHarness
      │   ├─ NodeExecutionEnv
      │   ├─ Pi Session / JSONL
      │   ├─ Provider / Model Descriptor
      │   └─ Restricted Tool Profile
      ├─ Event Journal v2
      ├─ Deterministic Verifier
      ├─ Completion Verification Policy
      ├─ Budget / Guardrail
      ├─ Outcome / Invalid Run Classification
      └─ JSON + Markdown Report
```

### 6.1 Pi 负责

- Model/Provider 调用；
- Agent Loop；
- Tool 参数验证与执行；
- Assistant/ToolResult 消息；
- Session Transcript；
- Direct Harness 生命周期。

### 6.2 Workbench 负责

- Task 和 Fixture 身份；
- 临时 Workspace；
- Baseline/Candidate 初始公平性；
- Verifier；
- Policy Toggle 和恢复预算；
- Event Journal；
- Run/Attempt/Session 关联；
- Token/Latency/Cost 预算；
- Outcome 和 Invalid Run；
- Report、Eval 和 Regression Case。

### 6.3 当前候选数据 Artifact

以下 Artifact 已在 Spike 中出现，但正式 Schema 仍需 Version Charter 冻结：

- `TaskManifest`；
- `RunManifest` / `PairManifest`；
- `SourceIdentity`；
- `WorkspaceIdentity`；
- `RunSessionLink`；
- `EventJournalV2`；
- Pi Session JSONL；
- `VerifierResult`；
- `PolicyDecision`；
- `BudgetUsage`；
- `Outcome`；
- JSON / Markdown Report。

---

## 7. 当前技术栈及相对原计划的变化

| 项目 | 当前状态 | 与原计划关系 |
| --- | --- | --- |
| TypeScript | 保留 | 符合原计划 |
| Node.js 24.x | 保留 | 满足固定 Pi 的 Node 要求 |
| Windows PowerShell + `npm.cmd` | 保留 | 当前已通过构建、严格类型和真实运行；不需要 WSL |
| Pi Agent Core | 保留 | 符合原计划 |
| Direct `AgentHarness` | 当前主候选 | 取代原先 SDK Runner + Inline Extension 的首要位置 |
| Pi Coding Agent SDK / Extension | 保留比较项 | 后移到兼容性验证，不是当前主 Runner |
| JSON / JSONL / Markdown | 保留 | 已用于 Journal、Session、Outcome 和报告 |
| Git + 临时 Workspace | 保留 | 已在 Spike 中验证；真实仓库阶段再评估 Worktree |
| DeepSeek V4 Flash | 当前真实可行性 Provider | 新增的实验选择，不是领域架构依赖 |
| WSL / Bun | 未引入 | 没有观察到需要它们的阻塞 |
| SQLite / Web UI / Container / MCP / Multi-Agent / Godot | 未引入 | 继续保持非 V0 范围 |

**Important correction.** 原计划 Phase 5 的“Pi SDK Runner”应在 Version Charter 中更新为“Pi Direct Adapter + AgentHarness”；SDK Runner 保留为后续兼容性检查。这个变化来自固定源码和 G003/G006 动态证据，不是为了追逐新技术。

---

## 8. 当前能够声称和不能声称的内容

### 8.1 可以声称

- 固定 Pi Direct `AgentHarness` 是公共、可编程、非交互入口；
- 当前 Windows/Node/TypeScript 路径可以构建和严格消费 emitted packages；
- 可以控制 Workspace、模型、Thinking、Tool Profile、Session 和预算；
- 可以在 settled 后运行外部确定性 Verifier；
- 可以在同 Session 中完成一次确定性有界恢复；
- 可以建立 Baseline/Candidate 初始公平性；
- 可以关联 Manifest、Journal、Session、Verifier 和 Outcome；
- 当前 DeepSeek V4 Flash 真实 Tool 路线可行；
- 不修改 Pi Core 也能实现上述机制；
- 项目已发现并修复自身观察器/Journal 证据缺陷。

### 8.2 不能声称

- Completion Verification 已改善真实任务成功率；
- Candidate 一定优于 Baseline；
- G006 已观察到真实模型恢复；
- 单次成本差异代表 Policy 成本；
- Pi 已具备 Crash-safe Exactly-once、通用 Sandbox 或完整 Durable Resume；
- 当前结果可以泛化到其他模型、任务和上游 Commit；
- V0 架构、Outcome Schema、Failure Taxonomy 和 Promotion Threshold 已冻结；
- 正式 Workbench 已经完成；
- 项目已经 Portfolio-ready。

---

## 9. 从当前节点开始的完整规划

### 9.1 当前决策点：是否追加 Phase 3B

存在两个合理选项：

#### 选项 A：追加受限 Phase 3B Recovery Activation Case

目标是选择一个容易自然暴露首次完成失败的任务，再观察 Candidate 是否在真实模型下被 Verifier 激活并恢复。

优点：

- 在进入 Charter 前获得一次真实 Recovery 路径记录。

缺点：

- 为了得到失败而选任务，容易产生任务选择偏差；
- 再多一个单案例仍不能估计成功率；
- 会继续消耗 Phase 3，而不是开始建设可重复 Eval 的 Workbench。

#### 选项 B：组合 G003 + G006，并把自然 Recovery 观察延后到 Pilot Eval

依据：

- G003 已证明同 Session 一次恢复机制；
- G006 已证明真实 Provider/Tool/Session/Verifier 路线；
- Pilot 的预先固定任务集和重复 Trial 更适合观察自然 Failure、Recovery 和 Guardrail。

**Recommendation.** 选择选项 B。不要创建一个只为追逐失败的 Phase 3B。把“真实 Recovery 至少被自然激活并产生可解释 Outcome”写入 Pilot 的进入/完成条件。

**Current authority.** 该建议尚未自动成为用户接受的架构决定，也没有因此创建新 Goal。

### 9.2 Phase 4：V0 Version Charter

#### 目标

在开始正式 `workbench/` 前，把已经有证据支持的机制冻结为一个范围明确、可验收的 V0 版本。

#### Charter 必须由主 Session 和用户决定

1. **Pi Go 范围**
   - 是否接受 Direct `AgentHarness` 作为 V0 Runtime；
   - 固定哪个 Pi Commit；
   - 什么情况触发升级或 No-Go 复审。

2. **架构边界**
   - Pi Direct Adapter；
   - Workbench 与 Pi 的责任；
   - SDK/RPC 的非 V0 地位；
   - 禁止 Pi Core patch，除非出现单独 ADR。

3. **数据合同**
   - Task、Run、Attempt、Variant、Session、Workspace、Verifier、Policy、Budget 和 Outcome 的最小字段；
   - Journal v2 Envelope；
   - Source/Artifact/Provider identity；
   - Reasoning 和 Secret 的禁止持久化边界。

4. **Outcome 与 Failure Taxonomy**
   - `passed`、`failed`、`invalid`、`unconfirmed` 的精确定义；
   - Agent failure、Verifier failure、Infrastructure failure、Evidence failure、Budget exhaustion 的最小分类；
   - 不允许把观察器失败误报为 Agent failure。

5. **Completion Verification Policy**
   - Baseline 只观察；
   - Candidate 只在首次 Verifier 失败后恢复；
   - Recovery 次数上限；
   - Feedback 内容和截断规则；
   - Stop/Abort/Budget 规则。

6. **Workspace 和公平性**
   - 初始字节等价或规范化等价；
   - 环境、工具、模型、Prompt、Verifier 和预算一致；
   - 运行后 Workspace 独立；
   - Git Worktree 是否进入 V0，仍以真实仓库需求决定。

7. **Eval 设计边界**
   - Pilot Task Set 的来源和纳入标准；
   - Trial 数量和成本上限；
   - Invalid Run 如何补跑；
   - Promotion/Revise/Reject 门槛必须在看结果前冻结。

8. **Portfolio-ready 条件**
   - 一次真实使用；
   - 一个确认的真实 Failure/Regression；
   - 一次 Policy 决策；
   - 可解释的指标和 Guardrail；
   - 上游与个人贡献边界。

#### Phase 4 交付物

- 一份 V0 Version Charter；
- 必要的 ADR 更新或新 ADR；
- 一份被用户接受的实现 Goal Contract；
- 明确的 Definition of Done、Pause Conditions 和非目标；
- 不包含正式实现或真实模型执行。

#### Phase 4 完成条件

```text
用户能够明确回答：
V0 做什么、为什么用 Pi、什么算成功、什么算无效、
第一条 Policy 如何工作、哪些风险故意后移、何时停止。
```

### 9.3 Phase 5：实现最小可用 Workbench

正式 `workbench/` 只在 Version Charter 被接受后创建。建议拆成几个可独立验收的版本，而不是一次写完整平台。

#### V0.1：Contracts、CLI 和 Workspace Foundation

实现候选：

- 最小 CLI：`run`、`compare`、`inspect`；
- Task Manifest 读取与验证；
- Run/Attempt/Variant ID；
- 临时 Workspace 创建和初始 Digest；
- 配置规范化与不可变 Snapshot；
- Pi Direct Adapter 的公共接口；
- Faux Provider 的默认测试入口。

完成条件：

- 不调用真实模型也能创建一个可复核 Run；
- 无效配置在任何副作用前失败；
- Baseline/Candidate 初始输入可证明等价；
- Pi 细节集中在一个 Adapter 边界。

#### V0.2：Execution、Session Link 和 Evidence Journal

实现候选：

- 受限 Tool Profile；
- NodeExecutionEnv；
- Pi Session 创建和 `run_id` metadata；
- Journal v2 Writer；
- Provider/Message/Tool/Settled 投影；
- Budget Counter；
- Source/Artifact/Provider identity；
- Secret/Reasoning 持久化防线；
- Invalid Run 路径。

完成条件：

- 一个 Faux Run 可以从 Manifest 运行到 Outcome；
- Event 顺序、Tool Call/Result ID、Session 和 Workspace 可关联；
- 中途 Evidence/Observer 故障不会被误报为 Agent failure。

#### V0.3：Completion Verification Policy

实现候选：

- 外部确定性 Verifier；
- Baseline Observe-only；
- Candidate 一次有界 Recovery；
- 结构化 Verifier Feedback；
- Recovery Budget 和 Stop Policy；
- Initial/Final Verifier Result；
- Baseline/Candidate Pair Outcome。

完成条件：

- 复用 G003 Fixture 证明失败→反馈→恢复；
- 复用 G006 Fixture 证明无需恢复时不会错误继续；
- 所有 Policy 分支都有确定性测试；
- 不需要 Pi Core patch。

#### V0.4：Report 和真实使用入口

实现候选：

- JSON Machine Report；
- Markdown Human Report；
- Run Inspector；
- 成本、延迟、Token 和预算摘要；
- 失败归因和 Evidence Link；
- 一个受限真实模型 smoke/pair command；
- 用户自己实际运行一个小型 Coding Task。

完成条件：

- 用户能够从报告追到 Manifest、Journal、Session、Verifier 和 Workspace；
- 用户能够解释 Candidate 为什么恢复或为什么不恢复；
- Workbench 可被实际使用，而不只是测试夹具。

#### Phase 5 明确不做

- Web Dashboard；
- SQLite 通用数据平台；
- MCP；
- Multi-Agent/Subagent 平台；
- 通用 Permission 系统；
- 通用 Durable Runtime；
- 完整 Container Sandbox；
- 多 Policy 编排；
- Claude Code Feature Parity。

### 9.4 Phase 6：Completion Policy Pilot Eval

#### 目标

通过预先固定的小型任务集和重复 Trial，回答 Completion Verification 是否改善 Verified Task Success，以及它带来什么成本和失败模式。

#### Pilot 设计顺序

1. 在看运行结果前冻结 Task Set；
2. 为每个 Task 定义环境级 Verifier；
3. 固定 Baseline/Candidate 公平性规则；
4. 固定模型、Thinking、Tool、Prompt、Retry、Recovery 和预算；
5. 固定 Invalid Run 处理；
6. 固定指标和 Promotion/Revise/Reject 条件；
7. 才开始执行真实 Trial。

#### 推荐但未冻结的规模

**Recommendation.** 首个 Pilot 可考虑 6–10 个小型 TypeScript Coding Task，每个 Task 做 3–5 个配对 Trial。精确数量必须根据成本、方差和用户预算在 Charter 中确认，不能由本文件静默冻结。

#### 必须报告的指标

- Verified Task Success；
- Initial False Completion；
- Recovery Trigger Rate；
- Recovery Success；
- Final Failure；
- Invalid Run Rate；
- Provider Requests；
- Tool Calls；
- Token；
- Latency；
- Cost；
- Failure Attribution。

#### 效果判断原则

- 以环境 Verifier 为主要 Outcome，不以模型自评为成功；
- 使用配对条件，避免任务/环境差异污染比较；
- 同时报告收益和 Guardrail；
- 不删除“不好看”的有效 Trial；
- Invalid Run 不混入 Policy 失败，但必须单独报告；
- 样本不足时输出 `inconclusive`，不强行 Promote。

#### Pilot 的真实 Recovery 条件

如果选择不做 Phase 3B，则 Pilot 必须记录：

- 是否自然出现首次 Verifier Failure；
- Candidate 是否被正确激活；
- 同 Session Recovery 是否完成；
- Workspace 是否得到修复；
- 成本/延迟是否在 Guardrail 内；
- 没有自然激活时，不得人为改写结果，只能报告 Activation Rate 低或样本不足。

#### Phase 6 输出

- Pilot Protocol；
- 冻结 Task Set；
- Raw Run Index；
- Aggregate Report；
- Failure Attribution；
- `PROMOTE`、`REVISE`、`REJECT` 或 `INCONCLUSIVE` 决策；
- 用户接受的决策记录。

### 9.5 Phase 7：真实使用、Fault 和 Regression 闭环

#### 目标

让项目从“实验 Runner”变成“自己使用过并能沉淀真实失败的 Reliability Workbench”。

```text
真实使用 Run
→ Failure Candidate
→ 最小复现和 Assertions 草案
→ 用户人工确认
→ Regression Case
→ Baseline/Candidate 重跑
→ Policy Promote / Revise / Reject / Rollback
```

#### 原则

- 真实使用产生的 Failure Candidate 不能自动成为 Gold；
- 必须人工确认失败是否真实、Verifier 是否合理；
- 只增加与当前 Policy 直接相关的少量 Fault；
- 不建设通用 Fault Injection 平台；
- 至少有一个真实失败进入回归资产，项目才接近 Portfolio-ready。

### 9.6 Phase 8：第二 Policy 和条件性扩展

第一 Policy 完成 Pilot 决策后，优先考虑：

```text
Oversized Tool Result
→ 完整结果外置为 Artifact
→ 向模型提供有预算的摘要
→ 保留可回读引用
→ 验证关键约束未丢失
```

选择它的理由：

- 与用户已学习的 Context、Tool Result Budget、Progressive Disclosure 直接对应；
- 容易设计确定性 Outcome；
- 不要求修改 Pi Core；
- 对长任务 Harness 和求职信号都有价值。

以下能力仍不自动进入：

- Subagent/Multi-Agent；
- MCP 生态；
- 完整 Permission 平台；
- 通用 Memory；
- Godot；
- Harbor；
- Web UI；
- 通用 Durable Runtime。

### 9.7 条件性可靠性 Case

这些问题只有满足触发条件才升级为 Goal：

| 风险 | 当前处理 | 升级触发条件 |
| --- | --- | --- |
| Settled Session 跨进程重建 | 保留为成熟模式未验证 | V0/真实使用要求跨进程 Resume，或出现 Session 丢失 |
| Crash-after-side-effect | Run invalid + Workspace/Git 检查 | 出现可复现的副作用后崩溃、重试重复修改 |
| Long-running Tool Cancellation | 保留 Abort/Timeout 预算 | Windows 长 Tool 无法终止或无法 settled |
| Context Compaction | 限制任务和 Token，显式记录 | Pilot 出现上下文溢出、关键约束丢失或成本异常 |
| Recovery Budget | 在 Charter 冻结 | 第一 Policy 正式实现前必须决定 |
| SDK Compatibility | 后移比较 | V0 已可用，且需要证明进入 Pi Coding Agent 应用形态 |
| RPC Isolation | 不实现 | 观察到进程隔离能因果解决的故障 |
| Container/Sandbox | 不实现 | 出现明确的安全或不可信代码执行需求 |
| Pi Upstream Evolution | 固定 Commit + Adapter | 升级 Pi、公共 API 改变或安全修复要求升级 |
| Registry Raw Response | 低优先级 provenance debt | 供应链事件或复现失败需要原始回执 |

任何风险升级为 Goal 都必须同时满足：

```yaml
- blocks_a_current_architecture_decision
- threatens_the_core_project_loop
- has_concrete_or_highly_specific_evidence
- cannot_be_safely_deferred
- has_bounded_scope_and_stop_condition
```

### 9.8 Portfolio Closeout

最终项目至少需要：

- 用户自己实际使用过 Workbench；
- 至少一种真实 Coding Agent Failure 被解决或严谨验证；
- Outcome 主要来自环境事实；
- Baseline/Candidate 条件可解释；
- 一个真实失败经人工确认进入 Regression Case；
- 至少一次 Policy Promote/Revise/Reject/INCONCLUSIVE 决策；
- 指标同时报告 Success 与 Token/Latency/Cost/Invalid Run Guardrail；
- Pi 上游能力、项目 Adapter 和个人 Policy/Eval 贡献边界清楚；
- 用户能够解释 Agent Loop、Tool、Session、Verifier、Recovery 和 Journal 数据流；
- README、架构图、运行示例、实验报告和限制说明完整；
- 不把单任务 Spike 或框架本身能力包装成个人效果提升。

最终作品集叙述仍应是：

> **我没有重新实现 Coding Agent；我基于 Pi 构建了一层可实际使用、可自动验证、可复现失败并能用对照实验管理 Harness Policy 的可靠性 Workbench。**

---

## 10. 后续工作方式和 Goal 治理

### 10.1 固定 Session 分工

主 Session 负责：

- 研究综合；
- 项目范围；
- Goal Contract；
- 架构和风险决策；
- 与用户讨论；
- 审阅专用 Session 报告；
- 最终 Goal 接受；
- `CURRENT_STATE.md` 和下一阶段控制。

专用 Goal Session 负责：

- 严格按已接受 Contract 实现；
- 执行命令和 Gate；
- 保存 Raw Evidence；
- 写 Report 和 Closeout Draft；
- 在 Pause Condition 停止；
- 不自行冻结架构或扩大范围。

### 10.2 标准 Goal 流程

```text
主 Session 研究和起草 Contract
→ 用户审查/接受
→ 必要时创建干净基线 Commit
→ 用户授权专用 Goal Session 执行
→ 专用 Session 实现、验证、报告并停止
→ 主 Session 阅读源码差异、命令和证据
→ 与用户决定 Accept / Revise / Reject
→ 用户单独授权 Commit 或下一 Goal
```

### 10.3 不自动获得的权限

- 创建新 Goal；
- 修改 Pi Core；
- 创建正式 `workbench/`；
- 调用真实模型；
- 追加 Attempt；
- 修改 `.upstream/pi`；
- 提交 Git；
- 引入 SDK/RPC/MCP/Multi-Agent/Container/UI。

这些都需要 Contract 或用户明确授权。

---

## 11. 现阶段推荐的下一步

### 推荐顺序

1. 主 Session 与用户正式决定：接受 G003 + G006 组合证据，并把真实 Recovery 的自然观察延后到 Pilot Eval；
2. 决定后，由主 Session只起草 V0 Version Charter，不创建 `workbench/`、不调用模型；
3. 用户审查 Charter 中的 Pi Go、Outcome、Failure Taxonomy、Recovery Budget、任务集、Eval Budget 和 Portfolio 条件；
4. Charter 被接受后，再创建第一个正式 Workbench 实现 Goal；
5. 该 Goal 交给专用执行 Session；
6. 主 Session 读取报告并进行架构验收。

### 是否需要额外大规模研究

**Recommendation.** 起草 V0 Charter 前不需要再做一次宽泛 Deep Research 或全面 Claude Code 功能研究。现有本地 Pi、G003/G006 和 Harness Reference Analysis 足以支撑 Charter。

只有在 Charter 遇到会改变架构的具体问题时，才建议开专用研究 Session，例如：

- 精确 Outcome/Invalid Run 语义需要比较成熟 Eval 系统；
- Worktree 隔离是否必要；
- 跨进程 settled Resume 是否成为 V0 硬要求；
- Pi SDK 兼容性是否必须进入 V0；
- 某个 Tool Result Budget 机制需要深入参考 `reference/src`。

研究 Session 只回答一个有界问题，主 Session 最终把关。

---

## 12. 最终现状判定

```yaml
phase_0_workspace_and_pin: complete
phase_1_pi_source_audit: complete
phase_2_deterministic_integration_spike: complete
phase_3_real_model_route_feasibility: complete_with_real_recovery_unobserved
g004: retired_before_contract
g005: closed_invalid_evidence
g006: closed_accepted_PASS_REAL_MODEL_FEASIBILITY
direct_agentharness: strongest_V0_runtime_candidate
pi_core_patch_count: 0
windows_native_path: passed_current_scope
formal_pi_go: recommended_for_V0_charter_not_yet_frozen
completion_verification_mechanism: feasible
completion_verification_effectiveness: unverified
formal_workbench: not_created
pilot_eval: not_started
portfolio_ready: false
active_goal: null
next_required_decision: defer_real_recovery_observation_to_Pilot_or_create_Phase_3B
```

**Overall conclusion.** 项目目前没有偏离“Agent Harness Reliability Workbench”的核心目标。最大的技术路线变化，是依据固定 Pi 源码和动态证据，将 Direct `pi-agent-core` `AgentHarness` 提升为主 Runtime，并把 SDK + Extension 后移为兼容性比较项。这个变化缩小了依赖面，提高了实验可控性和个人贡献可解释性。

**Overall recommendation.** 现在应停止重复证明 Pi 能否基本运行，先进入 V0 Charter；只有 Charter 经用户接受后才启动正式 Workbench 建设。同时继续诚实保留真实 Recovery、Policy Effect、Durability、Cancellation 和 Compaction 等未验证边界。
