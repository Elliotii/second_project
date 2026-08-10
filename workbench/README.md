# Agent Harness Reliability Workbench — V0

V0-A, V0-B, and V0-C are closed and accepted. Together they form a minimum
Workbench that can run a bounded Coding Task through the public Pi
`AgentHarness`, control a copied Workspace, correlate runtime identities and
events, verify the result outside the Agent write scope, preserve reviewable
evidence, and produce one formal Outcome.

V0-A established the direct Pi integration, Workspace/path boundary,
command-ID surface, and Task/Strategy/Run/Attempt/Session/Workspace identities.
V0-B then converted one settled Attempt into bounded, reviewable evidence:

- a complete in-process Pi Session plus an append-only, reasoning-safe public JSONL evidence mirror;
- a closed-envelope lifecycle Journal with Run/Attempt/Session/Workspace and Tool Call/Result correlation;
- an external verifier outside the Agent write scope;
- write-once `Outcome`, Evidence Index, and final terminal commit marker;
- a deterministic secret/reasoning scan over the Session, Journal, artifacts,
  terminal objects, and pending Outcome before any terminal marker is written;
- one bounded terminal-evidence policy shared by the writer and `inspect` for
  required Index paths/responsibilities, scan scopes/projections, and the final
  `evidence_validation_completed < outcome_created < run_terminal` Journal suffix;
- explicit budgets, abort snapshot, ArtifactRefs, and read-only `inspect`;
- deterministic `passed/null`, `failed/agent`, `invalid/verifier`, and `invalid/evidence` routes.

The verifier executes the Run-local write-once source snapshot whose digest was
fixed by preflight. Its executable, argv, cwd identity, environment allowlist
keys, timeout, output cap, duration, and full-output ArtifactRef are evidence.
Artifact reads reject linked Run roots, linked path segments, real-path escapes,
directories, malformed envelopes, and digest/size mismatches.

`wall_time_usage_ms` ends immediately after the integrated scan and before the
terminal commit sequence. It includes the Agent/Faux cycle, settlement, Session
persistence, external verifier, preterminal validation, and integrated scan.
The writer checks the deadline again immediately before `terminal.json`; a
crossing fails closed without a terminal marker. This does not claim exact
last-disk-byte timing, real-time scheduling, or process-tree cancellation, and
unavoidable final marker-write latency is outside the recorded endpoint.

Two evidence faults are intentionally distinct. Post-persistence corruption can
produce a committed `invalid/evidence` envelope whose damaged ArtifactRef is
rejected. An actual evidence-mirror append failure stops before the verifier and
leaves an incomplete, non-committed Run for `inspect`; it is not attributed to
the Agent.

`settled` still means only that Pi completed the bounded cycle. The external verifier and evidence validator determine the formal Outcome using the accepted causal precedence. V0-A's `foundation_acceptance` remains a historical Goal-specific record with `formal_outcome: null`.

Pi-specific imports remain centralized under `src/pi/`. Runtime dependencies resolve to the ignored isolated Pi copy at `.runs/v0-a/pi`; no Pi Core source is modified. V0-B uses a new external manifest and verifier while preserving the accepted V0-A fixture byte-for-byte.

V0-C added deterministic Completion decisions and at most one bounded
same-Session Recovery Attempt. Its Stage 2 user-acceptance Run proved that a
frozen real-provider composition can execute one real Coding Task through the
formal Product Surface without modifying Pi Core.

The tracked CLI intentionally does not contain credentials or a general
provider registry. Its real strategy requires explicitly injected execution
dependencies and otherwise fails closed; the accepted Stage 2 composition was
UAT-local, ignored under `.runs/`, and is not tracked product source. Therefore
V0 is a proven bounded Workbench foundation, not yet a turnkey multi-provider
CLI.

## Boundaries and non-claims

V0-A, V0-B, and V0-C Stage 1 used only the public emitted Faux provider, with
zero external Provider/model calls. V0-C Stage 2 then completed one authorized
real DeepSeek Run. That Run's initial Verifier passed, so no Recovery was
triggered. The Session evidence mirror is intentionally not a continuation
store.

