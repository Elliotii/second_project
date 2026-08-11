# V3.6 Goal 2 Focused Independent Audit Session Start Prompt

You are a fresh top-level, read-only focused audit Session for:

```text
V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_PRODUCT_ACCEPTANCE
```

This is a narrow risk-triggered audit, not a general code review, redesign, implementation Session, or product execution Session.

## 1. Frozen candidate

Start from the exact audit baseline commit recorded by Main when this prompt is committed. The source candidate that must remain unchanged is:

```yaml
candidate_commit: 5ec7d2b0e81e54e2c8a73200e39f45ba631b244f
candidate_tree: 830fa2e28b6052c106f29252fdc6a1af5f1c9980
candidate_parent: 20dbe4c11aa5b1a64d75dfa63b6893536adb021f
goal_2_control_baseline: 992f721c4f05b7c78761966c7b8f79a6b4b3a2d3
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
docker_image: node@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03
```

Before auditing, verify the candidate commit is an ancestor of the audit baseline, tracked files are clean, Pi is at the pinned clean commit, Docker Desktop is available, and the exact image is local. Read completely:

- `AGENTS.md`;
- `CURRENT_STATE.md`;
- `docs/第二项目_Codex交接包_2026-07-30/V3_6_CHARTER.md`;
- `docs/第二项目_Codex交接包_2026-07-30/V3_6_G2_GOAL_CONTRACT.md`;
- `docs/reports/V3_6_DOCKER_READINESS_REPORT.md`;
- `docs/reports/V3_6_G2_IMPLEMENTATION_REPORT.md`;
- `docs/reports/V3_6_G2_CLOSEOUT_DRAFT.md`;
- the candidate diff and only the source/tests needed for the checks below.

## 2. Exact audit scope

Audit only these four boundaries and their directly required regressions:

1. **Current-head Change Handoff binding**
   - Apply/Discard must reject a stale ChangeSet after a later Turn changes the managed workspace.
   - Safe receipt, before-blob, journal/recovery references and successful-Apply marker must be authenticated, cross-linked and fail closed on tamper.
   - One-successful-Apply-per-Session and New Session guidance must remain truthful.

2. **Terminal model budget enforcement**
   - A final model response that crosses token or cost limits must be terminally rejected even when no later provider request occurs.
   - Counters and evidence must not hide the over-budget terminal response.

3. **Docker containment and ambiguous-create cleanup**
   - Exact pinned image/profile, `--network none`, one managed-copy mount, no Host fallback and immutable terminal evidence must hold.
   - Every attempted create path, including ambiguous timeout/error, must reconcile by exact container name and prove zero leftovers.

4. **Tracked product entry and safe authority gating**
   - `v36g2:product` must be a tracked, frozen two-Turn entry using the Contract prompts, limits and one explicit Apply path.
   - Missing/wrong authority must fail before evidence roots, credential reads, provider/model construction or Docker dispatch.
   - A Faux-provider end-to-end run may be used to prove Session continuity, Docker commands, verifier, immutable ChangeSet and Host Apply without external access.
   - Browser/API projection must not expose credential, absolute Host paths, Docker CLI path, raw authority or unsafe artifacts.

Do not broaden into naming/style/general architecture review, another backend, another protocol, another task/case, real-model quality evaluation, Pi SDK/Extension/RPC comparison, or V4 planning.

## 3. Permissions and prohibitions

Authorized:

- read candidate source and tracked evidence documents;
- run strict TypeScript and only focused/affected deterministic tests needed for the four boundaries;
- run deterministic Docker tests with the frozen image and runtime `--network none`;
- create ignored audit-local evidence under `.runs/v3-6/g2-focused-audit/`;
- write exactly one tracked report: `docs/reports/V3_6_G2_FOCUSED_AUDIT_REPORT.md`;
- optionally create one audit-report-only Git commit so Main can integrate the report.

Forbidden:

- source, fixture, test, Manifest, Authority, Contract, Charter, `CURRENT_STATE.md`, `AGENTS.md`, Pi or control-state edits;
- repairs of any finding;
- Credential reads, external network, external Provider/model calls or real-model calls;
- changing the candidate commit or staging candidate source;
- retry/fallback/replacement/extra product task;
- Goal acceptance, Execution Baseline creation or V3.6 Closeout.

The Docker executable is Host configuration at:

```text
C:/Users/HUAWEI/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe
```

Never include that Host path in Browser/model-safe output.

## 4. Required result

The report must include:

- exact audit baseline, candidate commit/tree and Pi commit/status;
- files/symbols inspected;
- commands, exit codes and focused results;
- Docker cleanup result;
- credential/network/provider/model counts, all expected to be zero;
- findings ordered by severity with exact evidence;
- remaining limitations versus Contract claims;
- exactly one recommendation:
  - `PASS_V3_6_G2_FOCUSED_AUDIT`, or
  - `REVISE_V3_6_G2_FOCUSED_AUDIT`.

If recommending revision, identify only concrete Contract-local defects and the smallest correction boundary. Stop after the report. Main owns disposition and any correction handoff.
