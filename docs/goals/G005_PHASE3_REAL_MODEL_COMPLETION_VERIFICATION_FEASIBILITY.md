# G005 — Phase 3 Real-model Completion Verification Feasibility

```yaml
goal_id: G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY
status: accepted_activation_authorized_preconditions_pending
phase: Phase_3A_real_model_path_feasibility
owner: future_dedicated_G005_execution_session
architecture_owner: main_session
created: 2026-07-29
accepted_by_user: 2026-07-29
activation_authorized_by_user: 2026-07-29
execution_authorized: true_after_all_activation_preconditions_pass
real_model_call_authorized_by_this_contract: true_after_all_activation_preconditions_pass
formal_workbench_creation_authorized: false
pi_core_modification_authorized: false
```

This contract was accepted and G005 activation was authorized by the user on
2026-07-29. Execution and real-model calls remain gated by every activation
precondition below, including an explicitly authorized reviewed-baseline Git
commit and a clean recorded project `HEAD`. Until those preconditions pass, no
setup, `.runs/g005` creation or provider request may begin.

## 1. Objective

Determine whether the already accepted direct `pi-agent-core` `AgentHarness`
mechanism can run one small, controlled coding task against a current real
DeepSeek model and produce an auditable Baseline / Candidate completion-
verification evidence chain without modifying Pi Core.

The single architectural unknown is:

> Can the direct `AgentHarness` path, using a project-defined current DeepSeek
> V4 model descriptor and Pi's public provider boundary, complete a bounded
> tool-using coding cycle, settle, run an external deterministic verifier, and
> conditionally continue once with verifier feedback?

G005 tests real-provider feasibility and evidence integrity. It does **not**
test whether Completion Verification improves coding performance in general.
One task and one paired run cannot establish a Policy effect size.

## 2. Why G005 Exists

G003 established the following facts with a deterministic Faux Provider:

- public emitted-package import of direct `AgentHarness` works;
- a non-interactive Agent Cycle can use an externally controlled Workspace;
- a Verifier can run only after the cycle settles;
- one bounded Candidate recovery can continue in the same Session;
- Manifest, Event Journal, Pi Session and Outcome can be correlated;
- no Pi Core patch is required for that mechanism.

G003 deliberately did not establish:

- current real-model authentication or transport;
- current DeepSeek V4 model compatibility with the pinned Pi revision;
- genuine model tool selection and multi-turn behavior;
- real-model `reasoning_content` replay across Tool / ToolResult turns;
- any Completion Verification performance benefit.

The reference analysis found no architecture blocker requiring a broad G004.
It ranked Completion Verification as the next bounded policy candidate and
retired G004 before contract creation. G005 therefore advances directly to a
small real-model feasibility checkpoint without silently inheriting G004's
broad robustness scope.

## 3. Evidence Classification

All material conclusions in the report must use one of these labels:

```yaml
Fact: directly supported by pinned source, test, artifact, or observed command
Inference: reasoned interpretation whose premises are cited
Recommendation: proposed next action or design choice
Unconfirmed: not tested or not established by current evidence
```

Evidence priority remains:

1. pinned local Pi source and tests;
2. actual G005 commands, artifacts and provider responses with secrets removed;
3. accepted Goal Contract, ADR and `CURRENT_STATE.md`;
4. official current DeepSeek API documentation for external API facts;
5. `reference/cc-harness-knowledge` and `reference/src` for design patterns;
6. architecture inference.

Current API documentation cannot prove behavior of the pinned Pi code. Pi
source cannot prove that the external API still behaves as documented. G005
must preserve that distinction.

## 4. Activation Preconditions

Before any dependency installation, generated run directory, network request,
or model call, the execution session must verify and record:

```yaml
project_root: D:/AI/AI_Projects/project2
execution_environment: Windows_native_PowerShell
wsl_allowed: false
root_git_initialized: true
root_git_worktree: clean_except_explicitly_accepted_untracked_reference_tree
root_project_commit: record_exact_HEAD_after_contract_review_commit
pi_reference_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_reference_worktree: clean
g003_disposition: PASS_DIRECT_GO_GATE
g005_contract_status: explicitly_activated
g005_execution_root_absent: .runs/g005
formal_workbench_absent: workbench/
credential_file_present: .env.g005
credential_key_present: DEEPSEEK_API_KEY
```

