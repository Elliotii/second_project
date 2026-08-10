# V3.6 Goal 1 Implementation Report

```yaml
status: implementation_complete_pending_main_review
goal_id: V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE
control_baseline_commit: 9a7c61f0c8d7b4febd0aacbf4b5a74c4d6a164ef
control_baseline_tree: 716fa06558f273b557fb58f930dd00b557a7769c
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
implementation_owner: dedicated_top_level_goal_1_session
recommended_disposition: PASS_V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE
goal_acceptance_owner: Main_Session
implementation_commit: resulting_single_commit_reported_in_session_handoff_and_ignored_commit_identity
credential_reads: 0
external_network_requests: 0
external_provider_calls: 0
real_model_calls: 0
docker_project_command_executions: 0
project_command_executions: 0
pi_core_patches: 0
```

## 1. Outcome

**Fact:** Goal 1 is implemented within the Contract allowlist. The new V3.6 path accepts only the exact safe browser task schema, resolves a Host-owned registered Project Profile, generates Session/Run/Workspace IDs on the Host, creates a bounded link-free managed copy, pins immutable Session identities, writes exact-schema/digested Run Authority before the deterministic dispatch seam, and continues the same public Pi JSONL Session through a second Turn.

**Fact:** Interactive tasks remain `unverified`, have `formal_outcome: null`, and remain ineligible for comparison, adaptation, and promotion. Goal 1 exposes only `workspace_read` and `workspace_list` to the new deterministic Agent path. No edit/write/search subprocess/`run_command` tool is exposed; project-command and Docker-command counters remain zero.

**Fact:** The V3.5 application remains composed into the V3.6 loopback server. Its accepted routes and static protections passed the affected regressions.

**Fact:** Main's bounded review found two concrete defects in the first Candidate. Both are corrected in the amended Candidate: the canonical capability digest now records actual Goal 1 `file_write: false` plus an explicit mode-dependent `planned_file_write`, and unexpected non-`HttpError` HTTP failures now return only the fixed generic message `request rejected`.

**Recommendation:** Main may review this Candidate for `PASS_V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE`. This Session does not accept the Goal or authorize Goal 2.

## 2. Contract Gate A

Gate A completed before source editing.

| Check | Observed result |
|---|---|
| Git commit | `9a7c61f0c8d7b4febd0aacbf4b5a74c4d6a164ef` |
| Git tree | `716fa06558f273b557fb58f930dd00b557a7769c` |
| tracked status | clean |
| Charter / Contract | `accepted_activated` / `accepted_activated` |
| pinned Pi path | `D:/AI/AI_Projects/project2/.upstream/pi` |
| pinned Pi commit / status | `027a5847901b5dde30270abaa1041046cd2b4b55` / clean |
| emitted public runtime | existing `D:/AI/AI_Projects/project2/.runs/g006/pi` |
| public imports | `AgentHarness`, `Session`, `JsonlSessionRepo`, `NodeExecutionEnv` all functions |
| emitted type entries | public `index.d.ts` and `node.d.ts` present |
| Goal 1 Docker prerequisite | none |
| zero-access counts | Credential/network/Provider/real model `0/0/0/0` |

Ignored Gate record: `.runs/v3-6/g1/gate-a.json`, SHA-256 `3b27971a7eda56815b176669c125cbfc8c79f45688b191db417da610343d7a58`.

## 3. Implementation

### Host registry and safe input

- `ProjectProfileRegistryV36` validates exact Host registrations, canonical ordinary Source roots, safe browser labels, supported modes and distinct read-only Pi Skill/Harness Adaptation descriptors.
- Safe project projections omit Source roots, writable/protected paths, command descriptors, environment, Credentials and Provider/model configuration.
- `parseBrowserTaskRequestV36` accepts only `project_id`, `requested_mode`, `task_text`, optional `title` and optional existing `session_id`. Run IDs and all authority fields are rejected if supplied by a client.

### Session, managed copy and immutable Authority

- New Sessions use server-generated IDs and a bounded managed copy that rejects links, hardlinks, unsupported file kinds and file/byte-limit overflow; root `.git` is not copied.
- The Session pin binds Project Profile, Source snapshot, code, Harness State, backend profile, Provider/model policy and capability digests.
- Existing Sessions keep their pinned Source/State identities even if current Source/Active State changes. A new Session resolves current Source and State. Profile/backend/provider/capability drift rejects continuation.
- Interactive Authority and Evidence are exact-key, canonical-digest, write-once artifacts. Missing, duplicate or tampered Authority/Evidence fails closed.
- Authority is written and validated before the injected dispatch seam. Tests observe the artifact from inside that seam.

### Public Pi Session path and capabilities

- `PersistentInteractiveSessionServiceV36` uses only public `JsonlSessionRepo`, `AgentHarness`, `NodeExecutionEnv` and Faux Provider exports.
- A fresh-process test runs Process A and Process B separately, reopens the same JSONL Session, reconstructs prior context and settles both Turns.
- The active Agent tool surface is exactly `workspace_read` plus `workspace_list`. `bounded_edit` is truthful planned metadata only in Goal 1: actual file write remains false, with a separate planned-write flag.

