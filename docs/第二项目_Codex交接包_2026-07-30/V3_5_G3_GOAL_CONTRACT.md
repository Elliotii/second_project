# V3.5 Goal 3 — Adaptive Harness Workbench WebUI & Demo Contract

```yaml
status: accepted_activated_implementation_not_started
date: 2026-08-09
goal_id: V3_5_G3_ADAPTIVE_HARNESS_WEBUI_DEMO
charter: docs/第二项目_Codex交接包_2026-07-30/V3_5_CHARTER.md
preimplementation_review: docs/reports/V3_5_PREIMPLEMENTATION_REVIEW.md
goal_1_dependency: closed_accepted
goal_2_evidence_dependency: satisfied_by_closed_accepted_goal_2_5
accepted_goal_2_5_evidence_root: C:/Users/HUAWEI/.codex/worktrees/d073/project2/.runs/v3-5-g2-5/real-pair-replacement-20260809-01
accepted_goal_2_5_comparison_digest: 243d1c476385333d297bff296b69d9dd5d7be87ea041b25c974cc5dc7a7d920f
accepted_goal_2_5_comparison_file_sha256: 26e398c922d1b78e3a5784b83875077156f63bd7eb42f6d46e5d7ccf0d636da9
active_goal: true
contract_accepted: true
accepted_by_user: 2026-08-09
formalized_by_main_session: 2026-08-09
activation_authorized_by_user: 2026-08-09
implementation_authorized: true
implementation_owner: future_new_top_level_goal_3_session
implementation_started: false
control_baseline_commit_authorized: consumed_by_resulting_HEAD_of_activation_revision
control_baseline_commit: resulting_HEAD_of_activation_revision
bounded_implementation_commit_authorized: true_once_within_contract_allowlist
credential_reads_authorized: 0
external_network_authorized: false
loopback_http_authorized: true_127_0_0_1_only
real_model_calls_authorized: 0
dependency_install_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
runtime_route_switch_authorized: false
goal_3_final_acceptance_authorized: false
v3_5_final_acceptance_authorized: false
rollback_surface: deferred_no_state_mutation_http_endpoint
```

This Contract is accepted and activated by separate user authority. Main must first create
and verify the clean Control Baseline Commit represented by this activation revision, then
generate a launch Prompt that pins its exact SHA and create one new top-level Goal 3
Implementation Session. No Goal implementation may begin before that Session passes Gate
A from the exact baseline.

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

The accepted Goal 2.5 evidence root named above is read-only implementation and Main-review
input. It must never be served to the browser as a local path, modified, relocated or
treated as a portable repository fixture.

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

Add one read-only `inspectGoal25PairV35`-class boundary and the smallest schema-aware
adapter required to project the accepted Goal 2.5 Pair. The Inspector must validate exact
keys, comparison/Manifest/outcome/link digests, ArtifactRef containment, Base/Candidate
membership, settled handoff, Verifier count/status, fairness identity and aggregate
counters. It must not import or invoke the real execution entry, mutate evidence, call the
older Goal 2 exact-key Inspector on a Goal 2.5 schema, coerce one schema into the other, or
recompute comparison semantics in the browser.

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

The aggregate application view should remain one versioned safe contract, with these
top-level projections rather than a generalized query platform:

```text
WorkbenchOverviewV35G3
SessionList / SafeSessionView
RunOutcomeView
RecoveryComparisonView
SkillComparisonView
AdaptationLineageView
StateHistoryView
```

Names may be adjusted by the implementation Session, but the browser must depend on these
safe semantic views, not raw artifact shapes.

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
- expose no generic artifact-download, shell, filesystem, environment, Credential,
  arbitrary-provider or arbitrary-command endpoint;
- keep Harness State mutation out of the first WebUI. State history, promotion/rejection/
  rollback decisions and current active identity are visible, but the browser has no
  rollback write endpoint. Existing `rollbackActiveStateV3` remains the proven authority
  path and can be exposed in a later separately reviewed operator-control increment.

