# 第二项目研究与实现上游包

> **暂定项目名**：Agent Harness Reliability Workbench  
> **用途**：供用户与 Codex / 独立设计 Session 继续研究第二项目的基座、架构与实现方案。  
> **当前日期**：2026-07-28  
> **文档性质**：研究上下文与设计约束，不是已经冻结的实施 Spec。  
> **重要原则**：传递已经确认的事实、求职目标、历史取舍和失败风险；不把尚未验证的 Tool、模块、版本顺序或代码结构写成强制答案。

---

# 0. Executive Summary

用户当前计划同步推进两个项目：

```text
拾流（Shiliu）
= 真实个人视频知识库与研究 Agent
= RAG / Search / Evidence / Agentic Search / Memory / 长程产品

第二项目
= 可实际使用的 Coding Agent Harness
= Context / Tool / Session / Trace / Outcome / Reliability / 自动 Eval
```

第二项目的核心价值不是“再做一个 Agent Demo”，而是补齐拾流不自然覆盖的技术信号：

```text
TypeScript Agent Runtime
Coding Agent
Shell / File / Git / Test Tool
Deterministic Environment Outcome
Context Policy
Tool Runtime
Session / Attempt / Replay
Fault Injection
Permission / Workspace
Harness Policy Evaluation
```

当前首选研究方向是：

> **以 Pi 作为候选 Agent Runtime，通过扩展层和外部 Workbench 建设一个可实际使用的 Coding Agent Reliability 系统；从真实开发任务中采集 Trace 和自动 Outcome，定位 Harness 失败，比较 Baseline / Candidate Policy，并将有价值的真实失败沉淀为人工确认的动态回归 Case。**

但以下内容尚未冻结：

- Pi 是否最终通过 Spike；
- Workbench 应作为 Pi Extension、独立 Runner、SDK 应用还是混合结构；
- 首个 Reliability Policy 选择 Context、Tool、Completion 还是 Session；
- 是否需要自定义 Event Journal，还是 Pi Session 已足够；
- 是否在早期加入 Container / Worktree；
- Fault Injection、Replay、Policy Lifecycle 的最小实现边界；
- Godot / 游戏开发 Adapter 何时进入；
- 是否需要 MCP、Harbor 或其他外部协议 / Eval 框架。

下一步不是直接让 Codex 实现全部功能，而是：

```text
源码审计 Pi
→ 完成最小 Spike
→ 输出 2–3 种架构方案
→ 冻结第一条可验证闭环
→ 再进入 Goal 驱动实现
```

---

# 1. 资料基础与可信度说明

本文件综合四类材料。

## 1.1 用户提供的求职文章

《27届想投 Agent 方向的，先看完这篇再投》是一篇面试经验导向文章。它提供的是作者基于面试观察形成的方法论，不是完整统计研究。

应重点吸收其项目评价框架：

1. **评测集是什么；**
2. **失败 Case 长什么样；**
3. **为什么选择该方案，而没有选择另一个方案；**
4. **项目是否从真实失败中演化；**
5. **是否能讲出一个数字的故事。**

不应机械照搬：

- 对所有 2026 热点的强判断；
- 对“算法岗 / 开发岗”边界的泛化；
- 任何没有与真实 JD、项目能力和个人基础交叉验证的结论。

## 1.2 JD 能力画像资料

已有 JD 研究主要来自游戏厂与互联网厂 Agent 相关岗位，重点用于恢复市场语言和能力聚类，不代表所有岗位当前仍开放。

高频能力包括：

```text
编程与工程能力
LLM / RAG / Tool Use
Agent Loop / Planning / Memory / HITL
Workflow / State / Retry
Eval / Trace / Failure Analysis
业务场景落地
自动化测试和验证
后端、服务化、容器
自驱学习与开源输出
```

## 1.3 拾流与第二项目历史规划

主要材料包括：

- `SHILIU_COMPLETE_STRATEGY_REVISED.md`
- `FABLE5_CRITICAL_RESEARCH_CONTEXT_V3.md`
- `Fable 5 独立评审报告：拾流 + 第二项目组合.md`
- 早期 AI Game Development Workflow / Godot Harness 调研
- JD 能力画像与技术补课路线
- Claude Code / Codex Harness 学习资料和讨论

其中 Fable 评审是独立意见，不是权威决策。其开源项目事实和风险核验有参考价值；传统周数估计、强行压缩第二项目范围等结论已经被用户的真实开发速度校准，不应直接沿用。

## 1.4 2026-07-28 官方资料核验

本文件对以下当前事实参考了官方或一手资料：

- Pi 官方仓库、SDK 与 Extension 文档；
- MCP 规范；
- A2A 规范；
- LangGraph Persistence / Interrupt；
- Deep Agents 文档；
- Terminal-Bench / Harbor；
- AgentOps；
- Self-Harness、AHE、Meta-Harness 等论文。

外部项目仍需在真正实施前由 Codex 进行最新 Commit / Release / Source Audit。

---

# 2. 对最早求职文章的完整判断

## 2.1 值得作为项目总原则的内容

### 2.1.1 不按岗位名称准备，应按实际能力信号准备

文章认为 Agent 算法和 Agent 开发共享大量地基：

```text
可靠性
评测
工程细节
RAG
工具调用
Agent 平台
轨迹与反馈
```

对于用户的海投策略，这个观察有实际价值。

用户不需要因为岗位名写“算法工程师”就只准备公式和训练，也不应因为写“应用开发”就忽视 Eval、Harness 和模型边界。更合理的是阅读 JD 的：

```text
加分项
实际交付物
场景
技术关键词
团队当前缺口
```

### 2.1.2 项目不能只有 Happy Path

“失败 Case 长什么样”是检验项目真实性的高价值问题。

第二项目尤其适合准备：

- Agent 声称完成，但测试失败；
- Tool 已造成副作用，但 Session 未持久化结果；
- 大 Tool Result 挤掉关键约束；
- Retry 导致重复修改；
- Verifier 失败被误判为 Agent Failure；
- Context Compaction 后遗失任务条件；
- Permission Denial 后错误终止或越权执行。

### 2.1.3 技术选择必须有对照故事

第二项目应能回答：

- 为什么选 Pi，而不是直接 Fork OpenHands / OpenCode / Goose；
- 为什么不自己从零写 Agent Loop；
- 为什么 Environment Verifier 优于只用 LLM Judge；
- 为什么 Pi Session 可能仍需补 Event Journal；
- 为什么先做单 Agent Runtime，而不是 Multi-Agent；
- 为什么不以 Terminal-Bench 榜单为项目目标；
- 为什么 Candidate Case 必须人工确认；
- 为什么某条 Policy 被发布、拒绝或退役。

