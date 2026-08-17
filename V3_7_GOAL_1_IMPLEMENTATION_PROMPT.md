# V3.7 Goal 1 Implementation Prompt

```yaml
prompt_id: V3_7_G1_REGISTERED_RECOVERY_EVIDENCE_BRIDGE_IMPLEMENTATION
status: AUTHORIZED_FOR_DEDICATED_IMPLEMENTATION_SESSION
date: 2026-08-18
authoritative_repository: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
authoritative_branch_at_freeze: codex/v2-b-bounded-r2
accepted_charter_baseline_commit: 58f3f1aace8b0eafa153082dc34dd0a41bfe2922
accepted_charter_baseline_tree: c7ac66090f1e07d1dc8b3091be544b67aae62e27
accepted_charter: V3_7_CHARTER.md
implementation_owner: fresh_dedicated_Goal_1_Implementation_Session
architecture_and_acceptance_owner: V3_7_Main_Session
real_provider_calls: 0
real_model_calls: 0
credential_reads: 0
network_calls: 0
docker_product_runs: 0
ordinary_correction_budget: 2
goal_2_or_goal_3_authority: false
```

## 1. Mission and stop point

Implement only Charter Goal 1, **Registered Recovery Evidence Bridge**, on top of the
accepted Charter baseline. Produce one deterministic, fail-closed implementation that:

1. loads a Host-registered immutable Manifest Body and current Registration Envelope;
2. derives and persists a workflow registration and fixed task instance identity;
3. maps honest accepted V2 Primary/Seed/Candidate-Path/Selection truth into a new V3.7
   Comparison Decision without manufacturing peer Run IDs;
4. freezes a separate Recovery Evidence Body and Evidence Submission Request;
5. independently inspects and admits/rejects the new
   `v37_registered_recovery_learning_episode` G1 variant;
6. projects an admitted record directly into `ImprovementOpportunityV3`;
7. passes that Opportunity through a V3.7 prompt-only Candidate wrapper using the current
   accepted Base State and the Manifest State scope;
8. preserves every old G1 family and V2/V3/G2 semantic path unchanged.

Create one candidate implementation commit, an implementation report and a Goal 1
Closeout draft, then stop. Do not start Goal 2, audit, product UI or a real Case.

## 2. Immutable source and authority baseline

- Source/Charter baseline: commit `58f3f1aace8b0eafa153082dc34dd0a41bfe2922`,
  tree `c7ac66090f1e07d1dc8b3091be544b67aae62e27`.
- The dedicated Session must record its starting commit/tree before editing.
- Existing tracked source is evidence and dependency, not an implicit edit surface.
- The rejected Final Capstone Schema 2 paths must remain absent.
- `.upstream/pi`, `reference/`, existing `.runs/` history and accepted reports are read-only.
- No Credential or environment-variable enumeration is permitted.
- No Provider/model/network call, dependency installation, Docker product execution or Pi
  inspection/change is permitted.

If the starting source materially conflicts with `V3_7_CHARTER.md` or this Prompt, stop
with `BLOCKED_PENDING_MAIN_DECISION`; do not redesign the Contract.

## 3. Exact file allowlist

The Session may create or modify only these paths:

```text
workbench/src/contracts/v37-types.ts
workbench/src/v37/host-registry-v37.ts
workbench/src/v37/workflow-registration-v37.ts
workbench/src/v37/registered-recovery-v37.ts
workbench/src/v37/candidate-v37.ts
workbench/src/inspect-v37g1.ts
workbench/config/v37/registered-cases/registry-v1.json
workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v1.json
workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.r1.json
workbench/tests/v37g1-registered-recovery.test.ts
docs/reports/V3_7_G1_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G1_CLOSEOUT_DRAFT.md
```

No other path may change. In particular, do not edit:

- `workbench/src/contracts/final-capstone-g1-types.ts`;
- `workbench/src/refinement/evidence-admission-g1.ts`;
- `workbench/src/refinement/evidence-v3.ts`;
- `workbench/src/refinement/producer-v3.ts`;
- any V2 controller, selector, Inspector or type;
- any V3 State Store, staging, binding or CAS module;
- any G2, V3.6, WebUI, package, TypeScript configuration or script;
- `CURRENT_STATE.md`, this Prompt, the Charter or any accepted Closeout.

