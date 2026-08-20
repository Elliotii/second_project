# V3.7 Goal 3B Host Execution-Port Bridge Audit Remediation Amendment

```yaml
status: ACCEPTED_BY_USER_2026_08_21
decision: AUTHORIZE_V3_7_G3B_HOST_BRIDGE_AUDIT_REMEDIATION_WITH_TWO_PINNED_RUNTIMES
findings:
  - V37-G3B-BRIDGE-AUDIT-P1-001
  - V37-G3B-BRIDGE-AUDIT-P1-002
implementation_owner: /root/v37_g3b_host_port_bridge_implementation
real_access: false
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
remediation_capacity: 1
```

## Contract correction

The Charter requires one seven-unit, no-retry real Case with fixed Provider/model identity
and reconciled budgets. It does not require one shared Runtime instance.

This Amendment supersedes only the bridge-only single-Runtime claim. The accepted bridge
must use:

1. exactly one opaque Credential resolver invocation for the whole bridge;
2. the public V2B-owned pinned DeepSeek composition for Primary/Recovery;
3. the bridge-owned pinned Post-V3.5 DeepSeek composition for Candidate, Regression and
   follow-up;
4. exactly two sanitized, explicitly inspectable Runtime composition identities, both
   fixed to DeepSeek `deepseek-v4-flash`;
5. one aggregate seven-unit budget/counter ledger and unchanged no-retry semantics.

No public V2B, V3.6, Product, Pi, configuration, Candidate or workflow contract changes
are authorized.

## Exact remediation boundary

The original Implementation Session may change only:

1. `workbench/src/v37/real-execution-ports-v37g3b.ts`;
2. `workbench/tests/v37g3b-real-execution-ports.test.ts`;
3. `docs/reports/V3_7_G3B_HOST_EXECUTION_PORT_BRIDGE_IMPLEMENTATION_REPORT.md`.

Required changes:

- synchronously reserve the exact next unit before any asynchronous Credential, Runtime,
  Provider, Tool, command or product receipt boundary;
- reject a duplicate/concurrent unit before external operations; release only through
  successful completion or transition the bridge to faulted on failure;
- coalesce an unresolved Credential read through one shared Promise and never invoke the
  resolver twice;
- account for the Primary group as one reserved group while completing its three ordered
  logical units without reopening a concurrent dispatch window;
- expose the exact two sanitized Runtime composition identities in bridge inspection and
  lifecycle evidence; remove the inaccurate single-runtime claim;
- add deterministic barrier-based concurrent Primary and later-stage duplicate tests
  proving exactly one path can dispatch and Credential resolution remains at most one.

Preserve both earlier fixed findings, daily-24, all digest/configuration pins, budgets,
four production ports, template prompt, exact Candidate validation, Regression/follow-up
order, closure and zero-access behavior.

Run only bridge focused tests, affected authority tests, strict TypeScript and integrity
checks. Create one new Candidate without amending prior Candidates. Main rereview and a
fresh independent re-audit limited to the two audit findings and preserved corrections
are mandatory. Hard Stop if any additional source path or public contract change is
required.
