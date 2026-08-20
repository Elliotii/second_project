# V3.7 Goal 3B 64-Request Successor Contract

```yaml
status: ACCEPTED_BY_USER
accepted_on: 2026-08-21
authority: V3_7_CHARTER.md
predecessor_result: REJECT_V3_7_ACCEPTED_BRIDGE_FREEZE_BUDGET_MISMATCH
successor_execution_identity: v37-g3b-64-request-successor-v1
real_access_authorized: false
```

## Contract boundary

This is the explicitly reviewed versioned successor required by the limits section of
`V3_7_FINAL_CLOSEOUT.md`. It does not amend, erase, retry or reinterpret the consumed
workflow `v37-g3a-workflow-6f3a118b-53c5-4e65-9343-0e8ccb8ce4a4`. The prior execution,
usage, rejection and Closeout remain authoritative historical evidence.

The successor may create exactly one new workflow under a new execution baseline after
separate explicit real-access authorization. It may not reuse the old workflow or its
unit identity. Retry, fallback, replacement, task swap, Candidate reproposal and rerun
after dispatch remain zero.

## Frozen versioned authority

- Configuration Candidate: `ca33885f4691f00ab9ab90643f8ed5fbc0825bb8` / tree
  `ae12fd560f1d6dc802648a682eb5d94f96335f80`.
- Corrected implementation Candidate: `86edd40c2b8349dfdeed5c081c78cf0a4590b246`
  / tree `b8d1a1faabf81ab63a48fb105fed30e9749184b7`.
- Current registries, Manifests, Envelopes and follow-up profiles use their v2 paths and
  identities. Accepted v1 bytes remain unchanged and are available only for historical
  read-only reopen.
- New V2A/V2B Runs use schema v3 and the new V2B execution Manifest uses v2. Historical
  V2A/V2B schemas retain their legacy caps.

## Frozen budgets

| Unit | requests | tokens | Tools | commands | wall time | USD |
|---|---:|---:|---:|---:|---:|---:|
| Primary | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Recovery A | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Recovery B | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Candidate proposal | 1 | 16384 | 0 | 0 | 120000 ms | 0.20 |
| Regression Base | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Regression Candidate | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Follow-up | 64 | 524288 | 96 | 1 | 3600000 ms | 0.20 |
| Global | 385 | 3162112 | 576 | 6 | 21720000 ms | 1.40 |

Primary plus Recovery Group is capped at 192 Provider requests. The complete V2B
sequence cap is 448 requests. Candidate proposal remains the Charter-frozen one-shot
product contract and is not inflated to 64.

## Verification and hard stops

The 64-cap change is not to be justified by repeated or manufactured 64-call tests.
Main's narrow post-audit correction verification is one historical-reopen test plus the
project TypeScript check. The independent affected-finding re-audit passed by static
inspection without duplicating those commands.

No Credential, external network, Provider/model call, Docker product task or real user
data access is authorized by this Contract. Real execution remains a separate Charter
control point. Unknown usage, incomplete reservation/lifecycle state, mismatched
counters, invalid terminalization and any accepted-bridge contradiction remain hard
stops and cannot be relabeled as Case quality.
