# V1-C R2 Cell 04 Outer-timeout Main Review and Continuation Decision

```yaml
status: accepted_bounded_continuation
date: 2026-08-06
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
execution_baseline_commit: c37ef6e6676cba245c0929dcdf98401f004fab54
manifest_id: c1587d04277a327bf0bd54bcf5abf6194663513f7c5960d3425bcbd322e78e14
pilot_root: .runs/v1-c/full-pilot-r2/pilot
paused_after_cell: 04
next_unstarted_cell: 05
cell_04_retry_authorized: false
replacement_pilot_authorized: false
continuation_from_cell_05_authorized: true
v2_authorized: false
```

## Decision

**Fact.** The dedicated R2 Execution Session launched the exact frozen product
command for cell 04, but its outer command runner was configured with an
incorrect five-second wait limit and returned exit `124` after product-side
execution had begun. The child product process continued and produced a
write-once terminal Run.

**Fact.** Main independently reran the tracked read-only Inspector for cells
01–04 and the aggregate over the preserved R2 root. All four Inspectors returned
exit `0`; all four Runs are terminal, integrity-valid and comparable. Cell 04
has one settled Attempt, eight Provider/model requests, ten Tool calls, 10,509
tokens, one passing Verifier, no secret match, unchanged protected paths and
exact known cost USD `0.0003057264`. The aggregate returned exit `0`; the first
complete A/B/C block passes both frozen fairness predicates. There is no live
matching product process and no unknown Provider usage or cost.

**Fact.** The exact product-process exit code for cell 04 is unrecoverable. The
only observed launcher result is outer exit `124`. This limitation must remain
visible in the final Execution Report and Claims.

**Inference.** The missing product-process exit code is a Session/orchestration
observation defect, not a defect in the immutable Run evidence, task Outcome or
A/B/C treatment. It does not justify discarding or repeating a terminal Run.

**Decision.** Preserve cell 04 in the formal R2 denominator and continue the
same immutable Pilot from cell 05. This is neither a same-Run retry nor a
replacement Pilot: cell 04 is never launched again, the Manifest and Pilot root
remain unchanged, and only previously unstarted cells may be selected by the
tracked product surface.

## Binding continuation rules

1. Before continuing, preserve the pause-time reports and command log under
   distinct cell-04-timeout filenames; do not overwrite the pause record.
2. Resume the original dedicated no-source-edit R2 Execution Session from exact
   HEAD `c37ef6e6676cba245c0929dcdf98401f004fab54` and the existing immutable Pilot
   root.
3. Re-run read-only Inspectors for cells 01–04 and the aggregate. Continue only
   if they reproduce the accepted results and `run-next` selects cell 05.
4. Execute the same frozen `run-next` command one cell per process. Configure
   the outer command runner to wait at least `900000` ms; this changes only the
   host wait boundary and does not increase any Manifest product budget.
5. After each cell, run the tracked Inspector. After each completed three-arm
   block, run the tracked aggregate. Do not launch a later cell until the prior
   checks pass.
6. Keep all source, tests, fixtures, Manifest, Prompt, Skill, task, Verifier,
   Tool profile, Provider/model and Pi content unchanged. No Git staging or
   commit is allowed in the Execution Session.
7. Keep the existing USD `1.90` R2 hard cap inclusive of cells 01–04, 24 initial
   cells, at most eight child Attempts, opaque Credential boundary and fixed
   DeepSeek endpoint.
8. A new timeout/launcher-ownership anomaly after product-side effects, unknown
   usage/cost, nonterminal prior cell, evidence/fairness conflict, secret issue,
   invalid threshold, budget breach or any original Contract Pause Condition
   stops execution immediately. No additional exception is implied.

## Claims boundary

If the remaining cells and final aggregate pass, the R2 Pilot may support the
frozen descriptive A/B/C comparison. The final report must still disclose that
cell 04's outer runner returned `124` and that its exact product-process exit
code was not observed. This exception does not support claims of statistical
significance, universal policy superiority, production-grade orchestration or
process-crash recovery.

## Authorization basis

The user authorized continuation of the corrected V1-C plan and the existing
bounded autonomy envelope, while repeatedly confirming that the intended V1
outcome is the completed A/B/C comparison rather than premature inconclusive
closeout. This decision stays inside the frozen task/model/treatment/budget
scope and does not authorize V2.
