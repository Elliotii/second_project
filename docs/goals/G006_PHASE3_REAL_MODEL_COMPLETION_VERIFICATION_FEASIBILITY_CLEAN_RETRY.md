# G006 — Phase 3 Real-model Completion Verification Feasibility Clean Retry

```yaml
goal_id: G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY
status: implementation_baseline_committed_awaiting_separate_stage_2_authorization
phase: Phase_3A_real_model_path_feasibility_clean_retry
owner: future_dedicated_G006_execution_session
architecture_owner: main_session
created: 2026-07-29
contract_creation_authorized_by_user: true
contract_accepted_by_user: true
accepted_by_user: 2026-07-29
activation_authorized: true
activation_authorized_by_user: 2026-07-29
stage_1_gate_0_implementation_authorized: true
stage_2_real_model_execution_authorized: false
real_model_call_authorized: false
accepted_contract_baseline_commit_authorized: consumed
accepted_contract_baseline_commit: aa2d12f701f4cecbc963a854e00a1d5bf312d77c
implementation_baseline_commit_authorized: consumed
implementation_baseline_commit: resulting_HEAD_of_this_revision
further_git_commit_authorized: false
formal_workbench_creation_authorized: false
pi_core_modification_authorized: false
```

本 Goal Contract 已于 2026-07-29 被用户接受，用户随后明确授权激活 G006
Stage 1 Gate 0。Accepted-contract baseline commit 已按用户明确授权创建，Stage
1 随后完成实现、离线验证和 Main Session source review，外部 provider calls 为
0，且未加载 credential。Gate 0 已通过并暂停；implementation-baseline Git
commit 已获用户明确授权并由本 revision 创建。Stage 2 和模型调用仍未授权。

## 1. Objective

在不修改 Pi Core、不改变 G005 的模型、任务、工具、Verifier、Policy 和预算
的前提下，完成一次证据有效的真实模型 Baseline / Candidate 配对运行，回答：

> 修正 G005 已知 Observer 与 Journal 缺陷并冻结完整实现身份后，Direct
> `pi-agent-core` `AgentHarness` 能否通过当前 DeepSeek V4 Flash 公共路径，
> 完成受限 Tool Coding Cycle、settled 后外部验证，以及在 Candidate 首次验证
> 失败时至多一次的同 Session Recovery？

G006 只验证真实模型机制与证据链可行性。它不验证 Completion Verification
在一般 Coding 任务上是否提高成功率，也不授权 Policy promotion 或最终 Pi Go。

## 2. Why a clean retry is necessary

G005 的 Baseline 已经观察到：

- 4 次已认证 `deepseek-v4-flash` 响应；
- 3 次 Tool/ToolResult 往返；
- Tool Call 后的 `reasoning_content` 协议连续性；
- 最终 assistant response；
- 1 次 settled。

但 G005 的外部 Verifier 未运行、Candidate 未开始，并存在两处项目侧证据缺陷：

1. 使用 `harness.on("after_provider_response")` 观察实际只经
   `emitOwn()` 分发给 `subscribe(...)` 的事件；
2. Journal 将 payload 平铺进 envelope，使 payload 的 `type` 覆盖外层事件名。

因此 G005 已按 Main Session 决策关闭为 `INVALID_G005_EVIDENCE`。不得修补旧
证据、继续旧 Baseline、启动旧 Candidate，或把 G006 视为 G005 的第二次尝试。
G006 必须有新的实现身份、运行根和完整配对证据。

## 3. Evidence labels and authority

所有报告中的重要结论必须标注：

```yaml
Fact: pinned source/test/artifact/observed command directly supports the claim
Inference: cited facts support a reasoned interpretation
Recommendation: proposed next action or design choice
Unconfirmed: not established by current evidence
```

证据优先级：

1. pinned local Pi source and tests；
2. G006 actual commands and immutable generated evidence；
3. 本契约、ADR、`CURRENT_STATE.md` 和已接受的 G005 closeout；
4. current official DeepSeek API documentation；
5. `reference/cc-harness-knowledge` / `reference/src`；
6. architecture inference。

