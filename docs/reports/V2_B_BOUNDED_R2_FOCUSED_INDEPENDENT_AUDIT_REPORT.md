# V2-B Bounded R2 Focused Independent Audit Report

## Audit disposition

**Recommendation: `REVISE_V2_B_R2_BOUNDED`.**

**Fact:** Candidate `0bc5eba535c06fd1a780a82f95859defa3f2eb78` passes the strict TypeScript check and all 75 independently rerun canonical focused/regression tests. Its controlled Seed path, shared V2 Controller path, public Pi surface, Session/Workspace isolation, schema-aware evidence scan, Negative/Selector behavior, and preserved V2-A/V1 boundaries are supportable.

**Finding `V2B-R2-AUDIT-P1-001` — P1 / Major:** the persisted pre-Verifier checkpoint does not contain or reference the Provider reservation ledger. Its `prior_usage_known` and `reservations_reconciled` facts are accepted from `runtime_observation` booleans. The outer V2-B Inspector also omits committed-token-to-attempt-token reconciliation when the Candidate terminal is `budget_stopped`. A coherent tamper that changes a `known_usage_committed.actual_tokens` value, refreshes all enclosing ArtifactRefs, and leaves Attempt usage unchanged remains `integrity_valid: true`. Therefore the Candidate does not meet the Amendment requirement that known/reconciled usage be independently recomputed from raw persisted pre-Verifier evidence rather than summary booleans.

This is a bounded, correctable finding inside Amendment §8. It is not a recommendation to expand V2-B, change the Direct public `AgentHarness` route, add a third path, or enter V3.

## Authority, identity, and Gate A

### Required reading

