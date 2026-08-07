# V3 Goal 3 Real Execution Report

Date: 2026-08-08 (Asia/Hong_Kong)
Execution owner: fresh top-level no-source-edit Real Execution Session
Disposition: `COMPLETED_PENDING_MAIN_AND_USER_ACCEPTANCE`

## 1. Result

**Fact:** The single authorized prompt-addendum-first `deepseek-v4-flash`
Agent Run completed. The frozen external Verifier changed from a valid pre-run
`failed` result to a valid post-run `passed` result, and the existing Goal 3
Inspector returned `integrity_valid: true` with no errors.

**Fact:** Exactly one Agent Run and one opaque Credential-file read occurred.
There was no retry, fallback, replacement, second Case, adaptive-Skill real Run,
source edit, State-authority mutation, Pi mutation, staging or commit.

**Inference:** This is positive bounded mechanism evidence that the accepted
Goal 1 prompt addendum can be selected from the frozen Goal 3 State and used by
the public Direct Pi route in one real maintenance Case. It is not causal A/B
evidence and does not establish general superiority.

## 2. Frozen identities

| Identity | Observed |
|---|---|
| Implementation Baseline commit | `74e7e73a07321f191d1b266ab8dd3cb94f66cade` |
| Baseline tree | `15645b4d572bcc5f5fb8310bbf8bda8a78b1c17e` |
| emitted Pi commit | `027a5847901b5dde30270abaa1041046cd2b4b55` |
| upstream Pi commit | `027a5847901b5dde30270abaa1041046cd2b4b55` |
| Pi package version | `0.82.1` |
| project ID | `v3-g3-portfolio-project` |
| shared State inventory digest | `938a45f932f5276c1a21c94c2c004832e418db653abdc426d44dafecfddb3611` |
| active binding / State version | `3 / 1` |
| active State digest | `744ccd9ddce76f92b0b838f02253161748b9edb1e9071c8218bdf97f96ba2a7d` |
| active decision ID | `decision-9199f961c1b6efe15e36028946dead21` |
| active pointer digest | `60f3b56f8a1522dd431b8fa83055889b59cc2b8d84760283dcf776b3df0914aa` |
| Admission Registry digest | `df7169506aae343b3b44b0c035df70d8460841032b3324ab9a7118a5110bb18b` |
| Admission digest | `e84521e199b503ff18e240ff87c715aeab02f2089a0d62e83e04182ee0fc41ef` |

The baseline was tracked-clean before execution. The only pre-existing
untracked files were the Main-provided implementation and real-execution start
Prompts. The two reports from this Session are the only permitted tracked-tree
writes; they remain unstaged.

## 3. Read-only gates

### Gate A — source and public Pi surface

The following commands completed with exit 0 from the frozen baseline:

| Command | Result |
|---|---|
| `git rev-parse HEAD` | exact baseline commit |
| `git show -s --format=%T HEAD` | exact baseline tree |
| `git diff --quiet` / `git diff --cached --quiet` | `0 / 0` |
| `git rev-parse HEAD` and `git status --short --untracked-files=all` in each Pi checkout | both fixed and clean |
| `node --experimental-loader ./.runs/v3-g3/runtime/public-pi-loader.mjs ./.runs/v3-g3/runtime/public-import-smoke.mjs` | `PASS_V3_G3_PUBLIC_PI_IMPORT_SMOKE` |
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p .runs/v3-g3/runtime/tsconfig.json` | exit 0 |
| same compiler with `-p .runs/v3-g3/runtime/tsconfig.workbench.json` | exit 0 |
| `npm --prefix workbench run v3g3:test` | 8 passed, 0 failed |
| Goal 1 direct Node test command | 13 passed, 0 failed |
| Goal 2 direct Node test command | 6 passed, 0 failed |

The fresh worktree lacked the ignored loader/type-smoke bridge. It was rebuilt
under `.runs/v3-g3/runtime/`. The first standalone type-smoke invocation exited
1 because the ignored tsconfig did not yet point to the emitted Pi Node type
root; after that mechanical ignored-file correction, both type commands passed.
No Credential, network, Provider or model access occurred.

### Gate B — frozen State and admission authority

Command:

`node --experimental-loader ./.runs/v3-g3/runtime/public-pi-loader.mjs ./.runs/v3-g3-real-execution/runtime/gate-b.ts`

Final result: exit 0, `gate: B`, `result: PASS`. The existing State Inspector
validated three immutable versions and five decisions. The active State's
promotion lineage was independently reloaded against the tracked Goal 1
Candidate/State fixtures and the frozen Admission Registry.

Two earlier invocations exited 1 while the ignored driver was calibrated from
generic `treeDigest` and path-only digest forms to the accepted evidence schema
`[{path, sha256, size_bytes}]`. They did not write or mutate shared authority and
occurred before Credential access.

### Gate C — sole Case and trusted failure

Command:

`node --experimental-loader ./.runs/v3-g3/runtime/public-pi-loader.mjs ./.runs/v3-g3-real-execution/runtime/gate-c.ts`

Final result: exit 0, `gate: C`, `result: PASS`.

| Case identity | Value |
|---|---|
| case ID | `v3-g3-real-prompt-addendum-parse-duration` |
| task / kind | `v0-b-parse-duration` / `typescript-maintenance` |
| task prompt SHA-256 | `22b166bda844a1a4de90d54b4fa399896ce6e418b3fd5abc094a39409bdb0f35` |
| source Manifest file SHA-256 | `3569dd7f88a6e5ff1b15882bade1b4b5e5cc746be2522a589fd792e62fa20636` |
| source Manifest canonical digest | `cbde893c2ca7d792f58ba348691e8d69959b7476a4ea62811b1b013fb0583de3` |
| runtime TaskSpec projection digest | `adeb9b3ade0302d742e37db1776133fc6ce531caf6eea67e5a26e98ed0e5c9b5` |
| source and copied Workspace digest | `83e14ee6480099d479faa392fb9dc5eb1db6e5e860b93702289ef20ca2cc3e0c` |
| Verifier source SHA-256 | `9f77987e7812f4f47d1c7b44c17428247832b5b367c2d453b6ebc055a15d1b7a` |

The one pre-run Verifier invocation returned exit 1, status `failed`, summary
`Missing expected exception: 1msx`, and raw-output SHA-256
`e76a4ff8c48e21a0f3fa6794d68640b37b581a020c2e2ac5f89cf90909a4f34c`.
It became trusted failure source
`prerun-e76a4ff8c48e21a0f3fa6794d68640b3`, lineage digest
`6f05e4cddac34143a9ac349d6317fae9fc373e9885adbecd0797aa1f7df354f3`.

Case Authority digest:
`c8030687ab9f6d8788a99905e51fc42256cdcbdd80cfae6e3ae0e83812d4a03a`.
Binding digest:
`b14d44a0b770c37b6b3c4b145d76ba20585d4901f46311c597bbffd9831d58ed`.
The binding contains exactly one `prompt_addendum` entry
`completion-guidance`, no adaptive Skill, and the expected admission lineage.

Before the single Verifier invocation, two mechanical driver invocations stopped:
one at the documented `task.json` digest-exclusion rule and one because the
ignored preflight evidence root had not yet been created. Neither invoked the
Verifier, read a Credential, or started an Agent Run.

## 4. Credential boundary and real Run

Command:

`node --experimental-loader ./.runs/v3-g3/runtime/public-pi-loader.mjs ./.runs/v3-g3-real-execution/runtime/execute-once.ts`

Result: exit 0. The process rejected inherited Credential authority, verified
the authorized source as an ordinary single-link file, read exactly one
non-empty `DEEPSEEK_API_KEY` assignment once, never emitted or persisted its
value, and used the fixed DeepSeek profile. `node --check` and a final baseline
identity check both passed before this command.

| Runtime measure | Actual | Frozen maximum |
|---|---:|---:|
| Agent Runs | 1 | 1 |
| Credential-file reads | 1 | 1 |
| dispatch attempts | 1 | 1 |
| Provider requests / dispatches | 6 / 6 | 16 |
| network / external Provider / real-model calls | 6 / 6 / 6 | request-aligned |
| input tokens | 10,787 | — |
| output tokens | 1,504 | — |
| total tokens | 12,291 | 131,072 |
| Tool calls | 7 | 24 |
| cost | USD 0.0007371112 | USD 0.20 |
| settled events | 1 | exactly 1 |

Runtime path was `prompt_addendum`; Provider/model were
`deepseek/deepseek-v4-flash`; retry and fallback remained false. Session ID:
`019fddd4-6b4b-7abc-86ad-cd48c3971a72`. Runtime digest:
`99bb824f0bc2db438856aededae8c0d54039a3597171eb44ed829ce3ee2b1685`.
Manifest digest:
`347a44bfe905baa15fa2542196a2763f263833523a65cb4e0cd3672119891975`.

## 5. Outcome, workspace and Inspector

The post-run external Verifier returned exit 0, `passed`, summary
`hidden parse-duration acceptance passed`; raw-output SHA-256 is
`34cecd1be329d673034a066bd29dbf68115c6455cb552d0d8f808920beb2247e`.

Only `src/parse-duration.ts` changed in the isolated Workspace:

- initial SHA-256: `fc0771785d0a8bf601f205584c5b85fdf4769e13bba3229fef86d7622fedbb03`;
- final SHA-256: `c22341361efd8807082d64fb96c3e751d45953354032b8ab8215a0c05c5f8ad6`.

`package.json`, `task.json`, `task.md`, and `test/public.test.ts` retained their
initial hashes. The independent post-run Inspector returned
`integrity_valid: true`, `errors: []`, `pointer_drift_observed: false`.

## 6. Evidence locations

Operational root:
`.runs/v3-g3-real-execution/`

Important content identities:

| Artifact | SHA-256 |
|---|---|
| `gate-c.json` | `af1ed6661ce4e0e29e07e0a6b63aa6482787d218ce29b70f39678f76472e7cba` |
| `runtime-task-projection.json` | `62fbae498de0519f5d042132237a1a1baa5a77dcdd487a368fc0bfe778860ae2` |
| `preflight/verifier/result.json` | `452515225475ad5a362d0825cde1c3ff31d6ff11e7e7dfd980a56fdbf13e54bc` |
| Case Authority JSON | `71df145b0d75988318df05141affe3aa8d1f36a96c5f01f5661e8401da9f66dd` |
| Run `binding.json` | `c740a939b0b2411976493c48b994ea8239af5e2f1ed7faa39d2f0cc51c4ec533` |
| Run `runtime.json` | `ab642809ae5098a6527c26797de2bac8fd6e7da0fb4918a3e9d6913fdc2d9d4b` |
| Run `manifest.json` | `75df12e1a6b7e9d906b57f0e70736a272ec1f15f6311f234bd95a5340af5f57a` |
| Run `verifier/result.json` | `fde8a12cd51edf2e26e3914c20a7e51315c7b27a895a8e975d804dbad8e22d65` |
| `execution-summary.json` | `addaaa9643f4b4b897e528ab6bde49884e2f3f1ed339097530fd48624b2b86da` |
| `post-run-inspection.json` | `00c80b3cebd295ccc53fe9eba92464819a75b7951288c6b5796db742f8a78e53` |

## 7. Before/after authority checks

**Fact:** The root commit/tree stayed at the frozen baseline. Shared State
inventory recomputed after the Run to the same
`938a45f932f5276c1a21c94c2c004832e418db653abdc426d44dafecfddb3611`.
Both Pi checkouts remained clean at `027a5847901b5dde30270abaa1041046cd2b4b55`.
`git diff --check` returned 0. No control state was edited.

## 8. Limitations and claim boundary

**Fact:** This is one Case, one Agent Run and one prompt-addendum treatment. It
has no unbound or adaptive-Skill real comparator.

**Unconfirmed:** The run does not prove that the addendum caused the repair,
that it improves other tasks, or that adaptive Skill reuse works behaviorally
with a real model.

**Recommendation:** Main should review these artifacts as the bounded real
behavioral closure authorized for Goal 3, while keeping any final Goal 3/V3
acceptance and disposition wording as an explicit Main/user decision. Do not
start V4 from this report alone.

## CURRENT_STATE_UPDATE_PROPOSAL

```yaml
proposal_only: true
main_review_required: true
goal: V3_G3_SELECTIVE_REUSE_AND_PORTFOLIO_CLOSURE
execution_disposition: COMPLETED_PENDING_MAIN_AND_USER_ACCEPTANCE
implementation_baseline_commit: 74e7e73a07321f191d1b266ab8dd3cb94f66cade
implementation_baseline_tree: 15645b4d572bcc5f5fb8310bbf8bda8a78b1c17e
real_execution:
  cases: 1
  agent_runs: 1
  path: prompt_addendum
  model: deepseek-v4-flash
  pre_run_verifier: failed_valid
  post_run_verifier: passed_valid
  inspector_integrity_valid: true
  manifest_digest: 347a44bfe905baa15fa2542196a2763f263833523a65cb4e0cd3672119891975
authority:
  credential_reads: 1
  provider_requests: 6
  tool_calls: 7
  total_tokens: 12291
  cost_usd: 0.0007371112
claims_allowed:
  - one bounded real prompt-addendum-first mechanism execution completed and passed
  - frozen State/admission/binding and public Direct Pi route were Inspector-valid
claims_forbidden:
  - causal improvement
  - general superiority
  - adaptive-Skill real behavioral validation
  - automatic final V3 acceptance
  - V4 authorization
next_decision_owner: Main_and_user
```
