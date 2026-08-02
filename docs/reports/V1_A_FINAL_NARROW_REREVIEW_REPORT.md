# V1-A Final Narrow Rereview Report

```yaml
status: main_session_narrow_rereview_passed
date: 2026-08-03
goal: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
review_owner: current_main_session
disposition: PASS_V1_A_CANDIDATE_FOR_FREEZE_AND_FOCUSED_AUDIT
candidate_commit_ready: true_subject_to_user_authorization
focused_independent_audit_ready: true_after_exact_candidate_SHA
v1_a_final_acceptance: false
v1_b_authorized: false
```

## Decision

The Main Session narrowly rereviewed only V1A-RR-001 through V1A-RR-004 and
the directly affected regression boundaries. All four residuals are closed for
Candidate freeze.

The disposition is:

```text
PASS_V1_A_CANDIDATE_FOR_FREEZE_AND_FOCUSED_AUDIT
```

This is not Gate J, final V1-A acceptance, an Implementation Baseline, a real
comparison result, or V1-B authorization.

## Boundary verification

- root HEAD remains
  `c9f91057db60cf61dab0d3aa305564d498c89cd6`;
- Git index is empty;
- Pi remains clean at
  `027a5847901b5dde30270abaa1041046cd2b4b55`;
- `CURRENT_STATE.md`, Charter, Contract and accepted control files remain
  unchanged;
- user-provided `reference/` remains untracked and was not modified;
- real-model, external Provider, network and credential-read counts remain 0;
- no dependency install, Pi patch, private import, Git commit, audit launch or
  V1-B work occurred.

## Residual closure

### V1A-RR-001 — closed

The aggregation entry now derives and compares the complete local frozen
Manifest, including the exact 4 Task × 2 repetition × 3 Strategy membership,
Run IDs, ordering, dispositions and all source bindings.

Main Session counterexamples now reject:

```json
{
  "empty_manifest": "rejected",
  "empty_aggregate": "rejected",
  "coherent_digest_drift": "rejected"
}
```

### V1A-RR-002 — closed

Terminal status, final Verifier status, invalid attribution and exclusion are
validated against a frozen protocol matrix before aggregation. Contradictory
passed/treatment/final-failed and unauthorized exclusion combinations reject.

### V1A-RR-003 — closed

Provider authority is reserved before runtime identity allocation and factory
invocation. A second composition before the first request now rejects, and the
Main Session observed exactly one factory call. Factory failure burns the
authority fail-closed.

### V1A-RR-004 — closed

The `public_check_dependent` Task now fails its public check unmodified while
the reference repair passes the public check and the stronger external
Verifier. The public test remains weaker than and separate from hidden external
acceptance.

## Main Session verification

| Command | Result |
| --- | --- |
| `node --test --test-name-pattern=V1A-RR tests/v1a-deterministic.test.ts` | 4/4 pass |
| `node --test tests/v1a-deterministic.test.ts` | 14/14 pass |
| strict TypeScript | exit 0 |
| `node scripts/run-v1a-deterministic-suite.mjs` | exit 0; five deterministic gates pass |
| `node --test tests/v0b-verifier.test.ts` | 2/2 pass |

The dedicated Session's append-only evidence records the full Workbench suite
at 105/105. The Main Session intentionally did not repeat the 45-second full
suite during this narrow rereview because the micro delta was limited and the
shared Verifier regression was rerun directly.

## Candidate identities reported by the dedicated Session

```yaml
source_digest: 7b1d470910fa440aa634d303c153d8f3f2565b740905e79bc4a7f4af04d93246
workbench_tree_digest: 15d037296f4df63f43b554f0791fe9cc083cf6e32dcce138972a08bd274a9477
fixture_tree_digest: ac637c2801d7aa18908a932b21a5b6a912c6a85cb7ac43d14d731d45035f4892
manifest_id: cf5c368564a6633b3f225bf12bea8b23d0b7a4877724bcde740915ee22e43f13
```

Authoritative append-only evidence:

```text
.runs/v1-a/corrections/main-review-001/micro-correction-001/final-evidence/EVIDENCE_INDEX.md
```

## Audit decision

Gate J remains required by the accepted Contract. The Candidate is now ready
for the following separately authorized control sequence:

```text
Main Session creates V1-A Candidate Audit Baseline Commit
→ confirms exact Candidate SHA and clean tracked state
→ generates a SHA-bound focused audit Prompt
→ starts a new independent audit Session
```

The audit must remain limited to the Contract's focused scope, with emphasis on
Manifest/denominator/status integrity, actual treatment payload and Verifier
ordering, Task calibration/protected shortcuts, Provider authority, exact Skill
identity/path boundaries and necessary V0 regressions. It must not repair,
commit, accept V1-A, call a real model, or begin V1-B.

## Stop point

No Candidate Commit or audit is authorized by this report. `CURRENT_STATE.md`
must remain unchanged until later final acceptance/control closeout. Await
explicit user authorization for the Candidate Commit and Gate J audit.