### 2.1.4 做“一个数字的故事”，不是大而全平台

文章反对：

```text
功能齐全的 Multi-Agent 平台
没有指标的 RAG Demo
纯 Prompt 多角色辩论
官方教程复刻
```

第二项目的主数字故事应优先围绕一个可靠性问题，例如：

```text
False Completion Rate
Agent 声称完成但环境验证未通过的比例
```

或：

```text
Deterministic Verdict Coverage
能够由测试和环境断言自动判定的运行比例
```

或：

```text
Fault-conditioned Task Success
在指定故障条件下仍然完成任务的比例
```

最终只选择一个作为简历主数字，其余作为 Guardrail。

## 2.2 文章需要谨慎使用的内容

### 2.2.1 它不是完整 JD 统计

文章是经验性总结，不能替代：

- 当前岗位重新检索；
- 公司 / 业务线差异；
- 用户自身能力；
- 项目可实现性；
- 真实面试反馈。

### 2.2.2 热点不等于项目需求

文章提到的：

```text
MCP
Memory
Deep Research
长 Context
Coding Agent
安全
评测
```

都值得理解，但不意味着必须进入第二项目。

选择标准应是：

```text
是否补拾流缺口
是否形成明确个人贡献
是否有真实任务需求
是否能够验证
是否能在面试中讲清边界
```

### 2.2.3 “演化”不等于先做低质量架构

项目应从失败中演化，但不需要故意从明显错误方案开始。可以使用成熟方法，关键是：

- 有 Baseline；
- 记录真实失败；
- 对修改做对照；
- 不伪造“从零探索”的故事。

---

# 3. JD 观察与能力地图

## 3.1 当前主要岗位池

### A. Agent 应用 / LLM 应用

常见要求：

- Python；
- LLM API；
- Prompt / Context；
- Tool Calling；
- Agent Loop；
- RAG；
- Workflow；
- 后端接口；
- Eval / Trace；
- 业务场景落地。

拾流是主项目，第二项目补 Runtime 深度。

### B. RAG / AI Search / Deep Research

常见要求：

- Lexical / Dense / Hybrid Retrieval；
- Query Rewrite；
- Rerank；
- Context Construction；
- Grounded Generation；
- Citation；
- Agentic Search；
- Eval / Failure Analysis。

拾流覆盖最强，第二项目只补 Coding Agent / Context Runtime / Eval。

### C. Agent Infra / Runtime / Harness

常见要求：

- Agent Loop；
- Tool Runtime；
- State / Session；
- Memory / Context；
- Trace / Observability；
- Reliability；
- Permission / Sandbox；
- Failure Recovery；
- Eval；
- Deployment。

第二项目是主项目，拾流证明真实领域应用落地。

### D. Eval / AI Quality

常见要求：

- Eval Set；
- Gold / Verifier；
- 自动与人工评价；
- Trace；
- Failure Taxonomy；
- Baseline / Candidate；
- Regression；
- Invalid Run；
- 成本与延迟。

拾流覆盖语义 / Evidence Eval；第二项目覆盖确定性环境 Eval，组合很强。

### E. AI Coding / 研发工具

常见要求：

- Coding Agent；
- Repository Understanding；
- File / Shell / Git Tool；
- Test / Build；
- 自动修复；
- Context；
- Planning；
- Trace；
- Workspace；
- Eval；
- Cursor / Claude Code / Codex 工程实践。

第二项目直接匹配。

### F. 游戏研发 AI 工具链

已有 JD 研究出现的高频任务：

- 代码审查；
- 自动化测试和优化；
- 策划配置生成；
- 程序代码生成；
- 游戏逻辑 / 关卡脚本 / UI 交互；
- 调试反馈；
- 问题定位和自动修复；
- 引擎和工具流定制；
- AI 研发中台；
- 策划 / 程序 / 美术协同。

第二项目后期加入小型 Godot Adapter 后，匹配度会明显增强。

### G. 游戏内 NPC / 多模态 / 纯算法

常见要求：

- NPC / 角色状态；
- Memory；
- 多 Agent；
- 多模态；
- RL / IL；
- PyTorch；
- 模型训练。

两个项目不是为纯模型算法或大型多模态岗位设计的，不应为了覆盖这些岗位强行扩张。

## 3.2 JD 共性地基

```text
扎实编程
真实工程闭环
Agent 与工具
状态和工作流
评测与可观测
失败恢复
业务落地
自驱输出
```

真正值得在项目中证明的是：

> 能把 LLM 变成一个有工具、有状态、有验证、有失败语义的工程系统。

## 3.3 项目之外仍需补充

两个项目不能替代：

- Python / TypeScript 基础；
- 数据结构与算法；
- 网络；
- 数据库；
- Git；
- 测试；
- 基本后端设计；
- Docker / 容器基本概念；
- 独立阅读和解释核心代码。

---

# 4. 热点技术与开源项目检索历史

本节记录“我们查过什么、得出了什么取舍”。它不是要求第二项目全部实现。

## 4.1 Coding Agent Harness / CLI Agent

2025–2026 年 Coding Agent 从 IDE 插件进一步走向终端原生 Agent：

```text
读取仓库
搜索代码
修改文件
运行命令
执行测试
根据环境反馈迭代
```

常见开源或可研究对象包括：

- Pi；
- Codex CLI；
- Claude Code（闭源产品与公开文档 / 学习实现）；
- OpenHands；
- OpenCode；
- Goose；
- mini-SWE-agent；
- Deep Agents Code；
- ForgeCode；
- 各类教学型 Harness。

当前结论：第二项目不应从零复制 Claude Code，也不应 Fork 最大最完整的系统。更合适的是：

```text
选择一个架构清楚、可实际使用、扩展边界明确的 Runtime
→ 只建设可归因的 Reliability 层
```

## 4.2 Pi / pi-agent 生态

### 官方当前结构

Pi 官方仓库目前包含：

- `pi-coding-agent`：交互式 Coding Agent CLI；
- `pi-agent-core`：带 Tool Calling 和 State Management 的 Agent Runtime；
- `pi-ai`：多 Provider LLM API；
- SDK；
- Extension API；
- Session 管理和公开 Session 数据方向。

