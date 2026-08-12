# V3.6 Engineering Stabilization Campaign Closeout

```yaml
status: closed_completed
campaign_id: V3_6_ENGINEERING_STABILIZATION_CAMPAIGN
disposition: PASS_ENGINEERING_STABILIZATION_WITH_KNOWN_BOUNDED_WORKLOAD_LIMITATION
version_status: V3_6_remains_closed_accepted
natural_cases_started: 3
natural_cases_completed: 3
normal_completions: 2
natural_failures: 1
bounded_maintenance_count: 1
decision_required_count: 1
post_maintenance_retests: 1
fault_injection_cases: 0
active_goal_after_closeout: null
```

## Campaign baseline and scope

- V3.6 accepted functional baseline: `7d63e76c3df357294d480c45e4bad785e8f2fa8a`.
- Campaign Control Baseline: `e6451c273c1186728a6b6a8f98b02bf1f88b1cc4`.
- Final accepted maintenance Workbench tree: `53b86da3007cbf367c75a80a74fa0fb5271f0333`.
- Fixed Pi: `027a5847901b5dde30270abaa1041046cd2b4b55`, unchanged.
- Registered Source remained the same 14-file identity throughout and was never Applied.

The Campaign tested the existing V3.6 product through differentiated natural coding
tasks. It did not reopen V3.6, change budgets, add Recovery, enter V4, or optimize for an
interview story.

## Natural workload results

| Case | Result | External evidence |
| --- | --- | --- |
| ES-N01 | Natural settled completion; registered Docker tests 16/16; no Finding | Handoff SHA `6cddf552d21ac604ee4513c5f6544e737584c6b94ee122d0771c443f6fe3f7b0` |
| ES-N02 | Natural settled completion; registered Docker tests 13/13; no Finding | Handoff SHA `eaae5de0271243cf1b5e23accafb6adfa3e1fcccf7ce3ba2ed46735c981a5314` |
| ES-N03 | Natural Tool-budget Failure exposed missing typed terminal/inspectability | Handoff SHA `c7d39ae34ef54d09c19e22a9886361651b4d3aed71f80beb651ad8f4e7d559d3` |
| ES-N03 Retest | Same lifecycle; maintenance target passed, task remained typed-unverified terminal | Handoff SHA `344ac0fed5a04da2397c225da7dd8ed89c1f20e3c9921ba321551a8eca1a3602` |

## Finding and maintenance summary

ES-N03 exposed a concrete F1/F2 correctness and inspectability gap: unavailable/pre-hook
Tool requests and the registered budget domain could not be reconciled into a trusted
terminal, leaving only generic rejection. User accepted one bounded Option-A maintenance.

The implementation added schema 4 without changing Pi, Agent Loop, Tool surface or
budgets. Main light review returned one ordinary identity-domain correction. One focused
audit found a registered call/result name-binding gap; the original Implementation Session
fixed it, and the original Audit Session passed only the affected findings. Formal
maintenance disposition:

`PASS_POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_MAINTENANCE`

The single Retest verified the maintenance under the equivalent natural lifecycle. The
original F1/F2 defect is closed. F3 budget adequacy and F4 trajectory inefficiency remain
known bounded-workload limitations; F9 correct fail-closed behavior is verified.

## Before/after evidence relation

Before-Fix ES-N03, deterministic maintenance fixtures and post-maintenance Retest are
separate immutable evidence sets. No fixture or Retest overwrote or replaced the natural
failure. The Retest was accepted even though the task did not complete, because the
Campaign evaluates trustworthy Harness behavior rather than forcing a passing result.

## Stop-condition assessment

Campaign Stop Conditions are met in substance:

- three differentiated Natural Tasks were exercised;
- normal completion was observed twice;
- no new blocker-class correctness issue remained after the bounded maintenance;
- the known failure is now detected, persisted, inspectable and fail-closed;
- Source/Workspace/Apply authority remained trustworthy;
- budget stops no longer regress to generic unknown state for the observed lifecycle;
- remaining observations are Agent/model inefficiency, budget limitation and known
  boundary rather than unresolved Harness corruption;
- one high-quality Failure Case candidate exists;
- additional Natural Cases now have lower expected information gain;
- no unresolved Decision Required or active maintenance remains.

Fault Injection was intentionally not run. Natural Workload already produced the needed
failure and same-lifecycle after evidence; injecting another failure would add governance
and result-hunting risk without a concrete unanswered mechanism question.

## Final engineering judgment

V3.6 is not guaranteed to complete every medium coding task. It is, however, stable enough
for the accepted product claim: normal tasks can complete, finite-budget failures remain
non-settled/unverified and inspectable, partial changes do not reach Source, and authority
boundaries hold.

Bottom-layer Engineering Stabilization can stop here. Any future budget-profile change,
open-ended product UX work or V4 requires a separate user decision and is not implied by
this Closeout.

## Human UX handoff

Human UI/UX Acceptance and polish were explicitly out of this Campaign. Existing product
UX evidence and the accepted V3.6 baseline remain available for a separately authorized
stage; no such stage is started here.
