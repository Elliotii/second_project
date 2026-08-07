# V3 Goal 1 Closeout — Evidence to Candidate State

```yaml
date: 2026-08-08
goal_id: V3_G1_EVIDENCE_TO_CANDIDATE_STATE
status: closed_accepted
disposition: PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE
accepted_by: main_session_under_explicit_user_preauthorization
control_baseline_commit: 8107df7e7ca10206fbb3fc58f93c3baf3cd4ab75
zero_call_candidate_baseline_commit: 07b81a4cf392854bbbde041f3dafae13b52a768f
zero_call_candidate_baseline_tree: cbb2669a53c811ff1ae6ca1a27ae6c53fadb178d
real_evidence_report_commit: b717befdd1a98386ad6af480f8c86a874dbe988a
implementation_baseline_commit: resulting_HEAD_of_this_revision
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
active_goal_after_closeout: null
goal_2_authorized: false
goal_3_authorized: false
```

## Decision

Main accepts V3 Goal 1. The implementation and preserved evidence satisfy the
accepted Charter boundary for converting valid, frozen evidence into a typed,
host-validated, immutable and inactive Harness State Candidate.

This is a Goal 1 mechanism claim. It is not a claim that the Candidate improves
task performance, should be promoted, or is active. Those decisions belong to
the still-unauthorized Goal 2.

## Accepted result

- Three bounded opportunity triggers are implemented: `hard_failure`,
  `inefficient_success`, and `structural_trajectory_pathology`.
- Invalid, infrastructure-attributed, cancelled, missing-Verifier and
  unclosed-lineage evidence fails closed.
- Diagnosis, Lesson, proposal, Candidate and State identities retain immutable
  evidence and accepted-base lineage.
- The deterministic producer and bounded model-backed producer use the same
  host schema/evidence/base/applicability/authority validator.
- `prompt_addendum` and Pi-public `adaptive_skill` are distinct staged paths.
- State staging is write-once, content-identified, outside the Agent Workspace
  and accepted-base roots, reload-verifiable and always `staged_inactive` in
  Goal 1.
- Main-review findings for persisted derived-field integrity and rejected-path
  residue were corrected and covered by focused fail-closed tests.

## Bounded real proposal

Exactly one separately authorized request was made to
`https://api.deepseek.com/chat/completions` with `deepseek-v4-flash`.

```yaml
credential_reads: 1
external_network_requests: 1
provider_calls: 1
real_model_calls: 1
retries: 0
fallbacks: 0
replacements: 0
prompt_tokens: 628
completion_tokens: 406
total_tokens: 1034
conservative_cost_usd: 0.0002016
hard_cost_cap_usd: 0.20
```

The response was parsed directly as JSON without fence stripping, repair,
manual rewriting or a second request. Host validation accepted exactly one
`prompt_addendum` edit.

```yaml
candidate_id: candidate-48ee92898bdb1eeedfc33956a67725f0
candidate_digest: 48ee92898bdb1eeedfc33956a67725f030bae04d042238af147c30348379c7f4
state_digest: efbaf666637726231d3c3765a23bf579ebb6f2698dd6e8332904e0db938953d9
state_status: staged_inactive
reload_equal: true
```

Three local pre-dispatch command/constant defects were retained as diagnostic
evidence. All occurred before Credential content access and network dispatch;
they consumed zero external authority and did not alter the single-call count.
They were ordinary ignored-runner defects, not additional model attempts or a
new execution stage.

## Main finite verification

Main independently checked:

- Candidate Baseline commit/tree and the two-report-only post-execution delta;
- 16/16 authoritative Evidence Index entries against actual file sizes and
  SHA-256 values, with zero mismatch;
- equal protected-identity maps before and after the request;
- absence of secret/reasoning field names in the safe Provider response;
- authority counters of 0 before dispatch and exactly 1/1/1/1 after dispatch;
- one `prompt_addendum` Candidate, accepted-base freshness, Candidate/State
  digest linkage, `staged_inactive` status and reload equality;
- strict TypeScript with zero diagnostics;
- `npm --prefix workbench run v3g1:test`: 13 passed, 0 failed, 0 skipped;
- both pinned Pi checkouts remained clean at the accepted commit.

Authoritative ignored evidence root:

`.runs/v3-g1/real-proposal/v3g1-real-proposal-20260808-02/`

Its `evidence-index.json` SHA-256 is
`0f9d62c976546a2364121cb65d467e3d0f591b65154f3cced64da6672c557373`.

## Preserved boundaries

- Pi source and emitted artifacts were not modified; public emitted entries
  remained the integration boundary.
- Accepted base prompt, accepted V1 Skill, Verifier, Outcome, Promotion rules,
  active binding and prior V0–V2 evidence were not modified.
- No Goal 2 comparison, promote/reject decision, active pointer, rollback,
  selective binding or subsequent regression task ran.
- No Goal 3 Experience reuse path ran.
- The single real-call authorization is consumed and cannot be reused.
- Goal 2 and Goal 3 require separate user authorization.

## Final claims

Allowed now: the Workbench can transform bounded valid evidence into a typed,
evidence-grounded Candidate through deterministic or bounded real proposal,
validate proposal authority on the host, and persist the result as immutable,
reloadable inactive Harness State for both planned State kinds.

Not allowed now: the Candidate improves real tasks, was promoted, is active,
rolls back safely after activation, selectively binds on later tasks, or that
V3 as a whole is complete.

Final disposition:

`PASS_V3_G1_EVIDENCE_TO_CANDIDATE_STATE`
