# CC Harness Knowledge Inventory

```yaml
analysis_date: 2026-07-29
analysis_scope: reference/cc-harness-knowledge
substantive_files_read: 29
nested_git_metadata_files_excluded: 91
appledouble_sidecars_excluded: 198
new_goal_created: false
runtime_experiment_executed: false
```

## 1. 结论

**Fact.** `reference/cc-harness-knowledge/` 在排除 91 个普通嵌套 Git 元数据文件和 198 个隐藏 `._*` AppleDouble 传输 sidecar 后，共有 29 个语义文件；本次逐文件读取了全部 29 个。没有仅根据文件名推断内容。两类被排除文件都不承载需要提炼的 Harness 笔记正文。

**Inference.** 这个知识包不是一组独立、同权重的“功能需求”。它更像一条经过多轮源码分析、Web GPT 复核和编辑收敛后形成的知识链：

```text
构建/治理说明
→ 专题源码报告
→ 多轮复核提示与编辑记录
→ 综合 Reference
→ 可迁移的 Engineering Playbook
→ 未解决问题 Backlog
```

其中最有设计迁移价值的是 `CC_HARNESS_REFERENCE.md` 和 `HARNESS_ENGINEERING_PLAYBOOK.md`；专题 source reports 提供论证上下文；process archive 证明资料是如何被复核和收敛的，但本身不是产品行为证据。

## 2. 完整文件清单

“笔记性质”使用以下含义：

- **治理/构建记录**：说明知识包的边界、工作流、迁移或完成状态；
- **教程复述**：整理公开学习材料中的机制；
- **代码分析**：基于 Claude Code 源码镜像做符号级分析；
- **设计推断**：从源码行为抽象不变量与工程含义；
- **实践经验**：用户自己的真实运行/事故记录。本包没有形成独立的实践日志；
- **编辑过程**：提交给 Web GPT 的复核任务、修订范围和验收口径。

