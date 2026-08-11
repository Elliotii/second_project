# Post-V3.6 Budget-Stop Terminalization Closeout Draft

```yaml
status: draft_not_accepted
goal_id: POST_V3_6_BUDGET_STOP_TERMINALIZATION_MAINTENANCE
implementation_disposition: bounded_audit_correction_complete_pending_main_hit_specific_rereview
version_status: V3_6_remains_closed_and_accepted
control_baseline_commit: 1564361a1fd952d38fc58f08202b4fb89950ed07
control_baseline_tree: 210ed728c795fa4d18e85e3cee48af4ee475bced
candidate_commit: d082f1a09dc0756afca5dc7dc39d433d0e73dd53_pre_correction_main_candidate
audit_finding_corrected: POST-V3.6-AUDIT-P1-001
```

## Draft disposition

**Recommendation:** Main may review this implementation as a Contract-bounded Candidate for the required fresh focused read-only audit. This draft is not a Goal acceptance, a Version reopening, or a real-product authorization.

**Fact:** The implementation provides a single typed, authenticated, immutable terminal form for the exact local pre-dispatch Provider-request budget stop. It keeps the Run non-settled and unverified, retains safe command/usage truth, and makes the managed Workspace inspectable without treating its changes as eligible for Apply.

**Fact:** The bounded correction for `POST-V3.6-AUDIT-P1-001` independently derives and reconciles Provider-response usage and ordered Tool-call/Tool-result counts from the persisted Pi Session Turn prefix on creation and reopen. It also independently validates the terminal's final registered-command projection against the existing nested Docker `authority.json` and `terminal.json`, including exact refs, digests, command ID, safe terminal fields, frozen profile, and Authority lineage. Rehashed outer values and missing, ambiguous, tampered, or mismatched nested evidence fail closed. No Docker or Authority architecture was changed.

**Fact:** No real registered Source was modified. The focused regression temporarily modified only its ignored fixture Source copy, rejected clean-Session creation on inventory drift, restored the original bytes, and then minted the clean Session from the authenticated original identity. Apply All and same-failed-Session continuation fail closed. Export and Discard remain non-mutating. The clean budget-terminal title states Clean Registered Source, while successful Apply keeps its existing updated-Source wording.

## Evidence summary

- Exact Control Baseline HEAD/tree and clean tracked state were verified before work.
- Strict TypeScript passed after the audit correction; static browser JavaScript syntax passed in the original Candidate verification.
- The focused faux regression passed a normal settled control and the exact 17th-request terminal case, including rehashed outer usage/Tool/last-command data and missing, tampered, and ambiguous nested Docker-command evidence.
- The initial wider selected zero-access regression set passed 32/32, including V3.5 terminal-pattern, V3.6 authority/session, loopback browser, managed-workspace, ChangeSet/handoff, frozen product-entry preflight, and daily product-profile coverage. After Main's bounded wording/drift correction, the focused terminal plus authority/session suite passed 7/7.
- After `POST-V3.6-AUDIT-P1-001`, the focused terminal suite passed 2/2 and the affected V3.6 authority/session regression passed 5/5. All commands used the existing faux/loopback path; no Docker command ran.
- No Pi source changes, Credential reads, external-network calls, external Provider calls, real-model calls, Docker execution, Source Apply, staging, or commit occurred.

## Required remaining review

Main's hit-specific re-review should inspect only the correction for `POST-V3.6-AUDIT-P1-001`:

- Session-derived Provider usage and ordered Tool lifecycle reconciliation on reopen;
- exact nested Docker command evidence location/ref, digest, command-ID, safe terminal-field, frozen-profile, and Authority-lineage checks; and
- fail-closed behavior for rehashed outer fields and missing, ambiguous, tampered, or value-mismatched nested evidence.

## Limits retained

**Fact:** This draft does not claim task completion, test success, Source eligibility, optimality of the 16-request cap, recovery from arbitrary failures, real-model behavior, or same-Session resume.

**Unconfirmed:** The live Docker executor suite and any real product journey remain unexecuted in this Session. They require separate authority and are not implied by the faux-only maintenance evidence.

## Proposed acceptance language, conditional on Main hit-specific re-review

> V3.6 now terminalizes and safely exposes the exact local pre-dispatch Provider-request budget stop without treating the Run as settled or allowing incomplete unverified changes to reach registered Source.

No `CURRENT_STATE.md` update, Candidate commit, audit result, or acceptance is included in this draft.
