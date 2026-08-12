# Final Capstone Goal 1 Contract — Trusted Evidence Admission

```yaml
status: closed_accepted
goal_id: FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION
parent_version: SECOND_PROJECT_FINAL_CAPSTONE
planning_source_commit: 4c4d2f3f397be7784700a2323c2afeaecbad03f0
planning_source_tree: f21b32938beaf638a68749aff28967d79aaa34a0
implementation_owner: completed_goal_1_working_session
main_owner: final_capstone_main_session
implementation_authority: consumed_completed
credential_reads_authorized: 0
external_network_authorized: false
external_provider_or_model_calls_authorized: 0
pi_changes_authorized: false
git_commit_authority_for_working_session: false
```

## 1. Objective

Implement the smallest Host-controlled, fail-closed boundary that turns supported,
Inspector-valid project artifacts into a frozen admission record plus existing
`FrozenEvidenceV3`, then invokes the existing `projectImprovementOpportunityV3` without
changing its trigger rules.

```text
Host-selected supported source artifact
  -> existing source-family Inspector
  -> identity / integrity / terminal / lineage / Verifier / eligibility checks
  -> immutable Evidence Admission record
  -> FrozenEvidenceV3
  -> existing V3 projector
```

Success means trusted project evidence can formally enter the existing Improvement path.
It does not mean every admitted evidence item produces an Opportunity.

## 2. Authoritative inputs and Gate A

The Working Session must read, in order:

1. `CURRENT_STATE.md` from the exact future Control Baseline;
2. `SECOND_PROJECT_FINAL_CAPSTONE_VERSION_CHARTER.md`;
3. this Contract;
4. `docs/reports/SECOND_PROJECT_FINAL_CAPABILITY_GAP_REVIEW.md`;
5. `docs/reports/SECOND_PROJECT_FINAL_CAPABILITY_GAP_REVIEW_GOAL_AMENDMENT.md`;
6. `docs/reports/SECOND_PROJECT_FINAL_CAPSTONE_GOAL_1_READINESS_REPORT.md`;
7. the source and tests cited in section 3.

Before editing, Gate A must record:

- exact root commit/tree and clean tracked/staged status;
- the exact Contract/Charter hashes present at that baseline;
- pinned Pi commit `027a5847901b5dde30270abaa1041046cd2b4b55` and clean state;
- pre-existing untracked files, if any, without modifying or adopting them;
- Credential/network/Provider/model counters all at zero; and
- successful public emitted Pi import/type resolution using existing local dependencies only.

If the exact Control Baseline and User activation are absent, stop before implementation.

## 3. Accepted source facts and reuse boundary

The implementation must reuse, not replace:

- `workbench/src/refinement/evidence-v3.ts`:
  `validateFrozenEvidenceV3`, `evidenceDigestV3`, `projectImprovementOpportunityV3`;
- `workbench/src/inspect-v0b.ts` / `inspect-v0c.ts` for ordinary verifier-backed Runs;
- `workbench/src/inspect-v2.ts`, especially `inspectRunV2A`, for Recovery/Comparison lineage;
- `workbench/src/inspect-v3.ts` and `workbench/src/state/binding-v3.ts` for bound-State follow-up lineage;
- `workbench/src/evidence/artifacts.ts` and current digest/write-once helpers; and
- current V3 contract types without weakening exact-key or digest validation.

Current `refinement/admission-v3.ts` is Candidate-to-current-State semantic admission. It is
not runtime Evidence admission and must not be repurposed in a way that merges those two
authority boundaries.

## 4. Bounded implementation scope

### 4.1 Admission request and authority

Create a small exact-key Host request/registration shape that names:

- one supported source family;
- project-relative source root and expected source identity;
- frozen `task_kind` and optional `failure_family`;
- explicit adaptation eligibility granted by Host policy; and
- the requested admission identity.

No Agent output, browser free text, source artifact field or caller-provided boolean may
self-grant eligibility. Unsupported families fail closed.

### 4.2 Exactly three supported source families

