# V0–V2-B 阶段事实状态汇报

```yaml
status: fact_snapshot_for_external_research
as_of: 2026-08-07
control_head: b1c8cf6045a0118452734bdf3cbe7b65fcd645ac
accepted_implementation_through: V2_A
active_goal: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
v2_b_r1: immutable_paused_before_verifier
v2_b_r2: zero_call_implementation_in_progress_not_main_reviewed
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pinned_pi_package_version: 0.82.1
```

## 0. 报告边界

**Fact.** V0、V1、V2-A 已关闭并接受。当前可作为工程事实的源码上限是控制 Commit `b1c8cf6...` 中的已接受实现；V2-B R2 的独立 Implementation Session 已产生未提交源码和测试 Delta，但尚未经过 Main Review、Candidate freeze 或独立审计，因此本报告只把它记为“进行中”，不把其行为写成已具备能力。

**Fact.** 固定 Pi 位于 `.upstream/pi/`，Commit 为 `027a5847...`，工作树干净且未被本项目修改。Direct public `AgentHarness` 仍是当前主路线；Pi SDK、Extension、RPC 均未接入 Workbench。

## 1. 当前 Harness 架构

### 1.1 直接使用的 Pi 能力

| Pi 能力 | 当前实际用途 | 项目边界 |
| --- | --- | --- |
| `AgentHarness` | 执行模型循环、Tool Call/Tool Result 生命周期并等待 `settled` | Pi 负责 Agent loop；Workbench 不复制第二套 loop |
| `Session`、`InMemorySessionStorage` | V0/V1 的进程内会话执行状态 | V1 的完整原始 Session 不是长期 Memory |
| `JsonlSessionStorage`、`JsonlSessionRepo` | V0-B/C 的脱敏 evidence mirror；V2-A 的父 Session、fork Session、fresh Session 和原始字节 lineage | Workbench 负责把 Session 与 Run/Attempt/Workspace/Seed 关联 |
| Tool API、`NodeExecutionEnv` | 构造受限 read/write/edit/command Tool Profile 和文件执行环境 | Workspace 路径约束、protected/writable policy 由 Workbench 实施 |
| `loadSkills`、`formatSkillInvocation` | V1 通过 Pi 公共入口加载并冻结唯一 Skill 及其模型可见 wrapper | Skill 的来源、摘要、Windows 路径和 collision 检查由 Workbench 加强 |
| `pi-ai` model/provider API | Faux Provider 与固定 DeepSeek Provider 路径、usage/cost 输入 | Credential authority、预算、证据投影和终态由 Workbench控制 |

Pi 源码证据入口为 `.upstream/pi/packages/agent/src/index.ts`、`harness/agent-harness.ts#AgentHarness`、`harness/session/jsonl-repo.ts#JsonlSessionRepo`、`harness/session/session.ts#Session` 和 `harness/skills.ts`。这些均由 `@earendil-works/pi-agent-core` 公共导出面暴露。

### 1.2 Workbench 自己增加的能力

| 层 | 已实现能力 |
| --- | --- |
| Runtime composition | Direct Pi Adapter、固定 Provider/Profile、Tool Profile、调用/预算 authority、真实调用计数和 fail-closed terminal |
| Workspace | 临时复制、Windows canonical path/大小写/链接与 reparse 防逃逸、writable/protected 边界、树摘要和只读快照 |
| Identity | Task、Strategy、Experiment、Run、Attempt、Workspace、Session、Artifact、Recovery Group/Candidate 的显式 ID 与 lineage |
| Trace/Evidence | append-only Journal、write-once Artifact、摘要引用、reasoning/secret-safe projection、Evidence Index、终态和只读 Inspector |
| Verification | Agent `settled` 后运行外部行为 Verifier；Verifier 结果与 Agent completion 分离；据此生成 Outcome/Failure Packet |
| Checkpoint | V0/V1 主要是不可变证据快照；V2-A 新增 settled 失败边界上的 `RecoverySeedV2A`。它不是进程内存快照，也不提供 in-flight crash recovery |
| Branch | V2-A 的 A/B 是两个隔离 Workspace + 两个独立 JSONL Session 的逻辑恢复路径，不是 Git branch/worktree |
| Selection | 对两条 Candidate 执行 identity、isolation、lineage、terminal、budget、Verifier、protected/secret 等 hard gates；只选 passing Candidate，否则明确选择 `null` |

