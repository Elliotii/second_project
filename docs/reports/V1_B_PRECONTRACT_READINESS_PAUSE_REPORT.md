# V1-B Precontract Readiness Pause Report

```yaml
status: pause_pending_user_decision
date: 2026-08-04
trigger: tracked_real_execution_surface_missing_from_accepted_V1_A_baseline
active_goal: null
V1_A_status: closed_accepted_deterministic_claims_preserved
V1_A_implementation_baseline: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
V1_A_closeout_commit: 78d41add02172ef4c7b290909ff36a1a96cac053
V1_B_contract_created: false
real_model_calls: 0
credential_reads: 0
external_network_calls: 0
source_changes: 0
```

## 1. Observation

While translating the accepted V1 Charter and V1-A baseline into an executable
V1-B Contract, Main Session found that the frozen implementation contains the
deterministic Skill/experiment substrate and a tested provider authority seam,
but not a tracked real V1 execution surface.

Concrete source facts at `784bd1ec06c2aa9ed554a7da661bdf582097bcdf`:

1. `workbench/src/provider/fixed-provider-v1.ts` defines the fixed
   `deepseek-v4-flash` profile, one-use authority, credential/transport
   interfaces, usage projection and `PublicPiHarnessFactoryV1` interface.
2. `createPublicPiCompositionSeamV1()` accepts an injected
   `PublicPiHarnessFactoryV1`; the repository does not contain a tracked V1
   implementation of that factory using public Pi `AgentHarness` and the real
   provider path.
3. `workbench/src/pi/pi-adapter-v1.ts` exposes `runTreatmentProbeV1()`, which
   constructs a Faux provider and reports `external_provider_calls: 0` and
   `cost_usd: 0` by design.
4. The tracked source has no V1 real Pilot runner/orchestrator that executes the
   24 Manifest cells, creates independent Workspaces, terminalizes evidence and
   aggregates real results.
5. `workbench/src/cli.ts` has no V1 Pilot product command.
6. V0-C has reusable real-route and bounded-completion components, but its
   accepted real composition depended on execution-local injected
   dependencies. It is not itself a tracked V1 `PublicPiHarnessFactoryV1` or
   24-cell runner.

No source was modified and no model, credential, network or Provider call was
made while discovering this.

## 2. Binding conflict

The accepted Main Review correction BC-5 states:

> If the V1-B execution Session has no source-edit authority, the fixed
> profile, public Pi handle/provider factory, one-use authority, external
> credential resolution and usage/cost projection must already be implemented,
> deterministically tested and focused-audited in the V1-A Candidate; a future
> interface in the V1-B Contract is insufficient.

The accepted V1 Charter §13.2 also states that the fresh V1-B Execution Session
has no source-edit authority. Therefore the missing factory and Pilot runner
cannot be supplied by that Session through an ignored ad-hoc script without
breaking the tracked-source, reproducibility and pre-outcome-freeze rules.

The formal V1-A Contract narrowed Gate G to a “tracked fixed composition seam”
and its DoD to a tested fixed-provider seam. Main Review and focused audit
verified that narrower seam but did not independently ask whether a concrete
tracked public-Pi factory and executable V1 Pilot runner existed. This is a
control/spec coverage miss discovered before any V1-B Contract or real call.

## 3. Impact

### Preserved conclusions

The following accepted V1-A claims remain supported:

- public emitted Pi Skill consumption under Faux execution;
- exact-one Skill and Windows identity boundaries;
- A/B/C treatment isolation and B/C initial payload equality;
- common Measurement Verifier and C-only bounded intervention semantics in
  deterministic scenarios;
- immutable Manifest/read-only aggregation rejection behavior;
- fixed profile, one-use authority, credential-safe error and usage projection
  seams under fake dependencies;
- zero real-model, credential and network calls.

### Blocked conclusion

The repository is not yet source-frozen for a fresh no-source-edit V1-B real
Pilot Execution Session. Proceeding directly would force one of these invalid
actions:

- write a real factory/runner inside the execution Session;
- rely on ignored execution-local composition code;
- silently reuse V0-C semantics without a V1 adapter and identity binding;
- relax the Charter's no-source-edit rule;
- call a model before the real execution surface is deterministically tested
  and focused-audited.

This blocks V1-B Contract finalization and Activation, but does not require a Pi
patch, SDK/Extension switch, new provider platform or general architecture
rewrite.

## 4. Minimal options

### Option A — recommended: V1-B Stage 1 Preparation within the same Goal

Amend the V1-B Contract design to distinguish two dedicated Session roles:

1. **Stage 1 Preparation Session, zero real calls, bounded source-edit
   authority** — implement only the tracked public Pi factory, V1 Pilot
   orchestrator/product command, frozen evidence/terminalization wiring and
   deterministic tests by adapting accepted V0/V1 components;
2. **Focused audit Session** — audit only provider/secret authority, real-run
   budget/stop/terminalization, Manifest membership and no-result-before-freeze
   boundaries;
3. Main Session freezes a V1-B Execution Baseline;
4. **fresh Stage 2 Execution Session, no source-edit authority** — executes the
   frozen real Pilot after separate user authorization.

This keeps two V1 Goals, avoids reopening accepted deterministic behavior, and
preserves the essential rule that the Session seeing real outcomes cannot edit
source. It requires a narrow accepted-Charter clarification because §13.2
currently describes only one no-source-edit V1-B Execution owner, and it
records a justified deviation from BC-5's original “already in V1-A” placement.

Stage 1 must not add SDK/RPC/Extension, provider registry, retries/fallback,
database/dashboard, generalized eval platform or V2 behavior.

### Option B — strict historical placement: reopen V1-A for one bounded amendment

Temporarily reopen V1-A and return the missing public Pi factory and V1 Pilot
runner to a dedicated bounded correction Session, then create a new Candidate,
perform focused audit and replace the Implementation Baseline before drafting
V1-B.

This adheres literally to BC-5 and leaves V1-B as pure execution, but it makes a
closed Goal mutable and adds another V1-A correction/closeout cycle. The final
technical work and audit scope are nearly the same as Option A, with more
control-history complexity.

### Rejected option — execution-local adapter

Do not let the future V1-B Execution Session create an ignored factory/runner
or directly adapt V0-C after seeing execution conditions. It would undermine
source identity, focused audit and reproducibility.

## 5. Recommendation

Choose **Option A**. The important invariant is not the label “implemented in
V1-A”; it is:

```text
tracked implementation
→ zero-call deterministic verification
→ focused audit
→ exact frozen Execution Baseline
→ fresh no-source-edit real Pilot Session
```

Option A preserves that invariant, keeps V1 to two Goals, and avoids pretending
that an interface is a working real route. The V1-B Contract Draft should not
be written until the user accepts this bounded Charter clarification.

## 6. Current stop point

```yaml
active_goal: null
V1_A: closed_accepted_with_deterministic_claims_preserved
V1_B_contract: not_created
V1_B_activation: not_authorized
V1_B_stage_1_preparation: not_authorized
V1_B_stage_2_real_execution: not_authorized
real_model_calls_authorized: 0
```

Main Session stops here. No control state, accepted Charter, Contract, source,
Pi, reference material or credential boundary is changed by this Pause Report.
