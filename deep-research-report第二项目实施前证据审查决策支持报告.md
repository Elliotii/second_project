# 第二项目实施前证据审查决策支持报告

## Executive Decision Memo

**暂定结论：Pi 值得进入源码 Spike，但目前只能给出“有条件 Go”，不是直接立项通过。** 我检索到的最新官方公开证据表明，Pi 现在已经同时具备三层对你有价值的能力：一是 `@earendil-works/pi-agent-core` 的可编程 Agent Loop；二是 `@earendil-works/pi-coding-agent` 的 `AgentSession` / `AgentSessionRuntime` SDK；三是覆盖面相当广的 Extension 生命周期接口，包括 `tool_call`、`tool_result`、`context`、`session_before_compact`、`before_provider_request` 等。这说明它**不是**只能交互使用的黑盒 CLI，而是一个可以被外层 runner 驱动、再用 extension 做窄策略干预的运行时候选。与此同时，Pi 官方 README 也明确写明：它**没有内建通用权限边界**，默认使用启动它的用户权限；更强边界需要容器或沙箱。这一点非常重要，因为它直接限制了你第二项目里“Workspace / Permission / Deterministic Outcome”的默认可得性。citeturn31search3turn32search5turn44view0turn29view0

**我目前最推荐的首个 Spike 架构，不是纯 Extension，也不是独立 Workbench 重写一套 Runtime，而是 `Pi SDK Runner + Inline Extension`。** 原因很直接：纯 Extension 虽然能拦截工具、改上下文、接管 compaction，但对“固定任务清单、Run Manifest、Baseline/Candidate 配对、Verifier 注入、Attempt 建模”的外层控制不足；而完全独立的 Workbench Runner + Adapter 虽然控制力最强，却会过早复制 Pi 已经具备的会话替换、资源发现、生命周期绑定和日常可用性，范围失控风险最高。`createAgentSession()` 与 `createAgentSessionRuntime()` 的官方 SDK 文档已经明确支持程序化 `prompt()`、事件订阅，以及 `newSession()` / `switchSession()` / `fork()` / `importFromJsonl()` 这类 runtime replacement 能力；而扩展文档则确认这些能力与内建 interactive / print / RPC 模式使用的是同一层 runtime。换句话说，**SDK Runner 负责“实验控制”，Inline Extension 负责“运行时干预”**，这是首个闭环中最清晰的分工。citeturn44view0turn33search4turn29view0turn15view4

**暂定第一条 Policy 仍然推荐 Completion Verification，第二条推荐 Context Policy，但这是“可被源码证伪的暂定结论”。** Completion Verification 的最大优势，不是它最“高级”，而是它最容易形成你要的唯一中心问题：一条 harness policy 改动，是否让真实 coding task 的环境结果更好，而且没有不可接受回归。外部 verifier 天然给出“Agent Final Answer”与“Environment Success”之间的分离；Pi SDK 也已经支持程序化运行、非交互 prompt、会话事件订阅和重试结束后统一等待完成，这让它非常适合拿来做固定任务与 baseline/candidate 对照。相较之下，Tool Policy 与 Session Policy 的吸引力很大，但当前公开证据还不足以确认 Pi 在“副作用已发生但结果未持久化时的崩溃语义”“resume/retry 是否去重副作用”“attempt 映射是否天然存在”这些问题上的真实行为，因此太早把它们作为首条 policy，因果归因会更脏。citeturn44view0turn29view0turn32search2turn30view2

**当前最大的三个否决风险**有三项。第一，公开证据尚不足以证明 Pi Session 能覆盖你需要的关键 failure attribution 边界，尤其是 side effect 与 result persistence 之间的空窗；如果源码审计发现不存在可接受的外层 run journal 方案，Pi 方案应立即降级。第二，Extension 生命周期虽然覆盖广，但我没有在已检索到的 Extension API 中找到完整公开的“retry lifecycle”事件族；SDK/JSON/RPC 有重试事件，Extension 未见等价完整暴露，因此“只靠纯 Extension 做可靠性实验”的假设已经被部分削弱。第三，Pi 明确不内建权限边界；如果你的最小闭环任务离不开强 workspace isolation，而外层 runner 又不能用足够轻的容器/工作目录隔离实现，那么 Pi 只能作为被测 runtime，而不是完整 workbench 的内核。citeturn18view2turn18view3turn44view0turn32search2turn31search3

## Uploaded Document Audit

以下小节基于我对你上传文档的**完整本地审阅**。鉴于当前会话的文件检索器不可用，这一节不附可点击行号，但判断都以文档正文为依据，而不是凭印象复述。

**已被最新证据确认的判断**主要有四类。第一，文档把第二项目定位为“补齐拾流之外的 TypeScript Agent Runtime、Coding Agent、Tool/Session/Trace/Reliability/Eval 信号”，这个方向与我这次检索到的 Pi 当前能力、LangGraph 对照机制、Harbor/Terminal-Bench 的 harness 侧能力，以及近一年 Agent Infra / AI Coding 招聘语言高度一致。第二，文档坚持“不要再造一个大而全平台，而要围绕一条可验证 policy 做 baseline/candidate 对照”，这一点与 Harbor 这类评测框架强调数据集、容器环境、agent 配置和复验而非产品堆料的思路一致。第三，文档对 Pi 的定位是“候选 runtime，不预设一定适合”，这与本次事实核验完全一致。第四，文档把“Pi Session 可能不足以等于完整 runtime trace”列为开放问题，这并非多余谨慎，而是本轮最关键的未决点之一。citeturn40search3turn41search7turn31search3turn29view0

