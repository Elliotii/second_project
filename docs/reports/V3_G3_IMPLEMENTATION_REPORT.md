# V3 Goal 3 Implementation Report - Selective Reuse and Portfolio Closure Substrate

```yaml
date: 2026-08-08
goal_id: V3_G3_SELECTIVE_REUSE_AND_PORTFOLIO_CLOSURE
session_role: dedicated_top_level_goal_3_implementation_session
status: hit_specific_residual_complete_pending_main_rereview
recommended_disposition: PASS_V3_G3_ZERO_CALL_SELECTIVE_REUSE_SUBSTRATE_PENDING_MAIN_REVIEW
control_baseline_commit: 67d49438ddec1bf71ce252b45e2a9ae98078a452
control_baseline_tree: 60cb0b9925b2cded3a31e6a02d1c01a0bc05a622
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pinned_pi_package: "@earendil-works/pi-agent-core@0.82.1"
credential_reads: 0
external_network_requests: 0
external_provider_calls: 0
real_model_calls: 0
pi_core_patches: 0
private_pi_imports: 0
sdk_extension_rpc_switches: 0
git_stage_or_commit: 0
real_behavioral_execution: false
```

## 1. Outcome and claim boundary

**Fact:** The zero-call Goal 3 substrate now implements the complete bounded route:
immutable Goal 1 Candidate -> independently inspected host admission -> unchanged
Goal 2 validation/decision/version/pointer lifecycle -> persistent active State ->
independently authorized and frozen Run binding -> distinct public Direct Pi
prompt-addendum or adaptive-Skill execution -> Manifest/Verifier/Inspector lineage.

**Fact:** The three Main findings were corrected together without changing Pi,
Goal 1/2 accepted behavior, State kinds, behavioral Case count, or authority-plane
semantics:

1. `G3-MAIN-001`: the frozen source contains both the deterministic Faux port and
   a one-use fixed `deepseek/deepseek-v4-flash` port built from the accepted
   provider profile and one-Run authority seam. Its composition test performs no
   credential resolution or dispatch.
2. `G3-MAIN-002`: a content-identified write-once `Goal3CaseAuthorityV3` is frozen
   before binding. Binding, Run creation, and Inspector independently reopen it.
3. `G3-MAIN-003`: a write-once admission registry freezes the exact admission and
   tracked source fixture identities. Binding and Inspector independently derive
   whether a promotion requires admission and call the single admission inspector
   against the promotion decision's `prior_active` identity.

**Fact:** The hit-specific G3-MAIN-001 residual is also closed. Inspector now
independently rejects a completed `deepseek_real` claim unless it has exactly one
Credential read, at least one and no more than the frozen maximum Provider
requests, one Provider/network/external/model dispatch per request, and token,
cost, and Tool counts within the frozen Goal 3 budget profile. This validation is
independent of runtime-writer success.

**Fact:** All executed Agent paths remained local Faux. No real behavior is claimed.

**Inference:** The implementation is ready for finite Main re-review and an
implementation baseline. It does not itself accept Goal 3 or V3 and does not
authorize later real execution.

## 2. Gate A and preserved identities

| Check | Result |
|---|---|
| Repository | exact HEAD `67d49438ddec1bf71ce252b45e2a9ae98078a452`; exact tree `60cb0b9925b2cded3a31e6a02d1c01a0bc05a622` |
| Baseline control | committed `active_goal` is `V3_G3_SELECTIVE_REUSE_AND_PORTFOLIO_CLOSURE` |
| Pi checkouts | both clean at `027a5847901b5dde30270abaa1041046cd2b4b55`, package `0.82.1` |
| Goal 1 Candidate file | `8b161311386364234fa19a0d648f2dedd801dcb3eaa87e3f8be9d2ff9aacbb44` |
| Goal 1 staged State file | `25c2c0e3f43f2e9984e70e184a4d59206f4f96dc23685a94fb4a1402c467a676` |
| Candidate / State content IDs | `48ee92898bdb1eeedfc33956a67725f030bae04d042238af147c30348379c7f4` / `efbaf666637726231d3c3765a23bf579ebb6f2698dd6e8332904e0db938953d9` |
| Public Pi boundary | `AgentHarness`, `loadSkills`, `formatSkillInvocation`, and `NodeExecutionEnv` import/type smoke passed |
| Authority counters | Credential/network/Provider/model `0/0/0/0` |

