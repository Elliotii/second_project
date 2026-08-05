# V1-C Fresh Real Canary Execution Session Start Prompt

You are the fresh, dedicated, no-source-edit V1-C real Canary Execution Session for the Agent Harness
Reliability Workbench.

## 1. Exact authority and identity

```yaml
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
authorization_baseline_commit: 2aff5ccdcc7aa780cc4bf68f9030d6123c750d7b
authorization_baseline_tree: c86860c7945baa48d790d613614db6b8d01f0d1e
audited_execution_baseline_commit: cc71cdb8952178ef1d7422f44359d6ca08473b18
audited_execution_baseline_tree: 7fa38a7b4484fa4076834c0cb01a46415bad0ac9
audited_source_candidate_commit: 962b42a281d3092f0faf399b9f6f1ecaa0212f31
audited_source_candidate_tree: d828f9fdb23c7099cdb1e4d5a993ff5579422dd4
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
canary_manifest: fixtures/manifests/v1/v1c-real-canary-execution.json
canary_manifest_id: c26e75989623ae1218be0a3996c59de2ccbce946988396695b38bb9fdc482c4c
workbench_source_digest: 4d12e4588917949ee84bb56c83ec67f7cb8093a304c8a3ab9980c97188174604
pilot_root: .runs/v1-c/canary/pilot
planned_cell: v1c-canary-cell-01
planned_run_id: v1c-canary-run-01-parse-duration-r1-a
task: v1-parse-duration
arm: A_baseline
initial_cells: 1
child_attempts_max: 0
provider_requests_max: 8
tool_calls_max: 12
tokens_max: 65536
wall_clock_max_seconds: 300
canary_cost_usd_max: 0.10
credential_profile: DEEPSEEK_API_KEY
credential_file: D:/AI/AI_Projects/project2/.env.g005
network_scope: https://api.deepseek.com only through the tracked Pi provider
source_edit_authorized: false
git_stage_or_commit_authorized: false
full_pilot_authorized_in_this_session: false
v2_authorized: false
```

The user authorized this exact Canary envelope. Do not request routine approval inside it. Authority ends
after this one planned cell reaches a Contract-valid terminal result or at the first Pause Condition.

## 2. Required read order

Read completely before commands:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md`;
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
5. `docs/第二项目_Codex交接包_2026-07-30/V1_C_GOAL_CONTRACT.md`;
6. `docs/reports/V1_C_REAL_SEQUENCE_BOUNDED_AUTONOMY_AUTHORIZATION.md`;
7. `docs/reports/V1_C_STAGE1_MAIN_ACCEPTANCE_AND_EXECUTION_BASELINE_DECISION.md`;
8. `docs/reports/V1_C_EXECUTION_BASELINE_PREFLIGHT.md`;
9. `docs/reports/V1_C_OFFICIAL_PROVIDER_CHECKPOINT.md`;
10. both V1-C focused audit reports, the Canary Manifest and only the tracked product-surface/source needed
    to execute and inspect the Canary.

Do not reopen Stage 1 research, conduct a broad Pi/SDK/Extension audit or inspect unrelated references.

## 3. Gate A — fresh checkout and zero-call local preparation

Before Credential resolution:

1. prove exact HEAD/tree and parent identities above;
2. prove tracked/staged clean, allowing only registered user-controlled ignored references;
3. reconstruct and validate exact Manifest ID, one cell, source digest, Pi identity and USD 0.10 cap;
4. prove both registered Pi checkouts are pinned and clean;
5. use only pre-existing local dependencies; do not install or download;
6. run strict TypeScript, V1-C 13/13, V1-B 31/31 and zero-call CLI preflight;
7. confirm all Credential/network/Provider/model counters are still zero.

A fresh worktree may lack ignored dependencies. If necessary, create only these ignored directory junctions
after resolving and validating the target:

- `<fresh-worktree>/workbench/node_modules` →
  `D:/AI/AI_Projects/project2/workbench/node_modules`;
- `<fresh-worktree>/.runs/v0-a/pi` →
  `D:/AI/AI_Projects/project2/.runs/v0-a/pi`.

Do not replace an unexpected existing path. Pause on identity or setup mismatch.

## 4. Official Provider boundary

The Main-owned same-day checkpoint is frozen as
`PASS_CURRENT_OFFICIAL_PROVIDER_CHECKPOINT`. Confirm the tracked Manifest/provider descriptor still matches:

- model `deepseek-v4-flash`;
- `https://api.deepseek.com/chat/completions`;
- non-thinking execution, Tool Calls, known usage fields and frozen prices;
- no fallback, retry or model replacement.

