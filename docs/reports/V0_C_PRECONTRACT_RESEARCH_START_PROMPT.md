# V0-C Precontract Research Session Start Prompt

```yaml
document_status: authorized_ready_to_execute
task_kind: bounded_read_only_precontract_research
execution_owner: dedicated_v0_c_precontract_research_session
root_control_commit: bb4d1023d9359a5b4172e9ce2e3c9332a6a917be
root_branch_at_authorization: main
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
v0_a_implementation_baseline_commit: 1a1565fa7e6d1440c8f99e2c7e587201a14111c1
v0_b_implementation_baseline_commit: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
v0_b_closeout_commit: 2f05713ccda4ea9145cc948fb4b3ac6f0ebd3768
v0_b_workbench_tree_digest: b8034b235acdf50630c7bebc3859f001799986333622ae0ce1b545528d3fe8d0
active_goal: false
goal_contract_created: false
goal_contract_creation_authorized: false
goal_activation_authorized: false
implementation_authorized: false
independent_audit_authorized: false
real_model_calls_authorized: 0
external_network_authorized: false
dependency_install_authorized: false
pi_core_patch_authorized: false
git_commit_authorized: false
```

你是第二项目新的 **V0-C Precontract Research Session**。本轮不是实现
Session、Goal 执行、独立审计或真实用户运行。你的唯一任务是基于已经固定的
本地工程事实，研究从 accepted V0-B 到 V0-C 的最小、可验证实现边界，并向
主 Session提交一份咨询性质的研究报告。

## 1. 权威与当前事实

开始时先核验：

1. 仓库根目录是 `D:\AI\AI_Projects\project2`；
2. `git HEAD` 精确等于
   `bb4d1023d9359a5b4172e9ce2e3c9332a6a917be`；
3. 所有 tracked files clean；已登记的未跟踪 `reference/` 可以存在，不得
   为追求空 `git status` 而提交、删除或修改；
4. `.upstream/pi` HEAD 精确等于
   `027a5847901b5dde30270abaa1041046cd2b4b55` 且工作树 clean；
5. `CURRENT_STATE.md` 中 `active_goal.id: null`，V0-C 只有
   `research_authorized: true`，Contract、Activation、实现和真实模型均未授权；
6. accepted V0-B Implementation Baseline Commit 是
   `7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180`，Closeout Commit 是
   `2f05713ccda4ea9145cc948fb4b3ac6f0ebd3768`。

如任一精确身份不符，立即停止，只在目标报告中写明差异和阻塞，不自行修正、
切换 Commit、清理工作区或继续推断。

证据权威顺序：

```text
固定本地源码 / 测试 / 实际只读命令
→ CURRENT_STATE / accepted Closeout / accepted ADR
→ accepted V0 Charter 与控制规则
→ accepted Goal Contract 和历史报告
→ cc-harness-knowledge / reference/src
→ 你的推断
```

所有重要结论标注为 `Fact`、`Inference`、`Recommendation` 或
`Unconfirmed`。Pi 行为必须引用固定本地路径、Symbol 和相关测试；不得仅凭
README 或参考笔记推断。

## 2. 必须完整读取

按顺序读取：

