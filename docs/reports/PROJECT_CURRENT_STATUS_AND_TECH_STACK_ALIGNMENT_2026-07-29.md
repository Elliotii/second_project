# 项目当前状态与技术栈对照报告

```yaml
report_date: 2026-07-29
project: Agent Harness Reliability Workbench
snapshot_head: 62f304e954c87f058b6880c8374069b7532b93ef
snapshot_commit_subject: "test: establish G003 direct harness go gate"
current_phase: post_G003_evidence_baseline_pre_G004_contract
active_goal: null
next_goal_candidate: G004_DIRECT_HARNESS_ROBUSTNESS
next_goal_contract_created: false
final_pi_go: not_authorized
phase_3_real_model_path: not_started
v0_architecture_frozen: false
formal_workbench_created: false
```

## 1. 报告目的与证据口径

本报告记录 G003 证据基线提交后的实际项目状态，并把实际技术路线与
`SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md` 对照。它不替代 Goal Contract、
ADR 或 `CURRENT_STATE.md`，也不授权新的实验或实现。

证据优先级如下：

1. 固定的本地 Pi 源码、实际测试和命令输出；
2. 已提交的 Goal 报告、Closeout 与 ADR；
3. `CURRENT_STATE.md`；
4. 当前规划；
5. 原始研究包和深度研究报告。

本报告用以下标签避免把结论说得过满：

- **Fact（事实）**：已经由本地文件、测试或命令输出直接支持；
- **Inference（判断）**：由多个事实推导，但不是测试直接证明；
- **Recommendation（建议）**：下一步的建议，不等同于已授权决定；
- **Unconfirmed（未确认）**：仍需要契约化验证或用户决策。

## 2. 执行摘要

**Fact.** 项目已经完成 Phase 0、Phase 1，以及 Phase 2 的核心确定性集成
Spike。G003 在固定 Pi commit 上通过了五个冻结 Gate，并已形成报告、Closeout、
架构审查、ADR 和 Git 证据基线。

**Fact.** 项目现在位于 **Phase 2 收口之后、Phase 3 之前**。下一候选工作单元是
G004 有限鲁棒性检查，但 G004 Goal Contract 尚未创建，也没有激活或执行。

**Fact.** 项目没有进入正式产品实现：没有 `workbench/`，没有真实模型调用，
没有 Phase 3 真实仓库任务，也没有冻结 V0、Completion Verification Policy、
Outcome 语义或 Eval 门槛。

**Inference.** 当前不存在无控制的技术栈偏航。实际路线与当前规划的主栈基本一致。
相对于更早的 SDK-first 构想，唯一显著的架构重心调整是让 Direct
`pi-agent-core` `AgentHarness` 成为实验主路径，同时把 SDK Runner + Inline
Extension 保留为后续真实使用路径的兼容性验证项。

**Unconfirmed.** 当前证据只证明固定任务上的技术机制成立，不证明 Policy 对真实
模型有效，也不证明最终 Workbench 已经具备可实际使用性。

## 3. 当前阶段地图

| 规划阶段 | 当前状态 | 已有证据 | 仍缺少什么 |
|---|---|---|---|
| Phase 0：工作区与上游固定 | 完成 | 根 Git、项目控制文件、`.upstream/pi`、固定 commit | 无当前阻塞 |
| Phase 1：Pi Source Audit | 完成 | G001 Source Map、Capability Matrix、Lifecycle/Session 审计、架构验收 | 后续只在新证据触发时复核 |
| Phase 2：确定性集成 Spike | 核心目标完成 | G003 Gate A–E 全部通过；固定 Task、Manifest、Policy Toggle、Event/Session Link、Outcome 和对照报告齐备 | 若干鲁棒性和消费者边界仍未验证 |
| G004：有限鲁棒性检查 | 准备起草契约 | ADR-0003 只批准准备下一检查点 | 契约、冻结范围、命令、Gate 和授权均不存在 |
| Phase 3：真实模型端到端 | 未开始 | 无 | 真实模型、微型 TypeScript 仓库任务、真实 Pi 使用路径、成本记录 |
| Phase 4：V0 Version Charter | 未开始 | 无 | 最终 Pi Go、架构、数据契约、Workspace、Policy、任务集和预算冻结 |
| Phase 5：最小可用 Workbench | 未开始 | 无正式应用 | CLI/Runner、正式数据对象、报告和真实使用路径 |
| Phase 6–8：Pilot Eval 与闭环扩展 | 未开始 | 无 | 统计性试验、Failure/Regression、Policy 生命周期和条件性扩展 |

