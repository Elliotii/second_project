# V0-C Stage 2 Replacement Run — Frozen User-Acceptance Start Prompt

```yaml
status: authorized_and_frozen
authorized_by_user: 2026-07-31
execution_owner: fresh_replacement_uat_session
implementation_baseline_commit: 12db75aaea4db4afb774046cfcc94de772a2e90b
workbench_tree_digest: a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446
replacement_candidate_path: .runs/v0-c/uat-replacement-candidate/
replacement_composition_sha256: e543fce7d648fdfc4fcd1b91e7a21c8799a83662e86e850001d5a8741d4fb906
replacement_source_inventory_sha256: dcb94bbba28c614fb37f6d1f215fea6a0089ac549b977aa22643217894e54472
authorized_replacement_product_runs: 1
maximum_attempts_in_replacement_run: 2
maximum_recovery_attempts: 1
maximum_total_deepseek_cost_usd: 2
product_source_edits_authorized: false
git_authorized: false
pi_patch_authorized: false
external_network_authorized: deepseek_official_api_only
credential_access_authorized: fresh_replacement_uat_session_only
```

你是新的 V0-C Stage 2 replacement User-Acceptance Session。你没有参与第一
次失败 UAT、composition 修正、Stage 1 实现或审计。用户已经明确授权本文件
冻结的一个 replacement Product Surface Run。

本轮不是重写旧 Run。必须保留第一次失败 Run 和旧 UAT artifacts，使用全新的
replacement authority marker，由冻结的 replacement candidate 创建一个新的
Run identity。

## 1. Required reading

完整读取：

1. `AGENTS.md`
2. `CURRENT_STATE.md`
3. `docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md`
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`
5. `docs/第二项目_Codex交接包_2026-07-30/V0_C_GOAL_CONTRACT.md`
6. `docs/reports/V0_C_STAGE2_FREEZE_AND_UAT_START_PROMPT.md`
7. `docs/reports/V0_C_STAGE2_UAT_PAUSE_REPORT.md`
8. `docs/reports/V0_C_STAGE2_UAT_COMPOSITION_BOUNDED_CORRECTION_PROMPT.md`
9. `docs/reports/V0_C_STAGE2_UAT_COMPOSITION_CORRECTION_REPORT.md`
10. `docs/reports/V0_C_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md`
11. Contract 指定的 Stage 1、G003/G006、ADR、Product Surface 和 Pi public
    source/tests。

进入 Pi checkout 前先读适用 `AGENTS.md`。Pi 与 `reference/` 只读。

## 2. Gate A — replacement identity

真实调用前必须证明：

- root HEAD 为
  `12db75aaea4db4afb774046cfcc94de772a2e90b`；
- 所有 tracked files clean；允许本轮已登记的未跟踪报告/Prompt和
  `reference/`；
- Workbench digest 为
  `a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446`；
- 两个 Pi checkout 都是 `027a5847901b5dde30270abaa1041046cd2b4b55`
  且 clean；
- 第一次失败 Run
  `run-1d7829b0-338f-4555-b6ac-72d5d08b228d` 及旧 `.runs/v0-c/uat/`
  inventory 与 Correction Report 一致；
- replacement candidate 五个 source 文件及 inventory 与冻结值一致；
- composition SHA-256 为
  `e543fce7d648fdfc4fcd1b91e7a21c8799a83662e86e850001d5a8741d4fb906`；
- `stage2-replacement-run-authority-consumed.json` 不存在；
- replacement execution/source-identity/failure/success summary 均不存在；
- `.env.g005` 存在，但不得显示内容。

任何一项不满足：写
`docs/reports/V0_C_STAGE2_REPLACEMENT_UAT_PAUSE_REPORT.md` 并停止，不创建
marker、不读取凭据、不联网、不创建 Run。

## 3. Frozen task, model and budget

完全复用第一次冻结值，不得更换：

```yaml
task_manifest:
  path: fixtures/manifests/v0-c-parse-duration-public.json
  sha256: 7f7e29ba432409da0cad3f80c471a5a8188183575a92e4ebe68b6c67d95b6376
instruction_sha256: 22b166bda844a1a4de90d54b4fa399896ce6e418b3fd5abc094a39409bdb0f35
workspace_source_digest: 83e14ee6480099d479faa392fb9dc5eb1db6e5e860b93702289ef20ca2cc3e0c
verifier_sha256: 0228b85b1fa58ca375c14d6860ba86e2af0e5c9d01308343f5a4fe07519145b7
strategy:
  path: fixtures/manifests/v0-c-recover-once-deepseek-v4-flash.json
  sha256: 72692b3f73eae80c38fafab3f38df3bff8fca7fd62488a4a535e2967a7957ae8