### Safe Read Model and WebUI

- Session/Authority/risk/eligibility projections contain only opaque IDs, digests and bounded safe text.
- Managed Workspace tree and UTF-8 text preview are read-only, file/byte bounded, canonical-path/reparse safe, and reject traversal, binary, oversized, link and unsupported-file cases.
- Pi native Skills and Harness Adaptations/bindings are visibly distinct, descriptive and read-only.
- The additive bilingual UI supports registered project selection, free-text task entry, new/continue pinned flow, Authority/risk explanation and Workspace inspection.
- The V3.6 server remains fixed to `127.0.0.1`, retains legacy V3.5 routes, rejects malformed paths/bodies/methods/content types and serves only fixed static assets.

### Main bounded corrections

- Capability identity and the safe Session view now use the same actual/planned write semantics. A focused test independently recomputes the canonical digest for both `inspect_only` and `bounded_edit`, reads the stored Session pin and compares it with the safe projection.
- The loopback server preserves vetted `HttpError` messages but replaces every unexpected error message with `request rejected`. An HTTP regression forces a missing-Session filesystem error whose internal message contains an absolute data path and an authority/secret-bearing Session ID, then proves none of those values or filesystem diagnostics reach the response.

## 4. Verification commands and results

All commands ran from `workbench/` unless stated otherwise.

