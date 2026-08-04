# V1-B Stage 1 Closeout Draft

> Updated: 2026-08-05 (Asia/Hong_Kong)
> Main Review input: `REVISE_V1_B_STAGE1`
> Suggested corrected disposition: `PASS_V1_B_STAGE1_AFTER_BOUNDED_CORRECTION`
> Acceptance owner: Main Session and user

## Outcome

The original dedicated Stage 1 Preparation Session completed the authorized
bounded correction for F-001 through F-005. Corrected Control Baseline
`de75ca7a4d5376713f01ca475bc5ad7637c70443` / tree
`e930e1d0885b52bf911ed78912786723f321f06e` remains unchanged. Pi remains exact
and clean at `027a5847901b5dde30270abaa1041046cd2b4b55`.

The corrected Manifest is
`ec8a7a6f8dcc375dd18781e8f54b2ab00f5d2d7fba3938dee1011933de5f3b3b`,
binding Workbench source digest
`ce768cfd8af488861b251d94b6b5e14dec164e453c65bdba444fdc5aa0ade127`.

Credential reads, network calls, external Provider calls and real-model calls
are `0 / 0 / 0 / 0`.

## Bounded correction closeout

| Finding | Corrected behavior | Formal result |
| --- | --- | --- |
| F-001 | Inspector independently derives all frozen semantic bindings and requires exactly one Verifier result/output pair per actual Attempt | coherent task/Skill/Verifier/Workbench rehash and missing/duplicate refs rejected |
| F-002 | producer scans final actual/pending evidence and Inspector rescans actual persisted bytes | Authorization/Bearer/reasoning/thinking/signature/fake error markers rejected |
| F-003 | A/B delta must equal the exact public Pi wrapper over frozen Skill bytes; B/C remains byte-equal | arbitrary/missing/extra/wrong treatment and model/options/Tool drift rejected |
| F-004 | typed terminal/invalid/paused taxonomy, attribution and denominator counts are executable | infrastructure/evidence/treatment/global/unknown paths, 25% threshold and repeated cause passed |
| F-005 | reservations are atomic and store before/reserved/actual/after/cap at Attempt/Run/Pilot levels | no-partial mutation, child capacity and tampered chain/actual cases passed |

## Stage 1 DoD

| Definition of Done | Result |
| --- | --- |
| corrected baseline and exact clean Pi | PASS |
| source delta restricted to Contract §6.2 | PASS |
| public Pi composition and separate one-Run authority | PASS |
| complete B/C equality and exact frozen A/B Skill treatment | PASS |
| same Session/Workspace Attempt lineage and one eligible C child maximum | PASS |
| atomic three-level budget reserve and independent recomputation | PASS |
| immutable 24-cell Manifest and one-cell ledger | PASS |
| typed terminal/invalid/paused taxonomy and denominator loop | PASS |
| final evidence secret/reasoning scan and independent Inspector scan | PASS |
| authoritative zero-call 24-cell simulation | PASS |
| strict TypeScript and V1-B focused tests | PASS; 15/15 |
| V1-A regression | PASS; 18/18 |
| V0-C deterministic and post-audit regression | PASS; 8/8 post-audit |
| fresh Windows source identity, TypeScript and V1-B tests | PASS; 14/14 source/test/Manifest identity, 15/15 tests |
| reports, evidence index and `CURRENT_STATE_UPDATE_PROPOSAL` | PASS |
| credential/network/external Provider/real-model calls | PASS; `0 / 0 / 0 / 0` |

## Authoritative evidence

```yaml
root: .runs/v1-b/stage1/gate-h-pilot-authoritative-after-main-review-correction
file_count: 353
byte_count: 725526
ledger_sha256: bf8c9b5484da41184496256cb0f764be80ec5d09bc13a303b30602a9bb70a81c
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
observational_faux_tokens: 74587
active_execution_time_ms: 1921
cost_usd: 0
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

The prior authoritative root and Main Review diagnostic evidence remain
preserved. The evidence index records the prior root as
`superseded_due_main_review_bounded_correction`; it is not a retry or
replacement cell.

Fresh Windows produced zero byte mismatch across the 14 Contract source/test/
Manifest overlay paths. Three Markdown report/control paths converted to CRLF;
they are outside the Workbench source digest domain and the fresh strict
TypeScript plus 15/15 focused tests passed.

## Remaining unauthorized and unverified

- Stage 1 acceptance by Main Session/user;
- Candidate Commit and focused Audit;
- Execution Baseline and Stage 2 Manifest;
- credentials, network and real DeepSeek dispatch;
- real Pilot results, Skill/recovery effect or strategy ranking.

No source staging or commit was performed. No control state, Pi, accepted
fixture or V0 source was modified.

## Main review entry point

Review the F-001–F-005 traceability and exact commands in
`docs/reports/V1_B_STAGE1_IMPLEMENTATION_REPORT.md`, then verify the corrected
Manifest and `.runs/v1-b/stage1/evidence-index.json`. If the bounded correction
is accepted, the next control point remains Main Session disposition and any
separately authorized Candidate Commit.

```yaml
stage1_preparation: completed_after_main_review_bounded_correction_pending_main_lightweight_review
suggested_disposition: PASS_V1_B_STAGE1_AFTER_BOUNDED_CORRECTION
candidate_commit: false
focused_audit: false
execution_baseline: false
stage2_authorized: false
v1_b_closed: false
```