**需要修正或至少降强度的判断**也很明确。文档多处把“Pi 可能做到 Core Patch 为 0”当作优先目标，这个目标依然值得保留，但现在不能写成默认预期，因为公开证据虽然证明了 Extension/SDK 很强，却**没有**直接证明所有你关心的 crash window、attempt 边界和 side-effect deduplication 都能在零 patch 下解决。另一个需要降强度的判断，是把“Completion Verification 特别适合 Coding Agent”近似写成首条 policy 的默认答案；从项目叙事上它确实最强，但从技术证据上，它仍取决于你能否以外层 runner 的方式稳定附着 deterministic verifier，而不是把 verifier 变成另一个大平台。citeturn29view0turn44view0turn31search3

**缺少证据、必须继续保留为开放问题的判断**，我建议你在后续源码 Spike 中继续保留至少六项：Pi Session 的 JSONL 是否记录 tool start/end；tool side effect 与 session append 的真实顺序；进程在 side effect 已发生而 `toolResult` message 尚未持久化时崩溃后的恢复行为；`resume` / `fork` / compaction retry 是否会造成 attempt 混淆；是否存在官方支持的外部 Run ID 绑定字段；以及 exact runtime requirement 与发布包版本是否完全一致。这里面至少前四项，**不能靠 README 或 docs 推断**，必须靠源码和故障实验说话。citeturn18view2turn18view3turn17view7turn17view8turn32search1

**我认为文档中最应该继续保留的开放问题**，不是“要不要上 MCP、Fault Injection、Godot”，而是三件更硬的事：Pi 到底能否在不 fork core 的情况下暴露足够完整的实验边界；Session 是否只适合做“参考事实源”而不是“主 trace”；以及固定 coding task 的 baseline/candidate 是否能在同一模型、同一预算、同一任务 manifest 下形成可解释对照。前两项决定你能否继续以 Pi 为核；后一项决定项目能否成为可信求职作品，而不是好看的工程展示。

## Pi Source and Capability Map

### 事实核验摘要

截至本次检索，Pi 的主官方仓库是 `earendil-works/pi`，项目主页为 `pi.dev`。官方 README 将其描述为“AI agent toolkit”，并把当前主要包列为 `@earendil-works/pi-coding-agent`、`@earendil-works/pi-agent-core`、`@earendil-works/pi-ai` 和 `@earendil-works/pi-tui`。npm 侧可验证到 `@earendil-works/pi-coding-agent` 与 `@earendil-works/pi-agent-core` 仍在活跃发布；Pi 官方发布页显示 2026-07-25 存在 `Pi 0.82.1` 发布。但 here is an important conflict：我检索到的 npm 页面快照显示 `pi-agent-core` 已到 `0.82.1`，而 `pi-coding-agent` 页面快照仍显示 `0.82.0`。这更像是发布/抓取时差，而不是项目分叉，但在 Spike 前你应当**冻结一个具体 release/tag，并记录 package 版本是否齐平**。对于“精确 runtime requirement”，在我已抓取到的官方源码/文档片段里**未确认 exact `engines` floor**；只能确认它是 Node.js / npm 分发的 TypeScript 项目，且仓库开发流程也覆盖 Bun 安装烟测。citeturn31search3turn31search7turn31search5turn32search0turn32search1

### 关键代码位置与公开接口

下表只列与你这次 Spike 最相关的路径；凡我没有直接取到证据的地方，一律不补写。

| 能力 | 主要包与路径 | 关键符号 | 公开证据 | 结论 |
|---|---|---|---|---|
| Agent Loop | `packages/agent/src/agent-loop.ts` | `executeToolCallsSequential`、`executeToolCallsParallel`、消息/工具事件发射 | `agent-loop.ts` 中可见 LLM streaming、tool batch、`tool_execution_start`→`tool_execution_end`→`toolResultMessage` 顺序。citeturn17view5turn17view7turn17view8 | 已确认核心 loop 在 agent-core 层 |
| Agent Session | `packages/coding-agent/src/core/agent-session.ts` | `AgentSession`、`_handleAgentEvent`、`bindExtensions` | 文件头注释明确其负责 agent lifecycle、session persistence、compaction、branching；`bindExtensions()` 明确存在。citeturn15view5turn16view0 | 已确认 |
| SessionManager | `packages/coding-agent/src/core/session-manager.ts` | `SessionManager`、`buildContextEntries`、`buildSessionContext` | `buildSessionContext()`、`getEntries()`、`getTree()`、`branch()`、`appendMessage()` 等均可定位。citeturn19view1turn19view2turn19view9turn19view10turn18view8 | 已确认 |
| SDK 入口 | `packages/coding-agent/src/core/sdk.ts` 与 `docs/sdk.md` | `createAgentSession`、`createAgentSessionRuntime` | SDK 文档与源码导入项均显示存在单 session 与 runtime replacement 两层 API。citeturn15view4turn44view0turn33search4 | 已确认 |
| Extension API | `packages/coding-agent/src/core/extensions/types.ts` | `ExtensionAPI`、`ExtensionContext`、事件/result 类型 | `types.ts` 给出完整事件清单与返回值类型；`docs/extensions.md` 给出生命周期图。citeturn15view0turn15view1turn23view0turn23view1turn24view0turn25view0turn29view0 | 已确认 |
| Compaction | `packages/coding-agent/src/core/compaction/*` 与 `agent-session.ts` | `session_before_compact`、`session_compact` | 文档确认 extension 可取消或自定义 compaction；`agent-session.ts` 确认事件发射。citeturn30view1turn30view2turn16view6turn16view7 | 已确认 |
| Tool Runtime | `packages/coding-agent/src/core/tools/*` | `createBashTool`、`createReadTool` 等 | `tools/index.ts` 显示工具工厂全部绑定 `cwd`；`bash.ts` 显示本地 shell 执行后端和 timeout 解析。citeturn35view0turn35view1 | 已确认 |
| Workspace / CWD | `sdk.md`、`session-manager.ts`、`tools/index.ts` | `cwd`、`getDefaultSessionDir` | `cwd` 用于资源发现、工具路径解析、session naming；session dir 默认按 cwd 编码。citeturn20view2turn35view0turn44view0 | 已确认“cwd 控制”，未确认“强隔离” |
| 测试位置 | `packages/coding-agent/test/*`、`packages/agent/test/*` | 多个 runtime/compaction/retry/runtime-events 用例 | GitHub 目录清单可见 `agent-session-retry.test.ts`、`agent-session-runtime-events.test.ts`、`compaction-extensions.test.ts`、`extensions-runner.test.ts` 等。citeturn36view0turn37view4 | 已确认测试覆盖存在 |