The execution session must read, in order:

1. `CURRENT_STATE.md`;
2. this activated contract;
3. the relevant sections of
   `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md`;
4. `docs/reports/CC_HARNESS_REFERENCE_ANALYSIS_DECISION_SUMMARY.md`;
5. `docs/reports/REFERENCE_BACKED_POLICY_CANDIDATES.md`;
6. `docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_REPORT.md`;
7. `docs/reports/G003_ARCHITECTURE_REVIEW.md`;
8. every applicable `.upstream/pi/AGENTS.md` before reading or using Pi files;
9. the exact pinned Pi symbols and tests named in section 6.

If the root contains unrelated user changes, `.upstream/pi` is dirty, the
credential is absent, the accepted commit differs, or `.runs/g005` already
exists, stop before model use and return to the main session. Do not clean,
overwrite or reinterpret those conditions silently.

## 5. Frozen External Service and Model

### 5.1 Provider

```yaml
provider_id: deepseek
provider_factory: "@earendil-works/pi-ai/providers/deepseek"
api: openai-completions
base_url: https://api.deepseek.com
credential_environment_variable: DEEPSEEK_API_KEY
credential_file: .env.g005
```

The current official DeepSeek API is the external authority for endpoint and
model availability:

- Change log: <https://api-docs.deepseek.com/updates>
- Chat Completion API: <https://api-docs.deepseek.com/api/create-chat-completion>
- Model list API: <https://api-docs.deepseek.com/api/list-models>
- Thinking mode: <https://api-docs.deepseek.com/guides/thinking_mode>
- Pi integration: <https://api-docs.deepseek.com/quick_start/agent_integrations/pi_mono/>

At contract drafting time, the official documentation identifies
`deepseek-v4-pro` and `deepseek-v4-flash` as the current V4 API model IDs and
describes `high` / `max` reasoning effort. This fact must be rechecked during
activation because it is external and time-sensitive.

### 5.2 Frozen primary model

G005 uses one model only:

```yaml
model_id: deepseek-v4-flash
model_display_name: DeepSeek V4 Flash (G005 bounded profile)
thinking_level: high
reasoning_effort_sent: high
input: [text]
provider_context_window: 1000000
g005_model_context_window: 1000000
provider_max_output_documented: 384000
g005_model_max_tokens: 8192
max_retries: 0
provider_request_timeout_ms: 120000
```

Rationale:

- Flash is sufficient for transport, tool-loop and evidence feasibility;
- one frozen model avoids turning G005 into a model comparison;
- `high` exercises reasoning without the latency and output expansion of
  `max`;
- `Model.maxTokens = 8192` is the effective per-request output cap because the
  pinned `AgentHarnessStreamOptions` does not expose `maxTokens`;
- zero hidden transport retries keeps provider-request counts auditable.

`deepseek-v4-pro`, `max`, `xhigh`, alternate endpoints and legacy model aliases
are outside G005. Pro may become a later controlled comparator only after main-
session review; it is not an automatic fallback if Flash fails.

### 5.3 Project-defined model descriptor

The pinned Pi model-data snapshot predates current DeepSeek V4 names and the
immutable source checkout does not contain hydrated generated model-data. G005
must therefore construct a typed project-side `Model<"openai-completions">`
descriptor instead of editing Pi's generated catalog.

The descriptor must freeze:

```yaml
id: deepseek-v4-flash
provider: deepseek
api: openai-completions
baseUrl: https://api.deepseek.com
reasoning: true
thinkingLevelMap:
  minimal: high
  low: high
  medium: high
  high: high
  xhigh: max
  max: max
input: [text]
contextWindow: 1000000
maxTokens: 8192
compat:
  supportsStore: false
  supportsDeveloperRole: false
  supportsReasoningEffort: true
  supportsUsageInStreaming: true
  maxTokensField: max_tokens
  requiresReasoningContentOnAssistantMessages: true
  thinkingFormat: deepseek
```

The cost-rate fields required by Pi's `Model` type must be copied from the
official pricing page at activation time, timestamped in the Manifest, and used
only as usage metadata. A pricing change must not alter task behavior or gate
semantics.

No model-data generator, live catalog hydration, Pi source change, custom Pi
build boundary, `models.json` mutation inside Pi, or aliasing to a legacy model
ID is authorized.

## 6. Pinned Pi Source Basis

