# V1-C Fresh Full Pilot Execution Session Start Prompt

You are the fresh, dedicated, no-source-edit V1-C full Pilot Execution Session for the Agent Harness
Reliability Workbench.

## 1. Exact authority and frozen identity

```yaml
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
full_pilot_authorization_baseline_commit: e1dc93ffd65edca04d47d493b24fda833151e685
full_pilot_authorization_baseline_tree: 1cbcab69ba037c108812e0ca16946d2eee98cc78
authorization_baseline_parent: 2aff5ccdcc7aa780cc4bf68f9030d6123c750d7b
audited_execution_baseline_commit: cc71cdb8952178ef1d7422f44359d6ca08473b18
audited_source_candidate_commit: 962b42a281d3092f0faf399b9f6f1ecaa0212f31
audited_source_candidate_tree: d828f9fdb23c7099cdb1e4d5a993ff5579422dd4
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
full_pilot_manifest: fixtures/manifests/v1/v1c-full-pilot-execution.json
full_pilot_manifest_id: e32b11a162fec752e95ff48bf2b1021f20109a8e804aa025131568d49f50e8a1
workbench_source_digest: 4d12e4588917949ee84bb56c83ec67f7cb8093a304c8a3ab9980c97188174604
pilot_root: .runs/v1-c/full-pilot/pilot
experiment_id: v1-c-bounded-pilot
initial_cells: 24
child_attempts_max: 8
provider_requests_max: 256
tool_calls_max: 384
tokens_max: 2097152
active_execution_time_max_ms: 7200000
verifier_runs_max: 32
full_pilot_cost_hard_cap_usd: 1.90
accepted_canary_actual_cost_usd: 0.00042865199999999996
whole_v1_c_real_sequence_hard_cap_usd: 2.00
credential_profile: DEEPSEEK_API_KEY
credential_file: D:/AI/AI_Projects/project2/.env.g005
network_scope: https://api.deepseek.com only through the tracked Pi provider
source_edit_authorized: false
git_stage_or_commit_authorized: false
retry_fallback_replacement_authorized: false
v2_authorized: false
```

The user authorized this exact bounded Pilot after Main accepted the separate Canary as
`PASS_V1_C_REAL_CANARY`. Do not request routine approval inside this envelope. Authority ends when the
24-cell Pilot and its reports are complete, or immediately at the first Contract Pause Condition.

## 2. Required read order

Read completely before commands:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md`;
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
5. `docs/第二项目_Codex交接包_2026-07-30/V1_C_GOAL_CONTRACT.md`;
6. `docs/reports/V1_C_CANARY_MAIN_ACCEPTANCE_AND_FULL_PILOT_BASELINE_DECISION.md`;
7. `docs/reports/V1_C_CANARY_EXECUTION_REPORT.md`;
8. `docs/reports/V1_C_STAGE1_MAIN_ACCEPTANCE_AND_EXECUTION_BASELINE_DECISION.md`;
9. `docs/reports/V1_C_EXECUTION_BASELINE_PREFLIGHT.md`;
10. `docs/reports/V1_C_OFFICIAL_PROVIDER_CHECKPOINT.md`;
11. both V1-C focused audit reports;
12. the full Pilot Manifest and only the tracked product-surface/source needed to execute, inspect and
    aggregate this Pilot.

Do not reopen Stage 1 research, V1-B history, Pi SDK/Extension research or unrelated references.

## 3. Gate A — fresh checkout and zero-call local preparation

Before Credential resolution:

1. prove exact HEAD, tree and parent identities above;
2. prove tracked and staged state clean, allowing only registered ignored references;
3. reconstruct the full Pilot Manifest byte-for-byte and validate its exact ID, 24-cell order, disjoint
   Canary identity, source digest, Pi identity, 8-child ceiling and USD 1.90 cap;
4. prove both registered Pi checkouts are pinned and clean;
5. use only pre-existing local dependencies; do not install or download;
6. run strict TypeScript, V1-C 13/13, V1-B 31/31 and exact zero-call CLI preflight;
7. confirm Pilot root is absent before initialization and all Credential/network/Provider/model counters
   are zero;
8. confirm the frozen tracked Provider descriptor still matches the same-day Main checkpoint: model
   `deepseek-v4-flash`, base URL `https://api.deepseek.com`, `/chat/completions`, non-thinking mode, no
   retries, known usage fields and frozen prices.

A fresh worktree may lack ignored dependencies. If necessary, create only these ignored directory
junctions after resolving and validating their targets:

- `<fresh-worktree>/workbench/node_modules` ->
  `D:/AI/AI_Projects/project2/workbench/node_modules`;
- `<fresh-worktree>/.runs/v0-a/pi` ->
  `D:/AI/AI_Projects/project2/.runs/v0-a/pi`.

Do not replace an unexpected path. Pause on any identity, dependency, provider or preflight mismatch.

## 4. Opaque Credential boundary

The only authorized secret is `DEEPSEEK_API_KEY` in
`D:/AI/AI_Projects/project2/.env.g005`.

