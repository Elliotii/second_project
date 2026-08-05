# V1-C Corrected Full-Pilot R2 Execution Session Start Prompt

You are the fresh, dedicated, no-source-edit V1-C R2 full-Pilot Execution
Session. Your only objective is to execute the frozen 24-cell Baseline /
Skill-only / Skill + Runtime Control comparison and return evidence to Main.

## 1. Exact authority

```yaml
goal_id: V1_C_BOUNDED_BUDGET_STOP_CORRECTION_AND_COMPARISON_COMPLETION
execution_baseline_commit: c37ef6e6676cba245c0929dcdf98401f004fab54
execution_baseline_tree: a1d01cb6345a3534493874a67bbed30711b34c44
execution_baseline_parent: 9f57be00f9d84279db01a6a2e17db80e9eae571d
audited_source_candidate_commit: 5b87b98e431663595e9bd26a54589defbabcd3b1
audited_source_candidate_tree: a238d838c4197aae1ef35dd70507b680160e0c65
focused_reaudit: PASS_FOCUSED_REAUDIT
workbench_source_digest: 2de1b76f7b9304ebe6d75e04ba3fa172f1d433cc219ad63ff10e6d6ff08c7ad3
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
manifest: fixtures/manifests/v1/v1c-full-pilot-execution-r2.json
manifest_id: c1587d04277a327bf0bd54bcf5abf6194663513f7c5960d3425bcbd322e78e14
pilot_root: .runs/v1-c/full-pilot-r2/pilot
helper_path: .runs/v1-c/full-pilot-r2/opaque-credential-preload.mjs
accepted_helper_sha256: 2d83b0e1e3eafecb774a3e6faf4f6ac1ec29984ee256dc750a06805e3f577438
credential_file: D:/AI/AI_Projects/project2/.env.g005
credential_profile: DEEPSEEK_API_KEY
network_scope: https://api.deepseek.com through tracked Pi provider only
initial_cells: 24
child_attempts_max: 8
provider_requests_max: 256
tool_calls_max: 384
tokens_max: 2097152
active_execution_time_max_ms: 7200000
verifier_runs_max: 32
pilot_cost_hard_cap_usd: 1.90
same_run_retry: 0
fallback: 0
automatic_replacement: 0
source_or_fixture_edits_authorized: false
git_stage_or_commit_authorized: false
v2_authorized: false
```

The user has authorized this exact bounded continuation. Do not request routine
approval while inside the envelope. Authority ends after all 24 cells and final
reports complete, or immediately at a material Pause Condition.

## 2. Required reading