Before implementation, the execution session must cite and recheck these exact
public-path claims against the pinned commit:

| Claim | Pinned source / symbol | Relevant test or evidence |
| --- | --- | --- |
| DeepSeek provider is public and uses `DEEPSEEK_API_KEY` | `.upstream/pi/packages/ai/src/providers/deepseek.ts` — `deepseekProvider()`; `.upstream/pi/packages/ai/package.json` — `exports["./providers/*"]` | G003 public emitted-package import pattern; targeted emitted import in G005 Gate A |
| A caller-supplied current model need not be in the provider's static catalog | `.upstream/pi/packages/ai/src/models.ts` — `ModelsImpl.requireProvider()`, `ModelsImpl.streamSimple()`, `createProvider()` / `apiFor()` | Gate A static consumer proof, then Gate B observed dispatch |
| AgentHarness routes each provider turn through `Models.streamSimple()` | `.upstream/pi/packages/agent/src/harness/agent-harness.ts` — `createStreamFn()` and `createLoopConfig()` | `.upstream/pi/packages/agent/test/harness/agent-harness-stream.test.ts` |
| Harness thinking level reaches simple stream reasoning | `.upstream/pi/packages/agent/src/harness/agent-harness.ts` — `createLoopConfig()` | `.upstream/pi/packages/agent/docs/agent-harness.md` thinking-level boundary; observed redacted payload shape in Gate B |
| DeepSeek thinking uses `thinking.type` and mapped `reasoning_effort` | `.upstream/pi/packages/ai/src/api/openai-completions.ts` — `streamSimple()`, `thinkingFormat === "deepseek"` branch | relevant OpenAI-completions reasoning tests under `.upstream/pi/packages/ai/test/` |
| Reasoning content is retained for subsequent tool turns | `.upstream/pi/packages/ai/src/api/openai-completions.ts` — message conversion guarded by `requiresReasoningContentOnAssistantMessages` | relevant reasoning-details / thinking-as-text tests under `.upstream/pi/packages/ai/test/` plus real Gate B/C trace |
| Model `maxTokens` becomes the request cap when no override exists | `.upstream/pi/packages/ai/src/api/simple-options.ts` — `buildBaseOptions()` | redacted Gate B request payload must show `max_tokens: 8192` |

README and external integration documentation may orient the reader but are not
sufficient evidence for these Pi claims.

## 7. Credential and Secret Boundary

The main session owns credential-file design. The G005 execution session only
consumes the result.

```yaml
tracked_template: .env.example
local_secret_file: .env.g005
git_behavior: ignored_by_existing_.gitignore
allowed_secret_keys:
  - DEEPSEEK_API_KEY
allowed_non_secret_overrides: []
load_mechanism: "node --env-file=.env.g005"
```

Rules:

- the user writes the real key into `.env.g005` only;
- neither session may echo, print, hash, copy, stage, commit, attach or include
  the key in a report, Manifest, Journal, Session, error message or command;
- do not pass the key as a command-line argument;
- do not let model/tool code read `.env.g005` as a workspace file;
- model ID, endpoint, thinking level and budgets are contract-controlled, not
  environment overrides;
- logs may record only `credential_configured: true|false` and the allowed
  environment-variable name;
- the execution session must perform a post-run redaction scan for the literal
  loaded secret in generated textual artifacts without printing the search
  term or matching contents; only a boolean/count result may be stored;
- any detected secret leakage is a Pause Condition and makes the evidence
  invalid until the main session directs remediation.

The local `.env.g005` file is not a tracked deliverable and must remain in place
unless the user removes it.

## 8. Authorized Setup After Activation

Only after all activation preconditions pass may the execution session:

1. create a fresh `.runs/g005/` root;
2. create a fresh, non-hardlinked clone at `.runs/g005/pi` from the exact pinned
   `.upstream/pi` commit;
3. install the exact locked dependencies with lifecycle scripts disabled;
4. acquire and verify the same exact `@earendil-works/pi-ai@0.82.1` release
   artifact used by G003;
5. restore only the previously accepted 38 generated model-data files into the
   isolated clone after the same archive-safety and integrity checks;
6. run the same standard offline `pi-ai` and standard `pi-agent-core` builds;
7. compile the narrow G005 driver against emitted public packages;
8. create byte-identical Baseline and Candidate workspaces from the tracked
   fixed fixture;