The previously disclosed Gate A sequencing defect remains non-material: the
sanitized fixture/admission patch preceded creation of the ignored emitted loader,
but public runtime/type smoke passed before compile or focused product execution.

## 3. Admission checkpoint and registry authority

The original Candidate and preserved evidence were not changed. Admission derives
only the current expected-active identity and resulting content identities:

```yaml
source_candidate_digest: 48ee92898bdb1eeedfc33956a67725f030bae04d042238af147c30348379c7f4
source_staged_state_digest: efbaf666637726231d3c3765a23bf579ebb6f2698dd6e8332904e0db938953d9
source_accepted_base_sentinel: 0c667c4b193b4de106107e5dd47782b634920c172a80ba6233509239c9184eb8
target_initial_active_digest: a56e2f2327e40af17c226ec1df91a8bebff03377b26fbb8bfbd095f03cc7fc1f
admitted_candidate_digest: a9904eb4de1947bb6313d290646f3897d74d1b6bae23a748373b7cea226b1e51
admitted_staged_state_digest: 0a4e54610b3d969d06c595f7ea1a3b617587360131f630ed9cbb8f8efa5c74e4
admission_digest: e84521e199b503ff18e240ff87c715aeab02f2089a0d62e83e04182ee0fc41ef
```

The registry stores the exact Admission as an ordinary write-once file and binds
its digest/file hash to the exact tracked Goal 1 Candidate/State fixture hashes.
For each promotion, inspection derives the admitted identity from the immutable
source fixtures and the decision's `prior_active`. A matching admitted Candidate
must have the exact registered Admission; a deterministic Candidate that does not
derive from this admission legitimately records `admission_digest: null`.

Focused Inspector evidence rejects omitted, arbitrary, swapped, stale, and
coherently rehashed admission lineage. Goal 2 stale apply protection is unchanged.

## 4. Independent Case Authority and frozen binding

`Goal3CaseAuthorityV3` contains only the required host authority:

- exact project, task, Case, and task-kind identity;
- exact allowed prior failure lineage or `null`;
- task-prompt and Verifier source digests;
- fixed Tool and budget profile identities;
- either the fixed Faux profile or the fixed DeepSeek profile.

The artifact is frozen before a binding context is constructed. Binding accepts
only the context deterministically derived from that independently loaded artifact
and records its authority digest. Run creation and Inspector independently reload
and validate the same authority file. A coherently rehashed context, binding,
runtime, and Manifest still fails when the frozen authority does not authorize the
changed task kind.

Applicability remains exact and deterministic: dimensions are ANDed, values within
a dimension are ORed, failure family requires the frozen prior lineage, prompt
entries sort by `entry_id`, no match is explicit empty binding, and multiple
adaptive Skills fail closed. There is no ranking, similarity, Router, or fallback.

The historical Inspector reopens the exact version and promotion decision named by
the binding. Later pointer changes do not replace or invalidate that frozen Run.

## 5. Direct Pi execution ports and evidence counters

Both ports use public emitted Direct Pi `AgentHarness` and the same frozen binding:

- `prompt_addendum`: frozen composed system prompt, then `harness.prompt(task)`;
- `adaptive_skill`: one public-loaded accepted Skill in `resources.skills`, then
  `harness.skill(skill.name, task)`.

The deterministic port uses the existing Faux provider. The real-capable port uses
the accepted fixed DeepSeek profile, public `deepseekProvider`, in-memory credential
store, one-Run provider authority, no retry/fallback, and the accepted fixed budget
envelope with pre-dispatch Provider reservations and pre-Tool-call cap enforcement.
Composition opens no credential and performs no dispatch; only execution can
resolve the injected credential lease.

Runtime evidence and Manifest now carry and mutually cross-check provider kind,
provider ID, model ID, profile digest, dispatch attempts, Provider dispatches,
credential reads, network/external/model calls, Provider requests, input/output
tokens, and cost. Inspector also cross-checks the fixed Tool profile, Case authority,
binding, prompt/Skill identities, and raw external Verifier result.

The existing Inspector test constructs a coherent synthetic DeepSeek control
projection without dispatching it, then proves that fully rehashed runtime and
Manifest projections fail for zero/incorrect real-access counters and for combined
Provider-request, token, cost, and Tool over-cap accounting. These are focused
negative assertions, not a fifth behavioral Case or real execution evidence.

The zero-call pre-dispatch test freezes a DeepSeek Case Authority, composes the real
port with an injected resolver, closes it, and proves resolver calls and all four
real-access counters remain zero.

