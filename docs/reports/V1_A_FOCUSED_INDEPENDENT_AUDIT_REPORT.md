# V1-A Focused Independent Audit Report

```yaml
goal_id: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
session_role: focused_independent_audit
disposition: REQUEST_BOUNDED_CORRECTION
candidate_commit: e3ff98948b26187b48af61928b56e7cacb550d31
candidate_tree: 89cae1c2c3c091ddc2644fac9a2d28c5b1800e03
candidate_parent_control_baseline: c9f91057db60cf61dab0d3aa305564d498c89cd6
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
blocking_findings: 4
source_repair_performed: false
control_state_modified: false
git_commit_created: false
```

## 1. Disposition

**REQUEST_BOUNDED_CORRECTION**

Fact: the audit started from the exact authorized Candidate commit and tree, and the pinned Pi checkout matched the Contract. The Candidate cannot pass Gate J in a fresh Windows checkout: its frozen V1 fixture bytes are transformed because the relevant paths lack an LF checkout rule, its reported source and fixture digests do not recompute from the frozen Candidate blobs, the B/C harness creates unequal actual Faux model descriptors while comparing only a reduced context projection, and the fixed Provider seam can propagate an injected credential value in a public error. The focused V1-A suite failed 10 of 14 tests; the required targeted V0 regressions and full regression also failed in this checkout.

Inference: these are bounded implementation defects with concrete counterexamples, so correction by the original V1-A Implementation Session is the appropriate control action. This audit did not repair them, accept/close V1-A, or enter V1-B.

## 2. Frozen identity and initial state

| Item | Observed result |
|---|---|
| Audit worktree HEAD | `e3ff98948b26187b48af61928b56e7cacb550d31` |
| Audit worktree tree | `89cae1c2c3c091ddc2644fac9a2d28c5b1800e03` |
| Candidate parent | `c9f91057db60cf61dab0d3aa305564d498c89cd6` |
| Audit tracked/staged state at start | clean; detached at the exact Candidate; no staged paths |
| Main repository HEAD/tree | exact same Candidate commit/tree; read-only identity check passed |
| Pinned Pi HEAD | `027a5847901b5dde30270abaa1041046cd2b4b55` |
| Pinned Pi status | clean |
| Dependency setup | validated `D:/AI/AI_Projects/project2/workbench/node_modules`, then created only an ignored audit-worktree junction at `workbench/node_modules` |
| Other initial main-repo state | pre-existing untracked audit start prompt and `reference/`; neither was modified by this Session |

## 3. Frozen digest and ID cross-check

The audit recomputed the inventory digests from `git show HEAD:<path>` blobs, not from the transformed checkout. The manifest ID was recomputed from the manifest's canonical ID projection.

| Identity | Candidate claim | Recomputed from frozen Candidate | Result |
|---|---|---|---|
| source digest | `7b1d470910fa440aa634d303c153d8f3f2565b740905e79bc4a7f4af04d93246` | `15fd2ba3b80abdc7bb6dcdce81f429353f1237dfe7184c289fd4f7b460115977` | **mismatch** |
| workbench tree digest | `15d037296f4df63f43b554f0791fe9cc083cf6e32dcce138972a08bd274a9477` | same | match |
| fixture tree digest | `ac637c2801d7aa18908a932b21a5b6a912c6a85cb7ac43d14d731d45035f4892` | `0e9976149f0c5db4ffa01a19999c61046283eba5c4c24d6ac8b9b83ef884ce0f` | **mismatch** |
| manifest ID | `cf5c368564a6633b3f225bf12bea8b23d0b7a4877724bcde740915ee22e43f13` | same | match |

Fact: the authoritative inventory disagrees with the frozen manifest blob's raw identity: the claim is 13,684 bytes / `d89af76d2843d07141a373efeaa5e703bf7b8b0b8d8c06eb2b61a49f4e03668a`, whereas the Candidate blob is 13,428 bytes / `9716fa02885c8f9b6f84c5638df5af870bcb4bcb649a4d6b11963296f3bc405a`. The fresh checkout disagrees with frozen Git blobs for 33 V1 fixture files.

## 4. Contract §21 ten-boundary conclusions

