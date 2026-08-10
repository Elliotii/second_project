# Post-V3.5 Real Product Path Focused Audit Report

```yaml
status: complete_after_hit_only_reaudit
date: 2026-08-10
role: independent_focused_audit
initial_disposition: AUDIT_FINDINGS
disposition: AUDIT_PASS_AFTER_HIT_ONLY_REVIEW
audited_head: 2ce81ebf74bafe6d3819218cee32fc021cabe9f6
corrected_candidate: 2f4e18405c89dbd0e10de4fd1d3ab48e8e7052b7
corrected_candidate_parent: 2ce81ebf74bafe6d3819218cee32fc021cabe9f6
planning_baseline: 2256de499c0412a610719d4c40df83c16680cf30
pinned_pi: 027a5847901b5dde30270abaa1041046cd2b4b55
source_or_test_edits: 0
pi_edits: 0
real_credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
product_smoke_executed: false
```

## 1. Independence, object identity and status

This audit ignored the implementation report's conclusions and re-derived its findings
from the complete Planning-to-HEAD diff, current source, tests, observed commands and the
pinned public Pi source.

**Fact.** At audit entry:

- `git rev-parse HEAD` returned exactly
  `2ce81ebf74bafe6d3819218cee32fc021cabe9f6`;
- `git status --short` returned no output;
- Planning Baseline was
  `2256de499c0412a610719d4c40df83c16680cf30`;
- the Planning Baseline parent was
  `e4e64d148d07ea5ed189365486fecbb525b78af9`;
- the pinned emitted Pi checkout returned exactly
  `027a5847901b5dde30270abaa1041046cd2b4b55`, with empty tracked status;
- the emitted public agent and DeepSeek provider artifacts were present.

The audited Planning-to-HEAD delta contains the twelve paths reported by
`git diff --name-status 2256de499c0412a610719d4c40df83c16680cf30..HEAD` and was
read in full (1,962 unified-diff lines). No source, test, fixture, Pi or control file was
changed by this audit. The only tracked audit output is this report. Ignored audit data
contains test-generated roots, an exact-copy Goal 1 public-Pi loader and one tamper
reproduction script/result.

## 2. Source and pinned-Pi symbols inspected

Workbench symbols:

- `parsePostV35RealSmokeAuthority`, `parseTurn`,
  `createDeferredCredentialFileResolverV35`,
  `createPostV35RealSmokeTurnExecutor`, and `assertPostV35BudgetV35` in
  `workbench/src/session/real-smoke-turn-v35.ts`;
- `PersistentSessionServiceV35.executeTurn`, `inspect`, `openVerified`,
  `parseRunManifest`, `parseCatalog` and `catalogEntryIdentity` in
  `workbench/src/session/persistent-session-v35.ts`;
- `Goal3WorkbenchApplicationV35.continueSession` and
  `createGoal3LoopbackServerV35`/`exactObject` in the Goal 3 application/server;
- `createBoundedToolProfile` and `runExternalVerifierV0B`;
- the complete enablement test and Faux cross-process driver.

Pinned Pi evidence:

- `JsonlSessionRepo.create/open/list` in
  `D:/AI/AI_Projects/project2/.runs/g006/pi/packages/agent/src/harness/session/jsonl-repo.ts`;
- `Session.buildContext` and context reconstruction in
  `.../packages/agent/src/harness/session/session.ts`;
- `AgentHarness.createTurnState`, `createLoopConfig`, `createStreamFn` and
  `emitBeforeProviderRequest` in
  `.../packages/agent/src/harness/agent-harness.ts`;
- `streamAssistantResponse` in `.../packages/agent/src/agent-loop.ts`.

**Fact.** Fixed Pi builds Session context before a turn, invokes the Workbench `context`
hook before `convertToLlm`, and invokes `before_provider_request` immediately before
`models.streamSimple`. This supports the claimed safe provider-bound prefix observation
without persisting the raw provider payload.

## 3. A-F disposition

