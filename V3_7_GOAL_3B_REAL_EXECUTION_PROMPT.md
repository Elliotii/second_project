# V3.7 Goal 3B One Frozen Real Full Loop Execution Prompt

> Status at freeze: `FROZEN_PENDING_SEPARATE_EXPLICIT_REAL_ACCESS_AUTHORIZATION`.
> This Prompt must not be dispatched merely because it exists.

You are the fresh, dedicated, no-source-edit Goal 3B real acceptance Session required by
`V3_7_CHARTER.md`. Main will supply the exact execution-baseline commit/tree and an
explicit user real-access authorization in the launch message. If either is absent, stop
before Credential resolution, Provider construction, workflow creation or execution.

## 1. Authority and immutable baseline

Read completely, in order:

1. `AGENTS.md` and `CURRENT_STATE.md` from the supplied Execution Baseline;
2. `V3_7_CHARTER.md`, especially Sections 4, 8 and 9;
3. `docs/reports/V3_7_G3B_FREEZE_PROPOSAL.md`;
4. `V3_7_G3B_HOST_EXECUTION_PORT_BRIDGE_AUDIT_REMEDIATION_AMENDMENT.md`;
5. `docs/reports/V3_7_G3B_HOST_EXECUTION_PORT_BRIDGE_CLOSEOUT.md`;
6. `docs/reports/V3_7_G3B_HOST_EXECUTION_PORT_BRIDGE_AUDIT_REMEDIATION_AFFECTED_FINDING_REAUDIT.md`;
7. this exact Prompt and only the directly required tracked production source.

The frozen source/configuration parent is:

```yaml
source_freeze_commit: 63ffcda3121d19cb46e1d9fdd5402fb69a1abf1a
source_freeze_tree: b1530425b9ea95f641bdf50e1ccf714319c71493
accepted_bridge_candidate_commit: 4e86f0ecdaa1edc890ada922cfb4ce4e0b9c2227
accepted_bridge_candidate_tree: 820a212aeeeea3a8f094f8d3f81c3aa28fbaed3e
configuration_candidate_commit: cd380652dc332b875c41055c95d53fb687368732
configuration_candidate_tree: 72318985ad0f016c5a1f227cbabc052eb0906256
execution_baseline_commit: SELF_RESOLVED_BY_MAIN_FREEZE_RECORD
execution_baseline_tree: SELF_RESOLVED_BY_MAIN_FREEZE_RECORD
execution_prompt_sha256: SELF_RESOLVED_BY_MAIN_FREEZE_RECORD
```

The fresh execution worktree must start at the exact Main-supplied Execution Baseline.
Before any real boundary, verify HEAD/tree, the clean tracked worktree, the five frozen
Git blobs below, and that the accepted bridge Candidate remains an ancestor. Ignored
`.runs/` output is allowed only after Gate H. Any mismatch is a zero-call Hard Stop.

| Frozen path | Git blob at source freeze |
|---|---|
| real Manifest | `dc3a50d68a3222e1330f465f2ef9efbc7122e74c` |
| accepted Envelope | `7fc57194f00636933a56d5f6ab7aff772b9bfc4d` |
| follow-up profile | `0c1c9f2349c7db9a3d5b22ef9dd94e6693f7eae9` |
| canonical registry | `c1a0916bd0c1b54217ce155cd5759c33a2e3723e` |
| Host real-port bridge | `82e334e5bcc425ca34f3ce2ac08aebc1810a5149` |

## 2. Frozen Case and content identities

The single Case is `v37-real-recovery-promote-retain`, Project
`v37-real-recovery-project`. The canonical bytes at the preceding paths are the exact
Manifest, Envelope, follow-up profile and registry; do not reconstruct or normalize
them. Their binding identities are:

```yaml
manifest_body_digest: a1464d12cb1dd509b4b300282fcdb5ebdf59fdf52f55d9bcd49e49aa5bbb262d
registration_digest: 1e6a74edc68954e044815322ec65c2e163e2258c00b63527d29b0ea12a6dd52a
follow_up_execution_profile_digest: e3789fe9eeedac96164836b306c239a5ac65bff618d21a631b7d391edd10cbc9
registry_index_digest: cd4da08a8d3d6daac317ac6bbe04b8a70a424fc079589a66598eced4bb51b762
candidate_proposal_authority_digest: e3945b699b9140d374514e20faf3c14b35e778c707a4f6e47ed0b657e8f61150
regression_authority_digest: 3a7e7e603d6e071922b83ba1789aa2056134163a1b3edb04a8af902613bb49da
```

Primary is the frozen `v1-parse-duration` task:

```yaml
task_sha256: d2c7c3b085b351ce868ca2a6706f103f07a037e1320ab1bd1702d988a0f09cec
instruction_sha256: cc4c17609f1031774e4be4bc0cc9d8afff671a11f019b2515c304d9a4a1be262
workspace_source_digest: 5690aab9c1e7eb3905258c342d7bad4504e23377c18fec9fde39f22f9a99defa
verifier_source_sha256: 0924cb0f56e43a56dc74b262539f2ad0700b2cb2a43da26a9415b7e9ffaf21da
problem_trigger: verifier-failure
recovery_a: continue_failed_session
recovery_b: fresh_session_from_failure_seed
comparison_profile: v37-v2a-two-path-selector-v1
```

Candidate is exactly one `prompt_addendum`, with no reproposal unit:

```yaml
template_id: v37-verify-before-finish
content_sha256: 1341b7b213c788c3d17ced324ba46da316c091af8d43182d02f589add792cc8f
task_kinds: [typescript-maintenance]
failure_families: [verifier-failure]
reproposal: 0
```

Regression is the registered symmetric Base/Candidate Pair for pack
`typescript-verifier-failure`. Follow-up is the frozen
`v37-g1-det-follow-up-clamp-retries` task, source SHA-256
`77271bd589e03e3d3b54dd25db95877baf5f45b3b21917b9e4e67893776f8c11`,
task-body SHA-256
`4ff40dfc9c27c3083b2694175ea34f78ceecf522202a894f91c7fd614c8a73b8`,
Verifier SHA-256
`2a4019af3501332b9c53365ed907120b2c9e496de59ebf37c4fd8dab78d4ec87`,
and registered command `node --test verifier/follow-up.test.mjs` with command SHA-256
`4b54db2265af6b195de93467a95970bdac4a1d7f2a5a3af85a628e9f84305033`.

## 3. Provider, Runtime, Tool, command and Docker identities

- Provider/model for both compositions: `deepseek` / `deepseek-v4-flash`.
- Runtime compositions: exactly `v2b_primary_recovery` and
  `post_v35_later_stages`; one opaque Credential resolver invocation for both.
- Primary Tool profile: `bounded_tools_v1` with no retry/fallback.
- Follow-up profile: `v36_daily_bounded_edit_v2`, request observation threshold `16`,
  hard maximum `24`, only registered bounded workspace tools plus `run_command`.
- Follow-up command: current Node executable, registered descriptor
  `follow_up_test`, Docker network `none`.
- Docker: Desktop `4.85.0 (235549)`, client/server `29.6.2`, context
  `desktop-linux`, Linux `amd64`, local image
  `node@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03`.

Gate H must use the accepted local Docker identity checks without pulling an image,
installing anything, scanning ports or contacting any unrelated host. A Docker mismatch,
missing pinned local image or leftover exact V3.6/V3.7 execution container is a zero-call
stop. Only the Host-side DeepSeek transport is allowed external network access after
explicit authorization; Docker runtime network remains `none`.

## 4. Frozen budgets