### Pi 能力矩阵

| 所需能力 | Pi 已有 | Extension 可实现 | SDK/Wrapper 可实现 | 是否疑似需要 Core Patch | 证据强度 |
|---|---|---|---|---|---|
| 固定 coding task 的非交互运行 | `createAgentSession().prompt()` 已有。citeturn44view0 | 不必依赖 Extension | 是，天然适合 | 暂无 | 强 |
| 观测 agent start/end/settled | 有。citeturn14view0turn14view2turn22view8 | 是 | 是 | 否 | 强 |
| 观测 turn start/end | 有。citeturn14view3turn14view4turn23view1 | 是 | 是 | 否 | 强 |
| 观测 message start/update/end | 有。citeturn14view5turn14view6turn23view1 | 是 | 是 | 否 | 强 |
| 观测 tool requested/start/update/result/end | `tool_call`、`tool_execution_*`、`tool_result` 均有。citeturn14view7turn14view8turn23view1turn24view0turn24view1 | 是 | 是 | 否 | 强 |
| 在调用前阻止或改写 tool call | `tool_call` 支持 `block`；参数可原地变更。citeturn24view0turn25view0 | 是 | 不必 | 否 | 强 |
| 修改 tool result 进入模型上下文的形式 | `tool_result` 可改 `content/details/isError/usage`；`message_end` 还可替换最终消息。citeturn24view1turn25view0turn17view2 | 是 | 不必 | 否 | 强 |
| 修改每次 LLM 调用前的 context | `context` 事件可改 messages；`before_provider_request` 可改最终 payload。citeturn23view0turn29view0 | 是 | 不必 | 否 | 强 |
| 接管 compaction | `session_before_compact` 可 `cancel` 或返回自定义 `compaction`。citeturn25view0turn30view2 | 是 | 不必 | 否 | 强 |
| 注入后续消息并继续执行 | `sendMessage` / `sendUserMessage` 支持 `triggerTurn` 与 `deliverAs`。citeturn15view2turn22view9turn22view10 | 是 | 是 | 否 | 强 |
| 保存自定义 session entry | `appendEntry()` / `appendCustomEntry()` 存在。citeturn15view2turn16view4turn19view4 | 是 | 是 | 否 | 强 |
| 为运行绑定外部 Run ID / Manifest | 无 first-class 字段；可通过 custom entry/headers 外挂。citeturn15view2turn23view0 | 部分可行 | 是 | 可能不需要，但不是原生 | 中 |
| 观测 retry 生命周期 | SDK 文档显示 `auto_retry_*` 与 `summarization_retry_*` 事件；但已检索到的 ExtensionAPI 类型中未见完整等价事件。citeturn44view0turn32search2turn25view1 | **部分/未确认** | 是 | 可能不需要 core patch，但至少需要 wrapper | 中 |
| Workspace 隔离 / Permission | Pi 官方明确不内建通用权限系统。citeturn31search3 | Extension 可做 gate，不等于隔离 | 需要外部 runner / 容器 | 否，但需要外部系统 | 强 |

### Session 实际保存什么，不保存什么

从 `SessionManager` 和 `AgentSession` 公开代码可以确认：Pi session 是**append-only** 的，会保存 session header 与一系列 session entry；其中可直接定位到的 entry 类型包括普通 message、custom message、custom entry、compaction、model change、thinking level change，以及 tree/branch 相关条目。`buildSessionContext()` 会把 active path 上的 entry 投影成真正送往 LLM 的消息；普通 `custom` entry 不参与模型上下文，`custom_message`、`compaction`、`branch_summary` 则会投影为上下文消息。citeturn19view10turn20view0turn20view1turn20view2turn19view3turn19view4turn19view5turn19view7turn19view8

