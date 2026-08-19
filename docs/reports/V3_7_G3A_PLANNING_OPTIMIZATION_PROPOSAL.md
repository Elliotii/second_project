# V3.7 Goal 3A Planning Optimization Proposal

```yaml
status: ACCEPTED_BY_USER_SUPERSEDED_BY_FORMAL_AMENDMENT
proposal_id: V3_7_G3A_OPTIMIZED_BOUNDED_MULTI_CASE_AUTHORITY
supersedes: docs/reports/V3_7_G3A_AUTHORITY_EXTENSION_DECISION_PROPOSAL.md
recommended_decision: AUTHORIZE_OPTIMIZED_VERSIONED_G3A_AUTHORITY_EXTENSION
charter_rewrite_required: false
root_plan_rewrite_required: false
new_goal_or_product_stage: false
implementation_started: false
goal_3a_correction_budget_consumed: 0_of_2
goal_3b_authority: false
formal_amendment: V3_7_G3A_AUTHORITY_EXTENSION_AMENDMENT.md
amendment_freeze_commit: 425dc6752c9074dc079fa7b952cb93869080a3df
```

## Main conclusion

The accepted V3.7 Goal structure, exact two Goal 3A Case IDs, Goal 3A Exit Criteria and
Goal 3B one-real-Case boundary should not be rewritten. They remain the right minimum
closed-loop claim.

The necessary optimization is a Charter-subordinate execution amendment that closes the
singleton-loader gap without modifying accepted v1 evidence, inventing Schema 2 or
building a general registry platform.

## Optimized authority design

### 1. Preserve accepted v1 byte identity

The Goal 3A Prompt must freeze SHA-256 identities for the accepted Goal 1/2 registry,
Manifest, Envelope, execution profile and all source files whose fingerprints participate
in historical admission or authority. Those files are not editable in Goal 3A.

Historical `v37-g1-det-recovery` workflows always reopen through the accepted singleton
v1 loader and v1 bridge inspectors. There is no compatibility reader, source-fingerprint
substitution or migration of old artifacts.

### 2. Add one bounded Schema 1 multi-Case baseline

Add a new Goal 3A Host registry location and loader contract. Registry, Manifest and
Envelope schemas remain version 1; this is a new configuration/loader baseline, not the
rejected Runtime or Registry Schema 2.

At Goal 3A candidate freeze its index contains exactly, in canonical order:

1. `v37-det-recovery-promote-retain`;
2. `v37-det-primary-pass`.

The loader is stable source code and validates a source-controlled, exact-key,
content-addressed registry. It selects an entry by Host-persisted Case/workflow identity,
then derives the workflow trust root only from the loader contract and that selected
entry's Manifest plus Envelope prefix. The global index digest is still validated, but
appending a different reviewed Case does not rewrite an existing Case's trust root.

There is no runtime enrollment API, caller path/digest, Case editor, profile editor,
directory scan or acceptance based only on self-declared approval fields.

### 3. Bound the later Goal 3B addition now

Goal 3A must prove that the same stable loader and product path can accept one later
source-controlled append without changing implementation source. After Goal 3A
acceptance, Goal 3B may add exactly one Main/user-frozen real Case entry and its immutable
Manifest/Envelope/profile configuration, bringing the V3.7 baseline maximum to three
Cases.

That append may occur only in the separate Goal 3B freeze commit. Existing entries cannot
be removed, reordered, replaced or silently version-swapped. It grants no real access;
the execution Session still requires the separate Goal 3B authorization.

This bounded append is part of the already accepted Host-reviewed Registry contract. It
is not arbitrary runtime enrollment or a general Case platform.

### 4. Use a versioned service boundary, not in-place compatibility

The two new Goal 3A Cases use versioned Goal 3A registration/recovery/follow-up service
adapters that preserve the accepted Goal 1/2 schemas and semantics while consuming only
the new Host-loaded authority. They reuse the accepted V2 recovery, Candidate,
Regression, V3 State, G1/G2, V3.6 Session and product modules.

Accepted fingerprint-bearing v1 bridge files remain unchanged. The new service must not
introduce a new Evidence family, Candidate type, State decision, assessment result,
rollback rule, Runtime schema or compatibility projection. Goal 3A deterministic and
Goal 3B real execution use this same versioned product service.

## Optimized implementation order

These are implementation gates inside Goal 3A, not new product stages or user-visible
state-machine states:

1. **Authority gate:** freeze the v1 hash inventory; implement the new Schema 1 two-Case
   registry/loader and prove v1 historical reopen remains byte- and identity-stable.
