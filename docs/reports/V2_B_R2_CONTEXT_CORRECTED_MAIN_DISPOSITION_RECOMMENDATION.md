# V2-B R2 Context-corrected Main Disposition Recommendation

```yaml
date: 2026-08-07
goal_id: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
review_status: main_limited_review_complete
sequence_id: v2b-r2-real-20260807-02
execution_baseline_commit: 571165a186444e16a0fafad2fcd886295d7efbab
execution_baseline_tree: bb7245412093f132fec4236711e7bbda96d0a1c1
main_contract_disposition: PAUSE_V2_B_R2_NEGATIVE_NOT_VALID
positive_recovery_mechanism: demonstrated_on_one_controlled_case
mandatory_real_negative: not_demonstrated
v2_b_formal_pass: false
v2_formal_acceptance: pending_user_decision
real_continuation_authorized: false
v3_authorized: false
```

## 1. Main conclusion

**Fact.** The interrupted Stage 2 Session recovered safely. Its real sequence was already terminal
before the interruption; the resumed turn wrote reports only and made no additional Credential,
network, Provider/model, Verifier, Case, Attempt, retry, fallback or replacement action.

**Fact.** The R2 Positive path is valid evidence. A zero-real-call Primary traversed the Direct public
Pi `AgentHarness`, Tool lifecycle and JSONL Session, settled, passed the maintenance check, failed the
target Verifier and froze one Recovery Seed before either Candidate. Real Candidates A and B then
started once from identical failed Workspace bytes. Both passed the common target Verifier and all
hard gates. The frozen Selector selected A.

**Fact.** The mandatory real Negative is not valid evidence for the no-branch condition. It started
once, made eight real Provider/model calls and twelve Tool calls, then paused at an
`execution_boundary` without a Verifier result. It created no recovery objects, but absence of those
objects alone cannot substitute for the Contract-required target-Verifier pass.

**Fact.** Final independent read-only inspection returned `integrity_valid: true`,
`terminal_valid: true`, `errors: []`. This proves that the paused sequence is internally consistent;
it does not convert the Negative into a pass.

**Recommendation.** Apply the binding disposition
`PAUSE_V2_B_R2_NEGATIVE_NOT_VALID`. Do not retry or replace the Negative under the current Contract.
The Positive mechanism evidence is meaningful and should be retained, but V2-B cannot receive either
formal PASS disposition because Gate J-R2 and DoD item 9 are unsatisfied.

## 2. Main evidence checks

Main independently checked the following against the Stage 2 worktree and ignored raw evidence:

| Check | Main result |
|---|---|
| Stage 2 HEAD / tree | exact `571165a186444e16a0fafad2fcd886295d7efbab` / `bb7245412093f132fec4236711e7bbda96d0a1c1` |
| Stage 2 tracked/index delta | none; only the two untracked reports |
| Pinned Pi and emitted-package cache | both exact and clean at `027a5847901b5dde30270abaa1041046cd2b4b55` |
| Final tracked Inspector | exit 0; integrity valid, terminal valid, no errors |
| Controlled Seed | write-once before Candidates; failed Workspace digest `85d50969c9d7ede5c7b0e67186231c2d3cbc21ff9f82872ae7c3cd3f9fc6e86a` |
| Candidate A | 6 parent entries, 8 context messages, settled, Verifier pass |
| Candidate B | 0 parent entries, 2 context messages, quiescent pre-dispatch budget terminal, Verifier pass |
| Selector | both eligible; selected A by frozen secondary ordering |
| Negative | one start, no Verifier result, no recovery objects, typed hard-stop Pause |
| Actual new cost | USD `0.0012750192` |
| Binding old + new R2 cost | USD `0.0021159376`, below USD `1.40` |

The Seed digest above is the one written in `recovery-seed.json` and both Candidate initial Workspace
records. Candidate A's allowed semantic diff size was 237 versus B's 252; A also used fewer tokens
and Tool calls. This is why the frozen Selector chose A. It is not evidence that A is generally
superior to B.