| # | Boundary | Conclusion |
|---:|---|---|
| 1 | Public Skill body/wrapper and A/B/C treatment isolation | **Not accepted.** Public Pi `skill()` wrapper behavior and the Candidate's wrapper construction were traced, but the frozen V1 Skill fails its own exact-byte preflight in this checkout. B/C also use unequal model descriptors (F-002). |
| 2 | B/C initial payload byte equality and no hidden policy/experiment identity | **Fail.** The compared `initial_model_payload` omits the request model. B and C have different Faux `api` and `provider` values even though their reduced context projections may match (F-002). No forbidden literal was observed in the reduced context, but that is not proof of complete request equality. |
| 3 | Exact-one Skill source/path/diagnostic/collision boundary | **Not independently completed.** Static exact-one and collision guards are present, but the fresh checkout fails at Skill source identity before the complete boundary suite can execute (F-001). |
| 4 | Windows alias/link/escape guardrails affected by V1 Skill source | **Not independently completed.** The bounded path/link checks were inspected, but their V1 regression execution is blocked by the earlier frozen-byte preflight failure (F-001). No broader Windows security review was performed. |
| 5 | Experiment membership, source identity, immutable/read-only aggregation | **Fail.** Frozen source/fixture digests do not match the accepted claims, and the checkout has 33 fixture byte mismatches. Membership/aggregation tests cannot establish the frozen experiment identity from this Candidate (F-001). |
| 6 | Invalid attribution and denominator integrity | **Evidence insufficient after preflight failure.** Fail-closed policy/matrix branches are present in source, but the relevant tests do not reach those assertions in the fresh Candidate checkout. No separate production counterexample was established. |
| 7 | Hidden Verifier and protected-path boundary | **Evidence insufficient after preflight failure.** Task sources and verifier placement are separate in source, but calibration/execution is stopped by task identity drift. No general sandbox or DLP claim is made. |
| 8 | Provider authority, credential injection, evidence seam | **Fail.** Atomic one-use reservation tests pass, but a fake marker is propagated through a transport error, and invalid/over-budget usage data is accepted by the public evidence projection (F-003, F-004). |
| 9 | C-only intervention, valid failed VerifierResult ordering, no ghost/extra child | **Partially demonstrated only.** The focused controller test passed and the source bounds child creation to one branch, but end-to-end aggregation/ordering cases are blocked by fixture identity drift. No independent extra-child counterexample was found. |
| 10 | Necessary V0 regressions | **Fail as an acceptance gate.** V0-B verifier regression: 0/2 pass; focused V0-C: 5/24 pass; full regression: 56/105 pass. The immediate V0 failures are pre-existing fixture checkout-byte drift rather than a newly attributed V1 control-flow defect, but the Candidate still does not demonstrate the required regressions in a fresh checkout (F-001). |

## 5. Findings

### F-001 — Frozen fixture bytes and reported digests are not reproducible from the Candidate

```yaml
finding_id: F-001
severity: high
contract_boundary: "§21.1, §21.3–§21.7, §21.9–§21.10; frozen source/fixture authority and Windows identity"
file: ".gitattributes; fixtures/skills/v1/reliability-completion/SKILL.md; fixtures/manifests/v1/deterministic-experiment.json; workbench/src/experiment/runtime-v1.ts"
symbol: "Git checkout attributes; FROZEN_SKILL; experiment digest/manifest preflight"
test_or_counterexample: "fresh Candidate checkout with core.autocrlf=true; node --test tests/v1a-deterministic.test.ts; frozen-blob digest recomputation"
observed_result: "V1 fixture paths have no LF rule; Skill blob is 537 bytes but checkout is 543 bytes; focused suite is 4/14; source and fixture digests mismatch; 33 checkout files differ from Candidate blobs"
expected_result: "fresh checkout bytes match the frozen authority; all four accepted identities recompute; focused and required V0 regressions reach and pass their intended assertions"
evidence_path: "C:/Users/HUAWEI/.codex/worktrees/7ae4/project2/.runs/v1-a-audit/e3ff98948b26187b48af61928b56e7cacb550d31/EVIDENCE_INDEX.md#e-01-fresh-checkout-byte-identity"
candidate_impact: "Candidate identity/evidence is not reproducible and Gate J cannot be accepted from the frozen commit"
minimal_correction_owner: original_V1_A_implementation_session
required_regressions: "fresh-worktree frozen-blob/worktree identity check; four digest/ID recomputation; V1-A focused + deterministic; targeted V0-B verifier; focused V0-C; full workbench regression"
```

