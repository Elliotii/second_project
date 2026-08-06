# V2 Failure-aware Bounded Multi-path Recovery Precontract Research

```yaml
status: completed_main_review_accepted_for_charter
date: 2026-08-06
accepted_by_user: true
accepted_at: 2026-08-06
planning_baseline: f81d0db7d5335456e195f11e1b5a8e37077a0a67
research_owner: main_session_after_specialist_zero_delta_usage_limit_stop
active_goal: null
v2_activated: false
real_model_calls: 0
credential_reads: 0
external_downloads: 0
pi_core_changes: 0
```

## 1. 研究问题与边界

本研究只回答 V2 Contract 之前的架构问题：

> 在一个真实 Coding Task 的初始 Attempt 被外部 Verifier 判定为有效失败后，Workbench 能否从同一个不可变失败边界创建少量、隔离、可比较的恢复路径，独立验证各自结果，并按预先冻结的规则选择更好的候选？

本研究不实现 V2，不激活 Goal，不调用模型，也不把未来愿景写成当前能力。

证据优先级仍为：固定 Pi 源码和测试、当前 Workbench 源码和已接受运行证据、当前控制文档、成熟 Harness Pattern、推断。

## 2. 当前事实基线

### 2.1 项目状态

**Fact.** V0-A/B/C 已关闭并接受；V1-A、V1-C 已关闭并接受，V1-B 作为历史上已耗尽授权序列的无结论路径保留。`CURRENT_STATE.md` 当前为 `phase: v1_completed`、`active_goal: null`，V2 只是候选。

**Fact.** V1 的最终 24-cell 比较结果为：Baseline `7/8`、Skill-only `8/8`、Skill + same-Session Runtime Control `7/8`；C 的唯一一次 Recovery 被触发但未成功。证据见 `docs/reports/V1_CLOSEOUT.md`、`docs/reports/V1_C_R2_MAIN_ACCEPTANCE_AND_V1_POLICY_DECISION.md`。

**Fact.** 当前 Workbench 的 V1 运行时使用公开 `@earendil-works/pi-agent-core`：`workbench/src/pi/pi-run-handle-v1.ts:createPiRunHandleV1()` 创建 `InMemorySessionStorage`、`Session` 和 Direct `AgentHarness`，初始 Attempt 与 C 子 Attempt 共用同一个 Session 和 Workspace。

### 2.2 V1 失败证据能否直接成为 V2 Recovery Seed

**Fact.** 被接受的失败 Run `v1c-full-pilot-run-03-parse-duration-r1-c` 保留了：

- 两个正确关联的 Attempt；
- 同一 `session_id`；
- 初始与最终 Verifier 失败；
- `recovery/failure-packet.json`；
- 最终 Workspace；
- 完整预算、调用和终态证据。

**Fact.** 该 Run 没有在初始 Verifier 失败后、子 Attempt 开始前保存独立的不可变 Workspace 快照，也没有保存可重新打开的 Direct Harness Session 文件。当前 V1 Session 使用 `InMemorySessionStorage`；Run 工件中只有 Session ID，没有对应 Session 状态文件。

**Conclusion.** 该 Run 是 V2 的有效失败模式和任务候选输入，但不是已经证明可公平重放的 V2 Recovery Seed。V2 不得从最终 Workspace 反推初始失败边界，也不得把同一个可变目录依次交给两条候选路径。

## 3. V2 Version Question

建议冻结为：

> 给定一个在初始 Attempt settled 且外部 Verifier 有效失败后生成的不可变 Recovery Seed，Workbench 能否最多创建两条隔离候选路径——保留失败前 Session 历史的路径 A，以及不保留旧对话历史的新 Session 路径 B——让二者从字节相同的失败 Workspace 快照、相同任务约束和相同 Failure Packet 开始，独立执行和验证，并由硬 Gate 优先的确定性选择器产出可解释的 Selection Decision；当初始 Verifier 已通过时，不创建任何恢复候选？

