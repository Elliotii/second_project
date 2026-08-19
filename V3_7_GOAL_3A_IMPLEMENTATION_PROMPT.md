# V3.7 Goal 3A Implementation Prompt

```yaml
prompt_id: V3_7_G3A_REUSABLE_PRODUCT_CAPABILITY_IMPLEMENTATION
status: AUTHORIZED_FOR_FRESH_DEDICATED_ZERO_ACCESS_IMPLEMENTATION_SESSION
date: 2026-08-20
authoritative_repository: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
authoritative_branch_at_freeze: codex/v2-b-bounded-r2
accepted_charter: V3_7_CHARTER.md
accepted_amendment: V3_7_G3A_AUTHORITY_EXTENSION_AMENDMENT.md
amendment_freeze_commit: 425dc6752c9074dc079fa7b952cb93869080a3df
amendment_freeze_tree: 991ed5027751d09cd2d9ea26807b884e55cb7aea
implementation_starting_commit: RESOLVED_BY_MAIN_DISPATCH
implementation_owner: fresh_dedicated_Goal_3A_Implementation_Session
architecture_and_acceptance_owner: V3_7_Main_Session
candidate_commits_authorized: 1
ordinary_correction_budget: 2
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_product_runs: 0
goal_3b_authority: false
```

## 1. Mission and stop point

Implement the exact two-Case Goal 3A reusable product capability through one new
versioned Schema-1 Host authority and the accepted Goal 1/2 semantics:

1. preserve the accepted singleton v1 bridge/configuration byte identities;
2. load exactly the two frozen Goal 3A Cases from one bounded source-controlled index;
3. run the recovery Case through Primary problem, two Recovery arms, comparison,
   recovery admission, one prompt-addendum Candidate, Regression promotion, bound
   follow-up, second admission and retained G2 Assessment;
4. run the Primary-pass Case to `no_recovery_needed` with every Recovery, Evidence,
   Candidate and State-changing action unavailable;
5. expose the flow through an append-only workflow journal, re-derived Read Model,
   loopback API and the existing bilingual WebUI;
6. prove multiple-workflow and cross-Case isolation, restart/reopen and the existing
   V3.6 change handoff behavior;
7. prove the stable loader can accept one later reviewed configuration append without
   changing implementation source or existing per-entry trust roots.

Create one allowlist-clean Candidate commit and the two implementation reports, then stop
for Main preliminary review. Do not audit, accept Goal 3A, prepare/freeze Goal 3B, or
perform real execution.

## 2. Starting authority and immutable dependencies

- Start only from the exact Main dispatch commit descended from Amendment freeze
  `425dc6752c9074dc079fa7b952cb93869080a3df`.
- `V3_7_CHARTER.md` remains authoritative except for the exact narrow supersession in
  `V3_7_G3A_AUTHORITY_EXTENSION_AMENDMENT.md`.
- Goal 1/2 accepted candidates, reports, Evidence, Candidate, State and Assessment are
  read-only dependencies.
- Existing V2 recovery/selector, V3 producer/comparator/State Store/CAS, G2 decision and
  rollback, V3.6 session/change handoff, Pi and rejected Schema 2 behavior are frozen.
- Do not enumerate environment variables, inspect Credentials, install dependencies,
  access network/Provider/model, run a Docker product task, or inspect/change Pi.

If the exact implementation cannot preserve these identities or needs an out-of-
allowlist change, stop with `BLOCKED_PENDING_MAIN_DECISION` and zero out-of-allowlist
delta.

## 3. Accepted v1 byte inventory

These SHA-256 values must remain exact at Candidate handoff:

```text
cdf3b081444f3288b38b1bdb92525b5613ab068effda3c9af7848fa31d31727b  workbench/config/v37/registered-cases/registry-v1.json
39292054a68592b5c1951e0193d428070eebc7f3700ccd6ab1f3797e2aa161c2  workbench/config/v37/registered-cases/manifests/v37-g1-det-recovery.v1.json
621efc8de7747d2d7ce8c2f780b45c271bb0b0b4dc3bbb449cf80447d1a340a3  workbench/config/v37/registered-cases/envelopes/v37-g1-det-recovery.r1.json
6820b9f8e31ee3f7a10e82a5ca7cf6d9ebae66b5a5325e7b7000cdcfbb9debb9  workbench/config/v37/follow-up-execution-profiles/v37-g1-det-recovery.g2.v1.json
df4c46a90377723cdd0d968b703bbeff6b013825783be7a6581aa40657785bd3  workbench/src/contracts/v37-types.ts
9c837ada3ef20b48764b00b6ec95966de646691d76723f553ab849d4da9fa79b  workbench/src/v37/host-registry-v37.ts
615775449f6244486f40600de237e3c7ffed9b80b0e719d11ca12d2d2cceea8c  workbench/src/v37/workflow-registration-v37.ts
4f9ca29c83cc4a6f2c787fea8fee9dc3a002ac8158635de29b404aa334db250d  workbench/src/v37/registered-recovery-v37.ts
2e72c05ba5e0e66dbcd64d4740dfbc836ebc4d4a8e7a51fd15f3969621888036  workbench/src/v37/candidate-v37.ts
f9d6db8b165ab8804c2bbca99cd4732dd59792beaa3042f474599f333c7f142f  workbench/src/v37/follow-up-execution-profile-v37.ts
bc181c4079d571db867ba61daeef59347e7af4d60bf9559795c52c452fa5f6f4  workbench/src/v37/registered-follow-up-v37.ts
52aa75137b96e743660875b6efb7a1d4f680e0c8847991c9187c3b5a81f05c89  workbench/src/inspect-v37g1.ts
187f70395b893a2e130f6856fe2b266c74fa9745e42c7229d3675a5b1d9cd4a1  workbench/src/inspect-v37g2.ts
```

No implementation convenience justifies changing those files. Historical v1 workflows
must reopen through those exact loaders/inspectors.

## 4. Exact implementation allowlist

Only these paths may be created or modified:

```text
workbench/config/v37/g3a/registered-cases/registry-v1.json
workbench/config/v37/g3a/registered-cases/manifests/v37-det-recovery-promote-retain.v1.json
workbench/config/v37/g3a/registered-cases/manifests/v37-det-primary-pass.v1.json
workbench/config/v37/g3a/registered-cases/envelopes/v37-det-recovery-promote-retain.r1.json
workbench/config/v37/g3a/registered-cases/envelopes/v37-det-primary-pass.r1.json
workbench/config/v37/g3a/follow-up-execution-profiles/v37-det-recovery-promote-retain.v1.json
workbench/config/v37/g3a/follow-up-execution-profiles/v37-det-primary-pass.v1.json
workbench/fixtures/v37g3a/primary-pass/instruction.md
workbench/fixtures/v37g3a/primary-pass/task.json
workbench/fixtures/v37g3a/primary-pass/workspace/package.json
workbench/fixtures/v37g3a/primary-pass/workspace/src/subject.ts
workbench/fixtures/v37g3a/primary-pass/workspace/test/public.test.mjs
workbench/src/contracts/v37g3a-types.ts
workbench/src/v37/host-registry-v37g3a.ts
workbench/src/v37/workflow-registration-v37g3a.ts
workbench/src/v37/registered-recovery-v37g3a.ts
workbench/src/v37/candidate-v37g3a.ts
workbench/src/v37/follow-up-execution-profile-v37g3a.ts
workbench/src/v37/registered-follow-up-v37g3a.ts
workbench/src/v37/workflow-journal-v37g3a.ts
workbench/src/v37/product-service-v37g3a.ts
workbench/src/read-model/workflow-v37g3a.ts
workbench/src/inspect-v37g3a.ts
workbench/src/state/state-feedback-g2.ts
workbench/src/webui/application-v37g3a.ts
workbench/src/webui/server-v36g1.ts
workbench/src/webui/static/index.html
workbench/src/webui/static/app.js
workbench/src/webui/static/i18n.js
workbench/src/webui/static/styles.css
workbench/scripts/start-v37g3a-demo.ts
workbench/tests/v37g3a-authority.test.ts
workbench/tests/v37g3a-product.test.ts
workbench/tests/v37g3a-http-ui.test.ts
docs/reports/V3_7_G3A_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G3A_CLOSEOUT_DRAFT.md
```

