---
name: workbench-orchestration
description: Route and govern Coding Agent Workbench workflows through the canonical `workbench` CLI. Use when Codex must run one coding task, collect ordered Agent experience, build a Candidate Skill from existing Runs, execute a frozen formal Skill evaluation, re-analyze an existing evaluation, construct missing mechanical inputs for those workflows, or interpret their authoritative artifacts without result hunting.
---

# Workbench Orchestration

Use the Workbench as an execution and evidence system, not as an autonomous optimization loop.

## Respect the authority model

- Treat `workbench <group> <command> --help` and current source as syntax authority.
- Treat the canonical CLI as execution authority.
- Treat persisted artifacts, not terminal prose alone, as result authority.
- Use this Skill for intent routing, input recovery, user alignment, execution discipline, and artifact interpretation. Do not reproduce the CLI as a second interface.
- Follow explicit user instructions over Skill defaults unless they violate an already-frozen formal evaluation contract that the user has not explicitly chosen to replace.

## Route the intent

- Run one Coding Task: `workbench task run`.
- Collect a caller-defined ordered set of Agent Runs: `workbench experience run`.
- Derive one Candidate Skill from explicitly selected evidence-valid Runs: `workbench skill build`.
- Execute an already-frozen Candidate evaluation: `workbench evaluation run`.
- Re-analyze existing Evaluation Plan, Mapping, and Run artifacts without new Coding Runs: `workbench evaluation review`.

Do not translate a vague request such as “look at this Skill” directly into a formal evaluation. Determine whether the user wants inspection, one-task screening, experience collection, Candidate construction, formal evaluation, or re-analysis.

## Infer plumbing; align semantics

Recover mechanical facts before asking questions. Inspect cwd, Git identity, repository conventions, existing configs, Runs, Plans, Mappings, artifacts, and CLI help. Recover paths, IDs, hashes, fresh output locations, test commands, and explicit task-family identity when they are mechanically determined.

Ask only about unresolved choices that materially change experiment meaning, cost, sample size, or conclusion scope. Depending on the workflow, these may include the goal, tasks, repetitions, conditions, model/runtime, verifier policy, Source versus held-out roles, Source Run selection policy, run budget, retry policy, stop condition, and desired output. Do not ask again when the user or a frozen artifact has already answered.

Read [references/input-construction.md](references/input-construction.md) when a config, verifier, output root, or other mechanical input must be recovered or created. Read [references/evaluation-contract.md](references/evaluation-contract.md) before designing or executing multi-Run evidence collection, Source selection, or formal evaluation.

## Freeze before dispatch

Before a multi-Run Experience or Formal Evaluation starts:

1. Materialize and inspect all required configs and bindings.
2. Align unresolved material variables with the user.
3. State the ordered Runs, conditions, repetitions, budget, retry rule, and stop condition that apply.
4. Freeze the execution/evaluation contract.
5. Run the canonical command only after the user has authorized the resulting cost and scope.

After dispatch, do not add trials, replace tasks, swap conditions or Candidates, alter the verifier, change Source/held-out roles, or revise the Source selection policy because of observed results. Treat an authorized change as a new contract.

## Preserve evidence discipline

- For Experience, execute the predefined Run instances in order. Never run until enough passes, retry failed tasks automatically, replace failed Runs, or select best-of results.
- If Source Runs were not named, propose and freeze a result-independent selection policy before inspecting outcomes for selection. Never cherry-pick after results are known.
- Treat `completed + verifier passed` and `completed + verifier failed` as evidence-valid for Skill learning. Reject operational, `not_run`, corrupt, or outcome-indeterminate Runs.
- Interpret Run outcome as trajectory context, not a blanket label. A failed Run may contain reusable successful local behavior; a passed Run may contain failed, reverted, unnecessary, or contradicted behavior that must not become a recommendation.
- Do not automatically build, evaluate, rewrite, and re-evaluate until a result improves. Enable reliable orchestration, not autonomous optimization.

## Handle tests and verifiers

For an ordinary task, construct missing deterministic tests or a verifier only when the acceptance contract is explicit and repository conventions are recoverable. Align with the user when success is subjective or would require inventing evaluation semantics.

For formal evaluation, preserve External Verifier independence. If constructing tests or a verifier would reveal the answer to the evaluated Agent or otherwise contaminate the comparison, ask the user or explicitly downgrade the activity to screening/non-independent validation.

## Invoke and inspect

Immediately before invocation, consult the selected leaf command's `--help`; do not rely on copied parameter lists. Prefer `--json` when a machine-readable result is needed, while keeping diagnostics on stderr.

After the CLI returns, read the authoritative artifacts listed in [references/artifact-contracts.md](references/artifact-contracts.md). Verify identity, terminal status, outcome, and required paths before summarizing or continuing.

## Stop correctly

- Verifier `failed` after completed execution is a real task outcome and, where applicable, learning evidence. Do not retry automatically.
- `insufficient_evidence` and legal `invalid` are valid Skill Build terminals. Do not change the Prompt, swap Source Runs, add Runs, or retry to obtain `built`.
- `human_review_ready` is a human-in-the-loop boundary. Stop and present the reports; recommendations are not automatic modifications.
- A non-empty fresh-output target, missing path, credential problem, or other preflight/setup failure is operational. Correct it mechanically when authorized; this is not result hunting.
- A provider, runtime, IO, or artifact-persistence failure is operational. Preserve completed artifacts and stop unless the user authorizes a new execution contract.

Interpret `HUMAN_REVIEW_FOR_NARROW_CHANGE` and `HUMAN_REVIEW_FOR_REVISION` direction-neutrally: a later human decision may add, remove, shorten, relax, replace, or rewrite content. Do not invent a patch taxonomy or modify a Candidate automatically.