| 文件 | 主题 | 主要机制 | 笔记性质 | 与第二项目的潜在关系 |
| --- | --- | --- | --- | --- |
| `.gitignore` | 参考仓库忽略边界 | 本地临时物、编辑器与构建噪声隔离 | 治理/构建记录 | 仅解释参考包卫生边界，不构成 Harness 结论 |
| `.workflow/STATE.md` | 知识构建状态 | 阶段、已完成产物、来源边界、待办 | 治理/构建记录 | 说明哪些文档已收敛，防止把过程稿当最终权威 |
| `AGENTS.md` | 参考包研究规则 | 阅读顺序、证据层级、禁止过度推断 | 治理/构建记录 | 与本项目“源码事实高于总结”的方法一致 |
| `START_HERE_CC_KNOWLEDGE_BUILD.md` | 总体学习与构建路线 | Agent Loop、Context、Session、Tool、Permission、Skill、Subagent 等专题路线 | 教程复述 + 用户知识结构 + 设计推断 | 展示用户已经形成的 Harness 全景知识；用于教学映射，不是功能清单 |
| `MIGRATION_COMPLETE.md` | 资料迁移完成说明 | 旧结构向当前知识包迁移、入口变化 | 治理/构建记录 | 解释文件来源和当前入口，不证明运行行为 |
| `docs/README.md` | 能力导航 | 按 Harness 能力定位 Reference、Playbook、报告和 backlog | 教程索引 + 设计导航 | 用于找到最短学习路径和专题证据 |
| `docs/CC_HARNESS_REFERENCE.md` | 综合 Harness 技术参考 | Loop、Tools、Permission、Context、Compaction、Session、Memory、Tasks、Background、Cron、Subagent、Teams、Worktree、Skills、MCP | 教程复述 + 代码分析 + 设计推断 | 主要 Pattern 来源；必须再与固定 Pi 源码比较 |
| `docs/HARNESS_ENGINEERING_PLAYBOOK.md` | 可迁移工程原则 | 可见性/权限/执行分离、Context Projection、恢复、异步边界、资源所有权 | 设计推断 | 第二项目最直接的设计参考；用于提炼不变量而非复制模块 |
| `docs/RESEARCH_BACKLOG.md` | 未解决问题 | 证据不足项、未来源码核验项、边界问题 | 设计推断 + 未完成清单 | 防止把未证实推断写成事实；不自动生成 Goal |
| `research/process-archive/STAGE_2_TO_WEB_GPT.md` | Stage 2 初次外部复核任务 | 资料整合、冲突检查、来源校正 | 编辑过程 | 证明知识包经历复核；不作为 Harness 行为证据 |
| `research/process-archive/STAGE_2_REVISION_TO_WEB_GPT.md` | Stage 2 第一轮修订 | 补证、降级过强结论、结构调整 | 编辑过程 | 帮助识别哪些结论曾不稳定 |
| `research/process-archive/STAGE_2_REVISION_2_TO_WEB_GPT.md` | Stage 2 第二轮修订 | 进一步收敛证据与措辞 | 编辑过程 | 说明综合 Reference 的结论经过多轮校准 |
| `research/process-archive/STAGE_4A_TO_WEB_GPT.md` | Stage 4A 专题复核 | Memory、System Prompt 等参考修订 | 编辑过程 | 对 Context/Memory Pattern 的来源治理有帮助 |
| `research/process-archive/STAGE_4B_TO_WEB_GPT.md` | Stage 4B 专题复核 | Recovery、Task、Background 等参考修订 | 编辑过程 | 对恢复与任务状态分离的论证链有帮助 |
| `research/process-archive/STAGE_4C_TO_WEB_GPT.md` | Stage 4C 专题复核 | Teams、Protocols、Worktree、MCP 等参考修订 | 编辑过程 | 用于确认哪些成熟机制明确超出第二项目范围 |
| `research/process-archive/STAGE_4_REFERENCE_REVISION_TO_WEB_GPT.md` | Stage 4 综合修订 | 将专题报告反馈回综合 Reference | 编辑过程 | 解释 Reference 与 source reports 的高重复度 |
| `research/process-archive/STAGE_5_TO_WEB_GPT.md` | Playbook 初次提炼 | 从产品特性抽象工程原则 | 编辑过程 | 证明 Playbook 的目标是 Pattern Transfer，不是 Feature Parity |
| `research/process-archive/STAGE_5_REVISION_TO_WEB_GPT.md` | Playbook 修订 | 边界、失败模式、反例与适用性校正 | 编辑过程 | 支撑本项目采用“问题—不变量—边界”格式 |
| `research/process-archive/STAGE_6_FINAL_REVIEW_TO_WEB_GPT.md` | 最终复核 | 全包一致性、来源边界、交付检查 | 编辑过程 | 说明当前知识包是阶段性稳定参考，但仍非 Pi 事实源 |
| `research/source-reports/s09_memory_source_notes.md` | Session Memory / Persistent Memory | 发现、选择、预算、注入、维护、记忆边界 | 代码分析 + 教程复述 + 设计推断 | 支撑“Memory 是 Context，不是 Authority”；V0 暂无引入需求 |
| `research/source-reports/s10_system_prompt_source_notes.md` | System Prompt | Prompt 组装、环境信息、约束注入、动态内容 | 代码分析 + 教程复述 + 设计推断 | 对 Pi `systemPrompt`/resource snapshot 和约束保留有参考价值 |
| `research/source-reports/s11_error_recovery_source_report.md` | Error Recovery | API retry、query recovery、compact recovery、tool/hook error 分层 | 代码分析 + 教程复述 + 设计推断 | 支撑 Recovery Budget 和错误分类；不证明 Pi 已有恢复策略 |
| `research/source-reports/s12_task_system_source_report.md` | Task System | Todo 与持久 Task、owner、依赖、状态转换 | 代码分析 + 教程复述 + 设计推断 | 帮助区分项目 Goal 文档与 Agent Runtime 任务；V0 不需复制完整 Task System |
| `research/source-reports/s13_background_tasks_source_verification.md` | Background Tasks | OS 子进程、Runtime Registry、文件输出、完成通知 | 代码分析 + 教程复述 + 设计推断 | 对长工具取消和外部现实重建有参考价值；不授权后台任务平台 |
| `research/source-reports/s14_cron_scheduler_source_report.md` | Cron Scheduler | Durable Definition、Scheduler Lease、触发与执行分离 | 代码分析 + 教程复述 + 设计推断 | 提供“持久定义不等于持久执行器”不变量；当前项目低相关 |
| `research/source-reports/s15_agent_teams_source_verification_report.md` | Agent Teams | 团队、成员、任务、消息等对象边界 | 代码分析 + 教程复述 + 设计推断 | 用于明确 Multi-Agent 不应自动进入第二项目 |
| `research/source-reports/s16_s17_team_protocols_source_verification_report.md` | Team Protocols | mailbox、消息投递、idle/claim/ownership 协议 | 代码分析 + 教程复述 + 设计推断 | 提供身份/所有权/投递分离思想；具体功能超出范围 |
| `research/source-reports/s18_worktree_isolation_source_report.md` | Worktree Isolation | 创建、所有权、dirty 检查、删除、集成边界 | 代码分析 + 教程复述 + 设计推断 | 支撑 Workspace 隔离不等于 Sandbox；与 Workbench workspace 管理相关 |
| `research/source-reports/s19_mcp_harness_source_report.md` | MCP Harness | 配置、连接、能力注册、可见工具、调用链 | 代码分析 + 教程复述 + 设计推断 | 仅作为能力分层案例；MCP 明确不进入当前路线 |

