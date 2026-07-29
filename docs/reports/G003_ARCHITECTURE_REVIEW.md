# G003 Architecture Review

```yaml
reviewed_goal: G003_PI_DIRECT_HARNESS_GO_GATE_RETRY
review_date: 2026-07-29
reviewer: architecture_control_session
project_commit: 3723626a63bae69b3932f2ef48f54de2235b5460
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
review_disposition: ACCEPT_G003_PASS_DIRECT_GO_GATE_WITH_NON_BLOCKING_CORRECTIONS
accepted_goal_disposition: PASS_DIRECT_GO_GATE
next_runtime_status: accepted_for_next_bounded_robustness_checkpoint
final_pi_go: not_authorized
phase_3: not_authorized
formal_workbench: not_authorized
architecture_frozen: false
policy_effect_claims: not_authorized
```

## Review Decision

**Recommendation.** Accept G003 as complete and accept its
`PASS_DIRECT_GO_GATE` for the next separately contracted, bounded checkpoint.

**Inference.** At the fixed Pi commit and on the recorded Windows host, the
public Direct `@earendil-works/pi-agent-core` AgentHarness is dynamically
credible as the primary experimental runtime for deterministic reliability
work. It can run a fixed task programmatically, expose the required lifecycle,
link Session and project run identity, permit an external verifier after
settlement, and accept exactly one same-Session recovery prompt without a Pi
patch, private import, hidden TUI state, SDK/RPC fallback or custom emitted
package.

This acceptance is narrower than final Pi Go. It does not establish real-model
behavior, Policy effectiveness, production cancellation/recovery semantics,
strict third-party declaration completeness, Phase 3 compatibility or V0
architecture readiness.

## Independently Rechecked Facts

- **Fact.** The exact tarball SHA-1 and SHA-512 match ADR-0002; its inventory
  contains 712 regular members and the selected/restored data inventories each
  contain 38 files.
- **Fact.** Architecture control recomputed every restored file's SHA-256; all
  38 match the persisted inventory. The restored manifest SHA-256 is
  `c2d89b03ccb2c095c59ead0437592b21e9676d049ad8e92ea90a466adf10b24d`.
- **Fact.** The public runtime import was independently rerun and resolved the
  package root and `/node` subpath to local emitted `packages/agent/dist/*.js`.
- **Fact.** TypeScript declaration resolution was independently rerun and
  resolved both public entries to local emitted `dist/*.d.ts`; the focused
  Spike typecheck exited 0.
- **Fact.** The strict `skipLibCheck: false` diagnostic was reproduced and
  fails only in third-party declarations: Anthropic SDK references missing
  `undici-types` paths, and Google GenAI references a missing MCP SDK module.
- **Fact.** The tracked G003 driver automatically asserts Baseline/Candidate
  provider-call caps, prompt/verifier counts, exact Journal arrays, Session
  parent chains, tool-call correlation, same Candidate Session ID and
  normalized initial-manifest equality.
- **Fact.** Persisted Baseline evidence records one prompt, two faux calls, one
  failed verifier and no recovery. Candidate evidence records two prompts,
  four faux calls, exactly two verifier runs and a final pass.
- **Fact.** Root `HEAD` remained the activation commit; `.upstream/pi` and the
  isolated Pi clone remained clean in tracked state; `workbench/` remained
  absent.

## Contract Correction

The initial report called an upstream harness test “observed” even though G003
read but did not execute that upstream test. This contradicted the contract's
evidence-label rule. The report now says the matching source test was read but
not executed.

**Inference.** This was a documentation defect, not a dynamic evidence defect:
the G003 Spike itself directly exercised and asserted the relevant settlement,
same-Session recovery and event-order behavior.

## Accepted Gate Interpretation

| Gate | Accepted meaning | Not established |
|---|---|---|
| A | Required public runtime and declaration entries work from the standard local emitted packages. | A fully isolated strict consumer has complete third-party declaration dependencies; cold import latency is characterized. |
| B | Baseline deterministically stops after one failed verification with no recovery. | Statistical behavior or real-model failure rates. |
| C | One outer verifier failure can trigger exactly one same-Session recovery cycle that passes the fixed task. | Recovery efficacy beyond the scripted faux case or budgets beyond one cycle. |
| D | The minimum external Journal can correlate settled cycles, verifier activity and Pi Session/tool-call order. | Crash durability, cross-process reconstruction or final Event schema. |
| E | Baseline and Candidate initial fixed-task conditions normalize equal under the frozen manifest. | Full experiment validity over a task suite or real provider state. |

## Non-Blocking Risks Retained

1. A strict consumer with `skipLibCheck: false` currently fails in third-party
   declaration dependencies. This is a packaging/toolchain risk and must not be
   represented as resolved by Gate A.
2. One cold 15-second public import timed out before the canonical 60-second
   run completed quickly. Cold-start behavior remains uncharacterized.
3. The generated registry metadata record restates compared values instead of
   retaining the raw registry response. Future provenance tooling should save
   the raw response and a separate comparison result.
4. G003 is a single fixed faux task. It proves composition and control flow,
   not Policy effect or model responsiveness.

## Next Bounded Checkpoint

**Recommendation.** Prepare a G004 contract only after the complete G003
evidence and this review are committed as a clean project baseline. Candidate
G004 subjects, to be narrowed during contract review, are:

- settled Session reconstruction in a new process;
- Windows cancellation of a bounded long-running tool;
- strict emitted-package consumer dependency characterization;
- repeatable cold public-import timing under explicitly reset conditions.

G004 preparation does not authorize its execution. Crash-after-side-effect,
real models, Coding Agent SDK compatibility, Phase 3 and the formal Workbench
remain separate decisions unless a future contract explicitly includes them.

## Required Evidence Baseline

Before another Goal Session starts:

1. commit the G003 Spike, Fixture, report, closeout, this review, ADR-0003 and
   the matching `CURRENT_STATE.md` update;
2. preserve `.runs/g003` as ignored generated evidence;
3. start the next Goal only from a clean committed root `HEAD` and its own
   accepted Goal Contract.

No Git commit is authorized by this review itself.

## Verification Commands

Architecture control used read-only checks including:

```powershell
Get-FileHash .runs/g003/source/earendil-works-pi-ai-0.82.1.tgz -Algorithm SHA512
Get-FileHash .runs/g003/source/earendil-works-pi-ai-0.82.1.tgz -Algorithm SHA1
Get-FileHash .runs/g003/pi/packages/ai/src/providers/data/.manifest.json -Algorithm SHA256
node spikes/pi-runtime/g003/run-with-timeout.mjs 60000 node spikes/pi-runtime/g003/public-import-smoke.mjs
node spikes/pi-runtime/g003/run-with-timeout.mjs 60000 node spikes/pi-runtime/g003/resolve-public-types.mjs
node spikes/pi-runtime/g003/run-with-timeout.mjs 60000 node .runs/g003/pi/node_modules/typescript/bin/tsc -p spikes/pi-runtime/g003/tsconfig.json --noEmit
```

It also read the complete G003 contract, report, closeout, tracked Spike and
Fixture, relevant plan sections, command ledger, Gate evidence, manifests and
Pi Session JSONL records. It did not rerun the one-shot Gates B-E because their
contracted workspaces and evidence roots intentionally require absence; their
implementation, persisted output and Session records were independently
cross-checked instead.