这个问题服务于项目的 Portfolio North Star：**失败感知、有界多路径、自适应恢复**。它不要求 V2 同时实现 Experience Repository、自动 Skill 生成或长期 Router。

## 4. 第一组路径应如何公平比较

### 4.1 建议路径

| 路径 | Session | Workspace 起点 | Model-visible 恢复输入 | 目的 |
|---|---|---|---|---|
| A `continue_failed_session` | 从失败边界复制/派生的已有 Session 历史 | Recovery Seed 的隔离副本 | 原任务 + 同一 Failure Packet + 同一恢复 Skill/Policy | 测试保留旧推理/工具历史是否有益 |
| B `fresh_session_from_failure_seed` | 全新 Session，无旧对话历史 | 同一 Recovery Seed 的另一隔离副本 | 原任务 + 同一 Failure Packet + 同一恢复 Skill/Policy | 测试清除旧对话历史是否有益 |

### 4.2 “clean” 的准确含义

**Recommendation.** 第一版 B 的 `clean Workspace` 应解释为“失败快照的干净、隔离副本”，不是回到原始未修改任务 Workspace。

如果 A 从失败后的文件状态继续，而 B 从任务最初状态重跑，则同时改变了 Session 历史和 Workspace 状态，无法说明差异来自哪一项。以后可以把“从原始 Workspace 完全重启”加入独立策略，但不能把它与第一组 Session 对比混为一谈。

### 4.3 Skill/Policy 公平性

**Recommendation.** V1 已将 Skill-only 提升为冻结协议内的默认输入，因此 V2 第一组 A/B 都应使用同一已冻结 Skill 和同一恢复指令。旧路线中“只有 B 获得 test-first/minimal-patch Skill”的描述应被修正；否则比较的是一个复合处理，而不是 Session 历史差异。

如果未来确实要比较“same Session + Failure Packet”与“fresh Session + 新 Skill”，必须把它命名为复合策略，并限制结论为“整体策略胜负”，不能声称因果来自 clean Session。

## 5. Recovery Seed 最小合同

Recovery Seed 必须在：

```text
initial AgentHarness settled
→ external Verifier completed with valid failure
→ no child/candidate has started
```

这个边界一次性生成，之后只读。

建议最小字段：

```yaml
RecoverySeed:
  recovery_seed_id: string
  parent_run_id: string
  parent_attempt_id: string
  task_id: string
  task_instruction_ref: artifact_ref
  task_instruction_sha256: sha256
  failure_packet_ref: artifact_ref
  failure_packet_sha256: sha256
  failed_workspace_snapshot_ref: artifact_ref
  failed_workspace_snapshot_digest: sha256
  parent_session_ref: artifact_ref
  parent_session_digest: sha256
  verifier_result_ref: artifact_ref
  verifier_result_sha256: sha256
  tool_profile_digest: sha256
  prompt_digest: sha256
  skill_digest: sha256
  pi_commit: sha1
  workbench_digest: sha256
  created_before_candidate_attempts: true
```

`parent_session_ref` 可以是 Direct core JSONL Session 或经严格定义的项目自有 Session snapshot；只有 ID 不够。若 A 在同一进程直接继续，也仍需保留可审计快照，证明 A/B 从哪个历史边界分叉。

## 6. Failure Packet 的最小投影

### 6.1 Model-visible

- 原始任务指令或其完整受控投影；
- public external Verifier 的失败检查名；
- 有界、去敏的失败摘要和命令输出；
- 已修改文件清单与有界 diff 摘要；
- writable/protected/forbidden 约束；
- parent Attempt 标识；
- 剩余恢复预算和明确停止条件。

### 6.2 Host-only

- 原始 Verifier 输出和完整 Artifact 引用；
- 所有 SHA-256；
- Manifest/Run/Attempt/Session/Workspace 关联；
- Secret scan 与 Evidence validity；
- 选择器所用原始成本、耗时、Tool/Provider 计数。

