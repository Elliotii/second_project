# V1-B P1-004 One-time Micro-correction Report

Status: `READY_FOR_MAIN_SESSION_P1_004_REAUDIT`

## 1. Frozen identity and scope

```yaml
starting_candidate_commit: c360ebc4af9ef941252e6aff99638eca00b161e0
starting_candidate_tree: 96f1f6ed016971e8801c9229ece4004bbc782f62
starting_workbench_source_digest: 0494bd0f749cd587df779596c95f84fafc1c4fe65f57eabf511810476d5989e7
open_finding: P1-004_within_P1-001
closed_findings_preserved:
  - P1-002
  - P1-003
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
real_calls_authorized: 0
```

**Fact.** Gate A passed before editing. HEAD/tree matched the starting
Candidate; tracked and staged state were clean; the only untracked files were
the four Main-owned re-audit/pause/micro-correction documents; Pi was exact and
clean. No credential, environment secret, network, Provider or model access was
used.

## 2. P1-004 closure

| Case | Reservation transition | Pause snapshot | Inspector result |
|---|---|---|---|
| Real Stage-2, durable reservation hook prevents dispatch | request and possible network/Provider/model `0 -> 1` | credential `1`; external `0 / 0 / 0` | valid coherent pause; nonterminal and noncomparable |
| Real Stage-2, dispatch may have occurred | request and possible network/Provider/model `0 -> 1` | credential `1`; external `1 / 1 / 1` | valid coherent pause; nonterminal and noncomparable |
| Stage-1 deterministic post-reservation seam | request `0 -> 1`; external `0 -> 0` | exact zero-access snapshot | valid Stage-1 pause |
| Original coherent forgery | external transition changed to `0 -> 0` | credential `1`; external `1 / 1 / 1`; dependent digests repaired | rejected |
| Mixed real snapshot | correct write-ahead `0 -> 1` | credential `1`; external `1 / 0 / 1`; dependent digests repaired | rejected |

**Fact.** `inspectPausedRunV1B` now accepts only the two closed Stage-2
post-reservation tuples above. It still requires exact request ordinal,
Attempt/Session/Workspace identity, write-before-pause order, full pending
reservation, exact cap relation, exact `0 -> 1` Stage-2 reservation transition
and complete conservative accounting.

**Fact.** The unmodified real-mode deterministic pre-dispatch pause is now
Inspector-valid with:

```yaml
credential_reads: 1
network_calls: 0
provider_calls: 0
model_calls: 0
pending_tokens: 65536
pending_cost_usd: 0.10
conservative_tokens: 65536
conservative_cost_usd: 0.10
terminal_valid: false
comparable: false
```

No producer, schema, product surface, CLI, Manifest or control change was
needed. P1-002 throwing-close and P1-003 public replacement-sequence tests
remain passing.

## 3. Exact source/test delta

Relative to Candidate `c360ebc...`, exactly two code/test files changed:

| Path | + | - | Purpose |
|---|---:|---:|---|
| `workbench/src/inspect-v1.ts` | 4 | 1 | accept only all-zero or all-one Stage-2 external post-reservation snapshots |
| `workbench/tests/v1b-stage1.test.ts` | 22 | 0 | positive pre-dispatch/all-one proofs plus forged and mixed coherent negatives |

The two existing correction reports were updated as required. All other source,
tests, fixtures, Manifests, control files, Pi, references, dependencies, Git
history and index remain unchanged.

## 4. Verification

Commands ran from
`C:/Users/HUAWEI/.codex/worktrees/28be/project2/workbench` unless stated.

| Command | Exit | Result |
|---|---:|---|
| `npm.cmd run typecheck` | 0 | strict TypeScript passed |
| `node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts` | 0 | 31/31 passed, including P1-002 and P1-003 |
| `node --test --test-concurrency=1 tests/v1a-deterministic.test.ts tests/v0c-stage1.test.ts tests/v0c-post-audit-correction.test.ts tests/v0c-main-review-correction.test.ts` | 0 | 42/42 passed sequentially |
| `git diff --check` from repository root | 0 | no whitespace errors |
| `git diff --cached --name-only` from repository root | 0 | empty; index unchanged |

