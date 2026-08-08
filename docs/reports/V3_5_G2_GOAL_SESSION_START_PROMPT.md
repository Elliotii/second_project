# V3.5 Goal 2 — Top-level Goal Session Start Prompt

```yaml
status: authorized_for_dispatch
goal_id: V3_5_G2_REAL_ADAPTIVE_SKILL_CLOSURE
control_baseline_commit: b44197e3a5465058c4cb327613d775943f5f8444
initial_phase: zero_access_implementation_and_preflight
real_access_in_initial_phase: false
goal_3_authorized: false
v3_5_final_acceptance_authorized: false
```

You are the dedicated new top-level Goal 2 Session for V3.5. You own the bounded
implementation and, only after a later Main follow-up following preflight review, the one
frozen real Base/Candidate pair. You do not own project control state, final Goal
acceptance, Goal 3 or final V3.5 acceptance.

## 1. Starting state and Gate A

You must start from exact Control Baseline:

`b44197e3a5465058c4cb327613d775943f5f8444`

Before editing:

1. run `git rev-parse HEAD` and require the exact SHA above;
2. require all tracked files clean;
3. confirm pinned Pi is `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
4. read every file below completely;
5. verify the formal Contract is `accepted_activated_implementation_not_started` and
   names this Goal as active;
6. verify the frozen Skill, fixture, Verifier, profile, budget and Case Authority hashes
   from source bytes before implementation or dispatch.

Required reading:

- `AGENTS.md`;
- `CURRENT_STATE.md`;
- `docs/第二项目_Codex交接包_2026-07-30/V3_5_CHARTER.md`;
- `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
- `docs/第二项目_Codex交接包_2026-07-30/V3_5_G2_REAL_ADAPTIVE_SKILL_CASE_CONTRACT.md`;
- `docs/reports/V3_5_G1_CLOSEOUT.md`;
- `docs/reports/V3_5_G1_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_CLOSEOUT.md`;
- the relevant current Workbench Session, Read Model, V3 State/binding/Skill, Direct Pi,
  Verifier, evidence, hashing and test sources selected after `rg` inspection;
- every applicable `.upstream/pi/AGENTS.md` before inspecting pinned Pi source/tests.

If Gate A fails, stop with a short Pause Report. Do not repair control state.

## 2. Frozen Version Question

Can the accepted historical adaptive Skill be explicitly selected from isolated
case-owned State and evaluated on the one frozen related held-out task through the real
Direct Pi/model path with fair, persistent and inspectable Base/Candidate evidence?

A Skill win is not required. Valid evidence is the completion target.

## 3. Initial authority: zero-access implementation only

In this initial turn you may:

- materialize and verify the exact frozen fixture, hidden external Verifier and
  calibration-only reference defined by the Contract;
- derive/copy an isolated case-owned State authority selecting exact State version 2 and
  Skill `adaptive-inefficient-success`, without modifying the closed V3 State root or
  global active pointer;
- implement only the smallest Goal 2 persistent Direct-Pi Run/comparison adapter needed
  to connect existing Goal 1 Session/Run/Read Model and V3 binding/runtime mechanisms;
- add focused deterministic tests for identity, fairness, budgets, evidence linkage,
  fail-closed boundaries and Read Model projection;
- run strict TypeScript, focused tests, affected regressions and the zero-model reference
  calibration;
- fix ordinary in-scope TypeScript/path/fixture/serialization/adapter/test defects;
- create one bounded implementation commit and the required reports.

In this initial turn you must keep all of these at zero:

```yaml
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_cost_usd: 0
```

Do not inspect or resolve the credential. Do not perform the Base or Candidate real arm.
After the implementation commit and reports, stop with `READY_FOR_MAIN_PREFLIGHT` and wait
for Main's explicit follow-up in this same top-level Session.

## 4. Frozen implementation boundary

Reuse current code before adding infrastructure:

- Goal 1 public Pi JSONL Session reopen/continue and Session↔Run linkage;
- Goal 1 safe Read Model and explicit Goal 2 comparison placeholder;
- V3 case authority, selective binding, adaptive-Skill loading and Direct Pi runtime;
- existing external Verifier, immutable evidence and comparison primitives;
- existing fixed DeepSeek profile, opaque credential boundary and budget counters.

Do not build a second Eval Runtime, database, generic experiment framework, Router,
Experience Repository, new adaptive authority, new Session subsystem or WebUI.

Only Goal 2-specific source/tests/fixtures/scripts and these reports may change:

- `docs/reports/V3_5_G2_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_5_G2_CLOSEOUT_DRAFT.md`.

Do not modify or stage:

- `AGENTS.md`, `CURRENT_STATE.md`, Charter, formal Contract or governance files;
- accepted V0–V3 reports/fixtures/evidence/State authority;
- pinned Pi or private Pi imports;
- credentials or `.env` files;
- Goal 3/WebUI files.

## 5. Frozen real pair for the later Main follow-up

The later follow-up may authorize only this already accepted pair:

```text
Base once
→ same hidden external Verifier once
→ Candidate with exact adaptive Skill once
→ same hidden external Verifier once
→ persistent comparison/read-model inspection
→ stop
```

It will retain the Contract limits:

- fixed order Base then Candidate;
- exactly two fresh persistent Sessions and byte-identical initial Workspaces;
- only declared Skill binding/wrapper as treatment delta;
- per arm: at most 16 Provider requests, 131072 tokens, 24 Tool calls, USD 0.20;
- whole pair: at most 2 opaque Credential reads, 32 Provider/model requests, USD 0.40;
- no retry, fallback, replacement Case, extra arm or rerun.

Once the first real Provider request occurs, source, fixture, Verifier, Case Authority,
budgets and evidence schema become immutable. This initial turn must not cross that point.

## 6. Verification and reports

The implementation commit must be preceded by:

- exact frozen hash recalculation;
- successful reference calibration with no model access;
- strict TypeScript;
- focused Goal 2 mechanism tests;
- the narrow affected Goal 1/V3 regressions;
- source delta and protected-file checks;
- zero-access counter proof;
- clean pinned Pi proof.

`V3_5_G2_IMPLEMENTATION_REPORT.md` must record exact commands and exit codes, changed
files/symbols, test counts, calibration identity, frozen Case/Skill/profile/budget
digests, zero-access counters, commit SHA and remaining limitations.

`V3_5_G2_CLOSEOUT_DRAFT.md` must remain a draft for Main. It must not accept Goal 2.

## 7. Hard stops

Stop without broadening scope if:

- exact historical Skill/State identity cannot be validated without changing V3;
- answer leakage, Case hunting, an extra treatment path or a new Eval Runtime is needed;
- Base/Candidate fairness or persistent inspectability cannot be enforced;
- Verifier behavior exceeds the frozen prompt contract;
- Credential/budget/unknown usage/identity/lineage/evidence cannot fail closed;
- Pi patch/private import or SDK/Extension/RPC route switch becomes necessary;
- an accepted V3 or Goal 1 authority/correctness contract would need to change.

Ordinary bounded implementation defects are not Hard Stops. Fix them in this Session
before any real access.

## 8. Stop point

After creating the bounded implementation commit, return:

- exact commit SHA and changed-file list;
- exact commands, exit codes and test counts;
- zero-access counters;
- source/protected/Pi status;
- Implementation Report and Closeout Draft paths;
- `READY_FOR_MAIN_PREFLIGHT` or a precise Hard Stop.

Then stop. Do not self-authorize real execution, edit control state, enter Goal 3 or claim
Goal 2/V3.5 acceptance.
