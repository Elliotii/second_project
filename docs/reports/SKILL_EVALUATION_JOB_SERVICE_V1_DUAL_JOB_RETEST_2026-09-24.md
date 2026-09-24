# Skill Evaluation Job Service V1 双真实 Job 复测报告

**日期：** 2026-09-24
**分支：** `codex/skill-evaluation-job-service`
**结论：** `STAGE_1_RETEST_FAILED / BLOCKED`
**执行边界：** 本轮只实施获批的方案 A、零模型回归、一次双 Job 真实复测并停止；未进入 Stage 2/3/4，未 merge、未 push、未自动重试。

## 1. 结论摘要

本轮取得了比上次更强的真实并发证据，但仍不能宣称 Stage 1 通过：

- 两个全新 HTTP Job 均独立入队并由两个 Worker 同时执行；两个 evaluator 重叠约 115 秒，两对 Coding Run 分别重叠 6.372 秒和 3.547 秒，Blind Analysis 重叠 99.416 秒。
- 新诊断记录证明至少 13 对跨 Job 的真实 Analysis Provider 请求发生时间重叠，最长一对重叠 30.654 秒。
- 两个 Job 的四个 Coding Run 全部 `completed/passed`，两份 Thin Mapping 均只引用本 Job 的 Run/root。
- Job B 完整达到 `human_review_ready`，生成正式 Analysis State 及 Markdown/HTML/PDF 报告，15 个公开 Artifact 全部通过 HTTP 与摘要校验。
- Job A 的 Blind Analysis 已合法提交 `alignment_ready` State；其 controlled-unblind Provider 请求也是 HTTP 200、`stopReason=stop` 的正常响应，但模型生成的 JSON 在 root object 中提前多闭合了一个 `}`，使必需的 `follow_up_observations` 字段脱离 root。严格合同解析正确拒绝该输出，因此 Job A 为 `execution_failed`，没有伪造 State 或报告。
- 上一次双 Job 同时 `terminated` 的现象本轮没有复现。方案 A 成功把“传输/Provider 错误”和“正常响应后的正式合同错误”区分开来，但本轮没有新的底层传输异常，因而不能据此确定或宣称上次 termination 根因已经消失。

Stage 1 的验收要求是两个 Job 都完整成功；一成一败仍为失败。成功的 Job B 不能覆盖或拼接 Job A 的失败现场。

## 2. Git、源码与 Spec 身份

| 身份 | Commit | Tree | 说明 |
|---|---|---|---|
| 便携发布基线 | `603207f20436b1c31f67c3234936a9636f1d5c13` | `edc44fc90b52f7ea2ff4ef20b384e0bd8404f7a3` | 历史发布基线，不代表当前 V1 全部源码 |
| 修复前本地基线 | `a75d7aef777c932d8380120c8ff2da3831d15780` | `3d83d1f509b58e2805623b7a5a33d6dcd550b638` | 敏感信息检查后固化的 V1 服务与既有 Analysis 修复 |
| 方案 A 修复提交 | `75b41881d6266ea77a3e7b0ef4f27da9433f55a4` | `6c76207e5e32f765cb295bd42f0e115e01f0223f` | 本轮真实复测使用的 executor 源码 |

修复提交只包含 7 个获批文件；既有未跟踪 `tmp/`、`.env.g005`、`.runs/` 和历史 Job roots 均未提交。没有修改 pinned Pi 或 OpenAI SDK。

新注册 Spec：

- Registry：`.runs/evaluation-service-specs/small-real-v5-diag-20260924/specs.json`
- Spec ID：`small-real-two-run-v2`
- Frozen Plan SHA-256：`66c02d14ad0c85cfed84001b1baa350248961b4f424a62e032acba49a6a07af9`
- `expected_workbench_commit`：`75b41881d6266ea77a3e7b0ef4f27da9433f55a4`
- `expected_workbench_tree`：`6c76207e5e32f765cb295bd42f0e115e01f0223f`
- executor files：21 个，preflight 时全部匹配
- Analysis request timeout：300,000 ms
- Job timeout：2,400,000 ms
- 零模型 preflight：`ready_at_execution_boundary`，`real_model_calls=0`，`credential_reads=0`

## 3. 方案 A 的实际修改

### 3.1 新增的安全、有界诊断

`workbench/src/trace-analysis/model-runner.ts` 新增 `AnalysisProviderDiagnosticsRecorder`，由现有 Harness 事件记录：

