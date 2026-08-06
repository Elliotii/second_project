# V2 Version Charter — Failure-aware Bounded Multi-path Recovery

```yaml
status: accepted
date: 2026-08-06
accepted_by_user: true
accepted_at: 2026-08-06
formalized_at: 2026-08-06
last_control_update: 2026-08-07
amended_at: 2026-08-07
amendment_authorized_by_user: v2_b_thin_real_composition_and_bounded_R2_controlled_seed_route
version: V2
project_identity: Adaptive Coding Agent Harness
planning_governance_baseline: f81d0db7d5335456e195f11e1b5a8e37077a0a67
planning_baseline: bd903c963b68ba2b13ab56c20a7515a63f681021
active_goal: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
V2_A_status: closed_accepted
V2_A_disposition: PASS_V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
V2_A_implementation_baseline: 9ac6740155e763598180dcf80e8b735d967874ad
V2_B_contract_draft_created: true
V2_B_contract: docs/第二项目_Codex交接包_2026-07-30/V2_B_GOAL_CONTRACT.md
V2_B_contract_accepted: true
V2_B_contract_accepted_at: 2026-08-07
V2_B_contract_status: active_amended_by_bounded_R2
V2_B_bounded_R2_amendment: docs/第二项目_Codex交接包_2026-07-30/V2_B_BOUNDED_R2_AMENDMENT.md
V2_B_bounded_R2_amendment_status: accepted_activated
V2_B_activation_authorized: true
V2_B_stage_1_implementation_authorized: true
V2_B_stage_2_execution_authorized: false
V2_B_stage_2_execution_conditionally_preauthorized: true_after_stage_1_acceptance_execution_baseline_and_Gate_H
V2_B_specialist_session_form: new_top_level_codex_sessions_only_no_subagents
real_model_calls_authorized: bounded_R2_A_B_and_one_negative_after_audited_baseline_and_Gate_H
credential_reads_authorized: opaque_R2_execution_only_after_Gate_H
external_network_authorized: R2_execution_only_after_Gate_H
pi_core_patch_authorized: false
external_download_authorized: false
V2_B_control_baseline_commit_authorized: consumed_by_resulting_HEAD_of_this_revision
V2_B_control_baseline_commit: resulting_HEAD_of_this_revision
V2_B_candidate_or_execution_baseline_commit_conditionally_preauthorized: true_after_stage_1_main_acceptance
V2_B_focused_audit_conditionally_preauthorized: one_top_level_session_on_concrete_high_risk_finding
final_V2_A_acceptance_authorized: consumed
V2_B_goal_activation_authorized: true
V2_B_main_goal_mode_authorized: true_through_stage_2_evidence_and_main_disposition_recommendation
accepted_goal_count: 2
portfolio_continuity_after_v2: V3_trace_to_validated_experience
```

> 本文件是用户已接受的 V2 Version Charter。它冻结版本问题、产品边界、数据合同、Goal 切分和验收标准；Charter 接受不等于 Goal 创建或 Activation，也不授权实现、真实调用、网络、凭据或 Git commit。

## 1. Version Mission

V2 要回答：

> 当一个真实 Coding Task 的初始 Attempt 已经 settled，但外部 Verifier 给出有效失败时，Workbench 能否冻结一个不可变失败边界，创建最多两条隔离的恢复路径，分别验证结果，并按照预先冻结的规则选择可接受的更优候选？当初始结果已经通过时，能否保持不分支？

V2 的重点不是“多跑几个 Agent”，而是把以下闭环做成可实际使用、可复核的 Harness 行为：

```text
Initial Attempt
→ External Verifier
→ Immutable Recovery Seed
→ Two bounded isolated Candidate Paths
→ Independent Verification
→ Deterministic Selection or explicit no-selection
```

V2 是求职阶段 Portfolio North Star 的实现版本。V3 的 Experience 提取、Skill/Policy 演化与 Promotion 不进入 V2。

## 2. Current Evidence Baseline

### 2.1 已接受事实