scenario: recover_once_pass
provider: deepseek
base_url: https://api.deepseek.com
model: deepseek-v4-flash
thinking_level: high
transport_timeout_ms: 120000
transport_max_retries: 0
authorized_product_runs: 1
attempt_limit: 2
recovery_slot_limit: 1
total_cost_cap_usd: 2
```

预算必须继续使用 `STAGE2_MAXIMUM_BUDGET_V0C`：

- per Attempt：8 Provider requests、12 Tool calls、300000ms、65536 tokens、
  USD 1；
- Run：16 Provider requests、24 Tool calls、900000ms、120000ms finalization
  reserve、2 Verifier、131072 tokens、USD 2；
- child reserve：8 requests、12 Tools、300000ms Agent、30000ms Verifier、
  65536 tokens、USD 1、120000ms finalization。

## 4. Mandatory zero-call checks

marker 创建前重新执行：

1. strict Workbench TypeScript；
2. 8/8 focused post-audit regressions；
3. 正式 CLI dry-run，确认 0 credential/provider/network；
4. replacement candidate strict TypeScript；
5. `validate-replacement-candidate.ts`，确认六个 Tool 名称双边一致且：

   ```yaml
   formal_product_run_invocations: 0
   run_identities_created: 0
   credential_reads: 0
   external_network_calls: 0
   provider_calls: 0
   model_calls: 0
   replacement_marker_exists_before_or_after: false
   ```

6. 再次复算 composition/source inventory 和 tracked source identity。

失败则 Pause，不得“修 candidate 后继续”。新 UAT Session没有 composition
修正权。

## 5. Consume replacement authority exactly once

全部 Gate 通过后，使用 exclusive-create 在：

```text
.runs/v0-c/uat-replacement-candidate/
stage2-replacement-run-authority-consumed.json
```

写非秘密 marker，至少记录：

```yaml
schema_version: 1
authorization_source: user_authorized_replacement_run_2026_07_31
authorized_product_runs: 1
composition_sha256: e543fce7d648fdfc4fcd1b91e7a21c8799a83662e86e850001d5a8741d4fb906
consumed_at: timestamp
```

marker 创建后才允许最小检查 `.env.g005` 的唯一非空
`DEEPSEEK_API_KEY`。不得打印、复制或持久化 key。

## 6. Execute the one replacement Run

只允许一次命令：

```text
node .runs/v0-c/uat-replacement-candidate/stage2-uat-replacement-composition.ts
```

该脚本必须保持冻结 SHA。不得编辑后再执行，不得第二次调用，不得 alternate
model。无论成功、Provider/API failure、budget stop、invalid evidence 或其他
错误，均保存原始事实并停止真实执行。

初始 Verifier pass 就停止并记录 `no recovery`；只有自然失败且 evidence、
visibility、budget、slot 合资格时才允许同一 Harness/Session/Workspace 中一个
child Attempt。

## 7. Post-run verification

成功返回后：

- 用正式 `workbench/src/cli.ts inspect --run <new-run-id>`；
- 验证 Outcome、Evidence Index、terminal、Journal、Attempt/Session/
  Workspace/Verifier lineage；
- 核对 request/tool/token/cost/time/Verifier/Recovery；
- 核对 source/protected/Pi byte identity；
- 做 secret/reasoning scan；
- 确认第一次失败 Run 与旧 UAT artifacts 未变；
- 不 stage、不 commit、不更新 `CURRENT_STATE.md` 或 Contract。

如果执行失败，同样只取证和写 Pause Report，不重试。

## 8. Deliverable

成功时写：

```text
docs/reports/V0_C_STAGE2_REPLACEMENT_USER_ACCEPTANCE_REPORT.md
```

失败时写：

```text
docs/reports/V0_C_STAGE2_REPLACEMENT_UAT_PAUSE_REPORT.md
```

成功报告必须包含：

- exact replacement Run/Attempt/Session/Workspace IDs；
- exact candidate/baseline/task/model/provider/budget identity；
- request/tool/token/cost/time usage；
- Verifier、Outcome、Inspector、terminal summary；
- Recovery observed/not observed；
- no-source-edit/no-second-replacement-Run attestation；
- credential/secret/reasoning boundary；
- old failed Run preservation；
- commands/cwd/exit codes；
- `Fact / Inference / Recommendation / Unconfirmed`；
- structured `CURRENT_STATE_UPDATE_PROPOSAL`；
- 建议 disposition：
  `PASS_V0_C_USER_ACCEPTANCE`、`ACCEPT_VALID_TERMINAL_FAILURE` 或
  `PAUSE_V0_C_STAGE2_REPLACEMENT`。

完成后停止，等待 Main Session 验收。不得自行关闭 V0-C 或提交 Git。
