# V3.7 Goal 3A Correction 2 Main Rereview — Hard Stop

```yaml
status: FAIL_MAIN_REREVIEW_CORRECTION_BUDGET_EXHAUSTED
goal: V3_7_G3A_REUSABLE_PRODUCT_CAPABILITY
correction_2_candidate_commit: 84d8f87044eced89542e87ff35ed7176496d05b2
correction_2_candidate_tree: 177921f4825d4c490b466866f10ff432320df6c6
correction_2_candidate_parent: 28938f2817ec8e0baee1d33fdc1d89582a83e936
residual_finding: V37-G3A-MAIN-P1-001
ordinary_correction_budget: 2_of_2_exhausted
focused_audit_started: false
goal_3a_accepted: false
goal_3b_locked: true
decision_required: true
```

## Result

Correction 2 materially improves Primary terminal validation and introduces a versioned
Host construction/access-profile boundary. Main independently confirmed its focused
suite and strict TypeScript check pass. The Candidate nevertheless fails the same
`P1-001` core claim: it demonstrates only a later real-declared **Primary-pass** Case.
The accepted Charter requires the same product to express a real Recovery path and its
honest terminal outcomes, but that route remains deterministic-only and incomplete.

Because both ordinary Correction rounds are consumed, Charter Section 3.8(13) and the
Goal 3A Amendment Section 7 require a Main/user Hard Stop. This Candidate is preserved
and is not an audit Candidate.

## Blocking evidence

### 1. The same real-declared Recovery route is rejected by the bridge

Main created a temporary fully registered real-declared clone of the frozen Recovery
Case, supplied exact Host construction ports and authorization, and used only the local
deterministic V2 engine with simulated nonzero counters. Primary produced an independently
valid V2 terminal. The next ordinary product action failed:

```text
run_recovery -> V2 Recovery truth rejected:
real-access counters mismatch; Manifest frozen constants mismatch
```

`registered-recovery-v37g3a.ts` invokes `inspectRunV2A` without the Host-loaded expected
mode/counters and `requireRegisteredV2Execution()` still requires
`execution_port_kind=internal_deterministic`, `real_execution_authorized=false` and
`provider.real_access=false`. That file was outside Correction 2's allowlist. A later
real Recovery Case therefore cannot use the same complete bridge/service path without a
further implementation-source change, contrary to Amendment Sections 4 and 6.

Actual Credential reads, network calls, Provider calls and model calls in this repro were
all zero; only formal counters were simulated.

### 2. The Charter-required `recovery_inconclusive` terminal is absent

Charter Section 7.3 freezes this route:

```text
both recoveries fail -> terminal recovery_inconclusive
```

V2 represents that honest fact as `outcome: recovery_none`. The current G3A workflow
stage union and Read Model contain no `recovery_inconclusive` stage, while
`validatePrimaryTerminalV37G3A()` requires every failed Primary to end as
`recovery_selected`. A legal real negative result therefore fails product reopen instead
of becoming the Charter-required honest terminal. Goal 3B Section 8.4 consequently cannot
record the required `closed_incomplete` Recovery-inconclusive result.

### 3. Construction authorization is not checked on every mutating transition

`createWorkflow()` and `runPrimary()` check the real-access Case authorization, but the
common `act()`/later `executeAction()` path does not require it before Recovery,
Regression or follow-up actions. A persisted real workflow reopened by a service with
ports but no matching construction authorization is therefore not rejected at the
common transition boundary. Main's attempted restart repro reached the later bridge and
failed only because of the unrelated deterministic-only check above. Authority must be
present and exact for every real-declared mutation, not conferred permanently by workflow
creation.

### 4. The focused test does not cover the claimed full path

The new temporary third Case declares a nonzero follow-up profile but its Primary is
hardcoded PASS. It stops at `no_recovery_needed`; its supplied follow-up port deliberately
throws if called. Thus the `19/19` suite proves configuration/ports/authorization and one
Primary terminal, but not real-declared Recovery, Candidate, Regression, follow-up,
admission or Assessment through the same action handlers. The report's broader reusable-
path conclusion is not supported by that test.

## Main verification

| Check | Result |
|---|---|
| exact Candidate commit/tree/parent and 11-path allowlist | PASS |
| Goal 3A focused | PASS, 19/19 |
| strict TypeScript equivalent | PASS, zero diagnostics |
| frozen current G3A port override rejection | PASS |
| malformed Primary terminal/no receipt | PASS |
| temporary real-declared Primary-pass path | PASS, but narrow |
| temporary real-declared Recovery path | FAIL; deterministic-only bridge rejection |
| Charter `recovery_none -> recovery_inconclusive` | FAIL; stage/route absent |
| every-action construction authorization | FAIL by source/transition inspection |
| real-declared follow-up simulated counter path | NOT RUN / NOT PROVEN |

The Implementation Session reports Goal 1/2 `25/25`, V2 `11/11`, V3 `19/19`, V3.6
`10/10`, demo smoke PASS and all thirteen v1 hashes exact. Main did not rerun those
unchanged green suites a third time after the blocking focused evidence was established.

## Required user decision

Recommended: authorize one narrow, versioned Goal 3A correction-budget amendment for a
single exceptional remediation round, limited to the repeated `P1-001` class. It must:

1. add the already Charter-frozen `recovery_inconclusive` Read Model terminal without a
   new product contract;
2. make the versioned Recovery bridge derive V2 inspection/mode/counter expectations from
   the Host-loaded G3A Manifest and require real authorization at every mutation;
3. require a real-declared Primary to use an independently inspected V2 terminal, not a
   manufactured G3A pass terminal;
4. prove config-only, ports-only and post-restart authorization absence fail closed;
5. prove local zero-operation simulations of Primary PASS, `recovery_none`, and one full
   selected-Recovery-to-follow-up route through the same product actions; and
6. preserve every frozen G3A/current-v1 behavior and rerun the full regression list.

Alternative decisions are to reject Goal 3A, or amend/remove the stable Goal 3B same-path
claim. Main does not recommend weakening the accepted claim: the missing honest terminal
and deterministic-only Recovery bridge are core reliability behavior, not optional
production hardening.

No audit, Goal acceptance, Goal 3B freeze/execution, external access, tag or push is
permitted while this Hard Stop remains unresolved.