但同样重要的是，**我没有找到公开证据表明 session 会逐项持久化 tool execution 的 start/update/end 事件，或每次 context transform 的前后版本。** 现有代码只清楚显示，在 `AgentSession._handleAgentEvent()` 里，session 持久化的主入口是 `message_end`，而 extension 事件发射发生在持久化之前；`tool_execution_start/update/end` 被发给 extension，但没有在我已抓取到的代码片段里看到对应 `appendXXX()` 持久化。这个结论应被写成“基于公开代码的推断”，不是最终定论，但它已经足以说明：**Pi Session 更像会话事实源，不像完整 runtime journal。** citeturn18view2turn18view3turn18view4

### 顺序、崩溃窗与重复副作用风险

公开源码可以确认的一小段顺序是这样的：在 agent-core 的顺序执行路径中，一个工具调用会先发出 `tool_execution_start`，执行工具，随后发出 `tool_execution_end`，然后构造 `ToolResultMessage` 并发出该消息；而在 coding-agent 层，session 的持久化主要发生在 `message_end`。因此，至少从已取到的代码看，**“工具已执行”与“tool result message 已落到 session”之间确实存在可想象的时间窗**。citeturn17view7turn17view8turn18view2turn18view3

但我必须非常明确：**如果进程恰好在 side effect 已发生、而 result 尚未持久化时崩溃，Pi 当前行为仍属未确认。** 我没有在本轮公开抓取到的资料里找到 write-ahead side-effect log、事务性 side-effect/result commit、或 resume-time side-effect 去重机制的直接证据；同样，我也没有找到足以证明 `resume` / `fork` / generic retry 会不会重复执行有副作用工具的官方保证。存在的是 compaction/summarization 方向的 retry 生命周期说明，以及 `willRetry` 这样的事件字段，而不是端到端的副作用幂等协议。这个问题必须通过本地源码审计与故障注入实验回答。citeturn32search2turn30view2turn25view0turn44view0

## Architecture Comparison

### 三种候选结构的正面对照

| 结构 | Pi Core 修改量 | 事件完整性 | Tool/Context 干预 | Verifier 接入 | Session/Run/Attempt 建模 | 日常可用性 | 升级兼容 | 范围风险 |
|---|---|---|---|---|---|---|---|---|
| 纯 Pi Extension | 最低 | 高，但 retry/attempt 维度不完整 | 很强 | 弱到中 | 弱 | 最高 | 高 | 最低 |
| Pi SDK Runner + Inline Extension | 低 | 高 | 很强 | **高** | **中到高** | 高 | 高 | **中** |
| 独立 Workbench Runner + Pi Session/Runtime Adapter | 中到高 | 取决于你写多少 adapter | 中到高 | **最高** | **最高** | 中 | 中 | **最高** |

**纯 Extension 方案的优点是真实使用门槛最低、最像 Pi 自己的增量生态，也最容易把个人贡献讲成“在不 fork core 的前提下做出 policy 层”。** 官方扩展文档已经明确支持事件拦截、tool registration、state persistence、custom compaction、context mutation 与 provider request 重写；examples 目录里还有 permission gate、protected paths、tool override、custom compaction 等现成范式。因此，如果你的目标只是“做一个可靠性相关扩展”，它当然最轻。问题在于：你的中心问题不是“能不能做一个扩展”，而是“一个 policy 改动是否提升真实 coding task 成功/可靠性且没有不可接受回归”。这要求你必须稳定掌控任务 manifest、run metadata、attempt 标识、verifier 触发时机和 baseline/candidate 对照，而这些都不是纯 extension 的天然强项。citeturn29view0turn34search0turn34search1

**SDK Runner + Inline Extension 方案的优势，在于它把实验控制权放到外层，又不浪费 Pi 已有的 runtime 与 lifecycle surface。** SDK 文档已经明确 `createAgentSession()` 支持非交互 `prompt()` 运行；`AgentSessionRuntime` 则是 interactive / print / RPC 共用的替换层。你完全可以把外层 runner 做成一个很薄的 process：读取固定 task manifest，准备 cwd / sessionManager / model / policy toggle，绑定一个内联 extension 来拦截 `tool_call` / `tool_result` / `context` / `session_before_compact`，再在 agent settled 或 prompt resolve 后触发 deterministic verifier。这样，实验报告的“Task → Run Manifest → Session File → Event Log → Outcome”链条是你自己的；而日常使用时，它仍然是 Pi 本体。**这正好满足“可归因的 reliability 层”而不是“重写 agent runtime”。** citeturn44view0turn15view4turn29view0

**独立 Workbench Runner + Pi Session/Runtime Adapter 方案，只有在两个条件下才应成为首选：其一，源码 Spike 证明 Pi Extension/SDK 缺少关键实验边界；其二，这个缺口无法用极薄 wrapper 补齐。** 否则它会过早走向 OpenHands / Goose / 评测平台式的“自己再做一半运行时”，很容易把第二项目变成“平台工程 + 评测系统 + daily agent shell + trace UI”的混合物。OpenHands 和 Goose 都表明，完整产品化 agent 平台当然有价值，但它们的代码体量、产品面和生态联结会迅速模糊个人贡献。反过来，mini-SWE-agent 的价值恰好在于提醒你：**一个研究基线只要有清晰的任务循环、环境边界和可理解的运行语义，就足够构成强证据；复杂平台不是必要前提。** citeturn41search5turn40search2turn40search0turn40search1

