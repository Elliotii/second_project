# V3.7 Goal 3B Execution-Prompt Preparation Hard Stop

```yaml
status: HARD_STOP_G3B_PREEXEC_P1_001
recorded_on: 2026-08-21
configuration_candidate_commit: f30914378dc90390afce7240b9755d7d24da0850
configuration_candidate_tree: 667504572064c00fa170ac5952d8ef0af4a595ad
configuration_audit: PASS_V3_7_G3B_CONFIGURATION_FREEZE_FOCUSED_AUDIT
execution_prompt_created: false
real_access_authorized: false
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## Finding

`G3B-PREEXEC-P1-001`: the repository has no Host-owned real composition for all four
execution ports required by `ProductServiceV37G3A`. Therefore Main cannot truthfully
freeze a no-source-edit Execution Prompt that launches the real Case through the accepted
Goal 3A production path.

The zero-access configuration Candidate itself passed independent focused audit and is
preserved unchanged. This finding is at the next construction/launch control point, not a
configuration-digest failure.

## Local evidence

- `workbench/src/v37/product-service-v37g3a.ts::requireRealAuthority` requires exact
  Primary, Candidate-proposal, Regression-validation and follow-up Runtime ports plus the
  exact authorization tuple before the real Case is available.
- `DEFAULT_CASE_PORTS` contains only the two deterministic Goal 3A Cases. The Candidate,
  Regression and follow-up implementations in that module are deterministic.
- `workbench/src/pi/pi-run-handle-v2b.ts::createRealExecutionPortV2B` is a reusable real
  `ExecutionPortV2` seam for the Primary V2 substrate only.
- Repository search found interfaces and deterministic implementations for
  `BoundedProposalPortV3`, `FauxValidationPortV3` and
  `RegisteredFollowUpRuntimePortV37G3A`, but no Host-owned real adapter or launch
  composition for those three ports.
- The focused configuration test proves the registered real Case loads but remains
  `available_for_new_workflow: false` and rejects workflow creation before identity,
  Journal, binding, Run or receipt creation.

An inline test or ad-hoc `.runs` script could fabricate these ports, but that would be a
demo/test-only success path rather than the frozen production path prohibited by Charter
Section 4. It would also make the supposedly no-source-edit execution Session define
construction authority instead of merely consuming it.

## Severity and scope test

**Fact:** this blocks the sole Goal 3B demonstration path and would make the core claim
"one frozen real Case traverses the accepted production path" false. It therefore meets
the accepted must-fix criteria. It is not an optional cleanup.

**Fact:** no existing deterministic Goal 3A behavior is broken. Goal 3B remains safely
fail-closed, so there is no data corruption or accidental external dispatch.

## Recommended bounded resolution

Authorize one pre-execution, zero-real-access Host execution-port bridge Amendment:

1. freeze an exact source/test/report allowlist before implementation;
2. compose the existing public real Primary seam and existing accepted production APIs
   into all four Host-owned ports without Pi changes or new product semantics;
3. add one Host-owned no-source-edit launch surface that consumes, but cannot invent, the
   frozen authorization tuple;
4. use only deterministic fake ports to prove construction, one-use budget/counter
   wiring, fail-before-dispatch negatives and terminal cleanup;
5. prohibit Credential reads, external network, Provider/model calls and Docker product
   execution during implementation and audit;
6. freeze an immutable Candidate and obtain a fresh focused independent audit;
7. only then create the exact Goal 3B Execution Prompt and return for separate real-access
   authorization.

If existing accepted APIs cannot support this bridge without new workflow semantics,
strict Provider/Docker attestation, Pi changes or a demo-only runner, the Amendment must
Hard Stop instead of expanding scope.

## Decision required

Recommended decision:

`AUTHORIZE_BOUNDED_ZERO_ACCESS_G3B_HOST_EXECUTION_PORT_BRIDGE_AMENDMENT`

Until that decision, the configuration Candidate remains provisional, the Execution
Prompt is not frozen, and Goal 3B real access/execution remain unauthorized.
