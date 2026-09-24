# Skill Evaluation Job Service V1 真实端到端验证报告

日期：2026-09-23  
分支：`codex/skill-evaluation-job-service`  
便携发布基线：`603207f20436b1c31f67c3234936a9636f1d5c13`  
工作树源码身份：`edc44fc90b52f7ea2ff4ef20b384e0bd8404f7a3`（由注册 Spec 的 executor files 逐文件 SHA-256 约束）

## 结论

**Fact：** 已取得一条新的、单一执行身份下的合法完整成功证据：

`HTTP POST → Redis/BullMQ → Worker → 2 个真实 Coding Runs → External Verifier → Thin Mapping → Blind Analysis update_state → controlled-unblind → Analysis State → Markdown/HTML/PDF Report → HTTP Result/Artifact 查询`。

最终 Job：`e45998aaeb9627a5db6ca9c4331785182926262e75987807cf9bd6c20a84e488`。服务终态为 `completed`，队列终态为 `completed`，`cleanup_confirmed=true`，Evaluation 状态为 `human_review_ready`。开始时间 `2026-09-23T08:41:45.761Z`，结束时间 `2026-09-23T08:44:13.626Z`，总历时约 148 秒。

这证明的是 V1 在本机 Windows、单 Worker `concurrency=1`、全局额度 2、Redis 单实例条件下的小型真实 Evaluation 闭环，不等同于生产高可用、跨机器调度、exactly-once 或真实 Coding Agent 高并发容量证明。

## 本轮新增失败证据与最小修复

第一次完整 HTTP Job `a846e3b4ab4ff0c68cb0e4e5163e79c2b5e717cc63af92baca5b05cf6ac7a669` 保持原样，终态仍为 `execution_failed`。该 Job 已完成两个真实 Coding Run、Verifier、Mapping 和 Blind Analysis；Blind Analysis 已生成 `alignment_ready` State。失败发生在 controlled-unblind：模型响应未满足顶层精确键合同，错误为：

`controlled-unblind result must contain exact keys: alignments, follow_up_observations`

由于旧实现先解析、后返回，原始 controlled-unblind 响应没有持久化，故无法确认当次具体多出的是包装对象、解释键还是其他键。一次既有 Analysis-only 成功说明解析器并非系统性不可用，但不能据此否定模型输出的非确定性。

实施了两个有界修复，未降低正式合同：

1. 提示明确根对象必须且只能包含 `alignments` 与 `follow_up_observations`，禁止 wrapper、commentary 或其他根键；解析器仍执行 exact-key、枚举、Finding 覆盖、Candidate SHA 与行号范围校验。
2. controlled-unblind 响应在解析前以 `controlled-unblind-invocation.json` 只写持久化；同一输出根已存在该证据时拒绝再次调用。服务把该文件纳入可校验、可查询的诊断 Artifact。

此外，本轮沿用前序三个已完成修复：Blind Analysis Provider/runtime 错误优先级、`read_evidence(trace)` 显式正整数 sequence 合同，以及可审计/可配置的 Analysis Provider request timeout。

## 独立 Analysis-only Review

在第一次完整 Job 的两个有效 Run 与 Mapping 上，以新输出根 `D:\AI\evalsvc-v3-analysis-only-r1` 执行独立 Review；没有改写失败 Job。

- 结果：`human_review_ready`
- 原 Run：`coding-task-20260923082344197-a95dfb6f`、`coding-task-20260923082350612-b5f5c338`
- 模型：`deepseek/deepseek-v4-flash`
- request timeout：300,000 ms
- Blind Analysis：9 次 Provider request、30 次工具调用、116,769 input tokens、19,587 output tokens、USD 0.007519316、94,837 ms
- `update_state`：1 次；Finding `F-1` 被合法标记为 dropped
- controlled-unblind：零 kept Finding，Harness 按正式合同确定性生成空 `alignments`/`follow_up_observations`，没有额外模型调用
- 报告：Markdown 3,591 bytes、HTML 6,062 bytes、PDF 80,227 bytes

**边界：** 该结果只证明复用既有真实 Coding 证据时的 Review 链路成功；它不替代新的 HTTP Job 端到端证据。

## 最终完整 HTTP Job

### 执行身份与部署参数

- Spec registry：`.runs/evaluation-service-specs/small-real-v4-e2e-20260923/specs.json`
- Spec ID：`small-real-two-run-v2`
- Frozen Plan SHA-256：`ee805b5fe2f9921e63be792b7224a6bf8bf18e957212d703d9af3e6cbf22b4d1`
- executor files：21 个，提交时全部摘要匹配
- Job timeout：2,400,000 ms
- Analysis request timeout：300,000 ms
- Redis：`redis:7.4.7-alpine`，本机端口 6389，DB 14
- 队列：`skill-evaluation-jobs-v1-real-e2e-final-20260923`
- API：loopback `127.0.0.1:4320`
- Worker：1 个进程，`concurrency=1`；全局并发配置 2（均非业务代码永久上限）
- Job 根：`D:\AI\ej4`
- Credential：Worker 从注册的 `.env.g005` 文件解析；Job Data、HTTP 返回与公开 Artifact 中未放入密钥

