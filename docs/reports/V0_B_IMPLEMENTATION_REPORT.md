# V0-B Implementation Report — Main-review correction

```yaml
goal_id: V0_B_EVIDENCE_SESSION_VERIFIER_OUTCOME
contract_status_at_execution: accepted_activated_pending_implementation
implementation_owner: dedicated_v0_b_goal_session
report_status: corrected_pending_independent_risk_audit_and_main_review
formal_goal_acceptance: false
recommended_disposition: PASS_V0_B_EVIDENCE_FOUNDATION
control_baseline_commit: 32dc7b136053e2fdc17f294322a3cf7fef79e737
v0_a_implementation_baseline: 1a1565fa7e6d1440c8f99e2c7e587201a14111c1
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
real_model_calls: 0
external_provider_calls: 0
recovery_attempts: 0
child_attempts: 0
pi_core_patches: 0
git_commits_created: 0
independent_risk_audit_executed_by_this_session: false
```

## 1. Corrected result

**Fact:** The first-round recommendation, Gates A–H result, DoD 25/25 result,
42/42 test count, and first-round authoritative IDs are superseded by the
user-authorized main-review correction. Their original Run artifacts remain
unchanged.

**Fact:** The corrected implementation passes strict TypeScript, 56/56
Workbench tests, the accepted V0-A regression checks, and the corrected
deterministic suite. The four terminal routes and two bounded incomplete routes
are:

| Role | Corrected Run ID | Result | Inspect |
| --- | --- | --- | --- |
| authoritative pass | `run-dc84dc47-7fca-4e68-9118-7269e298c90f` | `passed/null` | exit 0; committed and integrity-valid |
| valid task failure | `run-7da827c4-4c8f-463f-ac57-99d137ee9ea9` | `failed/agent` | committed and integrity-valid |
| invalid Verifier | `run-40360101-6ed0-4756-97ef-f63f98396bb1` | `invalid/verifier` | committed and integrity-valid |
| post-persistence corruption | `run-4671912d-1e79-4eab-ad97-b54b70675147` | `invalid/evidence` | exit 1; committed envelope, integrity-invalid |
| persistence-operation failure | `run-82895dce-f949-4771-9eec-5e80a904ad10` | incomplete evidence | exit 1; no terminal marker; Verifier not started |
| secret-scan rejection | `run-4a0e1530-e37d-43ab-a817-2a9d2ea62ebe` | incomplete evidence | exit 1; no terminal marker; synthetic value not persisted |

**Recommendation:** After the separately authorized independent risk audit and
main Session reconciliation, accept the corrected deterministic Stage 1 as
`PASS_V0_B_EVIDENCE_FOUNDATION`.

**Unconfirmed:** V0-B-specific real-model behavior, Completion Policy effect,
Recovery effect, cross-process Resume, crash reconciliation, OS sandboxing,
network-egress blocking, process-tree termination, and statistical Eval
validity remain unproven.

## 2. Correction Gate 0

Gate 0 ran before correction edits.

**Fact:**

- root HEAD was exactly
  `32dc7b136053e2fdc17f294322a3cf7fef79e737`;
