# V3.7 Goal 3B Access-Counter Maxima Correction Closeout

## Final disposition

- **Fact:** `PASS_V3_7_G3B_ACCESS_COUNTER_MAXIMA_CORRECTION`.
- **Fact:** Main accepts immutable Candidate
  `d509d259fc0ea88ffe488a96993641ec19ee6dd0` / tree
  `1f705b1402f486b786d4567d1eb2d40b4ec3542b` after Main review and fresh independent
  focused re-audit both pass.
- **Fact:** `G3B-PREFREEZE-P1-001` is closed. Goal 3B configuration and real execution
  remain separately locked.

## Definition of Done

| Criterion | Result |
|---|---|
| registered real tuples are enforced as hard maxima, not predicted exact observations | PASS |
| actual Primary usage remains tied to independently inspected immutable ledger evidence | PASS |
| Recovery reuses exact observed Primary counters without bypassing maxima/ledger checks | PASS |
| follow-up actual counters match persisted requests and registered maxima | PASS |
| under-cap and at-cap routes pass | PASS |
| over-cap, mismatch and zero-real routes fail before receipt/admission with no fallback | PASS |
| deterministic zero-access behavior remains exact | PASS |
| exact five-path allowlist and frozen configuration/fixture/loader boundary | PASS |
| strict TypeScript | PASS |
| fresh independent focused re-audit | PASS |

## Verification summary

- Focused `G3B counter maxima` tests: 4/4 PASS in Main review and 4/4 PASS in the
  independent re-audit.
- Strict TypeScript: PASS, zero diagnostics.
- `git diff --check`, exact five-path allowlist and configuration/fixture/loader
  immutability: PASS.
- Actual Credential reads, network calls, external Provider calls and real-model calls:
  `0/0/0/0`.
- Full G3A, G1/G2, V2, V3, V3.6 and demo suites were intentionally not rerun under the
  accepted focused-test amendment; the focused test supplied no concrete evidence that
  justified broader reruns.

## Changed files in the accepted Candidate

1. `workbench/src/inspect-v37g3a.ts`
2. `workbench/src/v37/registered-follow-up-v37g3a.ts`
3. `workbench/src/v37/registered-recovery-v37g3a.ts`
4. `workbench/tests/v37g3a-product.test.ts`
5. `docs/reports/V3_7_G3B_ACCESS_COUNTER_MAXIMA_CORRECTION_REPORT.md`

## Unverified and authority limits

- No Credential, network, Provider/model, Docker product or Pi execution was performed.
- Real behavior and cost remain unverified until an exact Goal 3B configuration baseline
  and Execution Prompt are frozen and the user separately authorizes real access.
- This correction does not authorize the third Manifest/configuration write or consume the
  unique Goal 3B Case.

## Next control point

- **Recommendation:** user/Main may review the revised exact Goal 3B freeze proposal and
  decide whether to authorize zero-access configuration-freeze preparation.
- **Fact:** real-access authorization remains a later, separate control point.
