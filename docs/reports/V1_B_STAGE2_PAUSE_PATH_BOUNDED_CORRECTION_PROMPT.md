# V1-B Stage 2 Pause-path Bounded Correction Prompt

You are the original V1-B Preparation Session. Perform exactly one zero-real-
call bounded correction under the accepted V1-B Pause Recovery Amendment.

## Frozen starting identity

The Main Session will replace the following placeholders with the exact Pause
Evidence Baseline before handoff:

```yaml
pause_evidence_baseline_commit: __PAUSE_EVIDENCE_BASELINE_COMMIT__
pause_evidence_baseline_tree: __PAUSE_EVIDENCE_BASELINE_TREE__
original_execution_baseline_commit: 19617319c13a9eecbb325682c920e79d1517b89d
original_execution_baseline_tree: 48d2bee79a551fe53ac36ed12decea2357765645
original_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
original_paused_run: v1b-run-01-parse-duration-r1-a
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
real_calls_authorized: 0
```

Read `AGENTS.md`, `CURRENT_STATE.md`, the formal V1-B Contract, the accepted
Pause Recovery Amendment, the three Stage 2 pause reports, both Stage 1 audit
reports and the exact affected source/tests before editing.

## Allowed source and report paths

- `workbench/src/contracts/v1-types.ts`
- `workbench/src/provider/fixed-provider-v1.ts`
- `workbench/src/pi/pi-run-handle-v1.ts`
- `workbench/src/run-v1.ts`
- `workbench/src/pilot-v1.ts`
- `workbench/src/inspect-v1.ts`
- `workbench/src/product-surface-v1.ts` only if needed for typed paused inspection
- `workbench/src/experiment/v1.ts` only for the one fixed replacement revision
- `workbench/tests/v1b-stage1.test.ts`
- `workbench/tests/v1b-cli.test.ts`
- `workbench/README.md`
- `docs/reports/V1_B_STAGE2_PAUSE_PATH_CORRECTION_REPORT.md`
- `docs/reports/V1_B_STAGE2_PAUSE_PATH_CORRECTION_CLOSEOUT_DRAFT.md`

No other source, fixture, Manifest or control file may change. Do not edit the
historical Stage 2 Manifest or ignored paused evidence.

## Required behavior

### A. Write-before-dispatch evidence

Before a request can leave through the real Provider, append a sanitized,
write-once event that records only:

- Attempt/Session/Workspace/Run identity;
- request ordinal;
- bounded Provider/network/model counter transition;
- token and USD reservation caps;
- a closed typed phase enum.

No request payload, prompt, messages, Tool schema, credential, error text,
Provider response or reasoning may be included.

### B. Typed pause evidence

When an Attempt fails, throw/carry a typed sanitized object rather than free
text. It must distinguish at least:

- failure before credential resolution;
- credential resolution failure before dispatch;
- failure after credential resolution but before Provider request reservation;
- failure after Provider request reservation with usage unavailable;
- invalid/unknown usage after Provider response;
- other bounded runtime failure.

Persist `pause-evidence.json` and an `attempt_paused` journal event before the
Pilot ledger appends `paused`. Include counter snapshots, accumulated known
usage, pending reservation and conservative cost charge. Do not persist the raw
cause.

If dispatch may have occurred and usage is unavailable, charge the complete
pending reservation for conservative accounting. A paused Run remains
nonterminal and noncomparable.

### C. Inspector

Inspector must independently validate:

- write-before-dispatch order;
- pause-evidence/journal/ledger identity and digests;
- counter monotonicity and single-request authority;
- conservative charge equals the pending reservation;
- absence of terminal/RunResult evidence;
- protected/secret/reasoning boundaries.

It must distinguish “coherent paused evidence” from “valid terminal Run”; it may
not allow a pause to satisfy a required terminal cell or enter the effect
denominator.

### D. One fixed replacement revision

Add only the deterministic support needed for Main Session to materialize one
replacement Manifest revision that freezes:

- predecessor Manifest ID above;
- conservative prior debit USD 0.10;
- replacement Pilot cap USD 1.90;
- 24 new planned Run IDs and the unchanged 24-cell treatment layout;
- at most 25 started initial Runs across predecessor plus replacement;
- maximum eight replacement child Attempts;
- no retry, fallback or automatic replacement.

Do not create the final real replacement Manifest; Main Session owns final
Candidate/Manifest/Execution Baseline materialization after audit.

## Deterministic tests

At minimum prove with zero credentials/network/Provider/model calls:

1. failure before credential resolution has no dispatch/reservation;
2. credential resolution failure is typed and sanitized;
3. a synthetic post-reservation Provider failure writes reservation before
   pause, charges the full pending reservation and never starts the next cell;
4. invalid/unknown usage pauses with conservative accounting;
5. coherent paused evidence passes pause-integrity inspection but cannot pass as
   terminal/comparable;
6. missing, duplicated, reordered, tampered or coherently rehashed pause evidence
   fails closed;
7. no credential/error/payload/reasoning marker persists;
8. replacement revision rejects USD cap above 1.90, predecessor mismatch,
   reused Run IDs, more than 24 replacement cells, more than 25 cross-sequence
   starts, retry/fallback/replacement drift and more than eight children;
9. Stage 1 19-test suite and required V1-A/V0-C regressions still pass;
10. strict TypeScript passes.

Use existing deterministic seams; do not call a real Provider and do not install
or download anything.

## Deliverables and stop point

Return:

- Correction Report and Closeout Draft;
- exact source delta;
- commands/exit codes;
- tests and counter totals;
- evidence index;
- corrected source digest proposal;
- focused re-audit checklist;
- structured `CURRENT_STATE_UPDATE_PROPOSAL`.

Do not modify control state, stage or commit, create the final Manifest, start
audit, read credentials, use network, run Stage 2 or enter V2. Stop when the
zero-call correction evidence is complete or any Pause Condition occurs.
