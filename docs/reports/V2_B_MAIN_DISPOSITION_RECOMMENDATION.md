# V2-B Main Session Disposition Recommendation

```yaml
status: historical_R1_recommendation_superseded_by_accepted_bounded_R2
goal_id: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
stage_1_main_disposition: PASS_V2_B_STAGE1_THIN_REAL_COMPOSITION
stage_2_sequence_id: v2b-real-20260807-01
stage_2_execution_baseline: a76cb3f340d26dc3dd336628761d22546886db27
stage_2_result: paused_run_invalid_before_verifier
main_recommended_contract_disposition: REVISE_V2_B_BOUNDED
v2_version_question_answer: not_demonstrated_by_the_frozen_sequence
v2_b_final_acceptance: not_authorized_not_made
v2_final_acceptance: not_authorized_not_made
new_real_sequence_authorized_at_time_of_report: false
subsequent_user_decision: accept_and_authorize_V2_B_BOUNDED_R2_AMENDMENT
binding_current_route: docs/第二项目_Codex交接包_2026-07-30/V2_B_BOUNDED_R2_AMENDMENT.md
```

> Control update: 本报告完整保留 Main 对 R1 的事实判断。用户随后接受并授权 bounded R2；当前
> 控制权威以 `V2_B_BOUNDED_R2_AMENDMENT.md` 为准。本更新不改变、补写或重跑 R1 evidence。

## 1. Main conclusion

Main does **not** accept the dedicated Stage 2 Session's advisory classification that the observed
`reasoning` matches establish an architecture or secret-boundary fork. The eight matches are all at
the structural JSON path `$/message/usage/reasoning`. Pi defines this field as an optional numeric
reasoning-token count inside public usage accounting. No `ThinkingContent.thinking`,
`reasoning_content`, signature field, Authorization material or Credential assignment was identified.

The tracked Inspector therefore has a concrete bounded false positive: its path-insensitive regular
expression rejects every JSON key named `reasoning`, including safe numeric usage metadata. Main
recommends the Contract-listed `REVISE_V2_B_BOUNDED`, limited to correcting and testing this evidence
classification. This does not authorize a source change, real rerun or new sequence by itself.

Separately, the frozen real sequence did not answer the V2 Version Question. Primary exhausted its
eight-request Attempt ceiling before a Verifier ran; it produced no valid failure result, Failure
Packet, Recovery Seed, A/B Candidate, Selection or Negative evidence. The current sequence correctly
paused and cannot continue. The correct evidence-backed V2 answer is:

> The two-path real recovery mechanism remains **not demonstrated** by this frozen sequence. The
> sequence proved fail-closed budget and terminal behavior, not recovery effectiveness or path
> superiority.

## 2. Accepted execution facts

- Gate H passed before any Credential read after one Main-authorized, same-commit, read-only local
  cache-path correction.
- Exact Execution Baseline, Manifest, source digest and pinned Pi identity remained fixed.
- Only Primary started; one Attempt made eight Provider/model calls and ten Tool calls.
- Known usage was 13,262 tokens and USD `0.0004849208`; one opaque Credential read occurred.
- The Attempt stopped before Verifier execution. The sequence terminal is `paused/run_invalid`.
- The typed post-dispatch Case Pause correctly made Contingency ineligible; Negative consequently did
  not run.
- Retry, fallback, replacement, source repair, Pi modification and SDK/Extension/RPC switching were
  all zero.
- The immutable Run must not be rerun, overwritten or reinterpreted as valid recovery evidence.

## 3. Main finding V2B-MAIN-F1 — path-insensitive reasoning false positive

### Workbench evidence

`workbench/src/inspect-v2b.ts` defines `FORBIDDEN_EVIDENCE_V2B` as a byte-level regular expression
that rejects any serialized key named `reasoning`. `scanEvidence()` applies it to every non-Workspace
artifact without parsing the JSON schema. `workbench/src/inspect-v2.ts` has the same relevant
path-insensitive behavior and is part of the delegated V2-B inspection chain.

A Main read-only key-path enumeration over the immutable parent Session, without reading or printing
field values, returned exactly:

```text
line=3  path=$/message/usage/reasoning
line=6  path=$/message/usage/reasoning
line=9  path=$/message/usage/reasoning
line=11 path=$/message/usage/reasoning
line=13 path=$/message/usage/reasoning
line=15 path=$/message/usage/reasoning
line=17 path=$/message/usage/reasoning
line=19 path=$/message/usage/reasoning
```

