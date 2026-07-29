# Pi / CC Harness Pattern Comparison Matrix

```yaml
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
primary_pi_scope: packages/agent Direct pi-agent-core AgentHarness path
reference_scope: reference/cc-harness-knowledge
comparison_kind: source_and_test_supported_read_only_analysis
```

## 1. 证据边界

**Fact.** 本矩阵中的“Pi 已有能力”只由固定 `.upstream/pi` 源码、测试和 G003 实际报告支撑。`cc-harness-knowledge` 只解释成熟 Pattern，不能证明 Pi 行为。

**Fact.** 比较的主要对象是第二项目已动态采用的 `pi-agent-core` Direct `AgentHarness` 公共路径。对 `pi-coding-agent` 应用层没有做一次新的全量审计；因此“Direct core 不提供某服务”不等于“Pi monorepo 的其他包不存在类似功能”。

**Fact.** `.upstream/pi/packages/agent/src/index.ts:1-47` 导出 Direct Harness、Session、Compaction、Skill、built-in tools 和 types；`.upstream/pi/packages/agent/src/node.ts:1-2` 再增加 `NodeExecutionEnv`。G003 的 emitted-package public import Gate A 已通过（`docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_REPORT.md:137-145`）。

## 2. 总矩阵

| Pattern | `cc-harness-knowledge` 结论 | Pi 已有能力 | Pi 证据路径 | 当前缺口 | 与当前项目相关 | 现在需要 |
| --- | --- | --- | --- | --- | --- | --- |
| Agent Loop | Tool Call/Result、继续原因、终止原因和 settled 边界应显式 | `runAgentLoop()` 处理 provider turn、Tool 批次、steer/follow-up；`AgentHarness` 等待事件、持久化 message 并发出 settled | `agent-loop.ts` `runAgentLoop`(95)、`runLoop`(155)、`executeToolCalls`(411)；`agent-harness.ts` `executeTurn`(581)、`handleAgentEvent`(538)；`agent-harness.test.ts:115,242,408,439` | 没有完整 durable operation ledger；lifecycle/settled 语义仍被上游标为待 hardening | 高；G003 Cycle 的基础 | 已满足 deterministic mechanism；不重写 Loop |
| Context Management | Context 是多源投影；大结果要预算并保留 retrieval path；critical constraints 要跨 compaction | `Session.buildContext()` 从 active branch 构建 compaction-aware messages；turn snapshot 固定当轮 resources/system prompt/tools；read/bash 截断输出 | `session.ts` `buildSessionContext`(138)、`Session.buildContext`(188)；`agent-harness.ts` `createTurnState`(354)；`compaction.ts` `prepareCompaction`(640)；`compaction.test.ts:343,474`；`tools.test.ts:135,576` | Direct Harness 不自动决定 compaction；还没有真实长任务证明关键约束保留 | 中高，但应由真实 context pressure 触发 | 不作为前置 Gate；保留候选 |
| Tool Runtime | validation、permission、execution、result、retry safety 是不同层；副作用可与 Session 分叉 | Loop 校验 schema、支持 before/after tool hook、顺序/并行执行、稳定 `toolCallId` 和 Tool Result；built-in write/edit 有进程内 path mutation queue | `agent-loop.ts` `prepareToolCall`(600)、`executeToolCallsSequential`(433)、`executeToolCallsParallel`(489)、`finalizeToolCall` 附近(760)；`write.ts:15`、`edit.ts:77`、`file-mutation-queue.ts`; `agent-harness.test.ts:439`; `tools.test.ts:255,361` | mutation queue 只在当前 `ExecutionEnv` 进程内；没有 durable Tool Start/Commit/Result ledger 或通用 retry-safe metadata | 高；Verifier 观察真实副作用 | 现有机制足够进入下一阶段；durability 后移 |
| Session / Resume | 持久记录与 runtime reconstruction 分开；settled resume 与 in-flight recovery 分开 | JSONL Session 可 create/open/list/fork，重开会还原 entries/leaf；Session 保存 model/thinking/active-tools/compaction 等 entries | `jsonl-repo.ts` `JsonlSessionRepo.open`(93)；`jsonl-storage.ts` `JsonlSessionStorage.open`(212)；`session.ts` `Session`(150)；`repo.test.ts:47,69`; `storage.test.ts:324`; `session.test.ts:43` | 未动态证明“进程 A 退出→进程 B 重建 Model/Tool/Policy/Workspace→继续”；上游 `durable-harness.md` 也将完整 restore 和 in-flight recovery列为计划 | 条件性；取决于 V0 是否要求跨进程继续 | 不立即验证，不影响当前 Pi Go 判断 |
| Permission / Hook | Hook、Permission、Approval、Execution 权限不同；局部 allow 不应绕过上层 deny | Direct Harness 有 typed `tool_call`/`tool_result` hook，before hook 可 block/patch，after hook 可 patch result/terminate；Node env 负责实际执行 | `agent-harness.ts:439-488` tool hooks；`harness/types.ts:613-632,766-786`; `agent-harness.test.ts:439`; `agent-loop.ts:600-742` | Direct core 没有完整权限/审批/Sandbox 平台；Hook block 不是 OS 隔离 | 中；需清楚标注外部控制责任 | 不建设 Permission 平台；当前受控 workspace 足够 |
| Planning / Todo | 临时计划、持久任务、owner 和 runtime liveness 不应混同 | Direct core 的公共 Harness surface 没有 Planning/Todo 服务；本项目另有 Goal Contract/CURRENT_STATE 控制面 | `src/index.ts:1-47` 公共 surface；`harness/types.ts` Harness options/events；本次 scoped symbol search 未在 `packages/agent/src` 找到 Todo/Task/Subagent runtime symbol | 没有 Agent 内 runtime plan ledger；这不是 Completion Verification 的必要条件 | 低；项目控制已经外置 | 不需要；避免复制完整 Task System |
| Skill | catalog metadata 与 body 分离；visibility、invocation、permission 分离 | `loadSkills()` 解析 `SKILL.md`；system prompt 只列 visible skill metadata；`harness.skill()` 显式把正文作为一次 turn 输入 | `skills.ts` `loadSkills`(49)、`formatSkillInvocation`(38)；`system-prompt.ts` `formatSkillsForSystemPrompt`(3)；`agent-harness.ts` `skill`(673)；`skills.test.ts:9-115` | host 负责 discovery/dedupe/reload；没有证据表明当前 Policy 需要 Skill | 低；有教学映射价值 | 不纳入当前路线 |
| Subagent | child runtime、Session Fork、persistent task 和团队成员是不同对象 | Direct core 提供 Session tree/fork primitives，但没有内建 child-agent orchestration API | `session.ts` tree operations；`jsonl-repo.ts` `fork`; `repo.test.ts:47`; `session.test.ts:43`; scoped public surface `index.ts` | 没有审计 `pi-coding-agent` 全部潜在扩展能力；Direct path 不负责 Subagent | 当前明确 out of scope | 不需要；不构成缺口 |
| Completion / Stop | model stop 不等于 task success；Verifier 应在 settled 后运行；Recovery 必须有 Budget | Loop 产生 assistant stop/agent end；Harness 提供 external `prompt()` completion 和 `settled`/`waitForIdle()`；G003 外部 Driver 在 settled 后运行 Verifier并给 Candidate 一次 Recovery | `agent-loop.ts:155-221`；`agent-harness.ts` `handleAgentEvent`(538)、`executeTurn`(581)、`prompt`(658)；`agent-harness.test.ts:408`; G003 report `:194-199,260-279` | Pi 不内建项目特定 Verifier/Outcome/Policy；真实模型 Policy 效果与最终 Recovery Budget 未验证 | 最高；项目主故事 | 下一阶段的首要候选，但当前未授权执行 |
| Trace / Observability | 事件、持久状态和外部 Outcome 要用稳定 ID 关联；event 不等于 durable evidence | `AgentEvent`/`AgentHarnessEvent` 提供实时 lifecycle；Session 持久化消息和配置 entries；G003 外部 Journal/Manifest/Outcome 关联 run/cycle/tool/session/verifier | `harness/types.ts:518-641` events；`agent-harness.ts:538-565`; `session.ts`; G003 report `:251-292` | Pi Session 不保存完整 Tool lifecycle/Verifier/Policy decision；G003 Journal 是外部最小投影，不是通用 trace platform | 高 | 保留最小 schema；按决策需求扩展 |

