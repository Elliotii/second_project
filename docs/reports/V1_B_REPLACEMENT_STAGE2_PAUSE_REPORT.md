# V1-B Replacement Stage 2 Pause Report

```yaml
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
session_role: fresh_dedicated_no_source_edit_replacement_stage2_execution
report_date: 2026-08-05
status: PAUSE_V1_B_REPLACEMENT_PILOT
automatic_exit: true
completed_replacement_initial_runs: 0
started_replacement_initial_runs: 1
started_replacement_child_attempts: 0
comparable_replacement_runs: 0
retry_performed: false
fallback_performed: false
second_replacement_performed: false
source_repair_performed: false
v2_entered: false
```

## 1. Observed execution state

**Fact.** Gate K began and ended on replacement Execution Baseline commit
`f7cf45150724061269179716e1b2f487db1ff5c7`, tree
`4fe46f3955b069f52dd5f581d794b860ef159b4e`, with tracked and staged state
clean. The current V1-B source digest was
`b1fa032d42c4e381c880b8092bddb5a625169ea44ee2e0ea238da1595d0edf92`.
The pinned root Pi was at
`027a5847901b5dde30270abaa1041046cd2b4b55` and clean. `reference/` was
absent in this fresh worktree before execution and remained absent.

**Fact.** The replacement Manifest ID was
`4f04542ea59b59110e2d9d62e08067932bf868884e05c153cd5a6bed08575b29`.
It contained 24 unique planned cells bound to Candidate
`6a4f6529c4cb2a3e5c726d3bc8cf6beb515b720e`, Candidate tree
`7ab79aa4073baab1c7570424701ebf1302b34837`, the source digest above, a
USD 0.10 predecessor debit, a USD 1.90 replacement cap, a 25-initial-start
sequence cap and an eight-child replacement cap. The replacement sequence
authority ID was
`c58112fff77b0836a44668395d6ab97ece10996583254c9029c143ab84e01bd1`.

**Fact.** Only the two authorized ignored local dependency Junctions were
created. They resolve to the pre-existing directories
`D:/AI/AI_Projects/project2/workbench/node_modules` and
`D:/AI/AI_Projects/project2/.runs/v0-a/pi`. No dependency was installed or
downloaded. Strict TypeScript, the focused current V1-B suite (31 of 31 tests)
and the exact replacement preflight exited 0. Preflight reported the next cell
as `v1b-replacement-cell-01`, all four real-call counters as zero and did not
create the Pilot root.

**Fact.** Gate L was completed before credential resolution. The current
official DeepSeek pricing and Chat Completions documentation and the pinned Pi
descriptor agreed on `deepseek-v4-flash`, `https://api.deepseek.com`, the
Chat Completions route, non-thinking mode, tool availability, required usage
fields and the frozen prices. No Provider call was made for this checkpoint.

**Fact.** The authorized credential file yielded exactly one non-empty,
non-duplicated `DEEPSEEK_API_KEY` value to the bounded child process. The value
was handled opaquely, was not printed, hashed, measured or persisted, and was
removed from the parent process environment after the child exited.

## 2. The single live invocation and automatic exit

The only live command was:

```text
node workbench/src/cli.ts v1b run-next
  --manifest fixtures/manifests/v1/v1b-stage2-replacement-execution.json
  --pilot-root .runs/v1-b/stage2-replacement/pilot
  --replacement-sequence-state fixtures/manifests/v1/v1b-stage2-replacement-sequence-authority.json
  --stage2-real-authority
```

**Fact.** The command exited 1 after approximately 13.7 seconds with the
sanitized error `V1BTypedPauseError: V1-B execution paused at a typed
boundary`. It returned no CLI result JSON. The Manifest, sequence journal and
Pilot ledger identify the planned and started Run as
`v1b-replacement-run-01-parse-duration-r1-a`.

The required read-only Inspector command was then run:

```text
node workbench/src/cli.ts v1b inspect
  --pilot-root .runs/v1-b/stage2-replacement/pilot
  --run v1b-replacement-run-01-parse-duration-r1-a
```

**Fact.** Inspector exited 1 and returned `integrity_valid: false`,
`pause_integrity_valid: false`, `terminal_valid: false`,
`comparable: false`, `run_result: null`, `terminal: null` and
`pause_evidence: null`. Its errors were:

1. `paused Run violates single-request authority`;
2. three instances of `pause counter snapshot invalid`;
3. `post-reservation pause counter snapshot/mode drift`;
4. `pre-reservation pause carries dispatch/reservation charge`;
5. `post-reservation pause phase lacks pending reservation`.

**Fact.** The frozen per-Attempt Provider-request counter reached eight. The
tracked pause artifact classified request ordinal 8 as
`invalid_or_unknown_usage_after_provider_response`, while recording
`pending_provider_reservation: null` and a zero conservative usage charge.
The last journaled pre-dispatch reservation was `reservation-0017`, with a
USD 0.0996489024 cost cap and a 55,793-token cap.

**Fact.** These observations satisfy the automatic-exit rules for a reached
per-Attempt cap and for disagreement between the append-only evidence and the
tracked Inspector. No second cell was launched. The Run was not retried and no
Recovery child was started, forced, suppressed or repeated.

