# V2-A Main Light Review and Candidate Decision

```yaml
status: main_review_completed
date: 2026-08-06
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
control_baseline_commit: 228973b7e7b826468c54b84f28faf8d9c0c33a6d
implementation_owner: dedicated_v2_a_implementation_session
main_disposition: ACCEPT_FOR_FOCUSED_AUDIT
gates_A_through_I: accepted_for_candidate_freeze
gate_J: pending_fresh_focused_independent_audit
candidate_audit_baseline: resulting_HEAD_of_this_revision
final_goal_acceptance: false
V2_B_authorized: false
real_model_calls_observed: 0
credential_reads_observed: 0
network_calls_observed: 0
pi_core_patch_count: 0
```

## 1. Main conclusion

Main Session 对 dedicated Implementation Session 的报告、实际 source delta、关键控制流、
tests 和 authoritative Evidence 做了有界复核。结论是：

> `ACCEPT_FOR_FOCUSED_AUDIT`

这表示当前实现足以冻结 Candidate 并进入 Contract Gate J，不表示 V2-A 已最终接受，也不授权
V2-B 或任何真实访问。

## 2. Scope and architecture check

**Fact.** 实际 tracked source delta 只包括 Contract allowlist 内的 V2 contracts、run、selector、
Inspector、Product Surface、tests/scripts 以及 CLI/package/README 最小接线。没有修改 V0/V1
accepted fixtures、Skill、Verifier、Manifest、控制状态以外的历史事实、Pi 或 reference。

**Fact.** 实现保持 Direct public emitted `AgentHarness` 路线，使用 public
`JsonlSessionRepo` 与 public `./node` `NodeExecutionEnv`。没有 private Pi import、Pi patch、
SDK、Extension、RPC、第三方 Package 或 Git worktree provider。

**Fact.** `executeRunV2A()` 在 primary settled + valid Verifier failure 后冻结 Failure Packet、
failed Workspace、parent Session 和 Recovery Seed；Seed write-once/digest check 完成后才依次创建
Candidate A/B。A 使用 `repo.fork()` 并保留 parent entries，B 使用 `repo.create()` 且 pre-run
entries 为 0。

**Fact.** A 通过不会 short-circuit B；两条 Candidate terminal 后才写 Recovery Group 和
Selection。Selector 只排序全部 Hard Gates 均通过的 Candidate；无 passing Candidate 时返回
`selected_candidate_id: null`，budget-stopped Candidate 保留且 ineligible。

**Fact.** initial pass 路径在 primary Verifier 通过后直接 terminalize，并显式不创建 Seed、
Failure Packet、Candidate 或 Selection。

## 3. Main verification

Main 独立运行：

| Command | Exit | Result |
|---|---:|---|
| `npm run typecheck` | 0 | strict TypeScript PASS |
| `npm run v2a:test` | 0 | 6/6 pass，0 fail，0 skipped |
| `node src/cli.ts v2a inspect --run-root .runs/v2-a/evidence/runs/v2a-authoritative-initial-pass` | 0 | integrity/terminal valid，no recovery objects |
| `node src/cli.ts v2a inspect --run-root .runs/v2-a/evidence/runs/v2a-authoritative-a-pass-b-fail` | 0 | two Candidates，A selected，A history > 0，B history = 0 |
| `node src/cli.ts v2a inspect --run-root .runs/v2-a/evidence/runs/v2a-authoritative-a-fail-b-fail` | 0 | two Candidates，both failed，selected none |

Main 第一次 Inspector invocation 使用了错误的 `../.runs/...` 相对路径，三个只读命令按预期
返回 missing-root/exit 1；它没有创建或修改 product/evidence 状态。Main 立即使用 project-root
relative `.runs/...` 路径重跑，三个检查均 exit 0。该错误属于 Main command composition，不是
Workbench defect，也没有触发额外 implementation correction。

Implementation Session 报告的 focused regression 计数也与保存输出一致：V2 6/6、
Workspace+V0-B 11/11、V1-A 18/18 + deterministic PASS、V1-B 31/31、V1-C 13/13，全部
0 fail/0 skipped。

## 4. Evidence and claims check

- 七个 authoritative deterministic Runs 均由 read-only Inspector 重检为 valid；
- base Evidence Index 后的 final-source validation 以 supplement 追加，没有覆盖原 Run；
- credential/network/external Provider/real model counters 均为 0；
- Pi 保持固定 commit 且 clean；
- Implementation Session 未 stage、commit 或修改控制状态；
- Implementation Report 没有把 Gate J、V2-A final acceptance、V2-B 或真实恢复效果写成已完成。

## 5. Focused audit scope

fresh Audit Session 只需独立检查以下高风险边界：

1. Seed 是否真实先于任何 Candidate，parent Session/Workspace 是否在 Seed 后保持不可变；
2. A 的 fork lineage 与 B 的 fresh/zero-history 是否由 public JSONL evidence 证明；
3. A/B initial Workspace 是否 byte-identical 且不存在 hardlink/reparse/symlink/cross-write；
4. valid failure 时两条路径是否都运行，Selection 是否只发生在两条 terminal 后；
5. Selector Hard Gates、pass/fail、fail/pass、pass/pass、fail/fail、budget/invalid retention 与
   `none` 是否可独立重现；
6. Inspector 是否 fail closed、read-only，并能发现 digest、identity、membership 和 selection
   tamper；
7. budget/terminal、protected/secret、zero-real-access 和 source/evidence identity 是否闭合；
8. 必要 V2 suite 和最窄 V0/V1 regressions 是否保持通过。

不做 general platform/security audit，不研究 V3，不修 source，不改 control state，不创建 commit。

## 6. Control decision

用户此前已经条件预授权：Main 接受 Gates A–I 且无架构偏离后，可创建 Candidate Audit
Baseline 并启动一次 fresh focused independent audit。上述条件已满足，因此：

```yaml
candidate_commit_authority: activated_and_consumed_by_resulting_HEAD
focused_audit_authority: activated_after_exact_candidate_SHA_confirmation
bounded_correction_authority: original_implementation_session_only_if_contract_bounded_finding
final_acceptance_authority: not_granted
V2_B_authority: not_granted
```

Gate J 完成后，Main 必须有限审阅 Audit Report。若无 blocking finding，停下来向用户提交
V2-A 最终接受建议；若为合同内 defect，返回原 Implementation Session 有界修复并只复审命中项；
若需改变架构、allowlist、Pi route 或权限，立即 Pause 并交回用户。
