# V1-B Pause-path Focused Independent Audit Report

```yaml
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
session_role: fresh_focused_independent_audit
audit_disposition: REVISE_FOCUSED_V1_B_PAUSE_PATH_CANDIDATE
candidate_commit: cdc9780fd6b3e9b34cdc4156713377d601c595ec
candidate_tree: fced95adf974cf95f26cb7a3c88ed871a7202ab8
pause_evidence_baseline_commit: c68e834b654d56a1ce8312b6f5f085230e74d7d1
original_execution_baseline_commit: 19617319c13a9eecbb325682c920e79d1517b89d
original_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
workbench_source_digest: 634879c68345ccb689ba3768197612db1cad83e575f217d5f125cabba5d9c0d5
p0_findings: 0
p1_findings: 3
p2_findings: 0
credential_reads: 0
network_calls: 0
provider_calls: 0
real_model_calls: 0
source_repair: false
git_stage_or_commit: false
v2_entered: false
```

## 1. Outcome

**Fact.** The frozen Candidate identity, tree, initially clean tracked/index
state and pinned clean Pi identity matched the audit prompt exactly. The
historical tracked Manifest blob is unchanged across original Execution
Baseline, Pause Evidence Baseline and Candidate:
`cd35fd76b4874ff226770773af443275048313ae`.

**Fact.** Strict TypeScript passed; the V1-B focused suite passed 26/26; the
required sequential V1-A/V0-C regressions passed 42/42; and the independently
recomputed Workbench digest matched
`634879c68345ccb689ba3768197612db1cad83e575f217d5f125cabba5d9c0d5`.

**Fact.** Three Contract-relevant P1 findings remain. No P0 was found: every
coherent pause accepted by the current Inspector remains nonterminal and
noncomparable, and the tested post-reservation path retains the full USD/token
reservation. The P1s nevertheless block the replacement Pilot because typed
counter attribution can be coherently forged, cleanup can break the durable
pause chain, and the replacement sequence cap is not enforced by the actual
preflight/execution handoff.

**Recommendation.** Return the smallest bounded correction below to the
original Preparation Session and re-audit only P1-001 through P1-003 plus the
26 focused and 42 sequential regressions. Do not create a new Execution
Baseline or replacement Manifest yet.

## 2. Findings

### P1-001 — Inspector accepts a coherently rehashed counter contradiction

**Contract boundary.** Typed pause attribution, request ordinal/counters and
fail-closed coherent-evidence inspection.

**Fact.** `inspectPausedRunV1B` validates each transition's numeric shape and
each snapshot counter's independent range, but does not relate the
`counter_transition` values to `counter_snapshot`, Manifest execution mode or
pause phase. See `workbench/src/inspect-v1.ts::inspectPausedRunV1B`, especially
lines 91–109.

**Independent counterexample.** Starting from a valid synthetic real-mode
post-reservation pause, the audit changed all three external transition deltas
from `0 -> 1` to `0 -> 0`, changed the corresponding snapshot counters from
`0` to `1`, and coherently recomputed the journal prefix, pause ArtifactRef,
journal digest and ledger bindings. Inspector returned:

```json
{"integrity_valid":true,"pause_integrity_valid":true,"errors":[]}
```

Evidence:
`.runs/v1-b/audit/focused-20260805T065403Z-cdc9780/coherent-counter-mismatch/`
and `adversarial-results.json` in the same audit root.

**Impact.** A realistic coherent rewrite can be accepted as valid paused
evidence while contradicting its own dispatch/counter story. It remains
nonterminal and noncomparable, so this is P1 rather than P0, but it defeats the
amendment's typed attribution requirement and can invalidate budget/dispatch
reconciliation.

**Smallest correction.** In `inspectPausedRunV1B`, enforce the exact
Manifest-mode transition matrix and cross-link the snapshot to the transition:
provider-request ordinal/delta must be exact; stage1 external deltas must be
zero; stage2 network/provider/model deltas must be the frozen possible-dispatch
transition; and each snapshot must match an allowed before/after state for the
specific phase. Add the audit's coherent contradiction as a regression.

**Correction owner.** Original V1-B Preparation Session.

### P1-002 — Close failure overrides durable typed pause and strands `started`

**Contract boundary.** `pause-evidence.json -> attempt_paused -> ledger paused`
durability and cleanup/close failure handling.

