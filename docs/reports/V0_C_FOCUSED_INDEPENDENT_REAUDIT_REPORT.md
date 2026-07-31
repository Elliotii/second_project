# V0-C Focused Independent Re-audit Report

Re-audit date: 2026-07-31 (UTC)  
Role: original independent V0-C Audit Session  
Repository: `D:\AI\AI_Projects\project2`  
Scope: only `V0C-AUD-001` and `V0C-AUD-002`, their directly affected V0-C/V0-B boundaries, and corrected authoritative evidence

## 1. Result

**Fact.** Both accepted P2 findings are resolved on the exact corrected
Candidate. Strict TypeScript, the focused correction suite, the accepted V0-B
mutation suite, and the one complete Workbench regression all pass. All five
corrected authoritative Runs commit and inspect successfully while binding the
corrected Workbench digest.

**Fact.** No new unresolved finding was observed within the authorized
re-audit scope.

## 2. Gate A — corrected Candidate identity

| Identity/boundary | Required | Independently observed | Result |
|---|---|---|---|
| Root `HEAD` | `861b7241e8abf8608fc981a68bae39037f598f5d` | exact match | PASS |
| Workbench digest | `a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446` | independently recomputed exact match | PASS |
| Pi `HEAD` | `027a5847901b5dde30270abaa1041046cd2b4b55` | exact match | PASS |
| Root tracked/staged state | empty | 0 tracked changes; 0 staged paths | PASS |
| Untracked boundary | `reference/` and this re-audit Prompt only before evidence/report | 1906 paths; 0 unexpected | PASS |
| Pi state | clean | empty status | PASS |
| Failed Candidate | Git object `930c549b402fce9ffa96847a673ad187c64f6094` preserved | object type `commit` | PASS |
| Original audit Prompt/Report | unchanged and candidate-tracked | both tracked; original report SHA-256 `ac7e3e196f3853c4a40d77cbda734dd03c515878cbc9a01c60b647e9644e613a` | PASS |
| Original ignored audit evidence | unchanged | tree digest `f791c5f826148021d9d0013d4e9cf8f5ac39b280ca5f6bf5d5722a3267480aa8`, exactly matching correction-entry evidence | PASS |
| Prohibited authority | none opened | no credential, network, Provider/model, dependency, Pi, Git-stage/commit, or Stage 2 capability opened | PASS |

Git read-only commands used per-command `safe.directory` configuration because
of host ownership metadata; no Git configuration was persisted.

The seven corrected Workbench source/test paths exactly match
`.runs/v0-c/evidence/source-inventory.json` and the Git delta from the failed
Candidate to the corrected Candidate. All seven current SHA-256 values match
the inventory; mismatch count is 0.

## 3. Exact source and symbol review

Only the correction delta and directly cited evidence were reviewed.

### 3.1 V0C-AUD-001

In `workbench/src/run-v0c.ts`, `executeV0CRun`:

- creates the one handle at line 435;
- enters the outer `try` immediately at line 442;
- executes `lifecycleProbe("handle_created")` and `debugIdentity()` inside that
  boundary at lines 443–444;
- writes `terminal.json` and emits `terminal_committed` at lines 1095–1096 on
  the normal committed path;
- executes the one `handle.close()` in the outer `finally` at lines 1115–1117.

The same `handle` is closed by the `finally` and captured by the single
`evaluate` closure used for both initial and child Attempts. There is no
post-creation operation between handle assignment and the cleanup boundary.

Focused deterministic proofs are
`workbench/tests/v0c-post-audit-correction.test.ts` lines 90 and 124. Each
injected post-creation exception proves:

- the call rejects;
- exactly one handle is created;
- `close()` is called exactly once;
- `runAttempt()` is not called and no Attempt starts;
- no `outcome.json`, `evidence-index.json`, or `terminal.json` exists;
- Provider/model/network/credential counters remain 0.

The normal close-after-terminal sequence remains covered by the source order,
`V0C-MR-001` in the complete regression, and the normal one/two-Attempt focused
test.

### 3.2 V0C-AUD-002

In `workbench/src/evidence/run-validation-v0c.ts`:

- `RunValidationInputV0C` at line 23 receives `runRoot`, actual
  `AttemptValidationEvidenceV0C[]`, actual `VerifierEvidenceV0C[]`, and frozen
  Verifier identity/digest;
