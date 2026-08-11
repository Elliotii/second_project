# V3.6 Goal 2 Implementation Report

```yaml
status: corrected_implementation_complete_pending_main_review
goal_id: V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_PRODUCT_ACCEPTANCE
control_baseline_commit: 992f721c4f05b7c78761966c7b8f79a6b4b3a2d3
control_baseline_tree: be96881831af1355cabdf4ffb0a617ed2bc35159
initial_implementation_commit: 20dbe4c11aa5b1a64d75dfa63b6893536adb021f
initial_implementation_tree: dc3a062d97800d534ca2508edb09a48e1e5affd1
correction_parent_commit: 20dbe4c11aa5b1a64d75dfa63b6893536adb021f
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
implementation_owner: dedicated_top_level_goal_2_session
recommended_disposition: PASS_V3_6_G2_CORRECTED_DETERMINISTIC_IMPLEMENTATION_PENDING_MAIN_REVIEW
goal_acceptance_owner: Main_Session
correction_commit: exact_commit_reported_in_session_handoff_and_ignored_commit_identity
credential_reads: 0
external_provider_calls: 0
real_model_calls: 0
container_network_mode: none
pi_core_patches: 0
real_two_turn_journey_executed: false
```

## 1. Outcome

**Fact:** Main's bounded review identified four Contract-local defects in the initial implementation commit. The correction implements all four without changing the frozen backend, image, Provider/model route, Pi Core, control files, or real-execution authority.

**Fact:** The corrected implementation now binds Apply All and Discard to the freshly authenticated current managed-workspace head; rejects an over-budget final assistant response before a settled Manifest can be accepted; reconciles every attempted Docker create by exact container name before claiming cleanup; and supplies a tracked, zero-call-preflighted Goal 2 product composition entry for the later fresh no-source-edit Execution Session.

**Fact:** The corrected deterministic suite passed 15/15 Goal 2 tests and 64/64 affected regressions. Docker tests used only the exact accepted local image with `--pull never` and runtime `--network none`. Credential reads, external Provider calls and real-model calls were exactly zero. The real two-Turn Journey was not run.

**Recommendation:** Main should review the corrected two-commit Candidate and ignored correction evidence. This Session does not accept Goal 2/V3.6, create an Execution Baseline, or authorize the real Journey.

## 2. Baselines and correction gate

The initial implementation was created from the exact Control Baseline and is preserved at `20dbe4c11aa5b1a64d75dfa63b6893536adb021f`. Before correction, this Session verified that exact HEAD/tree, a clean tracked status, and pinned Pi `027a5847901b5dde30270abaa1041046cd2b4b55` clean. The ignored correction gate is `.runs/v3-6/g2/correction/gate.json`, SHA-256 `111866bfe1a232004e9349e5a9f248f3376f5c9f113982462e4a6eea28d7152f`.

The accepted Docker Desktop/client/server/context/image remained unchanged. No image pull or alternate backend selection occurred. The Docker executable remained Host-only configuration and is not projected into safe product or evidence views.

## 3. Corrected implementation

### Current-head handoff and safe integrity

- Apply All and Discard recompute `managedWorkspaceInventoryV36(context.workspace_root)` and require its authenticated `inventory_digest` to equal the selected persisted ChangeSet's `final_inventory_digest`. A historical ChangeSet cannot mutate or terminalize Source after a later Turn.
- Export remains non-mutating and may export a valid historical immutable ChangeSet; it does not bypass envelope/blob validation.
- Handoff receipt projection validates exact shape, content digest, Session, ChangeSet, action, status, source identity, error semantics, and journal/recovery references before exposing status.
- Diff projection authenticates each initial before blob against its declared SHA-256 before projecting text.
- Continuation derives from the validated Session-wide successful-Apply marker, including its marker digest and referenced applied receipt, rather than only the selected ChangeSet receipt.
- A two-ChangeSet test proves stale Apply All and Discard reject with zero Source mutation while historical Export succeeds. Additional tamper tests cover receipt and before-blob rejection.

### Final-response budget enforcement

- `executeBoundedTurn` enforces the frozen `131072` combined-token and USD `0.20` per-Turn caps immediately after every assistant usage update, after harness completion, and immediately before Manifest persistence.
- An overrun aborts/fails closed and cannot leave an accepted `manifest.json`, including when the final assistant response is the first event to exceed the cap.
- Deterministic Faux tests independently exceed the token and cost caps and prove no accepted Manifest. The 16 Provider-request and 24 Tool-invocation caps remain unchanged.

### Ambiguous Docker create cleanup

