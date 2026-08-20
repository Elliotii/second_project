# V3.7 Goal 3A Exceptional Remediation Report

## Status

- **Fact:** The user-authorized one-time remediation closes only repeated finding `V37-G3A-MAIN-P1-001`.
- **Fact:** Ordinary correction budget remains exhausted at `2/2`; this is the sole exceptional Candidate.
- **Fact:** Prior Candidates `71dd205e...`, `1843a683...` and `84d8f870...` remain preserved and unamended.
- **Fact:** Goal 3A is pending Main rereview and focused audit. Goal 3B remains locked.

## Exact routes

| Independently inspected Primary fact | Product route | Learning availability |
|---|---|---|
| frozen G3A Primary PASS or V2 `initial_pass` | `no_recovery_needed` | none |
| V2 failed Primary plus `recovery_selected` | `ready_for_recovery` | registered Recovery action only |
| V2 failed Primary plus `recovery_none` | `recovery_inconclusive` | none |
| malformed, substituted, contradictory or unbound terminal | fail closed before receipt | none |

Real-declared Primary execution requires V2, `real_execution_authorized: true`, injected
execution-port identity and the exact Host-loaded counter tuple. The Recovery bridge uses
the same Host-loaded declaration and preserves the V2 controller model identity without
misrepresenting it as the separate external Provider profile.

## Construction boundary

- Required ports: Primary, bounded Candidate proposal, symmetric Regression validation and bound follow-up Runtime.
- Construction authorization binds Case, Manifest, follow-up profile, Primary/follow-up counter expectations, registered Candidate-proposal authority and Regression authority.
- Candidate and Regression authority digests derive from the selected Manifest provider/tool/command/budget/stop plus Candidate policy and Regression pack specs.
- Every mutating `act()` reloads current registration and rechecks the complete authorization and all four ports. Read-only list/get/reopen requires neither.
- Frozen deterministic Case ports remain non-overridable.

## Deterministic proof

A temporary ignored registration was derived from the registered Recovery Case and the
tracked registry was restored in `finally`. Explicit local V2 execution ports produced
injected manifests and simulated Primary counters `{credential_reads:1, network_calls:2,
external_provider_calls:1, real_model_calls:1}`.

- V2 PASS reached only `no_recovery_needed`.
- Two failed Candidate Paths reached only `recovery_inconclusive`.
- Selected Recovery traversed all ten Product actions through Recovery admission,
  registered generic Candidate, genuine symmetric Regression publication, local V3.6
  Runtime observation/Manifest, frozen Verifier/Outcome, second admission and retained
  G2 Assessment; the complete workflow reopened after a fully authorized restart.
- A ports-only restarted service rejected every later mutation before artifact change.
- Config-only, ports-only, authorization-only, each missing port, wrong Case/Manifest/
  profile/counter/Candidate/Regression identity, internal real port kind, G3A-local real
  PASS terminal and substituted V2 terminal all failed closed.

Follow-up formal simulated counters were `{credential_reads:1, network_calls:1,
external_provider_calls:1, real_model_calls:1}`. Independently tracked actual operations
were Credential reads `0`, network calls `0`, external Provider calls `0` and real-model
calls `0`.

## Changed files

- Source: `v37g3a-types.ts`, `host-registry-v37g3a.ts`, `registered-recovery-v37g3a.ts`, `product-service-v37g3a.ts`, `workflow-v37g3a.ts`, `inspect-v37g3a.ts`.
- Tests: `v37g3a-product.test.ts`.
- Reports: implementation report, Closeout draft and this report.
- Configuration, fixtures, frozen v1 files, Pi, V2/V3/V3.6 semantic files and control state: unchanged.

## Verification

| Verification | Result |
|---|---|
| G3A authority/Product/HTTP | PASS, 20/20 |
| accepted G1/G2 | PASS, 25/25 |
| V2 | PASS, 11/11 |
| V3 | PASS, 19/19 |
| V3.6 Product/HTTP/change handoff | PASS, 10/10 |
| existing strict TypeScript compiler | PASS, zero diagnostics |
| exact `npm run typecheck` | unavailable: fixed ignored worktree compiler path is absent |
| demo smoke | PASS; loopback start/stop, project commands 0, Docker commands 0 |
| thirteen accepted v1 SHA-256 values | PASS, 13/13 exact |

Loader fingerprint is `541fa4e7c0008e959049f6baacfd833e1a2510d1c5749fdbe21d62eef807eb30`.
Current deterministic trust roots are `681699639dca80f787e70d1e116475f638792be9476fa1dc85a82fb86191dc3d`
for Primary PASS and `4c7f1f5d1123de3b5beb94f97e8ff112a851a99b7048081a14fd9c186c812632`
for Recovery. Manifest, registration, configuration and fixture bytes are unchanged.

## Unverified and next action

- No real Provider/model/Credential/network behavior, strict Provider attestation, Goal 3B Case or user unguided execution was tested or authorized.
- Main must verify the single Candidate commit/tree and allowlist. Only a passing Main rereview may freeze a focused-audit Candidate and start a fresh independent read-only audit.
