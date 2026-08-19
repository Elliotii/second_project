# V3.7 Goal 2 Implementation Prompt

```yaml
prompt_id: V3_7_G2_RUNTIME_EFFECTIVE_STATE_FOLLOW_UP_BRIDGE_IMPLEMENTATION
status: AUTHORIZED_FOR_FRESH_DEDICATED_IMPLEMENTATION_SESSION
date: 2026-08-20
authoritative_repository: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
authoritative_branch_at_freeze: codex/v2-b-bounded-r2
accepted_charter: V3_7_CHARTER.md
accepted_amendment: V3_7_G2_EXECUTION_PROFILE_AUTHORITY_AMENDMENT.md
amendment_baseline_commit: 5ea651e7f71d75101fe717e01c5c3b41dea574d1
amendment_baseline_tree: 21d7e29ecbe246d6b2d62f5ae92e5299c193cb3f
implementation_starting_commit: RESOLVED_BY_MAIN_DISPATCH
implementation_owner: fresh_dedicated_Goal_2_Implementation_Session
architecture_and_acceptance_owner: V3_7_Main_Session
candidate_commits_authorized: 1
ordinary_correction_budget: 2
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_product_runs: 0
goal_3_authority: false
```

## 1. Mission and stop point

Implement Charter Goal 2 Bridge 2A and 2B as one deterministic candidate:

1. load the accepted Goal 1 workflow and same V3 State scope;
2. load one fixed Host-registered follow-up execution profile through the Amendment;
3. inspect and freeze the applicable promoted prompt-addendum State before dispatch;
4. persist a pre-dispatch binding/plan and recheck the active pointer immediately before
   the first Provider dispatch;
5. deliver the exact composed system prompt to the real production
   `PersistentInteractiveSessionServiceV36.executeBoundedTurn` seam using only the faux
   Provider and a local registered command executor;
6. persist and inspect application-layer runtime observation, terminal, formal frozen
   Verifier and formal Outcome;
7. persist the follow-up Evidence Body, distinct second confirmation/request and the
   independent `v37_registered_bound_state_followup` G1 admission;
8. normalize old and new admitted sources into `CanonicalBoundStateAssessmentInputG2`
   while leaving retain/reassessment/strict rollback/no-direct-supersede decisions
   unchanged.

Create one candidate implementation commit plus reports, then stop for Main preliminary
review. Do not audit, accept Goal 2, start Goal 3 or perform real execution.

## 2. Starting authority and immutable dependencies

- Start only from the Main dispatch commit descended from Amendment baseline
  `5ea651e7f71d75101fe717e01c5c3b41dea574d1`.
- `V3_7_CHARTER.md` remains authoritative except for the exact narrow supersession in
  `V3_7_G2_EXECUTION_PROFILE_AUTHORITY_AMENDMENT.md`.
- Accepted Goal 1 commit/tree, Manifest, Envelope, registry, loader, Candidate, reports
  and historical evidence are read-only dependencies.
- V3 State Store/CAS/publication, old G1 admission, G2 decision table/rollback, ordinary
  V3.6 behavior, Pi and rejected Schema 2 paths are frozen.
- No environment-variable enumeration, Credential read, network, Provider/model call,
  dependency installation, Docker product execution or Pi inspection/change.

If an allowed implementation cannot preserve those identities, stop with
`BLOCKED_PENDING_MAIN_DECISION` and zero out-of-allowlist delta.

## 3. Exact implementation allowlist

Only these paths may be created or modified:

```text
workbench/config/v37/follow-up-execution-profiles/v37-g1-det-recovery.g2.v1.json
workbench/src/contracts/v37-types.ts
workbench/src/v37/follow-up-execution-profile-v37.ts
workbench/src/v37/registered-follow-up-v37.ts
workbench/src/session/persistent-session-v36.ts
workbench/src/state/state-feedback-g2.ts
workbench/src/inspect-v37g2.ts
workbench/tests/v37g2-runtime-effective-followup.test.ts
docs/reports/V3_7_G2_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G2_CLOSEOUT_DRAFT.md
```

No other tracked path may change. In particular, do not edit Goal 1 configuration or
loader files, V3 State Store/CAS, old G1 files, Final Capstone G2 contract types,
regression gate, package/TypeScript configuration, UI, Pi, Charter, Amendment, this
Prompt or `CURRENT_STATE.md`. Ignored `.runs/v37/g2-*` deterministic evidence is allowed.