- V0 最小 Coding Agent Workbench 已完成；
- V1 已完成 Baseline、Skill-only、Skill + Runtime Control 的固定 24-cell 描述性比较；
- V1 结果为 A `7/8`、B `8/8`、C `7/8`；
- Skill-only 在冻结协议内被提升为后续默认输入；
- 当前 same-Session Recovery 被触发一次、失败一次，不作为默认 Policy；
- external Verifier 继续是公共可靠性基础设施；
- Direct public emitted `AgentHarness` 仍是运行主路线；
- Pi Core patch 数为 0；
- V2 尚未激活。

### 2.2 Precontract Research 结论

权威输入：`docs/reports/V2_FAILURE_AWARE_BOUNDED_RECOVERY_PRECONTRACT_RESEARCH.md`。

主要结论：

- V1 的失败 Run 是具体失败模式输入，但缺少 pre-child 不可变 Workspace/Session 快照，不能直接充当权威 V2 Recovery Seed；
- 固定 `pi-agent-core` 已公开提供 JSONL Session storage/repo、open 和 fork primitive，V2 无需为了 Session 路径改用 `pi-coding-agent` SDK；
- SDK/Extension 对未来真实 Pi 兼容有价值，但不是 V2 Controller、Verifier、Evidence 或 Selection 的权威；
- Pi 的 git footer 能识别 worktree，但不提供完整 worktree lifecycle；
- 当前不需要下载第三方扩展或全面研究外部 Harness 工程。

## 3. Frozen Version Question

用户已经接受并冻结：

```text
Given one immutable verifier-failed Recovery Seed,
can the Workbench produce exactly two isolated recovery candidates:

A. continue_failed_session
B. fresh_session_from_failure_seed

with identical failed Workspace bytes, task constraints, Skill and Failure Packet,
then independently verify and deterministically select a passing candidate,
while creating no candidate when the initial Verifier already passes?
```

### 3.1 第一版 intended delta

第一版 A/B 的主要差异只应是：

```text
是否保留失败前的 Pi Session 历史
```

它们必须共享：

- 同一个 Recovery Seed；
- 字节相同的失败 Workspace 初始快照；
- 同一个任务与约束；
- 同一个 V1 提升的 Skill；
- 同一个 Failure Packet 与恢复 Policy；
- 同一个 Model/Profile、Tool Profile、Verifier 和每路径预算。

若未来增加“原始 Workspace 完全重启”或“只给 clean Session 一个新 Skill”，必须作为新的复合 Strategy 单独命名，不得混入第一版 Session 差异结论。

## 4. V2 Product Surface

V2 在 V1 Workbench 上只增加：

1. `RecoverySeed`：在初始有效失败、任何恢复前冻结；
2. `RecoveryGroup`：关联同一 Seed 下的有限候选；
3. 两个固定 `RecoveryStrategy`；
4. `CandidatePath` / `Rollout` lineage；
5. 隔离 Workspace candidate provider；
6. 父 Session snapshot、派生/新 Session 的明确引用；
7. hard-gate-first `SelectionDecision`；
8. V2 Inspector 与用户可读的候选比较摘要；
9. 初始通过时的 no-branch fast path。

V2 不增加任意策略注册平台、分布式 Scheduler、数据库、Dashboard、Experience Repository 或自动 Git commit。

## 5. Architecture and Responsibilities

### 5.1 Primary path

```text
V1 promoted Skill-only primary Attempt
→ Direct AgentHarness settled
→ common external Verifier
→ pass: terminal success, no branch
→ valid failure: build immutable Recovery Seed
→ materialize two isolated Candidates
→ run A/B independently
→ verify each
→ select passing candidate or select none
→ preserve evidence and selected Workspace/diff artifact
```

### 5.2 Pi responsibility

- Agent loop and Tool protocol；
- public Session entries/storage/open/fork；
- Provider/Model execution；
- settled lifecycle；
- Tool Call/Tool Result identity。

### 5.3 Workbench responsibility

