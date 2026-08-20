# V3.7 Goal 3A Exceptional Remediation Prompt

```yaml
prompt_id: V3_7_G3A_EXCEPTIONAL_P1_001_REMEDIATION
status: AUTHORIZED_FOR_ORIGINAL_IMPLEMENTATION_SESSION
date: 2026-08-20
authoritative_repository: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
authoritative_branch_at_freeze: codex/v2-b-bounded-r2
accepted_charter: V3_7_CHARTER.md
accepted_exception_amendment: V3_7_G3A_EXCEPTIONAL_REMEDIATION_AMENDMENT.md
amendment_freeze_commit: 8b951112faac4903ff4ba08f9a242902f6d597e7
amendment_freeze_tree: 046705a0ccf274031baca3d28545eef9bfef219c
preserved_failed_candidate_commit: 84d8f87044eced89542e87ff35ed7176496d05b2
preserved_failed_candidate_tree: 177921f4825d4c490b466866f10ff432320df6c6
remediation_starting_commit: RESOLVED_BY_MAIN_DISPATCH
implementation_owner: /root/v37_g3a_implementation
architecture_and_acceptance_owner: V3_7_Main_Session
candidate_commits_authorized: 1
exceptional_remediation_budget: 1
ordinary_correction_budget: 2_of_2_exhausted_unchanged
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_product_runs: 0
goal_3b_authority: false
```

## 1. Mission and stop point

Close only the repeated `V37-G3A-MAIN-P1-001` authority/terminalization class recorded in
`docs/reports/V3_7_G3A_CORRECTION_2_MAIN_REREVIEW_HARD_STOP.md`:

1. represent the Charter-frozen `recovery_inconclusive` terminal from an independently
   inspected V2 `recovery_none` fact;
2. let a later real-declared Case use the same complete Primary, Recovery, Candidate,
   Regression and follow-up product action path through Host-construction ports without a
   later implementation-source change;
3. require the exact real-declared construction authorization and all required ports at
   every mutation, including after restart; and
4. prove the whole behavior with local deterministic mocks and zero actual external
   operations.

Create exactly one allowlist-clean Candidate commit, update the implementation/Closeout
reports, add one remediation report and stop for Main rereview. Do not audit, accept Goal
3A, freeze/configure/execute Goal 3B or perform any real access.

## 2. Authority and immutable baseline

- Read and obey in order: revised `V3_7_CHARTER.md`, the exceptional Amendment, this
  Prompt, `CURRENT_STATE.md`, the Correction-2 Main Hard Stop, then prior reports/source.
- Preserve Candidates `71dd205e...`, `1843a683...` and `84d8f870...` without amendment.
- Preserve every accepted v1 file/hash and both tracked Goal 3A config/fixture byte sets.
- Preserve V2 controller/selector, V3 Candidate/Regression/State/G2 and V3.6 semantics.
- The user-owned untracked `docs/reports/SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md` is outside
  scope and must not be read, changed, staged or committed.

If closure requires a different source/config path, old semantic change, new schema,
new Evidence family, real adapter/access or a second Candidate, stop with zero such delta
and return `HARD_STOP_EXCEPTION_FAILED`.

## 3. Exact implementation allowlist

Only these paths may change:

```text
workbench/src/contracts/v37g3a-types.ts
workbench/src/v37/host-registry-v37g3a.ts
workbench/src/v37/registered-recovery-v37g3a.ts
workbench/src/v37/product-service-v37g3a.ts
workbench/src/read-model/workflow-v37g3a.ts
workbench/src/inspect-v37g3a.ts
workbench/tests/v37g3a-authority.test.ts
workbench/tests/v37g3a-product.test.ts
workbench/tests/v37g3a-http-ui.test.ts
docs/reports/V3_7_G3A_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G3A_CLOSEOUT_DRAFT.md
docs/reports/V3_7_G3A_EXCEPTIONAL_REMEDIATION_REPORT.md
```

Ignored deterministic evidence below `.runs/v37/g3a-*` is allowed and must be cleaned or
left ignored. No tracked third Case/config is authorized.

## 4. Exact Primary and Recovery terminal contract

Change the G3A Primary Inspector result from a boolean recovery flag to an exact route:

```text
no_recovery_needed
ready_for_recovery
recovery_inconclusive
```

Require:

- registered deterministic Primary-pass G3A terminal: exact current schema, canonical
  ordinary bytes, digest, Task/Source/Verifier, zero counters, `no_recovery_needed`;
- V2 `initial_pass`: independently valid Primary PASS, `no_recovery_needed`;
- V2 `recovery_selected`: independently valid Primary failure and two paths with a valid
  selected arm, `ready_for_recovery`;
- V2 `recovery_none`: independently valid Primary failure and two failed/ineligible paths
  with no selection, `recovery_inconclusive`;
- every other combination: fail closed before a successful receipt.

`recovery_inconclusive` is an empty-action terminal. It creates no Recovery Evidence,
admission, Candidate or State artifact. Existing `candidate_rejected` remains unchanged.

A real-declared profile must require `execution_port_kind: injected` and a V2 terminal;
it cannot use the G3A-local Primary-pass terminal. Call `inspectRunV2A` with exact
Host-loaded Task id, `expectedRealExecutionAuthorized: true`, `expectedExecutionPortKind:
injected` and the exact declared counter tuple. The V2 substrate retains its own frozen
controller constants, including its controller model id. Do not falsely compare that
controller id with the separate G3A Host-declared external Provider/model id; bind the
latter through the workflow registration, Manifest/profile digest and construction
authorization instead. Strict Provider attestation remains out of scope.

