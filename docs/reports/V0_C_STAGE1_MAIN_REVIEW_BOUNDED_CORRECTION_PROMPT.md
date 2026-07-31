# V0-C Stage 1 Main-Review Bounded Correction Prompt

```yaml
status: authorized_for_original_v0_c_stage_1_session
issued_by: current_main_session
user_authorized: true
date: 2026-07-31
goal: V0_C_BOUNDED_COMPLETION_AND_USER_FACING_USE
stage: deterministic_stage_1_bounded_correction
execution_owner: original_dedicated_v0_c_stage_1_implementation_session
control_baseline_commit: 47d36f25563012e1d411576eca387a778ba6a3e7
pre_correction_workbench_digest_reported: 61c44db5b362fcfb38e74d5e8e55a1618fdc85caffcc961ed3ca7df33df9630b
candidate_commit_authorized: false
focused_independent_audit_authorized: false
stage_2_authorized: false
real_model_calls_authorized: 0
external_provider_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
dependency_installation_authorized: false
pi_core_patch_authorized: false
git_stage_or_commit_authorized: false
```

## 1. Role and binding authority

You are the **original dedicated V0-C Stage 1 Implementation Session**. The
Main Session has completed a lightweight, bounded review of the Stage 1
candidate. The deterministic core is credible and the targeted regression set
passes, but the candidate must not be frozen because four implementation
boundaries do not yet satisfy the accepted
`docs/第二项目_Codex交接包_2026-07-30/V0_C_GOAL_CONTRACT.md`.

This is a correction turn under the already accepted V0-C Contract. It does
not authorize a new Goal, a Contract amendment, an independent audit, a
Candidate Commit, Stage 2, or a real-model call.

Before changing anything, completely read:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V0_C_GOAL_CONTRACT.md`;
4. `docs/reports/V0_C_STAGE1_IMPLEMENTATION_REPORT.md`;
5. `docs/reports/V0_C_STAGE1_CLOSEOUT_DRAFT.md`;
6. `.runs/v0-c/evidence/EVIDENCE_INDEX.md`;
7. this correction Prompt.

Then re-check the exact current source and tests cited below. Local source,
tests, and observed commands outrank report prose.

## 2. Correction-entry Gate

Proceed only if all of the following are true:

1. root `HEAD` is still
   `47d36f25563012e1d411576eca387a778ba6a3e7`;
2. there is no staged change and no unexpected tracked change outside the
   current V0-C Stage 1 candidate;
3. the pre-correction Workbench source digest is either the reported
   `61c44db5b362fcfb38e74d5e8e55a1618fdc85caffcc961ed3ca7df33df9630b`
   or any difference is explained solely by a Main-Session-created,
   non-implementation governance file;
4. `CURRENT_STATE.md` and the formal Contract have not changed since the
   Stage 1 report;
5. `.upstream/pi` is still exactly
   `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
6. no Candidate Commit, focused audit, Stage 2 authority, credential authority,
   external network authority, dependency-install authority, or real-model
   authority has appeared;
7. existing authoritative V0-C Runs and evidence remain byte-preserved.

If any item fails, stop and write a bounded
`docs/reports/V0_C_PAUSE_REPORT.md`. Do not normalize or silently repair
control state.

## 3. Accepted Stage 1 evidence that must be preserved

The correction must preserve, unless superseded by a newly generated
authoritative Run with an explicit reason:

- strict TypeScript success;
- complete Workbench regression success;
- one/two truthful Attempt lineage;
- same Harness/Session/Workspace continuation;
- exactly one Recovery slot and no third Attempt;
- public-only automatic Recovery;
- zero real/external Provider calls;
- zero credential reads and zero external network calls;
- zero Pi Core patches and zero private Pi imports;
- V0-A/V0-B/G003/G006 required regressions;
- write-once historical evidence and protected inputs.

Do not overwrite old Runs. If corrected authoritative Runs are produced, mark
the earlier four Stage 1 authoritative Runs as superseded in report/index
metadata without rewriting their original artifacts.

## 4. Binding findings and required corrections

### V0C-MR-001 — Pi Run Handle closes before Run finalization

**Observed source fact**

`workbench/src/run-v0c.ts` currently closes the handle in the `finally` block
immediately after Attempt execution, before Workspace finalization,
Run-level validation, Outcome, Index, and terminal-record commit.

**Binding Contract**

Contract Section 11.1 requires:

```text
initial and child use one handle
→ Run finalization
→ handle close
```

**Required correction**

- Keep the single Pi Run Handle alive through successful Run finalization and
  terminal-record commit.
