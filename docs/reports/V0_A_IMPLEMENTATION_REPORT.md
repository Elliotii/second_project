# V0-A Implementation Report

```yaml
goal_id: V0_A_CONTRACTS_PREFLIGHT_WORKSPACE_PI_ADAPTER
contract_status: closed_accepted
execution_session_owner: dedicated_v0_a_goal_session
report_status: accepted_after_main_rereview_and_user_review
accepted_goal_disposition: PASS_V0_A_FOUNDATION
control_baseline_commit: b6bfef1ceb796b822c1faf23ae43a04bcd1bd69b
implementation_baseline_commit: resulting_HEAD_of_this_revision
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
authoritative_run_id: run-5c0b157e-31d7-4873-95a1-fd284377ace3
formal_outcome: null
real_model_calls: 0
pi_core_patch_count: 0
```

## 1. Executive result

**Fact.** The main project-control session returned V0-A for a bounded path
security correction after demonstrating two Windows filesystem aliases that
the first implementation did not reject: a dangling junction ancestor and a
protected-path alias differing only by case.

**Fact.** The dedicated V0-A Goal Session corrected both defects inside the
project Wrapper, added source-root link rejection, and did not alter Pi Core,
the formal Contract, any control-state file, or the formal fixture.

**Fact.** After the correction, strict TypeScript passed and the complete
bounded suite passed 32/32 tests. The zero-side-effect dry-run left all
existing formal Run roots unchanged. A new deterministic formal Run settled,
passed independent verification and all 3 public tests, changed only
`src/parse-duration.ts`, preserved every protected file byte-for-byte,
created zero hardlink pairs, recorded exactly zero external Provider calls,
and emitted no formal Workbench Outcome.

**Fact.** The main project-control session independently reviewed the
corrected source and evidence, reran the bounded verification commands and the
two original counterexamples, and accepted the technical result. The user
then formally accepted `PASS_V0_A_FOUNDATION` and authorized control-state
closeout plus the Implementation Baseline Commit. The dedicated Session did
not accept its own work and did not change `CURRENT_STATE.md`.

## 2. Correction authority and start snapshot

**Fact.** Correction authority was limited to the original V0-A Contract.
There was no authority for V0-B, real models, external network access,
dependency installation, Pi patches, Git staging/commit/push, elevation, or
control-state changes.

**Fact.** The correction-start snapshot found:

```yaml
root_head: b6bfef1ceb796b822c1faf23ae43a04bcd1bd69b
root_tracked_diff: empty
root_staged_diff: empty
root_untracked:
  - docs/reports/V0_A_CLOSEOUT_DRAFT.md
  - docs/reports/V0_A_IMPLEMENTATION_REPORT.md
  - fixtures/tasks/v0-a-parse-duration/
  - reference/
  - workbench/
upstream_pi_head: 027a5847901b5dde30270abaa1041046cd2b4b55
upstream_pi_status: clean
isolated_pi_head: 027a5847901b5dde30270abaa1041046cd2b4b55
isolated_pi_status: clean
```

The first ordinary root Git invocation was refused by Git's dubious-ownership
check. The effective read-only snapshot used a command-local
`-c safe.directory=...`; no Git configuration was changed. Exact commands,
outputs, and exit codes are retained in
`.runs/v0-a/evidence/main-review-correction-log.md`.

## 3. Bounded correction

### 3.1 Dangling junction and missing-path semantics

**Fact.** `workbench/src/workspace/path-policy.ts`,
`assertNoReparsePath()`, now calls `lstatSync()` for each existing directory
entry. Only an error whose code is exactly `ENOENT` enters the missing-path
branch. It no longer uses `existsSync()` to decide whether a directory entry
itself exists.

**Fact.** A live or dangling symlink/junction classified by `lstat()` as a
link is rejected before mutation scope is evaluated. For a genuinely missing
new path, the last existing ordinary parent's native real path has already
been checked to remain inside the canonical Workspace. Every Tool invocation
continues to call this policy.