The implementation does **not** prove real-model effectiveness, Completion
Policy improvement, successful Recovery after a real failure, cross-process
Resume, crash-after-side-effect reconciliation, exactly-once Tool execution, an
OS sandbox, network-egress blocking, statistical Eval validity, V1 Skill
competition, or V2 adaptive multi-path recovery.

The verifier timeout uses bounded child-process termination but does not claim
system-level process-tree termination. Windows junction/reparse coverage shares
the link-rejection branch; file-symlink coverage depends on the current account's
OS permission.

## Source, license, and attribution

- Upstream: `earendil-works/pi`, local pinned commit `027a5847901b5dde30270abaa1041046cd2b4b55`, packages `@earendil-works/pi-agent-core` and `@earendil-works/pi-ai` version `0.82.1`.
- Upstream repository recorded by the pinned checkout: `https://github.com/earendil-works/pi.git`.
- Upstream license: MIT; copyright © 2025 Mario Zechner. The authoritative license text remains at `.upstream/pi/LICENSE`.
- Execution basis: emitted artifacts are used only from the ignored, isolated `.runs/v0-a/pi` copy. No upstream source or emitted Pi artifact is added to the tracked V0-A deliverables.
- Fixture provenance: the behavior and shape were re-materialized from the accepted local G006 baseline at `.runs/g006/attempt-001/workspaces/baseline/`; the V0-A fixture is a separate project-owned artifact with its own TaskSpec and digests.

Commands:

```powershell
.runs/v0-a/pi/node_modules/.bin/tsc.cmd -p workbench/tsconfig.json
node --test workbench/test
node workbench/src/cli.ts run --task fixtures/tasks/v0-a-parse-duration/task.json --strategy v0a_faux_single_cycle --dry-run
node workbench/src/cli.ts run --task fixtures/tasks/v0-a-parse-duration/task.json --strategy v0a_faux_single_cycle
node workbench/src/cli.ts run --task fixtures/manifests/v0-b-parse-duration.json --strategy v0_observe_only_faux --dry-run
node workbench/src/cli.ts run --task fixtures/manifests/v0-b-parse-duration.json --strategy v0_observe_only_faux
node workbench/src/cli.ts inspect --run <run-id>
```

V0-C Stage 1 product commands:

```powershell
node workbench/src/cli.ts run --task fixtures/manifests/v0-c-parse-duration-public.json --strategy v0_c_observe_only_faux --dry-run
node workbench/src/cli.ts run --task fixtures/manifests/v0-c-parse-duration-public.json --strategy v0_c_recover_once_same_session_faux
node workbench/src/cli.ts inspect <run-id>
node workbench/src/cli.ts run --task fixtures/manifests/v0-c-parse-duration-public.json --strategy v0_c_recover_once_same_session_deepseek_v4_flash --dry-run
node workbench/scripts/run-v0c-deterministic-suite.mjs
```
## V0-C Completion and real-use closeout

V0-C preserves the accepted V0-A/V0-B foundation and adds bounded Completion
and same-Session Recovery. A Run owns one long-lived public Pi
`AgentHarness`/Session/Workspace handle, one or two started Attempts, a
public-only Failure Packet, one Completion decision per evaluated Attempt, a
single Run validation, and a dynamic closed evidence set. Recovery can issue at
most one child Attempt and checks the frozen child reserve before persisting a
Packet or allocating the child identity.

Stage 1 used only the deterministic public emitted Faux Provider. After focused
audit, correction, and a frozen Implementation Baseline, the separately
authorized replacement Stage 2 Run
`run-c3297fc5-bfd1-4bd1-b46c-3a636271a177` completed with formal Outcome
`passed`, 5 Provider/model calls, 8 Tool calls, 16,625 tokens, and cost
`0.0012407808000000002` USD. Its initial Verifier passed; Recovery observed was
zero.

