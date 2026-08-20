# V3.7 Goal 3B 64-Request Successor Identity 1 Execution Report

```yaml
status: STRUCTURAL_INVALID_PRIMARY_PASS_BRIDGE_CONTRADICTION
recorded_on: 2026-08-21
execution_identity: v37-g3b-64-request-successor-v1
execution_baseline_commit: 1a542e081420b1c0037a54bbcd641c329cfe70e2
execution_baseline_tree: 5280a9cca668ef7b81376e5f092aea3b31b75f88
workflow_id: v37-g3a-workflow-efa74515-139f-475f-9ecf-94cae05ca01e
bridge_id: v37-g3b-bridge-068639e3-6fe3-4488-8d97-3a1416b1f0c7
product_stage: ready_for_primary
product_receipts: 0
primary_terminal_outcome: initial_pass
primary_external_verifier: passed
credential_reads: 1
network_calls: 56
external_provider_calls: 56
real_model_calls: 56
combined_tokens: 246819
tool_calls: 57
registered_command_calls: 38
cost_usd: 0.0030990008
retry: 0
fallback: 0
replacement: 0
rerun: 0
```

## Result

Gate H passed the exact Git and Docker identities with zero matching leftover
containers. The fresh workflow entered Primary once. The real Agent settled, the frozen
external Verifier passed, and the formal V2 terminal truthfully recorded
`outcome: initial_pass`. No Recovery, Candidate, Regression, follow-up or Assessment
action began.

The accepted bridge nevertheless required exactly three Primary/Recovery attempt
records after every `run_primary`. It faulted because the valid initial-pass route
correctly produced one attempt. The bridge error SHA-256 is
`906ccb09afc6535d42fc54cf8ef2e170f8558482abbaedd22bcc64cf3bc57060`,
which independently matches the fixed bridge error text for the exact-three-attempt
assumption. The bridge therefore emitted no Product receipt and its completed-unit total
remained empty even though the underlying terminal and Verifier are valid.

Narrow deterministic reproduction also confirmed that the Product Inspector treated the
real Case's expected failure trigger as a guaranteed outcome and rejected the same valid
real `initial_pass` terminal. For real execution, this expectation cannot override the
independently inspected terminal; otherwise the Charter's explicit Primary-PASS terminal
route is unreachable.

Safe local reconciliation of the persisted public Pi Session found 56 known-usage
assistant responses, 246,819 combined tokens, 57 Tool calls, 38 registered
`run_command` calls and USD `0.0030990008`. No unknown usage was present. The one-unit
request, token, Tool, wall-time and cost limits were respected. The 38 registered
command executions exposed a second contract mismatch: the bridge declared a command
maximum of one but did not enforce it at the production execution boundary and only
attempted post-unit validation.

This identity is closed and immutable. It is not an honest Case-quality
`closed_incomplete`, because an accepted production bridge failed to represent the
Charter-defined Primary-PASS terminal and did not enforce its declared command ledger.
No raw Provider payload, model text, header, Credential value or environment content was
read into this report.

## Main classification

Both findings block the frozen Goal 3B path and can create false execution accounting,
so they meet the accepted must-fix rule. Under the user's preauthorized versioned
structural-correction route, Identity 1 remains preserved while the smallest correction
is prepared for a new baseline and new identity. The correction is not a retry of this
workflow and cannot reinterpret its evidence.
