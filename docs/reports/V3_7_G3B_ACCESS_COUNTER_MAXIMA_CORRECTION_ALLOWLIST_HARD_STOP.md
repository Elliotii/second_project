# V3.7 Goal 3B Access-Counter Maxima Correction Allowlist Hard Stop

```yaml
status: DECISION_REQUIRED
recorded_on: 2026-08-21
finding: G3B-PREFREEZE-P1-001
starting_commit: 3a3893e268dd3764060883c1f8c2585c7f15f947
starting_tree: b8baccf07253e84a13cb7245e7282e6dda8d3672
candidate_created: false
source_delta_preserved: false
real_access: false
```

## Main finding

The original implementation Session implemented and locally exercised the frozen
three-file source/test correction, then reached a Prompt Hard Stop. The Primary action
accepted a valid under-cap actual tuple, but the subsequent Recovery action failed with
`V2 Recovery truth rejected: real-access counters mismatch`.

The repeated exact-equality call is at
`workbench/src/v37/registered-recovery-v37g3a.ts:142`. It calls the accepted V2 Inspector
with the registered maxima as `expectedRealCallCounters`, independently of the corrected
G3A Primary terminal validation. Therefore the same under-cap execution is accepted at
Primary and rejected at Recovery.

## Scope assessment

- **Fact:** The required file is G3A-specific and already owns registered Recovery truth
  recomputation. It is not shared V2, V3, V3.6, loader, configuration, UI or Pi source.
- **Fact:** No additional schema, artifact, workflow stage, budget family or product
  capability is required.
- **Inference:** Adding this one file to the allowlist is necessary to close the already
  accepted finding; omitting it would leave the frozen full-loop route internally
  inconsistent.
- **Recommendation:** Amend only the allowlist and Primary/Recovery proof requirement,
  then resume the same original Session with the same one-Candidate capacity. This is not
  a second correction round because no Candidate or correction commit was created.

## Observed local evidence

```yaml
focused_g3a_tests:
  passed: 21
  failed: 4
  failure_class: repeated_Recovery_exact_counter_check
strict_typescript: PASS_zero_diagnostics
candidate_commit: null
external_operations:
  credential_reads: 0
  network_calls: 0
  external_provider_calls: 0
  real_model_calls: 0
```

All experimental source/test changes were removed. Main independently confirmed HEAD
remains the exact starting commit/tree and the only working-tree entry is the pre-existing
user-owned untracked report, which was not read or modified.

## Required user decision

Recommended decision:

`AUTHORIZE_V3_7_G3B_COUNTER_CORRECTION_ALLOWLIST_ADD_REGISTERED_RECOVERY_V37G3A_AND_RESUME_SAME_CANDIDATE_CAPACITY`

Approval adds only:

```text
workbench/src/v37/registered-recovery-v37g3a.ts
```

The resumed Session must derive/pass the terminal's exact actual tuple to the already
accepted V2 Inspector, retain the new registered-maxima/ledger check in the G3A Primary
Inspector, and preserve every existing Recovery identity, Session, Candidate, Selection,
budget and terminal check. All prior zero-access, testing, Candidate and audit rules stay
unchanged.
