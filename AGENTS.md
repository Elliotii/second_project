# Project Instructions

## Purpose

This repository is building an Agent Harness Reliability Workbench. The current phase is Pi basis research and source audit, not full implementation.

## Required Read Order

Before doing project work, read in this order:

1. `CURRENT_STATE.md`.
2. The active goal named in `CURRENT_STATE.md` under `active_goal`.
3. The relevant sections of `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md`.
4. Any source or decision files explicitly referenced by the active goal.

When working inside `.upstream/pi`, read every applicable Pi `AGENTS.md` completely before inspecting, testing, or changing files. More deeply nested instructions take precedence for their subtree.

## Authority and Evidence

- Treat the original research package and deep-research report as context, not authority.
- Treat `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md` as the current project plan, but preserve every item marked candidate, conditional, pending, or not frozen.
- Local source, local tests, and observed command output are stronger evidence than README claims or external summaries.
- Label material conclusions as `Fact`, `Inference`, `Recommendation`, or `Unconfirmed`.
- Every Pi source claim must cite the pinned local path, symbol, and relevant test when available.

## Filesystem Boundaries

- `.upstream/pi/` is a read-only upstream checkout. Do not edit, format, install generated files into, or commit changes inside it unless a future goal explicitly authorizes an upstream experiment.
- `.runs/` contains generated run workspaces and artifacts and must remain ignored.
- Do not create the formal `workbench/` application until Pi receives a Go decision and a V0 Version Charter is accepted.
- Preserve the three root research/planning Markdown files unless a goal explicitly authorizes updating one.

## Scope Rules

- Do not add technologies because they are popular.
- Do not introduce MCP, Godot, Multi-Agent, A2A, Web UI, SQLite, Harbor integration, containers, or a general sandbox during Pi Source Audit.
- Do not turn a source-audit goal into implementation.
- Do not treat a fixed-task Spike as statistical Policy evidence.
- Do not silently decide Outcome semantics, Failure Taxonomy, Recovery Budget, Eval validity, or Policy promotion thresholds. These require user review.

## Commands and Changes

- Use `rg` and `rg --files` for search.
- Use `apply_patch` for project file edits.
- Do not modify or commit user files outside the active goal.
- Do not create Git commits unless the user explicitly asks.
- Before installing dependencies or running broad test/build commands, read the pinned Pi repository instructions and package scripts.
- Run only the narrowest tests needed to answer the active goal.

## Goal Closeout

Every execution goal must:

1. Produce the deliverables named in its Goal Contract.
2. Record exact verification commands and results.
3. List what remains unverified.
4. Identify scope changes or user decisions needed.
5. Write `docs/reports/<GOAL_ID>_CLOSEOUT.md`.
6. Update `CURRENT_STATE.md` truthfully.
7. Mark a goal complete only when every Definition of Done item is satisfied.

If blocked by an architectural fork, missing authority, credentials, destructive operation, or materially expanded scope, stop and request direction instead of choosing silently.

