# Post-V3.6 Budget Adequacy Maintenance Goal Contract

```yaml
status: closed_accepted
accepted_by_user: 2026-08-12
goal_id: POST_V3_6_BUDGET_ADEQUACY_MAINTENANCE
goal_kind: bounded_post_closeout_product_profile_maintenance
version_status: V3_6_remains_closed_accepted
implementation_owner: current_main_session
real_model_calls_authorized: 0
credential_reads_authorized: 0
external_network_authorized: false
real_task_retry_authorized: false
pi_core_patch_authorized: false
disposition: PASS_POST_V3_6_BUDGET_ADEQUACY_MAINTENANCE
implementation_commit: 1150e61630b578095da681b6506deff2a291063a
closeout: docs/reports/POST_V3_6_BUDGET_ADEQUACY_MAINTENANCE_CLOSEOUT.md
```

## 1. Goal

Determine whether the daily V3.6 `bounded_edit` Provider-request hard cap is adequate for
ordinary medium coding work, then make only the smallest evidence-backed profile change.
This Goal does not reopen V3.6 or the accepted budget-stop terminalization maintenance.

## 2. Evidence and decision

**Fact:** The accepted frozen V3.6 Goal 2 Journey used 11 Provider requests across two
Turns, 10 Tool calls, 53,597 cumulative tokens and USD `0.0025941608`.

**Fact:** The later Mini RPG UX Turn reached 16 successful Provider responses and 22/24
Tool calls. Request 14 ran tests, requests 15–16 inspected and corrected the single
remaining failure, and request attempt 17 was refused before dispatch. Observed usage was
7,621 ordinary input tokens, 98,944 cache-read tokens, 5,410 output tokens and USD
`0.00285878`. This was not an evident runaway loop.

**Inference:** A 16-request hard stop is too tight for the daily medium-task profile, but
the existing 131,072 cumulative-token, 24 Tool-call, USD 0.20 and 900,000 ms hard limits
already provide independent finite runaway protection. Increasing every dimension is not
supported by the evidence.

**Decision:** Preserve the accepted frozen Goal 2 profile at 16 requests. For the daily
`bounded_edit` product only, use:

```yaml
profile_id: v36_daily_bounded_edit_v2
provider_requests_observation_threshold: 16
provider_requests_hard_max: 24
tool_calls_hard_max: 24
combined_tokens_hard_max: 131072
cost_usd_hard_max: 0.20
wall_time_ms_hard_max: 900000
retry: 0
fallback: 0
replacement: 0
```

The observation threshold records a review signal only. It does not dispatch an extra
request, retry, replace, continue automatically or weaken the finite hard stop.

## 3. Frozen scope

1. Introduce typed Host-owned legacy/frozen and daily budget profiles.
2. Keep the frozen V3.6 Goal 2 entry explicitly on its accepted 16-request profile.
3. Bind the daily product path explicitly to the 24-request profile.
4. Parameterize the existing bounded Turn only by those Host-owned profiles.
5. Preserve legacy schema-1 17/16/16 budget terminals on reopen.
6. Add a schema-2 daily terminal with exact 25/24/24 accounting and profile identity.
7. Preserve non-settled/unverified/null outcome, Diff/Export/Discard, Apply denial,
   registered Source immutability and clean-new-Session-only semantics.
8. Add deterministic regression for crossing 16 without stopping and for the exact daily
   hard stop at attempt 25.
9. Update the daily-product documentation and form a Closeout.

## 4. Non-goals

- no real task retry, result hunting or model call;
- no automatic retry, fallback, replacement, resume or continuation;
- no unlimited loop or removal of a finite cap;
- no change to Pi, Docker, Session lineage, Verifier, ChangeSet or Source Apply authority;
- no retroactive rewrite of accepted V3.6 evidence;
- no generalized budget optimizer or dynamic model-controlled budget;
- no typed terminal redesign for unrelated token, cost, Tool, wall-time or crash failures.

## 5. Deterministic Exit Criteria

1. Daily request 17 is permitted and can settle under all unchanged hard limits.
2. Daily request attempt 25 is refused before dispatch with 24 dispatches/responses.
3. The daily terminal is immutable, reopens safely and retains all accepted denial rules.
4. A legacy 17/16/16 terminal still parses, reopens and behaves exactly as accepted.
5. The frozen Goal 2 profile and constants remain byte-for-byte semantically unchanged.
6. Browser input cannot select or raise a budget profile.
7. Token/cost/Tool/wall-time caps remain unchanged for daily execution.
8. Strict TypeScript and focused/affected V3.6 regressions pass.
9. Credential/network/Provider/model and registered-user-Source Apply counts remain zero;
   deterministic Docker/fixture-only handoff regressions may execute.
10. Pi remains pinned and clean.

## 6. Hard stops

Stop only if completion requires removing a finite hard cap; changing terminal, Session,
Verifier, ChangeSet or Source authority semantics; real access or task retry; Pi changes;
model/browser-controlled budgets; or material architecture expansion.

## 7. Accepted result

Main completed the bounded implementation and light review without an independent audit:
the change selects one of two exact Host-owned profiles, preserves the accepted frozen
profile and terminal semantics, and does not create a new authority or side-effect path.
Strict TypeScript and 43 focused/affected tests passed. The binding result and limits are
recorded in `docs/reports/POST_V3_6_BUDGET_ADEQUACY_MAINTENANCE_CLOSEOUT.md`.
