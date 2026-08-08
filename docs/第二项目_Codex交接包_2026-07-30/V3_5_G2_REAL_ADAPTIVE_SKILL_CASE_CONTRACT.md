# V3.5 Goal 2 — One Bounded Real Adaptive Skill Case Contract

```yaml
status: accepted_activated_implementation_not_started
date: 2026-08-08
accepted_by_user: 2026-08-08
formalized_by_main_session: 2026-08-08
goal_id: V3_5_G2_REAL_ADAPTIVE_SKILL_CLOSURE
charter: docs/第二项目_Codex交接包_2026-07-30/V3_5_CHARTER.md
precondition: V3_5_G1_closed_accepted
active_goal: true
contract_accepted: true
goal_activation_authorized: true
implementation_authorized: true
implementation_owner: future_top_level_goal_2_session_created_after_control_baseline
credential_reads_authorized: 2_after_zero_access_preflight
external_network_authorized: true_after_zero_access_preflight
real_model_calls_authorized: 32_after_zero_access_preflight
real_cost_usd_authorized: 0.40_whole_pair_hard_cap
git_commit_authorized: bounded_implementation_and_main_closeout
goal_3_authorized: false
v3_5_final_acceptance_authorized: false
```

## 1. Goal question

> Can one accepted historical adaptive Skill be explicitly selected in an isolated,
> case-owned State authority and evaluated on one pre-frozen related held-out task through
> the real Direct Pi/model path with fair, persistent and inspectable evidence?

A Skill win is not required. Completion requires one valid frozen Base/Candidate pair and
truthful persistence of the observed result.

## 2. Frozen historical Skill candidate

The frozen Candidate treatment is the accepted V3 historical State version below:

```yaml
source_state_root: D:/AI/AI_Projects/project2/.runs/v3-g3/shared-authority/sequence-489cb1c4-20d9-42af-8dd6-0b22aeb6cf5d/project-state
state_version: 2
state_digest: 0f6c5d44c815a0d1b267d7fdf2e0c01f50eb640d06da72fe9ff8fab343249927
state_status: accepted_historical_not_global_active
skill_name: adaptive-inefficient-success
skill_source_sha256: 152d00670b47b598cd54e4ba74a8eea580b16869e108b9027ebd3aee96f740c3
skill_wrapper_sha256: 329cca959c9f293d6d8e2dd56a89df14e21e069fd517633e405eb9893b675928
task_kinds: [typescript-maintenance]
failure_families: [prior-pass]
```

Skill body:

> Inspect the task and preserve protected files. Run the frozen check after the edit. If
> it fails, use only its bounded public output for one focused correction, then run the
> same check again.

**Leakage decision:** PASS. The Skill contains a reusable procedure only. It does
not mention the Goal 2 task ID, function, source file contents, expected output or patch.

The Goal 2 Session must copy/derive an isolated case-owned State authority and select this
exact accepted version through existing State inspection/binding APIs. It must not modify
the closed V3 State root or its global active pointer.

## 3. Frozen held-out Case

```yaml
task_id: v35-stable-unique
project_id: v35-g2-adaptive-skill-project
case_id: v35-g2-stable-unique-case-01
task_source: project_authored_synthetic_held_out_fixture
task_kind: typescript-maintenance
binding_failure_family: prior-pass
failure_lineage_source_run_id: v35-g2-stable-unique-reference-calibration
failure_lineage_digest: 3af4e1e3d58ec2e9927d71bd3f39ad88cc09d22e37ce5f0049ae46fe080aac40
workspace_tree_digest: 4a45c560541f561143fc17302576970c521febc4ae81f2f384be2708faa89922
instruction_sha256: 96b1bf32248b220af6fc44021e57c314dbb57d32d37ae45505ca2ac1c9954c62
verifier_id: v35-stable-unique-verifier
verifier_sha256: 470e9a49f27ebf3a14bd8d104f4e0a4a0e62a018e649352e56bfc418fa2a2fef
reference_patch_sha256: 083640cc7a47940ba184f7f031379531602f7d9924a8a8c018a8b534cce2d8c4
writable_paths: [src/subject.ts]
protected_paths: [package.json, test/public.test.mjs]
public_check: node --test test/public.test.mjs
tool_profile_id: v3g3_bounded_local
tool_profile_digest: f5bae96962e5f920df282b3255bdea49b847bd5b3570aaed923770d4d2227859
budget_profile_id: v3g3-fixed-one-run-v1
budget_profile_digest: 6b20b55e7930b193b7975c15668bba883961c9d3976e9d200b45cfd69d96be21
provider_profile_digest: 6b90b83a047ce7745fc92a6f1ef99dd7f7ea6e046a5107e060f4b041e864cf32
case_authority_digest: 43c2b1c2967826e61b236d3546f693a93424a127e25a5da9f4a0180617848fff
acceptance_visibility: hidden_external
```

`prior-pass` means the project-owned fixture and external Verifier must first pass a
zero-model reference calibration before either real arm. It does not predict either arm's
outcome and does not permit the reference patch to enter either arm's Workspace or model
context.