An allowlist expansion is a Main decision and a Hard Stop, not an implementation choice.

## 4. Required implementation order

1. Define exact V3.7 schemas and canonical digest helpers in the new contract/module
   boundary.
2. Implement the fixed Host registry loader and trust-root verification.
3. Implement workflow registration/task-instance derivation and immutable persistence.
4. Implement honest V2 episode projection and Comparison Decision.
5. Implement Recovery Evidence Body, confirmation receipt and independent submission
   request persistence.
6. Implement G1 inspection/admission/reopen and direct Opportunity projection.
7. Implement the prompt-only Candidate policy wrapper and State-scope checks.
8. Add deterministic positive/negative tests, run the exact verification matrix, write
   reports and commit the candidate.

Do not create a parallel demo/test-only route. Deterministic evidence must exercise the
same exported production functions.

## 5. Registration Runtime Trust Anchor freeze

Goal 1 uses the Charter-permitted **Host-owned frozen configuration** trust mode, not chat
approval and not Runtime Attestation.

```yaml
trust_anchor_mode: host_owned_frozen_configuration
configuration_baseline_id: v37-g1-host-registry-v1
registry_location: workbench/config/v37/registered-cases/registry-v1.json
manifest_location: workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v1.json
envelope_location: workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.r1.json
loader_entry_point: workbench/src/v37/host-registry-v37.ts#loadRegisteredCaseFromHostRegistryV37
loader_contract_id: v37-host-registry-loader-v1
digest_algorithm: sha256_over_canonical_utf8_json_v1
unknown_key_policy: reject
caller_registry_override: forbidden
caller_digest_override: forbidden
package_approval_authority: forbidden
```

The registry index is the exact allowed digest inventory for this Goal. It may contain
only the one named deterministic Manifest/version, its immutable accepted/disabled
Envelope chain where needed for disable/reopen tests, their exact digests, the loader
contract identity and `configuration_baseline_id`. It must not scan a directory, accept a
glob, merge caller entries or enroll arbitrary Cases.

The loader must resolve only the fixed repository-relative locations above; exact-key
validate all three documents; recompute the Manifest digest, every Envelope digest and
the previous-envelope chain; verify Case/version equality and current status; and derive
`registry_trust_root_digest` from the fixed registry location, loader contract,
configuration baseline and complete allowed digest inventory.

The Inspector must reload those files through the same loader. Manifest/Envelope/
approval copies inside a submitted package are comparison references only. Browser/user
confirmation, caller-supplied digests, `approval_policy_id`, Session narrative and manual
approval fields cannot establish Authority.

The candidate commit/tree freezes the exact bytes of this Host configuration. Main will
record that immutable commit/tree before audit. Any later source or configuration byte
change creates a new candidate and requires a fresh audit.

Do not add signatures, PKI, a new Authority Store, Provider-payload attestation or a
general registry.

## 6. State scope and Candidate contract

The Manifest's `state_store_scope_spec` must bind exactly:

```text
Host-normalized configured State Store location
+ project_id
+ runtime_base_prompt_digest (= immutableBasePromptSha256)
+ initial accepted State state_digest
```

Use a Host-controlled normalized repository/data-root-relative State Store location so
the identity is portable across an authoritative checkout; resolve it canonically and
reject escape, link/reparse ambiguity and unexpected absolute/caller paths. The
`state_store_scope_digest` is computed over the exact normalized scope body and inherited
by workflow registration without override.

The Candidate wrapper must:

- accept only an admitted V3.7 recovery Opportunity from the same workflow;
- accept only the currently inspected active `project_id` and
  `ActiveStateIdentityV3.state_digest` from that exact scope;
- require `expected_base_state_digest` to equal the active digest;
- require Manifest applicability equality;
- call the existing `validateProposalAndBuildCandidateV3` boundary;
- require exactly one `prompt_addendum` edit;
- reject adaptive Skill, task-answer leakage indicators, authority-targeting fields,
  cross-scope/cross-Case/cross-workflow input and stale Base identity;
