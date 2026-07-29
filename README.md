# Agent Harness Reliability Workbench

本仓库用于研究和实现第二项目：一个基于候选 Coding Agent Runtime Pi 的可靠性 Workbench。

项目希望通过受控 Workspace、确定性环境验证、关键运行事实记录和 Baseline / Candidate 对照，判断一条 Harness Policy 是否真正改善 Coding Task 的结果。

## 当前阶段

```text
实施前研究完成
→ 工作区 Bootstrap
→ Pi Source Audit
→ Deterministic Integration Spike
→ Real-model Feasibility
→ 冻结 V0
```

当前尚未确认 Pi 为最终基座，也尚未冻结正式架构或 Completion Policy。

G001 静态源码审计已经通过独立验收。Direct `pi-agent-core`
`AgentHarness` 仅被接受为 G002 最小动态 Go Gate 的主候选；最终 Pi Go、
真实使用路径和 V0 架构仍未冻结。

## 必读文件

1. [CURRENT_STATE.md](./CURRENT_STATE.md)
2. [第二项目当前规划](./SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md)
3. [第二项目研究与实现上游包](./SECOND_PROJECT_RESEARCH_AND_IMPLEMENTATION_CONTEXT第二项目研究与实现上游包.md)
4. [第二项目实施前证据审查决策支持报告](./deep-research-report第二项目实施前证据审查决策支持报告.md)

## 目录边界

- `.upstream/pi/`：本地 Pi 上游检出，不计入个人代码，不允许修改；
- `docs/research/`：源码审计与能力证据；
- `docs/goals/`：跨 Session 的可执行 Goal Contract；
- `docs/decisions/`：用户确认后的 ADR；
- `docs/reports/`：Goal Closeout、Spike 和实验报告；
- `spikes/`：基座与接口验证代码，不是正式 Workbench；
- `fixtures/tasks/`：可复现任务夹具；
- `.runs/`：生成的 Workspace、Trace、Outcome 和 Report，不进入 Git；
- `workbench/`：仅在 Pi Go 且 V0 Charter 冻结后创建。

## 当前禁止

- 未经明确授权提交 Git Commit；
- 修改 `.upstream/pi`；
- 在动态 Spike、真实模型可行性与 V0 Charter 通过前创建正式 Workbench；
- 在 `.upstream/pi` 内安装依赖或生成构建产物；
- 未经新证据与架构复核把 G002 切换到 WSL、SDK 或 RPC；
- 将候选判断写成已确认事实；
- 将单任务 Spike 写成 Policy 效果结论；
- 提前引入 MCP、Godot、Multi-Agent、Web UI、SQLite 或通用 Sandbox。
