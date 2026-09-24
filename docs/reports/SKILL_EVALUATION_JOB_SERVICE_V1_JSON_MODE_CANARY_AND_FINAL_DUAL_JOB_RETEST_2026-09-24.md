# Skill Evaluation Job Service V1：JSON Mode Canary 与最终双 Job 复测

日期：2026-09-24
结论：`CONTROLLED_UNBLIND_CANARY_PASS / FINAL_DUAL_JOB_RETEST_FAILED / STOPPED_AS_AUTHORIZED`

## 1. 范围与源码身份

本轮只完成已批准的两步：先验证 controlled-unblind（B）JSON Mode，再提交唯一一组两个全新真实 HTTP Job。B 首次成功，因此没有使用“调整后第二次 B”额度。双 Job 结束后无论成败均停止；没有第三个 Job、没有自动重试，也没有进入 Stage 2/3/4。

- 分支：`codex/skill-evaluation-job-service`
- 实际 commit：`1662c6a5a761ac68189076bc895e95bb5d050f21`
- 实际 tree：`aae9a17f9e99ac24235399a466c66f648e233cf8`
- commit：`fix: constrain controlled unblind to JSON output`
- 注册 Spec：`.runs/evaluation-service-specs/small-real-v7-json-mode-1662c6a/specs.json`
- Spec ID：`small-real-two-run-v2`
- 零模型 preflight：`ready_at_execution_boundary`；0 model call、0 Credential read
- Analysis request timeout：`300000 ms`
- Job timeout：`2400000 ms`

JSON Mode 改动只作用于 controlled-unblind 的 `completeSimple()` 请求：增加 `response_format={"type":"json_object"}`，并保留既有 model、message、stream、token 与 thinking 配置。TypeScript 通过；Analysis/Review 聚焦测试 34/34 通过。

## 2. 单次 B Canary

输入复用历史失败 Job A 已合法持久化的 `alignment_ready` State、Frozen Plan、Thin Mapping 和两个真实 Run；在新的空输出根以 `resume` 身份执行，不修改源 State。

- 输出根：`D:\AI\bcanary-json-mode-20260924-01`
- 结果：`human_review_ready`
- Provider 请求：恰好 1 次，HTTP 200
- 模型：`deepseek/deepseek-v4-flash`
- usage：2,359 input、683 output tokens；USD 0.0004863768
- wall time：4,061 ms
- controlled result：root 仅有 `alignments`、`follow_up_observations`；各 1 项
- 正式 State：1 个 sealed/kept Finding
- 报告：Markdown、HTML、PDF 均生成并可读
- 源 State SHA-256 前后均为 `1291c7182fcb37125acc941b90b5bd578b05ab0f90382157a1eb3a55408d6ee1`
- 对 8 个 Canary 文件扫描实际 Credential 值：0 命中

结论：本次 JSON Mode 的最小改动在受控 B 路径上生效，且没有改变正式 State 验收标准。该结果不能替代完整 HTTP E2E。

## 3. 最终双 Job 配置与身份

- Redis：`redis:7.4.7-alpine`，`127.0.0.1:6392`，DB 15
- Queue：`skill-evaluation-jobs-v1-json-mode-final-20260924-03`
- API：`127.0.0.1:4323`
- Worker：两个独立进程，各 `concurrency=1`
- BullMQ global concurrency：`2`
- Job root：`D:\AI\ejc2-20260924-03`
- Control root：`D:\AI\ejc2-control-20260924-03`
- Credential：仅 Worker 读取注册的 `.env.g005`；API 未配置 Credential Registry

两个 POST 由同一客户端用 `Promise.all` 并行提交，均返回 HTTP 202、`deduplicated=false`：

| Job | Idempotency key | Job ID | dispatch |
|---|---|---|---|
| A | `dual-json-final-20260924-a` | `79cf319255ba6b41d6de4fe475a3c8a667a780adfcdf0577a935d956d140d0eb` | `2026-09-24T13:42:11.004Z` |
| B | `dual-json-final-20260924-b` | `be241c5f2c9b596e7d47b98e117fbd9fbd82d93b699b135aa7eafec7f52f0a1f` | `2026-09-24T13:42:11.006Z` |

两个 evaluator 从 Job terminal 的 `started_at` 到 `finished_at` 重叠约 221.695 秒；两组 Coding Run 以及 Blind Analysis 都发生了真实重叠，不只是同时入队。

## 4. 已通过的执行与隔离证据

四个 Coding Run 均为 `execution_status=completed`、`verification_status=passed`，External Verifier exit code 均为 0：

- Job A：`coding-task-20260924134212211-1f0fd427`、`coding-task-20260924134218832-c4d552b1`
- Job B：`coding-task-20260924134212210-95cb05e4`、`coding-task-20260924134218293-4c17db59`

