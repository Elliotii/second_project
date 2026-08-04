# V1-B Stage 1 Main Acceptance and Stage 2 Baseline Decision

```yaml
goal_id: V1_B_FROZEN_BOUNDED_REAL_PILOT
decision_date: 2026-08-05
decision_owner: main_session
stage_1_disposition: PASS_V1_B_STAGE1_PREPARATION_AFTER_CORRECTION
focused_reaudit_accepted: true
corrected_candidate_commit: a11690e5827d9d540b731156799566bea21c689e
corrected_candidate_tree: 282c4dc93d31131fa0b20fc70c48831409664eee
focused_reaudit_disposition: PASS_FOCUSED_V1_B_STAGE1_REAUDIT
execution_baseline_preparation: authorized
stage_2: authorized_after_execution_baseline
v2: not_authorized
```

## Decision

**Fact.** Corrected Candidate `a11690e5827d9d540b731156799566bea21c689e`
is the direct child of rejected Candidate
`951e9161300eacd408e232aa6d1fa66ac02d0e10`. Its focused independent re-audit
closed both original P1 findings, reported zero new blocking findings, passed
strict TypeScript, 19/19 focused V1-B tests, 42/42 required V1-A/V0-C
regressions, 24/24 authoritative Inspector replay and an independent
counterexample script.

**Fact.** Stage 1 and both audit passes used zero credential reads, zero network,
zero external Provider calls and zero real-model calls. Pi remained at
`027a5847901b5dde30270abaa1041046cd2b4b55` and clean.

**Decision.** Main Session accepts
`PASS_FOCUSED_V1_B_STAGE1_REAUDIT` and accepts the corrected Candidate as the
audited Stage 1 source basis for deterministic Execution Baseline
materialization. This is not yet V1-B or V1 closeout and makes no claim about
real Skill or Runtime effectiveness.

## Finding closure accepted

1. Final Workspace evidence now receives fail-closed byte scanning and typed
   tree binding on both producer and independent Inspector paths. Producer
   forbidden-marker, coherent-forgery and Windows junction counterexamples
   closed the original boundary gap.
2. The tracked CLI now exposes an explicit Stage 2 authority path that rejects
   mode/authority mismatch before Pilot initialization, resolves the credential
   lazily, sanitizes failure, pauses the same started cell, prevents a second
   authority open and requires no ignored runtime wrapper.

No source repair is assigned after this acceptance. Candidate-to-baseline
changes are limited to tracked reports/control synchronization, the final
Stage 2 Manifest, current official Provider checkpoint material and the Stage 2
launch prompt.

## Execution identity interpretation

The execution Manifest field `execution_baseline_commit` binds the exact audited
source Candidate `a11690e5827d9d540b731156799566bea21c689e`. It cannot bind the
SHA of the commit that contains that same Manifest because a Git commit hash is
content-addressed and such a self-reference has no deterministic construction.

The later Execution Baseline Commit is the launch HEAD containing:

- the unchanged audited source tree;
- the `stage2_real` Manifest bound to the audited source Candidate and current
  Workbench source digest;
- accepted audit/control/provider-checkpoint records; and
- no source behavior change after the focused re-audit.

The Stage 2 Prompt must bind the exact launch HEAD/tree and separately repeat
the audited source Candidate, Manifest ID and Workbench source digest. This
preserves both reproducibility and non-circular identity.

## User authority consumed by this sequence

The user authorized the bounded autonomy envelope on 2026-08-05:

- Execution Baseline after audit acceptance;
- a fresh no-source-edit Stage 2 Execution Session;
- opaque `DEEPSEEK_API_KEY` resolution;
- DeepSeek API network and real calls;
- exact frozen 24-cell Pilot with at most eight child Attempts;
- whole-Pilot hard cap USD 2;
- the accepted automatic exit conditions; and
- V1-B closeout commit if evidence remains valid.

Entry into V2 remains explicitly unauthorized.

## Remaining gates before first dispatch

1. current official DeepSeek endpoint/model/usage/pricing checkpoint;
2. deterministic Stage 2 Manifest materialization and validation;
3. zero-call strict TypeScript, focused tests and product preflight;
4. exact Execution Baseline commit/tree and clean tracked/index state;
5. fresh Stage 2 Session Gate K–M, including opaque credential presence without
   printing or persisting its value.

Any Contract Pause Condition or bounded-autonomy exit condition stops the
sequence before further dispatch or before V2.