| Area | Result | Audit basis |
|---|---|---|
| A. Host Authority and replay | **PASS** | Exact-key Authority freezes project/workspace/session, two ordered Run IDs, prompt/Verifier identities, Tool policy and both budgets. Runtime identity checks at `real-smoke-turn-v35.ts:189-194` precede resolver/model calls at lines 203/206. Wrong-session-before-first-Run, wrong Run, replay and third-Run tests preserve a zero access-log delta. |
| B. Credential and HTTP boundary | **PASS** | Composition records metadata only. Resolve performs pre-open identity, opened-handle `fstat`, and post-read path identity checks at lines 72-102, rejecting replacements and hardlinks. HTTP turn bodies accept exactly `run_id` and `prompt` at `server-v35g3.ts:94-96`; loopback bind is fixed at line 114. Tests use only dummy files and reject Provider/Credential/root/command/Verifier fields. |
| C. Public persistence and context proof | **PASS** | Public `JsonlSessionRepo` and Direct `AgentHarness` are used. Two separate OS processes complete the same Session's two exact Runs. The Pi hook order above proves the recorded prior-message digest is checked immediately before conversion to provider messages. This is deterministic/Faux implementation evidence only; real-model continuation remains unverified. |
| D. Evidence identity and prior chain | **FAIL** | Catalog-to-Manifest and Manifest-to-Verifier/Outcome byte checks exist, and Session prefix bytes are checked. However `inspect()` validates only the shape of `prior_run_id`; it never requires Run 1 to have `null` or Run N to name the preceding catalog Run. A linked-tamper reproduction was accepted with `prior_run_ids:[null,"forged-prior"]`. See P1-001. |
| E. Safe projection and Faux regression | **PASS** | Schema-v1 remains accepted with explicit `not_recorded` fields; Goal 1 and Goal 3 regressions pass. Safe message projection excludes thinking blocks, raw Tool arguments and absolute paths, while real fields are allowlisted. The default service remains deterministic/Faux when no executor is injected. |
| F. Frozen budgets and zero retry/fallback/replacement | **FAIL** | Exact request/Tool/token/cost numbers and both budget objects are frozen; request/Tool/known-usage checks and `maxRetries: 0` exist, and exactly two Run identities prohibit replacement. The 15/30 minute wall limits are not hard journey deadlines: a fixed timeout is reused per provider request and setup/Verifier time is outside the measured interval. See P1-002. |

## 4. Findings

### P1-001 - Schema-v2 prior-Run chain is projected but not authenticated

**Fact.** `parseRunManifest` at `persistent-session-v35.ts:257` accepts any syntactically
valid `prior_run_id`. `inspect()` validates catalog path, Manifest digest, Session prefix
and Verifier/Outcome bytes at lines 531-545, but never compares a schema-v2 Manifest's
`prior_run_id` with the preceding catalog reference. It then projects the unchecked value
at line 554.

**Observed reproduction.** Starting from a fresh passing two-process enablement artifact,
the audit changed only Run 2 `prior_run_id` to `forged-prior`, rewrote the Manifest with
stable JSON, and updated that Run's catalog `manifest_sha256`. Command:

```powershell
node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs `
  ./.runs/post-v3-5-focused-audit/prior-chain-linked-tamper-repro.ts <fresh-cross-process-root>
