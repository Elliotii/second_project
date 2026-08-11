# V3.6 Goal 2 Closeout Draft

```yaml
status: DRAFT_PENDING_MAIN_REVIEW
goal_id: V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_PRODUCT_ACCEPTANCE
control_baseline_commit: 992f721c4f05b7c78761966c7b8f79a6b4b3a2d3
control_baseline_tree: be96881831af1355cabdf4ffb0a617ed2bc35159
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
implementation_owner: dedicated_top_level_goal_2_session
acceptance_owner: Main_Session
recommended_deterministic_result: PASS_V3_6_G2_DETERMINISTIC_IMPLEMENTATION_PENDING_MAIN_REVIEW
real_two_turn_journey: not_executed
```

## Draft disposition

**Fact:** The bounded deterministic implementation satisfies the Goal 2 Contract deliverables and acceptance cases without changing Pi Core, adding a fallback/backend, reading a Credential, calling an external Provider/model, or performing the real Journey.

**Recommendation:** Main should review the single implementation commit, Implementation Report and ignored Evidence Index. If Main accepts the deterministic substrate, it may create the exact Execution Baseline and hand the frozen real two-Turn Journey to the separately authorized fresh no-source-edit Session. Goal 2 and V3.6 remain open until Main/user complete that governance and acceptance decision.

## Deterministic Definition of Done

| Contract acceptance | Draft result | Evidence |
|---|---|---|
| missing/wrong backend context/version/profile/image/digest fails closed; no fallback | PASS | frozen-validator and missing-backend tests |
| exact Docker argv/profile/Authority and `--pull never` | PASS | executor source plus success Authority/terminal |
| one canonical link-free managed mount; sensitive mounts absent | PASS | managed inventory rejection and inspected mount count/profile |
| network/read-only/tmpfs/non-root/capability/privilege/resource limits | PASS | live inspected terminal profile |
| stdout/stderr/exit/nonzero/truncation mapping | PASS | success and nonzero/truncation terminals |
| timeout kills descendants and removes exact container | PASS | 30-second timeout terminal; post-suite listing empty |
| registered command ID cannot inject Host execution authority | PASS | exact browser/tool schemas and Host descriptor lookup |
| immutable add/modify/delete ChangeSet and bounded Diff | PASS | focused ChangeSet test and integrated flow |
| exact after blobs apply against unchanged preimages | PASS | focused Apply test and successful Apply marker |
| stale/collision/protected/scope/traversal/reparse/hardlink/tamper reject | PASS | focused fail-closed variants |
| Discard and Export do not mutate Source | PASS | focused handoff test |
| partial failure preserves truthful recovery material | PASS | injected partial receipt indexed by digest |
| second Apply and post-Apply continuation reject | PASS | focused and integrated tests |
| safe API/UI explains authority/backend/state/files/changes/handoff | PASS | integrated loopback test and bilingual static assertions |
| strict TypeScript and affected regressions | PASS | 74 total passing tests; strict typecheck exit 0 |
| Pi pinned/clean and secret scan clean | PASS pending final commit identity | Gate A/final checks; scan result in Implementation Report/handoff |

## Verified scope

**Fact:** The Candidate provides one frozen Docker registered-command executor, immutable terminal evidence, bounded managed-copy edits, initial/final inventories, immutable content-addressed ChangeSets, safe Files/Changes/Diff/backend views, Host-only Apply All/Discard/Export, truthful partial-apply recovery, one-successful-Apply Session terminal semantics, additive bilingual WebUI, and the frozen dependency-free fixture.

**Fact:** Final deterministic verification is 10/10 Goal 2 tests plus 64/64 affected V3/V3.5/Post-V3.5 regressions. The post-suite Docker container query returned no Goal containers.

## Unverified and deferred

**Unconfirmed:** No real Provider/model call was made, so the frozen two-Turn product Journey and real-model continuation/product acceptance remain unverified.

**Fact:** This Goal does not claim general sandbox security, external-network security beyond the exact Docker `network none` profile, multi-file atomic Apply, crash recovery, exactly-once Tool effects, multiple backends, Host fallback, Pi Core change, general coding effectiveness or V4 authority.

## Deliverables

- `docs/reports/V3_6_G2_IMPLEMENTATION_REPORT.md`
- this `docs/reports/V3_6_G2_CLOSEOUT_DRAFT.md`
- ignored `.runs/v3-6/g2/evidence-index.json`
- ignored `.runs/v3-6/g2/verification-summary.json`
- one bounded implementation commit and its exact commit/tree in the Session handoff
- structured `CURRENT_STATE_UPDATE_PROPOSAL` in the Implementation Report

## Stop point

This dedicated Implementation Session stops after returning the one commit and materials above. It does not edit `CURRENT_STATE.md`, accept Goal 2/V3.6, create an Execution Baseline, read Credential, call a model or start the real Journey.