- Invocation：blind/controlled stage、fresh/resume、Session ID、开始/结束、终态、实际 request timeout；
- Request：ordinal、dispatch/header/message-end 时间、模型、HTTP status、allowlist request ID、stop reason、数值 usage；
- 内容只记录 block 数、text/thinking 字节数和 Tool 名称；
- `update_state` 分开记录 emitted、execution started、execution completed、persistence 与 formal acceptance；
- 最多 64 个 Invocation、每个最多 128 个请求，诊断写入失败不改变正式 Analysis 验收语义。

诊断文件为 `review/analysis-provider-requests.json`。它明确不记录 Prompt、response/thinking 正文、Tool arguments、Credential 或任意响应 headers；未观察到 header event 只写 `not_observed`，不推断网络一定未收到 headers。

`workbench/src/evaluation-service/worker.ts` 将该文件作为失败和成功 Job 都可发布的公开、带 SHA-256 的诊断 Artifact。Faux 路径记录 injected/0 Provider request，而不伪造网络事件。

### 3.2 修改文件

- `workbench/src/trace-analysis/model-runner.ts`
- `workbench/src/evaluation-service/worker.ts`
- `workbench/scripts/run-faux-evaluation-service.ts`
- `workbench/tests/trace-analysis-model.test.ts`
- `workbench/tests/evaluation-service-faux-formal.test.ts`
- `workbench/tests/evaluation-service-redis.test.ts`
- `workbench/config/evaluation-service/README.md`

### 3.3 能力边界

该实现可以区分：未观察到 headers 的 Provider/error、headers 后 stream error、abort、runtime error、正常响应后的合同错误，以及 partial `update_state` 的 emitted/executed/persisted/accepted 层次。

它不能恢复 pinned Pi 在进入 Workbench 前已丢弃的 socket `cause/code`，也不承诺 request ID 一定由 Provider 返回。本轮两个 controlled-unblind 请求都观察到 headers 和 HTTP 200，但没有可用的 allowlist request ID。

## 4. 零模型回归

| 验证 | 结果 |
|---|---|
| `npm run typecheck` | PASS |
| `npm run evaluation-service:test` | 11/11 PASS |
| Analysis/Review 聚焦测试（`trace-analysis-model`、`trace-analysis-phase4b`、evaluate/review CLI） | 23/23 PASS |
| Faux 正式服务闭环单测（单独复核） | 1/1 PASS；同时包含在 11/11 中 |
| 新 Spec preflight | PASS，零模型、零 Credential read |

新增确定性覆盖包括正常生命周期、headers 前/后错误、abort、runtime error、partial `update_state`、敏感内容不落盘、失败 Artifact 发布，以及 Redis 不可用时已完成 Job 查询/Artifact 完整性与篡改拒绝。

## 5. 真实执行配置

- Redis：`redis:7.4.7-alpine`，`127.0.0.1:6391`，DB 15
- Queue：`skill-evaluation-jobs-v1-diag-retest-20260924-02`
- API：`127.0.0.1:4322`，PID 20688
- Worker：PID 28240、27000；各自 `concurrency=1`
- BullMQ 全局并发：2
- Job root：`D:\AI\ejc2-20260924-02`
- Control/log root：`D:\AI\ejc2-control-20260924-02`
- Credential：Worker-only registry 指向 `.env.g005`；API 配置不包含 Credential registry
- Coding 与 Analysis 模型：`deepseek/deepseek-v4-flash`
- 未降低模型、thinking、Token、Tool、任务或 Analysis 预算；无自动 retry

两个 POST 近同时发起，均返回 HTTP 202、`deduplicated=false`：

| Job | Idempotency key | Job ID | accepted_at | enqueued_at |
|---|---|---|---|---|
| A | `diag-retest-20260924-a` | `847ddb20060c3490a1587a223c6046483f6e17fa51fdcd19821c40a18bcedd08` | `09:12:28.314Z` | `09:12:28.397Z` |
| B | `diag-retest-20260924-b` | `76e23bd1460739352cb1d497400dc3c3743b900761d132ede5e6d5b9f550ef03` | `09:12:28.392Z` | `09:12:28.400Z` |

## 6. 并发时间线与重叠证据

