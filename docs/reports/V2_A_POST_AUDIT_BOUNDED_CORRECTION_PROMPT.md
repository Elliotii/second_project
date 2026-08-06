# V2-A Post-audit Bounded Correction Prompt

```yaml
status: authorized_bounded_correction
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
correction_owner: original_v2_a_implementation_session
failed_candidate_audit_baseline: ece8856891f950a090f9adabf75ca8c8e707ce53
control_baseline_commit: 228973b7e7b826468c54b84f28faf8d9c0c33a6d
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
accepted_findings:
  - V2A-AUDIT-P1-001
  - V2A-AUDIT-P1-002
  - V2A-AUDIT-P1-003
  - V2A-AUDIT-P1-004
  - V2A-AUDIT-P1-005
credential_reads_authorized: 0
external_network_authorized: false
external_provider_calls_authorized: 0
real_model_calls_authorized: 0
source_repair_authorized: only_contract_allowlist_for_five_findings
git_stage_or_commit_authorized: false
```

你是原 dedicated V2-A Implementation Session。Main 已接受 focused audit 的五项 blocking P1，
授权一次打包的 Contract-bounded correction。不要重新设计 V2-A，不进入 Gate J/V2-B。

## 1. Re-entry Gate

修改前核验：

- workspace：`C:\Users\HUAWEI\.codex\worktrees\7675\project2`；
- HEAD：`ece8856891f950a090f9adabf75ca8c8e707ce53`；
- tracked/staged clean；允许存在 Main-owned untracked Audit Prompt、Audit Report、Main Review 和
  本 Correction Prompt，不得修改、stage 或 commit 它们；
- Pi：`027a5847901b5dde30270abaa1041046cd2b4b55` 且 clean；
- active Goal 仍为 V2-A，real/credential/network 权限仍为 0。

完整读取：

1. `AGENTS.md`、`CURRENT_STATE.md`；
2. 正式 V2-A Contract；
3. `V2_A_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`；
4. `V2_A_FOCUSED_AUDIT_MAIN_REVIEW_AND_CORRECTION_DECISION.md`；
5. 本 Prompt；
6. 当前 V2-A source/tests/scripts 与 audit-local reproduction script/results。

Gate 不满足立即 Pause，零 source delta。

## 2. Exact correction package

### P1-001 — raw Verifier derivation

- Inspector 必须读取 Candidate/primary VerifierResult bytes；
- 校验其 nested full-output/source ArtifactRefs、attempt identity、verifier identity、exit/timeout/
  status 语义；
- `verifier_passed` 必须从已验证 raw result 派生，不相信 Candidate JSON；
- Selector replay 必须使用独立派生的 gates；
- coherent-rehash forged summary 或 raw output tamper 必须 fail closed。

### P1-002 — Session byte lineage

- 对 canonical path 进行 Windows-safe 比较；
- A pre-run snapshot 的 `parentSession` 必须精确指向 Seed parent Session；
- A pre-run entries IDs/bytes 必须逐项等于 frozen parent Session entries；
- parent、A、B Session IDs 必须互异；
- B 必须没有 parent 且零 pre-run entries；
- final A/B Session 必须分别以已验证 pre-run entries 为完整 prefix，再追加本 Attempt entries；
- foreign parent、same-count changed entry、aliased ID、divergent final prefix 都必须 fail closed。

### P1-003 — immutable initial Workspace evidence

- 每条 Candidate 在 clone/isolation check 后、`candidate_started`/Agent execution 前写入 immutable
  initial Workspace snapshot/inventory ArtifactRef；
- Candidate contract 和 Journal 必须绑定该 Ref；
- Inspector 校验 ArtifactRef、inventory entries/digest/path/link policy、A/B/Seed equality、事件顺序；
- missing、tampered、cross-Candidate、final-substituted 或 coherently rehashed wrong snapshot 必须
  fail closed；
- 不需要引入 Git worktree 或通用 snapshot platform。

### P1-004 — frozen budget recomputation

- Manifest、per-Attempt、per-Group caps 必须严格等于 Contract 的 8/16/1 与 24/48/3；
- Candidate caps 必须等于 Manifest caps；
- Inspector 从 raw JSONL Session/Journal/Verifier evidence 派生 provider dispatch、Tool calls、
  Verifier runs 与 terminal semantics，不相信 summary usage；
- Group usage 必须由 primary + A + B 独立求和；
- budget-stopped/ineligible/retained 语义由派生值决定；
- cap raise、usage under-report、terminal/gate flip 必须 fail closed。

### P1-005 — external source identity anchor

