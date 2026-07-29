# G006 Phase 3 Real-model Completion Verification Feasibility Clean Retry Report

> Execution date: 2026-07-29 to 2026-07-30 (Asia/Hong_Kong)
> Goal: `G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY`
> Execution disposition: `PASS_REAL_MODEL_FEASIBILITY`
> Architecture acceptance: `ACCEPT_G006_PASS_REAL_MODEL_FEASIBILITY_WITH_SESSION_BOUNDARY_DEVIATION_NOTED` (2026-07-30)

## 1. Executive result

**Fact.** G006 completed exactly one fresh, write-once Baseline/Candidate pair
using the reviewed implementation commit
`05da78bc24d6bab92dc44ee44912a57159e45e72`, source digest
`c99e84ba09318a73482a2d790e10eb63e3a2240d0b0c209a843112ff62c82af4`,
pinned Pi commit `027a5847901b5dde30270abaa1041046cd2b4b55`, and
`deepseek-v4-flash` at thinking level `high`.

**Fact.** Gates A through E passed. Both variants completed a real public
emitted `AgentHarness` coding cycle, used the restricted Tools, settled, and
then passed the external Verifier. The pair used eight provider requests in
total and no retry, second model or second attempt.

**Fact.** Candidate passed its first Verifier, so the conditional recovery path
was not triggered. No synthetic failure was introduced. The recovery path is
therefore `unobserved`, as explicitly allowed by the Contract.

**Inference.** Direct public emitted `pi-agent-core` `AgentHarness` is feasible
for this bounded current DeepSeek V4 Flash coding route with auditable
subscriber response observation, Tool/ToolResult correlation, settled-before-
Verifier ordering, redacted Session persistence and Baseline/Candidate initial
fairness.

**Decision.** The user accepted the G006 execution disposition and Closeout on
2026-07-30 without requiring a separate independent-session audit. G006 is
closed.

**Recommendation.** Preserve the accepted G006 evidence and do not rerun it.
Do not infer Completion Verification effectiveness, real-model recovery
success, final Pi Go, V0 architecture freeze or portfolio-scale performance.
The next architecture decision should explicitly address whether the original
Phase 3 requirement for observed Candidate behavior change needs a separate
bounded activation case before a V0 Version Charter.

## 2. Authorization and frozen scope

The user separately authorized:

1. the accepted-contract baseline commit;
2. Stage 1 Gate 0 implementation;
3. the reviewed implementation-baseline commit;
4. Stage 2 real-model execution.

Stage 2 authorization was recorded in ignored preflight evidence and bounded
to:

```yaml
paired_attempts: 1
variants: [baseline, candidate]
model_ids: [deepseek-v4-flash]
candidate_recovery_cycles_max: 1
alternate_model_fallback: false
additional_attempt: false
```

**Fact.** G005 code/evidence, `.upstream/pi`, Pi Core, `reference/`, the formal
Workbench and the frozen G006 implementation were not modified during Stage 2.
No additional Git commit was created.

### Execution-session boundary deviation

**Fact.** The Contract named a future dedicated G006 execution Session as the
execution owner, while the Main Session actually implemented and executed
G006. This was a workflow/governance deviation, not a change to the frozen
technical inputs, budgets or evidence contract.

**Fact.** No separate independent-session audit was performed. The same Main
Session that executed G006 also performed the first source/evidence review.
The user explicitly waived an additional independent audit for this Goal and
accepted the disposition on 2026-07-30.

**Inference.** No technical-evidence invalidation was observed: the reviewed
commit and source digest were fixed before provider calls, the attempt was
write-once, raw artifacts remained correlated, and secret scans passed. Review
independence was nevertheless weaker than the declared ownership model.

**Decision.** Future execution Goals use a fixed split: the Main Session owns
research synthesis, Contract and architecture decisions, user discussion and
final acceptance; a dedicated Goal Session owns implementation/execution and
produces the handoff report. This decision does not retroactively claim that
G006 received an independent audit.

## 3. Current external API checkpoint

