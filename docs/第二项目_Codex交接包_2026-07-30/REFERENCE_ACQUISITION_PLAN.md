# 第二项目 Reference Acquisition Plan

```yaml
status: accepted
document_kind: reference_acquisition_plan
date: 2026-07-30
accepted_by_user: 2026-07-30
binding_review: 第二项目_三份草案验收与V0冻结建议_2026-07-30.md
network_access_used: false
external_download_or_clone_performed: false
reference_files_modified: false
external_reuse_authorized_by_this_plan: false
```

## 1. 计划原则

本计划只回答：某份参考资料解决什么问题、何时值得获取、研究到什么程度停止、什么复用方式可能合法且有价值。

证据顺序保持为：

```text
固定 Pi 源码 / 测试 / 实际运行
→ CURRENT_STATE / 已接受 Closeout / ADR
→ 用户接受的 Version Charter / Goal Contract
→ 本地交接、正式路线与 Version Charter
→ 本地参考项目 / 论文 / 外部实现
→ 推断
```

参考资料的作用是减少重复发明、提供成熟 Pattern 和可移植模块候选。它不能：

- 覆盖固定 Pi 的真实行为；
- 自动进入 V0 Scope；
- 因“成熟系统有这个功能”而生成 Goal；
- 在来源、版本或许可证不清时成为直接复制来源；
- 替代本项目自己的环境验证。

本轮没有联网、下载、克隆或修改 `reference/`。

---

## 2. 实际本地资料清单

### 2.1 代码/知识级参考源

| 来源 | 真实路径 | 版本/身份 | 来源 | 许可证 | 工作树/完整性 | 当前允许用途 |
| --- | --- | --- | --- | --- | --- | --- |
| Pi | `.upstream/pi/` | Commit `027a5847901b5dde30270abaa1041046cd2b4b55`；describe `v0.82.1-40-g027a5847`；`pi-agent-core@0.82.1` | `https://github.com/earendil-works/pi.git` | MIT | Git clean；Pi Core patches 0 | 直接依赖、Adapter、按许可证移植；V0 仍以 public emitted API 为主 |
| `cc-harness-knowledge` | `reference/cc-harness-knowledge/` | Git HEAD `3db7929714e29785c09b478462b3a6e2bd456efd`；29 个跟踪语义文件 | 用户整理的 Harness 知识库；仓库未配置 remote | 本地没有 LICENSE；视为用户拥有的笔记集合，底层引用仍需逐来源审查 | 跟踪内容 clean；存在未跟踪 AppleDouble `._*` sidecar | Pattern、术语、最短阅读路径、失败模式和设计比较；不当作 Pi 事实或可直接分发代码包 |
| Claude Code 源码镜像 | `reference/src/` | `unversioned_local_snapshot`；非 Git；精确 Commit/产品版本未知；`MACRO.VERSION` 为构建注入 | 源码内 Anthropic/Claude Code 标识明确，但镜像取得方式未记录 | 本地未发现 LICENSE、COPYING、NOTICE | 约 1,902 个 `.ts/.tsx/.js` 源码文件，另有隐藏传输元数据；无可验证 tree provenance | 只读 Symbol/调用链/Pattern 核验；当前禁止直接复制、移植或声称当前产品行为 |

### 2.2 本地项目证据，不是外部复用源

以下资料已存在，但应归为项目内部证据或规划输入：

- `CURRENT_STATE.md`；
- `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md`；
- `SECOND_PROJECT_RESEARCH_AND_IMPLEMENTATION_CONTEXT第二项目研究与实现上游包.md`；
- `deep-research-report第二项目实施前证据审查决策支持报告.md`；
- `docs/goals/` 下 G001、G002、G003、G005、G006 Contract；
- `docs/reports/` 下 G001–G006 Report/Closeout 及 Harness Reference Analysis；
- `docs/decisions/ADR-0001` 至 `ADR-0003`；
- `spikes/pi-runtime/g003/`、`spikes/pi-runtime/g006/`；
- `docs/第二项目_Codex交接包_2026-07-30/`。

它们可直接服务项目设计，但不能被重复计算为外部独立证据。

### 2.3 未发现的候选

