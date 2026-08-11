# V3.6 UX Attempt 2 Token Stop — Main Analysis

```yaml
status: main_read_only_analysis_complete
date: 2026-08-12
repository: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
analyzed_git_head: cd0a15e9e48560dffabe156fb49b907221bbd924
v3_6_status: closed_accepted
active_goal: null
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
implementation_authorized: false
real_model_call_authorized: false
ux_attempt_3_authorized: false
```

## 1. Executive conclusion

Attempt 2 proves that the Provider-request adequacy maintenance worked within its frozen
scope: the daily bounded-edit path crossed the old 16-response boundary and received 19
successful Provider responses.

The new issue is not, by itself, evidence that another numerical budget increase is
needed. The observed product defect is that a known cumulative Token-budget stop did not
enter the existing typed, persistent and inspectable budget-terminal path. The ordinary
Session API therefore degraded to a generic `request_rejected` response even though the
managed Workspace remained isolated and two registered Docker test commands had passed.

Recommended ordering:

```text
preserve current finite hard caps
→ implement bounded finite-budget terminalization
→ deterministically validate and narrowly audit it
→ only then make a separate decision about any future budget tuning or UX Attempt 3
```

Round A should remain paused. Attempt 3 must not start automatically.

## 2. Repository and authority baseline

### Fact

The V3.6 authority used for this review is:

```yaml
repository: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
git_head: cd0a15e9e48560dffabe156fb49b907221bbd924
working_tree_at_review_start: clean
v3_6_status: closed_accepted
active_goal: null
pi_head: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_status: clean
```

`D:/AI/AI_Projects/project2` is an older checkout whose control state remains at an early
V1 stage. It was not used as V3.6 authority and was not modified during this review.

The accepted Budget Adequacy Maintenance remains authoritative. Its daily profile is:

```yaml
profile_id: v36_daily_bounded_edit_v2
provider_requests_observation_threshold: 16
provider_requests_hard_max: 24
tool_calls_hard_max: 24
combined_tokens_hard_max: 131072
cost_usd_hard_max: 0.20
wall_time_ms_hard_max: 900000
retry_fallback_replacement: 0_0_0
```

Attempt 1 remains immutable historical evidence and is not overwritten, downgraded or
reclassified by Attempt 2.

## 3. Did Provider-request adequacy maintenance work?

### Fact

Attempt 2 received 19 successful Provider responses. It therefore crossed the old
16-request boundary and did not reproduce Attempt 1's exact request-17 pre-dispatch
rejection.

### Conclusion

The daily `16 observation / 24 hard max` Provider-request change worked as scoped.

### Limitation

This proves that 16 was too tight for this natural trajectory and that the new profile
provided additional execution space. It does not prove that 24 is universally optimal
or adequate for every medium coding task.

## 4. What stopped Attempt 2?

### Fact

Authenticated Pi JSONL accounting gives:

```yaml
successful_provider_responses: 19
assistant_entries: 20
input_tokens_including_cache: 136610
output_tokens: 6308
combined_tokens: 142918
combined_tokens_hard_max: 131072
cost_usd: 0.0031895472
cost_usd_hard_max: 0.20
tool_results: 24
tool_result_errors: 3
tool_calls_hard_max: 24
```

The observed exceeded dimension was cumulative combined Tokens:

```text
142918 > 131072
```

Cost was far below its cap. Tool usage had reached, but had not exceeded, its independent
hard maximum.

The two registered Docker-backed `test` commands both completed successfully with exit
code `0` and `cleanup_complete: true`. The second command reported 14 passing tests and
zero failures.

After the second successful registered command, the Agent requested one additional
Workspace read. That Tool result was aborted and the Turn ended without a settled final
response or normal Runtime Manifest.

The managed Workspace contains changes in:

- `src/battle-log.ts`
- `src/character.ts`
- `src/combat.ts`
- `tests/combat.test.ts`

The registered Source remains unchanged against the authenticated initial inventory.

## 5. Why the product returned `request_rejected`

### Fact

Current usage accounting includes ordinary input, cache-read and cache-write Tokens, then
adds output Tokens. The cumulative Token/cost assertion is in:

