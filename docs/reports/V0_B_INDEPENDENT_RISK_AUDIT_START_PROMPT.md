# V0-B Independent Risk Audit Start Prompt

```yaml
document_status: ready_for_user_launch
document_owner: current_codex_main_session
goal_id: V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME
audit_id: V0_B_INDEPENDENT_EVIDENCE_AND_BOUNDARY_AUDIT
audit_trigger:
  - secret_and_reasoning_persistence_boundary
  - symlink_junction_reparse_and_real_path_boundary
  - Session_and_Journal_evidence_integrity
  - Verifier_authority_and_failure_attribution
  - Outcome_and_terminal_commit_semantics
  - bounded_repair_following_material_main_review_findings
candidate_audit_baseline_commit: 18ba8466799198b1ce3e732990a49f626fb83d48
candidate_commit_role: audit_candidate_only_not_accepted
audit_execution_authorized: true_for_manual_new_independent_session
formal_v0_b_acceptance: false
git_commit_authorization: consumed_for_candidate_audit_baseline_only
auditor_git_commit_authorized: false
real_model_calls_authorized: 0
external_network_authorized: false
dependency_installation_authorized: false
pi_core_patch_authorized: false
implementation_mutation_authorized_for_auditor: false
```

> 本文件已经绑定不可变的 Candidate Audit Baseline Commit，可由用户手动开启
> 一个新的独立审计 Session 执行。该 Commit 只冻结审计候选，不等于接受 V0-B，
> 也不是最终 Implementation Baseline。

---

## 1. Main-session audit intake

主 Session 已完成审计前 Intake，但没有替代独立审计或接受 V0-B。

### 1.1 Repository and protected state

```yaml
repository: D:/AI/AI_Projects/project2
control_baseline_commit: 32dc7b136053e2fdc17f294322a3cf7fef79e737
root_HEAD: 18ba8466799198b1ce3e732990a49f626fb83d48
root_HEAD_role: V0_B_candidate_audit_baseline
candidate_implementation_state: committed_for_independent_audit
candidate_commit_file_count: 35
staged_files: 0
protected_tracked_diff: 0
CURRENT_STATE_modified: false
formal_contract_modified: false
V0_charter_modified: false
control_rule_modified: false
V0_A_fixture_modified: false
registered_untracked_reference_present: true
registered_untracked_reference_modified_or_committed: false
untracked_audit_prompt_present: true
```

Pi：

```yaml
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_agent_package: "@earendil-works/pi-agent-core"
pi_agent_package_version: 0.82.1
pi_license: MIT
.upstream_pi_status: clean
.runs_v0_a_pi_status: clean
pi_core_patch_count: 0
```

### 1.2 Corrected source identity

```yaml
source_inventory:
  path: .runs/v0-b/evidence/source-inventory.json
  declared_files: 50
  verified_files: 50
  mismatch_count: 0
  sha256: 6563583e6e999a29c1ae1d8d88a9bff49520e7aab4fda3f05a148bdfa5330581

source_delta:
  path: .runs/v0-b/evidence/source-delta.json
  declared_files: 34
  current_delta_files: 34
  undeclared_current_files: 0
  declared_missing_files: 0
  mismatch_count: 0
  sha256: 3c4f68db9d450f3615d398ff73c14191c1ab4b3fc3d071089b8249b84a0990f4

workbench_tree_digest:
  calculated: 17daf52f08312659819877a7117e404aa1af0c0f293565a7a0448ca2627213d9
  authoritative_run_recorded: 17daf52f08312659819877a7117e404aa1af0c0f293565a7a0448ca2627213d9
  matches: true
```

`docs/reports/V0_B_MAIN_REVIEW_BOUNDED_CORRECTION_PROMPT.md` 是主 Session
返修控制输入，按修订规则不属于 34-file implementation delta，也不属于
50-file implementation/source inventory。它不得被解释为未申报产品源码。

### 1.3 Corrected Run identity

