# V3.7 Goal 3B Host Execution-Port Bridge Focused Audit

```yaml
status: FAIL_V3_7_G3B_HOST_EXECUTION_PORT_BRIDGE_FOCUSED_AUDIT
audited_on: 2026-08-21
candidate_commit: c85011fd9ea8a64d6b7964dd853750b13f2b2fa4
candidate_tree: 2bb2fb399cd4f08a89da9c02edb3abf15e740938
candidate_parent: 3071a0fcd91d6b95ade47c50114518973b6a7c53
findings:
  - V37-G3B-BRIDGE-AUDIT-P1-001
  - V37-G3B-BRIDGE-AUDIT-P1-002
credential_reads: 0
external_network_calls: 0
external_provider_calls: 0
real_model_calls: 0
docker_execution: 0
pi_execution: 0
```

## Disposition

FAIL with two P1 findings. The immutable Candidate has the exact authorized three-path
delta and both earlier Main findings are closed: Candidate completion follows the
existing 32 KiB/producer validation, and the actual Candidate request contains the exact
Host-loaded registered template used by the positive fake. Daily-24, authority/digest
pins, four-port membership, lazy construction, Regression/follow-up composition,
sanitized evidence and production/deterministic separation otherwise pass the focused
inspection.

The Candidate cannot enter real Execution-Prompt preparation because its production
bridge does not yet enforce the frozen once-only/single-runtime envelope under all public
Host call paths.

## Findings

### V37-G3B-BRIDGE-AUDIT-P1-001 — an in-flight unit is not reserved before dispatch

`Coordinator.expect()` checks only `completed_units.length`; it does not reserve or mark
the expected unit in flight. `ProductServiceV37G3A.act()` also reads stage availability,
executes the port and appends the receipt without an action lock. Two concurrent calls
for the same available action can therefore both pass the pre-dispatch checks before
either calls `Coordinator.complete()`.

This permits duplicate Primary groups or duplicate Candidate/Regression/follow-up model
dispatches. The later call may fault when completion order is rechecked, but the extra
Provider/model operation has already occurred. Two concurrent Primary calls can also
race `SharedCredentialLease.resolve()` while its cached value is unset, so the opaque
resolver is not guaranteed to be invoked at most once. A post-dispatch fault does not
restore the frozen no-retry/once-only envelope.

The sequential 8-test file does not exercise an in-flight duplicate. This violates the
accepted seven-unit order/once-only/no-retry contract and blocks the sole real path.

### V37-G3B-BRIDGE-AUDIT-P1-002 — production constructs two independent model runtimes

The Primary/Recovery port calls public `createRealExecutionPortV2B`, whose production
implementation creates and caches its own DeepSeek `Models`/model composition. That port
is closed after the three-attempt group. Candidate proposal, both Regression arms and
follow-up instead use the separate `Coordinator.modelRuntime()` created by
`createPostV35DeepSeekModelFactory()`.

The Credential value is shared sequentially, and both compositions pin
`deepseek-v4-flash`, but they are not one shared runtime across the seven-unit envelope.
The focused test mocks `createRealExecutionPortV2B` with a deterministic delegate and
counts only the later model factory, so its single-factory assertion cannot prove the
production claim. This violates the frozen single shared Credential/runtime composition
boundary and makes the implementation report's one-runtime statement inaccurate.

## Passing focused boundaries

- Candidate commit/tree/parent and exact three-path allowlist: PASS.
- Candidate source/test/report in current HEAD remain byte-identical to the Candidate:
  PASS.
- Configuration, V3.6, Product, Docker executor and Pi paths in the Candidate delta:
  unchanged.
- Four public production ports and exact real Case/Project/configuration/digest pins:
  PASS.
- Daily Runtime identity `v36_daily_bounded_edit_v2`, observation threshold `16`, hard
  maximum `24`, and follow-up access maxima `1/24/24/24`: PASS.
- Import/factory/list/pre-dispatch Credential and model laziness: PASS for sequential
  construction.
- Candidate exact JSON, 32 KiB boundary and existing producer validation before bridge
  completion (`G3B-HOST-BRIDGE-MAIN-P1-001`): PASS.
- Host-loaded template ID/content/SHA-256 appears in the actual Candidate prompt, and the
  positive fake derives its proposal from that request
  (`G3B-HOST-BRIDGE-MAIN-P1-002`): PASS.
- Regression uses the supplied production comparator port in Base-then-Candidate order;
  follow-up uses `PersistentInteractiveSessionServiceV36` and
  `DockerRegisteredCommandExecutorV36`: PASS for the sequential tested path.
- Per-unit/global usage, cost, Tool, command and wall caps; unknown usage; malformed
  Candidate; close/fault inspection; and no exported production deterministic substitute:
  PASS for covered sequential paths.

## Verification

| Check | Result |
|---|---|
| `node --experimental-test-module-mocks --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g3b-real-execution-ports.test.ts` | 8 passed, 0 failed |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs --test --test-concurrency=1 tests/v37g3a-authority.test.ts` | 6 passed, 0 failed |
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.json --noEmit` | PASS, zero diagnostics |
| Candidate diff/check, allowlist, immutable-path and blob checks | PASS |
| Actual Credential/network/Provider/model operations | `0/0/0/0` |
| Docker/Pi execution | `0/0` |

No broad G3A, G1/G2, V2, V3, V3.6, Docker, Pi or real-execution suite was run. The
user-owned untracked `docs/reports/SECOND_PROJECT_CASE_EVIDENCE_AUDIT.md` was neither read,
modified nor staged.

## Required next action

Preserve Candidate `c85011fd9ea8a64d6b7964dd853750b13f2b2fa4` unchanged and keep real access and
Execution-Prompt preparation locked. Main must integrate both findings and determine the
authorized correction boundary. Any source correction requires a new Candidate, Main
rereview and a fresh independent focused audit.
