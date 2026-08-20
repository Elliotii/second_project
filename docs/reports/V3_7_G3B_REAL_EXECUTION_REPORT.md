# V3.7 Goal 3B Real Execution Report

```yaml
status: REJECTED_ACCEPTED_BRIDGE_FREEZE_BUDGET_MISMATCH
recorded_on: 2026-08-21
execution_baseline_commit: cad4db45421b239b61cb7b3b3052bc8d4167cd4b
execution_baseline_tree: 6b80cb326969c4255ea2c0616ff20e2ca5e150dc
workflow_id: v37-g3a-workflow-6f3a118b-53c5-4e65-9343-0e8ccb8ce4a4
stage: ready_for_primary
receipt_count: 0
completed_units: 0
credential_reads: 1
network_calls: 8
external_provider_calls: 8
real_model_calls: 8
combined_tokens: 12634
tool_calls: 10
run_command_calls: 2
cost_usd: 0.0005084352
retry: 0
fallback: 0
replacement: 0
rerun: 0
candidate_reproposal: 0
```

## Result

Gate H passed the frozen Git, Docker Desktop `4.85.0 (235549)`, client/server
`29.6.2`, `desktop-linux`, Linux/amd64, pinned local image and exact leftover-container
checks. The frozen driver then launched exactly once.

The driver created one workflow and entered only Primary. After eight successful
DeepSeek responses, the public V2B port refused request nine at its inherited
`provider_requests: 8` pre-dispatch hard stop. It therefore produced no verifier-safe
Primary terminal, Product receipt or completed bridge unit.

The frozen bridge allowed 16 Primary requests but delegated to that 8-request public
Attempt. Main classifies this as an accepted bridge/freeze mismatch. Under Charter
Section 8.4 the disposition is `rejected`, not an honest Case `closed_incomplete`.

The bridge result projected aggregate totals as zero because its atomic group faulted
before unit completion. That projection is not accepted as usage accounting. Safe Main
reconciliation from the persisted Primary JSONL found eight successful Provider
responses plus one synthetic error message, 12,634 combined tokens, 10 Tool calls, two
`run_command` calls and USD `0.0005084352`. Independent bridge counters recorded
Credential/network/Provider/model `1/8/8/8`.

The bridge failure SHA-256 is
`0cb05953f1d6456c1c3876610ae9b0f726d16ab8d22691c61a28377be8caa72d`;
the inner pre-dispatch-stop SHA-256 is
`1d31dfdcd95abcb904a787d6ad2c9209b9f1b3165b7b43469293620ba874442f`.
No secret, raw Provider payload or model text is reproduced here.

The one-shot execution is consumed. Recovery A/B, Candidate, Regression, follow-up,
Assessment and user WebUI check were not reached. No retry, fallback, replacement,
rerun, Candidate reproposal or source/configuration change occurred.
