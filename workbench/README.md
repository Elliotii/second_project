# Agent Harness Reliability Workbench — V0-B Evidence Foundation

This directory preserves the accepted V0-A foundation and adds the bounded V0-B Stage 1 evidence slice. V0-A proves a direct, public Pi `AgentHarness` integration with a deterministic public Faux provider, a temporary-copy Workspace, strict path wrappers, a command-ID surface, and separate Task/Strategy/Run/Attempt/Session/Workspace identities.

V0-B converts one settled Attempt into bounded, reviewable evidence:

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

## Boundaries and non-claims

Stage 1 uses only the public emitted Faux provider: external Provider/model calls are zero, credentials are not loaded, Recovery is zero, and each Run has one initial Attempt. The Session evidence mirror is intentionally not a continuation store.

The implementation does **not** prove or provide real-model effectiveness, Completion Policy improvement, child Attempts, Recovery, cross-process Resume, crash-after-side-effect reconciliation, exactly-once Tool execution, an OS sandbox, network-egress blocking, statistical Eval validity, V1 Skill competition, or V2 adaptive multi-path recovery.

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
