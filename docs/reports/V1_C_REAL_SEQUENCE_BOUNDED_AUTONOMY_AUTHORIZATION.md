# V1-C Real Sequence Bounded Autonomy Authorization

```yaml
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
authorization_date: 2026-08-06
user_instruction: all_authorized_continue
audited_execution_baseline_commit: cc71cdb8952178ef1d7422f44359d6ca08473b18
audited_execution_baseline_tree: 7fa38a7b4484fa4076834c0cb01a46415bad0ac9
canary_manifest_id: c26e75989623ae1218be0a3996c59de2ccbce946988396695b38bb9fdc482c4c
real_canary_authorized: true
canary_cost_hard_cap_usd: 0.10
full_pilot_conditionally_pre_authorized: true_after_valid_main_reviewed_canary
full_pilot_remaining_cost_hard_cap_usd: 1.90
whole_v1_c_real_sequence_hard_cap_usd: 2.00
closeout_commit_authorized: true_after_terminal_v1_c_disposition
v2_authorized: false
```

## Binding interpretation

The user's instruction authorizes Main Session to continue the bounded V1-C sequence without routine
per-Gate intervention:

1. create a Canary Authorization Baseline and fresh no-source-edit Canary Session;
2. permit one opaque `DEEPSEEK_API_KEY` resolution inside the tracked execution process;
3. permit network access only to the fixed DeepSeek endpoint through the tracked Pi Provider;
4. run exactly the immutable one-cell Arm-A Canary under its USD 0.10 hard cap;
5. Main-review its Manifest, Ledger, Journal, Session, Verifier, Outcome, Inspector and usage/cost;
6. if and only if Canary is terminal, integrity-valid, comparable and otherwise Contract-valid, activate the
   user's conditional pre-authorization for a new full-Pilot identity and fresh no-source-edit Pilot Session;
7. keep Canary and the full Pilot disjoint; the full Pilot retains USD 1.90 and 24-cell/8-child limits;
8. complete descriptive aggregate, V1-C closeout and the final authorized Git commit.

This is not authority to enter V2, repair source during real execution, alter task/Prompt/Skill/Verifier/Tool/
Provider/model, install dependencies, modify Pi, retry a Run, use fallback or create a replacement sequence.

## Automatic stop conditions

Stop before another real request or cell if:

- Canary is nonterminal, integrity-invalid, noncomparable or has unknown usage/cost;
- a real result exposes a frozen source, Manifest or evidence-contract defect;
- Credential/profile/endpoint/schema/pricing identity drifts;
- any next reservation could exceed the active USD cap;
- Manifest, Ledger, Journal, Session, Verifier, Outcome or Inspector disagree;
- retry, fallback, replacement, model/task/fixture change or source repair would be needed;
- a secret/raw-response/reasoning/protected-path boundary fails;
- an existing Contract Pause Condition applies;
- continuation would enter V2/V3 or expand into a general platform.

At such a stop, preserve evidence, create the bounded report, perform no repair in the execution Session and
return to Main Session. Conditional full-Pilot authority is not activated after an invalid Canary.

## Session boundaries

- Main Session owns control state, authorization commits, Manifest creation, acceptance, aggregate acceptance
  and final closeout commit.
- Fresh Canary and Pilot Sessions may write only their named reports and ignored execution evidence. They
  cannot edit/stage/commit source, tests, fixtures, Manifest, control files, Pi or references.
- The Session observing real outcomes cannot repair the implementation.