### 暂定推荐与否决条件

**暂定推荐：`Pi SDK Runner + Inline Extension`。** 这是目前最适合首个 Spike 的结构，因为它同时满足四件事：零或极低 core patch 预期、足够强的 runtime hooks、可附着 deterministic verifier、以及仍能作为“自己会真实使用的 coding agent”。如果后续源码审计证明 retry/attempt/crash 边界真的必须深入 core 才能解释，那么这个推荐应被推翻。citeturn44view0turn29view0turn31search3

**直接否决纯 Extension 的条件**不是“做不到功能”，而是如果你发现你不得不把 run manifest、baseline/candidate 调度、verifier、attempt 编号、report 生成都塞进 extension 生命周期里，导致结构完全反转，那它就不再是一个好 Spike。**直接否决独立 Workbench Adapter 的条件**则是相反：如果你发现只加一个薄 SDK runner 就能完成固定任务、policy toggle、event/session link 与 deterministic outcome，那么再去写大的 adapter 层只会制造噪声，而不是增加证据。citeturn44view0turn29view0

### 与外部项目和研究的直接关系

**Harbor / Terminal-Bench** 对你最有价值的，不是“接入排行榜”，而是它把 agent eval 明确建模为“数据集 + 容器环境 + agent adapter + 结果归档”的工程问题。Harbor 官方仓库直接把自己定义为一个在容器环境中运行 agent eval 与 RL 环境的框架，并且是 Terminal-Bench 2.0 的官方 harness。这很适合你借鉴两个概念：其一，固定 task/manifest 的格式化；其二，环境 outcome 与 agent 行为的解耦。它不适合作为 MVP 的地方也同样明显：一旦你现在就完整接 Harbor、完整接 benchmark dataset，你的项目叙事会被“跑框架”而不是“做 policy evidence”掩盖。citeturn40search3

**mini-SWE-agent** 直接证明了“简单 runtime + 强环境边界 + 线性历史”可以成为强基线。它强调 bash-only、线性 message history、`subprocess.run` 的独立动作执行，目的是让 sandbox、debug、扩展和并行化更简单。对你最值得借鉴的不是 Python 实现本身，而是**baseline 要简、动作语义要清、环境执行边界要一眼可解释**。它不适合作为你 MVP 基座的主要原因，是你的第二项目求职信号明确需要 TypeScript agent runtime 与可插拔 extension，而 mini-SWE-agent 的“极简 bash-only”反而会削弱你要展示的 runtime/harness 深度。citeturn40search0turn40search1

**Goose 与 OpenHands** 更适合作为“不要过早复制什么”的参照。Goose 是一个开源、可扩展、已支持 MCP 生态与多 provider 的完整 agent 产品；OpenHands 也是成熟度很高的 AI-driven development 平台。它们解决的是更完整的产品面，而不是你这次要回答的单一可靠性问题。把它们拿来 fork、魔改或重建，虽然看起来“更强”，但最容易让作品集失去个人贡献边界。你当然可以引用它们的机制设计和产品取向作为对照，但不应把它们变成首个闭环的基座。citeturn40search2turn40search4turn41search5

**LangGraph Persistence / Interrupt 与 MCP** 在这里都只应作为机制对照。LangGraph 官方文档明确把 persistence 设计成 step-level checkpointing，把 interrupt 设计成暂停并等待外部输入的恢复机制；同时它也明确提醒：interrupt 之前的 side effect 必须是幂等的，因为恢复时节点会从头运行。这个提醒对你的 Session Policy 与 Side-effect 风险判断非常重要，但并不意味着第二项目要转向 LangGraph 基座。MCP 官方规范则说明 tool 是一个自然的模型控制边界，并强调人类应保有 deny tool invocation 的能力。这只能证明“如果以后出现 Godot/Build/Verifier 的自然工具边界，MCP 是合理封装面”，不能推出“第二项目首阶段必须上 MCP”。citeturn41search7turn41search0turn41search1turn41search2

## First Policy Decision

### 四类 Policy 排名

**我的当前排序是：Completion Verification 第一，Context Policy 第二，Tool Policy 第三，Session Policy 第四。** 这个排序不是按“技术酷炫程度”，而是按你给的标准逐项加权之后得到的。citeturn44view0turn29view0turn31search3

**Completion Verification 排第一**，因为它在“真实、可复现的 coding agent 失败”“可用确定性环境结果判断”“baseline/candidate 因果关系清楚”“能形成可信数字故事”这四个维度上同时最强。外部 verifier 非常天然地把“模型说自己做完了”与“环境真的通过了”拆开，这恰好对应 false completion 这一类高价值 failure。Pi SDK 已经支持程序化 prompt、事件订阅和完整运行结束后的处理，因此外层 runner 非常适合在 agent settled 后直接跑 `test/build/assertions`。更重要的是，Completion Verification 不需要你先拥有完整 replay、完整 event-sourcing 平台或复杂容器系统；它只需要**一个固定任务 + 一个 verifier + 一个 stop/continue/fail 决策点**。citeturn44view0turn29view0

