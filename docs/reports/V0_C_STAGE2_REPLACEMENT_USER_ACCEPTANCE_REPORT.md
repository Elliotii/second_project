# V0-C Stage 2 Replacement User-Acceptance Report

```yaml
status: completed
suggested_disposition: PASS_V0_C_USER_ACCEPTANCE
execution_owner: fresh_replacement_uat_session
implementation_baseline_commit: 12db75aaea4db4afb774046cfcc94de772a2e90b
workbench_tree_digest: a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446
replacement_composition_sha256: e543fce7d648fdfc4fcd1b91e7a21c8799a83662e86e850001d5a8741d4fb906
replacement_product_run_invocations: 1
replacement_run_id: run-c3297fc5-bfd1-4bd1-b46c-3a636271a177
attempt_count: 1
recovery_observed: false
external_provider_calls: 5
real_model_calls: 5
tool_calls: 8
verifier_runs: 1
token_usage: 16625
cost_usage_usd: 0.0012407808000000002
source_edits: 0
pi_patches: 0
git_stage_or_commit: 0
second_replacement_run: false
```

## 1. Result

**Fact.** The user-authorized replacement Product Surface was invoked exactly
once from the frozen replacement composition. It created and committed:

```yaml
run_id: run-c3297fc5-bfd1-4bd1-b46c-3a636271a177
run_root: .runs/v0-c/runs/run-c3297fc5-bfd1-4bd1-b46c-3a636271a177
attempt_id: attempt-f6d6a9c6-d299-44d5-9283-a71d48f37288
session_id: session-0cd59a8b-5b9a-4665-8444-88e52470ffaf
workspace_id: workspace-8c1e52a0-0d13-4f45-82ec-f6c26e3fdfad
attempt_ordinal: 1
parent_attempt_id: null
failure_packet_id: null
```

**Fact.** The initial external Verifier passed. The Completion decision was
`stop_passed`, the Outcome was `passed`, and the terminal reason was
`verifier_passed`. The Run therefore stopped after one Attempt with zero
Recovery slots consumed. No child Attempt or Failure Packet was created.

**Fact.** Formal `inspect` returned exit 0 with `committed: true`,
`integrity_valid: true`, 27 indexed artifacts and no errors.

**Inference.** This exact frozen Task completed successfully through the real
DeepSeek Product Surface. Because the initial Verifier passed, this Run
correctly demonstrates the no-recovery stop path, not a naturally observed
real same-Session Recovery.

## 2. Frozen identity and Gate A

All checks occurred before the replacement marker, credential inspection and
real execution.

| Boundary | Observed result |
| --- | --- |
| Root HEAD | `12db75aaea4db4afb774046cfcc94de772a2e90b` |
| Root tracked state | clean |
| Allowed untracked state | registered reports/Prompts and `reference/` only |
| Workbench digest, excluding `node_modules` | `a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446` |
| `.upstream/pi` HEAD/status | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| `.runs/v0-a/pi` HEAD/status | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| Focused re-audit | `PASS_FOCUSED_V0_C_REAUDIT` |
| Old failed Run inventory | 11 files; `95d7794920058916e3b7250cd8ec6b60a3e42672c6c2c032d4fcbc4d61506ee6` |
| Old UAT inventory | 15 files; `885a7caf12fbc87b1109bd4f14b6ee3c86f40dd027a428aca1fab48a2e4da8fd` |
| Replacement source inventory | 5 files; `dcb94bbba28c614fb37f6d1f215fea6a0089ac549b977aa22643217894e54472` |
| Replacement composition | `e543fce7d648fdfc4fcd1b91e7a21c8799a83662e86e850001d5a8741d4fb906` |
| Marker/summary state before Gate | all absent |
| `.env.g005` | existed; content was not displayed |

The old failed Run and old UAT inventories were recomputed again after the
replacement Run and remained exact.

## 3. Frozen Task, provider and budget

```yaml
task_manifest:
  path: fixtures/manifests/v0-c-parse-duration-public.json
  sha256: 7f7e29ba432409da0cad3f80c471a5a8188183575a92e4ebe68b6c67d95b6376
instruction_sha256: 22b166bda844a1a4de90d54b4fa399896ce6e418b3fd5abc094a39409bdb0f35
workspace_source_digest: 83e14ee6480099d479faa392fb9dc5eb1db6e5e860b93702289ef20ca2cc3e0c
verifier:
  id: v0-c-parse-duration-public-v1
  sha256: 0228b85b1fa58ca375c14d6860ba86e2af0e5c9d01308343f5a4fe07519145b7
  visibility: public_external
strategy:
  id: v0_c_recover_once_same_session_deepseek_v4_flash
  sha256: 72692b3f73eae80c38fafab3f38df3bff8fca7fd62488a4a535e2967a7957ae8
provider: deepseek
base_url: https://api.deepseek.com
model: deepseek-v4-flash
thinking_level: high
transport_timeout_ms: 120000
transport_max_retries: 0
```