- Run/Attempt/RecoveryGroup identity；
- immutable Recovery Seed；
- Workspace snapshot/clone/isolation/digest；
- Failure Packet authority and redacted projection；
- Verifier validity and Outcome；
- per-path/overall budget and stop；
- Candidate hard gates, scoring and selection；
- evidence indexing, inspection and publish/apply boundary。

### 5.4 Pi SDK / Extension compatibility boundary

V2 主路线保持 Direct `AgentHarness`。

```yaml
pi_agent_core_session_repo:
  disposition: preferred_public_primitive_subject_to_deterministic_gate

pi_coding_agent_sdk:
  disposition: behavioral_reference_only
  promotion_trigger: direct_public_session_route_cannot_meet_a_concrete_V2_gate

pi_extension:
  disposition: deferred_thin_adapter_candidate
  promotion_trigger: proven_V2_policy_needs_real_interactive_Pi_surface

pi_package_or_third_party_extension:
  disposition: reject_as_unscoped_dependency
  promotion_trigger: one_concrete_gap_plus_source_version_license_behavior_audit
```

## 6. Recovery Strategy Semantics

### 6.1 A — Continue Failed Session

```yaml
strategy_id: continue_failed_session
session: fork_or_reconstruction_with_parent_history
workspace: isolated_clone_of_failed_seed_snapshot
skill: frozen_promoted_V1_skill
failure_packet: common
maximum_attempts: 1
```

A 不是继续修改原始失败目录。它必须在独立 Workspace 中运行，并以可审计方式证明其 Session 来自失败边界。

### 6.2 B — Fresh Session from Failure Seed

```yaml
strategy_id: fresh_session_from_failure_seed
session: new_without_parent_conversation_history
workspace: isolated_clone_of_same_failed_seed_snapshot
skill: same_frozen_promoted_V1_skill
failure_packet: common
maximum_attempts: 1
```

B 的“fresh”只指 Session 历史；Workspace 仍保留初始 Attempt 已经做出的文件修改，以隔离 Session 历史这一主要变量。

### 6.3 Candidate 数量

首个 V2 Recovery Group 正常情况下精确创建 A/B 两条路径，不允许动态增加第三条。若某条在 materialization 前因证据无效而无法创建，Recovery Group 必须明确 terminal invalid/pause，不能静默退化为单路径并仍声称完成多路径比较。

## 7. Data Contracts

### 7.1 Recovery Seed

至少包含：

- parent Run/Attempt；
- task/instruction identity；
- Failure Packet ref/digest；
- failed Workspace snapshot ref/digest；
- parent Session ref/digest；
- VerifierResult ref/digest；
- Prompt/Skill/Tool/Profile/Pi/Workbench identity；
- `created_before_candidate_attempts: true`。

### 7.2 Lineage

```text
Run
└── Initial Attempt
    └── Recovery Seed / Recovery Group
        ├── Candidate A / Attempt A / Session A / Workspace A
        └── Candidate B / Attempt B / Session B / Workspace B
```

每个 Candidate 必须记录：

- `recovery_group_id`；
- `recovery_seed_id`；
- `strategy_id`；
- `parent_attempt_id`；
- `session_ref`；
- `workspace_ref`；
- initial/final Workspace digests；
- VerifierResult、Evidence validity、budget usage；
- selected/rejected reason。

### 7.3 Selection Decision

必须是 write-once、可复核对象，包含所有候选、硬 Gate、次级排序、selected candidate 或 `null`，以及 terminal reason。

## 8. Workspace and Session Rules

### 8.1 Workspace

- 默认复用当前受控 temp-copy/path-policy；
- Seed snapshot 在候选前冻结；
- A/B 初始 tree digest 必须相同；
- Candidate 目录不得互相引用、硬链、junction/reparse escape；
- Verifier、tests、Manifest、control files 继续在 Agent writable boundary 外；
- 未选 Candidate 不得被应用到另一个 Candidate 或用户 Workspace；
- Git worktree 只在出现具体复制/metadata/规模问题时重新评估。

