# V1-B Stage 1 Post-Audit Bounded Correction Prompt

```yaml
status: authorized_bounded_correction
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
owner: original_v1_b_stage_1_preparation_session
main_review_disposition: ACCEPT_AUDIT_FINDINGS_AND_REVISE_CANDIDATE
rejected_candidate_commit: 951e9161300eacd408e232aa6d1fa66ac02d0e10
rejected_candidate_tree: a9ad6eee8ae4cfe32ee3e9e04613a8d16e5296f6
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
accepted_findings:
  - V1B-AUD-F-001
  - V1B-AUD-F-002
credential_reads_authorized: 0
external_network_authorized: false
external_provider_calls_authorized: 0
real_model_calls_authorized: 0
git_commit_authorized: false
control_state_edit_authorized: false
stage_2_authorized: false
```

## 1. Role and stop point

You are the original V1-B Stage 1 Preparation Session. Main Session has completed
a limited review of the fresh focused independent audit and accepts both P1
findings as valid Contract-scoped defects.

Perform only the bounded correction and regressions in this prompt. Do not accept
V1-B, create a Candidate or Execution Baseline commit, edit control state, read a
credential, access the network, call a Provider/model, or enter Stage 2. Return
the corrected reports/evidence and stop for Main Session review.

## 2. Required reading and identity Gate

