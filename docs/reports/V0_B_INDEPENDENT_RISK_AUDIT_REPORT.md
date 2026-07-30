# V0-B Independent Risk Audit Report

```yaml
report_role: independent_advisory_audit
candidate_commit: 18ba8466799198b1ce3e732990a49f626fb83d48
candidate_role: audit_candidate_only_not_accepted
control_baseline_parent: 32dc7b136053e2fdc17f294322a3cf7fef79e737
recommendation: REQUEST_BOUNDED_CORRECTION
finding_count: 5
highest_severity: P1
formal_v0_b_acceptance: false
current_state_modified: false
implementation_modified: false
fixed_runs_modified: false
real_or_external_provider_calls: 0
```

## 1. Audit authority, boundary, and result

**Fact:** This audit followed
`docs/reports/V0_B_INDEPENDENT_RISK_AUDIT_START_PROMPT.md`. It used the
candidate only as an immutable audit baseline. It did not accept V0-B, update
`CURRENT_STATE.md`, repair implementation source, stage or commit files, install
dependencies, read credentials, use the network, or call a real/external
Provider.

**Fact:** The candidate passes strict TypeScript, the complete 56-test
Workbench suite, the 11 targeted correction tests, the public Pi import smoke,
the accepted V0-A authoritative Run verifier, and the three accepted V0-A
public task tests. The six fixed V0-B Runs replay with the nominal results
claimed by the implementation report.

**Fact:** Independent copied-evidence probes nevertheless demonstrate that
`inspect` accepts:

1. an Evidence Index that omits a required terminal artifact;
2. a Journal whose required terminal events are in the wrong order;
3. a scan proof with required post-scan scopes removed; and
4. a scan proof whose recorded Session scope digest is false.

The Coordinator also freezes wall-time usage before scanning and
terminalization, and the bounded scanner misses several explicitly audited
credential/header encodings.

**Recommendation:** Do not accept the candidate. Request a bounded correction
limited to Findings V0B-AUD-001 through V0B-AUD-005 and their tests/report
claims. No Contract redesign, Pi patch, general DLP, Recovery, sandbox, or
real-model route is needed.

## 2. Candidate identity and isolation

| Check | Independent result |
| --- | --- |
| Candidate HEAD | `18ba8466799198b1ce3e732990a49f626fb83d48` |
| Candidate parent | `32dc7b136053e2fdc17f294322a3cf7fef79e737` |
| Detached audit worktree | `D:\AI\AI_Projects\project2\.runs\v0-b\audit\18ba846` |
| Audit raw | `D:\AI\AI_Projects\project2\.runs\v0-b\audit\18ba846\.runs\v0-b\audit-raw` |
| Audit-generated deterministic Runs | `D:\AI\AI_Projects\project2\.runs\v0-b\audit\18ba846\.runs\v0-b\runs` |
| Candidate tracked state before audit | clean; staged entries `0` |
| Candidate known untracked state before report | audit prompt plus registered read-only `reference/` tree |
| Audit worktree tracked state after probes/tests | clean |
| Pinned Pi HEAD | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| Reused V0-A Pi dependency HEAD | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |

Only ignored local dependency junctions were added in the isolated audit
worktree:

| Junction | Actual target |
| --- | --- |
| `workbench/node_modules/@earendil-works/pi-agent-core` | `D:\AI\AI_Projects\project2\.runs\v0-a\pi\packages\agent` |
| `workbench/node_modules/@earendil-works/pi-ai` | `D:\AI\AI_Projects\project2\.runs\v0-a\pi\packages\ai` |
| `workbench/node_modules/@types/node` | `D:\AI\AI_Projects\project2\.runs\v0-a\pi\node_modules\@types\node` |

**Fact:** No install, download, Registry access, or lifecycle script was used.
The first TypeScript attempt failed because the audit worktree did not yet have
the local `@types/node` junction. After adding the third junction above, the
same typecheck passed.

## 3. Source Inventory, Delta, and digest

