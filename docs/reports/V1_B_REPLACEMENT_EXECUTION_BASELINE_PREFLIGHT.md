# V1-B Replacement Execution Baseline Zero-call Preflight

```yaml
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
date: 2026-08-05
candidate_commit: 6a4f6529c4cb2a3e5c726d3bc8cf6beb515b720e
candidate_tree: 7ab79aa4073baab1c7570424701ebf1302b34837
workbench_source_digest: b1fa032d42c4e381c880b8092bddb5a625169ea44ee2e0ea238da1595d0edf92
replacement_manifest: fixtures/manifests/v1/v1b-stage2-replacement-execution.json
replacement_manifest_id: 4f04542ea59b59110e2d9d62e08067932bf868884e05c153cd5a6bed08575b29
replacement_sequence_authority: fixtures/manifests/v1/v1b-stage2-replacement-sequence-authority.json
replacement_sequence_id: c58112fff77b0836a44668395d6ab97ece10996583254c9029c143ab84e01bd1
cells: 24
replacement_cost_cap_usd: 1.90
conservative_prior_debit_usd: 0.10
sequence_started_initial_runs_max: 25
replacement_child_attempts_max: 8
credential_reads: 0
provider_api_calls: 0
real_model_calls: 0
disposition: PASS_REPLACEMENT_ZERO_CALL_EXECUTION_BASELINE_PREFLIGHT
```

## Identity Gate

**Fact.** The replacement Manifest and sequence authority independently validate
against the accepted public Workbench product surface. Manifest ID, sequence
ID and recomputed Workbench digest are byte-equal to the values above. The
Manifest contains exactly 24 new Run IDs with the unchanged four Tasks, two
repetitions and A/B/C order.

**Fact.** Public CLI preflight returned `ready` with next cell
`v1b-replacement-cell-01` and real-call counters `0 / 0 / 0 / 0`. It did not
create the replacement Pilot root or sequence claim journal.

## Current official Provider checkpoint

DeepSeek official documentation checked on 2026-08-05 continues to list:

- model `deepseek-v4-flash`;
- OpenAI-format base URL `https://api.deepseek.com`;
- Chat Completions model/tool/usage support;
- 1M context and 384K maximum output;
- prices per million tokens: USD 0.0028 cache-hit input, USD 0.14 cache-miss
  input and USD 0.28 output.

Primary sources:

- https://api-docs.deepseek.com/quick_start/pricing
- https://api-docs.deepseek.com/api/create-chat-completion
- https://api-docs.deepseek.com/api/list-models

The pinned emitted Pi descriptor reports the same model/base URL/context/output
and prices. The Workbench remains fixed to thinking off, no retry, no fallback
and no alternate model. Documentation retrieval used no DeepSeek credential or
Provider/model API call.

## Commands and results

| Command | Exit | Result |
| --- | ---: | --- |
| direct Manifest identity, source digest and replacement-authority validation | 0 | exact IDs, 24 cells, USD 0.10 + USD 1.90, 25 starts, 8 children |
| tracked CLI `v1b preflight` with Manifest, Pilot root and sequence authority | 0 | ready; first replacement cell; zero counters; no Pilot root created |
| `npm.cmd --prefix workbench run typecheck` | 0 | strict TypeScript passed |
| `node --test workbench/tests/v1b-stage1.test.ts workbench/tests/v1b-cli.test.ts` | 0 | 31/31 passed |
| pinned emitted `deepseekProvider()` descriptor projection | 0 | exact official model/profile/pricing; zero credential/network |

## Credential and dependency boundary

**Fact.** The user-controlled ignored file
`D:/AI/AI_Projects/project2/.env.g005` exists. Main Session checked existence
only and did not read or print its contents. The fresh Stage 2 Session may
resolve only `DEEPSEEK_API_KEY` opaquely after its zero-call Gate and only inside
the exact tracked `run-next` process.

**Fact.** The current Workbench dependency junction points to the existing
local dependency tree and no install/download occurred. A fresh Stage 2
worktree must establish and verify an equivalent local junction before
preflight, without modifying dependencies.

## Disposition

`PASS_REPLACEMENT_ZERO_CALL_EXECUTION_BASELINE_PREFLIGHT`.

No real Pilot, claim journal, credential read, Provider/model call, retry,
fallback, second replacement or V2 action occurred. The next allowed step is
the Main-owned launch Execution Baseline commit followed by an exact-SHA fresh
no-source-edit Stage 2 Prompt.
