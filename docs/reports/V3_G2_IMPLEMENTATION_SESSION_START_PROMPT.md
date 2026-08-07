# V3 Goal 2 Dedicated Implementation Session Start Prompt

```yaml
status: authorized_for_new_top_level_session
goal_id: V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK
goal_2_control_baseline_commit: f138ddd607816f266e9024291718eeab087b39f6
goal_2_control_baseline_tree: 69812fb30ad7c2ee286a60d0cef35be847189d5d
goal_1_implementation_baseline_commit: 6ec958b83363c01e0eeec8be0360516dcdf2bc7e
source_branch: codex/v2-b-bounded-r2
execution_owner: this_new_top_level_dedicated_goal_2_session
credential_reads_authorized: 0
external_network_authorized: false
external_provider_calls_authorized: 0
real_model_calls_authorized: 0
goal_3_authorized: false
pi_core_patch_authorized: false
sdk_extension_rpc_switch_authorized: false
git_stage_or_commit_authorized: false
```

## 1. Role and stopping point

You are the one new top-level Dedicated Implementation Session for V3 Goal 2.
You are not Main, a subagent, an Audit Session, a real Execution Session or a
Goal 3 Session.

The accepted `V3_VERSION_CHARTER.md` is the common Goal contract. Do not create
another Goal Contract, Readiness stage, R1/R2 sequence or document chain. Your
only task is:

`Validate -> Promote / Reject / Rollback`

Implement the bounded Goal 2 mechanism, focused tests, ignored raw evidence,
Implementation Report and Closeout Draft. Stop at Goal 2 Exit and return to
Main. You cannot accept Goal 2, change control state, commit Git or enter Goal 3.

## 2. Gate A — exact baseline and authority

Before any tracked edit:

1. Read completely and follow:
   - `AGENTS.md`;
   - `CURRENT_STATE.md`;
   - `docs/第二项目_Codex交接包_2026-07-30/V3_VERSION_CHARTER.md`;
   - `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
   - `docs/reports/V3_G1_CLOSEOUT.md`;
   - `docs/reports/V3_G1_IMPLEMENTATION_REPORT.md`;
   - `docs/reports/V3_HARNESS_STATE_ADAPTATION_PRECONTRACT_REVIEW.md`;
   - relevant V2-A Closeout, source and focused tests cited below.
2. Verify exact HEAD/tree:
   - commit `f138ddd607816f266e9024291718eeab087b39f6`;
   - tree `69812fb30ad7c2ee286a60d0cef35be847189d5d`.
3. Verify tracked/index clean.
4. Verify both pinned Pi checkouts are clean at
   `027a5847901b5dde30270abaa1041046cd2b4b55` and package version `0.82.1`:
   - `D:/AI/AI_Projects/project2/.upstream/pi`;
   - `D:/AI/AI_Projects/project2/.runs/g006/pi`.
   Read every applicable Pi `AGENTS.md` before inspecting Pi files.
5. Rebuild an ignored, Goal-local public emitted loader/type bridge under
   `.runs/v3-g2/runtime/`; do not install/copy another Pi or depend on another
   worktree's ignored `.runs` paths. Smoke public `AgentHarness`, `loadSkills`
   and `NodeExecutionEnv`, and run strict TypeScript plus the Goal 1 focused
   regression through this bridge.
6. Record all preflight identities and zero authority counters under
   `.runs/v3-g2/evidence/`.

If identity, public-entry or clean-boundary checks fail, stop with a bounded
Pause Report. Credential probing, network and real calls are never allowed in
Goal 2.

## 3. Objective and accepted starting facts

Goal 1 already proves evidence projection, typed Diagnosis/Lesson/Candidate,
host proposal validation, two staged State adapters, immutable staging and
fail-closed reload. Do not rebuild those modules.

Goal 2 must prove that a Candidate affects active Harness State only after
independent frozen evidence supports it, and that rejection or rollback is
safe and auditable:

```text
staged Candidate
  -> symmetric Base/Candidate validation
  -> deterministic Promote or Reject
  -> immutable accepted State version
  -> atomic active pointer
  -> stale/corrupt/missing fail closed
  -> rollback by new decision, without deleting history