- `readbackMatches` at line 43 applies existing ArtifactRef validation and
  stable object readback comparison;
- `validateRunEvidenceV0C` at line 59 checks exact Attempt/validation/Verifier
  counts and relationships, expected per-Attempt paths, validation identity,
  Verifier Attempt relationship, frozen identity/digest, result readback, and
  result/output ArtifactRef path/digest/size.

In `workbench/src/run-v0c.ts`, `executeV0CRun`:

- supplies actual validation objects/refs and Verifier objects/result/output
  refs at lines 810–844;
- writes exactly one Run-validation object and appends exactly one
  `run_evidence_validation_completed` event at lines 853–858;
- returns before Outcome construction when that validation is invalid at line
  859;
- creates realized Index items and validates them with
  `validateTerminalIndexPolicyV0C` plus ArtifactRef readback at lines
  1030–1047;
- returns uncommitted on realized-Index errors at line 1048;
- writes the terminal marker only after those checks at line 1095.

In `workbench/src/inspect-v0c.ts`, `inspectRunV0C` explicitly checks loaded
Verifier-to-Attempt relation, frozen identity/digest, expected output path and
ArtifactRef validity at lines 201–210, Attempt-validation identity at line
213, and Verifier output ArtifactRef/Index equality at line 271. It continues
to apply the shared dynamic closed-set policy.

The eight-test focused suite covers actual Verifier relation/identity faults,
missing/duplicate Verifier evidence, result-ref path/digest/size faults,
realized Index omission/unexpected/wrong-responsibility faults, explicit
Inspector rejection, and normal one/two-Attempt commits.

## 4. Finding resolution table

| Finding | Resolution | Independent proof | Remaining limitation |
|---|---|---|---|
| `V0C-AUD-001` | **RESOLVED** | Source places every operation after successful handle creation inside the one outer cleanup boundary. Both injected exceptions close the exact handle once and create no Attempt/Outcome/Index/terminal. Normal lifecycle remains terminal-commit then close. | Same-process cleanup only; no cross-process/crash-durability claim. |
| `V0C-AUD-002` | **RESOLVED** | Validator consumes actual objects/refs and readback; writer rejects relation/count/identity/ref faults before Outcome, validates realized Index items with the shared policy before `terminal.json`, preserves one Run-validation object/event, and Inspector performs explicit relationship/identity/ref checks. | A late realized-Index rejection may leave deterministic preterminal files; without `terminal.json`, API Outcome/terminal result is null and Inspector reports uncommitted/invalid. This is not a committed Outcome and no general transaction system is claimed. |

**Fact — committed versus preterminal distinction.** Verifier/validation
relationship and ref faults return before Outcome construction. Realized-Index
faults necessarily occur after deterministic terminal-candidate objects and
the planned Journal suffix have been materialized; those files may remain for
inspection, but `terminal.json` is absent, the returned Outcome and terminal
record are null, and `inspectRunV0C()` reports `committed=false` and
`integrity_valid=false`. This matches the bounded correction prompt and is not
promoted into a durability finding.

## 5. Commands, UTC intervals, exits, and test counts

All successful verification commands ran from
`D:\AI\AI_Projects\project2`.

| UTC interval | Exact command | Exit | Result |
|---|---|---:|---|
| 2026-07-31T01:45:24.3651058Z–2026-07-31T01:45:31.4902900Z | `& '.runs/v0-a/pi/node_modules/.bin/tsc.cmd' -p 'workbench/tsconfig.json'` | 0 | strict TypeScript passed; no diagnostics |
| 2026-07-31T01:45:39.9452906Z–2026-07-31T01:46:23.5596110Z | `node --test workbench/tests/v0c-post-audit-correction.test.ts` | 0 | 8/8 pass; 0 fail/skip/cancel/todo |
| 2026-07-31T01:46:32.3555394Z–2026-07-31T01:46:50.2024910Z | `node --test workbench/tests/v0b-post-audit.test.ts` | 0 | 11/11 pass; 0 fail/skip/cancel/todo |
| 2026-07-31T01:46:58.7408637Z–2026-07-31T01:48:40.7576977Z | `node --test workbench/test` | 0 | the one complete regression: 91/91 pass; 0 fail/skip/cancel/todo |