官方也提供 Permission Gate、Dirty Repo Guard、Structured Output、Gondolin 等扩展示例，但 Pi Core 不等于默认提供通用安全边界；运行权限仍需由扩展、Workspace 或容器控制。

### 为什么适合作为首选候选

- TypeScript；
- Agent Loop 与 Provider 已存在；
- SDK / Extension 能降低 Fork Core 的需要；
- 上游能力与个人增量较容易区分；
- 可实际作为 Coding Agent 使用；
- 真实 Session / Tool / Failure 数据与项目闭环匹配；
- 用户已学习 Claude Code / Codex Harness 机制，理解成本不是从零。

### 主要风险

- TypeScript / Bun 审查成本；
- Pi 当前 Release / 包名迁移可能造成文档摩擦；
- Extension 能否捕获全部关键 Runtime Event 尚未验证；
- Tool Result 后处理边界是否足够；
- Session JSONL 是否记录 Side Effect 前后关键状态；
- 可能需要自建外层 Runner / Outcome / Report；
- Permission / Sandbox 不能假设由 Pi 自动解决。

### 当前决策

```yaml
basis_candidate:
  first_choice: Pi
  status: requires_spike
  core_patch_target: 0
```

## 4.3 Claude Code / Codex Harness 学习

用户已经系统学习或讨论：

- Agent Loop；
- Tool / ToolResult；
- Tool Result Budget；
- Context Compaction；
- Progressive Disclosure；
- Session；
- Skill；
- Subagent；
- Permission；
- Checkpoint / Resume 思想；
- Harness 与 Agent 的区分。

对第二项目的价值不是复制这些产品，而是把其中一类机制变成可验证的 Harness Policy：

```text
上游机制研究
→ 在 Pi 上重新实现窄 Policy
→ Baseline / Candidate
→ 自动 Outcome
→ 失败分析
```

“用 Codex 写代码”不是项目贡献。个人贡献必须体现在 Runtime Contract、Trace、Outcome、Fault、Policy、Eval、Failure Attribution 和发布 / 回滚决策。

## 4.4 Context Engineering

Coding Agent 长任务中，失败经常来自：

- Tool Result 过大；
- Context 膨胀；
- 关键任务条件被挤掉；
- Compaction 丢失约束；
- 重复读取；
- 历史噪声干扰下一步决策。

候选机制：

- Tool Result Budget；
- 完整结果外置；
- 摘要 + 引用回读；
- Progressive Disclosure；
- Context Projection；
- Compaction；
- Progress Summary；
- Critical Constraint Preservation；
- Subtask Context Isolation。

当前取舍：这是第二项目最值得进入主线的能力之一，但第一版只需选择一个真实故障，例如 Oversized Tool Result 或 Compaction 后关键约束丢失。

## 4.5 Tool Runtime 与 Completion Verification

主要问题：

- Timeout；
- Malformed Result；
- Tool Error 没有进入 Agent Observation；
- Side Effect 已发生但结果未保存；
- Retry 导致重复副作用；
- Agent 在测试失败时声称完成；
- Tool Budget 被绕过。

当前取舍：第二项目必须至少有一项真正改变 Agent 行为的 Runtime Policy。只做 Trace / Report 不足以成为强 Harness 项目。

Completion Verification 特别适合 Coding Agent：

```text
Agent Final Answer
→ Test / Build / Assertions
→ pass / continue / fail
```

## 4.6 Session、Durable Runtime 与 Replay

热点机制：

- Session；
- Run；
- Attempt；
- Resume；
- Fork；
- Crash Recovery；
- Replay；
- Idempotency；
- Checkpoint；
- Side-effect Deduplication。

拾流 V5-A 可能使用 LangGraph 做应用级 Durable Workflow；第二项目研究的是 Coding Agent Runtime 自身。

当前取舍：第二项目可以做 Session Reliability，但不必最早同时实现完整 Checkpoint 平台。应先验证 Pi Session 保存了什么、哪些 Runtime Event 不在 Session 中、Side Effect 发生与持久化之间是否存在空窗，以及 Resume / Retry 的最小可靠性问题是什么。

## 4.7 Trace / Observability / AgentOps

AgentOps 更像一个领域概念和现成观测工具集合，关注 LLM / Tool 事件、成本、延迟、Trace、Debug、Monitoring 和 Analytics。

当前取舍：第二项目不需要再做一个通用 AgentOps 平台。应只记录支持核心问题的事件：

```text
Model Turn
Context Transform
Tool Request
Tool Start
Tool Result
Tool Error
Policy Decision
Verifier
Retry
Stop Reason
Outcome
User Intervention
```

目标是 Failure Attribution，而不是 Dashboard 功能数量。

## 4.8 Terminal-Bench 与 Harbor

Terminal-Bench 用真实终端环境和测试验证 Agent 的复杂任务完成能力。Harbor 是用于指定沙箱任务、运行 Agent Eval 和优化的框架，并作为 Terminal-Bench 2.0 的 Harness。

值得参考：

- Task + Environment + Test；
- Trial；
- Agent Adapter；
- Container；
- Reward / Outcome；
- Invalid Run；
- Repeated Runs。

不适合作为第二项目初始 Runtime：

- 它偏 Benchmark / Eval；
- 日常 Coding Agent 体验不是主目标；
- 整体集成会扩大范围；
- 排行榜分数容易受模型、Harness、预算和任务版本影响。

正确位置：

```text
后期 Task / Environment Adapter 参考
而不是 MVP 内核
```

## 4.9 Fault Injection

候选故障：

- Oversized Tool Result；
- Timeout；
- Malformed Tool Result；
- Provider Error；
- Context Overflow；
- Permission Denial；
- Process Crash；
- Verifier Failure；
- Partial Side Effect。

当前取舍：Fault Injection 很适合证明 Reliability，但不能在基础 Trace / Outcome 尚未成立时先建一个大型故障平台。首轮只选择 1–3 种与 Policy 直接相关的故障。

## 4.10 Permission / Sandbox / Workspace

Coding Agent 可以读写文件、执行命令、访问网络、使用凭证和修改 Git 仓库。

可用机制：

- Tool Preflight；
- Allowed / Forbidden Paths；
- Command Policy；
- Dirty Repo Guard；
- Git Worktree；
- Temporary Workspace；
- Docker / Container；
- MicroVM / Sandbox Extension；
- HITL Approval。

当前取舍：不自研通用 Sandbox 平台。第一阶段只需：

```text
受控 Workspace
+ Tool Preflight
+ 可复现 Task Environment
```

