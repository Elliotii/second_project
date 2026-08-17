# Final Capstone Goal 3 Outer Runtime Schema 2 - Correction 1 Main Re-review

```yaml
status: DECISION_REQUIRED
date: 2026-08-18
goal_id: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
amendment_id: FINAL_CAPSTONE_G3_OUTER_RUNTIME_MANIFEST_SCHEMA_2
correction_round: 1_of_1_exhausted
candidate_frozen: false
audit_started: false
real_acceptance_run_started: false
real_acceptance_run_consumed: false
implementation_session: 01a01088-6def-7df3-8a4c-b7b239e4606b
implementation_worktree: C:/Users/HUAWEI/.codex/worktrees/d19a/project2
control_baseline_commit: eed86bb99b66201c9f1fd84f4081366cc8960c53
control_baseline_tree: 48608c2e9cd05cdbd29b9999886b4fce0ad72d9a
```

## Main disposition

`Fact`: the implementation Session returned one bounded unstaged/uncommitted correction
delta. Main reviewed every changed source, test and report path and independently reproduced
strict TypeScript plus the combined focused suite (`15/15`), V3 Goal 1 (`13/13`) and V3
Goal 2 (`6/6`). The remaining child-process, cleared-environment Node initialization and
Docker-unavailable results are platform faults and are not counted as another correction.

`Fact`: the correction substantially improves the representation: one outer Run can bind
plural ordered inner Provider observations, the deterministic path reaches both legal
assessments, and the final lineage records an explicit member inventory.

`Conclusion`: the delta remains unacceptable because the same projection/lineage
authority-and-integrity class identified in the authorized finding set remains. Under the
formal Amendment and the User's correction-budget rule, correction `1/1` is exhausted and
Main must return `DECISION_REQUIRED`. Main did not adopt the delta, freeze a Candidate,
start an audit or consume the unique real Run.

## Recurring finding set

### FC-G3-S2-REREVIEW-P1-001 - request hashes are not independently recomputable

`Fact`: `ProviderObservationArtifactV3Schema2` persists only hashes for the model-visible
projection and final Provider payload. It does not persist an independently reopenable
request/payload record or bind those hashes to another Host record that contains the bytes.

`Fact`: `inspectProviderObservationsV3Schema2` checks exact keys, ordinal continuity and
SHA-256 syntax. The outer Inspector independently checks the system-prompt and user-message
hashes because those values have separate frozen authorities. It has no independent source
from which to recompute `model_projection_sha256` or
`final_provider_payload_sha256`.

`Inference`: an actor that substitutes either hash and coherently recomputes the
observation digest, observation file hash, outer runtime hash/digest, outer Manifest
hash/digest and final lineage can preserve all checks. The digest chain proves internal
consistency, not the originally Host-observed payload.

`Fact`: the corrected test named `coherent observation rehash alone cannot pass` changes
only the observation and deliberately leaves the bound outer runtime/Manifest stale. It
therefore passes because an earlier outer hash/digest mismatch remains; it does not test a
coherently rehashed outer chain. The per-member substitution test likewise appends bytes
without coherently updating that member and its lineage.

This is a recurrence of `FC-G3-S2-MAIN-P1-001` and
`FC-G3-S2-MAIN-P1-003`, not a new separable finding.

### FC-G3-S2-REREVIEW-P1-002 - production authority remains caller-selectable and Manifest freeze precedes complete inspection

`Fact`: the canonical carrier still accepts caller-provided `providerPort` and
`commandPort` objects. It compares the Provider port's self-declared profile with one of
two frozen profile values, but it does not bind the implementation identity. The command
port has no frozen discriminator at all. The exported Faux command port writes synthetic
Docker authority/terminal evidence in the same shape consumed by the Inspector.

`Inference`: a caller can combine a frozen profile label with a substitute transport, or
combine the real Provider-labelled route with the Faux command port. Inner accounting is
then derived from port-reported `credential_reads` / `external_model` values and
shape-valid terminal records rather than independently observed real dispatch/command
facts. Caller ports are therefore still able to assert authoritative execution facts.

`Fact`: `freezeGoal3RunV3Schema2` checks the observation envelope and access-count
equalities, then writes the runtime and Manifest. Before that write it does not validate
the individual observation entries, token/Tool/cost hard limits, exact Docker command
inventory or terminal authority. Those complete checks occur only later in
`inspectGoal3RunV3`, after the Manifest already exists. This conflicts with the formal
Amendment rule that the Manifest may not be produced until complete inner V3.6 and Host
observation inspection passes.

This is a recurrence of `FC-G3-S2-MAIN-P1-001`.

### FC-G3-S2-REREVIEW-P1-003 - compatibility and negative proof use stale or non-authoritative identities

`Fact`: for schema 1, `inspectorIdentityG1` returns a hard-coded historical
`inspect-v3.ts` SHA-256 instead of hashing the current Inspector source. The same function
hashes current source for schema 2. Consequently a schema-1 admission can claim the old
Inspector fingerprint while executing the modified current file. This preserves an old
registration digest by weakening the meaning of the Inspector identity rather than by
proving current-source identity.

`Fact`: the direct schema-2 registry negative test changes six individual fields. It does
not execute the correction authorization's required swapped/unauthorized Goal 1 authority,
wrong Goal 2 authority, non-promote Decision, cross-entry substitution, symlink/junction or
hardlink cases. Existing schema-1 tests do not prove those schema-2 authority paths.

`Fact`: terminal exact-inventory proof is limited to the final-lineage directory and Docker
command evidence directories. The test does not demonstrate all promised schema-2
registry and closed-loop exact-once inventories under coherent substitution.

This is a recurrence of `FC-G3-S2-MAIN-P1-002` and
`FC-G3-S2-MAIN-P1-003`.

## Main verification

```text
node D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc -p workbench\tsconfig.v35g2.json --noEmit
  exit 0

node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 workbench/tests/final-capstone-g3-closed-loop.test.ts workbench/tests/v3g3-admission.test.ts workbench/tests/v3g3-selective-reuse.test.ts
  exit 0; 15/15 pass

node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 workbench/tests/v3g1-evidence-to-candidate.test.ts
  exit 0; 13/13 pass

node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 workbench/tests/v3g2-validate-promote-reject-rollback.test.ts
  exit 0; 6/6 pass
```

Passing deterministic tests do not close the recurring authority finding because the
tests do not construct the coherent substitutions that the current representation cannot
independently recompute.

## Preserved boundaries

- Main did not copy or apply any implementation-worktree source delta.
- The implementation worktree remains unstaged and uncommitted.
- Candidate remains `false`; mandatory audit remains `false`.
- Credential/network/external Provider/real-model access remains `0/0/0/0` by procedure.
- The frozen task, Workspace source, Verifier, State, Source, accepted V3.6 source and Pi
  remain unchanged.
- The unique real acceptance Run remains unstarted and unconsumed `0/1`.
- Platform execution faults did not consume or create a correction round.

## Required decision

No further patch, audit or real execution is authorized under this Amendment. A new User
decision must choose a structural authority model that makes per-request payload evidence
independently reopenable, makes the real Provider/Docker route Host-selected rather than
caller-asserted, and preserves truthful Inspector identity across schema 1 and schema 2.
Until then, Goal 3 remains active but stopped at `DECISION_REQUIRED`.
