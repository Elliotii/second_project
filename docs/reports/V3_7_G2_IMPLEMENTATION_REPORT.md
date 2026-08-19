# V3.7 Goal 2 Implementation Report

```yaml
status: AUDIT_REMEDIATION_CANDIDATE_READY_FOR_MAIN_REVIEW
goal: V3_7_G2_RUNTIME_EFFECTIVE_STATE_FOLLOW_UP_BRIDGE
implementation_owner: fresh_dedicated_Goal_2_Implementation_Session
starting_commit: 55f8caf17a7b118e68f2f2a18961da351c8b6990
starting_tree: 167c855408e253a7941b6a9579201b753f75c562
preserved_preliminary_review_candidate_commit: 584d233e31485d1bd87a7392ddc361200477ecf6
preserved_preliminary_review_candidate_tree: 3177f7303e82c0f774e4078773ed1669d65853f6
correction_1_candidate_commit: ab0157f9bfab7e714489687fdfb9ec3c45f49c85
correction_1_candidate_tree: dc7ca3366ac15d1da230167fc46fb5a3b932b920
correction_round: 2
correction_authority_commit: e546acc7bda7360a92aa6eab7c7f289721ed2a97
failed_audit_candidate_commit: 3adb5654a24633375d3171f115e8b73d86c023ed
failed_audit_candidate_tree: 333d265bab61ec81c0a84bbc2e24bca02253be89
audit_remediation_finding: V37-G2-AUDIT-P1-001
audit_remediation_authority_commit: 9396dcc08880b77c2decb03d1d620aaa34d5a6f3
exceptional_remediation_budget: 1_of_1
candidate_commit: SELF
candidate_tree: SELF
audit_remediation_candidate_commits_used: 1_of_1
goal_2_accepted: false
goal_3_started: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
observed_external_cost_usd: 0
docker_product_runs: 0
dependency_installations: 0
pi_or_reference_reads_or_changes: 0
hard_stops: []
scope_deviations: []
```

The containing candidate commit/tree is reported by the dedicated Session after the
single authorized commit is created; it cannot be embedded in a file that participates
in its own identity.

## Changed paths

Audit Remediation changes exactly the four authorized paths:

- `workbench/src/v37/registered-follow-up-v37.ts`
- `workbench/tests/v37g2-runtime-effective-followup.test.ts`
- `docs/reports/V3_7_G2_IMPLEMENTATION_REPORT.md`
- `docs/reports/V3_7_G2_CLOSEOUT_DRAFT.md`

`CURRENT_STATE.md`, the Charter, Amendment, Prompt, Goal 1 configuration/loader,
all production source/contracts, registered profile/config/loader, State Store/CAS, old
G1 admission, regression gate, Pi, references and rejected Schema 2 paths were not
changed in Audit Remediation.

## Audit Remediation

- The shared promotion-evidence validator now receives an explicitly resolved State
  version, promotion Decision and expected three-field active identity. It still proves
  the validation reference, Candidate, staged-State, base-State and promote-result
  lineage.
- Live derive/prepare/dispatch/admit resolve only the current active promoted State and
  its current Decision. Rollback therefore continues to block new live follow-up action.
- Historical inspection/normalization instead resolve the frozen State version by both
  version number and digest, and the promotion Decision by both ID and digest. The
  Decision's complete `next_active` identity must equal the frozen binding; the valid
  Store's later current pointer is not substituted as historical authority.
- The focused gate creates and admits the follow-up, performs production rollback to the
  exact immediate parent, and reopens the identical admission, canonical identity and
  accepted artifact tree. Frozen version, Decision and validation tamper still fail
  closed after pointer movement.
- After rollback and registration disable, prepare, execute, submit and admit are all
  rejected while read-only inspection/normalization preserve the accepted identities.

## Correction round 2

- The honest frozen Verifier still executes against deterministic non-registered negative
  material and exits `1` with its real failing check.
- Each accepted formal-artifact negative now mutates or removes exactly one artifact under
  the original registered authority path, invokes the production Inspector, and restores
  the exact original bytes in `finally`.
- Target-specific results are asserted: missing Outcome, Verifier digest mismatch,
  observation digest mismatch, Outcome digest mismatch and cross-workflow formal lineage
  mismatch. Every case explicitly excludes the former copied-root
  `registered Recovery admission unavailable` false positive.
- The literal Prompt commands and distinct loader/compiler environment qualifications are
  recorded below. No negative registered profile, admitted negative Outcome or
  caller-built canonical value was added.

## Correction round 1

