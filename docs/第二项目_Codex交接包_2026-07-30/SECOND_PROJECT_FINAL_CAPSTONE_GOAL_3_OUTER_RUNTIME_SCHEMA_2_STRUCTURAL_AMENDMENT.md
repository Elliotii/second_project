# Second Project Final Capstone Goal 3 Outer Runtime / Manifest Schema 2 Structural Amendment

```yaml
status: accepted_binding_formal_amendment
date: 2026-08-18
goal_id: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
amendment_id: FINAL_CAPSTONE_G3_OUTER_RUNTIME_MANIFEST_SCHEMA_2
user_decision: AUTHORIZE_G3_OUTER_RUNTIME_SCHEMA_2_STRUCTURAL_AMENDMENT
user_decision_text: 可以，继续吧。
user_decision_sha256_utf8: f4cccdcc061668ae798f1a5fbb3b1f997889e3104bc6ff39ed1db95a9ec51217
decision_proposal: docs/reports/FINAL_CAPSTONE_G3_OUTER_RUNTIME_SCHEMA_2_DECISION_PROPOSAL.md
prior_main_control_commit: 04e87d0d509dc177c3701d35754b3defe5442b0b
prior_main_control_tree: 9a3d37266f3ddbc7ad0976ce34931cbda8de281f
formal_amendment_freeze_commit: resulting_commit_of_this_revision
original_goal_3_correction_budget: 2_of_2_exhausted_unchanged
first_structural_amendment_correction_budget: 1_of_1_exhausted_unchanged
this_amendment_correction_budget: 1
real_acceptance_run_started: false
real_acceptance_run_consumed: false
real_acceptance_runs_max: 1
main_owner: final_capstone_main_session
implementation_owner: fresh_dedicated_top_level_zero_call_outer_schema_2_session
```

## 1. Authority and purpose

The User accepts the evidence and recommendation in:

- `docs/reports/FINAL_CAPSTONE_G3_STRUCTURAL_AMENDMENT_CORRECTION_1_DECISION_REQUIRED_MAIN_REREVIEW.md`; and
- `docs/reports/FINAL_CAPSTONE_G3_OUTER_RUNTIME_SCHEMA_2_DECISION_PROPOSAL.md`.

This Amendment authorizes one new, narrow structural change: an explicit outer V3 Goal 3
runtime/manifest schema 2 for the frozen Final Capstone V3.6 bridge.

It is not another correction to the exhausted first Structural Amendment. It does not reset
or reinterpret Goal 3's `2/2` budget or the first Structural Amendment's `1/1` budget. It
does not reopen accepted Goal 1, Goal 2, V3 or V3.6 behavior beyond the exact versioned
outer-evidence boundary named here.

The objective is:

```text
one frozen Final Capstone outer Run
  -> one honest inner V3.6 bounded-edit carrier
  -> N exact Host-observed Provider requests
  -> one explicit outer schema-2 runtime/manifest projection
  -> independent reopen and recomputation
  -> existing Goal 1 family admission
  -> legal Goal 2 assessment
```

The unique real acceptance Run remains `0/1` and is not authorized during implementation,
Main review, Candidate creation or focused audit.

## 2. Binding finding

Accepted outer V3 schema 1 requires a Faux runtime to report exactly one Provider request.
A settled V3.6 bounded-edit carrier must complete at least one registered command and may
require multiple Agent turns. Pinned Pi continues after Tool results unless the complete
Tool batch terminates. Therefore an honest inner carrier can record more than one request
while there is exactly one outer Run.

The exhausted correction attempted to preserve schema 1 by substituting the outer Faux
request and dispatch values with `1`. That violates the existing Main finding requiring all
authoritative outer usage and payload facts to be derived without value substitution.

This Amendment resolves the conflict through an explicit schema version. It does not relax
schema 1 and does not modify V3.6 or Pi termination semantics.

## 3. Schema-1 compatibility boundary

All accepted schema-1 behavior remains exact:

1. `Goal3RunManifestV3` and `DirectPiRuntimeEvidenceV3` retain schema version `1`, exact
   keys, digest domains and existing field semantics.
2. Existing schema-1 producers keep emitting identical shapes and semantics.
3. Existing schema-1 evidence reopens without mutation.
4. The schema-1 Inspector retains the Faux `provider_requests === 1` rule and existing real
   accounting rules.
5. Existing V3 and V3.5 source/tests must not be updated merely to accept schema 2.
6. Relabeling schema 1 as schema 2, relabeling schema 2 as schema 1, hybrid keys, unknown
   versions and ambiguous implicit upgrade all fail closed.

