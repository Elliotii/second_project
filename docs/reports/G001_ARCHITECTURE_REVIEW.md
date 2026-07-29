# G001 Architecture Review

```yaml
reviewed_goal: G001_PI_SOURCE_AUDIT
review_date: 2026-07-29
reviewer: architecture_control_session
source_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
review_disposition: ACCEPT_G001_CLOSEOUT
accepted_source_disposition: ACCEPT_FOR_DYNAMIC_VERIFICATION
final_pi_go: not_authorized
architecture_frozen: false
```

## Review Decision

**Recommendation.** Accept G001 as complete. Its static evidence is sufficient
to authorize preparation of a bounded deterministic dynamic Go Gate around the
public Direct `@earendil-works/pi-agent-core` `AgentHarness` surface.

This acceptance does not authorize final Pi Go, a formal Workbench, real-model
execution, a V0 architecture freeze, Policy effectiveness claims, or silent
fallback to Coding Agent SDK/RPC.

## Independently Rechecked Facts

- **Fact.** The upstream checkout remained at
  `027a5847901b5dde30270abaa1041046cd2b4b55` and returned only
  `## main...origin/main` from short branch status.
- **Fact.** `.upstream/pi/node_modules` and root `workbench/` were absent.
- **Fact.** `AgentHarness` is exported through
  `.upstream/pi/packages/agent/src/index.ts`, while `NodeExecutionEnv` is
  exported through the declared Node entry in `src/node.ts`.
- **Fact.** `AgentHarness.prompt()` provides an outer sequential promise; the
  implementation flushes pending session writes and awaits lifecycle listeners
  before that external call unwinds. The matching awaited-listener test is in
  `packages/agent/test/harness/agent-harness.test.ts`.
- **Fact.** Direct JSONL session creation accepts arbitrary header metadata and
  tests its round trip, so a project `run_id` can be attached without a Pi core
  patch.
- **Fact.** Upstream lifecycle documentation marks exact settled semantics,
  reentrancy hardening, automatic compaction/retry decision points and durable
  active-run recovery as unfinished.
- **Fact.** G001 did not install, build, test, call a provider, modify upstream,
  create `workbench/`, or commit.

## Accepted Interpretation

- **Inference.** Direct AgentHarness has the smallest statically credible
  boundary for the deterministic Completion Verification spike.
- **Recommendation.** Use it as the only primary G002 runtime surface.
- **Recommendation.** Retain Coding Agent SDK plus Inline Extension as the
  compatibility path that must later prove the same Policy Core can enter the
  real Pi usage path.
- **Recommendation.** Retain RPC only as a response to an observed in-process
  isolation/cancellation failure.
- **Unconfirmed.** Public emitted-package imports, exact two-cycle ordering,
  run/session correlation, event projection and environment equivalence remain
  dynamic questions.

## Corrections Applied to the Next Goal

G001's suggested G002 envelope is intentionally narrowed during acceptance:

1. No dependency or generated build output may be installed in the reference
   `.upstream/pi` checkout. G002 must create a disposable local clone under
   `.runs/g002/` at the same commit and hydrate only that clone.
2. The first dynamic gate combines the minimum causal path: public import,
   deterministic file task, Baseline observation, Candidate one-cycle
   recovery, event/session/verifier order, and normalized initial-manifest
   equivalence.
3. Settled-session reopen, Windows cancellation and crash-after-side-effect
   characterization are deferred to a later robustness goal after the primary
   protocol passes.
4. Windows PowerShell remains the execution environment. WSL is not introduced
   without a concrete Windows-specific blocker and a new architecture review.

## Remaining Preconditions

- **Fact.** The root repository has no commit yet, while the planned
  `RunManifest` contains `workbench_commit`.
- **Recommendation.** Create one user-authorized project baseline commit before
  G002 is activated. Until then the G002 contract remains a draft.
- **Unconfirmed.** Dependency hydration may require network approval in the
  new Goal Session.

## Verification Commands

The review used read-only commands, including:

```powershell
git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C .upstream/pi rev-parse HEAD
git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C .upstream/pi status --short --branch
Test-Path -LiteralPath '.upstream/pi/node_modules'
Test-Path -LiteralPath 'workbench'
git status --short --branch
```

It also read all G001 deliverables and closeout, the G001 contract, relevant
project-plan sections, Pi repository instructions, upstream lifecycle and
durability documents, and the complete key Direct harness/session source and
matching tests used for the material checks above.

## Time Interpretation

The reported Goal elapsed time of about 10 hours is wall-clock session time and
is not treated as evidence quality, compute time, cost, or productivity. The
acceptance is based only on the persisted evidence and independent source
checks.