**Fact.** The regression specimen creates an actual Windows junction, moves
its target so `existsSync(link) === false` while
`lstatSync(link).isSymbolicLink() === true`, and requests
`escape/new.txt` under `writable_paths: ["escape/**"]`. The policy now throws
`symlink or junction is forbidden`; no target file is created.

### 3.2 Windows path identity

**Fact.** `workbench/src/workspace/path-identity.ts` defines host-aware scope
identity. It folds case only when `process.platform === "win32"` and preserves
case-sensitive behavior on Unix-like platforms.

**Fact.** Preflight duplicate and writable/protected overlap checks use that
identity. On Windows, `TASK.MD` and `task.md` conflict before formal identity
or Run-root creation.

**Fact.** Tool mutation policy applies writable/protected rules to the
canonical Workspace-relative identity returned after the existing path has
been inspected, rather than trusting only the Agent-supplied spelling. An
actual `workspace_write` call targeting `TASK.MD` is rejected as a protected
path on this Windows host, and `task.md` remains byte-identical.

### 3.3 Source-root link boundary

**Fact.** `workbench/src/hash.ts`, `treeInventory()`, now `lstat()` checks the
source root itself before traversal and requires an ordinary directory. A
linked/junction source root is rejected before the temporary Workspace target
is created. Existing child-entry link checks remain in place.

**Scope boundary.** This is a bounded link-escape correction using Node's
`lstat` link semantics. It does not enumerate every Windows reparse tag, add
ACL policy, or create a general filesystem security platform.

## 4. Regression coverage

**Fact.** The complete suite passed 32/32 with zero failures and zero skips on
Windows. New or materially strengthened coverage includes:

1. live-target junction rejection for read, list, search, edit, and write;
2. dangling-junction ancestor rejection for write, including explicit
   `existsSync === false`, `lstat().isSymbolicLink() === true`, and no side
   effect;
3. host-aware case identity, including retained Unix case sensitivity;
4. Windows protected-path alias rejection in the path policy;
5. Windows protected-path alias rejection through an actual Tool call with
   start/error audit pairing and unchanged bytes;
6. Windows case-only writable/protected conflict rejection in Preflight with
   unchanged formal Run roots;
7. linked source-root rejection before temporary-copy target creation;
8. the controlled formal source root and its entries confirmed non-linked.

**Fact.** Existing traversal, absolute, drive, UNC, URI, NUL, protected,
temporary-copy, hardlink, command-budget, bounded Tool Profile, public Faux
write, and Direct Pi Adapter tests remain passing.

The tests assert policy-level error messages. They do not treat an incidental
downstream filesystem failure as the security decision.

## 5. Tool and network claim boundary

**Fact.** The Agent is not exposed to a raw Bash, PowerShell, shell-string, or
arbitrary command Tool. `run_command` accepts only a validated command ID, and
the Task descriptor and Agent argument surface are bounded.

**Fact.** There is no explicit network command ID. The formal Run used the
local public Faux provider and recorded `external_provider_calls: 0`.

**Fact.** V0-A has no OS Sandbox and does not prove that system-level network
egress is blocked for arbitrary code executed in the process. The preceding
facts describe the exposed Harness/Tool surface and the observed formal Run;
they are not an OS isolation guarantee.

## 6. Direct public Pi Adapter and formal result

**Fact.** The Pi-specific implementation remains centralized under
`workbench/src/pi/` and imports only public emitted package roots:
`@earendil-works/pi-agent-core`, `@earendil-works/pi-agent-core/node`, and
`@earendil-works/pi-ai`. The public emitted import smoke passed. Scans found
zero private source imports and zero G006 Driver dependency.

**Fact.** The new authoritative identities are:

```yaml
run_id: run-5c0b157e-31d7-4873-95a1-fd284377ace3
attempt_id: attempt-ab6cb85f-8e32-48c3-8209-98c6b085a253
session_id: session-31e30722-5e54-449d-94be-926ffd7ddae8
workspace_id: workspace-b7249f6c-ef0f-4dbe-9760-82097bbf9bad
parent_attempt_id: null
run_status: settled
attempt_status: settled
terminal_reason: assistant_final
foundation_acceptance: passed
formal_outcome: null
```

