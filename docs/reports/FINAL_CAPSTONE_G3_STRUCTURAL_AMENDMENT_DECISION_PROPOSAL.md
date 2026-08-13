# Final Capstone Goal 3 Structural Amendment Decision Proposal

```yaml
status: DECISION_PROPOSAL_READY_NOT_AUTHORIZED
date: 2026-08-13
goal_id: FINAL_CAPSTONE_G3_ONE_REAL_CLOSED_LOOP_PRODUCT_ACCEPTANCE
blocking_finding: promotion_admission_registry_source_identity_cardinality
existing_goal_3_correction_budget: 2_of_2_exhausted
candidate_frozen: false
mandatory_focused_audit_started: false
real_run_started: false
real_run_consumed: false
recommended_user_decision: AUTHORIZE_G3_STRUCTURAL_AMENDMENT
alternative_user_decision: CLOSE_FINAL_CAPSTONE_INCOMPLETE_G3
```

## Purpose and authority status

This is a Main decision proposal, not an activated Goal Contract, correction authorization,
source allowlist or execution prompt. It records the smallest structural boundary that Main
currently recommends after independently confirming the blocking finding. Nothing in this
document authorizes source edits, adoption or execution of the stopped implementation
Session's partial files, Candidate freeze, audit, credential access, network access,
Provider/model access or a real Run.

The User must make one explicit decision before Goal 3 can move again.

## Evidence-backed finding

### Fact

`workbench/src/contracts/v3g3-types.ts` gives every `AdmissionRegistryEntryV3` its own
`source_candidate_ref`, `source_candidate_sha256`, `source_state_ref` and
`source_state_sha256` fields, but the two refs are literal types naming only the Goal 1
fixture pair.

`workbench/src/refinement/admission-v3.ts` then enforces that one-pair model in three
places:

- `freezeAdmissionRegistryV3` hashes the same fixed Candidate/State pair into every entry;
- `loadAdmissionRegistryV3` loads that pair once for the entire registry; and
- `inspectPromotionAdmissionLineageV3` re-derives every selected promotion from that pair
  and rejects any different source refs.

The accepted Final Capstone Goal 3 Contract requires two distinct promotion lineages in one
closed loop: the prior Inspector-valid promoted lineage and the new Candidate lineage
produced from the fixed negative Goal 1 admission. Their evidence identity and semantic
payload are different, so one Candidate/State source pair cannot prove both.

`workbench/src/refinement/regression-gate-g2.ts` also requires the Goal 1 admission,
registration, source Workspace, validation Run and reopened inspection to remain under the
same project root. Separate project roots, copied State/Decision artifacts, path aliases or
replacement of the fixed fixtures are therefore not legal composition mechanisms.

### Inference

The existing entry shape already expresses per-entry source identity, but the accepted
implementation makes it globally single-valued. The smallest viable structural amendment
is to make those existing per-entry identities real while preserving a fail-closed Host
authority boundary. Merely changing the two literal ref types to arbitrary strings would
be insufficient: an internally self-consistent but unauthorized Candidate/State pair must
not become admissible just because its files and hashes agree.

## Recommended structural Amendment

If the User selects `AUTHORIZE_G3_STRUCTURAL_AMENDMENT`, Main should write and freeze a new
Goal 3 Contract Amendment before any source work. That Amendment should authorize exactly
the following behavior and no broader abstraction.

### Required behavior

1. An admission-registry entry must bind exactly one admission to exactly one source
   Candidate/State pair. Source refs and hashes remain inside the registry digest domain.
2. Registry freeze must receive an explicit Host-owned association between each admission
   and its source pair. Positional reuse of one global pair for all entries is forbidden.
3. The Host must freeze any non-legacy source bytes in an ordinary, singly linked,
   write-once area outside the Agent-editable Workspace before recording their refs and
   hashes. Source-root escape, symlink/junction/reparse traversal, hardlinks, missing files,
   duplicates and conflicting write-once identities must fail closed.
4. Inspection must select the registry entry by the promoted Candidate digest first, then
   resolve and hash only that entry's frozen source pair, independently re-derive the
   admission and compare the complete admission identity. A registry-global source pair
   must not be used for a per-entry decision.
5. The new Final Capstone entry must additionally remain provably connected to the exact
   Inspector-valid fixed negative Goal 1 admission and the exact Goal 2 regression-gated
   validation/promotion artifacts. Caller or Agent text may not choose an arbitrary source
   pair, admission, applicability pack, promotion result or active pointer.
