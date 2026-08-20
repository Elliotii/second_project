# V3.7 Goal 3B Access-Counter Maxima Correction Main Review

```yaml
status: PASS_V3_7_G3B_ACCESS_COUNTER_MAXIMA_CORRECTION_MAIN_REVIEW
reviewed_on: 2026-08-21
candidate_commit: d509d259fc0ea88ffe488a96993641ec19ee6dd0
candidate_tree: 1f705b1402f486b786d4567d1eb2d40b4ec3542b
candidate_parent: 04ad1a29aaf3aeaa527ff23dac9a52d72a2b99d1
finding: G3B-PREFREEZE-P1-001
goal_3b_started: false
real_access: false
```

## Disposition

Main preliminary review passes the immutable five-path Candidate. The repeated Recovery
exact-equality obstruction is removed without weakening maxima or ledger checks. The
Candidate is ready for the required fresh finding-specific read-only re-audit; it is not
yet accepted and grants no Goal 3B configuration or execution authority.

## Reviewed behavior

- Real-declared Primary is inspected against its exact actual tuple, then independently
  checked against Provider dispatches derived from the already V2-validated Primary
  Journal and Candidate budget evidence.
- Actual Credential/network/Provider/model values remain safe integers, require positive
  real access, align with Provider dispatches and cannot exceed registered maxima.
- Registered Recovery passes the already checked terminal's exact actual tuple to the
  unchanged V2 Inspector, preserving every V2 identity, Session, Candidate, Selection,
  budget and terminal check.
- Follow-up validates the returned object against the canonical persisted Runtime
  Manifest, its digest, Provider-request alignment, positive real access and registered
  maxima during execution and reopen.
- Deterministic zero-access Primary/Recovery/follow-up retains exact zero behavior.
- Negative paths fail before receipt/admission and use no fallback.

## Main verification

| Check | Result |
|---|---|
| `G3B counter maxima` focused tests | PASS, 4/4 in 34 seconds |
| strict TypeScript | PASS, zero diagnostics |
| exact five-path allowlist | PASS |
| `git diff --check` | PASS |
| registry/config/fixture delta | PASS, none |
| actual Credential/network/Provider/model operations | `0/0/0/0` |
| broad G3A/G1/G2/V2/V3/V3.6/demo reruns | not run by accepted focused amendment |

The implementation report's `SELF_RESOLVED_BY_SESSION_HANDOFF` placeholders are resolved
by the immutable Git identities recorded above and do not change Candidate content.

## Next action

Launch one fresh independent read-only audit limited to the exact Candidate diff,
`G3B-PREFREEZE-P1-001`, the same four focused tests, strict TypeScript, allowlist/config
immutability and zero-access proof. Do not run unrelated suites or start Goal 3B.
