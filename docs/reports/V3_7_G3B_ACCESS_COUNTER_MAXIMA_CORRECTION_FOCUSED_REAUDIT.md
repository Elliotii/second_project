# V3.7 Goal 3B Access-Counter Maxima Correction Focused Re-audit

```yaml
status: PASS_V3_7_G3B_ACCESS_COUNTER_MAXIMA_CORRECTION_FOCUSED_REAUDIT
audited_on: 2026-08-21
finding: G3B-PREFREEZE-P1-001
candidate_commit: d509d259fc0ea88ffe488a96993641ec19ee6dd0
candidate_tree: 1f705b1402f486b786d4567d1eb2d40b4ec3542b
candidate_parent: 04ad1a29aaf3aeaa527ff23dac9a52d72a2b99d1
main_review_control_commit: b2ec47f179c74774ba02ce37d3992efce557da8c
audit_mode: fresh_independent_read_only_finding_specific
goal_3b_started: false
real_access: false
```

## Disposition

**Fact:** The immutable Candidate passes this finding-specific re-audit with no finding.
It closes the repeated maxima-as-exact-observation obstruction while preserving the
registered maxima, independently inspected usage-ledger equality, deterministic exact
zero behavior and fail-closed negative routes. This audit does not accept the correction,
freeze Goal 3B configuration or authorize real access.

## Focused review

- **Fact:** The Candidate delta is exactly five paths: the G3A Primary Inspector,
  registered Recovery service, registered follow-up service, one product test file and
  the bounded implementation report. Registry/configuration, fixtures, loader and
  Host-registration/profile sources are unchanged.
- **Fact:** `validatePrimaryTerminalV37G3A` first runs the unchanged V2 Inspector against
  the terminal's exact actual tuple. It then derives Provider dispatches from the single
  V2-inspected `primary_settled` Journal event and inspected Candidate budget evidence,
  requires the three dispatch counters to equal that ledger, requires a positive
  Credential count and enforces all four registered maxima.
- **Fact:** The registered Recovery service passes the terminal's exact actual tuple to
  the unchanged V2 Inspector. Product action and reopen paths revalidate the Primary
  terminal through the G3A Inspector before Recovery is available or recomputed, so the
  ledger/maxima gate remains in force.
- **Fact:** Follow-up execution requires the returned Runtime object to equal the
  canonical persisted, digest-valid V3.6 Runtime Manifest. Both initial execution and
  recomputation validate safe actual counters, positive real-declared usage,
  `provider_requests` alignment and registered maxima before Evidence/Outcome admission.
- **Fact:** The focused negative cases leave no workflow transition receipt or accepted
  admission and invoke no fallback. Deterministic Primary, Recovery and follow-up retain
  exact zero counters.

## Verification

From `workbench/`:

```text
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 --test-name-pattern="G3B counter maxima" tests/v37g3a-product.test.ts
```

Result: **PASS**, 4 tests, 0 failures, 0 skipped, 34.6 seconds.

```text
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit
```

Result: **PASS**, exit 0, zero diagnostics.

Additional read-only integrity checks:

- `git diff --check 04ad1a29aaf3aeaa527ff23dac9a52d72a2b99d1 d509d259fc0ea88ffe488a96993641ec19ee6dd0` — PASS.
- exact Candidate path comparison against the amended five-path allowlist — PASS.
- `git diff --exit-code` across registry/configuration, fixture, loader,
  Host-registry/workflow-registration and follow-up-profile paths — PASS, no delta.
- actual operations performed by the local deterministic/Faux tests: Credential reads
  `0`, network calls `0`, external Provider calls `0`, real-model calls `0`.

## Unverified items and limits

- No real Credential, network, Provider/model, Docker product or Pi execution was run or
  authorized; real behavior remains unverified until a separately frozen and authorized
  Goal 3B execution.
- Full G3A, G1/G2, V2, V3, V3.6 and demo suites were not run, as required by the accepted
  focused-test Amendment. The focused command supplied no concrete shared-regression
  evidence that would justify expanding the matrix.
- This audit did not inspect unrelated product limitations, alter source/control state,
  repair the Candidate, create a commit, accept the correction or begin Goal 3B.

## Recommendation

**Recommendation:** Main may accept this bounded correction and return to the exact Goal
3B freeze review. Configuration freeze and real-access authorization remain separate
user/Main control points.
