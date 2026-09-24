# Skill Evaluation Job Service V1 Backend Completion Implementation Log

**分支：** `codex/skill-evaluation-job-service`  
**开始日期：** 2026-09-24  
**实施合同：** `docs/goals/SKILL_EVALUATION_JOB_SERVICE_V1_BACKEND_COMPLETION_SPEC.md`  
**状态：** Stage 1/2/3/4 PASSED；完整双 HTTP 验收为 `PASS_FULL_DUAL_HTTP_EVALUATION_ACCEPTANCE`

## 身份基线

- 便携发布基线 commit：`603207f20436b1c31f67c3234936a9636f1d5c13`
- 便携发布基线 tree：`edc44fc90b52f7ea2ff4ef20b384e0bd8404f7a3`
- 后端源码与统一 HTTP CLI commit：`943061502ce77bf252dd05b05f1ba84fb787a5ba`。
- 完整双 HTTP 验收合同/执行 commit：`b72df11ae0f1d1cdafd8be0486cd7618f62960a5`；tree：`81a82b9ef04b5f6c4b237c9c97aaccb2f8ee8303`。
- 完整双 HTTP 验收结果记录 commit：`77b081d971b05aa468eeb5a190b28551315e159c`。
- 最终 Stage 4 tracked delivery commit/tree 由包含本段的收口提交产生，无法在自身内容中自引用；精确身份、21 个 executor digest 和 post-commit preflight 结果记录在忽略的 delivery evidence 及最终交接中。

## 授权与固定边界

- 已授权两个、且仅两个真实小型 Evaluation Job；相同合法 Spec、不同 idempotency key。
- 两个独立 Worker，各本地 concurrency=1；BullMQ 全局 concurrency=2。
- 不降低单 Job 的模型、Token、thinking、工具、任务或 Analysis 预算。
- 不执行真实并发 4/8，不 merge、不 push。
- 任一非预期失败：停止新动作和付费重试；让另一合法 Job 按现有生命周期安全收敛，随后分别核验两条现场并停止。

## Stage 0：SPEC 合同澄清

### 已完成

- 将 SPEC 状态改为 Approved。
- 补充双 Job 中单条失败时的现场稳定与暂停规则。
- 补充 CLI `wait` 超时不取消后台 Job 的合同。
- 补充便携基线、dirty worktree executor identity、最终 commit/tree 和 post-commit Spec 四层身份区分。

### 变更文件

- `docs/goals/SKILL_EVALUATION_JOB_SERVICE_V1_BACKEND_COMPLETION_SPEC.md`
- 本持续实施记录。

## Stage 1：真实双 Job 并发

### 配置与零模型 Preflight

- Spec registry：`.runs/evaluation-service-specs/small-real-v4-e2e-20260923/specs.json`
- Spec ID：`small-real-two-run-v2`
- Frozen Plan SHA-256：`ee805b5fe2f9921e63be792b7224a6bf8bf18e957212d703d9af3e6cbf22b4d1`
- executor files：21 个，Stage 1 preflight 时全部匹配。
- Analysis Provider request timeout：`300000 ms`
- Job timeout：`2400000 ms`
- 零模型 preflight：`ready_at_execution_boundary`；`real_model_calls=0`；`credential_reads=0`。
- Pi runtime：`.runs/v0-a/pi`，bootstrap check identity `027a5847901b5dde30270abaa1041046cd2b4b55`。
- Redis：`redis:7.4.7-alpine`，`127.0.0.1:6390`，DB 15。
- Queue：`skill-evaluation-jobs-v1-real-c2-20260924-01`。
- API：`127.0.0.1:4321`，PID 18212。
- Worker：PID 21940 与 7756；各 `concurrency=1`；全局并发 `2`。
- Job root：`D:\AI\ejc2-20260924-01`。
- Control/log root：`D:\AI\ejc2-control-20260924-01`。
- Credential：Worker 使用注册的 `.env.g005` 文件；未把密钥放入 HTTP body 或 Redis Job Data。

实时 `workbench evaluation run --help` 已确认正式命令仍要求 Frozen Plan、逐 plan-id binding、Credential file 和 fresh output，且不提供隐式 retry。第一次未设置 `PI_RUNTIME_ROOT` 的 help 检查在 loader preflight 失败；设置 bootstrap check 给出的 runtime 后，help 正常输出。这是提交前的机械设置纠正，没有模型或 Credential 读取。

### 真实执行身份

两个 POST 由同一 Node 进程使用 `Promise.all` 近同时提交，均返回 HTTP 202、`deduplicated=false`：

| Key | Job ID | launch token | runner / evaluator PID |
|---|---|---|---|
| `backend-c2-20260924-a` | `88a7167ae2889be57aa2874ca63dfaa45257f10173055618bbdf6d786660955a` | `ac4a4e336d1a846c46bdf6f0bb108701b1356540edbc0a8de4861a14de84bd48` | 30760 / 6248 |
| `backend-c2-20260924-b` | `134e3208e3d78294663b3ae1f287a54b7a56cf777f9ab1afefbb04709b98a810` | `3440cc3cee8ced62ddc808c4215ffebe416ec3d4cff422c90904ccfa843231ef` | 9992 / 27136 |

