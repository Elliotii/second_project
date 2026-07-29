# G005 Phase 3 Real-model Completion Verification Feasibility Report

Date: 2026-07-29  
Goal: `G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY`  
Final disposition: `INVALID_G005_EVIDENCE`  
Main Session decision: Option B / clean-retry candidate, not authorized

## 1. Executive conclusion

**Fact.** G005 is closed as `INVALID_G005_EVIDENCE`. The raw file
`.runs/g005/evidence/outcomes/execution-failure.json` still records
`FAIL_REAL_MODEL_ROUTE`; it has not been changed. The Main Session reviewed and
rejected that raw disposition because the stopping condition was caused by the
project-side Observer/Evidence implementation, not by a demonstrated failure of
the frozen Pi/DeepSeek route.

**Fact.** The Baseline produced four authenticated `deepseek-v4-flash`
responses, three successful Tool/ToolResult round-trips, reasoning replay across
tool calls, a final assistant response, and one settled event through the public
emitted `pi-agent-core` `AgentHarness` route.

**Fact.** The Baseline external Verifier was not run and Candidate was not
started. Therefore G005 did not produce a valid, symmetric Baseline/Candidate
pair and cannot evaluate Completion Verification Policy effect.

**Inference.** The preserved Baseline is positive but incomplete evidence for
the real-model integration mechanism. It proves neither the complete G005 Go
Gate nor Policy effectiveness.

**Unconfirmed.** The hidden Verifier result for the repaired Baseline workspace
is unknown because the Main Session explicitly prohibited running it after the
attempt became invalid.

**Recommendation.** Retain
`G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY` only as
a clean-retry candidate. Before any implementation, first draft and review a
bounded Contract that freezes the two fixes and the pre-model checkpoint listed
in section 10. G006 is not created or authorized by this report.

## 2. Architecture review and evidence authority

The Main Session selected Option B with the following controlling decisions:

```yaml
raw_disposition_FAIL_REAL_MODEL_ROUTE: rejected
reviewed_disposition: INVALID_G005_EVIDENCE
same_attempt_resume_authorized: false
additional_G005_model_calls_authorized: false
baseline_verifier_resume_authorized: false
candidate_start_authorized: false
clean_retry_recommended: true
G006_contract_creation_authorized: false
G006_execution_authorized: false
```

**Fact.** No model call, Verifier execution, Candidate start, Spike change, or
raw-evidence change occurred after this decision. This report and the associated
Closeout/`CURRENT_STATE.md` update are control-plane records, not additions to
the experiment evidence.

## 3. Activation and setup facts

**Fact.** Activation Preconditions passed before setup:

- root HEAD was `33c7e534b2d0f13201384ab754c7f3c9351635a0`;
- root status contained only the contract-accepted untracked `reference/` tree;
- `.env.g005` existed and was ignored; its contents were not read by the
  control shell;
- `.upstream/pi` was clean at
  `027a5847901b5dde30270abaa1041046cd2b4b55`;
- `.runs/g005` and `workbench/` were absent;
- execution was Windows-native with Node `v24.14.1` and npm `11.11.0`.

**Fact.** Setup reused the G003 accepted boundary: a local non-hardlinked Pi
clone, dependency hydration with install scripts disabled, exact
`@earendil-works/pi-ai@0.82.1` release artifact validation, the accepted
38-file model-data restore, pinned `check:model-data`, standard
`pi-ai build:offline`, and standard `pi-agent-core build`.

**Fact.** Artifact identity remained:

```yaml
package: "@earendil-works/pi-ai@0.82.1"
integrity: "sha512-3WFYRhEp3lQB3444EhPMBcM7zSaEUE3eJgHOR7s4081NLqbw/FsWilIKWXSua0Gv3sRr7m9xMidR3pPDE7jI/A=="
shasum: "02ebdfc2997fd88ca1f51a7b5c01f337a9462f34"
gitHead: b4f293684bba718d59cc1157679bcf6157b3a7f5
archive_members: 712
selected_model_data_files: 38
restored_manifest_sha256: c2d89b03ccb2c095c59ead0437592b21e9676d049ad8e92ea90a466adf10b24d
pi_core_patch_count: 0
```

