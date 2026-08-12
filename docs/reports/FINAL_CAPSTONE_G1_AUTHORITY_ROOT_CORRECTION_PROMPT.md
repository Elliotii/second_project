# Final Capstone Goal 1 — Authority-root Hit Correction Prompt

```yaml
prompt_status: ready_for_original_goal_1_working_session
goal_id: FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
open_finding: G1-AUDIT-P1-001
main_hit: combined_registration_and_authorization_forgery_accepted
owner: original_goal_1_working_session
real_access: forbidden
git_commit: forbidden
```

Resume the original Goal 1 Working Session for one hit-only correction. Read
`FINAL_CAPSTONE_G1_POST_AUDIT_CORRECTION_MAIN_REREVIEW.md` first. Goal 1 remains
unaccepted; Goal 2 remains unauthorized.

## Required red test

Before changing implementation, add a negative test that:

1. clones a valid registration;
2. changes its ID and recomputes its self-digest;
3. constructs a new matching plain authorization object claiming Host control-plane
   authority and eligibility; and
4. calls every relevant exported derivation/admission/reopen boundary.

The current implementation accepts this pair. Preserve this exact reproduction as a
regression and make every relevant boundary reject it.

## Required semantic correction

- Establish an actual Host-owned trust root or fixed Host-owned approval boundary.
- Registration byte integrity may remain self-digested, but neither eligibility nor approval
  may be established by any set of plain objects, booleans, IDs, digests or arbitrary paths
  that the same ordinary caller can construct and supply together.
- A parameter is not Host-controlled merely because it is named `hostAuthorization`.
- Direct exported derivation must not provide an untrusted caller a route that can mint both
  the registration and its approval.
- Admission and reopen inspection must use the same non-caller-mintable approval boundary.
- Do not add credentials, network access, external signing, dependencies, generic registries
  or product integration. If a real trust root cannot be represented within the accepted
  bounded scope without one of those additions, stop with `DECISION_REQUIRED` and explain
  the smallest architectural choices instead of relabeling caller data as trusted.

Preserve all previously closed V2/V3 semantics, Inspector reruns, filesystem protections,
write-once behavior, provenance and immutability.

## Allowed delta

Only the same six Goal 1 files remain writable:

- `workbench/src/contracts/final-capstone-g1-types.ts`;
- `workbench/src/refinement/evidence-admission-g1.ts`;
- `workbench/src/inspect-final-capstone-g1.ts`;
- `workbench/tests/final-capstone-g1-evidence-admission.test.ts`;
- `docs/reports/FINAL_CAPSTONE_G1_IMPLEMENTATION_REPORT.md`;
- `docs/reports/FINAL_CAPSTONE_G1_CLOSEOUT_DRAFT.md`.

Do not edit Main/audit/control reports, accepted-core files, `CURRENT_STATE.md`, Pi,
historical evidence or Git state. Credential/network/Provider/model/real-model access and
dependency installation remain forbidden.

Run the exact Contract matrix, record all exit codes and zero-access counters, and return to
Main without staging or committing.
