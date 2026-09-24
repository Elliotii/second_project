# Skill Evaluation Job Service V1 双 Job Analysis Termination 定向诊断

日期：2026-09-24  
状态：只读调查完成；Stage 1 仍为 `BLOCKED`；等待用户与 Web GPT 审核  
工作分支：`codex/skill-evaluation-job-service`  
调查边界：未修改功能代码，未发起 Provider/真实模型调用，未复测，未 commit、merge 或 push

## 1. 结论摘要

本轮确认的不是一个可归因到单一组件的最终根因，而是一个更窄、证据更强的故障类别：两个独立 evaluator 的 Blind Analysis 最终请求都已经收到 Provider 响应头和部分流式响应，随后在同一绝对时刻附近以 `stopReason=error`、`errorMessage=terminated` 结束。两个错误时间只相差 29 ms。它们不是 Job 2,400 秒 deadline、Analysis 300 秒 request timeout 到期、Worker crash、BullMQ stalled redelivery、Credential 拒绝或余额错误的已知表现。

当前最受证据支持的解释是：两条同时活跃的流式响应遇到了某个共同的上游事件。共同范围包括 Provider/gateway，以及本机实际使用的 Windows TUN/Clash 网络路径；现有证据不能继续区分 Provider 发送的 SSE error、远端或中间链路关闭/重置连接、TUN/代理事件或其他流传输错误。因此，不把 DeepSeek、并发额度、本机网络、代理或 Pi 中任何一个单独组件写成已确认根因。

同时确认了一个独立的可观测性缺陷：当前 Pi `openai-completions` Provider 把无 HTTP status/body 的流式异常压缩成 `error.message`，本次只留下 `terminated`；异常的 `name`、`cause`、`code`、底层连接原因和 SDK request ID 没有进入 Session 或服务 Artifact。进入 Workbench `model-runner.ts` 时，原始 cause 已不可逆丢失。外层只增加普通错误日志不能恢复本次历史 cause。

建议先实施一个 Workbench 内的最小、安全请求生命周期诊断包：利用现有 Harness 的 `before_provider_request` / `after_provider_response` 事件，记录请求序号、时间、HTTP status、允许列出的 request-id、最终 stop reason、响应 ID、内容类型/字节数以及 `update_state` 的“输出、执行、接纳”分层状态；不记录 Prompt、思考正文、Tool arguments、Credential 或全部响应头。该方案能够把“响应头前失败”和“响应头后流式失败”可靠分开，但不能恢复 Pi 已丢弃的底层 socket cause。除非新证据仍不足，否则不修改 pinned Pi、不包裹全局 `fetch`、不增加自动付费重试或并发限流。

## 2. 已有有效成果与证据边界

### 2.1 两个独立 Job

| 项目 | Job A | Job B |
|---|---|---|
| Job ID | `88a7167ae2889be57aa2874ca63dfaa45257f10173055618bbdf6d786660955a` | `134e3208e3d78294663b3ae1f287a54b7a56cf777f9ab1afefbb04709b98a810` |
| Attempt/launch | `attempt-1/launch-0001` | `attempt-1/launch-0001` |
| 最终服务状态 | `execution_failed` | `execution_failed` |
| Analysis error | `Blind Analysis fresh Provider error before accepted State: terminated` | 同左 |
| 正式 Analysis State / Report | 未生成 | 未生成 |

权威 Job 根目录为 `D:\AI\ejc2-20260924-01\jobs\<job-id>`。每条 Job 的 `request.json`、`spec-snapshot.json`、`queue-receipt.json`、`terminal.json`、`attempt-1/launch-0001/dispatch.json`、`child-terminal.json`、`stdout.log`、`stderr.log` 和进程记录均保持原样。

### 2.2 失败前已经成立的 Stage 1 中间证据

**Fact：** 两个 evaluator 实际执行区间重叠 190,349 ms；Run 1 重叠 7,326 ms，Run 2 重叠 4,203 ms，Blind Analysis 重叠 176,977 ms。这证明的是真实执行重叠，不只是同时入队。