**Fact.** The initial `npm pack` attempt encountered a system npm-cache access
error; the identical artifact command was rerun with filesystem access and
succeeded. This was a setup event before the model attempt and did not change
artifact identity or the emitted-package boundary.

## 4. Offline validation and Gate A

**Fact.** Gate A passed before the first provider request with
`credential_configured=true` and `providerCalls=0`. Only that boolean was
recorded; the credential was not printed, copied, hashed, or supplied on a
command line.

**Fact.** Public runtime/type resolution, strict project TypeScript validation,
and offline regression tests passed. They covered the frozen model descriptor,
three restricted tools, initial fixture behavior, deterministic repaired hidden
behavior, and redaction of reasoning text before Session JSONL persistence.

**Fact.** A Node strip-only TypeScript parameter-property error was corrected
before any G005 attempt workspace, manifest, journal, Session, or provider call
existed. Read-only checks at that point found no attempt state. It did not
consume the sole paired attempt.

## 5. Preserved Baseline observations

The preserved evidence is under `.runs/g005/evidence/`.

```yaml
baseline:
  provider_request_starts: 4
  assistant_messages: 4
  assistant_response_ids_present: 4
  tool_starts: 3
  tool_ends: 3
  tool_errors: 0
  public_test_exit_code: 0
  settled_events: 1
  external_verifier: not_run
candidate:
  started: false
  event_journal: absent
  session: absent
```

**Fact.** Every captured request used model `deepseek-v4-flash`, thinking
enabled, reasoning effort `high`, `max_tokens=8192`, no temperature, and exactly
the three frozen tools. No authorization or API-key field was captured.

**Fact.** The sequence was read, write, public test, and final response. The
source changed only at `src/parse-duration.ts`, from SHA-256
`fc0771785d0a8bf601f205584c5b85fdf4769e13bba3229fef86d7622fedbb03`
to `ad11e084a1e5e984e8ab72ed99e4e5b77f6e37e320789b24e7d4b1fec92666c6`.

**Fact.** Baseline and Candidate initial workspace digests were identical:
`b854f2c18447597ec20eb3488045aff8f20ba877047f72782eb1cbc8adfdb64c`.
Candidate remained at the initial fixture state and was never executed.

**Unconfirmed.** The Baseline final workspace's hidden-test outcome is unknown.
Its apparent conformance from source inspection is not a Verifier result.

## 6. Why the paired evidence is invalid

Pinned Pi evidence:

- `.upstream/pi/packages/agent/src/harness/agent-harness.ts`, symbol
  `AgentHarness.emitOwn()` near line 229, notifies `subscribe(...)` handlers;
- the same file, symbol `AgentHarness.createStreamFn()` near line 417, emits
  `after_provider_response` through `emitOwn(...)`.
- `.upstream/pi/packages/agent/src/harness/types.ts`, symbol
  `AgentHarnessEventResultMap` near line 799, includes
  `after_provider_response`, so the typed `harness.on(...)` surface accepts it;
- `.upstream/pi/packages/agent/docs/agent-harness.md` near line 463 describes
  `after_provider_response` as an implemented hook.

G005 project evidence:

- `spikes/pi-runtime/g005/driver.ts` near line 318 registered
  `after_provider_response` through `harness.on(...)`;
- the same file near line 342 rejected the cycle when that counter remained
  zero.

**Fact.** Four completed provider responses are independently present as
assistant messages with response IDs and usage, but the incorrect Observer
registration left the project-side counter at zero.

**Inference.** The route assertion was a false negative. It does not support
`FAIL_REAL_MODEL_ROUTE`.

**Inference.** Root-cause ownership crosses a boundary. The G005 integration
failed to audit the pinned event-dispatch implementation and selected the wrong
public observation surface. At the same time, the pinned Pi type/documentation
surface presents `after_provider_response` as an `on(...)` hook while the actual
`emitOwn(...)` path notifies only `subscribe(...)`. This is a pinned Pi
observability semantic inconsistency with a public project-side workaround; it
is not a Core route blocker and requires no Pi patch for G006.

