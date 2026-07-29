# G005 Phase 3 Real-model Completion Verification Feasibility Closeout

Date: 2026-07-29  
Terminal disposition: `INVALID_G005_EVIDENCE`

## Closeout decision

**Fact.** The Main Session selected Option B. G005 is closed without resuming
the same attempt, making another model call, running the Baseline external
Verifier, or starting Candidate.

**Fact.** The raw `FAIL_REAL_MODEL_ROUTE` disposition remains unmodified in
`.runs/g005/evidence/outcomes/execution-failure.json`. Main Session review
overrides its interpretation with `INVALID_G005_EVIDENCE` because project-side
Observer and Journal defects prevent the intended symmetric paired evidence.

## Final state

```yaml
G005:
  status: closed_invalid_evidence
  disposition: INVALID_G005_EVIDENCE
  baseline_provider_calls: 4
  baseline_settled: true
  baseline_external_verifier: not_run
  candidate_started: false
  additional_model_calls: 0_after_pause
  pi_core_patch_count: 0
  real_route_partial_evidence: positive_but_not_complete_gate
  completion_verification_policy_effect: unverified
  hidden_verifier_result: unconfirmed
  paused_secret_scan: partial_safety_evidence_not_final_gate_e
```

## Deliverables

- Final report:
  `docs/reports/G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_REPORT.md`
- Closeout: this file
- Pause report:
  `docs/reports/G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_PAUSE_REPORT.md`
- Truthful project-state update: `CURRENT_STATE.md`
- Preserved ignored raw evidence: `.runs/g005/evidence/`
- Preserved unmodified Spike identity: `spikes/pi-runtime/g005/`

The final report records exact commands/results, Gate states, observed defects,
Spike SHA-256 identities, selected raw-evidence hashes, remaining unknowns, and
the Main Session's architecture decision.

## Definition-of-Done reconciliation

**Fact.** Activation, exact root/Pi commits, the G003 artifact boundary, Gate A,
real provider and Tool round-trips, reasoning redaction, zero Pi patches,
command recording, reports, state update, and a required terminal disposition
are present.

**Fact.** A valid Baseline/Candidate pair, Baseline external Verifier,
Candidate recovery, complete evidence correlation, and final Gate E were not
completed. They are not represented as passes. The contract's
`INVALID_G005_EVIDENCE` disposition exists specifically for an uninterpretable
or contract-deviating run; Main Session architecture review directed terminal
invalid-evidence closure rather than continuation.

## Observed integration and observability defects

1. `after_provider_response` was registered with `harness.on(...)` although the
   pinned Pi path exposes this observation to `subscribe(...)` handlers.
2. Journal record spreading permits an inner `type` field to overwrite the
   outer event type.

**Inference.** These defects invalidate the paired evidence but do not show a
Pi Core or DeepSeek route failure.

**Inference.** The first defect crosses the project/Pi boundary: G005 failed to
audit the pinned dispatch path, while pinned Pi's type and documentation surface
also presents `after_provider_response` as an `on(...)` hook even though
`emitOwn(...)` reaches only subscribers. The public `subscribe(...)` workaround
is sufficient for a retry, so this is a non-blocking pinned Pi observability
semantic inconsistency rather than a reason to patch Pi Core.

## Deferred decision

**Recommendation.**
`G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY` may
later be considered as a clean-retry Goal. Its Contract must be drafted and
reviewed before implementation; Gate 0 should implement only the Observer and
Journal fixes plus offline regressions, then pause for Main Session review and
a clean baseline commit before any real-model request. It remains a candidate
only.

```yaml
G006:
  contract_created: false
  contract_creation_authorized: false
  execution_authorized: false
  runs_directory_created: false
```

No final Pi Go, Completion Verification promotion, formal Workbench, or
architecture freeze is authorized.