Fact: `.gitattributes` applies `text eol=lf` only to `/workbench/**` and `/fixtures/tasks/v0-a-parse-duration/**`; V1 Skill/task/verifier/manifest/calibration/strategy fixtures remain subject to `core.autocrlf=true`. The Candidate code expects the Skill blob identity `d41a…0af` / 537 bytes, while the fresh checkout is `7fd3…317` / 543 bytes.

Recommendation: the original implementation Session should make exact-byte fixture checkout semantics explicit, regenerate/rebind only the affected frozen identities and reports from the corrected frozen tree, and prove the listed regressions from a fresh Windows checkout. The accepted V0 verifier fixtures exhibit a related pre-existing checkout problem; Main Session should bound whether the correction adds the minimum attribute coverage required to run the mandated V0 regressions or supplies another reviewed byte-preserving setup. This audit does not authorize evidence rewriting or V0 redesign.

### F-002 — B/C equality excludes unequal actual request-model identity

```yaml
finding_id: F-002
severity: high
contract_boundary: "§21.1–§21.2; same model/provider/version and B/C initial Provider payload byte equality"
file: "workbench/src/pi/pi-adapter-v1.ts; D:/AI/AI_Projects/project2/.upstream/pi/packages/ai/src/providers/faux.ts; D:/AI/AI_Projects/project2/.upstream/pi/packages/agent/src/agent-loop.ts"
symbol: "ModelVisibleProjectionV1; runTreatmentProbeV1; payloadDeltaProofV1; createFauxCore/fauxProvider; runAgentLoop callback requestModel"
test_or_counterexample: "audit-local model-descriptor-counterexample.mjs using the Candidate's public Faux-provider construction pattern"
observed_result: "B and C have different provider strings and distinct generated Faux api values; full {api,provider,id} descriptor equality is false; Candidate captures only systemPrompt/messages/tools"
expected_result: "isolated B/C handles use the identical deterministic provider/api/model descriptor and the equality proof covers the actual request model plus relevant request payload/options"
evidence_path: "C:/Users/HUAWEI/.codex/worktrees/7ae4/project2/.runs/v1-a-audit/e3ff98948b26187b48af61928b56e7cacb550d31/model-descriptor-counterexample.mjs"
candidate_impact: "the central B/C treatment-isolation claim does not prove that runtime control is the sole differing cause"
minimal_correction_owner: original_V1_A_implementation_session
required_regressions: "positive B/C complete-request equality; negative test where api/provider/model differs; existing A/B wrapper-only delta and hidden-identity checks; full V1-A deterministic suite"
```

Fact: `runTreatmentProbeV1` constructs `provider: v1a-faux-${strategyId}-${Date.now()}-${Math.random()}`. Public pinned Pi additionally generates a random Faux `api` when none is supplied and passes `requestModel` as the fourth response callback argument. The Candidate callback ignores that argument. `payloadDeltaProofV1` compares only stable JSON of `{systemPrompt,messages,tools}` and nevertheless returns `actual_payloads: true`.

Recommendation: create isolated Models registries with an identical deterministic Faux API/provider/model descriptor for B and C, capture the public callback's actual `requestModel` and relevant options, and make the proof fail if any request-level identity differs.

### F-003 — Credential value can escape through the Provider seam's public error

