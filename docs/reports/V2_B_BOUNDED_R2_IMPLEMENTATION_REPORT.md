# V2-B Bounded R2 Zero-call Implementation Report

Date: 2026-08-07
Owner: original top-level V2-B Stage 1 Implementation Session
Control Baseline: `b1c8cf6045a0118452734bdf3cbe7b65fcd645ac`
Control tree: `5c494f27fd01da4a70c8c162c0f6d588c9613b98`
Pinned Pi: `027a5847901b5dde30270abaa1041046cd2b4b55`
Recommendation: `PASS_FOR_V2B_R2_AUDIT_P1_001_REAUDIT`

## Executive result

**Fact:** The accepted bounded R2 zero-call Amendment is implemented inside its exact allowlist. A controlled primary now traverses the public emitted Direct `AgentHarness`, actual Tool Call/Tool Result lifecycle, and public JSONL Session; it settles, passes a separate maintenance check, fails the unchanged external target Verifier, and freezes a write-once Recovery Seed before either Candidate starts.

**Fact:** The existing V2 Controller is shared. `prepareAndFreezeRecoverySeedV2()` and `executeRecoveryGroupFromSeedV2()` expose the minimum seams from `executeRunV2A()`; no second Seed, Workspace, Session, Verifier, Selector, or Recovery Controller was added.

**Fact:** A uses the public JSONL fork and exact parent entries/lineage; B uses public JSONL create with zero parent entries. Both start from the same frozen Workspace bytes and common-input identity. The only intended treatment delta is parent Session history.

**Fact:** The dormant real DeepSeek composition remains injected and uncalled. Deterministic construction, preflight, complete sequence, controlled Seed, A/B, and Negative proofs all end with Credential/network/external Provider/model counters equal to zero and real cost USD 0.

**Recommendation:** Main should present the bounded correction of Candidate `0bc5eba535c06fd1a780a82f95859defa3f2eb78` for focused re-audit of `V2B-R2-AUDIT-P1-001`. This report does not authorize audit acceptance, an amended Candidate/Execution Baseline commit, Credential access, network, Stage 2 execution, or final V2-B/V2 acceptance.

## Focused-audit bounded correction: V2B-R2-AUDIT-P1-001

**Fact:** The independent focused audit of Candidate `0bc5eba535c06fd1a780a82f95859defa3f2eb78` found one blocking issue: the budget-stopped pre-Verifier checkpoint did not persist the complete Provider reservation ledger, and the Inspector did not reconcile committed tokens against raw Session usage for `budget_stopped` evidence.

**Fact:** `V2B-R2-AUDIT-P1-001` is corrected in this worktree. Before a budget-stopped Candidate Verifier can run, the shared Controller now writes a content-addressed `v2a-provider-reservation-ledger-v1` Artifact containing every Provider reservation, including request identity/order, reserved token/cost ceilings, terminal phase, and committed actual token/cost. The pre-Verifier checkpoint binds that immutable Artifact ref, its Attempt/Candidate identity, independently parsed raw Session token total, independently parsed raw Session cost total, and Journal order.

**Fact:** The Inspector independently reopens the checkpoint Session JSONL and reservation-ledger Artifact. For each non-error assistant response it derives exact tokens and `usage.cost.total`, requires a one-to-one ordered reservation/response match, checks every known commitment is finite, non-negative and within its reservation, and reconciles both per-request and aggregate token and cost totals. It applies the same reconciliation to `settled` and `budget_stopped` Attempts. Runtime/quiescence booleans are checked only as summaries of the raw-derived result.

**Fact:** Coherent tamper tests change `known_usage_committed.actual_tokens` and `known_usage_committed.actual_cost_usd`, refresh the enclosing ledger/checkpoint/Candidate/terminal refs and Journal digests, and are both rejected by read-only inspection. A separate raw runtime-fault case still stops before Verifier; its Verifier count and output file remain zero/absent.

**Fact:** Correction verification passed strict TypeScript, R2 focused 7/7, affected V2-B 19/19, and affected V2-A 11/11, all with zero skipped tests. Candidate HEAD remained `0bc5eba535c06fd1a780a82f95859defa3f2eb78`; the worktree delta is unstaged and allowlist-only; pinned Pi remained exact and clean; all real-access counters and cost remained zero.