**Fact：** 四个真实 Coding Run 均完成；External Verifier 全部通过。每个 Run 有 5 次 Provider 请求和 6 次 Tool 调用。两个 Job 使用独立 runner/evaluator PID、工作目录、Run ID、Session 和输出根。

**Fact：** 两份 `evaluation-output/mapping/thin-evaluation-mapping.json` 只引用本 Job 的两条 Run，没有跨 Job 引用。

**Fact：** 两个失败终态及 12/12 个失败诊断 Artifact 可经正式 HTTP Artifact 接口读取，返回字节数与 SHA-256 一致；敏感信息扫描没有命中。

**Fact：** 临时 API、两个 Worker 和 Redis 已按先前实施记录停止；两条 `terminal.json` 的 `cleanup_confirmed=true`，记录的 runner/evaluator PID 已不存在。没有 Worker crash、stalled、重复投递或清理失败证据。

**结论：** 这些有效成果不因 Analysis 失败而作废，但 Stage 1 的完整双 Job E2E 验收仍未通过，因为两条 Job 都缺少正式 Analysis State 和最终报告。

## 3. 精确时间线

以下时间均为 UTC，来自 Job dispatch/terminal、Run Manifest、Pi Analysis Session 和 child terminal。Session 只持久化完整 message/tool result 的完成时间，没有请求发起、首字节或逐 chunk 时间；因此“最后 Tool result 到 error”的间隔不能当作真实 HTTP 请求时长。

| 事件 | Job A | Job B | 证据含义 |
|---|---:|---:|---|
| runner 记录 | 19:39:08.487 | 19:39:08.496 | 两个独立 runner |
| evaluator dispatch | 19:39:08.643 | 19:39:08.660 | 相差 17 ms |
| Run 1 | 19:39:09.746–19:39:17.674 | 19:39:09.747–19:39:17.073 | 真实 Coding 重叠 |
| Run 2 | 19:39:17.683–19:39:21.980 | 19:39:17.080–19:39:21.886 | 真实 Coding 重叠 |
| Blind Analysis Session 开始 | 19:39:22.010 | 19:39:21.920 | 相差 90 ms |
| 第一条完整 assistant response | 19:39:22.771 | 19:39:22.816 | 两边均成功建立 Analysis 请求链 |
| 最后一条成功 assistant response | 19:41:05.594 | 19:40:40.161 | 各自最后一条完整成功响应 |
| 最后一组持久化 tool result | 19:41:05.596–05.598 | 19:40:40.163–40.166 | 不是下一 HTTP 请求的已知起点 |
| 最终 error AssistantMessage | 19:42:18.987 | 19:42:19.016 | 相差 29 ms |
| child terminal | 19:42:19.009 | 19:42:19.043 | 都由 Analysis Provider error 结束 |

从最后持久化 Tool result 到 error 的可见间隔分别为约 73.389 秒和 98.850 秒。**Unconfirmed：** 当前 Session 没有下一请求的精确 dispatch、header 或 chunk 时间，不能据此断言两次最终 HTTP 请求分别运行了 73 秒和 99 秒，也不能用该间隔严格排除某个从连接或空闲状态起算的外部 timeout。

最终失败 response 自身提供了更关键的边界：

- Job A：`responseId=edbd0fa0-20d8-4b8f-983f-2c4443727100`，`responseModel=deepseek-flash`；已收到约 2,551 个 UTF-8 字节的 thinking 内容，然后以 `stopReason=error`、`terminated` 结束。
- Job B：`responseId=828288d5-8c52-49df-81d3-2ee3fba2a621`，`responseModel=deepseek-flash`；已收到约 21,082 个 thinking 字节和一个 `update_state` ToolCall 片段，arguments 约 4,658 字节，然后同样结束。
- 两条失败 response 的 usage 均为零。这不能证明 Provider 没有生成内容；Session 中的 response ID 和已持久化内容证明流式内容已经到达，只是失败 response 没有形成正常 usage 结算。

## 4. 本机网络与实际 Provider 请求路径

### 4.1 Provider 与运行时身份

