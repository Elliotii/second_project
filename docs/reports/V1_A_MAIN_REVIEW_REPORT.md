# V1-A Main Session Bounded Review Report

```yaml
status: main_review_completed_request_bounded_correction
date: 2026-08-03
goal: V1_A_DETERMINISTIC_SKILL_AND_EXPERIMENT_SUBSTRATE
review_owner: current_main_session
review_scope: bounded_contract_and_high_risk_boundary_review
candidate_commit_ready: false
focused_independent_audit_ready: false
recommended_disposition: REQUEST_BOUNDED_V1_A_CORRECTION
```

## 1. Decision

The current V1-A implementation candidate is **not ready to freeze or audit**.
The Main Session disposition is:

```text
REQUEST_BOUNDED_V1_A_CORRECTION
```

This is not a rejection of the Direct `AgentHarness` route, the public Pi Skill
route, or the accepted V1 architecture. The observed defects are bounded to
contract validation, experiment integrity, executable calibration, authority
gating, and evidence quality.

## 2. Preserved accepted evidence

The following implementation facts remain credible and must be preserved:

- root Control Baseline is
  `c9f91057db60cf61dab0d3aa305564d498c89cd6`;
- pinned Pi is
  `027a5847901b5dde30270abaa1041046cd2b4b55` and clean;
- control files and Pi were not modified by the dedicated Session;
- public emitted Pi Skill symbols and `AgentHarness.skill()` dynamically load;
- the current Faux route settles with one initial Provider request and no
  preload Turn;
- strict TypeScript passed;
- the current focused suite passed 7/7 and the current full suite passed 98/98;
- real-model calls, external Provider calls, network calls, credential reads,
  dependency installs, Pi patches, and private Pi imports were all zero;
- no Git commit was created by the dedicated Session.

These facts prove mechanism feasibility and scope compliance. They do not prove
that Gates C through H are complete, because several current tests encode an
incorrect or weaker oracle than the accepted Contract.

## 3. Main-review reproductions

The Main Session executed a read-only counterexample probe against the current
candidate. It observed:

```json
{
  "manifest_with_placeholder_zero_digests_accepted": true,
  "treatment_invalid": {
    "valid_denominator": 0,
    "invalid_runs": 1,
    "treatment_caused_invalid_runs": 1
  },
  "missing_24_cells_returned_not_rejected": 24,
  "child_after_initial_pass_accepted": true,
  "denied_composition_still_prompted": "ran:deepseek-v3.2-exp",
  "task_workspace_has_package_json": false,
  "task_workspace_has_tests": false,
  "nonsolution_substring_calibration_accepted": true
}
```

The Main Session also reran:

| Command | Result |
| --- | --- |
| `node ../.runs/v0-a/pi/node_modules/typescript/bin/tsc -p tsconfig.json` | exit 0 |
| `node --test tests/v1a-deterministic.test.ts` | 7/7 pass |
| `node --test test` | 98/98 pass |
| `node scripts/run-v1a-deterministic-suite.mjs` | exit 0 |

The green suites therefore show that the implementation is internally
consistent with its current tests; the counterexamples show that several tests
do not yet enforce the binding Contract.

## 4. Binding findings

### V1A-MR-001 — Experiment membership, identity and denominator integrity

**Fact**

- `aggregateExperimentV1()` subtracts every invalid Run from
  `valid_denominator`, including treatment-caused invalids.
- Missing planned cells are returned as a count rather than rejected or
  represented by an explicit accountable paused disposition.
- A C child can be accepted even when the initial Verifier status is `passed`
  and `recovery_eligible` is false.
- Run evidence digests are not cross-checked against Manifest identities.
- The tracked deterministic Manifest contains placeholder zero digests that
  pass validation.

**Contract impact**

Gate F, Sections 12.1 through 12.3, deterministic test matrix 17.4, and DoD 12
through 13 are not satisfied.

### V1A-MR-002 — Treatment equality and Verifier ordering are asserted, not observed

**Fact**

- The Faux callback captures only the last user-text projection, not the full
  model-visible Provider context.
- `common_context_equal` hashes preselected constants instead of comparing the
  actual captured System Prompt, messages, Tool schemas and other model-visible
  fields.
- Measurement Verifier completion is represented by manually appending an
  event label; no external deterministic Verifier is invoked in the probe.
- The C decision consumes a caller-supplied status rather than the result of
  that external Verifier execution.

**Contract impact**

Gates D and E and Sections 11.1 through 11.2 are only partially proven.

### V1A-MR-003 — Task pack is not yet executable calibration evidence

**Fact**

- Task Workspaces contain only `src/subject.ts`; the declared `npm test` public
  check has no package or test surface to execute.
- External Verifier JSON files specify required source substrings rather than
  an executable deterministic behavioral check.
- `verifyCalibrationSourceV1()` accepts a nonsolution when it contains the
  expected function name and fragment.
- Writable/protected path identities and protected-shortcut rejection are not
  represented by the Task contract.

**Contract impact**

Gate H, Section 14, deterministic matrix 17.5, and DoD 15 are not satisfied.

### V1A-MR-004 — Provider composition can bypass denied authority

**Fact**

- `createPublicPiCompositionSeamV1()` calls the injected factory without first
  proving an authorized, complete one-use execution dependency set.
- A factory can ignore the denied authority and return a working handle; the
  current test treats this as success.
- The tracked model is `deepseek-v3.2-exp`, while the accepted Charter carries
  forward the V0 candidate route `deepseek-v4-flash`, subject to V1-B
  preflight revalidation.

**Contract impact**

Gate G and Section 13's fail-before-runtime-identity requirement are not
satisfied.

### V1A-MR-005 — Skill identity and source drift are not frozen fail-closed

**Fact**

- The loader requires one Skill but does not enforce the exact expected name,
  parent/source identity, frozen source digest/size, or frozen wrapper digest.
- It assigns the fixed `reliability-completion-v1` ID to whichever single
  valid Skill was loaded.
- The configured Skill root itself is canonicalized before the ordinary-tree
  scan and is not explicitly rejected when it is an in-root link/reparse root.
- The current focused tests omit several Contract cases, including exact name,
  source drift, missing/invalid description, root-link/dangling cases and
  Windows case/separator aliases.

**Contract impact**

Gate C and deterministic matrix 17.2 are incomplete.

## 5. Required disposition and audit decision

The five findings are correctable inside the accepted V1-A scope. No Contract,
Charter, Pi Core, new dependency, real Provider call, or architecture change is
currently required.

A focused independent audit is still required by Gate J, but it must occur only
after:

```text
bounded correction by original Implementation Session
→ Main Session lightweight re-review
→ user-authorized frozen Candidate Commit
→ focused independent audit
```

Auditing the current known-defective candidate would add process cost without
changing the correction decision.

## 6. Current stop point

- V1-A remains active and pending bounded correction.
- Candidate Commit is not authorized or ready.
- Gate J is not authorized or ready.
- `CURRENT_STATE.md` must not be updated yet.
- V1-B Contract or implementation must not begin.