No package, TypeScript configuration, old v1 source/configuration, V2/V3/G2 semantic
module, Pi, Charter, Amendment, Prompt or `CURRENT_STATE.md` edit is permitted. Ignored
deterministic evidence below `.runs/v37/g3a-*` is allowed. Allowlist expansion is a Main
decision and Hard Stop.

## 5. New Host registry and trust-root freeze

Use exactly:

```yaml
registry_location: workbench/config/v37/g3a/registered-cases/registry-v1.json
configuration_baseline_id: v37-g3a-host-registry-v1
loader_entry_point: workbench/src/v37/host-registry-v37g3a.ts#loadRegisteredCaseFromHostRegistryV37G3A
loader_contract_id: v37-g3a-host-registry-loader-v1
digest_algorithm: sha256_over_canonical_utf8_json_v1
schema_version: 1
entry_count_at_candidate: 2
entry_count_hard_max: 3
unknown_key_policy: reject
canonical_case_order: ascending_case_id
runtime_enrollment: forbidden
directory_scan: forbidden
caller_location_or_digest: forbidden
```

Each exact-key entry contains the accepted v1 entry fields plus
`follow_up_execution_profile_location` and
`follow_up_execution_profile_digest`. Loader source is stable and may accept two or three
source-controlled entries, but the Candidate configuration must contain exactly the two
frozen Cases.

Validate the global canonical index digest. Derive the selected Case trust root only from
the stable loader contract/fingerprint and that selected entry's Case/version,
Manifest/envelope chain and follow-up-profile locations/digests. Do not include the
global index digest, unrelated entries or entry position in the selected trust root.
Append simulation may use an in-memory or temporary structurally valid entry solely to
prove an existing entry's trust root stays stable; it must not create a third tracked
registered Case.

All fixed project paths must be below the authoritative repository, canonical, ordinary,
singly linked files with ordinary non-link ancestors. An alternate caller `projectRoot`,
identical copied tree, hardlink, symlink, junction or reparse point must not reproduce
Host Authority.

## 6. Exact deterministic Case freeze

### 6.1 Shared immutable policy

Both Manifests use the exact `SYSTEM_PROMPT` bytes and digest from
`workbench/src/prompts/base.ts`, the accepted single generic Candidate template:

```text
template_id: v37-verify-before-finish
content: Before reporting completion, run the task-declared check and rely on its result rather than self-assessment.
content_sha256: 1341b7b213c788c3d17ced324ba46da316c091af8d43182d02f589add792cc8f
```

They reuse the accepted recovery strategy identities, V2A selector semantics,
`typescript-maintenance/verifier-failure` applicability and the exact clamp-retries
follow-up Task/Source/Verifier bodies from the accepted v1 Manifest. Candidate type is
exactly one `prompt_addendum`; adaptive Skill is forbidden.

Both follow-up profiles reuse the exact accepted deterministic effective provider, tool,
command, budget and stop-condition bodies. Their Case/Manifest/parent digests and final
profile digest are recomputed for the selected new Manifest. No caller profile is
accepted.

Registration envelopes use policy `v37-main-reviewed-case-registration-v1`, revision 1,
accepted status, null previous/disabled fields and these fixed approval facts:

```yaml
v37-det-recovery-promote-retain:
  approval_record_id: v37-g3a-main-registration-recovery-r1
  approved_at: 2026-08-20T12:00:00.000Z
v37-det-primary-pass:
  approval_record_id: v37-g3a-main-registration-primary-pass-r1
  approved_at: 2026-08-20T12:00:01.000Z
```

### 6.2 Recovery/promote/retain Case

```yaml
case_id: v37-det-recovery-promote-retain
manifest_version: 1
project_id: v37-det-recovery-project
source_task_verifier: exact accepted fixtures/tasks/v1/parse-duration plus fixtures/verifiers/v1/parse-duration.mjs identities
primary_backend: registered deterministic V2A faux
primary_mode: fail
candidate_modes: [pass, pass]
state_store_location: .runs/v37/g3a/state-stores/v37-det-recovery-promote-retain
initial_state_digest: 2e5954a9680a28667105ec93792d7a987b0b52890bc31d9bc239d75e9632a5f8
required_final_assessment: retain
```

The Provider profile body, not browser input or workflow ID, freezes the deterministic
route. Both Recovery arms must be genuine V2 formal Runs from one frozen failed Primary
seed and the accepted selector must choose from their real artifacts.

