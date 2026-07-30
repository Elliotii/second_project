# V0-B Post-audit Bounded Correction Prompt

```yaml
document_status: draft_ready_for_user_review
document_owner: current_codex_main_session
goal_id: V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME
correction_id: V0_B_POST_AUDIT_BOUNDED_CORRECTION
execution_owner: original_dedicated_v0_b_goal_session
correction_execution_authorized: false
formal_v0_b_acceptance: false
current_state_update_authorized: false
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
> 本文件只起草返修任务。用户本轮授权的是 Prompt 起草，不是返修执行。
> 在用户单独接受本 Prompt 并授权原 V0-B 专用 Goal Session继续前，不得修改
> 实现、运行新 Run、更新控制状态或创建 Git commit。

---

## 1. Main-session disposition

主 Session 已复核独立审计报告、审计 raw probes、V0-B Contract 和对应源码，
接受以下审计处置：

```yaml
main_review_disposition: REQUEST_BOUNDED_CORRECTION
V0_B_formal_acceptance: false
active_goal_should_remain: V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME
contract_revision_required: false
architecture_redesign_required: false
independent_audit_report_accepted_as_advisory_evidence: true
```

本次返修不是新 Goal，不扩大 V0-B，也不重新打开 V0-A。

### 1.1 Fixed identity

```yaml
repository: D:/AI/AI_Projects/project2
control_baseline_commit: 32dc7b136053e2fdc17f294322a3cf7fef79e737
audit_candidate_commit: 18ba8466799198b1ce3e732990a49f626fb83d48
audit_candidate_role: preserved_failed_audit_candidate
audit_candidate_parent: 32dc7b136053e2fdc17f294322a3cf7fef79e737
audit_report: docs/reports/V0_B_INDEPENDENT_RISK_AUDIT_REPORT.md
audit_report_sha256: 10316dc66c99868772ec4548f0314a5cfc707ef45dd2b4047a127eb29e70393e
audit_recommendation: REQUEST_BOUNDED_CORRECTION
audit_finding_count: 5
audit_highest_severity: P1
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
v0_a_implementation_baseline: 1a1565fa7e6d1440c8f99e2c7e587201a14111c1
```

### 1.2 Current candidate result

以下事实继续有效：

- strict TypeScript passed；
- Workbench 56/56 tests passed；
- accepted V0-A verifier and 3/3 public tests passed；
- public emitted Pi import smoke passed；
- six fixed V0-B Runs replay their nominal results；
- real/external Provider calls were 0；
- Recovery and child Attempts were 0；
- Pi Core patches and private imports were 0。

但这些 nominal results 不能覆盖审计发现的 semantic-integrity gaps。

---

# Dedicated V0-B Goal Session Correction Prompt

你是原 `dedicated_v0_b_goal_session`，只负责 V0-B Contract 内的有界返修。

你不得接受 V0-B、修改项目控制状态、创建 Git commit 或进入 V0-C。完成返修、
证据和报告后立即停止，等待主 Session、独立审计 Session 和用户复核。

## A. Authorization gate

只有用户明确接受本 Prompt 并授权返修执行后，才能继续本节以下动作。

开始时必须记录：

```yaml
correction_execution_authorized_by_user: true
expected_root_HEAD: 18ba8466799198b1ce3e732990a49f626fb83d48
expected_tracked_diff: 0
expected_staged_entries: 0
real_model_calls_authorized: 0
external_network_authorized: false
git_commit_authorized: false
```

允许存在且不得修改或提交的已登记未跟踪输入：

```text
reference/
docs/reports/V0_B_INDEPENDENT_RISK_AUDIT_START_PROMPT.md
docs/reports/V0_B_INDEPENDENT_RISK_AUDIT_REPORT.md
docs/reports/V0_B_POST_AUDIT_BOUNDED_CORRECTION_PROMPT.md
```

如出现其他未解释 tracked/staged 变化，立即 Pause。

## B. Required reading

在任何实现、测试或新 Run 前完整读取：

1. 根 `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. `docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md`；
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
5. `docs/第二项目_Codex交接包_2026-07-30/V0_B_GOAL_CONTRACT.md`；
6. `docs/reports/V0_B_IMPLEMENTATION_REPORT.md`；
7. `docs/reports/V0_B_CLOSEOUT_DRAFT.md`；
8. `docs/reports/V0_B_MAIN_REVIEW_BOUNDED_CORRECTION_PROMPT.md`；
9. `docs/reports/V0_B_INDEPENDENT_RISK_AUDIT_START_PROMPT.md`；
10. `docs/reports/V0_B_INDEPENDENT_RISK_AUDIT_REPORT.md`；
11. 本 Prompt；
12. `.runs/v0-b/evidence/EVIDENCE_INDEX.md`；
13. `.runs/v0-b/evidence/commands-and-exit-codes.md`；
14. `.runs/v0-b/evidence/source-inventory.json`；
15. `.runs/v0-b/evidence/source-delta.json`；
16. 五项 finding 引用的全部 Workbench source/tests；
17. 独立审计 raw probes 和结果，只读：
    - `.runs/v0-b/audit/18ba846/.runs/v0-b/audit-raw/probe-results.json`
    - `.runs/v0-b/audit/18ba846/.runs/v0-b/audit-raw/scan-binding-probe-results.json`
    - `.runs/v0-b/audit/18ba846/.runs/v0-b/audit-raw/scanner-variant-results.json`
    - `.runs/v0-b/audit/18ba846/.runs/v0-b/audit-raw/fixed-scan-binding-check.json`

