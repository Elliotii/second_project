# G003 Pi Direct AgentHarness Go Gate Retry Report

```yaml
goal_id: G003_PI_DIRECT_HARNESS_GO_GATE_RETRY
disposition: PASS_DIRECT_GO_GATE
project_commit: 3723626a63bae69b3932f2ef48f54de2235b5460
pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
release_artifact: "@earendil-works/pi-ai@0.82.1"
execution_platform: Windows_native_PowerShell
completed_at: 2026-07-29
gates_executed: [A, B, C, D, E]
real_model_used: false
live_model_data_generation_used: false
wsl_container_sdk_rpc_extension_used: false
upstream_reference_modified: false
git_commit_created: false
final_pi_go: not_authorized
```

## Disposition

`PASS_DIRECT_GO_GATE`

**Fact.** All Activation Preconditions passed. The exact integrity-pinned npm
artifact supplied only `dist/providers/data/`; the pinned source validator and
both standard targeted builds passed; Gates A-E passed with bounded commands.

**Inference.** At the pinned commits and on this Windows host, the public Direct
`@earendil-works/pi-agent-core` `AgentHarness` can support the smallest honest
two-cycle Completion Verification feasibility protocol without a Pi core patch,
private import, SDK/RPC fallback, real model, or custom package build.

**Recommendation.** Architecture control should accept this dynamic Go Gate as
evidence for the next bounded checkpoint. This report does not authorize final
Pi Go, Phase 3, a formal Workbench, a V0 architecture freeze, or Policy effect
claims.

## Activation Preconditions

| Check | Evidence | Result |
|---|---|---|
| Committed root `HEAD` | `3723626a63bae69b3932f2ef48f54de2235b5460` | Pass |
| Root worktree clean at activation | porcelain status empty | Pass |
| Committed G003 contract ready | committed file contains `status: ready_to_start` | Pass |
| Required committed controls | ADR-0002, G002 report/closeout and accepted G002 architecture review present | Pass |
| Reference Pi | exact `027a5847901b5dde30270abaa1041046cd2b4b55`, clean, origin `https://github.com/earendil-works/pi.git` | Pass |
| Fresh execution root | `.runs/g003` absent | Pass |
| Forbidden formal app | root `workbench/` absent | Pass |
| Windows tools | Node `v24.14.1`; npm `11.11.0`; Git `2.53.0.windows.3`; Windows PowerShell 5.1 | Pass |

The first root Git reads were rejected by Git's Windows dubious-ownership
check. **Fact.** Retrying with command-local
`-c safe.directory=D:/AI/AI_Projects/project2` passed; no global Git
configuration was changed.

## Required Source Basis

All project controls, decisions, prior reports, open questions, relevant plan
sections and both applicable Pi `AGENTS.md` files were read completely before
setup/implementation.

Material Pi claims use the pinned isolated source:

- **Fact.** `.runs/g003/pi/packages/agent/src/harness/agent-harness.ts`, symbols
  `AgentHarness.prompt()`, `executeTurn()`, `handleAgentEvent()` and
  `waitForIdle()`, establish the outer settlement boundary and same-Session
  second prompt. Matching source test, read but not executed by G003:
  `packages/agent/test/harness/agent-harness.test.ts`, test
  `waitForIdle waits for external run settlement and awaited listeners`.
- **Fact.** `.runs/g003/pi/packages/ai/src/providers/faux.ts`, symbols
  `fauxProvider()`, `createFauxCore()`, `state.callCount` and the response queue,
  provide the local fixed script and exact provider-call counter. Matching
  harness use is in `packages/agent/test/harness/agent-harness.test.ts`.
- **Fact.** `.runs/g003/pi/packages/agent/src/harness/session/jsonl-repo.ts`,
  symbol `JsonlSessionRepo.create()`, persists `metadata`; matching test:
  `packages/agent/test/harness/storage.test.ts`, test
  `round-trips custom header metadata`.
- **Fact.** `.runs/g003/pi/packages/agent/src/harness/env/nodejs.ts`, class
  `NodeExecutionEnv`, provides the explicit CWD filesystem used by the one
  write tool. Its tool-context use is matched by
  `agent-harness.test.ts`, test `passes a static application context to harness tools`.