An allowlist expansion is a Main decision and a Hard Stop.

## 4. Follow-up execution-profile freeze

Use exactly:

```yaml
configuration_location: workbench/config/v37/follow-up-execution-profiles/v37-g1-det-recovery.g2.v1.json
configuration_baseline_id: v37-g2-follow-up-profile-v1
loader_entry_point: workbench/src/v37/follow-up-execution-profile-v37.ts#loadRegisteredFollowUpExecutionProfileV37
loader_contract_id: v37-follow-up-execution-profile-loader-v1
digest_algorithm: sha256_over_canonical_utf8_json_v1
unknown_key_policy: reject
caller_location_or_digest_override: forbidden
directory_scan_or_dynamic_enrollment: forbidden
```

The profile must bind the exact accepted Manifest digest and its five existing execution
digests. Derive and verify those values from the unchanged Goal 1 loader/configuration;
do not manually invent or update them.

Freeze these exact effective bodies:

```yaml
provider_profile:
  profile_id: v37-g2-deterministic-faux-v1
  provider_kind: public_emitted_faux
  model_id: v37-g2-faux/faux-1
  external: false
  credential_reads: 0
  network_calls: 0
  real_model_calls: 0

tool_profile:
  profile_id: v37-g2-bounded-follow-up-v1
  allowed_tool_names:
    - workspace_read
    - workspace_list
    - workspace_search
    - workspace_edit
    - workspace_write
    - run_command
  writable_paths: [src/policy.mjs]
  protected_paths: [verifier/follow-up.test.mjs]
  allow_repository_commands: false

command_profile:
  profile_id: v37-g2-follow-up-command-v1
  commands_hard_max: 1
  descriptors:
    - command_id: follow_up_test
      executable: current_node_executable
      argv: [--test, verifier/follow-up.test.mjs]
      cwd: workspace
      timeout_seconds: 15
      max_combined_output_bytes: 65536

budget_profile:
  profile_id: v37-g2-deterministic-budget-v1
  v36_runtime_budget_profile_id: v36g2_frozen_acceptance_v1
  provider_requests_observation_threshold: 16
  provider_requests_hard_max: 16
  tool_calls_hard_max: 24
  combined_tokens_hard_max: 131072
  cost_usd_hard_max: 0.2
  commands_hard_max: 1
  verifier_runs_hard_max: 1
  verifier_timeout_ms_hard_max: 15000
  verifier_output_bytes_hard_max: 65536
  wall_time_ms_hard_max: 900000

stop_condition_profile:
  profile_id: v37-g2-no-retry-stop-v1
  retry: 0
  same_run_retry: 0
  fallback: 0
  replacement: 0
  automatic_replacement: 0
  task_swap: 0
  result_hunting: 0
  terminal_requires_complete_inspection: true
```

The permitted cost ceiling is only a deterministic runtime-limit identity; observed
external calls, real model calls and cost must all remain zero.

## 5. Binding and runtime requirements

The registered service must reload the workflow with the accepted Goal 1 loader and:

- resolve `state_store_scope_spec.configured_location` only below the loader-owned Host
  project root and reject absolute, escape, link/reparse or alternate lineage paths;
- inspect current active State, promotion Decision, Candidate/admission lineage and
  applicability; require the newly promoted State and same workflow Candidate;
- select all and only applicable accepted `prompt_addendum` entries in deterministic
  order; reject zero matches, adaptive Skills, ambiguity and stale pointers;
- compose exact Manifest runtime base prompt plus ordered addenda;
- persist immutable binding and pre-dispatch plan before entering V3.6;
- re-inspect active identity immediately before the first Provider request; pointer drift
  terminalizes without rebinding or dispatch;
- materialize only the frozen follow-up source/task/Verifier into a temporary workspace;
- use the fixed faux model responses through the production V3.6 bounded-turn seam;
- construct the command executor inside the registered Host service from the frozen
  descriptor; caller command executors, profiles, prompts, State IDs and Outcomes are
  forbidden.

