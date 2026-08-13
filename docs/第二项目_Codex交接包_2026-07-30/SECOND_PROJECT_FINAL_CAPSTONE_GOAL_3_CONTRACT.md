# Final Capstone Goal 3 Contract — One Real Closed-loop Product Acceptance

```yaml
status: accepted_activated_zero_access_implementation_after_correction_1
goal_id: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
parent_version: SECOND_PROJECT_FINAL_CAPSTONE
date: 2026-08-13
main_owner: final_capstone_main_session
implementation_owner: fresh_top_level_goal_3_implementation_session
execution_owner: later_fresh_top_level_goal_3_execution_session
implementation_authority: granted_after_exact_control_baseline
real_execution_authority: withheld_until_candidate_and_mandatory_focused_audit_pass
credential_reads_authorized_for_implementation: 0
external_network_authorized_for_implementation: false
external_provider_or_model_calls_authorized_for_implementation: 0
pi_changes_authorized: false
git_commit_authority_for_working_sessions: false
correction_rounds_max_for_implementation_integration: 2
correction_rounds_used: 1
real_acceptance_runs_max: 1
retry_fallback_replacement_task_swap_result_hunting_authorized: false
```

## 1. Objective and accepted claim

Complete exactly one inspectable product closure through the accepted V3, Goal 1, Goal 2
and V3.6 authority surfaces:

```text
accepted prior Evidence
  -> Goal 1 admission
  -> existing V3 Candidate
  -> Goal 2 applicability-scoped Regression Gate
  -> existing V3 Promote authority
  -> V3 State effective binding
  -> exactly one real V3.6 bounded-edit Coding Run
  -> independent Verifier + Trace/Manifest + ChangeSet/Handoff
  -> new Goal 1 admission
  -> Goal 2 State assessment
```

The one real result may validly close as either `retain` or `needs_reassessment`. The
accepted claim is one identity-frozen acceptance carrier completing this chain once. It is
not evidence for arbitrary V3.6 tasks, general model quality, a generic Verified Task
platform, State causality, or statistical policy effectiveness.

The binding principles remain:

- **Agent proposes; Harness disposes.** The Agent may edit only the managed Workspace.
- Admission, regression selection, validation, promotion, formal Outcome, assessment,
  rollback, active-pointer mutation and Source Apply remain Harness/Host authority.
- Ordinary V3.6 free input remains `unverified`, with null formal Outcome and false
  comparison/adaptation/promotion eligibility.
- The V3.6 product result is wrapped by the already accepted V3 Goal 3 bound-State
  follow-up envelope; Goal 1 continues to admit the existing
  `v3g3_bound_state_followup` family. Goal 3 must not add a fourth Goal 1 family or a
  generic adapter registry.

## 2. Authoritative inputs and Gate A

The implementation Session must read, in order:

1. `CURRENT_STATE.md` from the exact Goal 3 Control Baseline;
2. `SECOND_PROJECT_FINAL_CAPSTONE_VERSION_CHARTER.md`;
3. this Contract;
4. `docs/reports/SECOND_PROJECT_FINAL_CAPABILITY_GAP_REVIEW_GOAL_AMENDMENT.md`;
5. `docs/reports/FINAL_CAPSTONE_CORRECTION_BUDGET_AMENDMENT.md`;
6. the accepted Goal 1 Contract and Closeout;
7. the accepted Goal 2 Contract and Closeout;
8. the source and tests cited by sections 4 and 5.

Before editing, Gate A must record:

- exact Main Control Baseline commit/tree and clean tracked/staged status;
- Contract and Charter hashes at that baseline;
- pinned Pi commit `027a5847901b5dde30270abaa1041046cd2b4b55` and clean state in both
  canonical local Pi checkouts;
- every pre-existing untracked file without modifying or adopting it;
- public emitted Pi import/type resolution from existing local dependencies;
- frozen task, Workspace, prompt, Verifier, command, provider, budget and Docker identities
  from section 3; and
- Credential/network/external Provider/model/real-model counters all zero.

Implementation stops before source work if the exact Control Baseline, User activation or
identity values are absent. It must not read credentials merely to prove a zero counter.

## 3. The sole frozen acceptance carrier

### 3.1 Task and source identities

