# V1-A Focused Independent Re-audit Report

```yaml
goal_id: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
session_role: focused_independent_reaudit
disposition: PASS_FOCUSED_V1_A_REAUDIT
corrected_candidate_commit: 784bd1ec06c2aa9ed554a7da661bdf582097bcdf
corrected_candidate_tree: 680810b7c2f8b12dbd3503b5a38f1ab162b63996
failed_parent_candidate: e3ff98948b26187b48af61928b56e7cacb550d31
control_baseline_commit: c9f91057db60cf61dab0d3aa305564d498c89cd6
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
blocking_findings: 0
source_repair_performed: false
control_state_modified: false
git_commit_created: false
```

## 1. Disposition

**PASS_FOCUSED_V1_A_REAUDIT**

**Fact.** The re-audit ran from the exact corrected Candidate commit/tree in a detached fresh Windows worktree created with `core.autocrlf=true`. All four authorized findings close, and every required minimum regression passes. No contradictory result, non-local regression signal, or unprovable correction boundary appeared, so the complete Workbench regression was not rerun.

**Inference.** The corrected Candidate now supplies sufficient focused evidence for Main Session to review Gate J. This report does not accept or close V1-A, create an Implementation Baseline, or authorize V1-B.

## 2. Frozen identity and checkout state

| Item | Observed result |
| --- | --- |
| Audit worktree | `C:/Users/HUAWEI/.codex/worktrees/4549/project2` |
| HEAD commit | `784bd1ec06c2aa9ed554a7da661bdf582097bcdf` |
| HEAD tree | `680810b7c2f8b12dbd3503b5a38f1ab162b63996` |
| Failed parent Candidate | `e3ff98948b26187b48af61928b56e7cacb550d31` |
| Git state at start/final pre-report check | detached; tracked tree and index clean |
| `core.autocrlf` | `true` |
| Main repository HEAD/tree | same corrected Candidate commit/tree |
| Pi HEAD | `027a5847901b5dde30270abaa1041046cd2b4b55` |
| Pi status | clean |
| Dependency reuse | ignored junction `workbench/node_modules` -> `D:/AI/AI_Projects/project2/workbench/node_modules`; ignored junction `.runs/v0-a/pi/node_modules` -> `D:/AI/AI_Projects/project2/.runs/v0-a/pi/node_modules` |

**Fact.** No dependency was installed or downloaded. The main repository's pre-existing untracked re-audit start Prompt and `reference/` tree were not modified.

## 3. F-001 through F-004 conclusions

### F-001 — closed: fresh Windows checkout and digest authority

**Fact.** All 50 tracked `fixtures/**` paths have one of the bounded text extensions (`.json`, `.md`, `.mjs`, `.ts`, `.txt`), resolve through Git attributes to `text: set` and `eol: lf`, contain zero CRLF sequences, and are byte-identical to the corrected Candidate blobs. Their raw-object and prospective-clean object IDs are identical. Every accepted non-V1 fixture blob is byte-identical between the failed parent Candidate and the corrected Candidate; `accepted_v0_parent_blob_deltas: 0`.

**Fact.** `.gitattributes` contains only the pre-existing `/workbench/** text eol=lf` rule and the bounded replacement `/fixtures/** text eol=lf`. In this `core.autocrlf=true` checkout, `.gitattributes` itself is checked out as CRLF because it does not self-apply; its prospective clean object still equals the 118-byte Candidate blob. It is not a fixture authority path. All exact-byte fixture paths and all Workbench inventory paths are raw worktree/blob identical.

**Independent counterexample.** The audit checked every tracked fixture for CRLF, worktree/blob mismatch, prospective-clean drift, and accepted-V0 parent/blob drift. Any such mismatch aborts the audit script. Observed counts were `0 / 0 / 0 / 0`.

The frozen identities independently recomputed from corrected Candidate blobs and the tracked Manifest are:

