# 第二项目 Roadmap Reconciliation Report

```yaml
status: accepted
document_kind: roadmap_reconciliation
date: 2026-07-30
accepted_by_user: 2026-07-30
binding_review: 第二项目_三份草案验收与V0冻结建议_2026-07-30.md
project_head_verified: 6e454ac20a92f0739fb51ba9a8a08136e83b59c3
active_goal_verified: null
pinned_pi_commit_verified: 027a5847901b5dde30270abaa1041046cd2b4b55
g006_verified: closed_and_accepted
formal_workbench_created: false
v0_version_charter_accepted: true_with_binding_revisions
new_goal_authorized_by_this_report: false
implementation_authorized_by_this_report: false
git_commit_authorized_by_this_report: false
```

## 1. 结论先行

**Decision.** 接受交接包提出的长期身份升级，并对它作一项严格限定：

> 第二项目的长期身份可以升级为 **Adaptive Coding Agent Harness**；其中 “Adaptive” 必须表示“基于环境证据，在明确预算和人工治理下选择、验证、沉淀或撤销恢复策略”，不能表示未经验证的自动自我修改。

旧的 Reliability Workbench 不是被删除，而是被重新定位：

- V0 是可实际运行 Coding Task、控制 Workspace、关联 Pi Session、运行外部 Verifier 并保存证据的最小 Workbench；
- V1 用同一基础公平比较 Baseline、Skill-only、Skill + Runtime Control；
- V2 将有界多路径恢复提升为作品集阶段的主线能力；
- V3 才开始受控的 Experience 提炼、候选干预和 Promote/Reject/Rollback；
- V4/V5 只保留长期接口意识，不进入 V0 需求。

**Fact.** G001–G006 的本地源码、测试、实际运行和已接受 Closeout 与交接包的最高层事实一致，没有触发 `PAUSE_REPORT.md` 条件。

**Correction.** 旧规划真正需要替换的不是 Pi、Verifier、Journal、Workspace 等基础设施，而是以 `Pair`、`Variant`、`Baseline/Candidate` 为中心的正式对象模型。V0 应改成：

```text
TaskSpec
  → Run(strategy_id)
    → Attempt(parent_attempt_id?)
      → WorkspaceRef + SessionRef
      → Journal + VerifierResult
      → Outcome
```

Baseline、Skill-only、同 Session Recovery 和新 Session Recovery 都应是策略或 Attempt lineage 的取值，而不是核心 Schema 的固定分支。

---

## 2. 真实仓库核验结果

### 2.1 项目 Git 与控制状态

| 核验项 | 结果 | 判断 |
| --- | --- | --- |
| Git HEAD | `6e454ac20a92f0739fb51ba9a8a08136e83b59c3` | **Fact** |
| 当前分支 | `main` | **Fact** |
| 项目跟踪文件 | 无 staged、modified 或 deleted 文件 | **Fact** |
| 未跟踪目录 | `docs/第二项目_Codex交接包_2026-07-30/`、`reference/` | **Fact**；均为本轮输入，不属于既有项目提交 |
| `CURRENT_STATE.md` | `active_goal: null`；G006 已关闭；正式 `workbench/` 未创建 | **Fact** |
| 正式 V0 Charter | 核验时尚未创建；本报告收口时已依据绑定审查形成并接受 `V0_VERSION_CHARTER.md` | **Point-in-time Fact + accepted update** |

说明：当前 Git 客户端因 Windows 账户所有权差异需要对只读命令使用命令级 `safe.directory` 覆盖；未修改全局 Git 配置。项目“干净”在此指跟踪文件无变化，不表示用户提供的两个未跟踪目录不存在。

### 2.2 固定 Pi

| 项目 | 实际值 |
| --- | --- |
| 路径 | `.upstream/pi/` |
| Commit | `027a5847901b5dde30270abaa1041046cd2b4b55` |
| Describe | `v0.82.1-40-g027a5847` |
| Package | `@earendil-works/pi-agent-core` |
| Package version | `0.82.1` |
| Node engine | `>=22.19.0` |
| Origin | `https://github.com/earendil-works/pi.git` |
| License | MIT，Copyright 2025 Mario Zechner |
| 工作树 | clean |
| Pi Core patch count | `0` |