更强容器化可在故障实验或 Godot Adapter 时加入。

## 4.11 MCP

MCP 是连接 Agent / LLM 应用与外部 Tool、Resource、Prompt 的协议。

对项目的价值：

- 能写一个 MCP Server 是 JD 可识别能力；
- 可将 Verifier、Task Environment 或 Godot Tool 暴露为标准工具；
- 有利于跨 Harness 工具复用。

当前取舍：MCP 不是第二项目存在的理由，也不是首个闭环必需项。只有在出现自然 Tool Boundary 时加入，例如将 Godot / Build / Screenshot Verifier 作为 MCP Server。

## 4.12 A2A

A2A 面向独立 Agent 系统间通信、任务生命周期和互操作。

当前取舍：第二项目初期是单 Harness / 单主 Agent，不需要 A2A。如果后期真的出现独立 Worker、异步任务、跨 Agent Service 或远程 Agent，再考虑。

## 4.13 Multi-Agent / Subagent

部分游戏 AI 工具链 JD 会写 Planning、Memory、Multi-Agent、团队协作。

真实 Multi-Agent 应从以下问题中演化：

- Context Isolation；
- 独立 Workspace；
- 并行模块；
- Structured Handoff；
- 独立 Reviewer；
- 可验证子任务。

不做自由聊天式 Swarm、五个角色 Prompt、没有环境验证的多 Agent 辩论。

当前取舍：第二项目先做好单 Agent Runtime Reliability。后期只有在多模块 Coding Task 或 Godot Workflow 中出现明确收益才加入。

## 4.14 Memory

候选类型：Session Memory、Failure Memory、Repository Convention、Regression Case、Policy History、Coding Skill 和 Long-term User Memory。

当前取舍：大型用户 Memory 由拾流承担。第二项目只保留与 Harness 改进直接相关的：

```text
Failure
Case
Policy
Skill
Model / Harness Compatibility
```

## 4.15 Skill 与受控 Self-improvement

2026 年出现多条 Harness 自动优化路线：

- Meta-Harness；
- Agentic Harness Engineering（AHE）；
- Self-Harness；
- Retrospective Harness Optimization；
- 其他 Skill / Harness Evolution 工作。

它们共同关注：

```text
Trace / Experience
→ Weakness Mining
→ Candidate Harness Edit
→ Validation
→ Harness Improvement
```

当前判断：这个方向已经研究拥挤。第二项目不能把“自动改 Harness”本身当作差异化。

更可信的项目路线是：

```text
真实使用
→ 失败归因
→ Candidate Policy / Skill
→ 自动回归
→ 人工门禁
→ 发布 / 回滚 / 退役
```

不做一次 LLM 反思直接上线、自动修改 Core 后不经验证、用训练 Case 提升冒充泛化，或营销式“Self-evolving Agent”。

## 4.16 Harness Assumption Registry

模型能力变化后，一些旧规则可能变得无效、多余、造成负迁移或增加 Token 和延迟。

因此每条 Policy 可以记录：

- 为什么存在；
- 来源失败；
- 对哪些模型有效；
- 有哪些 Regression；
- 是否应退役。

当前取舍：Registry 是有价值的控制面，但不能替代真实 Policy 和实验。只有在至少一条 Policy 经历真实失败、对照测试和 Active / Rejected / Retired 后，才值得作为简历亮点。

## 4.17 LangGraph 与 Deep Agents

LangGraph 适合显式 State、Conditional Routing、Checkpoint、Interrupt、HITL 和 Durable Workflow，主要属于拾流 V4/V5-A 的技术栈。

Deep Agents 官方提供 Planning、Filesystem、Subagent 等 batteries-included Harness 能力。

当前取舍：第二项目基于 Pi，不需要 LangGraph。Deep Agents 可作为 Harness 机制参考、另一种基座对照或后期第二被测 Agent，但不应与 Pi 同时成为项目核心。

## 4.18 Waku Agent

历史定位：小型教学 / 个人 Agent，包含 Trace Tape、Deterministic Eval、Release Gate、真实使用到反馈的闭环参考。

当前取舍：

```text
参考产品闭环和 Trace / Eval 思想
不作为正式 Runtime 内核
```

实施前需要重新确认正确仓库和许可证。

## 4.19 HomeRail

历史定位：外层长期任务 / DAG、Run Workspace、Scorecard、Replay，以及调用现有 Harness 的 Manager / Worker 结构。

当前取舍：

```text
参考 Workspace、Artifact、Scorecard、Replay
不把完整 DAG / Multi-Agent Orchestration 集成进初期项目
```

它更适合作为未来复杂 Coding Workflow 或游戏开发 Workflow 的参考。

## 4.20 OpenHarness

历史研究存在同名项目混淆。

较受关注的 Python Harness 可能具有 Tool、Skill、Memory、Session、Permission 和 Context Compression。

风险：

- 项目较年轻；
- 同名项目多；
- 个人贡献边界可能模糊；
- README 功能丰富不等于源码成熟；
- 需要逐文件源码审计。

当前取舍：

```text
机制参考 / 备选 Spike
不作为当前首选内核
```

## 4.21 ForgeCode

历史评估：Rust、功能较完整、可能有云索引依赖、仓库规模与语言提高理解成本，且 Benchmark 宣称与官方口径难直接比较。

当前取舍：

```text
排除作为当前魔改内核
可作为产品与机制参考
```

## 4.22 OpenHands / OpenCode / Goose

优势：产品完整、真实用户和生态、Tool / Session / Plugin / MCP 等能力丰富。

风险：代码量大、改动散布、个人贡献难归因，可能需要理解复杂前端、后端、云服务或 Rust Runtime。

当前取舍：

```text
不作为第一候选内核
作为成熟产品行为、Tool、Sandbox 和 Session 参考
```

## 4.23 CCGS / Godogen / AI Game Development Workflow

早期第二项目来自这个方向。

CCGS 启发：Spec / GDD、分工、Human Approval 和 Process Scaffolding；但多 Agent 数量可能过度工程，且缺 Runtime 验证。

Godogen 启发：Plan → Code → Asset → Run → Screenshot → Repair、Frame-grounded Self-repair、强执行和运行验证；但人审与结构化 Trace 较弱。

对当前第二项目的继承：

- Task Spec；
- Workspace；
- Runtime Evidence；
- Human Gate；
- Repair Loop；
- Trace；
- Verifier；
- Run Report。

Godot 不再是项目首个主语，而是可选的真实 Task Environment。

---

# 5. 拾流计划覆盖的技术栈

