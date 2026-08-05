# V1-B P1-004 Main Acceptance and Replacement Baseline Decision

```yaml
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
decision_date: 2026-08-05
decision_owner: main_session
user_micro_exception: accepted_and_consumed
candidate_commit: 6a4f6529c4cb2a3e5c726d3bc8cf6beb515b720e
candidate_tree: 7ab79aa4073baab1c7570424701ebf1302b34837
workbench_source_digest: b1fa032d42c4e381c880b8092bddb5a625169ea44ee2e0ea238da1595d0edf92
reaudit_disposition: PASS_FOCUSED_V1_B_P1_004_REAUDIT
replacement_manifest_id: 4f04542ea59b59110e2d9d62e08067932bf868884e05c153cd5a6bed08575b29
replacement_sequence_id: c58112fff77b0836a44668395d6ab97ece10996583254c9029c143ab84e01bd1
replacement_execution_baseline_commit: resulting_HEAD_of_this_revision
replacement_stage_2: authorized_pending_fresh_execution_session
v2: not_authorized
```

## Decision

**Fact.** Main Session independently reviewed the one-time P1-004 micro-delta,
recomputed the Workbench source digest and passed strict TypeScript, 31/31 V1-B
focused tests and 42/42 required sequential regressions. The independent Audit
then passed every required positive and adversarial P1-004 state with zero real
access. P1-002 and P1-003 remain closed.

**Decision.** Main Session accepts
`PASS_FOCUSED_V1_B_P1_004_REAUDIT` and accepts Candidate `6a4f652...` as the
final audited source basis for the one authorized replacement Pilot. This
acceptance does not accept or close V1-B and makes no Skill/Runtime effectiveness
claim.

No fourth correction is authorized. Any future source/test/fixture behavior
change invalidates this acceptance and pauses V1-B.

## Replacement identity

The final tracked replacement artifacts are:

- `fixtures/manifests/v1/v1b-stage2-replacement-execution.json`;
- `fixtures/manifests/v1/v1b-stage2-replacement-sequence-authority.json`.

The Manifest field `execution_baseline_commit` binds audited source Candidate
`6a4f6529c4cb2a3e5c726d3bc8cf6beb515b720e`, avoiding an impossible Git
self-reference. The launch Execution Baseline is the later commit containing
the unchanged audited source, this Manifest/authority pair, the accepted audit
chain, official Provider checkpoint, preflight record and synchronized control
state. The Stage 2 Prompt must bind both identities separately.

The replacement freezes:

```yaml
predecessor_manifest_id: 43d03fd0a41e69a17814f54dd429624bc81a87e7fcb8a5cca68f8bae24c63f76
predecessor_paused_run_id: v1b-run-01-parse-duration-r1-a
predecessor_started_initial_runs: 1
conservative_prior_debit_usd: 0.10
replacement_manifest_revision: 2
replacement_initial_runs: 24
replacement_actual_cost_cap_usd: 1.90
sequence_started_initial_runs_max: 25
replacement_child_attempts_max: 8
retry_same_run: false
fallback: false
automatic_replacement: false
```

The original Manifest, Pilot, Run, ledger and evidence remain immutable and
inconclusive; the USD 0.10 debit is conservative accounting, not a claim about
the exact historical bill.

## Authority consumed and remaining stop point

The user's accepted bounded-autonomy envelope authorizes the new Execution
Baseline, a fresh no-source-edit replacement Stage 2 Session, opaque
`DEEPSEEK_API_KEY` resolution, DeepSeek-only network/model calls and the USD
1.90 replacement cap. It does not authorize source changes, retry/fallback,
another replacement, a fourth correction or V2.

After the launch commit is verified, Main Session may generate the exact fresh
Stage 2 Prompt and start that Session. Any Contract/Amendment exit condition
must stop the sequence before the next cell.