| Check | Observed result |
|---|---|
| Faux provider calls | `8` |
| External provider calls | `0` |
| Agent-declared public test | exit `0`, not timed out |
| Independent public test | 3/3 pass |
| Protected bytes | unchanged |
| Changed paths | only `src/parse-duration.ts` |
| Source/initial logical digest | exact match |
| Hardlink pairs | `0` |
| Tool events | 7 start/end pairs, 0 errors |
| Harness settlement | observed |
| Recovery attempts | `0` |
| Formal Outcome | absent / `null` |

```yaml
complete_final_workspace_digest: 6e6741b02657ba320d69197e38f43f3c769739f6720f70835ea46a71ddabaf08
workspace_ref_logical_final_digest: 6e9639b99e6d714de97357cd2d640863426b092b60fad036bd4fa97c742b4ef8
config_digest: c9892f25c5454d33f421a6f6d07a575f37af53ca3fc993ea15bb0b8dc7855520
```

## 7. Run authority and retained evidence

**Fact.** Existing Run directories and their raw artifacts were not edited.
Authority is recorded separately in
`.runs/v0-a/evidence/run-authority-main-review-correction.json`.

| Run | Disposition |
|---|---|
| `run-5c0b157e-31d7-4873-95a1-fd284377ace3` | authoritative |
| `run-9f71d3cd-af00-4c85-97e0-884587ee7a14` | `superseded_due_main_review_path_security_correction` |
| `run-e63a6e55-2a9e-4c8c-bd9a-977302046efa` | superseded before final hardening |
| `run-3ef5cdfa-d6a3-48a6-a98d-fc29e71a2097` | superseded before fixture-contract correction |

The former authoritative Run remains valid evidence of the pre-correction
fixed task, but it is not authoritative for the corrected implementation.

## 8. Gate and Definition-of-Done reassessment

| Gate | Corrected result | Material evidence |
|---|---|---|
| A — Activation/source basis | PASS | original Gate A log plus correction-start baseline snapshot |
| B — Contracts/preflight | PASS | case-aware overlap tests; canonical dry-run; unchanged Run roots |
| C — Workspace/path boundary | PASS | live/dangling junction, case alias, source-root link, temp-copy, no-hardlink, protected and traversal tests |
| D — Public Pi Adapter | PASS | emitted smoke, strict TypeScript, Direct Harness test, private-import/Pi scans |
| E — Bounded Tool Profile | PASS | exact surface, policy rejection tests, actual case-alias Tool rejection, audit pairing, budgets |
| F — Deterministic task | PASS | new authoritative Run, independent verifier/public tests, 0 external calls, only allowed diff |
| G — Scope/continuity | PASS | bounded Source Delta, no Pi/control/fixture change, no later-version implementation |

**Fact.** All 20 Contract Definition-of-Done items were reassessed against the
corrected evidence and are recommended PASS. In particular, DoD 7 and 10 now
cite dangling-link and case-alias regressions; DoD 11 is limited to the
exposed Tool/command surface and does not claim OS-level egress prevention.

```yaml
definition_of_done:
  passed: 20
  failed: 0
  total: 20
```

## 9. Required commands and results

| Command/check | Exit | Result |
|---|---:|---|
| `.runs/v0-a/pi/node_modules/.bin/tsc.cmd -p workbench/tsconfig.json` | 0 | strict TypeScript pass after source freeze |
| `node --test workbench/test` | 0 | 32 pass, 0 fail, 0 skipped |
| formal dry-run | 0 | canonical plan; Run roots unchanged |
| formal CLI run | 0 | new Run settled; foundation acceptance passed |
| independent final-run verifier | 0 | complete projection verified |
| independent public test | 0 | 3 pass, 0 fail |
| public emitted import smoke | 0 | public imports resolved |
| private/G006 import scans | 1 | expected zero matches |
| credential/network/out-of-scope scans | 1 | expected zero matches |
| root tracked/staged control diff | 0 | empty |
| upstream and isolated Pi status/diff | 0 | pinned and clean |

All exact commands, cwd values, outputs, exit codes, and retained incidental
failures are in
`.runs/v0-a/evidence/verification-main-review-correction.md` and
`.runs/v0-a/evidence/main-review-correction-log.md`.

