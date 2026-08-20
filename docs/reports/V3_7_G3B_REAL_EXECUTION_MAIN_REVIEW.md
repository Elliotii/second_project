# V3.7 Goal 3B Real Execution Main Review

```yaml
status: REJECTED_ACCEPTED_BRIDGE_FREEZE_BUDGET_MISMATCH
reviewed_on: 2026-08-21
execution_baseline_commit: cad4db45421b239b61cb7b3b3052bc8d4167cd4b
execution_baseline_tree: 6b80cb326969c4255ea2c0616ff20e2ca5e150dc
workflow_id: v37-g3a-workflow-6f3a118b-53c5-4e65-9343-0e8ccb8ce4a4
stage: ready_for_primary
credential_reads: 1
network_calls: 8
external_provider_calls: 8
real_model_calls: 8
cost_usd: 0.0005084352
```

## Main disposition

**Fact:** Main independently confirms that the one-shot driver launched exactly once,
created one workflow and entered only the Primary group. It produced no Product receipt,
no completed bridge unit, no formal Primary terminal and no external Verifier result.
Recovery, Candidate, Regression, follow-up and Assessment never started.

**Fact:** Eight successful Provider responses were persisted before the ninth request was
refused by the public V2B pre-dispatch boundary. The frozen bridge advertises a 16-request
Primary unit, but `V2B_ATTEMPT_CAPS.provider_requests` is 8. This is an accepted
bridge/freeze contradiction, not an honest Case-quality negative. Charter Section 8.4
therefore requires `rejected`.

**Fact:** Main recomputed the safe Primary JSONL summary without emitting model text or
raw payloads: 8 successful Provider responses plus one synthetic error message, 12,634
combined tokens, 10 Tool calls, two `run_command` calls and USD `0.0005084352`.
Bridge real-access counters independently report `1/8/8/8`.

**Fact:** The persisted bridge result incorrectly projects aggregate usage as zero
because the atomic Primary/Recovery group faulted before unit completion. The actual
usage above is authoritative for closeout. The bridge failure SHA-256
`0cb05953f1d6456c1c3876610ae9b0f726d16ab8d22691c61a28377be8caa72d`
matches the local terminal error. The inner pre-dispatch-stop SHA-256 is
`1d31dfdcd95abcb904a787d6ad2c9209b9f1b3165b7b43469293620ba874442f`.

The one-shot execution is consumed. No retry, replacement, rerun, Candidate reproposal,
WebUI check or repair is authorized. The tracked source/configuration baseline remains
unchanged.
