# V1-B Integrated Development Plan Draft

```yaml
document_status: accepted
document_type: main_session_integrated_development_plan
prepared_at: 2026-08-04
accepted_by_user: 2026-08-04
project: Agent Harness Reliability Workbench
version: V1
candidate_goal: V1_B_FROZEN_BOUNDED_REAL_PILOT
formal_goal_contract: false
goal_active: false
implementation_authorized: false
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
git_commit_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
```

> 本文件是用户已接受的主 Session V1-B 综合规划，不是正式 Goal Contract，不激活
> V1-B，也不授权源码修改、真实调用、凭据读取、外部网络或 Git Commit。
> 后续正式 Contract 必须在用户审查本规划及必要的 Charter 有界修订后另行起草、
> 接受与激活。

## 1. 结论先行

主 Session 对 V1-B 的推荐路线是：

```text
有限修订 V1 Charter 的 Session 描述
→ 正式起草并接受一个 V1-B Goal Contract
→ 激活 V1-B 并创建 Control Baseline
→ Stage 1：专用 Preparation Session，零真实调用、有限源码修改
→ Main Session 轻量验收并创建 Candidate Commit
→ 新的 Focused Audit Session 独立审计高风险边界
→ 必要时由原 Preparation Session 有界返修
→ Main Session 冻结 Execution Baseline
→ Stage 2：新的 no-source-edit Execution Session 执行冻结 Pilot
→ Main Session 验收结果、解释边界并与用户决定 V1 处置
```

V1-B 不应直接从 V1-A Implementation Baseline 进入真实 Pilot。

原因不是 V1-A 验收失败，而是 V1-A 已证明的对象与 V1-B 真正需要执行的对象
之间仍有一个具体、可界定的工程缺口：V1-A 已有固定 Provider profile、抽象
factory seam、确定性三臂协议、Manifest 和 Faux 证据，但尚无 tracked 的真实
public Pi `AgentHarness` composition、真实 Run-cell runner、Pilot ledger、V1 CLI
和从 terminal artifacts 独立验真的 Inspector。

因此，推荐在同一个 V1-B Goal 内增加一个零调用 Stage 1，而不是：

- 重开已经正确收口的 V1-A；
- 让看到真实结果的执行 Session 临时写 ignored adapter；
- 把 V1-B 拆成第三个默认 Goal；
- 为此引入 SDK、Extension、RPC 或通用 Provider/Eval 平台。

这个调整保留 V1 的原始两 Goal 结构，只纠正“真实可执行 composition 应在哪个
Stage 形成”的安排。

## 2. 当前事实与权威边界

### 2.1 仓库与控制状态

```yaml
root_head: 78d41add02172ef4c7b290909ff36a1a96cac053
root_head_subject: docs_close_V1_A_deterministic_substrate
v1_a_implementation_baseline: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
v1_a_implementation_tree: 680810b7c2f8b12dbd3503b5a38f1ab162b63996
v1_a_disposition: PASS_V1_A_DETERMINISTIC_SUBSTRATE
current_phase: v1_a_closed_pending_v1_b_contract
active_goal: null
v1_b_contract: not_created
v1_b_activation: not_authorized
v1_b_real_calls: 0
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_status: clean
```

本规划形成前的已知未跟踪内容为：

- 用户控制的 `reference/`；
- `docs/reports/V1_B_PRECONTRACT_READINESS_PAUSE_REPORT.md`。

本规划不改变 `CURRENT_STATE.md`、正式 V1 Charter、任何 Contract、Pi 或源码。

### 2.2 本规划依赖的主要证据

项目事实：

- `CURRENT_STATE.md`；
- `docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md`；
- `docs/第二项目_Codex交接包_2026-07-30/V1_A_GOAL_CONTRACT.md`；
- `docs/reports/V1_A_CLOSEOUT.md`；
- `docs/reports/V1_A_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`；
- `docs/reports/V1_A_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md`；
- `docs/reports/V1_B_PRECONTRACT_READINESS_PAUSE_REPORT.md`；
- 当前 tracked Workbench 源码和测试；
- 固定 Pi 源码与公开 emitted 路径。

本轮还按治理规则使用了两个只读专用分析角色：

1. **V1-B Source Readiness Specialist**：检查真实 composition、runner、CLI、
   V0-C 可复用符号和 Pi public route；
2. **V1-B Protocol/Governance Specialist**：检查 Session 权责、冻结顺序、
   Pilot 预算、invalid/denominator 和 focused audit 边界。

两者只提供建议。路线取舍、Scope、Goal 结构和最终规划均由主 Session 基于本地
源码重新综合。

## 3. V1-A 的经验教训及 V1-B 的绑定响应

V1-A 的价值不只在于交付确定性 substrate，也暴露了后续版本必须主动防止的
工程和治理误区。

