# V3.7 Goal 3A Final Audit Remediation Report

## Status

- **Fact:** This is the sole Candidate authorized by `V3_7_G3A_FINAL_AUDIT_REMEDIATION_AMENDMENT.md`.
- **Fact:** It closes only `V37-G3A-EXAUDIT-P1-001` and `V37-G3A-EXAUDIT-P2-002` from starting commit `80b4172eae945349b993d598378116d6d42a374a` / tree `9e689fbd776b7ef6a012049f75ab7c0923b401e4`.
- **Fact:** Earlier Candidates remain preserved and unamended. Goal 3A is pending Main rereview and fresh independent re-audit; Goal 3B remains locked.

## Exact code branch and deterministic proof

`ProductServiceV37G3A.runRegression()` reloads the workflow registration and derives
`realAccessDeclared` from its Host-loaded Manifest. A real-declared Case selects the exact
supplied `configuredPort`; only a frozen deterministic Case may apply
`regressionCandidatePass` and the internal rejection adapter.

- With `regressionCandidatePass:false`, the valid supplied Regression mock was invoked
  twice, once for each symmetric arm. Its result promoted the Candidate and advanced the
  workflow to `ready_for_follow_up`; no `regression_rejected` artifact appeared.
- A throwing supplied Regression mock was invoked once. Its exact error propagated, the
  receipt count remained unchanged, the stage remained `ready_for_regression`, no
  promotion/rejection receipt appeared, and no internal fallback ran.
- The frozen deterministic `regressionCandidatePass:false` route still reached the honest
  `candidate_rejected` terminal.

## Shared actual-operation tracker

The temporary real-Case helper creates one tracker before constructing its four local
mocks. Primary, Candidate proposal, Regression validation and follow-up Runtime close over
that same tracker and record only through `recordLocalMock`. A distinct
`recordActualExternalOperation` method is the explicit boundary for Credential, network,
external Provider or real-model operations; none of the four local mocks calls it.

The complete selected route recorded:

| Counter family | Primary | Candidate proposal | Regression validation | Follow-up Runtime |
|---|---:|---:|---:|---:|
| local mock invocations | 1 | 1 | 2 | 1 |

| Actual external operation | Count |
|---|---:|
| Credential reads | 0 |
| network calls | 0 |
| external Provider calls | 0 |
| real-model calls | 0 |

The Manifest tuples `1/2/1/1` for Primary and `1/1/1/1` for follow-up remain formal
simulated counters only; they were not relabeled as actual operations.

## Changed files

- Source: `workbench/src/v37/product-service-v37g3a.ts`.
- Test: `workbench/tests/v37g3a-product.test.ts`.
- Reports: `docs/reports/V3_7_G3A_IMPLEMENTATION_REPORT.md`,
  `docs/reports/V3_7_G3A_CLOSEOUT_DRAFT.md`, and this report.
- Configuration, fixtures, contracts, registry, frozen v1 files, V2/V3/V3.6 semantic
  source, control state, Pi, packages and compiler configuration are unchanged.

## Verification

All commands ran serially from `workbench/` without dependency installation.

| Verification | Result |
|---|---|
| G3A authority/Product/HTTP | PASS, 22/22 |
| accepted G1/G2 | PASS, 25/25 |
| V2 | PASS, 11/11 |
| V3 | PASS, 19/19 |
| V3.6 Product/HTTP/change handoff | PASS, 10/10 |
| `npm run typecheck` | unavailable: the fixed ignored worktree compiler path is absent |
| authorized existing TypeScript compiler with `--noEmit` | PASS, zero diagnostics |
| demo smoke | PASS; loopback start/stop, project commands 0, Docker commands 0 |
| thirteen accepted v1 SHA-256 values | PASS, 13/13 exact |
| configuration/fixture tracked bytes | PASS, unchanged from starting commit |
| exact five-path allowlist and `git diff --check` | PASS |

The loader fingerprint remains
`541fa4e7c0008e959049f6baacfd833e1a2510d1c5749fdbe21d62eef807eb30`.
The deterministic trust roots remain
`681699639dca80f787e70d1e116475f638792be9476fa1dc85a82fb86191dc3d` and
`4c7f1f5d1123de3b5beb94f97e8ff112a851a99b7048081a14fd9c186c812632`.

## Unverified and next action

- No real Provider/model/Credential/network behavior, strict Provider attestation,
  Goal 3B Case or user execution was tested or authorized.
- Main must verify the single Candidate commit/tree and allowlist. Only a passing Main
  rereview may freeze this Candidate and start a fresh independent read-only re-audit.
