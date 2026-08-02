# V1 Skill / Runtime Comparison Precontract Research — Main Session Review

```yaml
status: main_session_review_complete_pending_user_decisions
date: 2026-07-31
reviewed_report: docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH.md
main_disposition: ACCEPT_FOR_V1_SCOPE_DRAFTING_WITH_BINDING_CORRECTIONS
V1_contract_created: false
V1_activation_authorized: false
implementation_authorized: false
real_model_calls_authorized: 0
external_source_download_authorized: false
recommended_goal_count: 2
next_required_gate: bounded_skill_primary_source_research
```

## 1. Main Session decision

**Decision.** 接受专用研究报告作为 V1 Version Scope 和后续 V1-A Contract
的主要输入，处置为：

```text
ACCEPT_FOR_V1_SCOPE_DRAFTING_WITH_BINDING_CORRECTIONS
```

这不是 V1 Contract 接受、Goal Activation、实施或真实调用授权。

报告正确建立了三项关键结论：

1. 固定 Pi 的 public Direct `AgentHarness` Skill 路径足以支持 V1，不需要 Pi
   Core patch、private import、`pi-coding-agent`、SDK/RPC 或 WSL；
2. Measurement Verifier、Completion/Intervention Gate 和 Recovery Action 必须
   分开；A/B/C 都使用同一 Measurement Verifier，只有 C 可以消费失败结果并
   触发一次有界 Recovery；
3. V1 适合拆成两个执行 Goal：零真实调用的 V1-A 实验基座，以及另行授权的
   V1-B 有界真实 Pilot；不默认创建 V1-C。

## 2. Boundary and repository verification

**Fact.** 专用 Session核验并保持：

```yaml
root_HEAD: 62a2c962e896d3f406dec43d260daeaa6904da0c
pi_HEAD: 027a5847901b5dde30270abaa1041046cd2b4b55
active_goal: null
real_model_calls: 0
external_network_calls: 0
dependency_installs: 0
pi_changes: 0
git_commits: 0
```

**Fact.** 专用 Session只新增
`docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH.md`，没有修改
Main Session 已登记的治理同步、`CURRENT_STATE.md`、Workbench、Pi、`.runs/`
或用户参考资料。

## 3. Source findings accepted by Main Session

### 3.1 Public Pi Skill path

**Fact.** `.upstream/pi/packages/agent/src/index.ts` 公开导出：

- `AgentHarness`；
- `loadSkills` / `loadSourcedSkills`；
- `formatSkillInvocation`；
- `formatSkillsForSystemPrompt`；
- `Skill` 与 `AgentHarnessResources` 类型。

`.upstream/pi/packages/agent/package.json` 将根入口映射到 emitted
`dist/index.js` / `dist/index.d.ts`。

**Fact.** `.upstream/pi/packages/agent/src/harness/agent-harness.ts` 中：

- `prompt()` 创建 turn snapshot 后调用 `executeTurn(text)`；
- `skill()` 创建同类 turn snapshot，查找 Skill，并调用
  `executeTurn(formatSkillInvocation(skill, additionalInstructions))`；
- 两者都从一个 User message 进入同一个 `runAgentLoop()`；
- 因此用 `skill()` 替代初始 `prompt()` 不必增加 Skill preload Turn，但 Skill
  wrapper/body 会增加模型可见输入和累计 token/cost。

**Fact.** 上游测试覆盖 loader、metadata/body、system-prompt projection 和
invocation formatting，但没有直接覆盖 `AgentHarness.skill()` 的端到端 provider /
Session 行为。因此 V1-A 必须增加 emitted public package 的确定性动态 Gate。

### 3.2 V0-to-V1 delta

**Fact.** Workbench 已有独立 `strategy_id`、Attempt lineage、Completion Policy、
Recovery Budget、Verifier、Outcome、Journal、Evidence 和 real-execution
dependency seam。

**Fact.** 当前仍有以下 V1 缺口：

