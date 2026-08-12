# V3.6 Recovery Integration Decision Review

```yaml
status: completed_read_only_decision_review
date: 2026-08-13
charter: C:/Users/HUAWEI/Downloads/第二项目_V3.6_Recovery集成决策审查.md
repository_baseline_commit: 257a5f504e7d634d0133211f6be3a1963bdcebff
repository_baseline_tree: db473471d09442d90d0367a2ca0554dbc191761d
case_evidence_audit: docs/reports/SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md
source_modified: false
real_model_calls: 0
new_rpg_or_coding_case: false
adapter_or_poc_created: false
final_recommendation: RECOMMEND_DO_NOT_INTEGRATE
```

## A. Current Facts

**Fact — V2 是真实存在、经过确定性测试与一次受控 real A/B 证据验证的 subsystem。** `executeRunV2A` 在 Primary settled 后运行冻结 External Verifier；只有 `failed` 才冻结 Recovery Seed、复制两个 byte-isolated Workspace、分别 fork parent Session / create fresh Session、逐臂执行 Verifier，再调用 hard-gated `selectCandidateV2A`。核心 seam 已导出：`ExecutionPortV2`、`prepareAndFreezeRecoverySeedV2`、`executeRecoveryCandidateFromSeedV2`、`executeRecoveryGroupFromSeedV2`、`selectCandidateV2A`、Inspector（`workbench/src/run-v2.ts:94,561,696,892,901`；`workbench/src/recovery/selector-v2.ts:27`；`workbench/src/inspect-v2.ts`）。`v2a-recovery.test.ts` 和 `v2b-r2.test.ts` 覆盖 public Session fork/fresh、Seed 先于 Candidate、Workspace 隔离、双路选择、tamper rejection 和 shared Controller seams。

**Fact — 这些 seam 不是 generic product Recovery API。** V2 Manifest 只接受冻结的 `v1-parse-duration` / `v1-stable-format` Task 与对应 Verifier，且装载固定 Task Pack、Skill、Verifier snapshot、Prompt、预算和 V2 evidence schema（`workbench/src/run-v2.ts:130-180,915-957`）。V2-B 的“薄 real composition”薄在替换 Execution Port，不是把 Controller 泛化到开放式任务；V2 Closeout 也只接受一个 controlled verifier-failed Seed 上的机制证据，real initial-pass/no-branch Negative 未完成（`docs/reports/V2_CLOSEOUT.md`；`docs/reports/V2_B_CLOSEOUT.md`）。

**Fact — V3.6 当前产品生命周期是：**

```text
Browser Task
→ Host validates registered Project / mode
→ Host creates Persistent Session + one managed Session Workspace
→ Host writes immutable Run Authority
→ Direct AgentHarness bounded Turn
→ Docker registered-command Tool execution
→ settled Manifest XOR authenticated typed finite-budget terminal
→ Session/Workspace/Run projection
→ ChangeSet from that Session's initial inventory to current Workspace head
→ User review
→ Host Apply / Discard / Export
```

Session 创建、Source/Workspace pin、Run Authority 与 dispatch 见 `InteractiveControlPlaneV36.createSession/submit`（`workbench/src/v36/authority-v36.ts:212-317`）；日常产品固定为 managed Workspace、Docker registered commands 与 host-owned budget（`workbench/src/v36/daily-product-v36.ts:54-119`）；ChangeSet 和 handoff 只接受该 Session 的 initial inventory、current managed Workspace head、Source preimage 与 Host context（`workbench/src/workspace/change-set-v36.ts:53-132,273-351`）。

**Fact — V3.6 没有可信的自动 Recovery Trigger。** 每个开放式 interactive Run 的 Authority、settled Evidence、typed terminal 和安全 Read Model都明确固定为 `verification_mode: unverified`、`formal_outcome: null`、`comparison/adaptation/promotion_eligible: false`（`workbench/src/v36/authority-v36.ts:269-315,344-390`；`workbench/src/contracts/v36-types.ts:65-164`）。Registered command 的 PASS/FAIL 只是局部命令观察，不是 formal Outcome；accepted terminal Closeout 明确禁止把它升级为 Run verification（`docs/reports/POST_V3_6_FINITE_BUDGET_TERMINALIZATION_CLOSEOUT.md`）。V3.6 Goal 2 的 frozen real Journey 有 task-specific Verifier，但那是固定验收 Case 的外层条件，不是 daily free-input product 的通用注册 Verifier 合同。