The current official DeepSeek pages still identified the frozen model and
OpenAI-format base URL, Chat Completions support, thinking mode with
`reasoning_effort: high`, Tool calls, required `reasoning_content` replay after
Tool calls, and prices of USD 0.0028/M cache-hit input, 0.14/M cache-miss input
and 0.28/M output. The official maximum output is higher than the frozen 8192
limit, so the frozen limit remains the stricter cap:

- <https://api-docs.deepseek.com/quick_start/pricing/>
- <https://api-docs.deepseek.com/guides/thinking_mode/>
- <https://api-docs.deepseek.com/api/create-chat-completion/>

No alternate model, route, retry policy or price was substituted.

## 4. Mandatory zero-call checks

Before authority consumption:

| Check | Result |
| --- | --- |
| Strict Workbench TypeScript | exit 0 |
| Focused post-audit regressions | exit 0; 8/8 passed |
| Formal CLI dry-run | exit 0; no credential, Provider, network or Run identity |
| Replacement candidate TypeScript | exit 0 |
| `validate-replacement-candidate.ts` | exit 0 |
| Tool names | exact six names at local construction and payload boundary |
| Candidate validator counters | 0 Product Runs, Run identities, credential reads, network, Provider and model calls |
| Frozen hashes/source identity recheck | passed |

The exact Tool Profile was:

```text
workspace_read
workspace_list
workspace_search
workspace_edit
workspace_write
run_command
```

## 5. One-time authority and execution

The marker was exclusive-created at:

```text
.runs/v0-c/uat-replacement-candidate/
stage2-replacement-run-authority-consumed.json
```

It records schema 1, the exact authorization source, one authorized Product
Run, the frozen composition digest and
`consumed_at: 2026-07-31T10:18:01.4660257Z`.

After marker creation, a minimum local check established that `.env.g005`
contained exactly one non-empty `DEEPSEEK_API_KEY`; no value was printed,
copied or persisted. The frozen composition then resolved that credential once
for the real execution dependency and reported `credential_reads: 1`.

The only replacement execution command was:

```text
node .runs/v0-c/uat-replacement-candidate/stage2-uat-replacement-composition.ts
```

The calling shell returned timeout/exit 124 after approximately 5 seconds, but
the already-started unique Node process remained alive. The Session did not
invoke the command again. Read-only monitoring observed the same process exit
naturally after it wrote the success summary at
`2026-07-31T10:18:57.390Z`.

**Fact.** There was one invocation, one replacement marker, one replacement
success summary and one replacement Run identity. The shell wrapper's timeout
is not a second Run and did not interrupt the already-running Product process.

**Unconfirmed.** The detached child process's numeric OS exit code was not
available after the caller timeout. Product completion is instead established
by the write-once success summary, committed terminal record, and successful
formal Inspector.

## 6. Usage, lineage and terminal evidence

| Usage | Attempt | Run limit |
| --- | ---: | ---: |
| Provider requests/responses | 5 / 5 | 16 |
| Assistant messages with exact usage | 5 | 16 requests |
| Tool calls/starts/ends/results | 8 / 8 / 8 / 8 | 24 |
| Tokens | 16,625 | 131,072 |
| Cost USD | 0.0012407808 | 2 |
| Agent wall time | 33,408 ms | 300,000 ms per Attempt |
| Run wall time | 33,455 ms | 900,000 ms |
| Verifier runs | 1 | 2 |
| Recovery slots | 0 | 1 |

The Attempt stayed below its exact limits of 8 requests, 12 Tools, 65,536
tokens, USD 1 and 300,000 ms. The Run preserved its 120,000 ms finalization
reserve.

The Journal contains 54 entries and exactly one each of `attempt_started`,
`verifier_started`, `verifier_completed`,
`run_evidence_validation_completed`, `outcome_created` and `run_terminal`.
Its final suffix is exactly:

```text
outcome_created
run_terminal
```

Attempt validation is valid with 11 checked artifacts, 8 Tool calls and 8 Tool
results. Run validation is valid with one Attempt, one Attempt validation, one
Verifier and no errors. `terminal.json` binds the Outcome and Evidence Index
digests.

## 7. Source, Workspace and security boundaries

Post-run checks established:

- root HEAD remained exact and all tracked files remained clean before this
  authorized report was written;
- Workbench digest and all Task/Strategy/Instruction/Verifier hashes remained
  exact;
- both Pi checkouts remained pinned and clean;
- all four protected Workspace paths (`task.md`, `task.json`, `package.json`,
  `test/public.test.ts`) remained byte-identical to their source;
- the only Workspace mutation was under the authorized
  `src/parse-duration.ts`;
- old failed Run and old UAT artifacts remained byte-identical;
- no Workbench, fixture, Pi, control-state or Git edit/stage/commit occurred.

