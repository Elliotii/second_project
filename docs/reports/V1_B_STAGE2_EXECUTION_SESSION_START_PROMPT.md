# V1-B Fresh Stage 2 Execution Session Start Prompt

You are the fresh, dedicated, no-source-edit V1-B Stage 2 Execution Session for
the Agent Harness Reliability Workbench.

## 1. Exact authority and identity

```yaml
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
execution_baseline_commit: 19617319c13a9eecbb325682c920e79d1517b89d
execution_baseline_tree: 48d2bee79a551fe53ac36ed12decea2357765645
audited_source_candidate_commit: a11690e5827d9d540b731156799566bea21c689e
audited_source_candidate_tree: 282c4dc93d31131fa0b20fc70c48831409664eee
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
stage2_manifest: fixtures/manifests/v1/v1b-stage2-execution.json
stage2_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
workbench_source_digest: ef30c4be9bc4143569f30aabbb66b2a01db9b2098082f35dba2137f3acb22ffe
pilot_root: .runs/v1-b/stage2/pilot
planned_initial_cells: 24
child_attempts_max: 8
whole_pilot_cost_usd_max: 2
credential_profile: DEEPSEEK_API_KEY
network_scope: https://api.deepseek.com only through tracked Pi provider
source_edit_authorized: false
git_stage_or_commit_authorized: false
v2_authorized: false
```

The user has already authorized this exact Stage 2 envelope. Do not request
routine per-cell approvals. Authority ends at valid V1-B execution/reporting or
the first Pause/automatic-exit condition.

## 2. Required read order

Read completely before commands:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md`;
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
5. `docs/第二项目_Codex交接包_2026-07-30/V1_B_GOAL_CONTRACT.md`;
6. `docs/reports/V1_B_STAGE1_MAIN_ACCEPTANCE_AND_STAGE2_BASELINE_DECISION.md`;
7. `docs/reports/V1_B_EXECUTION_BASELINE_PREFLIGHT.md`;
8. `docs/reports/V1_B_STAGE2_PROVIDER_CHECKPOINT.md`;
9. both focused audit reports;
10. the Stage 2 Manifest and tracked product surface/source needed to execute
    Gates K–O.

Do not turn this into a new source audit or research task.

## 3. Gate K — fresh checkout and local dependency resolution (zero calls)

Before credential resolution:

1. prove exact HEAD/tree above and tracked/staged clean;
2. prove the Stage 2 Manifest ID, 24 cells, source digest, Pi identity and USD2
   cap are exact;
3. prove root pinned Pi at
   `D:/AI/AI_Projects/project2/.upstream/pi` is exact and clean;
4. record initial `reference/` state without modifying it;
5. use only pre-existing local dependencies. Do not install or download.

A fresh Codex worktree may lack ignored dependencies. If necessary, create only
ignored directory junctions that point to the already-existing local roots:

- `<fresh-worktree>/workbench/node_modules` →
  `D:/AI/AI_Projects/project2/workbench/node_modules`;
- `<fresh-worktree>/.runs/v0-a/pi` →
  `D:/AI/AI_Projects/project2/.runs/v0-a/pi`.

Resolve and validate every absolute target before junction creation. Do not
delete or overwrite an existing path; if a path exists with unexpected type or
target, pause. After setup, run strict TypeScript and the narrow 19-test V1-B
suite, then the Stage 2 dry preflight. All credential/network/Provider/model
counters must remain zero.

If worktree setup or Git identity does not match, stop without calls and report.

## 4. Gate L — official checkpoint

Confirm the tracked checkpoint still applies at execution time using official
DeepSeek documentation only. Required frozen values:

- model `deepseek-v4-flash`;
- base URL `https://api.deepseek.com` and tracked chat-completions route;
- Tool Calls and non-thinking mode available;
- known usage plus current prices sufficient for fail-closed accounting;
- no fallback/retry/model replacement.

If this differs or cannot be verified, stop before credential resolution.

## 5. Gate M — opaque credential boundary

Credential source is the ignored user-controlled file:

`D:/AI/AI_Projects/project2/.env.g005`

Read only the `DEEPSEEK_API_KEY` value opaquely into the environment of the
single bounded CLI process. Never print, echo, hash, measure, serialize, include
in command text, persist in reports, or expose it to another variable dump.
Fail if the exact key is absent, empty, duplicated or malformed. Remove it from
the parent shell environment after each CLI process. No other credential is
authorized.

