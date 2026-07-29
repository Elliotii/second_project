# Workspace Layout

## Tracked Project Material

```text
README.md
AGENTS.md
CURRENT_STATE.md
SECOND_PROJECT_*.md
deep-research-report*.md
docs/
spikes/
fixtures/
```

These files contain project-owned research, decisions, goals, reports, task fixtures, and later implementation code.

## Ignored Upstream Material

```text
.upstream/pi/
```

Pi is cloned locally for source audit. Its exact remote, commit, tag, package versions, runtime requirements, and license are recorded in `docs/research/pi/upstream-snapshot.md`.

The checkout is read-only for current goals. Project conclusions should cite it, but project code must not be placed inside it.

## Ignored Generated Material

```text
.runs/<run-id>/
├─ workspace/
├─ manifest.json
├─ events.jsonl
├─ session-link.json
├─ outcome.json
└─ report.md
```

Generated runs are evidence during execution but are not source-controlled by default. Approved minimal regression fixtures or sanitized reports may later be promoted into tracked directories through an explicit goal.

## Future Formal Application

The `workbench/` directory must not be created before:

1. Pi Source Audit is accepted;
2. a deterministic integration Spike passes;
3. a real-model feasibility run is reviewed;
4. the V0 Version Charter is accepted.