9. load `.env.g005` into the driver process without exposing its contents;
10. make only the bounded provider calls defined by the required gates.

Reuse G003's locked artifact identity and setup scripts where possible:

```yaml
package: "@earendil-works/pi-ai@0.82.1"
integrity: "sha512-3WFYRhEp3lQB3444EhPMBcM7zSaEUE3eJgHOR7s4081NLqbw/FsWilIKWXSua0Gv3sRr7m9xMidR3pPDE7jI/A=="
shasum: "02ebdfc2997fd88ca1f51a7b5c01f337a9462f34"
source_git_head: b4f293684bba718d59cc1157679bcf6157b3a7f5
expected_data_inventory: 38_files
```

G005 does not reopen the G002/G003 setup-boundary decision. Any need to change
the artifact, restore a different inventory, run live model-data generation,
or alter the emitted-package build boundary is a Pause Condition.

## 9. Fixed Coding Task and Workspace

### 9.1 Fixture purpose

Use one tracked, dependency-free TypeScript fixture small enough to audit but
rich enough to require source inspection, an edit, a test ToolResult, and an
external completion decision.

The fixture must contain:

```text
spikes/pi-runtime/g005/fixtures/parse-duration/
  task.md
  package.json
  src/parse-duration.ts
  test/public.test.ts

spikes/pi-runtime/g005/verifier-cases/
  parse-duration.acceptance.test.ts
```

The mutable run workspaces receive only `task.md`, `package.json`, `src/` and
`test/public.test.ts`. The acceptance test remains outside the mutable
workspace and is executed only by the external Verifier.

### 9.2 Public specification

The task must give a complete, non-secret specification for a function with a
stable signature equivalent to:

```ts
export function parseDuration(input: string): number
```

The specification must require trimmed, unsigned base-10 integer magnitudes
with exact `ms`, `s`, or `m` units; return milliseconds; and reject malformed,
signed, decimal, missing-unit, unknown-unit, trailing-junk and unsafe-integer
inputs in the explicitly stated way. The initial implementation must contain a
plausible prefix-parsing/validation defect. Public tests cover core behavior;
the external acceptance suite covers all stated boundaries.

The acceptance suite must not introduce an unstated requirement. Its role is
completion verification, not a hidden trick.

### 9.3 Restricted tools

Use three project-owned harness tools rather than an unrestricted shell:

1. `read_task_and_source`
   - takes no path;
   - returns `task.md`, `src/parse-duration.ts`, and public test text;
   - caps combined output at 16 KiB.
2. `write_source`
   - accepts full UTF-8 TypeScript content;
   - writes only `src/parse-duration.ts`;
   - rejects content over 16 KiB, binary content and path input;
   - journals before/after SHA-256 and byte count, not source contents.
3. `run_public_tests`
   - accepts no command;
   - runs the one fixed `node --test test/public.test.ts` command in the
     current workspace;
   - uses a 15-second timeout;
   - returns exit code plus normalized output capped at 8 KiB.

This restricted surface is intentional for the first authenticated feasibility
check. It exercises real tool calling and ToolResult continuation while avoiding
an unreviewed general shell, arbitrary path access, dependency installation or
secret-file access. It is not the final Workbench tool architecture.

### 9.4 Deterministic external verifier

After every Agent Cycle settles, the Driver runs a separate deterministic
Verifier over the current workspace:

- execute public tests and the external acceptance test under the same recorded
  Node runtime;
- use a 30-second total timeout;
- emit structured check names, exit codes and normalized failure summaries;
- compute immutable verifier-source and fixture hashes;
- never allow the model tools to edit verifier inputs;
- preserve full verifier output as an artifact, with an 8 KiB normalized
  summary used for policy feedback.

Verifier truth takes precedence over the assistant's natural-language claim.

## 10. Baseline and Candidate Policy

Both variants start from separately created, byte-identical workspaces and use
the same model, thinking level, system prompt, task prompt, active tools,
provider settings, budgets, verifier, Node runtime and fixture hashes.

### 10.1 Baseline

```text
fresh Baseline workspace
→ one real AgentHarness prompt/run until settled
→ external Verifier once
→ record Outcome
→ stop regardless of pass/fail
```

The Baseline never receives the verifier result as model context.

### 10.2 Candidate

