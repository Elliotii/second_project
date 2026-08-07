# V2-B R2 `context_message_count` Hit-specific Re-audit Report

```yaml
date: 2026-08-07
role: original_focused_audit_session_reused_for_hit_specific_reaudit
source_baseline_commit: a9da3c505af6219a05202359c113a4de6943b16f
source_baseline_tree: ba2ffc53372192280e2bdba533416eeb4c05f19f
candidate_commit: 673454aafabd810692239084dda9103ec85193ca
candidate_tree: 45ca056973e9e88b746ed6f7b7f1f9ee98e0416f
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
disposition: PASS_V2_B_R2_CONTEXT_MESSAGE_COUNT_HIT_SPECIFIC_REAUDIT
```

## Result

**Fact.** Candidate `673454aafabd810692239084dda9103ec85193ca` passes the assigned
hit-specific re-audit. The first real `before_provider_payload` event derives exact initial
`payload.messages.length` and the existing safe payload SHA-256 from the same payload object and records
both only while the first-payload SHA field is unset.

**Fact.** Null, array, missing-`messages`, null-`messages` and non-array-`messages` shapes fail closed
with `V2BExecutionBoundaryError("shape_invalid")`. The Inspector remains unchanged and requires a
non-negative safe integer. No fallback, Session inference, evidence backfill or Inspector relaxation
was added.

## Identity and boundary checks

| Check | Result |
|---|---|
| Candidate HEAD/tree | exact `673454a...` / `45ca056...` |
| source Baseline ancestry | exact `a9da3c5...` ancestor |
| project tracked/index before report | clean |
| pinned Pi HEAD/tree/status | exact `027a584...` / unchanged / clean |
| `a9da3c5..673454a` delta | five expected paths only |
| `git diff --check` | pass |
| Contract/Amendment/CURRENT_STATE/AGENTS | byte-identical to source Baseline |

The runtime delta changes only `firstProviderPayloadEvidenceV2B` and the real hook assignment. The
Faux callback remains unchanged. Controller, Selector, contracts, fixtures, Case set, A/B treatment,
Negative behavior, budgets, Session fork/create treatment, Provider route and Pi identity are unchanged.

## Verification

| Command/check | Result |
|---|---|
| strict TypeScript with existing pinned public Pi declarations | pass, zero diagnostics |
| `workbench/tests/v2b-r2.test.ts` with audited public-Pi loader | 8/8 pass, zero skipped |
| Inspector blob comparison | unchanged and strict |
| Credential/network/external Provider/model calls | all zero |
| source/test/control/Pi/index mutation by Audit | zero; only this unstaged report added |

The new test proves an exact two-message count and typed rejection of null, array, missing and non-array
message shapes. The remaining seven tests retain controlled Seed, A/B selection/fairness, safe budget
terminal, raw-gate authority, schema boundary, Negative no-branch and frozen sequence behavior.

## Claims boundary

Execution of the corrected hook against a new real Provider response, real Candidate outcomes, final
V2-B/V2 acceptance, production durability, OS-level egress blocking and V3 remain outside this audit.
The historical `v2b-r2-real-20260807-01` sequence remains immutable and invalid for acceptance.

## Final disposition

`PASS_V2_B_R2_CONTEXT_MESSAGE_COUNT_HIT_SPECIFIC_REAUDIT`