| Role | Run ID | Main-session intake |
| --- | --- | --- |
| authoritative pass | `run-dc84dc47-7fca-4e68-9118-7269e298c90f` | `inspect` exit 0; committed; integrity-valid; `passed/null` |
| valid Agent failure | `run-7da827c4-4c8f-463f-ac57-99d137ee9ea9` | `inspect` exit 0; committed; integrity-valid; `failed/agent` |
| invalid Verifier | `run-40360101-6ed0-4756-97ef-f63f98396bb1` | `inspect` exit 0; committed; integrity-valid; `invalid/verifier` |
| post-persistence corruption | `run-4671912d-1e79-4eab-ad97-b54b70675147` | `inspect` exit 1; committed envelope; integrity-invalid; `invalid/evidence` |
| persistence-operation failure | `run-82895dce-f949-4771-9eec-5e80a904ad10` | `inspect` exit 1; incomplete; terminal absent |
| secret-scan rejection | `run-4a0e1530-e37d-43ab-a817-2a9d2ea62ebe` | `inspect` exit 1; incomplete; terminal absent |

旧首轮权威 Run 和三个 counterexample Run 均仍存在，带原 terminal artifacts，
并在修订报告中标记为 superseded；主 Session未删除或覆盖它们。

Authoritative pass：

```yaml
attempt_id: attempt-f0014181-f136-4a3d-8a4e-fe1519c744a5
session_id: session-a36ee08c-60b3-4462-a1ae-09a80ece6683
workspace_id: workspace-d01d2642-9934-4f64-b225-edb72682be84
provider_requests: 8
tool_calls: 7
wall_time_usage_ms: 424
external_provider_calls: 0
recovery_attempts: 0
child_attempts: 0
artifact_count: 23
preterminal_scan:
  completed: true
  scanned_files: 15
  scanned_objects: 8
  matches: 0
```

### 1.4 Reported verification baseline

```yaml
strict_typescript: passed
workbench_tests:
  passed: 56
  failed: 0
  skipped: 0
targeted_correction_tests:
  passed: 11
  failed: 0
  skipped: 0
v0_a_authoritative_run_regression: passed
v0_a_public_tests:
  passed: 3
  failed: 0
  skipped: 0
public_pi_import_smoke: passed
corrected_six_route_suite: passed
real_model_calls: 0
external_provider_calls: 0
```

这些是返修 Session 的报告事实和主 Session的身份/Inspect Intake，不是独立审计
结论。Audit Session必须自行核验。

---

## 2. Why the audit is justified

本次独立审计不是为了增加形式，而是命中已经同意采用的风险触发条件：

1. V0-B 处理 Session reasoning、credential 和 secret persistence；
2. ArtifactRef/Inspect 必须处理 Windows junction/reparse 和真实路径 containment；
3. Session、Journal、Tool、Verifier、Outcome 和 terminal marker 构成互相关联
   的证据链；
4. 主 Session首轮审查已经发现过 terminal 前扫描、ArtifactRef 路径、
   Verifier evidence 和 persistence failure 等实质缺口；
5. 返修 Source Delta 为 34 files，并新增或重写多个高风险边界；
6. V0-B 的对外 Claims 将成为后续 V0-C、V1、V2 的证据基础。

独立审计只提供决策证据，不拥有 V0-B 接受权。

---

## 3. Candidate Audit Baseline Closeout

### 3.1 Authorization consumed

用户已经授权创建 Candidate Audit Baseline Commit，并已在更早的主 Session
决策中同意返修完成后进行一次独立风险审计。授权消费结果：

```yaml
authorization_consumed:
  candidate_audit_baseline_commit: true
  independent_audit_manual_launch: true
not_authorized:
  V0_B_formal_acceptance: true
  candidate_implementation_mutation_by_auditor: true
  audit_git_commit: true
  real_model_calls: true
```

### 3.2 Frozen candidate commit semantics

候选 Commit 已按以下语义创建：