## 3. 关键比较解释

### 3.1 Agent Loop：采用公开机制，不复制 Loop

**Fact.** `runLoop()` 在每个 assistant message 后执行 Tool 批次，只有所有 finalized Tool Result 都带 `terminate: true` 时才终止该批次（`.upstream/pi/packages/agent/src/agent-loop.ts:155-221,411-583`）。`finalizeToolCall()` 保留 `toolCallId` 并形成协议 Tool Result（同文件约 `:754-783`）。

**Fact.** `AgentHarness.handleAgentEvent()` 在 `message_end` 时把 Agent message 追加到 Session，然后再通知 listener；在 `agent_end` 后 flush pending writes 并发出 `settled`（`.upstream/pi/packages/agent/src/harness/agent-harness.ts:538-565`）。测试证明 `waitForIdle()` 等待外部 run 和 awaited listener settlement（`.upstream/pi/packages/agent/test/harness/agent-harness.test.ts:408-437`）。

**Inference.** 这已经满足第二项目最小 Cycle 边界。知识包带来的变化不是增加新 Loop，而是更精确地区分 provider stop、agent end、harness settled 和 task verified completion。

### 3.2 Context：Pi 已有机制，缺的是 Policy 证据

**Fact.** `Session.buildContext()` 先从完整 active branch 还原 model/thinking/active tools 等 runtime state，再把 compaction-aware entries 投影为 `AgentMessage[]`（`.upstream/pi/packages/agent/src/harness/session/session.ts:138-209`）。`createTurnState()` 再为一轮固定 context/resources/system prompt/model/tools（`.upstream/pi/packages/agent/src/harness/agent-harness.ts:354-404`）。