**Fact：** 当前 Analysis 注册的模型为 `deepseek-v4-flash`，Provider base URL 为 `https://api.deepseek.com`，API 类型为 `openai-completions`；Provider 返回的 response model 为 `deepseek-flash`。模型正式配置保持最大 384,000 output tokens、1,000,000 context 与 `thinking=max`，没有为本次并发测试偷偷降低模型、Token、Tool 或任务预算。

**Fact：** pinned Pi commit 为 `027a5847901b5dde30270abaa1041046cd2b4b55`；OpenAI SDK 为 `6.26.0`；Node 为 `v24.14.1`，其 vendored undici 为 `7.24.4`。入口配置位于 `workbench/src/trace-analysis/model-runner.ts`，Provider 实现在 `.runs/v0-a/pi/packages/ai/src/providers/openai-completions.ts`，Harness 在 `.runs/v0-a/pi/packages/agent/src/harness/agent-harness.ts`。

### 4.2 环境代理与 TUN 路径

**Fact：** 调查时当前进程环境中没有 `HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY`、`NO_PROXY` 的大小写变体，也没有 `NODE_USE_ENV_PROXY`；WinHTTP 显示 Direct，WinINET `ProxyEnable=0`。注册表中虽保留一个 ProxyServer 值，但当前被禁用，不能据此认定 SDK 使用了显式 HTTP proxy。

**Fact：** Clash Verge 的当前生成配置 `C:\Users\HUAWEI\AppData\Roaming\io.github.clash-verge-rev.clash-verge-rev\config.yaml` 启用了 TUN：`mode=global`、`tun.enable=true`、`stack=gvisor`、`auto-route=true`、`strict-route=false`、`auto-detect-interface=true`。当前路由表中 Meta TUN 接口有 IPv4/IPv6 默认路由，同时 WLAN 默认路由仍存在。`clash-verge`、`verge-mihomo` 和 `clash_verge_service` 在本次历史时段已运行。

**Fact：** Clash service 历史日志 `C:\Users\HUAWEI\AppData\Roaming\io.github.clash-verge-rev.clash-verge-rev\logs\service\service_2026-09-24_01-04-29.log` 在本地时间 `2026-09-24 03:39:12.757 +08:00` 记录了恰好两条从 TUN `198.18.0.1` 的不同端口到 `api.deepseek.com:443`、`using GLOBAL` 的 TCP 连接。它们出现在两个 evaluator dispatch 后约 4.1 秒。

**Inference：** 数量、目标和时间与两条并发 Analysis/Evaluation 连接高度一致，足以证明本次 Provider 流量实际经过 TUN/Clash，而不是仅由静态配置推测。日志没有 PID、Job ID 或 request ID，不能把某个源端口严格绑定到 Job A/B。

### 4.3 可追溯和不可追溯的历史网络事件

**Fact：** Clash service 日志在本地 03:37–03:44 的相关窗口没有 warn/error/fatal，也没有 reload/reset/timeout 文本；但该日志只记录连接建立，不记录连接关闭、TCP reset、流 chunk、选中节点详情或 Provider request ID。在 03:42:18–03:42:19 没有足以解释终止的记录。

**Fact：** Windows System、Application、NetworkProfile Operational 和 WLAN AutoConfig 在同一时间窗口未找到相关警告/错误或网络切换事件。DNS Client Operational、TCPIP Operational 和 WinINet Analytic 当时未启用，不能回溯缺失事件。

**Unconfirmed / 无法追溯：** 现有日志无法确认或排除代理重连、出口节点切换、远端 reset、流式空闲 timeout、瞬时 WLAN/TUN 抖动或 Provider/gateway 主动结束。没有查到事件不等于网络没有发生异常。

**Fact：** 两条 Analysis 在不同 evaluator 进程中创建各自的 Harness、OpenAI client 和 process-local fetch/连接池，不共享进程内 Client 或 AgentHarness。它们共享 Windows 网络栈、TUN/Clash/上游出口、Provider base URL、模型和 Provider 账户。这限定了“共同事件”的可能层级，但不能确认具体层级。