| Evidence | Declared | Independent check |
| --- | ---: | --- |
| Candidate source inventory | 50 files | 50/50 Candidate Git blobs and 50/50 isolated-checkout bytes match declared size/SHA-256 |
| `source-inventory.json` SHA-256 | — | `6563583e6e999a29c1ae1d8d88a9bff49520e7aab4fda3f05a148bdfa5330581` |
| Declared source delta | 34 files | 34/34 size/SHA-256/change type match |
| `source-delta.json` SHA-256 | — | `3c4f68db9d450f3615d398ff73c14191c1ab4b3fc3d071089b8249b84a0990f4` |
| Actual parent-to-candidate commit delta | 35 files | the only non-declared entry is the prompt-authorized provenance file `docs/reports/V0_B_MAIN_REVIEW_BOUNDED_CORRECTION_PROMPT.md` |
| Workbench tree digest, excluding `node_modules` | — | `17daf52f08312659819877a7117e404aa1af0c0f293565a7a0448ca2627213d9` |

**Fact:** Imports from Pi resolve only through public emitted package roots:
`@earendil-works/pi-agent-core`, `@earendil-works/pi-agent-core/node`, and
`@earendil-works/pi-ai`. No `.upstream/pi` source import, private source import,
or Pi patch was found.

**Fact:** Source scanning found no `fetch`, HTTP(S), WebSocket, model API key,
or Node HTTP client surface in authorized Workbench source/scripts,
manifests, or verifier. The only environment reads are the bounded process
allowlist in `workbench/src/pi/tool-profile.ts:104-110` and
`V0B_WORKSPACE` in the fixed verifier. Test-only scenarios are options on the
programmatic runner and are not exposed by the default CLI parser in
`workbench/src/cli.ts:20-48`.

## 4. Commands, exits, and test counts

Runtime: Node `v24.14.1`; TypeScript `5.9.3`.

| Command or command family | Exit | Independent result |
| --- | ---: | --- |
| `git rev-parse HEAD HEAD^` in isolated worktree | 0 | exact candidate and parent |
| independent 50-entry Git-blob/checkout byte comparison | 0 | 50 checked, 0 mismatch |
| independent declared/actual delta comparison | 0 | 34 declared match; one allowed provenance exception; 35 actual |
| Workbench `treeDigest(..., new Set(["node_modules"]))` | 0 | exact expected digest |
| initial `tsc.cmd -p workbench/tsconfig.json` | 1 | audit setup only: missing local `@types/node` |
| same strict TypeScript command after bounded local junction | 0 | passed |
| `node --test 'workbench/test'` | 0 | 56 passed, 0 failed, 0 skipped |
| four initially guessed nonexistent `workbench/test/*.test.ts` paths | 1 | audit command-shape/path error; no product execution |
| corrected targeted files, executed one by one | 0 each | 4 + 3 + 2 + 2 = 11 passed, 0 failed, 0 skipped |
| `node 'workbench/scripts/public-import-smoke.mjs'` | 0 | all public Pi emitted imports resolved |
| accepted V0-A `verify-formal-run.mjs` | 0 | authoritative V0-A Run verified |
| accepted V0-A `node --test 'test/public.test.ts'` | 0 | 3 passed, 0 failed, 0 skipped |
| `node 'workbench/scripts/run-v0b-deterministic-suite.mjs'` in audit worktree | 0 | 4 terminal + 2 incomplete audit-local Runs; external 0, Recovery 0, child 0 |
| six fixed Run calls to `inspectRunV0B()` from candidate source | 0 | nominal replay results in Section 5 |
| seven-category fixed-Run content scan | 0 | 0 matched files in every category |
| `audit-probes.mjs` | 0 | two acceptance gaps reproduced; malformed/link probes correctly rejected |
| `scan-binding-probes.mjs` | 0 | two scan-attestation acceptance gaps reproduced |
| `scanner-variants.mjs` | 0 | three relevant false negatives reproduced; controls detected |
| `fixed-scan-binding-check.mjs` | 0 | current fixed pass Run's 8 file and 8 object scope digests/sizes match intended bytes |
| network/real-provider surface `rg` | 1 expected | no matches |

The corrected targeted files were:

- `workbench/tests/v0b-evidence.test.ts`: 4/4;
- `workbench/tests/v0b-inspect.test.ts`: 3/3;
- `workbench/tests/v0b-secret-scan.test.ts`: 2/2;
- `workbench/tests/v0b-verifier.test.ts`: 2/2.

The two exit-1 setup attempts are recorded rather than hidden. They did not
create a Run or alter source and do not count as candidate test failures.

## 5. Six fixed Run replays

