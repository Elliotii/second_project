# V3.5 Goal 1 Closeout

```yaml
date: 2026-08-08
goal_id: V3_5_G1_PERSISTENT_SESSION_RUN_FOUNDATION
status: closed_accepted
disposition: PASS_V3_5_G1_PERSISTENT_SESSION_RUN_FOUNDATION
authority: docs/第二项目_Codex交接包_2026-07-30/V3_5_CHARTER.md
control_baseline_commit: 745847d3f9e9579ea98a2d64c657b4c9d3ee91d1
implementation_commit: 4122b3cb88c2e35b946e4129d5977c0fdb2c7309
bounded_correction_commit: 0b62fb7447c76373fab1a4e26df15f29dd72dfa5
implementation_owner: top_level_session_019fde3d-d9c0-78b3-a5e3-0b4da427ab31
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
pi_core_patches: 0
private_pi_imports: 0
```

## Accepted result

**Fact.** Public Pi `JsonlSessionRepo` and direct public `AgentHarness` now support the
bounded V3.5 product path:

```text
Process A
→ persistent Pi JSONL Session
→ settled Tool call/result turn
→ immutable linked Run A
→ process exit

Process B
→ list/open the same Session
→ reconstruct the prior context
→ settled continuation turn
→ immutable linked Run B
```

The Session remains conversation/context authority. Run manifests remain execution and
evaluation authority. `catalog-v1.json` is only project-local navigation metadata and is
cross-checked against both authorities during inspection.

The safe read plane exposes bounded user/assistant text, Tool identity/result projection,
Run history and source references. It removes private reasoning/signatures, raw Tool
arguments, credential-like material, unsafe provider payloads and absolute filesystem
paths. Current V2 recovery, V3 prompt-adaptation and legacy partial evidence can be
projected without migrating or overwriting historical facts.

## Main review and bounded correction

Main verified the implementation commit and directly exercised
`readV2RecoveryComparisonV35` against the accepted V2 R2 substrate
`v2b-r2-real-20260807-02`; both Candidate IDs and selected Candidate A were recovered
correctly.

Main also reproduced one concrete filesystem-boundary defect: an intermediate Windows
directory junction below a Read Model source root could expose an ordinary file outside
that root. The original Goal 1 Session fixed only that defect in
`0b62fb7447c76373fab1a4e26df15f29dd72dfa5`. The corrected resolver walks all existing
segments, rejects symlink/junction/reparse paths, canonicalizes the final ordinary file
and requires canonical containment. A real, non-skipped Windows junction regression now
covers both intermediate and final reparse paths.

This was an ordinary bounded implementation defect. No Independent Audit, R1/R2,
replacement Session or architecture change was needed.

## Exit Criteria

| Criterion | Result |
|---|---|
| distinct Process A / Process B settled reopen and continuation | PASS |
| prior context reconstructed and provider-observed digest matched | PASS |
| Session↔Run bidirectional linkage with separated authority | PASS |
| safe conversation/Tool/Run projection | PASS after bounded path correction |
| corrupt, missing, cross-project, Workspace mismatch and path escape fail closed | PASS |
| bounded V2/V3/legacy adapters and explicit unavailable facts | PASS |
| strict TypeScript | PASS |
| Goal-focused tests | 6 passed, 0 failed, 0 skipped |
| affected V0–V3 regressions | 43 passed, 0 failed, 0 skipped |
| Credential/network/Provider/model access | 0 / 0 / 0 / 0 |
| Pi patch/private import | 0 / 0; pinned Pi clean |

Exact commands, generated evidence identities and Source Delta are recorded in
`docs/reports/V3_5_G1_IMPLEMENTATION_REPORT.md`.

## Preserved limitations

- The claim is settled deterministic/Faux restart and continuation, not external-model
  continuation.
- In-flight crash recovery, crash-after-side-effect reconciliation and exactly-once Tool
  semantics remain unimplemented.
- The catalog is a single-writer JSON navigation index, not a database or transaction
  system.
- A missing or corrupt catalog currently fails closed. An automatic catalog rebuild
  command is not implemented and remains a non-blocking productization follow-up.
- Historical adapters are bounded projections, not a full V0–V3 migration/backfill.
- No Goal 2 adaptive-Skill comparison, Goal 3 API/WebUI, realtime streaming, Pi
  Extension/SDK/RPC switch or new adaptive authority was implemented.

## Final disposition

Main formally accepts Goal 1 under the user-preauthorized acceptance envelope:

`PASS_V3_5_G1_PERSISTENT_SESSION_RUN_FOUNDATION`

V3.5 remains open. `active_goal` is `null`. Goal 2 has only a short Case Contract draft
pending user review; its implementation, real access and execution are not authorized.