**Context Policy 排第二**，因为 Pi 在这方面的可实现性非常强：`context` 可直接改消息，`tool_result` 可改 tool output 进入上下文的形式，`session_before_compact` 可接管 compaction。换言之，Pi 对“oversized tool result”“externalization”“progressive disclosure”“critical constraint preservation”这些问题，已经提供了足够像样的实验接口。它之所以排在第二，而不是第一，是因为它更容易受到模型随机性与任务分布的污染：同样一次 context 截断/压缩改变，未必会体现在简单、清晰、可复验的环境结果里，尤其是首轮任务规模很小时。citeturn23view0turn24view1turn25view0turn29view0turn30view2

**Tool Policy 排第三**，不是因为不重要，而是因为它在首轮最容易滑向“局部工程优化”而不是“可验证的 harness policy”。Pi 确实允许你 block tool call、改 tool result、做 timeout 相关控制，`bash` 工具本身也有 timeout 解析与可替换 backend；但如果没有一个很强的任务分布和外部 verifier，你很容易只证明“我们把一个工具包起来了”，而很难证明“这条 policy 真实提高 coding task 成功率/可靠性”。它更适合作为第二条或第三条深入 policy，而不是第一枪。citeturn24view0turn24view1turn35view1

**Session Policy 排第四**，只因为首轮公开证据的不确定性最大。它在技术深度上其实可能最高，也确实最能体现 reliability 基础设施能力；但当前 Pi 的公开资料还不能回答你真正关心的那些硬问题：tool side effect 与 persistence 的空窗，resume/fork/retry 的副作用去重，attempt 本体是否存在，崩溃恢复是否有一致性保障。拿不清楚的 runtime 语义做首条 policy，会让 baseline/candidate 的因果链变得很脏。它应该成为第二阶段的重点，而不是第一阶段的入口。citeturn18view2turn18view3turn32search2turn44view0

### 第一选择与第二选择

**第一选择：Completion Verification。**  
形式建议非常克制：只做“Agent 声称完成后，runner 立即运行固定 verifier；若 verifier 未通过，则把 failure 反馈为 candidate policy 触发点，决定 continue / fail / stop”。不要把它扩展成多轮 auto-repair 平台，不要做 dashboard，不要做复杂 case taxonomy。首轮只要能稳定地区分三件事就够了：`agent_final_answer`、`environment_success`、`verifier_failure_type`。这已经足以形成强作品集叙事。citeturn44view0turn29view0

**第二选择：Context Policy。**  
具体只选一个最容易做成“可证伪任务失败”的子问题：我更偏向“oversized tool result externalization + summary/reference re-entry”，而不是一开始就做 compaction 总体重写。原因是它的干预点更窄、对 Pi public API 的依赖更直接、调试也更可解释。你可以把它设计成 candidate policy：对超过阈值的 `bash/read` 结果不直接把全部内容送回上下文，而是保留摘要、落地到外部 artifact，并注入“如何回读”的引用。这样它既是 runtime policy，不只是报表；又不会马上演化成完整 memory 平台。citeturn24view1turn29view0

### 可测指标与主要混杂因素

首条 policy 的主指标，我建议只保留一个：**False Completion Rate**，定义为“agent 给出完成性 final answer，但 deterministic verifier 未通过的运行比例”。辅助指标再保留两个：一是 `Verifier Pass Rate`，二是 `Mean Extra Turns After Verification Failure`。这样既能讲主数字，也能解释策略到底是在减少误报完成，还是只是拖长轨迹。citeturn44view0

主要混杂因素有四个。第一是模型随机性；所以 baseline/candidate 必须尽量固定模型、thinking level、prompt、工具集和任务环境。第二是任务难度漂移；所以首轮只做固定任务而不是任务池。第三是 verifier 本身的不稳定；所以只选确定性 test/build/assertion，不要先用 LLM judge。第四是 session/retry 语义不透明；所以首轮 report 必须明确标出“这次是否发生 retry / compaction / queued continuation”，否则很难解释为什么 candidate 看起来“更好”。citeturn44view0turn32search2

## Minimal Spike Charter

**固定 Coding Task** 应该是一个非常小但足以出现“假完成”的任务。最合适的不是 open-ended 修 bug，而是一个可运行的微型仓库任务，例如：给一个已有测试的 TypeScript 项目，要求 agent 修改一个函数实现并确保 `npm test` 与一个额外 file assertion 同时通过。任务必须故意允许两种常见失败：一是 agent 给出“已修复”，但测试没过；二是 agent只改了症状，没有满足额外约束。这样 completion verification 才真正有意义。这个任务应只用本地文件、shell、test，不引入外网、不引入 MCP、不引入多代理。这个边界与 Pi 自带 coding tools 的能力完全匹配。citeturn35view0turn35view1turn44view0

**Run Manifest** 只需要六个字段：`task_id`、`repo_state`、`model`、`thinking_level`、`tool_profile`、`policy_toggle`。外加一个你自己的 `run_id`。Pi 本身没有我能确认到的 first-class run-id 字段，因此这个 `run_id` 应由外层 runner 维护，并在 session 启动时通过 custom entry 写入 session，或通过 provider/request headers 附着到外部 trace。不要在第一轮设计通用 schema registry。citeturn15view2turn23view0

**Policy Toggle** 只做一个布尔开关：`verification=off|on`。`off` 是 baseline；`on` 是 candidate。candidate 逻辑限于：当 agent settled 且最终回复看起来是完成性答复时，runner 立刻执行 verifier；若失败，则把失败摘要作为后续 steering/follow-up 输入之一，或者直接将本次 run 标记为 failed——两种都可以，但你要选其一并保持一致。不要一开始就做多种 recovery strategy。citeturn15view2turn22view9turn22view10turn44view0