本节只用于划分双项目边界。

## 5.1 拾流已覆盖或计划覆盖

```text
Python
FastAPI
真实数据管线
字幕 / ASR
LLM Structured Output
SQLite / FTS
Dense Embedding
Hybrid Retrieval
Query Understanding / Multi-query
Grounded RAG
Evidence Identity
Sufficiency
Claim Citation
Agentic Search
AI Summary Navigation
Progressive Transcript Search
Context Construction
LangGraph 或等价 Workflow
Trace
Semantic / Evidence Eval
Durable Research Task
HITL
Typed Memory
Research Artifact
Feedback Personalization
Search Skill Improvement
长期研究陪伴
```

## 5.2 第二项目应避免重复承担

- 再做一个语义 RAG；
- 再建人工三层 Gold；
- 用户偏好 Memory；
- 视频 / 文本 Evidence；
- 领域 Research Agent；
- LangGraph 作为主框架；
- 通用知识图谱；
- 另一个大型个性化系统。

## 5.3 最核心互补

| 维度 | 拾流 | 第二项目 |
|---|---|---|
| 语言 | Python | TypeScript / Bun |
| Agent | Research Agent | Coding Agent Harness |
| Tool | Search / Transcript | File / Shell / Git / Test |
| Context | Evidence Context | Tool / Session Context |
| Outcome | Answer Grounding | Environment State |
| Eval | Semantic / Evidence | Deterministic Assertions |
| Reliability | 保守回答、研究任务 | Runtime、Side Effect、Fault |
| Memory | User / Corpus / Artifact | Failure / Case / Policy / Skill |
| Framework | LangGraph 候选 | Pi Runtime / Extension |
| 游戏 | 非核心 | 可选 Godot Adapter |

---

# 6. 第二项目当前规划

## 6.1 项目定位

推荐工作名：

```text
Agent Harness Reliability Workbench
```

更具体的一句话：

> **基于 Pi 构建一个可实际使用的 Coding Agent Workbench，通过环境级自动验证、运行时 Trace、故障注入和 Baseline / Candidate 对照，判断一项 Harness Policy 是否真正改善任务结果，并把真实失败沉淀为人工确认的回归资产。**

## 6.2 目标用户

- 自己日常使用开源 Coding Agent 的开发者；
- 希望验证“改一条 Harness 规则是否真的变好”的个人或小团队；
- 需要观察失败、自动检查 Outcome、保留运行记录的人。

## 6.3 唯一中心问题

```text
一项 Harness Policy 修改
是否提高任务成功或可靠性
且没有造成不可接受的回归？
```

## 6.4 核心闭环

```text
真实 Coding Task
→ 受控 Workspace
→ Pi Agent 执行
→ 记录 Model / Context / Tool / Environment Event
→ Environment Verifier 判断 Outcome
→ 分类失败
→ 保存 Run Report
→ 形成 Candidate Case / Policy
→ Baseline / Candidate 重跑
→ 发布、拒绝、回滚或退役
```

## 6.5 项目首先必须是“可使用的 Agent”

不能只做：

```text
Session Parser
+ Eval Report
```

至少应该支持真实仓库任务：

- 修复 Bug；
- 增加小功能；
- 修改配置；
- 写测试；
- 重构局部模块；
- 分析日志；
- 运行测试和 Build。

真实使用是 Trace、Failure 和回归 Case 的数据来源。

---

# 7. 候选技术栈

## 7.1 基座

```text
TypeScript
Bun / Node.js
Pi Agent Core
Pi Coding Agent
Pi Extension API
Pi SDK
Pi Session
```

## 7.2 Workbench

```text
CLI
JSON / JSONL
SQLite 或文件存储（待比较）
Git
Git Worktree 或临时 Workspace
Shell
Test / Build / Lint
Markdown / HTML Report
```

## 7.3 可靠性与 Eval

```text
Run Manifest
Runtime Event Journal
Environment Verifier
Baseline / Candidate Runner
Fault Injection
Replay
Regression Case
Policy Registry
Feature Flag
HITL
Container / Sandbox Adapter（条件性）
```

## 7.4 可选后期

```text
MCP Server / Client
Godot CLI
Screenshot / Runtime Validation
Subagent / Multi-workspace
Harbor Adapter
Web UI
```

---

# 8. Pi 继承与个人贡献边界

## 8.1 尽量继承 Pi

- Provider；
- LLM API；
- Agent Loop；
- 基础 Tool Calling；
- 基础 State；
- Session；
- CLI / TUI；
- Extension / SDK；
- 已有 Coding Tool。

## 8.2 用户应重点建设

- Task Spec；
- Run Manifest；
- Workspace Contract；
- Runtime Event Journal；
- Session Reference；
- Deterministic Environment Outcome；
- Baseline / Candidate Runner；
- Reliability Policy；
- Fault Injection；
- Failure Attribution；
- Dynamic Regression；
- Policy / Skill Lifecycle；
- Report。

## 8.3 Codex 的角色

Codex 可以加速：

- 类型合同；
- Adapter；
- CLI；
- 存储；
- 测试；
- 报告；
- 重构；
- 源码导航。

Codex 不能替用户决定：

- Outcome 的语义；
- Failure Taxonomy；
- 哪些事件必须记录；
- Policy 的因果假设；
- Side Effect 边界；
- Eval Case 是否有效；
- Promotion / Rollback 门槛；
- 个人贡献表述。

---

# 9. 核心数据对象候选

这些只是研究起点，不是冻结 Schema。

```yaml
TaskSpec:
  task_id:
  instruction:
  repository:
  initial_state:
  allowed_scope:
  verifier:
  budget:

RunManifest:
  run_id:
  task_id:
  harness_version:
  policy_versions:
  model:
  environment:
  workspace:
  seed_or_trial:
  started_at:

RuntimeEvent:
  run_id:
  sequence:
  timestamp:
  event_type:
  payload:
  parent_event_id:

EnvironmentOutcome:
  run_id:
  status:
    - passed
    - failed
    - invalid_run
    - cancelled
  assertions:
  artifacts:
  verifier_status:

RegressionCase:
  source_run_id:
  task_spec:
  expected_outcome:
  assertions:
  status:
    - candidate
    - approved
    - rejected

HarnessPolicy:
  policy_id:
  target_failure:
  implementation:
  source_runs:
  regression_cases:
  status:
    - proposed
    - shadow
    - active
    - candidate_for_retirement
    - retired
```

