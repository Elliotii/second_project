# V2-B R2 `context_message_count` Bounded Correction Report

```yaml
date: 2026-08-07
owner: original_top_level_v2_b_stage_1_implementation_session
source_execution_baseline: a9da3c505af6219a05202359c113a4de6943b16f
source_tree: ba2ffc53372192280e2bdba533416eeb4c05f19f
pinned_pi: 027a5847901b5dde30270abaa1041046cd2b4b55
disposition: PASS_V2_B_R2_CONTEXT_MESSAGE_COUNT_CORRECTION
```

## Result

**Fact.** The single authorized R2 real-path evidence omission is corrected. The exact
`before_provider_payload` hook now calls `firstProviderPayloadEvidenceV2B()` on the actual payload.
The helper requires a non-null, non-array object whose `messages` field is an array, then returns the
existing safe/redacted payload SHA-256 identity and exact `messages.length`.

**Fact.** Only the first Provider payload sets `provider_payload_sha256` and
`context_message_count`. Invalid payload/message shape throws the existing typed
`V2BExecutionBoundaryError("shape_invalid")`. There is no zero substitution, retained `-1`, later
Session inference, or Inspector relaxation.

**Fact.** The deterministic Faux provider retains its existing `context.messages.length` capture
because that path does not emit `before_provider_payload`. Provider projection, secret/reasoning
redaction, hashing, Case/A/B/Negative semantics, budgets, Session treatment, Controller and Inspector
are unchanged.

## Exact source delta

- `workbench/src/pi/pi-run-handle-v2b.ts`: one first-payload shape/evidence helper and hook binding.
- `workbench/tests/v2b-r2.test.ts`: one zero-access positive count test plus invalid-shape cases.
- this report.

No delta exists in `inspect-v2b.ts`, Manifest semantics, control state, Seed, fixture, Prompt, Skill,
Verifier, Selector, accepted V1 fixtures, Pi, lockfiles or historical R2 evidence.

## Verification

| Check | Result |
|---|---|
| strict TypeScript | pass, zero diagnostics |
| R2 focused | 8/8 pass, zero skipped |
| directly affected composition patterns | 2/2 pass, zero skipped |
| `git diff --check` | pass |
| implementation-session staged/commit | zero |
| pinned Pi | exact and clean |
| Credential/network/external Provider/model/cost | all zero |

The first focused run exposed that the Faux provider does not emit `before_provider_payload`; the
existing Faux callback count line was therefore retained. This was an ordinary zero-access test
correction and did not change real-path semantics.

## Claims boundary

The historical sequence `v2b-r2-real-20260807-01` remains immutable and invalid for acceptance. This
correction does not accept V2-B, answer the V2 Version Question, authorize Stage 2 or establish
production durability. Candidate freeze, hit-specific re-audit and a fresh no-source-edit sequence
remain Main-owned steps.

## Final disposition

`PASS_V2_B_R2_CONTEXT_MESSAGE_COUNT_CORRECTION`
