# V1 Skill / Runtime Comparison — Bounded Precontract Research Start Prompt

```yaml
status: research_authorized
date: 2026-07-31
session_role: dedicated_read_only_precontract_research_session
active_goal_created: false
V1_contract_creation_authorized: false
V1_activation_authorized: false
implementation_authorized: false
real_model_calls_authorized: 0
external_network_authorized: false
dependency_install_authorized: false
pi_core_patch_authorized: false
git_commit_authorized: false
tracked_deliverables:
  - docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH.md
```

## 1. Role and stopping point

You are the dedicated read-only V1 Precontract Research Session for:

```text
Agent Harness Reliability Workbench
```

You are not the Main Session, implementation owner, audit owner, or user-
acceptance owner. Your report is advisory. The Main Session will verify cited
source paths and decide whether to accept, narrow, reject, or request revision.

Complete one bounded report and stop. Do not create a V1 Contract, activate a
Goal, implement source, execute a model, or make architecture acceptance
decisions.

## 2. Current fact baseline

Before research, verify rather than assume:

```yaml
expected_root_HEAD: 62a2c962e896d3f406dec43d260daeaa6904da0c
expected_project_phase: v0_completed
expected_project_status: V0_C_CLOSED_ACCEPTED
expected_active_goal: null
expected_next_goal:
  id: V1_SKILL_RUNTIME_COMPARISON
  status: candidate_not_authorized
expected_pi_HEAD: 027a5847901b5dde30270abaa1041046cd2b4b55
```

The shared checkout currently contains a Main-Session small governance sync
that is intentionally uncommitted:

```text
M docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md
M workbench/README.md
M workbench/package.json
?? reference/
```

Treat these as registered pre-existing state. Do not modify, stage, revert,
delete, or commit them. `reference/` is user-provided read-only material.

V0 facts that remain binding:

- V0-A, V0-B, and V0-C are closed and accepted;
- V0-C disposition is `PASS_V0_C_USER_ACCEPTANCE`;
- V0-C Implementation Baseline is
  `12db75aaea4db4afb774046cfcc94de772a2e90b`;
- the accepted real Run is
  `run-c3297fc5-bfd1-4bd1-b46c-3a636271a177`;
- that Run passed its initial Verifier, so real Recovery remains unobserved;
- V0 does not prove Completion Policy effectiveness;
- V1 must preserve Skill-only as a genuine competitor;
- V2 bounded multi-path recovery remains the Portfolio North Star, not this
  research scope.

## 3. Mandatory reading order

Read completely, in this order:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. every file listed by `CURRENT_STATE.md` under `required_reading`;
4. the V1 sections of
   `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md`;
5. the V1 and Portfolio sections of
   `docs/第二项目_Codex交接包_2026-07-30/02_第二项目完整版本化路径规划.md`;
6. `docs/第二项目_Codex交接包_2026-07-30/ROADMAP_RECONCILIATION_REPORT.md`;
7. `workbench/README.md`, `workbench/package.json`, and the relevant tracked
   Workbench source/tests;
8. `docs/reports/CC_HARNESS_PATTERN_MAP.md`;
9. `docs/reports/PI_CC_HARNESS_COMPARISON_MATRIX.md`;
10. the relevant Skill, Context, Tool, Completion, Trace, and Eval material
    under `reference/cc-harness-knowledge/`.

Before entering `.upstream/pi`, read every applicable Pi `AGENTS.md`
completely. More deeply nested instructions take precedence.

Use `reference/src/` only when the knowledge notes are insufficient and a
concrete mature-Harness implementation detail could change the recommendation.
Its version and license provenance remain unverified; do not copy code or treat
it as proof of Pi behavior.

## 4. Authority and evidence rules

Use this priority:

```text
pinned local source / tests / actual recorded commands
→ CURRENT_STATE / accepted Closeout / accepted ADR
→ accepted Charter and route documents
→ local Harness references
→ your inference
```

Label material conclusions as:

```text
Fact
Inference
Recommendation
Unconfirmed
```

Every Pi behavior claim must cite the pinned local path, symbol, and relevant
test. Every Workbench behavior claim must cite the tracked path, symbol, test,
or accepted V0 evidence. README text alone is not proof.

