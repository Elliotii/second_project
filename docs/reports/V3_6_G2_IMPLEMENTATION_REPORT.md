# V3.6 Goal 2 Implementation Report

```yaml
status: implementation_complete_pending_main_review
goal_id: V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_PRODUCT_ACCEPTANCE
control_baseline_commit: 992f721c4f05b7c78761966c7b8f79a6b4b3a2d3
control_baseline_tree: be96881831af1355cabdf4ffb0a617ed2bc35159
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
implementation_owner: dedicated_top_level_goal_2_session
recommended_disposition: PASS_V3_6_G2_DETERMINISTIC_IMPLEMENTATION_PENDING_MAIN_REVIEW
goal_acceptance_owner: Main_Session
implementation_commit: resulting_single_commit_reported_in_session_handoff_and_ignored_commit_identity
credential_reads: 0
external_provider_calls: 0
real_model_calls: 0
container_network_mode: none
pi_core_patches: 0
real_two_turn_journey_executed: false
```

## 1. Outcome

**Fact:** The accepted deterministic Goal 2 scope is implemented from the exact Control Baseline. The Goal 1 control plane can now opt into one frozen Docker registered-command backend for `bounded_edit`, keep all writes inside the link-free managed Session copy, persist immutable backend terminal evidence, derive an immutable content-addressed ChangeSet, and expose only explicit Host-controlled Apply All, Discard or Export.

**Fact:** Browser/model input still supplies only the exact safe task fields and a visible registered command ID. The Host owns executable, argv, image, mount, environment, backend profile and budget. Docker uses `spawn(..., { shell: false })`; there is no Host command fallback or second backend.

**Fact:** The deterministic representative flow ran two settled Faux Turns through public Pi `AgentHarness` and one persistent public JSONL Session. Both registered commands ran in separate `--network none` containers, produced immutable Authority/terminal evidence, and were removed. The resulting non-empty ChangeSet was applied exactly once through the Host handoff. The flow remained `unverified`, had no formal Outcome, and made zero Credential, external Provider or real-model calls.

**Recommendation:** Main may review the single Candidate commit and deterministic evidence for Goal 2 acceptance and, only after acceptance, create the separately governed Execution Baseline. This Session does not accept Goal 2/V3.6 and does not authorize or perform the real two-Turn Journey.

## 2. Gate A and frozen identities

Gate A completed before editing. Its ignored record is `.runs/v3-6/g2/gate-a.json`, SHA-256 `c1820f42b2a6edf6dc7257606a7c8911b10be6cdca57c41d2034ab86069b9295`.

| Check | Observed result |
|---|---|
| Git commit/tree | `992f721c4f05b7c78761966c7b8f79a6b4b3a2d3` / `be96881831af1355cabdf4ffb0a617ed2bc35159` |
| tracked status | clean |
| pinned Pi commit/status | `027a5847901b5dde30270abaa1041046cd2b4b55` / clean |
| Docker Desktop | `4.85.0 (235549)` |
| Docker client/server/context | `29.6.2` / `29.6.2` / `desktop-linux` |
| exact local image | `node@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03` |
| image pull policy | `never`; no pull performed |
| credential/network-provider/real-model counts | `0/0/0` |

The Docker executable path remained Host-only configuration. It is intentionally absent from browser/model input, safe Session views, Docker Authority/terminal evidence and the Evidence Index.

## 3. Implementation

### Frozen Docker registered-command executor

- `DockerRegisteredCommandExecutorV36` authenticates the canonical link-free managed copy before execution and writes content-digested Authority before Docker runtime preflight or container creation.
- Runtime preflight requires the exact context, client/server versions, Docker Desktop build, local image digest, OS and architecture. Profile, version, context and image drift fail closed.
- The executor creates one disposable Linux/amd64 container with `--pull never`, `--network none`, read-only root, bounded no-exec `/tmp`, user `65532:65532`, 0.5 CPU, 512 MiB memory/swap, 64 PIDs, nofile 1024, all capabilities dropped and no-new-privileges.
- Exactly one read-write bind is allowed: the canonical managed Session copy at `/workspace`. Inspect evidence revalidates the runtime profile before accepting terminal status.
- Stdout and stderr remain distinct, combined output is bounded at 65,536 bytes, nonzero exit and truncation are explicit, and the 30-second wall timeout kills the container (including its descendants) before exact forced removal.
- Terminal evidence records create/start/output/inspect/timeout/kill/remove truthfully. Missing Docker fails after Authority with no command fallback.

