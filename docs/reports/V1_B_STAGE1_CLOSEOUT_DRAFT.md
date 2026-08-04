# V1-B Stage 1 Closeout Draft

> Updated: 2026-08-05 (Asia/Hong_Kong)
> Input disposition: `ACCEPT_AUDIT_FINDINGS_AND_REVISE_CANDIDATE`
> Suggested correction disposition: `CORRECTION_COMPLETE_PENDING_MAIN_CANDIDATE_REVIEW_AND_REAUDIT`
> Acceptance owner: Main Session and user

## Outcome

The original dedicated V1-B Stage 1 Preparation Session completed the bounded
post-audit corrections for `V1B-AUD-F-001` and `V1B-AUD-F-002` from exact
rejected Candidate `951e9161300eacd408e232aa6d1fa66ac02d0e10` / tree
`a9ad6eee8ae4cfe32ee3e9e04613a8d16e5296f6`.

The first Candidate remains rejected. Pi remains exact and clean at
`027a5847901b5dde30270abaa1041046cd2b4b55`. No source was staged or committed,
no control state was edited, and Stage 2 was not entered.

Corrected Stage 1 identities:

```yaml
manifest_id: be258f6f62276436fef65a44459d70611749043b9dc2d25ec134a0e7abc1055d
workbench_source_digest: ef30c4be9bc4143569f30aabbb66b2a01db9b2098082f35dba2137f3acb22ffe
manifest_sha256: 5bae711bc4bb628b9c95486170e774ac4acbaa70f72010dac09e973303775b48
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## Finding closeout

| Finding | Corrected behavior | Formal result |
| --- | --- | --- |
| `V1B-AUD-F-001` | producer and Inspector independently recurse through every regular final-Workspace file, reject links/escapes/unsupported entries, scan actual bytes, and bind a typed tree ref | producer marker cannot terminalize; coherent marker+digest/tree-ref rebind is Inspector-invalid; clean 24/24 passes |
| `V1B-AUD-F-002` | tracked CLI requires `--stage2-real-authority` plus a valid real Manifest and constructs the existing public-Pi one-Run composition before `started` | missing/surplus/denied authority fails sanitized with zero dispatch; resolver is lazy; second Run open is rejected |

## Required verification

| Check | Result |
| --- | --- |
| Gate A exact rejected Candidate/tree and clean project index | PASS |
| exact clean Pi | PASS |
| strict TypeScript | PASS |
| exact tracked CLI missing-credential micro-regression | PASS; `env: {}`, sanitized failure, first cell `started→paused`, zero terminal/advance/credential-shaped evidence |
| V1-B focused Stage 1/CLI | PASS; 19/19 |
| sequential V1-A/V0-C evidence and real-route regressions | PASS; 42/42 |
| new authoritative 24-cell zero-call simulation | PASS; 24/24 terminal |
| independent authoritative Inspector replay | PASS; 24/24 valid |
| fresh Windows 20-file identity | PASS; 0 mismatch |
| prior post-audit fresh Windows TypeScript and V1-B focused tests | PASS; then-current 18/18; production source unchanged by test-only micro-correction |
| credential/network/external Provider/real model | PASS; `0 / 0 / 0 / 0` |

## Authoritative evidence

```yaml
root: .runs/v1-b/stage1/gate-h-pilot-authoritative-after-post-audit-correction
file_count: 353
byte_count: 735697
ledger_sha256: a79d7659f7e77be0886975dd1fe7014a88b329d08c93dcfec116595d37abfd61
planned: 24
started: 24
terminal: 24
invalid: 0
paused: 0
comparable: 24
passed_fixture_outcomes: 13
failed_fixture_outcomes: 11
recovery_eligible: 5
recovery_started: 5
recovery_succeeded: 3
faux_provider_requests: 55
tool_calls: 26
observational_faux_tokens: 74588
active_execution_time_ms: 2080
cost_usd: 0
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

The rejected Candidate evidence remains preserved and is superseded only
because source identity and terminal evidence semantics changed. This is not a
Stage 2 retry, fallback or replacement Run.

Main re-review added one test-only exact CLI regression. It explicitly gives
the child process an empty environment, reaches the tracked real composition,
and proves missing `DEEPSEEK_API_KEY` ends the unique first cell as
`started→paused` with sanitized error, no terminal evidence, no next-cell
advance and no fallback/retry/replacement. No production source changed, so the
24-cell authoritative root and broad regression evidence were not regenerated.

## Remaining control points

- Main Session review of source/tests/report/evidence;
- corrected Candidate decision and commit, if accepted;
- separately authorized fresh focused re-audit;
- Stage 1 acceptance, Execution Baseline and Stage 2 authority;
- credentials, network and real DeepSeek execution.

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  first_candidate: rejected_and_remains_rejected
  post_audit_bounded_correction: completed_after_main_rereview_test_only_micro_correction
  suggested_disposition: CORRECTION_COMPLETE_PENDING_MAIN_CANDIDATE_REVIEW_AND_REAUDIT
  main_rereview_production_fixes: accepted
  exact_cli_missing_credential_micro_regression: passed
  focused_tests: 19
  corrected_candidate_commit: false
  re_audit: false
  execution_baseline: false
  stage2_authorized: false
  v1_b_closed: false
```