| 阶段 | Job A | Job B | 已确认重叠 |
|---|---|---|---:|
| evaluator dispatch → terminal | `09:12:28.641Z` → `09:14:23.652Z` | `09:12:28.622Z` → `09:15:15.078Z` | 约 115.011 s |
| Coding Run 1 | `09:12:29.736Z` → `09:12:36.108Z` | `09:12:29.736Z` → `09:12:36.192Z` | 6.372 s |
| Coding Run 2 | `09:12:36.115Z` → `09:12:39.748Z` | `09:12:36.201Z` → `09:12:40.860Z` | 3.547 s |
| Blind Analysis | `09:12:39.784Z` → `09:14:20.316Z` | `09:12:40.900Z` → `09:15:09.042Z` | 99.416 s |
| controlled-unblind | `09:14:20.333Z` → `09:14:23.617Z` | `09:15:09.056Z` → `09:15:11.845Z` | 两个 controlled 阶段不重叠 |

诊断 Artifact 进一步确认 13 对跨 Job Provider 请求区间发生重叠。最长一对是两条 Blind Analysis 的第 7 次请求：`09:13:49.634Z` 至 `09:14:20.288Z`，重叠 30.654 秒。Job A 的 controlled-unblind 请求还与 Job B 的 Blind Analysis 第 7 次请求重叠 3.270 秒。这里的区间使用已观察到的 dispatch 与 message-end 时间，而不是用相邻 Tool result 间隔代替 HTTP 请求持续时间。

## 7. 两条 Job 的实际结果

### 7.1 Job A：合法失败，现场完整

- 服务终态：`terminal / BullMQ completed / execution_failed`
- 时间：`09:12:28.524Z` → `09:14:23.652Z`
- 两个 Coding Run：
  - `coding-task-20260924091229734-7c350f8e`：`completed/passed`，5 次请求、7 次 Tool；
  - `coding-task-20260924091236115-1a77abda`：`completed/passed`，4 次请求、6 次 Tool。
- Thin Mapping 存在，只引用上述两个 Run 和本 Job root。
- Blind Analysis：7 次正常 Provider 响应，调用并持久化合法 State，诊断终态 `state_accepted`；State 保持 `alignment_ready`，含 1 个 sealed kept Finding。
- controlled-unblind：1 次 Provider 请求，headers 已观察、HTTP 200、`stopReason=stop`、诊断 classification=`normal`；随后正式解析失败，Invocation 终态 `analysis_contract_error`。
- 最终错误：`Unexpected non-whitespace character after JSON at position 1477 (line 1 column 1478)`。
- 没有 `human_review_ready` State 或报告；服务没有把队列 ACK、Blind State 或部分产物误报为成功。
- `cleanup_confirmed=true`；runner PID 7308、evaluator PID 18300 均已退出。

对 controlled-unblind 输出做了不回显正文的结构核验：assistant text 为 1,506 字符/2,310 bytes；前 1,477 字符是可解析 JSON，但 root 只有 `alignments`。其后恰好是 29 个非空白字符，等于脱离 root 的必需字段 `,"follow_up_observations":[]}`。因此直接机制是模型在该字段前提前多输出了一个 `}`，不是 Provider termination、timeout、HTTP 错误或服务取消。严格 `JSON.parse` 与正式 exact-key 校验没有被放宽。

Job A 总计 17 次 Provider 请求，记录费用约 USD 0.0082397056。

### 7.2 Job B：完整 HTTP E2E 成功

- 服务终态：`terminal / BullMQ completed / completed`
- 时间：`09:12:28.524Z` → `09:15:15.078Z`
- 两个 Coding Run：
  - `coding-task-20260924091229734-7320c5e8`：`completed/passed`，5 次请求、6 次 Tool；
  - `coding-task-20260924091236200-cce08ef1`：`completed/passed`，5 次请求、6 次 Tool。
- Thin Mapping 只引用本 Job 两个 Run/root。
- Blind Analysis：7 次正常 Provider 响应并合法 `update_state`，诊断终态 `state_accepted`。
- controlled-unblind：1 次 HTTP 200、正常 stop 的响应，解析与正式验证通过。
- 最终 Analysis State：`human_review_ready`；1 个 sealed kept Finding 和 1 条 controlled-unblind alignment。
- 正式报告：Markdown 11,868 bytes、HTML 16,314 bytes、PDF 124,733 bytes；Markdown 非空、HTML 有 doctype、PDF 有 `%PDF-` magic。
- HTTP result：`planned_runs=2`、`completed_runs=2`、两个 Verifier 均 passed、`evaluation_status=human_review_ready`。
- `cleanup_confirmed=true`；runner PID 26860、evaluator PID 12612 均已退出。