**Inference.** 不能简单用“完成百分比”表示进度，因为后续真实模型路径、V0 实现和
Pilot Eval 的工作量明显大于前期审计。但按阶段门判断，项目已经越过“Pi 是否值得
继续做最小动态验证”的问题，尚未越过“它是否能成为可实际使用的 Workbench”的问题。

## 4. G003 实际证明了什么

### 4.1 已证明

**Fact.** 在 Pi commit
`027a5847901b5dde30270abaa1041046cd2b4b55` 和隔离的 Windows 原生运行目录中：

- 标准 emitted public runtime 和 declaration 入口可以被 G003 消费者解析；
- Direct `AgentHarness` 可以使用固定 Faux Provider 非交互运行；
- Driver 可以指定临时 Workspace，并保持 Baseline/Candidate 初始环境等价；
- 一个外部确定性 Verifier 可以在每次外部 Agent Cycle settled 后运行；
- Candidate 可以把失败摘要反馈给同一个 Harness/Session，再运行一次受限恢复 Cycle；
- Run Manifest、外部 Event Journal、Pi Session JSONL 和 Verifier 顺序可以关联；
- Baseline 按契约失败，Candidate 按契约恢复成功；
- 没有修改固定 Pi 源码，也没有引入私有包入口或 Pi Core patch。

主要证据：

- `docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_REPORT.md`
- `docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_CLOSEOUT.md`
- `docs/reports/G003_ARCHITECTURE_REVIEW.md`
- `spikes/pi-runtime/g003/driver.ts`
- `spikes/pi-runtime/g003/gates.test.ts`
- `fixtures/tasks/g003-completion-recovery/`

### 4.2 没有证明

**Fact.** G003 没有运行真实模型，没有运行真实 Coding Agent 仓库任务，没有验证
SDK/CLI 真实交互路径，也没有做重复 Trial。

因此以下内容仍为 **Unconfirmed**：

- Completion Verification 是否提升真实任务成功率；
- 额外 Recovery Cycle 的真实 Token、时间和费用是否可接受；
- 真实模型下的 Tool、Session、Compaction、Provider retry 与外部 Cycle 是否仍可稳定区分；
- 同一个 Policy Core 是否能接入 Pi CLI / Coding Agent SDK；
- Direct AgentHarness 是否应成为最终 V0 runtime；
- Outcome、Failure Taxonomy、Recovery Budget 和 Policy Promotion 门槛；
- 项目是否已经达到“自己可实际使用”的目标。

## 5. 规划技术栈与当前实际栈对照

