# Final Capstone Goal 1 Working Session Start Prompt

```yaml
prompt_status: prepared_not_launchable_until_main_fills_control_baseline
goal_id: FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
control_baseline_commit: MAIN_MUST_FILL_AFTER_USER_AUTHORIZATION
control_baseline_tree: MAIN_MUST_FILL_AFTER_USER_AUTHORIZATION
user_activation: REQUIRED_NOT_YET_GRANTED
```

> Do not start implementation from this draft Prompt. Main must first replace both baseline
> placeholders with exact 40-character Git identities and confirm explicit User activation.

You are the fresh top-level Working Session for Final Capstone Goal 1: Trusted Evidence
Admission. You implement only the accepted Goal 1 Contract. You do not redefine Final
Capstone, change Goal 2/3, accept the Goal, or enter the next Goal.

## Required read order

1. `CURRENT_STATE.md` at the exact Control Baseline.
2. `docs/第二项目_Codex交接包_2026-07-30/SECOND_PROJECT_FINAL_CAPSTONE_VERSION_CHARTER.md`.
3. `docs/第二项目_Codex交接包_2026-07-30/SECOND_PROJECT_FINAL_CAPSTONE_GOAL_1_CONTRACT.md`.
4. `docs/reports/SECOND_PROJECT_FINAL_CAPABILITY_GAP_REVIEW.md`.
5. `docs/reports/SECOND_PROJECT_FINAL_CAPABILITY_GAP_REVIEW_GOAL_AMENDMENT.md`.
6. `docs/reports/SECOND_PROJECT_FINAL_CAPSTONE_GOAL_1_READINESS_REPORT.md`.
7. Only the Contract-cited source/tests needed for implementation.

The Amendment controls any wording difference with the original Gap Review.

## Gate A — stop before edits unless every item passes

Record exact command output proving:

- `HEAD == CONTROL_BASELINE_COMMIT` and tree equals `CONTROL_BASELINE_TREE`;
- tracked and staged worktree are clean;
- any untracked file is enumerated, pre-existing and outside your allowed delta;
- Contract and Charter are present at the baseline;
- pinned Pi is exactly `027a5847901b5dde30270abaa1041046cd2b4b55`, clean and unmodified;
- existing local TypeScript/public emitted Pi resolution works without installation;
- Credential/network/external Provider/model/real-model counters are all zero.

If any identity differs, if the Prompt still contains placeholders, or if User activation is
not explicit, stop with `BLOCKED_GOAL_1_GATE_A` and make zero source changes.

## Objective

Build a minimal Host-controlled, fail-closed Evidence admission boundary:

```text
supported Inspector-valid source artifact
  -> frozen admission/provenance record
  -> FrozenEvidenceV3
  -> existing projectImprovementOpportunityV3
```

Support exactly:

1. V0-B/V0-C verifier-backed Run;
2. V2-A Recovery/Comparison Run; and
3. V3 Goal 3 bound-State follow-up Run.

Preserve State/version/binding identity in the admission record. A valid admission may
produce `no_opportunity`; do not change existing V3 trigger semantics.

## Allowed work

Follow the exact allowlist in Contract section 5. Prefer new modules importing existing
Inspectors and artifact/digest helpers. Create only:

- the narrow Goal 1 contract types;
- the Evidence admission implementation;
- the independent Goal 1 Inspector;
- one focused test file and only indispensable Goal 1 fixtures;
- ignored `.runs/final-capstone/g1/` test evidence;
- `docs/reports/FINAL_CAPSTONE_G1_IMPLEMENTATION_REPORT.md`; and
- `docs/reports/FINAL_CAPSTONE_G1_CLOSEOUT_DRAFT.md`.

Use `apply_patch` for tracked edits. Do not install dependencies.

## Non-negotiable prohibitions

- zero Credentials, external network, Provider/model and real-model calls;
- zero Pi edits, private imports or Runtime route changes;
- no edit to existing accepted V0–V3.6 source unless the Contract's stop-and-return rule is used;
- no `CURRENT_STATE.md`, `AGENTS.md`, Charter, Contract, Gap Review, Amendment, Case Audit,
  accepted Closeout or historical evidence edit;
- no Candidate generation, comparator, promotion, rollback, active pointer, V3.6 daily
  eligibility, Session/Workspace/Runtime, ChangeSet or Apply change;
- no generic adapter/Verifier platform, CLI/WebUI integration, mining, clustering or DB;
- no staging, Git commit, branch integration, Goal acceptance or Goal 2 work.

Do not copy unavailable historical evidence out of prose reports. Missing raw bytes fail closed.

## Required verification

Run the exact Gate B–E matrix from the Contract. At minimum the final commands are:

```powershell
& 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.json --noEmit
node --test tests/final-capstone-g1-evidence-admission.test.ts
node --test tests/v3g1-evidence-to-candidate.test.ts
node --test tests/v3g2-validate-promote-reject-rollback.test.ts
node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts
```

If the absolute TypeScript path is unavailable in your fresh worktree, use only an existing
local equivalent after recording its identity. Do not hydrate or install anything.

Required negative proof includes tamper, missing Verifier, invalid/nonterminal/unclosed
lineage, ambiguous State, cross-project/path/link/hardlink, stale identity, unknown family,
unknown key, digest mutation, browser/Agent eligibility escalation and ordinary V3.6 daily
evidence remaining ineligible.

## Required handoff

Return:

1. exact Gate A identities and zero-access counters;
2. complete source delta by file and symbol;
3. exact commands, exit codes and test counts;
4. positive admission IDs/digests and Inspector results;
5. the negative-test matrix;
6. remaining unverified items and claim limits;
7. `FINAL_CAPSTONE_G1_IMPLEMENTATION_REPORT.md`;
8. `FINAL_CAPSTONE_G1_CLOSEOUT_DRAFT.md`; and
9. a structured `CURRENT_STATE_UPDATE_PROPOSAL` in the report only.

Then stop. Do not commit and do not continue into Goal 2.

If a Contract stop condition occurs, return exactly:

```text
DECISION_REQUIRED
- blocked requirement
- conflicting repository fact or symbol
- why the current Contract cannot safely proceed
- smallest Main/User decision required
```