```yaml
candidate_commit: 18ba8466799198b1ce3e732990a49f626fb83d48
parent_control_baseline: 32dc7b136053e2fdc17f294322a3cf7fef79e737
commit_message: "feat: freeze V0-B evidence foundation audit candidate"
committed_file_count: 35
accepted_implementation: false
audit_candidate_only: true
final_implementation_baseline: false
V0_B_formal_acceptance: false
active_goal_remains: V0_B
Stage_2_authorized: false
```

Candidate Commit 包含：

1. `.runs/v0-b/evidence/source-delta.json` 所声明的 34 个 tracked candidate
   source/report files；
2. `docs/reports/V0_B_MAIN_REVIEW_BOUNDED_CORRECTION_PROMPT.md`，作为返修来源
   与审计 provenance；
3. 不包含 `.runs/**`、`reference/**`、`.upstream/**`、凭据、V0-A raw
   evidence 或其他用户资料。

本审计 Prompt 在 Candidate Commit 之后生成，不属于 Candidate Source
Inventory，也不改变审计候选。

### 3.3 Post-commit checks

```yaml
candidate_commit_verified: 18ba8466799198b1ce3e732990a49f626fb83d48
committed_file_count_verified: 35
source_inventory_commit_blob_match: 50_of_50
source_inventory_mismatch_count: 0
source_delta_declared_candidate_paths_committed: 34_of_34
source_inventory_sha256: 6563583e6e999a29c1ae1d8d88a9bff49520e7aab4fda3f05a148bdfa5330581
source_delta_sha256: 3c4f68db9d450f3615d398ff73c14191c1ab4b3fc3d071089b8249b84a0990f4
protected_control_diff: 0
staged_files_after_commit: 0
registered_untracked_reference_only_preserved: true
upstream_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
upstream_pi_status: clean
runs_v0_a_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
runs_v0_a_pi_status: clean
forbidden_content_committed: false
```

---

# Independent Audit Start Prompt

```yaml
prompt_status: ready_for_user_launch
audit_id: V0_B_INDEPENDENT_EVIDENCE_AND_BOUNDARY_AUDIT
goal_under_audit: V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME
candidate_commit: 18ba8466799198b1ce3e732990a49f626fb83d48
candidate_status: audit_candidate_only_not_accepted
repository: D:/AI/AI_Projects/project2
implementation_session: dedicated_v0_b_goal_session
audit_session_owner: new_independent_v0_b_risk_audit_session
audit_mode: read_only_source_plus_bounded_isolated_probes
real_model_calls_authorized: 0
external_network_authorized: false
dependency_installation_authorized: false
pi_core_patch_authorized: false
implementation_mutation_authorized: false
git_commit_authorized: false
```

你是一个新的、独立的 V0-B Risk Audit Session。

你不是实现 Session，也不是主 Session。你没有参与 V0-B 实现或返修。你的任务
是从精确 Candidate Audit Baseline Commit 对 V0-B 的安全边界、证据完整性、
失败归因和 Claims 进行独立、对抗性、只读审计。

你可以建议：

```yaml
- ACCEPT_AUDIT_CANDIDATE
- REQUEST_BOUNDED_CORRECTION
- REJECT_V0_B_CONTRACT
- PAUSE_AUDIT
```

你不得正式接受 V0-B、修改项目状态或自行修复问题。

## A. Required reading

完整读取：

