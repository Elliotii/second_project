# G001 Pi Source Audit Closeout

```yaml
goal_id: G001_PI_SOURCE_AUDIT
status: complete
date: 2026-07-29
source_commit: 027a5847901b5dde30270abaa1041046cd2b4b55
audit_mode: static_read_only
disposition: ACCEPT_FOR_DYNAMIC_VERIFICATION
final_pi_go: not_authorized
```

## Outcome

**Recommendation.** Accept the pinned Pi basis for a bounded deterministic
dynamic-verification goal, not for implementation or final Pi Go. The public
Direct `@earendil-works/pi-agent-core` `AgentHarness` is the primary G002
candidate. The earlier Pi Coding Agent SDK Runner + Inline Extension candidate
is **superseded as the V0 experimental runtime basis** by source added after
`v0.82.1`; retain it only as a conditional compatibility comparator. RPC is a
fallback for a demonstrated process-isolation need.

No Pause Condition was triggered. Static evidence found a clean public
integration path, observable lifecycle and tool boundaries, controllable
session/workspace inputs, and a clean external Completion Verification
insertion point. It also found constraints that G002 must test: lifecycle API
stability, settled-session reconstruction, event/session ordering, Windows
cancellation, absence of active-run recovery, no permission sandbox, and
provider-retry opacity.

## Deliverables completed

1. `docs/research/pi/source-map.md`
2. `docs/research/pi/capability-matrix.md`
3. `docs/research/pi/lifecycle-and-session.md`
4. `docs/research/pi/open-questions.md`
5. `docs/reports/G001_PI_SOURCE_AUDIT_REPORT.md`
6. `docs/reports/G001_PI_SOURCE_AUDIT_CLOSEOUT.md`
7. `CURRENT_STATE.md` updated truthfully

Together these cover all required audit dimensions with `Fact`, `Inference`,
`Recommendation`, and `Unconfirmed` labels; compare Direct, SDK + Inline
Extension, RPC, and Pi rejection; trace the proposed completion protocol; and
map every material dynamic uncertainty to a bounded G002 check with intent and
pass/fail criteria.

## Verification commands and results

The following commands were executed from the repository root. They were
read-only except for the explicit `apply_patch` operations that created the
authorized deliverables and updated `CURRENT_STATE.md`.

| Command | Result |
|---|---|
| `Get-Process -Name rg,git -ErrorAction SilentlyContinue` | No matching process; the user-aborted broad search was treated as complete and was not rerun. |
| `git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C .upstream/pi rev-parse HEAD` | `027a5847901b5dde30270abaa1041046cd2b4b55`. |
| `git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C .upstream/pi status --short --branch` | `## main...origin/main`; no short-status entries. |
| `Get-Item -LiteralPath 'docs/reports/G001_PI_SOURCE_AUDIT_REPORT.md'` | File present; 17,458 bytes before final verification. |
| `Get-Content -Raw -Encoding utf8 -LiteralPath 'docs/reports/G001_PI_SOURCE_AUDIT_REPORT.md'` | Full report read successfully; UTF-8 punctuation and required disposition confirmed. |
| `Get-Item -LiteralPath 'docs/research/pi/source-map.md','docs/research/pi/capability-matrix.md','docs/research/pi/lifecycle-and-session.md','docs/research/pi/open-questions.md','docs/reports/G001_PI_SOURCE_AUDIT_REPORT.md','docs/reports/G001_PI_SOURCE_AUDIT_CLOSEOUT.md','CURRENT_STATE.md'` | All seven required project files were present and non-empty; byte lengths were 13,687; 16,383; 18,089; 11,453; 17,458; 5,814; and 2,628 before this closeout edit. |
| `git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C .upstream/pi rev-parse HEAD` | Final reconfirmation returned exactly `027a5847901b5dde30270abaa1041046cd2b4b55`. |
| `git -c safe.directory=D:/AI/AI_Projects/project2/.upstream/pi -C .upstream/pi status --short --branch` | Final reconfirmation returned only `## main...origin/main`; upstream remained clean. |
| `Test-Path -LiteralPath 'workbench'` | `False`; no formal Workbench was created. |
| `Test-Path -LiteralPath '.upstream/pi/node_modules'` | `False`; no upstream dependency directory was installed. |
| `git status --short` | Root repository content is still shown as untracked, including the pre-existing project/control/research trees and `docs/`; no commit was created. Root cleanliness is not a G001 precondition and this output does not claim ownership of unrelated user files. |

## Deliberately not executed

- No dependency installation or package-manager mutation.
- No build, test, typecheck, lint, or broad lifecycle command.
- No real model or provider call.
- No write inside `.upstream/pi`.
- No `workbench/` creation.
- No Git commit.

These omissions are Goal Contract constraints, not verification failures.

## Remaining unverified

All remaining uncertainties are dynamic and are specified in
`docs/research/pi/open-questions.md` with setup intent and pass/fail criteria:

- declared public import behavior from a locally emitted/packed pinned package;
- exact two-cycle prompt/verifier/event/session order;
- reconstruction of a settled Direct session with host dependencies recreated;
- external event-journal correlation and persistence ordering;
- normalized Baseline/Candidate fairness manifest;
- bounded Windows tool cancellation and settlement;
- conditional Coding Agent SDK parity after Direct passes;
- conditional RPC isolation value only after an observed in-process failure;
- crash-after-side-effect detection as `invalid_run`, never automatic replay;
- upstream lifecycle-contract drift before any future pin update.

G001 therefore does not claim runtime viability beyond static source/test
evidence and does not claim active-run crash recovery.

## Scope changes and user decisions

No scope expansion was made. The audit did not introduce an implementation,
MCP, Godot, Multi-Agent, A2A, Web UI, SQLite, Harbor, containers, or a general
sandbox.

The architecture/control session must decide whether to authorize the bounded
G002 contract and accept Direct AgentHarness as its primary candidate. It must
separately retain authority over final Pi Go, the V0 Version Charter, Outcome
semantics, Failure Taxonomy, recovery budget, side-effect boundaries, Eval
validity/fairness, and promotion/rollback thresholds.

## Definition of Done assessment

- Pinned commit and clean upstream: satisfied and finally reconfirmed.
- Required audit dimensions and status labels: satisfied.
- Source/symbol/test citations and epistemic labels: satisfied.
- Required option comparison: satisfied.
- Completion Verification path and blockers: satisfied.
- Every material `Unconfirmed` item mapped to G002: satisfied.
- Exactly one disposition: `ACCEPT_FOR_DYNAMIC_VERIFICATION`.
- No prohibited mutation/execution: satisfied.
- `CURRENT_STATE.md` updated: satisfied.

All Definition of Done items are satisfied. No Pause Condition or unresolved
G001 blocker remains.
