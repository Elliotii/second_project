# V0-A Closeout

```yaml
goal_id: V0_A_CONTRACTS_PREFLIGHT_WORKSPACE_PI_ADAPTER
closeout_status: closed_accepted
accepted_disposition: PASS_V0_A_FOUNDATION
accepted_by_main_session: true
accepted_by_user: 2026-07-31
control_baseline_commit: b6bfef1ceb796b822c1faf23ae43a04bcd1bd69b
implementation_baseline_commit: resulting_HEAD_of_this_revision
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_core_patch_count: 0
real_model_calls: 0
formal_outcome: null
```

## Closeout summary

**Fact.** The bounded main-review correction is complete. The dangling
junction bypass, Windows case-only scope alias, and linked source-root
boundary are corrected in the project Wrapper and covered by explicit policy
tests. All Gates A–G and all 20 Definition-of-Done items are recommended
PASS against the corrected evidence.

The dedicated Goal Session did not self-accept. The main Session independently
reviewed the corrected source and evidence, reran the bounded verification
commands and original counterexamples, and accepted the technical result. The
user formally accepted `PASS_V0_A_FOUNDATION` on 2026-07-31 and authorized
this control closeout and Implementation Baseline Commit.

## Authoritative execution

```yaml
run_id: run-5c0b157e-31d7-4873-95a1-fd284377ace3
attempt_id: attempt-ab6cb85f-8e32-48c3-8209-98c6b085a253
session_id: session-31e30722-5e54-449d-94be-926ffd7ddae8
workspace_id: workspace-b7249f6c-ef0f-4dbe-9760-82097bbf9bad
status: settled
foundation_acceptance: passed
external_provider_calls: 0
changed_paths:
  - src/parse-duration.ts
protected_files_unchanged: true
hardlink_pairs: 0
formal_outcome: null
```

The former authoritative
`run-9f71d3cd-af00-4c85-97e0-884587ee7a14` is retained intact and marked
`superseded_due_main_review_path_security_correction`. Only
`run-5c0b157e-31d7-4873-95a1-fd284377ace3` is authoritative for the corrected
source.

## Verification

| Check | Result |
|---|---|
| strict TypeScript | exit 0 |
| `node --test workbench/test` | 32 pass, 0 fail, 0 skipped |
| zero-side-effect dry-run | exit 0; canonical; formal roots unchanged |
| corrected formal CLI run | exit 0; settled; acceptance passed |
| independent final-run verifier | exit 0 |
| independent public test | 3 pass, 0 fail |
| public emitted Pi import | exit 0 |
| private/G006 imports | 0 matches |
| credential/network/out-of-scope scans | 0 matches |
| Pi Core/reference status | pinned and clean |
| root tracked/staged control diff | empty |

Exact correction commands, cwd values, outputs, and exit codes are retained
under `.runs/v0-a/evidence/`.

## Corrected source identity

```yaml
workbench_file_count: 24
workbench_tree_digest: 4ba620c14074a4ec96989f1aa670bbad612ab5714ea102a4564813c19d743c6e
fixture_file_count: 5
fixture_full_tree_digest: 07c35b8eee38d052fd9d4c1b36a316fec0a9f5a7126b73a33e6c2c1320e0dfff
fixture_logical_workspace_digest: 83e14ee6480099d479faa392fb9dc5eb1db6e5e860b93702289ef20ca2cc3e0c
config_digest: c9892f25c5454d33f421a6f6d07a575f37af53ca3fc993ea15bb0b8dc7855520
```

The complete corrected inventory and Source Delta are:

- `.runs/v0-a/evidence/source-inventory-main-review-correction.json`;
- `.runs/v0-a/evidence/source-delta-main-review-correction.json`.

The previous inventory remains preserved as pre-correction evidence.

## Scope and claim boundary

**Fact.** No Pi Core, formal fixture, Contract, `CURRENT_STATE.md`, or other
control file was modified. No dependency was installed or downloaded; no
Git stage, commit, push, reset, checkout, or clean was performed; no real
model or external Provider was called.

**Fact.** No raw shell or explicit network command ID is exposed to the
Agent. Task descriptors and Agent arguments are bounded. The formal Faux Run
recorded zero external Provider calls.

**Fact.** V0-A has no OS Sandbox and does not prove system-level network
egress is blocked for arbitrary Agent-executed code.

**Fact.** V0-B Session persistence, Journal, general Verifier/Outcome,
Recovery, later versions, and a general Windows filesystem security platform
remain outside scope and unimplemented.

## Remaining limitations

**Fact.** Main-session and user acceptance are complete. The implementation
baseline is the resulting revision containing this Closeout, the accepted
source inventory and the formal control-state changes.

**Fact.** Baseline staging observed `core.autocrlf=true`. Because the accepted
Task instruction and source identities are byte-addressed, the main Session
added `.gitattributes` rules scoped only to `workbench/**` and
`fixtures/tasks/v0-a-parse-duration/**`, both using `text eol=lf`. This
prevents a future checkout from invalidating the accepted digests; it does not
change Workbench behavior or the 24-file Workbench source identity.

**Unconfirmed.** A Windows file-symlink specimen was not created without
elevation. Actual live and dangling Windows junctions exercise the Node
`lstat` link rejection branch. No broader OS reparse-tag guarantee is claimed.

## Final control disposition

```yaml
active_goal: null
V0_A:
  status: closed_accepted
  disposition: PASS_V0_A_FOUNDATION
  authoritative_run_id: run-5c0b157e-31d7-4873-95a1-fd284377ace3
  workbench_tree_digest: 4ba620c14074a4ec96989f1aa670bbad612ab5714ea102a4564813c19d743c6e
  implementation_baseline_commit: resulting_HEAD_of_this_revision
V0_B:
  status: candidate_contract_not_created_not_authorized
```

The structured proposal in Section 13 of
`docs/reports/V0_A_IMPLEMENTATION_REPORT.md` was advisory input from the
dedicated Session. The main Session applied the accepted facts with the
post-review status above; no V0-B execution authority follows from this
Closeout.