| V1-A 经验 | 具体表现 | V1-B 规划响应 |
| --- | --- | --- |
| 测试全绿不等于 Contract 已被证明 | 初始 Candidate 的测试没有覆盖 fresh Windows checkout、完整 request model identity、credential error 和非法 usage | Stage 1 必须建立“Contract 条款 → 实现 → 正向测试 → 反例 → 证据”追踪表 |
| 冻结身份必须来自 Git 对象和 fresh checkout | CRLF 转换导致 fixture bytes、digest 和 Manifest 声明在新 worktree 不可复现 | Candidate audit 必须从精确 Commit 的 fresh Windows worktree 重算 source/fixture/Manifest/execution identity |
| 公平性必须覆盖真实请求，不是自选投影 | 初版 B/C 只比较了 prompt/messages/tools，遗漏 model/provider/api descriptor | V1-B 必须比较真实 Pi dispatch 前的完整 model descriptor、context、tools 和 relevant request options |
| 凭据不落 evidence 仍不代表错误安全 | fake credential marker 可经 transport/factory error 逸出 | 所有 resolver/transport/provider/public-handle 错误必须在边界统一净化，并用 marker 反例测试 |
| usage object 不能被动相信 | 初版 usage projection 接受负数、不一致和超预算数据 | token/request/tool/cost 必须有限、非负、内部一致，且在每次 dispatch 前预留、返回后校验 |
| 抽象 interface 不是已工作的真实路线 | V1-A 留下 `PublicPiHarnessFactoryV1` seam，但没有 tracked concrete factory/runner | V1-B Stage 1 必须形成真实 public Pi composition 和可执行 product surface，零调用验证后再冻结 |
| 修复者和验收者要分离 | V1-A finding 由原实现 Session 修复，再由 fresh audit Session 复审 | V1-B 沿用 Main → Implementation → Audit → original Implementation correction 的分工 |
| 微修不应触发全面重审 | V1-A 二次复审只覆盖 finding 与必要回归 | V1-B 返修后只复审受影响 finding；新证据表明非局部风险时才扩张 |
| Session 的工作树只是过程隔离，不是产品 Worktree 能力 | 审计 worktree 和 dependency junction 用于冻结身份与隔离，但不属于 Workbench 功能 | V1-B 不增加 Git Worktree 产品能力；每个 Run 使用既有 copied Workspace boundary |
| 专用 Session 启动也需要前置验真 | 两次 worktree 初始化异常未改变 Candidate，但说明不能假设自动创建一定成功 | 每个专用 Session 的 Gate A 必须核验路径、HEAD/tree、tracked clean、依赖复用目标和 Pi identity；失败即停，不以临时改仓库绕过 |

### 3.1 需要保留的 V1-A 成果

V1-B 必须继承而不是重写：

- 三策略：A Baseline、B Skill-only、C Skill + Runtime Control；
- exact-one hidden Skill 与 explicit `skill()` invocation；
- B/C initial treatment isolation；
- common external Measurement Verifier；
- only-C recovery rule；
- immutable Experiment Manifest 与 read-only aggregation；
- fail-closed Windows Skill/path boundary；
- fixed DeepSeek profile、外部 opaque credential injection 和 evidence redaction；
- accepted task/skill/verifier fixtures 和 identity rules；
- V0 accepted Workspace、Tool、Session、Journal、Verifier、Outcome 与 Completion
  components。

Stage 1 可以为真实执行扩展 V1-owned interfaces，但不得反向改写 V1-A 的历史
结论、原始 Manifest 或已接受证据。

## 4. V1-B 的任务定义

### 4.1 Mission

V1-B 的唯一任务是：

> 在冻结的真实 Pi、真实 Provider、任务、Skill、System Prompt、Tool、Verifier、
> Budget 和 Experiment identity 下，执行一次 4 tasks × 2 repetitions × 3
> strategies 的有界 descriptive Pilot，比较 Baseline、Skill-only 和 Skill +
> Runtime Control 的 observed task result、cost 和 guardrail behavior。

### 4.2 要回答的问题

1. 相对 A，B 的 frozen Reliability Skill 是否改变任务成功、成本或失败类型？
2. 相对 B-initial，C 在有效失败后的一次 same-Session recovery 是否产生额外
   改善，代价是多少？
3. Runtime treatment 是否引入新的 budget、evidence、protected-path 或
   terminalization 风险？
4. 结果是 `Promote`、`Revise`、`Reject` 还是 `Inconclusive`？

### 4.3 不回答的问题

V1-B 不证明：

- statistical significance；
- 普遍 Skill 有效性；
- production reliability；
- 多模型或多 Provider 泛化；
- autonomous Skill selection/routing；
- clean-Session/clean-Workspace recovery；
- V2 multi-path 或 V3 Experience lifecycle；
- OS sandbox、network egress blocking、durable resume 或 exactly-once tools；
- Pi SDK/Extension/Worktree 的全面兼容性。

## 5. 必要的有界 Charter 澄清

### 5.1 观察到的冲突

正式 V1 Charter §13.2 当前把 V1-B 描述为一个 no-source-edit Execution
Session，并在 Stage 1 中冻结候选；接受的 Charter 决策 BC-5 又要求 V1-B 开始前
已有 tracked fixed provider composition。

当前源码只有抽象 seam，没有能够执行完整真实 Pilot 的 tracked factory/runner。
若不澄清，未来执行 Session 只能：

- 越权编辑源码；
- 使用 ignored 临时 composition；
- 或在真实调用前因缺失 product surface 暂停。

三者都不应接受。

### 5.2 推荐修订

保持“V1 只有 V1-A、V1-B 两个默认 Goal”不变，将 §13.2 的 Owner 细化为：

