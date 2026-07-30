# V0-B Goal Contract — Evidence, Session, Verifier and Outcome

```yaml
goal_id: V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME
status: closed_accepted
version: V0_B
date: 2026-07-31
accepted_by_user: 2026-07-31
activated_by_user: 2026-07-31
closed_by_user: 2026-07-31
execution_owner: dedicated_v0_b_goal_session
implementation_owner: dedicated_v0_b_goal_session
main_session_owner: current_codex_main_session
active_goal: false
contract_accepted: true
activation_authorized: true
control_baseline_commit_authorized: consumed
control_baseline_commit: 32dc7b136053e2fdc17f294322a3cf7fef79e737
dedicated_goal_session_prompt_authorized: true_after_control_baseline_commit_confirmation
dedicated_goal_session_started: true
dedicated_goal_session_completed: true
implementation_authorized: consumed_and_completed_by_dedicated_v0_b_goal_session
implementation_started: true
implementation_completed: true
formal_workbench_extension_authorized: consumed
dependency_installation_authorized: false
external_network_authorized: false
real_model_calls_authorized: 0
real_model_stage_2_authorized: false
real_model_stage_2_executed: false
dedicated_goal_session_git_commit_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
external_module_port_authorized: false
V0_A_implementation_baseline_commit: 1a1565fa7e6d1440c8f99e2c7e587201a14111c1
first_failed_audit_candidate: 18ba8466799198b1ce3e732990a49f626fb83d48
implementation_baseline_commit: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
independent_reaudit: passed
accepted_disposition: PASS_V0_B_EVIDENCE_FOUNDATION
formal_closeout: docs/reports/V0_B_CLOSEOUT.md
control_evidence_closeout_commit: resulting_HEAD_of_this_revision
```

> 用户已于 2026-07-31 正式接受 V0-B，处置为
> `PASS_V0_B_EVIDENCE_FOUNDATION`。专用 Goal Session、两轮有界返修和聚焦
> 独立复审均已停止；`active_goal` 现为 `null`。本关闭状态不授权 V0-B
> Stage 2、V0-C、真实模型、外部网络、依赖安装、Pi 修改或后续实现。

---

## 1. Mission

V0-B 的唯一使命是：

> 在已经接受的 V0-A Workbench 基础上，把一次有界、settled 的 Coding
> Attempt 转化为具有脱敏 Session 证据、closed-envelope Journal、外部
> Verifier、严格 evidence validity 和唯一 terminal Outcome 的可复核运行。

V0-B 必须回答：

1. Workbench 能否持久化可审计、reasoning-safe 的 Pi Session 镜像；
2. Provider、Tool、Session、settled 和 Verifier 事件能否关联到同一
   Run / Attempt / Session / Workspace；
3. 外部 Verifier 能否只在 settled 后、在 Agent write scope 之外执行；
4. Verifier 有效失败能否与 Verifier 自身错误严格区分；
5. Evidence 缺失或冲突能否优先落为 `invalid`，而不是伪装成 Agent failure；
6. 一个 Run 能否形成一个 write-once terminal Outcome 和可验证 Evidence
   Index；
7. `inspect` 能否在不暴露秘密、reasoning 或无预算大对象的前提下复核关键
   链路；
8. V0-C、V1 和 V2 能否在不改写核心 lineage 的情况下继续增加 Recovery、
   Skill Strategy 和 clean-session child Attempt。

V0-B 不实现 Recovery，也不评价 Completion Policy 是否改善真实模型表现。

---

## 2. Authorization and Governance

### 2.1 Contract acceptance is not activation

唯一允许的流程是：

```text
主 Session 完成 V0-B 研究与 Contract 草案
→ 用户审查并接受正式 V0-B Contract
→ Contract 状态变为 accepted_not_activated
→ 用户单独授权 V0-B Activation 和 Control Baseline Commit
→ 主 Session 更新 CURRENT_STATE、正式 Contract 和必要控制文件
→ 主 Session 创建并核验干净的 Control Baseline Commit
→ 主 Session 将精确 Commit SHA 写入正式 Contract / 启动材料
→ 主 Session 生成 V0-B 专用 Goal Session 启动 Prompt
→ 专用 Session 从精确 Baseline Commit 执行 Gate A
→ 专用 Session 执行 Stage 1，真实模型调用保持 0
→ 专用 Session提交实现证据、Report、Closeout Draft 和状态更新建议
→ 主 Session与用户验收
→ 如用户另行授权，才可执行 Stage 2 的单次真实模型 Smoke
```

绑定规则：

1. 接受 Contract 不等于激活 Goal。
2. Activation 和 Control Baseline Commit 必须由用户单独授权。
3. 专用 Goal Session 不得自行修改或暂存：
   - `CURRENT_STATE.md`；
   - 正式 V0-B Contract 的控制状态；
   - `09_对接执行、文件权威与验收规则.md`；
   - 其他项目控制状态。
4. 专用 Goal Session 不得创建 Git commit。
5. 专用 Goal Session只能在 Implementation Report 或 Closeout Draft 中提交
   结构化 `CURRENT_STATE_UPDATE_PROPOSAL`。
