# V3.6 Goal 1 — Dedicated Implementation Session Start Prompt

```yaml
status: consumed
session_id: 019feb69-6ead-7093-85ad-b8e508c26d6f
resulting_implementation_commit: 81bc7c8b5667efaa0c10df507a7a0d2a59827e1e
```

You are the new top-level Dedicated Implementation Session for:

```text
V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE
```

Start only from this exact clean Control Baseline:

```yaml
git_commit: 9a7c61f0c8d7b4febd0aacbf4b5a74c4d6a164ef
git_tree: 716fa06558f273b557fb58f930dd00b557a7769c
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
```

## Required first action

Run Contract Gate A before editing. Read completely, in order:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V3_6_CHARTER.md`;
4. `docs/第二项目_Codex交接包_2026-07-30/V3_6_G1_GOAL_CONTRACT.md`;
5. the Planning, Selection and Long-Running Execution Plan named by the Contract;
6. the V3.5/Post-V3.5 Closeouts named by the Contract;
7. the relevant existing Workbench source/tests;
8. every applicable pinned Pi `AGENTS.md` before making Pi source claims.

Verify exact Git and Pi identity, clean tracked state, public emitted Pi import/type-path availability and zero access counts. If the starting commit differs, tracked files are dirty, Pi differs/is dirty, or a public import cannot be established from existing local artifacts without download/Pi mutation, stop with a Pause Report.

## Authority

Implement only the accepted Goal 1 Contract. You may:

- edit only the Contract allowlist;
- create ignored `.runs/v3-6/g1/**` runtime/evidence material;
- run narrow/focused deterministic tests plus required regressions;
- fix ordinary Contract-local defects;
- create exactly one bounded implementation commit on your task branch after all required tests pass.

You must not:

- modify/stage `CURRENT_STATE.md`, `AGENTS.md`, the Charter, Contract or accepted Closeouts;
- use Credential, external network, Provider/model or real-model access;
- require or invoke Docker;
- execute Host project commands through the new open-task path;
- modify Pi, use private Pi imports, download/install dependencies, switch SDK/Extension/RPC route or add a second backend;
- implement Goal 2 ChangeSet/Apply or Source mutation;
- accept the Goal or change the Version claim/scope.

The allowed counts are exactly:

```yaml
credential_reads: 0
external_network_requests: 0
external_provider_calls: 0
real_model_calls: 0
docker_project_command_executions: 0
pi_core_patches: 0
```

## Implementation priority

Prefer composition and thin V3.6 adapters over edits to accepted V3/V3.5 semantics. Keep the browser schema exact and safe, mint IDs and Authority on the Host, persist Authority before the dispatch seam, pin Session identities, keep free tasks unverified/ineligible, and make workspace/Skill/Adaptation views read-only. Do not build a generic registry, permission system, editor, terminal, backend abstraction or new Agent loop.

## Verification and stop

Satisfy every Contract test and Exit Criterion. Ordinary TypeScript/path/fixture/HTTP/UI defects are handled in this Session. Stop immediately on a Contract Pause Condition or needed allowlist/core-architecture expansion.

Return and then stop with:

- `docs/reports/V3_6_G1_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_6_G1_CLOSEOUT_DRAFT.md`;
- ignored Evidence Index and important artifact digests;
- exact commands, exit codes and test counts;
- Source Delta and secret scan;
- exact bounded implementation commit SHA/tree;
- structured `CURRENT_STATE_UPDATE_PROPOSAL` in the Implementation Report;
- explicit remaining limitations and whether any audit-triggering high-risk boundary remains.

Do not continue to Goal 2.
