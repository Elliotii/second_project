# V3.6 Goal 1 Contract — Open Authority and Pinned Session Control Plane

```yaml
status: closed_accepted
goal_id: V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE
accepted_by_user: 2026-08-10
execution_owner: new_top_level_goal_1_implementation_session
version_owner: Main_Session
control_baseline: 9a7c61f0c8d7b4febd0aacbf4b5a74c4d6a164ef
implementation_commit: 81bc7c8b5667efaa0c10df507a7a0d2a59827e1e
disposition: PASS_V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE
implementation_commit_authorized: one_bounded_goal_branch_commit
credential_reads_authorized: 0
external_network_authorized: false
external_provider_calls_authorized: 0
real_model_calls_authorized: 0
docker_required: false
pi_core_patch_authorized: false
```

## 1. Objective

Implement the zero-call control plane required to turn the accepted V3.5 persistent inspector into a Host-authorized open-task product surface, without enabling Docker command execution or Source write-back.

Goal 1 proves:

> a browser can request a free-text task using only safe opaque input; the Host mints and persists immutable Run Authority, creates or continues a pinned persistent Session, uses the existing Direct Pi/Faux path, exposes truthful unverified Evidence and safe read-only context, and does not allow the browser or Agent to broaden authority.

## 2. Required reading and Gate A

Before editing, the dedicated Session must read completely:

1. `AGENTS.md`;
2. `CURRENT_STATE.md`;
3. `docs/第二项目_Codex交接包_2026-07-30/V3_6_CHARTER.md`;
4. this Contract;
5. `docs/reports/V3_6_OPEN_INTERACTIVE_AGENT_MODE_PREIMPLEMENTATION_PLANNING.md`;
6. `docs/reports/V3_6_EXECUTION_BACKEND_SELECTION_REPORT.md`;
7. `docs/reports/V3_6_LONG_RUNNING_EXECUTION_PLAN.md`;
8. `docs/reports/V3_5_CLOSEOUT.md` and `docs/reports/POST_V3_5_MAINTENANCE_CLOSEOUT.md`;
9. the existing V3.5 application/server/session/read-model/tool/workspace files referenced by the Charter;
10. applicable pinned Pi `AGENTS.md`, public `AgentHarness`/`Session`/`JsonlSessionRepo` exports and tests before making Pi claims.

Gate A must record:

- exact starting Git commit and clean tracked status;
- this Contract and Charter status;
- Pi commit `027a5847901b5dde30270abaa1041046cd2b4b55` and clean status;
- public emitted Pi import/type-path smoke using only existing local artifacts;
- zero Credential/network/Provider/model counts;
- no Docker prerequisite for Goal 1.

A registered untracked `reference/` or ignored `.runs/` presence is not a dirty tracked baseline. Do not add, delete or commit it.

## 3. Scope

Implement only:

1. a thin Host-owned Project Profile Registry with opaque project IDs and a browser-safe projection;
2. server-generated Session and Run IDs for open-task creation;
3. a new Interactive Run Authority schema and write-once persistence before any external-dispatch seam;
4. pinned project/profile/workspace/code/state/backend/provider-policy/capability identities across a Session;
5. explicit continue-pinned versus new-Session-with-current-State behavior;
6. separate interactive evidence namespace and truthful `unverified`/ineligible semantics;
7. `inspect_only` and planned `bounded_edit` profile projection, while Goal 1 executes no Host/Docker project commands;
8. WebUI project selection, free-text task entry, mode/risk/authority context and new/continue flow;
9. bounded read-only managed Workspace tree and text preview with path/reparse/size/binary safety;
10. read-only Pi native Skill versus Harness Adaptation/binding visibility;
11. deterministic/Faux two-Turn continuity through existing persistent Session/Pi public paths;
12. focused tests and reports.

Goal 1 must prefer new V3.6 adapters/contracts over altering accepted historical semantics. It may reuse existing V3/V3.5 modules by composition.

## 4. Allowed source and report paths

The Implementation Session may add or modify only:

- `workbench/src/contracts/v36*.ts`;
- `workbench/src/v36/**`;
- `workbench/src/project/**`;
- `workbench/src/session/*v36*.ts`;
- `workbench/src/read-model/*v36*.ts`;
- `workbench/src/webui/*v36*.ts`;
- `workbench/src/webui/static/**` for additive V3.6 UI and bilingual text;
- `workbench/src/workspace/*v36*.ts` for safe read-only preview only;
- `workbench/scripts/*v36*`;
- `workbench/tests/v36g1*.test.ts` and Goal-local fixtures;
- `workbench/package.json` and a Goal-local tsconfig only when required for deterministic commands;
- `workbench/README.md` only for bounded Goal 1 usage/limitations;
- `docs/reports/V3_6_G1_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_6_G1_CLOSEOUT_DRAFT.md`;
- ignored `.runs/v3-6/g1/**` evidence/runtime bridge.

The Session must not modify `CURRENT_STATE.md`, `AGENTS.md`, this Contract, the Charter, accepted Closeouts, existing V3/V3.5 Authority semantics, tracked reference material, Pi, credentials or any Source project used by fixtures. If an excluded accepted-core file is genuinely required, stop and report the concrete symbol/reason; do not silently expand the allowlist.