**Fact.** `packages/agent/src/index.ts` 从公共根入口导出 `AgentHarness`、JSONL/Memory Session Repo、`Session`、Skills 和 Tools。关键源码证据包括：

- `packages/agent/src/harness/agent-harness.ts`：`AgentHarness`、`prompt()`、`abort()`、`waitForIdle()`、`subscribe()`、`settled`、`after_provider_response`；
- `packages/agent/src/harness/session/session.ts`：`Session.buildContext()`、`appendMessage()`、`moveTo()`；
- `packages/agent/src/harness/session/jsonl-repo.ts`：`JsonlSessionRepo`；
- `packages/agent/src/harness/env/nodejs.ts`：`NodeExecutionEnv`；
- `packages/agent/test/harness/agent-harness.test.ts`、`session.test.ts`、`repo.test.ts`、`storage.test.ts`：settlement、hook、branch、reopen、persistence 和 metadata 证据。

**Inference.** Direct `AgentHarness` 足以构成 V0 的受控 Tool/Session/Verifier 路线；它不等于完整 Workbench，也不自动提供 Sandbox、Crash-safe exactly-once、完整跨进程 Runtime 重建或外部 Outcome 语义。

### 2.3 G006 与实现基线

| 核验项 | 结果 |
| --- | --- |
| Contract | `closed_accepted` |
| 实现基线 Commit | `05da78bc24d6bab92dc44ee44912a57159e45e72` |
| 实现相对该 Commit | 无差异 |
| Gate 0 | 严格 TypeScript、公共 emitted import、标准构建、8/8 离线测试通过 |
| 最终 disposition | `PASS_REAL_MODEL_FEASIBILITY` |
| 模型路径 | DeepSeek V4 Flash，真实 Tool Loop |
| Baseline/Candidate | 各 4 次 Provider Request、3 次 Tool Start/End、settled 后 Verifier |
| 最终结果 | 两者首次 Verifier 均通过 |
| Recovery | 未触发；没有人为制造失败 |
| Pair cost | `$0.0016993088` |
| 首次请求后总时长 | `55,470 ms` |
| Secret scan | 54 files，0 matches |

**Fact.** G006 证明真实 Provider、Tool、Session、`subscribe(...)` Observer、Journal v2、外部 Verifier 和 Outcome 路线可运行。

**Unconfirmed.** G006 没有证明真实 Recovery、Completion Verification 效果、重复试验成功率、跨任务泛化或最终 V0 架构。

### 2.4 已接受 ADR

| ADR | 保持有效的结论 | 当前边界 |
| --- | --- | --- |
| ADR-0001 | Direct `AgentHarness` 是 G002 主候选 | 原状态只针对 G002；不能单独当作最终 V0 Go |
| ADR-0002 | 固定 npm Artifact 恢复 model-data，并由固定源码验证 | 只解决构建数据边界；不证明 Runtime 效果 |
| ADR-0003 | G003 后继续保留 Direct 路线 | 宽 G004 已退役；其“最终 Pi Go 未冻结”是历史状态，现由正式 V0 Charter 的 scoped Pi Go 覆盖 |

### 2.5 本地参考资料

真实文件系统只发现三项 Harness/上游代码级参考源：

1. `.upstream/pi/`；
2. `reference/cc-harness-knowledge/`；
3. `reference/src/`（Claude Code 源码镜像）。

没有发现本地 SearchCLI、Youtu-Agent、OpenHarness、Harbor、Terminal-Bench 或论文仓库。

`reference/cc-harness-knowledge/` 是独立 Git 仓库，HEAD 为 `3db7929714e29785c09b478462b3a6e2bd456efd`，29 个跟踪语义文件；跟踪内容无修改，但存在用户传入的未跟踪 AppleDouble `._*` sidecar。仓库未配置 remote，也没有 LICENSE。

`reference/src/` 不是 Git 仓库；没有 README、package manifest、LICENSE、NOTICE 或可核验版本。源码中的 Claude Code/Anthropic 标识足以确认其内容性质，但 `MACRO.VERSION` 在构建时注入，因此不能从镜像恢复精确产品版本或 Commit。

### 2.6 一项非阻塞路径差异

交接说明要求结合《第二项目 codexG006 后现状及它的本地预想规划》，真实仓库中没有这个精确文件名。其内容对应物是：