Schema 2 must use separately named types and an explicit Host-owned production entry point.
Do not redefine the existing schema-1 interfaces as a loose optional-field object.

## 4. Explicit Final Capstone outer schema 2

### 4.1 Runtime semantics

The schema-2 runtime is allowed only when the frozen Case Authority, task, binding,
provider profile, budget profile, Docker profile and Final Capstone carrier identity all
match this Contract.

It must separate:

- `outer_run_attempts`, exactly `1`;
- `provider_requests`, the exact inner settled V3.6 Provider request count;
- `provider_dispatches`, exactly equal to the Host observation inventory length and the
  inner settled request count;
- credential, network, external Provider and real-model counters;
- input/output tokens, cost and Tool calls; and
- the exact ordered Host observation artifact identity.

The schema-2 runtime must not carry the schema-1 `dispatch_attempts` field. It must not use a
singular `model_payload_sha256` to hide multiple requests. Its exact-key domain instead
includes an ordinary write-once Provider observation artifact ref/hash/digest.

For deterministic/Faux proof, `provider_requests` may be greater than one while credential,
network, external Provider, real-model and cost counters remain zero. For the frozen real
DeepSeek carrier, credential reads remain at most one and every network/external
Provider/real-model count must equal the inspected Provider dispatch count within the
existing frozen budget.

### 4.2 Provider observation artifact

The Host-owned wrapper around the frozen Provider route must capture each request before
dispatch and freeze one ordinary write-once observation artifact bound to the exact inner
Session and Run. The artifact must contain exact keys for:

- schema and Final Capstone carrier discriminator;
- inner Session ID and Run ID;
- provider kind, provider ID, model ID and frozen profile digest;
- one ordered request list; and
- artifact digest.

Each request entry binds a contiguous one-based ordinal, observed system-prompt hash,
observed user-message hash, model-projection hash and final Provider-payload hash. Direct
per-request hashes remain present; an inventory digest may bind the ordered list but may
not replace the individual identities.

Caller-supplied observation values, refs, hashes, request counts or profile labels are not
authority. The wrapper closure and Final Capstone Host orchestration own capture and freeze.

### 4.3 Manifest semantics

The schema-2 outer manifest must bind:

- its exact carrier discriminator and runtime schema version;
- exact runtime artifact ref/hash;
- exact Provider observation ref/hash/digest;
- the same frozen task, binding, Case Authority and provider profile;
- `outer_run_attempts === 1`;
- exact Provider/access/usage/cost counters copied from the inspected schema-2 runtime;
- one frozen external Verifier result; and
- its complete manifest digest.

The manifest may not be produced until the schema-2 runtime has passed its complete inner
V3.6 and Host-observation inspection.

## 5. Host-owned production and independent inspection

The explicit schema-2 production path must:

1. complete the accepted schema-2 promotion-admission authority chain from the first
   Structural Amendment;
2. freeze and inspect the effective V3 binding before dispatch;
3. execute exactly one inner V3.6 bounded-edit Run using the frozen task/profile/budget/
   Docker authority;
4. capture every Provider request through the Host-owned wrapper;
5. reopen and validate the complete V3.6 Session pin, interactive authority, Runtime
   Manifest, terminal evidence, Workspace and command evidence;
6. derive every schema-2 outer runtime field from those inspected records and the Host
   observation artifact without substitution;
7. run the frozen external Verifier once;
8. freeze the schema-2 manifest, ChangeSet, explicit discard Handoff and Final Capstone
   lineage; and
9. admit through the existing `v3g3_bound_state_followup` Goal 1 family and compute exactly
   one legal Goal 2 assessment.

`inspectGoal3RunV3` must dispatch strictly by schema. The schema-2 branch and
`inspectFinalCapstoneG3` must independently reopen and recompute:

- exact inner Session/Run/Profile/Manifest/terminal identities;
- exact ordered observation count and per-request hashes;
- exact inner-to-outer counters and profile/prompt identities;
- exact runtime and manifest refs/hashes/digests;
- exact Verifier, ChangeSet/Handoff, admission and assessment lineage; and
- exact real-access and exact-once summary counters.

Goal 1 `v3Derivation` must accept schema 2 only after `inspectGoal3RunV3` passes and must use
the exact inspected `provider_dispatches` as Provider-call usage. No fourth Goal 1 family,
new admission authority, direct State creation or pointer mutation is authorized.

