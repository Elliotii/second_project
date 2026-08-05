# V1-B Pause Recovery Amendment

```yaml
status: accepted_authorized
accepted_by_user: 2026-08-05
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
amendment_scope: one_bounded_pause_evidence_correction_and_one_replacement_pilot
original_execution_baseline_commit: 19617319c13a9eecbb325682c920e79d1517b89d
original_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
original_paused_cell: v1b-cell-01
original_paused_run: v1b-run-01-parse-duration-r1-a
original_actual_cost_usd: unknown
conservative_prior_cost_debit_usd: 0.10
replacement_remaining_cost_usd_max: 1.90
original_started_initial_runs: 1
replacement_initial_runs_max: 24
authorized_sequence_started_initial_runs_max: 25
correction_real_calls_authorized: 0
focused_reaudit_required: true
replacement_stage_2_authorized_after_reaudit_and_execution_baseline: true
normal_correction_cycles_consumed: 2
P1_004_micro_correction_exception: accepted_consumed_one_time_only
final_candidate_commit: 6a4f6529c4cb2a3e5c726d3bc8cf6beb515b720e
final_candidate_tree: 7ab79aa4073baab1c7570424701ebf1302b34837
final_focused_reaudit: PASS_FOCUSED_V1_B_P1_004_REAUDIT
further_correction_authorized: false
replacement_execution_baseline_commit: resulting_HEAD_of_this_revision
replacement_manifest_id: 4f04542ea59b59110e2d9d62e08067932bf868884e05c153cd5a6bed08575b29
replacement_sequence_authority_id: c58112fff77b0836a44668395d6ab97ece10996583254c9029c143ab84e01bd1
v2_authorized: false
```

## 1. Reason for amendment

The first authorized V1-B Stage 2 cell reached the tracked real path once and
then paused with `FixedProviderBoundaryErrorV1B`. The frozen pause path retained
the append-only `planned -> started -> paused` ledger and partial Run journal,
but did not retain enough sanitized state to prove whether dispatch occurred or
to reconcile usage/cost.

This is an observed project-owned evidence defect. It blocks the USD 2 hard
cap, safe continuation and any valid A/B/C comparison. It does not prove a Pi
architecture failure, does not authorize a model change and does not enter V2.

## 2. Historical evidence is immutable

The original Pilot root, Manifest, paused Run, ledger and reports must never be
rewritten, deleted, retried or reclassified after the fact. Its actual external
cost remains `unknown`.

For bounded internal accounting only, the amendment charges the complete
original initial-Attempt cost allowance, USD 0.10, as a conservative debit.
This is not a claim that DeepSeek billed exactly USD 0.10.

## 3. Authorized correction

The original V1-B Preparation Session may perform one zero-real-call correction
cycle limited to:

1. a write-ahead, sanitized Provider request reservation event before the
   possible external dispatch;
2. typed pause-stage evidence and bounded call-counter/reservation snapshots;
3. write-once pause evidence before the Pilot ledger appends `paused`;
4. Inspector validation of a coherent paused chain without treating it as a
   terminal or comparable Run;
5. fail-closed conservative accounting when dispatch may have occurred but
   actual usage is unavailable;
6. exact fixed support for one replacement Manifest revision carrying the
   historical Manifest identity, USD 0.10 prior debit, USD 1.90 remaining cap
   and new Run IDs;
7. deterministic tests and reports.

It may not retain raw error messages, credentials, Provider payloads/responses,
reasoning content or arbitrary environment values. It may not add retry,
fallback, automatic replacement, a general transaction platform, database,
scheduler, provider abstraction or V2 behavior.

## 4. Session and audit sequence

```text
Main Session freezes Pause Evidence Baseline
→ original Preparation Session performs zero-call correction
→ Main Session limited review
→ Main Session creates corrected Candidate
→ fresh focused Audit Session checks only pause evidence, budget carryover,
  replacement identity and required regressions
→ original Preparation Session performs at most one bounded correction if needed
→ Main Session creates new Execution Baseline
→ fresh no-source-edit Stage 2 Session runs the replacement Pilot
→ Main Session accepts or pauses V1-B
```

The correction and audit use zero credentials, network, Provider calls and
real-model calls.

## 5. Replacement Pilot rules

- use a new Manifest revision and new Run IDs;
- preserve the same four Tasks, two repetitions and A/B/C strategies;
- preserve Task, Skill, System Prompt, Tool, Verifier, model/profile, order,
  Failure Taxonomy and recovery rules;
- keep `alternate_model_fallback`, `retry_same_run` and
  `automatic_replacement` false;
- record the original Manifest/Run evidence as immutable predecessor evidence;
- cap replacement actual cost at USD 1.90;
- report the authorized sequence as USD 0.10 conservative prior debit plus at
  most USD 1.90 replacement cost;
- allow at most 25 started initial Runs across the original and replacement
  Pilots;
- retain the existing maximum of eight child Attempts in the replacement Pilot;
- run one cell at a time in a fresh no-source-edit Stage 2 Session.

## 6. Automatic exit conditions

All existing Contract Pause Conditions remain binding. In addition, stop if:

- the correction cannot prove write-before-dispatch ordering;
- pause evidence can leak a credential, raw Provider error, payload or
  reasoning;
- conservative cost cannot be cross-checked by Inspector;
- replacement identity permits arbitrary retries or more than one authorized
  replacement Pilot;
- any further correction is required after the consumed one-time P1-004
  micro-correction exception;
- the replacement Pilot would exceed USD 1.90 or 25 started initial Runs across
  the authorized sequence;
- continuation requires entering V2/V3.

## 7. Claims

This amendment permits no claim about Skill/Runtime effectiveness until a valid
replacement Pilot completes. It permits only the factual claim that the first
Pilot paused with insufficient pause-path evidence and that the replacement
uses conservative bounded accounting.

## 8. Accepted correction outcome and final continuation boundary

The first corrected Candidate failed focused audit on three P1 findings. The
second normal correction closed P1-002 and P1-003 but exposed P1-004: the
Inspector rejected the Producer's valid real-mode post-reservation/pre-dispatch
pause state. The user authorized one and only one P1-004 micro-correction
exception.

That exception was consumed with zero credential, network, Provider and model
access. Final Candidate `6a4f6529c4cb2a3e5c726d3bc8cf6beb515b720e`, tree
`7ab79aa4073baab1c7570424701ebf1302b34837`, passed
`PASS_FOCUSED_V1_B_P1_004_REAUDIT`; P1-002 and P1-003 remained closed. No fourth
correction is authorized.

The only remaining implementation path is the frozen replacement Pilot from
the resulting replacement Execution Baseline, using Manifest ID
`4f04542ea59b59110e2d9d62e08067932bf868884e05c153cd5a6bed08575b29` and
write-once sequence authority ID
`c58112fff77b0836a44668395d6ab97ece10996583254c9029c143ab84e01bd1`. Any new
source defect, identity conflict, budget uncertainty or other Pause Condition
stops V1-B; it does not authorize another repair.
