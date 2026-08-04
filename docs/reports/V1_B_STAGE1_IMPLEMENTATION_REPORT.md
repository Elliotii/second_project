# V1-B Stage 1 Preparation Implementation Report

> Updated: 2026-08-05 (Asia/Hong_Kong)
> Session role: original dedicated V1-B Stage 1 Preparation Session
> Main Review input: `REVISE_V1_B_STAGE1`
> Suggested corrected disposition: `PASS_V1_B_STAGE1_AFTER_BOUNDED_CORRECTION`
> Acceptance status: `pending_main_lightweight_review`
> Credential reads / network calls / external Provider calls / real-model calls: `0 / 0 / 0 / 0`

## 1. Result

**Fact.** The bounded correction retained corrected Control Baseline commit
`de75ca7a4d5376713f01ca475bc5ad7637c70443`, tree
`e930e1d0885b52bf911ed78912786723f321f06e`. The superseded
`84f548c...` baseline was not used. The pinned Pi checkout remained exact and
clean at `027a5847901b5dde30270abaa1041046cd2b4b55`.

**Fact.** Main Review findings F-001 through F-005 now have bounded source
corrections and formal deterministic counterexample regressions. The corrected
focused suite passes 15/15 in both the dedicated worktree and a fresh Windows
`core.autocrlf=true` checkout.

**Fact.** The new authoritative zero-call simulation terminalized all 24
planned cells exactly once. It observed 55 Faux Provider requests, 26 Tool
calls, 74,587 observational Faux tokens, 1,921 ms accumulated active execution
time and USD 0. All credential/network/external Provider/real-model counters
remained zero.

**Inference.** The corrected implementation is ready for Main Session's
lightweight re-review. This report does not accept Stage 1, authorize a
Candidate Commit, start Audit, create an Execution Baseline, or authorize
Stage 2.

## 2. Frozen identities and evidence