- keep deterministic proposal generation behind the existing `BoundedProposalPortV3`
  shape used by the production wrapper.

Goal 1 must not publish, promote, reject or roll back State. No temporary or alternate
State lineage may be created.

### 6.1 Exact deterministic follow-up identity

The Goal 1 registered Manifest must contain the following complete follow-up inputs. They
are frozen now so the same workflow can continue into Goal 2; placeholders such as
`reserved_not_executed_in_goal_1` are forbidden.

```yaml
follow_up_task_id: v37-g1-det-follow-up-clamp-retries
follow_up_task_kind: typescript-maintenance
follow_up_failure_family: verifier-failure
follow_up_task_body_sha256: 4ff40dfc9c27c3083b2694175ea34f78ceecf522202a894f91c7fd614c8a73b8
follow_up_source_baseline_id: v37-g1-det-follow-up-source-v1
follow_up_source_path: src/policy.mjs
follow_up_source_sha256: 77271bd589e03e3d3b54dd25db95877baf5f45b3b21917b9e4e67893776f8c11
follow_up_verifier_id: v37-g1-det-follow-up-verifier-v1
follow_up_verifier_path: verifier/follow-up.test.mjs
follow_up_verifier_sha256: 2a4019af3501332b9c53365ed907120b2c9e496de59ebf37c4fd8dab78d4ec87
follow_up_verifier_command: node --test verifier/follow-up.test.mjs
follow_up_verifier_command_sha256: 4b54db2265af6b195de93467a95970bdac4a1d7f2a5a3af85a628e9f84305033
```

Exact UTF-8 task body, without a trailing newline:

```text
Update `src/policy.mjs` so `clampRetries` returns `0` for negative integer inputs and preserves non-negative integer inputs. Do not modify verifier files.
```

Exact UTF-8 source bytes, with LF line endings and one final LF:

```javascript
export function clampRetries(value) {
  return value;
}
```

Exact UTF-8 Verifier bytes, with LF line endings and one final LF:

```javascript
import assert from "node:assert/strict";
import test from "node:test";
import { clampRetries } from "../src/policy.mjs";

test("clampRetries follows the registered boundary contract", () => {
  assert.equal(clampRetries(-1), 0);
  assert.equal(clampRetries(0), 0);
  assert.equal(clampRetries(2), 2);
});
```

The Manifest must embed these exact bodies or content-address them with the exact digests
above. Goal 1 does not execute the follow-up. Goal 2 must consume these same identities;
changing them requires a new Manifest/version and cannot continue the Goal 1 workflow.

## 7. Recovery and Comparison truth

- Reuse `inspectRunV2A` and persisted V2 artifacts as truth; do not change their schema.
- Bind the one Primary Run, Recovery Seed/group and two ordered Candidate Paths.
- Preserve each `candidate_path_id`; never create `recovery_a_run_id` or
  `recovery_b_run_id`.
- Require common Verifier identity, isolated workspaces, terminal completeness and exact
  profile/budget/stop identities.
- Host-compute Selection/Comparison from the registered profile and inspected V2 truth.
- `selected` requires a valid registered improvement arm.
- `no_valid_recovery` is terminal and learning-ineligible.
- Any mismatch or ambiguous mapping fails closed.

The new Comparison is `v37_registered_recovery_comparison`; it is not old
`FrozenEvidenceV3.comparison` and must not alter old `v2a_recovery_comparison` behavior.

## 8. Evidence, request, admission and persistence

- Recovery Evidence Body and Submission Request are distinct immutable objects.
- Confirmation binds exact workflow and Evidence digest but adds no Evidence truth.
- Host-minted request identity is idempotent only for byte-identical content.
- Every formal object is schema-versioned, canonical-json content-addressed and
  write-once/append-only as applicable.
- Reopen re-reads all referenced artifacts and rejects mutation, missing files,
  inventory drift, intermediate junctions, hardlinks/reparse escapes and lineage drift.
- Admission is a new independent top-level variant
  `v37_registered_recovery_learning_episode`.