`docs/reports/PROJECT_ZERO_TO_CURRENT_PROGRESS_CONCLUSIONS_AND_COMPLETE_FORWARD_PLAN_2026-07-30.md`

**Inference.** 这是交接命名与实际路径不一致，不是工程事实冲突；本报告以该 1,075 行旧总纲作为正式对照基线。后续若需要方便新 Session 阅读，可另行授权增加索引或别名，但本轮不修改。

---

## 3. G001–G006 保持不变的事实

| 阶段 | 保持不变的结论 | 仍不能声称 |
| --- | --- | --- |
| Phase 0 | Windows 原生 Node/TypeScript 路线成立；Pi 已固定；上游、运行和项目文件边界明确 | 固定 Commit 不等于最终 Go |
| G001 | Direct `pi-agent-core` `AgentHarness` 通过公共入口可组合；优于当时的 SDK Runner 主方案 | 未证明 emitted build、动态恢复或真实模型 |
| G002 | 首次动态 Gate 因缺少生成后的 model-data 在 setup 阶段停止 | 不是 Direct Pi 失败，也不是 Go |
| G003 | Artifact-backed model-data + 标准 emitted build 通过；Faux Provider 下外部 Verifier 和同 Session 一次恢复闭环成立 | 不是实时模型 Policy 效果证据 |
| G004 | 宽泛风险包不满足 Goal 升级条件，在 Contract 前退役 | G004 不是执行失败，也没有自动变成其他编号 |
| G005 | 真实 Provider/Tool 部分路径达到 settled，但 Observer API 与 Journal Envelope 缺陷使整次证据无效 | 不能归因 Pi/Provider 失败；不能补写旧证据 |
| G006 | 修正后的真实 Provider/Tool/Session/Verifier/Evidence 路线通过；Pi Core patch 为 0 | 真实 Recovery 和 Completion Policy effectiveness 均未证明 |

**Overall Fact.** G001 + G003 + G006 共同证明 `Architecture / Integration Mechanism Works`，不证明 `Policy Improves Real-model Coding Performance`。

---

## 4. 旧规划逐项处置

### 4.1 `accepted`

| 旧规划内容 | 接受理由 |
| --- | --- |
| Direct `AgentHarness` + 外部 Driver/Verifier | 源码、确定性动态证据和真实路径证据一致 |
| Pi Adapter 隔离上游细节 | 有利于固定 Commit、升级审计和避免 Pi Core patch |
| Workspace、Session Link、Journal v2、Verifier、Outcome | 是任何后续 Skill/Recovery 策略都需要的最小事实层 |
| 环境级 Verifier 高于模型自评 | G003/G006 已证明插入点和顺序可行 |
| Budget、terminal reason、invalid-run 分离 | G005 已证明 Evidence Failure 不能误报为 Agent Failure |
| Source/Artifact/Provider identity 与 secret boundary | 已在 G003/G006 形成可用证据 |
| Windows 原生 Node/TypeScript | 当前构建、类型和真实运行已通过；没有 WSL 需求 |
| 真实 Coding Task 与用户实际使用 | 防止项目退化为只跑 Fixture 的报告生成器 |
| 主 Session 决策、专用 Goal Session 执行 | 用户已明确固定为后续工作方式 |

### 4.2 `modified`

| 旧规划内容 | 修改后 |
| --- | --- |
| 项目最终身份是 Reliability Workbench | Workbench 成为 V0/V1 基础；长期身份升级为 Adaptive Coding Agent Harness |
| `RunManifest/PairManifest/Variant` 为中心 | `TaskSpec/Run/Attempt/strategy_id/parent_attempt_id` 为中心；比较组是可选视图 |
| Completion Verification 是项目唯一主故事 | V0 实现机制，V1 与 Skill 公平竞争，V2 提供多路径恢复 |
| Phase 5 的 V0.1–V0.4 四段实现 | 收敛为三个有界 Goal：V0-A、V0-B、V0-C |
| Pilot Eval 是作品集最终能力 | Pilot 仍需要，但 V2 多路径恢复成为 Portfolio North Star |
| Tool Result Budget 是自然的第二 Policy | 保留为条件性 reliability case；V1 优先建立 Skill-only 竞争路径 |
| Pair-specific `runId`、workspace、outcome | 每个 Run/Attempt 独立；比较由 `comparison_group_id` 或查询层完成 |
| Recovery Cycle 是一个特殊分支 | Recovery 是带 parent lineage 的 Attempt；Session/Workspace 可复用也可替换 |

