# V2-B R2 `context_message_count` Bounded Correction Prompt

```yaml
status: authorized_for_original_implementation_session
authorized_by_user: true
authorization_date: 2026-08-07
goal_id: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
source_baseline_commit: a9da3c505af6219a05202359c113a4de6943b16f
source_baseline_tree: ba2ffc53372192280e2bdba533416eeb4c05f19f
implementation_owner: original_v2_b_stage_1_top_level_session_019fd804-a262-7e70-aa6f-865d2dc478ba
real_model_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
git_commit_authorized: false
pi_change_authorized: false
```

## Objective

Correct only the observed V2-B R2 real-path evidence omission:

```text
workbench/src/pi/pi-run-handle-v2b.ts
before_provider_payload
→ real Candidate payload was hashed
→ initial payload message count was not captured
→ context_message_count remained -1
→ frozen Inspector correctly rejected both Candidate compositions
```

This is a small Amendment §8 allowlist correction. It is not an architecture, experiment, Case,
recovery-path, budget, Provider, Prompt, Skill, Verifier, Selector or Session-treatment change.

## Required correction

1. In the exact code path used by the first `before_provider_payload` event, derive the initial context
   message count from the actual Provider payload's `messages` array.
2. Record the count only for the first Provider payload, consistently with the existing first-payload
   SHA-256 evidence.
3. If the payload is not an object or `messages` is absent/not an array, fail closed with the existing
   typed V2-B shape boundary. Do not substitute `0`, keep `-1`, relax the Inspector, or infer the value
   from later Session output.
4. Preserve the existing deterministic stub behavior and all Provider-payload redaction/hash rules.
5. Add the smallest zero-access test against the same helper/path used by the hook: a real-shaped
   payload records its exact non-negative message count; missing or non-array `messages` is rejected.
6. Do not change `inspect-v2b.ts` unless a compile-only mechanical adjustment is strictly required;
   its non-negative safe-integer requirement is correct.

## Frozen boundaries

Do not modify the controlled Seed, A/B inputs, Negative, Manifest semantics, old R2 evidence,
accepted V1 fixtures, `selector-v2.ts`, Pi, SDK/Extension/RPC route, budgets, retries, fallbacks,
replacement rules or V3 material. Do not read credentials, use network, call a Provider/model, stage,
commit, push, or edit `CURRENT_STATE.md`/formal control files.

The previous real sequence `v2b-r2-real-20260807-01` remains immutable and invalid for acceptance. This
correction must not rewrite, backfill or reinterpret it.

## Narrow verification

Run only:

- strict TypeScript;
- `workbench/tests/v2b-r2.test.ts` with zero skipped;
- the directly affected V2-B composition test(s);
- `git diff --check`, allowlist/source-delta checks, zero-access counters and pinned-Pi exact/clean.

Broader regressions are unnecessary unless the code change reaches beyond the single helper/hook. If
that happens, stop and report the concrete expansion instead of widening the correction.

## Deliverable and stop

Create `docs/reports/V2_B_R2_CONTEXT_MESSAGE_COUNT_BOUNDED_CORRECTION_REPORT.md` containing:

- exact source delta;
- before/after semantics;
- tests and exit codes;
- zero-access and Pi-boundary evidence;
- remaining limitations and claims boundary.

Return only `PASS_V2_B_R2_CONTEXT_MESSAGE_COUNT_CORRECTION` or an exact hard stop. Do not start audit,
create a Git commit, or execute real Stage 2.