Read before editing:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V1_VERSION_CHARTER.md`;
4. `docs/第二项目_Codex交接包_2026-07-30/09_对接执行、文件权威与验收规则.md`;
5. `docs/第二项目_Codex交接包_2026-07-30/V1_B_GOAL_CONTRACT.md`, especially
   Sections 4, 6, 7.4, 11, 12, 14, 15 and 19;
6. `docs/reports/V1_B_STAGE1_IMPLEMENTATION_REPORT.md`;
7. `docs/reports/V1_B_STAGE1_CLOSEOUT_DRAFT.md`;
8. `docs/reports/V1_B_STAGE1_MAIN_REVIEW_BOUNDED_CORRECTION_PROMPT.md`;
9. audit prompt in the Main checkout:
   `D:/AI/AI_Projects/project2/docs/reports/V1_B_STAGE1_FOCUSED_INDEPENDENT_AUDIT_PROMPT.md`;
10. audit report, read-only:
    `C:/Users/HUAWEI/.codex/worktrees/d3c0/project2/docs/reports/V1_B_STAGE1_FOCUSED_INDEPENDENT_AUDIT_REPORT.md`;
11. audit-local counterexample evidence, read-only:
    `C:/Users/HUAWEI/.codex/worktrees/d3c0/project2/.runs/v1-b/audit/`.

Before any edit verify and record:

- current worktree path is
  `C:/Users/HUAWEI/.codex/worktrees/28be/project2`;
- `HEAD` is exact rejected Candidate
  `951e9161300eacd408e232aa6d1fa66ac02d0e10`;
- `HEAD^{tree}` is
  `a9ad6eee8ae4cfe32ee3e9e04613a8d16e5296f6`;
- tracked and staged state are clean before this prompt file is considered;
- Pi is exact `027a5847901b5dde30270abaa1041046cd2b4b55`
  and clean;
- real access counters remain `0 / 0 / 0 / 0`.

If identity differs, an allowlisted source outside the Candidate is already
modified, or Pi is not exact/clean, stop with a Pause Report.

## 3. Binding correction A — final Workspace byte safety

Close `V1B-AUD-F-001` without building a general artifact platform.

Required behavior:

1. Before valid terminal evidence is committed, the producer must scan every
   regular file byte in the final copied Workspace using the accepted
   secret/reasoning marker rules.
2. Traversal must remain inside the final Workspace, be deterministic and fail
   closed on symlink/junction/reparse/path escape or unsupported file entry.
3. A forbidden marker in final Workspace bytes must result in a typed pause or
   rejection. It must not produce a valid terminal with `secret_scan.passed`.
4. The read-only Inspector must independently traverse and scan the final
   Workspace bytes. Rebinding `final_workspace_digest` after inserting a marker
   must still produce `integrity_valid: false`.
5. Preserve explicit final Workspace path/tree identity. Prefer one bounded,
   typed Workspace-tree reference plus recursive validation; do not enumerate
   every Workspace file as a general-purpose ArtifactRef inventory unless the
   simpler path-safe tree reference cannot satisfy the Contract.
6. Clean final Workspaces must continue to pass. Existing protected-path,
   digest, ArtifactRef and F-001/F-002 checks must not weaken.

Required tests:

- producer-side forbidden Workspace marker cannot terminalize as valid;
- coherent Workspace-byte mutation plus digest rebind is rejected by Inspector;
- clean Workspace positive case;
- path-link/escape failure remains fail closed;
- existing F-001/F-002 and relevant V0 evidence regressions.

## 4. Binding correction B — tracked real `run-next` composition

Close `V1B-AUD-F-002` through the exact tracked product surface. Do not use an
untracked Stage 2 wrapper and do not make the Manifest alone sufficient to start
real execution.

Required behavior:

1. The tracked V1-B CLI must have an explicit Stage-2-only execution-authority
   input for `run-next` (a narrowly named CLI switch is recommended).
2. Real execution requires both:
   - a valid frozen `stage2_real` Manifest; and
   - the explicit CLI execution-authority input.
3. Stage 1 Manifest + real switch must fail closed. Real Manifest without the
   switch must fail closed before a cell becomes `started`.
4. With the switch, the tracked CLI must construct the existing concrete
   public-Pi `OneRunProviderAuthorityV1B`/`PiRunHandleV1` composition for exactly
   the unique next cell.
5. Credential identity remains fixed to `DEEPSEEK_API_KEY`. The CLI may construct
   a lazy opaque resolver, but must not read the value during parsing, preflight,
   Manifest validation, Pilot initialization or authority construction.
6. The credential value may be resolved only inside the already-authorized Run,
   immediately before the first Provider dispatch. It must never be logged,
   serialized, hashed, measured or included in errors/evidence.
7. Missing/denied authority or credential identity must fail closed with a
   sanitized boundary error and zero network/Provider/model dispatch.
8. One Run authority cannot open a second Run. The ledger/Manifest still chooses
   exactly one next cell; no fallback, retry or replacement is added.
9. Move or add mode/dependency validation so absence of real composition cannot
   initialize/advance a real Pilot as if execution had begun.
10. Do not change the fixed Provider/model profile, tasks, Skill, Verifier,
    protocol, taxonomy, denominator or budgets.

Required zero-call tests through the tracked CLI/product surface:

- valid real Manifest without explicit authority fails before `started`;
- Stage 1 Manifest with real authority input is rejected;
- explicit authority reaches a fake/denied concrete real composition rather
  than `real execution dependencies are unavailable`;
- resolver remains lazy and credential/network/Provider/model counters remain
  zero in every Stage 1/correction test;
- one-use Run authority and sanitized denied/missing resolver behavior;
- no untracked wrapper is required for a future no-source-edit Stage 2 Session;
- full V1-B focused suite and required V1-A/V0-C regressions.

Do not make a real request to prove this correction.

## 5. Authorized paths

Only the existing Contract Section 6.2 allowlist may be changed. The expected
minimal subset is:

```text
workbench/src/run-v1.ts
workbench/src/inspect-v1.ts
workbench/src/product-surface-v1.ts
workbench/src/cli.ts
workbench/src/provider/fixed-provider-v1.ts          # only if required
workbench/src/pilot-v1.ts                            # only if required
workbench/src/contracts/v1-types.ts                  # only if required
workbench/tests/v1b-stage1.test.ts
workbench/tests/v1b-cli.test.ts
workbench/README.md                                  # only bounded CLI semantics
docs/reports/V1_B_STAGE1_*
.runs/v1-b/stage1/**                                 # ignored correction evidence
```

Task, Skill, System Prompt, Tool, Verifier and accepted V1-A/V0 source remain
read-only. Do not modify Pi, `reference/`, `CURRENT_STATE.md`, the formal
Contract, Charter, governance files, Git index/history or dependency state.

## 6. Verification and evidence

Run the narrowest commands that prove the two findings plus required regressions:

1. strict TypeScript;
2. V1-B focused Stage 1/CLI tests;
3. required V1-A and V0-C evidence/real-route regressions sequentially;
4. a new 24-cell zero-call authoritative simulation only if source identity or
   terminal/evidence semantics changed—which they do here—preserving old
   evidence as superseded rather than overwriting it;
5. all secret/credential/network/Provider/model counters remain zero;
6. source inventory/delta and Windows identity checks required by the Contract.

Do not rerun broad unrelated suites. Record commands, working directories, exit
codes, incidents and exact evidence paths.

## 7. Deliverables and stop

Update or create only the bounded Stage 1 deliverables:

- `docs/reports/V1_B_STAGE1_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V1_B_STAGE1_CLOSEOUT_DRAFT.md`;
- correction Evidence Index;
- source inventory and source delta;
- commands and exit codes;
- finding-closure matrix for `V1B-AUD-F-001` and `V1B-AUD-F-002`;
- `CURRENT_STATE_UPDATE_PROPOSAL` inside the report/Closeout Draft.

The proposal must state that the first Candidate remains rejected and that any
corrected Candidate/audit decision belongs to Main Session. Do not edit
`CURRENT_STATE.md` itself.

After verification, stop and report to Main Session. Do not commit, start a new
audit, create an Execution Baseline, read credentials, contact the network or
enter Stage 2.

## 8. Pause conditions

Stop immediately if:

- either finding requires a path outside Contract Section 6.2;
- a V0 accepted source, frozen task/Skill/Verifier/System Prompt or Pi change is
  required;
- the tracked CLI cannot carry explicit real authority without changing the
  accepted protocol or credential boundary;
- recursive Workspace scanning requires a general artifact/database platform;
- a credential value, network access or real call is needed for validation;
- a new non-local defect appears that changes the correction or audit scope.

Return a bounded Pause Report with evidence and options; do not choose an
architecture fork silently.
