# POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_MAINTENANCE Closeout Draft

Status: `DRAFT_FOR_MAIN_REVIEW`  
Implementation handoff: `MAIN_REVIEW_REQUIRED`  
Date: 2026-08-12 (Asia/Hong_Kong)

This draft is an Implementation Session deliverable. It does not close or accept the
maintenance, Campaign, ES-N03, V3.6, or any later version. Main must revise it after its
review, Candidate freeze, focused audit, and the remaining Contract gates.

## Draft disposition

Recommendation: Main may begin the Contract-required light review of the uncommitted
candidate. The deterministic implementation evidence currently supports all twelve
implementation Exit Criteria, but final maintenance acceptance is not yet available.

Provisional allowed claim, subject to Main review and focused-audit confirmation:

> A reconciled registered Tool-budget stop remains typed, persistent and inspectable even
> when the same Pi Session contains explicitly accounted unavailable Tool requests, while
> all persisted Tool identities, legacy terminal formats and Host authority remain intact.

## Candidate summary

- Additive schema 4 authenticates 27 persisted calls and 27 paired results while keeping
  the registered budget domain at 25 attempts, 24 executions/completions and one unique
  budget block against the unchanged hard maximum of 24.
- The unavailable `read_tool` request is a paired error outside registered hook attempt,
  execution, command, and side-effect accounting.
- Cause-neutral active-tool pre-hook rejection accounting avoids inventing a validation
  cause when reopen can prove only the boundary and paired error.
- Disk reopen independently validates exhaustive/disjoint identity, active Tool surface,
  paired error status, execution as a strict subset of registered attempts, blocked IDs
  as the exact registered-minus-executed difference, and the budget-blocked registered
  identity.
- Safe list/detail/Run/static projections expose only bounded accounting. Managed changes
  remain unverified; Export/Discard remain available; Apply and same-Session continuation
  remain denied.
- Historical schema 1 `17/16/16`, schema 2 `25/24/24`, and schema 3 retain their original
  fields and meaning.

## Verification summary

Final deterministic result:

```yaml
tests: 28/28 PASS
strict_typescript: PASS
browser_syntax: PASS
git_diff_check: PASS
fixed_pi: 027a5847901b5dde30270abaa1041046cd2b4b55 clean
credential_reads: 0
network_calls: 0
external_provider_calls: 0
real_model_calls: 0
real_cost_usd: 0
```

The exact commands, per-suite counts, development-loop disclosure, evidence SHA-256,
changed-file inventory, Exit-Criteria matrix and proposed control-state update are in
`POST_V3_6_ES_N03_TOOL_ACCOUNTING_TERMINALIZATION_IMPLEMENTATION_REPORT.md`.

## Preserved boundaries

No Pi, Agent Loop, Tool surface, budget, Provider/model route, Retry/resume/continuation,
Source/Workspace/ChangeSet/Verifier/Outcome/Apply authority, backend, Credential,
Campaign control file, accepted Closeout, protected ES-N03 Evidence, or `CURRENT_STATE.md`
change occurred. No Git commit was created by the Implementation Session.

The deterministic fixture is ignored new evidence, not a substitute for ES-N03
Before-Fix Evidence and not a real-model Retest. It proves only the bounded Faux path.

Main's bounded correction is included: digest-recomputed attempts to place either an
unavailable or active-tool pre-hook-rejected identity into registered executions now fail
the explicit execution-domain invariant while retaining all surface counts and array
lengths. Blocked-array length and exact-difference validation is unconditional across all
schema-4 finite reasons; Tool stop additionally keeps exactly one budget-blocked
registered identity. The final total remains 28/28 deterministic tests passed.

## Remaining gates before formal closeout

1. Main light review of the exact diff and evidence.
2. Main correction disposition, if any, returned to this same Session within Contract
   scope.
3. Main Candidate Commit freeze.
4. New top-level read-only focused audit of the Contract-listed boundaries.
5. Main acceptance decision and formal Closeout update with exact Candidate/audit facts.
6. Main-owned `CURRENT_STATE.md` transition from active maintenance to the Retest gate.
7. Only after acceptance, a separately authorized single ES-N03 Retest; it is not part of
   this deterministic implementation closeout.

## Non-claims

This draft does not claim that ES-N03 completed; that its partial changes are correct or
applicable; that the Tool cap is universally adequate; that unavailable calls are
registered executions; that arbitrary Tool failures, crashes, or uncertain side effects
are recoverable; that real model behavior has been verified; that V3.6 reopened; that V4
started; or that Pi/Agent Loop changed.

Hard-stop status from the Implementation Session: `NOT_TRIGGERED`.

Handoff status: `MAIN_REVIEW_REQUIRED`.