### 6.3 Primary-pass Case

```yaml
case_id: v37-det-primary-pass
manifest_version: 1
project_id: v37-det-primary-pass-project
primary_backend: registered deterministic V2A faux
primary_mode: pass
candidate_modes: []
state_store_location: .runs/v37/g3a/state-stores/v37-det-primary-pass
initial_state_digest: 722571254791053dd7d232bc76c1f4f9c8f92c61eacaf9d5bf91e708fb8a12b0
required_terminal: no_recovery_needed
```

Freeze the new source fixture to the accepted parse-duration task with these exact text
files (LF final newline):

`instruction.md`

```text
Repair `src/subject.ts` so `parseDuration` accepts non-negative integer values suffixed by `ms` or `s`, returns milliseconds, and rejects malformed input. Preserve the export and run the declared public check.
```

`workspace/package.json`

```json
{"private":true,"type":"module","scripts":{"test":"node --test test/public.test.mjs"}}
```

`workspace/src/subject.ts`

```ts
export function parseDuration(value: string): number { const match = /^(\d+)(ms|s)$/.exec(value); if (!match) throw new Error("invalid duration"); return Number(match[1]) * (match[2] === "s" ? 1000 : 1); }
```

`workspace/test/public.test.mjs`

```js
import assert from "node:assert/strict";
import test from "node:test";
import { parseDuration } from "../src/subject.ts";
test("declared duration units", () => { assert.equal(parseDuration("500ms"), 500); assert.equal(parseDuration("2s"), 2000); });
```

The task JSON is canonical schema version 1, uses task ID
`v37-g3a-primary-pass-parse-duration`, references those exact files, retains writable
path `src/subject.ts`, protected `package.json` and `test/public.test.mjs`, public check
`public_test`, and reuses the exact external verifier
`fixtures/verifiers/v1/parse-duration.mjs`. All file/tree/spec digests must be derived and
frozen into the Manifest; do not hand-wave or self-declare them.

## 7. Versioned bridge-service equivalence

New G3A services must preserve these accepted semantics:

- Host-minted workflow/task identities and Host-global pre-execution Primary Run binding;
- exact Task/Source/Verifier content validation and Candidate-answer leakage rejection;
- genuine Primary/Recovery terminal, Verifier, Outcome and Candidate-Path identities;
- separate first confirmation/request and independent recovery admission recomputation;
- Candidate derived only from admitted Opportunity and current exact State scope;
- symmetric Regression Base/Candidate execution and existing State publication/CAS;
- promoted applicable State frozen before follow-up, immediate pre-request pointer check,
  production V3.6 prompt consumption and runtime observation;
- formal follow-up Verifier/Outcome, distinct second confirmation/request and independent
  follow-up admission;
- canonical G2 normalization with unchanged retain/reassessment/strict rollback and
  no-direct-supersede rules;
- disabled registration blocks new actions while accepted historical artifacts reopen
  read-only and identity-stable.

`state-feedback-g2.ts` may receive only a narrow additive internal option that invokes
the G3A Host recomputation itself. It must not accept a caller-built canonical value or
change old v1/legacy branches, persisted schemas or decisions.

## 8. Workflow journal, Read Model and product actions

Persist one immutable workflow header plus append-only, contiguous, digest-chained Host
transition receipts. Receipts reference formal artifact IDs/digests; they never contain a
browser-supplied stage or Outcome. Reopen reloads Host registration and independently
recomputes the stage and available actions from receipts plus formal artifacts.

Use a fixed application-owned data root below `.runs/v37/g3a-product`; it is never a
browser parameter. Host clocks/ID factories and deterministic Provider/command ports may
be injected only at application construction for deterministic testing.

Expose only:

```text
GET  /api/v1/v37/cases
GET  /api/v1/v37/workflows
POST /api/v1/v37/workflows                    body: {case_id}
GET  /api/v1/v37/workflows/{workflow_id}
POST /api/v1/v37/workflows/{workflow_id}/actions/{action_id}  body: {}
```

Fixed action IDs are:

```text
run_primary
run_recovery
confirm_recovery_evidence
request_recovery_admission
produce_candidate
run_regression
run_follow_up
confirm_follow_up_evidence
request_follow_up_admission
assess_state
```

