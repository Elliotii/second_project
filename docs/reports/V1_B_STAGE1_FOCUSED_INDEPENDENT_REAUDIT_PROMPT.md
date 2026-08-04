# V1-B Stage 1 Focused Independent Re-audit Prompt

```yaml
status: authorized_focused_reaudit
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
session_role: original_independent_audit_session_focused_reaudit
rejected_candidate_commit: 951e9161300eacd408e232aa6d1fa66ac02d0e10
corrected_candidate_commit: a11690e5827d9d540b731156799566bea21c689e
corrected_candidate_tree: 282c4dc93d31131fa0b20fc70c48831409664eee
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
corrected_manifest_id: be258f6f62276436fef65a44459d70611749043b9dc2d25ec134a0e7abc1055d
corrected_workbench_source_digest: ef30c4be9bc4143569f30aabbb66b2a01db9b2098082f35dba2137f3acb22ffe
findings_under_reaudit:
  - V1B-AUD-F-001
  - V1B-AUD-F-002
credential_reads_authorized: 0
external_network_authorized: false
external_provider_calls_authorized: 0
real_model_calls_authorized: 0
source_repair_authorized: false
git_commit_authorized: false
control_state_edit_authorized: false
stage_2_authorized: false
```

## 1. Role and scope

You are the same independent Audit Session that authored the first focused audit.
You remain independent from implementation and must not repair source. Main
Session accepted both original P1 findings, returned them to the original Stage
1 Preparation Session, narrowly reviewed the correction and froze the exact
corrected Candidate above.

Perform only a focused re-audit of `V1B-AUD-F-001`, `V1B-AUD-F-002` and the
required regressions. Do not reopen F-003鈥揊-005 or general Pi/V0/Windows/SDK/
Extension scope unless new concrete non-local evidence proves the correction
changed one of those boundaries.

## 2. Required reading

