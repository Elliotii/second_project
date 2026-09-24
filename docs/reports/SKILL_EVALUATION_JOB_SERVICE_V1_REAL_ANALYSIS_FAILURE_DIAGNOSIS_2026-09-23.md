# Skill Evaluation Job Service V1 真实 Analysis 失败诊断

日期：2026-09-23  
性质：只读失败调查与后续验证方案  
范围：`small-real-two-run-v2` 的第二次、短 Job 根目录真实执行  
结论状态：诊断完成；未实施修复；未发起新的真实模型调用

## 1. 调查对象与边界

本报告调查 Job：

`232dc13b8eed5e6ef2c7ada5630639e792ef6a20e3736d95020f23df105630f1`

Job 根目录：

`D:\AI\evalsvc-v2-r1\jobs\232dc13b8eed5e6ef2c7ada5630639e792ef6a20e3736d95020f23df105630f1`

冻结 Evaluation Spec：`small-real-two-run-v2`。

本轮只读取既有源码、Job Artifact、Analysis Session 和测试合同，并执行零模型 dry-run 与聚焦确定性测试。没有修改失败 Job、Frozen Plan、Thin Mapping、Coding Run、Verifier Artifact、服务源码或项目状态；没有联网、Provider 或付费模型调用。

## 2. 核心结论

### 2.1 已确认事实

**Fact 1：** Analysis 从未调用 `update_state`。Session 内没有 `update_state` tool call，也没有 State 校验错误或 State 写入失败记录。因此，本次失败不是“提交了 State 但正式合同拒绝”。

**Fact 2：** Analysis 在第一次 fresh Invocation 中完成了 8 次有非零 usage 的模型响应；第 9 次请求以 `stopReason=error`、`errorMessage=terminated`、空内容和零 usage 结束。

**Fact 3：** 第 9 次请求从最后两项 `search_trace` 结果返回到错误 AssistantMessage，共经过 130,580 ms。Workbench 为每个 Analysis Provider 请求配置的 timeout 是 120,000 ms，`maxRetries=0`。

**Fact 4：** 服务 Job timeout 是 2,400,000 ms。Job 总运行时间约 171.125 秒，因此服务层 timeout 没有触发，也没有触发 timeout 进程树清理路径。

**Fact 5：** Pi 将 Provider 异常规范化为一个 `stopReason=error` 的 AssistantMessage，Agent loop 随后正常 `agent_end`/`settled`。Blind Analysis 路径没有先检查该 AssistantMessage 的错误状态，而是继续检查 `analysis-state.json` 是否存在，最终用 `Analysis model did not persist State through update_state` 覆盖了更直接的 `terminated` 原因。

**Fact 6：** 两个 Coding Run、External Verifier 和 Thin Mapping 均已完成且有效。两个 Run 产生相同的代码修改、相同的通过测试和字节相同的最终 Diff。

### 2.2 最可能但尚未完全证明的机制

**Inference：** 最后一请求很可能由 120 秒 SDK 请求 timeout，或在相近时点发生的 Provider/网络断流触发。时间高度吻合，且 Pi 将 `terminated` 归入 transient transport error pattern。

**Unconfirmed：** 当前 Artifact 仅保留了规范化字符串 `terminated`，没有保留原异常类型、HTTP 状态、底层 cause 或“本地 timeout timer 已触发”的结构化字段。因此无法严格区分客户端 timeout 与上游连接终止。

**Fact：** 没有余额不足、quota、429、Credential 无效或其他 Provider 错误记录。此前 8 个 Analysis 请求及 10 个 Coding 请求均成功，余额不足不能作为默认归因。

### 2.3 对原 Closeout 表述的修正

`SKILL_EVALUATION_JOB_SERVICE_V1_CLOSEOUT.md` 中“Analysis invocation exhausted its bounded lifecycle”的表述不够准确。

此次运行没有用完 `max_a_invocations=2`，没有开始 resume Invocation，也没有触发 `A invocation bound exhausted`。它是在第一个 fresh Invocation 内的第 9 次 Provider 请求异常后，由“缺失 Analysis State”后置条件终止。

## 3. Analysis 执行现场

### 3.1 模型与限制

