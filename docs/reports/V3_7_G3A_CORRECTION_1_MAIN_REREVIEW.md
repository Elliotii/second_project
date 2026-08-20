# V3.7 Goal 3A Correction 1 Main Rereview

```yaml
status: FAIL_MAIN_REREVIEW_ONE_RESIDUAL_P1
goal: V3_7_G3A_REUSABLE_PRODUCT_CAPABILITY
corrected_candidate_commit: 1843a683b958c06147bb17d95f4ed1cc1156ffaf
corrected_candidate_tree: 74c92581bc281a19134c606fd108f78f16d9dc29
corrected_candidate_parent: bf71d262bcd45b1b4d4d69d091b44d0e430890fb
residual_finding: V37-G3A-MAIN-P1-001
focused_audit_started: false
goal_3a_accepted: false
goal_3b_locked: true
ordinary_correction_budget_after_authorization: 2_of_2
```

## Result

Main independently reran the corrected Candidate's focused and historical suites and
confirmed findings `P1-002` through `P2-008` closed. The Candidate still fails one
original finding: `P1-001` is only partially corrected. Registry discovery and
construction-time ports exist, but the product boundary neither validates an injected
formal Primary terminal nor actually permits a separately authorized later real Case to
use the same implementation unchanged.

## Residual finding

### V37-G3A-MAIN-P1-001 — Host ports are present but their formal facts and later-real execution policy are not reusable

Main injected a local zero-access Primary port for the existing Primary-pass Case. It
wrote and returned a terminal with `schema_version: 99`, the wrong `kind`, an invalid
`terminal_digest`, but internally consistent `outcome: passed` and `verifier_status:
passed`. The product accepted it:

```json
{"accepted_invalid_terminal":true,"stage":"no_recovery_needed"}
```

`runPrimary()` checks only the Run id and four zero counters; the Read Model then routes
from two outcome fields without validating the terminal schema, digest, exact shape or
underlying V2 inspection. This contradicts Correction 1's explicit requirement that an
invalid, missing or contradictory formal Primary fact fail closed and creates an error-
success path.

The same source also rejects every nonzero Primary counter, while
`registered-follow-up-v37g3a.ts` enforces four zero counters during execution and reopen.
A later Goal 3B Case therefore cannot use the frozen service/action handlers with its
separately authorized real execution; it would require another implementation-source
change. Construction-time ports alone do not satisfy Amendment Sections 4 and 6.

Correction round 2 must keep Goal 3A execution itself at zero access while making access
expectation derive from the Host-loaded versioned Case/profile and a separate Host-
construction authorization. A config append alone must remain insufficient to execute;
browser/caller input must remain unable to grant authority. No real adapter, Credential,
network, Provider or model call is authorized.

## Main verification

| Check | Result |
|---|---|
| exact correction commit/tree/parent, one commit, 12-path allowlist | PASS |
| Goal 3A focused | PASS, 18/18 |
| Goal 1/2 | PASS, 25/25 |
| V2 | PASS, 11/11 |
| V3 | PASS, 19/19 |
| V3.6 | PASS, 10/10 |
| total independently rerun tests | PASS, 83/83 |
| strict TypeScript equivalent | PASS, zero diagnostics |
| demo smoke | PASS, loopback start/stop, zero project/Docker commands |
| invalid Primary-terminal injection | FAIL as expected; malformed fact was accepted |
| later-real same-path source inspection | FAIL; Primary and follow-up require zero counters |
| findings P1-002 through P2-008 | PASS |

No external access occurred. The invalid-terminal reproduction is ignored local material
below `.runs/v37/g3a-main-rereview`; the tracked tree was not changed.

## Disposition

Candidate `1843a683...` / `74c92581...` remains immutable and is not an audit
candidate. Authorize Correction round 2 only for the residual `P1-001` boundary and its
necessary deterministic mock tests. This consumes the final ordinary correction round.
If it does not close the finding without a new contract or out-of-allowlist change, Main
must stop at the Charter correction-budget gate.