## 2. V1 Probe / Trace 现状

### 2.1 已有 Probe 与诊断面

| Probe / 诊断 | 关键 symbol | 能证明或发现什么 |
| --- | --- | --- |
| Treatment payload probe | `runTreatmentProbeV1`、`payloadDeltaProofV1` | 捕获真实 Faux callback 收到的首个模型请求；证明 B/C 初始 payload 字节相同、A/B 只增加冻结 Skill wrapper；检查 `settled → Verifier` 顺序、C-only child 和 host identity 泄漏 |
| Task/Verifier calibration | `calibrateTaskPackV1`、`verifierRejectsNonsolutionV1`、`assertTaskWorkspaceBoundaryV1` | 检测原始任务是否应失败、reference repair 是否重复通过、伪解是否被拒绝、protected-file shortcut 是否越界 |
| Skill loading boundary | `loadExactOneSkillV1`、`expectedSkillIdentityV1`、`assertNoSkillCollisionV1` | 检测 Pi loader diagnostics、Skill 数量/名称/描述/wrapper/source drift、链接/硬链接/路径逃逸/Windows alias/collision |
| Run/Attempt Inspector | `inspectV1RunCell` | 检测 Manifest/源码/Verifier/Skill/Prompt/Tool/Model identity drift，Attempt/Session/Workspace lineage 错误，非法 recovery、terminal/Journal 不一致，secret/reasoning evidence 污染 |
| Budget/usage diagnostics | `createPiRunHandleV1`、`V1C` typed local budget signals | 检测 dispatch 前预算拒绝、unknown/overflow usage、reservation/commit 不一致、Provider/Tool/Verifier/cost 超限与未闭合 pending 状态 |
| Pilot sequence/aggregate | `validatePilotLedgerV1B`、`aggregatePilotV1B` | 检测跳 cell、重复/缺失 terminal、未声明 replacement、重复 invalid cause、invalid ratio、处理导致的 invalid 被错误移出分母及 A/B/C fairness drift |

**Fact.** 这些机制能识别的是结构化 failure、效率异常和 trajectory integrity pathology，例如：请求或 Tool 次数异常、无效 usage、预算耗尽、额外 child/retry、Recovery 已触发但未改善 Outcome、来源/载荷漂移、Session/Attempt lineage 断裂、Verifier 与 terminal 不一致。

**限制。** 当前没有通用的语义轨迹 Judge、自然语言推理质量评分、自动“思维循环”检测或可学习的 Probe registry。V1 Trace 能说“发生了多少调用、何时验证、是否恢复、证据是否一致”，不能仅凭 Trace 断言“模型为什么这样思考”。

### 2.2 Trace 如何记录和持久化

- 每个 Pilot 有不可变 `manifest.json` 和 append-only `ledger.jsonl`；每次只启动 Manifest 中的下一个 cell。
- 每个 Run 写入 `journal.jsonl`、config 快照、Verifier input/output、Failure Packet（如触发）、`run-result.json`、`terminal-evidence.json`、`terminal.json`、secret scan 和 Artifact digest refs。
- V1 使用进程内 Pi `Session` 执行；长期保存的是 reasoning-safe 的初始 Provider payload projection、Attempt/Session ID、调用/Tool/usage/cost、Verifier 和 terminal 关系，而不是完整私密推理正文。
- Inspector 从磁盘原始工件重新派生结论；aggregate 只接受 Manifest 成员和 Inspector 有效的 terminal evidence。
- 已接受的 24-cell V1-C R2 Pilot 最终为 A `7/8`、B Skill-only `8/8`、C Skill + Runtime Control `7/8`；一条 C Recovery 被触发但未修复失败。该结论是固定协议内的描述性结果，不是统计显著性或普适 Skill 优越性证明。

## 3. V2-A 实际完成内容

### 3.1 Trigger、隔离、运行与比较

1. Primary Attempt 通过 Direct public `AgentHarness` 执行并等待 `settled`。
2. 外部 Verifier 若通过，Run 直接 terminal success，不创建 Failure Packet、Seed、Candidate 或 Selection。
3. Verifier 若有效失败，Workbench 在任何 Candidate 前 write-once 冻结：失败 Workspace snapshot、父 JSONL Session、Verifier、Failure Packet、Skill/Prompt/Tool/Pi/Workbench identity，形成 `RecoverySeedV2A`。
4. 从 Seed Workspace 创建两个内容摘要相同但文件 identity 独立的临时 Workspace：
   - A `continue_failed_session`：使用 `JsonlSessionRepo.fork()`，保留父 Session entries 和 parent lineage；
   - B `fresh_session_from_failure_seed`：使用 `JsonlSessionRepo.create()`，运行前 parent entries 为 0。