## 3. 重复、冲突与未完成内容

### 3.1 有意重复

**Fact.** `CC_HARNESS_REFERENCE.md` 大量吸收了 `s09`—`s19` 的专题结论，`HARNESS_ENGINEERING_PLAYBOOK.md` 又从 Reference 提炼跨系统原则。因此同一不变量会在三层重复出现，例如：

- Context Source 与 Model-visible Projection 分离；
- Tool Request 与 Tool Result 分离且必须可配对；
- Runtime Identity、Task Ownership、Workspace Ownership 分离；
- Durable Definition 不等于 Durable Executor；
- Resume 必须重新验证外部现实。

这类重复不是独立证据计数，不能把三次出现当作三份实现证据。

### 3.2 来源边界冲突

**Fact.** 综合控制文档把 Claude Code 源码镜像的产品版本/完整 commit 视为未知；少数较早 source report 记录了一个局部 commit 标识。稳定结论应采用更保守边界：参考包可以证明其所分析镜像中的模式，但不能证明 2026-07-29 最新 Claude Code 产品仍完全相同。

**Recommendation.** 后续引用 Reference Pattern 时写“该知识包所分析的成熟 Harness Pattern”，不要写成“Claude Code 当前必然如此”。

### 3.3 明确未完成

**Fact.** `RESEARCH_BACKLOG.md` 和 source reports 保留若干未完全验证项，包括统一生命周期台账、Exactly-once 投递、完整 stale-owner reconciliation、所有跨进程 Resume 细节等。

**Inference.** 这些空白本身很有价值：它们说明成熟 Harness 也常由多个状态源与局部协议组成，而不是一个全能 SessionManager。第二项目不应因为参考系统没有统一答案就自行扩张成通用 Durable Runtime。

### 3.4 实践经验边界

**Fact.** 本包没有独立的用户事故日志、生产运行记录或可复现实验产物。用户理解主要体现在专题选择、结构化术语、复核过程和 Pattern 提炼中。

**Recommendation.** 将这些笔记视为高价值设计参考；将本项目未来的真实 run artifacts、Verifier 结果和 Failure Case 作为实践证据层，二者不要混写。

## 4. 第二项目的正确使用方式

```text
用户已学习的机制
→ 提炼 Problem / Design Goal / Invariant / Failure Mode
→ 在固定 Pi 源码中寻找对应机制和边界
→ 判断项目是否已有真实问题
→ 只在满足 adoption gate 时提出候选
→ 用可观察结果验证，而不是按功能列表补齐
```

**Recommendation.** 当前最值得迁移的不是 Teams、MCP、Cron 等功能，而是四个横切方法：Context Projection、Tool 生命周期配对、持久状态与外部现实重建、显式 Recovery/Completion Budget。它们直接帮助解释 G003 已证明什么、尚未证明什么，以及哪些风险可以安全后移。