```text
V1-B Stage 1 Preparation Owner
  = dedicated zero-call Implementation Session
  = 允许 Contract 列明的有限源码/fixture/test 修改
  = 不得读取凭据、联网或真实调用

V1-B Stage 1 Audit Owner
  = fresh focused independent Audit Session
  = 只读 Candidate，不修复、不提交、不改控制状态

V1-B Stage 2 Execution Owner
  = fresh no-source-edit Execution Session
  = 只从精确 Execution Baseline 和 immutable Manifest 执行真实 Pilot
  = 不得修改、暂存或提交源码/控制文件
```

核心不变量是：

> 看到真实 arm outcomes 的 Session 不得编辑项目源码、测试、fixtures、Manifest、
> Verifier、System Prompt、Skill、Policy 或控制状态。

这是一项有界治理澄清，不改变 V1 Mission、三策略、Pilot scale、Budget、Direct
`AgentHarness` 主路线或 no-default-V1-C 决策。

## 6. Session 分工

| 角色 | 负责 | 不负责 | 何时停止 |
| --- | --- | --- | --- |
| Main Session | 规划、Charter 澄清、Contract、Activation、基线 Commit、主验收、审计处置、最终 V1 结论、`CURRENT_STATE` | Stage 1 源码实现、独立审计、真实 Pilot | 需要用户新授权、Scope 扩张或架构 fork 时 |
| Stage 1 Preparation Session | tracked 真实 composition、runner、CLI、ledger、Inspector、Faux tests、报告和状态更新提案 | 控制状态、Git Commit、真实凭据/网络/Provider 调用、V1 效果结论 | 任一 Stage 1 Pause Condition 命中 |
| Focused Audit Session | 从精确 Candidate/fresh worktree 审计高风险边界与必要回归，写审计报告 | 修复、提交、改控制状态、真实调用、泛化审计 | finding 完整或证据不足需暂停时 |
| Original Preparation Session（仅返修时） | 根据 Main 接受的 finding 做最小修复和指定回归 | 自行扩大审计或接受 Goal | 有界修复完成后 |
| Stage 2 Execution Session | 读取冻结 Contract/Manifest，preflight，逐 cell 执行一次 Pilot，生成 evidence/aggregate/closeout draft/state proposal | 源码/测试/fixture/Manifest 修改、Git Commit、重跑、fallback、改变 taxonomy | 完成 Pilot 或命中 Pause Condition |
| Main + User final review | 解释结果、决定 V1 disposition、控制状态收口 | 改写真实结果或事后选择任务 | 接受、拒绝、修订或判定 inconclusive 后 |

### 6.1 不自动增加的 Session

- 不为 Stage 1 再开一轮泛化技术研究；现有源码证据足够起草 Contract。
- 不为每个微修开全新 Audit；返修交回原 Implementation Session，复审只看受影响
  finding。
- 不为 Stage 2 额外增加“结果美化/统计”Session。
- 不在 V1-B 研究 SDK、Extension 或成熟安装扩展；只有 Direct public route 出现
  具体阻塞，才回主 Session 触发已记录的兼容性检查点。

## 7. Stage 1 — Zero-call Execution Preparation

### 7.1 Stage 1 目标

将 V1-A 的确定性 substrate 转化为一个 tracked、可审计、可从精确 Commit 运行的
真实 V1-B 产品路径，同时保持：

```yaml
real_model_calls: 0
external_provider_calls: 0
credential_reads: 0
external_network: false
dependency_install: false
pi_core_patch: false
private_pi_import: false
```

### 7.2 最小技术增量

文件名由正式 Contract 冻结；当前推荐职责如下：

| 候选模块 | 最小职责 | 可复用基础 |
| --- | --- | --- |
| `pi/pi-run-handle-v1.ts` | 使用 public emitted Pi API 组成 fixed DeepSeek model + `AgentHarness`；支持 prompt/skill、同 Session child、usage/budget hook 和 close | Pi public `AgentHarness`、`createModels()`、`setProvider()`、`deepseekProvider`；V0-C `PiRunHandleV0C` |
| `provider/fixed-provider-v1.ts` | 把 one-use authority 明确定义为“一次 Run handle 创建权”，内部多轮 request 由同一预算 ledger 控制；净化错误，严格验证 usage | 已接受 V1-A profile/seam；V0-C real route semantics |
| `run-v1.ts` | 执行一个 Manifest cell：独立 Workspace、initial Attempt、Verifier、C-only child、Outcome、terminal evidence | V0-C `executeV0CRun()` 及 lower-level Workspace/Tool/Verifier/Journal/Evidence/Outcome components |
| `pilot-v1.ts` | 只按 immutable Manifest 选择 next cell，维护 write-once Pilot ledger、全局预算和 Pause 状态 | V1-A Manifest/membership；不建设通用 scheduler |
| `inspect-v1.ts` | 从 terminal artifacts 独立重建并验证 `RunResultV1`，拒绝 mixed/drifted/missing evidence | V0 Inspector/evidence validation；V1-A read-only aggregation |
| `product-surface-v1.ts` / V1 CLI | `preflight`、`run-next`、`inspect`、`aggregate` 等有界命令 | V0-C product surface/CLI pattern |
| V1 types/experiment | 增加 execution manifest、ledger、terminal/invalid/pause 和 budget contract | V1-A contracts；不修改历史 V1-A evidence |

实际实现应优先调用已接受的 lower-level V0 symbols，不复制 ignored V0-C UAT
composition，也不把 V0-C 的版本语义直接冒充 V1。

### 7.3 当前 seam 必须修正的问题

当前 `fixed-provider-v1.ts` 的接口不足以直接支撑真实多轮 AgentHarness：