不得修改审计 worktree、raw probes、审计报告或原候选 Commit。

## C. Correction mission

唯一任务是解决：

```yaml
- V0B-AUD-001
- V0B-AUD-002
- V0B-AUD-003
- V0B-AUD-004
- V0B-AUD-005
```

不允许借返修增加：

- 通用 tamper-proof platform；
- cryptographic signing / PKI；
- generic transaction or exactly-once runtime；
- generic DLP or secret-management platform；
- general cancellation/process-tree runtime；
- OS Sandbox；
- Recovery or second/child Attempt；
- real-model route；
- V0-C、V1 或 V2。

## D. Binding design constraints

### D1. One shared terminal-evidence policy

V0B-AUD-001、002、003 不得用三组互不一致的零散 `if` 修补。

应在 `workbench/src/evidence/` 中建立或提炼一个小型、V0-B-bounded 的共享
policy，使 Coordinator/writer 与 `inspect` 使用相同的：

- required terminal Artifact path/responsibility rules；
- required scan scope label/kind/projection rules；
- required terminal Journal suffix/order rules。

文件名和函数名可以由实现选择，但必须保持：

```yaml
single_source_of_policy_truth: true
v0_b_bounded: true
no_general_schema_platform: true
writer_and_inspector_share_semantics: true
```

如果共享策略会膨胀成通用 workflow/schema engine，停止并改用更小的 typed
constant/function set。

### D2. V0B-AUD-001 — Bind scan attestation

返修后 `inspect` 必须：

1. 要求所有 V0-B mandatory scan scopes 恰好出现一次；
2. 拒绝缺失、重复、未知或 kind 错误的 scope；
3. 对 file scope 重新计算当前 evidence bytes 的 size/SHA-256；
4. 对 object scope 使用与 writer 相同的 deterministic projection 和
   `stableJson` 重新计算 size/SHA-256；
5. 从 final Journal 重建并验证：
   - `journal_preterminal`；
   - `pending_terminal_journal_events`；
6. 验证 terminal 中的 scope labels、scan ArtifactRef 和 scan result 完全一致；
7. 保留 Index/terminal/scan 之间无 digest cycle 的设计。

至少增加回归：