### 8.2 Session

- Direct core JSONL Session repo 是首选候选 primitive；
- deterministic Gate 必须证明固定 emitted package + Windows + 当前 Adapter 的 create/open/fork；
- runtime Model、Tool registry、Prompt、Skill、Policy 和 budget 必须由 Workbench 重建并重新核验，不能假定都保存在 Session；
- settled resume/fork 与 in-flight crash recovery 明确分开；
- V2 不承诺 crash-after-side-effect durability 或 exactly-once Tool。

## 9. Failure Packet and Context Projection

Model-visible Failure Packet 只包含完成恢复需要的：

- 原任务；
- public failed checks；
- 有界、去敏的失败输出；
- changed-file/diff summary；
- writable/protected constraints；
- parent Attempt；
- 剩余预算与停止条件。

完整原始输出、digest、secret scan 和证据引用留在 host-only artifacts。任何摘要都必须保留 retrieval path。Extension 修改后的 Tool Result 不得覆盖 Workbench 已捕获的原始执行/Verifier 证据。

## 10. Verifier, Outcome and Selection

### 10.1 Hard Gates

Candidate 只有同时满足以下条件才可进入次级排序：

1. identity/evidence/digest 完整；
2. 来自正确 Seed 且无串扰；
3. Agent settled；
4. budget/stop 合规；
5. external Verifier passed；
6. protected path、secret scan 和安全边界通过；
7. lineage 与 terminal evidence 闭合。

### 10.2 Secondary Ordering

多个 Candidate 均通过时，按冻结顺序比较：

1. 更小的允许路径 diff；
2. 更低 cost/token；
3. 更少 Tool Call；
4. 更短 active time；
5. Manifest 固定 `strategy_id` 顺序。

无 Candidate 通过时必须选择 `null`，并输出 `no_passing_candidate` 或更具体的 invalid/terminal reason。

### 10.3 Initial-pass negative path

初始 Verifier 通过时：

- 不生成 Failure Packet；
- 不生成 Recovery Seed；
- 不创建 Candidate；
- 不发生额外 Provider/Tool/Verifier 调用；
- 直接以初始 Attempt terminal passed。

## 11. Budget and Stop

V2 使用三层最小预算：

```text
per Candidate Attempt
per Recovery Group
whole accepted real acceptance sequence
```

预算至少覆盖 Provider request、Tool Call、Token、active time、Verifier run、cost 和 Candidate count。预算在执行前冻结；处理导致的 invalid 或 budget stop 保留在 Recovery Group，不得消失。

本 Charter 不冻结真实金额；它由 V2-B Contract 在具体模型、任务和 Stage 1 投影后提出，并由用户另行授权。

## 12. Evidence and Secret Boundaries

- credential 仍为 opaque late-bound input；
- deterministic Goal 的 credential/network/provider/model call 均为 0；
- real Execution Session 无 source/test/fixture/Manifest/control edit 权；
- raw credential、Authorization header、reasoning/signature 不进入 tracked 或 Run evidence；
- Session/Tool/Verifier 原始工件与模型投影分开；
- `reference/`、`.runs/` 和 Pi checkout 继续不提交；
- Candidate/Selection evidence 必须可由只读 Inspector 独立验证。

## 13. V2 Goal Decomposition and Session Ownership

### 13.1 V2-A — Deterministic Recovery Substrate

Owner：新的 dedicated V2-A Implementation Session。

范围：

- Recovery Seed；
- Direct public Session persistence/fork Gate；
- 两条固定 Candidate；
- Workspace isolation；
- Failure Packet projection；
- Candidate lineage/budget/terminalization；
- hard-gate-first selector；
- initial-pass no-branch；
- V2 Inspector；
- Faux positive/negative/tie/all-fail/invalid scenarios；
- V0/V1 必要回归。

流程：

```text
Contract accepted
→ separate Activation + clean Control Baseline
→ one Implementation Session
→ Main light review
→ Candidate Commit
→ one focused independent audit
→ original Implementation Session bounded correction if needed
→ focused re-review
→ accepted V2-A Implementation Baseline
```

