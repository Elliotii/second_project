# V0-C Stage 2 Frozen User-Acceptance Start Prompt

```yaml
status: accepted_execution_input
execution_owner: fresh_v0_c_user_acceptance_session
prepared_by: current_main_session
prepared_at: 2026-07-31
implementation_baseline_commit: 12db75aaea4db4afb774046cfcc94de772a2e90b
workbench_tree_digest: a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446
authorized_product_runs: 1
maximum_attempts_in_the_run: 2
maximum_recovery_attempts: 1
maximum_total_deepseek_cost_usd: 2
source_edit_authorized: false
git_authorized: false
pi_patch_authorized: false
external_network_authorized: deepseek_official_api_only
credential_access_authorized: fresh_uat_session_only
```

你是 V0-C 的全新 Stage 2 User-Acceptance Session。你不是 Implementation
Session、Audit Session 或 Main Session。用户已经一次性授权本文件冻结的唯一
一次真实 Product Surface Run；你不得请求扩大授权，也不得把授权解释为第二次
Run、换模型重试、修源码或增加预算。

## 1. Required read order

开始前完整读取：

1. `AGENTS.md`
2. `CURRENT_STATE.md`
3. `docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md`
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`
5. `docs/第二项目_Codex交接包_2026-07-30/V0_C_GOAL_CONTRACT.md`
6. `docs/reports/V0_C_STAGE1_IMPLEMENTATION_REPORT.md`
7. `docs/reports/V0_C_STAGE1_CLOSEOUT_DRAFT.md`
8. `docs/reports/V0_C_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md`
9. `docs/reports/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY_REPORT.md`
10. Contract 指定的 G003/G006、ADR、Pi public source/tests 与以下 Product
    Surface source：
    - `workbench/src/product-surface-v0c.ts`
    - `workbench/src/run-v0c.ts`
    - `workbench/src/pi/real-provider-route-v0c.ts`
    - `workbench/src/pi/pi-adapter-v0c.ts`
    - `workbench/src/pi/tool-profile.ts`
    - `workbench/src/session/evidence-session-v0c.ts`
    - `workbench/src/inspect-v0c.ts`

进入 `.upstream/pi` 或 `.runs/v0-a/pi` 检查 Pi 时，先完整读取适用的 Pi
`AGENTS.md`。Pi 与两个用户参考目录均只读。

## 2. Gate A — exact frozen baseline

真实调用前必须以只读命令证明：

- root HEAD 恰为
  `12db75aaea4db4afb774046cfcc94de772a2e90b`；
- 所有 tracked files clean；允许已登记的 `?? reference/`；
- `workbench/` tree digest 恰为
  `a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446`
  （继续排除既有 `node_modules`）；
- `.upstream/pi` 与 `.runs/v0-a/pi` HEAD 均为
  `027a5847901b5dde30270abaa1041046cd2b4b55` 且各自 clean；
- focused re-audit disposition 为 `PASS_FOCUSED_V0_C_REAUDIT`；
- `.env.g005` 存在，但不得显示、复制、提交或写入证据；
- 本 Prompt 是唯一新增的 tracked-candidate 文件；不得将它误判为
  Workbench source drift。

任何一项不满足，立即写
`docs/reports/V0_C_STAGE2_USER_ACCEPTANCE_PAUSE_REPORT.md` 并停止；不得读取
凭据、不得联网、不得创建正式 Run。

## 3. Frozen user-visible input

```yaml
task_manifest:
  path: fixtures/manifests/v0-c-parse-duration-public.json
  sha256: 7f7e29ba432409da0cad3f80c471a5a8188183575a92e4ebe68b6c67d95b6376
task:
  id: v0-c-parse-duration-public
  instruction: fixtures/tasks/v0-a-parse-duration/task.md
  instruction_sha256: 22b166bda844a1a4de90d54b4fa399896ce6e418b3fd5abc094a39409bdb0f35
workspace:
  source: fixtures/tasks/v0-a-parse-duration
  source_digest: 83e14ee6480099d479faa392fb9dc5eb1db6e5e860b93702289ef20ca2cc3e0c
  materialization: workbench_temporary_copy_under_the_authoritative_run
  writable_paths:
    - src/parse-duration.ts
  protected_paths:
    - task.md
    - task.json
    - package.json
    - test/public.test.ts
verifier:
  id: v0-c-parse-duration-public-v1
  path: fixtures/verifiers/v0-c-parse-duration/verify.mjs
  sha256: 0228b85b1fa58ca375c14d6860ba86e2af0e5c9d01308343f5a4fe07519145b7
  visibility: public_external
strategy:
  path: fixtures/manifests/v0-c-recover-once-deepseek-v4-flash.json
  sha256: 72692b3f73eae80c38fafab3f38df3bff8fca7fd62488a4a535e2967a7957ae8
  id: v0_c_recover_once_same_session_deepseek_v4_flash
  completion_policy: verify_recover_once_same_session
  recovery_budget: 1