**Invariant.** 摘要必须保留回到原始工件的路径；模型不需要看到全部原始证据，选择器和审计必须能复核它们。

## 7. Pi Direct、SDK、Extension、Worktree 和 Package 的能力边界

固定 Pi：commit `027a5847901b5dde30270abaa1041046cd2b4b55`，`@earendil-works/pi-agent-core` 与 `@earendil-works/pi-coding-agent` package version 均为 `0.82.1`，MIT。

### 7.1 Direct `pi-agent-core`

**Fact.** `packages/agent/src/index.ts` 公开导出 `AgentHarness`、`Session`、`JsonlSessionStorage`、`JsonlSessionRepo`、`InMemorySessionRepo` 和 Session types；package root 和 `./node` 都是正式 exports。

**Fact.** `packages/agent/src/harness/session/jsonl-repo.ts:JsonlSessionRepo` 提供 `create/open/list/delete/fork`；`fork()` 可以复制完整 active entries 或在指定 user entry 前/处截断，并记录 `parentSessionPath`。`packages/agent/test/harness/repo.test.ts` 覆盖持久 Session 的 create/open/list/fork 和 parent lineage。

**Inference.** V2 可以继续 Direct `AgentHarness` 路线，并在项目 Adapter 中将 V1 的 in-memory storage 替换或补充为固定 Session repo。没有证据要求为了 V2 切换到 `pi-coding-agent` SDK。

**Unconfirmed.** 固定 emitted package、Windows、当前 Tool Profile 与 Workbench Driver 的“进程 A 保存 settled 失败 Session → 进程 B 打开/fork → 继续”组合尚未动态验证。它适合作为 V2 deterministic Stage 的一个窄 Gate，不是现在的架构阻塞结论。

### 7.2 `pi-coding-agent` SDK / AgentSessionRuntime

**Fact.** `packages/coding-agent/src/index.ts` 公开导出 `createAgentSession`、`AgentSessionRuntime`、`SessionManager`、Extension types、PackageManager 和 Tool factories；package root是正式 export。

**Fact.** `core/sdk.ts:createAgentSession()` 组合 cwd、Model runtime、Tool registry、ResourceLoader、SettingsManager 和 SessionManager。`core/agent-session-runtime.ts:AgentSessionRuntime` 的 `newSession()`、`switchSession()` 和 `fork()` 在 runtime 层处理 abort/shutdown/rebuild；`core/session-manager.ts:SessionManager` 用 JSONL 保存消息、model/thinking、compaction、custom entries 等。

**Boundary.** Pi Session 仍不拥有 Workbench 的 Run、Attempt、Recovery Seed、Workspace snapshot、Verifier、预算、Outcome 和 Selection Decision。

**Disposition.** `behavioral_reference_only` for first V2。只有 Direct core 的公开 Session repo 无法满足当前 V2 Gate，或未来需要把已证明有效的恢复策略嵌入真实 Pi Coding CLI 时，才评估 `thin_adapter`，不预先改主路线。

### 7.3 Extension

**Fact.** `core/extensions/types.ts` 和 `runner.ts` 提供 Session lifecycle、`tool_call` block、`tool_result` 修改、Agent settled、命令、工具与 Provider 注册。`agent-session.ts:_installAgentToolHooks()` 将 Extension hook 接到 Agent before/after Tool Call；测试证明 block 会形成 error Tool Result，修改后的 Tool Result 会进入 Session 并被模型看到。

**Fact.** Extension 在 Pi 进程内拥有较强权限；Hook 不是 OS Sandbox 或通用 Permission 平台。Tool Result hook 修改的是 Pi/模型可见结果，原始执行结果若对审计重要，Workbench 仍需在自己的边界先行保留。

**Disposition.** `thin_extension_adapter_deferred`。它以后适合把已验证的 Workbench Policy 暴露给真实交互 Pi，或做 Session/Tool lifecycle 兼容测试；它不应成为 V2 候选调度器、证据权威或权限根。