5. A/B 接收相同 Failure Packet、recovery prompt、Skill、Tool、Model、Verifier 和预算；两条路径都会运行，不因 A 的结果跳过 B。
6. 每条路径独立 `settled`、独立 Verifier、独立 terminal。`selectCandidateV2A` 先执行 hard gates，再按稳定顺序选择 passing Candidate；没有 passing Candidate 时选择 `null`。

### 3.2 已接受证据

**Fact.** V2-A 以零 Credential、零网络、零外部 Provider/model call 完成并通过聚焦独立审计。六个权威场景覆盖 initial pass/no-branch、A 胜、B 胜、两者均 pass、两者均 fail/none，以及一条 Candidate budget-stopped 时不得获选；Inspector/tamper regressions 另行验证证据无效的 Candidate 不能获选。

可供后续 refinement 研究使用的既有 Evidence 包括：

- 失败 Workspace snapshot、树摘要和独立文件 identity；
- 父 Session JSONL 原始字节、A fork 前字节、B fresh 空历史及最终 Session refs；
- `parent_attempt_id`、`strategy_id`、Recovery Seed/Group/Candidate ID；
- Failure Packet、prompt/Skill/Tool/Verifier/Model/Pi/Workbench 摘要；
- 每条 Candidate 的 usage、Tool、terminal、Verifier、初始/最终 Workspace 和 hard-gate结果；
- SelectionDecision、未选原因、append-only Journal、source inventory 与 read-only inspection fingerprint。

**限制。** V2-A 证明的是可审计的双路径机制和确定性选择，不是真实模型恢复效果，也没有证明 A 或 B 更优。

## 4. V2-B 目标与 R1/R2 状态

### 4.1 原计划验证什么

V2-B 原 Version Question 是：在一个不可变、Verifier-failed 的真实恢复边界上，能否从完全相同的失败 Workspace bytes 运行 A（继续失败 Session）与 B（fresh Session + Failure Packet/Skill），独立验证并选择 passing Candidate 或 `none`；同时用一个 initial-pass Negative 证明成功任务不会被无必要分支。

这验证的是“真实模型参与的双路径恢复机制与证据闭环”，不要求某条路径必须获胜，也不构成广泛策略效果统计。

### 4.2 R1 为什么没有成功

**Fact.** R1 `v2b-real-20260807-01` 通过 Gate H，并从冻结 Execution Baseline 走通真实 Direct `AgentHarness` route；首个 Primary Attempt 发生 8 次 Provider/model call、10 次 Tool Call，已知成本 USD `0.0004849208`。

第 8 个响应后，下一次 dispatch 的预算 reservation 被安全拒绝。R1 随即以 `paused_run_invalid` 停止，发生在外部 Verifier 之前，因此没有有效 initial failure、Recovery Seed、A/B Candidate、Selection 或 Negative evidence。另有一个 Inspector 误报：它把合法的 numeric `message.usage.reasoning` token metadata 当成私密 reasoning body；该误报不改变“R1 未到 Verifier”的核心事实。

R1 因此证明了真实 route、预算预留/usage/cost 归并和 fail-closed stop；没有回答 V2 Version Question。

### 4.3 R2 相比 R1 改了什么

已接受的 R2 Amendment 将“等待真实模型自然制造初始失败”改为两段式证据：

1. 用零真实调用的 deterministic Faux Provider，经同一 Direct Pi Tool/JSONL 生命周期写入一个已知局部实现；public/maintenance check 通过、target Verifier 失败且 Agent settled 后，冻结 controlled Recovery Seed。
2. 从该同一 Seed 启动真实 A/B；另外运行一个真实 `stable-format` Negative，要求 initial pass 且不创建任何 recovery object。

同时只做两项有界修正：允许在无 pending Provider/Tool/side effect、usage 已知且 Session/Workspace/evidence 已闭合时，把 dispatch 前预算停止送入一次 Verifier；以及只允许有限非负的 `message.usage.reasoning` 数值字段通过 evidence scan，仍拒绝 reasoning content/signature/secret/未知结构。