The recommended bounded route surface is:

```text
GET  /api/v1/overview
GET  /api/v1/sessions
GET  /api/v1/sessions/{session_id}
POST /api/v1/sessions
POST /api/v1/sessions/{session_id}/turns
GET  /api/v1/comparisons/{resource_id}
GET  /api/v1/adaptations/{resource_id}
GET  /api/v1/state/{resource_id}
GET  /, /app.js, /styles.css
```

Exact internal names may change, but adding raw-artifact, arbitrary-path, shell, provider,
Credential or State-mutation routes is outside the Contract. Session write requests must
use bounded JSON bodies and the existing deterministic/Faux Goal 1 execution service; the
UI must label that mode accurately and must not imply real-model continuation.

External network, Credential access and real model calls remain zero. Loopback HTTP is the
only network-shaped behavior contemplated by this Goal.

### 4.3 Minimal WebUI and demo

The first UI must provide:

1. Session sidebar with list/open and bounded create/continue actions;
2. safe conversation and collapsed/expanded Tool history;
3. Run/Verifier/Outcome details with source-reference/digest drill-down metadata;
4. V2 recovery and Goal 2.5 Base/Candidate comparison views;
5. adaptation lineage, Prompt/Skill diff, State/version history and binding explanation;
6. rollback history and current active identity, with an explicit notice that rollback
   mutation is not exposed in this inspectability-first version;
7. a reproducible post-run demo command and short usage guide.

The UI must state the accepted Goal 2.5 conclusion accurately: both arms passed and no
task-success advantage was observed for the Skill. It must not display a winner merely to
make the demonstration more attractive.

### 4.4 Reproducible demo data

The implementation must support live local evidence roots selected by the host before
startup, but a clone should not depend on ignored `.runs/` data being present to render a
useful demonstration. Therefore Goal 3 may commit one small, sanitized, typed demo
projection containing no raw Session/provider payload or Credential material.

The projection must:

- identify itself as derived demo data, never authority;
- preserve the accepted Goal 2.5 comparison digest and source identity;
- include enough V2/V3/Goal 2.5 lineage to exercise every primary view;
- be reproducibly generated or checked against typed Read Model output;
- contain no fabricated winner, hidden answer, private reasoning or absolute local path.

Live-source adapter tests and demo-projection tests remain separate: the projection makes
the UI portable; it does not replace direct validation of accepted evidence.

## 5. Source and deliverable boundary

The dedicated Session may modify only the smallest necessary subset of:

```text
workbench/src/contracts/*v35*.ts
workbench/src/read-model/
workbench/src/v35g25/inspect-v35g25.ts  # new read-only Inspector only
workbench/src/webui/                 # new, thin API/application/UI boundary
workbench/tests/v35g3-*.test.ts
workbench/scripts/*v35g3*            # bounded demo/start entry only
fixtures/v3-5/goal3-demo/            # sanitized typed demo projection only
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
   read-only evidence root with the exact accepted digest;
6. HTTP security tests for loopback binding, method/route allowlists, traversal, static
   file containment, malformed IDs, oversized request bodies and safe redaction;
7. a post-run browser/API smoke demonstration with zero Credential, external network,
   Provider/model and real-model access.

The focused test matrix is limited to four groups:

```text
A. Goal 2.5 Inspector + Read Model integrity/tamper cases
B. persistent Session list/open/create/continue application cases
C. loopback API/static/path/redaction cases
D. browser/demo smoke plus affected Goal 1 and V3 read regressions
```

No full historical suite or independent audit is required unless a concrete failure shows
that an accepted authority boundary changed.

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
6. Rollback history and active identity are visible; State mutation is explicitly deferred
   and no direct or indirect State write endpoint exists.
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

### 8.1 Single-Session implementation sequence

After Activation, the top-level Goal 3 Session should complete four vertical slices in one
continuous Goal rather than creating separate Stage Sessions:

```text
Gate A — exact Control Baseline, clean tracked tree, pinned clean Pi, zero-access preflight
  ↓
