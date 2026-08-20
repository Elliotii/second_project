# V3.7 Goal 3A Final Audit Remediation Prompt

```yaml
prompt_id: V3_7_G3A_FINAL_AUDIT_REMEDIATION
status: AUTHORIZED_FOR_ORIGINAL_IMPLEMENTATION_SESSION
date: 2026-08-21
authoritative_repository: C:/Users/HUAWEI/.codex/worktrees/g25main/project2
authoritative_branch_at_freeze: codex/v2-b-bounded-r2
accepted_charter: V3_7_CHARTER.md
accepted_amendment: V3_7_G3A_FINAL_AUDIT_REMEDIATION_AMENDMENT.md
amendment_freeze_commit: c769e0583c53e31380174d07117dd4f493c15aaf
amendment_freeze_tree: f8309361e33b81424d4ff0dbbd76d2d6abe26ffc
preserved_failed_audit_candidate_commit: f82a65612ef66b21f65c110fcdc4feee91907c74
preserved_failed_audit_candidate_tree: 04d73a7714f007a07ad7c9825dad02ca90267c51
remediation_starting_commit: RESOLVED_BY_MAIN_DISPATCH
implementation_owner: /root/v37_g3a_implementation
architecture_and_acceptance_owner: V3_7_Main_Session
candidate_commits_authorized: 1
final_audit_remediation_budget: 1
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_product_runs: 0
goal_3b_authority: false
```

## 1. Mission and stop point

Close only:

- `V37-G3A-EXAUDIT-P1-001`: a real-declared Regression can bypass the supplied
  Regression port when `regressionCandidatePass:false`; and
- `V37-G3A-EXAUDIT-P2-002`: the selected-route test's actual-operation object is not
  connected to its four local mocks.

Create exactly one allowlist-clean Candidate, update the three allowed reports, run all
required deterministic verification and stop for Main rereview. Do not audit, accept Goal
3A, edit control state, unlock/configure Goal 3B or perform any real access.

## 2. Authority and preserved baseline

Read and obey in order: revised `V3_7_CHARTER.md`, final Amendment, this Prompt,
`CURRENT_STATE.md`, the independent audit report and Main integration Hard Stop, then the
prior implementation reports/source.

Preserve without amendment all earlier Candidates, especially `f82a656...` / tree
`04d73a7...`. Preserve all configuration/fixture bytes, thirteen accepted v1 hashes,
V2/V3/V3.6 semantic source, Candidate/State/Assessment behavior and Goal 3B lock.

The user-owned untracked `docs/reports/SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md` is outside
scope and must not be read, modified, staged or committed.

## 3. Exact implementation allowlist

Only these paths may change:

```text
workbench/src/v37/product-service-v37g3a.ts
workbench/tests/v37g3a-product.test.ts
docs/reports/V3_7_G3A_IMPLEMENTATION_REPORT.md
docs/reports/V3_7_G3A_CLOSEOUT_DRAFT.md
docs/reports/V3_7_G3A_FINAL_AUDIT_REMEDIATION_REPORT.md
```

If closure needs a different path, new schema, new port, config/fixture change, second
Candidate or real adapter/access, stop with zero such delta and return Hard Stop.

## 4. P1 exact repair

- Keep `regressionCandidatePass` only for the frozen deterministic Product test route.
- In `runRegression`, use the current Host-loaded registration to distinguish a
  real-declared Case. For every real-declared Case, always pass the exact supplied
  `configuredPort` to `executeSymmetricValidationV3`; the deterministic switch must not
  select `rejectionPort` or otherwise determine the Decision.
- Do not change `ProductPortsV37G3A`, `ProductCaseExecutionPortsV37G3A`, authorization
  digests, comparator, State Store/CAS, Candidate or Decision contracts.
- If the real-declared supplied port throws or returns invalid evidence, propagate the
  failure through the existing handler, append no `run_regression` receipt and perform no
  fallback.
- Preserve the frozen zero-access deterministic Case's existing
  `regressionCandidatePass:false` -> `candidate_rejected` coverage.

## 5. P2 exact proof repair

Replace the unused zero object with one shared audit-visible tracker created before the
temporary real Case mocks. The Primary, Candidate-proposal, Regression-validation and
follow-up Runtime mock implementations must all receive/reference that same tracker and
record their local mock invocations. Keep these counters separate:

```text
local_mock_invocations:
  primary
  candidate_proposal
  regression_validation
  follow_up_runtime

actual_external_operations:
  credential_reads
  network_calls
  external_provider_calls
  real_model_calls
```

The tracker must expose an explicit recording boundary for any actual external operation;
the four mocks remain local and must never call that boundary. Assert expected nonzero
local invocation counts, shared tracker wiring and exact zero external-operation counts.
Do not relabel formal simulated Manifest counters as actual operations.

## 6. Deterministic tests

Add bounded coverage using the existing temporary real registration helper:

1. With `regressionCandidatePass:false`, a valid supplied Regression mock is invoked for
   both symmetric arms, its result controls promotion and the workflow reaches
   `ready_for_follow_up` rather than `candidate_rejected`.
2. With the same switch, a throwing supplied Regression mock is invoked, the action
   rejects, receipt count remains unchanged and no internal rejection fallback appears.
3. The frozen deterministic negative route still terminates honestly at
   `candidate_rejected`.
4. The complete selected route asserts all four mock-family invocation counts and zero
   actual Credential/network/Provider/model operations.

Tests must continue to use retained V2, producer, comparator, State CAS, V3.6 Runtime,
Verifier/Outcome, admission and G2 paths. No direct Artifact manufacture or success flag
may replace them.

## 7. Preserved verification

Run serially from `workbench/`:

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

Record the exact wrapper limitation if its ignored compiler remains absent; do not
install. Reconfirm thirteen v1 hashes, configuration/fixture bytes, exact five-path
allowlist, one Candidate and `git diff --check`.

## 8. Handoff

Update the implementation report and Closeout draft without overclaiming. The final
audit-remediation report must state the exact code branch, port call counts, tracker
wiring, simulated versus actual counts, files, commands, totals, hashes and unverified
items. Create one Candidate commit and stop. Main alone rereviews, freezes re-audit,
starts the fresh independent re-audit, accepts Goal 3A and prepares Goal 3B.