- `StrategySpecV0C.skill_refs` 固定为空 tuple，preflight 拒绝非空 Skill；
- `RunRecordV0C.comparison_group_id` 固定为 `null`；
- Pi Adapter 使用固定 base prompt，并始终调用 `harness.prompt()`；
- CLI 只映射三个 V0-C strategy；
- accepted real-provider composition 位于 ignored UAT material，tracked 产品源
  还不能独立复现重复真实 Pilot；
- `network_calls` 不是 accepted real route 的可信使用量口径，V1 应以 Provider
  request/response、usage 和 cost evidence 为准。

这些都是 V1-owned delta，不应回写或改写 V0 历史 Schema/证据。

## 4. Accepted experiment semantics

V1 保留三条产品 Strategy：

```text
A  Baseline
B  Skill-only
C  Skill + Runtime Control
```

统一语义为：

| Strategy | Initial invocation | Measurement Verifier | failed valid initial result |
| --- | --- | --- | --- |
| A | `harness.prompt(task)` | 同一外部 Verifier | stop，无反馈 |
| B | `harness.skill(skill, task)` | 同一外部 Verifier | stop，无反馈 |
| C | 与 B 相同的 Skill artifact/invocation | 同一外部 Verifier | 满足 eligibility 与 reserve 时，一次 child Recovery |

`C-initial` 与 `C-final` 是同一个 C Run 的分析检查点，不是第四个随机实验组。

**Decision.** Runtime treatment 的起点不是“运行了 Verifier”，而是 host 消费
有效的失败 VerifierResult 并作出 recover/stop 决策。Verifier 作为测量基础设施
必须对 A/B/C 相同。

## 5. Binding corrections

以下修正必须进入 V1 Version Scope 与 V1-A Contract；它们覆盖报告中更宽泛或
含糊的建议。

### BC-1 — Pi loader diagnostics must fail closed

**Fact.** Pi `loadSkillFromFile()` 对 name/parent mismatch、非法 name 或过长
description 产生 warning diagnostic，但除缺失 description 外仍可能返回 Skill。

**Binding correction.** V1 host 必须把任何 loader diagnostic 当作该冻结 Skill
artifact 的 preflight failure；还必须要求 exactly one Skill、canonical source
identity、无 symlink/reparse/escape、无重名、固定 digest/bytes。不得把“Pi 已经
校验”误写成“Pi 已经拒绝所有不合法 metadata”。

### BC-2 — Windows Skill path formatting needs a deterministic Gate

**Fact.** `NodeExecutionEnv` 使用 `node:path.resolve/join`，Windows 上产生原生
反斜杠路径；`formatSkillInvocation()` 的 `dirnameEnvPath()` 只按 `/` 查找父目录。

**Inference.** 未规范化的 Windows `Skill.filePath` 可能让 invocation wrapper 的
`References are relative to ...` 退化为 `/`。首个 Skill 禁止 relative resources，
因此这不证明路线阻塞，也不要求 Pi patch；但它会影响模型可见 payload 和可复现
identity。

**Binding correction.** V1-A 必须在 host boundary 使用经过 canonical validation
且适合 Pi formatter 的稳定绝对路径表示，并对 Windows public emitted route 断言
完整 wrapper bytes。不得通过 private import 修复上游函数，也不得引入 relative
Skill resources。

### BC-3 — B/C initial comparison is an implementation diagnostic, not a null result

**Binding correction.** B/C initial provider payload、system prompt、Tools 和
initial budgets 必须 byte/identity equivalent。真实 B/C initial Outcome 因模型
随机性不要求相等，不能把差异自动解释为 fairness failure。

分析计划应预先决定：

- A versus B initial 是最直接的 Skill-only product comparison；
- B versus C initial 只作为 treatment-isolation/随机波动诊断；
- 在 byte-equivalence Gate 通过后，可另外报告 A versus pooled B+C initial 的
  Skill-treatment描述性结果，但不得事后选择更有利口径。

