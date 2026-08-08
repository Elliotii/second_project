# V3.5 Goal 2 Closeout Draft

```yaml
goal_id: V3_5_G2_REAL_ADAPTIVE_SKILL_CLOSURE
document_status: draft_for_main
goal_2_accepted: false
implementation_status: READY_FOR_MAIN_CORRECTION_REVIEW
real_pair_status: not_started
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_cost_usd: 0
```

This document is a draft only. It does not accept Goal 2, authorize Goal 3, or accept V3.5.

## Version Question

Can the accepted historical adaptive Skill be explicitly selected from isolated case-owned State and evaluated on the one frozen related held-out task through the real Direct Pi/model path with fair, persistent and inspectable Base/Candidate evidence?

`Fact`: the zero-access implementation now supplies the bounded mechanism required to answer this question. The real pair has not run, so the question is not yet answered by real evidence.

## Current exit-criteria state

| Exit criterion | Draft status |
|---|---|
| Frozen Contract and exact identities before real access | Satisfied for implementation preflight |
| Leakage/applicability checks and unchanged V3 State pointer | Satisfied at zero access |
| Byte-identical Workspaces and fresh persistent Sessions | Deterministically tested; pending the frozen real pair |
| Exactly one real Base and Candidate through Direct Pi | Pending Main authorization |
| Same external Verifier exactly once per arm | Deterministically tested; pending real pair |
| Persistent Session/Run/Tool/Verifier/comparison evidence and safe Read Model | Implemented and deterministically tested; pending real evidence |
| Actual first Provider payload differs only by exact Skill treatment text | Corrected and deterministically/tamper tested; pending frozen real pair |
| Accept observed result without hunting/replacement/tuning | Pending real result |
| Pi, accepted V3 authority and prior facts unchanged | Satisfied at this stop point |

## Main preflight checklist

Main should verify:

1. the returned correction commit has parent `ce58cdb35948c7f100773f3fb94762d23d7eccd5`, is the clean HEAD and contains only the bounded correction/report set;
2. frozen fixture, Verifier, Skill, State, profile, budget and Case Authority digests match `V3_5_G2_IMPLEMENTATION_REPORT.md`;
3. `.runs/v3-5-g2/preflight-correction-ce58/zero-access-preflight.json` and `.runs/v3-5-g2/reference-calibration-correction-ce58/calibration.json` show zero access and a passing calibration;
4. the read-only historical State root and pinned Pi checkout remain unchanged;
5. the real entry point still requires the exact implementation commit and explicit token `V3_5_G2_REAL_PAIR_ONCE`;
6. each arm's `first-provider-payload.json` is digest-only, captures ordinal one, proves the exact Base/Candidate user text, and has a shared normalized payload identity outside that text;
7. no source, fixture, Verifier, Case Authority, budget or evidence-schema correction remains before the first Provider request.

If Main passes preflight, the only permitted follow-up in this same top-level Session is the already frozen sequence:

```text
Base once
→ same hidden external Verifier once
→ Candidate with exact adaptive Skill once
→ same hidden external Verifier once
→ persistent comparison/read-model inspection
→ stop
```

The real command must supply the returned exact implementation commit, the accepted historical State root, one new ignored pair root, and the explicit authorization token. The opaque credential remains inside the execution process and must not be printed or persisted.

## Result and acceptance placeholders

```yaml
result_label: pending_real_pair
efficiency_label: pending_real_pair
base_verifier_status: pending
candidate_verifier_status: pending
pair_integrity: pending
main_acceptance: pending
```

No Skill win is required. Valid, fair, persistent evidence is the completion target. An invalid or interrupted pair must remain invalid evidence with no retry, replacement Case, fallback or extra arm.

## Remaining authority boundary

- Main retains Goal 2 acceptance and control-state ownership.
- This Goal Session may execute the frozen pair only after explicit Main follow-up.
- Goal 3 and final V3.5 acceptance remain unauthorized.
- Pi patches, private imports, SDK/Extension/RPC/server switching, retries, fallbacks, replacement Cases and extra arms remain forbidden.

Draft disposition: `READY_FOR_MAIN_CORRECTION_REVIEW`; not a Goal acceptance.