## 10. Source inventory and delta

**Fact.** The corrected complete inventory is
`.runs/v0-a/evidence/source-inventory-main-review-correction.json`.
The pre-correction `.runs/v0-a/evidence/source-inventory.json` remains
unchanged.

```yaml
workbench_file_count: 24
workbench_tree_digest: 4ba620c14074a4ec96989f1aa670bbad612ab5714ea102a4564813c19d743c6e
fixture_file_count: 5
fixture_full_tree_digest: 07c35b8eee38d052fd9d4c1b36a316fec0a9f5a7126b73a33e6c2c1320e0dfff
fixture_logical_workspace_digest_excluding_task_json: 83e14ee6480099d479faa392fb9dc5eb1db6e5e860b93702289ef20ca2cc3e0c
task_instruction_sha256: 22b166bda844a1a4de90d54b4fa399896ce6e418b3fd5abc094a39409bdb0f35
config_digest: c9892f25c5454d33f421a6f6d07a575f37af53ca3fc993ea15bb0b8dc7855520
accepted_pi_ai_artifact_sha256: 2f9df9522808b621cd3449876537f03d8a8df8b8d7ec2d5b18c6a910aa85b490
```

**Fact.** The Source Delta contains six modified Workbench files, one added
module (`src/workspace/path-identity.ts`), zero deletions, and no fixture
change. The machine-readable record is
`.runs/v0-a/evidence/source-delta-main-review-correction.json`.

## 11. Unverified items

**Fact.** Main-session and user acceptance completed on 2026-07-31.

**Fact.** The dedicated Session had no stage or commit authority. The user
subsequently authorized the main Session to create the implementation baseline
as `resulting_HEAD_of_this_revision`.

**Unconfirmed by design.** V0-A does not establish OS-level network egress
blocking, a general Sandbox, arbitrary Windows ACL/reparse-tag policy,
process-tree containment, durable Session reopen, Journal, external
Verifier/Outcome, Recovery, or real-model behavior.

**Unconfirmed.** A Windows file-symlink specimen was not created because this
Session did not request elevation. Actual Windows live and dangling junctions
exercise Node's link-classification rejection branch; no claim is made beyond
the tested and source-inspected boundary.

## 12. Evidence index

- `.runs/v0-a/evidence/EVIDENCE_INDEX.md`
- `.runs/v0-a/evidence/gate-a-command-log.md`
- `.runs/v0-a/evidence/setup-command-log.md`
- `.runs/v0-a/evidence/verification-command-log.md` (pre-correction)
- `.runs/v0-a/evidence/main-review-correction-log.md`
- `.runs/v0-a/evidence/verification-main-review-correction.md`
- `.runs/v0-a/evidence/source-inventory.json` (pre-correction)
- `.runs/v0-a/evidence/source-inventory-main-review-correction.json`
- `.runs/v0-a/evidence/source-delta-main-review-correction.json`
- `.runs/v0-a/evidence/run-authority-main-review-correction.json`
- `.runs/v0-a/evidence/gate-results-main-review-correction.json`
- `.runs/v0-a/runs/run-5c0b157e-31d7-4873-95a1-fd284377ace3/`

