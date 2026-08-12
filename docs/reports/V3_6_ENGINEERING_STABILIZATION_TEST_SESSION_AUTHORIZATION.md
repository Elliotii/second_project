# V3.6 Engineering Stabilization — Existing Test Session Authorization

```yaml
status: authorized_pending_dispatch
campaign_id: V3_6_ENGINEERING_STABILIZATION_CAMPAIGN
case_id: ES_N01
case_kind: natural_feature_addition
task_text_sha256: 0f5b7b47866f5a666bda0a2de418a033a22bbc5e5804871a7e8370f8eb17b52a
test_session_id: 019ff181-51a8-7381-aae9-b8223e6a8bd3
campaign_control_baseline_commit: e6451c273c1186728a6b6a8f98b02bf1f88b1cc4
functional_baseline_commit: 7d63e76c3df357294d480c45e4bad785e8f2fa8a
authorization_record_commit: supplied_by_main_at_dispatch
authoritative_checkout: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
real_model: DeepSeek_V4_Flash_fixed
credential_access: one_opaque_resolution_for_the_single_case
external_network: authorized_only_for_the_single_case
product_source_edits: forbidden
source_apply: forbidden
retry_fallback_replacement_continuation: forbidden
next_case: not_authorized
fault_injection: not_authorized
```

## 1. Role and required reading

You are the existing top-level Test Session, now acting as **Engineering Test Runner +
Evidence Reviewer** for exactly one Natural Workload Case. You do not own Campaign scope,
Finding disposition, maintenance, Retest, architecture or Closeout.

Before any startup or Credential resolution, read completely from the authoritative
checkout supplied above:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V3_6_ENGINEERING_STABILIZATION_CAMPAIGN_PLAN.md`;
4. `docs/reports/V3_6_ENGINEERING_STABILIZATION_CAMPAIGN_BASELINE.md`;
5. `docs/reports/V3_6_ENGINEERING_STABILIZATION_STATUS.md`;
6. `docs/reports/POST_V3_6_FINITE_BUDGET_TERMINALIZATION_CLOSEOUT.md`;
7. this authorization;
8. the relevant daily-product README/start script, Host profile and Mini RPG Source/tests.

Attempt 1 and Attempt 2 are immutable historical context. Do not count either as ES-N01,
rerun the poison task, or infer that ES-N01 should fail on a budget.

## 2. Gate A — read-only preflight

Main's dispatch message supplies the exact Authorization Record Commit. Before execution,
prove all of the following and stop if any fails:

- authoritative checkout HEAD equals that exact commit and tracked status is clean;
- `e6451c273c1186728a6b6a8f98b02bf1f88b1cc4` is its ancestor;
- `workbench/` is byte-identical to functional baseline
  `7d63e76c3df357294d480c45e4bad785e8f2fa8a`;
- fixed Pi is exact `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
- registered Source is `D:/AI/AI_Projects/mini-rpg-rules`, contains 14 files and its
  sorted inventory digest is
  `fe94e4e28ea907df3feb1609a4a4a309b82dd099c8fa8cde40ddfe6a44705f8a`;
- ignored Host profile SHA-256 is
  `8b25a221c5d9cdbcda81d9d739cc9601d20b45e370ffffc72b068e39ec272c6a`;
- Docker Linux Engine and exact registered `test` command are available;
- Credential file exists as an ordinary local file, but its contents are not printed,
  copied, hashed or otherwise inspected; and
- no stale Campaign product process owns the chosen port or data root.

A mechanical setup failure may be recorded and repaired only if independent of product
behavior. Establish a new clean setup identity before formal dispatch. A product or
authority failure is not a setup failure.

## 3. Frozen ES-N01 task and execution

Use a new ignored data root beneath:

`.runs/v3-6/engineering-stabilization/es-n01-healing-potion-20260812/`

Start the existing V3.6 daily product from the authoritative checkout with the ignored
Host profile, existing opaque Credential resolver, fixed Docker executable and a local
loopback port. Do not edit any product/config/source file to make startup succeed.

Create one clean Product Session from the current authenticated registered Source and
dispatch this exact task once:

> 给物品系统增加 `useHealingPotion`：成功时消耗 1 个 `healing-potion`、为存活且未满血的角色恢复最多 10 HP，并记录一条 `item` 日志；没有药水、角色已满血或已被击败时返回失败，且不得消耗物品或写入日志。补充相关测试，并运行已登记测试。

Freeze project ID, Source inventory, Host profile, daily budget, registered command,
provider/model and task text before dispatch. Do not guide the Agent, intervene during
execution, submit a second Turn, change the task, simplify it, retry, replace or continue.
Do not Apply, Discard or overwrite the managed Workspace before Main review.

The fixed daily per-Turn bounds remain observation/request `16/24`, Tool `24`, combined
Token `131072`, cost USD `0.20`, wall time `900000 ms`, with no retry/fallback/replacement.
These limits are not targets and must not be tuned.

## 4. Evidence Review and handoff

After the single dispatch reaches settled or a terminal/failure boundary, stop execution,
freeze the raw `.runs/` Evidence and perform read-only review. External evidence outranks
Agent self-report. Inspect at minimum:

- Session ID, Run ID, terminal/settled status and authoritative artifacts;
- Provider requests, Tool lifecycle, combined Token, cost and wall-time accounting;
- every registered Docker command, raw terminal, Exit Code and cleanup status;
- Agent completion claim versus command/test/file/diff evidence;
- managed Workspace Changes/Diff versus registered Source inventory;
- Source mutation/Apply authority, silent Retry/Fallback/Replacement count;
- safe API/WebUI projection and inspectability; and
- any evidence mismatch, tamper/fail-closed state or notable trajectory inefficiency.

If normally completed, record the plan §9 fields and evidence coherence. If any Failure or
unexpected state occurs, freeze it without recovery, use the F1–F11 taxonomy as a
preliminary classification, and hand it to Main. A budget-related observation must answer
all ten plan §14 questions before any recommendation; it must never recommend automatic
cap adjustment.

Write one handoff, without secrets, to:

`C:/Users/HUAWEI/Downloads/V3_6_ENGINEERING_STABILIZATION_ES_N01_HANDOFF.md`

It must include exact commands/exit codes, Evidence paths/digests, task, Session/Run
identity, completion or Finding record, Source/Workspace state, access/cost totals,
non-claims and an explicit `MAIN_DISPOSITION_REQUIRED`. Do not edit or commit repository
files. After the handoff, terminate the Campaign product process if safe, confirm Docker
container leftovers for this Case are zero, and stop. Wait for Main; no ES-N02 or Retest
is authorized.

## 5. Immediate stop conditions

Stop and report without dispatch or continuation if execution would require product/Pi/
profile/Source edits, another backend, another model, broader credentials, a budget or
completion-policy change, Retry/Fallback/Replacement, uncertain side-effect recovery,
Source Apply, architecture change, or any Campaign-plan Decision Required condition.

`STOP / FAIL CLOSED` is a valid result. Do not manufacture success or a portfolio story.