## 5. `terminated` 的错误传播链

### 5.1 实际调用链

1. `workbench/src/trace-analysis/model-runner.ts` 的 `runAnalysisInvocation()` 创建 `AgentHarness`，注册 Tool 和正式 State 验收，并订阅 Harness 事件。
2. `.runs/v0-a/pi/packages/agent/src/harness/agent-harness.ts` 的 `createStreamFn()` 发出 `before_provider_request`，调用 Models；收到 HTTP response 后可通过 `after_provider_response` 暴露 status 和 headers。
3. `.runs/v0-a/pi/packages/ai/src/providers/openai-completions.ts` 调用 OpenAI SDK chat completions，传入 `timeout: timeoutMs` 与 `maxRetries: 0`，通过 `.withResponse()` 获得 response/status/headers，再消费流。
4. `node_modules/openai/src/client.ts` 的 `fetchWithTimeout()` 用 AbortController 包围 `fetch()`，但在 `fetch` 返回 response headers 后即清除该 timer；它不覆盖后续 SSE body 的完整消费。
5. `node_modules/openai/src/core/streaming.ts` 继续读取响应 body。body iterator 异常会原样抛出；SSE data 中的 error 也可以转换为 SDK APIError 后抛出。
6. Pi `openai-completions.ts` 捕获异常后调用 `normalizeProviderError()` / `formatProviderError()`，最终写入 error AssistantMessage。
7. `.runs/v0-a/pi/packages/agent/src/agent-loop.ts` 在 `stopReason=error` 或 `aborted` 时先返回，早于 ToolCall 执行循环。
8. Workbench `assertBlindAnalysisTerminal()` 将其分类为 `analysis_provider_error`；Evaluation CLI、Worker 和 HTTP Artifact 只能继续传递已经归一化的 `terminated`。

### 5.2 信息在哪一层丢失

**Fact：** OpenAI SDK 流读取层能接触原始 thrown value；SDK APIError 可能带 status、headers、request ID/body，低层网络异常可能带 `name`、`cause`、`code` 或连接关闭信息。

**Fact：** Pi 的归一化只提取 status、body 和 message。对于没有 status/body 的本次错误，最终只保留 `error.message`，即 `terminated`；没有保留 `name`、`cause`、`code`、request ID 或安全诊断分类。虽然 AssistantMessage 类型支持 diagnostics，当前 Provider 没有填入这些字段。

**Fact：** 在已检查的 Workbench model runner、Pi openai provider 以及 OpenAI SDK client/streaming 源码中没有生成字面量 `terminated` 的分支。因此该字符串来自更低层的异常 message 或 Provider SSE error，再被 Pi 原样压缩为 message。

**结论：** 到 `model-runner.ts` 收到 error AssistantMessage 时，底层 cause 已不可逆丢失。Workbench 外层可以准确记录请求阶段、response status/request-id 和终止前已收到的数据，但无法只靠现有事件恢复本次或未来同类错误的原始 socket cause。

### 5.3 现有请求级证据的能力

**Fact：** Session 记录了完整 AssistantMessage、ToolCall/ToolResult、response ID/model、stopReason、errorMessage 与成功 response usage，能证明本次错误发生在收到 response headers/content 之后。

**Fact：** `model-runner.ts` 当前没有把 `before_provider_request` 和 `after_provider_response` 记录成 Artifact，也没有请求序号、header 时间、允许列出的 request-id 或 chunk 生命周期。stdout/stderr 只保留上层 failure 和 Node experimental loader warning；没有 Provider debug log。环境中也未设置 `OPENAI_LOG`、`DEBUG` 或 `NODE_DEBUG`。

**Fact：** HTTP failure Artifact 当前包含 request/spec/queue、stdout/stderr 和 log metadata 等安全文件，但不公开原始 Analysis Session。这个安全边界是合理的，不建议为了诊断直接发布含思考正文与 Tool arguments 的 Session。

### 5.4 Job B 的 `update_state` 生命周期