两个 Job 都曾由 HTTP 报告为 `running` / BullMQ `active`；没有提交第三个 Job，也没有 retry。

### 已取得的有效并发与隔离证据

虽然最终验收失败，真实并发机制已经产生下列不可改写的有效观察：

- evaluator 区间：
  - Job A：dispatch `2026-09-23T19:39:08.643Z` → child terminal `19:42:19.009Z`
  - Job B：dispatch `2026-09-23T19:39:08.660Z` → child terminal `19:42:19.043Z`
  - 实际重叠：`190349 ms`
- 第 1 对 Coding Run：重叠 `7326 ms`。
- 第 2 对 Coding Run：重叠 `4203 ms`。
- Blind Analysis Session：重叠 `176977 ms`。
- 四个 Coding Run 都是 `execution_status=completed`、`verification_status=passed`；每个 Run 5 次 Provider request、6 次工具调用。
- Job A Run ID：`coding-task-20260923193909745-1678059b`、`coding-task-20260923193917683-58e26dec`。
- Job B Run ID：`coding-task-20260923193909746-0f7ad83b`、`coding-task-20260923193917079-6774c378`。
- 两份 Thin Mapping 均存在，且只引用各自 Job root 下的两个 Run；Run ID、Workspace、Session、launch token、进程身份和目录没有交叉。
- 四个 evaluator/runner PID 在终态后均不存在；两个 terminal 均记录 `cleanup_confirmed=true`。
- 对 `.env.g005` 中的一个非空密钥值做了不输出内容的精确扫描：两个 Job/control root 为 0 命中；Redis DB 15 的 7 个 key 为 0 命中。

### 失败现场

两个 Job 都自然收敛，没有受控强杀：

| Job | 服务终态 | 时间 | 消息 |
|---|---|---|---|
| A | `execution_failed` | `19:39:08.487Z` → `19:42:19.009Z` | `Blind Analysis fresh Provider error before accepted State: terminated` |
| B | `execution_failed` | `19:39:08.496Z` → `19:42:19.043Z` | 同上 |

权威现场：