## 5. Binding design rules

- Browser input is exact-schema and limited to `project_id`, requested mode, task text, optional title and optional existing Session ID.
- Browser may not send Host path, argv, env, command, Credential, Provider/model, budget, Verifier, State digest or backend identity.
- New Session/Run IDs are generated server-side and cannot collide or be supplied by the client.
- Authority is canonicalized, digested and write-once persisted before the executor/provider seam is invoked. Tests must observe this ordering without a real provider.
- A continued Session must reject project/profile/workspace/code/state/backend/provider-policy/capability drift.
- A new Session may resolve current registered Source and Active State; an existing Session may not silently upgrade.
- Interactive free tasks remain `formal_outcome: null`, unverified and ineligible for comparison/adaptation/promotion.
- `inspect_only` exposes no write tools or command tool. `bounded_edit` in Goal 1 may expose planned capability metadata/file-tool behavior but must not execute registered commands until Goal 2 Docker integration.
- Safe projections contain no absolute Host paths, argv/env, Credential refs/tokens, internal Authority roots or secret-bearing payloads.
- File preview is managed-workspace-only, read-only, canonical/reparse safe, bounded by file count/bytes and rejects binary/oversized data.
- Skill/Adaptation visibility is descriptive and read-only; it does not install, edit, promote or activate anything.
- Existing V3.5 and Post-V3.5 endpoints/flows remain compatible.

## 6. Required tests and evidence

At minimum demonstrate:

1. exact browser schema accepts only the safe fields;
2. Host path/argv/env/Credential/Provider/budget/Verifier/State/backend injection is rejected;
3. Session/Run IDs are server-generated;
4. immutable Authority exists and validates before a deterministic dispatch seam;
5. Authority tamper, missing artifact or duplicate write fails closed;
6. same Session preserves project/code/state/profile/backend/provider-policy/capability identities across two Turns;
7. current Active State or Source changes affect only a new Session;
8. free task stays unverified with null formal Outcome and all eligibility flags false;
9. `inspect_only` has no write/command ability and Goal 1 does not run project commands;
10. safe project/Session/Authority projections disclose no Host path or secret material;
11. managed Workspace tree/text preview is read-only and path/reparse/size/binary bounded;
12. Pi Skill and Harness Adaptation/binding are visibly distinct and read-only;
13. deterministic/Faux new Session plus second Turn settles and is inspectable after reopen;
14. loopback-only HTTP, malformed-body/path and static-asset protections remain intact;
15. strict TypeScript, new focused tests and affected V3.5/Post-V3.5 regressions pass;
16. Pi remains pinned/clean and tracked source/evidence contains no secrets.

Raw evidence belongs under ignored `.runs/v3-6/g1/`. The tracked Implementation Report must list exact commands, exit codes, test counts, source delta, relevant artifact digests and all remaining limitations.

## 7. Exit criteria

Goal 1 may be recommended `PASS_V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE` only when all required tests pass and the Implementation Report proves:

- Host-only authority and client-input separation;
- write-before-dispatch ordering;
- two-Turn pinning and reopen continuity;
- truthful unverified semantics;
- inspect-only safety and no command execution;
- safe read-only workspace/Skill/Adaptation projections;
- zero Credential/network/Provider/model/Docker execution;
- no Pi or accepted-core semantic changes.

Goal 1 acceptance does not prove Docker containment, ChangeSet Apply/Discard or a real open-agent Journey.

## 8. Session ownership, correction and commit

The new top-level Implementation Session owns implementation, focused tests, raw evidence, Implementation Report, Closeout Draft and exactly one bounded commit on its task branch. It must stop after returning the commit SHA and report.

Main owns review, bounded correction prompts, `--ff-only` integration where possible, Goal acceptance, `CURRENT_STATE.md`, final Closeout and the next Goal. Ordinary allowed-path defects return to the same Goal 1 Session. An audit is not automatic and is unnecessary unless a concrete high-risk Authority/Credential/safe-projection finding remains after Main review.

## 9. Pause conditions

Stop and report rather than redesign if:

- public Direct Pi cannot support the required settled persistent flow without Pi/private imports/route switch;
- browser input or Agent must receive Host authority;
- immutable Authority cannot be persisted before dispatch;
- continue-pinned semantics require mutating accepted V3/V3.5 Session or State authority;
- Goal 1 requires Docker, Host project commands, Credential/network/provider/model calls or Source Apply;
- an existing accepted core contract must be weakened or materially rewritten;
- a third Goal, backend, generic Permission platform, IDE/editor or Adaptation mutation UI appears necessary.

Normal TypeScript, fixture, path, serialization, HTTP, CSS/i18n and focused-test defects are not Pause Conditions.

## 10. Required deliverables

- Contract-allowed source/tests/fixtures;
- ignored raw evidence and an Evidence Index;
- `docs/reports/V3_6_G1_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_6_G1_CLOSEOUT_DRAFT.md`;
- exact commands and exit codes;
- Source Delta and secret scan;
- one bounded implementation commit SHA;
- a structured `CURRENT_STATE_UPDATE_PROPOSAL` in the Implementation Report, without modifying `CURRENT_STATE.md`.