Read:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/绗簩椤圭洰_Codex浜ゆ帴鍖卂2026-07-30/V1_VERSION_CHARTER.md`;
4. `docs/绗簩椤圭洰_Codex浜ゆ帴鍖卂2026-07-30/09_瀵规帴鎵ц銆佹枃浠舵潈濞佷笌楠屾敹瑙勫垯.md`;
5. `docs/绗簩椤圭洰_Codex浜ゆ帴鍖卂2026-07-30/V1_B_GOAL_CONTRACT.md`, especially
   Sections 6, 7.4, 11鈥?5 and 19;
6. `docs/reports/V1_B_STAGE1_FOCUSED_INDEPENDENT_AUDIT_PROMPT.md` from the Main
   checkout, read-only;
7. your original
   `docs/reports/V1_B_STAGE1_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`;
8. `docs/reports/V1_B_STAGE1_POST_AUDIT_BOUNDED_CORRECTION_PROMPT.md`;
9. `docs/reports/V1_B_STAGE1_MAIN_REREVIEW_MICRO_CORRECTION_PROMPT.md`;
10. corrected `V1_B_STAGE1_IMPLEMENTATION_REPORT.md` and
    `V1_B_STAGE1_CLOSEOUT_DRAFT.md`;
11. corrected source/tests and rejected-vs-corrected Git diff;
12. original audit-local counterexamples under `.runs/v1-b/audit/`, preserved
    read-only except for a distinct re-audit evidence subtree.

The formal Goal ID is `V1_B_FROZEN_BOUNDED_REAL_PILOT`. The shortened Goal ID in
the first Audit Report was a non-material report-label error; use the formal ID
in the re-audit report.

## 3. Gate A

Before inspection or tests verify and record:

- audit worktree is
  `C:/Users/HUAWEI/.codex/worktrees/d3c0/project2`;
- exact `HEAD` and `HEAD^{tree}` match the corrected Candidate above;
- tracked and staged state are clean; the first Audit Report and this Prompt are
  known untracked audit documents only;
- rejected Candidate is the direct parent/history basis expected by Main;
- Pi is exact and clean;
- corrected Manifest ID/source digest independently recompute exactly;
- `reference/` is untouched;
- credential/network/Provider/model accounting starts at `0 / 0 / 0 / 0`.

Stop on any identity mismatch.

## 4. F-001 focused re-audit

Independently verify both producer and Inspector boundaries:

1. inspect the corrected path-safe Workspace-tree traversal and typed reference;
2. repeat the original coherent marker insertion plus digest/tree-reference
   rebind and require `integrity_valid: false`;
3. independently exercise producer-side forbidden-marker failure and require no
   valid terminal plus a fail-closed ledger state;
4. test clean Workspace positive behavior;
5. test at least the relevant junction/symlink/path escape case and confirm no
   traversal outside the final Workspace;
6. confirm protected paths, existing ArtifactRefs and F-001/F-002 persisted-byte
   checks were not weakened;
7. confirm no general artifact platform or unrelated source expansion entered.

## 5. F-002 focused re-audit

Independently verify the exact tracked product surface:

1. valid `stage2_real` Manifest without explicit CLI authority fails before
   Pilot initialization/`started`;
2. Stage 1 Manifest plus `--stage2-real-authority` fails before initialization;
3. valid real Manifest plus `--stage2-real-authority`, with child-process
   environment explicitly omitting `DEEPSEEK_API_KEY`, reaches the concrete
   public-Pi/one-Run composition, fails with sanitized
   `FixedProviderBoundaryErrorV1B`, performs no network/Provider/model dispatch,
   does not expose credential-shaped data and does not advance another cell;
4. resolver remains lazy before the first Provider request;
5. denied/missing resolver and second Run open fail closed;
6. no untracked wrapper is required;
7. no fallback/retry/replacement or protocol/profile drift was introduced.

Do not use any real credential or test with a real key.

## 6. Regressions and evidence

Run only:

- strict TypeScript;
- V1-B focused Stage 1/CLI suite, expected current count 19/19;
- required sequential V1-A/V0-C evidence/real-route regressions because F-001
  changed evidence traversal and F-002 changed the tracked real entry;
- independent inspection/aggregate replay over the corrected authoritative
  24-cell zero-call root in the exact corrected Preparation checkout:
  `C:/Users/HUAWEI/.codex/worktrees/28be/project2/.runs/v1-b/stage1/gate-h-pilot-authoritative-after-post-audit-correction`;
- independent re-audit counterexamples in a new ignored
  `.runs/v1-b/audit/reaudit-a11690e/**` subtree.

Do not rerun a broad platform audit. Reuse only pre-existing local dependencies;
do not install or download anything.

## 7. Deliverables and disposition

Create:

- `docs/reports/V1_B_STAGE1_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md`;
- ignored re-audit Evidence Index with exact Candidate/Pi/Manifest/source IDs;
- finding closure table for both original P1 findings;
- commands, working directories, exit codes and bounded incidents;
- zero credential/network/Provider/model accounting.

Allowed dispositions:

```text
PASS_FOCUSED_V1_B_STAGE1_REAUDIT
REVISE_V1_B_STAGE1_AFTER_REAUDIT
PAUSE_V1_B_STAGE1_REAUDIT
```

Do not edit the original Audit Report; preserve it as the rejected Candidate's
history. Do not repair source, modify control state, stage/commit, create an
Execution Baseline, read credentials, access the network or enter Stage 2.

After the report and evidence are complete, stop and return to Main Session.

## 8. Exit conditions

Stop immediately if:

- either original finding is not closed;
- correction introduced a new non-local P0/P1 boundary failure;
- identity/source/Manifest/Pi differs;
- a real credential, network call, Pi change or source repair is needed;
- the re-audit would need to expand into V2/V3 or a general platform review.

Report evidence and the minimum decision required; do not broaden or repair.
