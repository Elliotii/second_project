# V0-B Main Review Bounded Correction Prompt

```yaml
document_status: user_authorized_handoff_prompt
goal_id: V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME
correction_type: bounded_main_review_correction
formal_contract:
  docs/第二项目_Codex交接包_2026-07-30/V0_B_GOAL_CONTRACT.md
control_baseline_commit: 32dc7b136053e2fdc17f294322a3cf7fef79e737
v0_a_implementation_baseline_commit: 1a1565fa7e6d1440c8f99e2c7e587201a14111c1
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
implementation_owner: existing_dedicated_v0_b_goal_session
main_session_acceptance: pending
independent_risk_audit: authorized_after_correction_not_part_of_this_session
real_model_calls_authorized: 0
external_network_authorized: false
dependency_installation_authorized: false
pi_core_patch_authorized: false
git_commit_authorized: false
```

> 本文件记录主 Session 对 V0-B 首轮实现的有界返修要求，并作为可直接发送给
> 原 V0-B 专用 Goal Session 的执行 Prompt。它不是新 Goal Contract，不修改
> V0-B 的技术范围、Outcome precedence、Budget、Claims 或长期路线。

---

## Copy-ready Prompt

你继续担任原 `dedicated_v0_b_goal_session`，只执行 V0-B Main Review
要求的有界返修。

这不是新 Goal，不授权 V0-C、Stage 2、真实模型、Recovery、第二 Attempt、
跨进程 Resume、通用事务系统或新产品功能。

当前主 Session 的处置是：

```yaml
V0_B:
  current_disposition: pending_bounded_correction
  PASS_V0_B_EVIDENCE_FOUNDATION: not_yet_accepted
  FAIL_V0_B_CONTRACT: false
  architecture_route_rejected: false
  active_goal_remains: V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME
```

用户已经授权本次返修，并同意在返修完成后，由一个独立只读风险审计 Session
复核安全与证据边界。独立审计不属于你的职责；你完成返修和交付物后必须停止。

### 一、开始前必须完整读取

按顺序完整读取：

1. `AGENTS.md`；
2. `CURRENT_STATE.md`；
3. `docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md`；
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`；
5. `docs/第二项目_Codex交接包_2026-07-30/V0_B_GOAL_CONTRACT.md`；
6. `docs/reports/V0_B_IMPLEMENTATION_REPORT.md`；
7. `docs/reports/V0_B_CLOSEOUT_DRAFT.md`；
8. `.runs/v0-b/evidence/EVIDENCE_INDEX.md`；
9. `.runs/v0-b/evidence/commands-and-exit-codes.md`；
10. 本文件；
11. 下列主审涉及的全部源文件和测试：
    - `workbench/src/run-v0b.ts`
    - `workbench/src/inspect-v0b.ts`
    - `workbench/src/contracts/v0b-types.ts`
    - `workbench/src/evidence/artifacts.ts`
    - `workbench/src/evidence/journal.ts`
    - `workbench/src/evidence/validator.ts`
    - `workbench/src/session/evidence-session.ts`
    - `workbench/src/verifier/runner.ts`
    - `workbench/src/pi/pi-adapter-v0b.ts`
    - 所有 `workbench/tests/v0b-*.test.ts`

如需重新核验 Pi 行为，先完整读取 `.upstream/pi/AGENTS.md`，并且只读取 Contract
已经指定的 pinned Pi 源码和测试。不得修改或构建 Pi。

### 二、返修 Gate 0

任何源文件修改前，核验并记录：

```yaml
root_HEAD: 32dc7b136053e2fdc17f294322a3cf7fef79e737
root_expected_state:
  - V0_B implementation remains uncommitted
  - no staged files
  - registered untracked reference/ may exist unchanged