```yaml
finding_id: F-003
severity: high
contract_boundary: "§21.8; credential injection and evidence/error secrecy seam"
file: "workbench/src/provider/fixed-provider-v1.ts"
symbol: "OneUseProviderAuthorityV1.requestReserved; createPublicPiCompositionSeamV1"
test_or_counterexample: "audit-local credential-leak-counterexample.mjs with a non-secret fake marker and fake transport"
observed_result: "public handle.prompt rejects with 'transport failed with FAKE_NON_SECRET_MARKER'; marker_leaked=true"
expected_result: "credential-bearing resolver/transport/factory failures are sanitized at the public seam and the value cannot enter errors, logs, evidence, or domain state"
evidence_path: "C:/Users/HUAWEI/.codex/worktrees/7ae4/project2/.runs/v1-a-audit/e3ff98948b26187b48af61928b56e7cacb550d31/credential-leak-counterexample.mjs"
candidate_impact: "a real Provider/transport error could disclose the injected credential, violating an explicit Pause-condition boundary"
minimal_correction_owner: original_V1_A_implementation_session
required_regressions: "fake-marker resolver failure; fake-marker transport failure; factory/public-handle propagation; scans of returned errors, logs, and serialized evidence; existing one-use authority tests"
```

Fact: `requestReserved` passes the resolved string directly to `transport.request` and returns/propagates its result without a sanitizing error boundary. The counterexample is independent of production internals after composition: it observes only the public `handle.prompt` rejection and uses no real secret or network.

### F-004 — Provider evidence projection accepts impossible and over-budget usage

```yaml
finding_id: F-004
severity: medium
contract_boundary: "§21.8; fixed Provider authority/evidence seam and budget envelope"
file: "workbench/src/provider/fixed-provider-v1.ts"
symbol: "FIXED_PROVIDER_ENVELOPE_V1; projectFixedProviderUsageV1"
test_or_counterexample: "audit-local usage-projection-counterexample.mjs"
observed_result: "projection accepts request_count=17 (>16), negative token counts, and cost_usd=1.2 (>0.20), returning credential=[]"
expected_result: "public evidence projection rejects non-finite, negative, non-integral, internally inconsistent, or fixed-envelope-exceeding usage"
evidence_path: "C:/Users/HUAWEI/.codex/worktrees/7ae4/project2/.runs/v1-a-audit/e3ff98948b26187b48af61928b56e7cacb550d31/usage-projection-counterexample.mjs"
candidate_impact: "invalid or over-budget Provider evidence can be represented as apparently sanitized accepted evidence"
minimal_correction_owner: original_V1_A_implementation_session
required_regressions: "negative/non-finite/fractional counters; total-token consistency; request/token/cost envelope overflow; valid boundary values; credential marker absence"
```

Recommendation: validate/derive the evidence at the seam against finite non-negative integer/cost constraints and the fixed envelope; do not treat adding `credential: []` as sufficient evidence validation.

## 6. Verification commands and results

Unless stated otherwise, commands ran in `C:/Users/HUAWEI/.codex/worktrees/7ae4/project2`.

