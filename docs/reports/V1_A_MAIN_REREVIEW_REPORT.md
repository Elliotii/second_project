# V1-A Main Session Lightweight Rereview Report

```yaml
status: lightweight_rereview_completed_micro_correction_required
date: 2026-08-03
goal: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
review_owner: current_main_session
candidate_commit_ready: false
focused_independent_audit_ready: false
disposition: REQUEST_BOUNDED_V1_A_CORRECTION
scope: residuals_of_V1A_MR_001_MR_003_MR_004_only
```

## Decision

The first bounded correction materially fixed the Skill, actual Provider
payload, external Measurement Verifier, executable Task calibration and most
experiment boundaries. The candidate is close, but it is not yet safe to
freeze because three deterministic counterexamples remain and one Task role is
semantically mislabeled by behavior.

The disposition remains:

```text
REQUEST_BOUNDED_V1_A_CORRECTION
```

This is a micro-correction, not a second architectural correction cycle.

## Confirmed corrected surfaces

- V1A-MR-002 actual Faux callback projection and actual external Verifier
  ordering: accepted for Candidate continuation.
- V1A-MR-003 executable workspaces, external behavioral Verifiers, reference
  repeatability, nonsolution rejection and protected-file checks: accepted,
  subject only to the Task-role consistency correction below.
- V1A-MR-005 exact frozen Skill identity, wrapper/source drift and root/child
  path boundaries: accepted for Candidate continuation.
- strict TypeScript: pass.
- focused V1-A tests: 10/10 pass.
- V1-A deterministic suite: pass.
- targeted accepted V0 Verifier regression: 2/2 pass.
- root/Pi/control/zero-real-call boundaries: preserved.

## Residual findings

### V1A-RR-001 — Frozen input bindings do not freeze the 24-cell membership

The `expected` comparison in `validateExperimentManifestV1()` excludes
`members`. A Manifest with all members removed and a recomputed `manifest_id`
passes validation even when current derived bindings are supplied. The same
empty Manifest and empty result list are accepted by the Aggregator.

A coherent non-placeholder Skill digest change with a recomputed Manifest ID
also passes the validation path used internally by the Aggregator, because the
Aggregator does not receive or derive the frozen expected source bindings.

Observed counterexample:

```json
{
  "empty_manifest_with_expected_bindings_accepted": true,
  "empty_manifest_aggregate_accepted": true,
  "empty_manifest_planned_runs": 0,
  "coherent_skill_digest_drift_accepted_by_aggregate_validator": true
}
```

### V1A-RR-002 — Run terminal status and invalid attribution can contradict

The Aggregator currently accepts a Run with:

```yaml
verifier_status: passed
final_verifier_status: failed
invalid_attribution: treatment
```

and counts it as both `passed` and `treatment_invalid`. The Run-provided
`exclusion_preauthorized` boolean is also not cross-checked against a frozen
protocol-level exclusion rule.

The terminal status, final Verifier status, attribution and exclusion policy
need one fail-closed legal matrix before aggregation counters are updated.

### V1A-RR-003 — One authority can create multiple formal runtimes

`createPublicPiCompositionSeamV1()` checks authority usability but does not
reserve or consume it when creating the formal runtime identity. Calling the
composition function twice before the first Provider request reaches the
factory twice and creates two runtime identities from one authority.

Observed counterexample:

```json
{
  "same_authority_created_second_runtime_before_request": true,
  "factory_calls_before_any_provider_request": 2
}
```

### V1A-RR-004 — `public_check_dependent` role does not depend on its public check

The unmodified `v1-state-transition` Workspace returns exit 0 from its public
check while its Task family is `public_check_dependent`. The external Verifier
correctly fails, but the role label and behavior do not match the Contract's
four-role calibration claim.

This can be corrected by making the bounded public check expose the intended
public failure while retaining a stronger external Verifier, or by changing
the role assignment without losing all four required Task roles.

## Stop point

The four residuals are within the original correction scope. They should be
returned to the original V1-A Implementation Session, followed by one narrow
Main Session recheck. Candidate Commit and Gate J remain premature until the
counterexamples fail closed.
