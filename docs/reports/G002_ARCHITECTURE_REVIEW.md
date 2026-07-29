# G002 Architecture Review

```yaml
reviewed_goal: G002_PI_DIRECT_HARNESS_GO_GATE
review_date: 2026-07-29
reviewer: architecture_control_session
source_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
review_disposition: ACCEPT_G002_BLOCKED_CLOSEOUT
setup_recovery_decision: AUTHORIZE_ARTIFACT_BACKED_MODEL_DATA_RESTORE
live_model_data_generation_authorized: false
emitted_package_build_boundary_change_authorized: false
direct_go_gate: unexecuted
final_pi_go: not_authorized
architecture_frozen: false
```

## Review Decision

**Recommendation.** Accept G002's `BLOCKED_G002_SETUP` closeout. The session
obeyed its contract by stopping when the first authorized targeted build
required an unreviewed model-data command and network boundary. No Direct
runtime Gate ran, so this acceptance is neither `PASS_DIRECT_GO_GATE` nor
`FAIL_DIRECT_GO_GATE`.

**Decision.** Authorize a later bounded goal to restore model data from the
immutable npm release artifact for `@earendil-works/pi-ai@0.82.1`, verify the
artifact and restored data, and retry the existing standard emitted-package
build. Do not call Pi's live `hydrate:model-data` generator and do not revise
the emitted-package build boundary at this checkpoint.

This is a source-controlled restore, not a claim that Pi's online model
catalog inputs are historically reproducible. For this decision, the npm
tarball is the pinned input artifact.

## Independently Rechecked Facts

- **Fact.** `packages/ai/package.json` defines `build:offline` as
  `check:model-data`, TypeScript emission, then copying
  `src/providers/data` into `dist/providers/data`.
- **Fact.** `packages/ai/src/providers/data/` is ignored and absent from both
  the pinned reference checkout and the isolated G002 clone.
- **Fact.** `scripts/generate-models.ts --strict --data-only` reads live,
  mutable responses from `models.dev`, NVIDIA NIM, OpenRouter and Vercel AI
  Gateway.
- **Fact.** `scripts/model-data.ts` records a generation timestamp, a generated
  structure hash and output-file hashes. It does not record the four raw input
  responses, their hashes, validators, or immutable source revisions.
- **Fact.** The public root `packages/ai/src/index.ts` is intentionally
  side-effect free and does not import the built-in generated catalog, while
  the package's standard `tsconfig.build.json` compiles all `src/**/*.ts` and
  therefore includes catalog shards that import the ignored JSON data.
- **Fact.** The npm registry metadata for `@earendil-works/pi-ai@0.82.1`
  reports:
  - `dist.integrity`:
    `sha512-3WFYRhEp3lQB3444EhPMBcM7zSaEUE3eJgHOR7s4081NLqbw/FsWilIKWXSua0Gv3sRr7m9xMidR3pPDE7jI/A==`;
  - `dist.shasum`: `02ebdfc2997fd88ca1f51a7b5c01f337a9462f34`;
  - `gitHead`: `b4f293684bba718d59cc1157679bcf6157b3a7f5`;
  - publication time: `2026-07-25T12:46:52.948Z`.
- **Fact.** The published artifact lists 38 files under
  `dist/providers/data/`: one `.manifest.json` and 37 provider JSON files.
- **Fact.** The published `gitHead` is tag `v0.82.1`; the pinned Pi commit is 40
  commits later. Across that range, the tracked generated aggregator,
  provider `*.models.ts` shards, model-data validator, provider aggregator and
  package build definition are unchanged. The generator implementation itself
  changed.
- **Fact.** `@earendil-works/pi-agent-core` consumes the side-effect-free
  `@earendil-works/pi-ai` root, and its build maps that dependency to
  `packages/ai/dist/index.d.ts`.

## Accepted Interpretation

- **Inference.** Direct live hydration is not source-controlled enough for a
  deterministic feasibility Gate. An output manifest can detect local
  corruption but cannot reconstruct or authenticate the mutable upstream
  responses that produced it.
