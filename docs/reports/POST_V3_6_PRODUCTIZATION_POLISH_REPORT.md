# Post-V3.6 Productization Polish Report

```yaml
status: implementation_complete_pending_user_product_experience
date: 2026-08-11
version_status: V3_6_remains_closed_and_accepted
starting_commit: f385a73044161f667a2bc6a6c1173af17f69e227
authoritative_input_sha256: eb2d93b9d4112f0b925b5338942e45cf4c97260f47836c42fb0eba8e6877c3cc
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_core_patch_count: 0
real_model_calls: 0
credential_reads: 0
external_network_calls: 0
```

## 1. Disposition

本次工作是 V3.6 Closeout 后的薄产品化收尾，不是 V3.6 重新开启，也没有创建
V3.6.x/V4、新 Goal、新 Runtime 协议或第二执行后端。实现复用了已接受的：

```text
registered Project Profile
→ persistent Session / managed_session_copy
→ Direct Pi AgentHarness bounded Turn
→ frozen network-none Docker registered command
→ immutable Run / ChangeSet evidence
→ user-reviewed Host Apply All / Discard / Export
```

此前 `v36g2:product` 是冻结的自动两 Turn 验收入口；现在新增的 `v36:product` 是日常入口：
用户输入自由 Coding Task，系统不再注入冻结任务、不自动运行正式 Verifier、不自动 Apply。
所有自由任务继续准确标记为 `unverified`、`formal_outcome:null`、
`adaptation_eligible:false`，不进入 V1/V2/V3 promotion claim。

## 2. Completed product path

```text
Host local Project Profile
→ browser selects registered Project + bounded_edit only
→ free-text Coding Task
→ real DeepSeek V4 Flash only after explicit submit
→ persistent Direct Pi Session
→ registered command in frozen network-none Docker
→ settled managed Workspace
→ Changes / Diff
→ explicit Apply All / Discard / Export
→ safe result projection
→ after Apply: old Session blocked
→ Start New Session from Updated Source
```

完成项：

- 新增单一、文档化的 `npm.cmd run v36:product` 日常启动命令；
- Host-only JSON Profile 固定 Source、scope、registered commands、State 和 Provider policy；
- Credential 仍由既有 opaque resolver 延迟读取，浏览器不能提供或查看；
- UI 默认进入 Open Control，列出可重新打开的 V3.6 Sessions，并只启用 Profile 支持的 mode；
- 提交期间显示 `Running Agent task`，结束显示 `Settled` 或 `Failed`；
- Skills 文案明确为 configured / declared metadata，不声称 Pi Runtime 自动发现；
- Apply / Discard 投影明确显示 Source state、receipt digest、逐文件 journal、recovery material；
- stale/conflict 显示为 `conflict_stale_source` 且 `retry_safe:false`；
- partial apply 显示 applied/not-applied 明细，不声称事务回滚或安全重试；
- Apply 成功后提供 Host-minted “Start New Session from Updated Source”，新 Session 重新复制并固定新的 Source identity。

## 3. Authority and safety boundaries preserved

- Browser schema 没有新增 Host path、command argv、Docker image/mount/network、Credential、State 或 budget 字段。
- Agent 仍只拥有 managed Workspace 权限；registered Source mutation 仍只发生于 Host handoff。
- Docker backend、network none、resource/timeout/cleanup 与 registered-command semantics 未改动。
- Apply 仍执行既有 lineage、scope、preimage、stale、link/hardlink、blob tamper 检查。
- 没有新增 retry、fallback、replacement、Host command fallback、rollback 或 per-hunk apply。
- 没有修改 Pi Core、Verifier authority、Harness State lifecycle 或 accepted V3/V3.5/V3.6 claims。

## 4. Verification evidence

### Strict TypeScript

```text
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit
exit: 0
```

### JavaScript syntax

```text
node --check src/webui/static/app.js
exit: 0
```

### Focused product and handoff regression

```text
node --test --test-concurrency=1 tests/v36-product-polish.test.ts tests/v36g2-bounded-session-api.test.ts
tests: 3
pass: 3
fail: 0
```

### Complete V3.6 deterministic regression

```text
V36_DOCKER_EXECUTABLE=<host-only Docker executable>
node --test --test-concurrency=1 tests/v36*.test.ts
tests: 25
pass: 25
fail: 0
duration_ms: 42388.6224
```

该套件包含真实 Docker 的确定性 registered-command、timeout/kill/cleanup、ChangeSet、
handoff、Session persistence 和安全投影测试，但模型与 Credential 调用为 0。

### Browser product smoke

本地日常入口使用一次临时、被忽略的 Host Profile 启动，浏览器只读检查确认：

- 默认打开 `Open control`；
- Header 准确显示“仅提交有界任务时调用真实模型”；
- `inspect_only` 被禁用，`bounded_edit` 为唯一可选 mode；
- free-text Task、活动状态、V3.6 Session 列表和安全说明可见；
- 浏览器冒烟没有提交任务，Credential reads / model calls 均为 0；
- 服务停止后端口无 listener；Docker `v36-*` container leftovers 为 0。

## 5. Files and entry points

- `workbench/src/v36/daily-product-v36.ts`：Host Profile 加载及日常应用装配。
- `workbench/scripts/start-v36-product.ts`：单一 loopback 产品启动命令。
- `workbench/config/v36-product.example.json`：可复制的非密钥 Profile 示例。
- `workbench/src/webui/application-v36g2.ts`：安全 handoff result 与 new-Session action。
- `workbench/src/v36/authority-v36.ts`：Apply 后重新从 registered Source 创建 Session。
- `workbench/src/webui/static/app.js`：日常交互、Session 列表、结果/receipt 与活动状态。
- `workbench/tests/v36-product-polish.test.ts`：零调用产品入口回归。

## 6. Remaining limits and user acceptance boundary

- 本轮没有重新执行真实模型验收；最终体验由用户使用 2–3 个自选任务完成。
- 日常任务没有正式 Verifier / Outcome，因此“Agent 已回答”不等于项目级 PASS。
- 每个 bounded Turn 仍要求至少运行一个已登记命令；不支持任意 shell 或任意项目零配置运行。
- 多文件 Apply 仍不是事务；partial apply 的 recovery material 可检查，但没有自动 rollback。
- Skills/Adaptations 是 Host Profile 的配置/声明可见性，不是完整的 Pi Runtime discovery 或 Skill manager。
- 当前只支持固定 DeepSeek V4 Flash 与唯一 Docker backend；这是冻结范围，不是通用平台。

建议用户体验完成后只记录产品体验 finding；普通 UI/配置问题可作维护修复，触及 Runtime、
Session、Verifier、Source authority、State authority 或 backend 语义时才需要重新进入主决策。
