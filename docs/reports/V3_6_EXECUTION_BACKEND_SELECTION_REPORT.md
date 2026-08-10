# V3.6 Execution Backend Selection Report

```yaml
status: closed_accepted
report_date: 2026-08-10
selection_question: >-
  Which single mature execution backend best fits the current Windows +
  TypeScript + Direct Pi AgentHarness + registered local project + persistent
  Session + managed_session_copy product model?
recommended_backend: docker_engine_linux_container_via_docker_desktop_wsl2
recommendation_accepted: true
tiny_poc_required: false
accepted_by_user: 2026-08-10
v3_6_charter_started: false
implementation_started: false
real_model_calls: 0
credential_reads: 0
pi_core_changes: 0
```

## 1. Decision summary

**Recommendation：**V3.6 只采用一个执行后端：

> **Docker Engine Linux container，通过 Windows 上的 Docker Desktop WSL 2 backend 运行。**

这里选择的是普通、受限、可销毁的 Docker container execution，不是 Docker Sandboxes（`sbx`），也不是远端 Sandbox 服务。

推荐的最小接入形态是：

```text
Direct Pi AgentHarness（宿主）
  → createBoundedToolProfile（宿主）
  → registered run_command logical id（宿主铸造 argv / budget / policy）
  → Docker executor（唯一跨边界的 command execution）
  → one hardened Linux container per command
  → stdout / stderr / exit / timeout / cleanup evidence
  → 现有 ToolResult / Trace（宿主）
```

文件工具、Pi Session、Provider/Credential、Harness State、Run Authority、Verifier 和 ChangeSet apply authority 均留在宿主侧。Container 只获得当前 `managed_session_copy` 的单一读写挂载，不获得 registered source、`.git`、用户 home、`.runs`、Credential、Harness State、Verifier 或 Docker socket。

选择依据不是“Docker 最流行”，而是它在本项目需要的控制面上同时满足：

- Windows 11 + WSL 2 的正式支持；
- 本地数据路径，不需要上传代码或增加服务 API key；
- 与现有 TypeScript `spawn(shell:false)`、registered command 和 ToolResult 形状最短的适配路径；
- 明确的 `--network none`、CPU、memory、PID、read-only root、capability 和 cleanup 原语；
- 可用 container ID、image digest、policy digest 和退出状态形成可复核 evidence；
- 成熟度显著高于当前两个本地 microVM runner；
- 不要求改变 Direct Pi Runtime，也不要求建设 generic Sandbox platform。

**Selection Gate 不需要 tiny PoC。**三条 shortlist 的关键差异已由一手资料明确：Docker 的隔离边界弱于 per-sandbox microVM，但当前冻结 threat model 不声称抵御 host-kernel/daemon compromise；在该边界内，Docker 的 Windows 稳定性、明确资源/进程控制和较低 glue-code 权重形成了可解释 winner。真实主机 readiness 应作为后续 Goal 的 deterministic prerequisite Gate，而不是为了选型再开一轮 PoC。

## 2. Control Baseline identity closeout

### 2.1 Canonical worktree

```yaml
canonical_worktree: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
branch: codex/v2-b-bounded-r2
functional_control_baseline_commit: 00d0524a80b9c30f5ec141b733fb757e7a5f59d4
functional_control_baseline_tree: be0ee4864250f7b29c803a9ba5c69f80be20668c
identity_record_commit: 9943660ae603476a9187d6498c4b34ceacd2990b
identity_record_tree: 8093870c1d34dde2d72ad10074289d0cd5217375
tracked_status_before_selection_report: clean
nonignored_untracked_before_selection_report: 0
ignored_runs_directory_present: true
```

`00d0524…` 仍是包含 i18n maintenance、Open Agent UI productization recommendation、已接受 V3.6 Planning 与 housekeeping 记录的功能 Control Baseline；`9943660…` 只回填该 baseline 的精确 commit/tree identity，没有重定义功能 baseline。

精确身份也已记录在：