## 5. Research mission

Produce enough evidence for the Main Session to decide the bounded V1 shape
without implementing it. Answer the following questions.

### RQ1 — Pi Skill public path

Determine, from pinned Pi source and tests:

- how `SKILL.md` discovery, metadata parsing, body loading, deduplication, and
  relative-path handling work;
- what is exported from the emitted public package;
- how visible Skill metadata enters the system prompt;
- how `AgentHarness.skill(...)` or another public entry causes the body to enter
  a turn;
- what additional turn, message, token, Session, or model-call effects explicit
  Skill invocation creates;
- whether a project-owned Reliability Skill can be supplied through public
  APIs without Pi Core patch, private import, or `pi-coding-agent` application
  dependency;
- which host responsibilities remain outside Pi;
- whether dynamic tests are necessary later, and the smallest deterministic
  test that would prove the chosen route.

Do not assume that “Skill-only” means silently concatenating text into the base
system prompt. Compare at least:

```text
Pi-native visible Skill + explicit invocation
vs
project-owned prompt overlay with separate skill identity
```

Recommend the fairest and most reproducible interpretation for V1, including
how its additional tokens/turns should be budgeted.

### RQ2 — Fair treatment decomposition

The accepted V1 comparison must retain:

```text
A. Baseline
B. Skill-only
C. Skill + External Verifier / Runtime Control
```

Resolve an important ambiguity:

- the same external Verifier/Outcome contract is required to score all arms;
- only the Runtime-Control arm may consume a failed Verifier result as an
  intervention and optionally issue one bounded Recovery Attempt.

Distinguish:

```text
measurement verifier
intervention/completion gate
recovery action
```

Assess whether the cleanest analysis is:

```text
A  Baseline
B  Skill-only
C1 Skill + measurement verifier + completion decision, no recovery
C2 only eligible C1 failures receive one bounded recovery
```

or whether another bounded design identifies the incremental effects more
cleanly. Preserve the accepted three-route product story; do not expand into a
large factorial experiment.

For every recommended arm, freeze what must be identical:

- Task/source state;
- model/provider/thinking;
- base system prompt;
- Tool Profile and permissions;
- Workspace construction;
- measurement Verifier;
- initial budgets;
- Pi and Workbench revision;
- termination and invalid-run rules.

Identify the single intended treatment difference and all unavoidable
differences, including Skill invocation tokens or turns.

### RQ3 — V0-to-V1 product-surface gap

Inspect the accepted V0 implementation and evidence to determine:

- which current `strategy_id`, `skill_refs`, `completion_policy_id`,
  Attempt-lineage, Outcome, Journal, budget, and evidence fields already support
  V1 without schema changes;
- whether a comparison-group or experiment identity is actually needed, and
  the minimum non-pair-specific form;
- how multiple independent Runs should be aggregated without changing Run
  identity;
- which existing code paths still assume Faux, a single task, V0-C, or one
  UAT-local composition;
- how the accepted Stage 2 real Provider was injected through the external
  execution-dependency seam;
- whether repeated V1 trials require a minimal tracked provider composition,
  and if so what the smallest bounded boundary is.

Do not propose a general provider registry, credential platform, dashboard,
database, distributed runner, or Eval SaaS.

### RQ4 — Reliability Skill candidate

Do not write the production Skill. Define a candidate specification:

- target failure modes;
- exact behavioral instructions;
- what must remain outside the Skill;
- identity/digest and source provenance;
- context/token cost;
- visibility and invocation rule;
- forbidden claims;
- how to prevent the Skill from seeing or editing Verifier, tests, acceptance
  criteria, or protected paths;
- how the same Skill artifact is held constant between B and C.

Use mature Harness notes for invariants, not Claude Code feature parity.

### RQ5 — Bounded Pilot design

Recommend a small V1 Pilot that can produce useful evidence without pretending
to be a benchmark or paper-level statistical proof:

- task families and inclusion/exclusion rules;
- calibration that avoids both trivial always-pass tasks and artificial
  sabotage designed only to force Recovery;
- task count, trial count, ordering/randomization or pairing;
- handling of model nondeterminism;
- metrics and denominators;
- invalid Run and infrastructure-failure treatment;
- request, Tool, token, wall-time, cost, and Recovery budgets;
- early-stop and pause rules;
- allowable claims for positive, negative, or inconclusive results.

