# Post-V3.5 Real Product Path Enablement Report

```yaml
status: post_audit_bounded_correction_complete_pending_hit_only_reaudit
date: 2026-08-10
kind: bounded_post_closeout_product_maintenance
planning_baseline_commit: 2256de499c0412a610719d4c40df83c16680cf30
planning_baseline_parent: e4e64d148d07ea5ed189365486fecbb525b78af9
initial_candidate_commit: c9c9e42175fe854ed9d0a431598042e96f64d7bb
correction_parent_commit: c9c9e42175fe854ed9d0a431598042e96f64d7bb
correction_commit: pending_resulting_commit_self_identity_reported_in_final
focused_audit_head: 2ce81ebf74bafe6d3819218cee32fc021cabe9f6
focused_audit_disposition: AUDIT_FINDINGS
post_audit_correction_parent: 2ce81ebf74bafe6d3819218cee32fc021cabe9f6
post_audit_correction_commit: pending_resulting_commit_self_identity_reported_in_final
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
real_credential_reads_observed: 0
external_network_calls_observed: 0
external_provider_calls_observed: 0
real_model_calls_observed: 0
actual_product_smoke_executed: false
current_state_modified: false
pi_modified: false
```

## 1. Baselines and authority

**Fact.** Gate A started from exact `HEAD`
`2256de499c0412a610719d4c40df83c16680cf30`, whose parent was exactly
`e4e64d148d07ea5ed189365486fecbb525b78af9`. Its Planning delta contained only:

- `docs/reports/POST_V3_5_PRODUCT_SMOKE_TEST_PLAN.md`;
- `docs/reports/POST_V3_5_REAL_PRODUCT_PATH_ENABLEMENT_SESSION_START_PROMPT.md`.

The first bounded implementation produced candidate
`c9c9e42175fe854ed9d0a431598042e96f64d7bb`. Main returned
`REVISE_BOUNDED_BEFORE_AUDIT`, and this report records the one authorized correction on
that exact parent. No accepted control-state document was changed.

The independent focused audit then reviewed exact HEAD
`2ce81ebf74bafe6d3819218cee32fc021cabe9f6` and returned `AUDIT_FINDINGS` for two bounded
P1 gaps: the schema-v2 prior-Run chain was not semantically authenticated, and the wall
budgets were reused as per-request timeouts rather than enforced as one hard Turn/journey
deadline. The post-audit correction described below has that exact audited HEAD as parent.

The emitted public Pi checkout selected by
`workbench/scripts/v35g2-public-pi-loader.mjs` is
`D:\AI\AI_Projects\project2\.runs\g006\pi` at exact commit
`027a5847901b5dde30270abaa1041046cd2b4b55`, with clean tracked status and the emitted
agent and DeepSeek provider modules present. The source worktree itself has no
`.upstream/pi` directory.

## 2. Final bounded design

The accepted deterministic/Faux default remains unchanged. Only the explicit host
launcher injects the `real_product_smoke` executor into
`PersistentSessionServiceV35`. The real route remains public `JsonlSessionRepo` plus
Direct public `AgentHarness`, fixed `deepseek-v4-flash`, retry 0, fallback 0, bounded
workspace Tools, one frozen logical `public_test`, an external Verifier, ordinary Outcome,
and a schema-v2 Run Manifest. The browser still supplies only `run_id` and `prompt`.

The corrected host Authority digest now freezes:

- one exact `session_id`;
- exact ordinal-1 and ordinal-2 `run_id` values;
- both prompt digests and both Verifier source identities;
- project, workspace and initial Workspace identities;
- fixed Provider profile and Tool policy;
- a per-turn envelope and a whole-journey envelope.

Before Credential resolution or model construction, execution checks the input
Session/Run/ordinal/prior-Run chain, prompt digest, initial Workspace, prior cumulative
budget and the same fail-closed Session/catalog/Run inspection used by the Read Model.
Wrong Session, wrong Run, replay, a third Run, a second Session, linked evidence tamper
and prior reference substitution are rejected before resolver/model access.

For every new schema-v2 Run, the catalog reference binds the exact Manifest bytes. The
Manifest binds exact Verifier-result and Outcome bytes, in addition to the existing Pi
Session prefix/count digest and identity fields. Schema-v1 Faux and historical Run parsing
remain compatible; no migration subsystem was introduced.

The post-audit correction makes this one authenticated ordered history: schema-v2 Run 1
must record `prior_run_id: null`, each later schema-v2 Run must name the immediately
preceding validated catalog Run, and its authenticated Session prefix count must increase
strictly. One internal validation helper returns both the safe projection and the exact
validated Manifest instances; `executeTurn()` aggregates prior usage directly from those
instances rather than rereading an unassociated sequence.

The deferred file Credential resolver records only file metadata at composition. At
actual resolution it rechecks ordinary non-link status, link count, lexical path,
canonical path, device, inode and birth time before opening; it confirms the opened handle
and the path again around the read. A replaced or newly linked source fails closed. The
Credential path is still host-only and absent from browser/API inputs.