**Fact.** Pi 提供 `shouldCompact()`、`prepareCompaction()` 和 `compact()`（`.upstream/pi/packages/agent/src/harness/compaction/compaction.ts:263,640,733`），但 `AgentHarness` 文档明确写着 auto-compaction decision point 尚未实现（`.upstream/pi/packages/agent/docs/agent-harness.md`，“Compaction and tree navigation”）。

**Fact.** built-in read 默认只投影前 2,000 行或 50KB，并给出下一 `offset`；bash 投影后 2,000 行或 50KB并把完整输出保存到临时文件（`.upstream/pi/packages/agent/src/harness/tools/read.ts:45-143`; `bash.ts:51-159`; `utils/truncate.ts:11-12`）。对应测试在 `tools.test.ts:135-177,576-609` 和 `truncate.test.ts`。

**Inference.** “Tool Result Budget / Progressive Disclosure”不是 Pi 完全空白。真实缺口是：固定阈值是否适合本项目、其他 tool 是否也保留检索路径、compaction 是否在真实长任务中丢失 Verifier 约束。这些应由观察到的 failure 决定，而不是 G004 先验 Gate。

### 3.3 Tool Runtime：进程内并发安全不等于崩溃后幂等

**Fact.** write/edit 通过 `withFileMutationQueue()` 按 `ExecutionEnv + canonical path` 串行化当前进程内并发 mutation（`.upstream/pi/packages/agent/src/harness/tools/file-mutation-queue.ts:1-56`）。测试覆盖 abort 后仍等第一次 write/edit settle 才释放 queue（`.upstream/pi/packages/agent/test/harness/tools.test.ts:255-285,361-399`）。

