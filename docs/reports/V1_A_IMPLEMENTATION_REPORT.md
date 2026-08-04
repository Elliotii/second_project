# V1-A Implementation Report

## Disposition

`CORRECTED_CANDIDATE_PENDING_MAIN_REVIEW_AND_FREEZE`

This report now includes the original dedicated V1-A Implementation Session's post-focused-audit bounded correction. The final post-audit addendum supersedes earlier candidate identities and dispositions without erasing their history. It does not accept V1-A, create a Candidate Commit, pass Gate J, or authorize V1-B.

## Result

- **Fact:** the micro-correction entry/final boundary passed at root `c9f91057db60cf61dab0d3aa305564d498c89cd6` and Pi `027a5847901b5dde30270abaa1041046cd2b4b55`; the Git index and Pi worktree are clean, protected control identities are unchanged, and the user-provided untracked read-only `reference/` directory has an empty Git diff.
- **Fact:** V1A-RR-001 through V1A-RR-004 now pass regenerated deterministic evidence: focused residuals 4/4, complete V1-A tests 14/14, targeted V0 Verifier tests 2/2, full Workbench regression 105/105, strict TypeScript and the V1-A deterministic suite all exited 0.
- **Fact:** observed counts are Faux Provider calls 4, external behavioral Verifier calls 16, real-model calls 0, external Provider calls 0, network calls 0, credential reads 0 and cost USD 0.
- **Fact:** `CURRENT_STATE.md`, Pi, reference sources, dependencies and the Git index/history were not modified.
- **Fact:** this correction proves substrate semantics only. It does not prove Skill effectiveness, recovery effectiveness or a winning treatment.

## Pre-micro main-review correction matrix

| Finding | Source correction | Test/evidence | Result | Remaining limitation |
| --- | --- | --- | --- | --- |
| V1A-MR-001 | `ExperimentManifestV1`, `RunResultV1`, `aggregateExperimentV1`, real digest bindings and tracked 24-cell Manifest now enforce complete membership, typed pre-execution pause, exact run identities, C-only lineage and explicit per-Strategy denominators. Treatment invalids remain comparable; only pre-authorized infrastructure/evidence invalids are excluded. | `v1a-deterministic.test.ts` missing/duplicate/undeclared/mixed-revision/pause/lineage/status/budget/non-C/third-attempt matrix; `manifest-and-denominator-evidence.json` records 24 planned, 24 observed, 23 comparable, 1 infrastructure exclusion, 1 treatment invalid and 22 passed in the denominator fixture. | passed | Actual pilot execution and statistical analysis remain V1-B/later work. |
| V1A-MR-002 | `runTreatmentProbeV1` captures the actual Faux callback's reasoning-safe `systemPrompt/messages/tools` projection; B/C equality and A/B Skill-wrapper-only delta are computed from those bytes. The same external Measurement Verifier runner executes after observed `settled`; C consumes its typed failure and creates at most one same-Session child. | `payload-verifier-order-evidence.json`; B/C payload digests equal, A/B normalized contexts equal, actual event order includes settled → verifier start/completion, and only C has a child and second Verifier run. | passed | Faux behavior does not establish real-model behavior. |
| V1A-MR-003 | Four Task roles now freeze instruction/workspace/public-check/external-Verifier/reference-patch/Tool identities; each workspace has `package.json` and `test/public.test.mjs`; four external `.mjs` Verifiers invoke exported behavior outside the workspace via the existing bounded Verifier runner. | `task-calibration-evidence.json`; every unmodified workspace fails the external Verifier, every reference repair passes public check and two repeated external checks, four nonsolutions fail, and protected-file shortcut mutation is rejected. | passed | The four fixtures are calibration tasks, not effectiveness evidence. |
| V1A-MR-004 | fixed profile is `deepseek-v4-flash` with explicit V1-B preflight revalidation; nominal one-use authority is validated before factory/runtime identity, and denied/missing/malformed/consumed paths never reach factory/resolver/transport. | Provider authority test and `provider-authority-evidence.json`; authorized injected fake consumes exactly once; zero real calls, network and credentials. | passed | Live compatibility, pricing and availability require V1-B revalidation and separate authority. |
| V1A-MR-005 | Skill preflight binds exact name, description, parent, source ref, source digest/size and public wrapper; it scans the root itself plus descendants before public load and rejects root/child links, hardlinks, escape/alias/resource/source drift. | exact Skill/path test and `skill-identity-evidence.json`, including separator alias normalization, duplicate/diagnostic/name/description/root-link/child-link/hardlink/escape/resource cases. | passed | This remains an exact-one frozen Skill path, not a reload/discovery platform. |