| Scenario / Run | `committed` | `integrity_valid` | Status / failure class | Independent conclusion |
| --- | ---: | ---: | --- | --- |
| pass `run-dc84dc47-7fca-4e68-9118-7269e298c90f` | true | true | `passed/null` | nominal replay matches |
| agent failure `run-7da827c4-4c8f-463f-ac57-99d137ee9ea9` | true | true | `failed/agent` | nominal replay matches |
| verifier invalid `run-40360101-6ed0-4756-97ef-f63f98396bb1` | true | true | `invalid/verifier` | nominal replay matches |
| post-persistence corruption `run-4671912d-1e79-4eab-ad97-b54b70675147` | true | false | `invalid/evidence` | terminal envelope exists; corrupt evidence is not integrity-valid |
| append-operation failure `run-82895dce-f949-4771-9eec-5e80a904ad10` | false | false | incomplete/evidence | no terminal; no Outcome/Index; replay matches |
| secret-scan rejection `run-4a0e1530-e37d-43ab-a817-2a9d2ea62ebe` | false | false | incomplete/secret scan | no terminal; replay matches |

**Fact:** Every fixed `run.json` records `public_emitted_faux`,
`external: false`, `credentials_used: false`,
`external_provider_calls: 0`, exactly one Attempt, ordinal 1, and no parent
Attempt. The seven external content categories—thinking envelope, reasoning
signature, Bearer, API-key assignment, private sentinel, synthetic secret
value, and common model-environment assignment—each produced zero matched
files.

**Fact:** The fixed pass Run's recorded scan scopes are internally consistent
with its current intended evidence: eight sampled file scopes and eight object
scopes, including reconstructed preterminal Journal bytes and pending terminal
events, all match recorded digest and size. This is evidence about the fixed
Run, not proof that `inspect` enforces the same relationship; Finding
V0B-AUD-001 shows that it does not.

## 6. Findings

### V0B-AUD-001 — Scan attestation is not semantically bound

```yaml
finding_id: V0B-AUD-001
severity: P1
classification:
  - contract_blocker
  - bounded_correction
observation: >
  Fact: inspect validates the scan ArtifactRef, zero-match status, label equality,
  and a short mandatory-label subset, but it does not recompute scope digests
  against the evidence or require all post-scan scopes. Self-consistent copied
  evidence with three scopes removed, or with the Session scope digest replaced
  by 64 zeroes, is reported committed=true, integrity_valid=true, errors=[].
source_or_evidence_path:
  - workbench/src/inspect-v0b.ts:210-252
  - workbench/src/run-v0b.ts:617-778
  - .runs/v0-b/audit/18ba846/.runs/v0-b/audit-raw/scan-binding-probe-results.json
  - .runs/v0-b/audit/18ba846/.runs/v0-b/audit-raw/fixed-scan-binding-check.json
symbol_or_artifact:
  - inspectCore
  - scanPreterminalEvidenceV0B
  - scope_omission
  - scope_digest_forgery
reproduction_command: node '.runs/v0-b/audit-raw/scan-binding-probes.mjs'
expected: >
  Both copied Runs are integrity-invalid: required scan scope omission and a
  false scope digest cannot prove the terminal evidence was scanned.
actual: >
  Both copied Runs are committed=true, integrity_valid=true, errors=[].
contract_clause:
  - Contract 14.3 final secret scan
  - Gate C zero-match scan
  - Gate E terminal evidence
  - audit D2.2-D2.4 and D7 scan/terminal binding
affected_gate_or_DoD:
  - Gate C
  - Gate E
  - DoD 1
  - DoD 15
  - DoD 17
  - DoD 23
claim_impact: >
  "terminal proves completed scan scope and zero matches" is not allowed as a
  general integrity claim. It is only an observed property of the current fixed
  bytes.
recommended_action: >
  Define the exact mandatory V0-B scan scope, validate every scope label/kind
  exactly once, recompute file scopes and deterministic object projections, and
  bind the final Journal/post-scan objects without introducing a digest cycle.
  Add copied-evidence omission and digest-forgery regressions.
```

### V0B-AUD-002 — Evidence Index completeness is not enforced

