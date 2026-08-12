# V3.6 Engineering Stabilization — ES-N03 Authorization

```yaml
status: authorized_pending_dispatch
campaign_id: V3_6_ENGINEERING_STABILIZATION_CAMPAIGN
case_id: ES_N03
case_kind: natural_behavior_preserving_refactor
test_session_id: 019ff181-51a8-7381-aae9-b8223e6a8bd3
authorization_record_commit: supplied_by_main_at_dispatch
authoritative_checkout: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
functional_baseline_commit: 7d63e76c3df357294d480c45e4bad785e8f2fa8a
source_baseline: unchanged_registered_source_not_prior_case_workspace
task_text_sha256: 4852cfd2f9623c4e9a37d0880e4764c5d1c9bd117f10dcb7e36bb04da3812484
real_model: DeepSeek_V4_Flash_fixed
credential_access: one_opaque_resolution_for_the_single_case
external_network: authorized_only_for_the_single_case
source_apply: forbidden
retry_fallback_replacement_continuation: forbidden
next_case: not_authorized
fault_injection: not_authorized
```

## 1. Gate A

Read the active Campaign plan, baseline, status, ES-N02 Main Review and this authorization
from the exact Main-supplied Authorization Record Commit. Verify tracked status clean,
`workbench/` equal to functional baseline `7d63e76…`, fixed Pi `027a5847…` clean, current
registered Source still 14 files with linear inventory digest `fe94e4e…`, Host Profile
SHA-256 `8b25a221…`, Docker Linux/frozen image/registered command ready, and a fresh unused
data root/port. Check Credential file metadata only; never print, copy or hash its content.

Do not use, continue, Apply or Discard any prior Case Workspace. ES-N03 must create a
clean Product Session from unchanged registered Source.

## 2. Frozen Natural Task

Use ignored data root:

`.runs/v3-6/engineering-stabilization/es-n03-validation-refactor-20260812/`

Dispatch this exact task once:

> 重构项目中重复的“非负安全整数”校验：提取一个内部共享 helper，并让 Character 的 maxHp、attack、defense、hp，Inventory 的 quantity，SkillCooldowns 的 cooldown，以及 Quest 的 rewardGold 继续保持现有输入约束和现有错误消息。不得改变任何公开 API 或合法输入行为；补充必要回归测试，并运行已登记测试。

Freeze the same daily profile, Source, Host Profile, provider/model and registered command.
Perform one dispatch without guidance or intervention. No second Turn, task adjustment,
Retry, Fallback, Replacement, continuation, Apply, Discard, product edit, Pi edit, budget
change, Fault Injection or ES-N04 is authorized.

## 3. Evidence and handoff

On settled completion or any terminal/failure, freeze raw Evidence and stop execution.
Independently compare Agent claims with Session/Run/Trace, exact Tool lifecycle, registered
Docker raw terminal and Exit Code, managed Diff/ChangeSet, registered Source inventory,
safe projection, budget accounting and retry/authority state. Confirm that a claimed
behavior-preserving refactor retains public APIs, valid-input behavior and existing error
messages on the exercised surface. If Failure, do no recovery; classify preliminarily
using F1–F11 and answer all budget questions if relevant.

Write the secret-free handoff to:

`C:/Users/HUAWEI/Downloads/V3_6_ENGINEERING_STABILIZATION_ES_N03_HANDOFF.md`

Include exact commands/exits, evidence paths/digests, access/cost totals, Source/Workspace
state, completion or Finding record, non-claims and `MAIN_DISPOSITION_REQUIRED`. Stop the
product safely, prove Case Docker leftovers zero, and wait for Main. No next Case or Retest
is authorized.

All Decision Required conditions in the Campaign plan immediately stop execution and
return to Main/User. `STOP / FAIL CLOSED` remains a valid result.