Read completely and in the required order:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V2_VERSION_CHARTER.md`;
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
5. `docs/第二项目_Codex交接包_2026-07-30/V2_B_GOAL_CONTRACT.md`;
6. `docs/第二项目_Codex交接包_2026-07-30/V2_B_BOUNDED_R2_AMENDMENT.md`;
7. `docs/reports/V2_B_BOUNDED_R2_IMPLEMENTATION_REPORT.md`;
8. `docs/reports/V2_B_BOUNDED_R2_CLOSEOUT_DRAFT.md`.

Also read the relevant V2 sections of `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md` and the pinned Pi root `AGENTS.md` before inspecting pinned Pi source.

### Frozen identity

| Check | Observed | Disposition |
|---|---|---|
| Candidate HEAD | `0bc5eba535c06fd1a780a82f95859defa3f2eb78` | exact |
| Candidate tree | `730c4c250c6b74fa83e5fa83c1ab486a2ff4fec3` | exact |
| Control Baseline | `b1c8cf6045a0118452734bdf3cbe7b65fcd645ac` | ancestor of Candidate |
| Project tracked/staged status before audit report | clean; no cached or unstaged paths | pass |
| Pinned Pi HEAD | `027a5847901b5dde30270abaa1041046cd2b4b55` | exact |
| Pinned Pi tree | `0aa996c1d6108d5ffd8ff24ff498d08720283f29` | recorded |
| Pinned Pi status | clean | pass |

**Fact:** The Candidate diff from Control Baseline contains exactly 15 paths, all inside Amendment §8:

- `docs/reports/V2_B_BOUNDED_R2_CLOSEOUT_DRAFT.md`
- `docs/reports/V2_B_BOUNDED_R2_IMPLEMENTATION_REPORT.md`
- `fixtures/recovery/v2b-r2/partial-subject.ts`
- `fixtures/recovery/v2b-r2/provenance.json`
- `workbench/README.md`
- `workbench/package.json`
- `workbench/src/contracts/v2-types.ts`
- `workbench/src/contracts/v2b-types.ts`
- `workbench/src/inspect-v2.ts`
- `workbench/src/inspect-v2b.ts`
- `workbench/src/pi/pi-run-handle-v2b.ts`
- `workbench/src/run-v2.ts`
- `workbench/src/run-v2b.ts`
- `workbench/tests/v2b-r2.test.ts`
- `workbench/tests/v2b-stage1.test.ts`

No unexpected Candidate source was found.

## Finding detail

### `V2B-R2-AUDIT-P1-001` — pre-Verifier usage reconciliation is not independently reconstructible

**Severity:** P1 / Major; blocks `PASS_V2_B_R2_FOCUSED_AUDIT`.

**Contract mapping:** exact audit questions 3 and 5; Amendment §§3.2, 4.3, 5.5 and 7.3 requirements that the pre-Verifier terminal be raw-derived, usage known/reconciled, and summary booleans non-authoritative.

**Source evidence:**

- `workbench/src/run-v2.ts:545-624`, `createCandidatePreVerifierCheckpointV2A`, reopens the JSONL Session and snapshots Session/Workspace bytes, but persists no reservation entries or reservation ArtifactRef. Lines 588-595 accept `observation.prior_usage_known` and `observation.reservations_reconciled` as part of `rawGate`; lines 596-613 then persist those booleans inside `runtime_observation`.
- `workbench/src/inspect-v2.ts:710-747` independently reopens referenced Session/Workspace bytes and checks Journal order, but lines 727-744 again accept the two observation booleans. There is no raw reservation source from which to recompute them.
- `workbench/src/run-v2b.ts:228-256` writes the V2-B Attempt reservation evidence only after the V2-A substrate returns. On a successful budget terminal, the target Verifier has already executed inside that substrate path, so this outer evidence cannot be the required pre-Verifier authority.
- `workbench/src/inspect-v2b.ts:166-202` validates reservation phases and costs. However, line 196 reconciles `committedTokens` to `usage.tokens` only for `terminal_reason === "settled"`; an R2 Candidate uses `budget_stopped`. Total cost is reconciled, but committed tokens are not.
- `workbench/tests/v2b-r2.test.ts:218-260` proves a false runtime-observation path is rejected before Verifier and a crafted legacy-shaped port cannot bypass the checkpoint. It does not present the Inspector with a coherent `known_usage_committed.actual_tokens` mismatch while keeping phase, cost, summaries, and ArtifactRefs otherwise valid.

**Independent reproduction:**

Audit-local script `.runs/v2-b/r2-focused-audit/reproduce-reservation-tamper.ts` generated a valid controlled R2 run, confirmed the original Inspector result, changed Candidate A reservation 1 `actual_tokens` from `2736` to `2737`, refreshed the Attempt ArtifactRef and terminal, and did not change aggregate Attempt usage (`18715` tokens).

Observed result:

```json
{
  "attempt_usage_tokens_unchanged": 18715,
  "original_integrity_valid": true,
  "reservation_actual_tokens_before": 2736,
  "reservation_actual_tokens_after": 2737,
  "tampered_errors": [],
  "tampered_integrity_valid": true
}
```

Evidence root: `.runs/v2-b/r2-focused-audit/reservation-tamper-1786096385075/`.

**Inference:** The concrete production port computes reconciliation before returning, but the frozen evidence and Inspector cannot independently establish that fact. An injected result or coherently rewritten persisted Attempt can assert a reconciled budget stop without a raw pre-Verifier reservation ledger that binds every known response to Session usage. This is the precise authority gap the Amendment required the audit to reject.

### Bounded correction required

**Recommendation:** Return one correction package to the original Implementation Session, limited to Amendment §8 paths:

1. Persist the complete reservation ledger, or a content-addressed immutable reference to it, before the Verifier checkpoint is accepted and before the Verifier runs.
2. Make the Inspector derive `prior_usage_known` and `reservations_reconciled` from that raw ledger plus independently parsed JSONL Session usage. Require exact per-request/aggregate token and cost reconciliation for `budget_stopped`, not only `settled`.
3. Keep observation/quiescence booleans as summaries only; they may agree with recomputed facts but may not establish eligibility.
4. Add coherent tamper cases for known-usage `actual_tokens` and `actual_cost_usd` with enclosing digests refreshed, and assert the runtime fault path still fails before any Verifier invocation.
5. Re-run strict TypeScript, the 7 R2 focused tests, and only the affected V2-B/V2-A regressions plus the new tests. Re-audit this finding and those regressions only.

No budget increase, real call, source route change, SDK/Extension path, third route, or new subsystem is required.

## Exact audit-question dispositions

### 1. Controlled Seed public route and freeze order — PASS

**Fact:** `workbench/src/pi/pi-run-handle-v2b.ts` imports public `AgentHarness`; its controlled primary constructs that harness and executes Tool Call/Tool Result lifecycle. `workbench/src/run-v2.ts` uses public `JsonlSessionRepo`, records the maintenance check before the primary target Verifier, requires maintenance pass, requires target Verifier fail, freezes the Seed, and only then exposes the shared Candidate execution seams. The focused test `workbench/tests/v2b-r2.test.ts:55` exercises this behavior.

Pinned Pi proof:

- `D:/AI/AI_Projects/project2/.upstream/pi/packages/agent/src/index.ts:3-6` publicly re-exports the agent and `AgentHarness` surface.
- `D:/AI/AI_Projects/project2/.upstream/pi/packages/agent/src/harness/agent-harness.ts:171` defines public `AgentHarness`.
- `D:/AI/AI_Projects/project2/.upstream/pi/packages/agent/src/harness/session/jsonl-repo.ts:38`, `:75`, and `:93` define public `JsonlSessionRepo`, `create`, and `open`; its `fork` behavior is exercised by `D:/AI/AI_Projects/project2/.upstream/pi/packages/agent/test/harness/repo.test.ts:47-67`.

Maintenance and target Verifier semantics are distinct: maintenance is a separate command/result with `status: passed`; the target Verifier is the frozen task verifier and must fail before Seed eligibility.

### 2. Shared Controller, identical inputs, isolated A/B — PASS

**Fact:** `prepareAndFreezeRecoverySeedV2` (`workbench/src/run-v2.ts:506`), `executeRecoveryCandidateFromSeedV2` (`:627`), and `executeRecoveryGroupFromSeedV2` (`:823`) are the accepted shared Controller seams. A forks the failed parent public JSONL Session; B creates a fresh Session. Each Candidate receives its own temporary-copy Workspace from identical frozen Seed bytes/common task inputs. The Inspector validates initial/final Workspace identity, path isolation, Session lineage, absence of parent history on B, and cross-root aliasing. The R2 focused and V2-A suites pass these cases.

### 3. Raw/persisted safe budget terminal before exactly one Verifier — FAIL

**Fact:** Pre-dispatch refusal, no pending Provider response, closed Tool lifecycle, reopened Session identity/bytes, readable protected-valid Workspace, Journal order, and one Verifier are checked. Missing Session, changed Workspace, broken Tool lineage, and wrong order are rejected.

**Fact:** Known/reconciled Provider usage is not independently proved from raw persisted pre-Verifier evidence. The checkpoint contains summary booleans but no reservation ledger, and the outer ledger is written after the substrate/Verifier. Finding `V2B-R2-AUDIT-P1-001` therefore makes the answer to the complete question **no**.

### 4. Legacy V2-A eligibility sealing — PASS

**Fact:** `workbench/src/run-v2.ts:106` holds Controller-created deterministic ports in a module-private `WeakSet`; manifest route identity is frozen as `internal_deterministic` or `injected` (`:136`, `:171`, `:887`). `workbench/src/inspect-v2.ts:751` permits legacy no-checkpoint eligibility only for the internal deterministic route. `workbench/src/inspect-v2b.ts:235` requires `expectedExecutionPortKind: "injected"`. A crafted injected result carrying legacy-shaped summary data is rejected before Verifier by the focused test.

### 5. Independent checkpoint recomputation and negative tamper coverage — FAIL

**Fact:** Session absence/change, Workspace change, broken Tool Result, Journal order, and crafted legacy-shaped injection are rejected. The test that injects a false runtime quiescence observation fails before creation of `candidates/a/verifier-result.json` and observes zero Verifier calls.

**Fact:** The Inspector does not independently recompute Provider reservation reconciliation and accepts the coherent committed-token mismatch in the audit reproduction. Because one required rejection is missing, the complete question fails.

### 6. Exact reasoning metadata exception and Tool lineage — PASS

**Fact:** `workbench/src/inspect-v2.ts:101-140` allows a key normalized as `reasoning` only at exact structured path `message.usage.reasoning`, only when its value is a finite non-negative number. Other reasoning paths, reasoning content, signatures, authorization/credential/API-key shapes, sensitive or unknown unparseable shapes remain fail-closed. The focused schema test and broken Tool Result tests pass.

### 7. Semantics/budgets/Case count/boundaries — PASS

**Fact:** Maintenance and target Verifier evidence are separate. The Negative is stable-format and produces no Recovery Group/Candidates; Selector behavior remains verifier-derived. Frozen Attempt/Group/sequence budgets, Case count, A/B paths, one-cell-at-a-time sequence, no retry/fallback/replacement behavior, V2-A deterministic compatibility, and the selected V1 regressions remain unchanged. No R1 evidence is overwritten or reused.

### 8. Reports, counters, allowlist, Pi, totals — PARTIAL / REVISE

**Fact:** Candidate identity, Pi identity/cleanliness, §8 allowlist, strict TypeScript, 75/75 canonical test total, and application-level zero-access counters are independently supportable. The controlled tests use injected counters and deterministic stubs; they do not claim OS-level egress blocking.

**Fact:** The Implementation/Closeout claim that all eight safe-terminal facts are raw-derived and that the Inspector independently reconciles reservation phases/totals is not supportable because of `V2B-R2-AUDIT-P1-001`.

**Unconfirmed:** The ignored original Implementation Session ledger under `.runs/v2-b/r2-stage1/` is not present in this fresh worktree, so its exact historical command transcript was not independently reopened. The canonical commands and totals were independently rerun instead. This absence does not change Candidate source identity, but the reports should not treat the unavailable ignored ledger as audit evidence.

## Reviewed files and symbols

Directly reviewed Candidate source/tests:

- `workbench/src/contracts/v2-types.ts`: Candidate checkpoint, Session, Workspace and recovery types.
- `workbench/src/contracts/v2b-types.ts`: Attempt reservation, usage, quiescence and terminal types.
- `workbench/src/pi/pi-run-handle-v2b.ts`: concrete/controlled Provider, Model, Tool, Session and budget-stop composition; `AgentHarness` construction; reservation lifecycle.
- `workbench/src/run-v2.ts`: public JSONL Session lifecycle, controlled primary, maintenance, target Verifier, Seed freeze, Candidate A/B, checkpoint, Selector and Negative boundaries.
- `workbench/src/run-v2b.ts`: V2-B Controller composition, Attempt collection, budget/quiescence summaries, evidence write order and counters.
- `workbench/src/inspect-v2.ts`: artifact/raw-byte checks, schema scan, Session/Workspace reconstruction, checkpoint/Journal/Verifier order, legacy route sealing and selector/negative validation.
- `workbench/src/inspect-v2b.ts`: V2-B attempt/reservation/cost validation, source/Pi identity, Case/sequence and nested V2 inspection.
- `workbench/tests/v2b-r2.test.ts`: all seven R2 focused cases.
- `workbench/tests/v2b-stage1.test.ts`: affected R2 compatibility changes and V2-B regressions.
- `workbench/package.json`, `workbench/README.md`, and both R2 fixture files.
- Candidate Implementation Report and Closeout Draft.

Pinned Pi source/tests reviewed at commit `027a5847901b5dde30270abaa1041046cd2b4b55`:

- `packages/agent/src/index.ts` public exports.
- `packages/agent/src/harness/agent-harness.ts`, symbol `AgentHarness`.
- `packages/agent/src/harness/session/jsonl-repo.ts`, symbol `JsonlSessionRepo` and `create/open/fork` behavior.
- `packages/agent/test/harness/repo.test.ts`, public JSONL repository create/open/fork tests.
- `packages/agent/package.json`, public package export/main identity.

## Commands and results

All commands ran from `C:/Users/HUAWEI/.codex/worktrees/70b0/project2`. No network, Credential read, external Provider call, or real model call was authorized or performed. The audit used an ignored local ESM loader that maps package names to the already-built pinned Pi artifacts under `D:/AI/AI_Projects/project2/.runs/g006/pi`; no dependency installation, copied dependency tree, or pinned Pi mutation occurred.

| Command | Exit/result |
|---|---|
| `git rev-parse HEAD`; `git rev-parse 'HEAD^{tree}'`; status/cached/unstaged checks; Control Baseline ancestry; corresponding pinned Pi HEAD/tree/status checks | `0`; exact identities and both trees clean |
| `git diff --name-status b1c8cf6045a0118452734bdf3cbe7b65fcd645ac..HEAD` | `0`; 15 allowlisted paths |
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p .runs/v2-b/r2-focused-audit/tsconfig.audit.json` | `0`; strict TypeScript clean |
| `node --experimental-loader ./.runs/v2-b/r2-focused-audit/pi-loader.mjs -e "import('./workbench/src/pi/pi-run-handle-v2b.ts').then(()=>console.log('public-import-ok'))"` | `0`; `public-import-ok` |
| `node --experimental-loader ./.runs/v2-b/r2-focused-audit/pi-loader.mjs workbench/tests/v2b-r2.test.ts` | `0`; 7/7 pass |
| `node --experimental-loader ./.runs/v2-b/r2-focused-audit/pi-loader.mjs .runs/v2-b/r2-focused-audit/reproduce-reservation-tamper.ts` | `0`; original valid and coherently tampered run also incorrectly valid |
| `$env:NODE_OPTIONS="--experimental-loader=./.runs/v2-b/r2-focused-audit/pi-loader.mjs"; node workbench/tests/v2b-stage1.test.ts` | `0`; 19/19 pass |
| same inherited-loader form, `workbench/tests/v2a-recovery.test.ts` | `0`; 5/5 pass |
| same inherited-loader form, `workbench/tests/v2a-cli.test.ts` | `0`; 1/1 pass |
| same inherited-loader form, `workbench/tests/v2a-post-audit.test.ts` | `0`; 5/5 pass |
| same inherited-loader form, `workbench/tests/v1b-stage1.test.ts` | `0`; 27/27 pass |
| same inherited-loader form, `workbench/tests/workspace.test.ts` | `0`; 9/9 pass |
| same inherited-loader form, `workbench/tests/v0b-verifier.test.ts` | `0`; 2/2 pass |

