# POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_MAINTENANCE Implementation Report

Status: `MAIN_REVIEW_REQUIRED`

Date: 2026-08-12 (Asia/Hong_Kong)

Session role: dedicated top-level zero-real-call Implementation Session. This report does
not accept or close the maintenance, Campaign, ES-N03, V3.6, or any later version.

## 1. Frozen entry and authority

Fact:

- Launch Record Commit and entry `HEAD` were exactly
  `73c124072a8ba495e6f25825bd48db774ef57581`.
- `git merge-base --is-ancestor
  856dfa066b34a477e7e7aea92b3c2ed8dfc4734c
  73c124072a8ba495e6f25825bd48db774ef57581` exited `0`.
- Control Baseline tree was exactly
  `9ba0f742fe9d67188c371d505a93e253547adcb6`.
- Entry `workbench/` tree and accepted functional-baseline `workbench/` tree at
  `7d63e76c3df357294d480c45e4bad785e8f2fa8a` were both exactly
  `3b18c69d3ab26995738678a7ec37a9c5a69248c0`.
- Tracked status was clean before edits.
- Fixed Pi remained exactly `027a5847901b5dde30270abaa1041046cd2b4b55`
  and clean before and after work.
- The required Contract, Decision Required report, Start Prompt, Campaign/current-plan
  authority, accepted budget-terminal maintenance records, relevant current Workbench
  source/tests, fixed Pi root `AGENTS.md`, and the relevant pinned public Pi
  `AgentHarness`/agent-loop source and tests were read before implementation.

No protected ES-N03 Before-Fix Evidence or Downloads handoff was written, copied over,
or used as a fixture. New generated evidence uses only the dedicated ignored root named
in section 5.

## 2. Implemented result

Fact: the Workbench now emits additive finite-budget terminal schema `4` only when a
finite terminal Turn contains a Tool request rejected before the registered public
`tool_call` hook. Schema 4 preserves and validates all of the following independently:

- ordered persisted Tool-call IDs and exactly paired Tool-result IDs;
- registered public-hook attempt IDs;
- registered execution/completion IDs, each proven to belong to the registered-attempt
  domain, and the one registered budget-blocked ID;
- unavailable Tool names and paired error-result identities;
- active-tool pre-hook rejections as a cause-neutral category, avoiding an unsupported
  claim that every such rejection is necessarily argument validation.

Registered budgeting is unchanged: only calls that reach Pi's public `tool_call` hook
consume the daily registered Tool-attempt cap, whose hard maximum remains `24`.
Unavailable names stay outside the active surface, persist paired error results, do not
enter registered execution, and cannot be moved into the registered category on reopen.

The schema-4 parser and disk reopen path fail closed on non-exhaustive pairs, duplicates,
forged or mismatched rejected identities, non-error rejected results, category overlap,
a rejected/unavailable identity injected into registered executions, any blocked-array
length or exact-difference mismatch, an absent/forged/non-unique budget block, or a
registered ID outside the active Tool surface. Execution-subset and blocked exact-
difference checks are unconditional for every schema-4 finite terminal reason; the unique
budget-blocked ID is the additional Tool-stop invariant. Every registered persisted Tool
call/result pair also binds equal `toolName` values on independent reopen. Schema `1`,
`2`, and `3` field sets and semantics were not changed or migrated.

The safe list/detail/Run projection and static session view now expose persisted versus
registered accounting, unavailable requests, cause-neutral active-tool pre-hook
rejections, and the budget-blocked registered identity. No raw reasoning, Tool payload,
secret, Credential, or Host path was added to the safe projection.

## 3. Exact changed-file inventory

All source changes are inside the Contract allowlist:

- `workbench/src/contracts/v36g2-types.ts`
- `workbench/src/session/persistent-session-v36.ts`
- `workbench/src/webui/static/app.js`
- `workbench/tests/v36-finite-budget-terminalization.test.ts`
- `workbench/README.md`
- `docs/reports/POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_IMPLEMENTATION_REPORT.md`
- `docs/reports/POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_CLOSEOUT_DRAFT.md`

Ignored generated evidence is under
`.runs/post-v3-6-es-n03-tool-accounting-terminalization/` only. No file was staged and no
Git commit was created. `CURRENT_STATE.md`, the Contract, Campaign files, accepted
Closeouts, Pi, Agent Loop, budget profiles, Tool surface, Source/Apply/Verifier/control
state, and ES-N03 Before-Fix Evidence were not modified.

## 4. Deterministic trajectory and accounting

The new Faux trajectory first persists:

1. unavailable `read_tool` -> paired error result, no registered hook attempt;
2. active `workspace_read` rejected before the hook -> paired error result;
3. 25 registered `workspace_read` attempts -> 24 executions/completions and one unique
   pre-execution budget block.

Observed safe accounting is exactly:

```yaml
terminal_reason: tool_call_budget_exhausted
schema_version: 4
persisted_calls: 27
persisted_results: 27
registered_attempts: 25
registered_executions: 24
registered_completions: 24
registered_blocked: 1
registered_tool_hard_max: 24
unavailable_requests: 1
active_tool_pre_hook_rejections: 1
manifest_created: false
settled: false
verification_mode: unverified
formal_outcome: null
```

The test proves independent reopen, loopback list/detail projection, managed-change
inspection, Export and Discard availability, server-side Apply denial, same-Session
continuation denial, and registered Source byte identity. Mutation cases recompute the
ordinary content digest before reopen so their rejection exercises structural and
Session-derived reconciliation rather than only stale-digest detection.

## 5. Deterministic evidence index

Preserved ignored review fixture:

- root:
  `.runs/post-v3-6-es-n03-tool-accounting-terminalization/tool_with_unavailable-19620-1786542086118-d4e73b5239e038/`
- terminal:
  `data/sessions/v36-session-1b0ab2c8-3075-41ff-bbb2-fa2fdadd1e3d/runtime/runs/v36-run-6f29fb2d-c2e7-4740-a1ce-7bb90ea3327f/budget-stop.json`
- file SHA-256:
  `2264e08609620c6918b497f8e3b349fcd48aa4e20b122dc85e875d7c0eea3b5e`
- terminal digest:
  `7b09a1b6b345d7e896ce39220daa0e35b546afd27fbb607ba7fd92d2cd0a0e45`
- budget-blocked registered call:
  `v36-run-6f29fb2d-c2e7-4740-a1ce-7bb90ea3327f-read-25`

This fixture is deterministic/Faux evidence only. It is not ES-N03 Before-Fix Evidence,
not real-model evidence, and not an Outcome.

## 6. Exact verification commands and results

Final verification commands:

| Command | Exit | Result |
| --- | ---: | --- |
| `node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 workbench/tests/v36-finite-budget-terminalization.test.ts workbench/tests/v36-budget-stop-terminalization.test.ts` | 0 | 9/9 pass; schema 1/2/3/4 and new trajectory |
| `node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 --test-name-pattern="final assistant response" workbench/tests/v36g2-bounded-session-api.test.ts` | 0 | 1/1 pass; final-response token/cost boundary |
| `node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 workbench/tests/v36g1-http-ui.test.ts workbench/tests/v35g3-i18n.test.ts workbench/tests/v35g3-application-api.test.ts` | 0 | 10/10 pass; HTTP/UI/application/i18n |
| `node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 workbench/tests/v36g1-authority-session.test.ts workbench/tests/v36g1-workspace-projection.test.ts workbench/tests/v36-product-polish.test.ts` | 0 | 8/8 pass; authority/reopen/workspace/product |
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p workbench/tsconfig.v35g2.json --noEmit` | 0 | strict TypeScript pass |
| `node --check workbench/src/webui/static/app.js` | 0 | browser script syntax pass |
| `git diff --check` | 0 | no whitespace errors |
| `git diff --check 73c124072a8ba495e6f25825bd48db774ef57581` | 0 | whole Candidate from Launch Record has no whitespace errors |
| `git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C D:/AI/AI_Projects/project2/.upstream/pi rev-parse HEAD` | 0 | fixed Pi exact |
| `git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C D:/AI/AI_Projects/project2/.upstream/pi status --short` | 0 | empty output; Pi clean |

Distinct deterministic tests in the final regression set: `28/28` passed. All four test
commands, strict TypeScript and browser syntax were rerun after the final self-review
refinement and passed.

Development-loop disclosure: ordinary local corrections were made before the final
green runs. The focused command exited `1` once before schema-4 dispatch was added, the
TypeScript command exited `1` for union narrowing and once for the new test's safe-view
cast, and the focused test exited `1` for two test-expectation shape/count corrections.
During Main's bounded correction, the focused command exited `1` once because the new
blocked-domain regression reached the older compound Tool-stop rejection message before
the new unconditional blocked-domain branch. The checks were separated explicitly and
the focused suite then passed 9/9. During focused-audit P1 correction, the first negative
test run exited `1` because the test recomputed the Session entries digest over the JSONL
header plus entries, so reopen failed at the outer Session identity gate before reaching
the new name-binding invariant. Recomputing over Session entries only made the intended
digest-recomputed `workspace_read` -> `workspace_list` mismatch reach and fail the named
binding check; the focused suite then passed 9/9. These were Contract-local
implementation/test corrections, not a material terminal-design failure and not a Hard
Stop. No failing result is represented as final evidence.

## 7. Contract Exit-Criteria matrix

| # | Status | Deterministic evidence |
| ---: | --- | --- |
| 1 | PASS | New Faux trajectory creates one schema-4 terminal and no Manifest. |
| 2 | PASS | Ordered 27/27 persisted pairing plus exhaustive registered/rejected union; reopen validates from disk. |
| 3 | PASS | Unavailable paired error has no registered execution/command/side effect and is distinct from `read-25`. |
| 4 | PASS | Registered accounting is 25/24/24/1; hard maximum remains 24. |
| 5 | PASS | Missing/duplicate/forged/mismatched/non-error/overlap/missing-block/forged-block mutations fail closed. Digest-recomputed unavailable and active-pre-hook IDs injected into the unchanged-length execution array fail the explicit execution-subset invariant; blocked length and exact registered-minus-executed difference are checked independently for every schema-4 reason; a digest-recomputed registered `workspace_read` result renamed `workspace_list` fails the explicit call/result name binding. |
| 6 | PASS | Combined schema-1/2 compatibility plus accepted schema-3 matrix and tamper regressions pass. |
| 7 | PASS | Registered-only Provider/Token/cost/Tool/wall variants remain schema 1/2/3 and pass. |
| 8 | PASS | A fresh control-plane instance independently reopens and validates schema 4. |
| 9 | PASS | Loopback list/detail and static projection expose categories; Files/Changes/Diff stay unverified; Export/Discard pass; Apply/continuation reject. |
| 10 | PASS | Test asserts Source bytes unchanged; fixed Pi is exact/clean; changes and generated evidence stay outside protected evidence. |
| 11 | PASS | Strict TypeScript, browser syntax, and 28/28 narrow affected regressions pass. |
| 12 | PASS | Zero Credential reads, network, external Provider/model, and real-model calls. |

## 8. Access/accounting declaration

```yaml
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_cost_usd: 0
loopback_http_only: true
docker_commands_executed: 0
pi_changes: 0
agent_loop_changes: 0
budget_changes: 0
git_commits_created: 0
```

The tests use Faux Provider messages and local `127.0.0.1` loopback HTTP only. Persisted
command evidence in fixtures is deterministic Faux evidence; no Docker Engine command
was executed by this Session.

## 9. Self-review, hard-stop status, and non-claims

Fact: one final self-review found and corrected an over-specific label. Active-tool
pre-hook rejection is now cause-neutral instead of being inferred as argument validation
solely from Tool name. The self-review also retains the unique registered budget block
and independently checks that every registered ID names an active Tool on reopen.

Main bounded correction added two further explicit schema-4 invariants: every executed ID
must belong to registered attempts, and the blocked array length must equal the persisted
blocked count and the exact registered-attempts-minus-executed difference. Two cross-domain
execution forgeries and one blocked-array forgery recompute the terminal digest and still
fail closed at those named boundaries.

Focused Audit finding `POST-V3.6-ES-N03-AUDIT-P1-001` was corrected without schema or
feature expansion: independent reopen now binds every registered persisted ToolResult
`toolName` to its paired registered Tool call name. A negative regression rewrites the
registered `read-1` result from `workspace_read` to `workspace_list`, recomputes both the
Session entries SHA-256 and terminal digest, and still fails closed at the binding.

Hard-stop status: `NOT_TRIGGERED`. Completion required no budget/domain, Pi, Agent Loop,
authority, protected-evidence, real-access, recovery, backend, or scope change. The same
core terminal design did not suffer a material failure.

Remaining unverified/non-claims:

- Focused Audit finding correction review, acceptance, Campaign control update, and any
  authorized ES-N03 Retest have not occurred.
- ES-N03 is not completed, passed, recovered, replaced, or rerun by this work.
- No claim is made about real DeepSeek/model behavior, universal Tool-cap adequacy,
  arbitrary Tool failures, crashes, uncertain in-flight side effects, or recovery.
- V3.6 remains closed and was not reopened; V4 was not entered.
- Pi and Agent Loop were not modified.

## 10. CURRENT_STATE_UPDATE_PROPOSAL

Proposal only; Main owns any actual `CURRENT_STATE.md` edit.

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  active_goal: POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_MAINTENANCE
  implementation_session_status: MAIN_REVIEW_REQUIRED
  implementation_result: >-
    Additive schema-4 deterministic candidate separates complete persisted Tool
    call/result identity from registered public-hook attempt/execution accounting,
    explicitly records unavailable requests and the unique registered budget block,
    enforces execution-subset and blocked exact-difference domains, and preserves
    schema-1/2/3 behavior.
  deterministic_verification:
    tests_passed: 28
    tests_failed: 0
    strict_typescript: PASS
    browser_syntax: PASS
    credential_reads: 0
    network_calls: 0
    external_provider_calls: 0
    real_model_calls: 0
    real_cost_usd: 0
  hard_stop: NOT_TRIGGERED
  next_gate: MAIN_FOCUSED_AUDIT_FINDING_REVIEW
  forbidden_claims_preserved:
    - no maintenance acceptance or closeout
    - no ES-N03 Retest authority consumed
    - no Campaign next-Case authorization
    - no V3.6 reopen or V4 entry
```