| 能力 | 原/当前规划 | 当前实际状态 | 对齐判断 |
|---|---|---|---|
| 语言 | TypeScript | G003 Driver、测试和脚本使用 TypeScript/ESM | 对齐 |
| Runtime | Node.js 24.14.1 | 当前环境实测 `v24.14.1` | 对齐 |
| 包工具 | Windows `npm.cmd` | 当前环境实测 npm `11.11.0`；隔离运行使用 npm | 对齐 |
| Agent runtime | Pi Agent Core | 固定 Pi 的 public `pi-agent-core` emitted package | 对齐 |
| 实验入口 | Direct AgentHarness | G003 已动态通过 | 对齐，且证据比规划时更强 |
| Execution environment | NodeExecutionEnv | G003 使用显式 Node execution environment | 对齐 |
| Session | Pi Session / JSONL | G003 记录并核验 JSONL parent chain 和 run/session link | 对齐 |
| Policy orchestration | 外层顺序 Driver | G003 在 `await harness.prompt()` 外运行 Verifier 和一次恢复 | 对齐 |
| Workspace | 首个 Spike 使用临时 Workspace | G003 使用隔离生成 Workspace | 对齐 |
| 输出 | JSON/JSONL/Markdown | Manifest、Journal、Session 和 Markdown 报告均存在 | 对齐 |
| 真实使用路径 | Pi CLI / Coding Agent SDK + Compatibility Adapter / Inline Extension | 尚未运行 | 计划保留，尚未验证 |
| 正式 Workbench | 后续创建 CLI 和正式应用 | `workbench/` 不存在 | 符合阶段纪律，不是缺陷 |
| Git Worktree | 真实仓库阶段再比较 | 尚未采用 | 符合规划 |
| SQLite / HTML Report / Container | 首个 Spike 不引入 | 未引入 | 对齐 |
| MCP / Godot / Web UI / Multi-Agent | 条件性后期能力 | 未引入 | 对齐 |
| WSL / Bun | 不作为当前前置条件 | 未使用 | 对齐 |
| RPC/process adapter | 仅在出现隔离证据后考虑 | 未引入 | 对齐 |

**Fact.** 当前根仓库没有正式应用级 `package.json` 或依赖树；只有
`spikes/pi-runtime/g003/package.json` 和其 TypeScript 配置。这说明当前代码仍是
Spike 证据，不是已经成型的 Workbench 产品栈。

## 6. 与之前规划存在的出入

### 6.1 从 SDK-first 构想到 Direct-AgentHarness-first

**Fact.** 更早的候选架构以 Pi Coding Agent SDK Runner + Inline Extension 为主。
G001 发现固定 commit 已公开 Direct `AgentHarness`，ADR-0001 因而把它设为 G002/G003
实验主候选；ADR-0003 又把该选择有限延长到下一鲁棒性检查点。

**Inference.** 这是有证据、有 ADR、有范围限制的架构调整，不是无意偏航。它减少了
为固定 Spike 引入完整 Coding Agent 交互层的复杂度，同时保持 Verifier 在 Pi 外部。

**警惕。** SDK Runner 并未被永久淘汰。规划要求 V0 能进入真实 Pi 使用路径，Phase 5
的原始清单还明确写有 Pi SDK Runner。如果 Phase 3 最终完全跳过 SDK/CLI 兼容性，只把
Direct Spike 包装成产品，项目就会从“可实际使用的 Coding Agent Workbench”偏成独立
Eval Harness。这将是实质性偏离。

### 6.2 增加 artifact-backed model-data hydration

**Fact.** G002 因源码 checkout 缺少标准构建所需的生成模型数据而停止。ADR-0002 和
G003 增加了来源、版本、integrity、shasum 和文件清单固定的 npm release artifact
恢复步骤，只恢复数据文件，然后继续运行标准 `pi-ai` 和 `pi-agent-core` 构建。

**Inference.** 这是原规划没有预见的构建供应链步骤，但没有更换语言、Runtime、Pi
入口或包边界，因此属于受控的 setup 补充，不是运行时技术栈迁移。

**警惕。** 未来必须继续区分“固定源码 commit”和“用于补齐生成数据的 release
artifact”。不能把在线生成的最新 Provider catalog 静默混入固定源码，也不能把
artifact 数据当成源码 commit 自带内容。

### 6.3 在 Phase 3 前加入 G004 鲁棒性检查点

**Fact.** G003 通过后没有直接调用真实模型，而是接受了一个尚待契约化的 G004
鲁棒性检查点。候选问题包括 settled Session 重建、Windows cancellation、严格消费者
声明边界和 cold import。

**Inference.** 这会让 Phase 3 晚一个检查点开始，但不违背规划。当前规划本身已经写明
最小动态 Gate 通过后再规划 Session 重建、Windows Cancellation 和 Phase 3 真实路径。