```yaml
finding_id: V0B-AUD-002
severity: P1
classification:
  - contract_blocker
  - bounded_correction
observation: >
  Fact: inspect requires several files to exist but only requires Outcome and
  the scan result to appear in the Evidence Index. Removing attempt.json from
  index.items, then rebinding the copied Index and terminal digest, leaves
  committed=true, integrity_valid=true, errors=[].
source_or_evidence_path:
  - workbench/src/inspect-v0b.ts:115-125
  - workbench/src/inspect-v0b.ts:193-222
  - .runs/v0-b/audit/18ba846/.runs/v0-b/audit-raw/probe-results.json
symbol_or_artifact:
  - inspectCore
  - index_omission
reproduction_command: node '.runs/v0-b/audit-raw/audit-probes.mjs'
expected: >
  A required terminal artifact omitted from the Evidence Index is
  integrity-invalid.
actual: >
  The copied Run is committed=true, integrity_valid=true, artifact_count=22,
  errors=[].
contract_clause:
  - Contract 8.11 Evidence Index lists all terminal-evidence files
  - Gate E Evidence Index completeness
  - audit D3 and D7
affected_gate_or_DoD:
  - Gate E
  - DoD 1
  - DoD 15
  - DoD 17
claim_impact: >
  The fixed Index is complete by observation, but inspect cannot claim to
  enforce Contract-complete terminal evidence.
recommended_action: >
  Freeze and validate the exact required Index path/responsibility set for each
  legal terminal route, including Run, Attempt, Workspace, SessionRef/JSONL,
  Journal, Verifier result/output, validation, abort, scan, Outcome, config
  snapshots, and declared Tool artifacts. Preserve the explicit Index/terminal
  digest-cycle exclusions.
```

### V0B-AUD-003 — Required terminal Journal ordering is not enforced

```yaml
finding_id: V0B-AUD-003
severity: P1
classification:
  - contract_blocker
  - bounded_correction
observation: >
  Fact: validateJournal orders common, route, and evidence-validation events but
  excludes outcome_created and run_terminal. inspect checks only that each
  terminal event occurs once. A copied Journal with seq 56 run_terminal and
  seq 57 outcome_created, with valid Index/terminal digests, is accepted.
source_or_evidence_path:
  - workbench/src/evidence/journal.ts:112-142
  - workbench/src/inspect-v0b.ts:286-315
  - .runs/v0-b/audit/18ba846/.runs/v0-b/audit-raw/probe-results.json
symbol_or_artifact:
  - validateJournal
  - inspectCore
  - terminal_order
reproduction_command: node '.runs/v0-b/audit-raw/audit-probes.mjs'
expected: >
  evidence_validation_completed < outcome_created < run_terminal, with
  run_terminal last; the copied Run must be integrity-invalid.
actual: >
  The copied Run is committed=true, integrity_valid=true, errors=[].
contract_clause:
  - Contract 10.2 required event ordering
  - Contract 12.2 terminal written last
  - Gate C Journal ordering
  - Gate E terminal evidence
  - audit D7
affected_gate_or_DoD:
  - Gate C
  - Gate E
  - DoD 1
  - DoD 9
  - DoD 15
  - DoD 17
claim_impact: >
  "Journal closed-envelope validation passes required ordering" is too broad;
  the nominal fixed Journal is ordered, but the validator does not enforce the
  terminal suffix.
recommended_action: >
  Require exactly one outcome_created immediately before exactly one final
  run_terminal after evidence_validation_completed, and assert their
  status/failure_class/terminal_reason projections agree with Outcome.
```

### V0B-AUD-004 — Wall-time usage excludes scan and terminalization