两份 Thin Mapping SHA-256 分别为：

- A：`469247505b8037af9cb861044ebc8059a52b09494c476785f4642da6c0498eb8`
- B：`ce8535df091e87ae076760b6d291006593bfc96931fc2f6808dfc1c01f0b7d35`

逐字检查显示，两份 Mapping 均不包含另一 Job ID 或另一 Job 的 Run ID。每个 Job 只有 `attempt-1/launch-0001`，无 stalled redelivery 或第二次执行。

两条失败结果均可由 HTTP 200 查询；每条发布 7 个 Artifact。14/14 Artifact 的 HTTP status、字节数和 SHA-256 与结果清单一致。四个 runner/evaluator PID 在 terminal 后均不存在，两条 terminal 均记录 `cleanup_confirmed=true`。

对 Job/control root 共 89 个文件扫描 `.env.g005` 中的实际密钥值，0 文件命中。Redis 快照保存于 `D:\AI\ejc2-control-20260924-03\redis-dump.rdb`，SHA-256 为 `36e4d33e4e94ac76c14d9ce8f04101ad676418a364e1323ff6c46a2a4e966960`。

## 5. 双 Job 最终失败现场

两条 BullMQ Job 都是 `completed`，服务业务终态都是 `execution_failed`；这不是队列失败、Worker crash 或 Job timeout。

| Job | Blind Analysis | 最后请求 | 最后请求时间 | 最终错误 |
|---|---|---:|---|---|
| A | `13:42:24.820Z` → `13:45:52.578Z` | ordinal 8 | dispatch `13:43:32.843Z`；HTTP 200 headers `13:43:33.501Z`；message end `13:45:52.577Z` | `stream_error_after_headers` / `stopReason=error` / `terminated` |
| B | `13:42:24.006Z` → `13:45:52.577Z` | ordinal 5 | dispatch `13:42:40.955Z`；HTTP 200 headers `13:42:41.608Z`；message end `13:45:52.576Z` | 同上 |

关键事实：

- 两个最后请求都已收到 HTTP 200 headers，并已流出 thinking 内容；不是连接前拒绝或 Credential 错误。
- 两个最后请求的持续时间不同，约 139.734 秒与 190.968 秒，却在绝对时间上相差约 1 ms 结束。
- 两者均未达到 300 秒 request timeout，Job 总时长也远低于 2,400 秒 deadline。
- A 在失败前有 7 个正常、有 usage 的 Analysis 响应；B 有 4 个。两条最终错误响应均未发出或执行 `update_state`。
- 两条 Job 因此都没有 `analysis-state.json`、controlled-unblind 或 Markdown/HTML/PDF 报告。
- A 已记账的正常 Analysis 响应：11,434 input、13,577 output、12,008 reasoning tokens，USD 0.00559048。
- B 已记账的正常 Analysis 响应：4,722 input、2,965 output、2,260 reasoning tokens，USD 0.0015518496。

## 6. 判断与停止结论

**Fact：** JSON Mode 修复只作用于 controlled-unblind；本次两个完整 Job 都在 Blind Analysis、正式 State 生成之前失败，根本没有进入 B。因此本次双 Job 失败不是新的 JSON Mode parse 错误，也不能反证单次 B Canary 的通过结果。

**Inference：** 两个独立 evaluator 的不同长度流式请求在几乎同一绝对时刻终止，再次支持“共享上游 Provider/gateway/本机外部网络路径事件”这一方向，弱于“各自命中相同本地 request timeout”的解释。

**Unconfirmed：** 当前可见错误仍在 Pi/provider 层归一化为 `terminated`，没有底层 socket cause、Provider request ID 或可归因的 HTTP 错误状态。因此不能把根因确定为 DeepSeek 并发额度、Clash/TUN、SDK、网络切换或其他具体组件；也没有余额不足、429、Credential 错误、Worker crash 或 stalled redelivery 证据。

**验收结论：** 单次 B JSON Mode 验证通过，但新的完整双 Job E2E 仍然失败，Stage 1 不能宣称通过。按照用户明确授权，本轮在保留全部现场、保存 Redis 快照并停止 API/Worker/Redis 后结束；不重试、不调整、不进入后续阶段。

## 7. 当前停止状态

- API、两个 Worker、Redis 容器均已停止；端口 4323/6392 无 listener。
- 历史 Job、Session、Run、Mapping、terminal、HTTP Artifact、control logs 与 Redis RDB 均保留。
- 没有 merge 或 push。
- 功能 commit 为 `1662c6a5a761ac68189076bc895e95bb5d050f21`；本报告及 Implementation Log 更新尚未另行 commit。
- 后续如需继续，应先由用户审核本报告并单独授权；本轮不提出或执行新的真实调用。
