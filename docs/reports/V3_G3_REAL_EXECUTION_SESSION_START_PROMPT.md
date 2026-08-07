# V3 Goal 3 Real Execution Session Start Prompt

```yaml
status: authorized_execution_prompt
date: 2026-08-08
goal_id: V3_G3_SELECTIVE_REUSE_AND_PORTFOLIO_CLOSURE
session_role: fresh_top_level_no_source_edit_real_execution
implementation_baseline_commit: 74e7e73a07321f191d1b266ab8dd3cb94f66cade
implementation_baseline_tree: 15645b4d572bcc5f5fb8310bbf8bda8a78b1c17e
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_package: "@earendil-works/pi-agent-core@0.82.1"
real_case_count: 1
real_agent_run_count: 1
state_path: prompt_addendum
provider: deepseek
model: deepseek-v4-flash
provider_request_cap: 16
token_cap: 131072
tool_call_cap: 24
cost_cap_usd: 0.20
retry_authorized: false
fallback_authorized: false
replacement_authorized: false
extra_case_authorized: false
source_edit_authorized: false
state_authority_mutation_authorized: false
pi_modification_authorized: false
final_v3_acceptance_authorized: false
v4_authorized: false
```

You are the dedicated V3 Goal 3 Real Execution Session. You are an execution
and evidence owner, not the Main project-control Session. Execute only the one
frozen real closure below, report truthfully and stop for Main/user review.

## 1. Required reading

Read completely, in this order:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V3_VERSION_CHARTER.md`;
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
5. `docs/reports/V3_G3_IMPLEMENTATION_REPORT.md`;
6. `docs/reports/V3_G3_CLOSEOUT_DRAFT.md`;
7. `docs/reports/V3_G2_IMPLEMENTATION_REPORT.md` and
   `docs/reports/V3_G2_CLOSEOUT.md`;
8. `docs/reports/V3_G1_IMPLEMENTATION_REPORT.md` and
   `docs/reports/V3_G1_CLOSEOUT.md`;
9. the Goal 3 source and focused tests named in the Implementation Report;
10. every applicable pinned-Pi `AGENTS.md` before inspecting or using Pi files.

Do not reinterpret accepted V0-V2 facts, redesign V3, or implement V4.

## 2. Gate A — exact read-only baseline

Before reading any Credential content or making any network call, prove and
record:

- repository HEAD is exactly
  `74e7e73a07321f191d1b266ab8dd3cb94f66cade`;
- repository tree is exactly
  `15645b4d572bcc5f5fb8310bbf8bda8a78b1c17e`;
- all tracked files are clean;
- only known/declared untracked or ignored execution material exists;
- both pinned Pi checkouts, when present, are clean at
  `027a5847901b5dde30270abaa1041046cd2b4b55`;
- only public emitted Pi package entry points are used;
- the worktree-local ignored loader/type-path bridge passes public import and
  strict type smoke without installing, downloading or modifying Pi;
- Goal 3 strict TypeScript, 8/8 focused tests, Goal 1 13/13 and Goal 2 6/6
  pass from this exact baseline;
- no tracked source, fixture, test, Manifest, Charter, control-state or accepted
  report file has been modified.

If any identity or regression gate fails, stop before Credential access and
write a sanitized Pause Report. Do not repair tracked files.

## 3. Gate B — frozen State and authority identity

Use these exact existing paths read-only in place:

```text
sequence root:
D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/sequence-489cb1c4-20d9-42af-8dd6-0b22aeb6cf5d/

State root:
D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/sequence-489cb1c4-20d9-42af-8dd6-0b22aeb6cf5d/project-state/