真实文件系统没有发现以下已本地化来源：

- SearchCLI；
- Youtu-Agent；
- Scaffold Self-improvement、Long-horizon Agent、SkillOS、Experience/Meta-evolution 等论文 PDF 或源码；
- OpenHarness；
- Harbor；
- Terminal-Bench。

---

## 3. 三项本地来源的使用边界

### 3.1 Pi

**Fact.** Pi 是当前唯一同时具备明确上游、固定 Commit、MIT License、公共 API、上游测试和本项目动态证据的外部实现。

允许的复用方式：

- 直接依赖公共 emitted package；
- 通过项目 Adapter 组合 `AgentHarness`；
- 在确有必要时按 MIT 直接复用或修改小模块，但必须保留版权/许可证并单独审查；
- 基于公共行为编写项目自己的薄封装和确定性测试。

当前推荐：

- V0 主路径继续使用 public Direct `AgentHarness`；
- 不修改 Pi Core；
- 不把 G003 的 artifact staging 误当 Runtime 产品功能；
- 升级 Commit 时重新跑 public import、strict type、observer、session、tool 和 real-route 最小回归。

### 3.2 `cc-harness-knowledge`

该知识库最适合按以下顺序使用：

1. `docs/README.md` 定位能力；
2. `docs/CC_HARNESS_REFERENCE.md` 查完整机制；
3. `docs/HARNESS_ENGINEERING_PLAYBOOK.md` 提炼可迁移不变量；
4. 专题 `research/source-reports/` 查证据链；
5. `docs/RESEARCH_BACKLOG.md` 检查未证实边界；
6. 必要时再到 `reference/src/` 做当前镜像的 Symbol 级核验。

版本映射：

| 版本 | 优先主题 | 不自动进入的功能 |
| --- | --- | --- |
| V0 | Agent Loop、Tool/ToolResult、Context Projection、Session、Stop、Trace、Permission/Execution 分离 | Teams、MCP、Cron、完整 Memory、完整 Resume |
| V1 | Skill、System Prompt、Planning、Completion/Stop、Trace fairness | Skill marketplace、自动 Skill 生成/推广 |
| V2 | Session/Resume、Worktree、Recovery、Failure Packet、Cancellation、Context budget | 通用 Durable Runtime、Multi-Agent |
| V3 | Memory/Experience、Task identity、Skill lifecycle、回归和 Promotion | 大型 Experience 平台、自治 Curator |

许可证边界：知识库本身没有 LICENSE。项目可以引用用户自己的总结和术语，但若未来复制其中的第三方代码、长段原文或实现细节，仍要回到其原始来源核验版权和许可证。

### 3.3 Claude Code 源码镜像

**Fact.** 镜像含 `AgentTool`、Session Memory、Worktree、Tool Result Storage、Permission、Hook、Skill、Task 等真实实现线索，可用于解决知识笔记不够细的问题。

**Fact.** 镜像无法证明：

- 这是哪个 Claude Code Release；
- 对应哪个 Commit；
- 文件是否完整；
- 当前公开产品是否仍同样实现；
- 是否允许直接复制或再分发。

当前允许：

- 只读查找 Entry → Core Symbol → Lifecycle → Persistence → Test-like evidence；
- 比较成熟 Pattern 与 Pi 的边界；
- 提炼不受具体表达保护的行为不变量；
- 为一个具体 Goal 形成源码阅读报告。

当前禁止：

- 直接复制代码；
- 跨语言逐行翻译；
- 声称“Claude Code 当前版本就是这样”；
- 把镜像的目录和类名作为本项目架构模板；
- 在未补齐 provenance/license 前作为移植源。

建议后续由用户补充：镜像获取方式、原始 URL/包、获取日期、产品版本或 build、文件树 digest、适用许可证/服务条款说明。补齐前不影响只读学习，但阻止直接复用。

---

## 4. SearchCLI 获取判断

```yaml
candidate: SearchCLI
current_local_status: absent
canonical_repository: unverified
license: unverified
serves_versions: [V0, V1]
immediate_acquisition_recommendation: defer_until_specific_goal
blocks_v0_charter: false
```

### 4.1 它可能服务的问题

