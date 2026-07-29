# G006 Stage 1 Gate 0 Implementation and Offline Review

> Date: 2026-07-29
> Goal: `G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY`
> Checkpoint disposition: `PASS_GATE_0_AWAITING_IMPLEMENTATION_BASELINE_COMMIT_AUTHORIZATION`
> External provider calls: `0`
> Credential loaded or inspected: `false`

## 1. Decision summary

**Fact.** G006 Stage 1 produced a separate `spikes/pi-runtime/g006/`
implementation and a fresh ignored `.runs/g006/` setup root. It did not change
`spikes/pi-runtime/g005/`, `.runs/g005/`, `.upstream/pi/` or Pi Core.

**Fact.** The two known G005 project-side evidence defects have bounded,
offline-tested corrections:

1. `after_provider_response` is observed in the public
   `AgentHarness.subscribe(...)` event stream and correlated with provider
   requests and assistant messages;
2. Journal schema v2 uses a closed outer envelope and places event-specific
   fields under `data`, so an inner domain `type` cannot overwrite the outer
   event type.

**Fact.** Public emitted-package imports, emitted declaration resolution,
strict TypeScript validation, the Faux Provider observer regression, Journal
schema regression, attribution regression, full source inventory, G005 input
identity, reasoning redaction and the fixed Verifier fixture all passed.

**Inference.** The G006 implementation is suitable for a clean implementation
baseline commit. This is a source-and-offline-mechanism judgment, not evidence
that the DeepSeek route or Completion Verification policy succeeds.

**Recommendation.** Accept Gate 0 and authorize one bounded implementation
baseline commit containing the G006 source, this report, the truthful control
file updates and no ignored run artifacts or `reference/` content. After that
commit, record the reviewed clean `HEAD` and source digest. Stage 2 must remain
stopped until it receives a separate explicit authorization.

## 2. Authorization and stop boundary

The accepted-contract baseline was committed before implementation:

```yaml
accepted_contract_baseline_commit: aa2d12f701f4cecbc963a854e00a1d5bf312d77c
commit_message: "docs: accept G006 clean retry contract"
stage_1_gate_0_authorized: true
stage_2_real_model_execution_authorized: false
real_model_call_authorized: false
additional_git_commit_authorized: false
```

No command in this checkpoint used `--env-file`, imported `.env.g005`, ran
`gate-a.ts`, ran `driver.ts`, or called an external model. The following remain
absent:

```yaml
.runs/g006/attempt-001: absent
.runs/g006/preflight/reviewed-implementation.json: absent
.runs/g006/preflight/gates/gate-a-stage2.json: absent
workbench/: absent
```

The Faux Provider test made two deterministic in-process Faux calls. Those are
test doubles and are not external provider calls.

## 3. Pinned Pi source finding

**Fact.** In the pinned Pi checkout at
`027a5847901b5dde30270abaa1041046cd2b4b55`:

- `.upstream/pi/packages/agent/src/harness/agent-harness.ts`, symbol
  `AgentHarness.emitOwn()` at line 229, dispatches own events to the wildcard
  subscriber set;
- the same file, symbol `AgentHarness.createStreamFn()` around lines 405-420,
  sends `after_provider_response` through `emitOwn(...)`;
- the same file, symbols `AgentHarness.subscribe()` and `AgentHarness.on()`
  around lines 1058-1082, register wildcard and named handlers separately;
- `.upstream/pi/packages/agent/src/harness/types.ts`,
  `AfterProviderResponseEvent` around line 614 and
  `AgentHarnessEventResultMap` around line 799, expose the event in public
  types.

**Inference.** On this pinned source, `subscribe(...)` is the correct public
observation surface for `after_provider_response`. A Pi Core patch is neither
needed nor authorized. G006 deliberately does not repair or reinterpret the
upstream type/dispatch inconsistency.

## 4. Permitted implementation delta

The independent G006 Spike retains the G005 task, fixture, public test,
acceptance test, model profile, three restricted tools, external Verifier
semantics, Baseline/Candidate policy and hard budgets. The accepted delta is
limited to evidence validity and clean-attempt provenance:

| Area | G006 mechanism | Review conclusion |
| --- | --- | --- |
| Response observation | `observer.ts` consumes `after_provider_response`, assistant, Tool and settled events through one subscriber | Matches pinned dispatch behavior |
| Correlation | Per-cycle request, response, assistant, response-ID, Tool and settled counters | Count disagreement is evidence invalidity rather than route failure |
| Journal | `journal.ts` schema v2 closed envelope with nested `data` | Prevents the G005 outer-type collision |
| Attribution | `attribution.ts` separates setup, external-service, instrumentation, provenance, route and task-outcome classes | Prevents the G005 false route interpretation |
| Source identity | `provenance.ts` inventories every regular G006 source file except the ignored top-level `node_modules` junction | Supports exact reviewed-source binding |
| Attempt identity | `record-reviewed-implementation.ts` and driver preconditions bind a later attempt to a clean tracked `HEAD` and source digest | Cannot be finalized until an authorized commit exists |
| Attempt isolation | Write-once `.runs/g006/attempt-001` marker precedes workspaces and evidence | Prevents accidental append or reuse |
| Artifact proof | `artifact-preflight.mjs` revalidates archive identity, safety and model data | Reuses the accepted emitted-package boundary without registry re-download |

The main-session source review found no blocking defect in this bounded delta.
In particular, the driver checks source identity before Baseline and Candidate,
keeps the external Verifier after each settled cycle, injects at most one
Candidate recovery prompt after a failed initial Verifier, and writes a
classified failure only after the current process owns the fresh attempt root.

## 5. Fresh isolated Pi and artifact boundary

**Fact.** Setup used Windows-native Node `v24.14.1` and npm `11.11.0`.

**Fact.** `.runs/g006/pi` was created as a local clone with
`--no-hardlinks`, checked out detached at the pinned commit, hydrated with
install scripts disabled, and remained Git-clean after the standard builds.
`fsutil hardlink list` reported separate single paths for the upstream and
G006 `package.json` files.

Executed setup commands and results:

```text
git clone --local --no-hardlinks .upstream/pi .runs/g006/pi
git -C .runs/g006/pi checkout --detach 027a5847901b5dde30270abaa1041046cd2b4b55
npm.cmd ci --ignore-scripts                         PASS
node spikes/pi-runtime/g006/stage-model-data.mjs D:/AI/AI_Projects/project2
                                                    PASS (38 files)
npm.cmd run check:model-data --workspace=@earendil-works/pi-ai
                                                    PASS
npm.cmd run build:offline --workspace=@earendil-works/pi-ai
                                                    PASS
npm.cmd run build --workspace=@earendil-works/pi-agent-core
                                                    PASS
```

The exact copied release artifact passed G006's independent preflight:

```yaml
package: "@earendil-works/pi-ai@0.82.1"
integrity: "sha512-3WFYRhEp3lQB3444EhPMBcM7zSaEUE3eJgHOR7s4081NLqbw/FsWilIKWXSua0Gv3sRr7m9xMidR3pPDE7jI/A=="
shasum: "02ebdfc2997fd88ca1f51a7b5c01f337a9462f34"
sha256: "2f9df9522808b621cd3449876537f03d8a8df8b8d7ec2d5b18c6a910aa85b490"
gitHead: b4f293684bba718d59cc1157679bcf6157b3a7f5
archive_members: 712
selected_model_data_files: 38
restored_manifest_sha256: c2d89b03ccb2c095c59ead0437592b21e9676d049ad8e92ea90a466adf10b24d
archive_safety: pass
```

The restored manifest hash equals the archived manifest and the preserved G005
manifest hash. `gitHead` is supported by the frozen G005 registry metadata;
the package archive itself does not contain that field.

**Fact.** The first local invocation of the new artifact preflight stopped
before writing evidence because its draft assertion incorrectly expected
`gitHead` inside the archived `package.json`. The implementation was corrected
to verify package name/version from the archive and `gitHead` from the frozen
registry metadata; the next invocation passed. This was a zero-call offline
implementation correction and did not create the attempt root.

**Fact.** The registry raw response is still not retained. Consistent with the
accepted risk reclassification, this remains a non-blocking provenance gap and
does not affect Gate 0.

**Fact.** During initial Spike copying, PowerShell followed the G005
`node_modules` junction and created a real copied directory. Before any test or
attempt, that exact generated directory was moved to the ignored
`.runs/g006/preflight/copied-g005-node-modules-quarantine` path. The active
G006 package links are now junctions only to the fresh G006 Pi packages. G005
was not changed. The quarantine is setup debris, not attempt evidence, and is
excluded from source identity.