The exact frozen initial Workspace inventory is:

| Path | Bytes | SHA-256 |
|---|---:|---|
| `package.json` | 87 | `7852a78b1be7f60e901da63681809950e0fa579aa52517b811a1f6baeea25013` |
| `src/subject.ts` | 97 | `2a95f2cc6bd25c22198f40c20fbfd1b204afc45f7120831f250b69dbcd292e86` |
| `test/public.test.mjs` | 252 | `46ee2aba0b4da27c8d4c22dab3b38b8d3da28e1b9731971a0b193f3050e2665b` |

Canonical frozen bytes:

`package.json`

```json
{"private":true,"type":"module","scripts":{"test":"node --test test/public.test.mjs"}}
```

`src/subject.ts`

```ts
export function stableUnique(values: string[]): string[] { return [...new Set(values)].sort(); }
```

`test/public.test.mjs`

```js
import assert from "node:assert/strict";
import test from "node:test";
import { stableUnique } from "../src/subject.ts";
test("preserves first occurrence order", () => { assert.deepEqual(stableUnique(["beta", "alpha", "beta"]), ["beta", "alpha"]); });
```

Task prompt:

```text
Repair `src/subject.ts` so `stableUnique` returns each distinct string exactly once while preserving the order of first occurrence without mutating the input array. Preserve the export and run the declared public check.
```

Frozen hidden external Verifier source (UTF-8, LF, one trailing newline):

```js
import { pathToFileURL } from "node:url"; import { resolve } from "node:path";
const id="v35-stable-unique-verifier"; try { const {stableUnique}=await import(pathToFileURL(resolve(process.env.V35_WORKSPACE,"src/subject.ts"))); const input=["beta","alpha","beta","Alpha"," alpha ","alpha","beta"]; const before=JSON.stringify(input); const passed=JSON.stringify(stableUnique(input))===JSON.stringify(["beta","alpha","Alpha"," alpha "])&&JSON.stringify(input)===before&&JSON.stringify(stableUnique([]))==="[]"; console.log(JSON.stringify({schema_version:1,verifier_id:id,status:passed?"passed":"failed",summary:passed?"behavior accepted":"stable uniqueness contract failed",...(passed?{}:{failed_checks:["stable_unique_behavior"]})})); process.exitCode=passed?0:1; } catch { console.log(JSON.stringify({schema_version:1,verifier_id:id,status:"failed",summary:"stable uniqueness verifier exception",failed_checks:["stable_unique_exception"]})); process.exitCode=1; }
```

The hidden external Verifier may test only behavior implied by that prompt: stable first
occurrence order, exact string identity, duplicate removal, empty input and input
non-mutation. It must not require an unstated algorithm or implementation form. This
Contract freezes the exact source and digest above. They may not be replaced after
Contract acceptance.

The calibration-only reference bytes are:

```ts
export function stableUnique(values: string[]): string[] { return [...new Set(values)]; }
```

They must remain outside both Agent Workspaces and outside the model-visible Tool scope.
They prove deterministic solvability only and are not execution input.

## 4. Fairness and treatment boundary

Exactly two arms are frozen, in fixed order:

```text
Base
= fresh persistent Pi Session
+ immutable base System Prompt
+ task prompt
+ no adaptive Skill

Candidate
= fresh persistent Pi Session
+ same immutable base System Prompt
+ same task prompt
+ explicit public harness.skill("adaptive-inefficient-success", taskPrompt)
```

Frozen identities:

```yaml
base_session_id: v35-g2-stable-unique-base-session-01
base_run_id: v35-g2-stable-unique-base-run-01
candidate_session_id: v35-g2-stable-unique-candidate-session-01
candidate_run_id: v35-g2-stable-unique-candidate-run-01
comparison_id: v35-g2-stable-unique-comparison-01
```

Both arms must use:

- byte-identical initial Workspace trees;
- the same pinned Pi, Direct public `AgentHarness`, provider/model, thinking level, Tools,
  command allowlist, budgets, stop semantics and external Verifier;
- fresh persistent Sessions and distinct immutable Run IDs;
- the same frozen fixture, Case Authority and evidence schema.

The only treatment delta is the explicit adaptive Skill binding and the resulting Skill
wrapper presented through Pi's public Skill route. Payload identity outside that declared
delta must be inspected and recorded; equal outcomes are neither required nor expected.

## 5. Frozen real profile and budgets

```yaml
provider: deepseek
model: deepseek-v4-flash
provider_profile_digest: 6b90b83a047ce7745fc92a6f1ef99dd7f7ea6e046a5107e060f4b041e864cf32
thinking_level: off
base_system_prompt_id: project_minimal_base_v1
base_system_prompt_sha256: 317f5fd3d0d2a144b71c2adde124b254c5bc61a704fd89f831738e3ecc752edf
tool_profile_id: v3g3_bounded_local
budget_profile_id: v3g3-fixed-one-run-v1
budget_profile_digest: 6b20b55e7930b193b7975c15668bba883961c9d3976e9d200b45cfd69d96be21
credential_profile: existing_opaque_local_DeepSeek_credential
stream_retries: 0
per_arm:
  provider_requests_max: 16
  tokens_max: 131072
  tool_calls_max: 24
  external_verifier_runs_exact: 1
  wall_time_ms_max: 900000
  real_cost_usd_max: 0.20
whole_pair:
  arms_exact: 2
  credential_reads_max: 2
  real_provider_model_calls_max: 32
  real_cost_usd_max: 0.40
retry: 0
fallback: 0
replacement_case: 0
extra_arm: 0
```

