# V1-B Pause-path Re-audit Pause Report

```yaml
status: paused_pending_user_decision
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
candidate_commit: c360ebc4af9ef941252e6aff99638eca00b161e0
candidate_tree: 96f1f6ed016971e8801c9229ece4004bbc782f62
candidate_disposition: rejected_by_focused_reaudit
reaudit_disposition: PAUSE_SCOPE_OR_ARCHITECTURE
closed_findings:
  - P1-002
  - P1-003
open_finding:
  - P1-004_within_P1-001
credential_reads: 0
network_calls: 0
provider_calls: 0
real_model_calls: 0
replacement_manifest_created: false
replacement_execution_baseline_created: false
stage_2_replacement_started: false
v2_entered: false
```

## 1. What stopped the sequence

**Fact.** The focused re-audit accepted the durable-close and replacement-
sequence corrections, but found that the corrected Inspector rejects the
producer's own coherent real Stage-2 pause immediately after durable request
reservation and before dispatch.

At that boundary, the write-ahead reservation promises one possible request,
but Pi never reaches Provider dispatch because the awaited hook throws. The
producer therefore persists:

```yaml
reservation_transition:
  provider_request: 0_to_1
  possible_network_provider_model: 0_to_1
actual_pause_snapshot:
  credential_reads: 1
  network_calls: 0
  provider_calls: 0
  model_calls: 0
conservative_charge:
  tokens: 65536
  cost_usd: 0.10
```

The Candidate Inspector requires the external snapshot to be `1 / 1 / 1`, so
it rejects this legitimate `0 / 0 / 0` pre-dispatch pause. The original forged
case is now rejected, but the positive path is also rejected.

**Fact.** Strict TypeScript, 31/31 V1-B tests and 42/42 required regressions
pass. Those suites missed the positive Inspector assertion for this exact real-
mode boundary. The independent audit reproduced it with zero external access.

## 2. Why Main Session stopped

The accepted Pause Recovery Amendment permits no more than two bounded
correction cycles. Both have been consumed. A source change now requires a
third cycle, so the automatic exit condition is binding even though the defect
is small and remains inside P1-001.

No final replacement Manifest, Execution Baseline, credential read, network
call, Provider/model call or replacement Pilot was started after the finding.

## 3. Options

### Option A — one explicit micro-correction exception (recommended)

Authorize one third-and-final correction limited to P1-004.

Expected default scope:

```text
workbench/src/inspect-v1.ts
workbench/tests/v1b-stage1.test.ts
docs/reports/V1_B_STAGE2_PAUSE_PATH_CORRECTION_REPORT.md
docs/reports/V1_B_STAGE2_PAUSE_PATH_CORRECTION_CLOSEOUT_DRAFT.md
.runs/v1-b/stage1/**  # additive ignored evidence only
```

Required semantics:

- retain the exact write-ahead reservation transition;
- accept only two coherent Stage-2 external snapshots after reservation:
  all-zero when the awaited hook prevents dispatch, or all-one when dispatch
  may have occurred;
- reject every partial/mixed tuple and every transition/snapshot contradiction;
- retain the full conservative reservation charge in both cases;
- add an Inspector-valid unmodified real-mode pre-dispatch positive test before
  applying the coherent forged mutation;
- preserve P1-002, P1-003, 31+ focused tests and 42 regressions;
- zero credential/network/Provider/model access;
- no Manifest, control-state, Pi, dependency, Stage 2 or V2 change.

If implementation needs another source path or a fourth correction, stop.
After Main review, create a new corrected Candidate and ask the same audit
Session to re-audit only P1-004 plus the mandatory regressions. Only a PASS may
unlock final Manifest and Execution Baseline materialization.

### Option B — leave V1-B paused

Keep Candidate `c360ebc...` rejected and do not run the replacement Pilot. This
preserves safety but leaves V1 incomplete.

### Option C — waive the positive-path failure

Not recommended. It would allow a known Inspector/producer contradiction into
the real Pilot and weaken the evidence claims that justify the amendment.

## 4. Recommended user decision

```yaml
decision: authorize_one_P1_004_micro_correction_exception
correction_owner: original_v1_b_preparation_session
audit_owner: existing_pause_path_independent_audit_session
real_access_authorized: 0
source_scope_expansion: false
replacement_manifest_authorized_during_correction: false
stage_2_authorized_during_correction: false
v2_authorized: false
```

Until that decision is explicit, V1-B remains active and paused.