### 4.3 `superseded`

| 旧规划内容 | 被什么取代 |
| --- | --- |
| “Pi + Trace + Verifier + Pair Report”可代表长期项目全貌 | V0–V5 版本路线和 Adaptive 身份 |
| Baseline/Candidate 二分写死到正式 Schema | 通用 Strategy + Run + Attempt lineage |
| `g006-paired-attempt-001` 式“一个 Attempt 包含两种 Variant” | 一个 Run 选择一个 Strategy；一个 Attempt 表示一个有界 Agent Cycle |
| Pair Report 是主要产品表面 | `run` + `inspect` 是 V0 主表面；compare 是后续查询/实验能力 |
| Portfolio-ready 只要求一条 Policy 的 Promote/Reject | 至少还要体现 V2 有界多路径恢复主线及其诚实边界 |

### 4.4 `deferred`

- 真实模型 Recovery 的自然触发，不再创建只为追逐失败的 Phase 3B；
- Settled 跨进程重建，除非 V0 使用方式明确要求；
- crash-after-side-effect reconciliation，等待真实/具体 failure case；
- Windows 长 Tool cancellation，等待 Tool Profile 包含长任务；
- Context Compaction/Critical Constraint Preservation，等待真实 context pressure；
- SDK Runner 兼容性、RPC 隔离、Container/Sandbox；
- Worktree 正式支持；
- SearchCLI、Youtu-Agent、论文、OpenHarness、Harbor/Terminal-Bench 获取；
- Experience Repository、Curator、Router、Skill Retirement；
- Godot Adapter。

### 4.5 `still_open`

- 是否正式冻结 Direct Pi 的 V0 Go；
- V0 Tool Profile；
- V0 System Prompt 来源；
- V0 Outcome/Failure/Invalid 语义；
- V0 Recovery Budget；
- V0 是否正式实现 Completion Mechanism；
- V0 Goal 数量；
- V0 真实模型调用预算；
- Worktree 是否进入 V0；
- SearchCLI 和论文何时本地化；
- 是否允许任何具体外部模块移植。

### 4.6 `rejected`

- 恢复宽泛 G004；
- 因未验证风险而暂停全部 V0；
- 修改 Pi Core 作为 V0 默认手段；
- 把 SDK/RPC、WSL、MCP、Multi-Agent、Web UI 或通用 Sandbox 加入 V0；
- 通用 Exactly-once Tool Transaction 平台；
- Claude Code Feature Parity；
- 为了得到 Recovery 证据而人为挑选或篡改失败；
- 未经 Verifier/回归验证就自动推广 Skill、Policy 或 Route；
- 因“个人贡献”而拒绝一切许可证允许的成熟模块复用。

---

## 5. 对项目身份升级的理解

身份升级改变的是后续闭环，不是当前事实：

```text
旧的主要闭环：
Task → Agent → Verifier → Baseline/Candidate Report

新的长期闭环：
Task → Attempt → Environment Feedback
     → bounded route choice
     → validated recovery
     → reusable Skill/Policy candidate
     → regression / promote / reject / rollback
```

**Accepted.** 这更符合用户已经学习的 Agent Loop、Context、Tool、Session、Skill 和 Stop Policy，也给 V2/V3 明确的求职信号。

**Boundary.** 新身份不授权现在增加 Curator、Experience Repository、Router 或多 Agent。V0 的职责仍是把真实运行事实做对。

**Attribution.** 项目未来可复用成熟模块；个人贡献应准确描述为：来源选择、适配、约束设计、证据合同、验证、恢复 Policy、Eval 和技术取舍，而不是宣称所有代码原创。

---

## 6. V2 作为 Portfolio North Star 对 V0 的具体影响

V2 不应把功能前移，但应约束 V0 的最小接口：