No Case, path, retry, fallback, replacement, budget, fixture, Prompt, Skill, Verifier, Selector, Controller, Provider/Model profile, or A/B Session treatment changed.

## Main light-review bounded correction

**Fact:** Main returned `REVISE_V2_B_R2_BOUNDED_BEFORE_CANDIDATE_FREEZE` with two blocking findings. This same original Implementation Session corrected only R2-MR-001 and R2-MR-002. Case set, A/B treatment, Negative, budgets, fixture, Prompt, Skill, Verifier, Selector, Provider/Model profile, Controller, and execution sequence are unchanged.

**Fact — R2-MR-001 closed:** the runtime port no longer asserts outer persistence/quiescence booleans. It reports only runtime-observed pre-dispatch refusal, pending Provider response/reservation, pending Tool count, prior-usage knowledge, and reservation closure. The shared Controller independently reopens the public JSONL Session, freezes Session and Workspace checkpoint Artifacts, validates raw usage, Tool lifecycle, protected paths, and Workspace bytes, writes the checkpoint and append-only Journal event, and only then permits the Verifier. The Inspector independently re-derives this gate from raw bytes, refs, usage/reservations, and Journal ordering.

**Fact — R2-MR-002 closed:** `legacyVerifierEligibleBudgetStop` was removed from the public Harness contract and runtime. Accepted V2-A compatibility is available only when `executeRunV2A()` itself creates its default deterministic port; a module-private ownership set and persisted `execution_port_kind` distinguish this from every injected port. The V2-B Inspector requires `execution_port_kind: injected`. A crafted injected result carrying the removed field plus forged all-true runtime observations remains ineligible because its raw Session usage cannot establish the checkpoint.

## Gate R2-A — Control Baseline

**Fact:** Gate identity was established before source edits:

- HEAD `b1c8cf6045a0118452734bdf3cbe7b65fcd645ac`;
- tree `5c494f27fd01da4a70c8c162c0f6d588c9613b98`;
- tracked and staged state clean;
- Pi `027a5847901b5dde30270abaa1041046cd2b4b55`, clean;
- Amendment accepted and V2-B active;
- original top-level owner retained; no subagent or child Session;
- no dependency installation, copy, link, or lockfile mutation;
- initial counters and cost all zero.

The existing historical `.runs/v0-a` dependency cache is incomplete. The implementation used the already-present clean public emitted Pi build at `D:/AI/AI_Projects/project2/.runs/g006/pi` through an ignored read-only loader and TypeScript path map. No tracked runtime or dependency state was substituted.

## Gate R2-B — Controlled Seed and shared Controller

### Controlled route

The tracked fixture is `fixtures/recovery/v2b-r2/partial-subject.ts`, SHA-256 `ac487bcab206535edf13ad2b77c5052f552ab0d27bcd8071b457d4bd187da1d9`. `provenance.json` identifies it as a disclosed behavior-derived fixture from V1-C R2 cell 14, not a claim of copied historical bytes.

The controlled provider:

1. opens a caller-provided public JSONL Session;
2. issues an actual `workspace_write` Tool Call and records its Tool Result;
3. issues a maintenance `run_command` Tool Call and records its Tool Result;
4. reaches `settled`;
5. persists Session and Workspace evidence;
6. passes the distinct maintenance check;
7. fails the unchanged external target Verifier;
8. freezes the Recovery Seed before `candidate_started`.

Host-side copying is not used to form the failed Workspace. Tests compare the primary and Seed bytes with the tracked fixture and validate the Tool Call/Tool Result IDs and order from raw JSONL.

### Shared seam and fairness

- `workbench/src/run-v2.ts`: `prepareAndFreezeRecoverySeedV2`, `executeRecoveryCandidateFromSeedV2`, `executeRecoveryGroupFromSeedV2`.
- V2-A and R2 call the same Candidate materialization, Session fork/create, Verifier, Selector, and evidence code.
- Seed freeze uses write-once artifacts plus byte/digest revalidation.
- A retains exact parent record bytes and parent lineage; B has zero pre-run entries and no parent.
- both Candidate Workspaces have the Seed digest before execution;
- common task, recovery instruction, Skill/System Prompt, Provider/Model/thinking, Tool Profile, Verifier, budget, Pi, Workbench, Manifest, Failure Packet, and Workspace identities bind into the common-input evidence;
- the Inspector does not demand equal final provider-payload hashes because Session histories legitimately differ.

