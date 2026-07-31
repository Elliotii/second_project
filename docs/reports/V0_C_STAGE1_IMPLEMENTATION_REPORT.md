# V0-C Stage 1 Implementation Report

```yaml
status: corrected_candidate_pending_main_rereview
suggested_disposition: PASS_V0_C_STAGE1_CORRECTED_CANDIDATE_FOR_MAIN_REVIEW
control_baseline_commit: 47d36f25563012e1d411576eca387a778ba6a3e7
implementation_owner: dedicated_v0_c_stage_1_session
contract_gates_executed: [A, B, C, D, E, F, G, H, I, J]
focused_independent_audit: not_authorized
stage_2: not_authorized
git_commit_created: false
```

## 1. Result

**Fact.** The deterministic V0-C Stage 1 candidate implements bounded
Completion and public-feedback, same-Session, recover-once behavior on the
accepted Direct Pi `AgentHarness` path. Strict TypeScript passes; the complete
Workbench suite passes 83/83 with 0 failures and 0 skips; the formal CLI can
execute and inspect a two-Attempt recovery Run; and the real-profile route
produces a zero-side-effect dry-run without reading credentials or calling a
Provider.

**Recommendation.** Main Session should review the candidate source and cited
evidence and, if satisfied, request the separately authorized Candidate Commit
and focused independent audit. This report does not accept V0-C and does not
authorize either action.

## 2. Fixed identity and scope

| Identity | Result |
| --- | --- |
| root HEAD / Control Baseline | `47d36f25563012e1d411576eca387a778ba6a3e7` |
| corrected Workbench tree digest | `a43ec6309e55754f5f095c76b226426a7d3d36b37b9ce36cbc08db6422f5fc6f` |
| pinned Pi HEAD | `027a5847901b5dde30270abaa1041046cd2b4b55` |
| `.upstream/pi` status | clean |
| isolated emitted-package Pi status | clean |
| Pi Core patches | 0 |
| private Pi imports | 0 |
| real/external Provider calls | 0 |
| real-model calls | 0 |
| network calls | 0 |
| credential reads | 0 |
| dependency installations/downloads | 0 |
| staged files / commits | 0 / 0 |

**Fact.** The registered untracked `reference/` directory remains present and
was not modified or submitted. `CURRENT_STATE.md`, accepted Contracts,
Charter/control files, ADRs, historical reports, Pi, V0-A/V0-B fixture
identities, and root planning documents have no tracked delta from the Control
Baseline.

**Fact.** V0-B regression execution created new ignored run artifacts under
`.runs/v0-b/runs/`; it did not overwrite or modify an existing historical Run.

## 3. Implemented responsibilities

## 3. Main-review bounded correction

| Finding | Source correction | Test/evidence | Result | Remaining limitation |
| --- | --- | --- | --- | --- |
| V0C-MR-001 | `executeV0CRun` now owns one outer `try/finally`; `terminal.json` is committed before `handle.close()`, while every return/throw still closes once | lifecycle probe in `v0c-main-review-correction.test.ts` | pass | no cross-process or crash recovery claim |
| V0C-MR-002 | `scanFailurePacketForChildV0C` validates persisted refs, invokes the shared V0-B scanner, revalidates after scan, and only then permits `failure_packet_created`/child allocation | shared-only Bearer pattern, scanner-error and post-scan-mutation cases | pass | bounded shared rules, not general DLP |
| V0C-MR-003 | `validateRunEvidenceV0C` freezes Attempt/Verifier relations, cumulative counters, Recovery truth, expected evidence paths, suffix and plan digest before the one Run-validation event | relation, cumulative-budget and dynamic-plan fault tests | pass | no durable-runtime validation |
| V0C-MR-004 | `runV0CProductSurface` accepts a single-use authority, credential resolver, Provider handle factory and bounded execution envelope; default CLI fails before identities | denied CLI count probe and `run-886cbdc1-…` injected-fake full Run | pass | actual API/provider facts and real call remain Stage 2 |

Exact corrected symbols:

- `runV0CProductSurface` — `workbench/src/product-surface-v0c.ts`;
- `executeV0CRun` — `workbench/src/run-v0c.ts`;
- `scanFailurePacketForChildV0C` — `workbench/src/completion/failure-packet-v0c.ts`;
- `validateRunEvidenceV0C` — `workbench/src/evidence/run-validation-v0c.ts`;
- `expectedTerminalResponsibilitiesV0C` /
  `terminalScanFileScopesV0C` — `workbench/src/evidence/terminal-policy-v0c.ts`;
