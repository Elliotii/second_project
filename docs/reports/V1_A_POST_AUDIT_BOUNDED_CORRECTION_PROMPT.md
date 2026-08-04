# V1-A Post-Audit Bounded Correction Prompt

```yaml
document_status: authorized_for_original_implementation_session
goal_id: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
session_owner: original_V1_A_implementation_session
main_session_disposition: ACCEPT_AUDIT_AND_REQUEST_BOUNDED_CORRECTION
failed_candidate_commit: e3ff98948b26187b48af61928b56e7cacb550d31
failed_candidate_tree: 89cae1c2c3c091ddc2644fac9a2d28c5b1800e03
audit_report_sha256: 7815d6ed522aaadedb764e02fe0808316e78b2a70145094fef88237a967e9cf5
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
authorized_findings:
  - F-001
  - F-002
  - F-003
  - F-004
gitattributes_exception_authorized: exact_byte_text_fixture_LF_rules_only
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
dependency_install_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
git_commit_authorized: false
focused_reaudit_authorized_for_this_session: false
V1_B_authorized: false
```

你是原 V1-A dedicated Implementation Session。Main Session 已接受独立审计的
`REQUEST_BOUNDED_CORRECTION`，但尚未接受或关闭 V1-A。你只能修复 F-001 至
F-004，提交返修后的 source、tests、ignored evidence、Implementation Report 和
Closeout Draft，然后停止等待 Main Session 复核。

## 1. 开始身份与必读材料

开始前必须完整读取并遵守：

