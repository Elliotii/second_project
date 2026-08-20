# V3.7 Goal 3B Host Execution-Port Bridge Amendment

```yaml
status: ACCEPTED_BY_USER_2026_08_21
finding: G3B-PREEXEC-P1-001
authority: V3_7_CHARTER.md_sections_4_8_9
implementation_owner: /root/v37_g3b_host_port_bridge_implementation
real_access: false
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
candidate_capacity: 1
ordinary_correction_capacity: 1
```

## Purpose

Close only the missing Host-owned construction seam between the audited Goal 3B real
Case configuration and the four execution ports already required by
`ProductServiceV37G3A`. The bridge must consume frozen authority; it must not define a new
workflow, State transition, Candidate type, Regression decision or follow-up contract.

## Exact source boundary

Implementation may change exactly these paths:

1. add `workbench/src/v37/real-execution-ports-v37g3b.ts`;
2. add `workbench/tests/v37g3b-real-execution-ports.test.ts`;
3. add `docs/reports/V3_7_G3B_HOST_EXECUTION_PORT_BRIDGE_IMPLEMENTATION_REPORT.md`.

No existing source, test, configuration, fixture, loader, script, Pi file, control state or
planning file may change. In particular, Candidate
`f30914378dc90390afce7240b9755d7d24da0850` / tree
`667504572064c00fa170ac5952d8ef0af4a595ad` remains the immutable configuration Candidate.

## Required bridge

The new Host module must:

- hard-bind Case `v37-real-recovery-promote-retain`, Project
  `v37-real-recovery-project`, configuration Candidate commit/tree, Manifest,
  registration, follow-up profile, registry and construction-authority digests recorded
  in `CURRENT_STATE.md`;
- expose one Host-owned factory that accepts only an explicit authority token and opaque
  Credential resolver and returns the exact four `ProductCaseExecutionPortsV37G3A`, exact
  `ProductRealAccessAuthorizationV37G3A`, a constructed `ProductServiceV37G3A`, sanitized
  usage/lifecycle inspection and `close()`;
- perform zero Credential resolution and zero Provider/model construction during module
  import, factory construction, Case listing and pre-dispatch validation;
- reuse the public `createRealExecutionPortV2B` seam for the Primary V2 group and existing
  accepted public production APIs for Candidate proposal, symmetric Regression and V3.6
  follow-up; no private Pi import or Pi change;
- create the fixed DeepSeek `deepseek-v4-flash` model only after the first authorized
  dispatch boundary and resolve the opaque Credential at most once for the whole bridge;
- preserve the Primary/Recovery `1/48/48/48` and follow-up `1/24/24/24` registered maxima,
  while retaining every stricter existing per-attempt/runtime cap;
- enforce the seven-unit envelope, global USD `1.40` cap, no retry/fallback/replacement,
  one Candidate proposal, indivisible ordered Regression Base/Candidate and one follow-up;
- persist sanitized usage/lifecycle evidence sufficient to reconcile request, token,
  Tool, command, wall-time and cost totals without Credential, headers, raw Provider
  payloads, environment contents or full model text;
- fail closed on unknown usage/cost, malformed Candidate JSON, arm-order drift, duplicate
  stage, budget overflow, authority drift, close, or terminal/runtime mismatch;
- make no workflow available after bridge closure and never silently substitute the
  deterministic Goal 3A ports for the real-declared Case.

The exact model-visible prompts may contain only frozen Task/Evidence/State content needed
by the corresponding stage. Candidate output must be exact JSON accepted by the existing
bounded producer. Regression must operate on the existing symmetric comparator Workspace
and may not manufacture verifier results. Follow-up must use the existing registered
task/profile and `PersistentInteractiveSessionServiceV36` path.

## Deterministic verification

The single new test file may use only local fakes/mocks and temporary `.runs` roots. It
must prove:

1. exact configuration/baseline/digest binding and four-port membership;
2. construction and `listCases()` resolve no Credential and make no external operation;
3. missing/wrong authority, resolver, baseline, digest or port identity fails before
   workflow/Run/receipt and before Credential resolution;
4. the registered real Case becomes available only through the exact Host bridge;
5. shared Credential resolution is at most one and sanitized counters/ledger reconcile;
6. Candidate proposal is once-only and exact-JSON fail-closed;
7. Regression is ordered Base then Candidate, indivisible and no arm rerun;
8. follow-up is once-only and cannot execute before prior valid stages;
9. global/per-unit budget overflow, unknown usage/cost and post-close use fail closed;
10. deterministic Goal 3A ports are not selected for this real Case.

Tests must not export or expose a production-callable deterministic substitute for the
real bridge. A bounded injected runtime seam may exist only inside the new test file; the
production factory must internally pin the existing DeepSeek production factory.

Run only the new focused test, the previously accepted seven-test configuration/maxima
command when directly affected, strict TypeScript, diff/allowlist and immutable-config
checks. Do not run broad G3A/G1/G2/V2/V3/V3.6/demo suites without concrete regression
evidence.

## Stop conditions

Hard Stop without Candidate if the bridge requires any existing-file edit, Pi change,
strict new Provider/Docker attestation, new product semantics, test-only launch path,
Credential/network/model access, secret logging, configuration mutation or broader
allowlist. Main/user must review any proposed Amendment before resumption.

After implementation, Main review and a fresh focused independent audit are required.
Audit PASS does not authorize real access or create the Goal 3B Execution Prompt.