- The assessment now derives the canonical State Store and promotion-validation roots
  from the registered Manifest/Host workflow, verifies `state_store_scope_digest`, and
  rejects a byte-identical alternate State root.
- Registered binding and admission now inspect the actual symmetric validation artifact,
  Candidate, staged-State, promotion Decision and accepted State lineage. The focused
  fixture creates that lineage through production validation/publication APIs rather
  than direct Decision, version or active-pointer writes.
- The pre-request V3.6 observation now records all five effective profile digests plus
  independently computed digests of the actual task-policy and runtime-budget inputs.
  Mismatch is rejected before Provider dispatch and independently during admission.
- Assessment comparison and rollback use the same canonical admission/task/source,
  promotion, State and verifier-attribution inputs for old and registered V3.7 sources;
  no caller-built canonical object or Evidence-driven direct supersede was added.
- The frozen Verifier is executed against deterministic non-registered negative material;
  missing Outcome and invalid Verifier artifacts fail the production Inspector. The sole
  registered V3.7 profile remains the frozen PASS-to-retain path as authorized.
- After a complete accepted follow-up is disabled, new actions are blocked while the
  full historical admission and normalized evidence reopen read-only with unchanged
  identities and artifact tree.

## Implemented bridge

- The fixed Host loader validates the exact registered follow-up profile, all five
  parent workflow digests, exact profile bodies, exact keys, component digests, profile
  digest, loader-owned location and loader fingerprint. It derives a workflow-specific
  follow-up execution authority that cannot be selected by a caller.
- The registered service reloads the accepted Goal 1 workflow and Recovery admission,
  validates the exact workflow Candidate, inspects the shared State scope, requires the
  promoted Candidate/Decision/State lineage and selects only applicable prompt addenda.
  It persists the immutable binding and plan before dispatch.
- The production V3.6 `executeBoundedTurn` seam adds a schema-3 registered-observation
  variant. The same method that constructs `AgentHarness` rechecks the pointer and writes
  the exact prompt/binding/authority/Run/Session/Workspace observation before the first
  Provider request. Existing schema-2 V3.6 behavior remains unchanged.
- The deterministic faux route edits only `src/policy.mjs`. After a settled terminal,
  the Host executes the exact frozen current-Node Verifier once, without a shell, under
  the frozen timeout/output limits. Verifier output, formal Verifier, Outcome, Evidence,
  second confirmation/request and admission are write-once and independently reopened.
- Admission reloads workflow/profile authority, Recovery admission, Candidate,
  accepted State version and promotion Decision, recomposes the prompt, rechecks the
  runtime Manifest/observation, Workspace identity, Verifier output, Outcome and every
  evidence/request digest. Disabled registration blocks new action while pinned profile
  identity remains available only through historical read-only loading.
- `CanonicalBoundStateAssessmentInputG2` now has two independent normalizers: the old
  `v3g3_bound_state_followup` path and the new registered V3.7 path. Persisted assessment
  schema and decision results remain unchanged; the focused positive reaches `retain`,
  and the accepted regression suite preserves negative reassessment, strict rollback,
  CAS and no-direct-supersede behavior.

## Frozen identities

```yaml
configuration_location: workbench/config/v37/follow-up-execution-profiles/v37-g1-det-recovery.g2.v1.json
configuration_file_sha256: 6820b9f8e31ee3f7a10e82a5ca7cf6d9ebae66b5a5325e7b7000cdcfbb9debb9
follow_up_execution_profile_digest: 10ab0ebbdcbf1861bfed078400bcd75df900e28e82f4a3c6dfece4b18718dff5
provider_profile_digest: 3957e200d84b1c8aab51a07b8b7226b1ff339730b393046576924f837bfdd1c1
tool_profile_digest: 343ff726f5f6b04c4b073b39001fa1e85b8b958dcc341b9d6e6d3128b8ddb296
command_profile_digest: a0a138fed7b766a2eb3097bc54158fcdff26fde22973406a33f01d194bda6f4d
budget_profile_digest: fd55b70ed4ae784721556a974fcf7cbf1a304a68860ecde5fb5eb3e5d353519d
stop_condition_profile_digest: 97a372d6d09541bc842bafe8fa0114fd5ac8764bc8de47d9f6d3154df561a692
```

Goal 1 configuration files remain byte-identical to the starting commit:

```yaml
registry_file_sha256: cdf3b081444f3288b38b1bdb92525b5613ab068effda3c9af7848fa31d31727b
manifest_file_sha256: 39292054a68592b5c1951e0193d428070eebc7f3700ccd6ab1f3797e2aa161c2
envelope_file_sha256: 621efc8de7747d2d7ce8c2f780b45c271bb0b0b4dc3bbb449cf80447d1a340a3
```