- Every path on which Docker create was attempted performs exact-name forced removal and then exact-name `container ls --all` reconciliation.
- `cleanup_complete` may be true only when the named container is proven absent after reconciliation; `created === false` is never treated as absence proof.
- A small Host-only/default-compatible Docker CLI seam supports a deterministic ambiguous-create test. The production default remains `spawn` with `shell: false`, the same argv authority, exact image, and no fallback/backend.
- The seam test simulates a create timeout after daemon-side creation and proves exact-name removal plus absence reconciliation. Live success/nonzero/timeout tests and the final leftover query also passed.

### Tracked Goal 2 product composition entry

The tracked entry reuses the Goal 2 control-plane adapter, frozen Docker executor, loopback API/WebUI and existing fixed DeepSeek provider/model factory. It freezes and validates:

- fixture inventory digest `f33080d10d63591317743b36da633662a9c6c6e7c063dfbdfe7a42aa221ea9eb` for the three-file dependency-free duration-parser fixture;
- registered command `test` as Host-owned `node --test`, with the frozen Docker profile;
- the two accepted Contract prompts in order and the same persistent Session;
- per-Turn limits of 16 Provider requests, 24 Tool calls, 131072 combined tokens, USD 0.20 and 900000 ms;
- whole-Journey limits of 32 Provider requests, 48 Tool calls, 262144 combined tokens, USD 0.40, 1800000 ms and at most two lazy Credential resolutions;
- zero retry, fallback, replacement or extra task;
- Apply only after a valid non-empty current ChangeSet and frozen Docker verifier pass.

The entry fails before data/evidence/runtime identity creation, Credential resolution, Provider/model construction/call, Docker execution, Source mutation or network activity unless passed the exact explicit real-authority token and an explicit lazy Credential resolver. The tracked CLI exposes a read-only `preflight` mode and the separately governed `run` mode. The zero-call preflight projection is `.runs/v3-6/g2/correction/product-preflight.json`, SHA-256 `16033e50f38e65b6937359c6117e365f020bee0d90fa628026cf12081c18ce94`.

### Apply recovery truthfulness

**Fact:** Before Source mutation, Apply validates the full set and persists content-addressed recovery blobs for affected preimages. On a caught mutation failure it writes a truthful receipt/journal containing applied/not-applied states and recovery references.

**Fact:** There is no write-once pre-mutation Apply plan/journal. A process crash between mutation and receipt persistence is not proven recoverable. The implementation and reports do not claim process-crash durability, automatic rollback, or atomic multi-file Apply.

## 4. Verification

All commands ran from `workbench/` except Git/Pi/status checks. The Docker environment variable was assigned the Contract-provided Host-only executable.

| Command | Exit | Result |
|---|---:|---|
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.v35g2.json --noEmit` | 0 | strict TypeScript passed |
| `$env:V36_DOCKER_EXECUTABLE='<Contract Host-only executable>'; npm.cmd run v36g2:test` | 0 | corrected Goal 2: 15 passed, 0 failed/skipped |
| `npm.cmd run v36g1:test` | 0 | Goal 1: 9/9 |
| `node --experimental-loader ./scripts/v36g1-regression-loader.mjs --test --test-concurrency=1 tests/v35-persistent-session.test.ts` | 0 | V3.5 persistent Session: 6/6 |
| `npm.cmd run v35g3:test` | 0 | V3.5 Goal 3: 11/11 |
| `npm.cmd run postv35:enablement:test` | 0 | Post-V3.5: 11/11 |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g1-evidence-to-candidate.test.ts tests/v3g2-validate-promote-reject-rollback.test.ts` | 0 | V3 Goal 1/2: 19/19 |
| same loader with `tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts` | 0 | V3 Goal 3: 8/8 |
| exact Docker `container ls --all --filter name=v36g2- --format '{{.Names}}'` | 0 | empty; zero leftover Goal containers |
| `git diff --check` | 0 | no whitespace errors |
| existing `v36g1-secret-scan.ts` over the complete correction delta | 0 | zero matches |

Final result: **79 passed, 0 failed, 0 skipped** (`15` corrected Goal 2 + `64` affected regressions). The ignored verification summary is `.runs/v3-6/g2/correction/verification-summary.json`, SHA-256 `64c0e8642f9d53cbf41da542e88c71f1afd62551184d9619d75c3c7d929bcf01`.

## 5. Evidence Index and key digests

Correction Evidence Index: `.runs/v3-6/g2/correction/evidence-index.json`, SHA-256 `cd15b0f442cdfa1c9c69666d8137828e091f0539c0bf068cbaafebd50f1db3fa`.