- **Inference.** Changing to a test-only partial Pi AI build would remove the
  immediate data dependency, but it would also validate a project-defined
  build boundary rather than Pi's declared standard package build. That would
  weaken Gate A and introduce a second variable while the standard boundary
  has a viable recovery path.
- **Inference.** The integrity-pinned npm artifact provides a reproducible byte
  source for the missing data. Its older release commit is acceptable only if
  the pinned source validator accepts the restored files and the relevant
  tracked catalog/schema boundary remains unchanged.
- **Recommendation.** Preserve the standard `pi-ai build:offline` and
  `pi-agent-core build` commands. Treat validation failure as a new setup
  result, never as permission to regenerate from live endpoints or patch Pi.

## Bounded Authorization for the Next Goal

A later, separately contracted retry may:

1. operate only in a new disposable run root under `.runs/` or in the existing
   isolated G002 clone if the contract explicitly proves and accepts its
   current state;
2. download exactly `@earendil-works/pi-ai@0.82.1` from the npm registry;
3. verify the downloaded tarball against both the recorded SHA-512 integrity
   and SHA-1 shasum before extraction;
4. inventory the tar entries and extract only
   `package/dist/providers/data/**` into a staging directory;
5. copy only that staged directory to the isolated clone's
   `packages/ai/src/providers/data/`;
6. record every restored file's SHA-256 and the embedded model-data manifest;
7. run the pinned source's `check:model-data` before either authorized package
   build;
8. on a clean validation pass, run the same standard package builds and then
   the unchanged G002 Gates A-E;
9. keep the tarball, restored data, dependencies and build outputs ignored
   under `.runs/` and keep `.upstream/pi` immutable.

The retry may not:

- run `hydrate:model-data` or `generate-models`;
- contact `models.dev`, NVIDIA NIM, OpenRouter or Vercel AI Gateway for catalog
  generation;
- edit Pi source, build scripts, `tsconfig`, package metadata or exports;
- use a partial/custom emitted package as Gate A evidence;
- use WSL, a real model, SDK/RPC fallback, containers or the formal Workbench;
- convert the restored catalog's age or contents into Policy evidence.

## Required Pause Conditions

Pause and return to architecture control if:

- npm metadata or tarball integrity differs from the values above;
- the tarball contains unsafe or unexpected paths;
- the 38-file inventory is not present;
- pinned-source catalog/schema files differ from the release boundary relied
  on by this review;
- `check:model-data` rejects the restored artifact;
- either standard targeted build still requires another package, generator,
  source patch or broader build;
- any original G002 Gate requires private imports, credentials, real provider
  state or a widened execution boundary.

## Not Decided

- Whether Direct AgentHarness passes any Gate A-E;
- final Pi Go/No-Go or V0 architecture;
- whether online model-data generation should later gain raw-input capture;
- Completion Verification semantics, Outcome taxonomy, recovery budgets or
  promotion thresholds;
- real-model, SDK compatibility, cancellation or crash-recovery behavior.

## Verification Commands

Material read-only checks included:

```powershell
npm.cmd view @earendil-works/pi-ai@0.82.1 dist.integrity dist.shasum dist.tarball gitHead time --json
npm.cmd pack --dry-run --json @earendil-works/pi-ai@0.82.1
git -c safe.directory=D:/AI/AI_Projects/project2/.runs/g002/pi -C .runs/g002/pi rev-list --count b4f293684bba718d59cc1157679bcf6157b3a7f5..027a5847901b5dde30270abaa1041046cd2b4b55
git -c safe.directory=D:/AI/AI_Projects/project2/.runs/g002/pi -C .runs/g002/pi diff --name-status b4f293684bba718d59cc1157679bcf6157b3a7f5..027a5847901b5dde30270abaa1041046cd2b4b55 -- packages/ai/scripts/generate-models.ts packages/ai/scripts/model-data.ts packages/ai/src/models.generated.ts packages/ai/src/providers/*.models.ts packages/ai/src/providers/all.ts packages/ai/package.json
```

The review also read the G002 contract, report and closeout; current project
state and relevant plan sections; Pi instructions; the complete model-data
validator and generator; package build definitions; public root exports;
generated catalog imports; and the Direct dependency's package/build mapping.