You may create one non-secret ignored preload/helper under `.runs/v1-c/full-pilot/`. For each next-cell
process, read exactly one nonempty assignment only inside that bounded Node process and remove it on exit.
Never print, echo, hash, measure, serialize, include the value in command text, persist it in evidence or
reports, or expose it through an environment dump. Reject inherited, absent, empty, duplicate or malformed
values. Do not run a standalone Credential or network probe. The parent shell must remain Credential-free.

## 5. One-cell-at-a-time execution loop

The tracked product surface is:

```text
node --import <ignored-opaque-preload> workbench/src/cli.ts v1b run-next
  --manifest fixtures/manifests/v1/v1c-full-pilot-execution.json
  --pilot-root .runs/v1-c/full-pilot/pilot
  --stage2-real-authority
```

Execute exactly one `run-next` process for the current Manifest-selected cell. Never select, skip, replace
or repeat a Run identity manually.

After every process:

1. record sanitized command intent, exit code, selected cell/Run and counters;
2. run tracked read-only Inspector for that exact Run;
3. cross-check Manifest, Ledger, Journal, Pi Session, Verifier, Outcome, terminal/pause evidence,
   reservation chain, request/tool/token/time/cost, protected digests and secret scan;
4. require exact known usage/cost for every dispatched request and agreement across all artifacts;
5. confirm there was no retry, fallback, replacement, second execution of the same Run or source drift;
6. only when the Run is Contract-valid terminal/comparable and no global stop applies, preflight the next
   cell and start the next single process.

Arm behavior remains frozen:

- A is Baseline;
- B is Skill-only;
- C begins with the same initial payload as B and may create one child Attempt only after a valid failed
  common-Verifier result, when recovery eligibility and all run/Pilot budgets permit;
- C-initial and C-final are checkpoints, not a fourth arm;
- treatment-caused invalid results remain in the denominator;
- the common Verifier is measurement infrastructure for A/B/C, not a C-only treatment.

A valid terminal task failure is an observed result, not an automatic retry request. Continue only if the
Manifest policy and Inspector allow it. If the CLI, Ledger or policy produces a pause/global stop, stop the
entire Session.

## 6. Automatic exit conditions

Stop immediately and make no further real request if any of these occurs:

- unknown, missing, invalid or contradictory Provider usage/cost;
- the next reservation could exceed a run, attempt, Pilot, USD 1.90 or whole-sequence USD 2.00 cap;
- a nonterminal earlier cell, pause state, Inspector error, evidence conflict or reservation drift exists;
- the frozen invalid-ratio or repeated-invalid-cause policy stops continuation;
- source, test, fixture, Manifest, Prompt, Skill, task, Verifier, Tool or Provider/model must change;
- Credential, raw-response, reasoning, protected-path or evidence-secret scanning fails;
- retry, fallback, replacement, replay, another model/task or larger budget would be needed;
- Pi, source digest, baseline or Manifest identity changes;
- any Contract Pause Condition applies;
- continuation would enter V2, V3 or a general platform effort.

Do not repair source. Preserve the exact evidence already written and produce a bounded Pause Report plus
the reports possible from valid observed cells. Do not silently mark unexecuted cells as results.

## 7. Completion and aggregate

Only after all 24 initial cells have Contract-valid terminal records, run the tracked aggregate surface:

```text
node workbench/src/cli.ts v1b aggregate --pilot-root .runs/v1-c/full-pilot/pilot
```

Independently validate that the aggregate uses only this Manifest's members and reports A/B/C initial
pass/fail/invalid counts, C-initial/C-final checkpoints, Recovery eligibility/start/success, treatment
invalids, excluded infrastructure/evidence invalids, requests/tools/tokens/time/cost and fairness. Do not
merge the Canary or V1-B Runs. Do not make statistical-significance, universal-superiority or cross-model
claims.

## 8. Deliverables and stop point

Create only these tracked reports:

- `docs/reports/V1_C_PILOT_EXECUTION_REPORT.md`;
- `docs/reports/V1_C_AGGREGATE_REPORT.md`;
- `docs/reports/V1_C_CLOSEOUT_DRAFT.md`;
- if stopped, `docs/reports/V1_C_FULL_PILOT_PAUSE_REPORT.md`.

Create `.runs/v1-c/full-pilot/EVIDENCE_INDEX.md` and ignored execution/inspection evidence. Reports must
include exact commands and exit codes, frozen identities, per-cell and total sanitized counters/costs,
complete evidence paths, source/protected/secret delta, remaining unverified claims and a structured
`CURRENT_STATE_UPDATE_PROPOSAL`.

Do not edit source, tests, fixtures, Manifest, `AGENTS.md`, `CURRENT_STATE.md`, Contract, Charter, 09, ADR,
Pi or references. Do not stage or commit. Stop after delivering the reports. Main Session alone reviews
and accepts or closes V1-C, updates control state and creates the already authorized closeout commit.