### BC-4 — Experiment membership has one mandatory identity

**Binding correction.** V1 Run 使用一个非空、稳定的 experiment/comparison
identity，并与 immutable Experiment Manifest 双向核验。Manifest 是 planned-cell
和聚合权威；Run 必须自带 membership，不能把 Run field 留成可选从而形成两个
可能冲突的真相源。不得恢复 Pair-specific Schema。

### BC-5 — Tracked real-provider boundary belongs before V1-B freeze

**Binding correction.** 如果 V1-B 执行 Session没有 source-edit authority，则
固定 DeepSeek profile、public Pi handle/provider factory、一次性 authority、外部
credential resolution、usage/cost projection 必须在 V1-A candidate 中已经实现、
确定性测试并接受聚焦审计；不能只把未来接口写进 V1-B Contract。

这仍然不是 general provider registry、`.env` platform、fallback/retry system 或
credential manager。

### BC-6 — Invalid Run attribution cannot hide treatment failures

**Binding correction.** 只有与 treatment 无关的基础设施、证据或执行环境 invalid
Run 才从效果分母排除。由 Strategy/Skill/Runtime 行为导致的 forbidden mutation、
budget overrun、无效 completion 或证据破坏必须计入对应 arm 的 guardrail/failure，
同时保留 raw invalid classification。Failure Taxonomy 和 denominator 必须在真实
执行前冻结，不能看到结果后再分类。

### BC-7 — Contract drafting remains sequential

**Binding correction.** 下一份控制文档应先冻结 V1 Version Scope/Charter；随后只
起草 V1-A Goal Contract。V1-B 可以在 Charter 中冻结边界，但正式执行 Contract
应等 V1-A 实现、审计和接受后再起草，避免根据尚不存在的 Product Surface 写死
执行细节。

### BC-8 — Pilot scale and budget remain user decisions

`4 tasks × 2 repetitions × 3 strategies = 24 initial Runs` 和 whole-pilot
`USD 2` 仅作为合理候选，尚未冻结。它能产生有界描述性证据，不能支持统计显著、
benchmark、跨模型或生产可靠性 claim。

## 6. Additional diagnostic observation

Main Session尝试通过 emitted public root import 直接调用
`formatSkillInvocation()`：

```text
node --input-type=module -e "import { formatSkillInvocation } from
  './.runs/v0-a/pi/packages/agent/dist/index.js'; ..."
```

命令在约 14 秒后以 exit `124` 超时且未输出。该命令没有模型、网络、写入或 Pi
变更。

**Classification: `Unconfirmed / known Windows cold-import sensitivity`.** 这不
推翻 G003 已通过的 public emitted import Gate，也不证明 Skill export 不可用。
V1-A 必须把 cold import 与实际 Skill call 分开记录，使用明确上限，并在超时时
停止，而不是把 import 卡顿归因成 Skill 语义失败。

## 7. Goal decomposition accepted with narrowing

### V1-A — Deterministic Skill and Experiment Substrate

零真实模型/Provider 调用，至少完成：

- public emitted Skill import 与 `AgentHarness.skill()` 一 Turn 路径；
- exact-one project-owned Skill loader 和 Windows path normalization Gate；
- A/B/C treatment-isolation；
- same measurement Verifier / C-only intervention；
- V1-owned strategy/task/source/Skill/experiment contracts；
- immutable Experiment Manifest 与最小只读 aggregator；
- test-only Faux scenarios；
- bounded tracked DeepSeek composition boundary 的零凭据/零网络测试；
- V0 regressions；
- 冻结 candidate 后的 focused independent audit。

### V1-B — Frozen Bounded Real Pilot

在 V1-A accepted Implementation Baseline 上：