Main review command note: the first local Inspector invocation used Node's `--import` instead of the
required custom-loader flag and failed during package resolution before inspection. The first
correct-loader invocation then hit the outer command timeout. Main reran the same read-only Inspector
with a sufficient timeout; it exited 0 with the result recorded above. These diagnostic launches made
no Evidence, source, control, Pi, Credential, network or model-call change.

## 3. Version Question disposition

V2 asked whether the Workbench can freeze one verifier-failed Seed, run two isolated recovery paths
whose primary treatment delta is parent Session history, independently verify both, select an eligible
result or none, and avoid branching on an initial pass.

The evidence now answers the first part affirmatively for one controlled real Case:

```text
controlled verifier-failed Seed
-> identical isolated Workspace copies
-> retained-history A and fresh-session B
-> both independently verified
-> deterministic eligible selection of A
```

The evidence does not answer the real Negative part because the Negative never reached its Verifier.
Therefore the accurate version-level statement is:

> The core two-path real recovery and selection mechanism is demonstrated on one controlled failed
> Seed; the mandatory real initial-pass/no-branch acceptance condition remains unverified.

This is substantial mechanism evidence, not a full V2 PASS and not evidence of statistical path
superiority or natural-failure recovery rate.

## 4. Why Main does not recommend another R2 run

The Amendment makes Negative failure a hard exit and explicitly disallows using infrastructure
replacement for Negative failure. A further run would require new authority and a revised experiment,
and after observing a valid Positive result it would create a material outcome-chasing risk. The user
also required that no Case, path, retry, replacement or budget be added merely to manufacture a
cleaner result.

The missing Negative matters for formal completeness, but it does not erase the valid Positive A/B
evidence. The bounded route has now yielded the highest-value fact it was designed to test: the
Workbench can actually form, run, verify and select between two real recovery paths from a frozen
failed Seed.

## 5. Recommended user disposition

Main recommends that the user choose between the following without further real execution:

1. **Recommended:** accept a revised/inconclusive V2 closeout that preserves the formal V2-B Pause,
   records `mechanism_proven_negative_incomplete`, and closes V2 with this explicit limitation. This
   follows the prior instruction to stop on a hard exit and close V2 from the evidence obtained.
2. Keep V2-B paused and defer any separately contracted Negative-only validation. This preserves the
   possibility of a later full PASS but leaves V2 active and does not add information now.

Main does not recommend rejecting the Direct route: the controlled Seed, A/B execution, independent
verification and selection all worked. Main also does not recommend a new R2 replacement or a hidden
V2-C.

Neither option authorizes V3. V3 research or implementation must remain a separate later decision
after the V2 baseline/disposition is formally fixed.

## 6. Claims boundary

Allowed now:

- one controlled verifier-failed Seed produced two real, fair, isolated Recovery Candidates;
- both Candidates passed the common Verifier and the frozen Selector selected A;
- Candidate A retained parent history and Candidate B began with a fresh Session;
- the paused sequence is integrity-valid and terminal-valid with exact bounded cost;
- the real Negative acceptance condition was attempted once but not demonstrated.

Not allowed:

- V2-B or V2 passed or was closed;
- initial-pass/no-branch behavior was proven by the real Negative;
- A is generally better than B;
- natural real-model failure was recovered end to end;
- statistical improvement, self-evolution, production durability, SDK/Extension integration or V3
  capability was demonstrated.

## 7. User decision required

```yaml
user_decision_required:
  decision: formal_V2_disposition_after_R2_hard_stop
  evidence:
    - controlled_positive_seed_valid
    - real_A_and_B_valid_and_verifier_passed
    - frozen_selector_selected_A
    - mandatory_negative_started_once_but_has_no_verifier_result
    - final_inspector_validates_truthful_paused_terminal
  options:
    - close_V2_with_mechanism_proven_negative_incomplete_limitation
    - keep_V2_B_paused_for_possible_future_separately_contracted_negative_validation
  recommendation: close_V2_with_explicit_limitation_and_no_further_R2_execution
  consequence: preserves_valid_portfolio_evidence_without_claiming_full_negative_acceptance
```
