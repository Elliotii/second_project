# V1-B Replacement Stage 2 Execution Session Start Prompt

You are the fresh, dedicated, no-source-edit V1-B replacement Stage 2
Execution Session for the Agent Harness Reliability Workbench.

## 1. Exact authority and identity

```yaml
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
replacement_execution_baseline_commit: f7cf45150724061269179716e1b2f487db1ff5c7
replacement_execution_baseline_tree: 4fe46f3955b069f52dd5f581d794b860ef159b4e
audited_source_candidate_commit: 6a4f6529c4cb2a3e5c726d3bc8cf6beb515b720e
audited_source_candidate_tree: 7ab79aa4073baab1c7570424701ebf1302b34837
workbench_source_digest: b1fa032d42c4e381c880b8092bddb5a625169ea44ee2e0ea238da1595d0edf92
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
replacement_manifest: fixtures/manifests/v1/v1b-stage2-replacement-execution.json
replacement_manifest_id: 4f04542ea59b59110e2d9d62e08067932bf868884e05c153cd5a6bed08575b29
replacement_sequence_authority: fixtures/manifests/v1/v1b-stage2-replacement-sequence-authority.json
replacement_sequence_authority_id: c58112fff77b0836a44668395d6ab97ece10996583254c9029c143ab84e01bd1
pilot_root: .runs/v1-b/stage2-replacement/pilot
predecessor_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
predecessor_paused_run: v1b-run-01-parse-duration-r1-a
predecessor_started_initial_runs: 1
conservative_prior_debit_usd: 0.10
replacement_initial_cells: 24
authorized_sequence_started_initial_runs_max: 25
replacement_child_attempts_max: 8
replacement_actual_cost_usd_max: 1.90
credential_profile: DEEPSEEK_API_KEY
network_scope: api.deepseek.com tracked Pi provider route only
source_edit_authorized: false
fixture_or_manifest_edit_authorized: false
git_stage_or_commit_authorized: false
retry_same_run_authorized: false
fallback_authorized: false
second_replacement_authorized: false
further_correction_authorized: false
v2_authorized: false
```

The user has already authorized this exact replacement Stage 2 envelope. Do
not request routine per-cell approval. Authority ends at valid V1-B
execution/reporting or the first Contract/Amendment automatic-exit condition.

## 2. Required read order

Read completely before commands:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md`;
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
5. `docs/第二项目_Codex交接包_2026-07-30/V1_B_GOAL_CONTRACT.md`;
6. `docs/第二项目_Codex交接包_2026-07-30/V1_B_PAUSE_RECOVERY_AMENDMENT.md`;
7. `docs/reports/V1_B_STAGE2_MAIN_PAUSE_REVIEW.md`;
8. `docs/reports/V1_B_P1_004_MAIN_ACCEPTANCE_AND_REPLACEMENT_BASELINE_DECISION.md`;
9. `docs/reports/V1_B_P1_004_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md`;
10. `docs/reports/V1_B_REPLACEMENT_EXECUTION_BASELINE_PREFLIGHT.md`;
11. `docs/reports/V1_B_STAGE2_PROVIDER_CHECKPOINT.md`;
12. both frozen replacement JSON files and the tracked V1-B product surface
    needed to execute Gates K-O.

Do not redo Stage 1, reopen audit findings or turn execution into a new source
audit/research task.

## 3. Gate K - exact fresh baseline and local dependencies (zero calls)

Before credential resolution:

1. prove exact HEAD/tree above and tracked/staged clean;
2. prove the replacement Manifest ID, sequence-authority ID, 24 new cells,
   source Candidate/digest, predecessor identity, USD 0.10 prior debit, USD
   1.90 replacement cap, 25 total-start cap and eight-child cap are exact;
3. prove root pinned Pi at `D:/AI/AI_Projects/project2/.upstream/pi` is the exact
   commit above and clean;
4. record initial `reference/` state without modifying it;
5. use only pre-existing local dependencies; do not install or download.

A fresh Codex worktree may lack ignored dependencies. If necessary, create
only ignored directory Junctions after resolving and validating their absolute
targets:

- `<fresh-worktree>/workbench/node_modules` ->
  `D:/AI/AI_Projects/project2/workbench/node_modules`;
- `<fresh-worktree>/.runs/v0-a/pi` ->
  `D:/AI/AI_Projects/project2/.runs/v0-a/pi`.

Do not delete or overwrite an existing path. If it exists with an unexpected
type or target, pause. Run strict TypeScript, the narrow current V1-B suite and
the exact replacement preflight. All credential/network/Provider/model counters
must remain zero, and preflight must not create the replacement Pilot root.

## 4. Gate L - current official Provider checkpoint (zero calls)

Confirm that the tracked checkpoint remains current using only official
DeepSeek documentation and the pinned emitted Pi descriptor. Required values:

- model `deepseek-v4-flash`;
- base URL `https://api.deepseek.com` and tracked chat-completions route;
- tool calls and the frozen non-thinking mode remain available;
- usage fields and current prices remain sufficient for fail-closed accounting;
- no fallback, retry or alternate model.

The Main baseline report records the 2026-08-05 checkpoint. If current official
facts differ or cannot be verified, stop before credential resolution.

## 5. Gate M - opaque credential boundary

Credential source is the ignored user-controlled file:

`D:/AI/AI_Projects/project2/.env.g005`

