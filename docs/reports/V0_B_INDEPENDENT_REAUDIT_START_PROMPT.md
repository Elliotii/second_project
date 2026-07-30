# V0-B Focused Independent Re-audit Start Prompt

```yaml
document_status: authorized_ready_to_execute
goal_id: V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME
audit_kind: focused_independent_reaudit
execution_owner: original_independent_v0_b_audit_session
formal_v0_b_acceptance: false
current_state_update_authorized: false
source_fix_authorized: false
git_commit_authorized: false
real_model_calls_authorized: 0
external_network_authorized: false
dependency_installation_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
recovery_attempts_authorized: 0
child_attempts_authorized: 0
stage_2_authorized: false
```

## 1. Mission

对第一次独立审计提出的五项发现执行一次轻量、独立、以关闭性判断为目标的复审。

本次不是第二轮全面审计，不重新评估 V0-B 架构，不主动寻找新的平台级安全需求。只回答：

```text
V0B-AUD-001 至 V0B-AUD-005
是否已在 corrected Candidate 中得到有证据支持的有界修复，
并且完整回归、候选身份和边界是否仍成立。
```

复审 Session 只提交事实、发现和建议；不得接受 V0-B，不得修改控制状态。

## 2. Frozen identity

```yaml
repository: D:/AI/AI_Projects/project2
control_baseline_commit: 32dc7b136053e2fdc17f294322a3cf7fef79e737
first_failed_audit_candidate: 18ba8466799198b1ce3e732990a49f626fb83d48
corrected_candidate_commit: 7e0d8f7aeb4c1d95e7e0f5dcdc63d720ecd0a180
corrected_candidate_parent: 18ba8466799198b1ce3e732990a49f626fb83d48
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
v0_a_implementation_baseline: 1a1565fa7e6d1440c8f99e2c7e587201a14111c1
authoritative_v0_b_run: run-914dc89c-defd-4e03-ab37-7fd09230fe93
workbench_tree_digest: b8034b235acdf50630c7bebc3859f001799986333622ae0ce1b545528d3fe8d0
```

绑定文件：

```yaml
first_audit_report:
  path: docs/reports/V0_B_INDEPENDENT_RISK_AUDIT_REPORT.md
  sha256: 10316dc66c99868772ec4548f0314a5cfc707ef45dd2b4047a127eb29e70393e
correction_prompt:
  path: docs/reports/V0_B_POST_AUDIT_BOUNDED_CORRECTION_PROMPT.md
  sha256: e96f7b17a2f60382a229dde599efe622d2329a26a5801e82706eab1d3ae9bd77
implementation_report:
  path: docs/reports/V0_B_IMPLEMENTATION_REPORT.md
  sha256: b3d1d266fa3d0aee0f9a860911a0e86d4cee4e675aaeaf81db2232bb9c7847c7
closeout_draft:
  path: docs/reports/V0_B_CLOSEOUT_DRAFT.md
  sha256: 7db3b86cdebe219064b06d46a03dfc9573315a60b516b1c5fbcd79a395933b6c
source_inventory:
  path: .runs/v0-b/evidence/source-inventory.json
  files: 52
  sha256: 6b9e90e4652df1ee85fc1f29e6d053d931901c17e098fa46dcb4cdbdf9ca9ac5
source_delta:
  path: .runs/v0-b/evidence/source-delta.json
  files: 36
  sha256: 49e6cf7a750f446734c87a662088843fb104d4d6c5c7994f3243cf9aca19237b
micro_correction_probe_results:
  path: .runs/v0-b/evidence/basic-authorization-object-micro-correction-probe-results.json
  sha256: c3a2e88e02309f2ef943d6637e55409a08d8186aaeeebda95c2a225ac42696bc
```

`V0_B_POST_AUDIT_BOUNDED_CORRECTION_PROMPT.md` 是执行前形成的历史 Prompt。其头部保留了当时的
`correction_execution_authorized: false`，不代表当前返修未获授权；返修已由用户另行授权并由
corrected Candidate Commit 固定。不得回写该历史文件。

## 3. Gate A

开始复审前只读核验：

1. 根仓库 HEAD 精确等于 corrected Candidate Commit；
2. tracked 与 staged files 均干净；
3. 允许已登记的未跟踪 `reference/` 和本 Prompt 存在；
4. `.upstream/pi` 与 `.runs/v0-a/pi` 均为固定 Pi Commit 且干净；
5. 上述绑定文件的 SHA-256、Source Inventory 52/52、Source Delta 36/36 均匹配；
6. `CURRENT_STATE.md`、正式 Contract、Charter、控制规则、ADR、V0-A fixture 与 Pi 没有 Candidate delta；
7. 不读取凭据或 `.env`，不访问网络。

任一身份或边界不匹配，立即提交简短 Pause Report，不继续测试。

## 4. Required reading

只需完整读取与本次五项关闭判断直接相关的材料：

1. `AGENTS.md`
2. `CURRENT_STATE.md`
3. `docs/第二项目_Codex交接包_2026-07-30/V0_B_GOAL_CONTRACT.md`
4. `docs/reports/V0_B_INDEPENDENT_RISK_AUDIT_REPORT.md`
5. `docs/reports/V0_B_POST_AUDIT_BOUNDED_CORRECTION_PROMPT.md`
6. `docs/reports/V0_B_IMPLEMENTATION_REPORT.md` 的返修与 `INDEPENDENT_REAUDIT_INPUT`
7. `docs/reports/V0_B_CLOSEOUT_DRAFT.md` 的返修结论
8. `.runs/v0-b/evidence/EVIDENCE_INDEX.md`
9. `.runs/v0-b/evidence/basic-authorization-object-micro-correction-probe-results.json`
10. 五项发现对应的当前源码与 `workbench/tests/v0b-post-audit.test.ts`