Deterministic selection covers A pass/B fail, A fail/B pass, A fail/B fail with Selector none, and A safe-budget-terminal/B pass. F2P/P2P evidence retains maintenance pass separately from target fail/pass.

## Gate R2-C — Terminal and Inspector correction

### Safe pre-dispatch budget terminal

The eight conditions now have the following raw source, derivation point, persistence point, and ordering:

| Condition | Raw source and derivation | Persisted proof before Verifier |
|---|---|---|
| pre-dispatch refusal | `before_provider_request` denies the next request after the frozen request cap | runtime observation in checkpoint and later Attempt evidence; raw Session has exactly the cap's completed dispatches |
| no pending Provider response | runtime pending-reservation state is zero | checkpoint observation; Inspector cross-checks raw Session and Attempt reservations |
| no pending Tool call | `tool_call`/`tool_result` counters are zero | checkpoint observation plus independently parsed JSONL Tool Call/Tool Result closure |
| no pending side effect in the bounded proof | zero pending Tool count, complete Tool-result lineage, readable frozen Workspace | Session checkpoint, Workspace checkpoint, and protected-path result; no exactly-once/general crash-durability claim |
| prior usage known | no unknown/overflow branch; every reservation terminal | raw Session usage in checkpoint; V2-B Inspector reconciles persisted reservation phases and totals |
| Session persisted | Controller creates a new public `JsonlSessionRepo`, reopens by metadata, rereads entries, and compares them | immutable `session-pre-verifier.jsonl` Artifact/ref |
| Workspace persisted | Controller inventories readable Workspace and verifies protected/secret guardrails | immutable `workspace-pre-verifier.json` ref/digest |
| evidence closed | checkpoint JSON is write-once, followed by its append-only Journal event | checkpoint `journal_sequence`; Inspector requires checkpoint event before `candidate_verifier_completed`, which precedes `candidate_terminal` |

Only this Controller-derived gate permits exactly one common external Verifier. The Candidate remains `settled: false` with `agent_completion: pre_dispatch_budget_terminal`. Missing/unopenable Session evidence, unreadable or changed Workspace evidence, raw usage/reservation disagreement, incomplete Tool-result lineage, or incorrect Journal order fails before Verifier.

The Attempt evidence is persisted after the substrate returns, but is bound by Attempt ID to the already persisted checkpoint; its runtime observation and reservation ledger must match the checkpoint and raw Session. Its all-true quiescence summary is therefore a derived projection, never authority.

The accepted V2-A deterministic budget scenario remains regression-compatible only through Controller-owned default mode. Supplying the same deterministic port explicitly classifies the run as injected and grants no compatibility authority.

### Schema-aware evidence scanner

`scanEvidenceBytesV2()` parses JSON/JSONL and permits only a finite non-negative number at the exact root path `message.usage.reasoning`. It rejects:

- negative, nonnumeric, infinite, or malformed reasoning metadata;
- nested/wrapped or otherwise unknown reasoning shapes;
- reasoning/thinking content;
- reasoning/thinking signatures;
- Credential, API-key, Authorization, and secret fields or raw bearer patterns;
- unparseable sensitive-looking JSON/JSONL.

`validateSessionToolLineageV2()` independently enforces one Tool Result after each unique Tool Call, matching ID and order, with no foreign, duplicate, or pending call.

### Sequence readiness

The deterministic frozen sequence proves the no-source-edit product path:

- immutable Manifest and source/Execution-Baseline/Pi preflight;
- predeclared Primary, conditional Contingency, and Negative;
- controlled Primary forms the Seed and runs A/B;
- Contingency is skipped because a valid Seed was formed;
- one Negative settles and passes without recovery objects;
- append-only ledger, Attempt starts, Case refs, terminal refs, aggregate usage, counters, and cost reconcile under the read-only Inspector;
- final typed status is `completed / sequence_completed`.

Real composition construction and close are also tested with a synthetic resolver that is never invoked.

## Gate R2-D — Verification and zero access