| 项目 | 实际值 |
|---|---:|
| Provider / 模型 | `deepseek/deepseek-v4-flash` |
| API | `openai-completions` |
| thinking level | `max` |
| Analysis AssistantMessage | 9 个 |
| 有非零 usage 的响应 | 8 个 |
| 最终错误响应 | 1 个，usage 为 0 |
| uncached input | 13,348 tokens |
| cache read | 70,016 tokens |
| Pi input 统计口径合计 | 83,364 tokens |
| output | 6,150 tokens |
| reasoning 字段 | 4,685 tokens；为 output 的组成字段，不重复相加 |
| 记录成本 | USD 0.0037867648 |
| Analysis 工具调用 | 21 |
| 工具错误 | 4 |
| Analysis Session 时长 | 161,954 ms |
| 最终请求时长 | 130,580 ms |
| Provider 请求 timeout | 120,000 ms |
| Provider retry | 0 |
| `total_process_view_bytes` | 8,138 |
| `base_a_invocations` | 1 |
| `max_a_invocations` | 2 |
| 服务 Job timeout | 2,400,000 ms |

固定运行时模型目录声明 `contextWindow=1,000,000`、`maxTokens=384,000`。Workbench 没有为这次测试额外传入较小的 `maxTokens`。没有证据表明测试环境降低 Token 或模型调用预算导致失败。

### 3.2 工具调用顺序

1. 调用 `list_runs`，确认两个 Run 均为 PASS、evaluable、Verifier passed。
2. 对两个 Run 分别执行 `process_view(detail=overview)`。
3. 对两个 Run 分别执行 `process_view(detail=timeline)`。
4. 读取两份 External Verifier 和两份 Diff。
5. 两次调用缺少 `sequence` 的 `read_evidence(artifact=trace)`，均被正确拒绝。
6. 读取两个 Run 的 sequence 11，并两次尝试不存在的 sequence 13。
7. 读取两个 Run 的 sequence 9 和 12，确认相同修改及相同测试通过结果。
8. 对两个 Run 分别执行 `search_trace(toolName=workspace_read)`。
9. 两项搜索结果返回后，下一次 Provider 请求最终记录为 `terminated`。

21 个工具调用中有 4 个错误：两次缺失 Trace sequence，两次读取不存在的 sequence 13。这些是模型提供了无效 Locator，不是工具进程或 Artifact 基础设施崩溃。

### 3.3 模型是否已经具备提交条件

**Fact：** 模型在 thinking 中多次明确判断：

- 两个 Run 的操作结构、Diff、Verifier 和最终文件内容相同；
- 仅存在无任务意义的并行读取顺序、Token 和时长差异；
- 没有明显的任务相关行为差异；
- Investigation Agenda 可以为空，不应制造 Finding。

**Inference：** 在读取 Verifier 和 Diff 后，模型已经拥有合理的停止条件，可以调用一次 `update_state`，提交 `matrix_triage_complete=true`、空 Agenda 和空 Finding，然后进入 controlled-unblind。它继续扩展 Trace 调查，属于模型执行中的停止判断不足。

**Fact：** 正式 Prompt 已写明 Agenda 可以为空、不得制造 Finding、不得进行 hypothesis-free exhaustive audit，并要求调用一次 `update_state` 后停止。问题不能简单归因于 Prompt 完全缺少停止说明。

## 4. Provider 错误如何被遮蔽

Blind Analysis 的相关调用链为：

1. `model-runner.ts` 创建固定 DeepSeek 模型、五个工具和 `AgentHarness`；请求参数为 `thinkingLevel=max`、`maxRetries=0`、默认 `timeoutMs=120_000`。
2. Pi `openai-completions.ts` 将 timeout 传给 OpenAI-compatible SDK。
3. Provider/传输异常进入 catch，形成 `stopReason=error` 和规范化 `errorMessage=terminated`。
4. Pi agent loop 遇到 error AssistantMessage 后结束当前 Agent，并由 Harness 发出 `settled`。
5. Workbench 只检查 `settled===1`，随后检查 State 文件；因 State 不存在而抛出通用缺失错误。

Controlled-unblind 路径已经显式检查 `message.stopReason === "error" || "aborted"`，Blind Analysis 路径没有相同检查。这是一个已确认的错误传播不一致。

## 5. 原 Evaluation 与服务适配对照

### 5.1 一致部分

