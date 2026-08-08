# V3.5 Goal 2.5 Focused-audit Bounded Correction Prompt

```yaml
status: authorized_bounded_audit_correction
goal_id: V3_5_G2_5_TERMINATION_SAFE_REAL_SKILL_CLOSURE
owner: original_top_level_implementation_session_019fe1df-6de4-7500-9f4f-7c6a03235233
source_parent: 6c5ccf7fbc76c5bc51355e707b7eabb194974b19
audit_baseline: e174808550211f2236c3a5c08a350a45d1bcab48
audit_disposition: REVISE_V3_5_G2_5_FOCUSED_AUDIT
access_authority: zero_credentials_zero_network_zero_provider_zero_real_model
```

The single authorized focused audit is complete. Main accepts both findings as reachable,
bounded correctness defects. Perform one cohesive hit-only correction; do not revisit the
already passing settled handoff, fairness, Session/Run linkage or dormant entry except where
a compile/signature update is mechanically required.

## F-001 — mixed Tool batch / post-success Provider follow-up

Pi terminates a Tool batch only when every result in that batch has `terminate: true`. A
response containing successful `public_test` plus a non-terminating Tool can therefore
attempt another Provider request, while the current adapter may later classify the Run as
`successful_public_test` termination.

Correct within the Goal 2.5 adapter and focused tests:

1. bind accepted public-test termination to actual Provider/Tool ordering, not merely the
   existence of one terminating `run_command` result;
2. if Pi attempts any Provider request after a successful terminating `public_test` result,
   refuse that request locally before Credential/network/Provider/model dispatch;
3. persist/classify that trajectory as invalid and keep Verifier/Candidate starts at zero;
4. preserve the normal sole-successful-`public_test` path: Tool Result persisted, no follow-up
   attempt, one public `settled` and normal Verifier eligibility;
5. add a mixed-batch fixture proving the post-success follow-up causes no external dispatch,
   no accepted `public_test_terminated` claim, zero Verifiers and zero Candidates.

Do not make all Tools terminating, remove required edit/read Tools, patch Pi, add retries or
change the frozen Case/Tool surface. A thin local pre-dispatch guard in the existing adapter
is the intended scale; choose the exact typed state fields based on the source.

## F-002 — budget-terminal live handoff recheck

The persisted pre-Verifier checkpoint is authenticated, but its handoff currently validates
only stored artifacts. Reuse the settled-handoff pattern to:

1. reopen the current public JSONL Session immediately before the budget-terminal Verifier;
2. require current Session identity, entry count/digest and Tool-call/Tool-result closure to
   match the persisted checkpoint;
3. recompute current Workspace and protected-byte digests and require exact checkpoint and
   pre-run-authority equality;
4. keep the existing persisted Runtime, usage, first-payload and checkpoint-order checks;
5. add post-checkpoint live Session, Workspace and protected-byte mutations that each run
   zero Verifiers and start zero Candidates.

Do not create another checkpoint subsystem or change settled-path semantics.

## Verification and return

- strict TypeScript and focused Goal 2.5 tests must pass;
- rerun only affected Goal 2/V2 checkpoint and necessary Goal 1 regressions;
- access counters remain exactly `0/0/0/0/0`; never read `.env.g005` or execute the real
  pair;
- keep Pi, frozen Case/Prompt/Skill/Verifier/provider/model/budgets/order/fairness and closed
  evidence unchanged;
- update `V3_5_G2_5_IMPLEMENTATION_REPORT.md` and `V3_5_G2_5_CLOSEOUT_DRAFT.md` with the two
  finding dispositions, exact commands and remaining limits;
- create one bounded correction commit on top of `6c5ccf7...`; if the shared Git-index
  permission boundary recurs, stop after a clean exact delta and let Main mechanically stage
  and commit only the allowlisted files;
- do not edit Main control files, the audit report, Contract or Charter; do not accept Goal
  2.5 or unlock real execution.

Stop and return the exact commit/delta. Main will perform a narrow re-review and return only
these two hits to the same Audit Session for recheck; no second broad audit is authorized.