Do not perform unrelated browsing. If the runtime descriptor differs, stop before Credential resolution.

## 5. Opaque Credential boundary

The only authorized secret is `DEEPSEEK_API_KEY` in
`D:/AI/AI_Projects/project2/.env.g005`.

Read that value only inside the environment of the one bounded `run-next` process. Never print, echo, hash,
measure, serialize, include it in command text, persist it in evidence/reports, or expose it through an
environment dump. Fail closed if the exact key is absent, empty, duplicated or malformed. Remove it from
the parent shell after the process. Do not run a standalone Credential or network probe.

## 6. One-cell real Canary

Run the tracked product surface exactly once:

```text
node workbench/src/cli.ts v1b run-next
  --manifest fixtures/manifests/v1/v1c-real-canary-execution.json
  --pilot-root .runs/v1-c/canary/pilot
  --stage2-real-authority
```

This is one `run-next` process and one planned Run; the Agent may make up to eight bounded Provider
requests within it. Do not start a second `run-next`, repeat the Run or advance another identity.

After the process:

1. record sanitized command intent, exit code, Run ID and real-call counters;
2. run tracked read-only Inspector for the exact planned Run;
3. independently cross-check Manifest, Ledger, Journal, Pi Session, Verifier, Outcome, terminal evidence,
   request/tool/token/time/cost and protected digest;
4. require exact known usage/cost, reservation consistency, `settled`, a common Verifier Outcome, terminal,
   integrity-valid and comparable Inspector result;
5. confirm no retry, fallback, replacement, source/fixture/Manifest change, secret leakage or child Attempt.

A valid pass or fail Outcome can satisfy the Canary. Unknown usage/cost, pause, nonterminal, invalid or
noncomparable evidence cannot.

## 7. Automatic exit conditions

Stop immediately and do not make another real request if:

- Credential/profile/endpoint/schema/pricing differs or cannot be validated;
- the Run pauses, has unknown usage/cost, or the next reserve could exceed USD 0.10;
- Manifest, Ledger, Journal, Session, Verifier, Outcome or Inspector disagree;
- the Agent would need retry, fallback, replacement, a second Run or larger budget;
- source, test, fixture, Manifest, Prompt, Skill, task, Verifier, Tool or model must change;
- a secret/raw-response/reasoning/protected-path boundary fails;
- Pi or baseline identity changes;
- any Contract Pause Condition applies;
- continuation would enter the full Pilot, V2 or V3.

Do not repair source. Preserve evidence and report the exact bounded stop.

## 8. Deliverables and stop point

Create only:

- `docs/reports/V1_C_CANARY_EXECUTION_REPORT.md`;
- `.runs/v1-c/canary/EVIDENCE_INDEX.md` and ignored Canary evidence.

The report must include exact commands and exit codes, all identity values, sanitized real-call counters,
exact usage/cost, outcome/Inspector result, complete lineage/evidence paths, protected/secret scan, Source
Delta, remaining unverified claims and a structured `CURRENT_STATE_UPDATE_PROPOSAL`.

Allowed tracked edit is the one named report only. Do not edit/stage/commit source, tests, fixtures,
Manifest, `CURRENT_STATE.md`, Contract/Charter/09/ADR, Pi or references.

Stop after the report. Main Session alone decides whether the Canary is valid and whether the user's
conditional full-Pilot pre-authorization may activate.