```yaml
finding_id: V0B-AUD-004
severity: P1
classification:
  - contract_blocker
  - bounded_correction
  - claim_narrowing
observation: >
  Fact: finalBudget.wall_time_usage_ms is assigned at run-v0b.ts:548 and the
  wall-limit comparison occurs at 549-552. The scan starts at 619, and Journal
  terminal events, Run/Attempt/Outcome, Index, and terminal.json are written at
  701-778. wall_time_usage_ms is never refreshed. A limit crossed during these
  operations can still retain the earlier non-exhausted Outcome.
source_or_evidence_path:
  - workbench/src/run-v0b.ts:545-561
  - workbench/src/run-v0b.ts:617-778
  - docs/reports/V0_B_IMPLEMENTATION_REPORT.md:305-320
  - docs/reports/V0_B_CLOSEOUT_DRAFT.md:39
symbol_or_artifact:
  - executeV0BRun
  - finalBudget
  - budgetExhausted
reproduction_command: >
  rg -n "wall_time_usage_ms|scanPreterminalEvidenceV0B|evidence-index|terminal.json"
  workbench/src/run-v0b.ts
expected: >
  Recorded Run wall time covers the complete claimed Run through scan and
  terminalization, and a hard wall limit cannot be crossed without truthful
  classification.
actual: >
  The recorded value is a pre-scan snapshot; the limit test is post-hoc at that
  point and does not cover the remaining terminal path.
contract_clause:
  - Contract 13.1 required wall-time dimension
  - Gate F budget snapshot/usage truth
  - audit D8
affected_gate_or_DoD:
  - Gate F
  - DoD 1
  - DoD 16
claim_impact: >
  The reports' "actual observed wall time", "truthful wall-time usage", and
  hard-bound wording are not allowed without qualification.
recommended_action: >
  Define the V0-B wall-time endpoint explicitly, update usage at the latest safe
  point, and ensure a limit crossed during scan/terminalization cannot produce a
  passed Outcome. Keep the solution bounded; no general cancellation runtime or
  process-tree guarantee is required.
```

### V0B-AUD-005 — Bounded scanner has relevant encoding false negatives

```yaml
finding_id: V0B-AUD-005
severity: P2
classification:
  - bounded_correction
  - claim_narrowing
observation: >
  Fact: independent synthetic probes detect ordinary api_key objects, nested
  thinking, multibyte-context api_key, and a file Bearer value with spaces.
  They do not detect a raw JSON-escaped api_key name, a Basic Authorization
  header, or Bearer separated by tab/newline when an object is first stable-JSON
  serialized (the whitespace becomes an escape sequence).
source_or_evidence_path:
  - workbench/src/evidence/secret-scan.ts:6-15
  - workbench/src/evidence/secret-scan.ts:24-50
  - .runs/v0-b/audit/18ba846/.runs/v0-b/audit-raw/scanner-variant-results.json
symbol_or_artifact:
  - RULES
  - scanText
  - scanPreterminalEvidenceV0B
reproduction_command: node '.runs/v0-b/audit-raw/scanner-variants.mjs'
expected: >
  Within the bounded V0-B evidence formats, JSON-escaped credential keys and
  authorization-header/Bearer variants are conservatively rejected without
  persisting matched values.
actual: >
  escaped_json_key_file, basic_authorization_file, bearer_tab_object, and
  bearer_newline_object return status=passed and match_count=0.
contract_clause:
  - Contract 14.3 final secret scan
  - Contract Pause Condition 4
  - audit D2 adversarial variants
affected_gate_or_DoD:
  - Gate C
  - DoD 23
claim_impact: >
  The scanner may be described as a fixed bounded rule set, not as complete
  coverage of API keys or authorization headers. No real secret was used or
  observed in this audit.
recommended_action: >
  Normalize or scan both raw and decoded-safe representations for the bounded
  JSON/text formats, add explicit Authorization scheme handling, and add the
  synthetic regressions above. Do not expand this into general DLP.
```

## 7. D1–D10 independent conclusions