1. `Attempt` 必须是一等对象，而不是日志里的 cycle label；
2. 每个 Attempt 必须有 `strategy_id`；
3. 恢复 Attempt 可有 `parent_attempt_id`；
4. Session 与 Workspace 必须挂在 Attempt 上，不应假设整个 Run 永远一对一；
5. Journal 每条事件至少能关联 `run_id`、`attempt_id`、`session_id`、`workspace_id`；
6. VerifierResult 和 Failure Packet 需要 artifact identity，而不是只保留一段反馈文本；
7. Budget 是 Run 全局预算与 Attempt 局部预算的组合；
8. Outcome 必须区分 task failure、infrastructure/evidence invalid 和 budget/abort；
9. Strategy 配置必须能表达 Skill overlay、Completion Policy 和 Recovery Route，但 V0 不实现 Router；
10. 比较关系应作为可选 `comparison_group_id` 或报告查询，不写死到执行对象。

这十项都是“保持可演进”，不是“提前实现 V2”。

---

## 7. 可能阻碍 V2 的旧命名和数据结构

| 现有 Spike 名称/形态 | 风险 | V0 建议 |
| --- | --- | --- |
| `PairManifest` / `PairOutcome` | 暗示所有 Run 必须成对 | 改为独立 Run；Comparison 是可选聚合 |
| `Variant = baseline | candidate` | 无法自然表达 skill-only、多条恢复 route | 使用稳定 `strategy_id` |
| `runId = g006-baseline/candidate` | Run identity 与策略混在一起 | Run ID 只标识执行，Strategy 单列 |
| 一个 `attempt` 包含两个 variant | 无法表达父子恢复 Attempt | 一个 Attempt = 一个有界 Agent Cycle |
| `cycle = initial | verification_recovery` | 只支持一条固定恢复路径 | cycle 可保留为事件阶段，但正式 lineage 用 Attempt |
| 一个 Run 只对应一个 Session | 新 Session 恢复无法表达 | SessionRef 挂到 Attempt；允许不同 Attempt 复用或替换 |
| 一个 Variant 只对应一个 Workspace | 干净 Workspace 恢复无法表达 | WorkspaceRef 挂到 Attempt；记录 parent/source digest |
| `RunSessionLink` 一对一 | 多 Session 路线被结构性阻塞 | 改为 AttemptSessionRef，Run 做汇总 |
| Candidate 特有 recovery 字段 | Skill-only 被当成非正式旁路 | 所有策略使用同一 Attempt/Outcome 合同 |

**Decision.** 不删除 G003/G006 历史证据，也不回写它们的语义；只在正式 Workbench 合同中采用新命名，并提供一次显式的 Spike-to-V0 mapping。

---

## 8. 旧基础设施中仍然必要的部分

### 8.1 必须进入或服务 V0

- 固定 Pi Commit 与 MIT License 记录；
- 标准 emitted-package 构建和 artifact-backed model-data 开发边界；
- 公共 Direct `AgentHarness` Adapter；
- `subscribe(...)` lifecycle 观察；
- 严格 TypeScript consumer；
- 受限 Workspace 和工具注入；
- Pi Session 及其与 Run/Attempt 的关联；
- closed-envelope Journal v2 思想；
- settled 后外部 Verifier；
- Verifier、Task、Source、Workspace、Model、Tool Profile digest；
- Budget/Timeout/Abort/terminal reason；
- secret、reasoning body 和 credential 持久化边界；
- Invalid Evidence 与 Agent Failure 分离；
- G003 Faux Fixture、G006 real-route fixture 和 Gate 回归思想。

### 8.2 需要简化或后移

- G006 的硬编码 Pair Driver 只作为证据样例，不移入产品；
- `compare` 不作为 V0 唯一入口；
- Provider-specific reasoning continuity 只保留最小 redacted metadata，不建通用 reasoning store；
- Registry raw response 不进入 Runtime；
- 不为报告完整度建设 Dashboard、SQLite、复杂 Schema 浏览器；
- 不把 model-data 获取脚本包装成 Workbench 用户功能；
- 不在 V0 建 Experience/Skill Registry、Router 或自动 Promotion；
- Worktree、cross-process resume、long-running tool cancellation 由具体需求触发。

### 8.3 不应删除

G001–G006 Contract、Report、Closeout、ADR、Spike 和失败证据都应保留。它们是为什么选择当前边界的审计链，不能因为正式 V0 Schema 改名而重写历史。

---

## 9. 绑定审查已解决的路线冲突