- Job A：`D:\AI\ejc2-20260924-01\jobs\88a7167ae2889be57aa2874ca63dfaa45257f10173055618bbdf6d786660955a\`
- Job B：`D:\AI\ejc2-20260924-01\jobs\134e3208e3d78294663b3ae1f287a54b7a56cf777f9ab1afefbb04709b98a810\`
- API/Worker 日志与 Redis 快照：`D:\AI\ejc2-control-20260924-01\`
- Redis RDB SHA-256：`02aee41e400c86946f45b3062ea4b5905dfa2cf178ae3cf2ad6f3827ec151bfc`。

每个失败 terminal 发布的 6 个 HTTP Artifact（request、Spec snapshot、queue receipt、stdout、stderr、log metadata）均 HTTP 200，12/12 的字节数与 SHA-256 匹配。历史文件没有覆盖或拼接。

Blind Analysis 现场：

- 固定模型均为 `deepseek/deepseek-v4-flash`，API 为 `openai-completions`，Session metadata 均记录 `request_timeout_ms=300000`。
- Job A：10 个有 usage 的成功响应后，第 11 个 Assistant message 为 `stopReason=error` / `errorMessage=terminated`；15,571 input、21,047 output tokens、USD 0.0084146552、27 个已发出的工具调用；未发出 `update_state`。
- Job B：6 个有 usage 的成功响应后，第 7 个 Assistant message 为同一错误；13,020 input、16,244 output tokens、USD 0.0065040864、23 个工具调用。错误 Assistant message 中流出了一个 `update_state` toolCall，但没有后续 tool result，也没有持久 State；现有证据不能证明工具真正开始执行，因此不能当作合法 State 提交。
- Job A 最后一次请求从最后一组 tool result 到 error 约 73.389 秒；Job B 约 98.850 秒，均短于 300 秒 request timeout。
- 两条 error message 的时间只相差约 29 ms；没有 429、余额不足、Job timeout、Worker crash、stalled redelivery 或 Credential 错误证据。
- 两个 Job 都没有 `analysis-state.json`、controlled-unblind 或 Markdown/HTML/PDF 报告，所以不满足 `human_review_ready`。

### 根因判断

**Fact：** `model-runner.ts` 已把 Spec 的 300,000 ms 传入 `AgentHarness.streamOptions.timeoutMs`；Pinned Pi 的 `openai-completions.js` 又把它传入 OpenAI SDK request `timeout`。本次最终两个请求都在 300 秒之前以 Provider Assistant message `stopReason=error` / `terminated` 返回。

**Fact：** 服务 Job deadline 为 2,400,000 ms，实际约 190.5 秒；Worker 没有走 timeout terminal，API/两个 Worker 在失败后仍存活。当前证据排除“服务 Job timeout 触发”和“300 秒本地 request timer 到期”作为直接终止器。

**Fact：** Blind Analysis 的错误优先级修复按预期生效：真实 Provider 错误没有再被“未持久化 State”覆盖。Job B 中 errored message 携带的未执行 `update_state` 也没有被错误接纳。

**Inference：** 两条独立 Analysis 在近乎相同绝对时刻得到 `terminated`，更符合共享 Provider/gateway/网络传输被关闭或某个当前不可见的共同上游边界，而不像两个不同长度的单请求各自命中 300 秒本地 timeout。

**Unconfirmed：** 现有 Artifact 只保留 Pi Assistant message 的 `errorMessage=terminated`，没有 HTTP status、底层 undici/OpenAI error cause 或 Provider request ID；因此不能在本轮断言是 DeepSeek 并发额度、网关限制、宿主网络、SDK stream，还是其他上游传输原因。也没有证据支持把余额不足作为原因。

**Unconfirmed：** Job B 的 partial `update_state` 是否已由 Provider 完整生成但在终止事件前未收到合法 finish event。正式合同正确地拒绝了它，不能据此恢复或伪造 State。

### 拟议最小修复/验证方向（尚未实施）

1. **先补安全诊断，不改评测语义：** 在 `src/trace-analysis/model-runner.ts` 的 Provider request 生命周期记录每次 request 的序号、开始/结束时间、stop reason、错误类别和可安全获得的 cause/status/request-id；禁止记录 Credential、完整 Prompt/response 或私人输入。若 Pi 当前不暴露底层 cause，则如实记录“不可获得”，不修改 `.upstream/pi`。
2. 为上述诊断增加 Faux/确定性测试，证明并发 errored Assistant message、partial toolCall 和正常 response 的记录与错误优先级；不增加自动 retry，不接纳 error response 中的 `update_state`。
3. 经审核后，优先用已完成的四个 Run/Mapping 做两个独立 Analysis-only 并发验证，减少重复 Coding 成本并区分“Analysis Provider 并发”与服务/Workspace 隔离；这是新的付费尝试，当前未授权。
4. 只有新的诊断证据证明 Provider 不支持两个长 Analysis 并发时，才评估有界 Analysis admission/rate control；不能预先通过降低模型预算、串改 Frozen Plan 或静默重试来获得成功。
5. 若 Analysis-only 定位并通过，完整 Stage 1 仍需两个新的合法 HTTP Job 才能最终验收；不得把本次失败 Job 与新 Analysis 产物拼接成成功。

潜在影响：新增诊断若进入 executor source identity，必须刷新 Spec digest；任何重试使用新的 Job/Review 身份。建议回归 `trace-analysis-model.test.ts`、Analysis/Review CLI、evaluation-service core/Faux，并重新做零模型 Spec preflight。

### Stage 1 验收结论与剩余工作

**结论：FAILED / BLOCKED。** 实际并发与隔离的中间证据成立，但两个 Job 均缺失正式 Analysis State 和 Report，不能宣称真实双 Job E2E 通过。

剩余工作：等待用户与 Web GPT 审核上述诊断/最小方向；获批后从诊断增强与确定性回归恢复，再由新的明确授权决定 Analysis-only 或两个新 HTTP Job。Stage 2、3、4 均未开始；没有本地 commit、merge 或 push。

## 2026-09-24：双 Job Analysis termination 定向诊断（只读）

状态：`DIAGNOSIS_COMPLETE / STAGE_1_REMAINS_BLOCKED`。

聚焦报告：`docs/reports/SKILL_EVALUATION_JOB_SERVICE_V1_DUAL_JOB_TERMINATION_DIAGNOSIS_2026-09-24.md`。

本轮只读取既有 Job/Attempt、Analysis Session、Run、Mapping、terminal、HTTP Artifact、当前源码、SDK/Pi 源码以及 Windows/Clash 可访问历史记录；没有修改功能代码，没有发起 Provider/真实模型调用或复测，没有 commit、merge、push，也没有覆盖原失败现场。

### 对原 Stage 1 记录的两个证据澄清

1. 先前记录的“最后一组 Tool result 到 error”的 73.389 秒（Job A）和 98.850 秒（Job B）只是 Session 中两个已持久化事件的间隔。现有 Session 没有下一请求的 dispatch、response-header 或逐 chunk 时间，不能把这两个间隔称为最后一次 HTTP 请求的真实持续时间，也不能据此断言命中某个 timeout。
2. Job B 的 error AssistantMessage 确实带有一个 partial `update_state` ToolCall，但 pinned Pi agent loop 对 `stopReason=error` 会在 ToolCall 执行循环前返回。因而该 Tool **确认没有执行**；arguments 也缺少正式 Schema 的必需字段。它不是有效 State，不能恢复或接纳。

### 新确认事实

- 两个最终失败 response 都已经有 Provider response ID/model 和大量流式内容：Job A 有约 2,551 字节 thinking；Job B 有约 21,082 字节 thinking 及 partial ToolCall。故障属于 response headers/content 之后的流式阶段，不是连接前或 Credential 拒绝。
- 错误时间分别为 `2026-09-23T19:42:18.987Z` 和 `2026-09-23T19:42:19.016Z`，相差 29 ms；两个 evaluator 位于不同进程，不共享 AgentHarness、OpenAI client 或 process-local 连接池。
- 本机没有显式 HTTP(S) proxy 环境变量，WinHTTP direct、WinINET proxy disabled；但实际流量经过已启用的 Clash TUN。Clash 历史 service log 在两个 dispatch 后约 4.1 秒记录了两条到 `api.deepseek.com:443` 的 TUN/GLOBAL TCP 连接。
- Clash/Windows 的现有历史日志没有连接关闭、reset、chunk 或 request ID 记录。网络切换、代理重连、远端关闭或流式空闲 timeout 均“无法追溯”，不能因未查到事件而排除。
- 当前 OpenAI SDK `timeout=300000` 在 `fetch()` 返回 response headers 后即清除，不覆盖完整 SSE body；两次失败 response 已有 headers/content，因此该本地 timer 不是直接触发器。Job deadline 2,400,000 ms 也未命中。
- Pi `openai-completions` 的异常归一化只保留 status/body/message；本次无 status/body 后只剩 `terminated`，丢弃了可能的 `name/cause/code/request-id`。进入 Workbench `model-runner.ts` 时原始 cause 已不可逆丢失。

### 根因程度与拟议修复

最受证据支持的推断是两个并发流遇到一个位于共同外部路径（Provider/gateway 或 Windows TUN/Clash/上游出口）的同一事件；尚不能归因到其中任何一个组件，也没有 429、余额不足、Credential、Worker crash 或 stalled redelivery 证据。

待审核的最小修复是只在 Workbench 中记录有界、安全的 Analysis Provider request 生命周期：request ordinal、请求/headers/message-end 时间、status、allowlist request-id、stop reason、响应 ID/model、内容类型/字节数和 `update_state` emitted/executed/accepted 分层状态；禁止记录 Prompt、thinking/text 正文、Tool arguments、Credential 或完整 headers。失败 Job 通过现有 Artifact 完整性机制发布该安全文件。该方案能区分 headers 前失败和 headers 后流错误，但不能恢复 Pi 已丢弃的底层 socket cause。

建议获批后的固定顺序为：敏感信息检查并建立本地修复前 Git 基线 → 实施最小诊断增强 → 零模型聚焦回归 → 刷新 executor identity/Spec 并 preflight → 可选但推荐的双 Analysis-only 并发验证 → 两个全新合法 HTTP Job 的最终 Stage 1 复测。无自动 retry，不调整正式预算，不放宽 State 合同；复测后无论成功或失败都停止供审核，不自动进入 Stage 2。

## Stage 2：统一 HTTP 使用入口

### 2026-09-24 Stage 1 处置与恢复点

用户接受以下有限处置并授权继续 Stage 2 → 3 → 4：

- 保留真实 HTTP 双 Job 的 evaluator/Coding/Analysis 重叠、四个通过的 Coding Run/Verifier、Mapping 与 Artifact 隔离证据；
- 保留 JSON Mode controlled-unblind Canary 首次成功，以及直连双 Analysis-only Review 均到达 `human_review_ready` 的独立证据；
- 不把 Analysis-only 结果拼接进失败 HTTP Job，不宣称完整双 HTTP E2E 已通过；该项明确延期；
- 本轮不再进行真实模型调用，不实现 B 类降级/自动重试；
- 后续只实施薄 HTTP CLI、零模型可靠性缺口和 Git/可复现交付。

Stage 2 开始时源码身份为 commit `1662c6a5a761ac68189076bc895e95bb5d050f21`、tree `aae9a17f9e99ac24235399a466c66f648e233cf8`。

## Stage 3：可靠性定向巩固

未开始。Stage 1 阻塞后按合同停止。

## Stage 4：Git 与可复现交付

未开始。Stage 1 阻塞后按合同停止。

## 最终边界

- 本轮确认了真实双 evaluator、两组 Coding Run 和 Blind Analysis 的并发重叠，但没有取得完整双 Job 成功。
- 未修改服务、Analysis、Pi 或 Evaluation 语义；只更新了获批 SPEC 与本实施记录。
- 临时 API/Worker 已停止；Redis 在保存 RDB 后停止并由 `--rm` 移除。Job/Session/Mapping/失败 terminal 与控制日志均保留。
- 当前停止等待审核，不自动修复、不重试、不推进后续阶段。

## 2026-09-24：方案 A 修复与双真实 Job 复测

**状态：** `STAGE_1_RETEST_FAILED / BLOCKED`
**聚焦报告：** `docs/reports/SKILL_EVALUATION_JOB_SERVICE_V1_DUAL_JOB_RETEST_2026-09-24.md`

### Git 与 Spec 身份

- 修复前本地基线：commit `a75d7aef777c932d8380120c8ff2da3831d15780`，tree `3d83d1f509b58e2805623b7a5a33d6dcd550b638`。
- 方案 A 修复：commit `75b41881d6266ea77a3e7b0ef4f27da9433f55a4`，tree `6c76207e5e32f765cb295bd42f0e115e01f0223f`。
- 新 Spec：`.runs/evaluation-service-specs/small-real-v5-diag-20260924/specs.json`，绑定上述修复 commit/tree 与 21 个 executor file digest；Frozen Plan SHA-256 `66c02d14ad0c85cfed84001b1baa350248961b4f424a62e032acba49a6a07af9`。
- 零模型 preflight：`ready_at_execution_boundary`，0 model call，0 Credential read；Analysis request timeout 300,000 ms，Job timeout 2,400,000 ms。

### 已实施和已回归

- 在 Workbench 层新增安全、有界的 Analysis Provider request 生命周期诊断，不修改 pinned Pi/SDK，不记录 Prompt、response/thinking 正文、Tool arguments、Credential 或任意 headers。
- 成功/失败 Job 均可通过现有内容摘要 Artifact 路由发布 `analysis-provider-requests.json`。
- TypeScript PASS；Evaluation Service 11/11 PASS；Analysis/Review 聚焦测试 23/23 PASS；Faux 正式闭环单独 1/1 PASS。

### 本轮唯一真实双 Job 尝试

- Job A：`847ddb20060c3490a1587a223c6046483f6e17fa51fdcd19821c40a18bcedd08`
- Job B：`76e23bd1460739352cb1d497400dc3c3743b900761d132ede5e6d5b9f550ef03`
- 两个独立 Worker，各 concurrency=1；BullMQ global concurrency=2；无第三个 Job、无 retry。
- evaluator 重叠约 115 秒；两对 Coding Run 重叠 6.372 秒/3.547 秒；Blind Analysis 重叠 99.416 秒；13 对跨 Job Provider request 重叠，最长 30.654 秒。
- 四个 Coding Run 均 `completed/passed`；Mapping/run roots 无交叉。

Job B 完整成功到 `human_review_ready`，正式 State、controlled-unblind 和 Markdown/HTML/PDF 报告齐全；15/15 HTTP Artifact 的 status、bytes、SHA-256 和响应摘要头全部匹配。

Job A 的 Blind Analysis 已合法生成 `alignment_ready` State；controlled-unblind 请求为 headers observed、HTTP 200、normal stop，但模型在 root JSON 中提前多闭合一个 `}`，使最后 29 字符的必需 `follow_up_observations` 字段脱离 root。严格 parser 正确拒绝，服务终态为 `execution_failed`；8/8 失败 Artifact 完整可查。该错误不是本轮 Provider termination 或 timeout。

### 安全、清理与停止

- Credential 精确值：97 个 Job/control 文件 0 命中；Redis 7 个 key dump 0 命中。
- 四个 runner/evaluator PID 均退出，两条 terminal 均 `cleanup_confirmed=true`。
- Redis RDB 保存在 `D:\AI\ejc2-control-20260924-02\redis-dump.rdb`，SHA-256 `ee2845c2274d2ed5658bc6fab37feccdb5284230dea19f07d7f7d6d098e80e19`。
- API、两个 Worker、Redis 容器均已停止；Job roots、control logs、RDB 和原历史现场均保留。
- Stage 1 因一成一败仍为 `FAILED / BLOCKED`。Stage 2/3/4 未开始；未自行修复、未发起第二次真实尝试、未 merge/push。等待用户与 Web GPT 审核。

## 2026-09-24：JSON Mode Canary 与最终双 Job 复测

状态：`CONTROLLED_UNBLIND_CANARY_PASS / FINAL_DUAL_JOB_RETEST_FAILED / STOPPED_AS_AUTHORIZED`

聚焦报告：`docs/reports/SKILL_EVALUATION_JOB_SERVICE_V1_JSON_MODE_CANARY_AND_FINAL_DUAL_JOB_RETEST_2026-09-24.md`

- controlled-unblind JSON Mode 修复已提交为 `1662c6a5a761ac68189076bc895e95bb5d050f21`（tree `aae9a17f9e99ac24235399a466c66f648e233cf8`）；TypeScript 通过，聚焦测试 34/34 通过，刷新 Spec 后零模型 preflight ready。
- 单次 B Canary 首次成功：恰好 1 次 Provider 请求，正式 State、controlled result 以及 Markdown/HTML/PDF 报告均合法；没有使用第二次 B 调整/重试额度。
- 唯一一组新双 Job：`79cf319255ba6b41d6de4fe475a3c8a667a780adfcdf0577a935d956d140d0eb` 与 `be241c5f2c9b596e7d47b98e117fbd9fbd82d93b699b135aa7eafec7f52f0a1f`。两条均 HTTP 202、`deduplicated=false`，两个独立 Worker 各 concurrency=1、global concurrency=2。
- 四个真实 Coding Run 均 `completed/passed`，两份 Mapping 无跨 Job 引用；14/14 失败 Artifact 经 HTTP 查询后 bytes/SHA-256 匹配；Credential 扫描 89 文件 0 命中；子进程清理确认。
- 两个 Job 均在 Blind Analysis 最后流式响应中得到 HTTP 200 headers 后，以 `stream_error_after_headers / terminated` 在约 1 ms 内同时结束；没有正式 State 或报告。失败发生在进入 controlled-unblind 之前，和已修复的 B JSON 解析路径不同。
- 双 Job Stage 1 仍为 FAILED/BLOCKED。没有第三个 Job、没有重试、没有进入 Stage 2/3/4。现场与 Redis RDB 已保存，API/Worker/Redis 已停止，等待用户审核。

## 2026-09-24：TUIC 双 Analysis-only 诊断复测

状态：`ONE_REVIEW_PASS / ONE_REVIEW_PROVIDER_TERMINATED / STOPPED_WITHOUT_RETRY`

聚焦报告：`docs/reports/SKILL_EVALUATION_JOB_SERVICE_V1_TUIC_DUAL_ANALYSIS_ONLY_RETEST_2026-09-24.md`

- Clash 本地 profile 显示 `GLOBAL` 选择链的叶子为 TUIC；运行时两条 DeepSeek 连接从 TUN 地址经 `GLOBAL` 建立。
- 两份既有 Mapping 的 dry-run 均 ready；随后只并发执行两个全新 Analysis-only Review，没有 Coding Run 或 HTTP Job。
- Review A 完整成功到 `human_review_ready`，Blind Analysis 8 次正常请求、JSON Mode controlled-unblind 1 次正常请求，State 和 Markdown/HTML/PDF 报告齐全。
- Review B 前 8 次请求正常，第 9 次在 HTTP 200 headers 后约 178.609 秒以 `stream_error_after_headers / terminated` 结束；收到 92,181 thinking bytes，但没有 `update_state`、State 或报告。
- 本轮没有复现两流同时终止，因此削弱但不能否定 gRPC 共享底层连接解释；TUIC 同样没有消除单条长流失败。14 个输出/control 文件 Credential 扫描 0 命中，相关进程均退出。
- 按授权停止：不重试、不运行完整双 Job、不修改配置或代码、不进入后续阶段。

## 2026-09-24：直连双 Analysis-only 对照

状态：`TWO_REVIEWS_HUMAN_REVIEW_READY / DIRECT_PATH_CONFIRMED / STOPPED_AFTER_ONE_PAIR`

聚焦报告：`docs/reports/SKILL_EVALUATION_JOB_SERVICE_V1_DIRECT_NETWORK_DUAL_ANALYSIS_ONLY_RETEST_2026-09-24.md`

- 路由预检确认 Clash 为 Rule、TUN disabled、Meta adapter/default route 均不存在；无 Credential Node HEAD 直达 DeepSeek 返回 401，Clash 日志无新增 DeepSeek 记录。执行窗口内同样为 0 条 DeepSeek Clash 记录。
- 相同 Plan、两份 Mapping、模型、预算与 300 秒 timeout 的 dry-run 均 ready；随后只并发执行一组两个 Analysis-only Review。
- Review A：Blind 7 次 + controlled 1 次请求全部 normal，`human_review_ready`，State 与三种报告齐全；最大单请求 49.472 秒。
- Review B：Blind 7 次 + controlled 1 次请求全部 normal，`human_review_ready`，State 与三种报告齐全；最大单请求 31.202 秒。
- 本轮总费用 USD `0.0182699608`；20 个输出/control 文件 Credential 扫描 0 命中；相关进程均退出。
- 该结果提高了代理/TUN 路径为故障贡献因素的可信度，但本轮没有产生接近 180 秒的直连流，不能证明单一根因；它仍不是完整 HTTP 双 Job E2E。按授权停止，等待下一步决定。

## 2026-09-24：Stage 2 统一 HTTP 使用入口

状态：`PASSED`

### 实现

- 新增 `workbench/scripts/evaluation-service-client.ts`，只调用既有 loopback HTTP API；没有复制 Evaluation CLI、队列或调度逻辑。
- 命令面：`specs`、`submit`、`status`、`wait`、`result`、`artifact`。
- `submit` 支持多个显式 idempotency key；`status`/`wait`/`result` 支持多个 Job ID。
- `wait` 的本地 timeout 不发送 cancel/delete，也不改变后台 Job；Job ID 可继续查询。
- 退出码区分参数错误、客户端等待超时、HTTP/服务错误、Job 基础设施失败和 Artifact 错误；completed 结果内的合法 `TASK_FAILURE` 退出 0。
- Artifact 下载拒绝覆盖已有路径，并复核正式 result metadata、字节数、SHA-256 和响应摘要头。
- base URL 仅允许 `http://127.0.0.1` 或 `http://localhost` origin，不扩大服务网络暴露面。
- `workbench/package.json` 新增 `evaluation-service:client`；配置 README 增加命令和退出语义。

