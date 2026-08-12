# FINAL_CAPSTONE_G1_CLOSEOUT_DRAFT

## Working Session recommendation

`PASS_FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION`

This is a hit-only correction draft, not acceptance. Goal 1 remains active and unaccepted; Goal 2 remains unauthorized. Main re-review and any Main-directed fresh re-audit remain separate control points.

## Finding disposition

| Finding | Evidence | Draft result |
|---|---|---|
| `G1-AUDIT-P1-001` combined registration plus matching authorization forgery | Required regression first failed derivation/admission/reopen; final suite rejects all three at the private fixed Host approval root | PASS recommendation |
| `G1-MAIN-P1-001` unbound V3 base State | Promoted version-1 positive remains exact; version-0/empty/null negative still rejects | remains closed |
| `G1-MAIN-P1-002` V2 Candidate Path/Run identity | One true Run, two separate Candidate Paths, comparison omitted | remains closed |

## Contract acceptance mapping

| Criterion | Evidence | Draft result |
|---|---|---|
| Host approval cannot be minted from caller objects | Exported APIs accept no approval object; private frozen root alone grants approval | PASS |
| Direct derivation has no combined-mint route | matching forged registration + authorization rejects with fixed-root error | PASS |
| Admission and reopen use same trust root | both route through the same derivation; combined forgery rejects at each | PASS |
| Exactly three supported families | exact source union and positive family suite | PASS |
| V0 Verifier/Outcome lineage | V0-B PASS and V0-C agent FAIL immutable admissions | PASS |
| V2 Run and Candidate Path identities truthful | `admission-2c6d5d08d67cdbd065505880d84adffc`; comparison omitted | PASS |
| V3 exact promoted State/binding/lineage/Case Authority | `admission-62f2896d6c590fc257804b32997725c4`; version 1 and one prompt binding | PASS |
| Unbound base State fails closed | exact explicit version-0 error retained | PASS |
| Existing projector unchanged | V0-C produces hard-failure Opportunity; valid non-triggers yield `no_opportunity` | PASS |
| Deterministic/write-once and reopen | repeated V0-B identity is idempotent; all positives reopen, including fresh process | PASS |
| Integrity/family/path/link/hardlink/tamper failures | focused negative matrix | PASS |
| No Candidate/State/pointer/Workspace/Source mutation | explicit before/after tree digests | PASS |
| Accepted-core regressions | V3-G1 13/13; V3-G2 6/6; V3-G3 8/8 | PASS |
| Strict typecheck | exit 0 | PASS |
| Zero external access | all counters 0 | PASS |
| Allowed delta/Git boundary | five allowed tracked paths; staging and commit absent | PASS |

## Red-to-green verification

- Required pre-implementation red run: exit 1; 18 passed and 4 failed, including all three combined-forgery boundary subtests.
- Final TypeScript check: exit 0.
- Final Goal 1 suite: 22 passed, 0 failed, exit 0.
- V3-G1: 13 passed, 0 failed, exit 0.
- V3-G2: 6 passed, 0 failed, exit 0.
- V3-G3 combined: 8 passed, 0 failed, exit 0.
- Final aggregate: 49 passed, 0 failed, plus typecheck.
- Credential reads, network calls, external Provider/model calls, real-model calls, and dependency installations: all 0.
- Git staging/commit: not performed.
- `CURRENT_STATE.md`: not modified.
- Goal 2: not entered.

## Key corrected identities

- V2 admission/digest: `admission-2c6d5d08d67cdbd065505880d84adffc` / `e8ddf2a7b2233aed9f01aeabe30cde591e90fe84de52d3c2f70ac5c3dcc8e2a6`.
- V2 Run: `g1-v2-recovery-comparison`; Candidate Paths `...candidate-a` and `...candidate-b`; selected `...candidate-b`; schema-1 comparison omitted.
- V3 admission/digest: `admission-62f2896d6c590fc257804b32997725c4` / `bf475c53e8b8c3b4d77d03595e92e23bc89c26258731606b91cd50a3de23f0fb`.
- V3 State version/digest: `1` / `8c26430e7b17adfec0e59f329eb371b75cb97965f31aa16b5b885d0dbe03790a`.
- V3 binding/Case Authority digests: `f1c254ae96775c3435b7ee33c701f5faff0c4766e120dee0544d73f1628e88ca` / `244b2174dd38c604ca7056ff1bd5959863be3ed1c0b7ecf892a1c9d3029ea259`.

## Claim limits and next control point

The trust root is a fixed in-process Host approval list with no runtime enrollment API. It is not cryptographic signing, credentials, an OS authorization layer, or a generic registry. Any future approval addition requires an authorized source change and review.

Main must now perform the hit-focused re-review. Main alone decides Candidate freeze, re-audit, Goal acceptance, and control-state changes. State assessment/publication, replacement, promotion/rollback, V3.6 integration, product surfaces, statistical claims, continual learning, and Goal 2 remain outside authority.