6. Stage 1 的真实模型调用必须为 0。
7. Stage 2 不能由 Contract 接受、Goal Activation 或 Stage 1 完成自动授权。

### 2.2 Current stop point

V0-B Stage 1 已实现、返修、独立复审并由主 Session与用户正式接受。
Implementation Baseline Commit 为
`7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180`，正式 Closeout 为
`docs/reports/V0_B_CLOSEOUT.md`。V0-B Stage 2 未授权且未执行；V0-C 仍为
Charter-defined、未创建 Contract、未激活、未授权。

---

## 3. Binding Inputs and Read Order

未来专用 Session在执行任何命令或修改前必须完整读取：

1. 根 `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. 正式 `V0_VERSION_CHARTER.md`；
4. `09_对接执行、文件权威与验收规则.md`；
5. 正式 `V0_B_GOAL_CONTRACT.md`；
6. `V0_A_GOAL_CONTRACT.md`；
7. `docs/reports/V0_A_IMPLEMENTATION_REPORT.md`；
8. `docs/reports/V0_A_CLOSEOUT.md`；
9. `docs/reports/V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME_PRECONTRACT_RESEARCH.md`；
10. G003、G005、G006 的 Contract、Report、Closeout 和本 Contract 指定的源码；
11. `workbench/` 当前全部源码、测试和 README；
12. `.upstream/pi/AGENTS.md`；
13. 本 Contract 指定的固定 Pi 源码与测试。

如真实仓库、Pi commit、V0-A 状态或正式文件与 Contract 不一致，命中 Pause
Condition。

---

## 4. Fixed Evidence Baseline

### 4.1 Project baseline

```yaml
V0_A:
  status: closed_accepted
  disposition: PASS_V0_A_FOUNDATION
  implementation_baseline_commit: 1a1565fa7e6d1440c8f99e2c7e587201a14111c1
  authoritative_run_id: run-5c0b157e-31d7-4873-95a1-fd284377ace3
  workbench_tree_digest: 4ba620c14074a4ec96989f1aa670bbad612ab5714ea102a4564813c19d743c6e
  tests: 32_passed_0_failed_0_skipped
  real_model_calls: 0
  pi_core_patch_count: 0