The minimal V3.6 seam may accept one optional registered observation input. When present,
the same method that constructs `AgentHarness` must persist the exact system-prompt
digest, binding digest, execution-authority digest and Run/Session/workspace identities
before dispatch. Ordinary V3.6 callers must retain byte-compatible behavior and cannot
gain V3.7 admission merely by setting optional values.

## 6. Verifier, Outcome, Evidence and admission

- Execute the exact embedded follow-up Verifier once after a valid settled terminal.
- Use a local current-Node process, no shell, the frozen timeout/output caps and only the
  workspace environment key required by the existing Verifier runner pattern.
- Persist formal Verifier and Outcome artifacts. Agent/model text cannot set either.
- Budget, cancelled, integrity or missing-observation terminals never become ordinary
  Verifier failure.
- Implement the Charter Section 6.6 Evidence Body plus Amendment parent/effective profile
  and authority fields.
- The second confirmation must have a distinct kind/action/ID/digest. The Goal 1 receipt
  is invalid for follow-up submission.
- G1 admission independently reloads/recomputes every authority and formal artifact and
  rejects ordinary V3.6, digest-only pins, caller packages, cross-Case/workflow lineage,
  missing Outcome and disabled not-yet-started actions.
- Disabled registration permits identity-stable read-only reopen of already accepted
  follow-up artifacts and blocks new execution/submission/State-mutating action.

## 7. Canonical G2 normalization

Add the exact internal normal form from Charter Section 6.7. The old
`v3g3_bound_state_followup` adapter and new V3.7 adapter must each validate their own
source before producing it. Refactor only enough that existing assessment derivation
consumes the canonical value.

The old persisted assessment schema and decision results remain unchanged:

- PASS retains;
- ordinary negative needs reassessment;
- rollback still requires the same fresh symmetric immediate-parent/current comparison
  and exact State attribution;
- no Evidence directly supersedes State.

No caller-built canonical value may enter persistence or rollback.

## 8. Required deterministic coverage

The focused test must cover at least:

1. exact profile load, parent tuple linkage, unknown/tampered/caller profile rejection;
2. accepted/missing/stale/mismatched/inapplicable State and cross-lineage Candidate or
   promotion rejection;
3. deterministic prompt ordering, zero match, adaptive Skill and digest-pin-without-
   injection rejection;
4. pre-dispatch binding persistence, pointer drift before first request and no dispatch;
5. production V3.6 seam observes exact composed prompt and binding/authority identity;
6. missing/mismatched observation, terminal, execution tuple and profile rejection;
7. formal Verifier/Outcome pass, fail, invalid, missing and budget-terminal separation;
8. second confirmation separation, replay/idempotence and cross-workflow rejection;
9. G1 Admit/Reject/recompute/read-only historical reopen and disabled-action blocking;
10. old/new canonical adapters plus retain, reassessment, strict rollback and no direct
    supersede;
11. ordinary V3.6 non-admission and unchanged no-observation behavior;
12. Goal 1 Manifest/loader bytes unchanged, old V2/G1/V3/G2 regressions and Schema 2
    absence.

Exercise exported production functions; no test-only success path or manufactured
Verifier/Outcome is allowed.

## 9. Exact verification list

From `workbench/`, using the existing local public loader and no installation:

```text
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g2-runtime-effective-followup.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g1-registered-recovery.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2a-recovery.test.ts tests/v2a-cli.test.ts tests/v2a-post-audit.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g1-evidence-to-candidate.test.ts tests/v3g2-validate-promote-reject-rollback.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/final-capstone-g2-regression-state-feedback.test.ts
```

Also run the repository-prescribed exact TypeScript command. If the isolated worktree
lacks ignored Node declarations, record the exact environment stop and run one strict
environment-equivalent `tsc --noEmit` rooted at all changed TypeScript entries plus their
transitive dependencies using the already configured local TypeScript/Node declarations.
No dependency installation is allowed.

Record exact commands, totals, candidate identity, allowlist diff, unchanged Goal 1
configuration hashes, Schema 2 absence, environment qualifications and unverified items.

## 10. Reports and candidate handoff

Write:

- `docs/reports/V3_7_G2_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_7_G2_CLOSEOUT_DRAFT.md`.

Create exactly one candidate commit containing only allowlisted files. Report commit,
tree, parent, files, tests and zero-access counters, then stop. Do not modify control
state, freeze an audit candidate, start audit, accept Goal 2, merge to Main, tag or push.