Do not run a live credential probe outside the tracked Pilot path.

## 6. Gate N — immutable one-cell loop

Use only the tracked product surface, with the exact Manifest and Pilot root:

```text
node workbench/src/cli.ts v1b run-next
  --manifest fixtures/manifests/v1/v1b-stage2-execution.json
  --pilot-root .runs/v1-b/stage2/pilot
  --stage2-real-authority
```

Run exactly one `run-next` process at a time. For each completed cell:

1. record command, exit code, returned Run ID and real-call counters;
2. run tracked read-only `v1b inspect` for that planned Run;
3. independently read ledger/terminal usage and ensure membership, identity,
   evidence and budget remain valid;
4. ensure cumulative actual cost plus the next required reserve cannot exceed
   USD 2;
5. ensure no fallback, same-Run retry, automatic replacement, cell skip,
   overwrite or deletion occurred;
6. only then start the unique next cell.

Task failure is an observed terminal result, not permission to retry. A valid C
child may occur only through the frozen eligibility and budget logic. Do not
manually force, suppress or repeat Recovery.

Do not run cells concurrently. Do not alter tasks, Skill, System Prompt, Tool,
Verifier, model/profile, Manifest, budgets, taxonomy or order after seeing any
result.

## 7. Automatic exit conditions

Stop immediately, preserve evidence and do not launch another cell if any of
the following occurs:

- architecture/Contract/allowlist expansion is required;
- a P0 or non-local P1 is observed;
- the same finding cannot close or would require more than two correction
  cycles;
- DeepSeek descriptor/pricing/usage drift or cannot be verified;
- credential is missing/invalid and needs user intervention;
- the next reserve could exceed the USD 2 Pilot cap;
- the same infrastructure/evidence cause occurs a second time;
- infrastructure/evidence invalid reaches 25%;
- a frozen source defect appears;
- retry/fallback/replacement/model/task/fixture change would be needed;
- secret, reasoning or protected-path boundary fails;
- Manifest/ledger/terminal/Inspector disagree;
- any per-attempt, per-Run or Pilot request/tool/token/time/cost cap is reached
  or would be exceeded;
- any Contract Pause Condition applies;
- continuation would enter V2/V3.

On exit, write a bounded Pause Report with observed state, terminal/ledger
position, cost consumed, evidence paths and the smallest Main Session decision
needed. Do not repair source.

## 8. Gate O and required deliverables

If all 24 initial cells reach valid terminal evidence or a Contract-valid global
budget stop, run tracked Inspector for every planned Run that executed and the
tracked read-only aggregate. Recompute membership, attempt/child lineage,
requests, tools, tokens, active time, cost, invalid attribution, denominators,
fairness bindings, Recovery eligibility/start/success and secret/reasoning
scans.

Create only:

- `docs/reports/V1_B_PILOT_EXECUTION_REPORT.md`;
- `docs/reports/V1_B_AGGREGATE_REPORT.md`;
- `docs/reports/V1_B_CLOSEOUT_DRAFT.md`;
- `.runs/v1-b/stage2/` evidence and an Evidence Index.

Reports must include exact commands and exit codes, Execution Baseline SHA/tree,
Manifest ID, every Run/Attempt/Session/Workspace link, model/profile identity,
actual cost and counters, invalid/exclusion accounting, natural Recovery facts,
source delta, unverified claims and a structured
`CURRENT_STATE_UPDATE_PROPOSAL`.

Allowed edits are only the three named reports plus ignored Stage 2 evidence.
Do not edit or stage `CURRENT_STATE.md`, Contract/Charter/09/ADR, source, tests,
fixtures, Manifest, Pi or reference. Do not create a Git commit.

## 9. Claims and stop point

Report descriptive observations only. Do not claim statistical significance,
general Skill superiority, general Runtime superiority or real Recovery effect
unless Recovery naturally occurs and the evidence supports only that observed
case. A Pilot with no natural Recovery is still valid if every Contract gate is
satisfied; report Recovery as unobserved.

When reports are complete, stop and return the disposition to Main Session.
Main Session alone accepts V1-B/V1, updates control state, creates the authorized
closeout commit and decides later whether to plan V2. You may not enter V2.