外部文档不能证明 pinned Pi 行为，Pi 源码不能证明外部服务当前可用。

## 4. Frozen inheritance and permitted delta

### 4.1 Frozen experimental inputs

G006 必须继承 G005 以下条件：

```yaml
runtime:
  path: direct_public_emitted_pi_agent_core_AgentHarness
  pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
  pi_core_patch_count: 0
  os: Windows_native
  wsl: prohibited

provider:
  id: deepseek
  factory: "@earendil-works/pi-ai/providers/deepseek"
  api: openai-completions
  base_url: https://api.deepseek.com
  credential_key: DEEPSEEK_API_KEY

model:
  id: deepseek-v4-flash
  thinking_level: high
  reasoning_effort: high
  thinking_type: enabled
  context_window: 1000000
  max_tokens: 8192
  retries: 0
  request_timeout_ms: 120000

task:
  id: parse-duration-prefix-parser-v1
  mutable_path: src/parse-duration.ts
  initial_behavior: public_pass_external_acceptance_fail

tools:
  - read_task_and_source
  - write_source
  - run_public_tests

policy:
  baseline: one_initial_cycle_then_one_verifier_then_stop
  candidate: one_initial_cycle_then_verifier_then_at_most_one_failure_triggered_recovery
  valid_paired_attempts: 1
  model_ids: 1
```

System prompt、initial prompt、recovery prompt template、Tool schemas、Tool
descriptions、fixture bytes、public tests、acceptance tests、Verifier semantics、
run order 和预算也必须与 G005 相同；仅 Goal/path identity 可机械替换。

### 4.2 Only permitted implementation delta

G006 相对已提交 G005 实现只允许：

1. 将 `after_provider_response` 的观察移动到 public
   `AgentHarness.subscribe(...)` 事件流；
2. 将 Journal 升级为 schema v2 closed envelope，所有领域 payload 嵌套在
   `data` 下；
3. 增加只用于证明上述两项修复、错误归因和 pre-call provenance 的离线测试；
4. 增加 G005 契约原本要求但未在首次调用前落实的完整 source identity；
5. 进行 G005→G006 Goal ID、路径和 artifact name 的机械替换。

任何模型、任务、工具能力、Verifier assertion、Policy、预算、Session
语义、provider retry 或 Pi build boundary 变化都不是 permitted delta。

## 5. Required read order for the execution session

未来专用 G006 Session 必须按顺序完整阅读：

1. `CURRENT_STATE.md`；
2. 本契约的已接受版本；
3. `docs/reports/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY_PRECONTRACT_RESEARCH.md`；
4. `docs/reports/G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_REPORT.md`；
5. `docs/reports/G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLOSEOUT.md`；
6. `docs/goals/G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY.md`；
7. `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md` 的 Completion
   Verification、Runtime 和 Phase 3 相关部分；
8. `docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_REPORT.md`；
9. 每个适用的 `.upstream/pi/AGENTS.md`；
10. 第 8 节列出的 pinned Pi 源码和测试。

不得只读 README 或 G005 摘要后直接实现。

## 6. Two-stage authorization model

### 6.1 Contract acceptance is not execution authority

用户接受本契约后，必须另行明确是否激活 Stage 1。仅“接受契约”不自动授权
任何实现、依赖安装、`.runs/g006` 或模型调用。

### 6.2 Stage 1 — Gate 0 implementation and offline verification

需要用户明确授权：

```yaml
G006_activation_authorized: true
stage_1_gate_0_implementation_authorized: true
stage_2_real_model_execution_authorized: false
```

Stage 1 可执行：

- 创建 `spikes/pi-runtime/g006/`；
- 从已提交 G005 复制固定实现并只应用第 4.2 节 delta；
- 创建 `.runs/g006/pi`、`.runs/g006/source` 和
  `.runs/g006/preflight`；