- 在任何副作用前形成 Execution Plan；
- Dry Run 显示将创建的 Workspace、工具、模型、预算和 Verifier；
- 提前估算成本或至少暴露预算上限；
- Checkpoint 与继续/取消边界；
- Candidate 产物与 Apply/Publish 分离；
- 人工发布边界。

### 4.2 为什么不建议现在立即获取

1. 当前本地资料没有给出 canonical repository URL，`SearchCLI` 名称不具唯一性；
2. License 尚未核验，无法预先决定直接移植；
3. V0 Charter 可以先冻结“validate before side effect”“plan/apply separation”这些行为，不依赖具体实现；
4. 现在全面研究 CLI 容易把 V0 扩成通用 workflow/checkpoint 系统；
5. 当前最关键的未知不是 CLI 形态，而是用户是否接受 V0 Tool/Completion/Workspace 合同。

### 4.3 何时获取

若用户接受 V0 Charter，并且 V0-A Goal 明确要求 `--dry-run`、Checkpoint 或 Candidate/Apply 之一，则在起草该 Goal Contract 前授权一个专用只读研究 Session。

### 4.4 有界研究任务

只回答：

1. canonical source、Commit/Version、License；
2. Plan 数据结构在哪里生成；
3. Dry Run 如何保证无副作用；
4. Checkpoint 存哪些状态、如何继续；
5. Candidate 与 Apply 的信任边界；
6. 哪个模块可独立复用，哪个只能行为借鉴；
7. 哪些测试证明以上行为。

停止条件：能形成一张 source/license/symbol/test/reuse matrix 后立即停止；不研究 UI、Provider、无关工具生态，不克隆更多相邻仓库。

### 4.5 可能的复用方式

只有在许可证允许且模块边界独立时，才按优先级考虑：

1. direct dependency；
2. small direct module reuse；
3. behavior-preserving port；
4. architecture adaptation；
5. 仅抽象 Pattern。

当前没有任何 SearchCLI 代码移植授权。

---

## 5. Youtu-Agent 获取判断

```yaml
candidate: Youtu-Agent
current_local_status: absent
canonical_repository: unverified
license: unverified
serves_versions: [V2, V3]
recommended_timing: before_V2_contract_or_V3_experience_design
blocks_v0_or_v1: false
```

可能服务：

- Environment / Rollout / Judge 的对象边界；
- Experiment identity 与候选改进关联；
- Experience 从 Trace 到 Candidate Intervention 的受控流转；
- Promotion/Reject 证据；
- 多次 rollout 的预算与比较。

不建议 V0/V1 获取的原因：

- 当前没有 multi-path Runtime 或 Experience Repository 需求；
- 提前研究容易把 V0 变成 Eval/训练平台；
- V2 需要的最小 lineage 已可由 `Run/Attempt/strategy_id/parent_attempt_id` 保留；
- 版本和许可证仍需在实际获取时核验。

有界研究停止条件：只要能回答 Environment、Rollout、Judge、Experience、Candidate、Promotion 六类对象如何关联，以及哪些模块可独立移植，就停止；不研究全量训练、分布式调度或平台 UI。

---

## 6. 核心论文保存计划

不建议现在批量保存论文。论文应在对应版本设计前，以“primary source + 固定元数据 + 阅读问题”形式本地化。

| 主题 | 服务版本 | 建议时机 | 保存内容 | 研究问题 | 停止条件 |
| --- | --- | --- | --- | --- | --- |
| SkillOS / Skill lifecycle | V1/V3 | V1 Skill Contract 前 | 原始 PDF、DOI/arXiv ID、版本日期、引用条目、1 页项目映射 | Skill 如何定义、检索、应用、评估和淘汰 | 能区分 Skill content、selection、execution、evaluation 即停止 |
| Long-horizon Agent | V2 | V2 Version Charter 前 | 原始论文及补充材料 | 长任务失败、checkpoint、resume、budget 与环境反馈如何分层 | 能提炼 3–5 个可验证不变量即停止 |
| Scaffold Self-improvement | V2/V3 | V2 路线选择或 V3 前 | 原始论文、代码链接、License | 改进对象是 Prompt、Skill、Policy 还是 Runtime；如何防止自评污染 | 能明确外部 Judge 与 Promotion Gate 即停止 |
| Experience / Meta-evolution | V3 | V3 Contract 前 | 原始论文、代码/数据许可、版本 | Trace 如何变成 Experience；如何跨任务验证与回滚 | 能形成候选 Experience Schema 和拒绝条件即停止 |

