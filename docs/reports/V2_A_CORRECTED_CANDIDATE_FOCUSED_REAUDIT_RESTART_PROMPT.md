# V2-A Corrected Candidate Focused Re-audit Restart Prompt

```yaml
status: authorized_ready_to_start
role: fresh_focused_independent_audit_session
restart_reason: prior_session_stopped_before_audit_due_shared_pi_path_omission
corrected_candidate_audit_baseline_commit: d6d7a82081658d1782897319dd1e615578ad77c7
corrected_candidate_tree: 4802567158a66eba6748866442c3a3e6ae8010d8
authoritative_shared_pi_path: D:\AI\AI_Projects\project2\.upstream\pi
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
real_model_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
source_repair_authorized: false
control_state_edit_authorized: false
git_stage_or_commit_authorized: false
v2_a_final_acceptance_authorized: false
v2_b_authorized: false
```

你是新的 fresh V2-A focused independent re-audit Session。前一个 Session 在技术审计开始前，因 Main
Prompt 未写明共享 Pi 绝对路径而按 Gate A 停止。你必须重新独立执行审计，不能复用前一个 Session
的判断。

## 1. 必读与绑定指令

先完整读取：

1. 根 `AGENTS.md`；
2. `docs/reports/V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_SESSION_START_PROMPT.md`；
3. `docs/reports/V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_PAUSE_REPORT.md`；
4. `docs/reports/V2_A_CORRECTED_REAUDIT_GATE_A_PAUSE_MAIN_DECISION.md`；
5. 本 Restart Prompt。

除下述 Gate A 路径/状态修正外，原 Start Prompt 的审计范围、必读材料、允许命令、禁止事项、
finding 标准、交付物和停止规则全部继续绑定。

## 2. 修正后的 Gate A

在任何技术审计命令前：

1. 当前工作区必须精确为 `C:\Users\HUAWEI\.codex\worktrees\7675\project2`；
2. HEAD 必须精确为 `d6d7a82081658d1782897319dd1e615578ad77c7`；
3. tree 必须精确为 `4802567158a66eba6748866442c3a3e6ae8010d8`；
4. tracked/staged 必须 clean；只允许下列四份 Main/audit-owned 未跟踪文件：
   - `docs/reports/V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_SESSION_START_PROMPT.md`；
   - `docs/reports/V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_PAUSE_REPORT.md`；
   - `docs/reports/V2_A_CORRECTED_REAUDIT_GATE_A_PAUSE_MAIN_DECISION.md`；
   - `docs/reports/V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_RESTART_PROMPT.md`；
5. Pi 必须只从共享只读路径
   `D:\AI\AI_Projects\project2\.upstream\pi` 核验；HEAD 必须精确为
   `027a5847901b5dde30270abaa1041046cd2b4b55` 且 status clean；
6. 确认 V2-A active，final acceptance、V2-B 与真实访问均未授权。

原 Prompt 中相对路径 `.upstream/pi` 不再适用于本 Codex worktree。不得创建 junction/symlink、复制
Pi、安装依赖或修改 Pi 来满足 Gate。

任一 Gate 失败，写新的
`docs/reports/V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_RESTART_PAUSE_REPORT.md`
并立即停止。

## 3. 审计与交付物

Gate 通过后，严格按原 Start Prompt 只审计 P1-001..P1-005 与必要回归。唯一成功交付物仍为：

`docs/reports/V2_A_CORRECTED_CANDIDATE_FOCUSED_REAUDIT_REPORT.md`

允许的成功 disposition 只有 `PASS_V2_A_CORRECTED_FOCUSED_REAUDIT`；合同内缺陷使用
`REVISE_V2_A_BOUNDED`；架构/权限/route 变化使用 `PAUSE_V2_A_ARCHITECTURE_DECISION`。

不得修源码、修改控制状态、stage/commit、读取 Credential、联网、调用 Provider/model、修改 Pi、
接受 V2-A 或进入 V2-B。报告完成后立即停止。