必须区分四个事实层次：模型流中输出 ToolCall 片段、Harness 收到完整 ToolCall、Tool 实际执行、正式 State 持久化。

**Fact：** Job B 的最终 error AssistantMessage 中存在名为 `update_state` 的 ToolCall 内容；这只证明一部分 ToolCall 被组装进 error message。

**Fact：** 该 arguments 只含 `matrix_triage_complete` 和 `investigation_agenda`；正式 `update_state` Schema 还要求 `notes`、`open_questions`、`next_action` 和 `finding_drafts`。按持久化内容，它不是一个可验收的完整 State 提交。

**Fact：** Pi agent loop 对 `stopReason=error` 立即返回，根本不会进入 ToolCall 执行循环。因此这次 `update_state` **没有执行**，不是“是否开始执行尚不确定”。Session 没有相应 ToolResult，输出根也没有 Analysis State；正式验收正确地拒绝了它。

**结论：** 不得从 error response 恢复或补造 State，也不得把输出片段描述为有效 State 调用。后续诊断应单独记录 ToolCall emitted、Tool started、Tool completed、State accepted 四种状态。

## 6. 共同生命周期、timeout 与资源边界

### 6.1 已核实的边界

| 层次 | 当前值/机制 | 本次判断 |
|---|---|---|
| HTTP | 提交后异步返回 | 没有请求处理线程等待完整 Evaluation |
| BullMQ Worker | 两个独立 Worker，各 `concurrency=1`；全局并发 2 | 两 Job 各占一个 Worker；无 stalled/redelivery |
| BullMQ lock | `lockDuration=120s`，`stalledInterval=30s`，自动续锁 | 没有 lock/stalled 触发证据 |
| Job/evaluator deadline | 2,400,000 ms | 两 Job 约 190 秒结束，未命中 |
| Coding task timeout | 最大 900,000 ms | 四个 Run 数秒完成，未命中 |
| Analysis Provider timeout | 300,000 ms，`maxRetries=0` | 实际传到 SDK，但语义是 fetch 到 headers，不覆盖完整 SSE body；最终 response 已收 headers/content |
| Analysis invocation | Review 规定的有限 invocation 次数 | fresh invocation 在提交 State 前遇到 Provider error；没有 180 秒 wall timer |

**Fact：** 在当前 Workbench、pinned Pi 和相关 SDK 路径中未找到能解释本次“约 180 秒共同终止”的已配置 `180000` 隐含 timeout。总执行约 190 秒不等于存在 180 秒限制。

**Fact：** 两个 Worker、runner、evaluator PID 均不同：API PID 18212；Worker PID 21940/7756；Job A runner/evaluator PID 30760/6248；Job B runner/evaluator PID 9992/27136。两个 evaluator 不共享 Node event loop、Harness、OpenAI client、SDK连接池或单一父进程 timer。

**Fact：** 300 秒 `timeout` 不能成为本次直接触发器：两个最终 response 已经进入流读取阶段；当前 SDK 在 headers 返回后清除 fetch timer。此外整个 Blind Analysis Session 也只有约 177 秒。

**Unconfirmed：** 外部 Provider、gateway、Clash 节点或网络设备是否有连接寿命/空闲边界。当前本机配置与历史日志没有相应数值或关闭原因。由于缺少精确 request/header/chunk 时间，不能严格计算最终流的实际持续时间。

## 7. 根因判断

### 7.1 已确认事实

1. 两个失败都是 response headers/content 之后的流式阶段错误，不是尚未连上 Provider 的失败。
2. 两个独立 evaluator 在相差 29 ms 的绝对时刻得到相同 `terminated`，而它们此前最后一条成功 Tool result 的时间相差约 25 秒。
3. Job timeout、300 秒 SDK fetch-to-headers timeout、Worker crash/stalled、Credential 拒绝、429、余额错误均没有触发证据；其中前两个可由时间和代码路径排除为直接触发器。
4. Pi Provider 的错误归一化确实丢失了本次需要的底层类别/cause/code/request-id，构成需要修复或绕开的可观测性缺陷。
5. Job B 的 partial `update_state` 没有执行，也不满足正式 Schema；拒绝持久化是正确行为。

