# V0-C Focused Independent Audit Report

Audit date: 2026-07-31 (UTC)  
Audit role: fresh independent focused audit Session  
Repository: `D:\AI\AI_Projects\project2`

## 1. Candidate identity

| Identity | Required | Independently observed | Result |
|---|---|---|---|
| Candidate SHA | `930c549b402fce9ffa96847a673ad187c64f6094` | `930c549b402fce9ffa96847a673ad187c64f6094` | PASS |
| Workbench digest | `a43ec6309e55754f5f095c76b226426a7d3d36b37b9ce36cbc08db6422f5fc6f` | `a43ec6309e55754f5f095c76b226426a7d3d36b37b9ce36cbc08db6422f5fc6f` | PASS |
| Pi SHA | `027a5847901b5dde30270abaa1041046cd2b4b55` | `027a5847901b5dde30270abaa1041046cd2b4b55` | PASS |

The Workbench digest was recomputed with the candidate's own `treeDigest()` implementation while excluding only `node_modules`. No digest was copied from an implementation report.

## 2. Gate A results

Gate A passed before tests, evidence creation, or probes.

| Gate | Fact | Result |
|---|---|---|
| Root identity | `HEAD` exactly matched the required Candidate SHA. | PASS |
| Tracked state | Root tracked status and staged diff were empty. | PASS |
| Permitted untracked state | Before this report, all 1906 untracked paths were either the user-supplied `docs/reports/V0_C_FOCUSED_INDEPENDENT_AUDIT_START_PROMPT.md` or beneath `reference/`; unexpected count was 0. | PASS |
| Workbench identity | Independently recomputed digest exactly matched the required digest. | PASS |
| Pi identity/state | `.upstream/pi` matched the required SHA and had empty status. | PASS |
| Control state | Candidate-tracked `CURRENT_STATE.md`, Contract, Charter, control rule, ADRs, historical Closeouts, and implementation materials were byte-identical to the Candidate because tracked status was clean. | PASS |
| Audit authority | The new audit prompt supplied the current focused-audit authority. It did not authorize Stage 2, credentials, network, dependency changes, Pi changes, source correction, staging, or commit. No conflicting extra authority was observed. | PASS |
| Audit evidence boundary | Probe copies and scripts are under ignored `.runs/v0-c/audit/`; authoritative Runs were not mutated. | PASS |

Git initially reported repository ownership as dubious. Read-only Git checks therefore used per-command `-c safe.directory=D:/AI/AI_Projects/project2` (and the corresponding Pi path); no global or repository Git configuration was changed.

The recorded identity recheck at `2026-07-31T00:44:24.2344462Z`–`2026-07-31T00:44:25.0106535Z` again showed root tracked/staged counts 0, no unexpected untracked paths, exact Workbench/Pi identities, clean Pi status, and ignored audit evidence.

## 3. Files and symbols inspected

Required control and history were read completely:

- `AGENTS.md`;
- `CURRENT_STATE.md`;
- `docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md`;
- `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
- `docs/第二项目_Codex交接包_2026-07-30/V0_C_GOAL_CONTRACT.md`;
- `docs/第二项目_Codex交接包_2026-07-30/V0_B_GOAL_CONTRACT.md`;
- `docs/reports/V0_C_STAGE1_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V0_C_STAGE1_CLOSEOUT_DRAFT.md`;
- `docs/reports/V0_C_STAGE1_MAIN_REVIEW_BOUNDED_CORRECTION_PROMPT.md`;
- `docs/reports/V0_C_FOCUSED_INDEPENDENT_AUDIT_START_PROMPT.md`.

Candidate source and tests inspected:

| Boundary | Paths / principal symbols |
|---|---|
| Run orchestration and lifecycle | `workbench/src/run-v0c.ts` — `executeV0CRun`, `terminalIndexItemsV0C` |
| Recovery eligibility/lineage | `workbench/src/completion/controller-v0c.ts` — `decideCompletionV0C` |
| Failure Packet before-child gate | `workbench/src/completion/failure-packet-v0c.ts` — Packet construction, persistence and scan validation; corresponding call path in `executeV0CRun` |
| Attempt/Run validation | `workbench/src/evidence/run-validation-v0c.ts` — `RunValidationInputV0C`, `validateRunEvidenceV0C`; `workbench/src/evidence/terminal-policy-v0c.ts` |
| Journal/terminal ordering | `workbench/src/evidence/journal-v0c.ts`; terminalization path in `executeV0CRun` |
| Independent inspection | `workbench/src/inspect-v0c.ts` — `inspectRunV0C` |
| Dormant real Product Surface | `workbench/src/product-surface-v0c.ts`; `workbench/src/pi/real-provider-route-v0c.ts`; `workbench/src/pi/pi-adapter-v0c.ts`; `workbench/src/contracts/preflight-v0c.ts` |
| Contracts/types and hashing | `workbench/src/contracts/v0c-types.ts`; `workbench/src/hash.ts` |
| Focused tests | `workbench/tests/v0c-main-review-correction.test.ts`; `workbench/tests/v0c-stage1.test.ts`; `workbench/tests/v0b-post-audit.test.ts` |
| Test runners/source evidence | `workbench/package.json`; `workbench/test`; `workbench/scripts/run-v0c-deterministic-suite.mjs`; `workbench/scripts/write-v0c-source-evidence.mjs`; `.runs/v0-c/evidence/source-inventory.json`; `.runs/v0-c/evidence/EVIDENCE_INDEX.md` |

No credential file, credential value, private Pi import, or external Provider implementation was read or invoked.

## 4. Commands, exits, and observed counts

The exact UTC intervals, working directories, commands, exit codes, and concise outputs are recorded in `.runs/v0-c/audit/COMMAND_LOG.md`.

| Command | Exit | Result |
|---|---:|---|
| `& '.runs/v0-a/pi/node_modules/.bin/tsc.cmd' -p 'workbench/tsconfig.json'` | 0 | Strict TypeScript passed; no diagnostics. |
| `node --test workbench/tests/v0c-main-review-correction.test.ts` | 0 | 5/5 passed; 0 failed/skipped/cancelled/todo. |
| `node --test workbench/tests/v0c-stage1.test.ts` | 0 | 11/11 passed; 0 failed/skipped/cancelled/todo. |
| `node --test workbench/tests/v0b-post-audit.test.ts` | 0 | 11/11 passed; 0 failed/skipped/cancelled/todo. |
| `node --test workbench/test` | 0 | The one complete regression run: 83/83 passed; 0 failed/skipped/cancelled/todo. |
| `node workbench/src/cli.ts inspect run-0c752f20-1f14-46a8-b450-cdb30d3e682b` | 0 | committed/integrity-valid passed Run; two Attempts; one recovery; 35 artifacts. |
| `node workbench/src/cli.ts inspect run-bc97935e-884b-4524-acec-9d44cdf2b92e` | 0 | committed/integrity-valid failed Run; `verifier_failed_policy_stop`; two Attempts; one recovery; 28 artifacts. |
| `node workbench/src/cli.ts inspect run-886cbdc1-2c06-4226-8f12-13c2b0d62576` | 0 | committed/integrity-valid passed Run; two Attempts; one recovery; 35 artifacts. |
| `node --experimental-strip-types .runs/v0-c/audit/probes/handle-pre-try-cleanup.mjs` | 0 | Both bounded injected exceptions reproduced missing cleanup; probe counters all 0. |
| `node --experimental-strip-types .runs/v0-c/audit/probes/run-validator-caller-assertion.mjs` | 0 | Synthetic readback mismatch remained invisible to the validator; probe counters all 0. |

An initial TypeScript launch attempt used the non-existent `workbench\node_modules\.bin\tsc.cmd`. PowerShell did not launch the compiler, while the wrapper incorrectly returned 0. It is recorded in the command log as a startup failure and is not counted as a test or pass. The corrected strict-TypeScript command above used only the already-present local compiler and passed.

All three inspected Runs reported `committed=true`, `integrity_valid=true`, `errors=[]`, two Attempts, one consumed Recovery slot, and `external_provider_calls=0`.

## 5. Findings

No P1 finding was observed. Two P2 Contract violations remain unresolved.

### V0C-AUD-001 — P2 — Handle can escape cleanup before the broad `try/finally`

**Fact.** In `workbench/src/run-v0c.ts`, `executeV0CRun`:

- creates the handle at lines 421–427;
- invokes `options.lifecycleProbe?.("handle_created")` at line 428;
- invokes `handle.debugIdentity()` at line 429;
- enters the broad lifecycle `try` only at line 628;
- closes the handle in the corresponding `finally` at lines 1002–1004.

Therefore exceptions from either post-creation call occur outside the only `handle.close()` cleanup region.

**Fact — deterministic reproduction.** `.runs/v0-c/audit/probes/handle-pre-try-cleanup.mjs` used the permitted deterministic injected-real route with a non-secret test handle and no external call. It ran two cases:

| Throw site | Rejected | Handle created | `debugIdentity` calls | `abort` calls | `close` calls |
|---|---:|---:|---:|---:|---:|
| `lifecycleProbe("handle_created")` | true | 1 | 0 | 0 | 0 |
| `handle.debugIdentity()` | true | 1 | 1 | 0 | 0 |

The exact output is preserved in `.runs/v0-c/audit/probe-results.json`. External Provider, real model, network, and credential-read counters were all 0.

**Inference.** A successfully returned Run handle can retain in-memory Harness/Session/subscription resources when either pre-`try` operation throws. The probe demonstrates cleanup failure, but it does not demonstrate a wrongly accepted Outcome or external data leak; severity is therefore P2, not P1.

**Violated invariant.** `V0_C_GOAL_CONTRACT.md` §11.1 binds one long-lived handle to the Run lifecycle and requires finalization-time close semantics. The focused-audit prompt's mandatory handle question specifically requires fail-safe cleanup after handle creation.

**Bounded recommended correction.** Move every operation after successful handle creation, including the lifecycle hook and `debugIdentity()`, inside an outer `try/finally` that closes that exact handle once. Add focused injected-handle tests for both throw sites and assert one `close()` call, zero Attempt starts, zero terminal commit, and unchanged zero-call counters. Do not broaden scope to durable-runtime or cross-process cleanup.

### V0C-AUD-002 — P2 — Writer-side Run validation trusts caller assertions instead of actual Verifier/readback evidence

**Fact.** `workbench/src/evidence/run-validation-v0c.ts`, `RunValidationInputV0C` and `validateRunEvidenceV0C`, accept:

- `verifierAttemptIds: string[]`;
- `expectedEvidencePaths: string[]`;

but no Verifier result objects, Verifier ArtifactRefs, finalized Index items, or run-root readback capability.

**Fact.** In `workbench/src/run-v0c.ts`, `executeV0CRun` lines 782–795:

- supplies `verifierAttemptIds` as `attempts.map((attempt) => attempt.record.attempt_id)` at line 788, rather than deriving them from the actual Verifier results;
- supplies `expectedEvidencePaths` from the caller-built `expected` map at line 793;
- then uses `runValidation.valid` to choose the Outcome at lines 802–807.

Thus the writer-side validation proves consistency among caller assertions, not the exact relationship of persisted Verifier evidence and the closed terminal artifact set.

**Fact.** `workbench/src/inspect-v0c.ts` loads one Verifier file per Attempt and checks counts at lines 146–161, but its Attempt loop at lines 163–179 does not compare each loaded Verifier's `attempt_id` with the corresponding Attempt ID. At lines 233–238 it compares the Run-validation arrays with `run.attempt_ids`, which repeats the same caller assertion. Mutation-time Inspector rejection is also post-write and cannot substitute for writer-side fail-closed validation before terminal commit.

**Fact — bounded counterexample.** `.runs/v0-c/audit/probes/run-validator-caller-assertion.mjs` loaded an integrity-valid fixed Run, built a synthetic readback view whose first Verifier `attempt_id` mismatched its Attempt, and passed the original caller-asserted Attempt IDs to `validateRunEvidenceV0C`. The relationship mismatch was true, yet the validator returned:

```json
{"valid":true,"errors":[]}
```

No authoritative Run or source file was mutated. Exact results are in `.runs/v0-c/audit/probe-results.json`.

**Inference.** The production writer does not independently establish exactly one correctly related Verifier per started Attempt or validate the realized closed Index/artifact set before terminalization. Normal candidate control flow writes correctly related objects in the tested Runs, and this audit did not demonstrate an incorrectly accepted committed Outcome; severity is therefore P2, not P1.

**Violated invariant.** `V0_C_GOAL_CONTRACT.md` §14.3 requires exactly one Run-level validation, writer/Inspector shared closed-set policy, and terminal-last fail-closed behavior; §14.4 requires rejection of missing, unexpected, digest-mismatched, duplicate, and wrong-responsibility evidence; §15 requires exactly one identity/digest-bound external Verifier for every settled Attempt.

**Bounded recommended correction.** Before `runValidation.valid` can authorize an Outcome/terminal path:

1. derive Verifier relationships from the actual per-Attempt Verifier result/readback objects, not from `AttemptRecord.attempt_id`;
2. validate exactly one Verifier result/output and Attempt validation per started Attempt, including Attempt ID, Verifier identity/digest, run-relative ArtifactRef path, digest, size, and responsibility;
3. validate the realized finalized evidence items against the shared dynamic closed-set policy before terminal commit, rather than validating only an expected-path array;
4. make the Inspector check each loaded Verifier-to-Attempt relationship too;
5. add focused writer-side fault-injection tests proving no valid Outcome or terminal marker is committed for mismatched Verifier relation and realized Index/artifact faults.

This correction should remain within V0-C evidence validation and inspection; it does not require Stage 2, Pi changes, credentials, or a new evidence architecture.

## 6. Mandatory hardening conclusions

### Question 1 — handle created before broad `try/finally`

**Conclusion: reproduced cleanup violation.** Both permitted injected throw sites left a created handle with `close_calls=0`. This is finding V0C-AUD-001 (P2). Existing success and in-`try` failure tests do not cover these pre-`try` exceptions.

### Question 2 — caller-provided Verifier IDs / expected paths

**Conclusion: writer-side fail-closed establishment is absent.** The validator cannot observe actual Verifier objects or realized terminal evidence and the writer derives its inputs from its own Attempt/expected-plan arrays. The Inspector's current post-hoc checks do not establish the missing per-Verifier relation. This is finding V0C-AUD-002 (P2), distinct from mutation-only Inspector rejection.

## 7. V0-B accepted-protection regression matrix

`node --test workbench/tests/v0b-post-audit.test.ts` passed 11/11 and the complete 83/83 regression also passed.

| Protection | Independent regression evidence | Result |
|---|---|---|
| V0B-AUD-001 — scan attestation binding | Removed required scope, forged file/object digests, duplicate/wrong scope kind, and terminal scope-label mismatch were rejected. | PASS |
| V0B-AUD-002 — Index completeness/responsibility | Required omission after rebound, responsibility mismatch, unexpected entries, and missing declared Tool artifacts were rejected. | PASS |
| V0B-AUD-003 — terminal Journal suffix/projection | Swapped suffix, event after `run_terminal`, duplicate terminal events, and Outcome projection mismatch were rejected. | PASS |
| V0B-AUD-004 — wall-time truth | Wall-time crossing during scan and terminalization failed closed without a terminal marker. | PASS |
| V0B-AUD-005 — bounded secret scanner variants | Audited JSON, Authorization, and flat/nested Basic variants were rejected with metadata-only evidence. | PASS |

Source inspection also confirmed that V0-C reuses the accepted V0-B scanner and terminal/index policy rather than weakening their static protections. This matrix does not cure V0C-AUD-002's separate writer-side relationship/readback gap.

## 8. Prohibited-surface counters

| Counter | Observed |
|---|---:|
| External Provider calls | 0 |
| Real model calls | 0 |
| Network calls | 0 |
| Credential reads | 0 |
| Dependency installs | 0 |
| Dependency downloads | 0 |
| Pi patches | 0 |
| Private Pi imports | 0 |
| Stage 2 Runs | 0 |
| Source/fixture/test/control-file repairs | 0 |
| Staged files / commits created | 0 |

The handle probe used only `deterministic_injected_test` authority, a non-secret in-memory handle, and the frozen maximum budget object; execution stopped before any Attempt or Provider request.

## 9. Remaining limitations and non-claims

- This was a lightweight, focused, risk-driven audit of the four prompt-defined boundaries, not an unrestricted codebase audit.
- No real Provider, real model, credential, network, external service, registry, download, or Stage 2 path was exercised.
- No real user Task or naturally occurring real Recovery was run; real-route usability and policy effectiveness remain unproven.
- The Q2 probe is a synthetic validator counterexample, not a mutation of an authoritative Run and not evidence that a normally generated committed Run currently contains the mismatch. Its purpose is to decide whether writer-side validation independently establishes the invariant; it does not.
- No claim is made for cross-process resume, crash reconciliation, durable exactly-once execution, OS sandboxing, network egress blocking, general DLP, statistical reliability, generalization, or comparative effectiveness.
- The three already-disclosed TypeScript EOF blank-line warnings are formatting-only known non-findings and were not edited.
- Passing fixed-Run inspection and regression tests proves the checked cases only. It does not override the two reproduced/source-demonstrated P2 gaps.
- This report is advisory. Main Session and user retain acceptance and correction authority.

## 10. Disposition

Two unresolved P2 Contract violations prevent a focused-audit pass. Both have bounded source-local corrections and deterministic regression targets; neither requires Stage 2 or expanded authority.

```yaml
disposition: REQUEST_V0_C_BOUNDED_CORRECTION
```
