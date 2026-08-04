# V1-B Stage 1 Preparation Implementation Report

> Updated: 2026-08-05 (Asia/Hong_Kong)
> Session role: original dedicated V1-B Stage 1 Preparation Session
> Main disposition entering this correction: `ACCEPT_AUDIT_FINDINGS_AND_REVISE_CANDIDATE`
> Suggested correction disposition: `CORRECTION_COMPLETE_PENDING_MAIN_CANDIDATE_REVIEW_AND_REAUDIT`
> Credential reads / network calls / external Provider calls / real-model calls: `0 / 0 / 0 / 0`

## 1. Result

**Fact.** Gate A passed at rejected Candidate commit
`951e9161300eacd408e232aa6d1fa66ac02d0e10`, tree
`a9ad6eee8ae4cfe32ee3e9e04613a8d16e5296f6`, with an empty project Git index.
The pinned Pi checkout remained exact and clean at
`027a5847901b5dde30270abaa1041046cd2b4b55`.

**Fact.** The two Main-accepted P1 findings, `V1B-AUD-F-001` and
`V1B-AUD-F-002`, now have bounded source corrections and deterministic
counterexample regressions. After Main re-review, one test-only micro-correction
added the exact tracked-CLI missing-credential case. The current dedicated
focused suite passes 19/19. The earlier post-audit fresh Windows checkout passed
its then-current 18/18 suite; production source did not change in the micro-
correction, and the Prompt did not authorize or require regenerating it.

**Fact.** A new authoritative zero-call simulation terminalized all 24 planned
cells exactly once. Independent Inspector replay accepted 24/24 Runs. The Run
observations were 55 Faux Provider requests, 26 Tool calls, 74,588 Faux tokens,
2,080 ms accumulated active execution time and USD 0. Credential, network,
external Provider and real-model counters remained zero.

**Inference.** The bounded correction is ready for Main Session review and a
new corrected Candidate decision. This Session does not accept Stage 1, create
a Candidate or Execution Baseline commit, start re-audit, or authorize Stage 2.
The first Candidate remains rejected.

## 2. Frozen and corrected identities