**Fact.** `executeV1RunCell` writes `pause-evidence.json`, appends
`attempt_paused`, and throws `V1BTypedPauseError` in
`workbench/src/run-v1.ts` lines 316–335. Its unconditional
`finally { await handle.close(); }` at lines 336–337 can reject and replace that
typed error. `runNextPilotCellV1B` appends the paused ledger relation only when
the caught error still carries `pauseEvidenceRef`
(`workbench/src/pilot-v1.ts` lines 165–171).

**Independent counterexample.** A zero-access synthetic authority whose close
method throws produced durable `pause-evidence.json` and an `attempt_paused`
journal tail, but the caller observed only
`Error: AUDIT_SYNTHETIC_CLOSE_FAILURE`; the Pilot ledger remained
`["started"]` with no `paused` relation.

Evidence:
`.runs/v1-b/audit/focused-20260805T065403Z-cdc9780/close-failure/`.

**Impact.** A cleanup failure can erase the typed exception at the public
boundary and leave an incomplete chain that the Pilot cannot resume or inspect
as a coherent pause. This can invalidate the replacement Pilot on an ordinary
resource-cleanup failure.

**Smallest correction.** Preserve an already-created `V1BTypedPauseError` as
the primary sanitized error across close failure so the Pilot can append the
write-once paused ledger relation. Do not expose the raw close error. Add a
throwing-close fault seam/regression asserting pause file, `attempt_paused`,
ledger `paused`, nonterminal/noncomparable inspection and zero dispatch.

**Correction owner.** Original V1-B Preparation Session.

### P1-003 — Replacement sequence validator is not on the execution path

**Contract boundary.** Exact predecessor, one replacement only, USD 0.10 prior
debit, USD 1.90 cap, 25 cross-sequence starts, eight child Attempts and final
replacement Manifest Gate.

**Fact.** `validateReplacementSequenceStateV1B` exists in
`workbench/src/experiment/v1.ts` lines 193–215 and its direct unit tests reject
supplied bad states. No product source calls it. `preflightV1B` and
`runNextV1B` in `workbench/src/product-surface-v1.ts` lines 25–50 validate only
the self-contained Manifest/current Pilot; `runNextV1B` initializes any fresh
Pilot root without predecessor-sequence evidence.

**Independent counterexample.** The public preflight accepted a deterministic
revision-2 Manifest as `ready`, and the public run handoff started and typed-
paused replacement cell 1, although neither call received predecessor Manifest
evidence, predecessor started IDs, cross-sequence started IDs or child count.
The only supplied runtime authority used a synthetic resolver that failed
before dispatch. Evidence:
`.runs/v1-b/audit/focused-20260805T065403Z-cdc9780/replacement-without-sequence-state/`
and `adversarial-results.json`.

**Impact.** The exact manifest builder prevents many structural drifts, but the
actual handoff cannot distinguish the authorized first replacement from a
second fresh Pilot root or enforce the 25-start/eight-child cross-sequence cap.
The unused validator and dynamic test construction therefore do not constitute
the mandatory final replacement execution Gate.

**Smallest correction.** Require exact predecessor/sequence evidence for every
revision-2 preflight and before Pilot initialization/authority creation; invoke
the sequence validator on the actual path; refuse missing, reused, nonmember or
second-replacement state; and update the state after each started initial Run
and child Attempt. Add a Main-only final tracked replacement Manifest Gate
binding the new Execution Baseline commit/tree/source digest and exact immutable
predecessor before Stage 2. Add public-surface regressions, including two fresh
Pilot roots using the same revision-2 Manifest.

**Correction owner.** Original V1-B Preparation Session for source/tests;
Main Session later materializes the final Manifest/Execution Baseline only
after re-audit passes.

## 3. Positive boundary results

### Dispatch ordering and durable reservation

**Fact.** Pinned Pi's
`.upstream/pi/packages/agent/src/harness/agent-harness.ts::emitBeforeProviderRequest`
awaits handlers serially (lines 277–300). `createStreamFn` awaits that method at
line 406 before calling `models.streamSimple` at line 407. The pinned
OpenAI-compatible Provider constructs payload at
`.upstream/pi/packages/ai/src/api/openai-completions.ts` lines 222–241 and can
dispatch only at `client.chat.completions.create` on line 243. The applicable
Pi regression is
`.upstream/pi/packages/agent/test/harness/agent-harness-stream.test.ts`,
`snapshots stream options before provider request hooks`.