**警惕。** G004 不能无限扩张为通用稳定性平台。它必须有有限 Gate、固定命令和明确
停止条件；否则会用“再做一点基础设施”长期推迟真实模型和真实使用路径。

### 6.4 当前规划文档的状态段已经过时

**Fact.** `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md` 的顶部和第 13 节仍描述
G001 已完成、G002 准备执行；实际项目已经完成 G003 并提交证据基线。

**Inference.** 规划的架构、技术栈和阶段结构仍可使用，但其中的“当前状态”不是实时
权威。实时状态应以 `CURRENT_STATE.md` 和最新 Goal/ADR 为准。

**Recommendation.** 后续若更新总规划，应保留原始决策历史，同时把状态段改成引用
`CURRENT_STATE.md`，避免同一状态在两个文件中持续漂移。

## 7. 当前必须警惕的风险与未确认项

| 风险/未确认项 | 当前证据 | 为什么重要 | 当前处置 |
|---|---|---|---|
| 真实使用路径未验证 | 只有 Direct Faux Provider Spike | 决定项目是 Workbench 还是仅 Eval Harness | Phase 3 必须验证同一 Policy Core 的真实 Pi 路径 |
| 最终 Pi Go 未授权 | 只有固定任务 Go Gate | 单任务不能证明完整 runtime 适用性 | G004/Phase 3 后再做架构决定 |
| Strict TypeScript consumer | `skipLibCheck: false` 会因第三方声明依赖缺失失败 | 可能影响正式包消费者和 CI 纪律 | G004 候选，不能标记为已解决 |
| Windows cold import | 一次 15 秒 cold import 超时，60 秒规范命令通过 | 可能影响 CLI 体验、测试稳定性和错误归因 | 需要可重复、显式 reset 的计时检查 |
| Settled Session 跨进程重建 | 未验证 | 决定恢复、审计和后续 replay 边界 | G004 候选 |
| 长工具 Windows cancellation | 未验证 | 决定超时后是否真正停止副作用 | G004 候选 |
| crash-after-side-effect durability | 未验证 | 可能造成重复副作用或错误恢复 | 后续契约化，不应在 G004 中无边界扩张 |
| registry raw response 留存 | G003 保存的是冻结字段重述，不是原始响应 | 影响供应链审计可追溯性 | 非阻塞缺口，未来 provenance 工具应保存 raw response |
| Pi post-release 语义仍在演进 | 固定 commit 比最近 tag 多 40 个 commit | 上游升级可能改变 public lifecycle/session 行为 | 保持 commit pin；升级必须重新审计关键 Gate |
| Policy 效果未知 | 没有真实模型、重复 Trial 或统计比较 | 不能宣称可靠性改善 | 只有 Phase 6 Pilot Eval 才能判断 |
| Recovery Budget 未冻结 | G003 仅为一次固定恢复 | 预算属于产品与评估语义 | 必须由用户审查，不能从 Spike 静默推广 |

## 8. 当前没有发生的技术栈偏移

**Fact.** 截至本报告快照，项目没有：

- 使用 WSL 规避 Windows 原生问题；
- 把 Bun 加为前置条件；
- 修改 `.upstream/pi`；
- 引入 Pi 私有 import 或大范围 Core fork；
- 静默切换到 RPC/process；
- 引入 SQLite、Web UI、MCP、Godot、Multi-Agent、A2A、容器或通用 Sandbox；
- 创建正式 `workbench/`；
- 调用真实模型；
- 把固定 Spike 结果包装成 Policy 效果；
- 冻结 V0 架构、Outcome、Failure Taxonomy、Recovery Budget 或 Promotion 门槛。

这些“不做”是当前阶段边界，不代表相关能力永久禁止。

## 9. 当前架构状态

```text
Task / Fixture
  -> temporary Workspace
  -> Direct pi-agent-core AgentHarness
  -> Pi Agent Loop + NodeExecutionEnv + Session/JSONL
  -> outer sequential Policy Driver
  -> deterministic Verifier
  -> minimal Event Journal + Run/Session link
  -> Baseline/Candidate Outcome and Report
```