**Fact：** 服务通过 canonical `workbench evaluation run` 启动正式 Evaluation，没有另写 Analysis 执行器。

**Fact：** `evaluate-evaluation.ts` 读取同一 Frozen Plan 和两个绑定配置，顺序运行两个 Coding Run，写入 Thin Mapping，然后调用同一个 `reviewEvaluation()`。

**Fact：** Coding 与 Review 共用一个缓存的 Credential Promise；不存在 Coding 和 Analysis 分别读取不同密钥的迹象。

**Fact：** 服务没有覆盖 Analysis 模型、thinking level、工具 allowlist、Token 上限、A Invocation 预算或 Provider request timeout。

**Fact：** 每个 Job 使用独立 launch/evaluation-output/review 路径。短根目录已经消除了第一次真实执行遇到的 Windows 深路径问题。

### 5.2 问题分类

#### 新服务接入

**Fact：** 没有证据表明服务层造成了本次 Provider termination。

**Recommendation：** execution-failed Job 可以额外发布只读的部分 Evaluation Artifact 索引，例如 Mapping、Analysis Session 路径和已完成 Run 引用。当前 HTTP/terminal 主要暴露 stdout/stderr，根因调查仍需人工进入 Job 目录。这是可观测性缺口，不是本次失败根因。

#### 原 Analysis 实现

**Fact：** Blind Analysis 会把 Provider error/abort 遮蔽为缺失 State，应修正错误优先级。

**Fact：** 每个 Provider 请求固定 120 秒、无重试；对 `thinkingLevel=max` 的长推理调用可能偏紧，但它不是服务测试专用限制。

**Fact：** `read_evidence` 的 JSON Schema 将 `sequence` 声明为可选，而运行时要求 Trace Locator 必须携带整数 sequence，工具合同对模型不够明确。

#### 当前小型评测配置

**Fact：** 配置、Frozen Candidate、两个 Run、Verifier 和 Mapping 均合法。零模型正式预检通过。

**Fact：** 小型矩阵计算出最多两个 A Invocation，但本次没有触及该上限。

**Inference：** 该案例的两条轨迹几乎完全相同，通用行为分析 Prompt 对其显得偏重，增加了模型过度调查的机会；这不等于配置无效，也不应通过放宽 State 标准来追求成功。

#### 模型或传输非确定性

**Fact：** 模型明知没有高价值差异仍继续调查，并产生四个无效 Locator。

**Unconfirmed：** 相同输入重新 Analysis 可能成功，也可能再次遇到长请求或停止判断问题。目前不能把一次失败推广为模型恒定失败。

## 6. Analysis-only Review 的可行性

### 6.1 正式合同支持

Canonical 入口为：

`workbench evaluation review`

其帮助与源码明确说明：它审阅一个已经完成的 Skill Evaluation，不重新执行 Coding Agent Run。

必需输入：

- 原 Frozen Plan；
- 原 Thin Mapping；
- Mapping 中两个现有 Run 根目录；
- Frozen Candidate Artifact；
- Credential 文件；
- 新的空 Review 输出目录。

### 6.2 零模型实测

对本次真实 Plan 与 Mapping 执行 `--dry-run --json`，得到：

```json
{
  "status": "ready",
  "evaluation_id": "evaluation-service-small-real-v2",
  "provider_requests": 0,
  "total_process_view_bytes": 8138,
  "base_a_invocations": 1,
  "max_a_invocations": 2
}
```

dry-run 没有读取 Credential，没有创建输出目录，也没有调用模型。

### 6.3 新身份与 Artifact 关系

Analysis-only Review 将：

- 保留原失败 Job、Frozen Plan、Mapping 和两个 Coding Run 不变；
- 使用新的空输出根；
- 产生新的随机 Analysis Session ID；
- 在新根中生成 `analysis-state.json`、Invocation Artifact 和 Markdown/HTML/PDF 报告；
- 继续引用原 Mapping 中的 Run ID、Run 根和证据；
- 不覆盖或修复原 Job 的 `execution_failed` 终态。

当前 CLI 没有独立的持久 `review_id` 对象。新 Review 的可审计身份由新输出根、Session ID、输入 Plan/Mapping digest 和输出 Artifact 共同组成。

### 6.4 能验证和不能验证的内容

Analysis-only 能验证：