- `CURRENT_STATE.md`；
- `docs/reports/V3_6_CONTROL_BASELINE_HOUSEKEEPING_REPORT.md`；
- `docs/reports/V3_6_CONTROL_BASELINE_IDENTITY_CLOSEOUT.md`。

固定 Pi checkout 位于 `D:/AI/AI_Projects/project2/.upstream/pi`，HEAD 为 `027a5847901b5dde30270abaa1041046cd2b4b55`，状态 clean。本轮未修改 Pi。

本轮没有重新运行已经通过的 i18n/browser/Post-V3.5 验收，因为 Git identity、文件清单和现有报告没有出现不一致。

## 3. Selection authority and method

本报告执行已接受 Planning 中的 bounded adoption selection，而不是 Sandbox 技术综述：

1. 对 Planning 列出的 10 个候选做 broad screening；
2. 将 broad screen 中发现的 Docker Sandboxes 作为 Docker 产品族内的独立执行路线纳入比较；
3. 使用同一组 project-fit 维度；
4. shortlist 固定为 3；
5. 只对 shortlist 做 deep selection；
6. 资料可区分 winner，因此不执行 PoC；
7. 只推荐一个 backend，不设计 multi-backend fallback。

资料优先级为：当前源码与已接受 Planning > 官方产品文档/官方仓库 > 推断。所有外部技术事实均来自官方文档或官方仓库；没有根据聚合榜单或营销对比表做决定。

## 4. Current project-fit facts

### 4.1 Existing code seam

| Existing capability | Path / symbol | Selection implication |
| --- | --- | --- |
| Direct Pi runtime | `workbench/src/session/real-smoke-turn-v35.ts` → `createPostV35RealSmokeTurnExecutor`; Pi public `AgentHarness` | Agent loop 和模型调用不需要进入 backend |
| Persistent Session | `workbench/src/session/persistent-session-v35.ts` → `PersistentSessionServiceV35` | Session persistence 与 execution-container persistence 是两个问题；后端可以是 disposable |
| Bounded tools | `workbench/src/pi/tool-profile.ts` → `createBoundedToolProfile` | 只需替换/注入 `run_command` executor；其他文件工具不改 |
| Registered commands | `createBoundedToolProfile` 的 `command_descriptors` 与 `run_command` | 浏览器/模型继续只能提交 logical `command_id`，不能提交 argv |
| Host command result | `CommandExecutionProjection` | Backend 结果可映射回既有 stdout/exit/timeout evidence，不需要新 Harness protocol |
| Managed workspace | `workbench/src/workspace/temp-copy.ts` → `createTemporaryWorkspace` | Backend 只需获得已验证的 disposable copy，而不是 registered source |
| Path boundary | `workbench/src/workspace/path-policy.ts` | canonical path、reparse、writable/protected 检查继续在宿主侧执行 |
| Immutable evidence | `workbench/src/evidence/artifacts.ts` → `writeOnceBytes` / `writeOnceJson` / `validateArtifactRef` | Backend identity/policy/cleanup 可以用既有 artifact 机制保存 |

### 4.2 Host observation

2026-08-10 的只读检查结果：

```yaml
os: Windows 11 Home Chinese
windows_build: 26200
windows_display_version: 25H2
wsl_version: 2.6.3.0
wsl_kernel: 6.6.87.2-1
docker_cli: absent
sbx_cli: absent
```

因此 Docker 是**选型推荐**，不是“当前已安装能力”。Docker Desktop installation、license acceptance、image retrieval 和 readiness verification 都必须在后续获授权后完成。当前 WSL 版本高于 Docker 官方列出的 WSL 2.1.5 最低要求，但这不能替代 Docker 实际安装后的 Gate。

## 5. Unified broad screening

判定词：`shortlist` = 进入深评；`screened_out` = 能力可能真实，但不适合 V3.6 当前形状；没有一个 `screened_out` 结论声称产品本身不可用。