```yaml
- remove_required_scan_scope_must_fail
- forge_file_scope_digest_must_fail
- forge_object_scope_digest_must_fail
- duplicate_scope_must_fail
- wrong_scope_kind_must_fail
- terminal_scope_label_mismatch_must_fail
```

禁止把“当前 fixed Run 的 scan bytes 恰好一致”继续当作 inspector enforcement。

### D3. V0B-AUD-002 — Enforce Evidence Index completeness

定义 V0-B 各合法 terminal route 的 required Index policy。

至少覆盖：

- Task、Strategy、Verifier 和 instruction snapshots；
- Run 和 single Attempt；
- Workspace；
- SessionRef 和 reasoning-safe Session JSONL；
- Journal；
- VerifierResult 和 full output；
- validation；
- abort evidence；
- secret scan；
- Outcome；
- declared Tool result artifacts。

继续排除 `evidence-index.json` 和 `terminal.json` 自身，避免 digest cycle。

`inspect` 必须拒绝：

- required item missing；
- duplicate path；
- responsibility mismatch；
- undeclared required Tool artifact；
- unexpected cycle entry；
- required file存在但未进入 Index。

至少移植审计反例：

```yaml
remove_attempt_json_from_index_then_rebind_index_and_terminal_must_fail
```

不要把 Index 扩展成通用文件系统 inventory；只验证 V0-B terminal evidence。

### D4. V0B-AUD-003 — Enforce terminal Journal suffix

terminal Run 必须证明：

```text
evidence_validation_completed
< outcome_created
< run_terminal
```

并要求：

- `outcome_created` exactly once；
- `run_terminal` exactly once；
- `run_terminal` 是 final Journal entry；
- `outcome_created` 是其前一个 terminal lifecycle entry；
- 两者在 status、failure_class、terminal_reason 上与 accepted Outcome 一致；
- terminal 后没有任何 event；
- preterminal validation mode 与 terminal inspection mode 明确区分。

至少增加：

```yaml
- swapped_outcome_and_terminal_must_fail
- event_after_run_terminal_must_fail
- duplicate_terminal_event_must_fail
- terminal_projection_outcome_mismatch_must_fail
```

### D5. V0B-AUD-004 — Truthful bounded wall-time semantics

本项修复真实性，不建设实时操作系统或通用 cancellation runtime。

必须明确并测试：

```yaml
wall_time_usage_endpoint:
  includes:
    - Agent_or_fixed_Faux_execution
    - settled
    - Session_persistence
    - external_Verifier
    - preterminal_evidence_validation
    - integrated_secret_scan
  final_safe_decision_point: immediately_after_integrated_scan_before_terminal_commit_sequence
  excludes:
    - unavoidable_final_terminal_marker_write_latency
  non_claims:
    - exact_last_disk_byte_runtime
    - real_time_scheduling
    - process_tree_cancellation
```

实现必须同时保证：

1. `wall_time_usage_ms` 不再在 scan 之前冻结；
2. scan 完成后，在最终 Outcome/budget 决策前更新实际 elapsed usage；
3. 若 scan 期间越过 wall limit，不能产生 accepted `passed` terminal；
4. 在写最终 terminal marker 前再次检查 deadline；
5. 若 terminalization 已越界，必须 fail closed，不得留下可被 `inspect`
   接受的 `passed` terminal；
6. Reports 必须说明 endpoint 和最后 marker write 的 non-claim。

允许使用 secret-relevant canonical object projection，将纯 numeric
wall-time/timestamp 等固定安全字段从 secret scan projection 中归一化，从而避免：

```text
scan pending object
→ update wall time
→ invalidate scan digest
```

但必须满足：

- projection 明确、共享且可由 `inspect` 重算；
- 只归一化固定安全字段；
- 不排除可能携带 user/provider/tool text 的字段；
- Evidence Index 仍对最终完整文件做 byte digest；
- 不把 projection 变成通用 redaction engine。

