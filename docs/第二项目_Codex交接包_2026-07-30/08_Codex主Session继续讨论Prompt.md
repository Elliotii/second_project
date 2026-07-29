# 08｜Codex 主 Session 继续讨论 Prompt

```yaml
status: completed_historical_prompt
superseded_for_current_execution_by:
  - 09_对接执行、文件权威与验收规则.md
  - V0_VERSION_CHARTER.md
  - V0_A_GOAL_CONTRACT.md
```

> 本文件记录上一轮已经完成的交接任务，其中 `_DRAFT.md` 文件名和 `user_decisions_required` 均属于当时的输入要求。三份成果现已按用户绑定审查原位正式化；不得再次执行本 Prompt。

> 使用对象：负责第二项目的 Codex 主 Session  
> 当前项目节点：G006 已接受并关闭，Active Goal 为空  
> 本轮性质：交接吸收、路线对照、资料核验与 V0 Charter 草案  
> 本轮禁止：实现、创建 Goal、调用真实模型、修改 Pi、提交 Git

---

# 可直接发送给 Codex 主 Session 的 Prompt

你现在继续担任第二项目的 **主 Session**。

你的职责仍然是：

- 维护项目当前事实；
- 综合源码、测试、运行证据和用户决策；
- 决定项目范围、版本路线和 Goal Contract；
- 审查专用 Goal Session 的工作；
- 不在未经用户授权时自行扩大实施范围。

你不是本轮的执行 Session。

---

## 一、本轮背景

第二项目已经完成到 G006。

当前已知的最高层状态是：

```yaml
current_state:
  G006: closed_and_accepted
  active_goal: null
  formal_workbench_created: false
  V0_version_charter_created: false
  direct_agentharness: strongest_V0_runtime_candidate
  real_pi_provider_tool_session_verifier_route: proven
  real_recovery_effect: unproven
  completion_policy_effectiveness: unproven
  skill_only_baseline: not_started
  multi_path_recovery: not_started
  experience_reuse: not_started
```

本轮不会推翻 G001–G006 已经形成的源码、测试和运行事实。

但第二项目的长期路线已经经过新的讨论和研究，需要与你原先在 G006 总纲中形成的后续规划进行正式对照。

长期项目身份已被重新明确为：

> **一个可靠性优先、环境反馈驱动、能够进行有界多路径恢复，并将经过验证的恢复经验逐步沉淀为 Skill、Policy 和 Routing 能力的 Adaptive Coding Agent Harness。**

这并不授权你立即实现多路径、Curator、Experience Repository 或 Router。

---

## 二、必须先核验真实仓库

在接受任何交接文件判断前，先只读核验：

1. 当前 Git HEAD；
2. 工作区是否干净；
3. `CURRENT_STATE.md`；
4. 当前 Active Goal；
5. 固定 Pi 的实际路径、Commit、Package Version 和工作树状态；
6. G006 Contract、实现基线、Report 与 Closeout；
7. 已接受 ADR；
8. `reference/` 中实际存在的资料和路径。

当前对本地参考资料只允许预设三项：

```yaml
assumed_local_sources:
  - Pi
  - cc-harness-knowledge
  - Claude Code 源码镜像
```

其他 SearchCLI、Youtu-Agent、论文、OpenHarness、Harbor / Terminal-Bench 等统一按“默认尚未本地化”处理，除非你从真实文件系统发现它们已经存在。

如果真实仓库与交接包中的事实不一致：

```text
立即停止路线对照
→ 列出差异
→ 不静默修正
→ 等待用户决定
```

---

## 三、按以下顺序阅读交接包

请阅读交接目录中的：

```text
00_交接包说明与阅读顺序.md
01_当前事实与权威层级.md
02_第二项目完整版本化路径规划.md
03_旧规划与新路线差异决策表.md
04_项目身份与防偏航约束.md
05_上游复用移植与归因策略.md
06_参考资料清单与本地化计划.yaml
07_V0版本章程输入.md
```

此外，必须结合仓库中的：

- `CURRENT_STATE.md`；
- `docs/reports/PROJECT_ZERO_TO_CURRENT_PROGRESS_CONCLUSIONS_AND_COMPLETE_FORWARD_PLAN_2026-07-30.md`；
- G001–G006 原始 Contract、Report、Closeout；
- 已接受 ADR；
- Pi 固定源码和测试；
- `cc-harness-knowledge`；
- Claude Code 源码镜像。

外部研究和参考资料只能作为设计、比较、移植与风险输入，不能覆盖工程事实。

---

## 四、权威层级

发生冲突时使用：

```text
固定源码 / 测试 / 实际命令
    ↓
CURRENT_STATE / 已接受 Goal Closeout / 已接受 ADR
    ↓
用户接受的当前 Version Charter / Goal Contract
    ↓
交接包中的当前事实文件
    ↓
最新完整版本化路线
    ↓
外部研究、本地参考项目和用户笔记
    ↓
你的推断
```

