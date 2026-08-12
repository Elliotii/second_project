# Final Capstone Goal 1 — Focused Audit Main Review

```yaml
status: revise_accepted_by_main
goal_id: FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
candidate_commit: 0c1c91efcbed3f0db4a3735de1996deff99f9bac
candidate_tree: 194a90cac93cd1fe4c398f9db3db1829f0b9196e
audit_session: 019ff770-45d6-7ac2-af86-b1d7820f2dc8
audit_disposition: REVISE_FINAL_CAPSTONE_G1_FOCUSED_AUDIT
blocking_findings: 1
goal_acceptance: blocked_pending_bounded_correction_and_hit_specific_reaudit
goal_2: unauthorized
```

## Main disposition

Main accepts the focused audit's single P1 finding. Candidate
`0c1c91efcbed3f0db4a3735de1996deff99f9bac` is rejected as the Goal 1 acceptance
baseline. It remains immutable historical audit evidence and must not be amended.

The finding is a Contract-level authority defect, not a documentation preference. The
Goal 1 Contract section 4.1 and Gate D require that caller-provided data cannot self-grant
adaptation eligibility. In the Candidate:

- `validateHostRegistrationG1` accepts caller-authored `authority: "host"` and
  `adaptation_eligible: true` when their ordinary SHA-256 digest is internally consistent;
- the same caller can recompute that digest after changing the registration; and
- exported derivation accepts the caller-supplied registration directly, while the file path
  entry point accepts any caller-selected project-relative registration file.

The digest therefore proves byte consistency, not Host provenance or Host authorization.

## Main hit reproduction

Main cloned an existing valid V0-B registration in memory, changed its registration ID,
retained a claimed Host grant, recomputed the ordinary registration digest and passed it to
`deriveTrustedEvidenceAdmissionG1`. The Candidate accepted it:

```json
{"accepted":true,"registration_id":"main-forged-host-grant","authority":"host","eligible":true,"admission_id":"admission-55b2204e580ce7aeaf95a61921801c4b"}
```

The reproduction performed no filesystem write, Credential read, network access,
Provider/model call or real-model call.

## Findings retained and closed

- `G1-AUDIT-P1-001` — open: caller-controlled registration can self-grant Host eligibility.
- `G1-MAIN-P1-001` — remains closed: V3 version 0, empty binding, null lineage and
  inconsistent runtime path fail closed.
- `G1-MAIN-P1-002` — remains closed: V2 retains one Run identity and separate Candidate
  Path provenance, with no false peer Run.

No other blocking audit finding was reported. The isolated audit worktree passed strict
TypeScript, Goal 1 17/17, V3-G1 13/13 and V3-G2 6/6. Its exact combined V3-G3 command was
blocked by a pre-existing test path hard-coded outside the assigned worktree; the same
unchanged logic passed 8/8 with a worktree-local path substitution. Main's pre-freeze exact
regression in the authoritative worktree remains 44/44. This environment-only observation
does not close or weaken `G1-AUDIT-P1-001`.

## Next control point

Return exactly one bounded correction to the original Goal 1 Working Session. Main and the
Audit Session must not repair the source. After correction, Main performs a hit-focused
review plus required regressions, freezes a new corrected Candidate only with explicit Git
authority, and dispatches a fresh hit-specific independent re-audit.

Goal 1 and its trusted-memory evidence admission capability remain unaccepted. Goal 2
remains unauthorized.
