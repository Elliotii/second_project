# Final Capstone Goal 3 Outer Runtime / Manifest Schema 2 Decision Proposal

```yaml
status: accepted_by_user_superseded_by_formal_amendment
date: 2026-08-18
goal_id: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
proposal_id: FINAL_CAPSTONE_G3_OUTER_RUNTIME_MANIFEST_SCHEMA_2
user_direction: AUTHORIZE_RECOMMENDED_DECISION_PROPOSAL
existing_goal_3_correction_budget: 2_of_2_exhausted_unchanged
first_structural_amendment_correction_budget: 1_of_1_exhausted_unchanged
proposed_new_amendment_correction_budget: 1
candidate_frozen: false
audit_started: false
real_acceptance_run_started: false
real_acceptance_run_consumed: false
real_acceptance_runs_max: 1
implementation_authority: granted_only_through_formal_amendment_and_control_baseline
```

## 1. Decision requested

Authorize one new, narrow structural Amendment that introduces an explicit outer V3 Goal 3
runtime/manifest schema 2 for the Final Capstone V3.6 bridge while preserving all accepted
schema-1 behavior exactly.

This is not a second correction to the first Structural Amendment, does not reset any
budget, does not reopen Goal 1 or Goal 2 acceptance, and does not authorize a real Run.
It is a separately reviewable structural change required because the exhausted correction
proved that an honest V3.6 projection cannot satisfy the existing schema-1 Faux
single-request invariant.

## 2. Evidence-backed problem

The accepted outer V3 schema conflates two different quantities:

- one outer adapter/Run execution; and
- the inner Agent loop's actual Provider requests.

For accepted schema 1, `dispatch_attempts` is exactly one and a Faux carrier must also have
exactly one `provider_request`. The Final Capstone inner V3.6 bounded-edit carrier must
execute at least one registered command and may require multiple Agent turns. Pi continues
from a Tool result unless the complete Tool batch terminates. Therefore a valid inner
carrier can truthfully record two or more requests even though there is exactly one outer
Run.

Mapping the inner request count to outer `1` loses authoritative usage information and
violates FC-G3-SA-MAIN-P1-001. Treating an aggregate of several payload hashes as the old
singular `model_payload_sha256` also leaves the payload identity ambiguous.

## 3. Recommended schema decision

### 3.1 Preserve schema 1

- Existing `Goal3RunManifestV3` and `DirectPiRuntimeEvidenceV3` schema-1 exact keys,
  digest domains, Faux single-request rule, real accounting, bytes, producer behavior and
  Inspector behavior remain unchanged.
- Existing V3, V3.5 and accepted Goal 3 evidence continues to reopen without mutation.
- No caller may relabel schema-1 evidence as schema 2 or mix schema key sets.

### 3.2 Add an explicit Final Capstone schema 2

Schema 2 is permitted only for the frozen Final Capstone V3.6 carrier and must include an
exact carrier discriminator. It separates:

- exactly one outer Run/execution attempt;
- the exact inner Provider request/dispatch count;
- exact credential/network/external Provider/real-model counters;
- exact input/output token, cost and Tool-call counters; and
- an ordered Host-captured Provider observation inventory.

The ordered observation inventory binds each request ordinal to its Host-observed model
projection hash and final Provider payload hash. A separate observation artifact is
write-once and bound by exact path, file hash, Session ID, Run ID and inventory digest.
Schema 2 does not overload the old singular payload field: it carries an explicit ordered
request-observation identity that the Inspector recomputes.

For deterministic/Faux proof, the actual request count may be greater than one while
credential/network/external Provider/real-model counters remain zero. For the later real
DeepSeek carrier, all real-access counters must equal the exact inspected inner dispatch
count and remain within the already frozen budget. No count may be substituted to satisfy
an outer invariant.

### 3.3 Strict production and inspection

- The existing schema-1 `executeGoal3RunV3` behavior remains unchanged.
- A new explicit schema-2 Final Capstone production path is selected only by Host-owned
  frozen carrier authority; implicit upgrade or caller-selected schema is forbidden.
- `inspectGoal3RunV3` dispatches strictly on the exact integer schema version and applies a
  separate exact-key/digest rule for each version.
- Schema-2 inspection reopens the Host observation artifact, V3.6 Session pin, authority,
  Runtime Manifest and terminal evidence, then independently recomputes the complete outer
  runtime and manifest projection.
- Final Capstone lineage inspection requires exact artifact refs/hashes and recomputes
  real-access counters, IDs, results and exact-once inventories.
- Goal 1 `v3g3_bound_state_followup` remains the same accepted family. Its derivation uses
  the exact schema-2 `provider_dispatches`; no fourth family or new admission authority is
  added.

## 4. Rejected alternatives

### Relax schema 1

Rejected. Allowing arbitrary Faux request counts or redefining its counters would silently
reinterpret accepted V3/V3.5 evidence and invalidate the exact compatibility boundary.

### Force V3.6 to terminate after a successful command