**Fact — V3.6 的 STOP/fail-closed 与 Recovery 触发域不可混同。** finite-budget terminal 是 non-settled、unverified、Apply-denied、same-Session-continuation-denied；只允许 Export/Discard，并可从未变化的 authenticated registered Source 创建 clean Session（`workbench/src/webui/application-v36g2.ts:24-64`；`workbench/src/v36/authority-v36.ts:320-341`）。未知 usage、pending Provider/Tool/side effect、tamper/integrity failure也不是可恢复的 valid Verifier failure。V3.6 deterministic tests 与 Engineering Stabilization Closeout验证的是正确停止和权威隔离，不是任务 Recovery。

**Fact — `SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md` 的结论未被重复执行。** 本 Review 仅采用其已冻结事实：V2 是 controlled real two-path Recovery 主 Case；V3.6 natural failure/Retest 是 Harness debug 与 correct-stop 证据；当前 V3.6 未集成 V2 Controller。其 `NO_NEW_CASE_NEEDED` 是 Case 审计结论，不替代本 Review 的产品集成判断。

## B. Compatibility / Cost Map

| Layer | Direct Reuse | Thin Adapter | New Design | Main Risk |
|---|---|---|---|---|
| Failure boundary | 仅 V2 的 valid External-Verifier FAIL gate | — | **是**：开放式 V3.6 需新的可信 failure / completion policy | 把普通错误、预算 stop 或局部 command FAIL 错当 Recovery authority |
| Recovery Seed | V2 write-once Seed/Failure Packet与完整性检查可复用为机制 | **是**：需把合法 V3.6 Run/Workspace/Verifier identity投影到 Seed | 若无合法 Trigger，Adapter本身无法成立 | Seed 由 unverified Run 或不完整 terminal 产生 |
| Session | Pi public JSONL fork/fresh primitive可复用 | — | **是**：V3.6 需定义 Primary→A/B→selected 的产品 Session lineage/publication | 新 branch lifecycle；selected/losing Session 的持续语义不明确 |
| Workspace | copy、普通文件、隔离与 digest primitives可复用 | — | **是**：V3.6 当前只有一个 Session-owned managed Workspace | Candidate Workspace 不属于现有 Session pin / current-head authority |
| Agent execution | Direct AgentHarness 与 injected `ExecutionPortV2` 可复用 | **是**：V3.6 Docker Tool/backend composition可适配 | 若保持 Trigger/Session不变则无需 Agent Loop 改动 | V2-B real port的 Tool/预算/任务合同与 V3.6 daily profile不同 |
| Verifier | V2 runner/VerifierResult可复用在已注册、task-specific Case | — | **是**：daily free-input 没有 generic trusted Verifier contract | 新 Verifier framework / hidden tests / LLM judge 均被 Charter禁止 |
| Selector | `selectCandidateV2A` 可直接复用其 hard-gate-first算法 | **是**：需映射 V3.6 usage/diff/evidence字段 | 不需新算法，但需先有可信 Candidates | V2 secondary ordering字段与 V3.6 budget/evidence schema不一致 |
| Budget / terminal | V3.6 typed terminal、quiescence、fail-closed可直接保留 | — | **是**：Primary+A+B 的授权、总量分配与每路 terminal需新产品语义 | 弱化现有 STOP、越过 daily hard caps或把 terminal后继续合法化 |
| ChangeSet / Apply | 现有 digest、scope、stale-preimage、Host Apply/Discard/Export primitives可复用 | — | **是**：selected Candidate必须先成为 authenticated Session Workspace head | 直接指向 V2 Candidate会绕过 Session initial inventory/current-head lineage |
| UI / Read Model | 现有 Session/Run/Changes安全投影模式可复用 | 结果展示本身可能是薄 extension | **是（上游数据模型）**：需发布 RecoveryGroup/Candidates/Selection/selected source | 这会改变 state publication，而 Thin Integration Gate要求其不变 |

分类说明：同一行可以同时存在“组件可直接复用”和“产品集成必须新增设计”。例如 Selector 算法可直接复用，但它所消费的 V3.6 Candidate authority目前不存在；ChangeSet primitives可直接复用，但 selected Candidate尚不是合法的 V3.6 ChangeSet来源。

## C. Main Blocking Issues