scenario: recover_once_pass
```

`scenario` 只选择正式控制路径，不允许制造 synthetic failure。Initial
Attempt 使用原始真实任务：若外部 Verifier pass，必须停止并诚实记录
`no recovery`；只有自然 Verifier failure、证据有效且预算/slot 合资格时，才
允许同一 Harness/Session/Workspace 中的一个 child Attempt，反馈只能来自
Workbench 生成并验证的 public-only Failure Packet。

## 4. Frozen provider/model facts

```yaml
provider: deepseek
official_base_url: https://api.deepseek.com
model_id: deepseek-v4-flash
api: openai-completions
thinking_level: high
model_max_output_tokens: 8192
context_window: 1000000
price_unit: USD_per_1M_tokens
price_checked_at: 2026-07-31
input_cache_hit: 0.0028
input_cache_miss: 0.14
output: 0.28
compatibility:
  supports_store: false
  supports_developer_role: false
  supports_reasoning_effort: true
  supports_usage_in_streaming: true
  max_tokens_field: max_tokens
  requires_reasoning_content_on_assistant_messages: true
  thinking_format: deepseek
transport:
  timeout_ms: 120000
  max_retries: 0
```

冻结前官方事实来源：

- `https://api-docs.deepseek.com/quick_start/pricing/`
- `https://api-docs.deepseek.com/guides/thinking_mode`
- `https://api-docs.deepseek.com/api/create-chat-completion`

真实调用前只允许对上述官方 DeepSeek 路线做最小只读可用性核验。若事实与冻结
值冲突，不得静默改模型、价格或兼容配置；写 Pause Report 并停止。

## 5. Frozen execution budget

使用 `STAGE2_MAXIMUM_BUDGET_V0C` 的下列 exact envelope，不得放宽：

```yaml
attempt:
  provider_requests: 8
  tool_calls: 12
  agent_wall_time_ms: 300000
  token_cap: 65536
  cost_cap_usd: 1
run:
  provider_requests: 16
  tool_calls: 24
  wall_time_ms: 900000
  finalization_reserve_ms: 120000
  verifier_runs: 2
  token_cap: 131072
  cost_cap_usd: 2
child_reserve:
  provider_requests: 8
  tool_calls: 12
  agent_wall_time_ms: 300000
  verifier_runs: 1
  verifier_wall_time_ms: 30000
  token_cap: 65536
  cost_cap_usd: 1
  finalization_wall_time_ms: 120000
```

总授权边界同时是：恰好一个正式 Run、至多两个 started Attempt、至多一个
Recovery。一次 Provider/API 故障也不得通过第二个 Run 或 alternate model
补救。Provider 已返回的每个 AssistantMessage 的 `usage.totalTokens` 与
`usage.cost.total` 必须按 Attempt 和 Run 累加；不得把真实 usage 写成
`unknown`。超限必须停止且如实 terminalize/报告。

## 6. Product Surface composition boundary

正式入口必须是：

```text
runV0CProductSurface(...)
```

禁止：

- 直接 import 或调用 `executeV0CRun` / `run-v0c.ts`；
- 依赖或 import G006 Driver/Spike runtime；
- 修改 `workbench/`、`fixtures/`、控制文件、Pi 或任何 tracked source；
- test-only fake transport、Faux response 或 synthetic verifier failure；
- 把 UAT 组合代码伪装成正式 Workbench 实现。

Stage 1 已冻结 `RealExecutionDependenciesV0C` 的外部 composition seam。你可以且
只可以在 ignored 目录 `.runs/v0-c/uat/` 创建 UAT-local composition root，
用于把下列已经冻结的公开组件组合成 `PiRunHandleV0C`：

- public emitted `@earendil-works/pi-agent-core` 的 `AgentHarness` / `Session`；
- public emitted `@earendil-works/pi-ai`、`providers/deepseek`；
- accepted `createBoundedToolProfile`；
- accepted `EvidenceMirrorSessionStorageV0C` 与 Journal；
- 上述 model descriptor、credential handle 和 budget；
- `runV0CProductSurface` 的 `realExecution` injection。

该 composition root：

- 必须被 SHA-256 记录并在报告中明确标记为
  `uat_local_execution_composition_not_product_source`；
- 只解析 `.env.g005` 中的 `DEEPSEEK_API_KEY`，不得读取其他凭据；
- 应优先用 `createModels({ authContext })` 的内存 auth overlay 传递 credential，
  不要打印 key，也不要生成新的 `.env`；
- 必须使用 public emitted Pi imports；
- 必须为 Harness 设置 `thinkingLevel: "high"`、
  `timeoutMs: 120000`、`maxRetries: 0`；
- 必须复用一个 Harness/Session/Workspace 完成可能的 child；
- 必须复制并保持 Stage 1 Handle 的 Journal、Tool Result Artifact、settled、
  abort/close 与 active Attempt identity 不变量；
