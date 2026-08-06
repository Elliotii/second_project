# V2-B Stage 2 Real Execution Report

```yaml
goal_id: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
session_role: fresh_top_level_v2_b_stage_2_execution_session
report_date: 2026-08-07
sequence_id: v2b-real-20260807-01
status: paused
sequence_reason: run_invalid
recommended_disposition: PAUSE_V2_B_ARCHITECTURE_OR_AUTHORITY
execution_baseline_commit: a76cb3f340d26dc3dd336628761d22546886db27
execution_baseline_tree: ec6072d5718a629915bc5bf6af54d0ebc580f4b7
manifest_id: c64569b516d517e9ebb718808c8c01145d86cb68a0c3a9377749ee2414810ebe
workbench_source_digest: 9dea3f25f46a6dbc47f5446664e0b5d47cbfd47d960798186cf4ac54d07c1e47
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
started_attempts: 1
credential_reads: 1
network_calls: 8
external_provider_calls: 8
real_model_calls: 8
known_real_cost_usd: 0.0004849208
retry_performed: false
fallback_performed: false
replacement_performed: false
source_repair_performed: false
```

## 1. Result

**Fact.** Gate H passed from zero sequence state after Main authorized one
pre-dispatch mechanical correction: the ignored ESM loader and Gate H commands
used the existing, read-only `D:/AI/AI_Projects/project2/.runs/g006/pi` cache
instead of the damaged original `v0-a` cache. The substitute cache was
independently verified Git-clean at the same pinned Pi commit, with public
emitted `pi-agent-core` 0.82.1, `pi-ai` 0.82.1 and TypeScript 5.9.3. Nothing was
copied, installed, linked, restored or mutated.

**Fact.** The first `run-next` activated only Primary. It started one real
Attempt and returned a write-once sequence Pause with reason `run_invalid`.
The Case Pause is evidence-valid, post-dispatch and explicitly
`contingency_eligible: false`. No further Case was run.

**Fact.** The mandatory read-only Inspector exited 1. Its only error was a
secret/reasoning rejection of the parent public Session JSONL. A value-free
classification found eight `reasoning` fields in that Session. Their values
were not printed, returned, persisted separately or otherwise inspected.

**Fact.** A separate secret-only rule classification over all 16 sequence
files found zero bearer, Basic authorization, credential-assignment or model
environment-assignment matches. This narrower diagnostic does not override the
tracked Inspector: sequence integrity and terminal validity remain false.

**Recommendation.** Main should use the Contract-listed disposition
`PAUSE_V2_B_ARCHITECTURE_OR_AUTHORITY`. The evidence/reasoning boundary is
fail-closed, the affected Run cannot be rerun, Contingency is ineligible, and
no current authority permits source repair or a new sequence. This Session does
not accept or close V2-B or V2.

## 2. Frozen identities and Gate H

| Check | Result |
|---|---|
| HEAD / tree | `a76cb3f340d26dc3dd336628761d22546886db27` / `ec6072d5718a629915bc5bf6af54d0ebc580f4b7` |
| Stage 1 Candidate ancestry | `d1825dc8bab16b6f0418e883a11fff132d8e8e52` is an ancestor of HEAD |
| Tracked / staged state | clean |
| Authoritative Pi checkout | clean at `027a5847901b5dde30270abaa1041046cd2b4b55` |
| Read-only execution cache | clean `g006` cache at the same Pi commit |
| Manifest | exact expected ID and source digest |
| Strict TypeScript | exit 0 |
| Focused V2-B suite | 18/18 pass, exit 0 |
| Tracked Stage 2 preflight | `valid: true`, exit 0 |
| Fixed Provider profile | `deepseek` / `deepseek-v4-flash` resolved locally, exit 0 |
| Gate H real counters | all zero |
| Sequence root before access | absent |

The first test invocation passed 16/18 and failed only because two test-spawned
Node children did not inherit the loader supplied as a parent command-line
argument. Main's cache-path authority allowed the ignored-only correction:
the identical loader was supplied through `NODE_OPTIONS`. The complete rerun
then passed 18/18. This occurred before any Credential or network access.

The original `v0-a` cache failure and this substitution are preserved under
`.runs/v2-b/stage2/`. They changed no tracked source, Manifest field, Case,
budget, identity, Direct `AgentHarness` route, SDK/Extension/RPC boundary or
experiment semantics.

## 3. Case activation and identities

| Ordinal | Case | Frozen task / repetition | Activation result | Terminal result |
|---:|---|---|---|---|
| 1 | `primary_positive` | `v1-parse-duration` / 1 | activated once | paused: `execution_boundary`, post-dispatch, invalid for continuation |
| 2 | `contingency_positive` | `v1-parse-duration` / 2 | not activated | forbidden after the Primary post-dispatch invalid stop |
| 3 | `negative` | `v1-stable-format` / 1 | not activated | sequence was already terminally paused |