### 验证

- TypeScript：PASS。
- 客户端聚焦测试：5/5 PASS，覆盖参数/loopback、多个 submit、409 冲突、合法 `TASK_FAILURE`、Job failure、wait timeout 不取消、Artifact 下载/拒绝覆盖和服务不可用。
- 完整服务套件中的真实 loopback 集成：客户端经正式 API 完成 fake `submit → wait → result → artifact`；结果内 `TASK_FAILURE` 被正确视为合法 completed 业务结果。

## 2026-09-24：Stage 3 可靠性定向巩固

状态：`PASSED`

### 缺口核对与新增回归

- Redis 不可用时查询已完成 Job 的 `status/result/artifact`，以及 Artifact 落盘篡改后的 409 拒绝，已由方案 A 修复时加入 `evaluation-service-redis.test.ts`；本阶段复用并重跑，没有重复实现。
- 新增两个 `fake-delay-100ms` Job 的聚焦回归：不同 Job ID/launch token/Job root，执行区间严格重叠，terminal 与所有公开 Artifact 均解析到各自 Job root，无交叉引用。
- 没有修改 Queue、Worker、Process Supervisor、Evaluation 或 Analysis 正式语义；没有重跑 1/2/4/8 capacity、100 Job、Formal18、SWE-bench 或任何付费模型。

