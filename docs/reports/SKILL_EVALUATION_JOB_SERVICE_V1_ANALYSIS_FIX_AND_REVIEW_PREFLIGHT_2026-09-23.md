# Skill Evaluation Job Service V1：Analysis 定向修复与 Analysis-only Review 预检报告

日期：2026-09-23  
工作分支：`codex/skill-evaluation-job-service`  
便携发布基线：`603207f20436b1c31f67c3234936a9636f1d5c13`  
基线 Tree：`edc44fc90b52f7ea2ff4ef20b384e0bd8404f7a3`

## 1. 范围与结论

本轮依据《SKILL_EVALUATION_JOB_SERVICE_V1_REAL_ANALYSIS_FAILURE_DIAGNOSIS_2026-09-23.md》，只实施并验证以下三项最小修复：

1. 修正 Blind Analysis 的错误传播与错误优先级；
2. 修正 `read_evidence(artifact=trace)` 的 Trace Locator 工具合同；
3. 将 Analysis Provider request timeout 变成可审计、可配置并贯穿 Review、Evaluation 和 Service 的参数。

本轮没有修改 Frozen Plan、Evaluation Outcome、Analysis State Schema、Finding 标准或 controlled-unblind 合同；没有加入自动 Analysis 重试；没有改变模型、thinking level、Token 上限或 Invocation 数量预算。

**结论：** 三项修复已完成。TypeScript、完整 Trace Analysis 回归、Evaluation Service/Faux/故障测试和原真实输入的 Analysis-only dry-run 均通过。下一次 Analysis-only Review 已具备合法输入和空输出根，目标 timeout 为每次 Provider request 300,000 ms。当前已停止在真实 Provider 调用前，尚未产生新的真实 Analysis State 或报告，也尚未证明新的完整 HTTP Job 端到端成功。

## 2. 三项实际修复

### 2.1 Blind Analysis 错误传播

`workbench/src/trace-analysis/model-runner.ts` 新增结构化 `AnalysisInvocationError`，区分：

- `analysis_provider_error`；
- `analysis_runtime_error`；
- `analysis_aborted`；
- `analysis_lifecycle_error`；
- `analysis_update_state_not_called`；
- `analysis_state_validation_failed`；
- `analysis_state_persistence_failed`。

Harness 结束后先检查最终 AssistantMessage 的 `stopReason`。明确的 Provider error 或 aborted 现在优先于“State 未写入”后置条件。因此，若原现场再次出现 `stopReason=error`、`errorMessage=terminated`，错误输出会保留该 Provider 终态，而不会再被通用的“没有持久化 State”覆盖。

`workbench/src/trace-analysis/model-tools.ts` 同时记录 `update_state` 的尝试次数、最近失败类型和安全错误消息。模型工具参数在 Schema 层被拒绝、语义 State 校验失败、State 写入失败和正常结束但完全没有调用 `update_state`，现在可以分别判断。

State 的正式验证与持久化流程没有放宽。修复只改变错误诊断和根因保留，不把不合法 State 接受为成功。

### 2.2 Trace Locator 合同

`read_evidence` 的参数从“所有 artifact 共用一个可选 sequence”改为判别联合：

- `artifact=trace`：必须提供 `minimum=1` 的整数 `sequence`；
- `diff`、`verifier`、`manifest`：不接受 `sequence`。

Schema 与工具描述明确说明：Trace sequence 必须来自 `search_trace` 或其他明确的 Trace locator；`process_view` 的 operation count 或 index 不能证明 Trace 中存在同号 sequence。

运行时校验也同步要求正安全整数，避免 Schema 与实际执行要求再次不一致。

### 2.3 Analysis Provider request timeout

新增 `workbench/src/trace-analysis/runtime-config.ts`：

- 默认值仍为 `120_000 ms`；
- 显式值必须是 `>= 1_000 ms` 的安全整数；
- 没有把测试使用的 300 秒写成所有模型和场景的永久值，也没有设置缺乏依据的统一最大值。

参数现已贯穿：

`evaluation review CLI` → `runBoundedAnalysis()` → `runEvaluationAnalysis()` → `runAnalysisInvocation()` → Pi `AgentHarness.streamOptions.timeoutMs` / controlled-unblind `completeSimple().timeoutMs`。

同时：

- CLI JSON 和人类可读结果会记录实际 timeout；
- Analysis Session metadata 和 Invocation artifact 会记录 `request_timeout_ms`；
- 正式 Service Spec 可注册 `analysis_request_timeout_ms`；
- Service 要求它小于外层 `job_timeout_ms`；
- Worker 子进程显式传递该值；
- 正式结果校验要求返回值与注册 Spec 一致。

下一次针对性 Analysis-only Review 计划使用 `300_000 ms`。这只是对本次疑似 120 秒断流/timeout 的定向验证，不代表已经确认原因为本地 timeout。

## 3. 测试与验证结果

