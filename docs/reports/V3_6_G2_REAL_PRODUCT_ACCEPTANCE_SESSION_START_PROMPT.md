# V3.6 Goal 2 Real Product Acceptance Session Start Prompt

You are the fresh top-level, no-source-edit Real Product Acceptance Session for:

```text
V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_PRODUCT_ACCEPTANCE
```

## 1. Exact immutable baseline

```yaml
execution_baseline_commit: 781e95211e7cc6beb572c50ec18e36e0a952b1f9
execution_baseline_tree: 6a54c220d7286560d6e4e0ea52f34c39fb5718ae
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
docker_desktop: 4.85.0_235549
docker_client_server: 29.6.2_29.6.2
docker_context: desktop-linux
docker_image: node@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03
model: deepseek-v4-flash
```

Gate H must stop before any Credential read or external dispatch unless HEAD/tree are
exact, tracked status is clean, the shared pinned Pi checkout is exact and clean, Docker
matches the frozen identity/profile, the pinned image is local, and no `v36g2-` container
is left over.

Read completely, in order:

- `AGENTS.md` and `CURRENT_STATE.md` from the Execution Baseline;
- `V3_6_CHARTER.md` and `V3_6_G2_GOAL_CONTRACT.md`;
- `V3_6_DOCKER_READINESS_REPORT.md`;
- `V3_6_G2_IMPLEMENTATION_REPORT.md` and `V3_6_G2_CLOSEOUT_DRAFT.md`;
- `V3_6_G2_DETERMINISTIC_ACCEPTANCE_REPORT.md` and focused audit report;
- the tracked `v36g2:product` entry, its README section and only directly required source.

The authoritative Pi checkout is the shared read-only path
`D:/AI/AI_Projects/project2/.upstream/pi`; its absence inside the isolated worktree is
expected. Read applicable Pi instructions before any Pi claim and never modify it.

## 2. Frozen product Journey

Create one fresh ignored Journey root under `.runs/v3-6/g2-real/`. Copy the tracked
fixture `workbench/fixtures/v36g2/duration-parser` byte-for-byte into one new ignored
registered Source. The Source, data root and evidence root must all be absent before
creation. Do not use this repository as the registered Source.

Run the tracked zero-access preflight first:

```text
npm run v36g2:product -- preflight
```

with the exact registered Source and Execution Baseline SHA. Confirm the fixture digest,
two prompt hashes, provider/backend identities, budgets, and zero access counters. No
Credential may be read and no network, Provider/model or Docker command may occur during
preflight.

After Gate H passes, execute exactly once through the tracked product entry:

```text
npm run v36g2:product -- run
```

with only these frozen Host inputs:

- the fresh registered Source;
- Execution Baseline `781e95211e7cc6beb572c50ec18e36e0a952b1f9`;
- fresh absent data/evidence roots;
- Docker executable
  `C:/Users/HUAWEI/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe`;
- real authority `V3_6_G2_REAL_TWO_TURN_EXECUTION_AUTHORIZED`.

The existing Host Credential file is
`D:/AI/AI_Projects/project2/.env.g005`. Resolve only its single
`DEEPSEEK_API_KEY` opaquely inside the bounded child process using a new ignored runtime
preload/helper. Verify it is one ordinary non-link file with exactly one non-empty key;
never print, hash, size, persist or summarize the value. Do not inherit the key into the
parent shell. The tracked product must account for at most two resolver reads, one per
Turn, and the process must discard the value on exit.

The Journey is exactly:

```yaml
project_count: 1
session_count: 1
turn_count: 2
provider_requests_max_per_turn: 16
tool_calls_max_per_turn: 24
tokens_max_per_turn: 131072
cost_usd_max_per_turn: 0.20
journey_provider_requests_max: 32
journey_tool_calls_max: 48
journey_tokens_max: 262144
journey_cost_usd_max: 0.40
credential_reads_max: 2
retry: 0
fallback: 0
replacement: 0
extra_task_or_case: 0
```

Both frozen prompts must run in the same persistent Session. Docker runtime network is
always `none`; only Host-side DeepSeek Provider traffic is allowed. After both Turns,
run the frozen Docker Verifier. The product may perform Apply All only when the current,
non-empty immutable ChangeSet is valid and the Verifier passed. Do not directly edit the
registered Source outside that Host-controlled product Apply path.

## 3. Absolute prohibitions and stop behavior

Do not edit, stage or commit project source, fixture, tests, Manifest, Authority,
Contract, Charter, `CURRENT_STATE.md`, `AGENTS.md`, runtime policy, evidence semantics or
Pi. Do not install dependencies, pull another image, use Host command fallback, select
another backend, retry, fall back, replace, add another task, or seek a prettier result.

After the first real Provider dispatch, any error or hard-stop condition is final for
this Journey. Preserve evidence and report it truthfully; do not rerun. If a Codex task
permission approval is required, keep this exact Session and wait for the user. Do not
create a replacement Session merely to bypass approval.

## 4. Required evidence and report

After the single Journey, verify read-only:

- exact baseline, Pi and Docker identities;
- one Session, two Turn/Run identities and continuity;
- prompt hashes and provider/backend/profile digests;
- per-Turn and whole-Journey Provider/tool/token/cost/wall counters;
- exactly observed Credential reads, never the value;
- Docker terminal evidence, Verifier result and zero exact-name leftover containers;
- ChangeSet current-head identity and Apply receipt/marker or truthful non-Apply result;
- registered Source before/after inventories and final `node --test` result;
- tracked Git status remains clean and no secret appears in tracked/Browser-safe output.

Write exactly one uncommitted tracked report:

`docs/reports/V3_6_G2_REAL_PRODUCT_ACCEPTANCE_REPORT.md`

and ignored raw evidence under the Journey root. Do not create a Git commit. Return exact
commands and exit codes, report/evidence digests, Run/Session IDs, counters, final Source
state and one recommendation: `PASS_V3_6_G2_REAL_PRODUCT_ACCEPTANCE` or a truthful
terminal stop. Then stop for Main review.