Read completely, in order:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md`;
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
5. `docs/第二项目_Codex交接包_2026-07-30/V1_C_GOAL_CONTRACT.md`;
6. `docs/reports/V1_C_AGGREGATE_NORMALIZER_MAIN_ACCEPTANCE_AND_PILOT_RESTART_DECISION.md`;
7. `docs/reports/V1_C_CORRECTED_FULL_PILOT_RESTART_BASELINE_PREFLIGHT.md`;
8. both aggregate-normalizer correction/re-audit reports;
9. the R2 Manifest and only the product source/tests needed for execution,
   inspection and aggregation.

Do not read historical `.runs/v1-c/full-pilot` artifacts or Credential values.
Do not reopen V1-B, unrelated research, SDK/Extension work or V2.

## 3. Gate A — fresh clean worktree and zero-call preparation

Before Credential resolution:

1. prove exact HEAD/tree/parent above and empty tracked/staged status;
2. prove the R2 Pilot root does not exist;
3. prove the R2 Manifest reconstructs exactly, contains 24 unique cells/Runs in
   frozen order and binds the exact Candidate/source/Pi/budgets above;
4. prove both registered Pi checkouts are pinned and clean after reading their
   applicable `AGENTS.md`; command-local `safe.directory` is allowed, Git config
   changes are forbidden;
5. if ignored dependencies are absent, resolve and validate the absolute
   targets, then create only these local junctions without install/download:
   `workbench/node_modules -> D:/AI/AI_Projects/project2/workbench/node_modules`
   and `.runs/v0-a/pi -> D:/AI/AI_Projects/project2/.runs/v0-a/pi`;
6. copy the already accepted ignored helper bytes from
   `C:/Users/HUAWEI/.codex/worktrees/43f5/project2/.runs/v1-c/full-pilot/opaque-credential-preload.mjs`
   to the R2 helper path without displaying or editing them, and verify exact
   SHA-256 `2d83b0...7438`;
7. prove the parent shell has no inherited `DEEPSEEK_API_KEY`;
8. run strict TypeScript, the focused V1-B/V1-C 40-test pair, Manifest
   reconstruction, and zero-call `v1b preflight`;
9. prove preflight leaves the Pilot root absent and all real counters at zero.

Pause on any source/Manifest/Pi/helper identity mismatch. A shell quoting/path
mistake that is proven to occur before helper load, Credential resolution,
Pilot state, network/model use and evidence mutation is a mechanical error: fix
the command and repeat the zero-call check; do not count it as a Pilot Run.

## 4. Product execution

For each cell, execute exactly one bounded process using the corrected relative
helper specifier:

```text
node --import ./.runs/v1-c/full-pilot-r2/opaque-credential-preload.mjs workbench/src/cli.ts v1b run-next --manifest fixtures/manifests/v1/v1c-full-pilot-execution-r2.json --pilot-root .runs/v1-c/full-pilot-r2/pilot --stage2-real-authority
```

After every process:

1. record exact exit code;
2. run tracked `v1b inspect` on the selected Run;
3. reconcile Ledger/Journal/Attempt/Session/Workspace/Verifier/Outcome,
   reservations, usage/cost, protected paths and secret scan;
4. confirm the next Manifest cell only after the previous cell is terminal or a
   Contract-valid pause;
5. after every completed three-arm block, run the tracked read-only aggregate
   and require all completed fairness blocks to pass;
6. launch no later cell after any material Pause Condition.

The Credential may be resolved opaquely only inside each bounded process. Never
print, hash, measure, normalize, edit or persist its value. Do not modify source,
tests, fixture, Manifest, task, Skill, Prompt, Verifier, Tool Profile,
Provider/model, budgets, control state or historical evidence.

## 5. Material Pause Conditions

Stop before the next cell on:

- unknown or unreconciled usage/cost;
- Manifest/source/Pi/helper drift;
- nonterminal earlier cell or Producer/Inspector disagreement;
- aggregate fairness failure after a completed block;
- secret/reasoning evidence leakage;
- invalid ratio above the frozen threshold or repeated invalid cause;
- budget cap breach or unavailable complete child reserve;
- unauthorized retry, fallback, replacement, source edit or external endpoint;
- inability to prove whether a sensitive/product side effect occurred.

Do not treat a proven zero-side-effect CLI/path typo as a material Pause; repair
only the command and continue. Do not repair source during execution.

## 6. Final aggregate and claims

After all 24 initial cells reach accepted terminal/invalid states, run the
tracked aggregate and report:

- A/B/C planned, terminal, invalid, comparable, pass and fail counts;
- C-initial and C-final checkpoints;
- Recovery eligible/started/succeeded counts;
- treatment-caused invalids in denominators;
- Provider requests, Tool calls, tokens, active time, Verifiers, child Attempts
  and exact tracked cost by arm and total;
- block fairness and any task/repetition concentration;
- one of: `BASELINE_DESCRIPTIVELY_BETTER`,
  `SKILL_ONLY_DESCRIPTIVELY_BETTER`,
  `SKILL_PLUS_RUNTIME_DESCRIPTIVELY_BETTER`, or `INCONCLUSIVE`.

Do not claim statistical significance, universal superiority or generalization
beyond this fixed model/task/Skill/budget protocol.

## 7. Deliverables and stop

Create only:

- `docs/reports/V1_C_R2_PILOT_EXECUTION_REPORT.md`;
- `docs/reports/V1_C_R2_AGGREGATE_REPORT.md`;
- `docs/reports/V1_C_R2_CLOSEOUT_DRAFT.md`;
- ignored `.runs/v1-c/full-pilot-r2/EVIDENCE_INDEX.md`;
- ignored Commands/Exit Codes and bounded helper/evidence artifacts.

Include a structured `CURRENT_STATE_UPDATE_PROPOSAL` in a report, but do not
modify `CURRENT_STATE.md`. Do not stage or commit. Stop after handoff and wait
for Main acceptance; do not enter V2.
