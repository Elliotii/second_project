# V2-A Dedicated Implementation Session Start Prompt

```yaml
status: authorized_for_dedicated_session_start
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
control_baseline_commit: 228973b7e7b826468c54b84f28faf8d9c0c33a6d
planning_baseline_commit: bd903c963b68ba2b13ab56c20a7515a63f681021
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
execution_owner: dedicated_v2_a_implementation_session
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
dependency_installation_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
dedicated_session_git_commit_authorized: false
```

你是第二项目的 dedicated V2-A Implementation Session。你不是 Main Session，也不拥有架构
接受、控制状态、Git commit、V2-A 最终接受或 V2-B 权限。

你的唯一任务是执行已接受的：

`docs/第二项目_Codex交接包_2026-07-30/V2_A_GOAL_CONTRACT.md`

在零凭据、零网络、零外部 Provider、零真实模型调用下，实现并验证：

```text
valid initial failure
→ immutable Recovery Seed before any Candidate
→ exactly two isolated Candidate paths from identical failed Workspace bytes
→ A retains parent Session history
→ B uses a fresh Session without parent history
→ both Candidates run and independently verify
→ hard-gate-first deterministic selection or explicit none
```

当 initial Verifier 已通过时，不得创建 Failure Packet、Recovery Seed、Candidate、Selection
或额外恢复调用。

## 1. Authoritative Workspace

只在以下 worktree 工作：

`C:\Users\HUAWEI\.codex\worktrees\7675\project2`

固定只读 Pi：

`D:\AI\AI_Projects\project2\.upstream\pi`

不要在 `D:\AI\AI_Projects\project2` 根仓库写实现，不要创建新 worktree，不要切 branch。

## 2. Gate A Must Run Before Any Source Write

先只读执行并记录 exact command、stdout/stderr 摘要和 exit code：

1. `git rev-parse HEAD` 必须严格等于
   `228973b7e7b826468c54b84f28faf8d9c0c33a6d`；
2. `git status --short` 中 tracked/staged 必须 clean；本 Prompt 是 Main 在 baseline 后生成的
   authorized untracked control artifact，可以存在，但不得被实现 Session 修改、暂存或提交；
3. `git merge-base --is-ancestor bd903c963b68ba2b13ab56c20a7515a63f681021 HEAD`
   必须成功；
4. `CURRENT_STATE.md` 必须显示
   `active_goal: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE`；
5. 正式 Contract 必须是 accepted/activated，owner 必须是本 dedicated Session；
6. Pi HEAD 必须严格等于
   `027a5847901b5dde30270abaa1041046cd2b4b55`，且 Pi status clean；
7. 不读取、打印、测量、规范化或验证任何 `.env`/Credential；
8. 不进行网络、依赖安装、Provider/model 调用或外部下载。

任何不一致立即停止，创建
`docs/reports/V2_A_PAUSE_REPORT.md`，保持 source delta 为 0，并返回 Main/用户。

## 3. Required Reading Order

Gate A 的只读身份检查后、修改 source 前，完整读取：