```

Exit was `0`; output was:

```json
{"inspect_accepted":true,"prior_run_ids":[null,"forged-prior"]}
```

This is inside audit area D: a coordinated Manifest/catalog digest update preserves byte
checks while violating the required semantic prior-Run chain. Because `executeTurn()`
calls `inspect()` before resolver/model access but then derives prior identity from catalog
order, this corrupted historical Manifest does not stop the next dispatch.

Minimal correction boundary:

1. In the single schema-v2 validation path, require the first Run's `prior_run_id` to be
   `null` and every later Run's value to equal the immediately preceding validated catalog
   Run ID; also require monotonically increasing Session prefix counts.
2. Aggregate prior usage from the exact validated Manifest instances rather than reading
   a second unassociated set after `inspect()`.
3. Add a zero-access regression that alters `prior_run_id`, recomputes Manifest/catalog
   hashes, and proves both inspect and continuation reject before resolver/model calls.

No general migration platform, schema-v1 rewrite or new authority store is required.

### P1-002 - 15/30 minute wall envelopes are reused as per-request timeouts

**Fact.** `real-smoke-turn-v35.ts:213-214` computes one timeout when constructing the
Harness:

```text
min(per-turn 900000, remaining whole-journey time)
```

The elapsed clock starts later at line 222. The `before_provider_request` hook at lines
239-243 checks elapsed time but returns no stream-options patch. Pinned Pi
`AgentHarness.createStreamFn` snapshots and applies `timeoutMs` separately for every
provider request (`agent-harness.ts:403-407`). Therefore a request beginning just below
the 15-minute turn limit can receive another full 15-minute timeout. The final assertion
at line 257 detects the overrun only after that request returns. Credential resolution and
model construction occur before the clock; the external Verifier runs after the final
wall assertion at line 279.

Thus numeric budget parser/unit tests pass, but the runtime does not enforce a hard
15-minute Turn or 30-minute whole-journey deadline.

Minimal correction boundary:

1. Start the turn deadline before Credential resolution/model construction.
2. At each `before_provider_request`, compute remaining per-turn and whole-journey time and
   return that remaining value as the request `timeoutMs`, or use one outer abort deadline
   covering the whole turn.
3. Keep the deadline active through settled closure and the frozen Verifier, then record
   the same bounded interval used for enforcement.
4. Add a Faux/fake-clock regression proving request 2 receives only remaining time and
   that setup/Verifier cannot extend the frozen deadline.

No Provider change, retry, fallback, replacement, Pi patch or budget increase is needed.

### P2 findings

None retained within the A-F audit scope. The two P1 findings are bounded correctness
gaps in explicit acceptance boundaries and should return to the original Implementation
Session as one correction package.

## 5. Commands and exact results

| Command | Exit | Result |
|---|---:|---|
| HEAD/status/baseline-parent/diff-name Gate | 0 | exact HEAD; initial status empty; expected parent and 12-path Planning-to-HEAD delta |
| complete unified diff read | 0 | 1,962 lines |
| pinned Pi HEAD/status/artifact checks | 0 | exact pinned SHA; status empty; both emitted artifacts `True` |
| `npm.cmd run v35g2:typecheck` | 0 | strict TypeScript pass |
| `npm.cmd run postv35:enablement:test` | 0 | 8 passed, 0 failed, 0 skipped |
| `npm.cmd run v35g3:test` | 0 | 6 passed, 0 failed, 0 skipped |
| first direct Goal 1 audit run before ignored loader setup | 1 | 5 passed, 1 failed; inner helper `ERR_MODULE_NOT_FOUND` for the documented ignored loader |
| `npm.cmd run v35g1:test` after exact-copy ignored loader setup | 0 | 6 passed, 0 failed, 0 skipped |
| loader SHA-256 comparison | 0 | both `B12BC1C4A437159576B99347FDA9917A2D0A1DED97A8BB76C185A1E0A9CD137A` |
| linked prior-chain tamper reproduction | 0 | Inspector accepted forged prior Run identity |
| `git diff --check` | 0 | no tracked candidate whitespace error |

Final standard executable tests: **20 passed, 0 failed, 0 skipped** after the ignored
loader precondition was supplied. Passing tests do not close P1-001 or P1-002 because the
current suite does not exercise coordinated prior-chain tamper or a multi-request elapsed
deadline.

## 6. Zero-real-access evidence and unverified items

**Fact.** This audit did not inspect or resolve any real Credential, including
`.env.g005`. It made no external network, Provider or real-model call. Real access counts
are Credential/network/Provider/model = `0/0/0/0`. HTTP activity was loopback-only; all
model-shaped execution used public Faux Provider behavior and dummy in-memory or ignored
test Credential files.

The following remain unverified and were not attempted:

- actual DeepSeek dispatch and usage/cost behavior;
- actual real-model cross-process continuation and behavioral marker recovery;
- actual real-server stop/restart/browser journey;
- crash recovery, exactly-once Tool effects and production security.

**Fact.** At final audit handoff, `git rev-parse HEAD` remained
`2ce81ebf74bafe6d3819218cee32fc021cabe9f6`; `git status --short` contained only
`?? docs/reports/POST_V3_5_REAL_PRODUCT_PATH_FOCUSED_AUDIT_REPORT.md`. The pinned Pi
checkout remained at its required SHA with empty tracked status.

## 7. Original focused-audit disposition

```text
AUDIT_FINDINGS
```

Return P1-001 and P1-002 together to the original Implementation Session. Re-audit only
the affected schema-v2 chain/deadline paths plus enablement, Goal 1 and Goal 3 regressions.
Do not start the real Product Smoke Test on this candidate.

## 8. Corrected-candidate hit-only re-audit

### 8.1 Object and scope

**Fact.** Main supplied corrected Candidate
`2f4e18405c89dbd0e10de4fd1d3ab48e8e7052b7` with exact parent
`2ce81ebf74bafe6d3819218cee32fc021cabe9f6`. This audit worktree was detached to that
Candidate while preserving this untracked report and ignored audit evidence. At re-audit
entry, `git rev-parse HEAD` matched the corrected Candidate exactly and
`git status --short` contained only this report. The parent-to-Candidate delta contains
exactly four paths: the two hit source files, their enablement test, and the Implementation
Report.

This was a hit-only review. It rechecked P1-001, P1-002 and the required regressions; it
did not reopen areas A-C/E, search for unrelated findings, or perform a general audit.

### 8.2 P1-001 closure - authenticated schema-v2 Run history

**PASS / closed.** `PersistentSessionServiceV35.validatedRunHistory` at
`workbench/src/session/persistent-session-v35.ts:524-567` now returns each exact parsed
Manifest together with its safe view. For schema-v2 histories it enforces:

- Run 1 `prior_run_id === null`, and each later value equals the immediately preceding
  catalog `run_id` (`:536-538`);
- strictly increasing `session_entry_count_after_turn` (`:539-540`);
- the existing catalog-to-Manifest, Session-prefix and Manifest-to-Verifier/Outcome byte
  identities in the same validation pass.

`executeTurn` consumes the Manifest instances returned by that helper directly for prior
usage aggregation (`:366-375`); it no longer performs the second unassociated Manifest
read identified in the original finding. Because validation occurs before the host turn
executor and before its resolver/model access, a linked historical failure remains
pre-access.

The new regression at
`workbench/tests/post-v35-real-product-enablement.test.ts:273-301` rewrites the second
Manifest with a forged `prior_run_id`, recomputes the catalog Manifest digest, and proves
both `inspect` and continuation reject. Its access log remains unchanged. The same test
also proves coordinated non-increasing Session-prefix tamper rejection. The full Goal 1
suite passes 6/6, retaining schema-v1 Faux/history compatibility.

### 8.3 P1-002 closure - one hard Turn/journey deadline

**PASS / closed.** `createPostV35TurnDeadlineV35` at
`workbench/src/session/real-smoke-turn-v35.ts:61-88` derives one elapsed interval and the
positive minimum of per-turn remaining time and whole-journey remaining time. The deadline
is instantiated before Credential resolution/model construction (`:235`) and remains in
force through Harness prompt/idle settlement and the external Verifier (`:241-321`).

Every `before_provider_request` call computes a fresh remainder and returns it as
`streamOptions.timeoutMs` (`:275-279`); the frozen Verifier timeout is also capped by that
same current remainder (`:313`) and executed under the same outer deadline (`:315`). The
recorded `wall_time_ms` is measured from the same pre-Credential start through completed
Verifier evidence (`:320-335`). The formula checks both the 900,000 ms Turn envelope and
the 1,800,000 ms whole journey after prior recorded wall usage; with the frozen two equal
15-minute Turn allowances, the second Turn can consume only the whole-journey remainder.

The no-sleep fake-clock regression at
`workbench/tests/post-v35-real-product-enablement.test.ts:303-341` proves request 2 receives
less time than request 1, setup expiry blocks model construction, Verifier expiry prevents
a Manifest, and successful `wall_time_ms` includes Credential plus Harness plus Verifier
time. Together with the exact two-layer budget test, this closes the original wall-budget
finding without changing the frozen limits, retry, fallback, replacement or Pi.

### 8.4 Re-audit commands and results

| Command | Exit | Exact result |
|---|---:|---|
| initial `git switch --detach <corrected>` inside the sandbox | 1 | `index.lock` permission denied; HEAD and report unchanged |
| authorized detached switch and HEAD/status check | 0 | exact corrected Candidate; only this untracked report |
| parent-to-Candidate name/status, stat, commit and `diff --check` | 0 | exact parent; 4 changed paths; no whitespace error |
| first parallel npm invocation from repository root | 1 | root has no `package.json`; no test or external access started |
| `npm.cmd run v35g2:typecheck` from `workbench/` | 0 | strict TypeScript passed |
| `npm.cmd run postv35:enablement:test` from `workbench/` | 0 | 10 passed, 0 failed, 0 skipped |
| `npm.cmd run v35g1:test` from `workbench/` | 0 | 6 passed, 0 failed, 0 skipped |
| `npm.cmd run v35g3:test` from `workbench/` | 0 | 6 passed, 0 failed, 0 skipped |

Final corrected-Candidate executable total: **22 passed, 0 failed, 0 skipped**.

### 8.5 Zero access, Pi and final disposition

**Fact.** The re-audit read no real Credential and made no external network, Provider or
real-model call. Its real access counts remain Credential/network/Provider/model =
`0/0/0/0`. Tests used only Faux models, dummy/ignored Credential files, local files and
loopback HTTP. No Product Smoke Test was started.

The pinned Pi checkout remains exactly
`027a5847901b5dde30270abaa1041046cd2b4b55` with empty tracked status. No source, test,
fixture, Pi or control-state file was modified by this re-audit; no file was staged or
committed.

```text
AUDIT_PASS_AFTER_HIT_ONLY_REVIEW
```

Both original P1 findings are closed on corrected Candidate
`2f4e18405c89dbd0e10de4fd1d3ab48e8e7052b7`. This disposition does not authorize the real
Product Smoke Test.