- `RealExecutionDependenciesV0C`, `validateRealExecutionDependenciesV0C`,
  `STAGE2_MAXIMUM_BUDGET_V0C` — `workbench/src/pi/real-provider-route-v0c.ts`;
- `inspectRunV0C` — `workbench/src/inspect-v0c.ts`.

### 3.1 Contracts and preflight

- `TaskSpecV0C`, `StrategySpecV0C`, `RunRecordV0C`, `AttemptRecordV0C`,
  `FailurePacketV0C`, `CompletionDecisionV0C`, `JournalEntryV0C`, terminal and
  validation types are explicit and strict.
- Task, Strategy, Verifier, prompt, Workspace source, Pi public import, model
  profile, Tool profile, visibility, budgets, and recovery compatibility are
  checked before formal Run creation.
- Invalid and hidden-acceptance recovery combinations fail before side effects.
- Dry-run creates no Run/Attempt/Workspace/Session identity and calls no Tool,
  Verifier, credential source, network, or Provider.

### 3.2 Completion and lineage

- `observe_only` always terminates after the initial evaluated Attempt.
- `verify_recover_once_same_session` may recover only after a valid public
  Verifier failure, valid Attempt evidence, available child reserve, and an
  unused recovery slot.
- Decision precedence is evidence/verifier/infrastructure/user/budget/pass,
  followed by policy eligibility.
- Recovery ordering is decision → slot reservation → bounded Packet
  serialization/validation/persistence → child ID allocation →
  `attempt_started`.
- `run.attempt_ids` contains only actually started Attempts; ordinal 3 and a
  second recovery slot are rejected.

### 3.3 Pi lifecycle

`workbench/src/pi/pi-adapter-v0c.ts` creates exactly one long-lived public
Direct `AgentHarness`, Session storage, and Workspace handle per Run. Both
Attempts use this handle. The initial cycle settles before the Failure Packet
prompt can start the child; successful close occurs only after terminal-record
commit, and an outer `finally` closes incomplete/error paths exactly once. Tool callbacks require the currently active started Attempt and store
Attempt-scoped safe Tool Result artifacts.

### 3.4 Failure Packet

The Agent-visible projection contains only:

```text
parent_attempt_id
verifier_id
failure_summary
failed_checks
instruction
```

It is stable-serialized, SHA-256 bound, capped at 8 KiB, with summary/check
limits, then scanned with the accepted shared V0-B scanner and revalidated
before child identity allocation. It contains
no child Attempt ID. Full Verifier output remains an evidence ArtifactRef and is
not projected into the Agent prompt.

### 3.5 Evidence and terminalization

- One Verifier and one Attempt validation are written per settled evaluated
  Attempt.
- The Journal switches active Attempt explicitly, rejects identity overrides,
  and rejects any append after `run_terminal`.
- One Run validation validates exact relations, cumulative counters, Recovery
  truth, dynamic expected paths and the planned suffix before one Outcome and the final
  `outcome_created`/`run_terminal` Journal suffix.
- The terminal writer derives a dynamic one/two-Attempt closed Index, includes
  Tool artifacts and Failure Packet artifacts when present, runs the integrated
  secret/reasoning scan, rechecks the final budget, then writes Outcome, Index,
  and terminal record.
- `inspect` independently reopens the reasoning-safe public Session and checks
  lineage, identities, ArtifactRefs, Tool pairing, Journal, scan scopes,
  Outcome/Index digests, responsibilities, and terminal commitments.

### 3.6 Real route readiness

`workbench/src/pi/real-provider-route-v0c.ts` defines a strict typed model
profile, execution authority, credential resolver, Provider handle factory,
request/usage projection, and a validated Stage 2 maximum budget envelope.
`runV0CProductSurface` connects this boundary to the same Run orchestration.
Default execution is rejected before formal identity. The authorized plumbing
was exercised only with a non-secret in-memory handle and public Faux factory.

**Unconfirmed.** This does not verify the current DeepSeek API endpoint,
authentication, request schema, pricing, availability, or real Pi provider
behavior. Those require the separately authorized Stage 2 preflight.