1. Candidate checkout 中的 `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. `docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md`；
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
5. `docs/第二项目_Codex交接包_2026-07-30/V0_B_GOAL_CONTRACT.md`；
6. `docs/reports/V0_B_IMPLEMENTATION_REPORT.md`；
7. `docs/reports/V0_B_CLOSEOUT_DRAFT.md`；
8. `docs/reports/V0_B_MAIN_REVIEW_BOUNDED_CORRECTION_PROMPT.md`；
9. 主仓库只读 evidence：
   - `.runs/v0-b/evidence/EVIDENCE_INDEX.md`
   - `.runs/v0-b/evidence/commands-and-exit-codes.md`
   - `.runs/v0-b/evidence/source-inventory.json`
   - `.runs/v0-b/evidence/source-delta.json`
10. 本 Audit Prompt；
11. Source Delta 中全部 34 个文件；
12. 与 V0-B 复用边界相关的 V0-A Workspace/path/tool source and tests。

如核验 Pi source claim，先完整读取 `.upstream/pi/AGENTS.md`，再读取 Contract
指定的 pinned Pi source/tests。不得修改、构建或安装 Pi。

不要只读报告和测试；必须读实际实现。

## B. Audit Gate A — immutable candidate and isolation

开始审计前必须核验：

```yaml
candidate_commit: 18ba8466799198b1ce3e732990a49f626fb83d48
source_inventory_sha256: 6563583e6e999a29c1ae1d8d88a9bff49520e7aab4fda3f05a148bdfa5330581
source_inventory_files: 50
source_delta_sha256: 3c4f68db9d450f3615d398ff73c14191c1ab4b3fc3d071089b8249b84a0990f4
source_delta_files: 34
workbench_tree_digest: 17daf52f08312659819877a7117e404aa1af0c0f293565a7a0448ca2627213d9
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
```

必须从 Candidate Commit 创建 detached、isolated audit worktree。推荐将 source
worktree 和 raw probes 放在：

```text
D:/AI/AI_Projects/project2/.runs/v0-b/audit/<candidate-short-sha>/
```

该目录处于 ignored evidence boundary。不得在主工作区修改或运行会生成新
源码/证据的命令。

由于当前 Windows Git 配置为 `core.autocrlf=true`，而精确 Source Inventory
记录的是 Candidate Commit 中的 blob bytes，创建 audit worktree 时必须显式
禁用 checkout 换行转换，例如在 `git worktree add` 这一条命令上使用
`-c core.autocrlf=false`。先核验 50/50 Candidate Commit blob size/hash，再
核验 isolated worktree 中 50/50 文件 size/hash；不得用 CRLF checkout
造成的表象差异替代源码身份判断。记录实际创建命令和
`git check-attr text eol` 结果。若仍有不匹配，立即 Pause。

允许在 isolated audit worktree 内创建 ignored local dependency junction，
指向主仓库已经存在、已经核验 commit/status 的：

```text
D:/AI/AI_Projects/project2/.runs/v0-a/pi/packages/agent
D:/AI/AI_Projects/project2/.runs/v0-a/pi/packages/ai
```

只允许复用现有本地依赖。不得执行 install、download、Registry 或 lifecycle
script。记录每个 junction 的实际 target、Pi commit 和审计前后状态。

审计开始和结束时，Candidate tracked files 必须 clean。不得 stage/commit。

若不能建立隔离 worktree、不能无网络复用固定依赖，或任何 identity 不匹配，
立即提交 Pause Report，不得退回到不断变化的主工作区静默审计。

## C. Authority and evidence rules

使用：

```text
candidate source / tests / actual audit commands
    ↓
fixed raw Run evidence
    ↓
formal Contract / Charter / accepted controls
    ↓
Implementation Report / Closeout Draft
    ↓