### 7.4 Worktree

**Fact.** 当前固定 `pi-coding-agent` 的 `core/footer-data-provider.ts` 能识别普通仓库和 worktree 的 `.git` file/`commondir`，并报告分支；测试覆盖这类发现。

**Fact.** 没有发现它创建、锁定、删除、清理或选择 Git worktree，也不维护 Recovery lineage。

**Disposition.** `behavioral_reference_only`，不能作为 V2 Workspace lifecycle provider。V2 第一版优先复用当前受控 temp-copy/path-policy；只有复制成本、Git metadata 或大型仓库成为具体失败时，才将 Git worktree 作为独立 Provider 研究。

### 7.5 可安装 Package / 成熟扩展

**Fact.** `core/package-manager.ts:DefaultPackageManager` 支持 npm、git 和 local source，解析 `package.json` 的 `pi.extensions/skills/prompts/themes`，支持 user/project scope、过滤、安装、更新和固定版本/ref。项目 scope 受 project trust Gate 约束；安装仍会执行 npm/git 和依赖安装命令。

**Fact.** Package 可安装、可发现不等于某个具体第三方扩展已经完成来源、Commit/Version、License、安全和行为审计。

**Disposition.** 当前 V2 为 `reject_as_unscoped_dependency`。将来出现明确缺口时，只研究一个具体包和一个具体模块；核验来源、版本、License、安装脚本、权限与测试后，再选择 direct dependency、module port、thin adapter 或拒绝。

## 8. Workbench 与 Pi 的职责划分

| 能力 | Pi Direct 可复用 | Workbench 必须拥有 |
|---|---|---|
| Agent loop / Tool protocol | `AgentHarness` | 不重写 Loop |
| Session entries / open / fork | Direct core Session repo | Session 与 Run/Attempt/Seed 的绑定、快照策略 |
| Tool execution | 固定 Tool Profile + Pi Tool lifecycle | writable/protected Gate、原始证据、Verifier 隔离 |
| Workspace | Pi Tool 以 cwd 操作 | snapshot、clone、candidate isolation、digest、cleanup |
| Failure feedback | 可用 Prompt/Skill/Extension 注入 | Failure Packet 权威生成和投影 |
| Verification | 无项目特定结论 | external Verifier、validity、Outcome |
| Budget | Pi 可提供事件/usage | Attempt/Path/Recovery group hard budget |
| Selection | 无 | Hard Gate、score、tie/none、Decision evidence |
| Real Pi integration | SDK/Extension 可承载 | 采用时的兼容层与归因，不反客为主 |

## 9. Candidate、Rollout 与 Selection 最小数据

建议只增加决策真正需要的数据对象：

```yaml
CandidatePath:
  candidate_path_id: string
  recovery_group_id: string
  recovery_seed_id: string
  strategy_id: continue_failed_session | fresh_session_from_failure_seed
  parent_attempt_id: string
  session_ref: artifact_ref
  workspace_ref: artifact_ref
  initial_workspace_digest: sha256

Rollout:
  attempt_id: string
  candidate_path_id: string
  settled: boolean
  final_workspace_ref: artifact_ref
  verifier_result_ref: artifact_ref
  evidence_valid: boolean
  budget_usage: object

SelectionDecision:
  recovery_group_id: string
  eligible_candidate_ids: string[]
  rejected_candidate_ids: string[]
  selected_candidate_id: string | null
  hard_gate_results: object
  secondary_ordering: object
  terminal_reason: selected | no_passing_candidate | all_invalid | tie_resolved
```

不需要 V2 通用数据库、Dashboard、队列、任意数量策略或自动 Git commit。选择完成只需保存被选 Workspace/diff 工件和 Decision；是否应用到用户仓库是后续显式发布边界。

## 10. Selection Policy

### 10.1 Hard Gates（先全部满足）

