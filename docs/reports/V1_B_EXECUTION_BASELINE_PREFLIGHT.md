# V1-B Execution Baseline Zero-call Preflight

```yaml
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
date: 2026-08-05
candidate_commit: a11690e5827d9d540b731156799566bea21c689e
candidate_tree: 282c4dc93d31131fa0b20fc70c48831409664eee
stage2_manifest: fixtures/manifests/v1/v1b-stage2-execution.json
stage2_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
manifest_audited_source_commit: a11690e5827d9d540b731156799566bea21c689e
workbench_source_digest: ef30c4be9bc4143569f30aabbb66b2a01db9b2098082f35dba2137f3acb22ffe
cells: 24
whole_pilot_cost_usd_max: 2
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
disposition: PASS_ZERO_CALL_EXECUTION_BASELINE_PREFLIGHT
```

## Identity and source delta

**Fact.** The Stage 2 Manifest validates as `stage2_real`, has 24 immutable
cells, `real_execution_authorized: true`, a USD 2 Pilot cap and exact Workbench
source digest
`ef30c4be9bc4143569f30aabbb66b2a01db9b2098082f35dba2137f3acb22ffe`.
The recomputed source digest is byte-equal.

**Fact.** `git diff --name-only a11690e5827d9d540b731156799566bea21c689e
-- workbench/src workbench/tests workbench/package.json workbench/README.md`
returned no path. Candidate-to-baseline materialization therefore changes no
audited source, test, package or Workbench README byte.

## Commands and results

| Command | Working directory | Exit | Result |
| --- | --- | ---: | --- |
| `node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | `workbench/` | 0 | strict TypeScript passed |
| `node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts` | `workbench/` | 0 | 19/19 passed |
| `node workbench/src/cli.ts v1b preflight --manifest fixtures/manifests/v1/v1b-stage2-execution.json --pilot-root .runs/v1-b/stage2/preflight-only` | project root | 0 | ready; next cell `v1b-cell-01`; all real-call counters zero |
| direct `validateExecutionManifestV1B` plus `v1bSourceDigest` recomputation | project root | 0 | Manifest ID/source digest/mode/24 cells/USD2 cap exact |
| pinned emitted `deepseekProvider()` descriptor projection | `workbench/` | 0 | exact current model/base URL/prices/context/output descriptor; no credential or network |

## Credential and dependency preconditions

**Fact.** The user-controlled ignored file
`D:/AI/AI_Projects/project2/.env.g005` exists and its parsed key names include
`DEEPSEEK_API_KEY`. Main Session did not print, serialize or record the value.
The fresh Stage 2 Session must resolve it opaquely only after Gate K–M and only
inside each bounded CLI process.

**Fact.** The corrected Preparation worktree uses an ignored Workbench
`node_modules` junction targeting the main project's pre-existing
`workbench/node_modules`, and its ignored `.runs/v0-a/pi` dependency checkout is
present. A fresh Stage 2 worktree must establish an equivalent local,
non-downloading dependency resolution before preflight. This setup is not a
source change and must be verified before any credential resolution.

## Disposition

`PASS_ZERO_CALL_EXECUTION_BASELINE_PREFLIGHT`.

The next allowed actions are the Main Session's exact Execution Baseline commit
and Stage 2 launch prompt, followed by a fresh no-source-edit Execution Session.
No real call has occurred at this point.