1. 拒绝新建只为追逐失败的 Phase 3B；真实 Recovery 只在自然 V0/V1 Run 中观察。
2. SearchCLI 推迟到具体 Goal 确实需要高级 Plan、Checkpoint 或 Candidate/Apply 时，不阻塞 V0。
3. Claude Code 镜像在版本、来源和许可证补齐前只读研究，不作为直接复制或移植来源。
4. V2 North Star 要求 V0 保留 lineage，但不要求 V0 立即实现跨进程 Resume、新 Session Recovery 或 Router。
5. 每个主要 Goal 必须包含真实 Coding Task，但 V0-A 使用确定性 Faux Provider，真实模型调用数冻结为 0。
6. V0 固定拆为三个 Goal：V0-A、V0-B、V0-C；实现由新的专用 Goal Session 执行。
7. `CURRENT_STATE.md` 仍保留 G006 后的待决快照；本轮未授权修改它。当前接受决定以正式 V0 Charter 和 `09_对接执行、文件权威与验收规则.md` 为准，待用户另行授权时再同步状态文件。

---

## 10. 对交接包的异议和修正建议

### 10.1 接受的部分

- 接受 V0–V5 的版本层级；
- 接受 V1 的三路公平比较；
- 接受 V2 是 Portfolio North Star；
- 接受 V3 的受控经验闭环；
- 接受许可证允许时可直接依赖、移植、重写或行为复现；
- 接受范围控制不是项目最终定位；
- 接受外部资料不能覆盖本地工程事实。

### 10.2 需要修正的部分

- “Adaptive” 必须附带证据、预算、回归和人工 Promotion Gate；
- SearchCLI 不应在没有 canonical identity/license 时写成“立即获取”的既定结论；
- Claude Code 源码镜像必须标为 `unversioned_local_snapshot / license_unverified`；
- `cc-harness-knowledge` 没有仓库 License，使用时要区分用户笔记与其中转述的第三方证据；
- V2 兼容性应通过 ID/lineage 合同实现，不通过提前建设 V2 Runtime；
- V0 正式数据模型不能继承 G006 的 Pair-specific 命名；
- 原总纲的精确文件名引用需要在未来控制文档更新时改成真实路径。

### 10.3 推荐的总路线

```text
三份草案已审查并正式收口
→ 用户冻结 V0 Charter 与 scoped Pi Go
→ V0-A Contracts / Workspace / Pi Adapter
→ V0-B Execution / Evidence / Verifier
→ V0-C Completion Mechanism / Inspect / Real Use
→ V1 Baseline vs Skill-only vs Skill+Runtime
→ V2 bounded same-session vs clean-session recovery
→ V3 controlled experience reuse
```

---

## 11. 本报告没有做什么

- 没有修改 `CURRENT_STATE.md`；
- 没有修改 ADR、Goal Contract、Pi 或项目源码；
- 没有创建 `workbench/`；
- 没有调用真实模型；
- 没有下载、克隆或修改参考资料；
- 没有创建或激活 Goal；
- 没有提交 Git；
- 没有由本报告自行接受任何推荐；第 12 节的 Accepted Decisions 全部来自用户后续绑定审查。

---

## 12. Accepted Decisions