1. 根 `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. `docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md`；
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
5. `docs/第二项目_Codex交接包_2026-07-30/V1_A_GOAL_CONTRACT.md`；
6. `docs/reports/V1_A_IMPLEMENTATION_REPORT.md`；
7. `docs/reports/V1_A_CLOSEOUT_DRAFT.md`；
8. `docs/reports/V1_A_MAIN_REVIEW_REPORT.md`；
9. `docs/reports/V1_A_MAIN_REREVIEW_REPORT.md`；
10. `docs/reports/V1_A_FINAL_NARROW_REREVIEW_REPORT.md`；
11. `docs/reports/V1_A_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`；
12. 本 Prompt。

核验：

```text
root HEAD = e3ff98948b26187b48af61928b56e7cacb550d31
root HEAD^{tree} = 89cae1c2c3c091ddc2644fac9a2d28c5b1800e03
Pi HEAD = 027a5847901b5dde30270abaa1041046cd2b4b55
```

根工作区开始时允许存在下列已知 untracked 内容：

- `reference/`；
- `docs/reports/V1_A_FOCUSED_INDEPENDENT_AUDIT_START_PROMPT.md`；
- `docs/reports/V1_A_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`；
- 本 Prompt。

它们不得被删除、覆盖或错误解释为 Candidate source delta。若 tracked/staged
Candidate 状态不干净、HEAD/Pi 不匹配或报告哈希不匹配，立即停止并返回 Pause
Report。

## 2. 唯一返修目标

### F-001 — Fresh Windows checkout 字节与 digest authority

必须关闭：

1. 参与 exact-byte identity、Skill/Task/Verifier/Manifest/Strategy/calibration 和必要
   V0 regression 的文本 fixture，不能再因 `core.autocrlf=true` 在 checkout 时改变
   字节；
2. 工作树 authority bytes、prospective Git-clean bytes、tracked Manifest bindings、
   source/workbench/fixture digest claims 必须一致；
3. 不得修改 accepted V0 fixture 文件内容、历史 Run/evidence 或 V0 schema；
4. V1-A tests、必要 V0-B/V0-C regressions 和完整 Workbench regression 必须重新
   到达真实 assertions 并通过。

本次给予一个精确 Contract 例外：允许修改根 `.gitattributes`，且只能增加/收敛
exact-byte text fixture 的 `text eol=lf` checkout 规则。当前 `fixtures/` 仅包含
`.json`、`.md`、`.mjs`、`.ts`、`.txt` 文本；推荐使用一条可审查的 bounded rule，
前提是证明它不会改变任何已提交 fixture blob 的语义内容。

不得借此：

- 改写 accepted V0 fixture 文件；
- 改动 V0 reports、Closeouts 或 `.runs/v0-*`；
- 建设通用 normalization 平台；
- 修改全局 Git 配置；
- 把环境 setup 当成项目 identity 的替代品。

返修证据至少包括：

- `git check-attr text eol -- <authoritative paths>`；
- exact-byte text fixtures 不含 CRLF 的机器检查；
- 当前 bytes 与 prospective Git-clean bytes 不发生转换的检查；
- 四个冻结 digest/ID 的重新计算；
- 明确列出 `.gitattributes` 是唯一影响 V0 checkout 的文件，V0 fixture blobs 本身
  delta 为 0；
- Main Session 后续创建 corrected Candidate 后，仍必须由 fresh worktree re-audit
  做最终证明；本 Session不得宣称 fresh committed Candidate 已经通过。

### F-002 — B/C 完整可比较请求身份

必须关闭：

1. B/C 可以使用隔离 `Models` registry，但其 actual Faux `api`、`provider`、model
   `id` 和其他影响请求语义的固定 model descriptor 必须相同且确定性；
2. 不得再使用 strategy ID、`Date.now()` 或 `Math.random()` 生成 B/C Provider/model
   identity；
3. 通过 public Faux response factory 的第四参数捕获 actual `requestModel`；
4. equality proof 必须覆盖实际 model descriptor、model-visible Context，以及会影响
  请求语义的稳定 options projection；不得把 callback、signal、secret、随机 Session
   ID 等不可比较 host object 序列化进 model-visible payload；
5. 增加 negative regression：只要 `api`、`provider`、model `id` 或所选 request-level
   semantic field 不同，公平性 Gate 必须 fail closed；
6. 保留 A/B expected delta only Skill wrapper/body、hidden identity absence 和 one-turn
   semantics。

不要因此建设 Provider registry、抽象 provider platform 或修改 Pi。

### F-003 — Credential-safe public Provider error boundary

必须关闭：

1. resolver failure、transport failure 和 public `handle.prompt` rejection 都不能包含
   resolved credential 或 fake marker；
2. credential-bearing lower-level errors必须在 public seam 转换成稳定、无 secret 的
   domain error；不要把原始 error message、`cause`、request object 或 credential
   持久化/返回；
3. 保留 one-use authority：reservation、single request、second runtime rejection 和
   default fail-closed 行为不得回退；
4. 使用非 secret marker 测试 resolver/transport/public handle error；扫描 returned
   errors、generated evidence 和本次报告，不读取真实 `.env` 或 credential。

本修复不要求通用日志平台、DLP 或真实 Provider 测试。

### F-004 — Provider usage evidence fail closed

`projectFixedProviderUsageV1` 或等价 public projection 必须拒绝：

- NaN/Infinity；
- 负数；
- request/token 非整数；
- request count 超过 16；
- input + output token 超过 131072；
- cost 小于 0 或超过 USD 0.20；
- 如 schema 接受 total token，则 total 与 input/output 不一致。

必须覆盖有效零值、有效边界值和正常中间值。证据仍不得包含 credential。只验证该
函数实际拥有的 Provider usage 字段；不要扩张为通用预算系统。

## 3. 允许修改的文件

仅允许按需要修改：

- `.gitattributes`，仅限 §2 F-001 的精确 LF 规则；
- `workbench/src/pi/pi-adapter-v1.ts`；
- `workbench/src/provider/fixed-provider-v1.ts`；
- `workbench/src/contracts/v1-types.ts`，仅当 F-002/F-004 的既有 V1 contract type
  无法表达最小修复时；
- `workbench/tests/v1a-deterministic.test.ts`；
- `workbench/scripts/run-v1a-deterministic-suite.mjs`；
- 现有 V1-A evidence scripts，仅为重新生成可复核证据；
- `fixtures/skills/v1/**`、`fixtures/tasks/v1/**`、`fixtures/verifiers/v1/**`、
  `fixtures/manifests/v1/**`、`fixtures/calibration/v1/**`，仅当 normalized identity
  rebind 确实需要，且不得改变 Task/Skill/Verifier 语义；
- `.runs/v1-a/corrections/focused-audit-001/**` ignored evidence；
- `docs/reports/V1_A_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V1_A_CLOSEOUT_DRAFT.md`。

如果需要修改上述列表之外的 tracked file，先停止并报告，不要自行扩大。

## 4. 明确保护与禁止

不得修改、暂存、删除、覆盖或提交：

- `CURRENT_STATE.md`、`AGENTS.md`、正式 Charter/Contract/control rule/ADR；
- `docs/reports/V1_A_FOCUSED_INDEPENDENT_AUDIT_REPORT.md` 与 Audit Start Prompt；
- accepted V0/G001–G006 reports、Closeouts、manifests、verifiers 和历史 evidence；
- `fixtures/tasks/v0-a-parse-duration/**` 或其他 accepted V0 fixture 内容；
- `.runs/v0-a/**`、`.runs/v0-b/**`、`.runs/v0-c/**`、任何 G00x evidence；
- `.upstream/pi/**`；
- `reference/**`；
- `.env`、`.env.*`、credential 或 secret；
- Git index、Git history、branch 或 remote。

不得：

- 调用真实模型、外部 Provider、网络或 credential resolver；
- 安装/更新依赖；
- 修改 Pi、使用 private import、SDK/RPC/Extension；
- 进入 V1-B、V2/V3；
- 创建 Candidate/Implementation Baseline Commit；
- 启动或代替 focused re-audit；
- 顺手重构、格式化无关代码或扩展成通用平台。

## 5. 必须运行的有界验证

在现有本地依赖可用且不安装的前提下，至少运行并记录：

1. strict TypeScript；
2. F-001 attribute/CRLF/prospective-clean-byte/digest checks；
3. F-002 positive complete-request equality 与 descriptor-difference negative tests；
4. F-003 resolver/transport/public error marker tests和 evidence scan；
5. F-004 invalid、overflow、boundary 和 normal usage tests；
6. 完整 `workbench/tests/v1a-deterministic.test.ts`；
7. V1-A deterministic suite；
8. targeted V0-B verifier tests；
9. focused V0-C Stage 1/correction regressions；
10. 完整 Workbench regression。

不得只通过修改 expected digest 让测试变绿。测试必须包含会击穿原 Candidate 的四个
审计 counterexamples，并保留既有成功路径。

## 6. Evidence 与报告

在以下 ignored 目录保存新证据，不覆盖历史 evidence：

```text
.runs/v1-a/corrections/focused-audit-001/
```

至少包括：

- source delta 与 protected-file identity；
- `.gitattributes` rule 和 fixture blob-content delta 证明；
- 四个 finding 的 counterexample/result；
- commands、working directories、exit codes、test totals；
- 重新计算的 source/workbench/fixture digest 与 Manifest ID；
- secret/reasoning scan；
- zero-call/mutation accounting；
- `EVIDENCE_INDEX.md`。

更新：

- `docs/reports/V1_A_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V1_A_CLOSEOUT_DRAFT.md`。

两份报告必须明确：

- failed Candidate `e3ff989...` 及其 audit findings 保留；
- 本次只是 `corrected_candidate_pending_main_review_and_freeze`；
- fresh committed checkout re-audit 仍未完成；
- Gate J、V1-A final acceptance、Implementation Baseline 和 V1-B 均未宣称通过；
- 提交结构化 `CURRENT_STATE_UPDATE_PROPOSAL`，但不得修改 `CURRENT_STATE.md`。

## 7. Pause Conditions

出现以下任一情况立即停止：

- 无法在不修改 accepted V0 fixture 内容的情况下关闭 F-001；
- LF 规则会改变 binary/non-text 内容或历史 evidence；
- public Pi Faux route 无法让 B/C 使用相同确定性 descriptor；
- F-002 需要 Pi patch/private import/SDK/RPC/Extension；
- credential-safe error boundary需要真实 credential/Provider；
- F-004 需要建设通用预算系统或更改 V0 schema；
- 任何必要回归需要 dependency install/network；
- 需要修改允许列表外的 tracked file；
- 发现新的架构 fork、真实 side effect 或 V1-B requirement。

Pause Report 只说明 observation、evidence、blocking reason、最小选项和需要的用户
决定。

## 8. 最终停止点

完成四项返修、验证、ignored evidence、Implementation Report 和 Closeout Draft 后
立即停止。返回：

- Source Delta；
- commands 与 exit codes；
- test totals；
- 四项 finding 的关闭证据；
- protected/zero-call accounting；
- fresh checkout 尚待 Main Session corrected Candidate freeze 后复审的明确说明；
- 建议 Main Session 做 lightweight narrow review。

不得创建 Git commit、不得自行接受 V1-A、不得更新控制状态、不得启动 re-audit、
不得进入 V1-B。
