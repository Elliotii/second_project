# V3.5 Goal 3 Implementation Report

## Session disposition

`READY_FOR_BOUNDED_MAIN_REVIEW`

This dedicated Implementation Session implemented the Contract-bounded Goal 3
surface. It does not accept Goal 3 or V3.5, does not change control state, and
does not authorize any real access.

Implementation commit: **the single commit containing this report**. Because a
Git commit cannot contain its own SHA, the exact SHA is returned in the Session
handoff immediately after commit creation.

## Material conclusions

- **Fact:** Gate A passed at Control Baseline
  `23592060f8fafd87d40180daef1a2350473978ae`.
- **Fact:** the pinned Pi Junction targeted
  `D:/AI/AI_Projects/project2/.upstream/pi`; pinned Pi HEAD remained
  `027a5847901b5dde30270abaa1041046cd2b4b55` with clean tracked status.
- **Fact:** the accepted Goal 2.5 `comparison.json` file SHA-256 remained
  `26e398c922d1b78e3a5784b83875077156f63bd7eb42f6d46e5d7ccf0d636da9`
  and its embedded comparison digest remained
  `243d1c476385333d297bff296b69d9dd5d7be87ea041b25c974cc5dc7a7d920f`.
- **Fact:** the new Inspector projects that accepted Pair as valid and rejects
  exact-key, coherent aggregate, ArtifactRef traversal, outcome and hardlink
  tampering.
- **Fact:** the HTTP server binds explicitly to `127.0.0.1`, accepts only fixed
  versioned routes and opaque identifiers, and has no State mutation, artifact
  download, shell, arbitrary path/command, Provider, environment or Credential
  endpoint.
- **Fact:** Session create/open/list/continue call
  `PersistentSessionServiceV35`; continuation is deterministic/Faux and is
  labeled that way.
- **Fact:** focused and affected regression verification produced 37 passing
  tests with zero Credential, external-network, Provider or real-model access.
- **Inference:** the implemented projection answers the Goal question without
  moving authority into the browser or demo fixture.
- **Recommendation:** Main review the bounded commit and cited evidence; Main
  alone decides Goal acceptance and any `CURRENT_STATE.md` update.

## Implementation summary

### Slice A — Inspector and Read Model

- Added `inspectGoal25PairV35`, independent of the real execution entry.
- Enforced ordinary-file, no-link, no-hardlink and contained ArtifactRef
  boundaries for Pair, Run, Session, handoff and Verifier evidence.
- Enforced exact object keys for comparison, Manifest, Runtime reservations,
  outcome, Session link, settled handoff, first payload, binding, Case authority
  and Verifier result structures.
- Recomputed comparison, Manifest, Runtime, outcome, link, handoff, payload,
  binding, authority and fairness digests.
- Reconciled fixed Pair/arm/Run/Session/Case/project identities, Base/Candidate
  membership, settled handoff gates, one Verifier per arm, payload fairness,
  Session JSONL entry identity and counters.
- Preserved producer semantics: access counters are shared monotonic Pair
  counters; dispatch/token/cost totals are sums of the two arm Manifests.
- Added safe typed projections for Session/Run, V2 recovery, Goal 2.5,
  adaptation lineage and State history. Missing history remains explicit as
  `not_recorded` or `unavailable`.

### Slice B — loopback application/API

- Added a Node built-in HTTP server with an immutable loopback host and
  ephemeral-port support for tests.
- Added only the Contract routes for overview, Sessions, V2/Goal 2.5
  comparisons, adaptation, State history and three static assets.
- Added strict JSON media-type, exact body-field, 16 KiB body, opaque-ID,
  method, route, raw/encoded traversal and ordinary static-file checks.
- Error responses are bounded and do not echo host paths or internal exceptions.

### Slice C — static WebUI