**Fact.** The Journal also permits an inner record's `type` field to overwrite
the intended outer event type. Preserved examples include outer semantic events
being serialized as `thinking` and `source_write`. This weakens event-schema
auditability even though no reasoning body was persisted.

**Fact.** Correcting either implementation after Baseline would give Baseline
and Candidate different Observer builds. The Main Session rejected that
asymmetry and prohibited same-attempt continuation.

## 7. Gate results

| Gate | Final state | Evidence-backed interpretation |
| --- | --- | --- |
| A — credential preflight | Passed | Credential configured boolean recorded; zero provider calls before Gate A. |
| B — real Baseline route | Incomplete / invalid for the gate | Provider, tools, results and settled occurred; external Verifier and final correlated outcome did not. |
| C — Candidate recovery | Not run | Candidate never started; Policy path was not exercised. |
| D — trace/session/reasoning | Incomplete / invalid | Session and reasoning replay evidence exists, but response counting and outer Journal event typing are defective. |
| E — fairness/provenance/budget/secret | Incomplete | Initial parity and setup provenance exist; only a paused partial secret scan exists, not the final Gate E audit. |

**Fact.** The original G005 Definition of Done was not satisfied because no
valid Baseline/Candidate pair was completed. `INVALID_G005_EVIDENCE` is the
contract disposition for evidence that cannot be interpreted as the intended
paired experiment.

## 8. Secret and reasoning handling

**Fact.** Persisted Session JSONL contains visible assistant/tool protocol
records but no private chain-of-thought body or thought signature. The event
journal retains only reasoning presence, length, byte count, and association
metadata.

**Fact.** The paused scan at
`.runs/g005/evidence/security/paused-artifact-secret-scan.json` inspected 42
then-current G005 Spike/evidence/workspace files and recorded zero secret
matches.

**Unconfirmed.** The paused scan is partial safety evidence, not final Gate E.
No final post-pair secret scan exists because the pair was not completed and the
Main Session prohibited modifying or supplementing raw evidence during
closeout.

## 9. Source identity for the invalid attempt

These SHA-256 values were computed read-only during closeout. They freeze the
current G005 Spike identity associated with the invalid run. The
`secret-scan.ts` helper was added after the run paused and is not part of the
model-facing Observer build used during the four calls.

| Spike file | SHA-256 |
| --- | --- |
| `acceptance/acceptance.test.ts` | `fcc7eba0e387f812c895b5255d2a98acc6e1c41122c60eb7105592d6e64736fc` |
| `driver.ts` | `a3afa966c7a987ff462c391913e71b67dc3fc297511e40cefb865dc3ec63f12b` |
| `fixtures/parse-duration/package.json` | `b80820598519558721eaf59adcde47ccba2dcac5953334e1766c78ddce5e8e99` |
| `fixtures/parse-duration/src/parse-duration.ts` | `fc0771785d0a8bf601f205584c5b85fdf4769e13bba3229fef86d7622fedbb03` |
| `fixtures/parse-duration/task.md` | `aee66980c4847b051d4f771e52ebdb6f1178aaac4709deb8cabe80096554e39a` |
| `fixtures/parse-duration/test/public.test.ts` | `0af1363bc9e7814cc90f8e3faf1d1366ed5f417b27d400f51e9fc3c3b36e7251` |
| `gate-a.ts` | `962c3ef4fdd9c43ad481dec3ce0b3547ddceed581bc2e3a0bd159ce5413f99bb` |
| `gates.test.ts` | `547a332a00921d467801b1e8f703277fc075eb6631a63742d7d965e4bdc7e855` |
| `model.ts` | `7396bd299e933d46fba7a054ea3558982503dfc9dc25031d1e90b3d58bb456fe` |
| `package.json` | `084ae640f0ac75bf08116f421677803a4f7b89b7699ad3b4d22a1a45ceb995e0` |
| `public-import-smoke.mjs` | `2d9efaf6d1bc67f47ab5f98ac4c236dbb2b06f447d83c9a8f68635f916ed7901` |
| `public-type-smoke.ts` | `cc54e3582d6fec18f69c9671308fd793369738e410d8f38b526aba55b60e7f47` |
| `README.md` | `eb4bb1688361dd4afea10d4da108a37f9f5c0b4fa6582fdd263683b9a21abb18` |
| `resolve-public-types.mjs` | `1bddeaf5f6c01510f3059e122e0922f01148b68744de401302b2f3aeb97e24ff` |
| `runtime-utils.ts` | `f4fcaeb0f23e0dc0ae597caa5a718d22f49ba35efae8a205ca427d9567edf8ed` |
| `secret-scan.ts` | `d170541b8c02d6ab8ff1a98a193d9fe79dc304834762a11e625ac8ad826b4d16` |
| `session-storage.ts` | `ca1767fe5c500804242a4ba1f12060b23614c8231388b2e563a46f62a4cc1682` |
| `stage-model-data.mjs` | `8cb2bb969390954be291eab1a0007f0fd1346bf72877fcfb193168101eecc098` |
| `tools.ts` | `195c1543808740f3a5c7fd45e3f4664735c41e11e7278cec5c27699e7e914270` |
| `tsconfig.json` | `171981e3c3998e7b9766b7463fa21b50a7ff3f7bf161897422112c2fb584a2f4` |
| `verifier.ts` | `6585cb3246d9c5abe81d4ff6ef54b20b1ad75fecc363f395c41e8a101834e63a` |