```text
workbench/src/session/persistent-session-v36.ts:519
```

The execution catch accepts only `ProviderRequestBudgetTerminalV36Error` and rethrows
other errors:

```text
workbench/src/session/persistent-session-v36.ts:584
```

Only the Provider-request-specific branch builds and writes `budget-stop.json`:

```text
workbench/src/session/persistent-session-v36.ts:596
workbench/src/session/persistent-session-v36.ts:656
```

The normal settled Manifest path begins later and was unreachable after the Token/cost
exception:

```text
workbench/src/session/persistent-session-v36.ts:659
workbench/src/session/persistent-session-v36.ts:673
```

Consequently, the Attempt 2 Run directory contains neither `manifest.json` nor
`budget-stop.json`. The loopback HTTP error boundary maps the untyped error to:

```json
{"error":"request_rejected","message":"request rejected"}
```

### Conclusion

The accepted Provider-request terminalization maintenance did not regress. Its scope was
deliberately Provider-request-specific. Attempt 2 naturally exposed the disclosed gap
that Token, Tool, cost and wall-time stops do not yet share the same typed terminal path.

## 6. Is this a maintenance-worthy issue?

### Recommendation

Yes. The maintenance-worthy defect is:

> A known, reconciled and side-effect-quiescent Token-budget stop cannot currently become
> a typed, persistent, inspectable and safe non-settled terminal.

This leaves users unable to determine through the ordinary product surface that:

- the Run stopped on cumulative Token budget;
- the Agent had reached passing registered command evidence;
- the overall Turn nevertheless remained incomplete and unverified;
- the managed changes remained isolated from registered Source; and
- Apply remained prohibited while Diff/Export/Discard could remain available.

This is a bounded post-V3.6 maintenance issue. It does not reopen or invalidate accepted
V3.6 claims.

## 7. Terminalization versus budget tuning

### Recommendation

Implement finite-budget terminalization before considering any new numerical increase.

Reasons:

1. Token usage exceeded its current cap by about 9%, while Tool usage simultaneously
   reached `24 / 24`.
2. Raising only the Token cap would leave no Tool-call headroom and could simply expose
   the next unhandled stop dimension.
3. The Agent had already obtained two passing registered command results and then made an
   additional read. This is partly a completion/trajectory-efficiency observation, not
   pure evidence that the cap is inadequate.
4. DeepSeek's low observed dollar cost does not remove the role of a Token limit in
   bounding context growth, execution length and runaway behavior.
5. Repeatedly raising the dimension most recently encountered would become result hunting
   and serial cap chasing.

### Unconfirmed

The evidence does not establish whether the Agent would have immediately settled with a
slightly higher Token limit, encountered the Tool limit next, or continued consuming more
resources. No such counterfactual should be claimed.

Changes to the completion prompt or Stop Policy may deserve separate future study if the
same pattern recurs naturally, but they are outside this maintenance and should not be
added opportunistically.

## 8. Minimal shared terminal design

### Recommendation

Expose one common product-level finite-budget terminal family while retaining distinct
typed variants internally:

```text
FiniteBudgetTerminal
├─ provider_request_stop
├─ combined_token_stop
├─ cost_stop
├─ tool_call_stop
└─ wall_time_stop
```

The variants cannot be mechanically identical:

- Provider request exhaustion occurs before dispatch and can prove that the refused
  request never reached the Provider.
- Token and cost exhaustion are discovered after a Provider response is accounted.
- Tool exhaustion must distinguish a pre-execution refusal from a Tool that may already
  have caused a side effect.
- Wall-time exhaustion can occur at a clean boundary or during in-flight work. An
  in-flight unknown state must not be represented as reconciled or safe.

A trusted typed terminal may be written only when all applicable invariants hold:

```yaml
usage_known: true
pending_provider_reservations: 0
pending_tool_calls: 0
pending_side_effects: 0
session_identity_reconciled: true
workspace_identity_reconciled: true
command_evidence_reconciled: true
```

If these invariants cannot be established, the Runtime must fail closed and must not
fabricate a settled or reconciled terminal.

If more than one dimension crosses on the same accounted event, the evidence should
truthfully retain all crossed dimensions instead of guessing a false single cause.