```

Goal 2 is zero-real-access mechanism work. Goal 3, not Goal 2, owns subsequent
Run selective binding and bounded real behavioral closure.

## 4. Required implementation

### 4.1 Thin V3 symmetric comparator

Add the smallest V3 comparator adapter. Reuse existing Workbench mechanisms
where they fit, especially temporary workspace copy/isolation, ArtifactRef and
write-once writers, external Verifier, frozen regression commands, Session
policy concepts, journal/evidence validation and Inspector patterns. Relevant
starting symbols include:

- `createTemporaryWorkspace()`;
- `runExternalVerifierV0B()`;
- `writeOnceJson()`, `artifactRef()`, `validateArtifactRef()`;
- V2 recovery workspace/attempt evidence and `inspectRunV2A()` patterns;
- Goal 1 `loadStagedStateV3()` and the two State adapters.

Do not modify V2 contracts or `selectCandidateV2A()`, and do not import its
strategy-order tie-break into V3.

The validation seed and arm records must freeze enough identity to prove:

- both arms start from byte-identical workspace snapshots;
- task, instruction, Provider/model profile, Tool profile, external Verifier,
  regression checks, budget, hard constraints and Session policy are equal;
- both arms use the same Session semantics, preferably fresh for both;
- Base binds the accepted prior State and Candidate binds exactly the staged
  Candidate State;
- the State version/digest/entries are the only treatment delta;
- arm output and usage are independently derived and inspectable.

Use deterministic/Faux execution ports and local verifier/regression commands.
Do not claim real-model effectiveness from these tests.

### 4.2 Frozen decision rule

Promotion is Harness-owned and deterministic:

| Base | Candidate | Result |
|---|---|---|
| verifier fail | verifier pass | Promote only if regression and authority gates pass |
| verifier pass | verifier fail | Reject |
| both fail | Reject |
| both pass | Promote only if Candidate is no worse on every frozen structural/usage metric, strictly better on at least one material metric, and all regression/authority gates pass; otherwise Reject |

The material both-pass vector is limited to predeclared, recomputable values:
structural pathology count, Tool calls and Provider calls. Cost/time may be
recorded diagnostically but must not silently become a promotion rule. A model
self-rating, V2 strategy order or Candidate-authored criterion is forbidden.

### 4.3 Immutable State lifecycle

Implement the thinnest single-writer project State store abstraction needed to
prove Goal 2:

- immutable/content-identified accepted versions;
- write-once validation and Promote/Reject/rollback decisions;
- active pointer containing project identity, monotonically increasing binding
  revision, State version/digest and decision identity;
- promotion writes and reload-verifies the immutable version before atomic
  temp-plus-rename pointer update;
- compare-and-swap style stale protection against the expected prior active
  version/digest;
- rejected Candidate writes a decision but leaves active bytes unchanged;
- corrupt/missing/version-digest mismatch, unexpected inventory, link/hardlink,
  path alias or active pointer to missing State fails closed—never silently
  falls back to base/empty State;
- rollback creates a new immutable decision and pointer revision referencing an
  earlier accepted version; it never deletes or rewrites a version/decision;
- a new store instance can reopen and verify the active pointer and history.

All actual Goal 2 stores and active pointers must live in isolated ignored test
or evidence roots. Do not activate the real Goal 1 Candidate for the project.

### 4.4 Independent inspection and lineage

Add a focused V3 Inspector or equivalent pure inspection surface that
independently recomputes:

- validation seed and arm fairness/treatment proof;
- frozen Verifier/regression/usage outcome;
- deterministic Promote/Reject decision;
- Candidate -> validation -> decision -> version -> active pointer lineage;
- stale/corrupt/missing rejection and rollback history;
- absence of Goal 3 binding or authority drift.

Do not make the writer's own success flag the inspection authority.

## 5. Required focused evidence

Cover the Charter Exit with the fewest clear tests; cases may be combined:

1. good Candidate: Base fails, Candidate passes, regressions/authority pass,
   Candidate is promoted and active pointer reopens correctly;
2. bad or no-material-improvement Candidate: deterministic Reject and active
   bytes remain unchanged;
3. promoted Candidate rolls back to the prior accepted version through a new
   immutable decision/pointer revision, with all history retained;
4. stale promotion and corrupted/missing/link/path/inventory variants fail
   closed without partial pointer mutation;
5. fairness/treatment, Verifier/regression or lineage tampering is rejected by
   independent inspection.

Run strict TypeScript, Goal 2 focused tests, Goal 1 focused regression and only
the narrow V2/V0 regressions touched by reused shared modules. Do not run a
large historical matrix merely for completeness.

## 6. Source boundary

Expected tracked allowlist:

- minimal additions/edits under `workbench/src/contracts/`,
  `workbench/src/refinement/`, `workbench/src/state/` and one focused V3
  Inspector/product adapter if needed;
- `workbench/tests/v3g2-validate-promote-reject-rollback.test.ts` and only
  genuinely necessary small fixtures/helpers;
- one `v3g2:test` package script;
- `docs/reports/V3_G2_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_G2_CLOSEOUT_DRAFT.md`.

Prefer new thin adapters over rewrites. A minimal Goal 1 source adjustment is
allowed only when a concrete reuse boundary requires it and must be explained
in Source Delta. Do not modify accepted V0–V2 contracts, tests or fixtures to
make Goal 2 pass.

Protected and forbidden tracked changes include `AGENTS.md`,
`CURRENT_STATE.md`, Charter/governance files, Goal 1 Closeout, accepted base
prompt, accepted V1 Skill, Verifier/Outcome/Promotion authority criteria,
prior accepted fixtures, Pi and references.

## 7. Explicit non-goals and authority limits

Do not implement or execute:

- Goal 3 applicability matching, selective Run binding, subsequent Run
  integration, real behavioral Case or Portfolio closeout;
- Credential reads, network, external Provider/model or real-model calls;
- a model-based Promotion Judge;
- Router, Curator, Experience Repository, Memory, Runtime Policy or third State;
- database, multi-writer lock/merge, daemon, UI or new Eval Runtime;
- Pi Core/private imports or SDK/Extension/RPC switching;
- promotion of the real Goal 1 Candidate into project active state;
- Git add/commit/push or control-state edits.

Ordinary compile/test/fixture/schema/path/adapter defects stay in this same
Session: fix, rerun focused tests and record the repair. Do not create a new
Stage, Amendment, Replacement or Audit for ordinary defects. Stop only on a
Charter hard stop, architecture/scope change, accepted-core rewrite, inability
to prove State-only treatment, or a required authority expansion.

## 8. Deliverables and final stop

Return, without committing:

1. `docs/reports/V3_G2_IMPLEMENTATION_REPORT.md`;
2. `docs/reports/V3_G2_CLOSEOUT_DRAFT.md`;
3. ignored Evidence Index and deterministic raw artifacts;
4. exact Source Delta, commands/exit codes and remaining limitations;
5. structured `CURRENT_STATE_UPDATE_PROPOSAL` in a report only.

If every Goal 2 Exit criterion passes, recommend:

`PASS_V3_G2_VALIDATE_PROMOTE_REJECT_ROLLBACK_PENDING_MAIN_ACCEPTANCE`

If a hard stop is hit, create a concise `V3_G2_PAUSE_REPORT.md`. In either
case stop and wait for Main. Do not accept Goal 2 or start Goal 3.