Selected preserved raw-evidence hashes at closeout start:

| Evidence | SHA-256 |
| --- | --- |
| `events/baseline.jsonl` | `51b8f10c3d03ffc8c6e4097c1339213fcc3ec1fca8495f9f0bbd28705449953d` |
| `sessions/baseline.jsonl` | `ce5c6008d427cd56b9cfc8bf64fd2f8fa3578d74fb36a9b9592ac695fd1c7c8e` |
| `outcomes/execution-failure.json` | `c53bdab58137dbaa4a61a357e679a905b80d27d9f6139884dd713e9490f1ee8c` |
| `manifests/baseline-initial.json` | `46d65fbf2278176c3f5b58d6caa1e8591cbc82b30924077398d91cac401e78bb` |
| `manifests/candidate-initial.json` | `699bf3436136ea60f5f46ae9bf30748cd7825cc4773bcba8be627f211b61b2c3` |
| `manifests/pair.json` | `6651b6da700904c0d41dd054d66e4aebcd3af73dc827f67a7b9bcda084cf875d` |
| `security/paused-artifact-secret-scan.json` | `b4cf167232a62eb87202ae317651e0a8881ac7bfdc2bd6e353fd82e390ee9a39` |

## 10. G006 prerequisites and sequencing, not current implementation

The following are bounded prerequisites for a possible clean retry:

1. Observe and count `after_provider_response` through `subscribe(...)`, then
   validate the count offline against synthetic response events.
2. Prevent a Journal payload's inner `type` from overwriting the outer event
   type, and add an offline regression test that asserts stable outer event
   names while preserving inner semantic type under a distinct field.

**Recommendation.** If the Main Session later authorizes G006 Contract
creation, use this order:

1. draft and review the bounded
   `G006_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_CLEAN_RETRY`
   Contract without implementing it;
2. make Gate 0 authorize only the two fixes above plus Faux/synthetic offline
   regression tests;
3. after Gate 0 passes, pause for Main Session source review and an explicitly
   authorized clean Git baseline commit;
4. only from that exact clean `HEAD` permit the first real-model request;
5. use one fresh `.runs/g006` root and exactly one symmetric paired attempt.

This separates contract authority, implementation review and real-model
execution. It prevents both pre-contract code drift and a model call against an
unreviewed Observer build.

**Fact.** Neither prerequisite was implemented during this closeout. No G006
Contract, `.runs/g006`, or G006 code was created.

## 11. Command and result record

The following commands were actually used during G005. Paths with an indicated
working directory were run there. No command included the credential value.

### Activation and setup