### 最终零模型回归

- `npm run typecheck`：PASS。
- `npm run evaluation-service:test`：18/18 PASS，包含 client、core、crash/stalled redelivery、Credential、Faux 正式两 Run、Redis/idempotency/timeout/nested cleanup、Redis degraded query、Artifact tamper、双 fake 并发隔离和真实 loopback 客户端闭环。
- 临时 Redis：`redis:7.4.7-alpine`，仅绑定 `127.0.0.1:6389`，测试后容器已停止并由 `--rm` 删除。

## 2026-09-25：Stage 4 Git 与可复现交付

状态：`PASSED`

### 提交前核验

- 最终 TypeScript：PASS。
- 最终 `npm run evaluation-service:test`：18/18 PASS。
- 受影响范围的 `git diff --check`：PASS。
- 候选源码、测试、文档和三份聚焦复测报告对 `.env.g005` 中实际 Credential 值的精确扫描：0 命中；扫描过程没有输出 Credential 内容。
- `.env.*` 与 `.runs/` 继续受既有 ignore 保护；新增 `/tmp/` ignore，保留但不提交临时 Canary 脚本和 PDF 渲染文件。
- 临时 Redis 容器已停止并删除；没有遗留测试 API/Worker。
- 2026-09-25 最终聚焦复跑：`npm run typecheck` PASS；`npm run evaluation-service:test` 18/18 PASS；临时 `redis:7.4.7-alpine` 仅绑定 `127.0.0.1:6389`，随后已删除且端口关闭。