**Session/Event Link** 只要求做到一件事：把你的 `run_id`、`task_id`、`policy_toggle` 与 Pi 的 `sessionId/sessionFile` 建一对一映射。Session 本体继续由 Pi 管；你自己的 event log 只补 session 缺失的事实，例如 verifier start/end、policy decision、外层 attempt number。不要急着把每个流式 token 都抄走。Pi 的 session 已经足够承载会话内容；你的 workbench 只补闭环实验所需的最少外层事实。citeturn44view0turn19view10turn18view3

**Deterministic Outcome** 只用环境型结果，不用 LLM Judge。推荐最小形式：`tests_passed`、`build_passed`、`expected_file_diff_present`。三者合并为最终 verdict。若 verifier 自身出错，则显式标记 `invalid_run`，不要把它算作 agent failure。这样一来，baseline/candidate 的对照因果链就非常清楚。citeturn44view0

**Baseline/Candidate Report** 只需要一页文本/JSON 摘要，而不是 dashboard。至少输出：任务输入、policy 开关、Pi session file、最终回答、verifier 结果、是否 false completion、是否出现 compaction/retry、总 turns、主要 failure attribution。只要这份 report 稳定，那么第二条 policy 才值得进入。citeturn44view0turn32search2

## Falsification and Risk Register

**会直接导致 Pi No-Go 的发现**，我建议明确写成三条。第一，如果本地源码审计证明关键 runtime 事实只能通过大规模 core fork 才能观测或注入，那么 Pi 不再适合作为首个 Spike 基座。第二，如果固定任务的非交互运行实际上依赖隐藏的 TUI 状态、interactive mode 组件或不可替代的 CLI shell，导致 SDK 路径无法稳定复用，那么 Pi 只适合做参考实现。第三，如果你验证出 side effect / persistence 空窗无法被外层 runner 足够可靠地记录或缓解，而首条 կամ第二条 policy又依赖这条边界，那么 Pi 至少不适合作为 Session Reliability 主舞台。citeturn44view0turn31search3turn18view3

**会改变架构结论的发现**也有三条。第一，如果 Extension 实际拿不到你要的 retry / attempt 语义，而 SDK session events 可以，那么推荐结构应进一步偏向“SDK 主导，Extension 只做干预”。第二，如果源码审计显示 session 本身已经包含足够丰富的 retry/compaction/tool result 事实，那么外层 event journal 可以显著缩小。第三，如果 verifier 接入必须由 built-in tool 内部才能实现，而外层 runner 无法得到必要上下文，那么你可能需要一个窄 core patch 或 tool wrapper，而不是保持绝对 zero-patch 信条。citeturn44view0turn25view1turn18view3

**最快的证伪实验**，我建议依次做三件事。第一，写一个只有固定 prompt 和固定 repo 的 SDK 最小脚本，证明不经 interactive mode 也能完整地跑一次 coding task，并拿到 session file、tool events 和 settled 结束。第二，做一个故意超大 `read` / `bash` 输出的任务，看 `tool_result` 与 `context` 扩展能否构成一个真实的 context policy 干预点。第三，做一次受控故障实验：让工具在产生可观测 side effect 之后、但在外层 verifier / report 之前强制终止进程，检查 session 与文件系统状态是否出现 attribution 空洞。第三个实验尤其关键，因为它最能决定第二阶段的 Session Policy 是否值得优先。citeturn24view1turn23view0turn18view3turn17view8

**尚未解决、必须在 Spike 中继续钉死的问题**包括：Pi exact package/release pin 是否应锁到 `0.82.1`；`pi-coding-agent` 与 `pi-agent-core` 的版本不同步是否只是 crawler lag；公开测试中哪些用例真正覆盖 runtime-events / retry / compaction extensions；以及你是否需要在首轮就给 Pi session 增加一个外层 run manifest entry 规范。这些都不是“以后再看”的细节，而是决定作品集可信度的合同边界。citeturn32search0turn31search7turn31search5turn36view0

## Hiring Signal Check and Evidence Appendix

### 高频核心能力

从我抽样到的**官方或官方托管招聘页**来看，与你第二项目最直接对齐、而且出现频率最高的能力，不是某个单一框架名，而是以下五组：**agent/eval、trace/observability、tool use/workflow、上下文/状态管理、以及 Python/TypeScript 的工程实现能力**。LangChain 的岗位把 agent observability 与 evaluation 直接当成核心产品面；Hercules 的岗位把“AI Context & Harness System Design”“online/offline evals”写成单一核心职责；Metaforms 强调 context engineering、evaluation methodology 与复杂非确定系统调试；Sarvam 进一步把 tool schema、idempotency、retry semantics、integration testing、MCP server 运行经验一并放到了 applied AI 工程要求里；Liquid AI 也把 agent orchestration、evals、数据管道与工具集成放进“Internal OS & Agent Platform”的实际工作。把这些职位放在一起看，你想做的第二项目主题——**Coding Agent / Harness / Context / Tool / Session / Eval / Failure Attribution**——不是冷门自嗨，而是与当前市场语言高度贴合。citeturn42search0turn42search1turn42search3turn42search5turn42search7

