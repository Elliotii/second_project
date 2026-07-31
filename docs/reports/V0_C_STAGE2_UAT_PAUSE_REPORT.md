# V0-C Stage 2 UAT Pause Report

```yaml
status: paused
disposition: PAUSED_V0_C_STAGE2_UAT_PRE_DISPATCH_COMPOSITION_DEFECT
execution_owner: fresh_v0_c_user_acceptance_session
implementation_baseline_commit: 12db75aaea4db4afb774046cfcc94de772a2e90b
workbench_tree_digest: a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446
formal_product_run_invocations: 1
formal_run_id: run-1d7829b0-338f-4555-b6ac-72d5d08b228d
formal_attempt_ids:
  - attempt-510f7fe5-a730-4b4a-83eb-f2c236761554
external_http_provider_calls: 0
real_model_responses: 0
tool_calls: 0
verifier_runs: 0
recovery_attempts: 0
token_usage: 0
cost_usage_usd: 0
credential_reads: 1
second_run_created: false
source_edits: 0
pi_patches: 0
git_commits: 0
```

## 1. Pause decision

**Fact.** The one-time Stage 2 authority marker was exclusively created at
`2026-07-31T02:26:07.0905161Z`. The formal Product Surface was invoked exactly
once at `2026-07-31T02:26:07.1441593Z`, creating
`.runs/v0-c/runs/run-1d7829b0-338f-4555-b6ac-72d5d08b228d`.

**Fact.** The UAT-local `before_provider_payload` assertion rejected the
payload with `provider payload Tool Profile drift` before transport dispatch.
The Session then settled an assistant error with empty content and exact zero
usage. No Tool, external Verifier, Outcome, evidence index, secret scan, or
terminal record was produced.

**Fact.** The explicit delegation forbids a second formal Run. The unique Run
identity already exists and its authority marker is consumed. This Session
therefore stopped and did not repair/reinvoke the Product Surface.

**Disposition.** Stage 2 UAT is paused, not passed or failed as a product
acceptance result. The frozen Workbench did not receive a real model response
and its completion/recovery behavior remains untested by this Run.

## 2. Frozen pre-call gates

The following zero-call gates passed before authority consumption:

| Check | Observed result |
| --- | --- |
| Root HEAD | `12db75aaea4db4afb774046cfcc94de772a2e90b` |
| Root tracked changes | none |
| Allowed pre-existing untracked state | `docs/reports/V0_C_STAGE2_FREEZE_AND_UAT_START_PROMPT.md`, `reference/` |
| Workbench digest, excluding `node_modules` | `a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446` |
| `.upstream/pi` HEAD / status | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| `.runs/v0-a/pi` HEAD / status | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| Focused re-audit | `PASS_FOCUSED_V0_C_REAUDIT` |
| Task manifest digest | `7f7e29ba432409da0cad3f80c471a5a8188183575a92e4ebe68b6c67d95b6376` |
| Instruction digest | `22b166bda844a1a4de90d54b4fa399896ce6e418b3fd5abc094a39409bdb0f35` |
| Workspace source digest | `83e14ee6480099d479faa392fb9dc5eb1db6e5e860b93702289ef20ca2cc3e0c` |
| Verifier digest | `0228b85b1fa58ca375c14d6860ba86e2af0e5c9d01308343f5a4fe07519145b7` |
| Strategy digest | `72692b3f73eae80c38fafab3f38df3bff8fca7fd62488a4a535e2967a7957ae8` |
| Strict Workbench TypeScript | passed |
| Focused post-audit regressions | 8/8 passed |
| Formal CLI dry-run | passed; zero network/provider calls and no Run identity |
| UAT composition strict TypeScript | passed |
| UAT composition SHA-256 | `e4cd44434c126524145ab68e06253253ecc3f749d40dfed74a7e7d3a01cd8a60` |
| Public imports | emitted `pi-agent-core`, `pi-ai`, and `pi-ai/providers/deepseek` |
| Formal entry point | `workbench/src/product-surface-v0c.ts:runV0CProductSurface` |