| Scope | Result | Evidence-based conclusion |
| --- | --- | --- |
| D1 Source identity and scope | PASS | Exact candidate, 50/50 inventory, 34/34 declared delta plus allowed provenance exception, tree digest, public imports, clean protected/Pi boundaries, Faux-only/no Recovery/no child Attempt verified. |
| D2 Pre-terminal scan | FAIL | Scan executes before terminal and fixed bytes match intended scopes; rejection/failure safely omit terminal and matched values are not persisted. However scope/digest proof is not enforced, post-scan final bytes are not revalidated, and relevant regex false negatives exist. |
| D3 ArtifactRef and Inspect | FAIL | Traversal, Windows path forms, linked root/intermediate junction/final link/directory, malformed JSON/JSONL/Index, missing and digest mismatch paths are safely rejected in tests/probes. Evidence Index completeness is not enforced (V0B-AUD-002). |
| D4 Verifier | PASS | Run-local write-once snapshot, frozen digest, post-settled/session-complete sequencing, bounded execution evidence, no env values, ArtifactRefs, and failure classifications independently pass. No process-tree guarantee is inferred. |
| D5 Reasoning-safe Session | PASS | Runtime/evidence Session separation, public reopen, IDs, Tool pairing, synthetic reasoning/signature stripping, Unicode character/UTF-8 byte metadata, credential-key stripping, truncation metadata, and `resume_capability: not_claimed` pass current tests/source review. |
| D6 Persistence/corruption | PASS | Actual mirror append failure stops before Verifier/Outcome/Index/terminal and is not Agent failure; post-persistence corruption yields terminal-envelope `committed: true` but `integrity_valid: false` and `invalid/evidence`. |
| D7 Outcome/Journal/terminal | FAIL | Outcome precedence and one-Attempt nominal routes pass, but required terminal Journal order, scan binding, and Index completeness are not enforced. |
| D8 Budget/abort/timing | FAIL | Faux provider/tool counts and fixed abort snapshots are bounded; cost/token/external claims are truthful. Wall time excludes scan/terminalization and the claimed hard limit is incomplete (V0B-AUD-004). |
| D9 Fixed evidence replay | PASS | All six preserved fixed Runs replay with their nominal stated outcomes; no fixed Run was overwritten. This does not cure semantic validation gaps exposed on copies. |
| D10 Claims | PARTIAL | Several bounded mechanism claims remain allowed; acceptance-grade terminal-integrity, scan-proof, Journal-order, and complete wall-time claims must be narrowed until corrected. |

## 8. Gates A–H

| Gate | Recommendation | Reason |
| --- | --- | --- |
| A — Control/source identity | PASS | Immutable candidate, correct parent/Pi/V0-A identities, clean tracked/protected state, no real model authorization. |
| B — Contract/preflight | PASS | Strict types, fixed identities/digests, pre-side-effect rejection, V0-A regression. |
| C — Session/Journal | FAIL | Session evidence passes, but terminal Journal ordering and trustworthy scan proof do not. |
| D — External Verifier | PASS | Authority, sequencing, snapshot identity, bounded execution evidence, and classification pass. |
| E — Outcome/terminal evidence | FAIL | Index completeness and scan attestation are not enforced; self-consistent semantic corruption is accepted. |
| F — Budget/abort/inspect | FAIL | Wall usage is incomplete and inspect does not validate all required integrity semantics. |
| G — Deterministic task | PASS | Four terminal/two incomplete routes, 56 tests, strict TypeScript, and fixed IDs execute as claimed. |
| H — Scope/continuity | PASS | No Pi patch/private import, Recovery, child Attempt, network/download, control mutation, or V1/V2 scope expansion. |

Gate R remains unauthorized and was not executed.

## 9. Definition of Done 1–25

| DoD | Result | Note |
| ---: | --- | --- |
| 1 | FAIL | Gates C, E, and F fail audit. |
| 2 | PASS | Accepted V0-A verifier and 3/3 public tests pass. |
| 3 | PASS | Strict TypeScript passes. |
| 4 | PASS | Only public emitted Pi imports. |
| 5 | PASS | Nominal identities correlate. |
| 6 | PASS | Exactly one initial Attempt. |
| 7 | PASS | Reasoning-safe evidence Session is append-only/public-openable in tested routes. |
| 8 | PASS | Tool IDs correlate in fixed valid evidence. |
| 9 | FAIL | Validator omits required `outcome_created < run_terminal` ordering. |
| 10 | PASS | Verifier starts after settled/session persistence. |
| 11 | PASS | Valid task failure and Verifier invalid are distinct. |
| 12 | PASS | ArtifactRef path/digest/size boundary passes current Contract threat model. |
| 13 | PASS | Accepted Outcome precedence is implemented/tested. |
| 14 | PASS | Nominal valid terminal Runs have one Outcome and one terminal record. |
| 15 | FAIL | Self-consistent semantic corruption/omission can be accepted. |
| 16 | FAIL | Wall-time usage is not complete/truthful through terminalization. |
| 17 | FAIL | `inspect` integrity validation is incomplete. |
| 18 | PASS | Pass/agent-fail/verifier-invalid/evidence-invalid deterministic cases execute. |
| 19 | PASS | External Provider/model calls are exactly zero. |
| 20 | PASS | Recovery and child Attempts are exactly zero. |
| 21 | PASS | Pi patch/private imports are exactly zero. |
| 22 | PASS | Protected upstream, V0-A, control, and reference boundaries are unchanged. |
| 23 | FAIL | Fixed bytes show zero matches, but required scan proof/coverage is not acceptance-grade. |
| 24 | PASS | Required implementation/report/evidence artifacts exist. |
| 25 | FAIL | Gate, scan-proof, and wall-time claims are broader than verified behavior. |