- no file was staged;
- the existing V0-B implementation remained uncommitted;
- the registered untracked `reference/` directory remained untouched;
- `.upstream/pi` and `.runs/v0-a/pi` were both exactly
  `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
- protected tracked diff was empty;
- the original `.runs/v0-b/evidence/source-inventory.json` matched 46/46
  declared files by size and SHA-256;
- the first-round authoritative Run and three first-round counterexamples
  existed with their terminal artifacts;
- `CURRENT_STATE.md`, the formal Contract, Charter, control rule, V0-A fixture,
  Pi, and `reference/` were not polluted.

No reset, checkout, clean, stash, deletion, or baseline reconstruction was used.

## 3. Correction 1 — integrated pre-terminal secret/reasoning scan

### Source and symbols

- `workbench/src/evidence/secret-scan.ts`
  - `scanPreterminalEvidenceV0B()`;
- `workbench/src/run-v0b.ts`
  - `executeV0BRun()`;
- `workbench/src/contracts/v0b-types.ts`
  - `SecretScanResultV0B`;
  - `TerminalRecordV0B.preterminal_scan`;
- `workbench/src/inspect-v0b.ts`
  - terminal scan proof and scope validation.

### Behavior

**Fact:** The Coordinator now performs a deterministic, bounded scan before it
writes `terminal.json`. The scan covers:

- Session evidence;
- the preterminal Journal plus the deterministic pending terminal Journal
  event objects;
- Task, Strategy, instruction, and executed Verifier snapshots;
- Run, Attempt, Workspace, SessionRef, VerifierResult, abort, and pending
  Outcome objects;
- Tool Result and Verifier output artifacts;
- evidence validation.

The scan evidence stores scope labels, scope kind, size, digest, rule ID, and
match count. It never stores a matched value. A valid terminal record binds the
scan ArtifactRef and requires `completed: true` and `match_count: 0`.

**Fact:** A rejected scan or scanner failure produces no `terminal.json`.
`inspect` therefore returns incomplete/integrity-invalid and the CLI returns
non-zero. The synthetic rejection probe exists only in memory; the final
rejection Run contains the safe rule/scope result but not the probe value.

### Tests and Run evidence

- `workbench/tests/v0b-secret-scan.test.ts`
  - safe match metadata;
  - injected scanner failure;
- `workbench/tests/v0b-e2e.test.ts`
  - integrated normal scan before terminal;
  - rejection and scanner failure create no terminal;
  - synthetic value absent from persisted Run bytes.

The authoritative pass scan covered 15 files and 8 pending objects with zero
matches. All four corrected terminal Runs contain a completed zero-match scan.

## 4. Correction 2 — ArtifactRef and Inspect real-path boundary

### Source and symbols

- `workbench/src/evidence/artifacts.ts`
  - `validateRunRootBoundary()`;
  - `resolveRunRelative()`;
  - `artifactRef()`;
  - `validateArtifactRef()`;
  - `readJsonArtifact()`;
- `workbench/src/inspect-v0b.ts`
  - `inspectRunV0B()`.

### Behavior

**Fact:** Artifact access now:

- rejects a linked Run root;
- walks each existing path segment with `lstat`;
- rejects intermediate, dangling, and final symlink/junction/reparse entries;
- resolves real paths and checks containment in the same real Run root;
- rejects directories and other non-ordinary files before hashing or reading;
- fails closed on malformed ArtifactRef envelopes;
- returns bounded diagnostics rather than expanding artifact bodies.

**Fact:** `inspect` catches malformed JSON, malformed JSONL, invalid Index
shape, missing files, directory masquerading, link boundaries, and digest
mismatches. It returns a structured result and the CLI returns non-zero instead
of crashing or repairing evidence.

### Tests and Windows boundary

- `workbench/tests/v0b-evidence.test.ts`
  - traversal, collision, tamper;
  - intermediate junction;
  - dangling junction;
  - final link branch;
  - linked Run root helper;
  - directory masquerading;
- `workbench/tests/v0b-inspect.test.ts`
  - malformed Journal JSONL;
  - malformed and invalid-shape Evidence Index;
  - Index digest mismatch;
  - missing artifact;
  - directory masquerading;
- `workbench/tests/v0b-e2e.test.ts`
  - invalid/non-Run IDs;
  - linked Run root;
  - incomplete evidence;
  - terminal Outcome digest mismatch.

**Fact:** The current Windows account could create junction/reparse links but
could not create a file symlink without additional privilege. The final-link
test therefore used an actual directory junction and exercised the same
`lstat().isSymbolicLink()` rejection branch. File-symlink behavior on this
account is not claimed as directly executed.

## 5. Correction 3 — Verifier execution evidence and Journal ArtifactRef

### Source and symbols

- `workbench/src/verifier/runner.ts`
  - `runExternalVerifierV0B()`;
  - bounded `spawnVerifier()`;
- `workbench/src/run-v0b.ts`
  - Run-local write-once Verifier snapshot;
  - `verifier_started` and `verifier_completed` projections;
- `workbench/src/evidence/validator.ts`
  - `validateJournalArtifactRefsV0B()`;
- `workbench/src/contracts/v0b-types.ts`
  - `VerifierResultV0B.execution`.

### Behavior

**Fact:** The executed source is
`<run-root>/config/verifier.mjs`, the write-once snapshot produced before the
Workspace is exposed to the Agent. The runner verifies the snapshot digest
against the preflight-frozen digest before execution.

Terminal evidence records:

- actual Node executable identity and Node version;
- actual argv;
- actual cwd and `cwd_identity: project_root`;
- `shell: false`;
- only environment allowlist keys (`NO_COLOR`, `V0B_WORKSPACE`), never values;
- timeout and output hard cap;
- started/completed timestamps and `duration_ms`;
- source snapshot ArtifactRef and digest verification;
- full-output ArtifactRef.

The Journal now stores a complete `full_output_ref` ArtifactRef. Every declared
`*_ref` in Journal data fails closed if it is not a valid ArtifactRef envelope.

### Tests

- `workbench/tests/v0b-verifier.test.ts`
  - actual pass execution evidence;
  - missing, spawn, parse, timeout, and output-cap invalid routes;
- `workbench/tests/v0b-evidence.test.ts`
  - malformed Journal ArtifactRef rejection;
- the valid task-failure route remains `failed/agent`, while every Verifier
  infrastructure/contract route remains `invalid/verifier`.

This remains a bounded Verifier runner, not a general process platform,
process-tree sandbox, or OS sandbox.

## 6. Correction 4 — reasoning redaction metadata

### Source and symbols

- `workbench/src/session/evidence-session.ts`
  - `recordReasoningMetadata()`;
  - `sanitizeSessionEntry()`;
  - `EvidenceMirrorSessionStorageV0B.redaction`;
- `workbench/src/run-v0b.ts`
  - `sessionRefFor()`.

**Fact:** Reasoning-safe persistence now records:

- redacted block count;
- bounded original content-type aggregate;
- Unicode code-point character count;
- UTF-8 byte count;
- removed signature count.

It stores no reasoning body or signature. Nested `thoughtSignature` and
`thinkingSignature` fields are also removed.

`workbench/tests/v0b-session.test.ts` uses a multibyte synthetic reasoning body,
proves character count differs from UTF-8 byte count, proves two signatures are
removed, proves body/signature/authorization sentinels are absent, and reopens
the JSONL with public `JsonlSessionStorage.open()`.

The authoritative deterministic task has `thinkingLevel: off`, so its
SessionRef truthfully contains zero reasoning blocks. Synthetic coverage proves
the non-zero redaction path.

## 7. Correction 5 — real persistence-operation failure and claim calibration

### Source and symbols

- `workbench/src/session/evidence-session.ts`
  - `EvidenceMirrorSessionStorageV0B.appendEntry()`;
  - `EvidencePersistenceOperationErrorV0B`;
- `workbench/src/pi/pi-adapter-v0b.ts`
  - `PiEvidenceCycleErrorV0B`;
  - bounded abort/error projection;
- `workbench/src/run-v0b.ts`
  - incomplete persistence-failure branch;
- `workbench/src/evidence/journal.ts`
  - `validateJournal(..., { route: "error" })`.

**Fact:** The new test-only injection fails the actual evidence mirror append
path after the complete runtime Session append, not a completed file after the
fact. The resulting Run:

- is not attributed to Agent failure;
- does not run the Verifier because the evidence Session is incomplete;
- records bounded attempt error/abort and persistence-operation evidence;
- has no Outcome, Evidence Index, or terminal marker;
- is rejected by `inspect`.

Run `run-82895dce-f949-4771-9eec-5e80a904ad10` records
`operation: reasoning_safe_session_append`, `agent_failure_attributed: false`,
and `verifier_started: false`.

**Fact:** The separate corruption route remains. It appends a deterministic
post-persistence corrupt record after the Session completed, then proves public
reopen/ArtifactRef integrity rejection and produces a committed
`invalid/evidence` envelope.

**Inference:** These cases prove two bounded detection/control paths. They do
not prove crash durability, resume reconciliation, exactly-once execution, or
general side-effect recovery.

## 8. Budget and abort truth

**Fact:**

- `wall_time_usage_ms` is the actual observed value and is never clamped to the
  configured limit;
- valid Runs assert provider, Tool, and wall-time usage are within their limits;
- `fauxSequenceHardBoundV0B()` proves the repair route has at most 8 Provider
  requests and 7 Tool calls, and the no-repair route has 1 and 0;
- these hard bounds are checked before Run side effects and runtime hooks stop
  before an unexpected request or Tool call could exceed the limit;
- accepted Outcome precedence still contains the tested `failed/budget` branch;
- settled Runs record `abort_requested: false`;
- the persistence-operation route records the actual bounded abort request and
  completion facts;
- no Recovery, general cancellation runtime, or process-tree guarantee was
  added.

The authoritative pass recorded 8/12 Provider requests, 7/12 Tool calls, and
424/120000 ms wall time.

## 9. Corrected deterministic evidence

### Authoritative pass

```yaml
run_id: run-dc84dc47-7fca-4e68-9118-7269e298c90f
attempt_id: attempt-f0014181-f136-4a3d-8a4e-fe1519c744a5
session_id: session-a36ee08c-60b3-4462-a1ae-09a80ece6683
workspace_id: workspace-d01d2642-9934-4f64-b225-edb72682be84
status: passed
failure_class: null
terminal_reason: assistant_final
provider_requests: 8
tool_calls: 7
external_provider_calls: 0
recovery_attempts: 0
child_attempts: 0
artifact_count: 23
preterminal_scan:
  completed: true
  scanned_files: 15
  scanned_objects: 8
  matches: 0