## 9. Preserving passing command evidence without overstating success

The last registered command may be projected as a passed command observation, while the
overall Run remains explicitly incomplete:

```yaml
last_registered_command:
  status: passed
  exit_code: 0

overall_run:
  settled: false
  verification_mode: unverified
  formal_outcome: null
  comparison_eligible: false
  adaptation_eligible: false
  promotion_eligible: false
  apply_allowed: false
```

The WebUI should describe the command as the last registered command result, not as proof
that the whole Turn settled or that a frozen external Verifier accepted the changes.

Diff, Export and Discard may remain available. Apply must remain denied at the server
authority boundary, not merely hidden in the browser.

## 10. Suggested bounded maintenance governance

Suggested Goal identity:

```text
POST_V3_6_FINITE_BUDGET_TERMINALIZATION_MAINTENANCE
```

Recommended roles:

1. Main creates one bounded maintenance Contract and control baseline.
2. One new top-level, zero-real-access Implementation Session owns source, focused tests,
   implementation report and Closeout draft.
3. Main performs lightweight review and returns ordinary in-contract defects to the same
   Implementation Session.
4. Because the change touches budget/stop semantics, evidence identity and Apply
   authority, one new top-level read-only focused audit is justified.
5. Audit findings return to the original Implementation Session; only affected findings
   and necessary regressions are rechecked.
6. No R1/R2, Replacement Run, multiple implementation stages or broad platform audit is
   justified.

All maintenance implementation and verification should use zero Credential reads, zero
network, zero external Provider/model calls and zero real task retries.

Any later real Attempt 3 would require a separately frozen, audited execution baseline
and fresh explicit user authority.

## 11. Deterministic acceptance checks

If the maintenance is authorized, the minimum checks should be:

1. Force exact Token, cost, Tool and clean-boundary wall-time stops independently.
2. Persist exactly one typed non-settled terminal for every accepted safe stop form.
3. Reconcile Session-derived usage, Tool lifecycle and Docker command evidence
   independently on reopen.
4. Keep Session list/detail and WebUI safely inspectable.
5. Expose the exact consumed/allowed values and crossed stop dimension or dimensions.
6. Distinguish passing command evidence from overall settled/verified completion.
7. Preserve Diff/Export/Discard and clean-new-Session behavior.
8. Deny Apply server-side and omit misleading Apply affordances.
9. Reject missing, ambiguous, forged, mismatched or tampered terminal evidence.
10. Preserve compatibility with accepted schema-1 and schema-2 Provider-request
    terminals.
11. Prove zero Credential/network/Provider/model access and unchanged registered Source.
12. Run narrow affected V3.6 regressions plus one focused audit covering terminalization,
    lineage, budgets, evidence integrity and Source-write authority.

## 12. Non-goals and hard stops

This maintenance must not:

- increase any budget value;
- automatically retry, resume, replace or continue the failed Session;
- run Attempt 3;
- alter Session, Verifier, ChangeSet, Source or Apply authority;
- treat an unknown in-flight side effect as reconciled;
- modify Pi;
- switch to SDK, Extension or RPC;
- build a generalized transaction, crash-recovery or durable workflow platform;
- reopen V3.6 or enter V4.

Pause and return to Main/user if completion requires any of the above, if a trustworthy
terminal cannot be produced without changing accepted authority semantics, or if safe
support for a stop form would require materially broader architecture.

## 13. UX test disposition

### Recommendation

Round A remains paused and Attempt 3 must not start automatically.

Attempt 1 and Attempt 2 must remain separately preserved:

- Attempt 1 exposed that the 16-request daily hard cap was too tight and that the original
  Provider-request stop lacked safe product terminalization.
- Attempt 2 proved the request adjustment worked and naturally exposed the Token-stop
  inspectability gap.

Neither Attempt replaces, rewrites or downgrades the other.

## 14. Current decision required

The only current user decision is whether to authorize the bounded
`POST_V3_6_FINITE_BUDGET_TERMINALIZATION_MAINTENANCE` described above.

No implementation, Goal activation, Credential access, real-model execution, task retry,
Apply/Discard action, Pi modification or V4 work is authorized by this analysis.
