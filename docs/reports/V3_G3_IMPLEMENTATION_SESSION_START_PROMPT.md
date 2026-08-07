# V3 Goal 3 Dedicated Implementation Session Start Prompt

```yaml
status: authorized_for_new_top_level_session
goal_id: V3_G3_SELECTIVE_REUSE_AND_PORTFOLIO_CLOSURE
goal_3_control_baseline_commit: 67d49438ddec1bf71ce252b45e2a9ae98078a452
goal_3_control_baseline_tree: 60cb0b9925b2cded3a31e6a02d1c01a0bc05a622
goal_2_implementation_baseline_commit: d24b51ffacc886560671f90757ff087a3561bd1a
source_branch: codex/v2-b-bounded-r2
execution_owner: this_new_top_level_dedicated_goal_3_implementation_session
credential_reads_authorized: 0
external_network_authorized: false
external_provider_calls_authorized: 0
real_model_calls_authorized: 0
real_behavioral_execution_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
sdk_extension_rpc_switch_authorized: false
git_stage_or_commit_authorized: false
v4_authorized: false
```

## 1. Role and final stop

You are the one new top-level Dedicated Implementation Session for V3 Goal 3.
You are not Main, a subagent, an Audit Session or the later real Execution
Session. The accepted `V3_VERSION_CHARTER.md` is the common Goal contract; do
not create another Goal Contract, readiness chain, Stage, R1/R2 or Amendment.

Your bounded task is to implement and deterministically verify:

```text
accepted Goal 1 Candidate
  -> explicit host admission to current active State identity
  -> existing Goal 2 validation/version/pointer lifecycle
  -> project-persistent active State
  -> deterministic applicability and Run-start binding freeze
  -> public Direct Pi prompt_addendum / adaptive_skill paths
  -> subsequent-Run Manifest and Inspector lineage
  -> four bounded behavioral/regression Cases
```

Stop after the zero-real-access implementation, focused tests, ignored raw
evidence, Implementation Report and Closeout Draft. Do not accept Goal 3, edit
control state, commit Git, make a real call or begin V4.

## 2. Gate A — exact baseline and authority

Before any tracked edit:

1. Read completely and follow:
   - `AGENTS.md`;
   - `CURRENT_STATE.md`;
   - `docs/第二项目_Codex交接包_2026-07-30/V3_VERSION_CHARTER.md`;
   - `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
   - `docs/reports/V3_HARNESS_STATE_ADAPTATION_PRECONTRACT_REVIEW.md`;
   - `docs/reports/V3_G1_IMPLEMENTATION_REPORT.md` and `V3_G1_CLOSEOUT.md`;
   - `docs/reports/V3_G2_IMPLEMENTATION_REPORT.md` and `V3_G2_CLOSEOUT.md`;
   - the Goal 1/2 source and focused tests cited below.
2. Verify exact HEAD/tree:
   - commit `67d49438ddec1bf71ce252b45e2a9ae98078a452`;
   - tree `60cb0b9925b2cded3a31e6a02d1c01a0bc05a622`.
3. Verify tracked/index clean and confirm the commit contains the activated
   `active_goal: V3_G3_SELECTIVE_REUSE_AND_PORTFOLIO_CLOSURE` control state.
4. Verify both pinned Pi checkouts are clean at
   `027a5847901b5dde30270abaa1041046cd2b4b55`, package version `0.82.1`:
   - `D:/AI/AI_Projects/project2/.upstream/pi`;
   - `D:/AI/AI_Projects/project2/.runs/g006/pi`.
   Read every applicable Pi `AGENTS.md` before inspecting Pi files.
5. Build only an ignored Goal-local public emitted loader/type bridge under
   `.runs/v3-g3/runtime/`. Do not install, download or copy another Pi. Smoke
   public `AgentHarness`, `loadSkills`, `formatSkillInvocation`,
   `NodeExecutionEnv` and strict TypeScript.
6. Verify the preserved real Goal 1 source artifacts before copying any safe
   subset into a tracked fixture:
   - root:
     `C:/Users/HUAWEI/.codex/worktrees/f38b/project2/.runs/v3-g1/real-proposal/v3g1-real-proposal-20260808-02`;
   - Candidate digest:
     `48ee92898bdb1eeedfc33956a67725f030bae04d042238af147c30348379c7f4`;
   - staged State digest:
     `efbaf666637726231d3c3765a23bf579ebb6f2698dd6e8332904e0db938953d9`;
   - `validated-candidate.json` SHA-256:
     `8b161311386364234fa19a0d648f2dedd801dcb3eaa87e3f8be9d2ff9aacbb44`;
   - staged `state.json` SHA-256:
     `25c2c0e3f43f2e9984e70e184a4d59206f4f96dc23685a94fb4a1402c467a676`.
   Never modify this source root. Only the sanitized Candidate/State and a
   provenance manifest may become tracked Goal 3 fixtures; do not copy raw
   credential/header material or unnecessary provider payloads.
7. Record Gate A identities and zero authority counters under
   `.runs/v3-g3/evidence/`.

If the baseline, Pi identity, public emitted boundary, or Goal 1 source hashes
do not match, stop with `V3_G3_PAUSE_REPORT.md` before tracked implementation.

## 3. First implementation checkpoint — explicit Candidate admission

There is one known cross-Goal integration seam that must be resolved first:

- Goal 1's real Candidate has
  `expected_base_state_digest = 0c667c4b193b4de106107e5dd47782b634920c172a80ba6233509239c9184eb8`,
  the Goal 1 accepted-base sentinel identity;
- Goal 2 currently interprets `expected_base_state_digest` as the current
  accepted active State-version digest.

Do not rewrite the original Candidate, edit its preserved evidence, bypass the
Goal 2 stale check, or reinterpret the two historical Goal conclusions.

Implement the thinnest content-identified host-side admission record, for
example `CandidateAdmissionV3`, that proves and records:

- original Candidate ID/digest, staged State digest and evidence identity;
- original accepted-base sentinel identity;
- exact target project and expected active binding revision/version/digest;
- an exact semantic-preservation proof for Diagnosis, Lesson, edits,
  applicability and evidence references;
- the derived admitted Candidate ID/digest and derived staged State digest;
- a content digest for the admission itself.

The admitted Candidate may derive a new identity with the current active State
digest, but every semantic field other than expected-active identity and the
resulting content identity must remain exactly equal. Preserve the source
Candidate as immutable lineage. Existing Goal 2 comparator/apply stale
protection must remain effective. Inspector must independently reject a forged,
stale, cross-project, semantically changed or mismatched admission.

Prove this checkpoint with a focused test before broader Goal 3 integration.
If it cannot be done without mutating the source Candidate, weakening stale
protection or rewriting the accepted Goal 1/2 core lifecycle, stop and return
to Main. This is the one planned architecture checkpoint; ordinary type/schema
defects are fixed in this Session.

## 4. Minimal selective binding and persistent State reuse

Reuse the Goal 2 State store, versions, decisions, active pointer, inspection
and rollback. Do not build a second store. Use a stable host-owned ignored
operational root outside all Agent tool workspaces, preferably:

`D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/`

The implementation may create and mutate this Goal-owned State authority while
proving deterministic promotion/rejection/rollback. The later real Execution
Session will receive read-only authority over its frozen accepted contents.
Record an exact ordinary-file inventory and digests for Main review.

Add a small controlled binding context and immutable Run binding record. Keep
the current `ApplicabilityV3` fields unless a concrete exact-match need requires
the Charter-allowed minimal extension. Matching rules are frozen:

- non-empty dimensions are ANDed;
- values within one dimension are ORed;
- task kind comes from trusted Task/Case identity;
- failure family is usable only when trusted prior failure/recovery lineage is
  present; it is not caller- or Agent-authored free text;
- prompt addenda sort by `entry_id`;
- no match produces an explicit empty binding;
- more than one matching adaptive Skill fails closed;
- no embedding, ranking, model router, similarity or fallback-to-all-State.

At Run start, load and inspect the active pointer/version once, compute the
binding once, and freeze a content-identified immutable snapshot containing at
least:

- project ID and active binding revision/version/digest;
- binding context and digest;
- bound entry IDs and semantic/source digests;
- composed prompt digest;
- adaptive Skill source and public explicit wrapper digest when present;
- Candidate -> validation -> decision -> version lineage references.

No State-store read after the Agent Run starts may alter that Run's treatment.
A later pointer change must not change or invalidate the already frozen Run;
Inspector verifies the exact historical version and binding snapshot rather
than silently substituting the current pointer.

## 5. Thin Direct Pi runtime integration

Do not build a second Agent Loop, Trace, Verifier or Eval runtime. Reuse current
Workspace, Session, bounded Tool profile, provider/Faux composition, external
Verifier, Artifact, Journal and Inspector helpers where they fit. Relevant
starting symbols include:

- `initializeStateStoreV3()`, `applyValidationDecisionV3()`,
  `rollbackActiveStateV3()`, `inspectStateStoreV3()`;
- `executeSymmetricValidationV3()` and `inspectValidationV3()`;
- `composePromptAddendaV3()`;
- `loadAdaptiveSkillV3()` and public `formatSkillInvocation()`;
- existing Direct `AgentHarness` adapters and V2/V0 run/Verifier evidence
  surfaces.

The two runtime paths must remain genuinely distinct:

- `prompt_addendum`: compose the immutable accepted `SYSTEM_PROMPT` plus matched
  addenda before constructing `AgentHarness`; then call public
  `harness.prompt(taskPrompt)`;
- `adaptive_skill`: load exactly one accepted Markdown Skill through the public
  Pi loader, pass it in `resources.skills`, freeze its source/wrapper identity,
  and call public `harness.skill(skill.name, taskPrompt)`.

Agent tools must not receive write access to the State root, Verifier, case
identity, evidence authority or protected base. State may not change Tool
profile, budgets, credentials, network authority, Verifier or success rules.

Extend the existing Manifest/Inspector surface only as a thin refinement
lineage attachment. The writer's success flag is never inspection authority.

## 6. Exactly four default behavioral/regression Cases

Use deterministic/Faux execution and focused local Verifiers only. Freeze four
Cases before observing their outcomes; do not add Cases for prettier results:

1. **Hard failure / real Goal 1 prompt Candidate**
   - admit the immutable real Candidate;
   - validate and Promote it in the Goal 3 project store;
   - reopen active State in an independent Run;
   - relevant trusted `typescript-maintenance + verifier-failure` context binds
     the prompt addendum and records exact lineage.
2. **Inefficient success / adaptive Skill / prior-pass**
   - use the deterministic producer and public Skill path;
   - prove relevant binding and a frozen prior-pass regression;
   - do not use tiny real cost/time differences as promotion evidence.
3. **Structural repeated-failure pathology**
   - use the accepted Goal 1 structural evidence projection;
   - demonstrate evidence-backed Reject when the Candidate does not improve;
   - active State remains byte-identical.
4. **Irrelevant non-binding and rollback**
   - the same active State produces explicit empty binding on an unrelated task;
   - pointer rollback creates new decision/revision and preserves all history;
   - a subsequent Run freezes the prior accepted version.

These four Cases must collectively cover all three Trigger classes, both State
kinds, relevant and irrelevant binding, prior-pass regression, Reject and
rollback. Do not create a fifth Case unless Main later finds a concrete missing
Charter requirement; ordinary assertion organization does not count as a new
behavioral Case.

No real-model behavior is claimed from this implementation evidence. The first
later real closure will be prompt-addendum-first; adaptive Skill is the soft
second closure and is not authorized now.

## 7. Focused verification and source boundary

Run the narrowest sufficient suite:

- strict Workbench TypeScript;
- Goal 3 focused tests;
- complete Goal 1 and Goal 2 focused regressions;
- only V0–V2 regressions touched by shared adapters;
- public emitted AgentHarness/Skill/type smoke;
- ordinary-file, path/link/hardlink, stale/admission, pointer drift and binding
  tamper tests.

Expected tracked allowlist:

- minimal Goal 3 contracts/state/binding/runtime/inspection additions under
  `workbench/src/`;
- minimal Goal 1/2 adapter adjustments only when the explicit admission or
  binding reuse boundary requires them, with all existing tests retained;
- one focused `workbench/tests/v3g3-*.test.ts` surface and only necessary small
  helpers/fixtures;
- sanitized, hash-bound Goal 1 Candidate/State fixture under `fixtures/v3/`;
- one Goal 3 test script if needed;
- `docs/reports/V3_G3_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_G3_CLOSEOUT_DRAFT.md`.

Protected tracked files include `AGENTS.md`, `CURRENT_STATE.md`, Charter and
governance files, accepted Goal 1/2 reports, accepted base prompt/V1 Skill,
Verifier/Outcome/Promotion authority, accepted V0–V2 fixtures/tests, Pi and
references. Do not edit them to make Goal 3 pass.

## 8. Non-goals, ordinary defects and hard stops

Forbidden in this Session:

- Credential reads, network, external Provider/model or real-model calls;
- real behavioral closure or later Execution Session work;
- Pi Core/private imports or SDK/Extension/RPC switch;
- third adaptive State, Memory, Runtime Policy, Router, Curator, Experience DB;
- new Agent Loop, Eval runtime, large benchmark, statistical claim or V4;
- Git add/commit/push or control-state edits;
- modifying the preserved Goal 1 real evidence root.

Compile, type, fixture, exact-key schema, path, adapter, prompt wording and
focused assertion defects are ordinary: fix them in this Session, rerun the
affected suite and record the repair. Do not create Replacement/Correction or
Audit Sessions for ordinary defects.

Stop with `V3_G3_PAUSE_REPORT.md` only if:

1. admission requires source-Candidate mutation or weaker stale protection;
2. binding cannot freeze and be independently recomputed;
3. State must enter the Agent workspace or modify authority-plane inputs;
4. public Direct Pi cannot support both distinct State paths without a Pi/private
   import/integration-route change;
5. a second State store, third State, Router or new Eval runtime is required;
6. accepted V0–V2 core contracts must be rewritten;
7. an unexplained material regression or a second fundamental lifecycle design
   failure occurs.

## 9. Deliverables and stop

Return without staging or committing:

1. `docs/reports/V3_G3_IMPLEMENTATION_REPORT.md`;
2. `docs/reports/V3_G3_CLOSEOUT_DRAFT.md`;
3. ignored Evidence Index and stable shared State inventory/digests;
4. exact Source Delta;
5. commands, exit codes and test counts;
6. authority counters proving Credential/network/Provider/model counts 0/0/0/0;
7. explicit remaining limitations and proposed frozen real-execution inputs;
8. structured `CURRENT_STATE_UPDATE_PROPOSAL` in the report only.

If all zero-call Goal 3 implementation criteria pass, recommend:

`PASS_V3_G3_ZERO_CALL_SELECTIVE_REUSE_SUBSTRATE_PENDING_MAIN_REVIEW`

This is not final Goal 3 or V3 acceptance. Stop and wait for Main. Main will
perform lightweight review, return ordinary defects to this same Session if
needed, and only after an accepted frozen implementation baseline may propose a
fresh no-source-edit real Execution Session.