```

### 4.2 Fixed Pi

```yaml
path: .upstream/pi
commit: 027a5847901b5dde30270abaa1041046cd2b4b55
describe: v0.82.1-40-g027a5847
package: "@earendil-works/pi-agent-core@0.82.1"
license: MIT
expected_status: clean
```

### 4.3 Pi source basis

Public source evidence:

- `.upstream/pi/packages/agent/src/index.ts`
  - public export boundary for `AgentHarness`, `Session`, Session storage and
    Harness types;
- `.upstream/pi/packages/agent/src/harness/agent-harness.ts`
  - `AgentHarness.handleAgentEvent()`;
  - `AgentHarness.prompt()`;
  - `AgentHarness.abort()`;
  - `AgentHarness.waitForIdle()`;
  - `AgentHarness.subscribe()`;
  - `AgentHarness.on()`;
- `.upstream/pi/packages/agent/src/harness/session/session.ts`
  - `Session`;
  - `appendMessage()`;
  - `getEntries()`;
  - `buildContext()`;
- `.upstream/pi/packages/agent/src/harness/session/jsonl-storage.ts`
  - `JsonlSessionStorage.create()`;
  - `JsonlSessionStorage.open()`;
  - `appendEntry()`;
- `.upstream/pi/packages/agent/src/harness/types.ts`
  - `SessionStorage`;
  - `SessionTreeEntry`;
  - `BeforeProviderRequestEvent`;
  - `AfterProviderResponseEvent`;
  - `ToolCallEvent`;
  - `ToolResultEvent`;
  - `AbortEvent`;
  - `SettledEvent`.

Required Pi tests:

- `.upstream/pi/packages/agent/test/harness/agent-harness.test.ts`
  - `waitForIdle waits for external run settlement and awaited listeners`;
  - `runs tool_call and tool_result hooks through the direct loop`;
- `.upstream/pi/packages/agent/test/harness/storage.test.ts`
  - JSONL create/open/metadata/entry/leaf behavior;
- `.upstream/pi/packages/agent/test/harness/session.test.ts`
  - common Session suite over JSONL storage.

V0-B 不需要重新证明 Pi 的全部能力；只需验证消费的 emitted public path 与上述
固定证据仍一致。

---

## 5. Accepted V0-A Foundations to Preserve

以下能力必须保留并回归：

- zero-side-effect preflight；
- Task、Strategy、Run、Attempt、Session、Workspace identity；
- temp-copy Workspace provider；
- Windows case/reparse/junction/link path protection；
- read/list/search/edit/write Tool boundary；
- command-ID allowlist；
- public emitted Direct Pi imports；
- Faux Provider 非交互运行；
- fixed `parse-duration` Coding Task；
- strict TypeScript；
- `.upstream/pi` 和 accepted fixture 不被修改；
- Agent 不可写 evidence root 或外部 Verifier。

专用 Session不得通过放宽 V0-A 路径、命令或 protected-file 约束来完成 V0-B。

---

## 6. Scope

### 6.1 In scope

V0-B 可以在 `workbench/` 内实现：

1. V0-neutral Task/Strategy/Run/Attempt/Session/Workspace/Verifier/Outcome types；
2. `ArtifactRef`、Evidence Index 和 terminal commit marker；
3. reasoning-safe Session evidence storage/mirror；
4. Journal V0 writer and validator；
5. Pi event projection；
6. external Verifier Runner；
7. Outcome Builder and evidence precedence；
8. Run/Attempt budget and terminal reason；
9. `inspect` CLI；
10. deterministic pass/fail/invalid tests and fixtures；
11. README and architecture explanation；
12. Stage 1 evidence and required reports。

允许创建：

```text
fixtures/manifests/
fixtures/verifiers/
workbench/src/evidence/
workbench/src/session/
workbench/src/verifier/
workbench/src/outcome/
workbench/src/inspect.ts
workbench/tests/
.runs/v0-b/
```

文件名可以有有据可查的小幅调整，但责任边界不得合并为新的单体 Driver。

### 6.2 Protected inputs

以下内容不得修改：

- `.upstream/pi/**`；
- `.runs/g003/**`、`.runs/g005/**`、`.runs/g006/**`、`.runs/v0-a/**`
  的既有证据；
- `reference/**`；
- `fixtures/tasks/v0-a-parse-duration/**`；
- 已接受的 G001–G006 Contract / Report / Closeout；
- `docs/reports/V0_A_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V0_A_CLOSEOUT.md`；
- `V0_VERSION_CHARTER.md`；
- `V0_A_GOAL_CONTRACT.md`；
- `09_对接执行、文件权威与验收规则.md`；
- `CURRENT_STATE.md`；
- 根三份历史研究/规划 Markdown；
- `.env` 或任何凭据文件。

### 6.3 Out of scope

- Recovery；
- second Attempt 或 child Attempt；
- same-session continuation；
- Completion Policy 效果比较；
- Skill-only；
- V2 multi-path recovery；
-跨进程 Resume；
- in-flight crash recovery；
- side-effect reconciliation / transaction / exactly-once；
- Git Worktree；
- OS Sandbox；
- Network Tool；
- dependency installation；
- external module port；
- MCP、Subagent、Multi-Agent、A2A、SQLite、UI、Dashboard；
- Git commit、push；
- Pi Core patch 或 private import。

---

## 7. Architecture Responsibilities

```text
CLI
  → Preflight
  → Run Coordinator
      → Workspace Provider
      → Strategy / Budget Snapshot
      → Pi Adapter
          → Session Evidence Mirror
          → Event Projector
      → Journal Writer
      → External Verifier Runner
      → Evidence Validator
      → Outcome Builder
      → Evidence Index + Terminal Record
  → Inspect
```

| Component | Owns | Must not own |
| --- | --- | --- |
| CLI | arguments, exit codes, `run`, `inspect`, dry-run | Outcome causality |
| Coordinator | ordering, identities, budgets, terminalization | Pi internals |
| Pi Adapter | Direct Harness lifecycle and event bridge | task success judgment |
| Session mirror | runtime-complete state plus reasoning-safe evidence copy | Run/Policy truth |
| Journal | append-only lifecycle projection | full unbounded payloads |
| Verifier Runner | external command and VerifierResult | Agent self-evaluation |
| Evidence Validator | identities, seq, refs, digests, required events | task-specific pass logic |
| Outcome Builder | accepted precedence and terminal result | evidence backfill |
| Inspect | read-only integrity and human summary | mutation or repair |

V0-B 应拆分当前 `workbench/src/run.ts` 的责任；不得把所有新机制继续堆入一个
Goal-specific driver。

---

## 8. Data Contracts

字段名允许在实现中做严格 TypeScript 所需的小幅调整，但以下 identity、lineage
和语义不可改变。

### 8.1 TaskSpec

V0-B TaskSpec 必须增加或关联：

```yaml
schema_version: 1_or_forward_compatible_revision
task_id: string
instruction_ref: artifact_ref_or_project_relative_ref
instruction_sha256: sha256
workspace_source_ref: project_relative_ref
workspace_source_digest: sha256
verifier_id: string
verifier_ref: project_relative_ref
verifier_sha256: sha256
acceptance_visibility: hidden_external_or_public_external
tool_profile_id: string
command_descriptors: []
```

V0-B 应创建独立 manifest，引用已接受的 V0-A Workspace source；不得修改原
V0-A fixture 来偷换其 evidence identity。

### 8.2 StrategySpec

```yaml
schema_version: 1
strategy_id: string
base_prompt_id: string
base_prompt_sha256: sha256
skill_refs: []
completion_policy_id: observe_only
recovery_mode: none
tool_profile_id: string
model_profile_id: string
```

V0-B 只有 observe-only。`strategy_id` 不得写死为 baseline/candidate。

### 8.3 Run

```yaml
schema_version: 1
run_id: string
task_id: string
strategy_id: string
comparison_group_id: string_or_null
created_at: rfc3339
status: planned_or_running_or_terminal
config_digest: sha256
source_identity: object
provider_identity: redacted_object
budget: object
attempt_ids:
  - string
```

V0-B 每个 Run 恰有一个 Attempt。

### 8.4 Attempt

```yaml
schema_version: 1
attempt_id: string
run_id: string
ordinal: 1
strategy_id: string
parent_attempt_id: null
trigger: initial
session_id: string
workspace_id: string
started_at: rfc3339
settled_at: rfc3339_or_null
terminal_reason: string_or_null
budget_allocation: object
budget_usage: object
```

### 8.5 WorkspaceRef

保留 V0-A temp-copy provider、source identity、initial/final digest、
parent Workspace 和 write scope。V0-B 不增加 Worktree。

### 8.6 SessionRef

```yaml
schema_version: 1
session_id: string
runtime: pi_agent_core
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
storage_ref: artifact_ref
metadata_digest: sha256
model_profile_id: string
tool_profile_id: string
reasoning_persistence: metadata_only_or_none
resume_capability: not_claimed
```

`storage_ref` 指向 reasoning-safe evidence Session，不等于完整可恢复运行时。

### 8.7 JournalEntryV0

```yaml
schema_version: 1
seq: positive_integer
timestamp: rfc3339
type: closed_event_enum
run_id: string
attempt_id: string
session_id: string
workspace_id: string
data: object
```

最小 closed enum：

```yaml
- run_started
- run_terminal
- attempt_started
- attempt_settled
- attempt_aborted
- attempt_error
- workspace_materialized
- workspace_finalized
- session_linked
- session_entry_persisted
- provider_request_started
- provider_response_observed
- tool_call_started
- tool_call_completed
- tool_call_error
- tool_call_aborted
- verifier_started
- verifier_completed
- evidence_validation_completed
- outcome_created
```

禁止 `data` 覆盖 outer identity 或 event type。

### 8.8 ArtifactRef

```yaml
path: run_relative_path
sha256: sha256
size_bytes: integer
media_type: string
truncated: boolean
```

Artifact path canonicalize 后必须仍在该 Run evidence root 内。

### 8.9 VerifierResult

```yaml
schema_version: 1
verifier_id: string
verifier_sha256: sha256
attempt_id: string
started_at: rfc3339
completed_at: rfc3339
status: passed_or_failed_or_invalid
exit_code: integer_or_null
timed_out: boolean
summary: bounded_string
full_output_ref: artifact_ref
full_output_sha256: sha256
invalid_reason: string_or_null
```

### 8.10 Outcome

```yaml
schema_version: 1
run_id: string
final_attempt_id: string
status: passed_or_failed_or_invalid_or_cancelled
failure_class: agent_or_verifier_or_infrastructure_or_evidence_or_budget_or_user_or_null
terminal_reason: string
initial_verifier_status: string_or_null
final_verifier_status: string_or_null
recovery_triggered: false
attempt_count: 1
evidence_index_ref: run_relative_path
```

`evidence_index_ref` 使用经过验证的 run-relative path，而不是带 index digest
的 ArtifactRef，以避免 Outcome 和 Evidence Index 形成 digest cycle。

### 8.11 Evidence Index and terminal record

Evidence Index：

- 列出所有构成 terminal evidence 的文件；
- 保存相对路径、digest、size、media type 和责任；
- 包含 `outcome.json`；
- 不包含自己的 digest。

最后写入：

```yaml
terminal_record:
  schema_version: 1
  run_id: string
  outcome_sha256: sha256
  evidence_index_sha256: sha256
  committed_at: rfc3339
```

`inspect` 只有在 terminal record、Outcome 和 Evidence Index 三者匹配时，才
把 Run 视为已提交的 terminal evidence。该 marker 不扩展为通用事务系统。

---

## 9. Session Evidence Contract

### 9.1 Runtime and evidence separation

专用 Session应实现等价于以下责任的存储边界：

```text
complete in-process runtime Session
  +
append-only reasoning-safe JSONL evidence Session
```

它可以采用组合式 `SessionStorage`、受测的 mirror adapter 或同等的 public
API 方案；不得修改 Pi。

### 9.2 Required persisted content

- Session header and ID；
- entry ID、parent ID、entry type、timestamp；
- visible user/assistant text under budget；
- Tool Call ID/name and safe input projection；
- Tool Result call ID/name/error and bounded output projection；
- usage/cost metadata where present；
- reasoning redaction metadata：
  - block present；
  - content type；
  - character/byte count；
  - never the body or signature。

### 9.3 Forbidden persisted content

- thinking/reasoning body；
- thought/thinking signature；
- API key；
- authorization header；
- full Provider request/response body；
- unbounded Tool Result；
- `.env` content。

### 9.4 Session validation

必须证明：

- public `JsonlSessionStorage.open()` 可读取 evidence Session；
- Session ID 与 Run/Attempt/Journal 一致；
- Tool Call / Result IDs 完整配对；
- single-branch parent chain valid；
- persisted reasoning/credential scan 为 0；
- persistence failure 产生 `invalid/evidence`。

### 9.5 Non-claim

V0-B Session evidence 不证明：

- cross-process Resume；
- in-flight crash recovery；
- redacted evidence Session 可直接继续 Provider 对话。

---

## 10. Event Projection and Journal

### 10.1 Source events

Pi Adapter 应优先消费 public:

- typed `tool_call` / `tool_result` hooks；
- `before_provider_request`；
- `after_provider_response`；
- Agent lifecycle events；
- `abort`；
- `settled`。

Tool wrapper 已有的 start/end/error audit 可以作为交叉检查，但不能产生两个互相
矛盾的 Tool truth sources。

### 10.2 Required ordering

至少证明：

```text
run_started
< attempt_started
< workspace_materialized
< session_linked
< provider/tool/session events
< attempt_settled
< workspace_finalized
< verifier_started
< verifier_completed
< evidence_validation_completed
< outcome_created
< run_terminal
```

`verifier_started` 之前必须存在 observed settled 和完整 Session persistence。

### 10.3 Journal validity

- seq 从 1 严格连续递增；
- event enum closed；
- 所有 outer IDs 与对象一致；
- required events 不得缺失；
- Tool Call Result 数量和 IDs 可关联；
- ArtifactRef 全部可解析并匹配；
- Journal 失败不得靠 Report 文本补写。

---

## 11. Verifier Contract

### 11.1 Execution boundary

Verifier 必须：

- 位于 Workspace 和 Agent write scope 之外；
- 在 preflight 固定 ID、path 和 digest；
- 在 settled 后由 Coordinator 调用；
- 使用显式 executable、argv、cwd、environment allowlist、timeout 和 output
  cap；
- 以 `shell: false` 或等价无 shell 注入路径运行；
- 保存 exit code、timed-out flag、duration、bounded summary 和 full-output
  ArtifactRef。

### 11.2 Result classification

| Observation | Verifier status |
| --- | --- |
| acceptance validly completes and passes | `passed` |
| acceptance validly completes and detects task failure | `failed` |
| missing/digest mismatch/spawn error/timeout/contract parse failure/output hard-cap breach | `invalid` |

Verifier 的 `invalid` 不得触发 Agent Recovery，也不得成为 `failed/agent`。

### 11.3 Fixed first verifier

V0-B 创建新的外部 `parse-duration` verifier。它可以参考 G006 acceptance 的
已验证测试思想，但不得在运行时依赖 G006 Driver 或让 Agent 修改 verifier。

Verifier source、ID、digest 和命令必须写入 Task/Run evidence。

---

## 12. Outcome Contract

### 12.1 Binding precedence

按以下因果顺序执行：

1. 关键 evidence 缺失/冲突/无法关联 → `invalid/evidence`；
2. Verifier 无法有效运行 → `invalid/verifier`；
3. infrastructure 阻止可靠结论 → `invalid/infrastructure`；
4. 用户主动取消 → `cancelled/user`；
5. 完整可信的硬预算停止 → `failed/budget`；
6. valid Verifier pass + complete evidence → `passed/null`；
7. valid Verifier fail + V0-B zero recovery → `failed/agent`。

不得使用 enum 排序代替因果判断。

### 12.2 Single terminal rule

- 一个 Run 只能有一个 terminal Outcome；
- `outcome.json` 使用 collision-safe / write-once 创建；
- V0-B `attempt_count` 永远为 1；
- `recovery_triggered` 永远为 false；
- terminal record 最后写入；
- terminal 后不得回填原始事件或重写 Outcome。

若 terminalization 未完成，`inspect` 必须报告 incomplete/invalid evidence，
不得把暂存的 `passed` 当作已提交 Outcome。

---

## 13. Budget, Abort and Terminal Reason

### 13.1 Required dimensions

Stage 1 每个 Run 必须记录：

```yaml
provider_request_limit: bounded_integer
provider_request_usage: integer
tool_call_limit: bounded_integer
tool_call_usage: integer
wall_time_limit_ms: bounded_integer
wall_time_usage_ms: integer
token_limit: integer_or_not_applicable
token_usage: integer_or_unknown
cost_limit_usd: 0
cost_usage_usd: 0
verifier_timeout_ms: bounded_integer
verifier_output_limit_bytes: bounded_integer
external_provider_calls: 0
```

具体非财务上限可以由实现基于 V0-A task 的已知 8-call Faux sequence设置，但必须：

- 在 Strategy/Run snapshot 中显式；
- 由测试覆盖；
- 不允许无限值；
- 不改变 V0 Charter 的真实模型额度。

### 13.2 Abort evidence

记录：

- abort requested；
- abort/idle completion；
- last complete seq；
- outstanding Tool Call IDs；
- final Workspace digest if safely available；
- terminal reason。

V0-B 不承诺系统级 process-tree termination。若无法确认副作用或证据完整性，
必须选择 `invalid`，不得自动重试。

---

## 14. Artifact and Secret Boundaries

### 14.1 Inline budgets

建议上限：

```yaml
journal_inline_text_bytes: 8192
verifier_summary_bytes: 8192
verifier_full_output_hard_cap_bytes: 262144
tool_result_inline_bytes: 8192
```

实现可以在不放宽风险的情况下选择更小值。若选择更大值，必须在 Report 中说明
理由并保持有界。

### 14.2 Externalization

超过 inline budget 的 Tool/Verifier 输出写入 `artifacts/`，Journal 只保留
ArtifactRef、summary、truncation 和 retrieval path。

Verifier full output 超过 hard cap 时，不得假装完整；Verifier 结果为
`invalid`，并保留已捕获的有界诊断 Artifact。

### 14.3 Final secret scan

在 terminal record 写入前，必须扫描：

- Session evidence；
- Journal；
- Run/Attempt/Workspace/Verifier objects；
- Artifacts；
- 待写 Outcome 的确定性序列化内容。

不得把实际 secret 值打印进日志或 Report。Evidence Index 和 terminal record
只能包含路径、digest、size 和固定 metadata。

---

## 15. CLI and Inspect

### 15.1 `run`

保留：

```text
workbench run --task <manifest> --dry-run
workbench run --task <manifest>
```

可以增加显式 deterministic scenario/test-only injection，但测试注入不得成为
默认用户 Product Surface。

### 15.2 `inspect`

至少支持：

```text
workbench inspect <run-id>
```

必须：

- 拒绝 path traversal 和非 Run ID 输入；
- 验证 terminal record、Outcome、Evidence Index 和 ArtifactRefs；
- 显示 identity、status、failure class、terminal reason、budget、Verifier、
  Session/Workspace refs；
- 显示 redaction/truncation；
- 默认不展开大 Artifact；
- 不显示 secret/reasoning；
- 对 incomplete/integrity-invalid evidence 返回非零 exit code；
- 只读，不修复或改写证据。

---

## 16. Deterministic Stage 1

### 16.1 Model and Provider

```yaml
provider: public_emitted_faux
external_provider_calls: 0
thinking_level: off_for_primary_deterministic_task
recovery_attempts: 0
```

除主 Task 外，还必须用合成 Session entry 测试 reasoning block/signature
redaction，以免 `thinking: off` 让安全测试虚假通过。

### 16.2 End-to-end cases

至少执行：

1. `passed/null`
   - Faux Agent 修复 task；
   - settled；
   - external verifier pass；
   - complete terminal evidence。
2. `failed/agent`
   - Faux Agent settled but leaves invalid implementation；
   - external verifier validly fails；
   - zero recovery。
3. `invalid/verifier`
   - fixed test injection causes verifier timeout/missing/contract failure；
   - must not become Agent failure。
4. `invalid/evidence`
   - fixed test injection causes Session/Journal/ref inconsistency；
   - evidence precedence wins even if task code would pass。

Outcome Builder 还必须覆盖：

- `failed/budget`；
- `cancelled/user`；
- `invalid/infrastructure`；
- precedence combinations。

### 16.3 Accepted regression

必须继续通过：

- strict TypeScript；
- complete Workbench tests；
- V0-A path-security regression；
- public emitted Pi import smoke；
- accepted `parse-duration` public task test；
- protected-file and root tracked-diff checks。

---

## 17. Optional Stage 2 — Real-route Smoke

### 17.1 Not authorized by this Contract activation

```yaml
current_real_model_calls_authorized: 0
future_max_runs_if_separately_authorized: 1
future_cost_cap_usd: 1
automatic_retry: false
recovery: false
```

### 17.2 Preconditions for requesting authorization

专用 Session完成 Stage 1 后必须停止并提交：

- all deterministic Gates；
- exact source digest；
- secret/reasoning scan；
- real-run manifest draft；
- exact provider/model/thinking/timeout/request/tool/token/cost budgets；
- exact task/verifier identities；
- credential read boundary；
- expected Pause behavior。

只有主 Session审查并由用户明确授权后，才可执行一个 observe-only real Run。

### 17.3 Real-run non-claims

即使 Stage 2 通过，也不证明：

- Recovery effect；
- Completion Policy improvement；
- statistical reliability；
- cross-process Resume；
- OS Sandbox 或 network egress block。

---

## 18. Gates

### Gate A — Control and source identity

Pass：

- 当前正式 Contract status 为 activated；
- `CURRENT_STATE.active_goal` 为 V0_B；
- 精确 Control Baseline Commit 已记录；
- tracked files clean；
- 已登记未跟踪 `reference/` 可存在但不被修改/提交；
- root HEAD 与 baseline 一致；
- `.upstream/pi` commit 正确且 clean；
- V0-A implementation baseline 可定位；
- dedicated Session owner 正确；
- real model authorization 为 0。

### Gate B — Contract and preflight

Pass：

- V0-neutral data contracts strict typecheck；
- V0-B manifest/Strategy/Verifier identities and digests fixed；
- invalid input fails before Workspace/Session/Provider/Verifier side effects；
- V0-A fixture byte identity unchanged。

### Gate C — Session and Journal

Pass：

- reasoning-safe evidence Session created；
- public JSONL open succeeds；
- IDs/parent chain/Tool Call-Result correlation pass；
- Journal closed enum, seq and four identities pass；
- persistence/event failures become `invalid/evidence`；
- reasoning/signature/secret scan has zero match。

### Gate D — External Verifier

Pass：

- Verifier is outside Agent write scope；
- runs only after observed settled；
- ID/digest/cwd/env/timeout/output cap recorded；
- pass, valid task failure and invalid Verifier paths are distinct；
- full output ArtifactRef valid。

### Gate E — Outcome and terminal evidence

Pass：

- accepted precedence implemented and tested；
- exactly one write-once Outcome；
- Evidence Index contains all required terminal evidence；
- terminal record matches Outcome and Index；
- incomplete marker/index/digest is rejected；
- Reports cannot backfill missing evidence。

### Gate F — Budget, abort and inspect

Pass：

- budget snapshot/usage and terminal reason persisted；
- budget/user/infrastructure paths tested；
- abort evidence is bounded and truthful；
- `inspect` validates integrity and rejects traversal；
- `inspect` does not expose secret/reasoning/full unbounded payload。

### Gate G — Deterministic Coding Task

Pass：

- pass end-to-end Run；
- valid agent-failure end-to-end Run；
- verifier-invalid end-to-end Run；
- evidence-invalid end-to-end Run；
- all use external Provider calls 0；
- authoritative pass Run ID and supporting counterexample Run IDs recorded；
- Workbench tests and strict TypeScript pass。

### Gate H — Scope and continuity

Pass：

- Pi Core patch/private import 0；
- Recovery/child Attempt 0；
- external network/download 0；
- control files unchanged；
- V1/V2 lineage preserved；
- README distinguishes current claims and non-claims；
- source delta contains only authorized Workbench/fixture/report changes。

### Gate R — Optional real-route smoke

Gate R does not exist for execution until separately authorized. If never
authorized, Stage 1 may still be proposed for `PASS_V0_B_EVIDENCE_FOUNDATION`
with the real-route non-claim explicit.

---

## 19. Definition of Done

V0-B Stage 1 DoD：

1. Gate A–H pass；
2. accepted V0-A tests remain green；
3. strict TypeScript passes；
4. Workbench uses only public emitted Pi imports；
5. Task/Strategy/Run/Attempt/Workspace/Session/Verifier/Outcome identities link；
6. V0-B Run has exactly one Attempt；
7. reasoning-safe Session evidence is append-only and public-openable；
8. Tool Call/Result IDs correlate across Session and Journal；
9. Journal seq is complete and closed-envelope validation passes；
10. Verifier only starts after settled；
11. Verifier task failure and Verifier invalid are distinct；
12. ArtifactRefs resolve inside the Run root and match digest/size；
13. Outcome precedence matches V0 Charter；
14. one terminal Outcome and terminal record exist for valid terminal runs；
15. incomplete/corrupt evidence is not accepted as passed/failed agent evidence；
16. budget/abort/terminal reason are recorded；
17. `inspect` verifies integrity without leaking protected material；
18. pass/fail/verifier-invalid/evidence-invalid deterministic cases execute；
19. external Provider/model calls are exactly 0；
20. Recovery and child Attempts are exactly 0；
21. Pi patches/private imports are exactly 0；
22. `.upstream/pi`, V0-A fixture, control documents and reference materials are
    unchanged；
23. final secret/reasoning scan is 0 match；
24. Implementation Report, Closeout Draft, Evidence Index, Source Delta,
    commands/exit codes and `CURRENT_STATE_UPDATE_PROPOSAL` are complete；
25. all unverified claims and Stage 2 status are explicit。

DoD 不要求真实模型 Stage 2，也不要求 V0-C Completion Recovery。

---

## 20. Required Deliverables

专用 Goal Session必须提交：

1. authorized Workbench source and tests；
2. V0-B external verifier and manifest；
3. `.runs/v0-b/evidence/EVIDENCE_INDEX.md` or equivalent Goal evidence index；
4. authoritative pass Run and deterministic counterexample Run evidence；
5. `docs/reports/V0_B_IMPLEMENTATION_REPORT.md`；
6. `docs/reports/V0_B_CLOSEOUT_DRAFT.md`；
7. source inventory and source delta；
8. exact commands, exit codes and test counts；
9. exact root/Pi HEAD and status；
10. actual external Provider/model call count；
11. secret/reasoning scan result；
12. structured `CURRENT_STATE_UPDATE_PROPOSAL`。

专用 Session不得自行创建正式 Closeout、修改 Current State 或接受 V0-B。

---

## 21. Required Report Claims

Implementation Report 必须分别标记：

- `Fact`；
- `Inference`；
- `Recommendation`；
- `Unconfirmed`。

必须说明：

- V0-A 哪些模块被保留；
- G006 哪些机制被适配、重写或拒绝；
- Pi 公开 API 和测试证据；
- Session runtime/evidence 双边界；
- Outcome precedence 的测试；
- Verifier failure 与 Agent failure 的区别；
- exact source paths and symbols；
- all known limitations。

---

## 22. Pause Conditions

命中任一项立即停止并提交
`docs/reports/V0_B_PAUSE_REPORT.md`：

1. root baseline、V0-A 状态、Pi commit/version/license/status 不一致；
2. 需要 Pi Core patch、private import 或 partial emitted build；
3. 需要依赖安装、Registry、外部下载或网络；
4. reasoning body、thought signature、API key 或 authorization header 进入
   persisted evidence；
5. external Verifier 位于 Agent write scope 或可被 Agent 修改；
6. Verifier infrastructure failure 无法与 valid task failure 区分；
7. Observer/Journal/Session/Tool IDs 无法形成最小关联；
8. Evidence failure 只能被误报为 Agent failure；
9. 必须放宽 V0-A Workspace/path/command boundary；
10. 必须实现 Recovery、second Attempt、cross-process Resume、durable runtime
    或通用 transaction；
11. 需要真实模型调用但用户尚未单独授权 Stage 2；
12. 需要修改任何 protected control/reference/upstream/V0-A evidence 文件；
13. 需要外部模块移植但未完成 source/version/license/attribution Gate；
14. output/secret safety 只有通过删除原始失败证据才能满足；
15. 专用 Session认为需要改变已接受 Outcome precedence、V0 Goal 边界或
    V1/V2 continuity；
16. 任何新增事实会使 V0-B 不再是一个有界 Goal。

Pause Report 只写：

- observation；
- exact evidence；
- why blocked；
- what user/main-session decision is needed；
- confirmed Provider/model call count；
- preserved files/status。

不得在 Pause 后自行换路线。

---

## 23. Claims Allowed After Acceptance

若 Stage 1 被主 Session和用户正式接受，可以声称：

- Workbench 能把一个 settled Attempt 转化为可审计 external Outcome；
- Pi Session、Tool、Journal、Workspace、Verifier 和 Outcome 可关联；
- reasoning-safe Session evidence 可持久化并由 public JSONL API 重新读取；
- Verifier valid failure 与 Verifier invalid 可区分；
- invalid evidence 不会被当作 Agent failure；
- `inspect` 可复核 terminal evidence；
- 以上 deterministic route 不需要 Pi Core patch。

若 Stage 2 未授权，必须附加：

- V0-B-specific real-route smoke not executed；
- historical G006 real route remains accepted but uses pre-V0-B evidence
  contracts。

---

## 24. Claims Not Allowed

即使 V0-B 完成，也不得声称：

- Completion Policy improves real-model coding performance；
- real Recovery effect proven；
- V0 is complete；
- cross-process Resume proven；
- crash-after-side-effect reconciled；
- exactly-once Tool execution；
- OS Sandbox or network egress blocking；
- statistically valid Eval；
- V1 Skill competition exists；
- V2 adaptive multi-path recovery exists；
- Pi provides Workbench-specific Outcome/Verifier/Policy。

---

## 25. Closeout Dispositions

允许的 Stage 1 建议处置：

```yaml
- PASS_V0_B_EVIDENCE_FOUNDATION
- PAUSE_V0_B
- FAIL_V0_B_CONTRACT
```

专用 Session只能建议处置。主 Session负责复核，用户负责正式接受或要求返修。

---

## 26. Accepted Decisions and Remaining User Authority

```yaml
accepted_decisions:
  - decision: accept_formal_v0_b_goal_contract
    evidence: V0-A foundation is accepted and V0-B precontract research finds no Pi Core blocker
    accepted_value: accepted
    consequence: Contract is formal and binding

  - decision: authorize_v0_b_activation_and_control_baseline_commit
    evidence: dedicated implementation must start from a committed active-goal control baseline
    accepted_value: authorized
    consequence: main Session can prepare exact baseline and specialist start prompt

closing_decisions:
  - decision: accept_v0_b_stage_1
    accepted_value: PASS_V0_B_EVIDENCE_FOUNDATION
    accepted_by_user: 2026-07-31
    consequence: V0_B_is_closed_and_active_goal_is_null

future_authority_not_granted:
  - optional_V0_B_real_route_Stage_2
  - V0_C_precontract_research_or_Contract
  - V0_C_Activation_or_implementation
  - any_real_model_call
```

---

## 27. Final Stop Point

```yaml
contract_status: closed_accepted
active_goal: false
implementation_started: true
implementation_completed: true
accepted_disposition: PASS_V0_B_EVIDENCE_FOUNDATION
implementation_baseline_commit: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
focused_independent_reaudit: passed
real_model_calls_authorized: 0
stage_2: not_authorized_not_executed
next_goal:
  id: V0_C_BOUNDED_COMPLETION_AND_USER_FACING_USE
  status: charter_defined_not_authorized
```

V0-B 已停止。不得由主 Session、原专用实现 Session 或原独立审计 Session继续
实现、创建新 Run、执行 Stage 2 或进入 V0-C。任何 V0-C 研究、Contract、
Activation、实现和真实 Coding Task 都需要后续独立用户授权。