如果无法在不改变 accepted Outcome precedence、terminal single-write 语义或
Contract wall-time边界的情况下解决 digest cycle，立即 Pause，交由主 Session
和用户决定；不得自行增加多阶段事务协议。

### D6. V0B-AUD-005 — Bounded scanner variants

仅补 V0-B 已知 text/JSON/JSONL evidence formats：

- raw and decoded-safe JSON key representation；
- escaped credential-key spelling；
- `Authorization: Basic ...`；
- `Authorization: Bearer ...`；
- Bearer 的 space/tab/newline 或 stable-JSON escaped whitespace；
- existing API-key/token patterns。

要求：

- 只使用 synthetic sentinels；
- 不读取真实凭据或 `.env`；
- 不把 matched value 写入 scan result、Journal 或 Report；
- 保持 file/object caps；
- malformed decoded representation fail closed or fall back to raw scan；
- 明确这是 bounded ruleset，不是 complete DLP。

至少增加审计中以下回归：

```yaml
- escaped_json_key_file_rejected
- basic_authorization_file_rejected
- bearer_tab_object_rejected
- bearer_newline_object_rejected
- existing_controls_still_rejected
- benign_bounded_controls_do_not_create_unexplained_false_positive
```

## E. Test and evidence requirements

### E1. Before implementation

先核验并记录：

- root HEAD/staged/tracked status；
- Candidate Commit and parent；
- audit report SHA-256；
- Source Inventory 50/50 candidate blob match；
- Source Delta 34/34 match plus authorized provenance exception；
- both Pi HEAD/status；
- V0-A implementation baseline and accepted regression；
- zero real/external Provider authority。

### E2. During implementation

优先把独立审计的行为反例转写为正式 regression tests。不要依赖审计 raw
directory 才能通过产品测试。

必须运行：

- strict TypeScript；
- complete Workbench tests；
- all new post-audit tests；
- existing 11 correction tests；
- accepted V0-A authoritative verifier；
- accepted V0-A public 3/3 tests；
- public emitted Pi import smoke；
- `git diff --check`；
- protected/control/Pi/reference boundary checks。

不得为了维持旧的 `56/56` 数字删除或合并测试。记录新的实际总数。

### E3. New deterministic evidence

返修后生成新的、唯一的 authoritative pass Run 和所需 counterexample Runs。

要求：

- 不覆盖、删除或回写任何旧 V0-B Run；
- `18ba846...` 对应的六个 fixed Runs 保持 audit candidate history；
- 新 Run IDs 与新 Workbench tree digest 绑定；
- external Provider/model calls 仍为 0；
- Recovery/child Attempts 仍为 0；
- 新 `inspect` 对 nominal Runs给出预期结果；
- 五类 audit mutation 在副本上全部 fail closed。

旧 authoritative/counterexample Runs 只能在新报告中标记
`superseded_due_independent_audit_bounded_correction`，不得修改其原始工件。

### E4. Source/evidence identity

更新：

- `.runs/v0-b/evidence/EVIDENCE_INDEX.md`；
- `.runs/v0-b/evidence/commands-and-exit-codes.md`；
- `.runs/v0-b/evidence/source-inventory.json`；
- `.runs/v0-b/evidence/source-delta.json`。

新的 Source Delta 仍以
`32dc7b136053e2fdc17f294322a3cf7fef79e737` 为 V0-B Control Baseline，
并明确列出 post-audit correction 的新增/修改文件。

本 Prompt、独立审计 Prompt、独立审计 Report 和 audit raw artifacts 不属于
Workbench Source Inventory；它们是主控制/审计 provenance。

## F. Report correction

更新：

- `docs/reports/V0_B_IMPLEMENTATION_REPORT.md`；
- `docs/reports/V0_B_CLOSEOUT_DRAFT.md`。

必须：

