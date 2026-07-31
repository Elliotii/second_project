# V0-C Post-Audit Bounded Correction Prompt

```yaml
status: authorized_for_original_v0_c_stage_1_implementation_session
authorized_by_user: 2026-07-31
stage: deterministic_stage_1_post_audit_bounded_correction
correction_owner: original_v0_c_stage_1_implementation_session
failed_audit_candidate_commit: 930c549b402fce9ffa96847a673ad187c64f6094
failed_audit_candidate_workbench_digest: a43ec6309e55754f5f095c76b226426a7d3d36b37b9ce36cbc08db6422f5fc6f
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
accepted_findings:
  - V0C-AUD-001
  - V0C-AUD-002
source_repairs_authorized: true_only_for_the_two_accepted_findings
new_feature_scope_authorized: false
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
dependency_installation_authorized: false
pi_core_patch_authorized: false
private_pi_import_authorized: false
stage_2_authorized: false
git_stage_or_commit_authorized: false
control_state_modification_authorized: false
```

## 1. Role and binding authority

You are the original dedicated V0-C Stage 1 Implementation Session.

The Main Session has accepted the two P2 findings in:

`docs/reports/V0_C_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`

The user authorizes you to correct only those two findings and the tests,
evidence and implementation reports directly required to prove the correction.

This authorization does not reopen V0-C architecture, add a feature, authorize
Stage 2 or allow you to make acceptance decisions. You must not turn either
finding into a general durable-runtime, transaction, evidence-platform or
exactly-once project.

Local source, local tests and observed command results outrank report prose.
The formal V0-C Contract remains binding.

## 2. Required read order

Read completely, in this order:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V0_VERSION_CHARTER.md`;
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
5. `docs/第二项目_Codex交接包_2026-07-30/V0_C_GOAL_CONTRACT.md`;
6. `docs/reports/V0_C_STAGE1_IMPLEMENTATION_REPORT.md`;
7. `docs/reports/V0_C_STAGE1_CLOSEOUT_DRAFT.md`;
8. `docs/reports/V0_C_STAGE1_MAIN_REVIEW_BOUNDED_CORRECTION_PROMPT.md`;
9. `docs/reports/V0_C_FOCUSED_INDEPENDENT_AUDIT_START_PROMPT.md`;
10. `docs/reports/V0_C_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`;
11. this Prompt.

Then inspect the exact cited source, tests and ignored audit evidence before
editing.

## 3. Correction-entry Gate

Before modifying anything, prove and record:

1. root `HEAD` is exactly
   `930c549b402fce9ffa96847a673ad187c64f6094`;
2. root tracked and staged changes are empty;
3. untracked project content is limited to:
   - `reference/`;
   - `docs/reports/V0_C_FOCUSED_INDEPENDENT_AUDIT_START_PROMPT.md`;
   - `docs/reports/V0_C_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`;
   - `docs/reports/V0_C_POST_AUDIT_BOUNDED_CORRECTION_PROMPT.md`;
4. the Workbench digest is exactly
   `a43ec6309e55754f5f095c76b226426a7d3d36b37b9ce36cbc08db6422f5fc6f`;
5. `.upstream/pi` is exactly
   `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
6. `CURRENT_STATE.md`, the formal Contract, Charter, control rule, ADRs,
   accepted V0-A/V0-B history and the independent audit report are unchanged;
7. existing authoritative and audit Runs/evidence are byte-preserved;
8. no credential is opened and no network or external Provider capability is
   initialized.

If any identity or boundary fails, write a bounded pause report and stop before
source edits.

## 4. Accepted finding V0C-AUD-001 — fail-safe handle cleanup

### Observed defect

`executeV0CRun()` successfully creates a Run handle, then calls
`lifecycleProbe("handle_created")` and `handle.debugIdentity()` before entering
the `try/finally` that calls `handle.close()`.

The audit deterministically reproduced both exceptions with one created handle
and zero close calls.

### Required correction

After handle creation succeeds, every subsequent operation must be protected by
one outer cleanup boundary for that exact handle.

The correction must preserve these invariants:

- handle creation failure does not attempt to close a nonexistent handle;
- any exception after successful handle creation closes that handle exactly
  once;
- the normal successful path keeps the same handle alive until after terminal
  finalization and closes it exactly once;
- initial and child Attempts still use the same handle;
- cleanup does not create an Attempt, Outcome, Index or terminal marker;
- zero-call counters remain zero in injected deterministic failure cases;
- no Pi Core, private Pi import, SDK/RPC fallback or process-runtime redesign.

At minimum, add deterministic tests for exceptions from:

1. `lifecycleProbe("handle_created")`;
2. `handle.debugIdentity()`.

Each test must prove:

- the call rejects;
- one handle was created;
- `close()` was called exactly once;
- no Attempt started;
- no terminal marker was committed;
- Provider, real-model, network and credential-read counts are zero.

Retain the existing success-path lifecycle assertion that close occurs only
after terminal commit.

## 5. Accepted finding V0C-AUD-002 — writer-side evidence truth

### Observed defect

`validateRunEvidenceV0C()` receives caller-asserted
`verifierAttemptIds` and `expectedEvidencePaths`. The writer currently derives
Verifier IDs from `AttemptRecord.attempt_id`, rather than actual Verifier
results/readback. The Inspector loads Verifier files but does not compare every
loaded Verifier's Attempt relationship with the corresponding Attempt.

The audit demonstrated that a synthetic mismatched Verifier readback can remain
invisible when the validator receives matching caller assertions.

### Required correction

Before terminal commit can represent a valid Run, writer-side validation must
derive truth from the actual objects and ArtifactRefs produced for that Run.

Keep the implementation bounded to the existing V0-C evidence model:

1. replace the caller-only Verifier relationship assertion with validation
   derived from actual per-Attempt Verifier results;
2. validate exactly one Verifier result/output and one Attempt validation per
   started Attempt;
3. validate at least:
   - Attempt ID relationship;
   - frozen Verifier identity and digest;
   - correct run-relative responsibility/path;
   - ArtifactRef digest and size/readback using the existing artifact helpers;
4. validate the realized Evidence Index items with the existing shared dynamic
   closed-set policy before the terminal marker is committed;
5. make `inspectRunV0C()` explicitly check each loaded
   Verifier-to-Attempt relationship and the same applicable identity/ref facts;
6. fail closed on missing, duplicate, unexpected, mismatched or
   wrong-responsibility evidence.

Preserve exactly one `RunEvidenceValidationV0C` object and one corresponding
Journal event. If a realized-Index commit guard is needed after objects are
materialized, it must use the existing shared terminal policy and must not
create a second Run-validation artifact/event.

On an injected relationship or closed-set fault:

- no terminal marker may be committed;
- the Run must not be represented as a committed valid/passed Outcome;
- existing preterminal artifacts may only remain as inspectable uncommitted
  evidence;
- the Inspector must reject the mutated or incomplete Run.

Do not add a database, transaction log, cross-process recovery, general schema
registry or new evidence architecture.

### Minimum focused tests

Add deterministic writer-side tests covering at least:

1. actual Verifier `attempt_id` mismatch;
2. missing or duplicate Verifier evidence for a started Attempt;
3. wrong Verifier identity/digest;
4. Verifier ArtifactRef path/digest/size mismatch;
5. realized Index omission, unexpected path or wrong responsibility;
6. Inspector rejection of a loaded Verifier-to-Attempt mismatch;
7. the normal one-Attempt and two-Attempt paths still pass.

Tests must distinguish writer-side fail-closed behavior from mutation-only
post-write Inspector rejection.

## 6. Evidence preservation and regenerated identity

Do not overwrite or rewrite:

- the failed-audit Candidate Commit;
- its authoritative Runs;
- `.runs/v0-c/audit/`;
- the independent audit Prompt or Report;
- accepted V0-A/V0-B/G003/G006 evidence.

Because Workbench source will change:

1. preserve the old digest and Runs as
   `superseded_due_focused_audit_correction`;
