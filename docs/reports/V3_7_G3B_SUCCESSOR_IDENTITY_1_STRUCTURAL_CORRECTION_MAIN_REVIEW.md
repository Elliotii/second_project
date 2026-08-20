# V3.7 Goal 3B Successor Identity 1 Structural Correction Main Review

```yaml
status: PASS_V3_7_G3B_SUCCESSOR_IDENTITY_1_STRUCTURAL_CORRECTION_MAIN_REVIEW
reviewed_on: 2026-08-21
candidate_commit: 8a246e439da6aea1f597eed8e4ab71e57dc1b500
candidate_tree: c177337c39aba11ec180a4f85fa31437406ea82e
residual_main_findings: none
real_access_during_correction: false
```

Main independently reviewed the complete Candidate delta against the preserved Identity
1 evidence and accepted correction amendment.

- The Inspector accepts `initial_pass` only after the V2 terminal is independently
  integrity/terminal-valid and its actual counters match the Provider dispatch ledger.
  Deterministic registered modes remain exact.
- The bridge still requires exactly three attempts for a failure/recovery route, but
  accepts exactly one for `initial_pass`, records only Primary and explicitly releases
  the group reservation.
- Primary/Recovery command capacity is prospectively 64 per attempt and 195 globally;
  no request, token, Tool, wall-time or USD cap changed, and Regression/follow-up command
  caps remain one.
- The single new regression proves one receipt, no Recovery actions, one completed
  Primary unit and no stale reservation. Strict TypeScript passes with the existing
  project-authorized compiler.

No broad suite or 64-call test was run. Candidate `8a246e4...` is suitable for a fresh
independent read-only affected-finding audit. It does not authorize real access or a new
workflow.