1. 保留首次实现、主审返修和第一次独立审计的历史，不静默改写；
2. 将第一次审计候选的 PASS/25-of-25 recommendation 标为被审计否决；
3. 逐项映射 V0B-AUD-001 至 005：
   - source/symbol；
   - test；
   - command/exit；
   - new evidence；
   - remaining limitation；
4. 使用新的 Run IDs、test counts、inventory/delta 和 tree digest；
5. 不声称独立复审已经通过；
6. 新的结构化提案只能写：

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  active_goal: V0_B
  status: post_audit_bounded_correction_complete_pending_independent_reaudit_and_main_review
  formal_acceptance: false
  first_audit_candidate: 18ba8466799198b1ce3e732990a49f626fb83d48
  independent_reaudit: pending
```

不得修改 `CURRENT_STATE.md`。

## G. Required deliverables

返修 Session 最终返回：

1. updated authorized Workbench source/tests；
2. updated V0-B Implementation Report；
3. updated V0-B Closeout Draft；
4. new authoritative/counterexample Run IDs；
5. new Evidence Index；
6. new Source Inventory and Source Delta；
7. exact commands, exit codes and test counts；
8. V0B-AUD-001...005 correction matrix；
9. source delta summary；
10. root/Pi before-and-after status；
11. real/external Provider call count；
12. Recovery/child Attempt count；
13. secret/reasoning scan result；
14. structured `CURRENT_STATE_UPDATE_PROPOSAL`；
15. `INDEPENDENT_REAUDIT_INPUT` containing:
    - each prior finding；
    - exact regression command；
    - exact new source path/symbol；
    - exact new evidence/probe-copy path；
    - expected pass/fail result。

## H. Pause conditions

立即停止并提交有界 Pause Report，如果：

1. root HEAD 不再是 `18ba8466799198b1ce3e732990a49f626fb83d48`
   或存在未解释 tracked/staged changes；
2. audit report identity/hash 不匹配；
3. 需要修改 Contract、Charter、CURRENT_STATE、control rule 或 ADR；
4. 需要修改 Pi、V0-A、reference、旧 V0-B Runs 或 audit raw evidence；
5. 需要 install、download、network、Registry、credential 或 real model；
6. 需要 Pi Core patch/private import；
7. 需要 Recovery、child Attempt、transaction、exactly-once 或 general
   cancellation；
8. scan/digest cycle 无法用 bounded shared projection 和 fail-closed
   terminal checkpoint解决；
9. wall-time semantics 必须改变 accepted Outcome precedence；
10. scanner 修复开始扩张为 general DLP；
11. 任何真实 secret/reasoning/signature 进入 persisted evidence；
12. 修复使 V0-B 不再是有界 Goal。

## I. Stop point

返修、测试、deterministic evidence、报告和 re-audit input 完成后：

- 不创建 Git commit；
- 不修改或暂存 `CURRENT_STATE.md`；
- 不修改正式 Contract/control；
- 不自行运行独立复审；
- 不接受 V0-B；
- 不进入 Stage 2 或 V0-C；
- 返回结果并停止。

后续唯一允许流程：

```text
dedicated V0-B correction report
→ main Session source/evidence review
→ user authorizes corrected Candidate Audit Baseline Commit
→ main Session creates exact immutable corrected candidate
→ independent auditor performs focused re-audit plus full regressions
→ main Session and user decide V0-B acceptance
```

---

## 2. Remaining user authorization

```yaml
user_decisions_required:
  - decision: authorize_post_audit_bounded_correction_execution
    evidence:
      - independent_audit_found_four_P1_contract_blockers
      - one_P2_bounded_scanner_gap
      - all_five_are_within_existing_V0_B_scope
      - no_contract_redesign_or_Pi_patch_currently_required
    options:
      - authorize_original_dedicated_v0_b_goal_session
      - revise_this_prompt
      - reject_V0_B_contract
    recommendation: authorize_original_dedicated_v0_b_goal_session
    consequence: corrects_only_the_five_findings_and_returns_for_reaudit
```