focused audit 只覆盖：Seed 不可变性、Session lineage、Workspace isolation、选择器、budget/stop、terminal/evidence/secret boundary 和必要回归。

### 13.2 V2-B — Frozen Bounded Real Recovery Acceptance

V2-B Contract 只能在 V2-A accepted 后起草。

V2-A 接受后的本地源码核验发现，accepted V2-A public surface 仍将 Faux Provider、零真实费用
和 `real_execution_authorized: false` 固定在确定性执行合同内；现有 V1 真实 Provider handle 又在
内部创建 `InMemorySessionStorage`，不能直接接管 V2 已审计的外部 `JsonlSessionRepo` fork/fresh
Session。因此 V2-B 保持一个 Goal，但使用两个严格分权的阶段：

1. **Stage 1 — Thin Real Composition**
   - Owner：新的顶层 zero-call V2-B Implementation Session；
   - 只增加 V2 Controller 到已接受 DeepSeek/opaque credential/budget 机制的薄组合 seam；
   - 必须保留 Direct public `AgentHarness`、JSONL Session、V2-A 行为和回归；
   - Credential、网络、外部 Provider/model call 和真实成本均为 0。
2. **Stage 2 — Frozen Real Acceptance**
   - Owner：另一个新的顶层 fresh no-source-edit V2-B Execution Session；
   - 从 Main 冻结的精确 Execution Baseline 与 immutable Manifest 开始；
   - 先做零访问只读 preflight，通过后才可在单独授权下读取 opaque Credential 并执行真实 Case。

这里的“顶层 Session”指侧边栏可见、可独立交接的 Codex Session/任务。V2-B 不得使用子 Agent
代替 Stage 1、Stage 2 或未来可能授权的 focused audit。Stage 1 与 Stage 2 不得由同一 Session
承担，看到真实 Outcome 的 Session 永远没有源码、Fixture、Manifest、Verifier 或控制状态编辑权。

范围：

- 一个零真实调用的 real-composition Stage；
- 一个冻结 positive Case：初始有效失败并执行 A/B；
- 一个冻结 negative Case：初始通过且不分支；
- 使用 V2-A accepted substrate、immutable Manifest、固定 Provider/Profile/Skill/Tool/Verifier；
- 输出完整 Candidate 与 Selection evidence；
- Stage 2 不修改源码，不临场增加路径或改选择规则。

若 positive Case 两条路径都失败，但机制和证据有效，可以形成真实 `no_passing_candidate` 事实；是否允许 Contract 内预先冻结的第二个 positive Case，由 V2-B Contract 在结果未知前决定。不得因想得到漂亮结果而临场无限续跑。

### 13.3 No default V2-C

不默认创建 V2-C。只有新的具体架构阻塞无法在原 Goal 有界返修且满足风险升级 Gate 时，主 Session 才与用户讨论。

## 14. Complexity Control

V2 明确吸取 V1 教训：

- 只用两个 Goal，不把 Preparation、Audit、Execution 各自升级成独立版本 Goal；
- 独立审计只因 V2-A 涉及高风险 lineage/isolation/selection，且只做一次 focused audit；
- V2-B Stage 1 是 accepted V2-A 与真实 Provider 之间经源码证明缺失的薄组合层，不是新的研究 Goal；
- V2-B 默认不新增独立审计 Session；Stage 2 的 fresh top-level Session 先做只读 preflight，只有具体高风险 finding 才由 Main 建议另一个顶层 focused audit；
- 返修回原 Implementation Session；
- Main 每个阶段先问“当前证据是否已经能回答 Version Question”；
- Specialist 的未绑定建议不会自动变成 Gate；
- 不设会导致目标未完成便机械收口的硬步骤数量上限；
- 任何新增步骤必须指出对应的当前风险、DoD 和停止条件；
- 不为报告完整性建设通用平台。

## 15. Definition of Done

