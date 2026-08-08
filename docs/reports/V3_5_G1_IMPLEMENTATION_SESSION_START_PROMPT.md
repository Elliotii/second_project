# V3.5 Goal 1 — Top-level Implementation Session Start Prompt

```yaml
status: authorized_for_dispatch
goal_id: V3_5_G1_PERSISTENT_SESSION_RUN_FOUNDATION
control_baseline_commit: 745847d3f9e9579ea98a2d64c657b4c9d3ee91d1
control_baseline_tree: c183d69ab1a6298fc17fde0bb447b882c8a3fef1
execution_owner: this_new_top_level_implementation_session
real_model_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
pi_core_patch_authorized: false
runtime_route_switch_authorized: false
goal_2_authorized: false
goal_3_authorized: false
```

You are the dedicated top-level Implementation Session for V3.5 Goal 1. Implement and verify only the accepted Goal 1 boundary, create one bounded implementation commit, write the required short reports, and stop for Main review. You do not own final Goal acceptance or project control state.

## 1. Gate A — exact baseline and read order

Before editing:

1. Verify `git rev-parse HEAD` equals `745847d3f9e9579ea98a2d64c657b4c9d3ee91d1`.
2. Verify its tree equals `c183d69ab1a6298fc17fde0bb447b882c8a3fef1`.
3. Verify all tracked files are clean. A worktree-local ignored `.runs/` bootstrap may exist only after it is created intentionally for this Goal.
4. Verify pinned Pi source commit `027a5847901b5dde30270abaa1041046cd2b4b55` is clean and do not modify it.
5. Read completely, in order:
   - `AGENTS.md`;
   - `CURRENT_STATE.md`;
   - `docs/第二项目_Codex交接包_2026-07-30/V3_5_CHARTER.md`;
   - `docs/reports/V3_5_PREIMPLEMENTATION_REVIEW.md`;
   - `docs/reports/V3_CLOSEOUT.md`;
   - `docs/reports/V3_G3_CLOSEOUT.md`;
   - the relevant Session, V2 JSONL recovery, V3 Direct Pi Run, evidence/read-input source and tests;
   - every applicable pinned Pi `AGENTS.md`, then public JSONL Session repo/storage/session, AgentHarness and their tests.

If any baseline, authority, or Pi identity differs, stop and report without editing.

## 2. Goal question

> Can a public Pi JSONL Session survive a settled process restart, remain correctly linked to Workbench Runs/evidence, be safely inspected, and continue through the same Direct AgentHarness route?

## 3. Frozen invariants

```text
Pi JSONL Session
= resumable conversation/context authority

Workbench Run
= bounded execution/evaluation authority

Catalog
= navigation metadata only
```

Keep two planes separate:

```text
Runtime Plane: full local Pi JSONL Session → reopen/continue
Read/Evidence Plane: allowlisted safe projection → CLI/API/reports/future UI
```

The safe projection must not expose credentials, private reasoning, unsafe raw Provider payloads, or arbitrary filesystem access. It must not replace the full Runtime Session.

## 4. Authorized implementation scope

Implement the smallest coherent Goal 1 substrate:

- a thin Workbench service/adapter over public Pi `JsonlSessionRepo`;
- persistent Session create/list/open/settled-continue through the existing Direct `AgentHarness` route;
- explicit Session↔Run linkage and a small schema-versioned catalog/index;
- project/workspace/session/run identity validation with fail-closed behavior;
- safe typed Session/conversation/Tool/Run projections;
- versioned read adapters only for V3.5 product/demo needs:
  - current persistent Session/Run;
  - one representative V2 recovery comparison;
  - V3 prompt adaptation lineage;
  - a future Goal 2 Skill comparison contract shape or unavailable placeholder;
  - safe partial fallback for older Runs;
- narrow CLI or application-service surfaces sufficient to create, list, open, continue and inspect without a WebUI;
- focused deterministic tests and required regressions;
- short implementation and closeout-draft reports.

Use adapter/refactor work around the current execution boundary; do not create a second Agent Loop, conversation database, Eval Runtime, Verifier, State lifecycle, or authority plane.

Logical source scope is limited to relevant `workbench/src/` Session, read-model, Run, Direct Pi adapter and narrow CLI/application integration; focused tests/scripts and package test commands may be added. Do not rewrite the final README or Architecture documentation. Do not change unrelated V0–V3 behavior.

## 5. Dependency/worktree bootstrap

This top-level Session may run in a fresh Codex worktree that does not contain ignored `.runs/` dependencies. That is expected and is not a project defect.