- **Fact.** `.runs/g003/pi/packages/agent/src/types.ts`, union `AgentEvent`, and
  `.runs/g003/pi/packages/agent/src/harness/types.ts`, union
  `AgentHarnessEvent`, define the projected tool and settled events.

## Isolated Setup and Artifact Provenance

### Clone and dependencies

**Fact.** The clone command was:

```powershell
git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi/.git clone --local --no-hardlinks .upstream/pi .runs/g003/pi
git -c safe.directory=D:/AI/AI_Projects/project2/.runs/g003/pi -C .runs/g003/pi checkout --detach 027a5847901b5dde30270abaa1041046cd2b4b55
```

Both exited 0. The clone had no alternates; a representative pack/index had
only its `.runs/g003/pi` hardlink path. Exact `HEAD`, empty tracked status and
the local reference remote were verified before install.

```powershell
npm.cmd ci --ignore-scripts
```

Exit 0: 328 packages added, 342 audited, with 3 high-severity vulnerabilities.
No lifecycle script, audit fix, upgrade or dependency mutation ran. Registry
was `https://registry.npmjs.org/`; cache was
`C:\Users\HUAWEI\AppData\Local\npm-cache`.

### Release-boundary compatibility

**Fact.** Release commit `b4f293684bba718d59cc1157679bcf6157b3a7f5`
exists locally, is tag `v0.82.1`, and is 40 commits before the pinned test
commit. This exact comparison exited 0 with empty output:

```powershell
git diff --name-status --exit-code b4f293684bba718d59cc1157679bcf6157b3a7f5..027a5847901b5dde30270abaa1041046cd2b4b55 -- packages/ai/package.json packages/ai/scripts/check-model-data.ts packages/ai/scripts/model-data.ts packages/ai/src/models.generated.ts packages/ai/src/providers/*.models.ts packages/ai/src/providers/all.ts
```

### Exact npm artifact

The exact registry query returned values equal to every frozen field:

```yaml
name: "@earendil-works/pi-ai"
version: "0.82.1"
tarball: "https://registry.npmjs.org/@earendil-works/pi-ai/-/pi-ai-0.82.1.tgz"
integrity: "sha512-3WFYRhEp3lQB3444EhPMBcM7zSaEUE3eJgHOR7s4081NLqbw/FsWilIKWXSua0Gv3sRr7m9xMidR3pPDE7jI/A=="
shasum: "02ebdfc2997fd88ca1f51a7b5c01f337a9462f34"
gitHead: "b4f293684bba718d59cc1157679bcf6157b3a7f5"
```

**Fact.** `.runs/g003/evidence/registry-metadata.json` restates the six
validated frozen values rather than preserving the raw `npm view` JSON. The
command ledger records the exact query and its successful equality result, and
the independently verified tarball SHA-512 and SHA-1 bind the payload actually
used. This is an audit-capture limitation, not an artifact-integrity failure.

```powershell
npm.cmd pack @earendil-works/pi-ai@0.82.1 --ignore-scripts --pack-destination .runs/g003/source --registry=https://registry.npmjs.org
```

Exit 0 created exactly one tarball. `verify-artifact.mjs` independently checked
tar header checksums, SHA-512, SHA-1 and path/type safety before extraction.

**Fact.** The archive contains 712 regular members in total and exactly 38
selected members under `package/dist/providers/data/`: `.manifest.json` plus
37 direct provider `.json` files. There were no selected links, devices,
absolute/drive-qualified paths, backslashes, `..` segments, nested directories
or unexpected extensions.

**Fact.** The embedded manifest is schema 3, generated at
`2026-07-25T12:44:19.521Z`, with structure hash
`1a3c7cf59ada71c94abe4540976960524ee933034491c75d6418e2abc1b42535`.
Its verbatim restored SHA-256 is
`c2d89b03ccb2c095c59ead0437592b21e9676d049ad8e92ea90a466adf10b24d`.

The complete archive inventory, selected inventory, verbatim manifest and all
38 `{relativePath,size,sha256}` restore records are in
`.runs/g003/evidence/`. The staged restore command was:

```powershell
node spikes/pi-runtime/g003/stage-model-data.mjs D:/AI/AI_Projects/project2
```

Exit 0. It parsed the verified tarball again, wrote only
`package/dist/providers/data/**` under `.runs/g003/staging`, required the Pi
target to be absent, copied only that data directory, and byte-compared all 38
restored files. It did not execute artifact code.

### Pinned validation and standard builds

All commands exited 0, and tracked Pi status was empty after each:

```powershell
npm.cmd run check:model-data --workspace=@earendil-works/pi-ai
# Generated model data is valid.

npm.cmd run build:offline --workspace=@earendil-works/pi-ai
# standard check:model-data + tsgo + data copy completed

npm.cmd run build --workspace=@earendil-works/pi-agent-core
# tsgo -p tsconfig.build.json
```

No root/full build, live generator, Pi source edit, custom/partial build or
unrelated workspace build ran.

## Gates

| Gate | Result | Bounded evidence |
|---|---|---|
| A — public emitted import | Pass | Runtime root and `/node` resolved to local `packages/agent/dist/*.js`; TypeScript resolver resolved local `dist/*.d.ts`; four required constructors imported; only two local package-root junctions existed. |
| B — Baseline | Pass | First prompt settled, verifier failed once, Baseline stopped; 1 prompt, 2 faux calls, 1 verifier; two recovery responses remained unused. |
| C — Candidate | Pass | Same Harness and Session accepted exactly one structured verifier-failure `prompt()`; second verifier passed; 2 prompts, 4 faux calls, 2 verifier runs. |
| D — order/correlation | Pass | Expected external journal arrays matched exactly; Session roles and parent chain matched; stable run/session/tool-call IDs correlated. |
| E — fairness | Pass | Initial normalized manifests differed only in run ID, policy variant and absolute workspace; both fixture tree digests were `6e38ca960835befd7f089c9f60260098679a380a4eae0c9a7526578a734e5643`. |

### Gate A details

The independent consumer metadata declares only:

```json
{
  "@earendil-works/pi-agent-core": "file:../pi/packages/agent",
  "@earendil-works/pi-ai": "file:../pi/packages/ai"
}
```

Both were Windows junctions to the locally built package roots. The canonical
commands each had a 60-second outer timeout and exited 0:

```powershell
node spikes/pi-runtime/g003/run-with-timeout.mjs 60000 node spikes/pi-runtime/g003/public-import-smoke.mjs
node spikes/pi-runtime/g003/run-with-timeout.mjs 60000 node spikes/pi-runtime/g003/resolve-public-types.mjs
node spikes/pi-runtime/g003/run-with-timeout.mjs 60000 node .runs/g003/pi/node_modules/typescript/bin/tsc -p spikes/pi-runtime/g003/tsconfig.json --noEmit
```

Runtime stdout:

```json
{"resolved":{"root":"file:///D:/AI/AI_Projects/project2/.runs/g003/pi/packages/agent/dist/index.js","node":"file:///D:/AI/AI_Projects/project2/.runs/g003/pi/packages/agent/dist/node.js"},"exports":["AgentHarness","JsonlSessionRepo","Session","NodeExecutionEnv"]}
```

Declaration resolver stdout:

```json
{"@earendil-works/pi-agent-core":"D:/AI/AI_Projects/project2/.runs/g003/pi/packages/agent/dist/index.d.ts","@earendil-works/pi-agent-core/node":"D:/AI/AI_Projects/project2/.runs/g003/pi/packages/agent/dist/node.d.ts"}
```

No private `src/` import, TypeScript path alias, custom export or published
agent fallback was used.

Two non-canonical diagnostics are preserved rather than hidden:

- a cold 15-second import attempt timed out; the timeout wrapper itself passed
  a 5-second zero-dependency calibration, and the canonical 60-second import
  subsequently completed in 0.52 seconds;
- an initial `skipLibCheck: false` consumer check exited 1 inside third-party
  declarations: `@anthropic-ai/sdk` could not resolve `undici-types`, and
  `@google/genai` could not resolve `@modelcontextprotocol/sdk`. The independent
  resolver still proved Pi's declarations came from emitted `dist`, and the
  focused consumer/Spike typecheck passed with `skipLibCheck: true`.