| Candidate | Model / Windows / TS fit | Containment and observability | Workspace / persistence fit | Operational, license, maturity, glue | Broad result |
| --- | --- | --- | --- | --- | --- |
| Docker Engine via Docker Desktop | 本地 Linux container；Windows/WSL 2 正式支持；由 Node `spawn` 调 CLI 即可 | `network none`、CPU/memory/PID、read-only root、cap drop；stdio/exit 和 whole-container kill/remove 明确 | 只 bind 当前 managed copy；Session 留在宿主；container 可 per-command disposable | Docker Desktop 当前未安装；个人/教育/小企业等可免费，大型组织/政府需要付费订阅；成熟、低 glue | **shortlist** |
| Docker Sandboxes (`sbx`) | 本地 per-sandbox microVM；Windows 11；CLI-first | microVM、独立 daemon/fs/network、deny-by-default HTTP(S) proxy；CPU/memory；`sbx exec`/stop/rm | direct mode 可挂 managed copy；clone mode 与非 Git copy/secondary worktree 不自然；sandbox state 默认持久 | `sbx` 未安装且要求登录；CLI 免费（组织治理付费）；0.38.0 很新，近期仍有 security/lifecycle 修复；中等 glue | **shortlist** |
| microsandbox | 本地 microVM；TS SDK；Windows WHP 为 preview | own kernel、host-side network policy、CPU/memory、stdio；可禁网；无 daemon | SDK/volume 可接 managed copy；命名 VM 可持久，但本项目不需要 VM state 成为 Session authority | Apache-2.0、本地免费；官方明确 beta、breaking changes/rough edges，Windows 仍 preview；中等 glue | **shortlist** |
| OpenSandbox | TS SDK，但本地采用仍需 OpenSandbox control/server + Docker/Kubernetes runtime | 有统一 lifecycle/exec/egress 组件 | 能承载 workspace，但会复制本项目已有 Session/Evidence/Control 平面 | Apache-2.0；产品仍年轻；引入 control/compute plane 明显扩大为平台 | screened_out：重复基础设施、重量过大 |
| Gondolin | 本地 Linux microVM + TS control plane；官方 requirements 只列 macOS/Linux | QEMU（默认）/实验 krun、host-side fs/network policy | 有 Pi extension 启发，但不是当前 Windows Direct Harness 的自然 dependency | Apache-2.0，官方自称 experimental；自动拉取约 200MB guest assets；Windows 缺正式路径 | screened_out：当前 Windows/成熟度不匹配 |
| Windows Sandbox | Windows-native VM；以 `.wsb` 文件和 GUI 启动为主 | 可关闭 network、设置 memory、映射目录；缺少适合 Node 的结构化 exec/result/lifecycle API | 映射目录能放 copy，但 stdout/stderr/exit/timeout/reconnect/cleanup glue 很重 | Windows feature prerequisite；无新增服务成本；但不适合 programmatic ToolResult path | screened_out：控制/观测接口不适配 |
| Daytona | managed remote；TypeScript SDK | process/files API、networkBlockAll、资源与 lifecycle；持久 workspace | 需要上传/同步 managed copy，并维护 remote sandbox identity | 平台 API key、计费与 tier policy；部分 essential services 可在 tier policy 下保持可达；高于本地路线的运营重量 | screened_out：remote sync/secret/ops 无必要 |
| E2B | managed cloud Linux microVM；JS/TS SDK | command/files/kill/timeout/pause；旧版公开 JS contract 提供 `allowInternetAccess`，正式采用仍需按当前 pinned SDK 重核 deny-all | 可 upload/download 和 reconnect/pause，但要建立 remote copy protocol | API key、服务计费和连续运行 tier；Apache-2.0 SDK/infra 不消除托管依赖 | screened_out：远端依赖与同步成本 |
| Fly Sprites | managed Firecracker microVM；Windows client + JS SDK | isolated network、domain egress policy、exec；persistent ext4/checkpoint | 强 persistence，但 registered local project 必须上传/回收文件 | Token、按 CPU/memory/storage 计费；产品 2025/2026 快速演进；中高 glue | screened_out：能力强但与本地轻量目标不匹配 |
| Modal Sandbox | managed cloud；JS SDK | exec、resources、timeout、network blocking；文件 API仍标 Beta | 文件 upload/Volume/snapshot 可用，但会增加 remote data/lifecycle 层 | 服务 account/计费；远端应用与存储对象；中高 glue | screened_out：不需要的 cloud platform coupling |
| Cloudflare Sandbox | Workers/Containers + TypeScript SDK；Workers Paid | exec/files/session/timeout；官方明确 exec timeout 后底层进程可继续，需 delete session/destroy | active container 内有状态，idle 后默认丢失；持久化要再接 R2/backups | Workers deployment、Durable Object、container image 与版本配套；产品较新；高 glue | screened_out：timeout/进程语义和平台重量不优 |