请区分：

- 当前事实；
- 当前授权；
- 长期路线；
- 参考候选；
- 尚待验证的推断。

不得把未来愿景写成当前已经实现的事实。

---

## 五、必须正确理解的新路线

### 1. V0

V0 是：

> 可实际运行 Coding Task、控制 Workspace、关联 Session 与事件、由外部 Verifier 判断 Outcome，并保存可复核证据的最小 Coding Agent Workbench。

V0 是基础版本，不是项目最终身份。

### 2. V1

V1 必须让 Skill 成为真正竞争者：

```text
A. Baseline
B. Skill-only
C. Skill + External Verifier / Runtime Control
```

不能预设 Runtime Control 必然优于 Skill。

### 3. V2

V2 的：

```text
Failure-aware Bounded Multi-path Adaptive Recovery
```

是求职阶段的 **Portfolio North Star**，不是普通可选扩展。

它未来至少比较：

```text
继续原 Session
vs
干净 Session + Failure Packet / Skill
```

但本轮不得实现 V2。

### 4. V3

V3 是明确的后续方向：

```text
Trace
→ Diagnosis
→ Experience
→ Candidate Intervention
→ Related Task / Regression
→ Promote / Reject / Rollback
```

本轮不得实现 V3，也不得提前建设大型 Experience 平台。

### 5. V4 / V5

- V4：Experience-guided Routing 与 Skill / Policy Retirement；
- V5：Godot / 游戏研发 AI 工具链 Adapter。

它们只作为长期信息，不构成当前 V0 设计硬要求。

---

## 六、两项必须纠正的旧偏差

### 偏差一：复用洁癖

不要把“个人贡献边界”理解成：

```text
只能抽象借鉴
不能移植、重写或仿写成熟模块
```

在许可证允许、问题明确、用户能够理解并验证的前提下，允许：

```yaml
allowed_reuse:
  direct_dependency: true
  direct_module_reuse: true
  module_porting: true
  cross_language_rewrite: true
  behavioral_reimplementation: true
  architecture_adaptation: true
```

你需要做的是：

- 核验来源；
- 固定 Commit / Version；
- 核验 License；
- 明确采用和修改的部分；
- 记录验证方式；
- 保持简历归因准确。

不需要追求无意义的原创纯度。

### 偏差二：把范围控制误当项目定位

不要因为 V0 当前只建设：

```text
Pi Adapter
Workspace
Session
Journal
Verifier
Outcome
```

就把项目长期压缩成：

```text
Pi + Trace + Verifier + Baseline/Candidate + Report
```

范围控制只决定当前版本先做什么。

V0 中每个基础模块都应说明它服务：

- 真实 Coding Agent 使用；
- V1 Skill / Runtime 对照；
- 或 V2 多路径恢复。

如果一个模块只让报告更完整，却不服务真实行为和后续主动能力，应降低优先级。

---

## 七、本轮对参考资料的处理

先基于真实文件系统核验：

1. Pi；
2. `cc-harness-knowledge`；
3. Claude Code 源码镜像。

对于其他来源，只做获取建议，不直接下载或克隆。

重点候选：

### SearchCLI

候选服务 V0/V1：

- Plan；
- Dry Run；
- 成本预估；
- Checkpoint；
- Candidate / Apply 分离；
- 人工发布边界。

你可以建议：

- 立即获取；
- 推迟到具体 Goal；
- 或拒绝。

但必须说明：

- 服务哪个问题；
- 要研究哪些模块；
- 是否允许直接移植；
- 许可证；
- 停止条件。

### Youtu-Agent

候选服务 V2/V3：

- Environment；
- Rollout；
- Judge；
- Experiment Identity；
- Experience；
- Candidate Improvement；
- Promotion。

当前不能阻塞 V0。

### 核心论文

候选包括：

- Scaffold Self-improvement；
- Long-horizon Agent；
- SkillOS；
- Experience / Meta-evolution。

你应判断哪些需要现在本地保存，哪些只在 V3 前获取。

### OpenHarness、Harbor / Terminal-Bench

只在具体问题和规模触发时进入，不做全面研究。

---

## 八、本轮唯一允许提交的三个主要输出

本轮只提交以下三份草案，不修改正式项目状态。

---

### 输出 1：Roadmap Reconciliation Report

建议文件名：

```text
ROADMAP_RECONCILIATION_REPORT_DRAFT.md
```

必须包含：

1. 真实仓库核验结果；
2. G001–G006 哪些事实保持不变；
3. 旧后续规划中：
   - `accepted`
   - `modified`
   - `superseded`
   - `deferred`
   - `still_open`
   - `rejected`
4. 对项目身份升级的理解；
5. V2 作为 Portfolio North Star 的具体影响；
6. V0 哪些数据和模块命名可能阻碍 V2；
7. 哪些旧基础设施仍然必要；
8. 哪些模块应删除、简化或后移；
9. 需要用户决定的冲突；
10. 你对交接包判断的异议或修正建议。