```yaml
run_id: v2b-real-20260807-01-primary_positive-run
attempt_id: v2b-real-20260807-01-primary_positive-run-primary-attempt-01
attempt_role: primary
session_id: v2b-real-20260807-01-primary_positive-run-parent-session
case_pause_ref: pauses/primary_positive.json
case_pause_sha256: bccc6518ff7356ed59589d40903e88b5660d5bd5d3d096d29bc89b92771ac3f5
recovery_seed_id: null
recovery_group_id: null
candidate_a_id: null
candidate_b_id: null
selection_id: null
selected_candidate_id: null
verifier_result_id: null
```

No Failure Packet, Recovery Seed, A/B Workspace, Candidate terminal,
Selection or Verifier result was created.

## 4. Raw-to-derived usage and cost reconciliation

The parent Session contains 21 JSONL records. Safe structural summarization
found 8 Provider responses with non-zero usage, 10 `toolCall` content blocks
and one final zero-usage assistant entry associated with the boundary stop.

The eight raw usage rows sum as follows:

```yaml
input_tokens: 299+181+114+79+142+94+67+35 = 1011
output_tokens: 77+80+326+44+59+81+81+367 = 1115
cache_read_tokens: 640+896+1152+1536+1536+1664+1792+1920 = 11136
cache_write_tokens: 0
tokens: 1011+1115+11136 = 13262
provider_requests: 8
tool_calls: 10
verifier_runs: 0
```

The eight Provider cost rows sum to exactly USD `0.0004849208`. These raw sums
match both the final sequence ledger entry and `terminal.json`:

| Counter | Reserved | Actual known | Contract cap |
|---|---:|---:|---:|
| Started Attempts | 1 | 1 | 7 sequence |
| Provider requests | 8 | 8 | 8 Attempt / 56 sequence |
| Tool calls | 12 | 10 | 12 Attempt / 84 sequence |
| Tokens | 65,536 | 13,262 | 65,536 Attempt / 458,752 sequence |
| Active execution time ms | 300,000 | 17,878 | 300,000 Attempt / 2,100,000 sequence |
| Verifier runs | 1 | 0 | 1 Attempt / 7 sequence |
| Real cost USD | 0.20 | 0.0004849208 | 0.20 Attempt / 1.40 sequence |

Real-call counters reconcile to one opaque Credential read and eight each of
network, external Provider and real-model calls. Known/conservative unknown
charges are zero; all eight responses carried known usage. The USD 0.20 value
is the frozen fail-closed Attempt reservation, not a claim that USD 0.20 was
spent.

**Inference.** The Attempt reached the eight-request ceiling and needed
another model cycle before a verifier could run. The persisted public reason
is only `execution_boundary`; the exact internal attempted-next-action cause
is not separately terminalized, so this narrower causal statement remains an
inference.

## 5. Inspector, evidence and secret boundary

Inspector returned:

```yaml
exit_code: 1
integrity_valid: false
terminal_valid: false
errors:
  - secret/reasoning scan rejected: <parent Session JSONL path>
```

The Session file is 14,060 bytes with SHA-256
`61866e95e66a9e4bb4b2dd2784bff697e8b2de867a1696800ecf96c1d3d817b8`.
The tracked Inspector's relevant frozen rule rejects the presence of a
`reasoning` or `reasoning_content` field. The diagnostic classifier found
eight `reasoning` fields and did not inspect their values.

**Unconfirmed.** Whether those fields contain substantive private reasoning,
an empty/provider-normalized representation, or another safe representation
was deliberately not inspected. That ambiguity cannot be resolved by this
execution Session without weakening the frozen evidence boundary.

Primary authoritative artifacts:

| Artifact | SHA-256 |
|---|---|
| `.runs/v2-b/stage2/manifest-build.stdout.json` | `27373408ae6564d2e924ea82eb77602c8f24fe335cdccf4f9a2e28545fccafa2` |
| `.runs/v2-b/stage2/sequence/manifest.json` | `781beaa0a3b06de62f364d3de431f4254a5171077e86cad1e678ee75ce200d77` |
| `.runs/v2-b/stage2/sequence/ledger.jsonl` | `214a1ce95a17af0da17506a9e4b1cbb30721beb82fd0a44bb12bbe9d006e6825` |
| `.runs/v2-b/stage2/sequence/pauses/primary_positive.json` | `bccc6518ff7356ed59589d40903e88b5660d5bd5d3d096d29bc89b92771ac3f5` |
| `.runs/v2-b/stage2/sequence/terminal.json` | `d78accdadd1851eee655d87f9410a9822ab4ae81b632e01d852f7d3453f146cc` |
| Primary substrate `journal.jsonl` | `6ac840247844f09b7ad3647a86bc7f6152cf68cbec8efa1d826561bb0893b832` |

## 6. Commands and exit codes

Relevant execution and verification commands, including pre-dispatch
mechanical diagnostics, were:

| Command | Exit |
|---|---:|
| `git rev-parse HEAD`, tree, clean tracked/staged and Candidate ancestry checks | 0 |
| authoritative `.upstream/pi` HEAD/clean checks | 0 |
| original direct Manifest builder with damaged `v0-a` cache unavailable | 1 (`ERR_MODULE_NOT_FOUND`) |
| `g006` cache HEAD/clean/version/public-dist checks | 0 |
| initial loader path smoke without `./` | 1 (mechanical path syntax) |
| second inline smoke attempt | 1 (PowerShell quoting) |
| combined smoke/builder call under a 10-second outer command limit | 124, product exit unknown; zero dispatch |
| `node --experimental-loader ./.runs/v2-b/stage2/public-pi-loader.mjs ./.runs/v2-b/stage2/public-pi-smoke.mjs` | 0 |
| frozen `v2b-stage2 build-manifest ...` | 0 |
| `node ./.runs/v2-b/stage2/materialize-manifest.mjs` | 0 |
| strict TypeScript through `g006` TypeScript 5.9.3 and ignored path map | 0 |
| first focused `node --test workbench/tests/v2b-stage1.test.ts` | 1, 16/18 due child loader propagation |
| same focused suite with identical loader in `NODE_OPTIONS` | 0, 18/18 |
| tracked `v2b-stage2 preflight --manifest ...` | 0, `valid: true` |
| local fixed Provider-profile preflight | 0, zero access |
| pre-access identity/clean/cache/absent-sequence checks | 0 |
| `node ./.runs/v2-b/stage2/run-next-with-credential.mjs` | 0, returned typed sequence Pause |
| tracked `v2b-stage2 inspect --manifest ... --sequence-root ...` | 1, frozen Inspector rejection |
| safe Session usage and rule classifiers | 0 |
| Gate K identity, source, protected-path, Pi and clean-state checks | 0 |

The exact child command launched by the opaque wrapper was:

```text
node --experimental-loader ./.runs/v2-b/stage2/public-pi-loader.mjs
  workbench/src/cli.ts v2b-stage2 run-next
  --manifest .runs/v2-b/stage2/manifest-build.stdout.json
  --sequence-root .runs/v2-b/stage2/sequence
  --stage2-real-authority
```

The wrapper used Node's environment-file loader, never printed, returned,
hashed, compared, measured or persisted the Credential value, passed it only
to this child, and cleared its process-local references afterward.

## 7. Gate K and source delta

**Fact.** Gate K was proven before these tracked reports were created:

- HEAD and tree still matched the Execution Baseline;
- tracked and staged state were clean;
- Manifest and live workbench source identities still matched;
- authoritative Pi and the `g006` read-only cache were clean at the pinned Pi commit;
- both protected Primary Workspace paths were byte-identical to their frozen source;
- the writable `src/subject.ts` differed, but no verifier ran and no correctness claim is made.

The only tracked delta after Gate K is this report and
`docs/reports/V2_B_CLOSEOUT_DRAFT.md`. No source, test, fixture, Skill, Prompt,
Verifier, Manifest, control-state, Pi, reference, Git index, commit or branch
was changed.

## 8. Unverified claims and decisions required

- No valid Positive Seed was observed.
- No A/B Candidate ran, so real recovery effectiveness and strategy comparison remain unverified.
- No Negative Case ran, so the required valid negative initial-pass/no-branch evidence is absent.
- The Inspector did not accept the terminal evidence.
- The exact semantic content of the rejected reasoning fields is intentionally unverified.
- V2-B DoD and the V2 Version Question remain unanswered.

Main/user must decide whether to accept the recommended Pause and whether any
future bounded evidence-boundary investigation or new execution authority is
warranted. This report grants neither.

## 9. `CURRENT_STATE_UPDATE_PROPOSAL`

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  active_goal: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
  stage_2_status: paused_after_one_primary_attempt
  execution_baseline_commit: a76cb3f340d26dc3dd336628761d22546886db27
  sequence_id: v2b-real-20260807-01
  manifest_id: c64569b516d517e9ebb718808c8c01145d86cb68a0c3a9377749ee2414810ebe
  primary_run_id: v2b-real-20260807-01-primary_positive-run
  primary_attempt_id: v2b-real-20260807-01-primary_positive-run-primary-attempt-01
  sequence_status: paused
  sequence_reason: run_invalid
  inspector_integrity_valid: false
  inspector_terminal_valid: false
  inspector_error: parent_session_reasoning_field_rejected
  positive_seed_observed: false
  candidates_executed: 0
  negative_executed: false
  real_call_counters:
    credential_reads: 1
    network_calls: 8
    external_provider_calls: 8
    real_model_calls: 8
  actual_usage:
    provider_requests: 8
    tool_calls: 10
    tokens: 13262
    active_execution_time_ms: 17878
    verifier_runs: 0
    real_cost_usd: 0.0004849208
  retry_fallback_replacement: 0
  stage_2_source_delta: 0
  recommended_disposition: PAUSE_V2_B_ARCHITECTURE_OR_AUTHORITY
  final_v2_b_acceptance: pending_main_and_user
  final_v2_acceptance: pending_main_and_user
  v3_authorized: false
```