The integrated preterminal scan covered 16 files and 10 in-memory objects,
including all eight Tool Result artifacts, and returned `status: passed`,
`match_count: 0`. The reasoning-safe Session retained metadata only:
4 reasoning blocks, 8,080 characters / 8,154 UTF-8 bytes redacted, and
4 signatures removed. The UAT-local audit observed nine reasoning replay
occurrences in memory; raw reasoning, API key, Authorization header and raw
Provider payload/response bodies were not persisted.

A post-report scoped scan covered 40 Run, generated UAT JSON and report files.
It found 0 exact credential matches, 0 Bearer/secret-token pattern matches and
0 persisted `reasoning_content` / `thoughtSignature` fields in the Run. The
credential value used for exact comparison was held only in that scanner
process and was not printed or persisted.

## 8. Commands and exit results

All commands used `D:\AI\AI_Projects\project2` as `cwd`.

| Command/check | Exit/result |
| --- | --- |
| root/Pi/status, inventories and frozen hash checks | exit 0; all exact |
| `.runs/v0-a/pi/node_modules/.bin/tsc.cmd -p workbench/tsconfig.json` | exit 0 |
| `node --test workbench/tests/v0c-post-audit-correction.test.ts` | exit 0; 8/8 |
| `node workbench/src/cli.ts run --task fixtures/manifests/v0-c-parse-duration-public.json --strategy v0_c_recover_once_same_session_deepseek_v4_flash --dry-run` | exit 0; zero-call plan |
| `.runs/v0-a/pi/node_modules/.bin/tsc.cmd -p .runs/v0-c/uat-replacement-candidate/tsconfig.json` | exit 0 |
| `node .runs/v0-c/uat-replacement-candidate/validate-replacement-candidate.ts` | exit 0; zero-call counters |
| exclusive-create replacement authority marker | succeeded once |
| minimum `.env.g005` unique/non-empty key check | exit 0; value not displayed |
| `node .runs/v0-c/uat-replacement-candidate/stage2-uat-replacement-composition.ts` | invoked once; caller timeout/124, same child completed and wrote success summary |
| read-only monitoring of the existing Node process | process exited naturally; no reinvocation |
| `node workbench/src/cli.ts inspect --run run-c3297fc5-bfd1-4bd1-b46c-3a636271a177` | exit 0; committed and integrity-valid |
| post-run source/protected/Pi/old-artifact identity checks | exit 0; all exact |
| post-report scoped credential/secret/reasoning scan | exit 0; 40 files, 0 matches |

## 9. Claims, limitations and recommendation

**Fact.** One bounded real user-visible Coding Task passed on the frozen
Product Surface within all request, Tool, token, cost, time and Verifier
limits.

**Fact.** Recovery was not observed because the initial Verifier passed.

**Unconfirmed.** This single Run does not establish Completion Policy
effectiveness, statistical reliability, generalization, real failure recovery,
cross-process resume, crash reconciliation, exactly-once side effects, OS
sandboxing, general DLP, or V1/V2/V3 behavior.

**Recommendation.** Main Session should independently review this report and
the cited Run, then accept `PASS_V0_C_USER_ACCEPTANCE`. It should not execute a
second replacement Run merely to observe Recovery.

## 10. CURRENT_STATE_UPDATE_PROPOSAL

This UAT Session did not modify `CURRENT_STATE.md` or the formal Contract.

```yaml
current_state_update_proposal:
  active_goal: V0_C_BOUNDED_COMPLETION_AND_USER_FACING_USE
  stage_2:
    status: replacement_user_acceptance_completed_pending_main_review
    suggested_disposition: PASS_V0_C_USER_ACCEPTANCE
    implementation_baseline_commit: 12db75aaea4db4afb774046cfcc94de772a2e90b
    workbench_tree_digest: a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446
    replacement_composition_sha256: e543fce7d648fdfc4fcd1b91e7a21c8799a83662e86e850001d5a8741d4fb906
    run_id: run-c3297fc5-bfd1-4bd1-b46c-3a636271a177
    attempt_id: attempt-f6d6a9c6-d299-44d5-9283-a71d48f37288
    session_id: session-0cd59a8b-5b9a-4665-8444-88e52470ffaf
    workspace_id: workspace-8c1e52a0-0d13-4f45-82ec-f6c26e3fdfad
    outcome: passed
    verifier: passed
    inspector: committed_integrity_valid
    recovery_observed: false
    replacement_product_runs: 1
    second_replacement_run: false
    provider_requests: 5
    tool_calls: 8
    token_usage: 16625
    cost_usage_usd: 0.0012407808000000002
    wall_time_ms: 33455
    verifier_runs: 1
    source_edits: 0
    pi_patches: 0
    git_commits: 0
  final_v0_c_acceptance: pending_main_session_and_user_review
  next_owner: main_session_for_evidence_review_closeout_and_authorized_git_commit
```