The current official DeepSeek documentation checkpoint did not conflict with
the frozen model ID, Chat Completions route, thinking/tool-call behavior,
reasoning replay requirement, or frozen stricter token/cost limits:
[Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/),
[Thinking Mode](https://api-docs.deepseek.com/guides/thinking_mode/), and
[Chat Completion API](https://api-docs.deepseek.com/api/create-chat-completion/).

## 3. Failure evidence and call classification

### 3.1 Observed lifecycle

| Event or counter | Count |
| --- | ---: |
| Formal Product Surface invocation | 1 |
| Run identity | 1 |
| Harness instance created / closed | 1 / 1 |
| Initial Attempt started | 1 |
| `before_provider_request` lifecycle event | 1 |
| Provider payload accepted by UAT hook | 0 |
| HTTP Provider response observed | 0 |
| Assistant messages | 1 error message |
| Assistant usage | 0 tokens / USD 0 |
| Tool calls / starts / ends / results | 0 / 0 / 0 / 0 |
| Verifier runs | 0 |
| Recovery attempts | 0 |
| Terminal commit | 0 |

**Fact.** Journal event 6 is a pre-dispatch
`provider_request_started` lifecycle observation. It is not evidence of an
HTTP request. The following evidence independently establishes pre-dispatch
termination:

- the UAT failure summary records `payloads_validated: 0`,
  `provider_responses: 0`, zero usage, and the exact local assertion error;
- the reasoning-safe Session records an assistant error with empty content,
  `stopReason: error`, and all usage/cost fields equal to zero;
- no response ID, Provider response event, Tool event, or model text exists;
- pinned Pi
  `.upstream/pi/packages/agent/src/harness/agent-harness.ts`,
  `AgentHarness.createStreamFn()` lines 403-424, installs the
  `before_provider_payload` hook as `onPayload`;
- pinned Pi
  `.upstream/pi/packages/ai/src/api/openai-completions.ts`,
  `streamOpenAICompletions()` lines 232-244, awaits `onPayload` before calling
  `client.chat.completions.create(...)`;
- pinned Pi test
  `.upstream/pi/packages/agent/test/harness/agent-harness-stream.test.ts`
  lines 195-204 exercises the public `before_provider_payload` hook.

**Inference.** External HTTP Provider calls, real model responses, network
cost, and model token usage were all zero. This is stronger than merely
observing the absence of an `after_provider_response` event because the
recorded exception arose on the source-proven pre-transport boundary.

### 3.2 Root cause

**Fact.** The UAT-local assertion expected the three G006 experimental tools
`read_task_and_source`, `run_public_tests`, and `write_source`.

**Fact.** The frozen V0-C Product Surface uses
`workbench/src/pi/tool-profile.ts:createBoundedToolProfile()`, whose actual
bounded Tool Profile contains:

```text
workspace_read
workspace_list
workspace_search
workspace_edit
workspace_write
run_command
```

**Conclusion.** The cause is a UAT-local composition assertion defect. It is
not evidence of a frozen Workbench source defect, Pi Core failure, DeepSeek
transport failure, model failure, or task failure.

## 4. Evidence integrity and secret handling

The incomplete Run preserves:

- config copies of the frozen instruction, task, strategy, and Verifier;
- the untouched temporary Workspace;
- eight journal entries through `attempt_settled`;
- a reasoning-safe Session containing one user message and one zero-usage
  assistant error.

The temporary Workspace final digest remains
`83e14ee6480099d479faa392fb9dc5eb1db6e5e860b93702289ef20ca2cc3e0c`,
equal to the frozen source digest. No Tool was allowed to mutate it.

`node workbench/src/cli.ts inspect --run
run-1d7829b0-338f-4555-b6ac-72d5d08b228d` returned exit 1 with
`committed: false`, `integrity_valid: false`, and the sole error
`required evidence missing or unreadable: terminal.json`. This is the honest
state of an interrupted Run and must not be backfilled.

A UAT-local scan of all 11 Run files plus six runtime control/log artifacts
completed over 17 files with zero secret/reasoning matches. The scan result is
`.runs/v0-c/uat/scoped-pause-secret-scan.json`. It is advisory pause evidence,
not a substitute for the integrated preterminal scanner that the incomplete
Run never reached.

A broader diagnostic scan also included the UAT TypeScript source and reported
one `credential_assignment` rule match. Read-only review localized it to a
non-secret source-code variable assignment; no credential value was present.
The narrower evidence/runtime scan is the relevant persisted-artifact scope.

The credential file was read once, only to resolve the exact
`DEEPSEEK_API_KEY` entry after authority consumption. No credential value was
printed, copied to the Run, committed, or included in this report.

## 5. Verification commands and results

| Command | Result |
| --- | --- |
| `.runs/v0-a/pi/node_modules/.bin/tsc.cmd -p workbench/tsconfig.json` | exit 0 |
| `node --test workbench/tests/v0c-post-audit-correction.test.ts` | exit 0; 8/8 |
| `node workbench/src/cli.ts run --task fixtures/manifests/v0-c-parse-duration-public.json --strategy v0_c_recover_once_same_session_deepseek_v4_flash --dry-run` | exit 0; zero-call plan |
| `.runs/v0-a/pi/node_modules/.bin/tsc.cmd -p .runs/v0-c/uat/tsconfig.json` | exit 0 |
| `node .runs/v0-c/uat/stage2-uat-composition.ts` | invoked once; exit 1 after pre-dispatch local assertion |
| `node workbench/src/cli.ts inspect --run run-1d7829b0-338f-4555-b6ac-72d5d08b228d` | exit 1; incomplete/uncommitted as expected |
| `node .runs/v0-c/uat/scoped-pause-secret-scan.ts` | exit 0; 17 files, 0 matches |
| Workbench and Workspace `treeDigest(...)` recheck | both equal frozen digests |

## 6. What remains unverified

**Unconfirmed.** This Run provides no evidence about:

- DeepSeek authentication or transport availability;
- real model Tool behavior;
- external Verifier outcome;
- natural pass/no-recovery behavior;
- natural failure eligibility and same-Session Recovery;
- terminal evidence construction under a completed Stage 2 Run;
- end-to-end Product Surface user acceptance.

## 7. Main Session decision required

**Recommendation.** Preserve this Run and all UAT-local artifacts unchanged.
Do not classify it as a product UAT failure and do not repair/backfill its
missing terminal evidence.

Any continuation would require the Main Session and user to explicitly approve
a scope expansion: freeze a corrected UAT composition identity and authorize a
new formal Product Surface Run. The present authority does not permit that
action, and this UAT Session has not taken it.

## Main-review accuracy correction

Main review corrected only the Task manifest SHA-256 in the frozen pre-call
table. This documentation-only hash correction does not alter the original Run
evidence, root-cause analysis, preserved artifacts, or Pause disposition.