## Corrected source, fixture and test paths

The correction changed these implementation paths and named surfaces:

- `workbench/src/contracts/v1-types.ts`: `TaskSpecV1`, `ExperimentManifestV1`, `RunResultV1`, `AggregationResultV1` and validators.
- `workbench/src/experiment/v1.ts`: `deriveManifestBindingsV1`, `buildDeterministicManifestV1`, `validateExperimentManifestV1`, `aggregateExperimentV1`, `V1_MANIFEST_DIGEST_DOMAINS`.
- `workbench/src/experiment/task-pack-v1.ts`: real Task identity loading, `runMeasurementVerifierV1`, bounded public-check execution, calibration, protected-boundary and nonsolution probes.
- `workbench/src/pi/pi-adapter-v1.ts`: actual model-context projection, treatment probes and payload-delta proof.
- `workbench/src/provider/fixed-provider-v1.ts`: frozen `deepseek-v4-flash` profile, envelope, nominal one-use authority and fail-before-factory composition.
- `workbench/src/skill/runtime-v1.ts`: frozen expected Skill identity, root/descendant ordinary-path checks and public loader/wrapper comparison.
- `workbench/src/verifier/runner.ts` and `workbench/src/types.ts`: additive `V1_WORKSPACE` and `public_test` support for the reused bounded runner/Tool Profile.
- `workbench/tests/v1a-deterministic.test.ts`, `workbench/scripts/run-v1a-deterministic-suite.mjs`, and `workbench/scripts/write-v1a-main-review-correction-evidence.mjs`.
- `fixtures/manifests/v1/deterministic-experiment.json`.
- Each `fixtures/tasks/v1/{parse-duration,bounded-index,state-transition,stable-format}/` Task JSON plus new `instruction.md`, `workspace/package.json` and `workspace/test/public.test.mjs`.
- `fixtures/verifiers/v1/{parse-duration,bounded-index,state-transition,stable-format}.mjs`, replacing the prior non-executable JSON definitions.

The exhaustive Control-Baseline-to-corrected-candidate inventory, including unchanged V1-A candidate files, byte counts and SHA-256 values, is `source-inventory-and-delta.json` in the final correction evidence directory.

## Pre-micro exact verification record

All command records include cwd, exit code and duration under `.runs/v1-a/corrections/main-review-001/final-evidence-v2/command-*.json`.

