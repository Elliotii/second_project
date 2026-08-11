Exit code: 0
Wall time: 0.2 seconds
Output:
# V3.6 Goal 2 Real Product Acceptance Report

```yaml
status: completed_pending_main_review
goal_id: V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_PRODUCT_ACCEPTANCE
recommendation: PASS_V3_6_G2_REAL_PRODUCT_ACCEPTANCE
launch_record_commit: 32882ffb0b6d3f459736cc70a34783f494694cb2
execution_baseline_commit: 781e95211e7cc6beb572c50ec18e36e0a952b1f9
execution_baseline_tree: 6a54c220d7286560d6e4e0ea52f34c39fb5718ae
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
docker_desktop: 4.85.0_235549
docker_client_server: 29.6.2_29.6.2
docker_context: desktop-linux
docker_image: node@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03
model: deepseek-v4-flash
journey_root: .runs/v3-6/g2-real/journey-20260811-01
session_id: v36-session-0e495322-26c4-47f5-aebb-8fcfce20090d
run_ids:
  - v36-run-36f129e7-82dd-43cf-b357-e8a74645ab0b
  - v36-run-bc42cccf-fa1e-42b2-ab46-427f6e6fe81c
change_set_digest: c5fff219d7459b98982a5e4f52c8c427ffa159c171e0d95ed546707c012e237d
verifier_terminal_digest: 6df68d2bda511a7a5bcb3cbf50e6cdbe09daf78df7cedc6dab7bc1c07f1b02be
apply_receipt_digest: 4f755fb65a9d4e62b415fa38639865f73535951601f8555a37093420842077cd
```

## Result

**Fact:** The fresh no-source-edit Session completed the one frozen two-Turn product
Journey through the tracked `v36g2:product` entry. Both Turns settled in one persistent
Session, the frozen Docker Verifier passed, the immutable non-empty ChangeSet was applied
through the Host handoff path, and the registered Source ended in the expected corrected
state.

**Recommendation:** `PASS_V3_6_G2_REAL_PRODUCT_ACCEPTANCE`. Main retains final Goal 2
and V3.6 acceptance authority.

## Frozen inputs and preflight

The fresh registered Source was copied byte-for-byte from
`workbench/fixtures/v36g2/duration-parser` into the ignored Journey root. Before Source
creation, the registered Source, data root and evidence root were each absent. The
repository was not used as the registered Source.

The tracked zero-access preflight passed with:

```yaml
fixture_inventory_digest: f33080d10d63591317743b36da633662a9c6c6e7c063dfbdfe7a42aa221ea9eb
backend_profile_digest: f31414d3a8aa288337f0b5ba2a1d976b7cb8c49b7935633e838fcbe4c2a96b05
provider_profile_digest: 6b90b83a047ce7745fc92a6f1ef99dd7f7ea6e046a5107e060f4b041e864cf32
registered_command_digest: 2740096afc07d6532f205675eb59f3c9f47c569b4204596c04ba049c458c0c29
prompt_sha256:
  - dc0681b8c1678a8f0d21af30bbc6758b529b20d55ad79e33aff32b9b54b35562
  - 3a5088f511c1f9fe5442595c45a207fe580b9e03ecf080f1f25e95cf9cd9ab24
per_turn_budget_digest: fc3c65063d0deb9d00b8469d71fd87dd36d36f3b8cb44f0b187e222c6b11ba4a
journey_budget_digest: 9c10a0fd759c93c4150b60b4d94a7820875a2bdeb83f1d0dc37b2820dcda1148
execution_policy_digest: cb63eff1635a6aeccaa8dc6a5b6891c179d28c51940b77c9521ada1dca0e1872
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
runtime_identity_created: false
```

The literal PowerShell `npm run ... preflight` command returned exit `1` because this
host blocks `npm.ps1` under its execution policy; npm and the product did not start.
The same tracked entry was then run as the Windows executable `npm.cmd run ... preflight`
with exit `0`, producing the values above. This preflight did not read a Credential,
contact a Provider, use Docker or create runtime identity.

## Gate H

Gate H passed before the ignored child preload was enabled and before any real dispatch.

| Check | Result |
|---|---|
| Worktree HEAD/tree/status | `781e95211e7cc6beb572c50ec18e36e0a952b1f9` / `6a54c220d7286560d6e4e0ea52f34c39fb5718ae` / clean |
| Shared Pi | `027a5847901b5dde30270abaa1041046cd2b4b55`, clean |
| Docker Desktop / Engine | `4.85.0 (235549)` / `29.6.2` |
| Docker client / server | `29.6.2` / `29.6.2`, Linux `amd64` |
| Docker context | `desktop-linux` |
| Pinned image | local `node@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03` |
| Existing `v36g2-` containers | zero |

## Real Journey execution

