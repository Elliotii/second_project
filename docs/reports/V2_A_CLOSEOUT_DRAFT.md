# V2-A Closeout Draft

## Draft disposition

```yaml
goal_id: V2_A_DETERMINISTIC_RECOVERY_SUBSTRATE
draft_only: true
implementation_session_recommendation: PASS
implementation_status: complete_pending_main_review
gate_j: pending_separate_user_authorization
final_goal_acceptance: pending_main_and_user
candidate_commit: null
```

**Recommendation.** Accept the implementation as ready for Main light review and, if that review is satisfied, freeze a Candidate/Audit Baseline for the Contract-required focused independent audit. Do not mark the Goal accepted before Gate J and Main/user acceptance.

## Delivered

- Direct public emitted `AgentHarness` + `JsonlSessionRepo` recovery substrate.
- Immutable valid-failure-only Recovery Seed with parent JSONL Session and failed Workspace lineage.
- Exactly two isolated Candidate paths: forked same-history A and fresh-history B.
- Same immediate recovery bytes and common Skill/Model/Tool/Verifier/policy/budget bindings.
- Both Candidate Attempts and external Verifiers run on every valid failure.
- Hard-gate-first selection, deterministic secondary ordering and valid `none` outcome.
- Retained invalid/budget-stopped Candidate evidence.
- Read-only fail-closed Inspector and bounded CLI surface.
- Six matrix Runs plus one final-source authoritative Run, base/supplement Evidence Indexes and summaries.
- Required typecheck and focused V0/V1 regressions.
- Implementation Report, Source Delta, commands/exit codes and state-update proposal.

## Verification summary

```yaml
typecheck: passed
v2a_tests: 6_pass_0_fail_0_skipped
workspace_and_v0b_verifier: 11_pass_0_fail_0_skipped
v1a_tests: 18_pass_0_fail_0_skipped
v1a_deterministic: passed
v1b_tests: 31_pass_0_fail_0_skipped
v1c_budget_stop: 13_pass_0_fail_0_skipped
authoritative_v2a_runs: 6_matrix_plus_1_final_source_valid
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_cost_usd: 0
pi_core_patches: 0
private_pi_imports: 0
git_staged_files: 0
git_commits_created: 0
```

Authoritative IDs:

- `v2a-authoritative-initial-pass`
- `v2a-authoritative-a-pass-b-fail` / `v2a-authoritative-a-pass-b-fail-recovery-group-01`
- `v2a-authoritative-a-fail-b-pass` / `v2a-authoritative-a-fail-b-pass-recovery-group-01`
- `v2a-authoritative-a-pass-b-pass` / `v2a-authoritative-a-pass-b-pass-recovery-group-01`
- `v2a-authoritative-a-fail-b-fail` / `v2a-authoritative-a-fail-b-fail-recovery-group-01`
- `v2a-authoritative-a-budget-b-pass` / `v2a-authoritative-a-budget-b-pass-recovery-group-01`
- `v2a-authoritative-final-source-a-pass-b-fail` / `v2a-authoritative-final-source-a-pass-b-fail-recovery-group-01`

Ignored evidence root: `.runs/v2-a/evidence/`. The final-source validation is indexed by `EVIDENCE_INDEX_SUPPLEMENT.md`; it was appended without overwriting the base `EVIDENCE_INDEX.md` or its six matrix Runs.

## Pending control points

1. Main light review of source, focused test evidence and claims.
2. Main creation of a Candidate/Audit Baseline only after review.
3. Separate user authorization for a fresh focused Audit Session.
4. Gate J audit of Seed order/immutability, A/B isolation/history delta, selector hard gates/none/budget retention, Inspector fail-closed behavior and zero-access boundary.
5. Bounded correction by this original Implementation Session if audit finds a correctable defect.
6. Main/user final acceptance and any truthful `CURRENT_STATE.md` update.

## Explicitly not closed

**Fact.** V2-A is not finally accepted in this draft. Gate J and Definition of Done items 2 and 24 remain pending.

**Fact.** V2-B, real calls, credentials, network, external Provider/model use, Candidate publication/apply, durable in-flight recovery, automatic routing and any claim of real recovery effectiveness remain unauthorized and unexecuted.

## CURRENT_STATE_UPDATE_PROPOSAL

```yaml
proposal_only: true
proposed_goal_status: implementation_complete_pending_main_review
proposed_disposition: PASS
gates: { A: passed, B: passed, C: passed, D: passed, E: passed, F: passed, G: passed, H: passed, I: passed, J: pending_separate_authorization }
authoritative_run_ids:
  - v2a-authoritative-initial-pass
  - v2a-authoritative-a-pass-b-fail
  - v2a-authoritative-a-fail-b-pass
  - v2a-authoritative-a-pass-b-pass
  - v2a-authoritative-a-fail-b-fail
  - v2a-authoritative-a-budget-b-pass
  - v2a-authoritative-final-source-a-pass-b-fail
real_model_calls_observed: 0
external_provider_calls_observed: 0
credential_reads_observed: 0
network_calls_observed: 0
pi_core_patch_count: 0
candidate_commit: null
```