The corrected V0-C Product Surface keeps its Pi handle alive through terminal
commit, scans each persisted Failure Packet with the shared V0-B rules before
allocating a child identity, freezes Run-level lineage/budget/evidence-plan
validation before Outcome, and exposes an explicit authority/credential/
Provider-factory/budget injection boundary used by the accepted Stage 2. The
default real-profile execution path has no authority or dependencies and
therefore fails before creating any formal runtime identity. Tests reach the
same orchestration with injected non-secret Faux dependencies only.

V0 is now closed. No additional real-model Run, V1 work, or later-version
implementation is authorized by this README.

## V1-B Stage 1 preparation surface

V1-B Stage 1 adds a separately versioned one-Run authority and a tracked
public-Pi composition without changing V1-A's accepted one-request seam. The
Stage 1 surface is strictly zero-call: it uses the public emitted Faux route,
never resolves a real credential, never accesses the network, and records all
real credential/network/Provider/model counters as zero.

The execution Manifest preallocates the frozen 24 cells. `run-next` derives the
only legal next cell from the immutable Manifest plus the append-only ledger;
it cannot select, retry, replace, or overwrite a cell. Each cell owns a copied
Workspace, one long-lived Pi Session/handle, one initial Attempt and—only for
an eligible failed C arm with the complete reserve—one same-Session child.
Every Provider request, Tool call, Verifier and child allocation is reserved
against Attempt, Run and Pilot evidence before dispatch/allocation. Unknown or
malformed usage fails closed.

The independent Inspector reloads Manifest, ledger, terminal marker,
RunResult, dispatch evidence and ArtifactRefs. Producer and Inspector each
traverse the final Workspace tree independently, reject links/path escapes or
unsupported entries, scan every regular-file byte, and bind one typed tree
reference. Aggregate recomputes counts and
checks complete B/C initial-dispatch equality plus the A/B Skill-only delta; it
does not trust an execution summary or mutate evidence.

Stage 1 commands (all default to ignored `.runs/v1-b/stage1/pilot-cli`):

```powershell
node workbench/src/cli.ts v1b preflight
node workbench/src/cli.ts v1b run-next
node workbench/src/cli.ts v1b inspect --run <planned-run-id>
node workbench/src/cli.ts v1b aggregate
node workbench/../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p workbench/tsconfig.json
node --test workbench/tests/v1b-stage1.test.ts workbench/tests/v1b-cli.test.ts
```

The tracked real route is the same `run-next` command plus the explicit
`--stage2-real-authority` switch and a frozen `stage2_real` Manifest. Both are
required. The switch constructs the bounded public-Pi one-Run composition;
`DEEPSEEK_API_KEY` remains an opaque lazy identity and its value is resolved
only inside an already-started authorized Run immediately before first
dispatch. A Stage 1 Manifest rejects the switch, and a real Manifest without
the switch fails before Pilot initialization or a `started` transition.

This preparation surface does not authorize Stage 2, credential access,
network traffic, external Provider/model calls, source repair during
execution, Audit acceptance, or a Git commit. The real execution Manifest must
be rebound by the Main Session to a reviewed Candidate/Execution Baseline
before any separately authorized Stage 2 Session may use it.

## V2-A deterministic recovery substrate

V2-A adds a zero-call, two-path recovery flow on the same direct public Pi
`AgentHarness` route. After a valid initial Verifier failure, the Workbench
freezes an immutable failed-Workspace/parent-Session Recovery Seed, runs both
`continue_failed_session` and `fresh_session_from_failure_seed` from isolated,
byte-identical Workspace copies, verifies each path independently, and applies
the frozen hard-gate-first selector. An initial Verifier pass creates no
recovery objects.

```powershell
npm run v2a:test
npm run v2a:deterministic
node src/cli.ts v2a run --run-root <path> --run-id <id> --scenario a_pass_b_fail
node src/cli.ts v2a inspect --run-root <path>
```

