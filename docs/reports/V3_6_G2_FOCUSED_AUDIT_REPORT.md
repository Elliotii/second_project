# V3.6 Goal 2 Focused Independent Audit Report

```yaml
audit: V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_PRODUCT_ACCEPTANCE
audit_baseline_commit: dfb63ee6d1b1c6a7cd79944d2318c60eab821e21
audit_baseline_tree: 452c14789f9b3d965ec8bb6bb271fe6f9045c29f
candidate_commit: 5ec7d2b0e81e54e2c8a73200e39f45ba631b244f
candidate_tree: 830fa2e28b6052c106f29252fdc6a1af5f1c9980
candidate_parent: 20dbe4c11aa5b1a64d75dfa63b6893536adb021f
goal_2_control_baseline: 992f721c4f05b7c78761966c7b8f79a6b4b3a2d3
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
tracked_candidate_status: clean
candidate_is_ancestor_of_audit_baseline: true
docker_execution_by_this_audit: forbidden_by_task_local_named_pipe_limitation
recommendation: PASS_V3_6_G2_FOCUSED_AUDIT
```

## Scope and limitation

This was a read-only, risk-triggered audit of only the four boundaries named in the
audit start prompt: current-head Change Handoff binding; terminal model token/cost
enforcement; Docker containment and ambiguous-create cleanup; and the tracked Goal 2
product entry plus safe authority gating. No source, fixture, test, Contract, Charter,
control-state, Pi checkout or candidate file was changed.

This Session did not invoke Docker and did not request elevated permission. The task-local
Docker named-pipe approval limitation made independent Docker execution unavailable. The
live runtime result below is therefore explicitly Main-assisted host execution, not
execution performed by this audit Session.

## Baseline and identity verification

Facts verified locally:

- `HEAD` was the audit baseline commit `dfb63ee6d1b1c6a7cd79944d2318c60eab821e21`.
- The audit baseline tree was `452c14789f9b3d965ec8bb6bb271fe6f9045c29f`.
- Candidate commit `5ec7d2b0e81e54e2c8a73200e39f45ba631b244f` was an ancestor of the audit
  baseline and had tree `830fa2e28b6052c106f29252fdc6a1af5f1c9980`.
- Tracked status was clean before this report was added.
- The pinned Pi checkout at `D:\AI\AI_Projects\project2\.upstream\pi` was at
  `027a5847901b5dde30270abaa1041046cd2b4b55` with clean status.
- The candidate correction delta was 14 files, 832 insertions and 174 deletions.
  The audit-baseline-only delta was the two frozen audit/implementation Session prompts.

## Files and symbols inspected

The audit read the complete required project/goal documents named by the audit prompt,
the relevant V3.6 plan sections, the candidate diff, and the following implementation
and test surfaces:

- `workbench/src/workspace/change-set-v36.ts`: `validateHandoffReceiptV36`,
  `validateSuccessfulApplyMarkerV36`, `safeChangeSetV36`,
  `performChangeHandoffV36`, `assertSessionContinuationAllowedV36` and
  `assertManagedWorkspaceHeadV36`.
- `workbench/src/session/persistent-session-v36.ts`: `parseManifestG2` and
  `PersistentInteractiveSessionServiceV36.executeBoundedTurn`.
- `workbench/src/execution/docker-v36.ts`: frozen profile validators,
  `runCli`, `DockerRegisteredCommandExecutorV36.execute`, exact-name cleanup and
  terminal digest construction.
- `workbench/src/v36/product-entry-v36g2.ts`: frozen Journey constants,
  `preflightGoal2ProductEntryV36` and `executeGoal2ProductJourneyV36`.
- `workbench/src/v36/authority-v36.ts`, `workbench/src/pi/tool-profile.ts`,
  `workbench/src/webui/application-v36g2.ts`, `workbench/src/webui/application-v36g1.ts`,
  `workbench/src/webui/server-v36g1.ts`, `workbench/src/project/registry-v36.ts`,
  `workbench/src/workspace/managed-copy-v36.ts`, `workbench/src/workspace/path-policy.ts`,
  and `workbench/src/evidence/artifacts.ts` for authority, command-ID, safe-projection,
  path, managed-copy and write-once behavior.
- `workbench/tests/v36g2-change-handoff.test.ts`,
  `workbench/tests/v36g2-bounded-session-api.test.ts`,
  `workbench/tests/v36g2-docker-executor.test.ts`, and
  `workbench/tests/v36g2-product-entry.test.ts`.

## Findings by severity

No P0, P1, P2 or P3 findings were identified in the four audited boundaries.

### Current-head Change Handoff - pass

`performChangeHandoffV36` validates the ChangeSet envelope and lineage, recomputes the
managed-workspace inventory, and rejects Apply All and Discard when the selected
ChangeSet's `final_inventory_digest` is not the current managed head. Export is the
explicit non-mutating exception. `validateHandoffReceiptV36` authenticates the receipt
digest, action, Session/ChangeSet link, status/error relation, journal order and every
journal entry against the ChangeSet. Recovery references are checked with
`validateArtifactRef`, including content digest and size. `safeChangeSetV36` also checks
before-blob file identity and content digest.

`validateSuccessfulApplyMarkerV36` authenticates the marker digest, links it to the
ChangeSet and applied receipt, and checks the Session identity. Both continuation and
handoff use that validator, so a successful Apply produces New Session guidance and a
tampered marker/receipt fails closed. The focused test passed the later-head Apply and
Discard rejection, authenticated receipt/before-blob tamper rejection, exact Apply
behavior, Discard non-mutation, Export non-mutation and truthful partial-Apply journal.

### Terminal model budget enforcement - pass

