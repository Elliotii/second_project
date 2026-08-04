# V1-A Focused Independent Re-audit Session Start Prompt

```yaml
document_status: authorized_ready_to_execute
session_role: focused_independent_reaudit
goal_id: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
corrected_candidate_commit: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
corrected_candidate_tree: 680810b7c2f8b12dbd3503b5a38f1ab162b63996
failed_candidate_commit: e3ff98948b26187b48af61928b56e7cacb550d31
control_baseline_commit: c9f91057db60cf61dab0d3aa305564d498c89cd6
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
authorized_findings:
  - F-001
  - F-002
  - F-003
  - F-004
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

你是 V1-A corrected Candidate 的全新、独立、轻量 focused re-audit Session。你不是实现 Session，不得修复源码、接受或关闭 V1-A，也不得扩展为全面审计。你的唯一任务是从精确冻结提交独立复核原审计 F-001 至 F-004 的关闭情况及最小必要回归，然后提交报告并停止。

## 1. 不可变审计对象

开始时必须确认：

```text
HEAD^{commit} = 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
HEAD^{tree}   = 680810b7c2f8b12dbd3503b5a38f1ab162b63996
Pi HEAD       = 027a5847901b5dde30270abaa1041046cd2b4b55
```

审计必须在新建的 fresh Windows worktree 中进行，并记录 `git config --get core.autocrlf`。F-001 的有效证明要求该 worktree 确实由 `core.autocrlf=true` 的 checkout 形成；若不是，立即暂停，不得通过修改 Candidate 或全局 Git 配置伪造条件。不得 rebase、merge、cherry-pick 或改写 Candidate。

先读取并遵守：

1. 根 `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. `docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md`；
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
5. `docs/第二项目_Codex交接包_2026-07-30/V1_A_GOAL_CONTRACT.md`，尤其 Gate J、DoD、Pause Conditions；
6. `docs/reports/V1_A_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`；
7. `docs/reports/V1_A_POST_AUDIT_BOUNDED_CORRECTION_PROMPT.md`；
8. `docs/reports/V1_A_IMPLEMENTATION_REPORT.md` 的最新 post-audit correction 部分；
9. `docs/reports/V1_A_CLOSEOUT_DRAFT.md` 的最新 post-audit correction 部分；
10. corrected Candidate 中本次变化的 `.gitattributes`、V1 Manifest、Pi adapter、fixed provider、evidence script 与 V1-A tests。

进入 `.upstream/pi` 前必须完整读取其中适用的 `AGENTS.md`。Pi 行为只由固定源码、测试和实际命令证明。

## 2. 唯一允许的复审范围

只复核下列四项及其最小必要回归：

### F-001 — fresh Windows checkout 与 digest authority

- 在 fresh `core.autocrlf=true` worktree 中确认所有 tracked `fixtures/**` 文本路径实际为 LF、无 CRLF；
- 逐项确认 worktree bytes、Git blob/prospective clean bytes、Manifest bindings 及报告引用的 source/workbench/fixture digest 和 Manifest ID 一致；
- 确认 `.gitattributes` 只增加有界 LF checkout 规则，accepted V0 fixture blobs 相对父 Candidate 没有内容变化；
- 不得以重新写入 fixture 或修改 Git 全局设置达成通过。

冻结的修复身份应交叉核验为：

```text
source_digest:              8702ac87651808e30f971e27dbcb64dfb4c8a2c1ca4ceb28e124978042b7ea59
workbench_inventory_digest: a20c910330ef886a7c519deac2f6bfebb097215e970d1e30babe28ac50f8fa7b
fixture_inventory_digest:   cf0d88930491e8d9bfded909be490960b6eb995549abae274b8c81685aa68c06
manifest_workbench_digest:   aab587b0c7371964ad89ecfc9304720757d7243dc457b904d5e91956eb0bc5d2
manifest_id:                 c59cc2b780e6b0ca5c01c5f1d63f17fced4cc1d6b345370fd1856a0b11d3126e
```

### F-002 — B/C 完整请求身份

- 从真实 Faux callback 捕获并比较 B/C 的固定 `api`、`provider`、model `id`、model-visible Context 与稳定 request options projection；
- 独立确认任一 `api`、`provider`、model `id` 或语义性 request option 漂移都会使公平性证明失败；
- 确认没有把 signal、callback、credential、随机 Session ID 等 host-only 对象误计入 payload equality。

### F-003 — credential-safe public error

- 用非 secret fake marker 独立触发 resolver failure 和 transport failure；
- 确认 public `handle.prompt` 只暴露稳定 domain error，message、cause、返回对象及本次 evidence 均不含 marker；
- 不读取 `.env`，不调用真实 Provider，不接触真实 credential。

### F-004 — usage evidence fail closed

- 验证有效零值、边界值和普通值；
- 验证 NaN/Infinity、负数、非整数 request/token、request > 16、input+output > 131072、cost < 0、cost > 0.20 均被拒绝；
- 只审计现有 schema 实际拥有的字段，不扩展为通用预算系统。

## 3. 最小命令集

在不安装依赖、不联网的前提下，至少运行并记录：

1. strict TypeScript；
2. `V1A-POST-AUDIT-F` 四项 focused tests；
3. 完整 V1-A deterministic tests（预期 18/18）；
4. targeted V0-B Verifier regressions（预期 2/2）；
5. focused V0-C Stage 1/correction regressions（预期 24/24）；
6. fresh checkout 的 attribute、CRLF、blob/worktree identity、digest/Manifest 交叉检查。

仅当上述结果互相矛盾、出现非局部回归迹象或无法证明修复边界时，才运行完整 Workbench regression；不要机械重跑无关平台测试。可复用主仓库已存在的本地依赖，但只能通过审计 worktree 内的 ignored directory junction，并记录绝对目标和 setup 命令；不得安装或下载。

## 4. 禁止事项

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

不得修改或暂存 Candidate、`CURRENT_STATE.md`、Charter、Contract、09 控制规则、ADR、Implementation Report、Closeout Draft、Pi、`reference/` 或历史 evidence。不得研究 SDK/Extension/Worktree 兼容、V1-B Pilot、Skill effectiveness、V2/V3 或通用安全平台。发现范围外建议只能记为非阻塞 observation，不能扩张 Gate。

## 5. 报告与停止点

只允许在主仓库生成：

```text
D:/AI/AI_Projects/project2/docs/reports/V1_A_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md
```

报告必须包含：

- disposition：`PASS_FOCUSED_V1_A_REAUDIT`、`REQUEST_BOUNDED_CORRECTION` 或 `PAUSE_FOCUSED_V1_A_REAUDIT`；
- exact Candidate commit/tree、父 failed Candidate、Pi commit/status、fresh checkout/autocrlf 状态；
- F-001 至 F-004 逐项结论和独立 counterexample；
- 上述 digest/Manifest identity 的重算或交叉验证；
- commands、working directories、exit codes、test totals 与 audit-local evidence index；
- source/control/reference/Pi delta 和全部零调用计数；
- blocking findings，或明确 `blocking_findings: 0`；
- 建议 Main Session 的唯一下一控制动作。

若发现缺陷，只报告具体 counterexample、影响边界、最小返修 owner（原 V1-A Implementation Session）和必要回归，不得自行修复。报告完成后再次确认 Candidate、Pi 和控制状态未被修改，然后立即停止，等待 Main Session 与用户验收；不得接受 V1-A、更新 `CURRENT_STATE.md` 或进入 V1-B。