V2-A uses only the Faux Provider and fixed local fixtures. It does not read
credentials, use the network, call an external Provider/model, apply a
selected Workspace to the repository, or implement V2-B.

The V2-A Inspector requires both the Run root and the live project root. It
recomputes the current `workbench/src` inventory and derives Verifier status,
Session lineage, initial Workspace equality, Attempt/Group budgets, terminal
semantics, and selector Hard Gates from raw write-once Artifacts. Session JSONL
inspection preserves exact record and prefix bytes, accepts only the producer's
LF-terminated records, and rejects blank records. Hit-specific line-byte
correction evidence is generated only under
`.runs/v2-a/line-byte-corrected-evidence/**`; the earlier evidence, audit,
corrected-evidence, and re-audit roots remain preserved.

## V2-B Stage 1 thin real composition

V2-B Stage 1 adds an explicit execution port to the accepted V2-A Controller.
Its real-shaped deterministic route passes each caller-owned public JSONL
Session directly to `AgentHarness`, preserves the V2-A Seed, isolated A/B
Workspaces, Session-history-only treatment delta, external Verifier, Selector,
and read-only Inspector, and records typed Manifest, composition, reservation,
known/conservative usage, counter, cost, and terminal evidence.

The dormant Stage 2 port reuses the accepted one-Run opaque Credential
authority and public DeepSeek provider profile. Constructing that port does not
resolve a Credential or construct/call the Provider. Those actions occur only
inside an authorized execution call. Stage 1 never invokes that call and its
Credential, network, external Provider, real-model, and real-cost counters are
all zero.

```powershell
npm run v2b:stage1
node src/cli.ts v2b-stage1 run --run-root <path> --run-id <id> --scenario negative_initial_pass
node src/cli.ts v2b-stage1 inspect --run-root <path>
```

After Main creates and freezes the Execution Baseline, the same tracked product
surface can build the immutable three-Case Stage 2 Manifest. A fresh Stage 2
Session needs no source, fixture, Prompt, Skill, Verifier, Manifest, or control
file edit: it can perform the read-only preflight/inspection below and can call
`run-next` only with separate explicit real authority.

```powershell
node src/cli.ts v2b-stage2 build-manifest --sequence-id <id> --execution-baseline-commit <sha> --execution-baseline-tree <tree> > <manifest.json>
node src/cli.ts v2b-stage2 preflight --manifest <manifest.json>
node src/cli.ts v2b-stage2 inspect --manifest <manifest.json> --sequence-root <path>
node src/cli.ts v2b-stage2 run-next --manifest <manifest.json> --sequence-root <path> --stage2-real-authority
```

The Manifest predeclares Primary, conditional Contingency, and Negative. The
append-only sequence ledger reserves every started Attempt conservatively,
rejects repetition/replacement/third Cases, enforces Attempt/Group/sequence
ceilings, and terminalizes an ineligible or invalid route as a typed Pause.
An evidence-valid Primary pre-dispatch stop with exactly zero Provider requests
and zero network/Provider/model dispatch preserves a write-once Case Pause and
may activate only the already-predeclared Contingency; post-dispatch or invalid
Pause evidence cannot authorize it.
Credential resolution is late-bound once per started Run, cached only for that
Run's Primary/A/B composition, and cleared when it closes.

This is deterministic Stage 1 readiness only. It does not authorize Stage 2,
read a Credential, make a network or real-model call, prove real recovery
effectiveness, select a V2 winner, or accept/close V2-B or V2.

## V2-B bounded R2 zero-call preparation

The accepted R2 Amendment keeps the same V2 Controller and exposes its actual
Seed freeze and Seed-to-Recovery-Group seams. A tracked derived-behavior fixture
is written by the deterministic public `AgentHarness` through
`workspace_write`, its declared public check passes, the harness settles, and
the unchanged external target Verifier fails before the immutable Seed is
created. Candidate A still uses public JSONL fork and Candidate B still uses
public JSONL create; both start from byte-identical isolated Seed Workspaces.