```yaml
rejected_candidate_commit: 951e9161300eacd408e232aa6d1fa66ac02d0e10
rejected_candidate_tree: a9ad6eee8ae4cfe32ee3e9e04613a8d16e5296f6
control_baseline_commit: de75ca7a4d5376713f01ca475bc5ad7637c70443
control_baseline_tree: e930e1d0885b52bf911ed78912786723f321f06e
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
corrected_stage1_manifest_id: be258f6f62276436fef65a44459d70611749043b9dc2d25ec134a0e7abc1055d
corrected_workbench_source_digest: ef30c4be9bc4143569f30aabbb66b2a01db9b2098082f35dba2137f3acb22ffe
corrected_manifest_sha256: 5bae711bc4bb628b9c95486170e774ac4acbaa70f72010dac09e973303775b48
authoritative_pilot_root: .runs/v1-b/stage1/gate-h-pilot-authoritative-after-post-audit-correction
authoritative_file_count: 353
authoritative_byte_count: 735697
authoritative_ledger_sha256: a79d7659f7e77be0886975dd1fe7014a88b329d08c93dcfec116595d37abfd61
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

The rejected Candidate's prior authoritative root
`.runs/v1-b/stage1/gate-h-pilot-authoritative-after-main-review-correction`
was preserved and is now superseded only as Stage 1 evidence because source and
terminal-evidence semantics changed. No cell was retried or replaced.

## 3. Finding closure matrix

| Finding | Corrected boundary | Counterexample proof | Positive proof |
| --- | --- | --- | --- |
| `V1B-AUD-F-001` | producer and Inspector each perform deterministic contained recursion over every regular final-Workspace file byte; link, junction, escape, hardlink and unsupported entries fail closed; terminal evidence binds one typed Workspace-tree ref | producer marker injection pauses before `terminal.json`; coherent marker insertion plus digest/tree-ref rebind is Inspector-invalid; junction escape is rejected | all 24 authoritative clean Workspaces terminalize and independently inspect valid |
| `V1B-AUD-F-002` | tracked `run-next` accepts only explicit `--stage2-real-authority` with a valid `stage2_real` Manifest; it constructs the existing public-Pi one-Run authority and validates it before `started`; resolver is lazy and fixed to `DEEPSEEK_API_KEY` | real Manifest without switch and Stage 1 Manifest with switch fail before Pilot initialization; denied/missing resolver reaches the concrete authority and fails sanitized; exact CLI with the key explicitly absent stops first cell as `started→paused`, with no terminal/dispatch/advance | concrete one-Run composition opens/closes without resolving, rejects a second open, and the full Stage 1 CLI remains zero-call |

### 3.1 Final Workspace byte safety

- `scanFinalWorkspaceTreeV1B()` performs ordinal traversal from the exact
  `workspace` root, checks `lstat`/`realpath` containment, rejects path links,
  hardlinks and unsupported entries, scans every regular-file byte with the
  accepted protected-marker rule, and recomputes a stable tree identity.
- Producer execution performs this scan before RunResult/terminal evidence can
  commit. Rejection becomes a typed paused ledger transition and cannot claim
  `secret_scan.passed`.
- `terminal-evidence.json` and `terminal.json` bind the same typed tree ref:
  path, SHA-256, file count, byte count and zero-match scan result.
- Inspector independently traverses and scans the actual Workspace bytes and
  compares both stored tree refs. It does not trust either a rebound digest or
  the producer's scan claim.

### 3.2 Tracked real `run-next` composition

- `run-next --stage2-real-authority --manifest <stage2-real-manifest>` is the
  sole tracked real entry. A Manifest or switch alone is insufficient.
- `runNextV1B()` validates mode and explicit authority before a new Pilot is
  initialized. `runNextPilotCellV1B()` creates and checks exactly one
  `OneRunProviderAuthorityV1B` for the unique next cell before `started`.
- The CLI's resolver closure references only the fixed identity
  `DEEPSEEK_API_KEY`. It reads no value while parsing, validating a Manifest,
  initializing a Pilot, constructing authority, or opening/closing the tested
  zero-dispatch composition.
- Denied/missing authority and resolver failures expose only
  `FixedProviderBoundaryErrorV1B`; credential or injected error values are not
  serialized or included in evidence/errors. No fallback, retry or replacement
  path was added.
- The Main re-review micro-regression spawns the exact tracked CLI with
  `env: {}`, so it neither reads nor copies any parent credential value. With a
  valid real Manifest and the explicit switch, missing `DEEPSEEK_API_KEY`
  produces 24 planned, exactly one first-cell `started→paused`, no terminal or
  invalid state, one Run directory, and a journal ending at `attempt_started`.
  Stdout is empty and stderr/evidence contain no credential-shaped value.

## 4. Source delta and inventory

All implementation changes remain inside Goal Contract Section 6.2.

| Path | Role |
| --- | --- |
| `workbench/src/run-v1.ts` | final Workspace traversal/scan, typed rejection and producer tree ref |
| `workbench/src/inspect-v1.ts` | independent Workspace byte traversal and tree-ref validation |
| `workbench/src/contracts/v1-types.ts` | bounded typed `WorkspaceTreeRefV1B` |
| `workbench/src/provider/fixed-provider-v1.ts` | non-consuming one-Run authority availability check |
| `workbench/src/pilot-v1.ts` | concrete authority check before `started` |
| `workbench/src/product-surface-v1.ts` | explicit Stage 2 authority input and tracked composition |
| `workbench/src/cli.ts` | `--stage2-real-authority` and lazy fixed-identity resolver |
| `workbench/tests/v1b-stage1.test.ts` | Workspace and concrete composition regressions |
| `workbench/tests/v1b-cli.test.ts` | exact tracked-CLI mode/authority and explicitly absent credential regression |
| `workbench/README.md` | bounded CLI and Workspace evidence semantics |
| `fixtures/manifests/v1/v1b-stage1-execution.json` | corrected Stage 1 source/Manifest binding |
| `docs/reports/V1_B_STAGE1_IMPLEMENTATION_REPORT.md`, `V1_B_STAGE1_CLOSEOUT_DRAFT.md` | correction report and proposal |

Exact SHA-256/size inventory is recorded in
`.runs/v1-b/stage1/evidence-index.json`. No task, Skill, System Prompt, Tool,
Verifier, accepted V1-A/V0 source, Pi, reference, control state, Contract,
Charter or plan file changed.

## 5. Verification commands and results

| Command | Working directory | Result |
| --- | --- | --- |
| `node --test tests/v1b-cli.test.ts` | `workbench` | exit 0; 3/3 passed, including exact missing-credential CLI case |
| `node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | `workbench` | exit 0 |
| `node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts` | `workbench` | exit 0; 19/19 passed |
| `node --test --test-concurrency=1 tests/v1a-deterministic.test.ts tests/v0c-stage1.test.ts tests/v0c-post-audit-correction.test.ts tests/v0c-main-review-correction.test.ts` | `workbench` | exit 0; 42/42 passed |
| `simulatePilotV1B(...)` + `aggregatePilotV1B(...)` | project root | exit 0; 24 planned/started/terminal/comparable, 0 invalid/paused/excluded |
| loop `inspectV1RunCell(...)` over all 24 Runs | project root | exit 0; 24 valid, 0 invalid |
| fresh Windows source identity | ignored diagnostic checkout | 20/20 exact SHA-256, 0 mismatch |
| prior post-audit fresh strict TypeScript + V1-B focused tests | fresh `workbench` | exit 0; then-current 18/18 passed; production source unchanged by micro-correction |