不要求重新通读全部 G001–G006、参考源码镜像或 Harness 知识库；只有发现身份矛盾时才回溯。

## 5. Exact re-audit scope

### V0B-AUD-001 — scan attestation binding

确认：

- required scopes 缺失、重复、未知或 kind 错误会失败；
- file/object scope digest 伪造会失败；
- terminal scope labels 不一致会失败；
- writer 与 inspector 使用相同的 bounded projection/policy。

只在副本上执行已有回归或等价最小 mutation，不设计签名、PKI 或通用防篡改平台。

### V0B-AUD-002 — Evidence Index completeness

确认：

- 删除 `attempt.json` Index entry 并重绑外层 digest 后仍失败；
- responsibility mismatch、unexpected entry、缺失 Tool artifact 会失败；
- Index 规则只覆盖 V0-B terminal evidence，不扩张为通用文件 inventory。

### V0B-AUD-003 — terminal Journal suffix

确认：

```text
evidence_validation_completed
< outcome_created
< run_terminal
```

并确认交换顺序、terminal 后追加 event、重复 terminal、Outcome projection 不一致都会失败。

### V0B-AUD-004 — bounded wall-time truthfulness

确认 integrated scan 跨越 wall limit 时：

- Run 保持 incomplete；
- 不生成可接受的 Outcome；
- 不生成 terminal marker；
- 不声称实时调度、进程树取消或精确最后磁盘字节时间。

### V0B-AUD-005 — bounded scanner variants

确认至少以下 synthetic cases：

- escaped JSON credential key；
- Basic Authorization text file；
- Bearer tab/newline object；
- flat `{ authorization: "Basic ..." }` object；
- nested `{ request: { headers: { Authorization: "Basic ..." }}}` object；
- 既有 API-key/token controls；
- benign `authorization_required: false` 不产生无法解释的误报；
- persisted match 只含 `rule_id` 与 `scope_label`，不含匹配值。

不扩张为通用 DLP，不要求穷举 Unicode、压缩、加密或任意编码规避。

## 6. Required regression set

只运行以下必要回归；一次通过后不要重复进行宽泛测试：

```powershell
& '.runs/v0-a/pi/node_modules/.bin/tsc.cmd' -p 'workbench/tsconfig.json' --noEmit
node --test 'workbench/tests/v0b-post-audit.test.ts'
node --test 'workbench/test'
node 'workbench/scripts/public-import-smoke.mjs'
node 'workbench/scripts/verify-formal-run.mjs' '.runs/v0-a/runs/run-5c0b157e-31d7-4873-95a1-fd284377ace3'
```

并在 accepted V0-A authoritative Workspace 中运行：

```powershell
node --test 'test/public.test.ts'
```

预期：

```yaml
strict_typescript: pass
post_audit_tests: 11_passed
complete_workbench_tests: 67_passed
public_pi_import: pass
v0_a_authoritative_verification: pass
v0_a_public_tests: 3_passed
```

复核当前六个 V0-B Run 的 nominal inspect 结果，以及五项 mutation probe 的 fail-closed 结果即可。
不得创建新的真实模型 Run、Recovery 或 child Attempt。

## 7. Explicit non-scope

不得：

- 重新做 V0-B 全面架构审计；
- 主动新增第六类安全发现，除非观察到会直接否定本次五项关闭结论的具体回归失败；
- 研究 OS Sandbox、系统级网络阻断、并发攻击、same-account race、通用事务、Exactly-once；
- 扩展 scanner 为通用 DLP；
- 修改任何产品源码、测试、Report、Contract、Charter、ADR 或 `CURRENT_STATE.md`；
- 修改或提交 Pi、V0-A、reference；
- 安装依赖、下载资料、访问 Registry 或调用模型；
- 创建 Git commit；
- 接受 V0-B 或进入 V0-C。

如发现新的非阻塞局限，只在报告的 `deferred_non_blocking_observations` 中一句话登记，不升级为新 Gate。

## 8. Evidence and output

允许在以下 ignored root 保存本次只读/副本 mutation 的 raw evidence：

```text
.runs/v0-b/reaudit/7e0d8f7/
```

不得覆盖旧 Run、第一次 audit raw evidence或现有 `.runs/v0-b/evidence/`。

唯一 tracked 输出：

```text
docs/reports/V0_B_INDEPENDENT_REAUDIT_REPORT.md
```

报告保持简洁，必须包含：

1. Gate A 身份核验；
2. 五项 finding 的 `resolved` / `unresolved` / `blocked` 矩阵；
3. 每项使用的 source symbol、test、probe 与实际结果；
4. regression commands、exit codes 和 counts；
5. Candidate、Pi、protected/control before/after status；
6. real/external Provider、Recovery、child Attempt 均为 0；
7. 未验证边界；
8. 最终建议，只能是：

```yaml
- PASS_FOCUSED_INDEPENDENT_REAUDIT
- REQUEST_BOUNDED_CORRECTION
- PAUSE_IDENTITY_OR_SCOPE_BLOCKER
```

若五项均关闭且回归、身份与边界全部通过，建议
`PASS_FOCUSED_INDEPENDENT_REAUDIT`。这仍不是 V0-B 的正式接受；主 Session 与用户保留最终决定。

完成报告后立即停止，等待主 Session 与用户验收。
