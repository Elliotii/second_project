# Authoritative artifacts and terminal states

Treat CLI output as a locator. Read the artifacts before reporting completion or deciding what may happen next.

## One Coding Task

Read `run-manifest.json` first. Confirm Run/task/source/Skill identities, execution status, verification status, failure reason, usage, changes, and artifact references. Then read `verifier/result.json` and `report.md`; inspect `trace.json` and the Diff when behavior or process matters.

`execution_status=completed` with verifier `passed` or `failed` is a completed task outcome. `not_run`, timeout, abort, infrastructure failure, or missing/corrupt critical evidence is operational/non-evaluable.

## Experience

Read `experience-summary.json`, then each referenced Run manifest and verifier result. Confirm ordered count and identity. A completed verifier-failed Run is intentionally preserved; it is not an orchestration failure. If execution stopped operationally, the summary may be absent while earlier Run artifacts remain authoritative.

## Skill Build

Read `build/build.json` and `source-set/source-runs.json`. Confirm Source Run IDs/statuses, request count, induction decision, validation, loader preflight, and terminal status.

- `built`: read `candidate-spec.json`, `skill/SKILL.md`, and the recorded Skill SHA.
- `insufficient_evidence`: legal terminal; Candidate artifacts need not exist.
- legal `invalid`: retain the raw/parsed evidence recorded by the build; do not retry automatically.
- provider/setup/execution failure: operational error, not a Candidate result to optimize around.

## Formal Evaluation

Read the generated Thin Mapping and confirm every frozen `plan_id` maps to its actual Run ID/root/attempt. Inspect Run manifests/verifiers as needed. Then read the review `analysis-state.json` and Markdown/HTML/PDF reports.

Do not infer condition effects from CLI success. Use the controlled-unblind report and its stated evidence boundaries. `human_review_ready` means stop for human review.

## Evaluation re-analysis

Read the new `analysis-state.json` and generated reports. Re-analysis does not replace or mutate the original Plan, Mapping, or Runs. A non-empty output rejection is a freshness preflight outcome, not a failed evaluation.

## Retry distinction

Task failure, verifier failure, insufficient evidence, legal invalidity, and human-review readiness are result states. Do not retry them automatically. Missing credentials/paths, output collision, provider/runtime/IO failure, and artifact-persistence failure are operational; correct only the mechanical issue and preserve prior evidence.
