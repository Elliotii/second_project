# V3.7 Goal 2 Audit Remediation Main Review

```yaml
status: COMPLETED
reviewed_on: 2026-08-20
disposition: PASS_V3_7_G2_AUDIT_REMEDIATION_MAIN_REVIEW
candidate_commit: b954b303770be5f3232a56cb12805fcae2a0b019
candidate_tree: 37fd1cd2df6a8f7536c644e958f22dc92e16a344
candidate_parent: 3adb5654a24633375d3171f115e8b73d86c023ed
finding_reviewed: V37-G2-AUDIT-P1-001
new_findings: []
goal_2_accepted: false
goal_3_unlocked: false
```

## Main conclusion

Main independently reviewed the exact remediation candidate and passes it to a fresh
read-only affected-finding re-audit. This is not Goal 2 acceptance.

The candidate contains exactly one commit on the failed audit candidate and changes only
the four authorized paths. Configuration, State Store/CAS, rollback, old-family source,
loader, Pi and references are unchanged.

## Contract review

- Live derivation still resolves the current active version and current promotion
  Decision, and the existing pre-first-request active-pointer check remains unchanged.
- Historical recomputation resolves the frozen State version by version number plus
  digest and the promotion Decision by ID plus digest. It proves the Decision's exact
  `next_active` identity against the binding and retains validation-reference,
  Candidate, staged-State, base-State and promote-result checks.
- The Store inspector still validates the complete immutable decision history and the
  later current pointer. Historical inspection no longer substitutes that later pointer
  for the frozen binding.
- After production rollback, prepare/execute/admit remain blocked. After registration
  disable, prepare/execute/submit/admit remain blocked while accepted admission and
  normalization reopen read-only without tree mutation.
- Frozen State-version, promotion-Decision and validation tamper cases remain
  fail-closed after pointer movement.

No P1/P2 finding was identified in the amended boundary.

## Main deterministic verification

Run from the candidate worktree `workbench/`:

```powershell
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g2-runtime-effective-followup.test.ts
```

Result: PASS, 11/11.

With the accepted public loader inherited through `NODE_OPTIONS`:

```powershell
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2a-recovery.test.ts tests/v2a-cli.test.ts tests/v2a-post-audit.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g1-evidence-to-candidate.test.ts tests/v3g2-validate-promote-reject-rollback.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/final-capstone-g2-regression-state-feedback.test.ts
```

Results: V2-A 11/11, V3 19/19 and Final Capstone G2 10/10; 40/40.

```powershell
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p ../.runs/v37/g2-types/tsconfig.json --noEmit
```

Result: PASS, zero diagnostics for the strict seven-entry changed/transitive surface.

The literal Goal 1 command was also rerun and stopped in unchanged V2-A setup before all
14 assertions at `V2-A shared file identity rejected: test/public.test.mjs`. The
implementation session's BigInt inspection showed distinct singly linked NTFS files;
their unsafe Number-valued inode identities rounded to the same value. The candidate has
zero Goal 1 source/test/config delta, so this is recorded as an environment/filesystem
identity precision stop, not a product assertion failure or a Goal 2 regression.

The implementation report also truthfully retains the literal child-loader,
package-compiler and full-config TypeScript environment qualifications. No dependency
was installed to change the environment.

## Next action

Freeze `b954b303770be5f3232a56cb12805fcae2a0b019` /
`37fd1cd2df6a8f7536c644e958f22dc92e16a344` as the immutable Goal 2 remediation
re-audit candidate. A fresh independent Session must re-audit V37-G2-AUDIT-P1-001 and
the affected live/disabled/tamper boundaries before Main may accept Goal 2.