Read only the single `DEEPSEEK_API_KEY` value opaquely into the environment of
each bounded `run-next` process. Never print, echo, hash, measure, serialize,
include it in command text, persist it in reports or expose it through an
environment dump. Fail closed if the exact key is absent, empty, duplicated or
malformed. Remove it from the parent process environment after each bounded
CLI process. No other credential is authorized. Do not run a live credential
probe outside the tracked replacement Pilot path.

## 6. Gate N - immutable one-cell replacement loop

Use only this exact tracked command surface:

```text
node workbench/src/cli.ts v1b run-next
  --manifest fixtures/manifests/v1/v1b-stage2-replacement-execution.json
  --pilot-root .runs/v1-b/stage2-replacement/pilot
  --replacement-sequence-state fixtures/manifests/v1/v1b-stage2-replacement-sequence-authority.json
  --stage2-real-authority
```

Run exactly one process and one cell at a time. After every invocation:

1. record the command intent, exit code, returned Run ID and sanitized counters;
2. run tracked read-only `v1b inspect` for that planned Run;
3. inspect the replacement sequence authority and append-only ledger/terminal
   evidence;
4. reconcile membership, identity, Attempt/child lineage, request/tool/token/
   time/cost and prior-debit accounting;
5. prove cumulative replacement actual cost plus the next required reserve
   cannot exceed USD 1.90 and the authorized sequence cannot exceed 25 initial
   starts;
6. prove no fallback, same-Run retry, second replacement, cell skip, overwrite
   or deletion occurred;
7. only then start the unique next planned cell.

A task failure is an observed terminal result, not authority to retry. A C-arm
child may occur only through the frozen eligibility and budget policy. Do not
manually force, suppress or repeat Recovery. Do not run cells concurrently or
change task, Skill, System Prompt, Tool, Verifier, model/profile, Manifest,
budget, taxonomy or order after observing a result.

## 7. Automatic exit conditions

Stop immediately, preserve all evidence and do not launch another cell if:

- exact baseline, source digest, Manifest or sequence identity disagrees;
- architecture/Contract/allowlist expansion or any source repair is required;
- a P0 or non-local P1 is observed;
- any frozen source defect appears; there is no fourth correction authority;
- DeepSeek descriptor/pricing/usage drift or cannot be verified;
- credential is missing/invalid and needs user intervention;
- the next reserve could exceed USD 1.90 replacement actual-cost cap;
- the original-plus-replacement sequence could exceed 25 initial starts or
  replacement children could exceed eight;
- the same infrastructure/evidence cause occurs a second time;
- infrastructure/evidence invalid reaches 25%;
- retry, fallback, second replacement, model/task/fixture change is needed;
- secret, reasoning or protected-path scanning fails;
- Manifest, sequence authority, ledger, terminal evidence and Inspector
  disagree;
- any per-Attempt, per-Run or Pilot request/tool/token/time/cost cap is reached
  or would be exceeded;
- any formal Contract or Pause Recovery Amendment Pause Condition applies;
- continuation would enter V2/V3.

On exit, create `docs/reports/V1_B_REPLACEMENT_STAGE2_PAUSE_REPORT.md` containing
only observed state, ledger/terminal position, conservative plus actual cost,
evidence paths and the smallest Main Session decision needed. Do not repair
source and do not overwrite any original Pilot report or evidence.

## 8. Gate O and required deliverables

If all 24 replacement initial cells reach valid terminal evidence, or a
Contract-valid global budget stop is reached, run tracked Inspector for every
executed replacement Run and the tracked read-only aggregate. Independently
recompute membership, Attempt/child lineage, requests, tools, tokens, active
time, replacement actual cost, USD 0.10 predecessor debit, invalid attribution,
denominators, fairness bindings, Recovery eligibility/start/success and
secret/reasoning scans.

Create only:

- `docs/reports/V1_B_REPLACEMENT_PILOT_EXECUTION_REPORT.md`;
- `docs/reports/V1_B_REPLACEMENT_AGGREGATE_REPORT.md`;
- `docs/reports/V1_B_REPLACEMENT_CLOSEOUT_DRAFT.md`;
- ignored `.runs/v1-b/stage2-replacement/pilot/` evidence and its Evidence
  Index.

These replacement reports must include exact commands and exit codes, launch
baseline SHA/tree, source Candidate/digest, Manifest/sequence IDs, every
Run/Attempt/Session/Workspace link, model/profile identity, actual usage/cost,
the USD 0.10 conservative predecessor debit, invalid/exclusion accounting,
natural Recovery facts, source delta, unverified claims and a structured
`CURRENT_STATE_UPDATE_PROPOSAL`.

The original Stage 2 Pilot, Manifest, evidence and its three pause reports are
immutable. Do not overwrite them. Allowed tracked edits are only the three
replacement reports above, or the single replacement Pause Report if stopped.
Do not edit/stage `CURRENT_STATE.md`, Contract/Charter/09/ADR, source, tests,
fixtures, either Manifest/authority JSON, Pi or reference. Do not commit.

## 9. Claims and stop point

Report descriptive observations only. Do not claim statistical significance,
general Skill superiority, general Runtime superiority or general real-Recovery
effect. If Recovery occurs, claim only the directly observed bounded case. A
Pilot with no natural Recovery remains valid when every Contract gate is
satisfied; report Recovery as unobserved.

When the reports are complete, stop and return the disposition to Main Session.
Main Session alone accepts V1-B/V1, updates control state and creates the
already-authorized closeout commit. Do not enter V2.