不得只重复交接文件，必须结合真实源码、仓库和历史报告进行独立判断。

---

### 输出 2：Reference Acquisition Plan

建议文件名：

```text
REFERENCE_ACQUISITION_PLAN_DRAFT.md
```

必须包含：

1. 实际本地资料清单；
2. 三项假设资料的真实路径、版本、来源和许可证；
3. 实际发现的其他资料；
4. SearchCLI 是否现在获取；
5. Youtu-Agent 何时获取；
6. 核心论文如何保存；
7. OpenHarness、Harbor / Terminal-Bench 的触发条件；
8. 每个来源服务哪个版本与模块；
9. 允许的复用方式；
10. 有界研究任务和停止条件；
11. 建议更新 `06_参考资料清单与本地化计划.yaml` 的 Patch；
12. 所有需要用户授权的下载、克隆或移植动作。

你可以根据真实本地资料调整交接文件建议，但必须说明理由。

---

### 输出 3：V0 Version Charter Draft

建议文件名：

```text
V0_VERSION_CHARTER_DRAFT.md
```

至少包含：

```text
1. Version Mission
2. Current Evidence Baseline
3. Pi Go Scope
4. Product Surface
5. Architecture and Responsibilities
6. Data Contracts
7. Tool / Session / Workspace
8. Verifier and Outcome
9. Completion Mechanism
10. Evidence and Secret Boundaries
11. V1 / V2 Continuity
12. Non-goals
13. Goal Decomposition
14. Definition of Done
15. Pause Conditions
16. Open User Decisions
17. Claims Allowed / Not Allowed
```

Charter 必须：

- 只冻结 V0；
- 保留 Direct `AgentHarness` 为主候选；
- 让 V0 成为真实 Coding Agent Workbench；
- 不写死为 Baseline/Candidate Pair；
- 保留 `Attempt`、`strategy_id`、`parent_attempt_id` 等最低连续性；
- 不提前实现 V2/V3；
- 明确 V1 Skill-only；
- 明确 V2 Portfolio North Star；
- 避免 Dashboard、Schema 和 Inspector 膨胀；
- 将真实 Coding Task 纳入每个主要 Goal；
- 建议 V0 拆成 1–3 个有界 Goal。

---

## 九、必须单独列出的用户决策

三个草案末尾都要统一列出：

```yaml
user_decisions_required:
  decision:
  evidence:
  options:
  recommendation:
  consequence:
```

不要替用户静默决定：

- 是否正式冻结 Pi V0 Go；
- V0 Tool Profile；
- System Prompt 来源；
- SearchCLI 是否立即获取；
- 论文是否现在本地化；
- V0 Goal 数量；
- 真实模型调用预算；
- Worktree 是否进入 V0；
- Completion Mechanism 是否在 V0 正式实现；
- 任何外部模块移植。

---

## 十、禁止事项

本轮不得：

- 修改项目源码；
- 创建正式 `workbench/`；
- 创建或激活 Goal；
- 修改 `CURRENT_STATE.md`；
- 修改已接受 ADR；
- 修改 Pi；
- 调用真实模型；
- 下载或克隆外部资料；
- 修改用户的 `reference/` 资料；
- 提交 Git；
- 直接生成 V0 实现 Prompt；
- 提前实现 V2/V3；
- 将交接草案写成已接受决策。

如你需要生成草案文件，应将它们标为：

```yaml
status: draft_pending_user_review
```

---

## 十一、暂停条件

出现以下情况立即停止：

1. 当前 Git、Pi Commit 或 G006 状态与交接事实不一致；
2. 需要 Pi Core Patch 才能完成 V0；
3. Claude Code 源码镜像的来源或许可证边界不清，却计划直接复制代码；
4. V0 Tool Profile 无法通过 Direct 路径合理构成；
5. 需要让 Agent 修改 Verifier、测试或 Acceptance Criteria；
6. 为 V2/V3 提前建设大型平台；
7. Reference Research 开始阻塞 V0 Charter；
8. 你认为 V2 不应作为 Portfolio North Star；
9. 你认为旧 Reliability Workbench 仍应作为项目最终身份；
10. 存在需要用户先回答、而本地事实无法解决的关键冲突。

停止时提交：

```text
PAUSE_REPORT.md
```

只说明：

- 观察到什么；
- 证据；
- 为什么阻塞；
- 哪些选项需要用户决定。

---

## 十二、最终停止点

完成三份草案后立即停止。

不要继续：

- 创建 Goal Contract；
- 编码；
- 下载资料；
- 调用模型；
- 提交 Git。

等待用户和主讨论 Session 对以下内容进行审查：

```text
Roadmap Reconciliation
Reference Acquisition
V0 Charter
```