**当前状态。** R2 零调用实现正在独立顶层 Implementation Session 中进行。其源码/fixture/test Delta 尚未 Main Review、未形成 Candidate Commit、未审计，也没有任何 R2 真实 A/B/Negative 结果。因此不能声称 R2 已实现或 V2-B 已通过。

### 4.4 R2 是否还值得继续

**Recommendation：继续当前这一次严格有界 R2，但不扩充。** 该判断不以“已经开始”为理由：

- 若现在停止，已有证据足以让外部 Session 开始后续研究，也足以展示 V0/V1 和 V2-A 的确定性双路径架构；但简历中仍只能写“deterministic multi-path recovery substrate”，不能写“真实模型双路径恢复闭环”。
- 一次有效的真实 A/B + Negative，正好补齐当前 Portfolio North Star 中价值最高、且唯一明显缺失的事实：真实 Candidate execution、真实 cost/trace、真实 Verifier/Selection，以及 initial-pass no-branch。
- R2 已把未知收敛为一个 controlled Seed、两条路径和一个 Negative；不需要新增平台、第三路径或更多 Case，边际信息价值仍高于其当前复杂度和成本。

必须同步降低结论强度：controlled Seed 不是自然发生的真实模型失败；一次 A/B 也不能证明哪条策略总体更好。它只能证明“从一个可复核的受控失败边界，真实 A/B recovery 能按合同运行并选择 pass 或 none”。

若当前 R2 需要改变架构、增加 Case/第三路径、修改 Pi、切换 SDK/Extension/RPC、扩大预算/重试，或 focused audit 后仍需第二轮实质性设计修正，则应停止 R2 并以现有证据进入下一阶段研究，而不是继续追求漂亮结果。

## 5. 与后续 Harness State Modification 直接相关的现有基础

### 5.1 已有 persistent state

- Pi JSONL Session：V2-A 已持久化父 Session、A fork、B fresh Session 及其原始字节 lineage；V1 运行 Session 本身仍为进程内对象。
- Workbench state：Run/Attempt/Workspace/Session identity、Manifest、append-only Journal/sequence ledger、terminal/Outcome、Artifact refs、usage/cost/budget 和 Inspector 结果。
- Recovery state：Failure Packet、失败 Workspace snapshot、`RecoverySeedV2A`、Recovery Group、Candidate terminal、SelectionDecision。
- Configuration snapshot：Task/Strategy、instruction、Verifier、Prompt、Skill、Tool Profile、Model/Profile、Pi Commit 和 Workbench source digest。

当前没有独立的 Memory/Experience Repository、learned policy store 或跨任务自动晋升状态；Pi Session history、Failure Packet 和证据工件不能被反向描述成已经实现的长期 Memory。

### 5.2 Skill / Prompt / Agent configuration 入口

- Skill：tracked `fixtures/skills/v1/reliability-completion/SKILL.md`，通过 `loadExactOneSkillV1()` 调用 Pi 公共 loader；source、wrapper、路径和摘要写入 Manifest/Evidence。
- Prompt：`workbench/src/prompts/base.ts` 中固定 `SYSTEM_PROMPT_ID`、文本和 SHA；Task instruction 与 recovery prompt 同样落盘或摘要绑定。
- Agent/Model configuration：Manifest 固定 strategy、model/provider profile、thinking level、Tool Profile、budget、Skill/Prompt refs；Execution Port/Provider authority 在运行时注入依赖。
- Memory：没有独立加载/写入接口；若只依据当前代码，可用入口是受控 Skill、Prompt、Strategy/Manifest、Failure Packet 和 Session history，而不是任意 runtime self-edit。
- Pi SDK/Extension：只完成过兼容价值研究并保持延后；当前源码没有它们的 Adapter 或安装依赖。

### 5.3 可复用的 replay / regression 机制

- Faux Provider、固定 Task/Verifier/Skill/Manifest 和零调用 scenario matrix；
- V1 task calibration、payload delta/fairness proof、24-cell ledger/aggregate；
- V2-A `runV2A` 场景矩阵、Recovery Seed 工件、Selector 与 `inspectRunV2A` fingerprint；
- write-once Artifact + raw-to-derived Inspector，可在不调用模型时重放完整性和选择逻辑。

真实 Provider 输出不是确定性 replay；当前能可靠重放的是冻结输入、Faux/fixture 行为、Session/Workspace 工件和 Inspector 推导。

### 5.4 不宜大改的模块