- Manifest 必须包含固定 Pi SHA、完整冻结常量与明确的 workbench source scope/digest；
- 在 Run 初始化时保存 deterministic `workbench/src` inventory/digest Artifact；
- Inspector 必须从运行时 project root 独立重算当前 `workbench/src`，并与 Manifest/Seed/Artifact
  三方比较；不能只验证 self-hash；
- 校验 Pi SHA 为固定 Contract 常量、Manifest strategy/model/tool/skill/policy/budgets 均为冻结值；
- CLI/Product Surface 必须把 project root 明确传给 Inspector；
- forged/rehashed Pi、revision/source digest/Manifest constants 和 stale source evidence 必须 fail closed。

不要尝试把未来 Candidate Git SHA 写入其自身运行前 Manifest。采用可独立重算的 deterministic
source inventory/digest，避免自引用 commit 问题。

## 3. Evidence preservation

- 不修改、删除或覆盖 `.runs/v2-a/evidence/**` 和 `.runs/v2-a/audit/**`；
- 报告中将旧实现 Evidence 标记为
  `superseded_for_gate_J_due_independent_recomputation_findings`；
- 所有 source/test 修改完成、typecheck/tests 全绿后，生成全新的 write-once corrected Evidence root，
  建议 `.runs/v2-a/corrected-evidence/**`；
- 新 Evidence 必须覆盖 initial pass、A/B winner、pass/pass、none、budget retention 和五项 tamper
  regressions所需的正常路径；
- 新 Evidence 的 source digest 必须等于返修后 `workbench/src` 的独立 recomputation；生成后不得
  再修改 `workbench/src`。如随后必须改 source，应放弃该 root 并使用新 identity，不能覆盖。

## 4. Allowed writes

只允许修改/新增：

- `workbench/src/contracts/v2-types.ts`；
- `workbench/src/run-v2.ts`；
- `workbench/src/inspect-v2.ts`；
- `workbench/src/recovery/selector-v2.ts`（仅在 derived-gate replay 必需时）；
- `workbench/src/product-surface-v2.ts`、`workbench/src/cli.ts`（仅 project-root 接线）；
- `workbench/tests/v2a-*.test.ts`；
- `workbench/scripts/run-v2a-*.mjs`；
- `workbench/package.json`、`workbench/README.md`（仅必要命令/边界说明）；
- `docs/reports/V2_A_IMPLEMENTATION_REPORT.md`、`V2_A_CLOSEOUT_DRAFT.md` 的 correction appendix；
- 新 `docs/reports/V2_A_POST_AUDIT_BOUNDED_CORRECTION_REPORT.md`；
- ignored `.runs/v2-a/corrected-evidence/**`。

不得修改 Audit Report、Audit/Main/Correction Prompts、Main Review、Contract、Charter、
`CURRENT_STATE.md`、`AGENTS.md`、治理文件、V0/V1、Pi、reference 或旧 evidence。不得 stage/commit。

## 5. Verification

至少运行并记录：

- `npm run typecheck`；
- `npm run v2a:test`，0 fail/0 skipped；
- 五项 coherent-rehash regressions；
- `node --test tests/workspace.test.ts tests/v0b-verifier.test.ts`；
- `npm run v1a:test` 与 `npm run v1a:deterministic`；
- `npm run v1b:test`；
- `node --test tests/v1c-budget-stop.test.ts`；
- corrected Evidence 全量 Inspector 与 read-only fingerprint；
- protected/control/Pi/reference unchanged、zero real access、`git diff --check`。

不要运行 broad Pi build/test、安装或网络命令。

## 6. Deliverables and stop

交付：

1. 五项 finding → source/test/evidence 的逐项映射；
2. `V2_A_POST_AUDIT_BOUNDED_CORRECTION_REPORT.md`；
3. 更新 Implementation Report/Closeout Draft correction appendix；
4. corrected Evidence Index、Source Delta、commands/exit codes、test counts；
5. 新 authoritative corrected Run IDs 与 source digest cross-check；
6. `CURRENT_STATE_UPDATE_PROPOSAL`（但不得修改状态）；
7. remaining unknowns 与 Claims Boundary。

完成后停止，建议 disposition 只能是：

- `PASS_V2_A_BOUNDED_CORRECTION_PENDING_REAUDIT`；
- `REVISE_V2_A_BOUNDED`；
- `PAUSE_V2_A_ARCHITECTURE_DECISION`。

不得自行通过 Gate J、接受 V2-A、创建 corrected Candidate commit、启动 re-audit 或进入 V2-B。
