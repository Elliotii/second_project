# V3.7 Goal 3A Exceptional Remediation Amendment

```yaml
status: ACCEPTED_BY_USER
accepted_on: 2026-08-20
applies_to: V3_7_G3A_REUSABLE_PRODUCT_CAPABILITY
authority: V3_7_CHARTER.md_one_time_Goal_3A_remediation_exception
user_decision: approved
trigger_report: docs/reports/V3_7_G3A_CORRECTION_2_MAIN_REREVIEW_HARD_STOP.md
finding_set: V37-G3A-MAIN-P1-001_repeated_authority_terminalization_class
ordinary_correction_budget: 2_of_2_exhausted_unchanged
exceptional_remediation_budget: 0_of_1_consumed
candidate_commits_authorized: 1
focused_audit_authority: false
goal_3b_authority: false
real_access_authority: false
```

## 1. Authority and purpose

The user approved Main's recommendation for one narrow exceptional remediation after the
ordinary Goal 3A Correction budget was exhausted. The accepted Charter now records this
one-time exception. It exists only to make already frozen Goal 3A behavior true:

- the later Goal 3B Case can use the same versioned registration, product, Recovery and
  follow-up action path without another implementation-source change;
- every real-declared mutation requires exact Host construction authorization;
- formal Primary/Recovery facts are independently inspected; and
- the Charter Section 7.3 `recovery_inconclusive` terminal is represented honestly.

This Amendment does not authorize a real Case, Provider/model adapter, Credential read,
network call, Docker product execution, Goal 3B freeze, new product contract or new
general runtime. The real Case and numeric budgets remain Deferred Freeze.

## 2. Preserved authority

Preserve without byte change:

- accepted v1 Goal 1/2 files and all thirteen frozen hashes;
- both tracked Goal 3A deterministic configurations and fixtures;
- V2 controller/selector semantics and files;
- V3 Candidate, Regression, State Store/CAS and G2 decisions;
- V3.6 Runtime schemas and existing product behavior;
- Charter Evidence families, Candidate/State/Assessment results, retry/fallback/
  replacement prohibitions and browser non-authority.

Goal 3A continues to execute with zero actual Credential, network, Provider and model
access. Simulated nonzero formal counters may be produced only by registered local mocks
whose observed actual-operation counters remain independently zero.

## 3. Exact remediation boundary

The remediation may change only the following existing Goal 3A paths and reports:

```text
workbench/src/contracts/v37g3a-types.ts
workbench/src/v37/host-registry-v37g3a.ts
workbench/src/v37/registered-recovery-v37g3a.ts
workbench/src/v37/product-service-v37g3a.ts
workbench/src/read-model/workflow-v37g3a.ts
workbench/src/inspect-v37g3a.ts
workbench/tests/v37g3a-authority.test.ts
workbench/tests/v37g3a-product.test.ts
workbench/tests/v37g3a-http-ui.test.ts
docs/reports/V3_7_G3A_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G3A_CLOSEOUT_DRAFT.md
docs/reports/V3_7_G3A_EXCEPTIONAL_REMEDIATION_REPORT.md
```

The detailed Prompt may narrow this list but cannot expand it. If another path is
required, the Implementation Session stops with zero out-of-bound delta.

## 4. Frozen behavior

### 4.1 Primary terminal routes

The versioned Inspector and Read Model must derive exactly:

| Inspected formal fact | Stage |
|---|---|
| registered Primary PASS / V2 `initial_pass` | `no_recovery_needed` |
| failed Primary plus V2 `recovery_selected` | `ready_for_recovery` |
| failed Primary plus V2 `recovery_none` | `recovery_inconclusive` |
| invalid, missing, contradictory or unbound terminal | fail closed; no new receipt |

`recovery_inconclusive` is the already frozen Charter Section 7.3 terminal, not a new
product contract. It has no available action and maps to Goal 3B `closed_incomplete`.

The G3A-local Primary-pass terminal is permitted only for the two frozen zero-access
deterministic configurations as already applicable. A real-declared Primary must return
the accepted independently inspected V2 terminal family and cannot use a self-declared
G3A pass terminal.

### 4.2 Versioned real-declared V2 boundary

The frozen V2 substrate retains its own exact controller constants. G3A Host authority
separately binds the later Case's Provider/model profile, expected execution-port kind,
real-access declaration and exact counter tuple. The G3A Inspector must call
`inspectRunV2A` with the Host-loaded expected Task, real-execution flag, injected-port
kind and counter tuple, then require exact stored/returned terminal equality and all
registered Task/Source/Verifier/Run/workflow identities.

The G3A Recovery bridge must use that same Host-loaded declaration instead of assuming
zero counters, internal-deterministic port and `real_access=false`. Current frozen G3A
Cases still require their exact zero/internal declarations. V2 source and semantics do
not change.

### 4.3 Per-action construction authority

A source-controlled real-declared config alone grants no execution authority. Ports
alone grant no authority. A prior workflow creation or Primary action grants no durable
authority. Before every mutating action, the product service reloads the Case/workflow
registration and requires the exact construction authorization bound to Case, Manifest,
follow-up profile and Primary/follow-up counter expectations, plus the required exact
ports. Read-only reopen remains possible without real execution authority.

## 5. Required deterministic proof

Using temporary ignored, fully validated configuration and local mocks only, prove:

1. config-only, ports-only, authorization-only and mismatched authorization cannot create
   or mutate a real-declared workflow;
2. after an authorized Primary, restart with ports but without authorization cannot run
   Recovery or any later mutation;
3. a real-declared V2 `initial_pass` reaches only `no_recovery_needed`;
4. a real-declared V2 `recovery_none` reaches only `recovery_inconclusive`;
5. a real-declared V2 `recovery_selected` traverses Recovery admission, Candidate,
   Regression, follow-up, second admission and Assessment through the unchanged product
   action handlers using simulated formal counters and zero actual external operations;
6. malformed/rehashed/substituted terminals receive no successful receipt;
7. both frozen G3A Cases retain their exact routes and reject overrides; and
8. all prior focused, historical, TypeScript, hash, demo and allowlist checks remain green.

No tracked third Case is created. No mock may be described as real execution or used to
manufacture a success without the accepted V2/Verifier/Runtime inspection paths.

## 6. Stop and audit

The original Goal 3A Implementation Session owns exactly one remediation Candidate. Main
then performs a fresh preliminary rereview. Failure, a second Candidate or a new finding
restores the exhausted-budget Hard Stop. Passing Main review freezes one immutable audit
Candidate and starts a fresh independent read-only Focused Audit. Goal 3A acceptance and
Goal 3B remain forbidden until audit PASS.
