# V3.7 Final Closeout

```yaml
status: CLOSED_REJECTED
disposition: REJECT_V3_7_ACCEPTED_BRIDGE_FREEZE_BUDGET_MISMATCH
closed_on: 2026-08-21
goal_1: closed_accepted
goal_2: closed_accepted
goal_3a: closed_accepted
goal_3b: rejected
real_execution_consumed: true
credential_reads: 1
network_calls: 8
external_provider_calls: 8
real_model_calls: 8
cost_usd: 0.0005084352
```

## Outcome

V3.7 Goals 1, 2 and 3A remain accepted on their recorded immutable identities. Goal 3B
does not pass. The single frozen real Case stopped inside Primary after eight successful
DeepSeek responses when the inherited public V2B Attempt cap refused request nine.

The accepted bridge/freeze claimed a 16-request Primary unit while its delegated public
V2B path hard-capped each Attempt at 8. This prevented a verifier-safe Primary terminal
and made the promised full-loop production path unable to stand. Per Charter, the final
V3.7 disposition is `rejected`, not `closed_incomplete` and not an unlucky model result.

## Final evidence

- Execution Baseline: `cad4db45421b239b61cb7b3b3052bc8d4167cd4b` / tree
  `6b80cb326969c4255ea2c0616ff20e2ca5e150dc`.
- Accepted bridge Candidate: `4e86f0ecdaa1edc890ada922cfb4ce4e0b9c2227` / tree
  `820a212aeeeea3a8f094f8d3f81c3aa28fbaed3e`.
- Workflow: `v37-g3a-workflow-6f3a118b-53c5-4e65-9343-0e8ccb8ce4a4`, final stage
  `ready_for_primary`, receipts/completed units `0/0`.
- Observed access: Credential/network/Provider/model `1/8/8/8`.
- Reconciled usage: 12,634 tokens, 10 Tool calls, two `run_command` calls,
  USD `0.0005084352`.
- Retry/fallback/replacement/rerun/reproposal: `0/0/0/0/0`.
- Primary formal terminal/Verifier, Recovery A/B, Candidate, Regression, follow-up,
  Assessment and user unguided WebUI check: not reached.

The bridge's persisted aggregate totals of zero are rejected as inaccurate because real
access occurred before atomic group completion; the Main-recomputed sanitized JSONL
summary above is used for truthful accounting.

## Limits and next state

No V3.7 correction or second real launch is authorized. All ignored execution evidence
must be preserved. Any future attempt to reconcile the public V2B Attempt cap with a
larger outer Primary allowance requires a new explicitly reviewed version/contract and a
new execution identity; it cannot rewrite this consumed V3.7 result.