The frozen Stage 2 `run-next` surface now uses that controlled zero-access
Primary for the Positive Case, then routes only A/B through the injected dormant
real port. Credential resolution therefore remains late-bound once per real
Run, after the controlled Seed is valid. The already-predeclared Contingency is
skipped after the controlled Seed forms, and the separate Negative retains the
real no-branch route.

A pre-dispatch request-cap refusal is verifier-eligible only after the shared
Controller reopens the public JSONL Session, freezes pre-Verifier Session and
Workspace refs, reconciles raw usage/reservations and Tool Result closure, and
writes the checkpoint into the append-only Journal. The read-only Inspector
derives the same gate from those raw bytes and ordering; summary booleans are
not authority. It remains labeled `pre_dispatch_budget_terminal`, never
`settled`. Unknown usage, reservation overflow, Tool-cap/pending-side-effect,
post-dispatch, malformed, or injected compatibility-bypass states stop before
the Verifier and before the other Candidate.

The schema-aware Inspector permits only a finite non-negative numeric
`message.usage.reasoning` field. Reasoning/thinking content, signatures,
Authorization/Credential material, unknown sensitive shapes, and broken Tool
Call/Tool Result lineage remain fail-closed.

```powershell
npm run v2b:r2
```

This command is a zero-access deterministic proof. It does not authorize the
fresh R2 audit or real Execution Session.

## V3.5 Goal 3 local inspectable workbench

Start the portable deterministic demo from `workbench/`:

```powershell
npm run v35g3:demo
```

Open `http://127.0.0.1:43135`. The server binds only to IPv4 loopback. Session
create and continue use `PersistentSessionServiceV35`; continuation is the
bounded deterministic/Faux route. The committed projection under
`fixtures/v3-5/goal3-demo/` is sanitized, derived and non-authoritative. It
preserves the accepted Goal 2.5 comparison digest but contains no raw Session,
Provider payload, private reasoning, Credential or host path.

Hosts may configure live read-only evidence before startup without exposing a
filesystem path to the browser:

```powershell
npm run v35g3:demo -- --pair-root <goal-2.5-pair-root> --v2-root <v2-terminal-root> --v3-root <v3-run-root> --state-root <state-root> --state-project-id <project-id>
```

Only the versioned overview, Session, V2/Goal 2.5 comparison, adaptation,
State-history and three fixed static routes are served. There is no artifact
download, shell, arbitrary path/command, Provider, environment, Credential or
State-mutation endpoint. Browser rollback mutation is explicitly deferred.

V3.5 is closed and accepted. The authoritative version result and bounded claims are in
`../docs/reports/V3_5_CLOSEOUT.md`; the architecture and interview reading path is in
`../docs/V3_5_ARCHITECTURE_AND_INTERVIEW_GUIDE.md`. The valid Goal 2.5 Pair does not prove
Skill superiority: both arms passed and the Candidate used more tokens.

## V3.6 Goal 1 open-task control plane

Start the deterministic zero-access Goal 1 surface from `workbench/`:

```powershell
npm run v36g1:demo
```

Open `http://127.0.0.1:43136`. The browser submits only a registered opaque project ID,
`inspect_only` or planned `bounded_edit`, free task text, an optional title, and an
optional existing Session ID. The Host generates Session/Run IDs, creates a link-free
managed copy, pins Project/Profile/code/State/backend/provider-policy/capability
identities, and writes immutable interactive Run Authority before the deterministic Faux
dispatch seam. Continuing a Session keeps those identities; using current Source or
Active State creates a new Session.

Free tasks remain `unverified`, have no formal Outcome, and are ineligible for
comparison, adaptation, and promotion. Goal 1 exposes read-only Workspace previews and
separates Pi native Skill metadata from Harness Adaptation/binding metadata. It executes
no project command, Docker command, external Provider/model call, Source apply, or State
mutation. `bounded_edit` is planned capability metadata only in Goal 1; file writes and
the registered Docker command path are not enabled until a separately accepted Goal 2.