保存规范建议：

```text
reference/papers/<topic>/
  source.pdf
  SOURCE.yaml        # title/authors/url/doi/version/date/license-or-access-note/hash
  PROJECT_MAPPING.md # 本项目问题、可迁移不变量、不可推断、停止结论
```

本轮没有创建该目录，也没有确定任何论文的 canonical identity。任何下载需要用户单独授权。

---

## 7. OpenHarness、Harbor 与 Terminal-Bench 触发条件

### 7.1 OpenHarness

只在以下任一条件出现时获取：

- V0/V1 需要证明同一 Strategy/Verifier 合同可跨 Harness；
- Pi Adapter 边界暴露不可移植的对象模型；
- 需要比较公开 Harness 的 tool/session/event schema；
- 求职材料需要有证据的 adapter portability 对照。

不因“名字相关”而全面研究。停止条件是完成 Adapter/Run/Tool/Verifier mapping；不研究全平台。

### 7.2 Harbor / Terminal-Bench

只在以下任一条件出现时获取：

- V1 Pilot 的内部 6–10 个任务不足以支持任务隔离或复现；
- 需要标准化 task packaging、containerized environment 或 benchmark adapter；
- 现有 verifier/fixture 无法表达目标任务；
- 用户决定将对外 Benchmark 兼容性作为作品集证据。

它们当前不进入 V0，因为 Container、通用 Sandbox 和 Benchmark scale 都不是当前问题。

---

## 8. 来源—版本—模块映射

| 来源 | V0 | V1 | V2 | V3 | V4/V5 |
| --- | --- | --- | --- | --- | --- |
| Pi | Runtime、Tools、Session、Context、Events | 同一 Runtime 下 Skill/Policy 路线 | Session/Workspace route capability | 运行/证据底座 | Adapter 持续维护 |
| cc knowledge | Loop/Tool/Session/Stop 不变量 | Skill/Prompt/Fairness | Resume/Worktree/Recovery | Memory/Task/Promotion 思想 | 只在具体问题使用 |
| Claude mirror | 必要时核查 Tool result、Permission、Session symbol | Skill/System Prompt 细节 | Resume/Worktree/Agent path 细节 | Memory/experience-like mechanism 对照 | 不做 feature parity |
| SearchCLI | Plan/Dry Run/Checkpoint 候选 | Candidate/Apply 和人工边界 | 非核心 | 非核心 | 非核心 |
| Youtu-Agent | 不进入 | 不阻塞 | Environment/Rollout/Judge 候选 | Experience/Promotion 候选 | Routing 参考 |
| SkillOS 等论文 | 不阻塞 | Skill 定义与评估 | Recovery/long horizon | Experience/evolution | Routing/retirement 理论输入 |
| OpenHarness | 条件性 adapter 比较 | 条件性 portability | 条件性 | 非核心 | 非核心 |
| Harbor/Terminal-Bench | 不进入 | Pilot scale 触发 | 可作为任务来源 | Regression scale 触发 | 非核心 |

### 8.1 Pi SDK / Extension / Package 延后兼容检查点

**Fact.** 固定 Pi `027a5847901b5dde30270abaa1041046cd2b4b55` 的
`packages/coding-agent/src/core/sdk.ts#createAgentSession`、
`agent-session-runtime.ts#AgentSessionRuntime`、
`extensions/types.ts#ExtensionAPI`，以及
`test/agent-session-runtime-events.test.ts`、
`test/suite/agent-session-model-extension.test.ts` 和
`test/extensions-runner.test.ts` 已证明存在公开的应用级 Session、Tool Hook、
Tool Result middleware 与 Extension 生命周期入口。
`src/core/footer-data-provider.ts#FooterDataProvider` 与
`test/footer-data-provider.test.ts` 只证明 Pi 能够在 Git Worktree cwd 中识别 Git
状态，没有证明 Pi Core 已提供完整 Worktree 创建、清理、lineage 和验证合同。

