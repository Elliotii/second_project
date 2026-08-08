# V3.5 Goal 2.5 Main Review Bounded Correction Prompt

```yaml
status: authorized_bounded_correction
goal_id: V3_5_G2_5_TERMINATION_SAFE_REAL_SKILL_CLOSURE
control_baseline_commit: 6e56a3f7e6048f74a46791af463c4e2d2f98f5b8
reviewed_candidate_commit: e852f90fa49ae9320896b91338bfb966e328cf98
owner: original_top_level_implementation_session_019fe1df-6de4-7500-9f4f-7c6a03235233
access_authority: zero_credentials_zero_network_zero_provider_zero_real_model
```

Main accepts the overall architecture and scope of Candidate `e852f90...`, but it is not
yet eligible for the focused Audit Baseline. Perform one bounded correction turn for the
three related closure defects below. Do not redesign the Goal or repeat already passing
proof that is unaffected.

## F-001 — Settled Verifier handoff is not evidence-equivalent

Current `handoffGoal25SettledVerifierV35` accepts a caller-provided in-memory Runtime object
and validates only that `runtime-v35g25.json` and first-payload refs exist. It does not read
and authenticate the persisted Runtime, cross-check its digest/identity against the passed
object, reopen the public Session, prove Tool-call/Tool-result closure, or recheck current
Workspace/protected bytes immediately before the external Verifier. A tampered Runtime or
post-terminal drift can therefore reach the Verifier on the preferred settled path even
though the fallback path fails closed.

Correct this without forcing the budget-terminal checkpoint schema onto settled runs:

1. add a thin persisted settled-handoff record/checkpoint or equivalent typed evidence;
2. authenticate the persisted Runtime body/digest and require exact equality with the
   expected Run/Session/Tool-interface lineage;
3. reopen the public JSONL Session and require stable entry equality plus complete
   Tool-call/Tool-result closure;
4. recheck Workspace tree and protected bytes against terminal/pre-run authority;
5. authenticate the first-payload artifact and Tool-interface digest;
6. persist this evidence before the frozen external Verifier runs;
7. make every mismatch stop with zero Verifier calls and zero Candidate starts.

Add focused tests for the valid settled handoff and at least persisted Runtime tamper,
Session/Tool-result mismatch, Workspace/protected drift and missing/tampered first payload.
The budget-terminal path and its accepted semantics remain unchanged.

## F-002 — No frozen no-source-edit real execution entry point

The Candidate exposes a generic `executeGoal25PairV35` requiring an external
`executionPortFactory`, but the later authorized no-source-edit Session has no tracked,
frozen way to construct the two one-Run DeepSeek authorities and opaque Credential resolver.
It would have to invent new glue after the Execution Baseline, violating the frozen-source
boundary.

Add the smallest tracked execution surface:

1. a convenience `executeGoal25RealPairV35` (or equivalent) that creates exactly one
   one-Run authority per arm and uses the fixed Goal 2.5 DeepSeek port;
2. `workbench/scripts/v35g25-real-pair.ts` (and a package script if useful) with an exact
   explicit authorization token, project root, fresh pair root, historical State root and
   expected audited Execution Baseline inputs;
3. opaque Credential resolution only from the already established environment boundary,
   and only after all read-only identity/cleanliness/source gates pass;
4. zero-call tests proving missing/incorrect arguments or authorization fail before
   Credential/network/Provider/model access and construction alone remains `0/0/0/0/0`.

Do not execute this real entry point in the correction turn.

## F-003 — Session↔Run linkage is not directly inspectable from arm evidence

Each arm creates a fresh persistent JSONL Session and writes its ID into the arm Manifest,
but the Manifest/evidence lacks a bounded Session reference plus entry count/digest (or an
equivalent authenticated linkage record). Add the minimal relative Session reference and
stable entry identity needed to inspect `Session -> Run` and `Run -> Session` without
scanning by convention. Do not expose a new public raw-Session API or change Goal 1
persistence semantics.

## Verification and return

- keep Case, Prompt, Skill, Verifier, provider/model, budgets, arm order and authority
  semantics byte/fact unchanged;
- keep Pi untouched and use public imports only;
- credentials/network/external Provider/model/real calls remain exactly `0/0/0/0/0`;
- run strict TypeScript, the focused Goal 2.5 suite and only the affected narrow regressions;
- create one bounded correction commit on top of `e852f90...`;
- update the Implementation Report and Closeout Draft with exact commands/results, Source
  Delta and `CURRENT_STATE_UPDATE_PROPOSAL`;
- do not edit Main control files, accept the Goal, start the audit or execute the real Pair;
- stop and return the correction commit SHA to Main.

If satisfying any finding requires changing the frozen experiment, Pi, the Direct
AgentHarness route, budget, Case, treatment or authority boundary, stop with a Pause Report
instead of broadening scope.
