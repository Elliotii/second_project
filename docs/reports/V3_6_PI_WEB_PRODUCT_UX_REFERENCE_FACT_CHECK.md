# V3.6 Pi Web Product UX Reference Fact Check

```yaml
status: completed_fact_check
date: 2026-08-11
scope: final_V3_6_code_and_closeout
fact_baseline_commit: f385a73044161f667a2bc6a6c1173af17f69e227
implementation_change: false
planning_change: false
```

> 本报告是 Post-Closeout Productization Polish 之前的事实快照。后续薄产品化装配改变了当前用户访问路径，但没有重写本报告所记录的 V3.6 Closeout 历史事实；当前访问方式以 `POST_V3_6_PRODUCTIZATION_POLISH_REPORT.md` 和 Workbench README 为准。

## 1. 核对口径

- `implemented`：用户通过正式、文档化的 WebUI 启动方式即可访问。
- `partial`：底层、API 或 UI 组件存在，但展示不完整，或者只在 Goal 2 冻结验收服务器中可用。
- `not implemented`：当前代码中没有对应用户界面或访问路径。

当前日常可启动入口是：

```powershell
cd workbench
npm.cmd run v36g1:demo
```

然后访问 `http://127.0.0.1:43136`，进入 `Open control / 开放控制`。

## 2. 逐项事实核对

| # | Pi Web UX 项目 | 状态 | 当前用户如何访问 |
|---:|---|---|---|
| 1 | Workspace file tree | `implemented` | 创建或打开 V3.6 Session 后进入 `Open control`；页面底部自动加载 `Managed Workspace tree (read-only)`。 |
| 2 | read-only file preview | `implemented` | 在 Workspace tree 中点击文本文件；预览以 `Preview: <path>` 卡片追加显示。二进制、超限、越界和链接路径会被拒绝。 |
| 3 | Workspace ≠ Source labeling | `implemented` | Open Control 顶部显示 `Managed Workspace`；页面说明明确写明 Agent 只修改 managed copy，Source 必须通过 Apply All 写回。Source 主机路径不会暴露。 |
| 4 | Pi Skills visibility | `partial` | Session 详情中有 `Pi native Skills (read-only)` 卡片。当前展示的是 Project Profile 提供的描述性元数据；普通 Demo 使用演示条目，真实 Goal 2 Profile 是空数组，不是 Pi Runtime 自动发现的完整 Skill 清单。 |
| 5 | Harness Adaptations / State binding visibility | `partial` | Open Control 中有 `Harness Adaptations / bindings (read-only)` 卡片及固定 Harness State digest；顶部另有 `Adaptation`、`State history` 页面展示 V3/V3.5 lineage。当前没有把某次 V3.6 Run 与完整匹配理由、实际绑定条目合并为一个统一视图。 |
| 6 | Run Context | `partial` | Open Control 的 Host-minted Session 卡片显示 Project、Workspace、Mode、Session pin、code identity、Harness State、backend 和 provider policy；Interactive evidence 显示 Run ID、Authority、settled、verification 和 command mode。它不在同一页面完整展示 V3.6 prompt、assistant messages、ToolResult 和全部上下文组成。 |
| 7 | Files / Changes / Diff | `partial` | Files、tree 和 preview 在普通 `v36g1:demo` 可用。Changes/Diff UI 已实现，但只在服务器装配 `Goal2WorkbenchExtensionV36` 时出现；普通 Demo 没有启用该扩展。 |
| 8 | Apply All / Discard | `partial` | Goal 2 Changes 卡片中存在 `Apply All / 全部应用`、`Discard / 丢弃` 和 Export 按钮，并调用 `/api/v1/v36/handoff`。普通 `v36g1:demo` 不提供该 Goal 2 handoff route；冻结真实 Journey 中则由验收程序通过本地 API 自动执行 Apply，并非用户现场点击。 |
| 9 | Apply result / receipt | `partial` | Apply/Discard 后页面重新读取 Session，Changes 卡片会显示 `applied`、`discarded` 或 `partial_apply_error` 状态。完整 receipt digest、逐文件 journal、错误码和 recovery references 没有在 WebUI 中展开，只保存在权威 evidence 中。 |
| 10 | post-Apply New Session flow | `partial` | Apply 成功后，Session 投影显示 `Continuation: new_session_required_after_apply`，服务端也拒绝继续旧 Session。当前没有专门的“以当前 Source 新建 Session”按钮或引导流程；用户只能清除旧 Session ID 后重新提交新 Session。 |

## 3. 当前真实访问边界

Goal 2 WebUI 组件已经写入并经过测试，但目前没有独立、长期运行的
`v36g2:demo` 或开放产品启动命令。

冻结真实入口 `v36g2:product` 会：

1. 临时启动带 Goal 2 扩展的 loopback WebUI；
2. 使用随机端口；
3. 由程序自身提交两个冻结 Prompt；
4. 自动调用 Verifier 和 Host Apply；
5. 完成后关闭服务器。

因此，用户目前可以稳定体验的是第 1–6 项的控制平面部分；第 7–10 项的 Goal 2
UI 已存在于代码和测试中，但没有作为普通用户可持续访问的产品入口开放。

## 4. 代码证据

- `workbench/src/webui/static/app.js`：Session、Skills、Adaptations、Runs、Workspace、Changes/Diff 和 handoff 按钮。
- `workbench/src/webui/static/index.html`：Open Control 页面及 Workspace/Source 说明。
- `workbench/src/webui/application-v36g2.ts`：Goal 2 ChangeSet、handoff 和 post-Apply continuation。
- `workbench/src/webui/server-v36g1.ts`：Workspace、file preview、task 与 handoff HTTP 路由。
- `workbench/src/v36/product-entry-v36g2.ts`：冻结真实验收服务器及自动两 Turn/Apply 流程。
- `workbench/tests/v36g1-workspace-projection.test.ts`：Workspace preview、Pi Skill 与 Harness Adaptation 分离测试。
- `workbench/tests/v36g2-bounded-session-api.test.ts`：Goal 2 Changes、Apply 和 New Session requirement 测试。

## 5. 结论

```text
implemented:
  Workspace file tree
  read-only file preview
  Workspace != Source labeling

partial:
  Pi Skills visibility
  Harness Adaptations / State binding visibility
  Run Context
  Files / Changes / Diff
  Apply All / Discard
  Apply result / receipt
  post-Apply New Session flow

not implemented:
  none_of_the_ten_items_are_completely_absent
```

本报告只记录最终 V3.6 的真实实现与用户访问边界，不提出功能、修改方案或下一版本设计。