V2 完成至少要求：

1. V2-A deterministic substrate 被主 Session 与用户接受；
2. 一个有效失败边界在 Candidate 前形成不可变 Recovery Seed；
3. A/B 从相同失败 Workspace digest 开始；
4. A 保留父 Session 历史，B 不保留，其他冻结输入满足公平合同；
5. 两条 Candidate 互相隔离并各自 terminal；
6. 选择器只从通过全部 Hard Gates 的 Candidate 中选择；
7. pass/pass、pass/fail、fail/pass、fail/fail、invalid 场景均有确定性证据；
8. 初始通过时不创建任何恢复对象或额外调用；
9. Direct Session create/open/fork 的实际采用路线通过公开 emitted import 和 Windows deterministic Gate；
10. V2-B thin real-composition seam 在零真实访问下通过 fail-closed authority、budget、Session 与 V2-A regression Gates；
11. 一个冻结真实 positive Case 与一个 negative Case 完成，或按 Contract 允许的有效 no-selection 结果诚实收口；
12. 所有 Run/Attempt/Seed/Candidate/Session/Workspace/Verifier/Selection 可由 Inspector 关联；
13. 未修改 Pi Core、未使用 private import、未让 Agent 修改 Verifier/Manifest/接受标准；
14. 输出有界机制结论，不声称统计普适或 V3 自进化；
15. Main Session 与用户完成 V2 版本接受和控制状态收口。

## 16. Pause Conditions

任何 Session 命中以下情况立即停止：

1. Recovery Seed 无法在 Candidate 前冻结；
2. A/B 初始 Workspace digest 不同或发生串扰；
3. Session 差异与 Skill/Prompt/Workspace 差异无法分离；
4. public Direct route 需要 Pi Core patch/private import；
5. 必须切换 SDK/Extension/RPC 才能继续，且没有主 Session 与用户决策；
6. Agent 可修改 Verifier、tests、Manifest、Selection rule 或 control state；
7. 无 passing Candidate 时选择器仍会强行选出结果；
8. Candidate invalid/budget stop 会从 Recovery Group 消失；
9. raw Tool/Verifier evidence 被可变投影覆盖；
10. credential、reasoning、signature 或 secret 进入 evidence；
11. Workspace isolation 需要未经审计的 worktree/第三方 package；
12. V2 开始建设通用 Scheduler、数据库、Experience Repository、Router 或自动 Skill 生成；
13. 一个局部问题被扩张成大规模外部研究而阻塞 Charter/Goal；
14. V2-A Candidate 的高风险控制流未经 focused audit 就准备真实调用；
15. 实际实现无法在两个 Goal 内有界完成，且原因不是普通可修 defect。
16. V2-B real composition 必须复制/重写 V2 Controller、绕过已审计 JSONL Session/Inspector，或弱化 V2-A hard gates 才能继续；
17. 同一个 V2-B Session 同时拥有源码修改权和真实 Outcome 观察权；
18. 顶层 Session 无法从精确 Baseline 和冻结 Manifest 启动，且只能以子 Agent 代替。

## 17. V3 Continuity

V2 只保留未来 V3 所需的最低事实：

- Failure Packet；
- Recovery Strategy identity；
- Candidate/Selection lineage；
- 失败诊断与环境 Outcome；
- selected/rejected path 及成本；
- selected diff/Workspace artifact。

V3 才研究：

```text
Trace
→ Diagnosis
→ Experience Candidate
→ Skill / Policy / Routing Intervention
→ Related Task or Regression
→ Promote / Reject / Rollback
```

V2 不因为保存这些字段就宣称已经实现 Experience learning。

## 18. Non-goals

- 任意数量候选或 beam search；
- Multi-Agent/Subagent platform；
- 自主任务拆解平台；
- Experience Repository、Curator、Router 或 Skill mutation；
- LLM Judge 取代 external Verifier；
- 自动修改 tests/Verifier/acceptance；
- Git worktree lifecycle 平台；
- OS Sandbox、容器、MCP、A2A、Godot 或 Web UI；
- 通用 Durable Runtime、in-flight crash recovery 或 exactly-once Tool；
- 第三方 Pi Extension marketplace 研究；
- 自动将 selected Candidate commit/apply 到用户仓库；
- 大样本 benchmark、统计显著或生产就绪声明。

