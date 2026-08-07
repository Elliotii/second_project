# V3.5 Goal 1 Implementation Report

## Status

- Goal: `V3_5_G1_PERSISTENT_SESSION_RUN_FOUNDATION`
- Session role: dedicated top-level Implementation Session
- Disposition: `READY_FOR_MAIN_REVIEW`
- Parent Control Baseline: `745847d3f9e9579ea98a2d64c657b4c9d3ee91d1`
- Parent tree: `c183d69ab1a6298fc17fde0bb447b882c8a3fef1`
- Implementation commit: `4122b3cb88c2e35b946e4129d5977c0fdb2c7309`
- Bounded correction parent: `4122b3cb88c2e35b946e4129d5977c0fdb2c7309`
- Bounded correction commit: `CORRECTION_COMMIT_OF_THIS_REVISION`

The exact correction commit SHA is returned to Main after the authorized follow-up commit is created. A commit cannot contain its own SHA because the report bytes participate in that SHA.

## Gate A

`Fact`: before editing, the worktree HEAD and tree exactly matched the required Control Baseline and the tracked worktree was clean. The fresh worktree did not contain `.upstream/pi`; the start prompt's authorized read-only hydrated Pi checkout was used instead. Its HEAD was `027a5847901b5dde30270abaa1041046cd2b4b55` and its tracked status was clean. Public emitted imports succeeded through an ignored local loader. No Hard Stop was reached.

## Source Delta

- `workbench/src/contracts/v35-types.ts`: schema-versioned Session catalog, Run manifest, safe projection, and Read Model contracts.
- `workbench/src/session/persistent-session-v35.ts`: public Pi JSONL Session create/list/open/continue service, immutable Run linkage, validation, safe projection, and deterministic Faux turn.
- `workbench/src/read-model/read-model-v35.ts`: versioned current/legacy adapters and explicit unavailable Goal 2 comparison.
- `workbench/scripts/v35-session-cli.ts`: narrow `create`, `list`, `continue`, and `inspect` application surface.
- `workbench/tests/v35-persistent-session.test.ts`: focused cross-process, safety, fail-closed, adapter, and authority tests.
- `workbench/package.json`: focused `v35g1:test` command.
- `docs/reports/V3_5_G1_IMPLEMENTATION_REPORT.md` and `docs/reports/V3_5_G1_CLOSEOUT_DRAFT.md`: implementation evidence and Main-owned closeout draft.

No accepted control artifact, `.upstream/pi`, reference material, dependency tree, or `.runs` artifact is part of the tracked delta.

## Main Review finding and bounded correction

`Fact`: Main reproduced one correctness/security defect in the original implementation commit. `read-model-v35.ts` checked lexical containment and the final ordinary file, but did not reject a directory junction in an intermediate source-reference segment. A junction below `sourceRoot` could therefore expose an ordinary file outside that root to `readLegacyRunFallbackV35`.

`Fact`: the bounded correction adds segment-by-segment validation to every Read Model candidate path, rejecting any existing symlink, Windows directory junction, or reparse path. A final ordinary file is canonicalized and its canonical path must remain within the canonical `sourceRoot`. Existing lexical traversal, drive/absolute-path, missing-source, and final-link/ordinary-file checks remain fail closed. Catalog semantics and V2/V3 adapter semantics are unchanged.

`Fact`: a focused, non-skipped regression constructs an actual Windows directory junction and proves both `linked/package.json` intermediate escape and a final junction are rejected. The existing ordinary-file path still succeeds; traversal and absolute paths remain rejected.

## Architecture and mechanism

`Fact`: `PersistentSessionServiceV35` uses public emitted `JsonlSessionRepo` and direct public `AgentHarness`; it has no Pi private import or Pi patch. The full Pi JSONL Session remains local Runtime conversation/context authority. Each immutable Workbench Run manifest remains execution/evaluation authority. `catalog-v1.json` is only schema-versioned navigation metadata with relative references.

Create/continue runs follow this boundary:

