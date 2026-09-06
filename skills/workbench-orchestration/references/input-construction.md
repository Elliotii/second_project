# Mechanical input construction

Use this reference only when Workbench inputs are absent or must be recovered. Consult the selected command's live `--help` before invocation.

## Recover before asking

Inspect the repository, cwd, Git, existing artifacts, and current configs to recover:

- project root and source identity;
- existing task configs, tests, verifier, and registered test command;
- fresh output path and build ID;
- Source Run roots and explicit task-family identity;
- frozen Plan, Mapping, Candidate build, and Skill SHA;
- planned Run IDs and their config bindings.

Ask only when a missing value changes task acceptance, experiment meaning, cost, sample size, or conclusion scope.

## Coding Task config

Construct a config from the current `CodingTaskSpec` contract and a real repository inspection. Preserve these invariants:

- `task_id` and `prompt` express the explicit task contract.
- `source_root`, verifier source, and `output_root` are project-relative paths resolved under `--project-root`.
- Supply exactly one frozen source identity: `source_revision` or `existing_tree_digest`.
- Record writable and protected path boundaries.
- Use registered, bounded command descriptors rather than shell prose.
- Bind an External Verifier by ID, source path, SHA-256, timeout, and output limit.
- When a Skill is present, use an absolute Skill path and expected lowercase SHA-256.
- Choose a bounded task timeout.

For a natural-language single task, inspect the repo, recover conventions, construct the config, and use `workbench task run`. The user need not author JSON manually.

## Missing tests or verifier

Construct deterministic acceptance evidence when all are true:

1. The requested behavior is explicit.
2. Repository test conventions are recoverable.
3. Success can be checked without subjective judgment.

Examples include a specified state transition, API result, invariant, or rejection behavior. If acceptance is ambiguous, ask the user rather than inventing semantics. For a formal evaluation, also apply the independence rules in [evaluation-contract.md](evaluation-contract.md).

## Experience inputs

Represent Experience as an ordered list of existing Coding Task config paths. Each repeated Run argument means exactly one `runCodingTask()` invocation. The CLI overrides each config's output root with the Experience `runs/` directory but preserves the task, source, Skill, and verifier identities.

Preflight all configs, source identities, Skill identities, verifier hashes, credentials, runtime, and the fresh output root before dispatch. Do not introduce an Experience Plan schema merely to hold this list.

## Skill Build inputs

Provide an explicit task family, ordered Source Run roots, build ID, runtime credential, and fresh output root. Run IDs come from manifests.

Generic induction accepts at least one evidence-valid Run and requires at least one real supporting Run per Candidate step. A task-family-specific validator may impose a stricter local contract; for example, `source-ab-v1` retains its two-Run support rule. Do not generalize that local rule.

## Fresh outputs

Prefer a new, descriptive path under the caller's existing ignored run/artifact root. If a command requires a fresh or empty output and the selected path is populated, choose a new path. Do not delete or overwrite prior evidence merely to reuse a name.
