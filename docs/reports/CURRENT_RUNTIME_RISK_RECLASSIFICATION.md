# Current Runtime Risk Reclassification

```yaml
analysis_date: 2026-07-29
active_goal: null
G004_contract_authorized: false
G004_execution_authorized: false
architecture_blockers_found: 0
classification_vocabulary:
  - architecture_blocker
  - current_goal_candidate
  - future_reliability_case
  - mature_pattern_unverified
  - known_issue
  - provenance_debt
  - low_priority
  - out_of_scope
```

## 1. 校准原则

```text
未验证 ≠ 已失败
已失败 ≠ 架构阻塞
成熟系统会处理 ≠ V0 现在必须处理
参考 Pattern ≠ 当前实现 Spec
风险存在 ≠ 自动创建 Goal
```

**Fact.** G003 已接受的证据基线没有变化：Direct `AgentHarness` 确定性机制通过、Pi core patch 为 0、真实模型与 Phase 3 未开始、正式 Workbench 未创建。

**Fact.** 本次只重分类，没有运行任何新实验。所有“是否观察到失败”都沿用 G003 报告和固定 Pi 源码/测试。

## 2. 风险总表

| 风险 | classification | 当前事实 | 观察到失败 | 成熟参考模式 | 改变 Pi Go / No-Go | 立即验证 | 延后触发条件 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Settled Session 跨进程重建 | `mature_pattern_unverified` | JSONL Session 有 public create/open/fork 与 leaf reconstruction；G003 只在同进程、同 Harness/Session继续 Recovery | 否 | durable records + host reconstruction；settled resume 与 in-flight recovery 分离 | 当前不改变 | 否 | V0 明确要求跨进程 resume；public API 不确定性改变架构；出现 session loss reproduction |
| Crash-after-side-effect Durability | `future_reliability_case` | Tool Call ID、Session message、进程内 mutation queue 存在；没有 durable Tool Start/Commit/Result ledger | 否 | idempotency key、retry-safe 分类、side-effect journal、workspace reconciliation | 当前不改变 | 否 | 真实任务出现重复/不明副作用；设计自动 replay；跨进程 crash recovery 成为需求 |
| Registry Raw Response | `provenance_debt` | 已保存 artifact 来源、版本、integrity、sha/file list；未保存 registry 原始 body | 否；是证据留存缺口 | immutable receipt、raw response retention、field re-derivation | 不改变 | 否 | provenance tooling 获授权；供应链事故；复现失败需要原始 registry evidence |
| Strict TypeScript Consumer | `known_issue` | G003 `skipLibCheck:false` 在第三方 Anthropic/Google declaration dependency 处失败；focused consumer 在 `skipLibCheck:true` 通过 | 是，边界明确 | consumer compatibility matrix、dependency closure、owner attribution | 不改变 Direct runtime Go；可能影响未来发布/CI | 否 | 正式 package consumer/CI 必须 strict；诊断进入 Pi 自有 declaration；依赖升级时复现 |
| Windows Cold Import | `known_issue` | 一次 15s fully-cold import timeout；60s canonical retry 通过，随后约 0.52s | 是，一次；未证明可重复 | cold/warm 分开计时、明确 cache reset、重复采样、启动 SLO | 当前不改变 | 否 | CLI/startup SLO 冻结；同类 timeout 可重复；CI flaky 影响使用 |
| Long-running Tool Cancellation | `mature_pattern_unverified` | `AbortSignal`、`AgentHarness.abort()`、bash timeout、`NodeExecutionEnv.exec/cleanup` 和进程清理测试存在；G003 profile 未动态跑长工具取消 | 否（当前 profile） | cancellation request、executor acknowledgement、process-tree stop、settlement barrier、workspace inspection | 当前不改变 | 否 | Phase 3 允许长命令；timeout 后仍有副作用；正式 runtime 依赖强取消保证 |
| Context Compaction | `mature_pattern_unverified` | Pi 有 explicit compaction、retained tail、file-op details 和 tests；Direct Harness auto decision 未实现；G003 没有 context pressure | 否 | projection、budget、artifact externalization、critical constraint preservation、summary verification | 当前不改变 | 否 | 真实任务逼近窗口；Verifier constraint 被遗忘；V0 宣称支持长任务 |
| Completion Verification | `current_goal_candidate` | G003 已证明 settled 后外部 Verifier、Baseline stop、Candidate 一次 Recovery 的确定性机制；没有真实模型效果证据 | 机制 fixture 中构造了失败；真实 coding performance 未观察 | model stop ≠ task success；environment verifier；structured feedback；bounded recovery | 是未来 Pi/Policy 价值判断核心，但不是当前架构阻塞 | 当前未授权；下一阶段优先候选 | 用户授权 Phase 3/真实模型 bounded experiment 与 Policy review |
| Pi Upstream Evolution | `known_issue` | 当前结论绑定 commit `027a...`；上游文档仍有 lifecycle/durability planned work | 否；版本漂移是已知事实 | pin、source map、compatibility gate、intentional upgrade review | 固定 commit 下不改变；升级时需重新判断 | 否 | 决定升级 Pi；安全/兼容问题迫使升级；public API 变化 |
| Recovery Budget | `mature_pattern_unverified` | G003 仅证明“一次 Recovery”可执行且有界；最佳次数、成本、停止阈值未冻结 | 否；真实模型未知 | attempt budget、cost/time budget、terminal reason、failure-class-specific policy | 不改变当前 Direct mechanism Go；会影响最终 Policy | 否 | 真实模型数据可用；出现循环/成本失控；用户准备冻结 Policy semantics |