1. validate project, workspace, path, Session, parent, catalog, and Run identities;
2. create or open the public Pi JSONL Session;
3. reconstruct context with Pi and run one deterministic Faux `AgentHarness` turn;
4. persist one bounded Tool call/result and a final assistant message;
5. write one immutable Run manifest containing the Session prefix count/digest, context evidence, linkage, and zero-access counters;
6. update only the catalog's navigation references;
7. inspect by independently reopening Pi JSONL and revalidating every Run against its declared historical Session prefix.

Process B's provider callback receives the reconstructed prior message prefix and records its digest. The Run B manifest requires that digest to equal the service-computed prior-context digest. This proves prior context reconstruction, rather than reuse of only a Session identifier.

The safe projection allowlists user/assistant text, bounded Tool result text, and Tool name/ID plus argument digest. It strips reasoning blocks/signatures, unknown raw provider fields, credential-like material, and absolute Windows, UNC, or Unix paths. Consumer-facing references are relative.

Read Model adapters expose the current persistent Session/Run shape, a representative V2 recovery comparison, V3 prompt-adaptation lineage, an explicit Goal 2 `unavailable` placeholder, and legacy `not_recorded`/`unavailable` fallbacks. They do not migrate or overwrite historical authority.

## Exact verification commands and results

All commands ran from the Goal worktree unless a different working directory is stated.

1. Gate A identity:

   `git rev-parse HEAD`

   Exit `0`; `745847d3f9e9579ea98a2d64c657b4c9d3ee91d1`.

   `git rev-parse HEAD^{tree}`

   Exit `0`; `c183d69ab1a6298fc17fde0bb447b882c8a3fef1`.

2. Hydrated Pi identity and cleanliness:

   `git -C D:\AI\AI_Projects\project2\.runs\g006\pi rev-parse HEAD`

   Exit `0`; `027a5847901b5dde30270abaa1041046cd2b4b55`.

   `git -C D:\AI\AI_Projects\project2\.runs\g006\pi status --short`

   Exit `0`; no output.

3. Public emitted import smoke:

   `node --experimental-loader ./.runs/v3-5-g1/runtime/public-pi-loader.mjs workbench/scripts/public-import-smoke.mjs`

   Exit `0`.

4. Strict TypeScript:

   `node D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc -p .runs\v3-5-g1\runtime\tsconfig.json`

   Exit `0`.

5. Goal-focused tests, from `workbench`:

   `node --experimental-loader ../.runs/v3-5-g1/runtime/public-pi-loader.mjs --test tests/v35-persistent-session.test.ts`

   Exit `0`; 6 passed, 0 failed, including the non-skipped Windows junction regression.

6. Affected regressions, from `workbench`:

   `node --experimental-loader ../.runs/v3-5-g1/runtime/public-pi-loader.mjs --test --test-concurrency=1 tests/v0b-session.test.ts tests/workspace.test.ts tests/v2a-recovery.test.ts tests/v3g1-evidence-to-candidate.test.ts tests/v3g2-validate-promote-reject-rollback.test.ts tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts`

   Exit `0`; 43 passed, 0 failed.

7. Dynamic proof, Process A:

   `node --experimental-loader ./.runs/v3-5-g1/runtime/public-pi-loader.mjs ./workbench/scripts/v35-session-cli.ts create --data-root .runs/v3-5-g1/proof-v2/data --project-id project-v35-g1-proof --workspace-root .runs/v3-5-g1/proof-v2/workspace --workspace-id workspace-v35-g1-proof --session-id session-v35-g1-proof --run-id run-v35-g1-process-a --prompt "Process A: persist one bounded Tool turn." --title "V3.5 Goal 1 cross-process proof"`

   Exit `0`; the process settled, persisted four Session entries, one Tool call/result, and Run A, then exited.

8. Dynamic proof, distinct Process B:

   `node --experimental-loader ./.runs/v3-5-g1/runtime/public-pi-loader.mjs ./workbench/scripts/v35-session-cli.ts continue --data-root .runs/v3-5-g1/proof-v2/data --project-id project-v35-g1-proof --workspace-root .runs/v3-5-g1/proof-v2/workspace --workspace-id workspace-v35-g1-proof --session-id session-v35-g1-proof --run-id run-v35-g1-process-b --prompt "Process B: reopen prior context and persist the next bounded Tool turn."`

   Exit `0`; the process listed/opened the Session, reconstructed four prior messages, settled, persisted the next Tool call/result and Run B, and left both Run links inspectable.

