# Adaptive Coding Agent Harness Workbench

这是一个基于公共 Pi `AgentHarness` 的可靠性优先 Coding Agent Workbench。它不重新
实现 Agent Loop，而是在 Pi 外部增加受控 Workspace、Run/Attempt、环境 Verifier、
Trace/Evidence、有限恢复、Harness State 生命周期、持久 Session 和安全可检查界面。

## 当前状态

```yaml
latest_version: V3.5
status: closed_accepted
active_goal: null
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_core_patches: 0
```

V3.5 的正式定位是：

> **Persistent & Inspectable Adaptive Harness Workbench**

当前系统能够保存并重开 settled Session、关联 Session 与 Run/evidence、展示 recovery
与 Base/Candidate comparison、持久化 Harness State 的 Promote/Reject/Rollback 和
selective binding，并通过本地 WebUI 解释完整的适配证据链。

## 架构

```text
Browser
  -> 127.0.0.1-only API/static UI
  -> Workbench application + safe Read Model
  -> Session / Run / Verifier / State controllers
  -> public Direct Pi AgentHarness
  -> bounded Workspace + external environment Verifier
```

Pi 负责公共 Agent/Tool/Session Runtime。Workbench 负责环境结果、实验身份、证据、
恢复预算、State publication 和可检查投影。浏览器和模型都不拥有 Verifier、Promotion、
hard budget/security 或 active-State authority。

## 本地演示

从 `workbench/` 运行：

```powershell
npm run v35g3:demo
```

然后打开 `http://127.0.0.1:43135`。

演示使用 dependency-free 静态 UI 和 Node 内置 HTTP，只绑定 IPv4 loopback。默认数据是
sanitized、derived、non-authoritative 的 deterministic/Faux projection。浏览器不存在
任意文件路径、Credential、Provider、shell、artifact download 或 State mutation 接口。

## 版本路线结果

| Version | 结果 |
|---|---|
| V0 | 最小真实 Coding Task、Workspace、Session、Trace、Verifier 和 Outcome 闭环 |
| V1 | Baseline、Skill-only、Skill + Runtime Control 的有界描述性比较 |
| V2 | 有界多路径恢复和环境选择机制；真实 Negative evidence 不完整 |
| V3 | Evidence → Candidate → Validate → Promote/Reject/Rollback → selective binding |
| V3.5 | persistent Session/Run、一个有效真实 Skill Pair、local inspectable WebUI |

V3.5 Goal 2.5 的真实 Pair 中 Base 与 Candidate 都通过，Candidate 使用更多 tokens；项目
不声称 Skill 获胜、普遍提升或统计显著性。

## 必读文件

1. [Current State](./CURRENT_STATE.md)
2. [V3.5 Closeout](./docs/reports/V3_5_CLOSEOUT.md)
3. [Architecture, Demo and Interview Guide](./docs/V3_5_ARCHITECTURE_AND_INTERVIEW_GUIDE.md)
4. [Goal 3 Demo Guide](./docs/reports/V3_5_G3_DEMO_GUIDE.md)
5. [Workbench implementation guide](./workbench/README.md)
6. [Current project plan](./SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md)

## 目录边界

- `.upstream/pi/`：固定只读 Pi checkout，不计入项目实现；
- `workbench/`：正式 Workbench 源码和测试；
- `fixtures/`：冻结任务、Verifier 和 portable demo projection；
- `docs/reports/`：Goal/Version evidence、审查和 Closeout；
- `docs/decisions/`：已接受 ADR；
- `.runs/`：生成的 Workspace、Session、Trace 和 evidence，不进入 Git；
- `reference/`：用户控制的只读研究资料，不进入项目提交。

## 准确的能力边界

本项目可以声称 persistent settled Session、environment-grounded verification、bounded
recovery、typed Harness State 和 local inspectability。

本项目不声称 in-flight crash recovery、exactly-once Tool effects、production multi-user
durability、general Skill superiority、semantic Memory、Router/Curator、自动 continual
self-evolution、完整 IDE 或 Pi feature parity。

V4 或后续版本尚未授权。