### 7.2 最受支持的推断

**Inference：** 两个独立进程内的不同长度流在同一绝对时刻终止，更符合一个位于共同外部路径上的事件，而不像各自命中同一个从请求开始计时的本地 timeout。共同路径包括 Provider/gateway 和 Windows TUN/Clash/上游出口。

这只是故障类别推断，不是组件归因。29 ms 同时性很强，但不能回答共同事件由谁发起。

### 7.3 当前不能确认或排除

- Provider 在 SSE 中返回 error；
- Provider/gateway 主动关闭两条流；
- TUN/Clash/上游代理节点重置或中断两条连接；
- 瞬时本机/无线网络事件没有进入现有 Windows 日志；
- 某个外部连接寿命或空闲 timeout；
- Provider 账户/模型层面的并发或速率政策，但当前没有 429/status/错误正文支持它；
- 其他 OpenAI SDK/undici 流消费异常。

不把 DeepSeek 余额不足列为主要假设：用户已确认额度，日志也没有余额错误。它不是当前证据支持的解释。

## 8. 拟议最小修复

以下均为待审核方案，本轮没有实施。

### 8.1 方案 A：Workbench 内的安全请求生命周期诊断（推荐）

#### 修改位置

1. `workbench/src/trace-analysis/model-runner.ts`
   - 在 `runAnalysisInvocation()` 周围利用现有 Harness `before_provider_request`、`after_provider_response`、`message_end` 与 Tool 生命周期事件。
   - 为 Blind/controlled-unblind 的每次 invocation 生成一个有界、安全的 `analysis-provider-requests.json`（或 JSONL）。
2. `workbench/src/evaluation-service/worker.ts`
   - 将该安全诊断文件加入失败 Job 的 `diagnosticArtifacts`，沿用现有 bytes/SHA-256、路径限制和篡改拒绝机制。
3. 对应测试文件
   - `workbench/test/trace-analysis-model.test.ts` 及现有 Analysis/Review 测试；
   - Evaluation Service 的 Faux/Artifact 测试。
4. 配置/文档
   - 明确 `analysis_request_timeout_ms` 在当前 OpenAI SDK 中是 fetch 到 response headers 的 timeout，不是完整 SSE stream deadline。暂不调整其数值。

#### 每次请求允许记录的字段

- review mode、Session/Invocation 身份、request ordinal；
- `before_provider_request` 时间；
- `after_provider_response` 时间、HTTP status；
- 严格 allowlist 的 request-id 响应头（存在才记录；不保存全部 headers）；
- `message_end` 时间、response ID/model、stopReason、归一化 error message；
- usage 是否存在及数字字段；
- 内容 block 类型、数量和字节数，不含正文；
- ToolCall 名称/数量，不含 arguments；
- `update_state` 的 emitted / execution_started / execution_completed / state_accepted 分层布尔值或计数；
- 阶段分类：`failed_before_headers`、`stream_error_after_headers`、`normal`、`aborted`。

#### 明确禁止记录

Credential、Authorization、代理认证、Prompt/私人输入、thinking/text 正文、Tool arguments、完整 response headers、Workspace 文件内容。错误 object 不能直接 JSON stringify；只能经 allowlist sanitizer 输出。

#### 该方案能解决什么

- 准确测量 request dispatch→headers→message end，而不是用最后 Tool result 猜请求时长；
- 区分 DNS/connect/pre-header/HTTP status 类失败与 headers 后的流式失败；
- 在 Provider 暴露时关联安全 request ID；
- 证明 partial `update_state` 到底只被输出，还是实际执行/接纳；
- 让失败诊断通过 HTTP 安全查询，并受现有 Artifact 完整性合同保护。

#### 该方案不能解决什么

- 不能恢复本次历史失败已经丢失的 cause；
- 如果 Pi 继续只暴露 `terminated`，不能区分 Provider SSE error、socket reset 和 TUN/代理关闭；
- 不会使失败自动成功，也不提供 retry、恢复或并发整形。