| Command | Working directory | Exit | Key result |
|---|---|---:|---|
| `git rev-parse HEAD; git rev-parse 'HEAD^{tree}'; git rev-parse HEAD^; git status --short; git diff --cached --name-only` | audit root | 0 | exact Candidate/tree/parent; no tracked or staged delta |
| `git -C D:/AI/AI_Projects/project2 rev-parse HEAD; git -C D:/AI/AI_Projects/project2 rev-parse 'HEAD^{tree}'; git -C D:/AI/AI_Projects/project2 status --short` | audit root | 0 | main repo at exact Candidate; pre-existing untracked start prompt and `reference/` |
| `git -C D:/AI/AI_Projects/project2/.upstream/pi rev-parse HEAD; git -C D:/AI/AI_Projects/project2/.upstream/pi status --short` | audit root | 0 | pinned Pi exact and clean |
| `New-Item -ItemType Junction -Path workbench/node_modules -Target D:/AI/AI_Projects/project2/workbench/node_modules` | audit root | 0 | ignored audit-only dependency junction created after target validation |
| `node D:/AI/AI_Projects/project2/.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | `workbench` | 0 | strict TypeScript passed |
| `node --test tests/v1a-deterministic.test.ts` | `workbench` | 1 | 14 total; 4 pass; 10 fail; first failure is Skill source drift |
| `node scripts/run-v1a-deterministic-suite.mjs` | `workbench` | 1 | deterministic suite stopped on task frozen identity drift |
| `node --test tests/v0b-verifier.test.ts` | `workbench` | 1 | 2 total; 0 pass; 2 fail on verifier identity drift |
| `node --test tests/v0c-stage1.test.ts tests/v0c-main-review-correction.test.ts tests/v0c-post-audit-correction.test.ts` | `workbench` | 1 | 24 total; 5 pass; 19 fail, predominantly verifier identity drift |
| `node --test test` | `workbench` | 1 | 105 total; 56 pass; 49 fail |
| `node .runs/v1-a-audit/e3ff98948b26187b48af61928b56e7cacb550d31/recompute-digests.mjs` | audit root | 0 | 2/4 identities match; 33 checkout/blob mismatches |
| `node .runs/v1-a-audit/e3ff98948b26187b48af61928b56e7cacb550d31/model-descriptor-counterexample.mjs` | audit root | 0 | B/C `{api,provider,id}` equality false |
| `node .runs/v1-a-audit/e3ff98948b26187b48af61928b56e7cacb550d31/credential-leak-counterexample.mjs` | audit root | 0 | fake marker leaked in public error |
| `node .runs/v1-a-audit/e3ff98948b26187b48af61928b56e7cacb550d31/usage-projection-counterexample.mjs` | audit root | 0 | invalid/over-budget evidence accepted |

One initial audit-local digest-script invocation exited 1 because the script resolved its repository root one level too shallow. Only the ignored audit script was corrected; no Candidate file changed. The table records the corrected reproducible command and result.

## 7. Audit-local evidence index

Audit evidence is under:

`C:/Users/HUAWEI/.codex/worktrees/7ae4/project2/.runs/v1-a-audit/e3ff98948b26187b48af61928b56e7cacb550d31/`

- `EVIDENCE_INDEX.md` — identities, digest results, test totals, counterexample results, and zero-call counts.
- `recompute-digests.mjs` — frozen-Git-blob digest/ID recomputation.
- `model-descriptor-counterexample.mjs` — actual Faux model descriptor comparison.
- `credential-leak-counterexample.mjs` — public error marker observation.
- `usage-projection-counterexample.mjs` — invalid evidence projection.

## 8. Delta and zero-call accounting

```yaml
candidate_source_delta: 0
candidate_test_delta: 0
candidate_fixture_delta: 0
staged_changes: 0
control_state_delta: 0
reference_delta: 0
pi_delta: 0
main_repo_delta_by_audit_session:
  - docs/reports/V1_A_FOCUSED_INDEPENDENT_AUDIT_REPORT.md
audit_local_ignored_artifacts:
  - workbench/node_modules junction
  - .runs/v1-a-audit/e3ff98948b26187b48af61928b56e7cacb550d31/
real_model_calls: 0
external_provider_calls: 0
external_network_calls: 0
credential_reads: 0
non_secret_fake_resolver_invocations: 1
pi_core_patches: 0
private_pi_imports: 0
source_repairs: 0
git_commits: 0
dependency_installs: 0
```

## 9. Unverified items and exclusions

Evidence-insufficient within scope:

- The exact-one/alias/collision, denominator/attribution, hidden-verifier calibration, and end-to-end C ordering/lineage assertions could not all execute past the fresh-checkout frozen-identity gate. Static inspection is not substituted for a passing behavioral proof.
- Required V0 regressions did not pass in this fresh checkout. Their immediate failures are fixture byte-identity failures, so this audit does not attribute unrelated V0 control-flow regressions to V1-A.
- No real Provider behavior, real credential injection, or real model behavior was tested; all Provider counterexamples used non-secret fakes as authorized.

Explicitly out of scope and not audited: general Pi/V0 review, broad Windows security, OS sandbox/DLP/durability, SDK/RPC/Extension/worktree research, Skill effectiveness/statistics, V1-B Pilot, V2/V3, and general platform features.

## 10. Recommended next control action

Recommendation: Main Session should return F-001 through F-004 as a single bounded correction package to the original V1-A Implementation Session. Freeze no new Candidate until that Session supplies: (1) reproducible exact-byte fixture and digest authority from a fresh Windows checkout, (2) complete B/C request-model equality with a negative descriptor-difference regression, (3) credential-safe public error handling, (4) fail-closed Provider usage evidence validation, and (5) all listed V1-A and necessary V0 regressions. Then perform a focused re-audit only of these findings and their required regressions unless new concrete evidence justifies wider scope.

This report does not accept or close V1-A. Work stops here pending Main Session and user review.
