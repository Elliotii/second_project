# V3.7 Goal 3B Access-Counter Maxima Pre-Freeze Correction Amendment

```yaml
status: ACCEPTED_BY_USER
accepted_on: 2026-08-21
authority: V3_7_CHARTER.md
applies_to: V3_7_G3B_FREEZE_PREPARATION
finding: G3B-PREFREEZE-P1-001
accepted_decision: AUTHORIZE_V3_7_G3B_ACCESS_COUNTER_MAXIMA_CORRECTION_AND_RETURN_FOR_EXACT_FREEZE_REVIEW
source_correction_budget: 1_of_1
real_access: false
goal_3b_configuration_freeze: false
goal_3b_execution: false
```

## 1. Purpose and authority

The user accepted the recommendation in
`docs/reports/V3_7_G3B_FREEZE_PROPOSAL.md`. This Charter-subordinate Amendment authorizes
one narrow pre-freeze correction because the current Goal 3A real-declared path treats
registered access ceilings as exact future observations. A real Agent may truthfully
settle below a ceiling, so exact equality can invalidate the sole Goal 3B Case without a
budget or integrity violation.

This Amendment does not reopen Goal 3A's accepted deterministic product result. It adds
only the minimum correction needed before a viable Goal 3B configuration can be frozen.
It grants no Case registration, Provider construction, Credential resolution, network,
real-model, Docker product execution or Goal 3B execution authority.

## 2. Frozen correction semantics

For a real-declared G3A Case only:

1. The four registered non-negative access values are hard maxima, not predicted exact
   observations.
2. Host construction authorization must continue to match those registered maxima
   exactly by Case, Manifest, follow-up profile and construction-authority digests.
3. Primary and follow-up actual counters must be non-negative safe integers and must not
   exceed the registered maxima.
4. Primary `network_calls`, `external_provider_calls` and `real_model_calls` must equal the
   independently inspected total Provider dispatches derived from the accepted V2 raw
   Sessions/Journal/Candidate evidence. Credential reads must be positive for a
   real-declared dispatch and at or below the registered maximum.
5. Follow-up `network_calls`, `external_provider_calls` and `real_model_calls` must equal
   the persisted V3.6 Runtime Manifest's `provider_requests`. Credential reads must be
   positive and at or below the registered maximum.
6. Zero-access deterministic Cases retain exact zero behavior and all existing identity,
   lineage, registration, terminalization and no-fallback rules.
7. Under-cap and at-cap observations are valid; over-cap, negative/non-integer,
   counter/ledger mismatch and zero real-declared observations fail closed before a
   workflow transition receipt or accepted formal artifact.

The existing field names and Schema 1 shapes remain unchanged. This is a bounded semantic
correction, not Schema 2, a compatibility layer or a generalized budget framework.

## 3. Exact source and test allowlist

The implementation Session may change only:

- `workbench/src/inspect-v37g3a.ts`;
- `workbench/src/v37/registered-follow-up-v37g3a.ts`;
- `workbench/tests/v37g3a-product.test.ts`;
- `docs/reports/V3_7_G3B_ACCESS_COUNTER_MAXIMA_CORRECTION_REPORT.md`.

`workbench/src/inspect-v2.ts`, all loader/fingerprint sources, contracts, registry files,
Manifest/Envelope/profile configuration, accepted reports, control state, UI/API source,
Pi and dependencies are frozen. If the correction cannot be completed inside this
allowlist without weakening the frozen rules, the Session must stop `DECISION_REQUIRED`.

## 4. Required deterministic proof

The Candidate must prove:

- real-declared Primary below-cap and at-cap actual counters pass only when equal to the
  independently inspected Provider-dispatch ledger;
- Primary over-cap and counter/ledger mismatch fail with no receipt or fallback;
- real-declared follow-up below-cap and at-cap counters pass only when request-aligned;
- follow-up over-cap and counter/request mismatch fail with no receipt or fallback;
- real-declared zero actual access fails closed;
- deterministic zero-access Primary and follow-up remain exact-zero and pass;
- all existing Goal 3A product tests and the accepted related G1/G2, V2, V3 and V3.6
  focused regressions remain green;
- strict TypeScript passes using the repository-authorized existing compiler;
- Credential, network, external Provider and real-model operations remain zero.

No load, fuzz, concurrency, migration, new Case, UI expansion or generalized test suite
is authorized.

## 5. Session, Candidate and audit governance

The original Goal 3A implementation Session owns the bounded correction and may create
exactly one Candidate commit whose parent is the Main-frozen correction Control Baseline.
It must report the exact commit/tree, changed paths, commands, results and unverified
items, then stop.

Main independently reviews the immutable Candidate. Because the finding touches real
access accounting, execution validity and terminalization, a fresh independent read-only
focused re-audit is mandatory. Audit may inspect and run local deterministic tests but may
not edit source, repair, accept the Candidate, change control state or start Goal 3B.

Passing correction and audit return control to Main for a revised exact Goal 3B freeze
proposal. They do not automatically freeze configuration or authorize real access.

## 6. Hard stops

Stop without implementation expansion if any of the following occurs:

- the V2 or V3.6 shared Inspector/runtime must change;
- a loader/fingerprint, Schema, Manifest shape, workflow state or accepted historical
  artifact must change;
- ledger equality cannot be independently derived from already accepted artifacts;
- a test requires actual Credential, network, Provider/model or Docker product access;
- the single correction Candidate fails Main review or focused re-audit.
