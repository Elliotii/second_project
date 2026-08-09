# V3.5 Goal 3 — Adaptive Harness Workbench WebUI & Demo Contract Draft

```yaml
status: draft_pending_user_review
date: 2026-08-09
goal_id: V3_5_G3_ADAPTIVE_HARNESS_WEBUI_DEMO
charter: docs/第二项目_Codex交接包_2026-07-30/V3_5_CHARTER.md
preimplementation_review: docs/reports/V3_5_PREIMPLEMENTATION_REVIEW.md
goal_1_dependency: closed_accepted
goal_2_evidence_dependency: satisfied_by_closed_accepted_goal_2_5
active_goal: false
implementation_authorized: false
implementation_owner: future_new_top_level_goal_3_session
control_baseline_commit_authorized: false
bounded_implementation_commit_authorized: false
credential_reads_authorized: 0
external_network_authorized: false
loopback_http_authorized: false_until_activation
real_model_calls_authorized: 0
dependency_install_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
runtime_route_switch_authorized: false
goal_3_final_acceptance_authorized: false
v3_5_final_acceptance_authorized: false
```

This draft freezes no execution authority. User acceptance of a future formal Contract must
remain separate from Activation and the Control Baseline Commit.

## 1. Goal question

> Can the accepted persistent Session/Run substrate and frozen V2/V3/Goal 2.5 evidence be
> exposed through one thin, loopback-only, safe Read Model/API/WebUI so a user can reopen
> and continue a bounded Session, inspect outcomes and comparisons, and explain the full
> Harness adaptation lineage without changing Runtime or authority semantics?

Goal 3 is productization and inspectability work. It does not create a new evaluation
Runtime, State authority, Skill experiment or self-evolution mechanism.

## 2. Frozen fact basis

1. Goal 1 is closed and accepted. `PersistentSessionServiceV35` already provides public-Pi
   JSONL Session create/list/open/continue, explicit Session↔Run linkage and safe message/
   Tool projections for deterministic settled turns.
2. `readV2RecoveryComparisonV35`, `readV3PromptAdaptationV35` and legacy fallback adapters
   already provide bounded read paths over accepted evidence.
3. `inspectStateStoreV3`, immutable decisions/bindings and `rollbackActiveStateV3` already
   own State lifecycle and guarded expected-active rollback semantics.
4. Goal 2.5 is closed and accepted with one valid real Base/Candidate Pair. Both arms
   passed; the Skill had no observed task-success advantage on the single Case.
5. The older Goal 2 Inspector rejects Goal 2.5's newer exact-key comparison schema. Goal 3
   needs a thin schema-aware adapter; it must not weaken or rewrite either frozen schema.
6. Direct public `AgentHarness` remains the Runtime route. Pi Core, Verifier authority,
   promotion authority, hard budgets and accepted State semantics remain immutable.

## 3. Minimum architecture

```text
Browser
→ loopback-only thin Node HTTP API
→ typed Workbench Read/Application services
→ existing Session / Run / Verifier / State controllers
→ public Direct Pi AgentHarness
```

Required design choices:

- use Node built-in HTTP/static-file capabilities and small checked-in browser assets;
- add no database, framework build chain, WebSocket or external Runtime dependency;
- keep browser payloads versioned, typed and derived from safe projections;
- configure allowlisted source roots server-side before startup; browser requests use
  opaque resource IDs and never filesystem paths;
- prefer post-run inspection and explicit refresh over live token/Tool streaming.

## 4. Bounded implementation scope

### 4.1 Read Model completion

Add the smallest schema-aware adapter required to project the accepted Goal 2.5 Pair. It
must authenticate its comparison and Manifest references/digests and expose the already
frozen result; it must not call the older Goal 2 exact-key Inspector on a Goal 2.5 schema,
coerce one schema into the other, or recompute comparison semantics in the browser.

Compose a stable Goal 3 view from existing services/adapters for:

- Session catalog, safe conversation/Tool history and linked Runs;
- Run, Verifier, Outcome and source-reference summaries;
- V2 recovery comparison;
- V3/Goal 2.5 Base/Candidate and adaptation evidence;
- evidence → diagnosis → lesson → Prompt/Skill → validation → decision → active State →
  selective binding lineage;