## 19. Claims Allowed / Not Allowed

### 19.1 Allowed after V2 completion, subject to evidence

- Workbench 能在一个有效失败边界冻结 Recovery Seed；
- 能创建并隔离 same-history 与 fresh-history 两条固定 Candidate；
- 能用相同环境 Verifier 和 hard Gate 独立判断候选；
- 能选择 passing Candidate 或明确选择 none；
- 初始通过时不会无必要分支；
- 报告固定任务中两条路径的真实结果和成本。

### 19.2 Not allowed

- fresh Session 普遍优于 same Session；
- 多路径在统计上显著提高通用 Coding performance；
- 系统已经自主学习、生成 Skill 或进化 Harness；
- 系统具备 production durability、sandbox 或 exactly-once side effects；
- Pi SDK/Extension/Package 已完成产品集成；
- V3/V4 已实现。

## 20. Accepted Charter Decisions

```yaml
accepted_charter_decisions:
  - decision: accept_V2_version_question_and_two_path_semantics
    evidence: V1 same-Session recovery failed once; Precontract Research shows fair first comparison needs the same failed Workspace seed and common Skill/Failure Packet
    options:
      - accept_same_failed_workspace_and_session_history_as_primary_delta
      - compare_compound_strategies_instead
    recommendation: accept_same_failed_workspace_and_session_history_as_primary_delta
    consequence: V2 conclusions remain interpretable and bounded

  - decision: accept_direct_core_session_repo_as_preferred_V2_primitive
    evidence: pinned public pi-agent-core exports JsonlSessionRepo/open/fork and tests cover lineage; current Workbench already uses Direct AgentHarness
    options:
      - direct_core_public_session_repo_with_deterministic_gate
      - switch_to_pi_coding_agent_SDK
      - keep_in_memory_only
    recommendation: direct_core_public_session_repo_with_deterministic_gate
    consequence: preserves the main route while adding only the Session capability V2 needs

  - decision: accept_temp_copy_as_initial_candidate_workspace_provider
    evidence: current path-policy/temp-copy is accepted; Pi worktree support only observes git state and no concrete scale failure exists
    options:
      - current_controlled_temp_copy
      - new_git_worktree_provider_now
    recommendation: current_controlled_temp_copy
    consequence: avoids premature worktree lifecycle complexity; reopens only on concrete failure

  - decision: accept_two_goal_V2
    evidence: deterministic high-risk substrate and frozen real execution have distinct authority, while further splitting caused V1 process weight
    options:
      - V2_A_deterministic_then_V2_B_real
      - one_large_goal
      - three_or_more_default_goals
    recommendation: V2_A_deterministic_then_V2_B_real
    consequence: preserves audit/real-call separation with minimal governance

  - decision: accept_one_focused_V2_A_audit
    evidence: Seed immutability, Session lineage, Workspace isolation and Selection are high-risk control-flow boundaries
    options:
      - one_focused_independent_audit
      - main_review_only
      - broad_general_reaudit
    recommendation: one_focused_independent_audit
    consequence: protects correctness without repeating V0/V1 audits

  - decision: defer_real_V2_B_budget_and_case_count_to_contract
    evidence: exact cost depends on V2-A implementation and frozen task; Charter only needs one positive and one negative behavior class
    options:
      - freeze_after_V2_A_projection
      - freeze_amount_and_extra_cases_now
    recommendation: freeze_after_V2_A_projection
    consequence: prevents arbitrary cap while keeping execution separately authorized and bounded

  - decision: defer_SDK_Extension_and_third_party_package_integration
    evidence: Direct core covers current V2 primitive; SDK/Extension remain useful future real-Pi compatibility surfaces
    options:
      - defer_until_concrete_gap_or_post_V2_integration
      - integrate_now
    recommendation: defer_until_concrete_gap_or_post_V2_integration
    consequence: records reuse value without changing V2 scope

  - decision: amend_V2_B_with_thin_zero_call_real_composition_stage
    accepted_by_user: 2026-08-07
    evidence: accepted V2_A source hardcodes Faux Provider and zero-real Manifest while V1 real handle owns an incompatible in-memory Session
    options:
      - one_V2_B_goal_with_stage_1_composition_and_fresh_stage_2_execution
      - reopen_closed_V2_A
      - bypass_tracked_source_with_external_wrapper
      - switch_to_SDK_or_Extension
    recommendation: one_V2_B_goal_with_stage_1_composition_and_fresh_stage_2_execution
    consequence: adds the minimum honest integration seam without reopening V2_A or changing the Direct AgentHarness route

  - decision: require_new_top_level_codex_sessions_for_all_V2_B_specialist_work
    accepted_by_user: 2026-08-07
    evidence: user requires visible independent Session ownership and rejects child-Agent execution for V2_B
    options:
      - new_top_level_sessions
      - child_agents
      - main_session_execution
    recommendation: new_top_level_sessions
    consequence: Main retains project control while Stage 1 and Stage 2 have isolated context and authority
```