- Added a dependency-free HTML/CSS/JavaScript UI with Session sidebar, safe
  conversation/Tool projection, deterministic create/continue, Run details,
  Base/Candidate and V2 comparisons, adaptation lineage, Prompt/Skill diff,
  State version/decision/rollback history and active identity.
- The UI explicitly states that browser rollback mutation is deferred.
- Goal 2.5 wording is exact: “Both arms passed; no task-success advantage was
  observed for the Skill; Candidate used more tokens.”

### Slice D — portable demo

- Added a sanitized typed projection under `fixtures/v3-5/goal3-demo/`.
- Projection SHA-256 before commit:
  `f7db468b44fac8520ea1c0e295d966e32f0a8ab47ff8f39563c5c501d5d1e33f`.
- It is marked derived/non-authoritative, retains the accepted comparison
  digest, contains no raw Session/Provider payload, private reasoning,
  Credential, hidden answer or absolute path, and declares no winner.
- The start command accepts host-configured evidence roots before startup; no
  filesystem path is accepted from or returned to the browser.

## Complexity checkpoint

This Session encountered more than one ordinary implementation correction, so
the Contract checkpoint is recorded here.

- Version/Goal question: can the accepted persistent and adaptive evidence be
  made locally inspectable without changing execution or State authority?
- Evidence obtained: accepted Pair direct projection, fixed-route API/static
  smoke, Session create/continue, tamper cases, and affected State regressions.
- Evidence still missing: in-app Browser automation was blocked by that tool's
  URL policy for `127.0.0.1`; the same HTML/JS/API path passed direct loopback
  smoke. The historical Goal 1 cross-process test was not rerun because its
  ignored linked-worktree loader was absent; affected Goal 1 projections passed
  using the pinned public loader and the accepted historical proof remains
  unchanged.
- Required now: the completed monotonic-counter interpretation and raw
  pre-normalization traversal correction.
- Deferred: browser State mutation, full automated catalog rebuild, realtime
  streaming, database, Router, IDE/terminal and additional real paths.
- Rejected: new Session/Stage, architecture expansion, dependency, Pi change,
  real access or reinterpretation of Goal 2.5.
- Decision: continue in the original Session because the Goal question,
  architecture, authority, budget and allowlist remained unchanged.

## Source Delta

Modified:

- `workbench/package.json` — two scripts only; no dependency change.
- `workbench/README.md` — concise Goal 3 demo instructions.
- `workbench/src/contracts/v35g25-types.ts` — read-side Pair types.

Added:

- `workbench/src/contracts/v35g3-types.ts`
- `workbench/src/v35g25/inspect-v35g25.ts`
- `workbench/src/read-model/workbench-v35g3.ts`
- `workbench/src/webui/application-v35g3.ts`
- `workbench/src/webui/projection-v35g3.ts`
- `workbench/src/webui/server-v35g3.ts`
- `workbench/src/webui/static/index.html`
- `workbench/src/webui/static/styles.css`
- `workbench/src/webui/static/app.js`
- `workbench/scripts/start-v35g3-demo.ts`
- `workbench/tests/v35g3-inspector-read-model.test.ts`
- `workbench/tests/v35g3-application-api.test.ts`
- `fixtures/v3-5/goal3-demo/projection.json`
- the three Goal 3 reports.

No protected/control file, accepted Closeout, raw evidence, `.upstream/pi/` or
reference file was modified.

## Commands and Exit Codes

| Command | Exit | Result |
|---|---:|---|
| `npm.cmd run v35g25:typecheck` | 0 | strict TypeScript passed |
| `npm.cmd run v35g3:test` | 0 | 6 passed |
| direct `inspectGoal25PairV35` against accepted Pair | 0 | valid; exact digest `243d...920f` |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-name-pattern="safe Session projection|catalog, project|versioned Read Model|Read Model rejects|catalog cannot override" tests/v35-persistent-session.test.ts` | 0 | 5 passed |
| `npm.cmd run v35g25:test` | 0 | 13 passed; zero-access counters `0/0/0/0/0` |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g2-validate-promote-reject-rollback.test.ts` | 0 | 6 passed |
| same loader and options with `tests/v3g3-selective-reuse.test.ts` | 0 | 7 passed after filesystem-only approval for its established external `.runs` root |
| `node ... scripts/start-v35g3-demo.ts --port 43136` plus `GET /api/v1/overview` | 0 / 200 | loopback demo started and returned deterministic/Faux overview |
| `git diff --check` | 0 | clean |
| final allowlist/protected/Pi/evidence identity audit | 0 | passed |

