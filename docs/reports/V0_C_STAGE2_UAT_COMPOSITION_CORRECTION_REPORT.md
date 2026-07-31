# V0-C Stage 2 UAT-local Composition Correction Report

```yaml
status: completed_zero_call_candidate_preparation
disposition: READY_FOR_MAIN_REVIEW_AND_REPLACEMENT_FREEZE
execution_owner: original_v0_c_stage2_uat_session
replacement_candidate: .runs/v0-c/uat-replacement-candidate/
replacement_composition_sha256: e543fce7d648fdfc4fcd1b91e7a21c8799a83662e86e850001d5a8741d4fb906
replacement_source_inventory_sha256: dcb94bbba28c614fb37f6d1f215fea6a0089ac549b977aa22643217894e54472
replacement_authority_marker_created: false
replacement_authority_obtained_or_consumed: false
formal_product_run_invocations: 0
run_identities_created: 0
credential_reads: 0
external_network_calls: 0
provider_calls: 0
model_calls: 0
product_source_edits: 0
pi_patches: 0
git_commits: 0
```

## 1. Scope and result

**Fact.** This correction was limited to a new ignored directory,
`.runs/v0-c/uat-replacement-candidate/`, plus the two report writes explicitly
required by the bounded-correction Prompt. It did not execute or import the
replacement composition, invoke `runV0CProductSurface`, read `.env.g005`,
create an authority marker, create a Run/Attempt, contact a Provider, or use
network access.

**Fact.** Strict TypeScript, public-import resolution, source review, and a
local zero-call Tool Profile construction check passed. The local construction
and future Provider-payload checks now use one immutable
`EXPECTED_TOOL_NAMES`.

**Disposition.** The replacement is a candidate for Main Session review and
freeze. It has not obtained or consumed replacement Run authority and is not
an executed UAT result.

## 2. First Pause root cause

**Fact.** The first UAT composition asserted the three G006 experimental tool
names:

```text
read_task_and_source
run_public_tests
write_source
```

The frozen V0-C Product Surface actually constructs
`workbench/src/pi/tool-profile.ts:createBoundedToolProfile()`, whose bounded
profile is:

```text
workspace_read
workspace_list
workspace_search
workspace_edit
workspace_write
run_command
```

The old `before_provider_payload` assertion therefore threw
`provider payload Tool Profile drift` before transport dispatch.

**Conclusion.** The first Pause arose from the UAT-local composition
assertion, not the frozen Workbench, Pi, DeepSeek transport, model output,
Verifier, or task.

## 3. Replacement identity and source inventory

The source inventory excludes the candidate-local `node_modules` junctions,
which point to the already-pinned emitted Pi packages and installed Node type
declarations.

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `.runs/v0-c/uat-replacement-candidate/package.json` | 42 | `609158e6c5fbc237939fa3ddf7faab80ab690bdc0c8d584414a885130103c4e8` |
| `.runs/v0-c/uat-replacement-candidate/replacement-constants.ts` | 188 | `2fa888dad398c8b04921ed3faaff361c537e12e0a5096691d81b146b057afa46` |
| `.runs/v0-c/uat-replacement-candidate/stage2-uat-replacement-composition.ts` | 23614 | `e543fce7d648fdfc4fcd1b91e7a21c8799a83662e86e850001d5a8741d4fb906` |
| `.runs/v0-c/uat-replacement-candidate/tsconfig.json` | 189 | `fb2cee180388d7b8913fba8c1e1c08187fbdad5d91e1378066eab709d7863c1c` |
| `.runs/v0-c/uat-replacement-candidate/validate-replacement-candidate.ts` | 2908 | `dfa25503faec657ca41934ceddc1bf756c5e9de702a32fbd3d23115b03c01cec` |

```yaml
source_file_count: 5
source_inventory_sha256: dcb94bbba28c614fb37f6d1f215fea6a0089ac549b977aa22643217894e54472
composition_sha256: e543fce7d648fdfc4fcd1b91e7a21c8799a83662e86e850001d5a8741d4fb906
```

## 4. Exact old/new composition delta

`git diff --no-index --stat` reports:

```text
1 file changed, 17 insertions(+), 9 deletions(-)
```

The semantic delta from
`.runs/v0-c/uat/stage2-uat-composition.ts`
(`e4cd44434c126524145ab68e06253253ecc3f749d40dfed74a7e7d3a01cd8a60`)
to the replacement composition is exactly:

1. Import the one immutable `EXPECTED_TOOL_NAMES` from
   `replacement-constants.ts`.
2. Derive `UAT_ROOT` from `import.meta.dirname`, so every replacement marker
   and summary stays inside the new candidate directory.
3. Rename the future marker to
   `stage2-replacement-run-authority-consumed.json`.
4. Give future source-identity, success-summary, and failure-summary artifacts
   replacement-local names.
5. Replace the incorrect G006 three-tool assertion with
   `assertExactToolNames(...)` backed by the six frozen V0-C tool names.
6. Apply the same assertion immediately after local
   `createBoundedToolProfile(...)` construction and in
   `before_provider_payload`.
7. Update the future composition identity path to the replacement candidate.

No payload assertion was deleted or weakened. The correction fixes its frozen
expectation and adds the required earlier local-construction boundary.

The replacement retains:

- `runV0CProductSurface` as its only formal Product Surface entry;
- public emitted Pi imports only;
- the frozen DeepSeek V4 Flash descriptor, `thinkingLevel: "high"`,
  8192 output-token limit, and 1,000,000 context window;
- `timeoutMs: 120000`, `maxRetries: 0`, `maxRetryDelayMs: 0`, and no cache
  retention;
- exact per-AssistantMessage token/cost accounting;
- request, Tool, token, cost, Attempt-time, Run-time, and finalization-reserve
  limits;
- one long-lived Harness/Session/Workspace handle;
- reasoning-safe evidence persistence and no raw payload/reasoning persistence;
- no direct `run-v0c.ts`, G006 Driver, Pi private-source, or Pi source-tree
  import.

## 5. Frozen Tool Profile two-level assertion

The shared immutable value is:

```text
workspace_read
workspace_list
workspace_search
workspace_edit
workspace_write
run_command
```

**Fact.** `Object.isFrozen(EXPECTED_TOOL_NAMES)` returned `true`.

**Fact.** The zero-call validation script invoked the real
`createBoundedToolProfile(...)` constructor with the frozen task and observed
the exact same six names.

**Fact.** The replacement composition uses the same constant:

- immediately after `createBoundedToolProfile(...).tools` is constructed;
- when validating names in the future `before_provider_payload` payload.

```yaml
expected_tool_names_immutable: true
local_constructed_profile_assertion: passed
provider_payload_assertion_source_review: passed
expected_and_observed_names_exactly_equal: true
```

## 6. Public boundary and frozen identity

Public import resolution:

```text
@earendil-works/pi-agent-core
  -> .runs/v0-a/pi/packages/agent/dist/index.js
@earendil-works/pi-ai
  -> .runs/v0-a/pi/packages/ai/dist/index.js
@earendil-works/pi-ai/providers/deepseek
  -> .runs/v0-a/pi/packages/ai/dist/providers/deepseek.js
```

| Identity | Result |
| --- | --- |
| Root HEAD | `12db75aaea4db4afb774046cfcc94de772a2e90b` |
| Root tracked/staged diff | none / none |
| Workbench digest excluding `node_modules` | `a7e80a50ac415cd95b4d1480bc81c6e4339857b119dbc8c37afa98ffbe260446` |
| Correct Task manifest SHA-256 | `7f7e29ba432409da0cad3f80c471a5a8188183575a92e4ebe68b6c67d95b6376` |
| `.upstream/pi` HEAD / status | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| `.runs/v0-a/pi` HEAD / status | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| Workbench/fixture/Pi source edits | 0 |
| Pi Core patches/private imports | 0 / 0 |

## 7. Failed Run and old UAT artifact preservation

The failed Run and original UAT artifacts were inventoried before and after
the correction.

| Preserved tree | Files | Before inventory SHA-256 | After inventory SHA-256 |
| --- | ---: | --- | --- |
| `.runs/v0-c/runs/run-1d7829b0-338f-4555-b6ac-72d5d08b228d/` | 11 | `95d7794920058916e3b7250cd8ec6b60a3e42672c6c2c032d4fcbc4d61506ee6` | `95d7794920058916e3b7250cd8ec6b60a3e42672c6c2c032d4fcbc4d61506ee6` |
| `.runs/v0-c/uat/`, excluding existing `node_modules` junctions | 15 | `885a7caf12fbc87b1109bd4f14b6ee3c86f40dd027a428aca1fab48a2e4da8fd` | `885a7caf12fbc87b1109bd4f14b6ee3c86f40dd027a428aca1fab48a2e4da8fd` |