**Fact.** 该 queue 存在 `WeakMap<ExecutionEnv,...>` 中，没有持久化；write/edit 在 `env.writeFile()` 返回后才构造成功 Tool Result（`write.ts:26-35`; `edit.ts:91-124`）。如果进程在写入后、Result 持久化前崩溃，外部文件可能已改变而 Session 不知道结果。

**Inference.** 这正是知识包所说的 side-effect/session divergence，但当前没有观察到真实失败。正确后续是最小 reconciliation case，不是宣称 Pi 不可靠或建设 Exactly-once 平台。

### 3.4 Session / Resume：已有 reopen primitive，完整重建尚未证明

**Fact.** `JsonlSessionRepo.open()` 从 metadata path 打开 `JsonlSessionStorage` 并构造新 `Session`（`.upstream/pi/packages/agent/src/harness/session/jsonl-repo.ts:93-101`）；storage reopen 会解析 header/entries 和最新 leaf（`.upstream/pi/packages/agent/src/harness/session/jsonl-storage.ts:187-220`）。tests 验证 open/fork/header metadata 和 leaf reconstruction（`repo.test.ts:47-89`; `storage.test.ts:324`; `session.test.ts:43`）。

**Fact.** Pi 自己的 durable design 明确规定 host 必须重建 Model Registry、Tool Registry、extensions/resources/auth/hooks，并把 operation/tool-call recovery列为未来设计（`.upstream/pi/packages/agent/docs/durable-harness.md`，“What the app must provide on resume”“Recovery model”“Critical scenarios”）。

**Unconfirmed.** 当前没有运行“全新进程 B”动态场景，也没有证据表明 public API 被阻塞。因而结论只能是 primitive 存在、完整 route 未验证。

### 3.5 Permission / Hook：可 block 不等于完整权限系统

**Fact.** Harness 在 `tool_call` hook 中可返回 `block` 或 patch tool call，在 `tool_result` hook 中可 patch content/details/isError/terminate（`.upstream/pi/packages/agent/src/harness/agent-harness.ts:439-488`; `.upstream/pi/packages/agent/src/harness/types.ts:613-632,766-786`）。`agent-harness.test.ts:439-491` 对 Direct loop hook 做了测试。

**Inference.** 对当前受控 Spike，这足以做适配和观察。它没有定义系统级 path/command approval、用户确认或 sandbox。因此报告中应写“外部控制的 Workspace + NodeExecutionEnv”，不能写“Pi 已提供 Permission/Sandbox”。

### 3.6 Planning、Skill、Subagent：不同取舍，不是缺功能清单

**Fact.** Direct core 的 Skill 路径完整存在：loader 解析 metadata/body，system prompt 列表只投影 name/description/location，`harness.skill()` 由应用显式调用正文（`skills.ts:38-78`; `system-prompt.ts:3-24`; `agent-harness.ts:673-684`; `skills.test.ts`）。

**Fact.** 本次对 `packages/agent/src` 公共 surface 的 scoped search 没有发现 Todo/Task/Subagent orchestration service；Session fork/tree 是持久记录分支，不应当成 child runtime。

**Recommendation.** 当前不采用 Planning/Todo/Subagent，是因为它们不解决第二项目的核心 failure，不是因为参考资料不成熟。Skill 同样不应被用来包装 Completion Verification；Verifier/Policy 必须留在外部 Workbench 控制层。

### 3.7 Completion / Trace：G003 已证明集成机制，不证明效果

**Fact.** G003 Baseline 在第一次 Verifier 失败后停止；Candidate 在同一 Harness/Session 中接收恰好一次结构化 Recovery Prompt，第二次 Verifier 通过（`docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_REPORT.md:194-199`）。Journal 顺序显示 `agent_settled → verifier_started → verifier_completed → policy_decision`（同报告 `:260-279`）。

