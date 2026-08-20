# V3.7 Goal 3B Access-Counter Maxima Pre-Freeze Correction Prompt

```yaml
prompt_id: V3_7_G3B_ACCESS_COUNTER_MAXIMA_CORRECTION
status: FROZEN_FOR_ORIGINAL_IMPLEMENTATION_SESSION
owner: original_V3_7_G3A_implementation_session
authority: V3_7_G3B_ACCESS_COUNTER_MAXIMA_CORRECTION_AMENDMENT.md
amendment_freeze_commit: 4b995da23fc2c9e4833ce3c0941d88ef403e5083
amendment_freeze_tree: 7068b5a2f4c192359cb529e235afe27ece693f8e
finding: G3B-PREFREEZE-P1-001
candidate_commits_max: 1
real_access: false
```

## 1. Mission

Implement only the accepted pre-freeze correction: real-declared G3A Primary and
follow-up access values are registered hard maxima, while actual usage is derived from
the already accepted immutable execution evidence and may legally be below those maxima.

Do not freeze or append the Goal 3B Case. Do not modify any existing registration,
Manifest, Envelope, profile, loader, schema, shared V2/V3/V3.6 source, UI/API source or
accepted report. Do not access a Credential, network, external Provider/model, Docker
product execution or Pi.

## 2. Required read order

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `V3_7_CHARTER.md`, especially Section 8;
4. `V3_7_G3B_ACCESS_COUNTER_MAXIMA_CORRECTION_AMENDMENT.md`;
5. `docs/reports/V3_7_G3B_FREEZE_PROPOSAL.md`;
6. this Prompt;
7. the three allowlisted source/test files and their directly imported accepted evidence
   types needed to understand the existing behavior.

The Amendment and this Prompt override advisory prose. Stop if they conflict with the
Charter or the frozen starting baseline supplied by Main.

## 3. Exact allowlist

You may modify only:

```text
workbench/src/inspect-v37g3a.ts
workbench/src/v37/registered-follow-up-v37g3a.ts
workbench/tests/v37g3a-product.test.ts
docs/reports/V3_7_G3B_ACCESS_COUNTER_MAXIMA_CORRECTION_REPORT.md
```

No other path may be staged or committed. Generated test evidence must remain ignored
under `.runs/`. The user-owned untracked
`docs/reports/SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md` is unreadable task-external content:
do not open, modify, stage or commit it.

## 4. Implementation contract

### 4.1 Preserve configuration and construction authority

- Keep every existing Schema 1 field name and object shape unchanged.
- Keep exact Host construction-authorization equality against the registered Case,
  Manifest, follow-up profile, Primary maxima, follow-up maxima, Candidate authority and
  Regression authority.
- Do not edit loader/fingerprint sources or configuration bytes.
- Deterministic zero-access Cases must retain exact zero counters.

### 4.2 Primary actual usage

For real-declared V2 terminals:

1. Run the accepted `inspectRunV2A()` against the terminal's own exact actual counter
   tuple, so its existing identity, Session, Journal, Verifier, Candidate, Selection,
   budget and terminal checks remain intact.
2. Independently derive the total Provider dispatches from the already Inspector-validated
   Primary Journal and Candidate budget evidence. Do not trust a browser, caller summary
   or new side artifact.
3. Require actual `network_calls`, `external_provider_calls` and `real_model_calls` each to
   equal that derived Provider-dispatch total.
4. Require `credential_reads` to be a positive safe integer.
5. Require all four actual values to be less than or equal to the registered maxima.
6. Any failure must occur before a workflow transition receipt and without fallback.

Do not modify shared `workbench/src/inspect-v2.ts` or its result schema.

### 4.3 Follow-up actual usage

For a real-declared follow-up:

1. Treat the Host-loaded provider-profile values as maxima.
2. Use the persisted, digest-validated V3.6 Runtime Manifest as the actual usage record.
3. Require actual `network_calls`, `external_provider_calls` and `real_model_calls` each to
   equal `provider_requests`.
4. Require `credential_reads` to be a positive safe integer.
5. Require all four actual values to be less than or equal to the registered maxima and
   retain all existing binding/observation/Verifier/Outcome recomputation.
6. Apply the same rules during initial execution and independent reopen/recomputation.
7. Any failure must produce no workflow receipt, no admission and no deterministic
   fallback.

### 4.4 No semantic expansion

Do not add a new budget family, policy engine, profile type, workflow stage, artifact
family, general counter framework, retry path, compatibility reader or runtime adapter.
Small private helpers inside the two allowlisted source files are permitted.

## 5. Required tests

Add only bounded tests proving:

- Primary under-cap actual usage with ledger equality passes;
- Primary at-cap actual usage with ledger equality passes;
- Primary over-cap fails before receipt;
- Primary counter/derived-ledger mismatch fails before receipt;
- follow-up under-cap and at-cap request-aligned usage passes;
- follow-up over-cap and request mismatch fail before receipt/admission;
- real-declared all-zero actual usage fails;
- deterministic Primary/follow-up exact-zero routes remain green;
- config-only, ports-only, wrong authorization, disabled historical read-only, exact
  supplied Regression port and no-fallback tests remain green.

Tests must use local deterministic ports, Faux runtime or registered local test seams.
Actual external-operation counters must remain zero.

## 6. Verification commands

From `workbench/`, run:

```text
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g3a-authority.test.ts tests/v37g3a-product.test.ts tests/v37g3a-http-ui.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g1-registered-recovery.test.ts tests/v37g2-runtime-effective-followup.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2a-recovery.test.ts tests/v2a-cli.test.ts tests/v2a-post-audit.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g1-evidence-to-candidate.test.ts tests/v3g2-validate-promote-reject-rollback.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v36g1-http-ui.test.ts tests/v36g2-change-handoff.test.ts tests/v36g2-product-entry.test.ts tests/v36-product-polish.test.ts
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit
```

Also run the narrow demo smoke only if all deterministic checks above pass:

```text
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs scripts/start-v37g3a-demo.ts --smoke --port 0
```

Do not install dependencies or substitute another compiler. If a command is unavailable,
record the exact local limitation without broadening scope.

## 7. Report and Candidate

Write `docs/reports/V3_7_G3B_ACCESS_COUNTER_MAXIMA_CORRECTION_REPORT.md` containing only:

- disposition recommendation;
- exact changed files and concise behavior summary;
- exact verification commands/results;
- zero-access counters;
- unverified items and any deviations;
- Candidate commit/tree/parent.

After all required checks pass, stage only the four allowlisted paths and create exactly
one commit with message:

```text
fix(v3.7): validate real access against frozen maxima
```

Return the immutable Candidate commit/tree/parent to Main and stop. Do not update
`CURRENT_STATE.md`, accept the correction, start an audit, create Goal 3B configuration,
or request/consume real authority.

## 8. Hard stop

Return `DECISION_REQUIRED` with no Candidate if shared V2/V3.6 source, a loader source,
Schema/configuration, another report, an external call or any path outside the allowlist
would be required, or if a required deterministic proof cannot pass honestly.
