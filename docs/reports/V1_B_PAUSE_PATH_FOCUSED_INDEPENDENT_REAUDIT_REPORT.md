# V1-B Pause-path Focused Independent Re-audit Report

Disposition: `PAUSE_SCOPE_OR_ARCHITECTURE`

```yaml
candidate_commit: c360ebc4af9ef941252e6aff99638eca00b161e0
candidate_tree: 96f1f6ed016971e8801c9229ece4004bbc782f62
workbench_source_digest: 0494bd0f749cd587df779596c95f84fafc1c4fe65f57eabf511810476d5989e7
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
reaudit_scope:
  - P1-001
  - P1-002
  - P1-003
credential_reads: 0
network_calls: 0
provider_calls: 0
real_model_calls: 0
```

## Result

**Fact.** P1-002 and P1-003 are closed. A throwing Provider-access close no
longer replaces or strands a durable typed pause, and the immutable replacement
sequence authority is enforced on the public preflight/run-next/CLI path and at
each initial/child start boundary.

**Fact.** P1-001 is not closed. The corrected Inspector rejects the Candidate's
own unmodified, coherently persisted real-mode pause at the
`before_provider_request` reservation boundary. The producer records actual
external counters as zero because the hook aborts before dispatch, while the
Inspector requires those counters to be one. This is a new concrete defect
inside the expressly re-audited P1-001 boundary.

**Inference.** The defect can invalidate the replacement Pilot's mandatory
paused evidence at the exact write-before-dispatch boundary. Passing strict
TypeScript, 31/31 focused tests and 42/42 sequential regressions does not cure
that execution/evidence contradiction.

**Recommendation.** Do not accept this Candidate, create the replacement
Manifest, or begin Stage 2. The re-audit prompt designates this as the
second/final correction and requires `PAUSE_SCOPE_OR_ARCHITECTURE` if another
correction cycle would be needed. Main Session must decide whether to authorize
a third bounded correction or leave V1-B paused.

## Identity and preservation gate

**Fact.** Before testing, the Audit verified exact Candidate HEAD/tree, clean
tracked and staged state, the exact clean pinned Pi checkout, the expected
source digest, and the historical Manifest blob
`cd35fd76b4874ff226770773af443275048313ae`. No protected fixture, control,
reference, Pi, or source path differed due to this Audit.

The pre-checkout untracked first-audit report differed from the Candidate blob
only by the Candidate's final LF. Its original bytes were preserved at:

`.runs/v1-b/audit/focused-20260805T065403Z-cdc9780/prior-untracked-audit-report-d6b03ab5.md`

Its independently rechecked SHA-256 is
`d6b03ab593a68326acdfe1ea7a0171825e8b23aeeb8985cf64797fc67bc51ded`.
No prior ignored evidence was deleted or overwritten.

## Finding

### P1-004 — the P1-001 correction rejects a valid pre-dispatch Stage 2 pause

**Severity:** P1

**Fact.** Pinned Pi's
`packages/agent/src/harness/agent-harness.ts::createStreamFn` awaits
`emitBeforeProviderRequest` at line 406 and only then calls
`models.streamSimple` at line 407. `emitBeforeProviderRequest` itself awaits
each registered handler at lines 282-300. A handler throw therefore prevents
Provider dispatch.

**Fact.** In Candidate
`workbench/src/pi/pi-run-handle-v1.ts::attach`, the handler reserves the request
and invokes the durable reservation callback at lines 325-339. The deterministic
post-reservation pause throws at line 340. The real external counters are not
incremented until line 341, which is unreachable on that path.

The independent zero-call reproduction produced this coherent story:

| Field | Persisted value |
|---|---:|
| phase | `after_provider_request_reservation_usage_unavailable` |
| request ordinal | 1 |
| credential reads | 1 |
| network / Provider / model calls | `0 / 0 / 0` |
| pending reservation | 65,536 tokens / USD 0.10 |
| conservative charge | 65,536 tokens / USD 0.10 |
| Journal suffix | `provider_request_reserved -> attempt_paused` |

The reservation event describes a possible external transition of `0->1`, but
the pause snapshot correctly remains `0 / 0 / 0` because Pi never reached
dispatch. `workbench/src/inspect-v1.ts::inspectPausedRunV1B` lines 115-121
instead require both the transition and Stage 2 snapshot to be
`1 / 1 / 1`. The unmodified evidence is rejected with:

`post-reservation pause counter snapshot/mode drift`

**Fact.** The original coherently rehashed attack is now rejected: changing the
external transition to `0->0` and the snapshot to `1 / 1 / 1`, then repairing
the journal prefix, pause ArtifactRef, final Journal digest and ledger binding,
produces three `transition/mode drift` errors. That negative test alone is
insufficient because the producer's legitimate positive Stage 2 boundary is
also rejected.

**Fact.** The six currently tested positive phase/mode cases remain accepted:
the three credential phases in Stage 2 and the other-runtime, post-reservation,
and invalid-usage deterministic Stage 1 cases. The focused suite does not first
assert that its real-mode post-reservation source for the coherent attack is
Inspector-valid; the independent probe exposes that missing positive coverage.