- State/version/decision history and current active identity.

Historical absence must render as `not_recorded`/`unavailable`, never as invented data.
The Read Model remains derived navigation/presentation data, not a new truth store.

### 4.2 Thin local API

Provide a constructor/configuration boundary that accepts only Main/host-selected,
allowlisted roots and services. The API must:

- bind to `127.0.0.1` by default, use an ephemeral port in tests and never bind to
  `0.0.0.0`;
- serve an allowlisted static surface and versioned JSON endpoints only;
- reject unknown routes, unsupported methods, malformed identifiers, path traversal,
  encoded traversal and non-ordinary static files;
- return safe projections only—no raw Session JSONL, private reasoning, provider payload,
  Credential material, environment values or arbitrary artifact bytes;
- invoke create/open/continue only through `PersistentSessionServiceV35`;
- if rollback is exposed, require an opaque configured authority ID, exact expected-active
  identity and explicit confirmation, then call `rollbackActiveStateV3`; never write State
  files directly. Tests and demo must use a Goal-owned disposable authority, not mutate the
  accepted V3 authority.

External network, Credential access and real model calls remain zero. Loopback HTTP is the
only network-shaped behavior contemplated by this Goal.

### 4.3 Minimal WebUI and demo

The first UI must provide:

1. Session sidebar with list/open and bounded create/continue actions;
2. safe conversation and collapsed/expanded Tool history;
3. Run/Verifier/Outcome details with source-reference/digest drill-down metadata;
4. V2 recovery and Goal 2.5 Base/Candidate comparison views;
5. adaptation lineage, Prompt/Skill diff, State/version history and binding explanation;
6. guarded rollback only if the existing controller can be exposed without widening its
   authority boundary;
7. a reproducible post-run demo command and short usage guide.

The UI must state the accepted Goal 2.5 conclusion accurately: both arms passed and no
task-success advantage was observed for the Skill. It must not display a winner merely to
make the demonstration more attractive.

## 5. Source and deliverable boundary

The dedicated Session may modify only the smallest necessary subset of:

```text
workbench/src/contracts/*v35*.ts
workbench/src/read-model/
workbench/src/webui/                 # new, thin API/application/UI boundary
workbench/tests/v35g3-*.test.ts
workbench/scripts/*v35g3*            # bounded demo/start entry only
workbench/package.json               # scripts only; no dependency addition
workbench/README.md                   # short Goal 3 run instructions only
docs/reports/V3_5_G3_IMPLEMENTATION_REPORT.md
docs/reports/V3_5_G3_CLOSEOUT_DRAFT.md
docs/reports/V3_5_G3_DEMO_GUIDE.md
```

It must not modify `CURRENT_STATE.md`, this Contract, the Charter, accepted Closeouts,
accepted raw evidence, `.upstream/pi`, user reference material or any Credential file.

Required deliverables:

- bounded implementation and focused tests;
- one implementation commit created by the dedicated top-level Goal 3 Session;
- `V3_5_G3_IMPLEMENTATION_REPORT.md` with source delta, commands/exit codes, test counts,
  security-boundary checks and remaining limitations;
- `V3_5_G3_CLOSEOUT_DRAFT.md` with a structured `CURRENT_STATE_UPDATE_PROPOSAL`;
- a short reproducible local demo guide.

## 6. Verification

At minimum the dedicated Session must run and record:

1. strict TypeScript for the affected Workbench configuration;
2. focused Goal 3 Read Model/API/UI tests;
3. Goal 1 persistent Session regressions;
4. affected V3 State/rollback regressions if rollback is exposed;
5. direct projection of the accepted Goal 2.5 comparison from a host-configured,
   read-only evidence root, or a Main-verifiable equivalent with exact accepted digest;
6. HTTP security tests for loopback binding, method/route allowlists, traversal, static
   file containment, malformed IDs and safe redaction;
7. a post-run browser/API smoke demonstration with zero Credential, external network,
   Provider/model and real-model access.

Normal TypeScript, serialization, HTTP, CSS, fixture and path defects are ordinary Goal
work and may be corrected by the same implementation Session.

## 7. Exit Criteria