```text
fresh Candidate workspace
→ one real AgentHarness prompt/run until settled
→ external Verifier once
→ if pass: record Outcome and stop
→ if fail: append one bounded normalized verifier-feedback prompt to the same
  Pi Session
→ one Recovery Cycle until settled
→ external Verifier once more
→ record final Outcome and stop
```

The recovery prompt must state the immutable source path, prohibit test changes,
include only failed check names plus normalized failure summaries, and state
that this is the final recovery opportunity. It must not expose the hidden test
source.

If Candidate passes initially, no synthetic failure may be introduced merely
to exercise recovery. In that case, real-model transport, tool use, settlement
and completion-verifier feasibility are observed, while failure-triggered
recovery remains explicitly unobserved.

### 10.3 No effect claim

Real-model generation can vary even when inputs are identical. A Baseline /
Candidate mismatch in their initial edits is not itself unfairness, and one
pair cannot distinguish policy effect from sampling variation. G005 may report
mechanism feasibility, observed outcomes and whether recovery occurred; it may
not promote Completion Verification or claim performance improvement.

## 11. Hard Runtime and Recovery Budgets

```yaml
per_provider_request:
  output_token_cap: 8192
  timeout_ms: 120000
  transport_retries: 0

per_external_agent_cycle:
  max_provider_requests: 8
  max_tool_calls: 12
  wall_clock_timeout_ms: 300000

baseline:
  max_external_agent_cycles: 1
  max_verifier_runs: 1
  max_provider_requests_total: 8
  max_tool_calls_total: 12

candidate:
  max_external_agent_cycles: 2
  max_recovery_prompts: 1
  max_verifier_runs: 2
  max_provider_requests_total: 16
  max_tool_calls_total: 24

goal:
  max_variants: 2
  max_valid_paired_attempts: 1
  max_model_ids: 1
  max_wall_clock_after_first_model_request_ms: 1200000
```

Implementation must enforce provider-request count in a
`before_provider_request` hook and tool-call count in the Tool lifecycle. A
budget breach aborts the current run, is recorded as an Outcome, and must not
trigger an uncontracted retry or extra paired attempt.

No automatic context compaction is expected for this tiny fixture and 1M-token
model context. Any compaction event must be recorded and investigated before
interpreting the run.

The user's unrestricted API allowance removes a cost-availability blocker; it
does not remove reproducibility, time, output, retry or recovery budgets.

## 12. Required Gates

### Gate A — Public emitted-package and static configuration proof

Without sending a provider request:

- import `AgentHarness` and required Session APIs from the standard emitted
  `pi-agent-core` package;
- import `createModels`, types and required public APIs from the standard
  emitted `pi-ai` package;
- import `deepseekProvider()` through the public provider subpath;
- register the provider, construct the frozen project-side V4 Model, and prove
  `Models.checkAuth("deepseek")` reports configured without revealing auth;
- prove the Model descriptor passes the narrow strict TypeScript consumer build;
- assert all frozen descriptor and budget values;
- assert `.env.g005`, the acceptance test and any parent path are outside the
  model tool address space.

Pass requires public emitted imports and no source-path import. A need to import
Pi internals, patch Pi, or use SDK/RPC fails the intended route and pauses G005.

### Gate B — Baseline authenticated real-model run

- reset and hash the Baseline workspace;
- run the frozen task through direct `AgentHarness`;
- observe at least one successful provider response;
- observe at least one real tool call and matching ToolResult;
- require cycle settlement before the Verifier starts;
- run the Verifier exactly once and stop;
- record all budget counts and final Outcome.

The redacted `before_provider_payload` evidence must prove:

- model ID is `deepseek-v4-flash`;
- `thinking.type` is `enabled`;
- `reasoning_effort` is `high`;
- `max_tokens` is `8192`;
- tools are present;
- no API key or authorization header is recorded.

### Gate C — Candidate authenticated run and conditional recovery

- reset and hash the Candidate workspace and prove byte identity with Baseline
  initial state;
- run the same initial task under the same frozen inputs;
- run the external Verifier only after settlement;
- if initial verification fails, provide exactly one bounded recovery prompt in
  the same Pi Session, settle, and verify exactly once more;
- if initial verification passes, stop without recovery;
- record whether the failure-triggered recovery path was observed.

Gate C passes when the policy is applied exactly as contracted and final
Outcome is recorded. Candidate success is not required to prove route
feasibility; provider/tool/session failure must instead be classified precisely.

