# V3.7 Goal 3B Host Bridge Exceptional Template-Prompt Correction Amendment

```yaml
status: ACCEPTED_BY_USER_2026_08_21
decision: AUTHORIZE_V3_7_G3B_HOST_BRIDGE_EXCEPTIONAL_TEMPLATE_PROMPT_CORRECTION
finding: G3B-HOST-BRIDGE-MAIN-P1-002
implementation_owner: /root/v37_g3b_host_port_bridge_implementation
real_access: false
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
exceptional_correction_capacity: 1
```

## Purpose and boundary

Close only the production-prompt sufficiency gap identified after ordinary Correction 1.
The Host bridge must give the model the exact non-secret registered prompt-addendum
template that the existing V3.7 Candidate validator already requires.

The correction may change only:

1. `workbench/src/v37/real-execution-ports-v37g3b.ts`;
2. `workbench/tests/v37g3b-real-execution-ports.test.ts`;
3. `docs/reports/V3_7_G3B_HOST_EXECUTION_PORT_BRIDGE_IMPLEMENTATION_REPORT.md`.

It must:

- obtain the single registered template from the already Host-loaded real Manifest;
- require its exact frozen ID, content and SHA-256 identity before bridge construction;
- include that exact template ID/content in the Candidate model prompt, while preserving
  the frozen opportunity and expected Base-State input;
- keep the existing producer byte boundary and `validateProposalAndBuildCandidateV3`
  check before bridge completion;
- make the positive test derive its proposal from the template actually present in the
  captured model request and assert exact ID/content, rather than succeeding from an
  independent hard-coded response constant.

No new Candidate contract, prompt template, model discretion, configuration change,
budget change, state transition or retry is authorized. Every daily-24, construction,
one-use, order, lifecycle and zero-access invariant remains unchanged.

Run only the bridge focused test, directly affected authority test, strict TypeScript and
allowlist/diff/immutable checks. Create one new Candidate without amending either prior
Candidate. Hard Stop if any additional file or product contract is required. Audit and
real execution remain locked.