| Command | Cwd | Result | Duration |
| --- | --- | --- | ---: |
| `node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | `workbench` | exit 0 | 3035 ms |
| `node --test tests/v1a-deterministic.test.ts` | `workbench` | 10/10, exit 0 | 4959 ms |
| `node scripts/run-v1a-deterministic-suite.mjs` | `workbench` | five corrected gates, exit 0 | 4105 ms |
| `node --test test` | `workbench` | 101/101, exit 0 | 41036 ms |

Identity commands recorded root/Pi HEAD and status, an empty index, and an empty protected-path diff, all exit 0. Protected SHA-256 identities match the Control Baseline, including `CURRENT_STATE.md` `986404b025274ba3ecc40529ac68e309e8896b28d78525a19b999bdd2658171e` and `AGENTS.md` `dc46f42eaf6dad3791e273afbf6ae5d6b90ebe2323854c971d9ea870d17d2c61`.

## Pre-micro evidence and digests

Prior `.runs/v1-a/evidence/` artifacts are retained as pre-correction evidence. The corrected authoritative deterministic evidence is:

- `.runs/v1-a/corrections/main-review-001/final-evidence-v2/EVIDENCE_INDEX.md`
- `correction-evidence-summary.json`
- `source-inventory-and-delta.json`
- `manifest-and-denominator-evidence.json`
- `payload-verifier-order-evidence.json`
- `task-calibration-evidence.json`
- `provider-authority-evidence.json`
- `skill-identity-evidence.json`
- `protected-input-identity.json`
- `secret-reasoning-scan.json`
- `command-*.json`

Final corrected-candidate digests:

```yaml
source_digest: 2d5408f0a4e79197674728d2188b61757e92ff9deb6096a1b9bf8291ee648add
workbench_tree_digest: a11ed03dfa7bfbb07e66acf2cd7e8788795762e2d3297a97ebf5781d4eba2ea5
fixture_tree_digest: 18155c1cffe53b4be17b84fcd418d6a8eb782f4d4689eacc05d6bf8e44e0d055
manifest_id: 7ae27be5ac0bebdbb2daf7839372a9fe2c2712f324815ca6ef7e66b342973e72
```

Two superseded evidence generations remain under `.runs/v1-a/corrections/main-review-001/evidence/` and `final-evidence/`. The first had a scanner rule-definition self-match; the second preceded the frozen wrapper-size/digest strengthening. The authoritative v2 scan excludes both rule-definition files, reports zero matches, and overwrites neither predecessor.

## Remaining uncertainty and later audit inputs

- **Unconfirmed:** Main Session lightweight bounded re-review, user-authorized Candidate Commit, Candidate SHA freeze, Gate J focused independent audit, final acceptance and Implementation Baseline.
- **Unconfirmed:** all V1-B real-provider/model/task-effectiveness/recovery/cost questions.
- **Proposed focused-audit inputs:** frozen corrected Candidate SHA when separately authorized; this report; the binding Main Review Report; the five-finding correction Prompt; final correction `EVIDENCE_INDEX.md`; `source-inventory-and-delta.json`; the tracked Manifest; focused tests; and the five machine evidence projections above.
- **Proposed audit focus:** manifest membership/denominators and C lineage; actual payload equality and Verifier ordering; Task behavioral calibration/protected shortcuts; fail-before-runtime Provider authority; exact Skill identity and root-link handling. The audit must remain read-only and must not repair, accept, commit or broaden scope.

## Pre-micro CURRENT_STATE_UPDATE_PROPOSAL

```yaml
proposed_project_status: V1_A_CORRECTED_CANDIDATE_READY_FOR_MAIN_REREVIEW
proposed_active_goal: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
implementation_started: true
implementation_completed: true_corrected_candidate_only
main_review_findings_corrected: 5/5
candidate_gates_A_through_I: passed_on_regenerated_corrected_evidence
definition_of_done_candidate_count: 22/22_corrected_candidate_only
candidate_disposition: PASS_V1_A_CORRECTED_CANDIDATE_FOR_MAIN_REREVIEW
source_digest: 2d5408f0a4e79197674728d2188b61757e92ff9deb6096a1b9bf8291ee648add
authoritative_deterministic_evidence: .runs/v1-a/corrections/main-review-001/final-evidence-v2/EVIDENCE_INDEX.md
real_model_calls_observed: 0
external_provider_calls_observed: 0
network_calls_observed: 0
credential_reads_observed: 0
pi_core_patch_count: 0
private_import_count: 0
git_stage_or_commit_operations: 0
unverified_or_audit_pending:
  - main_session_lightweight_bounded_rereview
  - user_authorized_candidate_commit_and_candidate_sha_freeze
  - gate_J_focused_independent_audit
  - user_and_main_session_final_acceptance