### 3.1 TypeScript

命令：

```powershell
npm run typecheck
```

结果：通过，0 个 TypeScript 错误。

### 3.2 完整 Trace Analysis 回归

命令：

```powershell
$env:PI_RUNTIME_ROOT=(Resolve-Path '..\.runs\v0-a\pi').Path
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/trace-analysis*.test.ts
```

结果：

- 83 tests；
- 82 passed；
- 0 failed；
- 1 skipped，为既有的真实 Smoke 测试，本轮没有授权执行。

新增确定性回归覆盖：

- Provider error 优先于缺失 State；
- aborted、正常未调用 `update_state`、State 校验失败、State 持久化失败的分类；
- `update_state` 失败尝试记录；
- Trace locator Schema 必须包含正整数 sequence；
- 300 秒 timeout 从 Review 生命周期传递到每次 Analysis Invocation。

### 3.3 Evaluation Service 与 Faux 回归

使用临时本地 Redis 7.4.7 容器，执行：

```powershell
npm run evaluation-service:test
```

结果：11/11 passed，覆盖：

- HTTP、BullMQ、Worker、查询和 Artifact 闭环；
- 固定两 Run Faux Evaluation；
- Pi、工具、External Verifier、Thin Mapping、Faux Analysis 和报告；
- idempotency 与合法 TASK_FAILURE；
- execution failure 和 timeout；
- Worker crash/stalled redelivery 不盲目再次 spawn；
- Credential 不进入 Redis Job Data、HTTP 或持久 Job Artifact；
- Redis 不可用时查询仍可用、提交 fail closed。

最终 Service Core 聚焦回归另行得到 6/6 passed。临时 Redis 容器已停止并清理。

### 3.4 工作树检查

`git diff --check` 通过。没有 commit、merge、push，也没有修改或覆盖原失败 Job、原 Analysis Session、Frozen Plan、Thin Mapping、Coding Run 或 Verifier Artifact。

## 4. Analysis-only Review 精确预检

### 4.1 输入身份

Frozen Plan：

`D:\AI\AI_Projects\project2-worktrees\skill-evaluation-job-service\.runs\evaluation-service-specs\small-real-v2-authorized-20260923\frozen-plan.json`

- bytes：1,229；
- SHA256：`892dfd5674c374c0ac93f8586afafa1305c6f8f58d290d65a7130e051c9f8d25`。

Thin Mapping：

`D:\AI\evalsvc-v2-r1\jobs\232dc13b8eed5e6ef2c7ada5630639e792ef6a20e3736d95020f23df105630f1\attempt-1\launch-0001\evaluation-output\mapping\thin-evaluation-mapping.json`

- bytes：900；
- SHA256：`da1a3116557fd5d22236d3d2c25f64c55c48939484833beb108201e02ddc7f54`。

dry-run 已重新读取 Frozen Candidate、两个既有 Run、Mapping 和比较组，结果为合法且 ready。它不会创建新的 Coding Run，也不会修改原 Job。

### 4.2 Credential

- 先前指定的 `.env.g005c` 当前不存在；
- 工作树根目录的 `.env.g005` 存在；
- 它已通过现有 `createDeferredCredentialFileResolverV35()` 的普通非链接文件身份检查；
- 文件中恰有一个非空 `DEEPSEEK_API_KEY`，格式解析通过；
- 检查没有输出 Credential 内容。

这能证明本地 Credential 文件合同有效，但在不发起 Provider 请求的前提下，不能证明 Provider 端仍接受该 Credential。现有证据没有显示此前失败由 Credential 或余额导致。

### 4.3 新输出身份

预定输出根：

`D:\AI\evalsvc-v2-analysis-only-r1`

当前不存在，满足 fresh Review 要求。dry-run 完成后仍未创建该目录。

### 4.4 dry-run 命令与结果

```powershell
$env:PI_RUNTIME_ROOT=(Resolve-Path '.runs\v0-a\pi').Path
node workbench/scripts/workbench.mjs evaluation review `
  --plan '.runs/evaluation-service-specs/small-real-v2-authorized-20260923/frozen-plan.json' `
  --mapping 'D:\AI\evalsvc-v2-r1\jobs\232dc13b8eed5e6ef2c7ada5630639e792ef6a20e3736d95020f23df105630f1\attempt-1\launch-0001\evaluation-output\mapping\thin-evaluation-mapping.json' `
  --credential-file '.env.g005' `
  --output 'D:\AI\evalsvc-v2-analysis-only-r1' `
  --analysis-request-timeout-ms 300000 `
  --dry-run `
  --json