从语言栈上看，**Python 仍然是更高频的 agent/backend 实现语言，但 TypeScript 明显是可识别的前台/运行时/工具链语言，而不是弱信号。** Hercules 直接点名 TypeScript、React 与 agent framework；Boom 同时强调 Python 与 TypeScript；Metaforms 把 TypeScript列为加分项；Liquid AI 也明确说 Python 强、TypeScript 用于 frontend/tooling 即可。这意味着你把第二项目放在 **TypeScript runtime + Python/Node verifier/tooling 互补** 的叙事里，是合理的，不会显得“拿错了兵器”。citeturn42search1turn42search4turn42search5turn42search7

### 场景性加分能力

**MCP、权限/沙箱、工具语义设计、以及 game/creator tooling 方向**，更适合作为场景性加分，而不是第一阶段必备项。Sarvam 的岗位把“production experience running MCP servers at scale”列为偏强要求之一，说明 MCP 在某些团队已经是明确加分项；但同一组岗位也同时把 eval、observability、tool semantics、retry/idempotency 放在更基础的位置，因此 MCP 更像“在有自然 tool boundary 时应会用”的能力，而不是必须围绕它搭项目。citeturn42search3turn41search2

**游戏研发相关信号是存在的，但它更像你后续的差异化加分项，而不是此阶段主轴。** Epic 官方 careers 列表今天仍可看到多个 `AI Programmer` 岗位，以及直接面向“gameplay tools / UI / AI”的工程岗位；Roblox 官方职位中存在 “Engineering Acceleration”“Agentic Systems”“Embodied AI and Smart NPCs”等方向。这说明“AI + 开发工具链 + 游戏/创作平台”确实有真实岗位语言。但这些信号支持的是“以后加一个 Godot/游戏 adapter 会更有针对性”，而不是“现在就必须把第二项目做成游戏 AI 工具链”。citeturn43search0turn43search2turn43search3turn43search5

### 热门但不值得强行加入的技术装饰

基于这次检索，我最不建议你第一阶段强行加入的内容有五类：**完整多代理编排、通用 observability SaaS、大型 memory 平台、为了 MCP 而 MCP、以及 benchmark/leaderboard 导向的 Harbor 全量集成。** Harbor 与 Terminal-Bench 很有价值，但价值在于任务/环境/eval 建模，而不是你要把自己做成另一个 benchmark runner；Goose 与 OpenHands 很有价值，但价值在于帮助你界定“不要做完整产品平台”；LangGraph persistence/interrupt 很有价值，但价值在于提醒你 checkpoint/side-effect/idempotency 的机制边界，而不是把第二项目倒向另一个 runtime。citeturn40search3turn40search2turn41search7turn41search0

### 样本来源、地区与局限性

本节不是统计学结论，而是**截至 2026-07-29 的定性样本归纳**。样本来源主要包括官方文档/仓库与官方或官方托管招聘页面，地区覆盖美国为主，外加至少一个印度岗位样本；岗位时间分布集中在 2026 年近几个月内。局限性也很明显：第一，agent infra 与 AI coding 招聘很多走 Ashby/Lever/Greenhouse，抓取到的岗位并不等于全市场；第二，不同公司“agent”一词含义差异很大，有的偏平台，有的偏应用；第三，游戏相关岗位对 AI toolchain 的关键词暴露程度通常低于实际需求。因此我只把这些样本用于能力聚类，不把它们包装成“全行业统计”。citeturn42search0turn42search1turn42search3turn42search5turn43search0turn43search2

### 关键来源与访问说明

本报告最关键的 Pi 事实来源，来自 `pi.dev` 的 release/docs 页面，`earendil-works/pi` 官方仓库 README、源码与测试目录，以及对应 npm 官方包页面。对比机制来源主要是 Harbor 官方仓库、mini-SWE-agent 官方仓库、Goose 官方仓库/官方迁移说明、LangGraph 官方文档、MCP 官方规范。招聘信号来源优先使用公司官方 careers 页面或官方托管职位页。所有网页均以本次研究日附近可见版本为准；但**commit SHA 本身并未在本次公开抓取中稳定冻结**，因此后续源码 Spike 开始前应再用本地仓库 clone 把 release/tag/commit 三者绑定一次。citeturn32search0turn31search3turn31search7turn31search5turn40search3turn40search0turn40search2turn41search7turn41search2turn42search1

### 尚未在公开证据中解决的问题

本轮仍未解决、且我建议你在后续本地源码审计中优先回答的问题有七项。第一，Pi 的 exact `engines` floor 与运行时约束。第二，`pi-coding-agent` 与 `pi-agent-core` 的发布版本是否在 Spike 当日完全对齐。第三，tool side effect 与 session persistence 空窗的真实故障语义。第四，resume/fork/retry 是否有官方定义的副作用去重语义。第五，Extension 是否存在我本轮未抓到的 retry lifecycle 完整事件族。第六，官方测试里哪些用例真正在验证 runtime-events / compaction / retry，而不只是类型或 UI 行为。第七，文中提到但本轮未完成一手原文核验的研究论文与文章，包括 “Self-Harness”“Agentic Harness Engineering”“Meta-Harness”“Harness Updating Is Not Harness Benefit”“Self-Evolving Agent Harnesses via Gated Semantic Quality”。这些材料现在最多只能作为检索待办，**不能进入你首轮架构决策的硬证据层**。citeturn36view0turn32search1turn44view0turn25view1