One earlier invocation of the same strict-TypeScript command was terminated by
the command runner after 34.05 seconds with tool exit 124 before its buffered
UTC marker or compiler result was returned. It is not counted as a test or
pass; the immediately repeated fully recorded invocation passed.

Exact identity/source/Run check commands and every individual inspect interval
are preserved in `.runs/v0-c/reaudit/COMMAND_LOG.md`; structured results are in
`.runs/v0-c/reaudit/CHECK_RESULTS.json`.

## 6. Corrected authoritative Run inspection

| Run | Role/result | Attempts | Artifacts | Inspect |
|---|---|---:|---:|---|
| `run-6086c401-622a-443f-be08-7f2e6f17215b` | observe pass; no recovery | 1 | 26 | committed, integrity-valid |
| `run-52eb0894-67ac-4054-aead-e7b39228033e` | recovery pass | 2 | 35 | committed, integrity-valid |
| `run-fabfbd25-c605-4c98-8d68-5f19eb4c3529` | recovery counterexample; failed/agent | 2 | 28 | committed, integrity-valid |
| `run-7b1a2c86-ab93-412d-bb4b-58e5fea1f21e` | injected-fake real profile; passed | 2 | 35 | committed, integrity-valid |
| `run-b5108529-1b3b-4f4d-9cd5-40e83e64b8b3` | formal CLI recovery pass | 2 | 35 | committed, integrity-valid |

For every Run, independent readback confirmed:

- `source_identity.workbench_tree_digest` exactly equals
  `a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446`;
- integrated scan status `passed`, `match_count: 0`;
- valid Run validation;
- exactly one Run-validation event, Outcome event, and `run_terminal` event;
- final Journal suffix exactly `outcome_created`, `run_terminal`;
- `terminal.json` present;
- `protected_files_unchanged: true`;
- external Provider calls 0.

The corrected Candidate commit contains the exact seven inventoried Workbench
delta files whose hashes produce the bound digest; this connects the
authoritative Run digest to the immutable corrected Candidate.

## 7. Directly affected V0-B boundary

The accepted V0-B post-audit suite passed 11/11 both directly and within the
91/91 complete regression:

- scan scope/digest/kind/label binding remained fail closed;
- Index omission, unexpected path, responsibility mismatch, and missing Tool
  artifacts remained fail closed;
- terminal Journal suffix/projection protections remained fail closed;
- wall-time crossing remained uncommitted;
- bounded scanner Authorization variants remained metadata-only and rejected.

The corrected writer calls the existing shared
`validateTerminalIndexPolicyV0C`, which retains the accepted V0-B policy rather
than weakening it.

## 8. Prohibited-surface counters

| Counter | Observed |
|---|---:|
| External Provider calls | 0 |
| Real model calls | 0 |
| Network calls | 0 |
| Credential reads | 0 |
| Dependency installs/downloads | 0 |
| Pi patches | 0 |
| Private Pi imports | 0 |
| Stage 2 Runs | 0 |
| Source/fixture/test/implementation-report repairs by this Session | 0 |
| Control-state modifications | 0 |
| Staged files / commits created | 0 / 0 |

Test-generated Run artifacts remained under ignored `.runs/`. No authoritative
Run or `.runs/v0-c/audit/` artifact was modified.

## 9. Remaining limitations and non-claims

- This was an affected-findings-only re-audit, not a reopened broad V0-C audit.
- No real Provider/model, credential, network, external API, registry,
  dependency installation, Pi modification, or Stage 2 execution occurred.
- No real user Task or naturally occurring real Recovery was run.
- No claim is made for policy effectiveness, statistical reliability,
  generalization, cross-process resume, crash reconciliation, durable
  exactly-once execution, OS sandboxing, network-egress prevention, general
  DLP, V1, V2, or V3.
- The focused fault injections prove the specified writer boundary. They do not
  introduce or prove a general transaction system.
- Formatting-only hard breaks, line endings, and disclosed EOF warnings are
  non-findings.
- This report is advisory. It does not accept V0-C, update control state,
  authorize an Implementation Baseline, or authorize Stage 2.

## 10. Disposition

Both accepted findings are resolved, directly affected regressions remain
green, corrected authoritative evidence binds the exact corrected Workbench
identity, and no unresolved in-scope finding remains.

```yaml
disposition: PASS_FOCUSED_V0_C_REAUDIT
```