```yaml
control_baseline_commit: de75ca7a4d5376713f01ca475bc5ad7637c70443
control_baseline_tree: e930e1d0885b52bf911ed78912786723f321f06e
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
stage1_manifest_id: ec8a7a6f8dcc375dd18781e8f54b2ab00f5d2d7fba3938dee1011933de5f3b3b
stage1_workbench_source_digest: ce768cfd8af488861b251d94b6b5e14dec164e453c65bdba444fdc5aa0ade127
stage1_manifest_sha256: ce11d3bb5399833c6bebb28f03dd0855d19cb97c4ad2c1246652c25ccc1efe94
authoritative_pilot_root: .runs/v1-b/stage1/gate-h-pilot-authoritative-after-main-review-correction
authoritative_file_count: 353
authoritative_byte_count: 725526
authoritative_ledger_sha256: bf8c9b5484da41184496256cb0f764be80ec5d09bc13a303b30602a9bb70a81c
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

The prior authoritative root `.runs/v1-b/stage1/gate-h-pilot-authoritative`
was not modified or deleted. The evidence index marks it
`superseded_due_main_review_bounded_correction`. It is not a Stage 2 retry,
replacement cell, or real Pilot.

## 3. Bounded correction summary

### F-001 — independent semantic and Verifier evidence validation

- Inspector now derives task, Workspace source, base prompt, Skill, strategy,
  Tool, Verifier, model, Workbench source and Pi bindings from the frozen
  Manifest plus current allowed source instead of trusting RunResult claims.
- It cross-checks config snapshots, final Workspace digest, Session/Workspace/
  Attempt lineage, terminal marker relations, and all RunResult semantic fields.
- Every actual Attempt must have exactly one Verifier result and output ref;
  path, digest, size, Attempt ID, status, frozen Verifier identity and output
  relation are checked.
- Coherently rehashed wrong task, Skill, Verifier and Workbench bindings, plus
  missing and duplicate Verifier refs, are rejected.

### F-002 — final persisted evidence scan

- Model/options/context/provider projections remove forbidden fields using a
  case-insensitive normalized field rule and reject Bearer/fake boundary marker
  values.
- The runner scans actual journal, Verifier outputs/results, Failure Packet and
  every declared ArtifactRef, plus in-memory final RunResult, terminal evidence
  and terminal marker, before their write-once boundary.
- Inspector independently scans the actual persisted bytes; it does not trust
  `secret_scan.passed`.
- Authorization case variants, Bearer values, reasoning/thinking/signature
  fields and fake resolver/provider/factory markers have formal regressions.
  Scan failure pauses/fails closed; it is not repaired by deleting evidence.

### F-003 — exact frozen Skill treatment

- B/C complete initial dispatch remains byte-equal.
- A/B comparison now requires A's final user text to equal the frozen task
  instruction and B's to equal the public Pi `formatSkillInvocation()` wrapper
  plus that exact instruction.
- The Skill source digest, canonical wrapper digest and wrapper/body sizes are
  re-derived from frozen Skill bytes and linked to Manifest/Run evidence.
- Arbitrary text, missing wrapper, extra text, wrong Skill body, and options,
  model and Tool drift are rejected.

### F-004 — typed taxonomy and denominator loop

- A bounded typed injection seam exercises `infrastructure_invalid`,
  `evidence_invalid`, `treatment_guardrail_failure`, `global_budget_stop` and
  unknown-to-`paused_unclassified` behavior without free-text classification.
- Ledger accepts and validates terminal, invalid and pre-dispatch paused
  transitions. Paused state cannot masquerade as complete.
- Aggregation retains planned, started, terminal, invalid, paused, comparable,
  excluded and treatment-invalid counts. Treatment invalid remains in its arm
  denominator; only predeclared infrastructure/evidence invalid is excluded.
- The 25% infrastructure/evidence invalid threshold and the second occurrence
  of one cause pause before the next cell starts.

### F-005 — atomic and recomputable reservation evidence

- Provider, Tool, Verifier, child and Attempt-time reservations propose and
  validate cloned Attempt/Run/Pilot states before one commit. Failed reserve
  leaves usage unchanged.
- Each reservation records ID, scope, level, before, reserved ceiling, actual,
  after and applicable cap. Provider actual token/cost must be known and no
  greater than reserved.
- Child reserve includes the complete maximum child Provider/Tool/token/time/
  cost/Verifier capacity plus the child count at Run/Pilot levels.
- Inspector recomputes per-scope Attempt chains and Run chains. Aggregate checks
  cross-Run Pilot continuity in Manifest order and the final Pilot cap.
- No-partial-mutation, insufficient child time/Verifier capacity, broken chain,
  unknown usage and actual-over-reserved cases fail closed.

## 4. Finding traceability

| Finding | Principal source | Positive proof | Counterexample proof | Authoritative evidence |
| --- | --- | --- | --- | --- |
| F-001 | `inspect-v1.ts`, `run-v1.ts` | all 24 Runs independently inspect valid | coherent task/Skill/Verifier/Workbench rehash; missing/duplicate Verifier refs | 353-file corrected Pilot root |
| F-002 | `pi-run-handle-v1.ts`, `run-v1.ts`, `inspect-v1.ts` | final producer and Inspector byte scans pass | Authorization/Bearer/reasoning/thinking/signature and fake boundary markers rejected | per-Run ArtifactRefs and `secret-scan.json` |
| F-003 | `inspect-v1.ts` | 8/8 B/C equality and exact A/B frozen wrapper proof | arbitrary/missing/extra/wrong wrapper body; options/model/Tool drift | corrected aggregate fairness |
| F-004 | `run-v1.ts`, `pilot-v1.ts`, `inspect-v1.ts` | terminal/invalid aggregates preserve denominators | typed infra/evidence/treatment/global/unknown; 25% and repeated-cause pauses | focused test ignored roots |
| F-005 | `pi-run-handle-v1.ts`, `inspect-v1.ts` | three-level chains and Pilot continuity recompute | failed reserve no mutation; insufficient child capacity; chain/actual tamper | per-cell reservation arrays |

## 5. Source delta

Implementation delta remains inside Contract §6.2:

| Path | Role |
| --- | --- |
| `workbench/src/contracts/v1-types.ts` | typed taxonomy and complete reservation evidence schema |
| `workbench/src/pi/pi-run-handle-v1.ts` | safe projection and atomic three-level reservations |
| `workbench/src/run-v1.ts` | typed outcomes, final-byte scan and complete persisted relations |
| `workbench/src/pilot-v1.ts` | invalid/paused transitions, thresholds and typed causes |
| `workbench/src/inspect-v1.ts` | independent binding/ref/scan/budget validation and aggregation |
| `workbench/src/experiment/v1.ts` | frozen 24-cell Stage 1 Manifest/source binding |
| `workbench/src/provider/fixed-provider-v1.ts` | one-Run Provider authority from initial Stage 1 work |
| `workbench/src/product-surface-v1.ts`, `workbench/src/cli.ts` | bounded one-cell product surface |
| `workbench/tests/v1b-stage1.test.ts`, `workbench/tests/v1b-cli.test.ts` | 15 focused and correction regressions |
| `fixtures/manifests/v1/v1b-stage1-execution.json` | rebuilt corrected zero-call Manifest |
| `workbench/package.json`, `workbench/README.md` | V1-B scripts and bounded documentation from initial Stage 1 work |
| `docs/reports/V1_B_STAGE1_IMPLEMENTATION_REPORT.md`, `V1_B_STAGE1_CLOSEOUT_DRAFT.md` | corrected reports and proposal |

`docs/reports/V1_B_STAGE1_MAIN_REVIEW_BOUNDED_CORRECTION_PROMPT.md` is the
Main Session-provided correction authority, not implementation output. No
accepted task/Skill/Verifier/System Prompt/strategy fixture, V0 source, Pi,
reference, `CURRENT_STATE.md`, plan or Goal Contract changed.

## 6. Gate and DoD result

| Gate | Result after correction |
| --- | --- |
| A — control/identity | PASS; exact corrected baseline/tree and exact clean Pi |
| B — source boundary | PASS; §6.2-only delta, no staging/install/private import |
| C — public composition | PASS; public Pi route and one-Run authority, zero-dispatch credential reads 0 |
| D — fairness | PASS; 8 B/C byte-equal blocks and exact frozen A/B Skill delta |
| E — Attempt/recovery | PASS; same Session/Workspace, only eligible C gets one child |
| F — budget/authority | PASS; atomic three-level reserve and recomputation |
| G — Manifest/ledger | PASS; immutable 24 cells and typed terminal/invalid/paused transitions |
| H — zero-call Pilot | PASS; 24/24 terminal, USD 0, real counters 0 |
| I — secret/evidence | PASS; final producer and independent actual-byte scans |
| J — Windows/regression | PASS; strict TS, focused 15/15, V1-A 18/18, required V0-C passes |

All Stage 1 Definition of Done items are satisfied at the dedicated Session's
execution/report level, subject to Main Session acceptance.

## 7. Verification commands and results

All commands ran with no credential read, network dispatch, external Provider
call, real-model call, dependency installation, staging or commit.

```text
node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json
  exit 0

