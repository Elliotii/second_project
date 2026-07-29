# CC Harness Reference Analysis Decision Summary

## 1. 一句话结论

**Recommendation.** `cc-harness-knowledge` 没有暴露出 Direct `AgentHarness` 路线在 Phase 3 前必须修补的架构缺口；它让风险分层更准确，因此建议取消宽泛 G004 的前置地位，把下一次授权优先留给极小的真实模型 Completion Verification 验证。

## 2. 参考材料改变了哪些理解

### Session 不再被笼统写成“未验证恢复”

**Fact.** Pi 已有 JSONL Session open/fork、branch/leaf reconstruction 和 context rebuild primitives。

**Inference.** 真正未验证的是 host 如何在新进程重建 Model、Tool Registry、Workspace、Policy、Run/Attempt/Budget，并非 public Session route 已失败。Settled Resume 与 in-flight crash recovery 必须分开。

### Tool Result Budget 不是从零开始

**Fact.** Pi built-in read/bash 已有 2,000 行/50KB projection、offset continuation 或 `fullOutputPath`。

**Inference.** 后续候选应验证真实任务中 retrieval path 和 critical constraints 是否够用，而不是重建通用 Context 平台。

### Side-effect 风险更具体，但没有升级为当前阻塞

**Fact.** Pi 的 write/edit mutation queue 只在当前进程内；源码确实存在“写入完成、Result 尚未持久化”这一风险窗口。

**Inference.** 这是高价值未来 reliability case，但没有实际失败。正确方向是保守 reconciliation/no blind replay，而不是 Exactly-once transaction system。

### Completion、Session、Trace 的责任边界更清楚

```text
Pi AgentHarness
  → 执行并 settle 一个 Agent Cycle

External Driver / Verifier
  → 观察 Workspace 的环境结果

Workbench Policy
  → 根据 Verifier 和 Budget 决定 stop / recover

Manifest / Journal / Session / Outcome
  → 提供可关联证据
```

这与 G003 的实际证据一致，也正是用户已学习的 Stop Policy、Tool/ToolResult 和 Context/Session 分层在第二项目中的应用。

## 3. 风险如何降级

| 风险 | 新分类 | 当前决定 |
| --- | --- | --- |
| Settled cross-process reconstruction | `mature_pattern_unverified` | 条件性后移，不是 G004 默认项 |
| Crash-after-side-effect | `future_reliability_case` | 保留高相关 case，等待具体触发 |
| Registry raw response | `provenance_debt` | 低优先级，不影响 runtime/architecture |
| Strict TypeScript consumer | `known_issue` | 到正式 package/strict CI 时处理 |
| Windows cold import | `known_issue` | 仅一次 timeout，不创建独立 Goal |
| Long Tool cancellation | `mature_pattern_unverified` | 长命令进入正式路径时再验证 |
| Context compaction | `mature_pattern_unverified` | 有真实 context pressure 时再验证 |
| Completion Verification | `current_goal_candidate` | 下一阶段最高价值候选 |
| Pi upstream evolution | `known_issue` | pin 已缓解，升级时重审 |
| Recovery Budget | `mature_pattern_unverified` | 与真实模型数据一起评审，不先冻结 |

**Fact.** 当前没有 `architecture_blocker`。

## 4. 哪些仍可能影响架构

只有触发后才可能影响架构：

- V0 明确要求跨进程 Resume，且 public reconstruction route 不能重建必要依赖；
- 真实 crash/retry 证明 workspace 与 Session 分叉会破坏核心 loop；
- 正式 runtime 需要长工具，但 Windows cancellation 无法形成可靠 settlement barrier；
- 真实长任务必须 compaction，而关键 verifier constraints 无法保留。

目前没有任何一项同时满足“阻塞当前决策、有具体失败、不可安全延后、范围有界”四个条件。

## 5. 值得后续采用的成熟 Pattern

按价值排序：

1. 环境级 Completion Verification + 明确 terminal reason；
2. 有界 Recovery Budget；
3. Tool Result budget + full artifact retrieval path；
4. critical constraints 跨 compaction 保留；
5. cancellation request/ack/process stop/workspace inspection 分层；
6. stable Tool Call ID + retry-safe classification + side-effect reconciliation；
7. settled Session 的 host-side runtime reconstruction。

以下仍明确拒绝进入主线：Multi-Agent/Subagent 平台、MCP 生态、完整 Permission 平台、通用 Durable Runtime、Exactly-once Tool 平台、Claude Code Feature Parity。

## 6. G004 决策建议

```yaml
G004:
  broad_contract: do_not_create
  execution: do_not_start
  recommendation: cancel_as_pre_phase3_umbrella
  identifier: keep_dormant_or_reuse_only_after_a_future_single_risk_trigger
```

**Recommendation.** 不把 G004 缩成“三个小测试”的拼盘；当前更干净的决定是取消宽 G004。未来若某一风险满足升级 Gate，再单独建立有明确架构问题与 stop condition 的 Goal。

## 7. 下一步需要用户决定什么

本批报告完成后，只需要三个决策，不需要立即执行：

1. 是否接受这次风险分类与 G004 取消/dormant 建议；
2. 是否授权同步更新 `CURRENT_STATE.md` 和相关规划文字；
3. 是否授权下一轮只起草（不执行）一个极小 Phase 3 real-model Completion Verification Goal Contract。

在上述审查和授权前，项目保持：无 active goal、无 G004 contract、无真实模型调用、无正式 Workbench。