```yaml
source_digest: 8702ac87651808e30f971e27dbcb64dfb4c8a2c1ca4ceb28e124978042b7ea59
workbench_inventory_digest: a20c910330ef886a7c519deac2f6bfebb097215e970d1e30babe28ac50f8fa7b
fixture_inventory_digest: cf0d88930491e8d9bfded909be490960b6eb995549abae274b8c81685aa68c06
manifest_workbench_digest: aab587b0c7371964ad89ecfc9304720757d7243dc457b904d5e91956eb0bc5d2
manifest_id: c59cc2b780e6b0ca5c01c5f1d63f17fced4cc1d6b345370fd1856a0b11d3126e
```

The tracked Manifest's `workbench_tree_digest` and `manifest_id` equal the independent recomputation.

### F-002 — closed: complete B/C request identity

**Fact.** The public Faux callback captured the actual request model and options for B and C. Both used the same fixed descriptor:

```yaml
api: v1a-faux-api-v1
provider: v1a-faux-provider-v1
model_id: v1a-faux-model-v1
base_url: http://localhost:0
reasoning: false
context_window: 128000
max_tokens: 16384
```

B/C model-visible Context and the stable request-options projection were byte-equal. The projection includes temperature, max tokens, transport, cache retention, timeouts and retry controls; signal, callbacks, credential/API-key material, headers, fetch objects and random Session identity are excluded from payload equality.

**Independent counterexamples.** Mutating any one of `api`, `provider`, model `id`, or semantic `maxTokens` made both `bc_byte_equal` and `common_context_equal` false. The positive B/C proof remained true, and the existing A/B wrapper-only delta remained true.

**Pi evidence.** Pinned `.upstream/pi/packages/ai/src/providers/faux.ts` defines `FauxResponseFactory(context, options, state, model)` and `createFauxCore` passes `requestModel` as the fourth callback argument. The corrected capture is exercised by `workbench/tests/v1a-deterministic.test.ts`, test `V1A-POST-AUDIT-F-002 actual callback model and request options bind B/C equality and detect semantic drift`.

### F-003 — closed: credential-safe public error

**Fact.** A non-secret fake marker independently triggered resolver failure and transport failure through the public `handle.prompt` seam. Both returned only `FixedProviderRequestErrorV1` with message `V1 fixed provider request failed`; neither Error had an own `cause`, returned object, marker-bearing message, or marker-bearing public projection. Resolver failure caused zero transport calls.

**Independent counterexample.** The transport threw an internal error containing the fake resolved value. The public error and generated evidence still contained no marker. A scan of 10 generated evidence/command files, excluding only the audit script that defines the marker, found zero matches.

### F-004 — closed: usage evidence fails closed

**Fact.** Valid zero, exact-boundary and ordinary values were accepted with an empty credential projection. Thirteen invalid cases were rejected: NaN, input-token infinity, cost infinity, negative request/input/output/cost, fractional request/input/output, request count 17, combined tokens 131073, and cost USD 0.21.

**Independent counterexample.** Each invalid case was invoked directly against `projectFixedProviderUsageV1`; none returned accepted evidence. The audit did not add fields or expand the schema into a general budget system.

## 4. Required command results

Unless noted otherwise, commands ran from `C:/Users/HUAWEI/.codex/worktrees/4549/project2/workbench`.

