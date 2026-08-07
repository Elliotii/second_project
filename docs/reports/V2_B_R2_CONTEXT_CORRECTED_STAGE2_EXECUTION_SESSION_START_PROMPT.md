# V2-B R2 Context-corrected Stage 2 Execution Session Start Prompt

```yaml
status: authorized_for_fresh_top_level_execution_session
date: 2026-08-07
goal_id: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
sequence_id: v2b-r2-real-20260807-02
execution_baseline_commit: 571165a186444e16a0fafad2fcd886295d7efbab
execution_baseline_tree: bb7245412093f132fec4236711e7bbda96d0a1c1
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
credential_reads: one_opaque_after_gate_h_only
external_network: authorized_after_gate_h_only
real_model_calls: contract_bounded_after_gate_h_only
per_attempt_cost_usd_max: 0.20
per_recovery_group_cost_usd_max: 0.60
aggregate_old_and_new_r2_cost_usd_max: 1.40
source_edit_authorized: false
git_stage_commit_push_authorized: false
final_v2_b_or_v2_acceptance_authorized: false
v3_authorized: false
```

## Role and objective

You are a fresh top-level no-source-edit V2-B R2 Execution Session. From the exact corrected audited
Execution Baseline, execute one new immutable sequence:

```text
Gate H-R2 at zero real access
→ controlled deterministic Seed
→ real A continue-failed-session
→ real B fresh-session-from-failure-seed
→ mandatory read-only Inspector
→ one real stable-format Negative
→ final read-only reconciliation
→ reports and stop for Main disposition
```

This sequence exists only because the user explicitly authorized one `context_message_count` correction
exception. The historical `v2b-r2-real-20260807-01` remains immutable and invalid for acceptance.

## Required reading

Read `AGENTS.md`, `CURRENT_STATE.md`, V2 Charter, V2-B Contract, R2 Amendment, the correction Prompt,
Correction Report, Main Narrow Review and Hit-specific Re-audit Report. Read the previous Stage 2
Pause/Execution reports only as immutable failure context if available; do not inspect or mutate old raw
outcome artifacts.

## Gate H-R2

Before any Credential resolution, network or Provider construction/dispatch, prove:

- exact HEAD/tree above and clean tracked/staged state;
- pinned Pi exact/clean and only audited public package loader use;
- Manifest rebuilt through the frozen CLI for sequence `v2b-r2-real-20260807-02` with exact source,
  fixture, Case, path, budget and identity fields;
- strict TypeScript and `workbench/tests/v2b-r2.test.ts` 8/8, zero skipped;
- mandatory Inspector/preflight valid and all new-sequence real counters zero;
- new sequence root absent.

Mechanical pre-access encoding/loader/path issues may be corrected without changing tracked source or
Manifest semantics. Any source/test/fixture/Verifier/Manifest semantic change is a hard stop.

## Real authority and execution

Only after Gate H passes, opaque-read the existing DeepSeek Credential without printing, returning,
hashing, comparing, measuring or persisting it. Run only the tracked CLI/product sequence controller.

- controlled Primary remains zero external calls and must settle, maintenance-pass, target-fail and
  freeze the Seed before Candidates;
- A and B each start once from identical Seed Workspace bytes and both terminalize;
- run mandatory Inspector after A/B; it must accept both composition artifacts before continuing;
- then run exactly one stable-format Negative; target Verifier must pass and no recovery object may exist;
- run final Inspector/reconciliation and preserve all write-once identities, usage, cost, Session,
  Workspace, Verifier and Selection evidence.

Do not retry, fallback, add a Case/path, change budgets, use a third path, edit source, or invoke the old
infrastructure replacement. Any new hard stop returns directly to Main.

The old sequence cost USD `0.0008409184` plus this sequence's actual cost must remain below USD `1.40`;
per-Attempt and Recovery Group caps remain USD `0.20` and `0.60`.

## Reports and stop

Create:

- `docs/reports/V2_B_R2_CONTEXT_CORRECTED_STAGE2_EXECUTION_REPORT.md`;
- a Pause Report only if a hard stop occurs.

Include exact identities, activation table, raw-to-derived counters/cost, Candidate/Negative outcomes,
Inspector output, source/Pi/secret boundary, commands/exits, claims boundary and a structured
`CURRENT_STATE_UPDATE_PROPOSAL`.

Do not modify control files, stage/commit, accept V2-B/V2 or enter V3. Stop for Main review.