recommended_next_control_action: main_session_lightweight_bounded_rereview_then_stop_for_separate_user_authorization
```

This proposal is advisory. The dedicated Session did not modify `CURRENT_STATE.md`.

## Post-focused-audit bounded-correction addendum

This addendum is authoritative for the correction requested by
`V1_A_POST_AUDIT_BOUNDED_CORRECTION_PROMPT.md`. It supersedes the earlier
candidate disposition, identities, test counts and next-action proposal above,
while preserving the earlier Main-review and Main-rereview correction history.

### Binding input and entry boundary

- **Fact:** the binding focused-audit report SHA-256 is
  `7815d6ed522aaadedb764e02fe0808316e78b2a70145094fef88237a967e9cf5`.
- **Fact:** correction started and ended on the audited Candidate commit
  `e3ff98948b26187b48af61928b56e7cacb550d31`, tree
  `89cae1c2c3c091ddc2644fac9a2d28c5b1800e03`; the correction itself remains an
  unstaged working-tree delta pending Main review and separate freeze authority.
- **Fact:** pinned Pi remains clean at
  `027a5847901b5dde30270abaa1041046cd2b4b55`; the Git index is empty.
- **Fact:** `CURRENT_STATE.md` and `AGENTS.md` remain unchanged at SHA-256
  `986404b025274ba3ecc40529ac68e309e8896b28d78525a19b999bdd2658171e` and
  `dc46f42eaf6dad3791e273afbf6ae5d6b90ebe2323854c971d9ea870d17d2c61`.
  The binding audit report, reference sources and Pi were not modified.

### F-001 through F-004 correction matrix

| Finding | Bounded correction | Counterexample and evidence | Result |
| --- | --- | --- | --- |
| F-001 | Root `.gitattributes` now applies the exact text-fixture rule `/fixtures/** text eol=lf`. The tracked V1 Manifest was normalized to LF and rebound to corrected runtime identities; no V0 fixture content was edited. | All 50 tracked fixture paths have one of the bounded text extensions, resolve to `text: set` and `eol: lf`, contain zero CRLF sequences, and produce identical raw and prospective-clean Git object IDs. Every non-V1 fixture is byte-equal to its audited Candidate blob; accepted V0 fixture blob delta is 0. | passed in corrected worktree; fresh committed-Candidate checkout re-audit remains pending |
| F-002 | `runTreatmentProbeV1` now constructs an isolated Faux registry with an explicit frozen `api/provider/model id` descriptor. The real four-argument response callback captures the actual request model and a stable projection of context plus request options. Signal, callback, secret, header and random session fields are not serialized. | B and C complete serialized initial requests are byte-equal. Negative mutations of API, provider, model id and `maxTokens` each break B/C equality and common-context proof. Existing A/B Skill-wrapper-only delta, actual Measurement Verifier ordering and C-only bounded child behavior remain green. | passed |
| F-003 | Resolver and transport failures are projected to `FixedProviderRequestErrorV1` with the fixed message `V1 fixed provider request failed`; no internal message or `cause` crosses the public handle. Authority is still consumed before resolver/transport work. | Resolver-marker and transport-marker/credential counterexamples both reject through the public handle without exposing the fake marker. Resolver failure makes zero transport calls. | passed |
| F-004 | `projectFixedProviderUsageV1` now rejects non-finite, fractional or negative counters, non-finite/negative cost, and request/token/cost envelope overflow before projecting credential-free evidence. | Zero, exact boundary and normal values pass; NaN, infinity, negative, fractional, request 17, combined tokens 131073 and cost 0.21 reject. | passed |

### Exact post-audit correction delta

Only the following source/fixture/test surfaces were changed:

- `.gitattributes` — the single exact-byte fixture LF rule;
- `fixtures/manifests/v1/deterministic-experiment.json` — LF normalization and
  corrected `workbench_tree_digest` / `manifest_id` rebind only;
- `workbench/src/pi/pi-adapter-v1.ts` — deterministic actual request descriptor,
  callback capture and serialization;
- `workbench/src/provider/fixed-provider-v1.ts` — secret-free public error
  projection and bounded usage validation;
- `workbench/tests/v1a-deterministic.test.ts` — four audit counterexamples;
- `workbench/scripts/write-v1a-main-rereview-micro-evidence.mjs` — repurposed
  existing V1 evidence writer for the append-only post-audit evidence set.

No Task, Skill, Verifier, Strategy, V0 fixture, V0 schema, Pi, dependency,
control-state or audit-report content changed.

### Authoritative verification record

Machine command records under
`.runs/v1-a/corrections/focused-audit-001/final-evidence/command-*.json` include
the exact executable/arguments, cwd, exit code, count, stdout/stderr and duration.

| Command | Result | Duration |
| --- | --- | ---: |
| `node --test --test-name-pattern=V1A-POST-AUDIT-F tests/v1a-deterministic.test.ts` | 4/4, exit 0 | 7801 ms |
| `node --test tests/v1a-deterministic.test.ts` | 18/18, exit 0 | 16087 ms |
| `node scripts/run-v1a-deterministic-suite.mjs` | five gates, exit 0 | 4256 ms |
| `node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | exit 0 | 3165 ms |
| `node --test tests/v0b-verifier.test.ts` | 2/2, exit 0 | 3383 ms |
| `node --test --test-concurrency=1 tests/v0c-stage1.test.ts tests/v0c-main-review-correction.test.ts tests/v0c-post-audit-correction.test.ts` | 24/24, exit 0 | 18185 ms |
| `node --test test` | 109/109, exit 0 | 53178 ms |

The focused V0-C files share `.runs` identity enumeration. An earlier diagnostic
invocation ran those three files with default cross-file concurrency and observed
23/24 because another file created a Run between the test's before/after scans;
the protocol-appropriate sequential command above passed 24/24 without any V0-C
source change. Earlier diagnostics also observed the expected F-001 failure before
the Manifest was normalized, and PowerShell blocked `npm.ps1`; the final record
uses direct `node`/`npm.cmd` commands. These superseded diagnostics are not
represented as successful evidence.

### Authoritative evidence and identities

The append-only evidence root is:

` .runs/v1-a/corrections/focused-audit-001/final-evidence/ `

Its `EVIDENCE_INDEX.md` binds the summary, command records, complete source
inventory, fixture LF/prospective-clean results, finding matrix, actual request
projection, Provider error/usage projection, protected boundary and
secret/error/evidence scan.

```yaml
source_digest: 8702ac87651808e30f971e27dbcb64dfb4c8a2c1ca4ceb28e124978042b7ea59
workbench_inventory_digest: a20c910330ef886a7c519deac2f6bfebb097215e970d1e30babe28ac50f8fa7b
fixture_inventory_digest: cf0d88930491e8d9bfded909be490960b6eb995549abae274b8c81685aa68c06
manifest_workbench_tree_digest: aab587b0c7371964ad89ecfc9304720757d7243dc457b904d5e91956eb0bc5d2
manifest_id: c59cc2b780e6b0ca5c01c5f1d63f17fced4cc1d6b345370fd1856a0b11d3126e
tracked_fixture_count: 50
fixture_crlf_file_count: 0
prospective_clean_mismatch_count: 0
accepted_v0_fixture_blob_delta_count: 0
```

Observed deterministic counts remain Faux Provider calls 4 and external
behavioral Verifier calls 16. Real-model calls, external Provider calls, network
calls, credential reads, cost, dependency installs, Pi modifications, private
imports and Git stage/commit operations are all zero.

### Remaining uncertainty and required stop

- **Unconfirmed:** Main Session lightweight review of F-001 through F-004.
- **Unconfirmed:** a separately authorized corrected Candidate commit/SHA freeze.
- **Unconfirmed:** F-001 reproduction from that newly committed Candidate in a
  fresh Windows `core.autocrlf=true` checkout. Current worktree attribute,
  prospective-clean and blob-delta proofs do not claim that later re-audit has
  occurred.
- **Unconfirmed:** Gate J acceptance, final V1-A acceptance, Implementation
  Baseline and all V1-B questions.

The dedicated Session stops here. It did not launch another audit, accept the
Goal, freeze a Candidate or enter V1-B.

## Post-audit CURRENT_STATE_UPDATE_PROPOSAL

```yaml
proposed_project_status: V1_A_POST_AUDIT_CORRECTED_CANDIDATE_PENDING_MAIN_REVIEW_AND_FREEZE
proposed_active_goal: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
implementation_started: true
implementation_completed: true_post_audit_corrected_worktree_only
focused_audit_findings_corrected: 4/4
candidate_disposition: CORRECTED_CANDIDATE_PENDING_MAIN_REVIEW_AND_FREEZE
source_digest: 8702ac87651808e30f971e27dbcb64dfb4c8a2c1ca4ceb28e124978042b7ea59
workbench_inventory_digest: a20c910330ef886a7c519deac2f6bfebb097215e970d1e30babe28ac50f8fa7b
fixture_inventory_digest: cf0d88930491e8d9bfded909be490960b6eb995549abae274b8c81685aa68c06
manifest_workbench_tree_digest: aab587b0c7371964ad89ecfc9304720757d7243dc457b904d5e91956eb0bc5d2
manifest_id: c59cc2b780e6b0ca5c01c5f1d63f17fced4cc1d6b345370fd1856a0b11d3126e
authoritative_deterministic_evidence: .runs/v1-a/corrections/focused-audit-001/final-evidence/EVIDENCE_INDEX.md
real_model_calls_observed: 0
external_provider_calls_observed: 0
network_calls_observed: 0
credential_reads_observed: 0
pi_core_patch_count: 0
private_import_count: 0
git_stage_or_commit_operations: 0
unverified_or_pending:
  - main_session_lightweight_review_of_F_001_through_F_004
  - separately_authorized_corrected_candidate_commit_and_sha_freeze
  - fresh_windows_autocrlf_checkout_reaudit_of_new_candidate
  - gate_J_and_final_V1_A_acceptance
  - implementation_baseline_and_V1_B
recommended_next_control_action: main_session_lightweight_review_then_stop_for_user_decision
```

This proposal is advisory. `CURRENT_STATE.md` remains untouched.

## Main rereview micro-correction addendum

This addendum supersedes the pre-micro identities, command counts, handoff recommendation and state proposal above. The accepted Skill surface, actual Faux payload/Verifier ordering, Task behavioral calibration outside RR-004, and V0 behavior were preserved.

### Four-row residual matrix

| Residual | Bounded correction | Fail-closed proof | Result |
| --- | --- | --- | --- |
| V1A-RR-001 | `validateExperimentManifestV1` and `aggregateExperimentV1` now derive the complete expected Manifest from the project root and compare the full frozen value. The expected set is exactly 4 Tasks x 2 repetitions x 3 Strategies, with fixed run IDs, order slots and 24 required-terminal dispositions. | Empty, shortened, reordered, substituted and caller-created-pause Manifests reject. Coherently rehashed Skill, Task, Strategy, Verifier, model, prompt, Tool and Workbench binding drift rejects before aggregation. | passed |
| V1A-RR-002 | A frozen protocol policy binds final Verifier status, attribution and exclusion: `none` -> passed/failed and comparable; `treatment` -> invalid/cancelled and comparable; `infrastructure` -> infrastructure_error and excluded; `evidence` -> invalid and excluded. | Final/status mismatch, passed treatment, invalid none, failed infrastructure, wrong evidence status, unauthorized exclusion and treatment exclusion all reject. The legal synthetic matrix yields 24 planned, 22 comparable, 2 excluded, 1 treatment-invalid and 20 passed. | passed |
| V1A-RR-003 | One-use Provider authority is atomically reserved at formal composition, before runtime identity allocation and factory invocation; the reserved request consumes authority before resolver/transport work. | A second composition before the first request rejects with zero resolver/transport calls and no second factory. A throwing first factory burns the reservation. Denied, missing and malformed authority still produce zero factory/resolver/transport counts. | passed |
| V1A-RR-004 | The `public_check_dependent` state-transition public test now rejects the unmodified implementation while remaining weaker than the external behavioral Verifier. Task workspace and tracked Manifest identities were regenerated. | Unmodified public command exits nonzero; the reference solution passes the public command and the stronger external Verifier twice; the public test does not expose the external-only `cancelled`, `planned` and empty-state acceptance cases. | passed |

### Exact micro delta

Relative to `.runs/v1-a/corrections/main-review-001/final-evidence-v2/source-inventory-and-delta.json`, the micro-correction changed exactly these candidate source/fixture/test files:

- `workbench/src/experiment/v1.ts`
- `workbench/src/provider/fixed-provider-v1.ts`
- `workbench/tests/v1a-deterministic.test.ts`
- `workbench/scripts/write-v1a-main-rereview-micro-evidence.mjs`
- `fixtures/tasks/v1/state-transition/workspace/test/public.test.mjs`
- `fixtures/tasks/v1/state-transition/task.json`
- `fixtures/manifests/v1/deterministic-experiment.json`

Per-file predecessor and successor SHA-256 values are recorded in `source-inventory-and-delta.json` in the final micro evidence directory. No other source, fixture or test surface was changed by this micro-correction.

### Authoritative verification record

All records include command, cwd, exit code, count and duration under `.runs/v1-a/corrections/main-review-001/micro-correction-001/final-evidence/command-*.json`.

| Command | Cwd | Result | Duration |
| --- | --- | --- | ---: |
| `node --test --test-name-pattern=V1A-RR tests/v1a-deterministic.test.ts` | `workbench` | 4/4, exit 0 | 4919 ms |
| `node --test tests/v1a-deterministic.test.ts` | `workbench` | 14/14, exit 0 | 9043 ms |
| `node scripts/run-v1a-deterministic-suite.mjs` | `workbench` | five gates, exit 0 | 4027 ms |
| `node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | `workbench` | exit 0 | 2946 ms |
| `node --test tests/v0b-verifier.test.ts` | `workbench` | 2/2, exit 0 | 3601 ms |
| `node --test test` | `workbench` | 105/105, exit 0 | 44921 ms |

Root remains `c9f91057db60cf61dab0d3aa305564d498c89cd6`; Pi remains clean at `027a5847901b5dde30270abaa1041046cd2b4b55`; the Git index and protected-path diff are empty. `CURRENT_STATE.md` and `AGENTS.md` retain SHA-256 `986404b025274ba3ecc40529ac68e309e8896b28d78525a19b999bdd2658171e` and `dc46f42eaf6dad3791e273afbf6ae5d6b90ebe2323854c971d9ea870d17d2c61`. The user-provided `reference/` directory remains untracked and read-only with an empty Git diff.

### Final micro evidence and identities

Authoritative append-only micro evidence:

- `.runs/v1-a/corrections/main-review-001/micro-correction-001/final-evidence/EVIDENCE_INDEX.md`
- `micro-correction-evidence-summary.json`
- `residual-matrix.json`
- `source-inventory-and-delta.json`
- `manifest-status-attribution-evidence.json`
- `provider-authority-evidence.json`
- `task-calibration-evidence.json`
- `protected-input-identity.json`
- `secret-reasoning-scan.json`
- `command-*.json`

The predecessor `final-evidence-v2/` is preserved. A superseded first micro attempt is also preserved under sibling `micro-correction-001/evidence/`; its tests passed, but its post-test boundary check incorrectly required the known untracked `reference/` directory to be Git-clean.

```yaml
source_digest: 7b1d470910fa440aa634d303c153d8f3f2565b740905e79bc4a7f4af04d93246
workbench_tree_digest: 15d037296f4df63f43b554f0791fe9cc083cf6e32dcce138972a08bd274a9477
fixture_tree_digest: ac637c2801d7aa18908a932b21a5b6a912c6a85cb7ac43d14d731d45035f4892
manifest_id: cf5c368564a6633b3f225bf12bea8b23d0b7a4877724bcde740915ee22e43f13
```

Observed counters remain Faux Provider calls 4, external behavioral Verifier calls 16, real-model calls 0, external Provider calls 0, network calls 0, credential reads 0 and cost USD 0. Pi patches, private imports, dependency installs, Git stage/commit operations, independent audit launches and V1-B work are all 0.

### Focused-audit inputs and remaining uncertainty

- **Unconfirmed:** Main Session rereview of V1A-RR-001 through V1A-RR-004 and user decision on whether the micro-corrected candidate passes.
- **Unconfirmed:** any separately authorized Candidate Commit, Candidate SHA freeze, Gate J focused audit, final V1-A acceptance or Implementation Baseline.
- **Unconfirmed:** all real-provider/model effectiveness, compatibility, recovery, cost and promotion questions reserved for V1-B/later control points.
- **Proposed later focused-audit inputs:** a separately frozen Candidate SHA; the binding Main Rereview Report and Micro-Correction Prompt; this report and Closeout Draft; the final micro Evidence Index and residual matrix; the tracked Manifest; focused test file; and the three RR-specific machine projections. No audit has been launched here.

## CURRENT_STATE_UPDATE_PROPOSAL

```yaml
proposed_project_status: V1_A_MICRO_CORRECTED_CANDIDATE_READY_FOR_MAIN_REREVIEW
proposed_active_goal: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
implementation_started: true
implementation_completed: true_micro_corrected_candidate_only
main_review_findings_corrected: 5/5
main_rereview_residuals_corrected: 4/4
candidate_gates_A_through_I: passed_on_regenerated_micro_corrected_evidence
candidate_disposition: PASS_V1_A_MICRO_CORRECTED_CANDIDATE_FOR_MAIN_REREVIEW
source_digest: 7b1d470910fa440aa634d303c153d8f3f2565b740905e79bc4a7f4af04d93246
workbench_tree_digest: 15d037296f4df63f43b554f0791fe9cc083cf6e32dcce138972a08bd274a9477
fixture_tree_digest: ac637c2801d7aa18908a932b21a5b6a912c6a85cb7ac43d14d731d45035f4892
manifest_id: cf5c368564a6633b3f225bf12bea8b23d0b7a4877724bcde740915ee22e43f13
authoritative_deterministic_evidence: .runs/v1-a/corrections/main-review-001/micro-correction-001/final-evidence/EVIDENCE_INDEX.md
real_model_calls_observed: 0
external_provider_calls_observed: 0
network_calls_observed: 0
credential_reads_observed: 0
pi_core_patch_count: 0
private_import_count: 0
git_stage_or_commit_operations: 0
unverified_or_audit_pending:
  - main_session_rereview_of_V1A_RR_001_through_004
  - user_authorized_candidate_commit_and_candidate_sha_freeze
  - gate_J_focused_independent_audit_if_separately_authorized
  - user_and_main_session_final_acceptance
recommended_next_control_action: main_session_rereview_micro_corrected_candidate_then_stop_for_user_decision
```

This proposal is advisory. The dedicated Session did not modify `CURRENT_STATE.md`.

## Latest authority: post-focused-audit correction

The historical micro-correction section above is retained for lineage only. The
latest authoritative section is **Post-focused-audit bounded-correction
addendum**, with disposition:

`CORRECTED_CANDIDATE_PENDING_MAIN_REVIEW_AND_FREEZE`

Main Session should review only F-001 through F-004 against
`.runs/v1-a/corrections/focused-audit-001/final-evidence/EVIDENCE_INDEX.md`, then
stop for the user's decision. No corrected Candidate commit, fresh-checkout
re-audit, Gate J acceptance, final V1-A acceptance or V1-B work is claimed.
