# Post-V3.6 Budget Adequacy Maintenance Closeout

```yaml
status: closed_accepted
date: 2026-08-12
goal_id: POST_V3_6_BUDGET_ADEQUACY_MAINTENANCE
disposition: PASS_POST_V3_6_BUDGET_ADEQUACY_MAINTENANCE
version_status: V3_6_remains_closed_accepted
control_baseline_commit: 248b134d4ed1985df27143d97ed4d9260530e923
control_baseline_tree: 78f275b59863db26ce86bd234a65aad1573e8f02
implementation_commit: 1150e61630b578095da681b6506deff2a291063a
implementation_tree: e9ea4fcaa522bf7cccfb5fdf319aa1618e9c22b2
closeout_commit: resulting_HEAD_of_this_revision
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_task_retries: 0
registered_user_source_apply: 0
pi_core_patches: 0
active_goal: null
```

## 1. Decision

The fixed 16-request hard stop was too tight for the daily V3.6 `bounded_edit` medium-task
profile. It remains correct for the historically accepted frozen Goal 2 Journey, whose
task, evidence and budget are not rewritten.

The daily profile is now:

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

Only the daily Provider-request hard maximum changed. The other hard limits remain
unchanged and independently finite. Sixteen is descriptive observation, not permission
for an automatic retry or continuation.

## 2. Evidence basis

The accepted V3.6 Journey used 11 Provider requests across two smaller Turns. The later
Mini RPG UX Turn instead reached 16 responses and 22 Tool calls while following a normal
test-and-correct trajectory: request 14 ran tests, 15 read the one remaining failure and
16 edited the correction. Attempt 17 was refused before dispatch. Usage was 7,621 ordinary
input, 98,944 cache-read and 5,410 output tokens at USD `0.00285878`.

This supports additional request headroom, but not a general increase to token, Tool,
cost or wall-time budgets. The unchanged cumulative-token and Tool ceilings may still
stop a trajectory before request 24; that layered behavior is intentional.

## 3. Implementation

- Added two exact, Host-owned profiles: the accepted frozen 16-request profile and the
  daily 16-observation/24-hard profile.
- Made every bounded-Turn caller choose one of those profiles explicitly; browser/model
  input cannot supply or alter it.
- Kept the frozen Goal 2 entry on 16 and moved only the daily product entry to 24.
- Parameterized the existing request, Tool, token, cost and wall-time checks without
  changing the Agent loop or enabling retries.
- Preserved schema-1 legacy `17/16/16` terminals and added an explicitly identified
  schema-2 daily `25/24/24` terminal.
- Preserved non-settled/unverified/null Outcome, evidence reconciliation,
  Diff/Export/Discard, Apply denial and clean-new-Session-only behavior.
- Added cumulative per-Turn wall-time checks at Provider/Tool boundaries while retaining
  the same 900,000 ms value and Provider stream timeout.

## 4. Verification

Main ran the integrated revision:

| Check | Result |
|---|---|
| strict TypeScript | PASS |
| browser JavaScript syntax | PASS |
| focused and affected V3.6/V3.5 tests | 43 passed, 0 failed, 0 skipped |
| daily request 17 settles | PASS |
| daily attempt 25 produces 25/24/24 terminal | PASS |
| legacy 17/16/16 terminal and tamper/Apply-denial suite | PASS |
| frozen Goal 2 preflight constants | PASS |
| browser authority-injection rejection | PASS |
| Docker timeout/cleanup regressions | PASS; zero leftover V3.6 containers |
| `git diff --check` | PASS |
| fixed Pi HEAD/status | correct and clean |

The suite used Faux Provider/model responses. Docker-focused deterministic fixtures did
execute registered commands and fixture-only handoff tests; they did not read a
Credential, use external network/Provider/model access, retry the UX task, or apply any
change to the user's registered Mini RPG Source.

## 5. Claims and limitations

Allowed claim:

> V3.6 uses separate Host-owned frozen-acceptance and daily bounded-edit profiles; daily
> work observes request 16 and retains a finite request-24 hard stop, with the accepted
> safe budget-terminal behavior at attempt 25.

This deterministic maintenance does not prove that the original Mini RPG task would now
pass, that 24 is universally optimal, or that token/Tool/cost/wall-time stops have the
same typed terminal. No result-hunting retry was performed. Future tuning should use new
natural evidence rather than repeatedly rerunning this Case.

## 6. Final status

The maintenance is closed and accepted. V3.6 remains closed and accepted; its historical
Goal 2 evidence remains frozen. No V4 or additional real execution is authorized.
