# V3.7 Goal 2 Audit Remediation Re-audit

```yaml
status: PASS_V3_7_G2_AUDIT_REMEDIATION_REAUDIT
audit_mode: fresh_independent_read_only_affected_finding_reaudit
audited_on: 2026-08-20
candidate_commit: b954b303770be5f3232a56cb12805fcae2a0b019
candidate_tree: 37fd1cd2df6a8f7536c644e958f22dc92e16a344
candidate_parent: 3adb5654a24633375d3171f115e8b73d86c023ed
finding: V37-G2-AUDIT-P1-001
finding_disposition: closed
new_findings: []
candidate_source_modified: false
goal_2_accepted: false
goal_3_unlocked: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_product_runs: 0
dependency_installations: 0
pi_or_reference_reads_or_changes: 0
```

## Disposition

PASS. The remediation closes `V37-G2-AUDIT-P1-001` without weakening the live
current-active boundary. An accepted follow-up now reopens against its immutable frozen
State/Decision/validation lineage after a legitimate production rollback, including
under a disabled current registration. No P1/P2 finding was identified in the affected
boundary.

This report does not accept Goal 2 or unlock Goal 3. Main retains both decisions.

## Candidate and allowlist identity

- detached `HEAD` is exactly `b954b303770be5f3232a56cb12805fcae2a0b019`;
- tree is exactly `37fd1cd2df6a8f7536c644e958f22dc92e16a344`;
- parent is exactly `3adb5654a24633375d3171f115e8b73d86c023ed`;
- the candidate is exactly one commit above the failed audit candidate;
- its delta is exactly the four Amendment-authorized paths:
  - `workbench/src/v37/registered-follow-up-v37.ts`;
  - `workbench/tests/v37g2-runtime-effective-followup.test.ts`;
  - `docs/reports/V3_7_G2_IMPLEMENTATION_REPORT.md`;
  - `docs/reports/V3_7_G2_CLOSEOUT_DRAFT.md`.

`git diff --check` passed. Configuration, contracts, profile/registry loaders, V3 State
Store/CAS/rollback, old V2/G1/V3/G2 families, V3.6 session source, Pi and references have
zero candidate delta. Rejected Schema 2 paths remain absent. The accepted Goal 1 registry,
Manifest and Envelope SHA-256 values remain respectively:

```text
cdf3b081444f3288b38b1bdb92525b5613ab068effda3c9af7848fa31d31727b
39292054a68592b5c1951e0193d428070eebc7f3700ccd6ab1f3797e2aa161c2
621efc8de7747d2d7ce8c2f780b45c271bb0b0b4dc3bbb449cf80447d1a340a3
```

## Affected-finding review

### Historical lineage after rollback

`inspectRegisteredCurrentPromotionLineageV37` still resolves the current active version
and current promotion Decision. New binding derivation, execution recomputation and new
admission continue to use that live validator, while the existing pre-first-request
active-pointer check remains unchanged.

Historical recomputation instead uses
`inspectRegisteredHistoricalPromotionLineageV37`. It resolves the frozen version by both
`state_version_id` and `active_state_digest`, resolves the promotion Decision by both ID
and digest, and requires the Decision's complete `next_active` identity to equal the
binding. The shared evidence validator retains validation-reference, validation identity,
Candidate, staged-State, base-State and promote-result checks. The full current Store is
still independently inspected and must remain structurally valid.

The focused production sequence created and admitted the registered follow-up, called
`rollbackActiveStateV3` to the exact immediate parent, and then reopened the stored
admission and canonical normalization without rewriting the follow-up tree. An independent
post-test read confirmed:

```yaml
current_active_state_version: 0
current_active_binding_revision: 2
historical_admission_integrity_valid: true
canonical_bound_state_version: 1
canonical_bound_binding_revision: 1
```

This proves that the valid later pointer is no longer substituted for the immutable
historical binding.

### Live, disabled and tamper boundaries

- after rollback, new prepare, execute and admit paths reject the no-longer-current
  promoted State and do not change the accepted follow-up tree;
- under a disabled current registration, new prepare, execute, submit and admit actions
  reject, while admission inspection and normalization reopen with the same accepted
  identities and tree digest;
- mutation of the frozen bound State version, promotion Decision or promotion-validation
  artifact still fails closed after pointer movement, and exact byte restoration returns
  the admission to valid;
- current-active pointer drift before the first Provider request still produces zero
  Provider dispatch.

## Independent deterministic verification

Run from `workbench/` unless noted:

```powershell
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g2-runtime-effective-followup.test.ts
```

PASS 11/11, run twice. The second run was the final fixture-restoring run.

```powershell
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g1-registered-recovery.test.ts
```

PASS 14/14. The NTFS Number-valued file-identity stop previously observed by Main did
not reproduce in this audit worktree.

```powershell
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2a-recovery.test.ts tests/v2a-cli.test.ts tests/v2a-post-audit.test.ts
```

Literal result: environment-qualified 10/11. The spawned CLI child did not inherit the
public Pi loader and stopped before product inspection with `ERR_MODULE_NOT_FOUND`.

```powershell
$env:NODE_OPTIONS='--experimental-loader file:///C:/Users/HUAWEI/.codex/worktrees/v37g2-remediation-reaudit/project2/workbench/scripts/v35g2-public-pi-loader.mjs'
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2a-recovery.test.ts tests/v2a-cli.test.ts tests/v2a-post-audit.test.ts
```

Inherited-loader equivalent: PASS 11/11.

```powershell
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g1-evidence-to-candidate.test.ts tests/v3g2-validate-promote-reject-rollback.test.ts
```

PASS 19/19.

```powershell
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/final-capstone-g2-regression-state-feedback.test.ts
```

Literal result: environment-qualified 8/10. Two spawned children did not inherit the
public Pi loader and stopped before product inspection with `ERR_MODULE_NOT_FOUND`.

```powershell
$env:NODE_OPTIONS='--experimental-loader file:///C:/Users/HUAWEI/.codex/worktrees/v37g2-remediation-reaudit/project2/workbench/scripts/v35g2-public-pi-loader.mjs'
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/final-capstone-g2-regression-state-feedback.test.ts
```

Inherited-loader equivalent: PASS 10/10.

The assertion aggregate is 65/65 across focused Goal 2, Goal 1, inherited-loader V2-A,
V3 and inherited-loader Final Capstone G2.

## TypeScript and environment qualifications

```powershell
npm run typecheck
```

Environment stop: the package script's isolated-worktree compiler path
`../.runs/v0-a/pi/node_modules/typescript/bin/tsc` is absent.

```powershell
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit
```

Environment stop: the available compiler reached the full repository config but emitted
`TS2688` because this detached worktree lacks ignored Node type declarations.

```powershell
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p ../.runs/v37/g2-remediation-reaudit-types/tsconfig.json --noEmit
```

PASS, zero diagnostics. The strict environment-equivalent config covers the seven
changed/transitive TypeScript entries and uses the already configured external Node/Pi
declarations. It is ignored audit-local evidence; no dependency was installed.

## Remaining unverified

- No real Credential, network, Provider/model, cost or Docker behavior was exercised;
  Goal 2 is a deterministic zero-access contract.
- The package-script and full-repository TypeScript commands retain the isolated-worktree
  environment stops above; the strict affected surface passed.
- Goal 2 final acceptance, control-state integration and Goal 3 unlock remain Main-only
  actions and were not performed by this audit.