**Fact.** 上述结构已在 G003 固定任务中成立。

```text
Pi CLI / Coding Agent SDK
  -> Compatibility Adapter / optional Inline Extension
  -> same Policy Core
  -> real repository task
  -> Outcome / Failure Candidate
```

**Unconfirmed.** 上述真实使用路径仍只是规划，尚无动态证据。

## 10. 下一步的合理边界

**Recommendation.** 下一步只起草并审查 G004 Goal Contract，不直接执行。契约应从以下
候选中选取有限范围，并为每项写出 setup、命令意图、pass/fail 和停止条件：

- strict emitted-package consumer 边界；
- 可重复的 Windows cold import 时序；
- settled Session 的新进程重建；
- Windows 长运行工具 cancellation。

这些只是候选，不是本报告替用户冻结的 G004 范围。

**Recommendation.** G004 完成并架构复核后，应优先决定是否授权 Phase 3。Phase 3 的
核心不是增加更多基础设施，而是用微型 TypeScript 仓库任务验证：

1. 真实模型端到端行为；
2. Baseline/Candidate 公平条件；
3. 同一 Policy Core 能否进入 Pi CLI/SDK 真实路径；
4. Session、Outcome、额外成本和关键代码路径是否可解释。

**Recommendation.** 只有 Phase 3 通过后，才进入 Phase 4 冻结 V0 Version Charter；
只有 Charter 获用户接受后，才创建正式 `workbench/`。

## 11. 当前授权边界

当前允许：

- 阅读和审查已提交证据；
- 起草、讨论和修改 G004 Goal Contract；
- 在不执行 G004 的情况下定义有限 Gate 与停止条件。

当前未授权：

- 激活或执行 G004；
- 创建 `.runs/g004`；
- 调用真实模型或使用凭据；
- 开始 Phase 3；
- 创建正式 `workbench/`；
- 改用 SDK/RPC、WSL、容器或 Pi Core patch；
- 最终 Pi Go；
- 冻结 V0、Policy 或 Eval 语义；
- 产生 Policy 效果或作品集效果数字。

## 12. 最终判断

**Inference.** 项目目前仍符合最初的核心目标：不重新实现 Coding Agent，而是在 Pi
之上构建可控制 Workspace、可记录关键运行事实、可外接确定性 Verifier、可进行
Baseline/Candidate 对照的 Harness Reliability 层。

**Inference.** 当前路线没有因为研究和 Spike 变成 MCP 平台、Multi-Agent 系统、Web
Dashboard 或通用 Eval SaaS。技术栈仍然克制，Pi 与个人代码的边界也保持清晰。

**警惕。** 最大的未来分叉不是 TypeScript、Node 或数据库选择，而是“是否真的接入
Pi 的真实使用路径”。如果后续只继续强化 Direct Faux Provider Runner，而长期不验证
SDK/CLI、真实模型和真实仓库任务，项目就会偏离“自己可实际使用的 Coding Agent
Workbench”这一原始目标。Phase 3 是检验这一点的关键门。

## 13. 证据索引

- 当前状态：`CURRENT_STATE.md`
- 当前规划：`SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md`
- G001 架构验收：`docs/reports/G001_ARCHITECTURE_REVIEW.md`
- G002 阻塞验收：`docs/reports/G002_ARCHITECTURE_REVIEW.md`
- G003 执行报告：`docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_REPORT.md`
- G003 Closeout：`docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_CLOSEOUT.md`
- G003 架构审查：`docs/reports/G003_ARCHITECTURE_REVIEW.md`
- Direct 路径决策：`docs/decisions/ADR-0001-direct-agentharness-for-g002.md`
- 模型数据恢复决策：`docs/decisions/ADR-0002-artifact-backed-model-data-for-g002-retry.md`
- 下一鲁棒性检查点决策：`docs/decisions/ADR-0003-direct-agentharness-for-bounded-robustness.md`
- G003 Spike：`spikes/pi-runtime/g003/`
- G003 Fixture：`fixtures/tasks/g003-completion-recovery/`