## 6. Bounded implementation surface

The dedicated implementation Session may edit or create only:

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
- `docs/reports/FINAL_CAPSTONE_G3_CLOSEOUT_DRAFT.md`; and
- ignored deterministic evidence only under `.runs/final-capstone/g3/`.

`pi-adapter-v3.ts` may change only to add the separately typed explicit schema-2 execution
port boundary while preserving the schema-1 port and behavior. If the implementation can
keep this file unchanged, it must do so.

No edits are authorized to V3.6 source, Pi, Goal 1/2 decision authority, State/binding,
task/Workspace/Verifier fixtures, provider/model/profile, budget, Docker, Source Apply,
Charter, prior Contracts/Amendments, accepted Closeouts, `CURRENT_STATE.md`, `AGENTS.md`,
root plans, references or general product surfaces.

The stopped correction worktree is unaccepted evidence only. The new Session must not copy
or wholesale adopt it. It may read the two Main reports and independently derive the
implementation from this Amendment and accepted source.

## 7. Required deterministic proof

Implementation, Main integration and audit have exactly zero Credential reads, zero
environment enumeration, zero network calls, zero external Provider/model calls and zero
real-model calls.

Required focused proof includes:

1. schema-1 exact compatibility, existing bytes and all existing rejection behavior;
2. strict schema-version dispatch, exact keys and hybrid/relabel/unknown-version rejection;
3. a settled deterministic/Faux Final Capstone carrier with more than one honest Provider
   request and zero real access;
4. exact ordered observation capture and independent reopen/recomputation;
5. rejection of missing, duplicate, reordered, detached, cross-Run, cross-Session or
   coherently rehashed observation entries;
6. rejection of any inner Manifest / observation / outer runtime / outer manifest / Goal 1
   usage / final-lineage counter mismatch;
7. rejection of profile, prompt, payload, binding, runtime, Verifier, ChangeSet/Handoff,
   admission or assessment substitution;
8. all first Structural Amendment schema-2 promotion-admission positives and negatives;
9. both legal deterministic terminal assessments with exact-once inventories; and
10. no tracked task, Workspace source, Verifier, State, Source or Pi mutation.

Run literal strict TypeScript and the complete original Goal 3 Gate E suite, using the
already accepted literal replacement mapping for the four absent V3.6 test filenames. Main
must independently repeat the complete set.

## 8. Session governance and correction budget

The implementation owner is one fresh dedicated top-level zero-call Session created from
the exact Main Control Baseline containing this Amendment. It owns only the bounded unstaged
delta, raw deterministic evidence, implementation report and non-accepting closeout draft.
It may not stage, commit, edit control state, accept Goal 3 or access real services.

After return:

1. Main reviews every changed line and reruns all required verification.
2. Main may issue at most one concrete finding set for one bounded correction in the same
   Session.
3. The round is one finding set -> one correction -> tests/regressions -> one Main re-review.
4. Finding splitting is forbidden.
5. If the same projection authority/integrity class recurs, the allowlist is insufficient,
   schema-1 compatibility breaks, or the delta remains unacceptable after the one round,
   return `DECISION_REQUIRED`.
6. Only accepted Main review may freeze the Candidate.
7. A fresh mandatory focused independent audit must cover schema confusion, schema-1
   compatibility, observation authority, exact counters and final lineage recomputation.
8. Any audit correction consumes the same `1/1` budget.

Platform safety review, usage limits, sandbox/tool interruption and execution faults do not
consume the correction round. They also do not authorize a new source correction or real
Run.

## 9. Unique real acceptance boundary

The original Goal 3 real protocol remains unchanged:

- exact task `final-capstone-g3-v1-parse-duration`;
- exact Provider/model/profile/budget/Docker/State/binding/Verifier identities;
- maximum one real Run, currently unstarted and unconsumed `0/1`;
- no rerun, fallback, replacement, task swap, result hunting or manufactured failure; and
- the first terminal real result remains authoritative.

Real execution remains withheld until Main accepts the deterministic delta, freezes a
Candidate, the mandatory focused audit passes and Main freezes an Execution Baseline.

## 10. Completion and stop

This Amendment completes only when its schema-2 behavior is accepted as part of Goal 3 or
truthfully stops under its decision rules. It does not itself accept Goal 3 or complete the
Final Capstone.

After accepted implementation and audit, Main proceeds to the unique real Run and final
Closeout without further intermediate approval unless a Contract decision boundary,
platform block or `DECISION_REQUIRED` occurs.