9. The same CLI `list` and `inspect` commands were run against the proof data root. Each exited `0`; inspection returned one Session, both linked Runs, eight safe messages/events, and `context_reconstructed: true` for both Runs.

10. Final hygiene:

    `git diff --check`

    Exit `0` before report creation; repeated before staging/commit.

### Bounded correction verification

The correction used the same strict TypeScript and regression commands listed above. Final results were:

- strict TypeScript: exit `0`;
- Goal-focused test command: exit `0`; 6 passed, 0 failed, 0 skipped;
- affected V0–V3 regression command: exit `0`; 43 passed, 0 failed, 0 skipped.

One preliminary combined invocation ran from `workbench` while retaining the root-relative `.runs\v3-5-g1\runtime\tsconfig.json` argument. It exited `1` with `TS5058` because that relative config path does not exist from `workbench`; no tests ran in that invocation. The exact TypeScript command was then rerun from the repository root and passed as recorded above. This was a command-location error, not a source/test failure.

## Process A / Process B evidence index

All generated evidence below is ignored local evidence and is not committed.

- Catalog: `.runs/v3-5-g1/proof-v2/data/catalog-v1.json`; 870 bytes; SHA-256 `2c05f53a9d43de7dd97008c80fb3126c675a29f3565c01c27da49c614521f34f`.
- Run A: `.runs/v3-5-g1/proof-v2/data/runs/run-v35-g1-process-a/manifest.json`; 1264 bytes; SHA-256 `b8cd444438be93a85d6150229e16aa95ea4425352bb0ee079976dc5993a2b01b`.
- Run B: `.runs/v3-5-g1/proof-v2/data/runs/run-v35-g1-process-b/manifest.json`; 1264 bytes; SHA-256 `bfabcd69c5bca20a4ae1261ec9929c5cbe064bbbb87f7e4d43b016564b224992`.
- Public Pi JSONL Session: catalog-relative `sessions/.../2026-08-07T22-14-35-059Z_session-v35-g1-proof.jsonl`; 3534 bytes; SHA-256 `10aa4d68def47bef4535d61676e151d715b4448366cee943c9e2fe6607fc3db1`.
- Immutable workspace input: `.runs/v3-5-g1/proof-v2/workspace/context.txt`; 85 bytes; SHA-256 `2a9a5fb961ed02b1808993494500b6b655ab08b0664ebc5992badd498718a0e2`.

Identity and linkage:

- project: `project-v35-g1-proof`
- workspace: `workspace-v35-g1-proof`
- workspace-path digest: `47da68ab2ab96d66002e1b3df8040024ac2ab2fe50e11f81895aaceeff7af50e`
- Session: `session-v35-g1-proof`
- catalog Session identity digest: `c80a62b04efc5be43e9fce987a6c4110ac17c9ae69f644ea2030a43848e783f0`
- Run A: `run-v35-g1-process-a`; Session prefix count `4`; prefix digest `023ae2c2ad71d7bd4e105f53c841088a15100166fe463c64b3005459cbb6ac18`; Tool call/result ID `run-v35-g1-process-a-tool-1`.
- Run B: `run-v35-g1-process-b`; prior-context count `4`; prior-context and provider-observed digest both `e33a2d40cccee19fe44b540fd16d44ccc786e8e1ef480bf29af3a03b5018eec7`; Session prefix count `8`; prefix digest `286eee26454516dad49be48a0fa285482afb9af95015c1939d2470376c23e40d`; Tool call/result ID `run-v35-g1-process-b-tool-1`.

## Zero-access and Pi evidence

`Fact`: both Run manifests record `credential_reads: 0`, `network_calls: 0`, `external_provider_calls: 0`, and `real_model_calls: 0`. Each used exactly two deterministic Faux provider requests and one local read-only Tool call. The implementation contains no credential read or network/provider client route.

