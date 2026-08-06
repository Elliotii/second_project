# V2-A Corrected Re-audit Gate A Pause — Main Decision

```yaml
status: main_review_complete
pause_disposition: PAUSE_V2_A_GATE_A_FAILED
audit_started: false
classification: main_prompt_path_omission
product_finding: false
architecture_change: false
scope_change: false
restart_authority: existing_conditional_focused_reaudit_authorization
main_disposition: RESTART_FRESH_FOCUSED_REAUDIT_WITH_EXPLICIT_SHARED_PI_PATH
```

## Decision

Main 接受 Pause Report 对事实的描述，但不接受“必须把 Pi 暴露进当前 worktree”作为唯一恢复方式。
项目的固定只读 Pi 从项目早期开始就位于共享权威路径：

`D:\AI\AI_Projects\project2\.upstream\pi`

Main 已在本次 Pause 后只读核验：该路径存在，HEAD 精确为
`027a5847901b5dde30270abaa1041046cd2b4b55`，工作树 clean。

原启动 Prompt 没有写出这个绝对路径，导致 fresh Audit Session 合理但机械地尝试当前 Codex
worktree 下不存在的 `.upstream/pi`。这是 Main-owned orchestration Prompt 的路径遗漏，不是 V2-A
source/evidence finding，也没有进入 P1-001..P1-005 审计。

因此：

- 第一次 re-audit attempt 不计为技术审计或 finding；
- 不修改 Candidate Commit/tree、源码、Contract scope 或 Pi；
- 保留原 Prompt 与 Pause Report；
- 生成仅修正共享 Pi 路径和允许未跟踪文件清单的 restart Prompt；
- 启动一个新的 fresh focused Audit Session；
- 审计范围、禁止事项、测试边界和最终停止点全部不变。

V2-A final acceptance、V2-B、真实调用、Credential、网络、Pi 修改和 SDK/Extension 路线切换
继续未授权。