audit inference
```

每个结论标记：

- `Fact`
- `Inference`
- `Recommendation`
- `Unconfirmed`

测试通过不自动证明 Contract；报告声明不能补写缺失 evidence。

## D. Audit scope

### D1. Source identity and scope

独立核验：

- Candidate Commit file list；
- 50/50 Candidate Commit blob 与 isolated checkout Source Inventory
  size/hash；
- 34/34 Source Delta size/hash/change type；
- Workbench tree digest；
- protected/control/V0-A/reference/Pi boundaries；
- public emitted Pi imports only；
- no credential loading、network、real Provider、Recovery or child Attempt；
- test-only scenarios 未进入默认 CLI Product Surface。

### D2. Pre-terminal secret/reasoning scan

审计：

1. scanner 是否确实在 terminal write 之前执行；
2. scanner 的 file/object scope 是否覆盖 Contract 14.3；
3. scan 后写入的 Run、Attempt、Abort、Outcome、final Journal、Index、scan result
   和 terminal bytes 是否与被扫描的确定性对象一致，是否存在未说明的
   post-scan mutation gap；
4. scanner result 是否真正绑定 terminal 和 Evidence Index；
5. scanner failure/rejection 是否不会留下可信 terminal；
6. matched value 是否不会进入 scan evidence、日志、Report 或 `inspect`；
7. 1 MiB scanner cap 与所有允许 Artifact hard cap 是否一致；
8. regex/rule coverage 是否存在容易利用的 false negative。

使用纯 synthetic sentinel 做有界对抗测试，不得使用或读取真实 secret。至少
考虑：

- key casing；
- whitespace/newline；
- JSON escaped key；
- nested `authorization` / `api_key` / token fields；
- short and long synthetic values；
- Bearer variation；
- multibyte content；
- scanner exception；
- scan scope omission。

如果发现 rule 不是通用 secret detector，只判断它是否满足 V0-B 固定 Task、
fixed Provider、fixed Tool/Profile 的 Contract 边界；不得要求建设通用 DLP。

### D3. ArtifactRef and Inspect boundary

独立验证：

- lexical traversal、drive、UNC、URI、NUL；
- linked Run root；
- intermediate junction/reparse；
- dangling junction ancestor；
- final link；
- directory/non-ordinary file；
- malformed ArtifactRef envelope；
- malformed JSON/JSONL/Index；
- missing artifact；
- size/digest mismatch；
- duplicate/cyclic index entries；
- safe bounded diagnostics；
- CLI non-zero；
- no repair or artifact-body expansion。

检查：

- `lstat` error 是否被错误当成“missing”并放行；
- root ancestor、realpath containment 和 case semantics；
- write path 在 `mkdir` 前后是否都重新检查；
- Evidence Index 是否强制包含 Contract 所有 terminal evidence，而不只检查
  Outcome 和 scan result；
- `inspect.committed` 与 `integrity_valid` 的语义是否准确、Claims 是否需要
  收窄。

只要求当前 Contract 的 local evidence boundary，不要求抵御拥有同账户并能在
每个 syscall 间竞争替换文件的强对手，除非实现或报告声称了该能力。

### D4. Verifier authority and execution evidence

验证：

- Verifier 位于 Agent write scope 外；
- settled 和完整 Session persistence 先于 verifier；
- 实际执行 Run-local write-once snapshot；
- executed snapshot digest 与 frozen digest 一致；
- executable/argv/cwd/shell/env keys/timeout/output cap/duration evidence；
- 不保存 environment values；
- full output ArtifactRef and Journal projection；
- task failure vs missing/spawn/parse/timeout/output-cap classification；
- exit code/status disagreement；
- Verifier invalid 不触发 Recovery、不成为 Agent failure；
- Agent 不能修改 verifier/acceptance。

不得因为没有系统级 process-tree termination 而判失败；该项是明确 non-claim。

### D5. Reasoning-safe Session

验证：

- runtime Session 与 evidence Session 分离；
- public `JsonlSessionStorage.open()`；
- Session/Attempt/Journal IDs；
- parent chain；
- Tool Call/Result pairing；
- reasoning body/signature removed；
- content type、Unicode code-point count、UTF-8 byte count、signature count；
- nested signatures and credential-like keys；
- Tool/user/custom/compaction/branch entry handling；
- inline truncation metadata；
- full Provider envelope 未持久化；
- SessionRef 没有虚假 Resume claim。

使用 synthetic multibyte reasoning，不调用真实模型。

### D6. Persistence failure and corruption

分别验证：

1. evidence mirror append operation failure；
2. post-persistence corruption。

检查 operation failure：

- 失败发生在实际 mirror append path；
- runtime/evidence divergence 被识别；
- attempt error/abort truth；
- no Verifier；
- no Agent-failure attribution；
- no Outcome/Index/terminal；
- incomplete evidence 和 scan artifact 是否安全；
- `inspect` 是否只报缺 terminal，还是是否需要在不扩大 Scope 的情况下显示
  bounded incomplete identity；
- error-route Journal required/forbidden events。

检查 corruption：

- Verifier 可以已完成；
- evidence precedence 产生 `invalid/evidence`；
- 不被误报为 Agent failure；
- terminal envelope 与 integrity-invalid 的语义没有扩大为“valid evidence”。

### D7. Outcome, Journal and terminal evidence

核验：

- accepted Outcome precedence；
- one initial Attempt；
- Recovery false；
- exactly one Outcome/terminal for valid terminal Runs；
- Journal closed enum、seq、four IDs、required ordering；
- all declared Journal ArtifactRefs fail closed；
- terminal written last；
- terminal binds Outcome/Index/scan；
- terminal后没有 evidence backfill；
- Evidence Index completeness and no digest cycle；
- `run_terminal` / `outcome_created` actual Journal bytes 与 pre-scan pending
  representation 的差异及安全含义；
- old Runs preserved/superseded，不参与 corrected Claims。

### D8. Budget, abort and timing truth

核验：

- fixed Faux sequence hard bound 与实际 responses；
- provider/tool hooks 在超限前停止；
- `wall_time_usage_ms` 是否覆盖 Contract 所称完整 Run，特别是 scanner、Outcome、
  Index 和 terminalization；
- wall limit 超限时是 hard stop、post-hoc classification，还是仅报告；
- budget Outcome unit test 与 Coordinator route 的差异；
- settled/failed/incomplete route 的 abort fields、last complete seq 和 outstanding
  Tool IDs 是否真实；
- token/cost/external call non-applicability；
- Report 的“actual wall time”和“hard bound” Claims 是否准确。

不得要求 V0-B 实现通用 cancellation runtime、Recovery 或 process-tree guarantee。

### D9. Fixed evidence replay

逐项复核六个 fixed Run：

```yaml
pass: run-dc84dc47-7fca-4e68-9118-7269e298c90f
agent_failure: run-7da827c4-4c8f-463f-ac57-99d137ee9ea9
verifier_invalid: run-40360101-6ed0-4756-97ef-f63f98396bb1
post_persistence_corruption: run-4671912d-1e79-4eab-ad97-b54b70675147
persistence_operation_failure: run-82895dce-f949-4771-9eec-5e80a904ad10
secret_scan_rejection: run-4a0e1530-e37d-43ab-a817-2a9d2ea62ebe
```

不要覆盖这些 Run。所有主动 tamper/probe 必须使用 audit raw directory 中的副本。

### D10. Claims

分别判断以下 Claims 是否允许：

- settled Attempt → auditable external Outcome；
- Session/Tool/Journal/Workspace/Verifier/Outcome correlation；
- reasoning-safe evidence Session public reopen；
- Verifier valid failure vs Verifier invalid；
- invalid evidence not Agent failure；
- inspect terminal evidence；
- no Pi Core patch。

必须继续拒绝：

- V0-B real-model effectiveness；
- Completion Policy improvement；
- Recovery effect；
- cross-process Resume；
- crash-after-side-effect reconciliation；
- exactly-once Tool execution；
- OS sandbox/network-egress blocking；
- process-tree termination；
- statistical Eval validity；
- V1/V2 implemented。

## E. Allowed audit commands and writes

允许：

- read-only Git/source/evidence inspection；
- isolated audit worktree；
- fixed local dependency junctions under ignored audit worktree；
- strict TypeScript；
- complete Workbench test suite；
- targeted V0-B tests；
- public import smoke；
- deterministic Faux-only Runs in audit raw directory；
- copied-evidence tamper probes；
- local hashing、inventory comparison、path/junction probes；
- 写入：
  - `.runs/v0-b/audit/<candidate-short-sha>/**`
  - `docs/reports/V0_B_INDEPENDENT_RISK_AUDIT_REPORT.md`

不得写入或修改其他项目文件。

## F. Forbidden

```yaml
forbidden:
  - modify candidate implementation source or tests
  - modify CURRENT_STATE.md
  - modify Contract, Charter, control rule, ADR or accepted Closeout
  - modify V0_A fixture or evidence
  - modify .upstream/pi
  - modify reference
  - modify or overwrite fixed V0_B Runs
  - automatically fix findings
  - stage or commit
  - install or download
  - use external network
  - read .env or credentials
  - call real model or external Provider
  - add Recovery, child Attempt, Resume or sandbox
  - enter Stage_2, V0_C, V1 or V2
  - accept V0_B
```

## G. Required independent commands

至少独立执行并记录：

1. candidate commit/clean status；
2. 50-file Inventory hash/size comparison；
3. 34-file Delta and commit file-list comparison；
4. Workbench tree digest；
5. strict TypeScript；
6. complete Workbench suite；
7. correction-focused tests；
8. public Pi emitted import smoke；
9. six fixed Run inspect；
10. copied evidence corruption/link/malformed probes；
11. synthetic secret/reasoning scanner probes；
12. protected/control/Pi before-and-after status；
13. `git diff --check` on candidate；
14. zero real/external Provider calls proof。

不得把实现报告中的 exit code 复制为审计结果。

## H. Finding format

每个发现必须包含：

```yaml
finding_id:
severity: P0_or_P1_or_P2_or_P3
classification:
  - contract_blocker
  - bounded_correction
  - claim_narrowing
  - future_work
  - non_issue
observation:
source_or_evidence_path:
symbol_or_artifact:
reproduction_command:
expected:
actual:
contract_clause:
affected_gate_or_DoD:
claim_impact:
recommended_action:
```

严重性：

- P0：秘密泄漏、破坏性边界、证据伪造或架构不可用；
- P1：阻止 V0-B Contract 接受；
- P2：应修正但可由主 Session/用户判断是否阻塞；
- P3：非阻塞质量或文档问题。

## I. Required Audit Report

唯一正式报告：

```text
docs/reports/V0_B_INDEPENDENT_RISK_AUDIT_REPORT.md
```

必须包含：

1. exact Candidate Commit；
2. audit worktree/raw evidence path；
3. source Inventory/Delta/digest results；
4. commands、exit codes、test counts；
5. 六个 fixed Run 的独立核验；
6. D1–D10 逐项结论；
7. findings，按 severity 排序；
8. Gates A–H / DoD 25 的独立建议；
9. allowed/not-allowed Claims；
10. 未验证项；
11. source/control/Pi before-and-after status；
12. 推荐：

```yaml
- ACCEPT_AUDIT_CANDIDATE
- REQUEST_BOUNDED_CORRECTION
- REJECT_V0_B_CONTRACT
- PAUSE_AUDIT
```

Audit Report 不得修改 `CURRENT_STATE.md` 或创建正式 Closeout。

## J. Pause Conditions

立即停止并报告：

1. Candidate Commit 不匹配或不存在；
2. Candidate tracked source 不干净；
3. Inventory/Delta/Workbench digest 不匹配；
4. fixed Run 缺失或被覆盖；
5. Pi commit/status 不一致；
6. protected/control/reference/V0-A 被修改；
7. 需要网络、安装、真实模型、凭据或 Pi patch；
8. 无法建立 isolated audit worktree；
9. 只能修改实现才能继续审计；
10. 实际 secret/reasoning body 被发现；
11. 审计范围开始扩张为通用 Sandbox、DLP、Resume 或 Recovery；
12. 需要主 Session/用户决定 Contract 或架构分叉。

## K. Stop point

完成 Audit Report 后：

- 不修复；
- 不修改状态；
- 不 stage/commit；
- 不进入下一 Goal；
- 返回 report path、recommendation、finding count、highest severity、
  test results、candidate/Pi final status；
- 立即停止，等待主 Session与用户复核。

---

## 4. Consumed decisions and remaining authority

```yaml
consumed_user_decisions:
  candidate_audit_baseline_commit: authorized_and_completed
  independent_audit_after_bounded_correction: authorized
  launch_mode: user_manual_new_session
remaining_authority:
  auditor_can_report: true
  auditor_can_fix_or_commit: false
  auditor_can_accept_V0_B: false
  main_session_and_user_final_review_required: true
```

审计 Session 完成报告后必须停止，由当前主 Session核验证据并与用户决定：
接受候选、要求有界返修、拒绝 Contract，或暂停。
