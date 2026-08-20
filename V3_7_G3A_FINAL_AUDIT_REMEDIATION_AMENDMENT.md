# V3.7 Goal 3A Final Audit Remediation Amendment

```yaml
status: ACCEPTED_BY_USER
accepted_on: 2026-08-21
applies_to: V3_7_G3A_REUSABLE_PRODUCT_CAPABILITY
trigger_audit: docs/reports/V3_7_G3A_EXCEPTIONAL_REMEDIATION_FOCUSED_AUDIT.md
trigger_main_integration: docs/reports/V3_7_G3A_EXCEPTIONAL_REMEDIATION_AUDIT_INTEGRATION_HARD_STOP.md
finding_set:
  - V37-G3A-EXAUDIT-P1-001
  - V37-G3A-EXAUDIT-P2-002
ordinary_correction_budget: 2_of_2_exhausted_unchanged
exceptional_remediation_budget: 1_of_1_consumed_unchanged
final_audit_remediation_budget: 0_of_1_consumed
candidate_commits_authorized: 1
implementation_owner: /root/v37_g3a_implementation
main_acceptance_authority: false
independent_reaudit_authority: false
goal_3b_authority: false
real_access_authority: false
```

## 1. Purpose

This user-authorized final remediation closes only the two accepted audit findings. It
does not introduce a new product contract:

1. a real-declared Regression action must use the exact Host-supplied Regression
   validation port even when the pre-existing deterministic rejection-test switch is
   present; and
2. the local zero-actual-operation proof must be connected to all four supplied mocks
   instead of asserting an unused zero-valued object.

The P1 meets the accepted must-fix threshold because it makes the frozen reusable
real-declared execution-boundary claim false. The P2 is necessary proof for that same
frozen claim. No other issue is authorized for repair.

## 2. Exact change boundary

Only these paths may change:

```text
workbench/src/v37/product-service-v37g3a.ts
workbench/tests/v37g3a-product.test.ts
docs/reports/V3_7_G3A_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G3A_CLOSEOUT_DRAFT.md
docs/reports/V3_7_G3A_FINAL_AUDIT_REMEDIATION_REPORT.md
```

No contract/type, configuration, fixture, registry, V2/V3/V3.6 semantic source, control
state, Charter, Prompt, package or compiler file may change in the Candidate.

## 3. Frozen repair behavior

- For a real-declared Case, `run_regression` always dispatches the exact supplied
  `regressionValidation` port. `regressionCandidatePass` cannot select an internal port or
  determine the formal result.
- The two frozen deterministic Cases preserve their current positive and honest
  `candidate_rejected` test routes. Their non-overridable local adapters remain unchanged.
- A supplied real-declared Regression port that fails or throws cannot fall back to the
  internal rejection adapter and cannot create a successful receipt.
- Candidate, comparator, State CAS, Decision and follow-up semantics remain unchanged.
- The complete selected-route test uses one shared actual-operation tracker wired to
  Primary, Candidate-proposal, Regression-validation and follow-up mocks. It records each
  local mock invocation separately from Credential/network/Provider/model operations and
  proves all four actual-operation counters remain zero.

## 4. Required proof

Using temporary ignored registration and local deterministic mocks only:

1. reproduce the prior `regressionCandidatePass:false` construction and prove the
   supplied Regression port is invoked for both symmetric arms and its result controls the
   stage;
2. prove a throwing supplied Regression port receives the call, produces no Regression
   receipt and has no internal fallback;
3. retain the frozen deterministic rejection route;
4. prove all four local mock families are connected to the shared tracker, with expected
   invocation counts and actual Credential/network/Provider/model counters all zero;
5. rerun the exact G3A focused suite, affected G1/G2/V2/V3/V3.6 regressions, strict
   TypeScript, demo smoke, hash/config/fixture/allowlist and `diff --check` checks.

## 5. Stop rule

The original implementation Session creates exactly one allowlist-clean Candidate and
stops. Main performs preliminary rereview. Only Main PASS may freeze the Candidate for a
fresh independent read-only re-audit. Any new source path, second Candidate, real access,
unclosed finding or re-audit failure restores the Hard Stop; Goal 3A remains unaccepted
and Goal 3B remains locked.