- 原两个真实 Run 可被 Analysis 正确加载；
- Blind Analysis 是否成功提交 State；
- controlled-unblind 是否完成；
- Analysis State 和三种报告是否生成；
- 本次失败是否主要属于 Analysis/Provider 的独立问题。

Analysis-only 不能验证：

- 一次新的 HTTP 提交、Redis 排队和 Worker 调度；
- 新 Coding Run 和新 Workspace 隔离；
- 服务 result-validation 是否接受整套新产物；
- 原失败 Job 是否可以改为成功。原 Job 必须保持失败事实。

## 7. 新完整小型 Evaluation 路径

如果需要验证完整 HTTP → Redis/BullMQ → Worker → Evaluation → Analysis → Report 链路，应提交一个新的 `small-real-two-run-v2` Job：

- 新 Job ID 和 idempotency key；
- 新的短 Job root；
- 原 Frozen Plan、Candidate、两种条件和 Verifier；
- 两个新的 Coding Run；
- 新 Mapping、Analysis State 和报告。

无需创建 Formal18、SWE-bench 或新的评测体系。

若下一步先修改 Analysis 源码或 timeout 配置，应刷新注册 Spec 的 executor 源码摘要，并把实际变动的 Analysis 依赖纳入快照。不得在旧源码身份下静默执行修改后的 Analysis。

## 8. 推荐的最小修复

### 8.1 必要的诊断正确性修复

**Recommendation：** Blind Analysis 在 Harness idle/settled 后保存最后一个 AssistantMessage；若其 `stopReason` 为 `error` 或 `aborted`，先抛出包含 Provider cause 的错误，再检查 State 文件。

目标不是降低 State 标准，而是区分：

- Provider/runtime failure；
- 模型正常结束但遗漏 `update_state`；
- `update_state` 被合同拒绝；
- State Artifact 写入失败。

同时增加 Faux 回归：构造 `stopReason=error, errorMessage=terminated`，断言最终错误保留 Provider cause，而不是退化为通用缺失 State。

### 8.2 请求 timeout

**Recommendation：** 将 Analysis Provider request timeout 变成集中、可审计、按正式执行配置的参数。下一次验证建议初始值 300,000 ms，仍受 2,400,000 ms Job timeout 约束。

这不改变模型 Token 上限、A Invocation 数量、State Schema、Finding 标准或 Evaluation Outcome。

### 8.3 工具合同

**Recommendation：** 在 `read_evidence` Schema/description 中明确：

- `artifact=trace` 必须提供 sequence；
- Trace 工具不支持一次读取完整 Trace；
- `process_view` 的 operation count 不等于原始 Trace 一定存在下一 sequence。

### 8.4 暂不推荐的改动

- 不放宽 `update_state` 的正式字段或 Evidence Locator 校验；
- 不把空 Analysis State 当作服务成功；
- 不立即加入自动 Analysis 重试；
- 不为该小案例删除正式 controlled-unblind；
- 不通过降低 thinking、Token 或证据标准强行获得报告；
- 不同时大改 Prompt、timeout、retry 和工具体系，否则难以判断哪项改变影响结果。

Prompt 可以在后续增加更直接的“小矩阵无高价值差异时提交空 Agenda”提醒，但现有 Prompt 已包含该语义，因此它不是第一优先修复。

## 9. 推荐验证顺序、调用规模与成本

### 阶段 A：零模型修复与测试

1. 修复 Blind Analysis Provider 错误传播。
2. 增加确定性 Provider-error 测试。
3. 明确 Trace Locator Schema/description。
4. 配置可审计的 Analysis request timeout。
5. 重新执行 Analysis、Review CLI 和服务聚焦测试。
6. 对原 Plan/Mapping 再执行一次零模型 dry-run。

### 阶段 B：一次真实 Analysis-only Review

建议使用同一 Frozen Plan、Mapping 和两个 Run，以及新的空输出根。

基于当前实测，预计：

- 约 10–15 个 Provider 请求；
- 0 个新 Coding Run；
- 约 USD 0.005–0.015 的记录成本；
- 具体数量随模型工具循环和 controlled-unblind 输入而变化，不构成硬上限。

如果再次失败，应先检查新 Session 的精确 stop reason，不直接运行完整新 Evaluation。

### 阶段 C：可选的完整 HTTP E2E