Fresh Windows validation used `core.autocrlf=true` and the complete 17-path
Workbench source-digest domain plus both V1-B test files and the tracked Stage 1
Manifest. A pre-existing local dependency tree was exposed through a diagnostic
junction only; nothing was installed or downloaded.

## 6. Authoritative zero-call result

```yaml
planned: 24
started: 24
terminal: 24
invalid: 0
paused: 0
comparable: 24
passed_fixture_outcomes: 13
failed_fixture_outcomes: 11
recovery_eligible: 5
recovery_started: 5
recovery_succeeded: 3
faux_provider_requests: 55
tool_calls: 26
observational_faux_tokens: 74588
active_execution_time_ms: 2080
cost_usd: 0
inspector_valid: 24
inspector_invalid: 0
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

These deterministic fixture outcomes establish mechanism integrity only. They
do not estimate real Skill/recovery effect or select a winning arm.

## 7. Incidents

1. The first fresh-Windows `checkout-index` invocation targeted a directory
   that did not yet exist. It emitted no checkout files. The directory was
   created and the same bounded materialization succeeded.
2. The ignored diagnostic repository used a temporary local index solely to
   apply `core.autocrlf=true`; its `.git` metadata was removed after the fresh
   checkout was materialized. The project Git index stayed empty throughout.

Neither incident read a credential, accessed a network, dispatched a Provider
or model, modified Pi/control state, or altered the authoritative 24-cell root.

## 8. Remaining unauthorized or unverified

- Main Session review and creation of any corrected Candidate commit;
- fresh focused re-audit of the two accepted findings and regressions;
- Stage 1 acceptance, Execution Baseline and Stage 2 Manifest;
- credential resolution, network dispatch, real DeepSeek behavior and USD 2
  Pilot execution;
- real Skill/recovery effect, strategy ranking or inferential statistics.

No project source was staged or committed. No Stage 2 action was taken.

The Main re-review micro-correction was test/report-only. Per its Prompt, the
authoritative 24-cell simulation and broad V0 regressions were preserved rather
than rerun.

## 9. `CURRENT_STATE_UPDATE_PROPOSAL`

This is a proposal only; this Session did not edit `CURRENT_STATE.md`.

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  v1_b:
    rejected_candidate:
      commit: 951e9161300eacd408e232aa6d1fa66ac02d0e10
      tree: a9ad6eee8ae4cfe32ee3e9e04613a8d16e5296f6
      status: remains_rejected_after_focused_audit
    stage_1_post_audit_bounded_correction:
      status: completed_after_main_rereview_test_only_micro_correction_pending_corrected_candidate_decision
      suggested_disposition: CORRECTION_COMPLETE_PENDING_MAIN_CANDIDATE_REVIEW_AND_REAUDIT
      corrected_manifest_id: be258f6f62276436fef65a44459d70611749043b9dc2d25ec134a0e7abc1055d
      corrected_workbench_source_digest: ef30c4be9bc4143569f30aabbb66b2a01db9b2098082f35dba2137f3acb22ffe
      findings_corrected: [V1B-AUD-F-001, V1B-AUD-F-002]
      main_rereview_production_fixes: accepted
      exact_cli_missing_credential_micro_regression: passed
      focused_tests: 19
      credential_reads: 0
      network_calls: 0
      external_provider_calls: 0
      real_model_calls: 0
      corrected_candidate_commit: false
      re_audit: false
      execution_baseline_commit: false
      stage_2: false
    next_control_point:
      owner: Main Session and user
      action: review test-only micro-correction, decide corrected Candidate, then separately authorize focused re-audit if accepted
```