1. A user can list, open, review and deterministically continue a persistent Session
   through the UI/API and existing Workbench service.
2. Safe conversation/Tool history and Session↔Run history render without unsafe raw
   exposure.
3. Run, Verifier, Outcome and source-reference/digest summaries are inspectable.
4. V2 recovery and accepted Goal 2.5 comparison are visible without browser-side semantic
   recomputation; the Goal 2.5 digest matches
   `243d1c476385333d297bff296b69d9dd5d7be87ea041b25c974cc5dc7a7d920f`.
5. Adaptation lineage, Prompt/Skill diff, State/version history and selective-binding
   reason are explainable end to end from existing evidence.
6. Any exposed rollback uses the existing guarded controller and expected-active identity;
   otherwise the UI states rollback is deferred rather than providing an unsafe shortcut.
7. API/static serving cannot access arbitrary paths or expose secrets/private reasoning,
   and accepted authority files are not directly mutable from the browser.
8. The reproducible post-run demo passes with zero Credential, external network,
   Provider/model and real-model calls.
9. Direct Pi Runtime, accepted V2/V3/Goal 2.5 facts and Pi source remain unchanged.

## 8. Governance and review

After separate user acceptance/Activation and a clean Control Baseline, one new top-level
Goal 3 Implementation Session owns implementation, ordinary bounded fixes, focused tests,
its implementation commit and reports. Main owns baseline verification, bounded review,
control-state updates and final acceptance.

Independent audit is not scheduled by default. Main performs a narrow security/authority
review of the HTTP/path/redaction/rollback boundary. A separate focused audit is proposed
only if concrete evidence shows a high-risk boundary defect or accepted authority change.
One ordinary correction does not create R1/R2, a replacement Session or an Amendment.

## 9. Hard stops

Stop and return to Main/user if implementation would require:

1. Pi Core patch, private Pi import, SDK/Extension/RPC/server route switch or Runtime
   replacement;
2. external dependency installation, external network, Credential access or real model
   calls;
3. raw Session/provider/private-reasoning exposure or a browser-supplied filesystem path;
4. direct State-file writes, changed expected-active semantics, or changed Verifier,
   promotion, budget/security or accepted State authority;
5. weakening frozen Goal 2/Goal 2.5 evidence validation or reinterpreting the accepted
   comparison result;
6. reopening V2/V3/Goal 2.5, adding an Eval Runtime, new Case, Skill experiment, Router,
   database, streaming subsystem, IDE/terminal or multi-user platform;
7. a correctness defect that contradicts an accepted V3/V3.5 claim.

## 10. Claims

If accepted, Goal 3 may claim a loopback-only, inspectable adaptive-Harness workbench that
reuses persistent Sessions, typed evidence adapters and existing guarded State controllers
to explain accepted Runs, comparisons and adaptation lineage through a thin local WebUI.

It may not claim production security, remote/multi-user operation, realtime streaming,
general Skill superiority, arbitrary historical migration, crash recovery, exactly-once
Tool effects, full IDE capability or final V3.5 acceptance.

## 11. User decisions required

```yaml
user_decisions_required:
  - decision: accept_formalize_and_activate_goal_3_contract
    evidence: goal_1_and_goal_2_5_dependencies_are_closed_and_accepted
    options: [accept_and_activate, request_bounded_revision, defer]
    recommendation: accept_and_activate
    consequence: permits_Main_to_create_a_clean_Control_Baseline_and_start_one_new_top_level_Goal_3_Implementation_Session
  - decision: authorize_loopback_only_http_and_bounded_goal_commit
    evidence: Goal_3_requires_local_API_and_a_dedicated_implementation_commit_but_no_external_network
    options: [authorize_with_activation, keep_unauthorized]
    recommendation: authorize_with_activation
    consequence: permits_127_0_0_1_local_API_tests_demo_and_one_bounded_implementation_commit
  - decision: rollback_surface
    evidence: existing_controller_is_guarded_but_browser_mutation_expands_security_review_surface
    options: [expose_only_against_configured_disposable_authority, defer_UI_rollback]
    recommendation: expose_only_against_configured_disposable_authority
    consequence: demonstrates_existing_guarded_lifecycle_without_mutating_accepted_V3_authority
```