pi_HEAD: 027a5847901b5dde30270abaa1041046cd2b4b55
v0_a_pi_HEAD: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_status: clean
v0_a_pi_status: clean
protected_tracked_diff: empty
```

同时核验：

- `.runs/v0-b/evidence/source-inventory.json` 中原 46 个文件在开始返修前仍为
  46/46 digest 匹配；
- `run-80a75c40-a70d-4117-b4e0-77ceeb089266`、三个旧 counterexample Run
  和全部原始工件仍存在且未被覆盖；
- `CURRENT_STATE.md`、正式 Contract、V0 Charter、控制规则、V0-A fixture、
  `.upstream/pi/`、`reference/` 均未被返修前状态污染。

若以上任一项不成立，立即停止并提交 Correction Pause Report；不得 reset、
checkout、clean、stash、删除 Run 或静默重建基线。

### 三、必须修正的五个主审问题

#### Correction 1：Terminal 前的内建 Secret / Reasoning Scan

当前事实：

- `workbench/src/run-v0b.ts` 在 Workbench 内没有 pre-terminal scan；
- 原报告中的 `rg` 扫描发生在 Run 已经写入 `terminal.json` 之后；
- 零命中结果有效，但时序不满足 Contract 14.3。

必须：

1. 在 Coordinator 内实现确定性、有界、无模型调用的扫描；
2. 扫描必须发生在 `terminal.json` 写入之前；
3. 至少覆盖：
   - Session evidence；
   - Journal；
   - Run / Attempt / Workspace / Verifier objects；
   - Tool 与 Verifier Artifacts；
   - 待写 Outcome 的确定性序列化内容；
4. 扫描结果必须进入可复核的安全 evidence，但不得记录实际 secret 值；
5. terminal evidence 必须能够证明 scan completed、scan scope 和 zero matches；
6. 检测命中时不得继续生成一个看似可信的 passed/failed terminal：
   - 不打印命中内容；
   - 不删除原始失败证据来制造零命中；
   - 按 Contract 的 evidence/secret Pause 边界安全停止；
   - `inspect` 必须把未完成 terminalization 视为 incomplete/invalid；
7. 增加测试证明：
   - 正常 Run 在 terminal 前完成 scan；
   - synthetic forbidden content 被检出；
   - 检出时没有 terminal commit；
   - scanner 或 scan evidence 失败不能被当作 `passed`；
   - authoritative Runs 的最终扫描为零命中。

允许新增一个小型 `workbench/src/evidence/` scanner 和安全 scan-result artifact。
不得建设通用 DLP、凭据平台或全仓库秘密管理系统。

#### Correction 2：ArtifactRef 与 Inspect 的真实路径边界

当前事实：

- `resolveRunRelative()` 只做词法 `resolve/relative`；
- `artifactRef()` / `validateArtifactRef()` 只检查最终 path entry；
- 父目录 junction、symlink 或其他 Node 可识别 reparse link 可能把实际文件解析到
  Run root 外；
- 部分损坏 JSON、JSONL、Index 或非普通文件可使 `inspect` 抛出未结构化异常。

必须：

1. 拒绝 Run root 自身为 symlink/junction；
2. 对 ArtifactRef 的每个现存路径段执行 link-aware 检查；
3. 使用真实路径 containment，保证最终对象实际位于同一 Run root；
4. 拒绝中间 symlink/junction、dangling link ancestor、最终 link、目录和其他
   非普通文件；
5. 不跟随 Run evidence 中的 link 读取、哈希或展开外部内容；
6. `validateArtifactRef()` 对不可信/损坏证据返回安全错误，不因目录读取等情况
   直接崩溃；
7. `inspect` 对 malformed JSON、malformed JSONL、invalid Index shape、
   missing artifact、digest mismatch、link escape 和非普通文件稳定返回：

```yaml
committed: false_or_true_according_to_terminal_envelope
integrity_valid: false
errors:
  - bounded_safe_diagnostic
