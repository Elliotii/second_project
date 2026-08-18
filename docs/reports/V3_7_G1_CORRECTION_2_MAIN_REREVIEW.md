# V3.7 Goal 1 Correction Round 2 Main Re-review

~~~yaml
status: PASS_MAIN_PRELIMINARY_REREVIEW
goal: V3_7_G1_REGISTERED_RECOVERY_EVIDENCE_BRIDGE
audit_candidate_commit: 0cf5b81976880d57a8b09bbd3f87be68853cbb3b
audit_candidate_tree: d6c59a29d1833fccd53164c295c5bf3bc90ebcba
candidate_parent: a62051044332d438cbc0f33ec6ccc3f74097ef2f
source_change_after_freeze: forbidden_without_new_candidate_and_audit
audit_authorized: true
goal_2_started: false
~~~

## Main result

Main independently verified the exact candidate identity, clean implementation worktree,
parent chain, four-file Correction 2 allowlist and source/test delta. The residual
V37-G1-MAIN-P1-003-R1 is closed: exact exported symbols jointly frozen by the Primary
Source, Task instruction and Verifier now fail closed without the prior five-token
threshold. The long direct answer, short direct answer and two Verifier-literal answer are
rejected; generic transferable guidance remains accepted.

The prior Correction 1 fixes were also revalidated from the exact final candidate:

- Primary Run binding rejects missing/cross-workflow identity and changed root;
- caller projectRoot cannot select an alternate registry baseline;
- frozen Primary Task, Source and Verifier content identities are recomputed;
- disabled current registration blocks mutation while the exact accepted admission
  reopens read-only with unchanged identity.

## Independent Main verification

| Check | Result |
|---|---|
| Goal 1 focused suite | PASS, 13/13 |
| Main correction-boundary repro | PASS, 4/4 |
| accepted V2A + V3 G1 + V3 G2 regressions | PASS, 24/24 |
| Final Capstone G1, inherited fixed loader | PASS, 24/24 |
| Final Capstone G2, inherited fixed loader | PASS, 10/10 |
| strict seven-entry TypeScript check | PASS, 0 diagnostics |
| candidate identity/parent/allowlist/diff check | PASS |

An initial Main attempt ran the two Capstone suites concurrently; both share and clean the
same ignored .runs/final-capstone fixture root, causing setup-copy loss. Sequential
reruns passed completely and no product assertion remained failing.

No Credential, network, Provider/model or Docker access was used. Main diagnostics and
the temporary strict tsconfig are ignored and are not part of the candidate.

## Disposition

Main preliminary re-review passes. Commit
0cf5b81976880d57a8b09bbd3f87be68853cbb3b / tree
d6c59a29d1833fccd53164c295c5bf3bc90ebcba is frozen as the immutable Goal 1 audit
candidate. Goal 1 is not yet accepted and Goal 2 remains locked pending a fresh
independent read-only Focused Audit PASS.
