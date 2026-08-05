# V1-C Precontract Research — Multi-turn Budget Stop, Synthetic Failure Attribution and Evidence Completion

```yaml
status: accepted_research_contract_formalized
date: 2026-08-05
research_owner: main_session
research_kind: bounded_zero_real_call_precontract_research
contract_drafting_authorized_by_user: 2026-08-05
active_goal: null
goal_created: false
contract_created: formal_accepted_not_activated
implementation_authorized: false
real_model_calls: 0
credential_reads: 0
external_network_calls: 0
pi_core_changes: 0
v2_authorized: false
```

## 1. Executive conclusion

**Fact.** V1-B remains historically closed as
`CLOSE_V1_B_INCONCLUSIVE_AUTHORIZED_SEQUENCE_EXHAUSTED`; this research does not
reopen, rewrite or reclassify either Pilot.

**Fact.** The replacement Run did not stop on its first model request. It
completed and accounted eight Provider/model requests and ten Tool calls in
cell 1. Its pause snapshot contains eight known Provider requests, a nonzero
known subtotal, no pending Provider reservation and no conservative charge.
The frozen initial-Attempt Provider-request cap was exactly eight.

**Fact.** The replacement workspace currently passes both its declared public
test and the frozen external Verifier. This is a post-closeout read-only
observation; it does not retroactively make the historical Run terminal or
comparable.

**Fact.** A new zero-real-call deterministic reproduction proved that the
current Workbench misclassifies a Provider-request budget denial before the
next dispatch as `invalid_or_unknown_usage_after_provider_response`. The
reproduction permits one Faux Provider response, then denies the second
request. Pi converts the request-hook error into a synthetic assistant failure
message; the Workbench treats that message as a Provider response even though
no reservation is pending, and creates the same invalid-usage pause shape.

**Inference — high confidence.** The replacement Run most likely finished
request 8 successfully, attempted to enter request 9, hit the frozen request
cap before dispatch and then encountered this proven synthetic-failure
misclassification. The historical raw internal error was intentionally not
persisted, so this remains a strongly supported inference rather than a
retroactive fact claim.

**Recommendation.** Create a new, explicitly authorized V1-C Goal rather than
reopen V1-B or enter V2. V1-C should repair only the project-owned multi-turn
budget-stop/evidence boundary, independently audit the frozen Candidate, run
one new-identity real canary, and only after a valid canary resume the original
A/B/C comparison under a new immutable Pilot identity.

## 2. Why V1-C is permitted but not yet authorized

The accepted V1 Charter §13.3 does not define a default V1-C, but permits one
to be discussed when:

- V1-B pauses on a frozen Candidate defect;
- an infrastructure-dominated inconclusive result needs one separately
  approved bounded repeat; or
- a distinct architecture question cannot be resolved in Main review.

The first two triggers are now concretely satisfied. This research establishes
eligibility to draft a Goal; it does not itself create or activate that Goal.

## 3. Evidence reviewed

### 3.1 Project authority and historical evidence

- `CURRENT_STATE.md` at Main-session HEAD
  `4f7a6c126bc1bf1dc910877896c49109e5f38e6f`;
- accepted `V1_VERSION_CHARTER.md`;
- accepted and consumed `V1_B_GOAL_CONTRACT.md` and
  `V1_B_PAUSE_RECOVERY_AMENDMENT.md`;
- `V1_B_PILOT_EXECUTION_REPORT.md`;
- `V1_B_REPLACEMENT_STAGE2_PAUSE_REPORT.md`;
- `V1_B_REPLACEMENT_STAGE2_MAIN_REVIEW_AND_CLOSEOUT_DECISION.md`;
- `V1_B_CLOSEOUT.md` and `V1_CLOSEOUT.md`;
- immutable replacement ledger, journal and pause evidence under
  `.runs/v1-b/stage2-replacement/`.

### 3.2 Workbench source

- `workbench/src/pi/pi-run-handle-v1.ts`
  - `ThreeLevelBudgetV1B.reserveProvider()`;
  - `ThreeLevelBudgetV1B.commitProvider()`;
  - `createPiRunHandleV1()`;
  - `attach()` and its `before_provider_request` / subscriber paths;
- `workbench/src/run-v1.ts::executeV1RunCell()`;
- `workbench/src/pilot-v1.ts::runNextPilotCellV1B()`;
- `workbench/src/inspect-v1.ts::inspectPausedRunV1B()`;
- `workbench/src/contracts/v1-types.ts::V1B_PAUSE_PHASES`;
- `workbench/tests/v1b-stage1.test.ts` pause and reservation tests;
- frozen replacement Manifest
  `fixtures/manifests/v1/v1b-stage2-replacement-execution.json`.