**Inference.** SDK/Extension 的主要价值是复用 Pi 的真实应用形态，而不是替换 Direct
`AgentHarness` 的受控实验路线：SDK 候选服务程序化 Session/runtime 组合，Extension
候选服务 TUI/RPC 审批与 Policy 接入，Pi Package 候选服务已验证 Skill/Policy/Adapter
的分发。Worktree、正式 Outcome、Experiment identity 和不可篡改证据仍属于 Workbench。

```yaml
pi_sdk_extension_compatibility:
  status: deferred_non_blocking
  current_V1_effect: none
  triggers:
    - post_V1_policy_is_selected_for_real_Pi_use
    - pre_V2_clean_session_or_clean_workspace_contract
  package_or_module_adoption_gate:
    - canonical_source_and_exact_version_or_commit_recorded
    - license_notice_and_reuse_form_recorded
    - dependencies_install_scripts_and_network_behavior_reviewed
    - pinned_or_selected_Pi_version_compatibility_proven
    - Windows_behavior_proven_when_the_project_route_requires_Windows
    - public_API_only_unless_a_new_architecture_review_authorizes_otherwise
    - deterministic_failure_and_fail_closed_tests_defined
    - no_access_to_protected_verifier_acceptance_or_credential_material
    - raw_execution_evidence_remains_distinct_from_model_visible_tool_result
    - disable_and_rollback_path_defined
  allowed_dispositions:
    - direct_dependency
    - thin_extension_adapter
    - module_port_with_attribution
    - behavioral_reference_only
    - reject
```

**Recommendation.** Package gallery、版本数量或下载量只能用于发现候选，不能单独证明
“成熟”。Permission Extension 不能被表述为 OS Sandbox；Pi Session 不能替代
Run/Attempt/Workspace/Outcome；Extension 修改后的 Tool Result 不能覆盖原始执行证据。

---

## 9. 复用、移植与归因规则

### 9.1 允许的形式

```yaml
allowed_when_provenance_and_license_pass:
  direct_dependency: true
  direct_module_reuse: true
  module_porting: true
  cross_language_rewrite: true
  behavioral_reimplementation: true
  architecture_adaptation: true
```

### 9.2 每次采用必须记录

- canonical source URL；
- Commit、Tag、Package Version 或论文版本；
- License 和必要的 notice；
- 采用文件/Symbol/行为；
- 本项目修改内容；
- 为什么不直接使用原模块或为什么选择直接依赖；
- 确定性行为测试；
- 安全、Secret、网络和副作用边界；
- README/作品集中的准确归因。

### 9.3 禁止的错误归因

- 把 Pi 的 Agent Loop 声称为本项目原创；
- 把移植模块包装成从零实现；
- 把 Claude Code 镜像的模式写成 Pi 已有能力；
- 把论文概念写成项目已经实现；
- 把用户笔记中的重复表述当成多份独立证据；
- 因为行为重写就省略来源和许可证审查。

---

## 10. 建议的有界研究任务队列

| 优先级 | 触发时机 | 专用研究 Session | 输出 | 硬停止 |
| --- | --- | --- | --- | --- |
| 1 | V0-A 要求 advanced dry-run/checkpoint | SearchCLI source/license/module audit | 1 份 source map + reuse decision | 不实现、不研究全 CLI |
| 2 | V1 Charter 前 | Skill primary-paper + cc/Pi/mirror comparison | Skill contract inputs | 不实现 Skill registry |
| 3 | V2 Charter 前 | Same-session vs clean-session recovery pattern audit | route invariants + smallest experiment | 不建 Router/Experience platform |
| 3A | V1 选出可进入真实 Pi 的 Policy 后，或 V2 Contract 前 | Pi SDK / Extension / Worktree bounded compatibility audit | adopt/adapter/port/reference/reject matrix | 不改变 V1、不安装未审计 Package、不实现通用插件或权限平台 |
| 4 | V2 需要外部框架 | Youtu Environment/Rollout/Judge audit | bounded comparison matrix | 不研究训练平台 |
| 5 | V3 前 | Experience/meta-evolution primary-source audit | experience/promotion inputs | 不实现自治 Curator |
| 6 | Pilot 任务规模触发 | Harbor/Terminal-Bench packaging audit | adapter decision | 不迁移 benchmark ecosystem |

