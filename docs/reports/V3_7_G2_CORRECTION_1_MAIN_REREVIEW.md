# V3.7 Goal 2 Correction 1 Main Rereview

```yaml
status: FAILED
candidate_commit: ab0157f9bfab7e714489687fdfb9ec3c45f49c85
candidate_tree: dc7ca3366ac15d1da230167fc46fb5a3b932b920
candidate_parent: 584d233e31485d1bd87a7392ddc361200477ecf6
allowlist: passed_7_of_7
finding_set: V37-G2-C1-MAIN-P2-001_V37-G2-C1-MAIN-P2-002
audit_started: false
goal_2_accepted: false
goal_3_locked: true
```

## Result

Correction 1 closes the four source findings: the assessment enforces the configured
State scope and real promotion publication lineage, the runtime records and recomputes
the required effective-profile/input identities, canonical comparison no longer depends
on `legacyAdmission`, and the complete accepted follow-up reopens after disable. Main
independently reproduced the environment-equivalent 64/64 deterministic matrix and the
strict seven-entry TypeScript check with zero diagnostics.

The candidate nevertheless fails preliminary rereview because two required evidence and
report boundaries remain incomplete.

## Findings

### V37-G2-C1-MAIN-P2-001 — Negative artifact assertions stop at the wrong authority boundary

The missing Outcome, invalid Verifier, observation, Outcome and cross-workflow tests copy
the whole V3.7 data root and inspect through the copied root. Goal 1's accepted global
Primary-Run authority is intentionally not partitioned into that copy. Main printed the
Inspector errors for both new cases; each stopped at `registered Recovery admission
unavailable` because the copied workflow had no corresponding Host authority record.
Neither assertion reached the intended Verifier/Outcome/observation check.

The actual frozen Verifier no-edit check is valid and honestly returns failure. Correction
2 must keep it, but mutate one accepted formal artifact at a time under the original
authority path, restore exact bytes in `finally`, and assert a target-specific Inspector
error. No registered negative profile or manufactured admitted Outcome is permitted.

### V37-G2-C1-MAIN-P2-002 — Verification report does not record exact commands

The Prompt requires exact commands. The implementation report records descriptive table
labels only. Main also observed two distinct TypeScript environment results that must not
be conflated: the repository package-script path is absent in the isolated worktree and
stops with `MODULE_NOT_FOUND`; the available external project TypeScript invocation
reaches the repository config and stops with `TS2688`; the strict seven-entry configured
check passes with zero diagnostics. Correction 2 must record the literal commands and
their exact qualifications, including the inherited absolute-loader commands used for
spawned-child equivalence.

## Independent verification

| Check | Result |
|---|---|
| commit/tree/parent and seven-path allowlist | PASS |
| Goal 2 focused | 10/10 PASS, with finding P2-001 false-positive assertions |
| Goal 1 | 14/14 PASS |
| V2-A literal / inherited-loader equivalent | 10/11 environment stop; 11/11 PASS |
| V3 G1/G2 | 19/19 PASS |
| Final Capstone literal / inherited-loader equivalent | 8/10 environment stop; 10/10 PASS |
| repository package-script TypeScript path | environment stop, module path absent |
| available full-config TypeScript | environment stop, TS2688 |
| strict seven-entry TypeScript | PASS, 0 diagnostics |

No Credential, network, external Provider/model, Docker, dependency installation or Pi
access occurred. The candidate remains preserved and is not an audit candidate.

## Disposition

Correction round 1 is consumed. Correction round 2 is authorized only for the focused
test and two reports. Source/config/loader changes are forbidden. Goal 2 remains
unaccepted, audit remains unstarted and Goal 3 remains locked.