node --test tests/v1b-stage1.test.ts tests/v1b-cli.test.ts
  exit 0; 15 passed, 0 failed

node --test tests/v1a-deterministic.test.ts
  exit 0; 18 passed, 0 failed

node scripts/run-v0c-deterministic-suite.mjs
  exit 0; authoritative deterministic cases passed;
  external_provider_calls 0; real_model_calls 0

node --test tests/v0c-post-audit-correction.test.ts
  exit 0; 8 passed, 0 failed

simulatePilotV1B(...) + aggregatePilotV1B(...)
  exit 0; 24 planned / 24 started / 24 terminal / 0 invalid / 0 paused
  24 comparable / 0 excluded / 0 treatment-invalid
  55 Faux Provider requests / 26 Tools / USD 0 / real counters 0

fresh Windows core.autocrlf=true checkout:
  Contract source/test/Manifest identity: 14 files, 0 SHA-256 mismatch
  strict TypeScript: exit 0
  V1-B focused tests: exit 0; 15 passed, 0 failed
```

The fresh checkout contained 17 overlay paths. Three Markdown report/control
paths converted from LF to CRLF and therefore differed bytewise; none belongs
to the Workbench source digest domain. The 14 Contract source/test/Manifest
paths were byte-identical and both typecheck and the full focused suite passed.

## 8. Incidents and bounded corrections during this session

1. The first corrected focused run passed 14/15. The CLI test still expected an
   incomplete aggregate to fail, while F-004 requires incomplete aggregation to
   retain planned/started/invalid counts. The assertion was corrected; the next
   run passed 15/15.
2. The first fresh checkout method could not write the shared main repository
   object store under the managed sandbox. It left no real staged delta. A
   workspace-local temporary Git repo was used instead.
3. The first local-repo copy attempt encountered quoted Unicode paths. Its exact
   ignored temporary roots were removed after containment checks, and the copy
   was repeated with `core.quotepath=false`.

None of these incidents read credentials, used the network, called a Provider
or model, modified Pi/control state, or changed the 24-cell Pilot membership.

## 9. Remaining unverified or unauthorized

- Main Session lightweight review and Stage 1 acceptance;
- Candidate Commit creation by Main Session;
- focused independent Audit;
- corrections arising from any future Audit;
- Execution Baseline creation and a new Stage 2 real Manifest binding;
- credential resolution, network dispatch, real DeepSeek behavior and USD 2
  Pilot execution;
- real Skill/recovery effect, strategy superiority and inferential statistics.

The Stage 1 deterministic pass/fail distribution is mechanism evidence only.

## 10. `CURRENT_STATE_UPDATE_PROPOSAL`

This is a proposal only. This Session did not edit `CURRENT_STATE.md`.

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  v1_b:
    stage_1_preparation:
      status: completed_after_main_review_bounded_correction_pending_main_lightweight_review
      suggested_disposition: PASS_V1_B_STAGE1_AFTER_BOUNDED_CORRECTION
      control_baseline_commit: de75ca7a4d5376713f01ca475bc5ad7637c70443
      control_baseline_tree: e930e1d0885b52bf911ed78912786723f321f06e
      manifest_id: ec8a7a6f8dcc375dd18781e8f54b2ab00f5d2d7fba3938dee1011933de5f3b3b
      workbench_source_digest: ce768cfd8af488861b251d94b6b5e14dec164e453c65bdba444fdc5aa0ade127
      findings_corrected: [F-001, F-002, F-003, F-004, F-005]
      credential_reads: 0
      network_calls: 0
      external_provider_calls: 0
      real_model_calls: 0
      candidate_commit: false
      focused_audit: false
      execution_baseline_commit: false
      stage_2: false
      usd_2_budget: false
    next_control_point:
      owner: Main Session and user
      action: lightweight review of bounded correction source/tests/reports/evidence and decide Stage 1 disposition
```