- 以 scripts disabled 方式准备 exact pinned isolated Pi；
- 运行公共 emitted imports、strict TypeScript、Faux 和其他离线测试；
- 创建 Gate 0 review report；
- 更新 `CURRENT_STATE.md` 为等待 Main Session source review。

Stage 1 不得：

- 读取 credential value；
- 创建 `.runs/g006/attempt-001`；
- 发起任何 provider/model request；
- 修改 G005 code/evidence；
- Git commit；
- 进入 Stage 2。

### 6.3 Mandatory Main Session review and commit checkpoint

Gate 0 通过后必须暂停。Main Session 逐项审查：

- 完整 G005→G006 source delta；
- response Observer 是否只走 `subscribe(...)`；
- Journal v2 是否消除 envelope collision；
- error attribution tests；
- full source identity manifest builder；
- 全部离线命令和结果；
- `.runs/g006/attempt-001` 仍不存在；
- provider call count 为 0。

用户随后必须显式授权 Stage 1 implementation baseline commit。只能 stage 和
commit G006 契约/实现/报告/控制文件的明确路径；不得包含 `reference/`、
`.upstream/`、`.runs/` 或 secret。

### 6.4 Stage 2 — real paired attempt

完成并验证 exact clean implementation `HEAD` 后，用户还必须另行明确：

```yaml
stage_2_real_model_execution_authorized: true
real_model_call_authorized: true
```

没有该授权，不得执行 Gate A 的 credential process 或创建 attempt root。
G005 的旧授权已经消耗，不是 G006 的开放权限。

## 7. Activation and checkpoint preconditions

### 7.1 Stage 1 activation preconditions

```yaml
project_root: D:/AI/AI_Projects/project2
root_git_initialized: true
root_status: clean_except_explicitly_accepted_untracked_reference_tree
accepted_contract_commit: record_exact_HEAD
pi_reference_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_reference_clean: true
g005_disposition: INVALID_G005_EVIDENCE
g005_code_and_evidence_immutable: true
g006_spike_absent: true
g006_runs_root_absent: true
formal_workbench_absent: true
```

如果目标路径已存在、G005 或 `.upstream/pi` 被修改、或 root 存在未接受的
用户变更，先停止并返回 Main Session，不得清理或覆盖。

### 7.2 Stage 2 clean-HEAD preconditions

```yaml
gate_0: passed_and_main_session_accepted
implementation_baseline_commit: explicitly_authorized_and_created
root_HEAD: record_exact_value
root_status: clean_except_explicitly_accepted_untracked_reference_tree
g006_source_digest: matches_reviewed_Gate_0_digest
g006_isolated_pi: pinned_and_clean
g006_attempt_root: absent
provider_calls_for_G006: 0
credential_file: .env.g005
credential_file_ignored: true
credential_value: not_inspected_by_control_shell
```

任何 precondition 失败都禁止首次模型调用。

## 8. Pinned Pi basis to recheck

| Claim | Pinned source / symbol | Test or prior evidence |
| --- | --- | --- |
| Response event is emitted through subscriber path | `.upstream/pi/packages/agent/src/harness/agent-harness.ts` — `createStreamFn()`, `emitOwn()`, `subscribe()`, `on()` | G005 preserved assistant evidence; G006 Faux regression |
| Public type surface includes the event | `.upstream/pi/packages/agent/src/harness/types.ts` — `AfterProviderResponseEvent`, `AgentHarnessEventResultMap` | strict public consumer test |
| Faux invokes `onResponse` once per request | `.upstream/pi/packages/ai/src/providers/faux.ts` — `createFauxCore()` | `.upstream/pi/packages/agent/test/harness/agent-harness-stream.test.ts`; G003 |
| Public wildcard exports Faux and DeepSeek providers | `.upstream/pi/packages/ai/package.json` — `exports["./providers/*"]` | emitted import smoke |
| Direct Harness routes provider turns through Models | `.upstream/pi/packages/agent/src/harness/agent-harness.ts` — `createStreamFn()`, `createLoopConfig()` | pinned harness stream tests; G003/G005 |
| Tool calls and results are Session messages before settled | pinned AgentHarness/agent-loop/Session paths cited by G003 report | G003 deterministic Gate D; G005 partial Session |
| DeepSeek reasoning replay uses compatible assistant reasoning content | `.upstream/pi/packages/ai/src/api/openai-completions.ts` relevant conversion branch | G005 payload/session metadata |