The Recovery bridge must use the same Host-loaded declaration and Inspector expectations.
Its current zero/internal/`real_access=false` assumptions remain exact only for the two
frozen deterministic Cases. Preserve all Task/Verifier/strategy/budget/Base Prompt and
Candidate-Path identity checks.

## 5. Complete construction-port boundary

`ProductCaseExecutionPortsV37G3A` must provide the actual execution boundaries needed by
the seven-unit Goal 3B path, while current deterministic defaults remain local:

```text
primary
candidate proposal
Regression symmetric validation
bound follow-up Runtime
```

- Reuse the existing `BoundedProposalPortV3` and `FauxValidationPortV3`-compatible
  interfaces; do not invent a Candidate or Regression schema.
- Current recovery Case defaults use its registered deterministic proposal and validation
  adapters. Current Primary-pass Case cannot reach later ports.
- A later real-declared Case is unavailable unless all four exact ports and its separate
  construction authorization are present.
- Candidate creation continues through `producePromptCandidateV37G3A`, the admitted
  Opportunity, current State, registered generic template and leakage validation; only
  its proposal port becomes Host-supplied.
- Regression continues through `executeSymmetricValidationV3`, genuine Base/Candidate
  execution, registered Verifiers, Decision and State CAS; only its execution port
  becomes Host-supplied. Derive its authority/profile digests from Host-loaded Manifest
  specs, never hardcoded Case-independent strings.
- Follow-up continues through the accepted V3.6 Runtime observation, Verifier, Outcome,
  admission and G2 Assessment; only its Runtime port is Host-supplied.

Extend the construction authorization with exact Candidate-proposal and Regression
authority digests derived from the selected Manifest/provider/tool/command/budget/stop/
candidate/regression specs. Configuration values do not authorize execution. Before
**every** real-declared `act()`, reload the workflow/Case and require the same exact
authorization, all four ports and current non-disabled registration. Read-only `get`/
list/reopen remains possible without those execution capabilities.

No port or authorization may enter through HTTP/browser bodies, workflow artifacts,
Case id alone, environment variables or returned terminal fields. Frozen deterministic
Case ports cannot be overridden.

## 6. Exact deterministic proof matrix

Use one temporary ignored third registration at a time. Derive every Manifest/envelope/
profile digest and restore the tracked registry in `finally`.

### 6.1 Authority negatives

Prove each fails before mutation:

- config only;
- ports only;
- authorization only;
- missing any one of the four ports;
- mismatched Case/Manifest/profile/counter/Candidate/Regression authorization digest;
- real-declared profile with internal-deterministic port kind;
- real-declared G3A-local pass terminal;
- malformed/rehashed/substituted V2 terminal; and
- service restart with exact ports but without authorization at every stage that can be
  reached without performing a real operation.

### 6.2 Honest terminal matrix

Use explicit local deterministic V2 execution ports so the V2 manifest records injected
port kind and real authorization, while independently instrumented actual external
operations remain zero:

- V2 Primary pass -> `no_recovery_needed`, no learning artifacts/actions;
- Primary fail plus both candidate paths fail -> `recovery_inconclusive`, no learning
  artifacts/actions;
- Primary fail plus valid selected path -> `ready_for_recovery` and the complete route.

Formal nonzero counter tuples are simulation evidence only. Reports must separately state
actual Credential/network/Provider/model operations `0`.

### 6.3 Complete selected route

For the selected route, use:

- a local proposal mock through the Host-supplied proposal port that returns only the
  already registered generic prompt-addendum template;
- a local symmetric Regression mock through the Host-supplied validation port, exercising
  genuine Base/Candidate comparison and State publication; and
- a local V3.6 follow-up Runtime mock through the Host-supplied Runtime port that produces
  genuine schema-3 observation/Manifest, formal simulated counters, local Verifier/
  Outcome and zero actual external operations.

Run every product action through retained Assessment. Restart with full authority and
reopen the complete workflow. At selected checkpoints, restart with ports-only and prove
the next mutation is rejected. No direct artifact manufacture may replace the accepted
V2, producer, comparator, V3.6 Runtime, Verifier, admission or G2 paths.

## 7. Preserved verification

Rerun serially from `workbench/`:

```text
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g3a-authority.test.ts tests/v37g3a-product.test.ts tests/v37g3a-http-ui.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g1-registered-recovery.test.ts tests/v37g2-runtime-effective-followup.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v2a-recovery.test.ts tests/v2a-cli.test.ts tests/v2a-post-audit.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v3g1-evidence-to-candidate.test.ts tests/v3g2-validate-promote-reject-rollback.test.ts
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v36g1-http-ui.test.ts tests/v36g2-change-handoff.test.ts tests/v36g2-product-entry.test.ts tests/v36-product-polish.test.ts
npm run typecheck
node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit
node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs scripts/start-v37g3a-demo.ts --smoke --port 0
```

Record the exact project-wrapper limitation if its fixed ignored compiler remains absent;
do not install. Reconfirm the thirteen v1 hashes, configuration/fixture bytes, exact
allowlist, one Candidate commit and `git diff --check`.

## 8. Handoff

Update the implementation report and Closeout draft without overclaiming. The exceptional
report must list exact routes, simulated versus actual access counts, files, commands,
totals, hashes and unverified audit/real behavior. Create one Candidate commit and stop.
Main alone rereviews, freezes an audit Candidate, starts the independent audit, accepts
Goal 3A and prepares Goal 3B.