## 6. Exactly four behavioral/regression Cases

| Case | Trigger / State | Deterministic result |
|---|---|---|
| 1 | `hard_failure` / real Goal 1 `prompt_addendum` | admitted, promoted, reopened in an independent Run, relevant `typescript-maintenance + verifier-failure` binding with exact admission lineage |
| 2 | `inefficient_success` / deterministic `adaptive_skill` | both passed with frozen prior-pass regression and material structural improvement; public Skill path bound; admission lineage correctly `null` |
| 3 | `structural_trajectory_pathology` / prompt Candidate | no improvement; Reject; active pointer bytes unchanged |
| 4 | unrelated task and rollback | explicit empty binding; rollback created a decision/revision and retained history; subsequent Run froze the prior accepted prompt version |

The correction added mechanism/negative assertions only; it did not add a fifth
behavioral Case.

The final authoritative deterministic sequence is:

`D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/sequence-489cb1c4-20d9-42af-8dd6-0b22aeb6cf5d/`

Its project State root ends at binding revision 3, State version 1, State digest
`744ccd9ddce76f92b0b838f02253161748b9edb1e9071c8218bdf97f96ba2a7d`.

## 7. Exact tracked Source Delta

| Path | Purpose |
|---|---|
| `fixtures/v3/goal1-real-candidate.json` | sanitized immutable real Candidate |
| `fixtures/v3/goal1-real-staged-state.json` | sanitized immutable staged State |
| `fixtures/v3/goal1-real-provenance.json` | source hashes and sanitization provenance |
| `workbench/package.json` | focused Goal 3 test script |
| `workbench/src/contracts/v3g3-types.ts` | admission registry, Case authority, binding, runtime, and Manifest contracts |
| `workbench/src/refinement/admission-v3.ts` | admission derivation/inspection and persistent registry |
| `workbench/src/state/case-authority-v3.ts` | write-once independent Case authority |
| `workbench/src/state/binding-v3.ts` | authority-bound applicability and historical recomputation |
| `workbench/src/pi/runtime-profile-v3.ts` | fixed Faux/DeepSeek, Tool, and budget profile identities |
| `workbench/src/pi/pi-adapter-v3.ts` | public Direct Pi Faux and real-capable execution ports |
| `workbench/src/run-v3.ts` | authority-checked execution, Verifier, and Manifest writer |
| `workbench/src/inspect-v3.ts` | independent binding/runtime/Verifier inspection |
| `workbench/tests/v3g3-admission.test.ts` | admission checkpoint |
| `workbench/tests/v3g3-selective-reuse.test.ts` | four Cases plus correction mechanism/tamper tests |
| `docs/reports/V3_G3_IMPLEMENTATION_REPORT.md` | this report |
| `docs/reports/V3_G3_CLOSEOUT_DRAFT.md` | non-accepting closeout draft |

No Goal 1/2 lifecycle source was modified. Protected control/governance files,
accepted reports, base prompt, accepted Skill, V0-V2 source/tests, Pi, and references
remain unchanged.

## 8. Verification commands and results

| Command | Exit / result |
|---|---|
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p .runs/v3-g3/runtime/tsconfig.workbench.json` from project root | 0; strict Workbench TypeScript |
| `npm run v3g3:test` from `workbench/` | 0; 8 passed, 0 failed, 0 skipped, including four behavioral subtests |
| `node --experimental-loader ../.runs/v3-g3/runtime/public-pi-loader.mjs --test tests/v3g1-evidence-to-candidate.test.ts` | 0; 13 passed, 0 failed, 0 skipped |
| `node --experimental-loader ../.runs/v3-g3/runtime/public-pi-loader.mjs --test tests/v3g2-validate-promote-reject-rollback.test.ts` | 0; 6 passed, 0 failed, 0 skipped |
| `node --experimental-loader ./.runs/v3-g3/runtime/public-pi-loader.mjs ./.runs/v3-g3/runtime/public-import-smoke.mjs` | 0; `PASS_V3_G3_PUBLIC_PI_IMPORT_SMOKE` |
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p .runs/v3-g3/runtime/tsconfig.json` | 0; standalone public strict type smoke |
| final `git diff --check` | 0 |

Two command-routing defects were ordinary and repaired without source semantics:

1. A strict-TypeScript command was once launched from `workbench/` with the
   project-root-relative tsconfig path and emitted `TS5058`; the exact command from
   project root then passed.