If public emitted packages do not match these pinned source facts, pause instead
of importing internal source paths.

## 9. Gate 0 — pre-model correctness gate

Gate 0 must run with zero credentials and zero external provider calls.

### 9.1 Required source implementation

Expected tracked G006 tree:

```text
spikes/pi-runtime/g006/
  README.md
  package.json
  tsconfig.json
  driver.ts
  gate-a.ts
  gates.test.ts
  journal.ts
  model.ts
  public-import-smoke.mjs
  public-type-smoke.ts
  resolve-public-types.mjs
  runtime-utils.ts
  secret-scan.ts
  session-storage.ts
  stage-model-data.mjs
  tools.ts
  verifier.ts
  acceptance/acceptance.test.ts
  fixtures/parse-duration/...
```

文件可根据最小实现合并，但不得通过共享可变 G005 文件来绕过独立 G006
source identity。复制的 task/fixture/test/Verifier bytes 必须证明与 G005 相同。

### 9.2 Observer regression

用 public emitted Faux Provider 运行两次 provider turn，其中第一次产生固定
Tool Call，第二次结束。必须证明：

```yaml
faux_provider_calls: 2
before_provider_request_count: 2
subscriber_after_provider_response_count: 2
response_statuses: [200, 200]
assistant_message_end_count: 2
tool_start_count: 1
tool_end_count: 1
settled_count: 1
named_after_provider_response_hook_used: false
```

### 9.3 Journal v2 regression

Journal envelope 至少包含：

```yaml
schemaVersion: 2
seq: positive_monotonic_integer
timestamp: ISO_8601
type: closed_G006_event_name
runId: string
sessionId: string
cycle: initial_or_verification_recovery
data: object
```

必须测试 nested `data.type=thinking` 与 `data.type=source_write` 无法覆盖
outer `type`、`seq`、`runId`、`sessionId` 或 `cycle`。

### 9.4 Error-attribution regression

纯离线测试必须覆盖：

- response counter 与 response-ID evidence 冲突 → evidence invalid；
- source/config parity drift → evidence invalid；
- 401/403/408/429/5xx/network/timeout/quota → external service；
- 证据一致时的 public route failure → route；
- Verifier failed 但 route completed → task outcome，而非 route failure。

### 9.5 Provenance regression

必须证明 pre-call manifest builder 包含并校验：

- root `HEAD`；
- pinned Pi commit；
- complete tracked G006 file inventory and tree digest；
- selected Driver/Tool/Verifier/fixture/acceptance hashes；
- Observer version and Journal schema version；
- prompts and schemas；
- emitted package identity；
- Baseline/Candidate normalized equivalence。

### 9.6 Existing offline gates retained

G005 已有以下离线检查必须保留：

- public emitted runtime/type import；
- strict TypeScript consumer；
- frozen model descriptor and restricted tool schema；
- redacted Session persists no reasoning body/signature；
- initial fixture public-pass/external-fail；
- deterministic known repair external-pass；
- acceptance/verifier/tool paths outside model Tool address space。

### 9.7 Gate 0 deliverable

```text
docs/reports/G006_GATE_0_IMPLEMENTATION_AND_OFFLINE_REVIEW.md
```

报告必须记录 exact commands/results、zero-provider-call proof、source tree
digest、remaining unknowns 和请求 Main Session review 的明确 pause。

## 10. Isolated Pi and artifact setup

Stage 1 仅在授权后可：

