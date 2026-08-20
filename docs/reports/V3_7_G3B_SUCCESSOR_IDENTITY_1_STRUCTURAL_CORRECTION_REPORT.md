# V3.7 Goal 3B Successor Identity 1 Structural Correction Report

```yaml
status: CANDIDATE_READY_FOR_MAIN_REVIEW
failed_identity: v37-g3b-64-request-successor-v1
prospective_identity: v37-g3b-64-request-successor-v2
real_access_during_correction: false
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## Changed behavior

- A valid independently inspected real `initial_pass` terminal now completes exactly the
  Primary bridge unit, releases the Primary/Recovery reservation and returns the Product
  route `no_recovery_needed` with one receipt and no Recovery artifacts.
- A real-declared Case's expected failure trigger no longer overrides an actual valid
  Primary PASS. Deterministic registered pass/failure modes remain exact.
- A verifier-failed Primary still requires the exact three-attempt
  Primary/Recovery-A/Recovery-B group.
- Primary and Recovery A/B registered-command maxima are prospectively versioned to 64;
  the aggregate bridge maximum is 195. Regression Base/Candidate and follow-up retain a
  command maximum of one. Request, token, Tool, wall-time and USD limits are unchanged.

## Files and verification

Changed paths:

- `workbench/src/v37/real-execution-ports-v37g3b.ts`
- `workbench/src/inspect-v37g3a.ts`
- `workbench/tests/v37g3b-real-execution-ports.test.ts`
- `V3_7_G3B_SUCCESSOR_IDENTITY_1_STRUCTURAL_CORRECTION_AMENDMENT.md`
- this report

Verification:

- Narrow Primary-PASS bridge regression: 1 passed, 0 failed.
- Exact `npm run typecheck`: unavailable because the worktree-local ignored
  `.runs/v0-a` compiler path is absent.
- Project-authorized existing compiler:
  `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit`:
  PASS with zero diagnostics.
- No 64-call capacity test, complete product suite or external call was run.

## Unverified

The prospective v2 identity has not been frozen or executed. The new Candidate still
requires Main review and an independent read-only affected-finding audit. Identity 1 and
its real evidence remain immutable and invalid.