**Fact.** The Workbench reservation callback synchronously appends
`provider_request_reserved` in `workbench/src/run-v1.ts` lines 239–242 before
the handler returns. The focused synthetic post-reservation regression proves
the journal event precedes `attempt_paused`; the callback's thrown boundary
prevents Pi from reaching provider dispatch. A callback/write exception also
propagates through the awaited Pi hook before dispatch and cannot create a
terminal/RunResult branch.

### Six phases, charges and denominator

**Fact.** The 26-test focused suite reproduced all six typed phases without
real access: before credential resolution; credential failure before dispatch;
after credential/before reservation; after reservation with unavailable usage;
invalid/unknown response usage; and other bounded runtime failure. The first
three carry no pending reservation/charge. The two post-reservation phases
retain the full 65,536-token and USD 0.10 pending reservation. Raw error and
credential markers were absent from persisted evidence.

**Fact.** A coherent post-reservation pause inspects with
`pause_integrity_valid=true`, `terminal_valid=false` and `comparable=false`;
terminal marker, terminal evidence and RunResult are forbidden. Aggregate
retains conservative usage while adding zero terminal/comparable/effect-
denominator Runs and does not claim Gate O completion. Existing missing,
duplicate, reordered, byte-tampered, coherent phase-rehash and protected-marker
counterexamples fail closed.

### Replacement structural identity

**Fact.** Direct Manifest validation freezes revision 2, the exact predecessor
ID, USD 0.10 prior debit, USD 1.90 cap, unchanged 24-cell layout, 24 new IDs,
25 maximum supplied sequence starts, eight supplied children and false
retry/fallback/automatic-replacement flags. The historical Manifest fixture
was not modified. P1-003 is specifically that these checks are not enforced
against predecessor state by the public execution handoff.

## 4. Verification commands

| Command | Exit | Result |
| --- | ---: | --- |
| `git rev-parse HEAD` / `git rev-parse 'HEAD^{tree}'` / tracked and staged status | 0 | exact Candidate/tree; clean before audit |
| `git -C D:/AI/AI_Projects/project2/.upstream/pi rev-parse HEAD` and status | 0 | exact pinned Pi; clean |
| `node D:/AI/AI_Projects/project2/.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | 0 | strict TypeScript passed |
| `node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts` | 0 | 26/26 passed |
| `node --test --test-concurrency=1 tests/v1a-deterministic.test.ts tests/v0c-stage1.test.ts tests/v0c-post-audit-correction.test.ts tests/v0c-main-review-correction.test.ts` | 0 | 42/42 passed |
| `node .runs/v1-b/audit/focused-20260805T065403Z-cdc9780/adversarial-checks.ts` | 0 | reproduced P1-001 through P1-003 with zero external access |
| static `v1bSourceDigest` recomputation | 0 | exact expected digest |
| historical Manifest blob comparison across `19617319`, `c68e834b` and Candidate | 0 | identical blob `cd35fd76...` |
| audit evidence forbidden-marker scan | 0 | 48 files, 0 matches |
| `git diff --check`; final source/control/fixture/Pi/reference/index checks | 0 | no unauthorized delta; only this report is tracked audit output |

The tests used a transient ignored dependency junction to the already existing
local `workbench/node_modules`; it was verified, used without install/download,
and removed before final state checks.

## 5. Audit evidence and access accounting

Audit evidence root:

`.runs/v1-b/audit/focused-20260805T065403Z-cdc9780/`

Key files are `adversarial-checks.ts`, `adversarial-results.json` and
`verification-summary.json`, plus the four isolated Pilot/counterexample
directories.

```yaml
real_credential_reads: 0
network_calls: 0
provider_calls: 0
real_model_calls: 0
dependency_installs_or_downloads: 0
source_or_test_repairs: 0
control_state_delta: 0
fixture_delta: 0
pi_delta: 0
reference_delta: 0
git_stage_operations: 0
git_commits: 0
```

Synthetic resolvers and fault seams used only fixed non-secret values or threw
before dispatch. They did not access an environment credential. No real Pilot
or Stage 2 Provider route was run.

## 6. Stop point

`REVISE_FOCUSED_V1_B_PAUSE_PATH_CANDIDATE`

Work stops after this report. No repair, replacement Manifest, Execution
Baseline, credential read, network call, real Pilot, control update, stage,
commit or V2 action was performed.