- Stage 1 做零调用 task/protocol/source/budget/credential preflight；
- 用户单独授权后，Stage 2 执行冻结的 A/B/C Pilot；
- 执行 Session无源码修改权；
- 所有 planned cells 必须 terminal、invalid 或 paused，禁止静默删除/retry；
- 只作 bounded descriptive Promote/Revise/Reject/Inconclusive 判断。

默认不创建 V1-C。V1-B 因 frozen defect、基础设施主导的 inconclusive repeat 或
新的独立架构决策而暂停时，再由 Main Session和用户决定。

## 8. Required primary-source gate

**Fact.** 已接受的 `REFERENCE_ACQUISITION_PLAN.md` 同时规定：

- SkillOS 或 equivalent primary source 在 V1 Skill Contract/Charter 前研究；
- 只研究 Skill content、selection、execution、evaluation 的区分；
- 达到该区分即可停止，不建设 Skill lifecycle/registry；
- 论文下载、本地化和 `reference/` 写入需要用户单独授权。

**Decision.** 该 Gate 不阻塞 Pi feasibility，但当前阻止直接进入 V1 Version
Charter/Contract 起草。应先完成一个单来源、最多两来源的有界 Primary Source
Mapping；若没有可核验的 canonical “SkillOS”，允许使用能回答相同问题的等价
primary source，并如实记录替换理由。

研究只需回答：

```text
Skill content 是什么
→ 谁选择/调用
→ 如何进入 Agent execution
→ 如何由独立环境 outcome 评估
→ 为什么本项目 V1 只测固定 content，不做自动 selection/lifecycle
```

它不得改变已由 Pi source 证明的 public route，不得实现 Skill，不得下载代码库，
不得扩大为综述或 V3 Skill lifecycle 研究。

## 9. Current decision summary

```yaml
accepted:
  - public_Pi_AgentHarness_skill_route_is_V1_candidate
  - hidden_catalog_plus_explicit_initial_skill_invocation_is_preferred
  - measurement_verifier_is_common_infrastructure
  - runtime_treatment_begins_at_failed_result_consumption
  - three_product_strategies_with_C_initial_and_final_checkpoints
  - two_V1_execution_goals_no_default_V1_C
  - focused_V1_A_candidate_audit_before_real_calls
modified:
  - all_Pi_loader_diagnostics_fail_closed_at_host_boundary
  - normalize_and_test_Windows_skill_path_projection
  - B_C_initial_outcomes_are_not_a_null_equivalence_test
  - experiment_membership_is_non_optional_and_manifest_cross_checked
  - tracked_provider_composition_must_exist_before_V1_B_freeze
  - treatment_caused_invalids_cannot_disappear_from_guardrails
  - V1_B_contract_waits_for_V1_A_acceptance
candidate_pending_user_decision:
  - four_tasks_two_repetitions_three_strategies
  - whole_pilot_cost_cap_USD_2
  - hidden_external_acceptance_plus_visible_public_checks
  - exact_primary_source_localization_action
not_authorized:
  - V1_Charter_or_Contract_creation
  - Goal_activation
  - implementation
  - real_model_calls
  - external_download_or_reference_write
  - Git_commit
```

## 10. Next action requiring user authorization

Before V1 Version Scope drafting, request one exact authorization:

```yaml
action: bounded_V1_Skill_primary_source_research
external_web_research: requested
download_or_save_primary_PDF: requested
allowed_reference_write:
  - reference/papers/v1-skill-primary-source/
allowed_report_write:
  - docs/reports/V1_SKILL_PRIMARY_SOURCE_MAPPING.md
maximum_primary_sources: 2
code_or_repository_clone: false
workbench_or_pi_change: false
real_Workbench_model_calls: 0
git_commit: false
stop_condition:
  distinguish Skill content, selection, invocation/execution, and independent
  evaluation sufficiently to bind V1-A; then stop
```

After that report is reviewed:

```text
Main Session drafts V1 Version Scope/Charter
→ user reviews and freezes V1 decisions
→ Main Session drafts V1-A Goal Contract
→ user separately accepts and activates V1-A
```