### 最终交付内容

- 统一薄 HTTP CLI、package script、聚焦与真实 loopback 集成测试；
- 两 fake Job 并发隔离常规回归；
- README 的 Redis/API/Worker/CLI 启动与使用、退出码、Artifact 校验和 Provider 长流网络限制；
- 原 SPEC 的 Stage 1 有限处置修订、本持续实施记录以及三份后续真实复测报告；
- `CURRENT_STATE.md` 的 additive service override 更新。

最终本地 commit/tree 由本记录冻结后的 Git 操作产生，避免文档自引用改变 commit；精确身份、最终 Spec、Frozen Plan、21 个 executor digest 和 post-commit preflight 记录在忽略的 delivery evidence 及最终交接。未经用户确认不 merge、不 push。

## 当前最终边界

- Stage 1 已由 2026-09-25 唯一一组两个新 HTTP Job 完整通过；Stage 2 统一 HTTP CLI、Stage 3 可靠性定向巩固均已通过；Stage 4 的 tracked 交付内容与最终零模型回归已完成，精确 post-commit 身份由忽略的 delivery evidence 闭环。
- 原有 Evaluation CLI、Pi、Verifier、Mapping、Analysis State/报告合同未改变；新增的是异步服务使用入口和定向后端回归。
- controlled-unblind JSON Mode 修复和单次 Canary 成功已保留；B 类降级/自动重试未实现且不属于本轮。
- 历史 Provider termination、B JSON 错误及其失败 Job/Session/Trace 保持原样；它们是历史诊断，不是当前阻塞。最新两个全新 HTTP Job 在同一轮均完整到正式 State 和报告，严格结论为 `PASS_FULL_DUAL_HTTP_EVALUATION_ACCEPTANCE`。