Goal 3 reuses the accepted V1 `parse-duration` TypeScript fixture only. No new task family
or alternate task may be created.

```yaml
acceptance_task_id: final-capstone-g3-v1-parse-duration
task_kind: typescript-maintenance
failure_family: verifier-failure
adaptation_eligibility: host_granted_for_this_exact_acceptance_carrier_only
task_source_ref: fixtures/tasks/v1/parse-duration/task.json
task_source_file_sha256: d2c7c3b085b351ce868ca2a6706f103f07a037e1320ab1bd1702d988a0f09cec
original_task_object_digest: 164923ab6f289879be84f59a2b28e51bcdcea9287a595b7b51bc4ca6e8acbe9a
instruction_ref: fixtures/tasks/v1/parse-duration/instruction.md
task_input_sha256: cc4c17609f1031774e4be4bc0cc9d8afff671a11f019b2515c304d9a4a1be262
workspace_source_ref: fixtures/tasks/v1/parse-duration/workspace
workspace_source_tree_digest: 5690aab9c1e7eb3905258c342d7bad4504e23377c18fec9fde39f22f9a99defa
writable_paths:
  - src/subject.ts
protected_paths:
  - package.json
  - test/public.test.mjs
external_verifier_id: v1-parse-duration-verifier
external_verifier_ref: fixtures/verifiers/v1/parse-duration.mjs
external_verifier_source_sha256: 0924cb0f56e43a56dc74b262539f2ad0700b2cb2a43da26a9415b7e9ffaf21da
verifier_workspace_environment_key: V1_WORKSPACE
```

The exact task input is the current instruction bytes: repair `src/subject.ts` so
`parseDuration` accepts non-negative integer values suffixed by `ms` or `s`, returns
milliseconds, rejects malformed input, preserves the export and runs the declared check.
The Agent may not alter this task, its Workspace source, Verifier, applicability or
adaptation eligibility.

### 3.2 Acceptance command identity

The acceptance carrier derives one narrow `TaskSpecV0B` from the frozen source fixture.
Its canonical digest is frozen here:

```yaml
acceptance_task_spec_digest: 58cc5ff437714996ae2312868bf182618e964a9e3cdf780e16d429d524ca661d
tool_profile_id: v3g3_bounded_local
tool_profile_digest: 76464e44b6c39c0afd5a54ce09b6a12498a084f022a7003315ab0f323b135fcb
commands:
  - command_id: test
    executable: current_node_executable
    argv: [--test]
    cwd: workspace
    timeout_seconds: 30
    max_combined_output_bytes: 65536
registered_command_descriptor_digest: 2740096afc07d6532f205675eb59f3c9f47c569b4204596c04ba049c458c0c29
```

This TaskSpec `tool_profile_id` is the already accepted outer V3 Goal 3 Case Authority
identity. Its digest domain is the complete existing V1 task object with only `task_id`,
`tool_profile_id` and `command_descriptors` replaced by the values frozen above.

The inner V3.6 Project Profile remains separately registered with the accepted frozen
Docker execution-backend identity and exposes only this command under
`command_execution_authority: docker_registered_only`. The outer TaskSpec profile ID and
inner V3.6 command-authority label are different authority-plane fields and must not be
made equal or translated by caller data. Shell, arbitrary command, dependency
installation, additional test commands, network tools and out-of-Workspace paths are not
registered.

### 3.3 Provider, budget and execution backend

```yaml
provider_kind: deepseek_real
provider_id: deepseek
model_id: deepseek-v4-flash
provider_profile_digest: 6b90b83a047ce7745fc92a6f1ef99dd7f7ea6e046a5107e060f4b041e864cf32
provider_fallbacks: []
budget_profile_id: v3g3-fixed-one-run-v1
budget_profile_digest: 6b20b55e7930b193b7975c15668bba883961c9d3976e9d200b45cfd69d96be21
provider_requests_max: 16
combined_tokens_max: 131072
tool_calls_max: 24
cost_usd_max: 0.20
wall_time_ms_max: 900000
docker_profile_digest: f31414d3a8aa288337f0b5ba2a1d976b7cb8c49b7935633e838fcbe4c2a96b05
docker_image: node@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03
docker_network: none
docker_root_filesystem: read_only
```

