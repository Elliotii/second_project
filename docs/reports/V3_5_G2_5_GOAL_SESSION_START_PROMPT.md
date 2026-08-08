# V3.5 Goal 2.5 Zero-access Implementation Session Start Prompt

```yaml
status: authorized_start_prompt
goal_id: V3_5_G2_5_TERMINATION_SAFE_REAL_SKILL_CLOSURE
control_baseline_commit: 6e56a3f7e6048f74a46791af463c4e2d2f98f5b8
session_role: new_top_level_goal_2_5_implementation_session
initial_phase: zero_access_implementation_only
```

You are the dedicated top-level Implementation Session for V3.5 Goal 2.5. Main owns
architecture, control state, Goal acceptance, audit disposition and all authority outside
this Contract. You own only the bounded zero-access implementation, focused verification,
raw evidence, one bounded implementation commit, Implementation Report and Closeout Draft.

## 1. Gate A: verify before changing anything

From your allocated project worktree:

1. confirm exact initial `HEAD`:
   `6e56a3f7e6048f74a46791af463c4e2d2f98f5b8`;
2. confirm all tracked files are clean before implementation;
3. confirm the pinned Pi checkout used by this project is exactly
   `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
4. record the active branch/worktree, root status and Pi status;
5. preserve ignored `.runs/` and registered untracked reference material; do not delete,
   stage or commit either merely to make `git status` empty.

If the exact baseline or pinned Pi identity is wrong, stop with a Pause Report. Do not
silently rebase, merge, reset, switch runtime route or reconstruct the baseline.

## 2. Required reading

Read completely before implementation:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V3_5_CHARTER.md`;
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
5. `docs/第二项目_Codex交接包_2026-07-30/V3_5_G2_5_GOAL_CONTRACT.md`;
6. `docs/reports/V3_5_G2_TERMINATION_POSTMORTEM.md`;
7. `docs/第二项目_Codex交接包_2026-07-30/V3_5_G2_REAL_ADAPTIVE_SKILL_CASE_CONTRACT.md`;
8. `docs/reports/V3_5_G2_IMPLEMENTATION_REPORT.md` and
   `docs/reports/V3_5_G2_CLOSEOUT.md`;
9. the Goal 2 source/tests and the existing V2 pre-Verifier quiescence/checkpoint source and
   tests referenced by the formal Goal 2.5 Contract and postmortem;
10. every applicable `AGENTS.md` in the fixed Pi checkout before reading the public
    AgentHarness/Tool-result/session symbols and tests cited by the Contract.

Use repository source, tests and observed command results as authority. The postmortem is
accepted design input, not permission to broaden the implementation.

## 3. Exact zero-access implementation scope

Implement only the Contract-listed combined correction:

1. derive the model-visible `run_command.command_id` schema/description from the frozen
   allowed-command descriptors, making `public_test` explicit while unknown IDs remain
   fail-closed;
2. persist a digest of the actual Tool-interface projection used by both first Provider
   payloads;
3. return Pi's public `terminate: true` only after a successful frozen `public_test` Tool
   result; failed/timed-out commands remain non-terminating;
4. add the typed local pre-dispatch request-budget terminal with separate request-attempt
   and actual-dispatch counters;
5. preserve the exact primary local stop and fix only the observed secondary usage/report
   accounting defect;
6. adapt the existing V2 quiescence checkpoint for reservation/response closure, Tool and
   side-effect closure, known usage, public Session reopen equality, Workspace/protected
   snapshot, first-payload evidence and checkpoint-before-Verifier ordering;
7. persist separate `trajectory_outcome` and `task_outcome`; only the frozen external
   Verifier may emit `task_outcome: passed | failed`;
8. add only focused mechanism tests, narrow affected regressions and Contract-required
   reports/evidence.

The actual Tool interface, termination, quiescence and outcome behavior must be identical
for Base and Candidate except for the already frozen adaptive-Skill treatment.

## 4. Required zero-call proof

Before returning to Main, prove every item in Contract section 6, including:

- strict TypeScript;
- exact visible `public_test` surface plus unknown-ID fail-closed behavior;
- successful Faux `public_test` Tool Result persistence, no automatic follow-up and exactly
  one public AgentHarness `settled`;
- no false termination on failed/timed-out checks;
- exact seventeenth-attempt local refusal with 16 dispatches and no seventeenth network
  call;
- one positive quiescent checkpoint followed by exactly one Verifier and Candidate
  eligibility;
- every listed negative checkpoint fixture produces zero Verifiers and zero Candidates;
- Base/Candidate first-payload equality outside the frozen Skill treatment;
- Goal 2 focused tests and the narrow Goal 1/V3/V2-checkpoint regressions;
- Credential/network/external Provider/model/real-model counters exactly `0/0/0/0/0`.

Run the narrowest sufficient checks. Ordinary TypeScript, fixture, schema and adapter bugs
inside the allowlist are normal implementation work: fix them in this Session without
inventing R1/R2, replacement or new governance stages.

## 5. Prohibited in this phase

Do not:

- read credentials or `.env.g005`;
- use external network, external Provider or a real model;
- execute the real Base/Candidate pair;
- change the frozen Case, initial Workspace, Prompt, Skill, Verifier, provider/model,
  per-arm/pair budgets, order or fairness semantics;
- add a retry, fallback, replacement, extra arm, extra Case or hidden-Verifier feedback;
- modify Pi, use Pi private imports, switch to SDK/Extension/RPC/server routes, install new
  dependencies or introduce a new runtime;
- change `AGENTS.md`, `CURRENT_STATE.md`, the Charter, governance file, formal Contract or
  accepted V0–V3/Goal 1/Goal 2 authority artifacts;
- stage or commit `.runs/`, credentials, Pi, `reference/` or unrelated changes;
- accept/close Goal 2.5, activate Goal 3 or claim Skill effectiveness.

## 6. Commit and deliverables

If all zero-access Gates pass, create exactly one bounded implementation commit containing
only allowed source/tests/scripts and these tracked reports:

- `docs/reports/V3_5_G2_5_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_5_G2_5_CLOSEOUT_DRAFT.md`.

The reports must include:

- baseline SHA and implementation commit SHA;
- exact source delta and purpose of each file;
- commands, exit codes and test counts;
- evidence index and all zero-access counters;
- Gate-by-Gate and Exit-Criteria disposition;
- remaining limitations and any deviations;
- a structured `CURRENT_STATE_UPDATE_PROPOSAL` for Main only.

Do not edit control files. Stop after the bounded commit and reports. Return the commit SHA
and evidence to Main for light review. The focused audit and real Pair are later, separate
Main-controlled phases and are not authorized within this initial turn.

## 7. Hard stops

Stop immediately with `docs/reports/V3_5_G2_5_PAUSE_REPORT.md` if any formal Contract hard
stop occurs, including a need to alter frozen experiment semantics or budget, patch Pi,
switch runtime route, expose hidden Verifier information before handoff, weaken evidence or
security boundaries, create another persistence platform, or expand beyond the bounded
combined correction.