## 2026-09-25：完整双 HTTP 验收重新开放

状态：`AUTHORIZED / PREPARING_NEW_CONTRACT_IDENTITY`

- 用户明确授权一组、且仅一组两个全新真实 HTTP Evaluation Job。
- 继续使用同一小型正式 Evaluation 合同、两个不同 idempotency key、两个独立 Worker（各 concurrency=1）和 global concurrency=2。
- 执行前先提交原 SPEC 的重新开放条款，再刷新匹配新 commit/tree 的注册 Spec并完成零模型 preflight。
- 使用已验证的直连 Provider 路径；不修改服务代理、不降低模型/Token/thinking/工具/任务预算。
- 不启用 B 降级，不在 dispatch 后自动重试，不提交第三个 Job。
- 无论成功或失败，固定两 Job 收敛、证据核验和本记录更新后停止。

### 执行身份与零模型边界

- 合同/执行 commit：`b72df11ae0f1d1cdafd8be0486cd7618f62960a5`。
- tree：`81a82b9ef04b5f6c4b237c9c97aaccb2f8ee8303`。
- v9 registry：`.runs/evaluation-service-specs/small-real-v9-dual-http-b72df11/specs.json`。
- Spec SHA-256：`e6a7e52b8aec5ad00c09bf4c3fc49d2a8f69742a331eca6fdcc6e2fcf31c1720`。
- Frozen Plan SHA-256：`bbaea4ef68a6018a6b33cad95fa092fbed7a2a69ef94f911495bf4e2ce2f444a`。
- executor files：21；Analysis request timeout `300000 ms`；Job timeout `2400000 ms`。
- preflight：`ready_at_execution_boundary`，0 real model call，0 Credential read。