设计 Session 应根据 Pi 源码判断哪些对象已有对应物，避免重复建模。

---

# 10. Trace 与 Failure Attribution

## 10.1 候选事件

```text
run_start
model_turn_start
context_transform
tool_requested
tool_started
tool_completed
tool_failed
policy_decision
retry
user_intervention
verifier_started
verifier_completed
stop
run_end
```

## 10.2 Failure 分类

```text
Model Failure
Agent Decision Failure
Context Failure
Harness Failure
Tool Failure
Environment Failure
Verifier Failure
Infrastructure Invalid Run
User Cancellation
```

## 10.3 重要原则

- Pi Session 是原生事实源之一；
- Workbench Event Journal 只补 Session 缺失的运行时事实；
- 不重复保存全部 Model 内容；
- Side Effect 与 Tool Result 持久化顺序要重点审计；
- Invalid Run 不能计入 Agent 质量失败。

---

# 11. 自动 Outcome 与减少人工 Eval

## 11.1 Coding Agent 的优势

Coding Task 可以通过：

- Test；
- Build；
- Lint；
- Type Check；
- Exit Code；
- File Assertion；
- JSON Schema；
- Git Diff；
- Forbidden Path；
- API Assertion；
- Service Health；
- Idempotency；

进行自动判断。

## 11.2 目标

不是完全取消人工，而是将人工从：

```text
逐次检查每个运行
```

压缩到：

```text
设计任务
确认非确定性质量
冻结 Candidate Case
批准 Policy
```

## 11.3 值得统计的指标

```text
Task Success
False Completion Rate
Recovery Success
Invalid Run Rate
Deterministic Verdict Coverage
Human Review Minutes per Run
Tool Calls
Token
Latency
Cost
```

首个简历数字应从真实实验中选择，不预先编造。

---

# 12. Reliability Policy 候选方向

## 12.1 Context Policy

- Oversized Tool Result Handling；
- Externalization；
- Progressive Disclosure；
- Compaction；
- Critical Constraint Preservation；
- Progress Summary。

## 12.2 Tool Policy

- Timeout；
- Retry Budget；
- Malformed Result；
- Explicit Error Observation；
- Partial Side Effect；
- Idempotency；
- Permission Denial。

## 12.3 Completion Policy

- Test / Build Verification；
- False Completion Detection；
- Continue / Fail / Stop；
- Budget Exhaustion；
- Structured Finalization。

## 12.4 Session Policy

- Crash Recovery；
- Resume；
- Replay；
- Attempt Separation；
- Side-effect Deduplication；
- Session / Run Consistency。

## 12.5 选择首个 Policy 的标准

- 有真实可复现失败；
- Pi 扩展层可实现；
- 无需改 Core；
- 有确定性 Outcome；
- Baseline / Candidate 差异清楚；
- 能形成面试故事；
- 不需要大型平台前置。

---

# 13. Fault Injection

## 13.1 第一批候选

```text
Oversized Tool Result
Tool Timeout
Malformed Tool Result
Verifier Failure
Process Crash
```

## 13.2 原则

- Fault 必须服务某条 Policy；
- 不为覆盖故障数量而扩张；
- Fault 配置进入 Manifest；
- Infrastructure Invalid Run 与 Agent Failure 分开；
- 先有正常闭环，再注入故障。

---

# 14. 真实使用反馈与动态回归集

## 14.1 两条循环

```text
固定回归集
→ 防止已知问题回归
```

```text
真实使用 Run
→ 自动 Postmortem
→ Failure Candidate
→ Candidate Case
→ 人工确认
→ 动态回归集
```

## 14.2 可以自动化

- 发现失败 Run；
- 归类 Event / Stop Reason；
- 草拟任务最小复现；
- 草拟 Assertions；
- 创建 Candidate Case；
- 在干净 Workspace 重跑；
- 生成对照报告。

## 14.3 必须人工确认

- Failure 是否值得保留；
- Task 是否自然；
- Assertion 是否验证了真正目标；
- Case 是否进入正式回归；
- Policy 是否晋级；
- Skill 是否发布。

---

# 15. Policy / Skill 的受控改进

## 15.1 正确闭环

```text
Trace / Outcome
→ Failure Mining
→ Candidate Policy / Skill
→ Historical Replay
→ Shadow Evaluation
→ Regression Gate
→ Promote / Reject
→ Monitor
→ Rollback / Deprecate
```

## 15.2 与研究热点的区别

AHE、Meta-Harness、Self-Harness 等研究自动搜索和修改 Harness。

本项目的差异化应是：

```text
真实日常使用
+ Environment-grounded Outcome
+ Human Gate
+ Policy Lifecycle
+ 可解释个人工程贡献
```

不是追求全自动 Harness Evolution 或排行榜最优。

---

# 16. Permission、Workspace 与安全

## 16.1 最小安全层

```text
Temporary Workspace 或 Git Worktree
Allowed Path
Forbidden Path
Command Preflight
Dirty Repo Guard
HITL for High-risk Action
```

## 16.2 后期可选

- Docker；
- Gondolin / MicroVM；
- Network Policy；
- Credential Isolation；
- MCP Tool Boundary。

## 16.3 不做

- 通用多租户 Sandbox；
- 企业级权限平台；
- 完整零信任系统。

---

# 17. Godot / 游戏开发 Adapter

## 17.1 为什么保留

用户长期目标包括游戏研发 AI 工具链。通用 Coding Agent Workbench 与游戏 JD 之间仍有一层场景距离。

## 17.2 最小 Adapter 可能包括

```text
Task Spec
→ Godot Project Workspace
→ Agent 修改脚本 / 场景
→ Godot CLI / dotnet build
→ Runtime Log / Screenshot
→ Verifier
→ Repair
```

## 17.3 可展示技术

- Godot；
- GDScript / C#；
- Engine Tool；
- Build / Run；
- Screenshot；
- Visual Validation；
- GameDev Workflow；
- HITL。

## 17.4 进入条件

- Pi Workbench 核心闭环已稳定；
- 通用 Coding Task 已有 Outcome；
- 用户准备重点投游戏 AI 工具链；
- Godot Adapter 不改变项目主架构。

---

# 18. 与 JD 的简历叙事

## 18.1 Agent Infra / Harness 版本

突出：

```text
Pi Runtime
Tool Lifecycle
Context Policy
Session
Trace
Fault Injection
Environment Outcome
Regression
Policy Lifecycle
```

## 18.2 AI Coding / 研发工具版本

突出：