`executeBoundedTurn` accumulates assistant usage at every `message_end`, including the
final assistant response, and aborts on token/cost overflow. It checks the budget again
after harness idle and immediately before writing `manifest.json`. The over-budget
path therefore cannot produce an accepted settled Manifest even when no later provider
request occurs. The persisted Manifest is digest-authenticated and the parser rejects
invalid usage shapes; request and Tool limits remain bounded at 16 and 24.

The filtered Faux-provider test independently exercised a final-response token overflow
and cost overflow. Both rejected and neither wrote a Manifest: 1/1 focused test passed.

### Docker containment and ambiguous-create cleanup - pass, with execution limitation

`DockerRegisteredCommandExecutorV36.execute` validates the exact frozen profile, Docker
client/server/context identity and pinned image before create. Its create argv fixes
`--pull never`, `--platform linux/amd64`, `--network none`, read-only root, bounded
tmpfs, non-root identity, resource limits, dropped capabilities, no-new-privileges and
one managed-copy bind mount at `/workspace`; it uses `shell: false` and has no Host
command fallback. Post-start inspection checks the profile and one bind mount. Terminal
evidence is written once with an authenticated Authority digest and terminal digest.

Every attempted create path enters the `finally` cleanup path. Cleanup performs forced
remove followed by exact-name `container ls --all` reconciliation using
`name=^/<generated-name>$`; cleanup is terminally successful only when the exact-name
listing is empty. The deterministic injected ambiguous-create timeout seam passed and
proved both remove and exact-name absence. Static profile/image/missing-backend checks
passed 3/3 without Docker.

Main-assisted host execution, explicitly not this audit Session's execution: Main ran
`npm run v36g2:test` in the exact isolated candidate worktree
`C:\Users\HUAWEI\.codex\worktrees\7bc0\project2` with installed Docker available;
exit 0, 15/15 passed. The reported coverage included terminal token/cost cap, stale
later-head rejection, receipt/blob integrity, ambiguous-create reconciliation, exact
terminal evidence, timeout whole-container kill/cleanup, missing-backend fail-closed,
and tracked product preflight. Main also reported the exact-name
`docker ps -a --filter name=v36g2-` query empty with exit 0. No Credential, external
network, Provider or model access occurred. This audit Session did not independently
invoke Docker.

### Tracked product entry and safe authority gating - pass

`preflightGoal2ProductEntryV36` freezes the fixture digest, two Contract prompts,
registered `test` command, Docker profile, fixed provider/model profile, per-Turn and
Journey limits, and zero retry/fallback/replacement/extra-task policy. The CLI exposes a
read-only preflight mode. `executeGoal2ProductJourneyV36` requires the exact explicit
real-Journey authority and an opaque Credential resolver before preflight, evidence-root
creation, runtime identity creation, Credential resolution, model construction or
Docker dispatch. It then performs exactly two prompts in one Session and has exactly one
explicit Apply All path gated by a non-empty current ChangeSet and a passing frozen
verifier.

The safe Session/ChangeSet/API projections expose opaque IDs/digests, bounded diffs,
backend identity and unverified status. They do not expose Source roots, Docker CLI
configuration, raw Authority or Credential material. Browser task and handoff schemas
reject extra fields; command execution resolves only a registered command ID, with no
model/browser argv, shell, environment, path, image, mount or policy input.

The tracked product preflight test passed 1/1, including wrong-authority fail-closed
ordering with zero Credential/model calls and absent data/evidence roots. The secret
scan over the 14-file candidate correction delta found zero matches.

## Commands and results

All commands below were run read-only from the audit worktree unless stated otherwise.

| Command | Exit | Result |
|---|---:|---|
| Git HEAD/tree/status and candidate-ancestor verification | 0 | exact identities; clean tracked state; candidate ancestor true |
| Pinned Pi commit/status check | 0 | `027a5847901b5dde30270abaa1041046cd2b4b55`; clean |
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.v35g2.json --noEmit` | 0 | strict TypeScript passed |
| Focused Change Handoff test file | 0 | 6/6 passed |
| Final-response budget test-name filter | 0 | 1/1 passed; token and cost cases rejected before Manifest |
| Product-entry test file | 0 | 1/1 passed; zero-call preflight and authority gate |
| Docker test-name filter: profile, ambiguous create, missing backend | 0 | 3/3 passed without Docker |
| Candidate correction secret scan | 0 | 14 files, 0 matches |
| `git diff --check` against candidate parent | 0 | no whitespace errors |
| Main-assisted `npm run v36g2:test` in the exact isolated candidate worktree | 0 | 15/15 passed; see Docker limitation above |
| Main-assisted exact-name `docker ps -a --filter name=v36g2-` | 0 | empty; no reported leftovers |

Audit-Session access counts were Credential reads `0`, external network requests `0`,
external Provider calls `0`, and real-model calls `0`. Main-assisted deterministic
runtime counts were also reported as Credential `0`, external network `0`, Provider/model
`0`, and real-model `0`.

## Remaining limitations versus Contract claims

- This audit did not independently run Docker because of the task-local named-pipe
  approval limitation. Live containment, timeout and final cleanup are therefore based
  on Main-assisted host execution plus source and deterministic seam evidence.
- The real external two-Turn Journey and real-model coding quality remain unexecuted;
  the tracked product entry is preflighted and ready but not real-accepted.
- Process-crash durability between Source mutation and caught receipt/marker persistence
  remains unproven. Apply is not claimed atomic, does not claim automatic rollback, and
  does not claim exactly-once effects.
- General Docker daemon, Docker Desktop VM, host-kernel or administrator compromise,
  multi-backend portability, production multi-user isolation and statistical coding
  effectiveness remain outside the frozen Goal 2 claim.

## Recommendation

`PASS_V3_6_G2_FOCUSED_AUDIT`