### 网络与服务配置

- Node 进程没有 HTTP(S)/ALL_PROXY 环境变量；WinHTTP direct；无 Clash/Meta/TUN adapter；到 DeepSeek 的 TCP source interface 为 WLAN，Credential-free Node HEAD 返回 401。
- WinINET 桌面代理仍配置，但 Node 当前传输未读取该设置；本轮没有修改系统代理或服务代码。
- Redis：`127.0.0.1:6391/15`；queue `skill-eval-real-dual-20260925-01`。
- API：`127.0.0.1:4322`，PID 22996。
- Worker：PID 4728 / 13264；各 concurrency=1；global concurrency=2。
- Job root：`D:\AI\ejc2-20260925-final-01`；control root：`D:\AI\ejc2-control-20260925-final-01`。

### 提交与终态

同一薄 HTTP CLI 顺序调用两次既有 POST，均返回 HTTP 202、`deduplicated=false`：

| Job | idempotency key | Job ID | terminal |
|---|---|---|---|
| A | `dual-http-final-20260925-a` | `8fd08a5e1c79f16f36275125a6bc49c9194f422049d9fce7c50774d4135b4479` | `completed / human_review_ready` |
| B | `dual-http-final-20260925-b` | `06651f5449ae31d75e9df105e8149ba4361af0f5311ac3bdcfd002c717d81d12` | `completed / human_review_ready` |

- Job A：`19:25:44.515Z → 19:28:29.317Z`，`cleanup_confirmed=true`。
- Job B：`19:25:44.631Z → 19:30:55.925Z`，`cleanup_confirmed=true`。
- evaluator 重叠：`164686 ms`。
- 第 1 对 Coding Run 重叠：`5770 ms`；第 2 对：`3492 ms`。
- Blind Analysis 重叠：`129654 ms`。

### 正式 Evaluation 与 Analysis

- 四个 Coding Run 均 `execution_status=completed`、`verification_status=passed`；每 Run 5 次 Provider request、6 次工具调用。
- 两份 Mapping 各自只引用本 Job root 下的两条 Run；两个 Mapping 的 Run ID 不交叉。
- 两份 State 均 `phase=human_review_ready`，`covered_runs` 与本 Job Mapping 精确一致。
- Job A：Blind Analysis 9 次正常请求，保留 1 个 Finding；随后 JSON Mode controlled-unblind 1 次正常请求，1 个 alignment、1 个 follow-up observation。
- Job B：Blind Analysis 10 次正常请求，保留 0 个 Finding；controlled 阶段 0 Provider request，无需生成 controlled-unblind invocation Artifact。
- 两个 Job 均生成 Markdown、HTML、PDF；A 报告大小 `10289 / 14389 / 130504` bytes，B 为 `3606 / 6077 / 80227` bytes。

### Provider usage

- 固定模型：`deepseek/deepseek-v4-flash`；Analysis request timeout 实际为 `300000 ms`。
- Job A：Coding 10 + Analysis 10 = 20 次 Provider request；总记录费用 USD `0.0126376600`。
- Job B：Coding 10 + Analysis 10 = 20 次 Provider request；总记录费用 USD `0.0190392496`。
- 合计：40 次 Provider request，USD `0.0316769096`。Analysis 诊断中 20/20 request classification 为 `normal`，没有 429、`terminated`、timeout 或 Credential 错误。

### Artifact、安全与清理

- HTTP 逐件读取并复核：Job A 15/15、Job B 14/14；status、bytes、SHA-256 与 `x-content-sha256` 全部一致，两份 PDF magic 为 `%PDF`。
- 使用扩展 Windows path 扫描 Job/control/Redis RDB 共 98/98 个文件，对 `.env.g005` 实际 Credential 值为 0 命中；扫描未输出 Credential 内容。
- Redis RDB：`D:\AI\ejc2-control-20260925-final-01\redis\dump.rdb`，SHA-256 `52f0b25b82d4b572a667e96f2805f8eaa1d93080833291797d5e349140690fc8`。
- runner/evaluator PID 32044/33212/9716/31164 全部退出；API/Worker 停止；Redis 容器停止并由 `--rm` 删除；端口 4322/6391 均不再监听。

### 验收结论

`PASS_FULL_DUAL_HTTP_EVALUATION_ACCEPTANCE`。

本次证明了两个全新合法 Job 在同一执行身份下经 HTTP → Redis/BullMQ → 两个 Worker → Coding Runs → Verifier → Mapping → Analysis State → Report 完整成功，并同时证明实际重叠和隔离。没有第三个 Job、重试、B 降级、预算降低、产物拼接、merge 或 push。结论只适用于当前单机 Windows、真实并发 2 和已验证直连网络路径。