```

8. CLI 对上述 integrity-invalid / incomplete 情况返回非零，不修复证据，也不
   展开 artifact body。

测试至少覆盖：

- `../` 和非 Run ID；
- intermediate junction/reparse escape；
- dangling junction ancestor；
- linked Run root；
- final linked artifact；
- directory masquerading as artifact；
- malformed Journal JSONL；
- malformed Evidence Index；
- terminal/index/outcome digest mismatch。

如当前 Windows 权限仍不能创建 file symlink，可使用实际 junction/reparse
测试相同路径分支并在 Report 如实限定；不得把未测试的 OS 级能力写成事实。

#### Correction 3：Verifier Execution Evidence 与 Journal ArtifactRef

当前事实：

- VerifierResult 有 started/completed timestamp，但没有明确保存 duration；
- environment allowlist 和 cwd 的实际执行配置主要存在于代码/报告，没有完整
  落入 terminal evidence；
- Journal `verifier_completed.full_output_ref` 当前只是字符串路径；
- Validator 会静默忽略非对象形式的 `*_ref`。

必须：

1. 在 terminal evidence 中明确记录实际：
   - executable identity；
   - argv；
   - cwd identity；
   - `shell: false`；
   - environment allowlist 的 key 集合；
   - timeout；
   - output hard cap；
   - started/completed；
   - `duration_ms`；
2. 不得记录完整 inherited environment 或环境变量的敏感值；
3. Journal 中的 `full_output_ref` 必须是完整 ArtifactRef，不能只是 path；
4. Journal/Evidence Validator 遇到声明为 ArtifactRef 的畸形值必须 fail closed，
   不得静默跳过；
5. Verifier 的实际执行 source 必须与固定 digest 一致：
   - 优先执行 Run 内 write-once snapshot；或
   - 使用同等强度、无可利用 TOCTOU 窗口的有界方案；
   - 报告实际采用方案和限制；
6. 测试 pass、valid task failure、missing/spawn/parse/timeout/output-cap 中
   Contract 要求的必要代表路径，并断言 duration/env/cwd/ArtifactRef evidence。

不得建设通用进程执行平台或系统级 process-tree sandbox。

#### Correction 4：Reasoning Redaction Metadata 完整性

当前事实：

- reasoning body 和 signature 的剥离成功；
- 当前只聚合 block count、character count 和 signature count；
- Contract 9.2 还要求 content type 与 character/byte count。

必须：

1. 在不持久化 reasoning body/signature 的前提下补充：
   - redacted block count；
   -原 content type；
   - character count；
   - UTF-8 byte count；
   - removed signature count；
2. 保持 metadata 有界，不保存逐 token 或大对象；
3. synthetic test 使用至少一个多字节 reasoning body，证明 characters 与 bytes
   可以不同；
4. public `JsonlSessionStorage.open()` 仍能读取；
5. persisted bytes 对 body、signature、authorization/API-key sentinel 为零命中；
6. Run `SessionRef` 或等价 terminal evidence 能复核上述 metadata。

#### Correction 5：真实 Persistence Failure 与 Claim 校准

当前事实：

- 原 `invalid/evidence` 路径证明 settled 后 Session 文件被破坏可以被发现；
- 它不是 evidence mirror `appendEntry()` 实际失败；
- 原 Report 将其扩大表述为 persistence failure。

必须：

1. 保留现有 corruption/digest inconsistency 覆盖；
2. 增加 deterministic test-only persistence failure 注入，命中 evidence mirror
   写入路径，而不是只在完成后追加坏记录；
3. 注入不得成为默认 CLI Product Surface；
4. Coordinator 必须：
   - 不把该失败写成 `failed/agent`；
   - 不运行不满足 settled/session-complete 前提的 Verifier；
   - 记录有界 attempt error/abort/incomplete evidence；
   - 在可以安全 terminalize 且不违反证据完整性时使用
     `invalid/evidence`；
   - 若无法形成可信 terminal evidence，则保留 incomplete evidence，让
     `inspect` 返回 invalid，而不是伪造 Outcome；
5. Journal validator 必须区分正常 settled route 与合法 error/abort route，
   不能为了让测试通过而删除正常 Route 的 required events；
6. 修正 Report：分别说明
   - persistence operation failure；
   - post-persistence corruption；
   - 两者各自证明和未证明什么。

### 四、Budget 与真实性附带修正

本项不授权建设通用调度器，但必须消除当前证据中的不真实可能性：

- `wall_time_usage_ms` 必须保存实际观测值，不得用 limit 截断；
- 成功 Run 必须断言真实 usage 未超过固定 limit；
- provider/tool limit 不得只在已经超过后才被悄悄记录为正常成功；
- 至少用有界 test-only injection 覆盖 `failed/budget` 的 Coordinator/Outcome
  关联，或在不改变 Contract 的前提下证明固定 Faux sequence 的硬上界；
- abort snapshot 必须与实际 route 一致；
- 不得借此实现 Recovery、通用 cancellation runtime 或 process-tree 保证。

### 五、不得改变的边界

```yaml
forbidden:
  - modify CURRENT_STATE.md
  - modify V0_B_GOAL_CONTRACT.md
  - modify V0_VERSION_CHARTER.md
  - modify 09 control rule
  - modify accepted ADR or V0_A closeout
  - modify this main-review correction prompt
  - modify fixtures/tasks/v0-a-parse-duration/**
  - modify .upstream/pi/**
  - modify .runs/v0-a authoritative evidence
  - modify reference/**
  - call real model or external Provider
  - read .env or credentials
  - install dependencies
  - use external network
  - add Pi private imports
  - add Pi Core patch
  - add Recovery or child Attempt
  - enter V0_C, V1 or V2
  - stage files
  - create Git commit
  - execute the independent risk audit
  - self-accept V0_B
```

保持 Outcome precedence、one initial Attempt、Recovery 0、child Attempt 0、
external Provider calls 0 不变。

### 六、旧证据与新权威证据

不得删除或覆盖旧 Run。

至少将以下旧权威 Run 在 Report/Evidence Index 中标记为：

```yaml
run_id: run-80a75c40-a70d-4117-b4e0-77ceeb089266
status: superseded_due_main_review_evidence_and_path_correction
original_artifacts_preserved: true
```

原三个 counterexample Run 同样保留，并明确它们属于首轮实现证据，不再作为
返修后的最终权威 IDs。

返修后重新生成：

1. authoritative `passed/null`；
2. `failed/agent`；
3. `invalid/verifier`；
4. `invalid/evidence`；
5. persistence-operation failure 的有界证据；
6. secret-scan rejection 的测试证据，但不得把 synthetic secret 持久化进
   最终权威 terminal evidence。

所有新 Run 必须：

- 外部 Provider/model calls 0；
- Recovery 0；
- child Attempts 0；
- Pi patch/private import 0；
- terminal 前 scan 已完成且零命中；
- 对合法 terminal Run，`inspect` 返回完整且 integrity-valid；
- 对故意损坏或未完成 Run，`inspect` 返回非零和安全诊断。

### 七、必须执行的验证

使用当前已存在的本地依赖；不得安装或更新。

至少执行并记录 exact command、exit code 和 count：

1. strict TypeScript；
2. 完整 `node --test workbench/test`；
3. public emitted Pi import smoke；
4. accepted V0-A authoritative Run verifier；
5. accepted V0-A public task tests；
6. V0-B deterministic suite；
7. 新 authoritative pass `inspect`；
8. 新 evidence-invalid / incomplete `inspect` 非零；
9. path/reparse/malformed-evidence regressions；
10. integrated pre-terminal secret/reasoning scan evidence；
11. root protected diff、staged diff、Pi HEAD/status；
12. source inventory/delta 与 `git diff --check`。

如果测试数量改变，必须报告新总数，不得继续沿用 `42/42`。

### 八、必须更新的交付物

更新：

- `docs/reports/V0_B_IMPLEMENTATION_REPORT.md`
- `docs/reports/V0_B_CLOSEOUT_DRAFT.md`
- `.runs/v0-b/evidence/EVIDENCE_INDEX.md`
- `.runs/v0-b/evidence/commands-and-exit-codes.md`
- `.runs/v0-b/evidence/source-inventory.json`
- `.runs/v0-b/evidence/source-delta.json`

允许新增有界的 main-review-correction evidence 文件。

报告必须：

- 将首轮 `Gates A–H PASS / DoD 25/25` 标记为被主审返修要求取代；
- 对五项 Correction 分别给出 source path、symbol、test 和 actual Run evidence；
- 明确哪些是 Fact、Inference、Recommendation、Unconfirmed；
- 如实说明 Windows symlink/junction 实际覆盖；
- 明确没有 OS Sandbox、network-egress guarantee、process-tree guarantee；
- 明确 Stage 2 未授权且未执行；
- 提交新的 `CURRENT_STATE_UPDATE_PROPOSAL`，但不得修改 `CURRENT_STATE.md`；
- 只能建议 `PASS_V0_B_EVIDENCE_FOUNDATION`，不得自行接受。

### 九、Pause Conditions

命中任一项立即停止：

1. Gate 0 身份或 protected files 不一致；
2. 需要改变正式 Contract、Outcome precedence 或 V0 Charter；
3. 需要 Pi patch/private import；
4. 需要网络、安装、真实模型或凭据；
5. 只有删除/覆盖原始失败证据才能让安全扫描通过；
6. 无法在 terminal 前完成安全扫描；
7. ArtifactRef containment 必须扩张成通用 Sandbox 才能解决；
8. persistence failure 只能被误报为 Agent failure；
9. 返修需要 Recovery、second Attempt、cross-process Resume 或通用事务；
10. 需要修改任何 control、reference、upstream 或 V0-A protected material；
11. 发现 actual secret/reasoning body 已进入返修后的 persisted Run evidence；
12. 返修范围不再有界。

Pause 时只提交：

```text
docs/reports/V0_B_MAIN_REVIEW_CORRECTION_PAUSE_REPORT.md
```

并记录观察、证据、阻塞原因、需要主 Session/用户决定的选项、零真实调用证明和
保留状态。

### 十、最终停止点

完成返修、全部验证、新证据和报告后：

1. 不修改 `CURRENT_STATE.md`；
2. 不 stage；
3. 不 commit；
4. 不启动 Stage 2；
5. 不启动独立审计；
6. 不进入 V0-C；
7. 返回：
   - 新权威 Run IDs；
   - strict TypeScript 与测试结果；
   - Correction 1–5 的逐项结果；
   - Source Delta / Source Inventory；
   - exact external Provider/model call count；
   - root/Pi status；
   - 建议处置；
8. 立即停止，等待主 Session发起独立风险审计。

独立审计完成并由主 Session复核前，V0-B 仍保持未正式接受。

---

## Post-correction governance

返修完成后的固定顺序：

```text
Dedicated V0-B Session returns corrected evidence
→ Main Session performs identity and scope intake
→ Main Session creates a new evidence-bound independent risk-audit prompt
→ Independent audit Session performs read-only review and narrow probes
→ Main Session reconciles implementation report and audit report
→ User decides acceptance or another bounded correction
→ Only after acceptance may control closeout / implementation commit be authorized
```

独立审计 Prompt 必须绑定返修后的精确 Source Inventory、Source Delta、权威 Run
IDs 和测试数量，因此本轮不提前生成。