| Verification | Result |
|---|---:|
| strict TypeScript | exit 0 |
| R2 focused suite | 7/7, zero skipped |
| V2-B focused suite | 19/19, zero skipped |
| V2-A full regression | 11/11, zero skipped |
| V1 Provider/budget regression | 27/27, zero skipped |
| bounded V1 CLI surface/authority | 2/2, zero skipped |
| Workspace/Verifier path security | 11/11, zero skipped |
| `git diff --check` | exit 0 |
| R1 tracked report protection | unchanged |
| Pi identity/cleanliness | exact/clean |

One combined exploratory V1 CLI command exited 1 because two tests intentionally spawn children with `env: {}`, which excludes the ignored public-Pi loader and stops at module resolution. The other 40 tests in that command passed. Amendment boundaries prohibit dependency install/copy/link repair. Canonical bounded CLI proof was rerun for the surface and authority gates (2/2); the underlying V1 provider/budget boundaries passed 27/27.

Final counters:

```json
{
  "credential_reads": 0,
  "network_calls": 0,
  "external_provider_calls": 0,
  "real_model_calls": 0,
  "real_cost_usd": 0
}
```

This is application-path counter/stub evidence, not an OS-level egress-blocking claim.

## Amendment §9 deterministic evidence mapping

| §9 item | Implementation/positive proof | Negative/tamper proof |
|---:|---|---|
| 1 | Direct Harness + Tool writes fixture and settles | raw JSONL Tool lineage independently checked |
| 2 | maintenance pass, target fail, then Seed | journal ordering and ref/digest checks |
| 3 | write-once Seed before Candidate starts; equal initial digests | Seed/source-byte tamper rejected |
| 4 | A public fork with parent records; B create with 0 entries | V2-A lineage regression rejects foreign/divergent lineage |
| 5 | equal common-input identity and initial Artifact bytes | Inspector permits only explicit Session history delta |
| 6 | all eight quiescence facts raw-derived; Verifier once | Session/Workspace/Tool/reservation/Journal tamper rejected; raw fault leaves Verifier count 0 |
| 7 | overflow/unknown/Tool cap fail closed | V2-B focused negative scenarios; injected legacy-shaped bypass rejected |
| 8 | exact numeric path accepted | content/signature/secret/wrapped/malformed rejected |
| 9 | maintenance/target refs remain separate | controlled A fail preserves target failure evidence |
| 10 | Negative pass, one Attempt, no recovery paths | existence assertions on Seed/Candidate/Selection paths |
| 11 | pass/fail, fail/pass, fail/fail, safe-budget combinations | Selector none and budget-terminal cases |
| 12 | TypeScript and all bounded regressions green | zero skipped |
| 13 | zero counters/cost in Runs, sequence and preflight | dormant resolver call count remains zero |
| 14 | allowlist-only delta, Pi exact/clean | protected-path and R1-report checks |

## R2 Definition of Done status

| DoD | Status at this stop |
|---:|---|
| 1 R1 history preserved | PASS for tracked reports; R1 ignored run was absent at Gate and was not created/changed |
| 2 Amendment/baseline/owner frozen | PASS |
| 3 zero-call Seed/shared seam implemented and focused-audited | IMPLEMENTATION PASS; focused audit found one bounded correction; re-audit pending |
| 4 Inspector and safe terminal bounded/fail-closed | IMPLEMENTATION PASS after P1 raw-ledger correction; re-audit pending |
| 5 audited Execution Baseline before real access | PENDING Main + audit |
| 6 controlled Seed valid evidence | deterministic PASS; real Execution Session pending |
| 7 real A/B terminal | NOT RUN / unauthorized here |
| 8 real Selector outcome | NOT RUN / unauthorized here |
| 9 real Negative | NOT RUN / unauthorized here |
| 10 all real identities/usage/cost inspectable | construction proven; real evidence pending |
| 11 R2 Execution source delta 0/Pi route unchanged | Pi route unchanged; Execution Session pending |
| 12 Main disposition/user decision | PENDING |

## Exact source delta

Modified tracked allowlisted files:

- `workbench/README.md`
- `workbench/package.json`
- `workbench/src/contracts/v2-types.ts`
- `workbench/src/contracts/v2b-types.ts`
- `workbench/src/inspect-v2.ts`
- `workbench/src/inspect-v2b.ts`
- `workbench/src/pi/pi-run-handle-v2b.ts`
- `workbench/src/run-v2.ts`
- `workbench/src/run-v2b.ts`
- `workbench/tests/v2b-stage1.test.ts`

New allowlisted files:

- `workbench/tests/v2b-r2.test.ts`
- `fixtures/recovery/v2b-r2/partial-subject.ts`
- `fixtures/recovery/v2b-r2/provenance.json`
- this report and `V2_B_BOUNDED_R2_CLOSEOUT_DRAFT.md`
- ignored `.runs/v2-b/r2-stage1/**` evidence.

No changes exist in `CURRENT_STATE.md`, `AGENTS.md`, formal governance, Selector, accepted V1 fixtures, Pi, references, lockfiles, or R1 reports. Nothing is staged or committed.

## Evidence

- `.runs/v2-b/r2-stage1/EVIDENCE_INDEX.md`
- `.runs/v2-b/r2-stage1/COMMANDS_AND_EXIT_CODES.md`
- `.runs/v2-b/r2-stage1/SOURCE_DELTA.md`
- `.runs/v2-b/r2-stage1/ZERO_ACCESS.json`

## Unverified items and claims boundary

**Unverified:** focused re-audit and closure of `V2B-R2-AUDIT-P1-001`; Main amended Candidate commit; audited Execution Baseline; Gate H-R2 against that future immutable SHA/tree/Manifest; any Credential resolution; any network or real Provider/model dispatch; real A/B; real Negative; final reconciliation; final V2-B/V2 disposition.

**Not claimed:** universal network sandboxing, natural model failure recovery, A/B superiority, statistical improvement, exactly-once Tool effects, production durability, SDK/Extension/RPC integration, V3 capability, or final Version acceptance.

## CURRENT_STATE_UPDATE_PROPOSAL

Do not apply this proposal until Main review and candidate handling.

```yaml
active_goal: V2_B_FROZEN_BOUNDED_REAL_RECOVERY_ACCEPTANCE
v2_b_bounded_r2_implementation:
  status: PASS_FOR_V2B_R2_AUDIT_P1_001_REAUDIT_RECOMMENDED
  control_baseline_commit: b1c8cf6045a0118452734bdf3cbe7b65fcd645ac
  control_baseline_tree: 5c494f27fd01da4a70c8c162c0f6d588c9613b98
  implementation_owner: original_v2_b_stage_1_top_level_implementation_session
  zero_call_controlled_seed: implemented_and_deterministically_proven
  shared_v2_controller: preserved
  quiescent_budget_terminal: implemented_and_fail_closed
  schema_aware_reasoning_metadata: exact_path_numeric_only
  frozen_no_source_edit_sequence: deterministically_proven
  strict_typescript: pass
  focused_r2_tests: 7_of_7_pass_zero_skipped

  main_light_review_findings:
    R2_MR_001: closed_raw_derived_pre_verifier_checkpoint
    R2_MR_002: closed_controller_owned_v2a_compatibility_no_injected_bypass
  focused_audit_findings:
    V2B_R2_AUDIT_P1_001: corrected_complete_pre_verifier_reservation_ledger_and_independent_token_cost_reconciliation_reaudit_pending
  v2_b_regression: 19_of_19_pass_zero_skipped
  v2_a_regression: 11_of_11_pass_zero_skipped
  v1_provider_budget_regression: 27_of_27_pass_zero_skipped
  bounded_v1_cli: 2_of_2_pass_zero_skipped
  workspace_verifier_security: 11_of_11_pass_zero_skipped
  credential_reads: 0
  network_calls: 0
  external_provider_calls: 0
  real_model_calls: 0
  real_cost_usd: 0
  next_authorized_step: focused_reaudit_of_V2B_R2_AUDIT_P1_001_then_main_disposition
  stage_2_execution: not_started_not_authorized_for_this_session
  final_v2_b_v2_acceptance: pending_main_and_user
```

## Final disposition

`PASS_FOR_V2B_R2_AUDIT_P1_001_REAUDIT`

Stop here for Main and focused re-audit. Do not begin audit or real execution.
