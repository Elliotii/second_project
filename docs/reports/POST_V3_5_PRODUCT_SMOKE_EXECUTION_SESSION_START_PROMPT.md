# Post-V3.5 Product Smoke Test & Maintenance Session Start Prompt

Status: frozen_for_execution

You are a new top-level Product Smoke Test & Maintenance Session. You are not the
Enablement implementation Session, focused audit Session, or Main control Session.

## Gate A - exact execution object

Before any Credential read or network access:

1. Read AGENTS.md, CURRENT_STATE.md,
   docs/reports/POST_V3_5_PRODUCT_SMOKE_TEST_PLAN.md,
   docs/reports/POST_V3_5_REAL_PRODUCT_PATH_ENABLEMENT_REPORT.md, and
   docs/reports/POST_V3_5_REAL_PRODUCT_PATH_FOCUSED_AUDIT_REPORT.md.
2. Confirm git HEAD equals the exact Execution Baseline Commit supplied by Main and the
   tracked worktree is clean.
3. Confirm both pinned Pi checkouts equal
   027a5847901b5dde30270abaa1041046cd2b4b55 and are clean.
4. Run strict TypeScript and the zero-call enablement suite. Stop on failure.
5. Inspect only the Credential path metadata needed by the host launcher. Do not print,
   persist, hash, echo, or expose the secret value.

## Frozen journey

Create one ignored smoke root and freeze before dispatch:

- one project, one Workspace, one Session, exactly two ordered Run IDs;
- one install-free Node ESM task implementing parseRetryAfter;
- immutable Turn prompts and external Verifiers;
- initial Workspace digest, Tool policy, Provider profile, Session/Run identities,
  Verifier source digests, per-turn budget and whole-journey budget;
- a generated session-only continuation marker that Turn 1 must remember but must not
  write to the Workspace.

Turn 1 implements and tests:

- nonnegative integer seconds to milliseconds;
- valid HTTP date to max(0, date - nowMs);
- invalid input to null.

After Turn 1, capture the settled Run, Verifier, Outcome, Session-prefix digest, usage and
safe UI projection. Stop the server process and prove its PID/listener are gone.

Start a fresh server process over the same persistent data and Workspace. Turn 2 must ask
the Agent to export the prior continuation marker and add a related held-out edge-case
test without restating the marker. The primary continuation proof is exact equality
between the persisted prior Pi Session prefix and the provider-observed prefix after
reopen; the marker is secondary behavioral evidence.

Run the frozen external Verifier for each Turn. Do not let the Agent edit Verifiers,
authority, acceptance criteria, evidence roots, or host configuration.

## Frozen limits

Per Turn:

- Provider requests <= 16;
- Tool calls <= 24;
- combined tokens <= 131072;
- cost <= USD 0.20;
- hard wall time <= 15 minutes.

Whole journey:

- Provider requests <= 32;
- Tool calls <= 48;
- combined tokens <= 262144;
- cost <= USD 0.40;
- hard wall time <= 30 minutes;
- opaque Credential reads <= 2.

Use fixed deepseek-v4-flash. No retry, fallback, replacement, additional Task, Skill
treatment, Goal 2.5 rerun, Pi edit, SDK/Extension/RPC switch, or Runtime/Session/
Verifier/evidence-semantics edit after real dispatch.

## Maintenance boundary

Before real dispatch, ordinary startup/UI/serialization/safe-projection/display defects may
be corrected only inside the pre-authorized bounded maintenance boundary and must rerun
focused zero-call tests. After the first real dispatch, source edits are limited to
ordinary UI/display-only issues that cannot change Runtime, Session, Verifier, Outcome,
budget, authority or evidence semantics. Never rerun to conceal a failed real journey.

## Hard stops

Stop immediately on:

- Gate A mismatch or dirty tracked baseline;
- Credential exposure or unexpected read;
- Provider/model/profile drift;
- any request for retry/fallback/replacement/extra Task;
- budget or deadline exhaustion;
- failed identity, Session-prefix, evidence-digest or safe-projection check;
- inability to prove the first process/listener stopped before reopen;
- any need to edit Runtime, Session, Verifier, Outcome, authority or evidence semantics
  after dispatch;
- Pi modification or architecture-route change.

## Required handoff

Produce docs/reports/POST_V3_5_PRODUCT_SMOKE_TEST_REPORT_DRAFT.md containing:

- exact baseline, authority digest and ignored evidence index;
- both process identities and stop/reopen proof;
- both Run/Manifest/Verifier/Outcome identities;
- Session-prefix and provider-observed prefix comparison;
- Tool lifecycle, usage, tokens, cost, Credential-read and network/provider/model counts;
- safe WebUI/API observations;
- exact commands and exit codes;
- all failures/nonzero exits, limitations, and whether the journey is a product smoke
  pass or an evidence-bearing failure.

Do not modify CURRENT_STATE.md, accepted Charters/Closeouts or Pi. Do not stage or
commit. Stop for Main review after the single frozen journey.