### Public Pi Session and bounded tools

- The optional executor seam in `createBoundedToolProfile` is additive and default-compatible. Goal 2 activates exactly `workspace_read`, `workspace_list`, `workspace_search`, `workspace_edit`, `workspace_write` and `run_command`; repository-command fallback remains disabled.
- A bounded Turn must settle once, preserve prior Session context, close every Tool lifecycle, respect request/tool/token/cost limits, execute at least one registered command, and present terminal evidence bound to the exact frozen Docker profile digest.
- **Fact (pinned Pi source):** public exports are re-exported by `D:/AI/AI_Projects/project2/.upstream/pi/packages/agent/src/index.ts` (`AgentHarness` at line 6 and `JsonlSessionRepo` at line 32); their implementations are `harness/agent-harness.ts:171` and `harness/session/jsonl-repo.ts:38`. The relevant product call is `PersistentInteractiveSessionServiceV36.executeBoundedTurn`; `v36g2-bounded-session-api.test.ts` proves the two-Turn persistent path.
- Goal 1 remains the default when the Goal 2 extension is absent. The nine Goal 1 tests and affected V3/V3.5/Post-V3.5 regressions passed unchanged.

### Managed copy, immutable ChangeSet and Host handoff

- Session creation persists the authenticated initial inventory and content-addressed initial blobs. Managed inventory rejects `.git`, links, hardlinks, unsupported files and frozen count/byte-limit overflow.
- ChangeSet formation compares authenticated initial/final inventories, accepts only policy-writable non-protected paths, and writes immutable add/modify/delete entries plus content-addressed after blobs.
- Safe Changes/Diff projections are bounded and omit Host paths and binary contents.
- The handoff parser accepts exactly `session_id`, `change_set_digest` and `action`. Browser/agent/container cannot provide a path, patch, bytes, Source root or override.
- Apply validates the complete envelope, lineage, scope, protected/traversal/reparse/hardlink boundaries, add absence, modify/delete preimages and every referenced blob before its first Source mutation.
- Add/modify use same-directory temporary files and rename. Recovery blobs and an initial journal are persisted before mutation. Injected mid-apply failure returns `partial_apply_error` with exact applied/not-applied states and recovery refs; it is never called atomic.
- Discard terminalizes only that ChangeSet and leaves Source unchanged. Export returns the immutable envelope and blobs without Source mutation. One successful Apply terminalizes the Session; second Apply and continuation reject with New Session guidance.

### Safe API, bilingual WebUI and fixture

- The additive Goal 2 application wraps the accepted loopback-only Goal 1 surface. `POST /api/v1/v36/handoff` is available only when the Host supplies the Goal 2 extension and validates the exact handoff schema.
- The WebUI explains managed-copy-only execution, frozen network-disabled Docker, unverified semantics and explicit Source handoff. It renders bounded backend, image, network, Files, Changes and Diff views plus bilingual Apply All/Discard/Export controls.
- The dependency-free fixture is frozen at `workbench/fixtures/v36g2/duration-parser/`: 3 files, 1,210 bytes, inventory digest `f33080d10d63591317743b36da633662a9c6c6e7c063dfbdfe7a42aa221ea9eb`. Its only registered command is `node --test`; only `src/parse-duration.js` is writable.

## 4. Verification commands and results

All test commands ran from `workbench/` unless stated otherwise.