Admission Registry root:
D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/sequence-489cb1c4-20d9-42af-8dd6-0b22aeb6cf5d/admission-authority/
```

Verify without copying, relocating or mutating them:

```yaml
project_id: v3-g3-portfolio-project
state_inventory_digest: 938a45f932f5276c1a21c94c2c004832e418db653abdc426d44dafecfddb3611
active_binding_revision: 3
active_state_version: 1
active_state_digest: 744ccd9ddce76f92b0b838f02253161748b9edb1e9071c8218bdf97f96ba2a7d
active_decision_id: decision-9199f961c1b6efe15e36028946dead21
active_pointer_digest: 60f3b56f8a1522dd431b8fa83055889b59cc2b8d84760283dcf776b3df0914aa
admission_registry_digest: df7169506aae343b3b44b0c035df70d8460841032b3324ab9a7118a5110bb18b
admission_digest: e84521e199b503ff18e240ff87c715aeab02f2089a0d62e83e04182ee0fc41ef
```

Use the tracked Goal 1 Candidate/State fixtures from this baseline and the
existing Goal 3 Inspector to verify the full admission/promotion/version/binding
lineage. Any mismatch is a hard stop before Credential access.

## 4. Gate C — the sole frozen real Case

This is one Case and one Agent Run, not an A/B experiment and not a new test
suite.

```yaml
task_source: fixtures/tasks/v0-a-parse-duration
task_prompt: fixtures/tasks/v0-a-parse-duration/task.md
task_prompt_sha256: 22b166bda844a1a4de90d54b4fa399896ce6e418b3fd5abc094a39409bdb0f35
task_id_for_case_authority: v0-b-parse-duration
task_kind: typescript-maintenance
case_id: v3-g3-real-prompt-addendum-parse-duration
verifier_manifest: fixtures/manifests/v0-b-parse-duration.json
verifier_id: v0-b-parse-duration-hidden-v1
verifier_source: fixtures/verifiers/v0-b-parse-duration/verify.mjs
verifier_sha256: 9f77987e7812f4f47d1c7b44c17428247832b5b367c2d453b6ebc055a15d1b7a
allowed_failure_family: verifier-failure
runtime_tool_profile_id: v3g3_bounded_local
provider_profile: fixed_deepseek_deepseek-v4-flash
required_binding_kind: prompt_addendum
adaptive_skill_binding_allowed: false
```

Create one isolated ignored Workspace under this Session's
`.runs/v3-g3-real-execution/` root by copying the frozen task source. Before
freezing Case Authority or reading a Credential, verify the copied initial
Workspace inventory against the source and run the frozen external Verifier
once. It must fail for the known broken parser. Preserve that raw pre-run
Verifier result as the content-identified trusted failure lineage for this same
Case.

Load the frozen verifier Manifest as source authority, but construct the
in-memory Goal 3 `TaskSpecV0B` projection with the same task, instruction,
Workspace, writable/protected paths, command descriptors and Verifier identities
and with `tool_profile_id` set to the accepted Goal 3 runtime profile
`v3g3_bounded_local`. Record both source-Manifest and runtime-projection digests.
Do not edit the tracked Manifest.

If the initial Verifier passes, cannot run, or its source/task identity differs,
stop before Credential access. Do not invent or widen a failure lineage.

Freeze a new Case Authority outside the shared State root using the existing
Goal 3 API. Then freeze the Run binding from the exact shared State. Before any
Credential read, prove that the binding contains exactly one
`prompt_addendum`, no `adaptive_skill`, the expected admission lineage and the
fixed DeepSeek/Tool/budget profiles.

## 5. Gate D — opaque Credential boundary

The only authorized Credential source is:

`D:/AI/AI_Projects/project2/.env.g005`

Before Gate A-C pass, only ordinary-file existence/metadata may be checked; do
not read its contents. After all gates pass, read exactly one non-empty
`DEEPSEEK_API_KEY` assignment opaquely inside the bounded execution process.
Reject inherited values, duplicate/missing/malformed assignments and any other
Credential source. Never print, hash, measure, serialize, persist or include the
value in an error. Remove it from process memory/environment as soon as the
one-Run authority closes.

## 6. The one authorized real execution

Use the accepted Goal 3 APIs and public Direct Pi route:

- `freezeGoal3CaseAuthorityV3`;
- `buildBindingContextFromCaseAuthorityV3`;
- `freezeRunBindingV3`;
- `createGoal3DeepSeekExecutionPortV3`;
- `executeGoal3RunV3`;
- `inspectGoal3RunV3`.

An ignored execution driver may be created under
`.runs/v3-g3-real-execution/runtime/`; it is mechanical execution material, not
tracked product source. Do not edit tracked source to make the driver work.

Execute exactly one `prompt_addendum`-bound DeepSeek V4 Flash Agent Run. The
common external Verifier must run after the Agent settles if the existing
execution path reaches it. Preserve the exact Session, Tool, runtime, Manifest,
Verifier, binding, Case Authority and Inspector evidence.

Frozen ceilings:

```yaml
provider_requests_max: 16
input_plus_output_tokens_max: 131072
tool_calls_max: 24
cost_usd_max: 0.20
credential_reads_max: 1
agent_runs_max: 1
```

No retry, fallback, replacement, continuation, second Agent Run, second Case,
adaptive-Skill real run, budget increase or evidence rewrite is authorized. A
Provider/runtime/Verifier failure after dispatch is a truthful terminal outcome:
preserve the partial evidence, sanitize errors, write a Pause Report and stop.

## 7. Mutation and authority prohibitions

You must not:

- modify, stage or commit tracked source, fixtures, tests, Manifests, prompts,
  accepted reports, `AGENTS.md`, `CURRENT_STATE.md`, Charter or governance;
- mutate, copy or relocate the frozen shared State/Admission roots;
- change active pointers, versions, decisions, admission entries or Candidate;
- modify Pi, use private Pi imports, or switch to SDK/Extension/RPC;
- install/download dependencies or add a Provider/model;
- edit the task Verifier, protected paths or acceptance criteria;
- claim causal improvement, general superiority, final V3 acceptance or V4.

The only permitted tracked writes are the execution report and non-accepting
closeout/pause draft named below. Do not stage or commit them.

## 8. Required deliverables and stopping point

On successful completion, create:

- `docs/reports/V3_G3_REAL_EXECUTION_REPORT.md`;
- `docs/reports/V3_G3_REAL_EXECUTION_CLOSEOUT_DRAFT.md`.

On a hard stop, create instead or additionally:

- `docs/reports/V3_G3_REAL_EXECUTION_PAUSE_REPORT.md`.

Report exact:

- baseline commit/tree and tracked status;
- all Gate commands and exit codes;
- pre-run failure identity;
- Case Authority, binding, active State and admission identities;
- Run/session/workspace/evidence paths and content digests;
- Provider requests, tokens, Tool calls, cost and all real-access counters;
- external Verifier and Inspector result;
- source/State/Pi before/after identities;
- limitations and claims allowed/not allowed;
- a structured `CURRENT_STATE_UPDATE_PROPOSAL` for Main only.

Do not edit `CURRENT_STATE.md`, accept Goal 3/V3, create a Git commit, start V4
or perform more execution. Stop and return the report to Main and the user.