Broad screen 的关键一手资料：

- Docker：[Windows install and requirements](https://docs.docker.com/desktop/setup/install/windows-install/)、[container run flags](https://docs.docker.com/reference/cli/docker/container/run)、[resource constraints](https://docs.docker.com/engine/containers/resource_constraints/)、[bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)、[Desktop license](https://docs.docker.com/subscription/desktop-license/)。
- Docker Sandboxes：[overview](https://docs.docker.com/ai/sandboxes/)、[security model](https://docs.docker.com/ai/sandboxes/security/)、[`sbx create`](https://docs.docker.com/reference/cli/sbx/create/)、[`sbx exec`](https://docs.docker.com/reference/cli/sbx/exec/)、[release notes](https://docs.docker.com/ai/sandboxes/release-notes/)。
- microsandbox：[official docs](https://docs.microsandbox.dev/getting-started/introduction)、[official repository](https://github.com/superradcompany/microsandbox)。
- OpenSandbox：[official repository](https://github.com/opensandbox-group/OpenSandbox)。
- Gondolin：[official repository](https://github.com/earendil-works/gondolin)。
- Windows Sandbox：[official `.wsb` configuration](https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-configure-using-wsb-file)。
- Daytona：[TypeScript SDK](https://www.daytona.io/docs/en/typescript-sdk/)、[network limits](https://www.daytona.io/docs/en/network-limits/)、[persistence](https://www.daytona.io/docs/en/persistence/)。
- E2B：[current Sandbox SDK](https://e2b.dev/docs/sdk-reference/js-sdk/v2.1.2/sandbox)、[older network option contract](https://e2b.dev/docs/sdk-reference/js-sdk/v1.13.0/sandbox)、[persistence](https://e2b.dev/docs/sandbox/persistence)、[official repository](https://github.com/e2b-dev/e2b)。
- Fly Sprites：[official product/API overview and pricing](https://fly.io/sprites)、[release notes](https://fly.io/sprites/release-notes)。
- Modal：[Sandboxes](https://modal.com/docs/guide/sandboxes)、[filesystem access](https://modal.com/docs/guide/sandbox-files)。
- Cloudflare：[Sandbox SDK](https://developers.cloudflare.com/sandbox/)、[command semantics](https://developers.cloudflare.com/sandbox/guides/execute-commands/)、[lifecycle](https://developers.cloudflare.com/sandbox/concepts/sandboxes/)。

## 6. Shortlist deep selection

### 6.1 Project-fit comparison

| Dimension | Docker Engine/Desktop | Docker Sandboxes (`sbx`) | microsandbox local |
| --- | --- | --- | --- |
| Isolation boundary | Linux container namespaces/cgroups inside Docker Desktop VM；不是每 command 独立 kernel | 每 sandbox microVM，独立 kernel/daemon/fs/network | 每 sandbox microVM，独立 kernel/fs/network |
| Frozen threat-model fit | 足够；不声称 host-kernel/daemon defense | 超出当前最低需要但安全余量更高 | 超出当前最低需要但安全余量更高 |
| Windows status | Docker Desktop + WSL 2 正式支持 | Windows 11 支持；当前 stable line 0.38.0 | Windows WHP **preview** |
| TypeScript seam | 复用现有 Node child process；不新增 SDK | `sbx` CLI adapter；没有必要接 agent-specific kit | 原生 TS SDK 很好，但新增 beta runtime dependency |
| `managed_session_copy` | 单一 canonical bind mount，最自然；Docker Desktop 官方支持 Windows host bind | direct mode 可挂载，但必须显式关闭 shared skills/ports/额外 mounts；clone mode不采用 | volume/bind 路线概念匹配，但 Windows preview 上仍需 implementation Gate 验证 |
| Registered argv | `docker run` argv 可由 host exact 构造，保持 `shell:false` | `sbx exec SANDBOX COMMAND [ARG...]` 可映射，但要管理 sandbox identity | `Sandbox.exec(executable, argv)` 可直接映射 |
| Network | `--network none` 是明确、简单、可 inspect 的绝对禁网策略 | 默认 deny-by-default proxy 仍带较宽默认 allow rules，需要额外 policy 清理和证明 | 默认 public internet；可设 allowlist/disabled，但需把 policy API纳入证据 |
| Descendants / timeout | host deadline 后 kill/remove 整个 per-command container；PID limit 可冻结 | 可 stop/rm 整个 microVM；`sbx exec` 文档无 per-command timeout flag或 PID limit | stop 整个 VM；CPU/memory明确，PID/timeout证据仍需 SDK核验 |
| Resource controls | CPU、memory、memory-swap、PID、read-only root、tmpfs、ulimit 等成熟 | create 暴露 CPU/memory；未见与 Docker run 等价的 PID/ulimit surface | builder 暴露 CPU/memory，metrics 可取；更细控制仍受 beta API约束 |
| Result observability | stdout/stderr/CLI exit、container ID、inspect、stats、kill/remove outcome | exec CLI exit + inspect/policy logs；需自行包 timeout/cleanup evidence | structured SDK output/metrics 较好 |
| Session semantics | container per command disposable；不会与 Pi persistent Session 混淆 | sandbox 默认 persistent，必须避免把其内部状态误当 Session authority | named VM 可 persistent，也必须明确它不是 Pi Session authority |
| Secret boundary | 不传 env、不挂 secret、不挂 Docker socket；Provider在宿主 | 产品有 host proxy secret injection，但 V3.6 应禁用/不使用，避免第二套 authority | 有 host-side placeholder secret，但 V3.6 不需要使用 |
| Cleanup determinism | container ID + stop/kill + rm，成熟且直接 | active attach/SFTP 时 `rm` 可拒绝，需 `--force` policy；daemon lifecycle更多 | stop/rm 清晰，但 Windows preview 可靠性未成熟 |
| Operational dependency | Docker Desktop/WSL 2；当前缺失；无需额外 cloud account完成本地执行 | `sbx` 当前缺失、需登录、sandbox daemon和产品 policy | runtime/guest/image首次下载；WHP；beta |
| License/cost | Desktop 对个人/教育/小企业等免费，大型组织/政府需付费；Engine/Moby OSS | `sbx` CLI官方称商业用途也免费；组织治理另付费 | Apache-2.0、本地免费 |
| Maturity | 最高 | 产品快速演进；2026-08-06 为 0.38.0，近期仍有 CVE和生命周期修复 | 官方明确 beta、breaking changes、rough edges；Windows preview |
| Estimated V3.6 glue | **low** | medium | medium |

### 6.2 Why stronger isolation did not automatically win

Docker Sandboxes 与 microsandbox 的 per-sandbox microVM 隔离确实比普通 Linux container 更强；本报告不淡化这个差异。但 V3.6 的冻结边界是单用户本地 Workbench 的 bounded command execution，不是恶意多租户、host-kernel defense 或通用 untrusted-code service。

在当前边界下，真正决定项目是否成功的是：

1. 只暴露 managed disposable Workspace；
2. 默认完全禁网；
3. 限制 CPU/memory/PID/wall/output；
4. timeout 能终止整个 descendant tree；
5. Credential/State/Verifier/Authority 不进执行环境；
6. 每次执行和 cleanup 可形成稳定 evidence；
7. 不把项目拖成 Sandbox 平台集成工程。

普通 Docker 能直接满足这些合同，并且比另两条路线更成熟、更可预测。microVM 的附加安全价值应保留为未来触发式重评项，而不是在 V3.6 中用更重、更年轻的依赖提前购买。

## 7. Selected backend contract recommendation

本节是后续 Charter/Goal 2 的输入，不是当前已实施事实。

### 7.1 Backend identity

建议 profile identity 至少固定：

```yaml
backend_kind: docker_engine_linux_container
host_frontend: docker_desktop_wsl2
docker_client_version: <observed>
docker_server_version: <observed>
image_reference: <human-readable pinned reference>
image_digest: sha256:<immutable digest>
platform: linux/amd64
network_mode: none
root_filesystem: read_only
workspace_mount_mode: rw_single_managed_copy
user: <non-root uid:gid>
cpu_limit: <frozen>
memory_limit: <frozen>
memory_swap_limit: <frozen>
pids_limit: <frozen>
wall_timeout_ms: <frozen>
output_budget_bytes: <frozen>
capabilities: drop_all
no_new_privileges: true
pull_policy: never_during_run
profile_digest: <immutable digest>
```

### 7.2 Minimal command lifecycle

```text
host validates registered command + current Session/Profile digests
→ host validates canonical link-free managed workspace
→ docker create/run with exact image digest and frozen flags
→ mount only managed workspace at /workspace
→ execute exact argv without model/browser-supplied shell text
→ capture stdout/stderr/exit under output budget
→ on wall timeout: kill whole container
→ remove container in finally
→ inspect cleanup result
→ persist backend evidence
→ map result into existing CommandExecutionProjection / ToolResult / Trace
```

建议 first version 使用 **one container per registered command**，而不是把 container state 提升为 persistent Session state。这样 descendant process、timeout 和 cleanup 的语义最窄，也避免新的 recovery problem。Workspace 自身已由 `managed_session_copy` 保持跨 Turn 连续；需要持久的依赖只能位于该 Workspace 或固定 image 内，不依赖前一次 container 的 writable layer。

### 7.3 Required hardening

后续实现至少应使用或等价证明：

- `--network none`；
- `--read-only`，只为必要临时目录配置受限 tmpfs；
- `--cap-drop ALL`；
- `--security-opt no-new-privileges`；
- 明确 non-root user；
- `--cpus`、`--memory`、`--memory-swap`、`--pids-limit`；
- 不使用 `--privileged`、host PID/IPC/network、device passthrough 或 published ports；
- 不挂 Docker socket、named pipe、home、`.git`、`.runs`、Credential、Harness State、Verifier 或 authority roots；
- image 必须 digest-pinned，正式 Run 使用 `--pull never`；
- container 使用 server-generated name/label/CID identity；
- timeout 和异常路径都执行 kill/remove/inspect；
- backend unavailable 时 fail closed，绝不 fallback 到 host `run_command` 后仍声称 sandboxed。

### 7.4 Windows path boundary

Docker Desktop 官方支持将 Windows host path 透明 bind 到 VM 内 container，但 bind mount 默认具有 host write access。因此 V3.6 的安全性依赖于“挂载目标只能是已经 canonicalized、link-free 的 managed Session copy”。后续实现必须：

1. 在 create 前重新做 realpath/reparse containment；
2. 使用 `--mount` 而非会自动创建缺失 source 的隐式 volume 语义；
3. 拒绝 repository parent、registered source、`.git`、authority root 或任何额外挂载；
4. 把实际 mount source identity 存为 host-only evidence，绝不投影给浏览器/模型；
5. container settled 后仍由宿主 inventory/ChangeSet 逻辑判断哪些文件可供用户 apply。

## 8. Impact on V3.6 Goal 2

### 8.1 What changes

Goal 2 需要新增的 backend 工作保持为一个窄 adapter，而不是 platform：

1. 一个 Docker readiness/profile validator；
2. 一个 `run_command` Docker executor；
3. backend execution evidence schema/projection；
4. hard timeout + whole-container cleanup；
5. managed-copy mount boundary tests；
6. fail-closed unavailable/drift/tamper tests；
7. 将 backend/image/policy identity 绑定到 interactive authority / Run Manifest。

现有 Planning 中的 Project Profile、Interactive Run Authority、Session pinning、immutable ChangeSet、user review 和 host-controlled apply 顺序不变。

### 8.2 What does not change

- 不修改 Pi Core 或切换 SDK/Extension/RPC；
- 不把 AgentHarness、Provider 或 Credential 放进 container；
- 不重写 Session persistence；
- 不替换 `managed_session_copy` 为 worktree/clone；
- 不为 Docker 设计通用 backend interface/marketplace；
- 不加入第二 backend 或 fallback；
- 不把 Docker image/container persistence当作新的 Harness memory；
- 不改变 Verifier、Outcome、Harness State、Promotion 或 ChangeSet authority。

### 8.3 Weight estimate

相对 accepted Planning，Docker 选择没有增加 Goal 数量，也没有新增产品面。新增重量主要集中在一个 executor + preflight + evidence adapter。它应当仍明显轻于 V3；如果实现开始要求 Docker orchestration service、remote registry platform、multiple images per project、Compose/Kubernetes 或多 backend abstraction，应立即视为 scope drift。

## 9. No-PoC decision

```yaml
tiny_poc_requested: false
reason:
  - official_sources_already_separate_the_final_candidates
  - winner_does_not_depend_on_benchmark_or_undocumented_behavior
  - current_host_has_no_docker_or_sbx_installation
  - installation_only_to_repeat_documented_semantics_would_be_implementation_work
  - later_goal_requires_a_deterministic_readiness_and_boundary_gate_anyway
```

不做 PoC 不代表跳过验证。后续若用户接受推荐，Goal 2 在任何 Agent/real-model dispatch 前必须验证：Docker client/server 可用、Linux image digest 可解析、全部 hardening flag 生效、bind 只指向 managed copy、network none、timeout 能 kill descendants、stdout/stderr/exit 可回填、container 能确定性清理。该验证属于 selected backend 的 implementation acceptance，不是第二轮选型。

## 10. Prerequisites, license and unresolved risks

### 10.1 Prerequisites requiring later authorization

1. 安装并接受 Docker Desktop for Windows 条款；当前机器没有 `docker` CLI。
2. 使用 WSL 2 Linux container backend；当前 WSL 2.6.3.0 满足版本前提，但仍需 Docker readiness 证明。
3. 获取并 digest-pin 一个最小 Node/Linux image；正式执行阶段禁止漂移或自动 pull。
4. 用户确认其使用场景符合 Docker Desktop 免费条款，或具备所需订阅。
5. 后续 Charter/Goal 2 冻结 exact image、CPU/memory/PID/wall/output profile。

### 10.2 Unresolved but bounded risks

| Risk | Current treatment | Promotion trigger |
| --- | --- | --- |
| Docker Desktop 当前未安装或组织策略禁止 | prerequisite，非当前 selection blocker | 安装/daemon readiness 失败 |
| Container 不是 per-command microVM | 明确限制 claim；当前 threat model接受 | 用户要求 hostile multi-tenant/host-kernel defense，或出现具体 escape concern |
| Windows bind/reparse/path alias | 复用现有 canonical path policy并新增 mount-time Gate | 无法证明唯一 mount root 或出现 escape reproduction |
| Docker daemon access 本身是高权限 | 只由 host service使用；browser/model不接 daemon/socket | 必须把 daemon control 暴露给 Agent/browser时 hard stop |
| Linux image 与某注册项目不兼容 | V3.6 首版只支持通过 Profile Gate 的项目 | 需要 Windows-only command或 host binary时 fail closed，不 fallback |
| Dependency/image supply chain | digest pin + pre-acquisition + run-time `pull never` | 无法固定 digest/license/source |
| Cleanup failure | container ID + finally kill/remove + terminal evidence | orphan无法清理或 identity不确定时 terminal failure |
| Docker Desktop license变化 | 当前条款记录为时间点事实 | 商业部署/组织规模/条款变化时重新核验 |

## 11. Hard stops

后续一旦出现以下任一项，不得静默换 backend 或 fallback host execution：

1. Docker Desktop/Engine 无法在目标 Windows 主机合规安装或稳定启动；
2. exact image digest、server version 或 policy identity 无法冻结/验证；
3. `--network none`、resource/PID limit 或 whole-container timeout cleanup 无法证明；
4. container 必须挂载 registered source、`.git`、Credential、Harness State、Verifier、authority root 或 Docker socket 才能工作；
5. Windows canonical/reparse path 无法限制为唯一 managed copy；
6. supported task 必须调用 Windows-only host executable，而 Linux image无法运行；
7. 需要修改 Pi Core、切换 Direct AgentHarness 或重写 persistent Session；
8. 实现要求第二 backend、automatic fallback、Compose/Kubernetes 或通用 Sandbox platform；
9. 需要改变 accepted ChangeSet/preimage/stale/protected/tamper authority；
10. 对 backend 不可用时仍要把 host command 标记为 sandboxed execution。

发生 1–6 时回到 Main/用户：重新选择支持范围、接受 inspect-only，或单独授权重新打开 Selection Gate。普通 CLI path、TypeScript typing、fixture、serialization、display 或 Docker command construction bug 按正常有界软件开发处理，不自动升级治理。

## 12. Claude Code reference boundary

Claude Code 在本轮只提供一个设计不变量：**Permission/Approval 与 process containment 是不同边界。**V3.6 的 registered command、capability profile 和用户 ChangeSet approval 仍由 Workbench 宿主控制；Docker 只执行已经通过宿主 authority 的命令，并提供进程/文件系统/网络 containment。

本报告没有把 Claude Code 当 backend candidate，也没有复制其模块、Permission 平台或 subprocess architecture。

## 13. User decisions required after independent review

```yaml
user_decisions_required:
  - decision: accept_or_reject_selected_backend
    evidence: Docker is the lowest-glue mature fit under the frozen V3.6 threat model
    options:
      - accept Docker Engine via Docker Desktop WSL2
      - reject and reopen the bounded Selection Gate
      - downgrade V3.6 to inspect-only / pause
    recommendation: accept Docker Engine via Docker Desktop WSL2
    consequence: only this backend may enter V3.6 Charter and Goal 2

  - decision: authorize_future_docker_prerequisite_acquisition
    evidence: docker CLI is currently absent; WSL 2 prerequisite is present
    options:
      - later authorize Docker Desktop install, terms acceptance and pinned image retrieval
      - user installs prerequisite manually before Goal 2
      - do not install and pause bounded-edit mode
    recommendation: decide only after independent review of this report
    consequence: no Goal 2 sandboxed execution can start without the prerequisite

  - decision: freeze_exact_backend_profile_later
    evidence: image digest and numeric resource limits belong to Charter/Goal Contract, not product selection
    options:
      - accept Main recommendation in the later Charter
      - provide user-specific limits
    recommendation: freeze one small Node/Linux image and one resource profile
    consequence: preserves one-backend, one-profile V3.6 scope
```

当前不需要用户决定 tiny PoC；本报告建议 `tiny_poc_required: false`。在独立审阅和用户接受之前，本推荐不是正式 Architecture freeze，不授权 Docker 安装、V3.6 Charter、Goal 1/Goal 2 implementation、真实模型调用或任何 Pi 修改。
