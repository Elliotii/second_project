# V3.5 Goal 2.5 Replacement Real Pair Main Review and Disposition

```yaml
status: PASS_RECOMMENDED_PENDING_USER_ACCEPTANCE
date: 2026-08-09
goal_id: V3_5_G2_5_TERMINATION_SAFE_REAL_SKILL_CLOSURE
corrected_execution_baseline: 91fb8be73f809a67bedf58efcf520914ce93f737
execution_session: 019fe38f-7c3d-7a02-92c3-0f7eef53196f
comparison_digest: 243d1c476385333d297bff296b69d9dd5d7be87ea041b25c974cc5dc7a7d920f
main_recommendation: PASS_V3_5_G2_5_VALID_REAL_PAIR_NO_SKILL_ADVANTAGE_OBSERVED
goal_accepted: false
goal_closed: false
goal_3_authorized: false
```

## Main conclusion

Main recommends accepting Goal 2.5. The amended Goal question was whether the frozen
Base/Candidate adaptive-Skill comparison could complete through Direct Pi with valid
persistent external-Verifier evidence after correcting the Tool affordance, termination
and pre-arm materialization defects. The answer is **yes**.

This is a mechanism and bounded real-closure result, not evidence that the Skill is
generally better. On the one frozen Case, both Base and Candidate passed.

## Evidence review

Main independently checked the execution report, `comparison.json`, both arm Manifests and
both Session/Run-link artifacts.

| Property | Base | Candidate | Main finding |
|---|---:|---:|---|
| Trajectory / Task | settled / passed | settled / passed | both valid |
| Provider dispatches | 3 | 3 | equal |
| Tool calls | 3 | 3 | equal |
| Verifier | 1 passed | 1 passed | exact |
| Total tokens | 2,183 | 2,953 | Candidate used 770 more |
| Cost USD | 0.0001404424 | 0.0001392328 | practically equal; no efficiency claim |
| Final Workspace | reference digest | reference digest | equal |

The initial Workspaces were byte-identical. Actual first payloads were identical outside
the exact frozen Skill treatment, with fairness digest
`6d7288f5637e022b0bc1c5c3ea2052208ebfeccce30cfd47218b292af1f64043`.
Both arms used Tool-interface digest
`92c9898d61c0f14a7f6ab9e4b7ee1119650347eb6823bb4fe542a3ab0ba5b3ec`.

Both Sessions contain seven entries and authenticate to their Run links. Both settled
handoffs were persisted before the one external Verifier and rechecked live Session,
Workspace, Tool-result closure and protected bytes. No fallback budget checkpoint was
used. No pause exists.

Main also recomputed the Goal 2.5 comparison digest, both comparison-to-Manifest SHA
references and both Manifest digests from raw bytes; all matched, with both Trajectory
Outcomes `settled` and Task Outcomes `passed`.

Whole Pair: two Credential-resolver reads, six Provider/model calls, 5,136 tokens, six
Tool calls, two Verifiers, cost USD `0.0002796752`. All caps passed. Retry, fallback,
additional replacement, Pair, arm and Case counts were zero.

## Skill interpretation

The frozen `adaptive-inefficient-success` Skill did not change pass/fail outcome, dispatch
count or Tool-call count on this Case. Candidate used more tokens because the Skill
treatment adds context, while its measured cost was microscopically lower due to the
different input/output mix. With one Case and one run per arm, neither difference supports
an efficiency or superiority claim.

The useful result is that a promoted historical adaptive Skill can be selectively bound as
the sole treatment, run fairly against Base, and produce inspectable, externally verified
real evidence. The observed answer here is “no measurable task-success advantage on this
already-easy Case.”

## Amendment and integrity

The earlier pre-arm command consumed its authority without reaching Base. The user then
authorized one infrastructure-only Amendment. The source correction was one direct-parent
creation plus a cold-start regression, passed Main review and froze baseline `91fb8be...`.
The replacement ran exactly once. This does not constitute Case hunting, model retry or
treatment tuning.

The old partial Pair remained unchanged. Project/Pi tracked state remained clean and Pi
stayed pinned at `027a5847...`.

## Non-blocking Read Model compatibility limitation

The existing Goal 2 top-level `inspectGoal2PairV35` rejects the Goal 2.5 comparison object
because it correctly applies the older Goal 2 exact-key schema. Goal 2.5 currently has
Goal-2.5-specific checkpoint/handoff inspection plus authenticated raw comparison,
Manifest and ArtifactRef evidence, but no dedicated top-level Goal 2.5 Read Model adapter.

This does not invalidate the Pair or amended Exit Criteria: the evidence is persistent,
digest-authenticated and manually/source-inspectable, and Main's direct Goal 2.5 digest
validation passed. It is a non-blocking Goal 3 presentation input: a thin schema-aware
adapter will be needed before the WebUI can display this Pair through the unified Read
Model. Do not silently reuse the older exact-key inspector or broaden this Goal to build
the adapter now.

## Exit Criteria

All amended Contract Exit Criteria are evidenced:

1. accepted Contract/Amendment and clean baselines preceded implementation/execution;
2. zero-access proof and the focused termination/Verifier audit passed;
3. Base and Candidate each ran once from fresh Sessions and identical Workspaces;
4. the exact Skill was the sole treatment delta;
5. each arm has one valid Trajectory Outcome and one external-Verifier Task Outcome;
6. linkage, fairness, usage, Workspace, handoff and comparison evidence are inspectable;
7. Main accepts the observed both-passed result without tuning or another execution.

## Recommended disposition and claims

Recommended:

`PASS_V3_5_G2_5_VALID_REAL_PAIR_NO_SKILL_ADVANTAGE_OBSERVED`

Allowed after user acceptance:

- one fair real Direct-Pi Base/Candidate adaptive-Skill comparison completed;
- both arms settled and passed the same frozen external Verifier;
- persistent Session/Run/fairness/handoff/comparison evidence is inspectable;
- the fixed Skill showed no task-success advantage on this single Case.

Not allowed:

- general Skill superiority or inferiority;
- statistical, causal-across-tasks or production reliability claims;
- automatic Skill promotion quality beyond the accepted V3 deterministic lifecycle;
- V3.5 completion before Goal 3.

Goal 2.5 acceptance remains a user decision. Goal 3 remains unauthorized.
