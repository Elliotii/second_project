# V3.7 Goal 3B 64-Request Successor Identity 2 Execution Report

> Status: `CLOSED_INCOMPLETE_EXECUTION_INVALIDITY`.

```yaml
execution_identity: v37-g3b-64-request-successor-v2
execution_baseline_commit: c778c20e377fdbb323ec9be0166c2de79d5062e0
execution_baseline_tree: 82dabd6d1f7b3ab07c773fdf1d97fafe27f9e298
workflow_id: v37-g3a-workflow-e79fbbed-119e-444f-a973-13efb0a64dbc
bridge_id: v37-g3b-bridge-04e353e7-d846-4e40-bd54-82fd8850ed1e
final_product_stage: ready_for_primary
final_bridge_state: closed
disposition: closed_incomplete_execution_invalidity
```

Gate H passed the exact commit/tree, corrected-Candidate ancestry, Prompt Git blob and
Git-byte SHA-256, six frozen configuration/source blobs, Docker Desktop/client/server and
local pinned image identities, and zero `v36g2-*` leftovers. One initial mechanical
launch used the wrong worktree-relative loader path and stopped before module evaluation,
bridge construction, workflow creation, Credential resolution or any Provider dispatch.
The allowed zero-boundary launch correction reused the same driver with the existing
`workbench/scripts/v35g2-public-pi-loader.mjs`; it did not create a replacement identity.

Identity 2 then created exactly one fresh workflow and invoked `run_primary` once. The
Primary runtime ended with an assistant `error` response after 38 reserved/dispatched
Provider requests. The V2 fail-closed reconciliation rejected the terminal with error
SHA-256 `5eafbdc657dcc8141d4adfa96d215550135203f56b91f276fffb9655e92a2e82`, which maps to the
fixed `workbench/src/run-v2.ts` raw-Session/runtime-observation disagreement check. No
Primary receipt or Verifier result was manufactured, and Recovery, Candidate, Regression,
follow-up and Assessment never started.

```yaml
credential_reads: 1
network_calls: 38
external_provider_calls: 38
real_model_calls: 38
provider_request_reservations: 38
non_error_assistant_responses: 37
combined_tokens: 143469
tool_calls: 42
registered_command_calls: 23
wall_time_ms: 77341
cost_usd: 0.0023561384
unknown_usage: false
retry: 0
fallback: 0
replacement: 0
same_identity_rerun: 0
```

The final error response carried zero token usage. The bridge conservatively retained the
38th request charge/counter while the public Session ledger exposed 37 non-error Provider
responses. This is execution invalidity, not task success or a registered verifier
problem. `V3_7_CHARTER.md` Section 8.4 requires `closed_incomplete` for this route; a new
identity solely to seek a different real result would violate the no-result-hunting rule.

Identity 1 plus Identity 2 cumulative cost is USD `0.0054551392`, below the USD `10.00`
campaign hard cap. No tracked source/configuration changed and no test was warranted.
The ignored Identity 2 evidence remains in the isolated exact-baseline worktree. Full
Recovery-through-Assessment behavior remains unobserved, and the user's unguided WebUI
check remains pending.
