# V2-A Closeout

```yaml
status: closed_accepted
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
disposition: PASS_V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
accepted_by_user: true
accepted_at: 2026-08-06
gates_A_through_J: passed
definition_of_done: 24_of_24
control_baseline_commit: 228973b7e7b826468c54b84f28faf8d9c0c33a6d
final_candidate_commit: de6d30c896079c6ae1164646ae55ead8e6a33c09
implementation_baseline_commit: resulting_HEAD_of_this_revision
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
active_goal_after_closeout: null
v2_b_authorized: false
```

## 1. Accepted outcome

用户正式接受 `PASS_V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE`。V2-A 已完成并关闭，
`active_goal` 收口为 `null`。

V2-A 证明了一个确定性、零真实调用的双路径恢复 substrate：只有在 primary external Verifier
有效失败后，系统才冻结 Recovery Seed，并从同一失败 Workspace、Failure Packet、Skill、Policy、
Model、Tool、Verifier 与 Budget 合同运行恰好两条隔离 Candidate 路径：

- A：保留失败 parent Session history；
- B：fresh Session，不保留 parent history。

两条路径都必须真正运行和验证。Selector 只接受通过全部 hard gates 的 Candidate；没有合格
Candidate 时明确保留 `none`，不得提前收口、fallback 或隐藏 budget-stopped/invalid evidence。

## 2. Accepted evidence

最终 source/evidence identity：

```yaml
workbench_source_digest: 10f85d0cd4195cb94ce269029a37bf2ed4ea70b5e0e42eb740e060726e1d08ce
authoritative_evidence_root: .runs/v2-a/line-byte-corrected-evidence
evidence_tree_digest: 194eff335f018e2138285a96d91d41fd4f5b84a945f3487378e952ab85abeb76
summary_sha256: c80d1cfdd4a6cbf5df116c8152dd7eac4ad417957b1a1a74cf8ed2ec9a3b75b2
authoritative_runs: 6
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_cost_usd: 0
pi_core_patches: 0
private_pi_imports: 0
```

六个权威场景覆盖 initial pass、A/B 各自获胜、两者都通过、两者都失败以及一条 budget stop
保留并由另一条获选。全部 Run 均 Inspector-valid、live-source-bound、fingerprint read-only。

最终验证：

- strict TypeScript passed；
- V2-A 11/11，0 skipped；
- post-audit 5/5 families，共20个 coherent tamper variants；
- 原 trailing-ASCII-space reproduction 现 fail closed；
- 固定 Pi SHA/工作树 clean；
- 所有旧 evidence/audit roots 保留且未覆盖。

## 3. Independent audit chain

| Candidate | Result | Resolution |
|---|---|---|
| `ece8856891f950a090f9adabf75ca8c8e707ce53` | 5 blocking P1 | 原 Implementation owner 有界修复 |
| `d6d7a82081658d1782897319dd1e615578ad77c7` | 关闭4项，发现1项 P1-002 line-byte bypass | 原 owner 只修 exact-byte lineage |
| `de6d30c896079c6ae1164646ae55ead8e6a33c09` | `PASS_V2_A_P1_002_HIT_SPECIFIC_REAUDIT`，新增 finding 0 | Gate J passed |

P1-001 raw Verifier authority、P1-003 initial Workspace evidence、P1-004 raw budget recomputation、
P1-005 Manifest/Pi/live-source anchor 由 fresh corrected-Candidate re-audit 关闭；P1-002 semantic/path
与 exact record/prefix byte lineage 由后续 fresh hit-specific re-audit 全部关闭。

## 4. Claims allowed

可以声称：

- Direct public emitted `AgentHarness` + public `JsonlSessionRepo` 能支撑该确定性双路径机制；
- immutable failed Seed、Workspace isolation、Session history delta、external Verifier、hard-gate Selector、
  budget retention 和 fail-closed Inspector 已在固定 Pi 路径上通过测试和独立审计；
- 机制无需 Pi Core patch、private import、Credential、网络或真实模型。

## 5. Claims not allowed

V2-A 不证明：

- 真实模型 Recovery 有效；
- A 或 B 策略更优；
- 统计显著改善；
- production durability、in-flight crash recovery、exactly-once Tool execution；
- SDK/Extension/RPC、第三方 Pi Package 或 Git worktree provider；
- V2-B、V3 Experience/Curator/Router 或自进化效果。

## 6. Remaining route

V2-B 是 Charter-defined 下一候选 Goal，用于冻结的 bounded real recovery acceptance。V2-A 的接受
不授权 V2-B Contract、Activation、Credential、网络或真实调用，也不要求切换 Direct AgentHarness
主路线。任何 V2-B 工作仍需 Main 单独规划并获得用户授权。
