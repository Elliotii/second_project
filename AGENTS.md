# Project Instructions

## Purpose

This repository is building an Agent Harness Reliability Workbench. The current phase is bounded evidence, architecture control, and preparation for a possible real-model feasibility goal, not full implementation.

## Required Read Order

Before doing project work, read in this order:

1. `CURRENT_STATE.md`.
2. The active goal named in `CURRENT_STATE.md` under `active_goal`, when non-null.
3. The files listed by `CURRENT_STATE.md` under `required_reading`.
4. The relevant sections of `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md`.
5. Any source or decision files explicitly referenced by the active goal.

When working inside `.upstream/pi`, read every applicable Pi `AGENTS.md` completely before inspecting, testing, or changing files. More deeply nested instructions take precedence for their subtree.

## Authority and Evidence

- Treat the original research package and deep-research report as context, not authority.
- Treat `SECOND_PROJECT_CURRENT_PLAN第二项目当前规划.md` as the current project plan, but preserve every item marked candidate, conditional, pending, or not frozen.
- Local source, local tests, and observed command output are stronger evidence than README claims or external summaries.
- Label material conclusions as `Fact`, `Inference`, `Recommendation`, or `Unconfirmed`.
- Every Pi source claim must cite the pinned local path, symbol, and relevant test when available.

## Harness Reference Boundary

- Treat `reference/cc-harness-knowledge/` as a design reference for mature Harness problems, goals, invariants, failure modes, and applicability boundaries. It does not prove Pi behavior or authorize implementation.
- Use `reference/src/` as a read-only mature-Harness source mirror when the knowledge notes are insufficient and a concrete implementation detail, symbol, call chain, or failure path could change a project decision.
- The source mirror's product version and full provenance are not established. Do not claim that it represents the latest Claude Code behavior unless separately verified.
- Prove Pi behavior from the pinned Pi source, Pi tests, and observed project commands. Compare reference patterns against Pi; do not mechanically copy Claude Code classes, modules, or feature lists.
- An unverified mature pattern is not an observed failure, architecture blocker, Goal, or Gate. Promote a risk only when it blocks a current decision, threatens the core loop with specific evidence, cannot be safely deferred, and has a bounded stop condition.

## Filesystem Boundaries

- `.upstream/pi/` is a read-only upstream checkout. Do not edit, format, install generated files into, or commit changes inside it unless a future goal explicitly authorizes an upstream experiment.
- `.runs/` contains generated run workspaces and artifacts and must remain ignored.
- `reference/cc-harness-knowledge/` and `reference/src/` are user-provided read-only references. Do not modify, reformat, flatten, vendor, or commit them unless the user explicitly authorizes that exact operation.
- Do not create the formal `workbench/` application until Pi receives a Go decision and a V0 Version Charter is accepted.
- Preserve the three root research/planning Markdown files unless a goal explicitly authorizes updating one.

## Scope Rules

- Do not add technologies because they are popular.
- Do not introduce MCP, Godot, Multi-Agent, A2A, Web UI, SQLite, Harbor integration, containers, or a general sandbox during Pi Source Audit.
- Do not turn a source-audit goal into implementation.
- Do not treat a fixed-task Spike as statistical Policy evidence.
- Do not silently decide Outcome semantics, Failure Taxonomy, Recovery Budget, Eval validity, or Policy promotion thresholds. These require user review.

## Main and Specialist Session Governance

- Keep architecture selection, project-scope decisions, Goal acceptance, risk promotion, and updates to `CURRENT_STATE.md` in the main project-control session with the user.
- Recommend a separate specialist research session only for a concrete, bounded, context-heavy question whose answer could change an important design decision. Do not create or dispatch one without user authorization.
- A specialist research report is advisory. The main session must check its cited source paths and symbols, compare the result with pinned Pi evidence and project scope, and accept, narrow, reject, or request revision.
- Use specialist implementation sessions only after the main session has produced a reviewed Goal Contract and the user has explicitly authorized execution. The implementation session must not grant final Pi Go, freeze architecture, or expand scope.
- Every execution Goal Contract must name its execution-session owner. When it names a dedicated Goal Session, approvals given in the main session authorize handoff to that Session; they do not authorize the main session to implement or execute the Goal silently.
- The dedicated Goal Session owns the bounded implementation, commands, raw evidence, execution report, and Closeout draft. It must stop at Contract gates and return its report without making architecture acceptance decisions.
- The main session reviews the dedicated Session's report and cited evidence, discusses material choices with the user, and owns final Goal acceptance and next-phase decisions.
- Deviating from the declared Session owner requires explicit user direction and must be recorded in the Goal report, Closeout, and `CURRENT_STATE.md`.

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