**Fact.** The old composition, authority marker, failure summary,
`formal-run-*` files, journals, Session evidence, Workspace, and scan
artifacts remain byte-identical.

**Fact.** No Outcome, Evidence Index, Verifier result, secret-scan result, or
terminal record was backfilled into the failed Run.

## 8. Pause Report accuracy correction

The Pause Report's Task manifest SHA-256 was corrected from the erroneous
displayed value to:

```text
7f7e29ba432409da0cad3f80c471a5a8188183575a92e4ebe68b6c67d95b6376
```

A short `Main-review accuracy correction` section was appended. It states
that this was documentation-only and did not alter evidence or the Pause
disposition.

```yaml
pause_report_before_sha256: fb98dc84d4f8bc8b364fd4783a64f1366ab1da64ff9c0a01c9720932866a9e51
pause_report_after_sha256: 490aec7e19c0cede2ab639740cf7c173ed24811cceb639e6dc7abecf1d6edf3c
old_erroneous_hash_occurrences_after_correction: 0
correct_hash_occurrences_after_correction: 1
other_pause_facts_rewritten: false
```

## 9. Zero-call validation commands and results

All commands used `D:\AI\AI_Projects\project2` as `cwd`.

| Command | Exit/result |
| --- | --- |
| First `.runs/v0-a/pi/node_modules/.bin/tsc.cmd -p .runs/v0-c/uat-replacement-candidate/tsconfig.json` | exit 1; validator used the wrong typed preflight property; candidate-local validator corrected before any execution |
| Second `.runs/v0-a/pi/node_modules/.bin/tsc.cmd -p .runs/v0-c/uat-replacement-candidate/tsconfig.json` | exit 0; `2026-07-31T10:01:49.6172465Z`–`10:01:52.4820728Z` |
| `node .runs/v0-c/uat-replacement-candidate/validate-replacement-candidate.ts` | exit 0; `2026-07-31T10:01:58.3118877Z`–`10:01:58.7499104Z` |
| Candidate source/import review with `rg` | passed; only `runV0CProductSurface`, no direct runner/G006/private source |
| Public emitted import resolution with `import.meta.resolve(...)` | passed; all three paths resolve to pinned emitted `dist` |
| Old/new `git diff --no-index` | 17 insertions, 9 deletions; delta matches Section 4 |
| SHA-256/source inventory commands | passed; identities recorded in Sections 3 and 7 |
| Root/Pi status and Workbench digest checks | passed |

The local validator returned:

```yaml
status: passed
expected_tool_names_immutable: true
expected_and_observed_tool_names:
  - workspace_read
  - workspace_list
  - workspace_search
  - workspace_edit
  - workspace_write
  - run_command
formal_product_run_invocations: 0
run_identities_created: 0
credential_reads: 0
external_network_calls: 0
provider_calls: 0
model_calls: 0
product_source_edits: 0
replacement_marker_exists_before_or_after: false
```

No real or Faux Product Run was used for validation.

## 10. Remaining authority and recommendation

**Unconfirmed.** The candidate has not been executed, so this correction does
not establish Provider authentication, transport behavior, real model
behavior, Verifier outcome, terminal evidence, or user acceptance.

**Fact.** The candidate directory contains no
`stage2-replacement-run-authority-consumed.json`, source-identity artifact,
execution summary, or execution-failure summary. No replacement authority has
been granted to or consumed by this Session.

**Recommendation.** The Main Session should review and, if accepted, freeze:

```yaml
candidate_path: .runs/v0-c/uat-replacement-candidate/
source_inventory_sha256: dcb94bbba28c614fb37f6d1f215fea6a0089ac549b977aa22643217894e54472
composition_sha256: e543fce7d648fdfc4fcd1b91e7a21c8799a83662e86e850001d5a8741d4fb906
expected_tool_names_sha256: 2fa888dad398c8b04921ed3faaff361c537e12e0a5096691d81b146b057afa46
```

Only a future fresh replacement UAT Session, after Main Session freeze and
explicit replacement Run authority, may exclusive-create the distinct marker
and invoke the Product Surface. This correction Session stops here.
