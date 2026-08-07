# V2-B Closeout — Real Two-path Recovery Evidence with Negative Incomplete

```yaml
status: closed_user_accepted_with_explicit_limitation
closeout_date: 2026-08-07
goal_id: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
goal_contract_passed: false
goal_disposition: CLOSE_V2_B_MECHANISM_PROVEN_NEGATIVE_INCOMPLETE
binding_r2_disposition: PAUSE_V2_B_R2_NEGATIVE_NOT_VALID
user_closeout_decision: accepted
execution_baseline_commit: 571165a186444e16a0fafad2fcd886295d7efbab
execution_baseline_tree: bb7245412093f132fec4236711e7bbda96d0a1c1
authoritative_sequence_id: v2b-r2-real-20260807-02
active_goal_after_closeout: null
further_v2_b_execution_authorized: false
v3_authorized: false
```

## Closeout decision

V2-B is closed by explicit user decision without receiving either Contract PASS
disposition. The bounded R2 Positive mechanism succeeded, while its mandatory real
Negative hit a binding hard stop before a Verifier result existed.

The accurate conclusion is:

> The Workbench demonstrated real two-path recovery, independent verification and
> deterministic selection from one controlled verifier-failed Recovery Seed. The
> real initial-pass/no-branch Negative condition remains unverified.

This is an accepted limited closeout, not a retroactive waiver of Gate J-R2 and not
a claim that all V2-B Definition of Done items passed.

## Evidence result

### Controlled Seed and Positive A/B

- The zero-real-call Primary used Direct public Pi `AgentHarness`, Tool lifecycle
  and public JSONL Session persistence.
- It settled, passed the maintenance check, failed the target Verifier and froze
  the Recovery Seed before Candidate materialization.
- Candidate A and Candidate B began from the identical failed Workspace digest
  `85d50969c9d7ede5c7b0e67186231c2d3cbc21ff9f82872ae7c3cd3f9fc6e86a`.
- A retained six parent Session entries and received eight initial context messages.
- B used a fresh Session with zero parent entries and received two initial context
  messages.
- A settled and passed the target Verifier.
- B reached the accepted quiescent `pre_dispatch_budget_terminal` and passed the
  target Verifier.
- Both Candidates passed all recorded hard gates. The frozen Selector selected A
  by its predeclared secondary ordering.

### Mandatory Negative

- The stable-format Negative started exactly once.
- It made eight real Provider/model calls and twelve Tool calls.
- It stopped at `execution_boundary` without a target-Verifier result.
- It created no Failure Packet, Recovery Seed, Candidate or Selection objects.
- Absence of recovery objects is insufficient to satisfy Gate J-R2 because a valid
  target-Verifier pass was also mandatory.
- Amendment Hard Exit Section 13.6 applied. No retry, fallback, replacement,
  Verifier continuation or extra Case was executed.

### Final reconciliation

```yaml
final_inspector:
  integrity_valid: true
  terminal_valid: true
  errors: []
usage:
  started_attempts: 4
  provider_requests_including_controlled_faux: 23
  real_provider_model_calls: 20
  tool_calls: 26
  tokens: 40942
  verifier_runs: 3
  new_real_cost_usd: 0.0012750192
  binding_old_plus_new_r2_cost_usd: 0.0021159376
credential_reads: 2
retry_fallback_replacement_extra_case_or_attempt: 0
stage_2_source_manifest_control_pi_delta: 0
```

All actual costs remained below the accepted ceilings. Pi remained exact and clean
at `027a5847901b5dde30270abaa1041046cd2b4b55`.

## Gates and Definition of Done

| Requirement | Result |
|---|---|
| Gate H-R2 fresh preflight | passed before real access |
| Gate I-R2 controlled Seed and real A/B | passed |
| Gate J-R2 real Negative | failed with binding hard stop |
| Gate K-R2 reconciliation | passed for the truthful paused terminal |
| R1 preserved and immutable | satisfied |
| Amendment, Session ownership and baselines frozen | satisfied |
| Shared controlled-Seed Controller and audit | satisfied |
| Schema-aware Inspector and quiescent terminal correction | satisfied |
| Controlled Seed valid before Candidates | satisfied |
| Real A/B both terminal and independently verified | satisfied |
| Selector selected an eligible Candidate or none | satisfied; selected A |
| Real Negative pass and no recovery objects | not satisfied; Verifier absent |
| Identity, usage, cost, Session, Workspace and Selection inspectable | satisfied |
| Stage 2 source/Pi/control delta zero | satisfied |
| Main disposition recorded | satisfied |

R2 therefore satisfied 11 of 12 listed DoD outcomes. The missing Negative condition
is material and remains visible in the formal disposition.

## Verification commands and results

The dedicated Execution Session recorded the exact Gate H, execution and
reconciliation commands in
`docs/reports/V2_B_R2_CONTEXT_CORRECTED_STAGE2_EXECUTION_REPORT.md`.

Main independently verified:

```text
git show -s --format=%H%n%T HEAD
  -> 571165a186444e16a0fafad2fcd886295d7efbab
  -> bb7245412093f132fec4236711e7bbda96d0a1c1

node --experimental-loader ./.runs/v2-b/r2-execution/public-pi-loader.mjs \
  workbench/src/cli.ts v2b-stage2 inspect \
  --manifest .runs/v2-b/r2-execution/sequence/manifest.json \
  --sequence-root .runs/v2-b/r2-execution/sequence
  -> exit 0
  -> integrity_valid=true, terminal_valid=true, errors=[]
```

Main also directly read the Seed, A/B runtime evidence, verifier results, Selection,
Negative Pause and sequence terminal. Candidate A/B Verifier statuses were `passed`;
the Negative contained zero Verifier result files and zero recovery directories.

## Historical evidence preserved

- R1 `v2b-real-20260807-01` remains immutable pause evidence and is not recovery
  evidence.
- The first R2 real sequence remains preserved as invalid composition evidence.
- The context-message-count correction Candidate and hit-specific re-audit remain
  fixed in Git history.
- Authoritative R2 evidence remains under the ignored Stage 2 `.runs` tree; it was
  not rewritten or committed as source.

## Remaining unverified

- a valid real initial-pass/no-branch Negative;
- natural real-model initial failure followed end to end into recovery;
- general superiority of retained-history A or fresh-session B;
- statistical recovery improvement or production durability;
- OS sandbox, exactly-once Tool execution, SDK/Extension/RPC integration or V3
  Experience/Curator/Router behavior.

## Claims boundary

Allowed:

- the Harness formed a controlled immutable failed Seed and ran two real isolated
  Recovery Candidates;
- parent Session history was the primary treatment delta;
- both Candidates passed the common Verifier and the frozen Selector selected A;
- the real Negative was attempted once but did not reach a Verifier;
- the paused evidence is integrity-valid, terminal-valid and cost-reconciled.

Not allowed:

- `PASS_V2_B_R2_REAL_RECOVERY_SELECTED`;
- V2-B passed every Gate or DoD item;
- A is generally better than B;
- real initial-pass/no-branch behavior is proven;
- self-evolution or V3 is implemented.

## Final boundary

V2-B is closed and inactive. No further V2-B Credential read, network access,
Provider/model call, retry, replacement, Case, path, source repair or Pi change is
authorized. Reopening the missing Negative would require a new explicit decision and
a separately bounded contract; it is not recommended as part of this closeout.