inspect_committed: true
inspect_integrity_valid: true
workbench_tree_digest: 17daf52f08312659819877a7117e404aa1af0c0f293565a7a0448ca2627213d9
```

### First-round evidence preserved but superseded

```yaml
first_round_authoritative:
  run_id: run-80a75c40-a70d-4117-b4e0-77ceeb089266
  status: superseded_due_main_review_evidence_and_path_correction
  original_artifacts_preserved: true

first_round_counterexamples:
  - run-c4896f6d-6ae5-44ba-9f12-b48af9b3d74f
  - run-16287064-02ef-49fc-a62c-d6ec071728be
  - run-129218c9-1873-45c4-a43f-1edcad38761b
  status: superseded_first_round_evidence
  original_artifacts_preserved: true
```

No old Run was deleted, overwritten, or reused as a corrected authoritative ID.

## 10. Verification commands and results

| Command | Exit | Result |
| --- | ---: | --- |
| `& '.runs/v0-a/pi/node_modules/.bin/tsc.cmd' -p 'workbench/tsconfig.json'` | 0 | strict TypeScript passed |
| `node --test 'workbench/test'` | 0 | 56 passed, 0 failed, 0 skipped |
| `node 'workbench/scripts/public-import-smoke.mjs'` | 0 | public emitted Pi imports resolved |
| `node 'workbench/scripts/verify-formal-run.mjs' '.runs/v0-a/runs/run-5c0b157e-31d7-4873-95a1-fd284377ace3'` | 0 | accepted V0-A authoritative Run verified |
| `node --test 'test/public.test.ts'` in accepted V0-A Workspace | 0 | 3 passed, 0 failed, 0 skipped |
| `node 'workbench/scripts/run-v0b-deterministic-suite.mjs'` | 0 | four terminal and two incomplete corrected routes generated |
| corrected pass `inspect` | 0 | committed and integrity-valid |
| corrected evidence-corruption `inspect` | 1 expected | committed envelope, integrity-invalid |
| persistence-operation `inspect` | 1 expected | incomplete; terminal missing |
| secret-scan rejection `inspect` | 1 expected | incomplete; terminal missing |
| targeted path/malformed/scan/Verifier tests | 0 | 11 passed, 0 failed, 0 skipped |
| corrected six-Run external scan | 0 | zero matches in seven forbidden categories |

Runtime:

```yaml
node: v24.14.1
typescript: 5.9.3
```

Exact commands and exit codes are also recorded in
`.runs/v0-b/evidence/commands-and-exit-codes.md`.

## 11. Corrected Gates and DoD

The first-round Gate/DoD table is superseded. The corrected evidence supports:

| Gate | Corrected result | Evidence |
| --- | --- | --- |
| A — control/source identity | PASS | exact Gate 0 identities, 46/46 original inventory, no staged/protected pollution |
| B — contract/preflight | PASS | strict types; frozen task/strategy/verifier/source identities |
| C — Session/Journal | PASS | public-openable reasoning-safe JSONL; complete redaction metadata; legal settled/error routes; actual append failure |
| D — external Verifier | PASS | post-settled/session-complete only; executed write-once snapshot; full execution evidence and ArtifactRefs |
| E — Outcome/terminal evidence | PASS | accepted precedence; write-once terminal; integrated preterminal scan; corrupt/incomplete rejection |
| F — budget/abort/inspect | PASS | actual wall time; fixed Faux hard bounds; truthful snapshots; safe malformed/link handling |
| G — deterministic Coding Task | PASS | corrected four terminal routes plus two bounded incomplete routes; 56/56 tests |
| H — scope/continuity | PASS | model/network/Pi patch/Recovery/child Attempt/commit all zero; controls protected |

**Recommendation:** Corrected Stage 1 satisfies the Contract's 25 DoD items,
subject to the independent risk audit and main Session/user acceptance. This is
a recommendation, not self-acceptance.

## 12. Scope and known limitations

**Fact:**

- real model calls: 0;
- external Provider calls: 0;
- Recovery attempts: 0;
- child Attempts: 0;
- Pi Core patches/private imports: 0;
- external network/download/install: 0;
- Git commits/staged files created by this Session: 0;
- Stage 2 was not authorized and was not executed;
- the independent risk audit was not executed by this Session.

The implementation does not claim:

- OS sandbox or network-egress enforcement;
- process-tree termination;
- cross-process Resume;
- in-flight crash recovery;
- side-effect reconciliation or exactly-once Tool execution;
- real-model or Completion Policy effectiveness;
- V0-C/V1/V2 behavior.

## 13. Source inventory and delta

The corrected inventory covers 50 implementation/report files. The corrected
delta contains 34 files relative to the exact Control Baseline. Final
path/size/SHA-256 details are in:

- `.runs/v0-b/evidence/source-inventory.json`;
- `.runs/v0-b/evidence/source-delta.json`.

The correction prompt, control documents, Pi, V0-A fixture, historical Runs,
and `reference/` are not implementation delta.

## 14. Structured `CURRENT_STATE_UPDATE_PROPOSAL`

This is a proposal only. The dedicated Session did not modify
`CURRENT_STATE.md`.

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  active_goal: V0_B
  goal_status: corrected_execution_complete_pending_independent_risk_audit_and_main_review
  recommended_disposition: PASS_V0_B_EVIDENCE_FOUNDATION
  formal_acceptance: false
  implementation_owner: dedicated_v0_b_goal_session
  correction:
    first_round_gate_and_dod_claims: superseded
    main_review_corrections_1_through_5: implemented_and_verified
    independent_risk_audit: pending
  deterministic_stage_1:
    corrected_gates_a_through_h: recommended_pass
    strict_typescript: passed
    workbench_tests: 56_passed_0_failed_0_skipped
    authoritative_run: run-dc84dc47-7fca-4e68-9118-7269e298c90f
    counterexample_runs:
      agent_failure: run-7da827c4-4c8f-463f-ac57-99d137ee9ea9
      verifier_invalid: run-40360101-6ed0-4756-97ef-f63f98396bb1
      post_persistence_corruption: run-4671912d-1e79-4eab-ad97-b54b70675147
      persistence_operation_failure: run-82895dce-f949-4771-9eec-5e80a904ad10
      secret_scan_rejection: run-4a0e1530-e37d-43ab-a817-2a9d2ea62ebe
    external_provider_calls: 0
    real_model_calls: 0
    recovery_attempts: 0
    child_attempts: 0
    pi_core_patches: 0
  proven:
    - terminal evidence is blocked until a bounded integrated scan completes with zero matches
    - ArtifactRefs and inspect reject linked paths, real-path escape, malformed evidence, non-files, and integrity mismatch
    - Verifier execution uses the frozen Run-local snapshot and persists actual bounded execution metadata
    - reasoning redaction persists bounded content-type, character, byte, and removed-signature metadata without body/signature
    - actual evidence-mirror append failure stops before Verifier and remains incomplete rather than becoming Agent failure
    - post-persistence corruption remains a distinct detected invalid-evidence route
  not_proven:
    - v0_b_specific_real_model_route
    - completion_policy_effectiveness
    - recovery_effect
    - cross_process_resume
    - crash_after_side_effect_reconciliation
    - os_sandbox_or_network_egress_block
    - process_tree_termination
    - statistical_eval_validity
  protected_state:
    pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
    pi_core_patch_count: 0
    control_files_modified_by_dedicated_session: false
    git_commit_created_by_dedicated_session: false
  next_main_session_action:
    - bind the corrected Source Inventory, Source Delta, Run IDs, and 56-test count
    - launch the separately authorized independent read-only risk audit
    - reconcile the audit with this report
    - ask the user to accept, request another bounded correction, or reject V0-B
```