| Command | Exit | Result |
|---|---:|---|
| `git rev-parse HEAD; git rev-parse 'HEAD^{tree}'; git status --porcelain=v1` | 0 | exact baseline; clean |
| `git -c safe.directory='D:/AI/AI_Projects/project2/.upstream/pi' -C ... rev-parse HEAD/status` | 0 | exact pinned Pi; clean |
| public emitted import smoke through `scripts/v35g2-public-pi-loader.mjs` | 0 | four required public runtime exports available; public type entries present |
| `node D:/AI/AI_Projects/project2/.runs/g006/pi/node_modules/typescript/bin/tsc -p tsconfig.v35g2.json --noEmit` | 0 | strict TypeScript passed |
| `npm.cmd run v36g1:test` | 0 | 9 passed, 0 failed/skipped |
| `node --experimental-loader ./scripts/v36g1-regression-loader.mjs --test --test-concurrency=1 tests/v35-persistent-session.test.ts` | 0 | V3.5 persistent Session/Read Model regression 6/6 |
| `npm.cmd run v35g3:test` | 0 | V3.5 application/API/i18n/Inspector regression 11/11 |
| `npm.cmd run postv35:enablement:test` | 0 | Post-V3.5 product-enablement regression 11/11 |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs scripts/start-v36g1-demo.ts --port 0 --smoke` | 0 | loopback start and deterministic stop; listener count 0 |
| `node --experimental-loader ./scripts/v35g2-public-pi-loader.mjs scripts/v36g1-evidence.ts ../.runs/v3-6/g1/final-evidence-amended-r2` | 0 | corrected Candidate: two settled Runs; generated Evidence Index written |
| `git diff --check` | 0 | no whitespace errors |
| `$goalFiles = @(git diff --cached --name-only 9a7c61f0c8d7b4febd0aacbf4b5a74c4d6a164ef); node --experimental-loader ./workbench/scripts/v35g2-public-pi-loader.mjs ./workbench/scripts/v36g1-secret-scan.ts @goalFiles` (repository root) | 0 | 22 files scanned; zero matches |

The historical `npm.cmd run v35g1:test` command initially could not start its child process because its accepted test hardcodes a worktree-local ignored V3.5 loader that is absent in this fresh worktree. No test assertion or product source failed. `scripts/v36g1-regression-loader.mjs` changes only that test-harness loader path at load time to the already-present canonical public emitted loader; the unchanged six V3.5 tests then passed 6/6. This is an infrastructure path bridge, not an accepted-semantic change.

Combined final test result: **37 passed, 0 failed, 0 skipped** (`9` Goal 1 + `6` V3.5 persistent + `11` V3.5 Goal 3 + `11` Post-V3.5).

## 5. Raw evidence and important digests

Canonical amended evidence root: `.runs/v3-6/g1/final-evidence-amended-r2/`.

- Goal-level amended Evidence Index: `.runs/v3-6/g1/amended-evidence-index.json`, SHA-256 `218973120b09c61e453bc71726064837128f8800dad45dca3907ffde4b97cf73`
- Generated Evidence Index: `9023580ce750851dc8c2286f2efc136de6cb19fe0640985302ad1f0828edfb62`
- Indexed pre-Index inventory digest: `040e7136c2c1a1a2f3d0969b6b49c545a04b7f085a1109eb7185d5bd70299003`
- Verification summary: `cc0bb0f00c0cc9fdd6c66ccbedc3914f581d293e6afd47ea83cfd29efecb3b8b`
- Session pin digest: `72ac7ab6431c3adbde7e840f127be597d6f8a8c8d08aee59c8e727eeec286ab7`
- Capability digest: `aadcc809ad17ac8dc8c942de146abc78848160e37ce46a7009c633a2f11f1710`
- code identity: `07c35b8eee38d052fd9d4c1b36a316fec0a9f5a7126b73a33e6c2c1320e0dfff`
- Turn 1 Authority / result file SHA-256: `4c1f38148a627d6c0e269bdc69f7db89f6c5592824f6d191010b37a33e696cbc` / `6b699f2e8741a2707e0539be9f20d107fdf8616bb390d7717e0c73fadf7b6e50`
- Turn 2 Authority / result file SHA-256: `1ffc390f5548f10d1e50b59325887fb415c5f92a89bbb83137f1ec546f4ac8f0` / `68a9ca1977d0b62977f92a8e2f2b45418f5f1b32dd9d4354e299202faca30126`

The evidence generator retains its original embedded `.runs/v3-6/g1/final-evidence` label. The Goal-level amended Evidence Index records the canonical actual `final-evidence-amended-r2` root and authenticates the generated index and important artifacts; no prior evidence was overwritten.

The final bounded commit SHA/tree are emitted in the Session handoff and written after commit to ignored `.runs/v3-6/g1/commit-identity.json`. A tracked file cannot contain the SHA/tree of the same commit without creating a self-reference.

## 6. Source Delta

The final staged delta is **22 files, 2,045 insertions and 5 deletions** and is limited to the Contract allowlist:

- new V3.6 contracts, Host Project Registry, managed-copy/preview adapter, persistent public-Pi Session service, Authority/control plane and WebUI application/server;
- additive V3.6 scripts for demo, cross-process test, evidence generation, secret scan and the historical regression loader-path bridge;
- three Goal-focused test files;
- additive static UI/i18n and bounded Workbench README/package scripts;
- this Implementation Report and the Closeout Draft.

No `CURRENT_STATE.md`, `AGENTS.md`, Charter, Contract, accepted Closeout, Pi, tracked reference, fixture Source, V3/V3.5 core Authority module or Source project was modified.

## 7. Remaining limitations and audit trigger

**Fact:** Goal 1 does not prove Docker containment, a registered project-command path, actual bounded file editing, ChangeSet formation, Apply/Discard/Export, Source mutation, a real Provider/model Journey, real-model continuation, in-flight crash recovery, exactly-once Tool effects, multi-writer durability or production multi-user security.

**Fact:** Workspace previews intentionally reject files above 128 KiB, binary data, links, hardlinks and total managed Sources beyond the frozen Goal 1 bounds. The browser click-preview route supports the conservative unescaped filename subset shown by the UI; the application-level preview safely supports all valid bounded relative paths.

**Fact:** The new implementation changes the Authority and safe-projection boundary, so it received focused fail-closed tests and a risk-focused self-review. That review found and corrected one intermediate design issue before final evidence: the accepted V3.5 deterministic service exposed a larger tool schema than Goal 1 permits. The final Candidate instead uses a V3.6 public-Pi Session adapter whose exact active surface is read/list only.

**Recommendation:** No concrete unresolved high-risk Authority/Credential/safe-projection finding remains that requires a separate audit under the Contract. Main may still choose a focused audit based on its independent review; no audit is automatically requested by this Session.

## 8. CURRENT_STATE_UPDATE_PROPOSAL

```yaml
CURRENT_STATE_UPDATE_PROPOSAL:
  active_goal: V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE
  goal_1_status: implementation_complete_pending_main_review
  goal_1_implementation_owner: dedicated_top_level_goal_1_session
  goal_1_control_baseline_commit: 9a7c61f0c8d7b4febd0aacbf4b5a74c4d6a164ef
  goal_1_control_baseline_tree: 716fa06558f273b557fb58f930dd00b557a7769c
  goal_1_implementation_commit: use_exact_commit_from_session_handoff
  goal_1_implementation_tree: use_exact_tree_from_session_handoff
  goal_1_recommended_disposition: PASS_V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE
  goal_1_strict_typescript: passed
  goal_1_focused_tests: 9_passed_0_failed_0_skipped
  goal_1_affected_regressions: 28_passed_0_failed_0_skipped
  goal_1_total_tests: 37_passed_0_failed_0_skipped
  goal_1_demo_smoke: loopback_started_and_stopped_listener_count_0
  goal_1_evidence_index_sha256: 218973120b09c61e453bc71726064837128f8800dad45dca3907ffde4b97cf73
  goal_1_credential_reads: 0
  goal_1_external_network_requests: 0
  goal_1_external_provider_calls: 0
  goal_1_real_model_calls: 0
  goal_1_project_command_executions: 0
  goal_1_docker_project_command_executions: 0
  goal_1_pi_core_patches: 0
  goal_1_audit_trigger: no_concrete_unresolved_high_risk_finding
  goal_1_acceptance_owner: Main_Session
  goal_2_status: not_started_requires_goal_1_acceptance_and_docker_readiness
```