2. **Service gate:** implement only the versioned adapters required to run the exact
   loaded Case through the accepted bridge semantics; no UI or workflow shortcut may
   manufacture formal artifacts.
3. **Product gate:** add the thin workflow journal, re-derived Read Model, loopback API
   and existing bilingual UI extension. Browser requests carry only opaque IDs and the
   two narrow confirmation actions.
4. **Deterministic gate:** run the two frozen Cases through the production action handlers,
   restart/reopen, isolation and existing Apply/Discard/Export behavior.
5. **Candidate gate:** run the bounded regression matrix, strict TypeScript and allowlist
   checks; create one candidate for Main review and the required focused audit.

Failure at an earlier gate stops later edits. It does not consume a correction round
unless Main has returned a concrete implementation finding set for correction.

## New-finding triage rule

New findings are investigated and reproduced read-only, but are not automatically fixed.
A source/test change is allowed only if Main records that the finding satisfies at least
one of these conditions:

1. blocks a frozen Goal 3A production/demo route;
2. risks data corruption, irreversible side effects or a false-success state;
3. invalidates a current core capability claim;
4. is an explicit Goal 3A acceptance regression.

Otherwise it is recorded as `deferred_limitation`, `out_of_scope` or
`optional_improvement`. Such a finding cannot add a product contract, state-machine
state, compatibility layer, evaluation stage, registered Case or broad regression suite.
Tests may prove only frozen claims and confirmed in-scope failure modes.

If an eligible fix requires authority beyond the Amendment allowlist, Main stops for a
decision rather than broadening the patch silently.

## Minimum claim-linked test matrix

The Goal 3A Prompt should freeze only this matrix plus already accepted regressions:

- full `v37-det-recovery-promote-retain` route through retained Assessment;
- `v37-det-primary-pass` terminal with Recovery/Evidence/Candidate actions unavailable;
- two workflows for one Case remain isolated and reopen after service restart;
- cross-Case artifact substitution and browser-supplied Authority fields fail closed;
- both confirmations remain distinct and every stage is re-derived from formal artifacts;
- deterministic Regression Reject/negative routing is reached without a third registered
  Case or manufactured formal outcome;
- accepted v1 historical Goal 1/2 reopen and focused regressions remain green;
- existing V3.6 Files/Changes/Diff/Apply/Discard/Export behavior remains green;
- strict changed/transitive TypeScript, exact allowlist and rejected-Schema-2 absence pass.

Do not add load, concurrency, fuzz, migration, arbitrary-Manifest, generalized policy,
production-hardening or statistical evaluation suites unless a frozen claim fails and
the triage rule authorizes the narrow proof.

## Focused audit boundary

Because Goal 3A necessarily introduces registration and execution Authority for new
Cases, one immutable candidate and one fresh focused read-only audit are required. The
audit is limited to:

- v1 historical byte/fingerprint/trust-root preservation;
- exact two-entry Goal 3A inventory and per-entry trust-root stability;
- no runtime enrollment or caller-selected authority;
- cross-Case/workflow isolation;
- new versioned service equivalence to accepted bridge semantics;
- browser non-authority and formal-artifact-derived reopen;
- proof that the later single Goal 3B config append needs no implementation-source
  change and cannot rewrite existing Case authority.

It does not re-audit all V2, V3, V3.6, G1/G2, UI styling or general platform quality.

## Explicitly deferred

- the intermittent NTFS Number-valued inode precision issue, unless it reproducibly
  blocks a frozen Goal 3A route in the target worktree;
- literal child-process loader and isolated full-TypeScript environment limitations when
  the accepted equivalent checks pass;
- additional Cases beyond the two deterministic Cases and one later real Case;
- dynamic enrollment, generic Registry/Verifier/workflow frameworks, migrations,
  dashboards, streaming, multi-user support and production hardening;
- any real Provider/model, Credential, Docker product execution or Goal 3B result.

## Approval effect

If the user approves this optimized proposal, Main will create one binding
`V3_7_G3A_AUTHORITY_EXTENSION_AMENDMENT.md` and one exact
`V3_7_GOAL_3A_IMPLEMENTATION_PROMPT.md`. The Prompt will freeze fixture bytes/digests,
configuration locations, stable loader/service boundaries, file allowlist, commands and
reports before dispatching a fresh zero-access Goal 3A implementation Session.

Approval does not authorize Goal 3B configuration, real access or execution.