```yaml
accepted_decisions:
  - decision: freeze_scoped_pi_go_for_v0
    evidence: G001 public-source route + G003 deterministic dynamic pass + G006 real provider/tool/session/verifier pass; zero Pi Core patches
    options: [accept_scoped_go, request_one_bounded_architecture_check, reject_direct_pi_for_v0]
    accepted_value: accept_scoped_go_at_the_pinned_commit_with_adapter_boundary_and_upgrade_review_trigger
    consequence: accepting allows a formal workbench Goal; rejecting requires a new runtime comparison before implementation

  - decision: choose_v0_tool_profile
    evidence: G006 proved injected restricted tools; a usable coding workbench needs broader local read/search/edit/write/test capability
    options: [bounded_local_coding_profile, g006_style_fixed_tools_only, broader_shell_and_package_profile]
    accepted_value: bounded_local_coding_profile_without_network_install_git_commit_or_out_of_workspace_write_by_default
    consequence: too narrow prevents real use; too broad expands security and durability scope

  - decision: choose_system_prompt_source
    evidence: G006 used a project-owned minimal prompt; Claude mirror provenance/license is unresolved; V1 requires a stable common base
    options: [project_owned_minimal_base, pi_default_resource_prompt, user_supplied_per_task_prompt]
    accepted_value: project_owned_minimal_base_plus_separate_task_and_future_skill_overlays
    consequence: establishes fairness and attribution; changing it later requires experiment re-baselining

  - decision: acquire_searchcli_now
    evidence: no local SearchCLI exists and its canonical identity/license are not established; V0 Charter does not depend on it
    options: [defer_until_specific_v0_goal, authorize_bounded_read_only_acquisition_now, reject_source]
    accepted_value: defer_until_a_goal_selects_plan_dry_run_checkpoint_or_candidate_apply_semantics
    consequence: defer avoids blocking V0; immediate acquisition adds a focused research checkpoint before implementation

  - decision: localize_core_papers_now
    evidence: no papers are local; current Pi/V0 facts do not depend on them
    options: [defer_by_version_gate, authorize_minimal_primary_paper_set, authorize_full_research_pack]
    accepted_value: defer_bulk_acquisition_and_fetch_only_version_specific_primary_sources_before_V1_V2_or_V3_design
    consequence: preserves context and provenance discipline; immediate localization improves citation durability but adds no V0 proof

  - decision: choose_v0_goal_count
    evidence: V0 spans contracts/workspace, execution/evidence, and completion/user-use concerns
    options: [two_goals, three_goals, one_goal]
    accepted_value: three_bounded_goals_with_a_real_coding_task_in_each
    consequence: three goals improve audit and pause boundaries; one goal couples too many failure classes

  - decision: set_real_model_budget
    evidence: G006 route cost was small but cost/time/request controls are reliability evidence, not only billing protection
    options: [per_goal_hard_cap, one_shared_v0_cap, no_paid_call_in_v0]
    accepted_value: V0_A_zero_calls_V0_B_one_run_cost_cap_1_USD_V0_C_one_run_cost_cap_2_USD_total_cost_cap_3_USD
    consequence: explicit caps make invalid/retry handling auditable; no real call leaves V0 usability partially unverified

  - decision: include_worktree_in_v0
    evidence: G003/G006 used isolated copied workspaces; no current failure requires Git worktree semantics
    options: [defer_with_workspace_provider_boundary, require_worktree_now, exclude_worktree_entirely]
    accepted_value: defer_implementation_but_keep_a_workspace_provider_boundary
    consequence: avoids lifecycle complexity now while preserving a later real-repo adapter

  - decision: implement_completion_mechanism_in_v0
    evidence: mechanism is deterministic-proven and route-feasible, while effectiveness remains unproven
    options: [implement_opt_in_bounded_mechanism, observe_only_v0, defer_all_completion_logic_to_v1]
    accepted_value: implement_observe_only_and_verify_then_recover_once_same_session_without_effect_claim
    consequence: gives V0 its reliability behavior and lets V1 compare it fairly; deferral makes V0 mostly a runner

  - decision: authorize_any_external_module_port
    evidence: Pi is MIT; cc notes and Claude mirror have no local license; SearchCLI/Youtu identities are not yet verified
    options: [none_now, authorize_case_by_case_after_provenance_review, broad_reuse_authority]
    accepted_value: none_now_then_case_by_case_source_version_license_attribution_and_behavioral_validation
    consequence: preserves legal and technical provenance without imposing an originality requirement

  - decision: accept_v0_outcome_and_failure_taxonomy_direction
    evidence: G005 proved evidence failure must not be reported as agent failure; G006 proved verifier and route evidence can be correlated
    options: [accept_draft_taxonomy, revise_before_charter_freeze, postpone_to_first_goal]
    accepted_value: passed_failed_invalid_cancelled_with_frozen_precedence_in_formal_charter
    consequence: postponement would let implementation silently define semantics

  - decision: set_v0_recovery_budget
    evidence: G003 used one deterministic recovery; no data establishes an optimal count
    options: [zero_or_one_by_strategy, always_one, configurable_unbounded]
    accepted_value: strategy_declares_zero_or_one_and_run_budget_remains_hard
    consequence: preserves bounded behavior and V1 comparability without claiming one is universally optimal

  - decision: timing_of_real_recovery_observation
    evidence: G003 proved the mechanism; G006 proved the real route but both variants initially passed
    options: [defer_to_natural_v0_v1_runs, create_new_forced_phase3b, require_before_v0]
    accepted_value: defer_to_predeclared_real_tasks_and_do_not_chase_a_failure
    consequence: avoids selection bias; real recovery remains explicitly unproven until naturally observed
```