Canonical total: **75 tests, 75 passed, 0 failed, 0 skipped**.

One initial direct `v2a-cli.test.ts` invocation exited `1` because its child process did not inherit the audit-local command-line loader and therefore could not resolve `@earendil-works/pi-agent-core`. The inherited-loader rerun above exited `0` and passed 1/1. This was an audit-harness dependency-resolution issue in the fresh worktree, not a product assertion failure. Earlier loader/typecheck setup attempts likewise failed before product assertions until the ignored loader covered the public DeepSeek subpath and the audit-local TypeScript path was corrected; the final commands above are the verification evidence.

## Access counters and audit boundary

**Fact:** Audit activity used zero Credential reads, zero network calls, zero external Provider calls, and zero real model calls. The focused tests’ recorded R2 zero-access counters pass. No source, test, fixture, Implementation/Closeout report, `CURRENT_STATE.md`, Charter/Contract/Amendment, `AGENTS.md`, Pi file, Git index, or Git history was edited. The only tracked deliverable created by this Session is this report; audit-local reproduction/runtime evidence is ignored under `.runs/`.

Not required and not assessed: production durability, exactly-once effects, OS egress blocking, natural failure frequency, statistical superiority, universal Skill/Runtime conclusions, V3 capabilities, SDK/Extension route switching, or a third recovery path.

## Final recommendation

`REVISE_V2_B_R2_BOUNDED`

Correct only `V2B-R2-AUDIT-P1-001` within the existing Amendment §8 allowlist, then perform a focused re-audit of the new raw pre-Verifier reservation evidence, committed token/cost reconciliation, coherent tamper rejection, failure-before-Verifier assertion, and necessary R2/V2-B/V2-A regressions. Final V2-B/V2 acceptance remains exclusively with Main plus the user.
