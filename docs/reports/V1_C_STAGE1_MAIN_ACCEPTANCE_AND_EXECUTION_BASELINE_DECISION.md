# V1-C Stage 1 Main Acceptance and Execution Baseline Decision

```yaml
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
decision_date: 2026-08-06
decision_owner: main_session
user_authorization: accepted_continue_after_status_review
control_baseline_commit: 016006e72e5baf4f558f1f63f1ffafcf122e119c
rejected_candidate_commit: e021662e2f4b6d2721f9b0378ac2efa64b706963
corrected_candidate_commit: 962b42a281d3092f0faf399b9f6f1ecaa0212f31
corrected_candidate_tree: d828f9fdb23c7099cdb1e4d5a993ff5579422dd4
focused_reaudit_disposition: PASS_FOCUSED_REAUDIT
stage_1_disposition: PASS_V1_C_STAGE1_AUDITED_CANDIDATE
audited_execution_baseline_authorized: true
audited_execution_baseline_commit: resulting_HEAD_of_this_revision
real_canary_authorized: false
credential_reads_authorized: 0
real_provider_calls_authorized: 0
real_model_calls_authorized: 0
full_pilot_authorized: false
v2_authorized: false
```

## Decision

- **Fact:** The first Candidate was rejected after three P1 findings. The original Implementation Session made only the accepted bounded corrections, then one Main micro-review finding was corrected in the same Session.
- **Fact:** The corrected Candidate is the immutable commit/tree above. Its complete Control-Baseline delta is exactly the ten Stage 1 allowlisted files.
- **Fact:** The fresh re-audit closed P1-001, P1-002, P1-003 and P1-001R. It reported no new P0/P1/P2/P3 finding, passed strict TypeScript, V1-C 13/13, V1-B 31/31 and three independent negative probes.
- **Fact:** The audit and re-audit used zero credentials, zero external network, zero Provider/model calls, no Pi change and no source/test repair by an audit Session.
- **Decision:** Main Session accepts the corrected Candidate and `PASS_FOCUSED_REAUDIT` for Contract Gate J. Stage 1 is accepted as `PASS_V1_C_STAGE1_AUDITED_CANDIDATE`.
- **Decision:** The user's instruction to continue after reviewing the status authorizes the Main-owned audited Execution Baseline and zero-call official Provider checkpoint. It does not silently authorize credential access, a real Canary or a full Pilot.

## Execution Baseline meaning

The immutable Canary Manifest records
`execution_baseline_commit: 962b42a281d3092f0faf399b9f6f1ecaa0212f31`.
That value is the independently audited source Candidate and avoids a commit self-reference.
The resulting commit of this revision is the project-control audited Execution Baseline: it adds the Manifest,
audit reports, acceptance decision, preflight evidence and control-state updates without changing audited
Workbench source or tests.

## Allowed claims

- The bounded pre-dispatch request-cap/synthetic-failure attribution defect is deterministically corrected on the public Direct `AgentHarness` path without a Pi Core patch.
- Focused independent review covers the accepted Attempt lineage, terminal Journal, authority-before-side-effect and budget/accounting boundaries.
- The new Canary identity can be reconstructed and preflighted with all real-access counters at zero.

The project still may not claim a successful real V1-C Provider route, a valid Canary, a completed A/B/C comparison, a Skill/Runtime winner, real Recovery effectiveness or V2 implementation.

## Next control point

The next independent decision is whether to authorize a fresh no-source-edit Canary Session for exactly one
Arm-A `parse-duration` Run, with opaque credential access, network/Provider/model calls and a USD 0.10
hard cap. No such authority is granted by this document.