```powershell
git rev-parse HEAD
git status --short --untracked-files=all
git -C .upstream/pi rev-parse HEAD
git -C .upstream/pi status --short
git check-ignore -q .env.g005
Test-Path -LiteralPath .env.g005
Test-Path -LiteralPath .runs/g005
Test-Path -LiteralPath workbench
git clone --local --no-hardlinks .upstream/pi .runs/g005/pi
git -C .runs/g005/pi checkout --detach 027a5847901b5dde30270abaa1041046cd2b4b55
npm.cmd ci --ignore-scripts
npm.cmd pack @earendil-works/pi-ai@0.82.1 --ignore-scripts --pack-destination .runs/g005/source --registry=https://registry.npmjs.org
npm.cmd run check:model-data --workspace=@earendil-works/pi-ai
npm.cmd run build:offline --workspace=@earendil-works/pi-ai
npm.cmd run build --workspace=@earendil-works/pi-agent-core
```

Results: activation passed; isolated hydration installed 328 packages and
reported 11 high-severity audit findings; first pack attempt hit npm-cache
`EPERM`, identical approved rerun passed; artifact/archive/model-data checks and
both standard builds passed; isolated Pi tracked status remained clean.

### Offline validation and execution

```powershell
node spikes/pi-runtime/g005/public-import-smoke.mjs
node spikes/pi-runtime/g005/resolve-public-types.mjs
.runs/g005/pi/node_modules/.bin/tsc.cmd -p spikes/pi-runtime/g005/tsconfig.json
node --test spikes/pi-runtime/g005/gates.test.ts
node --env-file=.env.g005 spikes/pi-runtime/g005/gate-a.ts
node --env-file=.env.g005 spikes/pi-runtime/g005/driver.ts
node --env-file=.env.g005 spikes/pi-runtime/g005/secret-scan.ts
```

Results: emitted public runtime/types resolved; strict TypeScript and offline
tests passed; Gate A passed with zero provider calls; the sole effective real
driver invocation made four Baseline provider calls and stopped on the false
route assertion before Verifier/Candidate; paused scan found zero matches in 42
files. A prior driver parse attempt failed before attempt state or provider use
and was verified not to have consumed the paired attempt.

### Read-only invalid-evidence closeout

```powershell
Get-Content docs/goals/G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY.md
Get-Content docs/reports/G005_PHASE3_REAL_MODEL_COMPLETION_VERIFICATION_FEASIBILITY_PAUSE_REPORT.md
Get-Content CURRENT_STATE.md
Get-ChildItem .runs/g005/evidence -Recurse -File
Get-ChildItem spikes/pi-runtime/g005 -Recurse -File | Sort-Object FullName | Get-FileHash -Algorithm SHA256
Get-ChildItem .runs/g005/evidence -Recurse -File | Sort-Object FullName | Get-FileHash -Algorithm SHA256
git rev-parse HEAD
git status --short --untracked-files=all
git -C .upstream/pi rev-parse HEAD
git -C .upstream/pi status --short
git -C .runs/g005/pi rev-parse HEAD
git -C .runs/g005/pi status --short
Test-Path workbench
Test-Path .runs/g006
Get-ChildItem docs/goals -Filter G006*
```

Results: the preserved facts and hashes above were confirmed; root HEAD was
unchanged; both Pi trees remained clean and pinned; `workbench/`, `.runs/g006`,
and a G006 Goal Contract were absent.

## 12. Claims and non-claims

**Fact.** G005 did not prove that Completion Verification improves coding
performance.

**Fact.** G005 did not prove that the Pi/DeepSeek real-model route fails.

**Fact.** G005 provides positive-but-incomplete evidence that Direct
`AgentHarness`, DeepSeek V4 Flash, real Tool/ToolResult, reasoning replay, and
settled operation can work together without a Pi Core patch.

**Unconfirmed.** Policy effect, hidden Verifier result, Candidate recovery,
full trace correctness, and final Gate E safety remain unverified.

**Fact.** This closeout authorizes neither final Pi Go, architecture freeze,
formal Workbench creation, G006 contract creation, nor G006 execution.