| Command | Working directory | Exit | Result | Duration |
| --- | --- | ---: | --- | ---: |
| `node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | Workbench | 0 | strict TypeScript passed | 3501 ms |
| `node --test --test-name-pattern=V1A-POST-AUDIT-F tests/v1a-deterministic.test.ts` | Workbench | 0 | 4/4 passed | 7973 ms runner; 7914 ms test |
| `node --test tests/v1a-deterministic.test.ts` | Workbench | 0 | 18/18 passed | 12423 ms runner; 12372 ms test |
| `node scripts/run-v1a-deterministic-suite.mjs` | Workbench | 0 | five gates passed; per-suite Faux requests 4; external behavioral Verifier calls 16 | 3029 ms |
| `node --test tests/v0b-verifier.test.ts` | Workbench | 0 | 2/2 passed | 3600 ms runner; 3546 ms test |
| `node --test --test-concurrency=1 tests/v0c-stage1.test.ts tests/v0c-main-review-correction.test.ts tests/v0c-post-audit-correction.test.ts` | Workbench | 0 | 24/24 passed | 19467 ms runner; 19416 ms test |
| `node .runs/v1-a-reaudit/784bd1e.../reaudit-checks.mjs` | audit root | 0 | 50 fixture identities, five digests/IDs, four request-drift counterexamples, two public-error cases, and 16 usage cases passed | about 18 s |

Two earlier invocations of the ignored audit-local checker exited 1 before producing acceptance evidence: the checker initially over-constrained raw `.gitattributes` line endings and then over-constrained its raw checkout/blob identity. Only the ignored checker was corrected to distinguish fixture authority from `.gitattributes` prospective-clean identity; no Candidate file changed.

The complete Workbench regression was not run. Prompt §3 permits it only when the minimum results contradict each other, show a non-local regression, or cannot prove the correction boundary; none of those conditions occurred.

## 5. Audit-local evidence index

Evidence root:

`C:/Users/HUAWEI/.codex/worktrees/4549/project2/.runs/v1-a-reaudit/784bd1ec06c2aa9ed554a7da661bdf582097bcdf/`

- `EVIDENCE_INDEX.md` — artifact map and scope note.
- `independent-checks.json` — F-001 through F-004 independent results and zero-call counts.
- `fixture-identity.json` — per-fixture attributes, CRLF count, worktree/blob/clean identity and V0 parent comparison.
- `source-inventory.json` — corrected Candidate blob inventory, raw/prospective-clean cross-check and digest/Manifest recomputation.
- `command-*.json` — exact executable, arguments, cwd, exit, duration, stdout and stderr for the required commands.
- `evidence-scan.json` — fake-marker and prohibited-call scan result.
- `reaudit-checks.mjs`, `command-runner.mjs` — ignored audit-local reproducers.

## 6. Delta and prohibited-action accounting

**Fact.** Relative to the failed parent Candidate, the frozen correction changes only the authorized `.gitattributes`, V1 Manifest, Pi adapter, fixed Provider seam, V1-A test/evidence writer and reports/prompts. Accepted V0 fixture blob delta is zero.

```yaml
audit_session_tracked_candidate_delta: 0
audit_session_staged_delta: 0
control_state_delta: 0
reference_delta: 0
pi_delta: 0
main_repository_delta_by_reaudit_session:
  - docs/reports/V1_A_FOCUSED_INDEPENDENT_REAUDIT_REPORT.md
audit_local_ignored_artifacts:
  - workbench/node_modules junction
  - .runs/v0-a/pi/node_modules junction
  - .runs/v1-a-reaudit/784bd1ec06c2aa9ed554a7da661bdf582097bcdf/
real_model_calls: 0
external_provider_calls: 0
external_network_calls: 0
credential_reads: 0
pi_core_patches: 0
private_pi_imports: 0
source_repairs: 0
git_commits: 0
dependency_installs: 0
```

`blocking_findings: 0`

## 7. Remaining limits and sole next control action

**Unconfirmed / out of scope.** No real Provider, credential, network, model, V1-B Pilot, Skill-effectiveness, SDK/Extension/Worktree compatibility, V2/V3, or general security-platform claim was tested. This focused pass does not itself accept V1-A.

**Recommendation — sole next control action:** Main Session should review this report as the Gate J focused re-audit result and stop for the user's V1-A acceptance / Implementation Baseline decision. It must not enter V1-B unless V1-A is separately closed and accepted under the Goal Contract.

Work stops here pending Main Session and user review.