`Fact`: Pi remained at `027a5847901b5dde30270abaa1041046cd2b4b55` with clean tracked status after implementation and testing. Product code imports public emitted package entrypoints only. The ignored loader maps those public entrypoints to the authorized hydrated checkout; it is bootstrap evidence, not a product dependency or committed artifact.

## Exit Criteria checklist

1. **PASS** — distinct Process A and Process B completed from the immutable input.
2. **PASS** — Run B's four-message prior-context digest exactly equals the digest observed inside its Faux provider callback.
3. **PASS** — the public JSONL Session, immutable Run A/B manifests, and navigation catalog are explicitly linked while preserving distinct authorities.
4. **PASS** — focused tests prove safe user/assistant/Tool/Run projection, removal of credentials/reasoning/raw provider fields/arbitrary absolute paths, and fail-closed intermediate/final reparse-path handling.
5. **PASS** — focused tests cover corrupt/missing catalog and Session/Run, cross-project, workspace mismatch, link/path escape, and parent mismatch failures.
6. **PASS** — catalog-authority tamper fails closed; Read Model adapters render absent legacy facts as `not_recorded` or `unavailable`.
7. **PASS** — strict TypeScript, 6 focused tests, and 43 affected regressions pass after the bounded correction.
8. **PASS** — all real-access counters are zero; Pi patch/private-import counts are zero and Pi is clean.

## Unverified limitations

- Only settled cross-process reopen/continue is proven. In-flight crash recovery, exactly-once Tool effects, and side-effect transactions are not implemented or verified.
- The catalog is an ordinary single-writer JSON navigation index. Concurrent/multi-writer, distributed, and database semantics are outside Goal 1.
- The behavioral proof is deterministic/Faux only and does not establish external Provider/model behavior.
- The implementation does not automatically migrate or backfill all V0–V3 artifacts. Historical adapters are intentionally bounded and expose missing facts explicitly.
- No Goal 2 Skill comparison, Goal 3 API/WebUI, realtime stream, Extension/SDK/RPC/server switch, or new adaptive authority was implemented.
- No independent OS-level egress monitor was installed. Zero access is supported by the bounded code path, manifest counters, command selection, and absence of network/provider clients, not by packet-capture evidence.
- The ignored public-entrypoint loader is worktree bootstrap only; packaged dependency/bootstrap productization remains outside this Goal.

## CURRENT_STATE_UPDATE_PROPOSAL

For Main review only; this Session did not modify `CURRENT_STATE.md` and does not accept the Goal.

```yaml
proposal_type: V3_5_G1_IMPLEMENTATION_REVIEW
goal_id: V3_5_G1_PERSISTENT_SESSION_RUN_FOUNDATION
implementation_parent: 745847d3f9e9579ea98a2d64c657b4c9d3ee91d1
implementation_commit: 4122b3cb88c2e35b946e4129d5977c0fdb2c7309
correction_parent: 4122b3cb88c2e35b946e4129d5977c0fdb2c7309
correction_commit: CORRECTION_COMMIT_OF_THIS_REVISION
implementation_session_disposition: READY_FOR_MAIN_REVIEW
exit_criteria_result: PASS_IMPLEMENTATION_EVIDENCE
goal_acceptance: MAIN_AND_USER_DECISION_REQUIRED
active_goal_recommendation: retain V3_5_G1_PERSISTENT_SESSION_RUN_FOUNDATION until Main acceptance
goal_2_authority: NOT_AUTHORIZED
goal_3_authority: NOT_AUTHORIZED
real_access:
  credential_reads: 0
  network_calls: 0
  external_provider_calls: 0
  real_model_calls: 0
pi:
  commit: 027a5847901b5dde30270abaa1041046cd2b4b55
  patched: false
  private_imports: 0
  clean: true
verification:
  strict_typescript: pass
  focused_tests: 6_pass_0_fail_0_skip
  affected_regressions: 43_pass_0_fail
  distinct_process_proof: pass
limitations:
  - settled_restart_only
  - deterministic_faux_only
  - single_writer_json_catalog
  - no_full_historical_backfill
  - no_goal_2_or_goal_3_surface
next_action: Main inspects the resulting commit and evidence, then accepts, narrows, or returns one bounded correction
```
