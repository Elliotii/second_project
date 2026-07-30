# Agent Harness Reliability Workbench — V0-A

This directory contains only the accepted V0-A foundation slice. It proves a direct, public Pi `AgentHarness` integration with a deterministic public Faux provider, a temporary-copy Workspace, strict path wrappers, a command-ID surface, and separate Task/Strategy/Run/Attempt/Session/Workspace identities.

The implementation does **not** define a general verifier Outcome, Recovery, child attempts, a durable Journal, real-model execution, credential loading, raw shell access, or later-version features. `settled` means the harness completed its bounded cycle; it is not a formal task `passed` result. The emitted `foundation_acceptance` record exists only for this Goal's deterministic acceptance gate and always carries `formal_outcome: null`.

Pi-specific imports are centralized under `src/pi/`. Runtime dependencies resolve to the ignored isolated Pi copy at `.runs/v0-a/pi`; no Pi Core source is modified. The formal fixture is derived from the behavior of the accepted G006 `parseDuration` task, but is newly materialized at `fixtures/tasks/v0-a-parse-duration/` and does not modify the historical G006 fixture.

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
```