- Direct public `AgentHarness` Adapter 边界；
- Agent completion、external Verifier 与 formal Outcome 的分离；
- Run/Attempt/Session/Workspace/Artifact/Seed/Candidate identity contracts；
- append-only/write-once evidence、reasoning/secret-safe projection 和 read-only Inspector；
- controlled temp-copy Workspace 与已审计 path policy；
- V2-A 的 Seed-before-Candidate 顺序、A/B common-input fairness、Selector hard gates 和 explicit `none`；
- 固定 Pi checkout、已接受的 V1 Task/Skill/Verifier fixtures。

## Relevant Files / Symbols

| 文件 / Symbol | 作用 |
| --- | --- |
| `CURRENT_STATE.md` | 当前接受状态、活动 Goal、R1/R2 控制边界 |
| `docs/reports/V1_CLOSEOUT.md` | 已接受的 24-cell A/B/C 结果和 V1 claims boundary |
| `docs/reports/V2_A_CLOSEOUT.md` | V2-A accepted evidence、审计链和未证明事项 |
| `docs/reports/V2_B_REAL_EXECUTION_REPORT.md` | R1 原始调用、预算、暂停点和缺失 Evidence |
| `docs/第二项目_Codex交接包_2026-07-30/V2_B_BOUNDED_R2_AMENDMENT.md` | 当前 R2 的 controlled Seed、A/B、Negative 与硬退出条件 |
| `.upstream/pi/packages/agent/src/harness/agent-harness.ts#AgentHarness` | Pi 公共 Agent loop、事件、Tool lifecycle、`settled` |
| `.upstream/pi/packages/agent/src/harness/session/jsonl-repo.ts#JsonlSessionRepo` | V2 父 Session create、A fork、B fresh Session |
| `.upstream/pi/packages/agent/src/harness/session/session.ts#Session` | Pi 会话上下文与持久化操作入口 |
| `.upstream/pi/packages/agent/src/harness/skills.ts#loadSkills` / `formatSkillInvocation` | V1 公共 Skill 加载和模型可见 wrapper |
| `workbench/src/workspace/temp-copy.ts#createTemporaryWorkspace`、`path-policy.ts#resolveWorkspacePath` | 隔离 Workspace 与文件操作边界 |
| `workbench/src/session/evidence-session.ts#EvidenceMirrorSessionStorageV0B` | reasoning-safe Session evidence mirror |
| `workbench/src/evidence/journal.ts#JournalWriterV0B`、`evidence/artifacts.ts` | append-only Journal 与 write-once Artifact |
| `workbench/src/verifier/runner.ts#runExternalVerifierV0B` | Agent 外部行为 Verifier |
| `workbench/src/pi/pi-adapter-v1.ts#runTreatmentProbeV1` / `payloadDeltaProofV1` | V1 模型请求公平性、Verifier 顺序和 C-only child probe |
| `workbench/src/experiment/task-pack-v1.ts#calibrateTaskPackV1` | Task/Verifier/reference/nonsolution 校准 |
| `workbench/src/skill/runtime-v1.ts#loadExactOneSkillV1` | 精确 Skill identity 与路径安全边界 |
| `workbench/src/run-v1.ts#executeV1RunCell`、`pilot-v1.ts#runNextPilotCellV1B` | V1 Run/Attempt/Trace 和 cell-at-a-time Pilot |
| `workbench/src/inspect-v1.ts#inspectV1RunCell` / `aggregatePilotV1B` | V1 原始证据检查与 A/B/C 聚合 |
| `workbench/src/contracts/v2-types.ts#RecoverySeedV2A` / `CandidatePathV2A` | V2 Seed、Candidate 与 Selection 数据合同 |
| `workbench/src/run-v2.ts#executeRunV2A` / `ExecutionPortV2` | Seed 冻结、Workspace 克隆、Session fork/fresh、双路径执行 |
| `workbench/src/recovery/selector-v2.ts#selectCandidateV2A` | hard-gate 后选择 passing Candidate 或 `none` |
| `workbench/src/inspect-v2.ts#inspectRunV2A` / `inspectionFingerprintV2A` | V2 raw-derived lineage、隔离、预算、Verifier 与 Selection 检查 |
| `workbench/src/pi/pi-run-handle-v2b.ts`、`run-v2b.ts`、`inspect-v2b.ts` | V2-B 真实 composition、序列与 Inspector；R2 变更仍处于未验收状态 |