2. compute a new final Workbench digest only after source and tests stabilize;
3. rerun only the already-defined deterministic V0-C suite and formal CLI
   acceptance necessary to create corrected authoritative Runs bound to that
   final digest;
4. inspect every newly designated authoritative Run;
5. update Source Inventory, Source Delta, Evidence Index and exact command log;
6. never overwrite an existing Run directory.

Audit probes may be copied into a correction-local ignored directory if needed,
but the original audit evidence must remain unchanged.

## 7. Bounded verification

Run the narrowest sequence that proves the correction:

1. strict TypeScript;
2. new post-audit correction tests for `V0C-AUD-001/002`;
3. `workbench/tests/v0c-main-review-correction.test.ts`;
4. `workbench/tests/v0c-stage1.test.ts`;
5. `workbench/tests/v0b-post-audit.test.ts`;
6. one complete `workbench/test` regression;
7. the existing deterministic V0-C suite, only after the final source digest is
   stable;
8. one corrected formal deterministic CLI Run plus `inspect`;
9. `inspect` for all newly designated authoritative Runs;
10. final secret/reasoning scan and protected-file/source-delta checks;
11. final root tracked/staged delta, Pi status and prohibited-surface counters.

Do not repeat unrelated exploratory tests. Record exact commands, working
directories, UTC intervals, exit codes, test counts and Run IDs.

Formatting-only EOF warnings already disclosed by Main Session are not part of
this correction unless an edited file naturally removes one without changing
the required evidence identity sequence.

## 8. Reports and required return

Update:

- `docs/reports/V0_C_STAGE1_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V0_C_STAGE1_CLOSEOUT_DRAFT.md`;
- the existing ignored V0-C evidence index, source inventory/delta and command
  record.

The Implementation Report must add a correction matrix:

| Finding | Root cause | Source correction | Focused proof | Regression result | Remaining limitation |
|---|---|---|---|---|---|

It must also report:

- entry-Gate facts;
- exact source delta;
- exact test commands and counts;
- corrected authoritative Run IDs;
- old-to-new supersession mapping;
- final Workbench digest;
- external Provider/real-model/network/credential counts;
- Pi/core/private-import status;
- unresolved limitations and non-claims;
- a structured `CURRENT_STATE_UPDATE_PROPOSAL`.

Suggested return disposition is limited to:

```yaml
- PASS_V0_C_POST_AUDIT_BOUNDED_CORRECTION_FOR_MAIN_REVIEW
- PAUSE_V0_C_POST_AUDIT_BOUNDED_CORRECTION
- FAIL_V0_C_POST_AUDIT_BOUNDED_CORRECTION
```

## 9. Prohibited actions

You must not:

- modify, stage or commit `CURRENT_STATE.md`, the formal Contract, Charter,
  control rule, ADRs or accepted Closeouts;
- modify or stage the independent audit Prompt/Report;
- create a Git commit or stage files;
- call a real model or external Provider;
- read `.env`, credentials or credential values;
- access the external network or download/install dependencies;
- modify `.upstream/pi`, use private Pi imports, or add SDK/RPC fallback;
- modify Verifier acceptance, protected Task criteria or historical Runs;
- enter Stage 2;
- repair unrelated code or expand into V1/V2/V3.

## 10. Pause conditions

Stop and report before expanding if:

1. the correction-entry Gate fails;
2. either finding requires a Contract, Charter or control-state change;
3. a fix requires Pi modification, private import, SDK/RPC fallback or an
   external dependency;
4. a fix requires credentials, network, a real Provider/model call or Stage 2;
5. the shared V0-B terminal/index policy must be weakened;
6. the exactly-one Run-validation invariant cannot be preserved;
7. writer-side fail-closed validation requires a general transaction/durable
   runtime architecture;
8. accepted historical evidence or protected files cannot remain unchanged;
9. unrelated tracked changes appear;
10. a new material risk outside `V0C-AUD-001/002` is observed.

## 11. Final stop point

After returning the updated reports, evidence, source delta and proposed
disposition, stop.

Do not create a corrected Candidate Commit, launch a re-audit, update control
state, request credentials or enter Stage 2. Those decisions remain with the
Main Session and user.
