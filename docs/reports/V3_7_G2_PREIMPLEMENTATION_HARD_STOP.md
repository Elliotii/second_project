# V3.7 Goal 2 Preimplementation Hard Stop

```yaml
status: DECISION_REQUIRED
disposition: HARD_STOP_V3_7_G2_EXECUTION_PROFILE_AUTHORITY_GAP
goal: V3_7_G2_RUNTIME_EFFECTIVE_STATE_FOLLOW_UP_BRIDGE
goal_1_status: closed_accepted_unchanged
goal_2_implementation_started: false
goal_2_source_delta: 0
goal_2_test_delta: 0
real_access: credentials_0_network_0_provider_0_model_0
```

## Fact

The accepted workflow registration inherits exactly one execution identity tuple from
the immutable Manifest. Its current profile bodies were frozen for the Goal 1/V2
recovery episode:

- the Provider profile identifies the V2 faux provider;
- the tool profile identifies the V2 bounded-tool profile;
- the command profile registers `public_test`, not the frozen follow-up Verifier command;
- the budget profile freezes Candidate paths, Provider dispatches, Tool calls, Verifier
  runs and zero real cost, but does not freeze combined-token, command, Verifier timeout,
  Verifier output or wall-time limits required by Charter Section 6.5.

Goal 2 must inherit the registered tuple without caller override and must record equality
between the frozen execution contract, binding, runtime observation and Evidence. The
missing values cannot be derived uniquely from the existing profile digest.

## Conflict

Editing the accepted Manifest body in place would change its digest, Registration
Envelope, registry trust root and workflow registration digest. Creating a new Manifest
version would require a new workflow and would not continue the accepted Goal 1
workflow/Candidate lineage. Supplying the missing values only through chat, a caller,
test fixtures or unfingerprinted constants would create unregistered Runtime Authority.

Those alternatives conflict with Charter Sections 4.1–4.5, 6.3 and 6.5 and trigger the
Section 3.8 Hard Stops for caller-conferred Authority or post-dispatch budget change.

## Recommendation

Adopt one narrow pre-Goal-2 structural amendment: add one immutable Host-registered
follow-up execution-profile record bound to the existing Manifest digest, workflow
registration digest and original execution tuple. It would freeze the complete Goal 2
Provider/tool/command/budget/stop bodies and digests, be loaded from the same fixed Host
trust root, and be included explicitly in the Goal 2 binding, runtime observation and
Evidence. It must not change Task, Source, Verifier, Candidate, State scope, Goal 1
artifacts or old V3.6/G2 behavior, and it must not become a general enrollment API.

This amendment is worthwhile because Goal 2's core claim is runtime-effective identity
continuity. Proceeding without an authoritative complete execution profile would make
the central binding claim unprovable, while the proposed correction is bounded to one
Host-owned record, its loader/contract fields and focused tests.

## Required decision

Main cannot silently create this new authority-bearing record under the accepted
Charter. User approval of the narrow amendment is required before the Goal 2
Implementation Prompt can be frozen or its dedicated implementation Session dispatched.
