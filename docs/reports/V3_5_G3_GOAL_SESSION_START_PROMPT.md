# V3.5 Goal 3 Top-level Implementation Session Start Prompt

You are the dedicated top-level Implementation Session for:

```text
V3_5_G3_ADAPTIVE_HARNESS_WEBUI_DEMO
```

You own bounded Goal 3 implementation, ordinary in-scope defect correction, focused
verification, one bounded implementation commit, the Implementation Report and Closeout
Draft. You do not own Goal acceptance, V3.5 acceptance, scope expansion or control-state
changes.

## 1. Exact start state

```yaml
control_baseline_commit: 23592060f8fafd87d40180daef1a2350473978ae
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
goal_contract: docs/第二项目_Codex交接包_2026-07-30/V3_5_G3_GOAL_CONTRACT.md
credential_reads_authorized: 0
external_network_authorized: false
loopback_http_authorized: true_127_0_0_1_only
provider_model_calls_authorized: 0
real_model_calls_authorized: 0
dependency_install_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
runtime_route_switch_authorized: false
bounded_implementation_commit_authorized: true_once_within_contract_allowlist
```

## 2. Gate A — mandatory read-only preflight

Before editing anything:

1. Confirm `git rev-parse HEAD` is exactly
   `23592060f8fafd87d40180daef1a2350473978ae`.
2. Confirm all tracked files are clean. Do not delete or add unrelated untracked reference
   material merely to make status empty.