```text
File / Shell / Git / Test Tool
Completion Verification
Workspace
自动修复
真实仓库任务
False Completion
```

## 18.3 Eval / AI Quality 版本

突出：

```text
Deterministic Verifier
Invalid Run
Baseline / Candidate
Fault-conditioned Eval
Dynamic Regression
Failure Attribution
```

## 18.4 游戏研发工具链版本

在通用内容上增加：

```text
Godot Adapter
Runtime / Screenshot Validation
游戏脚本和场景任务
Human Approval
```

## 18.5 与拾流组合的一句话

> 拾流证明我能构建有真实数据、RAG、证据和长期产品价值的领域 Agent；第二项目证明我理解 Coding Agent 的 Context、Tool、Session、环境验证和 Harness Reliability。

---

# 19. 第二项目最值得准备的面试问题

1. 为什么选择 Pi？
2. Pi 提供了什么，你真正实现了什么？
3. 为什么 Pi Session 不一定等于完整 Runtime Trace？
4. 如何定义一次 Coding Task 成功？
5. Agent 声称完成但测试失败时如何处理？
6. 如何区分 Agent Failure 和 Invalid Run？
7. 为什么 LLM Judge 不能替代 Environment Verifier？
8. Tool Side Effect 和 Result Persistence 的顺序有什么风险？
9. Retry 如何避免重复副作用？
10. Context Policy 为什么可能改善或损害结果？
11. 如何防止 Candidate Policy 过拟合 Case？
12. 为什么不直接用 Terminal-Bench 排行榜？
13. 为什么不一开始做 Multi-Agent？
14. 为什么不 Fork OpenHands / OpenCode？
15. 如何利用真实使用形成回归 Case，同时避免自动 Gold？
16. 哪些规则可以随着模型变强被退役，哪些安全边界不能删？
17. Codex 在项目中做了什么，你如何保证自己理解核心代码？
18. 如果 Pi Spike 失败，Plan B 是什么？

---

# 20. 当前明确不进入第一阶段的内容

```text
完整 Claude Code Clone
通用 Eval SaaS
多模型排行榜
大型 Web Dashboard
大型 Memory 平台
Dreaming
Multi-Agent Swarm
A2A
自动 Gold
全自动修改 Harness 并上线
完整 Harbor 集成
通用 Sandbox 平台
复杂游戏生产流水线
纯 Benchmark 刷榜
```

这些不是永久禁止，但必须由真实问题和新的版本目标重新授权。

---

# 21. Pi Spike 应回答的问题

## 21.1 Runtime 与 Extension

- Agent Loop 的核心位置在哪里？
- Extension 可以订阅哪些事件？
- 能否截获 Tool Call 前后？
- 能否修改 Tool Result 进入 Context 的形式？
- 能否为每个 Run 绑定 Manifest？
- 能否以 SDK 非交互运行固定任务？
- 能否独立指定 Workspace？
- Agent 终止语义是什么？

## 21.2 Session 与 Trace

- Pi Session 的 JSONL / Storage Schema 是什么？
- 是否记录 Tool Start / End？
- 是否记录 Context Transform / Compaction？
- Side Effect 发生后、Result 持久化前崩溃会怎样？
- Session、Run、Attempt 是否需要外部映射？
- 是否需要 Event Journal，补哪些事件？

## 21.3 Outcome

- 如何执行测试、Build、File Assertion？
- Outcome 应由 Agent、Runner 还是外部 Verifier 触发？
- Verifier 失败如何标记 Invalid Run？
- 能否区分 Agent Final Answer 与 Task 完成？

## 21.4 Policy

- 最小可开关 Policy 是什么？
- 能否做到 Pi Core 修改为 0？
- Policy 是否可以通过 Extension / Wrapper 实现？
- Baseline / Candidate 是否可以使用同一 Task / Model / Budget？

## 21.5 可解释性

- 用户能否解释关键代码路径？
- Codex 生成的代码是否可审查？
- 上游能力与个人代码边界是否清楚？
- 是否需要冻结 Pi Release / Commit？

---

# 22. Pi Go / No-Go 条件

## Go

```yaml
go:
  - core_patch_not_required
  - fixed_task_can_run_programmatically
  - critical_tool_lifecycle_is_observable
  - policy_can_be_toggled
  - deterministic_outcome_can_be_attached
  - session_can_be_linked_to_run
  - user_can_explain_dataflow
```

## No-Go / Reconsider

```yaml
no_go:
  - critical_events_require_large_core_fork
  - tool_result_cannot_be_postprocessed
  - runner_depends_on_hidden_TUI_state
  - workspace_cannot_be_controlled
  - TypeScript_patch_is_not_reviewable
  - basic_run_requires_building_a_large_platform
```

## Plan B

- 选择 Pi 上游 PR + 独立小 Workbench；
- 对 HKUDS/OpenHarness 做重新 Spike；
- 基于 mini-SWE-agent / 更小 Coding Agent 做独立 Runner；
- 采用成熟 Agent，仅建设外部 Outcome / Trace / Policy Adapter；
- 把游戏 Adapter 作为独立环境而不魔改 Runtime。

Plan B 必须由 Spike 的具体失败原因决定，不提前冻结。

---

# 23. 建议 Codex 的研究输出

Codex 不应立即给出一个“完整实现计划”。第一轮应交付：

## 23.1 Pi 源码地图

```text
Package / Module
Agent Loop
Session
Tool
Context Transform
Compaction
Extension Events
SDK Entry
Termination
Permission / Workspace
Tests
```

## 23.2 能力矩阵

| 所需能力 | Pi 已有 | 可通过 Extension | 需 Wrapper | 需 Core Patch | 证据 |
|---|---|---|---|---|---|

## 23.3 三种架构候选

例如：

```text
A. 纯 Extension
B. SDK Runner + Inline Extension
C. 独立 Workbench Runner + Pi Session Adapter
```

每种比较：

- 代码量；
- 侵入性；
- Trace 完整性；
- Outcome 接入；
- Daily Usability；
- 测试；
- 个人贡献；
- 面试解释；
- 维护风险。

## 23.4 最小 Spike

只跑：

```text
一个固定 Coding Task
一个 Manifest
一个 Policy Toggle
一个 Event / Session Link
一个 Deterministic Outcome
一个 Baseline / Candidate Report
```

## 23.5 风险报告

- 缺失 Hook；
- Session 空窗；
- Side Effect；
- Package / Release 摩擦；
- Test Coverage；
- 扩展稳定性；
- 需要上游 PR 的位置。

