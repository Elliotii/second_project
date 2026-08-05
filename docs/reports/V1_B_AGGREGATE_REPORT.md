# V1-B Aggregate Report — Pause State

```yaml
goal_execution_disposition: PAUSE_V1_B_PILOT
policy_recommendation: INCONCLUSIVE
planned: 24
started: 1
terminal: 0
invalid: 0
paused: 1
comparable: 0
effect_denominator: 0
actual_cost_usd: unknown
recovery_observed: unobserved
```

No arm or checkpoint metric is computable. Cell 1 has no terminal evidence and
cells 2–24 were not started. Running the tracked aggregate would necessarily
reject the Pilot because it requires independently valid terminal evidence for
every Manifest member; Gate O was therefore not claimed or forced.

Membership reconciliation:

- `v1b-cell-01` / `v1b-run-01-parse-duration-r1-a`: started once, paused once,
  no terminal or invalid transition;
- cells 2–24: planned only;
- duplicate starts: 0;
- retry/fallback/replacement/deletion: 0;
- child Attempts: 0 observed;
- terminal Attempts/Sessions/Workspaces: 0;
- one partial Attempt/Session/Workspace lineage is named by the first Run's
  journal, but no terminal evidence exists to validate it as a comparable Run.

The frozen invalid attribution table cannot classify the underlying failure
from the persisted evidence. It remains `paused_unclassified` and is not
excluded from a denominator. No descriptive Skill or Runtime conclusion is
supported.
