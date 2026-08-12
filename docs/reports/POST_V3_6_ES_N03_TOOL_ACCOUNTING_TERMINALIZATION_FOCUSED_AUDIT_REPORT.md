# Post-V3.6 ES-N03 Tool-accounting Terminalization — Focused Audit Report

```yaml
status: MAIN_DISPOSITION_REQUIRED
goal_id: POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_MAINTENANCE
audit_role: fresh_top_level_read_only_focused_audit
candidate_audit_baseline_commit: 1b826237249d29be111107be44f474c6355107a5
candidate_audit_baseline_tree: 1ea6950fe8c2865baebbda451d69f4ba85e51494
integrated_candidate_commit: 02096eb80986060bf57a69062f001f358267b72e
integrated_candidate_tree: a2ec251fe5d5374b96b9c39a248b019d4686109b
fixed_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
disposition: REVISE_POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_FOCUSED_AUDIT
```

## 1. Gate A and Main clarification

**Fact:** Entry and exit `HEAD` were exactly
`1b826237249d29be111107be44f474c6355107a5`; its real tree was exactly
`1ea6950fe8c2865baebbda451d69f4ba85e51494`; tracked status was clean before the
report write.

**Fact:** Main clarified during this same Audit Session that the original dispatch's
Gate-A tree label was mechanical: `a2ec251fe5d5374b96b9c39a248b019d4686109b`
is the integration-candidate code tree of parent commit
`02096eb80986060bf57a69062f001f358267b72e`, while audit-baseline commit
`1b826237249d29be111107be44f474c6355107a5` has tree
`1ea6950fe8c2865baebbda451d69f4ba85e51494`. The five-file difference is the
expected Main Review, focused-audit Prompt and control-record documentation delta.
The audit resumed only after this clarification and a fresh exact HEAD/tree/clean
check.

**Fact:** All ancestry gates passed with Exit Code `0`:

```text
856dfa066b34a477e7e7aea92b3c2ed8dfc4734c
  -> 73c124072a8ba495e6f25825bd48db774ef57581
  -> 02096eb80986060bf57a69062f001f358267b72e
  -> 1b826237249d29be111107be44f474c6355107a5
```

**Fact:** fixed Pi was exactly
`027a5847901b5dde30270abaa1041046cd2b4b55` and clean. Root and fixed-Pi
`AGENTS.md` were read completely before Pi lifecycle inspection. No replace ref was
active and the repository was not shallow.

## 2. Authority and files reviewed

The audit read the active Campaign authority and relevant project-plan sections,
including `CURRENT_STATE.md`, the Campaign Plan/Baseline/Status/Test authorization,
the formal maintenance Contract, ES-N03 Decision Required and Authorization,
Implementation Report, Closeout Draft, Main Review and focused-audit Prompt.

Complete relevant candidate source/tests reviewed:

- `workbench/src/contracts/v36g2-types.ts` — schema-3/4 and safe terminal contracts;
- `workbench/src/session/persistent-session-v36.ts` — terminal parsers,
  `reconcileFiniteBudgetTerminalSession()`, terminal generation, reopen and safe
  projection;
- `workbench/src/v36/authority-v36.ts` — Run authority, Session reopen,
  continuation and clean-new-Session gates;
- `workbench/src/contracts/v36-types.ts`;
- `workbench/src/webui/application-v36g1.ts`;
- `workbench/src/webui/application-v36g2.ts` — safe ChangeSet projection and
  Apply/Export/Discard gates;
- `workbench/src/webui/server-v36g1.ts`;
- `workbench/src/webui/static/app.js`;
- `workbench/src/pi/tool-profile.ts`;
- `workbench/tests/v36-finite-budget-terminalization.test.ts`;
- `workbench/tests/v36-budget-stop-terminalization.test.ts`.

Pinned public Pi lifecycle source/tests reviewed after Pi instructions:

- `.upstream/pi/packages/agent/src/agent-loop.ts` — `prepareToolCall()`, sequential
  and parallel Tool execution/result persistence;
- `.upstream/pi/packages/agent/src/harness/agent-harness.ts` — public
  `tool_call`/`tool_result` hook composition;
- `.upstream/pi/packages/agent/test/harness/agent-harness.test.ts` — direct hook
  lifecycle regression.

The integrated candidate product delta is limited to the Contract-listed five
Workbench files (`v36g2-types.ts`, `persistent-session-v36.ts`, static `app.js`, the
finite-budget test and README). Budget profile, Tool profile/surface, authority plane,
server, Docker backend, Agent Loop and Pi have no candidate delta.

## 3. Findings

### POST-V3.6-ES-N03-AUDIT-P1-001 — Registered ToolResult name is not authenticated against its paired call

Severity: **P1 / blocking**

**Fact:** `reconcileFiniteBudgetTerminalSession()` validates ordered unique call/result
IDs globally at `workbench/src/session/persistent-session-v36.ts:578`, but validates a
ToolResult's `toolName` against its call name only for pre-hook rejected identities at
line 586. Lines 578–589 contain no corresponding name-pair check for registered
attempt/execution/result identities.

**Fact — reproduced:** the audit generated a new ignored Faux schema-4 fixture with the
focused suite, changed the registered `...-read-1` ToolResult name from
`workspace_read` to the different active name `workspace_list`, then recomputed both the
complete Session-entry SHA-256 field and terminal digest. No ID, order, count,
registered/rejected category, blocked identity, usage, Workspace or authority field was
changed. A fresh `InteractiveControlPlaneV36.session()` reopen accepted the forged
terminal and printed:

```json
{"outcome":"ACCEPTED_FORGED_REGISTERED_RESULT_NAME","sessionId":"v36-session-7f564e4a-3440-49f5-bbdd-1e203a6a5164","runId":"v36-run-cb9dede1-5f0c-45da-8b3f-d9a313e06fb4"}
```

The audit-local reproducer is ignored evidence only:

```text
.runs/post-v3-6-es-n03-tool-accounting-terminalization/audit-registered-result-name-tamper.mts
SHA-256 2e17e43bbd4e51feb4cd6ca68ad668c6214aaaf69d5222d52350e77ab8e63eee
```

**Inference:** complete-Session hashing authenticates the bytes stated by the terminal,
but the current Session-derived reconciliation does not authenticate the semantic
call/result pair for registered identities. A digest-recomputed forged or corrupted
Session can therefore be reopened as a trusted typed terminal even though one persisted
Tool Result is not truthfully paired with its registered Tool call.

**Contract impact:** this fails exact audit items 1, 5 and 7 and deterministic Exit
Criteria 2, 5 and 8. It also undercuts the allowed claim that *all persisted Tool
identities* remain intact. The candidate must not pass focused audit until every
registered persisted result is bound to its corresponding call identity/name (and a
digest-recomputed negative proves fail-closed). The Audit Session did not repair it.

### POST-V3.6-ES-N03-AUDIT-P3-002 — Recorded whole-candidate `git diff --check` result is not reproducible

Severity: **P3 / evidence-record accuracy, non-blocking by itself**

**Fact:** the Implementation Report records `git diff --check` as Exit Code `0`, and
Main Review says it passed before freeze. Against the frozen integrated candidate,

```text
git diff --check 856dfa066b34a477e7e7aea92b3c2ed8dfc4734c 02096eb80986060bf57a69062f001f358267b72e
```

exited `2` because Closeout Draft lines 3–4 contain trailing whitespace. The same check
restricted to `workbench/` exited `0`; this is not a product-source defect. The report
record should be corrected or the intentional Markdown hard-break whitespace removed by
the owning Session/Main, without representing the frozen whole-candidate check as green.

## 4. Deterministic commands and results

| Command | Exit | Result |
| --- | ---: | --- |
| `git rev-parse HEAD` / `git rev-parse 'HEAD^{tree}'` / tracked-clean check | 0 | exact `1b826…`, tree `1ea695…`, clean |
| three `git merge-base --is-ancestor` gates | 0 each | Control -> Launch -> integrated candidate -> audit baseline |
| fixed Pi `rev-parse HEAD` / `status --short` | 0 | exact `027a584…`, clean |
| focused finite/provider suites | 0 | 9/9 pass |
| final-response Token/cost boundary test | 0 | 1/1 pass |
| HTTP/UI/application/i18n suites | 0 | 10/10 pass |
| authority/reopen/workspace/product suites | 0 | 8/8 pass |
| strict TypeScript `tsc -p workbench/tsconfig.v35g2.json --noEmit` | 0 | pass |
| `node --check workbench/src/webui/static/app.js` | 0 | pass |
| candidate protected-surface no-delta checks | 0 | budget, Tool profile, authority, server, Docker and Pi unchanged |
| `git diff --check ... -- workbench` | 0 | product delta clean |
| whole-candidate `git diff --check` | 2 | two Closeout Draft trailing-whitespace hits |
| audit-local registered-result-name tamper/reopen | 0 | forged semantic pair was accepted; P1 reproduced |

Final deterministic regression total was `28/28` passed. Passing ordinary suites do not
override the independently reproduced negative.

## 5. Contract boundary assessment

**PASS within observed scope:** unchanged hard Tool maximum `24`; unique registered
budget block on the nominal fixture; schema-1 `17/16/16`, schema-2 `25/24/24` and
schema-3 nominal/tamper regressions; schema-4 additive field selection; no Manifest for
the terminal; Source immutability; Files/Changes/Diff inspection; Export/Discard;
server-side Apply denial; same-failed-Session continuation denial; authenticated clean
new Session; fixed Pi, Agent Loop, Tool surface, budgets, Docker, Verifier/Outcome and
authority surfaces unchanged.

**FAIL:** complete persisted registered call/result semantic pairing and corresponding
tamper fail-closed/reopen authentication, as detailed in P1-001.

**Not claimed or tested:** ES-N03 Retest, real-model behavior, general V3.6, Tool-cap
adequacy, arbitrary crash recovery, uncertain side effects, SDK/Extension/RPC, UI polish
or V4. No real task was run and no Before-Fix Evidence was modified.

## 6. Zero-access declaration

```yaml
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_cost_usd: 0
real_tasks_run: 0
docker_commands_executed: 0
pi_changes: 0
product_source_changes: 0
test_changes: 0
control_state_changes: 0
accepted_evidence_changes: 0
git_commits_created: 0
```

Only local Faux/deterministic tests, loopback HTTP and ignored audit-local evidence were
used. The only tracked write by this Audit Session is this report.

## 7. Final disposition

`REVISE_POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_FOCUSED_AUDIT`

`MAIN_DISPOSITION_REQUIRED`
