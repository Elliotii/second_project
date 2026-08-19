# V3.7 Goal 2 Correction 2 Authorization

```yaml
status: AUTHORIZED
goal: V3_7_G2_RUNTIME_EFFECTIVE_STATE_FOLLOW_UP_BRIDGE
finding_set: V37-G2-C1-MAIN-P2-001_V37-G2-C1-MAIN-P2-002
starting_commit: ab0157f9bfab7e714489687fdfb9ec3c45f49c85
starting_tree: dc7ca3366ac15d1da230167fc46fb5a3b932b920
implementation_owner: /root/v37_g2_implementation
ordinary_correction_budget: 2_of_2
candidate_commits_authorized: 1
audit_authority: false
goal_3_authority: false
real_access_authorized: false
```

## Exact correction scope

Only these paths may change:

```text
workbench/tests/v37g2-runtime-effective-followup.test.ts
docs/reports/V3_7_G2_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G2_CLOSEOUT_DRAFT.md
```

All source, contract, configuration, loader, Goal 1, State Store/CAS, Charter, Amendment,
Prompt, Pi and Schema 2 paths are frozen.

## Required outcomes

1. Preserve the honest actual-frozen-Verifier negative execution.
2. Replace copied-data-root false positives with deterministic same-authority artifact
   mutation/restoration checks that reach the intended missing/invalid Verifier/Outcome,
   runtime-observation and cross-workflow lineage boundaries.
3. Assert target-specific Inspector errors, not only `integrity_valid: false`.
4. Do not create or admit a negative registered follow-up, manufacture an Outcome, or
   allow a caller-built canonical value into persistence/rollback.
5. Record every literal verification command and exact result. Distinguish the missing
   package-script compiler path, full-config `TS2688`, strict seven-entry PASS, literal
   spawned-child loader stops and inherited absolute-loader equivalents.
6. Rerun the full Prompt matrix and strict TypeScript check, create exactly one correction
   candidate commit, and stop for Main rereview.

Zero Credential/network/external Provider/model/Docker/install/Pi access remains
mandatory. This is the final ordinary Goal 2 correction round.