**Inference.** These are packaging/toolchain risks for a stricter future
consumer, but they did not require a private import, Pi edit or alternate
package boundary and therefore do not negate Gate A's frozen pass criteria.

### Gates B-D dynamic evidence

The single narrow command had Node test timeout 45 seconds and outer timeout 60
seconds:

```powershell
node spikes/pi-runtime/g003/run-with-timeout.mjs 60000 node --test spikes/pi-runtime/g003/gates.test.ts
```

Exit 0: 1 test, 1 pass, 0 fail, total 546.653 ms.

Baseline projected Journal:

```text
run_started → session_linked → agent_cycle_started(initial)
→ tool_execution_start → tool_execution_end → agent_settled
→ verifier_started → verifier_completed(failed) → policy_decision(stop)
→ run_completed
```

Baseline Session roles were exactly
`user, assistant(tool-use), toolResult, assistant(final)`.

Candidate projected Journal added exactly:

```text
continuation_queued → agent_cycle_started(verification_recovery)
→ tool_execution_start → tool_execution_end → agent_settled
→ verifier_started → verifier_completed(passed) → run_completed
```

Candidate Session roles were exactly two consecutive copies of
`user, assistant(tool-use), toolResult, assistant(final)`. Tool-call IDs
`g003-initial-write` and `g003-recovery-write` matched assistant tool-use,
tool-result and journal records. Every projected event carried the same run and
session IDs for its run. Raw model content and token deltas were not copied to
the project journal.

### Gate E manifest evidence

Both initial manifests include project/Pi commits, artifact version/integrity
and restored-manifest hash, fixture tree digest, complete faux script and hash,
model/provider, thinking level, prompt hashes, tool schema/active set, stream
and retry options, allowed environment keys, and verifier/assertion identity.

**Fact.** The test replaced only `runId`, `policyVariant` and absolute
`workspace` with canonical placeholders; the remaining canonical JSON was
byte-equal. Both reset workspaces contained only the same initial
`answer.txt` bytes before either run.

## Tracked Deliverables

- `spikes/pi-runtime/g003/`: provenance verification, staged data-only restore,
  timeout runner, public import/type smoke, Direct adapter/driver, verifier,
  event projector, manifest comparison and one narrow test.
- `fixtures/tasks/g003-completion-recovery/`: one allowed output, exact
  assertion and byte-equivalent reset procedure.
- This report.
- `docs/reports/G003_PI_DIRECT_HARNESS_GO_GATE_RETRY_CLOSEOUT.md`.
- Updated `CURRENT_STATE.md`.

Generated dependencies, tarball, restored data, builds, package links,
workspaces, sessions, manifests and run evidence remain under ignored
`.runs/g003/`.

## Final Integrity

**Fact.** Final checks reconfirmed:

- root `HEAD` is still `3723626a63bae69b3932f2ef48f54de2235b5460`;
- `.upstream/pi` remains clean at
  `027a5847901b5dde30270abaa1041046cd2b4b55`;
- `.runs/g003/pi` has no tracked changes;
- root `workbench/` is absent;
- no Git commit was created by G003;
- no real provider/model, live catalog generator, WSL, container, SDK,
  extension, RPC or custom Pi build path was used.

## Unconfirmed

- Current/live provider catalog correctness or availability.
- Strict third-party declaration compatibility with `skipLibCheck: false` in a
  separately installed consumer.
- Cold public-root import latency on a fully cold Windows filesystem.
- Settled-session reconstruction in a new process.
- Windows long-running shell cancellation.
- Crash after tool side effect but before result persistence.
- Coding Agent SDK/Inline Extension compatibility and RPC isolation.
- Any real-model behavior or feasibility.
- Final Run/Event/Outcome schema, Failure Taxonomy and invalid-run semantics.
- Recovery budgets beyond the one fixed feasibility cycle.
- Policy effect, Eval validity and promotion thresholds.

## Required Next Review

**Recommendation.** Architecture control should review the complete G003
evidence and decide whether to accept `PASS_DIRECT_GO_GATE` for the next
bounded project phase. No deferred architecture or user-owned semantic choice
was made in this Goal Session.