Before Gate A, current official DeepSeek primary documentation was checked.
It still identifies `deepseek-v4-flash` at `https://api.deepseek.com`, supports
OpenAI Chat Completions, thinking mode, `reasoning_effort=high`, Tool Calls and
the required `reasoning_content` replay after tool-call turns. The current
official price is USD 0.0028/M cache-hit input, 0.14/M cache-miss input and
0.28/M output. [Change Log](https://api-docs.deepseek.com/updates/),
[Chat Completion API](https://api-docs.deepseek.com/api/create-chat-completion/),
[Thinking Mode](https://api-docs.deepseek.com/guides/thinking_mode/),
[Pi integration](https://api-docs.deepseek.com/quick_start/agent_integrations/pi_mono/),
[Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/).

**Fact.** The current official maximum output is higher than G006's 8192-token
cap. G006 retained 8192 as the frozen stricter experiment budget; this did not
require a descriptor or behavioral change.

The checkpoint is preserved at
`.runs/g006/preflight/stage2-external-api-checkpoint.json`.

## 4. Gate A — clean reviewed zero-call preflight

Gate A passed with:

```yaml
project_commit: 05da78bc24d6bab92dc44ee44912a57159e45e72
source_tree_digest: c99e84ba09318a73482a2d790e10eb63e3a2240d0b0c209a843112ff62c82af4
source_files: 28
tracked_source_files: 28
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
artifact: "@earendil-works/pi-ai@0.82.1"
credential_configured: true
provider_calls: 0
attempt_root_before_driver: absent
root_tracked_status: clean
isolated_pi_status: clean
```

Public runtime imports, emitted declaration resolution, strict TypeScript and
eight Gate 0 tests passed again immediately before the attempt.

One preflight command was initially invoked from the project root:

```text
npm.cmd run check:model-data --workspace=@earendil-works/pi-ai
```

It failed with npm `ENOENT` because the project root intentionally has no
`package.json`. It made no provider call and changed no tracked state. The same
command was rerun from `.runs/g006/pi` and passed with `Generated model data is
valid.` This was a command-working-directory error, not a model-data or build
failure.

Gate A then ran:

```text
node --env-file=.env.g005 spikes/pi-runtime/g006/gate-a.ts
```

Only `credential_configured=true` was recorded. The credential value was not
printed, hashed, copied or passed on the command line.

## 5. Unique real-model paired attempt

The only real-model command was:

```text
node --env-file=.env.g005 spikes/pi-runtime/g006/driver.ts
```

It created `.runs/g006/attempt-001` once and exited 0.

| Result | Baseline | Candidate |
| --- | ---: | ---: |
| Provider requests | 4 | 4 |
| Subscriber provider responses | 4 | 4 |
| HTTP 200 responses | 4 | 4 |
| Successful assistant messages | 4 | 4 |
| Assistant response IDs | 4 | 4 |
| Tool starts / ends | 3 / 3 | 3 / 3 |
| Source writes | 1 | 1 |
| Settled events | 1 | 1 |
| Initial Verifier | passed | passed |
| Final Verifier | passed | passed |
| Recovery cycles | 0 | 0 |
| Journal entries | 35 | 35 |
| Reasoning metadata records | 4 | 4 |

The Baseline Journal ran from `2026-07-29T15:59:32.410Z` to
`2026-07-29T16:00:03.680Z`; Candidate ran from
`2026-07-29T16:00:03.686Z` to `2026-07-29T16:00:27.869Z`. The gate summary
recorded 55,470 ms from the first provider request through pair completion.

Both variants independently produced valid, different implementations and
passed the same public plus external acceptance suite. Different final source
bytes are normal model-output variation; fairness applies to initial inputs and
configuration, which were equal.

## 6. Provider payload and reasoning continuity

For all eight provider requests, the Journal records:

```yaml
model: deepseek-v4-flash
thinking.type: enabled
reasoning_effort: high
max_tokens: 8192
temperature: omitted_and_asserted_by_driver
tools:
  - read_task_and_source
  - write_source
  - run_public_tests
retry_count: 0
```

Each variant recorded six reasoning replay metadata occurrences across later
payloads. Pinned
`.upstream/pi/packages/ai/src/api/openai-completions.ts`, the assistant-message
conversion and detected DeepSeek compatibility paths, preserve required
reasoning content on tool-call turns. Actual HTTP 200 responses across all
tool rounds are stronger route evidence than source inference alone.

**Fact.** In-memory reasoning existed, but only presence/length metadata was
persisted. Neither Session JSONL contains the literals `reasoning_content` or
`thoughtSignature`.

## 7. Journal, Session and Verifier correlation

Both Journals used schema v2 exclusively, started at sequence 1, had continuous
monotonic sequences and contained only the closed envelope keys:

```text
schemaVersion, seq, timestamp, type, runId, sessionId, cycle, data
```

The relevant ordering was identical:

```text
agent_settled seq 31
→ verifier_started seq 32
→ verifier_completed seq 33
→ policy_decision seq 34
→ run_completed seq 35
```

All three assistant Tool Call IDs in each variant equal the corresponding
Session ToolResult IDs in order. Provider request, subscriber response,
assistant message and response-ID counts also agree exactly.

Verifier results:

| Variant | Status | Exit | Timeout | Feedback truncated | Output SHA-256 |
| --- | --- | ---: | --- | --- | --- |
| Baseline | passed | 0 | false | false | `4e6372784c1c4664438fbcacd2f020adfa88fac1198cf06ebbea76b2c34b02fa` |
| Candidate | passed | 0 | false | false | `61471026f4c1d78351f91413f47abcf21b889646e179ea6f03a4667aaaba31a3` |

Candidate recorded `no_recovery_initial_verifier_passed`. There was no
`continuation_queued` event. This is correct policy behavior, not missing data.

## 8. Initial fairness and provenance

The write-once attempt marker and manifests agree on the reviewed project
commit and source digest. Initial Baseline/Candidate workspace digests are
equal, and normalized configuration equivalence is true.

The Main Session's post-run evidence self-review confirmed equality of:

- model and provider descriptor;
- prompts and prompt hashes;
- Tool descriptions and schemas;
- Verifier identity;
- budgets;
- Pi and artifact identity;
- complete 28-file G006 source inventory.

The attempt marker and pair manifest both record `providerCallsAtWrite: 0`.
The source was rechecked before Baseline and again before Candidate.

## 9. Usage and cost

Usage is observational metadata from the actual assistant messages:

| Variant | Requests | Input | Cache read | Output | Reasoning | Summed total tokens | Cost USD |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Baseline | 4 | 1,018 | 6,272 | 2,257 | 1,611 | 9,547 | 0.0007920416 |
| Candidate | 4 | 906 | 7,424 | 2,713 | 2,181 | 11,043 | 0.0009072672 |
| Pair | 8 | 1,924 | 13,696 | 4,970 | 3,792 | 20,590 | 0.0016993088 |

The pair stayed within every provider-request, Tool, cycle, Verifier, model,
attempt and wall-clock budget. Candidate's modestly higher measured cost is not
a policy overhead estimate because neither variant used recovery and the sample
size is one.

## 10. Security and final artifact scan

The Driver's in-run scan checked 48 source/attempt files and found zero secret
matches. Because the Driver writes the scan result, gate summary and pair
outcome after that scan, Main Session performed an additional authorized
credential-scoped scans after the required command log and audit evidence
existed. The final authoritative pass also covered the updated audit record: it
checked 54 final pre-existing source/attempt files, made zero provider calls and
found zero matches.

The rescan result itself is excluded by construction and contains only boolean/
count/path metadata, never credential-derived bytes. Evidence:

```text
.runs/g006/attempt-001/security/secret-scan.json
.runs/g006/attempt-001/security/final-secret-rescan.json
.runs/g006/attempt-001/security/final-secret-rescan-after-audit.json
```

## 11. Selected evidence hashes

| Evidence | SHA-256 |
| --- | --- |
| `attempt-marker.json` | `a40acc2af9cecf283af231fa06122454695527193ec56e80fbfbd48072abf165` |
| `manifests/pair.json` | `18bad63974ffb04039908171ed43351fea709d1efe68be85f7ae34226fc3f54a` |
| `events/baseline.jsonl` | `3cd0146f4b881120bbbde9b803b54211662cb61aac0d3626a7022ec261c16085` |
| `events/candidate.jsonl` | `ee6c47cbf4c2a282b57e378033c525a72de4917d918053d60aa0bfe0b66997f8` |
| `sessions/baseline.jsonl` | `49297953ab2c26ad456078df18fa1c72a9b64f9bd09d30de5d6643f0fa0a373e` |
| `sessions/candidate.jsonl` | `053b3042a796a4db7c5f5cb48c9c031e4e732cd8700fca197ec98bfac9105c59` |
| `outcomes/baseline.json` | `2c01ede4e52533e31a1bd99a7a53736992ab1fd32385acee3a7e8a2e9c84b913` |
| `outcomes/candidate.json` | `ab5d66e534a5a7a0c10064da22f1623942f60aa241b7fe5a7e418b89001602e5` |
| `outcomes/pair.json` | `d7aa7ac62879d508bae836f68fa3d44075ff677932c5f3538c80dffa77975a64` |
| `gates/gate-summary.json` | `ab20ff90c1fdb3dde96a0189e015ca2c94c491041da0b1044213e4b9cfed0a6b` |
| `security/final-secret-rescan-after-audit.json` | `674bbf9dffa054b63a8d202690ec941b3d13ba2183273f99a1245c71e458d23f` |

The ignored run root is evidence and must not be reset, overwritten or reused.

## 12. What G006 proves and does not prove

### Proven facts

- current DeepSeek V4 Flash accepted the frozen Pi OpenAI-completions payload;
- the public emitted Direct `AgentHarness` route completed real Tool coding
  cycles twice without Pi Core patches;
- `subscribe(...)` observed every real provider response;
- Journal v2, Session projection and response IDs correlated without conflict;
- external verification after settled is feasible on the real route;
- Baseline/Candidate initial fairness and write-once provenance are enforceable;
- reasoning protocol continuity can coexist with redacted persisted evidence;
- the bounded pair remained within budgets and secret scans passed.

### Unconfirmed

- real-model Candidate recovery behavior, because no initial Verifier failed;
- Completion Verification effectiveness or recovery success rate;
- generalization across tasks, models, seeds or repeated trials;
- whether Candidate cost is higher or lower under comparable repeated outcomes;
- final Pi Go, V0 architecture freeze or production Workbench reliability;
- deferred Session reconstruction, crash durability, cancellation and
  compaction risks.

## 13. Architecture interpretation

G006 resolves the narrow clean-retry question positively. It also converts the
G005 observer failure into a useful project lesson: typed API shape alone was
not enough; pinned dispatch source plus independent event correlation was
required.

However, the original project plan's Phase 3 completion language includes
observing that Candidate actually changes Agent behavior. G006 correctly did
not force that behavior, and its one natural task did not require recovery.
Therefore:

```yaml
G006_contract_disposition: PASS_REAL_MODEL_FEASIBILITY
direct_real_model_route: positive
completion_verification_mechanism_on_real_route: partially_observed
real_model_recovery_activation: unobserved
policy_effectiveness: unverified
final_pi_go: not_authorized
phase_4_version_charter_ready: requires_main_session_user_decision
```

**Recommendation.** Accept and close G006 without another G006 call. Before
freezing V0, the two defensible choices are:

1. a separate bounded Phase 3B activation case designed to naturally expose a
   first-pass completion failure; or
2. treating G003 deterministic recovery plus G006 real-route evidence as
   sufficient mechanism evidence, while deferring observed real recovery to
   the later Pilot Eval.

**Main Session recommendation: choose option 2.** G003 already proves the
bounded recovery mechanism, while G006 proves the current real provider/Tool/
Session/Verifier route with valid evidence. Creating another single-case Goal
mainly to obtain a failure would encourage task-selection bias and still would
not establish a rate. A precommitted Pilot Eval task set is the more rigorous
place to observe natural policy activation, recovery outcomes and guardrails.

This recommendation permits a later V0 Version Charter to freeze the mechanism
and evidence contract, but the Charter must carry observed real-model recovery
as a Pilot entry/acceptance item and must not claim effectiveness. It is an
architecture recommendation, not permission to create G007, draft the Charter,
run a Pilot or call another model automatically.