The only external network is the fixed Provider/model route during the later real
Execution Session. Project commands remain in the frozen network-none Docker backend.
There is no retry, fallback, replacement Run, replacement task or same-Run continuation
after terminalization.

### 3.4 Applicability and regression identity

The Host-frozen applicability is exactly
`typescript-maintenance` / `verifier-failure`. It must select the already accepted Goal 2
pack for that exact context: one ordered `protected-stability` regression check. Caller or
Agent text cannot omit, add, reorder or replace pack membership.

The prior evidence used to construct the Candidate must be a legitimate, Inspector-valid
Goal 1 admission produced from the accepted fixed negative Goal 1 registration. Ignored
evidence from rejected or correction Sessions must not be adopted. All preparatory evidence
is deterministic and zero-call.

## 4. Required authority composition

### 4.1 Prior evidence through promotion

The implementation must compose existing public Goal 1 and Goal 2 authority rather than
recreate it:

1. source-generate and inspect the fixed prior Goal 1 negative admission;
2. use the existing V3 projector/producer to create the Candidate;
3. select the exact Goal 2 applicability pack from Host authority;
4. validate source Case plus selected regression checks;
5. publish only through the existing V3 decision/store/CAS pointer authority; and
6. freeze the promoted State version and effective binding before any real dispatch.

No direct State creation, direct pointer write, shortcut supersede or alternate promotion
decision is permitted.

### 4.2 V3 binding into the real V3.6 product

The real acceptance must use `InteractiveControlPlaneV36` and its accepted persistent
bounded-edit Session, managed Workspace, registered command, Docker executor, Runtime
Manifest, ChangeSet and Handoff authority.

The V3 binding identity is frozen at Run start in the V3.6 `SessionPinV36`, supplied as the
actual effective system treatment to the V3.6 dispatch, and linked into:

- the V3 binding record and accepted V3 Goal 3 Run envelope;
- the V3.6 Session pin and interactive authority;
- the actual provider-observed prompt/payload identity;
- the V3.6 Runtime Manifest and terminal evidence;
- the outer V3 runtime/Manifest projection;
- the independent Verifier result;
- the ChangeSet and Host Handoff receipt; and
- the final Goal 1 admission and Goal 2 assessment.

A narrow injected `Goal3ExecutionPortV3` may adapt the existing V3.6 bounded-edit result
into the existing `executeGoal3RunV3` envelope. The adapter must project only recorded V3.6
facts and must be independently recomputable. It may not fabricate settled state, access
counters, prompt observation, tool identities, usage, cost, terminalization or formal
Outcome. The V3.6 inner authority remains ordinary `unverified`/null/false; formal Outcome
for this carrier comes only from the frozen external Verifier in the outer accepted V3
envelope.

### 4.3 Independent Verifier and ChangeSet handoff

After the one V3.6 Run settles, execute the frozen external Verifier once against the same
managed Workspace. Agent text, UI state, a successful public command or the existence of a
ChangeSet cannot substitute for that Verifier.

The Host then freezes the ChangeSet and one explicit Handoff. For this acceptance carrier,
the deterministic default is `discard` after Verifier/evidence capture so the registered
source fixture remains unchanged. `Apply` is neither required nor proof of correctness and
must not be silently inferred. The Handoff choice and receipt are lineage evidence, not
formal Outcome.

### 4.4 New admission and legal assessment

The outer V3 Run is admitted through the accepted Goal 1
`v3g3_bound_state_followup` family. The resulting admission must preserve V3.6 Session,
Runtime Manifest and ChangeSet/Handoff links in the Final Capstone Goal 3 lineage artifact.

Goal 2 then computes exactly one assessment from the admitted evidence:

- external Verifier PASS -> `retain`, with no State, pointer, Workspace or Source mutation;
- external Verifier FAIL or other valid non-attributable negative ->
  `needs_reassessment`, with no State, pointer, Workspace or Source mutation.

This single carrier cannot establish the frozen fair two-arm comparison required for real
`rollback`; no rollback result may be manufactured or hunted. Goal 2's deterministic
rollback authority and negative gates remain regression-tested.

## 5. Bounded implementation surface

The implementation Session may create only:

