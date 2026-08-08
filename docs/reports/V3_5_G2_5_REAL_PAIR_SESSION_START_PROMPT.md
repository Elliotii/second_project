# V3.5 Goal 2.5 Real Pair Session Start Prompt

```yaml
status: authorized_execution_prompt
execution_owner: fresh_top_level_no_source_edit_session
audited_execution_baseline: 12c64739eb0b1db715def18800c28ea728f31610
real_pair_authority: exactly_once
retry: 0
fallback: 0
replacement: 0
extra_arm_or_case: 0
```

You are the fresh, top-level, no-source-edit Real Execution Session for
`V3_5_G2_5_TERMINATION_SAFE_REAL_SKILL_CLOSURE`.

Your only task is to execute the single frozen Base-then-Candidate Pair and return its
raw evidence. You do not accept or close Goal 2.5, V3.5, or start Goal 3.

## 1. Required reading

Read completely, in this order:

1. `AGENTS.md`
2. `CURRENT_STATE.md`
3. `docs/第二项目_Codex交接包_2026-07-30/V3_5_CHARTER.md`
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`
5. `docs/第二项目_Codex交接包_2026-07-30/V3_5_G2_5_GOAL_CONTRACT.md`
6. `docs/reports/V3_5_G2_TERMINATION_POSTMORTEM.md`
7. `docs/reports/V3_5_G2_5_IMPLEMENTATION_REPORT.md`
8. `docs/reports/V3_5_G2_5_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`
9. only the real-entry, Pair, checkpoint, Pi-adapter and frozen Case code needed to verify
   the command and evidence contract.

When reading pinned Pi source, first read every applicable Pi `AGENTS.md`. Do not modify
Pi.

## 2. Gate H — all checks are read-only

Before any credential read or network access, verify:

- project HEAD is exactly
  `12c64739eb0b1db715def18800c28ea728f31610`;
- tracked project status is clean; registered untracked reference/ignored evidence is not
  a failure;
- pinned Pi at `D:/AI/AI_Projects/project2/.upstream/pi` is exactly
  `027a5847901b5dde30270abaa1041046cd2b4b55` and tracked-clean;
- the historical State root exists and remains read-only:
  `D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/sequence-489cb1c4-20d9-42af-8dd6-0b22aeb6cf5d/project-state`;
- the existing ignored credential carrier
  `D:/AI/AI_Projects/project2/.env.g005` exists, but do not read it yet;
- the fresh Pair root below does not exist;
- all frozen Case, State, Prompt, Skill, Tool-interface, Verifier and source-identity
  preflight checks can pass without mutation.

If any check fails, do not read the credential and do not dispatch. Return a structured
Pause report and stop.

## 3. The only authorized execution

Use this Session's repository root as `<PROJECT_ROOT>` and this fresh ignored Pair root:

`<PROJECT_ROOT>/.runs/v3-5-g2-5/real-pair-20260809-01`

After Gate H passes, use Node's `--env-file` support to load the existing
`.env.g005` opaquely into the execution process. Do not print, copy, persist, shell-expand,
or inspect the credential value. Execute the already frozen entry exactly once:

```text
node --env-file=D:/AI/AI_Projects/project2/.env.g005 \
  --experimental-loader ./scripts/v35g2-public-pi-loader.mjs \
  scripts/v35g25-real-pair.ts \
  --project-root <PROJECT_ROOT> \
  --pair-root <PROJECT_ROOT>/.runs/v3-5-g2-5/real-pair-20260809-01 \
  --historical-state-root D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/sequence-489cb1c4-20d9-42af-8dd6-0b22aeb6cf5d/project-state \
  --execution-baseline 12c64739eb0b1db715def18800c28ea728f31610 \
  --authorize-real-pair V3_5_G2_5_REAL_PAIR_ONCE
```

Run it from `<PROJECT_ROOT>/workbench`. The concrete command may use native PowerShell
variables only to substitute `<PROJECT_ROOT>`; the semantic arguments must remain exact.

Frozen authority:

- order: Base, then Candidate;
- per arm: at most 16 Provider dispatches, at most 17 request attempts, at most 131072
  tokens, at most 24 Tool calls, exactly one external Verifier, at most USD 0.20;
- whole Pair: exactly two arms, at most two credential-resolver reads, at most 32 Provider
  dispatches and at most USD 0.40;
- DeepSeek `deepseek-v4-flash`, thinking off;
- Base must close with a valid Task Outcome before Candidate may start;
- normal public-Pi `settled` is preferred; the only alternate terminal is the frozen typed
  verifier-safe pre-dispatch budget terminal;
- retry, fallback, replacement, additional Pair, arm, Case, tuning and post-dispatch
  source/evidence correction are all forbidden.

If the entry stops or writes `pause.json`, that consumes this one Pair authority. Do not
run it again.

## 4. Mutation boundary

You may create only:

- ignored evidence under the fresh Pair root;
- one uncommitted execution report:
  `docs/reports/V3_5_G2_5_REAL_PAIR_EXECUTION_REPORT.md`.

Do not edit source, fixtures, tests, Manifest inputs, State authority, control files,
accepted reports, Pi, dependencies, or Git state. Do not stage or commit. Do not switch to
SDK, Extension, RPC, another model/provider, or another Runtime path.

## 5. Return package

Whether the Pair succeeds or hard-stops, report:

- exact project/Pi HEAD and tracked status;
- Gate H results and whether the credential was read;
- exact single command and exit code;
- Pair root and every authoritative artifact path;
- Base and Candidate Session/Run IDs, terminal kind, request-attempt/dispatch/token/Tool
  counts, cost and Verifier result (Candidate fields only if it legally started);
- first-payload fairness and Tool-interface digests;
- Session/Run/checkpoint/Workspace/Verifier link validity;
- retry/fallback/replacement/additional execution counts;
- comparison digest on success, or exact primary hard-stop reason;
- full Commands and Exit Codes and an Evidence Index;
- tracked source delta and access counters.

Stop after returning the report. The Main Session owns evidence interpretation and
disposition; do not claim final Goal acceptance.
