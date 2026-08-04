# V1-A Focused Independent Audit Session Start Prompt

```yaml
document_status: authorized_ready_to_execute
session_role: focused_independent_audit
goal_id: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
candidate_commit: e3ff98948b26187b48af61928b56e7cacb550d31
candidate_tree: 89cae1c2c3c091ddc2644fac9a2d28c5b1800e03
candidate_parent_control_baseline: c9f91057db60cf61dab0d3aa305564d498c89cd6
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
source_digest: 7b1d470910fa440aa634d303c153d8f3f2565b740905e79bc4a7f4af04d93246
workbench_tree_digest: 15d037296f4df63f43b554f0791fe9cc083cf6e32dcce138972a08bd274a9477
fixture_tree_digest: ac637c2801d7aa18908a932b21a5b6a912c6a85cb7ac43d14d731d45035f4892
manifest_id: cf5c368564a6633b3f225bf12bea8b23d0b7a4877724bcde740915ee22e43f13
source_repair_authorized: false
git_commit_authorized: false
control_state_modification_authorized: false
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
dependency_install_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
V1_B_authorized: false
```

你是 V1-A 冻结 Candidate 的独立、聚焦风险审计 Session。你不是实现 Session，
不得修复 Candidate，也不得接受或关闭 V1-A。你的唯一任务是从固定 Commit 审计
Contract Gate J 所列风险，运行必要的确定性回归，并提交可复核的 Audit Report。

## 1. 不可变审计对象

必须从下列 Commit 开始：

```text
e3ff98948b26187b48af61928b56e7cacb550d31
```

其 Git tree 必须为：

```text
89cae1c2c3c091ddc2644fac9a2d28c5b1800e03
```

其父 Control Baseline 必须为：

```text
c9f91057db60cf61dab0d3aa305564d498c89cd6
```

固定 Pi 必须为：

```text
027a5847901b5dde30270abaa1041046cd2b4b55
```

开始审计前，先确认当前审计 worktree 的 `HEAD^{commit}` 与 `HEAD^{tree}` 精确匹配。
若 Codex 为审计 worktree 创建了 audit-only branch，只要其 HEAD 仍精确指向上述
Candidate Commit 即可。不得自行 rebase、merge、cherry-pick 或改写 Candidate。

## 2. Gate A：先读后审

完整读取并遵守：