### 8.2 方案 B：深入捕获原始 cause（条件方案，暂不推荐）

若方案 A 的新证据仍无法区分并且该区分对产品决策确有必要，再单独审核以下之一：

- 为 Workbench 增加本地 Provider adapter，在异常归一化前输出严格脱敏的 `name/code/cause/status/request-id`；或
- 经单独授权修改/维护 pinned Pi provider 的 diagnostics 填充。

不建议现在全局 monkeypatch `fetch`：AgentHarness 的受支持 stream options 没有暴露 fetch 注入，global wrapper 容易改变所有 Provider 行为并造成敏感日志风险。也不建议只打开 OpenAI SDK debug log；它不保证记录 mid-stream cause，且可能扩大敏感数据面。

### 8.3 现在不应做的修改

- 不降低模型、thinking、Token、Tool 或 Evaluation 预算；
- 不放宽 Analysis State、Finding、controlled-unblind 或 Artifact 合同；
- 不从 error response 恢复/伪造 `update_state`；
- 不增加自动付费 retry；
- 不在没有 429/政策证据时增加 Provider 并发 admission/rate control；
- 不修改 `.upstream/pi`，不建立新的恢复平台或调度系统。

## 9. 确定性回归方案

方案 A 实施后，先进行零模型验证：

1. 用 Faux/custom Harness event sequence 覆盖正常 response、headers 前 error、headers 后 partial stream error、aborted，以及 error response 携带 partial `update_state`。
2. 断言 error message 中的 ToolCall 不执行、不产生 State；正式 State 验收标准不变。
3. 断言 request ordinal、三个时间点、status/request-id allowlist、stop reason 和阶段分类正确。
4. 断言 Prompt、response/thinking 正文、Tool arguments、Credential、Authorization 和非 allowlist header 不进入诊断文件。
5. 通过 Evaluation Service Faux Job 验证失败诊断 Artifact 的 HTTP 枚举、bytes/SHA-256、路径限制和篡改拒绝。
6. 运行受影响的 TypeScript 检查、Analysis/Review 聚焦测试与 Evaluation Service 聚焦回归；不重跑无关的大规模 fake 并发或 SWE-bench。
7. 因 `model-runner.ts` / `worker.ts` 属于 executor source identity，修复后必须刷新注册 Spec digest，并对最终源码身份执行零模型 preflight；不能让修改后的源码继续使用旧 Spec 身份。

## 10. 拟议真实复测顺序

以下真实调用均需新的明确授权；本轮没有执行。

### 10.1 固定修复前 Git 基线

依照已约定顺序，先检查完整 diff、未跟踪/ignored 文件和敏感信息，再在独立分支创建可回退的本地修复前 commit。必须排除 `.env*`、Credential、`.runs/`、临时控制目录和外部 Job Artifact。Git 基线不替代 `D:\AI\ejc2-20260924-01`、Redis 快照及历史 Session 的保留。

### 10.2 可选但推荐：两个独立 Analysis-only Review 并发

分别复用 Job A、Job B 自己的 Frozen Plan、Thin Mapping 和两个已完成 Run，在两个新的空输出根、两个新的 Review 身份中并发执行 Analysis-only：

- 目的：以较低成本直接复现或否证“两个 Analysis 流并发时共同终止”，并验证新诊断能否捕捉 dispatch/header/end/request-id；
- 约束：两边不能交换或拼接 Run/Mapping；原失败 Job/Session/terminal 不修改；无自动 retry；
- 成功能证明：既有真实证据上的并发 Analysis/Review 链路可以完成；
- 不能证明：HTTP、BullMQ、Worker、Coding、Mapping 到 Report 的完整双 Job E2E；因此不能替代 Stage 1 最终复测。

实际调用规模只能估计：按本次轨迹，每个 Review 约 7–15 次 Provider 请求，必要时另有 controlled-unblind；这是计划参考，不是调用硬上限。若任一出现新的非预期失败，应保存两边现场、完成诊断并停止，不自动重试。

### 10.3 Stage 1 最终复测：两个全新 HTTP Job

