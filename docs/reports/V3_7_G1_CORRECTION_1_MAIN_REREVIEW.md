# V3.7 Goal 1 Correction Round 1 Main Re-review

```yaml
status: FAILED_ONE_RESIDUAL_P1_003
goal: V3_7_G1_REGISTERED_RECOVERY_EVIDENCE_BRIDGE
candidate_commit: a62051044332d438cbc0f33ec6ccc3f74097ef2f
candidate_tree: 7eb150cdaecb9234d62fde2bba31f1e59dd7f107
candidate_parent: 7aca62cc5b329414873bb334ba13547eb9c98d53
audit_started: false
goal_2_started: false
next_action: CORRECTION_ROUND_2
```

## Main result

The candidate identity, clean worktree, direct parent and eight-file Correction 1
allowlist were independently verified. The focused Goal 1 suite passed 13/13 from the
exact candidate. Main's deterministic correction repro passed the Run-binding,
loader-owned-registry and full direct-answer cases, but exposed one residual of
`V37-G1-MAIN-P1-003`.

### V37-G1-MAIN-P1-003-R1 — short task-specific answer remains admissible

**Fact.** The real `producePromptCandidateV37` path rejected the long direct answer used
by the implementation test, but accepted this shorter task-specific prompt addendum:

```text
Make parseDuration multiply seconds by 1000.
```

The current deterministic predicate requires a frozen symbol plus at least five shared
tokens, or at least two Verifier literals. This candidate names the exact frozen function
and a task-specific transformation but falls below both thresholds.

**Contract violation.** Correction 1 required frozen Task/Source/Verifier content
independence to reject direct task answers while preserving generic transferable
guidance. This accepted content is neither independent nor transferable. The defect is a
residual of the already-confirmed P1-003 finding and remains inside its correction scope.

## Deterministic evidence

| Check | Result |
|---|---|
| exact candidate identity/tree/parent/clean | PASS |
| Correction 1 changed-file allowlist | PASS, 8/8 allowed |
| Goal 1 focused suite | PASS, 13/13 |
| Main four-boundary correction repro | FAIL, 3/4; only short direct-answer rejection failed |
| disabled exact accepted admission read-only reopen | PASS in focused suite |

No Credential, network, Provider/model or Docker access was used. The ignored Main
diagnostic remains outside the candidate.

## Disposition

Candidate `a62051044332d438cbc0f33ec6ccc3f74097ef2f` / tree
`7eb150cdaecb9234d62fde2bba31f1e59dd7f107` is preserved and rejected at Main
preliminary re-review. Audit is not authorized. Correction round 2 is limited to this
residual content-independence predicate and necessary tests/reports.
