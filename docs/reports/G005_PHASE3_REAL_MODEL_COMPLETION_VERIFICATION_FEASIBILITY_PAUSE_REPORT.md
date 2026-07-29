# G005 Phase 3 Real-model Completion Verification Feasibility — Pause Report

Date: 2026-07-29  
Goal: `G005`  
Status: `PAUSED_FOR_ARCHITECTURE_DECISION`  
Raw execution disposition: `FAIL_REAL_MODEL_ROUTE`  
Reviewed disposition: `INVALID_G005_EVIDENCE` (recommended; not yet accepted by Main Session)

## 1. Executive conclusion

**Fact.** G005 must remain paused. No Candidate provider request was made and no
additional model call is authorized by this report.

**Fact.** The Baseline did not fail to use the Direct `AgentHarness` route. It
completed four real `deepseek-v4-flash` responses, called all three restricted
tools, received all corresponding Tool Results, wrote a repaired source file,
passed the public tests, produced a final assistant response and emitted one
`settled` event.

**Fact.** The process stopped before the external Baseline Verifier because the
G005 Driver incorrectly required an `after_provider_response` counter that it
had registered through `AgentHarness.on(...)`. At pinned Pi commit
`027a5847901b5dde30270abaa1041046cd2b4b55`,
`AgentHarness.createStreamFn()` emits `after_provider_response` through
`emitOwn(...)`, and `emitOwn(...)` notifies only `subscribe(...)` listeners.
The counter therefore remained zero even though completed responses were
already proven by assistant messages, response IDs and usage.

**Inference.** `FAIL_REAL_MODEL_ROUTE` is not supported by the preserved
evidence. The immediate failure belongs to project-side observability and
evidence logic, not to DeepSeek authentication, Pi public imports, tool use,
reasoning replay, or model coding ability.

**Recommendation.** Treat the current attempt as `INVALID_G005_EVIDENCE`, not
as a Pi or DeepSeek route failure. The Main Session should choose explicitly
between a narrowly controlled same-attempt resume and a clean retry goal. For
portfolio-grade evidence, a clean retry goal is the stronger option.

## 2. Preconditions and setup

**Fact.** All Activation Preconditions passed before setup:

- project HEAD was exactly `33c7e534b2d0f13201384ab754c7f3c9351635a0`;
- root status contained only the accepted untracked `reference/` tree;
- `.env.g005` existed and was ignored; its contents were not read by the
  control shell;
- `.upstream/pi` was clean at
  `027a5847901b5dde30270abaa1041046cd2b4b55`;
- `.runs/g005` and `workbench/` were absent;
- execution was Windows-native with Node `v24.14.1`.

**Fact.** The isolated setup reused the G003 accepted boundary:

- local clone used `git clone --local --no-hardlinks`;
- dependencies used `npm.cmd ci --ignore-scripts`;
- exact `@earendil-works/pi-ai@0.82.1` artifact integrity and archive safety
  matched the G003 frozen values;
- 712 archive members and exactly 38 selected model-data files were observed;
- pinned `check:model-data` passed;
- standard `pi-ai build:offline` passed;
- standard `pi-agent-core build` passed;
- the isolated Pi clone retained an empty tracked status.

**Fact.** The first non-model `npm pack` attempt failed because the sandbox
could not write the system npm cache. The exact fixed command was rerun with
the required filesystem approval and succeeded. This did not alter artifact
identity or build boundaries.

## 3. Gate A and offline validation

**Fact.** Gate A passed with `credential_configured=true` and
`providerCalls=0`.

**Fact.** Runtime and TypeScript resolution pointed to emitted public files:

- `.runs/g005/pi/packages/agent/dist/index.js` / `index.d.ts`;
- `.runs/g005/pi/packages/ai/dist/providers/deepseek.js` / `deepseek.d.ts`.

**Fact.** Strict TypeScript validation passed, and the offline checks proved:

- the frozen Model descriptor and three restricted tool schemas;
- no tool accepts a general path or command;
- the initial fixture is public-pass / hidden-fail;
- the external verifier accepts a complete deterministic repair;
- the redacting Session storage retains reasoning in process memory for replay
  while removing reasoning text before JSONL persistence.

**Fact.** A pre-execution Node strip-only syntax error was fixed before any
workspace, manifest, event, provider request or attempt existed. Read-only
checks confirmed all five were absent, so it did not consume the single valid
paired attempt.

## 4. Preserved Baseline evidence

Evidence path:

- `.runs/g005/evidence/events/baseline.jsonl`
- `.runs/g005/evidence/sessions/baseline.jsonl`
- `.runs/g005/evidence/manifests/baseline-initial.json`
- `.runs/g005/evidence/manifests/candidate-initial.json`
- `.runs/g005/evidence/manifests/pair.json`
- `.runs/g005/evidence/outcomes/execution-failure.json`

**Fact.** The paired initial workspace digests were byte-identical:

`b854f2c18447597ec20eb3488045aff8f20ba877047f72782eb1cbc8adfdb64c`

**Fact.** Every captured provider payload used:

- model `deepseek-v4-flash`;
- `thinking: { type: "enabled" }`;
- `reasoning_effort: "high"`;
- `max_tokens: 8192`;
- exactly the three frozen tools;
- no temperature field;
- no captured authorization or API-key field.

**Fact.** Baseline provider/tool sequence:

1. request 1 returned a `read_task_and_source` Tool Call;
2. request 2 replayed prior reasoning metadata and returned `write_source`;
3. request 3 replayed prior reasoning metadata and returned
   `run_public_tests`;
4. request 4 replayed prior reasoning metadata and returned a final response;
5. all three tools ended with `isError=false`;
6. the public test tool reported exit code 0;
7. one `agent_settled` event followed the final response.

**Fact.** The model changed only `src/parse-duration.ts`, from SHA-256
`fc0771785d0a8bf601f205584c5b85fdf4769e13bba3229fef86d7622fedbb03`
to `ad11e084a1e5e984e8ab72ed99e4e5b77f6e37e320789b24e7d4b1fec92666c6`.

**Unconfirmed.** The repaired Baseline source appears to implement the stated
trailing-character and safe-integer requirements, but the external Verifier
was not run after the false-negative route assertion. It must not be reported
as hidden-test pass.

**Fact.** Candidate was never started. Its workspace remains at the initial
fixture source hash, and no Candidate event journal exists.

## 5. Root cause

Pinned Pi evidence:

- `.upstream/pi/packages/agent/src/harness/agent-harness.ts:229`,
  `AgentHarness.emitOwn()` iterates only the subscriber handler set;
- `.upstream/pi/packages/agent/src/harness/agent-harness.ts:417`,
  `createStreamFn()` sends `after_provider_response` through `emitOwn()`.

G005 Driver evidence:

- `spikes/pi-runtime/g005/driver.ts:318` registered
  `after_provider_response` through `harness.on(...)`;
- `spikes/pi-runtime/g005/driver.ts:342` rejected the cycle because the
  resulting counter was zero.

**Fact.** The G005 subscriber did observe normal assistant, tool and settlement
events, but its switch did not count `after_provider_response`.

**Inference.** A minimal project-side correction is to count the observational
event in the existing `subscribe(...)` listener. No Pi Core patch is necessary.

**Fact.** A secondary evidence-schema issue is also present: journal field
spreading allows a nested record's `type` field to replace the intended outer
event type (`reasoning_metadata` became `thinking`, and `tool_side_effect`
became `source_write`). It did not expose reasoning text, but it should be
corrected before any accepted retry evidence.

## 6. CoT and credential handling

**Fact.** The persisted Session JSONL contains Tool Calls, Tool Results and
visible assistant text but no thinking blocks, reasoning正文 or thought
signatures. The event journal contains only reasoning presence, character
length, UTF-8 byte length and entry association.

**Fact.** No credential value was printed or passed on the command line. Model
processes received configuration only through
`node --env-file=.env.g005 ...`.

**Fact.** A post-pause scan checked the 42 current files under the G005 tracked
Spike, evidence and paired workspaces and found zero occurrences of the
credential value. The result is preserved at
`.runs/g005/evidence/security/paused-artifact-secret-scan.json`.

**Unconfirmed.** This is not the final Gate E scan: any authorized continuation
will create more artifacts and must rerun the scan after all evidence is
complete.

## 7. Decision required

### Option A — narrowly resume the same paired attempt

Authorize all of the following as one explicit exception:

1. correct the observer to count `after_provider_response` via
   `subscribe(...)`;
2. correct the journal event-type collision;
3. do not rerun Baseline and do not call a second model;
4. run the external Verifier against the preserved settled Baseline workspace;
5. run only the untouched Candidate half of the already-created pair;
6. annotate the split-process and observer-version difference in all evidence.

**Trade-off.** This is cheaper and preserves the single Baseline/Candidate task
pair, but the two variants would not share an identical observer build, even
though the model-facing payload and policy are unchanged.

### Option B — close G005 as invalid evidence and authorize a clean retry goal

1. preserve the current `.runs/g005` tree unchanged;
2. close G005 with `INVALID_G005_EVIDENCE`;
3. review and commit the two project-side observer fixes;
4. create a separate bounded retry Goal with a new run root and exactly one new
   paired attempt.

**Trade-off.** This costs a fresh pair of model calls but yields symmetric,
clean, portfolio-grade evidence and avoids post-hoc reconstruction.

**Recommendation.** Choose Option B. The current Baseline is valuable route
evidence, but the project explicitly prioritizes auditability and fair paired
evidence over minimizing a small number of model calls.

## 8. Current stop state

```yaml
G005:
  active: true
  execution: paused
  provider_calls_completed: 4
  baseline_settled: true
  baseline_external_verifier: not_run
  candidate_started: false
  additional_model_calls: stopped
  raw_disposition: FAIL_REAL_MODEL_ROUTE
  recommended_reviewed_disposition: INVALID_G005_EVIDENCE
  architecture_decision_required: true
```

No Closeout or `CURRENT_STATE.md` update is produced until the Main Session
accepts one of the two paths.