Job B 总计 18 次 Provider 请求，记录费用约 USD 0.0111903904。双 Job 合计 35 次请求，记录费用约 USD 0.019430096。

## 8. 隔离、安全与 Artifact 核验

- Job A 发布 8 个 Artifact，Job B 发布 15 个 Artifact；逐一经正式 HTTP URL 下载，全部 HTTP 200，声明 bytes、文件 SHA-256 与 `x-content-sha256` 均匹配。
- 两份 Mapping 均使用不同 Run ID、不同 run root，均位于各自 Job 目录，0 个跨 Job 引用。
- 四个 runner/evaluator PID 全部退出；未观察到 Worker crash、stalled redelivery、第二 Attempt 或残留 evaluator。
- 对 `.env.g005` 中唯一 Credential 值执行不输出内容的精确扫描：97 个 Job/control 文件 0 命中，Redis DB 15 的 7 个 key dump 0 命中。
- API/两个 Worker 的 stderr 均为 0 bytes；控制日志只记录各自 ready 配置。
- Redis RDB 已保存为 `D:\AI\ejc2-control-20260924-02\redis-dump.rdb`，SHA-256 `ee2845c2274d2ed5658bc6fab37feccdb5284230dea19f07d7f7d6d098e80e19`。
- 核验完成后 API、两个 Worker 与 Redis 容器均已停止；容器使用 `--rm`，Job/control roots 与 RDB 保留。

## 9. 事实、推断与当前未确认项

### Fact

1. 方案 A 在真实并发中成功生成并发布安全诊断，且没有改变正式 State/Report 验收。
2. 本轮所有已结束的 Analysis Provider 请求都是 headers observed、HTTP 200、normal stop；没有复现 `terminated`。
3. Job A 的直接失败机制是 controlled-unblind 模型输出的 JSON 结构错误；Job B 在相同源码、Spec、模型、timeout 和并发配置下成功。
4. 队列、两个 Worker、Workspace/Mapping/Artifact 隔离、失败传播、进程清理和单条完整 E2E 在本轮均有真实证据。
5. 双 Job 完整成功验收仍未满足。

### Inference

Job A/B 的分叉更符合 controlled-unblind 模型输出的非确定性格式遵循差异，而非共享队列、Worker、Credential、timeout 或 Provider transport 故障。Job B 的同时成功和 Job A 的 HTTP 200/normal stop 支持该判断。

### Unconfirmed

- 本轮没有触发 transport error，不能进一步定位上次两个 `terminated` 的共同外部原因，也不能证明该风险永久消失。
- 尚未调查 Provider-native JSON mode、严格结构化输出或把 controlled-unblind 改为 constrained Tool result 的实际兼容性。当前 pinned Pi 源码可见的 JSON-schema constrained sampling 挂在 Tool 上，不是现成的 response-level JSON 配置；任何采用方案都需要新的范围与合同审核。

## 10. 推荐的下一步决策

当前应维持 `Stage 1 BLOCKED`，先由用户与 Web GPT 选择：

1. **保持严格合同、接受本次失败证据。** 不改代码，不立即重试；优点是零语义变化，缺点是双 Job 验收仍未完成。
2. **授权只读研究 controlled-unblind 的结构化输出路径。** 重点比较 Provider/SDK 可用的 JSON mode、严格 Tool schema 和现有纯文本 exact-JSON 合同；先形成最小方案和确定性测试，不直接进行真实调用。
3. **授权另一次全新双 Job 重试。** 这可能因模型非确定性而通过，但不会消除格式可靠性风险，因此不应把一次通过包装为已经修复。

不建议在未审核的情况下自动重试、自动修补该 29 字符后缀、放宽 exact-key/State 标准，或把 Job B 的成功产物拼接到 Job A。若未来批准任何源码修改，必须形成新的 commit/tree、刷新 Spec identity、重新做零模型 preflight，并使用新的 Job 身份。

## 11. 当前停止点

- Stage 1：`FAILED / BLOCKED`；真实并发和隔离中间证据成立，但双 Job 完整 E2E 未通过。
- Stage 2/3/4：未开始。
- 本轮代码提交：修复前基线 `a75d7aef…`、方案 A `75b41881…`；本报告与持续实施记录按用户后续 Git 指令形成独立本地文档提交。
- 没有 merge/push。
- 按授权在本报告处停止，等待用户与 Web GPT 审核。