1. Manifest/Seed/Artifact identity 完整且 digest 匹配；
2. 候选从同一失败 Workspace digest 开始，无串扰；
3. Agent settled，预算没有越界；
4. external Verifier `passed`；
5. protected paths、secret scan 和安全边界通过；
6. Outcome/Journal/lineage 可闭合。

任何失败或 invalid 候选都不能因低成本或小 diff 获胜；处理导致的 invalid 必须保留在 Recovery group 中，不得从分母或报告消失。

### 10.2 Secondary Ordering

只有多个候选都通过 Hard Gates 时才使用：

1. 更小的允许路径 diff；
2. 更低真实成本/Token；
3. 更少 Tool Call；
4. 更短 active execution time；
5. 最终以 Manifest 冻结的 `strategy_id` 顺序稳定破同分。

若无候选通过，结果是明确的 `no_passing_candidate`，不是强行选一个“相对较好”的失败结果。

## 11. 最小确定性证据

V2 的 zero-call Stage 至少覆盖：

1. 初始通过：不生成 Failure Packet、Recovery Seed 或 Candidate；
2. 初始有效失败：在任何 Candidate 前冻结 Seed；
3. 从同一 Seed 生成两个不同目录，初始 digest 相同；
4. A 能看到父 Session 历史，B 看不到；二者其他模型输入满足冻结的公平性合同；
5. A pass/B fail 与 A fail/B pass 时，选择器都选唯一通过者；
6. 两者 pass 时按次级规则稳定选择；
7. 两者 fail 时选择 `null`；
8. invalid、预算停止、protected path 变化时不能获选；
9. 候选互不污染，未选 Workspace 不被应用；
10. JSONL Session 的 create/open/fork 在固定 emitted package、Windows、当前 Tool Profile 上通过公开入口动态验证；若该项不是首个实现方案，则不得为验证而强行引入。

## 12. 最小真实证据

V2 real stage 不需要复制 V1 的 24-cell Pilot。建议只要求：

- 一个冻结的 positive Case：初始有效失败，两个候选实际运行，至少一个通过，选择正确；
- 一个冻结的 negative Case：初始通过，不发生分支；
- 若 positive Case 两个候选都失败，也应诚实收口为有效的 `no_passing_candidate` 运行事实；是否再运行另一个 Case 应由 Contract 的任务/成本边界预先决定，而不是临场无限扩张；
- 真实 Session/Workspace/Failure Packet/Verifier/Selection 证据全部可 Inspect；
- 不宣称统计显著、普适自适应或 Experience 自进化。

V2 的 Version Question 需要“真实分支与选择机制工作”的证据，不要求以固定 24 次比较证明某个路径普遍更优。

## 13. Goal 分解建议

为了吸取 V1 过程过重的教训，建议只拆两个 Goal：

### V2-A — Deterministic Recovery Seed, Isolation and Selection

- 零真实调用；
- 实现 Recovery Seed、两条固定 Candidate、隔离 Workspace、Session 差异、Verifier、Selection 和 Inspect；
- 复用现有 V1 Budget/Evidence/Verifier 基础；
- 一个 Implementation Session；
- Main 轻量验收；
- 因涉及 Session lineage、候选隔离和选择控制流，冻结 Candidate 后做一次 focused independent audit；
- 返修回原 Implementation Session，仅复审命中项。

### V2-B — Frozen Bounded Real Recovery Acceptance

- 只在 V2-A 接受后起草；
- fresh execution-only Session，无 source/test/Manifest 编辑权；
- 一个 positive Case 加一个 negative Case；
- 真实预算由 Contract 冻结；
- Main 根据已冻结 Version Question 接受成功、`no_passing_candidate` 或触发 Pause；
- 不自动开启新的大样本 Pilot。

**Recommendation.** 不设默认 V2-C。只有 V2-A/B 暴露一个有具体证据且无法在现有 Goal 内有界修正的架构未知，才重新讨论。