No matching content or signature path was found.

### Pinned Pi source evidence

- `D:/AI/AI_Projects/project2/.upstream/pi/packages/ai/src/types.ts`, symbol `Usage`, defines
  `reasoning?: number` as a reasoning/thinking token subset already included in output usage.
- `D:/AI/AI_Projects/project2/.upstream/pi/packages/ai/src/api/openai-completions.ts`, symbol
  `parseChunkUsage`, assigns `completion_tokens_details.reasoning_tokens || 0` to that numeric field.
- The same API separately represents actual reasoning content as `ThinkingContent` with
  `type: "thinking"`, `thinking` and optional `thinkingSignature`.

### Classification

```yaml
observed_failure: true
classification: bounded_evidence_scanner_defect
architecture_change_required: false
experiment_semantics_change_required: false
budget_change_required: false
pi_change_required: false
real_call_required_to_verify_fix: false
risk_boundary: secret_and_evidence_integrity
```

The safe rule must distinguish numeric `message.usage.reasoning` metadata from reasoning content or
opaque signatures. It must not merely remove all reasoning checks.

## 4. Why the immutable Stage 2 sequence still cannot pass after that correction

Correcting the false positive can make the Inspector judge the already-written evidence accurately;
it cannot create missing execution facts. The Primary Attempt still has:

- zero Verifier results;
- zero valid initial failure;
- zero Seed and Recovery Group;
- zero A/B Candidates and Selection;
- zero Negative execution.

The Stage 2 Session's inference that another agent cycle was needed after the eighth request is
plausible, but the public terminal reason is only `execution_boundary`. Main therefore does not claim
that increasing the request cap would solve the problem. Changing non-cost budgets is outside the
frozen Contract and is not recommended from one observation.

A new real sequence would be a replacement/new execution authority. It is currently prohibited and
would risk outcome chasing if justified only by this unfavorable result. Main does not recommend or
authorize it automatically.

## 5. Minimal next decision path

If the user wants to preserve maximum evidence quality without reopening real execution, Main
recommends only:

1. authorize an original-Stage-1-Session bounded zero-call correction to the V2/V2-B Inspector and
   focused tests;
2. require schema-aware allowance only for finite non-negative numeric usage-token metadata at the
   exact approved path while retaining all content/signature/Credential rejection;
3. re-inspect the immutable Stage 2 sequence with zero Credential/network/model calls;
4. because this touches a secret/evidence boundary, use the already conditionally authorized single
   fresh focused audit after a corrected Candidate is frozen;
5. return to Main/user for the V2 control decision; do not create another real sequence as part of
   that correction.

After this zero-call correction, the expected project state is still V2 paused with the Version
Question not demonstrated. Any later proposal for another real acceptance sequence must be separately
motivated, contracted and authorized; it must not silently be called a retry, fallback or replacement
of `v2b-real-20260807-01`.

## 6. Claims allowed and prohibited

Allowed now:

- V2-B Stage 1 thin real composition passed deterministic review.
- Gate H and the real Direct `AgentHarness` route worked through eight paid Provider calls.
- Attempt and sequence budgets stopped fail-closed, and post-dispatch invalidity prevented branching.
- The current Inspector has a bounded path-classification bug for Pi numeric usage metadata.
- V2 real two-path recovery remains unproven.

Not allowed now:

- V2-B passed or V2 closed successfully;
- A or B is better;
- real recovery succeeded or both Candidates failed;
- the reasoning matches contained private model reasoning;
- Direct `AgentHarness` is rejected;
- a higher request cap, new Case or rerun would necessarily succeed.

## 7. User decision required

```yaml
user_decision_required:
  decision: authorize_or_decline_bounded_zero_call_inspector_correction
  evidence:
    - immutable_session_matches_only_message_usage_reasoning_paths
    - pinned_pi_defines_usage_reasoning_as_numeric_token_metadata
    - current_sequence_is_post_dispatch_paused_and_cannot_continue
  options:
    - authorize_zero_call_correction_main_review_and_one_focused_audit
    - preserve_current_pause_without_correction
  recommendation: authorize_zero_call_correction_only
  consequence: improves_truthfulness_of_immutable_evidence_but_does_not_answer_real_recovery_question
```
