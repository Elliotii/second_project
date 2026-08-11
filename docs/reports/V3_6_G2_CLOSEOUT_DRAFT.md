# V3.6 Goal 2 Closeout Draft

```yaml
status: DRAFT_CORRECTED_PENDING_MAIN_REVIEW
goal_id: V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_PRODUCT_ACCEPTANCE
control_baseline_commit: 992f721c4f05b7c78761966c7b8f79a6b4b3a2d3
initial_implementation_commit: 20dbe4c11aa5b1a64d75dfa63b6893536adb021f
correction_parent_commit: 20dbe4c11aa5b1a64d75dfa63b6893536adb021f
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
implementation_owner: dedicated_top_level_goal_2_session
acceptance_owner: Main_Session
recommended_deterministic_result: PASS_V3_6_G2_CORRECTED_DETERMINISTIC_IMPLEMENTATION_PENDING_MAIN_REVIEW
real_two_turn_journey: not_executed
```

## Draft disposition

**Fact:** The corrected deterministic implementation resolves all four findings from Main's bounded review: current-head/safe-integrity binding, final-response budget enforcement, ambiguous Docker-create cleanup, and a tracked frozen product composition entry.

**Fact:** It does so with zero Credential reads, external Provider/model calls and real-model calls; no Pi/control changes; no alternate image/backend; and no real Journey.

**Recommendation:** Main should review the corrected Candidate, this Draft, the Implementation Report and the correction Evidence Index. Goal 2/V3.6 remain open until Main/user complete the governed acceptance and real-Journey decisions.

## Deterministic Definition of Done

| Contract acceptance | Draft result | Corrected evidence |
|---|---|---|
| exact current managed head required for Apply All/Discard | PASS | two-ChangeSet stale selection rejects both with zero Source mutation |
| historical immutable Export remains non-mutating | PASS | stale-selection test exports older valid ChangeSet |
| safe receipt, before-blob and successful-marker integrity | PASS | tamper tests plus integrated post-Apply continuation projection |
| final assistant token/cost overrun cannot settle a Manifest | PASS | independent Faux token/cost overrun tests; no `manifest.json` |
| Provider-request and Tool caps preserved | PASS | bounded Session implementation and regressions |
| ambiguous create failure/timeout reconciled by exact name | PASS | injected Host-only seam test and indexed terminal |
| live frozen Docker profile, `--pull never`, `--network none` | PASS | live success/nonzero/timeout tests |
| zero remaining `v36g2-*` containers | PASS | exact final Docker listing empty |
| tracked no-source-edit product entry is ready | PASS | source/CLI plus zero-call preflight test and projection |
| fixed fixture, command, prompts, budgets, no retry/fallback/replacement | PASS | frozen exported constants and preflight validation |
| Apply gated by valid non-empty current ChangeSet and verifier pass | PASS | product composition entry |
| no real authority means zero identity/Credential/network/model/Source effects | PASS | focused spies, absent runtime roots, unchanged Source |
| truthful partial-Apply recovery without crash claim | PASS | recovery blobs + caught-failure receipt; limitation explicit |
| strict TypeScript and affected regressions | PASS | 79 passed, 0 failed/skipped; typecheck exit 0 |
| Pi pinned/clean and secret scan clean | PASS pending final commit identity | final checks in Implementation Report/session handoff |

## Verified scope

The Candidate provides the frozen single Docker registered-command executor; immutable backend evidence; bounded managed-copy edits; authenticated initial/final inventories and content-addressed ChangeSets; safe Files/Changes/Diff/backend views; Host-only Apply All/Discard/Export; truthful caught partial-apply recovery material; one-successful-Apply Session terminal semantics; additive bilingual WebUI; the representative dependency-free fixture; and the tracked frozen product entry for the later no-source-edit Execution Session.

Final deterministic verification is **15/15 Goal 2 tests plus 64/64 affected V3/V3.5/Post-V3.5 regressions**. The exact image remained local, was never pulled, and every live test container used `--network none`.

## Unverified and deferred

**Unconfirmed:** The real two-Turn product Journey, external Provider behavior and real-model continuation/product acceptance remain unexecuted.

**Fact:** Process-crash recovery is unproven. Recovery blobs exist before mutation and a truthful journal/receipt is persisted after a caught failure, but no pre-mutation write-once Apply plan exists. Multi-file atomicity, automatic rollback and exactly-once Tool effects are not claimed.

**Fact:** General sandbox security, multiple backends, Host fallback, Pi Core change, production multi-user isolation, general coding effectiveness and V4 authority remain outside scope.

## Deliverables

- `docs/reports/V3_6_G2_IMPLEMENTATION_REPORT.md`;
- this `docs/reports/V3_6_G2_CLOSEOUT_DRAFT.md`;
- ignored `.runs/v3-6/g2/correction/evidence-index.json`, SHA-256 `cd15b0f442cdfa1c9c69666d8137828e091f0539c0bf068cbaafebd50f1db3fa`;
- ignored correction Gate, zero-call product preflight and verification summary;
- one correction commit atop `20dbe4c11aa5b1a64d75dfa63b6893536adb021f`, with exact commit/tree in the Session handoff;
- structured `CURRENT_STATE_UPDATE_PROPOSAL` in the Implementation Report.

## Stop point

This dedicated Implementation Session stops after returning the single correction commit and materials. It does not edit `CURRENT_STATE.md`, accept Goal 2/V3.6, create an Execution Baseline, read Credential, call a model or start the real Journey.