1. 从 `.upstream/pi` 创建 fresh non-hardlinked clone 到 `.runs/g006/pi`；
2. checkout exact pinned commit；
3. `npm ci --ignore-scripts`；
4. 使用 G003/G005 已接受的 exact
   `@earendil-works/pi-ai@0.82.1` artifact；
5. 优先从 preserved local G005 artifact 做独立 copy 和完整复核；若不存在或
   identity 不符，才以同一 package/version/registry 重新获取；
6. 验证 integrity、shasum、gitHead、archive safety、712 members、38 selected
   model-data files 和 restored manifest SHA-256；
7. 运行 pinned `check:model-data`、standard `pi-ai build:offline` 和 standard
   `pi-agent-core build`；
8. 保持 isolated Pi tracked tree clean。

Frozen artifact identity：

```yaml
package: "@earendil-works/pi-ai@0.82.1"
integrity: "sha512-3WFYRhEp3lQB3444EhPMBcM7zSaEUE3eJgHOR7s4081NLqbw/FsWilIKWXSua0Gv3sRr7m9xMidR3pPDE7jI/A=="
shasum: "02ebdfc2997fd88ca1f51a7b5c01f337a9462f34"
source_git_head: b4f293684bba718d59cc1157679bcf6157b3a7f5
selected_files: 38
restored_manifest_sha256: c2d89b03ccb2c095c59ead0437592b21e9676d049ad8e92ea90a466adf10b24d
```

任何 artifact、inventory、live hydration 或 build-boundary 变化都需暂停。

## 11. Current external API checkpoint

Stage 2 前重新检查官方 primary sources：

- <https://api-docs.deepseek.com/updates/>
- <https://api-docs.deepseek.com/api/create-chat-completion>
- <https://api-docs.deepseek.com/guides/thinking_mode>
- <https://api-docs.deepseek.com/quick_start/agent_integrations/pi_mono/>
- <https://api-docs.deepseek.com/quick_start/pricing/>

必须仍支持 frozen model/endpoint/thinking/tools/max_tokens。价格只作为 usage
metadata。若 Pi integration example 与 pricing page 的价格不同，以 pricing
page 为 rate authority并记录不一致；不得因此改变行为条件。

不允许 Pro fallback、legacy alias、`max` thinking、alternate endpoint、live
catalog hydration 或第二个模型。

## 12. Credential and secret boundary

G006 复用用户已经填写且 ignored 的 `.env.g005`，只把它作为本地 DeepSeek
credential carrier，避免复制 secret。它不是 G005 evidence mutation。

```yaml
local_secret_file: .env.g005
load_mechanism: "node --env-file=.env.g005"
allowed_secret_key: DEEPSEEK_API_KEY
recorded_value: never
recorded_metadata:
  credential_key_name: DEEPSEEK_API_KEY
  credential_configured: boolean_only
```

Stage 1 不得加载该文件。Stage 2 的 Gate A/driver/secret-scan process 可加载，
但不得输出、hash、copy、stage、commit 或将 secret 置于命令行。Tool address
space 不得覆盖 `.env.g005`。

最终 secret scan 必须覆盖：

- `spikes/pi-runtime/g006`；
- `.runs/g006/attempt-001` evidence；
- Baseline/Candidate workspaces。

只记录 scanned file count、match count 和 boolean。发现任何 match 立即停止并
令 evidence invalid。

## 13. Fixed task, tools and Verifier

G006 的 task specification、初始 source、public tests、acceptance test 与
Verifier 必须 byte-identical 于已提交 G005 对应文件。Initial workspace 仍须
public-pass / external-fail；known repair 仍须 external-pass。

Tools 维持三项 pathless/commandless surface：

1. `read_task_and_source`：固定读取 task/package/source/public test，总结果
   ≤16 KiB；
2. `write_source`：只可替换 `src/parse-duration.ts`，内容 ≤16 KiB，记录
   before/after bytes/hash；
3. `run_public_tests`：只运行 fixed public test command，15 秒 timeout，返回
   capped output/hash/exit code。