- `FixedTransportV1.request()` 只表达字符串请求，不表达真实 messages/tools/tool
  calls/usage；
- `OneUseProviderAuthorityV1.requestReserved()` 第一次 request 后即消费，真实
  AgentHarness 可能需要多轮 Provider request；
- `PublicPiHarnessFactoryV1` 只有 `prompt/close`，未表达完整真实 Run lifecycle。

Stage 1 应保持“一次授权不能启动第二个 Run”的安全语义，但把 per-request 预算、
usage 和 terminalization 放入已授权 Run 内部，而不是把整个 Agent Run 错误压缩成
一次 Provider request。

### 7.4 Product surface 推荐

推荐采用“一个命令最多执行一个 cell”的可恢复边界：

```text
v1b preflight
v1b run-next
v1b inspect
v1b aggregate
```

`run-next` 必须：

1. 从冻结 Manifest 和 Pilot ledger 计算唯一 next cell；
2. 拒绝任意指定已运行 cell、跳过 cell 或覆盖证据；
3. 为该 cell 创建独立 copied Workspace；
4. 完成 initial Attempt，必要时在 C 的同 Session/Workspace 内创建唯一 child；
5. write-once terminalize 后才允许下一 cell；
6. 任何无法分类的中断写入 `paused`，不得自动 retry。

这避免依赖一个持续两小时的 Node 进程，也不要求 V1 解决跨进程 settled Session
重建。跨进程边界只发生在不同独立 Run 之间；C child 仍在同一进程、同一
Session、同一 Workspace 中完成。

### 7.5 Stage 1 必须新增的 execution identity

保留 V1-A deterministic Manifest 作为历史基线，另建 versioned V1-B execution
Manifest，不原位改写旧 Manifest。

新 Manifest 至少绑定：

- V1-A accepted Implementation Baseline；
- Stage 1 最终 Execution Baseline Commit/tree/source digest；
- Pi Commit/package version；
- protocol、task set、Skill、Verifier、System Prompt、Tool Profile digest；
- fixed Provider/model descriptor、thinking/decoding/request options；
- credential profile identity（不含 credential value）；
- per-attempt、per-run、whole-pilot Budget；
- planned 24 cells、Run ID derivation和 deterministic order；
- Failure Taxonomy、invalid attribution 和 denominator policy；
- terminalization/evidence schema version。

Manifest 是 immutable plan；运行中状态写入独立 append-only/write-once Pilot
ledger，不回写 Manifest。

### 7.6 Stage 1 确定性测试

最小测试集应覆盖：

1. 24-cell Faux zero-call end-to-end，所有成员可被唯一选择并 terminalize；
2. concrete public Pi factory 可用 fake dependencies 构造但 HTTP dispatch 为 0；
3. A/B/C 相同 task/model/tools/verifier/initial budget；
4. B/C initial 的完整 dispatch payload 与 model descriptor 相等；
5. A/B 永不创建 child；C 只在 valid failed Verifier 后创建至多一个 child；
6. child 前必须证明完整 recovery reserve；
7. 每个 Provider request/Tool call 前都进行全层级 reserve/check；
8. 8/12/65,536/300s/USD0.10 initial caps 与 C aggregate caps 正确区分；
9. whole-Pilot 24/32/256/384/USD2 cap；
10. one-use Run authority 的二次消费被拒绝，但一次 Run 内多轮合法；
11. terminal artifact、Inspector、Manifest membership、Pilot ledger 相互核验；
12. pause 后不能隐式选择 next cell；
13. error/Journal/Session/evidence 无 credential marker、reasoning payload；
14. unknown、negative、non-finite、inconsistent、over-budget usage fail closed；
15. fresh Windows checkout 的 fixture/source/Manifest identities 可重算；
16. narrow necessary V0-C 和 V1-A regressions 通过。

### 7.7 Stage 1 Gate 建议

```yaml
stage_1_gates:
  A_control_identity:
    - exact Control Baseline HEAD/tree
    - tracked clean
    - Pi exact and clean
    - registered reference untouched
  B_source_boundary:
    - only Contract-listed V1 files/tests/fixtures
    - no Pi/private import/dependency/network
  C_public_real_composition:
    - tracked concrete public AgentHarness factory
    - fixed DeepSeek profile
    - zero dispatch construction proof
  D_protocol_and_fairness:
    - complete B/C initial payload identity
    - exact three-arm semantics
  E_budget_and_authority:
    - per-request pre-reserve
    - Run/Pilot caps
    - no retry/fallback
  F_terminal_and_evidence:
    - write-once Run/Attempt/ledger
    - Inspector independent verification
    - secret/reasoning scan
  G_full_zero_call_simulation:
    - all 24 cells deterministic
    - C child rules and whole-pilot stops
  H_fresh_windows_and_regression:
    - Git blob/worktree identity
    - focused V1 plus necessary V0 regressions
  I_reports:
    - implementation report
    - source delta
    - commands and exit codes
    - evidence index
    - execution-baseline proposal
    - CURRENT_STATE_UPDATE_PROPOSAL
```

## 8. Candidate Freeze 与 Focused Independent Audit

### 8.1 Main Session 轻量主验收

Stage 1 返回后，Main Session 先检查：