## 13. CURRENT_STATE_UPDATE_PROPOSAL

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  proposal_status: pending_main_session_rereview
  goal_id: V0_A_CONTRACTS_PREFLIGHT_WORKSPACE_PI_ADAPTER
  active_goal_remains: V0_A
  observed_execution_status: bounded_correction_complete_all_gates_pass_pending_main_rereview
  recommended_disposition: PASS_V0_A_FOUNDATION
  control_baseline_commit: b6bfef1ceb796b822c1faf23ae43a04bcd1bd69b
  implementation_source_identity:
    git_commit: null
    workbench_tree_digest: 4ba620c14074a4ec96989f1aa670bbad612ab5714ea102a4564813c19d743c6e
    workbench_file_count: 24
    fixture_full_tree_digest: 07c35b8eee38d052fd9d4c1b36a316fec0a9f5a7126b73a33e6c2c1320e0dfff
    fixture_file_count: 5
    fixture_logical_workspace_digest: 83e14ee6480099d479faa392fb9dc5eb1db6e5e860b93702289ef20ca2cc3e0c
    config_digest: c9892f25c5454d33f421a6f6d07a575f37af53ca3fc993ea15bb0b8dc7855520
    accepted_pi_ai_artifact_sha256: 2f9df9522808b621cd3449876537f03d8a8df8b8d7ec2d5b18c6a910aa85b490
    authoritative_run_id: run-5c0b157e-31d7-4873-95a1-fd284377ace3
    superseded_run:
      run_id: run-9f71d3cd-af00-4c85-97e0-884587ee7a14
      disposition: superseded_due_main_review_path_security_correction
  gates:
    A: PASS
    B: PASS
    C: PASS
    D: PASS
    E: PASS
    F: PASS
    G: PASS
  definition_of_done:
    passed: 20
    failed: 0
    total: 20
  pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
  pi_core_patch_count: 0
  real_model_calls: 0
  workbench_created: true
  formal_outcome_created: false
  recovery_attempts: 0
  network_claim_boundary:
    raw_shell_exposed_to_agent: false
    explicit_network_command_id_exposed: false
    formal_faux_external_provider_calls: 0
    os_network_egress_blocking_proven: false
  evidence_refs:
    - .runs/v0-a/evidence/EVIDENCE_INDEX.md
    - .runs/v0-a/evidence/main-review-correction-log.md
    - .runs/v0-a/evidence/verification-main-review-correction.md
    - .runs/v0-a/evidence/source-inventory-main-review-correction.json
    - .runs/v0-a/evidence/source-delta-main-review-correction.json
    - .runs/v0-a/evidence/run-authority-main-review-correction.json
    - .runs/v0-a/evidence/gate-results-main-review-correction.json
    - .runs/v0-a/runs/run-5c0b157e-31d7-4873-95a1-fd284377ace3
    - docs/reports/V0_A_IMPLEMENTATION_REPORT.md
    - docs/reports/V0_A_CLOSEOUT.md
  unverified_items:
    - main_session_and_user_acceptance_pending
    - implementation_not_committed_because_no_commit_authority
    - os_level_network_egress_blocking_not_proven
    - general_sandbox_and_arbitrary_windows_reparse_tag_policy_out_of_scope
    - v0_b_and_later_non_goals_not_verified
  proposed_state_changes:
    - retain_active_goal_as_V0_A_pending_main_rereview
    - record_recommended_disposition_PASS_V0_A_FOUNDATION
    - record_new_authoritative_run_and_corrected_source_digest
    - record_old_run_as_superseded_due_main_review_path_security_correction
    - record_corrected_gates_A_through_G_as_passed
    - preserve_formal_outcome_as_null
    - require_main_session_review_and_user_authorization_before_any_control_state_or_baseline_commit_change
```

This proposal has not been applied to `CURRENT_STATE.md`.

## 14. Main-session acceptance addendum

```yaml
main_session_review: PASS
user_decision: accepted
accepted_disposition: PASS_V0_A_FOUNDATION
accepted_at: 2026-07-31
implementation_baseline_commit_authorized: true
implementation_baseline_commit: resulting_HEAD_of_this_revision
active_goal_after_closeout: null
V0_B_authorized: false
```

The main Session independently reran strict TypeScript, the 32-test bounded
suite, the public import smoke, the corrected authoritative Run verifier and
the 3-test public fixture suite. It also reran the original dangling-junction
and Windows case-alias counterexamples; both were rejected by the corrected
policy. During baseline staging, the main Session observed
`core.autocrlf=true`; because V0-A identities bind exact bytes, it added a
root `.gitattributes` rule limited to `workbench/**` and the formal fixture,
both with `text eol=lf`. This preserves the accepted instruction and tree
digests across future checkouts without changing runtime logic.

This addendum supersedes the pending-review status inside the dedicated
Session's Section 13 proposal. The applied final control state is recorded in
`CURRENT_STATE.md` and the formal V0-A Closeout.