外部 Verifier 在 settled 后运行 fixed public + acceptance suite，30 秒 timeout，
完整输出作为 artifact，反馈 ≤8 KiB。Verifier truth 高于 assistant 声称。

## 14. Baseline and Candidate execution

两者从独立创建且 byte-identical 的 workspace 开始，使用同一 reviewed source
`HEAD`、model、prompts、tools、schemas、Verifier、runtime、budget 和 source
identity。

### 14.1 Baseline

```text
fresh workspace
→ one initial AgentHarness cycle until settled
→ route/evidence assertion
→ external Verifier exactly once
→ record Outcome
→ stop regardless of verifier result
```

Baseline 不接收 Verifier feedback。

### 14.2 Candidate

```text
fresh byte-identical workspace
→ same initial AgentHarness cycle until settled
→ route/evidence assertion
→ external Verifier once
→ pass: record and stop
→ fail: append one bounded normalized verifier-feedback prompt to same Session
→ one recovery cycle until settled
→ route/evidence assertion
→ external Verifier once more
→ record Outcome and stop
```

Candidate 初次通过时不得注入 synthetic failure。此时 recovery path 记为
`unobserved`，不妨碍 route feasibility disposition。

## 15. Hard budgets

```yaml
per_provider_request:
  max_tokens: 8192
  timeout_ms: 120000
  retries: 0

per_agent_cycle:
  max_provider_requests: 8
  max_tool_calls: 12
  timeout_ms: 300000

baseline:
  max_cycles: 1
  max_verifiers: 1
  max_provider_requests: 8
  max_tool_calls: 12

candidate:
  max_cycles: 2
  max_recovery_prompts: 1
  max_verifiers: 2
  max_provider_requests: 16
  max_tool_calls: 24

goal:
  max_variants: 2
  max_valid_paired_attempts: 1
  max_model_ids: 1
  max_wall_clock_after_first_provider_ms: 1200000
```

预算超限不得自动 retry。运行中出现任何 compaction event 必须记录并暂停解释。

## 16. Gates A through E

### Gate A — zero-call preflight from reviewed clean HEAD

- record exact clean implementation `HEAD`；
- verify source digest equals reviewed Gate 0 digest；
- verify isolated Pi/artifact/public imports/types；
- re-run Gate 0 tests against the Stage 2 environment；
- recheck external model/API facts；
- check credential configured boolean；
- prove `.runs/g006/attempt-001` absent；
- write initial pair manifests with `providerCallsAtWrite: 0`；
- only after all assertions create the write-once attempt marker。

### Gate B — Baseline real route and Verifier

- observe at least one provider request/response and assistant completion；
- observe at least one Tool Call and matching ToolResult；
- require exactly one settled event for the external cycle；
- run Verifier only after settlement；
- stop after one Verifier；
- record full Outcome and budget use。

### Gate C — Candidate and conditional recovery

- prove initial workspace/config/source identity parity with Baseline；
- complete same initial route and settled-before-Verifier order；
- only on failed Verifier append one bounded recovery prompt；
- at most one recovery and one second Verifier；
- record whether recovery was triggered/observed。

### Gate D — correlation and reasoning continuity

For each external cycle correlate:

```text
run_started
→ session_linked
→ agent_cycle_started
→ provider_request_start
→ provider_payload_shape
→ provider_response
→ assistant_message
→ tool_execution_start / tool_execution_end as applicable
→ agent_settled
→ verifier_started
→ verifier_completed
→ policy_decision
→ optional continuation_queued and recovery cycle
→ run_completed
```

For every completed successful cycle:

```yaml
provider_requests: ">= 1"
subscriber_provider_responses: equals_provider_requests
successful_assistant_messages: correlates_with_requests
assistant_response_ids: present
tool_starts: equals_tool_ends_and_at_least_one_for_initial_cycle
session_tool_call_ids: equal_matching_tool_result_ids
settled: exactly_1_per_external_cycle
reasoning_body_persisted: false
reasoning_presence_and_length_metadata: allowed
```