**Inference.** This fails the re-audit requirement that exact counter semantics
relate the mode, phase, reservation transition and matching snapshot while
retaining the legitimate pause matrix. It also contradicts the correction
report's claim that all six positive typed phases prove closure of P1-001.

The smallest conceptual correction would make the producer and Inspector agree
on one exact pre-dispatch-versus-possible-dispatch counter story and add an
Inspector-valid real Stage 2 post-reservation positive regression. This Audit
does not authorize or implement that third correction.

Evidence:

- `.runs/v1-b/audit/reaudit-20260805T074502Z-c360ebc/independent-checks-v2.json`
- `.runs/v1-b/audit/reaudit-20260805T074502Z-c360ebc/output-fixed-helper/stage2_real-after_provider_request_reservation_usage_unavailable/`
- `.runs/v1-b/audit/reaudit-20260805T074502Z-c360ebc/output-fixed-helper/coherent-real-counter-contradiction/`

## P1-002 re-audit

**Fact.** A zero-call `OneRunProviderAuthorityV1B` seam whose `close()` throws a
unique raw marker returned `V1BTypedPauseError` with the fixed sanitized message.
The marker was absent from the caller stack and every persisted artifact. The
durable order was:

`pause-evidence.json -> attempt_paused -> ledger paused`

The ledger's only non-planned states were `started -> paused`; Inspector returned
`integrity_valid=true`, `pause_integrity_valid=true`,
`terminal_valid=false`, and `comparable=false`. No later cell started.

Result: **P1-002 CLOSED**.

Evidence:

- `.runs/v1-b/audit/reaudit-20260805T074502Z-c360ebc/independent-close-and-sequence.json`
- `.runs/v1-b/audit/reaudit-20260805T074502Z-c360ebc/close-and-sequence-output/close-pilot/`

## P1-003 re-audit

**Fact.** The public replacement handoff behaved as follows:

| Probe | Result before forbidden append/creation |
|---|---|
| missing sequence authority | rejected; Pilot root absent |
| USD 0.11 prior-debit drift | rejected; Pilot root absent |
| exact authority | preflight ready; first Run started once and typed-paused |
| same Manifest/claim with second root | rejected; second root absent |
| reused initial Run ID | rejected; no append |
| nonmember initial Run ID | rejected; no append |
| ninth child Attempt | rejected; claim journal stayed at 10 lines |

**Fact.** Source inspection confirms the authority binds the exact predecessor,
the one historical started Run, USD 0.10 prior debit, USD 1.90 replacement cap,
24 new replacement Run IDs, 25 cross-sequence initial starts, eight child
Attempts, and false retry/fallback/automatic-replacement flags. Validation is
on preflight/run-next before Pilot initialization and Provider authority, then
before every initial and child start. The 31-test suite independently exercises
the tracked CLI requirement and second-root rejection.

Result: **P1-003 CLOSED**.

Evidence:

- `.runs/v1-b/audit/reaudit-20260805T074502Z-c360ebc/independent-close-and-sequence.json`
- `.runs/v1-b/audit/reaudit-20260805T074502Z-c360ebc/close-and-sequence-output/`

## Required verification

All commands ran with `DEEPSEEK_API_KEY` removed from the child environment.
No dependency install or download occurred; a temporary junction to the
pre-existing local dependency tree was verified, used, and removed.

| Command | Exit | Result |
|---|---:|---|
| `node D:/AI/AI_Projects/project2/.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` from `workbench/` | 0 | strict TypeScript passed |
| `node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts` from `workbench/` | 0 | 31 passed, 0 failed |
| `node --test --test-concurrency=1 tests/v1a-deterministic.test.ts tests/v0c-stage1.test.ts tests/v0c-post-audit-correction.test.ts tests/v0c-main-review-correction.test.ts` from `workbench/` | 0 | 42 passed, 0 failed |
| `node .runs/v1-b/audit/reaudit-20260805T074502Z-c360ebc/independent-checks.ts` | 0 | coherent attack rejected; unmodified real Stage 2 pause unexpectedly rejected |
| `node .runs/v1-b/audit/reaudit-20260805T074502Z-c360ebc/independent-close-and-sequence.ts` | 0 | P1-002 and P1-003 probes passed |
| static `v1bSourceDigest` recomputation | 0 | exact `0494bd0f749cd587df779596c95f84fafc1c4fe65f57eabf511810476d5989e7` |

An initial version of the independent phase helper used a successful resolver
for the credential-failure phase, so that one audit-generated case was invalid
before assertion. Its output was preserved additively. The corrected helper
uses a throwing synthetic resolver; `independent-checks-v2.json` is the relied-on
result. This was an audit-harness incident, not a Candidate finding.

The consolidated identity/count/access record is:

`.runs/v1-b/audit/reaudit-20260805T074502Z-c360ebc/verification-summary.json`

## Final boundary statement

**Fact.** This Audit read no credential, made no network request, invoked no
external Provider or real model, ran no real Pilot, created no final replacement
Manifest or Execution Baseline, and made no source, test, fixture, control, Pi,
reference, staged, or committed change. It created only this report and additive
ignored audit evidence.

V1-B remains active and paused. Stage 2 and V2 remain unauthorized.

