# V3.6 Engineering Stabilization — ES-N03 Post-maintenance Retest Authorization

```yaml
status: authorized_pending_dispatch
campaign_id: V3_6_ENGINEERING_STABILIZATION_CAMPAIGN
case_id: ES_N03_RETEST
relationship: one_post_maintenance_retest_of_ES_N03_not_retry_or_replacement
test_session_id: 019ff181-51a8-7381-aae9-b8223e6a8bd3
maintenance_closeout_commit: 4a0f7176d9b935055752cd292d4d174b9bc84684
maintenance_workbench_tree: 53b86da3007cbf367c75a80a74fa0fb5271f0333
authoritative_checkout: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
source_baseline: unchanged_registered_source_not_ES_N03_workspace
original_task_sha256: 4852cfd2f9623c4e9a37d0880e4764c5d1c9bd117f10dcb7e36bb04da3812484
real_model: DeepSeek_V4_Flash_fixed
credential_access: one_opaque_resolution_for_this_retest
external_network: authorized_only_for_this_retest
source_apply: forbidden
retry_fallback_replacement_continuation: forbidden
next_case: not_authorized
fault_injection: not_authorized
```

## 1. Gate A

Use only the authoritative Main checkout. Read `CURRENT_STATE.md`, the Campaign Plan,
Baseline and Status, original `V3_6_ENGINEERING_STABILIZATION_ES_N03_AUTHORIZATION.md`,
the ES-N03 Decision Required report, the formal maintenance Contract and Closeout, and
this authorization from the exact Main-supplied launch-record HEAD.

Verify tracked clean; the exact maintenance Workbench tree `53b86da3007cbf367c75a80a74fa0fb5271f0333`;
fixed Pi `027a5847901b5dde30270abaa1041046cd2b4b55` clean; the unchanged registered
Source remains 14 files with linear SHA-256
`fe94e4e28ea907df3feb1609a4a4a309b82dd099c8fa8cde40ddfe6a44705f8a`;
the same registered Host Profile, Docker backend/image, command and daily budget profile;
and a fresh unused data root/port. Check Credential metadata only before the opaque
resolution; never print, copy or hash its content.

Do not use, continue, Apply or Discard the Before-Fix ES-N03 Workspace or any earlier Case
Workspace. Create a clean Product Session from registered Source.

## 2. Frozen Retest

Use a new ignored data root under:

`.runs/v3-6/engineering-stabilization/es-n03-post-maintenance-retest-20260812/`

Dispatch exactly the task already frozen verbatim in
`V3_6_ENGINEERING_STABILIZATION_ES_N03_AUTHORIZATION.md`; first verify its UTF-8 text SHA-256
is `4852cfd2f9623c4e9a37d0880e4764c5d1c9bd117f10dcb7e36bb04da3812484`.

Use the same registered Source, provider/model, Host Profile, daily profile and registered
command. Perform one dispatch only. No second Turn, guidance, task adjustment, Retry,
Fallback, Replacement, continuation, Apply, Discard, product/Pi edit, budget change, Fault
Injection or ES-N04 is authorized.

## 3. Evidence and handoff

On settled completion or any typed terminal/failure, freeze this new evidence and stop.
Review Session/Run/Trace, exact Tool accounting, registered Docker terminal/Exit Code,
managed Diff/ChangeSet, Source inventory, safe projection, budget and authority state.
Explicitly determine whether the prior generic `request_rejected` gap is now replaced by
truthful schema-4 terminalization if the same Tool lifecycle recurs. A different natural
outcome is also valid evidence; do not hunt for the prior failure.

Write the secret-free handoff to:

`C:/Users/HUAWEI/Downloads/V3_6_ENGINEERING_STABILIZATION_ES_N03_RETEST_HANDOFF.md`

Include exact commands/Exit Codes, evidence identities/digests, access/cost totals,
Source/Workspace state, preliminary F1–F11 classification, comparison to Before-Fix
ES-N03, non-claims and `MAIN_DISPOSITION_REQUIRED`. Stop the product safely, prove port
and Case-container leftovers zero, and wait for Main. No next Case is authorized.

Any Campaign Decision Required condition stops immediately. A terminal or Failure is not
permission to recover; `STOP / FAIL CLOSED` remains a valid Harness response.