Rejected as the primary solution. It changes accepted V3.6 execution semantics and still
cannot guarantee one total Provider request: the Agent may need earlier turns to inspect or
edit before issuing the successful command. It also does not solve ordered multi-request
payload identity for the real carrier.

### Preserve substitution and document it

Rejected. Comments, report wording or tests cannot turn a substituted counter into
Host-observed authority.

## 5. Proposed bounded implementation surface

The formal Amendment should authorize only the existing Structural Amendment files plus
these accepted-core files required for explicit version dispatch:

- `workbench/src/contracts/v3g3-types.ts`;
- `workbench/src/pi/pi-adapter-v3.ts`;
- `workbench/src/run-v3.ts`;
- `workbench/src/inspect-v3.ts`;
- `workbench/src/refinement/evidence-admission-g1.ts`;
- `workbench/src/refinement/admission-v3.ts`;
- `workbench/src/contracts/final-capstone-g3-types.ts`;
- `workbench/src/pi/final-capstone-g3-v36-port.ts`;
- `workbench/src/final-capstone-g3.ts`;
- `workbench/src/inspect-final-capstone-g3.ts`;
- `workbench/tests/v3g3-admission.test.ts`;
- `workbench/tests/v3g3-selective-reuse.test.ts`;
- `workbench/tests/final-capstone-g3-closed-loop.test.ts`;
- `docs/reports/FINAL_CAPSTONE_G3_OUTER_RUNTIME_SCHEMA_2_IMPLEMENTATION_REPORT.md`;
- `docs/reports/FINAL_CAPSTONE_G3_CLOSEOUT_DRAFT.md`;
- ignored deterministic evidence only under `.runs/final-capstone/g3/`.

Before the formal Amendment freezes this list, Main must verify whether
`pi-adapter-v3.ts` requires an edit or whether a separately typed schema-2 execution port
can keep it unchanged. Any file removable after that type-boundary check must be removed
from the final allowlist; no additional file may be added silently.

No edit is proposed to V3.6 source, Pi, Goal 1/2 authority logic, State/binding, task or
Verifier fixtures, provider/model/profile, budget, Docker, Source Apply, root planning
history, accepted Closeouts or historical evidence.

## 6. Required deterministic proof

The formal Amendment must require, with zero Credential/network/external Provider/model
access:

1. byte-for-byte schema-1 compatibility and all existing schema-1 rejection behavior;
2. strict schema-version dispatch, hybrid/downgrade/upgrade rejection and exact keys;
3. a Faux Final Capstone carrier with more than one honest inner request and zero real
   access, projected without substitution;
4. exact ordered observation inventory, payload/profile/Session/Run binding and independent
   recomputation after process reopen;
5. rejection of missing, duplicate, reordered, detached or coherently rehashed observation
   entries;
6. exact counter equality between inner Manifest, observation inventory, outer runtime,
   outer manifest, Goal 1 usage derivation and final lineage;
7. all existing schema-2 promotion-admission negatives and both legal Final Capstone
   assessment outcomes;
8. strict TypeScript and the complete original Goal 3 Gate E regression set; and
9. unchanged tracked task, Workspace source, Verifier, State, Source and both Pi checkouts.

## 7. Governance and budget

If formally authorized:

1. Main writes and freezes a new Contract Amendment and exact Control Baseline.
2. One fresh dedicated top-level zero-call implementation Session owns the bounded delta.
   The exhausted correction Session and its worktree are evidence only and are not resumed
   or adopted wholesale.
3. Main independently reviews every line and reruns Gate E before freezing a Candidate.
4. A fresh mandatory focused audit covers schema confusion, schema-1 compatibility,
   observation substitution, inner/outer counters and final lineage recomputation.
5. The proposed new Amendment has at most one bounded correction round. A recurrence of the
   same projection authority/integrity class returns `DECISION_REQUIRED`.
6. Only an accepted audit permits an Execution Baseline and the unique real Run.

The existing Goal 3 `2/2` budget and first Structural Amendment `1/1` budget remain
exhausted historical facts. The proposed `1` round exists only if the User explicitly
authorizes it as part of the new formal Amendment.

## 8. Unchanged unique real boundary

- task: `final-capstone-g3-v1-parse-duration`;
- real Runs: maximum one, currently `0/1`;
- Provider/model, profile, budget, Docker, State/binding, Verifier and task identities:
  unchanged;
- no rerun, same-Run retry/continuation after terminalization, fallback, replacement, task
  swap, result hunting or manufactured failure; and
- the first terminal real result remains authoritative.

## 9. Approval requested

The User approved this direction on 2026-08-18 with `可以，继续吧。`, interpreted in the
immediately preceding Main context as:

`AUTHORIZE_G3_OUTER_RUNTIME_SCHEMA_2_STRUCTURAL_AMENDMENT`

The binding result is
`docs/第二项目_Codex交接包_2026-07-30/SECOND_PROJECT_FINAL_CAPSTONE_GOAL_3_OUTER_RUNTIME_SCHEMA_2_STRUCTURAL_AMENDMENT.md`.
That Amendment, not this superseded proposal, controls implementation authority. Real
access remains unauthorized before Candidate and mandatory audit acceptance.