| Unit | requests | combined tokens | Tools | commands | wall time | USD |
|---|---:|---:|---:|---:|---:|---:|
| Primary | 16 | 131072 | 24 | 1 | 900000 ms | 0.20 |
| Recovery A | 16 | 131072 | 24 | 1 | 900000 ms | 0.20 |
| Recovery B | 16 | 131072 | 24 | 1 | 900000 ms | 0.20 |
| Candidate proposal | 1 | 16384 | 0 | 0 | 120000 ms | 0.20 |
| Regression Base | 16 | 131072 | 24 | 1 | 900000 ms | 0.20 |
| Regression Candidate | 16 | 131072 | 24 | 1 | 900000 ms | 0.20 |
| Follow-up | 24 | 131072 | 24 | 1 | 900000 ms | 0.20 |
| Global | 105 | 802816 | 144 | 6 | 5520000 ms | 1.40 |

Access maxima are one Credential resolver invocation for the whole bridge, at most 105
network/Provider/model requests globally, Primary/Recovery registered maxima
`1/48/48/48`, and follow-up registered maxima `1/24/24/24`. Limits are ceilings, not
targets. Unknown usage or cost is terminal invalidity.

## 5. Exact pre-dispatch and execution sequence

Before dispatch, create one fresh ignored root under `.runs/v37/g3b/real/`. Use
`createRealExecutionPortBridgeV37G3B` with only the exact authority tuple above and the
existing `createDeferredCredentialFileResolverV35` mechanism. The dispatch handoff will
name the opaque Host Credential file; do not open it in the parent shell, print/hash/size
it, enumerate the environment or copy it. Resolution may occur only inside the bridge at
the first authorized dispatch boundary.

An ignored runtime driver is allowed only as a mechanical consumer of the accepted
factory and Product service. It must not define or replace a port, authority, Manifest,
task, Verifier, Candidate, Regression result, receipt or transition. Before workflow
creation, assert Case availability, exact two Runtime composition identities, empty
completed units, null in-flight reservation and zero counters.

Create exactly one workflow, then invoke these actions once and in order:

```text
run_primary
run_recovery
confirm_recovery_evidence
request_recovery_admission
produce_candidate
run_regression
run_follow_up
confirm_follow_up_evidence
request_follow_up_admission
assess_state
```

After each action, persist only sanitized stage/receipt/counter/digest observations in
the ignored root. Do not persist model text, prompts beyond already frozen content,
Provider payloads, headers, Credential values or environment contents. Stop at the first
honest negative, invalid or unavailable action and report `closed_incomplete`; do not
force later actions. `retain` and `needs_reassessment` are both valid final Assessments
after a complete valid chain.

After any Provider dispatch, Tool/command side effect or unit-specific execution
artifact, there is no restart, retry, fallback, replacement, rerun, task swap, Candidate
reproposal or result hunting. Regression Base/Candidate are indivisible and neither arm
may rerun alone. A mechanical launch may repeat only when Provider, Tool/command and
unit-artifact counts are all exactly zero and Main records that precondition.

## 6. Closure, user check and report

After terminal execution, close the execution bridge. Reopen the same workflow through a
new bridge instance configured with a resolver that throws on use, wrap its product
service in the accepted V3.7 loopback WebUI, and expose only `127.0.0.1` on a fresh port.
No action or model call is allowed during reopen or user review.

Stop and let the user independently locate the Case/workflow and explain the final
stage, Primary/A/B/Comparison, Evidence, Diagnosis/Lesson/Candidate,
Regression/Decision/State, binding, follow-up Verifier/Outcome, second admission and
Assessment. Provide navigation help only if a genuine UI block occurs and record it.

Write exactly one uncommitted tracked report:

`docs/reports/V3_7_G3B_REAL_EXECUTION_REPORT.md`

It must record baseline and artifact identities, workflow/Run/Session/Workspace IDs,
per-unit/global counters and cost, Credential read count without value, Docker/Verifier
results, final Assessment, user-check result, tracked status, unverified items and one
truthful disposition. Do not edit source, test, fixture, configuration, Prompt, Charter,
control state or Pi; do not stage or commit. Return to Main for final inspection and
`V3_7_FINAL_CLOSEOUT.md`.

If explicit real-access authorization or the exact dispatch handoff is absent, report
`NOT_STARTED_REAL_ACCESS_LOCKED` and stop with `0/0/0/0`.