- Close it exactly once after successful finalization.
- Still close it fail-safely on incomplete/error/exception paths.
- Do not emit Journal events or backfill artifacts after `run_terminal`.
- Add a deterministic test or bounded injected lifecycle probe that proves
  successful close occurs after terminal-record commit and that failure paths
  do not leak a live handle.
- Do not create a general resource manager.

### V0C-MR-002 — Failure Packet is not fully scanned before child allocation

**Observed source fact**

`workbench/src/completion/failure-packet-v0c.ts` performs bounded structural
checks and a small protected-marker regex. `workbench/src/run-v0c.ts` then
allocates/starts the child. The accepted shared V0-B secret/reasoning scanner is
only used during final Run terminalization.

**Binding Contract**

Contract Sections 10.4 and 12 require:

```text
reserve slot
→ construct and persist Packet/projection
→ scan and validate Packet/projection
→ allocate child ID
→ attempt_started
```

**Required correction**

- Apply the accepted shared V0-B secret/reasoning scan policy, or an exactly
  equivalent shared-rule invocation, to the persisted Failure Packet and
  Agent projection before allocating the child Attempt ID.
- Scanner error, match, missing artifact, digest/size/visibility mismatch, or
  post-scan mutation must fail closed as `invalid/evidence`.
- A rejected Packet must produce no child ID, no child entry in
  `run.attempt_ids`, and no `attempt_started` for ordinal 2.
- The `failure_packet_created` transition must only represent a Packet that is
  persisted, scanned, and validated for child consumption. Record bounded
  scan identity/result evidence without exposing matched secret text.
- Retain the final integrated terminal scan; the pre-child scan does not
  replace it.
- Add negative tests using at least one pattern caught by the shared scanner
  but not by the previous small regex, plus scanner-error/post-scan-mutation
  coverage as narrowly necessary.
- Do not expand this into a general DLP system.

### V0C-MR-003 — Run-level validation does not cover its frozen responsibilities

**Observed source fact**

The current `run_evidence_validation_completed` object primarily derives from
Session/lineage/Packet-error checks. Dynamic expected evidence, cumulative
budget consistency, all Attempt-validation relationships, and the terminal
plan are constructed or checked later.

**Binding Contract**

Contract Sections 5.3 and 14 require the single Run-level validation, before
Outcome, to validate:

- every started Attempt and its exactly-one Attempt validation;
- Attempt/Verifier/Session/Workspace/Packet lineage;
- cumulative budgets and Recovery-slot truth;
- the dynamic closed expected evidence set;
- the planned terminal suffix and terminalization plan.

**Required correction**

- Create one explicit Run-level validation path with the frozen
  responsibilities above.
- Validate exact identities/counts and counter arithmetic; do not merely copy
  counts into a `valid: true` object.
- Derive and validate the dynamic expected-set/terminal plan before appending
  `run_evidence_validation_completed`, while preserving the accepted
  no-digest-cycle final write order.
- Append exactly one Run-level validation event only after that validation has
  actually completed.
- Any inconsistency must produce fail-closed evidence semantics and must not
  commit a misleading valid terminal envelope.
- Keep Attempt-level validation distinct from Run-level validation.
- Add focused negative tests for a mutated Attempt-validation relation,
  cumulative-budget mismatch, and dynamic-plan mismatch. Reuse existing
  mutation helpers where possible.

### V0C-MR-004 — Frozen Product Surface cannot execute the real profile

**Observed source fact**

`workbench/src/cli.ts` unconditionally throws for the real strategy, while
`workbench/src/run-v0c.ts` hard-codes
`realExecutionAuthorized: false` and rejects every non-Faux execution.
`real-provider-route-v0c.ts` is a useful typed unit boundary, but it is not
connected to an authority-gated formal Run path.

**Binding Contract**

Contract Sections 5.5, 16.3, Gate I, and the Stage 2 boundary require a dormant
but executable formal real-provider route such that the frozen Stage 1 source
does not need editing during Stage 2.

**Required correction**

- Add a strict, explicit execution-authority and Provider-factory/credential
  boundary to the same formal V0-C Product Surface used by Stage 2.
- Unauthorized/default execution must fail before credential, network,
  Provider, Run identity, Workspace, Session, Tool, or Verifier side effects.
- An authorized route must be constructible without editing frozen source.
- Exercise the authorized execution plumbing only with deterministic injected
  fake Provider/factory/credential sources during this correction.
- Reuse the public emitted Pi provider/factory pattern proven by G006 where
  useful, but do not import `spikes/pi-runtime/g006` at Workbench runtime.
