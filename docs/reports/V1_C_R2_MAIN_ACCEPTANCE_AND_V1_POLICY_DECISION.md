# V1-C R2 Main Acceptance and V1 Policy Decision

```yaml
status: accepted
date: 2026-08-06
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
execution_disposition: PASS_VALID_V1_C_R2_PILOT
goal_disposition: PASS_V1_C_COMPARISON_COMPLETION
v1_disposition: PASS_V1_SKILL_RUNTIME_COMPARISON_WITH_SKILL_ONLY_DESCRIPTIVE_LEAD
skill_only_policy_decision: PROMOTE_WITHIN_FROZEN_PROTOCOL
current_same_session_runtime_control_decision: REJECT_AS_V1_DEFAULT
active_goal_after_acceptance: null
v2_authorized: false
```

## Main review result

Main accepts the R2 Pilot as a valid completion of V1's frozen A/B/C descriptive
comparison. No further independent source audit is required: the only source
change used by R2 was already independently re-audited, the real Execution
Session had no source authority and produced no tracked delta, and Main reran
all 24 tracked Inspectors plus the final aggregate.

Main's independent read-only verification returned:

| Check | Result |
|---|---:|
| Inspectors | 24/24 exit `0` |
| Terminal / integrity-valid / comparable | 24 / 24 / 24 |
| Secret / protected-path checks | 24 / 24 pass |
| Pass / fail / invalid | 22 / 2 / 0 |
| Attempts / child Attempts | 25 / 1 |
| Provider requests / Tool calls | 200 / 242 |
| Tokens / active time | 327,711 / 423,252 ms |
| Exact tracked cost | USD `0.0105276024` |
| Fairness blocks | 8/8 pass both predicates |

Final source regression on the integration branch also passed strict TypeScript
and the focused V1-B/V1-C suite at 40/40. An initial combined wrapper used a
60-second outer wait and returned `124` before emitting the test result; Main
split the commands, then observed TypeScript exit `0` and the complete test
process exit `0` in 56.97 seconds. No real call or Pilot cell was involved.

Selected evidence-chain review confirmed:

- A and B have one settled initial Attempt and no child;
- B/C initial payloads are byte-identical within the checked block;
- A/B differ only by the frozen Skill treatment according to the aggregate;
- cell 03 C has a settled failed parent, one correctly linked settled child and
  final failure;
- cell 14 A is a normal terminal task failure with no Recovery eligibility;
- all 24 members are unique Manifest members with no retry, replacement,
  exclusion or treatment-invalid disappearance.

## Accepted limitation

Cell 04's outer command runner returned `124`; the product-process exit code is
unknown and unrecoverable. Its write-once product evidence is nevertheless
terminal, integrity-valid, comparable, passed and usage-complete. Main accepts
it in the denominator under the recorded one-time orchestration decision. It
was not rerun or replaced.

This means the Pilot supports outcome/policy comparison claims, but it does not
prove production-grade process ownership, crash recovery or perfect launcher
observability.

## Descriptive result

| Arm | Pass | Fail | Final rate | Cost USD |
|---|---:|---:|---:|---:|
| A — Baseline | 7 | 1 | 87.5% | 0.0027878144 |
| B — Skill-only | 8 | 0 | 100% | 0.0027217848 |
| C — Skill + Runtime Control | 7 | 1 | 87.5% | 0.0050180032 |

The two failures are both in `parse-duration`, but in different repetitions and
different arms. B passed both of those repetitions. The observed B advantage is
only one Run, so it is meaningful as bounded engineering evidence but not as a
statistically stable general claim.

C-initial and C-final are both 7/8. Its only eligible Recovery ran once and did
not repair the failure. C therefore produced no observed outcome gain over B,
matched A's final pass count, and used substantially more cost/time because of
the unsuccessful child Attempt.

## Policy decision

1. **Promote Skill-only within the frozen protocol.** It is the preferred V1
   default input for the next version and for a future real Pi integration
   checkpoint. This does not claim universal Skill effectiveness.
2. **Reject the current same-Session Runtime Control treatment as the V1
   default.** It showed no Recovery success or final-pass benefit in this Pilot
   and imposed higher resource cost. This rejects this exact treatment, not all
   runtime verification or all future recovery designs.
3. Keep the external Measurement Verifier as common Workbench infrastructure;
   its value is not rejected merely because the C intervention did not win.
4. Preserve the failed C Recovery as evidence for V2's future question: whether
   a clean Session / clean Workspace path can outperform continuing the same
   Session. V2 remains unauthorized.

## Claims boundary

Allowed:

- the exact fixed 24-cell Pilot result and resource totals;
- that Skill-only had the best observed final result in this protocol;
- that the current same-Session Recovery triggered once and failed once;
- the bounded promote/reject decisions above.

Not allowed:

- statistical significance or universal Skill superiority;
- general Runtime Control inferiority;
- production readiness, OS sandboxing or durable crash recovery;
- V2/multi-path/Experience capability already implemented.