Counter disagreement with independent assistant/session evidence is evidence
invalidity, not a route failure.

### Gate E — fairness, provenance, budgets and secret safety

- normalized Baseline/Candidate initial manifests equal outside identity fields；
- complete G006 source inventory/hashes remain unchanged；
- all prompts/schemas/model/provider/runtime/setup identities recorded；
- all requests/tools/cycles/verifiers/recovery/token/cost/time counts recorded；
- immutable Journal v2 event names and correlation IDs verified；
- final workspace/source hashes and Verifier outputs recorded；
- final secret scan match count 0；
- no unrecorded retry、extra attempt、second model or scope drift。

## 17. Error attribution and disposition

实现必须使用独立分类，不得把所有 assertion failure 都归为 route：

```yaml
classifications:
  - setup
  - external_service
  - instrumentation_evidence
  - fairness_provenance
  - route
  - task_outcome
```

Closeout 必须选择一个 disposition：

```yaml
PASS_REAL_MODEL_FEASIBILITY:
  meaning: both frozen variants completed with valid auditable evidence;
    verifier pass is not required and Policy effectiveness is not implied

FAIL_REAL_MODEL_ROUTE:
  meaning: valid non-contradictory instrumentation demonstrates that the frozen
    public Pi/provider/tool/session route cannot complete as contracted

BLOCKED_G006_SETUP_OR_EXTERNAL_SERVICE:
  meaning: setup, credential, model availability, network, rate, quota or
    provider service prevented a valid paired architectural test

INVALID_G006_EVIDENCE:
  meaning: Observer disagreement, Journal corruption, parity/source drift,
    budget breach, secret leak, artifact mutation or contract deviation makes
    the pair uninterpretable
```

Verifier failure after a completed route is a valid `task_outcome` and must not
alone produce `FAIL_REAL_MODEL_ROUTE`。如果 attempt 在 Baseline 后失效，不得修复
后继续 Candidate；保留 evidence 并返回 Main Session。

## 18. Artifacts and reports

Generated preflight artifacts：

```text
.runs/g006/preflight/
.runs/g006/pi/
.runs/g006/source/
```

Generated real-attempt artifacts：

```text
.runs/g006/attempt-001/
  attempt-marker.json
  manifests/
  events/baseline.jsonl
  events/candidate.jsonl
  sessions/baseline.jsonl
  sessions/candidate.jsonl
  verifier/
  outcomes/
  workspaces/baseline/
  workspaces/candidate/
  security/secret-scan.json
  gates/gate-summary.json
  setup-and-command-log.md
```

Real attempt root must be created once and never deleted, reset, overwritten or
reused during the Goal。

Required tracked reports：

```text
docs/reports/G006_GATE_0_IMPLEMENTATION_AND_OFFLINE_REVIEW.md
docs/reports/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY_REPORT.md
docs/reports/G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY_CLOSEOUT.md
```

Closeout 必须更新 `CURRENT_STATE.md`，记录 exact commands/results、hashes、
remaining unknowns、scope changes 和需用户决定的事项。

## 19. Pause conditions

以下任一情况发生时，在进一步模型调用前停止并返回 Main Session：

- Stage 1 或 Stage 2 缺少对应用户授权；
- G005 code/evidence 或 `.upstream/pi` 需要修改；
- public emitted imports 不足，需要 source-path import、SDK/RPC 或 Pi patch；
- permitted delta 之外出现非机械 G005→G006 change；
- Gate 0 Faux response count、Journal、attribution、provenance 或 existing
  offline tests 失败；
- Main Session 未审阅完整实现，或 implementation baseline commit 未明确授权；
- clean `HEAD`、source digest、Pi/artifact identity 或 attempt-root absence 不符；
- current DeepSeek model/API 与 frozen behavior contract 实质不同；
- credential/tool address space/secret scan 不安全；
- first request payload 的 model、thinking、effort、max_tokens、tools 或 retry
  policy 不符；
