# V1-A Main-Rereview Micro-Correction Prompt

```yaml
status: authorized_for_original_v1_a_implementation_session
issued_by: current_main_session
user_authorized: true
date: 2026-08-03
goal: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
stage: main_rereview_micro_correction
execution_owner: original_dedicated_v1_a_implementation_session
control_baseline_commit: c9f91057db60cf61dab0d3aa305564d498c89cd6
pre_micro_source_digest: 2d5408f0a4e79197674728d2188b61757e92ff9deb6096a1b9bf8291ee648add
pre_micro_workbench_digest: a11ed03dfa7bfbb07e66acf2cd7e8788795762e2d3297a97ebf5781d4eba2ea5
pre_micro_fixture_digest: 18155c1cffe53b4be17b84fcd418d6a8eb782f4d4689eacc05d6bf8e44e0d055
pre_micro_manifest_id: 7ae27be5ac0bebdbb2daf7839372a9fe2c2712f324815ca6ef7e66b342973e72
candidate_commit_authorized: false
focused_independent_audit_authorized: false
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
dependency_installation_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
git_stage_or_commit_authorized: false
```

## 1. Role and bounded authority

You are the original dedicated V1-A Implementation Session. Perform only the
four residual corrections in this Prompt. Preserve every accepted result from
the first correction. This turn does not authorize a new Goal, architecture
change, Candidate Commit, independent audit, real/external Provider call,
network access, credential read, dependency installation, Pi modification,
SDK/RPC/Extension route, V1-B, or V2/V3 work.

Read completely before editing:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V1_A_GOAL_CONTRACT.md`;
4. `docs/reports/V1_A_MAIN_REVIEW_REPORT.md`;
5. `docs/reports/V1_A_MAIN_REVIEW_BOUNDED_CORRECTION_PROMPT.md`;
6. `docs/reports/V1_A_MAIN_REREVIEW_REPORT.md`;
7. current `V1_A_IMPLEMENTATION_REPORT.md` and `V1_A_CLOSEOUT_DRAFT.md`;
8. the authoritative corrected Evidence Index under
   `.runs/v1-a/corrections/main-review-001/final-evidence-v2/`;
9. this Prompt.

## 2. Entry Gate

Proceed only if:

- root HEAD is still
  `c9f91057db60cf61dab0d3aa305564d498c89cd6`;
- no file is staged and the candidate delta is attributable to V1-A plus Main
  Session review documents;
- the pre-micro source, Workbench, fixture and Manifest identities match the
  YAML header or every difference is explained before editing;
- control files and accepted V0 evidence are unchanged;
- Pi is exactly `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
- no real-call, network, credential, dependency, commit or audit authority has
  appeared;
- user-controlled `reference/` inputs remain untouched.

If the Gate fails, stop and write `docs/reports/V1_A_PAUSE_REPORT.md`.

## 3. Binding micro-corrections

### V1A-RR-001 — Bind the complete frozen Manifest

Make the aggregate entry boundary fail closed against the complete frozen
Manifest, not only self-consistent input:

1. Validate the exact expected 4 Task × 2 repetition × 3 Strategy membership,
   Run IDs, order slots and dispositions for the V1-A deterministic Manifest.
2. An empty, shortened, reordered, substituted or coherently rehashed member
   set must fail.
3. A coherent Task/Skill/Strategy/Verifier/model/prompt/Tool/Workbench/Pi
   digest change with recomputed `manifest_id` must fail against current frozen
   bindings.
4. The Aggregator must require or derive the complete expected Manifest/source
   bindings; callers must not be able to omit the comparison accidentally.
5. Preserve typed pause support only when that pause is already present in the
   separately frozen expected Manifest. A caller cannot create a new pause by
   editing and rehashing the runtime Manifest.
6. Avoid introducing a database, signing system, scheduler or mutable Manifest
   service.

Add direct regression tests for the Main Session's empty-member and coherent
digest-drift counterexamples.

### V1A-RR-002 — Freeze legal status/attribution combinations

Before any counter is updated, validate one explicit terminal matrix:

1. `verifier_status` must equal the final authoritative Verifier status used
   for the Run outcome.
