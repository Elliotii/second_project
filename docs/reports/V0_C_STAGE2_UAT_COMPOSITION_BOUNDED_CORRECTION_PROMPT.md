# V0-C Stage 2 UAT-local Composition Bounded Correction Prompt

```yaml
status: authorized_by_user
authorized_at: 2026-07-31
execution_owner: original_v0_c_stage2_uat_session
product_source_edits_authorized: false
formal_product_run_authorized: false
credential_read_authorized: false
external_network_authorized: false
git_authorized: false
```

你是发生第一次 Stage 2 Pause 的原 UAT Session。本轮只负责修正你自己创建的
UAT-local composition，并为新的 fresh replacement UAT Session 准备一个经过
零调用检查的候选。你不得执行 Product Surface、读取凭据、创建 Run/Attempt、
联网、修改 Workbench/Fixture/Pi/控制状态或提交 Git。

## 1. Preserve the failed execution

以下内容必须保持字节不变：

- `.runs/v0-c/runs/run-1d7829b0-338f-4555-b6ac-72d5d08b228d/`
- `.runs/v0-c/uat/stage2-uat-composition.ts`
- `.runs/v0-c/uat/stage2-real-run-authority-consumed.json`
- `.runs/v0-c/uat/execution-failure-summary.json`
- `.runs/v0-c/uat/formal-run-*`
- 第一次 Pause 的其他 runtime evidence

不得补写第一次 Run 的 Outcome、Index、terminal 或 Verifier。

## 2. Exact bounded correction

在新的 ignored 目录：

```text
.runs/v0-c/uat-replacement-candidate/
```

创建新的 composition candidate。以第一次脚本为来源，但至少完成：

1. 将冻结 Tool Profile 精确改为：

   ```text
   workspace_read
   workspace_list
   workspace_search
   workspace_edit
   workspace_write
   run_command
   ```

2. 定义一个不可变 `EXPECTED_TOOL_NAMES`，同时用于：
   - `createBoundedToolProfile(...).tools` 的本地构造后断言；
   - `before_provider_payload` 中 Provider payload 的工具名断言。

3. `UAT_ROOT` 必须来自新 candidate 目录自身（优先 `import.meta.dirname`），
   不得复用 `.runs/v0-c/uat/` 的旧 marker/summary。

4. replacement marker 名称必须明确不同，例如：

   ```text
   stage2-replacement-run-authority-consumed.json
   ```

5. 候选脚本本轮不得创建该 marker；只允许未来 fresh UAT Session 在完成全部
   replacement Gate A 后 exclusive-create。

6. 保留原有的：
   - `runV0CProductSurface` 唯一正式入口；
   - public emitted Pi imports；
   - DeepSeek V4 Flash frozen descriptor；
   - `thinkingLevel: high`；
   - `timeoutMs: 120000`、`maxRetries: 0`；
   - exact AssistantMessage usage/cost accounting；
   - request/tool/token/cost/time hard limits；
   - same Harness/Session/Workspace；
   - reasoning/secret 非持久化；
   - no direct `run-v0c.ts` / G006 Driver import。

7. 不得通过删除 payload assertion 来“修复”；应修正错误的冻结期望。

## 3. Zero-call validation

只允许：

- strict TypeScript；
- source review；
- import graph/public-boundary check；
- 一个不读取 `.env.g005`、不创建 authority marker、不调用 Product Surface 的
  本地 validation script，用来构造正式 `createBoundedToolProfile` 并证明其
  工具名与 `EXPECTED_TOOL_NAMES` 完全一致；
- SHA-256、source inventory、Git/Pi/status 检查。

必须证明：

```yaml
formal_product_run_invocations: 0
run_identities_created: 0
credential_reads: 0
external_network_calls: 0
provider_calls: 0
model_calls: 0
product_source_edits: 0
```

不得使用真实或 Faux Product Run 来验证。

## 4. Pause Report accuracy correction

`docs/reports/V0_C_STAGE2_UAT_PAUSE_REPORT.md` 中 Task manifest 的真实文件
SHA-256 应为：

```text
7f7e29ba432409da0cad3f80c471a5a8188183575a92e4ebe68b6c67d95b6376
```

将错误值精确改正，并在报告末尾增加简短的
`Main-review accuracy correction`，说明只修正文档哈希，未改原始 evidence
或 Pause disposition。不要改写其他事实。

## 5. Deliverable

写：

```text
docs/reports/V0_C_STAGE2_UAT_COMPOSITION_CORRECTION_REPORT.md
```

至少包含：

- 第一次 Pause 根因；
- 新 candidate 路径与 SHA-256；
- old/new exact delta；
- zero-call validation commands/exit codes；
- frozen Tool Profile 两层断言结果；
- product/root/Pi byte/status identity；
- credential/network/provider/model/Run counts 均为 0；
- 明确该 candidate 尚未获得或消费 replacement Run authority；
- 给 Main Session 的 freeze recommendation。

完成后停止。不得执行 replacement Run。