- Scope delta；
- Gate/DoD traceability；
- 关键源码调用链；
- zero-call accounting；
- typecheck、focused tests、必要 regressions；
- Control/Charter/Contract/Pi/reference 未被越权修改；
- Execution Manifest 尚未绑定不存在的最终 Commit。

主验收通过且用户授权后，Main Session 创建 Candidate Commit，并将 exact SHA/tree
反馈给审计 Prompt。Preparation Session 不自行 commit。

### 8.2 为什么需要独立审计

Stage 1 将同时触及：

- 真实 Provider/credential authority；
- per-request 和 whole-Pilot budget stop；
- C-only recovery ordering；
- immutable Manifest/membership；
- write-once terminal evidence；
- hidden Verifier/protected path；
- Windows frozen identity。

这些正属于项目治理规则中应独立审计的高风险边界，因此本次 focused audit 是
必要的，不是机械地“每个 Goal 都审计”。

### 8.3 Audit 范围

审计只覆盖：

1. exact Candidate 和 fresh Windows checkout identity；
2. public Pi composition，不使用 private import/Pi patch；
3. complete initial request/payload/model fairness；
4. credential/error/reasoning sanitation；
5. usage/cost 和每次 dispatch 前预算 enforcement；
6. only-C child eligibility、ordering、lineage 和 reserve；
7. Manifest/ledger/terminal/Inspector write-once 一致性；
8. hidden Verifier、protected paths 和 evidence boundary；
9. targeted V1 tests 与必要 V0 regressions。

审计不做：

- 全量 Pi/V0 重新审计；
- SDK/Extension/Worktree 调研；
- general Windows sandbox 或安全平台审计；
- Skill effectiveness/统计结论；
- 真实网络、真实 Provider 或真实 credential 测试；
- 修复源码、创建 Commit 或更新控制状态。

### 8.4 Finding 处置

```text
Audit finding
→ Main Session 判断 finding 是否有效且是否在 Contract scope
→ 原 Stage 1 Preparation Session 做有界返修
→ Main Session 轻量复核并创建 corrected Candidate
→ 原 Audit Session 或新的 fresh audit context 只复审 finding + 必要 regressions
```

除非出现具体非局部证据，不重复整个 audit。

## 9. Execution Baseline Freeze

审计通过后仍不能直接调用模型。Main Session 必须：

1. 将 audited Candidate 正式接受为 V1-B Execution Baseline；
2. 用最终 Commit/tree/source digest 生成或重绑 V1-B execution Manifest；
3. 运行零调用 final preflight；
4. 创建并核验干净的 Execution Baseline Commit；
5. 记录所有 exact identity；
6. 生成 Stage 2 fresh Execution Session Prompt；
7. 等待用户对 Stage 2 credential/network/real-call/USD2 authority 的单独授权。

若 Manifest 的最终 Commit binding 需要在 Candidate audit 后写入，应采用两步冻结：

```text
audited source candidate
→ Main-only deterministic Manifest binding
→ no-source-change identity verification
→ Execution Baseline Commit
```

这一步只允许确定性 identity materialization，不允许改变 protocol、source behavior、
tasks、Skill、Verifier、model profile 或 budget；否则必须重新判断是否 re-audit。

## 10. Stage 2 — Frozen Real Pilot

### 10.1 Stage 2 前置条件

必须全部满足：

- V1-B Contract accepted and active；
- Stage 1 accepted；
- focused audit passed；
- exact Execution Baseline recorded and tracked clean；
- Pi exact and clean；
- immutable execution Manifest valid；
- 当前官方 DeepSeek API/model descriptor 可用性已进行只读复核；
- credential 由外部 opaque resolver 提供，未进入 domain/evidence；
- 用户单独授权 network、credential read、真实调用和 USD2 hard cap；
- Stage 2 Session 没有 source-edit、stage 或 commit authority。

当前 model/API 是时效性事实，必须在 Execution Baseline/Stage 2 前从官方来源复核，
但该复核不应提前阻塞 Stage 1，也不触发 SDK/Extension 调研。

### 10.2 冻结 Pilot

```yaml
pilot:
  tasks: 4
  repetitions_per_task: 2
  strategies: 3
  planned_initial_runs: 24
  maximum_C_child_attempts: 8
  maximum_started_attempts: 32
  statistical_claim: false
```

每个 task/repetition block 使用预先记录的 A/B/C deterministic permutation。
推荐 8 个 block 使用六种全排列各一次，再增加两个在各位置互不重复的排列，使每个
arm 在每个 order slot 中出现 2 或 3 次；精确顺序必须在真实 Outcome 前写入
Manifest，不根据结果调整。

### 10.3 三臂运行语义

#### A — Baseline

- base System Prompt；
- 无 Reliability Skill；
- initial Attempt 后运行 common Verifier；
- pass/fail 后均 terminalize；
- recovery 为 0。

#### B — Skill-only

- 与 C initial 完全相同的 base + explicit exact-one Skill invocation；
- initial Attempt 后运行同一 common Verifier；
- pass/fail 后均 terminalize；
- recovery 为 0。

#### C — Skill + Runtime Control

- initial model-visible request 与 B byte-equivalent；
- initial Attempt 后运行同一 common Verifier；
- pass 时 terminalize，不创建 child；
- 只有 valid failed VerifierResult、eligible failure、未命中 Stop Policy，且完整
  recovery reserve 可预先证明时，才在同 Session/Workspace 创建一个 child；
- child 结束后运行第二次 Verifier并 terminalize；
- Provider/infra/evidence invalid 不能伪装成 policy recovery eligibility。