1. `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. `docs/第二项目_Codex交接包_2026-07-30/V2_VERSION_CHARTER.md`；
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
5. `docs/第二项目_Codex交接包_2026-07-30/V2_A_GOAL_CONTRACT.md`；
6. `docs/reports/V2_FAILURE_AWARE_BOUNDED_RECOVERY_PRECONTRACT_RESEARCH.md`；
7. `docs/reports/V1_CLOSEOUT.md`；
8. `docs/reports/V1_C_R2_MAIN_ACCEPTANCE_AND_V1_POLICY_DECISION.md`；
9. `docs/第二项目_Codex交接包_2026-07-30/V1_C_GOAL_CONTRACT.md`；
10. `workbench/README.md` 和 Contract 涉及的 current source/tests/scripts；
11. `fixtures/skills/v1/reliability-completion/SKILL.md` 及采用的 V1 task/verifier/strategy；
12. `.upstream/pi/AGENTS.md` 以及进入任何 Pi 子树时适用的全部 `AGENTS.md`；
13. Contract §4.3 指定的 Pi source/symbol/tests。

Pi 行为必须由 pinned source/test/actual command 证明。`reference/` 只读且不是 Pi 事实源；本
Goal 没有额外外部研究任务，不要因为参考建议扩大 Gate。

## 4. Binding Implementation Semantics

必须遵守：

- Direct public emitted `pi-agent-core` `AgentHarness` 保持主路线；
- 首选 public `JsonlSessionRepo` create/open/fork，并通过 fixed Windows deterministic Gate；
- 不使用 private import、Pi patch、SDK、Extension、RPC 或第三方 Pi Package；
- 使用当前受控 temp-copy/path-policy，不建设 Git worktree provider；
- valid failure 时，两条 Candidate 都必须实际运行，即使 A 已通过也不能跳过 B；
- 两条 Candidate 从 byte-identical failed Workspace Seed 开始；
- 两者即时恢复 prompt、Failure Packet、Skill、Policy、Model、Tool、Verifier、budget 相同；
- 唯一有意差异是 A 保留 parent Session history，B 不保留；
- A 必须使用独立派生 Session identity，不直接继续修改原父 Session；
- Candidate Workspace/Session 不得互相污染；
- Selector 先执行全部 Hard Gates；invalid、budget-stopped、Verifier-failed Candidate 不得获胜
  且不得从 Recovery Group 消失；
- 没有 eligible Candidate 时必须保存 `selected_candidate_id: null`；
- 不自动 apply/commit selected Workspace 到用户仓库。

不要把 fresh-process crash recovery、exactly-once Tool、通用 Durable Runtime、Scheduler、
Database、Experience Repository、Router、Skill mutation 或任意策略框架加入实现。

## 5. Allowed Writes

只允许 Contract §12.1 allowlist：

- V2 contracts/recovery/session/public Pi adapter/run/inspect/product-surface 的新文件或最小扩展；
- `workbench/src/cli.ts`、必要 evidence/workspace seams、`workbench/test`、`package.json`、
  `README.md` 的有界兼容修改；
- `workbench/tests/v2a-*.test.ts` 和必要 V2-A deterministic scripts；
- `fixtures/manifests/v2/**`、`fixtures/strategies/v2/**`；
- 必要的新 V2 task/verifier fixture；优先复用 V1 assets，且不得修改 V1 原件；
- `docs/reports/V2_A_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V2_A_CLOSEOUT_DRAFT.md`；
- Gate A 通过后才能创建 ignored `.runs/v2-a/**`。

不得修改或暂存：

- `AGENTS.md`、`CURRENT_STATE.md`、正式 Charter/Contract/治理文件；
- 本启动 Prompt；
- V0/V1 accepted source semantics、fixtures、Manifest、Skill、Verifier、reports/evidence；
- `.upstream/pi/**`、`reference/**`、`.env*`、`.git/**`；
- 运行时 Agent 不得修改 tests、Verifier、Manifest、Selection rule 或 acceptance criteria。

必须使用 `apply_patch` 编辑项目文件。不得创建 Git commit，不得 stage 文件。

## 6. Required Deterministic Evidence

至少证明 Contract §10 的十二个场景：

1. initial pass 不分支；
2. valid failure 在 Candidate 前冻结 Seed；
3. A pass/B fail 选 A；
4. A fail/B pass 选 B；
5. pass/pass 按固定 secondary rule；
6. fail/fail 选 none；
7. invalid/budget-stopped 不能获胜；
8. A 有 parent history、B 没有；
9. A/B same initial digest 且隔离；
10. Seed/evidence tamper 被拒绝；
11. first Candidate pass 后第二条仍执行；
12. Windows public emitted JSONL Session create/open/fork。

至少一条主链必须是真实 Workbench boundary 的 deterministic end-to-end Run，不能全部用手工
JSON 模拟。

执行 Contract 的 Faux budgets。预算命中是 typed terminal/ineligible 结果，不是提前宣布 Goal
完成的理由。禁止 retry、fallback、automatic replacement、第三 Candidate 或无限循环。

## 7. Required Gates and Verification

按顺序完成并记录 Gates A–I：

- A：identity/authority/clean baseline；
- B：public Pi Session primitive；
- C：Seed order/immutability；
- D：Workspace equality/isolation；
- E：Candidate fairness/Session delta；
- F：Selector scenario matrix；
- G：lineage/Inspector/evidence；
- H：strict TypeScript、V2-A suite、必要 V0/V1 focused regressions；
- I：deliverables、session boundary、zero real access、protected-state proof。

不要自行执行 Gate J；focused independent audit 只由 Main 在 Candidate freeze 后启动。

运行最窄必要命令。不得安装依赖、运行 broad Pi build/test 或进行联网搜索。若当前 accepted
workspace 已有依赖/runner，可只读复用；不得向 Pi 写 generated files。

## 8. Complexity and Decision Discipline

- 先实现 Contract 的最小闭环，不为报告完整性建设平台；
- 普通 allowlist 内 defect 可以修复并记录，不必为每个小错误停下；
- Specialist 建议、未验证 mature pattern 和“以后可能有用”不自动变成 Gate；
- 任何新增组件必须指出它直接满足哪个 Contract DoD；否则不做；
- 不能因步骤数量或 Faux budget 接近上限而在两条路径或 Version Question 未完成时提前 close；
- 不派生新的 implementation/research/audit Session。本 Session 是唯一 V2-A Implementation
  owner；独立审计由 Main 后续另行启动。

## 9. Pause Conditions

命中正式 Contract §17 任一条件立即停止。尤其包括：

- 无法在 Candidate 前冻结 Seed；
- A/B 起点不同、串扰或公平变量无法分离；
- Direct public route 需要 private import/Pi patch/SDK/Extension；
- Agent 可触碰 Verifier/Manifest/Selection/control state；
- Selector 无 passing Candidate 仍强选；
- invalid/budget Candidate 消失；
- secret、raw sensitive data 或 immutable evidence boundary 失守；
- 需要 allowlist 外实质 source、联网、下载、安装、凭据或真实调用；
- 实现开始扩张为通用平台。

Pause 时只写 `V2_A_PAUSE_REPORT.md`，说明 observation、evidence、impact、source delta、所有
外部访问计数和需要 Main/用户决定的选项；随后停止。

## 10. Final Deliverables and Stop Point

完成后提交给 Main（不做 Git commit）：

1. `docs/reports/V2_A_IMPLEMENTATION_REPORT.md`；
2. `docs/reports/V2_A_CLOSEOUT_DRAFT.md`；
3. `.runs/v2-a/evidence/EVIDENCE_INDEX.md`；
4. Source Inventory 和 Source Delta；
5. exact Commands、Exit Codes 和测试计数；
6. authoritative deterministic Run/Recovery Group IDs；
7. Gates A–I 与 DoD 逐项证据；
8. protected/control/Pi/reference unchanged proof；
9. zero Credential/network/external Provider/model/real-call proof；
10. unverified items、scope deviations 和 Claims Boundary；
11. `CURRENT_STATE_UPDATE_PROPOSAL`，但不得修改 `CURRENT_STATE.md`。

建议 disposition 只能是：

- `PASS_V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE`；
- `REVISE_V2_A_BOUNDED`；
- `PAUSE_V2_A_ARCHITECTURE_DECISION`；
- `REJECT_V2_A_ROUTE`。

完成交付后立即停止，等待 Main Session 轻量验收。不得自行接受 V2-A、创建 Candidate Commit、
启动 Audit、进入 V2-B 或调用真实模型。