2. The historical `v3g1:test`/`v3g2:test` package scripts refer to ignored loaders
   absent in this worktree. Both tests were rerun with the verified Goal 3 public
   emitted loader and passed 13/13 and 6/6.
3. The first new Tool-policy preflight compared a structural `TaskSpec` object,
   including fields outside `BoundedTaskPolicy`, with the projected policy. It
   failed closed before Agent dispatch. The check now compares explicit policy
   projections and binds writable/protected paths and command descriptors into the
   Tool-profile digest; the focused suite then passed.

Earlier ordinary implementation repairs (admission-directory creation, verifier
newline fixture, one import typo, and raw Verifier prefix parsing) remain disclosed.
None caused Credential/network/Provider/model access.

## 9. Ignored evidence and shared authority

`.runs/v3-g3/evidence/` contains:

- `gate-a.json`;
- `authority-counters.json`;
- `shared-state-inventory.json`;
- `evidence-index.json`.

The final Evidence Index binds the latest sequence ordinary-file inventory, State
inventory, exact tracked Source Delta, Gate A identities, and authority counters.
The operational root is outside every Agent Tool workspace. It remains an ignored,
single-writer ordinary-file prototype.

```yaml
source_delta_files: 16
sequence_ordinary_files: 161
shared_state_inventory_digest: 938a45f932f5276c1a21c94c2c004832e418db653abdc426d44dafecfddb3611
```

## 10. Remaining limitations and frozen later inputs

- No real behavioral execution was authorized or attempted; Goal 3/V3 final
  acceptance remains unavailable from this evidence.
- Real benefit of the admitted prompt addendum remains unverified.
- The adaptive Skill is only the soft second real closure.
- Persistence is not database, locking, or crash-transaction evidence.
- Real execution still requires a fresh no-source-edit Session and separately
  frozen authorization/cost inputs.

Proposed later inputs:

```yaml
execution_session: fresh_no_source_edit
implementation_baseline: resulting_Main_accepted_Goal_3_commit
state_authority: exact_frozen_shared_State_root_read_only_in_place
state_root: D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/sequence-489cb1c4-20d9-42af-8dd6-0b22aeb6cf5d/project-state
copy_or_relocation_of_state_root: forbidden
reason: adaptive_Skill_public_wrapper_identity_is_path_sensitive
first_path: prompt_addendum
candidate_lineage: admission_e84521e199b503ff18e240ff87c715aeab02f2089a0d62e83e04182ee0fc41ef
task_kind: typescript-maintenance
trusted_failure_family: verifier-failure
provider_profile: fixed_deepseek_deepseek-v4-flash
case_authority: freeze_before_binding_and_authorization
credential_network_provider_model_authority: separate_explicit_authorization_required
attempt_usage_cost_caps: freeze_before_dispatch
source_or_State_mutation: forbidden
adaptive_skill_second_closure: soft_target_only_after_first_path_review
```

## 11. CURRENT_STATE_UPDATE_PROPOSAL

This Session did not edit `CURRENT_STATE.md`.

```yaml
active_goal: V3_G3_SELECTIVE_REUSE_AND_PORTFOLIO_CLOSURE
goal_3_implementation_status: hit_specific_residual_complete_pending_main_rereview
goal_3_recommended_disposition: PASS_V3_G3_ZERO_CALL_SELECTIVE_REUSE_SUBSTRATE_PENDING_MAIN_REVIEW
goal_3_control_baseline_commit: 67d49438ddec1bf71ce252b45e2a9ae98078a452
goal_3_control_baseline_tree: 60cb0b9925b2cded3a31e6a02d1c01a0bc05a622
goal_3_focused_tests: 8_passed_0_failed_0_skipped
goal_3_behavioral_cases: 4_passed_0_failed
goal_1_regression: 13_passed_0_failed_0_skipped
goal_2_regression: 6_passed_0_failed_0_skipped
credential_reads_observed: 0
external_network_requests_observed: 0
external_provider_calls_observed: 0
real_model_calls_observed: 0
pi_core_patches: 0
private_pi_imports: 0
sdk_extension_rpc_switches: 0
git_staged_or_committed: false
real_behavioral_closure: not_authorized_not_executed
remaining_gate: main_rereview_and_frozen_implementation_baseline_before_any_real_execution
```

Final Session recommendation:

`PASS_V3_G3_ZERO_CALL_SELECTIVE_REUSE_SUBSTRATE_PENDING_MAIN_REVIEW`
