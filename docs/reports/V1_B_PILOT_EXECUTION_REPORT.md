# V1-B Pilot Execution Report — Bounded Pause

```yaml
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
session_role: fresh_no_source_edit_stage_2_execution
goal_execution_disposition: PAUSE_V1_B_PILOT
policy_recommendation: INCONCLUSIVE
execution_baseline_commit: 19617319c13a9eecbb325682c920e79d1517b89d
execution_baseline_tree: 48d2bee79a551fe53ac36ed12decea2357765645
audited_source_candidate_commit: a11690e5827d9d540b731156799566bea21c689e
manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
workbench_source_digest: ef30c4be9bc4143569f30aabbb66b2a01db9b2098082f35dba2137f3acb22ffe
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
planned_cells: 24
started_cells: 1
terminal_cells: 0
invalid_cells: 0
paused_cells: 1
later_cells_started: 0
source_delta: 0
git_stage_or_commit: 0
```

## Disposition

**Fact.** Gates K and L passed. Gate M validated exactly one nonempty
`DEEPSEEK_API_KEY` entry opaquely, placed it only in the bounded CLI process
environment and removed it afterward. The credential value, length, hash,
prefix and suffix were not printed or persisted.

**Fact.** The first and only `run-next` invocation exited 1 with sanitized
`FixedProviderBoundaryErrorV1B`. The append-only ledger records cell 1 as
`planned -> started -> paused` with cause `paused_unclassified`. Cells 2–24
remain planned. No retry, fallback, replacement, cell skip, overwrite or
deletion occurred.

**Fact.** The Run journal ends after `run_started`, `workspace_materialized`
and `attempt_started`. There is no terminal marker, `terminal-evidence.json`,
RunResult, Provider response record or persisted usage/cost record. The tracked
Inspector therefore returns `integrity_valid: false` with
`Inspector ledger transition is not planned->started->terminal|invalid`.

**Fact.** Because the error path sanitizes the underlying failure and does not
persist the in-memory call counters, reservations or usage before pausing, this
Session cannot prove whether HTTP dispatch occurred, distinguish credential,
Provider, network or response-schema failure, or determine actual token/cost
consumption. Actual cost is therefore `unknown`, not zero.

**Inference.** The approximately 11.5-second started interval is consistent
with a live request path, but the frozen evidence does not establish that fact.
It is not used for accounting or attribution.

The Contract requires a stop when usage/cost cannot be reconciled, when a
paused state applies, or when a frozen source/evidence defect appears. No
second cell was launched.

## Gate K — zero-call frozen identity

- HEAD/tree matched the Execution Baseline exactly.
- Tracked worktree and index were clean; `reference/` was unchanged.
- Root Pi was exact and clean.
- Missing ignored dependencies were resolved only with validated directory
  junctions to the pre-existing local roots; no dependency was installed or
  downloaded.
- Manifest validation produced 24 unique cells and Run IDs, audited source
  commit, exact recomputed Workbench source digest, Pi identity, USD 2 Pilot
  cap, eight-child cap and no fallback/retry/replacement policy.
- Strict TypeScript passed.
- Focused V1-B tests passed 19/19.
- Dry preflight returned `ready`, next cell `v1b-cell-01`, and zero
  credential/network/provider/model counters.

## Gate L — official Provider checkpoint

The official current DeepSeek documentation still lists
`deepseek-v4-flash`, OpenAI base URL `https://api.deepseek.com`, the
`/chat/completions` route, Tool Calls, non-thinking mode, required usage fields
and the frozen cache-hit/cache-miss/output prices. No current descriptor or
pricing drift required a model change, fallback or retry. The documented
future peak/off-peak policy was announced but not yet effective at execution
time.

Official sources checked on 2026-08-05 Asia/Hong_Kong:

- https://api-docs.deepseek.com/quick_start/pricing/
- https://api-docs.deepseek.com/api/create-chat-completion/

## Commands and exit codes

| Command | Exit | Result |
| --- | ---: | --- |
| Git HEAD/tree/status, Manifest file hash, root Pi HEAD/status and dependency-target validation | 0 | exact/clean; targets resolved |
| create two ignored validated directory junctions | 0 | local dependency resolution only |
| `node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | 0 | strict TypeScript passed |
| `node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts` | 0 | 19/19 passed |
| `node workbench/src/cli.ts v1b preflight --manifest fixtures/manifests/v1/v1b-stage2-execution.json --pilot-root .runs/v1-b/stage2/preflight-only` | 0 | ready; all counters zero |
| direct `validateExecutionManifestV1B` and `v1bSourceDigest` recomputation | 0 | identities/caps exact |
| opaque credential validation plus tracked `v1b run-next ... --stage2-real-authority` | 1 | sanitized fixed-provider failure; cell 1 paused |
| `node workbench/src/cli.ts v1b inspect --pilot-root .runs/v1-b/stage2/pilot --run v1b-run-01-parse-duration-r1-a` | 1 | expected nonterminal paused state; no terminal evidence |
| persisted forbidden-marker scan | 0 | 10 files, 0 matches |

## Evidence

- Pilot root: `.runs/v1-b/stage2/pilot/`
- Ledger: `.runs/v1-b/stage2/pilot/ledger.jsonl`
- First Run journal:
  `.runs/v1-b/stage2/pilot/runs/v1b-run-01-parse-duration-r1-a/journal.jsonl`
- Evidence Index: `.runs/v1-b/stage2/EVIDENCE_INDEX.md`

## Unverified

- credential validity at the Provider;
- whether a real HTTP/Provider/model dispatch occurred;
- the underlying sanitized Provider failure;
- token usage and actual USD cost;
- any terminal task Outcome, arm comparison or natural Recovery;
- Gates N completion and O reconciliation.

## Smallest Main Session decision needed

Main Session should classify the paused evidence gap and decide whether to
authorize a bounded source correction and focused re-audit that persist
pre-dispatch counters/reservations and sanitized typed failure attribution on
the pause path. Any replacement Pilot or Run requires explicit new authority
and identity; the present cell must not be retried or overwritten. This
Execution Session must not perform the repair.