Observed non-product command limitations:

- `npm.cmd run v35g1:test` exited 1 before loading tests because the linked
  worktree lacks ignored `.runs/v3-5-g1/runtime/public-pi-loader.mjs`. No source
  correction or evidence substitution was made.
- The first V3-G3 regression attempt exited 1 on sandbox `EPERM`; the identical
  authorized rerun passed 7/7.
- In-app Browser automation refused the loopback URL under its URL policy. No
  bypass was attempted; API/static/browser-asset behavior is covered by the
  passing focused HTTP smoke.

## Evidence Index

- Accepted immutable Pair (read-only):
  `C:/Users/HUAWEI/.codex/worktrees/d073/project2/.runs/v3-5-g2-5/real-pair-replacement-20260809-01`
- Accepted comparison: `<Pair>/comparison.json`
- Portable projection: `fixtures/v3-5/goal3-demo/projection.json`
- Inspector/Read Model tests:
  `workbench/tests/v35g3-inspector-read-model.test.ts`
- Application/API/static/demo tests:
  `workbench/tests/v35g3-application-api.test.ts`
- Generated ignored test/runtime evidence: `.runs/v3-5-g3/`
- Pinned Pi (read-only): `D:/AI/AI_Projects/project2/.upstream/pi`

## Zero-access accounting

```yaml
credential_reads: 0
external_network_calls: 0
provider_model_calls: 0
real_model_calls: 0
dependency_installs: 0
pi_edits: 0
state_mutation_http_calls: 0
```

## Unverified / retained limitations

- No claim is made about crash recovery, exactly-once Tool effects, database
  durability, multi-user operation or external-model Session continuation.
- Actual in-app Browser automation could not traverse its loopback URL policy;
  ordinary browser rendering remains a Main/manual demo check if desired.
- Browser rollback mutation remains intentionally deferred.
- Goal 2.5 remains one fixed Pair with both arms passing, Candidate using more
  tokens and no observed task-success advantage for the Skill. No winner or
  general Skill-effect claim is introduced.

## CURRENT_STATE_UPDATE_PROPOSAL

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  proposal_only: true
  proposed_by: V3_5_G3_ADAPTIVE_HARNESS_WEBUI_DEMO_implementation_session
  active_goal: V3_5_G3_ADAPTIVE_HARNESS_WEBUI_DEMO
  implementation_status: READY_FOR_BOUNDED_MAIN_REVIEW
  implementation_commit: SELF_EXACT_SHA_IN_SESSION_HANDOFF
  goal_acceptance: NOT_DECIDED
  v3_5_acceptance: NOT_DECIDED
  accepted_goal25_comparison_digest: 243d1c476385333d297bff296b69d9dd5d7be87ea041b25c974cc5dc7a7d920f
  credential_reads: 0
  external_network_calls: 0
  provider_model_calls: 0
  real_model_calls: 0
  state_mutation_http: false
  browser_rollback_mutation: deferred
  retained_limitations:
    - single_frozen_goal25_pair_no_skill_advantage_observed
    - candidate_used_more_tokens
    - in_app_browser_loopback_url_policy_blocked_automation
    - historical_goal1_cross_process_loader_not_materialized_in_linked_worktree
  main_actions:
    - review_bounded_source_and_evidence
    - decide_goal3_acceptance
    - if_accepted_update_CURRENT_STATE_in_Main
```