## 4. Deterministic matrix

| Contract case | Evidence/result |
| --- | --- |
| observe-pass | committed passed Outcome, 1 Attempt |
| observe-fail | committed failed/agent Outcome, 1 Attempt |
| recovery-policy-initial-pass | passed, slot 0, one Verifier |
| recover-once-pass | initial fail → same-Session child pass |
| recover-once-fail | initial fail → child fail, failed/agent |
| hidden-recovery-preflight | rejected before Run side effects |
| initial-verifier-invalid | invalid/verifier; no child |
| initial-evidence-invalid | invalid/evidence; no child |
| initial abort/cancel | controller precedence tests stop without eligibility |
| child-start-reserve-insufficient | failed/budget; no Packet/child |
| child-budget-exhausted | failed/budget after started child |
| Packet malformed/oversized | invalid/evidence; no child ID |
| Packet digest/visibility mismatch | invalid/evidence; no child ID |
| Packet persisted but child not started | incomplete; one started Attempt only |
| duplicate child request | child cannot re-enter; ordinal 3 guard |
| duplicate Verifier | Journal validator rejects count > 1 |
| premature/post-terminal event | Journal/Inspector reject |
| child Session/Workspace drift | Inspector identity/ArtifactRef mutation rejection |
| active Attempt event drift | Journal validator rejects |
| G003 continuation regression | recovery-pass authoritative Run |
| G006 no-extra-cycle regression | initial-pass test and observe authoritative Run |
| real-profile zero-call dry-run | ready plan; 0 credential/network/provider calls |

## 5. Authoritative evidence

| Role | Run ID | Result |
| --- | --- | --- |
| observe / no extra cycle | `run-4bba0ea2-314b-4aa7-acb1-fb79d916146e` | passed; 1 Attempt; inspect-valid |
| recovery pass | `run-0c752f20-1f14-46a8-b450-cdb30d3e682b` | pre-child scan; 2 Attempts; inspect-valid |
| recovery counterexample | `run-bc97935e-884b-4524-acec-9d44cdf2b92e` | failed/agent after child; inspect-valid |
| real-profile injected-fake API | `run-886cbdc1-2c06-4226-8f12-13c2b0d62576` | full orchestration; zero real calls; inspect-valid |
| formal CLI + inspect | `run-3708aacf-23f1-4772-b02c-23d348c6b34f` | passed; committed; inspect-valid |

All five corrected integrated scans completed with `match_count: 0`. The prior
four authoritative Runs remain byte-preserved and are superseded solely because
the main review required MR-001..004 corrections.

Goal evidence:

- `.runs/v0-c/evidence/EVIDENCE_INDEX.md`
- `.runs/v0-c/evidence/source-inventory.json`
- `.runs/v0-c/evidence/source-delta.json`
- `.runs/v0-c/evidence/commands-and-exit-codes.md`

## 6. Verification

| Verification | Result |
| --- | --- |
| strict TypeScript | exit 0 |
| focused MR-001..004 tests | 5/5 pass |
| complete Workbench suite | 83/83 pass; 0 fail; 0 skip |
| accepted V0-A/V0-B regressions | included in 83/83 |
| V0-B post-audit mutation regressions | included; green |
| V0-B deterministic route suite | exit 0; six expected routes |
| public emitted Pi imports | exit 0 |
| V0-C deterministic suite | exit 0; four authoritative Runs including injected-fake real profile |
| formal V0-C CLI run + inspect | exit 0 |
| formal real-profile dry-run | exit 0; zero calls/reads |
| pre-stage `git diff --check` | exit 0 as recorded; untracked new files were not in that diff |
| Main-Session candidate-stage `git diff --cached --check` | exit 1; three newly tracked TypeScript files retain one extra EOF blank line so the reviewed `a43ec...` Workbench digest and authoritative Run bindings remain byte-identical; no semantic or in-line whitespace finding |

Exact commands, UTC times, exit codes, and outputs are in
`.runs/v0-c/evidence/commands-and-exit-codes.md`.

## 7. Source Delta

The generated inventory contains 28 corrected candidate source/fixture/test files.
Existing shared files changed only where necessary:

- `workbench/src/contracts/v0b-types.ts`: optional public failed-check projection;
- `workbench/src/verifier/runner.ts`: Attempt-specific output path and V0-C
  Workspace environment-key option; V0-B defaults preserved;
- `workbench/src/cli.ts`: V0-C formal Product Surface and inspect dispatch;
- `workbench/package.json`, `workbench/test`, `workbench/README.md`: version,
  scripts, regression bootstrap, and operator documentation.

All other implementation files and V0-C fixtures are new. The exact per-file
SHA-256 and baseline digest are in `source-delta.json`.

## 8. Gates A–J and Stage 1 DoD

| Gate | Result |
| --- | --- |
| A — control/source identity | pass |
| B — contract/preflight/compatibility | pass |
| C — lineage/active identity | pass |
| D — same-Session continuation | pass |
| E — Completion Controller/budget | pass |
| F — Failure Packet/visibility | pass |
| G — per-Attempt Verifier/validation | pass |
| H — Outcome/Index/terminal evidence | pass |
| I — Product Surface/zero-call real readiness | pass |
| J — scope/reports/provenance | pass |

**Fact.** All 26 Stage 1 DoD items are satisfied by the candidate and cited
evidence. Gate K (independent audit), Candidate/Implementation Baseline commits,
Gate R, Stage 2, and final V0-C acceptance remain unauthorized and incomplete.

## 9. Limitations and non-claims

This candidate does not prove:

- Completion Policy improves real-model coding performance;
- a real Recovery effect;
- DeepSeek or any external API currently works;
- hidden acceptance can be safely projected;
- cross-process Resume or in-flight crash recovery;
- side-effect reconciliation or exactly-once Tool execution;
- an OS sandbox or system-level network-egress prevention;
- statistical Eval validity, V1 Skill competition, V2 multi-path routing, or
  V3 experience reuse.

The recorded network count is the Stage 1 application/tool/provider route count,
not an OS-level packet capture. No operation in this Session was authorized to
access external network.

## 10. Proposed focused-audit input

The later, separately authorized audit should remain bounded to:

1. successful terminal-record commit before exactly-once Handle close, plus
   incomplete/throw cleanup;
2. persisted Packet/projection shared scan and post-scan revalidation before
   child identity allocation;
3. Run-validation Attempt/Verifier/Packet relations, cumulative counters,
   Recovery truth, dynamic evidence paths and terminal-plan digest;
4. real-profile authority denial before side effects and injected factory/
   credential/budget plumbing through the normal formal orchestration.

It should not re-open general provider research, DLP design, durable runtime,
V1/V2, or Stage 2 execution.

## 11. CURRENT_STATE_UPDATE_PROPOSAL

The dedicated Session did not modify `CURRENT_STATE.md`. Proposed update for
Main Session only, after user review:

```yaml
current_state_update_proposal:
  goal: V0_C
  contract_status: accepted_activated
  stage_1:
    status: corrected_implementation_complete_pending_main_rereview
    suggested_disposition: PASS_V0_C_STAGE1_CORRECTED_CANDIDATE_FOR_MAIN_REVIEW
    control_baseline_commit: 47d36f25563012e1d411576eca387a778ba6a3e7
    strict_typescript: passed
    focused_correction_tests: 5_of_5_passed
    workbench_tests: 83_of_83_passed
    corrected_workbench_digest: a43ec6309e55754f5f095c76b226426a7d3d36b37b9ce36cbc08db6422f5fc6f
    authoritative_observe_run: run-4bba0ea2-314b-4aa7-acb1-fb79d916146e
    authoritative_recovery_pass_run: run-0c752f20-1f14-46a8-b450-cdb30d3e682b
    authoritative_recovery_counterexample_run: run-bc97935e-884b-4524-acec-9d44cdf2b92e
    authoritative_real_profile_injected_fake_run: run-886cbdc1-2c06-4226-8f12-13c2b0d62576
    formal_cli_run: run-3708aacf-23f1-4772-b02c-23d348c6b34f
    external_provider_calls: 0
    real_model_calls: 0
    credential_reads: 0
    network_calls: 0
    pi_core_patches: 0
  active_goal: V0_C
  focused_audit: not_authorized
  candidate_commit: not_authorized
  stage_2: not_authorized
  final_v0_c_acceptance: not_authorized
  next_owner: main_session_for_stage_1_review
```