- `workbench/src/contracts/final-capstone-g3-types.ts`;
- `workbench/src/final-capstone-g3.ts`;
- `workbench/src/pi/final-capstone-g3-v36-port.ts`;
- `workbench/src/inspect-final-capstone-g3.ts`;
- `workbench/tests/final-capstone-g3-closed-loop.test.ts`;
- ignored deterministic evidence under `.runs/final-capstone/g3/`;
- `docs/reports/FINAL_CAPSTONE_G3_IMPLEMENTATION_REPORT.md`; and
- `docs/reports/FINAL_CAPSTONE_G3_CLOSEOUT_DRAFT.md`.

The new orchestrator may import existing public symbols from Goal 1, Goal 2, V3 and V3.6.
It must not edit those accepted-core modules. If an existing source or contract type
appears to require any change—including `run-v3.ts`, `inspect-v3.ts`, Goal 1/2 source,
V3 store/binding, V3.6 authority/session/runtime/Docker/ChangeSet source, or fixed provider
source—the Session stops and returns the exact file, symbol and reason to Main. Main must
decide whether this Contract needs amendment; the Session cannot expand its allowlist.

The existing frozen V1 task, Workspace and Verifier are read-only inputs. New tracked task
fixtures, task copies, verifier copies, profiles, registries or product abstractions are
forbidden.

## 6. Forbidden implementation and execution work

- no edits to `CURRENT_STATE.md`, `AGENTS.md`, Charter, Contracts, accepted Closeouts,
  accepted reports, historical evidence, source fixtures or active State roots;
- no fourth Goal 1 source family, Goal 1 generic adapter, Goal 2 applicability DSL, new
  Candidate generator, new State store, new promotion/rollback authority or direct pointer;
- no upgrade of ordinary V3.6 free input to verified/eligible and no weakening of its
  unverified/null/false semantics;
- no generic Verified Task/Verifier framework, hidden-test generation, LLM judge,
  automatic Recovery, Experience DB, mining/clustering, continual loop or Multi-Agent;
- no dependency install, Pi edit/private import, SDK/Extension/RPC switch, second execution
  backend, WebUI/CLI expansion, database, container platform or V4;
- no real access during implementation, deterministic test, Main integration or focused
  pre-execution audit;
- no Git staging, commit, control-state edit or Goal acceptance by either Working Session;
- no source, test, fixture, task, Verifier, Manifest, State, control-state, staging or commit
  authority in the later real Execution Session; and
- no rerun, fallback, replacement, task swap, result hunting or failure manufacture.

## 7. Required deterministic tests and gates

### Gate B — Complete zero-call chain

Using a deterministic/Faux V3.6 dispatch, prove the exact frozen prior admission ->
Candidate -> exact pack -> validation -> promotion -> effective binding -> V3.6 product
Run -> independent Verifier -> ChangeSet/Handoff -> new Goal 1 admission -> Goal 2
assessment chain. Inspector recomputation must succeed after process reopen.

At minimum prove both valid terminal outcomes without real calls:

- Verifier PASS maps to `retain` and performs no assessment mutation; and
- Verifier FAIL maps to `needs_reassessment`, never `rollback`, and performs no assessment
  mutation.

The test must assert exactly one inner V3.6 bounded-edit Run, one outer V3 envelope, one
Verifier, one Handoff, one new admission and one assessment.

### Gate C — Authority, identity and lineage negatives

Reject or fail closed on at least:

- task, input, Workspace source, Verifier source, command/tool profile, provider/model,
  budget, Docker profile, applicability or eligibility drift;
- caller-selected regression membership/result, caller-selected formal Outcome or
  caller-selected assessment;
- State/version/binding drift, stale active pointer, SessionPin drift, late binding swap or
  provider-observed prompt mismatch;
- V3.6 authority/Session/Runtime Manifest/terminal/usage/tool/Docker/Workspace identity
  tamper or incomplete terminalization;
- outer V3 binding/runtime/Manifest/Verifier drift or inconsistent projection of inner
  V3.6 facts;
- source-root escape, reparse point/symlink/junction, prohibited hardlink, cross-project
  identity, unknown key, digest tamper or conflicting write-once identity;
- missing, altered, duplicate or extra Verifier/Run/Handoff/admission/assessment;
- ChangeSet or Handoff used as Verifier substitute; Apply/Discard receipt drift;
- direct supersede, direct pointer mutation, ordinary failure -> rollback, ambiguous
  attribution -> rollback or new evidence -> direct replacement; and
