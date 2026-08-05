# V1 Version Interim Closeout — Superseded by Active V1-C

```yaml
version: V1
status: historical_interim_superseded_by_active_v1_c
closeout_date: 2026-08-05
policy_recommendation: INCONCLUSIVE
v1_a: closed_accepted_PASS_V1_A_DETERMINISTIC_SUBSTRATE
v1_b: closed_inconclusive_authorized_sequence_exhausted
valid_A_B_C_comparison: false
v1_definition_of_done: not_met
active_goal_after_closeout: null
v1_c_active: true
current_comparison_status: corrected_fresh_24_cell_pilot_pending
v2_authorized: false
```

> This document records the V1-B-era interim conclusion. It is not the current
> V1 terminal state. The user subsequently authorized V1-C to correct the
> observed budget/evidence boundary and complete the original A/B/C comparison.
> Current authority is defined by `CURRENT_STATE.md`, the formal V1-C Contract,
> and the latest accepted V1-C Main decision. V1 remains active and no final
> Skill-only versus Runtime Control conclusion exists yet.

## Version conclusion

V1 delivered a meaningful deterministic substrate but did not complete its
real three-arm comparison.

V1-A successfully established and independently audited:

- the public Pi Skill route;
- A/B/C deterministic treatment semantics;
- common Measurement Verifier use;
- C-only bounded intervention semantics;
- experiment identity, Manifest and aggregation substrate;
- fixed Provider/credential seams with zero real calls.

V1-B successfully froze the real protocol and demonstrated safe stop behavior,
but both authorized real Pilot identities stopped before a terminal/comparable
Run existed. The final replacement exposed a concrete usage-invalid evidence
reconciliation defect after eight Provider requests. Because the authorized
correction and replacement sequence is exhausted, the proper result is
`INCONCLUSIVE`, not another retry and not a fabricated comparison.

## V1 Definition of Done assessment

| V1 DoD item | Result |
| --- | --- |
| V1-A accepted and independently audited | met |
| Protocol/Model/Budget/Manifest frozen before real outcomes | met |
| Planned membership traceable with no overwrite/retry/post-selection | met for attempted Pilots |
| Common Verifier and initial budget | structurally met, not observed across valid A/B/C terminals |
| C-only eligible child reserve | structurally met, no child observed |
| Budget/credential/secret/protected-path guards | safe-stop behavior met |
| Treatment-invalid attribution and denominator | no valid denominator; Inspector disagreement remains |
| Raw evidence, aggregate and four-way decision | raw pause evidence and `INCONCLUSIVE` decision exist; valid aggregate absent |
| Bounded descriptive claims | met |
| Main/user acceptance and control synchronization | closeout authorized; synchronized by this revision |

Because a valid aggregate and A/B/C denominator are absent, V1 is not marked
complete.

## Portfolio interpretation

This result still carries useful engineering signal:

1. the Direct public Pi `AgentHarness` route remains viable;
2. deterministic Skill/experiment infrastructure is real and tested;
3. the real reliability bottleneck observed in V1 is evidence/usage
   reconciliation at a failure boundary, not basic Pi integration;
4. stopping after exhausted bounded authority is itself a reliability property;
5. future work must not claim Skill or Runtime policy effectiveness from V1.

V2 remains the Portfolio North Star in the long-term roadmap, but this closeout
does not authorize V2 research, Contract drafting, activation or implementation.