## 14. Complexity 与 Session 治理

- 主 Session 冻结 Version Question、Contract、策略语义、选择规则和接受结论；
- Implementation Session 只实现 Contract；
- focused audit 只审 Session lineage、Seed 不可变性、Workspace 隔离、选择器、预算/终态与证据边界；
- real execution Session 只运行冻结产品，不修改源码；
- Specialist 发现未被主 Session 接受前不自动变成 Goal/Gate；
- 不用硬数量上限代替目标完成，但任何新增步骤必须说明它修复哪个当前风险、若不做会破坏哪条 DoD；
- Main 每个阶段先检查“是否已经能回答 Version Question”，避免因局部瑕疵不断扩建旁支。

## 15. 外部资料是否需要现在获取

**Recommendation.** V2 Charter 前不需要新的联网下载或大范围工程研究。

理由：固定 Pi 已提供当前设计所需的公开 Session primitive；当前主要缺口是 Workbench 自己的 Recovery Seed、隔离和选择合同。SWE-ReX、Inspect AI 或 OpenHands 只有在以下具体触发条件出现时选择其中一个做有界研究：

- temp-copy 无法满足真实仓库隔离/清理；
- 进程取消、子进程回收或环境快照成为可复现阻塞；
- 当前选择/rollout 数据模型无法表达一个实际失败。

Youtu-Agent/Experience 资料继续留到 V3，不阻塞 V2。

## 16. Pause Conditions 输入

V2 Contract 至少应在以下情况暂停：

- 无法在任何 Candidate 前冻结失败 Workspace；
- A/B 无法证明来自相同 Seed；
- 需要修改 Pi Core 或使用 private import；
- 需要让 Agent 修改 Verifier、测试、Manifest 或选择规则；
- Session 差异与 Skill/Prompt/Workspace 差异无法分离；
- 候选间发生 Workspace 或 Session 串扰；
- 原始 Tool/Verifier 证据会被 Extension 修改后覆盖；
- Selection 在无 passing Candidate 时仍必须选出结果；
- 真实执行需要提前建设通用调度器、平台或 Experience Repository；
- 新参考研究开始阻塞可由本地证据决定的 V2 Charter。

## 17. Claims Boundary

完成本研究后允许说：

- Direct Pi route 存在公开 Session persistence/fork primitives；
- V2 可以在不改变 Direct `AgentHarness` 主路线的前提下设计；
- V1 的失败 Run 是具体设计输入，但不是现成公平 Recovery Seed；
- Pi SDK/Extension/Package 有未来兼容与复用价值，但不替代 Workbench 控制面。

不允许说：

- V2 已实现或已激活；
- settled 跨进程 Resume 已在 Workbench 动态通过；
- clean Session 必然优于 same Session；
- 任一成熟 Pi Extension 已经适合直接采用；
- Worktree、Permission、Durability 或 Experience 平台已经完成。

## 18. Main Review Recommendation

```yaml
recommended_disposition: ACCEPT_FOR_V2_CHARTER_DRAFTING
architecture_blocker_found: false
direct_agentharness_route_changed: false
sdk_required_for_v2: false
extension_required_for_v2: false
external_research_required_before_charter: false
recommended_goal_count: 2
```

本研究建议进入 V2 Version Charter Draft，但继续保持 `active_goal: null`。Charter 应绑定以下修正：

1. 两条路径从同一失败 Workspace Seed 开始；
2. A/B 使用相同 Skill/恢复 Policy，主要变量是 Session 历史；
3. V1 失败 Run 不直接作为权威可重放 Seed；
4. 优先利用 Direct core 公开 JSONL Session repo，不为 V2 强制切 SDK；
5. SDK/Extension 作为条件性兼容层而非控制权威；
6. V2 只拆 deterministic substrate 与 bounded real acceptance 两个 Goal；
7. V2 不提前实现 V3 Experience/Curator/Router。