- It must not enter `fixedHostApprovalG1`, modify old family unions or fabricate an old
  peer comparison.
- Rejection is immutable and terminal for that workflow stage.
- The projector accepts only an admitted record and directly constructs truthful
  `ImprovementOpportunityV3` observations from Primary/arms/Comparison.

Persistence may use only a new V3.7 data-root subtree. It must not write formal artifacts
into the tracked registry/configuration directory.

## 9. Deterministic test file and required categories

All new Goal 1 tests live in exactly:

```text
workbench/tests/v37g1-registered-recovery.test.ts
```

The file must cover at least:

1. valid registry load, trust-root recomputation and exact inventory;
2. unknown key, Manifest mutation, Envelope mutation, missing/disabled registration and
   historical read-only reopen;
3. caller/browser/package approval forgery, caller registry path and digest rejection;
4. workflow/task derivation, multiple workflows and cross-Case/workflow substitution;
5. Primary problem trigger/Verifier presence and terminal truth;
6. A/B isolation, common Verifier, Candidate-Path identity and both-fail/Comparison tamper;
7. Evidence/request/confirmation separation, replay and immutable reopen;
8. G1 Admit/Reject, direct Opportunity truth and old V2 `no_opportunity` preservation;
9. Candidate prompt-only/evidence/Base/applicability/State-scope binding;
10. adaptive Skill, stale Base, cross-scope and leakage/authority-field rejection;
11. accepted G1/G2/V3 behavior through the regression commands below;
12. rejected Schema 2 implementation paths remain absent.

Tests may use ignored `.runs/v37/g1-tests/` output only. They must not overwrite accepted
historical `.runs` evidence.

## 10. Exact verification commands

Run from `workbench/`, one command at a time, with zero network/real access:

```powershell
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit

node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g1-registered-recovery.test.ts

node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2a-recovery.test.ts

node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g1-evidence-to-candidate.test.ts

node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g2-validate-promote-reject-rollback.test.ts

node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/final-capstone-g1-evidence-admission.test.ts

node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/final-capstone-g2-regression-state-feedback.test.ts
```

If an accepted regression cannot start only because ignored historical fixtures are
absent, do not fabricate them. Record the exact command/output and run the narrowest
source-independent affected tests available. Any product assertion failure is a Goal 1
failure, not an environment waiver.

Also record:

```powershell
git diff --check
git status --short
git diff --name-only <starting-commit>..HEAD
git -C ../.upstream/pi status --short
```

## 11. Candidate commit and report contract

The Implementation Session is authorized to create exactly one initial candidate commit
containing only allowlisted Goal 1 files. Suggested message:

```text
feat: implement V3.7 registered recovery evidence bridge
```

`V3_7_G1_IMPLEMENTATION_REPORT.md` and `V3_7_G1_CLOSEOUT_DRAFT.md` must record:

- starting and candidate commit/tree;
- exact changed-file inventory;
- implemented schema/Authority decisions and source symbols;
- registry location, configuration baseline, loader contract and complete digest inventory;
- deterministic Case/workflow/State-scope identities;
- exact verification commands/results and tests counts;
- remaining unverified items;
- Credential/network/Provider/model/Docker counts, all zero;
- scope deviations or Hard Stops;
- candidate status `READY_FOR_MAIN_PRELIMINARY_REVIEW`, never Goal acceptance.

Do not tag, push, update `CURRENT_STATE.md`, declare audit PASS, accept Goal 1 or start
Goal 2.

## 12. Immediate Hard Stops

Stop and return to Main without a candidate if any requirement needs:

- editing outside the allowlist;
- changing an old G1 family, V2 truth, V3 State/CAS or G2 semantics;
- caller/browser/session-narrative Authority;
- a dynamic/general registry or arbitrary enrollment;
- Candidate-Path-as-Run identity;
- a demo-only evidence route;
- State publication or Goal 2 work;
- real Provider/model/Credential/network/Docker access;
- rejected Schema 2, Runtime Attestation or Pi change.

At completion, return only the candidate identity, changed files, verification summary,
zero-access counters, remaining unverified items and report paths. Then wait for Main.