- Do not use the network or install/download dependencies.
- Do not modify the pinned Pi checkout or emitted Pi packages.
- The immutable hydrated emitted Pi at `D:\AI\AI_Projects\project2\.runs\g006\pi` may be consumed read-only after verifying commit `027a5847901b5dde30270abaa1041046cd2b4b55` and clean status.
- You may create Goal-local ignored loader/bootstrap material under `.runs/v3-5-g1/` that resolves the public emitted packages from that verified local source.
- For strict TypeScript, use the already hydrated TypeScript runtime under the verified emitted Pi tree instead of installing anything.
- Do not commit junctions, generated dependencies, `.runs/`, credentials, Pi, or external reference material.

## 6. Required dynamic proof

The central proof must use two distinct OS processes, not two objects in one process:

```text
Process A
→ create persistent Pi JSONL Session
→ deterministic AgentHarness turn settles
→ at least one Tool call/result is persisted
→ linked Run A is persisted
→ process exits

Process B
→ list/open the same Session
→ reconstruct prior context
→ continue one deterministic AgentHarness turn
→ linked Run B is persisted
→ both Run links remain inspectable
```

The proof uses zero Credential/network/external Provider/model calls. Use an existing deterministic/Faux Provider pattern and public Pi entrypoints.

## 7. Exit Criteria

All must pass:

1. Process A and Process B proof above completes from immutable test inputs.
2. Process B demonstrably receives/reconstructs the prior context, not merely the same Session ID.
3. Session and both Runs have explicit, inspectable linkage without conflating their authorities.
4. Safe projection renders user/assistant/Tool/Run history and excludes credentials, private reasoning, unsafe raw Provider payloads and arbitrary raw paths.
5. corrupt, missing, cross-project, workspace-mismatch and path-escape cases fail closed.
6. Catalog/index cannot silently override Pi Session, Run artifact, or V3 State truth; missing old evidence renders `not_recorded`/`unavailable`.
7. Strict TypeScript, Goal-focused tests, and every regression affected by the changed boundary pass.
8. Credential/network/Provider/model/real-call counters remain 0; Pi patch/private import remain 0.

## 8. Explicit non-goals

Do not implement:

- Goal 2 real Skill Case or any real model/provider path;
- Goal 3 WebUI, local HTTP API, CSS, frontend framework or realtime streaming;
- in-flight crash recovery, exactly-once Tool effects, side-effect transaction system;
- database, distributed store, multi-writer transactionality, semantic memory or cross-Session retrieval;
- new adaptive State, changed Verifier/Promotion/security authority, Prompt/Skill semantics or V3 lifecycle;
- Pi Extension/SDK/RPC/server Runtime switch, Pi Core patch or private import;
- full V0–V3 schema migration or broad historical backfill.

## 9. Ordinary fixes vs hard stops

Fix ordinary TypeScript, serialization, path, catalog, fixture and focused-test defects in this Session. Do not create extra stages, R1/R2, replacement runs, formal contracts or audit work.

Stop immediately and report to Main only if:

1. public Pi Session cannot support the required settled continuation without patch/private import;
2. safe projection cannot be separated from resumable raw Session;
3. persistence requires changing accepted V3 authority semantics;
4. Session↔Run cannot be linked without making the catalog authoritative;
5. the implementation would require WebUI/Runtime switching/unsafe filesystem or credential exposure;
6. a concrete correctness defect contradicts an accepted V3 claim.

## 10. Control and Git boundary

Do not modify or stage:

- `CURRENT_STATE.md`;
- `AGENTS.md`;
- `V3_5_CHARTER.md`;
- `09_对接执行、文件权威与验收规则.md`;
- any accepted V0–V3 Charter, Contract, Closeout, State artifact or ignored real evidence;
- `.upstream/pi/` or `reference/`.

You are authorized to create exactly one bounded Goal 1 implementation commit containing only Goal 1 source/tests/scripts and the two reports below. Before committing, verify the protected control files are byte-identical to baseline and inspect the exact staged file list. Do not merge, rebase, push or modify another branch.

## 11. Required deliverables

Create:

- `docs/reports/V3_5_G1_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_5_G1_CLOSEOUT_DRAFT.md`.

The report must include:

- implementation commit SHA and parent baseline;
- Source Delta;
- architecture/mechanism summary;
- exact commands and exit codes;
- focused and regression results;
- Process A/Process B evidence index;
- Session/Run/catalog identities and artifact references without unsafe raw data;
- zero-access and Pi-clean evidence;
- Exit Criteria checklist;
- unverified limitations;
- structured `CURRENT_STATE_UPDATE_PROPOSAL` for Main only.

After the bounded commit and reports are complete, stop and return the result to Main. Do not accept Goal 1, activate Goal 2, create its Case Contract, or begin WebUI work.