零调用预检输出为 `ready_at_execution_boundary`，`real_model_calls=0`、`credential_reads=0`，确认新 Spec 与当前 executor 摘要一致后才提交真实 HTTP Job。

### Coding Run、Verifier 与 Mapping

1. `coding-task-20260923084146839-18adb031`
   - 条件：no Skill
   - `execution_status=completed`
   - `verification_status=passed`
   - DeepSeek 请求 5 次，工具调用 6 次，1,111 input / 406 output tokens，USD 0.0002806888，5,336 ms
2. `coding-task-20260923084152184-b888cedc`
   - 条件：with Skill
   - `execution_status=completed`
   - `verification_status=passed`
   - Candidate SHA-256：`cd75889619cf15a7c3fe35c676cce2208276c2c93cd02ccab674bd576bf276ff`
   - DeepSeek 请求 5 次，工具调用 6 次，1,059 input / 390 output tokens，USD 0.0002707208，4,065 ms

Thin Mapping 含上述两个 Run，均为 attempt 1、`included_for_evaluation=true`，没有 manual invalid reason。HTTP 终态对两条 Run 的公开投影同样为 `completed/passed`。

### Analysis 与 controlled-unblind

Blind Analysis：

- 模型：`deepseek/deepseek-v4-flash`
- timeout：300,000 ms
- 8 次 Provider request，18 次工具调用
- 137,188 input / 28,728 output tokens
- USD 0.0120944992，129,397 ms
- `update_state` 调用 1 次；所有最终 Finding Locator 均已实际加载
- 2 个 Agenda Item；`F1` kept/sealed，`F2` dropped

controlled-unblind：

- 同一模型、同一 300,000 ms timeout
- 1 次 Provider request，0 工具调用
- 2,307 input / 804 output tokens
- USD 0.0005305384，4,040 ms
- 持久化响应根键恰为 `alignments`、`follow_up_observations`
- 正式结果包含 1 个 alignment、1 个 follow-up observation
- 最终 State phase：`human_review_ready`

报告明确保持保守结论：两组 Run 都通过；观察到流程差异但不足以证明 Skill 收益或因果，不据此修改 Skill。

### HTTP Artifact 验证

服务返回并逐个通过 GET 重读了 14 个 Artifact：request、Spec snapshot、queue receipt、stdout、stderr、log metadata、controlled-unblind invocation、Mapping、Analysis State、Markdown、HTML、PDF、两个 Run Manifest。所有请求均返回 HTTP 200，所有实际字节数与终态记录一致，14/14 SHA-256 匹配。

关键本地路径：

- Job terminal：`D:\AI\ej4\jobs\e45998aaeb9627a5db6ca9c4331785182926262e75987807cf9bd6c20a84e488\terminal.json`
- Mapping：`...\evaluation-output\mapping\thin-evaluation-mapping.json`
- Analysis State：`...\evaluation-output\review\analysis-state.json`
- controlled-unblind invocation：`...\evaluation-output\review\controlled-unblind-invocation.json`
- Reports：`...\evaluation-output\review\reports\`

PDF 为 133,196 bytes，已用 Poppler 渲染第一页并人工检查：中文、结果矩阵、Finding、边界说明与 Candidate SHA 均可读，无明显裁切或乱码。

## 确定性验证

- `npm run typecheck`：通过
- `trace-analysis-phase4b.test.ts` + `trace-analysis-model.test.ts`：21/21 通过
- `evaluation-service-core.test.ts` + `evaluation-service-faux-formal.test.ts`：7/7 通过
- 新 Spec 零模型 preflight：通过
- HTTP Artifact 重新下载与摘要校验：14/14 通过

前序已通过且未受本轮局部修复影响的容量、并发、Redis 不可用、Credential、timeout、Worker crash 与重复执行测试未机械重跑。

## Git 状态与能力边界

工作树仍为有意的未提交状态；未 commit、未 merge、未 push。历史失败 Job、历史 Session 和冻结产物均未修改。当前改动同时包含此前 V1 服务实现、Analysis 三项修复及本轮 controlled-unblind 诊断/合同澄清；不能把它们描述成基线 `603207f...` 已有能力。

原有能力：`workbench evaluation run/review`、Frozen Plan、Pi Coding Agent、Verifier、Thin Mapping、Analysis State 与报告。  
V1 新增能力：注册 Spec 的 HTTP 异步提交/查询、Redis/BullMQ 队列、可配置并发 Worker、独立 Job/Attempt/Launch 根、子进程管理、有界日志、状态与 Artifact 引用、重复投递边界及失败证据。  
本轮修复：Analysis 错误优先级、Trace Locator Schema、可配置 request timeout、controlled-unblind 精确输出提示与解析前证据持久化。

仍不支持或未证明：exactly-once、已跨 dispatch 边界 Attempt 的自动安全重放、跨机器调度、高可用 Redis、自动扩缩容、完整跨重启恢复、生产认证/多租户、真实 Coding Agent 并发压测或 Formal18/SWE-bench 重跑。当前结果也不证明 Candidate Skill 的普遍收益。