**Known issue.** `npm ci` reported three high-severity audit findings from the
current npm advisory data. No audit remediation, dependency upgrade or lockfile
change was authorized or performed. This does not change the pinned source or
Gate 0 mechanism result, but it should remain visible as dependency provenance
and maintenance information rather than be misclassified as a Harness route
failure.

## 6. Offline Gate 0 verification

The final source state was checked with these commands:

```text
node spikes/pi-runtime/g006/public-import-smoke.mjs
node spikes/pi-runtime/g006/resolve-public-types.mjs
.runs/g006/pi/node_modules/.bin/tsc.cmd -p spikes/pi-runtime/g006/tsconfig.json
node --test spikes/pi-runtime/g006/gates.test.ts
```

Results:

| Check | Result |
| --- | --- |
| Public runtime import | PASS; AgentHarness, Session, DeepSeek and Faux resolve from G006 Pi `dist` |
| Public declaration resolution | PASS; all three declarations resolve from emitted `dist` |
| Strict TypeScript consumer | PASS, exit 0 |
| Offline tests | PASS, 8/8 |

The eight offline tests establish:

1. the frozen DeepSeek descriptor and restricted-tool shape;
2. a public Faux Provider `AgentHarness` cycle with two requests, two
   subscriber responses, two successful assistant messages with response IDs,
   one matching Tool start/end and one settled event;
3. stable Journal v2 outer event types with nested domain types;
4. distinct instrumentation, external-service, route and task attribution;
5. deterministic complete G006 source inventory;
6. byte identity with G005 for task, fixture and acceptance inputs;
7. in-memory reasoning continuity with reasoning body redaction on disk;
8. fixed fixture public-pass/external-fail behavior and a passing known repair.

## 7. Gate 0 source identity

The uncommitted Gate 0 source identity is:

```yaml
file_count: 28
tree_digest: c99e84ba09318a73482a2d790e10eb63e3a2240d0b0c209a843112ff62c82af4
credential_loaded: false
external_provider_calls_at_write: 0
```

Selected critical hashes:

| File | SHA-256 |
| --- | --- |
| `driver.ts` | `957dcbed942b5f0cca075da11c3cca35d421b2371b4a1e999648ac9d61967915` |
| `observer.ts` | `e320b7219cec39f63a78758fa33f0add2a84caa9fa02440478f8c42e0680895c` |
| `journal.ts` | `aa269deb6d134ab84203c93a1cab5fed1a533c0b641e300b9abf30bbb3e82f85` |
| `attribution.ts` | `e49b810773627f2d89d4ec4dd56b88ffb668a737cb9d55e1db463a24900ed234` |
| `provenance.ts` | `4f1a5dedca5aa7b9ff5891d0427d4ea64812083064d92d034f84d3c01b531250` |
| `gates.test.ts` | `7999c6dc8a7284ac39d7f10f4610865fc6084d6b6391afc7dc329199ae6e4c61` |
| `acceptance/acceptance.test.ts` | `fcc7eba0e387f812c895b5255d2a98acc6e1c41122c60eb7105592d6e64736fc` |
| `fixtures/parse-duration/task.md` | `aee66980c4847b051d4f771e52ebdb6f1178aaac4709deb8cabe80096554e39a` |

The complete inventory is preserved in ignored preflight evidence at
`.runs/g006/preflight/gate0-source-identity.json`. Because the source is not
yet committed, this is a review digest, not the final clean-HEAD binding.

## 8. What remains unverified

```yaml
unconfirmed:
  - DeepSeek V4 Flash current service availability and response behavior
  - G006 real Baseline route completion
  - external Verifier outcome after a settled real-model Baseline
  - G006 Candidate initial outcome
  - conditional same-Session recovery execution
  - reasoning replay across real DeepSeek Tool rounds
  - Completion Verification policy effectiveness beyond one feasibility pair
```

These are Stage 2 or later questions. None is silently promoted to a new Goal
or interpreted as a current failure.

## 9. Pause condition and next decision

Gate 0 is complete and the source review is positive. Execution stops here
because the current source is intentionally uncommitted and neither an
implementation-baseline commit nor Stage 2 is authorized.

The next user decision is narrowly:

> Authorize or reject one G006 implementation-baseline commit after reviewing
> this report and the complete `spikes/pi-runtime/g006/` source.

If authorized, the next checkpoint will commit the reviewed source and control
documents, verify an exact clean `HEAD`, create the ignored
`reviewed-implementation.json` with provider calls still at zero, and pause
again. That authorization does not authorize `gate-a.ts`, `driver.ts`, a
credential load or any real-model call.
