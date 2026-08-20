# V3.7 Goal 3B 64-Request Successor V2 Contract

```yaml
status: ACCEPTED_AFTER_INDEPENDENT_AFFECTED_FINDING_AUDIT_PASS
authority: V3_7_CHARTER.md
campaign_authorization: docs/reports/V3_7_G3B_64_REQUEST_SUCCESSOR_REAL_EXECUTION_AUTHORIZATION.md
predecessor_identity: v37-g3b-64-request-successor-v1
predecessor_result: STRUCTURAL_INVALID_PRIMARY_PASS_BRIDGE_CONTRADICTION
successor_execution_identity: v37-g3b-64-request-successor-v2
real_access_authorized_by_campaign: true
affected_finding_audit: PASS_V3_7_G3B_SUCCESSOR_IDENTITY_1_AFFECTED_FINDING_AUDIT
```

## Contract boundary

Identity 1, workflow `v37-g3a-workflow-efa74515-139f-475f-9ecf-94cae05ca01e`
and all of its evidence remain immutable. Identity 2 is a new versioned execution of the
same frozen Case after correction of the accepted production path. It does not retry,
resume, relabel or reuse Identity 1.

Identity 2 may create one new workflow after affected-finding audit PASS, a new exact
Execution Baseline and Gate H. An honest Primary PASS, recovery inconclusive result,
admission rejection, invalid Candidate, Candidate rejection, follow-up rejection or
other valid negative is final for this identity. No result hunting is allowed.

## Frozen authority

- Configuration Candidate remains `ca33885f4691f00ab9ab90643f8ed5fbc0825bb8` /
  tree `ae12fd560f1d6dc802648a682eb5d94f96335f80`.
- Corrected production Candidate is `8a246e439da6aea1f597eed8e4ab71e57dc1b500`
  / tree `c177337c39aba11ec180a4f85fa31437406ea82e`.
- Frozen v2 Manifest, Envelope, registry and follow-up profile identities remain
  byte-identical to Identity 1.
- Real Primary terminal routing now follows independently inspected terminal truth:
  `initial_pass` completes only Primary; a failed Primary requires the exact
  Primary/Recovery-A/Recovery-B group.

## Frozen budgets

| Unit | requests | tokens | Tools | registered commands | wall time | USD |
|---|---:|---:|---:|---:|---:|---:|
| Primary | 64 | 524288 | 96 | 64 | 3600000 ms | 0.20 |
| Recovery A | 64 | 524288 | 96 | 64 | 3600000 ms | 0.20 |
| Recovery B | 64 | 524288 | 96 | 64 | 3600000 ms | 0.20 |
| Candidate proposal | 1 | 16384 | 0 | 0 | 120000 ms | 0.20 |
| Regression Base | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Regression Candidate | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Follow-up | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Global bridge | 385 | 3162112 | 576 | 195 | 21720000 ms | 1.40 |

The campaign-wide hard cap remains USD 10.00. Identity 1 consumed USD
`0.0030990008`; its cost remains charged. Limits are ceilings, not targets. Unknown or
unreconciled usage remains terminal invalidity.

## Verification and stop

The correction is supported by one narrow deterministic Primary-PASS regression and the
strict project TypeScript check. No 64-call test or broad suite is required. Independent
affected-finding audit PASS is mandatory before baseline freeze.

Identity 2 uses the same opaque Credential boundary, Provider/model, Docker identity,
Task, Source, Verifiers, Candidate template, Regression pack and follow-up authority as
Identity 1. No task swap, Candidate reproposal, retry, fallback, replacement or same-
identity rerun is authorized.