| Command | Exit | Result |
|---|---:|---|
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.v35g2.json --noEmit` | 0 | strict TypeScript passed |
| `$env:V36_DOCKER_EXECUTABLE='<Host-only exact path>'; npm.cmd run v36g2:test` | 0 | 10 passed, 0 failed/skipped |
| `npm.cmd run v36g1:test` | 0 | Goal 1 regression 9/9 |
| `node --experimental-loader ./scripts/v36g1-regression-loader.mjs --test --test-concurrency=1 tests/v35-persistent-session.test.ts` | 0 | V3.5 persistent Session regression 6/6 |
| `npm.cmd run v35g3:test` | 0 | V3.5 Goal 3 regression 11/11 |
| `npm.cmd run postv35:enablement:test` | 0 | Post-V3.5 enablement regression 11/11 |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g1-evidence-to-candidate.test.ts tests/v3g2-validate-promote-reject-rollback.test.ts` | 0 | V3 Goal 1/2 regression 19/19 |
| same loader with `tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts` | 0 | V3 Goal 3 regression 8/8 |
| exact Docker CLI `container ls --all --filter name=v36g2- --format '{{.Names}}'` | 0 | empty output; zero leftover Goal containers |
| `git diff --check` | 0 | no whitespace errors |
| existing `v36g1-secret-scan.ts` over the complete final tracked delta | 0 | 24 files scanned; zero matches |

Combined final test result: **74 passed, 0 failed, 0 skipped** (`10` Goal 2 + `64` affected regressions). The Goal 2 suite includes five Docker boundary/lifecycle tests, four ChangeSet/handoff tests and one integrated two-Turn Session/API test.

One earlier combined V3 regression invocation ran inside the restricted worktree sandbox: 21 assertions passed and two V3-G3 cases could not create their historical ignored fixture under the primary checkout (`EPERM`). The exact V3-G3 pair was rerun with the required filesystem permission and passed 8/8. One early npm Goal 2 wrapper also produced no output and remained alive beyond the bounded suite time; it was terminated, its files were then isolated successfully, the package script was made explicit rather than glob-based, and the final exact npm command passed 10/10. Neither intermediate event is used as acceptance evidence.

## 5. Raw evidence and important digests

Canonical ignored root: `.runs/v3-6/g2/`.

- Evidence Index: `.runs/v3-6/g2/evidence-index.json`, SHA-256 `4ea92120ad58ba541959a6c7eb59f89ffa62e02b9d9a73bca098bf50bfb911bd`
- Verification summary: `.runs/v3-6/g2/verification-summary.json`, SHA-256 `f299d08a687ab0d13c3747f00ea33d40431fd7d552a6d7d3c237580bd33ddd5d`
- Gate A: `c1820f42b2a6edf6dc7257606a7c8911b10be6cdca57c41d2034ab86069b9295`
- Representative fixture inventory: `f33080d10d63591317743b36da633662a9c6c6e7c063dfbdfe7a42aa221ea9eb`
- Docker success terminal: `aef2bcc1d0b3e8d65a3e84c4bc766e5a3ae908633654d4551779afdbd1125be5`
- Docker timeout/kill/remove terminal: `c6acc023a0f06c944302b99494582f67f21661e96145b5106b195415110b36f3`
- Docker missing/no-fallback terminal: `9e8e9ebd31f232a0de0261311ca12254f09e36906250865c72be9b8175a182aa`
- Integrated Turn 1/Turn 2 terminals: `0df0ce9785edc685333abb787ebf59b8fed9d92caeb9e4e985a4bfd85d086316` / `a02dcd022a036f4d176a5625f4ab395e4a9bb472e36d4432a9c0f892776a0516`
- Single successful Apply marker: `98e704c780eb0dbaad9f740a6ef2de72edd0160a41491f8f571f9ca72a939722`
- Injected partial-apply receipt: `5ae555715f19b16269afc0bfc438e1a6601a8cb39fbefda2094beb5f047d5317`

The final commit SHA/tree are emitted in the Session handoff and written after commit to ignored `.runs/v3-6/g2/commit-identity.json`. A tracked report cannot contain the SHA/tree of its own commit without self-reference.