Slice A — Goal 2.5 read-only Inspector + versioned Read Model
  ↓ focused tests
Slice B — loopback API + deterministic Session application operations
  ↓ focused tests
Slice C — static WebUI + adaptation/comparison/state-history views
  ↓ browser/API smoke
Slice D — sanitized demo projection + demo command + concise reports
  ↓ strict TypeScript + affected regressions + bounded implementation commit
  ↓ stop for Main review
```

The Session may repair ordinary Contract-allowlisted TypeScript, schema, fixture, HTTP,
CSS and path defects and continue. It must not ask Main to create a new Stage for such
defects.

### 8.2 Main review and acceptance sequence

Main performs one bounded review after the implementation commit:

1. verify exact parent/commit, source allowlist, tracked cleanliness and Pi identity;
2. inspect the Goal 2.5 read-only validation path and confirm the accepted comparison
   digest against the preserved real evidence;
3. rerun strict TypeScript and the four focused test groups;
4. start the server on an ephemeral `127.0.0.1` port and exercise safe/hostile HTTP cases;
5. inspect the UI/demo output for factual wording, redaction and complete adaptation
   lineage;
6. return one bundled bounded correction to the same Goal Session by default if necessary;
   ordinary remaining defects may continue in that Session when scope/architecture stay
   unchanged—do not close the Goal merely because a numeric correction count was reached;
7. if Exit Criteria pass and no Hard Stop is hit, Main proposes Goal 3 acceptance and
   V3.5 final Closeout to the user.

No Candidate Audit Baseline, independent Audit Session, R1/R2 or real Execution Session is
planned. A fresh focused audit becomes a user decision only if Main reproduces a concrete
high-risk path/redaction/authority defect that cannot be resolved and verified by the
bounded review above.

A second material correction triggers a short Main complexity checkpoint: restate the
Goal question, evidence obtained, missing evidence and whether the remaining work is
ordinary implementation or an architecture/scope change. Only the latter requires user
decision; ordinary bounded defects continue in the same Session.

### 8.3 Post-Goal version closeout

After user acceptance of Goal 3, Main may perform one documentation-only V3.5 closeout:

- formal Goal 3 Closeout and `CURRENT_STATE.md` synchronization;
- final V3.5 Closeout and bounded claim list;
- concise Architecture/README/demo/interview consolidation based on frozen code/evidence;
- one final V3.5 closeout commit after explicit user authorization.

This is not a fourth technical Goal and must not add features or rerun V2/V3/Goal 2.5.

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

## 11. Accepted decisions and next authority

```yaml
accepted_decisions:
  - decision: accept_and_formalize_goal_3_contract_without_activation
    accepted_by_user: 2026-08-09
    consequence: Goal_question_scope_and_Exit_Criteria_are_frozen_while_active_goal_remains_null
  - decision: defer_UI_rollback
    accepted_by_user: 2026-08-09
    consequence: Goal_3_has_no_State_mutation_HTTP_endpoint
  - decision: authorize_activation_control_baseline_loopback_http_and_bounded_goal_commit
    accepted_by_user: 2026-08-09
    consequence: permits_Main_to_activate_Goal_3_create_and_verify_the_Control_Baseline_start_one_top_level_Session_and_allow_127_0_0_1_only_HTTP_tests_demo_plus_one_bounded_commit
user_decisions_required:
  - decision: final_Goal_3_and_V3_5_acceptance_after_Main_review
    evidence: implementation_and_Main_review_not_yet_completed
    options: [accept_after_evidence, request_bounded_correction, reject_or_pause]
    recommendation: decide_only_after_the_dedicated_Session_report_and_Main_review
    consequence: no_final_acceptance_is_granted_by_Activation
```