主 Session保留最终决定权；专用研究 Session 只回答一个合同问题并返回报告。

---

## 11. `06_参考资料清单与本地化计划.yaml` 的接受修订

以下语义修订已在同一批文档收口中写入 `06_参考资料清单与本地化计划.yaml`。本段保留为为什么这样修改的审计摘要：

```diff
 local_sources:
   pi:
     path: .upstream/pi
+    commit: 027a5847901b5dde30270abaa1041046cd2b4b55
+    describe: v0.82.1-40-g027a5847
+    package: "@earendil-works/pi-agent-core@0.82.1"
+    origin: https://github.com/earendil-works/pi.git
+    license: MIT
+    working_tree: clean

   cc_harness_knowledge:
     path: reference/cc-harness-knowledge
+    commit: 3db7929714e29785c09b478462b3a6e2bd456efd
+    tracked_semantic_files: 29
+    remote: none_configured
+    repository_license: absent
+    usage_boundary: user_notes_and_design_reference_not_external_code_package
+    working_tree_note: tracked_clean_with_untracked_appledouble_sidecars

   claude_code_source_mirror:
     path: reference/src
-    status: available
+    status: available_for_read_only_pattern_research
+    vcs: none
+    exact_version: unknown
+    source_provenance: unverified
+    license: unverified
+    direct_copy_or_port: prohibited_until_provenance_and_license_review
+    version_marker_note: MACRO.VERSION_is_build_time_injected

 external_candidates:
   searchcli:
-    acquisition_timing: immediate_candidate
+    acquisition_timing: defer_until_specific_V0_goal_requires_plan_dry_run_checkpoint_or_candidate_apply
+    canonical_repository: unverified
+    license: unverified
+    bounded_research_required: true
+    blocks_v0_charter: false

   youtu_agent:
+    acquisition_timing: before_V2_contract_or_V3_experience_design
+    blocks_v0_or_v1: false
+    canonical_repository: unverified
+    license: unverified

   core_papers:
-    acquisition_timing: now
+    acquisition_timing: by_version_gate
+    V1: SkillOS_or_equivalent_primary_source
+    V2: long_horizon_and_scaffold_self_improvement_primary_sources
+    V3: experience_and_meta_evolution_primary_sources
+    bulk_download: false

   openharness:
+    trigger: adapter_portability_or_cross_harness_schema_question

   harbor_terminal_bench:
+    trigger: V1_pilot_task_packaging_or_scale_requirement

+reuse_gate:
+  - canonical_source_verified
+  - commit_or_version_pinned
+  - license_and_notice_verified
+  - exact_module_or_behavior_named
+  - deterministic_validation_defined
+  - attribution_recorded
+  - no_large_platform_expansion
```

---

## 12. 需要单独授权的动作

以下动作均未由本计划授权：

- 克隆或下载 SearchCLI；
- 克隆或下载 Youtu-Agent；
- 下载论文 PDF、补充材料或代码；
- 克隆 OpenHarness、Harbor、Terminal-Bench；
- 修改或清理 `reference/` 下用户文件和 AppleDouble sidecar；
- 为 Claude Code 镜像补写来源元数据；
- 直接复制、移植或重写任何外部模块；
- 在 Git 中纳入任何 reference source；
- 调用真实模型做参考验证。

---

## 13. Accepted Decisions