## 6. Source Delta

The final staged delta is **24 files, 1,738 insertions and 49 deletions** and is limited to the Contract allowlist:

- new Goal 2 types, frozen Docker executor, ChangeSet/handoff module and Goal 2 application adapter;
- bounded additive changes to the Goal 1 registry/control plane/persistent Session/API/static UI and the optional tool executor seam;
- one dependency-free `duration-parser` fixture and three Goal 2 test files;
- additive package/README documentation and these two Goal reports.

No `CURRENT_STATE.md`, `AGENTS.md`, Charter, Contract, accepted Closeout, Credential, Pi, tracked reference, accepted State/Verifier/promotion authority or external registered Source was modified.

## 7. Remaining limitations and decisions

**Fact:** Deterministic evidence proves the frozen local Docker backend and Faux public-Pi Session composition only. It does not prove the separately governed real-model two-Turn Journey, real-model coding quality, external Provider behavior, production multi-user isolation, crash recovery, exactly-once Tool effects, general container security, multi-backend portability or statistical effectiveness.

**Fact:** Apply is deliberately not multi-file atomic. It validates the whole set before mutation and preserves truthful recovery material after a partial failure, but automatic rollback is not implemented.

**Fact:** The Docker frontend is pinned to the accepted host versions/build/context and exact local image. Version/image/platform drift requires Main review; the executor does not pull or select a substitute.

**Fact:** The safe Diff is intentionally bounded and omits binary content. Managed Sources exceeding the frozen file/byte limits, or containing links/hardlinks/unsupported kinds, fail closed.

**Recommendation:** No concrete unresolved command-execution, safe-projection or Source-Apply risk remains that independently requires an audit under the Contract. Main retains the risk-driven audit decision and all acceptance authority.

**Unconfirmed:** The real two-Turn product Journey remains unexecuted. Main must first review/accept deterministic Goal 2, create the exact Execution Baseline, and hand off to the separately authorized fresh no-source-edit Execution Session.

## 8. CURRENT_STATE_UPDATE_PROPOSAL

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  active_goal: V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_PRODUCT_ACCEPTANCE
  goal_2_status: deterministic_implementation_complete_pending_main_review
  goal_2_implementation_owner: dedicated_top_level_goal_2_session
  goal_2_control_baseline_commit: 992f721c4f05b7c78761966c7b8f79a6b4b3a2d3
  goal_2_control_baseline_tree: be96881831af1355cabdf4ffb0a617ed2bc35159
  goal_2_implementation_commit: use_exact_commit_from_session_handoff
  goal_2_implementation_tree: use_exact_tree_from_session_handoff
  goal_2_recommended_disposition: PASS_V3_6_G2_DETERMINISTIC_IMPLEMENTATION_PENDING_MAIN_REVIEW
  goal_2_strict_typescript: passed
  goal_2_focused_tests: 10_passed_0_failed_0_skipped
  goal_2_affected_regressions: 64_passed_0_failed_0_skipped
  goal_2_total_tests: 74_passed_0_failed_0_skipped
  goal_2_docker_cleanup: zero_v36g2_containers
  goal_2_evidence_index_sha256: 4ea92120ad58ba541959a6c7eb59f89ffa62e02b9d9a73bca098bf50bfb911bd
  goal_2_fixture_inventory_digest: f33080d10d63591317743b36da633662a9c6c6e7c063dfbdfe7a42aa221ea9eb
  goal_2_credential_reads: 0
  goal_2_external_provider_calls: 0
  goal_2_real_model_calls: 0
  goal_2_container_network_mode: none
  goal_2_pi_core_patches: 0
  goal_2_real_two_turn_journey: not_executed_requires_main_acceptance_and_execution_baseline
  goal_2_audit_trigger: no_concrete_unresolved_high_risk_finding
  goal_2_acceptance_owner: Main_Session
  v3_6_status: active_goal_2_real_acceptance_not_yet_run
```