1. **Verifier-backed Run**: an existing V0-B/V0-C Run accepted only after its existing
   Inspector proves committed terminal evidence, valid Verifier/Outcome linkage and valid
   artifacts.
2. **Recovery/Comparison**: an existing V2-A Recovery Run accepted only after
   `inspectRunV2A` proves the controlled failure/Seed/Candidate/Verifier/Selection lineage.
   The admission preserves both arms, common Verifier and selection identity. It does not
   claim a natural failure or general path superiority.
3. **Bound-State follow-up**: an existing V3 Goal 3 Run accepted only after
   `inspectGoal3RunV3`/binding inspection proves the exact State version, binding digest,
   Case Authority, runtime Manifest and external Verifier lineage.

No plugin/adapter registry, arbitrary schema registration or generic evidence framework is
allowed. Historical raw roots that are unavailable today must fail closed; Goal 1 must not
reconstruct them from prose reports or backfill accepted history.

### 4.3 Admission record and `FrozenEvidenceV3`

The persisted admission record must freeze and digest at least:

- admission and project identity;
- source family, source Run IDs and source Inspector identity/fingerprint;
- exact source artifact references and hashes needed for reinspection;
- terminal, Verifier, Outcome and attribution result;
- Comparison/Recovery identity when present;
- bound State/version/binding/Case Authority identity when present;
- trusted task context and Host-granted eligibility;
- derived `FrozenEvidenceV3` identity/digest; and
- projector result identity or explicit `no_opportunity`.

State identity belongs in the admission record even though current `FrozenEvidenceV3`
schema 1 does not contain it. Goal 2 must later consume the admission record for State
attribution. Goal 1 may not silently invent a V3 evidence schema revision.

Valid, admitted evidence may legitimately project to `null`; admission and Improvement
triggering remain separate decisions.

### 4.4 Inspector

Provide an independent read/recompute path that re-runs the relevant existing Inspector,
revalidates ordinary-file/path/ref/digest constraints, recomputes the admission and
`FrozenEvidenceV3` identities, and verifies the stored projector result. It must reject
missing source bytes, source drift, cross-project roots, unknown keys, links/reparse points,
hardlinks where prohibited, stale identity, tampering and unsupported source families.

## 5. Allowed changes

The Working Session may create or modify only:

- one new narrow contract-types file under `workbench/src/contracts/`;
- one new Evidence admission implementation under `workbench/src/refinement/`;
- one new independent Goal 1 Inspector module under `workbench/src/`;
- one new focused test file under `workbench/tests/`;
- minimal Goal 1-only tracked fixtures under `fixtures/final-capstone/g1/` if deterministic
  generation cannot cover an identity edge;
- ignored raw test evidence under `.runs/final-capstone/g1/`;
- `docs/reports/FINAL_CAPSTONE_G1_IMPLEMENTATION_REPORT.md`; and
- `docs/reports/FINAL_CAPSTONE_G1_CLOSEOUT_DRAFT.md`.

Prefer new modules importing existing public project symbols. If an accepted-core file must
change, stop with the exact symbol and reason; Main must decide whether to amend the
allowlist. Formatting-only or opportunistic edits are forbidden.

## 6. Forbidden changes and actions

- no edits to `CURRENT_STATE.md`, `AGENTS.md`, this Contract, the Charter, Gap Review,
  Amendment, Case Audit, accepted Closeouts or historical reports;
- no edits to existing V0–V3.6 evidence, fixtures, State stores, active pointers or raw Runs;
- no Pi edit, dependency install, network, Credential, Provider/model or real-model access;
- no Candidate producer, trigger algorithm, comparator, promotion, rollback, active-pointer,
  V3.6 Session/Workspace/Runtime, ChangeSet or Apply change;
- no upgrade of daily V3.6 `unverified` or false eligibility fields;
- no automatic mining, clustering, deduplication service, Experience DB or continual loop;
- no CLI/WebUI/product integration and no generic adapter/Verifier platform;
- no Git staging, commit, branch integration or Goal acceptance by the Working Session.