Use accepted V0/G005/G006 cost and run evidence where relevant. Do not call a
model or access credentials.

### RQ6 — Goal decomposition

Recommend one to three bounded V1 execution Goals. Evaluate this candidate
decomposition rather than accepting it automatically:

```text
V1-A  deterministic Skill path + fair experiment substrate, zero real calls
V1-B  bounded real Baseline / Skill-only / Runtime-Control pilot
optional V1-C only if a separately justified aggregation or repeat gate is
needed
```

For each recommended Goal identify:

- single decision or capability;
- owner Session;
- allowed writes;
- model/network budget;
- evidence and DoD;
- audit trigger;
- pause conditions;
- what remains for V2.

Keep V1 lean enough that it does not displace V2 as Portfolio North Star.

## 6. Required deliverable

Create only:

```text
docs/reports/V1_SKILL_RUNTIME_COMPARISON_PRECONTRACT_RESEARCH.md
```

The report must contain:

1. Executive recommendation;
2. verified repository/Pi/V0 baseline;
3. Pi Skill public-path source map;
4. mature Skill pattern versus Pi behavior;
5. V0-to-V1 product-surface delta;
6. fair treatment and verifier decomposition;
7. candidate Reliability Skill specification;
8. bounded task/Pilot design;
9. metrics, denominators, budgets, and result interpretation;
10. proposed V1 Goal decomposition;
11. explicit non-goals;
12. risks and pause conditions;
13. shortest user learning path:
    `Entry → Core Symbol → Skill Context → Session/Event → Workbench Boundary → Test`;
14. Contract-drafting inputs;
15. unresolved user decisions using:

```yaml
user_decisions_required:
  decision:
  evidence:
  options:
  recommendation:
  consequence:
```

Include a final recommendation choosing one of:

```text
READY_FOR_V1_CONTRACT_DRAFTING
READY_WITH_BINDING_CORRECTIONS
MORE_BOUNDED_RESEARCH_REQUIRED
V1_ROUTE_BLOCKED
```

## 7. Prohibited actions

Do not:

- modify any existing tracked or untracked file;
- modify `CURRENT_STATE.md`, `AGENTS.md`, `09_...md`, Charter, ADR, Contract,
  Closeout, Workbench source/tests, fixtures, `.runs/`, or reference material;
- create a V1 Goal Contract or mark V1 active;
- run a real model, inspect credentials, use external network, or download
  anything;
- install dependencies or rebuild Pi;
- modify Pi, use private imports, add an SDK/RPC fallback, or enter WSL;
- create task fixtures, Skill files, source code, tests, runtime artifacts,
  commits, branches, or staging changes;
- claim Runtime Control is better than Skill-only before evidence;
- turn V1 into V2 multi-path recovery, V3 Experience, a Skill platform, or a
  general Eval system.

Read-only commands such as `rg`, `Get-Content`, `git status`, `git show`, and
source/test inspection are allowed. Do not run broad tests; if a dynamic check
would materially change the recommendation, specify it as a future Contract
Gate instead of running it now.

## 8. Pause conditions

Stop research and write the observed blocker into the single report if:

1. root HEAD, V0 closeout, or pinned Pi identity differs from the expected
   baseline in a way not explained by registered Main-Session changes;
2. Pi Skill evidence cannot be established without modifying/rebuilding Pi;
3. a credible Skill-only route appears to require Pi Core patch or private
   imports;
4. V1 fairness requires changing Verifier, Task acceptance criteria, or
   protected files between arms;
5. a recommendation requires credentials, real calls, external downloads, or
   a general platform;
6. an unrelated process changes shared tracked files during research;
7. the accepted three-route V1 comparison cannot answer a bounded decision
   without materially entering V2.

## 9. Completion response

Return:

- report path;
- final recommendation;
- most important verified Pi Skill finding;
- recommended V1 Goal count;
- unresolved Main-Session/user decisions;
- exact files changed;
- confirmation of zero model calls, zero network, zero Pi changes, zero
  commits, and preservation of the registered pre-existing shared changes.

Then stop and wait for Main Session review.