- 必须从每个 Attempt 新增的真实 AssistantMessage 汇总 token/cost usage；
- 必须在 `before_provider_request` 和 Tool lifecycle 上执行 request/tool/time
  hard cap，并在调用前保留 child/finalization 边界；
- 不得持久化 reasoning text、API key、Authorization header 或原始 Provider
  payload/response body。

组合脚本不是第二个 Product Surface：它只能创建依赖并恰好调用一次
`runV0CProductSurface`。

## 7. Pre-call sequence

在第一次 Provider call 之前：

1. 完成 Gate A；
2. 对 task/strategy/verifier/instruction 重新计算 SHA-256；
3. 运行 strict TypeScript 和必要的 8 项 post-audit focused regression；
4. 通过正式 CLI 做一次零调用 dry-run，并确认：
   - `credential_read: false`
   - `provider_calls: 0`
   - `network_calls: 0`
   - config/task/strategy/verifier identity 正确；
5. 创建并只读复核 UAT-local composition root；
6. 在 `.runs/v0-c/uat/` 以 exclusive-create 写入一次性授权消费标记；
7. 只检查 `.env.g005` 是否包含一个非空 `DEEPSEEK_API_KEY`，不显示值；
8. 再次确认 tracked source byte identity 未变。

若这时发现需要改源码，立即 Pause。零调用检查可以纠正 UAT-local 脚本，但一旦
发生第一笔 Provider call，不得以修改脚本后再跑第二次来补救。

## 8. The single authorized Run

只调用一次：

```text
runV0CProductSurface({
  projectRoot,
  taskPath: frozen task manifest,
  strategyPath: frozen real strategy,
  dryRun: false,
  scenario: "recover_once_pass",
  realExecution: frozen single-use authority/credential resolver/handle factory/budget
})
```

不得并行或随后发起另一个 Run。无论结果是：

- initial pass / no recovery；
- natural initial fail + one eligible child；
- valid terminal failure；
- invalid evidence；
- infrastructure/API failure；
- budget/cancel/abort；

都保存原始事实并停止真实执行。不得在 UAT Session 修复 Workbench source。

## 9. Post-run verification

运行后至少：

1. 通过正式 `workbench/src/cli.ts inspect --run <run-id>` 检查唯一 Run；
2. 检查 Run/Attempt/Session/Workspace/Verifier/Outcome/Index/terminal lineage；
3. 核对 Provider request、Tool、token、cost、wall time、Verifier 与 Recovery
   计数；
4. 核对 protected files 与所有 tracked source 前后字节一致；
5. 核对两个 Pi checkout 仍为 pinned commit 且 clean；
6. 对 tracked 报告与 Run evidence 做 secret/reasoning 扫描；不得扫描后输出
   凭据本身；
7. 明确是否观察到 Recovery；未发生就写 `not_observed`；
8. 不 stage、不 commit、不更新 `CURRENT_STATE.md` 或正式 Contract。

## 10. Required deliverables

写入：

```text
docs/reports/V0_C_STAGE2_USER_ACCEPTANCE_REPORT.md
```

并在 `.runs/v0-c/uat/` 保存 UAT-local commands/exit codes、composition SHA、
pre/post source inventory 与非秘密摘要。报告必须包含：

- `Fact / Inference / Recommendation / Unconfirmed`；
- exact baseline、Workbench digest、Task/Strategy/Verifier/Model/Provider/Budget；
- exactly-one Run ID 和 Run Root；
- request/tool/token/cost/time usage；
- Outcome 与正式 Inspector summary；
- Attempt/Session/Workspace/Verifier/terminal lineage；
- Recovery observed/not observed；
- source byte identity、Pi status、secret/reasoning scan；
- no-source-edit/no-Git/no-second-Run attestation；
- UAT-local composition 的路径、digest 和非产品性质；
- 所有命令、cwd、exit code；
- limitations 与 claims/non-claims；
- structured `CURRENT_STATE_UPDATE_PROPOSAL`；
- 建议 disposition：
  `PASS_V0_C_USER_ACCEPTANCE`、`ACCEPT_VALID_TERMINAL_FAILURE`、
  `PAUSE_V0_C_STAGE2` 三者之一。

完成后停止，等待 Main Session 独立核验与最终接受。你不得自己关闭 V0-C。

## 11. Binding pause conditions

除正式 Contract 的全部 Pause Conditions 外，以下任一情况立即停止：

- exact baseline/digest/input hash 不一致；
- 需要修改 tracked source 才能创建真实 Handle 或完成 Run；
- credential 缺失或 official DeepSeek facts 与冻结值冲突；
- 无法在调用前证明一次性 Run 标记；
- usage 无法精确归因到 Attempt/Run；
- 预算无法 hard-enforce；
- Provider call 已发生后认为需要 retry/第二 Run；
- 需要 alternative model、额外网络、下载、依赖安装或扩大副作用；
- Agent 可修改 Verifier、Acceptance、protected files 或 Workspace 外路径；
- secret/reasoning 进入持久化证据；
- Pi Core patch/private import 成为必要条件。