- Do not read `.env`, `process.env`, credential stores, or the real API in this
  correction.
- Do not perform DNS, HTTP, API, Registry, or any other external-network call.
- Do not hard-code unverified current endpoint, price, availability, or request
  facts beyond the already frozen model/profile identity.
- Add tests proving:
  1. default/unauthorized formal CLI/API path fails before all side effects;
  2. the exact authorized formal execution plumbing can be reached with
     injected fake dependencies;
  3. the fake route exercises the same Run/Attempt/Session/Verifier/Outcome
     orchestration rather than an isolated transport unit only;
  4. Stage 1 credential/network/real/external Provider counts remain zero.

If satisfying “no Stage 2 source edits” would require current real credentials,
network access, provider-fact research, a Pi patch/private import, a new
dependency, or a Contract amendment, stop and submit a Pause Report instead of
guessing.

## 5. Bounded verification

Run the narrowest tests that prove the four corrections, then run the already
accepted Stage 1 regressions:

1. strict TypeScript;
2. focused V0-C correction tests for `V0C-MR-001` through `004`;
3. full `workbench/test` regression;
4. V0-C deterministic branch suite;
5. public Pi import smoke;
6. required V0-B deterministic/post-audit regressions;
7. one corrected formal deterministic CLI Run plus `inspect`;
8. one corrected real-profile zero-call dry-run;
9. an authority-denied real execution probe that proves zero side effects;
10. an authorized-but-fake injected real-route plumbing probe that proves no
    real credential/network/Provider call.

Record exact commands, working directory, exit codes, test counts, and generated
Run IDs. Do not use broad exploratory commands when a focused command proves
the same property.

## 6. Evidence and report updates

Update:

- `docs/reports/V0_C_STAGE1_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V0_C_STAGE1_CLOSEOUT_DRAFT.md`;
- `.runs/v0-c/evidence/EVIDENCE_INDEX.md`;
- exact command/exit-code evidence;
- Source Inventory and Control-Baseline-to-corrected-Candidate Source Delta.

The reports must include a correction matrix:

| Finding | Source correction | Test/evidence | Result | Remaining limitation |
| --- | --- | --- | --- | --- |
| V0C-MR-001 | | | | |
| V0C-MR-002 | | | | |
| V0C-MR-003 | | | | |
| V0C-MR-004 | | | | |

Generate a new Workbench digest after all source/report-affecting verification
is stable. Any new authoritative Run must bind that final source digest.

Keep the structured `CURRENT_STATE_UPDATE_PROPOSAL` advisory only. Do not
modify or stage `CURRENT_STATE.md`, the formal Contract, Charter, control rule,
ADR, or accepted historical Closeouts.

## 7. Pause conditions

Stop immediately and write `docs/reports/V0_C_PAUSE_REPORT.md` if:

1. the correction-entry Gate fails;
2. a correction requires Contract/Charter/control-state changes;
3. a correction requires Pi modification, private import, SDK/RPC fallback, or
   partial emitted-package reconstruction;
4. a correction requires a dependency install, download, Registry, external
   network, credential read, or real/external Provider call;
5. the real route cannot be ready for Stage 2 without editing frozen source;
6. Packet scanning cannot happen before child-ID allocation;
7. Run-level validation cannot truthfully precede Outcome;
8. handle lifecycle cannot satisfy successful-finalization ordering without
   weakening failure cleanup;
9. V0-A/V0-B accepted behavior or post-audit protections regress;
10. the work expands into durable runtime, general DLP, general Provider
    platform, multiple Recovery paths, V1, V2, or Stage 2.

## 8. Required return and stop point

Return:

1. updated Implementation Report and Closeout Draft;
2. four-finding correction matrix;
3. exact corrected source paths and symbols;
4. focused and full test commands/results;
5. corrected authoritative Run IDs;
6. final Workbench digest;
7. Source Inventory and Source Delta;
8. Evidence Index;
9. root/Pi HEAD and status;
10. Provider/model/network/credential/dependency/Pi-patch counters;
11. protected-file identity result;
12. updated `CURRENT_STATE_UPDATE_PROPOSAL`;
13. proposed focused-audit input for these four boundaries.

Then stop. Do not:

- create or stage a Git commit;
- modify control state;
- accept V0-C;
- launch the independent audit;
- enter Stage 2;
- call a real model or external Provider.

The next permitted sequence is:

```text
original Stage 1 Session returns corrected candidate
→ Main Session performs lightweight bounded re-review
→ user separately authorizes Candidate Commit and focused independent audit
```