`C-initial` 和 `C-final` 是同一个 arm 的两个分析 checkpoint，不是第四个 arm。

### 10.4 Budget

```yaml
per_initial_attempt_all_arms:
  provider_requests_max: 8
  tool_calls_max: 12
  token_max: 65536
  agent_wall_time_ms_max: 300000
  cost_usd_max: 0.10

per_A_or_B_run:
  verifier_runs_max: 1
  recovery_attempts_max: 0
  cost_usd_max: 0.10

per_C_run:
  provider_requests_max: 16
  tool_calls_max: 24
  token_max: 131072
  verifier_runs_max: 2
  recovery_attempts_max: 1
  wall_time_ms_max: 900000
  cost_usd_max: 0.20

whole_pilot:
  initial_runs_max: 24
  started_attempts_max: 32
  provider_requests_max: 256
  tool_calls_max: 384
  cost_usd_max: 2.00
  execution_time_ms_max: 7200000
  alternate_model_fallback: false
  retry_same_run: false
```

执行规则：

- 每次 Provider request、Tool call 和 C child 前先做原子 reserve；
- 不能证明预算充足时不 dispatch；
- unknown usage/cost 不被当作 0，而是 fail closed / pause；
- `USD 2` 是整个 Pilot 的硬上限，不是消费目标；
- no fallback、no same-Run retry、no automatic replacement。

Charter 的两小时时间项需要在正式 Contract 中明确为“累计 active execution
time”，推荐不把用户/Main Session 的人工等待时间计入 Provider runtime budget；
不得由 Execution Session看到结果后自行解释。

### 10.5 Failure Taxonomy 与 denominator

真实结果前至少冻结以下类别：

```yaml
result_classes:
  - task_pass
  - task_fail
  - treatment_caused_guardrail_failure
  - treatment_independent_infrastructure_invalid
  - evidence_invalid
  - budget_stop
  - paused_unclassified
```

绑定原则：

- 明确且预声明的 treatment-independent infrastructure/evidence invalid 可从
  effect success denominator 排除，但保留在 planned/started/invalid 统计；
- 由 Skill/Runtime 导致的 protected mutation、budget overrun、invalid completion、
  evidence corruption 或 terminalization failure 计入对应 arm failure/guardrail；
- 归因不确定时不得排除，写 `paused_unclassified` 并回主 Session；
- 同一 infrastructure 原因重复两次，或 invalid/infrastructure 达 started Runs
  的 25%，整个 Pilot 暂停；
- 24 planned cells 已用尽 Charter 的 initial-run cap，因此默认无 replacement；
- 任何 replacement 必须使用新 Run ID、保留原证据，并由 Main + User 先决定是否
  修订 Manifest/Contract 或进入条件式 V1-C。

### 10.6 Stage 2 证据与结束

每个 cell 必须 write-once 保存并交叉关联：

- experiment/manifest/cell/run/attempt/strategy/task/repetition/order identity；
- Workbench/Pi/source/task/Skill/System Prompt/Tool/Verifier/model digests；
- Session、Journal、Workspace、Tool、Provider、Verifier、Outcome refs；
- request/tool/token/time/cost ledger；
- initial/final Verifier checkpoint；
- C decision、eligibility、reserve 和 parent-child lineage；
- terminal/invalid/paused disposition；
- secret/reasoning/evidence scan result。

所有 planned cells 必须最终为 `terminal`、`invalid` 或 `paused`。一旦 `paused`
触发 Contract stop，不得为了凑满 24 个结果而继续。

## 11. Deliverables

### 11.1 Stage 1 Preparation Session

- `V1_B_STAGE1_IMPLEMENTATION_REPORT.md`；
- `V1_B_STAGE1_CLOSEOUT_DRAFT.md`（只关闭 Stage 1，不关闭 V1-B）；
- Source Delta；
- Commands and Exit Codes；
- Evidence Index；
- Contract traceability matrix；
- Execution Baseline/Manifest binding proposal；
- `CURRENT_STATE_UPDATE_PROPOSAL`。

不得直接修改 `CURRENT_STATE.md`、正式 Charter/Contract/control rule，也不得
stage/commit。

### 11.2 Focused Audit Session

- `V1_B_STAGE1_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`；
- audit-local ignored Evidence Index；
- findings with severity/boundary/counterexample/evidence/minimal correction owner；
- exact Candidate HEAD/tree、worktree/Pi/status、commands/exits；
- zero-call/network/credential accounting。

### 11.3 Stage 2 Execution Session

- `V1_B_PILOT_EXECUTION_REPORT.md`；
- `V1_B_AGGREGATE_REPORT.md`；
- `V1_B_CLOSEOUT_DRAFT.md`；
- raw/redacted evidence index；
- exact Commands and Exit Codes；
- planned/started/terminal/invalid/paused membership reconciliation；
- per-arm and checkpoint descriptive metrics；
- cost/usage/guardrail report；
- proposed `Promote` / `Revise` / `Reject` / `Inconclusive` disposition；
- `CURRENT_STATE_UPDATE_PROPOSAL`。

Execution Session 只提出 disposition，不自行接受 V1 或更新控制状态。

## 12. Main Session 验收 V1-B 的标准

主 Session 不机械重复全部实验，而是：

