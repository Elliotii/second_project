# V3.7 Goal 3B Successor Identity 1 Structural Correction Amendment

```yaml
status: AUTHORIZED_BY_USER_PREAUTHORIZED_VERSIONED_CORRECTION_ROUTE
finding_1: V37-G3B-S1-P1-PRIMARY-PASS-EXACT-THREE-ASSUMPTION
finding_2: V37-G3B-S1-P1-COMMAND-CAP-DECLARATION-ENFORCEMENT-MISMATCH
failed_identity: v37-g3b-64-request-successor-v1
next_identity: v37-g3b-64-request-successor-v2
real_access_during_correction: false
```

## Exact correction boundary

The failed execution and ignored evidence are immutable. Correction is limited to:

1. let the Host bridge accept the formal V2 `initial_pass` terminal as exactly one
   completed Primary unit, return it to Product, append the normal `run_primary` receipt
   and terminate at `no_recovery_needed` without creating Recovery units;
2. preserve the exact-three-attempt requirement for a verifier-failed Primary that
   enters Recovery;
3. version the Primary, Recovery A and Recovery B registered-command maxima from one to
   64, with a global bridge command maximum of 195, without changing request, token,
   Tool, wall-time or USD ceilings; this restores the already user-authorized 64-capacity
   successor intent while leaving Regression and follow-up command maxima at one;
4. add only the narrow deterministic Primary-PASS bridge regression and the minimum
   contract/report synchronization required for a new Candidate and execution identity.

The capacity correction is prospective only. It does not make Identity 1 valid and does
not rewrite its 38-command observation. No 64-call test, complete product suite or broad
regression is authorized. The narrow Primary-PASS test and project TypeScript check are
the intended Main verification; an independent read-only affected-finding audit remains
required because the correction touches terminalization and budget accounting.

Any different product behavior, task/Verifier/Candidate change, credential or network
access, raw evidence disclosure, Pi change, retry of the old workflow or weakening of
the USD hard caps is out of scope.