2. A passed Run must have `invalid_attribution: none` and cannot be excluded or
   treatment-invalid.
3. A normal failed terminal task outcome must not be silently relabeled as an
   excludable infrastructure/evidence invalid.
4. Treatment-caused invalids must use a legal invalid terminal status, remain
   comparable and never increment `passed`.
5. Infrastructure/evidence exclusions require a frozen protocol-level allowed
   class/status rule; a Run-provided boolean alone is not authorization.
6. `none`, `treatment`, `infrastructure` and `evidence` attributions must each
   reject incompatible terminal statuses and final-status combinations.
7. C initial/final status and child lineage rules from the first correction
   must remain intact.

The exact representation may be a small frozen exclusion policy in the
Manifest or an equivalent immutable protocol constant. Do not build a general
failure-taxonomy platform.

Add focused tests for passed+treatment, passed+final-failed, invalid+none,
unfrozen exclusion and every accepted legal category.

### V1A-RR-003 — Reserve authority at formal runtime creation

Make authority use atomic across composition and request:

1. A valid authority may create at most one formal runtime identity and invoke
   the factory at most once.
2. Reserve/consume it before allocating the identity or calling the factory.
3. A second composition attempt must fail before the factory even when no
   Provider request has occurred yet.
4. The reserved runtime may issue at most one Provider request; retry/reuse
   remains disabled.
5. If factory creation throws, fail closed and do not let the same authority
   create a second runtime.
6. Denied/missing/malformed paths must preserve zero factory/resolver/transport
   counts.

Add the exact two-compositions-before-request counterexample and a
factory-throws-then-reuse counterexample.

### V1A-RR-004 — Make the Task family claim truthful

Ensure the four Task roles remain real:

- For the Task labeled `public_check_dependent`, the unmodified Workspace's
  declared public check must expose the intended defect with nonzero exit.
- The reference repair must pass that public check and the stronger external
  Verifier repeatedly.
- The public check may reveal public examples but must not expose the hidden
  Verifier source or complete hidden acceptance.
- Alternatively reassign families only if all four Contract roles remain
  concretely represented and calibrated.

Keep the correction inside the existing Task fixture and calibration tests.

## 4. Verification

Run only:

1. focused residual counterexample tests;
2. complete `v1a-deterministic.test.ts`;
3. V1-A deterministic suite;
4. strict TypeScript;
5. targeted V0 Verifier regression affected by shared types/runner;
6. full Workbench regression once after focused tests are stable;
7. regenerated source/fixture/protected-input identity and secret/reasoning
   scan.

All commands must record cwd, exit code, count and duration. Real/external
Provider, network and credential-read counts remain zero.

## 5. Evidence and reports

Create an append-only micro-correction evidence generation under the existing
`main-review-001` correction lineage; do not overwrite `final-evidence-v2`.

Update:

- `docs/reports/V1_A_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V1_A_CLOSEOUT_DRAFT.md`;
- root `.runs/v1-a/evidence/EVIDENCE_INDEX.md` pointer;
- Source Inventory/Delta and final digests;
- Manifest/denominator/status evidence;
- Provider authority evidence;
- Task calibration evidence;
- commands, scans and protected identity evidence.

Add a four-row residual matrix for V1A-RR-001 through V1A-RR-004. Do not claim
Gate J or V1-A final acceptance.

## 6. Pause conditions

Pause if any residual requires a Contract/Charter change, Pi patch/private
import, dependency install, download, external network, credential read, real
Provider/model call, broad failure taxonomy, general authority platform,
database/scheduler, V1-B execution, SDK/Extension work, or accepted V0 behavior
regression.

## 7. Return and stop

Return:

1. updated reports and four-row residual matrix;
2. exact source/fixture/test delta;
3. proof the Main Session counterexamples now fail closed;
4. focused/full test results;
5. new source, Workbench, fixture and Manifest identities;
6. new append-only Evidence Index;
7. root/Pi/control/protected/reference status;
8. zero-call counters;
9. advisory `CURRENT_STATE_UPDATE_PROPOSAL`;
10. focused-audit inputs.

Then stop. Do not stage/commit, update `CURRENT_STATE.md`, launch audit, accept
V1-A, or begin V1-B.