### 3.3 Pinned Pi source

Pinned commit:

```text
027a5847901b5dde30270abaa1041046cd2b4b55
```

Relevant public-path source:

- `packages/agent/src/harness/agent-harness.ts::createStreamFn()`;
- `AgentHarness.emitBeforeProviderRequest()`;
- `createFailureMessage()`;
- `AgentHarness.emitRunFailure()`;
- `AgentHarness.executeTurn()`;
- `AgentHarness.handleAgentEvent()`;
- `AgentHarness.subscribe()`;
- `packages/agent/src/agent-loop.ts::streamAssistantResponse()`.

### 3.4 Design reference

`reference/cc-harness-knowledge/docs/HARNESS_ENGINEERING_PLAYBOOK.md` §6 was
used only as a design reference. Its transferable invariant is that API
request retry, Query transition, Tool/Hook error and terminal reason must not
be collapsed into one generic failure. It does not prove Pi or Workbench
behavior.

## 4. What the replacement evidence proves

### 4.1 Known request and budget state

The replacement pause evidence records:

```yaml
request_ordinal: 8
known_provider_requests: 8
known_tool_calls: 10
known_tokens: 11670
known_cost_usd: 0.0003864952
pending_provider_reservation: null
conservative_usage_charge_usd: 0
real_call_counters:
  network_calls: 8
  provider_calls: 8
  model_calls: 8
```

The frozen Manifest records:

```yaml
initial_attempt_provider_requests_max: 8
arm_A_or_B_run_provider_requests_max: 8
initial_attempt_tool_calls_max: 12
```

**Fact.** Request 8 is already part of accumulated known usage. A genuine
request-8 usage-unknown failure should instead retain a pending request-8
reservation and conservatively charge it. The persisted `pending: null` state
therefore contradicts the recorded phase name.

### 4.2 Workspace outcome after the stop

The preserved replacement workspace contains a bounded implementation of
`parseDuration`. Main Session ran, without editing the workspace:

```text
node --test test/public.test.mjs
V1_WORKSPACE=<preserved workspace> node ../config/verifier.mjs
```

Both exited 0; the external Verifier returned `status: passed`.

**Fact.** The coding side effect was already sufficient for the frozen
environment outcome even though the historical Run never reached a valid
Workbench terminal record.

**Boundary.** This cannot be backfilled into the immutable historical Run.
It is evidence for future terminalization design only.

## 5. Proven causal mechanism

### 5.1 Pi ordering

Pinned Pi awaits `before_provider_request` before calling
`models.streamSimple()`. A throw from the hook prevents that next external
dispatch.

When the Agent loop throws, `AgentHarness.executeTurn()` invokes
`emitRunFailure()`. Pi creates an assistant message with:

```yaml
role: assistant
stopReason: error_or_aborted
usage: all_zero
errorMessage: internal_error_text
```

It then emits normal `message_start`, `message_end`, `turn_end`, `agent_end`
and, if failure reporting is not interrupted, the Harness `settled` event.

### 5.2 Workbench misclassification

The current Workbench subscriber handles every assistant `message_end` as a
Provider response:

```text
assistant message_end
→ budget.commitProvider(message)
→ any exception
→ pause(invalid_or_unknown_usage_after_provider_response)
```

It does not first distinguish:

- a real Provider-completed assistant message with a matching pending
  reservation; from
- Pi's synthetic failure assistant message after a pre-dispatch hook error.

If request reservation fails because the request cap is already exhausted,
there is no pending reservation. The synthetic failure message therefore
causes `commitProvider()` to throw `provider usage arrived without
reservation`; the catch block then assigns the wrong usage-invalid phase and
interrupts Pi's normal failure-to-settled path.

### 5.3 Deterministic zero-call reproduction

Research-only ignored test:

```text
.runs/v1-c-precontract/reproduce-cap-misclassification.test.ts
```

The test uses the existing Faux Provider route and permits exactly one request.
The first response requests a Tool, which requires a second Provider turn. The
second request is rejected by the cap before dispatch. Result:

```yaml
test_exit: 0
real_model_calls: 0
network_calls: 0
provider_calls: 0
observed_pause_phase: invalid_or_unknown_usage_after_provider_response
known_provider_requests: 1
pending_provider_reservation: null
```

This proves the Workbench mechanism independently of DeepSeek and without a Pi
Core change.

## 6. Why the frozen Inspector rejects the state

`inspectPausedRunV1B()` currently assumes that a paused Run has at most one
Provider reservation and that pause counters are at most one. It also requires
both current post-reservation phases to carry a pending reservation.

Those assumptions are valid for the narrow first-request correction tests but
not for a real multi-turn Attempt:

```text
request 1..N committed
→ request N+1 denied before dispatch
→ no pending reservation
→ known counters remain N
```

They are also incomplete for the genuine usage-unknown case:

```text
request 1..N-1 committed
→ request N dispatched
→ response usage unavailable
→ request N remains pending
→ full request-N reservation is conservatively charged
```

The Producer and Inspector therefore need one shared multi-request state model,
not another special case restricted to request 1.

## 7. Smallest viable V1-C design

### 7.1 Required source behavior

1. **Reservation-aware message attribution**
   - commit Provider usage only for an assistant completion that matches the
     active pending request;
   - recognize Pi's synthetic `error` / `aborted` failure message only when no
     Provider reservation is pending;
   - never persist raw `errorMessage`, credential, response body or reasoning.

2. **Typed pre-dispatch budget stop**
   - represent a request-cap denial separately from Provider usage failure;
   - preserve exact request ordinal, completed usage, Tool usage, counters and
     zero additional dispatch;
   - permit Pi to finish its failure event sequence and emit `settled`.

3. **Common external measurement remains common**
   - after Pi has emitted `settled`, run the same external Verifier for A/B/C;
   - a passing environment outcome may be a task pass even when the Agent's
     diagnostic stop reason was a bounded request-cap stop;
   - retain the stop reason as a separate guardrail/efficiency diagnostic;
   - do not treat Agent self-claim or the synthetic failure message as formal
     Outcome.

4. **Multi-request Inspector model**
   - validate every completed request reservation in ordinal order;
   - distinguish the optional final pending reservation from prior committed
     reservations;
   - recompute known and conservative budget chains;
   - accept a coherent typed pause only as nonterminal/noncomparable;
   - reject missing, duplicate, reordered, mixed-counter and coherently
     rehashed forgeries.

5. **Sanitized per-request accounting evidence**
   - persist a numeric `provider_usage_committed` event or equivalent
     content-addressed reservation record with request ordinal, reservation ID,
     token count and cost;
   - do not persist Provider content or raw response metadata merely to prove
     budget accounting.

### 7.2 What should not change

- Direct public emitted `AgentHarness` remains the runtime;
- Pi Core patch remains zero;
- no SDK/RPC/Extension route is needed;
- no Provider retry, fallback or same-Run replay;
- no durable runtime, database, scheduler or general transaction system;
- no V2 multi-path, Experience, Router or Skill mutation;
- historical V1-B artifacts and closeouts remain immutable;
- A/B/C initial model-visible fairness remains unchanged.

## 8. Budget and completion decision

### 8.1 Do not solve this by only raising 8 to 16

Raising the cap alone would leave synthetic-failure attribution and
multi-request pause validation broken. It would also be a post-outcome protocol
change without first proving the state machine.

### 8.2 Recommended initial policy

Keep the existing equal initial-Attempt request cap for the first V1-C canary.
With correct attribution, a cap denial can complete Pi's failure event sequence,
reach `settled`, and allow the common external Verifier to measure the existing
Workspace. The preserved replacement workspace demonstrates why this is
valuable: its code passes even though the prior terminal record was invalid.

Only change the request cap if deterministic calibration later proves that the
cap prevents meaningful measurement rather than merely bounding inefficient
Agent continuation. Any change must be frozen symmetrically for A/B/C in a new
Manifest before new outcomes.

## 9. Proposed Goal and Session decomposition

### Stage 1 — zero-call bounded correction

Owner: dedicated V1-C Implementation Session.

Scope:

- the minimal V1-owned contracts, Pi adapter/handle, runner, Inspector and
  focused tests necessary for §7;
- deterministic cap-exhaustion, Pi synthetic-failure, genuine usage-unknown,
  multi-request pause and tamper regressions;
- strict TypeScript and necessary V0/V1 regressions;
- zero credential, network, Provider and real-model access.

### Focused independent audit

Required because the change touches high-risk budget, stop, terminalization and
evidence boundaries. Audit only:

- real-vs-synthetic assistant message attribution;
- write-before-dispatch and no-dispatch cap semantics;
- multi-request reservation/accounting chain;
- Inspector positive/negative cases;
- terminal/comparable distinction;
- required V0/V1 regressions and source identity.

The Audit Session must not repair source or alter control state.

### Stage 2 — one new-identity real canary

Owner: fresh no-source-edit Execution Session after Candidate audit and a new
Execution Baseline.

Recommended canary:

- one frozen `parse-duration` Baseline cell under a new Manifest identity;
- no retry, fallback, replacement or source edit;
- the existing initial request/Tool/token/time/cost envelope;
- an explicit small cost ceiling no greater than the existing USD 0.10
  per-initial-Attempt cap;