```yaml
accepted_decisions:
  - decision: freeze_scoped_pi_go_for_v0
    evidence: Pi is the only local external runtime with pinned source, MIT license, public tests and G003/G006 dynamic evidence
    options: [accept_scoped_go, request_one_bounded_architecture_check, reject_direct_pi_for_v0]
    accepted_value: accept_scoped_go_at_the_pinned_commit_with_adapter_boundary_and_upgrade_review_trigger
    consequence: enables formal implementation while retaining an explicit upgrade/no-go review point

  - decision: choose_v0_tool_profile
    evidence: Pi supports injected tools and G006 proved a restricted profile; no external tool runtime is needed for V0
    options: [bounded_local_coding_profile, fixed_fixture_tools_only, broad_shell_network_install_profile]
    accepted_value: bounded_local_coding_profile
    consequence: determines whether cancellation, permissions or package installation need extra research

  - decision: choose_system_prompt_source
    evidence: local Claude mirror is not a licensed copy source and V1 needs a stable common base
    options: [project_owned_minimal_base, pi_default_resource_prompt, user_supplied_per_task_prompt]
    accepted_value: project_owned_minimal_base_plus_separate_task_and_skill_overlays
    consequence: fixes attribution and fairness; no Claude prompt copying is implied

  - decision: acquire_searchcli_now
    evidence: candidate is absent; canonical repository and license are unverified; V0 Charter is not blocked
    options: [defer_until_specific_v0_goal, authorize_bounded_read_only_acquisition_now, reject_source]
    accepted_value: defer_until_specific_v0_goal
    consequence: an advanced dry-run/checkpoint Goal may need a short research Session before its Contract

  - decision: localize_core_papers_now
    evidence: no local paper set exists and V0 facts are already sufficient
    options: [defer_by_version_gate, authorize_minimal_primary_set, authorize_full_pack]
    accepted_value: defer_by_version_gate
    consequence: V1/V2/V3 contracts will each acquire only the primary sources they actually need

  - decision: choose_v0_goal_count
    evidence: reference research should not be mixed with implementation execution
    options: [two_goals, three_goals, one_goal]
    accepted_value: three_goals_and_spawn_separate_bounded_research_sessions_only_on_trigger
    consequence: clearer provenance and context boundaries at the cost of more review checkpoints

  - decision: set_real_model_budget
    evidence: external reference study requires no model calls; V0 runtime evidence may require two separately authorized calls/runs
    options: [per_goal_hard_cap, shared_v0_cap, no_real_model_v0]
    accepted_value: V0_A_zero_calls_V0_B_one_run_cost_cap_1_USD_V0_C_one_run_cost_cap_2_USD_total_cost_cap_3_USD
    consequence: reference acquisition remains separate from paid runtime evidence

  - decision: include_worktree_in_v0
    evidence: cc notes/mirror contain mature worktree patterns, but current copied-workspace route has no failure
    options: [defer_with_provider_boundary, research_and_require_now, exclude_permanently]
    accepted_value: defer_with_provider_boundary
    consequence: no Claude Code worktree module is copied; a later focused audit remains possible

  - decision: implement_completion_mechanism_in_v0
    evidence: Pi and local evidence already support the mechanism; external references add design context but no missing proof
    options: [implement_opt_in_bounded_mechanism, observe_only_v0, defer_to_v1]
    accepted_value: implement_observe_only_and_verify_then_recover_once_same_session_without_effect_claim
    consequence: no additional broad research is required before implementation

  - decision: authorize_any_external_module_port
    evidence: only Pi has verified license; all other candidate implementation sources need provenance review
    options: [none_now, case_by_case_after_review, broad_reuse_authority]
    accepted_value: none_now_then_case_by_case
    consequence: direct reuse remains allowed in principle but never anonymous or unverified

  - decision: accept_v0_outcome_and_failure_taxonomy_direction
    evidence: local G005/G006 evidence is stronger than external taxonomies for current failure attribution
    options: [accept_draft_taxonomy, revise, defer]
    accepted_value: passed_failed_invalid_cancelled_with_formal_charter_precedence
    consequence: external frameworks will compare against project semantics instead of silently defining them

  - decision: set_v0_recovery_budget
    evidence: reference patterns support explicit budgets but do not provide a universally correct count
    options: [zero_or_one_by_strategy, always_one, configurable_unbounded]
    accepted_value: zero_or_one_by_strategy
    consequence: no external system is allowed to expand recovery automatically

  - decision: timing_of_real_recovery_observation
    evidence: no external reference can replace a natural project failure and environment-level verifier result
    options: [defer_to_natural_v0_v1_runs, forced_phase3b, require_before_v0]
    accepted_value: defer_to_natural_v0_v1_runs
    consequence: research remains design input, not synthetic effect evidence
```
