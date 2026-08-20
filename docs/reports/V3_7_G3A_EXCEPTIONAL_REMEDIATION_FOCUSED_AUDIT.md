# V3.7 Goal 3A Exceptional Remediation Focused Audit

```yaml
status: FAIL_V3_7_G3A_EXCEPTIONAL_REMEDIATION_FOCUSED_AUDIT
candidate_commit: f82a65612ef66b21f65c110fcdc4feee91907c74
candidate_tree: 04d73a7714f007a07ad7c9825dad02ca90267c51
candidate_parent: aa3f13ffa98eeb402dc4d29411cf63a8498b33ea
audit_mode: fresh_independent_read_only
source_or_test_changes: 0
control_state_changes: 0
audit_commits: 0
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
goal_3b_started: false
```

## Disposition

- **Fact:** Candidate commit, tree and parent match the immutable audit handoff exactly.
- **Fact:** The Candidate is one commit and changes ten paths, all within the accepted exceptional-remediation allowlist. Configuration, fixtures, accepted v1 files, V2/V3/V3.6 semantic modules and control state do not change.
- **Fact:** One in-scope P1 remains: a Host-only deterministic Regression-result switch can replace the exact Host-supplied Regression port for a real-declared Case and create a formal rejection without invoking that port.
- **Recommendation:** Do not accept Goal 3A or unlock Goal 3B from this Candidate. The one-Candidate exceptional budget is consumed; return to Main/user under the Amendment Hard Stop.

## Findings

### V37-G3A-EXAUDIT-P1-001 — real-declared Regression can bypass its exact construction port

- **Fact:** `ProductPortsV37G3A` exposes `regressionCandidatePass`; the constructor stores it independently of the Case Manifest, construction-authorization digests and supplied Regression port (`workbench/src/v37/product-service-v37g3a.ts:38,89`).
- **Fact:** `runRegression()` selects an internal `rejectionPort` when that switch is false, instead of the `configuredPort` whose presence was required by real construction authorization (`workbench/src/v37/product-service-v37g3a.ts:171`).
- **Fact:** Audit-local deterministic repro supplied an accepted temporary real-declared registration, exact authorization and all four ports. With `regressionCandidatePass:false`, the workflow reached `candidate_rejected` while the supplied Regression port call count remained `0`.
- **Inference:** This violates Prompt Section 5: real-declared Regression must continue through `executeSymmetricValidationV3` with only its execution port Host-supplied. The Host-only location prevents browser authority, but does not satisfy the exact construction-port contract.
- **Severity:** P1, repeated authority/terminalization class; blocking.

### V37-G3A-EXAUDIT-P2-002 — reported actual-operation assertion is not instrumentation

- **Fact:** The complete-route test creates `actualOperations` as a zero-valued object and compares it with the same zero-valued literal, but no Primary, Candidate, Regression or follow-up mock receives or increments that object (`workbench/tests/v37g3a-product.test.ts:50`).
- **Fact:** Source inspection shows the test mocks use local deterministic V2/Faux execution and local filesystem/verifier operations. The audit performed no Credential, network, external Provider or model operation.
- **Inference:** The route is locally deterministic, but the named assertion does not independently prove the report's “independently tracked actual operations” claim.
- **Severity:** P2, deterministic proof-quality gap.

## Contract checks

| Check | Result |
|---|---|
| Primary Run/workflow registration binding | PASS |
| canonical registry baseline versus caller-selected root | PASS |
| frozen Task/instruction/Source/Verifier content | PASS |
| disabled historical read-only reopen and retained artifacts | PASS |
| V2 `initial_pass` -> `no_recovery_needed` | PASS |
| V2 `recovery_none` -> `recovery_inconclusive` | PASS |
| V2 `recovery_selected` -> `ready_for_recovery` | PASS |
| real-declared V2 identities/counters/injected-port expectation | PASS |
| four ports and exact per-action/restart authorization | PASS WITH BLOCKING P1 EXCEPTION |
| default selected route through retained Assessment | PASS |
| Candidate/hash/allowlist/one-commit preservation | PASS |
| actual external operations zero | QUALIFIED BY P2 PROOF GAP |

## Verification

| Verification | Audit result |
|---|---|
| G3A authority/Product/HTTP | PASS, 20/20 |
| accepted G1/G2 | PASS, 25/25 |
| V2 excluding detached-worktree CLI child-process environment failure | PASS, 10/10 |
| V3 | PASS, 19/19 |
| V3.6 Product/HTTP/change handoff | PASS, 10/10 |
| demo smoke | PASS; project/Docker commands `0` |
| audit-local Regression-switch repro | PASS reproduction, 1/1; `candidate_rejected`, supplied Regression calls `0` |
| commit/tree/parent, allowlist, v1 hashes and `diff --check` | PASS |
| strict TypeScript in detached worktree | unavailable because ignored dependency/type roots are absent |

## Unverified and final result

- **Fact:** No real Provider/model/Credential/network behavior, strict Provider attestation, Goal 3B Case or user execution was tested or authorized.
- **Fact:** Candidate source/test/config/control state remained unchanged and the audit worktree ended with only this uncommitted report.
- **Fact:** The user-owned `docs/reports/SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md` was not read, changed, staged or committed.

`FAIL_V3_7_G3A_EXCEPTIONAL_REMEDIATION_FOCUSED_AUDIT`