- Observer counters 与 assistant/session evidence 冲突；
- Baseline/Candidate initial parity 破坏；
- 需要第二 paired attempt、第二模型、Pro fallback、额外 recovery 或 fixture
  change；
- hard budget 超限；
- destructive action、external publication、formal Workbench 或 broader
  architecture work 变得必要。

普通 task verifier failure 是实验 Outcome，不自动 pause。

## 20. Definition of Done

G006 只有在所有适用条件满足后才可关闭：

- Contract 被用户接受并分别记录 Stage 1/Stage 2 授权；
- Gate 0 source/tests/report 完成并由 Main Session 接受；
- implementation baseline commit 经用户授权且 exact clean HEAD 被记录；
- `.upstream/pi` 和 isolated Pi 保持 pinned/clean，Pi Core patch count 0；
- exact G003/G005 artifact/build boundary 保持；
- current DeepSeek facts 在首次调用前复核；
- exactly one fresh Baseline and Candidate pair attempted；
- same reviewed source/model/task/tools/Verifier/Policy/budgets used；
- provider responses 通过 subscriber path 正确计数并与独立证据相关联；
- Journal v2 outer event types 不可被 nested domain types 覆盖；
- Verifier 只在 settled 后运行；
- Candidate recovery 至多一次且只由 failed Verifier 触发；
- all budgets and outcomes recorded；
- private reasoning body/signature and secret not persisted；
- Manifest/Journal/Session/Workspace/Verifier/Outcome correlation complete；
- final secret scan passed；
- report、closeout 和 `CURRENT_STATE.md` 完成；
- one required disposition selected；
- remaining unknowns/non-claims explicit；
- Main Session architecture acceptance remains a separate user decision。

## 21. Explicitly deferred and prohibited scope expansion

- Completion Verification statistical effectiveness；
- multiple tasks、seeds、paired attempts or models；
- Pro/max comparison or fallback；
- general shell/filesystem/sandbox；
- Session cross-process reconstruction；
- crash-after-side-effect durability；
- long-running Tool cancellation；
- context compaction or Tool Result Budget platform；
- SDK Runner/RPC/process-isolation comparator；
- Pi Core patch or upstream contribution；
- G004 revival；
- MCP、Multi-Agent、Subagent、Web UI、SQLite、containers、Harbor；
- formal `workbench/` and V0 Version Charter。

这些未验证项不得自动变成 G006 subgoal。

## 22. Proposed execution-session handoff after activation

未来 Main Session 可向专用 G006 Session 提供以下边界：

> Execute only the accepted and activated G006 Contract. Begin with Stage 1
> Gate 0 only. Copy the committed G005 Spike into a separate G006 identity and
> apply only the authorized response-subscriber and Journal-envelope fixes,
> plus offline attribution/provenance regressions. Preserve G005 and pinned Pi.
> Do not load credentials, create the attempt root, call a model, commit, or
> enter Stage 2. Produce the Gate 0 review report and pause for Main Session
> source review. After a separately authorized implementation-baseline commit
> and separate Stage 2 authorization, execute exactly one frozen paired attempt
> and close out truthfully. Stop on every Contract Pause Condition.

Main Session 保留架构解释、source review、commit 建议、Stage 2 授权建议、Goal
closeout acceptance 和与用户的主要讨论。

## 23. Current decision requested

本契约已被用户接受，Stage 1 Gate 0 已执行并通过 Main Session source review；
用户也已明确授权本 revision 创建 G006 implementation-baseline commit。提交后
必须验证 exact clean `HEAD`、未变化的 Gate 0 source digest、attempt-root absence
和 provider calls `0`，并将绑定信息写入 ignored preflight evidence。

当前下一项用户决定是是否单独授权 Stage 2 real-model execution。在该授权前，
不得运行 Gate A、加载 credential、运行 driver、创建 attempt root 或调用模型。