- any second Run, rerun, task swap, fallback, replacement or manufactured-failure request.

### Gate D — Preserved product semantics

- the exact registered acceptance task alone receives the outer formal Verifier/Outcome;
- an ordinary free-input V3.6 Run remains unverified/null/false even if settled and carrying
  Trace or ChangeSet;
- V3.6 Source Apply remains explicit Host authority and is not invoked by the acceptance
  orchestrator;
- `retain` and `needs_reassessment` leave active State, State tree, pointer, Source fixture
  and registered Workspace source unchanged; and
- existing deterministic Goal 2 rollback and replacement-path tests continue to pass.

### Gate E — Required verification commands

Run the narrowest exact commands from the Main worktree with existing local dependencies:

```powershell
node 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.json --noEmit
node --test tests/final-capstone-g3-closed-loop.test.ts
node --test tests/final-capstone-g2-regression-state-feedback.test.ts
node --test tests/final-capstone-g1-evidence-admission.test.ts
node --test tests/v3g1-evidence-to-candidate.test.ts
node --test tests/v3g2-validate-promote-reject-rollback.test.ts
node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts
node --test tests/v36g1-deterministic.test.ts tests/v36g2-product-entry.test.ts tests/v36g2-docker-executor.test.ts tests/v36g2-interactive-authority.test.ts tests/v36g2-interactive-bounded-edit.test.ts tests/v36g2-change-set.test.ts tests/v36g2-change-handoff.test.ts
```

If a named V3.6 test path differs at the frozen Control Baseline, the Session reports the
exact existing closest affected suite and Main decides the literal replacement; it must not
silently broaden to the full repository suite or install dependencies.

## 8. Main review, Candidate and mandatory pre-execution audit

The implementation Session returns only its bounded delta, raw deterministic evidence,
Implementation Report and Closeout Draft. Main independently reviews all source and
identities, runs required tests, integrates only through `apply_patch`, and alone creates
the Candidate commit.

Because this Goal crosses binding, external dispatch, runtime evidence, Verifier,
ChangeSet/Handoff, admission and assessment authority, a fresh focused independent Audit
Session of the frozen Candidate is mandatory before any real access. It may inspect source,
run deterministic tests and write an audit report. It may not repair source, access real
credentials/network/provider/model, edit control state, create a commit or accept the Goal.

Audit scope must cover:

- exact task/profile/budget/Verifier identities and no alternate carrier;
- actual V3 State effective binding into the provider-observed V3.6 path;
- honest inner V3.6 -> outer V3 evidence projection without authority upgrade;
- single-Run enforcement, pre-dispatch reservation and terminalization;
- independent Verifier and ChangeSet/Handoff separation;
- Goal 1 existing-family admission and Goal 2 legal assessment/no-mutation; and
- Inspector recomputation and all fail-closed integrity boundaries.

Only after Main accepts the audit may Main create the audited Execution Baseline and issue
the exact immutable Execution Session prompt.

## 9. Correction budget and structural stop rule

The accepted `FINAL_CAPSTONE_CORRECTION_BUDGET_AMENDMENT.md` is binding. Goal 3 has at
most two implementation/integration correction rounds. One round is exactly:

```text
one concrete Main finding set
  -> one bounded correction by the original implementation Session
  -> required tests/regressions
  -> one Main re-review
```

Main bundles one concrete finding set and must not split a finding into micro-findings to
evade the budget. A fresh audit or hit-specific re-audit may follow Main re-review but does
not itself create a correction round.

If the same class of authority or integrity defect recurs after correction, stop
immediately with `DECISION_REQUIRED` as a possible structural design defect. If the second
round still cannot reach the required acceptance, stop with `DECISION_REQUIRED`.
Platform safety review, usage-limit interruption, sandbox/tool interruption and execution
faults do not consume a correction round.

Correction authority never expands the single-real-Run budget. No correction may alter,
rerun or replace an already started real acceptance task to obtain a preferred result.