**Inference.** The produced pause state cannot be accepted by the frozen
Inspector and cannot support coherent terminal or exact-cost reconciliation.
Continuation would require a frozen-product repair or a different authority;
neither is authorized in this Session.

## 3. Ledger, lineage and terminal position

**Fact.** The Pilot ledger contains 26 append-only entries: 24 `planned`, one
`started` and one `paused`. The final two state transitions are:

```text
seq 25  2026-08-05T09:19:53.402Z  started
seq 26  2026-08-05T09:20:05.614Z  paused
        cause_id=pause_invalid_or_unknown_usage_after_provider_response
```

**Fact.** The replacement sequence claim contains exactly two events:
`replacement_pilot_claimed` and `initial_run_started` for the Run above. The
sequence coordinator's read-only current-state validation passed. Across the
original and replacement Pilots, two initial Runs have now been started, which
is within the cap of 25. The replacement has zero child Attempts, within the
cap of eight.

**Fact.** The Run journal contains 12 events:
`run_started`, `workspace_materialized`, `attempt_started`, eight
`provider_request_reserved` events and `attempt_paused`. Its single Attempt is
`v1b-replacement-run-01-parse-duration-r1-a-a1`, with Session
`v1b-session-4c9ef8c5-c35d-4991-8cc9-ab2a84b01760` and Workspace
`v1b-replacement-run-01-parse-duration-r1-a-workspace`.

**Fact.** No `terminal.json`, `terminal-evidence.json` or `run-result.json`
exists. There are zero valid terminal Runs, zero comparable Runs and no valid
denominator for any A/B/C observation. No aggregate was run because Gate O was
not reached.

## 4. Conservative and actual cost position

**Fact.** The pause artifact persists this accumulated-known subtotal:

```yaml
provider_requests: 8
tool_calls: 10
tokens: 11670
active_execution_time_ms: 0
verifier_runs: 0
child_attempts: 0
cost_usd: 0.0003864952
```

**Fact.** Immediately before request 8, the journaled known replacement spend
was USD 0.0003510976. The request-8 pre-dispatch reservation allowed the
remaining USD 0.0996489024. Independently applying the fail-closed full
reservation to a response classified as invalid/unknown yields a conservative
replacement debit of exactly USD 0.10.

**Fact.** Cost disposition at exit is therefore:

```yaml
predecessor_conservative_debit_usd: 0.10
replacement_persisted_known_subtotal_usd: 0.0003864952
replacement_actual_total_usd: unknown
replacement_fail_closed_conservative_debit_usd: 0.10
authorized_sequence_fail_closed_conservative_total_usd: 0.20
replacement_actual_cost_cap_usd: 1.90
```

**Fact.** The persisted artifact itself reports a zero conservative charge and
no pending reservation, so its USD 0.0003864952 subtotal is not treated as a
proof of exact total external cost. The conservative USD 0.10 replacement
debit is below the USD 1.90 cap, but budget headroom does not authorize another
cell after the integrity exit.

## 5. Preservation checks and evidence paths

**Fact.** The tracked secret/reasoning scanner passed across all 12 persisted
Pilot and sequence-claim files with zero matches. The two protected Task paths,
`package.json` and `test/public.test.mjs`, remained byte-identical to the frozen
workspace source. No source, test, fixture, Manifest, sequence authority,
Contract, control-state, Pi or reference file was edited, staged or committed.

Primary preserved evidence:

- `.runs/v1-b/stage2-replacement/pilot/ledger.jsonl`
  (`e6880035410455f7deb6d13b2b0e1bdb796d8b132779eb919a6c3a6d9ce1c9f6`);
- `.runs/v1-b/stage2-replacement/pilot/manifest.json`
  (`ee8cfcf4e1f7ab4390205f7eb0bbac23e21cdf36a18a56ce0beda3dce0ea33d6`);
- `.runs/v1-b/stage2-replacement/pilot/runs/v1b-replacement-run-01-parse-duration-r1-a/journal.jsonl`
  (`30ca9d89d28a7fa68c6302ed7d6ffb17804acdedd627b989d0e92047091e7f86`);
- `.runs/v1-b/stage2-replacement/pilot/runs/v1b-replacement-run-01-parse-duration-r1-a/pause-evidence.json`
  (`93725002514d4cf56c3df382be0c526e8e8080c763c4dd7091a2a608df399a61`);
- `.runs/v1-b/replacement-sequence-claims/4f04542ea59b59110e2d9d62e08067932bf868884e05c153cd5a6bed08575b29.jsonl`
  (`3619ede467bad586eca02853583919e0aedf0753702a8b3756b4cc70bff09727`).

The official Gate L sources observed on 2026-08-05 were:

- `https://api-docs.deepseek.com/quick_start/pricing/`;
- `https://api-docs.deepseek.com/api/create-chat-completion/`.

## 6. Smallest Main Session decision needed

**Recommendation.** Accept this automatic pause, classify the replacement
Pilot evidence as non-comparable and V1-B/V1 as inconclusive under the current
authority, and decide the V1-B/V1 closeout disposition. There is no authorized
execution continuation: any source repair, retry, fallback, second replacement
or new Pilot would require an explicit new user-approved governance decision
outside this Session.