## Verification

All commands below were run literally from `workbench/`.

```powershell
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g2-runtime-effective-followup.test.ts
```

Result: PASS, 11/11.

```powershell
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g1-registered-recovery.test.ts
```

Result: environment stop before every Goal 1 assertion (0/14 executed). The unchanged
V2-A setup rejected a rounded duplicate Number identity for `test/public.test.mjs`.
Direct `lstatSync(..., { bigint: true })` inspection showed distinct NTFS file IDs with
`nlink=1`; default Number conversion exceeded the safe-integer range and rounded distinct
IDs together. Goal 1 source/test is frozen and outside this remediation allowlist.

```powershell
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2a-recovery.test.ts tests/v2a-cli.test.ts tests/v2a-post-audit.test.ts
```

Result: environment-qualified 10/11. The sole spawned CLI child stopped before product
inspection with `ERR_MODULE_NOT_FOUND` for `@earendil-works/pi-agent-core` because the
parent-only loader was not inherited.

```powershell
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g1-evidence-to-candidate.test.ts tests/v3g2-validate-promote-reject-rollback.test.ts
```

Result: PASS, 19/19.

```powershell
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/final-capstone-g2-regression-state-feedback.test.ts
```

Result: environment-qualified 8/10. Both spawned children stopped before product
inspection with `ERR_MODULE_NOT_FOUND` for `@earendil-works/pi-agent-core` because the
parent-only loader was not inherited.

The exact inherited absolute-loader equivalents were:

```powershell
$env:NODE_OPTIONS='--experimental-loader file:///C:/Users/HUAWEI/.codex/worktrees/v37g2-impl/project2/workbench/scripts/v35g2-public-pi-loader.mjs'
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2a-recovery.test.ts tests/v2a-cli.test.ts tests/v2a-post-audit.test.ts
```

Result: PASS, 11/11.

```powershell
$env:NODE_OPTIONS='--experimental-loader file:///C:/Users/HUAWEI/.codex/worktrees/v37g2-impl/project2/workbench/scripts/v35g2-public-pi-loader.mjs'
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/final-capstone-g2-regression-state-feedback.test.ts
```

Result: PASS, 10/10. The current remediation assertions total 51/51 across the focused,
V2-A inherited-loader, V3 and Final Capstone suites; Goal 1 is separately qualified by
the pre-assertion NTFS/Number identity stop above.

The three distinct TypeScript checks were:

```powershell
npm run typecheck
```

Result: environment stop `MODULE_NOT_FOUND`; the repository package script points to the
absent isolated-worktree path
`.runs/v0-a/pi/node_modules/typescript/bin/tsc`. No package compiler ran.

```powershell
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit
```

Result: the available compiler reached the full repository config and stopped with
`TS2688` because the isolated worktree lacks the ignored Node type declarations.

```powershell
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p ../.runs/v37/g2-types/tsconfig.json --noEmit
```

Result: PASS, zero diagnostics, with the seven changed/transitive TypeScript entries and
already configured external Node declarations.

The correction boundary checks were run from the repository root:

```powershell
git diff --check
git diff --name-only 3adb5654a24633375d3171f115e8b73d86c023ed
git diff --quiet 3adb5654a24633375d3171f115e8b73d86c023ed -- workbench/config workbench/src/state workbench/src/refinement workbench/scripts/v35g2-public-pi-loader.mjs
git diff --quiet 3adb5654a24633375d3171f115e8b73d86c023ed -- .upstream/pi reference
rg --files workbench | rg 'schema.?2|schema_2'
```

Results: `git diff --check` passed; the allowlist diff contained exactly the registered
follow-up service, focused test and two reports; configuration, Store/CAS, rollback,
older families, loader, Pi and references were byte-unchanged; the final `rg` returned no
rejected Schema 2 paths.

No product assertion failed when the already-authorized public loader was visible to
spawned child processes. No dependency was installed to alter the isolated environment.

## Remaining unverified

- No real Provider/model, Credential, network, cost or Docker behavior was exercised;
  the Goal 2 contract explicitly requires deterministic zero-access implementation.
- The repository package-script compiler path is absent; the available compiler reaches
  the full config but remains blocked by absent ignored Node declarations. The strict
  changed-surface/transitive-dependency check passed.
- The literal Goal 1 command is currently blocked before assertions by the NTFS/Number
  file-identity precision stop described above; no Goal 1 product failure was observed.
- Main review, new immutable audit-candidate freeze, fresh independent affected-finding
  re-audit and Main Goal acceptance remain pending and are not claimed.
