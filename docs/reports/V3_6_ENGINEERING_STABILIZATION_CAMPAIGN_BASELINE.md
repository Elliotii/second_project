# V3.6 Engineering Stabilization Campaign Baseline

```yaml
status: accepted_activated
campaign_id: V3_6_ENGINEERING_STABILIZATION_CAMPAIGN
campaign_kind: bounded_post_closeout_engineering_stabilization
new_version: false
v3_6_reopened: false
version_status: V3_6_remains_closed_accepted
main_owner: current_main_session
test_owner: existing_top_level_session_019ff181-51a8-7381-aae9-b8223e6a8bd3
functional_baseline_commit: 7d63e76c3df357294d480c45e4bad785e8f2fa8a
functional_baseline_tree: df8edd611b1fe819098dbd643222e5535ba53ddb
campaign_control_baseline_commit: e6451c273c1186728a6b6a8f98b02bf1f88b1cc4
fixed_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
primary_mode: natural_workload_first
human_ui_ux_acceptance_in_scope: false
v4_authorized: false
```

## 1. Binding authority

The user accepted the attached Engineering Stabilization Campaign plan on 2026-08-12
as the authoritative task and governance boundary for this Campaign. Its repository-local
text-equivalent copy is:

`docs/第二项目_Codex交接包_2026-07-30/V3_6_ENGINEERING_STABILIZATION_CAMPAIGN_PLAN.md`

The original attachment is
`C:/Users/HUAWEI/Downloads/第二项目_V3.6_工程稳定化长程测试计划.md`, raw SHA-256
`70b9c7c6b4a70c4cb035c1ac42c2a1f4a2ec8bd6c45a924f892937ba5c2e18e0`.
The tracked copy is text-equivalent after line-ending normalization. It is not a new
V3.6 Spec and does not amend accepted V3.6 architecture or claims.

## 2. Verified baseline facts

**Fact:** The authoritative Main worktree was clean at exact commit
`7d63e76c3df357294d480c45e4bad785e8f2fa8a`, tree
`df8edd611b1fe819098dbd643222e5535ba53ddb`, before Campaign control files were added.

**Fact:** V3.6 is `closed_accepted`. The latest accepted maintenance is
`POST_V3_6_FINITE_BUDGET_TERMINALIZATION_MAINTENANCE`, disposition
`PASS_POST_V3_6_FINITE_BUDGET_TERMINALIZATION_MAINTENANCE`.

**Fact:** Fixed Pi is exact commit
`027a5847901b5dde30270abaa1041046cd2b4b55` and clean. Pi Core patch count remains zero.

**Fact:** The daily bounded-edit profile remains:

```yaml
profile_id: v36_daily_bounded_edit_v2
provider_requests_observation_threshold: 16
provider_requests_hard_max: 24
tool_calls_hard_max: 24
combined_tokens_hard_max: 131072
cost_usd_hard_max: 0.20
wall_time_ms_hard_max: 900000
retry_fallback_replacement: 0_0_0
```

**Fact:** The existing Mini RPG registered Source contains 14 ordinary files. Its
sorted `path<TAB>byte-count<TAB>sha256` inventory digest at Campaign activation is
`fe94e4e28ea907df3feb1609a4a4a309b82dd099c8fa8cde40ddfe6a44705f8a`.
The ignored Host profile is
`workbench/config/v36-product.local.json`, SHA-256
`8b25a221c5d9cdbcda81d9d739cc9601d20b45e370ffffc72b068e39ec272c6a`.
It registers only the Docker-backed `test` command, permits managed-copy edits under
`src/**` and `tests/**`, and protects `package.json`, `tsconfig.json` and `README.md`.

**Fact:** Docker Engine responded as `29.6.2 linux` at activation. Port `43136` was not
listening; the Test Session must start a fresh Campaign product process and data root.

## 3. Historical evidence boundary

Round A Attempt 1 and Attempt 2 remain immutable historical Campaign cases. They are not
new Natural Cases and must not be rerun, rewritten, relabeled or used as a reason to
construct a desired failure:

- Attempt 1: natural Provider-request stop under the former 16-request hard profile;
- Attempt 2: post-maintenance Token stop with 19 successful Provider responses, 24 Tool
  results, 142,918 combined tokens, two passing registered Docker commands, non-settled
  Run and unchanged registered Source.

The accepted finite-budget maintenance closes the generic terminalization gap
deterministically. It does not claim Attempt 2 completed and does not authorize Attempt 3.

## 4. Campaign execution contract

The Campaign proceeds one Case at a time:

```text
freeze one natural task and all authorities
→ create a clean Product Session from registered Source
→ dispatch once and observe without intervention
→ freeze raw Evidence
→ read-only Evidence Review
→ record normal completion or classify one or more Findings
→ hand off to Main
→ stop until Main authorizes the next Case or an explicit post-maintenance Retest
```

Normal completion is evidence. Failure is not an instruction to recover. The Test Session
must not retry, replace, continue, modify the product, tune a budget, alter a Case, Apply
changes, or start the next Case while the current Case remains under Main review.

The first newly authorized Case is one Main-frozen Natural Workload under the plan's
10–30 minute, 2–4 files understood and 1–3 files ordinarily changed discipline. It
differs from the historical poison-status task and was not selected to trigger Retry,
Branch, Recovery or a particular budget terminal. Its exact prompt is recorded in the
Test Session authorization.

## 5. Authority and access

The existing Test Session may, for each explicitly authorized Case, start the frozen local
product from this baseline, perform one opaque Credential resolution through the existing
Host resolver, use external network/DeepSeek V4 Flash through Direct public Pi
`AgentHarness`, and consume only the fixed per-Turn daily profile above. It may inspect
local raw Evidence and the safe product view. It has no product-source edit, Git commit,
Pi edit, budget adjustment, Apply, Retry/Fallback/Replacement or architecture authority.

Main owns Campaign state, Finding classification, Maintenance Gate, Retest authorization,
next-Case authorization and Closeout. A bounded maintenance may be autonomous only when
all plan §12.1 conditions hold. Every plan §12.2 Decision Required condition stops the
Campaign and returns to the user.

## 6. Stop and non-goals

This Campaign does not reopen V3.6, enter V4, perform Human UI/UX polish, build a new
Harness capability, benchmark the model, hunt for results, or chase budget caps. Fault
Injection is not preauthorized at activation; Main may consider at most a small targeted
addition only after Natural Workload evidence shows concrete information value and the
accepted plan permits it.

Campaign closure requires the two plan-defined reports, no unresolved Decision Required,
no active maintenance Goal and a reasoned judgment that further Natural Cases have low
information gain. Known boundaries may remain.