## 3. 逐项说明

### 3.1 Settled Session 跨进程重建

```yaml
classification: mature_pattern_unverified
observed_failure: false
route_blocked: false
pi_incapability_proven: false
priority: conditional
```

**Fact.** `.upstream/pi/packages/agent/src/harness/session/jsonl-repo.ts:93-101` 的 `JsonlSessionRepo.open()` 和 `jsonl-storage.ts:212` 的 `JsonlSessionStorage.open()` 提供重开 primitive；`repo.test.ts:47-89` 与 `storage.test.ts:324` 验证 reopen/leaf。Pi 的 `durable-harness.md` 同时明确 host 需重建 model、tools、resources、hooks/auth 等非序列化依赖。

**Inference.** 当前未知的是完整应用重建合同，而不是 Session 文件是否能读。V0 若只要求单次进程内 Run 和审计产物，跨进程 Resume 可以安全后移。

### 3.2 Crash-after-side-effect Durability

```yaml
classification: future_reliability_case
observed_failure: false
relevance_to_project: high
immediate_architecture_blocker: false
```

**Fact.** write/edit 的 path mutation queue 位于进程内 `WeakMap`（`.upstream/pi/packages/agent/src/harness/tools/file-mutation-queue.ts`）；写入完成后才返回 Tool Result（`write.ts:26-35`; `edit.ts:91-124`）。因此源码上可以描述一个风险窗口，但没有实际 crash reproduction。

**Recommendation.** 未来若触发，只验证一个最小 Case：稳定 Tool Call ID、写入 marker、模拟结果未记录、重启后比较 Session 与 workspace 并做保守 reconciliation。不要追求通用 Exactly-once。

### 3.3 Registry Raw Response

```yaml
classification: provenance_debt
observed_runtime_failure: false
portfolio_priority: low
```

**Fact.** 它不影响 Agent Loop、Verifier、Recovery 或 Workspace outcome。G003 已用 artifact fields/integrity 验证来源；缺少的是可重新派生字段的原始回执。

**Recommendation.** 保留 known issue，不进入 G004 或 Phase 3 前置 Gate。

### 3.4 Strict TypeScript Consumer

```yaml
classification: known_issue
observed_failure: true
failure_owner: third_party_declaration_dependency_boundary
runtime_mechanism_blocked: false
```

**Fact.** G003 report `:239-243,330-332` 记录 `skipLibCheck:false` 的具体失败归属及 `true` 时通过。它是 package consumption/CI 质量问题，不是当前 Direct runtime protocol failure。

**Recommendation.** 当项目真正发布 TypeScript package 或冻结 strict CI 时再处理；不能把修改 emitted-package 构建边界当当前默认动作。

### 3.5 Windows Cold Import

```yaml
classification: known_issue
observed_failure: one_timeout
repeatability_proven: false
```

**Inference.** 一次 cold timeout 足以诚实记录，但不足以证明结构性 startup problem。除非成为可重复体验/CI 故障，否则不值得消耗一个 Goal。

### 3.6 Long-running Tool Cancellation

```yaml
classification: mature_pattern_unverified
observed_failure: false
source_support_present: true
profile_specific_dynamic_evidence: absent
```

**Fact.** `AgentHarness.abort()` 发出 AbortSignal；bash 把 signal 交给 `executeShellWithCapture()`；`NodeExecutionEnv.exec()` 和 `cleanup()` 管理 active shell processes（`.upstream/pi/packages/agent/src/harness/agent-harness.ts:1025-1046`; `bash.ts:87-102`; `env/nodejs.ts:364-454,671-677`）。上游 tests 覆盖 aborted command 和 cleanup active shell（`nodejs-env.test.ts:341,427`）。