Actual access accounting:

```yaml
credential_or_environment_secret_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
installs_or_downloads: 0
```

The deterministic resolver used only a non-secret literal and performed no
external dispatch.

## 5. Evidence

Authoritative additive ignored evidence root:

`C:/Users/HUAWEI/.codex/worktrees/28be/project2/.runs/v1-b/stage1/p1-004-micro-correction-authoritative-20260805T160148369/`

- `strict-typescript.txt` and `.exit.txt`;
- `v1b-focused.txt` and `.exit.txt`;
- `v1a-v0c-regressions.txt` and `.exit.txt`;
- `verification-summary.json`;
- `source-delta.txt` and `source-inventory.json`;
- `boundary-verification.txt`;
- `evidence-index.json`.

No historical ignored evidence was overwritten or deleted.

## 6. Corrected digest proposal

```yaml
corrected_workbench_source_digest_proposal: b1fa032d42c4e381c880b8092bddb5a625169ea44ee2e0ea238da1595d0edf92
corrected_candidate_commit: null
corrected_candidate_tree: null
owner_for_materialization: Main Session
```

Candidate `c360ebc...` remains rejected until Main Session reviews this delta,
creates a new Candidate and receives a passing P1-004 re-audit.

## 7. P1-004-only re-audit checklist

1. Reproduce the unmodified real Stage-2 post-reservation/pre-dispatch pause and
   require valid pause integrity, terminal false and comparable false.
2. Verify exact credential `1`, external `0/0/0`, exact write-ahead `0 -> 1`,
   and full 65,536-token/USD0.10 pending and conservative charge.
3. Verify the all-one possible-dispatch snapshot remains valid.
4. Coherently repair and reject the original `0 -> 0 + 1/1/1` forgery.
5. Coherently repair and reject mixed external tuples.
6. Retain Stage-1 zero semantics, P1-002 and P1-003 regressions.
7. Run strict TypeScript, 31 focused tests and 42 sequential regressions.
8. Confirm zero real access, exact clean Pi, empty index and no forbidden delta.

## 8. Unverified and stop point

**Unconfirmed.** Main Session has not yet created or accepted a corrected
Candidate. No re-audit acceptance, final replacement Manifest, new Execution
Baseline or Stage 2 execution occurred in this Session. No fourth correction is
authorized.

## 9. `CURRENT_STATE_UPDATE_PROPOSAL`

```yaml
active_goal: V1_B_FROZEN_BOUNDED_REAL_PILOT
v1b_status: active_paused_p1_004_micro_correction_ready_for_reaudit
starting_candidate:
  commit: c360ebc4af9ef941252e6aff99638eca00b161e0
  tree: 96f1f6ed016971e8801c9229ece4004bbc782f62
  disposition: remains_rejected
finding_status:
  P1-004_within_P1-001: correction_complete_pending_reaudit
  P1-002: closed_preserved
  P1-003: closed_preserved
verification:
  strict_typescript: passed
  v1b_focused: 31_of_31_passed
  required_v1a_v0c_regressions: 42_of_42_passed
  actual_access:
    credential_or_environment_secret_reads: 0
    network_calls: 0
    external_provider_calls: 0
    real_model_calls: 0
corrected_workbench_source_digest_proposal: b1fa032d42c4e381c880b8092bddb5a625169ea44ee2e0ea238da1595d0edf92
authoritative_evidence: .runs/v1-b/stage1/p1-004-micro-correction-authoritative-20260805T160148369
main_session_owns:
  - bounded_delta_review
  - corrected_candidate_commit_and_tree
  - P1_004_focused_reaudit_handoff_and_acceptance
  - any_future_execution_baseline
  - final_replacement_manifest_materialization
prohibited_until_separately_authorized:
  - any_fourth_correction
  - credential_or_network_access
  - provider_or_real_model_call
  - stage2_execution
  - control_state_update
  - staging_or_commit_by_preparation_session
```

Work stops here for Main Session review.