The action handler accepts no path, prompt, Provider/model, command, budget, Verifier,
artifact bytes/digests, Candidate, State, Decision, Assessment, rollback target,
timestamp or Run/Session/workspace identity. Host services derive all of them. Unknown,
premature, repeated or disabled actions fail closed without a false receipt.

Extend the existing UI rather than replace it. It must list the two Cases, create and
reopen workflows, render safe stage/artifact summaries and expose only currently
available actions. Preserve English and `zh-CN`, existing Files/Changes/Diff and
Apply/Discard/Export behavior, and every existing V3.6 API behavior.

## 9. Deterministic and negative routing requirements

- The recovery Case must complete the full retained route using production action
  handlers, restart, reopen and exact formal artifacts.
- The Primary-pass Case must stop immediately at `no_recovery_needed`; no recovery or
  learning artifact may exist and later actions are unavailable.
- Two workflows for one Case have distinct journals/artifacts and reject cross-workflow
  substitution, while the Manifest-defined State scope remains Host-controlled.
- Cross-Case substitution of registration, receipt, formal artifact or action target
  fails closed.
- A deterministic Regression Reject/negative route must be produced by the real
  comparator/Verifier path using the same registered recovery Case in an isolated test
  workspace. Do not manufacture a Decision, Verifier or Outcome and do not add a third
  Case.
- Both confirmations remain distinct. UI display or browser acknowledgement is never
  formal admission.
- Restart/reopen ignores cached navigation and detects receipt/artifact/configuration
  drift.

## 10. Minimum required deterministic coverage

The three focused tests must collectively cover:

1. exact two-entry index, Case selection, canonical bytes, unknown keys and max-three
   bound;
2. per-entry trust-root stability under an untracked append simulation and global-index
   validation;
3. alternate root, copied configuration, path escape, hardlink, symlink/junction and
   caller authority rejection;
4. exact unchanged v1 inventory and accepted v1 historical reopen/regressions;
5. full recovery/promote/follow-up/retain route through product actions;
6. Primary PASS terminal with zero Recovery/Evidence/Candidate availability;
7. multiple workflows, cross-workflow and cross-Case isolation;
8. separate confirmations, disabled read-only reopen and accepted artifact stability;
9. genuine Regression Reject and honest terminal routing;
10. restart/reopen with re-derived stage and tampered receipt/formal artifact rejection;
11. API exact-key/empty-body validation and browser non-authority;
12. bilingual UI and unchanged V3.6 Files/Changes/Diff/Apply/Discard/Export behavior;
13. rejected Schema 2 absence and zero real-access counters.

Tests verify only frozen claims. Do not add load, concurrency, fuzz, migration,
arbitrary-Manifest, generalized policy, statistical evaluation or production-hardening
suites unless Main first records an in-scope reproduced blocker under the Amendment
triage rule.

## 11. Exact verification list

From `workbench/`, using the existing local loader and no installation:

```text
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g3a-authority.test.ts tests/v37g3a-product.test.ts tests/v37g3a-http-ui.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g1-registered-recovery.test.ts tests/v37g2-runtime-effective-followup.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2a-recovery.test.ts tests/v2a-cli.test.ts tests/v2a-post-audit.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g1-evidence-to-candidate.test.ts tests/v3g2-validate-promote-reject-rollback.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v36g1-http-ui.test.ts tests/v36g2-change-handoff.test.ts tests/v36g2-product-entry.test.ts tests/v36-product-polish.test.ts
npm run typecheck
```

If the isolated implementation worktree lacks ignored loader or Node declaration
dependencies, record the exact environment limitation and use only the already accepted
equivalent loader/typecheck procedure. Do not install or copy dependencies from an
unregistered source.

Record exact commands/totals, allowlist diff, v1 hashes, configuration and source
identities, zero-access counters, environment qualifications and unverified items.

## 12. Reports and Candidate handoff

Write:

- `docs/reports/V3_7_G3A_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_7_G3A_CLOSEOUT_DRAFT.md`.

Create exactly one Candidate commit containing only allowlisted files. Report commit,
tree, parent, changed files, checks, v1 hash inventory and Credential/network/Provider/
model/Docker counts, then stop. Do not edit control state, freeze an audit candidate,
start audit, accept Goal 3A, configure Goal 3B, tag or push.