**Fact.** G003 没有真实模型、Pi patch、WSL、container、SDK/RPC fallback（同报告 `:28-35`）。

**Inference.** 参考知识强化了 G003 的正确解释：Pi 提供 Agent Cycle 和事件，外部 Driver 提供环境 Outcome，Policy 决定受限 Recovery。当前最有价值的下一证据仍是真实模型/真实任务上的 Policy 作用，而不是先补齐成熟 Harness 的所有功能。

## 4. 用户最短源码阅读路径

以下路径按“Entry → Core Symbol → 状态变化 → Test”组织，适合用户把已经学过的概念映射到 Pi：

### Agent Loop / settled

```text
packages/agent/src/index.ts
→ harness/agent-harness.ts#AgentHarness.prompt / executeTurn
→ agent-loop.ts#runAgentLoop / runLoop
→ harness/agent-harness.ts#handleAgentEvent
→ test/harness/agent-harness.test.ts#waitForIdle waits...
```

重点观察：assistant stop、Tool batch、`agent_end`、Harness `settled` 和外部 task success 为什么是不同边界。

### Tool 生命周期与副作用

```text
packages/agent/src/types.ts#AgentTool / AgentEvent
→ agent-loop.ts#prepareToolCall / executeToolCalls / finalizeToolCall
→ harness/agent-harness.ts#emitHook(tool_call / tool_result)
→ harness/tools/write.ts / edit.ts / file-mutation-queue.ts
→ test/harness/agent-harness.test.ts#tool_call and tool_result hooks
→ test/harness/tools.test.ts#mutation queue abort cases
```

重点观察：`toolCallId` 如何贯穿请求/结果，以及进程内 mutation queue 为什么不能自动解决 crash-after-side-effect。

### Session reopen / projection

```text
harness/session/jsonl-repo.ts#create / open / fork
→ harness/session/jsonl-storage.ts#create / open / append / setLeafId
→ harness/session/session.ts#buildContextEntries / buildContext
→ test/harness/repo.test.ts
→ test/harness/storage.test.ts#reconstructs leaf
→ docs/durable-harness.md
```

重点观察：Session 能保存什么，host 必须重建什么，以及 settled resume 与 in-flight recovery 的边界。

### Context / Tool Result Budget / Compaction

```text
harness/tools/read.ts / bash.ts
→ harness/utils/truncate.ts
→ harness/session/session.ts#buildContext
→ harness/compaction/compaction.ts#shouldCompact / prepareCompaction / compact
→ test/harness/tools.test.ts
→ test/harness/compaction.test.ts
```

重点观察：完整 artifact 放在哪里、模型看见什么、summary 和 retained tail 如何进入新的 projection。

### Cancellation

```text
harness/agent-harness.ts#abort
→ agent-loop.ts AbortSignal propagation
→ harness/tools/bash.ts#execute
→ harness/env/nodejs.ts#exec / cleanup
→ test/harness/nodejs-env.test.ts#cleanup terminates... / aborted commands
```

重点观察：发出 abort、tool promise settle、child process tree 停止和 Harness idle 是四件相关但不相同的事。

## 5. 比较结论

**Recommendation.** Direct `AgentHarness` 继续是当前主候选。成熟参考没有发现一个必须在 Phase 3 前填补的架构空洞；它反而让以下边界更清楚：

- Session primitive 已有，完整 runtime reconstruction 未验证但并未受阻；
- Tool Result Budget 已有基础，缺口应由真实长任务触发；
- Cancellation 有源码和上游测试基础，当前 profile 仍是条件性动态未知；
- crash-after-side-effect 是未来高价值 reliability case，不是当前 Pi No-Go；
- Completion Verification 仍是与第二项目目标最直接、最应优先获得真实证据的候选。