### Gate D — Event, Session and reasoning continuity evidence

For every provider and tool turn, correlate:

```text
run_started
→ session_linked
→ agent_cycle_started
→ before_provider_request
→ redacted_provider_payload_observed
→ provider_response_observed
→ tool_execution_start
→ tool_execution_end
→ session_tool_call_and_result_visible
→ agent_cycle_settled
→ verifier_started
→ verifier_completed
→ policy_decision
→ optional_recovery_prompt_appended
→ optional_recovery_cycle_settled
→ run_completed
```

For a tool-using reasoning turn, prove from Pi Session projection and redacted
payload-shape metadata that the assistant Tool Call, associated ToolResult and
required reasoning-content field survive into the next provider request. Do not
persist private chain-of-thought text; retain only presence, byte count and
association metadata needed to prove protocol continuity.

### Gate E — Fairness, provenance, budgets and secret safety

The Manifest must include:

- root project commit, pinned Pi commit and emitted package versions;
- DeepSeek documentation retrieval timestamp;
- model descriptor and compatibility fields;
- Node/npm/OS/runtime identity;
- system/task/recovery prompt hashes and full tracked prompt paths;
- Baseline/Candidate initial workspace inventory, byte hashes and equality;
- verifier and tool implementation hashes;
- active tools and normalized schemas;
- model/thinking/endpoint/request cap/retry/timeout values;
- provider requests, tool calls, Agent Cycles, recovery prompts, verifier runs,
  token usage, wall time and recorded cost metadata;
- session IDs, event-journal paths and final workspace hashes;
- credential key name and configured boolean only;
- secret-leak scan boolean/count without the secret or matching contents;
- run order and statement that provider sampling seed is unavailable unless the
  API proves otherwise.

Pass requires all hard budgets respected, no unrecorded retry, no secret leak,
and no initial-state or configuration drift between variants.

## 13. Required Artifacts and Tracked Deliverables

After activation, tracked implementation may be created only under:

```text
spikes/pi-runtime/g005/
```

Expected tracked files:

```text
spikes/pi-runtime/g005/README.md
spikes/pi-runtime/g005/package.json
spikes/pi-runtime/g005/tsconfig.json
spikes/pi-runtime/g005/driver.ts
spikes/pi-runtime/g005/tools.ts
spikes/pi-runtime/g005/verifier.ts
spikes/pi-runtime/g005/fixtures/parse-duration/task.md
spikes/pi-runtime/g005/fixtures/parse-duration/package.json
spikes/pi-runtime/g005/fixtures/parse-duration/src/parse-duration.ts
spikes/pi-runtime/g005/fixtures/parse-duration/test/public.test.ts
spikes/pi-runtime/g005/verifier-cases/parse-duration.acceptance.test.ts
spikes/pi-runtime/g005/test/gates.test.ts
```

Generated evidence belongs only under ignored `.runs/g005/`, including:

```text
manifest.json
event-journal.jsonl
baseline/session.jsonl
baseline/outcome.json
baseline/verifier-output.txt
baseline/workspace/
candidate/session.jsonl
candidate/outcome.json
candidate/verifier-output-initial.txt
candidate/verifier-output-recovery.txt   # only when recovery occurs
candidate/workspace/
secret-scan.json
setup-and-command-log.md
```

Required reports:

```text
docs/reports/G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_REPORT.md
docs/reports/G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLOSEOUT.md
```

The closeout must update `CURRENT_STATE.md` truthfully and list exact commands,
results, artifacts, observed failures, unverified claims, scope changes and
decisions required from the user.

## 14. Required Disposition

The closeout must choose exactly one:

```yaml
PASS_REAL_MODEL_FEASIBILITY:
  meaning: the frozen direct AgentHarness real-model route completed both valid
    variants with auditable tool/session/verifier evidence; this is not Policy
    effectiveness or final Pi Go

FAIL_REAL_MODEL_ROUTE:
  meaning: a reproducible failure in the frozen public Pi/provider/tool/session
    route prevents the required feasibility loop under this contract

BLOCKED_G005_SETUP_OR_EXTERNAL_SERVICE:
  meaning: credential, model availability, service/network, artifact, build or
    other pre-run setup condition prevented a valid architectural test

INVALID_G005_EVIDENCE:
  meaning: fairness drift, budget breach, secret leak, corrupted artifacts or
    contract deviation prevents interpretation of the run
```