The only actual execution used the exact frozen Host inputs and the explicit authority
token. An ignored Node preload validated that
`D:/AI/AI_Projects/project2/.env.g005` was one ordinary non-link file with exactly one
non-empty `DEEPSEEK_API_KEY`, then exposed the value only inside the child process. The
value was never printed, hashed, sized, persisted, summarized or inherited by the parent
PowerShell shell. The child discarded the environment value on exit. The tracked product
observed exactly two Credential resolver reads, one for each Turn.

An initial launch with a Windows path in `NODE_OPTIONS` returned exit `1` before Node
loaded the preload (`ERR_UNSUPPORTED_ESM_URL_SCHEME`); no Credential, Provider, Docker or
Source action occurred and the data/evidence roots remained absent. The actual Journey
then used the same frozen inputs with the corrected `file:///C:/...` preload URL and
returned exit `0` with the product report below. No post-dispatch error occurred.

```yaml
status: applied
authority_digest: bd9b28bf181c42ce5d96e8d539da8c79915dbd8d92d6ff29ff301e8b53031ee5
session_id: v36-session-0e495322-26c4-47f5-aebb-8fcfce20090d
run_ids:
  - v36-run-36f129e7-82dd-43cf-b357-e8a74645ab0b
  - v36-run-bc42cccf-fa1e-42b2-ab46-427f6e6fe81c
change_set_digest: c5fff219d7459b98982a5e4f52c8c427ffa159c171e0d95ed546707c012e237d
change_count: 1
verifier_passed: true
apply_receipt_digest: 4f755fb65a9d4e62b415fa38639865f73535951601f8555a37093420842077cd
credential_reads: 2
network_calls: 11
external_provider_calls: 11
real_model_calls: 11
retry: 0
fallback: 0
replacement: 0
```

### Session and per-Turn continuity

Both Run manifests carry the same Session ID and Session pin digest
`838203fc4ef49a48375b16c33a98480cfcdc8ee469b6052ade5418778d466be1`. Both settled.
Turn 1 had zero prior context messages. Turn 2 had 13 prior context messages and its
`provider_observed_prior_context_sha256` matched its authenticated
`prior_context_sha256`, proving continuation through the same persistent Session.

| Turn / Run | Prompt SHA-256 | Provider requests | Tool calls | Combined tokens | Cost USD | Credential reads | Docker commands |
|---|---|---:|---:|---:|---:|---:|---:|
| 1 / `v36-run-36f129e7-82dd-43cf-b357-e8a74645ab0b` | `dc0681b8c1678a8f0d21af30bbc6758b529b20d55ad79e33aff32b9b54b35562` | 6 | 6 | 13,919 | `0.0010033016` | 1 | 1 |
| 2 / `v36-run-bc42cccf-fa1e-42b2-ab46-427f6e6fe81c` | `3a5088f511c1f9fe5442595c45a207fe580b9e03ecf080f1f25e95cf9cd9ab24` | 5 | 4 | 39,678 | `0.0015908592` | 1 | 2 |
| **Journey** | -| **11** | **10** | **53,597** | **`0.0025941608`** | **2** | **3** |

All per-Turn and whole-Journey counters stayed below the frozen limits:
`16/24/131072/USD 0.20` per Turn and `32/48/262144/USD 0.40` for the Journey.

### Docker terminal evidence

The two Turn command paths and the final frozen Verifier each used the pinned Docker
profile. Every terminal was successful, non-timeout, non-truncated, one-mount and
cleanup-complete. The Verifier ran `node --test` and reported 3 passed, 0 failed.

| Use | Execution ID | Exit | Terminal digest |
|---|---|---:|---|
| Turn 1 registered `test` | `v36-docker-21eab967-4cbc-4109-94d3-209bf75f9019` | 0 | `a8065c355f5eb8ceae8a926c664a4ca50ef1b21978e71c16500a1c11199e9d03` |
| Turn 2 registered `test` | `v36-docker-0f59adc5-e870-4c22-abef-5fcd19ed3e5b` | 0 | `66017258540a34e542b27da1322425b3e6dbe80fd7100db081ea136df79324b9` |
| Turn 2 frozen registered `test` | `v36-docker-941a6bd6-b9da-4d9d-9dfc-61d92a3c56eb` | 0 | `92e5b0bd34cfadeda9c4a0ccf9b56a64f5100441d8acea6e9a8904b08274b818` |
| Frozen Verifier `node --test` | `v36-docker-fd564b41-ba82-497d-a3c7-8554d9714261` | 0 | `6df68d2bda511a7a5bcb3cbf50e6cdbe09daf78df7cedc6dab7bc1c07f1b02be` |

The final post-Journey exact-name Docker query returned zero `v36g2-` containers.

## Change Handoff and Source state

The initial registered Source inventory contained exactly three files and digest
`f33080d10d63591317743b36da633662a9c6c6e7c063dfbdfe7a42aa221ea9eb`:

```text
package.json                 131 bytes  9a32c590cbc26ebd08faf509cd886a7090e1bd159aa393b13ae97425dc0a2fec
src/parse-duration.js         80 bytes  e0fa817c4a544a49c4f1a9e2bfb087fd4934555a298d111e948e9a1e3549542c
test/parse-duration.test.js  999 bytes  ccf49512de7cfa38b791cdb23b0676e528b4606e8f5181d5d16f48026fdd62c6
```

The final registered Source inventory contains the same three files and digest
`c924fd099a71234cba5d4ca11083700636f5295c51f102c6b0d3803f212be568`:

```text
package.json                 131 bytes  9a32c590cbc26ebd08faf509cd886a7090e1bd159aa393b13ae97425dc0a2fec
src/parse-duration.js        615 bytes  2e132815d5dee1fe21a720e8afe247dfd060dd94bd69cbcd29ecbd8b02988aab
test/parse-duration.test.js  999 bytes  ccf49512de7cfa38b791cdb23b0676e528b4606e8f5181d5d16f48026fdd62c6
```

The ChangeSet was current-head authenticated, non-empty and contained exactly one
`modify` entry for `src/parse-duration.js`. The Host Apply receipt was `applied` with
one applied journal entry, and the successful-Apply marker required a new Session for
continuation. No direct Source edit was performed by this Session.

## Evidence digests

The following immutable raw evidence files were verified read-only:

| Evidence | SHA-256 |
|---|---|
| `evidence/journey-authority.json` | `c14faa3c59b84b9608c706960cf2b89d4e78513f8c1e145e0d1a9727d8be41c2` |
| `evidence/journey-report.json` | `5fd4ef2a65953465e51923ece05806fe3ccfb628c421d96ba79fef3c7579fd6e` |
| `evidence/verifier/authority.json` | `6b3b1019184257e6e7d1dc3ddf315febc892a7ee67a58d48b6fae64f18b9852b` |
| `evidence/verifier/terminal.json` | `54a143a3b087bf9b0064cf8f66aee6801219eae48f6d5aa32c5442fbf236ea7f` |
| `data/interactive/sessions/<session>/session.json` | `ca932ecaaf56d974e0bb55576b2a0aa790e622ef5d9506e95ec51c3e3124c08d` |
| `data/interactive/sessions/<session>/successful-apply.json` | `0aff69010775dcd9bfd024303e33e481d9d78dd7cd33ab57bed032a2cae154d2` |

The product report digest is
`91b28deeb1678ad217e8a272c9499f89a2e483c038ed4423826e57c2bf2f7b97`.

## Verification commands and exit codes

All commands below completed before this report was added, unless noted otherwise.

| Command | Exit | Result |
|---|---:|---|
| `git rev-parse HEAD; git rev-parse HEAD^{tree}; git status --porcelain --untracked-files=no` | 0 | exact baseline and clean tracked state |
| `npm run v36g2:product -- preflight ...` | 1 | PowerShell blocked `npm.ps1` before npm/product start; no access |
| `npm.cmd run v36g2:product -- preflight ...` | 0 | frozen zero-access preflight passed |
| Gate H Pi commit/status check | 0 | pinned Pi exact and clean |
| Gate H Docker version/context/info/image/leftover checks | 0 | exact Docker identity, image local, zero leftovers |
| Actual `npm.cmd run v36g2:product -- run ...` with corrected ignored preload | 0 | applied Journey; one Session, two Turns |
| Read-only Source inventory/hash check | 0 | exactly three final Source files; only implementation changed |
| Read-only evidence terminal/session/change-set/receipt checks | 0 | all expected identities and digests match |
| Post-Journey exact-name `v36g2-` container query | 0 | zero leftovers |
| Frozen Docker Verifier `node --test` | 0 | 3 passed, 0 failed, 0 skipped |

After the report was added, tracked Git status is intentionally one uncommitted file:
this report. No source, fixture, test, Manifest, Authority, Contract, Charter,
`CURRENT_STATE.md`, `AGENTS.md` or Pi file was edited, staged or committed.

## Remaining limitations

**Fact:** This single Journey does not prove process-crash durability between Source
mutation and receipt persistence, multi-file atomicity, automatic rollback, exactly-once
Tool effects, arbitrary-project compatibility, general container security, protection
from Docker/Host compromise, multi-backend portability, or statistical coding
effectiveness.

**Fact:** The real evidence demonstrates one bounded product Journey for the frozen
dependency-free duration-parser fixture and fixed DeepSeek route. It does not establish
general model quality or behavior outside this protocol.

## Main handoff

The raw evidence is under
`.runs/v3-6/g2-real/journey-20260811-01/`. The Session has no source-edit, control-state,
commit or further-real-execution authority. Main should review this report and the raw
evidence, then decide whether to accept the recommendation
`PASS_V3_6_G2_REAL_PRODUCT_ACCEPTANCE`.
