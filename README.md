# Adaptive Coding Agent Harness Workbench

这是一个基于公共 Pi `AgentHarness` 的可靠性优先 Coding Agent Workbench。项目不重新实现 Agent Loop，而是在 Pi 外部负责 Workspace、Session/Run、环境 Verifier、Trace/Evidence、有界恢复、可版本化 Harness State、持久化检查界面，以及 V3.6 的受控 Docker 执行与 Change Handoff。

```yaml
latest_version: V3.6
status: closed_accepted
active_goal: null
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_core_patches: 0
```

## 当前能力

```text
Browser / local product entry
  -> loopback-only Workbench API and safe projections
  -> Host-minted Run Authority and pinned persistent Session
  -> public Direct Pi AgentHarness
  -> managed_session_copy
  -> registered commands in one bounded Docker backend
  -> immutable Trace / Verifier / ChangeSet
  -> user-reviewed Host Apply All / Discard / Export
```

Pi 负责公共 Agent、消息、Tool 和 Session Runtime。Workbench 负责模型不能拥有的权威：Project/Workspace、预算、Verifier、Outcome、Evidence、Harness State、Docker profile、ChangeSet 和 registered Source Apply。

V3.6 已完成：

- 开放任务入口只接受窄的浏览器 schema；Host 生成并持久化不可变 Authority；
- Session 固定 Project、Source snapshot、Harness State、capability、provider policy 和 execution backend identity；
- 只允许注册命令 ID，Host 将其解析为固定 argv；
- 项目命令只在固定 Docker Desktop WSL2/Linux backend 中运行，容器网络为 `none`，无 Host fallback；
- Agent 只修改 `managed_session_copy`，不能直接修改 registered Source；
- settled Workspace 形成不可变 ChangeSet，Host 在完整 preflight 后执行 Apply All、Discard 或 Export；
- 一个真实 DeepSeek V4 Flash 两 Turn Journey 在同一持久 Session 中完成，Verifier 通过并由 Host Apply 一个文件；
- 中英文 WebUI 继续只展示安全派生信息，不拥有 Credential、Docker、Verifier、State 或 Source mutation authority。

## 版本路线结果

| Version | 核心问题 | 已接受结果 |
|---|---|---|
| V0 | 能否运行、控制、追踪并从环境验证 Coding Task？ | 最小可用 Workbench 闭环 |
| V1 | Baseline、Skill-only、Skill + Runtime Control 如何比较？ | 有界描述性证据，无通用赢家 |
| V2 | 失败轨迹能否形成少量替代路径并由环境选择？ | 机制成立；真实 Negative 证据不完整 |
| V3 | Evidence 能否转化为可验证、晋级、拒绝、回滚和选择性绑定的 Harness State？ | Prompt/Skill State 生命周期与一条真实 Prompt 路径 |
| V3.5 | 系统能否持久化、检查和演示？ | settled Session reopen/continue、Read Model、WebUI 和一个有效 Skill Pair |
| V3.6 | 开放交互如何获得受控执行和用户审阅的 Source handoff？ | Host Authority、固定 Docker backend、不可变 ChangeSet 和一个真实两 Turn产品闭环 |

## 本地体验

从 `workbench/` 运行零真实调用的 V3.6 控制平面：

```powershell
npm.cmd run v36g1:demo
```

打开 `http://127.0.0.1:43136`。该界面可创建/继续 Session、查看固定上下文、Workspace、Changes、Diff 和 handoff 状态。普通自由任务仍默认为 `unverified`，Agent 自称完成不等于正式 PASS。

确定性 Goal 2 回归：

```powershell
$env:V36_DOCKER_EXECUTABLE = 'C:/Users/HUAWEI/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe'
npm.cmd run v36g2:test
```

真实 `v36g2:product` 是受治理的固定验收入口，不是随意消耗 Credential 的日常命令。精确用法、预算和证据边界见 [Workbench README](./workbench/README.md) 与 [V3.6 Closeout](./docs/reports/V3_6_CLOSEOUT.md)。

## 关键证据

- Pi：`027a5847901b5dde30270abaa1041046cd2b4b55`，clean，零 Core patch；
- V3.6 Goal 1 implementation：`81bc7c8b5667efaa0c10df507a7a0d2a59827e1e`；
- V3.6 Goal 2 corrected implementation：`5ec7d2b0e81e54e2c8a73200e39f45ba631b244f`；
- Goal 2 Execution Baseline：`781e95211e7cc6beb572c50ec18e36e0a952b1f9`；
- 真实 Journey：1 Session、2 Runs、11 Provider requests、10 Tool calls、53,597 tokens、USD `0.0025941608`；
- Verifier：3/3 passed；Host Apply：成功；Docker leftovers：0；
- 最终零真实调用回归：strict TypeScript + 79/79 tests。

## Claims 与边界

项目可以声称：公共 Pi 上的 Host-minted open-task authority、固定持久 Session、环境 Verifier、受控 Docker registered-command execution、不可变 Evidence/ChangeSet、用户审阅的 Host Apply，以及可解释的 Prompt/Skill Harness State 生命周期。

项目不声称：任意不可信代码的完备安全、生产级 sandbox、多租户隔离、in-flight crash recovery、exactly-once Tool effects、多文件事务、自动 rollback、任意项目兼容、统计显著的模型/Skill 提升、自动持续自进化、完整 IDE 或 Pi feature parity。

## 阅读路径

1. [Current State](./CURRENT_STATE.md)
2. [V3.6 Closeout](./docs/reports/V3_6_CLOSEOUT.md)
3. [V3.6 Architecture and Interview Guide](./docs/V3_6_ARCHITECTURE_AND_INTERVIEW_GUIDE.md)
4. [V3.6 Goal 2 Closeout](./docs/reports/V3_6_G2_CLOSEOUT.md)
5. [Workbench README](./workbench/README.md)

`.upstream/pi/`、`.runs/` 和 `reference/` 分别是固定上游、生成证据和用户控制参考资料，不进入项目实现提交。

## V3.6 日常产品入口（Post-Closeout Polish）

正式 V3.6 Closeout 事实保持不变。收尾产品化只把已经接受的 persistent Session、
Direct Pi、Docker registered commands、managed copy、ChangeSet 和 Host handoff 薄装配为
一个用户驱动入口；它不再自动运行冻结 Prompt，也不会自动 Apply。

先复制 `workbench/config/v36-product.example.json` 为被 Git 忽略的
`workbench/config/v36-product.local.json`，填写已登记项目的绝对 Source 路径、可写/保护路径、
注册命令及 Harness State digest，然后从 `workbench/` 运行：

```powershell
npm.cmd run v36:product -- `
  --profile-file ./config/v36-product.local.json `
  --credential-file ../.env `
  --docker-executable "$env:LOCALAPPDATA/Programs/DockerDesktop/resources/bin/docker.exe"
```

打开 `http://127.0.0.1:43136`。自由 Coding Task 仍为 `unverified`：Agent 只修改
managed Workspace；用户在 Changes / Diff 中明确选择 Apply All、Discard 或 Export。
Apply 成功后旧 Session 不得继续，页面提供“从更新后的 Source 新建 Session”。详细边界见
[Workbench README](./workbench/README.md) 与
[Post-Closeout Productization Polish Report](./docs/reports/POST_V3_6_PRODUCTIZATION_POLISH_REPORT.md)。
