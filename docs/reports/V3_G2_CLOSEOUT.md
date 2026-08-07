# V3 Goal 2 Closeout — Validate, Promote / Reject and Rollback

```yaml
date: 2026-08-08
goal_id: V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK
status: closed_accepted
disposition: PASS_V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK
accepted_by: main_session_under_user_instruction_to_proceed_per_accepted_charter
control_baseline_commit: f138ddd607816f266e9024291718eeab087b39f6
control_baseline_tree: 69812fb30ad7c2ee286a60d0cef35be847189d5d
candidate_baseline_commit: c86c6947e71f91ad3fb1262101aa092629b44eb0
candidate_baseline_tree: f9a2ce17d374e357e6c6df1e5607b6b646373485
implementation_baseline_commit: resulting_HEAD_of_this_revision
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
active_goal_after_closeout: null
goal_3_authorized: false
```

## Decision

Main accepts V3 Goal 2. The deterministic/Faux implementation satisfies the
Charter boundary for validating a staged Candidate against Base, making a
Harness-owned Promote/Reject decision, persisting immutable accepted State,
protecting the active binding from stale or corrupt input, and rolling back by
new pointer history rather than mutation.

This is mechanism evidence. It does not establish real-model improvement,
activate the real Goal 1 Candidate, prove selective reuse, or complete V3.

## Accepted result

- Base and Candidate use byte-identical, file-identity-independent Workspace
  copies and distinct fresh public Pi JSONL Sessions under one frozen common
  identity. The execution port receives State and Workspace, with no separate
  arm-selection signal.
- The deterministic rule covers Base-fail/Candidate-pass, Candidate failure,
  both failure, both-pass material improvement, tie/no improvement, regression
  failure and invalid authority/fairness.
- External Verifier and frozen regression results precede the decision;
  structural pathology, Tool calls and Provider calls are the only both-pass
  material vector. Cost/time, model self-rating and V2 strategy ordering are
  not Promotion inputs.
- Accepted State versions and decisions are immutable/content-identified. The
  active pointer has a monotonic binding revision and is replaced through a
  temp-plus-rename operation after version reload verification.
- Rejection and stale rejection preserve active pointer bytes. Rollback creates
  a new immutable decision and pointer revision while retaining both versions
  and the complete prior decision history.
- Store reopen fails closed for corrupt or missing data, unexpected inventory,
  hardlinks, link/reparse/path aliases and digest/lineage mismatch.
- The Inspector reopens raw Artifacts and recomputes fairness, execution usage,
  raw Verifier/regression outcome, deterministic decision and
  Candidate/validation/decision/version/pointer lineage without trusting a
  writer success flag.

## Main finite verification

Main independently checked:

- exact Control Baseline `f138ddd...` / tree `69812fb...`;
- the eight-file tracked Source Delta and absence of protected V0–V2 changes;
- all nine indexed ignored Artifacts and six tracked source SHA-256 identities,
  with zero missing or mismatched files;
- promote, no-improvement Reject, stale Reject and rollback decision/pointer
  records from the authoritative ignored evidence;
- strict TypeScript with zero diagnostics;
- `npm --prefix workbench run v3g2:test`: 6 passed, 0 failed, 0 skipped;
- Goal 1 focused regression: 13 passed, 0 failed, 0 skipped;
- both pinned Pi source and emitted checkouts remained clean at
  `027a5847901b5dde30270abaa1041046cd2b4b55`, package `0.82.1`.

The dedicated Session also recorded V2-A 10/10 and reused V0 boundary 15/15
regressions. Main did not repeat those broader already-passing subsets because
Goal 2 added new adapters and did not change their accepted source.

## Audit decision

No separate independent audit was added. The V3 Charter makes audit
risk-driven, not automatic. Main found no concrete authority, Promotion,
active-state or accepted-core defect after source review, independent raw
evidence checks and focused tamper regressions. A new audit would therefore
repeat existing checks without resolving a specific finding.

## Authority and preserved boundaries

```yaml
credential_reads: 0
external_network_requests: 0
external_provider_calls: 0
real_model_calls: 0
pi_core_patches: 0
private_pi_imports: 0
sdk_extension_rpc_switches: 0
```

- The real Goal 1 Candidate remains `staged_inactive`; all Goal 2 stores and
  pointers are isolated ignored test/evidence roots.
- Accepted V0–V2 core contracts, tests and fixtures were not modified.
- No applicability matcher, Run-start binding, subsequent behavioral Run or
  Portfolio closeout was implemented.
- Goal 3 requires separate user authorization and a clean Goal 2
  Implementation Baseline.

## Limitations

- Evidence is deterministic/Faux mechanism evidence, not statistical or real
  behavioral effectiveness evidence.
- Operational State is under ignored `.runs`; deleting it deletes the store.
- The prototype intentionally assumes one writer and does not claim production
  crash transaction durability, multi-writer locking or database semantics.
- Selective applicability, immutable Run-start State snapshot, irrelevant
  non-binding and bounded real subsequent-Run closure remain Goal 3 work.

Allowed claim: the Workbench now has an auditable Candidate validation and
State lifecycle mechanism with deterministic Promote/Reject, immutable
versions, stale/corrupt fail-closed behavior, active binding and rollback.

Not allowed claim: the real Candidate is beneficial or active, State is already
selectively reused across Runs, or V3 is complete.

Final disposition:

`PASS_V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK`