1. **没有可泛化的 valid Recovery Trigger。** V2 只在 External Verifier产生有效 `failed` 后分支；V3.6 daily product故意把开放式 Run保持为 unverified/null Outcome。把 registered command、Agent settled、ordinary tool/model error或 budget terminal升级为自动 Trigger都会新增 Failure/Completion policy，并削弱 accepted fail-closed边界。

2. **selected Candidate不能直接进入现有 ChangeSet/Apply lineage。** V3.6 ChangeSet认证的是一个 Session初始 inventory到该 Session当前 managed Workspace head；V2 A/B位于独立 Candidate Workspace。要让 winner成为结果来源，必须定义 branch Session/Workspace身份、winner publication、loser封存和 selected-head认证。这是新的 Session/Workspace/state-publication lifecycle，不是字段映射。

3. **预算与 terminal 是三轨编排问题，而非复用一个现有 cap。** V3.6 budget terminal终止当前 Session并拒绝 Apply/continuation；V2 Recovery Group则要求 Primary+A+B的组预算和每路 verifier-safe terminal。若产品化，需要新 Recovery authority和总预算分配，同时保证 unknown/pending/terminal/tamper仍停止；现有代码没有该组合语义。

以上均已能由当前源码与 accepted evidence确认，因此不适用 `DECISION_BLOCKED_BY_ONE_SPECIFIC_UNKNOWN`。

## D. Product Value

**Inference — 接入后的独有价值。** 当且仅当用户任务存在可信、task-specific、registered External Verifier时，产品可在一次有效失败后从同一 failed Workspace探索 retained-history与fresh-session两条路，独立验证并交付一个hard-gated winner。这比单路继续、单纯显示失败或人工重开 Session提供更强的恢复完整性和可比较证据。

**Fact — 不接入仍保留的能力。** V3.6 仍是可实际使用的 bounded interactive Coding Agent：Persistent Session、managed Workspace、Direct AgentHarness、Docker registered commands、typed finite-budget terminal、inspectable Diff/ChangeSet、Host Apply/Discard/Export、stale Source conflict与Source authority isolation均保留。V2也继续作为已验证、可审计的 controlled two-path Recovery subsystem / Future Work；没有证据价值被删除。

**Inference — 当前边际价值不足以抵消边界重开。** 由于 daily open task没有合法自动 Trigger，产品化收益只覆盖一个尚未建立的“registered verifier task”子域；为此需要先新增 Verifier/Completion policy、branch lifecycle、budget authority和winner publication。它会把项目从收尾重新带回功能/架构开发。

## E. Thin Integration Gate and Final Recommendation

```yaml
pi_core_change: false
agent_loop_change: false
new_recovery_algorithm: false
new_selector: false
new_verifier_framework: true
new_completion_policy: true
budget_policy_redesign: true
source_apply_authority_change: false_but_selected_source_authority_requires_new_design
state_publication_change: true
thin_integration_gate: failed
```

**Recommendation:**

```text
RECOMMEND_DO_NOT_INTEGRATE
```

当前项目收尾不把 V2 two-path Recovery 接入 V3.6 Interactive Product。该建议不是否定 V2，也不是因项目接近收尾而默认拒绝；它来自当前真实接口的不兼容：可复用的 Recovery算法、Selector、Pi Session primitive和ChangeSet primitive之外，至少还缺可信Trigger、产品branch lifecycle、三轨预算/terminal authority与winner publication。它们正是 Charter定义为“必须新增设计”、并排除在薄集成之外的核心边界。

V2 Recovery应保留为 accepted subsystem / Future Work。若未来另行授权，只有在产品先拥有可信的task-specific registered Verifier与明确的branch publication contract后，才值得重新评估；本 Review不设计该方案、不创建Adapter/PoC，也不授权实现或真实验收 Case。

## Review Boundary and Verification Record

- 只读检查 baseline identity、Git refs/worktrees、最新 `CURRENT_STATE.md`、Case Evidence Audit、相关 V2/V3.6 source、tests、正式 reports与Closeout。
- 未运行真实模型、Provider、网络、Credential读取或新的 RPG/Coding Case。
- 未运行实现性测试；测试结论引用 accepted Closeout，并通过当前 tracked test source核对覆盖意图。
- 未修改 source、fixtures、tests、Manifest、control state、accepted reports或historical evidence。
- 本报告完成后停止，等待 Main / User 决策。
