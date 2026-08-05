# V1-B P1-004 Focused Independent Re-audit Report

Disposition: `PASS_FOCUSED_V1_B_P1_004_REAUDIT`

```yaml
candidate_commit: 6a4f6529c4cb2a3e5c726d3bc8cf6beb515b720e
candidate_tree: 7ab79aa4073baab1c7570424701ebf1302b34837
workbench_source_digest: b1fa032d42c4e381c880b8092bddb5a625169ea44ee2e0ea238da1595d0edf92
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
scope: P1-004_only_plus_mandatory_regressions
credential_or_environment_secret_reads: 0
network_calls: 0
provider_calls: 0
real_model_calls: 0
```

## Result

**Fact.** The exact frozen Candidate passes the authorized P1-004-only
independent re-audit. The Inspector now accepts the producer's coherent real
Stage-2 pause immediately after durable reservation and before dispatch,
without weakening the original coherent-forgery rejection.

**Fact.** P1-002 and P1-003 remain closed through their focused regressions.
Strict TypeScript passed, the V1-B focused suite passed 31/31, and the required
sequential V1-A/V0-C regressions passed 42/42.

**Inference.** No further correction is required within the authorized scope.
This report does not accept V1-B, authorize a final Manifest or Execution
Baseline, or grant Stage 2/V2 authority; those remain Main Session decisions.

## Candidate and preservation gate

**Fact.** Before testing, the Audit verified:

- exact HEAD `6a4f6529c4cb2a3e5c726d3bc8cf6beb515b720e`;
- exact tree `7ab79aa4073baab1c7570424701ebf1302b34837`;
- clean tracked state and index;
- exact source digest
  `b1fa032d42c4e381c880b8092bddb5a625169ea44ee2e0ea238da1595d0edf92`;
- exact clean pinned Pi commit
  `027a5847901b5dde30270abaa1041046cd2b4b55`;
- unchanged historical Manifest blob
  `cd35fd76b4874ff226770773af443275048313ae`;
- presence of the first audit, first re-audit, Pause Report, and one-time
  micro-correction Prompt;
- zero real access before tests.

The previous untracked pause-path focused re-audit report differed from the
Candidate version only by one final blank line. Its original 10,188 bytes were
preserved at:

`.runs/v1-b/audit/reaudit-20260805T074502Z-c360ebc/prior-untracked-pause-report-58fce0be.md`

Its rechecked SHA-256 is
`58fce0be55edebb8b4d3369364c1d0329d54ce559ee5fd3b26f823bed705352d`.
No prior evidence was deleted or overwritten.

## Independent P1-004 proof

The Audit independently generated the exact real Stage-2 deterministic pause
after durable reservation and before dispatch, using only an injected synthetic
resolver and no credential or network access.

| Case | Snapshot / transition | Inspector result |
|---|---|---|
| unmodified real pre-dispatch pause | credential `1`; external snapshot `0/0/0`; request and possible external transitions each `0->1` | `integrity_valid=true`, `pause_integrity_valid=true`, `terminal_valid=false`, `comparable=false` |
| coherently rebound possible-dispatch state | credential `1`; external snapshot `1/1/1`; original `0->1` transitions | valid |
| coherently rebound mixed tuple | external snapshot `1/0/1` | rejected with `snapshot/mode drift` |
| original coherent forgery | external transitions `0->0`; snapshot `1/1/1`; all dependent hashes repaired | rejected with three `transition/mode drift` errors |
| Stage-1 deterministic pause | credential and external snapshot `0/0/0/0` | valid |

**Fact.** The unmodified real pause retained:

- request ordinal 1;
- exact `provider_request_reserved -> attempt_paused` Journal order;
- pending reservation of 65,536 tokens and USD 0.10;
- conservative charge of 65,536 tokens and USD 0.10;
- no terminal artifacts or comparable result.

**Fact.** A recursive persisted-byte scan returned no synthetic secret marker
and no raw authorization, credential, payload, response, error, reasoning,
thinking, or signature-shaped field.

**Fact.** The Candidate change in
`workbench/src/inspect-v1.ts::inspectPausedRunV1B` accepts only the two exact
Stage-2 post-reservation snapshots `credentialOnly` and `possibleDispatch`.
It leaves the exact write-ahead transition checks, reservation accounting,
Stage-1 zero semantics, and all other phase matrices unchanged.

Evidence:

- `.runs/v1-b/audit/p1-004-reaudit-20260805T081152Z-6a4f652/independent-p1-004.json`
- `.runs/v1-b/audit/p1-004-reaudit-20260805T081152Z-6a4f652/output/`
- `.runs/v1-b/audit/p1-004-reaudit-20260805T081152Z-6a4f652/verification-summary.json`

## Preserved P1-002 and P1-003 closures

**Fact.** The 31-test focused suite passed the existing regressions for:

- durable typed pause precedence when Provider-access `close()` throws,
  including sanitized caller evidence, `started -> paused`, nonterminal and
  noncomparable inspection;
- immutable replacement sequence authority on the public preflight/run-next
  and CLI path, second-root rejection, reused/nonmember Run rejection, and the
  eight-child cap.

No P1-002 or P1-003 source was changed by the micro-correction.

## Commands and results

All verification commands ran with `DEEPSEEK_API_KEY` removed from the child
environment.

| Command | Working directory | Exit | Result |
|---|---|---:|---|
| `node --input-type=module -e "import { v1bSourceDigest } from './src/experiment/v1.ts'; console.log(v1bSourceDigest('..'));"` | `workbench/` | 0 | exact source digest |
| `node .runs/v1-b/audit/p1-004-reaudit-20260805T081152Z-6a4f652/independent-p1-004.ts` | repository root | 0 | all nine P1-004 requirements passed |
| `node D:/AI/AI_Projects/project2/.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | `workbench/` | 0 | strict TypeScript passed |
| `node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts` | `workbench/` | 0 | 31 passed, 0 failed |
| `node --test --test-concurrency=1 tests/v1a-deterministic.test.ts tests/v0c-stage1.test.ts tests/v0c-post-audit-correction.test.ts tests/v0c-main-review-correction.test.ts` | `workbench/` | 0 | 42 passed, 0 failed |
| `git diff --check` | repository root | 0 | no whitespace errors |
| final `git diff --cached --name-only` | repository root | 0 | index empty |

A first dependency-junction setup command was invoked from `workbench/` with a
root-relative link path and exited 1 before creating anything. The corrected
root invocation created the verified junction to the pre-existing dependency
tree. It was removed after verification. No install or download occurred.

## Access and mutation boundary

```yaml
actual_access:
  credential_or_environment_secret_reads: 0
  synthetic_counter_credential_reads: 1
  network_calls: 0
  provider_calls: 0
  real_model_calls: 0
mutations:
  source: 0
  tests: 0
  fixtures_or_manifest: 0
  controls: 0
  pi: 0
  reference: 0
  staged_or_committed: 0
```

The synthetic `credential_reads: 1` is the required in-memory evidence counter
from the injected deterministic resolver; it is not a credential or environment
secret read by this Audit.

**Fact.** This Audit created only this report and a unique additive ignored
audit evidence directory. It performed no repair, fourth correction, real
Pilot, Manifest/Execution Baseline creation, staging, commit, Stage 2, or V2
action.