```

结果：

```json
{
  "status": "ready",
  "evaluation_id": "evaluation-service-small-real-v2",
  "output": "D:\\AI\\evalsvc-v2-analysis-only-r1",
  "provider_requests": 0,
  "analysis_request_timeout_ms": 300000,
  "total_process_view_bytes": 8138,
  "base_a_invocations": 1,
  "max_a_invocations": 2
}
```

## 5. 下一次执行的源码身份

Analysis-only Review 不使用旧 Service Job 身份，但其实际源码身份必须固定为当前基线加以下工作树文件 digest：

| 文件 | SHA256 |
|---|---|
| `workbench/scripts/review-evaluation.ts` | `fe4ea963bbd61aa67ba9a7adc4c44a459411d06b0011391d1a14bd611ca51320` |
| `workbench/src/trace-analysis/evaluation.ts` | `771b7fb1d92b0a7cc5f95b4742b60145802577a848dbeddd40a9146c4af28e6c` |
| `workbench/src/trace-analysis/model-runner.ts` | `9cad47bf891f3fc742127c4ca995304d4678777bc6852e74235779b41e0b9e13` |
| `workbench/src/trace-analysis/model-tools.ts` | `09b71bb6b58e4051543686cc238d53569dfc56975fd7f52e711a77d1c62edbb2` |
| `workbench/src/trace-analysis/runtime-config.ts` | `d61ff6448d850bb90be55465255a36bbbc32f7ed8738141b0108d5ed4e3ba09d` |

旧 `small-real-two-run-v2` 注册 Spec 的六个 executor file 中已有四个与当前源码 digest 不一致：

- `evaluate-evaluation.ts`；
- `review-evaluation.ts`；
- `evaluation-job-child.ts`；
- `result-validation.ts`。

因此，不允许用旧 Spec 身份运行修改后的完整 HTTP Evaluation。`prepare-evaluation-service-small-spec.ts` 已更新：新 Spec 将注册 300 秒 Analysis request timeout，并覆盖本轮新增/修改的 Trace Analysis、Service runtime、package manifest 和 lockfile 源码 digest。按既定边界，本轮没有提前生成或执行新的完整 HTTP Spec；应在 Analysis-only 成功后再创建新 Evaluation/Job 身份。

## 6. 下一次真实 Analysis-only Review 计划

### 6.1 预计调用范围与费用

- 新 Coding Run：0；
- Blind Analysis A Invocation：基础 1 次，最多 2 次；
- 每个 A Invocation 内的 Provider/tool 循环由模型行为决定；
- controlled-unblind：没有 kept Finding 时为零模型；有 kept Finding 时预计 1 次模型 completion；
- 预计 Provider 请求：约 10–15 次；
- 预计记录成本：约 USD 0.005–0.015。

这些数值来自原失败 Analysis 的 8 次有 usage 响应、当前工作负载和既有报告估算，只是预算参考，不是请求硬上限或成功保证。

### 6.2 明确停止条件

下一次执行不自动重试。出现以下任一情况即停止，保留新输出和 Session 供诊断：

- Provider error；
- runtime error；
- aborted；
- Analysis 生命周期没有恰好 settled 一次；
- 模型正常结束但未调用 `update_state`；
- State Schema/工作流校验失败；
- State 或 Invocation Artifact 持久化失败；
- 两次 A Invocation 用尽后仍停留在 `blind_analysis`；
- controlled-unblind 解析或验证失败；
- 报告生成失败；
- 2,400 秒监督执行期限触发。

单次 Provider request timeout 为 300 秒，`maxRetries=0`。300 秒仍可能得到 Provider/网络 `terminated`，因此再次失败时必须读取新 Session 的精确 stop reason，不能直接断言 timeout 已解决，也不能自动转而运行完整 HTTP Evaluation。

## 7. 能证明与不能证明的边界

本报告已经证明：

- 三项最小修复已实现并通过零模型回归；
- 原 Frozen Plan、Candidate、Mapping 和两个真实 Run 可合法进入新的 Analysis-only Review；
- 300 秒参数确实传递到 Pi/SDK 请求配置并被记录；
- `.env.g005` 满足本地 Credential 文件合同；
- 新输出根满足 freshness 要求；
- 旧正式 Service Spec 不能冒充新源码身份。

本报告尚未证明：

- 300 秒一定能消除原 `terminated`；
- `.env.g005` 当前一定被 Provider 接受；
- 模型下一次一定调用 `update_state`；
- Analysis 会达到 `alignment_ready` 或 `human_review_ready`；
- controlled-unblind 和正式报告会成功生成；
- 一个新的 HTTP → Redis/BullMQ → Worker → Coding Runs → Mapping → Analysis → Report Job 已完整成功。

## 8. 当前停止点

本轮没有真实 Provider 调用，没有创建 `D:\AI\evalsvc-v2-analysis-only-r1`，也没有改写原失败 Job 的 `execution_failed` 终态。

下一步只需要用户明确授权一次上述 Analysis-only Review。若成功，应读取并核验新的 `analysis-state.json`、Blind/controlled-unblind Invocation、Session、报告和原 Plan/Mapping/Run 引用关系；之后再由用户决定是否启动一个新身份的小型完整 HTTP Evaluation Job。