1. 检查 exact Execution Baseline、Manifest 和零 source delta；
2. 抽查至少一个 A、B、C-pass-or-fail 和 C-child（若发生）的完整 evidence chain；
3. 重跑 read-only Inspector/aggregator；
4. 对照 ledger 汇总 planned/started/attempt/request/tool/cost；
5. 检查 no retry/no replacement/no deletion；
6. 检查 invalid attribution 与 denominator；
7. 检查 secret/reasoning/protected-path scans；
8. 区分 observed result、Inference 和 Recommendation；
9. 确认没有把无 Recovery、全 initial pass 或某 arm 暂时领先错误当作实验失败；
10. 与用户决定最终 V1 disposition，再更新 `CURRENT_STATE.md` 和 Closeout。

若 Stage 2 未改变源码且 evidence/identity 一致，不自动再开一次 source audit；只有
出现具体 evidence conflict、terminal mismatch 或边界违规时才启用新的有限审计。

## 13. Pause Conditions

### 13.1 Stage 1 立即暂停

- 需要 Pi patch、private import、SDK/RPC/Extension 才能组成真实 route；
- 需要安装/下载依赖或 model data；
- concrete factory 无法在零 dispatch 条件测试；
- B/C complete initial dispatch 无法一致；
- per-request pre-budget 无法在 dispatch 前 enforcement；
- credential/reasoning 可进入 error、Session、Journal 或 evidence；
- protected source、Verifier、tests、acceptance 可被 Agent 修改；
- terminal/membership/ledger 无法 fail closed；
- Stage 1 开始建设 provider registry、通用 scheduler/eval platform、Worktree、
  V2/V3 功能。

### 13.2 Stage 2 立即暂停

- HEAD/tree/Manifest/Pi/model descriptor 任一漂移；
- credential/network/real-call authority 不完整；
- frozen source defect 需要修改代码；
- 任一 request/tool/token/time/cost cap 即将或已经越界；
- unknown usage/cost 无法安全归账；
- fallback、retry、replacement 或人工挑 cell 才能继续；
- B/C initial payload drift；
- Skill/Verifier/hidden acceptance/credential/reasoning 泄露；
- Agent 修改 protected file；
- invalid/infrastructure 达 25% 或同一原因重复两次；
- planned membership、write-once terminal evidence 或 Inspector 无法核对；
- 需要把 V1 扩成 V2/V3 或通用平台。

## 14. Pi SDK、Extension 和成熟扩展的影响

当前判断保持不变：

```yaml
direct_public_AgentHarness: V1_primary_route
sdk_extension_effect_on_V1_B: none
immediate_research_required: false
```

固定 Pi 已提供满足当前 V1-B 需要的 public route：public `AgentHarness`、model
registry/provider composition 和 DeepSeek provider。当前缺口属于 Workbench-owned
tracked composition、orchestration 和 evidence，而不是 Pi runtime 缺能力。

因此 V1-B 不因“避免重复实现”而改用 SDK/Extension。后续只在以下具体触发点评估：

- V1 后要把已验证 Policy 包装成真实交互式 Pi extension；
- V2 clean-Session / clean-Workspace 需要现成 Session/Worktree 生命周期；
- Direct public route 出现具体权限、Session、Tool Result 或真实 Pi 形态缺口；
- 某成熟扩展有可核验来源、License、版本，且能直接解决已观察问题。

这项检查点不得阻塞 V1-B，也不得在 Stage 1 演化成 SDK/Extension abstraction。

## 15. 防止过度复杂化

### 15.1 必要复杂度

以下不是文档膨胀，而是 V1-B 真实实验可信度的最低要求：

- 零调用 preparation 与真实 execution 分离；
- 实现者与高风险审计者分离；
- immutable Manifest、write-once evidence 和 read-only Inspector；
- B/C complete request fairness；
- per-dispatch budget、credential sanitation；
- invalid attribution 和 no hidden retry；
- exact Candidate/Execution Baseline identity。

### 15.2 明确不做

- 不新增默认 V1-C；
- 不建数据库、Web UI、dashboard 或通用 scheduler；
- 不做多 Provider、多 Model registry；
- 不做通用 Skill registry/routing；
- 不做 Git Worktree 产品功能；
- 不做跨进程 in-flight resume；
- 不做 multi-path/clean-Session recovery；
- 不做自动 replacement/promotion；
- 不做大规模统计 benchmark；
- 不全面审计 Pi SDK/Extension。

总体上，V1-B 的实现复杂度被限制为：

```text
一个固定 Provider
+ 一个固定三臂协议
+ 四个固定任务
+ 一个 cell-at-a-time runner
+ 一个 append-only/write-once Pilot ledger
+ 一个只读 Inspector/aggregator
+ 一次 focused audit
+ 一次 frozen real Pilot
```

## 16. 完整控制顺序