Only `read_file`, `write_file` for `src/subject.ts`, and the frozen `public_test` command
are allowed. The Agent cannot read or modify the hidden Verifier, Case Authority,
reference calibration, evidence root, control files, credentials or Pi.

These budgets are frozen and authorized only after the zero-access implementation,
reference calibration and Main execution-baseline checks pass. No authority permits a
retry, replacement, fallback, extra arm or edited Case after real dispatch.

## 6. Minimal execution flow

One new top-level Goal 2 Session should own this Goal after separate authorization:

```text
read accepted Contract and baseline
→ materialize/verify exact fixture and hidden Verifier with zero real access
→ implement only the thin persistent real-Run + Goal 2 comparison adapter
→ strict TypeScript + focused deterministic tests + reference calibration
→ create one clean bounded implementation commit
→ freeze Case Authority, source digests, Sessions and arm identities
→ opaque credential read only after all preflight checks pass
→ run Base once
→ run Candidate once
→ run the same external Verifier once per arm
→ persist Sessions, Runs, comparison and binding evidence
→ inspect and report
→ stop for Main review
```

Ordinary pre-dispatch TypeScript/path/fixture defects may be fixed in that Session while
all real-access counters remain zero. Once the first real Provider request occurs, source,
fixture, Verifier, Case Authority, budgets and evidence schema are frozen: no edit, retry,
replacement or additional arm is allowed.

No Independent Audit, R1/R2 or extra Stage is expected. A fresh audit is considered only
if Main later finds a concrete high-risk authority, secret, budget, lineage or evidence
integrity defect.

## 7. Comparison and accepted result labels

Correctness is primary:

- `positive_skill_effect`: Candidate passes and Base does not;
- `negative_skill_effect`: Base passes and Candidate does not;
- `both_passed`: both pass;
- `both_failed`: both produce valid failing outcomes;
- `invalid_pair`: fairness, evidence, identity, budget or Verifier validity fails.

For `both_passed`, efficiency is descriptive only. Record Provider requests, Tool calls,
tokens, cost, elapsed time and allowed semantic diff size. One arm may be called
`efficiency_dominant` only if it is no worse on every frozen efficiency dimension and
strictly better on at least one. Otherwise report `mixed_or_no_material_difference`.

No result may be generalized beyond this one fixed task/pair. Goal completion is valid
evidence, not a Skill victory.

## 8. Exit Criteria

1. The final Case Contract is accepted and all exact fixture/Verifier/Skill/profile/budget
   identities are frozen before real access.
2. Leakage and applicability checks pass; the closed V3 State root/global pointer are
   byte-unchanged.
3. Base and Candidate start from byte-identical Workspaces and fresh persistent Sessions;
   the only treatment delta is the declared Skill binding.
4. Each arm executes exactly once through the real Direct Pi/model path and respects the
   frozen budgets and stop semantics.
5. The same external Verifier produces one valid result per arm.
6. Session, Run, Tool, Verifier, Outcome, comparison, Case Authority and State-binding
   evidence are persisted and inspectable through the Goal 1 Read Model boundary.
7. The observed result is accepted without Case hunting, replacement or tuning after
   outcomes.
8. Pi, V3 global State/authority and accepted V0–V3 facts remain unchanged.

## 9. Hard stops

- exact historical Skill or V3 State identity cannot be validated without changing V3;
- the task requires answer leakage, an extra treatment path or a new Eval Runtime;
- Base/Candidate identity cannot be made fair or persistently inspectable;
- hidden Verifier behavior exceeds the frozen prompt contract;
- real dispatch begins before the implementation commit and Case Authority are frozen;
- credential, budget, unknown usage, source identity, Session lineage or evidence integrity
  cannot fail closed;
- Pi patch/private import or Extension/SDK/RPC route switch becomes necessary.

## 10. Activated authority and remaining boundary

```yaml
activated_authority:
  activation_and_control_baseline: authorized
  bounded_implementation_commit: authorized
  bounded_main_review_and_pre_dispatch_correction: authorized
  opaque_credential_network_and_real_pair: authorized_after_zero_access_preflight
  goal_2_closeout_commit: authorized_if_exit_criteria_pass
remaining_boundary:
  goal_3: not_authorized
  v3_5_final_acceptance: not_authorized
  pi_patch_or_runtime_route_switch: not_authorized
  retry_fallback_replacement_extra_arm_or_case: not_authorized
```

This Contract is accepted and activated. Real access remains mechanically gated behind
the zero-access implementation/preflight and frozen execution baseline. Goal 3 and final
V3.5 acceptance remain outside this authority.
