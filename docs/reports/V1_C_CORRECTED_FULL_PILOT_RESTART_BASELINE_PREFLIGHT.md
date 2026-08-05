# V1-C Corrected Full-Pilot Restart Baseline Preflight

```yaml
status: PASS_ZERO_CALL_RESTART_PREFLIGHT
candidate_commit: 5b87b98e431663595e9bd26a54589defbabcd3b1
candidate_tree: a238d838c4197aae1ef35dd70507b680160e0c65
focused_reaudit: PASS_FOCUSED_REAUDIT
workbench_source_digest: 2de1b76f7b9304ebe6d75e04ba3fa172f1d433cc219ad63ff10e6d6ff08c7ad3
manifest: fixtures/manifests/v1/v1c-full-pilot-execution-r2.json
manifest_id: c1587d04277a327bf0bd54bcf5abf6194663513f7c5960d3425bcbd322e78e14
pilot_root: .runs/v1-c/full-pilot-r2/pilot
control_baseline_commit: resulting_HEAD_of_this_revision
credential_reads: 0
network_calls: 0
provider_calls: 0
model_calls: 0
```

## Result

Main reconstructed the additive R2 Manifest from the audited public builder
and compared it byte-for-byte with the tracked file. Validation passed against
the current corrected Workbench source.

Observed frozen limits:

```yaml
initial_cells: 24
unique_cell_ids: 24
unique_planned_run_ids: 24
child_attempts_max: 8
pilot_cost_hard_cap_usd: 1.90
same_run_retry: false
fallback: false
automatic_replacement: false
```

The tracked Product Surface preflight returned `ready`, selected cell 01, and
reported exact zero Credential, network, Provider and model counters. The R2
Pilot root did not exist before preflight and remained absent afterwards.

The historical Manifest and historical four-Run Pilot root were not modified.
Pi remains pinned and V2 remains unauthorized.
