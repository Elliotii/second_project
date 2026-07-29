# ADR-0001 — Use Direct AgentHarness as the G002 Primary Runtime Candidate

```yaml
status: accepted_for_G002_only
date: 2026-07-29
decision_scope: deterministic_dynamic_go_gate
final_pi_go: not_authorized
v0_architecture_frozen: false
```

## Context

The original candidate used a Pi Coding Agent SDK Runner plus Inline Extension.
The pinned post-`v0.82.1` source adds a public Direct
`@earendil-works/pi-agent-core` `AgentHarness` with explicit model, tool,
session, environment, lifecycle and hook surfaces. G001 found no static hard
blocker to composing an external deterministic verifier after an awaited prompt
and submitting one recovery prompt through the same session.

The same audit found that Direct lifecycle semantics remain in progress and do
not provide durable in-flight operation recovery, a permission sandbox,
automatic agent-turn retry, or automatic compaction decisions.

## Decision

Use Direct `pi-agent-core` `AgentHarness` as the sole primary runtime candidate
for the G002 deterministic dynamic Go Gate.

The G002 driver must:

- orchestrate verification from an outer sequential caller after
  `await harness.prompt()`;
- keep the verifier outside the Agent tool registry;
- use one explicit Session carrying project `run_id` metadata;
- use an explicit Node execution environment and fixed tool/config profile;
- allow exactly one external recovery cycle only for Candidate;
- project only the minimum lifecycle facts into the project journal;
- pin Pi to commit `027a5847901b5dde30270abaa1041046cd2b4b55`.

## Consequences

- The earlier SDK Runner plus Inline Extension architecture is superseded as
  the experimental G002 runtime basis.
- It remains a required later compatibility option for proving the same Policy
  Core can enter Pi's real Coding Agent usage path.
- RPC/process is not implemented unless a specific observed failure shows that
  process isolation causally fixes the Direct path.
- A failed G002 gate returns to architecture review. It does not authorize an
  automatic switch to SDK, RPC, another runtime, or a Pi core patch.
- G002 remains a feasibility Spike and cannot produce Policy effect claims.

## Not Decided

- final Pi Go/No-Go;
- final V0 runtime architecture;
- Completion Verification schema or recovery budget;
- Outcome and invalid-run semantics;
- permission/sandbox strategy;
- real-model provider and budget;
- Eval validity, promotion or rollback thresholds.

## Evidence

- `docs/reports/G001_PI_SOURCE_AUDIT_REPORT.md`
- `docs/reports/G001_ARCHITECTURE_REVIEW.md`
- `docs/research/pi/source-map.md`
- `docs/research/pi/capability-matrix.md`
- `docs/research/pi/lifecycle-and-session.md`
- `docs/research/pi/open-questions.md`

## Review Triggers

Review this decision if:

- the emitted public package cannot be consumed without private imports;
- the exact bounded two-cycle protocol does not settle deterministically;
- session/run/event correlation requires a broad core patch;
- Baseline and Candidate initial environments cannot be normalized;
- a real Pi usage path cannot reuse the same Policy Core;
- the pinned Pi commit changes.