```text
1. 用户审查本规划
2. 用户接受 Option A 和 Charter 有界 Session 澄清
3. Main Session 精确修订 V1 Charter/治理说明，保持 active_goal: null
4. 用户授权 V1-B Planning/Charter Amendment Baseline Commit
5. Main Session 创建并核验该 Commit
6. Main Session 起草 V1_B_GOAL_CONTRACT_DRAFT.md
7. 用户审查并接受正式 Contract；此时仍 not activated
8. 用户单独授权 V1-B Activation + Control Baseline Commit + Stage 1
9. Main Session 更新控制状态、创建干净 Control Baseline、生成 Stage 1 Prompt
10. dedicated Stage 1 Preparation Session 零调用实现并返回
11. Main Session 有限验收；必要 finding 交回原 Session
12. 用户授权 Candidate Commit
13. Main Session 创建 Candidate Commit，确认 exact SHA/tree
14. fresh focused Audit Session 独立审计
15. finding 存在时：Main 裁决 → 原 Stage 1 Session 修复 → corrected Candidate → focused re-audit
16. 审计通过后，用户授权 Execution Baseline Commit
17. Main Session 完成 deterministic final Manifest binding 和 Execution Baseline
18. Main Session 生成 fresh Stage 2 Execution Prompt
19. 用户单独授权 credential/network/real Pilot/USD2
20. fresh Stage 2 Execution Session 运行冻结 Pilot，返回报告后停止
21. Main Session 有限 evidence 验收并与用户决定 V1 disposition
22. 用户授权控制状态收口和 V1 Closeout Commit
```

每个 Commit 都由 Main Session 创建；专用 Implementation、Audit、Execution Session
均不得自行提交或修改正式控制状态。

## 17. 允许与不允许的最终 Claims

### Stage 1 通过后允许

- tracked public Pi real composition 和 bounded V1 product surface 已在零真实调用下
  通过确定性测试与 focused audit；
- frozen Pilot protocol、identity、budget 和 evidence boundary 已准备好执行。

不允许声称 Skill/Runtime 有效或真实 Provider route 已实际运行。

### V1-B 完成后按证据允许

- 在固定 Pi/DeepSeek/四任务/两重复/三策略条件下观察到的 descriptive result；
- Skill-only 与 Runtime Control 的 observed delta、成本和 invalid/guardrail；
- 是否发生自然 Recovery 及其 observed effect；
- Pilot 的完整 membership 和硬预算遵守情况。

仍不允许声称统计显著、普遍有效、production-ready 或 V2 multi-path 已完成。

## 18. 用户已接受的决策

```yaml
acceptance:
  accepted_by_user: 2026-08-04
  disposition: all_recommendations_accepted

accepted_user_decisions:
  - decision: accept_V1_B_Option_A_two_stage_owner_clarification
    evidence: V1_A has abstract provider seams but no tracked concrete real factory/runner/CLI; no-source-edit Stage 2 cannot create them
    options:
      - same_V1_B_goal_with_zero_call_preparation_then_frozen_execution
      - reopen_closed_V1_A_for_amendment
      - allow_execution_local_ignored_adapter
    recommendation: same_V1_B_goal_with_zero_call_preparation_then_frozen_execution
    consequence: preserves two-goal V1 and prevents the real-outcome Session from editing source

  - decision: retain_full_24_cell_descriptive_pilot
    evidence: accepted Charter scale covers four failure families and balances three strategies across two repetitions
    options:
      - retain_24_initial_cells
      - contract_shrinks_pilot_before_any_outcome
    recommendation: retain_24_initial_cells
    consequence: remains bounded under USD2 but supports only descriptive, not statistical, conclusions

  - decision: accept_cell_at_a_time_execution_surface
    evidence: cells are independent and C child can finish in-process; a single long process would add unnecessary durability risk
    options:
      - manifest_enforced_run_next_one_cell_per_command
      - one_process_runs_all_24_cells
    recommendation: manifest_enforced_run_next_one_cell_per_command
    consequence: restart between independent Runs is safe without claiming cross-process Session resume

  - decision: freeze_two_hour_cap_as_accumulated_active_execution_time
    evidence: human review and command-to-command pauses are not Provider runtime and may exceed two wall-clock hours
    options:
      - accumulated_active_execution_time
      - calendar_time_from_first_to_last_dispatch
    recommendation: accumulated_active_execution_time
    consequence: preserves a hard compute/runtime cap without forcing a fragile single-process Pilot

  - decision: require_one_focused_stage_1_audit
    evidence: Stage 1 changes credential, budget, recovery ordering, Manifest and terminalization boundaries
    options:
      - focused_independent_audit
      - main_review_only
      - full_general_reaudit
    recommendation: focused_independent_audit
    consequence: validates the actual high-risk delta without repeating the whole V0/V1-A review

  - decision: keep_Pi_SDK_Extension_checkpoint_deferred
    evidence: pinned Pi public AgentHarness/model/provider paths cover V1-B; current gap is Workbench-owned composition
    options:
      - defer_until_concrete_V2_or_real_Pi_integration_trigger
      - research_or_adopt_now
    recommendation: defer_until_concrete_V2_or_real_Pi_integration_trigger
    consequence: avoids blocking V1-B or duplicating abstractions while preserving later reuse review
```

## 19. 本规划之后的唯一建议下一步

用户已经接受本规划中的 Option A。主 Session 已完成一项很小的治理动作：

> 仅修订 V1 Charter §13.2 和相应 Session 控制说明，使 V1-B 明确包含 zero-call
> Preparation、focused Audit 和 fresh no-source-edit Execution 三个角色。

用户已单独授权 Planning/Charter Amendment Baseline Commit，以及该 Commit 创建
并核验后的 Contract Draft 起草。主 Session 应先完成并核验该 Commit，再起草
`V1_B_GOAL_CONTRACT_DRAFT.md`。

在此之前不得激活 V1-B、编写 Stage 1 源码、读取凭据、联网、调用模型、修改 Pi
或生成真实执行 Prompt。