---

# 24. 给 Codex 的研究约束

```yaml
research_rules:
  do_not_assume_readme_is_correct: true
  inspect_source_and_tests: true
  pin_current_release_or_commit: true
  separate_upstream_from_user_code: true
  do_not_design_full_platform: true
  do_not_add_hot_technology_without_need: true
  propose_multiple_architectures: true
  preserve_open_questions: true
```

Codex 必须：

- 引用源码路径、Symbol 和测试；
- 标记事实 / 推断 / 建议；
- 不把 Fable 或本文件的判断当作权威；
- 可以推翻 Pi 方案；
- 可以提出使用成熟能力减少自建；
- 不能用“以后可以扩展”掩盖当前闭环不完整；
- 不把代码行数或传统工时估计当作用户速度的可靠依据。

---

# 25. 推荐的研究工作流

```text
长期项目组合与 JD 能力目标
→ 本研究上下文包
→ 独立 Pi / 基座源码审计
→ 方案比较
→ 用户决定基座与首个数字故事
→ Version Charter
→ Goal-by-Goal Codex 实现
→ 自动测试
→ 真实任务使用
→ 失败与 Closeout
```

主 Session 只负责：

- 双项目战略；
- 求职能力分工；
- 最终版本接受；
- 防止范围漂移。

第二项目设计 Session 负责：

- 基座研究；
- 架构选型；
- 复用成熟框架；
- 最小闭环；
- 实现方案。

执行 Session / Codex 负责：

- 按 Goal 实现；
- 测试；
- 报告；
- 保持 Current State。

---

# 26. 当前最重要的开放问题

1. Pi 的 Session 是否足以作为主要 Trace，还是必须追加 Event Journal？
2. Extension 能否完整处理 Tool Result 和 Context Transform？
3. 首个 Policy 哪个最容易形成真实数字故事？
4. Workbench 是 Pi 内部 Extension 还是外部 Runner？
5. Outcome 是否绑定 Task Spec，还是允许 Ad-hoc 日常 Run？
6. 真实使用 Run 如何转 Candidate Case，而不制造伪 Gold？
7. Workspace 采用 Git Worktree、临时复制还是 Container？
8. Permission Gate 应在 Tool 层、Runner 层还是环境层？
9. Replay 是重新执行 Task，还是重放事件做分析？
10. Session Resume 是否进入早期项目，还是只做 Crash / Side-effect Case？
11. 是否需要第二被测 Agent 证明 Workbench 可迁移？
12. Godot Adapter 何时对求职收益最高？
13. MCP 是否能作为自然 Tool Boundary，而不是技术装饰？
14. Policy Registry 是核心控制面还是后期报告元数据？
15. 如何定义 Portfolio-ready，而不假装生产级？
16. 如何在简历中公平归因 Pi、Codex 和用户贡献？

---

# 27. 当前推荐但未冻结的优先顺序

这不是详细版本规划，只是研究优先级：

```text
1. Pi Spike / Source Audit
2. Usable Coding Task + Deterministic Outcome
3. Trace / Run Manifest / Failure Attribution
4. 一条真实 Runtime Policy
5. Baseline / Candidate
6. 少量 Fault / Regression
7. 真实使用 → Candidate Case
8. Policy / Skill Lifecycle
9. 条件性 Godot Adapter
```

用户实际开发速度较快，不应使用传统“每项需要数周”的时间模型；但仍应限制同一时间的活跃 Goal，避免第二项目同时打开所有热点模块。

---

# 28. 资料与官方参考

## 用户材料

- 《27届想投 Agent 方向的，先看完这篇再投》
- `【6月28日凌晨】JD能力画像与技术补课路线.md`
- `目标岗位JD画像_恢复版.md`
- `FABLE5_CRITICAL_RESEARCH_CONTEXT_V3.md`
- `Fable 5 独立评审报告：拾流 + 第二项目组合.md`
- `SHILIU_COMPLETE_STRATEGY_REVISED.md`
- AI Game Development Workflow / CCGS / Godogen 研究材料
- Claude Code Harness 知识库与 `learn-claude-code` 学习记录

## 官方 / 一手资料

- Pi Repository: https://github.com/earendil-works/pi
- Pi SDK: https://pi.dev/docs/latest/sdk
- Pi Extensions: https://pi.dev/docs/latest/extensions
- MCP Specification: https://github.com/modelcontextprotocol/modelcontextprotocol
- A2A Specification: https://github.com/a2aproject/A2A
- LangGraph Persistence: https://docs.langchain.com/oss/python/langgraph/persistence
- LangGraph Interrupts: https://docs.langchain.com/oss/python/langgraph/interrupts
- Deep Agents: https://docs.langchain.com/oss/python/deepagents/overview
- Terminal-Bench: https://github.com/harbor-framework/terminal-bench
- Harbor: https://github.com/harbor-framework/harbor
- AgentOps: https://github.com/AgentOps-AI/agentops
- OpenHands: https://github.com/OpenHands/openhands
- Goose: https://github.com/aaif-goose/goose

## Harness Improvement Research

- Self-Harness: https://arxiv.org/abs/2606.09498
- Agentic Harness Engineering: https://arxiv.org/abs/2604.25850
- Meta-Harness: https://arxiv.org/abs/2603.28052
- Code as Agent Harness: https://arxiv.org/abs/2605.18747
- Harness Updating Is Not Harness Benefit: https://arxiv.org/abs/2605.30621
- Self-Evolving Agent Harnesses via Gated Semantic Quality: https://arxiv.org/abs/2607.13683

---

# 29. 最终工作结论

第二项目作为简历项目是合理的，因为它不是拾流的复制，而是补齐：

```text
Coding Agent
TypeScript Runtime
Tool / Session / Context
Deterministic Environment Eval
Fault / Reliability
Permission / Workspace
Harness Policy Improvement
```

最合理的项目形态不是：

```text
很小的 Session 报告插件
```

也不是：

```text
包含所有 Agent 热点的通用平台
```

而是：

> **一个自己会真实使用的 Coding Agent Workbench；能够自动验证任务结果、记录关键运行事实、复现失败，并用对照实验判断一项 Harness Policy 是否值得发布。**

研究和实现过程中始终用以下问题约束范围：

```text
它解决了哪种真实 Coding Agent 失败？
它如何自动判断结果？
它与 Pi 上游能力有什么区别？
它与拾流形成了什么互补？
它能够形成什么数字故事？
它为什么值得面试官继续追问？
```
