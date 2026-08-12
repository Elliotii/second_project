# V3.6 Engineering Stabilization — ES-N02 Authorization

```yaml
status: authorized_pending_dispatch
campaign_id: V3_6_ENGINEERING_STABILIZATION_CAMPAIGN
case_id: ES_N02
case_kind: natural_regression_fix
test_session_id: 019ff181-51a8-7381-aae9-b8223e6a8bd3
authorization_record_commit: supplied_by_main_at_dispatch
authoritative_checkout: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
functional_baseline_commit: 7d63e76c3df357294d480c45e4bad785e8f2fa8a
source_baseline: unchanged_registered_source_not_ES_N01_workspace
task_text_sha256: f21515983e65388b0f8b4b57c0aca25800d6f278adb15eae98c5e900c8f1489a
real_model: DeepSeek_V4_Flash_fixed
credential_access: one_opaque_resolution_for_the_single_case
external_network: authorized_only_for_the_single_case
source_apply: forbidden
retry_fallback_replacement_continuation: forbidden
next_case: not_authorized
fault_injection: not_authorized
```

## 1. Gate A

Read the active Campaign plan, baseline, status, ES-N01 Main Review and this authorization
from the exact Main-supplied Authorization Record Commit. Verify tracked status clean,
`workbench/` equal to functional baseline `7d63e76…`, fixed Pi `027a5847…` clean, current
registered Source still 14 files with linear inventory digest `fe94e4e…`, Host Profile
SHA-256 `8b25a221…`, Docker Linux/frozen image/registered command ready, and a fresh unused
data root/port. Check Credential file metadata only; never print, copy or hash its content.

Do not use, continue, Apply or Discard ES-N01's managed Workspace. ES-N02 must create a
clean Product Session from unchanged registered Source.

## 2. Frozen Natural Task

Use ignored data root:

`.runs/v3-6/engineering-stabilization/es-n02-skill-cooldown-20260812/`

Dispatch this exact task once:

> 修复技能冷却的重置规则：当某个技能仍在冷却中时，再次调用 `start` 不能缩短剩余冷却，只能保留当前值或延长；以 0 回合启动一个尚未记录的技能时，不应在 `snapshot()` 中留下无意义的零值条目。保持现有 `ready`、`remainingTurns` 和 `tick` 行为，并补充相关测试后运行已登记测试。

Freeze the same daily profile, Source, Host Profile, provider/model and registered command.
Perform one dispatch without guidance or intervention. No second Turn, task adjustment,
Retry, Fallback, Replacement, continuation, Apply, Discard, product edit, Pi edit, budget
change, Fault Injection or ES-N03 is authorized.

## 3. Evidence and handoff

On settled completion or any terminal/failure, freeze raw Evidence and stop execution.
Independently compare Agent claims with Session/Run/Trace, exact Tool lifecycle, registered
Docker raw terminal and Exit Code, managed Diff/ChangeSet, registered Source inventory,
safe projection, budget accounting and retry/authority state. If Failure, do no recovery;
classify preliminarily using F1–F11 and answer all budget questions if relevant.

Write the secret-free handoff to:

`C:/Users/HUAWEI/Downloads/V3_6_ENGINEERING_STABILIZATION_ES_N02_HANDOFF.md`

Include exact commands/exits, evidence paths/digests, access/cost totals, Source/Workspace
state, completion or Finding record, non-claims and `MAIN_DISPOSITION_REQUIRED`. Stop the
product safely, prove Case Docker leftovers zero, and wait for Main. No next Case or Retest
is authorized.

All Decision Required conditions in the Campaign plan immediately stop execution and
return to Main/User. `STOP / FAIL CLOSED` remains a valid result.
