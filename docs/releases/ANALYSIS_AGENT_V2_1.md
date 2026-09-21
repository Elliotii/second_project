# Analysis Agent v2.1 Release

## Release identity

```yaml
release: Analysis Agent v2.1
product_commit: 09681da3e80728f91adfd54c8bc5c2c2abf75345
product_tree: 11343aa5172aab4be6bda96b43d0118a02ab6c47
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_core_patches: 0
node: ">=22.19.0"
```

`09681da` is the accepted implementation boundary for the agent-facing canonical CLI and orchestration Skill. Release-preparation changes after that commit may improve documentation, dependency bootstrap, portability and security guidance; they do not change the frozen evaluation result or add a new product capability.

## Included

- Coding Task execution with isolated Workspace and External Verifier.
- Ordered Experience collection with fail-closed operational stops.
- Explicit Source Run selection and evidence-grounded Candidate Skill construction.
- Frozen formal evaluation execution and artifact-only review re-entry.
- Blind process analysis, sealed Findings, controlled unblind and human-review boundary.
- Five-command canonical CLI.
- Agent-facing Workbench orchestration Skill.
- Historical contracts, closeouts, tests and safe deterministic fixtures already tracked at the product commit.

## Excluded

- The later `codex/swebench-external-eval` experiment and all of its commits/files.
- Raw `.runs/` evidence, local Pi checkouts, credentials and machine-local configuration.
- Seven local Phase 5/postmortem working reports that remain untracked.
- The local long-form interview dossier, which contains machine-local artifact paths and remains untracked; this release note is the public-safe summary.

## Frozen evaluation result

The formal fixture contains 18 evaluable Runs across three Cases, two conditions and three trials per condition:

| Result | Count |
|---|---:|
| PASS | 17 |
| TASK_FAILURE | 1 |
| INFRA_FAILURE | 0 |
| INVALID_TRIAL | 0 |
| no_skill PASS | 8/9 |
| with_skill PASS | 9/9 |

The result is descriptive, not causal. Final review concluded that neither Finding justified a Skill change: benefit remained unproven and causation unsupported.

## Reproduction boundary

The repository tracks Workbench source but intentionally does not vendor Pi or generated execution evidence. From `workbench/`:

```powershell
npm run setup
$env:PI_RUNTIME_ROOT = (Resolve-Path ../.runs/v0-a/pi).Path
npm run setup:check
npm run workbench -- --help
```

The setup command fetches the exact Pi source commit, installs a minimal lockfile-bound runtime dependency set with lifecycle scripts disabled, verifies and expands the corresponding immutable npm `0.82.1` Pi AI/Agent release artifacts, and installs local Workbench dependencies with `npm ci`. This requires network access to GitHub and npm. Real model commands are separate, require an explicit credential and may incur cost.

## Release verification

Before the release branch is merged:

1. Confirm the release branch descends from `09681da` and does not contain the first SWE experiment commit.
2. Run whitespace and tracked-secret checks.
3. Run bootstrap checks, strict TypeScript and the focused CLI/trace-analysis regression set.
4. Clone the release commit into a new directory, run setup, and repeat the portable CLI checks.
5. Confirm `.runs/`, `.env*`, the local dossier and Phase 5 working reports remain untracked.

## Known limitations

- Setup binds the upstream Git commit and the integrity-pinned Pi `0.82.1` artifacts. Workbench transitive dependency resolution is recorded in its lockfile.
- Real-provider behavior remains tied to the explicitly configured DeepSeek route.
- The repository retains extensive historical governance material, including accepted limitations and failed attempts, for provenance.
- No project license has been selected yet. No reuse grant should be inferred until a LICENSE file is added.
