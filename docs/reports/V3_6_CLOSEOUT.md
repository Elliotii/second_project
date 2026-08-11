# V3.6 Closeout — Open Interactive Agent Mode

```yaml
status: closed_accepted
date: 2026-08-11
version: V3.6
disposition: PASS_V3_6_OPEN_INTERACTIVE_AGENT_MODE_WITH_BOUNDED_DOCKER_EXECUTION_AND_REAL_CHANGE_HANDOFF
accepted_by: Main_Session_under_user_authorized_Full_Ownership_Mandate
goal_1: PASS_V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE
docker_readiness: PASS
goal_2: PASS_V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_REAL_PRODUCT_ACCEPTANCE
goal_2_execution_baseline: 781e95211e7cc6beb572c50ec18e36e0a952b1f9
pinned_pi_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
pi_core_patches: 0
active_goal: null
closeout_commit: resulting_HEAD_of_this_revision
next_version_authorized: false
```

## 1. Version result

V3.6 is complete and accepted. It turns the accepted persistent and inspectable V3.5
Workbench into a bounded open interactive Coding Agent product surface for registered
local projects:

```text
free-text Task
  -> Host-minted immutable Authority
  -> pinned persistent Pi Session
  -> link-free managed_session_copy
  -> registered command in one fixed Docker backend
  -> immutable Trace / terminal evidence / ChangeSet
  -> user review
  -> Host-controlled Apply All / Discard / Export
```

V3.6 does not reopen V0–V3.5 and does not replace Direct public Pi `AgentHarness`.

## 2. Goal outcomes

### Goal 1 — Open Authority and Pinned Session Control Plane

Accepted as `PASS_V3_6_G1_OPEN_AUTHORITY_AND_PINNED_SESSION_CONTROL_PLANE` at
`81bc7c8b5667efaa0c10df507a7a0d2a59827e1e`.

It proves a narrow browser request schema, Host-generated authority and identities,
persistent Session pinning across Turns, safe managed-copy inspection and truthful
`unverified` semantics. It used zero Credential, network, Provider/model and Docker
project-command access.

### Docker Readiness

Passed on Docker Desktop 4.85.0 (235549), client/server 29.6.2, context
`desktop-linux`, platform `linux/amd64`, using the local pinned image
`node@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03`.

### Goal 2 — Bounded Execution and Change Handoff

Accepted as
`PASS_V3_6_G2_BOUNDED_EXECUTION_CHANGE_HANDOFF_AND_REAL_PRODUCT_ACCEPTANCE`.

The deterministic substrate passed Main review, 79/79 affected regressions, 15/15 live
Docker-focused tests and a finding-free focused audit. One fresh no-source-edit Session
then completed the single frozen real two-Turn Journey. Both Runs settled, prior context
was authenticated, the fixed Docker Verifier passed 3/3, and the Host applied exactly one
authenticated ChangeSet entry. Retry, fallback and replacement remained zero.

## 3. Definition of Done

| Charter requirement | Result |
|---|---|
| Goal 1 and Goal 2 exact-baseline exits | PASS |
| browser cannot inject Host authority | PASS |
| persistent Session pins project/code/state/profile/backend/provider policy | PASS |
| interactive evidence remains truthful and unverified unless frozen Verifier runs | PASS |
| registered commands run only in selected Docker profile; no Host fallback | PASS |
| immutable ChangeSet review and Host Apply/Discard preserve authority | PASS |
| one real two-Turn Journey completed without result hunting | PASS |
| strict TypeScript and affected regression suites | PASS — 79/79 |
| Pi pinned/clean, no Core patch, secrets outside tracked evidence | PASS |
| README, architecture/interview guide and Closeouts | PASS |

## 4. Real access and cost

Goal 1 and deterministic Goal 2 implementation used zero real access. The one real
Journey used:

```yaml
credential_reads: 2
network_calls: 11
provider_requests: 11
real_model_calls: 11
tool_calls: 10
combined_tokens: 53597
cost_usd: 0.0025941608
retry: 0
fallback: 0
replacement: 0
```

All V3.6 Credential, network, Provider/model and real-execution authority is consumed.

## 5. Allowed Portfolio claims

The project may accurately claim that it:

- builds on public Direct Pi `AgentHarness` without modifying Pi Core;
- accepts free-text tasks only through a narrow browser schema while the Host owns and
  persists Project, Session, budget, backend, Verifier and Source-write authority;
- keeps Project/Profile/code/State/backend/provider-policy identities pinned across a
  persistent Session;
- runs only registered project commands inside one digest-pinned, network-none,
  resource-bounded Docker profile with no Host fallback;
- lets the Agent edit only a managed copy, derives an immutable ChangeSet, and requires
  explicit Host-controlled Apply/Discard/Export;
- completed one real two-Turn product Journey with authenticated prior context,
  environment Verifier PASS and successful Host Apply;
- retains V0–V3.5 Trace, recovery, Harness-State and inspectability capabilities.

## 6. Mandatory limitations

The project must not claim:

- complete containment of arbitrary hostile code or protection from Docker/Host/kernel
  compromise;
- production multi-user or distributed sandbox security;
- arbitrary-project compatibility or a general shell/dependency-install surface;
- in-flight crash recovery, exactly-once Tool effects, multi-file transactions or
  automatic rollback;
- statistical model, Skill or coding-effectiveness improvement from one fixed Journey;
- automatic continual self-evolution, a general Router/Memory/Experience platform,
  full IDE behavior or Pi feature parity.

## 7. Preserved follow-ups

Potential later work may evaluate richer project onboarding, more durable Apply recovery,
additional execution backends or Pi SDK/Extension compatibility, but none is required to
accept V3.6 and none is currently authorized. Any V4 or new real execution requires a new
user-authorized design review.

## 8. Evidence map

- Charter: `docs/第二项目_Codex交接包_2026-07-30/V3_6_CHARTER.md`
- Goal 1: `docs/reports/V3_6_G1_CLOSEOUT.md`
- Docker readiness: `docs/reports/V3_6_DOCKER_READINESS_REPORT.md`
- Goal 2 deterministic implementation: `docs/reports/V3_6_G2_IMPLEMENTATION_REPORT.md`
- Focused audit: `docs/reports/V3_6_G2_FOCUSED_AUDIT_REPORT.md`
- Real product acceptance: `docs/reports/V3_6_G2_REAL_PRODUCT_ACCEPTANCE_REPORT.md`
- Goal 2 final: `docs/reports/V3_6_G2_CLOSEOUT.md`
- Architecture/interview guide: `docs/V3_6_ARCHITECTURE_AND_INTERVIEW_GUIDE.md`
- Ignored real artifacts: `.runs/v3-6/g2-real/journey-20260811-01/`

## 9. Final status

`active_goal: null`. V3.6 is closed and accepted. No further real access, Pi modification,
V4 work or scope expansion is authorized.