在 Analysis-only 结果与新诊断通过审核后：

1. 使用最终修复源码/本地 commit 重新生成并 preflight 一个合法 `small-real-two-run-v2` Spec；记录 executor commit/tree/digest。
2. 通过正式 HTTP API 提交两个不同 idempotency key 的全新 Job；独立 Job ID、Attempt、输出根和 Workspace。
3. 使用两个独立 Worker，各 `concurrency=1`、全局并发 2；不提高到 4/8。
4. 验证两个 evaluator 及至少一对真实 Coding Run 或 Analysis 区间重叠。
5. 分别核验 Run、Verifier、Mapping、Analysis State、必要的 controlled-unblind、Markdown/HTML/PDF 报告、HTTP status/result/artifact 和敏感信息隔离。
6. 两 Job 都满足正式合同才可宣称 Stage 1 通过。任一非预期失败时，允许另一条已合法运行的 Job 按既有生命周期安全结束，然后保存两边现场、报告并停止。
7. 无论成功或失败，复测后停止供用户审核；不自动进入 Stage 2，也不继续重试。

完整双 Job 预计至少包含 10 次 Coding Provider 请求（四个 Run，每 Run 5 次的本次实测基线）加两条 Analysis/可能的 controlled-unblind 请求序列。实际次数由正式模型行为决定，不应通过降低预算来压缩。

## 11. 源码与 Git 状态

**Fact：** 当前便携发布基线 HEAD 为 `603207f20436b1c31f67c3234936a9636f1d5c13`，HEAD tree 为 `edc44fc90b52f7ea2ff4ef20b384e0bd8404f7a3`；这只是旧提交身份，不代表包含当前未提交服务实现的全部工作树源码。Analysis Agent v2.1 的 canonical commit `09681da3e80728f91adfd54c8bc5c2c2abf75345` 也不是本工作树当前完整身份。

**Fact：** Stage 1 使用的 `small-real-two-run-v2` Spec 在提交前完成了 21 个 executor source 文件 digest/preflight，并与当时实际工作树一致。任何实施方案 A 的源码改动都会使该 executor identity 过期，必须生成新的 Spec 身份。

**Fact：** 工作树在本轮调查开始前已经包含大量 V1 服务未提交修改和未跟踪报告。本轮未修改任何 TypeScript/JavaScript/配置/测试/Provider/Pi 功能文件，只新增本诊断报告并在持续 Implementation Log 追加引用。

**Fact：** 本轮没有真实 Provider 调用、并发复测、服务重启、网络切换、功能修复、Git commit、merge 或 push。历史成功/失败 Job、Session、Run、Mapping、terminal、日志和 Redis 快照均未覆盖。

## 12. 需要用户与 Web GPT 审核的决定

1. 是否批准“方案 A”作为下一轮唯一的首选修复包：Workbench 请求生命周期诊断 + failure Artifact 发布 + 精确定性测试，不动正式评测语义。
2. 是否同意只澄清 300 秒参数的真实 SDK 语义，暂不提高/降低 timeout，也不增加自动 retry 或并发限流。
3. 是否批准下一轮先做敏感信息检查并固定本地修复前 Git 基线，再实施修复、回归、刷新 Spec/preflight。
4. 修复通过后，是否批准先执行两个独立 Analysis-only Review 并发，作为区分共同流错误的低成本诊断步骤。
5. Analysis-only 审核后，是否批准两个全新合法 HTTP Job 的 Stage 1 最终复测；复测后无论成功或失败均停止，不自动进入 Stage 2。
6. 只有方案 A 仍无法回答实际决策所需问题时，是否再单独评估方案 B；当前不建议预授权 pinned Pi/SDK 大改。

## 13. 当前停止点

Stage 1 维持 `BLOCKED`。已有真实并发、Coding、Verifier、Mapping、隔离及故障可查询证据有效，但完整双 Job E2E 未通过。当前等待用户与 Web GPT 审核；不实施拟议修复、不发起真实调用、不复测、不推进 Stage 2/3/4。
