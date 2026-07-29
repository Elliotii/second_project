# ADR-0003 — Retain Direct AgentHarness for the Next Bounded Robustness Checkpoint

```yaml
status: accepted_for_next_bounded_robustness_checkpoint
date: 2026-07-29
decision_scope: post_G003_deterministic_robustness_preparation
runtime_basis: Direct_pi_agent_core_AgentHarness
final_pi_go: not_authorized
phase_3: not_authorized
formal_workbench: not_authorized
v0_architecture_frozen: false
```

## Context

ADR-0001 selected Direct AgentHarness only for a deterministic dynamic Go Gate.
G002 stopped at a setup boundary. ADR-0002 authorized an integrity-pinned
model-data recovery, and G003 then passed standard emitted-package setup and
all five frozen dynamic Gates.

G003 proves the minimum Direct path can compose an external deterministic
verifier and one same-Session recovery cycle. It does not cover the durability,
cancellation, packaging and real-path questions needed before a V0
architecture decision.

## Decision

Retain public Direct `@earendil-works/pi-agent-core` AgentHarness as the primary
experimental runtime for preparation of the next bounded deterministic
robustness checkpoint.

This extends ADR-0001 beyond the G002/G003 feasibility Gate. It does not grant
final Pi Go and does not authorize execution of G004 until a separate Goal
Contract is reviewed, committed as `ready_to_start`, and activated from a clean
project baseline.

## Consequences

- The project may prepare a narrow robustness contract around the same pinned
  Pi commit, public emitted imports, Direct Harness, NodeExecutionEnv, Session
  and external verifier boundary.
- The Coding Agent SDK plus Inline Extension remains a later compatibility
  comparator; it is not adopted or executed by this ADR.
- RPC/process remains conditional on an observed isolation need; no such need
  was established by G003.
- No Pi core patch, WSL, container, real model or formal Workbench is added.
- Completion Verification remains a candidate Policy; the fixed faux pass is
  not effectiveness or promotion evidence.

## Risks Carried Forward

- strict third-party declarations fail with `skipLibCheck: false` in the G003
  consumer environment;
- cold Windows public-import latency is not characterized;
- settled Session reconstruction in a new process is unverified;
- Windows long-running tool cancellation is unverified;
- crash-after-side-effect durability, real-model behavior and SDK compatibility
  remain deferred.

## Not Decided

- exact G004 scope, commands, fixtures and pass/fail thresholds;
- final Pi Go/No-Go or V0 runtime architecture;
- Phase 3 or formal Workbench authorization;
- real-model provider, credentials or budget;
- Outcome/Failure Taxonomy, invalid-run semantics or recovery budget;
- Policy evaluation, promotion or rollback thresholds.

## Evidence

- `docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_REPORT.md`
- `docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_CLOSEOUT.md`
- `docs/reports/G003_ARCHITECTURE_REVIEW.md`
- `spikes/pi-runtime/g003/`
- `fixtures/tasks/g003-completion-recovery/`

## Review Triggers

Review this ADR if the pinned Pi commit changes; a strict consumer or cold
import blocks the intended project environment; Session reconstruction or
Windows cancellation fails causally; the same Policy Core cannot enter the
real Coding Agent path; or a later Goal requires a source patch, private import
or materially broader runtime boundary.
