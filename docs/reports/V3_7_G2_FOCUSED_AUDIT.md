# V3.7 Goal 2 Focused Audit

```yaml
status: FAIL_V3_7_G2_FOCUSED_AUDIT
goal: V3_7_G2_RUNTIME_EFFECTIVE_STATE_FOLLOW_UP_BRIDGE
audit_mode: fresh_independent_read_only
candidate_commit: 3adb5654a24633375d3171f115e8b73d86c023ed
candidate_tree: 333d265bab61ec81c0a84bbc2e24bca02253be89
candidate_parent: ab0157f9bfab7e714489687fdfb9ec3c45f49c85
finding_set: V37-G2-AUDIT-P1-001
goal_2_accepted: false
goal_3_started: false
candidate_source_modified: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_product_runs: 0
dependency_installations: 0
pi_or_reference_reads_or_changes: 0
```

## Disposition

The detached audit worktree resolved exactly to the frozen candidate. The cumulative
Goal 2 delta and both correction allowlists are exact, and Goal 1 configuration retains
its accepted hashes. The candidate closes the original Main findings on the exercised
paths, but fails audit because an accepted follow-up admission ceases to be historically
inspectable after a legitimate later State pointer transition.

## V37-G2-AUDIT-P1-001 — Historical admission is coupled to current active State

`recompute` in `workbench/src/v37/registered-follow-up-v37.ts` reopens the current State
Store and calls `inspectRegisteredPromotionLineageV37`. That helper selects the version
and promotion Decision through `state.active` and requires the currently active version
to remain the follow-up Candidate's promoted version. The same current-active check is
therefore used before dispatch and when reopening an already accepted admission.

The audit generated the complete accepted follow-up through the production fixture,
confirmed `integrity_valid: true`, then used production `rollbackActiveStateV3` to move
the Store to the exact immediate parent without changing any follow-up artifact.
Reopening produced:

```json
{"before_integrity_valid":true,"after_integrity_valid":false,"after_errors":["follow-up requires a newly promoted active State"]}
```

Main independently reran the same ignored audit repro and obtained the identical result,
then reran the focused suite to restore the fixture.

Charter Section 6.3 says a later pointer change does not rewrite historical binding
evidence. Sections 3.4 and 4.2 require referenced formal artifacts and already accepted
historical admissions to remain read-only inspectable. The current implementation
violates that contract and can also destabilize historical normalization or stored
assessment recomputation after a legitimate rollback.

## Required correction boundary

Keep current-active and immediate pre-request drift checks for preparation, dispatch and
new State-mutating actions. Historical admission recomputation must instead validate the
frozen binding's named accepted version, promotion Decision and validation lineage
independently of the current pointer. Add a sequence that accepts a complete follow-up,
performs a legitimate later pointer transition, and proves identity-stable admission and
normalization read-only reopen; repeat under disabled registration while all new actions
remain blocked. No new profile, manufactured Outcome, decision-table change or Store/CAS
semantic change is required.

## Independent verification

| Check | Result |
|---|---|
| frozen commit/tree/parent and allowlists | PASS |
| Goal 2 focused, before and after repro restoration | 10/10 PASS twice |
| Goal 1 | 14/14 PASS |
| V2-A inherited-loader equivalent | 11/11 PASS |
| V3 G1/G2 | 19/19 PASS |
| Final Capstone G2 inherited-loader equivalent | 10/10 PASS |
| deterministic aggregate | 64/64 PASS |
| strict seven-entry TypeScript | PASS, 0 diagnostics |
| package/full TypeScript | environment stops: compiler path absent / TS2688 |
| production historical-reopen repro | FAIL as contract evidence |

No candidate repair, merge, Goal acceptance, control-state change or Goal 3 work was
performed by the audit Session.

## Recommendation

Preserve the candidate unchanged and return the P1 to Main. Goal 2 cannot be accepted.
Because both ordinary correction rounds are consumed, a new bounded audit-remediation
authority decision is required before any repair or re-audit.
