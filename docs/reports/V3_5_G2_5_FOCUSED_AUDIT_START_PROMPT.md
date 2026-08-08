# V3.5 Goal 2.5 Fresh Focused Audit Prompt

```yaml
status: authorized_focused_audit
goal_id: V3_5_G2_5_TERMINATION_SAFE_REAL_SKILL_CLOSURE
audit_baseline_commit: e174808550211f2236c3a5c08a350a45d1bcab48
audit_role: fresh_top_level_independent_audit_session
source_edit_authorized: false
credential_reads_authorized: 0
network_authorized: false
external_provider_or_model_calls_authorized: 0
real_pair_authorized: false
```

You are the single fresh focused independent Audit Session for V3.5 Goal 2.5. Main owns
scope, corrections, commits, acceptance and real-execution authority. You may inspect the
exact frozen Candidate, run bounded zero-access tests, write only the named audit report and
ignored audit-local evidence, then stop. Do not repair source or broaden this into a general
V3.5 review.

## Gate A

Before analysis, verify:

1. exact `HEAD` is `e174808550211f2236c3a5c08a350a45d1bcab48`;
2. tracked files are clean;
3. pinned Pi checkout is exactly
   `027a5847901b5dde30270abaa1041046cd2b4b55` and tracked-clean;
4. no Credential, network, external Provider/model or real-pair authority exists here.

If any identity is wrong, stop with the audit report marked blocked. Do not rebase, merge,
reset, switch branches, reconstruct the baseline or modify Pi.

## Required reading

Read completely:

- `AGENTS.md`;
- `CURRENT_STATE.md`;
- `docs/第二项目_Codex交接包_2026-07-30/V3_5_CHARTER.md`;
- `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
- `docs/第二项目_Codex交接包_2026-07-30/V3_5_G2_5_GOAL_CONTRACT.md`;
- `docs/reports/V3_5_G2_TERMINATION_POSTMORTEM.md`;
- `docs/reports/V3_5_G2_5_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_5_G2_5_MAIN_REVIEW_REPORT.md`;
- the Goal 2.5 source/tests and only the directly reused Goal 2/V2 checkpoint/public Pi
  symbols needed to validate the findings below.

Read applicable Pi `AGENTS.md` before inspecting pinned Pi. Use source, tests and observed
commands as authority; reports are claims to verify.

## Exact audit scope

Audit only these boundaries:

1. **Public Tool termination** — `public_test` is actually visible to the model; unknown IDs
   fail closed; only a successful, non-timeout public Tool Result can terminate the Pi loop;
   the Tool Result is persisted and no extra Provider follow-up occurs.
2. **Budget-terminal quiescence** — the seventeenth attempt is local-only after exactly 16
   dispatches/responses; reservations, Tool calls and side effects are closed; usage is
   known/reconciled; persisted checkpoint identity and ordering gate the Verifier. Named
   negative conditions must permit zero Verifiers and zero Candidate starts.
3. **Settled Verifier handoff** — persisted Runtime and first-payload artifacts are
   authenticated; the public JSONL Session is reopened with complete Tool-call/Tool-result
   closure; Workspace/protected state is snapshot and live-rechecked after the persisted
   handoff but before exactly one Verifier. Tampering must reach zero Verifiers/Candidates.
4. **Evidence and fairness** — Base and Candidate initial Workspace, actual Tool projection,
   first Provider payload outside the frozen Skill delta, budgets and Verifier are identical;
   Session/Run linkage has bounded relative references plus count/digest; Candidate is gated
   on a valid Base Task Outcome.
5. **Dormant real entry** — exact arguments, authorization token, clean audited `HEAD` and
   pinned Pi identity fail closed before opaque Credential resolution or network/model
   access; construction cannot create more than one authority per arm. Do not execute it.

For each concrete finding, provide file/symbol/line evidence, severity, reachable failure,
and the smallest correction boundary. Do not report style, naming, speculative platform
features or unrelated historical debt as findings.

## Allowed verification

You may run only the narrow zero-access checks needed to support the audit, normally:

```text
npm.cmd run v35g25:typecheck
npm.cmd run v35g25:test
npm.cmd run v35g2:test
npm.cmd run v35g1:test
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2b-r2.test.ts
git diff --check e174808550211f2236c3a5c08a350a45d1bcab48
```

Run from `workbench/` where appropriate. Do not install dependencies, read `.env.g005`, use
external network, invoke a Provider/model, run the real-pair script, edit source, stage or
commit files.

## Deliverable and stop

Write exactly one tracked report:

`docs/reports/V3_5_G2_5_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`

The report must state:

- exact baseline and Pi identities;
- PASS or bounded findings;
- source/symbol evidence for each audited boundary;
- commands, exit codes and test counts;
- access counters `0/0/0/0/0`;
- whether the Candidate is safe to freeze as the no-source-edit Execution Baseline;
- any remaining limitation that is not a finding.

Do not create a Git commit. Do not modify control state, source, the formal Contract,
historical evidence or Main reports. Stop after the report and return it to Main. Any finding
must be repaired, if authorized, only by the original Goal 2.5 Implementation Session.
