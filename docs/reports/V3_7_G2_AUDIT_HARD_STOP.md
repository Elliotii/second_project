# V3.7 Goal 2 Audit Hard Stop

```yaml
status: DECISION_REQUIRED
disposition: HARD_STOP_AUDIT_FAILED_AND_ORDINARY_CORRECTION_BUDGET_EXHAUSTED
candidate_commit: 3adb5654a24633375d3171f115e8b73d86c023ed
candidate_tree: 333d265bab61ec81c0a84bbc2e24bca02253be89
audit_finding: V37-G2-AUDIT-P1-001
ordinary_correction_budget: 2_of_2_consumed
audit_remediation_authorized: false
goal_2_accepted: false
goal_3_locked: true
real_access: credentials_0_network_0_provider_0_model_0
```

## Hard Stop

The mandatory independent audit found that a legitimate later State rollback invalidates
the already accepted follow-up admission because historical recomputation requires the
bound promoted State to remain current. Main independently reproduced the finding. This
violates the Charter's historical evidence stability and read-only reopen contract.

Both ordinary Goal 2 correction rounds have candidate commits and are consumed. The
Charter therefore prohibits another repair without a new user control decision.

## Recommended decision

Authorize one bounded Audit Remediation round, separate from the exhausted ordinary
correction budget:

- original Goal 2 implementation Session owns the repair;
- preserve candidate `3adb5654...` unchanged;
- allow only the registered follow-up historical-lineage helper/service, the focused
  Goal 2 test and two reports;
- keep current-active/pre-request checks for preparation, execution and new mutation;
- historical recomputation validates the binding-named version, promotion Decision and
  validation lineage without requiring it to remain active;
- test accepted follow-up -> production rollback -> stable admission/normalization
  reopen, then disabled registration -> same read-only reopen with new actions blocked;
- zero profile/Case/State Store/CAS/decision-table/real-access changes;
- one remediation candidate commit, Main rereview, then a fresh independent affected-
  finding re-audit before Goal 2 acceptance.

Rejecting this remediation leaves Goal 2 unaccepted and Goal 3 locked.