- accept either natural completion or a correctly typed cap stop followed by
  Pi `settled` and the common Verifier;
- stop immediately on any Producer/Inspector disagreement or unknown cost.

### Stage 3 — new full comparison only after valid canary

If the canary is valid, create a separate immutable full-Pilot identity and
rerun the complete A/B/C comparison. Do not combine historical invalid Runs
with new outcomes. Preserve the original four tasks, two repetitions and
three strategies unless a separately reviewed protocol amendment is justified
before the new Pilot.

## 10. Pi SDK / Extension checkpoint

**Fact.** The current defect is in Workbench-owned request accounting,
synthetic failure attribution and Inspector semantics. Pinned Pi's public
`AgentHarness` events already expose enough behavior to implement and test the
bounded correction.

**Recommendation.** Do not activate the deferred SDK/Extension compatibility
checkpoint for V1-C. Switching surfaces would change experimental composition
and would not remove Workbench ownership of Manifest, budget, Verifier, Outcome
or evidence integrity. Retain the existing checkpoint for pre-V2 clean
Session/Workspace design or later interactive Pi packaging.

## 11. Proposed Definition of Done boundary

A future V1-C Goal should not pass unless:

1. deterministic reproduction of the present misclassification fails before
   the fix and passes with the new typed classification;
2. Pi synthetic failure messages cannot commit Provider usage without a
   matching pending request;
3. genuine later-request usage-unknown evidence retains and conservatively
   charges the exact final pending reservation;
4. multi-request Inspector positive and coherent-tamper negative tests pass;
5. a budget stop permits Pi to reach `settled` without creating another model
   request;
6. the common Verifier runs after the settled bounded stop and remains
   treatment-independent;
7. strict TypeScript and required V0/V1 regressions pass;
8. focused independent audit passes;
9. one real canary produces a valid terminal or a coherent accepted pause with
   exact bounded cost;
10. only after canary acceptance may a new full A/B/C Pilot be authorized.

## 12. Pause conditions for V1-C

Stop if:

- the correction requires a Pi Core patch, private import, SDK/RPC/Extension
  switch or dependency download;
- a synthetic Pi failure cannot be distinguished without persisting raw error
  text or Provider content;
- budget denial can occur after external dispatch without a durable pending
  reservation;
- Pi does not reach a safe settled/idle state after the bounded hook denial;
- common measurement would become C-only treatment;
- historical V1-B evidence would need rewriting;
- the correction expands into a general durable runtime or V2;
- the canary has unknown cost, evidence disagreement or requires a retry.

## 13. Claims and remaining uncertainty

### Allowed now

- the current Workbench deterministically misclassifies request-cap denial as
  invalid Provider response usage;
- the replacement evidence is consistent with that mechanism;
- the preserved replacement workspace currently passes both frozen checks;
- a bounded project-owned V1-C correction is architecturally plausible without
  a Pi Core patch.

### Not allowed now

- the original Pilot had the same exact root cause;
- DeepSeek returned malformed usage;
- V1-B is retroactively valid;
- Skill-only or Runtime Control is better;
- the proposed correction is implemented or audited;
- a V1-C canary or full Pilot is authorized;
- V2 is authorized.

### Unconfirmed

- the exact hidden error text of the historical replacement Run;
- whether its next intended transition was specifically request 9 rather than
  another post-request-8 internal error;
- whether a future real canary will repeat the same Agent continuation;
- whether the full A/B/C result will favor Skill-only, Runtime Control or
  neither.

## 14. Decision recommendation

```yaml
recommended_disposition: ACCEPT_V1_C_PRECONTRACT_RESEARCH
recommended_next_control_action:
  - main_session_drafts_V1_C_GOAL_CONTRACT_DRAFT
  - no_activation_yet
  - no_real_call_authority_yet
recommended_goal_mission: >-
  repair and independently verify the multi-turn request-budget stop and
  evidence boundary, validate one new-identity real canary, then conditionally
  complete the frozen A/B/C comparison without reopening V1-B
recommended_runtime: direct_public_emitted_AgentHarness
recommended_pi_core_patches: 0
recommended_real_sequence:
  - one_canary_after_audited_execution_baseline
  - full_new_identity_pilot_only_after_canary_acceptance
```

## 15. User decisions required

```yaml
user_decisions_required:
  - decision: accept_or_reject_V1_C_precontract_research
    evidence: deterministic_zero_call_reproduction_plus_replacement_raw_evidence
    options:
      - accept_and_draft_bounded_V1_C_contract
      - request_narrow_revision
      - keep_V1_inconclusive_and_move_to_another_authorized_direction
    recommendation: accept_and_draft_bounded_V1_C_contract
    consequence: no_implementation_or_real_call_until_later_separate_authorization
```