Independent total: `17 PASS / 8 FAIL`.

## 10. Allowed and not-allowed claims

### Allowed with current evidence

- **Fact:** The six named fixed Runs use public emitted Faux, one initial
  Attempt, zero external Provider calls, zero Recovery, and zero child Attempts.
- **Fact:** The fixed pass, Agent-failure, and Verifier-invalid Runs replay with
  nominally correlated Run/Attempt/Session/Journal/Workspace/Verifier/Outcome
  identities.
- **Fact:** The tested reasoning-safe evidence Session reopens with public Pi
  JSONL storage and removes synthetic reasoning/signature content while
  preserving bounded metadata.
- **Fact:** Valid Verifier task failure and invalid Verifier infrastructure are
  distinct in the fixed routes.
- **Fact:** The fixed corruption route is attributed to evidence, not Agent
  failure.
- **Fact:** No Pi Core patch or private import is present.
- **Fact:** `committed: true` means that a terminal envelope and its direct
  Outcome/Index digests match; it does not imply `integrity_valid: true`.

### Claims that must be narrowed pending correction

- **Recommendation:** Replace “inspect validates complete terminal evidence”
  with “inspect validates the currently implemented subset; known scan,
  Index-completeness, and terminal-order checks are missing.”
- **Recommendation:** Replace “terminal proves scan scope and zero matches”
  with “the current fixed Run's recorded scan bytes independently match; the
  inspector does not enforce that binding.”
- **Recommendation:** Replace “actual Run wall time / hard wall bound” with
  “pre-scan elapsed-time snapshot; scan and terminalization are excluded.”
- **Recommendation:** Treat “settled Attempt → auditable external Outcome” as a
  nominal fixed-route demonstration, not an accepted V0-B integrity guarantee.
- **Recommendation:** Change
  `corrected_gate_a_through_h: recommended_pass` and
  `recommended_25_of_25` in the candidate reports after bounded correction and
  rerun; the independent result is Gate C/E/F fail and 17/25 pass.

### Claims still not allowed

- V0-B real-model effectiveness or Completion Policy improvement;
- Recovery effect or child-Attempt policy;
- cross-process Resume or durable runtime;
- crash-after-side-effect reconciliation;
- exactly-once Tool execution;
- OS sandbox or network-egress enforcement;
- process-tree termination;
- statistical Eval validity;
- V1/V2 implementation.

## 11. What remains unverified

- **Unconfirmed:** POSIX symlink behavior was not executed; Windows junction and
  reparse branches were exercised. No stronger cross-syscall race resistance is
  claimed or required.
- **Unconfirmed:** A deliberately slow scanner/terminal filesystem was not
  injected. The wall-time defect is established from the single assignment and
  subsequent call order in source, not from a 120-second timing run.
- **Unconfirmed:** Real Provider/model, credentials, network egress, and Stage 2
  behavior were intentionally not tested.
- **Unconfirmed:** General credential/DLP coverage outside the fixed V0-B
  evidence formats is out of scope.
- **Unconfirmed:** Crash recovery, process-tree termination, cross-process
  Resume, and exactly-once effects remain explicit non-claims.

## 12. Before/after status and final recommendation

**Fact:** At audit start the main candidate had zero tracked changes and zero
staged entries; only the audit prompt and the registered read-only reference
tree were untracked. The detached audit worktree and both Pi checkouts were
clean. At report completion, the only new official project output is this
untracked audit report; all other audit-generated artifacts remain below the
allowed ignored audit path. `CURRENT_STATE.md`, candidate source, fixed V0-B
Runs, V0-A evidence, control documents, `.upstream/pi`, and reference material
were not modified.

```yaml
recommendation: REQUEST_BOUNDED_CORRECTION
reason:
  - four P1 Contract blockers are independently reproducible
  - one P2 bounded scanner/claim correction is independently reproducible
required_next_owner: main_project_control_session_with_user
auditor_action_after_report: stop_and_wait
```