## 21. Acceptance and Next Sequence

用户已接受本 Charter；该接受只冻结 V2 版本方向，不等于创建 Goal 或授权实现。

建议后续唯一顺序：

```text
用户审查并接受 V2 Version Charter（已完成）
→ Main Session 正式化 Charter，保持 active_goal: null（已完成）
→ 用户单独授权 V2 Planning Baseline Commit（已完成）
→ Main Session 创建并核验 Planning Baseline `bd903c963b68ba2b13ab56c20a7515a63f681021`（已完成）
→ Main Session 起草 V2-A Goal Contract Draft（已完成）
→ 用户接受正式 V2-A Contract（已完成）
→ 用户单独授权 Activation + Control Baseline Commit（已完成）
→ dedicated V2-A Implementation Session 执行 zero-call 实现
→ Main 轻量验收与 Candidate freeze
→ fresh focused independent audit
→ 原 Implementation Session 有界返修（如需）
→ Main/用户接受 V2-A Implementation Baseline（已完成，`9ac6740155e763598180dcf80e8b735d967874ad`）
→ Main 核验 real-composition gap 并获得最小 Charter amendment 授权（已完成）
→ Main 起草 V2-B Contract Draft（已完成）
→ 用户审查并接受 V2-B Contract（已完成，成本 ceiling 同比例翻倍为 USD 0.20/0.60/1.40）
→ 用户单独授权 V2-B Stage 1 Activation + Control Baseline（已完成）
→ 新的顶层 zero-call V2-B Implementation Session（已授权，待 Baseline SHA 确认后创建）
→ Main 轻量验收并按条件预授权冻结 Execution Baseline
→ Gate H 后启用已条件预授权的 Credential、网络、真实调用与预算
→ 另一个新的顶层 fresh no-source-edit V2-B Execution Session
→ Main 回答 Version Question并提交处置建议
→ 用户单独决定是否接受/关闭 V2-B 与 V2
```

当前控制状态：V2-A 已关闭接受。V2-B Stage 1 与 Execution Baseline 已形成；R1 通过 Gate H 后在
Verifier 前不可变暂停，未产生 Recovery Seed、A/B 或 Negative evidence。用户已接受并激活
`V2_B_BOUNDED_R2_AMENDMENT.md`：先完成 zero-call controlled Seed/shared-controller/Inspector/
budget-terminal 修正和一次 focused audit，再从 audited Execution Baseline 由 fresh no-source-edit
Session执行 real A/B 与一个 Negative。R2 真实权限在 Gate H 前不生效。V2-B/V2 最终接受、Pi
修改、SDK/Extension/RPC 路线切换、第三路径和 V3 仍未授权。