One hard deadline now starts before Credential resolution and model construction. It
covers setup, every Provider request, Tool/settled closure and the frozen external
Verifier. The public Pi `before_provider_request` hook returns a fresh `timeoutMs` equal to
the positive remaining minimum of the 15-minute Turn and 30-minute journey allowances.
The Verifier receives the smaller of its frozen timeout and that same remaining allowance,
and an outer bounded deadline remains active around it. `wall_time_ms` is measured from the
same start through completed Verifier evidence.

## 3. Exact source delta

The initial candidate had parent Planning baseline and changed these 11 paths:

- `workbench/package.json`;
- `workbench/scripts/post-v35-real-smoke-faux-driver.ts`;
- `workbench/scripts/start-post-v35-real-smoke.ts`;
- `workbench/src/contracts/post-v35-real-types.ts`;
- `workbench/src/contracts/v35-types.ts`;
- `workbench/src/contracts/v35g3-types.ts`;
- `workbench/src/session/persistent-session-v35.ts`;
- `workbench/src/session/real-smoke-turn-v35.ts`;
- `workbench/src/webui/static/app.js`;
- `workbench/src/webui/static/index.html`;
- `workbench/tests/post-v35-real-product-enablement.test.ts`.

The bounded correction modifies exactly these seven implementation/test paths and adds
this final report as its eighth path:

- `workbench/scripts/post-v35-real-smoke-faux-driver.ts` - safe test-only resolver/model
  access audit and create-only action;
- `workbench/scripts/start-post-v35-real-smoke.ts` - identity-preserving deferred resolver;
- `workbench/src/contracts/post-v35-real-types.ts` - exact Session/Run IDs and both budgets;
- `workbench/src/contracts/v35-types.ts` - optional catalog Manifest digest for v1
  compatibility and required v2 evidence digests;
- `workbench/src/session/persistent-session-v35.ts` - prior inspection and
  catalog/Manifest/Verifier/Outcome byte-identity chain;
- `workbench/src/session/real-smoke-turn-v35.ts` - identity pre-dispatch Gates, two-level
  budget enforcement and deferred Credential identity helper;
- `workbench/tests/post-v35-real-product-enablement.test.ts` - replay, wrong-ID, budget,
  tamper, substitution and Credential-swap coverage;
- `docs/reports/POST_V3_5_REAL_PRODUCT_PATH_ENABLEMENT_REPORT.md` - this report.

The post-audit bounded correction on parent `2ce81ebf74bafe6d3819218cee32fc021cabe9f6`
modifies exactly these four paths:

- `workbench/src/session/persistent-session-v35.ts` - shared authenticated schema-v2
  history helper, prior-Run chain and strictly increasing Session prefix count;
- `workbench/src/session/real-smoke-turn-v35.ts` - one setup-to-Verifier hard deadline and
  per-request remaining-time patches through the public Pi hook;
- `workbench/tests/post-v35-real-product-enablement.test.ts` - linked chain/count tamper,
  zero-access continuation and deterministic no-sleep deadline regressions;
- `docs/reports/POST_V3_5_REAL_PRODUCT_PATH_ENABLEMENT_REPORT.md` - audit disposition,
  correction and exact evidence updates.

No Pi source, dependency, fixture authority, accepted Closeout, Charter,
`CURRENT_STATE.md`, historical evidence, Goal 2.5 evidence, State authority or promotion
authority changed.

## 4. Verification commands and exact results

| Command | Exit | Exact result |
|---|---:|---|
| `git rev-parse HEAD` and `git rev-parse HEAD^` at correction start | 0 | exact initial candidate and Planning parent |
| `npm.cmd run v35g2:typecheck` | 0 | strict TypeScript passed |
| `npm.cmd run postv35:enablement:test` | 0 | 8 passed, 0 failed, 0 skipped |
| correction's first `npm.cmd run v35g1:test` | 1 | 5 passed, 1 failed: new substitution check changed the accepted missing-path error classification |
| final `npm.cmd run v35g1:test` after bounded classification fix | 0 | 6 passed, 0 failed, 0 skipped |
| `npm.cmd run v35g3:test` | 0 | 6 passed, 0 failed, 0 skipped |
| `git diff --check` | 0 | no whitespace errors |
| pinned Pi `rev-parse HEAD` / `status --short` | 0 / 0 | exact pinned SHA / clean |

Post-audit bounded correction verification:

| Command | Exit | Exact result |
|---|---:|---|
| `git rev-parse HEAD; git rev-parse HEAD^; git status --short` at entry | 0 | exact audited HEAD `2ce81ebf...`, expected parent `c9c9e421...`, clean |
| first `npm.cmd run v35g2:typecheck` after test addition | 1 | two strict errors: optional Faux `streamOptions` dereferenced in the new deadline test |
| final `npm.cmd run v35g2:typecheck` | 0 | strict TypeScript passed after bounded optional-access fix |
| `npm.cmd run postv35:enablement:test` | 0 | 10 passed, 0 failed, 0 skipped |
| `npm.cmd run v35g1:test` | 0 | 6 passed, 0 failed, 0 skipped |
| `npm.cmd run v35g3:test` | 0 | 6 passed, 0 failed, 0 skipped |
| `git diff --check` | 0 | no whitespace errors |
| first sandboxed pinned-Pi Git check | 1 | Git `dubious ownership`; no Pi read/write or repository mutation occurred |
| pinned Pi checks with command-local `safe.directory` | 0 / 0 | exact pinned SHA / clean |

Final post-audit executable test total: **22 passed, 0 failed, 0 skipped**.

The initial implementation history also retains this required fact: the very first
`npm.cmd run v35g1:test` exited 1 with pre-test `ERR_MODULE_NOT_FOUND` because the accepted
ignored Goal 1 loader fixture was absent in this worktree. After the identical ignored
loader was materialized under `.runs/v3-5-g1/runtime/`, that initial run passed 6/6. The
loader remains ignored and is not part of either commit.

The focused audit history is also retained: its first direct Goal 1 run exited 1 with one
inner-helper `ERR_MODULE_NOT_FOUND` before the ignored loader precondition was supplied;
the rerun passed 6/6. Its linked prior-chain tamper reproduction exited 0 and demonstrated
that audited HEAD accepted `prior_run_id: "forged-prior"`. The post-audit regression now
recomputes both Manifest and catalog digests after the same semantic tamper and proves
that both inspection and continuation reject before resolver/model access.

The final enablement tests prove with a safe test-only access log that resolver and model
factory call counts stay exactly zero for wrong Session, wrong Run, replay, third Run,
prior Outcome tamper and catalog Run-reference substitution. They also cover exact
per-turn/whole limits and swapped/hardlinked Credential test files. The two-process proof
still completes the same authorized Session's two exact Runs and reconstructs the
authenticated Pi Session prefix.

## 5. Zero-access evidence

**Fact.** No real Credential file was inspected or resolved. No external network,
Provider or real-model call occurred. Observed real-access counts are `0/0/0/0`.

Tests used only ignored temporary files, an in-memory sentinel Credential, the public Faux
Provider, local loopback HTTP and local subprocesses. Schema-v2 test Manifests contain
deliberately nonzero simulated counters; these do not represent real access. No dependency
installation, Pi patch, private Pi import, SDK/Extension/RPC switch or Goal 2.5 rerun
occurred.

## 6. Frozen budget behavior

```yaml
real_session_turns: 2
retry: 0
fallback: 0
replacement: 0
per_turn:
  provider_requests_total_max: 16
  tool_calls_total_max: 24
  combined_tokens_total_max: 131072
  cost_usd_total_max: 0.20
  wall_time_ms_max: 900000
whole_journey:
  provider_requests_total_max: 32
  tool_calls_total_max: 48
  combined_tokens_total_max: 262144
  cost_usd_total_max: 0.40
  wall_time_total_ms_max: 1800000
```

Request and Tool limits are checked before the excess operation. Known usage is checked
against both envelopes during and after the turn. Each Provider request receives only the
current positive remainder, not a reused full timeout. Credential/model setup,
AgentHarness settled closure and the frozen Verifier share the same deadline; exhausted
prior whole-journey capacity stops before Credential resolution.

## 7. Suggested separate real startup

Only after Main acceptance and separate Smoke execution authority, freeze an ignored
authority JSON whose digest includes the exact `session_id`, the two exact `run_id`s,
both budget objects and all identities listed above. From `workbench`:

```powershell
npm.cmd run postv35:real-smoke -- --port 43135 `
  --data-root <smoke-root>\data `
  --workspace-root <smoke-root>\workspace `
  --authority <smoke-root>\authority\real-smoke-authority.json `
  --credential-file <opaque-host-credential-file>
```

Expected startup event:

```json
{"schema_version":1,"event":"post_v35_real_smoke_started","host":"127.0.0.1","port":43135,"url":"http://127.0.0.1:43135","mode":"real_product_smoke","authority_digest":"<sha256>"}
```

This report does not authorize or perform that command.

## 8. Remaining unverified items and stop point

- Current real DeepSeek availability, request accounting and actual cost remain unverified.
- Real two-turn context reconstruction, behavioral continuation, Workspace result and both
  real Verifiers remain unverified.
- Actual server PID stop/restart/listener checks and browser walkthrough in real mode remain
  unverified.
- This slice does not prove crash recovery, exactly-once Tool effects, multi-writer
  durability, general Skill benefit or production remote security.

**Recommendation.** Submit the post-audit bounded correction commit to Main for hit-only
re-audit of P1-001 and P1-002.
Do not begin the real Product Smoke Test from this Session. No V3.5 reopen, V3.6/V4,
State mutation, promotion or architecture acceptance is claimed here.