1. 仓库根 `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. `docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md`；
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
5. `docs/第二项目_Codex交接包_2026-07-30/V1_A_GOAL_CONTRACT.md`，尤其是
   §2、§4.3、§8–§16、§18、§20.2、§21、§22；
6. `docs/reports/V1_A_IMPLEMENTATION_REPORT.md`；
7. `docs/reports/V1_A_CLOSEOUT_DRAFT.md`；
8. `docs/reports/V1_A_MAIN_REVIEW_REPORT.md`；
9. `docs/reports/V1_A_MAIN_REVIEW_BOUNDED_CORRECTION_PROMPT.md`；
10. `docs/reports/V1_A_MAIN_REREVIEW_REPORT.md`；
11. `docs/reports/V1_A_MAIN_REREVIEW_MICRO_CORRECTION_PROMPT.md`；
12. `docs/reports/V1_A_FINAL_NARROW_REREVIEW_REPORT.md`；
13. Candidate 中本次新增或修改的 `workbench/`、`fixtures/` 和相关测试。

进入 `.upstream/pi` 或任何审计侧 Pi checkout 前，必须完整读取其中所有适用的
`AGENTS.md`。Pi 行为只能由固定源码、测试和实际命令证明，不能由 README 或参考
资料替代。

优先核验 Contract 固定的 public Pi chain：

- `packages/agent/src/index.ts` 的 public exports；
- `packages/agent/src/harness/skills.ts` 的 `loadSkills`、`loadSourcedSkills`、
  `loadSkillFromFile`、`formatSkillInvocation`；
- `packages/agent/src/harness/system-prompt.ts` 的 `formatSkillsForSystemPrompt`；
- `packages/agent/src/harness/types.ts` 的 `Skill`；
- `packages/agent/src/harness/agent-harness.ts` 的 `createTurnState`、`prompt`、
  `skill`、`executeTurn`、`handleAgentEvent`；
- `packages/agent/src/agent-loop.ts` 的 `runAgentLoop`；
- Contract 列出的相应 Pi tests。

## 3. Gate A 状态核验

记录以下实际结果：

- Candidate commit 和 tree；
- Candidate 父提交；
- 审计 worktree tracked/staged 状态；
- 根主仓库 Candidate HEAD（只读核对）；
- Pi HEAD 和 status；
- `reference/`、`.runs/`、凭据和控制文件没有被审计 Session修改；
- Candidate 报告中的四个固定 digest/ID 是否能由冻结文件重新计算或交叉验证。

如果 Candidate identity、Pi identity、授权或适用指令不一致，立即命中 Pause
Condition，不得继续把其他 Commit 当作审计对象。

## 4. 唯一允许的审计范围

严格按 Contract §21，仅覆盖以下十项：

1. public Skill body/wrapper 与 A/B/C treatment isolation；
2. B/C initial payload byte equality，以及 initial model context 中不存在 hidden
   policy/experiment identity；
3. exact-one Skill source/path/diagnostic/collision boundary；
4. V1 Skill source 影响到的 Windows alias/link/escape guardrails；
5. Experiment membership、source identity 与 immutable/read-only aggregation；
6. invalid attribution 与 denominator integrity；
7. hidden Verifier 与 protected-path boundary；
8. Provider authority、credential injection 与 evidence seam；
9. C-only intervention、valid failed VerifierResult ordering，以及不存在 ghost/extra
   child；
10. 证明上述边界所必需的 V0 regressions。

重点复查 Main Review 与两轮有界返修涉及的边界：

- empty Manifest、empty aggregate 必须 fail closed；
- source/fixture/workbench digest 即使被一致地协同漂移，也必须被冻结 authority 拒绝；
- 同一 authority 不能构造第二个 runtime/Provider authority；
- RR counterexamples 和相应 success-path 不得只验证测试自洽；
- audit test 必须尽量从公开/真实边界观察行为，不得通过复制生产逻辑制造同义测试。

## 5. 明确禁止扩展

不得扩展为：

- general Pi 或 V0 全面重审；
- broad Windows filesystem/security review；
- OS sandbox、DLP、durability 或平台设计；
- SDK、Extension、Worktree 兼容性研究；
- Skill effectiveness、统计显著性或 V1-B Pilot 设计；
- real Provider/API/model test；
- V1-B、V2 或 V3 实现/架构；
- Dashboard、database、scheduler、promotion 或通用 Eval 平台。

发现范围外改进建议时，只能记为非阻塞 observation；除非它直接证明 Contract
Pause Condition，不能把它升级为本审计 finding 或新 Gate。

## 6. 允许的命令与依赖复用

可以：

- 只读检查 Candidate source、fixtures、reports、Git metadata 和固定 Pi；
- 运行 Contract 指定的 strict TypeScript、V1-A deterministic tests、focused
  counterexamples、必要的 V0 targeted regressions；
- 需要时运行完整 `workbench` regression，但不要重复进行无关平台测试；
- 在审计 worktree 的 ignored `.runs/v1-a-audit/<candidate-sha>/` 中保存原始证据；
- 写唯一 Audit Report 到主仓库绝对路径：
  `D:/AI/AI_Projects/project2/docs/reports/V1_A_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`。

不得安装或下载依赖。若隔离 worktree 没有 `workbench/node_modules`，可以在先验证
绝对目标后，仅在审计 worktree 创建 ignored 的 `workbench/node_modules` directory
junction，复用：

```text
D:/AI/AI_Projects/project2/workbench/node_modules
```

这只是 audit-local setup，不得改 tracked source。固定 Pi 源码证据使用：

```text
D:/AI/AI_Projects/project2/.upstream/pi
```

如确定性 public emitted-package test 依赖已准备的本地 Pi 工件，可只读复用：

```text
D:/AI/AI_Projects/project2/.runs/v0-a/pi
```

不得因此安装、hydrate、联网、修改 Pi 或改变 package boundary。记录所有 junction、
绝对依赖路径和 setup 命令。

## 7. 零调用与只读控制边界

以下计数必须全部为 0：

```yaml
real_model_calls: 0
external_provider_calls: 0
external_network_calls: 0
credential_reads: 0
pi_core_patches: 0
private_pi_imports: 0
source_repairs: 0
git_commits: 0
```

不得读取 `.env` 或任何凭据。不得修改、暂存或提交：

- Candidate source/tests/fixtures；
- `CURRENT_STATE.md`；
- Charter、Contract、09 控制规则或 accepted ADR；
- V1-A Implementation Report 或 Closeout Draft；
- `.upstream/pi/`；
- `reference/`；
- 主仓库除指定 Audit Report 外的任何文件。

如果发现可修复 defect，只报告具体 counterexample、受影响 file/symbol/test、最小
返修边界和 required regressions；不得自行修复。

## 8. 审计方法与轻量原则

先做源码与证据 lineage 检查，再选择最小命令集验证高风险边界。已有 Main Review
通过的常规 success-path 不需要逐项重复；但不得仅复述其报告。至少应独立构造或
核验能够击穿错误实现的 negative/counterexample，并说明它为何独立于生产逻辑。

每个 finding 必须包含：

```yaml
finding_id:
severity:
contract_boundary:
file:
symbol:
test_or_counterexample:
observed_result:
expected_result:
evidence_path:
candidate_impact:
minimal_correction_owner: original_V1_A_implementation_session
required_regressions:
```

仅使用 `critical`、`high`、`medium`、`low`。单纯文档措辞、风格或范围外硬化不得
伪装成 blocking finding。

## 9. Pause Conditions

完整遵守 Contract §22。尤其在以下任一情况立即停止并提交
`PAUSE_FOCUSED_V1_A_AUDIT`：

- Candidate/Pi/控制身份不一致；
- 需要 install/download/network/model/credential；
- 需要 private import、Pi patch、SDK/RPC/Extension；
- public Skill exact-one、Windows identity、B/C payload equality、Verifier/protected
  boundary、Manifest/denominator 或 C child bound 无法在现有 Contract 内证明；
- 审计必须修改 source/control state 才能继续；
- 审计开始向 V1-B/V2/V3 或通用平台扩张。

## 10. 必须提交的结果

在以下主仓库路径生成：

```text
D:/AI/AI_Projects/project2/docs/reports/V1_A_FOCUSED_INDEPENDENT_AUDIT_REPORT.md
```

报告至少包含：

1. 审计 disposition：
   - `PASS_FOCUSED_V1_A_AUDIT`；
   - `REQUEST_BOUNDED_CORRECTION`；
   - `PAUSE_FOCUSED_V1_A_AUDIT`；
2. exact Candidate commit/tree、父 Baseline、Pi commit/status；
3. 固定 source/workbench/fixture digest 和 manifest ID 的交叉核验；
4. §21 十项范围逐项结论；
5. findings，或明确写明 `blocking_findings: 0`；
6. exact commands、working directory、exit codes 与关键输出；
7. audit-local evidence index；
8. source/control/reference/Pi delta 与零调用计数；
9. unverified items，明确区分范围外与证据不足；
10. 建议 Main Session 的下一控制动作。

报告写完后重新核验 Candidate source tree 未被修改、无 staged changes、无 commit、
Pi clean。然后立即停止，等待 Main Session 与用户验收。不得接受/关闭 V1-A，
不得更新 `CURRENT_STATE.md`，不得进入 V1-B。
