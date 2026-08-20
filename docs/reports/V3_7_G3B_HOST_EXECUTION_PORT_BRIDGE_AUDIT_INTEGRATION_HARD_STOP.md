# V3.7 Goal 3B Host Execution-Port Bridge Audit Integration Hard Stop

```yaml
status: DECISION_REQUIRED_AUDIT_FAILED_AND_EXCEPTIONAL_CAPACITY_EXHAUSTED
recorded_on: 2026-08-21
audit_candidate_commit: c85011fd9ea8a64d6b7964dd853750b13f2b2fa4
audit_candidate_tree: 2bb2fb399cd4f08a89da9c02edb3abf15e740938
audit_disposition: FAIL_V3_7_G3B_HOST_EXECUTION_PORT_BRIDGE_FOCUSED_AUDIT
findings:
  - V37-G3B-BRIDGE-AUDIT-P1-001
  - V37-G3B-BRIDGE-AUDIT-P1-002
real_access_authorized: false
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
```

## Main integration

Main accepts both audit findings. The sequential Candidate remains immutable and both
earlier Main findings remain closed, but audit FAIL prevents bridge acceptance and Goal
3B Execution-Prompt preparation.

`V37-G3B-BRIDGE-AUDIT-P1-001` is a required local correction: the Coordinator must
reserve an in-flight unit synchronously before any asynchronous dispatch. Duplicate or
concurrent actions must fail before Credential resolution, model construction, Provider
request, Tool/command side effect or receipt. The shared Credential lease must also
coalesce an unresolved read through one Promise.

`V37-G3B-BRIDGE-AUDIT-P1-002` exposes a conflict in the bridge Amendment rather than a
Charter requirement. Public `createRealExecutionPortV2B` owns and caches its V2B-group
DeepSeek composition; the later bridge stages use the accepted Post-V3.5 composition.
Forcing one Runtime instance would require changing an accepted shared V2B public seam
and widening source/regression/audit scope.

## Recommended minimal contract revision

Keep one opaque Credential resolver invocation and one aggregate seven-unit budget, but
replace the unnecessary bridge-only "one runtime instance" claim with exactly two pinned
and inspectable Runtime compositions:

1. V2B Primary/Recovery composition, closed after its three-attempt group;
2. Candidate/Regression/follow-up composition, closed by the bridge.

Both remain fixed to DeepSeek `deepseek-v4-flash`; no fallback, retry, replacement or
extra execution unit is introduced. Sanitized inspection/reporting must state the two
compositions explicitly. No V2B, V3.6, Product, Pi or configuration source change is
needed.

If authorized, one audit-remediation correction may change only the same bridge source,
focused test and implementation report. It must add deterministic concurrent duplicate
tests and correct the runtime-composition inspection/claim. Main rereview and a fresh
independent re-audit are mandatory.

Recommended user decision:

`AUTHORIZE_V3_7_G3B_HOST_BRIDGE_AUDIT_REMEDIATION_WITH_TWO_PINNED_RUNTIMES`

Until that decision, preserve the Candidate, keep audit failed, and keep all real access
and Execution-Prompt work locked.