Correction round 1 is consumed by the Main finding set recorded in
`docs/reports/FINAL_CAPSTONE_G3_CORRECTION_1_AUTHORIZATION.md`: the initial frozen
TaskSpec incorrectly used the inner V3.6 registration label where accepted outer V3 Case
Authority requires `v3g3_bounded_local`. The correction changes only that Contract field,
its complete-task-object digest and the explanatory authority-plane separation. No source,
test, fixture, State, evidence or real access changed. One correction round remains; any
recurrence of this tool-profile authority-class defect returns `DECISION_REQUIRED`.

## 10. Frozen real Execution Session protocol

After the audited Execution Baseline, Main starts one fresh top-level Execution Session.
That Session reads the frozen prompt and baseline, performs preflight without source edits,
and is authorized for only:

- at most one opaque Credential read for the fixed DeepSeek route;
- the fixed Provider/model route within section 3 caps;
- exactly one pre-registered acceptance task and one real V3.6 Run;
- the registered network-none Docker command(s) within the fixed profile;
- the independent frozen Verifier once;
- creation of ignored immutable run evidence and its Execution Report; and
- the already implemented Host orchestration needed to freeze ChangeSet/Handoff, new Goal
  1 admission and Goal 2 assessment.

Before first provider dispatch, Gate R must verify exact Git commit/tree, tracked/staged
cleanliness, allowed pre-existing untracked files, task/profile/digest identities, State
active pointer, binding, SessionPin, Docker image identity/readiness, cost/budget
reservations, evidence roots absent or write-once-compatible, and zero prior dispatches.

The unique real Run is consumed once the first external Provider dispatch begins. A
pre-dispatch platform/safety/tool failure with zero Provider dispatch does not consume a
correction round, but Main must inspect its immutable evidence before deciding whether the
same frozen Run may start. If any external Provider dispatch occurred, the single-real-Run
rule controls: preserve the result and do not rerun, replace the task or manufacture a new
failure. Any proposal for another real dispatch returns `DECISION_REQUIRED`.

The Session stops at the first terminal product result, budget stop, integrity stop or
execution fault and reports facts without relabeling. It cannot repair source or evidence.

## 11. Post-run focused review and final acceptance

Main independently re-runs the frozen Inspectors and verifies tracked source, task fixture,
State source, registered Source, and both Pi checkouts remained unchanged. A fresh focused
lineage/authority reviewer must inspect the real evidence before final acceptance; this
review is read-only apart from its report and cannot trigger another real Run.

The final Goal 3 Closeout must record:

- exact Control, Candidate, audited Execution Baseline and final control identities;
- exact real task/profile/budget/State/binding/Session/Run/Verifier/ChangeSet/Handoff,
  admission and assessment identities;
- exact commands, exits and test counts;
- actual access counters, usage, cost, terminal reason and whether the unique Run was
  consumed;
- whether the legal result was `retain` or `needs_reassessment` and why;
- all correction rounds used, finding classes and whether any recurrence occurred;
- what remains unverified and every bounded claim limitation; and
- a truthful `CURRENT_STATE.md` update proposal.

Main may recommend only:

- `PASS_FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE` when the full chain and
  lineage pass; or
- a precise non-PASS/`DECISION_REQUIRED` result when an acceptance gate fails.

Goal 3 acceptance requires User acceptance of the Closeout. Final Capstone closes only
after Main writes the final aggregate Closeout and the User accepts it.

## 12. Stop conditions

Return `DECISION_REQUIRED` instead of expanding scope if completion requires any of:

- a fourth Goal 1 family, generic adapter/Verifier/task framework or alternate task;
- change to accepted Goal 1/Goal 2/V3/V3.6 authority or ordinary free-input semantics;
- direct State creation, direct pointer mutation, shortcut supersede or weaker rollback
  attribution;
- a new Runtime/Agent loop, provider/model, execution backend, Pi change/private import or
  dependency installation;
- a third correction round or recurrence of the same authority/integrity defect class;
- a second real Run, rerun after any Provider dispatch, fallback, replacement, task swap,
  result hunting or manufactured failure; or
- any evidence-integrity ambiguity that cannot be resolved from immutable local evidence.

When Goal 3 and the aggregate Final Capstone satisfy their accepted Definitions of Done:

# STOP CORE FEATURE DEVELOPMENT

Do not add a second task family, broader verification, statistical Pilot, generalized
Recovery, Experience system, autonomous improvement cycle or new Agent platform version.
