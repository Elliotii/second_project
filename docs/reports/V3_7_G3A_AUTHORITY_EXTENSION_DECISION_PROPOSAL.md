# V3.7 Goal 3A Authority Extension Decision Proposal

```yaml
status: SUPERSEDED_BY_OPTIMIZED_PROPOSAL
proposal_id: V3_7_G3A_VERSIONED_MULTI_CASE_AUTHORITY_EXTENSION
recommended_option: A
implementation_started: false
goal_3a_correction_budget_consumed: 0_of_2
goal_3b_authority: false
```

This proposal is preserved as the initial decision record. Its recommended direction is
refined and superseded by
`docs/reports/V3_7_G3A_PLANNING_OPTIMIZATION_PROPOSAL.md`. No implementation authority
was granted from this earlier text.

## Decision

Goal 3A needs the two Charter-frozen Case IDs to traverse the accepted Goal 1/2 semantics
without rewriting the accepted singleton v1 authority or creating a product-only success
path.

### Option A — versioned bounded authority extension (recommended)

Authorize a Charter-subordinate Goal 3A amendment with these fixed limits:

1. Preserve the accepted v1 singleton registry loader, registry, Manifest, Envelope and
   follow-up profile byte-for-byte for historical Goal 1/2 reopen.
2. Add a separate v2 Host configuration baseline and loader whose complete inventory is
   exactly the two Goal 3A Case IDs. There is no runtime enrollment, caller path/digest,
   arbitrary Manifest or Case editor.
3. Freeze two exact Manifest/Envelope pairs in the Goal 3A Prompt. Only
   `v37-det-recovery-promote-retain` receives the registered full-loop execution profile;
   `v37-det-primary-pass` terminates before Recovery and may not acquire bridge authority.
4. Add a fixed Host resolver that chooses v1 versus v2 only from the persisted Case/
   workflow identity and reviewed inventory. Existing v1 artifacts always recompute with
   v1 fingerprints; new Goal 3A workflows always use v2 identities.
5. Generalize bridge plumbing only enough to consume the selected, exact Host-loaded
   Manifest/profile. Preserve schemas, admission meaning, Candidate policy, State scope,
   G2 decisions, rollback/CAS and no-direct-supersede semantics.
6. Goal 3A deterministic Cases must use the same orchestration, bridge services,
   persistence, Read Model, loopback API and UI handlers intended for Goal 3B. No fixture
   may inject formal success artifacts or skip a Host action.
7. Because this touches registration/execution Authority, Goal 3A must use an immutable
   candidate, Main review and a fresh independent focused read-only audit of v1 historical
   preservation, v2 inventory isolation and browser non-authority before acceptance.

This is the smallest design that satisfies both the exact two-Case Charter and historical
Goal 1/2 identity preservation.

### Option B — revise the frozen Case identity

Change Goal 3A to reuse `v37-g1-det-recovery` as its full-loop Case and add only the
primary-pass Case. This reduces new full-loop configuration but reopens the Charter's
exact Case-ID decision, still requires a multi-entry/versioned registry boundary, and
makes product acceptance less distinct from the bridge fixture. Not recommended.

### Option C — stop Goal 3A incomplete

Keep Goal 1/2 accepted and close V3.7 without reusable product or real-loop claims. This
is truthful but leaves Goal 3A/3B incomplete.

## If Option A is accepted

Main will write one exact `V3_7_G3A_AUTHORITY_EXTENSION_AMENDMENT.md`, freeze all new
configuration locations/identities, file allowlist, deterministic action/test matrix and
audit requirement in `V3_7_GOAL_3A_IMPLEMENTATION_PROMPT.md`, then dispatch a fresh
dedicated zero-access Goal 3A implementation Session. Goal 3B remains unauthorized.