6. Existing schema-1 registries using the legacy fixed fixture pair must continue to reopen
   and validate without mutation. If this cannot be achieved without ambiguous semantics,
   the implementation must introduce an explicitly versioned registry schema and a strict
   compatibility reader rather than silently changing schema-1 meaning.
7. Existing `CandidateAdmissionV3`, V3 State store/CAS, Goal 1 source families and Goal 2
   applicability/regression authority remain unchanged. No direct State creation, pointer
   write, copied Decision, fourth Goal 1 family or generic adapter/registry is allowed.

### Bounded source and test surface

The Amendment may add only the minimum accepted-core delta needed for the behavior above:

- `workbench/src/contracts/v3g3-types.ts`, only if an explicit registry input or versioned
  registry type is required;
- `workbench/src/refinement/admission-v3.ts`;
- `workbench/tests/v3g3-admission.test.ts`;
- `workbench/tests/v3g3-selective-reuse.test.ts`;
- the Goal 3 files already named by section 5 of the current Contract; and
- the Goal 3 implementation report and Closeout draft.

No Goal 1, Goal 2, V3 State-store/binding, V3.6, Pi, fixture, task, Verifier, provider,
budget, Docker, Source Apply or general product surface edit is authorized. If satisfying
the required behavior needs any such edit, the implementation must stop and return a new
`DECISION_REQUIRED` finding rather than expanding scope.

### Mandatory deterministic proof

Before Candidate freeze, the corrected implementation must prove all of the following with
zero credentials, zero network, zero external Provider/model calls and zero real-model
calls:

- one registry reopens both the legacy fixed-pair promotion lineage and a distinct new
  Final Capstone promotion lineage;
- each entry independently recomputes only from its own frozen source pair;
- swapping sources, refs, hashes, admission refs or entry identities fails closed even when
  the attacker recomputes outer JSON digests;
- arbitrary but internally self-consistent source pairs fail closed without the required
  Host/G1/G2 authority chain;
- duplicate Candidate identities, cross-entry source substitution, path escape,
  symlink/junction/reparse points, hardlinks and write-once conflicts fail closed;
- legacy V3 Goal 3 admission/selective-reuse behavior remains green; and
- the complete deterministic Final Capstone Goal 3 chain and the existing Goal 1, Goal 2,
  V3 and V3.6 regressions named in the current Contract remain green, together with literal
  strict TypeScript checking.

Because this change crosses promotion-lineage authority, a fresh focused independent audit
of the frozen Candidate remains mandatory. The audit must specifically attempt arbitrary
source admission, cross-entry substitution and legacy-compatibility bypasses.

### New bounded budget

This structural Amendment must not be described as correction round 3. The existing Goal 3
budget remains exhausted at `2/2`. The recommended new Amendment budget is exactly one
implementation/integration correction round for the newly authorized structural delta:

```yaml
structural_amendment_correction_budget: 1
finding_set_rule: one_Main_finding_set_then_one_bounded_correction_tests_and_Main_rereview
same_authority_or_integrity_class_recurrence: DECISION_REQUIRED
micro_finding_splitting: forbidden
platform_safety_usage_sandbox_tool_interruptions_count: false
```

This budget exists only if the User explicitly approves it in the new Amendment. It does
not revive, reset or reinterpret the exhausted Goal 3 `2/2` budget.

## Unchanged real-run boundary

The unique real acceptance Run remains unconsumed. The structural Amendment must preserve:

- no real access during implementation, deterministic tests, Main integration or audit;
- no Candidate execution before Main review and mandatory focused audit pass;
- exactly one frozen real task and at most one real Provider dispatch path;
- no rerun, same-Run retry/continuation, fallback, replacement task, task swap, result
  hunting or manufactured failure; and
- preservation of the first terminal real result, whether it supports `retain`,
  `needs_reassessment`, an integrity stop or an execution fault.

## User decision tokens

### Recommended

`AUTHORIZE_G3_STRUCTURAL_AMENDMENT`

This authorizes Main to write the formal narrow Amendment described above, assign a fresh
dedicated zero-call implementation Session, and use the new one-round Amendment budget. It
does not itself authorize source edits or real execution until that formal Amendment is
frozen and handed off.

### Alternative

`CLOSE_FINAL_CAPSTONE_INCOMPLETE_G3`

This directs Main to close the Final Capstone truthfully with Goals 1 and 2 accepted, Goal 3
unaccepted, the stopped partial implementation excluded, and the unique real closed loop
unexecuted. Core feature development would then stop without claiming Goal 3 acceptance.