## 7. Required tests and acceptance gates

### Gate B — Positive family coverage

- a verifier-backed pass and fail map deterministically with correct Verifier/Outcome refs;
- one valid V2 Recovery/Comparison maps with both-arm/common-Verifier/selection provenance;
- one valid bound-State follow-up maps with exact State/version/binding identity;
- existing V3 hard-failure projection still produces the expected Opportunity; and
- valid admitted evidence that matches no existing trigger produces `no_opportunity` without rejection.

### Gate C — Fail-closed authority/integrity coverage

At minimum reject: artifact tamper, missing/invalid Verifier, uncommitted or nonterminal Run,
unclosed lineage, invalid attribution, ambiguous/missing State identity, source-root escape,
symlink/junction/reparse point, prohibited hardlink, cross-project identity, stale Inspector
fingerprint, unknown source family, unknown key and digest tamper.

Explicitly prove ordinary V3.6 daily evidence remains ineligible even when it has settled,
Trace or ChangeSet data.

### Gate D — Authority separation and immutability

- Agent/browser/source artifact cannot grant eligibility;
- admission writes no Candidate, State version, active pointer, Workspace or Source bytes;
- repeated identical admission is deterministic/idempotent or write-once-equivalent;
- conflicting bytes at an existing identity fail closed; and
- Inspector recomputation succeeds after process reopen and detects mutation.

### Gate E — Regressions

Run, at minimum:

```powershell
& 'D:\AI\AI_Projects\project2\.runs\g006\pi\node_modules\typescript\bin\tsc' -p tsconfig.json --noEmit
node --test tests/final-capstone-g1-evidence-admission.test.ts
node --test tests/v3g1-evidence-to-candidate.test.ts
node --test tests/v3g2-validate-promote-reject-rollback.test.ts
node --test tests/v3g3-admission.test.ts tests/v3g3-selective-reuse.test.ts
```

The Working Session may use an equivalent existing local TypeScript binary or public Pi
loader bridge only after recording its exact identity. It may not install dependencies.

## 8. Required evidence and deliverables

The Implementation Report must contain:

- Gate A identity and zero-access record;
- exact source delta and explanation for every changed file;
- exact commands, exit codes and test counts;
- supported source-family matrix and explicit rejected families;
- positive admission identities/digests and Inspector results;
- negative test matrix;
- credential/network/Provider/model counters, all zero;
- tracked and ignored evidence inventory;
- Pi clean-state check;
- remaining unverified items and claim limits; and
- a structured `CURRENT_STATE_UPDATE_PROPOSAL` without editing control state.

The Closeout Draft must map every Contract criterion to evidence and recommend only
`PASS_FINAL_CAPSTONE_G1_TRUSTED_EVIDENCE_ADMISSION` or a precise non-PASS disposition.

## 9. Main review, audit and next-goal gate

After the Working Session stops, Main reviews the complete delta and evidence. Main alone
may request bounded correction, create a Candidate commit when separately authorized, and
dispatch a fresh focused independent audit of admission/provenance/integrity boundaries.

Goal 2 remains unauthorized until Main and User accept Goal 1 Closeout. A passing Goal 1
does not authorize State assessment, regression-set publication, effective V3.6 binding or
real execution.

## 10. Stop conditions

Stop and return `DECISION_REQUIRED` if:

- a supported family cannot be inspected without trusting caller-authored validity fields;
- source evidence is unavailable and would need reconstruction from prose or rewritten history;
- preserving State/Verifier/Comparison identity requires weakening current V3 exact-key or
  digest checks;
- implementation requires changing accepted V3 projector semantics, State publication,
  V3.6 daily eligibility, Pi, Agent Loop or Apply authority;
- a fourth source family or generic registration mechanism appears necessary;
- credentials, network, Provider/model access or dependency installation appears necessary; or
- the allowed source/report paths are insufficient.

The Working Session stops after implementation, verification, Implementation Report and
Closeout Draft. It does not proceed to Goal 2.
