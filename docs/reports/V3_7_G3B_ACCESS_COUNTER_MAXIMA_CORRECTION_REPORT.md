# V3.7 Goal 3B Access-Counter Maxima Correction Report

## Disposition recommendation

`PASS_V3_7_G3B_ACCESS_COUNTER_MAXIMA_CORRECTION_CANDIDATE`

Recommend Main review the immutable Candidate and, if preliminary review passes, freeze it for the required fresh independent focused read-only audit. This report does not accept the correction, freeze Goal 3B configuration or authorize real access.

## Changed files and behavior

- `workbench/src/inspect-v37g3a.ts`: real-declared Primary terminals are inspected against their exact actual tuple; independently inspected Primary Journal and Candidate budget evidence supplies the Provider-dispatch ledger; actual counters must align with that ledger, remain positive where required and not exceed registered maxima. Deterministic counters remain exact.
- `workbench/src/v37/registered-recovery-v37g3a.ts`: the registered Recovery bridge passes the terminal's exact actual counter tuple to the unchanged V2 Inspector.
- `workbench/src/v37/registered-follow-up-v37g3a.ts`: initial execution and reopen validate the canonical persisted Runtime Manifest digest, actual request alignment, positive real access and registered maxima; deterministic counters remain exact.
- `workbench/tests/v37g3a-product.test.ts`: one focused `G3B counter maxima` group proves under-cap and at-cap success, fail-closed negative cases, retained deterministic zero-access Recovery and zero actual external operations.
- `docs/reports/V3_7_G3B_ACCESS_COUNTER_MAXIMA_CORRECTION_REPORT.md`: this bounded implementation report.

## Verification

- `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit` — PASS, exit 0.
- `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 --test-name-pattern="G3B counter maxima" tests/v37g3a-product.test.ts` — PASS, 4 tests, 0 failures.
- `git diff --check` — PASS.
- `git diff --exit-code 04ad1a29aaf3aeaa527ff23dac9a52d72a2b99d1 -- workbench/config workbench/fixtures fixtures` — PASS; frozen registry/config/fixture bytes unchanged.
- Exact allowlist inspection — PASS; Candidate paths are limited to the five files listed above. The unrelated untracked user report is excluded.

## Access counters

Actual operations performed by the deterministic tests: Credential reads `0`; network calls `0`; external Provider calls `0`; real-model calls `0`.

## Unverified items and deviations

- No real Provider, Credential, network, model, Docker product or Pi execution was performed or authorized.
- Full G3A, G1/G2, V2, V3, V3.6 and demo suites were not run, as required by the accepted focused-test amendment; the focused test produced no concrete shared-regression evidence.
- No deviation from the amended five-path allowlist or one-Candidate budget.

## Candidate identity

- parent: `04ad1a29aaf3aeaa527ff23dac9a52d72a2b99d1`
- candidate commit: `SELF_RESOLVED_BY_SESSION_HANDOFF`
- candidate tree: `SELF_RESOLVED_BY_SESSION_HANDOFF`