现有两个 Coding Run 合计实测：

- 10 个 Provider 请求；
- USD 0.000511308；
- 两个 External Verifier 均通过。

因此，新完整 Evaluation 粗略预计：

- 总计约 20–25 个 Provider 请求；
- 约 USD 0.0055–0.016；
- 真实值取决于 Analysis 工具循环，不能解释为真实 Coding Agent 吞吐或生产容量。

## 10. 需要用户决策与可自主处理项

### 需要用户决定

1. 是否先实施错误传播、工具合同和可配置 timeout 的最小修复。
2. 是否在修复后授权一次真实 Analysis-only Review。
3. Analysis-only 成功后，是否还需要立即执行新的完整 HTTP Job。
4. 下一次 Credential 应使用当前存在的 `.env.g005`，还是重新提供此前指定但当前不存在的 `.env.g005c`。

### 后续实施可自主处理

- 添加确定性/Faux 回归；
- 保持正式 State 和 Evidence 标准不变；
- 建立新的 Review 输出身份；
- 刷新受影响的 executor source digest；
- 自动读取并核验新的 State、Session、Mapping 和报告；
- 在完整 Job 获得授权后，使用新 Job ID、短根目录和新 idempotency key；
- 保持原失败 Job 与 Run Artifact 不变。

## 11. 本轮零模型验证结果

### Exact-input Review dry-run

结果：`ready`；`provider_requests=0`；未创建输出目录。

### 聚焦测试

命令：

```powershell
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/trace-analysis-review-cli.test.ts tests/trace-analysis-model.test.ts
```

结果：16 tests，16 pass，0 fail。

这些测试确认：

- Review dry-run 不读取 Credential、不写输出；
- A fresh/resume/controlled-unblind 生命周期合同仍成立；
- `update_state` 的 State 持久化和 Locator 校验仍成立；
- 当前测试没有覆盖 Blind Analysis 保留 Provider error cause 的缺口，因此该回归仍需补充。

## 12. 关键证据索引

### 执行 Artifact

- Job terminal：`D:\AI\evalsvc-v2-r1\jobs\232dc13...\terminal.json`
- Child terminal：`...\attempt-1\launch-0001\child-terminal.json`
- stdout/stderr：`...\attempt-1\launch-0001\stdout.log`、`stderr.log`
- Spec snapshot：`...\spec-snapshot.json`
- Thin Mapping：`...\evaluation-output\mapping\thin-evaluation-mapping.json`
- Analysis Session：`...\evaluation-output\review\sessions\fresh\...trace-analysis-fresh-1d6c72a8-f75f-4d9c-9d7c-be1e55e7d5a0.jsonl`

### 项目源码

- `workbench/src/trace-analysis/model-runner.ts`
- `workbench/src/trace-analysis/model-tools.ts`
- `workbench/src/trace-analysis/evaluation.ts`
- `workbench/scripts/review-evaluation.ts`
- `workbench/scripts/evaluate-evaluation.ts`
- `workbench/src/evaluation-service/evaluation-job-child.ts`
- `workbench/src/evaluation-service/worker.ts`

### 固定 Pi 源码

- `.runs/v0-a/pi/packages/ai/src/api/openai-completions.ts`
- `.runs/v0-a/pi/packages/ai/src/utils/retry.ts`
- `.runs/v0-a/pi/packages/ai/src/utils/provider-retry.ts`
- `.runs/v0-a/pi/packages/agent/src/agent-loop.ts`
- `.runs/v0-a/pi/packages/agent/src/harness/agent-harness.ts`

## 13. 最终判断

**Fact：** Skill Evaluation Job Service 已成功把请求送达真实 Evaluation，完成两个 Coding Run、Verifier 和 Mapping；失败发生在既有 Analysis 的第一次 fresh Invocation 内。

**Fact：** 服务没有虚报成功，也没有制造缺失的 State 或报告。

**Recommendation：** 下一步应先做小范围错误传播与 request-timeout 修复，然后优先使用 Analysis-only Review 复用现成 Run；只有在它成功后，才用一个新的完整 HTTP Job 验证服务端到端闭环。

**Unconfirmed：** 在完成下一次真实 Review 前，不能宣称真实 Analysis/report 已通过；也不能从一次 `terminated` 推断 DeepSeek 模型稳定失败或余额不足。