3. Read completely, in this order:
   - `AGENTS.md`;
   - `CURRENT_STATE.md`;
   - `docs/第二项目_Codex交接包_2026-07-30/V3_5_CHARTER.md`;
   - `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
   - `docs/第二项目_Codex交接包_2026-07-30/V3_5_G3_GOAL_CONTRACT.md`;
   - `docs/reports/V3_5_PREIMPLEMENTATION_REVIEW.md`;
   - `docs/reports/V3_5_G1_CLOSEOUT.md`;
   - `docs/reports/V3_5_G2_CLOSEOUT.md`;
   - `docs/reports/V3_5_G2_5_CLOSEOUT.md`;
   - `docs/reports/V3_CLOSEOUT.md` and the V3 Goal 1/2/3 Closeouts named by
     `CURRENT_STATE.md`;
   - relevant source/tests named below.
4. Before inspecting pinned Pi, read every applicable `.upstream/pi/AGENTS.md` completely.
   Verify Pi HEAD is exactly `027a5847901b5dde30270abaa1041046cd2b4b55` and Pi tracked
   status is clean.
5. Verify this read-only accepted evidence root exists:
   `C:/Users/HUAWEI/.codex/worktrees/d073/project2/.runs/v3-5-g2-5/real-pair-replacement-20260809-01`.
6. Verify `comparison.json` has file SHA-256
   `26e398c922d1b78e3a5784b83875077156f63bd7eb42f6d46e5d7ccf0d636da9`
   and embedded comparison digest
   `243d1c476385333d297bff296b69d9dd5d7be87ea041b25c974cc5dc7a7d920f`.
7. Confirm no Credential, external network, Provider/model, dependency-install, Pi-edit,
   SDK/Extension/RPC switch or State-mutation HTTP authority exists.

If exact baseline, Pi identity/cleanliness or accepted evidence identity fails, stop with a
short Pause Report. Do not repair control state or substitute another evidence root.

## 3. Required source study

Read the minimum necessary implementation paths before designing edits:

```text
workbench/src/session/persistent-session-v35.ts
workbench/src/read-model/read-model-v35.ts
workbench/src/contracts/v35-types.ts
workbench/src/contracts/v35g2-types.ts
workbench/src/contracts/v35g25-types.ts
workbench/src/v35g2/inspect-v35g2.ts
workbench/src/v35g25/pair-v35g25.ts
workbench/src/v35g25/checkpoint-v35g25.ts
workbench/src/state/store-v3.ts
workbench/src/state/binding-v3.ts
workbench/src/refinement/evidence-v3.ts
workbench/src/refinement/comparator-v3.ts
workbench/src/run-v3.ts
workbench/tests/v35-persistent-session.test.ts
workbench/tests/v35g25-termination-safe.test.ts
workbench/tests/v3g2-validate-promote-reject-rollback.test.ts
workbench/tests/v3g3-selective-reuse.test.ts
workbench/package.json
```

Reuse existing inspectors and controllers. Do not make the browser, API or demo projection
an authority over raw Session, Run, Verifier, comparison or State evidence.

## 4. Required implementation

Complete the following four vertical slices in this one Session.

### Slice A — Goal 2.5 Inspector and safe Read Model

- Add one read-only `inspectGoal25PairV35`-class boundary under
  `workbench/src/v35g25/inspect-v35g25.ts`.
- Validate exact keys, semantic identities, comparison/Manifest/outcome/link digests,
  ordinary-file and ArtifactRef containment, Base/Candidate membership, settled handoff,
  one Verifier per arm, fairness identity and aggregate counters.
- Do not import/invoke the real execution entry, modify accepted pair writers, weaken the
  older Goal 2 Inspector or reinterpret the result.
- Add the smallest typed Goal 2.5 Read Model adapter and stable aggregate safe views for
  Session/Run, V2 recovery, Goal 2.5 comparison, V3 adaptation lineage and State history.
- Missing historical fields must remain explicit `not_recorded`/`unavailable` facts.

### Slice B — loopback-only application/API

- Use Node built-in HTTP/static capabilities; add no dependency.
- Bind only to `127.0.0.1`; use an ephemeral port in tests; never bind to `0.0.0.0`.
- Configure allowlisted services/evidence roots before startup. Browser requests use
  opaque IDs, never filesystem paths.
- Provide only the Contract-bounded versioned overview, Session, comparison, adaptation,
  State-history and static-asset routes.
- Session create/open/continue must call `PersistentSessionServiceV35`; continuation is
  deterministic/Faux and must be labeled accurately.
- Bound JSON body size and reject unknown methods/routes, malformed IDs, encoded/plain
  traversal, non-ordinary static files and unsupported content types.
- Expose no raw artifact download, shell, arbitrary command/path/provider, environment,
  Credential, private reasoning or State-mutation endpoint.

### Slice C — inspectability-first static WebUI

Implement a small understandable HTML/CSS/JavaScript UI with:

- Session sidebar and safe conversation/Tool rendering;
- bounded deterministic Session create/continue;
- Run/Verifier/Outcome details and digest/source-reference metadata;
- V2 recovery comparison and Goal 2.5 Base/Candidate comparison;
- Evidence → Diagnosis → Lesson → Prompt/Skill → Validation → Decision → active State →
  selective binding explanation;
- Prompt/Skill diff, State/version/decision/rollback history and current active identity;
- an explicit notice that browser rollback mutation is deferred;
- accurate Goal 2.5 wording: both arms passed; no task-success advantage was observed for
  the Skill; Candidate used more tokens.

No realtime streaming, framework build chain, database, IDE, terminal, Router or new Eval
Runtime.

### Slice D — portable demo and reports

- Support live host-configured evidence roots without exposing them to the browser.
- Commit one small sanitized typed demo projection under `fixtures/v3-5/goal3-demo/` so a
  clone can render the primary views without ignored `.runs/` data.
- Mark the projection as derived/non-authoritative, preserve the accepted Goal 2.5 digest,
  include no raw Session/provider payload, private reasoning, Credential, hidden answer or
  absolute path, and do not invent a winner.
- Add one bounded start/demo command and concise Goal 3 instructions to the existing
  Workbench README.

## 5. Source allowlist

Modify only the smallest necessary subset of:

```text
workbench/src/contracts/*v35*.ts
workbench/src/read-model/
workbench/src/v35g25/inspect-v35g25.ts
workbench/src/webui/
workbench/tests/v35g3-*.test.ts
workbench/scripts/*v35g3*
fixtures/v3-5/goal3-demo/
workbench/package.json                 # scripts only, no dependency
workbench/README.md                    # concise Goal 3 instructions
docs/reports/V3_5_G3_IMPLEMENTATION_REPORT.md
docs/reports/V3_5_G3_CLOSEOUT_DRAFT.md
docs/reports/V3_5_G3_DEMO_GUIDE.md
```

Do not modify or stage:

```text
CURRENT_STATE.md
AGENTS.md
V3_5_CHARTER.md
09_对接执行、文件权威与验收规则.md
V3_5_G3_GOAL_CONTRACT.md
accepted Closeouts or raw evidence
.upstream/pi/
reference/
Credential files
```

## 6. Verification and ordinary corrections

Run and record the narrowest commands that prove:

1. strict TypeScript for the affected Workbench configuration;
2. Goal 2.5 Inspector/Read Model positive and tamper cases;
3. persistent Session list/open/create/continue application cases;
4. loopback API/static/path/redaction/body-boundary cases;
5. browser/API/demo smoke;
6. affected Goal 1 and V3 read/State regressions;
7. direct read-only projection of the accepted real Goal 2.5 comparison and exact digest;
8. zero Credential, external network, Provider/model and real-model access;
9. pinned Pi remains unchanged and clean.

TypeScript, schema, HTTP, fixture, CSS, serialization and path defects within the allowlist
are ordinary implementation work. Fix them in this Session and continue. Do not create
new Stages, R1/R2, an audit or another implementation Session for ordinary defects.

If a second material correction is required, record a short complexity checkpoint in the
Implementation Report. Continue when the Goal question, architecture, authority and scope
remain unchanged; stop only when a Contract Hard Stop is hit.

## 7. Commit and deliverables

After all Exit Criteria are supported:

1. verify the source delta is allowlisted;
2. verify protected/control files and pinned Pi are unchanged;
3. create exactly one bounded implementation commit with a concise message such as
   `feat(v3.5): add inspectable local workbench`;
4. record exact commit SHA, commands, exit codes, test counts and evidence locations;
5. produce:
   - `docs/reports/V3_5_G3_IMPLEMENTATION_REPORT.md`;
   - `docs/reports/V3_5_G3_CLOSEOUT_DRAFT.md`;
   - `docs/reports/V3_5_G3_DEMO_GUIDE.md`;
   - Source Delta;
   - Commands and Exit Codes;
   - Evidence Index;
   - structured `CURRENT_STATE_UPDATE_PROPOSAL` in the report/Closeout Draft.

Do not modify `CURRENT_STATE.md` or accept Goal 3/V3.5 yourself. Stop after returning the
commit and reports for bounded Main review.

## 8. Hard stops

Stop immediately and return a concise Pause Report if work requires or causes:

- Pi Core patch/private import or SDK/Extension/RPC/server route switch;
- dependency installation, external network, Credential or Provider/model access;
- raw Session/provider/private-reasoning exposure or browser-supplied filesystem paths;
- State mutation HTTP or direct State-file writes;
- changed Verifier, promotion, budget/security or accepted State authority;
- weakened Goal 2/Goal 2.5 validation or reinterpreted accepted results;
- reopening V2/V3/Goal 2.5, a new Case/Skill experiment, database, Router, streaming
  subsystem, IDE/terminal or multi-user platform;
- a correctness defect contradicting an accepted V3/V3.5 claim;
- required edits outside the source allowlist.

When stopped, do not choose an architecture expansion. Report observed evidence, why it
blocks, and the smallest decision Main/user would need.