**Inference.** 当前仍未证明 G003 选择的 emitted artifact/Windows workspace/driver 组合在长工具下的 barrier 语义，但这个未知只有在正式路径允许长工具时才升级。

### 3.7 Context Compaction

```yaml
classification: mature_pattern_unverified
observed_failure: false
pi_mechanism_present: explicit_compaction
automatic_policy_present: false
```

**Fact.** Pi compaction tests 覆盖 retained tail、previous summary、split turn、file operation details、summary failure和 Tool Result serialization truncation（`.upstream/pi/packages/agent/test/harness/compaction.test.ts:343-740`）。

**Inference.** 当前缺口不是“Pi 没有 compaction”，而是何时触发、哪些 critical constraints 必须保留、怎样验证 summary。它需要真实长任务证据。

### 3.8 Completion Verification

```yaml
classification: current_goal_candidate
mechanism_feasibility: accepted
real_model_effect: unverified
policy_frozen: false
```

**Fact.** G003 report `:194-199,260-279` 已证明最小机制闭环和顺序。它最直接支撑项目 JD signal：环境级验证、Trace、Baseline/Candidate、受限 Recovery。

**Recommendation.** 在用户未来授权时，优先用真实模型和极小 TypeScript 任务验证效果；不要先由宽泛 G004 把所有 runtime unknown 清零。

### 3.9 Pi Upstream Evolution

```yaml
classification: known_issue
current_mitigation: pinned_commit
current_failure: false
```

**Fact.** 所有 Source Map、G003 artifact 和本报告都绑定同一 commit。上游演化只有在决定 upgrade 时才成为当前决策。

**Recommendation.** 采用 intentional upgrade gate；不做持续追逐上游的兼容性项目。

### 3.10 Recovery Budget

```yaml
classification: mature_pattern_unverified
current_fixture_budget: one_recovery_cycle
final_semantics: user_review_required
```

**Inference.** 一次 recovery 是证明机制最小性的 fixture 参数，不是推荐的生产阈值。未来 Budget 应与 failure class、token/cost/time、Verifier certainty 和 terminal reason 一起评审。

## 4. G004 重新评估

### 4.1 当前判断

```yaml
G004_broad_robustness_goal:
  recommendation: cancel_as_a_pre_phase3_umbrella
  keep_contract_absent: true
  execute_now: false
  reserve_identifier: optional

replacement_decision:
  recommendation: do_not_replace_with_another_goal_yet
  next_high_value_candidate: bounded_real_model_completion_verification
  authorization_required: true
```

**Recommendation.** 取消“Phase 3 前必须跑一个宽泛 G004 Robustness Goal”的默认规划；更准确的做法是让 G004 保持 dormant/未定义。若未来某一触发条件满足 `risk_to_goal_gate`，再为单一未知创建窄 Goal，是否复用 G004 编号届时决定。

### 4.2 为什么不保留宽 G004

- settled reconstruction、long cancellation、context compaction 都是有现成 Pi primitive/测试、但当前 profile 未验证的成熟模式；没有观察到 route failure；
- strict TS 和 cold import 是已知 packaging/startup issue，不阻塞核心 Loop；
- registry raw response 是 provenance debt；
- crash-after-side-effect 相关性高，但应由具体 failure/recovery requirement 触发；
- 同时打包这些问题没有一个共同的 architecture decision 或单一 stop condition。

### 4.3 何时才值得恢复 G004

只有某一风险同时满足以下条件时才建议创建 Goal：

```yaml
risk_to_goal_gate:
  - blocks_a_current_architecture_decision
  - threatens_the_core_project_loop
  - has_concrete_or_highly_specific_evidence
  - cannot_be_safely_deferred
  - has_bounded_scope_and_stop_condition
```

当前十项风险没有一项满足全部条件。

## 5. 与 CURRENT_STATE 的控制关系

**Fact.** `CURRENT_STATE.md:227-255` 仍记录“draft/review G004 contract”为上一轮 next action；本次用户指令明确禁止创建 G004 contract，并要求先做只读 Reference Analysis。

**Recommendation.** 将本次用户指令视为当前执行授权的更新、更窄控制边界。本分析没有修改 `CURRENT_STATE.md`，因为用户只授权报告与决策材料；用户审查 Decision Summary 后再决定是否更新项目控制文件。