1. `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. `docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md`，尤其是
   Run/Attempt、Outcome、Completion Mechanism、V0-C、DoD、Budget、
   Pause Conditions 和 Claims；
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
5. `docs/第二项目_Codex交接包_2026-07-30/V0_B_GOAL_CONTRACT.md`；
6. `docs/reports/V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME_PRECONTRACT_RESEARCH.md`；
7. `docs/reports/V0_B_IMPLEMENTATION_REPORT.md`；
8. `docs/reports/V0_B_INDEPENDENT_REAUDIT_REPORT.md`；
9. `docs/reports/V0_B_CLOSEOUT.md`；
10. `docs/reports/V0_A_CLOSEOUT.md`；
11. `docs/goals/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY.md`；
12. `docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_REPORT.md`；
13. `docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_CLOSEOUT.md`；
14. `docs/goals/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY.md`；
15. `docs/reports/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY_REPORT.md`；
16. `docs/reports/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY_CLOSEOUT.md`；
17. `workbench/README.md`、`workbench/package.json`、`workbench/tsconfig.json`；
18. `workbench/src/` 和 `workbench/tests/` 中与 Run、Attempt、Pi Adapter、
    Session、Journal、Verifier、Outcome、Evidence、preflight 和 inspect
    直接相关的全部文件。

如需检查 Pi：

1. 先完整读取 `.upstream/pi/AGENTS.md`；
2. 至少核验
   `.upstream/pi/packages/agent/src/harness/agent-harness.ts`；
3. 跟随该 Symbol 使用的公开 Session、Event、Tool 生命周期实现；
4. 核对 `.upstream/pi/packages/agent/test/harness/agent-harness.test.ts`、
   `session.test.ts`、`storage.test.ts` 及其他直接相关测试；
5. 不修改或构建 Pi。

成熟 Harness 参考边界：

1. 先读 `reference/cc-harness-knowledge/AGENTS.md`；
2. 再选择性读取与 Agent Loop、Tool/ToolResult、Session、Resume、Stop、
   Recovery、Context/Failure Packet、Budget、Trace 直接相关的笔记，至少覆盖：
   - `reference/cc-harness-knowledge/docs/CC_HARNESS_REFERENCE.md`
   - `reference/cc-harness-knowledge/docs/HARNESS_ENGINEERING_PLAYBOOK.md`
   - `reference/cc-harness-knowledge/research/source-reports/s11_error_recovery_source_report.md`
3. 只有当知识笔记不足，且具体实现细节可能改变 V0-C 决策时，才只读检查
   `reference/src/`；
4. `reference/src/` 的完整来源和产品版本未确定，不得声称它代表最新
   Claude Code，也不得直接复制代码或把其模块边界变成项目 Spec。

## 3. 研究任务

报告必须回答以下问题。

### A. 最小 Source Delta

- V0-B 当前哪些类型、状态机、入口和证据结构隐含“一个 Run 只有一个
  Attempt”；
- 为支持“一个 initial Attempt + 最多一个 child Attempt”，哪些文件和 Symbol
  必须改，哪些应保持不变；
- 是否能在不修改 Pi Core、不使用 private import、不引入新技术栈的前提下完成；
- 哪些 V0-B 测试应原样成为回归，哪些需要新增 V0-C 测试。

### B. Direct AgentHarness Same-session Continuation

- 用 Pi 公共入口解释 initial settled 后，同一个 `AgentHarness` / Session 如何
 接收一次新 prompt 并继续；
- 对照 G003 已证明的 deterministic recovery 机制，以及 G006 只证明
  real route、未触发 recovery 的边界；
- 指明 Workbench Adapter 应负责什么、Pi Session 已负责什么；
- 区分本轮 same-process settled continuation 与跨进程 Resume、crash
  recovery，后两者不得被偷偷纳入 V0-C。

### C. Attempt Lineage 与 Identity

提出最小候选合同，但不实施：

- initial Attempt 的 `parent_attempt_id` 语义；
- child Attempt 必须复用的 `run_id`、`session_id`、`workspace_id`；
- `attempt_id`、`attempt_index`、`strategy_id` 和 terminal 状态的关系；
- 每个 Attempt 如何关联 Agent cycle、Journal 范围、Verifier 结果和 Workspace
  digest；
- Run 只能产生一个正式 terminal Outcome，且不能被 Report 文本补造。

说明命名是否会阻碍 V1 Skill-only 或 V2 clean-session child Attempt。

### D. Completion Controller

给出最小显式状态机和决策表，至少覆盖：

1. observe-only：initial valid pass 后停止；
2. recovery-enabled：initial valid pass 后停止；
3. initial valid fail + valid evidence + strategy allows + 全部预算足够：
   创建且只创建一个 child Attempt；
4. child valid pass：Run pass；
5. child valid fail：Run fail，不再恢复；
6. Verifier invalid：不恢复，Run invalid；
7. Evidence invalid：不恢复，Run invalid；
8. abort/cancel：不恢复，按 Charter precedence 终止；
9. provider、Tool、wall-time、token、cost 或 Attempt budget 不足：不启动 child；
10. controller 自身异常、重复 terminalization、重复 verifier 或重复 child：
    必须 fail closed。

明确：

- eligibility 检查顺序；
- recovery budget 在何时预留、消费和持久化；
- child 开始前后失败分别如何终止；
- Outcome precedence 与 V0 Charter 是否存在需要 Contract 冻结的歧义。

### E. Bounded Failure Packet

提出只够 V0-C 的最小候选结构：

- Verifier identity、有效失败摘要、失败类别、相关 artifact refs/digests；
- 可安全投影给 Agent 的内容；
- 明确禁止 secret、隐藏 reasoning、未验证自由文本、完整大体积 artifact；
- 长度/字节预算、稳定序列化、digest 和 Journal 关联；
- Packet 缺失、畸形、超预算或引用不一致时的 fail-closed 行为。

不要建设通用 Context 平台、Experience Repository、Skill 系统或 V2 Router。

### F. Evidence、Verifier 与 Outcome

- 每个 settled Attempt 后 Verifier 的唯一执行边界；
- Attempt-level Verifier 与 Run-level terminal Outcome 的映射；
- V0-B Evidence Index、Journal、secret scan、terminal policy、inspect 和
  Outcome builder 哪些可复用；
- 如何防止“child 已开始但证据未完成”“Verifier 重复执行”“先写 Outcome
  后补证据”“invalid 被误报为 Agent failure”；
- accepted V0-B test-fixture setup debt 是否应在 V0-C 正常触碰测试环境时顺手
  解决，并说明它不能成为扩大实现范围的理由。

### G. Deterministic Stage 1 与真实 Stage 2

分别给出建议：

- Stage 1：零真实模型调用，如何用 Faux sequence 稳定覆盖 pass、fail、
  one-recovery-pass、one-recovery-fail、invalid/no-recovery、budget/no-recovery
  和 terminalization 反例；
- Candidate 冻结后聚焦独立审计的最小范围；
- Stage 2：从已审查冻结基线，通过正式 Product Surface 执行一次用户可见
  Coding Task；任务、Workspace、Verifier、Run/cost caps、凭据注入和停止点
  应如何受限；
- Stage 2 不得授予源代码修改权，出现实现缺陷时必须停止并返回原
  Implementation Session。

### H. Contract 输入与暂停条件

形成供主 Session起草 Contract 的材料：

- 推荐 Scope / Non-goals；
- 推荐 Gates 和 Definition of Done；
- 推荐允许写入路径；
- 需要冻结的预算、测试矩阵、Evidence Index 与 Claims；
- 需要用户决定的最少事项；
- 会阻塞 Contract 的真实未知项；
- 不会阻塞、应后移的成熟模式或技术债；
- 实现阶段的 Pause Conditions。

不得在本报告中创建或接受正式 Goal Contract，也不得替用户静默决定真实模型
预算、任务内容、外部下载、Pi patch 或架构扩张。

## 4. 允许的命令与写入

允许：

- `rg`、`rg --files`、`Get-Content`；
- `git status`、`git diff`、`git show`、`git rev-parse`、`git ls-files`；
- 其他明确只读、不会创建缓存或工件的源码检查；
- 只创建或更新这一份报告：
  `docs/reports/V0_C_BOUNDED_COMPLETION_PRECONTRACT_RESEARCH.md`。

禁止：

- 修改 `workbench/`、`spikes/`、Fixture、测试、控制文件、Goal Contract、
  `CURRENT_STATE.md`、ADR、Pi 或 `reference/`；
- 创建 `.runs/v0-c/` 或其他运行证据；
- 运行 Agent、Provider、Verifier、正式任务、构建、测试、安装或生成命令；
- 读取或创建凭据、`.env`、密钥或真实 Provider 配置；
- 外部联网、下载、克隆、依赖安装；
- `git add`、`git commit`、`git checkout`、`git switch`、`git clean`；
- 创建 V0-C Goal Contract；
- 激活 V0-C、开始 Stage 1、审计或 Stage 2。

若只读研究不足以得出结论，把问题标为 `Unconfirmed`，写出最小未来验证方法；
不要为了填补未知项自行实验。

## 5. 唯一交付物

创建：

`docs/reports/V0_C_BOUNDED_COMPLETION_PRECONTRACT_RESEARCH.md`

至少包含：

1. Executive Decision Summary；
2. Gate A 身份核验；
3. Evidence and Authority Map；
4. V0-B → V0-C Source/Symbol Delta Map；
5. Pi same-session continuation call chain；
6. Attempt lineage 候选合同；
7. Completion Controller 状态机和决策表；
8. bounded Failure Packet 候选结构；
9. Evidence / Verifier / Outcome 关联；
10. deterministic Stage 1 测试矩阵；
11. focused audit 建议范围；
12. frozen Stage 2 user-acceptance 建议；
13. Scope、Non-goals、Gates、DoD、Budget 和 Pause Conditions 建议；
14. Fact / Inference / Recommendation / Unconfirmed 汇总；
15. Open Decisions for Main Session and User；
16. exact commands 与 exit codes；
17. Source Citation Index；
18. 建议处置：
    `READY_FOR_MAIN_SESSION_CONTRACT_DRAFTING`、
    `NEEDS_BOUNDED_FOLLOWUP_RESEARCH` 或 `PAUSE_ARCHITECTURE_CONFLICT`。

报告只提供建议，不具有 Goal Contract、Activation、实现或架构接受权威。

## 6. 最终停止点

完成报告后：

1. 运行 `git status --short`；
2. 确认 tracked source/control delta 为零，唯一允许的新增 tracked 候选是上述
   研究报告；
3. 确认 Pi clean；
4. 向主 Session返回报告路径、建议处置、最重要的 3–7 项结论和仍需用户决定
   的事项；
5. 立即停止。

不要继续起草 Contract、实现、测试、审计、调用模型或提交 Git。