If recovery is not triggered because Candidate passes initially, the report
must say `failure_triggered_recovery_observed: false`; this alone does not turn
the route-feasibility disposition into failure.

## 15. Definition of Done

G005 is complete only when all applicable items are true:

- activation preconditions and exact accepted root HEAD were recorded;
- `.upstream/pi` remained clean and Pi Core patch count remained zero;
- the exact G003 artifact/setup boundary was preserved;
- Gate A completed before the first model request;
- the current official model ID and external API facts were rechecked;
- exactly one valid Baseline and one valid Candidate variant were attempted;
- each variant used a fresh, byte-identical initial workspace;
- at least one successful authenticated provider response and real tool round-
  trip were observed;
- the external Verifier ran only after Agent Cycle settlement;
- Candidate recovery occurred at most once and only after a failed verifier;
- all budgets were enforced and recorded;
- reasoning continuity was evidenced without retaining chain-of-thought text;
- no credential was exposed or committed;
- Manifest, Journal, Sessions, Workspaces and Outcomes correlate;
- required tracked driver/fixture/tests and both reports exist;
- exact verification commands and their results are recorded;
- all remaining unknowns and non-claims are explicit;
- `CURRENT_STATE.md` is updated;
- one required disposition is selected;
- main-session architecture review remains pending after closeout.

Completion does not authorize a formal Workbench, V0 architecture freeze,
Completion Verification promotion, Pro comparison, broader task suite, Pi Core
change, or subsequent Goal.

## 16. Explicitly Deferred

- statistical Policy evaluation or promotion thresholds;
- multiple tasks, repeated seeds or model comparison;
- `deepseek-v4-pro`, `max` thinking and automatic model fallback;
- general shell, unrestricted filesystem tools or general sandboxing;
- long-running Tool cancellation stress;
- crash-after-side-effect durability;
- settled cross-process Session reconstruction;
- context compaction and Tool Result Budget platform work;
- SDK Runner, RPC and process-isolation fallback;
- Pi Core changes or generated-catalog maintenance;
- MCP, Multi-Agent, Subagent, Web UI, SQLite, containers and Harbor;
- formal `workbench/` creation and V0 Version Charter.

These items do not become goals merely because they remain unverified.

## 17. Pause Conditions

Stop and return to the main session before further model calls if any of the
following occurs:

- public emitted-package imports are insufficient;
- the current DeepSeek model ID or API contract differs materially from the
  frozen descriptor;
- Pi needs a source patch, generated-catalog edit or nonstandard build;
- the exact accepted artifact cannot be safely reused;
- credential material appears in output or artifacts;
- the model/tool surface can reach `.env.g005`, verifier source or paths outside
  the run workspace;
- the first provider request sends an unexpected model, endpoint, thinking
  field, token cap or credential-bearing captured payload;
- DeepSeek tool/reasoning replay fails in a way that suggests a compatibility
  fork;
- any hard request/tool/cycle/recovery/time budget is exceeded;
- the fixture or verifier specification must change after the first provider
  request;
- Baseline/Candidate initial state or configuration differs;
- a second valid paired attempt, second model, Pro fallback or extra recovery is
  proposed;
- a destructive action, external publication, Pi Core modification, formal
  Workbench creation or materially expanded scope becomes necessary.

An ordinary task failure is evidence, not automatically a Pause Condition. The
session should stop only when continuing would violate the contract or require
an architecture/user decision.

## 18. Proposed Execution-session Handoff

After activation, the main session should give a dedicated G005 session a
bounded prompt equivalent to:

> Execute only the activated
> `G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY` contract. Read the
> required files in order, verify activation preconditions before setup, use the
> ignored `.env.g005` only through process environment, and never expose the
> credential. Preserve the pinned Pi and G003 artifact/build boundary. Use only
> the frozen DeepSeek V4 Flash/high profile, fixed fixture, restricted tools and
> hard budgets. Produce all artifacts, tests, report, closeout and truthful
> `CURRENT_STATE.md` update. Do not commit, modify Pi Core, create formal
> `workbench/`, add another model/attempt/recovery, or choose an architectural
> fork. Stop on any listed Pause Condition and return the decision to the main
> session.

The main session retains architecture decisions, interpretation, Goal closure
acceptance and all discussion with the user.
