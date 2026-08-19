# V3.7 Goal 2 Correction 1 Authorization

```yaml
status: AUTHORIZED
goal: V3_7_G2_RUNTIME_EFFECTIVE_STATE_FOLLOW_UP_BRIDGE
finding_set: V37-G2-MAIN-P1-001_V37-G2-MAIN-P1-002_V37-G2-MAIN-P1-003_V37-G2-MAIN-P2-004
starting_commit: 584d233e31485d1bd87a7392ddc361200477ecf6
starting_tree: 3177f7303e82c0f774e4078773ed1669d65853f6
implementation_owner: /root/v37_g2_implementation
ordinary_correction_budget: 1_of_2
candidate_commits_authorized: 1
audit_authority: false
goal_3_authority: false
real_access_authorized: false
```

## Exact correction scope

Correct only the four Main findings and necessary deterministic tests/reports. Preserve
the original candidate commit/tree. Only these paths may change:

```text
workbench/src/contracts/v37-types.ts
workbench/src/session/persistent-session-v36.ts
workbench/src/state/state-feedback-g2.ts
workbench/src/v37/registered-follow-up-v37.ts
workbench/tests/v37g2-runtime-effective-followup.test.ts
docs/reports/V3_7_G2_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G2_CLOSEOUT_DRAFT.md
```

Do not change the registered profile/config/loader, Goal 1 files, State Store/CAS,
regression gate, old G1, Final Capstone contracts, control state, Charter, Amendment,
Prompt, Pi or Schema 2 paths.

## Required outcomes

1. Bind V3.7 assessment to the exact Manifest-configured canonical State Store location
   and `state_store_scope_digest`; reject a byte-identical clone or alternate root.
2. Inspect the real promotion validation/Candidate/staged-State lineage. Replace the
   focused fixture's direct Decision/State writes with the accepted production Regression
   publication path; no manufactured Decision or Outcome.
3. Extend the V3.6 registered observation with all five effective profile digests and
   independently computed identities for actual task-policy and runtime-budget inputs.
   Admission must recompute and compare these against the registered profile projections.
4. Make comparison/rollback consume the canonical form for both old and V3.7 sources.
   Preserve the same fresh symmetric immediate-parent/current, admission, task/source,
   State and attribution requirements; no Evidence direct supersede.
5. Add deterministic rejection of alternate State scope and profile/input mismatch.
   Exercise honest V3.7 negative/reassessment plus strict rollback where the accepted
   production fixtures permit it; otherwise stop with the exact Charter conflict rather
   than manufacturing artifacts.
6. Disable only after a complete accepted follow-up exists, then prove new action is
   blocked and full admission/inspection reopens read-only with unchanged identities.
   Add missing/invalid Verifier/Outcome rejection checks.

Rerun the Prompt verification list and strict TypeScript check, update both reports,
create exactly one correction candidate commit, and stop for Main rereview. Zero
Credential/network/external Provider/model/Docker/install/Pi access remains mandatory.