- ambiguous-create Authority/terminal: `ac4b2882c3d2283b8b677cde755d47feea46b07d655aa39301bf3aae3feaee10` / `03c06ca4a30463e2985d1c9c41b540caa23919baa8737c370456d8ca05beb154`;
- live timeout terminal: `350b22040c6ff2b88bc1b911c310940f69c2293fdacbb83ae644b9d0d3b78fc9`;
- corrected integrated Turn terminals: `35bb26feede07b6965ee697fc624280ecfbe95594fcb50f13fcb777abca2ffa8` / `fc41d6ad11b32fb04513b6e593fcbac3988f267850c83794f2c3a014695665fb`;
- validated successful-Apply marker: `ecbe7c0f1682ad31d0e51d883975fc25d361550ae8f83e68a0e004a59f72466c`;
- caught partial-Apply receipt: `5ae555715f19b16269afc0bfc438e1a6601a8cb39fbefda2094beb5f047d5317`.

The correction commit/tree are emitted in the Session handoff and written after commit to ignored `.runs/v3-6/g2/correction/commit-identity.json`. A tracked report cannot contain its own commit identity without self-reference.

## 6. Source Delta

The correction delta atop `20dbe4c11aa5b1a64d75dfa63b6893536adb021f` is **14 files changed, 832 insertions and 174 deletions** and remains within the Contract allowlist:

- current-head, safe-integrity and successful-Apply validation;
- final-response budget enforcement and Faux overrun tests;
- ambiguous Docker-create cleanup reconciliation and seam test;
- tracked product composition/CLI, zero-call preflight test and documentation;
- corrected Implementation Report and Closeout Draft.

No `CURRENT_STATE.md`, `AGENTS.md`, Charter, Contract, accepted Closeout, Credential, Pi, tracked reference, State/Verifier authority, or registered external Source was modified.

## 7. Remaining limitations

**Unconfirmed:** The real two-Turn Journey, external Provider behavior and real-model coding quality remain unexecuted and unverified. They require Main acceptance, an exact Execution Baseline and the separately authorized fresh no-source-edit Execution Session.

**Fact:** Process-crash durability between Source mutation and caught-failure receipt persistence remains unproven. Apply is not multi-file atomic and has no automatic rollback.

**Fact:** The result does not prove general container security, multi-backend portability, exactly-once Tool effects, production multi-user isolation or statistical coding effectiveness. The executor remains tied to the accepted Docker host/profile/image and fails closed on drift.

## 8. CURRENT_STATE_UPDATE_PROPOSAL

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  active_goal: V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_PRODUCT_ACCEPTANCE
  goal_2_status: corrected_deterministic_implementation_complete_pending_main_review
  goal_2_control_baseline_commit: 992f721c4f05b7c78761966c7b8f79a6b4b3a2d3
  goal_2_initial_implementation_commit: 20dbe4c11aa5b1a64d75dfa63b6893536adb021f
  goal_2_correction_commit: use_exact_commit_from_session_handoff
  goal_2_correction_tree: use_exact_tree_from_session_handoff
  goal_2_recommended_disposition: PASS_V3_6_G2_CORRECTED_DETERMINISTIC_IMPLEMENTATION_PENDING_MAIN_REVIEW
  goal_2_strict_typescript: passed
  goal_2_focused_tests: 15_passed_0_failed_0_skipped
  goal_2_affected_regressions: 64_passed_0_failed_0_skipped
  goal_2_total_tests: 79_passed_0_failed_0_skipped
  goal_2_docker_cleanup: zero_v36g2_containers
  goal_2_evidence_index_sha256: cd15b0f442cdfa1c9c69666d8137828e091f0539c0bf068cbaafebd50f1db3fa
  goal_2_fixture_inventory_digest: f33080d10d63591317743b36da633662a9c6c6e7c063dfbdfe7a42aa221ea9eb
  goal_2_product_entry: tracked_zero_call_preflight_passed_ready_for_fresh_no_source_edit_execution_session
  goal_2_credential_reads: 0
  goal_2_external_provider_calls: 0
  goal_2_real_model_calls: 0
  goal_2_container_network_mode: none
  goal_2_pi_core_patches: 0
  goal_2_real_two_turn_journey: not_executed_requires_main_acceptance_and_execution_baseline
  goal_2_process_crash_recovery: unproven
  goal_2_acceptance_owner: Main_Session
  v3_6_status: active_goal_2_real_acceptance_not_yet_run
```
